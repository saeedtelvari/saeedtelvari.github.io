// SimulatorPage.jsx — Interactive VE Simulator Page
const { useEffect, useMemo, useRef, useState } = React;

// Main Simulator component
const SimulatorPage = () => {
  // --- STATE PARAMETERS ---
  // Physical parameters
  const [K, setK] = useState(0.85); // Absolute permeability scaling (0.1 to 2.0)
  const [porosity, setPorosity] = useState(0.25); // Porosity (0.1 to 0.4)
  const [cellCount, setCellCount] = useState(100); // N cells resolution (50 to 150)
  const [residualTrapFraction, setResidualTrapFraction] = useState(0.25); // Trapping fraction Sgr (0.0 to 0.40)
  
  // Define dx in the outer scope of the component so it is available to all rendering sub-blocks
  const dx = 1000.0 / cellCount;

  // Topography parameters (Formula sliders)
  const [dipPercent, setDipPercent] = useState(1.5); // Regional dip in % (-5% to 5%)
  const [amplitude, setAmplitude] = useState(25); // Anticline wave amplitude (0 to 50px)
  const [frequency, setFrequency] = useState(2); // Wave frequency multiplier (0.5 to 4)
  const [faultOffset, setFaultOffset] = useState(1.2); // Fault displacement (0 to 3)

  // Injection parameters
  const [Q, setQ] = useState(0.55); // Constant injection rate (0.0 to 1.5)
  const [injLocation, setInjLocation] = useState(70); // Injection cell index % (10% to 90%)
  const [injDuration, setInjDuration] = useState(150); // Frame count of active injection (50 to 400)
  
  // Fault parameters
  const [faultCount, setFaultCount] = useState(2); // Number of faults (0 to 3)
  const [faults, setFaults] = useState(() => [
    { xPercent: 20 + Math.random() * 20, isSealed: false, thresholdHeight: 0.2 + Math.random() * 0.3, leakRate: 0.08 + Math.random() * 0.1, transmissibility: 1.0 },
    { xPercent: 60 + Math.random() * 20, isSealed: false, thresholdHeight: 0.2 + Math.random() * 0.3, leakRate: 0.08 + Math.random() * 0.1, transmissibility: 1.0 }
  ]);

  // Simulation run state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x execution speed
  const [simTime, setSimTime] = useState(0); // simulation timer frame

  // Tab Navigation state
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' (2D reservoir) or 'uq' (Sensitivity & UQ Analysis)

  // SA/UQ uncertainty bounds configuration states (default +/- percentages)
  const [kUncertainty, setKUncertainty] = useState(0.40); // +/- 40% permeability range
  const [sgrUncertainty, setSgrUncertainty] = useState(0.40); // +/- 40% Sgr range
  const [faultThreshUncertainty, setFaultThreshUncertainty] = useState(0.50); // +/- 50% fault threshold range

  // Monte Carlo execution states
  const [mcRunsCount, setMcRunsCount] = useState(50); // 25, 50, or 100 simulations
  const [mcResults, setMcResults] = useState(null); // Array of realization runs
  const [uqRunning, setUqRunning] = useState(false);
  const [uqProgress, setUqProgress] = useState(0);
  const [uqTargetMetric, setUqTargetMetric] = useState('leaked'); // 'leaked' (CO2 leaked mass) or 'trapped' (trapping efficiency %)
  
  // Solver variables (Plume thickness vector, max thickness historical)
  const [h, setH] = useState(() => new Array(100).fill(0));
  const [hMax, setHMax] = useState(() => new Array(100).fill(0));
  
  // Cumulative masses tracking state
  const [massHistory, setMassHistory] = useState([]); // Array of { time, injected, trapped, mobile, leaked }
  const [currentMasses, setCurrentMasses] = useState({ injected: 0, trapped: 0, mobile: 0, leaked: 0 });

  // Reset flag / state synchronizer
  const stateRef = useRef({ h: [], hMax: [], masses: { injected: 0, trapped: 0, mobile: 0, leaked: 0 } });
  
  // Time travel history ref — stores full solver state at each year for back-and-forth scrubbing
  const historyRef = useRef([]);

  // Initialize solver parameters reference to prevent interval resets on slider modifications
  const solverParamsRef = useRef(null);
  solverParamsRef.current = {
    K,
    porosity,
    cellCount,
    dipPercent,
    amplitude,
    frequency,
    faultOffset,
    Q,
    injLocation,
    injDuration,
    faultCount,
    parentDX: dx,
    faults: JSON.parse(JSON.stringify(faults)),
    residualTrapFraction
  };

  // Compute mobile and trapped heights dynamically for SVG visualization
  const { hMobile, hTrapped } = useMemo(() => {
    const N = h.length;
    const hMob = new Array(N).fill(0);
    const hTrap = new Array(N).fill(0);
    const R = residualTrapFraction;
    
    for (let i = 0; i < N; i++) {
      const H = h[i];
      const hm = hMax[i];
      // VE residual trapping model
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      hMob[i] = Math.min(H, mobileVal);
      hTrap[i] = Math.max(0, H - hMob[i]);
    }
    return { hMobile: hMob, hTrapped: hTrap };
  }, [h, hMax, residualTrapFraction]);

  // Initialize solver vectors when cell count changes
  useEffect(() => {
    resetSimulation();
  }, [cellCount]);

  // Reset simulation function
  const resetSimulation = () => {
    const arr = new Array(cellCount).fill(0);
    setH(arr);
    setHMax(arr);
    const initialMasses = { injected: 0, trapped: 0, mobile: 0, leaked: 0 };
    setCurrentMasses(initialMasses);
    setMassHistory([{ time: 0, ...initialMasses }]);
    setSimTime(0);
    setIsPlaying(false);
    setIsReversing(false);
    
    stateRef.current = { h: [...arr], hMax: [...arr], masses: { ...initialMasses } };
    historyRef.current = [{
      time: 0,
      h: [...arr],
      hMax: [...arr],
      masses: { ...initialMasses },
      params: JSON.parse(JSON.stringify(solverParamsRef.current))
    }];
  };

  // Preset Scenario Handlers
  const applyPreset = (presetName) => {
    resetSimulation();
    if (presetName === 'dome') {
      setDipPercent(0.2);
      setAmplitude(45);
      setFrequency(1.5);
      setFaultOffset(0);
      setK(0.8);
      setPorosity(0.25);
      setQ(0.7);
      setInjDuration(180);
      setFaultCount(0);
      setResidualTrapFraction(0.30);
    } else if (presetName === 'faulted') {
      setDipPercent(1.8);
      setAmplitude(15);
      setFrequency(2);
      setFaultOffset(2.2);
      setK(1.2);
      setPorosity(0.20);
      setQ(0.5);
      setInjDuration(120);
      setFaultCount(3);
      setFaults([
        { xPercent: 25, isSealed: false, thresholdHeight: 0.3, leakRate: 0.18, transmissibility: 0.8 },
        { xPercent: 55, isSealed: true, thresholdHeight: 0.8, leakRate: 0.12, transmissibility: 0.0 },
        { xPercent: 80, isSealed: false, thresholdHeight: 0.5, leakRate: 0.20, transmissibility: 0.5 }
      ]);
      setResidualTrapFraction(0.15);
    } else if (presetName === 'monocline') {
      setDipPercent(-2.8);
      setAmplitude(5);
      setFrequency(0.5);
      setFaultOffset(0);
      setK(0.65);
      setPorosity(0.30);
      setQ(0.4);
      setInjDuration(200);
      setFaultCount(1);
      setFaults([
        { xPercent: 50, isSealed: false, thresholdHeight: 0.2, leakRate: 0.08, transmissibility: 0.9 },
        { xPercent: 55, isSealed: false, thresholdHeight: 0.6, leakRate: 0.12, transmissibility: 0.7 },
        { xPercent: 80, isSealed: false, thresholdHeight: 0.4, leakRate: 0.12, transmissibility: 0.8 }
      ]);
      setResidualTrapFraction(0.25);
    } else if (presetName === 'default') {
      setDipPercent(1.2);
      setAmplitude(20);
      setFrequency(2);
      setFaultOffset(1.2);
      setK(0.85);
      setPorosity(0.25);
      setQ(0.55);
      setInjDuration(150);
      setFaultCount(2);
      setFaults([
        { xPercent: 20 + Math.random() * 20, isSealed: false, thresholdHeight: 0.2 + Math.random() * 0.3, leakRate: 0.08 + Math.random() * 0.1, transmissibility: 1.0 },
        { xPercent: 60 + Math.random() * 20, isSealed: false, thresholdHeight: 0.2 + Math.random() * 0.3, leakRate: 0.08 + Math.random() * 0.1, transmissibility: 1.0 }
      ]);
      setResidualTrapFraction(0.25);
    }
  };

  // Helper: Caprock Underside Topography Function
  const capRockY = (x, cellIdx = null) => {
    const dip = 150 + x * (dipPercent / 100.0) * 8.0; // regional dip
    const wave = - amplitude * Math.sin((x * Math.PI / 1000.0) * frequency * 2);
    let offset = 0;
    
    // Determine the offset based on the reference x (either cell center or continuous x)
    const xRef = cellIdx !== null ? (cellIdx * dx + dx / 2.0) : x;
    
    // Accumulate fault offsets based on how many faults are active
    for (let idx = 0; idx < faultCount; idx++) {
      const f = faults[idx];
      const xFault = (f.xPercent / 100.0) * 1000.0;
      if (xRef > xFault) {
        const direction = idx % 2 === 0 ? 1 : -1;
        offset += direction * faultOffset * 12; // alternate step offsets
      }
    }
    return dip + wave + offset;
  };

  // --- SOLVER ITERATOR (FORWARD & REVERSE) ---
  useEffect(() => {
    if (!isPlaying && !isReversing) return;

    const interval = setInterval(() => {
      if (isPlaying) {
        setSimTime(t => {
          const nextTime = t + 1;
          if (nextTime > 500) {
            setIsPlaying(false);
            return t;
          }

          // Run numerical VE solver step using parameters from the ref
          const result = runSolverStep(
            stateRef.current.h, 
            stateRef.current.hMax, 
            stateRef.current.masses,
            nextTime,
            solverParamsRef.current
          );

          // Update local React states
          setH(result.h);
          setHMax(result.hMax);
          setCurrentMasses(result.masses);
          
          // Append to mass history for plotting
          if (nextTime % 2 === 0 || nextTime === 1 || nextTime === 500) {
            setMassHistory(history => {
              const cleaned = history.filter(item => item.time < nextTime);
              return [...cleaned, { time: nextTime, ...result.masses }];
            });
          }

          // Store back in ref for next iteration
          stateRef.current = {
            h: result.h,
            hMax: result.hMax,
            masses: result.masses
          };

          // Cache historical snapshot in historyRef for time scrubbing
          historyRef.current[nextTime] = {
            time: nextTime,
            h: [...result.h],
            hMax: [...result.hMax],
            masses: { ...result.masses },
            params: JSON.parse(JSON.stringify(solverParamsRef.current))
          };

          return nextTime;
        });
      } else if (isReversing) {
        setSimTime(t => {
          const nextTime = t - 1;
          if (nextTime < 0) {
            setIsReversing(false);
            return t;
          }

          // Load from history
          const histState = historyRef.current[nextTime];
          if (histState) {
            setH(histState.h);
            setHMax(histState.hMax);
            setCurrentMasses(histState.masses);

            stateRef.current = {
              h: [...histState.h],
              hMax: [...histState.hMax],
              masses: { ...histState.masses }
            };
          }

          return nextTime;
        });
      }
    }, 40 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, isReversing, speed]);

  // Time-Travel Scrubbing Handler (Non-destructive)
  const handleScrub = (targetTime) => {
    setIsPlaying(false);
    setIsReversing(false);
    
    const t = Math.max(0, Math.min(historyRef.current.length - 1, targetTime));
    const histState = historyRef.current[t];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      setSimTime(t);
      
      // Update solver references
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: { ...histState.masses }
      };
    }
  };

  // Branching Committer: Slices the future history from target time and locks in new parameters
  const commitBranch = (targetTime = simTime) => {
    setIsPlaying(false);
    setIsReversing(false);
    
    const t = Math.max(0, Math.min(historyRef.current.length - 1, targetTime));
    
    // Truncate history ref after this point
    historyRef.current = historyRef.current.slice(0, t + 1);
    
    // Truncate mass history for chart
    setMassHistory(history => history.filter(item => item.time <= t));
    
    // Reload state
    const histState = historyRef.current[t];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: { ...histState.masses }
      };
    }
  };

  // Check differences between current parameters and parameters saved at simTime
  const getParamDiff = () => {
    if (simTime >= historyRef.current.length) return [];
    const histState = historyRef.current[simTime];
    if (!histState || !histState.params) return [];
    
    const histParams = histState.params;
    const diffs = [];
    
    const checkDiff = (key, label, formatHist, formatCurr) => {
      const vHist = histParams[key];
      let vCurr;
      
      if (key === 'K') vCurr = K;
      else if (key === 'porosity') vCurr = porosity;
      else if (key === 'cellCount') vCurr = cellCount;
      else if (key === 'residualTrapFraction') vCurr = residualTrapFraction;
      else if (key === 'dipPercent') vCurr = dipPercent;
      else if (key === 'amplitude') vCurr = amplitude;
      else if (key === 'frequency') vCurr = frequency;
      else if (key === 'faultOffset') vCurr = faultOffset;
      else if (key === 'Q') vCurr = Q;
      else if (key === 'injLocation') vCurr = injLocation;
      else if (key === 'injDuration') vCurr = injDuration;
      else if (key === 'faultCount') vCurr = faultCount;
      
      if (key !== 'faults' && Math.abs(vHist - vCurr) > 1e-5) {
        diffs.push({
          label,
          original: formatHist(vHist),
          current: formatCurr(vCurr)
        });
      }
    };
    
    checkDiff('K', 'Permeability (K)', v => `${Math.round(v*1000)} mD`, v => `${Math.round(v*1000)} mD`);
    checkDiff('porosity', 'Porosity (\u03C6)', v => `${Math.round(v*100)}%`, v => `${Math.round(v*100)}%`);
    checkDiff('cellCount', 'Grid Cells (N)', v => v, v => v);
    checkDiff('residualTrapFraction', 'Residual Trap (Sgr)', v => `${Math.round(v*100)}%`, v => `${Math.round(v*100)}%`);
    checkDiff('dipPercent', 'Regional Dip', v => `${v}%`, v => `${v}%`);
    checkDiff('amplitude', 'Anticline Height', v => `${v}px`, v => `${v}px`);
    checkDiff('frequency', 'Anticline Count', v => v, v => v);
    checkDiff('faultOffset', 'Fault Slip', v => `${v}x`, v => `${v}x`);
    checkDiff('Q', 'Flow Rate (Q)', v => v, v => v);
    checkDiff('injLocation', 'Well Location', v => `${v}%`, v => `${v}%`);
    checkDiff('injDuration', 'Inj. Stop Year', v => `${v}y`, v => `${v}y`);
    checkDiff('faultCount', 'Active Faults', v => v, v => v);
    
    if (histParams.faultCount === faultCount && faultCount > 0 && histParams.faults) {
      for (let i = 0; i < faultCount; i++) {
        const fHist = histParams.faults[i];
        const fCurr = faults[i];
        if (fHist && fCurr) {
          const prefix = `Fault ${String.fromCharCode(65 + i)}`;
          if (fHist.isSealed !== fCurr.isSealed) {
            diffs.push({
              label: `${prefix} Seal`,
              original: fHist.isSealed ? 'Sealed' : 'Leaking',
              current: fCurr.isSealed ? 'Sealed' : 'Leaking'
            });
          }
          if (Math.abs(fHist.xPercent - fCurr.xPercent) > 1e-5) {
            diffs.push({
              label: `${prefix} Position`,
              original: `${fHist.xPercent}%`,
              current: `${fCurr.xPercent}%`
            });
          }
          if (Math.abs(fHist.thresholdHeight - fCurr.thresholdHeight) > 1e-5) {
            diffs.push({
              label: `${prefix} Threshold`,
              original: `${fHist.thresholdHeight} m`,
              current: `${fCurr.thresholdHeight} m`
            });
          }
          if (!fHist.isSealed && !fCurr.isSealed && Math.abs(fHist.leakRate - fCurr.leakRate) > 1e-5) {
            diffs.push({
              label: `${prefix} Leak Rate`,
              original: fHist.leakRate,
              current: fCurr.leakRate
            });
          }
        }
      }
    }
    
    return diffs;
  };

  // Play controls toggles
  const handlePlayToggle = () => {
    if (isReversing) {
      setIsReversing(false);
    }
    if (!isPlaying) {
      if (simTime < historyRef.current.length - 1) {
        commitBranch();
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlayReverseToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    setIsReversing(!isReversing);
  };

  const stepForward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    
    const nextTime = simTime + 1;
    if (nextTime > 500) return;
    
    if (simTime < historyRef.current.length - 1) {
      commitBranch();
    }
    
    const result = runSolverStep(
      stateRef.current.h, 
      stateRef.current.hMax, 
      stateRef.current.masses,
      nextTime,
      solverParamsRef.current
    );
    
    setH(result.h);
    setHMax(result.hMax);
    setCurrentMasses(result.masses);
    setSimTime(nextTime);
    
    if (nextTime % 2 === 0 || nextTime === 1 || nextTime === 500) {
      setMassHistory(history => {
        const cleaned = history.filter(item => item.time < nextTime);
        return [...cleaned, { time: nextTime, ...result.masses }];
      });
    }
    
    stateRef.current = {
      h: result.h,
      hMax: result.hMax,
      masses: result.masses
    };
    
    historyRef.current[nextTime] = {
      time: nextTime,
      h: [...result.h],
      hMax: [...result.hMax],
      masses: { ...result.masses },
      params: JSON.parse(JSON.stringify(solverParamsRef.current))
    };
  };

  const stepBackward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    
    const prevTime = simTime - 1;
    if (prevTime < 0) return;
    
    const histState = historyRef.current[prevTime];
    if (histState) {
      setH(histState.h);
      setHMax(histState.hMax);
      setCurrentMasses(histState.masses);
      setSimTime(prevTime);
      
      stateRef.current = {
        h: [...histState.h],
        hMax: [...histState.hMax],
        masses: { ...histState.masses }
      };
    }
  };

  // --- MONTE CARLO UQ/SA ENGINE ---
  const runMonteCarloBatch = () => {
    if (uqRunning) return;
    
    setUqRunning(true);
    setUqProgress(0);
    setMcResults(null);

    const totalRuns = mcRunsCount;
    const results = [];
    const batchSize = 5;

    // Capture nominal parameter values
    const nominalK = K;
    const nominalSgr = residualTrapFraction;
    const nominalFaults = faults.map(f => ({ ...f }));

    // Generate parameter sets for each realization (Uniform distribution)
    const realizations = [];
    for (let i = 0; i < totalRuns; i++) {
      // 1. Permeability K
      const kMin = nominalK * (1.0 - kUncertainty);
      const kMax = nominalK * (1.0 + kUncertainty);
      const randK = Math.max(0.1, kMin + Math.random() * (kMax - kMin));

      // 2. Residual Trap Fraction Sgr
      const sgrMin = nominalSgr * (1.0 - sgrUncertainty);
      const sgrMax = nominalSgr * (1.0 + sgrUncertainty);
      const randSgr = Math.max(0.0, Math.min(0.40, sgrMin + Math.random() * (sgrMax - sgrMin)));

      // 3. Fault Capillary Threshold
      const randFaults = nominalFaults.map(f => {
        const threshMin = f.thresholdHeight * (1.0 - faultThreshUncertainty);
        const threshMax = f.thresholdHeight * (1.0 + faultThreshUncertainty);
        const randThresh = Math.max(0.0, Math.min(2.0, threshMin + Math.random() * (threshMax - threshMin)));
        return {
          ...f,
          thresholdHeight: randThresh
        };
      });

      realizations.push({
        id: i,
        K: randK,
        residualTrapFraction: randSgr,
        faults: randFaults
      });
    }

    // Run chunked simulation loop
    const runChunk = (startIndex) => {
      const endIndex = Math.min(totalRuns, startIndex + batchSize);
      
      for (let idx = startIndex; idx < endIndex; idx++) {
        const r = realizations[idx];
        
        // Define solver params for this specific run
        const runParams = {
          K: r.K,
          porosity: porosity,
          cellCount: cellCount,
          dipPercent: dipPercent,
          amplitude: amplitude,
          frequency: frequency,
          faultOffset: faultOffset,
          Q: Q,
          injLocation: injLocation,
          injDuration: injDuration,
          faultCount: faultCount,
          parentDX: dx,
          faults: r.faults,
          residualTrapFraction: r.residualTrapFraction
        };

        // Initialize state vectors for realization
        let curH = new Array(cellCount).fill(0);
        let curHMax = new Array(cellCount).fill(0);
        let curMasses = { injected: 0, trapped: 0, mobile: 0, leaked: 0 };

        // Run explicit solver to Year 500
        for (let year = 1; year <= 500; year++) {
          const res = runSolverStep(curH, curHMax, curMasses, year, runParams);
          curH = res.h;
          curHMax = res.hMax;
          curMasses = res.masses;
        }

        // Record outcomes
        const trappingEfficiency = curMasses.injected > 0 ? (curMasses.trapped / curMasses.injected) * 100 : 0;
        const leakedFraction = curMasses.injected > 0 ? (curMasses.leaked / curMasses.injected) * 100 : 0;

        results.push({
          id: idx,
          params: r,
          finalLeaked: curMasses.leaked,
          finalTrapped: curMasses.trapped,
          finalMobile: curMasses.mobile,
          finalInjected: curMasses.injected,
          trappingEfficiency,
          leakedFraction,
          h: curH,
          hMax: curHMax
        });
      }

      setUqProgress(Math.round((endIndex / totalRuns) * 100));

      if (endIndex < totalRuns) {
        setTimeout(() => runChunk(endIndex), 25);
      } else {
        setUqRunning(false);
        setMcResults(results);
      }
    };

    // Trigger first chunk
    setTimeout(() => runChunk(0), 10);
  };

  // Helper to calculate percentiles
  const getPercentile = (sortedArray, percentile) => {
    if (sortedArray.length === 0) return 0;
    const idx = Math.floor(sortedArray.length * (percentile / 100));
    return sortedArray[Math.min(sortedArray.length - 1, idx)];
  };

  // Helper to calculate Pearson correlation coefficient
  const computeCorrelation = (xValues, yValues) => {
    const M = xValues.length;
    if (M === 0) return 0;
    const meanX = xValues.reduce((a, b) => a + b, 0) / M;
    const meanY = yValues.reduce((a, b) => a + b, 0) / M;
    
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let j = 0; j < M; j++) {
      const dx = xValues[j] - meanX;
      const dy = yValues[j] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
  };

  // Memoized UQ statistics computations
  const uqData = useMemo(() => {
    if (!mcResults) return null;
    
    const vals = mcResults.map(r => 
      uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency
    );
    const sorted = [...vals].sort((a, b) => a - b);
    
    const p10Val = getPercentile(sorted, 10);
    const p50Val = getPercentile(sorted, 50);
    const p90Val = getPercentile(sorted, 90);
    
    const findClosestRealization = (targetVal) => {
      let closest = mcResults[0];
      let minDiff = Infinity;
      mcResults.forEach(r => {
        const val = uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency;
        const diff = Math.abs(val - targetVal);
        if (diff < minDiff) {
          minDiff = diff;
          closest = r;
        }
      });
      return closest;
    };
    
    const p10Realization = findClosestRealization(p10Val);
    const p50Realization = findClosestRealization(p50Val);
    const p90Realization = findClosestRealization(p90Val);

    const minVal = sorted[0];
    const maxVal = sorted[sorted.length - 1];
    const range = maxVal - minVal || 1.0;
    const numBins = 10;
    const binWidth = range / numBins;
    const bins = new Array(numBins).fill(0);
    
    vals.forEach(v => {
      let binIdx = Math.floor((v - minVal) / binWidth);
      if (binIdx >= numBins) binIdx = numBins - 1;
      if (binIdx < 0) binIdx = 0;
      bins[binIdx]++;
    });
    
    const maxBinCount = Math.max(1, Math.max(...bins));
    
    return {
      vals,
      sorted,
      minVal,
      maxVal,
      range,
      bins,
      maxBinCount,
      binWidth,
      p10Val,
      p50Val,
      p90Val,
      p10Realization,
      p50Realization,
      p90Realization
    };
  }, [mcResults, uqTargetMetric]);

  // Memoized Sensitivity correlations
  const sensitivityData = useMemo(() => {
    if (!mcResults) return null;
    
    const yVals = mcResults.map(r => 
      uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency
    );
    
    const kVals = mcResults.map(r => r.params.K);
    const sgrVals = mcResults.map(r => r.params.residualTrapFraction);
    
    const faultThreshVals = mcResults.map(r => {
      const activeFaults = r.params.faults.slice(0, faultCount);
      if (activeFaults.length === 0) return 0;
      const sum = activeFaults.reduce((a, b) => a + b.thresholdHeight, 0);
      return sum / activeFaults.length;
    });

    const kCorr = computeCorrelation(kVals, yVals);
    const sgrCorr = computeCorrelation(sgrVals, yVals);
    const faultCorr = faultCount > 0 ? computeCorrelation(faultThreshVals, yVals) : 0;
    
    return [
      { label: 'Permeability (K)', r: kCorr },
      { label: 'Residual Trapping (Sgr)', r: sgrCorr },
      ...(faultCount > 0 ? [{ label: 'Fault Seal Height', r: faultCorr }] : [])
    ].sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [mcResults, uqTargetMetric, faultCount]);

  // Load a selected Monte Carlo model back to 2D simulator
  const loadUQRealization = (realization) => {
    if (!realization) return;
    
    setK(parseFloat(realization.params.K.toFixed(3)));
    setResidualTrapFraction(parseFloat(realization.params.residualTrapFraction.toFixed(3)));
    
    const newFaults = faults.map((f, i) => {
      const rf = realization.params.faults[i];
      if (rf) {
        return {
          ...f,
          thresholdHeight: parseFloat(rf.thresholdHeight.toFixed(3))
        };
      }
      return f;
    });
    setFaults(newFaults);

    setH(realization.h);
    setHMax(realization.hMax);
    const finalMasses = {
      injected: realization.finalInjected,
      trapped: realization.finalTrapped,
      mobile: realization.finalMobile,
      leaked: realization.finalLeaked
    };
    setCurrentMasses(finalMasses);
    setSimTime(500);
    setIsPlaying(false);
    setIsReversing(false);

    stateRef.current = {
      h: [...realization.h],
      hMax: [...realization.hMax],
      masses: { ...finalMasses }
    };

    const emptyArr = new Array(cellCount).fill(0);
    historyRef.current = [
      {
        time: 0,
        h: emptyArr,
        hMax: emptyArr,
        masses: { injected: 0, trapped: 0, mobile: 0, leaked: 0 },
        params: JSON.parse(JSON.stringify(solverParamsRef.current))
      },
      {
        time: 500,
        h: [...realization.h],
        hMax: [...realization.hMax],
        masses: { ...finalMasses },
        params: JSON.parse(JSON.stringify(solverParamsRef.current))
      }
    ];

    setMassHistory([
      { time: 0, injected: 0, trapped: 0, mobile: 0, leaked: 0 },
      { time: 500, ...finalMasses }
    ]);
    
    setActiveSubTab('profile');
  };

  // SVG Histogram Renderer
  const renderUQHistogram = (data) => {
    const width = 450;
    const height = 200;
    const padding = { left: 40, right: 20, top: 20, bottom: 25 };
    
    const getX = (val) => padding.left + ((val - data.minVal) / data.range) * (width - padding.left - padding.right);
    const getY = (count) => height - padding.bottom - (count / data.maxBinCount) * (height - padding.top - padding.bottom);
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
          const y = getY(data.maxBinCount * ratio);
          return (
            <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="3 3"/>
          );
        })}
        
        {data.bins.map((count, idx) => {
          const valStart = data.minVal + idx * data.binWidth;
          const valEnd = valStart + data.binWidth;
          const x1 = getX(valStart);
          const x2 = getX(valEnd);
          const y = getY(count);
          const barWidth = Math.max(1, x2 - x1 - 1.5);
          const barHeight = Math.max(0, height - padding.bottom - y);
          
          return (
            <rect 
              key={idx} 
              x={x1} 
              y={y} 
              width={barWidth} 
              height={barHeight} 
              fill="rgba(100, 255, 218, 0.22)" 
              stroke="rgba(100, 255, 218, 0.5)" 
              strokeWidth="1"
            />
          );
        })}
        
        {[
          { label: 'P10', val: data.p10Val, color: '#64ffda' },
          { label: 'P50', val: data.p50Val, color: '#ffb300' },
          { label: 'P90', val: data.p90Val, color: '#ff6b6b' }
        ].map((p, i) => {
          const x = getX(p.val);
          return (
            <g key={i}>
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke={p.color} strokeWidth="1.5" strokeDasharray="4 3"/>
              <circle cx={x} cy={padding.top} r="3.5" fill={p.color} />
              <text x={x} y={padding.top - 5} fill={p.color} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {p.label}
              </text>
            </g>
          );
        })}
        
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        
        <text x={padding.left} y={height - 8} fill="rgba(255,255,255,0.4)" fontSize="8.5" textAnchor="start" fontFamily="monospace">
          {data.minVal.toFixed(1)}{uqTargetMetric === 'leaked' ? ' kt' : '%'}
        </text>
        <text x={width - padding.right} y={height - 8} fill="rgba(255,255,255,0.4)" fontSize="8.5" textAnchor="end" fontFamily="monospace">
          {data.maxVal.toFixed(1)}{uqTargetMetric === 'leaked' ? ' kt' : '%'}
        </text>
      </svg>
    );
  };

  // SVG Sensitivity Tornado Renderer
  const renderUQSensitivity = (data) => {
    const width = 450;
    const height = 200;
    const padding = { left: 140, right: 30, top: 25, bottom: 20 };
    
    const centerOffset = padding.left + (width - padding.left - padding.right) / 2;
    const halfPlotWidth = (width - padding.left - padding.right) / 2;
    
    const getX = (r) => centerOffset + r * halfPlotWidth;
    
    const barHeight = 24;
    const gap = 16;
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        {[-1.0, -0.5, 0, 0.5, 1.0].map((tick, i) => {
          const x = getX(tick);
          return (
            <g key={i}>
              <line x1={x} y1={padding.top - 5} x2={x} y2={height - padding.bottom} stroke={tick === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.05)"} strokeWidth={tick === 0 ? "1" : "0.5"} strokeDasharray={tick === 0 ? "none" : "3 3"}/>
              <text x={x} y={padding.top - 12} fill="rgba(255,255,255,0.35)" fontSize="8" textAnchor="middle" fontFamily="monospace">
                {tick > 0 ? `+${tick.toFixed(1)}` : tick.toFixed(1)}
              </text>
            </g>
          );
        })}
        
        {data.map((item, idx) => {
          const y = padding.top + idx * (barHeight + gap);
          const xStart = item.r >= 0 ? centerOffset : getX(item.r);
          const xEnd = item.r >= 0 ? getX(item.r) : centerOffset;
          const rectWidth = Math.max(1, xEnd - xStart);
          const color = item.r >= 0 ? '#64ffda' : '#ff6b6b';
          const fill = item.r >= 0 ? 'rgba(100, 255, 218, 0.25)' : 'rgba(255, 107, 107, 0.25)';
          
          return (
            <g key={idx}>
              <text x={padding.left - 10} y={y + barHeight/2 + 3} fill="rgba(255,255,255,0.85)" fontSize="9.5" textAnchor="end" fontFamily="sans-serif">
                {item.label}
              </text>
              
              <rect 
                x={xStart} 
                y={y} 
                width={rectWidth} 
                height={barHeight} 
                fill={fill} 
                stroke={color} 
                strokeWidth="1"
                rx="3"
              />
              
              <text 
                x={item.r >= 0 ? xEnd + 6 : xStart - 6} 
                y={y + barHeight/2 + 3} 
                fill={color} 
                fontSize="9" 
                fontWeight="bold" 
                textAnchor={item.r >= 0 ? 'start' : 'end'} 
                fontFamily="monospace"
              >
                {item.r.toFixed(2)}
              </text>
            </g>
          );
        })}
        
        <line x1={padding.left} y1={padding.top - 5} x2={padding.left} y2={height - padding.bottom} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      </svg>
    );
  };

  // Solver implementation
  const runSolverStep = (currentH, currentHMax, masses, currentFrame, params) => {
    const {
      K,
      porosity,
      cellCount,
      Q,
      injLocation,
      injDuration,
      faultCount,
      faults,
      residualTrapFraction,
      parentDX
    } = params;

    const N = cellCount;
    let nextH = [...currentH];
    let nextHMax = [...currentHMax];
    let { injected, trapped, mobile, leaked } = masses;

    // Solver substeps to preserve CFL stability (dt * K * h / dx^2 < 0.5)
    // As grid spacing dx decreases by a factor of 3, dt must decrease by a factor of 9 (dx^2 scaling)
    const dxRatio = parentDX / 10.0;
    const baseDt = 0.02 * (porosity / 0.25) * (dxRatio * dxRatio) / (K / 0.85);
    
    // Cap dt and calculate required substeps dynamically to cover exactly 1 year of simulation time
    const dt = Math.min(0.02, baseDt);
    const substeps = Math.ceil(1.0 / dt);

    // Physical coordinate depth array (scaled by 1/15)
    const zt = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      zt[i] = capRockY(i * parentDX + parentDX / 2.0) / 15.0;
    }

    // Run explicit finite volume integration substeps
    for (let step = 0; step < substeps; step++) {
      // 1. Partition total height into mobile and trapped components for each cell (VE physics)
      const hMob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = nextH[i];
        const hm = nextHMax[i];
        const R = residualTrapFraction;
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        hMob[i] = Math.min(H, mobileVal);
      }

      // 2. Compute fluxes using only the mobile thickness
      const fluxes = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const zL = zt[i] + nextH[i];
        const zR = zt[i + 1] + nextH[i + 1];
        const grad = zR - zL;
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i]; // mobility is driven by mobile CO2
        
        // Find if a fault is located at this grid boundary and apply its transmissibility multiplier
        let transMult = 1.0;
        for (let idx = 0; idx < faultCount; idx++) {
          const f = faults[idx];
          if (f) {
            const cellFaultIdx = Math.round(N * (f.xPercent / 100.0));
            if (cellFaultIdx - 1 === i) {
              transMult = f.transmissibility !== undefined ? f.transmissibility : 1.0;
              break;
            }
          }
        }
        
        fluxes[i] = - K * hFace * grad * transMult;
      }

      // Ghost cells boundaries
      const ztL_ghost = capRockY(-parentDX / 2.0) / 15.0;
      const srcL = zt[0] + nextH[0];
      const gradL = srcL - ztL_ghost;
      const hFaceL = gradL > 0 ? hMob[0] : 0.0;
      const fluxL = - K * hFaceL * gradL;

      const ztR_ghost = capRockY(N * parentDX + parentDX / 2.0) / 15.0;
      const gradR = ztR_ghost - (zt[N - 1] + nextH[N - 1]);
      const hFaceR = gradR > 0 ? 0.0 : hMob[N - 1];
      const fluxR = - K * hFaceR * gradR;

      const hTmp = [...nextH];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? fluxL : fluxes[i - 1];
        const fR = i === N - 1 ? fluxR : fluxes[i];
        hTmp[i] = Math.max(0, nextH[i] + (dt / porosity) * (fL - fR));
      }

      // Injection: Active only during injection duration
      const cellInjIdx = Math.floor((injLocation / 100.0) * N);
      if (Q > 0 && currentFrame <= injDuration) {
        hTmp[cellInjIdx] += (Q * dt) / porosity;
        injected += Q * dt * 0.15; // Scaled to look realistic in mass balance
      }

      // Fault Leaks: threshold-pressure/spill-height capillary barrier
      for (let idx = 0; idx < faultCount; idx++) {
        const f = faults[idx];
        if (!f.isSealed) {
          const cellFaultIdx = Math.round(N * (f.xPercent / 100.0));
          const boundedIdx = Math.max(0, Math.min(N - 1, cellFaultIdx));
          
          // Leakage occurs only if CO2 column height H exceeds the threshold
          if (hTmp[boundedIdx] > f.thresholdHeight) {
            const overpressure = hTmp[boundedIdx] - f.thresholdHeight;
            const leak = Math.min(overpressure, f.leakRate * dt);
            hTmp[boundedIdx] -= leak;
            leaked += leak * porosity * 2.5;
          }
        }
      }

      nextH = hTmp;
      for (let i = 0; i < N; i++) {
        if (nextH[i] > nextHMax[i]) nextHMax[i] = nextH[i];
      }
    }

    // Mass distribution calculation
    let mobileSum = 0;
    let trappedSum = 0;
    
    // Trapped is simply the residual locked height (total height - mobile height)
    for (let i = 0; i < N; i++) {
      const H = nextH[i];
      const hm = nextHMax[i];
      const R = residualTrapFraction;
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      const hMob = Math.min(H, mobileVal);
      const hTrap = Math.max(0, H - hMob);
      
      mobileSum += hMob * parentDX * porosity;
      trappedSum += hTrap * parentDX * porosity;
    }

    // Balance masses
    const scaleFactor = 0.12;
    const computedMobile = mobileSum * scaleFactor;
    const computedTrapped = trappedSum * scaleFactor;
    
    // leaked is already accumulated
    return {
      h: nextH,
      hMax: nextHMax,
      masses: {
        injected: injected,
        trapped: computedTrapped,
        mobile: Math.max(0, injected - computedTrapped - leaked), // Enforce mass balance conservation
        leaked: leaked
      }
    };
  };

  // --- PATH GENERATORS FOR SVG VISUALIZER ---
  // Trapped CO2 sits directly under the caprock (from capRockY down to capRockY + hTrapped)
  const getTrappedPath = () => {
    const N = h.length;
    const scale = 15.0; // Unified scale matching solver coordinate system
    
    let firstActive = -1;
    let lastActive = -1;
    for (let i = 0; i < N; i++) {
      if (hTrapped[i] * scale > 0.6) {
        if (firstActive === -1) firstActive = i;
        lastActive = i;
      }
    }
    
    if (firstActive === -1) return "";
    
    // Top boundary: left-to-right along caprock (with vertical steps at faults)
    let path = `M ${firstActive * dx} ${capRockY(firstActive * dx, firstActive)}`;
    for (let i = firstActive; i <= lastActive; i++) {
      const x1 = i * dx;
      const x2 = (i + 1) * dx;
      if (i > firstActive) {
        path += ` L ${x1} ${capRockY(x1, i)}`;
      }
      path += ` L ${x2} ${capRockY(x2, i)}`;
    }
    
    // Bottom boundary: right-to-left (piecewise constant heights relative to caprock)
    for (let i = lastActive; i >= firstActive; i--) {
      const x2 = (i + 1) * dx;
      const x1 = i * dx;
      const y2 = capRockY(x2, i) + hTrapped[i] * scale;
      const y1 = capRockY(x1, i) + hTrapped[i] * scale;
      
      path += ` L ${x2} ${y2}`;
      path += ` L ${x1} ${y1}`;
    }
    
    path += " Z";
    return path;
  };

  // Mobile CO2 flows beneath the trapped layer (from capRockY + hTrapped down to capRockY + hTrapped + hMobile)
  const getMobilePath = () => {
    const N = h.length;
    const scale = 15.0; // Unified scale matching solver coordinate system
    
    let firstActive = -1;
    let lastActive = -1;
    for (let i = 0; i < N; i++) {
      if (hMobile[i] * scale > 0.6) {
        if (firstActive === -1) firstActive = i;
        lastActive = i;
      }
    }
    
    if (firstActive === -1) return "";
    
    // Top boundary: left-to-right (piecewise constant trapped heights)
    const startYTop = capRockY(firstActive * dx, firstActive) + hTrapped[firstActive] * scale;
    let path = `M ${firstActive * dx} ${startYTop}`;
    
    for (let i = firstActive; i <= lastActive; i++) {
      const x1 = i * dx;
      const x2 = (i + 1) * dx;
      const y1 = capRockY(x1, i) + hTrapped[i] * scale;
      const y2 = capRockY(x2, i) + hTrapped[i] * scale;
      
      if (i > firstActive) {
        path += ` L ${x1} ${y1}`;
      }
      path += ` L ${x2} ${y2}`;
    }
    
    // Bottom boundary: right-to-left (piecewise constant total heights)
    for (let i = lastActive; i >= firstActive; i--) {
      const x2 = (i + 1) * dx;
      const x1 = i * dx;
      const y2 = capRockY(x2, i) + (hTrapped[i] + hMobile[i]) * scale;
      const y1 = capRockY(x1, i) + (hTrapped[i] + hMobile[i]) * scale;
      
      path += ` L ${x2} ${y2}`;
      path += ` L ${x1} ${y1}`;
    }
    
    path += " Z";
    return path;
  };

  // Reservoir Conformable Grid block columns
  const reservoirBlocks = useMemo(() => {
    const blocks = [];
    const N = cellCount;
    
    for (let i = 0; i < N; i++) {
      const x1 = i * dx;
      const x2 = (i + 1) * dx;
      const yt1 = capRockY(x1, i);
      const yt2 = capRockY(x2, i);
      const yb1 = yt1 + 175;
      const yb2 = yt2 + 175;
      
      // Permeability noise mapping for sandstone heterogeneity
      const permFactor = 0.5 + 0.5 * Math.sin(i * 12.7 + 1.1);
      const r = Math.floor(35 + permFactor * 14);
      const g = Math.floor(26 + permFactor * 10);
      const b = Math.floor(20 + permFactor * 6);
      const colFill = `rgb(${r}, ${g}, ${b})`;
      
      blocks.push({
        points: `${x1},${yt1} ${x2},${yt2} ${x2},${yb2} ${x1},${yb1}`,
        fill: colFill,
        x1, yt1, x2, yt2, yb1, yb2
      });
    }
    return blocks;
  }, [cellCount, dipPercent, amplitude, frequency, faultOffset, faultCount, faults]);

  // --- Dynamic SVG Chart Drawing ---
  const renderSVGChart = () => {
    const width = 450;
    const height = 210;
    const padding = { left: 45, right: 15, top: 15, bottom: 25 };
    
    const maxVal = Math.max(10, currentMasses.injected * 1.05);
    
    // Scale helper
    const getX = (t) => padding.left + (t / 500.0) * (width - padding.left - padding.right);
    const getY = (val) => height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);
    
    let pathInj = "", pathTrap = "", pathMob = "", pathLeak = "";
    
    if (massHistory.length > 0) {
      pathInj = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].injected)}`;
      pathTrap = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].trapped)}`;
      pathMob = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].mobile)}`;
      pathLeak = `M ${getX(massHistory[0].time)} ${getY(massHistory[0].leaked)}`;
      
      for (let idx = 1; idx < massHistory.length; idx++) {
        const pt = massHistory[idx];
        pathInj += ` L ${getX(pt.time)} ${getY(pt.injected)}`;
        pathTrap += ` L ${getX(pt.time)} ${getY(pt.trapped)}`;
        pathMob += ` L ${getX(pt.time)} ${getY(pt.mobile)}`;
        pathLeak += ` L ${getX(pt.time)} ${getY(pt.leaked)}`;
      }
    }
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Y Grid axis */}
        {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
          const val = maxVal * ratio;
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="3 3"/>
              <text x={padding.left - 8} y={y + 3} fill="rgba(255,255,255,0.45)" fontSize="8.5" textAnchor="end" fontFamily="monospace">
                {Math.round(val)}
              </text>
            </g>
          );
        })}
        
        {/* X axis year labels */}
        {[0, 100, 200, 300, 400, 500].map((t, i) => {
          const x = getX(t);
          return (
            <text key={i} x={x} y={height - 8} fill="rgba(255,255,255,0.45)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
              {t}y
            </text>
          );
        })}
        
        {/* Plot Lines */}
        {pathInj && <path d={pathInj} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6"/>}
        {pathMob && <path d={pathMob} fill="none" stroke="#64ffda" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 2px rgba(100,255,218,0.4))' }}/>}
        {pathTrap && <path d={pathTrap} fill="none" stroke="#3ca68e" strokeWidth="1.8"/>}
        {pathLeak && <path d={pathLeak} fill="none" stroke="#ff6b6b" strokeWidth="1.8"/>}
        
        {/* Vertical line indicator for current simTime */}
        <line 
          x1={getX(simTime)} 
          y1={padding.top} 
          x2={getX(simTime)} 
          y2={height - padding.bottom} 
          stroke="#64ffda" 
          strokeWidth="1.2" 
          strokeDasharray="2 2"
          opacity="0.8"
        />
        <circle cx={getX(simTime)} cy={padding.top} r="3" fill="#64ffda" />
        
        {/* Axes borders */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      </svg>
    );
  };

  return (
    <div 
      className="simulator-page-wrapper"
      style={{
        padding: '110px 4% 60px',
        minHeight: '100vh',
        background: '#130d1c',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 25,
        transition: 'padding-left 0.3s ease-in-out',
        paddingLeft: sidebarOpen ? '360px' : '4%'
      }}
    >
      {/* Floating fallback toggle button if sidebar is closed */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="sidebar-toggle-btn"
        >
          <i className="fas fa-history" /> Time Machine
        </button>
      )}

      {/* --- COLLAPSIBLE TIME-TRAVEL SIDEBAR --- */}
      <div className={`time-travel-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64ffda', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-history" style={{ fontSize: 14 }} /> Time Machine
          </h3>
          <button 
            onClick={() => setSidebarOpen(false)} 
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16 }}
            title="Close panel"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Current State / Mode Status Card */}
        {(() => {
          const isPast = simTime < historyRef.current.length - 1;
          const paramDiffs = getParamDiff();
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              
              {/* Mode indicator badge */}
              <div style={{ 
                background: isPast ? 'rgba(255, 179, 0, 0.1)' : 'rgba(100, 255, 218, 0.1)', 
                border: `1px solid ${isPast ? 'rgba(255, 179, 0, 0.3)' : 'rgba(100, 255, 218, 0.3)'}`,
                padding: '12px 14px', 
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 'bold', color: isPast ? '#ffb300' : '#64ffda' }}>
                  <span style={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    background: isPast ? '#ffb300' : '#64ffda',
                    boxShadow: `0 0 8px ${isPast ? '#ffb300' : '#64ffda'}`,
                    animation: 'pulseFlare 1.5s infinite'
                  }} />
                  {isPast ? 'TIMELINE PREVIEW' : 'LIVE RUNNING'}
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                  {isPast 
                    ? `Viewing history at Year ${simTime}. Changes to sliders will configure a branch starting from this point.` 
                    : `Simulating in real-time. Drag the timeline scrub slider to travel back to previous years.`
                  }
                </div>
              </div>

              {/* Branching Actions */}
              {isPast && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 12 }}>
                  <button 
                    onClick={() => { commitBranch(); handlePlayToggle(); }}
                    style={{
                      background: '#0dfca2',
                      border: 'none',
                      color: '#000',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-code-branch" /> Branch & Run (Yr {simTime})
                  </button>
                  
                  <button 
                    onClick={() => handleScrub(historyRef.current.length - 1)}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.8)',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className="fas fa-fast-forward" /> Return to Present (Yr {historyRef.current.length - 1})
                  </button>
                </div>
              )}

              {/* Precise Time Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>Time Controls</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: 8, borderRadius: 10 }}>
                  
                  {/* Step Back */}
                  <button onClick={stepBackward} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: simTime > 0 ? 0.8 : 0.3 }} disabled={simTime === 0} title="Step Back 1 Year">
                    <i className="fas fa-step-backward" style={{ fontSize: 10 }} />
                  </button>
                  
                  {/* Play Reverse */}
                  <button onClick={handlePlayReverseToggle} style={{ background: 'none', border: 'none', color: isReversing ? '#ff6b6b' : '#64ffda', cursor: 'pointer' }} title={isReversing ? "Pause" : "Play Reverse"}>
                    <i className={`fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`} style={{ fontSize: 11 }} />
                  </button>
                  
                  {/* Pause */}
                  <button 
                    onClick={() => { setIsPlaying(false); setIsReversing(false); }} 
                    style={{ background: 'none', border: 'none', color: (!isPlaying && !isReversing) ? '#ffb300' : '#fff', cursor: 'pointer' }} 
                    title="Pause"
                  >
                    <i className="fas fa-pause" style={{ fontSize: 11 }} />
                  </button>
                  
                  {/* Play Forward */}
                  <button onClick={handlePlayToggle} style={{ background: 'none', border: 'none', color: isPlaying ? '#0dfca2' : '#64ffda', cursor: 'pointer' }} title={isPlaying ? "Pause" : "Play Forward"}>
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ fontSize: 11 }} />
                  </button>
                  
                  {/* Step Forward */}
                  <button onClick={stepForward} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: simTime < 500 ? 0.8 : 0.3 }} disabled={simTime >= 500} title="Step Forward 1 Year">
                    <i className="fas fa-step-forward" style={{ fontSize: 10 }} />
                  </button>
                </div>
              </div>

              {/* Parameter Differences Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <span style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>Branch Parameters</span>
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: 12, 
                  padding: 12,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  {paramDiffs.length > 0 ? (
                    paramDiffs.map((diff, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10.5, borderBottom: i < paramDiffs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: 6 }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{diff.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace' }}>
                          <span style={{ color: '#ff6b6b', textDecoration: 'line-through' }}>{diff.original}</span>
                          <span style={{ color: 'rgba(255,255,255,0.4)' }}><i className="fas fa-arrow-right" style={{ fontSize: 8 }} /></span>
                          <span style={{ color: '#0dfca2', fontWeight: 'bold' }}>{diff.current}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '15px 0' }}>
                      {isPast 
                        ? 'Parameters match the original run. Tweak physical sliders below to define a new branch configuration.' 
                        : 'Simulating on main branch. Scroll down and modify parameters in real-time.'
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone Checkpoint Tree */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>Milestones</span>
                <div style={{ 
                  background: 'rgba(0,0,0,0.15)', 
                  border: '1px solid rgba(255,255,255,0.03)', 
                  borderRadius: 12, 
                  padding: '12px 14px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  position: 'relative'
                }}>
                  {/* Vertical progress line overlay */}
                  <div style={{ 
                    position: 'absolute', left: 19, top: 20, bottom: 20, 
                    width: 2, background: 'rgba(255,255,255,0.06)' 
                  }} />

                  {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map((m, idx) => {
                    const maxSimulated = historyRef.current.length - 1;
                    const isAvailable = m <= maxSimulated;
                    const isCurrent = m === simTime;
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => isAvailable && handleScrub(m)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 12, 
                          padding: '6px 0', 
                          cursor: isAvailable ? 'pointer' : 'default',
                          opacity: isAvailable ? 1 : 0.35
                        }}
                      >
                        {/* Circle node */}
                        <div style={{ 
                          width: 12, height: 12, borderRadius: '50%',
                          background: isCurrent ? '#0dfca2' : isAvailable ? '#3ca68e' : 'rgba(255,255,255,0.1)',
                          border: `2px solid ${isCurrent ? '#fff' : 'transparent'}`,
                          boxShadow: isCurrent ? '0 0 6px #0dfca2' : 'none',
                          zIndex: 2,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }} />
                        
                        {/* Text label */}
                        <span style={{ 
                          fontSize: 11.5, 
                          fontFamily: 'monospace',
                          color: isCurrent ? '#0dfca2' : 'rgba(255,255,255,0.7)',
                          fontWeight: isCurrent ? 'bold' : 'normal'
                        }}>
                          Year {m} {isCurrent && '←'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })()}
      </div>

      {/* Dynamic responsive layout style element */}
      <style>{`
        .simulator-layout {
          display: grid;
          grid-template-columns: 1.40fr 1fr;
          gap: 25px;
          align-items: start;
        }
        .controls-subgrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .time-travel-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 330px;
          background: linear-gradient(135deg, rgba(25, 18, 38, 0.96) 0%, rgba(16, 20, 38, 0.96) 100%);
          border-right: 1px solid rgba(100, 255, 218, 0.18);
          box-shadow: 8px 0 32px rgba(0,0,0,0.5);
          backdrop-filter: blur(15px);
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          padding: 100px 22px 30px;
        }
        .time-travel-sidebar.closed {
          transform: translateX(-100%);
        }
        .time-travel-sidebar.open {
          transform: translateX(0);
        }
        .sidebar-toggle-btn {
          position: fixed;
          bottom: 25px;
          left: 25px;
          z-index: 999;
          background: rgba(100,255,218,0.12);
          border: 1px solid rgba(100,255,218,0.4);
          color: #64ffda;
          padding: 10px 15px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sidebar-toggle-btn:hover {
          background: rgba(100,255,218,0.22);
          box-shadow: 0 4px 20px rgba(100,255,218,0.35);
          transform: translateY(-2px);
        }
        @media (max-width: 1100px) {
          .simulator-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .controls-subgrid {
            grid-template-columns: 1fr;
          }
          .simulator-page-wrapper {
            padding-left: 4% !important;
          }
          .time-travel-sidebar {
            width: 290px;
            padding-top: 90px;
          }
        }
      `}</style>

      {/* --- TOP ROW: Page Title & Preset Scenarios --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', color: '#64ffda', fontWeight: 600, marginBottom: 6 }}>
            Interactive Numerical PDE Sandbox
          </div>
          <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 38px)', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 15 }}>
            VE Gravity Tongue Simulator
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: sidebarOpen ? 'rgba(100, 255, 218, 0.25)' : 'rgba(100, 255, 218, 0.1)',
                border: `1px solid ${sidebarOpen ? '#64ffda' : 'rgba(100, 255, 218, 0.3)'}`,
                color: '#64ffda',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
              title="Toggle Time Machine Sidebar"
            >
              <i className="fas fa-history" /> {sidebarOpen ? 'Close Time Machine' : 'Time Machine'}
            </button>
          </h2>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: 13.5, maxWidth: 680 }}>
            Solve explicit Finite Volume Vertical Equilibrium (VE) equations dynamically. Tweak caprock topography, sandstone parameters, or injection variables in real-time.
          </p>
        </div>
        
        {/* Preset Button Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 14, backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Synthetic Reservoir Cases</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'default', label: 'Default Case', icon: 'fa-project-diagram' },
              { id: 'dome', label: 'Anticline Dome', icon: 'fa-mountain' },
              { id: 'faulted', label: 'Faulted Trap', icon: 'fa-bolt' },
              { id: 'monocline', label: 'Dipping Layer', icon: 'fa-sliders' },
            ].map(p => (
              <button key={p.id} onClick={() => applyPreset(p.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'azure', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s ease' }}>
                <i className={`fas ${p.icon}`} style={{ fontSize: 9.5, color: '#64ffda' }}/> {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- MAIN LAYOUT GRID --- */}
      <div className="simulator-layout">
        {/* LEFT COLUMN: Reservoir SVG Visualizer + Parameter & Fault Sliders (below it) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Reservoir Visualizer SVG Window */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(100,255,218,0.18)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 450,
            position: 'relative'
          }}>
            {/* Tabbed Header */}
            <div style={{ 
              padding: '0 10px', 
              borderBottom: '1px solid rgba(255,255,255,0.06)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'rgba(0,0,0,0.15)',
              minHeight: '48px'
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <button 
                  onClick={() => setActiveSubTab('profile')}
                  style={{
                    background: activeSubTab === 'profile' ? 'rgba(100, 255, 218, 0.08)' : 'none',
                    border: 'none',
                    borderBottom: activeSubTab === 'profile' ? '2px solid #64ffda' : '2px solid transparent',
                    color: activeSubTab === 'profile' ? '#64ffda' : 'rgba(255,255,255,0.6)',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                >
                  <i className="fas fa-project-diagram" style={{ marginRight: 6 }} /> 2D Simulator
                </button>
                <button 
                  onClick={() => setActiveSubTab('uq')}
                  style={{
                    background: activeSubTab === 'uq' ? 'rgba(100, 255, 218, 0.08)' : 'none',
                    border: 'none',
                    borderBottom: activeSubTab === 'uq' ? '2px solid #64ffda' : '2px solid transparent',
                    color: activeSubTab === 'uq' ? '#64ffda' : 'rgba(255,255,255,0.6)',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                >
                  <i className="fas fa-chart-bar" style={{ marginRight: 6 }} /> Sensitivity & UQ
                </button>
              </div>
              <div style={{ paddingRight: 8 }}>
                {activeSubTab === 'profile' ? (
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>Year {simTime} / 500</span>
                ) : activeSubTab === 'uq' ? (
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>Monte Carlo Analysis</span>
                ) : (
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>Methodology Guide</span>
                )}
              </div>
            </div>

            {/* Inner Content Switcher */}
            {(() => {
              if (activeSubTab === 'profile') {
                return (
                  <div style={{ flex: 1, position: 'relative', display: 'flex', background: '#1c1626' }}>
              <svg viewBox="0 0 1000 450" preserveAspectRatio="none" style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                <defs>
                  <clipPath id="caprock-clipper">
                    <path d={`M 0 ${reservoirBlocks[0] ? reservoirBlocks[0].yt1 : capRockY(0)} ` + reservoirBlocks.map(b => `L ${b.x1} ${b.yt1} L ${b.x2} ${b.yt2}`).join(" ") + ` L 1000 450 L 0 450 Z`}/>
                  </clipPath>
                  
                  <linearGradient id="plume-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0dfca2" stopOpacity="0.95"/>
                    <stop offset="100%" stopColor="#05ab5e" stopOpacity="0.75"/>
                  </linearGradient>
                  
                  <linearGradient id="trapped-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b7a61" stopOpacity="0.85"/>
                    <stop offset="100%" stopColor="#034d3c" stopOpacity="0.75"/>
                  </linearGradient>
                  
                  <linearGradient id="brine-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a2a4d" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#051426" stopOpacity="0.95"/>
                  </linearGradient>
                </defs>

                {/* Conforming caprock layer (solid brown) */}
                <path d={`M 0 0 L 1000 0 L 1000 ${capRockY(1000)} ` + Array.from({ length: 100 }, (_, idx) => `L ${(99-idx)*10} ${capRockY((99-idx)*10)}`).join(" ") + ` Z`} fill="#282030" stroke="rgba(255,255,255,0.02)"/>
                
                {/* Reservoir Sandstone conforming blocks */}
                {(() => {
                  const N = h.length;
                  const scale = 15.0;
                  return reservoirBlocks.map((b, idx) => {
                    const cellInjIdx = Math.floor((injLocation / 100.0) * cellCount);
                    const yBrineTop1 = b.yt1 + h[idx] * scale;
                    const yBrineTop2 = b.yt2 + h[idx] * scale;
                    
                    return (
                      <g key={idx}>
                        {/* Sandstone Gridblock */}
                        <polygon points={b.points} fill={b.fill} stroke="rgba(0,0,0,0.12)" strokeWidth="0.5"/>
                        
                        {/* Brine water layer conforming (saturated water) */}
                        {yBrineTop1 < b.yb1 && (
                          <polygon points={`${b.x1},${yBrineTop1} ${b.x2},${yBrineTop2} ${b.x2},${b.yb2} ${b.x1},${b.yb1}`} fill="url(#brine-grad)"/>
                        )}

                        {/* Well injection casing visual inside reservoir column */}
                        {idx === cellInjIdx && (
                          <rect x={b.x1 + dx/2.0 - 2} y={b.yt1} width="4" height={b.yb1 - b.yt1} fill="rgba(255,255,255,0.2)"/>
                        )}
                      </g>
                    );
                  });
                })()}

                {/* CO2 Plume Core Band (VE double layer visual representation) */}
                <g clipPath="url(#caprock-clipper)">
                  {/* 1. Trapped Plume Layer directly beneath Caprock */}
                  {getTrappedPath() && (
                    <path d={getTrappedPath()} fill="url(#trapped-grad)" stroke="#0b7a61" strokeWidth="0.8"/>
                  )}
                  {/* 2. Mobile flowing Plume Layer running below the trapped layer */}
                  {getMobilePath() && (
                    <path d={getMobilePath()} fill="url(#plume-grad)" stroke="#0dfca2" strokeWidth="0.8"/>
                  )}
                </g>

                {/* Aquifer boundary bottom seal */}
                <path d={`M 0 ${capRockY(0)+175} ` + Array.from({ length: 101 }, (_, idx) => `L ${idx*10} ${capRockY(idx*10)+175}`).join(" ")} stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none"/>

                {/* Injection Well Riser and flare */}
                {(() => {
                  const cellInjIdx = Math.floor((injLocation / 100.0) * cellCount);
                  const xWell = cellInjIdx * dx + dx / 2.0;
                  const yCap = capRockY(xWell);
                  
                  return (
                    <g>
                      {/* Vertical steel casing tubing */}
                      <line x1={xWell} y1="0" x2={xWell} y2={yCap + 120} stroke="url(#well-gradient)" strokeWidth="4"/>
                      {/* Perforations indicator */}
                      {Q > 0 && simTime <= injDuration && (
                        <circle cx={xWell} cy={yCap + 90} r="10" fill="rgba(100,255,218,0.25)" style={{ animation: 'pulseFlare 1.5s infinite' }}/>
                      )}
                      {/* Flow bubbles in tubing */}
                      {Q > 0 && isPlaying && simTime <= injDuration && [0, 0.3, 0.6, 0.9].map((delay, idx) => (
                        <circle key={idx} cx={xWell} cy={yCap * (idx/4.0)} r="2" fill="#0dfca2" style={{ animation: `streakRise 1.5s linear ${delay}s infinite` }}/>
                      ))}
                    </g>
                  );
                })()}

                {/* Fault Lines (Dynamic representation) */}
                {Array.from({ length: faultCount }).map((_, idx) => {
                  const f = faults[idx];
                  const xPos = (f.xPercent / 100.0) * 1000.0;
                  const yFault = capRockY(xPos);
                  const color = f.isSealed ? '#64ffda' : '#ff6b6b';
                  const T = idx % 2 === 0 ? 0.18 : -0.18;
                  const yStart = yFault - 60;
                  const yEnd = yFault + 180;
                  const xStart = xPos + T * (yStart - yFault);
                  const xEnd = xPos + T * (yEnd - yFault);
                  return (
                    <g key={idx}>
                      <line x1={xStart} y1={yStart} x2={xEnd} y2={yEnd} stroke={color} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6"/>
                    </g>
                  );
                })}

                {/* Leaking CO2 bubbles ascending through the active open faults */}
                {isPlaying && Array.from({ length: faultCount }).map((_, idx) => {
                  const f = faults[idx];
                  if (f.isSealed) return null;
                  const xPos = (f.xPercent / 100.0) * 1000.0;
                  const direction = idx % 2 === 0 ? 1 : -1;
                  const sourceXPos = direction === 1 ? xPos - 10 : xPos + 10;
                  const cellIdx = Math.round(cellCount * (sourceXPos / 1000.0));
                  const boundedIdx = Math.max(0, Math.min(cellCount - 1, cellIdx));
                  const yFault = capRockY(xPos);
                  const T = idx % 2 === 0 ? 0.18 : -0.18;
                  
                  // Bubbles activate ONLY when total plume height exceeds spill threshold height
                  if (h[boundedIdx] > f.thresholdHeight + 0.05) {
                    const travelY = -yFault * 0.8;
                    const travelX = T * travelY;
                    return [0, 0.7, 1.4, 2.1].map((delay, i) => (
                      <circle key={`fl-${idx}-${i}`} cx={xPos + (i % 2) * 2 - 1} cy={yFault - 10} r="1.5" fill="#0dfca2" style={{
                        opacity: 0,
                        '--travel-x': `${travelX}px`,
                        '--travel-y': `${travelY}px`,
                        animation: 'faultRiseTilted 2.5s linear ' + delay + 's infinite'
                      }}/>
                    ));
                  }
                  return null;
                })}

                {/* Label legends */}
                <text x="30" y={capRockY(30) - 10} fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="0.1em" textTransform="uppercase" fontFamily="monospace">Caprock Seal</text>
                <text x="30" y={capRockY(30) + 80} fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="0.1em" textTransform="uppercase" fontFamily="monospace">Sandstone Aquifer</text>
                
                <defs>
                  <linearGradient id="well-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#222"/>
                    <stop offset="50%" stopColor="#ccc"/>
                    <stop offset="100%" stopColor="#222"/>
                  </linearGradient>
                </defs>
              </svg>

              {/* Time Travel Seek/Play Control Bar overlaid at bottom */}
              <div style={{
                position: 'absolute', bottom: 15, left: '5%', right: '5%',
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '8px 18px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '30px',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                zIndex: 10
              }}>
                {/* Play Reverse */}
                <button 
                  onClick={handlePlayReverseToggle} 
                  style={{ background: 'none', border: 'none', color: isReversing ? '#ff6b6b' : '#64ffda', cursor: 'pointer', outline: 'none' }} 
                  title={isReversing ? "Pause Reverse" : "Reverse Play"}
                >
                  <i className={`fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`} style={{ fontSize: 13 }}/>
                </button>
                {/* Play/Pause Forward */}
                <button 
                  onClick={handlePlayToggle} 
                  style={{ background: 'none', border: 'none', color: isPlaying ? '#0dfca2' : '#64ffda', cursor: 'pointer', outline: 'none' }} 
                  title={isPlaying ? "Pause" : "Play Forward"}
                >
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ fontSize: 13 }}/>
                </button>
                {/* Step Backward */}
                <button 
                  onClick={stepBackward} 
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', outline: 'none' }} 
                  title="Step 1 Year Backward"
                >
                  <i className="fas fa-step-backward" style={{ fontSize: 10 }}/>
                </button>
                {/* Step Forward */}
                <button 
                  onClick={stepForward} 
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', outline: 'none' }} 
                  title="Step 1 Year Forward"
                >
                  <i className="fas fa-step-forward" style={{ fontSize: 10 }}/>
                </button>
                {/* Reset */}
                <button onClick={resetSimulation} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', outline: 'none' }} title="Reset Simulation">
                  <i className="fas fa-redo" style={{ fontSize: 11 }}/>
                </button>
                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }}/>
                
                {/* Seek Year indicator */}
                <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', minWidth: 50 }}>
                  Yr {simTime}
                </span>

                {/* Seek Timeline Range Slider */}
                <input 
                  type="range" 
                  min="0" 
                  max={Math.max(1, historyRef.current.length - 1)}
                  value={simTime}
                  onChange={e => handleScrub(parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    height: 3,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    outline: 'none',
                    cursor: 'pointer',
                    accentColor: '#64ffda'
                  }}
                  title="Drag to seek/reverse simulation time"
                />

                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }}/>
                {/* Speed toggle */}
                <button onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)} style={{ background: 'none', border: 'none', color: '#64ffda', cursor: 'pointer', fontSize: 10, fontWeight: 'bold', outline: 'none' }}>
                  {speed}x
                </button>
              </div>
            </div>
          );
        } else if (activeSubTab === 'uq') {
          return (
              /* Sensitivity & UQ Dashboard UI panel */
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                background: '#1c1626', 
                padding: '20px 25px', 
                gap: 20, 
                overflowY: 'auto',
                minHeight: 450
              }}>
                {/* CONFIGURATION ROW */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.2fr 1fr 1fr', 
                  gap: 20,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 14,
                  padding: 16
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Uncertainty Ranges</span>
                    <Slider label="Permeability (K) range" val={`\u00B1${Math.round(kUncertainty*100)}%`} min="0.10" max="0.80" step="0.05" value={kUncertainty} onChange={v => setKUncertainty(parseFloat(v))} />
                    <Slider label="Residual Trap (Sgr) range" val={`\u00B1${Math.round(sgrUncertainty*100)}%`} min="0.10" max="0.80" step="0.05" value={sgrUncertainty} onChange={v => setSgrUncertainty(parseFloat(v))} />
                    {faultCount > 0 && (
                      <Slider label="Fault Seal Threshold range" val={`\u00B1${Math.round(faultThreshUncertainty*100)}%`} min="0.10" max="0.80" step="0.05" value={faultThreshUncertainty} onChange={v => setFaultThreshUncertainty(parseFloat(v))} />
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Simulation Settings</span>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                       <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)' }}>Monte Carlo Realizations:</span>
                       <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                         {[25, 50, 100].map(cnt => (
                           <button
                             key={cnt}
                             onClick={() => setMcRunsCount(cnt)}
                             style={{
                               background: mcRunsCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
                               border: `1px solid ${mcRunsCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
                               color: mcRunsCount === cnt ? '#64ffda' : 'azure',
                               padding: '4px 10px',
                               borderRadius: 6,
                               fontSize: 10.5,
                               fontWeight: 'bold',
                               cursor: 'pointer',
                               outline: 'none'
                             }}
                           >
                             {cnt} runs
                           </button>
                         ))}
                       </div>
                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                       <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)' }}>Target Storage Metric:</span>
                       <select 
                         value={uqTargetMetric} 
                         onChange={e => setUqTargetMetric(e.target.value)}
                         style={{
                           background: 'rgba(0,0,0,0.3)',
                           border: '1px solid rgba(255,255,255,0.15)',
                           color: '#fff',
                           padding: '6px 10px',
                           borderRadius: 8,
                           fontSize: 11,
                           cursor: 'pointer',
                           outline: 'none'
                         }}
                       >
                         <option value="leaked">CO\u2082 Leakage Mass (ktonnes)</option>
                         <option value="trapped">Residual Trapping Efficiency (%)</option>
                       </select>
                     </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={runMonteCarloBatch}
                      disabled={uqRunning}
                      style={{
                        background: uqRunning ? 'rgba(255,255,255,0.05)' : '#64ffda',
                        border: 'none',
                        color: uqRunning ? 'rgba(255,255,255,0.3)' : '#000',
                        padding: '12px 20px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 'bold',
                        cursor: uqRunning ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: uqRunning ? 'none' : '0 4px 15px rgba(100,255,218,0.25)',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        justifyContent: 'center'
                      }}
                    >
                      {uqRunning ? (
                        <React.Fragment>
                          <i className="fas fa-spinner fa-spin" /> Simulating...
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <i className="fas fa-play" /> Run Uncertainty Analysis
                        </React.Fragment>
                      )}
                    </button>
                    
                    {uqRunning && (
                      <div style={{ width: '100%', marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>
                          <span>Running Batch</span>
                          <span>{uqProgress}%</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${uqProgress}%`, height: '100%', background: '#64ffda', transition: 'width 0.1s ease' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RESULTS VIEW */}
                {uqData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                          Uncertainty Distribution ({uqTargetMetric === 'leaked' ? 'CO\u2082 Leaked Mass' : 'Trapping Efficiency'})
                        </span>
                        {renderUQHistogram(uqData)}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                          Parameter Correlation Coefficients (Pearson r)
                        </span>
                        {renderUQSensitivity(sensitivityData)}
                      </div>

                    </div>

                    <div style={{ 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 14,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Probabilistic Risk Models</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        
                        {/* P10 */}
                        <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 9.5, color: '#64ffda', fontWeight: 'bold' }}>P10 (Low Risk)</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 }}>
                              {uqData.p10Val.toFixed(1)}{uqTargetMetric === 'leaked' ? ' kt' : '%'}
                            </div>
                          </div>
                          <button 
                            onClick={() => loadUQRealization(uqData.p10Realization)}
                            style={{ background: 'rgba(100,255,218,0.1)', border: '1px solid rgba(100,255,218,0.3)', color: '#64ffda', padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' }}
                          >
                            Load Model
                          </button>
                        </div>
                        
                        {/* P50 */}
                        <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 9.5, color: '#ffb300', fontWeight: 'bold' }}>P50 (Expected)</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 }}>
                              {uqData.p50Val.toFixed(1)}{uqTargetMetric === 'leaked' ? ' kt' : '%'}
                            </div>
                          </div>
                          <button 
                            onClick={() => loadUQRealization(uqData.p50Realization)}
                            style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.3)', color: '#ffb300', padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' }}
                          >
                            Load Model
                          </button>
                        </div>
                        
                        {/* P90 */}
                        <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 9.5, color: '#ff6b6b', fontWeight: 'bold' }}>P90 (High Risk)</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 }}>
                              {uqData.p90Val.toFixed(1)}{uqTargetMetric === 'leaked' ? ' kt' : '%'}
                            </div>
                          </div>
                          <button 
                            onClick={() => loadUQRealization(uqData.p90Realization)}
                            style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' }}
                          >
                            Load Model
                          </button>
                        </div>

                       </div>
                     </div>

                   </div>
                 ) : (
                   <div style={{ 
                     flex: 1, 
                     display: 'flex', 
                     flexDirection: 'column', 
                     justifyContent: 'center', 
                     alignItems: 'center', 
                     background: 'rgba(0,0,0,0.1)', 
                     border: '1px dashed rgba(255,255,255,0.08)',
                     borderRadius: 14,
                     padding: 40,
                     textAlign: 'center'
                   }}>
                     <i className="fas fa-calculator" style={{ fontSize: 36, color: 'rgba(255,255,255,0.15)', marginBottom: 15 }} />
                     <h4 style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.8)' }}>Uncalculated Probability Space</h4>
                     <p style={{ margin: '6px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,0.45)', maxWidth: 380 }}>
                       Configure parameter uncertainties above and run the batch simulator to generate risk distributions and sensitivity analyses.
                     </p>
                   </div>
                 )}
               </div>
               );
             } else {
               return (
                 <div style={{ 
                   flex: 1, 
                   display: 'flex', 
                   flexDirection: 'column', 
                   background: '#1c1626', 
                   padding: '20px 25px', 
                   overflowY: 'auto',
                   minHeight: 450
                 }}>
                   <GuidePage isEmbedded={true} />
                 </div>
               );
             }
           })()}
           </div>

          {/* Sub-grid containing Parameters (Left) and Faults (Right) directly below Reservoir Grid */}
          <div className="controls-subgrid">
            
            {/* Simulation Parameters Slider Panel */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '18px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
              backdropFilter: 'blur(12px)'
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64ffda', fontFamily: "'Montserrat', sans-serif" }}>
                Simulation Parameters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Caprock Structure controls */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Topography Spline (Caprock)</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                    <Slider label="Regional Dip" val={`${dipPercent}%`} min="-5" max="5" step="0.5" value={dipPercent} onChange={v => setDipPercent(parseFloat(v))} />
                    <Slider label="Anticline Height" val={`${amplitude}px`} min="0" max="50" step="5" value={amplitude} onChange={v => setAmplitude(parseInt(v))} />
                    <Slider label="Anticline Count" val={frequency} min="0.5" max="4.0" step="0.5" value={frequency} onChange={v => setFrequency(parseFloat(v))} />
                    <Slider label="Fault Slip" val={`${faultOffset}x`} min="0" max="3" step="0.2" value={faultOffset} onChange={v => setFaultOffset(parseFloat(v))} />
                  </div>
                </div>

                {/* Rock & Fluids properties */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Sandstone Properties</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                    <Slider label="Permeability (K)" val={`${Math.round(K*1000)} mD`} min="0.1" max="2.0" step="0.1" value={K} onChange={v => setK(parseFloat(v))} />
                    <Slider label="Porosity (phi)" val={`${Math.round(porosity*100)}%`} min="0.1" max="0.4" step="0.05" value={porosity} onChange={v => setPorosity(parseFloat(v))} />
                    <Slider label="Grid Cells (N)" val={cellCount} min="50" max="300" step="10" value={cellCount} onChange={v => setCellCount(parseInt(v))} />
                    <Slider label="Residual Trap (Sgr)" val={`${Math.round(residualTrapFraction*100)}%`} min="0.0" max="0.4" step="0.05" value={residualTrapFraction} onChange={v => setResidualTrapFraction(parseFloat(v))} />
                  </div>
                </div>

                {/* Injection Settings */}
                <div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Injection Settings</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                    <Slider label="Flow Rate (Q)" val={Q} min="0.0" max="1.5" step="0.1" value={Q} onChange={v => setQ(parseFloat(v))} />
                    <Slider label="Well Location" val={`${injLocation}%`} min="10" max="90" step="5" value={injLocation} onChange={v => setInjLocation(parseInt(v))} />
                    <Slider label="Inj. Stop Year" val={`${injDuration}y`} min="50" max="400" step="10" value={injDuration} onChange={v => setInjDuration(parseInt(v))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Fault Management Control Panel */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '18px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
              backdropFilter: 'blur(12px)'
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64ffda', fontFamily: "'Montserrat', sans-serif" }}>
                Fault Management
              </h3>

              {/* Number of Faults selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 15 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Active Faults:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2, 3].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => setFaultCount(cnt)}
                      style={{
                        background: faultCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${faultCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
                        color: faultCount === cnt ? '#64ffda' : 'azure',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fault controls rows */}
              {faultCount > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {Array.from({ length: faultCount }).map((_, idx) => {
                    const f = faults[idx];
                    const label = `Fault ${String.fromCharCode(65 + idx)}`;
                    return (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 'bold', color: f.isSealed ? '#64ffda' : '#ff6b6b' }}>{label}</span>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={f.isSealed}
                              onChange={e => {
                                const newFaults = [...faults];
                                newFaults[idx].isSealed = e.target.checked;
                                setFaults(newFaults);
                              }}
                              style={{ accentColor: '#64ffda' }}
                            />
                            Sealed (Infinite Barrier)
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <Slider
                            label="Position"
                            val={`${f.xPercent}%`}
                            min="10"
                            max="90"
                            step="5"
                            value={f.xPercent}
                            onChange={v => {
                              const newFaults = [...faults];
                              newFaults[idx].xPercent = parseInt(v);
                              setFaults(newFaults);
                            }}
                          />
                          <Slider
                            label="Capillary Threshold"
                            val={`${f.thresholdHeight} m`}
                            min="0.0"
                            max="2.0"
                            step="0.1"
                            value={f.thresholdHeight}
                            onChange={v => {
                              const newFaults = [...faults];
                              newFaults[idx].thresholdHeight = parseFloat(v);
                              setFaults(newFaults);
                            }}
                          />
                          <Slider
                            label="Horiz. Transmissibility"
                            val={f.transmissibility !== undefined ? f.transmissibility.toFixed(2) : "1.00"}
                            min="0.0"
                            max="1.0"
                            step="0.05"
                            value={f.transmissibility !== undefined ? f.transmissibility : 1.0}
                            onChange={v => {
                              const newFaults = [...faults];
                              newFaults[idx].transmissibility = parseFloat(v);
                              setFaults(newFaults);
                            }}
                          />
                          {!f.isSealed ? (
                            <Slider
                              label="Leakage Rate"
                              val={f.leakRate}
                              min="0.01"
                              max="0.40"
                              step="0.02"
                              value={f.leakRate}
                              onChange={v => {
                                const newFaults = [...faults];
                                newFaults[idx].leakRate = parseFloat(v);
                                setFaults(newFaults);
                              }}
                            />
                          ) : (
                            <div />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mass Balance Analytics & Charting Window */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'sticky',
          top: 110
        }}>
          {/* Mass Balance Analytics Panel */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '18px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64ffda', fontFamily: "'Montserrat', sans-serif" }}>
                CO₂ Mass Balance
              </h3>
              <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>Values in ktonnes</span>
            </div>

            {/* Live Chart Rendering */}
            {renderSVGChart()}

            {/* Mass balance numerical breakdown boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
              <StatBox label="Injected" value={Math.round(currentMasses.injected)} color="#ffffff" opacity="0.6"/>
              <StatBox label="Mobile Plume" value={Math.round(currentMasses.mobile)} color="#64ffda"/>
              <StatBox label="Trapped" value={Math.round(currentMasses.trapped)} color="#3ca68e"/>
              <StatBox label="Leaked" value={Math.round(currentMasses.leaked)} color="#ff6b6b"/>
            </div>

            {/* Real-time Storage Efficiency Trapping Mechanism Progress Bars */}
            <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Storage Efficiency</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <ProgressBar label="Structural Trapping (Mobile)" pct={currentMasses.injected > 0 ? (currentMasses.mobile / currentMasses.injected) * 100 : 0} color="#64ffda"/>
                <ProgressBar label="Residual Capillary Trapping" pct={currentMasses.injected > 0 ? (currentMasses.trapped / currentMasses.injected) * 100 : 0} color="#3ca68e"/>
                <ProgressBar label="Cumulative Leaked Fraction" pct={currentMasses.injected > 0 ? (currentMasses.leaked / currentMasses.injected) * 100 : 0} color="#ff6b6b"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GuidePage isEmbedded={true} />
    </div>
  );
};

// Slider Input helper component
const Slider = ({ label, val, min, max, step, value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'rgba(255,255,255,0.8)' }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color: '#64ffda' }}>{val}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          height: 3,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          outline: 'none',
          cursor: 'pointer',
          accentColor: '#64ffda'
        }}
      />
    </div>
  );
};

// Stat numeric display helper component
const StatBox = ({ label, value, color, opacity }) => {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 10,
      padding: '8px 4px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: color, fontFamily: 'monospace', opacity: opacity }}>
        {value}
      </div>
    </div>
  );
};

// Storage Efficiency Progress Bar helper component
const ProgressBar = ({ label, pct, color }) => {
  // Cap at 100%
  const clampedPct = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ fontSize: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        <span style={{ color: color, fontWeight: 'bold' }}>{Math.round(clampedPct)}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${clampedPct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s ease' }}/>
      </div>
    </div>
  );
};

// Bind to window object for Babel execution scope
Object.assign(window, { SimulatorPage });

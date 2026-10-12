// SimulatorPage.jsx — Interactive VE Simulator Page. Physics lives in ve-engine.js (window.VE).
const { useEffect, useMemo, useRef, useState } = React;

const VE_HORIZON_YR = 1000;
const kgToMt = kg => kg / 1e9;
const cloneSimParams = p => JSON.parse(JSON.stringify(p));

const SIM_PARAM_LABELS = {
  nx: 'Grid cells', W: 'Slab width (m)', H: 'Aquifer thickness (m)', dipPct: 'Regional dip (%)',
  foldAmp: 'Fold amplitude (m)', foldCount: 'Fold count', k_mD: 'Permeability (mD)', phi: 'Porosity',
  Swr: 'Residual brine S_wr', Sgr: 'Residual CO₂ S_gr', dRho: 'Δρ (kg/m³)', M: 'Mobility ratio M',
  Q_Mtpa: 'Injection rate (Mt/yr)', injYears: 'Injection period (yr)', wellFrac: 'Well position',
  fringeOn: 'Capillary fringe', Pe_kPa: 'Entry pressure P_e (kPa)', dissMult: 'Dissolution ×'
};

const SIM_FLAG_TEXT = {
  injectionBlocked: 'Injection blocked: the well is sealed in by faults',
  dtFloor: 'Time-step floor hit: results approximate',
  overflow: 'Column overflow guard triggered'
};

const MASS_SERIES = [
  { key: 'injected', label: 'Injected', color: '#ffffff', dash: '3 3' },
  { key: 'structural', label: 'Structural', color: '#64ffda' },
  { key: 'migrating', label: 'Migrating', color: '#0dfca2' },
  { key: 'residual', label: 'Residual', color: '#3ca68e' },
  { key: 'dissolved', label: 'Dissolved', color: '#4dabf7' },
  { key: 'upper', label: 'Upper layer', color: '#ffb300' },
  { key: 'exited', label: 'Exited', color: '#ff6b6b' }
];

const SIM_PANEL_STYLE = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: '18px 20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
  backdropFilter: 'blur(12px)'
};
const SIM_PANEL_TITLE = { margin: '0 0 14px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64ffda', fontFamily: "'Montserrat', sans-serif" };

// Flat view of params for the Time Machine diff; faults become "Fault A · throw_m" etc.
const flattenSimParams = p => {
  const out = {};
  Object.keys(p).forEach(k => {
    if (k === 'faults') p.faults.forEach((f, i) => Object.keys(f).forEach(fk => { out[`Fault ${String.fromCharCode(65 + i)} · ${fk}`] = f[fk]; }));
    else out[SIM_PARAM_LABELS[k] || k] = p[k];
  });
  out['Active faults'] = p.faults.length;
  return out;
};

const diffSimParams = (a, b) => {
  const fa = flattenSimParams(a), fb = flattenSimParams(b);
  const fmt = v => (v === undefined ? '—' : typeof v === 'number' ? String(+v.toFixed(4)) : String(v));
  return Object.keys({ ...fa, ...fb })
    .filter(k => fa[k] !== fb[k])
    .map(k => ({ label: k, original: fmt(fa[k]), current: fmt(fb[k]) }));
};

// Mass categories in Mt (lower layer split by mechanism, upper layer = everything that leaked up)
const simMassPoint = (d, time) => {
  const [lo, up] = d.layers;
  return {
    time,
    injected: kgToMt(d.injected),
    structural: kgToMt(lo.structural),
    migrating: kgToMt(lo.migrating),
    residual: kgToMt(lo.residual),
    dissolved: kgToMt(lo.dissolved),
    upper: kgToMt(up.total),
    exited: kgToMt(d.exited)
  };
};

const SimulatorPage = () => {
  // --- PARAMETERS → MODEL ---
  const [params, setParams] = useState(() => VE.withDefaults({}));
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const model = useMemo(() => VE.createModel(params), [params]);
  const modelRef = useRef(model);
  modelRef.current = model;

  // --- ENGINE STATE: simRef is the play loop's source of truth; sim mirrors it for rendering ---
  const [sim, setSim] = useState(() => VE.initState(model));
  const simRef = useRef(sim);
  const historyRef = useRef([]); // historyRef.current[year] = { state, params }
  const [massHistory, setMassHistory] = useState([]);

  // Simulation run state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'uq' | 'guide'

  // SA/UQ configuration (± fractions) and Monte Carlo state
  const [kUncertainty, setKUncertainty] = useState(0.40);
  const [sgrUncertainty, setSgrUncertainty] = useState(0.40);
  const [faultThreshUncertainty, setFaultThreshUncertainty] = useState(0.50);
  const [mcRunsCount, setMcRunsCount] = useState(50);
  const [mcResults, setMcResults] = useState(null);
  const [uqRunning, setUqRunning] = useState(false);
  const [uqProgress, setUqProgress] = useState(0);
  const [uqTargetMetric, setUqTargetMetric] = useState('leaked'); // 'leaked' (Mt into upper layer) | 'trapped' (immobilised %)

  const simTime = Math.round(sim.t);
  const faultCount = params.faults.length;
  // A grid-size change rebuilds the model one render before the reset effect runs: never diagnose mismatched arrays
  const simMatches = sim.layers[0].V.length === model.nx;
  const diag = useMemo(() => VE.diagnose(model, simMatches ? sim : VE.initState(model)), [model, sim, simMatches]);

  const setP = (key, value) => setParams(p => ({ ...p, [key]: value }));
  const setFault = (idx, key, value) => setParams(p => ({ ...p, faults: p.faults.map((f, i) => (i === idx ? { ...f, [key]: value } : f)) }));
  const setFaultCount = n => setParams(p => ({ ...p, faults: Array.from({ length: n }, (_, i) => p.faults[i] || cloneSimParams(VE.FAULT_TEMPLATES[i])) }));

  const showState = s => { simRef.current = s; setSim(s); };

  const record = s => {
    const t = Math.round(s.t);
    historyRef.current[t] = { state: s, params: cloneSimParams(paramsRef.current) };
    if (t % 5 === 0 || t === 1 || t === VE_HORIZON_YR) {
      const pt = simMassPoint(VE.diagnose(modelRef.current, s), t);
      setMassHistory(hist => [...hist.filter(q => q.time < t), pt]);
    }
  };

  const resetTo = m => {
    const s0 = VE.initState(m);
    historyRef.current = [{ state: s0, params: cloneSimParams(paramsRef.current) }];
    setMassHistory([simMassPoint(VE.diagnose(m, s0), 0)]);
    setIsPlaying(false);
    setIsReversing(false);
    showState(s0);
  };
  const resetSimulation = () => resetTo(modelRef.current); // also used as an onClick handler: ignores its argument

  useEffect(() => { resetTo(modelRef.current); }, [params.nx]);

  const applyPreset = name => {
    const p = cloneSimParams(VE.PRESETS[name]);
    paramsRef.current = p;
    setParams(p);
    resetTo(VE.createModel(p));
  };

  // Advance one simulated year from the live state; false at the horizon or while a resize is pending
  const stepYear = () => {
    const m = modelRef.current, s = simRef.current;
    if (Math.round(s.t) >= VE_HORIZON_YR || s.layers[0].V.length !== m.nx) return false;
    const next = VE.advance(m, s, 1);
    record(next);
    showState(next);
    return true;
  };

  const loadYear = t => {
    const snap = historyRef.current[t];
    if (snap) showState(snap.state);
    return !!snap;
  };

  // --- PLAY LOOP (reads refs only, so mid-run slider changes reach the solver) ---
  useEffect(() => {
    if (!isPlaying && !isReversing) return;
    let owned = simRef.current; // the state this run last produced
    const id = setInterval(() => {
      // A reset fired from an effect (grid change) lands before React clears this interval: end the run, don't step it
      if (simRef.current !== owned) {
        clearInterval(id);
        setIsPlaying(false);
        setIsReversing(false);
        return;
      }
      if (isPlaying) {
        if (!stepYear()) setIsPlaying(false);
      } else if (!loadYear(Math.round(simRef.current.t) - 1)) {
        setIsReversing(false);
      }
      owned = simRef.current;
    }, 40 / speed);
    return () => clearInterval(id);
  }, [isPlaying, isReversing, speed]);

  const handleScrub = target => {
    setIsPlaying(false);
    setIsReversing(false);
    loadYear(Math.max(0, Math.min(historyRef.current.length - 1, target)));
  };

  // Branch: drop the recorded future beyond the viewed year; later steps use the current params
  const commitBranch = () => {
    setIsPlaying(false);
    setIsReversing(false);
    const t = Math.round(simRef.current.t);
    historyRef.current = historyRef.current.slice(0, t + 1);
    setMassHistory(hist => hist.filter(q => q.time <= t));
  };

  const isPastView = () => Math.round(simRef.current.t) < historyRef.current.length - 1;

  const handlePlayToggle = () => {
    setIsReversing(false);
    if (isPlaying) { setIsPlaying(false); return; }
    if (isPastView()) commitBranch();
    setIsPlaying(true);
  };

  const handlePlayReverseToggle = () => {
    setIsPlaying(false);
    setIsReversing(r => !r);
  };

  const stepForward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    if (isPastView()) commitBranch();
    stepYear();
  };

  const stepBackward = () => {
    setIsPlaying(false);
    setIsReversing(false);
    loadYear(Math.round(simRef.current.t) - 1);
  };

  const getParamDiff = () => {
    const snap = historyRef.current[simTime];
    return snap ? diffSimParams(snap.params, params) : [];
  };

  // --- MONTE CARLO UQ/SA ENGINE (uniform ± ranges; chunked to keep the UI responsive) ---
  const runMonteCarloBatch = () => {
    if (uqRunning) return;
    setUqRunning(true);
    setUqProgress(0);
    setMcResults(null);

    const base = cloneSimParams(params);
    const uni = (v, frac) => v * (1 - frac + 2 * frac * Math.random());
    const realizations = Array.from({ length: mcRunsCount }, (_, id) => ({
      id,
      k_mD: Math.max(1, uni(base.k_mD, kUncertainty)),
      Sgr: Math.min(0.4, Math.max(0, uni(base.Sgr, sgrUncertainty))),
      faults: base.faults.map(f => ({ ...f, Pth_kPa: Math.max(0.5, uni(f.Pth_kPa, faultThreshUncertainty)) }))
    }));
    const results = [];

    const runChunk = start => {
      const end = Math.min(realizations.length, start + 5);
      for (let i = start; i < end; i++) {
        const r = realizations[i];
        const runParams = { ...base, k_mD: r.k_mD, Sgr: r.Sgr, faults: r.faults };
        const m = VE.createModel(runParams);
        const s = VE.advance(m, VE.initState(m), VE_HORIZON_YR);
        const d = VE.diagnose(m, s);
        const immobile = d.layers.reduce((acc, L) => acc + L.residual + L.dissolved, 0);
        results.push({
          id: r.id,
          params: r,
          runParams,
          state: s,
          finalLeaked: kgToMt(d.layers[1].total),
          trappingEfficiency: d.injected > 0 ? (immobile / d.injected) * 100 : 0
        });
      }
      setUqProgress(Math.round((end / realizations.length) * 100));
      if (end < realizations.length) setTimeout(() => runChunk(end), 25);
      else { setUqRunning(false); setMcResults(results); }
    };
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
    let num = 0, denX = 0, denY = 0;
    for (let j = 0; j < M; j++) {
      const ex = xValues[j] - meanX;
      const ey = yValues[j] - meanY;
      num += ex * ey;
      denX += ex * ex;
      denY += ey * ey;
    }
    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
  };

  const metricOf = r => (uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency);
  const metricUnit = uqTargetMetric === 'leaked' ? ' Mt' : '%';
  // Higher leakage is worse; higher immobilisation is better → labels/colours flip with the metric
  const uqBands = uqTargetMetric === 'leaked'
    ? [{ key: 'p10', label: 'P10 (Low leakage)', color: '#64ffda' }, { key: 'p50', label: 'P50 (Expected)', color: '#ffb300' }, { key: 'p90', label: 'P90 (High leakage)', color: '#ff6b6b' }]
    : [{ key: 'p10', label: 'P10 (Low immobilisation)', color: '#ff6b6b' }, { key: 'p50', label: 'P50 (Expected)', color: '#ffb300' }, { key: 'p90', label: 'P90 (High immobilisation)', color: '#64ffda' }];

  // Memoized UQ statistics computations
  const uqData = useMemo(() => {
    if (!mcResults) return null;
    const vals = mcResults.map(metricOf);
    const sorted = [...vals].sort((a, b) => a - b);
    const p10Val = getPercentile(sorted, 10);
    const p50Val = getPercentile(sorted, 50);
    const p90Val = getPercentile(sorted, 90);
    const findClosestRealization = targetVal => {
      let closest = mcResults[0], minDiff = Infinity;
      mcResults.forEach(r => {
        const diff = Math.abs(metricOf(r) - targetVal);
        if (diff < minDiff) { minDiff = diff; closest = r; }
      });
      return closest;
    };
    const minVal = sorted[0];
    const maxVal = sorted[sorted.length - 1];
    const range = maxVal - minVal || 1.0;
    const numBins = 10;
    const binWidth = range / numBins;
    const bins = new Array(numBins).fill(0);
    vals.forEach(v => { bins[Math.max(0, Math.min(numBins - 1, Math.floor((v - minVal) / binWidth)))]++; });
    return {
      vals, sorted, minVal, maxVal, range, bins, binWidth,
      maxBinCount: Math.max(1, ...bins),
      p10Val, p50Val, p90Val,
      p10Realization: findClosestRealization(p10Val),
      p50Realization: findClosestRealization(p50Val),
      p90Realization: findClosestRealization(p90Val)
    };
  }, [mcResults, uqTargetMetric]);

  // Memoized sensitivity correlations
  const sensitivityData = useMemo(() => {
    if (!mcResults) return null;
    const yVals = mcResults.map(metricOf);
    const kCorr = computeCorrelation(mcResults.map(r => r.params.k_mD), yVals);
    const sgrCorr = computeCorrelation(mcResults.map(r => r.params.Sgr), yVals);
    const hasFaults = mcResults[0].params.faults.length > 0;
    const faultCorr = hasFaults
      ? computeCorrelation(mcResults.map(r => r.params.faults.reduce((a, f) => a + f.Pth_kPa, 0) / r.params.faults.length), yVals)
      : 0;
    return [
      { label: 'Permeability (k)', r: kCorr },
      { label: 'Residual CO₂ (S_gr)', r: sgrCorr },
      ...(hasFaults ? [{ label: 'Fault threshold (P_th)', r: faultCorr }] : [])
    ].sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [mcResults, uqTargetMetric]);

  // Load a Monte Carlo realization back into the 2D view (history: year 0 and the final year)
  const loadUQRealization = r => {
    if (!r) return;
    const p = cloneSimParams(r.runParams);
    paramsRef.current = p;
    setParams(p);
    const m = VE.createModel(p);
    const s0 = VE.initState(m);
    historyRef.current = [{ state: s0, params: cloneSimParams(p) }];
    historyRef.current[VE_HORIZON_YR] = { state: r.state, params: cloneSimParams(p) };
    setMassHistory([simMassPoint(VE.diagnose(m, s0), 0), simMassPoint(VE.diagnose(m, r.state), VE_HORIZON_YR)]);
    setIsPlaying(false);
    setIsReversing(false);
    showState(r.state);
    setActiveSubTab('profile');
  };

  // SVG Histogram Renderer
  const renderUQHistogram = data => {
    const width = 450, height = 200;
    const padding = { left: 40, right: 20, top: 20, bottom: 25 };
    const getX = val => padding.left + ((val - data.minVal) / data.range) * (width - padding.left - padding.right);
    const getY = count => height - padding.bottom - (count / data.maxBinCount) * (height - padding.top - padding.bottom);
    const marks = [data.p10Val, data.p50Val, data.p90Val];
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
          const y = getY(data.maxBinCount * ratio);
          return <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="3 3" />;
        })}
        {data.bins.map((count, idx) => {
          const x1 = getX(data.minVal + idx * data.binWidth);
          const x2 = getX(data.minVal + (idx + 1) * data.binWidth);
          const y = getY(count);
          return <rect key={idx} x={x1} y={y} width={Math.max(1, x2 - x1 - 1.5)} height={Math.max(0, height - padding.bottom - y)} fill="rgba(100, 255, 218, 0.22)" stroke="rgba(100, 255, 218, 0.5)" strokeWidth="1" />;
        })}
        {uqBands.map((b, i) => {
          const x = getX(marks[i]);
          return (
            <g key={b.key}>
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke={b.color} strokeWidth="1.5" strokeDasharray="4 3" />
              <circle cx={x} cy={padding.top} r="3.5" fill={b.color} />
              <text x={x} y={padding.top - 5} fill={b.color} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">{b.key.toUpperCase()}</text>
            </g>
          );
        })}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <text x={padding.left} y={height - 8} fill="rgba(255,255,255,0.4)" fontSize="8.5" textAnchor="start" fontFamily="monospace">{data.minVal.toFixed(2)}{metricUnit}</text>
        <text x={width - padding.right} y={height - 8} fill="rgba(255,255,255,0.4)" fontSize="8.5" textAnchor="end" fontFamily="monospace">{data.maxVal.toFixed(2)}{metricUnit}</text>
      </svg>
    );
  };

  // SVG Sensitivity Tornado Renderer
  const renderUQSensitivity = data => {
    const width = 450, height = 200;
    const padding = { left: 140, right: 30, top: 25, bottom: 20 };
    const centerOffset = padding.left + (width - padding.left - padding.right) / 2;
    const halfPlotWidth = (width - padding.left - padding.right) / 2;
    const getX = r => centerOffset + r * halfPlotWidth;
    const barHeight = 24, gap = 16;
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        {[-1.0, -0.5, 0, 0.5, 1.0].map((tick, i) => {
          const x = getX(tick);
          return (
            <g key={i}>
              <line x1={x} y1={padding.top - 5} x2={x} y2={height - padding.bottom} stroke={tick === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.05)'} strokeWidth={tick === 0 ? '1' : '0.5'} strokeDasharray={tick === 0 ? 'none' : '3 3'} />
              <text x={x} y={padding.top - 12} fill="rgba(255,255,255,0.35)" fontSize="8" textAnchor="middle" fontFamily="monospace">{tick > 0 ? `+${tick.toFixed(1)}` : tick.toFixed(1)}</text>
            </g>
          );
        })}
        {data.map((item, idx) => {
          const y = padding.top + idx * (barHeight + gap);
          const xStart = item.r >= 0 ? centerOffset : getX(item.r);
          const xEnd = item.r >= 0 ? getX(item.r) : centerOffset;
          const color = item.r >= 0 ? '#64ffda' : '#ff6b6b';
          const fill = item.r >= 0 ? 'rgba(100, 255, 218, 0.25)' : 'rgba(255, 107, 107, 0.25)';
          return (
            <g key={idx}>
              <text x={padding.left - 10} y={y + barHeight / 2 + 3} fill="rgba(255,255,255,0.85)" fontSize="9.5" textAnchor="end" fontFamily="sans-serif">{item.label}</text>
              <rect x={xStart} y={y} width={Math.max(1, xEnd - xStart)} height={barHeight} fill={fill} stroke={color} strokeWidth="1" rx="3" />
              <text x={item.r >= 0 ? xEnd + 6 : xStart - 6} y={y + barHeight / 2 + 3} fill={color} fontSize="9" fontWeight="bold" textAnchor={item.r >= 0 ? 'start' : 'end'} fontFamily="monospace">{item.r.toFixed(2)}</text>
            </g>
          );
        })}
        <line x1={padding.left} y1={padding.top - 5} x2={padding.left} y2={height - padding.bottom} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>
    );
  };

  // --- Mass-balance chart (one line per category, Mt vs years) ---
  const renderSVGChart = () => {
    const width = 450, height = 210;
    const padding = { left: 45, right: 15, top: 15, bottom: 25 };
    const cur = simMassPoint(diag, simTime);
    const maxVal = Math.max(1, cur.injected, ...massHistory.map(q => q.injected)) * 1.08;
    const getX = t => padding.left + (t / VE_HORIZON_YR) * (width - padding.left - padding.right);
    const getY = v => height - padding.bottom - (v / maxVal) * (height - padding.top - padding.bottom);
    const path = key => massHistory.map((q, i) => `${i ? 'L' : 'M'} ${getX(q.time).toFixed(1)} ${getY(q[key]).toFixed(1)}`).join(' ');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', fontSize: 10.5, padding: '2px 4px' }}>
          {MASS_SERIES.map(sr => (
            <span key={sr.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 2.5, background: sr.color, opacity: sr.dash ? 0.6 : 1 }} />
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{sr.label}:</span>
              <strong style={{ color: sr.color, fontFamily: 'monospace' }}>{cur[sr.key].toFixed(2)} Mt</strong>
            </span>
          ))}
        </div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const y = getY(maxVal * ratio);
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="3 3" />
                <text x={padding.left - 8} y={y + 3} fill="rgba(255,255,255,0.45)" fontSize="8.5" textAnchor="end" fontFamily="monospace">{(maxVal * ratio).toFixed(1)}</text>
              </g>
            );
          })}
          {[0, 200, 400, 600, 800, 1000].map(t => (
            <text key={t} x={getX(t)} y={height - 8} fill="rgba(255,255,255,0.45)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">{t}y</text>
          ))}
          {massHistory.length > 1 && MASS_SERIES.map(sr => (
            <path key={sr.key} d={path(sr.key)} fill="none" stroke={sr.color} strokeWidth="1.8" strokeDasharray={sr.dash} opacity={sr.dash ? 0.6 : 1} />
          ))}
          <line x1={getX(simTime)} y1={padding.top} x2={getX(simTime)} y2={height - padding.bottom} stroke="#64ffda" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.8" />
          <circle cx={getX(simTime)} cy={padding.top} r="3" fill="#64ffda" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>
      </div>
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
                  <button onClick={stepForward} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: simTime < 1000 ? 0.8 : 0.3 }} disabled={simTime >= 1000} title="Step Forward 1 Year">
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

                  {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((m, idx) => {
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
            Sharp-interface Vertical Equilibrium CO₂ storage model in SI units: viscous push from the injector plus buoyant migration, residual-trapping hysteresis, faults with up-fault leakage, spill-point traps and convective dissolution. Mass balance is exact to round-off.
          </p>
        </div>
        
        {/* Preset Button Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 14, backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Synthetic Reservoir Cases</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'default', label: 'Default Case', icon: 'fa-project-diagram' },
              { id: 'dome', label: 'Anticline Dome', icon: 'fa-mountain' },
              { id: 'faultedTrap', label: 'Faulted Trap', icon: 'fa-bolt' },
              { id: 'dipping', label: 'Dipping Layer', icon: 'fa-sliders' },
              { id: 'leakyFault', label: 'Leaky Fault', icon: 'fa-water' },
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
                <button 
                  onClick={() => setActiveSubTab('guide')}
                  style={{
                    background: activeSubTab === 'guide' ? 'rgba(100, 255, 218, 0.08)' : 'none',
                    border: 'none',
                    borderBottom: activeSubTab === 'guide' ? '2px solid #64ffda' : '2px solid transparent',
                    color: activeSubTab === 'guide' ? '#64ffda' : 'rgba(255,255,255,0.6)',
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
                  <i className="fas fa-book" style={{ marginRight: 6 }} /> PDE Methodology Guide
                </button>
              </div>
              <div style={{ paddingRight: 8 }}>
                {activeSubTab === 'profile' ? (
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>Year {simTime} / 1000</span>
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
                    {/* Floating HUD Legend */}
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', maxWidth: '70%',
                      background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
                      padding: '5px 12px', fontSize: 10, color: 'rgba(255,255,255,0.85)',
                      zIndex: 5, pointerEvents: 'none'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#0dfca2' }} /> Mobile CO₂ (S_g = {(1 - params.Swr).toFixed(2)})
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#20c997', border: '1px solid #1a8e8f' }} /> Residual (S_gr = {params.Sgr.toFixed(2)})
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 14, height: 0, borderTop: '2px dashed #64ffda' }} /> Max envelope (h_max)
                      </span>
                      {params.fringeOn && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(180deg, #20c997, #1a8e8f, #0a2a4d)', border: '1px solid #20c997' }} /> Capillary fringe (h_c = {model.hc.toFixed(1)} m)
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 14, height: 0, borderTop: '1px dashed rgba(255,255,255,0.6)' }} /> Spill depth · trap fill
                      </span>
                    </div>

                    <CrossSection model={model} diag={diag} simTime={simTime} isPlaying={isPlaying} />

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
                         <option value="leaked">CO\u2082 leaked to upper layer (Mt)</option>
                         <option value="trapped">Immobilised: residual + dissolved (%)</option>
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
                          Uncertainty Distribution ({uqTargetMetric === 'leaked' ? 'CO\u2082 leaked to upper layer' : 'Immobilised fraction'})
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
                        {uqBands.map(b => (
                          <div key={b.key} style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 9.5, color: b.color, fontWeight: 'bold' }}>{b.label}</div>
                              <div style={{ fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace', marginTop: 2 }}>
                                {uqData[`${b.key}Val`].toFixed(2)}{metricUnit}
                              </div>
                            </div>
                            <button
                              onClick={() => loadUQRealization(uqData[`${b.key}Realization`])}
                              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${b.color}`, color: b.color, padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                            >
                              Load Model
                            </button>
                          </div>
                        ))}
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
            <div style={SIM_PANEL_STYLE}>
              <h3 style={SIM_PANEL_TITLE}>Simulation Parameters</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ControlGroup title="Caprock Geometry">
                  <Slider label="Regional dip (+ deeper →)" val={`${params.dipPct}%`} min="-3" max="3" step="0.1" value={params.dipPct} onChange={v => setP('dipPct', parseFloat(v))} />
                  <Slider label="Fold amplitude" val={`${params.foldAmp} m`} min="0" max="60" step="1" value={params.foldAmp} onChange={v => setP('foldAmp', parseFloat(v))} />
                  <Slider label="Fold count" val={params.foldCount} min="0.5" max="4" step="0.5" value={params.foldCount} onChange={v => setP('foldCount', parseFloat(v))} />
                  <Slider label="Aquifer thickness H" val={`${params.H} m`} min="10" max="100" step="5" value={params.H} onChange={v => setP('H', parseFloat(v))} />
                </ControlGroup>

                <ControlGroup title="Rock & Fluids">
                  <Slider label="Permeability k" val={`${params.k_mD} mD`} min="10" max="3000" step="10" value={params.k_mD} onChange={v => setP('k_mD', parseFloat(v))} />
                  <Slider label="Porosity φ" val={params.phi.toFixed(2)} min="0.05" max="0.35" step="0.01" value={params.phi} onChange={v => setP('phi', parseFloat(v))} />
                  <Slider label="Residual brine S_wr" val={params.Swr.toFixed(2)} min="0.05" max="0.4" step="0.01" value={params.Swr} onChange={v => setP('Swr', parseFloat(v))} />
                  <Slider label="Residual CO₂ S_gr" val={params.Sgr.toFixed(2)} min="0" max="0.4" step="0.01" value={params.Sgr} onChange={v => setP('Sgr', parseFloat(v))} />
                  <Slider label="Density contrast Δρ" val={`${params.dRho} kg/m³`} min="100" max="600" step="10" value={params.dRho} onChange={v => setP('dRho', parseFloat(v))} />
                  <Slider label="Mobility ratio M" val={params.M.toFixed(1)} min="1" max="20" step="0.5" value={params.M} onChange={v => setP('M', parseFloat(v))} />
                </ControlGroup>

                <ControlGroup
                  title="Capillary Fringe (display)"
                  right={
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, cursor: 'pointer', color: params.fringeOn ? '#64ffda' : 'rgba(255,255,255,0.5)' }}>
                      <input type="checkbox" checked={params.fringeOn} onChange={e => setP('fringeOn', e.target.checked)} style={{ accentColor: '#64ffda' }} />
                      Enable fringe
                    </label>
                  }
                >
                  {params.fringeOn && (
                    <Slider label="Entry pressure P_e" val={`${params.Pe_kPa} kPa · h_c ${model.hc.toFixed(1)} m`} min="1" max="40" step="1" value={params.Pe_kPa} onChange={v => setP('Pe_kPa', parseFloat(v))} />
                  )}
                </ControlGroup>

                <ControlGroup title="Injection & Domain" last>
                  <Slider label="Injection rate" val={`${params.Q_Mtpa} Mt/yr`} min="0" max="5" step="0.1" value={params.Q_Mtpa} onChange={v => setP('Q_Mtpa', parseFloat(v))} />
                  <Slider label="Injection period" val={`${params.injYears} yr`} min="5" max="200" step="5" value={params.injYears} onChange={v => setP('injYears', parseFloat(v))} />
                  <Slider label="Well position" val={`${Math.round(params.wellFrac * 100)}%`} min="0.1" max="0.9" step="0.05" value={params.wellFrac} onChange={v => setP('wellFrac', parseFloat(v))} />
                  <Slider label="Slab width W" val={`${(params.W / 1000).toFixed(1)} km`} min="1000" max="20000" step="500" value={params.W} onChange={v => setP('W', parseFloat(v))} />
                  <Slider label="Grid cells (resets)" val={params.nx} min="50" max="300" step="10" value={params.nx} onChange={v => setP('nx', parseInt(v, 10))} />
                  <Slider label="Dissolution rate" val={`${params.dissMult.toFixed(1)}×`} min="0" max="3" step="0.1" value={params.dissMult} onChange={v => setP('dissMult', parseFloat(v))} />
                </ControlGroup>
              </div>
            </div>

            {/* Fault Management Control Panel */}
            <div style={SIM_PANEL_STYLE}>
              <h3 style={SIM_PANEL_TITLE}>Fault Management</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 15 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Active Faults:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2, 3].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => setFaultCount(cnt)}
                      aria-pressed={faultCount === cnt}
                      style={{
                        background: faultCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${faultCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
                        color: faultCount === cnt ? '#64ffda' : 'azure',
                        padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 'bold', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {faultCount > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {params.faults.map((f, idx) => {
                    const mf = model.faults[idx];
                    const jux = Math.max(0, params.H - Math.abs(f.throw_m)) / params.H;
                    return (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 'bold', color: f.sealed ? '#64ffda' : '#ff6b6b' }}>Fault {String.fromCharCode(65 + idx)}</span>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, cursor: 'pointer' }}>
                            <input type="checkbox" checked={f.sealed} onChange={e => setFault(idx, 'sealed', e.target.checked)} style={{ accentColor: '#64ffda' }} />
                            Sealed (no flow, no leak)
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <Slider label="Position" val={`${Math.round(f.xFrac * 100)}%`} min="0.05" max="0.95" step="0.01" value={f.xFrac} onChange={v => setFault(idx, 'xFrac', parseFloat(v))} />
                          <Slider label="Throw (+ down to right)" val={`${f.throw_m} m`} min="-80" max="80" step="1" value={f.throw_m} onChange={v => setFault(idx, 'throw_m', parseFloat(v))} />
                          <Slider label="Lateral T (fault rock)" val={f.Trock.toFixed(2)} min="0" max="1" step="0.05" value={f.Trock} onChange={v => setFault(idx, 'Trock', parseFloat(v))} />
                          <Slider label="Threshold P_th" val={`${f.Pth_kPa} kPa · h_th ${mf.hth.toFixed(1)} m`} min="1" max="200" step="1" value={f.Pth_kPa} onChange={v => setFault(idx, 'Pth_kPa', parseFloat(v))} />
                          <Slider label="Fault permeability k_f" val={`${f.kf_mD} mD`} min="0" max="500" step="1" value={f.kf_mD} onChange={v => setFault(idx, 'kf_mD', parseFloat(v))} />
                          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', alignSelf: 'end' }}>
                            Sand-on-sand overlap {Math.round(jux * 100)}%{jux === 0 ? ' · juxtaposition seal' : ''}
                          </div>
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
          <div style={{ ...SIM_PANEL_STYLE, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ ...SIM_PANEL_TITLE, margin: 0 }}>CO₂ Mass Balance</h3>
              <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>Values in Mt</span>
            </div>

            {renderSVGChart()}

            {(() => {
              const cur = simMassPoint(diag, simTime);
              const pct = v => (cur.injected > 0 ? (v / cur.injected) * 100 : 0);
              // step flags describe the last simulated year; a sealed-in well is a standing geometry condition
              const flags = Object.keys({ ...diag.flags, ...(model.injectionBlocked && params.Q_Mtpa > 0 ? { injectionBlocked: true } : {}) });
              const balOk = Math.abs(diag.balanceError) < 1e-9;
              return (
                <React.Fragment>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
                    {MASS_SERIES.map(sr => (
                      <StatBox key={sr.key} label={sr.label} value={cur[sr.key].toFixed(2)} color={sr.color} opacity={sr.dash ? 0.6 : 1} />
                    ))}
                    <StatBox label="Balance error" value={balOk ? '< 1e-9' : diag.balanceError.toExponential(1)} color={balOk ? '#64ffda' : '#ff6b6b'} />
                  </div>

                  {flags.length > 0 && (
                    <div role="status" style={{ fontSize: 11, color: '#ffb300', background: 'rgba(255,179,0,0.08)', border: '1px solid rgba(255,179,0,0.3)', borderRadius: 8, padding: '6px 10px' }}>
                      <i className="fas fa-exclamation-triangle" /> {flags.map(f => SIM_FLAG_TEXT[f] || f).join(' · ')}
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>Fate of injected CO₂</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                      <ProgressBar label="Structurally trapped" pct={pct(cur.structural)} color="#64ffda" />
                      <ProgressBar label="Residually trapped" pct={pct(cur.residual)} color="#3ca68e" />
                      <ProgressBar label="Dissolved in brine" pct={pct(cur.dissolved)} color="#4dabf7" />
                      <ProgressBar label="Leaked to upper layer" pct={pct(cur.upper)} color="#ffb300" />
                    </div>
                  </div>

                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                    {Math.round(sim.substepsLastYear)} substeps/yr · {model.layers[0].traps.length} trap(s) in storage aquifer
                  </div>
                </React.Fragment>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Titled two-column group of sliders inside a panel
const ControlGroup = ({ title, right, children, last }) => (
  <div style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)', paddingBottom: last ? 0 : 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold' }}>{title}</span>
      {right}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>{children}</div>
  </div>
);

// Reservoir cross-section: metres → SVG viewBox 1000×450 (bottom 78 px sit under the time bar).
// Depth axis is exaggerated to fit; the V.E. factor is printed top-right.
const CrossSection = ({ model, diag, simTime, isPlaying }) => {
  const VW = 1000, VH = 450, top = 34, bottom = 78;
  const { nx, dx, p, layers, faults } = model;
  const [L0, L1] = layers;
  const zMin = Math.min(...L1.zt) - 15;
  const zMax = Math.max(...L0.zt) + L0.H + 15;
  const plotH = VH - top - bottom;
  const X = x => (x / p.L) * VW;
  const Y = z => top + ((z - zMin) / (zMax - zMin)) * plotH;
  const vExag = (p.L / VW) / ((zMax - zMin) / plotH);

  const stepFaces = l => new Set(faults.filter(f => f.throw_m !== 0).map(f => (l === 0 ? f.lowerFace : f.upperFace)));
  const st0 = stepFaces(0), st1 = stepFaces(1), none = new Set();
  // Face-node points of a per-cell depth array over faces [f0, f1]; a vertical step at fault faces keeps throws crisp
  const nodes = (vals, st, f0, f1) => {
    const pts = [];
    for (let f = f0; f <= f1; f++) {
      const x = X(f * dx).toFixed(1);
      if (f === 0) pts.push(`${x},${Y(vals[0]).toFixed(1)}`);
      else if (f === nx) pts.push(`${x},${Y(vals[nx - 1]).toFixed(1)}`);
      else if (st.has(f)) pts.push(`${x},${Y(vals[f - 1]).toFixed(1)}`, `${x},${Y(vals[f]).toFixed(1)}`);
      else pts.push(`${x},${Y(0.5 * (vals[f - 1] + vals[f])).toFixed(1)}`);
    }
    return pts;
  };
  const band = (topV, topSt, botV, botSt, f0 = 0, f1 = nx) =>
    'M' + nodes(topV, topSt, f0, f1).concat(nodes(botV, botSt, f0, f1).reverse()).join(' L') + ' Z';
  const line = (vals, st, f0, f1) => 'M' + nodes(vals, st, f0, f1).join(' L');
  const plus = (a, b) => a.map((v, i) => v + (typeof b === 'number' ? b : b[i]));
  const flat = z => new Float64Array(nx).fill(z);

  const plume = (l, L, st) => {
    const dl = diag.layers[l];
    let i0 = -1, i1 = -1;
    for (let i = 0; i < nx; i++) if (dl.hmax[i] > 1e-3 || dl.h[i] > 1e-3) { if (i0 < 0) i0 = i; i1 = i; }
    if (i0 < 0) return null;
    const f0 = Math.max(0, i0 - 1), f1 = Math.min(nx, i1 + 2);
    const zH = plus(L.zt, dl.h), zHmax = plus(L.zt, dl.hmax);
    const zFr = L.zt.map((z, i) => z + Math.min(L.H, VE.fringeBase(model, dl.h[i])));
    return (
      <g key={`plume-${l}`}>
        <path d={band(zH, st, zHmax, st, f0, f1)} fill="url(#residual-trapped-sim-grad)" opacity="0.92" />
        {p.fringeOn && <path d={band(zH, st, zFr, st, f0, f1)} fill="url(#fringe-sim-grad)" opacity="0.9" />}
        <path d={band(L.zt, st, zH, st, f0, f1)} fill="url(#active-mobile-sim-grad)" opacity="0.98" />
        <path d={line(zHmax, st, f0, f1)} fill="none" stroke="#64ffda" strokeWidth="1.2" strokeDasharray="5 3.5" opacity="0.8" />
      </g>
    );
  };

  const traps = [0, 1].map(l => diag.layers[l].traps
    .filter(t => Number.isFinite(t.spill) && t.capacity > 1e8)
    .map((t, i) => (
      <g key={`trap-${l}-${i}`}>
        <line x1={X(t.lo * dx)} y1={Y(t.spill)} x2={X((t.hi + 1) * dx)} y2={Y(t.spill)} stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" strokeDasharray="2 3" />
        <text x={X((t.crest + 0.5) * dx)} y={Y(t.spill) + 11} fill="rgba(255,255,255,0.65)" fontSize="9" textAnchor="middle" fontFamily="monospace">
          {`spill · ${Math.round(t.fill * 100)}% of ${kgToMt(t.capacity).toFixed(1)} Mt`}
        </text>
      </g>
    )));

  const faultMarks = faults.map((f, i) => {
    const iL = f.lowerFace - 1, iR = f.lowerFace;
    const zRef = 0.5 * (L0.zt[iL] + L0.zt[iR]);
    const xAt = z => f.lowerFace * dx + f.dipSlope * (z - zRef);
    const hLo = diag.layers[0].h;
    const leaking = f.cond > 0 && (hLo[iL] > f.hth || hLo[iR] > f.hth);
    const color = f.sealed ? 'rgba(255,255,255,0.35)' : leaking ? '#ff6b6b' : 'rgba(255,107,107,0.55)';
    const zUpperBase = 0.5 * (L1.zt[f.upperFace - 1] + L1.zt[f.upperFace]) + L1.H;
    return (
      <g key={`fault-${i}`}>
        <line x1={X(xAt(zMin - 40))} y1={Y(zMin - 40)} x2={X(xAt(zMax + 40))} y2={Y(zMax + 40)} stroke={color} strokeWidth="1.3" strokeDasharray="4 3" />
        <text x={X(xAt(zMin)) + 4} y={top - 8} fill={color} fontSize="10" fontFamily="monospace">{String.fromCharCode(65 + i)}</text>
        {leaking && isPlaying && (
          <line x1={X(xAt(zRef))} y1={Y(zRef)} x2={X(xAt(zUpperBase))} y2={Y(zUpperBase)} stroke="#ff6b6b" strokeWidth="2.5" strokeDasharray="4 3" style={{ animation: 'conduitFlow 1s linear infinite' }} />
        )}
      </g>
    );
  });

  const xw = X(model.xc[model.well]);
  const zw = L0.zt[model.well];
  const injecting = p.Q_Mtpa > 0 && simTime < p.injYears && !model.injectionBlocked;
  const depthTicks = [];
  for (let z = Math.ceil(zMin / 50) * 50; z <= zMax; z += 50) depthTicks.push(z);
  const kmTicks = [];
  for (let x = 0; x <= p.L; x += 5000) kmTicks.push(x);
  const label = (text, z) => (
    <text x={X(300)} y={Y(z) + 3} fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="0.1em" fontFamily="monospace">{text}</text>
  );

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }} role="img" aria-label={`Reservoir cross-section at year ${simTime}`}>
      <defs>
        <linearGradient id="active-mobile-sim-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0dfca2" stopOpacity="0.98" />
          <stop offset="45%" stopColor="#0dfca2" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#05e67c" stopOpacity="0.92" />
          <stop offset="88%" stopColor="#20c997" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#1a8e8f" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="residual-trapped-sim-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#20c997" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#20c997" stopOpacity="0.75" />
          <stop offset="75%" stopColor="#1a8e8f" stopOpacity="0.65" />
          <stop offset="92%" stopColor="#125672" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0a2a4d" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="fringe-sim-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#20c997" stopOpacity="0.80" />
          <stop offset="50%" stopColor="#1a8e8f" stopOpacity="0.60" />
          <stop offset="85%" stopColor="#125672" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0a2a4d" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="brine-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2a4d" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#051426" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="well-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#222" />
          <stop offset="50%" stopColor="#ccc" />
          <stop offset="100%" stopColor="#222" />
        </linearGradient>
      </defs>

      {/* Strata: overburden, upper aquifer, caprock, storage aquifer, underburden */}
      <path d={band(flat(zMin - 400), none, L1.zt, st1)} fill="#211a2b" />
      <path d={band(L1.zt, st1, plus(L1.zt, L1.H), st1)} fill="#2e2219" />
      <path d={band(L1.zt, st1, plus(L1.zt, L1.H), st1)} fill="url(#brine-grad)" opacity="0.85" />
      <path d={band(plus(L1.zt, L1.H), st1, L0.zt, st0)} fill="#282030" />
      <path d={band(L0.zt, st0, plus(L0.zt, L0.H), st0)} fill="#2e2219" />
      <path d={band(L0.zt, st0, plus(L0.zt, L0.H), st0)} fill="url(#brine-grad)" opacity="0.85" />
      <path d={band(plus(L0.zt, L0.H), st0, flat(zMax + 400), none)} fill="#1a1422" />

      {label('UPPER AQUIFER', L1.zt[3] + L1.H / 2)}
      {label('CAPROCK', 0.5 * (L1.zt[3] + L1.H + L0.zt[3]))}
      {label('STORAGE AQUIFER', L0.zt[3] + L0.H / 2)}

      {plume(1, L1, st1)}
      {plume(0, L0, st0)}
      {traps}
      {faultMarks}

      {/* Injector */}
      <line x1={xw} y1="0" x2={xw} y2={Y(zw + 0.85 * L0.H)} stroke="url(#well-gradient)" strokeWidth="4" />
      {injecting && <circle cx={xw} cy={Y(zw + 0.5 * L0.H)} r="9" fill="rgba(100,255,218,0.25)" style={{ animation: 'pulseFlare 1.5s infinite' }} />}

      {/* Axes */}
      {depthTicks.map(z => (
        <text key={`d${z}`} x="4" y={Y(z) + 3} fill="rgba(255,255,255,0.35)" fontSize="8.5" fontFamily="monospace">{z} m</text>
      ))}
      {kmTicks.map(x => (
        <text key={`x${x}`} x={Math.min(VW - 4, Math.max(4, X(x)))} y={Y(zMax) + 12} fill="rgba(255,255,255,0.35)" fontSize="8.5" textAnchor={x === 0 ? 'start' : x === p.L ? 'end' : 'middle'} fontFamily="monospace">{x / 1000} km</text>
      ))}
      <text x={VW - 8} y={top - 10} fill="rgba(255,255,255,0.45)" fontSize="9" textAnchor="end" fontFamily="monospace">V.E. ≈ {Math.round(vExag)}×</text>
    </svg>
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

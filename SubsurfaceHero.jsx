// SubsurfaceHero.jsx — landing hero as a CO2 storage cross-section.
// Strict layout: sky (top 42vh) holds the identity, subsurface (58vh) holds
// the cross-section. They never overlap.

const { useEffect, useMemo, useRef, useState } = React;

/* =====================================================
   Physical Cap Rock & VE Numerical PDE Solver
   ===================================================== */

// Generate randomized faults with opposing slopes (random angles 0° to 20° from vertical) and guaranteed non-crossing spacing
const generateRandomizedFaults = () => {
  const count = 2; // Always exactly 2 faults
  const faultsList = [];
  
  // Random slope angles between 0° (purely vertical) and 20° from vertical
  // tan(deg * PI / 180): tan(0°) = 0.0, tan(20°) ≈ 0.364
  const angleDeg1 = Math.random() * 20.0; // 0° to 20°
  const angleDeg2 = Math.random() * 20.0; // 0° to 20°
  const slopeMag1 = parseFloat(Math.tan(angleDeg1 * Math.PI / 180.0).toFixed(3)); // 0.000 to 0.364
  const slopeMag2 = parseFloat(Math.tan(angleDeg2 * Math.PI / 180.0).toFixed(3)); // 0.000 to 0.364

  // Opposing slopes: Fault 1 and Fault 2 tilt in opposite directions
  // 65% outward divergent (Horst), 35% inward convergent (Graben with guaranteed non-crossing buffer)
  const isDivergent = Math.random() < 0.65;
  
  let dipSlope1 = isDivergent ? -slopeMag1 : slopeMag1;
  let dipSlope2 = isDivergent ? slopeMag2 : -slopeMag2;

  let xPct1, xPct2;
  if (isDivergent) {
    xPct1 = Math.floor(Math.random() * (32 - 18 + 1)) + 18; // 18% to 32%
    xPct2 = Math.floor(Math.random() * (54 - 44 + 1)) + 44; // 44% to 54%
  } else {
    // For converging faults, guarantee at least 80px clearance at bottom (y = 580)
    xPct1 = Math.floor(Math.random() * (22 - 14 + 1)) + 14; // 14% to 22%
    const minX2ForDepth = Math.ceil((xPct1 * 10 + (dipSlope1 - dipSlope2) * 580 + 80) / 10);
    const minX2 = Math.max(46, minX2ForDepth);
    const maxX2 = 54;
    xPct2 = minX2 <= maxX2 ? (Math.floor(Math.random() * (maxX2 - minX2 + 1)) + minX2) : 54;
    if ((xPct2 * 10 + dipSlope2 * 580) - (xPct1 * 10 + dipSlope1 * 580) < 60) {
      dipSlope1 = -slopeMag1;
      dipSlope2 = slopeMag2;
    }
  }

  const thresholdHeight1 = parseFloat((Math.random() * 0.4 + 0.15).toFixed(2));
  const leakRate1 = parseFloat((Math.random() * 0.18 + 0.08).toFixed(2));

  const thresholdHeight2 = parseFloat((Math.random() * 0.4 + 0.15).toFixed(2));
  const leakRate2 = parseFloat((Math.random() * 0.18 + 0.08).toFixed(2));

  faultsList.push({
    xPercent: xPct1,
    thresholdHeight: thresholdHeight1,
    leakRate: leakRate1,
    dipSlope: dipSlope1,
    angleDeg: parseFloat(angleDeg1.toFixed(1))
  });

  faultsList.push({
    xPercent: xPct2,
    thresholdHeight: thresholdHeight2,
    leakRate: leakRate2,
    dipSlope: dipSlope2,
    angleDeg: parseFloat(angleDeg2.toFixed(1))
  });

  faultsList.sort((a, b) => a.xPercent - b.xPercent);
  return faultsList;
};

// Procedurally generates realistic, physically bounded random geology for every refresh
const generateRandomGeology = () => {
  const faults = generateRandomizedFaults();
  
  // Broad visual ranges in SVG units; keep the full reservoir inside the section.
  const dipSlope = parseFloat((0.025 + Math.random() * 0.085).toFixed(3));
  const baseDepth = parseFloat((110 + Math.random() * 45).toFixed(1));
  
  // Broad gentle folds through shorter, more pronounced anticlines.
  const amp1 = parseFloat((12 + Math.random() * 20).toFixed(1));
  const lambda1 = parseFloat((120 + Math.random() * 150).toFixed(1));
  const phase1 = parseFloat(((Math.random() - 0.5) * 180).toFixed(1));
  
  // Smaller folds retain texture without obscuring the larger structures.
  const amp2 = parseFloat((5 + Math.random() * 7).toFixed(1));
  const lambda2 = parseFloat((65 + Math.random() * 55).toFixed(1));
  
  // Micro-topography.
  const amp3 = parseFloat((2 + Math.random() * 3).toFixed(1));
  const lambda3 = parseFloat((40 + Math.random() * 12).toFixed(1));
  
  // Fault throw offset step.
  const faultThrow = parseFloat((12 + Math.random() * 8).toFixed(1));
  
  // Thin sandstone beds through thick storage formations (previously 175–205).
  const reservoirThickness = parseFloat((100 + Math.random() * 150).toFixed(1));
  // Keep a seal between the shallow bed and the primary reservoir, even at fold crests.
  const shallowThickness = Math.min(25 + Math.random() * 25,
    0.6 * (baseDepth - amp1 - amp2 - amp3) - 0.4 * faultThrow - 8);
  // Spacing also clears the fault throws, so the decorative beds cannot cross.
  const capLayerDepths = [0.55 + Math.random() * 0.03, 0.28 + Math.random() * 0.07, 0.06 + Math.random() * 0.04];
  const aquiferLayerOffsets = [90 + Math.random() * 12, 176 + Math.random() * 16, 256 + Math.random() * 12];
  
  // 7. Sandstone permeability & trapping petrophysics
  const K = parseFloat((1.15 + Math.random() * 0.35).toFixed(2)); // 1.15 to 1.50 D
  const R = parseFloat((0.24 + Math.random() * 0.07).toFixed(2)); // 0.24 to 0.31 Sgr
  const Q = parseFloat((3.40 + Math.random() * 0.60).toFixed(2)); // 3.40 to 4.00
  
  // 8. Injection well surface location (68% to 72% across the cross-section)
  const wellXPct = 68 + Math.floor(Math.random() * 5); // 68, 69, 70, 71, or 72%
  const wellX = wellXPct * 10;
  const wellCellIdx = Math.round(wellX / 5.0); // cell ~136 to 144
  
  return {
    faults,
    dipSlope,
    baseDepth,
    amp1, lambda1, phase1,
    amp2, lambda2,
    amp3, lambda3,
    faultThrow,
    reservoirThickness,
    shallowThickness,
    capLayerDepths,
    aquiferLayerOffsets,
    thicknessWavelength: 650 + Math.random() * 350,
    reservoirThicknessPhase: Math.random() * 2 * Math.PI,
    capThicknessPhase: Math.random() * 2 * Math.PI,
    aquiferThicknessPhase: Math.random() * 2 * Math.PI,
    K, R, Q,
    wellXPct,
    wellX,
    wellCellIdx,
  };
};

let currentGeology = generateRandomGeology();
const randomizedFaults = currentGeology.faults;

const { capRockBaseProfile, stratumBaseProfile, getStratumFaultIntersection,
  getFaultIntersection, stratumY, capRockY, layerThicknessAt, balanceFaultContact } = HeroGeology;

// Numerical PDE Simulator: solves explicit Finite Volume VE equations for CO2 gravity tongue (200-cell high-definition grid)
const precomputeSimulation = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = 201; // 201 nodes / 200 cells (width dx = 5.0px each from x = 0 to 1000px)
  const history = [];
  
  let h = new Array(N).fill(0); // plume thickness, initially 0
  let hMax = new Array(N).fill(0); // maximum plume thickness reached
  
  let h2 = new Array(N).fill(0); // secondary reservoir plume
  let h2Max = new Array(N).fill(0);
  
  const totalFrames = 1000; // 1000 years of simulation and long-term post-migration trapping
  const substeps = 10;
  const dt = 0.020;
  
  const K = g.K; // Permeability
  const R = g.R; // Residual trapping coefficient
  const Q = g.Q; // Sustained injection rate
  const wellCell = g.wellCellIdx;
  const primaryMax = Array.from({ length: N }, (_, i) => layerThicknessAt(i * 5, 1, flts, i, g) / 15);
  const secondaryMax = Array.from({ length: N }, (_, i) => layerThicknessAt(i * 5, 0.4, flts, i, g) / 15);
  const faces = depth => Array.from({ length: N - 1 }, (_, i) => [
    capRockY(i * 5, flts, i, depth, g) / 15,
    capRockY((i + 1) * 5, flts, i + 1, depth, g) / 15,
  ]);
  const primaryFaces = faces(1), secondaryFaces = faces(0.4);
  const faultCells = flts.map(f => [1, 0.4].map(depth =>
    Math.max(0, Math.min(N - 1, Math.round(getFaultIntersection(f, depth, g).x / 5)))));
  const faultRoofs = faultCells.map(cells => [1, 0.4].map((depth, j) => {
    const k = cells[j];
    return [k, capRockY(k * 5, flts, k - 1, depth, g) / 15,
      capRockY(k * 5, flts, k, depth, g) / 15];
  }));
  const balanceFaults = (heights, limits, layer) => faultRoofs.forEach(contacts => {
    const [k, left, right] = contacts[layer];
    if (k > 0 && k < N) balanceFaultContact(heights, k - 1, k, left, right, limits[k - 1], limits[k]);
  });
  const faultFlow = flts.map(() => 0);
  
  for (let frame = 0; frame <= totalFrames; frame++) {
    history.push({
      h: [...h],
      hMax: [...hMax],
      h2: [...h2],
      h2Max: [...h2Max],
      faultFlow: [...faultFlow],
    });
    faultFlow.fill(0);
    
    // Explicit finite volume flux updates (VE gravity tongue flow)
    for (let step = 0; step < substeps; step++) {
      // --- PRIMARY RESERVOIR (h) ---
      const hMob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = h[i];
        const hm = hMax[i];
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        hMob[i] = Math.min(H, mobileVal);
      }
      
      const fluxes = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const [ztL, ztR] = primaryFaces[i];
        
        const zL = ztL + h[i];
        const zR = ztR + h[i + 1];
        
        const grad = zR - zL;
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i];
        
        fluxes[i] = -K * hFace * grad;
      }
      
      // Closed far-field boundaries (preserves CO2 in the regional geological trap)
      const nextH = [...h];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        nextH[i] = Math.max(0, Math.min(primaryMax[i], h[i] + dt * (fL - fR)));
      }
      balanceFaults(nextH, primaryMax, 0);
      
      // Fault capillary seal breaching and leakage
      const leaks = new Array(flts.length).fill(0);
      for (let idx = 0; idx < flts.length; idx++) {
        const f = flts[idx];
        const boundedIdx = faultCells[idx][0];
        
        // Leakage occurs only if CO2 column height exceeds entry threshold
        if (nextH[boundedIdx] > f.thresholdHeight) {
          const overpressure = nextH[boundedIdx] - f.thresholdHeight;
          const leak = Math.min(overpressure, f.leakRate * dt);
          nextH[boundedIdx] -= leak;
          leaks[idx] = leak;
          faultFlow[idx] += leak / (dt * substeps);
        }
      }
      
      // Sustained injection during the first 320 frames centered on wellbore
      if (frame <= 320) {
        if (wellCell >= 2 && wellCell <= N - 3) {
          nextH[wellCell - 2] = Math.min(primaryMax[wellCell - 2], nextH[wellCell - 2] + Q * dt * 0.15);
          nextH[wellCell - 1] = Math.min(primaryMax[wellCell - 1], nextH[wellCell - 1] + Q * dt * 0.25);
          nextH[wellCell]     = Math.min(primaryMax[wellCell], nextH[wellCell]     + Q * dt * 0.40);
          nextH[wellCell + 1] = Math.min(primaryMax[wellCell + 1], nextH[wellCell + 1] + Q * dt * 0.25);
          nextH[wellCell + 2] = Math.min(primaryMax[wellCell + 2], nextH[wellCell + 2] + Q * dt * 0.15);
        }
      }
      
      h = nextH.map((val, i) => Math.max(0, Math.min(primaryMax[i], val)));
      for (let i = 0; i < N; i++) {
        if (h[i] > hMax[i]) hMax[i] = Math.min(primaryMax[i], h[i]);
      }
      
      // --- SECONDARY RESERVOIR (h2) ---
      const h2Mob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = h2[i];
        const hm = h2Max[i];
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        h2Mob[i] = Math.min(H, mobileVal);
      }
      
      const fluxes2 = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const [ztL, ztR] = secondaryFaces[i];
        
        const zL = ztL + h2[i];
        const zR = ztR + h2[i + 1];
        
        const grad = zR - zL;
        const hFace = grad > 0 ? h2Mob[i + 1] : h2Mob[i];
        
        fluxes2[i] = -K * hFace * grad;
      }
      
      const nextH2 = [...h2];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes2[i - 1];
        const fR = i === N - 1 ? 0 : fluxes2[i];
        nextH2[i] = Math.max(0, Math.min(secondaryMax[i], h2[i] + dt * (fL - fR)));
      }
      
      // Inject leaked mass from primary into secondary fault locations
      for (let idx = 0; idx < flts.length; idx++) {
        const boundedIdx2 = faultCells[idx][1];
        nextH2[boundedIdx2] = Math.min(secondaryMax[boundedIdx2], nextH2[boundedIdx2] + leaks[idx] * 1.5);
      }
      balanceFaults(nextH2, secondaryMax, 1);
      
      h2 = nextH2.map((val, i) => Math.max(0, Math.min(secondaryMax[i], val)));
      for (let i = 0; i < N; i++) {
        if (h2[i] > h2Max[i]) h2Max[i] = Math.min(secondaryMax[i], h2[i]);
      }
    }
  }
  return history;
};

// Generic node-based smooth polygon builder with exact fault-stepping (200-cell high-definition grid)
const buildSmoothRibbonPath = (topElevationFn, botElevationFn, kStart, kEnd, faults = currentGeology.faults, depthMultiplier = 1.0, geo = currentGeology) => {
  if (kStart > kEnd) return "";
  const dx = 5.0;
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  
  // 1. Top boundary: left-to-right from kStart to kEnd
  let path = "";
  for (let k = kStart; k <= kEnd; k++) {
    const x = k * dx;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    
    if (k === kStart) {
      const y0 = topElevationFn(k, isFault ? 'right' : 'avg');
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yL = topElevationFn(k, 'left');
      const yR = topElevationFn(k, 'right');
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const y = topElevationFn(k, 'avg');
      path += ` L ${x} ${y}`;
    }
  }
  
  // 2. Bottom boundary: right-to-left from kEnd down to kStart
  for (let k = kEnd; k >= kStart; k--) {
    const x = k * dx;
    const bedOffset = depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness;
    const isFault = k > 0 && k < 200 && (
      Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1 ||
      Math.abs(stratumY(x, flts, k - 1, depthMultiplier, bedOffset, g) - stratumY(x, flts, k, depthMultiplier, bedOffset, g)) > 0.1);
    
    if (isFault) {
      const yR = botElevationFn(k, 'right');
      const yL = botElevationFn(k, 'left');
      path += ` L ${x} ${yR} L ${x} ${yL}`;
    } else {
      const y = botElevationFn(k, 'avg');
      path += ` L ${x} ${y}`;
    }
  }
  
  path += " Z";
  return path;
};

// Clip both edges of each reservoir, including displaced floor intersections.
const getReservoirClipPath = (depth, faults, g) => buildSmoothRibbonPath(
  (k, side) => capRockY(k * 5, faults, side === 'left' ? k - 1 : k, depth, g),
  (k, side) => stratumY(k * 5, faults, side === 'left' ? k - 1 : k, depth,
    depth < 0.5 ? g.shallowThickness : g.reservoirThickness, g),
  0, 200, faults, depth, g);

// Heights belong to nodes; left/right choose the cell adjoining a fault.
const getNodeValue = (arr, k, side = 'avg') => {
  if (!arr) return 0;
  const N = arr.length;
  if (k <= 0) return arr[0];
  if (k >= N) return arr[N - 1];
  if (side === 'left') return arr[k - 1];
  if (side === 'right') return arr[k];
  return arr[k];
};

// Helper to find the active continuous domain with sub-grid zero-tapered tip nodes
const getPlumeActiveBounds = (nodeValueFn, N, eps = 0.001) => {
  let kFirst = -1, kLast = -1;
  for (let k = 0; k <= N; k++) {
    const val = nodeValueFn(k);
    if (val > eps) {
      if (kFirst === -1) kFirst = k;
      kLast = k;
    }
  }
  if (kFirst === -1) return null;
  // Extend by 1 node on left and right so plume thickness smoothly tapers to 0.000px
  const kStart = Math.max(0, kFirst - 1);
  const kEnd = Math.min(N, kLast + 1);
  return { kStart, kEnd };
};

// Mobile CO2 plume band path
const getBandPath = (h, fraction = 1.0, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  const scale = 15.0;
  
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  
  return buildSmoothRibbonPath(
    (k, side) => capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g),
    (k, side) => {
      const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      return Math.min(yBotMax, yTop + getNodeValue(h, k, side) * fraction * scale);
    },
    bounds.kStart, bounds.kEnd, flts, depthMultiplier, g
  );
};

// Residually trapped CO2 plume band path (from h up to hMax)
const getResidualPath = (h, hMax, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h || !hMax) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  const scale = 15.0;
  
  const bounds = getPlumeActiveBounds(k => {
    const hCur = getNodeValue(h, k, 'avg');
    const hM = getNodeValue(hMax, k, 'avg');
    return Math.max(0, hM - hCur);
  }, N, 0.001);
  if (!bounds) return "";
  
  return buildSmoothRibbonPath(
    (k, side) => {
      const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      return Math.min(yBotMax, yTop + getNodeValue(h, k, side) * scale);
    },
    (k, side) => {
      const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      return Math.min(yBotMax, yTop + getNodeValue(hMax, k, side) * scale);
    },
    bounds.kStart, bounds.kEnd, flts, depthMultiplier, g
  );
};

// Swept Residual Trapped Gas Footprint (hMax)
const getSweptResidualPath = (hMax, depthMultiplier = 1.0, faults = currentGeology.faults, fringeHeight = 4.0, geo = currentGeology) => {
  if (!hMax) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = hMax.length;
  const scale = 15.0;
  
  const bounds = getPlumeActiveBounds(k => getNodeValue(hMax, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  
  return buildSmoothRibbonPath(
    (k, side) => capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g),
    (k, side) => {
      const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      const hm = getNodeValue(hMax, k, side);
      const f = fringeHeight * Math.min(1.0, hm * 1.5);
      return Math.min(yBotMax, yTop + hm * scale + f);
    },
    bounds.kStart, bounds.kEnd, flts, depthMultiplier, g
  );
};

// Active Flowing Mobile CO2 Plume (h)
const getActiveMobilePath = (h, depthMultiplier = 1.0, faults = currentGeology.faults, fringeHeight = 5.0, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  const scale = 15.0;
  
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  
  return buildSmoothRibbonPath(
    (k, side) => capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g),
    (k, side) => {
      const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      const hVal = getNodeValue(h, k, side);
      const f = fringeHeight * Math.min(1.0, hVal * 1.8);
      return Math.min(yBotMax, yTop + hVal * scale + f);
    },
    bounds.kStart, bounds.kEnd, flts, depthMultiplier, g
  );
};

// Meniscus path along active caprock underside
const getMeniscusPath = (h, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length;
  
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  
  let path = "";
  for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
    const x = k * 5.0;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (k === bounds.kStart) {
      const y0 = capRockY(x, flts, isFault ? k : k, depthMultiplier, g);
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yL = capRockY(x, flts, k - 1, depthMultiplier, g);
      const yR = capRockY(x, flts, k, depthMultiplier, g);
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const y = capRockY(x, flts, k, depthMultiplier, g);
      path += ` L ${x} ${y}`;
    }
  }
  return path;
};

// Current gas-water contact, using the same height field as the active plume.
const getContactLinePath = (h, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!h) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = h.length - 1;
  const scale = 15.0;
  
  const bounds = getPlumeActiveBounds(k => getNodeValue(h, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  
  let path = "";
  for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
    const x = k * 5.0;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (k === bounds.kStart) {
      const yTop = capRockY(x, flts, isFault ? k : k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, isFault ? k : k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      const y0 = Math.min(yBotMax, yTop + getNodeValue(h, k, isFault ? 'right' : 'avg') * scale);
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yTopL = capRockY(x, flts, k - 1, depthMultiplier, g);
      const yBotMaxL = stratumY(x, flts, k - 1, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      const yTopR = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMaxR = stratumY(x, flts, k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      const yL = Math.min(yBotMaxL, yTopL + getNodeValue(h, k, 'left') * scale);
      const yR = Math.min(yBotMaxR, yTopR + getNodeValue(h, k, 'right') * scale);
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const yTop = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, k, depthMultiplier, (depthMultiplier < 0.5 ? g.shallowThickness : g.reservoirThickness), g);
      const y = Math.min(yBotMax, yTop + getNodeValue(h, k, 'avg') * scale);
      path += ` L ${x} ${y}`;
    }
  }
  return path;
};

// Traces the vertical flow column representing constant buoyant ascent in the wellbore
const getColumnPath = (b, geo = currentGeology) => {
  const g = geo || currentGeology;
  const width = 8 + (5 - b) * 3; // narrower for high sat cores
  const xStart = g.wellX - width / 2;
  const xEnd = g.wellX + width / 2;
  const yStart = capRockY(g.wellX, g.faults, null, 1.0, g); // wellbore meets cap rock underside
  const yEnd = stratumY(g.wellX, g.faults, null, 1.0, g.reservoirThickness, g) - 20;
  return `M ${xStart} ${yStart} L ${xEnd} ${yStart} L ${xEnd} ${yEnd} L ${xStart} ${yEnd} Z`;
};

const SubsurfaceHero = ({ onNavigate }) => {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on first load to wow visitors
  const [speed, setSpeed] = useState(1);
  const [history, setHistory] = useState(null);

  // Single unified randomized geology (anticlines, fault throws, layers, petrophysics, well location) generated per page load
  const geology = currentGeology;
  const faults = geology.faults;

  useEffect(() => {
    if (!window.Worker) {
      const fallback = setTimeout(() => setHistory(precomputeSimulation(faults, geology)), 0);
      return () => clearTimeout(fallback);
    }
    const worker = new Worker('./hero-simulation-worker.js?v=6');
    worker.onmessage = (event) => setHistory(event.data.history);
    worker.onerror = () => setHistory(precomputeSimulation(faults, geology));
    worker.postMessage({ geology });
    return () => worker.terminate();
  }, [faults, geology]);

  const emptyFrame = useMemo(() => ({ h: new Array(201).fill(0), hMax: new Array(201).fill(0), h2: new Array(201).fill(0), h2Max: new Array(201).fill(0) }), []);
  const currentFrame = history ? (history[Math.round(time)] || history[0]) : emptyFrame;
  const currentH = currentFrame.h;
  const currentHMax = currentFrame.hMax;
  const currentH2 = currentFrame.h2;
  const currentH2Max = currentFrame.h2Max;

  useEffect(() => {
    if (!isPlaying || !history) return;
    const interval = setInterval(() => {
      setTime((t) => {
        if (t >= 1000) {
          return 0; // smooth loop back to Year 0
        }
        return Math.min(1000, t + 2.5 * speed);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, speed, history]);

  return (
    <section id="home" style={{
      position: 'relative',
      height: '100vh',
      minHeight: 720,
      overflow: 'hidden',
      color: '#fff',
      fontFamily: "'Montserrat', sans-serif",
      background: '#130d1c',
    }}>
      {/* Sky and subsurface as discrete background bands */}
      <Sky />
      <Subsurface h={currentH} faults={faults} geology={geology} />
      <Horizon />

      {/* Above-ground content */}
      <Identity onNavigate={onNavigate} />
      <Wellhead geology={geology} />
      <GasFeedAnimation isPlaying={isPlaying} geology={geology} />

      {/* Below-ground content */}
      <DepthAxis />
      <Well faults={faults} geology={geology} />
      <Plume h={currentH} hMax={currentHMax} h2={currentH2} h2Max={currentH2Max} faultFlow={currentFrame.faultFlow} time={time} isPlaying={isPlaying} faults={faults} geology={geology} />
      <Annotation />

      {/* Floating glassmorphism simulation dashboard */}
      <SimulationController 
        time={time} 
        setTime={setTime} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        speed={speed} 
        setSpeed={setSpeed} 
      />

      <ScrollCue />
    </section>
  );
};

/* =====================================================
   Simulation Controller — floating dashboard
   ===================================================== */
const SimulationController = ({ time, setTime, isPlaying, setIsPlaying, speed, setSpeed }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: '6%',
        bottom: '80px',
        width: '320px',
        padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: hovered ? '1px solid rgba(100,255,218,0.50)' : '1px solid rgba(100,255,218,0.30)',
        borderRadius: '16px',
        boxShadow: hovered 
          ? '0 12px 40px rgba(0,0,0,0.30), 0 0 25px rgba(100,255,218,0.22), inset 0 1px 0 rgba(255,255,255,0.30)' 
          : '0 8px 32px rgba(0,0,0,0.25), 0 0 15px rgba(100,255,218,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: isPlaying ? '#64ffda' : 'rgba(255,255,255,0.4)', 
            boxShadow: isPlaying ? '0 0 8px #64ffda' : 'none',
            animation: isPlaying ? 'twinkle 1.5s ease-in-out infinite' : 'none'
          }}/>
          <span style={{ fontSize: 9.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)', fontWeight: 600 }}>Simulation Status</span>
        </div>
        <span style={{ fontSize: 10.5, fontFamily: 'ui-monospace, monospace', color: '#64ffda', fontWeight: 600 }}>
          Year {Math.round(time)} / 1000
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Play/Pause Button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause hero simulation' : 'Play hero simulation'}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: isPlaying ? 'rgba(100,255,218,0.18)' : 'rgba(255,255,255,0.12)',
            border: `1px solid ${isPlaying ? '#64ffda' : 'rgba(255,255,255,0.25)'}`,
            color: isPlaying ? '#64ffda' : '#fff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
          }}
          title={isPlaying ? "Pause" : "Play Simulation"}
        >
          <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} style={{ fontSize: 12, marginLeft: isPlaying ? 0 : 2 }}/>
        </button>
 
        {/* Timeline Slider */}
        <input 
          type="range" 
          min="0" 
          max="1000" 
          step="1"
          value={time} 
          aria-label="Simulation year"
          aria-valuetext={`Year ${Math.round(time)}`}
          onChange={(e) => {
            setTime(parseFloat(e.target.value));
            setIsPlaying(false); // Pause on scrub
          }}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.20)',
            outline: 'none',
            cursor: 'pointer',
            accentColor: '#64ffda',
          }}
        />

        {/* Reset Button */}
        <button 
          onClick={() => { setTime(0); setIsPlaying(false); }}
          style={{
            width: 30, height: 30, borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
          }}
          title="Reset Simulation"
        >
          <i className="fas fa-redo" style={{ fontSize: 10 }}/>
        </button>

        {/* Speed Toggle */}
        <button 
          onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)}
          style={{
            fontSize: 9.5,
            fontWeight: 600,
            padding: '3px 7px',
            borderRadius: 5,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: '#64ffda',
            cursor: 'pointer',
            minWidth: 30,
            textAlign: 'center',
            outline: 'none',
          }}
          title="Toggle Simulation Speed"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};

/* =====================================================
   Sky — moonlit cloud banks and sparse stars over the same cool geological palette.
   ===================================================== */
const Sky = () => useMemo(() => (
  <div data-layer="sky" aria-hidden="true" style={{
    position: 'absolute', inset: '0 0 auto', height: '42vh',
    overflow: 'hidden', pointerEvents: 'none',
    background: 'linear-gradient(180deg, #090f20 0%, #131b30 56%, #1a253b 84%, #172737 100%)',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 79% 30%, rgba(142,170,207,0.18), transparent 34%), radial-gradient(ellipse at 70% 105%, rgba(83,131,151,0.12), transparent 55%)',
    }}/>
    {/* Fixed star positions and brightness: no twinkling or changes during playback. */}
    {Array.from({ length: 52 }, (_, i) => <span key={i} style={{
      position: 'absolute',
      left: `${(i * 61.803 + 3) % 100}%`, top: `${5 + (i * i * 17.31) % 67}%`,
      width: i % 11 === 0 ? 2 : 1.25, height: i % 11 === 0 ? 2 : 1.25,
      borderRadius: '50%', background: '#c7dbed',
      opacity: 0.26 + (i % 5) * 0.08,
      boxShadow: i % 11 === 0 ? '0 0 5px rgba(176,206,238,0.35)' : 'none',
    }}/>) }
    <div className="hero-night-clouds" style={{position: 'absolute', inset: 0}}>
      <svg viewBox="0 0 1000 420" preserveAspectRatio="none" width="104%" height="100%" style={{marginLeft: '-2%'}}>
        <defs>
          <linearGradient id="night-cloud-lit" x1="0" y1="0" x2="0.2" y2="1">
            <stop stopColor="#8496b5" stopOpacity="0.60"/>
            <stop offset="25%" stopColor="#425772" stopOpacity="0.70"/>
            <stop offset="65%" stopColor="#23324a" stopOpacity="0.88"/>
            <stop offset="100%" stopColor="#152137" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="night-cloud-shadow" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#34415d" stopOpacity="0.72"/>
            <stop offset="30%" stopColor="#131d31" stopOpacity="0.94"/>
            <stop offset="100%" stopColor="#101b2c" stopOpacity="0"/>
          </linearGradient>
          <filter id="night-cloud-texture" x="-10%" y="-30%" width="120%" height="160%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.025" numOctaves="3" seed="12" result="cloud-noise"/>
            <feColorMatrix in="cloud-noise" type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3 0 0 0 -1" result="cloud-density"/>
            <feDisplacementMap in="SourceGraphic" in2="cloud-noise" scale="38" xChannelSelector="R" yChannelSelector="G"/>
            <feGaussianBlur stdDeviation="6"/>
            <feComposite in2="cloud-density" operator="in"/>
            <feGaussianBlur stdDeviation="1"/>
          </filter>
        </defs>
        {/* The brighter upper edges suggest moonlight from behind the right-hand bank. */}
        <g filter="url(#night-cloud-texture)">
          <g fill="url(#night-cloud-lit)">
            <path opacity="0.55" d="M 390 144 C 445 130 471 147 511 125 C 537 111 563 122 594 110 C 631 92 661 109 687 90 C 729 66 755 91 798 77 C 859 62 882 98 936 84 L 1100 81 L 1100 226 C 916 223 858 185 715 203 C 596 213 496 171 390 185 Z"/>
            <path d="M 557 215 C 603 188 625 207 650 187 C 677 165 699 182 722 159 C 741 143 764 163 782 149 C 816 121 839 147 864 136 C 887 126 917 155 943 140 C 991 114 1041 138 1100 118 L 1100 314 C 1023 294 960 317 885 284 C 787 252 723 284 651 250 C 611 235 585 240 557 248 Z"/>
            <path opacity="0.46" d="M 150 300 C 219 278 257 292 294 275 C 330 258 364 285 400 261 C 431 240 463 263 492 247 C 529 226 555 253 600 241 C 654 226 684 259 725 245 L 832 279 L 901 365 C 690 337 637 355 484 328 C 347 315 259 340 150 332 Z"/>
          </g>
          <g fill="url(#night-cloud-shadow)">
            <path d="M 731 256 C 778 228 808 250 831 225 C 854 206 877 223 901 203 C 929 176 956 207 983 190 C 1022 174 1055 194 1100 181 L 1100 408 L 833 390 C 815 328 778 301 731 295 Z"/>
            <path opacity="0.75" d="M -80 343 C 4 322 43 341 87 317 C 128 293 157 323 202 304 C 244 280 283 308 320 292 C 362 273 387 311 435 298 L 561 372 L 628 432 L -80 432 Z"/>
          </g>
        </g>
      </svg>
    </div>
    {/* A dark left veil protects the identity; a cool horizon ties into the blue reservoirs. */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, rgba(11,15,29,0.88) 0%, rgba(13,17,32,0.65) 32%, transparent 68%), linear-gradient(0deg, rgba(14,26,39,0.65), transparent 20%)',
    }}/>
  </div>
), []);

/* =====================================================
   Horizon — dashed mint line at 42vh
   ===================================================== */
const Horizon = () => (
  <div style={{
    position: 'absolute', left: 0, right: 0, top: '42vh', height: 0,
    borderTop: '1px dashed rgba(100,255,218,0.55)',
    boxShadow: '0 0 8px rgba(100,255,218,0.30)',
    zIndex: 4, pointerEvents: 'none',
  }}>
    <span style={{
      position: 'absolute', right: 28, top: -22,
      fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase',
      color: 'rgba(100,255,218,0.85)', fontWeight: 600,
      fontFamily: 'ui-monospace, Menlo, monospace',
    }}>Surface · 0&nbsp;m</span>
  </div>
);

/* =====================================================
   Subsurface — SVG cross-section with anticline cap rock,
   reservoir and aquifer. 42vh → 100vh.
   ===================================================== */
const getCapRockPath = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = `M 0 ${capRockY(0, flts, 0, 1.0, g)}`;
  for (let i = 0; i < 200; i++) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const y1 = capRockY(x1, flts, i, 1.0, g);
    const y2 = capRockY(x2, flts, i, 1.0, g);
    path += ` L ${x1} ${y1} L ${x2} ${y2}`;
  }
  return path;
};

const getCapRockFillPath = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = `M 0 0 L 1000 0`;
  for (let i = 199; i >= 0; i--) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yRight = capRockY(x2, flts, i, 1.0, g);
    const yLeft = capRockY(x1, flts, i, 1.0, g);
    path += ` L ${x2} ${yRight} L ${x1} ${yLeft}`;
  }
  path += " Z";
  return path;
};

const CAP_ROCK_UNDERSIDE = getCapRockPath();
const CAP_ROCK_FILL = getCapRockFillPath();

const getAquiferPath = (faults = currentGeology.faults, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = `M 0 580 L 1000 580`;
  for (let i = 199; i >= 0; i--) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yRight = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
    const yLeft = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
    path += ` L ${x2} ${yRight} L ${x1} ${yLeft}`;
  }
  path += " Z";
  return path;
};

// Generates continuous strata layer polygons with displacement aligned to the sloped fault plane at each depth (200-cell resolution)
const getStrataPath = (faults = currentGeology.faults, depthMultiplier = 1.0, yOffset = 0, yBase = 0, isAquifer = false, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  let path = isAquifer ? `M 0 580 L 1000 580` : `M 0 ${yBase} L 1000 ${yBase}`;
  for (let i = 199; i >= 0; i--) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yCap2 = stratumY(x2, flts, i, depthMultiplier, yOffset, g);
    const yCap1 = stratumY(x1, flts, i, depthMultiplier, yOffset, g);
    path += ` L ${x2} ${yCap2} L ${x1} ${yCap1}`;
  }
  path += " Z";
  return path;
};

// Conforming finite volume columns for the reservoir grid block visualization (200 high-definition cells)
const ReservoirGrid = ({ h, faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const scale = 15.0; // matching scale factor of the plume
  const N = 200;
  
  const effH = h || new Array(N + 1).fill(0);

  // 1. Single continuous seamless Brine Fluid polygon across entire reservoir
  const brinePath = useMemo(() => {
    let path = `M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)}`;
    // Trace reservoir bottom left-to-right
    for (let i = 0; i < N; i++) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      path += ` L ${x1} ${yb1} L ${x2} ${yb2}`;
    }
    // Trace continuous top fluid interface right-to-left
    for (let i = N - 1; i >= 0; i--) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yt1 = capRockY(x1, flts, i, 1.0, g);
      const yt2 = capRockY(x2, flts, i, 1.0, g);
      const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      
      const yFluid1 = Math.min(yb1, yt1 + effH[i] * scale);
      const yFluid2 = Math.min(yb2, yt2 + effH[i + 1] * scale);
      
      if (i === N - 1) {
        path += ` L ${x2} ${yFluid2}`;
      }
      
      if (i > 0) {
        const yCapLeft = capRockY(x1, flts, i - 1, 1.0, g);
        const yCapRight = yt1;
        if (Math.abs(yCapLeft - yCapRight) > 0.1) {
          const ybPrev = stratumY(x1, flts, i - 1, 1.0, g.reservoirThickness, g);
          const yFluidPrev = Math.min(ybPrev, yCapLeft + effH[i - 1] * scale);
          path += ` L ${x1} ${yFluid1} L ${x1} ${yFluidPrev}`;
        } else {
          path += ` L ${x1} ${yFluid1}`;
        }
      } else {
        path += ` L ${x1} ${yFluid1}`;
      }
    }
    path += " Z";
    return path;
  }, [effH, flts, g]);

  // Sandstone block columns (stroke="none" eliminates dark vertical stripes)
  const cols = [];
  for (let i = 0; i < N; i++) {
    const x1 = i * 5.0;
    const x2 = (i + 1) * 5.0;
    const yt1 = capRockY(x1, flts, i, 1.0, g);
    const yt2 = capRockY(x2, flts, i, 1.0, g);
    const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
    const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
    
    const blockFill = '#182e40';
    
    cols.push(
      <polygon 
        key={i}
        points={`${x1},${yt1} ${x2},${yt2} ${x2},${yb2} ${x1},${yb1}`}
        fill={blockFill}
        stroke="none"
      />
    );
  }

  return (
    <g>
      {/* Sandstone geologic column blocks */}
      {cols}
      {/* 100% Continuous Single-Path Ambient Brine Aquifer */}
      <path d={brinePath} fill="url(#grad-aquifer-v2)" opacity="0.88" />
    </g>
  );
};

// Static rock detail is built once per geology, independent of simulation frames.
const GeologyTexture = ({ faults, geology: g }) => useMemo(() => {
  const reservoirPaths = [0.4, 1].map(depth => getReservoirClipPath(depth, faults, g));
  const trace = elevation => {
    let path = '';
    for (let i = 0; i < 200; i++) {
      const x = i * 5;
      const y = elevation(x, i);
      // Break at displaced contacts instead of drawing a diagonal across a fault.
      const move = !i || Math.abs(y - elevation(x, i - 1)) > 0.1;
      path += ` ${move ? 'M' : 'L'} ${x} ${y} L ${x + 5} ${elevation(x + 5, i)}`;
    }
    return path;
  };
  const sealLines = Array.from({ length: 23 }, (_, i) =>
    trace((x, cell) => capRockY(x, faults, cell, (i + 1) / 24, g)));
  const lowerLines = Array.from({ length: 25 }, (_, i) =>
    trace((x, cell) => stratumY(x, faults, cell, 1, g.reservoirThickness + (i + 1) * 320 / 26, g)));
  const reservoirLines = [0.4, 1].flatMap(depth => Array.from({ length: depth === 1 ? 8 : 3 }, (_, i) => {
    const fraction = (i + 1) / (depth === 1 ? 9 : 4);
    return trace((x, cell) => capRockY(x, faults, cell, depth, g)
      + fraction * layerThicknessAt(x, depth, faults, cell, g));
  }));
  return <g data-layer="geology-texture">
    <defs>
      <clipPath id="rock-reservoirs">{reservoirPaths.map((d, i) => <path key={i} d={d}/>)}</clipPath>
      <mask id="rock-seals" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="580">
        <rect width="1000" height="580" fill="white"/>
        {reservoirPaths.map((d, i) => <path key={i} d={d} fill="black"/>) }
      </mask>
      <pattern id="rock-grain" width="137" height="89" patternUnits="userSpaceOnUse">
        {Array.from({ length: 90 }, (_, i) => <ellipse key={i}
          cx={(i * 47.13 + 7) % 137} cy={(i * i * 13.71 + 11) % 89}
          rx={0.35 + (i % 4) * 0.13} ry={0.25 + (i % 3) * 0.12}
          fill={i % 3 ? '#c4d4d5' : '#040e18'} opacity={i % 3 ? 0.17 : 0.3}/>) }
      </pattern>
      <radialGradient id="rock-mineral-wash">
        <stop stopColor="#9da9a1" stopOpacity="0.09"/>
        <stop offset="100%" stopColor="#9da9a1" stopOpacity="0"/>
      </radialGradient>
      <pattern id="rock-mottle" width="431" height="193" patternUnits="userSpaceOnUse">
        <ellipse cx="120" cy="60" rx="115" ry="39" fill="url(#rock-mineral-wash)"/>
        <ellipse cx="320" cy="147" rx="101" ry="43" fill="url(#rock-mineral-wash)"/>
      </pattern>
    </defs>
    <rect width="1000" height="580" fill="url(#rock-mottle)"/>
    <rect width="1000" height="580" fill="url(#rock-grain)" opacity="0.55"/>
    <g mask="url(#rock-seals)" fill="none" stroke="#c5b8b1" strokeWidth="0.65">
      {[...sealLines, ...lowerLines].map((d, i) => <path key={i} d={d}
        opacity={i % 4 === 0 ? 0.15 : 0.065}
        strokeDasharray={i % 3 === 0 ? '31 5 9 3 57 7' : undefined}/>) }
    </g>
    <g clipPath="url(#rock-reservoirs)">
      <rect width="1000" height="580" fill="url(#rock-grain)" opacity="0.65"/>
      {reservoirLines.map((d, i) => <path key={i} d={d} fill="none"
        stroke="#93b7c2" strokeWidth="0.7" opacity="0.12" strokeDasharray="47 6 18 4 83 9"/>) }
    </g>
  </g>;
}, [faults, g]);

// Depth axis — clean ticks on the left margin
const DepthAxis = () => {
  const ticks = [
    { top: '42vh',   label: '0 m' },
    { top: '54vh',   label: '–1200 m' },
    { top: '70vh',   label: '–1800 m' },
    { top: '88vh',   label: '–2400 m' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 16, top: 0, bottom: 0, width: 90,
      zIndex: 4, pointerEvents: 'none',
      fontFamily: 'ui-monospace, Menlo, monospace',
    }}>
      {ticks.map((t, i) => (
        <div key={i} style={{ position: 'absolute', top: t.top, left: 0, transform: 'translateY(-50%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 1.5, background: 'rgba(100,255,218,0.75)', boxShadow: '0 0 4px rgba(100,255,218,0.4)' }}/>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{t.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Overland CO2 Supercritical Pipeline with elevated supports and directional chevron flow
const GasFeedAnimation = ({ isPlaying, geology }) => {
  const g = geology || currentGeology;
  const wellX = g.wellXPct;

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 'calc(42vh - 36px)',
      height: 36,
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      {/* Pipeline container from wellhead wing flange to right edge */}
      <div style={{
        position: 'absolute',
        left: `calc(${wellX}% + 33px)`,
        right: 0,
        height: 36,
      }}>
        {/* Telemetry metadata tag above the pipeline */}
        <div style={{
          position: 'absolute',
          left: 16,
          top: -16,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 9.5,
          fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
          color: '#0dfca2',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 600,
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#0dfca2',
            boxShadow: '0 0 8px #0dfca2',
            display: 'inline-block',
          }} />
          <span>CO₂ TRANSMISSION PIPELINE · 110 BAR · SUPERCRITICAL</span>
        </div>

        <svg
          width="100%"
          height="36"
          style={{ overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Cylindrical metallic pipe gradient */}
            <linearGradient id="pipe-steel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="18%" stopColor="#94a3b8" />
              <stop offset="42%" stopColor="#334155" />
              <stop offset="75%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Dense supercritical fluid core gradient */}
            <linearGradient id="sc-fluid-core" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="45%" stopColor="#0dfca2" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <pattern id="chevron-flow-pattern" width="32" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 12 2 L 6 5 L 12 8 M 24 2 L 18 5 L 24 8"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </pattern>
          </defs>

          {/* 1. Ground Support Stanchions (anchoring pipe to surface horizon at y=36) */}
          {[60, 220, 380, 540, 700, 860, 1020, 1180].map((xPos) => (
            <g key={`pipe-support-${xPos}`}>
              {/* Vertical steel column */}
              <rect x={xPos - 2} y="13" width="4" height="21" fill="#334155" stroke="#1e293b" strokeWidth="0.5" />
              {/* Horizontal saddle cradle clamp */}
              <path d={`M ${xPos - 6} 13 Q ${xPos} 15 ${xPos + 6} 13`} stroke="#64748b" strokeWidth="1.6" fill="none" />
              {/* Concrete foundation sleeper at horizon level */}
              <rect x={xPos - 8} y="32" width="16" height="4" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.7" />
            </g>
          ))}

          {/* 2. Main High-Pressure Steel Pipe Body (y: 1 to 13, height 12) */}
          <rect
            x="0"
            y="1"
            width="100%"
            height="12"
            rx="2.5"
            fill="url(#pipe-steel)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.8"
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))' }}
          />

          {/* 3. Flanged Pipe Joint Collars with Bolt Rivets */}
          {[140, 300, 460, 620, 780, 940, 1100].map((xPos) => (
            <g key={`flange-collar-${xPos}`}>
              <rect x={xPos - 2.5} y="0" width="5" height="14" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="0.7" />
              <circle cx={xPos} cy="2.5" r="0.8" fill="#e2e8f0" />
              <circle cx={xPos} cy="11.5" r="0.8" fill="#e2e8f0" />
            </g>
          ))}

          {/* 4. Inspection Sight Channel / Fluid Core (Continuous high-density fluid conduit) */}
          <rect
            x="0"
            y="4.5"
            width="100%"
            height="5"
            rx="1.5"
            fill="url(#sc-fluid-core)"
            opacity="0.9"
            style={{ filter: 'drop-shadow(0 0 6px rgba(13,252,162,0.7))' }}
          />

          {/* 5. Directional Chevron Flow Animation (Moving leftward into wellhead) */}
          <g style={{
            animation: 'pipelineChevron 1.4s linear infinite',
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}>
            <rect
              x="-64"
              y="3.5"
              width="calc(100% + 128px)"
              height="7"
              fill="url(#chevron-flow-pattern)"
            />
          </g>

          {/* 6. Top Metallic Specular Reflection Highlight */}
          <line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="0.75"
          />
        </svg>
      </div>
    </div>
  );
};

const Subsurface = ({ h, faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const AQUIFER_PATH = useMemo(() => getAquiferPath(flts, g), [flts, g]);
  const CAP_ROCK_FILL = useMemo(() => getCapRockFillPath(flts, g), [flts, g]);
  const CAP_ROCK_UNDERSIDE = useMemo(() => getCapRockPath(flts, g), [flts, g]);
  const SHALLOW_RESERVOIR_PATH = useMemo(() => getReservoirClipPath(0.4, flts, g), [flts, g]);
  return (
    <React.Fragment>
      <svg
        style={{
          position: 'absolute', left: 0, right: 0, top: '42vh',
          width: '100%', height: '58vh',
          pointerEvents: 'none',
        }}
        viewBox="0 0 1000 580"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="grad-cap-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2b2336"/>
            <stop offset="100%" stopColor="#1c1623"/>
          </linearGradient>
          <linearGradient id="grad-aquifer-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0f3460" stopOpacity="0.80"/>
            <stop offset="100%" stopColor="#0a1931" stopOpacity="0.95"/>
          </linearGradient>
          <linearGradient id="grad-sediment" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#30323c"/>
            <stop offset="55%" stopColor="#262d35"/>
            <stop offset="100%" stopColor="#1c252d"/>
          </linearGradient>
        </defs>

        {/* Conforming Cap rock */}
        <path d={CAP_ROCK_FILL} fill="url(#grad-cap-v2)"/>
        
        {/* Realistic Cap rock strata layers with zero diagonal slant */}
        {g.capLayerDepths.map((depth, i) => (
          <path key={i} d={getStrataPath(flts, depth, 0, 0, false, g)} fill={`rgba(0,0,0,${0.15 + i * 0.10})`}/>
        ))}

        {/* The receiving bed uses exactly the same roof and floor as the leaked plume. */}
        <path data-layer="upper-reservoir" d={SHALLOW_RESERVOIR_PATH}
          fill="#123147" stroke="rgba(168,237,234,0.30)" strokeWidth="0.8"/>

        {/* Sync Background Reservoir: Conforming FVM Grid blocks */}
        <ReservoirGrid h={h} faults={flts} geology={g} />

        {/* Synced Aquifer conforming layer */}
        <path d={AQUIFER_PATH} fill="url(#grad-sediment)"/>
        
        {/* Realistic Aquifer strata layers with zero diagonal slant */}
        {g.aquiferLayerOffsets.map((offset, i) => (
          <path key={i} d={getStrataPath(flts, 1.0, g.reservoirThickness + offset, 580, true, g)} fill={`rgba(0,0,0,${0.20 + i * 0.15})`}/>
        ))}

        <GeologyTexture faults={flts} geology={g}/>

        {/* Aquifer boundary stroke */}
        <path 
          d={`M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)} ` + Array.from({ length: 200 }, (_, i) => `L ${i*5.0} ${stratumY(i*5.0, flts, i, 1.0, g.reservoirThickness, g)} L ${(i+1)*5.0} ${stratumY((i+1)*5.0, flts, i, 1.0, g.reservoirThickness, g)}`).join(" ")}
          stroke="rgba(0,0,0,0.35)" 
          strokeWidth="1.2" 
          fill="none"
        />

        {/* Mint glow along reservoir/cap-rock interface (anticline emphasis) */}
        <path d={CAP_ROCK_UNDERSIDE}
              stroke="rgba(168,237,234,0.22)" strokeWidth="0.8" fill="none"/>
        <path d={CAP_ROCK_UNDERSIDE}
              stroke="rgba(168,237,234,0.10)" strokeWidth="2" fill="none"
              style={{ filter: 'blur(1.2px)' }}/>

        {/* Top edge highlight */}
        <line x1="0" y1="0" x2="1000" y2="0" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
      </svg>

      {/* Stratum labels */}
      {[
        { top: 'calc(42vh + 8px)', label: 'Cap rock' },
        { top: `${42 + (capRockY(980, flts, null, 0.4, g) + layerThicknessAt(980, 0.4, flts, null, g) / 2) * 0.1}vh`, label: 'Upper reservoir' },
        { top: `${42 + (capRockY(980, flts, null, 1, g) + layerThicknessAt(980, 1, flts, null, g) / 2) * 0.1}vh`, label: 'Reservoir' },
        { top: `${42 + (stratumY(980, flts, null, 1, g.reservoirThickness, g) + 580) * 0.05}vh`, label: 'Aquifer' },
      ].map((s, i) => (
        <span key={i} style={{
          position: 'absolute', right: 18, top: s.top,
          fontSize: 9.5, letterSpacing: '0.20em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.88)', fontWeight: 600,
          fontFamily: 'ui-monospace, Menlo, monospace',
          pointerEvents: 'none', zIndex: 5,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>{s.label}</span>
      ))}
    </React.Fragment>
  );
};

// Wellhead — Precision technical SVG Christmas Tree vector assembly
const Wellhead = ({ geology }) => {
  const g = geology || currentGeology;
  return (
    <div style={{
      position: 'absolute',
      left: `${g.wellXPct}%`,
      top: 'calc(42vh - 46px)',
      width: 72,
      height: 46,
      transform: 'translateX(-50%)',
      zIndex: 5,
      pointerEvents: 'none',
    }}>
      <svg
        viewBox="0 0 72 46"
        width="72"
        height="46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.65))' }}
      >
        <defs>
          <linearGradient id="wh-metal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="45%" stopColor="#334155" />
            <stop offset="55%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="wh-flange-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* 1. Conductor Casing Base Flange */}
        <rect x="23" y="41" width="26" height="5" rx="1" fill="url(#wh-flange-grad)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
        <circle cx="26" cy="43.5" r="0.9" fill="#94a3b8" />
        <circle cx="31" cy="43.5" r="0.9" fill="#94a3b8" />
        <circle cx="41" cy="43.5" r="0.9" fill="#94a3b8" />
        <circle cx="46" cy="43.5" r="0.9" fill="#94a3b8" />

        {/* 2. Vertical Spool Column */}
        <rect x="32.5" y="12" width="7" height="29" fill="url(#wh-metal-grad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />

        {/* 3. Lower Master Gate Valve */}
        <rect x="27" y="32" width="18" height="7" rx="1.5" fill="#0f172a" stroke="rgba(100,255,218,0.45)" strokeWidth="0.8" />
        <line x1="27" y1="35.5" x2="20" y2="35.5" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="20" y1="31.5" x2="20" y2="39.5" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />

        {/* 4. Upper Master Gate Valve */}
        <rect x="27" y="23" width="18" height="7" rx="1.5" fill="#0f172a" stroke="rgba(100,255,218,0.45)" strokeWidth="0.8" />
        <line x1="45" y1="26.5" x2="52" y2="26.5" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="52" y1="22.5" x2="52" y2="30.5" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />

        {/* 5. Flow Cross / Tee Block */}
        <rect x="26" y="13" width="20" height="8" rx="1.5" fill="#0b1322" stroke="#64ffda" strokeWidth="1" />

        {/* 6. Lateral Kill Wing / Monitoring Branch (Left) */}
        <rect x="13" y="15" width="13" height="4" fill="url(#wh-metal-grad)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
        <rect x="10" y="14" width="3" height="6" rx="0.8" fill="#475569" stroke="#94a3b8" strokeWidth="0.6" />

        {/* 7. Lateral Injection Wing Valve (Right — connecting to surface pipeline) */}
        <rect x="46" y="15" width="24" height="4" fill="url(#wh-metal-grad)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
        <rect x="54" y="13.5" width="7" height="7" rx="1" fill="#0f172a" stroke="rgba(100,255,218,0.6)" strokeWidth="0.8" />
        <line x1="57.5" y1="13.5" x2="57.5" y2="7.5" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="53.5" y1="7.5" x2="61.5" y2="7.5" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />

        {/* 8. Top Swab Valve & Tree Cap */}
        <rect x="29" y="6" width="14" height="6" rx="1" fill="#0f172a" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
        <rect x="30.5" y="3.5" width="11" height="2.5" rx="0.8" fill="#334155" stroke="#64ffda" strokeWidth="0.6" />

        {/* 9. Top Pressure Gauge Assembly */}
        <line x1="36" y1="3.5" x2="36" y2="1" stroke="#94a3b8" strokeWidth="1" />
        <circle cx="36" cy="-2.5" r="3.2" fill="#0f172a" stroke="#64ffda" strokeWidth="0.8" />
        <line x1="36" y1="-2.5" x2="37.8" y2="-4" stroke="#0dfca2" strokeWidth="0.7" strokeLinecap="round" />

        {/* 10. Digital Telemetry Status Light */}
        <circle cx="36" cy="17" r="1.4" fill="#0dfca2" style={{ filter: 'drop-shadow(0 0 4px #0dfca2)' }}>
          <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

// Well — vertical tubing from horizon down through reservoir
// Dynamic height constraints ensure it never extends below the reservoir bottom perforations
const Well = ({ faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const yBotVal = stratumY(g.wellX, flts, null, 1.0, g.reservoirThickness, g) - 20;
  const heightVh = `${yBotVal * 0.1}vh`;
  return (
    <div style={{
      position: 'absolute',
      left: `${g.wellXPct}%`, top: '42vh',
      width: 10, height: heightVh,
      transform: 'translateX(-50%)',
      zIndex: 3, pointerEvents: 'none',
    }}>
      {/* Outer steel casing with bright specular highlights */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, #111 0%, #aaa 25%, #fff 50%, #444 75%, #111 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.2)',
        borderRight: '1px solid rgba(255,255,255,0.2)',
        opacity: 0.85,
      }}/>
      {/* Inner flow tube with bright neon green glow */}
      <div style={{
        position: 'absolute', left: 3, right: 3, top: 0, bottom: 0,
        background: 'linear-gradient(90deg, rgba(13,252,162,0.1) 0%, rgba(13,252,162,0.6) 50%, rgba(13,252,162,0.1) 100%)',
        boxShadow: '0 0 10px rgba(13,252,162,0.4)',
      }}/>
      {/* Perforated intervals (horizontal flow slots) inside the reservoir sandstone */}
      <div style={{
        position: 'absolute', left: -3, right: -3, bottom: 10, height: 18,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: 2, background: '#0dfca2',
            boxShadow: '0 0 6px #0dfca2',
          }}/>
        ))}
      </div>
      {/* injection point flare at bottom */}
      <div style={{
        position: 'absolute', left: '50%', bottom: -4, transform: 'translateX(-50%)',
        width: 26, height: 26, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,237,234,0.85) 0%, rgba(100,255,218,0.30) 45%, transparent 75%)',
        filter: 'blur(2px)',
        animation: 'pulseFlare 2.6s ease-in-out infinite',
      }}/>
    </div>
  );
};

// Streamlines — gentle curves flowing through the reservoir
// Refactored to dynamically trace caprock-parallel contours
const Streamlines = ({ isPlaying, faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  // 3 left-migrating streamlines
  const leftPaths = [35, 75, 115].map(d => {
    let path = `M ${g.wellX} ${capRockY(g.wellX, flts, null, 1.0, g) + d}`;
    for (let x = g.wellX - 10; x >= 0; x -= 10) {
      path += ` L ${x} ${capRockY(x, flts, null, 1.0, g) + d}`;
    }
    return path;
  });
  
  // 3 right-migrating streamlines
  const rightPaths = [35, 75, 115].map(d => {
    let path = `M ${g.wellX} ${capRockY(g.wellX, flts, null, 1.0, g) + d}`;
    for (let x = g.wellX + 10; x <= 1000; x += 10) {
      path += ` L ${x} ${capRockY(x, flts, null, 1.0, g) + d}`;
    }
    return path;
  });

  return (
    <svg
      style={{
        position: 'absolute', left: 0, top: '42vh', width: '100%', height: '58vh',
        zIndex: 2, pointerEvents: 'none',
      }}
      viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true">
      {/* Left-flowing streamlines (outward, right-to-left) */}
      {leftPaths.map((d, i) => (
        <path key={`l-${i}`}
              d={d}
              stroke="rgba(100,255,218,0.18)"
              strokeWidth="0.8"
              strokeDasharray="2 12"
              fill="none"
              style={{ 
                animation: `flow-reverse ${8 + i * 1.2}s linear infinite`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}/>
      ))}
      {/* Right-flowing streamlines (outward, left-to-right) */}
      {rightPaths.map((d, i) => (
        <path key={`r-${i}`}
              d={d}
              stroke="rgba(100,255,218,0.18)"
              strokeWidth="0.8"
              strokeDasharray="2 12"
              fill="none"
              style={{ 
                animation: `flow ${8 + i * 1.2}s linear infinite`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}/>
      ))}
    </svg>
  );
};

/* =====================================================
   Simulation cells — sparse pulsing grid, only in reservoir
   ===================================================== */
const SimCells = ({ isPlaying }) => {
  const cells = useMemo(() => {
    const arr = [];
    const rows = 4, cols = 18;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 6 + c * 5.2;        // % across viewport
        // Carve a wide gap around the well at 70% so the plume reads cleanly
        if (x > 46 && x < 96) continue;
        // Carve out the left depth-axis area
        if (x < 12) continue;
        // Carve the small left anticline area too
        if (x > 14 && x < 26) continue;
        arr.push({
          left: `${x}%`,
          top: `${62 + r * 6.5}vh`,
          delay: Math.random() * 4,
          duration: 2.4 + Math.random() * 2,
        });
      }
    }
    return arr;
  }, []);
  return (
    <React.Fragment>
      {cells.map((c, i) => (
        <span key={i} style={{
          position: 'absolute', left: c.left, top: c.top,
          width: 6, height: 6, borderRadius: '50%',
          background: '#64ffda',
          opacity: 0.18,
          boxShadow: '0 0 6px rgba(100,255,218,0.45)',
          animation: `cellPulse ${c.duration}s ease-in-out ${c.delay}s infinite`,
          animationPlayState: isPlaying ? 'running' : 'paused',
          zIndex: 2, pointerEvents: 'none',
        }}/>
      ))}
    </React.Fragment>
  );
};

/* =====================================================
   CO2 plume — saturation contour map. Banded colors run
   from a yellow high-saturation core out through green to
   a faint mint outer halo (low saturation / dissolved CO2).
   Gravity-tongue shape: wide thin lens under the anticline
   crest, narrowing into a column down to the well at
   (x=700, y=400).
   ===================================================== */

const CAP_ROCK_PATH = CAP_ROCK_UNDERSIDE;

// Band 1: outermost (sw ≈ 0.1, mostly dissolved/dilute CO2)
// Naturally tapered gravity-tongue path that slopes down to zero thickness at outer tips (380 & 960)
const PLUME_B1 =
  "M 380 156 " +
  "C 420 168, 460 170, 510 172 " +
  "C 550 168, 585 156, 615 140 " +
  "C 640 112, 660 80, 680 52 " +
  "C 695 38, 710 36, 728 38 " +
  "C 745 58, 765 90, 785 122 " +
  "C 810 140, 840 152, 880 162 " +
  "C 920 156, 960 148, 960 152 " +
  "C 900 180, 800 190, 722 190 " +
  "C 720 252, 714 342, 708 410 L 692 410 " +
  "C 686 342, 680 252, 678 190 " +
  "C 600 190, 480 180, 380 156 Z";

// Band 2: mid saturation (sw ≈ 0.3)
const PLUME_B2 =
  "M 470 168 " +
  "C 500 168, 530 160, 555 148 " +
  "C 590 124, 625 92, 660 64 " +
  "C 678 48, 694 42, 710 40 " +
  "C 728 44, 745 64, 760 88 " +
  "C 778 115, 800 138, 825 152 " +
  "C 855 165, 890 172, 920 175 " +
  "C 860 182, 800 186, 718 186 " +
  "C 716 248, 710 338, 706 405 L 694 405 " +
  "C 690 338, 684 248, 682 186 " +
  "C 620 186, 540 182, 470 168 Z";

// Band 3: high saturation (sw ≈ 0.5)
const PLUME_B3 =
  "M 555 166 " +
  "C 580 158, 605 145, 625 125 " +
  "C 650 95, 675 65, 695 50 " +
  "C 712 46, 725 50, 738 64 " +
  "C 755 86, 775 115, 800 138 " +
  "C 825 155, 855 168, 885 175 " +
  "C 820 180, 770 182, 716 182 " +
  "C 714 244, 710 330, 705 400 L 695 400 " +
  "C 690 330, 686 244, 684 182 " +
  "C 640 182, 600 180, 555 166 Z";

// Band 4: very high saturation (sw ≈ 0.7)
const PLUME_B4 =
  "M 630 166 " +
  "C 650 154, 670 132, 685 105 " +
  "C 698 74, 708 52, 712 46 " +
  "C 725 50, 740 72, 758 98 " +
  "C 778 123, 800 146, 830 160 " +
  "C 850 170, 870 174, 885 176 " +
  "C 830 178, 780 178, 714 178 " +
  "C 712 238, 708 320, 704 395 L 696 395 " +
  "C 692 320, 688 238, 686 178 " +
  "C 660 178, 645 174, 630 166 Z";

// Band 5: peak core (sw ≈ 0.85+, near-saturated CO2)
const PLUME_B5 = "M 695 38 C 705 38, 716 46, 718 56 C 720 96, 716 200, 710 393 L 690 393 C 684 200, 680 96, 682 56 C 684 46, 690 38, 695 38 Z";

const Plume = ({ h, hMax, h2, h2Max, faultFlow = [], time, isPlaying, faults = [], geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const CAP_ROCK_PATH = useMemo(() => getCapRockPath(flts, g), [flts, g]);
  return (
    <React.Fragment>
      <svg
        style={{
          position: 'absolute', left: 0, right: 0, top: '42vh',
          width: '100%', height: '58vh',
          zIndex: 4, pointerEvents: 'none',
          overflow: 'visible',
        }}
        viewBox="0 0 1000 580"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="below-caprock">
            <path d={getReservoirClipPath(1, flts, g)}/>
          </clipPath>
          <clipPath id="below-shallow-caprock">
            <path d={getReservoirClipPath(0.4, flts, g)}/>
          </clipPath>
          <filter id="band-soften" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5"/>
          </filter>
          <filter id="plume-diffuse-blur" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="2.5"/>
          </filter>
          <filter id="plume-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6"/>
          </filter>

          {/* Active Mobile Supercritical Flow Gradient (S_max: Green -> Aqua/Teal) */}
          <linearGradient id="active-mobile-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0dfca2" stopOpacity="0.98" />
            <stop offset="45%" stopColor="#0dfca2" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#05e67c" stopOpacity="0.92" />
            <stop offset="88%" stopColor="#20c997" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#1a8e8f" stopOpacity="0.85" />
          </linearGradient>

          {/* Residual Trapped Gas Swept Footprint Gradient (S_gr Seafoam/Teal -> Brine Blue) */}
          <linearGradient id="residual-trapped-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#20c997" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#20c997" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#1a8e8f" stopOpacity="0.65" />
            <stop offset="92%" stopColor="#125672" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0a2a4d" stopOpacity="0.25" />
          </linearGradient>

          {/* Outer glow aura */}
          <linearGradient id="co2-glow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0dfca2" stopOpacity="0.60" />
            <stop offset="100%" stopColor="#00b05b" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g clipPath="url(#below-caprock)">
          {/* 1. Ambient Neon Aura Glow */}
          {hMax && getSweptResidualPath(hMax, 1.0, flts, 16.0, g) && (
            <path 
              d={getSweptResidualPath(hMax, 1.0, flts, 16.0, g)} 
              fill="url(#co2-glow-grad)" 
              filter="url(#plume-glow)"
              style={{
                animation: 'plumePulse 4s ease-in-out infinite',
                animationPlayState: isPlaying ? 'running' : 'paused',
                transformOrigin: '50% 30%',
              }}
            />
          )}

          {/* 2. Historic Swept Footprint: Residually Trapped Gas (S_gr) in Distinct Luminous Seafoam/Teal */}
          {hMax && getSweptResidualPath(hMax, 1.0, flts, 4.0, g) && (
            <path 
              d={getSweptResidualPath(hMax, 1.0, flts, 4.0, g)} 
              fill="url(#residual-trapped-grad)" 
              filter="url(#plume-diffuse-blur)"
              opacity="0.95"
            />
          )}

          {/* 3. Active Flowing Mobile Plume: Radiant Supercritical Emerald (S_max) */}
          {h && getActiveMobilePath(h, 1.0, flts, 0, g) && (
            <path 
              d={getActiveMobilePath(h, 1.0, flts, 0, g)}
              fill="url(#active-mobile-grad)" 
              filter="url(#plume-diffuse-blur)"
              opacity="0.98"
            />
          )}

          {/* 4. High-Purity Supercritical Active Flow Crest Highlight */}
          {h && getBandPath(h, 0.50, 1.0, flts, g) && (
            <path 
              d={getBandPath(h, 0.50, 1.0, flts, g)} 
              fill="#0dfca2" 
              opacity="0.25"
              filter="url(#band-soften)"
            />
          )}

          {/* Current gas-water contact; historic swept gas remains a separate diffuse tint. */}
          {h && getContactLinePath(h, 1.0, flts, g) && (
            <path 
              d={getContactLinePath(h, 1.0, flts, g)}
              fill="none" 
              stroke="#a6e9d7"
              strokeWidth="1.1"
              opacity="0.82"
            />
          )}

          {/* Subtle meniscus along the CO2/cap-rock contact */}
          {getMeniscusPath(h || hMax, 1.0, flts, g) && (
            <path
              d={getMeniscusPath(h || hMax, 1.0, flts, g)}
              stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" fill="none"
            />
          )}

        </g>

        {/* ================= SECONDARY RESERVOIR RENDERING ================= */}
        <g clipPath="url(#below-shallow-caprock)">
          {/* Secondary Reservoir Ambient Neon Aura */}
          {h2Max && getSweptResidualPath(h2Max, 0.4, flts, 8.0, g) && (
            <path 
              d={getSweptResidualPath(h2Max, 0.4, flts, 8.0, g)} 
              fill="url(#co2-glow-grad)" 
              filter="url(#plume-glow)"
              style={{
                animation: 'plumePulse 4s ease-in-out infinite',
                animationPlayState: isPlaying ? 'running' : 'paused',
                transformOrigin: '50% 30%',
              }}
            />
          )}

          {/* Secondary Reservoir Swept Residual Trapped Gas Footprint */}
          {h2Max && getSweptResidualPath(h2Max, 0.4, flts, 2.0, g) && (
            <path 
              d={getSweptResidualPath(h2Max, 0.4, flts, 2.0, g)} 
              fill="url(#residual-trapped-grad)" 
              filter="url(#plume-diffuse-blur)"
              opacity="0.92"
            />
          )}

          {/* Secondary Reservoir Active Mobile Plume */}
          {h2 && getActiveMobilePath(h2, 0.4, flts, 0, g) && (
            <path 
              d={getActiveMobilePath(h2, 0.4, flts, 0, g)}
              fill="url(#active-mobile-grad)" 
              filter="url(#plume-diffuse-blur)"
              opacity="0.96"
            />
          )}

          {/* Current contact in the receiving reservoir. */}
          {h2 && getContactLinePath(h2, 0.4, flts, g) && (
            <path 
              d={getContactLinePath(h2, 0.4, flts, g)}
              fill="none" 
              stroke="#a6e9d7"
              strokeWidth="1.1"
              opacity="0.78"
            />
          )}

          {/* Secondary Reservoir meniscus */}
          {h2 && getMeniscusPath(h2, 0.4, flts, g) && (
            <path
              d={getMeniscusPath(h2, 0.4, flts, g)}
              stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" fill="none"
            />
          )}
        </g>
        {/* ================================================================ */}
        
        {/* Dynamic Sloped Fault Lines based on randomized faults list */}
        {flts.map((f, idx) => {
          const x0 = f.xPercent * 10;
          const slope = f.dipSlope !== undefined ? f.dipSlope : 0.16;
          const yStart = 0;
          const yEnd = 480;
          const xStart = x0 + slope * yStart;
          const xEnd = x0 + slope * yEnd;
          return (
            <g key={`fault-group-${idx}`}>
              {/* Subtle structural fault plane */}
              <line 
                x1={xStart} 
                y1={yStart} 
                x2={xEnd} 
                y2={yEnd} 
                stroke="rgba(170,191,201,0.26)"
                strokeWidth="1.0" 
                strokeDasharray="4 4" 
              />
            </g>
          );
        })}

        {/* Dynamic Cross-Formational Inter-Reservoir Fluid Flow along Permeable Fault Conduits */}
        {flts.map((f, idx) => {
          const inter1 = getFaultIntersection(f, 1.0, g); // Primary reservoir caprock spill point
          const inter2 = getFaultIntersection(f, 0.4, g); // Secondary shallow reservoir entry point
          const flow = faultFlow[idx] || 0;
          if (flow <= 0) return null;
          const strength = Math.min(1, Math.sqrt(flow / f.leakRate));

          return (
            <g key={`fault-flow-group-${idx}`} data-layer="fault-leak" opacity={strength}>
              {/* 1. Illuminated active permeable conduit fluid core (strictly between Primary & Secondary reservoirs) */}
              <line 
                x1={inter1.x} 
                y1={inter1.y} 
                x2={inter2.x} 
                y2={inter2.y} 
                stroke="#0dfca2" 
                strokeWidth="3"
                opacity="0.16"
                style={{ filter: 'blur(2.5px)' }}
              />
              <line
                x1={inter1.x} y1={inter1.y} x2={inter2.x} y2={inter2.y}
                stroke="#0dfca2" strokeWidth="1.15" opacity="0.5"
                strokeLinecap="round"
              />
              {/* Direction follows the simulation clock: pause, speed and scrubbing stay in sync. */}
              <line className="fault-flow-cue"
                x1={inter1.x} y1={inter1.y} x2={inter2.x} y2={inter2.y}
                stroke="#b3ffe4" strokeWidth="1.25" strokeLinecap="round"
                strokeDasharray="3 15" strokeDashoffset={-time * 0.18} opacity="0.65"
              />
            </g>
          );
        })}
      </svg>



      {/* Brine label far from the plume (left side) — context label with improved high contrast */}
      <div style={{
        position: 'absolute',
        left: '22%', top: `${42 + (capRockY(220, flts, null, 1, g) + layerThicknessAt(220, 1, flts, null, g) * 0.7) * 0.1}vh`,
        transform: 'translate(-50%, -50%)',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 600,
        fontSize: 16,
        color: 'rgba(255,255,255,0.60)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        zIndex: 5,
        pointerEvents: 'none',
        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
      }}>
        Brine
      </div>
    </React.Fragment>
  );
};

/* =====================================================
   One clean annotation pointing at the reservoir's VE concept
   ===================================================== */
const Annotation = () => (
  <div className="hero-annotation-box" style={{
    padding: '14px 18px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(100,255,218,0.35)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 15px rgba(100,255,218,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
    transition: 'all 0.4s ease',
  }}>
    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.92)', lineHeight: 1.5, fontFamily: "'Montserrat', sans-serif" }}>
      Vertical Equilibrium model of CO<sub>2</sub> injection — <strong style={{ color: '#64ffda', textShadow: '0 0 8px rgba(100,255,218,0.3)' }}>orders of magnitude</strong> faster than full 3D.
    </div>
  </div>
);

/* =====================================================
   IDENTITY — sits firmly inside the sky region
   ===================================================== */
const Identity = ({ onNavigate }) => (
  <div className="hero-identity-container">
    <div style={{
      fontSize: 11.5, letterSpacing: '0.20em', textTransform: 'uppercase',
      color: '#64ffda', fontWeight: 600, marginBottom: 14,
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64ffda', boxShadow: '0 0 10px rgba(100,255,218,0.8)' }}/>
      Ph.D. Candidate · Heriot-Watt University
    </div>

    <h1 style={{
      margin: 0,
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontSize: 'clamp(36px, 6vw, 64px)',
      lineHeight: 1.02,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #ffffff 0%, #d6f8f3 50%, #7ee8e2 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>Sa&rsquo;eed Telvari</h1>

    <p className="hero-summary" style={{
      margin: '18px 0 0',
      maxWidth: 540,
      fontSize: 16,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.82)',
    }}>
      Building <strong style={{ color: '#64ffda', fontWeight: 600 }}>Vertical Equilibrium models</strong> for simulating <strong style={{ color: '#64ffda', fontWeight: 600 }}>CO<sub>2</sub> storage</strong> in depleted gas reservoirs<span className="hero-detail"> — the cross-section below is essentially the thing I simulate.</span>
    </p>

    <div className="hero-actions" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
      <div className="hero-socials" style={{ display: 'flex', gap: 10 }}>
        <BrandSocial label="LinkedIn profile" icon="fa-brands fa-linkedin-in" tint="#0a66c2" url="https://www.linkedin.com/in/stelvari/" />
        <BrandSocial label="GitHub profile" icon="fa-brands fa-github" tint="#22272e" url="https://github.com/saeedtelvari" />
        <BrandSocial label="Google Scholar profile" icon="fa-solid fa-graduation-cap" tint="#4285f4" url="https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330" />
        <BrandSocial label="Email Sa'eed Telvari" icon="fa-solid fa-envelope" tint="#ea4335" url="mailto:st4014@hw.ac.uk" />
      </div>
      <div className="hero-actions-divider" style={{ height: 22, width: 1, background: 'rgba(255,255,255,0.18)' }}/>
      <a
        className="hero-cta-primary"
        href="./simulator.html"
        onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('simulator'); else window.location.href = './simulator.html'; }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, #0dfca2, #159a80)',
          border: '1px solid rgba(255,255,255,0.45)', color: '#10251f',
          fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 13.5,
          textDecoration: 'none', boxShadow: '0 7px 22px rgba(13,252,162,0.28)',
        }}
      >
        <i className="fa-solid fa-play" /> Try VE Simulator
      </a>
      <a 
        className="hero-cta-secondary"
        href="#cv" 
        onClick={(e) => { 
          e.preventDefault(); 
          if (onNavigate) onNavigate('cv');
          else if (window.__onNavigate) window.__onNavigate('cv'); 
        }} 
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(78,205,196,0.90), rgba(78,205,196,0.55))',
          border: '1px solid rgba(168,237,234,0.60)',
          color: '#fff', fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 13.5,
          textDecoration: 'none', cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(78,205,196,0.30), inset 0 1px 0 rgba(255,255,255,0.40)',
          transition: 'all 0.3s ease',
        }}
      >
        <i className="fa-solid fa-file-lines"/> View CV
      </a>
      <a 
        className="hero-cta-tertiary"
        href="#contact" 
        onClick={(e) => {
          e.preventDefault();
          if (onNavigate) onNavigate('contact');
          else if (window.__onNavigate) window.__onNavigate('contact');
          else {
            const el = document.getElementById('contact');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
          border: '1px solid rgba(255,255,255,0.30)',
          color: '#fff', fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 13.5,
          textDecoration: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)',
          transition: 'all 0.3s ease',
        }}
      >
        Get in touch
      </a>
    </div>
  </div>
);

const BrandSocial = ({ label, icon, tint, url }) => {
  const [hover, setHover] = useState(false);
  const toRGBA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${toRGBA(tint, 0.95)} 0%, ${toRGBA(tint, 0.55)} 100%)`,
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${toRGBA(tint, 0.75)}`,
        color: '#fff', fontSize: 17,
        cursor: 'pointer', textDecoration: 'none',
        transform: hover ? 'translateY(-3px) scale(1.08)' : 'none',
        boxShadow: hover
          ? `0 10px 26px ${toRGBA(tint, 0.45)}, inset 0 1px 0 rgba(255,255,255,0.45)`
          : `0 4px 14px ${toRGBA(tint, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.30)`,
        transition: 'all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
      <i className={icon} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}/>
    </a>
  );
};

const ScrollCue = () => (
  <div style={{
    position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase',
    zIndex: 7,
  }}>
    Scroll
    <span style={{
      width: 1, height: 24,
      background: 'linear-gradient(180deg, rgba(100,255,218,0.6), transparent)',
    }}/>
  </div>
);

Object.assign(window, { SubsurfaceHero });

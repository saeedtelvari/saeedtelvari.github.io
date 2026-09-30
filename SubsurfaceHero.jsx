// SubsurfaceHero.jsx — landing hero as a CO2 storage cross-section.
// Sky holds the identity; one shared surface boundary keeps the subsurface aligned.
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
    <section id="home" className="hero-scene" style={{
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
      <SurfaceSite geology={geology} isPlaying={isPlaying} />
      <Horizon />

      {/* Above-ground content */}
      <Identity onNavigate={onNavigate} />

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
   Sky — moonlight and drifting clouds above a Highland field site.
   ===================================================== */
const Sky = () => {
  const skyRef = useRef(null);
  useEffect(() => {
    const sky = skyRef.current;
    const hero = sky.closest('#home');
    const starsLayer = sky.querySelector('.hero-stars');
    const stars = [...starsLayer.children];
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      stars.forEach(star => star.style.setProperty('--star-near', '0'));
    };
    const move = event => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      const rect = sky.getBoundingClientRect();
      const x = event.clientX - rect.left, y = event.clientY - rect.top;
      if (!rect.width || !rect.height || x < 0 || x > rect.width || y < 0 || y > rect.height) {
        reset();
        return;
      }
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        stars.forEach(star => {
          const sx = parseFloat(star.style.left) / 100 * rect.width;
          const sy = parseFloat(star.style.top) / 100 * rect.height;
          const proximity = Math.max(0, 1 - Math.hypot(x - sx, y - sy) / 90);
          star.style.setProperty('--star-near', proximity.toFixed(3));
        });
      });
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, { passive: true });
    motion.addEventListener('change', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);

  return useMemo(() => (
  <div ref={skyRef} data-layer="sky" aria-hidden="true" style={{
    position: 'absolute', inset: '0 0 auto', height: 'var(--hero-surface)',
    overflow: 'hidden', pointerEvents: 'none',
    background: 'linear-gradient(180deg, #070d1a 0%, #111e32 58%, #253449 100%)',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 82% 28%, rgba(159,183,209,0.1), transparent 52%)',
    }}/>
    <div className="hero-stars">
    {Array.from({ length: 108 }, (_, i) => <span key={i} className={`hero-star${i % 7 === 0 ? ' hero-star-twinkle' : ''}`} style={{
      left: `${(i * 61.803 + 3) % 100}%`, top: `${10 + (i * i * 17.31) % 67}%`,
      width: i % 11 === 0 ? 2 : 1.25, height: i % 11 === 0 ? 2 : 1.25,
      '--star-base': 0.32 + (i % 5) * 0.08,
      '--star-period': `${6 + i % 5}s`, '--star-delay': `${-i * .73}s`,
      boxShadow: i % 11 === 0 ? '0 0 5px rgba(176,206,238,0.35)' : 'none',
    }}/>) }
    </div>
    <div className="hero-moon">
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        <defs>
          <radialGradient id="moon-disc" cx=".35" cy=".3" r=".75">
            <stop stopColor="#edf0e5" /><stop offset=".7" stopColor="#c8d1cf" /><stop offset="1" stopColor="#97a8b6" />
          </radialGradient>
          <filter id="moon-soft"><feGaussianBlur stdDeviation=".6" /></filter>
        </defs>
        <circle cx="32" cy="32" r="29" fill="url(#moon-disc)" filter="url(#moon-soft)" />
        <g fill="#697f91" opacity=".15" filter="url(#moon-soft)">
          <ellipse cx="22" cy="23" rx="7" ry="9" />
          <ellipse cx="37" cy="41" rx="9" ry="7" />
          <circle cx="43" cy="22" r="4" /><circle cx="20" cy="42" r="3" />
        </g>
      </svg>
    </div>
    <div className="hero-night-clouds" style={{position: 'absolute', inset: 0, opacity: .55}}>
      <svg viewBox="0 0 1000 420" preserveAspectRatio="none" width="104%" height="100%" style={{marginLeft: '-2%'}}>
        <defs>
          <linearGradient id="night-cloud-lit" x1="0" y1="0" x2="0.2" y2="1">
            <stop stopColor="#a1b6cd" stopOpacity="0.45"/>
            <stop offset="25%" stopColor="#536780" stopOpacity="0.60"/>
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
        {/* Thin, textured banks drift in front of the moon. */}
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
      background: 'linear-gradient(90deg, rgba(8,14,28,0.94) 0%, rgba(8,14,28,0.72) 29%, rgba(8,14,28,0.15) 58%, transparent 78%)',
    }}/>
    <svg className="hero-landscape" viewBox="0 0 1440 180" preserveAspectRatio="none">
      <defs>
        <linearGradient id="highland-distant" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2e4053" /><stop offset="1" stopColor="#152333" />
        </linearGradient>
        <linearGradient id="highland-near" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#172b3b" /><stop offset="1" stopColor="#0b171f" />
        </linearGradient>
        <linearGradient id="highland-mist" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#a5bcd3" stopOpacity="0" /><stop offset=".62" stopColor="#a5bcd3" stopOpacity=".16" /><stop offset="1" stopColor="#a5bcd3" stopOpacity="0" />
        </linearGradient>
        <filter id="highland-soft"><feGaussianBlur stdDeviation="5" /></filter>
        <path id="highland-ridge" d="M0 138L80 123L155 130L228 112L292 119L357 90L403 96L457 70L489 74L540 41L568 53L600 48L647 77L693 61L738 80L804 50L846 27L880 44L912 40L950 73L1014 91L1060 81L1131 97L1201 61L1240 69L1290 46L1336 73L1390 64L1440 88V180H0Z" />
        <clipPath id="highland-ridge-clip"><use href="#highland-ridge" /></clipPath>
        <filter id="highland-rock-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".18 .32" numOctaves="2" seed="18" />
          <feColorMatrix type="saturate" values="0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <use href="#highland-ridge" fill="url(#highland-distant)" />
      <g clipPath="url(#highland-ridge-clip)">
        <path d="M540 41L517 76L489 104L453 121L499 96L533 82L560 111L594 125L568 53Z
          M846 27L825 61L792 89L747 112L795 96L830 80L866 116L902 126L880 44Z
          M1290 46L1265 75L1238 104L1197 130L1260 109L1294 91L1333 123L1357 129L1336 73Z" fill="#111e2b" opacity=".64" />
        <path d="M543 43L533 60L547 56L555 68L568 53M850 29L838 49L852 43L866 58L878 45M1292 49L1284 64L1298 60L1308 74L1317 66"
          fill="none" stroke="#a0b1ba" strokeWidth="1.1" strokeOpacity=".34" />
        <path d="M536 66l-14 27 -28 17m48 -31l17 30 16 12m267 -63l-15 32 -21 15m47 -39l19 30 22 16m395 -33l-22 24 -16 8"
          fill="none" stroke="#718594" strokeWidth=".8" strokeOpacity=".25" />
        <rect width="1440" height="180" filter="url(#highland-rock-grain)" opacity=".075" />
      </g>
      <path d="M0 155Q120 120 220 147T402 118L476 106L528 112L585 91L638 109L694 102L761 126L837 108L910 125L991 110L1057 126L1140 112L1210 126L1290 98L1351 104L1440 128V180H0Z" fill="url(#highland-near)" />
      <path d="M466 116Q523 125 584 102M743 140Q821 121 889 136M1071 141Q1131 127 1198 140M1223 132Q1291 113 1357 120"
        fill="none" stroke="#536c78" strokeWidth=".8" strokeOpacity=".24" />
      <path d="M360 139Q620 112 871 133T1470 128" stroke="url(#highland-mist)" strokeWidth="20" fill="none" filter="url(#highland-soft)" />
      <path d="M453 158Q513 151 578 156L670 160Q574 168 467 162Z" fill="#7897a5" opacity=".16" />
      <path d="M477 159h58m17 2h62m-102 2h22" stroke="#9cb5c1" strokeWidth=".6" opacity=".25" />
      <path d="M0 171Q142 164 264 173T490 165T730 171T958 167T1220 170T1440 164V180H0Z" fill="#0a151b" />
      {/* A narrow gravel track and irregular vegetation give the field site context. */}
      <path d="M626 149Q686 151 718 159T842 170Q900 174 949 180H970Q911 170 849 166T728 155Q684 147 626 149Z" fill="#45504e" opacity=".42" />
      <path d="M666 151Q723 158 766 161M812 168Q878 172 919 176" stroke="#9ba69a" strokeWidth=".7" strokeOpacity=".21" fill="none" />
      {[38, 57, 82, 104, 142, 167, 529, 552, 576, 700, 719].map((x, i) => {
        const y = 165 + Math.sin(i * 2.1) * 4, h = 11 + i % 4 * 4;
        return <g key={x} opacity={i < 6 ? '.8' : '.65'}>
          <path d={`M${x} ${y}v${-h}`} stroke="#233b3b" strokeWidth="1" />
          <path d={`M${x} ${y - h}l${-h * .3} ${h * .42}h${h * .15}l${-h * .24} ${h * .37}h${h * .78}l${-h * .24} ${-h * .37}h${h * .15}Z`}
            fill={i % 2 ? '#17302f' : '#112627'} />
          <path d={`M${x + 1} ${y - h + 3}l${h * .2} ${h * .3}`} stroke="#627f76" strokeWidth=".7" strokeOpacity=".3" />
        </g>;
      })}
      <path d="M7 177l18 -3 15 2 19 -2 17 3 22 -1 15 3m31 -1l17 -3 22 1 17 -2 13 3 18 -1" stroke="#667568" strokeOpacity=".25" strokeWidth="2" fill="none" />
      {Array.from({ length: 54 }, (_, i) => {
        const x = (i * 137.51 + 43) % 1440, y = 175 + i % 4;
        return <path key={i} d={`M${x} ${y}l-2 ${-3 - i % 4}m2 ${3 + i % 4}l3 -4`}
          stroke="#53685c" strokeWidth=".7" opacity={.24 + i % 3 * .08} />;
      })}
      <path d="M720 173L735 168L759 174M1115 172L1130 164L1151 172M1268 173L1280 167L1294 172" fill="#21333a" stroke="#48605e" strokeOpacity=".3" />
      <path d="M607 172l-3 -10m3 10l4 -7m566 8l-3 -13m3 13l5 -8m173 6l-2 -11m2 11l4 -5" stroke="#527067" strokeWidth="1" opacity=".65" />
    </svg>
    <div className="hero-rain">
      {Array.from({ length: 64 }, (_, i) => <span key={i} className="hero-rain-drop" style={{
        left: `${(i * 61.803 + 9) % 100}%`,
        '--rain-speed': `${.8 + i % 5 * .12}s`,
        '--rain-phase': `${-i * .13}s`,
        '--rain-length': `${14 + i % 6 * 3}px`,
        '--rain-alpha': .13 + i % 4 * .04,
      }}/>) }
    </div>
  </div>
), []);
};

// Decorative equipment stays anchored to the same surface and well as the live model.
const SurfaceSite = ({ geology, isPlaying }) => (
  <div className="hero-surface-site" aria-hidden="true" style={{ left: `${geology.wellXPct}%` }}>
    <svg viewBox="-140 0 540 160" width="100%" height="100%" fill="none">
      <defs>
        <linearGradient id="site-wall" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#43535a" /><stop offset="1" stopColor="#25363d" />
        </linearGradient>
        <radialGradient id="site-lamplight">
          <stop stopColor="#dec99d" stopOpacity=".2" /><stop offset="1" stopColor="#dec99d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="site-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#98abae" /><stop offset=".3" stopColor="#597078" /><stop offset=".65" stopColor="#334850" /><stop offset="1" stopColor="#17272e" />
        </linearGradient>
        <linearGradient id="site-roof" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6f8188" /><stop offset=".35" stopColor="#425961" /><stop offset="1" stopColor="#293c45" />
        </linearGradient>
        <linearGradient id="site-pad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#52605c" /><stop offset="1" stopColor="#263732" />
        </linearGradient>
        <linearGradient id="site-window" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d3c09a" /><stop offset="1" stopColor="#89754e" />
        </linearGradient>
        <linearGradient id="site-worklight" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e2d3ac" stopOpacity=".12" /><stop offset="1" stopColor="#e2d3ac" stopOpacity="0" />
        </linearGradient>
        <path id="site-feed-route" d="M289 118H252Q246 118 246 124V130Q246 136 240 136H95Q87 136 87 128V120Q87 114 81 114H60" />
        <clipPath id="site-gravel-clip"><path d="M-124 153L-94 140L335 137L396 153L385 160H-131Z" /></clipPath>
      </defs>
      {/* A shallow gravel plane, contact shadows, and sparse wet highlights ground the equipment. */}
      <path d="M-124 153L-94 140L335 137L396 153L385 160H-131Z" fill="url(#site-pad)" />
      <g clipPath="url(#site-gravel-clip)">
        {Array.from({ length: 100 }, (_, i) => <path key={i}
          d={`M${-132 + (i * 97.37) % 535} ${139 + i * 7.31 % 22}l${1 + i % 3} -.4`}
          stroke={i % 3 ? '#8b9485' : '#131f22'} strokeWidth=".6" opacity={i % 3 ? '.25' : '.5'} />)}
        <path d="M-70 151l124 -1m54 5l55 -1m80 -7l96 -1m-152 11l28 -1" stroke="#a0afaa" strokeOpacity=".15" strokeWidth=".8" />
      </g>
      <path d="M-124 153L-94 140L335 137L396 153" stroke="#7c8b80" strokeOpacity=".3" strokeWidth=".6" />
      <ellipse cx="172" cy="148" rx="62" ry="8" fill="#09171a" opacity=".6" />
      <ellipse cx="292" cy="143" rx="45" ry="4" fill="#09171a" opacity=".6" />
      <ellipse cx="49" cy="156" rx="28" ry="3" fill="#07161a" opacity=".7" />
      {/* Small remote monitoring point to the left of the well. */}
      <path d="M-92 147h37l-5 4h-37Z" fill="#3b4c49" />
      <path d="M-78 147V99m0 8h13m-1 -4v7m-12 -6l-7 -3m7 3l8 -3" stroke="#7b9090" strokeWidth="1.1" />
      <circle cx="-78" cy="97" r="1.6" fill="#93a7a1" />
      <path d="M-95 121l22 -3 7 13 -23 3Z" fill="#213946" stroke="#6c8489" strokeWidth=".7" />
      <path d="M-89 121l6 12m1 -13l6 12m1 -13l6 12m-22 -7l20 -2" stroke="#a0b2b1" strokeWidth=".5" strokeOpacity=".28" />
      <path d="M-83 135v12" stroke="#5f7778" strokeWidth="1.4" />
      <rect x="-61" y="131" width="12" height="15" rx="1" fill="#33484c" stroke="#7a8d85" strokeWidth=".5" />
      <path d="M-58 135h6m-6 3h6" stroke="#11272d" />
      {/* Fence and feed line sit behind the shelter; the doorway remains clear. */}
      <g stroke="#7b8e87" strokeOpacity=".38" strokeWidth=".8">
        <path d="M258 135V100M291 138V103M326 141V106M361 144V109M395 147V112M258 104L395 116M258 127L395 139" />
        {[267, 276, 303, 312, 338, 347, 372, 381].map(x => <path key={x} d={`M${x} ${104 + (x - 258) * .087}l0 23`} strokeOpacity=".2" />)}
      </g>
      <path d="M95 138v11m-5 0h10m144 -13v10m-5 0h10" stroke="#657b76" strokeWidth="1.5" />
      <use href="#site-feed-route" stroke="#0e2027" strokeWidth="6" />
      <use href="#site-feed-route" stroke="url(#site-metal)" strokeWidth="3.8" />
      <use className="hero-feed-flow" href="#site-feed-route" stroke="#a7c5ba" strokeWidth=".6" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }} />
      <path d="M101 132v8m4 -8v8m136 -12v8m4 -8v8" stroke="#a1b0a7" strokeWidth=".6" opacity=".55" />
      {/* Three-quarter shelter: moonlit roof, shaded side, siding, plinth, and entry steps. */}
      <path d="M126 145H210L234 134V140L210 151H126Z" fill="#182b2e" stroke="#73857b" strokeOpacity=".35" strokeWidth=".6" />
      <path d="M128 76L165 54L208 76V145H128Z" fill="url(#site-wall)" />
      <path d="M208 76L232 65V134L208 145Z" fill="#1a2d35" stroke="#62757a" strokeOpacity=".35" strokeWidth=".6" />
      <path d="M122 78L165 52L190 41L148 66Z" fill="#263d47" />
      <path d="M165 52L211 78L238 65L190 41Z" fill="url(#site-roof)" stroke="#809397" strokeOpacity=".65" strokeWidth=".7" />
      {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${168 + i * 4} ${52 - i * 1.7}l43 24`}
        stroke="#a7b6b5" strokeWidth=".6" strokeOpacity=".23" />)}
      <path d="M121 79L165 54L210 79L238 66M210 79V145M128 145H208" stroke="#93a5a3" strokeOpacity=".45" strokeWidth=".8" />
      <g stroke="#99aaa3" strokeWidth=".55" strokeOpacity=".15">
        {[84, 91, 98, 105, 112, 119, 126, 133, 140].map(y => <path key={y} d={`M130 ${y}H206M212 ${y - 2}l18 -8`} />)}
      </g>
      <path d="M134 89H163V113H134Z" fill="#172b33" stroke="#9aa79b" strokeWidth=".7" />
      <path d="M137 92H160V110H137Z" fill="url(#site-window)" opacity=".86" />
      <path d="M148 92V110M137 101H160M133 114H165" stroke="#405254" strokeWidth="1" />
      <path d="M137 93H159" stroke="#edddbd" strokeWidth=".5" opacity=".6" />
      <path d="M177 91H201V145H177Z" fill="#122831" stroke="#758881" strokeWidth=".7" />
      <path d="M180 94H198V137H180Z" stroke="#566d70" strokeOpacity=".45" strokeWidth=".6" />
      <rect x="183" y="98" width="11" height="9" fill="#38515a" stroke="#718781" strokeWidth=".5" />
      <path d="M195 121h3" stroke="#abb8a8" strokeWidth="1" />
      <path d="M175 145H202L205 149H173Z" fill="#6b7970" /><path d="M173 149H205V152H171V155H208" stroke="#52675f" strokeWidth="2" />
      <path d="M214 90l13 -6v15l-13 6Z" fill="#0d222a" stroke="#647b7a" strokeWidth=".5" />
      <path d="M216 94l9 -4m-9 7l9 -4m-9 7l9 -4" stroke="#62797c" strokeWidth=".7" />
      <path d="M231 74V134l-6 3" stroke="#7b8c88" strokeWidth="1" strokeOpacity=".6" />
      <ellipse cx="148" cy="146" rx="39" ry="10" fill="url(#site-lamplight)" />
      {/* Compact process skid with pressure vessel, end caps, valves, and control cabinet. */}
      <path d="M259 137H328L336 140H265Z" fill="#4b625f" stroke="#7b9187" strokeWidth=".6" />
      <path d="M267 135V127m50 9v-9M262 118H327" stroke="#587277" strokeWidth="2" />
      <rect x="268" y="112" width="55" height="14" rx="6" fill="url(#site-metal)" stroke="#96aaa7" strokeWidth=".65" />
      <ellipse cx="272" cy="119" rx="4" ry="6" fill="#4a6068" stroke="#9aadaa" strokeWidth=".6" />
      <path d="M284 113V126M307 113V126" stroke="#a5b3ac" strokeWidth="1" strokeOpacity=".45" />
      <path d="M284 112V104h9m12 8v-10h9" stroke="#718b88" strokeWidth="2" />
      <path d="M289 101v6m21 -8v6" stroke="#a1b2a6" strokeWidth="1" />
      <circle cx="302" cy="109" r="3" fill="#1a3039" stroke="#9baea8" strokeWidth=".6" />
      <path d="M302 109l1 -1.5" stroke="#c5d0bb" strokeWidth=".7" />
      <path d="M332 109l13 -3v29l-13 3Z" fill="#243c43" stroke="#738b82" strokeWidth=".65" />
      <path d="M335 114l7 -1.5m-7 4.5l7 -1.5m-7 4.5l7 -1.5" stroke="#526d70" strokeWidth=".6" />
      {/* Shielded warm worklight; the beam stays on the pad. */}
      <path d="M359 147V58h-17" stroke="#869a97" strokeWidth="1.8" />
      <path d="M348 60L320 147H379Z" fill="url(#site-worklight)" />
      <path d="M337 58h16l-2 3h-13Z" fill="#263f47" stroke="#9aada5" strokeWidth=".6" />
      <path d="M339 61h11" stroke="#dfcea4" strokeWidth="1.3" />
      <ellipse cx="349" cy="146" rx="43" ry="8" fill="url(#site-lamplight)" />
      <g className="hero-wellhead">
        <rect x="27" y="156" width="42" height="4" rx="1" fill="#354c50" stroke="#8b9e97" strokeWidth=".7" />
        <path d="M48 107V157M33 119H61" stroke="url(#site-metal)" strokeWidth="5" />
        <path d="M41 145H55M41 138H55M41 129H55M41 110H55" stroke="#8da19b" strokeWidth="1.5" />
        <rect x="42" y="132" width="12" height="9" rx="1" fill="#304b54" stroke="#91a6a0" strokeWidth=".65" />
        <rect x="42" y="114" width="12" height="9" rx="1" fill="#304b54" stroke="#91a6a0" strokeWidth=".65" />
        <path d="M42 137H35m0 -3v6M60 114v8M45 109H51" stroke="#b1bdb0" strokeWidth="1" />
        <circle cx="33" cy="119" r="4" stroke="#899f96" strokeWidth=".9" />
        <path d="M29 119h8m-4 -4v8" stroke="#718a82" strokeWidth=".7" />
        <circle cx="48" cy="104" r="4" fill="#152e38" stroke="#9bafa8" strokeWidth=".7" />
        <path d="M46 106l3 -3" stroke="#c3d1bf" strokeWidth=".8" />
        <circle data-site-status="true" cx="51" cy="136" r="1" fill={isPlaying ? '#a6c5ab' : '#647b79'} />
        <path d="M32 159h3m27 0h3" stroke="#a6b4a6" strokeWidth="1" />
      </g>
    </svg>
  </div>
);

/* =====================================================
   Horizon — dashed mint line at 42vh
   ===================================================== */
const Horizon = () => (
  <div style={{
    position: 'absolute', left: 0, right: 0, top: 'var(--hero-surface)', height: 0,
    borderTop: '1px dashed rgba(100,255,218,0.55)',
    boxShadow: '0 0 8px rgba(100,255,218,0.30)',
    zIndex: 4, pointerEvents: 'none',
  }}/>
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
    { depth: 0,   label: '0 m' },
    { depth: 120, label: '–1200 m' },
    { depth: 280, label: '–1800 m' },
    { depth: 460, label: '–2400 m' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 16, top: 0, bottom: 0, width: 90,
      zIndex: 4, pointerEvents: 'none',
      fontFamily: 'ui-monospace, Menlo, monospace',
    }}>
      {ticks.map((t, i) => (
        <div key={i} style={{ position: 'absolute', top: `calc(var(--hero-surface) + var(--hero-depth) * ${t.depth / 580})`, left: 0, transform: 'translateY(-50%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 1.5, background: 'rgba(100,255,218,0.75)', boxShadow: '0 0 4px rgba(100,255,218,0.4)' }}/>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{t.label}</div>
          </div>
        </div>
      ))}
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
          position: 'absolute', left: 0, right: 0, top: 'var(--hero-surface)',
          width: '100%', height: 'var(--hero-depth)',
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
            <stop offset="55%" stopColor="#353e42"/>
            <stop offset="100%" stopColor="#303637"/>
          </linearGradient>
          <clipPath id="hero-lower-rock"><path d={AQUIFER_PATH}/></clipPath>
          <linearGradient id="hero-lower-texture" x1="0" y1="280" x2="0" y2="580" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="white" stopOpacity=".65"/>
          </linearGradient>
          <mask id="hero-lower-texture-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="580">
            <rect width="1000" height="580" fill="url(#hero-lower-texture)"/>
          </mask>
          <linearGradient id="hero-descent-bridge" x1="0" y1="490" x2="0" y2="580" gradientUnits="userSpaceOnUse">
            <stop stopColor="#263038" stopOpacity="0"/><stop offset="1" stopColor="#263038"/>
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
          <path key={i} d={getStrataPath(flts, 1.0, g.reservoirThickness + offset, 580, true, g)}
            fill={['#424a4c', '#383f40', '#303637'][i]} opacity=".65"/>
        ))}

        <g clipPath="url(#hero-lower-rock)">
          <rect width="1000" height="580" fill="url(#descent-rock-shale)" mask="url(#hero-lower-texture-mask)"/>
          <rect width="1000" height="580" fill="url(#hero-descent-bridge)"/>
        </g>

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
        { top: 'calc(var(--hero-surface) + 8px)', label: 'Cap rock' },
        { top: `calc(var(--hero-surface) + var(--hero-depth) * ${(capRockY(980, flts, null, 0.4, g) + layerThicknessAt(980, 0.4, flts, null, g) / 2) / 580})`, label: 'Upper reservoir' },
        { top: `calc(var(--hero-surface) + var(--hero-depth) * ${(capRockY(980, flts, null, 1, g) + layerThicknessAt(980, 1, flts, null, g) / 2) / 580})`, label: 'Reservoir' },
        { top: `calc(var(--hero-surface) + var(--hero-depth) * ${(stratumY(980, flts, null, 1, g.reservoirThickness, g) + 580) / 1160})`, label: 'Aquifer' },
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

// Well — vertical tubing from horizon down through reservoir
// Dynamic height constraints ensure it never extends below the reservoir bottom perforations
const Well = ({ faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const yBotVal = stratumY(g.wellX, flts, null, 1.0, g.reservoirThickness, g) - 20;
  const heightVh = `calc(var(--hero-depth) * ${yBotVal / 580})`;
  return (
    <div style={{
      position: 'absolute',
      left: `${g.wellXPct}%`, top: 'var(--hero-surface)',
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
        position: 'absolute', left: 0, top: 'var(--hero-surface)', width: '100%', height: 'var(--hero-depth)',
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
          position: 'absolute', left: 0, right: 0, top: 'var(--hero-surface)',
          width: '100%', height: 'var(--hero-depth)',
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
        left: '22%', top: `calc(var(--hero-surface) + var(--hero-depth) * ${(capRockY(220, flts, null, 1, g) + layerThicknessAt(220, 1, flts, null, g) * 0.7) / 580})`,
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
const HeroName = ({ variant }) => {
  const titleRef = useRef(null);
  useEffect(() => {
    const title = titleRef.current;
    const hero = title.closest('#home');
    const words = [...title.querySelectorAll('.hero-name-word')];
    const contours = [...title.querySelectorAll('.hero-name-contour')];
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      title.style.transform = '';
      title.removeAttribute('data-lit');
      contours.forEach(contour => contour.style.transform = '');
    };
    const move = event => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = title.getBoundingClientRect();
        if (!rect.width || !rect.height) return reset();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const near = x > -0.25 && x < 1.25 && y > -1 && y < 2;
        if (!near) return reset();
        const dx = Math.max(-1, Math.min(1, (x - 0.5) * 2)) * 4;
        const dy = Math.max(-1, Math.min(1, (y - 0.5) * 2)) * 3;
        title.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        title.setAttribute('data-lit', '');
        contours.forEach(contour => {
          const depth = Number(contour.dataset.depth);
          contour.style.transform = `translate3d(${depth * (0.75 + dx * 0.35)}px, ${depth * (0.5 + dy * 0.3)}px, 0) scale(${1 + depth * 0.008})`;
        });
        words.forEach(word => {
          const bounds = word.getBoundingClientRect();
          word.style.setProperty('--name-light-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
        });
      });
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', reset, { passive: true });
    motion.addEventListener('change', reset);
    return () => {
      reset();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);

  return (
    <h1 ref={titleRef} className="hero-name" data-name-style={variant} aria-label="Sa’eed Telvari">
      {['Sa\u2019eed', 'Telvari'].map((word, index) => (
        <React.Fragment key={word}>
          {index > 0 && ' '}
          <span className="hero-name-word" data-word={word} aria-hidden="true">
            {variant === 'contour' && (
              <span className="hero-name-contours">
                {[1, 2, 3, 4, 5, 6].map(depth => (
                  <span key={depth} className="hero-name-contour" data-depth={depth} data-word={word}
                    style={{ '--contour-depth': depth }}>{word}</span>
                ))}
              </span>
            )}
            <span className="hero-name-ink" data-word={word}>{word}</span>
          </span>
        </React.Fragment>
      ))}
    </h1>
  );
};

const Identity = ({ onNavigate }) => {
  const preview = new URLSearchParams(window.location.search).get('name-preview');
  const [variant, setVariant] = useState(preview === 'moonlight' ? 'moonlight' : 'contour');
  const [replay, setReplay] = useState(0);
  const nameStyle = preview ? variant : 'contour';
  const changePreview = (event, next) => {
    event.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('name-preview', next);
    window.history.replaceState(window.history.state, '', url);
    setVariant(next);
    setReplay(count => count + 1);
  };
  return (
  <React.Fragment>
  {preview && (
    <nav className="hero-name-preview" aria-label="Name animation preview">
      {['moonlight', 'contour'].map(option => (
        <a key={option} href={`./index.html?name-preview=${option}`}
          aria-current={variant === option ? 'page' : undefined}
          onClick={event => changePreview(event, option)}>
          {option === 'moonlight' ? '1 · Moonlight' : '4 · Contours'}
        </a>
      ))}
      <button type="button" onClick={() => setReplay(count => count + 1)} aria-label="Replay name animation">
        <i className="fas fa-redo" aria-hidden="true" /> Replay
      </button>
    </nav>
  )}
  <div key={`${nameStyle}:${replay}`} className="hero-identity-container" data-name-style={nameStyle}>
    <div className="hero-intro-role hero-reveal" style={{
      fontSize: 11.5, letterSpacing: '0.20em', textTransform: 'uppercase',
      color: '#64ffda', fontWeight: 600, marginBottom: 14,
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64ffda', boxShadow: '0 0 10px rgba(100,255,218,0.8)' }}/>
      Ph.D. Candidate · Heriot-Watt University
    </div>

    <HeroName variant={nameStyle} />

    <p className="hero-summary hero-reveal" style={{
      margin: '18px 0 0',
      maxWidth: 540,
      fontSize: 16,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.82)',
    }}>
      Building <strong className="hero-highlight" style={{ color: '#64ffda', fontWeight: 600 }}>Vertical Equilibrium models</strong> for simulating <strong className="hero-highlight" style={{ color: '#64ffda', fontWeight: 600 }}>CO<sub>2</sub> storage</strong> in depleted gas reservoirs<span className="hero-detail"> — the cross-section below is essentially the thing I simulate.</span>
    </p>

    <div className="hero-actions hero-reveal" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
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
  </React.Fragment>
  );
};

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

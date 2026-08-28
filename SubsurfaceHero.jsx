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
  
  // 1. Regional structural basin dip slope (0.090 to 0.140) & Reference caprock depth (55px to 67px)
  const dipSlope = parseFloat((0.090 + Math.random() * 0.050).toFixed(3));
  const baseDepth = parseFloat((55 + Math.random() * 12).toFixed(1));
  
  // 2. Primary Anticline Structural Trap (Amp 17 to 24px, Wavelength 135 to 165px, Phase -15 to +15px)
  const amp1 = parseFloat((17.0 + Math.random() * 7.0).toFixed(1));
  const lambda1 = parseFloat((135 + Math.random() * 30).toFixed(1));
  const phase1 = parseFloat(((Math.random() - 0.5) * 30).toFixed(1));
  
  // 3. Secondary parasitic fold undulations (Amp 11 to 16px, Wavelength 72 to 88px)
  const amp2 = parseFloat((11.0 + Math.random() * 5.0).toFixed(1));
  const lambda2 = parseFloat((72 + Math.random() * 16).toFixed(1));
  
  // 4. Micro-topography sub-seismic rugosity (Amp 5 to 8px, Wavelength 40 to 52px)
  const amp3 = parseFloat((5.0 + Math.random() * 3.0).toFixed(1));
  const lambda3 = parseFloat((40 + Math.random() * 12).toFixed(1));
  
  // 5. Fault throw offset step (13px to 18px)
  const faultThrow = parseFloat((13.0 + Math.random() * 5.0).toFixed(1));
  
  // 6. Sandstone reservoir bed thickness (175px to 205px)
  const reservoirThickness = parseFloat((175.0 + Math.random() * 30.0).toFixed(1));
  
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
    K, R, Q,
    wellXPct,
    wellX,
    wellCellIdx,
  };
};

let currentGeology = generateRandomGeology();
const randomizedFaults = currentGeology.faults;

// Base unperturbed caprock profile adapting to current geology
const capRockBaseProfile = (x, depthMultiplier = 1.0, geo = currentGeology) => {
  const g = geo || currentGeology;
  const dip = (g.baseDepth + x * g.dipSlope) * depthMultiplier; 
  const wave1 = (- g.amp1 * Math.sin((x + g.phase1) * Math.PI / g.lambda1)) * depthMultiplier; // Primary anticline
  const wave2 = (- g.amp2 * Math.sin(x * Math.PI / g.lambda2)) * depthMultiplier;              // Secondary fold
  const wave3 = (- g.amp3 * Math.sin(x * Math.PI / g.lambda3)) * depthMultiplier;              // Micro-rugosity
  return dip + wave1 + wave2 + wave3;
};

// Base unperturbed stratum profile for any depthMultiplier and yOffset
const stratumBaseProfile = (x, depthMultiplier = 1.0, yOffset = 0, geo = currentGeology) => {
  return capRockBaseProfile(x, depthMultiplier, geo) + yOffset;
};

// Computes the exact subpixel intersection (x*, y*) of a sloped fault plane with any geological layer at depth
const getStratumFaultIntersection = (f, depthMultiplier = 1.0, yOffset = 0, geo = currentGeology) => {
  const x0 = f.xPercent * 10;
  const slope = f.dipSlope !== undefined ? f.dipSlope : 0.16;
  let x = x0;
  for (let iter = 0; iter < 3; iter++) {
    const y = stratumBaseProfile(x, depthMultiplier, yOffset, geo);
    x = x0 + slope * y;
  }
  const y = stratumBaseProfile(x, depthMultiplier, yOffset, geo);
  return { x, y, x0, slope };
};

// Computes intersection for caprock specifically (depthMultiplier, yOffset = 0)
const getFaultIntersection = (f, depthMultiplier = 1.0, geo = currentGeology) => {
  return getStratumFaultIntersection(f, depthMultiplier, 0, geo);
};

// Computes the exact elevation of any geological layer displaced along the sloped fault plane
const stratumY = (x, faults = currentGeology.faults, cellIdx = null, depthMultiplier = 1.0, yOffset = 0, geo = currentGeology) => {
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const base = stratumBaseProfile(x, depthMultiplier, yOffset, g);
  let offset = 0;
  const xReference = cellIdx !== null ? (cellIdx * 5.0 + 2.5) : x;
  
  if (flts) {
    for (let idx = 0; idx < flts.length; idx++) {
      const f = flts[idx];
      const inter = getStratumFaultIntersection(f, depthMultiplier, yOffset, g);
      if (xReference > inter.x) {
        const direction = idx % 2 === 0 ? 1 : -1;
        offset += direction * (g.faultThrow * (depthMultiplier < 0.5 ? 0.4 : 1.0));
      }
    }
  }
  
  return base + offset;
};

// Interpolates a smooth spline of the cap rock underside profile with sloped fault slips
const capRockY = (x, faults = currentGeology.faults, cellIdx = null, depthMultiplier = 1.0, geo = currentGeology) => {
  return stratumY(x, faults, cellIdx, depthMultiplier, 0, geo);
};

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
  
  for (let frame = 0; frame <= totalFrames; frame++) {
    history.push({
      h: [...h],
      hMax: [...hMax],
      h2: [...h2],
      h2Max: [...h2Max],
    });
    
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
        const ztL = capRockY(i * 5.0, flts, i, 1.0, g) / 15.0;
        const ztR = capRockY((i + 1) * 5.0, flts, i, 1.0, g) / 15.0;
        
        const zL = ztL + h[i];
        const zR = ztR + h[i + 1];
        
        const grad = zR - zL;
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i];
        
        fluxes[i] = -K * hFace * grad;
      }
      
      // Closed far-field boundaries (preserves CO2 in the regional geological trap)
      const H_res = g.reservoirThickness / 15.0;
      const nextH = [...h];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        nextH[i] = Math.max(0, Math.min(H_res, h[i] + dt * (fL - fR)));
      }
      
      // Fault capillary seal breaching and leakage
      const leaks = new Array(flts.length).fill(0);
      for (let idx = 0; idx < flts.length; idx++) {
        const f = flts[idx];
        const inter1 = getFaultIntersection(f, 1.0, g);
        const cellIdx = Math.round(inter1.x / 5.0);
        const boundedIdx = Math.max(0, Math.min(N - 1, cellIdx));
        
        // Leakage occurs only if CO2 column height exceeds entry threshold
        if (nextH[boundedIdx] > f.thresholdHeight) {
          const overpressure = nextH[boundedIdx] - f.thresholdHeight;
          const leak = Math.min(overpressure, f.leakRate * dt);
          nextH[boundedIdx] -= leak;
          leaks[idx] = leak;
        }
      }
      
      // Sustained injection during the first 320 frames centered on wellbore
      if (frame <= 320) {
        if (wellCell >= 2 && wellCell <= N - 3) {
          nextH[wellCell - 2] = Math.min(H_res, nextH[wellCell - 2] + Q * dt * 0.15);
          nextH[wellCell - 1] = Math.min(H_res, nextH[wellCell - 1] + Q * dt * 0.25);
          nextH[wellCell]     = Math.min(H_res, nextH[wellCell]     + Q * dt * 0.40);
          nextH[wellCell + 1] = Math.min(H_res, nextH[wellCell + 1] + Q * dt * 0.25);
          nextH[wellCell + 2] = Math.min(H_res, nextH[wellCell + 2] + Q * dt * 0.15);
        }
      }
      
      h = nextH.map(val => Math.max(0, Math.min(H_res, val)));
      for (let i = 0; i < N; i++) {
        if (h[i] > hMax[i]) hMax[i] = Math.min(H_res, h[i]);
      }
      
      // --- SECONDARY RESERVOIR (h2) ---
      const H_res2 = 60.0 / 15.0; // 4.0 m thickness for shallow layer
      const h2Mob = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const H = h2[i];
        const hm = h2Max[i];
        const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
        h2Mob[i] = Math.min(H, mobileVal);
      }
      
      const fluxes2 = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const ztL = capRockY(i * 5.0, flts, i, 0.4, g) / 15.0;
        const ztR = capRockY((i + 1) * 5.0, flts, i, 0.4, g) / 15.0;
        
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
        nextH2[i] = Math.max(0, Math.min(H_res2, h2[i] + dt * (fL - fR)));
      }
      
      // Inject leaked mass from primary into secondary fault locations
      for (let idx = 0; idx < flts.length; idx++) {
        const f = flts[idx];
        const inter2 = getFaultIntersection(f, 0.4, g);
        const cellIdx2 = Math.round(inter2.x / 5.0);
        const boundedIdx2 = Math.max(0, Math.min(N - 1, cellIdx2));
        nextH2[boundedIdx2] = Math.min(H_res2, nextH2[boundedIdx2] + leaks[idx] * 1.5);
      }
      
      h2 = nextH2.map(val => Math.max(0, Math.min(H_res2, val)));
      for (let i = 0; i < N; i++) {
        if (h2[i] > h2Max[i]) h2Max[i] = Math.min(H_res2, h2[i]);
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
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    
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

// Helper to get continuous node-evaluated height for any cell array
const getNodeValue = (arr, k, side = 'avg') => {
  if (!arr) return 0;
  const N = arr.length;
  if (k <= 0) return arr[0];
  if (k >= N) return arr[N - 1];
  if (side === 'left') return arr[k - 1];
  if (side === 'right') return arr[k];
  return 0.5 * (arr[k - 1] + arr[k]);
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
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
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
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
      return Math.min(yBotMax, yTop + getNodeValue(h, k, side) * scale);
    },
    (k, side) => {
      const yTop = capRockY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, g);
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
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
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
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
      const yBotMax = stratumY(k * 5.0, flts, side === 'left' ? k - 1 : k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
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

// Maximum Historic Gas Saturation Boundary (hMax Swept Footprint Dashed Line)
const getMaxHgLinePath = (hMax, depthMultiplier = 1.0, faults = currentGeology.faults, geo = currentGeology) => {
  if (!hMax) return "";
  const g = geo || currentGeology;
  const flts = faults || g.faults;
  const N = hMax.length;
  const scale = 15.0;
  
  const bounds = getPlumeActiveBounds(k => getNodeValue(hMax, k, 'avg'), N, 0.001);
  if (!bounds) return "";
  
  let path = "";
  for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
    const x = k * 5.0;
    const isFault = k > 0 && k < 200 && Math.abs(capRockY(x, flts, k - 1, depthMultiplier, g) - capRockY(x, flts, k, depthMultiplier, g)) > 0.1;
    if (k === bounds.kStart) {
      const yTop = capRockY(x, flts, isFault ? k : k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, isFault ? k : k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
      const y0 = Math.min(yBotMax, yTop + getNodeValue(hMax, k, isFault ? 'right' : 'avg') * scale);
      path = `M ${x} ${y0}`;
    } else if (isFault) {
      const yTopL = capRockY(x, flts, k - 1, depthMultiplier, g);
      const yBotMaxL = stratumY(x, flts, k - 1, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
      const yTopR = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMaxR = stratumY(x, flts, k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
      const yL = Math.min(yBotMaxL, yTopL + getNodeValue(hMax, k, 'left') * scale);
      const yR = Math.min(yBotMaxR, yTopR + getNodeValue(hMax, k, 'right') * scale);
      path += ` L ${x} ${yL} L ${x} ${yR}`;
    } else {
      const yTop = capRockY(x, flts, k, depthMultiplier, g);
      const yBotMax = stratumY(x, flts, k, depthMultiplier, (depthMultiplier < 0.5 ? 60 : g.reservoirThickness), g);
      const y = Math.min(yBotMax, yTop + getNodeValue(hMax, k, 'avg') * scale);
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
  const yEnd = capRockY(g.wellX, g.faults, null, 1.0, g) + 160; // wellbore bottom perforations exactly within reservoir thickness
  return `M ${xStart} ${yStart} L ${xEnd} ${yStart} L ${xEnd} ${yEnd} L ${xStart} ${yEnd} Z`;
};

const SubsurfaceHero = ({ onNavigate }) => {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on first load to wow visitors
  const [speed, setSpeed] = useState(1);

  // Single unified randomized geology (anticlines, fault throws, layers, petrophysics, well location) generated per page load
  const geology = currentGeology;
  const faults = geology.faults;

  // Precompute the entire physical simulation history (solved in <1ms!) using dynamic geology
  const history = useMemo(() => precomputeSimulation(faults, geology), [faults, geology]);
  const currentFrame = history[Math.round(time)] || history[0];
  const currentH = currentFrame.h;
  const currentHMax = currentFrame.hMax;
  const currentH2 = currentFrame.h2;
  const currentH2Max = currentFrame.h2Max;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime((t) => {
        if (t >= 1000) {
          return 0; // smooth loop back to Year 0
        }
        return Math.min(1000, t + 1.5 * speed);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

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
      <Subsurface h={currentH} hMax={currentHMax} faults={faults} geology={geology} />
      <Horizon />

      {/* Above-ground content */}
      <Identity onNavigate={onNavigate} />
      <Wellhead geology={geology} />
      <GasFeedAnimation isPlaying={isPlaying} geology={geology} />

      {/* Below-ground content */}
      <DepthAxis />
      <Well faults={faults} geology={geology} />
      <Plume h={currentH} hMax={currentHMax} h2={currentH2} h2Max={currentH2Max} time={time} isPlaying={isPlaying} faults={faults} geology={geology} />
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
   Sky — top 42vh: warm-violet gradient + soft atmospheric blobs
   ===================================================== */
const Sky = () => {
  return (
    <React.Fragment>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '42vh',
        background: 'linear-gradient(180deg, #16101f 0%, #1e1936 50%, #211d34 100%)',
      }}/>
      {/* Soft violet & rose blobs */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '42vh',
        background:
          'radial-gradient(circle at 22% 28%, rgba(120,119,198,0.20) 0%, transparent 45%), ' +
          'radial-gradient(circle at 84% 14%, rgba(255,119,178,0.13) 0%, transparent 38%)',
        pointerEvents: 'none',
      }}/>
    </React.Fragment>
  );
};

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
const ReservoirGrid = ({ h, hMax, faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const scale = 15.0; // matching scale factor of the plume
  const N = 200;
  
  // Precompute smooth fluid depths across all cells
  const effH = useMemo(() => {
    const arr = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      const hCur = h ? h[i] : 0;
      const hM = hMax ? hMax[i] : 0;
      arr[i] = Math.max(hCur, hM);
    }
    return arr;
  }, [h, hMax]);

  // 1. Single continuous seamless Brine Fluid polygon across entire reservoir
  const brinePath = useMemo(() => {
    let path = `M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)}`;
    // Trace reservoir bottom left-to-right
    for (let i = 0; i < N; i++) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      path += ` L ${x2} ${yb2}`;
    }
    // Trace continuous top fluid interface right-to-left
    for (let i = N - 1; i >= 0; i--) {
      const x1 = i * 5.0;
      const x2 = (i + 1) * 5.0;
      const yt1 = capRockY(x1, flts, i, 1.0, g);
      const yt2 = capRockY(x2, flts, i, 1.0, g);
      const yb1 = stratumY(x1, flts, i, 1.0, g.reservoirThickness, g);
      const yb2 = stratumY(x2, flts, i, 1.0, g.reservoirThickness, g);
      
      const hLeft = i === 0 ? effH[0] : 0.5 * (effH[i - 1] + effH[i]);
      const hRight = i === N - 1 ? effH[N - 1] : 0.5 * (effH[i] + effH[i + 1]);
      
      // Capillary fringe extends fluid zone (crisp, subtle 4px)
      const fLeft = 4.0 * Math.min(1.0, hLeft * 1.8);
      const fRight = 4.0 * Math.min(1.0, hRight * 1.8);
      
      const yFluid1 = Math.min(yb1, yt1 + hLeft * scale + fLeft);
      const yFluid2 = Math.min(yb2, yt2 + hRight * scale + fRight);
      
      if (i === N - 1) {
        path += ` L ${x2} ${yFluid2}`;
      }
      
      if (i > 0) {
        const yCapLeft = capRockY(x1, flts, i - 1, 1.0, g);
        const yCapRight = yt1;
        if (Math.abs(yCapLeft - yCapRight) > 0.1) {
          const hPrev = 0.5 * (effH[i - 1] + (i > 1 ? effH[i - 2] : effH[0]));
          const fPrev = 4.0 * Math.min(1.0, hPrev * 1.8);
          const ybPrev = stratumY(x1, flts, i - 1, 1.0, g.reservoirThickness, g);
          const yFluidPrev = Math.min(ybPrev, yCapLeft + hPrev * scale + fPrev);
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
    
    const permHash = 0.55 + 0.45 * Math.sin(i * 14.3 + 2.1); 
    const r = Math.floor(33 + permHash * 14);
    const gCol = Math.floor(24 + permHash * 8);
    const b = Math.floor(18 + permHash * 6);
    const blockFill = `rgb(${r}, ${gCol}, ${b})`;
    
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

// Conforming vertical grid lines for the cap rock stratum (200 cells)
const CapRockGrid = ({ faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const lines = [];
  for (let i = 1; i < 200; i++) {
    const x = i * 5.0;
    const yTop = 0;
    const yBot = capRockY(x, flts, i, 1.0, g);
    lines.push(
      <line 
        key={i} 
        x1={x} y1={yTop} x2={x} y2={yBot} 
        stroke="rgba(255,255,255,0.015)" 
        strokeWidth="0.5"
      />
    );
  }
  return <g>{lines}</g>;
};

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

// Captured CO2 gas feed animation above the wellhead
const GasFeedAnimation = ({ isPlaying, geology }) => {
  const g = geology || currentGeology;
  const bubbles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${g.wellXPct + (Math.random() - 0.5) * 1.2}%`,
    delay: i * 0.45,
    size: 2 + Math.random() * 3.5,
    duration: 2.2 + Math.random() * 1.2,
  })), [g.wellXPct]);
  
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '42vh', pointerEvents: 'none', zIndex: 6 }}>
      {bubbles.map(b => (
        <div 
          key={b.id}
          style={{
            position: 'absolute',
            left: b.left,
            top: 0,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: '#0dfca2',
            boxShadow: '0 0 6px #0dfca2',
            opacity: 0,
            animation: `feedBubble ${b.duration}s linear ${b.delay}s infinite`,
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
};

const Subsurface = ({ h, hMax, faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const AQUIFER_PATH = useMemo(() => getAquiferPath(flts, g), [flts, g]);
  const CAP_ROCK_FILL = useMemo(() => getCapRockFillPath(flts, g), [flts, g]);
  const CAP_ROCK_UNDERSIDE = useMemo(() => getCapRockPath(flts, g), [flts, g]);
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
        </defs>

        {/* Conforming Cap rock */}
        <path d={CAP_ROCK_FILL} fill="url(#grad-cap-v2)"/>
        
        {/* Realistic Cap rock strata layers with zero diagonal slant */}
        <path d={getStrataPath(flts, 0.85, 0, 0, false, g)} fill="rgba(0,0,0,0.15)"/>
        <path d={getStrataPath(flts, 0.40, 0, 0, false, g)} fill="rgba(0,0,0,0.25)"/>
        <path d={getStrataPath(flts, 0.15, 0, 0, false, g)} fill="rgba(0,0,0,0.35)"/>
        <CapRockGrid faults={flts} geology={g} />

        {/* Sync Background Reservoir: Conforming FVM Grid blocks */}
        <ReservoirGrid h={h} hMax={hMax} faults={flts} geology={g} />

        {/* Synced Aquifer conforming layer */}
        <path d={AQUIFER_PATH} fill="url(#grad-aquifer-v2)"/>
        
        {/* Realistic Aquifer strata layers with zero diagonal slant */}
        <path d={getStrataPath(flts, 1.0, g.reservoirThickness + 80, 580, true, g)} fill="rgba(0,0,0,0.20)"/>
        <path d={getStrataPath(flts, 1.0, g.reservoirThickness + 170, 580, true, g)} fill="rgba(0,0,0,0.35)"/>
        <path d={getStrataPath(flts, 1.0, g.reservoirThickness + 260, 580, true, g)} fill="rgba(0,0,0,0.50)"/>

        {/* Aquifer boundary stroke */}
        <path 
          d={`M 0 ${stratumY(0, flts, 0, 1.0, g.reservoirThickness, g)} ` + Array.from({ length: 200 }, (_, i) => `L ${(i+1)*5.0} ${stratumY((i+1)*5.0, flts, i, 1.0, g.reservoirThickness, g)}`).join(" ")} 
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
        { top: 'calc(58vh + 8px)', label: 'Reservoir' },
        { top: 'calc(88vh + 8px)', label: 'Aquifer' },
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

// Wellhead — small structure above the horizon
const Wellhead = ({ geology }) => {
  const g = geology || currentGeology;
  return (
    <div style={{
      position: 'absolute', left: `${g.wellXPct}%`, top: 'calc(42vh - 36px)',
      width: 50, height: 36, transform: 'translateX(-50%)',
      zIndex: 5,
    }}>
      {/* Xmas Tree Wellhead */}
      <div style={{
        width: '100%', height: '100%',
        position: 'relative',
      }}>
        {/* Master flange base */}
        <div style={{ position: 'absolute', bottom: 0, left: 15, width: 20, height: 6, background: '#444', borderRadius: 1, border: '1px solid #666' }}/>
        {/* Vertical riser */}
        <div style={{ position: 'absolute', bottom: 6, left: 22, width: 6, height: 22, background: 'linear-gradient(90deg, #333, #aaa, #333)', borderLeft: '1px solid #555' }}/>
        {/* Flow cross valve block */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, width: 18, height: 8, background: '#222', borderRadius: 2, border: '1px solid #0dfca2' }}/>
        {/* Left pressure gauge */}
        <div style={{ position: 'absolute', bottom: 18, left: 8, width: 8, height: 4, background: '#aaa', borderRadius: 1 }}/>
        {/* Top gauge/cap */}
        <div style={{ position: 'absolute', bottom: 28, left: 20, width: 10, height: 5, background: 'radial-gradient(circle, #fff, #555)', borderRadius: '50%', border: '1px solid #888' }}/>
        {/* Glowing pressure gauge indicator light */}
        <div style={{
          position: 'absolute', left: 23, top: 12, width: 4, height: 4, borderRadius: '50%',
          background: '#0dfca2', boxShadow: '0 0 6px #0dfca2',
          animation: 'twinkle 1s ease-in-out infinite',
        }}/>
      </div>
    </div>
  );
};

// Well — vertical tubing from horizon down through reservoir
// Dynamic height constraints ensure it never extends below the reservoir bottom perforations
const Well = ({ faults, geology }) => {
  const g = geology || currentGeology;
  const flts = faults || g.faults;
  const yBotVal = capRockY(g.wellX, flts, null, 1.0, g) + 160; 
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

const Plume = ({ h, hMax, h2, h2Max, time, isPlaying, faults = [], geology }) => {
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
            <path d={`${CAP_ROCK_PATH} L 1000 580 L 0 580 Z`}/>
          </clipPath>
          <clipPath id="below-shallow-caprock">
            <path d={`M 0 ${capRockY(0, flts, null, 0.4, g)} ${Array.from({length: 200}, (_, i) => `L ${(i+1)*5.0} ${capRockY((i+1)*5.0, flts, null, 0.4, g)}`).join(' ')} L 1000 580 L 0 580 Z`}/>
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
          {h && getActiveMobilePath(h, 1.0, flts, 5.0, g) && (
            <path 
              d={getActiveMobilePath(h, 1.0, flts, 5.0, g)} 
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

          {/* 5. Maximum Historic Gas Saturation Boundary (hMax Swept Footprint Dashed Line) */}
          {hMax && getMaxHgLinePath(hMax, 1.0, flts, g) && (
            <path 
              d={getMaxHgLinePath(hMax, 1.0, flts, g)} 
              fill="none" 
              stroke="#64ffda" 
              strokeWidth="1.4" 
              strokeDasharray="5 3.5" 
              opacity="0.85" 
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
          {h2 && getActiveMobilePath(h2, 0.4, flts, 2.5, g) && (
            <path 
              d={getActiveMobilePath(h2, 0.4, flts, 2.5, g)} 
              fill="url(#active-mobile-grad)" 
              filter="url(#plume-diffuse-blur)"
              opacity="0.96"
            />
          )}

          {/* Secondary Reservoir Maximum Historic Gas Saturation Boundary */}
          {h2Max && getMaxHgLinePath(h2Max, 0.4, flts, g) && (
            <path 
              d={getMaxHgLinePath(h2Max, 0.4, flts, g)} 
              fill="none" 
              stroke="#64ffda" 
              strokeWidth="1.2" 
              strokeDasharray="4 3" 
              opacity="0.80" 
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
        
        <g clipPath="url(#below-caprock)">
          {/* Dissolution fingers falling off the pool - pauseable CSS fingerDrip coupled to local plume arrival */}
          {[
            { x: 500, delay: 0.0, activeTime: 40 },
            { x: 560, delay: 1.2, activeTime: 25 },
            { x: 620, delay: 0.4, activeTime: 12 },
            { x: 790, delay: 0.8, activeTime: 15 },
            { x: 850, delay: 1.6, activeTime: 32 },
            { x: 920, delay: 0.2, activeTime: 55 },
          ].map((d, i) => {
            if (time < d.activeTime) return null;
            return (
              <circle 
                key={`d${i}`} 
                cx={d.x} 
                cy="200" 
                r="1.2" 
                fill="#0dfca2" 
                style={{
                  opacity: 0,
                  animation: `fingerDrip 6s linear ${d.delay}s infinite`,
                  animationPlayState: isPlaying ? 'running' : 'paused',
                }}
              />
            );
          })}
        </g>
        
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
                stroke="rgba(100,255,218,0.25)" 
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
          const cellIdx1 = Math.round(inter1.x / 5.0);
          const hasBreached = h && h[cellIdx1] > f.thresholdHeight;
          if (!hasBreached) return null;
          
          const travelX = inter2.x - inter1.x;
          const travelY = inter2.y - inter1.y;
          
          return (
            <g key={`fault-flow-group-${idx}`}>
              {/* 1. Illuminated active permeable conduit fluid core (strictly between Primary & Secondary reservoirs) */}
              <line 
                x1={inter1.x} 
                y1={inter1.y} 
                x2={inter2.x} 
                y2={inter2.y} 
                stroke="#0dfca2" 
                strokeWidth="3.5" 
                opacity="0.22" 
                style={{ filter: 'blur(2.5px)' }}
              />
              <line 
                x1={inter1.x} 
                y1={inter1.y} 
                x2={inter2.x} 
                y2={inter2.y} 
                stroke="#0dfca2" 
                strokeWidth="1.6" 
                strokeDasharray="5 4" 
                opacity="0.85" 
                style={{ 
                  animation: 'conduitFlow 1.2s linear infinite',
                  animationPlayState: isPlaying ? 'running' : 'paused'
                }}
              />

              {/* 2. Dispersal arrival marker where fault feeds into the secondary shallow reservoir */}
              <circle 
                cx={inter2.x} 
                cy={inter2.y} 
                r="1.8" 
                fill="#0dfca2" 
                opacity="0.85" 
              />

              {/* 3. Micro-fluid Pulses ascending strictly along the sloped fault plane from Layer 1 to Layer 2 */}
              {[0, 0.5, 1.0, 1.5, 2.0].map((delay, i) => (
                <circle 
                  key={`fb-${idx}-${i}`} 
                  cx={inter1.x} 
                  cy={inter1.y} 
                  r="1.8" 
                  fill="#0dfca2" 
                  style={{
                    opacity: 0,
                    '--travel-x': `${travelX}px`,
                    '--travel-y': `${travelY}px`,
                    animation: `faultRise 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s infinite`,
                    animationPlayState: isPlaying ? 'running' : 'paused',
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>



      {/* Brine label far from the plume (left side) — context label with improved high contrast */}
      <div style={{
        position: 'absolute',
        left: '22%', top: 'calc(42vh + 22vh)',
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

    <p style={{
      margin: '18px 0 0',
      maxWidth: 540,
      fontSize: 16,
      lineHeight: 1.6,
      color: 'rgba(255,255,255,0.82)',
    }}>
      Building <strong style={{ color: '#64ffda', fontWeight: 600 }}>Vertical Equilibrium models</strong> for simulating <strong style={{ color: '#64ffda', fontWeight: 600 }}>CO<sub>2</sub> storage</strong> in depleted gas reservoirs — the cross-section below is essentially the thing I simulate.
    </p>

    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <BrandSocial icon="fa-brands fa-linkedin-in" tint="#0a66c2" url="https://www.linkedin.com/in/stelvari/" />
        <BrandSocial icon="fa-brands fa-github"      tint="#22272e" url="https://github.com/saeedtelvari" />
        <BrandSocial icon="fa-solid fa-graduation-cap" tint="#4285f4" url="https://scholar.google.co.uk/citations?user=_nGa8EQAAAAJ&hl=en&inst=16061989973938494330" />
        <BrandSocial icon="fa-solid fa-envelope"     tint="#ea4335" url="mailto:st4014@hw.ac.uk" />
      </div>
      <div style={{ height: 22, width: 1, background: 'rgba(255,255,255,0.18)' }}/>
      <a 
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

const BrandSocial = ({ icon, tint, url }) => {
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
      aria-label="social link"
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

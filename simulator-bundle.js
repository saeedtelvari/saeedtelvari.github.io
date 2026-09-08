"use strict";
// Auto-generated bundle — Pre-compiled for instant execution
var { useState, useEffect, useMemo, useRef, useCallback } = React;

// File: ve2d-model.js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VE2D = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const depthGridCache = new Map();
  const faultYBounds = (fault, height) => {
    const start = clamp(Number(fault?.yStartPercent ?? 0), 0, 100) / 100 * height;
    const end = clamp(Number(fault?.yEndPercent ?? 100), 0, 100) / 100 * height;
    return [Math.min(start, end), Math.max(start, end)];
  };
  const faultCoversY = (fault, y, height) => {
    const [minY, maxY] = faultYBounds(fault, height);
    return y >= minY - 1e-9 && y <= maxY + 1e-9;
  };
  const hashNoise = (x, y, seed) => {
    const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const smoothNoise = (x, y, seed) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = x - x0;
    const ty = y - y0;
    const smooth = value => value * value * (3 - 2 * value);
    const sx = smooth(tx);
    const sy = smooth(ty);
    const n00 = hashNoise(x0, y0, seed);
    const n10 = hashNoise(x0 + 1, y0, seed);
    const n01 = hashNoise(x0, y0 + 1, seed);
    const n11 = hashNoise(x0 + 1, y0 + 1, seed);
    const top = n00 + (n10 - n00) * sx;
    const bottom = n01 + (n11 - n01) * sx;
    return top + (bottom - top) * sy;
  };
  const terrainNoise = (x, y, seed) => {
    let value = 0;
    let weight = 0;
    let amplitude = 1;
    for (let octave = 0; octave < 5; octave++) {
      const scale = 1.5 * 2 ** octave;
      value += smoothNoise(x * scale, y * scale, seed + octave * 101) * amplitude;
      weight += amplitude;
      amplitude *= 0.5;
    }
    return value / weight;
  };

  // Seeded, anisotropic domes and basins give the surface a structural character
  // without the repeating bands produced by a sinusoidal field.
  const terrainFeatureField = (x, y, seed) => {
    let value = 0;
    for (let index = 0; index < 11; index++) {
      const centerX = 0.08 + hashNoise(index * 1.7, 0.3, seed + 17) * 0.84;
      const centerY = 0.08 + hashNoise(index * 2.3, 0.7, seed + 41) * 0.84;
      const angle = hashNoise(index * 3.1, 1.1, seed + 73) * Math.PI * 2;
      const major = 0.1 + hashNoise(index * 4.1, 1.5, seed + 101) * 0.18;
      const minor = 0.05 + hashNoise(index * 5.3, 1.9, seed + 131) * 0.12;
      const dx = x - centerX;
      const dy = y - centerY;
      const along = dx * Math.cos(angle) + dy * Math.sin(angle);
      const across = -dx * Math.sin(angle) + dy * Math.cos(angle);
      const amplitude = (index % 2 ? -1 : 1) * (0.45 + hashNoise(index * 6.7, 2.2, seed + 163) * 0.55);
      value += amplitude * Math.exp(-0.5 * ((along / major) ** 2 + (across / minor) ** 2));
    }
    return clamp(value * 0.62, -1, 1);
  };

  // Seeded multi-scale terrain field. It deliberately avoids periodic waves.
  const terrainWaveField = (x, y, seed) => {
    const warpX = (smoothNoise(x * 1.1 + 4.1, y * 1.1 + 8.7, seed + 19) - 0.5) * 0.18;
    const warpY = (smoothNoise(x * 1.1 + 13.3, y * 1.1 + 2.6, seed + 43) - 0.5) * 0.18;
    const warpedX = x + warpX;
    const warpedY = y + warpY;
    const rotation = hashNoise(0.7, 0.2, seed + 59) * Math.PI * 2;
    const rotatedX = warpedX * Math.cos(rotation) - warpedY * Math.sin(rotation);
    const rotatedY = warpedX * Math.sin(rotation) + warpedY * Math.cos(rotation);
    const broad = terrainFeatureField(warpedX, warpedY, seed + 211);
    const regional = terrainFeatureField(rotatedX * 0.78 + 0.2, rotatedY * 0.78 + 0.2, seed + 307);
    const detail = (terrainNoise(warpedX * 2.4, warpedY * 2.4, seed + 401) - 0.5) * 2;
    return clamp(broad * 0.68 + regional * 0.22 + detail * 0.1, -1, 1);
  };
  const structuralDomeField = (x, y, count, seed) => {
    let value = 0;
    for (let index = 0; index < count; index++) {
      const centerX = count === 1 ? 0.5 : 0.18 + hashNoise(index * 2.1, 0.4, seed + 503) * 0.64;
      const centerY = count === 1 ? 0.5 : 0.18 + hashNoise(index * 2.9, 0.8, seed + 547) * 0.64;
      const angle = hashNoise(index * 3.7, 1.2, seed + 571) * Math.PI;
      const along = (x - centerX) * Math.cos(angle) + (y - centerY) * Math.sin(angle);
      const across = -(x - centerX) * Math.sin(angle) + (y - centerY) * Math.cos(angle);
      value += Math.exp(-0.5 * ((along / 0.25) ** 2 + (across / 0.15) ** 2));
    }
    return value / count;
  };
  const createVe2dState = ({
    cols = 48,
    rows = 30
  } = {}) => {
    cols = clamp(Math.round(cols), 6, 160);
    rows = clamp(Math.round(rows), 6, 100);
    const size = cols * rows;
    return {
      cols,
      rows,
      h: new Array(size).fill(0),
      hMax: new Array(size).fill(0),
      masses: {
        injected: 0,
        trapped: 0,
        mobile: 0,
        leaked: 0
      }
    };
  };
  const faultXAtY = (fault, y, width, height) => (Number(fault?.xPercent) || 0) / 100 * width + (Number(fault?.dipSlope) || 0) * (y - height / 2);
  const faultSide = (x, y, fault, width, height) => x - faultXAtY(fault, y, width, height);
  const faultDisplacement = (x, y, fault, index, params) => {
    const [minY, maxY] = faultYBounds(fault, params.height);
    const lineX = faultXAtY(fault, y, params.width, params.height);
    if (y < minY || y > maxY || lineX <= 0 || lineX >= params.width || x <= lineX) return 0;
    const segmentLength = Math.max(1, maxY - minY);
    const taperLength = Math.min(params.height * 0.08, segmentLength * 0.22);
    const smoothstep = value => value * value * (3 - 2 * value);
    const startTaper = taperLength ? smoothstep(Math.max(0, Math.min(1, (y - minY) / taperLength))) : 1;
    const endTaper = taperLength ? smoothstep(Math.max(0, Math.min(1, (maxY - y) / taperLength))) : 1;
    return (index % 2 === 0 ? 1 : -1) * (params.faultOffset || 0) * 0.8 * Math.min(startTaper, endTaper);
  };
  const faceTransmissibility = (x1, y1, x2, y2, faults, width, height) => {
    let multiplier = 1;
    for (const fault of faults) {
      const sideA = faultSide(x1, y1, fault, width, height);
      const sideB = faultSide(x2, y2, fault, width, height);
      if (sideA * sideB <= 0) {
        const denominator = Math.abs(sideA) + Math.abs(sideB);
        const crossRatio = denominator > 1e-12 ? Math.abs(sideA) / denominator : 0.5;
        const crossY = y1 + (y2 - y1) * crossRatio;
        if (!faultCoversY(fault, crossY, height)) continue;
        multiplier = Math.min(multiplier, fault.isSealed ? 0 : clamp(fault.transmissibility ?? 1, 0, 1));
      }
    }
    return multiplier;
  };
  const topDepth = (x, y, params) => {
    const {
      width,
      height
    } = params;
    const xn = x / width - 0.5;
    const yn = y / height - 0.5;
    // UI inputs are percentages; use their fractional value in the depth field.
    const dip = xn * (params.dipX || 0) * 0.04 + yn * (params.dipY || 0) * 0.04;
    const amplitude = (params.structureAmplitude || 0) / 15;
    const structureCount = clamp(Math.round(params.structureFrequency || 1), 1, 4);
    const structureSeed = Number.isFinite(Number(params.terrainSeed)) ? Number(params.terrainSeed) : 0;
    let depth = dip - amplitude * structuralDomeField(x / width, y / height, structureCount, structureSeed);
    const heterogeneity = clamp(Number(params.heterogeneity ?? 0), 0, 1);
    if (heterogeneity > 0) {
      const seed = Number.isFinite(Number(params.terrainSeed)) ? Number(params.terrainSeed) : 0;
      const normalizedX = x / width;
      const normalizedY = y / height;
      const waveField = terrainWaveField(normalizedX, normalizedY, seed);
      const fineNoise = (terrainNoise(normalizedX, normalizedY, seed) - 0.5) * 2;
      depth += (waveField * 0.9 + fineNoise * 0.1) * heterogeneity * 3;
    }
    for (let i = 0; i < (params.faults || []).length; i++) {
      depth += faultDisplacement(x, y, params.faults[i], i, params);
    }
    return depth;
  };
  const partition = (height, maximum, residualFraction) => {
    const mobile = residualFraction < 1 ? Math.max(0, (height - residualFraction * maximum) / (1 - residualFraction)) : 0;
    const boundedMobile = Math.min(height, mobile);
    return {
      mobile: boundedMobile,
      trapped: Math.max(0, height - boundedMobile)
    };
  };
  const stepVe2d = (state, inputParams, frame) => {
    const cols = state.cols;
    const rows = state.rows;
    const params = {
      width: 1000,
      height: 600,
      permeability: 1.7,
      porosity: 0.25,
      residualTrapFraction: 0.25,
      injectionRate: 0,
      injectionDuration: 0,
      wellX: 50,
      wellY: 50,
      dipX: 0,
      dipY: 0,
      structureAmplitude: 0,
      structureFrequency: 1,
      faultOffset: 0,
      terrainSeed: 0,
      heterogeneity: 0,
      faults: [],
      ...inputParams
    };
    params.faults = (params.faults || []).filter(Boolean);
    params.porosity = clamp(params.porosity, 0.01, 0.8);
    params.residualTrapFraction = clamp(params.residualTrapFraction, 0, 0.95);
    const dx = params.width / cols;
    const dy = params.height / rows;
    const scaledArea = dx / 5 * (dy / 5);
    const substeps = 6;
    const dt = 1 / substeps;
    const capacity = 12;
    const mobility = 0.12 * clamp(params.permeability / params.porosity, 0.05, 20);
    let h = state.h.slice();
    const hMax = state.hMax.slice();
    let injected = state.masses.injected;
    let leaked = state.masses.leaked;
    const geometryKey = JSON.stringify({
      cols,
      rows,
      width: params.width,
      height: params.height,
      dipX: params.dipX,
      dipY: params.dipY,
      structureAmplitude: params.structureAmplitude,
      structureFrequency: params.structureFrequency,
      faultOffset: params.faultOffset,
      terrainSeed: params.terrainSeed,
      heterogeneity: params.heterogeneity,
      faults: params.faults
    });
    let geometry = depthGridCache.get(geometryKey);
    if (!geometry) {
      const cellX = new Array(h.length);
      const cellY = new Array(h.length);
      const cellDepth = new Array(h.length);
      for (let index = 0; index < h.length; index++) {
        cellX[index] = (index % cols + 0.5) * dx;
        cellY[index] = (Math.floor(index / cols) + 0.5) * dy;
        cellDepth[index] = topDepth(cellX[index], cellY[index], params);
      }
      geometry = {
        cellX,
        cellY,
        cellDepth
      };
      depthGridCache.set(geometryKey, geometry);
      if (depthGridCache.size > 8) depthGridCache.delete(depthGridCache.keys().next().value);
    }
    const {
      cellX,
      cellY,
      cellDepth
    } = geometry;
    for (let substep = 0; substep < substeps; substep++) {
      const mobile = h.map((value, index) => partition(value, hMax[index], params.residualTrapFraction).mobile);
      const delta = new Array(h.length).fill(0);
      const transfer = (from, to, distance) => {
        const trans = faceTransmissibility(cellX[from], cellY[from], cellX[to], cellY[to], params.faults, params.width, params.height);
        if (trans === 0) return;
        const potentialA = cellDepth[from] + h[from];
        const potentialB = cellDepth[to] + h[to];
        if (Math.abs(potentialA - potentialB) < 1e-12) return;
        const donor = potentialA > potentialB ? from : to;
        const receiver = donor === from ? to : from;
        const gradient = Math.abs(potentialA - potentialB) / Math.max(1, distance / 50);
        const amount = Math.min(mobile[donor] * 0.22, mobility * mobile[donor] * gradient * dt * trans);
        delta[donor] -= amount;
        delta[receiver] += amount;
      };
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          if (col + 1 < cols) transfer(index, index + 1, dx);
          if (row + 1 < rows) transfer(index, index + cols, dy);
        }
      }
      h = h.map((value, index) => Math.max(0, value + delta[index]));
      if (params.injectionRate > 0 && frame <= params.injectionDuration) {
        const wellCol = clamp(Math.floor(params.wellX / 100 * cols), 0, cols - 1);
        const wellRow = clamp(Math.floor(params.wellY / 100 * rows), 0, rows - 1);
        const cells = [];
        let weightSum = 0;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const col = wellCol + ox;
            const row = wellRow + oy;
            if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
            const weight = Math.exp(-(ox * ox + oy * oy));
            cells.push({
              index: row * cols + col,
              weight
            });
            weightSum += weight;
          }
        }
        const injectedThisStep = params.injectionRate * dt;
        for (const cell of cells) {
          h[cell.index] += injectedThisStep * cell.weight / weightSum / (params.porosity * scaledArea);
        }
        injected += injectedThisStep;
      }
      for (let index = 0; index < h.length; index++) {
        for (const fault of params.faults) {
          if (fault.isSealed || !fault.leakRate) continue;
          if (!faultCoversY(fault, cellY[index], params.height)) continue;
          const distance = Math.abs(faultSide(cellX[index], cellY[index], fault, params.width, params.height));
          if (distance > Math.max(dx, dy) * 0.55 || h[index] <= (fault.thresholdHeight || 0)) continue;
          const lostHeight = Math.min(h[index] - (fault.thresholdHeight || 0), fault.leakRate * dt * 0.12);
          h[index] -= lostHeight;
          leaked += lostHeight * params.porosity * scaledArea;
        }
        if (h[index] > capacity) {
          leaked += (h[index] - capacity) * params.porosity * scaledArea;
          h[index] = capacity;
        }
        hMax[index] = Math.max(hMax[index], h[index]);
      }
    }
    let mobileMass = 0;
    let trappedMass = 0;
    for (let index = 0; index < h.length; index++) {
      const phases = partition(h[index], hMax[index], params.residualTrapFraction);
      mobileMass += phases.mobile * params.porosity * scaledArea;
      trappedMass += phases.trapped * params.porosity * scaledArea;
    }
    return {
      cols,
      rows,
      h,
      hMax,
      masses: {
        injected: +injected.toFixed(4),
        trapped: +trappedMass.toFixed(4),
        mobile: +mobileMass.toFixed(4),
        leaked: +leaked.toFixed(4)
      }
    };
  };
  return {
    createVe2dState,
    stepVe2d,
    topDepth,
    faceTransmissibility,
    faultCoversY,
    faultXAtY,
    terrainNoise,
    terrainFeatureField,
    terrainWaveField,
    structuralDomeField,
    faultDisplacement
  };
});

// File: GuidePage.jsx
// GuidePage.jsx — Interactive VE Simulator Equations & Methodology Guide
// [destructured React]

const GuidePage = ({
  isEmbedded = false
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "guide-page-wrapper",
    style: {
      padding: isEmbedded ? '10px 5px' : '110px 4% 60px',
      minHeight: isEmbedded ? 'auto' : '100vh',
      background: isEmbedded ? 'transparent' : '#130d1c',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 30
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        .guide-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 25px;
        }
        @media (min-width: 900px) {
          .guide-grid {
            grid-template-columns: 1.1fr 0.9fr;
          }
          .full-width-card {
            grid-column: span 2;
          }
        }
        .math-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s ease;
        }
        .math-card:hover {
          border-color: rgba(100, 255, 218, 0.25);
          box-shadow: 0 8px 32px rgba(100, 255, 218, 0.05);
        }
        .math-header {
          margin: 0;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64ffda;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .math-text {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          margin: 0;
        }
        .equation-block {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cambria Math', 'Times New Roman', serif;
          font-size: 1.25rem;
          margin: 20px 0;
          color: #0dfca2;
          background: rgba(0,0,0,0.22);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          text-shadow: 0 0 10px rgba(13,252,162,0.15);
          user-select: all;
          overflow-x: auto;
          white-space: nowrap;
        }
        .fraction {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 0 6px;
          vertical-align: middle;
        }
        .numerator {
          border-bottom: 1.2px solid rgba(255,255,255,0.8);
          padding-bottom: 2px;
          text-align: center;
          font-size: 0.95em;
        }
        .denominator {
          padding-top: 2px;
          text-align: center;
          font-size: 0.95em;
        }
        .parenthesis {
          font-size: 1.9em;
          font-weight: 200;
          vertical-align: middle;
          margin: 0 2px;
        }
        .subscript {
          font-size: 0.65em;
          vertical-align: sub;
          margin-left: 1px;
        }
        .superscript {
          font-size: 0.65em;
          vertical-align: super;
        }
        .variable {
          font-style: italic;
          margin: 0 1px;
        }
      `), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.20em',
      textTransform: 'uppercase',
      color: '#64ffda',
      fontWeight: 600,
      marginBottom: 6
    }
  }, "VE Theory & Educational Simulator"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'clamp(28px, 4vw, 38px)',
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700
    }
  }, "Model Scope & Methodology Guide"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      color: 'rgba(255,255,255,0.65)',
      fontSize: 13.5,
      maxWidth: 780
    }
  }, "This guide separates general Vertical Equilibrium theory from the educational model used by this browser simulator. The interactive solver is a reduced, height-based finite-volume demonstration\u2014not a research-grade compositional simulator.")), /*#__PURE__*/React.createElement("div", {
    className: "guide-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "math-card full-width-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-layer-group"
  }), " 1. The Vertical Equilibrium (VE) Formulation"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Saline aquifer CO\u2082 storage formations are typically thin, lateral sandstone layers with high aspect ratios where the reservoir length is far greater than the vertical thickness (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "H"), " \u226A ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "L"), "). In such geometries, buoyancy forces drive rapid vertical segregation on a timescale much faster than regional horizontal migration (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "vert"), " \u226A ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "horiz"), "). Supercritical CO\u2082 quickly floats to the caprock ceiling, while denser brine water settles below."), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The ", /*#__PURE__*/React.createElement("strong", null, "Vertical Equilibrium (VE) approximation"), " assumes that fluids segregate rapidly along the vertical coordinate and remain in hydrostatic balance:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"))), " = - \u03C1(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " \u2003\u21D2\u2003 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "top"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") + \u222B", /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z")), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "0"), " \u03C1(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z'"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "dz'")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "In general VE formulations, vertically integrating multiphase porous-media conservation equations reduces the spatial dimension. The educational model below applies that idea to plume height; it does not solve the full 3D Navier\u2013Stokes or compositional equations.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-tint"
  }), " 2. Multi-Phase Saturation Limits & Sum Rule"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "At every point in the pore space, the pore volume is completely occupied by gas (supercritical CO\u2082) and aqueous brine:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") + ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") = 1.0"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The saturation boundaries are parameterized by critical rock-fluid endpoints:", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Connate / irreducible water saturation"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), "): capillary-bound water not displaced by gas.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Maximum mobile gas saturation"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g,max"), " = 1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), ").", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("strong", null, "Residual gas saturation"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), "): disconnected gas retained during imbibition.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-water"
  }), " 3. Reference Theory: Brooks\u2013Corey Capillary Pressure"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "A common research formulation represents the capillary transition with the ", /*#__PURE__*/React.createElement("strong", null, "Brooks\u2013Corey retention law"), ":"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "-1/\u03BB")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Under hydrostatic VE balance, this can reconstruct a vertical gas saturation profile:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") = (1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), ") ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "["), " 1 - ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g"), " (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), ") + ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "ce"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "\u03BB"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "]")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "This constitutive law is shown for context. The browser solver does not evaluate it; its entry-pressure control changes only the illustrated fringe thickness.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-chart-line"
  }), " 4. Reference Theory: Corey Relative Permeability"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Research-grade multiphase models often use ", /*#__PURE__*/React.createElement("strong", null, "Corey-type relative permeabilities"), ":"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rg"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rg"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "n", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "g"))), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rw"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), ") = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "k"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "rw"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "0"), " ", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "wc"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "n", /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "w"))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "These curves are background theory, not equations evaluated by this educational model. The solver instead uses a direct mobile-height mobility proportional to permeability and plume thickness.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-wave-square"
  }), " 5. Implemented 1D & 2D Height Transport"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The cross-section evolves ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), "), while the plan-view model evolves ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), "(", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "y"), ", ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"), ") on a rectangular grid. Both use vertically integrated mass conservation; the 2D form is:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "\u03C6 ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t"))), " +", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "x")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), " +", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "y")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "y"))), " =", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "inj"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The browser implementation uses explicit first-order upwind finite-volume fluxes between two neighbours in the cross-section and four neighbours in the x\u2013y map. Each substep caps outgoing mobile volume for numerical robustness:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "|", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "i+1/2"), "| \u2264 ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "0.30 \u2022 \u03C6 \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob,upwind")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "t")))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The cap is a practical stability safeguard. The interface reports a numerical mass-balance diagnostic; it does not claim exact conservation or a formal TVD/CFL proof.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-exchange-alt"
  }), " 6. Integrated Darcy Fluid Flux & Faults"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "The vertically-integrated Darcy flux ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), " combines structural gradients and buoyant spreading. In the map, the same expression is evaluated independently on x and y cell faces:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "q"), " = - ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "K"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob"), " \u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u03BC")), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "["), /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "t")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), " +", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u2202 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "x"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "]"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where:", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "K"), " is sandstone permeability.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "z"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "t"), " is the vertical depth profile of the caprock ceiling underside.", /*#__PURE__*/React.createElement("br", null), "\u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault"), " &in; [0, 1] is cross-fault horizontal transmissibility (", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "T"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "fault"), " = 0 for completely sealed barrier faults).")), /*#__PURE__*/React.createElement("div", {
    className: "math-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-lock"
  }), " 7. Residual Capillary Trapping & Envelope"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "As the plume migrates updip under buoyancy, trailing-edge water imbibition snaps off CO\u2082 bubbles inside sandstone pores. In VE, the total height is partitioned into immobile trapped and flowing mobile components:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "trapped"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), " \u2022 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max")), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "mob"), " = max", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), "0, ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"), " ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "1 - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "S"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "gr"))), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Here ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "max"), " is the historical maximum gas envelope at each x or x\u2013y cell. It appears as the cyan dashed boundary in cross-section and contributes to the trapped-gas colour in plan view.")), /*#__PURE__*/React.createElement("div", {
    className: "math-card full-width-card"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "math-header"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-bolt"
  }), " 8. Capillary Seal Breaching & Fault Conduit Leakage"), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Fault zones act as structural barrier seals due to clay smearing, creating high capillary entry pressures. For CO\u2082 to breach the seal and escape vertically into overlying strata, the buoyant overpressure must exceed the capillary entry threshold:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, "\u0394", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "buoyancy"), " > ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "entry"), " \u2003\u21D2\u2003 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " > ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "threshold"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "fraction"
  }, /*#__PURE__*/React.createElement("span", {
    className: "numerator"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "P"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "c"), /*#__PURE__*/React.createElement("span", {
    className: "superscript"
  }, "entry")), /*#__PURE__*/React.createElement("span", {
    className: "denominator"
  }, "\u0394\u03C1 ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "g")))), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Once the spill height is exceeded, vertical leakage volume rate follows Darcy's conduit law:"), /*#__PURE__*/React.createElement("div", {
    className: "equation-block"
  }, /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "Q"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " = ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "C"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " \u2022 max", /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, "("), "0, ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), " - ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "h"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "threshold"), /*#__PURE__*/React.createElement("span", {
    className: "parenthesis"
  }, ")")), /*#__PURE__*/React.createElement("p", {
    className: "math-text"
  }, "Where ", /*#__PURE__*/React.createElement("span", {
    className: "variable"
  }, "C"), /*#__PURE__*/React.createElement("span", {
    className: "subscript"
  }, "leak"), " is the vertical fault zone permeability transmissibility."))));
};

// Bind to window object for Babel execution scope
Object.assign(window, {
  GuidePage
});

// File: SimulatorPage.jsx
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// SimulatorPage.jsx — Interactive VE Simulator Page
// [destructured React]

const SIM_TABS = ['profile', 'map', 'topography', 'uq', 'guide'];
const VISUALIZATION_TABS = ['profile', 'map', 'topography'];
const MAP_TABS = ['map', 'topography'];

// Declarative registry of every parameter the UQ batch can sample.
// dec = display decimals; dec 0 params are sampled as integers.
const UQ_PARAM_DEFS = [{
  key: 'K',
  label: 'Permeability (K)',
  lo: 0.1,
  hi: 3.5,
  dec: 2,
  percentDef: 40
}, {
  key: 'residualTrapFraction',
  label: 'Residual Trap (Sgr)',
  lo: 0.0,
  hi: 0.40,
  dec: 3,
  percentDef: 40
}, {
  key: 'porosity',
  label: 'Porosity (\u03C6)',
  lo: 0.10,
  hi: 0.40,
  dec: 3,
  percentDef: 20
}, {
  key: 'Q',
  label: 'Injection Rate (Q)',
  lo: 0.0,
  hi: 3.5,
  dec: 2,
  percentDef: 30
}, {
  key: 'injLocation',
  label: 'Well Position (%)',
  lo: 10,
  hi: 90,
  dec: 0,
  percentDef: 8
}, {
  key: 'dipPercent',
  label: 'Regional Dip (%)',
  lo: -5.0,
  hi: 5.0,
  dec: 2,
  percentDef: 35
}, {
  key: 'amplitude',
  label: 'Anticline Height (px)',
  lo: 0,
  hi: 50,
  dec: 0,
  percentDef: 25
}, {
  key: 'faultThreshold',
  label: 'Fault Seal Threshold (m)',
  lo: 0.0,
  hi: 2.0,
  dec: 2,
  percentDef: 50,
  group: 'fault'
}, {
  key: 'faultLeakRate',
  label: 'Fault Leak Rate',
  lo: 0.01,
  hi: 0.40,
  dec: 3,
  percentDef: 40,
  group: 'fault',
  leakingOnly: true
}, {
  key: 'faultTransmissibility',
  label: 'Fault Transmissibility',
  lo: 0.0,
  hi: 1.0,
  dec: 2,
  percentDef: 30,
  group: 'fault'
}];
const roundDec = (v, d) => d === 0 ? Math.round(v) : +v.toFixed(d);

// Parse a free-text list like "1.0, 1.5; 2  2.5" into finite numbers.
// Empty tokens are dropped BEFORE Number() — Number('') is 0, not NaN.
const parseValueList = text => (text || '').split(/[\s,;]+/).filter(t => t.length > 0).map(Number).filter(v => isFinite(v));
const scenarioNumber = (query, key, min, max, fallback, integer = false) => {
  if (!query.has(key)) return fallback;
  const value = Number(query.get(key));
  if (!isFinite(value)) return fallback;
  const clamped = Math.max(min, Math.min(max, value));
  return integer ? Math.round(clamped) : clamped;
};
const createScenarioSignature = parameters => JSON.stringify(parameters);
const updateScenarioParameter = (scenario, key, value) => {
  const next = {
    ...scenario,
    [key]: typeof value === 'function' ? value(scenario[key]) : value
  };
  if (key === 'faultCount' || key === 'faults') {
    next.faults = Array.from({
      length: Math.max(next.faultCount, next.faults.length)
    }, (_, index) => next.faults[index] || {
      xPercent: 30 + index * 20,
      yStartPercent: 0,
      yEndPercent: 100,
      isSealed: false,
      thresholdHeight: 0.3,
      leakRate: 0.12,
      transmissibility: 1,
      dipSlope: 0
    });
  }
  return next;
};
const massBalanceCsv = (history, modelType, terrainSeed) => ['year,injected_kt,mobile_kt,trapped_kt,leaked_kt,model_type,terrain_seed', ...history.map(r => [r.time, r.injected, r.mobile, r.trapped, r.leaked, modelType, modelType === 'map' ? terrainSeed : ''].join(','))].join('\n');
const deriveRunStatus = ({
  isPlaying,
  isReversing,
  scenarioSignature,
  lastRunSignature,
  simTime
}) => isPlaying ? 'Running' : isReversing ? 'Running backward' : scenarioSignature !== lastRunSignature ? 'Inputs changed' : simTime > 0 ? 'Paused' : 'Ready';
const executeFileAction = (action, onFailure) => {
  try {
    action();
    return true;
  } catch (_) {
    onFailure();
    return false;
  }
};
const getPlaybackAction = ({
  isPlaying,
  simTime,
  scenarioChanged
}) => isPlaying ? 'pause' : simTime === 0 || scenarioChanged ? 'run-scenario' : 'resume';
const selectActiveResults = (activeView, crossSection, map) => activeView === 'map' || activeView === 'topography' ? map : crossSection;
const consumeMapCommand = (command, handledId) => command?.id === handledId ? null : command;
const createMapSnapshot = ({
  time,
  mapState,
  history,
  isRunning,
  speed,
  params
}) => ({
  time,
  h: mapState.h,
  hMax: mapState.hMax,
  masses: mapState.masses,
  history,
  isRunning,
  speed,
  params
});
const getMapPlaybackTransition = ({
  isRunning,
  speed
}, type) => {
  if (type === 'run') return {
    reset: true,
    isRunning: true
  };
  if (type === 'reset') return {
    reset: true,
    isRunning: false
  };
  if (type === 'pause') return {
    isRunning: false
  };
  if (type === 'resume') return {
    isRunning: true
  };
  if (type === 'step') return {
    isRunning: false,
    advance: true
  };
  if (type === 'speed') return {
    speed: speed === 1 ? 2 : speed === 2 ? 4 : 1
  };
  return null;
};
const deriveMapRunStatus = (snapshot, scenarioSignature, lastRunSignature) => deriveRunStatus({
  isPlaying: snapshot.isRunning,
  isReversing: false,
  scenarioSignature,
  lastRunSignature,
  simTime: snapshot.time
});
const DEFAULT_TOPOGRAPHY_CAMERA = {
  azimuth: -0.72,
  elevation: 0.62,
  zoom: 1
};
const createRandomGridConfig = (random = Math.random) => {
  const randomInt = (min, max) => Math.floor(min + random() * (max - min + 1));
  const randomValue = (min, max, decimals = 2) => roundDec(min + random() * (max - min), decimals);
  const randomFault = index => {
    const yStartPercent = randomInt(1, 10) * 5;
    const yEndPercent = yStartPercent + randomInt(5, Math.floor((95 - yStartPercent) / 5)) * 5;
    return {
      xPercent: randomInt(5, 15) * 5,
      yStartPercent,
      yEndPercent,
      isSealed: random() < 0.3,
      thresholdHeight: 0.2 + randomInt(0, 3) * 0.1,
      leakRate: 0.06 + randomInt(0, 8) * 0.02,
      transmissibility: 0.35 + randomInt(0, 12) * 0.05,
      dipSlope: randomValue(index % 2 ? -0.22 : -0.26, index % 2 ? 0.22 : 0.26, 2)
    };
  };
  const faultCount = randomInt(1, 3);
  return {
    terrainSeed: randomInt(1, 999999),
    heterogeneity: 0.6 + randomInt(0, 7) * 0.05,
    mapCols: 80 + randomInt(0, 6) * 8,
    dipPercent: -2.5 + randomInt(0, 10) * 0.5,
    amplitude: randomInt(1, 4) * 5,
    frequency: 1,
    faultOffset: 0.4 + randomInt(0, 11) * 0.2,
    faultCount,
    faults: Array.from({
      length: 3
    }, (_, index) => randomFault(index))
  };
};
const clampTopographyCamera = (camera = {}) => {
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
  };
  return {
    azimuth: clamp(camera.azimuth, -Math.PI * 2, Math.PI * 2, DEFAULT_TOPOGRAPHY_CAMERA.azimuth),
    elevation: clamp(camera.elevation, 0.22, 1.12, DEFAULT_TOPOGRAPHY_CAMERA.elevation),
    zoom: clamp(camera.zoom, 0.65, 2.2, DEFAULT_TOPOGRAPHY_CAMERA.zoom)
  };
};
const resetTopographyCamera = () => ({
  ...DEFAULT_TOPOGRAPHY_CAMERA
});
const projectTopographyPoint = ({
  x = 0.5,
  y = 0.5,
  height = 0.5
} = {}, camera, canvasWidth, canvasHeight) => {
  const numeric = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const width = Math.max(0, Number(canvasWidth) || 0);
  const heightPx = Math.max(0, Number(canvasHeight) || 0);
  const {
    azimuth,
    elevation,
    zoom
  } = clampTopographyCamera(camera);
  const dx = numeric(x, 0.5) - 0.5;
  const dy = numeric(y, 0.5) - 0.5;
  const dz = numeric(height, 0.5) - 0.5;
  const rotatedX = dx * Math.cos(azimuth) - dy * Math.sin(azimuth);
  const depth = dx * Math.sin(azimuth) + dy * Math.cos(azimuth);
  const projectedX = 0.5 + rotatedX * zoom * 0.62;
  const projectedY = 0.5 + (depth * Math.cos(elevation) - dz * Math.sin(elevation)) * zoom * 0.62;
  return {
    x: projectedX * width,
    y: projectedY * heightPx
  };
};
const faultXAtNormalizedY = (fault, y) => {
  if (typeof globalThis.VE2D?.faultXAtY === 'function') return globalThis.VE2D.faultXAtY(fault, y * 600, 1000, 600) / 1000;
  return (Number(fault?.xPercent) || 0) / 100 + (Number(fault?.dipSlope) || 0) * 0.6 * (y - 0.5);
};
const visibleFaultSegment = fault => {
  const start = Math.max(0, Math.min(100, Number(fault?.yStartPercent ?? 0))) / 100;
  const end = Math.max(0, Math.min(100, Number(fault?.yEndPercent ?? 100))) / 100;
  const yStart = Math.min(start, end);
  const yEnd = Math.max(start, end);
  const xAtCenter = (Number(fault?.xPercent) || 0) / 100;
  const normalizedSlope = (Number(fault?.dipSlope) || 0) * 0.6;
  if (Math.abs(normalizedSlope) < 1e-9) return xAtCenter > 0 && xAtCenter < 1 ? {
    yStart,
    yEnd
  } : null;
  const crossings = [(0 - xAtCenter) / normalizedSlope + 0.5, (1 - xAtCenter) / normalizedSlope + 0.5];
  const clippedStart = Math.max(yStart, Math.min(...crossings));
  const clippedEnd = Math.min(yEnd, Math.max(...crossings));
  return clippedEnd - clippedStart > 1e-6 ? {
    yStart: clippedStart,
    yEnd: clippedEnd
  } : null;
};
const faultEndpointFade = (y, segment) => {
  const length = Math.max(1e-6, segment.yEnd - segment.yStart);
  const taper = Math.min(0.08, length * 0.22);
  const smoothstep = value => value * value * (3 - 2 * value);
  const start = smoothstep(Math.max(0, Math.min(1, (y - segment.yStart) / taper)));
  const end = smoothstep(Math.max(0, Math.min(1, (segment.yEnd - y) / taper)));
  return Math.min(start, end);
};
const faultEndpointCoordinates = segment => {
  const length = Math.max(1e-6, segment.yEnd - segment.yStart);
  const taper = Math.min(0.08, length * 0.22);
  return [segment.yStart, segment.yStart + taper * 0.25, segment.yStart + taper * 0.5, segment.yStart + taper * 0.75, segment.yStart + taper, segment.yEnd - taper, segment.yEnd - taper * 0.75, segment.yEnd - taper * 0.5, segment.yEnd - taper * 0.25, segment.yEnd];
};
const clipPolygonByFault = (points, fault, keepRight) => {
  const clipped = [];
  for (let index = 0; index < points.length; index++) {
    const from = points[index];
    const to = points[(index + 1) % points.length];
    const fromSide = from.x - faultXAtNormalizedY(fault, from.y);
    const toSide = to.x - faultXAtNormalizedY(fault, to.y);
    const fromInside = keepRight ? fromSide >= -1e-9 : fromSide <= 1e-9;
    const toInside = keepRight ? toSide >= -1e-9 : toSide <= 1e-9;
    if (fromInside) clipped.push(from);
    if (fromInside !== toInside) {
      const ratio = fromSide / (fromSide - toSide);
      clipped.push({
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio
      });
    }
  }
  return clipped;
};
const splitTopographyPieceByFault = (piece, fault, faultIndex, y0, y1, segment) => {
  if (y0 < segment.yStart - 1e-9 || y1 > segment.yEnd + 1e-9) return [piece];
  const sides = piece.points.map(point => point.x - faultXAtNormalizedY(fault, point.y));
  if (Math.min(...sides) >= -1e-9 || Math.max(...sides) <= 1e-9) return [piece];
  const left = clipPolygonByFault(piece.points, fault, false);
  const right = clipPolygonByFault(piece.points, fault, true);
  return [...(left.length >= 3 ? [{
    points: left,
    faultSides: {
      ...piece.faultSides,
      [faultIndex]: -1
    }
  }] : []), ...(right.length >= 3 ? [{
    points: right,
    faultSides: {
      ...piece.faultSides,
      [faultIndex]: 1
    }
  }] : [])];
};
const formatMass = value => `${Number(value || 0).toLocaleString('en-GB', {
  maximumFractionDigits: 1
})} kt`;
const copyTextToClipboard = async (text, clipboard, fallback) => {
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return true;
    } catch (_) {/* Try the legacy copy path below. */}
  }
  try {
    return Boolean(fallback(text));
  } catch (_) {
    return false;
  }
};
const toggleMobilePanel = (currentPanel, requestedPanel) => currentPanel === requestedPanel ? null : requestedPanel;
const focusMobilePanelTrigger = (panel, triggers) => {
  const trigger = triggers[panel];
  if (!trigger || trigger.isConnected === false) return;
  const visible = typeof trigger.getClientRects !== 'function' || trigger.getClientRects().length > 0;
  if (visible && typeof trigger.focus === 'function') trigger.focus();
};
const lockPageScroll = pageDocument => {
  const previousOverflow = pageDocument.body.style.overflow;
  pageDocument.body.style.overflow = 'hidden';
  return () => {
    pageDocument.body.style.overflow = previousOverflow;
  };
};
const selectPresentedMobilePanel = (panel, viewport) => viewport.mobile ? panel : viewport.compact && panel === 'outcomes' ? panel : null;
const getMobileFocusWrapTarget = (focusables, activeElement, backwards) => {
  if (!focusables.length) return null;
  const currentIndex = focusables.indexOf(activeElement);
  if (currentIndex === -1) return backwards ? focusables[focusables.length - 1] : focusables[0];
  if (backwards && currentIndex === 0) return focusables[focusables.length - 1];
  if (!backwards && currentIndex === focusables.length - 1) return focusables[0];
  return null;
};
const setMobilePanelBackgroundInert = (elements, inert) => {
  elements.filter(Boolean).forEach(element => {
    element.inert = inert;
  });
};
const normalizeParameterInput = (raw, min, max) => {
  if (String(raw).trim() === '') {
    return {
      value: null,
      message: `Enter a number from ${min} to ${max}.`
    };
  }
  const number = Number(raw);
  if (!Number.isFinite(number)) {
    return {
      value: null,
      message: `Enter a number from ${min} to ${max}.`
    };
  }
  const value = Math.max(min, Math.min(max, number));
  return {
    value,
    message: value === number ? '' : `Corrected to ${value} (allowed range ${min}–${max}).`
  };
};
const THEME_STORAGE_KEY = 've-simulator-theme';
const getStoredTheme = storage => {
  try {
    return storage?.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch (_) {
    return 'light';
  }
};
const persistTheme = (theme, storage) => {
  if (theme !== 'dark' && theme !== 'light') return;
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch (_) {/* Storage may be unavailable in private browsing. */}
};

// Draw one sample for a parameter given its config and nominal value.
// Returns { value, sampled } — sampled=false means the nominal was used unchanged.
const sampleUqParam = (def, cfg, nominal) => {
  if (!cfg || !cfg.enabled) return {
    value: nominal,
    sampled: false
  };
  const clampDef = v => Math.max(def.lo, Math.min(def.hi, v));
  if (cfg.mode === 'range') {
    let a = isFinite(cfg.min) ? cfg.min : def.lo;
    let b = isFinite(cfg.max) ? cfg.max : def.hi;
    if (a > b) {
      const t = a;
      a = b;
      b = t;
    }
    return {
      value: roundDec(clampDef(a + Math.random() * (b - a)), def.dec),
      sampled: true
    };
  }
  if (cfg.mode === 'values') {
    const vals = parseValueList(cfg.values);
    if (vals.length === 0) return {
      value: nominal,
      sampled: false
    };
    return {
      value: roundDec(clampDef(vals[Math.floor(Math.random() * vals.length)]), def.dec),
      sampled: true
    };
  }

  // percent mode (+/- of nominal)
  const unc = (isFinite(cfg.percent) ? cfg.percent : def.percentDef) / 100;
  return {
    value: roundDec(clampDef(nominal * (1.0 - unc) + Math.random() * (2.0 * unc * nominal)), def.dec),
    sampled: true
  };
};

// Per-parameter sampling config editor: enable checkbox + mode toggle + mode inputs
const UQParamConfig = ({
  def,
  cfg,
  onChange
}) => {
  const inputStyle = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    padding: '3px 6px',
    borderRadius: 6,
    fontSize: 10.5,
    fontFamily: 'monospace',
    width: 58
  };
  const numVal = v => isFinite(v) ? v : '';
  const numChange = e => e.target.value === '' ? NaN : parseFloat(e.target.value);
  const stepVal = def.dec === 0 ? 1 : Math.pow(10, -def.dec);
  return /*#__PURE__*/React.createElement("div", {
    className: "ve-uq-parameter",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      opacity: cfg.enabled ? 1 : 0.45,
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${cfg.enabled ? 'rgba(100,255,218,0.18)' : 'rgba(255,255,255,0.05)'}`,
      borderRadius: 10,
      padding: '8px 10px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 10.5,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: cfg.enabled,
    onChange: e => onChange({
      enabled: e.target.checked
    }),
    "aria-label": `Include ${def.label} in uncertainty analysis`,
    style: {
      accentColor: '#64ffda'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: cfg.enabled ? '#64ffda' : 'rgba(255,255,255,0.7)',
      fontWeight: cfg.enabled ? 'bold' : 500,
      flex: 1
    }
  }, def.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3
    },
    role: "group",
    "aria-label": `${def.label} sampling mode`
  }, [{
    id: 'range',
    label: 'Range'
  }, {
    id: 'percent',
    label: '\u00B1%'
  }, {
    id: 'values',
    label: 'Values'
  }].map(m => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    onClick: () => onChange({
      mode: m.id
    }),
    "aria-pressed": cfg.mode === m.id,
    style: {
      flex: 1,
      background: cfg.mode === m.id ? 'rgba(100,255,218,0.18)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${cfg.mode === m.id ? '#64ffda' : 'rgba(255,255,255,0.10)'}`,
      color: cfg.mode === m.id ? '#64ffda' : 'rgba(255,255,255,0.55)',
      padding: '2px 0',
      borderRadius: 5,
      fontSize: 9,
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  }, m.label))), cfg.enabled && cfg.mode === 'range' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${def.label} minimum value`,
    value: numVal(cfg.min),
    step: stepVal,
    min: def.lo,
    max: def.hi,
    onChange: e => onChange({
      min: numChange(e)
    }),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: 'rgba(255,255,255,0.4)'
    }
  }, "to"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${def.label} maximum value`,
    value: numVal(cfg.max),
    step: stepVal,
    min: def.lo,
    max: def.hi,
    onChange: e => onChange({
      max: numChange(e)
    }),
    style: inputStyle
  })), cfg.enabled && cfg.mode === 'percent' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.7)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace'
    }
  }, "nominal \xB1"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${def.label} percent variation`,
    value: numVal(cfg.percent),
    min: 1,
    max: 95,
    onChange: e => onChange({
      percent: numChange(e)
    }),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace'
    }
  }, "%")), cfg.enabled && cfg.mode === 'values' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    "aria-label": `${def.label} discrete values, comma separated`,
    value: cfg.values,
    placeholder: "e.g. 1.0, 1.5, 2.0",
    onChange: e => onChange({
      values: e.target.value
    }),
    style: {
      ...inputStyle,
      width: '100%',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: parseValueList(cfg.values).length > 0 ? 'rgba(255,255,255,0.35)' : '#ff6b6b'
    }
  }, parseValueList(cfg.values).length, " valid value", parseValueList(cfg.values).length === 1 ? '' : 's', " \u2014 sampled uniformly")));
};
const Ve2DMapPanel = ({
  K,
  porosity,
  residualTrapFraction,
  dipPercent,
  amplitude,
  frequency,
  faultOffset,
  terrainSeed,
  heterogeneity,
  Q,
  injLocation,
  injDuration,
  faultCount,
  faults,
  mapCols,
  wellY,
  preset,
  command,
  onCommandConsumed,
  onRun,
  onReset,
  onSnapshot
}) => {
  const mapRows = Math.max(12, Math.round(mapCols * 0.6));
  const canvasRef = useRef(null);
  const depthCacheRef = useRef(null);
  const stateRef = useRef(globalThis.VE2D.createVe2dState({
    cols: mapCols,
    rows: mapRows
  }));
  const timeRef = useRef(0);
  const paramsRef = useRef(null);
  const historyRef = useRef([{
    time: 0,
    ...stateRef.current.masses
  }]);
  const [mapState, setMapState] = useState(stateRef.current);
  const [mapTime, setMapTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mapSpeed, setMapSpeed] = useState(1);
  paramsRef.current = {
    width: 1000,
    height: 600,
    permeability: K,
    porosity,
    residualTrapFraction,
    injectionRate: Q,
    injectionDuration: injDuration,
    wellX: injLocation,
    wellY,
    dipX: dipPercent,
    dipY: dipPercent * 0.35,
    structureAmplitude: amplitude,
    structureFrequency: frequency,
    faultOffset,
    terrainSeed,
    heterogeneity,
    faults: faults.slice(0, faultCount).map(fault => ({
      ...fault
    }))
  };
  const resetMap = useCallback(() => {
    const next = globalThis.VE2D.createVe2dState({
      cols: mapCols,
      rows: mapRows
    });
    stateRef.current = next;
    timeRef.current = 0;
    historyRef.current = [{
      time: 0,
      ...next.masses
    }];
    setMapState(next);
    setMapTime(0);
    setIsRunning(false);
  }, [mapCols, mapRows]);
  const advanceMap = () => {
    if (timeRef.current >= 1000) {
      setIsRunning(false);
      return;
    }
    const nextTime = timeRef.current + 1;
    const next = globalThis.VE2D.stepVe2d(stateRef.current, paramsRef.current, nextTime);
    stateRef.current = next;
    timeRef.current = nextTime;
    historyRef.current = [...historyRef.current, {
      time: nextTime,
      ...next.masses
    }];
    setMapState(next);
    setMapTime(nextTime);
  };
  const mapScenarioKey = JSON.stringify(paramsRef.current);
  useEffect(() => resetMap(), [resetMap, preset, mapScenarioKey]);
  useEffect(() => {
    if (!command) return;
    const transition = getMapPlaybackTransition({
      isRunning,
      speed: mapSpeed
    }, command.type);
    if (transition?.reset) resetMap();
    if (transition?.advance) advanceMap();
    if (typeof transition?.isRunning === 'boolean') setIsRunning(transition.isRunning);
    if (transition?.speed) setMapSpeed(transition.speed);
    onCommandConsumed(command.id);
  }, [command, onCommandConsumed, resetMap]);
  useEffect(() => {
    onSnapshot(createMapSnapshot({
      time: timeRef.current,
      mapState: stateRef.current,
      history: historyRef.current,
      isRunning,
      speed: mapSpeed,
      params: paramsRef.current
    }));
  }, [mapState, mapTime, isRunning, mapSpeed, onSnapshot, K, porosity, residualTrapFraction, dipPercent, amplitude, frequency, faultOffset, terrainSeed, heterogeneity, Q, injLocation, injDuration, faultCount, faults, wellY]);
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(advanceMap, 70 / mapSpeed);
    return () => clearInterval(timer);
  }, [isRunning, mapSpeed]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 1000;
    const height = 600;
    const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const cellWidth = width / mapState.cols;
    const cellHeight = height / mapState.rows;
    const depthKey = JSON.stringify({
      cols: mapState.cols,
      rows: mapState.rows,
      params: paramsRef.current
    });
    if (depthCacheRef.current?.key !== depthKey) {
      depthCacheRef.current = {
        key: depthKey,
        depths: mapState.h.map((_, index) => {
          const col = index % mapState.cols;
          const row = Math.floor(index / mapState.cols);
          return globalThis.VE2D.topDepth((col + 0.5) * cellWidth, (row + 0.5) * cellHeight, paramsRef.current);
        })
      };
    }
    const depths = depthCacheRef.current.depths;
    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);
    const depthSpan = Math.max(0.001, maxDepth - minDepth);
    const maxPlume = Math.max(0.001, ...mapState.h);
    for (let index = 0; index < mapState.h.length; index++) {
      const col = index % mapState.cols;
      const row = Math.floor(index / mapState.cols);
      const depthRatio = (depths[index] - minDepth) / depthSpan;
      ctx.fillStyle = `rgb(${15 + Math.round(depthRatio * 18)}, ${58 + Math.round(depthRatio * 32)}, ${61 + Math.round(depthRatio * 28)})`;
      ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
      if (mapState.h[index] > 0.0001) {
        const intensity = Math.sqrt(mapState.h[index] / maxPlume);
        const historic = mapState.hMax[index];
        const mobile = residualTrapFraction < 1 ? Math.min(mapState.h[index], Math.max(0, (mapState.h[index] - residualTrapFraction * historic) / (1 - residualTrapFraction))) : 0;
        const trappedRatio = mapState.h[index] > 0 ? 1 - mobile / mapState.h[index] : 0;
        const plumeRed = Math.round(245 - trappedRatio * 115);
        const plumeGreen = Math.round(158 - trappedRatio * 90);
        const plumeBlue = Math.round(11 + trappedRatio * 24);
        ctx.fillStyle = `rgba(${plumeRed}, ${plumeGreen}, ${plumeBlue}, ${0.24 + intensity * 0.72})`;
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
      }
    }
    ctx.lineWidth = 1.2;
    for (const ratio of [0.25, 0.5, 0.75]) {
      const level = maxPlume * ratio;
      ctx.strokeStyle = `rgba(255,255,255,${0.22 + ratio * 0.38})`;
      for (let row = 0; row < mapState.rows; row++) {
        for (let col = 0; col < mapState.cols; col++) {
          const index = row * mapState.cols + col;
          if (mapState.h[index] < level) continue;
          const edge = col === 0 || row === 0 || col === mapState.cols - 1 || row === mapState.rows - 1 || mapState.h[index - 1] < level || mapState.h[index + 1] < level || mapState.h[index - mapState.cols] < level || mapState.h[index + mapState.cols] < level;
          if (edge) ctx.strokeRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        }
      }
    }
    paramsRef.current.faults.forEach(fault => {
      const segment = visibleFaultSegment(fault);
      if (!segment) return;
      const y0 = segment.yStart * height;
      const y1 = segment.yEnd * height;
      const lineX = y => globalThis.VE2D.faultXAtY(fault, y, width, height);
      ctx.beginPath();
      ctx.moveTo(lineX(y0), y0);
      ctx.lineTo(lineX(y1), y1);
      ctx.strokeStyle = fault.isSealed ? '#64ffda' : '#ff6b6b';
      ctx.lineWidth = fault.isSealed ? 3 : 2;
      ctx.setLineDash(fault.isSealed ? [] : [9, 7]);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    const wellX = injLocation / 100 * width;
    const wellMapY = wellY / 100 * height;
    ctx.beginPath();
    ctx.arc(wellX, wellMapY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb300';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wellX - 15, wellMapY);
    ctx.lineTo(wellX + 15, wellMapY);
    ctx.moveTo(wellX, wellMapY - 15);
    ctx.lineTo(wellX, wellMapY + 15);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(22, height - 62, 250, 40);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(42, height - 40);
    ctx.lineTo(242, height - 40);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('200 m', 108, height - 46);
    ctx.fillText('N', width - 48, 38);
    ctx.beginPath();
    ctx.moveTo(width - 42, 48);
    ctx.lineTo(width - 42, 88);
    ctx.lineTo(width - 50, 72);
    ctx.moveTo(width - 42, 88);
    ctx.lineTo(width - 34, 72);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [mapState, residualTrapFraction, injLocation, wellY, K, porosity, dipPercent, amplitude, frequency, faultOffset, terrainSeed, heterogeneity, faultCount, faults]);
  const downloadMap = type => {
    const link = document.createElement('a');
    if (type === 'png') {
      link.href = canvasRef.current.toDataURL('image/png');
      link.download = 've-2d-plan-view.png';
    } else {
      const cellWidth = 1000 / mapState.cols;
      const cellHeight = 600 / mapState.rows;
      const rows = ['x_m,y_m,h_m,h_max_m,model_type,terrain_seed,year'];
      mapState.h.forEach((value, index) => rows.push([(index % mapState.cols + 0.5) * cellWidth, (Math.floor(index / mapState.cols) + 0.5) * cellHeight, value, mapState.hMax[index], 'map', terrainSeed, mapTime].join(',')));
      link.href = URL.createObjectURL(new Blob([rows.join('\n')], {
        type: 'text/csv;charset=utf-8'
      }));
      link.download = 've-2d-grid.csv';
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  return /*#__PURE__*/React.createElement("div", {
    id: "tabpanel-map",
    role: "tabpanel",
    "aria-labelledby": "tab-map",
    tabIndex: 0,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#111823',
      minHeight: 520
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      minHeight: 420
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    role: "img",
    "aria-label": `Plan-view CO2 plume at year ${mapTime}. ${mapState.masses.mobile.toFixed(1)} mobile and ${mapState.masses.trapped.toFixed(1)} trapped mass units.`,
    style: {
      width: '100%',
      height: '100%',
      minHeight: 420,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      padding: '7px 11px',
      borderRadius: 14,
      background: 'rgba(0,0,0,0.58)',
      fontSize: 10,
      color: '#fff',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#f59e0b'
    }
  }, "\u25A0"), " Mobile CO\u2082"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#b45309'
    }
  }, "\u25A0"), " Residual CO\u2082"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#ffb300'
    }
  }, "\u25CF"), " Injector"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#64ffda'
    }
  }, "\u2501"), " Sealed fault"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#ff6b6b'
    }
  }, "\u2504"), " Transmissive fault"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => isRunning ? setIsRunning(false) : mapTime > 0 ? setIsRunning(true) : onRun(),
    "aria-label": isRunning ? 'Pause 2D map simulation' : 'Run 2D map simulation',
    style: {
      background: '#64ffda',
      color: '#10251f',
      border: 0,
      borderRadius: 8,
      padding: '7px 12px',
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${isRunning ? 'fa-pause' : 'fa-play'}`
  }), " ", isRunning ? 'Pause' : 'Run'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setIsRunning(false);
      advanceMap();
    },
    "aria-label": "Advance 2D map one year",
    style: {
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8,
      padding: '7px 10px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-step-forward"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onReset,
    style: {
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8,
      padding: '7px 10px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-redo"
  }), " Reset"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMapSpeed(value => value === 1 ? 2 : value === 2 ? 4 : 1),
    style: {
      background: 'none',
      color: '#64ffda',
      border: 0,
      cursor: 'pointer',
      fontWeight: 700
    }
  }, mapSpeed, "\xD7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'rgba(255,255,255,0.72)'
    }
  }, "Year ", mapTime, " \xB7 ", mapCols, "\xD7", mapRows, " cells \xB7 seed ", terrainSeed, " \xB7 heterogeneity ", heterogeneity.toFixed(2)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => downloadMap('csv'),
    style: {
      background: 'none',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8,
      padding: '6px 9px',
      cursor: 'pointer'
    }
  }, "Grid CSV"), /*#__PURE__*/React.createElement("button", {
    onClick: () => downloadMap('png'),
    style: {
      background: 'none',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8,
      padding: '6px 9px',
      cursor: 'pointer'
    }
  }, "Map PNG")), /*#__PURE__*/React.createElement("div", {
    className: "sim-stat-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 8,
      padding: '0 14px 12px',
      background: 'rgba(0,0,0,0.2)'
    }
  }, /*#__PURE__*/React.createElement(StatBox, {
    label: "Injected",
    value: mapState.masses.injected.toFixed(1),
    color: "#fff",
    opacity: "0.7"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Mobile",
    value: mapState.masses.mobile.toFixed(1),
    color: "#f59e0b"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Trapped",
    value: mapState.masses.trapped.toFixed(1),
    color: "#b45309"
  }), /*#__PURE__*/React.createElement(StatBox, {
    label: "Leaked",
    value: mapState.masses.leaked.toFixed(1),
    color: "#ff6b6b"
  })));
};
const Ve3DTopographyPanel = ({
  mapSnapshot = {},
  mapCols,
  mapRows,
  faultCount,
  faults = [],
  injLocation,
  wellY,
  onMapCommand
}) => {
  const canvasRef = useRef(null);
  const terrainCacheRef = useRef(null);
  const pointersRef = useRef(new Map());
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const [camera, setCamera] = useState(resetTopographyCamera);
  const [elevationScale, setElevationScale] = useState(1.35);
  const [showGrid, setShowGrid] = useState(true);
  const gridRows = mapRows || Math.max(12, Math.round(mapCols * 0.6));
  const time = Number(mapSnapshot.time) || 0;
  const zoomLabel = `${camera.zoom.toFixed(2)}×`;
  const elevationLabel = `${elevationScale.toFixed(2)}×`;
  const terrainSeed = Number(mapSnapshot.params?.terrainSeed) || 0;
  const heterogeneity = Number(mapSnapshot.params?.heterogeneity) || 0;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 1000;
    const height = 600;
    const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#10202d';
    ctx.fillRect(0, 0, width, height);
    const h = Array.isArray(mapSnapshot.h) ? mapSnapshot.h : [];
    const hMax = Array.isArray(mapSnapshot.hMax) ? mapSnapshot.hMax : h;
    const peak = Math.max(0.0001, ...hMax.map(value => Number(value) || 0));
    const activeFaults = faults.slice(0, faultCount).map((fault, index) => ({
      fault,
      index,
      segment: visibleFaultSegment(fault)
    })).filter(item => item.segment);
    const structure = {
      width,
      height,
      faults: [],
      ...(mapSnapshot.params || {})
    };
    const terrainKey = JSON.stringify({
      mapCols,
      gridRows,
      structure,
      activeFaults
    });
    const projectionKey = JSON.stringify({
      terrainKey,
      camera,
      elevationScale
    });
    const cachedTerrain = terrainCacheRef.current?.projectionKey === projectionKey ? terrainCacheRef.current : null;
    const cachedBaseTerrain = terrainCacheRef.current?.terrainKey === terrainKey ? terrainCacheRef.current.baseCells : null;
    const depths = new Map();
    const surfaceDepth = (x, y, faultSides = {}) => {
      let sampleX = x;
      Object.entries(faultSides).forEach(([faultIndex, side]) => {
        const fault = activeFaults.find(item => item.index === Number(faultIndex))?.fault;
        if (fault && Math.abs(x - faultXAtNormalizedY(fault, y)) < 1e-7) sampleX += Number(side) * 0.00002;
      });
      const key = `${sampleX.toFixed(5)}:${y.toFixed(5)}`;
      if (!depths.has(key)) depths.set(key, globalThis.VE2D.topDepth(sampleX * width, y * height, structure));
      return depths.get(key);
    };
    const depthSpan = 4;
    const surfaceHeight = (x, y, faultSides = {}) => Math.max(0.04, Math.min(0.96, 0.5 - surfaceDepth(x, y, faultSides) / depthSpan * 0.5));
    const projectedHeight = (heightValue, plume = 0) => Math.max(0.04, Math.min(0.96, 0.5 - (0.5 - heightValue) * elevationScale + plume * 0.08));
    const surfaceAt = (x, y, plume = 0, faultSides = {}) => Math.max(0.04, Math.min(0.96, 0.5 - surfaceDepth(x, y, faultSides) / depthSpan * 0.5 * elevationScale + plume * 0.08));
    const surfaceLight = (x, y, faultSides = {}) => {
      const step = 0.008;
      const left = surfaceHeight(Math.max(0, x - step), y, faultSides);
      const right = surfaceHeight(Math.min(1, x + step), y, faultSides);
      const north = surfaceHeight(x, Math.max(0, y - step), faultSides);
      const south = surfaceHeight(x, Math.min(1, y + step), faultSides);
      const normal = {
        x: -(right - left) / (2 * step),
        y: -(south - north) / (2 * step),
        z: 1
      };
      const length = Math.hypot(normal.x, normal.y, normal.z);
      return Math.max(0.34, Math.min(1, (normal.x * -0.38 + normal.y * 0.42 + normal.z * 0.82) / length));
    };
    const stateRatio = (values, x, y) => {
      const col = Math.max(0, Math.min(mapCols - 1, Math.round(x * (mapCols - 1))));
      const row = Math.max(0, Math.min(gridRows - 1, Math.round(y * (gridRows - 1))));
      return (Number(values[row * mapCols + col]) || 0) / peak;
    };
    const yCoordinates = [...new Set([...Array.from({
      length: gridRows
    }, (_, row) => row / Math.max(1, gridRows - 1)), ...activeFaults.flatMap(item => faultEndpointCoordinates(item.segment))].map(value => Number(value.toFixed(7))))].sort((a, b) => a - b);
    let baseCells = cachedBaseTerrain;
    if (!baseCells) {
      baseCells = [];
      for (let row = 0; row < yCoordinates.length - 1; row++) {
        const y0 = yCoordinates[row];
        const y1 = yCoordinates[row + 1];
        for (let col = 0; col < mapCols - 1; col++) {
          const x0 = col / Math.max(1, mapCols - 1);
          const x1 = (col + 1) / Math.max(1, mapCols - 1);
          let pieces = [{
            points: [{
              x: x0,
              y: y0
            }, {
              x: x1,
              y: y0
            }, {
              x: x1,
              y: y1
            }, {
              x: x0,
              y: y1
            }],
            faultSides: {}
          }];
          activeFaults.forEach(({
            fault,
            index,
            segment
          }) => {
            pieces = pieces.flatMap(piece => splitTopographyPieceByFault(piece, fault, index, y0, y1, segment));
          });
          pieces.forEach(piece => {
            const center = piece.points.reduce((sum, point) => ({
              x: sum.x + point.x / piece.points.length,
              y: sum.y + point.y / piece.points.length
            }), {
              x: 0,
              y: 0
            });
            const surfaceRatio = Math.max(0, Math.min(1, 0.5 - surfaceDepth(center.x, center.y, piece.faultSides) / depthSpan));
            baseCells.push({
              rawPoints: piece.points,
              faultSides: piece.faultSides,
              center,
              surfaceHeights: piece.points.map(point => surfaceHeight(point.x, point.y, piece.faultSides)),
              surfaceRatio,
              light: surfaceLight(center.x, center.y, piece.faultSides)
            });
          });
        }
      }
    }
    let cells = cachedTerrain?.cells;
    let faultFaces = cachedTerrain?.faultFaces;
    let faultTracePoints = cachedTerrain?.faultTracePoints;
    if (!cells) {
      cells = baseCells.map(cell => ({
        ...cell,
        points: cell.rawPoints.map((point, index) => projectTopographyPoint({
          x: point.x,
          y: point.y,
          height: projectedHeight(cell.surfaceHeights[index])
        }, camera, width, height)),
        depth: cell.center.y * Math.cos(camera.azimuth) + cell.center.x * Math.sin(camera.azimuth)
      }));
      faultFaces = [];
      faultTracePoints = [];
      activeFaults.forEach(({
        fault,
        index,
        segment
      }) => {
        const faultYs = yCoordinates.filter(y => y >= segment.yStart - 1e-9 && y <= segment.yEnd + 1e-9);
        const faces = [];
        const tracePoints = [];
        for (let sample = 0; sample < faultYs.length - 1; sample++) {
          const y0 = faultYs[sample];
          const y1 = faultYs[sample + 1];
          const x0 = faultXAtNormalizedY(fault, y0);
          const x1 = faultXAtNormalizedY(fault, y1);
          const left0 = projectTopographyPoint({
            x: x0,
            y: y0,
            height: surfaceAt(x0, y0, 0, {
              [index]: -1
            })
          }, camera, width, height);
          const left1 = projectTopographyPoint({
            x: x1,
            y: y1,
            height: surfaceAt(x1, y1, 0, {
              [index]: -1
            })
          }, camera, width, height);
          const right0 = projectTopographyPoint({
            x: x0,
            y: y0,
            height: surfaceAt(x0, y0, 0, {
              [index]: 1
            })
          }, camera, width, height);
          const right1 = projectTopographyPoint({
            x: x1,
            y: y1,
            height: surfaceAt(x1, y1, 0, {
              [index]: 1
            })
          }, camera, width, height);
          faces.push({
            left0,
            left1,
            right0,
            right1,
            opacity: faultEndpointFade((y0 + y1) / 2, segment)
          });
          tracePoints.push(projectTopographyPoint({
            x: x0,
            y: y0,
            height: surfaceAt(x0, y0)
          }, camera, width, height));
          if (sample === faultYs.length - 2) tracePoints.push(projectTopographyPoint({
            x: x1,
            y: y1,
            height: surfaceAt(x1, y1)
          }, camera, width, height));
        }
        faultFaces.push({
          fault,
          faces
        });
        faultTracePoints.push({
          fault,
          points: tracePoints
        });
      });
      cells.sort((a, b) => a.depth - b.depth);
      terrainCacheRef.current = {
        terrainKey,
        projectionKey,
        baseCells,
        cells,
        faultFaces,
        faultTracePoints
      };
    }
    const plumeLift = Math.sin(camera.elevation) * camera.zoom * 0.62 * height * 0.08;
    faultFaces.forEach(({
      fault,
      faces
    }) => {
      faces.forEach(({
        left0,
        left1,
        right0,
        right1,
        opacity
      }) => {
        ctx.beginPath();
        ctx.moveTo(left0.x, left0.y);
        ctx.lineTo(left1.x, left1.y);
        ctx.lineTo(right1.x, right1.y);
        ctx.lineTo(right0.x, right0.y);
        ctx.closePath();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = 'rgba(20, 75, 73, 0.46)';
        ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
    cells.forEach(cell => {
      const plumeRatio = stateRatio(h, cell.center.x, cell.center.y);
      const historicRatio = stateRatio(hMax, cell.center.x, cell.center.y);
      const points = cell.points.map((point, index) => ({
        x: point.x,
        y: point.y - stateRatio(h, cell.rawPoints[index].x, cell.rawPoints[index].y) * plumeLift
      }));
      const shade = 0.38 + cell.light * 0.82;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = plumeRatio > 0.0001 ? `rgb(${Math.round((205 + historicRatio * 42) * shade)}, ${Math.round((76 + plumeRatio * 86) * shade)}, ${Math.round((34 + plumeRatio * 30) * shade)})` : `rgb(${Math.round((15 + cell.surfaceRatio * 24) * shade)}, ${Math.round((92 + cell.surfaceRatio * 76) * shade)}, ${Math.round((86 + cell.surfaceRatio * 60) * shade)})`;
      ctx.fill();
      if (showGrid) {
        ctx.strokeStyle = 'rgba(194, 221, 220, 0.14)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
    faultTracePoints.forEach(({
      fault,
      points: faultPoints
    }) => {
      if (faultPoints.length < 2) return;
      ctx.beginPath();
      faultPoints.forEach((point, pointIndex) => pointIndex ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.strokeStyle = fault.isSealed ? 'rgba(100,255,218,0.86)' : 'rgba(255,107,107,0.78)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash(fault.isSealed ? [] : [7, 5]);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    const injectorX = (Number(injLocation) || 0) / 100;
    const injectorY = (Number(wellY) || 0) / 100;
    const injector = projectTopographyPoint({
      x: injectorX,
      y: injectorY,
      height: surfaceAt(injectorX, injectorY, 0.035)
    }, camera, width, height);
    ctx.beginPath();
    ctx.arc(injector.x, injector.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#e5b15e';
    ctx.fill();
    ctx.strokeStyle = '#fff3d6';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [camera, elevationScale, faultCount, faults, gridRows, injLocation, mapCols, mapSnapshot, showGrid, wellY]);
  const updateZoom = delta => setCamera(current => clampTopographyCamera({
    ...current,
    zoom: current.zoom + delta
  }));
  const updateCamera = updater => setCamera(current => clampTopographyCamera(updater(current)));
  const resetView = () => setCamera(resetTopographyCamera());
  const pointerDistance = points => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  const onPointerDown = event => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });
    const points = [...pointersRef.current.values()];
    if (points.length === 1) dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      camera
    };
    if (points.length === 2) pinchRef.current = {
      distance: pointerDistance(points),
      zoom: camera.zoom
    };
  };
  const onPointerMove = event => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });
    const points = [...pointersRef.current.values()];
    if (points.length === 2 && pinchRef.current) {
      const distance = pointerDistance(points);
      const nextZoom = pinchRef.current.zoom * (distance / Math.max(1, pinchRef.current.distance));
      setCamera(current => clampTopographyCamera({
        ...current,
        zoom: nextZoom
      }));
      return;
    }
    if (points.length !== 1 || !dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    setCamera(clampTopographyCamera({
      ...dragRef.current.camera,
      azimuth: dragRef.current.camera.azimuth + dx * 0.012,
      elevation: dragRef.current.camera.elevation - dy * 0.01
    }));
  };
  const onPointerEnd = event => {
    pointersRef.current.delete(event.pointerId);
    dragRef.current = null;
    const points = [...pointersRef.current.values()];
    if (points.length === 1) dragRef.current = {
      ...points[0],
      camera
    };
    pinchRef.current = points.length === 2 ? {
      distance: pointerDistance(points),
      zoom: camera.zoom
    } : null;
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "ve-topography-panel",
    "aria-label": "3D topography viewer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ve-topography-toolbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "3D topography"), /*#__PURE__*/React.createElement("span", null, "Drag to orbit \xB7 scroll or pinch to zoom")), /*#__PURE__*/React.createElement("div", {
    className: "ve-topography-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onMapCommand(mapSnapshot.isRunning ? 'pause' : 'resume'),
    "aria-label": mapSnapshot.isRunning ? 'Pause map simulation' : 'Resume map simulation'
  }, mapSnapshot.isRunning ? 'Pause' : 'Resume'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onMapCommand('step'),
    "aria-label": "Advance map one year"
  }, "Step"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onMapCommand('speed'),
    "aria-label": "Change map simulation speed"
  }, mapSnapshot.speed || 1, "\xD7"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => updateZoom(-0.12),
    "aria-label": "Zoom out"
  }, "\u2212"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => updateZoom(0.12),
    "aria-label": "Zoom in"
  }, "+"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowGrid(current => !current),
    "aria-pressed": showGrid
  }, showGrid ? 'Grid on' : 'Grid off'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: resetView
  }, "Reset view"))), /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    className: "ve-topography-canvas",
    role: "img",
    tabIndex: 0,
    "aria-label": `3D topography grid at year ${time}; ${mapCols} by ${gridRows} cells; azimuth ${camera.azimuth.toFixed(2)} radians; elevation ${camera.elevation.toFixed(2)} radians; zoom ${zoomLabel}; elevation scale ${elevationLabel}.`,
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel: onPointerEnd,
    onWheel: event => {
      event.preventDefault();
      updateZoom(event.deltaY > 0 ? -0.08 : 0.08);
    },
    onKeyDown: event => {
      if (event.key === 'r' || event.key === 'R') resetView();
      if (event.key === '+' || event.key === '=') updateZoom(0.12);
      if (event.key === '-') updateZoom(-0.12);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        updateCamera(current => ({
          ...current,
          azimuth: current.azimuth + (event.key === 'ArrowRight' ? 0.12 : -0.12)
        }));
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        updateCamera(current => ({
          ...current,
          elevation: current.elevation + (event.key === 'ArrowUp' ? 0.08 : -0.08)
        }));
      }
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ve-topography-status"
  }, /*#__PURE__*/React.createElement("span", null, "Year ", time, " \xB7 ", mapCols, "\xD7", gridRows, " grid \xB7 seed ", terrainSeed, " \xB7 heterogeneity ", heterogeneity.toFixed(2)), /*#__PURE__*/React.createElement("span", null, "Z span 4 model units \xB7 Zoom ", zoomLabel), /*#__PURE__*/React.createElement("label", null, "Elevation exaggeration ", elevationLabel, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.65",
    max: "2.2",
    step: "0.05",
    value: elevationScale,
    onChange: event => setElevationScale(Number(event.target.value))
  }))));
};

// Main Simulator component
const SimulatorPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('topography');
  const [riskModel, setRiskModel] = useState('map');
  // The two solvers retain independent inputs, histories and playback state.
  const [scenarios, setScenarios] = useState(() => {
    const defaults = {
      K: 1.7,
      porosity: 0.25,
      cellCount: 200,
      residualTrapFraction: 0.25,
      dipPercent: 0.8,
      amplitude: 15,
      frequency: 1,
      faultOffset: 1.2,
      Q: 2.3,
      injLocation: 70,
      wellY: 50,
      mapCols: 72,
      injDuration: 240,
      terrainSeed: 3901,
      heterogeneity: 0.55,
      faultCount: 2,
      faults: [{
        xPercent: 28,
        yStartPercent: 0,
        yEndPercent: 100,
        isSealed: false,
        thresholdHeight: 0.35,
        leakRate: 0.14,
        transmissibility: 1,
        dipSlope: -0.22
      }, {
        xPercent: 48,
        yStartPercent: 0,
        yEndPercent: 100,
        isSealed: false,
        thresholdHeight: 0.30,
        leakRate: 0.12,
        transmissibility: 1,
        dipSlope: 0.25
      }],
      hasCapillaryFringe: true,
      fringeScale: 0.65,
      entryPressure: 15,
      selectedPreset: 'default'
    };
    return {
      map: defaults,
      profile: {
        ...defaults,
        faults: defaults.faults.map(f => ({
          ...f
        }))
      }
    };
  });
  const activeModel = activeSubTab === 'profile' || activeSubTab === 'uq' && riskModel === 'profile' ? 'profile' : 'map';
  const profileParams = scenarios.profile;
  const mapParams = scenarios.map;
  const {
    K,
    porosity,
    cellCount,
    residualTrapFraction,
    dipPercent,
    amplitude,
    frequency,
    faultOffset,
    Q,
    injLocation,
    wellY,
    mapCols,
    injDuration,
    terrainSeed,
    heterogeneity,
    faultCount,
    faults,
    hasCapillaryFringe,
    fringeScale,
    entryPressure,
    selectedPreset
  } = scenarios[activeModel];
  const loadingModelRef = useRef(null);
  const setParameter = (key, value) => {
    const model = loadingModelRef.current || activeModel;
    setScenarios(current => ({
      ...current,
      [model]: updateScenarioParameter(current[model], key, value)
    }));
  };
  const setK = value => setParameter('K', value);
  const setPorosity = value => setParameter('porosity', value);
  const setCellCount = value => setParameter('cellCount', value);
  const setResidualTrapFraction = value => setParameter('residualTrapFraction', value);
  const setDipPercent = value => setParameter('dipPercent', value);
  const setAmplitude = value => setParameter('amplitude', value);
  const setFrequency = value => setParameter('frequency', value);
  const setFaultOffset = value => setParameter('faultOffset', value);
  const setQ = value => setParameter('Q', value);
  const setInjLocation = value => setParameter('injLocation', value);
  const setWellY = value => setParameter('wellY', value);
  const setMapCols = value => setParameter('mapCols', value);
  const setInjDuration = value => setParameter('injDuration', value);
  const setTerrainSeed = value => setParameter('terrainSeed', value);
  const setHeterogeneity = value => setParameter('heterogeneity', value);
  const setFaultCount = value => setParameter('faultCount', value);
  const setFaults = value => setParameter('faults', value);
  const setHasCapillaryFringe = value => setParameter('hasCapillaryFringe', value);
  const setFringeScale = value => setParameter('fringeScale', value);
  const setEntryPressure = value => setParameter('entryPressure', value);
  const setSelectedPreset = value => setParameter('selectedPreset', value);
  const dx = 1000 / profileParams.cellCount;

  // Simulation run state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x execution speed
  const [simTime, setSimTime] = useState(0); // simulation timer frame

  // Tab Navigation state
  const [theme, setTheme] = useState(() => getStoredTheme(window.localStorage));
  const [shareStatus, setShareStatus] = useState('');
  const [mobilePanel, setMobilePanel] = useState(null);
  const [responsivePanelViewport, setResponsivePanelViewport] = useState(() => ({
    mobile: window.matchMedia('(max-width: 760px)').matches,
    compact: window.matchMedia('(max-width: 1180px)').matches
  }));
  const tabRefs = useRef({});
  const mobileTriggerRefs = useRef({});
  const mobileCloseRefs = useRef({});
  const mobileTriggersRef = useRef(null);
  const reservoirSvgRef = useRef(null);
  const uqWorkerRef = useRef(null);
  const presentedPanel = selectPresentedMobilePanel(mobilePanel, responsivePanelViewport);
  useEffect(() => {
    document.querySelector('.ve-standalone')?.setAttribute('data-theme', theme);
    persistTheme(theme, window.localStorage);
  }, [theme]);
  const dismissMobilePanel = useCallback((returnFocus = true) => {
    if (!mobilePanel) return;
    const closingPanel = mobilePanel;
    setMobilePanel(null);
    if (returnFocus) requestAnimationFrame(() => focusMobilePanelTrigger(closingPanel, mobileTriggerRefs.current));
  }, [mobilePanel]);
  const handleMobilePanelToggle = panel => {
    if (mobilePanel === panel) dismissMobilePanel();else setMobilePanel(toggleMobilePanel(mobilePanel, panel));
  };
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 760px)');
    const compactQuery = window.matchMedia('(max-width: 1180px)');
    const updateViewport = () => setResponsivePanelViewport({
      mobile: mobileQuery.matches,
      compact: compactQuery.matches
    });
    mobileQuery.addEventListener('change', updateViewport);
    compactQuery.addEventListener('change', updateViewport);
    return () => {
      mobileQuery.removeEventListener('change', updateViewport);
      compactQuery.removeEventListener('change', updateViewport);
    };
  }, []);
  useEffect(() => {
    if (mobilePanel && !presentedPanel) setMobilePanel(null);
  }, [mobilePanel, presentedPanel]);
  useEffect(() => {
    if (!presentedPanel) return undefined;
    const releaseScroll = lockPageScroll(document);
    const activeRail = document.getElementById(`ve-${presentedPanel}-rail`);
    const backgroundElements = [document.querySelector('.app-header--workbench'), document.querySelector('.ve-scenario-bar'), document.querySelector('.ve-workspace-nav'), document.querySelector('.ve-action-status'), document.querySelector('.ve-visualization-workspace'), document.querySelector('.ve-history-sheet'), document.querySelector(presentedPanel === 'inputs' ? '.ve-outcome-rail' : '.ve-input-rail')];
    setMobilePanelBackgroundInert(backgroundElements, true);
    const getFocusableElements = () => [...(mobileTriggersRef.current?.querySelectorAll('button:not([disabled])') || []), ...(activeRail?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])') || [])].filter(element => element.getClientRects().length > 0);
    const handleSheetKeys = event => {
      if (event.key === 'Escape') {
        dismissMobilePanel();
        return;
      }
      if (event.key !== 'Tab') return;
      const wrapTarget = getMobileFocusWrapTarget(getFocusableElements(), document.activeElement, event.shiftKey);
      if (wrapTarget) {
        event.preventDefault();
        wrapTarget.focus();
      }
    };
    window.addEventListener('keydown', handleSheetKeys);
    requestAnimationFrame(() => {
      const closeButton = mobileCloseRefs.current[presentedPanel];
      if (closeButton) closeButton.focus();
    });
    return () => {
      window.removeEventListener('keydown', handleSheetKeys);
      setMobilePanelBackgroundInert(backgroundElements, false);
      releaseScroll();
    };
  }, [presentedPanel, dismissMobilePanel]);
  const handleWorkspaceChange = workspace => {
    if (mobilePanel) dismissMobilePanel(false);
    setActiveSubTab(workspace);
  };
  const scenarioSignature = createScenarioSignature(scenarios[activeModel]);
  const profileSignature = createScenarioSignature(scenarios.profile);
  const mapSignature = createScenarioSignature(scenarios.map);
  const lastRunSignatureRef = useRef(profileSignature);
  const mapLastRunSignatureRef = useRef(mapSignature);

  // SA/UQ uncertainty bounds configuration states (default +/- percentages)
  // --- UQ / SA PARAMETER SELECTION CONFIG ---
  // Each parameter the user may include in the Monte Carlo batch has a config:
  //   enabled — participate in sampling at all
  //   mode    — 'range' (absolute min/max) | 'percent' (+/- of nominal) | 'values' (discrete list)
  //   percent — +/- percentage used by 'percent' mode
  //   min/max — bounds used by 'range' mode
  //   values  — raw text parsed to a discrete value list for 'values' mode
  const [uqParams, setUqParams] = useState(() => {
    const cfg = {};
    UQ_PARAM_DEFS.forEach(d => {
      cfg[d.key] = {
        enabled: d.key === 'K' || d.key === 'residualTrapFraction',
        mode: 'percent',
        percent: d.percentDef,
        min: roundDec(d.lo + (d.hi - d.lo) * 0.25, d.dec),
        max: roundDec(d.hi - (d.hi - d.lo) * 0.25, d.dec),
        values: ''
      };
    });
    return cfg;
  });

  // Nominal (deterministic) value of a UQ parameter from the live UI state.
  // Fault-grouped parameters resolve to the average across active faults.
  const getUqNominal = key => {
    switch (key) {
      case 'K':
        return K;
      case 'residualTrapFraction':
        return residualTrapFraction;
      case 'porosity':
        return porosity;
      case 'Q':
        return Q;
      case 'injLocation':
        return injLocation;
      case 'dipPercent':
        return dipPercent;
      case 'amplitude':
        return amplitude;
      case 'faultThreshold':
        {
          const a = faults.slice(0, faultCount);
          return a.length ? a.reduce((s, f) => s + f.thresholdHeight, 0) / a.length : 0.35;
        }
      case 'faultLeakRate':
        {
          const a = faults.slice(0, faultCount).filter(f => !f.isSealed);
          return a.length ? a.reduce((s, f) => s + f.leakRate, 0) / a.length : 0.14;
        }
      case 'faultTransmissibility':
        {
          const a = faults.slice(0, faultCount);
          return a.length ? a.reduce((s, f) => s + (f.transmissibility !== undefined ? f.transmissibility : 1.0), 0) / a.length : 1.0;
        }
      default:
        return 0;
    }
  };

  // Patch one parameter's config; when the mode changes, seed the new mode's
  // inputs from the current nominal (nominal ±30% for range/values).
  const updateUqParam = (key, patch) => {
    setUqParams(prev => {
      const def = UQ_PARAM_DEFS.find(d => d.key === key);
      const cur = prev[key];
      const next = {
        ...cur,
        ...patch
      };
      if (patch.mode && patch.mode !== cur.mode) {
        const nom = getUqNominal(key);
        if (patch.mode === 'range') {
          next.min = roundDec(Math.min(nom * 0.7, nom * 1.3), def.dec);
          next.max = roundDec(Math.max(nom * 0.7, nom * 1.3), def.dec);
        } else if (patch.mode === 'values') {
          const triple = [nom * 0.7, nom, nom * 1.3].sort((a, b) => a - b);
          next.values = triple.map(v => String(roundDec(v, def.dec))).join(', ');
        } else if (patch.mode === 'percent' && !isFinite(next.percent)) {
          next.percent = def.percentDef;
        }
      }
      return {
        ...prev,
        [key]: next
      };
    });
  };

  // Monte Carlo execution states
  const [mcRunsCount, setMcRunsCount] = useState(50); // 25, 50, or 100 simulations
  const [mcResults, setMcResults] = useState(null); // Array of realization runs
  const [uqRunning, setUqRunning] = useState(false);
  const [uqProgress, setUqProgress] = useState(0);
  const [uqTargetMetric, setUqTargetMetric] = useState('leaked'); // 'leaked' (CO2 leaked mass) or 'trapped' (trapping efficiency %)

  // Solver variables (Plume thickness vector, max thickness historical)
  const [h, setH] = useState(() => new Array(200).fill(0));
  const [hMax, setHMax] = useState(() => new Array(200).fill(0));

  // Cumulative masses tracking state
  const [massHistory, setMassHistory] = useState([]); // Array of { time, injected, trapped, mobile, leaked }
  const [currentMasses, setCurrentMasses] = useState({
    injected: 0,
    trapped: 0,
    mobile: 0,
    leaked: 0
  });
  const [mapSnapshot, setMapSnapshot] = useState({
    time: 0,
    h: [],
    hMax: [],
    masses: {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    },
    history: [],
    isRunning: false,
    speed: 1
  });
  const [mapCommand, setMapCommand] = useState(null);

  // Reset flag / state synchronizer
  const stateRef = useRef({
    h: [],
    hMax: [],
    masses: {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    }
  });

  // Immutable snapshot of the live solver parameters (faults frozen at call time).
  // Much cheaper than a JSON round-trip and safe for Time-Machine branch diffs.
  const snapshotParams = () => {
    const p = solverParamsRef.current;
    return {
      ...p,
      faults: p.faults.map(f => ({
        ...f
      }))
    };
  };

  // Time travel history ref — stores full solver state at each year for back-and-forth scrubbing
  const historyRef = useRef([]);

  // Initialize solver parameters reference to prevent interval resets on slider modifications
  const solverParamsRef = useRef(null);
  solverParamsRef.current = {
    ...profileParams,
    parentDX: dx
  };

  // Compute mobile and trapped heights dynamically for SVG visualization
  const {
    hMobile,
    hTrapped
  } = useMemo(() => {
    const N = h.length;
    const hMob = new Array(N).fill(0);
    const hTrap = new Array(N).fill(0);
    const R = profileParams.residualTrapFraction;
    for (let i = 0; i < N; i++) {
      const H = h[i];
      const hm = hMax[i];
      // VE residual trapping model
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      hMob[i] = Math.min(H, mobileVal);
      hTrap[i] = Math.max(0, H - hMob[i]);
    }
    return {
      hMobile: hMob,
      hTrapped: hTrap
    };
  }, [h, hMax, profileParams.residualTrapFraction]);
  const profileReplayRef = useRef(false);
  // Rebuild only the changed model. Realization loading already builds its history.
  useEffect(() => {
    if (profileReplayRef.current) profileReplayRef.current = false;else resetSimulation();
  }, [profileSignature]);

  // Reset simulation function
  const resetSimulation = () => {
    const arr = new Array(profileParams.cellCount).fill(0);
    setH(arr);
    setHMax(arr);
    const initialMasses = {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    };
    setCurrentMasses(initialMasses);
    setMassHistory([{
      time: 0,
      ...initialMasses
    }]);
    setSimTime(0);
    setIsPlaying(false);
    setIsReversing(false);
    stateRef.current = {
      h: [...arr],
      hMax: [...arr],
      masses: {
        ...initialMasses
      }
    };
    historyRef.current = [{
      time: 0,
      h: [...arr],
      hMax: [...arr],
      masses: {
        ...initialMasses
      },
      params: snapshotParams()
    }];
  };
  const handleRunScenario = () => {
    resetSimulation();
    lastRunSignatureRef.current = scenarioSignature;
    setIsPlaying(true);
  };
  const sendMapCommand = type => setMapCommand(previous => ({
    type,
    id: (previous?.id || 0) + 1
  }));
  const consumeMapCommandOnce = useCallback(handledId => {
    setMapCommand(current => consumeMapCommand(current, handledId));
  }, []);
  const isMapView = activeSubTab === 'map' || activeSubTab === 'topography';
  const resetActiveSimulation = () => isMapView ? sendMapCommand('reset') : resetSimulation();
  const runActiveSimulation = () => {
    if (!isMapView) {
      handleRunScenario();
      return;
    }
    mapLastRunSignatureRef.current = scenarioSignature;
    sendMapCommand('run');
  };
  const crossSectionRunStatus = deriveRunStatus({
    isPlaying,
    isReversing,
    scenarioSignature: profileSignature,
    lastRunSignature: lastRunSignatureRef.current,
    simTime
  });
  const runStatus = isMapView ? deriveMapRunStatus(mapSnapshot, mapSignature, mapLastRunSignatureRef.current) : crossSectionRunStatus;

  // Preset Scenario Handlers
  const applyPreset = rawName => {
    const presetName = rawName === 'anticline' ? 'dome' : rawName === 'fault' ? 'faulted' : rawName === 'dipping' ? 'monocline' : rawName;
    setSelectedPreset(presetName);
    setWellY(50);
    if (presetName === 'dome') {
      setDipPercent(0.2);
      setAmplitude(45);
      setFrequency(1.5);
      setFaultOffset(0);
      setTerrainSeed(2201);
      setHeterogeneity(0.22);
      setK(1.60);
      setPorosity(0.25);
      setQ(2.20);
      setInjDuration(240);
      setFaultCount(0);
      setResidualTrapFraction(0.30);
    } else if (presetName === 'faulted') {
      setDipPercent(1.2);
      setAmplitude(15);
      setFrequency(1);
      setFaultOffset(1.8);
      setTerrainSeed(7314);
      setHeterogeneity(0.34);
      setK(1.80);
      setPorosity(0.22);
      setQ(2.00);
      setInjDuration(200);
      setFaultCount(2);
      setFaults([{
        xPercent: 26,
        yStartPercent: 0,
        yEndPercent: 100,
        isSealed: false,
        thresholdHeight: 0.30,
        leakRate: 0.16,
        transmissibility: 0.8,
        dipSlope: -0.22
      }, {
        xPercent: 50,
        yStartPercent: 0,
        yEndPercent: 100,
        isSealed: false,
        thresholdHeight: 0.45,
        leakRate: 0.12,
        transmissibility: 0.5,
        dipSlope: 0.25
      }]);
      setResidualTrapFraction(0.20);
    } else if (presetName === 'monocline') {
      setDipPercent(-2.5);
      setAmplitude(6);
      setFrequency(0.5);
      setFaultOffset(0);
      setTerrainSeed(4903);
      setHeterogeneity(0.2);
      setK(1.50);
      setPorosity(0.28);
      setQ(1.80);
      setInjDuration(220);
      setFaultCount(1);
      setFaults([{
        xPercent: 32,
        yStartPercent: 0,
        yEndPercent: 100,
        isSealed: false,
        thresholdHeight: 0.35,
        leakRate: 0.14,
        transmissibility: 0.9,
        dipSlope: -0.20
      }]);
      setResidualTrapFraction(0.25);
    } else if (presetName === 'default') {
      setDipPercent(0.8);
      setAmplitude(15);
      setFrequency(1);
      setFaultOffset(1.2);
      setTerrainSeed(3901);
      setHeterogeneity(0.55);
      setK(1.70);
      setPorosity(0.25);
      setQ(2.30);
      setInjDuration(240);
      setFaultCount(2);
      setFaults([{
        xPercent: 28,
        yStartPercent: 0,
        yEndPercent: 100,
        isSealed: false,
        thresholdHeight: 0.35,
        leakRate: 0.14,
        transmissibility: 1.0,
        dipSlope: -0.22
      }, {
        xPercent: 48,
        yStartPercent: 0,
        yEndPercent: 100,
        isSealed: false,
        thresholdHeight: 0.30,
        leakRate: 0.12,
        transmissibility: 1.0,
        dipSlope: 0.25
      }]);
      setResidualTrapFraction(0.25);
    }
  };
  const generateRandomGrid = () => {
    const config = createRandomGridConfig();
    setSelectedPreset('random');
    setTerrainSeed(config.terrainSeed);
    setHeterogeneity(config.heterogeneity);
    setMapCols(config.mapCols);
    setDipPercent(config.dipPercent);
    setAmplitude(config.amplitude);
    setFrequency(config.frequency);
    setFaultOffset(config.faultOffset);
    setFaultCount(config.faultCount);
    setFaults(config.faults);
    setShareStatus(`Generated random grid · seed ${config.terrainSeed} · ${config.mapCols} columns · ${config.faultCount} faults`);
  };
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tab = query.get('tab');
    loadingModelRef.current = tab === 'profile' || tab === 'uq' && query.get('risk') === 'profile' ? 'profile' : 'map';
    const preset = query.get('preset');
    if (['default', 'dome', 'faulted', 'monocline'].includes(preset)) applyPreset(preset);
    if (preset === 'random') setSelectedPreset('random');
    if (SIM_TABS.includes(tab)) setActiveSubTab(tab);
    if (query.get('risk') === 'profile' || query.get('risk') === 'map') setRiskModel(query.get('risk'));
    if (query.has('k')) setK(scenarioNumber(query, 'k', 0.1, 3.5, K));
    if (query.has('phi')) setPorosity(scenarioNumber(query, 'phi', 0.1, 0.4, porosity));
    if (query.has('cells')) setCellCount(scenarioNumber(query, 'cells', 50, 300, cellCount, true));
    if (query.has('sgr')) setResidualTrapFraction(scenarioNumber(query, 'sgr', 0, 0.4, residualTrapFraction));
    if (query.has('dip')) setDipPercent(scenarioNumber(query, 'dip', -5, 5, dipPercent));
    if (query.has('amp')) setAmplitude(scenarioNumber(query, 'amp', 0, 50, amplitude, true));
    if (query.has('freq')) setFrequency(scenarioNumber(query, 'freq', 0.5, 4, frequency));
    if (query.has('slip')) setFaultOffset(scenarioNumber(query, 'slip', 0, 3, faultOffset));
    if (query.has('q')) setQ(scenarioNumber(query, 'q', 0, 3.5, Q));
    if (query.has('well')) setInjLocation(scenarioNumber(query, 'well', 10, 90, injLocation, true));
    if (query.has('wellY')) setWellY(scenarioNumber(query, 'wellY', 10, 90, wellY, true));
    if (query.has('mapCells')) setMapCols(scenarioNumber(query, 'mapCells', 24, 128, mapCols, true));
    if (query.has('terrain')) setTerrainSeed(scenarioNumber(query, 'terrain', 0, 999999, terrainSeed, true));
    if (query.has('hetero')) setHeterogeneity(scenarioNumber(query, 'hetero', 0, 1, heterogeneity));
    if (query.has('stop')) setInjDuration(scenarioNumber(query, 'stop', 50, 400, injDuration, true));
    if (query.has('faults')) setFaultCount(scenarioNumber(query, 'faults', 0, 3, faultCount, true));
    try {
      const decoded = JSON.parse(query.get('faultData') || 'null');
      if (Array.isArray(decoded) && decoded.length <= 3 && decoded.every(f => f && typeof f === 'object')) {
        setFaults(decoded.map((f, i) => ({
          xPercent: Math.max(10, Math.min(90, Number(f.xPercent) || 30 + i * 20)),
          yStartPercent: Math.max(0, Math.min(100, Number(f.yStartPercent) || 0)),
          yEndPercent: Math.max(0, Math.min(100, Number.isFinite(Number(f.yEndPercent)) ? Number(f.yEndPercent) : 100)),
          isSealed: Boolean(f.isSealed),
          thresholdHeight: Math.max(0, Math.min(2, Number(f.thresholdHeight) || 0)),
          leakRate: Math.max(0.01, Math.min(0.4, Number(f.leakRate) || 0.01)),
          transmissibility: Math.max(0, Math.min(1, Number(f.transmissibility) || 0)),
          dipSlope: Math.max(-0.5, Math.min(0.5, Number(f.dipSlope) || 0))
        })));
      }
    } catch (_) {/* Invalid shared fault data falls back to the preset. */}
    loadingModelRef.current = null;
  }, []);
  useEffect(() => () => {
    if (uqWorkerRef.current) uqWorkerRef.current.terminate();
  }, []);
  const scenarioUrl = () => {
    const url = new URL('./simulator.html', window.location.href);
    const values = {
      preset: selectedPreset,
      tab: activeSubTab,
      k: K,
      phi: porosity,
      cells: cellCount,
      sgr: residualTrapFraction,
      dip: dipPercent,
      amp: amplitude,
      freq: frequency,
      slip: faultOffset,
      q: Q,
      well: injLocation,
      wellY,
      mapCells: mapCols,
      stop: injDuration,
      faults: faultCount,
      faultData: JSON.stringify(faults.slice(0, faultCount)),
      terrain: terrainSeed,
      hetero: heterogeneity,
      risk: riskModel
    };
    Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    return url.toString();
  };
  const copyScenarioLink = async () => {
    const url = scenarioUrl();
    window.history.replaceState({
      simulator: true
    }, '', url);
    const copied = await copyTextToClipboard(url, navigator.clipboard, text => {
      const field = document.createElement('textarea');
      field.value = text;
      document.body.appendChild(field);
      field.select();
      try {
        return document.execCommand('copy');
      } finally {
        field.remove();
      }
    });
    setShareStatus(copied ? 'Scenario link copied' : 'Scenario link copy failed. Please retry.');
    setTimeout(() => setShareStatus(''), copied ? 2400 : 3200);
  };
  const downloadBlob = (blob, filename) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const exportCsv = () => {
    const csv = massBalanceCsv(activeMassHistory, activeModel, terrainSeed);
    downloadBlob(new Blob([csv], {
      type: 'text/csv;charset=utf-8'
    }), `ve-${activeModel}-mass-balance.csv`);
  };
  const exportSvg = () => {
    if (!reservoirSvgRef.current) throw new Error('Reservoir figure is unavailable');
    const markup = new XMLSerializer().serializeToString(reservoirSvgRef.current);
    downloadBlob(new Blob([markup], {
      type: 'image/svg+xml;charset=utf-8'
    }), 've-simulator-reservoir.svg');
  };
  const exportCanvas = () => {
    const canvas = document.querySelector(isMapView && activeSubTab === 'topography' ? '.ve-topography-canvas' : '#tabpanel-map canvas');
    if (!canvas) throw new Error('Map figure is unavailable');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `ve-${activeSubTab}-seed-${terrainSeed}.png`;
    link.click();
  };
  const runFileAction = (action, failureMessage) => executeFileAction(action, () => {
    setShareStatus(failureMessage);
    setTimeout(() => setShareStatus(''), 3200);
  });

  // Geometry helpers accept an optional params object `p` so Monte Carlo
  // realizations can vary dip/amplitude/faultOffset/faults independently of
  // the live UI state. Passing no `p` (all render call sites) uses closure state.
  const capRockBaseProfile = (x, p = profileParams) => {
    const dip = 150 + x * ((p ? p.dipPercent : dipPercent) / 100.0) * 8.0; // regional dip
    const wave = -(p ? p.amplitude : amplitude) * Math.sin(x * Math.PI / 1000.0 * (p ? p.frequency : frequency) * 2);
    return dip + wave;
  };

  // Base unperturbed stratum profile for any yOffset
  const stratumBaseProfile = (x, yOffset = 0, p) => {
    return capRockBaseProfile(x, p) + yOffset;
  };

  // Computes the exact subpixel intersection (x*, y*) of a sloped fault plane with any geological stratum at depth
  const getSimStratumFaultIntersection = (f, idx, yOffset = 0, p) => {
    const x0 = f.xPercent / 100.0 * 1000.0;
    const defaultSlope = idx % 2 === 0 ? -0.22 : 0.25;
    const slope = f.dipSlope !== undefined ? f.dipSlope : defaultSlope;
    let x = x0;
    for (let iter = 0; iter < 3; iter++) {
      const y = stratumBaseProfile(x, yOffset, p);
      x = x0 + slope * y;
    }
    const y = stratumBaseProfile(x, yOffset, p);
    return {
      x,
      y,
      x0,
      slope
    };
  };

  // Computes intersection for caprock specifically (yOffset = 0)
  const getSimFaultIntersection = (f, idx, p) => {
    return getSimStratumFaultIntersection(f, idx, 0, p);
  };

  // Computes elevation for any geological stratum displaced along the sloped fault
  const stratumY = (x, cellIdx = null, yOffset = 0, p) => {
    const g = p || profileParams;
    const base = stratumBaseProfile(x, yOffset, p);
    let offset = 0;
    const cellWidth = g.parentDX || 1000 / g.cellCount;
    const xRef = cellIdx !== null ? cellIdx * cellWidth + cellWidth / 2 : x;
    for (let idx = 0; idx < g.faultCount; idx++) {
      const f = g.faults[idx];
      const inter = getSimStratumFaultIntersection(f, idx, yOffset, g);
      if (xRef > inter.x) {
        const direction = idx % 2 === 0 ? 1 : -1;
        offset += direction * g.faultOffset * 12;
      }
    }
    return base + offset;
  };

  // Helper: Caprock Underside Topography Function
  const capRockY = (x, cellIdx = null, p) => {
    return stratumY(x, cellIdx, 0, p);
  };

  // --- SOLVER ITERATOR (FORWARD & REVERSE) ---
  useEffect(() => {
    if (!isPlaying && !isReversing) return;
    const interval = setInterval(() => {
      if (isPlaying) {
        setSimTime(t => {
          const nextTime = t + 1;
          if (nextTime > 1000) {
            setIsPlaying(false);
            return t;
          }

          // Run numerical VE solver step using parameters from the ref
          const result = runSolverStep(stateRef.current.h, stateRef.current.hMax, stateRef.current.masses, nextTime, solverParamsRef.current);

          // Update local React states
          setH(result.h);
          setHMax(result.hMax);
          setCurrentMasses(result.masses);

          // Append to mass history for plotting
          if (nextTime % 5 === 0 || nextTime === 1 || nextTime === 1000) {
            setMassHistory(history => {
              const cleaned = history.filter(item => item.time < nextTime);
              return [...cleaned, {
                time: nextTime,
                ...result.masses
              }];
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
            masses: {
              ...result.masses
            },
            params: snapshotParams()
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
              masses: {
                ...histState.masses
              }
            };
          }
          return nextTime;
        });
      }
    }, 40 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, isReversing, speed]);

  // Time-Travel Scrubbing Handler (Non-destructive)
  const handleScrub = targetTime => {
    setIsPlaying(false);
    setIsReversing(false);
    const t = Math.max(0, Math.min(1000, targetTime));

    // If user seeks beyond currently simulated history, dynamically advance forward to t
    if (historyRef.current.length <= t) {
      const p = solverParamsRef.current;
      const newMassItems = [];
      while (historyRef.current.length <= t) {
        const nextYr = historyRef.current.length;
        const lastState = historyRef.current[nextYr - 1];
        const res = runSolverStep(lastState.h, lastState.hMax, lastState.masses, nextYr, p);
        historyRef.current.push({
          time: nextYr,
          h: [...res.h],
          hMax: [...res.hMax],
          masses: {
            ...res.masses
          },
          params: snapshotParams()
        });
        if (nextYr % 5 === 0 || nextYr === 1 || nextYr === t) {
          newMassItems.push({
            time: nextYr,
            ...res.masses
          });
        }
      }
      if (newMassItems.length > 0) {
        setMassHistory(prev => [...prev, ...newMassItems]);
      }
    }
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
        masses: {
          ...histState.masses
        }
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
        masses: {
          ...histState.masses
        }
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
      if (key === 'K') vCurr = K;else if (key === 'porosity') vCurr = porosity;else if (key === 'cellCount') vCurr = cellCount;else if (key === 'residualTrapFraction') vCurr = residualTrapFraction;else if (key === 'dipPercent') vCurr = dipPercent;else if (key === 'amplitude') vCurr = amplitude;else if (key === 'frequency') vCurr = frequency;else if (key === 'faultOffset') vCurr = faultOffset;else if (key === 'terrainSeed') vCurr = terrainSeed;else if (key === 'heterogeneity') vCurr = heterogeneity;else if (key === 'Q') vCurr = Q;else if (key === 'injLocation') vCurr = injLocation;else if (key === 'injDuration') vCurr = injDuration;else if (key === 'faultCount') vCurr = faultCount;
      if (key !== 'faults' && Math.abs(vHist - vCurr) > 1e-5) {
        diffs.push({
          label,
          original: formatHist(vHist),
          current: formatCurr(vCurr)
        });
      }
    };
    checkDiff('K', 'Permeability (K)', v => `${Math.round(v * 1000)} mD`, v => `${Math.round(v * 1000)} mD`);
    checkDiff('porosity', 'Porosity (\u03C6)', v => `${Math.round(v * 100)}%`, v => `${Math.round(v * 100)}%`);
    checkDiff('cellCount', 'Grid Cells (N)', v => v, v => v);
    checkDiff('residualTrapFraction', 'Residual Trap (Sgr)', v => `${Math.round(v * 100)}%`, v => `${Math.round(v * 100)}%`);
    checkDiff('dipPercent', 'Regional Dip', v => `${v}%`, v => `${v}%`);
    checkDiff('amplitude', 'Anticline Height', v => `${v}px`, v => `${v}px`);
    checkDiff('frequency', 'Anticline Count', v => v, v => v);
    checkDiff('faultOffset', 'Fault Slip', v => `${v}x`, v => `${v}x`);
    checkDiff('terrainSeed', 'Terrain Seed', v => v, v => v);
    checkDiff('heterogeneity', 'Terrain Heterogeneity', v => `${Math.round(v * 100)}%`, v => `${Math.round(v * 100)}%`);
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

  // Accessible tab switching (Left/Right arrows while focus is inside the tablist)
  const handleTabKeys = e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const tabs = activeSubTab === 'profile' ? ['profile'] : MAP_TABS;
    const idx = tabs.indexOf(activeSubTab);
    const dir = e.key === 'ArrowRight' ? 1 : tabs.length - 1;
    const next = tabs[(idx + dir) % tabs.length];
    setActiveSubTab(next);
    requestAnimationFrame(() => tabRefs.current[next] && tabRefs.current[next].focus());
  };

  // Play controls toggles
  const handlePlayToggle = () => {
    if (isReversing) setIsReversing(false);
    const action = getPlaybackAction({
      isPlaying,
      simTime,
      scenarioChanged: scenarioSignature !== lastRunSignatureRef.current
    });
    if (action === 'pause') {
      setIsPlaying(false);
      return;
    }
    if (action === 'run-scenario') {
      handleRunScenario();
      return;
    }
    if (simTime < historyRef.current.length - 1) commitBranch();
    setIsPlaying(true);
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
    if (nextTime > 1000) return;
    if (simTime < historyRef.current.length - 1) {
      commitBranch();
    }
    const result = runSolverStep(stateRef.current.h, stateRef.current.hMax, stateRef.current.masses, nextTime, solverParamsRef.current);
    setH(result.h);
    setHMax(result.hMax);
    setCurrentMasses(result.masses);
    setSimTime(nextTime);
    if (nextTime % 5 === 0 || nextTime === 1 || nextTime === 1000) {
      setMassHistory(history => {
        const cleaned = history.filter(item => item.time < nextTime);
        return [...cleaned, {
          time: nextTime,
          ...result.masses
        }];
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
      masses: {
        ...result.masses
      },
      params: snapshotParams()
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
        masses: {
          ...histState.masses
        }
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

    // Capture nominal parameter values
    const nominalK = K;
    const nominalSgr = residualTrapFraction;
    const nominalFaults = faults.map(f => ({
      ...f
    }));
    const activeFaults = nominalFaults.slice(0, faultCount);
    const leakingFaults = activeFaults.filter(f => !f.isSealed);
    const anyLeaking = leakingFaults.length > 0;
    const nominals = {
      K: nominalK,
      residualTrapFraction: nominalSgr,
      porosity: porosity,
      Q: Q,
      injLocation: injLocation,
      dipPercent: dipPercent,
      amplitude: amplitude,
      faultThreshold: activeFaults.length ? activeFaults.reduce((s, f) => s + f.thresholdHeight, 0) / activeFaults.length : 0.35,
      faultLeakRate: anyLeaking ? leakingFaults.reduce((s, f) => s + f.leakRate, 0) / leakingFaults.length : 0.14,
      faultTransmissibility: activeFaults.length ? activeFaults.reduce((s, f) => s + (f.transmissibility !== undefined ? f.transmissibility : 1.0), 0) / activeFaults.length : 1.0
    };
    const defOf = key => UQ_PARAM_DEFS.find(d => d.key === key);
    const sampledKeys = new Set();

    // Generate parameter sets for each realization
    const realizations = [];
    for (let i = 0; i < totalRuns; i++) {
      const s = {};
      UQ_PARAM_DEFS.forEach(def => {
        if (def.group === 'fault') return; // sampled per-fault below
        const r = sampleUqParam(def, uqParams[def.key], nominals[def.key]);
        s[def.key] = r.value;
        if (r.sampled) sampledKeys.add(def.key);
      });
      const randFaults = nominalFaults.map(f => {
        const nf = {
          ...f
        };
        ['faultThreshold', 'faultLeakRate', 'faultTransmissibility'].forEach(key => {
          if (faultCount === 0) return;
          const def = defOf(key);
          if (key === 'faultLeakRate' && (f.isSealed || !anyLeaking)) return;
          const base = key === 'faultThreshold' ? f.thresholdHeight : key === 'faultLeakRate' ? f.leakRate : f.transmissibility !== undefined ? f.transmissibility : 1.0;
          const r = sampleUqParam(def, uqParams[key], base);
          if (r.sampled) {
            if (key === 'faultThreshold') nf.thresholdHeight = r.value;else if (key === 'faultLeakRate') nf.leakRate = r.value;else nf.transmissibility = r.value;
            sampledKeys.add(key);
          }
        });
        return nf;
      });
      realizations.push({
        id: i,
        K: s.K,
        residualTrapFraction: s.residualTrapFraction,
        porosity: s.porosity,
        Q: s.Q,
        injLocation: s.injLocation,
        dipPercent: s.dipPercent,
        amplitude: s.amplitude,
        terrainSeed,
        heterogeneity,
        faults: randFaults
      });
    }
    if (!window.Worker) {
      setUqRunning(false);
      setShareStatus('This browser does not support background simulation workers.');
      return;
    }
    const worker = new Worker('./uq-worker.js');
    uqWorkerRef.current = worker;
    worker.onmessage = ({
      data
    }) => {
      if (data.type === 'progress') setUqProgress(data.value);
      if (data.type === 'complete') {
        setUqRunning(false);
        setMcResults({
          runs: data.results,
          sampledKeys: Array.from(sampledKeys),
          modelType: riskModel,
          scenario: scenarios[riskModel]
        });
        worker.terminate();
        uqWorkerRef.current = null;
      }
    };
    worker.onerror = () => {
      setUqRunning(false);
      setShareStatus('Uncertainty analysis could not start. Please retry.');
      worker.terminate();
      uqWorkerRef.current = null;
    };
    worker.postMessage({
      realizations,
      base: {
        modelType: riskModel,
        cellCount,
        frequency,
        faultOffset,
        injDuration,
        faultCount,
        parentDX: dx,
        mapCols,
        mapRows: Math.max(12, Math.round(mapCols * 0.6)),
        wellY,
        terrainSeed,
        heterogeneity
      }
    });
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
    const runs = mcResults.runs;
    const vals = runs.map(r => uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency);
    const sorted = [...vals].sort((a, b) => a - b);
    const p10Val = getPercentile(sorted, 10);
    const p50Val = getPercentile(sorted, 50);
    const p90Val = getPercentile(sorted, 90);
    const findClosestRealization = targetVal => {
      let closest = runs[0];
      let minDiff = Infinity;
      runs.forEach(r => {
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

  // Memoized Sensitivity correlations — only ranks parameters actually
  // sampled in the batch (per mcResults.sampledKeys).
  const sensitivityData = useMemo(() => {
    if (!mcResults) return null;
    const {
      runs,
      sampledKeys
    } = mcResults;
    if (!sampledKeys || sampledKeys.length === 0) return [];
    const yVals = runs.map(r => uqTargetMetric === 'leaked' ? r.finalLeaked : r.trappingEfficiency);
    const scalarGetters = {
      K: r => r.params.K,
      residualTrapFraction: r => r.params.residualTrapFraction,
      porosity: r => r.params.porosity,
      Q: r => r.params.Q,
      injLocation: r => r.params.injLocation,
      dipPercent: r => r.params.dipPercent,
      amplitude: r => r.params.amplitude
    };
    const faultGetters = {
      faultThreshold: r => {
        const a = r.params.faults.slice(0, faultCount);
        return a.length ? a.reduce((s, f) => s + f.thresholdHeight, 0) / a.length : 0;
      },
      faultLeakRate: r => {
        const a = r.params.faults.slice(0, faultCount).filter(f => !f.isSealed);
        return a.length ? a.reduce((s, f) => s + f.leakRate, 0) / a.length : 0;
      },
      faultTransmissibility: r => {
        const a = r.params.faults.slice(0, faultCount);
        return a.length ? a.reduce((s, f) => s + (f.transmissibility !== undefined ? f.transmissibility : 1.0), 0) / a.length : 0;
      }
    };
    return sampledKeys.map(key => {
      const def = UQ_PARAM_DEFS.find(d => d.key === key);
      const getter = def.group === 'fault' ? faultGetters[key] : scalarGetters[key];
      return {
        label: def.label,
        r: computeCorrelation(runs.map(getter), yVals)
      };
    }).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [mcResults, uqTargetMetric, faultCount]);

  // Restore the exact case used by this batch, including unsampled parameters.
  const loadUQRealization = realization => {
    if (!realization || !mcResults) return;
    const {
      modelType,
      scenario
    } = mcResults;
    const loadedParams = {
      ...scenario,
      ...realization.params,
      parentDX: 1000 / scenario.cellCount
    };
    setScenarios(current => ({
      ...current,
      [modelType]: loadedParams
    }));
    if (modelType === 'map') {
      setActiveSubTab('topography');
      setTimeout(() => sendMapCommand('run'), 0);
      return;
    }
    profileReplayRef.current = true;
    lastRunSignatureRef.current = createScenarioSignature(loadedParams);
    const cellCount = loadedParams.cellCount;
    // 3. Replay the realization year-by-year so the ENTIRE timeline is
    //    scrubbable (previously only years 0 and 1000 existed, which left
    //    the seek slider, milestones, play and scrub dead after loading).
    let rH = new Array(cellCount).fill(0);
    let rHMax = new Array(cellCount).fill(0);
    let rMasses = {
      injected: 0,
      trapped: 0,
      mobile: 0,
      leaked: 0
    };
    const replayHistory = [{
      time: 0,
      h: [...rH],
      hMax: [...rHMax],
      masses: {
        ...rMasses
      },
      params: loadedParams
    }];
    const replayMassHistory = [{
      time: 0,
      ...rMasses
    }];
    for (let yr = 1; yr <= 1000; yr++) {
      const res = runSolverStep(rH, rHMax, rMasses, yr, loadedParams);
      rH = res.h;
      rHMax = res.hMax;
      rMasses = res.masses;
      replayHistory.push({
        time: yr,
        h: [...res.h],
        hMax: [...res.hMax],
        masses: {
          ...res.masses
        },
        params: loadedParams
      });
      if (yr % 5 === 0 || yr === 1) replayMassHistory.push({
        time: yr,
        ...res.masses
      });
    }
    setH(rH);
    setHMax(rHMax);
    setCurrentMasses(rMasses);
    setMassHistory(replayMassHistory);
    setSimTime(1000);
    setIsPlaying(false);
    setIsReversing(false);
    stateRef.current = {
      h: [...rH],
      hMax: [...rHMax],
      masses: {
        ...rMasses
      }
    };
    historyRef.current = replayHistory;
    setActiveSubTab('profile');
  };

  // SVG Histogram Renderer
  const renderUQHistogram = data => {
    const width = 450;
    const height = 200;
    const padding = {
      left: 40,
      right: 20,
      top: 20,
      bottom: 25
    };
    const getX = val => padding.left + (val - data.minVal) / data.range * (width - padding.left - padding.right);
    const getY = count => height - padding.bottom - count / data.maxBinCount * (height - padding.top - padding.bottom);
    return /*#__PURE__*/React.createElement("svg", {
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, [0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
      const y = getY(data.maxBinCount * ratio);
      return /*#__PURE__*/React.createElement("line", {
        key: i,
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: "rgba(255,255,255,0.05)",
        strokeWidth: "0.5",
        strokeDasharray: "3 3"
      });
    }), data.bins.map((count, idx) => {
      const valStart = data.minVal + idx * data.binWidth;
      const valEnd = valStart + data.binWidth;
      const x1 = getX(valStart);
      const x2 = getX(valEnd);
      const y = getY(count);
      const barWidth = Math.max(1, x2 - x1 - 1.5);
      const barHeight = Math.max(0, height - padding.bottom - y);
      return /*#__PURE__*/React.createElement("rect", {
        key: idx,
        x: x1,
        y: y,
        width: barWidth,
        height: barHeight,
        fill: "rgba(100, 255, 218, 0.22)",
        stroke: "rgba(100, 255, 218, 0.5)",
        strokeWidth: "1"
      });
    }), [{
      label: 'P10',
      val: data.p10Val,
      color: '#64ffda'
    }, {
      label: 'P50',
      val: data.p50Val,
      color: '#ffb300'
    }, {
      label: 'P90',
      val: data.p90Val,
      color: '#ff6b6b'
    }].map((p, i) => {
      const x = getX(p.val);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: x,
        y1: padding.top,
        x2: x,
        y2: height - padding.bottom,
        stroke: p.color,
        strokeWidth: "1.5",
        strokeDasharray: "4 3"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: x,
        cy: padding.top,
        r: "3.5",
        fill: p.color
      }), /*#__PURE__*/React.createElement("text", {
        x: x,
        y: padding.top - 5,
        fill: p.color,
        fontSize: "8.5",
        fontWeight: "bold",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, p.label));
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: height - padding.bottom,
      x2: width - padding.right,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("text", {
      x: padding.left,
      y: height - 8,
      fill: "rgba(255,255,255,0.4)",
      fontSize: "8.5",
      textAnchor: "start",
      fontFamily: "monospace"
    }, data.minVal.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%'), /*#__PURE__*/React.createElement("text", {
      x: width - padding.right,
      y: height - 8,
      fill: "rgba(255,255,255,0.4)",
      fontSize: "8.5",
      textAnchor: "end",
      fontFamily: "monospace"
    }, data.maxVal.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%'));
  };

  // SVG Sensitivity Tornado Renderer (height adapts to number of parameters)
  const renderUQSensitivity = data => {
    const width = 450;
    const padding = {
      left: 140,
      right: 30,
      top: 25,
      bottom: 20
    };
    const barHeight = 24;
    const gap = 16;
    const height = padding.top + padding.bottom + Math.max(1, data.length) * (barHeight + gap) - gap;
    const centerOffset = padding.left + (width - padding.left - padding.right) / 2;
    const halfPlotWidth = (width - padding.left - padding.right) / 2;
    const getX = r => centerOffset + r * halfPlotWidth;
    return /*#__PURE__*/React.createElement("svg", {
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, [-1.0, -0.5, 0, 0.5, 1.0].map((tick, i) => {
      const x = getX(tick);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: x,
        y1: padding.top - 5,
        x2: x,
        y2: height - padding.bottom,
        stroke: tick === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.05)",
        strokeWidth: tick === 0 ? "1" : "0.5",
        strokeDasharray: tick === 0 ? "none" : "3 3"
      }), /*#__PURE__*/React.createElement("text", {
        x: x,
        y: padding.top - 12,
        fill: "rgba(255,255,255,0.35)",
        fontSize: "8",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, tick > 0 ? `+${tick.toFixed(1)}` : tick.toFixed(1)));
    }), data.map((item, idx) => {
      const y = padding.top + idx * (barHeight + gap);
      const xStart = item.r >= 0 ? centerOffset : getX(item.r);
      const xEnd = item.r >= 0 ? getX(item.r) : centerOffset;
      const rectWidth = Math.max(1, xEnd - xStart);
      const color = item.r >= 0 ? '#64ffda' : '#ff6b6b';
      const fill = item.r >= 0 ? 'rgba(100, 255, 218, 0.25)' : 'rgba(255, 107, 107, 0.25)';
      return /*#__PURE__*/React.createElement("g", {
        key: idx
      }, /*#__PURE__*/React.createElement("text", {
        x: padding.left - 10,
        y: y + barHeight / 2 + 3,
        fill: "rgba(255,255,255,0.85)",
        fontSize: "9.5",
        textAnchor: "end",
        fontFamily: "sans-serif"
      }, item.label), /*#__PURE__*/React.createElement("rect", {
        x: xStart,
        y: y,
        width: rectWidth,
        height: barHeight,
        fill: fill,
        stroke: color,
        strokeWidth: "1",
        rx: "3"
      }), /*#__PURE__*/React.createElement("text", {
        x: item.r >= 0 ? xEnd + 6 : xStart - 6,
        y: y + barHeight / 2 + 3,
        fill: color,
        fontSize: "9",
        fontWeight: "bold",
        textAnchor: item.r >= 0 ? 'start' : 'end',
        fontFamily: "monospace"
      }, item.r.toFixed(2)));
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top - 5,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.1)",
      strokeWidth: "1"
    }));
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
    const dx = parentDX || 1000.0 / N;
    let nextH = [...currentH];
    let nextHMax = [...currentHMax];
    let {
      injected,
      trapped,
      mobile,
      leaked
    } = masses;

    // 25 explicit substeps per model year for a stable educational animation
    const substeps = 25;
    const dt = 1.0 / substeps;

    // Physical coordinate depth array (scaled by 1/15)
    const zt = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      zt[i] = capRockY(i * dx + dx / 2.0, i, params) / 15.0;
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

      // 2. Compute first-order upwind fluxes using only the mobile thickness
      const fluxes = new Array(N - 1).fill(0);
      for (let i = 0; i < N - 1; i++) {
        const zL = zt[i] + nextH[i];
        const zR = zt[i + 1] + nextH[i + 1];
        const grad = (zR - zL) / (dx / 5.0);
        const hFace = grad > 0 ? hMob[i + 1] : hMob[i];

        // Find if a fault is located at this grid boundary and apply its transmissibility multiplier
        let transMult = 1.0;
        for (let idx = 0; idx < faultCount; idx++) {
          const f = faults[idx];
          if (f) {
            const inter = getSimFaultIntersection(f, idx, params);
            const cellFaultIdx = Math.round(inter.x / dx);
            if (cellFaultIdx - 1 === i) {
              if (f.isSealed) {
                transMult = 0.0; // Infinite sealed barrier
              } else {
                transMult = f.transmissibility !== undefined ? f.transmissibility : 1.0;
              }
              break;
            }
          }
        }
        let rawFlux = -(K / porosity) * hFace * grad * 0.08 * transMult;

        // Practical flux cap: no more than 30% of upstream mobile height per substep
        if (rawFlux > 0) {
          rawFlux = Math.min(rawFlux, 0.30 * hMob[i] / dt);
        } else {
          rawFlux = Math.max(rawFlux, -(0.30 * hMob[i + 1]) / dt);
        }
        fluxes[i] = rawFlux;
      }

      // Ghost cells boundaries (zero far-field flux)
      const H_res = 175.0 / 15.0; // 11.667 m physical maximum thickness of reservoir sandstone bed
      const hTmp = [...nextH];
      for (let i = 0; i < N; i++) {
        const fL = i === 0 ? 0 : fluxes[i - 1];
        const fR = i === N - 1 ? 0 : fluxes[i];
        hTmp[i] = Math.max(0, Math.min(H_res, nextH[i] + dt * (fL - fR)));
      }

      // Injection: Smooth wellbore Gaussian kernel over adjacent cells to prevent point singularity
      const cellInjIdx = Math.floor(injLocation / 100.0 * N);
      if (Q > 0 && currentFrame <= injDuration) {
        const dVolInj = Q * dt;
        const kernel = [0.10, 0.20, 0.40, 0.20, 0.10];
        for (let offset = -2; offset <= 2; offset++) {
          const cIdx = Math.max(0, Math.min(N - 1, cellInjIdx + offset));
          hTmp[cIdx] = Math.min(H_res, hTmp[cIdx] + dVolInj * kernel[offset + 2] / (porosity * (dx / 5.0)));
        }
        injected += dVolInj;
      }

      // Fault Leaks: threshold-pressure/spill-height capillary barrier
      for (let idx = 0; idx < faultCount; idx++) {
        const f = faults[idx];
        if (!f.isSealed) {
          const inter = getSimFaultIntersection(f, idx, params);
          const cellFaultIdx = Math.round(inter.x / dx);
          const boundedIdx = Math.max(0, Math.min(N - 1, cellFaultIdx));

          // Leakage occurs only if CO2 column height H exceeds the threshold
          if (hTmp[boundedIdx] > f.thresholdHeight) {
            const overpressure = hTmp[boundedIdx] - f.thresholdHeight;
            const leakHeight = Math.min(overpressure, f.leakRate * dt * 0.8);
            hTmp[boundedIdx] -= leakHeight;
            leaked += leakHeight * porosity * (dx / 5.0);
          }
        }
      }
      nextH = hTmp.map(val => Math.max(0, Math.min(H_res, val)));
      for (let i = 0; i < N; i++) {
        if (nextH[i] > nextHMax[i]) nextHMax[i] = Math.min(H_res, nextH[i]);
      }
    }

    // Mass distribution calculation (Exact integral of fluid volume)
    let mobileSum = 0;
    let trappedSum = 0;
    for (let i = 0; i < N; i++) {
      const H = nextH[i];
      const hm = nextHMax[i];
      const R = residualTrapFraction;
      const mobileVal = R < 1.0 ? Math.max(0, (H - R * hm) / (1.0 - R)) : 0;
      const hMob = Math.min(H, mobileVal);
      const hTrap = Math.max(0, H - hMob);
      mobileSum += hMob * (dx / 5.0) * porosity;
      trappedSum += hTrap * (dx / 5.0) * porosity;
    }
    return {
      h: nextH,
      hMax: nextHMax,
      masses: {
        injected: parseFloat(injected.toFixed(2)),
        trapped: parseFloat(trappedSum.toFixed(2)),
        mobile: parseFloat(mobileSum.toFixed(2)),
        leaked: parseFloat(leaked.toFixed(2))
      }
    };
  };

  // --- NODE-BASED RIBBON BUILDER (Zero Sawteeth Guaranteed) ---
  const buildSmoothRibbon = (topElevationFn, botElevationFn, kStart, kEnd) => {
    if (kStart > kEnd) return "";
    let path = "";
    const {
      cellCount
    } = profileParams;
    for (let k = kStart; k <= kEnd; k++) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
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
    for (let k = kEnd; k >= kStart; k--) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
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
  const getSimNodeValue = (arr, k, side = 'avg') => {
    if (!arr) return 0;
    const N = arr.length;
    if (k <= 0) return arr[0];
    if (k >= N) return arr[N - 1];
    if (side === 'left') return arr[k - 1];
    if (side === 'right') return arr[k];
    return 0.5 * (arr[k - 1] + arr[k]);
  };

  // Helper to find the active continuous domain with sub-grid zero-tapered tip nodes
  const getSimActiveBounds = (nodeValueFn, N, eps = 0.001) => {
    let kFirst = -1,
      kLast = -1;
    for (let k = 0; k <= N; k++) {
      const val = nodeValueFn(k);
      if (val > eps) {
        if (kFirst === -1) kFirst = k;
        kLast = k;
      }
    }
    if (kFirst === -1) return null;
    const kStart = Math.max(0, kFirst - 1);
    const kEnd = Math.min(N, kLast + 1);
    return {
      kStart,
      kEnd
    };
  };

  // Swept Residual Trapping Footprint (hTrapped)
  // Fringe thickness modulated by entry pressure: higher P_e => thinner imbibe transition (Brooks-Corey)
  const getSweptResidualSimPath = () => {
    const {
      cellCount,
      hasCapillaryFringe,
      fringeScale,
      entryPressure
    } = profileParams;
    const N = cellCount;
    const scale = 15.0;
    const fringePx = hasCapillaryFringe ? fringeScale * 15.0 * 0.25 * (15.0 / entryPressure) : 0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hTrapped, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => capRockY(k * dx, side === 'left' ? k - 1 : k), (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      const hTrp = getSimNodeValue(hTrapped, k, side);
      const f = fringePx * Math.min(1.0, hTrp * 1.5);
      return Math.min(yBotMax, yTop + hTrp * scale + f);
    }, bounds.kStart, bounds.kEnd);
  };

  // Active Flowing Mobile Plume (hMobile)
  const getActiveMobileSimPath = () => {
    const {
      cellCount,
      hasCapillaryFringe,
      fringeScale,
      entryPressure
    } = profileParams;
    const N = cellCount;
    const scale = 15.0;
    const fringePx = hasCapillaryFringe ? fringeScale * 15.0 * 0.35 * (15.0 / entryPressure) : 0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hMobile, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    return buildSmoothRibbon((k, side) => capRockY(k * dx, side === 'left' ? k - 1 : k), (k, side) => {
      const yTop = capRockY(k * dx, side === 'left' ? k - 1 : k);
      const yBotMax = stratumY(k * dx, side === 'left' ? k - 1 : k, 175);
      const hMob = getSimNodeValue(hMobile, k, side);
      const f = fringePx * Math.min(1.0, hMob * 1.8);
      return Math.min(yBotMax, yTop + hMob * scale + f);
    }, bounds.kStart, bounds.kEnd);
  };

  // Maximum Historic Gas Saturation Boundary (hMax Swept Footprint Dashed Line)
  const getMaxHgLinePath = () => {
    const {
      cellCount,
      hasCapillaryFringe,
      fringeScale,
      entryPressure
    } = profileParams;
    const N = cellCount;
    const scale = 15.0;
    const bounds = getSimActiveBounds(k => getSimNodeValue(hMax, k, 'avg'), N, 0.001);
    if (!bounds) return "";
    let path = "";
    for (let k = bounds.kStart; k <= bounds.kEnd; k++) {
      const x = k * dx;
      const isFault = k > 0 && k < cellCount && Math.abs(capRockY(x, k - 1) - capRockY(x, k)) > 0.1;
      if (k === bounds.kStart) {
        const yTop = capRockY(x, isFault ? k : k);
        const yBotMax = stratumY(x, isFault ? k : k, 175);
        const y0 = Math.min(yBotMax, yTop + getSimNodeValue(hMax, k, isFault ? 'right' : 'avg') * scale);
        path = `M ${x} ${y0}`;
      } else if (isFault) {
        const yTopL = capRockY(x, k - 1);
        const yBotMaxL = stratumY(x, k - 1, 175);
        const yTopR = capRockY(x, k);
        const yBotMaxR = stratumY(x, k, 175);
        const yL = Math.min(yBotMaxL, yTopL + getSimNodeValue(hMax, k, 'left') * scale);
        const yR = Math.min(yBotMaxR, yTopR + getSimNodeValue(hMax, k, 'right') * scale);
        path += ` L ${x} ${yL} L ${x} ${yR}`;
      } else {
        const yTop = capRockY(x, k);
        const yBotMax = stratumY(x, k, 175);
        const y = Math.min(yBotMax, yTop + getSimNodeValue(hMax, k, 'avg') * scale);
        path += ` L ${x} ${y}`;
      }
    }
    return path;
  };

  // Build the three heavy plume geometry strings once per state/param change
  // instead of twice per render (they were previously invoked for both the
  // emptiness check and the path data on every tick).
  const plumePaths = useMemo(() => ({
    swept: getSweptResidualSimPath(),
    mobile: getActiveMobileSimPath(),
    maxEnv: getMaxHgLinePath()
  }), [hMobile, hTrapped, hMax, profileParams]);

  // Reservoir Conformable Grid block columns
  const reservoirBlocks = useMemo(() => {
    const blocks = [];
    const N = profileParams.cellCount;
    for (let i = 0; i < N; i++) {
      const x1 = i * dx;
      const x2 = (i + 1) * dx;
      const yt1 = capRockY(x1, i);
      const yt2 = capRockY(x2, i);
      const yb1 = stratumY(x1, i, 175);
      const yb2 = stratumY(x2, i, 175);

      // Permeability noise mapping for sandstone heterogeneity
      const permFactor = 0.5 + 0.5 * Math.sin(i * 12.7 + 1.1);
      const r = Math.floor(35 + permFactor * 14);
      const g = Math.floor(26 + permFactor * 10);
      const b = Math.floor(20 + permFactor * 6);
      const colFill = `rgb(${r}, ${g}, ${b})`;
      blocks.push({
        points: `${x1},${yt1} ${x2},${yt2} ${x2},${yb2} ${x1},${yb1}`,
        fill: colFill,
        x1,
        yt1,
        x2,
        yt2,
        yb1,
        yb2
      });
    }
    return blocks;
  }, [profileParams]);

  // --- Dynamic SVG Chart Drawing ---
  const renderSVGChart = (chartMasses, chartHistory, chartTime) => {
    const width = 450;
    const height = 210;
    const padding = {
      left: 45,
      right: 15,
      top: 15,
      bottom: 25
    };
    const maxVal = Math.max(10, Math.max(chartMasses.injected, chartMasses.mobile + chartMasses.trapped + chartMasses.leaked) * 1.08);

    // Scale helper
    const getX = t => padding.left + t / 1000.0 * (width - padding.left - padding.right);
    const getY = val => height - padding.bottom - val / maxVal * (height - padding.top - padding.bottom);
    let pathInj = "",
      pathTrap = "",
      pathMob = "",
      pathLeak = "";
    if (chartHistory.length > 0) {
      pathInj = `M ${getX(chartHistory[0].time)} ${getY(chartHistory[0].injected)}`;
      pathTrap = `M ${getX(chartHistory[0].time)} ${getY(chartHistory[0].trapped)}`;
      pathMob = `M ${getX(chartHistory[0].time)} ${getY(chartHistory[0].mobile)}`;
      pathLeak = `M ${getX(chartHistory[0].time)} ${getY(chartHistory[0].leaked)}`;
      for (let idx = 1; idx < chartHistory.length; idx++) {
        const pt = chartHistory[idx];
        pathInj += ` L ${getX(pt.time)} ${getY(pt.injected)}`;
        pathTrap += ` L ${getX(pt.time)} ${getY(pt.trapped)}`;
        pathMob += ` L ${getX(pt.time)} ${getY(pt.mobile)}`;
        pathLeak += ` L ${getX(pt.time)} ${getY(pt.leaked)}`;
      }
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        fontSize: 10.5,
        padding: '2px 4px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2,
        background: '#ffffff',
        opacity: 0.6,
        borderTop: '1px dashed #fff'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Injected:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#fff',
        fontFamily: 'monospace'
      }
    }, formatMass(chartMasses.injected))), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#f59e0b'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Mobile:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#f59e0b',
        fontFamily: 'monospace'
      }
    }, formatMass(chartMasses.mobile))), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#b45309'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Trapped:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#b45309',
        fontFamily: 'monospace'
      }
    }, formatMass(chartMasses.trapped))), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 2.5,
        background: '#ff6b6b'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)'
      }
    }, "Leaked:"), /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#ff6b6b',
        fontFamily: 'monospace'
      }
    }, formatMass(chartMasses.leaked)))), /*#__PURE__*/React.createElement("svg", {
      role: "img",
      "aria-labelledby": "mass-chart-title mass-chart-desc",
      width: "100%",
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)'
      }
    }, /*#__PURE__*/React.createElement("title", {
      id: "mass-chart-title"
    }, "CO\u2082 mass balance through year ", chartTime), /*#__PURE__*/React.createElement("desc", {
      id: "mass-chart-desc"
    }, "Line chart of injected, mobile, trapped, and leaked model mass over simulation time."), [0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
      const val = maxVal * ratio;
      const y = getY(val);
      return /*#__PURE__*/React.createElement("g", {
        key: i
      }, /*#__PURE__*/React.createElement("line", {
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: "rgba(255,255,255,0.05)",
        strokeWidth: "0.5",
        strokeDasharray: "3 3"
      }), /*#__PURE__*/React.createElement("text", {
        x: padding.left - 8,
        y: y + 3,
        fill: "rgba(255,255,255,0.45)",
        fontSize: "8.5",
        textAnchor: "end",
        fontFamily: "monospace"
      }, Math.round(val)));
    }), [0, 200, 400, 600, 800, 1000].map((t, i) => {
      const x = getX(t);
      return /*#__PURE__*/React.createElement("text", {
        key: i,
        x: x,
        y: height - 8,
        fill: "rgba(255,255,255,0.45)",
        fontSize: "8.5",
        textAnchor: "middle",
        fontFamily: "monospace"
      }, t, "y");
    }), pathInj && /*#__PURE__*/React.createElement("path", {
      d: pathInj,
      fill: "none",
      stroke: "#ffffff",
      strokeWidth: "1.5",
      strokeDasharray: "3 3",
      opacity: "0.6"
    }), pathMob && /*#__PURE__*/React.createElement("path", {
      d: pathMob,
      fill: "none",
      stroke: "#f59e0b",
      strokeWidth: "2",
      style: {
        filter: 'drop-shadow(0 0 2px rgba(245,158,11,0.35))'
      }
    }), pathTrap && /*#__PURE__*/React.createElement("path", {
      d: pathTrap,
      fill: "none",
      stroke: "#b45309",
      strokeWidth: "1.8"
    }), pathLeak && /*#__PURE__*/React.createElement("path", {
      d: pathLeak,
      fill: "none",
      stroke: "#ff6b6b",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: getX(chartTime),
      y1: padding.top,
      x2: getX(chartTime),
      y2: height - padding.bottom,
      stroke: "#64ffda",
      strokeWidth: "1.2",
      strokeDasharray: "2 2",
      opacity: "0.8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: getX(chartTime),
      cy: padding.top,
      r: "3",
      fill: "#64ffda"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: padding.top,
      x2: padding.left,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: padding.left,
      y1: height - padding.bottom,
      x2: width - padding.right,
      y2: height - padding.bottom,
      stroke: "rgba(255,255,255,0.15)",
      strokeWidth: "1"
    })), /*#__PURE__*/React.createElement("table", {
      className: "sr-only"
    }, /*#__PURE__*/React.createElement("caption", null, "Current CO\u2082 mass balance at year ", chartTime), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Injected"), /*#__PURE__*/React.createElement("th", null, "Mobile"), /*#__PURE__*/React.createElement("th", null, "Trapped"), /*#__PURE__*/React.createElement("th", null, "Leaked"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, chartMasses.injected), /*#__PURE__*/React.createElement("td", null, chartMasses.mobile), /*#__PURE__*/React.createElement("td", null, chartMasses.trapped), /*#__PURE__*/React.createElement("td", null, chartMasses.leaked)))));
  };
  const activeResults = selectActiveResults(activeSubTab, {
    time: simTime,
    masses: currentMasses,
    history: massHistory
  }, mapSnapshot);
  const activeTime = activeResults.time;
  const activeMasses = activeResults.masses;
  const activeMassHistory = activeResults.history;
  const presetButton = (id, label, icon) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => applyPreset(id),
    style: {
      background: selectedPreset === id ? 'rgba(100, 255, 218, 0.16)' : 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${selectedPreset === id ? '#64ffda' : 'rgba(255, 255, 255, 0.12)'}`,
      color: selectedPreset === id ? '#64ffda' : 'rgba(255, 255, 255, 0.75)',
      padding: '5px 10px',
      borderRadius: '7px',
      fontSize: '11px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontWeight: selectedPreset === id ? 600 : 400,
      outline: 'none',
      transition: 'all 0.15s ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: icon,
    style: {
      fontSize: '10px'
    }
  }), label);
  return /*#__PURE__*/React.createElement("div", {
    className: "simulator-page-wrapper",
    role: presentedPanel ? 'dialog' : undefined,
    "aria-modal": presentedPanel ? 'true' : undefined,
    "aria-label": presentedPanel ? `${presentedPanel === 'inputs' ? 'Inputs' : 'Outcomes'} panel` : undefined
  }, sidebarOpen && activeSubTab === 'profile' && /*#__PURE__*/React.createElement("aside", {
    className: "ve-history-sheet",
    "aria-label": "Simulation timeline"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#64ffda',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-history",
    style: {
      fontSize: 14
    }
  }), " Timeline"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSidebarOpen(false),
    "aria-label": "Close timeline panel",
    style: {
      background: 'none',
      border: 'none',
      color: 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      fontSize: 16
    },
    title: "Close panel"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-times"
  }))), (() => {
    const isPast = simTime < historyRef.current.length - 1;
    const paramDiffs = sidebarOpen ? getParamDiff() : [];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: isPast ? 'rgba(255, 179, 0, 0.1)' : 'rgba(100, 255, 218, 0.1)',
        border: `1px solid ${isPast ? 'rgba(255, 179, 0, 0.3)' : 'rgba(100, 255, 218, 0.3)'}`,
        padding: '12px 14px',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        fontWeight: 'bold',
        color: isPast ? '#ffb300' : '#64ffda'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: isPast ? '#ffb300' : '#64ffda',
        boxShadow: `0 0 8px ${isPast ? '#ffb300' : '#64ffda'}`,
        animation: 'pulseFlare 1.5s infinite'
      }
    }), isPast ? `VIEWING PAST \u00B7 YEAR ${simTime}` : `SIMULATING \u00B7 YEAR ${simTime}`), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.4
      }
    }, isPast ? `Viewing history at Year ${simTime}. Changes to sliders will configure a branch starting from this point.` : `Simulating in real-time. Drag the timeline scrub slider to travel back to previous years.`)), isPast && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 12,
        borderRadius: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        commitBranch();
        lastRunSignatureRef.current = scenarioSignature;
        handlePlayToggle();
      },
      style: {
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
        transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms cubic-bezier(0.23, 1, 0.32, 1)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-code-branch"
    }), " Branch & Run (Yr ", simTime, ")"), /*#__PURE__*/React.createElement("button", {
      onClick: () => handleScrub(historyRef.current.length - 1),
      style: {
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
        transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms cubic-bezier(0.23, 1, 0.32, 1)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-fast-forward"
    }), " Return to Present (Yr ", historyRef.current.length - 1, ")")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Time Controls"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: 8,
        borderRadius: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: stepBackward,
      "aria-label": "Step back 1 year",
      style: {
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        opacity: simTime > 0 ? 0.8 : 0.3
      },
      disabled: simTime === 0,
      title: "Step Back 1 Year"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-step-backward",
      style: {
        fontSize: 10
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handlePlayReverseToggle,
      "aria-label": isReversing ? 'Pause reverse playback' : 'Play backward',
      style: {
        background: 'none',
        border: 'none',
        color: isReversing ? '#ff6b6b' : '#64ffda',
        cursor: 'pointer'
      },
      title: isReversing ? "Pause" : "Play Reverse"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`,
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setIsPlaying(false);
        setIsReversing(false);
      },
      "aria-label": "Pause simulation",
      style: {
        background: 'none',
        border: 'none',
        color: !isPlaying && !isReversing ? '#ffb300' : '#fff',
        cursor: 'pointer'
      },
      title: "Pause"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-pause",
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handlePlayToggle,
      "aria-label": isPlaying ? 'Pause simulation' : 'Play simulation forward',
      style: {
        background: 'none',
        border: 'none',
        color: isPlaying ? '#0dfca2' : '#64ffda',
        cursor: 'pointer'
      },
      title: isPlaying ? "Pause" : "Play Forward"
    }, /*#__PURE__*/React.createElement("i", {
      className: `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`,
      style: {
        fontSize: 11
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: stepForward,
      "aria-label": "Step forward 1 year",
      style: {
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        opacity: simTime < 1000 ? 0.8 : 0.3
      },
      disabled: simTime >= 1000,
      title: "Step Forward 1 Year"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-step-forward",
      style: {
        fontSize: 10
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Branch Parameters"), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        maxHeight: '220px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, paramDiffs.length > 0 ? paramDiffs.map((diff, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        fontSize: 10.5,
        borderBottom: i < paramDiffs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        paddingBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: 500
      }
    }, diff.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'monospace'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#ff6b6b',
        textDecoration: 'line-through'
      }
    }, diff.original), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'rgba(255,255,255,0.4)'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-arrow-right",
      style: {
        fontSize: 8
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#0dfca2',
        fontWeight: 'bold'
      }
    }, diff.current)))) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        padding: '15px 0'
      }
    }, isPast ? 'Parameters match the original run. Tweak physical sliders below to define a new branch configuration.' : 'Simulating on main branch. Scroll down and modify parameters in real-time.'))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        fontWeight: 'bold'
      }
    }, "Milestones"), /*#__PURE__*/React.createElement("div", {
      style: {
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
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 19,
        top: 20,
        bottom: 20,
        width: 2,
        background: 'rgba(255,255,255,0.06)'
      }
    }), [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((m, idx) => {
      const maxSimulated = historyRef.current.length - 1;
      const isSimulated = m <= maxSimulated;
      const isCurrent = m === simTime;
      return /*#__PURE__*/React.createElement("button", {
        key: idx,
        onClick: () => handleScrub(m),
        "aria-label": `Jump to year ${m}${isCurrent ? ' (current)' : ''}`,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 0',
          background: 'none',
          border: 'none',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'left',
          width: '100%',
          cursor: 'pointer',
          opacity: isCurrent ? 1 : isSimulated ? 0.9 : 0.6
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: isCurrent ? '#0dfca2' : isSimulated ? '#3ca68e' : 'rgba(100,255,218,0.2)',
          border: isCurrent ? '2px solid #fff' : isSimulated ? '2px solid transparent' : '1px dashed rgba(100,255,218,0.6)',
          boxShadow: isCurrent ? '0 0 6px #0dfca2' : 'none',
          zIndex: 2,
          transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11.5,
          fontFamily: 'monospace',
          color: isCurrent ? '#0dfca2' : isSimulated ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
          fontWeight: isCurrent ? 'bold' : 'normal'
        }
      }, "Year ", m, " ", isCurrent && '\u2190'));
    }))));
  })()), /*#__PURE__*/React.createElement("style", null, `
        .sr-only { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (max-width: 768px) {
          .sim-tab-header { overflow-x: auto; align-items: stretch !important; }
          .sim-tab-header [role="tablist"] { min-width: max-content; }
          .sim-tab-status { display: none; }
          .sim-hud-legend { position: static !important; flex: 0 0 auto; width: 100%; max-width: 100%; overflow-x: auto; right: auto !important; top: auto !important; border-radius: 0 !important; pointer-events: auto !important; white-space: nowrap; scrollbar-width: none !important; }
          .sim-hud-legend > span { flex: 0 0 auto; }
          .sim-tab-header, .sim-hud-legend {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .sim-tab-header::-webkit-scrollbar, .sim-hud-legend::-webkit-scrollbar {
            width: 0 !important;
            height: 0 !important;
            display: none !important;
            background: transparent !important;
          }
          .sim-tab-header::-webkit-scrollbar-thumb, .sim-hud-legend::-webkit-scrollbar-thumb,
          .sim-tab-header::-webkit-scrollbar-track, .sim-hud-legend::-webkit-scrollbar-track {
            background: transparent !important;
            display: none !important;
          }
          .sim-playback { left: 8px !important; right: 8px !important; gap: 7px !important; padding: 8px 10px !important; }
          .sim-playback input[type="range"] { min-width: 48px; }
          .uq-config-grid, .uq-results-grid, .uq-percentile-grid { grid-template-columns: 1fr !important; }
          .sim-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .control-panel > summary { cursor: pointer; }
        }
      `), /*#__PURE__*/React.createElement("section", {
    className: "ve-scenario-bar",
    "aria-label": "Scenario controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ve-presets",
    "aria-label": "Reservoir presets"
  }, [['default', 'Default'], ['dome', 'Anticline'], ['faulted', 'Faulted trap'], ['monocline', 'Dipping layer']].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    className: selectedPreset === id ? 'is-active' : '',
    onClick: () => applyPreset(id)
  }, label)), /*#__PURE__*/React.createElement("button", {
    className: `ve-random-grid-button${selectedPreset === 'random' ? ' is-active' : ''}`,
    onClick: generateRandomGrid,
    "aria-label": "Generate random 2D grid with faults",
    title: "Generate a reproducible heterogeneous grid with finite faults"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-dice",
    "aria-hidden": "true"
  }), " Random grid")), /*#__PURE__*/React.createElement("span", {
    className: `ve-run-status ve-run-status--${runStatus.toLowerCase().replace(/\s+/g, '-')}`,
    role: "status"
  }, runStatus), /*#__PURE__*/React.createElement("button", {
    className: "ve-reset-button",
    onClick: resetActiveSimulation
  }, "Reset"), /*#__PURE__*/React.createElement("button", {
    className: "ve-share-button",
    onClick: copyScenarioLink
  }, "Copy scenario link"), /*#__PURE__*/React.createElement("details", {
    className: "ve-export-menu"
  }, /*#__PURE__*/React.createElement("summary", null, "Export"), /*#__PURE__*/React.createElement("button", {
    onClick: () => runFileAction(exportCsv, 'Mass balance export failed. Please retry.')
  }, "Mass balance CSV"), isMapView ? /*#__PURE__*/React.createElement("button", {
    onClick: () => runFileAction(exportCanvas, 'Map export failed. Please retry.')
  }, "View PNG") : /*#__PURE__*/React.createElement("button", {
    onClick: () => runFileAction(exportSvg, 'Reservoir export failed. Please retry.')
  }, "Reservoir SVG")), /*#__PURE__*/React.createElement("button", {
    className: "ve-theme-toggle",
    "aria-label": `Dark mode ${theme === 'dark' ? 'on' : 'off'}`,
    "aria-pressed": theme === 'dark',
    onClick: () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  }, /*#__PURE__*/React.createElement("i", {
    className: theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon',
    "aria-hidden": "true"
  }), " Dark mode"), /*#__PURE__*/React.createElement("button", {
    className: "ve-run-button",
    onClick: runActiveSimulation
  }, "Run scenario")), /*#__PURE__*/React.createElement("nav", {
    className: "ve-workspace-nav",
    "aria-label": "Simulator workspace"
  }, /*#__PURE__*/React.createElement("button", {
    "aria-current": isMapView ? 'page' : undefined,
    onClick: () => handleWorkspaceChange('topography')
  }, "2D / 3D simulator"), /*#__PURE__*/React.createElement("button", {
    "aria-current": activeSubTab === 'profile' ? 'page' : undefined,
    onClick: () => handleWorkspaceChange('profile')
  }, "1D cross-section simulator"), /*#__PURE__*/React.createElement("button", {
    "aria-current": activeSubTab === 'uq' ? 'page' : undefined,
    onClick: () => handleWorkspaceChange('uq')
  }, "Risk analysis"), /*#__PURE__*/React.createElement("button", {
    "aria-current": activeSubTab === 'guide' ? 'page' : undefined,
    onClick: () => handleWorkspaceChange('guide')
  }, "Methodology")), /*#__PURE__*/React.createElement("span", {
    className: "ve-action-status",
    role: "status",
    "aria-live": "polite"
  }, shareStatus), VISUALIZATION_TABS.includes(activeSubTab) && /*#__PURE__*/React.createElement("div", {
    ref: mobileTriggersRef,
    className: "ve-mobile-panel-triggers",
    role: "group",
    "aria-label": "Workbench panels",
    "data-panel-open": Boolean(presentedPanel)
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    ref: element => {
      mobileTriggerRefs.current.inputs = element;
    },
    "aria-controls": "ve-input-rail",
    "aria-expanded": presentedPanel === 'inputs',
    onClick: () => handleMobilePanelToggle('inputs')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-sliders-h",
    "aria-hidden": "true"
  }), " Inputs"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    ref: element => {
      mobileTriggerRefs.current.outcomes = element;
    },
    "aria-controls": "ve-outcome-rail",
    "aria-expanded": presentedPanel === 'outcomes',
    onClick: () => handleMobilePanelToggle('outcomes')
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-chart-line",
    "aria-hidden": "true"
  }), " Outcomes")), presentedPanel && VISUALIZATION_TABS.includes(activeSubTab) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ve-mobile-panel-backdrop",
    tabIndex: -1,
    "aria-label": `Close ${presentedPanel} panel`,
    onClick: () => dismissMobilePanel()
  }), /*#__PURE__*/React.createElement("div", {
    className: "ve-workbench",
    "data-workspace": activeSubTab
  }, /*#__PURE__*/React.createElement(InputRail, {
    "data-mobile-open": presentedPanel === 'inputs',
    inert: presentedPanel === 'outcomes' ? '' : undefined,
    closeRef: element => {
      mobileCloseRefs.current.inputs = element;
    },
    onClose: dismissMobilePanel
  }, /*#__PURE__*/React.createElement("div", {
    className: "ve-rail-heading"
  }, /*#__PURE__*/React.createElement("h2", null, isMapView ? 'Map simulator inputs' : '1D cross-section inputs'), /*#__PURE__*/React.createElement("span", {
    className: "ve-rail-mode"
  }, isMapView ? '2D / 3D' : '1D')), /*#__PURE__*/React.createElement("section", {
    className: "ve-input-group"
  }, /*#__PURE__*/React.createElement("h3", null, "Injection"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ParameterField, {
    label: "Flow rate (Q)",
    unit: "kt/yr",
    min: 0,
    max: 3.5,
    step: 0.1,
    value: Q,
    onChange: setQ
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: isMapView ? 'Well X location' : 'Well location',
    unit: "%",
    min: 10,
    max: 90,
    step: 5,
    value: injLocation,
    onChange: setInjLocation
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Injection stop year",
    unit: "y",
    min: 50,
    max: 400,
    step: 10,
    value: injDuration,
    onChange: setInjDuration
  }))), /*#__PURE__*/React.createElement("section", {
    className: "ve-input-group"
  }, /*#__PURE__*/React.createElement("h3", null, "Rock properties"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ParameterField, {
    label: "Permeability (K)",
    unit: "\xD710\xB3 mD",
    min: 0.1,
    max: 3.5,
    step: 0.1,
    value: K,
    onChange: setK
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Porosity (\u03C6)",
    unit: "fraction",
    min: 0.1,
    max: 0.4,
    step: 0.05,
    value: porosity,
    onChange: setPorosity
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Residual trap (Sgr)",
    unit: "fraction",
    min: 0,
    max: 0.4,
    step: 0.05,
    value: residualTrapFraction,
    onChange: setResidualTrapFraction
  }))), /*#__PURE__*/React.createElement("section", {
    className: "ve-input-group"
  }, /*#__PURE__*/React.createElement("h3", null, "Structure"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ParameterField, {
    label: "Regional dip",
    unit: "%",
    min: -5,
    max: 5,
    step: 0.5,
    value: dipPercent,
    onChange: setDipPercent
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Anticline height",
    unit: "px",
    min: 0,
    max: 50,
    step: 5,
    value: amplitude,
    onChange: setAmplitude
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Anticline count",
    unit: "",
    min: 0.5,
    max: 4,
    step: 0.5,
    value: frequency,
    onChange: setFrequency
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Fault slip",
    unit: "\xD7",
    min: 0,
    max: 3,
    step: 0.2,
    value: faultOffset,
    onChange: setFaultOffset
  }), isMapView && /*#__PURE__*/React.createElement(ParameterField, {
    label: "Terrain heterogeneity",
    unit: "fraction",
    min: 0,
    max: 1,
    step: 0.05,
    value: heterogeneity,
    onChange: setHeterogeneity
  }))), /*#__PURE__*/React.createElement("section", {
    className: "ve-fault-section"
  }, /*#__PURE__*/React.createElement("h3", null, "Faults"), /*#__PURE__*/React.createElement("div", {
    className: "ve-fault-count"
  }, /*#__PURE__*/React.createElement("span", null, "Active faults"), /*#__PURE__*/React.createElement("div", null, [0, 1, 2, 3].map(count => /*#__PURE__*/React.createElement("button", {
    key: count,
    className: faultCount === count ? 'is-active' : '',
    onClick: () => setFaultCount(count)
  }, count)))), faults.slice(0, faultCount).map((fault, index) => /*#__PURE__*/React.createElement("div", {
    className: "ve-fault-editor",
    key: index
  }, /*#__PURE__*/React.createElement("div", {
    className: "ve-fault-heading"
  }, /*#__PURE__*/React.createElement("strong", null, "Fault ", String.fromCharCode(65 + index)), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: fault.isSealed,
    onChange: event => {
      const next = faults.map(f => ({
        ...f
      }));
      next[index].isSealed = event.target.checked;
      setFaults(next);
    }
  }), "Sealed")), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Position",
    unit: "%",
    min: 10,
    max: 90,
    step: 5,
    value: fault.xPercent,
    onChange: value => {
      const next = faults.map(f => ({
        ...f
      }));
      next[index].xPercent = value;
      setFaults(next);
    }
  }), isMapView && /*#__PURE__*/React.createElement(ParameterField, {
    label: "Y start",
    unit: "%",
    min: 0,
    max: 100,
    step: 5,
    value: fault.yStartPercent ?? 0,
    onChange: value => {
      const next = faults.map(f => ({
        ...f
      }));
      next[index].yStartPercent = value;
      setFaults(next);
    }
  }), isMapView && /*#__PURE__*/React.createElement(ParameterField, {
    label: "Y end",
    unit: "%",
    min: 0,
    max: 100,
    step: 5,
    value: fault.yEndPercent ?? 100,
    onChange: value => {
      const next = faults.map(f => ({
        ...f
      }));
      next[index].yEndPercent = value;
      setFaults(next);
    }
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Capillary threshold",
    unit: "m",
    min: 0,
    max: 2,
    step: 0.1,
    value: fault.thresholdHeight,
    onChange: value => {
      const next = faults.map(f => ({
        ...f
      }));
      next[index].thresholdHeight = value;
      setFaults(next);
    }
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Horizontal transmissibility",
    unit: "fraction",
    min: 0,
    max: 1,
    step: 0.05,
    value: fault.transmissibility ?? 1,
    onChange: value => {
      const next = faults.map(f => ({
        ...f
      }));
      next[index].transmissibility = value;
      setFaults(next);
    }
  }), !fault.isSealed && /*#__PURE__*/React.createElement(ParameterField, {
    label: "Leakage rate",
    unit: "scaled",
    min: 0.01,
    max: 0.4,
    step: 0.02,
    value: fault.leakRate,
    onChange: value => {
      const next = faults.map(f => ({
        ...f
      }));
      next[index].leakRate = value;
      setFaults(next);
    }
  })))), !isMapView && /*#__PURE__*/React.createElement("section", {
    className: "ve-input-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ve-toggle-heading"
  }, /*#__PURE__*/React.createElement("h3", null, "Capillary behavior"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: hasCapillaryFringe,
    onChange: event => setHasCapillaryFringe(event.target.checked)
  }), " Enable fringe")), hasCapillaryFringe && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ParameterField, {
    label: "Fringe height (h_c)",
    unit: "m",
    min: 0.1,
    max: 3,
    step: 0.1,
    value: fringeScale,
    onChange: setFringeScale
  }), /*#__PURE__*/React.createElement(ParameterField, {
    label: "Entry-pressure scale",
    unit: "kPa",
    min: 5,
    max: 40,
    step: 1,
    value: entryPressure,
    onChange: setEntryPressure
  }))), /*#__PURE__*/React.createElement("section", {
    className: "ve-input-group"
  }, /*#__PURE__*/React.createElement("h3", null, "Grid detail"), /*#__PURE__*/React.createElement("div", null, !isMapView && /*#__PURE__*/React.createElement(ParameterField, {
    label: "Grid cells (N)",
    unit: "cells",
    min: 50,
    max: 300,
    step: 10,
    value: cellCount,
    onChange: setCellCount
  }), isMapView && /*#__PURE__*/React.createElement(ParameterField, {
    label: "Well Y location",
    unit: "%",
    min: 10,
    max: 90,
    step: 5,
    value: wellY,
    onChange: setWellY
  }), isMapView && /*#__PURE__*/React.createElement(ParameterField, {
    label: "2D grid resolution",
    unit: "columns",
    min: 24,
    max: 128,
    step: 8,
    value: mapCols,
    onChange: setMapCols
  }), isMapView && /*#__PURE__*/React.createElement(ParameterField, {
    label: "Terrain seed",
    unit: "",
    min: 0,
    max: 999999,
    step: 1,
    value: terrainSeed,
    onChange: setTerrainSeed
  })))), /*#__PURE__*/React.createElement(VisualizationWorkspace, null, /*#__PURE__*/React.createElement("div", {
    className: "sim-reservoir-card",
    style: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(100,255,218,0.18)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 450,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-tab-header",
    style: {
      padding: '0 10px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.15)',
      minHeight: '48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    },
    role: "tablist",
    "aria-label": "Simulator views",
    onKeyDown: handleTabKeys
  }, activeSubTab === 'profile' ? /*#__PURE__*/React.createElement("button", {
    ref: el => {
      tabRefs.current.profile = el;
    },
    onClick: () => setActiveSubTab('profile'),
    role: "tab",
    id: "tab-profile",
    "aria-selected": activeSubTab === 'profile',
    "aria-controls": "tabpanel-profile",
    tabIndex: activeSubTab === 'profile' ? 0 : -1,
    style: {
      background: 'rgba(100, 255, 218, 0.08)',
      border: 'none',
      borderBottom: '2px solid #64ffda',
      color: '#64ffda',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-project-diagram",
    style: {
      marginRight: 6
    }
  }), " 1D Cross-section") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    ref: el => {
      tabRefs.current.map = el;
    },
    onClick: () => setActiveSubTab('map'),
    role: "tab",
    id: "tab-map",
    "aria-selected": activeSubTab === 'map',
    "aria-controls": "tabpanel-map",
    tabIndex: activeSubTab === 'map' ? 0 : -1,
    style: {
      background: activeSubTab === 'map' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'map' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'map' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map",
    style: {
      marginRight: 6
    }
  }), " 2D Map"), /*#__PURE__*/React.createElement("button", {
    ref: el => {
      tabRefs.current.topography = el;
    },
    onClick: () => setActiveSubTab('topography'),
    role: "tab",
    id: "tab-topography",
    "aria-selected": activeSubTab === 'topography',
    "aria-controls": "tabpanel-topography",
    tabIndex: activeSubTab === 'topography' ? 0 : -1,
    style: {
      background: activeSubTab === 'topography' ? 'rgba(100, 255, 218, 0.08)' : 'none',
      border: 'none',
      borderBottom: activeSubTab === 'topography' ? '2px solid #64ffda' : '2px solid transparent',
      color: activeSubTab === 'topography' ? '#64ffda' : 'rgba(255,255,255,0.6)',
      padding: '12px 16px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'background-color 140ms ease, border-color 140ms ease, color 140ms ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-cube",
    style: {
      marginRight: 6
    }
  }), " 3D Topography"))), /*#__PURE__*/React.createElement("div", {
    className: "sim-tab-status",
    style: {
      paddingRight: 8
    }
  }, activeSubTab === 'profile' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Year ", simTime, " / 1000") : activeSubTab === 'map' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "x\u2013y plume-height model") : activeSubTab === 'topography' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "interactive grid topography") : activeSubTab === 'uq' ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Monte Carlo Analysis") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'rgba(255,255,255,0.5)'
    }
  }, "Methodology Guide"))), (() => {
    if (activeSubTab === 'profile') {
      return /*#__PURE__*/React.createElement("div", {
        id: "tabpanel-profile",
        role: "tabpanel",
        "aria-labelledby": "tab-profile",
        style: {
          flex: 1,
          position: 'relative',
          display: 'flex',
          background: '#1c1626'
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "sim-hud-legend",
        style: {
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '5px 12px',
          fontSize: 10,
          color: 'rgba(255,255,255,0.85)',
          zIndex: 5,
          pointerEvents: 'none'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#f59e0b'
        }
      }), " Mobile CO\u2082 (S_g \u2192 0.90)"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#b45309',
          border: '1px solid #7c2d12'
        }
      }), " Trapped Gas (S_gr \u2248 0.25)"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 14,
          height: 0,
          borderTop: '2px dashed #64ffda'
        }
      }), " Max Envelope (h_max)"), hasCapillaryFringe && /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #20c997, #1a8e8f, #0a2a4d)',
          border: '1px solid #20c997'
        }
      }), " Capillary Fringe"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: '#0a2a4d'
        }
      }), " Brine (S_w = 1.0)")), /*#__PURE__*/React.createElement("svg", {
        ref: reservoirSvgRef,
        role: "img",
        "aria-labelledby": "reservoir-title reservoir-desc",
        viewBox: "0 0 1000 450",
        preserveAspectRatio: "none",
        style: {
          width: '100%',
          height: '100%',
          pointerEvents: 'auto'
        }
      }, /*#__PURE__*/React.createElement("title", {
        id: "reservoir-title"
      }, "CO\u2082 plume migration cross-section at year ", simTime), /*#__PURE__*/React.createElement("desc", {
        id: "reservoir-desc"
      }, "Educational reservoir cross-section showing caprock, brine, mobile and trapped CO\u2082, injection well, and ", faultCount, " active faults."), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
        id: "caprock-clipper"
      }, /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${reservoirBlocks[0] ? reservoirBlocks[0].yt1 : capRockY(0)} ` + reservoirBlocks.map(b => `L ${b.x2} ${b.yt2}`).join(" ") + ` L 1000 ${stratumY(1000, cellCount - 1, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${stratumY(x, Math.max(0, k - 1), 175)}`;
        }).join(" ") + ` Z`
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "plume-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#f59e0b",
        stopOpacity: "0.95"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "40%",
        stopColor: "#f97316",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#c2410c",
        stopOpacity: "0.75"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "trapped-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#9a4b2d",
        stopOpacity: "0.90"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#2f1c18",
        stopOpacity: "0.70"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "active-mobile-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#f59e0b",
        stopOpacity: "0.98"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "45%",
        stopColor: "#f59e0b",
        stopOpacity: "0.95"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "70%",
        stopColor: "#f97316",
        stopOpacity: "0.92"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "88%",
        stopColor: "#ea580c",
        stopOpacity: "0.90"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#9a3412",
        stopOpacity: "0.85"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "residual-trapped-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#9a4b2d",
        stopOpacity: "0.90"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "45%",
        stopColor: "#7a3824",
        stopOpacity: "0.82"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "78%",
        stopColor: "#55291d",
        stopOpacity: "0.72"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#2f1c18",
        stopOpacity: "0.55"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "fringe-sim-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#20c997",
        stopOpacity: "0.80"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "50%",
        stopColor: "#1a8e8f",
        stopOpacity: "0.60"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "85%",
        stopColor: "#125672",
        stopOpacity: "0.35"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.10"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "brine-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0a2a4d",
        stopOpacity: "0.85"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#051426",
        stopOpacity: "0.95"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "well-gradient",
        x1: "0",
        y1: "0",
        x2: "1",
        y2: "0"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#475569"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "30%",
        stopColor: "#cbd5e1"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "70%",
        stopColor: "#94a3b8"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#334155"
      })), /*#__PURE__*/React.createElement("linearGradient", {
        id: "wellhead-grad",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#64ffda"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#05e67c"
      })), /*#__PURE__*/React.createElement("radialGradient", {
        id: "inj-flare-glow",
        cx: "50%",
        cy: "50%",
        r: "50%"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#0dfca2",
        stopOpacity: "0.9"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "45%",
        stopColor: "#05e67c",
        stopOpacity: "0.5"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#0dfca2",
        stopOpacity: "0"
      }))), /*#__PURE__*/React.createElement("path", {
        d: `M 0 0 L 1000 0 L 1000 ${capRockY(1000, cellCount - 1)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${capRockY(x, Math.max(0, k - 1))}`;
        }).join(" ") + ` Z`,
        fill: "#282030",
        stroke: "rgba(255,255,255,0.02)"
      }), reservoirBlocks.map((b, idx) => /*#__PURE__*/React.createElement("polygon", {
        key: idx,
        points: b.points,
        fill: b.fill,
        stroke: "rgba(0,0,0,0.06)",
        strokeWidth: "0.5"
      })), /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${reservoirBlocks[0] ? reservoirBlocks[0].yt1 : capRockY(0)} ` + reservoirBlocks.map(b => `L ${b.x2} ${b.yt2}`).join(" ") + ` L 1000 ${stratumY(1000, cellCount - 1, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const k = cellCount - idx;
          const x = k * dx;
          return `L ${x} ${stratumY(x, Math.max(0, k - 1), 175)}`;
        }).join(" ") + ` Z`,
        fill: "url(#brine-grad)",
        opacity: "0.88"
      }), (() => {
        const cellInjIdx = Math.floor(injLocation / 100.0 * cellCount);
        const b = reservoirBlocks[cellInjIdx];
        if (!b) return null;
        return /*#__PURE__*/React.createElement("rect", {
          x: b.x1 + dx / 2.0 - 2,
          y: b.yt1,
          width: "4",
          height: b.yb1 - b.yt1,
          fill: "rgba(255,255,255,0.2)"
        });
      })(), /*#__PURE__*/React.createElement("g", {
        clipPath: "url(#caprock-clipper)"
      }, plumePaths.swept && /*#__PURE__*/React.createElement("path", {
        d: plumePaths.swept,
        fill: "url(#residual-trapped-sim-grad)",
        opacity: "0.92"
      }), plumePaths.mobile && /*#__PURE__*/React.createElement("path", {
        d: plumePaths.mobile,
        fill: "url(#active-mobile-sim-grad)",
        opacity: "0.98"
      }), plumePaths.maxEnv && /*#__PURE__*/React.createElement("path", {
        d: plumePaths.maxEnv,
        fill: "none",
        stroke: "#64ffda",
        strokeWidth: "1.4",
        strokeDasharray: "5 3.5",
        opacity: "0.85"
      })), /*#__PURE__*/React.createElement("path", {
        d: `M 0 ${stratumY(0, 0, 175)} ` + Array.from({
          length: cellCount + 1
        }, (_, idx) => {
          const x = idx * dx;
          return `L ${x} ${stratumY(x, Math.min(cellCount - 1, idx), 175)}`;
        }).join(" "),
        stroke: "rgba(0,0,0,0.3)",
        strokeWidth: "1",
        fill: "none"
      }), (() => {
        const cellInjIdx = Math.floor(injLocation / 100.0 * cellCount);
        const xWell = cellInjIdx * dx + dx / 2.0;
        const yCap = capRockY(xWell);
        const yBase = stratumY(xWell, cellInjIdx, 175);
        const perfTop = yCap + 20;
        const perfBottom = Math.min(yBase - 15, yCap + 95);
        const isInjecting = Q > 0 && isPlaying && simTime <= injDuration;
        return /*#__PURE__*/React.createElement("g", {
          className: "sim-wellbore",
          role: "group",
          "aria-label": `Injection well at ${injLocation}%`
        }, /*#__PURE__*/React.createElement("rect", {
          x: xWell - 7,
          y: "0",
          width: "14",
          height: "12",
          rx: "2",
          fill: "url(#wellhead-grad)",
          stroke: "#fff",
          strokeWidth: "0.8"
        }), /*#__PURE__*/React.createElement("line", {
          x1: xWell - 11,
          y1: "6",
          x2: xWell + 11,
          y2: "6",
          stroke: "#64ffda",
          strokeWidth: "2.5",
          strokeLinecap: "round"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: xWell,
          cy: "6",
          r: "2.5",
          fill: "#fff"
        }), /*#__PURE__*/React.createElement("line", {
          x1: xWell,
          y1: "12",
          x2: xWell,
          y2: perfBottom,
          stroke: "rgba(0,0,0,0.4)",
          strokeWidth: "6"
        }), /*#__PURE__*/React.createElement("line", {
          x1: xWell,
          y1: "12",
          x2: xWell,
          y2: perfBottom,
          stroke: "url(#well-gradient)",
          strokeWidth: "3.5",
          strokeLinecap: "round"
        }), Array.from({
          length: 6
        }).map((_, pIdx) => {
          const py = perfTop + pIdx * ((perfBottom - perfTop) / 5);
          return /*#__PURE__*/React.createElement("line", {
            key: `perf-${pIdx}`,
            x1: xWell - 6,
            y1: py,
            x2: xWell + 6,
            y2: py,
            stroke: isInjecting ? '#0dfca2' : 'rgba(255,255,255,0.7)',
            strokeWidth: "1.6",
            strokeLinecap: "round"
          });
        }), isInjecting && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
          cx: xWell,
          cy: (perfTop + perfBottom) / 2,
          r: "22",
          fill: "url(#inj-flare-glow)"
        }), /*#__PURE__*/React.createElement("circle", {
          cx: xWell,
          cy: (perfTop + perfBottom) / 2,
          r: "5",
          fill: "#fff",
          opacity: "0.95"
        }), [0, 0.3, 0.6, 0.9].map((delay, idx) => /*#__PURE__*/React.createElement("circle", {
          key: idx,
          cx: xWell,
          cy: 12 + (yCap - 12) * (idx / 3.0),
          r: "2",
          fill: "#0dfca2",
          style: {
            animation: `streakRise 1.5s linear ${delay}s infinite`
          }
        }))));
      })(), Array.from({
        length: faultCount
      }).map((_, idx) => {
        const f = faults[idx];
        const inter = getSimFaultIntersection(f, idx);
        const color = f.isSealed ? '#64ffda' : '#ff6b6b';
        const yStart = 0;
        const yEnd = 450;
        const xStart = inter.x0 + inter.slope * yStart;
        const xEnd = inter.x0 + inter.slope * yEnd;
        return /*#__PURE__*/React.createElement("g", {
          key: idx
        }, /*#__PURE__*/React.createElement("line", {
          x1: xStart,
          y1: yStart,
          x2: xEnd,
          y2: yEnd,
          stroke: color,
          strokeWidth: "1.2",
          strokeDasharray: "3 3",
          opacity: "0.6"
        }));
      }), Array.from({
        length: faultCount
      }).map((_, idx) => {
        const f = faults[idx];
        if (f.isSealed) return null;
        const inter = getSimFaultIntersection(f, idx);
        const cellIdx = Math.round(cellCount * (inter.x / 1000.0));
        const boundedIdx = Math.max(0, Math.min(cellCount - 1, cellIdx));

        // Flow activates ONLY when total plume height exceeds spill threshold height
        if (h[boundedIdx] > f.thresholdHeight) {
          const travelY = -65; // Traverses through the overlying seal
          const travelX = inter.slope * travelY;
          const xTop = inter.x + travelX;
          const yTop = inter.y + travelY;
          return /*#__PURE__*/React.createElement("g", {
            key: `fl-group-${idx}`
          }, /*#__PURE__*/React.createElement("line", {
            x1: inter.x,
            y1: inter.y,
            x2: xTop,
            y2: yTop,
            stroke: "#ff6b6b",
            strokeWidth: "1.5",
            strokeDasharray: "4 3",
            opacity: "0.8",
            style: {
              animation: 'conduitFlow 1s linear infinite'
            }
          }), [0, 0.6, 1.2, 1.8].map((delay, i) => /*#__PURE__*/React.createElement("circle", {
            key: `fl-${idx}-${i}`,
            cx: inter.x,
            cy: inter.y,
            r: "1.6",
            fill: "#ff6b6b",
            style: {
              opacity: 0,
              '--travel-x': `${travelX}px`,
              '--travel-y': `${travelY}px`,
              animation: 'faultRiseTilted 2.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) ' + delay + 's infinite'
            }
          })));
        }
        return null;
      }), /*#__PURE__*/React.createElement("text", {
        x: "30",
        y: capRockY(30) - 10,
        fill: "rgba(255,255,255,0.4)",
        fontSize: "9",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "monospace"
      }, "Caprock Seal"), /*#__PURE__*/React.createElement("text", {
        x: "30",
        y: capRockY(30) + 80,
        fill: "rgba(255,255,255,0.4)",
        fontSize: "9",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: "monospace"
      }, "Sandstone Aquifer"), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
        id: "well-gradient",
        x1: "0",
        y1: "0",
        x2: "1",
        y2: "0"
      }, /*#__PURE__*/React.createElement("stop", {
        offset: "0%",
        stopColor: "#222"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "50%",
        stopColor: "#ccc"
      }), /*#__PURE__*/React.createElement("stop", {
        offset: "100%",
        stopColor: "#222"
      })))), /*#__PURE__*/React.createElement("div", {
        className: "ve-playback-bar",
        "aria-label": "Simulation playback"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: handlePlayReverseToggle,
        "aria-label": isReversing ? 'Pause reverse playback' : 'Play backward',
        style: {
          background: 'none',
          border: 'none',
          color: isReversing ? '#ff6b6b' : '#64ffda',
          cursor: 'pointer'
        },
        title: isReversing ? "Pause Reverse" : "Reverse Play"
      }, /*#__PURE__*/React.createElement("i", {
        className: `fas ${isReversing ? 'fa-pause' : 'fa-play fa-flip-horizontal'}`,
        style: {
          fontSize: 13
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: handlePlayToggle,
        "aria-label": isPlaying ? 'Pause simulation' : 'Play simulation forward',
        style: {
          background: 'none',
          border: 'none',
          color: isPlaying ? '#0dfca2' : '#64ffda',
          cursor: 'pointer'
        },
        title: isPlaying ? "Pause" : "Play Forward"
      }, /*#__PURE__*/React.createElement("i", {
        className: `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`,
        style: {
          fontSize: 13
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: stepBackward,
        "aria-label": "Step 1 year backward",
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer'
        },
        title: "Step 1 Year Backward"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-step-backward",
        style: {
          fontSize: 10
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: stepForward,
        "aria-label": "Step 1 year forward",
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer'
        },
        title: "Step 1 Year Forward"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-step-forward",
        style: {
          fontSize: 10
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: resetSimulation,
        "aria-label": "Reset simulation",
        style: {
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer'
        },
        title: "Reset Simulation"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-redo",
        style: {
          fontSize: 11
        }
      })), /*#__PURE__*/React.createElement("button", {
        onClick: () => setSidebarOpen(true),
        "aria-label": "Open simulation timeline"
      }, "Timeline"), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 14,
          background: 'rgba(255,255,255,0.2)'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.7)',
          minWidth: 50
        }
      }, "Yr ", simTime), /*#__PURE__*/React.createElement("input", {
        type: "range",
        min: "0",
        max: "1000",
        step: "1",
        value: simTime,
        "aria-label": "Seek simulation year",
        onChange: e => handleScrub(parseInt(e.target.value)),
        style: {
          flex: 1,
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          cursor: 'pointer',
          accentColor: '#64ffda'
        },
        title: "Drag to seek/reverse simulation time"
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1,
          height: 14,
          background: 'rgba(255,255,255,0.2)'
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1),
        style: {
          background: 'none',
          border: 'none',
          color: '#64ffda',
          cursor: 'pointer',
          fontSize: 10,
          fontWeight: 'bold'
        }
      }, speed, "x")));
    } else if (activeSubTab === 'map' || activeSubTab === 'topography') {
      return null;
    } else if (activeSubTab === 'uq') {
      return /*#__PURE__*/React.createElement("section", {
        className: "ve-risk-workspace",
        "aria-labelledby": "risk-title"
      }, /*#__PURE__*/React.createElement("header", {
        className: "ve-workspace-heading"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
        id: "risk-title"
      }, "Risk analysis \xB7 ", riskModel === 'map' ? '2D / 3D map' : '1D cross-section'), /*#__PURE__*/React.createElement("p", null, "Use the selected simulator path as the nominal case.")), /*#__PURE__*/React.createElement("button", {
        className: "ve-run-button",
        onClick: runMonteCarloBatch,
        disabled: uqRunning
      }, uqRunning ? `Running ${uqProgress}%` : 'Run uncertainty analysis')), /*#__PURE__*/React.createElement("div", {
        className: "ve-risk-layout"
      }, /*#__PURE__*/React.createElement("aside", {
        className: "ve-risk-config",
        "aria-label": "Uncertainty configuration"
      }, /*#__PURE__*/React.createElement("div", {
        className: "ve-risk-model-picker",
        role: "group",
        "aria-label": "Risk analysis model"
      }, /*#__PURE__*/React.createElement("span", null, "Run risk on"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-pressed": riskModel === 'map',
        disabled: uqRunning,
        onClick: () => {
          setRiskModel('map');
          setMcResults(null);
        }
      }, "2D / 3D map"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        "aria-pressed": riskModel === 'profile',
        disabled: uqRunning,
        onClick: () => {
          setRiskModel('profile');
          setMcResults(null);
        }
      }, "1D cross-section")), /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-parameters",
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }
      }, "Uncertainty Parameters"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          color: 'rgba(255,255,255,0.3)',
          marginTop: -6
        }
      }, "Select parameters, then pick an absolute range, a \xB1% band, or discrete values."), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 10,
          maxHeight: 380,
          overflowY: 'auto',
          paddingRight: 4
        }
      }, UQ_PARAM_DEFS.filter(def => !(def.group === 'fault' && faultCount === 0)).filter(def => !(def.key === 'faultLeakRate' && !faults.slice(0, faultCount).some(f => !f.isSealed))).map(def => /*#__PURE__*/React.createElement(UQParamConfig, {
        key: def.key,
        def: def,
        cfg: uqParams[def.key],
        onChange: patch => updateUqParam(def.key, patch)
      })))), /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-settings",
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }
      }, "Simulation Settings"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          color: 'rgba(255,255,255,0.7)'
        }
      }, "Run count"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 4,
          marginTop: 2
        }
      }, [25, 50, 100].map(cnt => /*#__PURE__*/React.createElement("button", {
        key: cnt,
        onClick: () => setMcRunsCount(cnt),
        "aria-pressed": mcRunsCount === cnt,
        style: {
          background: mcRunsCount === cnt ? 'rgba(100,255,218,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${mcRunsCount === cnt ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
          color: mcRunsCount === cnt ? '#64ffda' : 'azure',
          padding: '5px 12px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 'bold',
          cursor: 'pointer'
        }
      }, cnt, " runs")))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          color: 'rgba(255,255,255,0.7)'
        }
      }, "Target metric"), /*#__PURE__*/React.createElement("select", {
        value: uqTargetMetric,
        onChange: e => setUqTargetMetric(e.target.value),
        "aria-label": "Target metric",
        style: {
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff',
          padding: '7px 10px',
          borderRadius: 8,
          fontSize: 11,
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("option", {
        value: "leaked"
      }, "Leaked mass (kt)"), /*#__PURE__*/React.createElement("option", {
        value: "trapped"
      }, "Trapping efficiency"))))), /*#__PURE__*/React.createElement("div", {
        className: "ve-risk-results"
      }, uqRunning && /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-progress"
      }, /*#__PURE__*/React.createElement("span", null, "Running batch"), /*#__PURE__*/React.createElement("span", null, uqProgress, "%"), /*#__PURE__*/React.createElement("progress", {
        className: "ve-uq-progress-meter",
        value: uqProgress,
        max: "100",
        "aria-label": "Uncertainty analysis progress"
      })), uqData ? /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-results-content",
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 15
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "uq-results-grid",
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 15
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "ve-chart-title",
        style: {
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }
      }, "Uncertainty Distribution (", uqTargetMetric === 'leaked' ? 'CO₂ Leaked Mass' : 'Trapping Efficiency', ")"), renderUQHistogram(uqData)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "ve-chart-title",
        style: {
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }
      }, "Parameter Correlation Coefficients (Pearson r)"), sensitivityData && sensitivityData.length > 0 ? renderUQSensitivity(sensitivityData) : /*#__PURE__*/React.createElement("div", {
        style: {
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.18)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          fontSize: 10.5,
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          padding: 16
        }
      }, "No parameters were varied in this batch.", /*#__PURE__*/React.createElement("br", null), "Enable at least one uncertainty parameter and re-run."))), /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-percentiles",
        style: {
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 14,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10.5,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }
      }, "P10 / P50 / P90 Outcomes"), /*#__PURE__*/React.createElement("div", {
        className: "uq-percentile-grid",
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-percentile-label",
        style: {
          fontSize: 9.5,
          fontWeight: 'bold'
        }
      }, "P10 \xB7 ", uqTargetMetric === 'leaked' ? 'optimistic' : 'conservative'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          marginTop: 2
        }
      }, uqData.p10Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
        className: "ve-uq-realization",
        onClick: () => loadUQRealization(uqData.p10Realization)
      }, "Load realization")), /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-percentile-label",
        style: {
          fontSize: 9.5,
          fontWeight: 'bold'
        }
      }, "P50 \xB7 median"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          marginTop: 2
        }
      }, uqData.p50Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
        className: "ve-uq-realization",
        onClick: () => loadUQRealization(uqData.p50Realization)
      }, "Load realization")), /*#__PURE__*/React.createElement("div", {
        style: {
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-percentile-label",
        style: {
          fontSize: 9.5,
          fontWeight: 'bold'
        }
      }, "P90 \xB7 ", uqTargetMetric === 'leaked' ? 'conservative' : 'optimistic'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          marginTop: 2
        }
      }, uqData.p90Val.toFixed(1), uqTargetMetric === 'leaked' ? ' kt' : '%')), /*#__PURE__*/React.createElement("button", {
        className: "ve-uq-realization",
        onClick: () => loadUQRealization(uqData.p90Realization)
      }, "Load realization"))))) : /*#__PURE__*/React.createElement("div", {
        className: "ve-uq-empty",
        style: {
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
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-calculator",
        style: {
          fontSize: 36,
          color: 'rgba(255,255,255,0.15)',
          marginBottom: 15
        }
      }), /*#__PURE__*/React.createElement("h4", {
        style: {
          margin: 0,
          fontSize: 13.5,
          color: 'rgba(255,255,255,0.8)'
        }
      }, "No results yet"), /*#__PURE__*/React.createElement("p", {
        style: {
          margin: '6px 0 0',
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.45)',
          maxWidth: 380
        }
      }, "Select which parameters to vary, define each range or set of values, then run the batch simulator to generate risk distributions and sensitivity analyses.")))));
    } else {
      return /*#__PURE__*/React.createElement("section", {
        className: "ve-methodology-workspace",
        "aria-labelledby": "methodology-title"
      }, /*#__PURE__*/React.createElement("header", {
        className: "ve-workspace-heading"
      }, /*#__PURE__*/React.createElement("h1", {
        id: "methodology-title"
      }, "Methodology")), /*#__PURE__*/React.createElement(GuidePage, {
        isEmbedded: true
      }));
    }
  })(), /*#__PURE__*/React.createElement("div", {
    className: "ve-map-workspace",
    hidden: activeSubTab !== 'map' && activeSubTab !== 'topography'
  }, /*#__PURE__*/React.createElement("div", {
    hidden: activeSubTab !== 'map'
  }, /*#__PURE__*/React.createElement(Ve2DMapPanel, _extends({
    K: K,
    porosity: porosity,
    residualTrapFraction: residualTrapFraction,
    dipPercent: dipPercent,
    amplitude: amplitude,
    frequency: frequency,
    faultOffset: faultOffset,
    terrainSeed: terrainSeed,
    heterogeneity: heterogeneity,
    Q: Q,
    injLocation: injLocation,
    injDuration: injDuration,
    faultCount: faultCount,
    faults: faults,
    mapCols: mapCols,
    wellY: wellY
  }, mapParams, {
    preset: mapParams.selectedPreset,
    command: mapCommand,
    onCommandConsumed: consumeMapCommandOnce,
    onRun: runActiveSimulation,
    onReset: resetActiveSimulation,
    onSnapshot: setMapSnapshot
  })))), /*#__PURE__*/React.createElement("div", {
    id: "tabpanel-topography",
    role: "tabpanel",
    "aria-labelledby": "tab-topography",
    hidden: activeSubTab !== 'topography'
  }, /*#__PURE__*/React.createElement(Ve3DTopographyPanel, {
    mapSnapshot: mapSnapshot,
    mapCols: mapParams.mapCols,
    mapRows: Math.max(12, Math.round(mapParams.mapCols * 0.6)),
    faultCount: mapParams.faultCount,
    faults: mapParams.faults,
    injLocation: mapParams.injLocation,
    wellY: mapParams.wellY,
    onMapCommand: sendMapCommand
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '-8px 6px 0',
      fontSize: 10.5,
      lineHeight: 1.5,
      color: 'rgba(255,255,255,0.45)'
    }
  }, "Educational ", isMapView ? 'x–y plan-view' : 'cross-section', " Vertical-Equilibrium model \xB7 scaled units (1 kt = one model mass unit) \xB7 buoyancy-driven, viscosity-free gravity tongue with simplified faults. The Methodology tab separates reference theory from the implemented scheme.")), (activeSubTab === 'profile' || isMapView) && /*#__PURE__*/React.createElement(OutcomeRail, {
    "data-mobile-open": presentedPanel === 'outcomes',
    inert: presentedPanel === 'inputs' ? '' : undefined,
    closeRef: element => {
      mobileCloseRefs.current.outcomes = element;
    },
    onClose: dismissMobilePanel
  }, /*#__PURE__*/React.createElement("div", {
    className: "ve-outcome-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ve-rail-heading"
  }, /*#__PURE__*/React.createElement("h2", null, "Live outcome"), /*#__PURE__*/React.createElement("span", null, "Year ", activeTime)), /*#__PURE__*/React.createElement("dl", {
    className: "ve-metric-list"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Injected"), /*#__PURE__*/React.createElement("dd", null, formatMass(activeMasses.injected))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Mobile"), /*#__PURE__*/React.createElement("dd", null, formatMass(activeMasses.mobile))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Residually trapped"), /*#__PURE__*/React.createElement("dd", null, formatMass(activeMasses.trapped))), /*#__PURE__*/React.createElement("div", {
    className: activeMasses.leaked > 0 ? 'is-danger' : ''
  }, /*#__PURE__*/React.createElement("dt", null, "Leaked"), /*#__PURE__*/React.createElement("dd", null, formatMass(activeMasses.leaked)))), renderSVGChart(activeMasses, activeMassHistory, activeTime), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    }
  }, "Storage Efficiency"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Structural Trapping (Mobile)",
    pct: activeMasses.injected > 0 ? activeMasses.mobile / activeMasses.injected * 100 : 0,
    color: "#64ffda"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Residual Capillary Trapping",
    pct: activeMasses.injected > 0 ? activeMasses.trapped / activeMasses.injected * 100 : 0,
    color: "#3ca68e"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Cumulative Leaked Fraction",
    pct: activeMasses.injected > 0 ? activeMasses.leaked / activeMasses.injected * 100 : 0,
    color: "#ff6b6b"
  })))))));
};
const InputRail = ({
  children,
  closeRef,
  onClose,
  ...props
}) => /*#__PURE__*/React.createElement("aside", _extends({}, props, {
  id: "ve-input-rail",
  className: "ve-input-rail",
  "aria-label": "Scenario inputs"
}), /*#__PURE__*/React.createElement("button", {
  type: "button",
  className: "ve-mobile-panel-close",
  ref: closeRef,
  onClick: onClose,
  "aria-label": "Close inputs panel"
}, /*#__PURE__*/React.createElement("i", {
  className: "fas fa-times",
  "aria-hidden": "true"
})), children);
const VisualizationWorkspace = ({
  children
}) => /*#__PURE__*/React.createElement("section", {
  className: "ve-visualization-workspace",
  "aria-label": "Reservoir visualization"
}, children);
const OutcomeRail = ({
  children,
  closeRef,
  onClose,
  ...props
}) => /*#__PURE__*/React.createElement("aside", _extends({}, props, {
  id: "ve-outcome-rail",
  className: "ve-outcome-rail",
  "aria-label": "Simulation outcomes"
}), /*#__PURE__*/React.createElement("button", {
  type: "button",
  className: "ve-mobile-panel-close",
  ref: closeRef,
  onClick: onClose,
  "aria-label": "Close outcomes panel"
}, /*#__PURE__*/React.createElement("i", {
  className: "fas fa-times",
  "aria-hidden": "true"
})), children);
const ParameterField = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  format = v => v,
  onChange
}) => {
  const [feedback, setFeedback] = useState('');
  const feedbackId = React.useId();
  const setValue = raw => {
    const result = normalizeParameterInput(raw, min, max);
    setFeedback(result.message);
    if (result.value === null) return;
    onChange(result.value);
  };
  return /*#__PURE__*/React.createElement("label", {
    className: "ve-parameter-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ve-parameter-heading"
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    className: "ve-parameter-value"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    "aria-describedby": feedback ? feedbackId : undefined,
    "aria-invalid": feedback ? 'true' : undefined,
    onChange: event => setValue(event.target.value)
  }), /*#__PURE__*/React.createElement("span", null, unit))), feedback && /*#__PURE__*/React.createElement("span", {
    id: feedbackId,
    className: "ve-parameter-feedback",
    role: "status"
  }, feedback), /*#__PURE__*/React.createElement("input", {
    type: "range",
    "aria-label": label,
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: event => setValue(event.target.value)
  }), /*#__PURE__*/React.createElement("span", {
    className: "sr-only"
  }, "Displayed value ", format(value), " ", unit));
};

// Stat numeric display helper component
const StatBox = ({
  label,
  value,
  color,
  opacity
}) => {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 10,
      padding: '8px 4px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.45)',
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 'bold',
      color: color,
      fontFamily: 'monospace',
      opacity: opacity
    }
  }, value));
};

// Storage Efficiency Progress Bar helper component
const ProgressBar = ({
  label,
  pct,
  color
}) => {
  // Cap at 100%
  const clampedPct = Math.max(0, Math.min(100, pct));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(255,255,255,0.7)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: color,
      fontWeight: 'bold'
    }
  }, Math.round(clampedPct), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${clampedPct}%`,
      height: '100%',
      background: color,
      borderRadius: 2
    }
  })));
};

// Bind to window object for Babel execution scope
Object.assign(window, {
  SimulatorPage
});


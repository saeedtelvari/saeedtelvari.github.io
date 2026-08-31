(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VE2D = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const createVe2dState = ({ cols = 48, rows = 30 } = {}) => {
    cols = clamp(Math.round(cols), 6, 120);
    rows = clamp(Math.round(rows), 6, 80);
    const size = cols * rows;
    return {
      cols,
      rows,
      h: new Array(size).fill(0),
      hMax: new Array(size).fill(0),
      masses: { injected: 0, trapped: 0, mobile: 0, leaked: 0 }
    };
  };

  const faultSide = (x, y, fault, width, height) => {
    const lineX = (fault.xPercent / 100) * width + (fault.dipSlope || 0) * (y - height / 2);
    return x - lineX;
  };

  const faceTransmissibility = (x1, y1, x2, y2, faults, width, height) => {
    let multiplier = 1;
    for (const fault of faults) {
      if (faultSide(x1, y1, fault, width, height) * faultSide(x2, y2, fault, width, height) <= 0) {
        multiplier = Math.min(multiplier, fault.isSealed ? 0 : clamp(fault.transmissibility ?? 1, 0, 1));
      }
    }
    return multiplier;
  };

  const topDepth = (x, y, params) => {
    const { width, height } = params;
    const xn = x / width - 0.5;
    const yn = y / height - 0.5;
    const dip = xn * (params.dipX || 0) * 4 + yn * (params.dipY || 0) * 4;
    const amplitude = (params.structureAmplitude || 0) / 15;
    const frequency = params.structureFrequency || 1;
    let depth = dip - amplitude * Math.cos(xn * Math.PI * 2 * frequency) * Math.cos(yn * Math.PI);
    for (let i = 0; i < params.faults.length; i++) {
      const fault = params.faults[i];
      if (faultSide(x, y, fault, width, height) > 0) {
        depth += (i % 2 === 0 ? 1 : -1) * (params.faultOffset || 0) * 0.8;
      }
    }
    return depth;
  };

  const partition = (height, maximum, residualFraction) => {
    const mobile = residualFraction < 1
      ? Math.max(0, (height - residualFraction * maximum) / (1 - residualFraction))
      : 0;
    const boundedMobile = Math.min(height, mobile);
    return { mobile: boundedMobile, trapped: Math.max(0, height - boundedMobile) };
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
      faults: [],
      ...inputParams
    };
    params.faults = (params.faults || []).filter(Boolean);
    params.porosity = clamp(params.porosity, 0.01, 0.8);
    params.residualTrapFraction = clamp(params.residualTrapFraction, 0, 0.95);

    const dx = params.width / cols;
    const dy = params.height / rows;
    const scaledArea = (dx / 5) * (dy / 5);
    const substeps = 6;
    const dt = 1 / substeps;
    const capacity = 12;
    const mobility = 0.12 * clamp(params.permeability / params.porosity, 0.05, 20);
    let h = state.h.slice();
    const hMax = state.hMax.slice();
    let injected = state.masses.injected;
    let leaked = state.masses.leaked;

    const coordinates = (index) => ({
      x: (index % cols + 0.5) * dx,
      y: (Math.floor(index / cols) + 0.5) * dy
    });

    for (let substep = 0; substep < substeps; substep++) {
      const mobile = h.map((value, index) => partition(value, hMax[index], params.residualTrapFraction).mobile);
      const delta = new Array(h.length).fill(0);

      const transfer = (from, to, distance) => {
        const a = coordinates(from);
        const b = coordinates(to);
        const trans = faceTransmissibility(a.x, a.y, b.x, b.y, params.faults, params.width, params.height);
        if (trans === 0) return;
        const potentialA = topDepth(a.x, a.y, params) + h[from];
        const potentialB = topDepth(b.x, b.y, params) + h[to];
        if (Math.abs(potentialA - potentialB) < 1e-12) return;
        const donor = potentialA > potentialB ? from : to;
        const receiver = donor === from ? to : from;
        const gradient = Math.abs(potentialA - potentialB) / Math.max(1, distance / 50);
        const amount = Math.min(
          mobile[donor] * 0.22,
          mobility * mobile[donor] * gradient * dt * trans
        );
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
        const wellCol = clamp(Math.floor((params.wellX / 100) * cols), 0, cols - 1);
        const wellRow = clamp(Math.floor((params.wellY / 100) * rows), 0, rows - 1);
        const cells = [];
        let weightSum = 0;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const col = wellCol + ox;
            const row = wellRow + oy;
            if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
            const weight = Math.exp(-(ox * ox + oy * oy));
            cells.push({ index: row * cols + col, weight });
            weightSum += weight;
          }
        }
        const injectedThisStep = params.injectionRate * dt;
        for (const cell of cells) {
          h[cell.index] += (injectedThisStep * cell.weight / weightSum) / (params.porosity * scaledArea);
        }
        injected += injectedThisStep;
      }

      for (let index = 0; index < h.length; index++) {
        const point = coordinates(index);
        for (const fault of params.faults) {
          if (fault.isSealed || !fault.leakRate) continue;
          const distance = Math.abs(faultSide(point.x, point.y, fault, params.width, params.height));
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

  return { createVe2dState, stepVe2d, topDepth, faceTransmissibility };
});

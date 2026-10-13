"use strict";
// Auto-generated bundle — Pre-compiled for instant execution
var { useState, useEffect, useMemo, useRef, useCallback } = React;

// File: ve2d-model.js
// ve2d-model.js — sharp-interface vertical-equilibrium (VE) model of CO2 storage in a
// confined saline aquifer. SI units internally; scenarios use display units
// (Mt, mD, m, km, degrees, years). Shared by the page, the worker and Node tests.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VE2D = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const YEAR = 365.25 * 86400;
  const MT = 1e9;
  const MD = 9.869233e-16;
  const BAR = 1e5;
  const KM = 1000;
  const GRAVITY = 9.81;
  const LX = 20 * KM;
  const LY = 12 * KM;
  const GRIDS = {
    coarse: [40, 24],
    standard: [80, 48],
    fine: [120, 72]
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // [min, max, step] in display units. The UI and the normaliser share these bounds.
  const LIMITS = Object.freeze({
    years: [100, 2000, 50],
    seed: [1, 999999, 1],
    rateMt: [0.1, 5, 0.1],
    injYears: [1, 100, 1],
    wellX: [0.5, 19.5, 0.1],
    wellY: [0.5, 11.5, 0.1],
    permMd: [10, 5000, 1],
    porosity: [0.05, 0.35, 0.01],
    thickness: [10, 200, 1],
    thicknessVar: [0, 60, 1],
    ct: [0.2, 5, 0.1],
    rhoCo2: [400, 900, 10],
    rhoBrine: [1000, 1200, 5],
    muCo2: [0.02, 0.1, 0.005],
    muBrine: [0.3, 1.5, 0.05],
    swr: [0.05, 0.4, 0.01],
    sgr: [0, 0.4, 0.01],
    krg: [0.1, 1, 0.05],
    disRate: [0, 2, 0.05],
    disCap: [0, 80, 1],
    depth: [800, 3000, 50],
    dipDeg: [0, 3, 0.1],
    dipAz: [0, 359, 1],
    domes: [0, 4, 1],
    domeRelief: [0, 150, 5],
    roughness: [0, 40, 1]
  });
  const FAULT_LIMITS = Object.freeze({
    x: [0, 20, 0.1],
    y: [0, 12, 0.1],
    strike: [0, 359, 1],
    length: [0.5, 30, 0.5],
    throw: [0, 150, 1],
    trans: [0, 1, 0.05],
    sealCap: [0, 200, 1],
    kf: [0, 1000, 1]
  });
  const INTEGER_KEYS = new Set(['years', 'seed', 'injYears', 'domes', 'dipAz']);
  const MAX_FAULTS = 3;
  const DEFAULT_FAULT = Object.freeze({
    x: 9.5,
    y: 6,
    strike: 12,
    length: 8,
    throw: 12,
    trans: 0.4,
    sealCap: 26,
    kf: 20
  });
  const DEFAULTS = Object.freeze({
    preset: 'dome-fault',
    grid: 'standard',
    boundary: 'open',
    years: 1000,
    seed: 1443,
    rateMt: 1,
    injYears: 30,
    wellX: 14,
    wellY: 6,
    permMd: 500,
    porosity: 0.2,
    thickness: 50,
    thicknessVar: 20,
    ct: 1,
    rhoCo2: 700,
    rhoBrine: 1050,
    muCo2: 0.055,
    muBrine: 0.6,
    swr: 0.27,
    sgr: 0.2,
    krg: 0.5,
    disRate: 0.2,
    disCap: 53,
    depth: 1500,
    dipDeg: 0.6,
    dipAz: 90,
    domes: 1,
    domeRelief: 60,
    roughness: 4,
    faults: Object.freeze([DEFAULT_FAULT])
  });
  const PRESETS = Object.freeze({
    'dome-fault': {
      label: 'Dome & leaky fault',
      description: 'CO₂ migrates up-dip past a partly sealing fault into a dome. Shows every trapping mechanism.',
      patch: {}
    },
    dipping: {
      label: 'Dipping aquifer',
      description: 'A plain 1° slope: the plume migrates up-dip, leaving a residual trail, and dissolves.',
      patch: {
        dipDeg: 1,
        domes: 0,
        roughness: 2,
        faults: []
      }
    },
    anticline: {
      label: 'Anticline trap',
      description: 'A large dome up-dip of the injector fills to its spill point and then spills.',
      patch: {
        dipDeg: 0.4,
        domes: 1,
        domeRelief: 40,
        roughness: 2,
        faults: []
      }
    },
    'sealed-block': {
      label: 'Sealed fault block',
      description: 'Two sealing faults and closed boundaries: CO₂ is contained, pressure builds up.',
      patch: {
        boundary: 'closed',
        dipDeg: 0.4,
        domes: 0,
        roughness: 3,
        injYears: 20,
        faults: [{
          x: 8,
          y: 6,
          strike: 5,
          length: 14,
          throw: 40,
          trans: 0,
          sealCap: 200,
          kf: 0
        }, {
          x: 16.5,
          y: 6,
          strike: 170,
          length: 14,
          throw: 30,
          trans: 0,
          sealCap: 200,
          kf: 0
        }]
      }
    },
    rough: {
      label: 'Rough top surface',
      description: 'Small undulations in the caprock create many small structural traps.',
      patch: {
        dipDeg: 0.5,
        domes: 0,
        roughness: 10,
        faults: []
      }
    }
  });
  const normalizeFault = raw => {
    const fault = {};
    for (const [key, [min, max]] of Object.entries(FAULT_LIMITS)) {
      const value = Number(raw?.[key]);
      fault[key] = Number.isFinite(value) ? clamp(value, min, max) : DEFAULT_FAULT[key];
    }
    return fault;
  };
  const normalizeScenario = (raw = {}) => {
    const scenario = {
      preset: typeof raw.preset === 'string' ? raw.preset : DEFAULTS.preset,
      grid: Object.prototype.hasOwnProperty.call(GRIDS, raw.grid) ? raw.grid : DEFAULTS.grid,
      boundary: raw.boundary === 'closed' || raw.boundary === 'open' ? raw.boundary : DEFAULTS.boundary
    };
    for (const [key, [min, max]] of Object.entries(LIMITS)) {
      const value = Number(raw[key]);
      const bounded = Number.isFinite(value) && raw[key] !== '' && raw[key] !== null ? clamp(value, min, max) : DEFAULTS[key];
      // The simulated period snaps to its step so every run ends on a snapshot year.
      scenario[key] = key === 'years' ? Math.round(bounded / 50) * 50 : INTEGER_KEYS.has(key) ? Math.round(bounded) : bounded;
    }
    const faults = Array.isArray(raw.faults) ? raw.faults : DEFAULTS.faults;
    scenario.faults = faults.slice(0, MAX_FAULTS).map(normalizeFault);
    return scenario;
  };

  // ------------------------------------------------------------------ geometry

  const hashNoise = (x, y, seed) => {
    const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return value - Math.floor(value);
  };

  // Map angle (from +x, anticlockwise) of the regional strike, at right angles to the dip
  // direction. Domes and caprock undulations are elongated along it.
  const strikeAngle = scenario => Math.PI - scenario.dipAz * Math.PI / 180;

  // Gaussian domes elongated along strike (±15°). The first is the main closure; any others
  // are smaller satellites.
  const domeCentres = scenario => Array.from({
    length: scenario.domes
  }, (_, index) => {
    const hash = (a, b, salt) => hashNoise(index * a, b, scenario.seed + salt);
    const main = index === 0;
    return {
      x: (0.12 + 0.76 * hash(2.1, 0.4, 503)) * LX,
      y: (0.15 + 0.7 * hash(2.9, 0.8, 547)) * LY,
      angle: strikeAngle(scenario) + (hash(3.7, 1.2, 571) - 0.5) * Math.PI / 6,
      along: 2400 * (main ? 0.85 + 0.45 * hash(4.3, 1.6, 593) : 0.55 + 0.35 * hash(4.3, 1.6, 593)),
      across: 1600 * (main ? 0.7 + 0.3 * hash(5.1, 2.0, 613) : 0.45 + 0.2 * hash(5.1, 2.0, 613)),
      relief: main ? 1 : 0.35 + 0.45 * hash(5.9, 2.4, 631)
    };
  });

  // Smooth Gaussian random fields with a self-affine spectrum, stretched along strike: a
  // sum of random Fourier modes, one per equal step in log wavenumber (amplitude k^-H),
  // scaled to unit variance.
  const spectralModes = (seed, spec, angle) => {
    const rng = mulberry32(seed);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const modes = new Float64Array(4 * spec.modes);
    let variance = 0;
    for (let m = 0; m < spec.modes; m++) {
      const k = 2 * Math.PI / (spec.longest * (spec.shortest / spec.longest) ** ((m + rng()) / spec.modes));
      const direction = 2 * Math.PI * rng();
      const along = k * Math.cos(direction) / spec.stretch;
      const across = k * Math.sin(direction);
      modes.set([along * cos - across * sin, along * sin + across * cos, 2 * Math.PI * rng(), k ** -spec.hurst], 4 * m);
      variance += k ** (-2 * spec.hurst) / 2;
    }
    for (let m = 3; m < modes.length; m += 4) modes[m] /= Math.sqrt(variance);
    return modes;
  };

  // Caprock roughness (Hurst exponent 0.8, wavelengths 8 km to 500 m, stretched 2.5 times
  // along strike); the roughness input is its RMS height in metres.
  const ROUGH = Object.freeze({
    modes: 48,
    longest: 8000,
    shortest: 500,
    hurst: 0.8,
    stretch: 2.5
  });
  const roughModes = scenario => spectralModes(scenario.seed + 7919, ROUGH, strikeAngle(scenario));

  // Aquifer thickness: the mean times a log-normal factor exp(sG - s^2/2) of a smoother
  // field (Hurst 0.9, wavelengths 12 km to 1.5 km, sand belts stretched twice along
  // strike), so the mean is kept, thickness stays positive and s is about its spread.
  const THICK = Object.freeze({
    modes: 32,
    longest: 12000,
    shortest: 1500,
    hurst: 0.9,
    stretch: 2
  });
  const thickModes = scenario => spectralModes(scenario.seed + 104729, THICK, strikeAngle(scenario));
  const roughnessAt = (modes, x, y) => {
    let value = 0;
    for (let m = 0; m < modes.length; m += 4) value += modes[m + 3] * Math.cos(modes[m] * x + modes[m + 1] * y + modes[m + 2]);
    return value;
  };
  const faultFrame = fault => {
    const strike = fault.strike * Math.PI / 180;
    const along = [Math.sin(strike), Math.cos(strike)];
    return {
      cx: fault.x * KM,
      cy: fault.y * KM,
      half: fault.length * KM / 2,
      along,
      normal: [along[1], -along[0]]
    };
  };

  // Normal-fault displacement. The throw is parabolic along strike (zero at the tips). The
  // hanging wall, to the right of the strike direction (right-hand rule), drops by 70 % of
  // it and the footwall rises by 30 %; both decay away from the fault over a fifth of its
  // length, so each footwall crest is a closure against its fault.
  const FOOTWALL_SHARE = 0.3;
  const faultThrowAt = (fault, frame, x, y) => {
    const dx = x - frame.cx;
    const dy = y - frame.cy;
    const t = (dx * frame.along[0] + dy * frame.along[1]) / frame.half;
    if (Math.abs(t) >= 1) return 0;
    return fault.throw * (1 - t * t);
  };
  const faultOffset = (fault, frame, x, y) => {
    const side = (x - frame.cx) * frame.normal[0] + (y - frame.cy) * frame.normal[1];
    const offset = faultThrowAt(fault, frame, x, y) * Math.exp(-Math.abs(side) / (0.4 * frame.half));
    return side > 0 ? (1 - FOOTWALL_SHARE) * offset : -FOOTWALL_SHARE * offset;
  };
  const topDepth = (x, y, scenario, cache) => {
    const azimuth = scenario.dipAz * Math.PI / 180;
    const slope = Math.tan(scenario.dipDeg * Math.PI / 180);
    let depth = scenario.depth + slope * ((x - LX / 2) * Math.sin(azimuth) + (y - LY / 2) * Math.cos(azimuth));
    const domes = cache?.domes || domeCentres(scenario);
    for (const dome of domes) {
      const dx = x - dome.x;
      const dy = y - dome.y;
      const along = dx * Math.cos(dome.angle) + dy * Math.sin(dome.angle);
      const across = -dx * Math.sin(dome.angle) + dy * Math.cos(dome.angle);
      depth -= scenario.domeRelief * dome.relief * Math.exp(-0.5 * ((along / dome.along) ** 2 + (across / dome.across) ** 2));
    }
    if (scenario.roughness > 0) depth += scenario.roughness * roughnessAt(cache?.rough || roughModes(scenario), x, y);
    const frames = cache?.frames || scenario.faults.map(faultFrame);
    scenario.faults.forEach((fault, index) => {
      depth += faultOffset(fault, frames[index], x, y);
    });
    return depth;
  };
  const thicknessAt = (x, y, scenario, cache) => {
    const spread = scenario.thicknessVar / 100;
    if (!(spread > 0)) return scenario.thickness;
    return scenario.thickness * Math.exp(spread * roughnessAt(cache?.thick || thickModes(scenario), x, y) - spread * spread / 2);
  };
  const depthCache = scenario => ({
    domes: domeCentres(scenario),
    frames: scenario.faults.map(faultFrame),
    rough: roughModes(scenario),
    thick: thickModes(scenario)
  });

  // The top-surface depth of one (normalised) scenario as a function of x and y in metres,
  // with its domes, fault frames and roughness modes computed once.
  const depthField = scenario => {
    const cache = depthCache(scenario);
    return (x, y) => topDepth(x, y, scenario, cache);
  };

  // The aquifer thickness of one (normalised) scenario as a function of x and y in metres.
  const thicknessField = scenario => {
    const cache = depthCache(scenario);
    return (x, y) => thicknessAt(x, y, scenario, cache);
  };

  // Segment p–q against the fault trace; returns the along-strike parameter t in [-1, 1] or null.
  const traceCrossing = (frame, px, py, qx, qy) => {
    const ax = frame.cx - frame.along[0] * frame.half;
    const ay = frame.cy - frame.along[1] * frame.half;
    const bx = frame.cx + frame.along[0] * frame.half;
    const by = frame.cy + frame.along[1] * frame.half;
    const rx = qx - px;
    const ry = qy - py;
    const sx = bx - ax;
    const sy = by - ay;
    const denominator = rx * sy - ry * sx;
    if (Math.abs(denominator) < 1e-12) return null;
    const u = ((ax - px) * sy - (ay - py) * sx) / denominator;
    const v = ((ax - px) * ry - (ay - py) * rx) / denominator;
    if (u < 0 || u > 1 || v < 0 || v > 1) return null;
    return 2 * v - 1;
  };
  const buildModel = rawScenario => {
    const scenario = normalizeScenario(rawScenario);
    const [nx, ny] = GRIDS[scenario.grid];
    const n = nx * ny;
    const dx = LX / nx;
    const dy = LY / ny;
    const H = scenario.thickness;
    const p = {
      k: scenario.permMd * MD,
      phi: scenario.porosity,
      H,
      rhoG: scenario.rhoCo2,
      rhoW: scenario.rhoBrine,
      dRho: scenario.rhoBrine - scenario.rhoCo2,
      g: GRAVITY,
      muG: scenario.muCo2 * 1e-3,
      muW: scenario.muBrine * 1e-3,
      swr: scenario.swr,
      sgr: Math.min(scenario.sgr, 0.95 - scenario.swr),
      krg: scenario.krg,
      ct: scenario.ct * 1e-4 / BAR,
      rate: scenario.rateMt * MT / YEAR,
      injEnd: scenario.injYears * YEAR,
      tEnd: scenario.years * YEAR,
      disRate: scenario.disRate / YEAR,
      disCap: scenario.disCap,
      open: scenario.boundary === 'open'
    };
    const cache = depthCache(scenario);
    const depthAt = (x, y) => topDepth(x, y, scenario, cache);
    const xc = Float64Array.from({
      length: nx
    }, (_, i) => (i + 0.5) * dx);
    const yc = Float64Array.from({
      length: ny
    }, (_, j) => (j + 0.5) * dy);
    const zt = new Float64Array(n);
    const Hc = new Float64Array(n);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        zt[j * nx + i] = depthAt(xc[i], yc[j]);
        Hc[j * nx + i] = thicknessAt(xc[i], yc[j], scenario, cache);
      }
    }

    // Face multiplier: cross-fault transmissibility times the juxtaposed fraction of the
    // aquifer thickness at the face.
    const multiplier = (px, py, qx, qy) => {
      let value = 1;
      scenario.faults.forEach((fault, index) => {
        const t = traceCrossing(cache.frames[index], px, py, qx, qy);
        if (t === null) return;
        const localThrow = fault.throw * (1 - t * t);
        value = Math.min(value, fault.trans * Math.max(0, 1 - localThrow / thicknessAt((px + qx) / 2, (py + qy) / 2, scenario, cache)));
      });
      return value;
    };
    const tx = new Float64Array((nx + 1) * ny);
    const mx = new Float64Array((nx + 1) * ny);
    const ghostX = new Float64Array((nx + 1) * ny).fill(NaN);
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const boundary = f === 0 || f === nx;
        tx[index] = p.k * dy / (boundary ? dx / 2 : dx);
        mx[index] = boundary ? multiplier(f === 0 ? xc[0] : xc[nx - 1], yc[j], f * dx, yc[j]) : multiplier(xc[f - 1], yc[j], xc[f], yc[j]);
        if (boundary) ghostX[index] = depthAt(f * dx, yc[j]);
      }
    }
    const ty = new Float64Array(nx * (ny + 1));
    const my = new Float64Array(nx * (ny + 1));
    const ghostY = new Float64Array(nx * (ny + 1)).fill(NaN);
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        const boundary = f === 0 || f === ny;
        ty[index] = p.k * dx / (boundary ? dy / 2 : dy);
        my[index] = boundary ? multiplier(xc[i], f === 0 ? yc[0] : yc[ny - 1], xc[i], f * dy) : multiplier(xc[i], yc[f - 1], xc[i], yc[f]);
        if (boundary) ghostY[index] = depthAt(xc[i], f * dy);
      }
    }

    // Fault-zone leakage: trace length inside each cell, so the leak rate per metre of
    // fault does not depend on the grid.
    const leakCells = [];
    const faultLines = [];
    scenario.faults.forEach((fault, faultIndex) => {
      const frame = cache.frames[faultIndex];
      const x0 = frame.cx - frame.along[0] * frame.half;
      const y0 = frame.cy - frame.along[1] * frame.half;
      const x1 = frame.cx + frame.along[0] * frame.half;
      const y1 = frame.cy + frame.along[1] * frame.half;
      faultLines.push([x0, y0, x1, y1]);
      if (!(fault.kf > 0)) return;
      const samples = Math.max(1, Math.ceil(fault.length * KM / (Math.min(dx, dy) / 20)));
      const ds = fault.length * KM / samples;
      const lengths = new Map();
      for (let s = 0; s < samples; s++) {
        const w = (s + 0.5) / samples;
        const x = x0 + (x1 - x0) * w;
        const y = y0 + (y1 - y0) * w;
        if (x < 0 || x >= LX || y < 0 || y >= LY) continue;
        const cell = Math.floor(y / dy) * nx + Math.floor(x / dx);
        lengths.set(cell, (lengths.get(cell) || 0) + ds);
      }
      for (const [cell, length] of lengths) leakCells.push({
        cell,
        length,
        fault: faultIndex
      });
    });
    const well = clamp(Math.floor(scenario.wellY * KM / dy), 0, ny - 1) * nx + clamp(Math.floor(scenario.wellX * KM / dx), 0, nx - 1);
    const model = {
      scenario,
      nx,
      ny,
      n,
      dx,
      dy,
      Lx: LX,
      Ly: LY,
      area: dx * dy,
      H,
      Hc,
      p,
      xc,
      yc,
      zt,
      tx,
      ty,
      mx,
      my,
      ghostX,
      ghostY,
      leakCells,
      faultLines,
      well,
      depthAt,
      domes: cache.domes
    };
    model.traps = trapAnalysis(model);
    return model;
  };

  // Binary min-heap of (key, cell) pairs for the priority flood.
  const createHeap = capacity => {
    let size = 0;
    const keys = new Float64Array(capacity);
    const cells = new Int32Array(capacity);
    return {
      get size() {
        return size;
      },
      push(key, cell) {
        let i = size++;
        while (i > 0) {
          const parent = i - 1 >> 1;
          if (keys[parent] <= key) break;
          keys[i] = keys[parent];
          cells[i] = cells[parent];
          i = parent;
        }
        keys[i] = key;
        cells[i] = cell;
      },
      pop() {
        const top = cells[0];
        const key = keys[--size];
        const cell = cells[size];
        let i = 0;
        for (;;) {
          let child = 2 * i + 1;
          if (child >= size) break;
          if (child + 1 < size && keys[child + 1] < keys[child]) child++;
          if (keys[child] >= key) break;
          keys[i] = keys[child];
          cells[i] = cells[child];
          i = child;
        }
        keys[i] = key;
        cells[i] = cell;
        return top;
      }
    };
  };

  // Visit the four face neighbours of a cell that are connected through a passable face.
  const forEachNeighbour = (model, cell, visit) => {
    const {
      nx,
      ny,
      mx,
      my
    } = model;
    const i = cell % nx;
    const j = (cell - i) / nx;
    if (i > 0 && mx[j * (nx + 1) + i] > 0) visit(cell - 1);
    if (i < nx - 1 && mx[j * (nx + 1) + i + 1] > 0) visit(cell + 1);
    if (j > 0 && my[j * nx + i] > 0) visit(cell - nx);
    if (j < ny - 1 && my[(j + 1) * nx + i] > 0) visit(cell + nx);
  };
  const TRAP_COLUMN = 1e-3;

  // Spill-point analysis (priority flood, Barnes et al. 2014) on the caprock depth: CO2
  // rises to shallower depth, so domes are "pits" of depth. As in co2lab, the model edge
  // is always a spill path; compartments sealed off from the edge never spill.
  const trapAnalysis = model => {
    const {
      nx,
      ny,
      n,
      zt
    } = model;
    const zSpill = new Float64Array(n).fill(Infinity);
    const from = new Int32Array(n).fill(-1);
    const done = new Uint8Array(n);
    const heap = createHeap(5 * n + 8);
    for (let c = 0; c < n; c++) {
      const i = c % nx;
      const j = (c - i) / nx;
      if (i === 0 || j === 0 || i === nx - 1 || j === ny - 1) {
        zSpill[c] = zt[c];
        heap.push(zt[c], c);
      }
    }
    while (heap.size) {
      const c = heap.pop();
      if (done[c]) continue;
      done[c] = 1;
      forEachNeighbour(model, c, nb => {
        if (done[nb]) return;
        const level = Math.max(zt[nb], zSpill[c]);
        if (level < zSpill[nb]) {
          zSpill[nb] = level;
          from[nb] = c;
          heap.push(level, nb);
        }
      });
    }
    const trapId = new Int32Array(n).fill(-1);
    const traps = [];
    const capacityFactor = model.p.phi * (1 - model.p.swr) * model.area;
    for (let seed = 0; seed < n; seed++) {
      if (trapId[seed] !== -1 || !(zSpill[seed] - zt[seed] > TRAP_COLUMN)) continue;
      const id = traps.length;
      const cells = [];
      trapId[seed] = id;
      for (let q = [seed]; q.length;) {
        const c = q.pop();
        cells.push(c);
        forEachNeighbour(model, c, nb => {
          if (trapId[nb] === -1 && zSpill[nb] - zt[nb] > TRAP_COLUMN) {
            trapId[nb] = id;
            q.push(nb);
          }
        });
      }
      let crestCell = cells[0];
      let spillCell = -1;
      let capacity = 0;
      for (const c of cells) {
        if (zt[c] < zt[crestCell]) crestCell = c;
        if (spillCell === -1 && from[c] !== -1 && trapId[from[c]] !== id) spillCell = from[c];
        capacity += Math.min(model.Hc[c], zSpill[c] - zt[c]) * capacityFactor;
      }
      traps.push({
        id,
        cells: Int32Array.from(cells),
        crestCell,
        spillCell,
        spillDepth: zSpill[crestCell],
        capacity
      });
    }
    return {
      zSpill,
      trapId,
      traps
    };
  };

  // Marching squares on cell-centre values. Segments are [x0, y0, x1, y1, ...] in
  // cell-index coordinates (cell (i, j) centre at x = i, y = j).
  const contourSegments = (values, nx, ny, level) => {
    const out = [];
    const t = (v0, v1) => (level - v0) / (v1 - v0);
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = values[j * nx + i];
        const b = values[j * nx + i + 1];
        const c = values[(j + 1) * nx + i + 1];
        const d = values[(j + 1) * nx + i];
        if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d))) continue;
        const code = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
        if (code === 0 || code === 15) continue;
        const bottom = () => [i + t(a, b), j];
        const right = () => [i + 1, j + t(b, c)];
        const top = () => [i + t(d, c), j + 1];
        const left = () => [i, j + t(a, d)];
        const segment = (p, q) => out.push(p[0], p[1], q[0], q[1]);
        const centreAbove = (a + b + c + d) / 4 > level;
        switch (code) {
          case 1:
          case 14:
            segment(left(), bottom());
            break;
          case 2:
          case 13:
            segment(bottom(), right());
            break;
          case 3:
          case 12:
            segment(left(), right());
            break;
          case 4:
          case 11:
            segment(right(), top());
            break;
          case 6:
          case 9:
            segment(bottom(), top());
            break;
          case 7:
          case 8:
            segment(left(), top());
            break;
          case 5:
            if (centreAbove) {
              segment(bottom(), right());
              segment(left(), top());
            } else {
              segment(left(), bottom());
              segment(right(), top());
            }
            break;
          case 10:
            if (centreAbove) {
              segment(left(), bottom());
              segment(right(), top());
            } else {
              segment(bottom(), right());
              segment(left(), top());
            }
            break;
        }
      }
    }
    return Float64Array.from(out);
  };

  // ------------------------------------------------------------------ dynamics

  const CFL = 0.4;
  // Films thinner than a micrometre do not move: their mass stays where it is (so the
  // balance is still exact) and they no longer throttle the time step everywhere.
  const H_EPS = 1e-6;
  const createState = model => {
    const {
      n,
      nx,
      ny
    } = model;
    return {
      t: 0,
      steps: 0,
      h: new Float64Array(n),
      hMax: new Float64Array(n),
      s: new Float64Array(n),
      md: new Float64Array(n),
      p: new Float64Array(n),
      ux: new Float64Array((nx + 1) * ny),
      uy: new Float64Array(nx * (ny + 1)),
      fx: new Float64Array((nx + 1) * ny),
      fy: new Float64Array(nx * (ny + 1)),
      net: new Float64Array(n),
      rate: new Float64Array(n),
      leaking: new Uint8Array(model.scenario.faults.length),
      injected: 0,
      exited: 0,
      leaked: 0,
      dissolved: 0,
      pressureActive: true
    };
  };

  // CO2 volume per area s = phi[(1 - Swr) h + Sgr (hMax - h)] -> (h, hMax).
  const invertColumn = (p, state, c) => {
    const s = state.s[c];
    const drain = p.phi * (1 - p.swr);
    const residual = p.phi * p.sgr;
    const hMax = state.hMax[c];
    if (s >= drain * hMax) {
      state.h[c] = state.hMax[c] = s / drain;
    } else if (s >= residual * hMax) {
      state.h[c] = (s - residual * hMax) / (drain - residual);
    } else {
      state.h[c] = 0;
      state.hMax[c] = residual > 0 ? s / residual : 0;
    }
  };

  // Gas volume flux across one face (positive from side A to side B) with hybrid
  // upwinding: the viscous part follows the total flux, buoyancy follows the phase
  // potentials (gas from the deeper interface, brine the other way).
  const faceFlux = (k, T, U, zetaA, zetaB, hA, hB, HA, HB, scratch) => {
    if (hA <= H_EPS && hB <= H_EPS) {
      scratch.bound = 0;
      return 0;
    }
    const a = k.a;
    const b = k.b;
    const dz = zetaA - zetaB;
    let mob = 0;
    let gravity = 0;
    if (dz !== 0 && T > 0) {
      const gas = dz > 0 ? a * Math.min(hA, HA) : a * Math.min(hB, HB);
      const brine = dz > 0 ? b * Math.max(0, HB - hB) : b * Math.max(0, HA - hA);
      mob = gas + brine > 0 ? gas * brine / (gas + brine) : 0;
      gravity = T * k.tg * dz * mob;
    }
    let viscous = 0;
    let slope = 0;
    if (U !== 0) {
      const Hu = U > 0 ? HA : HB;
      const hu = Math.min(U > 0 ? hA : hB, Hu);
      const gas = a * hu;
      const brine = b * (Hu - hu);
      const total = gas + brine;
      if (total > 0) {
        viscous = U * gas / total;
        // df/dh at the upstream column: the local characteristic speed.
        slope = a * b * Hu / (total * total);
      }
    }
    scratch.bound = T * k.tg * (mob + Math.abs(dz) * (a + b)) + Math.abs(U) * slope;
    return viscous + gravity;
  };
  const FAULT_ZONE_WIDTH = 5;
  const CAPROCK_THICKNESS = 100;

  // Operator-split sinks after each transport step: vertical leakage up leaky fault zones
  // (only above the seal capacity, never draining a column below it) and convective
  // dissolution into the brine column until it is saturated.
  const applySinks = (model, state, dt) => {
    const {
      p,
      area,
      Hc
    } = model;
    const {
      h,
      s,
      md
    } = state;
    const imbibe = p.phi * Math.max(1e-3, 1 - p.swr - p.sgr);
    state.leaking.fill(0);
    for (const {
      cell,
      length,
      fault
    } of model.leakCells) {
      const {
        sealCap,
        kf
      } = model.scenario.faults[fault];
      const excess = Math.min(h[cell], Hc[cell]) - sealCap;
      if (!(excess > 0)) continue;
      const rate = length * FAULT_ZONE_WIDTH * kf * MD * (p.krg / p.muG) * p.dRho * p.g * (excess / CAPROCK_THICKNESS + 1);
      const volume = Math.min(rate * dt, excess * imbibe * area);
      if (!(volume > 0)) continue;
      s[cell] -= volume / area;
      state.leaked += volume * p.rhoG;
      state.leaking[fault] = 1;
      invertColumn(p, state, cell);
    }
    if (p.disRate > 0 && p.disCap > 0) {
      for (let c = 0; c < model.n; c++) {
        const capacity = p.disCap * p.phi * Hc[c];
        if (s[c] <= 0 || md[c] >= capacity) continue;
        const mass = Math.min(p.disRate * dt, capacity - md[c], p.rhoG * s[c]);
        if (!(mass > 0)) continue;
        md[c] += mass;
        s[c] = Math.max(0, s[c] - mass / p.rhoG);
        state.dissolved += mass * area;
        invertColumn(p, state, c);
      }
    }
  };
  const stepTransport = (model, state, dtMax) => {
    const {
      nx,
      ny,
      n,
      p,
      tx,
      ty,
      mx,
      my,
      zt,
      ghostX,
      ghostY,
      area,
      Hc
    } = model;
    const {
      h,
      s,
      ux,
      uy,
      fx,
      fy,
      net,
      rate
    } = state;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    const k = {
      a,
      b,
      tg: p.dRho * p.g
    };
    const scratch = {
      bound: 0
    };
    net.fill(0);
    rate.fill(0);
    // Boundary faces use phase-potential upwinding: the hydrostatic ghost holds no gas,
    // so CO2 leaves only where its own potential drops outward.
    const boundaryFlux = (T, c, ghostDepth) => {
      if (h[c] <= H_EPS) {
        scratch.bound = 0;
        return 0;
      }
      const hc = Math.min(h[c], Hc[c]);
      const drop = state.p[c] + k.tg * (zt[c] + h[c] - ghostDepth);
      scratch.bound = T * a * (Math.abs(drop) + k.tg * hc);
      return drop > 0 ? T * a * hc * drop : 0;
    };
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const T = tx[index] * mx[index];
        if (f === 0 || f === nx) {
          if (!p.open || T === 0) {
            fx[index] = 0;
            continue;
          }
          const c = j * nx + (f === 0 ? 0 : nx - 1);
          const flux = boundaryFlux(T, c, ghostX[index]);
          fx[index] = f === 0 ? -flux : flux;
          net[c] -= flux;
          rate[c] += scratch.bound;
          continue;
        }
        const L = j * nx + f - 1;
        const R = L + 1;
        if (T === 0) {
          fx[index] = 0;
          continue;
        }
        const flux = faceFlux(k, T, ux[index], zt[L] + h[L], zt[R] + h[R], h[L], h[R], Hc[L], Hc[R], scratch);
        fx[index] = flux;
        net[L] -= flux;
        net[R] += flux;
        rate[L] += scratch.bound;
        rate[R] += scratch.bound;
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        const T = ty[index] * my[index];
        if (f === 0 || f === ny) {
          if (!p.open || T === 0) {
            fy[index] = 0;
            continue;
          }
          const c = (f === 0 ? 0 : ny - 1) * nx + i;
          const flux = boundaryFlux(T, c, ghostY[index]);
          fy[index] = f === 0 ? -flux : flux;
          net[c] -= flux;
          rate[c] += scratch.bound;
          continue;
        }
        const S = (f - 1) * nx + i;
        const N = S + nx;
        if (T === 0) {
          fy[index] = 0;
          continue;
        }
        const flux = faceFlux(k, T, uy[index], zt[S] + h[S], zt[N] + h[N], h[S], h[N], Hc[S], Hc[N], scratch);
        fy[index] = flux;
        net[S] -= flux;
        net[N] += flux;
        rate[S] += scratch.bound;
        rate[N] += scratch.bound;
      }
    }
    const injecting = state.t < p.injEnd && p.rate > 0;
    const volumeRate = injecting ? p.rate / p.rhoG : 0;
    net[model.well] += volumeRate;

    // Explicit stability: the smallest storage coefficient (imbibition) bounds the step,
    // and one step may fill at most a quarter of the injector cell's pore volume.
    const storage = p.phi * Math.max(1e-3, 1 - p.swr - p.sgr) * area;
    let dt = volumeRate > 0 ? Math.min(dtMax, 0.25 * p.phi * (1 - p.swr) * Hc[model.well] * area / volumeRate) : dtMax;
    for (let c = 0; c < n; c++) if (rate[c] > 0) dt = Math.min(dt, CFL * storage / rate[c]);
    // Never let a column go negative: shrink the step instead of clipping mass.
    for (let c = 0; c < n; c++) {
      if (net[c] < 0 && s[c] + dt * net[c] / area < 0) dt = Math.min(dt, 0.999 * s[c] * area / -net[c]);
    }
    for (let c = 0; c < n; c++) {
      if (net[c] === 0) continue;
      s[c] += dt * net[c] / area;
      if (s[c] < 0) s[c] = 0;
      invertColumn(p, state, c);
    }
    applySinks(model, state, dt);
    let outflow = 0;
    if (p.open) {
      for (let j = 0; j < ny; j++) outflow += fx[j * (nx + 1) + nx] - fx[j * (nx + 1)];
      for (let i = 0; i < nx; i++) outflow += fy[ny * nx + i] - fy[i];
    }
    state.exited += outflow * dt * p.rhoG;
    state.injected += volumeRate * dt * p.rhoG;
    state.t += dt;
    state.steps++;
    return dt;
  };

  // ------------------------------------------------------------------ pressure

  const PRESSURE_TOL = 1e-7;
  const RELAXED_RATE = 0.05 * BAR / YEAR;
  const MAX_RELAX_TIME = 50 * YEAR;

  // Implicit (backward-Euler) brine-potential equation with total compressibility:
  //   phi ct H_c A (p - p_old)/dt + sum T m LamT (p_c - p_nb) = Qv - sum T m LamG drho g (zeta_c - zeta_nb)
  // solved matrix-free with Jacobi-preconditioned CG, then converted to total face fluxes.
  const solvePressure = (model, state, dt, injecting) => {
    const {
      nx,
      ny,
      n,
      p,
      tx,
      ty,
      mx,
      my,
      zt,
      ghostX,
      ghostY,
      area,
      Hc
    } = model;
    const {
      h
    } = state;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    const tg = p.dRho * p.g;
    const cg = state.cg || (state.cg = {
      wx: new Float64Array((nx + 1) * ny),
      wy: new Float64Array(nx * (ny + 1)),
      gx: new Float64Array((nx + 1) * ny),
      gy: new Float64Array(nx * (ny + 1)),
      diag: new Float64Array(n),
      rhs: new Float64Array(n),
      r: new Float64Array(n),
      z: new Float64Array(n),
      d: new Float64Array(n),
      q: new Float64Array(n),
      old: new Float64Array(n),
      wE: new Float64Array(n),
      wN: new Float64Array(n),
      prev: new Float64Array(n),
      prevInterval: 0
    });
    const {
      wx,
      wy,
      gx,
      gy,
      diag,
      rhs,
      r,
      z,
      d,
      q,
      old
    } = cg;
    const lamT = c => a * Math.min(h[c], Hc[c]) + b * Math.max(0, Hc[c] - h[c]);
    const lamG = c => a * Math.min(h[c], Hc[c]);
    const acc = p.phi * p.ct * area / dt;
    old.set(state.p);
    for (let c = 0; c < n; c++) {
      diag[c] = acc * Hc[c];
      rhs[c] = diag[c] * state.p[c];
    }
    if (injecting) rhs[model.well] += p.rate / p.rhoG;
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const T = tx[index] * mx[index];
        wx[index] = 0;
        gx[index] = 0;
        if (T === 0) continue;
        if (f === 0 || f === nx) {
          if (!p.open) continue;
          const c = j * nx + (f === 0 ? 0 : nx - 1);
          // Outward-positive buoyancy flux into the hydrostatic ghost (h = 0, p = 0).
          wx[index] = T * 0.5 * (lamT(c) + b * Hc[c]);
          gx[index] = T * 0.5 * lamG(c) * tg * (zt[c] + h[c] - ghostX[index]);
          diag[c] += wx[index];
          rhs[c] -= gx[index];
          continue;
        }
        const L = j * nx + f - 1;
        const R = L + 1;
        wx[index] = T * 0.5 * (lamT(L) + lamT(R));
        gx[index] = T * 0.5 * (lamG(L) + lamG(R)) * tg * (zt[L] + h[L] - zt[R] - h[R]);
        diag[L] += wx[index];
        diag[R] += wx[index];
        rhs[L] -= gx[index];
        rhs[R] += gx[index];
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        const T = ty[index] * my[index];
        wy[index] = 0;
        gy[index] = 0;
        if (T === 0) continue;
        if (f === 0 || f === ny) {
          if (!p.open) continue;
          const c = (f === 0 ? 0 : ny - 1) * nx + i;
          wy[index] = T * 0.5 * (lamT(c) + b * Hc[c]);
          gy[index] = T * 0.5 * lamG(c) * tg * (zt[c] + h[c] - ghostY[index]);
          diag[c] += wy[index];
          rhs[c] -= gy[index];
          continue;
        }
        const S = (f - 1) * nx + i;
        const N = S + nx;
        wy[index] = T * 0.5 * (lamT(S) + lamT(N));
        gy[index] = T * 0.5 * (lamG(S) + lamG(N)) * tg * (zt[S] + h[S] - zt[N] - h[N]);
        diag[S] += wy[index];
        diag[N] += wy[index];
        rhs[S] -= gy[index];
        rhs[N] += gy[index];
      }
    }

    // Five-point stencil per cell: east and north couplings (west/south are the
    // neighbours' east/north) give a single pass over the grid.
    const {
      wE,
      wN
    } = cg;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        wE[c] = i < nx - 1 ? wx[j * (nx + 1) + i + 1] : 0;
        wN[c] = j < ny - 1 ? wy[(j + 1) * nx + i] : 0;
      }
    }
    const apply = (x, out) => {
      for (let j = 0; j < ny; j++) {
        const row = j * nx;
        for (let i = 0; i < nx; i++) {
          const c = row + i;
          let v = diag[c] * x[c];
          if (i > 0) v -= wE[c - 1] * x[c - 1];
          if (i < nx - 1) v -= wE[c] * x[c + 1];
          if (j > 0) v -= wN[c - nx] * x[c - nx];
          if (j < ny - 1) v -= wN[c] * x[c + nx];
          out[c] = v;
        }
      }
    };

    // Start CG from a linear extrapolation of the last two solutions.
    const x = state.p;
    const prev = cg.prev;
    if (cg.prevInterval > 0) {
      const ratio = Math.min(2, dt / cg.prevInterval);
      for (let c = 0; c < n; c++) x[c] += ratio * (x[c] - prev[c]);
    }
    prev.set(old);
    cg.prevInterval = dt;
    apply(x, q);
    let bNorm = 0;
    let rz = 0;
    for (let c = 0; c < n; c++) {
      r[c] = rhs[c] - q[c];
      z[c] = r[c] / diag[c];
      d[c] = z[c];
      rz += r[c] * z[c];
      bNorm += rhs[c] * rhs[c];
    }
    bNorm = Math.sqrt(bNorm) || 1;
    let iterations = 0;
    for (; iterations < 3000; iterations++) {
      let rNorm = 0;
      for (let c = 0; c < n; c++) rNorm += r[c] * r[c];
      if (Math.sqrt(rNorm) <= PRESSURE_TOL * bNorm) break;
      apply(d, q);
      let dq = 0;
      for (let c = 0; c < n; c++) dq += d[c] * q[c];
      if (!(dq > 0)) break;
      const alpha = rz / dq;
      let rzNew = 0;
      for (let c = 0; c < n; c++) {
        x[c] += alpha * d[c];
        r[c] -= alpha * q[c];
        z[c] = r[c] / diag[c];
        rzNew += r[c] * z[c];
      }
      const beta = rzNew / rz;
      rz = rzNew;
      for (let c = 0; c < n; c++) d[c] = z[c] + beta * d[c];
    }

    // Total face fluxes: interior faces positive in +x/+y; boundary faces store +x/+y too.
    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        if (wx[index] === 0 && gx[index] === 0) {
          state.ux[index] = 0;
          continue;
        }
        if (f === 0) state.ux[index] = -(wx[index] * x[j * nx] + gx[index]);else if (f === nx) state.ux[index] = wx[index] * x[j * nx + nx - 1] + gx[index];else state.ux[index] = wx[index] * (x[j * nx + f - 1] - x[j * nx + f]) + gx[index];
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        if (wy[index] === 0 && gy[index] === 0) {
          state.uy[index] = 0;
          continue;
        }
        if (f === 0) state.uy[index] = -(wy[index] * x[i] + gy[index]);else if (f === ny) state.uy[index] = wy[index] * x[(ny - 1) * nx + i] + gy[index];else state.uy[index] = wy[index] * (x[(f - 1) * nx + i] - x[f * nx + i]) + gy[index];
      }
    }
    let change = 0;
    for (let c = 0; c < n; c++) change = Math.max(change, Math.abs(x[c] - old[c]));
    state.cgIterations = iterations;
    state.cgTotal = (state.cgTotal || 0) + iterations;
    state.solves = (state.solves || 0) + 1;
    return change;
  };
  const pressureInterval = (state, p) => {
    if (state.t < p.injEnd) return clamp(0.25 * state.t, 2 * 86400, 0.5 * YEAR);
    return 0.5 * YEAR;
  };
  const advance = (model, state, tTarget) => {
    const p = model.p;
    if (state.nextPressure === undefined) state.nextPressure = 0;
    while (state.t < tTarget * (1 - 1e-12)) {
      if (state.pressureActive && state.t >= state.nextPressure * (1 - 1e-12)) {
        let interval = pressureInterval(state, p);
        if (state.t < p.injEnd) interval = Math.min(interval, p.injEnd - state.t);
        const injecting = state.t < p.injEnd && p.rate > 0;
        const change = solvePressure(model, state, interval, injecting);
        state.nextPressure = state.t + interval;
        if (!injecting && state.t >= p.injEnd && (change / interval < RELAXED_RATE || state.t - p.injEnd > MAX_RELAX_TIME)) {
          state.pressureActive = false;
          state.ux.fill(0);
          state.uy.fill(0);
        }
      }
      let dtMax = tTarget - state.t;
      if (state.t < p.injEnd && state.t + dtMax > p.injEnd) dtMax = p.injEnd - state.t;
      if (state.pressureActive) dtMax = Math.min(dtMax, state.nextPressure - state.t);
      stepTransport(model, state, dtMax);
    }
  };

  // Key performance indicators at the current state (SI).
  const kpis = (model, state) => {
    const {
      n,
      nx,
      p,
      Hc,
      area,
      xc,
      yc
    } = model;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    let footprint = 0;
    let maxColumn = 0;
    let migration = 0;
    let pMax = 0;
    const wx = xc[model.well % nx];
    const wy = yc[Math.floor(model.well / nx)];
    for (let c = 0; c < n; c++) {
      if (state.s[c] > 1e-3) footprint += area;
      if (state.h[c] > maxColumn) maxColumn = state.h[c];
      if (state.h[c] > 0.1) migration = Math.max(migration, Math.hypot(xc[c % nx] - wx, yc[Math.floor(c / nx)] - wy));
      if (state.p[c] > pMax) pMax = state.p[c];
    }
    let bhp = state.p[model.well];
    if (state.t < p.injEnd && p.rate > 0) {
      const Hw = Hc[model.well];
      const hw = Math.min(state.h[model.well], Hw);
      const lamT = a * hw + b * (Hw - hw);
      bhp += p.rate / p.rhoG * Math.log(0.198 * model.dx / 0.1) / (2 * Math.PI * p.k * lamT);
    }
    return {
      footprint,
      maxColumn,
      migration,
      bhp,
      pMax
    };
  };

  // CO2 inventory in kg, classified as in co2lab: free plume, structurally trapped
  // (mobile CO2 above the local spill depth), residually trapped, dissolved, left the
  // model through an open boundary, and leaked up fault zones.
  const inventory = (model, state) => {
    const {
      n,
      p,
      area,
      zt,
      traps
    } = model;
    const {
      h,
      hMax
    } = state;
    const mobileFactor = p.rhoG * p.phi * (1 - p.swr) * area;
    const residualFactor = p.rhoG * p.phi * p.sgr * area;
    let mobile = 0;
    let structural = 0;
    let residual = 0;
    for (let c = 0; c < n; c++) {
      if (state.s[c] <= 0) continue;
      mobile += h[c] * mobileFactor;
      residual += (hMax[c] - h[c]) * residualFactor;
      const closure = traps.zSpill[c] - zt[c];
      if (closure > 0) structural += Math.min(h[c], closure) * mobileFactor;
    }
    const result = {
      injected: state.injected,
      free: Math.max(0, mobile - structural),
      structural,
      residual: Math.max(0, residual),
      dissolved: state.dissolved,
      exited: state.exited,
      leaked: state.leaked
    };
    result.balance = result.injected - (result.free + result.structural + result.residual + result.dissolved + result.exited + result.leaked);
    return result;
  };
  const MAX_STEPS = 400000;
  const modelViewOf = model => ({
    nx: model.nx,
    ny: model.ny,
    dx: model.dx,
    dy: model.dy,
    Lx: model.Lx,
    Ly: model.Ly,
    H: model.H,
    Hc: Float32Array.from(model.Hc),
    depth: model.scenario.depth,
    years: model.scenario.years,
    injYears: model.scenario.injYears,
    open: model.p.open,
    zt: Float32Array.from(model.zt),
    zSpill: Float32Array.from(model.traps.zSpill),
    trapId: Int32Array.from(model.traps.trapId),
    traps: model.traps.traps.map(({
      id,
      crestCell,
      spillCell,
      spillDepth,
      capacity,
      cells
    }) => ({
      id,
      crestCell,
      spillCell,
      spillDepth,
      capacity,
      size: cells.length
    })),
    faults: model.scenario.faults.map(fault => ({
      ...fault
    })),
    faultLines: model.faultLines.map(line => line.slice()),
    leakCells: model.leakCells.map(cell => ({
      ...cell
    })),
    well: model.well,
    wellX: model.xc[model.well % model.nx],
    wellY: model.yc[Math.floor(model.well / model.nx)],
    phi: model.p.phi,
    swr: model.p.swr,
    sgr: model.p.sgr,
    rhoG: model.p.rhoG,
    disCapacity: Float32Array.from(model.Hc, H => model.p.disCap * model.p.phi * H)
  });
  const snapshotOf = (model, state, year) => ({
    year,
    h: Float32Array.from(state.h),
    hMax: Float32Array.from(state.hMax),
    md: Float32Array.from(state.md),
    p: Float32Array.from(state.p),
    fx: Float32Array.from(state.fx),
    fy: Float32Array.from(state.fy),
    leaking: Uint8Array.from(state.leaking),
    inv: inventory(model, state),
    kpi: kpis(model, state)
  });

  // Run a scenario from year 0 to scenario.years. History rows every year, field
  // snapshots every `snapshotYears`. Ends early (truncated) if the step budget runs out.
  const run = (rawScenario, options = {}) => {
    const model = buildModel(rawScenario);
    const state = createState(model);
    const modelView = modelViewOf(model);
    const snapshotYears = options.snapshotYears || 5;
    const keepSnapshots = options.keepSnapshots !== false;
    const maxSteps = options.maxSteps || MAX_STEPS;
    options.onModel?.(modelView);
    const history = [];
    const snapshots = [];
    let bhpPeak = 0;
    let truncated = false;
    const record = year => {
      const inv = inventory(model, state);
      const kpi = kpis(model, state);
      bhpPeak = Math.max(bhpPeak, kpi.bhp);
      history.push({
        year,
        ...inv,
        footprint: kpi.footprint,
        maxColumn: kpi.maxColumn,
        migration: kpi.migration,
        bhp: kpi.bhp,
        bhpPeak
      });
      if (year % snapshotYears === 0) {
        const snap = snapshotOf(model, state, year);
        if (keepSnapshots) snapshots.push(snap);
        options.onSnapshot?.(snap, history);
      }
    };
    record(0);
    for (let year = 1; year <= model.scenario.years; year++) {
      advance(model, state, year * YEAR);
      record(year);
      if (state.steps > maxSteps) {
        truncated = true;
        break;
      }
    }
    return {
      modelView,
      snapshots,
      history,
      truncated,
      steps: state.steps,
      scenario: model.scenario
    };
  };

  // ------------------------------------------------------------------ random structures

  // Fault rock from the shale gouge ratio (SGR) of the faulted interval: permeability (mD)
  // and thickness (throw / 66) after Manzocchi et al. (1999), giving the cross-fault
  // multiplier between two 250 m cells (the standard grid), and the CO2 column the fault
  // rock holds from the Bretan et al. (2003) calibration for burial above 3 km.
  const faultSeal = (throwM, sgr, permMd, dRho) => {
    const kf = 10 ** (0.4 - 4 * sgr - 0.25 * Math.log10(Math.max(1, throwM)) * (1 - sgr) ** 5);
    return {
      trans: 1 / (1 + throwM / 66 / 250 * Math.max(0, permMd / kf - 1)),
      sealCap: 10 ** (100 * sgr / 27 - 0.5) * BAR / (dRho * GRAVITY)
    };
  };
  const RANDOM_STYLES = Object.freeze({
    'random-fault-blocks': {
      label: 'Tilted fault blocks',
      description: 'Parallel normal faults tilt the aquifer into blocks. CO₂ rises to the crest of its block, against the fault up-dip.'
    },
    'random-dome': {
      label: 'Faulted dome',
      description: 'A closure elongated along strike, often cut by small crestal faults, with the injector on its down-dip flank.'
    },
    'random-homocline': {
      label: 'Undulating homocline',
      description: 'A dipping aquifer whose caprock undulates along strike. Rising CO₂ fills many small traps on its way up-dip.'
    }
  });

  // A random structure from one geological setting, so that dip, folds, faults and fault
  // rock agree: a fault set shares the regional strike, throw grows with length (D = γL),
  // seals follow the shale gouge ratio and the injector sits down-dip of the main closure.
  const randomStructure = (seed, base = DEFAULTS, style) => {
    const rng = mulberry32(seed);
    const between = (min, max) => min + (max - min) * rng();
    const logBetween = (min, max) => Math.exp(between(Math.log(min), Math.log(max)));
    const round = (value, digits = 1) => +value.toFixed(digits);
    const unit = azimuth => [Math.sin(azimuth * Math.PI / 180), Math.cos(azimuth * Math.PI / 180)];
    const styles = Object.keys(RANDOM_STYLES);
    const drawn = styles[Math.floor(rng() * styles.length)];
    const kind = RANDOM_STYLES[style] ? style : drawn;
    const fault = (x, y, strike, length, gamma) => {
      const throwM = Math.min(150, Math.round(gamma * length * KM));
      const seal = faultSeal(throwM, between(0.12, 0.4), base.permMd, base.rhoBrine - base.rhoCo2);
      return {
        x: round(clamp(x, 0.5, 19.5)),
        y: round(clamp(y, 0.5, 11.5)),
        strike: (Math.round(strike) % 360 + 360) % 360,
        length: round(length),
        throw: throwM,
        trans: round(seal.trans, 2),
        sealCap: Math.min(200, Math.round(seal.sealCap)),
        kf: rng() < 0.3 ? Math.round(logBetween(5, 60)) : 0
      };
    };
    const well = (x, y) => ({
      wellX: round(clamp(x, 1.5, 18.5)),
      wellY: round(clamp(y, 1.5, 10.5))
    });
    if (kind === 'random-fault-blocks') {
      // Domino blocks: the faults dip one way and the beds the other, so each block rises
      // to a footwall crest against the next fault up-dip. The injector sits in the block
      // down-dip of the fault nearest the centre.
      const strike = between(0, 360);
      const along = unit(strike);
      const hanging = unit(strike + 90);
      const spacing = between(5, 7.5);
      const width = Math.abs(hanging[0]) * LX / KM + Math.abs(hanging[1]) * LY / KM;
      const count = Math.min(3, 1 + Math.floor(0.75 * width / spacing));
      const faults = Array.from({
        length: count
      }, (_, k) => {
        const offset = (k - (count - 1) / 2) * spacing + between(-0.5, 0.5);
        const shift = between(-2, 2);
        return fault(10 + offset * hanging[0] + shift * along[0], 6 + offset * hanging[1] + shift * along[1], strike + between(-4, 4), between(8, 16), logBetween(0.007, 0.015));
      });
      const host = faults.reduce((best, f) => Math.hypot(f.x - 10, f.y - 6) < Math.hypot(best.x - 10, best.y - 6) ? f : best);
      const distance = between(2.5, 3.5);
      return {
        preset: kind,
        seed,
        dipDeg: round(between(0.4, 1)),
        dipAz: Math.round(strike + 270 + between(-3, 3)) % 360,
        domes: 0,
        roughness: Math.round(between(1, 4)),
        thicknessVar: Math.round(between(15, 35)),
        faults,
        ...well(host.x - distance * hanging[0], host.y - distance * hanging[1])
      };
    }
    const dipAz = Math.floor(rng() * 360);
    const down = unit(dipAz);
    if (kind === 'random-dome') {
      // Crestal faults strike along the dome with their hanging walls facing the crest: one
      // fault, or a pair bounding a crestal graben.
      const domes = rng() < 0.35 ? 2 : 1;
      const [main] = domeCentres({
        seed,
        domes: 1,
        dipAz
      });
      const crestal = rng();
      const faults = (crestal < 0.3 ? [] : crestal < 0.6 ? [rng() < 0.5 ? -1 : 1] : [-1, 1]).map(side => {
        const offset = side * between(0.3, 1);
        const shift = between(-1, 1);
        return fault(main.x / KM + offset * down[0] + shift * down[1], main.y / KM + offset * down[1] - shift * down[0], dipAz + 90 * side + between(-8, 8), between(3, 7), logBetween(0.002, 0.006));
      });
      const distance = between(2.5, 3.5);
      return {
        preset: kind,
        seed,
        dipDeg: round(between(0.2, 0.8)),
        dipAz,
        domes,
        domeRelief: 5 * Math.round(between(50, 140) / 5),
        roughness: Math.round(between(1, 5)),
        thicknessVar: Math.round(between(10, 30)),
        faults,
        ...well(main.x / KM + distance * down[0], main.y / KM + distance * down[1])
      };
    }

    // Homocline: the injector sits down-dip of the centre so the plume crosses the
    // undulations on its way up.
    const faults = rng() < 0.5 ? [] : [fault(between(5, 15), between(3, 9), dipAz + (rng() < 0.5 ? -90 : 90) + between(-20, 20), between(3, 8), logBetween(0.002, 0.006))];
    const along = between(-3, 3);
    return {
      preset: kind,
      seed,
      dipDeg: round(between(0.5, 1.5)),
      dipAz,
      domes: rng() < 0.3 ? 1 : 0,
      domeRelief: 5 * Math.round(between(15, 40) / 5),
      roughness: Math.round(between(8, 18)),
      thicknessVar: Math.round(between(20, 45)),
      faults,
      ...well(10 + 5 * down[0] + along * down[1], 6 + 5 * down[1] - along * down[0])
    };
  };

  // ------------------------------------------------------------------ uncertainty

  // Inputs the uncertainty study may vary. `fault0.*` addresses the first fault.
  const UQ_PARAMS = Object.freeze([{
    key: 'permMd',
    label: 'Permeability',
    unit: 'mD',
    log: true
  }, {
    key: 'porosity',
    label: 'Porosity',
    unit: '–'
  }, {
    key: 'thickness',
    label: 'Aquifer thickness',
    unit: 'm'
  }, {
    key: 'rateMt',
    label: 'Injection rate',
    unit: 'Mt/yr'
  }, {
    key: 'sgr',
    label: 'Residual gas saturation',
    unit: '–'
  }, {
    key: 'krg',
    label: 'CO₂ relative permeability',
    unit: '–'
  }, {
    key: 'disRate',
    label: 'Dissolution rate',
    unit: 'kg/m²/yr'
  }, {
    key: 'dipDeg',
    label: 'Regional dip',
    unit: '°'
  }, {
    key: 'domeRelief',
    label: 'Dome relief',
    unit: 'm'
  }, {
    key: 'roughness',
    label: 'Top-surface roughness',
    unit: 'm'
  }, {
    key: 'fault0.sealCap',
    label: 'Fault seal capacity',
    unit: 'm'
  }, {
    key: 'fault0.kf',
    label: 'Fault-zone permeability',
    unit: 'mD',
    log: true
  }, {
    key: 'fault0.trans',
    label: 'Cross-fault transmissibility',
    unit: '–'
  }]);
  const mulberry32 = seed => {
    let a = seed >>> 0;
    return () => {
      a = a + 0x6D2B79F5 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };
  const latinHypercube = (n, dimensions, rng) => {
    const rows = Array.from({
      length: n
    }, () => new Array(dimensions));
    for (let d = 0; d < dimensions; d++) {
      const strata = Array.from({
        length: n
      }, (_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [strata[i], strata[j]] = [strata[j], strata[i]];
      }
      for (let i = 0; i < n; i++) rows[i][d] = (strata[i] + rng()) / n;
    }
    return rows;
  };
  const ranks = values => {
    const order = values.map((value, index) => [value, index]).sort((a, b) => a[0] - b[0]);
    const result = new Array(values.length);
    for (let i = 0; i < order.length;) {
      let j = i;
      while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
      for (let k = i; k <= j; k++) result[order[k][1]] = (i + j) / 2;
      i = j + 1;
    }
    return result;
  };
  const spearman = (x, y) => {
    const rx = ranks(x);
    const ry = ranks(y);
    const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
    const mx = mean(rx);
    const my = mean(ry);
    let num = 0;
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < rx.length; i++) {
      num += (rx[i] - mx) * (ry[i] - my);
      dx += (rx[i] - mx) ** 2;
      dy += (ry[i] - my) ** 2;
    }
    return dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : 0;
  };
  const setScenarioValue = (scenario, key, value) => {
    if (key.startsWith('fault0.')) {
      if (scenario.faults.length) scenario.faults[0] = {
        ...scenario.faults[0],
        [key.slice(7)]: value
      };
    } else {
      scenario[key] = value;
    }
  };
  const sampleBatch = (base, specs, n, seed) => {
    const unit = latinHypercube(n, specs.length, mulberry32(seed));
    return unit.map(row => {
      const scenario = normalizeScenario(base);
      specs.forEach((spec, d) => {
        const value = spec.log ? Math.exp(Math.log(spec.min) + row[d] * (Math.log(spec.max) - Math.log(spec.min))) : spec.min + row[d] * (spec.max - spec.min);
        setScenarioValue(scenario, spec.key, value);
      });
      return normalizeScenario(scenario);
    });
  };
  const summarize = row => {
    const pct = value => row.injected > 0 ? 100 * value / row.injected : 0;
    return {
      freePct: pct(row.free),
      structuralPct: pct(row.structural),
      residualPct: pct(row.residual),
      dissolvedPct: pct(row.dissolved),
      exitedPct: pct(row.exited),
      leakedPct: pct(row.leaked),
      footprintKm2: row.footprint / 1e6,
      migrationKm: row.migration / KM,
      bhpBar: row.bhpPeak / BAR
    };
  };
  const runBatch = (scenarios, onProgress) => scenarios.map((scenario, index) => {
    const result = run(scenario, {
      keepSnapshots: false
    });
    onProgress?.(index + 1, scenarios.length);
    return {
      index,
      scenario: result.scenario,
      summary: summarize(result.history.at(-1)),
      truncated: result.truncated
    };
  });
  return {
    YEAR,
    MT,
    MD,
    BAR,
    KM,
    GRAVITY,
    LX,
    LY,
    GRIDS,
    LIMITS,
    FAULT_LIMITS,
    DEFAULTS,
    PRESETS,
    MAX_FAULTS,
    normalizeScenario,
    topDepth,
    depthField,
    thicknessField,
    buildModel,
    trapAnalysis,
    contourSegments,
    RANDOM_STYLES,
    randomStructure,
    faultSeal,
    createState,
    advance,
    kpis,
    inventory,
    run,
    UQ_PARAMS,
    mulberry32,
    latinHypercube,
    spearman,
    sampleBatch,
    summarize,
    runBatch
  };
});

// File: sim-block3d.js
// sim-block3d.js — WebGL 2 block diagram of a VE run. The top of the aquifer (caprock
// removed) is a corner-point surface evaluated from the engine's own depth function and
// cut along every fault trace, so throw shows as a vertical scarp at the trace; the side
// walls and the scarps show the CO2 column in section. Geometry, camera and picking are
// pure functions shared with the Node tests; createRenderer is the only WebGL code.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SimBlock3D = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SIDE_OFFSET = 0.05; // m: the depth on one side of a trace is read this far from it
  const ON_LINE = 1e-4; // m: a vertex closer than this to a trace lies on it
  const MESH_NODES = 160; // surface resolution across the long side of the domain
  const FOV = 30 * Math.PI / 180;
  // Key light from the north-west, as on the map's hillshade.
  const LIGHT = [-0.5, 0.5, 0.707].map(v => v / Math.hypot(-0.5, 0.5, 0.707));

  // ------------------------------------------------------------------ geometry

  // Fault trace with its hanging-wall normal (to the right of strike, as in the engine).
  const traceOf = (fault, line, index) => {
    const strike = fault.strike * Math.PI / 180;
    return {
      index,
      x0: line[0],
      y0: line[1],
      x1: line[2],
      y1: line[3],
      nx: Math.cos(strike),
      ny: -Math.sin(strike)
    };
  };
  const signedDistance = (trace, x, y) => (x - trace.x0) * trace.nx + (y - trace.y0) * trace.ny;
  const segmentDistance = (trace, x, y) => {
    const dx = trace.x1 - trace.x0;
    const dy = trace.y1 - trace.y0;
    const t = Math.max(0, Math.min(1, ((x - trace.x0) * dx + (y - trace.y0) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - trace.x0 - t * dx, y - trace.y0 - t * dy);
  };

  // Does the trace segment reach the closed rectangle? (Liang–Barsky.)
  const touches = (trace, xa, ya, xb, yb) => {
    const dx = trace.x1 - trace.x0;
    const dy = trace.y1 - trace.y0;
    let t0 = 0;
    let t1 = 1;
    for (const [p, q] of [[-dx, trace.x0 - xa], [dx, xb - trace.x0], [-dy, trace.y0 - ya], [dy, yb - trace.y0]]) {
      if (Math.abs(p) < 1e-12) {
        if (q < 0) return false;
        continue;
      }
      const r = q / p;
      if (p < 0) t0 = Math.max(t0, r);else t1 = Math.min(t1, r);
      if (t0 > t1) return false;
    }
    return true;
  };

  // Where the trace line crosses edge a–b. The endpoints are ordered first so the two
  // cells sharing the edge get the identical point and the surface stays watertight.
  const crossing = (a, b, trace) => {
    const [p, q] = a[0] < b[0] || a[0] === b[0] && a[1] < b[1] ? [a, b] : [b, a];
    const dp = signedDistance(trace, p[0], p[1]);
    const dq = signedDistance(trace, q[0], q[1]);
    const t = dp / (dp - dq);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, -1];
  };
  const splitPolygon = (polygon, trace) => {
    const d = polygon.map(v => {
      const s = signedDistance(trace, v[0], v[1]);
      return Math.abs(s) < ON_LINE ? 0 : s;
    });
    if (!d.some(s => s < 0) || !d.some(s => s > 0)) return [polygon];
    const footwall = [];
    const hangingWall = [];
    for (let k = 0; k < polygon.length; k++) {
      const next = (k + 1) % polygon.length;
      if (d[k] <= 0) footwall.push(polygon[k]);
      if (d[k] >= 0) hangingWall.push(polygon[k]);
      if (d[k] * d[next] < 0) {
        const point = crossing(polygon[k], polygon[next], trace);
        footwall.push(point);
        hangingWall.push(point);
      }
    }
    return [footwall, hangingWall];
  };

  // Quad p–q from depth `top` down to depth `low`, wound to face `normal` (display space).
  const addQuad = (mesh, p, q, top, low, normal, attributes) => {
    if ((p[1] - q[1]) * normal[0] + (q[0] - p[0]) * normal[1] < 0) {
      [p, q] = [q, p];
      top = [top[1], top[0]];
      low = [low[1], low[0]];
    }
    const first = mesh.top.length;
    for (const [point, depth, column] of [[p, top[0], 0], [q, top[1], 1], [q, low[1], 1], [p, low[0], 0]]) {
      mesh.position.push(point[0], point[1], depth);
      mesh.top.push(top[column]);
      mesh.normal.push(normal[0], normal[1]);
      const sample = attributes.sample(point);
      mesh.sample.push(sample[0], sample[1]);
      mesh.fault.push(attributes.fault);
    }
    mesh.index.push(first, first + 1, first + 2, first, first + 2, first + 3);
  };

  // The aquifer top as a heightfield on a lattice finer than the grid, cut at fault
  // traces; scarps on the footwall edge of every cut; four walls down to the aquifer
  // base, which follows the local thickness.
  const buildGeometry = (view, depthAt, options = {}) => {
    const {
      Lx,
      Ly
    } = view;
    const thicknessAt = options.thicknessAt || (() => view.H);
    const subdivisions = options.subdivisions || Math.max(1, Math.round(MESH_NODES / view.nx));
    const MX = view.nx * subdivisions;
    const MY = view.ny * subdivisions;
    const traces = view.faults.map((fault, index) => traceOf(fault, view.faultLines[index], index));
    const node = (a, b) => [a * Lx / MX, b * Ly / MY, b * (MX + 1) + a];

    // Depth and depth gradient at a vertex, read on the polygon's side of every trace
    // the vertex lies on; finite differences never straddle a trace.
    const cache = new Map();
    const evaluate = (vertex, sides) => {
      let x = vertex[0];
      let y = vertex[1];
      let nudged = false;
      for (const {
        trace,
        side
      } of sides) {
        if (Math.abs(signedDistance(trace, vertex[0], vertex[1])) >= ON_LINE) continue;
        x += side * SIDE_OFFSET * trace.nx;
        y += side * SIDE_OFFSET * trace.ny;
        nudged = true;
      }
      const key = nudged || vertex[2] < 0 ? `${x},${y}` : vertex[2];
      if (cache.has(key)) return cache.get(key);
      let step = nudged ? 0.4 * SIDE_OFFSET : 5;
      if (!nudged) for (const trace of traces) step = Math.min(step, Math.max(1e-3, 0.45 * segmentDistance(trace, x, y)));
      const value = [depthAt(x, y), (depthAt(x + step, y) - depthAt(x - step, y)) / (2 * step), (depthAt(x, y + step) - depthAt(x, y - step)) / (2 * step)];
      cache.set(key, value);
      return value;
    };
    const surface = {
      position: [],
      gradient: [],
      index: []
    };
    const section = {
      position: [],
      top: [],
      normal: [],
      sample: [],
      fault: [],
      index: []
    };
    let zMin = Infinity;
    let zMax = -Infinity;
    let zBottom = -Infinity;
    const cellStep = 0.3 * Math.min(view.dx, view.dy);
    for (let b = 0; b < MY; b++) {
      for (let a = 0; a < MX; a++) {
        const corners = [node(a, b), node(a + 1, b), node(a + 1, b + 1), node(a, b + 1)];
        const local = traces.filter(trace => touches(trace, corners[0][0] - ON_LINE, corners[0][1] - ON_LINE, corners[2][0] + ON_LINE, corners[2][1] + ON_LINE));
        let polygons = [corners];
        for (const trace of local) polygons = polygons.flatMap(polygon => splitPolygon(polygon, trace));
        for (const polygon of polygons) {
          const cx = polygon.reduce((sum, v) => sum + v[0], 0) / polygon.length;
          const cy = polygon.reduce((sum, v) => sum + v[1], 0) / polygon.length;
          const sides = local.map(trace => ({
            trace,
            side: signedDistance(trace, cx, cy) > 0 ? 1 : -1
          }));
          const values = polygon.map(vertex => evaluate(vertex, sides));
          const first = surface.position.length / 3;
          polygon.forEach((vertex, k) => {
            surface.position.push(vertex[0], vertex[1], values[k][0]);
            surface.gradient.push(values[k][1], values[k][2]);
            zMin = Math.min(zMin, values[k][0]);
            zMax = Math.max(zMax, values[k][0]);
          });
          for (let k = 1; k < polygon.length - 1; k++) surface.index.push(first, first + k, first + k + 1);

          // Scarp: every footwall edge lying on a trace, down to the hanging wall.
          for (const {
            trace,
            side
          } of sides) {
            if (side > 0) continue;
            const flipped = sides.map(entry => entry.trace === trace ? {
              trace,
              side: 1
            } : entry);
            for (let k = 0; k < polygon.length; k++) {
              const next = (k + 1) % polygon.length;
              const p = polygon[k];
              const q = polygon[next];
              if (Math.abs(signedDistance(trace, p[0], p[1])) >= ON_LINE || Math.abs(signedDistance(trace, q[0], q[1])) >= ON_LINE) continue;
              const low = [evaluate(p, flipped)[0], evaluate(q, flipped)[0]];
              const top = [values[k][0], values[next][0]];
              if (Math.max(low[0] - top[0], low[1] - top[1]) < 1e-3) continue;
              addQuad(section, p, q, top, low, [trace.nx, trace.ny], {
                fault: trace.index + 1,
                sample: point => [point[0] - cellStep * trace.nx, point[1] - cellStep * trace.ny]
              });
            }
          }
        }
      }
    }

    // Walls: columns at the lattice nodes on each edge, plus two columns (one per side)
    // wherever a trace meets the edge, so the wall top follows the surface exactly.
    const edges = [{
      normal: [0, -1],
      nodes: Array.from({
        length: MX + 1
      }, (_, a) => node(a, 0))
    }, {
      normal: [0, 1],
      nodes: Array.from({
        length: MX + 1
      }, (_, a) => node(a, MY))
    }, {
      normal: [-1, 0],
      nodes: Array.from({
        length: MY + 1
      }, (_, b) => node(0, b))
    }, {
      normal: [1, 0],
      nodes: Array.from({
        length: MY + 1
      }, (_, b) => node(MX, b))
    }];
    const sideOf = (trace, point) => signedDistance(trace, point[0], point[1]) > 0 ? 1 : -1;
    for (const edge of edges) {
      const columns = [];
      const push = (point, sides) => columns.push({
        point,
        depth: evaluate(point, sides)[0],
        thickness: thicknessAt(point[0], point[1])
      });
      edge.nodes.forEach((point, k) => {
        const previous = edge.nodes[k - 1];
        const next = edge.nodes[k + 1];
        const on = traces.filter(trace => Math.abs(signedDistance(trace, point[0], point[1])) < ON_LINE && touches(trace, point[0] - ON_LINE, point[1] - ON_LINE, point[0] + ON_LINE, point[1] + ON_LINE));
        if (!on.length) push(point, []);else {
          if (previous) push(point, on.map(trace => ({
            trace,
            side: sideOf(trace, previous)
          })));
          if (next) push(point, on.map(trace => ({
            trace,
            side: sideOf(trace, next)
          })));
        }
        if (!next) return;
        const crossings = traces.filter(trace => {
          const dp = signedDistance(trace, point[0], point[1]);
          const dq = signedDistance(trace, next[0], next[1]);
          return Math.abs(dp) >= ON_LINE && Math.abs(dq) >= ON_LINE && dp * dq < 0 && touches(trace, Math.min(point[0], next[0]) - ON_LINE, Math.min(point[1], next[1]) - ON_LINE, Math.max(point[0], next[0]) + ON_LINE, Math.max(point[1], next[1]) + ON_LINE);
        }).map(trace => ({
          trace,
          at: crossing(point, next, trace)
        })).sort((u, v) => Math.hypot(u.at[0] - point[0], u.at[1] - point[1]) - Math.hypot(v.at[0] - point[0], v.at[1] - point[1]));
        for (const {
          trace,
          at
        } of crossings) {
          push(at, [{
            trace,
            side: sideOf(trace, point)
          }]);
          push(at, [{
            trace,
            side: sideOf(trace, next)
          }]);
        }
      });
      for (let k = 0; k < columns.length - 1; k++) {
        const p = columns[k];
        const q = columns[k + 1];
        if (p.point[0] === q.point[0] && p.point[1] === q.point[1]) continue;
        addQuad(section, p.point, q.point, [p.depth, q.depth], [p.depth + p.thickness, q.depth + q.thickness], edge.normal, {
          fault: 0,
          sample: point => point
        });
        zBottom = Math.max(zBottom, p.depth + p.thickness, q.depth + q.thickness);
      }
    }
    return {
      surface: {
        position: Float32Array.from(surface.position),
        gradient: Float32Array.from(surface.gradient),
        index: Uint32Array.from(surface.index)
      },
      section: {
        position: Float32Array.from(section.position),
        top: Float32Array.from(section.top),
        normal: Float32Array.from(section.normal),
        sample: Float32Array.from(section.sample),
        fault: Float32Array.from(section.fault),
        index: Uint32Array.from(section.index)
      },
      zMin,
      zMax,
      zBottom
    };
  };

  // Cell state for the GPU: column (m), historical maximum (m), dissolved fraction of
  // the cell's capacity, pressure build-up (bar).
  const packFrame = (view, frame) => {
    const n = frame.h.length;
    const data = new Float32Array(4 * n);
    for (let c = 0; c < n; c++) {
      data[4 * c] = frame.h[c];
      data[4 * c + 1] = frame.hMax[c];
      data[4 * c + 2] = view.disCapacity[c] > 0 ? frame.md[c] / view.disCapacity[c] : 0;
      data[4 * c + 3] = frame.p[c] / 1e5;
    }
    return data;
  };

  // Static per-model fields: structural closure below the spill point (m, capped), the
  // outline mask of the traps the map also draws, and the aquifer thickness (m).
  const packStatic = view => {
    const n = view.zt.length;
    const data = new Float32Array(4 * n);
    const big = new Set(view.traps.filter(t => t.size >= 4 && t.capacity * view.rhoG > 0.02e9).map(t => t.id));
    for (let c = 0; c < n; c++) {
      data[4 * c] = Math.min(1000, Math.max(0, view.zSpill[c] - view.zt[c]));
      data[4 * c + 1] = big.has(view.trapId[c]) ? 1 : 0;
      data[4 * c + 2] = view.Hc[c];
    }
    return data;
  };

  // ------------------------------------------------------------------ camera

  // Display space: x east and y north from the domain centre (m), z up = exaggerated
  // height above the mid-depth of the surface. The box includes the well stem.
  const sceneBox = (geometry, view, exaggeration, wellDepth) => {
    const zRef = 0.5 * (geometry.zMin + geometry.zMax);
    const Z = depth => -(depth - zRef) * exaggeration;
    const stem = 0.11 * Math.max(view.Lx, view.Ly);
    return {
      Lx: view.Lx,
      Ly: view.Ly,
      zRef,
      exaggeration,
      stem,
      surfaceTop: Z(geometry.zMin),
      surfaceBottom: Z(geometry.zMax),
      top: Math.max(Z(geometry.zMin), Z(wellDepth) + stem),
      bottom: Z(Math.max(geometry.zMax, geometry.zBottom))
    };
  };
  const toDisplay = (box, x, y, depth) => [x - box.Lx / 2, y - box.Ly / 2, -(depth - box.zRef) * box.exaggeration];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  // Smallest camera distance at which the block's bounding cylinder (vertical axis through
  // the target) fits the free area. The cylinder is round, so the fit does not depend on
  // the azimuth: orbiting never zooms, and the block fills the frame better than a sphere.
  const fitDistance = (box, elevation, usableWidth, usableHeight, focal) => {
    const radius = 0.5 * Math.hypot(box.Lx, box.Ly);
    const half = 0.5 * (box.top - box.bottom);
    const ce = Math.cos(elevation);
    const se = Math.sin(elevation);
    // Camera at azimuth 0: offsets of rim points on screen, relative to the target.
    const fits = distance => {
      for (let k = 0; k < 48; k++) {
        const x = radius * Math.cos(2 * Math.PI * k / 48);
        const y = radius * Math.sin(2 * Math.PI * k / 48);
        for (const z of [-half, half]) {
          const depth = distance + y * ce - z * se;
          if (Math.abs(focal * x / depth) > usableWidth / 2 || Math.abs(focal * (y * se + z * ce) / depth) > usableHeight / 2) return false;
        }
      }
      return true;
    };
    let lo = radius + half;
    let hi = 200 * (radius + half);
    for (let k = 0; k < 40; k++) {
      const mid = 0.5 * (lo + hi);
      if (fits(mid)) hi = mid;else lo = mid;
    }
    return hi;
  };

  // Orbit camera around the block centre, framed by fitDistance.
  const cameraFor = ({
    azimuth,
    elevation,
    zoom = 1,
    panX = 0,
    panY = 0
  }, box, viewport) => {
    const {
      width,
      height,
      top = 0,
      bottom = 0,
      side = 0
    } = viewport;
    const usableWidth = Math.max(40, width - 2 * side);
    const usableHeight = Math.max(40, height - top - bottom);
    const tanY = Math.tan(FOV / 2);
    const focal = height / 2 / tanY;
    const radius = 0.5 * Math.hypot(box.Lx, box.Ly, box.top - box.bottom);
    const distance = fitDistance(box, elevation, usableWidth, usableHeight, focal) / zoom;
    const centreY = top + usableHeight / 2;
    const target = [panX, panY, 0.5 * (box.top + box.bottom)];
    const ce = Math.cos(elevation);
    const se = Math.sin(elevation);
    const sa = Math.sin(azimuth);
    const ca = Math.cos(azimuth);
    const forward = [ce * sa, ce * ca, -se];
    const right = [ca, -sa, 0];
    const up = [sa * se, ca * se, ce];
    const eye = target.map((v, i) => v - distance * forward[i]);
    const reach = radius + Math.hypot(panX, panY);
    const near = Math.max(distance * 0.01, distance - 1.2 * reach);
    const far = distance + 1.2 * reach;
    // Clip space with the image centre moved to the middle of the free area.
    const shift = 1 - 2 * centreY / height;
    const aspect = width / height;
    const k1 = (far + near) / (far - near);
    const k2 = 2 * far * near / (far - near);
    const rows = [[...right.map(v => v / (tanY * aspect)), -dot(right, eye) / (tanY * aspect)], [...up.map((v, i) => v / tanY + shift * forward[i]), -dot(up, eye) / tanY - shift * dot(forward, eye)], [...forward.map(v => k1 * v), -k1 * dot(forward, eye) - k2], [...forward, -dot(forward, eye)]];
    const viewProj = new Float32Array(16);
    for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) viewProj[col * 4 + row] = rows[row][col];
    return {
      viewProj,
      eye,
      target,
      forward,
      right,
      up,
      distance,
      focal,
      width,
      height,
      centreY
    };
  };

  // Display point to CSS pixels; null behind the camera.
  const project = (cam, x, y, z) => {
    const v = [x - cam.eye[0], y - cam.eye[1], z - cam.eye[2]];
    const depth = dot(v, cam.forward);
    if (depth <= 1e-6) return null;
    return [cam.width / 2 + cam.focal * dot(v, cam.right) / depth, cam.centreY - cam.focal * dot(v, cam.up) / depth, depth];
  };

  // Surface point under a pixel: march the view ray through the slab that holds the
  // surface, then bisect onto the first crossing. Null if the ray misses the top.
  const pick = (cam, box, depthAt, px, py) => {
    const a = (px - cam.width / 2) / cam.focal;
    const b = (cam.centreY - py) / cam.focal;
    const dir = [0, 1, 2].map(i => cam.forward[i] + a * cam.right[i] + b * cam.up[i]);
    let t0 = 0;
    let t1 = Infinity;
    const slabs = [[-box.Lx / 2, box.Lx / 2], [-box.Ly / 2, box.Ly / 2], [box.surfaceBottom, box.surfaceTop]];
    for (let i = 0; i < 3; i++) {
      const [lo, hi] = slabs[i];
      if (Math.abs(dir[i]) < 1e-12) {
        if (cam.eye[i] < lo || cam.eye[i] > hi) return null;
        continue;
      }
      const ta = (lo - cam.eye[i]) / dir[i];
      const tb = (hi - cam.eye[i]) / dir[i];
      t0 = Math.max(t0, Math.min(ta, tb));
      t1 = Math.min(t1, Math.max(ta, tb));
    }
    if (!(t0 < t1)) return null;
    const below = t => {
      const p = cam.eye.map((v, i) => v + t * dir[i]);
      const x = p[0] + box.Lx / 2;
      const y = p[1] + box.Ly / 2;
      return {
        x,
        y,
        under: box.zRef - p[2] / box.exaggeration >= depthAt(x, y)
      };
    };
    const steps = 400;
    let previous = t0;
    if (below(t0).under) return null;
    for (let s = 1; s <= steps; s++) {
      const t = t0 + (t1 - t0) * s / steps;
      if (!below(t).under) {
        previous = t;
        continue;
      }
      let lo = previous;
      let hi = t;
      for (let k = 0; k < 40; k++) {
        const mid = 0.5 * (lo + hi);
        if (below(mid).under) hi = mid;else lo = mid;
      }
      const hit = below(hi);
      return {
        x: hit.x,
        y: hit.y,
        depth: depthAt(hit.x, hit.y)
      };
    }
    return null;
  };

  // ------------------------------------------------------------------ WebGL renderer

  const SURFACE_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec2 aGrad;
uniform mat4 uViewProj;
uniform vec2 uSize;
uniform float uRef;
uniform float uEx;
out vec3 vWorld;
out vec3 vNormal;
centroid out vec2 vPlan;
void main() {
  vWorld = aPos;
  vPlan = aPos.xy;
  vNormal = vec3(uEx * aGrad, 1.0);
  gl_Position = uViewProj * vec4(aPos.xy - 0.5 * uSize, -(aPos.z - uRef) * uEx, 1.0);
}`;
  const SURFACE_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vNormal;
// Position inside the triangle even on partly covered edge pixels (MSAA), for the
// side-of-fault test, which must not leak onto the hanging wall.
centroid in vec2 vPlan;
uniform sampler2D uData;
uniform sampler2D uStatic;
uniform vec2 uSize;
uniform vec2 uDepthRange;
uniform vec3 uRamp[7];
uniform vec3 uLight;
uniform vec3 uFree;
uniform vec3 uStructural;
uniform vec3 uResidual;
uniform vec3 uDissolved;
uniform vec3 uInk;
uniform vec3 uContourInk;
uniform vec3 uAccent;
uniform float uRefH;
uniform vec4 uLayers;
uniform float uInterval;
uniform float uPressure;
uniform vec3 uWell;
uniform float uTime;
uniform float uHatch;
uniform vec4 uTraces[3];
uniform int uTraceCount;
uniform vec3 uLeaking;
uniform vec3 uLeak;
out vec4 outColor;

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * 6.0;
  int i = min(int(x), 5);
  return mix(uRamp[i], uRamp[i + 1], x - float(i));
}

// Anti-aliased iso-lines of v at whole numbers, about px pixels wide.
float isoLine(float v, float px) {
  float w = max(fwidth(v), 1e-6);
  return 1.0 - smoothstep(0.5 * px, 0.5 * px + 1.0, abs(fract(v - 0.5) - 0.5) / w);
}

float level(float v, float at, float px) {
  return 1.0 - smoothstep(0.5 * px, 0.5 * px + 1.0, abs(v - at) / max(fwidth(v), 1e-6));
}

void main() {
  vec2 uv = vWorld.xy / uSize;
  vec4 d = texture(uData, uv);
  vec4 s = texture(uStatic, uv);
  float h = max(d.r, 0.0);
  float zone = max(0.0, d.g - d.r);

  float depthLines = uInterval > 0.0 ? max(0.5 * isoLine(vWorld.z / uInterval, 0.8), isoLine(vWorld.z / (5.0 * uInterval), 1.2)) : 0.0;
  float pressureLines = uPressure > 0.0 ? isoLine(d.a / uPressure, 1.2) * step(0.5 * uPressure, d.a) : 0.0;
  float plumeEdge = level(h, 0.5, 1.6);
  float trapEdge = level(s.g, 0.5, 1.4);
  float fwH = fwidth(h);
  float hatch = (vWorld.x + vWorld.y) / uHatch;
  float hatchWidth = fwidth(hatch);
  float wellDistance = length(vWorld.xy - uWell.xy);
  float fwWell = max(fwidth(wellDistance), 1e-3);

  // Fault traces on the footwall edge of each scarp, so a fault stays visible from the
  // footwall side too, where its scarp faces away. Derivatives stay outside the loop:
  // inside it they are undefined on Direct3D (ANGLE) and the line vanished.
  float gap = 1e9;
  float footwall = 0.0;
  float traceLeak = 0.0;
  for (int k = 0; k < 3; k++) {
    if (k >= uTraceCount) break;
    vec2 a = uTraces[k].xy;
    vec2 ab = uTraces[k].zw - a;
    vec2 r = vWorld.xy - a;
    float g = length(r - clamp(dot(r, ab) / dot(ab, ab), 0.0, 1.0) * ab);
    if (g < gap) {
      gap = g;
      footwall = step(dot(vPlan - a, vec2(ab.y, -ab.x)), 0.0);
      traceLeak = uLeaking[k];
    }
  }
  float trace = (1.0 - smoothstep(1.0, 2.0, gap / max(fwidth(gap), 1e-3))) * footwall;

  float t = (vWorld.z - uDepthRange.x) / max(1e-3, uDepthRange.y - uDepthRange.x);
  float shade = max(0.0, dot(normalize(vNormal), uLight));
  vec3 rgb = ramp(t) * (0.5 + 0.6 * shade);
  rgb = mix(rgb, uContourInk, uLayers.z * 0.3 * depthLines);

  if (uLayers.y > 0.5) rgb = mix(rgb, uDissolved, min(0.6, max(d.b, 0.0)));

  // Residual CO2: hatched like the map (about 6 px apart at the block centre) over a
  // light fill, alpha growing with the trapped zone.
  float stripe = 1.0 - smoothstep(0.12, 0.12 + hatchWidth, abs(fract(hatch) - 0.5));
  stripe = 0.25 + 0.75 * mix(stripe, 0.3, smoothstep(0.2, 0.45, hatchWidth));
  float residual = min(0.85, 0.3 + zone / uRefH) * smoothstep(0.05, 0.1, zone);
  rgb = mix(rgb, uResidual, uLayers.x * residual * stripe);

  // Free CO2: teal, turning amber where the column sits inside a structural closure.
  float present = smoothstep(0.05, 0.05 + max(fwH, 0.02), h);
  vec3 plume = mix(uFree, uStructural, clamp(min(h, s.r) / max(h, 1e-4), 0.0, 1.0));
  rgb = mix(rgb, plume, present * (0.35 + 0.65 * min(1.0, sqrt(h / uRefH))));
  rgb = mix(rgb, uFree, plumeEdge);

  rgb = mix(rgb, uStructural, uLayers.w * 0.9 * trapEdge);
  rgb = mix(rgb, uAccent, 0.85 * pressureLines);
  rgb = mix(rgb, mix(uInk, uLeak, step(0.5, traceLeak)), trace);

  // Injector: entry ring; while injecting, a ring pulses outwards (static if motion is off).
  rgb = mix(rgb, uInk, 1.0 - smoothstep(1.0, 2.0, abs(wellDistance - 170.0) / fwWell));
  if (uWell.z > 0.5) {
    float phase = uTime >= 0.0 ? fract(uTime / 1.6) : 0.12;
    float radius = 260.0 + phase * 1500.0;
    float pulse = (1.0 - smoothstep(1.0, 2.5, abs(wellDistance - radius) / fwWell)) * (1.0 - phase);
    rgb = mix(rgb, uFree, pulse);
  }
  outColor = vec4(rgb, 1.0);
}`;
  const SECTION_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in float aTop;
layout(location = 2) in vec2 aNormal;
layout(location = 3) in vec2 aSample;
layout(location = 4) in float aFault;
uniform mat4 uViewProj;
uniform vec2 uSize;
uniform float uRef;
uniform float uEx;
out vec3 vWorld;
out float vTop;
out vec2 vNormal;
out vec2 vSample;
flat out int vFault;
void main() {
  vWorld = aPos;
  vTop = aTop;
  vNormal = aNormal;
  vSample = aSample;
  vFault = int(aFault + 0.5);
  gl_Position = uViewProj * vec4(aPos.xy - 0.5 * uSize, -(aPos.z - uRef) * uEx, 1.0);
}`;
  const SECTION_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
in float vTop;
in vec2 vNormal;
in vec2 vSample;
flat in int vFault;
uniform sampler2D uData;
uniform sampler2D uStatic;
uniform vec2 uSize;
uniform vec2 uCell;
uniform ivec2 uGrid;
uniform vec3 uFree;
uniform vec3 uStructural;
uniform vec3 uResidual;
uniform vec3 uDissolved;
uniform vec3 uInk;
uniform vec3 uLeak;
uniform vec3 uAquifer;
uniform vec3 uBase;
uniform vec4 uLayers;
uniform vec3 uLeaking;
uniform float uTime;
out vec4 outColor;
void main() {
  float below = vWorld.z - vTop;
  float fw = max(fwidth(below), 1e-4);
  vec4 d;
  vec4 s;
  if (vFault > 0) {
    // Scarps show the footwall column: read that cell without blending across the fault.
    ivec2 cell = clamp(ivec2(floor(vSample / uCell)), ivec2(0), uGrid - 1);
    d = texelFetch(uData, cell, 0);
    s = texelFetch(uStatic, cell, 0);
  } else {
    d = textureLod(uData, vSample / uSize, 0.0);
    s = textureLod(uStatic, vSample / uSize, 0.0);
  }
  // Below the aquifer only on scarps whose throw exceeds the thickness.
  float H = s.b;
  vec3 rgb = below < H ? uAquifer : uBase;
  if (vFault > 0) rgb = mix(rgb, uInk, 0.28);
  if (uLayers.y > 0.5 && below < H && below > H * (1.0 - clamp(d.b, 0.0, 1.0))) rgb = mix(rgb, uDissolved, 0.55);
  if (uLayers.x > 0.5 && d.g > 0.05 && below >= d.r && below < d.g) rgb = mix(rgb, uResidual, 0.6);
  if (d.r > 0.05 && below < d.r) rgb = mix(rgb, mix(uFree, uStructural, clamp(min(d.r, s.r) / max(d.r, 1e-4), 0.0, 1.0)), 0.95);
  rgb = mix(rgb, uInk, 0.16 * (1.0 - smoothstep(0.5, 1.5, abs(below - H) / fw)));
  // A fill light from the south-east keeps both walls facing the default view readable.
  rgb *= 0.8 + 0.2 * dot(normalize(vNormal), vec2(0.447, -0.894));
  float edge = 1.0 - smoothstep(0.8, 1.8, below / fw);
  if (vFault > 0) {
    float leaking = uLeaking[vFault - 1];
    float pulse = uTime >= 0.0 ? 0.5 + 0.5 * sin(uTime * 3.6) : 1.0;
    rgb = mix(rgb, uLeak, leaking * (0.2 + 0.35 * pulse));
    rgb = mix(rgb, leaking > 0.5 ? uLeak : uInk, edge);
  } else {
    rgb = mix(rgb, uInk, 0.3 * edge);
  }
  outColor = vec4(rgb, 1.0);
}`;
  const SOLID_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec2 aNormal;
uniform mat4 uViewProj;
uniform vec2 uSize;
uniform float uRef;
uniform float uEx;
out vec2 vNormal;
void main() {
  vNormal = aNormal;
  gl_Position = uViewProj * vec4(aPos.xy - 0.5 * uSize, -(aPos.z - uRef) * uEx, 1.0);
}`;
  const SOLID_FS = `#version 300 es
precision highp float;
in vec2 vNormal;
uniform vec4 uColor;
out vec4 outColor;
void main() {
  float light = length(vNormal) > 0.5 ? 0.72 + 0.28 * dot(normalize(vNormal), vec2(-0.6, 0.8)) : 1.0;
  outColor = vec4(uColor.rgb * light, uColor.a);
}`;
  const compile = (gl, vertex, fragment) => {
    const program = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const uniforms = {};
    for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i++) {
      const name = gl.getActiveUniform(program, i).name.replace(/\[0\]$/, '');
      uniforms[name] = gl.getUniformLocation(program, gl.getActiveUniform(program, i).name);
    }
    return {
      program,
      uniforms
    };
  };

  // Well: a vertical tube from the stem top down to the base of the aquifer.
  const wellMesh = (x, y, top, bottom, radius) => {
    const segments = 20;
    const position = [];
    const normal = [];
    const index = [];
    for (let k = 0; k <= segments; k++) {
      const angle = 2 * Math.PI * k / segments;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      position.push(x + radius * c, y + radius * s, top, x + radius * c, y + radius * s, bottom);
      normal.push(c, s, c, s);
      if (k < segments) index.push(2 * k, 2 * k + 1, 2 * k + 3, 2 * k, 2 * k + 3, 2 * k + 2);
    }
    const centre = position.length / 3;
    position.push(x, y, top);
    normal.push(0, 0);
    for (let k = 0; k < segments; k++) index.push(centre, 2 * k, 2 * k + 2);
    return {
      position: Float32Array.from(position),
      normal: Float32Array.from(normal),
      index: Uint16Array.from(index)
    };
  };
  const createRenderer = canvas => {
    let gl = null;
    try {
      gl = canvas.getContext('webgl2', {
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: false
      });
    } catch (error) {
      gl = null;
    }
    if (!gl) return null;
    const programs = {
      surface: compile(gl, SURFACE_VS, SURFACE_FS),
      section: compile(gl, SECTION_VS, SECTION_FS),
      solid: compile(gl, SOLID_VS, SOLID_FS)
    };
    const makeTexture = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return texture;
    };
    const textures = {
      data: makeTexture(),
      statics: makeTexture()
    };
    const meshes = {};
    let grid = null;
    let well = null;
    const upload = (attributes, index) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buffers = attributes.map(([location, data, size]) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        return buffer;
      });
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      return {
        vao,
        buffers: [...buffers, indexBuffer],
        count: index.length,
        type: index instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT
      };
    };
    const release = mesh => {
      if (!mesh) return;
      gl.deleteVertexArray(mesh.vao);
      mesh.buffers.forEach(buffer => gl.deleteBuffer(buffer));
    };
    const fill = (texture, values) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, grid.nx, grid.ny, 0, gl.RGBA, gl.FLOAT, values);
    };
    return {
      setGeometry(geometry, view) {
        release(meshes.surface);
        release(meshes.section);
        meshes.surface = upload([[0, geometry.surface.position, 3], [1, geometry.surface.gradient, 2]], geometry.surface.index);
        const s = geometry.section;
        meshes.section = upload([[0, s.position, 3], [1, s.top, 1], [2, s.normal, 2], [3, s.sample, 2], [4, s.fault, 1]], s.index);
        grid = {
          nx: view.nx,
          ny: view.ny,
          dx: view.dx,
          dy: view.dy
        };
      },
      setStatic(values) {
        if (grid) fill(textures.statics, values);
      },
      setFrame(values) {
        if (grid) fill(textures.data, values);
      },
      // state: { cam, box, colors, layers, time, well, leaking, interval, pressure, refH, H, pixelWidth, pixelHeight }
      render(state) {
        if (!grid || !meshes.surface) return;
        const {
          cam,
          box,
          colors
        } = state;
        gl.viewport(0, 0, state.pixelWidth, state.pixelHeight);
        gl.clearColor(colors.stage[0], colors.stage[1], colors.stage[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.disable(gl.BLEND);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures.data);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures.statics);
        const layers = [state.layers.residual ? 1 : 0, state.layers.dissolved ? 1 : 0, state.layers.contours ? 1 : 0, state.layers.traps ? 1 : 0];
        const common = u => {
          gl.uniformMatrix4fv(u.uViewProj, false, cam.viewProj);
          gl.uniform2f(u.uSize, box.Lx, box.Ly);
          gl.uniform1f(u.uRef, box.zRef);
          gl.uniform1f(u.uEx, box.exaggeration);
        };
        let p = programs.surface;
        gl.useProgram(p.program);
        common(p.uniforms);
        const u = p.uniforms;
        gl.uniform1i(u.uData, 0);
        gl.uniform1i(u.uStatic, 1);
        gl.uniform2f(u.uDepthRange, state.depthRange[0], state.depthRange[1]);
        gl.uniform3fv(u.uRamp, colors.ramp.flat());
        gl.uniform3fv(u.uLight, LIGHT);
        for (const name of ['Free', 'Structural', 'Residual', 'Dissolved', 'Ink', 'ContourInk', 'Accent']) gl.uniform3fv(u[`u${name}`], colors[name[0].toLowerCase() + name.slice(1)]);
        gl.uniform1f(u.uRefH, state.refH);
        gl.uniform4fv(u.uLayers, layers);
        gl.uniform1f(u.uInterval, state.interval);
        gl.uniform1f(u.uPressure, state.pressure);
        gl.uniform3f(u.uWell, state.well.x, state.well.y, state.well.injecting ? 1 : 0);
        gl.uniform1f(u.uTime, state.time);
        gl.uniform1f(u.uHatch, state.hatch);
        const traces = state.traces.slice(0, 3);
        gl.uniform4fv(u.uTraces, [0, 1, 2].flatMap(i => traces[i] || [0, 0, 1, 0]));
        gl.uniform1i(u.uTraceCount, traces.length);
        gl.uniform3fv(u.uLeaking, [0, 1, 2].map(i => state.leaking[i] ? 1 : 0));
        gl.uniform3fv(u.uLeak, colors.leak);
        gl.bindVertexArray(meshes.surface.vao);
        gl.drawElements(gl.TRIANGLES, meshes.surface.count, meshes.surface.type, 0);
        p = programs.section;
        gl.useProgram(p.program);
        common(p.uniforms);
        const v = p.uniforms;
        gl.uniform1i(v.uData, 0);
        gl.uniform1i(v.uStatic, 1);
        gl.uniform2f(v.uCell, grid.dx, grid.dy);
        gl.uniform2i(v.uGrid, grid.nx, grid.ny);
        for (const name of ['Free', 'Structural', 'Residual', 'Dissolved', 'Ink', 'Leak', 'Aquifer', 'Base']) gl.uniform3fv(v[`u${name}`], colors[name[0].toLowerCase() + name.slice(1)]);
        gl.uniform4fv(v.uLayers, layers);
        gl.uniform3fv(v.uLeaking, [0, 1, 2].map(i => state.leaking[i] ? 1 : 0));
        gl.uniform1f(v.uTime, state.time);
        gl.bindVertexArray(meshes.section.vao);
        gl.drawElements(gl.TRIANGLES, meshes.section.count, meshes.section.type, 0);

        // Injector tube, then the part hidden by rock drawn faintly through it.
        const key = [state.well.x, state.well.y, state.well.top, state.well.bottom, state.well.radius].join();
        if (!well || well.key !== key) {
          release(well);
          const mesh = wellMesh(state.well.x, state.well.y, state.well.top, state.well.bottom, state.well.radius);
          well = {
            ...upload([[0, mesh.position, 3], [1, mesh.normal, 2]], mesh.index),
            key
          };
        }
        p = programs.solid;
        gl.useProgram(p.program);
        common(p.uniforms);
        gl.bindVertexArray(well.vao);
        gl.uniform4f(p.uniforms.uColor, colors.ink[0], colors.ink[1], colors.ink[2], 1);
        gl.drawElements(gl.TRIANGLES, well.count, well.type, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthFunc(gl.GREATER);
        gl.depthMask(false);
        gl.uniform4f(p.uniforms.uColor, colors.ink[0], colors.ink[1], colors.ink[2], 0.3);
        gl.drawElements(gl.TRIANGLES, well.count, well.type, 0);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
      },
      dispose() {
        release(meshes.surface);
        release(meshes.section);
        release(well);
        gl.deleteTexture(textures.data);
        gl.deleteTexture(textures.statics);
        Object.values(programs).forEach(p => gl.deleteProgram(p.program));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  };
  return {
    buildGeometry,
    packFrame,
    packStatic,
    sceneBox,
    toDisplay,
    cameraFor,
    project,
    pick,
    createRenderer
  };
});

// File: GuidePage.jsx
// GuidePage.jsx — Method: the equations, numerics, verification and limits of the model
// in ve2d-model.js, written to match the code exactly. Equations are typeset with KaTeX.

const SimTex = ({
  tex,
  block = false
}) => {
  const ref = useRef(null);
  const [ready, setReady] = useState(typeof window !== 'undefined' && !!window.katex);
  useEffect(() => {
    if (ready) return undefined;
    const timer = setInterval(() => {
      if (window.katex) {
        setReady(true);
        clearInterval(timer);
      }
    }, 200);
    const stop = setTimeout(() => clearInterval(timer), 8000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [ready]);
  useEffect(() => {
    if (ready && ref.current) window.katex.render(tex, ref.current, {
      displayMode: block,
      throwOnError: false
    });
  }, [ready, tex, block]);
  const Tag = block ? 'div' : 'span';
  return /*#__PURE__*/React.createElement(Tag, {
    ref: ref,
    className: block ? 'sim-eq' : undefined
  }, ready ? null : /*#__PURE__*/React.createElement("code", null, tex));
};
const SIM_METHOD_SECTIONS = [['scope', 'What the model is'], ['geometry', 'Geometry'], ['equations', 'Plume equation'], ['fluxes', 'Fluxes'], ['pressure', 'Pressure and injection'], ['edges', 'Model edges'], ['faults', 'Faults and leakage'], ['dissolution', 'Dissolution'], ['inventory', 'Traps and inventory'], ['numerics', 'Numerics'], ['verification', 'Verification'], ['limits', 'Limitations'], ['parameters', 'Parameters'], ['references', 'References']];
const GuidePage = () => {
  const d = VE2D.DEFAULTS;
  const rows = [['Permeability', 'k', `${d.permMd} mD`, 'Homogeneous'], ['Porosity', '\\phi', d.porosity, ''], ['Aquifer thickness', 'H', `${d.thickness} m`, 'Mean'], ['Thickness variation', '\\sigma_H', `${d.thicknessVar} %`, 'Log-normal, smooth along strike'], ['Residual brine saturation', 'S_{wr}', d.swr, 'co2lab Johansen example'], ['Residual CO₂ saturation', 'S_{gr}', d.sgr, 'co2lab Johansen example'], ['CO₂ relative permeability end point', 'k_{rg}^{*}', d.krg, 'Within Bennion & Bachu (2008) range'], ['CO₂ / brine density', '\\rho_g,\\ \\rho_w', `${d.rhoCo2} / ${d.rhoBrine} kg/m³`, 'About 1500 m depth'], ['CO₂ / brine viscosity', '\\mu_g,\\ \\mu_w', `${d.muCo2} / ${d.muBrine} mPa·s`, ''], ['Total compressibility', 'c_t', `${d.ct}×10⁻⁴ bar⁻¹`, 'Rock plus brine'], ['Dissolution rate', 'r_d', `${d.disRate} kg m⁻² yr⁻¹`, 'co2lab default 5×10⁻¹¹ m/s at φ = 0.2'], ['CO₂ solubility in brine', 'c_{sat}', `${d.disCap} kg/m³`, 'CO2store value used by co2lab'], ['Fault-zone width, caprock thickness', 'w,\\ L_c', '5 m, 100 m', 'Fixed']];
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-method__inner"
  }, /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Method contents"
  }, /*#__PURE__*/React.createElement("ol", null, SIM_METHOD_SECTIONS.map(([id, label]) => /*#__PURE__*/React.createElement("li", {
    key: id
  }, /*#__PURE__*/React.createElement("a", {
    href: `#m-${id}`
  }, label))))), /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement("h2", {
    id: "m-scope"
  }, "What the model is"), /*#__PURE__*/React.createElement("p", null, "This is an educational model of CO\u2082 storage in a confined saline aquifer, built on the vertical-equilibrium (VE) approximation used by MRST's co2lab. It runs in your browser in about a second, so the inputs can be explored freely. It is not a substitute for a field study: the aquifer is homogeneous, the fluids have constant properties and the caprock is a perfect seal except at faults."), /*#__PURE__*/React.createElement("p", null, "All quantities are in SI units inside the model; the interface shows megatonnes, millidarcies, metres, kilometres, bar and years. One run drives every view: the map, the 3D block, the section, the charts and the uncertainty study all read the same result."), /*#__PURE__*/React.createElement("h2", {
    id: "m-geometry"
  }, "Geometry"), /*#__PURE__*/React.createElement("p", null, "The aquifer covers 20 \xD7 12 km on a Cartesian grid of 500, 250 or 167 m cells. Its top surface, the base of the caprock, is an analytic depth field ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "z_t(x,y)"
  }), " (positive down) made of a regional dip plane, Gaussian domes elongated along the regional strike, caprock roughness and normal faults. The roughness is an anisotropic Gaussian random field with a self-affine spectrum (Hurst exponent 0.8, wavelengths from 8 km down to 500 m), stretched 2.5 times along strike and built as a sum of random Fourier modes; the roughness input is its RMS height. A fault's throw is largest at mid-length and zero at the tips. Facing along strike, the hanging wall is on the right: it drops by 70 % of the throw while the footwall rises by 30 %, both decaying away from the fault over a fifth of its length, so a footwall crest closes against its fault. The aquifer thickness varies around its mean ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "H"
  }), " by a log-normal factor ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "e^{\\sigma_H G - \\sigma_H^2/2}"
  }), " of a smoother random field ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "G"
  }), " (Hurst exponent 0.9, wavelengths from 12 km down to 1.5 km, stretched twice along strike like sand belts), so the mean is kept and the thickness stays positive. Every column holds CO\u2082 down to its own base: thickness enters the fluxes, the storage term of the pressure equation, trap capacity, dissolution and leakage cell by cell."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "New random structure"), " draws one of three settings so that dip, folds, faults and fault rock agree. Tilted fault blocks: two or three synthetic normal faults with a common strike and beds dipping away from them, with the injector down-dip of a footwall crest. Faulted dome: a closure elongated along strike, cut by small crestal faults whose hanging walls face the crest, with the injector on its down-dip flank. Undulating homocline: a steeper dip with 8\u201318 m of RMS roughness and at most one small fault. Each setting also varies the thickness, by 10 to 45 %. Throw grows with fault length, ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "D = \\gamma L"
  }), " with ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\gamma"
  }), " between 0.002 and 0.015. Each fault's shale gouge ratio sets its rock: permeability and thickness (throw / 66) after Manzocchi et al. (1999) give the cross-fault multiplier for 250 m cells, and the calibration of Bretan et al. (2003) gives the CO\u2082 column the fault holds. About one fault in three is a vertical conduit."), /*#__PURE__*/React.createElement("h2", {
    id: "m-equations"
  }, "Plume equation"), /*#__PURE__*/React.createElement("p", null, "Under vertical equilibrium, buoyancy separates CO\u2082 from brine much faster than the plume spreads, so each column holds a mobile CO\u2082 layer of thickness ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "h"
  }), " under the caprock, a residual zone down to the deepest interface reached so far, ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "h_{\\max}"
  }), ", and brine below. The CO\u2082 volume per unit area is"), /*#__PURE__*/React.createElement(SimTex, {
    block: true,
    tex: "s = \\phi\\left[(1-S_{wr})\\,h + S_{gr}\\,(h_{\\max}-h)\\right]"
  }), /*#__PURE__*/React.createElement("p", null, "and conservation of CO\u2082 is"), /*#__PURE__*/React.createElement(SimTex, {
    block: true,
    tex: "\\frac{\\partial s}{\\partial t} + \\nabla\\cdot\\mathbf{u}_g = \\frac{q}{\\rho_g\\,A}\\,\\delta_{\\text{well}} - \\text{leakage} - \\text{dissolution}"
  }), /*#__PURE__*/React.createElement("p", null, "Draining (h rising to a new maximum) and imbibition (h falling) store different volumes per metre of interface movement, ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\phi(1-S_{wr})"
  }), " and ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\phi(1-S_{wr}-S_{gr})"
  }), ". The difference is the residual CO\u2082 left behind, so residual trapping follows from the history of each column rather than from a rule of thumb."), /*#__PURE__*/React.createElement("h2", {
    id: "m-fluxes"
  }, "Fluxes"), /*#__PURE__*/React.createElement("p", null, "With brine potential ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\Phi_w"
  }), " and interface depth ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\zeta = z_t + h"
  }), ", the CO\u2082 potential is ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\Phi_g = \\Phi_w + \\Delta\\rho\\, g\\, \\zeta"
  }), ". Writing the vertically integrated mobilities as ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\Lambda_g = k\\,k_{rg}^{*} h/\\mu_g"
  }), " and ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\Lambda_w = k\\,(H-h)/\\mu_w"
  }), ", the CO\u2082 flux splits into a part carried by the total flux ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\mathbf{u}_T"
  }), " and a buoyant counter-current part:"), /*#__PURE__*/React.createElement(SimTex, {
    block: true,
    tex: "\\mathbf{u}_g = \\frac{\\Lambda_g}{\\Lambda_g+\\Lambda_w}\\,\\mathbf{u}_T \\;-\\; \\frac{\\Lambda_g\\Lambda_w}{\\Lambda_g+\\Lambda_w}\\,\\Delta\\rho\\, g\\,\\nabla\\zeta"
  }), /*#__PURE__*/React.createElement("p", null, "The first term carries CO\u2082 away from the injector; the second drives it up-dip and spreads it, faster where the plume is thick. Both are evaluated on cell faces (two-point flux approximation). The viscous term is upwinded by the direction of the total flux and the buoyant term by the phase potentials (hybrid upwinding, Lee, Efendiev and Tchelepi 2015). The interface depth uses the mobile thickness ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "h"
  }), ", not the residual zone, which carries no CO\u2082 head."), /*#__PURE__*/React.createElement("h2", {
    id: "m-pressure"
  }, "Pressure and injection"), /*#__PURE__*/React.createElement("p", null, "While injecting, and until the pressure transient has died away, the total flux comes from a backward-Euler pressure equation with total compressibility:"), /*#__PURE__*/React.createElement(SimTex, {
    block: true,
    tex: "\\phi\\, c_t\\, H\\,\\frac{\\partial \\Phi_w}{\\partial t} - \\nabla\\cdot\\big(\\Lambda_T \\nabla\\Phi_w\\big) = \\frac{q}{\\rho_g}\\,\\delta_{\\text{well}} + \\nabla\\cdot\\big(\\Lambda_g\\,\\Delta\\rho\\, g\\,\\nabla\\zeta\\big)"
  }), /*#__PURE__*/React.createElement("p", null, "It is solved matrix-free with Jacobi-preconditioned conjugate gradients every few weeks to half a year of model time. Once the pressure changes by less than 0.05 bar per year after injection, the total flux is set to zero: the classic gravity-current regime. The bottom-hole build-up shown in the outcomes adds Peaceman's well-block correction, ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\Delta p_{bh} = \\Delta p_{\\text{block}} + \\frac{q_v}{2\\pi\\,\\Lambda_T}\\ln\\frac{0.2\\,\\Delta x}{r_w}"
  }), ", with the volumetric rate ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "q_v"
  }), ", the well-cell total mobility ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\Lambda_T = \\Lambda_g + \\Lambda_w"
  }), " and ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "r_w = 0.1"
  }), " m. It is compared with a typical fracture margin of 0.055 bar per metre of depth."), /*#__PURE__*/React.createElement("h2", {
    id: "m-edges"
  }, "Model edges"), /*#__PURE__*/React.createElement("p", null, "Open edges connect to a hydrostatic aquifer beyond the model: the ghost cell holds brine at hydrostatic pressure and no CO\u2082. CO\u2082 leaves only where its own potential drops outward, so it leaves up-dip edges and stays at down-dip ones. What leaves is reported as \"Left the model\", never as leakage. Closed edges are sealed: nothing crosses them and injection raises the pressure of the whole compartment."), /*#__PURE__*/React.createElement("h2", {
    id: "m-faults"
  }, "Faults and leakage"), /*#__PURE__*/React.createElement("p", null, "A face crossed by a fault trace gets a transmissibility multiplier equal to the fault's cross-fault transmissibility times the fraction of the aquifer still in contact across the throw,", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\max(0, 1 - \\text{throw}/H)"
  }), ". A fault with a throw larger than the aquifer is therefore sealing whatever its rock properties."), /*#__PURE__*/React.createElement("p", null, "A fault zone with permeability ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "k_f > 0"
  }), " leaks vertically once the CO\u2082 column against it exceeds its seal capacity ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "h_{th}"
  }), ", the column whose buoyancy overcomes the zone's capillary entry pressure. The leak rate from a cell crossed by a length ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "L"
  }), " of fault is"), /*#__PURE__*/React.createElement(SimTex, {
    block: true,
    tex: "Q_{\\text{leak}} = L\\,w\\,\\frac{k_f\\,k_{rg}^{*}}{\\mu_g}\\,\\Delta\\rho\\, g\\left[\\frac{h-h_{th}}{L_c} + 1\\right], \\qquad h > h_{th}"
  }), /*#__PURE__*/React.createElement("p", null, "limited so that leakage never takes the column below ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "h_{th}"
  }), ". Using the trace length inside each cell keeps the leak per metre of fault independent of the grid."), /*#__PURE__*/React.createElement("h2", {
    id: "m-dissolution"
  }, "Dissolution"), /*#__PURE__*/React.createElement("p", null, "CO\u2082 dissolves into the brine below the plume at a constant convective rate ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "r_d"
  }), " per unit area until the brine column is saturated at ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "c_{sat}\\,\\phi\\,H"
  }), ". Dissolution takes mobile CO\u2082 first and then residual CO\u2082. Dissolved CO\u2082 is assumed to stay where it dissolved."), /*#__PURE__*/React.createElement("h2", {
    id: "m-inventory"
  }, "Traps and inventory"), /*#__PURE__*/React.createElement("p", null, "Structural traps come from a spill-point analysis of the caprock (priority flood, Barnes et al. 2014) with the model edge as the spill path, as in co2lab's trap analysis; sealing faults bound traps, and compartments closed by faults never spill. Every kilogram injected is in exactly one of six classes:"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Structurally trapped"), ": mobile CO\u2082 above the local spill depth."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Free plume"), ": the rest of the mobile CO\u2082."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Residually trapped"), ": ", /*#__PURE__*/React.createElement(SimTex, {
    tex: "\\rho_g\\,\\phi\\,S_{gr}(h_{\\max}-h)"
  }), " per unit area."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Dissolved"), ", ", /*#__PURE__*/React.createElement("strong", null, "Left the model"), " and ", /*#__PURE__*/React.createElement("strong", null, "Leaked through faults"), ": cumulative totals.")), /*#__PURE__*/React.createElement("p", null, "The outcomes show the mass-balance error, injected minus the six classes, at every year."), /*#__PURE__*/React.createElement("h2", {
    id: "m-numerics"
  }, "Numerics"), /*#__PURE__*/React.createElement("p", null, "Transport is explicit with an adaptive time step: the step is limited so that no cell can change by more than 40 % of its imbibition storage, using bounds on the derivatives of every face flux; a step that would empty a column is shortened rather than clipped, so no mass is ever deleted. One step may add at most a quarter of the injector cell's pore volume. Leakage and dissolution are applied after each transport step. Films thinner than a micrometre do not move."), /*#__PURE__*/React.createElement("h2", {
    id: "m-verification"
  }, "Verification"), /*#__PURE__*/React.createElement("p", null, "The engine is tested in Node on every change. The current results:"), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Check"), /*#__PURE__*/React.createElement("th", null, "Result"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Mass balance over 1000 years, default scenario"), /*#__PURE__*/React.createElement("td", null, "Worst relative error 9\xD710\u207B\xB9\xB3 (250 m grid)")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Closed aquifer: mean build-up vs injected volume / (\u03C6 c", /*#__PURE__*/React.createElement("sub", null, "t"), " V)"), /*#__PURE__*/React.createElement("td", null, "178.6 bar, error below 0.01 %")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Injection without buoyancy vs Nordbotten and Celia (2006)"), /*#__PURE__*/React.createElement("td", null, "Volume-weighted plume radius +7.5 % after 30 years (167 m grid)")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Thin plume on a 1\xB0 slope vs buoyant Darcy speed"), /*#__PURE__*/React.createElement("td", null, "56.1 vs 58.1 m/yr (\u22123.4 %)")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Grid convergence, 250 m vs 167 m, year 1000"), /*#__PURE__*/React.createElement("td", null, "Footprint +1.1 %, leaked 4.68 % vs 4.55 % of injected")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Symmetry, bounds, sealing faults, seal capacity, solubility cap, outflow direction"), /*#__PURE__*/React.createElement("td", null, "Pass")))), /*#__PURE__*/React.createElement("h2", {
    id: "m-limits"
  }, "Limitations"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Sharp interface: no capillary fringe, so very thin plumes are idealised."), /*#__PURE__*/React.createElement("li", null, "Constant fluid densities and viscosities; no CO\u2082 compressibility, temperature or composition effects."), /*#__PURE__*/React.createElement("li", null, "Homogeneous permeability; no layering inside the aquifer."), /*#__PURE__*/React.createElement("li", null, "Brine mobility in the residual zone is not reduced; dissolved CO\u2082 does not migrate."), /*#__PURE__*/React.createElement("li", null, "After injection the total flux is set to zero once the pressure has relaxed."), /*#__PURE__*/React.createElement("li", null, "No geomechanics: the fracture margin is a guide, not a calculation.")), /*#__PURE__*/React.createElement("h2", {
    id: "m-parameters"
  }, "Parameters"), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Parameter"), /*#__PURE__*/React.createElement("th", null, "Symbol"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Source or note"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(([name, symbol, value, note]) => /*#__PURE__*/React.createElement("tr", {
    key: name
  }, /*#__PURE__*/React.createElement("td", null, name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(SimTex, {
    tex: symbol
  })), /*#__PURE__*/React.createElement("td", null, value), /*#__PURE__*/React.createElement("td", null, note))))), /*#__PURE__*/React.createElement("h2", {
    id: "m-references"
  }, "References"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Barnes, Lehman and Mulla (2014). Priority-flood: an optimal depression-filling algorithm. ", /*#__PURE__*/React.createElement("em", null, "Computers & Geosciences"), " 62."), /*#__PURE__*/React.createElement("li", null, "Bennion and Bachu (2008). Drainage and imbibition relative permeability relationships for supercritical CO\u2082/brine. ", /*#__PURE__*/React.createElement("em", null, "SPE Reservoir Evaluation & Engineering"), " 11(3)."), /*#__PURE__*/React.createElement("li", null, "Bretan, Yielding and Jones (2003). Using calibrated shale gouge ratio to estimate hydrocarbon column heights. ", /*#__PURE__*/React.createElement("em", null, "AAPG Bulletin"), " 87(3)."), /*#__PURE__*/React.createElement("li", null, "Gasda, Nordbotten and Celia (2009). Vertical equilibrium with sub-scale analytical methods for geological CO\u2082 sequestration. ", /*#__PURE__*/React.createElement("em", null, "Computational Geosciences"), " 13."), /*#__PURE__*/React.createElement("li", null, "Hesse, Orr and Tchelepi (2008). Gravity currents with residual trapping. ", /*#__PURE__*/React.createElement("em", null, "Journal of Fluid Mechanics"), " 611."), /*#__PURE__*/React.createElement("li", null, "Kim and Sanderson (2005). The relationship between displacement and length of faults: a review. ", /*#__PURE__*/React.createElement("em", null, "Earth-Science Reviews"), " 68."), /*#__PURE__*/React.createElement("li", null, "Lee, Efendiev and Tchelepi (2015). Hybrid upwind discretization of nonlinear two-phase flow with gravity. ", /*#__PURE__*/React.createElement("em", null, "Advances in Water Resources"), " 82."), /*#__PURE__*/React.createElement("li", null, "MacMinn, Szulczewski and Juanes (2011). CO\u2082 migration in saline aquifers. Part 2: capillary and solubility trapping. ", /*#__PURE__*/React.createElement("em", null, "Journal of Fluid Mechanics"), " 688."), /*#__PURE__*/React.createElement("li", null, "Manzocchi, Walsh, Nell and Yielding (1999). Fault transmissibility multipliers for flow simulation models. ", /*#__PURE__*/React.createElement("em", null, "Petroleum Geoscience"), " 5."), /*#__PURE__*/React.createElement("li", null, "Neufeld et al. (2010). Convective dissolution of carbon dioxide in saline aquifers. ", /*#__PURE__*/React.createElement("em", null, "Geophysical Research Letters"), " 37."), /*#__PURE__*/React.createElement("li", null, "Nilsen, Lie and Andersen (2016). Fully-implicit simulation of vertical-equilibrium models with hysteresis and capillary fringe. ", /*#__PURE__*/React.createElement("em", null, "Computational Geosciences"), " 20."), /*#__PURE__*/React.createElement("li", null, "Nordbotten and Celia (2006). Similarity solutions for fluid injection into confined aquifers. ", /*#__PURE__*/React.createElement("em", null, "Journal of Fluid Mechanics"), " 561."), /*#__PURE__*/React.createElement("li", null, "Nordbotten and Celia (2012). ", /*#__PURE__*/React.createElement("em", null, "Geological Storage of CO\u2082: Modeling Approaches for Large-Scale Simulation"), ". Wiley."), /*#__PURE__*/React.createElement("li", null, "Peaceman (1978). Interpretation of well-block pressures in numerical reservoir simulation. ", /*#__PURE__*/React.createElement("em", null, "SPE Journal"), " 18(3)."))));
};
Object.assign(window, {
  GuidePage
});

// File: SimCharts.jsx
// SimCharts.jsx — SVG charts for the CO2 simulator: inventory through time and the
// uncertainty histogram, tornado and run scatter. Colours come from CSS tokens.

const simNiceStep = (span, target) => {
  const raw = span / Math.max(1, target);
  const power = 10 ** Math.floor(Math.log10(raw || 1));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
};
const simTicks = (min, max, target = 4) => {
  const step = simNiceStep(max - min, target);
  const ticks = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(+v.toPrecision(12));
  return ticks;
};

// Measure the chart container so SVG text is drawn at its real pixel size.
const simUseWidth = fallback => {
  const [element, setElement] = useState(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    if (!element) return undefined;
    const update = () => setWidth(Math.max(220, Math.round(element.clientWidth) || fallback));
    update();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [element]);
  return [setElement, width];
};
const simUseHover = () => {
  const [hover, setHover] = useState(null);
  const onMove = (event, width, height) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHover({
      x: (event.clientX - rect.left) * width / rect.width,
      y: (event.clientY - rect.top) * height / rect.height,
      px: event.clientX - rect.left,
      py: event.clientY - rect.top,
      rectWidth: rect.width
    });
  };
  return [hover, onMove, () => setHover(null)];
};

// Stacked area of the six inventory classes with the injected total as a dashed line:
// the top of the stack meeting the dashed line is the visible mass balance.
const SimInventoryChart = ({
  history,
  year,
  years,
  injYears,
  onSeek
}) => {
  const [chartRef, W] = simUseWidth(300);
  const H = 176;
  const m = {
    left: 34,
    right: 8,
    top: 8,
    bottom: 22
  };
  const [hover, onMove, onLeave] = simUseHover();
  const geometry = useMemo(() => {
    if (!history || history.length < 2) return null;
    const maxMass = Math.max(1, ...history.map(row => row.injected)) / 1e9;
    const yTicks = simTicks(0, maxMass, 3);
    const top = Math.max(maxMass, yTicks.at(-1));
    const x = t => m.left + (W - m.left - m.right) * t / years;
    const y = mass => H - m.bottom - (H - m.top - m.bottom) * mass / top;
    const stride = Math.max(1, Math.ceil(history.length / 260));
    const rows = history.filter((_, i) => i % stride === 0 || i === history.length - 1);
    const layers = [];
    const base = rows.map(() => 0);
    for (const item of SIM_INVENTORY) {
      const upper = rows.map((row, i) => base[i] + row[item.key] / 1e9);
      const path = `M${rows.map((row, i) => `${x(row.year).toFixed(1)},${y(upper[i]).toFixed(1)}`).join('L')}` + `L${rows.slice().reverse().map((row, k) => {
        const i = rows.length - 1 - k;
        return `${x(row.year).toFixed(1)},${y(base[i]).toFixed(1)}`;
      }).join('L')}Z`;
      layers.push({
        ...item,
        path
      });
      upper.forEach((value, i) => {
        base[i] = value;
      });
    }
    const injected = `M${rows.map(row => `${x(row.year).toFixed(1)},${y(row.injected / 1e9).toFixed(1)}`).join('L')}`;
    return {
      layers,
      injected,
      x,
      y,
      yTicks,
      top
    };
  }, [history, years, W]);
  if (!geometry) return /*#__PURE__*/React.createElement("div", {
    className: "sim-field__hint",
    ref: chartRef
  }, "The chart appears as the run progresses.");
  const {
    layers,
    injected,
    x,
    y,
    yTicks
  } = geometry;
  const hoverYear = hover ? Math.max(0, Math.min(history.at(-1).year, Math.round((hover.x - m.left) / (W - m.left - m.right) * years))) : null;
  const hoverRow = hoverYear !== null ? history[Math.min(history.length - 1, hoverYear)] : null;
  const xTicks = [0, Math.round(years / 2), years];
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-chart",
    ref: chartRef
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    role: "img",
    "aria-label": "Stacked CO\u2082 inventory in megatonnes through time, with the injected total as a dashed line",
    onPointerMove: event => onMove(event, W, H),
    onPointerLeave: onLeave,
    onClick: () => hoverYear !== null && onSeek(hoverYear),
    style: {
      cursor: 'crosshair'
    }
  }, yTicks.map(t => /*#__PURE__*/React.createElement("g", {
    key: t
  }, /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__grid",
    x1: m.left,
    x2: W - m.right,
    y1: y(t),
    y2: y(t)
  }), /*#__PURE__*/React.createElement("text", {
    x: m.left - 6,
    y: y(t) + 4,
    textAnchor: "end"
  }, t))), /*#__PURE__*/React.createElement("text", {
    x: 4,
    y: m.top + 4
  }, "Mt"), /*#__PURE__*/React.createElement("rect", {
    x: x(0),
    y: m.top,
    width: x(injYears) - x(0),
    height: H - m.top - m.bottom,
    fill: "var(--sim-accent-soft)"
  }), layers.map(layer => /*#__PURE__*/React.createElement("path", {
    key: layer.key,
    d: layer.path,
    fill: `var(${layer.color})`,
    stroke: "var(--sim-surface)",
    strokeWidth: "0.75"
  })), /*#__PURE__*/React.createElement("path", {
    className: "sim-chart__injected",
    d: injected
  }), /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__axis",
    x1: m.left,
    x2: W - m.right,
    y1: H - m.bottom,
    y2: H - m.bottom
  }), xTicks.map(t => /*#__PURE__*/React.createElement("text", {
    key: t,
    x: x(t),
    y: H - 6,
    textAnchor: t === 0 ? 'start' : t === years ? 'end' : 'middle'
  }, t === years ? `${t} yr` : t)), /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__cursor",
    x1: x(year),
    x2: x(year),
    y1: m.top,
    y2: H - m.bottom
  }), hoverRow && /*#__PURE__*/React.createElement("line", {
    x1: x(hoverRow.year),
    x2: x(hoverRow.year),
    y1: m.top,
    y2: H - m.bottom,
    stroke: "var(--sim-ink-muted)",
    strokeDasharray: "2 2"
  })), hoverRow && /*#__PURE__*/React.createElement("div", {
    className: "sim-tooltip",
    style: {
      left: Math.min(hover.px + 12, hover.rectWidth - 180),
      top: 4
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Year ", hoverRow.year), SIM_INVENTORY.slice().reverse().map(item => /*#__PURE__*/React.createElement("div", {
    key: item.key
  }, /*#__PURE__*/React.createElement("span", {
    className: "sim-swatch",
    style: {
      '--swatch': `var(${item.color})`
    }
  }), /*#__PURE__*/React.createElement("span", null, item.label), /*#__PURE__*/React.createElement("span", null, simFormatMass(hoverRow[item.key])))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "sim-swatch sim-swatch--dash",
    style: {
      '--swatch': 'var(--sim-ink)'
    }
  }), /*#__PURE__*/React.createElement("span", null, "Injected"), /*#__PURE__*/React.createElement("span", null, simFormatMass(hoverRow.injected)))), /*#__PURE__*/React.createElement("details", {
    className: "sim-table-toggle"
  }, /*#__PURE__*/React.createElement("summary", null, "Show as a table"), /*#__PURE__*/React.createElement("table", {
    className: "sim-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Year"), SIM_INVENTORY.map(item => /*#__PURE__*/React.createElement("th", {
    key: item.key,
    title: item.label
  }, item.label.split(' ')[0])))), /*#__PURE__*/React.createElement("tbody", null, history.filter(row => row.year % Math.max(50, Math.round(years / 10)) === 0).map(row => /*#__PURE__*/React.createElement("tr", {
    key: row.year
  }, /*#__PURE__*/React.createElement("td", null, row.year), SIM_INVENTORY.map(item => /*#__PURE__*/React.createElement("td", {
    key: item.key
  }, (row[item.key] / 1e9).toFixed(2)))))))));
};
const SimHistogram = ({
  values,
  unit,
  digits
}) => {
  const [chartRef, W] = simUseWidth(420);
  const H = 210;
  const m = {
    left: 36,
    right: 10,
    top: 18,
    bottom: 30
  };
  const sorted = values.slice().sort((a, b) => a - b);
  const lo = sorted[0];
  const hi = sorted.at(-1);
  const span = hi - lo || Math.max(1, Math.abs(hi) * 0.1);
  const binCount = Math.max(5, Math.min(24, Math.round(Math.sqrt(values.length) * 1.5)));
  const width = span / binCount;
  const bins = Array.from({
    length: binCount
  }, (_, i) => ({
    from: lo + i * width,
    count: 0
  }));
  for (const v of values) bins[Math.min(binCount - 1, Math.floor((v - lo) / width))].count++;
  const maxCount = Math.max(...bins.map(b => b.count));
  const x = v => m.left + (W - m.left - m.right) * (v - lo) / (binCount * width);
  const y = c => H - m.bottom - (H - m.top - m.bottom) * c / maxCount;
  const marks = [['P10', 0.1], ['P50', 0.5], ['P90', 0.9]].map(([label, p]) => ({
    label,
    value: simPercentile(sorted, p)
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-chart",
    ref: chartRef
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    role: "img",
    "aria-label": `Histogram of ${values.length} runs with P10 ${simFormatNumber(marks[0].value, digits)}, P50 ${simFormatNumber(marks[1].value, digits)} and P90 ${simFormatNumber(marks[2].value, digits)} ${unit}`
  }, simTicks(0, maxCount, 3).map(t => /*#__PURE__*/React.createElement("g", {
    key: t
  }, /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__grid",
    x1: m.left,
    x2: W - m.right,
    y1: y(t),
    y2: y(t)
  }), /*#__PURE__*/React.createElement("text", {
    x: m.left - 6,
    y: y(t) + 4,
    textAnchor: "end"
  }, t))), bins.map((bin, i) => bin.count > 0 && /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: x(bin.from) + 1,
    y: y(bin.count),
    width: Math.max(1, x(bin.from + width) - x(bin.from) - 2),
    height: H - m.bottom - y(bin.count),
    rx: "2",
    fill: "var(--sim-c-free)"
  })), marks.map(mark => /*#__PURE__*/React.createElement("g", {
    key: mark.label
  }, /*#__PURE__*/React.createElement("line", {
    x1: x(mark.value),
    x2: x(mark.value),
    y1: m.top - 4,
    y2: H - m.bottom,
    stroke: "var(--sim-ink)",
    strokeWidth: "1.5",
    strokeDasharray: mark.label === 'P50' ? undefined : '3 3'
  }), /*#__PURE__*/React.createElement("text", {
    x: x(mark.value),
    y: m.top - 7,
    textAnchor: "middle",
    style: {
      fill: 'var(--sim-ink)'
    }
  }, mark.label))), /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__axis",
    x1: m.left,
    x2: W - m.right,
    y1: H - m.bottom,
    y2: H - m.bottom
  }), /*#__PURE__*/React.createElement("text", {
    x: m.left,
    y: H - 10,
    textAnchor: "start"
  }, simFormatNumber(lo, digits)), /*#__PURE__*/React.createElement("text", {
    x: W - m.right,
    y: H - 10,
    textAnchor: "end"
  }, simFormatNumber(hi, digits), " ", unit), /*#__PURE__*/React.createElement("text", {
    x: (m.left + W - m.right) / 2,
    y: H - 10,
    textAnchor: "middle"
  }, "runs per bin")));
};
const SimTornado = ({
  items
}) => {
  const shown = items.slice(0, 8);
  const [chartRef, W] = simUseWidth(420);
  const row = 26;
  const H = shown.length * row + 26;
  const left = Math.min(190, W * 0.42);
  const mid = left + (W - left - 40) / 2;
  const half = (W - left - 40) / 2;
  if (!shown.length) return /*#__PURE__*/React.createElement("p", {
    className: "sim-field__hint",
    ref: chartRef
  }, "Vary at least one input to see its influence.");
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-chart",
    ref: chartRef
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    role: "img",
    "aria-label": `Rank correlations: ${shown.map(item => `${item.label} ${item.rho.toFixed(2)}`).join(', ')}`
  }, /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__axis",
    x1: mid,
    x2: mid,
    y1: 4,
    y2: H - 20
  }), shown.map((item, i) => {
    const yy = 6 + i * row;
    const w = half * Math.abs(item.rho);
    return /*#__PURE__*/React.createElement("g", {
      key: item.key
    }, /*#__PURE__*/React.createElement("text", {
      x: left - 8,
      y: yy + 14,
      textAnchor: "end",
      style: {
        fill: 'var(--sim-ink)'
      }
    }, item.label), /*#__PURE__*/React.createElement("rect", {
      x: item.rho >= 0 ? mid : mid - w,
      y: yy + 3,
      width: Math.max(1, w),
      height: row - 10,
      rx: "3",
      fill: item.rho >= 0 ? 'var(--sim-c-structural)' : 'var(--sim-c-dissolved)'
    }), /*#__PURE__*/React.createElement("text", {
      x: item.rho >= 0 ? mid + w + 4 : mid - w - 4,
      y: yy + 14,
      textAnchor: item.rho >= 0 ? 'start' : 'end'
    }, item.rho.toFixed(2)));
  }), /*#__PURE__*/React.createElement("text", {
    x: mid - half,
    y: H - 4,
    textAnchor: "start"
  }, "\u22121 lowers it"), /*#__PURE__*/React.createElement("text", {
    x: mid + half,
    y: H - 4,
    textAnchor: "end"
  }, "raises it +1")));
};
const simAxisNumber = value => simFormatNumber(value, Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 1 ? 2 : 3);
const SimScatter = ({
  points,
  xLabel,
  yLabel,
  log,
  onSelect
}) => {
  const [chartRef, W] = simUseWidth(760);
  const H = 280;
  const m = {
    left: 52,
    right: 14,
    top: 12,
    bottom: 40
  };
  const [active, setActive] = useState(null);
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const tx = v => log ? Math.log10(v) : v;
  const xMin = Math.min(...xs.map(tx));
  const xMax = Math.max(...xs.map(tx));
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(...ys) || 1;
  const x = v => m.left + (W - m.left - m.right) * (tx(v) - xMin) / (xMax - xMin || 1);
  const y = v => H - m.bottom - (H - m.top - m.bottom) * (v - yMin) / (yMax - yMin || 1);
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-chart",
    ref: chartRef
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    role: "group",
    "aria-label": `${yLabel} against ${xLabel} for each run`
  }, simTicks(yMin, yMax, 4).map(t => /*#__PURE__*/React.createElement("g", {
    key: t
  }, /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__grid",
    x1: m.left,
    x2: W - m.right,
    y1: y(t),
    y2: y(t)
  }), /*#__PURE__*/React.createElement("text", {
    x: m.left - 6,
    y: y(t) + 4,
    textAnchor: "end"
  }, simFormatNumber(t, t < 10 ? 1 : 0)))), /*#__PURE__*/React.createElement("line", {
    className: "sim-chart__axis",
    x1: m.left,
    x2: W - m.right,
    y1: H - m.bottom,
    y2: H - m.bottom
  }), /*#__PURE__*/React.createElement("text", {
    x: m.left,
    y: H - 20
  }, simAxisNumber(log ? 10 ** xMin : xMin)), /*#__PURE__*/React.createElement("text", {
    x: W - m.right,
    y: H - 20,
    textAnchor: "end"
  }, simAxisNumber(log ? 10 ** xMax : xMax)), /*#__PURE__*/React.createElement("text", {
    x: (m.left + W - m.right) / 2,
    y: H - 6,
    textAnchor: "middle"
  }, xLabel, log ? ' (log scale)' : ''), points.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: x(p.x),
    cy: y(p.y),
    r: active === i ? 7 : 5,
    fill: "var(--sim-c-free)",
    stroke: "var(--sim-surface)",
    strokeWidth: "2",
    tabIndex: 0,
    role: "button",
    "aria-label": `Open run ${i + 1}: ${xLabel} ${simFormatNumber(p.x, 2)}, ${yLabel} ${simFormatNumber(p.y, 2)}`,
    style: {
      cursor: 'pointer',
      transition: 'r 120ms'
    },
    onPointerEnter: () => setActive(i),
    onPointerLeave: () => setActive(null),
    onFocus: () => setActive(i),
    onBlur: () => setActive(null),
    onClick: () => onSelect(p),
    onKeyDown: event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(p);
      }
    }
  })), active !== null && /*#__PURE__*/React.createElement("text", {
    x: Math.min(W - 140, x(points[active].x) + 10),
    y: Math.max(16, y(points[active].y) - 10),
    style: {
      fill: 'var(--sim-ink)'
    }
  }, `${simFormatNumber(points[active].x, 2)} → ${simFormatNumber(points[active].y, 2)}`)));
};

// File: SimViews.jsx
// SimViews.jsx — the three synchronised views of one VE run: structure map (canvas),
// 3D block diagram (WebGL, sim-block3d.js) and vertical section (SVG), plus legend, layer
// menu, readout and the data-driven motion layer (flow particles, injection pulse, leak beacons).

const SIM_CAPROCK_DRAWN = 40;
const simParseColor = color => {
  const text = String(color).trim();
  if (text.startsWith('#')) {
    const hex = text.length === 4 ? text.slice(1).split('').map(c => c + c).join('') : text.slice(1, 7);
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  const match = text.match(/rgba?\(([^)]+)\)/);
  if (match) return match[1].split(',').slice(0, 3).map(v => parseFloat(v));
  return [128, 128, 128];
};
const simMixRgb = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const simRgba = (rgb, alpha = 1) => `rgba(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])},${alpha})`;

// Single-hue indigo ramp, 0 = shallow (light) to 1 = deep (dark), identical in every view.
const simDepthColor = (stops, t) => {
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return simMixRgb(stops[i], stops[i + 1], x - i);
};
const simUseSize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });
  useEffect(() => {
    const element = ref.current?.parentElement;
    if (!element) return undefined;
    const update = () => setSize({
      width: element.clientWidth,
      height: element.clientHeight
    });
    update();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);
  return [ref, size];
};
const simPrepareCanvas = (canvas, width, height) => {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};

// Join marching-squares segments into polylines (for smooth strokes and labels).
const simChainSegments = segments => {
  const key = (x, y) => `${Math.round(x * 1e4)},${Math.round(y * 1e4)}`;
  const ends = new Map();
  const count = segments.length / 4;
  const used = new Uint8Array(count);
  for (let s = 0; s < count; s++) {
    for (const end of [0, 1]) {
      const k = key(segments[4 * s + 2 * end], segments[4 * s + 2 * end + 1]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(s);
    }
  }
  const lines = [];
  for (let s = 0; s < count; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const points = [segments[4 * s], segments[4 * s + 1], segments[4 * s + 2], segments[4 * s + 3]];
    for (const forward of [true, false]) {
      for (;;) {
        const x = forward ? points[points.length - 2] : points[0];
        const y = forward ? points[points.length - 1] : points[1];
        const next = (ends.get(key(x, y)) || []).find(t => !used[t]);
        if (next === undefined) break;
        used[next] = 1;
        const a = [segments[4 * next], segments[4 * next + 1]];
        const b = [segments[4 * next + 2], segments[4 * next + 3]];
        const sameA = key(a[0], a[1]) === key(x, y);
        const other = sameA ? b : a;
        if (forward) points.push(other[0], other[1]);else points.unshift(other[0], other[1]);
      }
    }
    lines.push(points);
  }
  return lines;
};
const simContourInterval = span => {
  for (const step of [2, 5, 10, 20, 25, 50, 100]) if (span / step <= 14) return step;
  return 200;
};

// Hanging-wall side of a fault (to the right of strike), as in the engine.
const simFaultNormal = fault => {
  const strike = fault.strike * Math.PI / 180;
  return [Math.cos(strike), -Math.sin(strike)];
};

// Fault-aware bilinear sampling of a cell field: neighbours across a fault are ignored,
// so a sealing fault keeps a sharp edge instead of smearing the plume across it.
const simSampleField = (model, values, x, y) => {
  const {
    nx,
    ny,
    dx,
    dy,
    faultLines
  } = model;
  const fx = x / dx - 0.5;
  const fy = y / dy - 0.5;
  const i0 = Math.max(0, Math.min(nx - 1, Math.floor(fx)));
  const j0 = Math.max(0, Math.min(ny - 1, Math.floor(fy)));
  const tx = Math.max(0, Math.min(1, fx - i0));
  const ty = Math.max(0, Math.min(1, fy - j0));
  let sum = 0;
  let weight = 0;
  for (const [di, dj, w] of [[0, 0, (1 - tx) * (1 - ty)], [1, 0, tx * (1 - ty)], [0, 1, (1 - tx) * ty], [1, 1, tx * ty]]) {
    const i = Math.min(nx - 1, i0 + di);
    const j = Math.min(ny - 1, j0 + dj);
    if (w <= 0) continue;
    const cx = (i + 0.5) * dx;
    const cy = (j + 0.5) * dy;
    const crosses = faultLines.some(([ax, ay, bx, by]) => {
      const d1 = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
      const d2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      const d3 = (cx - x) * (ay - y) - (cy - y) * (ax - x);
      const d4 = (cx - x) * (by - y) - (cy - y) * (bx - x);
      return d1 * d2 < 0 && d3 * d4 < 0;
    });
    if (crosses) continue;
    sum += values[j * nx + i] * w;
    weight += w;
  }
  if (weight > 0) return sum / weight;
  const i = Math.max(0, Math.min(nx - 1, Math.round(fx)));
  const j = Math.max(0, Math.min(ny - 1, Math.round(fy)));
  return values[j * nx + i];
};

// ---------------------------------------------------------------- legend & layers

const SimLegend = ({
  view,
  layers,
  model
}) => {
  const hasFaults = model.faults.length > 0;
  const hasLeakyFault = model.faults.some(fault => fault.kf > 0);
  const hasTraps = model.traps.some(trap => trap.size >= 4);
  const items = [{
    label: 'Free plume',
    swatch: 'var(--sim-glow-free)'
  }, {
    label: 'Structurally trapped',
    swatch: 'var(--sim-glow-structural)'
  }, {
    label: 'Residually trapped',
    swatch: 'var(--sim-c-residual)',
    kind: 'hatch'
  }];
  if (view === 'section' || layers.dissolved) items.push({
    label: 'Dissolved',
    swatch: 'var(--sim-c-dissolved)'
  });
  if (view !== 'section') {
    if (hasLeakyFault) items.push({
      label: 'Leaking fault',
      swatch: 'var(--sim-glow-leaked)',
      kind: 'line'
    });
    if (hasFaults) items.push({
      label: view === '3d' ? 'Fault scarp' : 'Fault (ticks on downthrown side)',
      swatch: 'var(--sim-ink)',
      kind: 'line'
    });
    if (layers.traps && hasTraps) items.push({
      label: 'Structural trap',
      swatch: 'var(--sim-glow-structural)',
      kind: view === 'map' ? 'dash' : 'line'
    });
    if (layers.pressure && view === '3d') items.push({
      label: 'Pressure build-up contours',
      swatch: 'var(--sim-accent)',
      kind: 'line'
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-legend",
    role: "list",
    "aria-label": "Legend"
  }, items.map(item => /*#__PURE__*/React.createElement("div", {
    className: "sim-legend__item",
    role: "listitem",
    key: item.label
  }, /*#__PURE__*/React.createElement("span", {
    className: `sim-swatch${item.kind ? ` sim-swatch--${item.kind}` : ''}`,
    style: {
      '--swatch': item.swatch
    },
    "aria-hidden": "true"
  }), item.label)));
};
const SimLayersMenu = ({
  layers,
  onChange,
  view
}) => {
  const options = [['contours', 'Depth contours'], ['traps', 'Structural traps'], ['residual', 'Residual CO₂'], ['dissolved', 'Dissolved CO₂'], ['pressure', 'Pressure build-up'], ['flow', 'Flow animation']].filter(([key]) => view === 'map' || (view === '3d' ? key !== 'flow' : !['contours', 'pressure', 'flow', 'traps'].includes(key)));
  return /*#__PURE__*/React.createElement("details", {
    className: "sim-menu sim-layers"
  }, /*#__PURE__*/React.createElement("summary", {
    className: "sim-button"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-layer-group",
    "aria-hidden": "true"
  }), " Layers"), /*#__PURE__*/React.createElement("div", {
    className: "sim-menu__panel"
  }, options.map(([key, label]) => /*#__PURE__*/React.createElement("label", {
    key: key
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!layers[key],
    onChange: event => onChange({
      ...layers,
      [key]: event.target.checked
    })
  }), " ", label))));
};

// ---------------------------------------------------------------- readout

// Cell values under the pointer, shared by the map and the 3D view.
const simReadoutAt = (model, frame, x, y) => {
  const i = Math.max(0, Math.min(model.nx - 1, Math.floor(x / model.dx)));
  const j = Math.max(0, Math.min(model.ny - 1, Math.floor(y / model.dy)));
  const c = j * model.nx + i;
  return {
    x,
    y,
    depth: model.zt[c],
    thickness: model.Hc[c],
    h: frame.h[c],
    residual: (frame.hMax[c] - frame.h[c]) * model.sgr / (1 - model.swr),
    md: frame.md[c],
    p: frame.p[c]
  };
};
const SimReadout = ({
  readout,
  size
}) => /*#__PURE__*/React.createElement("div", {
  className: "sim-readout",
  style: {
    left: Math.min(readout.px + 16, size.width - 200),
    top: Math.min(readout.py + 16, size.height - 170)
  }
}, /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement("dt", null, "Position"), /*#__PURE__*/React.createElement("dd", null, (readout.x / 1000).toFixed(1), ", ", (readout.y / 1000).toFixed(1), " km"), /*#__PURE__*/React.createElement("dt", null, "Top of aquifer"), /*#__PURE__*/React.createElement("dd", null, simFormatNumber(readout.depth), " m"), /*#__PURE__*/React.createElement("dt", null, "Aquifer thickness"), /*#__PURE__*/React.createElement("dd", null, readout.thickness.toFixed(0), " m"), /*#__PURE__*/React.createElement("dt", null, "Mobile CO\u2082 column"), /*#__PURE__*/React.createElement("dd", null, readout.h.toFixed(1), " m"), /*#__PURE__*/React.createElement("dt", null, "Residual CO\u2082"), /*#__PURE__*/React.createElement("dd", null, readout.residual.toFixed(2), " m"), /*#__PURE__*/React.createElement("dt", null, "Dissolved"), /*#__PURE__*/React.createElement("dd", null, simFormatNumber(readout.md), " kg/m\xB2"), /*#__PURE__*/React.createElement("dt", null, "Pressure build-up"), /*#__PURE__*/React.createElement("dd", null, (readout.p / 1e5).toFixed(2), " bar")));

// ---------------------------------------------------------------- map

const simMapLayout = (model, width, height) => {
  // Narrow screens wrap the legend onto more rows, so leave more room below the map.
  const margin = {
    left: 46,
    right: 26,
    top: 58,
    bottom: width < 560 ? 104 : 62
  };
  const scale = Math.max(0.0001, Math.min((width - margin.left - margin.right) / model.Lx, (height - margin.top - margin.bottom) / model.Ly));
  const w = model.Lx * scale;
  const h = model.Ly * scale;
  const ox = margin.left + (width - margin.left - margin.right - w) / 2;
  const oy = margin.top + (height - margin.top - margin.bottom - h) / 2;
  return {
    scale,
    ox,
    oy,
    w,
    h,
    sx: x => ox + x * scale,
    sy: y => oy + (model.Ly - y) * scale,
    wx: px => (px - ox) / scale,
    wy: py => model.Ly - (py - oy) / scale
  };
};

// Static, per-model layers: hillshaded depth raster, contour lines, trap outlines.
const simMapStatics = (model, palette) => {
  const {
    nx,
    ny,
    zt,
    dx,
    dy
  } = model;
  let min = Infinity;
  let max = -Infinity;
  for (const z of zt) {
    if (z < min) min = z;
    if (z > max) max = z;
  }
  const stops = palette.depth.map(simParseColor);
  const raster = document.createElement('canvas');
  raster.width = nx;
  raster.height = ny;
  const image = raster.getContext('2d').createImageData(nx, ny);
  const exaggeration = 30;
  const light = [-0.5, 0.5, 0.707];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = j * nx + i;
      const zx = (zt[j * nx + Math.min(nx - 1, i + 1)] - zt[j * nx + Math.max(0, i - 1)]) / (dx * (i > 0 && i < nx - 1 ? 2 : 1));
      const zy = (zt[Math.min(ny - 1, j + 1) * nx + i] - zt[Math.max(0, j - 1) * nx + i]) / (dy * (j > 0 && j < ny - 1 ? 2 : 1));
      // Surface elevation is -depth, so its gradient is (-zx, -zy).
      const n = [zx * exaggeration, zy * exaggeration, 1];
      const length = Math.hypot(n[0], n[1], n[2]);
      const shade = Math.max(0, (n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) / length);
      const rgb = simDepthColor(stops, (zt[c] - min) / (max - min || 1));
      const k = 0.62 + 0.5 * shade;
      const p = 4 * ((ny - 1 - j) * nx + i);
      image.data[p] = Math.min(255, rgb[0] * k);
      image.data[p + 1] = Math.min(255, rgb[1] * k);
      image.data[p + 2] = Math.min(255, rgb[2] * k);
      image.data[p + 3] = 255;
    }
  }
  raster.getContext('2d').putImageData(image, 0, 0);
  const interval = simContourInterval(max - min);
  const contours = [];
  for (let level = Math.ceil(min / interval) * interval; level < max; level += interval) {
    contours.push({
      level,
      lines: simChainSegments(VE2D.contourSegments(zt, nx, ny, level)),
      major: level % (interval * 5) === 0
    });
  }
  const mask = new Float32Array(nx * ny);
  const bigTraps = new Set(model.traps.filter(t => t.size >= 4 && t.capacity * model.rhoG > 0.02e9).map(t => t.id));
  for (let c = 0; c < nx * ny; c++) mask[c] = bigTraps.has(model.trapId[c]) ? 1 : 0;
  const trapLines = simChainSegments(VE2D.contourSegments(mask, nx, ny, 0.5));
  const spills = model.traps.filter(t => bigTraps.has(t.id) && t.spillCell >= 0).map(t => t.spillCell);
  return {
    raster,
    contours,
    trapLines,
    spills,
    min,
    max,
    interval
  };
};
const simDrawPolyline = (ctx, points, toX, toY) => {
  ctx.beginPath();
  for (let k = 0; k < points.length; k += 2) {
    const x = toX(points[k]);
    const y = toY(points[k + 1]);
    if (k === 0) ctx.moveTo(x, y);else ctx.lineTo(x, y);
  }
};
const SimMapView = ({
  model,
  frame,
  palette,
  layers,
  reducedMotion,
  line,
  onLine,
  onWell,
  year,
  playing
}) => {
  const [sizeRef, size] = simUseSize();
  const canvasRef = useRef(null);
  const motionRef = useRef(null);
  const [readout, setReadout] = useState(null);
  const [drag, setDrag] = useState(null);
  const statics = useMemo(() => simMapStatics(model, palette), [model, palette]);
  const plumeCanvas = useMemo(() => document.createElement('canvas'), []);
  const hatchCanvas = useMemo(() => document.createElement('canvas'), []);
  const layout = useMemo(() => size.width ? simMapLayout(model, size.width, size.height) : null, [model, size]);
  const toX = i => layout.sx((i + 0.5) * model.dx);
  const toY = j => layout.sy((j + 0.5) * model.dy);
  useEffect(() => {
    if (!layout || !frame) return;
    const ctx = simPrepareCanvas(canvasRef.current, size.width, size.height);
    const {
      nx,
      ny,
      H,
      zt,
      zSpill
    } = model;
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.fillStyle = palette.stage;
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(statics.raster, layout.ox, layout.oy, layout.w, layout.h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(layout.ox, layout.oy, layout.w, layout.h);
    ctx.clip();
    if (layers.contours) {
      ctx.strokeStyle = palette.contour;
      for (const contour of statics.contours) {
        ctx.lineWidth = contour.major ? 1.2 : 0.6;
        for (const points of contour.lines) {
          simDrawPolyline(ctx, points, toX, toY);
          ctx.stroke();
        }
      }
      ctx.font = `11px ${palette.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const contour of statics.contours.filter(c => c.major || statics.contours.length < 8)) {
        // Dark text on the light (shallow) end of the ramp, light text on the dark end.
        const light = (contour.level - statics.min) / (statics.max - statics.min || 1) < 0.45;
        for (const points of contour.lines) {
          if (points.length < 24) continue;
          const k = 2 * Math.floor(points.length / 4);
          const x = toX(points[k]);
          const y = toY(points[k + 1]);
          ctx.lineWidth = 3;
          ctx.strokeStyle = light ? palette.depth[1] : palette.depth[5];
          ctx.strokeText(String(contour.level), x, y);
          ctx.fillStyle = light ? palette.depth[6] : palette.depth[0];
          ctx.fillText(String(contour.level), x, y);
        }
      }
    }

    // Field rasters at cell resolution, upscaled smoothly.
    plumeCanvas.width = nx;
    plumeCanvas.height = ny;
    const pctx = plumeCanvas.getContext('2d');
    const image = pctx.createImageData(nx, ny);
    const free = simParseColor(palette.glowFree);
    const structural = simParseColor(palette.glowStructural);
    const residual = simParseColor(palette.glowResidual);
    const dissolved = simParseColor(palette.glowDissolved);
    const reference = Math.max(4, 0.5 * H);
    const residualImage = pctx.createImageData(nx, ny);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        const p = 4 * ((ny - 1 - j) * nx + i);
        const h = frame.h[c];
        if (layers.dissolved && frame.md[c] > 0) {
          const a = Math.min(0.75, frame.md[c] / model.disCapacity[c]);
          image.data[p] = dissolved[0];
          image.data[p + 1] = dissolved[1];
          image.data[p + 2] = dissolved[2];
          image.data[p + 3] = 255 * a;
        }
        const zone = frame.hMax[c] - h;
        if (layers.residual && zone > 0.05) {
          residualImage.data[p] = residual[0];
          residualImage.data[p + 1] = residual[1];
          residualImage.data[p + 2] = residual[2];
          residualImage.data[p + 3] = 255 * Math.min(0.85, 0.3 + zone / reference);
        }
        if (h > 0.05) {
          const closure = Math.max(0, zSpill[c] - zt[c]);
          const rgb = simMixRgb(free, structural, Math.min(h, closure) / h);
          const alpha = 0.35 + 0.65 * Math.min(1, Math.sqrt(h / reference));
          image.data[p] = rgb[0];
          image.data[p + 1] = rgb[1];
          image.data[p + 2] = rgb[2];
          image.data[p + 3] = 255 * alpha;
        }
      }
    }
    if (layers.residual) {
      pctx.putImageData(residualImage, 0, 0);
      hatchCanvas.width = Math.max(1, Math.round(layout.w));
      hatchCanvas.height = Math.max(1, Math.round(layout.h));
      const hctx = hatchCanvas.getContext('2d');
      hctx.imageSmoothingEnabled = true;
      hctx.drawImage(plumeCanvas, 0, 0, hatchCanvas.width, hatchCanvas.height);
      hctx.globalCompositeOperation = 'source-in';
      hctx.strokeStyle = palette.glowResidual;
      hctx.lineWidth = 1.4;
      hctx.beginPath();
      for (let d = -hatchCanvas.height; d < hatchCanvas.width; d += 6) {
        hctx.moveTo(d, hatchCanvas.height);
        hctx.lineTo(d + hatchCanvas.height, 0);
      }
      hctx.stroke();
      hctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(hatchCanvas, layout.ox, layout.oy, layout.w, layout.h);
    }
    pctx.putImageData(image, 0, 0);
    ctx.drawImage(plumeCanvas, layout.ox, layout.oy, layout.w, layout.h);

    // Crisp plume edge at a 0.5 m column.
    ctx.strokeStyle = palette.glowFree;
    ctx.lineWidth = 1.5;
    for (const points of simChainSegments(VE2D.contourSegments(frame.h, nx, ny, 0.5))) {
      simDrawPolyline(ctx, points, toX, toY);
      ctx.stroke();
    }
    if (layers.traps) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = palette.glowStructural;
      ctx.lineWidth = 1.4;
      for (const points of statics.trapLines) {
        simDrawPolyline(ctx, points, toX, toY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const cell of statics.spills) {
        const x = toX(cell % nx);
        const y = toY(Math.floor(cell / nx));
        ctx.fillStyle = palette.glowStructural;
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x + 5, y);
        ctx.lineTo(x, y + 5);
        ctx.lineTo(x - 5, y);
        ctx.closePath();
        ctx.fill();
      }
    }
    if (layers.pressure) {
      let pMax = 0;
      for (const v of frame.p) if (v > pMax) pMax = v;
      if (pMax > 0.2e5) {
        const step = simNiceStep(pMax / 1e5, 5);
        ctx.strokeStyle = palette.accent;
        ctx.fillStyle = palette.accent;
        ctx.lineWidth = 1;
        ctx.font = `11px ${palette.mono}`;
        for (let level = step; level < pMax / 1e5; level += step) {
          const lines = simChainSegments(VE2D.contourSegments(frame.p, nx, ny, level * 1e5));
          for (const points of lines) {
            simDrawPolyline(ctx, points, toX, toY);
            ctx.stroke();
            if (points.length > 30) ctx.fillText(`${+level.toPrecision(3)} bar`, toX(points[0]) + 4, toY(points[1]) - 4);
          }
        }
      }
    }
    ctx.restore();

    // Faults with ticks on the downthrown (hanging-wall) side.
    model.faults.forEach((fault, index) => {
      const [x0, y0, x1, y1] = model.faultLines[index];
      const sealing = fault.trans === 0 || fault.throw >= model.H;
      const leaking = frame.leaking?.[index];
      ctx.save();
      ctx.lineCap = 'round';
      if (leaking) {
        ctx.strokeStyle = palette.glowLeaked;
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(layout.sx(x0), layout.sy(y0));
        ctx.lineTo(layout.sx(x1), layout.sy(y1));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = leaking ? palette.glowLeaked : palette.ink;
      ctx.lineWidth = 2.2;
      ctx.setLineDash(sealing ? [] : [9, 5]);
      ctx.beginPath();
      ctx.moveTo(layout.sx(x0), layout.sy(y0));
      ctx.lineTo(layout.sx(x1), layout.sy(y1));
      ctx.stroke();
      ctx.setLineDash([]);
      const [nxv, nyv] = simFaultNormal(fault);
      const length = Math.hypot(x1 - x0, y1 - y0);
      const spacing = Math.max(300, 26 / layout.scale);
      ctx.lineWidth = 1.6;
      for (let s = spacing / 2; s < length; s += spacing) {
        const px = x0 + (x1 - x0) * s / length;
        const py = y0 + (y1 - y0) * s / length;
        ctx.beginPath();
        ctx.moveTo(layout.sx(px), layout.sy(py));
        ctx.lineTo(layout.sx(px) + nxv * 6, layout.sy(py) - nyv * 6);
        ctx.stroke();
      }
      const top = y1 > y0 ? [x1, y1] : [x0, y0];
      ctx.fillStyle = leaking ? palette.glowLeaked : palette.ink;
      ctx.font = `600 12px ${palette.font}`;
      ctx.textAlign = 'center';
      ctx.fillText(`F${index + 1}`, layout.sx(top[0]), layout.sy(top[1]) - 8);
      ctx.restore();
    });

    // Section line A–A′.
    if (line) {
      ctx.save();
      ctx.strokeStyle = palette.ink;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(layout.sx(line.x0), layout.sy(line.y0));
      ctx.lineTo(layout.sx(line.x1), layout.sy(line.y1));
      ctx.stroke();
      ctx.setLineDash([]);
      [[line.x0, line.y0, 'A'], [line.x1, line.y1, 'A′']].forEach(([x, y, label]) => {
        ctx.fillStyle = palette.surface;
        ctx.strokeStyle = palette.ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(layout.sx(x), layout.sy(y), 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = palette.ink;
        ctx.font = `700 10px ${palette.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, layout.sx(x), layout.sy(y) + 0.5);
      });
      ctx.restore();
    }

    // Injector symbol.
    const wellX = drag?.kind === 'well' ? drag.x : model.wellX;
    const wellY = drag?.kind === 'well' ? drag.y : model.wellY;
    ctx.save();
    ctx.fillStyle = palette.surface;
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(layout.sx(wellX), layout.sy(wellY), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = palette.ink;
    ctx.beginPath();
    ctx.arc(layout.sx(wellX), layout.sy(wellY), 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `700 12px ${palette.font}`;
    ctx.textAlign = 'left';
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.stage;
    ctx.strokeText('INJ-1', layout.sx(wellX) + 11, layout.sy(wellY) - 9);
    ctx.fillText('INJ-1', layout.sx(wellX) + 11, layout.sy(wellY) - 9);
    if (reducedMotion && year < model.injYears) {
      ctx.strokeStyle = palette.glowFree;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(layout.sx(wellX), layout.sy(wellY), 14, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Frame, kilometre ticks, scale bar and north arrow.
    ctx.save();
    ctx.strokeStyle = palette.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(layout.ox, layout.oy, layout.w, layout.h);
    ctx.fillStyle = palette.inkFaint;
    ctx.font = `11px ${palette.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let km = 0; km <= model.Lx / 1000; km += 2) ctx.fillText(String(km), layout.sx(km * 1000), layout.oy + layout.h + 6);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let km = 0; km <= model.Ly / 1000; km += 2) ctx.fillText(String(km), layout.ox - 6, layout.sy(km * 1000));
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('km', layout.ox + layout.w + 12, layout.oy + layout.h + 6);
    const bar = 5000 * layout.scale;
    const bx = layout.ox + 14;
    const by = layout.oy + layout.h - 16;
    ctx.fillStyle = palette.ink;
    ctx.fillRect(bx, by, bar, 3);
    ctx.font = `600 11px ${palette.font}`;
    ctx.textBaseline = 'bottom';
    ctx.fillText('5 km', bx, by - 3);
    const ax = layout.ox + layout.w - 20;
    const ay = layout.oy + layout.h - 44;
    ctx.beginPath();
    ctx.moveTo(ax, ay - 12);
    ctx.lineTo(ax + 6, ay + 6);
    ctx.lineTo(ax, ay + 2);
    ctx.lineTo(ax - 6, ay + 6);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillText('N', ax, ay - 14);
    ctx.restore();
  }, [layout, frame, statics, layers, line, drag, palette, reducedMotion, year < model.injYears]);

  // Motion layer: flow particles along the CO2 flux, injection pulse, leak beacons.
  // The field is refreshed per frame; the particles persist across frames.
  const field = useRef(null);
  useEffect(() => {
    if (!frame) return;
    const {
      nx,
      ny,
      dx,
      dy,
      phi,
      swr
    } = model;
    const velocity = new Float32Array(2 * nx * ny);
    const cells = [];
    let total = 0;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const c = j * nx + i;
        const h = frame.h[c];
        if (h < 0.3) continue;
        const area = Math.max(0.5, h) * phi * (1 - swr);
        velocity[2 * c] = 0.5 * (frame.fx[j * (nx + 1) + i] + frame.fx[j * (nx + 1) + i + 1]) / (dy * area);
        velocity[2 * c + 1] = 0.5 * (frame.fy[j * nx + i] + frame.fy[(j + 1) * nx + i]) / (dx * area);
        cells.push(c);
        total += h;
      }
    }
    field.current = {
      frame,
      velocity,
      cells,
      total,
      injecting: year < model.injYears,
      leakCells: model.leakCells.filter(cell => frame.h[cell.cell] > model.faults[cell.fault].sealCap),
      playing
    };
  }, [frame, model, playing]);
  useEffect(() => {
    if (!layout || reducedMotion) {
      if (motionRef.current && size.width) simPrepareCanvas(motionRef.current, size.width, size.height).clearRect(0, 0, size.width, size.height);
      return undefined;
    }
    const ctx = simPrepareCanvas(motionRef.current, size.width, size.height);
    const {
      nx,
      ny,
      dx,
      dy
    } = model;
    const spawn = particle => {
      const f = field.current;
      if (!f || !f.cells.length) {
        particle.dead = true;
        return particle;
      }
      let r = Math.random() * f.total;
      let c = f.cells[0];
      for (const cell of f.cells) {
        r -= f.frame.h[cell];
        if (r <= 0) {
          c = cell;
          break;
        }
      }
      particle.x = (c % nx + Math.random()) * dx;
      particle.y = (Math.floor(c / nx) + Math.random()) * dy;
      particle.life = 0.6 + Math.random() * 2.2;
      particle.age = 0;
      particle.dead = false;
      return particle;
    };
    const particles = Array.from({
      length: 900
    }, () => spawn({}));
    let last = performance.now();
    let id;
    const draw = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = field.current;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(0, 0, size.width, size.height);
      ctx.globalCompositeOperation = 'source-over';
      if (f && layers.flow && f.cells.length) {
        const active = Math.min(particles.length, Math.round(f.cells.length * 1.2));
        const yearsPerSecond = SIM_SPEEDS[0] * (f.playing ? 1.4 : 1);
        ctx.strokeStyle = palette.glowFree;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let k = 0; k < active; k++) {
          const particle = particles[k];
          if (particle.dead) {
            spawn(particle);
            continue;
          }
          const i = Math.floor(particle.x / dx);
          const j = Math.floor(particle.y / dy);
          const c = j * nx + i;
          particle.age += dt;
          if (i < 0 || j < 0 || i >= nx || j >= ny || f.frame.h[c] < 0.3 || particle.age > particle.life) {
            spawn(particle);
            continue;
          }
          let stepX = f.velocity[2 * c] * yearsPerSecond * VE2D.YEAR * dt;
          let stepY = f.velocity[2 * c + 1] * yearsPerSecond * VE2D.YEAR * dt;
          const px = Math.hypot(stepX, stepY) * layout.scale;
          if (px > 2.5) {
            stepX *= 2.5 / px;
            stepY *= 2.5 / px;
          }
          if (px < 0.15) {
            particle.age += dt * 2;
            continue;
          }
          ctx.moveTo(layout.sx(particle.x), layout.sy(particle.y));
          particle.x += stepX;
          particle.y += stepY;
          ctx.lineTo(layout.sx(particle.x), layout.sy(particle.y));
        }
        ctx.stroke();
      }
      if (f && f.injecting) {
        const phase = now / 1600 % 1;
        ctx.strokeStyle = palette.glowFree;
        ctx.globalAlpha = 1 - phase;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(layout.sx(model.wellX), layout.sy(model.wellY), 9 + phase * 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (f && f.leakCells.length) {
        const pulse = 0.5 + 0.5 * Math.sin(now / 260);
        ctx.fillStyle = palette.glowLeaked;
        for (const cell of f.leakCells) {
          ctx.globalAlpha = 0.25 + 0.5 * pulse;
          ctx.beginPath();
          ctx.arc(layout.sx((cell.cell % nx + 0.5) * dx), layout.sy((Math.floor(cell.cell / nx) + 0.5) * dy), 2.5 + 2.5 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [layout, layers.flow, reducedMotion, palette, model]);
  const hit = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    return {
      px,
      py,
      x: layout.wx(px),
      y: layout.wy(py)
    };
  };
  const near = (a, x, y) => Math.hypot(layout.sx(x) - a.px, layout.sy(y) - a.py) < 14;
  const clampX = x => Math.max(0, Math.min(model.Lx, x));
  const clampY = y => Math.max(0, Math.min(model.Ly, y));
  const onPointerDown = event => {
    if (!layout) return;
    const a = hit(event);
    let kind = null;
    if (near(a, model.wellX, model.wellY)) kind = 'well';else if (line && near(a, line.x0, line.y0)) kind = 'a';else if (line && near(a, line.x1, line.y1)) kind = 'b';
    if (!kind) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      kind,
      x: a.x,
      y: a.y
    });
  };
  const onPointerMove = event => {
    if (!layout) return;
    const a = hit(event);
    if (drag) {
      const x = clampX(a.x);
      const y = clampY(a.y);
      if (drag.kind === 'well') setDrag({
        kind: 'well',
        x,
        y
      });else onLine(drag.kind === 'a' ? {
        ...line,
        x0: x,
        y0: y
      } : {
        ...line,
        x1: x,
        y1: y
      });
      return;
    }
    if (a.x < 0 || a.y < 0 || a.x > model.Lx || a.y > model.Ly || !frame) {
      setReadout(null);
      return;
    }
    setReadout({
      px: a.px,
      py: a.py,
      ...simReadoutAt(model, frame, a.x, a.y)
    });
  };
  const onPointerUp = () => {
    if (drag?.kind === 'well') onWell(+(drag.x / 1000).toFixed(1), +(drag.y / 1000).toFixed(1));
    setDrag(null);
  };
  const cursor = drag ? 'grabbing' : 'crosshair';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("canvas", {
    ref: el => {
      canvasRef.current = el;
      sizeRef.current = el;
    },
    "data-export": "map",
    className: "sim-view__fade",
    role: "img",
    tabIndex: 0,
    "aria-label": `Structure map at year ${Math.round(year)}: depth to the top of the aquifer with the CO₂ plume, faults and the injector. Drag the injector or the section ends A and A′.`,
    style: {
      cursor
    },
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: onPointerUp,
    onPointerLeave: () => {
      setReadout(null);
    }
  }), /*#__PURE__*/React.createElement("canvas", {
    ref: motionRef,
    "aria-hidden": "true",
    style: {
      pointerEvents: 'none'
    }
  }), readout && !drag && /*#__PURE__*/React.createElement(SimReadout, {
    readout: readout,
    size: size
  }));
};

// ---------------------------------------------------------------- 3D block diagram

const SIM_CAMERA = {
  azimuth: -0.55,
  elevation: 0.62,
  zoom: 1,
  panX: 0,
  panY: 0
};
const simUnitRgb = color => simParseColor(color).map(v => v / 255);

// Free space around the block: view switcher and controls above, legend below.
const simBlockViewport = size => ({
  width: size.width,
  height: size.height,
  top: 100,
  bottom: size.width < 560 ? 104 : 62,
  side: 16
});

// Labels, distance ticks, north arrow and depth key over the WebGL canvas.
const simDrawBlockOverlay = (ctx, {
  cam,
  box,
  model,
  geometry,
  depthAt,
  thicknessAt,
  wellDepth,
  palette,
  size,
  viewport,
  leaking
}) => {
  ctx.clearRect(0, 0, size.width, size.height);
  const at = (x, y, depth, lift = 0) => {
    const p = SimBlock3D.toDisplay(box, x, y, depth);
    return SimBlock3D.project(cam, p[0], p[1], p[2] + lift);
  };
  const halo = (text, x, y, color, font, align = 'center') => {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = palette.stage;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };
  const floor = size.height - viewport.bottom + 4;

  // Kilometre ticks along the foot of the walls that face the camera.
  const {
    Lx,
    Ly
  } = model;
  const edges = [{
    normal: [0, -1],
    points: [0, 5, 10, 15, 20].map(km => [km * 1000, 0])
  }, {
    normal: [0, 1],
    points: [0, 5, 10, 15, 20].map(km => [km * 1000, Ly])
  }, {
    normal: [-1, 0],
    points: [0, 4, 8, 12].map(km => [0, km * 1000])
  }, {
    normal: [1, 0],
    points: [0, 4, 8, 12].map(km => [Lx, km * 1000])
  }];
  ctx.textBaseline = 'middle';
  const placed = [];
  for (const edge of edges) {
    const mid = edge.points[Math.floor(edge.points.length / 2)];
    const toEye = [cam.eye[0] - (mid[0] - Lx / 2), cam.eye[1] - (mid[1] - Ly / 2)];
    if (toEye[0] * edge.normal[0] + toEye[1] * edge.normal[1] <= 0) continue;
    edge.points.forEach(([x, y], k) => {
      const depth = depthAt(x, y) + thicknessAt(x, y);
      const p = at(x, y, depth);
      const q = at(x + 600 * edge.normal[0], y + 600 * edge.normal[1], depth);
      if (!p || !q) return;
      const length = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      const d = [(q[0] - p[0]) / length, (q[1] - p[1]) / length];
      const tx = p[0] + d[0] * 15;
      const ty = p[1] + d[1] * 15;
      const along = (edge.normal[0] ? y : x) / 1000;
      const text = k === edge.points.length - 1 ? `${along} km` : String(along);
      ctx.font = `11px ${palette.mono}`;
      ctx.textAlign = d[0] > 0.5 ? 'left' : d[0] < -0.5 ? 'right' : 'center';
      const width = ctx.measureText(text).width;
      const left = ctx.textAlign === 'left' ? tx : ctx.textAlign === 'right' ? tx - width : tx - width / 2;
      if (ty > floor || left < 4 || left + width > size.width - 4 || placed.some(([u, v]) => Math.hypot(u - tx, v - ty) < 26)) return;
      placed.push([tx, ty]);
      ctx.strokeStyle = palette.inkFaint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(p[0] + d[0] * 6, p[1] + d[1] * 6);
      ctx.stroke();
      ctx.fillStyle = palette.inkFaint;
      ctx.fillText(text, tx, ty);
    });
  }

  // Injector name at the head of the stem, then fault names at the northern tip (as on
  // the map) or, if that would collide with another label, at the southern tip.
  ctx.textBaseline = 'bottom';
  const taken = [];
  const clear = (x, y, width) => !taken.some(([u, v, w]) => Math.abs(u - x) < (w + width) / 2 + 4 && Math.abs(v - y) < 16);
  const head = at(model.wellX, model.wellY, wellDepth, box.stem);
  if (head) {
    halo('INJ-1', head[0], head[1] - 8, palette.ink, `700 12px ${palette.font}`);
    taken.push([head[0], head[1] - 8, 40]);
  }
  model.faults.forEach((fault, index) => {
    const [x0, y0, x1, y1] = model.faultLines[index];
    const tips = [y1 >= y0 ? [x1, y1, x0, y0] : [x0, y0, x1, y1], y1 >= y0 ? [x0, y0, x1, y1] : [x1, y1, x0, y0]].map(([ax, ay, bx, by]) => {
      for (let s = 0; s <= 40; s++) {
        const x = ax + (bx - ax) * s / 40;
        const y = ay + (by - ay) * s / 40;
        if (x >= 0 && y >= 0 && x <= Lx && y <= Ly) return at(x, y, depthAt(x, y));
      }
      return null;
    }).filter(Boolean);
    const p = tips.find(tip => clear(tip[0], tip[1] - 8, 20)) || tips[0];
    if (!p) return;
    halo(`F${index + 1}`, p[0], p[1] - 8, leaking[index] ? palette.glowLeaked : palette.ink, `600 12px ${palette.font}`);
    taken.push([p[0], p[1] - 8, 20]);
  });

  // North arrow, turned with the camera.
  const centre = SimBlock3D.project(cam, cam.target[0], cam.target[1], cam.target[2]);
  const north = SimBlock3D.project(cam, cam.target[0], cam.target[1] + 1000, cam.target[2]);
  if (centre && north) {
    const angle = Math.atan2(north[0] - centre[0], centre[1] - north[1]);
    const ax = 30;
    const ay = floor - 10;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(angle);
    ctx.fillStyle = palette.ink;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.font = `600 11px ${palette.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = palette.ink;
    ctx.fillText('N', ax + 19 * Math.sin(angle), ay - 19 * Math.cos(angle));
  }

  // Depth key for the colour of the surface.
  const keyX = 16;
  const keyY = 66;
  const keyWidth = size.width < 560 ? 88 : 112;
  const gradient = ctx.createLinearGradient(keyX, 0, keyX + keyWidth, 0);
  palette.depth.forEach((color, i) => gradient.addColorStop(i / (palette.depth.length - 1), color));
  ctx.fillStyle = gradient;
  ctx.fillRect(keyX, keyY + 14, keyWidth, 6);
  ctx.font = `11px ${palette.font}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = palette.inkMuted;
  ctx.fillText('Top of aquifer', keyX, keyY + 9);
  ctx.font = `11px ${palette.mono}`;
  ctx.fillStyle = palette.inkFaint;
  ctx.fillText(simFormatNumber(geometry.zMin), keyX, keyY + 34);
  ctx.textAlign = 'right';
  ctx.fillText(`${simFormatNumber(geometry.zMax)} m`, keyX + keyWidth, keyY + 34);
};
const SimBlockView = ({
  model,
  frame,
  palette,
  layers,
  reducedMotion,
  year,
  scenario
}) => {
  const [sizeRef, size] = simUseSize();
  const glRef = useRef(null);
  const overlayRef = useRef(null);
  const renderer = useRef(null);
  const [generation, setGeneration] = useState(0);
  const [supported, setSupported] = useState(true);
  const [camera, setCamera] = useState(SIM_CAMERA);
  const [exaggeration, setExaggeration] = useState(25);
  const [readout, setReadout] = useState(null);
  const pointers = useRef(new Map());
  const velocity = useRef({
    azimuth: 0,
    elevation: 0
  });
  const animation = useRef(0);
  const depthAt = useMemo(() => VE2D.depthField(scenario), [scenario]);
  const thicknessAt = useMemo(() => VE2D.thicknessField(scenario), [scenario]);
  const geometry = useMemo(() => SimBlock3D.buildGeometry(model, depthAt, {
    thicknessAt
  }), [model, depthAt, thicknessAt]);
  const wellDepth = useMemo(() => depthAt(model.wellX, model.wellY), [model, depthAt]);
  const box = useMemo(() => SimBlock3D.sceneBox(geometry, model, exaggeration, wellDepth), [geometry, model, exaggeration, wellDepth]);
  const viewport = simBlockViewport(size);
  const colors = useMemo(() => ({
    stage: simUnitRgb(palette.stage),
    ramp: palette.depth.map(simUnitRgb),
    free: simUnitRgb(palette.glowFree),
    structural: simUnitRgb(palette.glowStructural),
    residual: simUnitRgb(palette.glowResidual),
    dissolved: simUnitRgb(palette.glowDissolved),
    leak: simUnitRgb(palette.glowLeaked),
    ink: simUnitRgb(palette.ink),
    contourInk: simUnitRgb(palette.contour),
    accent: simUnitRgb(palette.accent),
    aquifer: simUnitRgb(palette.rockAquifer),
    base: simUnitRgb(palette.rockBase)
  }), [palette]);
  const injecting = year < model.injYears;
  const leaking = model.faults.map((_, i) => !!frame?.leaking?.[i]);

  // One WebGL context per mount; rebuilt if the browser drops it.
  useEffect(() => {
    const canvas = glRef.current;
    const start = () => {
      try {
        renderer.current = SimBlock3D.createRenderer(canvas);
      } catch (error) {
        console.error(error);
        renderer.current = null;
      }
      setSupported(!!renderer.current);
      setGeneration(g => g + 1);
    };
    const lost = event => {
      event.preventDefault();
      renderer.current = null;
    };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', start);
    start();
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', start);
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);
  useEffect(() => {
    if (!renderer.current) return;
    renderer.current.setGeometry(geometry, model);
    renderer.current.setStatic(SimBlock3D.packStatic(model));
  }, [geometry, model, generation]);
  useEffect(() => {
    if (renderer.current && frame) renderer.current.setFrame(SimBlock3D.packFrame(model, frame));
  }, [frame, model, geometry, generation]);
  const draw = time => {
    const canvas = glRef.current;
    if (!renderer.current || !size.width || !frame || !canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pixelWidth = Math.round(size.width * dpr);
    const pixelHeight = Math.round(size.height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const cam = SimBlock3D.cameraFor(camera, box, viewport);
    let pressure = 0;
    if (layers.pressure) {
      let pMax = 0;
      for (const v of frame.p) if (v > pMax) pMax = v;
      if (pMax > 0.2e5) pressure = simNiceStep(pMax / 1e5, 5);
    }
    renderer.current.render({
      cam,
      box,
      colors,
      layers,
      time,
      pixelWidth,
      pixelHeight,
      pressure,
      hatch: Math.max(120, 6.5 * cam.distance / cam.focal),
      traces: model.faultLines,
      depthRange: [geometry.zMin, geometry.zMax],
      interval: layers.contours ? simContourInterval(geometry.zMax - geometry.zMin) : 0,
      refH: Math.max(4, 0.5 * model.H),
      well: {
        x: model.wellX,
        y: model.wellY,
        top: wellDepth - box.stem / exaggeration,
        bottom: wellDepth + thicknessAt(model.wellX, model.wellY),
        radius: 0.004 * Math.max(model.Lx, model.Ly),
        injecting
      },
      leaking
    });
    simDrawBlockOverlay(simPrepareCanvas(overlayRef.current, size.width, size.height), {
      cam,
      box,
      model,
      geometry,
      depthAt,
      thicknessAt,
      wellDepth,
      palette,
      size,
      viewport,
      leaking
    });
  };
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    draw(reducedMotion ? -1 : performance.now() / 1000);
  }, [size, frame, camera, box, colors, layers, geometry, generation, injecting, reducedMotion, leaking.join()]);

  // Motion only while it carries data: the injection pulse and leaking faults.
  const animate = supported && !reducedMotion && (injecting || leaking.some(Boolean));
  useEffect(() => {
    if (!animate) return undefined;
    let id = 0;
    const loop = now => {
      drawRef.current(now / 1000);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [animate]);
  const clampCamera = c => ({
    azimuth: ((c.azimuth + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI,
    elevation: Math.max(0.12, Math.min(1.45, c.elevation)),
    zoom: Math.max(0.6, Math.min(4, c.zoom)),
    panX: Math.max(-model.Lx / 2, Math.min(model.Lx / 2, c.panX)),
    panY: Math.max(-model.Ly / 2, Math.min(model.Ly / 2, c.panY))
  });
  // Slide the target so the ground follows the pointer.
  const panBy = (c, dx, dy) => {
    const cam = SimBlock3D.cameraFor(c, box, viewport);
    const across = cam.distance / cam.focal;
    const along = across / Math.max(0.35, Math.sin(c.elevation));
    const sa = Math.sin(c.azimuth);
    const ca = Math.cos(c.azimuth);
    return clampCamera({
      ...c,
      panX: c.panX - dx * across * ca + dy * along * sa,
      panY: c.panY + dx * across * sa + dy * along * ca
    });
  };

  // Inertial orbit after a drag (skipped for reduced motion).
  const startInertia = () => {
    if (reducedMotion) return;
    cancelAnimationFrame(animation.current);
    const step = () => {
      const v = velocity.current;
      if (Math.abs(v.azimuth) < 0.0005 && Math.abs(v.elevation) < 0.0005) return;
      setCamera(c => clampCamera({
        ...c,
        azimuth: c.azimuth + v.azimuth,
        elevation: c.elevation + v.elevation
      }));
      v.azimuth *= 0.92;
      v.elevation *= 0.92;
      animation.current = requestAnimationFrame(step);
    };
    animation.current = requestAnimationFrame(step);
  };
  const resetView = () => {
    cancelAnimationFrame(animation.current);
    velocity.current = {
      azimuth: 0,
      elevation: 0
    };
    if (reducedMotion) {
      setCamera(SIM_CAMERA);
      return;
    }
    const from = camera;
    const turn = (SIM_CAMERA.azimuth - from.azimuth + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    const start = performance.now();
    const ease = t => 1 - (1 - t) ** 3;
    const step = now => {
      const t = Math.min(1, (now - start) / 420);
      const k = ease(t);
      setCamera(clampCamera(Object.fromEntries(Object.keys(SIM_CAMERA).map(key => [key, key === 'azimuth' ? from.azimuth + turn * k : from[key] + (SIM_CAMERA[key] - from[key]) * k]))));
      if (t < 1) animation.current = requestAnimationFrame(step);
    };
    animation.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(animation.current), []);
  const pointAt = event => {
    const rect = glRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };
  const hover = event => {
    if (!frame) return;
    const p = pointAt(event);
    const hit = SimBlock3D.pick(SimBlock3D.cameraFor(camera, box, viewport), box, depthAt, p.x, p.y);
    setReadout(hit ? {
      px: p.x,
      py: p.y,
      ...simReadoutAt(model, frame, hit.x, hit.y)
    } : null);
  };
  const onPointerDown = event => {
    cancelAnimationFrame(animation.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      pan: event.button === 2 || event.shiftKey
    });
    setReadout(null);
  };
  const onPointerMove = event => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) {
      if (event.pointerType === 'mouse') hover(event);
      return;
    }
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    if (pointers.current.size === 2) {
      // Pinch to zoom, move both fingers to pan.
      const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)[1];
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
      setCamera(c => panBy(clampCamera({
        ...c,
        zoom: before > 0 ? c.zoom * after / before : c.zoom
      }), dx / 2, dy / 2));
    } else if (previous.pan) {
      setCamera(c => panBy(c, dx, dy));
    } else {
      velocity.current = {
        azimuth: dx * 0.008,
        elevation: dy * 0.006
      };
      setCamera(c => clampCamera({
        ...c,
        azimuth: c.azimuth + dx * 0.008,
        elevation: c.elevation + dy * 0.006
      }));
    }
    pointers.current.set(event.pointerId, {
      ...previous,
      x: event.clientX,
      y: event.clientY
    });
  };
  const onPointerUp = event => {
    const previous = pointers.current.get(event.pointerId);
    pointers.current.delete(event.pointerId);
    if (!pointers.current.size && previous && !previous.pan) startInertia();
  };
  const onWheel = event => setCamera(c => clampCamera({
    ...c,
    zoom: c.zoom * (event.deltaY > 0 ? 0.92 : 1.08)
  }));
  const onKeyDown = event => {
    const moves = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setCamera(c => event.shiftKey ? panBy(c, -move[0] * 40, -move[1] * 40) : clampCamera({
        ...c,
        azimuth: c.azimuth + move[0] * 0.12,
        elevation: c.elevation + move[1] * 0.08
      }));
    }
    if (event.key === '+' || event.key === '=') setCamera(c => clampCamera({
      ...c,
      zoom: c.zoom * 1.1
    }));
    if (event.key === '-') setCamera(c => clampCamera({
      ...c,
      zoom: c.zoom / 1.1
    }));
    if (event.key === '0') resetView();
  };
  // Export the picture with its labels.
  const composite = () => {
    const out = document.createElement('canvas');
    out.width = glRef.current.width;
    out.height = glRef.current.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(glRef.current, 0, 0);
    ctx.drawImage(overlayRef.current, 0, 0, out.width, out.height);
    return out;
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("canvas", {
    ref: el => {
      glRef.current = el;
      sizeRef.current = el;
      if (el) el.simComposite = composite;
    },
    "data-export": "3d",
    className: "sim-view__fade",
    tabIndex: 0,
    role: "img",
    "aria-label": `3D block diagram at year ${Math.round(year)}: top of the aquifer with the caprock removed, ${exaggeration}× vertical exaggeration; the side walls and fault scarps show the CO₂ column in section. Drag or use the arrow keys to orbit, Shift-drag, right-drag or Shift-arrow keys to pan, scroll or press plus and minus to zoom, press 0 to reset.`,
    style: {
      cursor: 'grab'
    },
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: onPointerUp,
    onPointerCancel: onPointerUp,
    onPointerLeave: () => setReadout(null),
    onContextMenu: event => event.preventDefault(),
    onWheel: onWheel,
    onDoubleClick: resetView,
    onKeyDown: onKeyDown
  }), /*#__PURE__*/React.createElement("canvas", {
    ref: overlayRef,
    "aria-hidden": "true",
    style: {
      pointerEvents: 'none'
    }
  }), !supported && /*#__PURE__*/React.createElement("div", {
    className: "sim-view-note",
    style: {
      top: '45%',
      bottom: 'auto',
      left: 0,
      right: 0,
      textAlign: 'center'
    }
  }, "This browser does not provide WebGL 2, which the 3D view needs. The map and the section show the same run."), readout && /*#__PURE__*/React.createElement(SimReadout, {
    readout: readout,
    size: size
  }), /*#__PURE__*/React.createElement("div", {
    className: "sim-view-controls"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "sim-exaggeration",
    title: "Vertical exaggeration"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sim-view-controls__long"
  }, "Vertical exaggeration "), exaggeration, "\xD7"), /*#__PURE__*/React.createElement("input", {
    id: "sim-exaggeration",
    className: "sim-range",
    type: "range",
    min: 5,
    max: 80,
    step: 1,
    value: exaggeration,
    "aria-label": "Vertical exaggeration",
    "aria-valuetext": `${exaggeration} times`,
    onChange: event => setExaggeration(Number(event.target.value))
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button",
    onClick: resetView
  }, "Reset view")));
};

// ---------------------------------------------------------------- section

const SimSectionView = ({
  model,
  frame,
  palette,
  scenario,
  line,
  layers,
  reducedMotion,
  year
}) => {
  const [sizeRef, size] = simUseSize();
  const data = useMemo(() => {
    if (!line || !frame) return null;
    const depthAt = VE2D.depthField(scenario);
    const thicknessAt = VE2D.thicknessField(scenario);
    const samples = 360;
    const length = Math.hypot(line.x1 - line.x0, line.y1 - line.y0) || 1;
    const points = [];
    for (let s = 0; s <= samples; s++) {
      const t = s / samples;
      const x = Math.max(1, Math.min(model.Lx - 1, line.x0 + (line.x1 - line.x0) * t));
      const y = Math.max(1, Math.min(model.Ly - 1, line.y0 + (line.y1 - line.y0) * t));
      const zt = depthAt(x, y);
      const H = thicknessAt(x, y);
      const spill = simSampleField(model, model.zSpill, x, y);
      points.push({
        d: t * length,
        x,
        y,
        zt,
        H,
        cap: simSampleField(model, model.disCapacity, x, y),
        h: Math.max(0, simSampleField(model, frame.h, x, y)),
        hMax: Math.max(0, simSampleField(model, frame.hMax, x, y)),
        md: Math.max(0, simSampleField(model, frame.md, x, y)),
        closure: Number.isFinite(spill) ? Math.max(0, spill - simSampleField(model, model.zt, x, y)) : H
      });
    }
    const crossings = [];
    model.faultLines.forEach(([ax, ay, bx, by], index) => {
      const rx = line.x1 - line.x0;
      const ry = line.y1 - line.y0;
      const sx = bx - ax;
      const sy = by - ay;
      const den = rx * sy - ry * sx;
      if (Math.abs(den) < 1e-9) return;
      const u = ((ax - line.x0) * sy - (ay - line.y0) * sx) / den;
      const v = ((ax - line.x0) * ry - (ay - line.y0) * rx) / den;
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) crossings.push({
        index,
        d: u * length,
        x: line.x0 + rx * u,
        y: line.y0 + ry * u
      });
    });
    // Distance from the well to the line, and where the well projects onto it.
    const wx = model.wellX - line.x0;
    const wy = model.wellY - line.y0;
    const along = (wx * (line.x1 - line.x0) + wy * (line.y1 - line.y0)) / length;
    const offset = Math.abs(wx * (line.y1 - line.y0) - wy * (line.x1 - line.x0)) / length;
    return {
      points,
      length,
      crossings,
      well: offset < 600 && along >= 0 && along <= length ? along : null
    };
  }, [line, frame, model, scenario]);
  if (!data || !size.width) return /*#__PURE__*/React.createElement("svg", {
    ref: sizeRef,
    className: "sim-view__svg"
  });
  const {
    points,
    length,
    crossings,
    well
  } = data;
  const W = size.width;
  const Hpx = size.height;
  const m = {
    left: 64,
    right: 24,
    top: 66,
    bottom: W < 560 ? 104 : 74
  };
  let zMin = Infinity;
  let zMax = -Infinity;
  for (const p of points) {
    zMin = Math.min(zMin, p.zt);
    zMax = Math.max(zMax, p.zt + p.H);
  }
  const top = zMin - SIM_CAPROCK_DRAWN - 50;
  const bottom = zMax + 50;
  const sx = d => m.left + (W - m.left - m.right) * d / length;
  const sy = z => m.top + (Hpx - m.top - m.bottom) * (z - top) / (bottom - top);
  const exaggeration = (Hpx - m.top - m.bottom) / (bottom - top) / ((W - m.left - m.right) / length);
  const pathBetween = (upper, lower) => {
    let d = `M${sx(points[0].d).toFixed(1)},${sy(upper(points[0])).toFixed(1)}`;
    for (const p of points) d += `L${sx(p.d).toFixed(1)},${sy(upper(p)).toFixed(1)}`;
    for (let k = points.length - 1; k >= 0; k--) d += `L${sx(points[k].d).toFixed(1)},${sy(lower(points[k])).toFixed(1)}`;
    return `${d}Z`;
  };
  const injecting = year < model.injYears;
  const fingers = points.filter((p, k) => k % 14 === 7 && p.md > 0.02 * p.cap && p.md < 0.95 * p.cap && p.h > 0.5);
  const leaking = crossings.filter(c => frame.leaking?.[c.index]);
  const depthTicks = simTicks(top, bottom, 5).filter(t => t > top && t < bottom);
  const distanceTicks = simTicks(0, length / 1000, 6);
  return /*#__PURE__*/React.createElement("svg", {
    ref: sizeRef,
    className: "sim-view__svg sim-view__fade",
    viewBox: `0 0 ${W} ${Hpx}`,
    role: "img",
    "aria-label": `Vertical section A–A′ at year ${Math.round(year)}, ${(length / 1000).toFixed(1)} km long, vertical exaggeration ${Math.round(exaggeration)} times.`
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("pattern", {
    id: "sim-shale",
    width: "18",
    height: "6",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "18",
    height: "6",
    fill: palette.rockCap
  }), /*#__PURE__*/React.createElement("path", {
    d: "M1 3h9M12 1h5",
    stroke: palette.inkFaint,
    strokeOpacity: "0.35",
    strokeWidth: "1"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "sim-sand",
    width: "9",
    height: "9",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "9",
    height: "9",
    fill: palette.rockAquifer
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "0.9",
    fill: palette.inkFaint,
    fillOpacity: "0.45"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6.5",
    cy: "6",
    r: "0.7",
    fill: palette.inkFaint,
    fillOpacity: "0.35"
  })), /*#__PURE__*/React.createElement("pattern", {
    id: "sim-residual",
    width: "6",
    height: "6",
    patternUnits: "userSpaceOnUse",
    patternTransform: "rotate(45)"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "6",
    height: "6",
    fill: palette.residual,
    fillOpacity: "0.25"
  }), /*#__PURE__*/React.createElement("rect", {
    width: "2",
    height: "6",
    fill: palette.glowResidual
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "sim-plume",
    x1: "0",
    x2: "0",
    y1: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: palette.glowFree
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: palette.free
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "sim-dissolved",
    x1: "0",
    x2: "0",
    y1: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: palette.glowDissolved,
    stopOpacity: "0.2"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: palette.glowDissolved,
    stopOpacity: "0.75"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: "sim-aquifer-clip"
  }, /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt, p => p.zt + p.H)
  }))), /*#__PURE__*/React.createElement("rect", {
    x: m.left,
    y: m.top,
    width: W - m.left - m.right,
    height: Hpx - m.top - m.bottom,
    fill: palette.rockOver
  }), simTicks(top, bottom, 12).map(t => /*#__PURE__*/React.createElement("line", {
    key: `s${t}`,
    x1: m.left,
    x2: W - m.right,
    y1: sy(t),
    y2: sy(t),
    stroke: palette.rule,
    strokeOpacity: "0.5"
  })), /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt - SIM_CAPROCK_DRAWN, p => p.zt),
    fill: "url(#sim-shale)"
  }), /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt, p => p.zt + p.H),
    fill: "url(#sim-sand)"
  }), /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt + p.H, () => bottom),
    fill: palette.rockBase
  }), /*#__PURE__*/React.createElement("g", {
    clipPath: "url(#sim-aquifer-clip)"
  }, /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt + p.H * (1 - Math.min(1, p.md / p.cap)), p => p.zt + p.H),
    fill: "url(#sim-dissolved)"
  }), !reducedMotion && fingers.map((p, k) => /*#__PURE__*/React.createElement("path", {
    key: k,
    className: "sim-finger",
    style: {
      animationDelay: `${k % 7 * -0.6}s`
    },
    d: `M${sx(p.d)},${sy(p.zt + p.hMax)} q 3 ${(sy(p.zt + p.H) - sy(p.zt + p.hMax)) * 0.5} -1 ${(sy(p.zt + p.H) - sy(p.zt + p.hMax)) * 0.9}`,
    stroke: palette.glowDissolved,
    strokeOpacity: "0.55",
    strokeWidth: "1.2",
    fill: "none",
    strokeLinecap: "round"
  })), layers.residual !== false && /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt + p.h, p => p.zt + Math.max(p.h, p.hMax)),
    fill: "url(#sim-residual)"
  }), /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt, p => p.zt + p.h),
    fill: "url(#sim-plume)"
  }), /*#__PURE__*/React.createElement("path", {
    d: pathBetween(p => p.zt, p => p.zt + Math.min(p.h, p.closure)),
    fill: palette.glowStructural,
    fillOpacity: "0.85"
  })), /*#__PURE__*/React.createElement("path", {
    d: `M${points.map(p => `${sx(p.d).toFixed(1)},${sy(p.zt).toFixed(1)}`).join('L')}`,
    fill: "none",
    stroke: palette.ink,
    strokeOpacity: "0.55",
    strokeWidth: "1"
  }), crossings.map(c => {
    const x = sx(c.d);
    const fault = model.faults[c.index];
    const lean = simFaultNormal(fault)[0] * (line.x1 - line.x0) + simFaultNormal(fault)[1] * (line.y1 - line.y0) >= 0 ? 1 : -1;
    const run = (sy(bottom) - sy(top)) * 0.18;
    return /*#__PURE__*/React.createElement("g", {
      key: c.index
    }, /*#__PURE__*/React.createElement("line", {
      x1: x - lean * run / 2,
      y1: m.top,
      x2: x + lean * run / 2,
      y2: Hpx - m.bottom,
      stroke: frame.leaking?.[c.index] ? palette.glowLeaked : palette.ink,
      strokeOpacity: "0.85",
      strokeWidth: "1.6"
    }), /*#__PURE__*/React.createElement("text", {
      x: x - lean * run / 2,
      y: m.top - 8,
      textAnchor: "middle",
      fill: palette.ink,
      fontSize: "12",
      fontWeight: "700"
    }, "F", c.index + 1));
  }), !reducedMotion && leaking.map(c => [0, 1, 2, 3, 4].map(k => {
    const p = points[Math.round(c.d / length * (points.length - 1))];
    return /*#__PURE__*/React.createElement("circle", {
      key: `${c.index}-${k}`,
      className: "sim-bubble",
      style: {
        animationDelay: `${k * -0.7}s`,
        '--rise': `${sy(p.zt - SIM_CAPROCK_DRAWN) - m.top}px`
      },
      cx: sx(c.d) + (k % 2 ? 3 : -3),
      cy: sy(p.zt - SIM_CAPROCK_DRAWN),
      r: 2 + k % 3,
      fill: palette.glowLeaked
    });
  })), well !== null && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: sx(well),
    x2: sx(well),
    y1: m.top - 4,
    y2: sy(points[Math.round(well / length * (points.length - 1))].zt + points[Math.round(well / length * (points.length - 1))].H),
    stroke: palette.ink,
    strokeWidth: "2.5"
  }), [0.2, 0.4, 0.6, 0.8].map(f => {
    const p = points[Math.round(well / length * (points.length - 1))];
    return /*#__PURE__*/React.createElement("line", {
      key: f,
      x1: sx(well) - 6,
      x2: sx(well) + 6,
      y1: sy(p.zt + f * p.H),
      y2: sy(p.zt + f * p.H),
      stroke: palette.ink,
      strokeWidth: "1.5"
    });
  }), injecting && !reducedMotion && /*#__PURE__*/React.createElement("line", {
    className: "sim-inject",
    x1: sx(well),
    x2: sx(well),
    y1: m.top,
    y2: sy(points[Math.round(well / length * (points.length - 1))].zt),
    stroke: palette.glowFree,
    strokeWidth: "2.5",
    strokeDasharray: "6 10"
  }), /*#__PURE__*/React.createElement("text", {
    x: sx(well) + 8,
    y: m.top + 4,
    fill: palette.ink,
    fontSize: "12",
    fontWeight: "700"
  }, "INJ-1")), /*#__PURE__*/React.createElement("rect", {
    x: m.left,
    y: m.top,
    width: W - m.left - m.right,
    height: Hpx - m.top - m.bottom,
    fill: "none",
    stroke: palette.rule
  }), depthTicks.map(t => /*#__PURE__*/React.createElement("text", {
    key: t,
    x: m.left - 8,
    y: sy(t) + 4,
    textAnchor: "end",
    fill: palette.inkFaint,
    fontSize: "11",
    fontFamily: palette.mono
  }, t)), /*#__PURE__*/React.createElement("text", {
    x: 12,
    y: m.top - 8,
    fill: palette.inkFaint,
    fontSize: "11"
  }, "Depth (m)"), distanceTicks.map(t => /*#__PURE__*/React.createElement("text", {
    key: t,
    x: sx(t * 1000),
    y: Hpx - m.bottom + 16,
    textAnchor: "middle",
    fill: palette.inkFaint,
    fontSize: "11",
    fontFamily: palette.mono
  }, t)), /*#__PURE__*/React.createElement("text", {
    x: m.left,
    y: Hpx - m.bottom + 32,
    fill: palette.inkFaint,
    fontSize: "11"
  }, "Distance along A\u2013A\u2032 (km)"), /*#__PURE__*/React.createElement("text", {
    x: W - m.right,
    y: Hpx - m.bottom + 32,
    textAnchor: "end",
    fill: palette.inkFaint,
    fontSize: "11"
  }, "Vertical exaggeration \xD7", Math.round(exaggeration)), /*#__PURE__*/React.createElement("text", {
    x: m.left + 4,
    y: m.top + 16,
    fill: palette.ink,
    fontSize: "13",
    fontWeight: "700"
  }, "A"), /*#__PURE__*/React.createElement("text", {
    x: W - m.right - 4,
    y: m.top + 16,
    textAnchor: "end",
    fill: palette.ink,
    fontSize: "13",
    fontWeight: "700"
  }, "A\u2032"));
};

// File: SimulatorPage.jsx
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
// SimulatorPage.jsx — CO2 Storage Simulator: scenario inputs, streamed results, playback,
// outcomes and the uncertainty study. Views are in SimViews.jsx, charts in SimCharts.jsx,
// the method page in GuidePage.jsx, the physics in ve2d-model.js.
// [destructured React]

// ---------------------------------------------------------------- pure helpers

const SIM_SECTIONS = [{
  id: 'simulator',
  label: 'Simulator'
}, {
  id: 'uncertainty',
  label: 'Uncertainty'
}, {
  id: 'method',
  label: 'Method'
}];
const SIM_VIEWS = [{
  id: 'map',
  label: 'Map'
}, {
  id: '3d',
  label: '3D'
}, {
  id: 'section',
  label: 'Section'
}];
// Stack order bottom to top; colours come from CSS custom properties.
const SIM_INVENTORY = [{
  key: 'dissolved',
  label: 'Dissolved',
  color: '--sim-c-dissolved',
  hint: 'Dissolved in the brine below the plume'
}, {
  key: 'residual',
  label: 'Residually trapped',
  color: '--sim-c-residual',
  hint: 'Disconnected CO₂ left behind as the plume moves'
}, {
  key: 'structural',
  label: 'Structurally trapped',
  color: '--sim-c-structural',
  hint: 'Mobile CO₂ held in a trap above its spill point'
}, {
  key: 'free',
  label: 'Free plume',
  color: '--sim-c-free',
  hint: 'Mobile CO₂ that can still migrate'
}, {
  key: 'exited',
  label: 'Left the model',
  color: '--sim-c-exited',
  hint: 'Migrated out across an open model edge'
}, {
  key: 'leaked',
  label: 'Leaked through faults',
  color: '--sim-c-leaked',
  hint: 'Escaped up a leaky fault zone'
}];
const SIM_FRAME_YEARS = 5;
const SIM_SPEEDS = [25, 60, 150];
const SIM_THEME_KEY = 'co2-simulator-theme';
const SIM_FAULT_KEYS = ['x', 'y', 'strike', 'length', 'throw', 'trans', 'sealCap', 'kf'];
// Typical fracture margin above hydrostatic (fracture ~0.16 bar/m, brine ~0.105 bar/m).
const SIM_FRACTURE_MARGIN_BAR_PER_M = 0.055;
const simFormatMass = kg => {
  const mt = kg / 1e9;
  if (!Number.isFinite(mt) || Math.abs(mt) < 5e-4) return '0 Mt';
  if (Math.abs(mt) < 0.1) return `${(mt * 1000).toFixed(0)} kt`;
  return `${mt.toFixed(mt < 10 ? 2 : 1)} Mt`;
};
const simFormatPercent = (part, whole) => {
  if (!(whole > 0)) return '–';
  const pct = 100 * part / whole;
  if (pct > 0 && pct < 0.1) return '<0.1%';
  return `${pct.toFixed(pct < 10 ? 1 : 0)}%`;
};
const simFormatNumber = (value, digits = 0) => Number(value).toLocaleString('en-GB', {
  maximumFractionDigits: digits,
  minimumFractionDigits: digits
});
const simEncodeScenario = scenario => {
  const params = new URLSearchParams();
  params.set('preset', scenario.preset);
  params.set('grid', scenario.grid);
  params.set('boundary', scenario.boundary);
  for (const key of Object.keys(VE2D.LIMITS)) params.set(key, String(+Number(scenario[key]).toPrecision(6)));
  params.set('faults', scenario.faults.map(fault => SIM_FAULT_KEYS.map(key => +Number(fault[key]).toPrecision(5)).join(',')).join(';'));
  return params.toString();
};

// Hand-edited links are untrusted: everything passes through the engine's normaliser.
const simDecodeScenario = search => {
  const params = new URLSearchParams(search);
  if (!params.has('preset') && !params.has('rateMt') && !params.has('faults')) return null;
  // A preset name is the starting point; anything else in the link overrides it.
  const preset = VE2D.PRESETS[params.get('preset')];
  const raw = preset ? {
    ...VE2D.DEFAULTS,
    ...preset.patch
  } : {};
  for (const [key, value] of params) if (key !== 'faults') raw[key] = value;
  if (params.has('faults')) {
    const text = params.get('faults');
    raw.faults = text === '' ? [] : text.split(';').map(item => {
      const values = item.split(',');
      return Object.fromEntries(SIM_FAULT_KEYS.map((key, index) => [key, values[index]]));
    });
  }
  return VE2D.normalizeScenario(raw);
};
const SIM_HISTORY_KEYS = ['injected', 'free', 'structural', 'residual', 'dissolved', 'exited', 'leaked', 'balance'];
const simInventoryCsv = history => ['year,injected_Mt,free_Mt,structural_Mt,residual_Mt,dissolved_Mt,exited_Mt,leaked_Mt,balance_Mt', ...history.map(row => [row.year, ...SIM_HISTORY_KEYS.map(key => (row[key] / 1e9).toPrecision(8))].join(','))].join('\n');
const simGridCsv = (model, frame) => {
  const rows = ['x_km,y_km,top_depth_m,thickness_m,h_m,hmax_m,dissolved_kg_m2,dp_bar'];
  for (let c = 0; c < model.nx * model.ny; c++) {
    const i = c % model.nx;
    const j = Math.floor(c / model.nx);
    rows.push([((i + 0.5) * model.dx / 1000).toFixed(3), ((j + 0.5) * model.dy / 1000).toFixed(3), model.zt[c].toFixed(2), model.Hc[c].toFixed(2), frame.h[c].toFixed(3), frame.hMax[c].toFixed(3), frame.md[c].toFixed(2), (frame.p[c] / 1e5).toFixed(3)].join(','));
  }
  return rows.join('\n');
};
const simInitialRun = () => ({
  id: 0,
  status: 'idle',
  scenario: null,
  model: null,
  frames: [],
  history: [],
  truncated: false,
  error: null
});

// Starting a run keeps the previous scenario paired with the previous fields until the
// worker reports the new model, so no view mixes old results with new geometry.
const simStartRun = (run, id, scenario) => ({
  ...run,
  id,
  status: 'computing',
  pendingScenario: scenario,
  error: null
});

// Advance playback; stop at the end of the run, or at the last computed frame once the
// run is finished (a truncated run ends early).
const simNextYear = (current, dt, yearsPerSecond, {
  years,
  computedYears,
  ready
}) => {
  const next = current + dt * yearsPerSecond;
  if (next >= years) return {
    year: years <= computedYears ? years : computedYears,
    stop: true
  };
  if (next >= computedYears) return {
    year: computedYears,
    stop: ready
  };
  return {
    year: next,
    stop: false
  };
};

// Reducer for worker messages; anything from an older run id is ignored.
const simApplyWorkerMessage = (run, message) => {
  if (!message || message.id !== run.id) return run;
  switch (message.type) {
    case 'model':
      return {
        ...run,
        status: 'computing',
        scenario: run.pendingScenario ?? run.scenario,
        model: message.model,
        frames: [],
        history: [],
        truncated: false,
        error: null
      };
    case 'frame':
      return {
        ...run,
        frames: run.frames.concat([message.snap]),
        history: run.history.concat(message.rows)
      };
    case 'done':
      return {
        ...run,
        status: 'ready',
        history: run.history.concat(message.rows),
        truncated: !!message.truncated
      };
    case 'error':
      return {
        ...run,
        status: 'error',
        error: message.message
      };
    default:
      return run;
  }
};

// Linear interpolation between the two snapshots around `year`.
const simFrameAt = (frames, year) => {
  if (!frames || !frames.length) return null;
  const position = Math.max(0, year / SIM_FRAME_YEARS);
  const index = Math.min(frames.length - 1, Math.floor(position));
  const a = frames[index];
  const b = frames[Math.min(frames.length - 1, index + 1)];
  const w = a === b ? 0 : Math.min(1, position - index);
  if (w < 1e-6) return a;
  const mix = key => {
    const from = a[key];
    const to = b[key];
    const out = new Float32Array(from.length);
    for (let c = 0; c < from.length; c++) out[c] = from[c] + (to[c] - from[c]) * w;
    return out;
  };
  return {
    year,
    h: mix('h'),
    hMax: mix('hMax'),
    md: mix('md'),
    p: mix('p'),
    fx: mix('fx'),
    fy: mix('fy'),
    leaking: w < 0.5 ? a.leaking : b.leaking
  };
};
const simRowAt = (history, year) => {
  if (!history || !history.length) return null;
  const index = Math.min(history.length - 1, Math.max(0, Math.floor(year)));
  const a = history[index];
  const b = history[Math.min(history.length - 1, index + 1)];
  const w = Math.min(1, Math.max(0, year - index));
  if (a === b || w === 0) return a;
  const row = {
    year
  };
  for (const key of Object.keys(a)) row[key] = typeof a[key] === 'number' ? a[key] + (b[key] - a[key]) * w : a[key];
  return row;
};
const simStoredTheme = storage => {
  try {
    const value = storage?.getItem(SIM_THEME_KEY);
    return value === 'day' || value === 'night' ? value : 'night';
  } catch (_) {
    return 'night';
  }
};
const simPersistTheme = (theme, storage) => {
  try {
    storage?.setItem(SIM_THEME_KEY, theme);
  } catch (_) {/* storage blocked: the choice lasts for this visit */}
};
const simCopyText = async (text, clipboard) => {
  try {
    if (!clipboard?.writeText) return false;
    await clipboard.writeText(text);
    return true;
  } catch (_) {
    return false;
  }
};
const simDownload = (content, filename, type) => {
  const blob = content instanceof Blob ? content : new Blob([content], {
    type
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};
const simMessages = (model, row, frame, run) => {
  const messages = [];
  if (!model || !row) return messages;
  if (run.truncated) messages.push({
    tone: 'danger',
    icon: 'fa-triangle-exclamation',
    text: `The run stopped at year ${run.history.at(-1)?.year}: these inputs need more time steps than the browser budget allows.`
  });
  model.faults.forEach((fault, index) => {
    if (frame?.leaking?.[index]) messages.push({
      tone: 'danger',
      icon: 'fa-arrow-up',
      text: `Fault F${index + 1} is leaking: the CO₂ column against it exceeds its ${fault.sealCap} m seal capacity.`
    });
  });
  const marginBar = SIM_FRACTURE_MARGIN_BAR_PER_M * model.depth;
  if (row.bhpPeak / 1e5 > marginBar) messages.push({
    tone: 'warning',
    icon: 'fa-gauge-high',
    text: `Peak pressure rise at the well, ${simFormatNumber(row.bhpPeak / 1e5)} bar, exceeds a typical fracture margin of about ${simFormatNumber(marginBar)} bar at ${simFormatNumber(model.depth)} m.`
  });
  const leakingNow = frame?.leaking && [...frame.leaking].some(Boolean);
  if (!leakingNow && row.leaked > 0) messages.push({
    tone: 'warning',
    icon: 'fa-arrow-up',
    text: `${simFormatMass(row.leaked)} has leaked through faults so far; no fault is leaking now.`
  });
  if (row.exited > 1e-4 * row.injected) messages.push({
    tone: 'warning',
    icon: 'fa-arrow-right-from-bracket',
    text: `${simFormatMass(row.exited)} has left the model across an open edge.`
  });
  if (!messages.length && row.injected > 0) messages.push({
    tone: 'info',
    icon: 'fa-circle-check',
    text: 'Nothing has leaked or left the model so far.'
  });
  return messages;
};

// Default section A–A′: through the injector and the crest of the largest trap, edge to
// edge; east–west through the injector when there is no trap.
const simDefaultSectionLine = model => {
  const trap = model.traps.slice().sort((a, b) => b.capacity - a.capacity)[0];
  const wx = model.wellX;
  const wy = model.wellY;
  let dx = 1;
  let dy = 0;
  if (trap) {
    const cx = (trap.crestCell % model.nx + 0.5) * model.dx;
    const cy = (Math.floor(trap.crestCell / model.nx) + 0.5) * model.dy;
    const length = Math.hypot(cx - wx, cy - wy);
    if (length > model.dx) {
      dx = (cx - wx) / length;
      dy = (cy - wy) / length;
    }
  }
  const reach = sign => {
    const tx = dx * sign > 0 ? (model.Lx - wx) / (dx * sign) : dx * sign < 0 ? -wx / (dx * sign) : Infinity;
    const ty = dy * sign > 0 ? (model.Ly - wy) / (dy * sign) : dy * sign < 0 ? -wy / (dy * sign) : Infinity;
    return Math.min(tx, ty);
  };
  const back = reach(-1);
  const ahead = reach(1);
  const line = {
    x0: wx - dx * back,
    y0: wy - dy * back,
    x1: wx + dx * ahead,
    y1: wy + dy * ahead
  };
  // A is the western end, so the section reads west to east like the map.
  return line.x0 <= line.x1 ? line : {
    x0: line.x1,
    y0: line.y1,
    x1: line.x0,
    y1: line.y0
  };
};
const simReadPalette = element => {
  const style = element ? getComputedStyle(element) : null;
  const v = (name, fallback) => style && style.getPropertyValue(name).trim() || fallback;
  return {
    free: v('--sim-c-free', '#23a07a'),
    structural: v('--sim-c-structural', '#c08417'),
    residual: v('--sim-c-residual', '#cf5f9e'),
    dissolved: v('--sim-c-dissolved', '#3b82d4'),
    exited: v('--sim-c-exited', '#8270e0'),
    leaked: v('--sim-c-leaked', '#d94a3f'),
    glowFree: v('--sim-glow-free', '#4fe0b0'),
    glowStructural: v('--sim-glow-structural', '#f0b649'),
    glowResidual: v('--sim-glow-residual', '#ee8ac2'),
    glowDissolved: v('--sim-glow-dissolved', '#6fb0ff'),
    glowLeaked: v('--sim-glow-leaked', '#ff6b5e'),
    depth: [0, 1, 2, 3, 4, 5, 6].map(i => v(`--sim-depth-${i}`, '#555')),
    contour: v('--sim-contour', 'rgba(232,236,244,0.32)'),
    stage: v('--sim-stage', '#0a0f1c'),
    ink: v('--sim-ink', '#e8ecf4'),
    inkMuted: v('--sim-ink-muted', '#9aa6bf'),
    inkFaint: v('--sim-ink-faint', '#6f7b96'),
    rule: v('--sim-rule', '#26324d'),
    surface: v('--sim-surface', '#111a2e'),
    accent: v('--sim-accent', '#f2c66d'),
    rockCap: v('--sim-rock-cap', '#3b3f55'),
    rockAquifer: v('--sim-rock-aquifer', '#2a3350'),
    rockBase: v('--sim-rock-base', '#151a2b'),
    rockOver: v('--sim-rock-over', '#10162a'),
    font: v('--sim-font-ui', 'Open Sans, sans-serif'),
    mono: v('--sim-font-mono', 'monospace')
  };
};

// Field metadata: labels, units and one-line explanations shown under each input.
const SIM_FIELDS = {
  rateMt: {
    label: 'Injection rate',
    unit: 'Mt/yr',
    digits: 1,
    hint: 'CO₂ mass injected each year.'
  },
  injYears: {
    label: 'Injection period',
    unit: 'years',
    digits: 0
  },
  wellX: {
    label: 'Well, east',
    unit: 'km',
    digits: 1,
    hint: 'Drag the well on the map to move it.'
  },
  wellY: {
    label: 'Well, north',
    unit: 'km',
    digits: 1
  },
  years: {
    label: 'Simulated period',
    unit: 'years',
    digits: 0
  },
  permMd: {
    label: 'Permeability',
    unit: 'mD',
    digits: 0,
    log: true
  },
  porosity: {
    label: 'Porosity',
    unit: '',
    digits: 2
  },
  thickness: {
    label: 'Aquifer thickness',
    unit: 'm',
    digits: 0,
    hint: 'Mean thickness of the aquifer.'
  },
  thicknessVar: {
    label: 'Thickness variation',
    unit: '%',
    digits: 0,
    hint: 'Spread around the mean: sand belts thicken and thin along strike.'
  },
  dipDeg: {
    label: 'Regional dip',
    unit: '°',
    digits: 1
  },
  dipAz: {
    label: 'Dip direction',
    unit: '° from N',
    digits: 0,
    hint: 'Direction in which the caprock deepens; CO₂ rises the other way. Domes and undulations run along strike, across it.'
  },
  domes: {
    label: 'Domes',
    unit: '',
    digits: 0
  },
  domeRelief: {
    label: 'Dome relief',
    unit: 'm',
    digits: 0
  },
  roughness: {
    label: 'Caprock roughness',
    unit: 'm',
    digits: 0,
    hint: 'RMS height of undulations elongated along strike. They hold CO₂ in many small traps.'
  },
  sgr: {
    label: 'Residual CO₂ saturation',
    unit: '',
    digits: 2,
    hint: 'Fraction of pore space left as trapped CO₂ when brine returns.'
  },
  swr: {
    label: 'Residual brine saturation',
    unit: '',
    digits: 2
  },
  krg: {
    label: 'CO₂ relative permeability',
    unit: '',
    digits: 2,
    hint: 'End-point value at residual brine saturation.'
  },
  disRate: {
    label: 'Dissolution rate',
    unit: 'kg/m²/yr',
    digits: 2,
    hint: 'Convective dissolution below the plume.'
  },
  disCap: {
    label: 'CO₂ solubility',
    unit: 'kg/m³',
    digits: 0,
    hint: 'Mass of CO₂ a cubic metre of brine can hold.'
  },
  rhoCo2: {
    label: 'CO₂ density',
    unit: 'kg/m³',
    digits: 0
  },
  rhoBrine: {
    label: 'Brine density',
    unit: 'kg/m³',
    digits: 0
  },
  muCo2: {
    label: 'CO₂ viscosity',
    unit: 'mPa·s',
    digits: 3
  },
  muBrine: {
    label: 'Brine viscosity',
    unit: 'mPa·s',
    digits: 2
  },
  ct: {
    label: 'Total compressibility',
    unit: '×10⁻⁴ /bar',
    digits: 1
  }
};
const SIM_FAULT_FIELDS = {
  x: {
    label: 'Centre, east',
    unit: 'km',
    digits: 1
  },
  y: {
    label: 'Centre, north',
    unit: 'km',
    digits: 1
  },
  strike: {
    label: 'Strike',
    unit: '° from N',
    digits: 0,
    hint: 'Facing along strike, the hanging wall is on the right.'
  },
  length: {
    label: 'Length',
    unit: 'km',
    digits: 1
  },
  throw: {
    label: 'Throw',
    unit: 'm',
    digits: 0,
    hint: 'Vertical offset; a throw above the aquifer thickness seals the fault.'
  },
  trans: {
    label: 'Cross-fault transmissibility',
    unit: '',
    digits: 2,
    hint: '0 seals the fault, 1 is no barrier.'
  },
  sealCap: {
    label: 'Seal capacity',
    unit: 'm',
    digits: 0,
    hint: 'CO₂ column the fault zone holds before it leaks.'
  },
  kf: {
    label: 'Fault-zone permeability',
    unit: 'mD',
    digits: 0,
    hint: '0 means the fault never leaks vertically.'
  }
};

// ---------------------------------------------------------------- hooks

const useSimSimulation = scenario => {
  const [run, setRun] = useState(simInitialRun);
  const workerRef = useRef(null);
  const busyRef = useRef(false);
  const idRef = useRef(0);
  const key = JSON.stringify(scenario);
  useEffect(() => {
    const timer = setTimeout(() => {
      const id = ++idRef.current;
      if (busyRef.current && workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (!workerRef.current) {
        try {
          const worker = new Worker('./simulation-worker.js?v=3');
          worker.onmessage = ({
            data
          }) => {
            if (data.type === 'done' || data.type === 'error') busyRef.current = false;
            setRun(current => simApplyWorkerMessage(current, data));
          };
          worker.onerror = event => {
            busyRef.current = false;
            setRun(current => ({
              ...current,
              status: 'error',
              error: event.message || 'The simulation worker failed to start.'
            }));
          };
          workerRef.current = worker;
        } catch (error) {
          setRun(current => ({
            ...current,
            id,
            status: 'error',
            error: 'This browser blocked the simulation worker.'
          }));
          return;
        }
      }
      busyRef.current = true;
      setRun(current => simStartRun(current, id, scenario));
      workerRef.current.postMessage({
        type: 'run',
        id,
        scenario
      });
    }, idRef.current === 0 ? 0 : 250);
    return () => clearTimeout(timer);
  }, [key]);
  useEffect(() => () => workerRef.current?.terminate(), []);
  return run;
};
const useSimReducedMotion = () => {
  const [reduced, setReduced] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return reduced;
};

// ---------------------------------------------------------------- inputs

const SimField = ({
  name,
  meta,
  value,
  limits,
  onChange
}) => {
  const [min, max, step] = limits;
  const [draft, setDraft] = useState(null);
  const [feedback, setFeedback] = useState('');
  const id = `sim-field-${name}`;
  const toSlider = v => meta.log ? Math.log10(v) : v;
  const fromSlider = v => meta.log ? Math.round(10 ** v) : v;
  const sliderMin = toSlider(min);
  const sliderMax = toSlider(max);
  const fill = `${(100 * (toSlider(value) - sliderMin) / (sliderMax - sliderMin || 1)).toFixed(1)}%`;
  const commit = text => {
    const number = Number(text);
    if (text === '' || !Number.isFinite(number)) {
      setFeedback(`Enter a number between ${min} and ${max}.`);
      return;
    }
    const bounded = Math.min(max, Math.max(min, number));
    setFeedback(bounded !== number ? `Kept within ${min}–${max} ${meta.unit}.` : '');
    setDraft(null);
    onChange(bounded);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-field__top"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: id
  }, meta.label), /*#__PURE__*/React.createElement("span", {
    className: "sim-field__value"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "number",
    inputMode: "decimal",
    min: min,
    max: max,
    step: step,
    value: draft ?? +Number(value).toFixed(meta.digits ?? 2),
    "aria-describedby": feedback ? `${id}-feedback` : meta.hint ? `${id}-hint` : undefined,
    "aria-invalid": feedback && draft !== null ? 'true' : undefined,
    onChange: event => setDraft(event.target.value),
    onBlur: event => {
      if (draft !== null) commit(event.target.value);
    },
    onKeyDown: event => {
      if (event.key === 'Enter') commit(event.currentTarget.value);
    }
  }), meta.unit && /*#__PURE__*/React.createElement("span", null, meta.unit))), /*#__PURE__*/React.createElement("input", {
    className: "sim-range",
    type: "range",
    "aria-label": meta.label,
    min: sliderMin,
    max: sliderMax,
    step: meta.log ? 0.01 : step,
    value: toSlider(value),
    style: {
      '--fill': fill
    },
    onChange: event => {
      setDraft(null);
      setFeedback('');
      onChange(fromSlider(Number(event.target.value)));
    }
  }), feedback ? /*#__PURE__*/React.createElement("p", {
    className: "sim-field__feedback",
    id: `${id}-feedback`,
    role: "status"
  }, feedback) : meta.hint && /*#__PURE__*/React.createElement("p", {
    className: "sim-field__hint",
    id: `${id}-hint`
  }, meta.hint));
};
const SimChoice = ({
  label,
  options,
  value,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  className: "sim-field"
}, /*#__PURE__*/React.createElement("div", {
  className: "sim-field__top"
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 600,
    fontSize: 13.5
  }
}, label)), /*#__PURE__*/React.createElement("div", {
  className: "sim-choice",
  role: "group",
  "aria-label": label,
  style: {
    '--choices': options.length
  }
}, options.map(option => /*#__PURE__*/React.createElement("button", {
  key: option.id,
  type: "button",
  "aria-pressed": value === option.id,
  onClick: () => onChange(option.id)
}, option.label))), options.find(option => option.id === value)?.hint && /*#__PURE__*/React.createElement("p", {
  className: "sim-field__hint"
}, options.find(option => option.id === value).hint));
const SimGroup = ({
  title,
  open = true,
  children
}) => /*#__PURE__*/React.createElement("details", {
  className: "sim-group",
  open: open
}, /*#__PURE__*/React.createElement("summary", null, title), /*#__PURE__*/React.createElement("div", {
  className: "sim-group__body"
}, children));
const SimInputs = ({
  scenario,
  onChange,
  onPreset,
  onRandom,
  onClose
}) => {
  const field = key => /*#__PURE__*/React.createElement(SimField, {
    key: key,
    name: key,
    meta: SIM_FIELDS[key],
    value: scenario[key],
    limits: VE2D.LIMITS[key],
    onChange: value => onChange({
      [key]: value
    })
  });
  const setFault = (index, patch) => onChange({
    faults: scenario.faults.map((fault, i) => i === index ? {
      ...fault,
      ...patch
    } : fault)
  });
  const presetIds = Object.keys(VE2D.PRESETS);
  const random = VE2D.RANDOM_STYLES[scenario.preset];
  const preset = VE2D.PRESETS[scenario.preset] || random;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sim-rail__head"
  }, /*#__PURE__*/React.createElement("h2", null, "Scenario"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-icon-button sim-sheet-close",
    onClick: onClose,
    "aria-label": "Close inputs"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-times",
    "aria-hidden": "true"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sim-scenario"
  }, /*#__PURE__*/React.createElement("label", {
    className: "sim-sr-only",
    htmlFor: "sim-preset"
  }, "Scenario"), /*#__PURE__*/React.createElement("select", {
    id: "sim-preset",
    value: preset ? scenario.preset : 'custom',
    onChange: event => onPreset(event.target.value)
  }, presetIds.map(id => /*#__PURE__*/React.createElement("option", {
    key: id,
    value: id
  }, VE2D.PRESETS[id].label)), random && /*#__PURE__*/React.createElement("option", {
    value: scenario.preset
  }, `Random: ${random.label}`), !preset && /*#__PURE__*/React.createElement("option", {
    value: "custom"
  }, "Custom")), /*#__PURE__*/React.createElement("p", null, preset ? preset.description : 'Your own combination of inputs. Share it with the link button.'), /*#__PURE__*/React.createElement("div", {
    className: "sim-scenario__row"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button",
    onClick: onRandom
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-shuffle",
    "aria-hidden": "true"
  }), " New random structure"))), /*#__PURE__*/React.createElement(SimGroup, {
    title: "Injection"
  }, field('rateMt'), field('injYears'), field('wellX'), field('wellY'), field('years')), /*#__PURE__*/React.createElement(SimGroup, {
    title: "Aquifer"
  }, field('permMd'), field('porosity'), field('thickness'), field('thicknessVar')), /*#__PURE__*/React.createElement(SimGroup, {
    title: "Structure"
  }, field('dipDeg'), field('dipAz'), field('domes'), field('domeRelief'), field('roughness')), /*#__PURE__*/React.createElement(SimGroup, {
    title: `Faults (${scenario.faults.length})`
  }, scenario.faults.map((fault, index) => /*#__PURE__*/React.createElement("div", {
    className: "sim-fault",
    key: index
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-fault__head"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "sim-fault__swatch",
    "data-leaky": fault.kf > 0,
    "aria-hidden": "true"
  }), "Fault F", index + 1), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button sim-button--quiet",
    "aria-label": `Remove fault F${index + 1}`,
    onClick: () => onChange({
      faults: scenario.faults.filter((_, i) => i !== index)
    })
  }, "Remove")), Object.keys(SIM_FAULT_FIELDS).map(key => /*#__PURE__*/React.createElement(SimField, {
    key: key,
    name: `f${index}-${key}`,
    meta: SIM_FAULT_FIELDS[key],
    value: fault[key],
    limits: VE2D.FAULT_LIMITS[key],
    onChange: value => setFault(index, {
      [key]: value
    })
  })))), scenario.faults.length < VE2D.MAX_FAULTS && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button",
    onClick: () => onChange({
      faults: [...scenario.faults, {
        x: 6 + 4 * scenario.faults.length,
        y: 6,
        strike: 20,
        length: 6,
        throw: 10,
        trans: 0.5,
        sealCap: 20,
        kf: 10
      }]
    })
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-plus",
    "aria-hidden": "true"
  }), " Add a fault")), /*#__PURE__*/React.createElement(SimGroup, {
    title: "Trapping and fluids",
    open: false
  }, ['sgr', 'swr', 'krg', 'disRate', 'disCap', 'rhoCo2', 'rhoBrine', 'muCo2', 'muBrine', 'ct'].map(field)), /*#__PURE__*/React.createElement(SimGroup, {
    title: "Model edges and grid",
    open: false
  }, /*#__PURE__*/React.createElement(SimChoice, {
    label: "Model edges",
    value: scenario.boundary,
    onChange: boundary => onChange({
      boundary
    }),
    options: [{
      id: 'open',
      label: 'Open',
      hint: 'Hydrostatic aquifer beyond the edges: brine and CO₂ can leave.'
    }, {
      id: 'closed',
      label: 'Closed',
      hint: 'Sealed compartment: nothing leaves and pressure builds up.'
    }]
  }), /*#__PURE__*/React.createElement(SimChoice, {
    label: "Grid",
    value: scenario.grid,
    onChange: grid => onChange({
      grid
    }),
    options: [{
      id: 'coarse',
      label: '500 m',
      hint: '40 × 24 cells: fastest.'
    }, {
      id: 'standard',
      label: '250 m',
      hint: '80 × 48 cells.'
    }, {
      id: 'fine',
      label: '167 m',
      hint: '120 × 72 cells: slowest, most detail.'
    }]
  })));
};

// ---------------------------------------------------------------- outcomes

const SimOutcomes = ({
  model,
  row,
  frame,
  run,
  history,
  year,
  onSeek
}) => {
  if (!model || !row) {
    return /*#__PURE__*/React.createElement("div", {
      className: "sim-outcome-section"
    }, /*#__PURE__*/React.createElement("h3", null, "Outcomes"), /*#__PURE__*/React.createElement("p", {
      className: "sim-field__hint"
    }, run.status === 'error' ? run.error : 'Running the scenario…'));
  }
  const total = SIM_INVENTORY.reduce((sum, item) => sum + row[item.key], 0);
  const messages = simMessages(model, row, frame, run);
  const balance = row.injected > 0 ? Math.abs(row.balance) / row.injected : 0;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    className: "sim-outcome-section",
    "aria-labelledby": "sim-where"
  }, /*#__PURE__*/React.createElement("h3", {
    id: "sim-where"
  }, "Where the CO\u2082 is ", /*#__PURE__*/React.createElement("span", null, "at year ", Math.round(year))), /*#__PURE__*/React.createElement("div", {
    className: "sim-stackbar",
    role: "img",
    "aria-label": "Share of injected CO\u2082 in each class"
  }, SIM_INVENTORY.map(item => /*#__PURE__*/React.createElement("span", {
    key: item.key,
    style: {
      '--swatch': `var(${item.color})`,
      flexGrow: total > 0 ? row[item.key] / total : 0
    }
  }))), /*#__PURE__*/React.createElement("ul", {
    className: "sim-inventory"
  }, SIM_INVENTORY.slice().reverse().map(item => /*#__PURE__*/React.createElement("li", {
    key: item.key,
    title: item.hint
  }, /*#__PURE__*/React.createElement("span", {
    className: "sim-swatch",
    style: {
      '--swatch': `var(${item.color})`
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sim-inventory__label"
  }, item.label), /*#__PURE__*/React.createElement("span", {
    className: "sim-inventory__value"
  }, simFormatMass(row[item.key])), /*#__PURE__*/React.createElement("span", {
    className: "sim-inventory__pct"
  }, simFormatPercent(row[item.key], row.injected))))), /*#__PURE__*/React.createElement("div", {
    className: "sim-inventory__total"
  }, /*#__PURE__*/React.createElement("span", null, "Injected ", simFormatMass(row.injected)), /*#__PURE__*/React.createElement("span", {
    title: "Injected minus every class, relative to injected"
  }, "Mass balance error ", balance < 1e-12 ? '< 10⁻¹²' : balance.toExponential(1)))), /*#__PURE__*/React.createElement("section", {
    className: "sim-outcome-section",
    "aria-labelledby": "sim-time"
  }, /*#__PURE__*/React.createElement("h3", {
    id: "sim-time"
  }, "Through time"), /*#__PURE__*/React.createElement(SimInventoryChart, {
    history: history,
    year: year,
    years: model.years,
    injYears: model.injYears,
    onSeek: onSeek
  })), /*#__PURE__*/React.createElement("section", {
    className: "sim-outcome-section",
    "aria-labelledby": "sim-plume"
  }, /*#__PURE__*/React.createElement("h3", {
    id: "sim-plume"
  }, "Plume and pressure"), /*#__PURE__*/React.createElement("dl", {
    className: "sim-kpis"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "CO\u2082 footprint"), /*#__PURE__*/React.createElement("dd", null, simFormatNumber(row.footprint / 1e6, 1), /*#__PURE__*/React.createElement("small", null, "km\xB2"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Thickest column"), /*#__PURE__*/React.createElement("dd", null, simFormatNumber(row.maxColumn, 1), /*#__PURE__*/React.createElement("small", null, "m"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Mobile plume reach"), /*#__PURE__*/React.createElement("dd", null, simFormatNumber(row.migration / 1000, 1), /*#__PURE__*/React.createElement("small", null, "km from well"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, "Peak pressure rise at the well"), /*#__PURE__*/React.createElement("dd", null, simFormatNumber(row.bhpPeak / 1e5, 1), /*#__PURE__*/React.createElement("small", null, "bar"))))), /*#__PURE__*/React.createElement("section", {
    className: "sim-outcome-section",
    "aria-labelledby": "sim-notes"
  }, /*#__PURE__*/React.createElement("h3", {
    id: "sim-notes"
  }, "Notes"), /*#__PURE__*/React.createElement("ul", {
    className: "sim-messages"
  }, messages.map(message => /*#__PURE__*/React.createElement("li", {
    key: message.text,
    "data-tone": message.tone
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${message.icon}`,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", null, message.text))))));
};
const SimTransport = ({
  year,
  years,
  injYears,
  computedYears,
  playing,
  speed,
  onPlay,
  onSeek,
  onSpeed
}) => {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * years));
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-transport"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-play",
    onClick: onPlay,
    "aria-label": playing ? 'Pause' : year >= years ? 'Replay from year 0' : 'Play'
  }, /*#__PURE__*/React.createElement("i", {
    className: `fas ${playing ? 'fa-pause' : year >= years ? 'fa-rotate-left' : 'fa-play'}`,
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sim-steps"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-icon-button",
    onClick: () => onSeek(Math.max(0, Math.ceil(year / SIM_FRAME_YEARS - 1) * SIM_FRAME_YEARS)),
    "aria-label": "Back 5 years"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-backward-step",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-icon-button",
    onClick: () => onSeek(Math.min(computedYears, Math.floor(year / SIM_FRAME_YEARS + 1) * SIM_FRAME_YEARS)),
    "aria-label": "Forward 5 years"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-forward-step",
    "aria-hidden": "true"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sim-scrubber"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-scrubber__bands",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sim-scrubber__computed",
    style: {
      width: `${100 * computedYears / years}%`
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "sim-scrubber__injection",
    style: {
      width: `${100 * injYears / years}%`
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: years,
    step: 1,
    value: Math.round(year),
    "aria-label": "Simulation year",
    "aria-valuetext": `Year ${Math.round(year)} of ${years}`,
    onChange: event => onSeek(Math.min(computedYears, Number(event.target.value)))
  }), /*#__PURE__*/React.createElement("div", {
    className: "sim-scrubber__ticks",
    "aria-hidden": "true"
  }, ticks.map(t => /*#__PURE__*/React.createElement("span", {
    key: t
  }, t)))), /*#__PURE__*/React.createElement("div", {
    className: "sim-year",
    "aria-live": "off"
  }, /*#__PURE__*/React.createElement("strong", null, Math.round(year)), " ", /*#__PURE__*/React.createElement("span", null, "of ", years, " years")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button sim-speed",
    onClick: onSpeed,
    "aria-label": `Playback speed ${speed + 1}×, change`
  }, speed + 1, "\xD7"));
};

// ---------------------------------------------------------------- uncertainty

const SIM_UQ_METRICS = [{
  key: 'leakedPct',
  label: 'Leaked through faults',
  unit: '%',
  digits: 1
}, {
  key: 'exitedPct',
  label: 'Left the model',
  unit: '%',
  digits: 1
}, {
  key: 'residualPct',
  label: 'Residually trapped',
  unit: '%',
  digits: 1
}, {
  key: 'dissolvedPct',
  label: 'Dissolved',
  unit: '%',
  digits: 1
}, {
  key: 'structuralPct',
  label: 'Structurally trapped',
  unit: '%',
  digits: 1
}, {
  key: 'freePct',
  label: 'Free plume',
  unit: '%',
  digits: 1
}, {
  key: 'footprintKm2',
  label: 'CO₂ footprint',
  unit: 'km²',
  digits: 0
}, {
  key: 'bhpBar',
  label: 'Peak pressure rise at the well',
  unit: 'bar',
  digits: 1
}];
const simDefaultUqSpecs = scenario => VE2D.UQ_PARAMS.map(param => {
  const base = param.key.startsWith('fault0.') ? scenario.faults[0]?.[param.key.slice(7)] : scenario[param.key];
  const limits = param.key.startsWith('fault0.') ? VE2D.FAULT_LIMITS[param.key.slice(7)] : VE2D.LIMITS[param.key];
  const spread = param.log ? [base / 2, base * 2] : [base * 0.7, base * 1.3];
  const round = v => +Number(v).toPrecision(3);
  return {
    ...param,
    enabled: ['permMd', 'porosity', 'sgr', 'fault0.sealCap'].includes(param.key) && base !== undefined,
    available: base !== undefined,
    min: round(Math.max(limits[0], Math.min(spread[0], spread[1]))),
    max: round(Math.min(limits[1], Math.max(spread[0], spread[1], limits[0] + limits[2])))
  };
});
const simPercentile = (sorted, p) => {
  if (!sorted.length) return NaN;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};
const SimUncertainty = ({
  scenario,
  onLoad,
  theme,
  hidden
}) => {
  const [specs, setSpecs] = useState(() => simDefaultUqSpecs(scenario));
  const [runs, setRuns] = useState(50);
  const [grid, setGrid] = useState('coarse');
  const [seed, setSeed] = useState(1);
  const [state, setState] = useState({
    status: 'idle',
    done: 0,
    total: 0,
    rows: [],
    error: null
  });
  const [metric, setMetric] = useState('leakedPct');
  const [xParam, setXParam] = useState(null);
  const workerRef = useRef(null);
  useEffect(() => () => workerRef.current?.terminate(), []);
  useEffect(() => setSpecs(simDefaultUqSpecs(scenario)), [scenario.faults.length]);
  const active = specs.filter(spec => spec.enabled && spec.available);
  const start = () => {
    workerRef.current?.terminate();
    const base = {
      ...scenario,
      grid: grid === 'same' ? scenario.grid : 'coarse'
    };
    const scenarios = VE2D.sampleBatch(base, active.map(({
      key,
      min,
      max,
      log
    }) => ({
      key,
      min: Math.min(min, max),
      max: Math.max(min, max),
      log
    })), runs, seed);
    try {
      const worker = new Worker('./simulation-worker.js?v=3');
      workerRef.current = worker;
      worker.onmessage = ({
        data
      }) => {
        if (data.type === 'progress') setState(current => ({
          ...current,
          done: data.done,
          total: data.total
        }));
        if (data.type === 'batch-done') {
          setState({
            status: 'ready',
            done: data.rows.length,
            total: data.rows.length,
            rows: data.rows,
            error: null
          });
          worker.terminate();
        }
        if (data.type === 'error') setState(current => ({
          ...current,
          status: 'error',
          error: data.message
        }));
      };
      setState({
        status: 'running',
        done: 0,
        total: runs,
        rows: [],
        error: null
      });
      setXParam(active[0]?.key || null);
      worker.postMessage({
        type: 'batch',
        id: 1,
        scenarios
      });
    } catch (_) {
      setState({
        status: 'error',
        done: 0,
        total: 0,
        rows: [],
        error: 'This browser blocked the simulation worker.'
      });
    }
  };
  const cancel = () => {
    workerRef.current?.terminate();
    setState(current => ({
      ...current,
      status: 'idle'
    }));
  };
  const valueOf = (row, key) => key.startsWith('fault0.') ? row.scenario.faults[0]?.[key.slice(7)] : row.scenario[key];
  const metricMeta = SIM_UQ_METRICS.find(m => m.key === metric);
  const results = useMemo(() => {
    if (!state.rows.length) return null;
    const table = SIM_UQ_METRICS.map(m => {
      const sorted = state.rows.map(r => r.summary[m.key]).sort((a, b) => a - b);
      return {
        ...m,
        p10: simPercentile(sorted, 0.1),
        p50: simPercentile(sorted, 0.5),
        p90: simPercentile(sorted, 0.9)
      };
    });
    const params = VE2D.UQ_PARAMS.filter(p => state.rows.some(r => valueOf(r, p.key) !== valueOf(state.rows[0], p.key)));
    const tornado = params.map(p => ({
      key: p.key,
      label: p.label,
      rho: VE2D.spearman(state.rows.map(r => valueOf(r, p.key)), state.rows.map(r => r.summary[metric]))
    })).sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho));
    return {
      table,
      params,
      tornado
    };
  }, [state.rows, metric]);
  return /*#__PURE__*/React.createElement("div", {
    className: "sim-uq",
    id: "sim-panel-uncertainty",
    role: "tabpanel",
    "aria-labelledby": "sim-tab-uncertainty",
    hidden: hidden
  }, /*#__PURE__*/React.createElement("aside", {
    className: "sim-rail sim-uq__setup",
    "aria-label": "Uncertainty set-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-rail__head"
  }, /*#__PURE__*/React.createElement("h2", null, "Inputs to vary")), /*#__PURE__*/React.createElement("p", {
    className: "sim-field__hint",
    style: {
      padding: '0 16px 8px'
    }
  }, "Each run draws its inputs by Latin hypercube sampling from these ranges; everything else is the current scenario."), /*#__PURE__*/React.createElement("ul", {
    className: "sim-uq__params"
  }, specs.filter(spec => spec.available).map(spec => /*#__PURE__*/React.createElement("li", {
    key: spec.key,
    className: "sim-uq__param",
    "data-off": !spec.enabled
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    id: `sim-uq-${spec.key}`,
    checked: spec.enabled,
    onChange: event => setSpecs(current => current.map(s => s.key === spec.key ? {
      ...s,
      enabled: event.target.checked
    } : s))
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: `sim-uq-${spec.key}`
  }, spec.label), /*#__PURE__*/React.createElement("div", {
    className: "sim-uq__range"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${spec.label} minimum`,
    value: spec.min,
    disabled: !spec.enabled,
    onChange: event => setSpecs(current => current.map(s => s.key === spec.key ? {
      ...s,
      min: Number(event.target.value)
    } : s))
  }), /*#__PURE__*/React.createElement("span", null, "to"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": `${spec.label} maximum`,
    value: spec.max,
    disabled: !spec.enabled,
    onChange: event => setSpecs(current => current.map(s => s.key === spec.key ? {
      ...s,
      max: Number(event.target.value)
    } : s))
  }), /*#__PURE__*/React.createElement("span", null, spec.unit, spec.log ? ', log' : ''))))), /*#__PURE__*/React.createElement("div", {
    className: "sim-uq__run"
  }, /*#__PURE__*/React.createElement(SimChoice, {
    label: "Runs",
    value: String(runs),
    onChange: value => setRuns(Number(value)),
    options: [{
      id: '25',
      label: '25'
    }, {
      id: '50',
      label: '50'
    }, {
      id: '100',
      label: '100'
    }, {
      id: '200',
      label: '200'
    }]
  }), /*#__PURE__*/React.createElement(SimChoice, {
    label: "Grid",
    value: grid,
    onChange: setGrid,
    options: [{
      id: 'coarse',
      label: '500 m (fast)',
      hint: 'Coarse grid; load a run to see it on the same grid.'
    }, {
      id: 'same',
      label: 'Same as simulator',
      hint: 'Exactly the simulator grid; slower.'
    }]
  }), /*#__PURE__*/React.createElement(SimField, {
    name: "uq-seed",
    meta: {
      label: 'Sampling seed',
      unit: '',
      digits: 0
    },
    value: seed,
    limits: [1, 9999, 1],
    onChange: setSeed
  }), state.status === 'running' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sim-progress",
    role: "progressbar",
    "aria-label": "Uncertainty runs completed",
    "aria-valuemin": 0,
    "aria-valuemax": state.total,
    "aria-valuenow": state.done
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: `${100 * state.done / Math.max(1, state.total)}%`
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button",
    onClick: cancel
  }, "Cancel (", state.done, " of ", state.total, ")")) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button sim-button--primary",
    disabled: !active.length,
    onClick: start
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-play",
    "aria-hidden": "true"
  }), " Run ", runs, " scenarios"), state.error && /*#__PURE__*/React.createElement("p", {
    className: "sim-field__feedback",
    role: "status"
  }, state.error))), /*#__PURE__*/React.createElement("div", {
    className: "sim-uq__results"
  }, !results ? /*#__PURE__*/React.createElement("div", {
    className: "sim-empty"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "No uncertainty runs yet"), /*#__PURE__*/React.createElement("p", null, "Pick the inputs you are unsure about, set their ranges and run the batch. The results show the spread of outcomes and which inputs drive them."))) : /*#__PURE__*/React.createElement("div", {
    className: "sim-uq__grid"
  }, /*#__PURE__*/React.createElement("section", {
    className: "sim-card",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("h3", null, "Outcomes at year ", scenario.years, " across ", state.rows.length, " runs"), /*#__PURE__*/React.createElement("p", null, "P10, P50 and P90 are the 10th, 50th and 90th percentiles. Choose an outcome to plot."), /*#__PURE__*/React.createElement("table", {
    className: "sim-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Outcome"), /*#__PURE__*/React.createElement("th", null, "P10"), /*#__PURE__*/React.createElement("th", null, "P50"), /*#__PURE__*/React.createElement("th", null, "P90"))), /*#__PURE__*/React.createElement("tbody", null, results.table.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.key,
    "aria-selected": metric === m.key,
    style: {
      cursor: 'pointer',
      background: metric === m.key ? 'var(--sim-surface-3)' : undefined
    },
    onClick: () => setMetric(m.key)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button sim-button--quiet",
    style: {
      padding: 0,
      minHeight: 0
    },
    onClick: () => setMetric(m.key)
  }, m.label)), /*#__PURE__*/React.createElement("td", null, simFormatNumber(m.p10, m.digits), " ", m.unit), /*#__PURE__*/React.createElement("td", null, simFormatNumber(m.p50, m.digits), " ", m.unit), /*#__PURE__*/React.createElement("td", null, simFormatNumber(m.p90, m.digits), " ", m.unit)))))), /*#__PURE__*/React.createElement("section", {
    className: "sim-card"
  }, /*#__PURE__*/React.createElement("h3", null, metricMeta.label), /*#__PURE__*/React.createElement("p", null, "Distribution over the runs, in ", metricMeta.unit, "."), /*#__PURE__*/React.createElement(SimHistogram, {
    values: state.rows.map(r => r.summary[metric]),
    unit: metricMeta.unit,
    digits: metricMeta.digits
  })), /*#__PURE__*/React.createElement("section", {
    className: "sim-card"
  }, /*#__PURE__*/React.createElement("h3", null, "What drives it"), /*#__PURE__*/React.createElement("p", null, "Spearman rank correlation between each input and ", metricMeta.label.toLowerCase(), "."), /*#__PURE__*/React.createElement(SimTornado, {
    items: results.tornado
  })), xParam && /*#__PURE__*/React.createElement("section", {
    className: "sim-card",
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("h3", null, "Runs"), /*#__PURE__*/React.createElement("p", null, "Each point is one run. Select a point to open that run in the simulator."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "sim-field__hint",
    htmlFor: "sim-uq-x"
  }, "Horizontal axis "), /*#__PURE__*/React.createElement("select", {
    id: "sim-uq-x",
    value: xParam,
    onChange: event => setXParam(event.target.value),
    className: "sim-button",
    style: {
      marginLeft: 6
    }
  }, results.params.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.key,
    value: p.key
  }, p.label)))), /*#__PURE__*/React.createElement(SimScatter, {
    points: state.rows.map(r => ({
      x: valueOf(r, xParam),
      y: r.summary[metric],
      row: r
    })),
    xLabel: VE2D.UQ_PARAMS.find(p => p.key === xParam)?.label,
    yLabel: `${metricMeta.label} (${metricMeta.unit})`,
    log: VE2D.UQ_PARAMS.find(p => p.key === xParam)?.log,
    onSelect: point => onLoad(point.row.scenario)
  })))));
};

// ---------------------------------------------------------------- page

const SimulatorPage = () => {
  const reducedMotion = useSimReducedMotion();
  const [scenario, setScenario] = useState(() => simDecodeScenario(window.location.search) || VE2D.normalizeScenario(VE2D.DEFAULTS));
  const [section, setSection] = useState('simulator');
  const [view, setView] = useState('map');
  const [theme, setTheme] = useState(() => simStoredTheme(window.localStorage));
  const [palette, setPalette] = useState(() => simReadPalette(null));
  const [year, setYear] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [share, setShare] = useState('Share');
  const [layers, setLayers] = useState({
    contours: true,
    traps: true,
    residual: true,
    dissolved: false,
    pressure: false,
    flow: true
  });
  const [sectionLine, setSectionLine] = useState(null);
  const autoplayed = useRef(false);
  const tabRefs = useRef({});
  const run = useSimSimulation(scenario);
  // Keep showing the previous result until the new one has caught up with the
  // current year, so edits morph instead of flashing an empty map.
  const lastComplete = useRef(null);
  if (run.model && run.frames.length && run.status === 'ready') lastComplete.current = run;
  const computedYears = run.model ? Math.max(0, (run.frames.length - 1) * SIM_FRAME_YEARS) : 0;
  const shown = run.model && (computedYears >= Math.min(year, run.model.years) || !lastComplete.current) ? run : lastComplete.current || run;
  const model = shown.model;
  const shownYear = model ? Math.min(year, model.years) : 0;
  const frame = useMemo(() => simFrameAt(shown.frames, shownYear), [shown.frames, shownYear]);
  const row = useMemo(() => simRowAt(shown.history, shownYear), [shown.history, shownYear]);
  useEffect(() => {
    const root = document.querySelector('.ve-standalone');
    root?.setAttribute('data-theme', theme);
    simPersistTheme(theme, window.localStorage);
    setPalette(simReadPalette(root));
  }, [theme]);
  useEffect(() => {
    const url = `${window.location.pathname}?${simEncodeScenario(scenario)}`;
    try {
      window.history.replaceState(null, '', url);
    } catch (_) {/* file:// or sandboxed frames */}
  }, [scenario]);

  // One orchestrated moment: the first result plays from injection onwards.
  useEffect(() => {
    if (autoplayed.current || run.frames.length < 2) return;
    autoplayed.current = true;
    if (reducedMotion) setYear(Math.min(run.model.years, run.model.injYears + 70));else setPlaying(true);
  }, [run.frames.length, reducedMotion]);
  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    let frameId;
    const tick = now => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setYear(current => {
        if (!run.model) return current;
        const step = simNextYear(current, dt, SIM_SPEEDS[speed], {
          years: run.model.years,
          computedYears,
          ready: run.status !== 'computing'
        });
        if (step.stop) setPlaying(false);
        return step.year;
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [playing, speed, computedYears, run.model, run.status]);
  useEffect(() => {
    const onKey = event => {
      if (section !== 'simulator' || event.target.closest?.('input, select, textarea, button, summary')) return;
      if (event.code === 'Space') {
        event.preventDefault();
        setPlaying(p => !p);
      }
      if (event.key === 'ArrowRight') setYear(y => Math.min(computedYears, Math.floor(y / SIM_FRAME_YEARS + 1) * SIM_FRAME_YEARS));
      if (event.key === 'ArrowLeft') setYear(y => Math.max(0, Math.ceil(y / SIM_FRAME_YEARS - 1) * SIM_FRAME_YEARS));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section, computedYears]);
  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = event => {
      if (event.key === 'Escape') setSheet(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);
  const update = patch => setScenario(current => VE2D.normalizeScenario({
    ...current,
    ...patch,
    preset: 'custom'
  }));
  const applyPreset = id => {
    if (!VE2D.PRESETS[id]) return;
    setScenario(VE2D.normalizeScenario({
      ...VE2D.DEFAULTS,
      ...VE2D.PRESETS[id].patch,
      preset: id,
      grid: scenario.grid
    }));
    setSectionLine(null);
  };
  // A new realisation of a randomly drawn geological setting; the injector moves with it.
  const randomise = () => setScenario(current => VE2D.normalizeScenario({
    ...current,
    ...VE2D.randomStructure(1 + Math.floor(Math.random() * 999999), current)
  }));
  const play = () => {
    if (!run.model) return;
    const finished = year >= run.model.years - 1e-6 || run.status !== 'computing' && year >= computedYears;
    if (!playing && finished) setYear(0);
    setPlaying(p => !p);
  };
  const seek = value => {
    setPlaying(false);
    setYear(Math.max(0, value));
  };
  const copyLink = async () => {
    const ok = await simCopyText(window.location.href, navigator.clipboard);
    setShare(ok ? 'Link copied' : 'Copy the address bar');
    setTimeout(() => setShare('Share'), 2200);
  };
  const exportRef = useRef(null);
  const exportInventory = () => {
    simDownload(simInventoryCsv(shown.history), 'co2-inventory.csv', 'text/csv');
    exportRef.current?.removeAttribute('open');
  };
  const exportGrid = () => {
    if (frame) simDownload(simGridCsv(model, frame), `co2-grid-year-${Math.round(shownYear)}.csv`, 'text/csv');
    exportRef.current?.removeAttribute('open');
  };
  const exportImage = () => {
    exportRef.current?.removeAttribute('open');
    const canvas = document.querySelector('.sim-view canvas[data-export]');
    // The 3D view composites its WebGL picture with the label overlay.
    if (canvas) {
      (canvas.simComposite?.() || canvas).toBlob(blob => blob && simDownload(blob, `co2-${view}-year-${Math.round(shownYear)}.png`));
      return;
    }
    const svg = document.querySelector('.sim-view svg.sim-view__svg');
    if (svg) simDownload(new XMLSerializer().serializeToString(svg), `co2-section-year-${Math.round(shownYear)}.svg`, 'image/svg+xml');
  };
  const onTabKey = event => {
    const index = SIM_SECTIONS.findIndex(s => s.id === section);
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = SIM_SECTIONS[(index + delta + SIM_SECTIONS.length) % SIM_SECTIONS.length].id;
    setSection(next);
    tabRefs.current[next]?.focus();
  };
  const loadRealization = realization => {
    setScenario(VE2D.normalizeScenario({
      ...realization,
      preset: 'custom'
    }));
    setSection('simulator');
    setYear(realization.years);
    setPlaying(false);
  };
  const line = sectionLine || (model ? simDefaultSectionLine(model) : null);
  const statusText = run.status === 'computing' ? `Computing… year ${computedYears}` : run.status === 'error' ? 'Run failed' : 'Up to date';
  const viewProps = {
    model,
    frame,
    palette,
    theme,
    layers,
    reducedMotion,
    scenario: shown.scenario || scenario,
    year: shownYear,
    playing
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "sim"
  }, /*#__PURE__*/React.createElement("header", {
    className: "sim-appbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-title"
  }, /*#__PURE__*/React.createElement("h1", null, "CO\u2082 Storage Simulator"), /*#__PURE__*/React.createElement("p", null, "Vertical-equilibrium model of plume migration, trapping and leakage in a saline aquifer")), /*#__PURE__*/React.createElement("div", {
    className: "sim-sections",
    role: "tablist",
    "aria-label": "Simulator sections",
    onKeyDown: onTabKey
  }, SIM_SECTIONS.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    id: `sim-tab-${item.id}`,
    ref: el => {
      tabRefs.current[item.id] = el;
    },
    type: "button",
    role: "tab",
    "aria-selected": section === item.id,
    "aria-controls": `sim-panel-${item.id}`,
    tabIndex: section === item.id ? 0 : -1,
    onClick: () => setSection(item.id)
  }, item.label))), /*#__PURE__*/React.createElement("div", {
    className: "sim-actions"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sim-status-pill",
    "data-state": run.status,
    role: "status"
  }, statusText), section === 'simulator' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button sim-inputs-trigger",
    onClick: () => setSheet('inputs'),
    "aria-expanded": sheet === 'inputs',
    "aria-controls": "sim-inputs"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-sliders",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sim-button__label"
  }, "Inputs")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-button",
    onClick: copyLink,
    "aria-label": "Copy a link to this scenario"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-link",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sim-button__label"
  }, share)), /*#__PURE__*/React.createElement("details", {
    className: "sim-menu",
    ref: exportRef
  }, /*#__PURE__*/React.createElement("summary", {
    className: "sim-button",
    "aria-label": "Export"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-download",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sim-button__label"
  }, "Export")), /*#__PURE__*/React.createElement("div", {
    className: "sim-menu__panel"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: exportInventory
  }, "Inventory through time ", /*#__PURE__*/React.createElement("small", null, "CSV")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: exportGrid,
    disabled: !frame
  }, "Grid at this year ", /*#__PURE__*/React.createElement("small", null, "CSV")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: exportImage
  }, "Current view ", /*#__PURE__*/React.createElement("small", null, view === 'section' ? 'SVG' : 'PNG')))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "sim-icon-button",
    onClick: () => setTheme(t => t === 'night' ? 'day' : 'night'),
    "aria-label": theme === 'night' ? 'Switch to the day theme' : 'Switch to the night theme'
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-circle-half-stroke",
    "aria-hidden": "true"
  })))), section === 'simulator' && /*#__PURE__*/React.createElement("div", {
    className: "sim-workbench",
    id: "sim-panel-simulator",
    role: "tabpanel",
    "aria-labelledby": "sim-tab-simulator"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "sim-rail sim-rail--inputs",
    id: "sim-inputs",
    "data-open": sheet === 'inputs',
    "aria-label": "Scenario inputs"
  }, /*#__PURE__*/React.createElement(SimInputs, {
    scenario: scenario,
    onChange: update,
    onPreset: applyPreset,
    onRandom: randomise,
    onClose: () => setSheet(null)
  })), /*#__PURE__*/React.createElement("div", {
    className: "sim-sheet-backdrop",
    "data-open": sheet === 'inputs',
    onClick: () => setSheet(null),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("section", {
    className: "sim-stage",
    "aria-label": "Reservoir views"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-view"
  }, model && view === 'map' && /*#__PURE__*/React.createElement(SimMapView, _extends({}, viewProps, {
    line: line,
    onLine: setSectionLine,
    onWell: (x, y) => update({
      wellX: x,
      wellY: y
    })
  })), model && view === '3d' && /*#__PURE__*/React.createElement(SimBlockView, viewProps), model && view === 'section' && /*#__PURE__*/React.createElement(SimSectionView, _extends({}, viewProps, {
    line: line
  })), !model && /*#__PURE__*/React.createElement("div", {
    className: "sim-view-note",
    style: {
      top: '45%',
      left: 0,
      right: 0,
      textAlign: 'center'
    }
  }, run.status === 'error' ? run.error : 'Building the reservoir model…'), /*#__PURE__*/React.createElement("div", {
    className: "sim-overlay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sim-segmented",
    role: "group",
    "aria-label": "View"
  }, SIM_VIEWS.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.id,
    type: "button",
    "aria-pressed": view === item.id,
    onClick: () => setView(item.id)
  }, item.label))), /*#__PURE__*/React.createElement("div", {
    className: "sim-overlay__right"
  }, view !== 'section' && /*#__PURE__*/React.createElement(SimLayersMenu, {
    layers: layers,
    onChange: setLayers,
    view: view
  }))), model && /*#__PURE__*/React.createElement(SimLegend, {
    view: view,
    layers: layers,
    model: model
  })), /*#__PURE__*/React.createElement(SimTransport, {
    year: shownYear,
    years: model?.years || scenario.years,
    injYears: model?.injYears || scenario.injYears,
    computedYears: computedYears,
    playing: playing,
    speed: speed,
    onPlay: play,
    onSeek: seek,
    onSpeed: () => setSpeed(s => (s + 1) % SIM_SPEEDS.length)
  })), /*#__PURE__*/React.createElement("aside", {
    className: "sim-rail sim-rail--outcomes",
    "aria-label": "Outcomes"
  }, /*#__PURE__*/React.createElement(SimOutcomes, {
    model: model,
    row: row,
    frame: frame,
    run: shown,
    history: shown.history,
    year: shownYear,
    onSeek: seek
  }))), /*#__PURE__*/React.createElement(SimUncertainty, {
    scenario: scenario,
    onLoad: loadRealization,
    theme: theme,
    hidden: section !== 'uncertainty'
  }), section === 'method' && /*#__PURE__*/React.createElement("div", {
    className: "sim-method",
    id: "sim-panel-method",
    role: "tabpanel",
    "aria-labelledby": "sim-tab-method"
  }, /*#__PURE__*/React.createElement(GuidePage, null)));
};
Object.assign(window, {
  SimulatorPage
});


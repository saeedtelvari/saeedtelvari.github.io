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
  const GRIDS = { coarse: [40, 24], standard: [80, 48], fine: [120, 72] };

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
    strike: [0, 179, 1],
    length: [0.5, 30, 0.5],
    throw: [0, 150, 1],
    trans: [0, 1, 0.05],
    sealCap: [0, 200, 1],
    kf: [0, 1000, 1]
  });
  const INTEGER_KEYS = new Set(['years', 'seed', 'injYears', 'domes', 'dipAz']);
  const MAX_FAULTS = 3;

  const DEFAULT_FAULT = Object.freeze({ x: 9.5, y: 6, strike: 12, length: 8, throw: 12, trans: 0.4, sealCap: 15, kf: 20 });
  const DEFAULTS = Object.freeze({
    preset: 'dome-fault',
    grid: 'standard',
    boundary: 'open',
    years: 1000,
    seed: 3901,
    rateMt: 1,
    injYears: 30,
    wellX: 14,
    wellY: 6,
    permMd: 500,
    porosity: 0.2,
    thickness: 50,
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
      patch: { dipDeg: 1, domes: 0, roughness: 2, faults: [] }
    },
    anticline: {
      label: 'Anticline trap',
      description: 'A large dome up-dip of the injector fills to its spill point and then spills.',
      patch: { dipDeg: 0.4, domes: 1, domeRelief: 110, roughness: 2, faults: [] }
    },
    'sealed-block': {
      label: 'Sealed fault block',
      description: 'Two sealing faults and closed boundaries: CO₂ is contained, pressure builds up.',
      patch: {
        boundary: 'closed', dipDeg: 0.4, domes: 0, roughness: 3, injYears: 20,
        faults: [
          { x: 8, y: 6, strike: 5, length: 14, throw: 40, trans: 0, sealCap: 200, kf: 0 },
          { x: 16.5, y: 6, strike: 170, length: 14, throw: 30, trans: 0, sealCap: 200, kf: 0 }
        ]
      }
    },
    rough: {
      label: 'Rough top surface',
      description: 'Small undulations in the caprock create many small structural traps.',
      patch: { dipDeg: 0.5, domes: 0, roughness: 20, faults: [] }
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
      scenario[key] = INTEGER_KEYS.has(key) ? Math.round(bounded) : bounded;
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

  const smoothNoise = (x, y, seed) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const smooth = value => value * value * (3 - 2 * value);
    const sx = smooth(x - x0);
    const sy = smooth(y - y0);
    const n00 = hashNoise(x0, y0, seed);
    const n10 = hashNoise(x0 + 1, y0, seed);
    const n01 = hashNoise(x0, y0 + 1, seed);
    const n11 = hashNoise(x0 + 1, y0 + 1, seed);
    const top = n00 + (n10 - n00) * sx;
    return top + (n01 + (n11 - n01) * sx - top) * sy;
  };

  // Multi-octave value noise in [-1, 1]; coordinates in units of the domain height.
  const roughnessField = (u, v, seed) => {
    let value = 0;
    let weight = 0;
    let amplitude = 1;
    for (let octave = 0; octave < 5; octave++) {
      const scale = 1.6 * (2 ** octave);
      value += (smoothNoise(u * scale, v * scale, seed + octave * 101) - 0.5) * 2 * amplitude;
      weight += amplitude;
      amplitude *= 0.55;
    }
    return value / weight;
  };

  const domeCentres = scenario => Array.from({ length: scenario.domes }, (_, index) => ({
    x: (0.12 + 0.76 * hashNoise(index * 2.1, 0.4, scenario.seed + 503)) * LX,
    y: (0.15 + 0.7 * hashNoise(index * 2.9, 0.8, scenario.seed + 547)) * LY,
    angle: hashNoise(index * 3.7, 1.2, scenario.seed + 571) * Math.PI
  }));

  const faultFrame = fault => {
    const strike = fault.strike * Math.PI / 180;
    const along = [Math.sin(strike), Math.cos(strike)];
    return { cx: fault.x * KM, cy: fault.y * KM, half: fault.length * KM / 2, along, normal: [along[1], -along[0]] };
  };

  // Parabolic throw profile along strike (zero at the tips). The hanging wall, to the
  // right of the strike direction, is downthrown; the offset decays away from the fault.
  const faultThrowAt = (fault, frame, x, y) => {
    const dx = x - frame.cx;
    const dy = y - frame.cy;
    const t = (dx * frame.along[0] + dy * frame.along[1]) / frame.half;
    if (Math.abs(t) >= 1) return 0;
    return fault.throw * (1 - t * t);
  };

  const faultOffset = (fault, frame, x, y) => {
    const side = (x - frame.cx) * frame.normal[0] + (y - frame.cy) * frame.normal[1];
    if (side <= 0) return 0;
    return faultThrowAt(fault, frame, x, y) * Math.exp(-side / (1.5 * frame.half));
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
      depth -= scenario.domeRelief * Math.exp(-0.5 * ((along / 2400) ** 2 + (across / 1600) ** 2));
    }
    if (scenario.roughness > 0) depth += scenario.roughness * roughnessField(x / LY, y / LY, scenario.seed);
    const frames = cache?.frames || scenario.faults.map(faultFrame);
    scenario.faults.forEach((fault, index) => { depth += faultOffset(fault, frames[index], x, y); });
    return depth;
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
    const cache = { domes: domeCentres(scenario), frames: scenario.faults.map(faultFrame) };
    const depthAt = (x, y) => topDepth(x, y, scenario, cache);

    const xc = Float64Array.from({ length: nx }, (_, i) => (i + 0.5) * dx);
    const yc = Float64Array.from({ length: ny }, (_, j) => (j + 0.5) * dy);
    const zt = new Float64Array(n);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) zt[j * nx + i] = depthAt(xc[i], yc[j]);

    // Face multiplier: cross-fault transmissibility times the juxtaposed fraction of H.
    const multiplier = (px, py, qx, qy) => {
      let value = 1;
      scenario.faults.forEach((fault, index) => {
        const t = traceCrossing(cache.frames[index], px, py, qx, qy);
        if (t === null) return;
        const localThrow = fault.throw * (1 - t * t);
        value = Math.min(value, fault.trans * Math.max(0, 1 - localThrow / H));
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
        mx[index] = boundary
          ? multiplier(f === 0 ? xc[0] : xc[nx - 1], yc[j], f * dx, yc[j])
          : multiplier(xc[f - 1], yc[j], xc[f], yc[j]);
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
        my[index] = boundary
          ? multiplier(xc[i], f === 0 ? yc[0] : yc[ny - 1], xc[i], f * dy)
          : multiplier(xc[i], yc[f - 1], xc[i], yc[f]);
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
      for (const [cell, length] of lengths) leakCells.push({ cell, length, fault: faultIndex });
    });

    const well = clamp(Math.floor(scenario.wellY * KM / dy), 0, ny - 1) * nx + clamp(Math.floor(scenario.wellX * KM / dx), 0, nx - 1);

    return { scenario, nx, ny, n, dx, dy, Lx: LX, Ly: LY, area: dx * dy, H, p, xc, yc, zt, tx, ty, mx, my, ghostX, ghostY, leakCells, faultLines, well, depthAt };
  };

  return {
    YEAR, MT, MD, BAR, KM, GRAVITY, LX, LY, GRIDS,
    LIMITS, FAULT_LIMITS, DEFAULTS, PRESETS, MAX_FAULTS,
    normalizeScenario, topDepth, buildModel, roughnessField
  };
});

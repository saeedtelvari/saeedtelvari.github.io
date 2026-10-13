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

  const DEFAULT_FAULT = Object.freeze({ x: 9.5, y: 6, strike: 12, length: 8, throw: 12, trans: 0.4, sealCap: 10, kf: 20 });
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

    const model = { scenario, nx, ny, n, dx, dy, Lx: LX, Ly: LY, area: dx * dy, H, p, xc, yc, zt, tx, ty, mx, my, ghostX, ghostY, leakCells, faultLines, well, depthAt, domes: cache.domes };
    model.traps = trapAnalysis(model);
    return model;
  };

  // Binary min-heap of (key, cell) pairs for the priority flood.
  const createHeap = capacity => {
    let size = 0;
    const keys = new Float64Array(capacity);
    const cells = new Int32Array(capacity);
    return {
      get size() { return size; },
      push(key, cell) {
        let i = size++;
        while (i > 0) {
          const parent = (i - 1) >> 1;
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
    const { nx, ny, mx, my } = model;
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
    const { nx, ny, n, zt } = model;
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
        capacity += Math.min(model.H, zSpill[c] - zt[c]) * capacityFactor;
      }
      traps.push({ id, cells: Int32Array.from(cells), crestCell, spillCell, spillDepth: zSpill[crestCell], capacity });
    }
    return { zSpill, trapId, traps };
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
          case 1: case 14: segment(left(), bottom()); break;
          case 2: case 13: segment(bottom(), right()); break;
          case 3: case 12: segment(left(), right()); break;
          case 4: case 11: segment(right(), top()); break;
          case 6: case 9: segment(bottom(), top()); break;
          case 7: case 8: segment(left(), top()); break;
          case 5:
            if (centreAbove) { segment(bottom(), right()); segment(left(), top()); }
            else { segment(left(), bottom()); segment(right(), top()); }
            break;
          case 10:
            if (centreAbove) { segment(left(), bottom()); segment(right(), top()); }
            else { segment(bottom(), right()); segment(left(), top()); }
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
    const { n, nx, ny } = model;
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
  const faceFlux = (k, T, U, zetaA, zetaB, hA, hB, H, scratch) => {
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
      const gas = a * Math.min(dz > 0 ? hA : hB, H);
      const brine = b * Math.max(0, H - (dz > 0 ? hB : hA));
      mob = gas + brine > 0 ? gas * brine / (gas + brine) : 0;
      gravity = T * k.tg * dz * mob;
    }
    let viscous = 0;
    let slope = 0;
    if (U !== 0) {
      const hu = Math.min(U > 0 ? hA : hB, H);
      const gas = a * hu;
      const brine = b * (H - hu);
      const total = gas + brine;
      if (total > 0) {
        viscous = U * gas / total;
        // df/dh at the upstream column: the local characteristic speed.
        slope = a * b * H / (total * total);
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
    const { p, area, H } = model;
    const { h, s, md } = state;
    const imbibe = p.phi * Math.max(1e-3, 1 - p.swr - p.sgr);
    state.leaking.fill(0);
    for (const { cell, length, fault } of model.leakCells) {
      const { sealCap, kf } = model.scenario.faults[fault];
      const excess = Math.min(h[cell], H) - sealCap;
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
      const capacity = p.disCap * p.phi * H;
      for (let c = 0; c < model.n; c++) {
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
    const { nx, ny, n, p, tx, ty, mx, my, zt, ghostX, ghostY, area, H } = model;
    const { h, s, ux, uy, fx, fy, net, rate } = state;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    const k = { a, b, tg: p.dRho * p.g };
    const scratch = { bound: 0 };
    net.fill(0);
    rate.fill(0);
    // Boundary faces use phase-potential upwinding: the hydrostatic ghost holds no gas,
    // so CO2 leaves only where its own potential drops outward.
    const boundaryFlux = (T, c, ghostDepth) => {
      if (h[c] <= H_EPS) { scratch.bound = 0; return 0; }
      const hc = Math.min(h[c], H);
      const drop = state.p[c] + k.tg * (zt[c] + h[c] - ghostDepth);
      scratch.bound = T * a * (Math.abs(drop) + k.tg * hc);
      return drop > 0 ? T * a * hc * drop : 0;
    };

    for (let j = 0; j < ny; j++) {
      for (let f = 0; f <= nx; f++) {
        const index = j * (nx + 1) + f;
        const T = tx[index] * mx[index];
        if (f === 0 || f === nx) {
          if (!p.open || T === 0) { fx[index] = 0; continue; }
          const c = j * nx + (f === 0 ? 0 : nx - 1);
          const flux = boundaryFlux(T, c, ghostX[index]);
          fx[index] = f === 0 ? -flux : flux;
          net[c] -= flux;
          rate[c] += scratch.bound;
          continue;
        }
        const L = j * nx + f - 1;
        const R = L + 1;
        if (T === 0) { fx[index] = 0; continue; }
        const flux = faceFlux(k, T, ux[index], zt[L] + h[L], zt[R] + h[R], h[L], h[R], H, scratch);
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
          if (!p.open || T === 0) { fy[index] = 0; continue; }
          const c = (f === 0 ? 0 : ny - 1) * nx + i;
          const flux = boundaryFlux(T, c, ghostY[index]);
          fy[index] = f === 0 ? -flux : flux;
          net[c] -= flux;
          rate[c] += scratch.bound;
          continue;
        }
        const S = (f - 1) * nx + i;
        const N = S + nx;
        if (T === 0) { fy[index] = 0; continue; }
        const flux = faceFlux(k, T, uy[index], zt[S] + h[S], zt[N] + h[N], h[S], h[N], H, scratch);
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
    let dt = volumeRate > 0 ? Math.min(dtMax, 0.25 * p.phi * (1 - p.swr) * H * area / volumeRate) : dtMax;
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
  //   phi ct H A (p - p_old)/dt + sum T m LamT (p_c - p_nb) = Qv - sum T m LamG drho g (zeta_c - zeta_nb)
  // solved matrix-free with Jacobi-preconditioned CG, then converted to total face fluxes.
  const solvePressure = (model, state, dt, injecting) => {
    const { nx, ny, n, p, tx, ty, mx, my, zt, ghostX, ghostY, area, H } = model;
    const { h } = state;
    const a = p.krg / p.muG;
    const b = 1 / p.muW;
    const tg = p.dRho * p.g;
    const cg = state.cg || (state.cg = {
      wx: new Float64Array((nx + 1) * ny), wy: new Float64Array(nx * (ny + 1)),
      gx: new Float64Array((nx + 1) * ny), gy: new Float64Array(nx * (ny + 1)),
      diag: new Float64Array(n), rhs: new Float64Array(n), r: new Float64Array(n),
      z: new Float64Array(n), d: new Float64Array(n), q: new Float64Array(n), old: new Float64Array(n),
      wE: new Float64Array(n), wN: new Float64Array(n), prev: new Float64Array(n), prevInterval: 0
    });
    const { wx, wy, gx, gy, diag, rhs, r, z, d, q, old } = cg;
    const lamT = c => a * Math.min(h[c], H) + b * Math.max(0, H - h[c]);
    const lamG = c => a * Math.min(h[c], H);
    const acc = p.phi * p.ct * H * area / dt;
    old.set(state.p);
    for (let c = 0; c < n; c++) { diag[c] = acc; rhs[c] = acc * state.p[c]; }
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
          wx[index] = T * 0.5 * (lamT(c) + b * H);
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
          wy[index] = T * 0.5 * (lamT(c) + b * H);
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
    const { wE, wN } = cg;
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
        if (wx[index] === 0 && gx[index] === 0) { state.ux[index] = 0; continue; }
        if (f === 0) state.ux[index] = -(wx[index] * x[j * nx] + gx[index]);
        else if (f === nx) state.ux[index] = wx[index] * x[j * nx + nx - 1] + gx[index];
        else state.ux[index] = wx[index] * (x[j * nx + f - 1] - x[j * nx + f]) + gx[index];
      }
    }
    for (let f = 0; f <= ny; f++) {
      for (let i = 0; i < nx; i++) {
        const index = f * nx + i;
        if (wy[index] === 0 && gy[index] === 0) { state.uy[index] = 0; continue; }
        if (f === 0) state.uy[index] = -(wy[index] * x[i] + gy[index]);
        else if (f === ny) state.uy[index] = wy[index] * x[(ny - 1) * nx + i] + gy[index];
        else state.uy[index] = wy[index] * (x[(f - 1) * nx + i] - x[f * nx + i]) + gy[index];
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
        if (!injecting && state.t >= p.injEnd &&
            (change / interval < RELAXED_RATE || state.t - p.injEnd > MAX_RELAX_TIME)) {
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
    const { n, nx, p, H, area, xc, yc } = model;
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
      const hw = Math.min(state.h[model.well], H);
      const lamT = a * hw + b * (H - hw);
      bhp += (p.rate / p.rhoG) * Math.log(0.198 * model.dx / 0.1) / (2 * Math.PI * p.k * lamT);
    }
    return { footprint, maxColumn, migration, bhp, pMax };
  };

  // CO2 inventory in kg, classified as in co2lab: free plume, structurally trapped
  // (mobile CO2 above the local spill depth), residually trapped, dissolved, left the
  // model through an open boundary, and leaked up fault zones.
  const inventory = (model, state) => {
    const { n, p, area, zt, traps } = model;
    const { h, hMax } = state;
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
    depth: model.scenario.depth,
    years: model.scenario.years,
    injYears: model.scenario.injYears,
    open: model.p.open,
    zt: Float32Array.from(model.zt),
    zSpill: Float32Array.from(model.traps.zSpill),
    trapId: Int32Array.from(model.traps.trapId),
    traps: model.traps.traps.map(({ id, crestCell, spillCell, spillDepth, capacity, cells }) => ({ id, crestCell, spillCell, spillDepth, capacity, size: cells.length })),
    faults: model.scenario.faults.map(fault => ({ ...fault })),
    faultLines: model.faultLines.map(line => line.slice()),
    leakCells: model.leakCells.map(cell => ({ ...cell })),
    well: model.well,
    wellX: model.xc[model.well % model.nx],
    wellY: model.yc[Math.floor(model.well / model.nx)],
    phi: model.p.phi,
    swr: model.p.swr,
    sgr: model.p.sgr,
    rhoG: model.p.rhoG,
    disCapacity: model.p.disCap * model.p.phi * model.H
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
      history.push({ year, ...inv, footprint: kpi.footprint, maxColumn: kpi.maxColumn, migration: kpi.migration, bhp: kpi.bhp, bhpPeak });
      if (year % snapshotYears === 0) {
        const snap = snapshotOf(model, state, year);
        if (keepSnapshots) snapshots.push(snap);
        options.onSnapshot?.(snap);
      }
    };
    record(0);
    for (let year = 1; year <= model.scenario.years; year++) {
      advance(model, state, year * YEAR);
      record(year);
      if (state.steps > maxSteps) { truncated = true; break; }
    }
    return { modelView, snapshots, history, truncated, steps: state.steps, scenario: model.scenario };
  };

  return {
    YEAR, MT, MD, BAR, KM, GRAVITY, LX, LY, GRIDS,
    LIMITS, FAULT_LIMITS, DEFAULTS, PRESETS, MAX_FAULTS,
    normalizeScenario, topDepth, buildModel, roughnessField, trapAnalysis, contourSegments,
    createState, advance, kpis, inventory, run
  };
});

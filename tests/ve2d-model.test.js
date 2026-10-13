const test = require('node:test');
const assert = require('node:assert/strict');
const VE2D = require('../ve2d-model.js');

const flat = patch => VE2D.normalizeScenario({
  dipDeg: 0, domes: 0, roughness: 0, thicknessVar: 0, faults: [], ...patch
});
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected} (±${tolerance})`);

// ---------------------------------------------------------------- Task 1

test('normalizeScenario fills defaults and clamps geometry', () => {
  const fault = { x: 9, y: 6, strike: 0, length: 6, throw: 10, trans: 0.5, sealCap: 10, kf: 10 };
  const scenario = VE2D.normalizeScenario({ rateMt: 99, wellX: -5, porosity: 'abc', faults: [fault, fault, fault, fault, fault] });
  assert.equal(scenario.rateMt, VE2D.LIMITS.rateMt[1]);
  assert.equal(scenario.wellX, VE2D.LIMITS.wellX[0]);
  assert.equal(scenario.porosity, VE2D.DEFAULTS.porosity);
  assert.equal(scenario.faults.length, 3);
  assert.equal(VE2D.normalizeScenario({ grid: 'huge', boundary: 'sideways' }).grid, VE2D.DEFAULTS.grid);
  assert.equal(VE2D.normalizeScenario({ boundary: 'sideways' }).boundary, VE2D.DEFAULTS.boundary);
  assert.deepEqual(VE2D.normalizeScenario({}), VE2D.normalizeScenario(VE2D.DEFAULTS));
});

test('every preset normalises to a complete scenario', () => {
  for (const [id, preset] of Object.entries(VE2D.PRESETS)) {
    const scenario = VE2D.normalizeScenario({ ...VE2D.DEFAULTS, ...preset.patch, preset: id });
    assert.ok(preset.label && preset.description, `${id} needs a label and description`);
    for (const key of Object.keys(VE2D.LIMITS)) assert.ok(Number.isFinite(scenario[key]), `${id}.${key}`);
  }
});

test('regional dip of one degree drops 349 m across 20 km', () => {
  const scenario = flat({ dipDeg: 1, dipAz: 90 });
  near(VE2D.topDepth(20000, 6000, scenario) - VE2D.topDepth(0, 6000, scenario), 349.1, 1, 'east-west relief');
  near(VE2D.topDepth(10000, 0, scenario) - VE2D.topDepth(10000, 12000, scenario), 0, 1e-9, 'no north-south relief');
  near(VE2D.topDepth(10000, 6000, scenario), scenario.depth, 1e-9, 'reference depth at the centre');
});

test('fault throw offsets the hanging wall and vanishes at the tips', () => {
  const scenario = flat({ faults: [{ x: 10, y: 6, strike: 0, length: 6, throw: 30, trans: 1, sealCap: 0, kf: 0 }] });
  const east = VE2D.topDepth(10001, 6000, scenario);
  const west = VE2D.topDepth(9999, 6000, scenario);
  near(east - west, 30, 0.1, 'throw at mid-length');
  near(VE2D.topDepth(10001, 9000, scenario) - VE2D.topDepth(9999, 9000, scenario), 0, 1e-6, 'zero throw at the tip');
  near(VE2D.topDepth(10001, 12000, scenario) - VE2D.topDepth(9999, 12000, scenario), 0, 1e-9, 'no offset beyond the tip');
});

test('buildModel gives SI geometry and transmissibility on the selected grid', () => {
  for (const [grid, nx, ny] of [['coarse', 40, 24], ['standard', 80, 48], ['fine', 120, 72]]) {
    const model = VE2D.buildModel(flat({ grid }));
    assert.equal(model.nx, nx);
    assert.equal(model.ny, ny);
    near(model.dx, 20000 / nx, 1e-9, 'dx');
    assert.equal(model.zt.length, nx * ny);
    assert.equal(model.tx.length, (nx + 1) * ny);
    assert.equal(model.ty.length, nx * (ny + 1));
    near(model.tx[1], model.p.k * model.dy / model.dx, 1e-30, 'interior TPFA transmissibility');
    near(model.tx[0], model.p.k * model.dy / (model.dx / 2), 1e-30, 'boundary half-cell transmissibility');
  }
});

test('fault crossings scale face transmissibility by seal and juxtaposition', () => {
  const sealed = VE2D.buildModel(flat({ faults: [{ x: 10, y: 6, strike: 0, length: 30, throw: 0, trans: 0, sealCap: 0, kf: 0 }] }));
  const half = VE2D.buildModel(flat({ thickness: 50, faults: [{ x: 10, y: 6, strike: 0, length: 30, throw: 25, trans: 1, sealCap: 0, kf: 0 }] }));
  const crossing = j => j * (sealed.nx + 1) + sealed.nx / 2;
  for (let j = 0; j < sealed.ny; j++) assert.equal(sealed.mx[crossing(j)], 0, `sealed row ${j}`);
  near(half.mx[crossing(24)], 0.5, 1e-3, 'half the thickness juxtaposed');
  assert.equal(half.mx[crossing(24) - 3], 1, 'faces away from the fault are untouched');
});

test('fault trace length is apportioned to cells independently of the grid', () => {
  for (const grid of ['coarse', 'standard', 'fine']) {
    const model = VE2D.buildModel(flat({ grid, faults: [{ x: 9.3, y: 6.1, strike: 23, length: 8, throw: 5, trans: 1, sealCap: 5, kf: 50 }] }));
    const total = model.leakCells.reduce((sum, cell) => sum + cell.length, 0);
    near(total, 8000, 160, `${grid} trace length`);
  }
});

test('the injector sits in the cell containing the well', () => {
  const model = VE2D.buildModel(flat({ wellX: 14.1, wellY: 6.1 }));
  assert.equal(model.well, Math.floor(6100 / model.dy) * model.nx + Math.floor(14100 / model.dx));
});

// ---------------------------------------------------------------- Task 2

test('a single dome forms one trap whose crest is the dome top', () => {
  const model = VE2D.buildModel(flat({ domes: 1, domeRelief: 40 }));
  const { zSpill, trapId, traps } = model.traps;
  const crest = model.zt.indexOf(Math.min(...model.zt));
  assert.equal(traps.length, 1);
  assert.equal(traps[0].crestCell, crest);
  assert.equal(trapId[crest], 0);
  // The model edge is a spill path, so the dome fills down to the shallowest edge cell.
  let shallowestEdge = Infinity;
  for (let c = 0; c < model.n; c++) {
    const i = c % model.nx;
    const j = Math.floor(c / model.nx);
    if (i === 0 || j === 0 || i === model.nx - 1 || j === model.ny - 1) shallowestEdge = Math.min(shallowestEdge, model.zt[c]);
  }
  near(zSpill[crest], shallowestEdge, 1e-9, 'spill depth');
  assert.ok(zSpill[crest] - model.zt[crest] > 30, 'a 40 m dome holds a tall column');
  assert.ok(traps[0].capacity > 0, 'trap has storage capacity');
  for (let c = 0; c < model.n; c++) assert.ok(zSpill[c] >= model.zt[c], 'filled level never above the surface');
});

test('a sealing fault through a dome splits it into two fault-bounded traps', () => {
  const domed = VE2D.buildModel(flat({ domes: 1, domeRelief: 40 }));
  const centre = domed.domes[0];
  const fault = { x: centre.x / 1000, y: 6, strike: 0, length: 30, throw: 0, sealCap: 0, kf: 0 };
  const open = VE2D.buildModel(flat({ domes: 1, domeRelief: 40, faults: [{ ...fault, trans: 1 }] }));
  const sealed = VE2D.buildModel(flat({ domes: 1, domeRelief: 40, faults: [{ ...fault, trans: 0 }] }));
  assert.equal(open.traps.traps.length, 1);
  assert.equal(sealed.traps.traps.length, 2);
});

test('a closed fault compartment is a trap without a spill point', () => {
  const seal = { throw: 0, trans: 0, sealCap: 0, kf: 0 };
  const triangle = [
    { ...seal, x: 10, y: 3, strike: 90, length: 7 },
    { ...seal, x: 11.5, y: 6, strike: 153.4, length: 7.6 },
    { ...seal, x: 8.5, y: 6, strike: 26.6, length: 7.6 }
  ];
  const model = VE2D.buildModel(flat({ dipDeg: 0.5, faults: triangle }));
  const inside = Math.floor(5000 / model.dy) * model.nx + Math.floor(10000 / model.dx);
  const trap = model.traps.traps[model.traps.trapId[inside]];
  assert.ok(trap, 'the enclosed cell belongs to a trap');
  assert.equal(trap.spillCell, -1);
  assert.equal(model.traps.zSpill[inside], Infinity);
});

test('contour segments trace a level set between cell centres', () => {
  const nx = 6;
  const ny = 5;
  const values = Float64Array.from({ length: nx * ny }, (_, c) => c % nx);
  const segments = VE2D.contourSegments(values, nx, ny, 2.5);
  assert.equal(segments.length, (ny - 1) * 4);
  let covered = 0;
  for (let s = 0; s < segments.length; s += 4) {
    near(segments[s], 2.5, 1e-12, 'x0');
    near(segments[s + 2], 2.5, 1e-12, 'x1');
    covered += Math.abs(segments[s + 3] - segments[s + 1]);
  }
  near(covered, ny - 1, 1e-12, 'segments cover the full height');
});

// ---------------------------------------------------------------- Task 3

const YEARS = years => years * VE2D.YEAR;
const storedMass = (model, state) => state.s.reduce((sum, value) => sum + value, 0) * model.area * model.p.rhoG;
const lens = (model, state, cx, cy, radius, height) => {
  const drain = model.p.phi * (1 - model.p.swr);
  for (let c = 0; c < model.n; c++) {
    const x = model.xc[c % model.nx];
    const y = model.yc[Math.floor(c / model.nx)];
    if (Math.hypot(x - cx, y - cy) > radius) continue;
    state.h[c] = height;
    state.hMax[c] = height;
    state.s[c] = drain * height;
  }
};
const centroidX = (model, state) => {
  let moment = 0;
  let total = 0;
  for (let c = 0; c < model.n; c++) { moment += model.xc[c % model.nx] * state.s[c]; total += state.s[c]; }
  return moment / total;
};

test('injection and gravity spreading conserve CO2 mass exactly (open and closed)', () => {
  for (const boundary of ['open', 'closed']) {
    const model = VE2D.buildModel({ ...VE2D.DEFAULTS, boundary, grid: 'coarse', disRate: 0, faults: [] });
    const state = VE2D.createState(model);
    VE2D.advance(model, state, YEARS(300));
    const accounted = storedMass(model, state) + state.exited + state.leaked + state.dissolved;
    assert.ok(state.injected > 0, 'CO2 was injected');
    assert.ok(Math.abs(state.injected - accounted) / state.injected < 1e-9, `${boundary}: ${state.injected} vs ${accounted}`);
  }
});

test('plume thickness stays within the aquifer and below its historical maximum', () => {
  const model = VE2D.buildModel(flat({ dipDeg: 1, rateMt: 0.1, faults: [] }));
  const state = VE2D.createState(model);
  model.p.rate = 0;
  lens(model, state, 14000, 6000, 1500, 30);
  for (const year of [5, 20, 60, 150]) {
    VE2D.advance(model, state, YEARS(year));
    for (let c = 0; c < model.n; c++) {
      assert.ok(state.h[c] >= 0 && state.h[c] <= model.H + 1e-9, `h in [0, H] at year ${year}`);
      assert.ok(state.h[c] <= state.hMax[c] + 1e-12, `h <= hMax at year ${year}`);
    }
  }
});

test('injection on a flat aquifer spreads symmetrically around the well', () => {
  // Transport alone (no pressure solve) has no directional bias at all.
  const model = VE2D.buildModel(flat({ boundary: 'closed', wellX: 10.1, wellY: 6.1, injYears: 30 }));
  const state = VE2D.createState(model);
  state.pressureActive = false;
  VE2D.advance(model, state, YEARS(20));
  const w = model.well;
  const scale = Math.max(...state.h);
  for (let k = 1; k < 8; k++) {
    near(state.h[w + k], state.h[w - k], 1e-9 * scale, `x symmetry at ${k}`);
    near(state.h[w + k * model.nx], state.h[w - k * model.nx], 1e-9 * scale, `y symmetry at ${k}`);
    near(state.h[w + k], state.h[w + k * model.nx], 1e-9 * scale, `x/y isotropy at ${k}`);
  }
});

test('with the pressure solve the injected plume is still nearly isotropic', () => {
  // The box is not symmetric about the well cell, so only near-isotropy is expected.
  const model = VE2D.buildModel(flat({ boundary: 'open', wellX: 10.1, wellY: 6.1, injYears: 30 }));
  const state = VE2D.createState(model);
  VE2D.advance(model, state, YEARS(20));
  const w = model.well;
  const scale = Math.max(...state.h);
  for (let k = 1; k < 8; k++) {
    near(state.h[w + k], state.h[w - k], 0.02 * scale, `x symmetry at ${k}`);
    near(state.h[w + k], state.h[w + k * model.nx], 0.03 * scale, `x/y isotropy at ${k}`);
  }
});

test('a thin plume migrates up-dip at the buoyant Darcy speed', () => {
  const model = VE2D.buildModel(flat({ dipDeg: 1, dipAz: 90, thickness: 200, sgr: 0, rateMt: 0.1, injYears: 1, boundary: 'closed' }));
  const state = VE2D.createState(model);
  model.p.rate = 0;
  lens(model, state, 14000, 6000, 1200, 2);
  const x0 = centroidX(model, state);
  VE2D.advance(model, state, YEARS(50));
  const p = model.p;
  const expected = p.k * p.krg * p.dRho * p.g * Math.sin(Math.PI / 180) / (p.muG * p.phi * (1 - p.swr));
  const measured = (x0 - centroidX(model, state)) / YEARS(50);
  assert.ok(Math.abs(measured - expected) / expected < 0.15, `centroid speed ${measured} vs ${expected} m/s`);
});

test('residual trapping leaves an immobile trail behind a migrating plume', () => {
  const model = VE2D.buildModel(flat({ dipDeg: 1, sgr: 0.25, rateMt: 0.1, injYears: 1, boundary: 'closed' }));
  const state = VE2D.createState(model);
  model.p.rate = 0;
  lens(model, state, 15000, 6000, 1000, 8);
  const start = Math.floor(6000 / model.dy) * model.nx + Math.floor(15000 / model.dx);
  VE2D.advance(model, state, YEARS(400));
  const res = model.p.phi * model.p.sgr;
  assert.ok(state.h[start] < 0.05, `mobile column left behind: ${state.h[start]}`);
  assert.ok(state.s[start] >= res * state.hMax[start] - 1e-12, 'residual CO2 is never removed by transport');
  let residual = 0;
  for (let c = 0; c < model.n; c++) residual += res * (state.hMax[c] - state.h[c]);
  assert.ok(residual / state.s.reduce((a, b) => a + b, 0) > 0.5, 'most of the plume ends up residually trapped');
});

test('open boundaries release CO2 only where its potential points outward', () => {
  const run = x => {
    const model = VE2D.buildModel(flat({ dipDeg: 1, dipAz: 90, sgr: 0, rateMt: 0.1, injYears: 1, boundary: 'open' }));
    const state = VE2D.createState(model);
    model.p.rate = 0;
    lens(model, state, x, 6000, 600, 1);
    const initial = storedMass(model, state);
    VE2D.advance(model, state, YEARS(30));
    return state.exited / initial;
  };
  assert.ok(run(19800) < 1e-6, 'a thin lens at the down-dip edge stays in the model');
  assert.ok(run(200) > 0.01, 'a lens at the up-dip edge leaves the model');
});

// ---------------------------------------------------------------- Task 4

test('closed aquifer: mean pressure build-up equals injected volume over pore compressibility', () => {
  const model = VE2D.buildModel(flat({ boundary: 'closed', grid: 'coarse', rateMt: 1, injYears: 30 }));
  const state = VE2D.createState(model);
  VE2D.advance(model, state, YEARS(30));
  const p = model.p;
  const expected = (state.injected / p.rhoG) / (p.phi * p.ct * model.Lx * model.Ly * model.H);
  const mean = state.p.reduce((sum, value) => sum + value, 0) / model.n;
  assert.ok(Math.abs(mean - expected) / expected < 0.03, `mean build-up ${mean / 1e5} bar vs ${expected / 1e5} bar`);
});

test('viscous injection without buoyancy matches the Nordbotten–Celia sharp-interface solution', () => {
  const model = VE2D.buildModel(flat({ grid: 'fine', boundary: 'open', wellX: 10.1, wellY: 6.1, rateMt: 1, injYears: 30, sgr: 0 }));
  model.p.dRho = 0;
  const state = VE2D.createState(model);
  VE2D.advance(model, state, YEARS(30));
  const p = model.p;
  const lambda = (p.krg / p.muG) * p.muW;
  const volume = state.injected / p.rhoG;
  const phiEff = p.phi * (1 - p.swr);
  const rMax = Math.sqrt(lambda * volume / (Math.PI * phiEff * model.H));
  const rMin = Math.sqrt(volume / (lambda * Math.PI * phiEff * model.H));
  // Volume-weighted mean radius of the analytic profile h = H/(λ-1)(rMax/r - 1), h = H inside rMin.
  let top = 0;
  let bottom = 0;
  for (let r = 0.5; r < rMax; r += 1) {
    const hr = r < rMin ? model.H : model.H / (lambda - 1) * (rMax / r - 1);
    top += r * hr * r;
    bottom += hr * r;
  }
  const wx = model.xc[model.well % model.nx];
  const wy = model.yc[Math.floor(model.well / model.nx)];
  let mTop = 0;
  let mBottom = 0;
  for (let c = 0; c < model.n; c++) {
    const r = Math.hypot(model.xc[c % model.nx] - wx, model.yc[Math.floor(c / model.nx)] - wy);
    mTop += r * state.h[c];
    mBottom += state.h[c];
  }
  const analytic = top / bottom;
  const numerical = mTop / mBottom;
  assert.ok(Math.abs(numerical - analytic) / analytic < 0.1, `mean radius ${numerical} m vs ${analytic} m`);
});

test('open boundaries relax the pressure after injection stops', () => {
  // Without buoyancy the only pressure signal is the injection build-up, which must vanish.
  const model = VE2D.buildModel(flat({ grid: 'coarse', boundary: 'open', injYears: 10 }));
  model.p.dRho = 0;
  const state = VE2D.createState(model);
  VE2D.advance(model, state, YEARS(10));
  const peak = Math.max(...state.p);
  assert.ok(peak > 1e5, 'injection raises pressure by more than a bar');
  VE2D.advance(model, state, YEARS(30));
  const residual = Math.max(...state.p.map(Math.abs));
  assert.ok(residual < 0.01e5, `residual ${residual / 1e5} bar vs peak ${peak / 1e5} bar`);
  assert.equal(state.pressureActive, false);
});

test('Peaceman bottom-hole build-up is consistent between grids', () => {
  const bhp = grid => {
    const model = VE2D.buildModel({ ...VE2D.DEFAULTS, grid, faults: [] });
    const state = VE2D.createState(model);
    VE2D.advance(model, state, YEARS(29.9));
    return VE2D.kpis(model, state).bhp;
  };
  const standard = bhp('standard');
  const fine = bhp('fine');
  assert.ok(standard > 0 && fine > 0, 'positive build-up');
  assert.ok(Math.abs(standard - fine) / fine < 0.1, `${standard / 1e5} vs ${fine / 1e5} bar`);
});

test('with injection the plume stays inside the aquifer thickness', () => {
  const model = VE2D.buildModel({ ...VE2D.DEFAULTS, grid: 'coarse', rateMt: 3, thickness: 30 });
  const state = VE2D.createState(model);
  for (const year of [1, 5, 20, 40, 80]) {
    VE2D.advance(model, state, YEARS(year));
    for (let c = 0; c < model.n; c++) {
      assert.ok(state.h[c] >= 0 && state.h[c] <= model.Hc[c] * (1 + 1e-6), `h=${state.h[c]} in [0, H] at year ${year}`);
      assert.ok(state.h[c] <= state.hMax[c] + 1e-12, `h <= hMax at year ${year}`);
    }
  }
});

// ---------------------------------------------------------------- Task 5

const uniformLayer = (model, state, height) => {
  const drain = model.p.phi * (1 - model.p.swr);
  state.h.fill(height);
  state.hMax.fill(height);
  state.s.fill(drain * height);
};

test('a leaky fault leaks only while the column exceeds its seal capacity', () => {
  const fault = { x: 10.1, y: 6, strike: 0, length: 8, throw: 0, trans: 1, sealCap: 20, kf: 100 };
  const run = height => {
    const model = VE2D.buildModel(flat({ grid: 'coarse', boundary: 'closed', injYears: 1, disRate: 0, faults: [fault] }));
    model.p.rate = 0;
    const state = VE2D.createState(model);
    uniformLayer(model, state, height);
    const cells = model.leakCells.map(cell => cell.cell);
    let minimum = Infinity;
    for (let year = 1; year <= 40; year++) {
      VE2D.advance(model, state, YEARS(year));
      for (const c of cells) minimum = Math.min(minimum, state.h[c]);
    }
    return { leaked: state.leaked, minimum };
  };
  assert.equal(run(10).leaked, 0, 'a 10 m column below a 20 m seal capacity does not leak');
  const leaking = run(30);
  assert.ok(leaking.leaked > 0, 'a 30 m column leaks');
  assert.ok(leaking.minimum >= 20 - 1e-9, `leakage never drains a fault column below the seal capacity (${leaking.minimum})`);
});

test('dissolution stops when the brine column is saturated', () => {
  const model = VE2D.buildModel({ ...VE2D.DEFAULTS, grid: 'coarse', disRate: 2, disCap: 1, years: 200 });
  const state = VE2D.createState(model);
  VE2D.advance(model, state, YEARS(200));
  const capacity = c => model.scenario.disCap * model.p.phi * model.Hc[c];
  assert.ok(state.dissolved > 0, 'CO2 dissolves');
  for (let c = 0; c < model.n; c++) assert.ok(state.md[c] <= capacity(c) + 1e-9, `dissolved mass per area ${state.md[c]} <= ${capacity(c)}`);
  const none = VE2D.buildModel({ ...VE2D.DEFAULTS, grid: 'coarse', disRate: 0, years: 200 });
  const noneState = VE2D.createState(none);
  VE2D.advance(none, noneState, YEARS(100));
  assert.equal(noneState.dissolved, 0);
});

test('the inventory accounts for every kilogram at every recorded year', () => {
  const result = VE2D.run({ ...VE2D.DEFAULTS, years: 400 });
  assert.equal(result.history[0].year, 0);
  assert.equal(result.history.at(-1).year, 400);
  for (const row of result.history) {
    if (row.injected === 0) continue;
    const sum = row.free + row.structural + row.residual + row.dissolved + row.exited + row.leaked;
    assert.ok(Math.abs(row.injected - sum) / row.injected < 1e-9, `year ${row.year}: ${row.injected} vs ${sum}`);
    assert.ok(Math.abs(row.balance) / row.injected < 1e-9, `reported balance at year ${row.year}`);
    for (const key of ['free', 'structural', 'residual', 'dissolved', 'exited', 'leaked']) assert.ok(row[key] >= 0, `${key} >= 0`);
  }
  const last = result.history.at(-1);
  for (const key of ['structural', 'residual', 'dissolved', 'leaked']) assert.ok(last[key] > 0, `default scenario shows ${key} trapping`);
  assert.equal(result.snapshots.length, 400 / 5 + 1);
  assert.equal(result.snapshots[1].year, 5);
  assert.equal(result.snapshots[1].h.length, result.modelView.nx * result.modelView.ny);
});

test('results converge with grid refinement', () => {
  const summary = grid => {
    const { history } = VE2D.run({ ...VE2D.DEFAULTS, grid }, { keepSnapshots: false });
    const last = history.at(-1);
    return { footprint: last.footprint, leaked: last.leaked / last.injected, residual: last.residual / last.injected };
  };
  const standard = summary('standard');
  const fine = summary('fine');
  for (const key of ['footprint', 'residual']) {
    assert.ok(Math.abs(standard[key] - fine[key]) / fine[key] < 0.1, `${key}: ${standard[key]} vs ${fine[key]}`);
  }
  assert.ok(Math.abs(standard.leaked - fine.leaked) < 0.1 * Math.max(fine.leaked, 0.01), `leaked fraction: ${standard.leaked} vs ${fine.leaked}`);
});

test('extreme inputs finish and conserve', () => {
  const started = Date.now();
  const result = VE2D.run({ ...VE2D.DEFAULTS, rateMt: 5, thickness: 10, permMd: 10, boundary: 'closed', years: 200 }, { keepSnapshots: false });
  const last = result.history.at(-1);
  assert.ok(Date.now() - started < 20000, 'finishes in bounded time');
  assert.ok(Math.abs(last.balance) / last.injected < 1e-9, 'conserves mass');
  assert.ok(last.bhpPeak > 100e5, 'reports a large bottom-hole build-up');
});

test('the default scenario runs within the interactive budget', () => {
  const started = Date.now();
  VE2D.run(VE2D.DEFAULTS, { keepSnapshots: false });
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 3000, `default 1000-year run took ${elapsed} ms`);
});

// ---------------------------------------------------------------- Task 6

test('Latin hypercube samples hit every stratum exactly once per dimension', () => {
  const rng = VE2D.mulberry32(7);
  const samples = VE2D.latinHypercube(10, 3, rng);
  assert.equal(samples.length, 10);
  for (let d = 0; d < 3; d++) {
    const strata = samples.map(row => Math.floor(row[d] * 10)).sort((a, b) => a - b);
    assert.deepEqual(strata, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }
  assert.deepEqual(VE2D.latinHypercube(4, 2, VE2D.mulberry32(3)), VE2D.latinHypercube(4, 2, VE2D.mulberry32(3)), 'seeded and reproducible');
});

test('Spearman rank correlation is +1 for monotone data and -1 when reversed', () => {
  const x = [1, 2, 3, 4, 5, 6];
  near(VE2D.spearman(x, x.map(v => v ** 3)), 1, 1e-12, 'monotone increasing');
  near(VE2D.spearman(x, x.map(v => -Math.exp(v))), -1, 1e-12, 'monotone decreasing');
  near(VE2D.spearman([1, 1, 2], [3, 3, 4]), 1, 1e-12, 'ties use average ranks');
});

test('sampled scenarios stay inside the requested ranges, log-uniform where asked', () => {
  const specs = [
    { key: 'permMd', min: 100, max: 2000, log: true },
    { key: 'porosity', min: 0.1, max: 0.3 },
    { key: 'fault0.sealCap', min: 2, max: 30 }
  ];
  const scenarios = VE2D.sampleBatch(VE2D.DEFAULTS, specs, 40, 11);
  assert.equal(scenarios.length, 40);
  for (const scenario of scenarios) {
    assert.ok(scenario.permMd >= 100 && scenario.permMd <= 2000);
    assert.ok(scenario.porosity >= 0.1 && scenario.porosity <= 0.3);
    assert.ok(scenario.faults[0].sealCap >= 2 && scenario.faults[0].sealCap <= 30);
    assert.equal(scenario.injYears, VE2D.DEFAULTS.injYears, 'unsampled inputs keep the base value');
  }
  const below = scenarios.filter(s => s.permMd < Math.sqrt(100 * 2000)).length;
  assert.equal(below, 20, 'log-uniform: half the samples below the geometric mean');
});

test('a batch realization reproduces the workbench run exactly', () => {
  const scenario = { ...VE2D.DEFAULTS, grid: 'coarse', years: 300, permMd: 800 };
  const workbench = VE2D.summarize(VE2D.run(scenario, { keepSnapshots: false }).history.at(-1));
  const [row] = VE2D.runBatch([scenario]);
  assert.deepEqual(row.summary, workbench);
  for (const key of ['leakedPct', 'exitedPct', 'residualPct', 'dissolvedPct', 'structuralPct', 'freePct', 'footprintKm2', 'bhpBar', 'migrationKm']) {
    assert.ok(Number.isFinite(row.summary[key]), key);
  }
});

test('simulated period snaps to its 50-year step so the run ends on a snapshot', () => {
  assert.equal(VE2D.normalizeScenario({ years: 1033 }).years, 1050);
  assert.equal(VE2D.normalizeScenario({ years: 1010 }).years, 1000);
});

// ---------------------------------------------------------------- random geology

test('a normal fault lifts its footwall and drops its hanging wall, both close to the fault', () => {
  const scenario = flat({ faults: [{ x: 10, y: 6, strike: 0, length: 8, throw: 30, trans: 1, sealCap: 0, kf: 0 }] });
  const offset = x => VE2D.topDepth(x, 6000, scenario) - scenario.depth;
  near(offset(10001), 21, 0.1, 'hanging wall drops 70 % of the throw');
  near(offset(9999), -9, 0.1, 'footwall rises 30 % of the throw');
  assert.ok(Math.abs(offset(18000)) < 3 && Math.abs(offset(2000)) < 3, 'one fault length away both offsets are below a tenth of the throw');
});

test('fault strike follows the right-hand rule round the full circle', () => {
  const scenario = flat({ faults: [{ x: 10, y: 6, strike: 270, length: 8, throw: 30, trans: 1, sealCap: 0, kf: 0 }] });
  assert.equal(scenario.faults[0].strike, 270, 'strikes up to 359° are kept');
  assert.ok(VE2D.topDepth(10000, 6001, scenario) > VE2D.topDepth(10000, 5999, scenario) + 25, 'striking west, the hanging wall is to the north');
});

test('domes are elongated along the regional strike', () => {
  for (const dipAz of [90, 30]) {
    const model = VE2D.buildModel(flat({ domes: 1, domeRelief: 60, dipAz }));
    const { x, y } = model.domes[0];
    const strike = (dipAz - 90) * Math.PI / 180;
    const at = (along, across) => model.depthAt(
      x + along * Math.sin(strike) + across * Math.cos(strike),
      y + along * Math.cos(strike) - across * Math.sin(strike));
    assert.ok(at(2000, 0) < at(0, 2000) - 5, `shallower along strike than across it (dip azimuth ${dipAz}°)`);
  }
});

test('caprock roughness is a random field with the requested RMS height, elongated along strike', () => {
  const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
  let rms = 0;
  let along = 0;
  let across = 0;
  for (const seed of seeds) {
    const scenario = flat({ seed, roughness: 10, dipAz: 90 });
    const depthAt = VE2D.depthField(scenario);
    let sum = 0;
    let sum2 = 0;
    let count = 0;
    for (let y = 250; y < 12000; y += 500) {
      for (let x = 250; x < 20000; x += 500) {
        const z = depthAt(x, y) - scenario.depth;
        sum += z;
        sum2 += z * z;
        count++;
        // The strike runs north–south when the caprock deepens to the east.
        along += (depthAt(x, y + 800) - scenario.depth - z) ** 2;
        across += (depthAt(x + 800, y) - scenario.depth - z) ** 2;
      }
    }
    rms += Math.sqrt(sum2 / count - (sum / count) ** 2) / seeds.length;
  }
  near(rms, 10, 2, 'RMS height averaged over realisations');
  assert.ok(along < 0.6 * across, 'undulations vary more slowly along strike than across it');
});

test('fault rock follows the shale gouge ratio (Manzocchi permeability, Bretan column height)', () => {
  const seal = VE2D.faultSeal(50, 0.2, 500, 350);
  near(seal.trans, 0.16024, 5e-5, 'multiplier for 50 m throw, SGR 0.2, 500 mD sand, 250 m cells');
  near(seal.sealCap, 50.70, 0.01, 'column held at SGR 0.2');
  assert.ok(VE2D.faultSeal(100, 0.2, 500, 350).trans < seal.trans, 'more throw, thicker gouge, lower transmissibility');
  assert.ok(VE2D.faultSeal(50, 0.35, 500, 350).sealCap > seal.sealCap, 'more clay holds a taller column');
});

test('random structures are reproducible, named and inside the input limits', () => {
  const styles = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const patch = VE2D.randomStructure(seed);
    assert.deepEqual(VE2D.randomStructure(seed), patch, 'same seed, same structure');
    assert.ok(VE2D.RANDOM_STYLES[patch.preset], `named style (${patch.preset})`);
    styles.add(patch.preset);
    const scenario = VE2D.normalizeScenario({ ...VE2D.DEFAULTS, ...patch });
    for (const key of Object.keys(patch)) if (key !== 'faults') assert.equal(scenario[key], patch[key], `${key} within limits`);
    patch.faults.forEach((fault, i) => {
      assert.deepEqual(scenario.faults[i], fault, 'fault within limits');
      const ratio = fault.throw / (fault.length * 1000);
      assert.ok(fault.throw === 150 || (ratio > 0.0015 && ratio < 0.02), `throw scales with length (D/L ${ratio})`);
    });
  }
  assert.equal(styles.size, Object.keys(VE2D.RANDOM_STYLES).length, 'every style occurs');
});

test('random fault blocks are one set of synthetic faults with the beds dipping away from them', () => {
  const gap = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
  for (let seed = 1; seed <= 20; seed++) {
    const patch = VE2D.randomStructure(seed, VE2D.DEFAULTS, 'random-fault-blocks');
    assert.ok(patch.faults.length >= 2, 'at least two faults');
    const strike = patch.faults[0].strike;
    for (const fault of patch.faults) assert.ok(gap(fault.strike, strike) <= 12, 'hanging walls on the same side');
    assert.ok(gap(patch.dipAz, strike - 90) <= 15, 'blocks tilt away from their faults');
  }
});

// Fill and spill from a cell, as in co2lab: climb to a crest, fill its trap, leave through
// its spill point and climb again, adding up the closure met on the way.
const capacityUpDip = (model, start) => {
  const { nx, ny, mx, my, zt } = model;
  const { traps, trapId } = model.traps;
  const filled = new Set();
  const climb = from => {
    for (let cell = from; ;) {
      const i = cell % nx;
      const j = (cell - i) / nx;
      let next = cell;
      const consider = (c, open) => { if (open && !filled.has(trapId[c]) && zt[c] < zt[next]) next = c; };
      consider(cell - 1, i > 0 && mx[j * (nx + 1) + i] > 0);
      consider(cell + 1, i < nx - 1 && mx[j * (nx + 1) + i + 1] > 0);
      consider(cell - nx, j > 0 && my[j * nx + i] > 0);
      consider(cell + nx, j < ny - 1 && my[(j + 1) * nx + i] > 0);
      if (next === cell) return cell;
      cell = next;
    }
  };
  let total = 0;
  for (let cell = start; ;) {
    const id = trapId[climb(cell)];
    if (id < 0 || filled.has(id)) return total;
    filled.add(id);
    total += traps[id].capacity;
    if (traps[id].spillCell < 0) return total;
    cell = traps[id].spillCell;
  }
};

test('random domes and fault blocks put a trap up-dip of the injector', () => {
  for (const style of ['random-dome', 'random-fault-blocks']) {
    for (let seed = 1; seed <= 12; seed++) {
      const model = VE2D.buildModel({ ...VE2D.DEFAULTS, ...VE2D.randomStructure(seed, VE2D.DEFAULTS, style), grid: 'coarse' });
      const mass = capacityUpDip(model, model.well) * model.p.rhoG;
      assert.ok(mass > 1e9, `${style} seed ${seed}: ${(mass / 1e9).toFixed(2)} Mt of closure on the spill route from the well`);
    }
  }
});

test('random homoclines hold CO2 in many small traps', () => {
  for (let seed = 1; seed <= 6; seed++) {
    const model = VE2D.buildModel({ ...VE2D.DEFAULTS, ...VE2D.randomStructure(seed, VE2D.DEFAULTS, 'random-homocline') });
    assert.ok(model.traps.traps.length >= 5, `seed ${seed}: ${model.traps.traps.length} traps`);
  }
});

test('the rough-surface preset forms many small structural traps', () => {
  const model = VE2D.buildModel({ ...VE2D.DEFAULTS, ...VE2D.PRESETS.rough.patch });
  assert.ok(model.traps.traps.length >= 8, `${model.traps.traps.length} traps`);
});

test('the anticline preset fills its dome to the spill point', () => {
  const scenario = { ...VE2D.DEFAULTS, ...VE2D.PRESETS.anticline.patch, grid: 'coarse' };
  const model = VE2D.buildModel(scenario);
  const largest = Math.max(...model.traps.traps.map(trap => trap.capacity)) * model.p.rhoG;
  const result = VE2D.run(scenario, { keepSnapshots: false });
  const peak = Math.max(...result.history.map(row => row.structural));
  assert.ok(peak > 0.9 * largest, `structural peak ${(peak / 1e9).toFixed(1)} Mt of ${(largest / 1e9).toFixed(1)} Mt closure`);
});

// ---------------------------------------------------------------- thickness

test('aquifer thickness varies smoothly around its mean with the requested spread', () => {
  assert.equal(VE2D.thicknessField(flat({ thicknessVar: 0 }))(1234, 5678), 50, 'no variation: the input thickness everywhere');
  const seeds = [1, 2, 3, 4, 5, 6];
  let mean = 0;
  let cv = 0;
  let min = Infinity;
  for (const seed of seeds) {
    const thicknessAt = VE2D.thicknessField(flat({ seed, thickness: 50, thicknessVar: 30 }));
    const values = [];
    for (let y = 250; y < 12000; y += 500) for (let x = 250; x < 20000; x += 500) values.push(thicknessAt(x, y));
    const m = values.reduce((sum, v) => sum + v, 0) / values.length;
    mean += m / seeds.length;
    cv += Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length) / m / seeds.length;
    min = Math.min(min, ...values);
    assert.ok(Math.abs(thicknessAt(10050, 6000) - thicknessAt(10000, 6000)) < 1, 'smooth on a 50 m scale');
  }
  near(mean, 50, 5, 'mean thickness');
  near(cv, 0.3, 0.08, 'spread as a fraction of the mean');
  assert.ok(min > 0, 'thickness stays positive');
});

test('cells carry their local thickness and traps fill only down to it', () => {
  const model = VE2D.buildModel(flat({ domes: 1, domeRelief: 40, thickness: 20, thicknessVar: 40 }));
  const thicknessAt = VE2D.thicknessField(model.scenario);
  for (const c of [0, 777, model.n - 1]) near(model.Hc[c], thicknessAt(model.xc[c % model.nx], model.yc[Math.floor(c / model.nx)]), 1e-9, 'cell-centre thickness');
  const trap = model.traps.traps[0];
  const factor = model.p.phi * (1 - model.p.swr) * model.area;
  let expected = 0;
  for (const c of trap.cells) expected += Math.min(model.Hc[c], model.traps.zSpill[c] - model.zt[c]) * factor;
  near(trap.capacity, expected, 1e-6 * expected, 'each column counts down to its own aquifer base');
});

test('closed aquifer with variable thickness: build-up fills its pore volume', () => {
  const model = VE2D.buildModel(flat({ boundary: 'closed', grid: 'coarse', rateMt: 1, injYears: 30, thicknessVar: 40 }));
  const state = VE2D.createState(model);
  VE2D.advance(model, state, YEARS(30));
  const p = model.p;
  let pore = 0;
  let weighted = 0;
  for (let c = 0; c < model.n; c++) { pore += model.Hc[c]; weighted += model.Hc[c] * state.p[c]; }
  const expected = (state.injected / p.rhoG) / (p.phi * p.ct * pore * model.area);
  near(weighted / pore, expected, 0.03 * expected, 'thickness-weighted mean build-up');
});

test('random structures vary the aquifer thickness', () => {
  for (let seed = 1; seed <= 12; seed++) assert.ok(VE2D.randomStructure(seed).thicknessVar > 0, `seed ${seed}`);
});

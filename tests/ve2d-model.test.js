const test = require('node:test');
const assert = require('node:assert/strict');
const VE2D = require('../ve2d-model.js');

const flat = patch => VE2D.normalizeScenario({
  dipDeg: 0, domes: 0, roughness: 0, faults: [], ...patch
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

const assert = require('node:assert/strict');
const test = require('node:test');

let model = {};
try {
  model = require('../ve2d-model.js');
} catch (_) {
  // The first TDD run intentionally exercises the missing module contract.
}

const createVe2dState = model.createVe2dState || (() => null);
const stepVe2d = model.stepVe2d || (() => null);

const baseParams = {
  width: 1000,
  height: 600,
  permeability: 1.7,
  porosity: 0.25,
  residualTrapFraction: 0,
  injectionRate: 0,
  injectionDuration: 0,
  wellX: 50,
  wellY: 50,
  dipX: 0,
  dipY: 0,
  structureAmplitude: 0,
  structureFrequency: 1,
  faults: []
};

test('exports the 2D VE solver API', () => {
  assert.equal(typeof model.createVe2dState, 'function');
  assert.equal(typeof model.stepVe2d, 'function');
});

test('one model year conserves an injected mass of 2 units', () => {
  const initial = createVe2dState({ cols: 9, rows: 9 });
  const next = initial && stepVe2d(initial, {
    ...baseParams,
    injectionRate: 2,
    injectionDuration: 10
  }, 1);

  assert.ok(next, 'solver must return the next state');
  const accounted = next.masses.mobile + next.masses.trapped + next.masses.leaked;
  assert.ok(Math.abs(next.masses.injected - 2) < 1e-9);
  assert.ok(Math.abs(accounted - 2) < 0.01);
});

test('a centered plume spreads in both x and y directions', () => {
  const initial = createVe2dState({ cols: 7, rows: 7 });
  if (initial) {
    const center = 3 * 7 + 3;
    initial.h[center] = 1;
    initial.hMax[center] = 1;
  }
  const next = initial && stepVe2d(initial, baseParams, 1);

  assert.ok(next, 'solver must return the next state');
  assert.ok(next.h[3 * 7 + 2] > 0, 'plume must spread west');
  assert.ok(next.h[3 * 7 + 4] > 0, 'plume must spread east');
  assert.ok(next.h[2 * 7 + 3] > 0, 'plume must spread north');
  assert.ok(next.h[4 * 7 + 3] > 0, 'plume must spread south');
});

test('a sealed fault blocks transfer across its line', () => {
  const seed = () => {
    const state = createVe2dState({ cols: 6, rows: 3 });
    if (state) {
      state.h[1 * 6 + 2] = 1;
      state.hMax[1 * 6 + 2] = 1;
    }
    return state;
  };
  const open = stepVe2d(seed(), {
    ...baseParams,
    faults: [{ xPercent: 50, dipSlope: 0, isSealed: false, transmissibility: 1 }]
  }, 1);
  const sealed = stepVe2d(seed(), {
    ...baseParams,
    faults: [{ xPercent: 50, dipSlope: 0, isSealed: true, transmissibility: 1 }]
  }, 1);

  assert.ok(open, 'solver must return the open-fault state');
  assert.ok(sealed, 'solver must return the sealed-fault state');
  assert.ok(open.h[1 * 6 + 3] > 0, 'open fault must permit cross-fault flow');
  assert.equal(sealed.h[1 * 6 + 3], 0);
});

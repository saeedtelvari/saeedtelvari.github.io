const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const HeroGeology = require('../hero-geology.js');

test('fault contact balances height while preserving gas and local capacity', () => {
  for (const [left, right, roofLeft, roofRight, capLeft, capRight] of [
    [3, 2, 10, 9, 8, 8], [0, 0.2, 10, 9, 8, 8], [4, 6, 10, 9, 4, 8],
  ]) {
    const h = [left, right];
    HeroGeology.balanceFaultContact(h, 0, 1, roofLeft, roofRight, capLeft, capRight);
    assert.ok(Math.abs(h[0] + h[1] - left - right) < 1e-8);
    assert.ok(h[0] >= 0 && h[0] <= capLeft && h[1] >= 0 && h[1] <= capRight);
    if (h[0] > 0 && h[0] < capLeft && h[1] > 0 && h[1] < capRight)
      assert.ok(Math.abs(roofLeft + h[0] - roofRight - h[1]) < 1e-5);
  }
});

test('rock bedding breaks at faults and stays continuous across ordinary cells', () => {
  const source = fs.readFileSync(require.resolve('../SubsurfaceHero.jsx'), 'utf8');
  const trace = new Function(source.slice(source.indexOf('  const trace = elevation'),
    source.indexOf('  const sealLines =')) + '\nreturn trace;')();
  const smooth = trace(x => 30 + x * 0.1);
  assert.equal((smooth.match(/M/g) || []).length, 1);
  const faulted = trace((x, cell) => 30 + x * 0.1 + (cell >= 100 ? 15 : 0));
  assert.equal((faulted.match(/M/g) || []).length, 2);
  assert.ok(faulted.includes('L 500 80 M 500 95'), 'the fault must create a gap, not a joining stroke');
  assert.ok(!/NaN|Infinity/.test(faulted));
});

test('varied hero layers stay ordered and the well ends inside the storage aquifer', () => {
  let seed = 42;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  const api = HeroGeology;
  const geologies = Array.from({ length: 100 }, () => api.randomGeology(random));
  const thicknesses = geologies.map(g => g.reservoirThickness);
  assert.ok(Math.max(...thicknesses) - Math.min(...thicknesses) > 130, 'reloads must produce visibly different beds');

  for (const g of geologies) {
    const localThicknesses = [];
    const upperBeds = Array.from({ length: 4 }, () => []);
    const lowerBeds = Array.from({ length: 4 }, () => []);
    for (let x = 0; x <= 1000; x += 5) {
      assert.equal(api.stratumY(x, g.faults, null, 0, 0, g), 0, 'surface stays fixed');
      const top = api.capRockY(x, g.faults, null, 1, g);
      const bottom = api.stratumY(x, g.faults, null, 1, g.reservoirThickness, g);
      const shallowBottom = api.stratumY(x, g.faults, null, 0.4, g.shallowThickness, g);
      assert.ok(top > 0 && bottom < 560, 'reservoir must remain inside the cross-section');
      assert.ok(bottom > top && shallowBottom < top, 'reservoirs must not intersect');
      localThicknesses.push(bottom - top);
      const lower = [bottom, ...g.aquiferLayerOffsets.map(offset =>
        api.stratumY(x, g.faults, null, 1, g.reservoirThickness + offset, g)),
        api.stratumY(x, g.faults, null, 1, g.reservoirThickness + 320, g)];
      assert.ok(Math.abs(lower.at(-1) - 580) < 1e-9, 'section bottom stays fixed');
      assert.ok(lower.every((y, i) => !i || y > lower[i - 1]), 'lower beds stay ordered');
      const capLayers = g.capLayerDepths.map(d => api.stratumY(x, g.faults, null, d, 0, g));
      assert.ok(top > capLayers[0] && capLayers[0] > capLayers[1] && capLayers[1] > capLayers[2]);
      const upper = [0, ...capLayers.toReversed(), top];
      upperBeds.forEach((bed, i) => bed.push(upper[i + 1] - upper[i]));
      lowerBeds.forEach((bed, i) => bed.push(lower[i + 1] - lower[i]));
    }
    assert.ok(Math.max(...localThicknesses) - Math.min(...localThicknesses) > 30,
      'reservoir must visibly thicken and thin within the same section');
    for (const bed of [...upperBeds, ...lowerBeds]) {
      assert.ok(Math.max(...bed) - Math.min(...bed) > 2, 'every surrounding bed varies laterally');
    }
    const { wellBottom } = api.section(g);
    assert.ok(wellBottom > api.capRockY(g.wellX, g.faults, null, 1, g), 'the well reaches the storage aquifer');
    assert.ok(wellBottom < api.stratumY(g.wellX, g.faults, null, 1, g.reservoirThickness, g), 'and stops above its base');
  }

  // A thin bed exercises the height limits of the shared model (tests/hero-model.test.js covers the balance).
  const g = geologies.reduce((a, b) => a.reservoirThickness < b.reservoirThickness ? a : b);
  const run = api.simulate(g);
  const sec = api.section(g);
  for (let year = 0; year <= run.years; year += 7) {
    const frame = api.frameOf(run, year);
    // Wherever both columns at a permeable fault hold mobile CO2, their gas-water contacts meet.
    sec.faultCells.forEach(cells => [['h', 0], ['h2', 1]].forEach(([field, j]) => {
      const k = cells[j], layer = sec.layers[j], heights = frame[field];
      if (k <= 0 || k >= 201 || heights[k - 1] <= 0.01 || heights[k] <= 0.01) return;
      if (heights[k - 1] >= layer.cap[k - 1] - 1e-3 || heights[k] >= layer.cap[k] - 1e-3) return;
      assert.ok(Math.abs(layer.roofL[k] + heights[k - 1] * 15 - layer.roofR[k] - heights[k] * 15) < 0.2,
        'active gas-water contact must meet across a permeable fault');
    }));
  }
  assert.ok(api.frameOf(run, 30).h.some(h => h > 0), 'injection produces a visible plume');
});

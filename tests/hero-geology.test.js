const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const HeroGeology = require('../hero-geology.js');

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

test('varied hero layers stay ordered and both solvers respect their thickness', () => {
  let seed = 42;
  const math = Object.create(Math);
  math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  const source = fs.readFileSync(require.resolve('../SubsurfaceHero.jsx'), 'utf8');
  const api = new Function('React', 'Math', 'HeroGeology', source.slice(0, source.indexOf('const SubsurfaceHero =')) +
    '\nreturn { generateRandomGeology, capRockY, stratumY, getColumnPath, precomputeSimulation };')({}, math, HeroGeology);
  const geologies = Array.from({ length: 100 }, () => api.generateRandomGeology());
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
    const wellBottom = api.stratumY(g.wellX, g.faults, null, 1, g.reservoirThickness, g) - 20;
    assert.ok(wellBottom > api.capRockY(g.wellX, g.faults, null, 1, g));
    assert.ok(api.getColumnPath(1, g).includes(String(wellBottom)), 'well follows the bed bottom');
  }

  // A thin bed exercises the new height limits; compare the actual worker and fallback.
  const g = geologies.reduce((a, b) => a.reservoirThickness < b.reservoirThickness ? a : b);
  let workerHistory;
  let profileCalls = 0;
  const countedGeometry = { ...HeroGeology, capRockY: (...args) => {
    profileCalls++;
    return HeroGeology.capRockY(...args);
  } };
  const worker = { postMessage: result => { workerHistory = result.history; } };
  new Function('self', 'importScripts', 'HeroGeology', fs.readFileSync(require.resolve('../hero-simulation-worker.js'), 'utf8'))(
    worker, () => {}, countedGeometry);
  worker.onmessage({ data: { geology: g } });
  assert.ok(profileCalls <= 800, 'static face profiles must be cached across all time steps');
  const fallback = api.precomputeSimulation(g.faults, g);
  assert.equal(workerHistory.length, 1001);
  assert.ok(workerHistory[0].faultFlow.every(flow => flow === 0), 'no leaking before injection');
  let leakingAtThreshold = false;
  for (let frame = 0; frame < workerHistory.length; frame++) {
    workerHistory[frame].faultFlow.forEach((flow, i) => {
      assert.ok(Number.isFinite(flow) && flow >= 0 && flow <= g.faults[i].leakRate + 1e-10);
      assert.ok(Math.abs(flow - fallback[frame].faultFlow[i]) < 1e-8, 'both solvers report the same leakage');
      const cell = Math.max(0, Math.min(200, Math.round(HeroGeology.getFaultIntersection(g.faults[i], 1, g).x / 5)));
      if (flow > 0 && workerHistory[frame].h[cell] <= g.faults[i].thresholdHeight) leakingAtThreshold = true;
    });
    for (const key of ['h', 'hMax', 'h2', 'h2Max']) {
      workerHistory[frame][key].forEach((height, i) => {
        const depth = key.startsWith('h2') ? 0.4 : 1;
        const offset = depth === 1 ? g.reservoirThickness : g.shallowThickness;
        const limit = (api.stratumY(i * 5, g.faults, i, depth, offset, g) -
          api.capRockY(i * 5, g.faults, i, depth, g)) / 15;
        assert.ok(Number.isFinite(height) && height >= 0 && height <= limit);
        assert.ok(Math.abs(height - fallback[frame][key][i]) < 1e-8, 'worker and fallback must agree');
      });
    }
  }
  assert.ok(workerHistory[320].h.some(h => h > 0), 'injection still produces a visible plume');
  assert.ok(leakingAtThreshold, 'record leakage even when draining reduces the saved height to the entry threshold');
});

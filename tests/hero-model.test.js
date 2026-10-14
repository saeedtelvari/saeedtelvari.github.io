const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const G = require('../hero-geology.js');

const rng = seed => () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);

test('mobile thickness inverts stored volume and respects hysteresis', () => {
  for (const [h, hMax, R] of [[0, 0, .3], [2, 2, .3], [1, 4, .25], [0, 4, .31], [3.5, 3, .3]]) {
    const S = G.storedVolume(h, hMax, R);
    assert.ok(Math.abs(G.mobileThickness(S, Math.max(hMax, S), R) - h) < 1e-12);
  }
  assert.equal(G.mobileThickness(5, 5, .3), 5, 'a freshly drained column is all mobile');
  assert.equal(G.mobileThickness(.3 * 4, 4, .3), 0, 'pure residual has no mobile CO2');
});

test('injected CO2 is conserved and no column overfills, across 100 random geologies', () => {
  const random = rng(7);
  for (let n = 0; n < 100; n++) {
    const g = G.randomGeology(random);
    const run = G.simulate(g, { years: 90 });
    assert.equal(run.lost, 0, 'every injected volume found room');
    const sec = G.section(g);
    for (let y = 0; y <= run.years; y++) {
      const f = G.frameOf(run, y);
      const { mobile, residual, leaked, injected } = f.inventory;
      assert.ok(Math.abs(mobile + residual + leaked - injected) <= 1e-9 * Math.max(1, injected), `balance at year ${y}`);
      for (const [S, h, hMax, cap] of [[f.S, f.h, f.hMax, sec.layers[0].cap], [f.S2, f.h2, f.h2Max, sec.layers[1].cap]]) {
        for (let i = 0; i < 201; i++) {
          assert.ok(S[i] >= -1e-6 && S[i] <= cap[i] + 1e-4, 'within capacity');
          assert.ok(h[i] >= -1e-6 && h[i] <= S[i] + 1e-4 && S[i] <= hMax[i] + 1e-4, 'mobile <= stored <= swept');
        }
      }
    }
    assert.ok(G.frameOf(run, 30).inventory.injected > 0 && Math.abs(G.frameOf(run, 31).inventory.injected - G.frameOf(run, 30).inventory.injected) < 1e-12,
      'injection stops at year 30');
  }
});

test('a fault leaks only once its mobile column exceeds the entry height', () => {
  const g = G.randomGeology(rng(11));
  const run = G.simulate(g, { years: 400 });
  const sec = G.section(g);
  let leaked = false;
  for (let y = 1; y <= run.years; y++) {
    const now = G.frameOf(run, y);
    g.faults.forEach((fault, i) => {
      const flow = now.faultFlow[i];
      // Frames are stored as Float32, so allow the relative rounding of one float.
      assert.ok(flow >= 0 && flow <= fault.leakRate * (1 + 1e-6), 'bounded by the leak rate');
      if (flow > 0) {
        leaked = true;
        const k = sec.faultCells[i][0];
        // Leakage can drain the column back below the entry height within the year; the swept depth remembers it.
        assert.ok(now.hMax[k] > fault.thresholdHeight, 'column reached the entry height');
      }
    });
  }
  assert.equal(G.frameOf(run, 0).faultFlow.every(v => v === 0), true);
  assert.ok(leaked || G.frameOf(run, run.years).inventory.leaked === 0);
});

test('per-fault leaked volume accumulates the fault flux and adds up to the leaked inventory', () => {
  const random = rng(5);
  let checked = 0;
  for (let n = 0; n < 30; n++) {
    const g = G.randomGeology(random);
    const run = G.simulate(g, { years: 300 });
    let before = new Float64Array(run.faults);
    for (let y = 0; y <= run.years; y++) {
      const f = G.frameOf(run, y);
      const total = f.faultLeaked.reduce((a, b) => a + b, 0);
      // Leaked CO2 can only arrive through the faults, so the two ledgers must agree.
      assert.ok(Math.abs(total - f.inventory.leaked) <= 1e-4 * Math.max(1e-6, f.inventory.leaked), `fault ledger at year ${y}`);
      f.faultLeaked.forEach((v, i) => assert.ok(v >= before[i], 'cumulative leakage never decreases'));
      before = Float64Array.from(f.faultLeaked);
    }
    if (G.frameOf(run, run.years).inventory.leaked > 0) checked++;
  }
  assert.ok(checked > 3, 'enough geologies leak to exercise the ledger');
});

test('leak readout names the leaking fault, its column and entry height in metres, and the leaked share', () => {
  const g = G.randomGeology(rng(9));
  const sec = G.section(g);
  const frame = (flows, column) => {
    const h = new Float32Array(201);
    flows.forEach((v, i) => { if (v > 0) h[sec.faultCells[i][0]] = column; });
    return { faultFlow: Float32Array.from(flows), h, inventory: { mobile: 70, residual: 20, leaked: 10, injected: 100 } };
  };
  const quiet = g.faults.map(() => 0);
  assert.equal(G.leakReadout(g, sec, frame(quiet, 2)), null, 'no label while every fault seals');
  const flows = g.faults.map((_, i) => (i === g.faults.length - 1 ? 0.1 : 0));
  const last = g.faults.length - 1;
  const column = g.faults[last].thresholdHeight + 2;
  assert.deepEqual(G.leakReadout(g, sec, frame(flows, column)), {
    fault: last, state: 'above',
    column: Math.round(column * 45), entry: Math.round(g.faults[last].thresholdHeight * 45), leakedPct: 10,
  });
  // A steady leak drains the column down to the entry height each year: it is still leaking, held there.
  assert.equal(G.leakReadout(g, sec, frame(flows, g.faults[last].thresholdHeight * .98)).state, 'held');
  assert.equal(G.leakReadout(g, sec, frame(flows, g.faults[last].thresholdHeight + .001)).state, 'held',
    'a column that rounds to the entry height reads as held, not above');
});

test('worker and in-page fallback produce identical frames', () => {
  const g = G.randomGeology(rng(3));
  let posted, transfers;
  const self = { postMessage: (data, list) => { posted = data; transfers = list; } };
  new Function('self', 'importScripts', 'HeroGeology', fs.readFileSync(require.resolve('../hero-simulation-worker.js'), 'utf8'))(self, () => {}, G);
  self.onmessage({ data: { geology: g, options: { years: 60 } } });
  const direct = G.simulate(g, { years: 60 });
  assert.deepEqual([...posted.h[0]], [...direct.h[0]]);
  assert.deepEqual([...posted.inventory], [...direct.inventory]);
  assert.ok(transfers.length >= 7, 'typed arrays are transferred, not cloned');
});

test('depth axis is linear below its break and exaggeration follows the rendered size', () => {
  const ticks = G.depthTicks();
  assert.deepEqual(ticks, [1000, 1500, 2000]);
  const ys = ticks.map(G.depthToY);
  assert.ok(Math.abs((ys[1] - ys[0]) - (ys[2] - ys[1])) < 1e-9);
  assert.ok(ys.every(y => y > G.HERO_DEPTH.breakY && y < 580));
  assert.equal(G.exaggeration(1440, 420), 2);
  assert.equal(G.exaggeration(390, 414), 6);
});

test('playback is slow during injection and fast during migration', () => {
  assert.equal(G.yearsPerSecond(0), 8);
  assert.equal(G.yearsPerSecond(29), 8);
  assert.equal(G.yearsPerSecond(100), 60);
  for (let y = 0; y < 60; y++) assert.ok(G.yearsPerSecond(y + 1) >= G.yearsPerSecond(y));
});

test('hero playback starts still under reduced motion and never ticks unseen', () => {
  const src = fs.readFileSync(require.resolve('../SubsurfaceHero.jsx'), 'utf8');
  const h = new Function(src.slice(src.indexOf('// ---- hero playback helpers'), src.indexOf('// ---- end hero playback helpers')) +
    '\nreturn { heroInitialPlayback, heroShouldTick, heroPhase };')();
  assert.deepEqual(h.heroInitialPlayback(true), { year: 400, playing: false });
  assert.deepEqual(h.heroInitialPlayback(false), { year: 0, playing: true });
  for (const playing of [true, false]) for (const visible of [true, false]) for (const hidden of [true, false]) {
    assert.equal(h.heroShouldTick({ playing, visible, hidden }), playing && visible && !hidden);
  }
  assert.equal(h.heroPhase(12, 30), 'injecting');
  assert.equal(h.heroPhase(30, 30), 'migrating');
});

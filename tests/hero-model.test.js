const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const G = require('../hero-geology.js');

const heroHelpers = () => {
  const src = fs.readFileSync(require.resolve('../SubsurfaceHero.jsx'), 'utf8');
  return new Function(src.slice(src.indexOf('// ---- hero playback helpers'), src.indexOf('// ---- end hero playback helpers')) +
    '\nreturn { heroInitialPlayback, heroShouldTick, heroPhase, heroShipStep, heroCanAdvance, heroShipFor };')();
};
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

test('fault flux follows the driving-potential law of Ramachandran et al. (2026)', () => {
  const c = 0.01, lc = 3;
  assert.equal(G.faultFlux(c, 0, lc), 0, 'no flux until the potential is positive');
  assert.equal(G.faultFlux(c, -1, lc), 0);
  // Well past onset: Darcy flow through the caprock, driven by the potential plus the CO2 column in the fault.
  assert.ok(Math.abs(G.faultFlux(c, 2, lc) - c * (2 + lc) / lc) < 1e-12);
  // Onset is smoothed over about 1 kPa (xi = 1e-3 /Pa): at 1 kPa the flux is 1 - 1/e of the full rate.
  const kPa = 0.01 / G.BAR_PER_HEAD;
  assert.ok(Math.abs(G.faultFlux(c, kPa, lc) / (c * (kPa + lc) / lc) - (1 - Math.exp(-1))) < 1e-9);
  for (let psi = 0.1; psi < 3; psi += 0.1) assert.ok(G.faultFlux(c, psi + 0.1, lc) > G.faultFlux(c, psi, lc), 'rises with the potential');
  assert.ok(Math.abs(G.faultFlux(2 * c, 1, lc) - 2 * G.faultFlux(c, 1, lc)) < 1e-15, 'proportional to fault conductance');
});

test('injection overpressure builds while injecting and dissipates after', () => {
  const p = (r, t) => G.overpressure(r, t, 30);
  assert.equal(p(2000, 0), 0);
  for (let t = 1; t < 30; t++) assert.ok(p(2000, t + 1) > p(2000, t), 'builds during injection');
  for (let t = 31; t < 400; t++) assert.ok(p(2000, t + 1) < p(2000, t), 'decays after shut-in');
  assert.ok(p(1000, 30) > p(3000, 30), 'falls with distance from the well');
  assert.ok(p(2000, 30) > 2 && p(2000, 30) < 5, 'a few bar at a fault 2 km away when injection ends');
  assert.ok(p(2000, 400) < 0.1, 'nearly gone centuries later');
});

test('a fault leaks only while buoyancy plus overpressure exceeds its entry pressure', () => {
  const g = G.randomGeology(rng(11));
  const run = G.simulate(g, { years: 400 });
  const sec = G.section(g);
  let leaked = false;
  for (let y = 1; y <= run.years; y++) {
    const now = G.frameOf(run, y);
    sec.leak.forEach((fault, i) => {
      const flow = now.faultFlow[i];
      const k = sec.faultCells[i][0];
      // The model holds a year's overpressure at its midpoint; the swept depth bounds the column during that year.
      const psi = now.hMax[k] + G.overpressure(fault.distance, y - 0.5, run.injectionYears) / G.BAR_PER_HEAD - fault.entryHead;
      // Frames are stored as Float32, so allow the relative rounding of one float.
      assert.ok(flow >= 0 && flow <= G.faultFlux(fault.conductance, psi, fault.caprock) * (1 + 1e-6) + 1e-12, 'bounded by the flux law');
      if (flow > 0) { leaked = true; assert.ok(psi > 0, 'the potential was positive'); }
    });
  }
  assert.equal(G.frameOf(run, 0).faultFlow.every(v => v === 0), true);
  assert.ok(leaked || G.frameOf(run, run.years).inventory.leaked === 0);
});

test('leaked share stays in a realistic range across random geologies', () => {
  const random = rng(21);
  const shares = [];
  for (let n = 0; n < 16; n++) {
    const run = G.simulate(G.randomGeology(random), { years: 800 });
    const { leaked, injected } = G.frameOf(run, run.years).inventory;
    shares.push(leaked / injected);
  }
  shares.sort((a, b) => a - b);
  assert.ok(shares[shares.length - 1] < 0.1, 'no section loses a tenth of its CO2');
  assert.ok(shares[shares.length >> 1] < 0.02, 'a typical section leaks under 2 %');
  assert.ok(shares.some(share => share > 0), 'some faults still leak');
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

test('leak readout names the leaking fault and the terms of its driving potential in bar', () => {
  const g = G.randomGeology(rng(9));
  const sec = G.section(g);
  const frame = (flows, column) => {
    const h = new Float32Array(201);
    flows.forEach((v, i) => { if (v > 0) h[sec.faultCells[i][0]] = column; });
    return { faultFlow: Float32Array.from(flows), h, inventory: { mobile: 79.6, residual: 20, leaked: 0.4, injected: 100 } };
  };
  const quiet = g.faults.map(() => 0);
  assert.equal(G.leakReadout(g, sec, frame(quiet, 2), 300, 30), null, 'no label while every fault seals');
  const last = g.faults.length - 1;
  const flows = g.faults.map((_, i) => (i === last ? 0.1 : 0));
  const tenth = v => Math.round(v * 10) / 10;
  const over = tenth(G.overpressure(sec.leak[last].distance, 300, 30));
  const column = sec.leak[last].entryHead + 2;
  assert.deepEqual(G.leakReadout(g, sec, frame(flows, column), 300, 30), {
    fault: last, state: 'above', buoyancy: tenth(column * G.BAR_PER_HEAD), overpressure: over,
    entry: tenth(g.faults[last].entryPressure),
  });
  // A steady leak drains the column until buoyancy plus overpressure sits at the entry pressure: still leaking, held there.
  const held = (g.faults[last].entryPressure - over) / G.BAR_PER_HEAD;
  assert.equal(G.leakReadout(g, sec, frame(flows, held * .98), 300, 30).state, 'held');
  assert.equal(G.percent(0.4, 100), 0.4, 'small shares keep one decimal');
  assert.equal(G.percent(77.4, 100), 77);
  assert.equal(G.percent(0, 0), 0);
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
  const h = heroHelpers();
  assert.deepEqual(h.heroInitialPlayback(true), { year: 400, playing: false });
  assert.deepEqual(h.heroInitialPlayback(false), { year: 0, playing: true });
  for (const playing of [true, false]) for (const visible of [true, false]) for (const hidden of [true, false]) {
    assert.equal(h.heroShouldTick({ playing, visible, hidden }), playing && visible && !hidden);
  }
  assert.equal(h.heroPhase(0, 30, 'arriving'), 'carrier arriving');
  assert.equal(h.heroPhase(0, 30, 'connecting'), 'connecting the hose');
  assert.equal(h.heroPhase(12, 30, 'moored'), 'injecting');
  assert.equal(h.heroPhase(30, 30, 'disconnecting'), 'migrating');
});

test('the carrier berths before injection starts and sails once it ends', () => {
  const h = heroHelpers();
  const until = (ship, want, phase) => {
    let t = 0;
    while (ship.phase !== phase && t < 60) { ship = h.heroShipStep(ship, 0.05, want); t += 0.05; }
    return [ship, t];
  };
  let [ship, t] = until({ phase: 'away', p: 1 }, true, 'moored');
  assert.ok(Math.abs(t - 9.5) < 0.2, `arrives in 8 s and connects in 1.5 s (took ${t.toFixed(2)} s)`);
  assert.equal(h.heroCanAdvance(0, 30, 'connecting'), false, 'no injection before the hose is connected');
  assert.equal(h.heroCanAdvance(0, 30, 'moored'), true);
  assert.equal(h.heroCanAdvance(30, 30, 'departing'), true, 'migration never waits for the ship');
  [ship, t] = until(ship, false, 'away');
  assert.ok(Math.abs(t - 11.5) < 0.2, `disconnects in 1.5 s and sails for 10 s (took ${t.toFixed(2)} s)`);
  // Restarting while the hose is coming off reconnects from where it was.
  const mid = h.heroShipStep({ phase: 'disconnecting', p: 0.25 }, 0, true);
  assert.equal(mid.phase, 'connecting');
  assert.ok(Math.abs(mid.p - 0.75) < 1e-12);
  // Reduced motion: every manoeuvre completes at once.
  const instant = { arriving: 0, connecting: 0, disconnecting: 0, departing: 0 };
  assert.equal(h.heroShipStep(h.heroShipStep({ phase: 'away', p: 1 }, 0.016, true, instant), 0.016, true, instant).phase, 'moored');
  // Scrubbing jumps straight to the state that belongs to that year.
  assert.deepEqual(h.heroShipFor(10, 30), { phase: 'moored', p: 1 });
  assert.deepEqual(h.heroShipFor(400, 30), { phase: 'away', p: 1 });
});

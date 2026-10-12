// ve-engine.check.js — assert-only self-check for ve-engine.js.  Run: node ve-engine.check.js
const assert = require('assert');
const VE = require('./ve-engine.js');

const run = (m, s, years, opts) => VE.advance(m, s, years, opts);
const flat = over => VE.withDefaults({ dipPct: 0, foldAmp: 0, faults: [], Q_Mtpa: 0, ...over });
// place a mound of mobile CO2 (thickness profile hOf(i)) into layer 0, as if freshly drained
function mound(m, hOf) {
  const s = VE.initState(m);
  for (let i = 0; i < m.nx; i++) { const h = hOf(i); s.layers[0].V[i] = m.a * h; s.layers[0].hmax[i] = h; }
  return s;
}
const sum = a => a.reduce((x, y) => x + y, 0);
const centroid = (m, h) => { let w = 0, x = 0; for (let i = 0; i < m.nx; i++) { w += h[i]; x += h[i] * m.xc[i]; } return x / w; };
let passed = 0;
function test(name, fn) { const t0 = Date.now(); fn(); passed++; console.log(`ok  ${name}  (${Date.now() - t0} ms)`); }

test('1+2 presets: mass balance < 1e-10 at 10/30/100/1000 yr, invariants every substep, no flags', () => {
  for (const [name, p] of Object.entries(VE.PRESETS)) {
    const m = VE.createModel(p);
    const check = (s, dt, h) => {
      for (let l = 0; l < 2; l++) {
        const L = m.layers[l], S = s.layers[l];
        for (let i = 0; i < m.nx; i++) {
          assert(h[l][i] >= 0 && h[l][i] <= L.H + 1e-9, `${name}: h out of range`);
          assert(h[l][i] <= S.hmax[i] + 1e-9, `${name}: h > hmax`);
          assert(S.V[i] >= -1e-12, `${name}: V < 0 (${S.V[i]})`);
          assert(S.D[i] <= m.p.phi * L.H * 50 + 1e-9, `${name}: D > Dcap`);
        }
      }
    };
    let s = VE.initState(m), t = 0;
    for (const T of [10, 30, 100, 1000]) {
      s = run(m, s, T - t, { onSubstep: check }); t = T;
      const dg = VE.diagnose(m, s);
      assert(Math.abs(dg.balanceError) < 1e-10, `${name} yr ${T}: balance ${dg.balanceError}`);
      assert.deepStrictEqual(dg.flags, {}, `${name} yr ${T}: flags ${JSON.stringify(dg.flags)}`);
    }
    const dg = VE.diagnose(m, s);
    const Mt = x => (x / 1e9).toFixed(2);
    console.log(`    ${name.padEnd(11)} inj ${Mt(dg.injected)} | L0 str ${Mt(dg.layers[0].structural)} mig ${Mt(dg.layers[0].migrating)} res ${Mt(dg.layers[0].residual)} dis ${Mt(dg.layers[0].dissolved)} | upper ${Mt(dg.layers[1].total)} | exited ${Mt(dg.exited)} | traps ${m.layers[0].traps.length}`);
  }
});

test('3 flat caprock: central mound spreads symmetrically', () => {
  const m = VE.createModel(flat({}));
  const c = m.nx / 2;
  let s = mound(m, i => Math.max(0, 10 - Math.abs(i + 0.5 - c) * 0.5));
  s = run(m, s, 200);
  const h = VE.diagnose(m, s).layers[0].h;
  for (let i = 0; i < c; i++) assert(Math.abs(h[i] - h[m.nx - 1 - i]) < 1e-12, `asymmetry at ${i}`);
});

test('4 tilted caprock: plume centroid moves up-dip monotonically', () => {
  const m = VE.createModel(flat({ dipPct: 2, Sgr: 0 }));       // deeper to the right → CO2 moves left (~55 m/yr)
  let s = mound(m, i => Math.max(0, 10 - Math.abs(i - 150) * 0.5));
  let prev = centroid(m, VE.diagnose(m, s).layers[0].h);
  for (let k = 0; k < 6; k++) {
    s = run(m, s, 10);
    const x = centroid(m, VE.diagnose(m, s).layers[0].h);
    assert(x < prev, `centroid did not move up-dip (${x} >= ${prev})`);
    prev = x;
  }
});

test('5 sealed fault: no flow across, no leakage', () => {
  const m = VE.createModel(flat({ faults: [{ ...VE.FAULT_TEMPLATES[0], xFrac: 0.5, throw_m: 0, sealed: true }] }));
  const face = m.faults[0].lowerFace;
  let s = mound(m, i => (i < face && i >= face - 20 ? 20 : 0));
  s = run(m, s, 300);
  for (let i = face; i < m.nx; i++) assert.strictEqual(s.layers[0].V[i], 0, `CO2 crossed sealed fault at ${i}`);
  assert.strictEqual(sum(s.layers[1].V), 0, 'sealed fault leaked');
});

test('6 throw >= H: juxtaposition barrier and fault-bounded trap', () => {
  const m = VE.createModel(flat({ dipPct: 1, faults: [{ ...VE.FAULT_TEMPLATES[0], xFrac: 0.5, throw_m: 60 }] }));
  const face = m.faults[0].lowerFace, L = m.layers[0];
  assert.strictEqual(L.mult[face], 0);
  assert(L.traps.some(t => t.lo === face), 'no trap bounded by the fault');
});

test('7 single anticline: one trap, spill at shallower saddle, capacity matches hand calc', () => {
  const m = VE.createModel(flat({ foldAmp: 20, foldCount: 1 }));   // crest at L/4, edges spill shallower than trough
  const L = m.layers[0];
  assert.strictEqual(L.traps.length, 1);
  const t = L.traps[0];
  assert.strictEqual(t.spill, L.zt[0], 'spill should be the left edge (shallower than the trough)');
  let cap = 0;
  for (let i = 0; i < m.nx / 2; i++) if (L.zt[i] < t.spill) cap += Math.min(L.H, t.spill - L.zt[i]);
  cap *= m.a * m.dx * m.p.W * m.rhoG;
  assert(Math.abs(cap - t.capacity) / cap < 1e-12, `capacity ${t.capacity} vs ${cap}`);
});

test('8 dissolution: capped per column, off when dissMult = 0', () => {
  const m = VE.createModel(VE.PRESETS.dipping);
  const s = run(m, VE.initState(m), 1000);
  const cap = m.p.phi * m.p.H * 50;
  assert(Math.max(...s.layers[0].D) <= cap + 1e-9);
  assert(sum(s.layers[0].D) > 0, 'expected some dissolution');
  const m0 = VE.createModel({ ...VE.PRESETS.dipping, dissMult: 0 });
  const s0 = run(m0, VE.initState(m0), 300);
  assert.strictEqual(sum(s0.layers[0].D), 0);
});

test('9 residual trail: residual > 0 after injection, h = 0 cells hold V = φ·Sgr·hmax', () => {
  const m = VE.createModel(VE.PRESETS.default);
  const s = run(m, VE.initState(m), 300);
  const dg = VE.diagnose(m, s);
  assert(dg.layers[0].residual > 0);
  let n = 0;
  for (let i = 0; i < m.nx; i++) {
    if (dg.layers[0].h[i] === 0 && s.layers[0].V[i] > 0) {
      n++;
      assert(Math.abs(s.layers[0].V[i] - m.r * s.layers[0].hmax[i]) < 1e-12);
    }
  }
  assert(n > 0, 'expected swept cells with only residual CO2');
});

test('10 leak threshold: below hth no leak, above hth leaks', () => {
  const p = flat({ faults: [{ ...VE.FAULT_TEMPLATES[0], xFrac: 0.5, throw_m: 0 }] });   // hth ≈ 5.8 m
  const m = VE.createModel(p);
  const face = m.faults[0].lowerFace;
  const low = run(m, mound(m, i => (Math.abs(i - face) < 10 ? 3 : 0)), 50);
  assert.strictEqual(sum(low.layers[1].V), 0, 'leaked below threshold');
  const high = run(m, mound(m, i => (Math.abs(i - face) < 10 ? 20 : 0)), 50);
  assert(sum(high.layers[1].V) > 0, 'no leak above threshold');
  assert(high.leakedCum > 0);
});

test('11 analytic: fixed-volume gravity current front ∝ t^(1/3) (Huppert & Woods 1995)', () => {
  const m = VE.createModel(flat({ nx: 400, H: 500, Sgr: 0, dissMult: 0 }));
  const c = m.nx / 2;
  let s = mound(m, i => (Math.abs(i + 0.5 - c) < 5 ? 2 : 0));
  const front = st => {
    const h = VE.diagnose(m, st).layers[0].h;
    let i = m.nx - 1; while (i > c && h[i] < 1e-3) i--;
    return m.xc[i] - m.xc[c];
  };
  s = run(m, s, 100); const x1 = front(s);
  s = run(m, s, 700); const x2 = front(s);
  const expo = Math.log(x2 / x1) / Math.log(800 / 100);
  console.log(`    front exponent ${expo.toFixed(3)}  (x1 ${x1.toFixed(0)} m, x2 ${x2.toFixed(0)} m)`);
  assert(Math.abs(expo - 1 / 3) < 0.05, `exponent ${expo}`);
});

test('12 fringe profile preserves column volume', () => {
  const m = VE.createModel(VE.PRESETS.default);
  const s = run(m, VE.initState(m), 300);
  const dg = VE.diagnose(m, s);
  let checked = 0;
  for (let i = 0; i < m.nx; i++) {
    if (s.layers[0].V[i] < 1e-6) continue;
    const prof = VE.columnProfile(m, s, 0, i, 4000);
    let integ = 0;
    for (let k = 1; k < prof.length; k++) integ += 0.5 * (prof[k].Sg + prof[k - 1].Sg) * (prof[k].z - prof[k - 1].z);
    const want = s.layers[0].V[i] / m.p.phi;
    const dz = prof[1].z - prof[0].z;                       // step in Sg at the residual base → trapezoid error ≲ dz
    assert(Math.abs(integ - want) < 0.01 * want + 2 * dz, `cell ${i}: ∫Sg ${integ} vs ${want}`);
    checked++;
  }
  assert(checked > 0);
});

test('13 compartment: well sealed in by faults on both sides → injection blocked, nothing injected', () => {
  const F = VE.FAULT_TEMPLATES[0];
  const m = VE.createModel(VE.withDefaults({ wellFrac: 0.5, faults: [{ ...F, xFrac: 0.4, sealed: true }, { ...F, xFrac: 0.6, sealed: true }] }));
  const s = run(m, VE.initState(m), 10);
  const dg = VE.diagnose(m, s);
  assert.strictEqual(dg.flags.injectionBlocked, true);
  assert.strictEqual(dg.injected, 0);
  assert(Number.isFinite(dg.balanceError));
  // geometric property, independent of time: the UI keeps warning after the injection window closes
  assert.strictEqual(m.injectionBlocked, true);
  assert.strictEqual(VE.createModel(VE.PRESETS.default).injectionBlocked, false);
});

test('14 extreme inputs (10 mD, 5 Mt/yr): finite state, exact balance', () => {
  const m = VE.createModel(VE.withDefaults({ k_mD: 10, Q_Mtpa: 5 }));
  const s = run(m, VE.initState(m), 50);
  const dg = VE.diagnose(m, s);
  for (const L of s.layers) for (const v of L.V) assert(Number.isFinite(v));
  assert(Math.abs(dg.balanceError) < 1e-9, `balance ${dg.balanceError}`);
  console.log(`    flags ${JSON.stringify(dg.flags)}  substeps/yr ${s.substepsLastYear.toFixed(0)}  maxV ${Math.max(...s.layers[0].V).toFixed(2)} (cap ${(m.a * m.p.H).toFixed(2)})`);
});

console.log(`\n${passed} checks passed`);

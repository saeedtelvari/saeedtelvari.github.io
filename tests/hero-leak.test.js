// The fault leak in the hero is a flow of droplets on a canvas. These tests pin the pure helpers and the wiring.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'SubsurfaceHero.jsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'colors_and_type.css'), 'utf8');
const MARK = '// ---- hero leak helpers';
const block = source.slice(source.indexOf(MARK), source.indexOf('// ---- end hero leak helpers'));
const H = new Function(`${block}
return { HERO_LEAK_PEAK_RATE, HERO_LEAK_MAX_DROPS, heroLeakRandom, heroLeakRate, heroLeakRiseEnd, heroLeakSpreadLength, heroLeakLook,
  heroLeakBuoyText, heroLeakLine, heroLeakScaleBar, heroLeakGauge, heroLeakFirstYears, heroLeakBandStops };`)();
const rng = H.heroLeakRandom;

test('the emission rate is 0 without flow and scales with flow, speed and migration speed', () => {
  assert.equal(H.heroLeakRate(0, 2, 60, 1), 0);
  assert.equal(H.heroLeakRate(1, 0, 60, 1), 0, 'no peak, no flow scale');
  assert.equal(H.heroLeakRate(2, 2, 60, 1), H.HERO_LEAK_PEAK_RATE, 'the peak flow at 60 years per second gives the peak rate');
  const base = H.heroLeakRate(1, 4, 30, 1);
  assert.ok(Math.abs(H.heroLeakRate(2, 4, 30, 1) - 2 * base) < 1e-12, 'twice the flow, twice the rate');
  assert.ok(Math.abs(H.heroLeakRate(1, 4, 30, 4) - 4 * base) < 1e-12, 'four times the speed, four times the rate');
  assert.ok(Math.abs(H.heroLeakRate(1, 4, 60, 1) - 2 * base) < 1e-12, 'twice the years per second, twice the rate');
});

test('the rise ends on the fault line at the roof height', () => {
  const from = [700, 400], to = [715, 300], riseY = 220;
  const end = H.heroLeakRiseEnd(from, to, riseY);
  assert.ok(Math.abs(end[1] - riseY) < 1e-9, 'the end is at the roof height');
  const cross = (end[0] - from[0]) * (to[1] - from[1]) - (end[1] - from[1]) * (to[0] - from[0]);
  assert.ok(Math.abs(cross) < 1e-6, 'the end lies on the line from -> to');
  assert.deepEqual(H.heroLeakRiseEnd(from, to, 320), to, 'a roof below the aquifer base adds no rise');
});

test('a droplet never spreads past the tip of the pool', () => {
  const random = rng(3);
  for (const reach of [0, 6, 20, 45, 120]) {
    for (let i = 0; i < 300; i++) {
      const length = H.heroLeakSpreadLength(reach, random());
      assert.ok(length <= Math.max(8, reach) + 4 + 1e-9, `reach ${reach}: ${length}`);
      assert.ok(length >= Math.min(12, Math.max(8, reach) + 4) - 1e-9);
    }
  }
});

test('each stage has its own position, radius and alpha, and a droplet joins the pool by shrinking and fading', () => {
  const g = { from: [100, 400], to: [110, 300], u: [0.0995, -0.995], n: [0.995, 0.0995], capLen: 100.5, roofAt: () => 200 };
  const p = { st: 0, t: 0.5, s0: [80, 405], side: 1, spreadLen: 30, riseEnd: [118, 220], phi: 1, phi2: 2, r: 1.5 };
  const gather = H.heroLeakLook({ ...p, st: 0 }, g), squeeze = H.heroLeakLook({ ...p, st: 1 }, g);
  const rise = H.heroLeakLook({ ...p, st: 2 }, g), early = H.heroLeakLook({ ...p, st: 3, t: 0.1 }, g), late = H.heroLeakLook({ ...p, st: 3, t: 0.95 }, g);
  assert.equal(gather.c, 'green');
  assert.ok(squeeze.y < 400 && squeeze.y > 300, 'the squeeze is in the damage zone');
  assert.ok(rise.y < 300 && rise.y > 220, 'the rise is above the caprock');
  assert.ok(squeeze.R < rise.R, 'the caprock droplet is the smallest');
  assert.ok(Math.abs(early.y - 201.6) < 0.5, 'the spread follows the roof');
  assert.ok(late.R < early.R && late.a < early.a, 'it shrinks and fades into the pool');
  assert.ok(gather.a < 0.76 && squeeze.a === 1);
});

test('the same seed gives the same droplets', () => {
  const a = rng(7), b = rng(7);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
  assert.notEqual(rng(7)(), rng(8)());
});

test('the card reads "< 0.1" for a buoyancy that rounds to 0 while the fault leaks', () => {
  assert.equal(H.heroLeakBuoyText(0), '< 0.1');
  assert.equal(H.heroLeakBuoyText(0.04), '< 0.1');
  assert.equal(H.heroLeakBuoyText(0.4), '0.4');
  assert.equal(H.heroLeakLine({ state: 'above', buoyancy: 0, overpressure: 2.1, entry: 1.9 }), 'Buoyancy < 0.1 bar + overpressure 2.1 bar > entry 1.9 bar');
  assert.equal(H.heroLeakLine({ state: 'above', buoyancy: 3.2, overpressure: 0, entry: 2.5 }), 'Buoyancy 3.2 bar > entry 2.5 bar');
  assert.equal(H.heroLeakLine({ state: 'held', buoyancy: 1, overpressure: 0, entry: 2.5 }), 'Buoyancy held at the 2.5 bar entry pressure');
  assert.equal(H.heroLeakLine({ state: 'held', buoyancy: 1, overpressure: 1, entry: 2.5 }), 'Buoyancy + overpressure held at the 2.5 bar entry pressure');
});

test('the push bar rounds its full scale up to a whole bar and places the parts as shares of it', () => {
  assert.equal(H.heroLeakScaleBar([0.2, 3.01, 2]), 4);
  assert.equal(H.heroLeakScaleBar([3]), 3);
  assert.equal(H.heroLeakScaleBar([]), 1);
  const gauge = H.heroLeakGauge({ buoyancy: 1, overpressure: 1, entry: 3 }, 4);
  assert.deepEqual(gauge, { buoyancy: 0.25, push: 0.5, entry: 0.75 });
});

test('the band under the scrubber follows the leak rate over the run', () => {
  const faults = 2, years = 100, peak = 4;
  const flow = new Float32Array((years + 1) * faults);
  for (let y = 45; y <= 80; y++) flow[y * faults + 1] = peak;
  for (let y = 60; y <= 80; y++) flow[y * faults] = 1;
  const first = H.heroLeakFirstYears(flow, faults, years);
  assert.deepEqual(first, [60, 45]);
  const stops = H.heroLeakBandStops(flow, faults, years, peak, 45);
  assert.equal(stops[0].at, 0);
  assert.equal(stops[0].alpha, 95, 'the peak flow is 95 %');
  assert.equal(stops[stops.length - 1].at, 100);
  assert.equal(stops[stops.length - 1].alpha, 0, 'transparent where nothing leaks');
  assert.ok(stops.every(s => s.alpha === 0 || (s.alpha >= 25 && s.alpha <= 95)));
  assert.ok(stops.every((s, i) => i === 0 || s.at > stops[i - 1].at), 'the stops rise in order');
  assert.deepEqual(H.heroLeakBandStops(new Float32Array(202), faults, years, peak, -1), [], 'no leak, no band');
  const weak = H.heroLeakBandStops(Float32Array.from({ length: 202 }, (v, i) => (i >= 100 && i < 140 ? 0.01 : 0)), faults, years, peak, 50);
  assert.ok(weak.some(s => s.alpha >= 25 && s.alpha < 50), 'a weak leak is a faint band');
});

test('the engine caps the live droplets per fault', () => {
  assert.equal(H.HERO_LEAK_MAX_DROPS, 140);
  assert.match(source, /f\.drops\.length < HERO_LEAK_MAX_DROPS/);
});

test('the loop runs only for a leak, and never under reduced motion; it reads refs', () => {
  const flow = source.slice(source.indexOf('const HeroLeakFlow = ('), source.indexOf('/* =====', source.indexOf('const HeroLeakFlow = (')));
  assert.match(flow, /const running = !reduced && leaking && heroShouldTick\(\{ playing, visible, hidden \}\)/);
  assert.match(flow, /const reduced = useMemo\(\(\) => siteReducedMotion\(\), \[\]\)/);
  assert.match(flow, /if \(!running\) return undefined;/, 'no frame is requested without a leak');
  assert.match(flow, /live\.current = \{ frame, yearRef/);
  assert.match(flow, /engineRef\.current\.tick\(live\.current, dt\)/);
  assert.match(flow, /if \(!running && engineRef\.current\) engineRef\.current\.paint\(live\.current\)/, 'one still frame when the loop is off');
  assert.match(flow, /Math\.min\(2, window\.devicePixelRatio/);
  assert.match(flow, /new ResizeObserver\(fit\)/);
  assert.match(source, /<HeroPlume frame=\{frame\} \/>\s*\{leakScale\.peak > 0 && <HeroLeakFlow/, 'the canvas follows the plume in the page');
  assert.match(source, /if \(mode === 'tick' && !f\.done && !L\.reduced\) f\.onset = 0/, 'reduced motion has no fill and no ring');
});

test('the engine moves droplets only while the year advances and clears only the boxes round the faults', () => {
  assert.match(source, /moving: dy > 1e-9/);
  assert.match(source, /jumped \? 'jump' : moving \? 'tick' : 'still'/);
  assert.match(source, /clearRect\(b\.x, b\.y, b\.w, b\.h\)/);
  assert.doesNotMatch(source, /clearRect\(0, 0/);
});

test('the old leak marks are gone', () => {
  assert.doesNotMatch(source, /hero-leak-dots|hero-leak-halo|data-layer="fault-leak"|leakScale\.dots/);
  assert.doesNotMatch(css, /\.hero-leak-dots|\.hero-leak-halo|\.hero-leak \{/);
  assert.match(source, /className="hero-contact hero-contact--leaked"/);
  assert.match(css, /\.hero-contact--leaked \{ stroke: var\(--sim-glow-leaked\); \}/);
});

test('the player names the leaking fault and shows the band', () => {
  assert.match(source, /, F\$\{leak\.fault \+ 1\} leaking/);
  assert.match(source, /hero-player__leak">  ?· F\{leak\.fault \+ 1\} leaking/);
  assert.match(source, /hero-player__leakband/);
  assert.match(css, /\.hero-player__leakband \{[^}]*height: 3px/);
  assert.match(css, /\.hero-player__leaktick \{[^}]*width: 2px/);
  assert.match(css, /\.hero-leak-readout \{ display: none; \}/, 'the card stays hidden on phones');
});

test('the loop draws at 30 fps at most', () => {
  assert.match(source, /HERO_LEAK_FRAME_MS = 30;/);
  assert.match(source, /if \(last && now - last < HERO_LEAK_FRAME_MS\) return;/);
  assert.match(source, /const dt = last \? Math\.min\(0\.1, \(now - last\) \/ 1000\) : 0;/, 'dt is the time since the last draw');
});

test('the canvas covers only the boxes of the faults that leak in this run', () => {
  const resize = source.slice(source.indexOf('resize(width, height, ratio, L) {'), source.indexOf('tick(L, dt) {'));
  assert.match(resize, /L\.firstYears\[i\] >= 0/);
  assert.match(resize, /canvas\.style\.left = /);
  assert.match(resize, /canvas\.style\.top = `calc\(var\(--hero-surface\) \+ \$\{y0\}px\)`/);
  assert.match(resize, /canvas\.width = Math\.max\(1, Math\.round\(cw \* ratio\)\)/);
  assert.match(source, /setTransform\(size\.sx, 0, 0, size\.sy, -size\.ox \* size\.sx, -size\.oy \* size\.sy\)/, 'the drawing moves by the box origin');
  assert.match(source, /sizes\.observe\(section\)/, 'the observer watches the section');
  assert.match(css, /\.hero-leak-flow \{ position: absolute; z-index: 2; pointer-events: none; \}/);
});

// The water band of the hero: the layout variables, the helpers, the layers and the motion rules.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const hero = read('SubsurfaceHero.jsx');
const water = read('HeroWater.jsx');
const css = read('colors_and_type.css');
const build = read('build.js');

const block = water.slice(water.indexOf('// ---- hero water helpers'), water.indexOf('// ---- end hero water helpers'));
const H = new Function(`${block}
return { HERO_SEA_DEPTH, heroWaterYToDepth, heroWaterFootprints, heroWaterLeakTop, heroWaterLabel, heroWaterLabelSide, heroWaterLegX };`)();

const rule = (selector, source = css) => {
  const at = source.indexOf(`${selector} {`);
  assert.ok(at >= 0, `${selector} exists`);
  return source.slice(at, source.indexOf('}', at));
};

test('the hero scene defines the waterline, the water band, the seabed and the depth', () => {
  const scene = rule('.hero-scene');
  assert.match(scene, /--hero-waterline: max\(42vh, 480px\);/);
  assert.match(scene, /--hero-water: clamp\(40px, 8vh, 80px\);/);
  assert.match(scene, /--hero-surface: calc\(var\(--hero-waterline\) \+ var\(--hero-water\)\);/);
  assert.match(scene, /--hero-depth: calc\(max\(100svh, 720px\) - var\(--hero-surface\)\);/);
});

test('the media rules set the waterline, and phones set a thinner band', () => {
  assert.match(css, /@media \(max-width: 860px\) \{[^@]*\.hero-scene \{ --hero-waterline: max\(42vh, 450px\); \}/);
  assert.match(css, /@media \(max-width: 600px\) \{[^@]*\.hero-scene \{ --hero-waterline: max\(42vh, 492px\); --hero-water: clamp\(32px, 5\.2vh, 48px\); \}/);
  assert.ok(!/--hero-surface: max\(/.test(css), 'no media rule sets the seabed directly');
});

test('the sky and the platform site end at the waterline', () => {
  assert.match(hero, /inset: '0 0 auto', height: 'var\(--hero-waterline\)'/);
  assert.match(rule('.hero-surface-site'), /bottom: calc\(100% - var\(--hero-waterline\)\);/);
});

test('the one-pixel strip of sea in the rock drawing is gone', () => {
  assert.ok(!/<rect width="1000" height="3"/.test(hero));
  assert.ok(!/Sea water above the seabed/.test(hero));
});

test('the sea depth is 76 m and the axis says seabed', () => {
  assert.match(water, /const HERO_SEA_DEPTH = 76; \/\/ m, GEBCO 2020 at 57\.5° N 2\.5° E/);
  assert.equal(H.HERO_SEA_DEPTH, 76);
  assert.match(hero, /\[\[0, 'seabed'\], \.\.\./);
  assert.match(hero, /from the sea surface down: 76 m of sea, the seabed, overburden/);
});

test('the depth mapping is the inverse of the section mapping', () => {
  assert.equal(H.heroWaterYToDepth(0), 0);
  assert.equal(H.heroWaterYToDepth(28), 800);
  assert.equal(H.heroWaterYToDepth(14), 400);
  assert.equal(H.heroWaterYToDepth(38), 830);
});

test('the label rounds to 10 m, stays within 32 characters and is null when nothing leaks', () => {
  const y = 28 + 2.4 / 3 * 3; // 807 m, which rounds to 810
  assert.equal(H.heroWaterLabel(true, 28 + 90 / 3 + 0.4), 'Leaked CO₂ 890 m below seabed');
  assert.equal(H.heroWaterLabel(true, y), 'Leaked CO₂ 810 m below seabed');
  assert.equal(H.heroWaterLabel(false, y), null);
  assert.equal(H.heroWaterLabel(true, null), null);
  assert.equal(H.heroWaterLabel(true, NaN), null);
  for (const top of [5, 28, 60, 200, 400]) {
    const text = H.heroWaterLabel(true, top);
    assert.ok(text.length <= 32, `${text} has ${text.length} characters`);
  }
});

test('the footprints come from the frame', () => {
  const cells = () => new Float32Array(201);
  const frame = { h: cells(), hMax: cells(), h2: cells(), h2Max: cells() };
  assert.deepEqual(H.heroWaterFootprints(frame), { storage: null, leaked: null });
  assert.deepEqual(H.heroWaterFootprints(null), { storage: null, leaked: null });
  frame.h[100] = 5; frame.hMax[120] = 5;
  frame.h2Max[40] = 2;
  const foot = H.heroWaterFootprints(frame);
  assert.deepEqual(foot.storage, [49.5, 60.5]);
  assert.deepEqual(foot.leaked, [19.5, 20.5]);
  frame.h2[0] = 1;
  assert.equal(H.heroWaterFootprints(frame).leaked[0], 0, 'the range stops at the left edge');
});

test('the top of the leaked CO2 is the shallowest roof under it', () => {
  const frame = { h2: new Float32Array(201), h2Max: new Float32Array(201) };
  const roof = Array.from({ length: 201 }, (_, k) => 40 - k * 0.1);
  assert.equal(H.heroWaterLeakTop(frame, roof), null);
  frame.h2[10] = 1; frame.h2Max[30] = 1;
  assert.equal(H.heroWaterLeakTop(frame, roof), 37);
  assert.equal(H.heroWaterLeakTop(null, roof), null);
});

test('the label goes to the other side of the fault when its first side hits the axis or the jacket', () => {
  const base = { labelPx: 220, wellPx: 1000, scale: 1.2, viewportPx: 1440 };
  assert.equal(H.heroWaterLabelSide({ ...base, faultPx: 700 }), 'left');
  assert.equal(H.heroWaterLabelSide({ ...base, faultPx: 200 }), 'right', 'the axis is on the left');
  assert.equal(H.heroWaterLabelSide({ ...base, faultPx: 1000 }), 'left', 'a fault at the well keeps the left side only if it is free');
  assert.equal(H.heroWaterLabelSide({ ...base, faultPx: 1150 }), 'right', 'the jacket blocks the left side');
});

test('the legs match the platform at the sea level and spread to the seabed', () => {
  assert.equal(H.heroWaterLegX([8, -5], 0), 8);
  assert.equal(H.heroWaterLegX([8, -5], 76), -5);
  assert.equal(H.heroWaterLegX([88, 101], 76), 101);
  assert.match(water, /front: \[\[8, -5\], \[88, 101\]\]/);
  assert.match(water, /back: \[\[24, 14\], \[98, 110\]\]/);
  assert.match(water, /\[4, 22, 44, 70, 88, 104\]/);
});

test('the layers have the contract z-indexes and no surface line', () => {
  const shared = rule('.hero-water__back,\r\n.hero-water__front,\r\n.hero-water__pipe'.replace(/\r\n/g, css.includes('\r\n') ? '\r\n' : '\n'));
  assert.match(shared, /position: absolute;/);
  assert.match(shared, /top: var\(--hero-waterline\);/);
  assert.match(shared, /height: var\(--hero-water\);/);
  assert.match(shared, /pointer-events: none;/);
  assert.match(css, /\.hero-water__back \{\s*z-index: 1;/);
  assert.match(css, /\.hero-water__front \{ z-index: 3;/);
  assert.ok(!/hero-water__live/.test(water), 'the live canvas belongs to another component');
  assert.match(water, /className="hero-water__back" aria-hidden="true"/);
  assert.match(water, /className="hero-water__front" aria-hidden="true"/);
});

test('the blink and the ping use opacity and transform only, and stop under reduced motion', () => {
  const frames = [...css.matchAll(/@keyframes (hero-water-[a-z]+) \{([\s\S]*?)\n?\}(?=\r?\n)/g)];
  const names = frames.map(f => f[1]);
  assert.deepEqual(names.sort(), ['hero-water-blink', 'hero-water-ping']);
  for (const [, name, body] of frames) {
    assert.ok(!/var\(/.test(body), `${name} has no var()`);
    assert.ok(!/(left|top|width|height|box-shadow|background)\s*:/.test(body), `${name} animates only transform and opacity`);
  }
  assert.ok(!/will-change/.test(rule('.hero-water__ping') + rule('.hero-water__light')));
  const reduce = css.slice(css.indexOf('.hero-water__ping { display: none; }') - 80);
  assert.match(reduce, /prefers-reduced-motion: reduce[\s\S]*\.hero-water__ping \{ display: none; \}[\s\S]*\.hero-water__light \{ animation: none !important/);
});

test('HeroWater.jsx is built before SubsurfaceHero.jsx and the hero renders it', () => {
  const a = build.indexOf("'HeroWater.jsx'"), b = build.indexOf("'SubsurfaceHero.jsx'");
  assert.ok(a > 0 && a < b);
  assert.match(hero, /<HeroWater geology=\{heroGeology\} faults=\{HERO_FAULTS\} frame=\{frame\} leak=\{leak\}/);
  assert.ok(!/requestAnimationFrame/.test(water), 'the band adds no animation loop');
});

test('the CO2 flow goes on down the conductor through the water, with the same phase and shut-in dim', () => {
  assert.match(hero, /<HeroWater [^>]*flow=\{flow\} dim=\{shut\.dim\}/);
  assert.match(water, /\{flow !== null && <HeroWaterPipe wellXPct=\{geology\.wellXPct\} flow=\{flow\} dim=\{dim\} \/>\}/);
  const pipe = water.slice(water.indexOf('const HeroWaterPipe'), water.indexOf('// The viewport width'));
  assert.match(pipe, /gradientTransform=\{`translate\(0 \$\{flow \|\| 0\}\)`\}/);
  assert.match(pipe, /style=\{heroShutStyle\(dim\)\}/);
  assert.match(pipe, /style=\{heroShutCore\(dim\)\}/);
  assert.match(pipe, /M48 0V\$\{HERO_SEA_DEPTH\}/);
  assert.match(css, /\.hero-water__pipe \{ z-index: 3; \}/);
});
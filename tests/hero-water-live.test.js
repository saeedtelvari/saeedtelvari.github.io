// The live water band in the hero: the pure helpers, the loop rules and the wiring.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const source = read('HeroWaterLive.jsx');
const build = read('build.js');
const css = read('colors_and_type.css');
const block = source.slice(source.indexOf('// ---- hero water helpers'), source.indexOf('// ---- end hero water helpers'));
const H = new Function(`${block}
return { HERO_WATER_FRAME_MS, HERO_WATER_MAX_SNOW, HERO_LIVE_LAMPS, heroLiveRandom, heroWaterWave, heroWaterOrbit, heroWaterSnowCount,
  heroWaterSnow, heroWaterDrift, heroWaterIsSummer, heroWaterSiteScale, heroWaterFish, heroWaterSchool };`)();
const near = (a, b, tolerance, msg) => assert.ok(Math.abs(a - b) <= tolerance, `${msg}: ${a} vs ${b}`);

test('the wavelength is the deep-water value g T^2 / 2 pi', () => {
  const wave = H.heroWaterWave(6.25, 1.88, 1);
  near(wave.length, 9.81 * 6.25 * 6.25 / (2 * Math.PI), 1e-9, 'length');
  near(wave.length, 61, 0.1, 'about 61 m at 6.25 s');
  near(wave.k, 2 * Math.PI / wave.length, 1e-12, 'k');
  near(wave.omega, 2 * Math.PI / 6.25, 1e-12, 'omega');
  assert.equal(H.heroWaterWave(1, 0.1, 0.1).lambda, 14, 'the wavelength on the screen is at least 14 px');
  assert.equal(H.heroWaterWave(6, 0.2, 0.9).amplitude, 0.5 > 0.1 * 0.9 ? 0.5 : 0, 'the amplitude is at least 0.5 px');
});

test('the orbit radius is 6 times the true size at the surface and falls with exp(-k z)', () => {
  const pxPerM = 72 / 76, wave = H.heroWaterWave(6.25, 1.88, pxPerM);
  near(H.heroWaterOrbit(1.88, pxPerM, wave.k, 0), 1.88 / 2 * pxPerM * 6, 1e-9, 'surface radius');
  const r10 = H.heroWaterOrbit(1.88, pxPerM, wave.k, 10), r20 = H.heroWaterOrbit(1.88, pxPerM, wave.k, 20);
  near(r20 / r10, Math.exp(-wave.k * 10), 1e-9, 'decay with depth');
  assert.ok(r10 < H.heroWaterOrbit(1.88, pxPerM, wave.k, 0) && r20 < r10, 'the radius falls with depth');
});

test('the particle count follows the width and has a cap of 160', () => {
  assert.equal(H.heroWaterSnowCount(390), 43);
  assert.equal(H.heroWaterSnowCount(900), 100);
  assert.equal(H.heroWaterSnowCount(1440), 160);
  assert.equal(H.heroWaterSnowCount(5000), 160);
  assert.equal(H.HERO_WATER_MAX_SNOW, 160);
});

test('the specks are seeded and inside the stated ranges', () => {
  const a = H.heroWaterSnow(160, false), b = H.heroWaterSnow(160, false);
  assert.deepEqual(a, b, 'the same seed gives the same specks');
  for (const s of a) {
    assert.ok(s.z >= 0 && s.z < 76);
    assert.ok(s.radius >= 0.6 && s.radius <= 1.4);
    assert.ok(s.alpha >= 0.16 && s.alpha <= 0.46);
    assert.ok(s.sink >= 0.1 && s.sink <= 0.3);
  }
  for (const s of H.heroWaterSnow(40, true)) assert.ok(s.radius >= 0.6 * 0.62 - 1e-9 && s.radius <= 1.4 * 0.62 + 1e-9, 'phone size');
  assert.doesNotMatch(source, /Math\.random/);
});

test('the drift follows the east part of the current', () => {
  near(H.heroWaterDrift(0.6, 90, false), 7, 1e-9, 'east at 0.6 km/h on desktop');
  near(H.heroWaterDrift(0.6, 90, true), 3, 1e-9, 'east at 0.6 km/h on a phone');
  near(H.heroWaterDrift(0.6, 270, false), -7, 1e-9, 'west');
  near(H.heroWaterDrift(0.6, 0, false), 0, 1e-9, 'north gives no sideways drift');
  assert.ok(H.heroWaterDrift(0.6, 214, false) < 0, '214 degrees goes towards the west');
  assert.equal(H.heroWaterDrift(null, 214, false), 0);
  assert.match(source, /towards/);
});

test('the warm layer shows from June to September only', () => {
  const months = [...Array(12).keys()].filter(H.heroWaterIsSummer);
  assert.deepEqual(months, [5, 6, 7, 8]);
});

test('the fish: 28 on desktop, 16 on phones, 15 to 30 m and a circle of 70 px or 43 px', () => {
  assert.equal(H.heroWaterFish(false).length, 28);
  assert.equal(H.heroWaterFish(true).length, 16);
  for (const f of H.heroWaterFish(false)) assert.ok(f.length >= 4 && f.length <= 6.5);
  for (let t = 0; t < 60; t += 0.5) {
    const s = H.heroWaterSchool(t, 1000, false);
    assert.ok(s.z - 5.5 >= 15 - 1 && s.z + 5.5 <= 30 + 1, 'depth range');
    near(Math.abs(s.x - 1000), 70 * Math.abs(Math.cos(2 * Math.PI / 28 * t)), 1e-9, 'radius');
  }
  near(H.heroWaterSchool(0, 500, true).x, 543, 1e-9, 'phone radius 43 px');
  assert.deepEqual([...H.HERO_LIVE_LAMPS], [4, 22, 44, 70, 88, 104]);
});

test('the site scale follows the hero site width', () => {
  near(H.heroWaterSiteScale(1440, false), 648 / 540, 1e-9, 'desktop cap');
  near(H.heroWaterSiteScale(1000, false), 504 / 540, 1e-9, 'desktop 50.4vw');
  near(H.heroWaterSiteScale(390, true), 0.62 * 390 / 540, 1e-9, 'phone 62vw');
});

test('the loop runs at 30 fps at most, only while the hero is in view and the tab is visible', () => {
  assert.equal(H.HERO_WATER_FRAME_MS, 30);
  assert.match(source, /now - last < HERO_WATER_FRAME_MS\) return/);
  assert.match(source, /heroShouldTick\(\{ playing: true, visible, hidden \}\)/);
  assert.match(source, /if \(!running\) return undefined;/);
  assert.match(source, /return \(\) => cancelAnimationFrame\(frameId\)/);
  assert.match(source, /Math\.min\(2, window\.devicePixelRatio \|\| 1\)/);
  assert.match(source, /new ResizeObserver\(fit\)/);
  assert.match(source, /ctx\.clearRect\(0, 0, width, height\)/);
});

test('reduced motion has no loop and draws one still frame, again on resize', () => {
  assert.match(source, /const running = !reduced && heroShouldTick/);
  assert.match(source, /HERO_WATER_STILL_TIME/);
  // The resize handler paints at once, so a resize redraws the still frame.
  assert.match(source, /engine\.resize\(width, height, [^;]*;\s*engine\.paint\(/);
  // The still frame also draws when the loop is off.
  assert.match(source, /if \(!running && engineRef\.current\) engineRef\.current\.paint/);
});

test('the canvas draws no text and uses no will-change', () => {
  assert.doesNotMatch(source, /fillText|strokeText|measureText|toLocaleString/);
  assert.doesNotMatch(css, /\.hero-water__live[^}]*will-change/);
  assert.match(source, /aria-hidden="true"/);
});

test('the canvas has the layer contract in the CSS', () => {
  const rule = css.match(/\.hero-water__live \{[^}]*\}/)[0];
  assert.match(rule, /top: var\(--hero-waterline, var\(--hero-surface\)\)/);
  assert.match(rule, /height: var\(--hero-water, 72px\)/);
  assert.match(rule, /z-index: 2/);
  assert.match(rule, /pointer-events: none/);
});

test('build.js lists HeroWaterLive.jsx before SubsurfaceHero.jsx, and the hero mounts it', () => {
  assert.ok(build.indexOf("'HeroWaterLive.jsx'") > 0);
  assert.ok(build.indexOf("'HeroWaterLive.jsx'") < build.indexOf("'SubsurfaceHero.jsx'"));
  assert.match(read('SubsurfaceHero.jsx'), /<HeroWaterLive weather=\{scene\} wellXPct=\{heroGeology\.wellXPct\} visible=\{visible\} hidden=\{hidden\} \/>/);
});

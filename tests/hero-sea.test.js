const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const sea = read('HeroSea.jsx');
const css = read('colors_and_type.css');

test('build.js lists HeroSea.jsx before SubsurfaceHero.jsx', () => {
  const build = read('build.js');
  const sea = build.indexOf("'HeroSea.jsx'");
  assert.ok(sea > 0 && sea < build.indexOf("'SubsurfaceHero.jsx'"));
});

test('the shader has no lamp loop: the platform draws the lamp reflections', () => {
  assert.ok(!/uLights/.test(sea), 'no uLights');
  assert.match(sea, /OES_standard_derivatives/);
});

test('the sea loop is capped and stops when it is not seen', () => {
  assert.match(sea, /HERO_SEA_FRAME_MS = 1000 \/ 30/);
  assert.match(sea, /HERO_SEA_DPR_CAP = 2/);
  assert.match(sea, /new IntersectionObserver/);
  assert.match(sea, /document\.hidden/);
  assert.match(sea, /prefers-reduced-motion: reduce/);
  assert.match(sea, /new ResizeObserver/);
  assert.match(sea, /webglcontextlost/);
  assert.match(sea, /loseContext/);
});

test('the SVG fallback exists and both sea outputs are hidden from screen readers', () => {
  assert.match(sea, /HeroSeaSvg/);
  assert.match(sea, /setMode\('svg'\)/);
  assert.match(sea, /<canvas[^>]*aria-hidden="true"/);
  assert.match(sea, /className="hero-sea" data-sea=\{mode\} aria-hidden="true"/);
});

test('the sea strip and the horizon use --hero-sea-h', () => {
  assert.match(css, /--hero-sea-h: clamp\(56px, 9\.8vh, 104px\)/);
  assert.match(css, /@media \(max-width: 860px\) \{[^@]*--hero-sea-h: 52px/);
  assert.match(css, /\.hero-sea \{[^}]*height: var\(--hero-sea-h\)/);
  assert.match(css, /\.hero-horizon \{[^}]*bottom: var\(--hero-sea-h\)/);
});

test('the moon sits at 95.5 percent and the beacons blink together', () => {
  assert.match(css, /left: calc\(95\.5% - var\(--moon-size\) \/ 2\)/);
  assert.match(css, /\.hero-beacon \{[^}]*animation: hero-beacon 2s steps\(1\) infinite/);
});

test('the default weather exists and reaches the uniforms', () => {
  const start = sea.indexOf('const HERO_WEATHER_DEFAULT');
  const end = sea.indexOf('// The shader.');
  const apply = sea.slice(sea.indexOf('const heroSeaApplyWeather'), sea.indexOf('// The centre of the moon'));
  const context = {};
  vm.runInNewContext(sea.slice(start, end) + '\nthis.weather = HERO_WEATHER_DEFAULT;\n' + apply + '\nthis.apply = heroSeaApplyWeather;', context);
  assert.deepEqual({ ...context.weather }, { wind: 6, cloud: 0.35, fog: 0, moon: 1 });
  const sent = {};
  const gl = { uniform1f: (name, value) => { sent[name] = value; } };
  context.apply(gl, { uWind: 'wind', uMoon: 'moon', uFog: 'fog' }, context.weather);
  assert.deepEqual(sent, { wind: 6, moon: 1, fog: 0 });
  assert.match(sea, /HeroSea = \(\{ weather = HERO_WEATHER_DEFAULT \}\)/);
});

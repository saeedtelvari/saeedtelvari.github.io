const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const hero = read('SubsurfaceHero.jsx');
const sea = read('HeroSea.jsx');
const css = read('colors_and_type.css');

// Take one top-level const from a source text and run it in a clean context.
const grab = (source, name, context = {}) => {
  const start = source.indexOf(`const ${name} =`);
  assert.ok(start >= 0, `${name} exists`);
  const end = start + source.slice(start).search(/\r?\n\r?\n/);
  vm.runInNewContext(`${source.slice(start, end)}\nthis.out = ${name};`, context);
  return context.out;
};

test('the far ship stands outside the main platform band and the other horizon features', () => {
  const left = grab(hero, 'HERO_FAR_SHIP_LEFT');
  assert.ok(left < 68 - 4 || left > 72 + 4, 'outside 68 to 72 percent');
  assert.ok(left < 43 || left > 57, 'outside the wind farm band');
  assert.ok(Math.abs(left - 33) > 3, 'clear of the far platform');
  assert.match(hero, /left: `\$\{HERO_FAR_SHIP_LEFT\}%`/);
  assert.ok(!/left: '72%'/.test(hero));
});

test('the far platform glow is a soft gradient that fits the box', () => {
  const at = hero.indexOf('id="far-platform-glow"');
  const block = hero.slice(at - 40, at + 400);
  assert.match(block, /radialGradient/);
  assert.match(block, /stopColor="#e3c286"/);
  assert.match(block, /offset="1" stopColor="#e3c286" stopOpacity="0"/);
  const ellipse = hero.match(/<ellipse cx="(\d+)" cy="(\d+)" rx="(\d+)" ry="(\d+)" fill="url\(#far-platform-glow\)"/);
  assert.ok(ellipse, 'the glow ellipse uses the gradient');
  const [cx, cy, rx, ry] = ellipse.slice(1).map(Number);
  assert.ok(cx - rx >= 0 && cx + rx <= 34 && cy - ry >= 0 && cy + ry <= 20, 'the glow is inside the 34 x 20 box');
});

test('the rotor period follows the wind and the rotors stand still below 1 m/s', () => {
  const period = grab(hero, 'heroTurbinePeriod');
  assert.equal(period(0), 0);
  assert.equal(period(0.99), 0);
  assert.equal(period(NaN), 0);
  assert.equal(period(1), 14, 'upper clamp');
  assert.equal(period(2), 14);
  assert.equal(period(6), 8);
  assert.equal(period(12), 4);
  assert.equal(period(30), 2.5, 'lower clamp');
});

test('the rotors are HTML boxes that turn with a CSS transform and keep their start angles', () => {
  assert.match(hero, /className="hero-rotor"/);
  assert.match(css, /\.hero-rotor \{[^}]*animation: hero-rotor-turn var\(--turbine-period/);
  assert.match(css, /@keyframes hero-rotor-turn \{ to \{ transform: rotate\(360deg\); \} \}/);
  assert.match(css, /\.hero-farm--calm \.hero-rotor \{ animation: none/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{\s*\.hero-rotor \{ animation: none !important/);
  assert.match(hero, /\[14, 26, 0\], \[44, 24, 40\], \[72, 22, 75\], \[98, 20, 20\], \[122, 18, 95\], \[144, 17, 55\], \[164, 15, 10\], \[182, 14, 80\]/);
  assert.match(css, /\.hero-scene\[data-visible="false"\] \*/);
});

test('the rain slant follows the wind and each drop falls along its own axis', () => {
  const slant = grab(hero, 'heroRainSlant');
  assert.equal(slant(0), 6);
  assert.equal(slant(2), 6);
  assert.equal(slant(6), 9.4);
  assert.equal(slant(10), 13);
  assert.equal(slant(40), 18);
  assert.match(hero, /'--rain-slant'/);
  assert.match(css, /@keyframes rainFall \{\s*from \{ transform: rotate\(var\(--rain-slant, 9deg\)\) translateY\(-6%\); \}\s*to \{ transform: rotate\(var\(--rain-slant, 9deg\)\) translateY\(100%\); \}/);
  assert.ok(!/rotate\(9deg\)/.test(css));
});

test('the sea light follows the moon and the rain and stays between 0.4 and 1', () => {
  const light = grab(sea, 'heroSeaLight');
  assert.equal(light({ moon: 1, rain: 0 }), 1, 'a clear night with a full moon is unchanged');
  assert.equal(light({ moon: 0, rain: 0 }), 0.5);
  assert.ok(Math.abs(light({ moon: 0, rain: 1 }) - 0.4) < 1e-9, 'a rainy new moon night is dim');
  assert.equal(light({ moon: 0, rain: 3 }), 0.4);
  assert.equal(light({ moon: 1, rain: 1 }), 0.85);
});

test('the shader and the SVG fallback read the sea light', () => {
  assert.match(sea, /uniform float uLight/);
  assert.match(sea, /\* \(0\.7 \+ 0\.3 \* wind\) \* uLight/);
  assert.match(sea, /band \* \(1\.0 - 0\.6 \* v\) \* uLight/);
  assert.match(sea, /'uLight'\]/);
  assert.match(sea, /light: heroSeaLight\(now\)/);
  assert.match(sea, /gl\.uniform1f\(uniforms\.uLight/);
  assert.match(sea, /const light = heroSeaLight\(weather\)/);
  assert.match(sea, /\* light\)/);
  // The moon path still follows uMoon only.
  assert.match(sea, /exp\(-pow\(\(X - uMoonX \* cssW\) \/ mw, 2\.0\)\) \* uMoon/);
});

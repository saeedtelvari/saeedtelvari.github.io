const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const block = (css, selector) => {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `missing ${selector}`);
  return css.slice(start, css.indexOf('}', start));
};
const tokens = text => Object.fromEntries([...text.matchAll(/(--sim-[a-z0-9-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));

const page = read('SimulatorPage.jsx');
const prelude = page.slice(0, page.indexOf('// ---------------------------------------------------------------- hooks'));
const context = { React: {}, VE2D: require('../ve2d-model.js'), URLSearchParams };
vm.runInNewContext(`${prelude}
this.helpers = { simStoredPalette, SIM_PALETTES };`, context);
const h = context.helpers;

const css = read('simulator-workbench.css');
const night = block(css, '.ve-standalone[data-palette="north-sea"]');
const day = block(css, '.ve-standalone[data-palette="north-sea"][data-theme="day"]');
const earthNight = block(css, '.ve-standalone');
const earthDay = block(css, '.ve-standalone[data-theme="day"]');

test('North Sea is the first palette and the default', () => {
  assert.equal(h.SIM_PALETTES[0].id, 'north-sea');
  assert.equal(h.SIM_PALETTES[0].label, 'North Sea night');
  assert.equal(h.simStoredPalette(null), 'north-sea');
  assert.equal(h.simStoredPalette({ getItem: () => 'nope' }), 'north-sea');
  assert.equal(h.simStoredPalette({ getItem: () => 'earth' }), 'earth');
  assert.equal(h.simStoredPalette({ getItem() { throw new Error('blocked'); } }), 'north-sea');
});

test('North Sea night and day define the full token set', () => {
  const keys = Object.keys(tokens(earthNight)).filter(k => !/font|ease/.test(k));
  for (const [name, text] of [['night', night], ['day', day]]) {
    const own = tokens(text);
    for (const key of keys) assert.ok(own[key] !== undefined, `${name} ${key}`);
  }
});

test('North Sea night matches the homepage tokens', () => {
  const site = tokens(block(read('colors_and_type.css'), 'html.site-ns'));
  const own = tokens(night);
  assert.equal(own['--sim-bg'], site['--sim-bg']);
  for (const key of Object.keys(site).filter(k => k.startsWith('--sim-'))) assert.equal(own[key], site[key], key);
});

test('North Sea keeps the Earth data colours', () => {
  for (const [a, b] of [[night, earthNight], [day, earthDay]]) {
    const own = tokens(a);
    const earth = tokens(b);
    for (const key of Object.keys(earth).filter(k => /^--sim-(c|glow)-/.test(k))) assert.equal(own[key], earth[key], key);
  }
  assert.equal(tokens(night)['--sim-focus'], tokens(earthNight)['--sim-focus']);
});

test('North Sea text meets 4.5:1 contrast on its surfaces', () => {
  const lum = hex => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for (const text of [night, day]) {
    const t = tokens(text);
    for (const ink of ['--sim-ink', '--sim-ink-muted', '--sim-ink-faint']) {
      for (const surface of ['--sim-bg', '--sim-surface', '--sim-surface-2']) {
        assert.ok(ratio(t[ink], t[surface]) >= 4.5, `${ink} on ${surface}: ${ratio(t[ink], t[surface]).toFixed(2)}`);
      }
    }
  }
});

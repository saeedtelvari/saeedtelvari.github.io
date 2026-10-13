const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const block = (css, selector) => { const s = css.indexOf(`${selector} {`); assert.ok(s >= 0, selector); return css.slice(s, css.indexOf('}', s)); };
const tokens = text => Object.fromEntries([...text.matchAll(/(--sim-[a-z0-9-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));

test('homepage tokens are the simulator Earth night tokens', () => {
  const site = tokens(block(read('colors_and_type.css'), ':root'));
  const sim = tokens(block(read('simulator-workbench.css'), '.ve-standalone'));
  const shared = Object.keys(sim).filter(k => !/font|ease/.test(k));
  assert.ok(shared.length >= 35, 'the simulator block was parsed');
  for (const key of shared) assert.equal(site[key], sim[key], key);
});

test('no mint, teal, aubergine, indigo or lilac in homepage sources', () => {
  const banned = /#64ffda|#4ecdc4|#0dfca2|#7ee8e2|#a8edea|#20c997|#1a8e8f|#211d34|#1c2645|#1d416e|#2b2336|#c4b5fd|rgba\(100,\s*255,\s*218|rgba\(78,\s*205,\s*196|rgba\(13,\s*252,\s*162/i;
  for (const file of ['index.html', 'cv.html', 'colors_and_type.css', 'App.jsx', 'Header.jsx', 'Footer.jsx', 'Primitives.jsx',
    'SubsurfaceHero.jsx', 'GeologicalDescent.jsx', 'HomeSections.jsx', 'CVPage.jsx', 'site-content.js']) {
    if (!fs.existsSync(path.join(root, file))) continue;
    assert.ok(!banned.test(read(file)), `${file} uses a retired chrome colour`);
  }
});

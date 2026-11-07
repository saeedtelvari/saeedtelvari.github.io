// "North Sea night" is the look of the homepage and the CV: cool blue-grey tokens that continue the hero sky and sea.
// The class site-ns on <html> sets them. The simulator and the story page do not have the class, so they do not change.
// tests/site-style.test.js keeps the simulator rules byte-identical with a hash guard.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sheet = read('colors_and_type.css');
// The stylesheet is flat, so a regex finds every innermost rule, also the rules inside @media blocks.
const rules = [...sheet.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(match => ({ selector: match[1].replace(/\s+/g, ' ').trim(), body: match[2].replace(/\s+/g, ' ').trim() }));
const parts = rule => rule.selector.split(',').map(item => item.trim());

const WARM = /#(?:120e0b|1a1511|221c17|2c241d|352b23|4a3c30|f4ede3|bcae9c|8d7f6e|5e4c3c|1d150f|1d1712|17120e)\b|rgba\(\s*(?:18\s*,\s*14\s*,\s*11|244\s*,\s*237\s*,\s*227|26\s*,\s*21\s*,\s*17|34\s*,\s*28\s*,\s*23|8\s*,\s*6\s*,\s*4)\b/i;
const NORTH_SEA = {
  '--sim-bg': '#0f1722', '--sim-surface': '#16212f', '--sim-surface-2': '#1c2a3b', '--sim-rule': '#26354a',
  '--sim-rule-strong': '#34475f', '--sim-ink': '#e8edf2', '--sim-ink-muted': '#9fb0c0', '--sim-ink-faint': '#8396a9',
};
const channels = hex => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
};
const luminance = hex => channels(hex).map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; })
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

test('the class site-ns is on the homepage and the CV only, and it sets the North Sea tokens', () => {
  for (const page of ['index.html', 'cv.html']) assert.match(read(page), /<html lang="en" class="site-ns">/, page);
  for (const page of ['simulator.html', 've-story.html']) assert.doesNotMatch(read(page), /site-ns/, `${page} does not have the class`);
  assert.doesNotMatch(read('simulator-workbench.css') + read('story.css'), /site-ns/, 'the simulator and story styles do not know the class');
  const night = rules.find(rule => rule.selector === 'html.site-ns');
  assert.ok(night, 'the token rule is there');
  const value = name => (night.body.match(new RegExp(`${name}:\\s*([^;]+);`)) || [])[1];
  for (const [name, hex] of Object.entries(NORTH_SEA)) assert.equal(value(name), hex, name);
  assert.match(night.body, /--sim-surface-3: #[0-9a-f]{6}/);
  // The accent stays amber and the CO2 data colours stay as the :root block has them, because the class does not set them.
  assert.doesNotMatch(night.body, /--sim-accent|--sim-focus|--sim-c-|--sim-glow-|--sim-danger|--sim-warning/);
  // Text must pass AA (4.5:1) on the page ground and on the panels.
  for (const ink of ['--sim-ink', '--sim-ink-muted', '--sim-ink-faint']) {
    for (const ground of ['--sim-bg', '--sim-surface', '--sim-surface-2']) {
      assert.ok(contrast(NORTH_SEA[ink], NORTH_SEA[ground]) >= 4.5, `${ink} on ${ground}`);
    }
  }
  assert.ok(contrast('#e8a15a', NORTH_SEA['--sim-surface']) >= 4.5, 'the amber link on a panel');
});

test('no warm or brown literal applies to the homepage or the CV outside the simulator rules', () => {
  const rootRule = rules.find(rule => rule.selector === ':root');
  // The :root block is the simulator copy. These rules serve the simulator too, so each one has a cool .site-ns rule.
  const shared = ['code', 'kbd', '.mono', '.app-header__menu', '.app-drawer__backdrop'];
  const sharedSelectors = new Set(['code, kbd, .mono', '.app-header__menu, .app-drawer__close', '.app-drawer__backdrop']);
  for (const rule of rules) {
    if (!WARM.test(rule.body)) continue;
    assert.ok(rule === rootRule || sharedSelectors.has(rule.selector), `${rule.selector} holds a warm literal`);
  }
  const cool = rules.filter(rule => parts(rule).every(item => item.startsWith('.site-ns ')) && !WARM.test(rule.body));
  for (const name of shared) {
    assert.ok(cool.some(rule => parts(rule).includes(`.site-ns ${name}`)), `${name} has a cool .site-ns rule`);
  }
  // Every warm token of :root has a cool value in html.site-ns.
  const night = rules.find(rule => rule.selector === 'html.site-ns');
  const names = [...rootRule.body.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)]
    .filter(match => WARM.test(match[2]) || /^--sim-(depth|rock|stage|contour)/.test(match[1])).map(match => match[1]);
  assert.ok(names.length >= 18, 'the warm tokens were found');
  for (const name of names) assert.match(night.body, new RegExp(`${name}:`), `${name} is set again for the North Sea`);
  assert.doesNotMatch(night.body, WARM, 'the North Sea tokens have no warm value');
  for (const file of ['index.html', 'cv.html', 'App.jsx', 'Header.jsx', 'Footer.jsx', 'Primitives.jsx', 'SubsurfaceHero.jsx', 'GeologicalDescent.jsx', 'HomeSections.jsx', 'CVPage.jsx']) {
    assert.doesNotMatch(read(file), WARM, `${file} has a warm literal`);
  }
});

test('the rock behind the sections has a blue cast: b is at least r for every colour, and the photos are cooled', () => {
  const source = read('GeologicalDescent.jsx');
  const colours = [...source.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)].map(match => match[0]);
  assert.ok(colours.length >= 20, 'the descent colours were found');
  for (const colour of colours) {
    const [r, , b] = channels(colour);
    assert.ok(b >= r, `${colour} has a warm cast`);
  }
  assert.match(source, /<filter id="descent-cool"[\s\S]*?feColorMatrix/, 'a filter cools the photos');
  assert.match(source, /<image filter="url\(#descent-cool\)"/, 'every rock photo goes through the filter');
  // The hero and the descent meet in one cool colour.
  const hero = read('SubsurfaceHero.jsx').match(/id="hero-descent-bridge"[\s\S]*?<stop stopColor="(#[0-9a-f]{6})"/)[1];
  assert.equal(hero, source.match(/id="descent-bridge"[\s\S]*?<stop stopColor="(#[0-9a-f]{6})"/)[1]);
  const [r, , b] = channels(hero);
  assert.ok(b > r, 'the joint colour is cool');
});

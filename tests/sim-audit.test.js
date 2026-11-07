const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('SimulatorPage.jsx');

test('the Inputs button has a name when its label is hidden', () => {
  assert.match(page, /className="sim-button sim-inputs-trigger".*aria-label="Inputs"/);
});

test('the Share button name contains its visible word and the result is announced', () => {
  assert.match(page, /'Share: copy a link to this scenario'/);
  assert.match(page, /className="sim-sr-only" role="status" aria-live="polite">\{shareNotice\}/);
});

test('the speed button shows the real rate in years per second', () => {
  assert.match(page, /\{SIM_SPEEDS\[speed\]\} yr\/s<\/button>/);
  assert.match(page, /Playback speed: \$\{SIM_SPEEDS\[speed\]\} yr\/s/);
  assert.doesNotMatch(page, /\{speed \+ 1\}×/);
});

test('simulator.html loads no Font Awesome, no eager KaTeX and no unused font', () => {
  const html = read('simulator.html');
  assert.doesNotMatch(html, /font-awesome/i);
  assert.doesNotMatch(html, /katex/i);
  assert.doesNotMatch(html, /Arizonia/);
  assert.doesNotMatch(html, /cdnjs\.cloudflare\.com/);
});

test('KaTeX loads on demand when the Method tab mounts', () => {
  const guide = read('GuidePage.jsx');
  assert.match(guide, /KaTeX\/0\.16\.9\/katex\.min/);
  assert.match(guide, /useEffect\(\(\) => \{ simLoadKatex\(\); \}, \[\]\)/);
});

test('no Font Awesome class remains in the simulator sources', () => {
  for (const file of ['SimulatorPage.jsx', 'SimViews.jsx', 'SimCharts.jsx', 'GuidePage.jsx']) {
    assert.doesNotMatch(read(file), /\bfas? fa-|className="fas|fa-[a-z]+-?[a-z]*"/, file);
  }
  const icons = read('Primitives.jsx');
  const used = new Set([...(page + read('SimViews.jsx')).matchAll(/<Icon name=\{?["']([a-z-]+)["']/g)].map(m => m[1]));
  for (const name of ['sliders', 'shuffle', 'plus', 'palette', 'link', 'gauge-high', 'forward-step', 'backward-step', 'download',
    'circle-half-stroke', 'circle-check', 'triangle-exclamation', 'arrow-right-from-bracket', 'layer-group', 'close', 'copy']) {
    assert.ok(icons.includes(`'${name}'`) || icons.includes(`  ${name}:`), `icon ${name} is defined`);
  }
  for (const name of used) assert.ok(icons.includes(`'${name}'`) || icons.includes(`  ${name}:`), `icon ${name} is defined`);
});

test('the outcomes rail ends with the trust line and a citation button', () => {
  assert.match(page, /Educational VE model of a saline aquifer\. Mass balance and four benchmark checks: see/);
  assert.match(page, /className="sim-linkbutton" onClick=\{onMethod\}>Method<\/button>/);
  assert.match(page, /Cite this run/);
  assert.match(page, /document\.getElementById\('m-verification'\)/);
  assert.match(read('GuidePage.jsx'), /<h2 id="m-verification"/);
});

test('the citation text names the author, the page address and the access date', () => {
  const start = page.indexOf('const simCitation');
  const end = page.indexOf('const simDownload');
  const cite = new Function(`${page.slice(start, end)}; return simCitation;`)();
  const text = cite('https://saeedtelvari.github.io/simulator.html?preset=default', new Date('2026-11-07T10:00:00Z'));
  assert.equal(text, 'Telvari, S. (2026). VE simulator [web application]. https://saeedtelvari.github.io/simulator.html?preset=default. Accessed 2026-11-07.');
});

test('the references link to their DOIs', () => {
  // The DOIs sit in one list, in the same order as the shared references. The Method tab links each one.
  const guide = read('GuidePage.jsx');
  const list = guide.slice(guide.indexOf('const SIM_REFERENCE_DOIS'), guide.indexOf('// end of shared text'));
  const dois = list.match(/'10\.[^']+'/g) || [];
  assert.equal(dois.length, 14);
  assert.equal(new Set(dois).size, 14);
  const refs = guide.slice(guide.indexOf('const SIM_REFERENCES'), guide.indexOf('const simEmphasis'));
  assert.equal((refs.match(/^\s+"/mg) || []).length, 14, 'one DOI for each reference');
  assert.match(guide, /href=\{`https:\/\/doi\.org\/\$\{SIM_REFERENCE_DOIS\[i\]\}`\}/);
});

test('chart and map labels carry their units', () => {
  const charts = read('SimCharts.jsx');
  assert.doesNotMatch(charts, /<text x=\{4\} y=\{m\.top \+ 4\}>Mt<\/text>/);
  assert.match(charts, /sim-chart__unit/);
  const views = read('SimViews.jsx');
  assert.match(views, /\$\{contour\.level\} m/);
  assert.match(views, /ctx\.fillText\('km', layout\.ox - 6, layout\.oy - 8\)/);
  assert.match(views, /Contours of depth to aquifer top/);
  assert.match(views, /sim-legend__ramp/);
});

test('field hints use the muted ink', () => {
  const css = read('simulator-workbench.css');
  assert.match(css, /\.sim-field__hint \{ color: var\(--sim-ink-muted\); \}/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('the guide has the three card texts and the goal', () => {
  const source = read('SimFirstRun.jsx');
  assert.match(source, /This map shows CO₂ seen from above, in a saline aquifer\./);
  assert.match(source, /Teal is CO₂ that can move/);
  assert.match(source, /are trapped CO₂/);
  assert.match(source, /Drag the well \(INJ-1\) on the map, or change an input\. The model runs again in your browser\./);
  assert.match(source, /Watch the fault \(F1\)\. CO₂ leaks when the column under the fault passes the fault’s seal capacity\./);
  assert.match(source, /Try this:/);
  assert.match(source, /Move the well so that nothing leaks in 1,000 years\./);
  assert.match(source, /Skip/);
  assert.match(source, /'Done' : 'Next'/);
});

test('the storage key is read inside try and catch', () => {
  const source = read('SimFirstRun.jsx');
  assert.match(source, /ve-simulator-guide-seen/);
  assert.match(source, /try \{\s*return window\.localStorage\.getItem\(SIM_GUIDE_KEY\)[^]*?\} catch/);
  assert.match(source, /try \{\s*window\.localStorage\.setItem\(SIM_GUIDE_KEY[^]*?\} catch/);
});

test('the default scenario leaks, so the goal asks for no leakage', () => {
  const VE2D = require('../ve2d-model.js');
  const scenario = VE2D.normalizeScenario(VE2D.DEFAULTS);
  const last = VE2D.run(scenario, { keepSnapshots: false }).history.at(-1);
  assert.ok(last.leaked > 0, 'the default scenario leaks CO2');
  assert.equal(scenario.years, 1000);
});

test('build.js lists SimFirstRun.jsx before SimulatorPage.jsx', () => {
  const build = read('build.js');
  const first = build.indexOf("'SimFirstRun.jsx'");
  const page = build.indexOf("'SimulatorPage.jsx'");
  assert.ok(first > 0 && page > first);
});

test('the dialog is labelled, not modal, and closes on Escape', () => {
  const source = read('SimFirstRun.jsx');
  assert.match(source, /role="dialog" aria-modal="false" aria-labelledby="sim-guide-title"/);
  assert.match(source, /onKeyDown=\{event => \{ if \(event\.key === 'Escape'\) close\(\); \}\}/);
});

test('the automatic open does not move focus; only the Guide button does', () => {
  const source = read('SimFirstRun.jsx');
  assert.match(source, /if \(byButton && nextRef\.current\) nextRef\.current\.focus/);
  assert.match(source, /if \(byButton\) \{\s*const button = document\.getElementById\('sim-guide-button'\)/);
  assert.doesNotMatch(source, /document\.addEventListener\('keydown'/);
});

test('the Guide button has a name and the page mounts the guide', () => {
  const page = read('SimulatorPage.jsx');
  assert.match(page, /id="sim-guide-button"[^\n]*>Guide<\/button>/);
  assert.match(page, /<SimFirstRun mode=\{guideOpen\}/);
  assert.match(page, /setGuideOpen\('button'\)/);
  assert.match(page, /simGuideShouldOpen\(\) \? 'auto' : null/);
});

test('the guide is hidden in print and stops animation under reduced motion', () => {
  const css = read('simulator-workbench.css');
  assert.match(css, /@media print \{\s*\.sim-guide,/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{\s*\.sim-guide \{ animation: none/);
});

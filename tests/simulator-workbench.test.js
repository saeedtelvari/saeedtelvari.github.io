const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const VE2D = require('../ve2d-model.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Evaluate the pure helpers at the top of SimulatorPage.jsx (everything before the hooks).
const loadHelpers = () => {
  const page = read('SimulatorPage.jsx');
  const prelude = page.slice(0, page.indexOf('// ---------------------------------------------------------------- hooks'));
  const context = { React: {}, VE2D, URLSearchParams };
  vm.runInNewContext(`${prelude}
this.helpers = { simEncodeScenario, simDecodeScenario, simInventoryCsv, simGridCsv, simApplyWorkerMessage, simInitialRun,
  simFrameAt, simRowAt, simFormatMass, simFormatPercent, simStoredTheme, simDefaultSectionLine, simMessages, SIM_INVENTORY,
  simStartRun, simNextYear };`, context);
  return context.helpers;
};
const h = loadHelpers();
// Values created inside the vm context have that realm's prototypes; compare plain copies.
const plain = value => JSON.parse(JSON.stringify(value));

test('share links round-trip every preset exactly', () => {
  for (const [id, preset] of Object.entries(VE2D.PRESETS)) {
    const scenario = VE2D.normalizeScenario({ ...VE2D.DEFAULTS, ...preset.patch, preset: id });
    assert.deepEqual(plain(h.simDecodeScenario(`?${h.simEncodeScenario(scenario)}`)), plain(scenario), id);
  }
});

test('a link that names only a preset opens that preset', () => {
  for (const [id, preset] of Object.entries(VE2D.PRESETS)) {
    const expected = VE2D.normalizeScenario({ ...VE2D.DEFAULTS, ...preset.patch, preset: id });
    assert.deepEqual(plain(h.simDecodeScenario(`?preset=${id}`)), plain(expected), id);
  }
  assert.equal(h.simDecodeScenario('?preset=sealed-block&rateMt=2').rateMt, 2, 'explicit values still win');
});

test('hand-edited share links decode to a valid scenario', () => {
  const scenario = h.simDecodeScenario('?rateMt=NaN&faults=9&porosity=7&evil=1&grid=huge');
  assert.equal(scenario.rateMt, VE2D.DEFAULTS.rateMt);
  assert.equal(scenario.porosity, VE2D.LIMITS.porosity[1]);
  assert.equal(scenario.grid, VE2D.DEFAULTS.grid);
  assert.equal(scenario.faults.length, 1);
  assert.equal(scenario.faults[0].x, 9);
  assert.equal(scenario.evil, undefined);
  for (const key of Object.keys(VE2D.LIMITS)) assert.ok(Number.isFinite(scenario[key]), key);
  assert.equal(h.simDecodeScenario(''), null, 'no query means the default scenario');
  assert.deepEqual(plain(h.simDecodeScenario('?faults=').faults), [], 'an empty fault list is kept');
});

test('inventory CSV is in megatonnes with one row per year', () => {
  const history = [
    { year: 0, injected: 0, free: 0, structural: 0, residual: 0, dissolved: 0, exited: 0, leaked: 0, balance: 0 },
    { year: 1, injected: 1e9, free: 0.5e9, structural: 0.1e9, residual: 0.2e9, dissolved: 0.1e9, exited: 0.05e9, leaked: 0.05e9, balance: 0 }
  ];
  const lines = h.simInventoryCsv(history).split('\n');
  assert.equal(lines[0], 'year,injected_Mt,free_Mt,structural_Mt,residual_Mt,dissolved_Mt,exited_Mt,leaked_Mt,balance_Mt');
  assert.equal(lines.length, 3);
  assert.equal(Number(lines[2].split(',')[1]), 1);
  assert.equal(Number(lines[2].split(',')[2]), 0.5);
});

test('grid CSV lists every cell in SI units', () => {
  const model = { nx: 2, ny: 1, dx: 500, dy: 500, zt: Float32Array.from([1500, 1501]) };
  const frame = { h: Float32Array.from([2, 0]), hMax: Float32Array.from([3, 0]), md: Float32Array.from([1, 0]), p: Float32Array.from([2e5, 0]) };
  const lines = h.simGridCsv(model, frame).split('\n');
  assert.equal(lines[0], 'x_km,y_km,top_depth_m,h_m,hmax_m,dissolved_kg_m2,dp_bar');
  assert.equal(lines[1], '0.250,0.250,1500.00,2.000,3.000,1.00,2.000');
  assert.equal(lines.length, 3);
});

test('worker messages from an older run are ignored', () => {
  let run = { ...h.simInitialRun(), id: 2, status: 'computing' };
  const stale = h.simApplyWorkerMessage(run, { type: 'model', id: 1, model: { nx: 1 } });
  assert.equal(stale, run);
  run = h.simApplyWorkerMessage(run, { type: 'model', id: 2, model: { nx: 3 } });
  assert.equal(run.model.nx, 3);
  run = h.simApplyWorkerMessage(run, { type: 'frame', id: 2, snap: { year: 0 }, rows: [{ year: 0 }] });
  run = h.simApplyWorkerMessage(run, { type: 'frame', id: 2, snap: { year: 5 }, rows: [{ year: 1 }, { year: 2 }] });
  assert.equal(run.frames.length, 2);
  assert.equal(run.history.length, 3);
  run = h.simApplyWorkerMessage(run, { type: 'done', id: 2, rows: [{ year: 3 }], truncated: false });
  assert.equal(run.status, 'ready');
  assert.equal(run.history.length, 4);
});

test('playback interpolates between snapshots and yearly rows', () => {
  const frame = (year, value) => ({ year, h: Float32Array.of(value), hMax: Float32Array.of(value), md: Float32Array.of(0), p: Float32Array.of(0), fx: Float32Array.of(0, 0), fy: Float32Array.of(0, 0), leaking: Uint8Array.of(0) });
  const frames = [frame(0, 0), frame(5, 10)];
  assert.equal(h.simFrameAt(frames, 0), frames[0]);
  assert.ok(Math.abs(h.simFrameAt(frames, 2.5).h[0] - 5) < 1e-6);
  assert.equal(h.simFrameAt(frames, 99), frames[1], 'clamped to the last snapshot');
  const rows = [{ year: 0, injected: 0 }, { year: 1, injected: 10 }];
  assert.equal(h.simRowAt(rows, 0.5).injected, 5);
});

test('the default section runs through the injector from the west edge to the east edge', () => {
  const run = VE2D.run({ ...VE2D.DEFAULTS, grid: 'coarse', years: 100 }, { keepSnapshots: false });
  const line = h.simDefaultSectionLine(run.modelView);
  const { wellX, wellY, Lx, Ly } = run.modelView;
  const cross = (wellX - line.x0) * (line.y1 - line.y0) - (wellY - line.y0) * (line.x1 - line.x0);
  assert.ok(Math.abs(cross) / Math.hypot(line.x1 - line.x0, line.y1 - line.y0) < 1, 'passes through the well');
  assert.ok(line.x0 <= line.x1, 'A is the western end');
  for (const [x, y] of [[line.x0, line.y0], [line.x1, line.y1]]) {
    const onEdge = Math.min(Math.abs(x), Math.abs(x - Lx), Math.abs(y), Math.abs(y - Ly)) < 1e-6;
    assert.ok(onEdge, `end (${x}, ${y}) lies on the model edge`);
  }
});

test('notes report past leakage and CO2 leaving the model', () => {
  const model = { faults: [{ sealCap: 10 }], depth: 1500 };
  const row = { injected: 30e9, leaked: 1.4e9, exited: 0.3e9, bhpPeak: 10e5 };
  const notes = h.simMessages(model, row, { leaking: Uint8Array.of(0) }, { truncated: false, history: [] }).map(n => n.text).join(' ');
  assert.match(notes, /1\.40 Mt has leaked through faults so far/);
  assert.match(notes, /0\.30 Mt has left the model/);
  const quiet = h.simMessages(model, { injected: 30e9, leaked: 0, exited: 0, bhpPeak: 10e5 }, { leaking: Uint8Array.of(0) }, { truncated: false, history: [] });
  assert.match(quiet[0].text, /Nothing has leaked or left the model/);
});

test('masses and shares are formatted for reading', () => {
  assert.equal(h.simFormatMass(0), '0 Mt');
  assert.equal(h.simFormatMass(9e6), '9 kt');
  assert.equal(h.simFormatMass(1.4e9), '1.40 Mt');
  assert.equal(h.simFormatMass(30e9), '30.0 Mt');
  assert.equal(h.simFormatPercent(1, 3000), '<0.1%');
  assert.equal(h.simFormatPercent(1, 0), '–');
});

test('a blocked storage falls back to the night theme', () => {
  assert.equal(h.simStoredTheme({ getItem() { throw new Error('blocked'); } }), 'night');
  assert.equal(h.simStoredTheme({ getItem: () => 'day' }), 'day');
  assert.equal(h.simStoredTheme(null), 'night');
});

test('inventory classes keep the validated colour tokens in both themes', () => {
  const css = read('simulator-workbench.css');
  const night = { dissolved: '#3b82d4', residual: '#cf5f9e', structural: '#c08417', free: '#23a07a', exited: '#8270e0', leaked: '#d94a3f' };
  const day = { dissolved: '#2f74c4', residual: '#c24d8f', structural: '#a8700a', free: '#178a66', exited: '#6e5bd0', leaked: '#c93a30' };
  const dayBlock = css.slice(css.indexOf('.ve-standalone[data-theme="day"]'));
  for (const [key, color] of Object.entries(night)) assert.match(css, new RegExp(`--sim-c-${key}: ${color};`), `night ${key}`);
  for (const [key, color] of Object.entries(day)) assert.match(dayBlock, new RegExp(`--sim-c-${key}: ${color};`), `day ${key}`);
  assert.deepEqual(plain(h.SIM_INVENTORY.map(item => item.key)), ['dissolved', 'residual', 'structural', 'free', 'exited', 'leaked']);
});

test('motion is restrained and switched off for reduced-motion users', () => {
  const css = read('simulator-workbench.css');
  assert.doesNotMatch(css, /transition:\s*all/);
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, /animation-duration: 0\.01ms !important/);
  assert.match(reduced, /transition-duration: 0\.01ms !important/);
  const views = read('SimViews.jsx');
  assert.match(views, /if \(!layout \|\| reducedMotion\)/, 'flow particles stop under reduced motion');
  assert.match(views, /!reducedMotion && fingers/, 'dissolution fingers stop under reduced motion');
});

test('the page uses plain names and one shared engine', () => {
  const page = read('SimulatorPage.jsx');
  assert.match(page, /CO₂ Storage Simulator/);
  for (const label of ["label: 'Simulator'", "label: 'Uncertainty'", "label: 'Method'", "label: 'Map'", "label: '3D'", "label: 'Section'"]) assert.ok(page.includes(label), label);
  assert.match(page, /role="tablist"/);
  assert.match(page, /new Worker\('\.\/simulation-worker\.js/);
  assert.doesNotMatch(page, /VE Simulator|kt\/yr|model units/);
  assert.doesNotMatch(read('GuidePage.jsx'), /Navier/);
  assert.ok(!fs.existsSync(path.join(root, 'uq-worker.js')), 'the separate solver copy is gone');
});

// ---------------------------------------------------------------- final review fixes

test('a new run keeps showing its old scenario until the new model arrives', () => {
  const helpers = loadHelpers();
  const old = { ...helpers.simInitialRun(), id: 1, status: 'ready', scenario: { tag: 'old' } };
  const started = helpers.simStartRun(old, 2, { tag: 'new' });
  assert.equal(started.scenario.tag, 'old', 'old fields and old scenario stay paired');
  assert.equal(started.status, 'computing');
  const modelled = helpers.simApplyWorkerMessage(started, { type: 'model', id: 2, model: { nx: 1 } });
  assert.equal(modelled.scenario.tag, 'new');
});

test('playback stops at the end of what was computed once the run is finished', () => {
  const { simNextYear } = loadHelpers();
  assert.deepEqual(plain(simNextYear(1029, 0.1, 25, { years: 1033, computedYears: 1030, ready: true })), { year: 1030, stop: true });
  assert.deepEqual(plain(simNextYear(400, 0.1, 25, { years: 1000, computedYears: 405, ready: false })), { year: 402.5, stop: false });
  assert.deepEqual(plain(simNextYear(404, 0.1, 25, { years: 1000, computedYears: 405, ready: false })), { year: 405, stop: false }, 'waits for frames while computing');
  assert.deepEqual(plain(simNextYear(999, 0.1, 25, { years: 1000, computedYears: 1000, ready: true })), { year: 1000, stop: true });
});

test('uncertainty results survive switching to the simulator and back', () => {
  const page = read('SimulatorPage.jsx');
  assert.match(page, /<SimUncertainty[^>]*hidden=\{section !== 'uncertainty'\}/);
  assert.doesNotMatch(page, /section === 'uncertainty' && <SimUncertainty/);
  assert.match(read('simulator-workbench.css'), /\.sim \[hidden\] \{ display: none !important; \}/);
});

test('the stylesheet is cache-busted with the bundles', () => {
  assert.match(read('simulator.html'), /simulator-workbench\.css\?v=\d+/);
});

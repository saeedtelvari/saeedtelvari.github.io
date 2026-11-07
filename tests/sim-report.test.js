const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const VE2D = require('../ve2d-model.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Load the pure helpers: the shared text of GuidePage.jsx, the page helpers and SimReport.jsx.
const load = () => {
  const guide = read('GuidePage.jsx');
  const shared = guide.slice(guide.indexOf('// Shared text.'), guide.indexOf('const simEmphasis'));
  const page = read('SimulatorPage.jsx');
  const prelude = page.slice(0, page.indexOf('// ---------------------------------------------------------------- hooks'));
  const report = read('SimReport.jsx');
  const context = { React: {}, VE2D, URLSearchParams };
  vm.runInNewContext(`${shared}\n${prelude}\n${report}\nthis.api = { simReportHtml, SIM_CAVEAT_TEXT, SIM_LIMITATIONS, SIM_REFERENCES, SIM_FIELDS, SIM_INVENTORY };`, context);
  return context.api;
};
const api = load();

const row = scale => ({
  year: 100, injected: 10e9 * scale, free: 1e9 * scale, structural: 2e9 * scale, residual: 3e9 * scale,
  dissolved: 2e9 * scale, exited: 1e9 * scale, leaked: 1e9 * scale, balance: 0,
  footprint: 42e6, maxColumn: 12.5, migration: 6200, bhpPeak: 31.5e5
});
const scenario = VE2D.normalizeScenario(VE2D.DEFAULTS);
const data = (extra = {}) => ({
  generatedAt: new Date(2026, 10, 7, 9, 5),
  scenarioName: 'Dome & leaky fault',
  shareUrl: 'https://saeedtelvari.github.io/simulator.html?preset=dome-fault',
  scenario,
  finalYear: 1000, finalRow: row(1),
  currentYear: 100, currentRow: row(0.5),
  uq: null,
  ...extra
});

test('the report holds the title, the caveat and the share link', () => {
  const html = api.simReportHtml(data());
  assert.match(html, /^<!DOCTYPE html>/);
  assert.ok(html.includes('VE screening report'));
  assert.ok(html.includes('Educational model. Not a substitute for a field study.'));
  assert.ok(html.includes(api.SIM_CAVEAT_TEXT.replace(/'/g, '&#39;')));
  assert.ok(html.includes('educational model of CO₂ storage'));
  assert.ok(html.includes('2026-11-07 09:05'));
  assert.ok(html.includes('?preset=dome-fault'));
  assert.ok(html.includes('Made with the VE simulator, '));
});

test('every input shows its label, value and unit', () => {
  const html = api.simReportHtml(data());
  for (const [key, meta] of Object.entries(api.SIM_FIELDS)) assert.ok(html.includes(meta.label.replace(/&/g, '&amp;')), key);
  assert.ok(html.includes('Injection rate'));
  assert.match(html, /Injection rate<\/dt><dd>[\d.]+ Mt\/yr/);
  assert.match(html, /Permeability<\/dt><dd>[\d,.]+ mD/);
  assert.ok(html.includes('Cross-fault transmissibility'));
});

test('the six classes, the total and the mass balance line are present', () => {
  const html = api.simReportHtml(data());
  assert.equal(api.SIM_INVENTORY.length, 6);
  for (const item of api.SIM_INVENTORY) assert.ok(html.includes(item.label), item.label);
  assert.ok(html.includes('Mass balance error (relative)'));
  assert.ok(html.includes('&lt; 10⁻¹²'));
  assert.ok(html.includes('Injected total'));
  assert.ok(html.includes('10.0 Mt'));
  assert.ok(html.includes('5.00 Mt'));
  assert.ok(html.includes('CO₂ footprint'));
  assert.ok(html.includes('Peak pressure rise at the well'));
});

test('the mass balance error is relative to the injected mass', () => {
  const bad = { ...row(1), balance: 1e7 };
  const html = api.simReportHtml(data({ finalRow: bad }));
  assert.ok(html.includes('1.0e-3'));
});

test('a missing uncertainty run gives one plain line', () => {
  assert.ok(api.simReportHtml(data()).includes('No uncertainty run.'));
});

test('an uncertainty run gives a P10, P50 and P90 table', () => {
  const uq = { runs: 50, years: 1000, table: [{ key: 'leakedPct', label: 'Leaked through faults', unit: '%', digits: 1, p10: 1.2, p50: 4.5, p90: 9.9 }] };
  const html = api.simReportHtml(data({ uq }));
  assert.ok(!html.includes('No uncertainty run.'));
  assert.ok(html.includes('P10') && html.includes('P90'));
  assert.ok(html.includes('4.5 %'));
});

test('limitations and references come from the Method tab text', () => {
  const html = api.simReportHtml(data());
  assert.equal(api.SIM_LIMITATIONS.length, 6);
  assert.ok(html.includes('Sharp interface: no capillary fringe'));
  assert.ok(html.includes('Nordbotten and Celia (2006)'));
  assert.ok(html.includes('<em>Journal of Fluid Mechanics</em>'));
  assert.ok(html.includes('Computers &amp; Geosciences'));
});

test('text values are escaped', () => {
  const html = api.simReportHtml(data({ scenarioName: '<script>alert(1)</script>', shareUrl: 'http://x/?a="1"&b=<b>' }));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&quot;1&quot;&amp;b=&lt;b&gt;'));
});

test('only a PNG data URL or an SVG string can enter as a figure', () => {
  const bad = api.simReportHtml(data({ mapPng: 'javascript:alert(1)', chartSvg: '<img src=x onerror=alert(1)>' }));
  assert.ok(!bad.includes('javascript:'));
  assert.ok(!bad.includes('onerror'));
  const good = api.simReportHtml(data({ mapPng: 'data:image/png;base64,AAAA', chartSvg: '<svg viewBox="0 0 1 1"></svg>' }));
  assert.ok(good.includes('<img src="data:image/png;base64,AAAA"'));
  assert.ok(good.includes('<svg viewBox="0 0 1 1">'));
});

test('the report has A4 print rules and no external fetch', () => {
  const html = api.simReportHtml(data());
  assert.match(html, /@page \{ size: A4 portrait/);
  assert.match(html, /tr \{ break-inside: avoid/);
  assert.match(html, /figure \{[^}]*break-inside: avoid/);
  assert.ok(!/<link |<script|src="https?:|url\(https?:/.test(html));
});

test('build.js lists SimReport.jsx before SimulatorPage.jsx and the page has the menu item', () => {
  const build = read('build.js');
  assert.ok(build.indexOf("'SimReport.jsx'") > 0);
  assert.ok(build.indexOf("'SimReport.jsx'") < build.indexOf("'SimulatorPage.jsx'"));
  assert.match(read('SimulatorPage.jsx'), /Screening report <small>PDF<\/small>/);
});

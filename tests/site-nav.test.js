const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../App.jsx'), 'utf8');
const helpers = new Function(src.slice(src.indexOf('// ---- navigation helpers'), src.indexOf('// ---- end navigation helpers')) +
  '\nreturn { siteActiveSection, siteLegacyTarget, SITE_NAV_ITEMS };')();

test('the active section is the one under the reading line', () => {
  const rects = [{ id: 'research', top: 900, bottom: 2000 }, { id: 'projects', top: 2100, bottom: 2900 }];
  assert.equal(helpers.siteActiveSection(rects, 300), 'home', 'the story at the top lights nothing');
  assert.equal(helpers.siteActiveSection(rects, 950), 'research');
  assert.equal(helpers.siteActiveSection(rects, 2050), 'research', 'the gap between sheets keeps the previous section');
  assert.equal(helpers.siteActiveSection(rects, 2500), 'projects');
});

test('old links still land somewhere sensible', () => {
  for (const [hash, id] of [['#about', 'research'], ['#research', 'research'], ['#publications', 'publications'],
    ['#contact', 'contact'], ['#cv', 'cv'], ['#simulator', 'simulator'], ['', 'home'], ['#nope', 'home']]) {
    assert.equal(helpers.siteLegacyTarget(hash), id, hash);
  }
});

test('navigation items are real links in the agreed order', () => {
  assert.deepEqual(helpers.SITE_NAV_ITEMS.map(i => i.label), ['Research', 'Projects', 'Publications', 'Simulator', 'CV', 'Contact']);
  assert.ok(helpers.SITE_NAV_ITEMS.every(i => /^\.\/(index|cv|simulator)\.html/.test(i.href)));
});

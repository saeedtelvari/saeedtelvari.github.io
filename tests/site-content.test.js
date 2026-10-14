const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const content = require('../site-content.js');
const root = path.resolve(__dirname, '..');

test('publication facts are correct and shared by the homepage and CV', () => {
  const pubs = content.SITE_PUBLICATIONS;
  assert.equal(pubs.length, 4);
  for (const p of pubs) {
    assert.match(p.doi, /^10\.\d{4,9}\/\S+$/);
    assert.equal(p.url, `https://doi.org/${p.doi}`);
    assert.ok(p.bibtex.includes(`doi={${p.doi}}`), `${p.id} BibTeX carries its DOI`);
    assert.ok(p.authors.includes('Telvari, S.'));
  }
  const spe = pubs.find(p => /Permeability Upscaling/.test(p.title));
  assert.equal(spe.doi, '10.2118/231836-PA');
  assert.equal(spe.title, 'Accelerated Permeability Upscaling: A Convolutional Neural Network Approach');
  assert.match(pubs[0].status, /under review/i);
  assert.deepEqual(pubs.map(p => p.year), [...pubs.map(p => p.year)].sort((a, b) => b - a));
  for (const file of ['HomeSections.jsx', 'CVPage.jsx']) {
    assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes('SITE_PUBLICATIONS'), `${file} reads SITE_PUBLICATIONS`);
  }
});

test('wording rules the user set on 2026-10-13', () => {
  const text = JSON.stringify(content);
  assert.doesNotMatch(text, /100.400/, 'no 100–400x claim');
  assert.doesNotMatch(text, /invited/i, 'the IGE seminar is not called invited');
  assert.doesNotMatch(text, /Ph\.D\./, 'PhD without dots');
  assert.match(text, /Runner-up, SPE Aberdeen Section Student Bursary/);
  assert.match(text, /Team runner-up, EAGE/);
  const months = content.SITE_ACTIVITY.map(a => a.month);
  assert.deepEqual(months, [...months].sort().reverse(), 'activity is newest first');
});

test('copy reports failure instead of claiming success', async () => {
  const src = fs.readFileSync(path.join(root, 'HomeSections.jsx'), 'utf8');
  const siteCopy = new Function(src.slice(src.indexOf('// ---- copy helper'), src.indexOf('// ---- end copy helper')) + '\nreturn siteCopy;')();
  assert.equal(await siteCopy('x', { writeText: async () => {} }), true);
  assert.equal(await siteCopy('x', { writeText: async () => { throw new Error('denied'); } }), false);
  assert.equal(await siteCopy('x', undefined), false);
});

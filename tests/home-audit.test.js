// Checks for the homepage audit: sources for the speed-up claim, the three doors, the CV PDF and small accessibility fixes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('the hero summary links to the id of the preprint card', () => {
  const hero = read('SubsurfaceHero.jsx');
  const sections = read('HomeSections.jsx');
  const content = read('site-content.js');
  const link = hero.match(/href="#(pub-[a-z0-9-]+)".*>preprint, 2026<\/a>/);
  assert.ok(link, 'the summary has a "preprint, 2026" link');
  const preprint = content.match(/id: '(ve-depleted-gas-2026)'/);
  assert.ok(preprint, 'the preprint has a publication id');
  assert.equal(link[1], `pub-${preprint[1]}`);
  assert.match(sections, /id=\{`pub-\$\{pub\.id\}`\}/, 'each publication card gets the id pub-<id>');
  assert.match(sections, /up to 100× faster \(preprint, 2026\)/);
  assert.match(read('index.html'), /up to 100× \(preprint, 2026\)/);
});

test('the doors nav has the three targets', () => {
  const hero = read('SubsurfaceHero.jsx');
  const nav = hero.match(/<nav className="hero-doors[^>]*aria-label="Paths for visitors">([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'the doors nav exists with its label');
  const hrefs = [...nav[1].matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(hrefs, ['#publications', './assets/cv.pdf', './simulator.html#method']);
  assert.ok(hero.indexOf('hero-actions') < hero.indexOf('hero-doors'), 'the doors come after the buttons');
});

test('assets/cv.pdf is a PDF under 400 KB, and the Contact section links to both CV forms', () => {
  const file = path.join(root, 'assets', 'cv.pdf');
  assert.ok(fs.existsSync(file), 'cv.pdf exists');
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 4).toString('latin1'), '%PDF');
  assert.ok(bytes.length < 400 * 1024, `cv.pdf is ${bytes.length} bytes`);
  const sections = read('HomeSections.jsx');
  assert.match(sections, /href="\.\/assets\/cv\.pdf">CV \(PDF\)</);
  assert.match(sections, /href="\.\/cv\.html">CV \(web\)</);
});

test('the speed button name contains its visible text', () => {
  const hero = read('SubsurfaceHero.jsx');
  const button = hero.match(/hero-player__speed"[^>]*aria-label=\{`([^`]*)`\}>([^<]*)</);
  assert.ok(button, 'the speed button was found');
  assert.equal(button[2], '{speed}×');
  assert.ok(button[1].includes('${speed}×'), `the name "${button[1]}" starts with the visible text`);
});

test('the preprint BibTeX is a @misc entry with the venue notes, the DOI and the year', () => {
  const sandbox = new Function(`${read('site-content.js')}\nreturn SITE_PUBLICATIONS;`);
  const preprint = sandbox().find(pub => pub.id === 've-depleted-gas-2026');
  assert.ok(preprint, 'the preprint is in the list');
  assert.match(preprint.bibtex, /^@misc\{/);
  assert.match(preprint.bibtex, /howpublished=\{EarthArXiv preprint\}/);
  assert.match(preprint.bibtex, /note=\{Under review in Geoenergy Science and Engineering\}/);
  assert.match(preprint.bibtex, /doi=\{10\.31223\/X5P49D\}/);
  assert.match(preprint.bibtex, /year=\{2026\}/);
});

test('the JSON-LD email is a plain address', () => {
  const html = read('index.html');
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(json.email, 'st4014@hw.ac.uk');
  assert.ok(!json.email.includes('mailto:'));
});

test('the demos say which model they show, and the receipt does not claim a speed-up', () => {
  const hero = read('SubsurfaceHero.jsx');
  assert.match(hero, /Teaching model: a schematic saline aquifer, 10 km wide, vertical exaggeration/);
  assert.match(hero, /The depleted-gas model is in the 2026 preprint\./);
  const receipt = hero.match(/const heroReceiptText = [\s\S]*?\n};/)[0];
  assert.doesNotMatch(receipt, /100×/);
  assert.match(read('hero-simulation-worker.js'), /performance\.now\(\)/);
  assert.match(hero, /hero-simulation-worker\.js\?v=11/);
  assert.match(read('site-content.js'), /It is a teaching model of a saline aquifer\. The depleted-gas model is in the 2026 preprint\./);
});

test('the loader shows the hero text, and the font sheets do not block the first paint', () => {
  for (const page of ['index.html', 'cv.html']) {
    const html = read(page);
    assert.match(html, /<link rel="preload" as="style" href="https:\/\/fonts\.googleapis\.com[^"]*display=swap" onload="this\.onload=null;this\.rel='stylesheet'">/, page);
    assert.match(html, /<noscript><link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com/, page);
  }
  const loader = read('index.html').match(/<div id="app-loader"[\s\S]*?<div class="shell-progress">/)[0];
  assert.match(loader, /class="hero-role"/);
  assert.match(loader, /Sa’eed Telvari/);
  assert.match(loader, /class="hero-summary"/);
});

test('the footer links are at least 24 px tall, and the simulator main can take focus', () => {
  assert.match(read('colors_and_type.css'), /\.site-footer__links a \{[^}]*min-height: 2[4-9]px/);
  assert.match(read('App.jsx'), /<main id="main-content" tabIndex=\{-1\}><SimulatorPage \/><\/main>/);
});

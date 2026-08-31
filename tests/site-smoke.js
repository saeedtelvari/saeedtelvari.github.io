const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const has = (file, pattern, message) => assert.match(read(file), pattern, message);
const lacks = (file, pattern, message) => assert.doesNotMatch(read(file), pattern, message);

has('App.jsx', /hashchange/, 'home navigation must react to same-document hash changes');
has('App.jsx', /history\.(pushState|replaceState)/, 'navigation must keep browser history in sync');
lacks('App.jsx', /minDuration\s*=\s*900/, 'the loader must not force a 900ms delay');

has('Header.jsx', /href=\{it\.href\}/, 'header navigation needs real link destinations');
has('Header.jsx', /mobileOpen\s*&&/, 'the closed mobile drawer must not remain focusable');
has('Footer.jsx', /href=\{href\}/, 'footer navigation needs real link destinations');

for (const page of ['index.html', 'simulator.html']) {
  has(page, /rel="canonical"/, `${page} needs a canonical URL`);
  has(page, /property="og:title"/, `${page} needs Open Graph metadata`);
  has(page, /application\/ld\+json/, `${page} needs structured data`);
}

has('SubsurfaceHero.jsx', /Try VE Simulator/, 'hero needs a primary simulator CTA');
has('SubsurfaceHero.jsx', /aria-label=\{label\}/, 'social links need distinct accessible names');
has('SubsurfaceHero.jsx', /aria-label="Simulation year"/, 'hero timeline slider needs an accessible name');
has('SubsurfaceHero.jsx', /new Worker\(['"]\.\/hero-simulation-worker\.js/, 'hero precomputation must run off the main thread');
assert.ok(fs.existsSync(path.join(root, 'hero-simulation-worker.js')), 'hero worker must exist');

has('CVPage.jsx', /Saeed-Telvari-CV\.pdf/, 'CV page must be ready for the real PDF asset');
has('CVPage.jsx', /Print \/ Save as PDF/, 'CV page must retain a working fallback without the PDF');
has('CVPage.jsx', /Selected Publications/, 'CV page needs evidence beyond education and skills');

has('HomeSections.jsx', /Telvari[^\n]+Ramachandran[^\n]+Wang[^\n]+Doster/, 'three-phase publication metadata must be corrected');
has('HomeSections.jsx', /EarthArXiv preprint[^\n]*2026|2026[^\n]*EarthArXiv preprint/, 'EarthArXiv preprint year must be 2026');

has('GuidePage.jsx', /educational model/i, 'guide must state the simulator scope accurately');
lacks('GuidePage.jsx', /schemes running inside the simulator/, 'guide must not claim unimplemented constitutive laws are running');
lacks('GuidePage.jsx', /\*\*Brooks-Corey/, 'raw Markdown markers must not be visible');

has('SimulatorPage.jsx', /role="tab"/, 'simulator tabs need tab semantics');
has('SimulatorPage.jsx', /tabIndex=\{activeSubTab ===/, 'simulator tabs need roving keyboard focus');
has('SimulatorPage.jsx', /Copy Scenario Link/, 'simulator state needs a share action');
has('SimulatorPage.jsx', /Export CSV/, 'simulator results need CSV export');
has('SimulatorPage.jsx', /Export SVG/, 'simulator visualization needs image export');
has('SimulatorPage.jsx', /new Worker\(['"]\.\/uq-worker\.js/, 'UQ batches must run off the main thread');
has('SimulatorPage.jsx', /<details/, 'mobile controls need progressive disclosure');
assert.ok(fs.existsSync(path.join(root, 'uq-worker.js')), 'UQ worker must exist');

has('build.js', /simulator-bundle\.js/, 'the heavy simulator must have a page-specific bundle');
const simulatorBundleVersions = [...read('simulator.html').matchAll(/simulator-bundle\.js\?v=([^"']+)/g)].map(match => match[1]);
assert.ok(simulatorBundleVersions.length >= 2, 'simulator bundle must be preloaded and executed');
assert.equal(new Set(simulatorBundleVersions).size, 1, 'simulator preload and script URLs must use the same cache version');
assert.equal(simulatorBundleVersions[0], '14', 'simulator page must load the current bundle version');
lacks('index.html', /simulator-bundle\.js/, 'home page must not download the simulator bundle');

console.log('site smoke contracts passed');

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
has('StoryPage.jsx', /React\.useLayoutEffect\(\(\) => dismissLoader\(\), \[\]\)/, 'the story page hides the loader before the first paint of the story');

has('Header.jsx', /href=\{it\.href\}/, 'header navigation needs real link destinations');
has('Header.jsx', /mobileOpen\s*&&/, 'the closed mobile drawer must not remain focusable');
has('Footer.jsx', /href=\{href\}/, 'footer navigation needs real link destinations');

for (const page of ['index.html', 've-story.html', 'simulator.html']) {
  has(page, /rel="canonical"/, `${page} needs a canonical URL`);
  has(page, /property="og:title"/, `${page} needs Open Graph metadata`);
  has(page, /application\/ld\+json/, `${page} needs structured data`);
}

has('SubsurfaceHero.jsx', /Open the VE simulator/, 'hero needs a primary simulator CTA');
has('SubsurfaceHero.jsx', /How VE models work/, 'hero needs a second button for the story page');
has('SubsurfaceHero.jsx', /aria-label=\{label\}/, 'social links need distinct accessible names');
has('SubsurfaceHero.jsx', /aria-label="Simulation year"/, 'hero timeline slider needs an accessible name');
has('SubsurfaceHero.jsx', /new Worker\(['"]\.\/hero-simulation-worker\.js/, 'hero precomputation must run off the main thread');
assert.ok(fs.existsSync(path.join(root, 'hero-simulation-worker.js')), 'hero worker must exist');

// The social cards exist and are JPEG files of a sensible size. Each page has its own card.
const cards = { 'index.html': 'assets/social-card.jpg', 'cv.html': 'assets/social-card.jpg', 've-story.html': 'assets/social-card-story.jpg' };
for (const [page, expected] of Object.entries(cards)) {
  const card = read(page).match(/property="og:image" content="https:\/\/saeedtelvari\.github\.io\/([^"]+)"/)[1];
  assert.equal(card, expected, page + ' uses its own social card');
  const bytes = fs.readFileSync(path.join(root, card));
  assert.ok(bytes.length < 200000 && bytes[0] === 0xff && bytes[1] === 0xd8, page + ' social card must be a JPEG under 200 KB');
  has(page, /property="og:image:width" content="1200"/, page + ' card width');
  has(page, /property="og:image:height" content="630"/, page + ' card height');
}
lacks('index.html', /social-card-story/, 'the homepage keeps its own card');
has('index.html', /faulted aquifer/, 'the homepage card text describes the live hero');

lacks('CVPage.jsx', /Saeed-Telvari-CV\.pdf/, 'CV page must not request a missing PDF asset');
has('CVPage.jsx', /window\.print\(\)/, 'CV page print action must invoke browser print');
has('CVPage.jsx', /Print or save as PDF/, 'CV page must offer browser print and PDF export');
has('CVPage.jsx', /SITE_PUBLICATIONS/, 'CV page needs evidence beyond education and skills');
lacks('CVPage.jsx', /headerbg3|backgroundImage/, 'CV has no photo background');
has('cv.html', /<title>CV — Sa'eed Telvari<\/title>/, 'CV needs its own title');
has('cv.html', /rel="canonical" href="https:\/\/saeedtelvari\.github\.io\/cv\.html"/, 'CV needs a canonical URL');
has('cv.html', /data-page="cv"/, 'CV renders its own entry');
lacks('cv.html', /font-awesome/, 'CV must not load Font Awesome');

has('site-content.js', /Telvari[^\n]+Ramachandran[^\n]+Wang[^\n]+Doster/, 'three-phase publication metadata must be corrected');
has('site-content.js', /year: 2026,\s*title: 'A Vertical Equilibrium Model[^']*'[\s\S]*?venue: 'EarthArXiv preprint'/, 'EarthArXiv preprint year must be 2026');

has('GuidePage.jsx', /educational model/i, 'guide must state the simulator scope accurately');
lacks('GuidePage.jsx', /schemes running inside the simulator/, 'guide must not claim unimplemented constitutive laws are running');
lacks('GuidePage.jsx', /\*\*Brooks-Corey/, 'raw Markdown markers must not be visible');

has('SimulatorPage.jsx', /role="tab"/, 'simulator tabs need tab semantics');
has('SimulatorPage.jsx', /tabIndex=\{section ===/, 'simulator tabs need roving keyboard focus');
has('SimulatorPage.jsx', /copy a link to this scenario/, 'simulator state needs a share action');
has('SimulatorPage.jsx', /Inventory through time/, 'simulator results need CSV export');
has('SimulatorPage.jsx', /Current view/, 'simulator visualization needs image export');
has('SimulatorPage.jsx', /new Worker\(['"]\.\/simulation-worker\.js/, 'simulation runs and uncertainty batches must run off the main thread');
has('SimulatorPage.jsx', /<details/, 'mobile controls need progressive disclosure');
assert.ok(fs.existsSync(path.join(root, 'simulation-worker.js')), 'simulation worker must exist');
assert.ok(!fs.existsSync(path.join(root, 'uq-worker.js')), 'the old copy of the solver must stay deleted');
has('GuidePage.jsx', /KaTeX\/0\.16\.9\/katex\.min/, 'method equations need the pinned KaTeX build, loaded on demand');
has('simulator.html', /<title>VE simulator: CO₂ storage — Sa'eed Telvari<\/title>/, 'simulator needs its plain page name');
has('ve-story.html', /<title>How VE models work — Sa'eed Telvari<\/title>/, 'the story page needs its title');
has('ve-story.html', /data-page="story"/, 'the story page renders its own entry');
has('simulator.html', /simulator-workbench\.css/, 'simulator needs its dedicated workbench stylesheet');
assert.ok(fs.existsSync(path.join(root, 'simulator-workbench.css')), 'workbench stylesheet must exist');

has('build.js', /simulator-bundle\.js/, 'the heavy simulator must have a page-specific bundle');
const simulatorBundleVersions = [...read('simulator.html').matchAll(/simulator-bundle\.js\?v=([^"']+)/g)].map(match => match[1]);
assert.ok(simulatorBundleVersions.length >= 2, 'simulator bundle must be preloaded and executed');
assert.equal(new Set(simulatorBundleVersions).size, 1, 'simulator preload and script URLs must use the same cache version');
assert.equal(simulatorBundleVersions[0], '26', 'simulator page must load the current bundle version');
for (const page of ['index.html', 'cv.html', 've-story.html']) lacks(page, /simulator-bundle\.js/, page + ' must not download the simulator bundle');
for (const page of ['index.html', 'cv.html', 'simulator.html']) lacks(page, /story-bundle\.js|story\.css/, page + ' must not download the story bundle or the story styles');
has('ve-story.html', /story-bundle\.js\?v=\d+/, 'the story page loads the story bundle');
has('ve-story.html', /story\.css\?v=\d+/, 'the story page loads the story styles');

for (const page of ['index.html', 'cv.html', 've-story.html']) {
  lacks(page, /font-awesome/, page + ' uses inline icons');
  has(page, /<script defer src="https:\/\/unpkg\.com\/react@18\.3\.1/, page + ' defers React');
  has(page, /<noscript>/, page + ' has a no-JavaScript fallback');
  has(page, /rel="apple-touch-icon"/, page + ' has a touch icon');
}
const bundleVersion = page => [...read(page).matchAll(/(?<!(?:simulator|story)-)bundle\.js\?v=([\d.]+)/g)].map(m => m[1]);
const allPages = ['index.html', 'cv.html', 've-story.html', 'simulator.html'];
const versions = new Set(allPages.flatMap(bundleVersion));
assert.equal(versions.size, 1, 'all pages load the same bundle.js version');
const cssVersions = new Set(allPages.flatMap(page => [...read(page).matchAll(/colors_and_type\.css\?v=([\d.]+)/g)].map(m => m[1])));
assert.equal(cssVersions.size, 1, 'all pages load the same colors_and_type.css version');
assert.ok(fs.existsSync(path.join(root, 'robots.txt')) && fs.existsSync(path.join(root, 'sitemap.xml')), 'robots.txt and sitemap.xml exist');
has('SimulatorPage.jsx', /location\.hash === '#method'/, 'the method guide can be linked directly');
console.log('site smoke contracts passed');

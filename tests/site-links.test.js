// The links between the homepage, the story page and the simulator, the name "VE simulator",
// and the border between the site bundle and the story bundle.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const between = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to, text.indexOf(from)));

// ---- the hero buttons

test('the hero has the primary button "Open the VE simulator" and the second button "How VE models work"', () => {
  const hero = read('SubsurfaceHero.jsx');
  const actions = between(hero, '<div className="hero-actions', '<ul className="hero-profiles">');
  const links = actions.split('<a ').slice(1).map(chunk => chunk.split('</a>')[0]).map(chunk => ({
    className: chunk.match(/className="([^"]+)"/)[1],
    href: chunk.match(/href="([^"]+)"/)[1],
    text: chunk.slice(chunk.search(/(\}|")>/) + 2).replace(/<[^>]+>/g, '').trim(),
  }));
  // Two buttons only, so the button row and the profile icons keep the layout of the earlier homepage.
  // The CV stays in the header.
  assert.deepEqual(links, [
    { className: 'btn btn--primary', href: './simulator.html', text: 'Open the VE simulator' },
    { className: 'btn btn--quiet', href: './ve-story.html', text: 'How VE models work' },
  ]);
  assert.match(actions, /onNavigate\('story', event\)/, 'the click uses the page helper, as the other buttons do');
  assert.doesNotMatch(hero, /Open the CO₂ simulator/);
  assert.equal((actions.match(/btn--primary/g) || []).length, 1, 'the simulator is the only primary button');
});

// ---- the header and footer nav item

const navItems = () => new Function(between(read('App.jsx'), '// ---- navigation helpers', '// ---- end navigation helpers') + '\nreturn SITE_NAV_ITEMS;')();

test('the nav has an item for the story page, and the simulator item uses the new name', () => {
  const items = navItems();
  assert.deepEqual(items.find(item => item.id === 'story'), { id: 'story', label: 'How VE works', href: './ve-story.html' });
  assert.deepEqual(items.find(item => item.id === 'simulator'), { id: 'simulator', label: 'VE simulator', href: './simulator.html' });
  assert.match(read('Header.jsx'), /SITE_NAV_ITEMS\.map/, 'the header draws every item');
  assert.match(read('Footer.jsx'), /SITE_NAV_ITEMS\.map/, 'and so does the footer');
});

// ---- the story page

test('the story page ends with one panel of three links, and nothing from the homepage sections', () => {
  const page = read('StoryPage.jsx');
  const panel = between(page, 'const StoryEnd', 'const StoryPage');
  const links = [...panel.matchAll(/<a className="([^"]+)" href="([^"]+)">([^<]+)<\/a>/g)].map(match => [match[3], match[2]]);
  assert.deepEqual(links, [
    ['Back to the homepage', './index.html'],
    ['Open the VE simulator', './simulator.html'],
    ['Read the publications', './index.html#publications'],
  ]);
  assert.equal((panel.match(/<a /g) || []).length, 3, 'three links and no more');
  assert.match(panel, /id=\{STORY_END_ID\}/);
  assert.match(page, /const STORY_END_ID = 'story-end'/);
  assert.doesNotMatch(page, /ResearchSection|ProjectsSection|PublicationsSection|ContactSection/, 'no copy of the homepage sections');
  assert.ok(page.indexOf('<StoryStage') < page.indexOf('<StoryEnd'), 'the panel follows the story');
  assert.match(page, /<Header active="story" story /, 'the header is in story mode');
  assert.match(page, /<Footer /);
});

test('the skip control goes to the end panel, and the story page has no target called research', () => {
  const stage = read('StoryStage.jsx');
  assert.match(stage, /href="#story-end"/);
  assert.match(stage, />Skip to the end</);
  assert.doesNotMatch(stage, /Skip to research|#research/);
  assert.doesNotMatch(read('story-content.js'), /id: 'research'/);
  assert.match(read('App.jsx'), /story: \['story-end'\]/, 'siteNavigate scrolls to the end panel');
});

test('ve-story.html has the title, the description and the card of the story page', () => {
  const html = read('ve-story.html');
  assert.match(html, /<title>How VE models work — Sa'eed Telvari<\/title>/);
  assert.match(html, /<meta property="og:title" content="How VE models work — Sa'eed Telvari">/);
  assert.match(html, /<meta name="twitter:title" content="How VE models work — Sa'eed Telvari">/);
  assert.match(html, /<meta name="description" content="[^"]{60,}">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/saeedtelvari\.github\.io\/assets\/social-card-story\.jpg">/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/saeedtelvari\.github\.io\/assets\/social-card-story\.jpg">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/saeedtelvari\.github\.io\/ve-story\.html">/);
  assert.match(html, /<div id="root" data-page="story">/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/saeedtelvari\.github\.io\/ve-story\.html<\/loc>/);
});

// ---- the border between the bundles

test('index.html, cv.html and the site bundle have no story code and no story file', () => {
  for (const page of ['index.html', 'cv.html', 'simulator.html']) {
    assert.doesNotMatch(read(page), /story-bundle|story\.css|land-110m|north-sea-ccs|story-run|story-worker/, `${page} loads nothing of the story`);
  }
  const site = read('bundle.js');
  for (const name of ['// File: StoryStage.jsx', 'STORY_RENDERERS', 'SITE_STORY', 'land-110m', 'story-run.json', 'story-worker', '// File: StoryPage.jsx']) {
    assert.ok(!site.includes(name), `bundle.js has no ${name}`);
  }
  assert.ok(site.includes('typeof StoryPage'), 'App.jsx tests for the story page before it uses it');
  assert.ok(site.includes('HeroName'), 'the site bundle has the restored hero');
  const story = read('story-bundle.js');
  assert.ok(story.includes('STORY_RENDERERS') && story.includes('const StoryPage'), 'the story bundle has the stage and the page');
  assert.ok(!story.includes('SubsurfaceHero') && !story.includes('GeologicalDescent'), 'the story bundle has no hero');
  const html = read('ve-story.html');
  assert.ok(html.indexOf('story-bundle.js') < html.indexOf('./bundle.js'), 've-story.html loads story-bundle.js before bundle.js');
});

test('App.jsx runs on a page without story-bundle.js', () => {
  const src = read('App.jsx');
  const vm = require('node:vm');
  const bundle = read('bundle.js');
  const element = { getAttribute: () => 'story', appendChild() {}, addEventListener() {}, removeEventListener() {}, style: {}, classList: { add() {}, remove() {} }, getBoundingClientRect: () => ({ top: 0, bottom: 0 }) };
  let rendered = 0;
  const context = {
    window: { addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }), location: { hash: '' }, scrollY: 0, innerHeight: 800 },
    document: { getElementById: () => element, querySelector: () => element, querySelectorAll: () => [], createElement: () => element, addEventListener() {}, removeEventListener() {}, body: element, documentElement: element },
    console,
    React: {
      useState: value => [value, () => {}], useEffect() {}, useLayoutEffect() {}, useMemo: fn => fn(), useRef: value => ({ current: value }), useCallback: fn => fn,
      memo: component => component, createElement: () => ({}), Fragment: 'Fragment',
    },
    ReactDOM: { createRoot: () => ({ render: () => { rendered += 1; } }) },
  };
  assert.match(src, /typeof StoryPage === 'function'/);
  vm.createContext(context);
  vm.runInContext(bundle, context);
  assert.equal(rendered, 1, 'the page renders (the homepage) and does not throw');
});

// ---- the name "VE simulator"

// Remove the comments of a source file. A reader of the page does not see them.
const stripComments = text => text.split('\r\n').join('\n').replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(line => line.replace(/(^|\s)\/\/.*$/, '$1')).join('\n');

test('no page, source text or README calls the simulator "CO₂ simulator" or "CO2 Storage Simulator"', () => {
  const old = /CO(?:₂|2|\\u2082|<sub>2<\/sub>) (?:storage )?simulator/i;
  const files = ['index.html', 'cv.html', 've-story.html', 'simulator.html', 'README.md', 'sitemap.xml',
    'App.jsx', 'Header.jsx', 'Footer.jsx', 'SubsurfaceHero.jsx', 'HomeSections.jsx', 'CVPage.jsx', 'SimulatorPage.jsx', 'SimViews.jsx',
    'SimCharts.jsx', 'GuidePage.jsx', 'StoryPage.jsx', 'StoryStage.jsx', 'site-content.js', 'story-content.js'];
  for (const file of files) {
    const text = /\.(jsx|js)$/.test(file) ? stripComments(read(file)) : read(file);
    assert.doesNotMatch(text, old, `${file} uses the old name`);
  }
  // The bundles are what the browser runs.
  for (const file of ['bundle.js', 'simulator-bundle.js', 'story-bundle.js']) assert.doesNotMatch(read(file).replace(/\/\/[^\n]*\n/g, '\n'), /CO(?:₂|2|\\u2082) (?:storage )?simulator/i, `${file} uses the old name`);
});

test('the simulator is called "VE simulator" in the nav, the hero, the footer links, the page, the metadata and the README', () => {
  assert.equal(navItems().find(item => item.id === 'simulator').label, 'VE simulator');
  assert.match(read('SubsurfaceHero.jsx'), /Open the VE simulator/);
  const sim = read('simulator.html');
  assert.match(sim, /<title>VE simulator: CO₂ storage — Sa'eed Telvari<\/title>/);
  assert.match(sim, /<meta name="description" content="VE simulator by Sa'eed Telvari/);
  assert.match(sim, /<meta property="og:title" content="VE simulator: CO₂ storage — Sa'eed Telvari">/);
  assert.match(sim, /<meta name="twitter:title" content="VE simulator: CO₂ storage">/);
  assert.match(sim, /"name":"VE simulator: CO₂ storage"/);
  assert.match(sim, /Loading the VE simulator…/);
  assert.match(read('SimulatorPage.jsx'), /<h1>VE simulator<\/h1>/);
  assert.match(read('simulator-bundle.js'), /createElement\("h1", null, "VE simulator"\)/);
  for (const page of ['index.html']) {
    const html = read(page);
    assert.match(html, /<meta property="og:description" content="[^"]*VE simulator for CO₂ storage[^"]*">/, 'the homepage description');
    assert.match(html, /<meta name="twitter:description" content="[^"]*VE simulator for CO₂ storage[^"]*">/);
    assert.match(html, /<a href="\.\/simulator\.html">VE simulator<\/a>/, 'the no-script link');
  }
  assert.match(read('README.md'), /VE simulator/);
  assert.equal(navItems().find(item => item.id === 'simulator').href, './simulator.html', 'the address stays simulator.html');
});

test('the project card, the story button and the homepage text use the new name', () => {
  const content = require('../site-content.js');
  const project = content.SITE_PROJECTS.find(item => item.id === 'simulator');
  assert.equal(project.title, 'VE simulator');
  assert.deepEqual(project.links.map(link => link.label), ['Open the VE simulator', 'Read the method']);
  assert.match(project.image.alt, /VE simulator/);
  const story = require('../story-content.js');
  assert.deepEqual(story.SITE_STORY.actions.map(action => action.label), ['Open the VE simulator', 'Read the publications']);
});

test('the MuPSI wording of today and the true no-script text stay in the restored homepage', () => {
  const content = require('../site-content.js');
  const all = JSON.stringify(content);
  assert.match(all, /field-scale case study/);
  assert.doesNotMatch(all, /28-case|industrial case study/);
  const sections = read('HomeSections.jsx');
  assert.match(sections, /at field scale/);
  assert.doesNotMatch(sections, /28-case/);
  assert.match(read('index.html'), /They reproduce compositional simulations, with speed-ups of up to 100× \(preprint, 2026\)\./);
  // The loader repeats the hero summary. Only the no-script text must keep the true wording.
  assert.doesNotMatch(read('index.html').split('<noscript>').pop(), /faster than full 3D compositional models/);
});

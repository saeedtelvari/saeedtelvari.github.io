// Tests for the UX audit of the story page: chapter control, Play all, landmarks, h1, sources and text versions.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SITE_STORY } = require('../story-content.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Loads the compiled code of StoryStage.jsx with a fake React. An element is { type, props, children }.
const load = ({ reduced = false } = {}) => {
  const bundle = read('story-bundle.js');
  const code = bundle.slice(bundle.indexOf('// File: StoryStage.jsx'), bundle.indexOf('// File: StoryChapters.jsx'));
  assert.ok(code.includes('StoryChapterNav'), 'build the current source before testing');
  const context = {
    window: { matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }) },
    document: {},
    console,
    React: { Fragment: 'Fragment', createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }) },
    useRef: () => ({ current: null }),
    useState: init => [typeof init === 'function' ? init() : init, () => {}],
    useEffect: () => {},
    SITE_STORY,
    siteScrollTo: () => {},
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return { get: name => vm.runInContext(name, context) };
};

const nodes = tree => {
  const out = [];
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    out.push(node);
    (node.children || []).forEach(walk);
  };
  walk(tree);
  return out;
};
const text = node => (node.children || []).map(child => (typeof child === 'string' ? child : typeof child === 'object' ? text(child) : '')).join('');
const cls = (node, pattern) => node.props && typeof node.props.className === 'string' && pattern.test(node.props.className);
const TITLES = ['Orbit', 'North Sea map', 'Descent', 'Into the rock', 'Rock to grid', '3D to VE', 'Live VE'];
const nav = (page, props) => page.get('StoryChapterNav')({ index: 0, all: false, onGo() {}, onAll() {}, showAll: true, ...props });

test('the chapter nav is a labelled nav with 7 buttons named by the chapter titles; the current one is aria-current="step"', () => {
  const page = load();
  const tree = nav(page, { index: 3 });
  assert.equal(tree.type, 'nav');
  assert.equal(tree.props['aria-label'], 'Story chapters');
  const segments = nodes(tree).filter(node => node.type === 'button' && cls(node, /story-chapters__seg/));
  assert.equal(segments.length, 7);
  assert.deepEqual(segments.map(text), TITLES);
  assert.deepEqual(segments.map(node => node.props['aria-current']), [undefined, undefined, undefined, 'step', undefined, undefined, undefined]);
  assert.equal(text(nodes(tree).find(node => cls(node, /story-chapters__now/))), '4 of 7 · Into the rock', 'the phone line');
  const prev = index => nodes(nav(page, { index })).find(node => cls(node, /story-chapters__prev/));
  assert.equal(prev(3).props.disabled, false);
  assert.equal(prev(0).props.disabled, true);
});

test('a chapter button and the next button ask for their own stage', () => {
  const page = load();
  const calls = [];
  const tree = nav(page, { onGo: i => calls.push(i) });
  nodes(tree).filter(node => node.type === 'button' && cls(node, /story-chapters__seg/))[4].props.onClick();
  nodes(tree).find(node => cls(node, /story-chapters__next/)).props.onClick();
  assert.deepEqual(calls, [4, 1]);
});

test('Play all says "about 1 min", reads "Pause" while it runs, and is absent under reduced motion', () => {
  const page = load();
  const find = tree => nodes(tree).find(node => node.type === 'button' && 'data-story-playall' in node.props);
  const idle = find(nav(page));
  assert.ok(idle, 'Play all exists');
  assert.match(text(idle), /^Play all/);
  assert.match(text(idle) + idle.props.title, /about 1 min/);
  assert.equal(text(find(nav(page, { index: 2, all: true }))), 'Pause');
  assert.equal(find(nav(page, { showAll: false })), undefined, 'no Play all without showAll');

  // The code path of reduced motion: StoryStage shows the static nav, and that nav has no Play all.
  const reduced = load({ reduced: true });
  const stage = reduced.get('StoryStage')({ onNavigate: null });
  const staticNav = nodes(stage).find(node => node.type === reduced.get('StoryStaticNav'));
  assert.ok(staticNav, 'the static stage has its chapter nav');
  assert.ok(!nodes(stage).some(node => node.props && 'data-story-playall' in node.props));
  assert.equal(find(reduced.get('StoryStaticNav')()), undefined, 'and it renders no Play all');
  const pinned = load().get('StoryStage')({ onNavigate: null });
  assert.ok(nodes(pinned).some(node => node.type === load().get('StoryPinned') || String(node.type).includes('StoryPinned') || node.props.sectionRef), 'the normal stage is the pinned one');
});

test('Play all cancels at a wheel, a touch scroll, a key press and a press elsewhere, but not at its own button; it holds 1.5 s', () => {
  const source = read('StoryStage.jsx');
  assert.match(source, /\['wheel', 'touchmove', 'keydown', 'pointerdown'\]/);
  assert.match(source, /closest\('\[data-story-playall\]'\)/);
  assert.match(source, /STORY_ALL_HOLD_MS = 1500/);
});

test('main#main-content wraps the story stage and the end panel; header and footer stay outside', () => {
  const source = read('StoryPage.jsx');
  const main = source.indexOf('<main id="main-content" tabIndex={-1}>');
  assert.ok(main > 0);
  const stage = source.indexOf('<StoryStage', main);
  assert.ok(stage > main);
  assert.ok(source.indexOf('<StoryEnd />', main) > stage);
  assert.ok(source.indexOf('</main>') > source.indexOf('<StoryEnd />'));
  assert.ok(source.indexOf('<Header') < main && source.indexOf('<Footer') > source.indexOf('</main>'));
});

test('the h1 is "How VE models work"; the name is a large paragraph in the same style', () => {
  const page = load();
  const tree = page.get('StoryWords')({ chapter: page.get('STORY_CHAPTERS')[0], on: true, caption: 0, onNavigate: null });
  const headings = nodes(tree).filter(node => node.type === 'h1');
  assert.equal(headings.length, 1);
  assert.equal(text(headings[0]), 'How VE models work');
  assert.equal(text(nodes(tree).find(node => node.type === 'p' && cls(node, /story-name/))), SITE_STORY.name);
  assert.match(read('story.css'), /\.story-name \{[^}]*font: 600 clamp\(34px, 4\.6vw, 76px\)/, 'the name keeps its size');
});

test('the first screen says how long the page is', () => {
  assert.equal(SITE_STORY.intro, '7 short steps, about 1 minute. Scroll, or press Play all.');
  assert.equal(SITE_STORY.introReduced, '7 short steps. Scroll down.');
  const page = load();
  const tree = page.get('StoryWords')({ chapter: page.get('STORY_CHAPTERS')[0], on: true, caption: 0, onNavigate: null });
  assert.ok(nodes(tree).some(node => node.type === page.get('StoryIntro')));
  assert.equal(text(page.get('StoryIntro')({ on: true })), SITE_STORY.intro);
  assert.equal(text(load({ reduced: true }).get('StoryIntro')({ on: true })), SITE_STORY.introReduced);
});

test('the sources are on the page: NOAA under the ppm line, and the preprint under the VE caption', () => {
  assert.equal(SITE_STORY.ppmSource, 'Source: NOAA, Mauna Loa annual mean.');
  const page = load();
  const chapters = page.get('STORY_CHAPTERS');
  const words = id => page.get('StoryWords')({ chapter: chapters.find(chapter => chapter.id === id), on: true, caption: 1, onNavigate: null });
  assert.ok(nodes(words('orbit')).some(node => node.type === 'p' && text(node) === SITE_STORY.ppmSource));
  const line = nodes(words('ve')).find(node => node.type === 'p' && cls(node, /story-source/));
  assert.equal(text(line), 'Speed-up from Telvari et al. (2026), preprint, Hugin Formation East case.');
  assert.equal(nodes(line).find(node => node.type === 'a').props.href, './index.html#publications');
});

test('each of the 7 stages has a text version of its figure, in the DOM before its captions', () => {
  const page = load();
  assert.equal(Object.keys(SITE_STORY.descriptions).length, 7);
  page.get('STORY_CHAPTERS').forEach(chapter => {
    const description = SITE_STORY.descriptions[chapter.id];
    assert.ok(description && description.length > 60, `${chapter.id} has a description`);
    const all = nodes(page.get('StoryWords')({ chapter, on: false, caption: 0, onNavigate: null }));
    const hidden = all.findIndex(node => node.type === 'p' && node.props.className === 'visually-hidden');
    assert.ok(hidden >= 0, `${chapter.id} renders it`);
    assert.equal(text(all[hidden]), description);
    assert.ok(hidden < all.findIndex(node => cls(node, /^story-stack$/)), 'before the captions');
  });
  assert.match(read('StoryFields.jsx'), /Map data and sources/, 'the map keeps its list');
});

test('the cell counter says "in this sketch"', () => {
  assert.match(read('StoryBlock.jsx'), /STORY_BLOCK_SKETCH = 'in this sketch'/);
  assert.doesNotMatch(read('StoryBlock.jsx'), /in this 3D model/);
});

test('the live links are "Open the VE simulator" and "Read the publications"', () => {
  assert.deepEqual(SITE_STORY.actions.map(action => [action.label, action.href]),
    [['Open the VE simulator', './simulator.html'], ['Read the publications', './index.html#publications']]);
});

test('reduced motion: the live frame mounts the controls and does not play by itself', () => {
  const source = read('StoryStage.jsx');
  const frame = source.slice(source.indexOf('const StoryFrame'), source.indexOf('const StoryStaticNav'));
  assert.match(frame, /entry\.mount\) storyGuard\('live\.mount'/);
  assert.match(read('StoryBlock.jsx'), /live\.playing = !live\.static;/, 'no autoplay in the static frame');
});

test('reduced motion on a phone: the skip button is in the page flow, so it covers no caption', () => {
  const css = read('story.css');
  const phone = css.slice(css.indexOf('@media (max-width: 640px)'));
  assert.match(phone, /\.story--static \.story-skip-wrap \{[^}]*position: static/);
  assert.match(phone, /\.story--static \.story-skip \{[^}]*position: static/);
});

test('the phone chapter buttons are at least 44 px high', () => {
  const css = read('story.css');
  const phone = css.slice(css.indexOf('/* The chapter control becomes two rows'));
  assert.match(phone, /\.story-chapters__step \{[^}]*height: 44px/);
  assert.match(phone, /\.story-chapters__seg \{ min-height: 44px/);
  assert.match(phone, /\.story-chapters__all \{[^}]*min-height: 44px/);
});

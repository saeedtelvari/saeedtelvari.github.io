const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SITE_STORY } = require('../site-content.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const between = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to));
const plain = value => JSON.parse(JSON.stringify(value));

const helpers = new Function(between(read('StoryStage.jsx'), '// ---- story helpers', '// ---- end story helpers') +
  '\nreturn { STORY_SCREENS, STORY_CHAPTERS, STORY_CAPTION_COUNT, STORY_COLORS, storyProgress, storyChapterAt, storyCaptionIndex, storyRail, storyInline };')();
const { STORY_SCREENS, STORY_CHAPTERS, STORY_CAPTION_COUNT, STORY_COLORS, storyProgress, storyChapterAt, storyCaptionIndex, storyRail, storyInline } = helpers;
const IDS = ['orbit', 'descent', 'rock', 'grid', 've', 'live'];
const sweep = (step = 0.001) => Array.from({ length: Math.round(1 / step) + 1 }, (_, i) => Math.min(1, i * step));

test('the six chapters are contiguous and cover the whole story', () => {
  assert.equal(STORY_SCREENS, 7);
  assert.deepEqual(STORY_CHAPTERS.map(chapter => chapter.id), IDS);
  assert.deepEqual(STORY_CHAPTERS.map(chapter => [chapter.from, chapter.to]),
    [[0, 0.1], [0.1, 0.26], [0.26, 0.44], [0.44, 0.6], [0.6, 0.8], [0.8, 1]]);
  assert.equal(STORY_CHAPTERS[0].from, 0);
  assert.equal(STORY_CHAPTERS[STORY_CHAPTERS.length - 1].to, 1);
  STORY_CHAPTERS.forEach((chapter, i) => {
    assert.ok(chapter.to > chapter.from, `${chapter.id} has a length`);
    assert.ok(chapter.title, `${chapter.id} has a title`);
    if (i > 0) assert.equal(chapter.from, STORY_CHAPTERS[i - 1].to, `${chapter.id} starts where the last chapter ends`);
  });
  assert.deepEqual(Object.keys(STORY_CAPTION_COUNT), IDS);
});

test('progress is the scrolled share of the pinned distance and clamps to 0 and 1', () => {
  const height = STORY_SCREENS * 800;
  assert.equal(storyProgress({ top: 0, height, viewport: 800 }), 0);
  assert.equal(storyProgress({ top: 300, height, viewport: 800 }), 0, 'before the story');
  assert.equal(storyProgress({ top: -2400, height, viewport: 800 }), 0.5);
  assert.equal(storyProgress({ top: -4800, height, viewport: 800 }), 1, 'the stage leaves at the end of the sixth screen');
  assert.equal(storyProgress({ top: -9000, height, viewport: 800 }), 1, 'after the story');
  assert.equal(storyProgress({ top: -100, height: 800, viewport: 800 }), 0, 'no pinned distance');
  assert.equal(storyProgress({ top: NaN, height, viewport: 800 }), 0);
});

test('chapter boundaries: each chapter starts at its from value and p = 1 is the end of the last chapter', () => {
  assert.deepEqual(storyChapterAt(0), { index: 0, id: 'orbit', local: 0 });
  assert.deepEqual(storyChapterAt(1), { index: 5, id: 'live', local: 1 });
  STORY_CHAPTERS.forEach((chapter, i) => {
    assert.deepEqual(storyChapterAt(chapter.from), { index: i, id: chapter.id, local: 0 }, `${chapter.id} starts`);
    const before = storyChapterAt(chapter.to - 1e-9);
    assert.equal(before.index, i, `${chapter.id} lasts until its end`);
    assert.ok(before.local > 0.999 && before.local <= 1);
  });
  assert.ok(Math.abs(storyChapterAt(0.35).local - 0.5) < 1e-9, 'the middle of the rock chapter');
  assert.deepEqual(storyChapterAt(-3), { index: 0, id: 'orbit', local: 0 });
  assert.deepEqual(storyChapterAt(3), { index: 5, id: 'live', local: 1 });
  assert.deepEqual(storyChapterAt(NaN), { index: 0, id: 'orbit', local: 0 });
  let last = 0;
  for (const p of sweep()) {
    const at = storyChapterAt(p);
    assert.ok(at.index >= last, 'the chapter never goes back as p grows');
    assert.ok(at.local >= 0 && at.local <= 1);
    assert.ok(p >= STORY_CHAPTERS[at.index].from);
    last = at.index;
  }
});

test('chapters with two captions switch at the middle; the others keep caption 0', () => {
  for (const id of ['rock', 'grid', 've']) {
    assert.equal(storyCaptionIndex(id, 0), 0, id);
    assert.equal(storyCaptionIndex(id, 0.49), 0, id);
    assert.equal(storyCaptionIndex(id, 0.5), 1, id);
    assert.equal(storyCaptionIndex(id, 1), 1, id);
  }
  for (const id of ['orbit', 'descent', 'live']) {
    for (const local of [0, 0.5, 0.99, 1]) assert.equal(storyCaptionIndex(id, local), 0, `${id} at ${local}`);
  }
  const late = storyChapterAt(0.43);
  assert.equal(late.id, 'rock');
  assert.equal(storyCaptionIndex(late.id, late.local), 1, 'late in the rock chapter');
});

test('the progress rail fills in order, never goes back and is full at the end', () => {
  assert.deepEqual(storyRail(0), [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(storyRail(1), [1, 1, 1, 1, 1, 1]);
  assert.deepEqual(storyRail(0.1), [1, 0, 0, 0, 0, 0], 'orbit is full where descent starts');
  assert.ok(Math.abs(storyRail(0.35)[2] - 0.5) < 1e-9, 'half of the rock chapter');
  let last = storyRail(0);
  for (const p of sweep()) {
    const rail = storyRail(p);
    assert.equal(rail.length, 6);
    rail.forEach((fill, i) => {
      assert.ok(fill >= 0 && fill <= 1, 'a fill is a fraction');
      assert.ok(fill >= last[i], `segment ${i} never empties as p grows`);
      if (fill > 0 && i > 0) assert.equal(rail[i - 1], 1, `segment ${i} starts after segment ${i - 1} is full`);
    });
    last = rail;
  }
});

test('captions mark italic text with asterisks', () => {
  assert.deepEqual(storyInline('the plume thickness *h*, so'), [{ text: 'the plume thickness ', em: false }, { text: 'h', em: true }, { text: ', so', em: false }]);
  assert.deepEqual(storyInline('no marks'), [{ text: 'no marks', em: false }]);
});

test('SITE_STORY has the captions of the spec, word for word', () => {
  assert.deepEqual(Object.keys(SITE_STORY.captions), IDS);
  for (const id of IDS) assert.equal(SITE_STORY.captions[id].length, STORY_CAPTION_COUNT[id], `${id} has the number of captions that the engine expects`);
  const allText = [SITE_STORY.name, SITE_STORY.ppm, SITE_STORY.label, ...Object.values(SITE_STORY.captions).flat()];
  for (const text of allText) assert.ok(text && text === text.trim(), 'no empty or padded text');
  for (const text of Object.values(SITE_STORY.captions).flat()) assert.equal(text.split('*').length % 2, 1, `balanced asterisks in: ${text}`);

  const specFile = 'docs/superpowers/specs/2026-10-25-homepage-story-design.md';
  if (!fs.existsSync(path.join(root, specFile))) return;
  const rows = read(specFile).split('\n').filter(line => /^\| [0-5] \|/.test(line));
  assert.equal(rows.length, 6, 'the storyboard table has six rows');
  rows.forEach((row, i) => {
    const cells = row.split('|');
    const quotes = [...cells[cells.length - 2].matchAll(/"([^"]+)"/g)].map(match => match[1]);
    const captions = SITE_STORY.captions[IDS[i]];
    assert.deepEqual(quotes.slice(0, captions.length), captions, `${IDS[i]} captions match the spec`);
    if (IDS[i] === 'live') assert.deepEqual(quotes.slice(1), SITE_STORY.actions.map(action => action.label), 'the buttons match the spec');
  });
  const board = read('docs/superpowers/specs/2026-10-25-homepage-story-mockups/storyboard.html');
  assert.equal(board.match(/<p class="ppm">([^<]+)<\/p>/)[1], SITE_STORY.ppm, 'the ppm line matches the storyboard');
  assert.equal(board.match(/<p class="name">([^<]+)<\/p>/)[1], SITE_STORY.name.replace('’', "'"), 'the name matches the storyboard');
});

test('STORY_COLORS match the --story tokens in the stylesheet and in the spec', () => {
  const css = read('colors_and_type.css');
  const tokens = Object.fromEntries([...css.matchAll(/--story-([a-z0-9]+):\s*(#[0-9a-f]{6});/g)].map(match => [match[1], match[2]]));
  assert.deepEqual(tokens, STORY_COLORS);
  const specFile = 'docs/superpowers/specs/2026-10-25-homepage-story-design.md';
  if (!fs.existsSync(path.join(root, specFile))) return;
  const table = [...read(specFile).matchAll(/`--story-([a-z0-9]+)`\s*\|\s*`(#[0-9a-f]{6})`/g)];
  assert.equal(table.length, 10, 'the spec has ten tokens');
  for (const [, name, value] of table) assert.equal(STORY_COLORS[name], value, `--story-${name}`);
  assert.match(css, /\.story--pinned \{[^}]*100vh[^}]*100svh/, 'the story height has a 100vh fallback');
});

test('every chapter has a placeholder renderer that fills the sky and writes its title and local', () => {
  const registry = {};
  new Function('STORY_CHAPTERS', 'STORY_COLORS', 'STORY_RENDERERS', read('StoryChapters.jsx'))(STORY_CHAPTERS, STORY_COLORS, registry);
  assert.deepEqual(Object.keys(registry), IDS);
  for (const chapter of STORY_CHAPTERS) {
    const entry = registry[chapter.id];
    assert.equal(entry.animated, false, `${chapter.id} is not animated`);
    const calls = [];
    const ctx = {
      fillRect(...args) { calls.push(['fillRect', this.fillStyle, ...args]); },
      fillText(...args) { calls.push(['fillText', ...args]); },
    };
    entry.draw(ctx, { local: 0.25, p: 0.3, width: 640, height: 360, dpr: 1, time: 0, reducedMotion: false });
    assert.deepEqual(calls[0], ['fillRect', STORY_COLORS.sky, 0, 0, 640, 360], 'the first call fills the sky');
    const texts = calls.filter(call => call[0] === 'fillText').map(call => call[1]);
    assert.ok(texts.includes(chapter.title), `${chapter.id} writes its title`);
    assert.ok(texts.some(text => text.includes('0.25')), `${chapter.id} writes local`);
  }
});

test('the story is wired into the build and the home page, and the old hero is not', () => {
  const files = [...read('build.js').match(/const files = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
  const at = name => files.indexOf(name);
  assert.ok(at('StoryStage.jsx') > at('site-content.js'), 'the copy loads before the story');
  assert.ok(at('StoryChapters.jsx') > at('StoryStage.jsx'), 'the registry exists before the placeholders fill it');
  assert.ok(at('StoryChapters.jsx') < at('HomeSections.jsx'));
  assert.ok(!files.includes('GeologicalDescent.jsx'), 'the old descent is not in the bundle: the sections sit on the sky ground');
  assert.ok(!files.includes('SubsurfaceHero.jsx') && !files.includes('hero-geology.js'), 'the old hero is not in the bundle');
  const app = read('App.jsx');
  assert.match(app, /<StoryStage onNavigate=\{navigate\} \/>/);
  assert.doesNotMatch(app, /<SubsurfaceHero/);
  assert.doesNotMatch(app, /<GeologicalDescent/);
  assert.ok(app.indexOf('<StoryStage') < app.indexOf('<main id="main-content"'), 'the story is above the sections');
  const html = read('index.html');
  assert.match(html, /<meta name="theme-color" content="#c9d6dc">/);
  assert.match(html, /family=Literata:ital,opsz,wght@0,7\.\.72,400;0,7\.\.72,600;1,7\.\.72,400/);
  assert.match(html, /#app-loader \{[^}]*background: #c9d6dc/);
  const bundle = read('bundle.js');
  assert.ok(bundle.includes('// File: StoryStage.jsx') && !bundle.includes('// File: SubsurfaceHero.jsx'), 'build the current source before testing');
});

// ---- the pinned stage and the static frames, run from the compiled bundle with a small fake DOM

const fakePage = ({ reduced = false } = {}) => {
  const bundle = read('bundle.js');
  const code = between(bundle, '// File: StoryStage.jsx', '// File: StoryChapters.jsx');
  assert.ok(code.includes('const StoryPinned'), 'build the current source before testing');
  const page = { queue: [], listeners: {}, observers: [], effects: [], views: [], refs: [], errors: [] };
  function Observer(callback) { this.callback = callback; this.disconnected = false; page.observers.push(this); }
  Observer.prototype.observe = function observe(target) { this.target = target; };
  Observer.prototype.disconnect = function disconnect() { this.disconnected = true; };
  const listen = scope => ({
    addEventListener: (name, fn, options) => { page.listeners[`${scope}:${name}`] = { fn, options }; },
    removeEventListener: name => { delete page.listeners[`${scope}:${name}`]; },
  });
  page.document = { hidden: false, ...listen('document') };
  page.scrolled = [];
  const context = {
    window: { devicePixelRatio: 3, matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }), ...listen('window') },
    document: page.document,
    console: { error: (...args) => page.errors.push(args) },
    IntersectionObserver: Observer,
    ResizeObserver: Observer,
    requestAnimationFrame: fn => { page.queue.push(fn); return page.queue.length; },
    cancelAnimationFrame: id => { page.queue[id - 1] = null; },
    React: { Fragment: 'Fragment', createElement: (type, props, ...children) => ({ type, props: props || {}, children }) },
    useRef: () => ({ current: page.refs.shift() }),
    useState: init => [typeof init === 'function' ? init() : init, value => page.views.push(value)],
    useEffect: fn => page.effects.push(fn),
    SITE_STORY,
    siteScrollTo: id => page.scrolled.push(id),
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  page.get = name => vm.runInContext(name, context);
  page.renderers = page.get('STORY_RENDERERS');
  page.flush = (time = 0) => { page.queue.splice(0).forEach(fn => fn && fn(time)); };
  page.fire = (name) => page.listeners[name].fn();
  return page;
};

// Starts the pinned stage with spy renderers. rect is the bounding rect of the story section.
const startPinned = () => {
  const page = fakePage();
  const draws = [];
  const rect = { top: 0, height: STORY_SCREENS * 800 };
  const ctx = { calls: [], restores: 0, setTransform(...args) { this.calls.push(args); }, clearRect() {}, save() {}, restore() { this.restores += 1; } };
  const canvas = { width: 0, height: 0, getContext: () => ctx };
  const layer = {};
  const fills = Array.from({ length: 6 }, () => ({ style: {} }));
  const section = { getBoundingClientRect: () => rect };
  page.refs.push({ clientWidth: 1200, clientHeight: 800 }, canvas, layer, { querySelectorAll: () => fills });
  for (const id of IDS) page.renderers[id] = { draw: (c, frame) => draws.push({ id, frame: plain(frame) }) };
  const element = page.get('StoryPinned')({ sectionRef: { current: section }, onNavigate: null });
  const cleanup = page.effects.shift()();
  const scrollTo = p => { rect.top = -p * (rect.height - 800); page.fire('window:scroll'); page.flush(); };
  return { page, draws, ctx, canvas, layer, fills, element, cleanup, scrollTo, section, rect };
};

test('the pinned stage draws once at the start, then only when the progress changes', () => {
  const { page, draws, ctx, canvas, fills, element, scrollTo } = startPinned();
  assert.equal(page.listeners['window:scroll'].options.passive, true, 'one passive scroll listener');
  assert.equal(element.props['data-chapter'], 'orbit');
  page.flush(16);
  assert.equal(draws.length, 1);
  assert.deepEqual(draws[0], { id: 'orbit', frame: { local: 0, p: 0, width: 1200, height: 800, dpr: 2, time: 16, reducedMotion: false } });
  assert.deepEqual([canvas.width, canvas.height], [2400, 1600], 'the canvas is sized with the pixel ratio (maximum 2)');
  assert.deepEqual(ctx.calls[0], [2, 0, 0, 2, 0, 0], 'the context is scaled by dpr before the renderer draws');
  assert.equal(ctx.restores, 1);

  scrollTo(0);
  assert.equal(draws.length, 1, 'a scroll event that does not move the story draws nothing');

  scrollTo(0.3);
  assert.equal(draws.length, 2);
  assert.equal(draws[1].id, 'rock');
  assert.ok(Math.abs(draws[1].frame.p - 0.3) < 1e-9 && Math.abs(draws[1].frame.local - 0.2222222) < 1e-6);
  assert.deepEqual(plain(page.views), [{ index: 2, caption: 0 }], 'React state changes with the chapter');
  assert.deepEqual(fills.map(fill => fill.style.transform.slice(0, 12)), ['scaleX(1)', 'scaleX(1)', 'scaleX(0.222', 'scaleX(0)', 'scaleX(0)', 'scaleX(0)']);

  scrollTo(0.31);
  assert.equal(draws.length, 3, 'the art follows every change of p');
  assert.equal(page.views.length, 1, 'React state does not change inside one chapter and caption');

  scrollTo(0.4);
  assert.deepEqual(plain(page.views[1]), { index: 2, caption: 1 }, 'the second caption of the chapter');
  scrollTo(1);
  assert.deepEqual(plain(page.views[2]), { index: 5, caption: 0 });
  assert.deepEqual(fills.map(fill => fill.style.transform), Array(6).fill('scaleX(1)'));
});

test('an animated renderer draws on each frame only while the stage is on screen and the tab is visible', () => {
  const { page, draws, section } = startPinned();
  page.renderers.orbit.animated = true;
  page.flush(0);
  page.flush(16);
  page.flush(32);
  assert.deepEqual(draws.map(draw => draw.frame.time), [0, 16, 32], 'one draw for each animation frame, with its time');
  const watcher = page.observers.find(observer => observer.target === section);
  watcher.callback([{ isIntersecting: false }]);
  page.flush(48);
  page.flush(64);
  assert.equal(draws.length, 3, 'no draw while the stage is off screen');
  assert.equal(page.queue.length, 0, 'and no animation frame is waiting');
  watcher.callback([{ isIntersecting: true }]);
  page.flush(80);
  page.flush(96);
  assert.equal(draws.length, 5, 'the loop starts again when the stage returns');
  page.document.hidden = true;
  page.flush(112);
  page.flush(128);
  assert.equal(draws.length, 5, 'no draw while the tab is hidden');
  assert.equal(page.queue.length, 0);
  page.document.hidden = false;
  page.fire('document:visibilitychange');
  page.flush(144);
  page.flush(160);
  assert.equal(draws.length, 7, 'the loop starts again when the tab is visible');
});

test('the layer of the live chapter mounts on arrival and unmounts on departure', () => {
  const { page, layer, cleanup, scrollTo } = startPinned();
  const mounted = [];
  const unmounted = [];
  page.renderers.live.mount = element => mounted.push(element);
  page.renderers.live.unmount = () => unmounted.push(true);
  scrollTo(0.5);
  assert.equal(mounted.length, 0, 'no mount before the chapter');
  scrollTo(0.85);
  scrollTo(1);
  assert.deepEqual([mounted.length, unmounted.length], [1, 0], 'one mount in the chapter');
  assert.equal(mounted[0], layer, 'the layer is the element of the stage');
  scrollTo(0.5);
  assert.deepEqual([mounted.length, unmounted.length], [1, 1], 'one unmount on the way out');
  scrollTo(0.9);
  cleanup();
  assert.deepEqual([mounted.length, unmounted.length], [2, 2], 'the unmount also runs when the story leaves the page');
});

test('a renderer that throws is reported once and the story goes on', () => {
  const { page, draws, ctx, scrollTo } = startPinned();
  page.renderers.rock.draw = () => { throw new Error('broken art'); };
  scrollTo(0.3);
  scrollTo(0.32);
  assert.equal(page.errors.length, 1, 'one report in the console');
  assert.equal(ctx.restores, 2, 'the context state is restored after each draw');
  scrollTo(0.5);
  assert.equal(draws[draws.length - 1].id, 'grid', 'the next chapter draws');
});

test('the listeners and observers are removed when the story unmounts', () => {
  const { page, draws, cleanup } = startPinned();
  page.flush();
  cleanup();
  assert.equal(page.listeners['window:scroll'], undefined);
  assert.equal(page.listeners['document:visibilitychange'], undefined);
  assert.ok(page.observers.every(observer => observer.disconnected));
  assert.equal(page.queue.length, 0, 'no animation frame is waiting');
  assert.equal(draws.length, 1);
});

const nodes = tree => {
  const found = [];
  const walk = node => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    found.push(node);
    walk(node.children);
  };
  walk(tree);
  return found;
};

test('the captions are real text in reading order, and the live links are real links', () => {
  const page = fakePage();
  const StoryWords = page.get('StoryWords');
  const chapters = plain(STORY_CHAPTERS);
  const captionsOf = (id, on, caption) => nodes(StoryWords({ chapter: chapters[IDS.indexOf(id)], on, caption, onNavigate: null }))
    .filter(node => node.type === 'p' && /story-caption/.test(node.props.className));
  const pinned = captionsOf('rock', true, 1);
  assert.deepEqual(pinned.map(node => node.props['data-on']), [false, true], 'one caption is on, both stay in the page');
  assert.deepEqual(captionsOf('rock', true, null).map(node => node.props['data-on']), [true, true], 'the static frame shows all captions');
  assert.deepEqual(captionsOf('rock', false, 0).map(node => node.props['data-on']), [false, false]);

  const orbit = nodes(StoryWords({ chapter: chapters[0], on: true, caption: 0, onNavigate: null }));
  const name = orbit.find(node => node.type === 'h1');
  assert.equal(name.children[0], SITE_STORY.name, 'the name is the h1');
  assert.ok(orbit.some(node => node.type === 'p' && /story-note/.test(node.props.className) && node.children[0] === SITE_STORY.ppm));

  const links = (on) => nodes(StoryWords({ chapter: chapters[5], on, caption: 0, onNavigate: null })).filter(node => node.type === 'a');
  assert.deepEqual(links(true).map(link => [link.props.href, link.children[0]]),
    [['./simulator.html', 'Open the simulator'], ['./index.html#research', 'Read my research']]);
  assert.ok(links(true).every(link => link.props.tabIndex === undefined), 'the links are in the tab order while the chapter is on');
  assert.ok(links(false).every(link => link.props.tabIndex === -1), 'and out of it when the chapter is off');
});

test('the skip control is a real link to #research and a plain click uses the page helper', () => {
  for (const withHelper of [true, false]) {
    const page = fakePage();
    page.refs.push({});
    const calls = [];
    const onNavigate = withHelper ? (id, event) => calls.push([id, event]) : null;
    const section = page.get('StoryStage')({ onNavigate });
    const skip = nodes(section).find(node => node.type === 'a' && node.props.className === 'story-skip');
    assert.equal(skip.props.href, '#research');
    assert.equal(skip.children[0], 'Skip to research');
    let prevented = 0;
    const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, preventDefault: () => { prevented += 1; } };
    skip.props.onClick(click);
    if (withHelper) {
      assert.deepEqual([calls.length, calls[0][0], calls[0][1] === click], [1, 'research', true], 'the header helper gets the click');
    } else {
      assert.deepEqual([page.scrolled, prevented], [['research'], 1], 'siteScrollTo runs and the browser jump is stopped');
      skip.props.onClick({ ...click, ctrlKey: true });
      assert.deepEqual([page.scrolled.length, prevented], [1, 1], 'a ctrl-click keeps the link');
    }
  }
});

test('the pinned story is 7 screens tall; reduced motion gives six static frames drawn once with local = 1', () => {
  const pinned = fakePage();
  pinned.refs.push({});
  const pinnedSection = pinned.get('StoryStage')({});
  assert.equal(pinnedSection.type, 'section');
  assert.equal(pinnedSection.props.id, 'story');
  assert.equal(pinnedSection.props.className, 'story story--pinned');
  assert.equal(pinnedSection.props.style['--story-screens'], STORY_SCREENS);
  assert.ok(nodes(pinnedSection).some(node => node.type === pinned.get('StoryPinned')));

  const page = fakePage({ reduced: true });
  page.refs.push({});
  const section = page.get('StoryStage')({});
  assert.equal(section.props.className, 'story story--static');
  assert.equal(section.props.style, undefined);
  const StoryFrame = page.get('StoryFrame');
  const frames = nodes(section).filter(node => node.type === StoryFrame);
  assert.deepEqual(frames.map(frame => frame.props.chapter.id), IDS);
  assert.ok(!nodes(section).some(node => node.type === page.get('StoryPinned')), 'no sticky stage');

  const draws = [];
  const ctx = { setTransform() {}, clearRect() {}, save() {}, restore() {} };
  const canvas = { width: 0, height: 0, getContext: () => ctx };
  for (const id of IDS) page.renderers[id] = { draw: (c, frame) => draws.push({ id, frame: plain(frame) }) };
  page.refs.push({ clientWidth: 1000, clientHeight: 562.5 }, canvas);
  const frame = StoryFrame({ chapter: frames[2].props.chapter, onNavigate: null });
  page.effects.pop()();
  assert.equal(draws.length, 1, 'drawn once');
  assert.deepEqual(draws[0], { id: 'rock', frame: { local: 1, p: 0.44, width: 1000, height: 562.5, dpr: 2, time: 0, reducedMotion: true } });
  assert.equal(frame.props.role, 'group');
  assert.equal(frame.props['aria-label'], 'Into the rock');
  assert.ok(nodes(frame).some(node => node.type === 'canvas' && node.props['aria-hidden'] === 'true'), 'the canvas is hidden from assistive technology');
});

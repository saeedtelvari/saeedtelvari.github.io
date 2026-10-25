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
  '\nreturn { STORY_SCREENS, STORY_CHAPTERS, STORY_CAPTION_COUNT, STORY_COLORS, STORY_COUNT_MS, STORY_EXIT_SPAN, storyProgress, storyChapterAt, storyCaptionIndex, storyRail, storyInline, storyCount, storyExit };')();
const { STORY_SCREENS, STORY_CHAPTERS, STORY_CAPTION_COUNT, STORY_COLORS, STORY_COUNT_MS, STORY_EXIT_SPAN, storyProgress, storyChapterAt, storyCaptionIndex, storyRail, storyInline, storyCount, storyExit } = helpers;
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

test('the exit is 0 while the stage is pinned, grows as the story leaves and ends at 1', () => {
  const viewport = 800;
  const span = viewport * STORY_EXIT_SPAN;
  assert.equal(storyExit({ bottom: 7 * viewport, viewport }), 0, 'at the top of the story');
  assert.equal(storyExit({ bottom: viewport + 1, viewport }), 0, 'pinned: the bottom is below the viewport');
  assert.equal(storyExit({ bottom: viewport, viewport }), 0, 'the last pinned pixel');
  assert.ok(Math.abs(storyExit({ bottom: viewport - span / 2, viewport }) - 0.5) < 1e-12, 'half of the fade');
  assert.equal(storyExit({ bottom: viewport - span, viewport }), 1, 'the fade ends');
  assert.equal(storyExit({ bottom: 0, viewport }), 1, 'the story is gone');
  assert.equal(storyExit({ bottom: -3000, viewport }), 1, 'far below the story');
  assert.equal(storyExit({ bottom: NaN, viewport }), 0);
  assert.equal(storyExit({ bottom: 100, viewport: 0 }), 0, 'no viewport, no fade');
  let last = 0;
  for (let bottom = 2 * viewport; bottom >= -100; bottom -= 5) {
    const exit = storyExit({ bottom, viewport });
    assert.ok(exit >= last && exit >= 0 && exit <= 1, 'the exit never goes back while the visitor scrolls on');
    last = exit;
  }
  // The pinned scroll range never reaches the fade: progress 1 is the last pinned pixel.
  const height = STORY_SCREENS * viewport;
  assert.equal(storyProgress({ top: viewport - height, height, viewport }), 1, 'the story is at its end when the bottom meets the viewport');
  assert.equal(storyExit({ bottom: viewport, viewport }), 0, 'and the exit has not started');
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
  // The storyboard is a mockup. It keeps the first sentence of the ppm line and a placeholder for the value.
  // The page takes the value from SITE_STORY.co2, so only the first sentence must match word for word.
  const boardPpm = board.match(/<p class="ppm">([^<]+)<\/p>/)[1];
  const firstSentence = '280 ppm in 1850.';
  assert.ok(boardPpm.startsWith(`${firstSentence} `), 'the storyboard has the first sentence of the ppm line');
  assert.ok(SITE_STORY.ppm.startsWith(`${firstSentence} `), 'and the page has it too');
  assert.equal(board.match(/<p class="name">([^<]+)<\/p>/)[1], SITE_STORY.name.replace('’', "'"), 'the name matches the storyboard');
  assert.ok(read(specFile).includes('`280 ppm in 1850. {value} ppm in {year}.`'), 'the spec gives the form of the ppm line');
});

test('the ppm value of chapter 0 is stored with its year and its NOAA source, and the line is made from it', () => {
  const { co2 } = SITE_STORY;
  assert.ok(Number.isFinite(co2.value), 'the value is a number');
  assert.ok(co2.value > 400 && co2.value < 500, `the value is between 400 and 500 (${co2.value})`);
  assert.ok(Number.isInteger(co2.year) && co2.year >= 2024, `the year is 2024 or later (${co2.year})`);
  assert.ok(co2.year <= new Date().getFullYear() - 1, 'the year is a complete year');
  assert.equal(Math.round(co2.value * 100) / 100, co2.value, 'the value has two decimals at most, as in the NOAA file');
  assert.deepEqual([co2.base, co2.baseYear], [280, 1850]);
  assert.match(co2.source, /NOAA/);
  assert.match(co2.source, /Mauna Loa/);
  assert.equal(co2.url, 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt');
  assert.equal(SITE_STORY.ppm, `280 ppm in 1850. ${Math.round(co2.value)} ppm in ${co2.year}.`, 'the line is "280 ppm in 1850. {value} ppm in {year}."');
  assert.doesNotMatch(SITE_STORY.ppm, /\d\.\d/, 'the value on the line is a whole number');
  // The first caption says "more than 420 ppm". The stored value must keep that sentence true.
  const claim = SITE_STORY.captions.orbit[0].match(/more than (\d+) ppm/i);
  assert.ok(claim, 'the first caption names a limit');
  assert.ok(co2.value > Number(claim[1]), `${co2.value} ppm is more than ${claim[1]} ppm`);
  const file = 'docs/superpowers/specs/2026-10-25-homepage-story-design.md';
  if (fs.existsSync(path.join(root, file))) {
    const spec = read(file);
    assert.ok(spec.includes('SITE_STORY.co2') && spec.includes(co2.url), 'the spec tells how to update the value');
  }
});

test('the ppm count goes from 280 to the value in 1.2 seconds with an ease-out curve', () => {
  const end = Math.round(SITE_STORY.co2.value);
  assert.equal(STORY_COUNT_MS, 1200);
  assert.equal(storyCount(0, 280, end), 280, 'it starts at 280');
  assert.equal(storyCount(-50, 280, end), 280, 'a time before the start gives 280');
  assert.equal(storyCount(STORY_COUNT_MS, 280, end), end, 'it ends at the value');
  assert.equal(storyCount(STORY_COUNT_MS * 5, 280, end), end, 'it stays at the value');
  assert.equal(storyCount(NaN, 280, end), 280);
  let last = 280;
  for (let ms = 0; ms <= STORY_COUNT_MS; ms += 8) {
    const value = storyCount(ms, 280, end);
    assert.ok(Number.isInteger(value), 'a whole number');
    assert.ok(value >= last && value <= end, `the number only goes up, to the value (${value} at ${ms} ms)`);
    last = value;
  }
  const half = storyCount(STORY_COUNT_MS / 2, 280, end);
  assert.ok(half - 280 > (end - 280) / 2, `ease-out: more than half of the way at half of the time (${half})`);
  assert.ok(storyCount(STORY_COUNT_MS * 0.1, 280, end) > 280, 'the number moves at once');
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
  const page = { queue: [], listeners: {}, observers: [], effects: [], views: [], refs: [], errors: [], slots: [], slot: 0 };
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
    // A state slot keeps its value. page.render starts a new render of a component at slot 0.
    useState: init => {
      const slot = page.slot++;
      if (!(slot in page.slots)) page.slots[slot] = typeof init === 'function' ? init() : init;
      return [page.slots[slot], value => { page.slots[slot] = value; page.views.push(value); }];
    },
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
  page.render = (component, props) => { page.slot = 0; page.effects.length = 0; return component(props); };
  return page;
};

// Starts the pinned stage with spy renderers. rect is the bounding rect of the story section.
const startPinned = () => {
  const page = fakePage();
  const draws = [];
  const frames = [];
  const rect = { top: 0, height: STORY_SCREENS * 800 };
  const ctx = { calls: [], restores: 0, setTransform(...args) { this.calls.push(args); }, clearRect() {}, save() {}, restore() { this.restores += 1; } };
  const canvas = { width: 0, height: 0, getContext: () => ctx };
  const layer = {};
  const fills = Array.from({ length: 6 }, () => ({ style: {} }));
  const section = { getBoundingClientRect: () => rect };
  const rail = { style: { opacity: '', visibility: '' }, querySelectorAll: () => fills };
  const skip = { style: { opacity: '', visibility: '' } };
  page.refs.push({ clientWidth: 1200, clientHeight: 800 }, canvas, layer, rail, skip);
  // draws keeps a plain copy of each frame. frames keeps the frame objects, with their requestDraw function.
  for (const id of IDS) page.renderers[id] = { draw: (c, frame) => { draws.push({ id, frame: plain(frame) }); frames.push(frame); } };
  const element = page.get('StoryPinned')({ sectionRef: { current: section }, onNavigate: null });
  const cleanup = page.effects.shift()();
  const scrollTo = p => { rect.top = -p * (rect.height - 800); page.fire('window:scroll'); page.flush(); };
  return { page, draws, frames, ctx, canvas, layer, fills, rail, skip, element, cleanup, scrollTo, section, rect };
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

test('requestDraw: one draw of the current chapter on the next animation frame, and calls in one frame make one draw', () => {
  const { page, draws, frames, scrollTo } = startPinned();
  page.flush(16);
  assert.equal(draws.length, 1);
  const { requestDraw } = frames[0];
  assert.equal(typeof requestDraw, 'function', 'each frame has requestDraw');
  assert.equal(page.queue.length, 0, 'no animation frame is waiting before the call');

  requestDraw();
  requestDraw();
  requestDraw();
  assert.equal(draws.length, 1, 'no draw at once');
  assert.equal(page.queue.length, 1, 'one animation frame is waiting');
  page.flush(32);
  assert.equal(draws.length, 2, 'the three calls make one draw');
  assert.deepEqual([draws[1].id, draws[1].frame.time, draws[1].frame.local], ['orbit', 32, 0]);
  page.flush(48);
  assert.equal(draws.length, 2, 'and the stage does not draw again');
  assert.equal(page.queue.length, 0);

  // It is one function for the whole stage, and it draws the chapter that is current.
  scrollTo(0.3);
  assert.equal(frames[frames.length - 1].requestDraw, requestDraw, 'the same function in each frame');
  const before = draws.length;
  requestDraw();
  page.flush(64);
  assert.equal(draws.length, before + 1);
  assert.equal(draws[draws.length - 1].id, 'rock', 'the current chapter, not the chapter of the frame that gave the function');
  assert.ok(Math.abs(draws[draws.length - 1].frame.p - 0.3) < 1e-9, 'with the progress of the page now');
});

test('requestDraw draws nothing while the stage is off screen or the tab is hidden, and the stage keeps the request', () => {
  const { page, draws, frames, section } = startPinned();
  page.flush(0);
  const { requestDraw } = frames[0];
  const watcher = page.observers.find(observer => observer.target === section);
  watcher.callback([{ isIntersecting: false }]);
  requestDraw();
  assert.equal(page.queue.length, 0, 'off screen: no animation frame is waiting');
  page.flush(16);
  assert.equal(draws.length, 1, 'off screen: no draw');
  watcher.callback([{ isIntersecting: true }]);
  page.flush(32);
  assert.equal(draws.length, 2, 'back on screen: one draw, for the request and for the return together');
  page.flush(48);
  assert.equal(draws.length, 2);

  page.document.hidden = true;
  requestDraw();
  assert.equal(page.queue.length, 0, 'hidden tab: no animation frame is waiting');
  page.flush(64);
  assert.equal(draws.length, 2, 'hidden tab: no draw');
  page.document.hidden = false;
  page.fire('document:visibilitychange');
  page.flush(80);
  assert.equal(draws.length, 3, 'the request waited, so the tab draws once when it is visible again');
  page.flush(96);
  assert.equal(draws.length, 3);
  assert.equal(page.queue.length, 0, 'and no loop starts');
});

test('requestDraw inside draw() gives one more draw on the following frame, and nothing after the stage unmounts', () => {
  const { page, draws, cleanup } = startPinned();
  let asks = 1;
  let keep = null;
  page.renderers.orbit = {
    draw: (c, frame) => {
      draws.push({ id: 'orbit', frame: plain(frame) });
      keep = frame.requestDraw;
      if (asks-- > 0) frame.requestDraw();
    },
  };
  page.flush(0);
  assert.equal(draws.length, 1);
  assert.equal(page.queue.length, 1, 'the call inside draw() waits for the following frame');
  page.flush(16);
  assert.equal(draws.length, 2);
  assert.equal(page.queue.length, 0, 'the chain stops when the renderer stops asking');
  keep();
  cleanup();
  page.flush(32);
  assert.equal(draws.length, 2, 'no draw after the stage unmounted');
  keep();
  assert.equal(page.queue.length, 0, 'and no animation frame for a late call');
});

test('animated is read after each draw: a renderer that turns it on in draw() runs on the next frame with no event', () => {
  const { page, draws, scrollTo } = startPinned();
  const entry = {
    count: 0,
    animated: false,
    draw() { draws.push('draw'); this.animated = ++this.count < 3; },
  };
  page.renderers.orbit = entry;
  page.flush(0);
  assert.equal(page.queue.length, 1, 'the first draw turned animated on, so a frame is waiting');
  page.flush(16);
  assert.equal(page.queue.length, 1);
  page.flush(32);
  assert.equal(entry.animated, false);
  assert.equal(page.queue.length, 0, 'the third draw turned it off: the loop ends');
  assert.equal(draws.length, 3);
  page.flush(48);
  assert.equal(draws.length, 3);

  // A getter works in the same way. It is true after the draw that sets the flag behind it.
  let on = false;
  const second = { get animated() { return on; }, draw() { draws.push('getter'); on = !on && draws.length < 8; } };
  page.renderers.rock = second;
  scrollTo(0.3);
  assert.equal(page.queue.length, 1, 'the getter was true after the first draw');
  page.flush(64);
  assert.equal(page.queue.length, 0, 'and false after the second');
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

test('the rail fades out and the skip link hides when the stage starts to leave, and nothing changes while it is pinned', () => {
  const { page, skip, rail, rect, cleanup, scrollTo } = startPinned();
  page.flush(0);
  const clear = element => [element.style.opacity, element.style.visibility];
  assert.deepEqual([clear(skip), clear(rail)], [['', ''], ['', '']], 'untouched at the start');
  const writes = [];
  for (const element of [skip, rail]) {
    let opacity = element.style.opacity;
    let visibility = element.style.visibility;
    Object.defineProperties(element.style, {
      opacity: { get: () => opacity, set: value => { opacity = value; writes.push('opacity'); }, enumerable: true },
      visibility: { get: () => visibility, set: value => { visibility = value; writes.push('visibility'); }, enumerable: true },
    });
  }
  // The whole pinned range, from the first to the last pixel: nothing is written.
  for (const p of [0.1, 0.3, 0.55, 0.8, 0.99, 1]) {
    scrollTo(p);
    assert.deepEqual([clear(skip), clear(rail)], [['', ''], ['', '']], `pinned at ${p}`);
  }
  assert.equal(writes.length, 0, 'no style write while the stage is pinned');

  // The stage leaves: the bottom of the story rises above the bottom of the viewport (800 px). The fade is 160 px long.
  const leave = pixels => { rect.top = -(rect.height - 800) - pixels; page.fire('window:scroll'); page.flush(); };
  leave(16);
  assert.deepEqual(clear(rail), ['0.9', ''], 'a tenth of the fade: 16 of 160 px');
  assert.deepEqual(clear(skip), ['', ''], 'the skip link never fades: a half-clear link has too little contrast');
  leave(80);
  assert.deepEqual(clear(rail), ['0.5', '']);
  assert.deepEqual(clear(skip), ['', '']);
  leave(160);
  assert.deepEqual(clear(rail), ['0', 'hidden'], 'the rail is gone at the end of the fade');
  assert.deepEqual(clear(skip), ['', 'hidden'], 'the skip link is hidden, so the keyboard cannot reach it off screen');
  leave(2000);
  assert.deepEqual([clear(skip), clear(rail)], [['', 'hidden'], ['0', 'hidden']], 'and both stay hidden below the story');
  writes.length = 0;
  leave(2400);
  assert.equal(writes.length, 0, 'no write when nothing changes');

  // The visitor scrolls back up: both come back.
  leave(80);
  assert.deepEqual([clear(skip), clear(rail)], [['', ''], ['0.5', '']]);
  scrollTo(1);
  assert.deepEqual([clear(skip), clear(rail)], [['', ''], ['', '']], 'back in the pinned range');
  leave(100);
  cleanup();
  assert.deepEqual([clear(skip), clear(rail)], [['', ''], ['', '']], 'the unmount restores both');
});

test('the skip link is in the pinned stage, so it rides up with the stage; the static frames keep it sticky', () => {
  const page = fakePage();
  const element = page.get('StoryPinned')({ sectionRef: { current: null }, onNavigate: null });
  const wrap = nodes(element).find(node => node.props && node.props.className === 'story-skip-wrap story-skip-wrap--stage');
  assert.ok(wrap, 'the wrap is inside the stage');
  assert.equal(wrap.children[0].type, page.get('StorySkip'));
  const stageChildren = element.children.filter(Boolean);
  assert.equal(stageChildren[0], wrap, 'it is the first child of the stage, so the keyboard reaches it first');
  const css = read('colors_and_type.css');
  const rule = css.slice(css.indexOf('.story-skip-wrap--stage {'), css.indexOf('}', css.indexOf('.story-skip-wrap--stage {')));
  assert.match(rule, /position: absolute/, 'in the stage it is not sticky');

  const reduced = fakePage({ reduced: true });
  reduced.refs.push({});
  const section = reduced.get('StoryStage')({});
  const staticWrap = nodes(section).find(node => node.props && node.props.className === 'story-skip-wrap');
  assert.ok(staticWrap, 'the static frames have the sticky wrap');
  assert.equal(staticWrap.children[0].type, reduced.get('StorySkip'));
});

test('the fade needs no reduced-motion rule: it has no transition, and the static layout never runs it', () => {
  const css = read('colors_and_type.css');
  for (const selector of ['.story-skip-wrap', '.story-rail']) {
    const open = css.indexOf(`${selector} {`);
    assert.ok(open >= 0, selector);
    assert.doesNotMatch(css.slice(open, css.indexOf('}', open)), /transition|animation|opacity/, `${selector} has no timer`);
  }
  const source = read('StoryStage.jsx');
  const staticPart = source.slice(source.indexOf('const StoryFrame'), source.indexOf('const StoryStage'));
  assert.doesNotMatch(staticPart, /storyExit|storyLeave/, 'the static frames of reduced motion do not fade anything');
  assert.match(source, /reduced\s*\n?\s*\?\s*\(/, 'reduced motion shows the static frames, not the pinned stage');
  assert.match(source, /: <StoryPinned sectionRef=\{sectionRef\} onNavigate=\{onNavigate\} \/>/);
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
  assert.ok(orbit.some(node => node.type === page.get('StoryPpm') && node.props.on === true), 'the ppm line is its own component');
  assert.ok(!nodes(StoryWords({ chapter: chapters[1], on: true, caption: 0, onNavigate: null })).some(node => node.type === page.get('StoryPpm')), 'only the orbit has it');

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
    const skip = page.get('StorySkip')({ onNavigate });
    assert.equal(skip.props.className, 'story-skip');
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

test('requestDraw in a static frame paints that canvas again on the next animation frame; calls in one frame make one paint', () => {
  const page = fakePage({ reduced: true });
  const StoryFrame = page.get('StoryFrame');
  const chapter = plain(STORY_CHAPTERS[2]);
  const painted = [];
  const ctx = { setTransform() {}, clearRect() {}, save() {}, restore() {} };
  const canvas = { width: 0, height: 0, getContext: () => ctx };
  for (const id of IDS) page.renderers[id] = { draw: (c, frame) => painted.push({ id, frame }) };
  page.refs.push({ clientWidth: 1000, clientHeight: 562.5 }, canvas);
  StoryFrame({ chapter, onNavigate: null });
  const cleanup = page.effects.pop()();
  assert.equal(painted.length, 1, 'painted once at the start');
  const { requestDraw } = painted[0].frame;
  assert.equal(typeof requestDraw, 'function', 'a static frame has requestDraw');
  assert.equal(page.queue.length, 0, 'no animation frame is waiting');

  canvas.width = 5;
  requestDraw();
  requestDraw();
  assert.equal(painted.length, 1, 'no paint at once');
  assert.equal(page.queue.length, 1, 'one animation frame is waiting');
  page.flush(16);
  assert.equal(painted.length, 2, 'the two calls make one paint');
  assert.equal(canvas.width, 2000, 'the canvas has its size again, so the old picture is gone');
  assert.deepEqual(plain(painted[1].frame), { local: 1, p: 0.44, width: 1000, height: 562.5, dpr: 2, time: 0, reducedMotion: true });
  assert.equal(painted[1].frame.requestDraw, requestDraw, 'the same function in each paint');
  page.flush(32);
  assert.equal(painted.length, 2, 'no more paints');

  // A call that waits is cancelled when the frame leaves the page, and a late call does nothing.
  requestDraw();
  cleanup();
  page.flush(48);
  assert.equal(painted.length, 2, 'the queued paint was cancelled');
  requestDraw();
  assert.equal(page.queue.length, 0, 'and a new call after the cleanup asks for no frame');
});

test('no renderer uses a synthetic event, and the renderers and the stage use requestDraw', () => {
  const bundle = read('bundle.js');
  assert.ok(bundle.includes('requestDraw'), 'build the current source before testing');
  for (const file of ['StoryStage.jsx', 'StoryEarth.jsx', 'StoryRock.jsx', 'StoryBlock.jsx']) {
    assert.doesNotMatch(read(file), /dispatchEvent|new Event\(/, `${file} sends no synthetic event`);
  }
  for (const file of ['StoryEarth.jsx', 'StoryRock.jsx', 'StoryBlock.jsx']) {
    assert.match(read(file), /requestDraw/, `${file} asks the stage for a draw`);
  }
  assert.match(read('StoryStage.jsx'), /requestDraw\(\) asks for one more draw/, 'the API comment describes it');
});

// ---- the ppm line

// The text of a rendered node. skip says which elements a reader leaves out.
const textOf = (node, skip) => {
  if (Array.isArray(node)) return node.map(item => textOf(item, skip)).join('');
  if (node === null || node === undefined || node === false) return '';
  if (typeof node !== 'object') return String(node);
  if (skip(node)) return '';
  return textOf(node.children, skip);
};
const heard = node => textOf(node, item => item.props && item.props['aria-hidden'] === 'true');
const seen = node => textOf(node, item => item.props && /visually-hidden/.test(item.props.className || ''));

test('the ppm line counts from 280 to the value once; a screen reader gets the final line', () => {
  const page = fakePage();
  const StoryPpm = page.get('StoryPpm');
  const end = Math.round(SITE_STORY.co2.value);
  const first = page.render(StoryPpm, { on: true });
  assert.equal(first.type, 'p');
  assert.match(first.props.className, /story-note/);
  assert.equal(first.props['data-on'], true);
  assert.equal(seen(first), `280 ppm in 1850. 280 ppm in ${SITE_STORY.co2.year}.`, 'the page loads with 280 on the line');
  assert.equal(heard(first), SITE_STORY.ppm, 'a screen reader gets the final line, not the counting number');
  const counter = nodes(first).find(node => node.type === 'span' && node.props['aria-hidden'] === 'true');
  assert.ok(counter && /story-count/.test(counter.props.className), 'the counting number is aria-hidden');
  assert.equal(page.render(StoryPpm, { on: false }).props['data-on'], false);

  page.render(StoryPpm, { on: true });
  assert.equal(page.effects.length, 2, 'the reduced-motion query and the count');
  assert.equal(page.queue.length, 0);
  page.effects[1]();
  assert.equal(page.queue.length, 1, 'the count starts with an animation frame');
  const values = [];
  for (let ms = 0; ms < STORY_COUNT_MS; ms += 100) {
    page.flush(5000 + ms);
    assert.equal(page.queue.length, 1, `still counting at ${ms} ms`);
    values.push(page.slots[1]);
  }
  assert.deepEqual(values, [...values].sort((a, b) => a - b), 'the number only goes up');
  assert.ok(values.every(value => Number.isInteger(value) && value >= 280 && value <= end));
  assert.ok(values[values.length - 1] > 280, 'and it moves');
  const middle = page.render(StoryPpm, { on: true });
  assert.equal(seen(middle), `280 ppm in 1850. ${page.slots[1]} ppm in ${SITE_STORY.co2.year}.`, 'the counting number is on the line');
  assert.equal(heard(middle), SITE_STORY.ppm);
  page.flush(5000 + STORY_COUNT_MS + 16);
  assert.equal(page.queue.length, 0, 'the count ends after 1.2 s and asks for no more frames');
  assert.equal(page.slots[1], end);
  assert.equal(page.get('storyPpmPlayed').done, true);

  const rest = page.render(StoryPpm, { on: true });
  assert.deepEqual(rest.children, [SITE_STORY.ppm], 'at rest the line is plain text: "280 ppm in 1850. 427 ppm in 2025."');

  // A new mount, for example after the layout changes, shows the final line and does not count again.
  page.slots.length = 0;
  const again = page.render(StoryPpm, { on: true });
  assert.deepEqual(again.children, [SITE_STORY.ppm]);
  assert.equal(page.effects[1](), undefined);
  assert.equal(page.queue.length, 0);
});

test('the ppm count stops when the line leaves the page, and it starts again at the next mount', () => {
  const page = fakePage();
  const StoryPpm = page.get('StoryPpm');
  page.render(StoryPpm, { on: true });
  const stop = page.effects[1]();
  assert.equal(page.queue.length, 1);
  stop();
  page.flush(1000);
  assert.equal(page.views.length, 0, 'the count did not move after the cleanup');
  assert.equal(page.get('storyPpmPlayed').done, false, 'and it is not marked as played');
  page.slots.length = 0;
  const line = page.render(StoryPpm, { on: true });
  assert.equal(seen(line), `280 ppm in 1850. 280 ppm in ${SITE_STORY.co2.year}.`, 'the next mount counts from 280');
});

test('under reduced motion the ppm line shows the final value at once and nothing counts', () => {
  const page = fakePage({ reduced: true });
  const line = page.render(page.get('StoryPpm'), { on: true });
  assert.deepEqual(line.children, [SITE_STORY.ppm]);
  assert.equal(page.effects[1](), undefined, 'the count effect does nothing');
  assert.equal(page.queue.length, 0, 'no animation frame');
  assert.equal(page.get('storyPpmPlayed').done, false);
});

test('the count-up needs one CSS rule, at the end of the file, with digits of equal width', () => {
  const css = read('colors_and_type.css');
  assert.match(css.slice(css.lastIndexOf('Story block controls')), /\.story-count \{ font-variant-numeric: tabular-nums; \}/);
  assert.match(css, /\.visually-hidden \{[^}]*clip: rect\(0 0 0 0\)/, 'the hidden copy uses the site class');
});

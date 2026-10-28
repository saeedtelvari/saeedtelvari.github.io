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
  '\nreturn { STORY_SCREENS, STORY_CHAPTERS, STORY_DURATIONS, STORY_CAPTION_COUNT, STORY_COLORS, STORY_COUNT_MS, STORY_EXIT_SPAN, STORY_SETTLE_MS, STORY_SETTLE_SAFETY_MS, STORY_MAX_STEP_MS, STORY_REST_TOLERANCE, storyRestAt, storyWheelTarget, storyPosition, storyStageAt, storyDuration, storyEase, storyLocal, storyP, storyCaptionIndex, storyPlay, storyEnd, storyMove, storySettle, storyAdvance, storyRail, storyInline, storyCount, storyExit };')();
const { STORY_SCREENS, STORY_CHAPTERS, STORY_DURATIONS, STORY_CAPTION_COUNT, STORY_COLORS, STORY_COUNT_MS, STORY_EXIT_SPAN, STORY_SETTLE_MS, STORY_SETTLE_SAFETY_MS, STORY_MAX_STEP_MS, STORY_REST_TOLERANCE, storyRestAt, storyWheelTarget, storyPosition, storyStageAt, storyDuration, storyEase, storyLocal, storyP, storyCaptionIndex, storyPlay, storyEnd, storyMove, storySettle, storyAdvance, storyRail, storyInline, storyCount, storyExit } = helpers;
const IDS = ['orbit', 'descent', 'rock', 'grid', 've', 'live'];
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-9, `${message || 'close'}: ${a} and ${b}`);

test('the six stages follow the six chapters, and each stage owns one screen of scroll', () => {
  assert.equal(STORY_SCREENS, 6);
  assert.deepEqual(STORY_CHAPTERS.map(chapter => chapter.id), IDS);
  STORY_CHAPTERS.forEach((chapter, i) => {
    assert.ok(chapter.title, `${chapter.id} has a title`);
    near(chapter.from, i / 6, `${chapter.id} starts at its sixth`);
    near(chapter.to, (i + 1) / 6, `${chapter.id} ends at its sixth`);
  });
  assert.equal(STORY_CHAPTERS[5].to, 1);
  assert.deepEqual(Object.keys(STORY_CAPTION_COUNT), IDS);
});

test('the duration table: one number of seconds for each stage, and none for live', () => {
  assert.deepEqual(plain(STORY_DURATIONS), { orbit: 5, descent: 7, rock: 8, grid: 9, ve: 7, live: 0 });
  assert.deepEqual(Object.keys(STORY_DURATIONS), IDS, 'the table has the order of the stages');
  assert.deepEqual(IDS.map(storyDuration), [5000, 7000, 8000, 9000, 7000, 0], 'the play time in milliseconds');
  assert.equal(storyDuration('nobody'), 0, 'an unknown stage does not play');
  const page = fakePage();
  assert.equal(page.get('window').STORY_DURATIONS, page.get('STORY_DURATIONS'), 'the table is exported on window, so it is easy to tune');
});

test('the scroll position in screens gives the stage that is nearest to it', () => {
  assert.equal(storyPosition({ top: 0, viewport: 800 }), 0);
  assert.equal(storyPosition({ top: -2400, viewport: 800 }), 3);
  assert.equal(storyPosition({ top: 300, viewport: 800 }), -0.375, 'before the story');
  assert.equal(storyPosition({ top: -100, viewport: 0 }), 0, 'no screen, no position');
  assert.equal(storyPosition({ top: NaN, viewport: 800 }), 0);
  assert.deepEqual([-2, 0, 0.49, 0.5, 1.2, 2.5, 4.49, 5, 5.9, 12, NaN].map(storyStageAt), [0, 0, 0, 1, 1, 3, 4, 5, 5, 5, 0]);
  for (let stage = 0; stage < 6; stage += 1) {
    assert.equal(storyStageAt(stage), stage, 'a snap point is its own stage');
    assert.equal(storyStageAt(stage + 0.49), stage, 'the stage owns the screen around its snap point');
    assert.equal(storyStageAt(stage - 0.49), stage);
  }
});

test('the ease is gentle: slow at both ends, the same at the middle, and it never goes back', () => {
  assert.equal(storyEase(0), 0);
  assert.equal(storyEase(1), 1);
  near(storyEase(0.5), 0.5, 'the middle');
  assert.equal(storyEase(-3), 0);
  assert.equal(storyEase(3), 1);
  assert.equal(storyEase(NaN), 0);
  assert.ok(storyEase(0.05) < 0.05 && storyEase(0.95) > 0.95, 'slow start, slow end');
  assert.ok(storyEase(0.1) < 0.03, 'it starts gently');
  let last = 0;
  for (let t = 0; t <= 1.0000001; t += 0.001) {
    const value = storyEase(t);
    assert.ok(value >= last, 'the ease only grows');
    assert.ok(value - last < 0.0035, 'and it has no jump: the steepest part is about 1.57 times the average speed');
    near(storyEase(t) + storyEase(1 - t), 1, 'the curve is symmetric');
    last = value;
  }
});

test('local follows the play time of the stage; live has no time and is always at its end', () => {
  for (const id of ['orbit', 'descent', 'rock', 'grid', 've']) {
    const total = STORY_DURATIONS[id] * 1000;
    assert.equal(storyLocal(id, 0), 0, `${id} starts at 0`);
    near(storyLocal(id, total / 2), 0.5, `${id} is at the middle at half of its time`);
    assert.equal(storyLocal(id, total), 1, `${id} ends at 1 after ${STORY_DURATIONS[id]} s`);
    assert.equal(storyLocal(id, total * 3), 1, `${id} stays at 1`);
    assert.ok(storyLocal(id, total * 0.9) < 1, `${id} is not done at nine tenths`);
  }
  assert.equal(storyLocal('live', 0), 1);
  assert.equal(storyLocal('live', 5000), 1);
  near(storyP(0, 0), 0, 'p at the start of the story');
  near(storyP(2, 0.5), 2.5 / 6, 'p is (stage + local) / 6');
  near(storyP(5, 1), 1, 'p at the end of the story');
  near(storyP(3, 7), 4 / 6, 'local is clamped');
});

test('rock shows no caption until the cutaway clears the caption area, and switches at the bottom of the well', () => {
  assert.equal(storyCaptionIndex('rock', 0), -1);
  assert.equal(storyCaptionIndex('rock', 0.09), -1);
  assert.equal(storyCaptionIndex('rock', 0.1), 0);
  assert.equal(storyCaptionIndex('rock', 0.64), 0);
  assert.equal(storyCaptionIndex('rock', 0.65), 1);
  assert.equal(storyCaptionIndex('rock', 1), 1);
});

test('chapters with two captions switch at half of the playback; the others keep caption 0', () => {
  for (const id of ['grid', 've']) {
    assert.equal(storyCaptionIndex(id, 0), 0, id);
    assert.equal(storyCaptionIndex(id, 0.49), 0, id);
    assert.equal(storyCaptionIndex(id, 0.5), 1, id);
    assert.equal(storyCaptionIndex(id, 1), 1, id);
    const total = STORY_DURATIONS[id] * 1000;
    assert.equal(storyCaptionIndex(id, storyLocal(id, total * 0.49)), 0, `${id}: before half of the time`);
    assert.equal(storyCaptionIndex(id, storyLocal(id, total * 0.51)), 1, `${id}: after half of the time`);
  }
  for (const id of ['orbit', 'descent', 'live']) {
    for (const local of [0, 0.5, 0.99, 1]) assert.equal(storyCaptionIndex(id, local), 0, `${id} at ${local}`);
  }
});

test('the progress rail: stages before the current stage are full, the current stage fills with its local, the rest are empty', () => {
  assert.deepEqual(storyRail(0, 0), [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(storyRail(0, 1), [1, 0, 0, 0, 0, 0]);
  assert.deepEqual(storyRail(3, 0.25), [1, 1, 1, 0.25, 0, 0]);
  assert.deepEqual(storyRail(5, 1), [1, 1, 1, 1, 1, 1]);
  assert.deepEqual(storyRail(2, 7), [1, 1, 1, 0, 0, 0], 'local is clamped');
  assert.deepEqual(storyRail(2, NaN), [1, 1, 0, 0, 0, 0]);
  for (let index = 0; index < 6; index += 1) {
    for (const local of [0, 0.3, 1]) {
      const rail = storyRail(index, local);
      assert.equal(rail.length, 6);
      rail.forEach((fill, i) => {
        assert.ok(fill >= 0 && fill <= 1, 'a fill is a fraction');
        if (i < index) assert.equal(fill, 1);
        if (i > index) assert.equal(fill, 0);
      });
    }
  }
});

// ---- the director: settle, skip, back and leave. It has no timer and no DOM.

test('director: the stage that the scroll settles on plays from 0 to 1 and then rests', () => {
  let state = storyPlay(0);
  assert.deepEqual(plain(state), { index: 0, local: 0, ms: 0, mode: 'play', parked: null });
  state = storyAdvance(state, 2500);
  near(state.local, 0.5, 'half of the 5 s');
  assert.equal(state.mode, 'play');
  state = storyAdvance(state, 2499);
  assert.equal(state.mode, 'play', 'one millisecond is left');
  assert.ok(state.local < 1);
  state = storyAdvance(state, 1);
  assert.deepEqual(plain(state), { index: 0, local: 1, ms: 5000, mode: 'rest', parked: null });
  assert.equal(storyAdvance(state, 100), state, 'a stage at rest does not change');
  assert.equal(storyAdvance(storyPlay(1), -50).ms, 0, 'time does not go back');
  assert.equal(storyAdvance(storyAdvance(storyPlay(1), 1e9), 5).local, 1, 'a long step ends the stage');
});

test('director: live has no time, so it rests at local 1 as soon as it is current', () => {
  assert.deepEqual(plain(storyPlay(5)), { index: 5, local: 1, ms: 0, mode: 'rest', parked: null });
  assert.equal(storyAdvance(storyPlay(5), 1000).local, 1);
});

test('director: a fast scroll through several stages plays only the stage where it settles', () => {
  let state = storyAdvance(storyPlay(0), 1000);
  const fromLocal = state.local;
  for (const stage of [1, 2, 3]) {
    state = storyMove(state, stage);
    assert.equal(state.mode, 'move', `stage ${stage} does not play in transit`);
    assert.equal(state.local, 0, `stage ${stage} shows its start`);
    assert.equal(storyAdvance(state, 10000), state, 'and time changes nothing');
  }
  assert.equal(state.parked.index, 0);
  assert.equal(state.parked.local, fromLocal, 'the stage that was left is kept as it was');
  state = storySettle(state, 3);
  assert.deepEqual(plain(state), { index: 3, local: 0, ms: 0, mode: 'play', parked: null }, 'the stage of the settle plays from 0');
  assert.equal(storyMove(state, 3), state, 'the same stage is not a move');
});

test('director: going back shows the end state of the stage, and it does not play backward', () => {
  let state = storyAdvance(storyPlay(3), 2000);
  state = storyMove(state, 2);
  assert.deepEqual([state.index, state.local, state.mode], [2, 1, 'move'], 'the stage behind shows its end at once');
  assert.deepEqual(plain(storySettle(state, 2)), { index: 2, local: 1, ms: 0, mode: 'rest', parked: null });
  // Far back: the same.
  const far = storySettle(storyMove(storyPlay(5), 1), 1);
  assert.deepEqual(plain(far), { index: 1, local: 1, ms: 0, mode: 'rest', parked: null });
  assert.equal(storyAdvance(far, 3000), far, 'and it stays there');
  // Then forward again: the stage plays again from 0.
  assert.deepEqual(plain(storySettle(storyMove(far, 2), 2)), { index: 2, local: 0, ms: 0, mode: 'play', parked: null });
});

test('director: leaving a stage stops it; a visitor who comes back without a settle finds it as it was', () => {
  let state = storyAdvance(storyPlay(1), 3000);
  const kept = plain(state);
  state = storyMove(state, 2);
  assert.equal(state.mode, 'move');
  assert.equal(storyAdvance(state, 4000).ms, 0, 'no time runs for the stage that the visitor leaves');
  const back = storyMove(state, 1);
  assert.deepEqual([back.index, back.local, back.mode], [1, kept.local, 'move'], 'the frozen local, not 0 and not 1');
  const resumed = storySettle(back, 1);
  assert.deepEqual(plain(resumed), kept, 'the stage goes on from where it stopped');
  assert.equal(storyAdvance(resumed, 100).mode, 'play');
  // A stage that was at its end stays at its end.
  const done = storyAdvance(storyPlay(1), 1e9);
  assert.deepEqual(plain(storySettle(storyMove(storyMove(done, 2), 1), 1)), plain(done));
  // A settle with no move changes nothing.
  const idle = storyPlay(2);
  assert.equal(storySettle(idle, 2), idle);
});

test('director: the wait times are short, with a safety net for browsers that have scrollend', () => {
  assert.ok(STORY_SETTLE_MS >= 100 && STORY_SETTLE_MS <= 250, 'a short wait where there is no scrollend');
  assert.ok(STORY_SETTLE_SAFETY_MS > STORY_SETTLE_MS * 3, 'a long wait where scrollend exists');
  assert.ok(STORY_MAX_STEP_MS >= 100 && STORY_MAX_STEP_MS <= 500);
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
  // The pinned scroll range never reaches the fade: the last stage is at the last pinned pixel.
  const height = STORY_SCREENS * viewport;
  const top = viewport - height;
  assert.equal(storyStageAt(storyPosition({ top, viewport })), 5, 'the bottom of the story meets the viewport at the last stage');
  assert.equal(storyPosition({ top, viewport }), STORY_SCREENS - 1, 'the last stage is at 5 screens');
  assert.equal(storyExit({ bottom: top + height, viewport }), 0, 'and the exit has not started');
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

/// ---- the pinned stage and the static frames, run from the compiled bundle with a small fake DOM

const fakePage = ({ reduced = false, scrollend = true } = {}) => {
  const bundle = read('bundle.js');
  const code = between(bundle, '// File: StoryStage.jsx', '// File: StoryChapters.jsx');
  assert.ok(code.includes('const StoryPinned'), 'build the current source before testing');
  // now is the clock of the timers in ms. t is the time of the last animation frame.
  const page = { queue: [], listeners: {}, observers: [], effects: [], views: [], refs: [], errors: [], slots: [], slot: 0, timers: [], timerId: 0, now: 0, t: 0, scrolls: [] };
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
    // A window with onscrollend is a browser that has the scrollend event.
    window: { devicePixelRatio: 3, matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }), ...(scrollend ? { onscrollend: null } : {}), scrollBy: options => page.scrolls.push(plain(options)), ...listen('window') },
    document: page.document,
    console: { error: (...args) => page.errors.push(args) },
    IntersectionObserver: Observer,
    ResizeObserver: Observer,
    requestAnimationFrame: fn => { page.queue.push(fn); return page.queue.length; },
    cancelAnimationFrame: id => { page.queue[id - 1] = null; },
    setTimeout: (fn, ms) => { page.timerId += 1; page.timers.push({ id: page.timerId, fn, at: page.now + ms }); return page.timerId; },
    clearTimeout: id => { page.timers = page.timers.filter(timer => timer.id !== id); },
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
  page.fire = (name, ...args) => page.listeners[name].fn(...args);
  page.render = (component, props) => { page.slot = 0; page.effects.length = 0; return component(props); };
  // Moves the timers on by ms. A timer that is due runs at its own time.
  page.advance = ms => {
    const end = page.now + ms;
    for (;;) {
      const due = page.timers.filter(timer => timer.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!due) break;
      page.timers = page.timers.filter(timer => timer !== due);
      page.now = Math.max(page.now, due.at);
      due.fn();
    }
    page.now = end;
  };
  // Runs animation frames of step ms for ms milliseconds. The timers run on with the frames.
  page.run = (ms, step = 16) => {
    for (let spent = 0; spent < ms; spent += step) {
      page.advance(step);
      page.flush(page.t += step);
    }
  };
  return page;
};

// Starts the pinned stage with spy renderers. rect is the bounding rect of the story section.
// stage is the stage under the viewport when the page opens. scrollend says whether the browser has the scrollend event.
const startPinned = ({ stage = 0, scrollend = true } = {}) => {
  const page = fakePage({ scrollend });
  const draws = [];
  const frames = [];
  const rect = { top: -stage * 800, height: STORY_SCREENS * 800 };
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
  // The visitor scrolls to a position in screens (0 to 5, and more in the tail below the last stage): one scroll event and one frame.
  const scrollTo = position => { rect.top = -position * 800; page.fire('window:scroll'); page.run(16); };
  // The browser sends scrollend: the scroll has settled. One frame follows.
  const settle = () => { page.fire('window:scrollend'); page.run(16); };
  const filled = () => fills.map(fill => Number((String(fill.style.transform || '').match(/scaleX\(([^)]*)\)/) || [0, 0])[1]));
  return { page, draws, frames, ctx, canvas, layer, fills, filled, rail, skip, element, cleanup, scrollTo, settle, section, rect };
};

test('the pinned stage plays the first stage by itself, draws on each frame, and stops at the end of the stage', () => {
  const { page, draws, ctx, canvas, filled, element } = startPinned();
  assert.equal(page.listeners['window:scroll'].options.passive, true, 'one passive scroll listener');
  assert.equal(typeof page.listeners['window:scrollend'].fn, 'function', 'and one scrollend listener');
  assert.equal(element.props['data-chapter'], 'orbit');
  page.run(16);
  assert.equal(draws.length, 1);
  assert.deepEqual(draws[0], { id: 'orbit', frame: { local: 0, p: 0, width: 1200, height: 800, dpr: 2, time: 16, reducedMotion: false } });
  assert.deepEqual([canvas.width, canvas.height], [2400, 1600], 'the canvas is sized with the pixel ratio (maximum 2)');
  assert.deepEqual(ctx.calls[0], [2, 0, 0, 2, 0, 0], 'the context is scaled by dpr before the renderer draws');
  assert.equal(ctx.restores, 1);
  assert.equal(page.queue.length, 1, 'the stage plays, so the next frame is waiting');

  page.run(2500);
  const middle = draws[draws.length - 1];
  assert.ok(middle.frame.local > 0.45 && middle.frame.local < 0.55, `about half of the stage after about half of its time (${middle.frame.local})`);
  assert.equal(filled()[0], middle.frame.local, 'the rail fills with the local value');

  page.run(5000);
  draws.forEach(({ id, frame }) => {
    assert.equal(id, 'orbit');
    near(frame.local, storyLocal('orbit', frame.time - 16), 'local follows the time of the stage');
    near(frame.p, frame.local / 6, 'p is (stage + local) / 6');
  });
  assert.equal(draws[draws.length - 1].frame.local, 1, 'the stage ends at local 1');
  assert.equal(draws.length, 314, 'one draw for each frame of 5 s: the first frame and 313 more');
  assert.equal(page.queue.length, 0, 'the loop ends with the stage');
  page.run(3000);
  assert.equal(draws.length, 314, 'a stage at its end draws nothing more');
  assert.deepEqual(filled(), [1, 0, 0, 0, 0, 0]);
  assert.deepEqual(page.views, [], 'React state does not change inside one stage and caption');
});

test('a settle starts the playback of the new stage; a move without a settle does not', () => {
  const { page, draws, scrollTo, settle } = startPinned();
  page.run(6000);
  const count = draws.length;
  scrollTo(1);
  const arrival = draws[draws.length - 1];
  assert.deepEqual([draws.length, arrival.id, arrival.frame.local, arrival.frame.p], [count + 1, 'descent', 0, 1 / 6], 'the new stage shows its start at once');
  page.run(500);
  assert.equal(draws.length, count + 1, 'the scroll has not settled, so the stage does not play');
  assert.equal(page.queue.length, 0, 'and no frame is waiting');

  settle();
  const start = page.t;
  assert.equal(page.queue.length, 1, 'the settle starts the playback');
  page.run(3500);
  const half = draws[draws.length - 1];
  assert.equal(half.id, 'descent');
  near(half.frame.local, storyLocal('descent', half.frame.time - start), 'local follows the time since the settle');
  assert.ok(half.frame.local > 0.45 && half.frame.local < 0.55, `about half of the 7 s (${half.frame.local})`);
  page.run(4000);
  assert.equal(draws[draws.length - 1].frame.local, 1, 'the stage plays to its end by itself');
  assert.equal(page.queue.length, 0);
  assert.deepEqual(plain(page.views.map(view => view.index)), [1], 'the chapter changed once');
});

test('the settle comes from scrollend, or from a short timer when there is no scrollend; a new scroll event starts the wait again', () => {
  for (const withEnd of [false, true]) {
    const { page, scrollTo } = startPinned({ scrollend: withEnd });
    page.run(160);
    const wait = withEnd ? STORY_SETTLE_SAFETY_MS : STORY_SETTLE_MS;
    scrollTo(1);
    assert.equal(page.queue.length, 0, `${withEnd}: moving`);
    page.advance(wait - 40);
    scrollTo(1.1);
    page.advance(wait - 40);
    assert.equal(page.queue.length, 0, `${withEnd}: a new scroll event started the wait again`);
    page.advance(41);
    assert.equal(page.queue.length, 1, `${withEnd}: ${wait} ms after the last scroll event the story settles and the stage plays`);
  }
  const { page, scrollTo, settle } = startPinned({ scrollend: true });
  scrollTo(2);
  assert.equal(page.timers.length, 1, 'the safety wait is pending');
  settle();
  assert.equal(page.queue.length, 1, 'scrollend settles at once, with no wait');
  assert.equal(page.timers.length, 0, 'and the wait is gone');
});

test('a fast scroll through several stages plays only the stage where the scroll settles', () => {
  const { page, draws, filled, scrollTo, settle } = startPinned();
  const mounted = [];
  page.renderers.live.mount = element => mounted.push(element);
  page.run(1000);
  const start = draws.length;
  scrollTo(1);
  scrollTo(2);
  scrollTo(3);
  scrollTo(4);
  scrollTo(5);
  scrollTo(4);
  scrollTo(3);
  page.run(500);
  const transit = draws.slice(start);
  assert.deepEqual(transit.map(draw => draw.id), ['descent', 'rock', 'grid', 've', 'live', 've', 'grid'], 'each stage on the way shows once');
  assert.ok(transit.every(draw => draw.frame.local === 0), 'and at its start: none of them plays');
  assert.equal(page.queue.length, 0, 'no frame is waiting, so no time runs for any stage');
  assert.equal(mounted.length, 0, 'live is not mounted when the visitor only passes it');

  settle();
  page.run(4500);
  const played = draws.slice(start + transit.length);
  assert.ok(played.length > 100 && played.every(draw => draw.id === 'grid'), 'only the stage of the settle plays');
  const last = played[played.length - 1].frame.local;
  assert.ok(last > 0.45 && last < 0.55, `grid is at about half of its 9 s (${last})`);
  assert.equal(draws.filter(draw => ['descent', 'rock', 've', 'live'].includes(draw.id) && draw.frame.local !== 0).length, 0, 'no other stage ever played');
  assert.deepEqual(filled(), [1, 1, 1, last, 0, 0]);
  assert.equal(mounted.length, 0, 'live never mounted: the visitor stopped on grid');
});

test('going back shows the stage behind at its end state: no replay, the last caption, a full rail', () => {
  const { page, draws, filled, scrollTo, settle } = startPinned({ stage: 3 });
  page.run(2000);
  assert.equal(draws[draws.length - 1].id, 'grid');
  assert.ok(draws[draws.length - 1].frame.local < 0.5 && draws[draws.length - 1].frame.local > 0);
  scrollTo(2);
  const back = draws[draws.length - 1];
  assert.deepEqual([back.id, back.frame.local], ['rock', 1], 'rock shows its end at once');
  near(back.frame.p, 0.5);
  assert.deepEqual(plain(page.views[page.views.length - 1]), { index: 2, caption: 1 }, 'with its last caption');
  assert.deepEqual(filled(), [1, 1, 1, 0, 0, 0]);
  const count = draws.length;
  settle();
  page.run(10000);
  assert.equal(draws.length, count, 'the settle does not replay the stage');
  assert.equal(page.queue.length, 0);

  // Far back: from live to the first stage, in one move.
  scrollTo(5);
  settle();
  page.run(100);
  scrollTo(0);
  settle();
  const first = draws[draws.length - 1];
  assert.deepEqual([first.id, first.frame.local], ['orbit', 1]);
  assert.deepEqual(filled(), [1, 0, 0, 0, 0, 0]);
  const total = draws.length;
  page.run(6000);
  assert.equal(draws.length, total, 'the first stage does not play when the visitor comes back to it');
});

test('leaving a stage stops its playback; a visitor who comes back without a settle finds it as it was', () => {
  const { page, draws, scrollTo, settle } = startPinned({ stage: 1 });
  page.run(2000);
  const stopped = draws[draws.length - 1].frame.local;
  assert.ok(stopped > 0 && stopped < 0.3, `descent is in play (${stopped})`);

  scrollTo(2);
  const count = draws.length;
  page.run(700);
  assert.equal(draws.length, count, 'no frame for any stage: descent stopped and rock waits for the settle');
  assert.equal(page.queue.length, 0);

  scrollTo(1);
  const frozen = draws[draws.length - 1];
  assert.deepEqual([frozen.id, frozen.frame.local], ['descent', stopped], 'descent shows the local where it stopped');
  settle();
  page.run(1000);
  const resumed = draws[draws.length - 1].frame.local;
  assert.ok(resumed > stopped && resumed < stopped + 0.25,`descent goes on from where it stopped (${stopped} to ${resumed})`);

  // The visitor leaves for good: descent never draws again.
  scrollTo(2);
  settle();
  const before = draws.length;
  page.run(9000);
  assert.ok(draws.slice(before).every(draw => draw.id === 'rock'), 'only rock plays now');
});

test('a hidden tab or an off-screen story pauses the playback, and the playback goes on from the same point', () => {
  const pauses = {
    'a hidden tab': (page) => { page.document.hidden = true; page.fire('document:visibilitychange'); },
    'an off-screen story': (page, section) => { page.observers.find(observer => observer.target === section).callback([{ isIntersecting: false }]); },
  };
  const resumes = {
    'a hidden tab': (page) => { page.document.hidden = false; page.fire('document:visibilitychange'); },
    'an off-screen story': (page, section) => { page.observers.find(observer => observer.target === section).callback([{ isIntersecting: true }]); },
  };
  for (const name of Object.keys(pauses)) {
    const { page, draws, section } = startPinned();
    page.run(1000);
    const last = draws[draws.length - 1];
    const spent = last.frame.time - 16;
    const count = draws.length;
    pauses[name](page, section);
    page.run(60000);
    assert.equal(draws.length, count, `${name}: no draw while paused`);
    assert.equal(page.queue.length, 0, `${name}: no frame is waiting`);

    resumes[name](page, section);
    page.run(16);
    page.run(16);
    const after = draws[draws.length - 1];
    assert.ok(after.frame.time > last.frame.time + 60000, `${name}: the time of the pause went by`);
    assert.ok(after.frame.local > last.frame.local, `${name}: the playback goes on`);
    near(after.frame.local, storyLocal('orbit', spent + 16), `${name}: only 16 ms of play after the pause, not 60 s`);

    page.run(4100);
    assert.equal(draws[draws.length - 1].frame.local, 1, `${name}: the stage ends`);
    assert.equal(page.queue.length, 0);
  }
  // A step that is too long is a pause that nobody reported: it counts as 250 ms at most.
  const { page, draws } = startPinned();
  page.run(160);
  const before = draws[draws.length - 1].frame.time - 16;
  page.flush(page.t += 10000);
  page.run(16);
  const jumped = draws[draws.length - 1].frame.local;
  assert.ok(jumped <= storyLocal('orbit', before + 16 + STORY_MAX_STEP_MS + 1), 'a gap of 10 s moves the stage by 250 ms at most');
});

test('the wheel help: a stage at rest, the direction of the wheel, and where the page rests now', () => {
  assert.equal(STORY_REST_TOLERANCE, 0.02);
  assert.deepEqual([0, 1.01, 0.5, 4.999, 5, 5.03, 5.5, -0.01, 6, NaN].map(storyRestAt), [0, 1, -1, 5, 5, -1, -1, 0, -1, -1], 'only a position at a snap point of a stage is at rest');
  assert.equal(storyWheelTarget(0, 1, 0), 1, 'a wheel down that snapped back to stage 0 moves to stage 1');
  assert.equal(storyWheelTarget(3, -1, 3), 2, 'a wheel up that snapped back to stage 3 moves to stage 2');
  assert.equal(storyWheelTarget(0, -1, 0), -1, 'no stage above the first stage');
  assert.equal(storyWheelTarget(5, 1, 5), -1, 'no stage below the last stage: the page scrolls on');
  assert.equal(storyWheelTarget(2, 1, 3), -1, 'the wheel moved the page already: no help');
  assert.equal(storyWheelTarget(2, 1, 2.3), -1, 'the page is not at rest yet');
  assert.equal(storyWheelTarget(2, 1, 5.6), -1, 'in the tail');
  assert.equal(storyWheelTarget(-1, 1, 2), -1, 'the wheel did not begin at rest on a stage');
  assert.equal(storyWheelTarget(2, 0, 2), -1, 'no direction');
});

test('a wheel that snaps back to its own stage moves the story one stage in the direction of the wheel', () => {
  const down = startPinned({ stage: 2 });
  down.page.run(160);
  down.page.fire('window:wheel', { deltaY: 100 });
  down.scrollTo(2.125);
  down.settle();
  assert.deepEqual(down.page.scrolls, [], 'the page is not at rest yet: the story waits');
  down.scrollTo(2);
  down.settle();
  assert.deepEqual(down.page.scrolls, [{ top: 800, behavior: 'smooth' }], 'one screen down: the next stage');
  down.settle();
  assert.equal(down.page.scrolls.length, 1, 'once for one wheel');

  const up = startPinned({ stage: 3 });
  up.page.fire('window:wheel', { deltaY: -53 });
  up.scrollTo(2.934);
  up.scrollTo(3);
  up.settle();
  assert.deepEqual(up.page.scrolls, [{ top: -800, behavior: 'smooth' }], 'a small wheel up: one screen up');

  // The browser scrolls first, and the page sees the wheel event afterwards. The start of the gesture is the last rest.
  const late = startPinned({ stage: 1 });
  late.scrollTo(1.125);
  late.page.fire('window:wheel', { deltaY: 100 });
  late.settle();
  assert.deepEqual(late.page.scrolls, [], 'the first scrollend comes before the page is at rest');
  late.scrollTo(1);
  late.settle();
  assert.deepEqual(late.page.scrolls, [{ top: 800, behavior: 'smooth' }], 'the page snapped back to stage 1, so the story moves to stage 2');
  const early = startPinned({ stage: 1 });
  early.scrollTo(2);
  early.page.fire('window:wheel', { deltaY: 100 });
  early.settle();
  assert.deepEqual(early.page.scrolls, [], 'the browser moved the page to stage 2 by itself: no help');
  early.page.fire('window:wheel', { deltaY: 100 });
  early.scrollTo(3);
  early.settle();
  assert.deepEqual(early.page.scrolls, [], 'and again, for the next wheel');

  // Many small wheel events in one gesture still move one stage.
  const burst = startPinned({ stage: 0 });
  for (let i = 0; i < 8; i += 1) { burst.page.fire('window:wheel', { deltaY: 100 }); burst.scrollTo(0.1 * (i + 1)); }
  burst.scrollTo(0);
  burst.settle();
  assert.deepEqual(burst.page.scrolls, [{ top: 800, behavior: 'smooth' }]);
});

test('the wheel help does nothing when the wheel moved the page, at the ends of the story, or when the wheel does not count', () => {
  // The browser moved the page to the next stage: no help.
  const moved = startPinned({ stage: 1 });
  moved.page.fire('window:wheel', { deltaY: 100 });
  moved.scrollTo(1.6);
  moved.scrollTo(2);
  moved.settle();
  assert.deepEqual(moved.page.scrolls, []);

  // No stage above the first stage, and a wheel down on the last stage scrolls on into the page.
  const top = startPinned({ stage: 0 });
  top.page.fire('window:wheel', { deltaY: -100 });
  top.scrollTo(0);
  top.settle();
  const last = startPinned({ stage: 5 });
  last.page.fire('window:wheel', { deltaY: 100 });
  last.scrollTo(5);
  last.settle();
  last.scrollTo(5.125);
  last.settle();
  assert.deepEqual([top.page.scrolls, last.page.scrolls], [[], []]);

  // A wheel that began in the tail below the last stage, and a wheel that does not scroll the page.
  const tail = startPinned({ stage: 5 });
  tail.scrollTo(5.5);
  tail.settle();
  tail.page.fire('window:wheel', { deltaY: -100 });
  tail.scrollTo(5);
  tail.settle();
  const keys = startPinned({ stage: 2 });
  keys.page.fire('window:wheel', { deltaY: 100, ctrlKey: true });
  keys.page.fire('window:wheel', { deltaY: 100, shiftKey: true });
  keys.page.fire('window:wheel', { deltaY: 0 });
  keys.scrollTo(2);
  keys.settle();
  assert.deepEqual([tail.page.scrolls, keys.page.scrolls], [[], []]);

  // An off-screen story is not a wheel target.
  const away = startPinned({ stage: 2 });
  away.page.observers.find(observer => observer.target === away.section).callback([{ isIntersecting: false }]);
  away.page.fire('window:wheel', { deltaY: 100 });
  away.scrollTo(2);
  away.settle();
  assert.deepEqual(away.page.scrolls, []);
});

test('the rail fills the segment of the current stage with its playback, and the earlier segments are full', () => {
  const { page, draws, filled, scrollTo, settle } = startPinned();
  assert.deepEqual(filled(), [0, 0, 0, 0, 0, 0], 'empty before the first frame');
  page.run(16);
  assert.deepEqual(filled(), [0, 0, 0, 0, 0, 0]);
  for (const ms of [800, 1600, 2400]) {
    page.run(800);
    const local = draws[draws.length - 1].frame.local;
    assert.deepEqual(filled(), [local, 0, 0, 0, 0, 0], `orbit at ${ms} ms`);
  }
  page.run(3000);
  assert.deepEqual(filled(), [1, 0, 0, 0, 0, 0], 'full at the end');

  scrollTo(2);
  assert.deepEqual(filled(), [1, 1, 0, 0, 0, 0], 'a forward move: the new stage starts empty');
  settle();
  page.run(4000);
  const local = draws[draws.length - 1].frame.local;
  assert.ok(local > 0.4 && local < 0.6);
  assert.deepEqual(filled(), [1, 1, local, 0, 0, 0], 'the current segment fills, the earlier ones are full');
  page.run(5000);
  assert.deepEqual(filled(), [1, 1, 1, 0, 0, 0]);

  scrollTo(1);
  assert.deepEqual(filled(), [1, 1, 0, 0, 0, 0], 'a move back: the stage behind is full, the stage that was left is empty');
  settle();
  scrollTo(5);
  settle();
  assert.deepEqual(filled(), [1, 1, 1, 1, 1, 1], 'live has no time: its segment is full on arrival');
  assert.equal(page.queue.length, 0);
});

test('the pinned stage draws once and rests on live; the scroll alone changes nothing on a stage at rest', () => {
  const { page, draws, scrollTo } = startPinned({ stage: 5 });
  page.run(16);
  assert.equal(draws.length, 1);
  assert.deepEqual([draws[0].id, draws[0].frame.local, draws[0].frame.p], ['live', 1, 1], 'live has no time: local is 1');
  assert.equal(page.queue.length, 0, 'and it needs no frame');
  scrollTo(5);
  assert.equal(draws.length, 1, 'a scroll event that does not move the story draws nothing');
  scrollTo(5.3);
  assert.equal(draws.length, 1, 'a scroll inside the stage draws nothing');
  assert.equal(page.views.length, 1, 'React state changed once, from the first stage to the stage under the viewport');
  assert.deepEqual(plain(page.views[0]), { index: 5, caption: 0 });
});

test('an animated renderer draws on each frame only while the stage is on screen and the tab is visible', () => {
  const { page, draws, section } = startPinned({ stage: 5 });
  page.renderers.live.animated = true;
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
  const { page, draws, frames, scrollTo, settle } = startPinned({ stage: 5 });
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
  assert.deepEqual([draws[1].id, draws[1].frame.time, draws[1].frame.local], ['live', 32, 1]);
  page.flush(48);
  assert.equal(draws.length, 2, 'and the stage does not draw again');
  assert.equal(page.queue.length, 0);

  // It is one function for the whole stage, and it draws the chapter that is current.
  scrollTo(2);
  settle();
  assert.equal(frames[frames.length - 1].requestDraw, requestDraw, 'the same function in each frame');
  const before = draws.length;
  requestDraw();
  page.run(16);
  assert.equal(draws.length, before + 1);
  assert.equal(draws[draws.length - 1].id, 'rock', 'the current chapter, not the chapter of the frame that gave the function');
  near(draws[draws.length - 1].frame.p, 0.5, 'with the progress of the page now');
});

test('requestDraw draws nothing while the stage is off screen or the tab is hidden, and the stage keeps the request', () => {
  const { page, draws, frames, section } = startPinned({ stage: 5 });
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
  const { page, draws, cleanup } = startPinned({ stage: 5 });
  let asks = 1;
  let keep = null;
  page.renderers.live = {
    draw: (c, frame) => {
      draws.push({ id: 'live', frame: plain(frame) });
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
  const { page, draws, scrollTo, settle } = startPinned({ stage: 5 });
  const entry = {
    count: 0,
    animated: false,
    draw() { draws.push('draw'); this.animated = ++this.count < 3; },
  };
  page.renderers.live = entry;
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
  scrollTo(2);
  assert.equal(page.queue.length, 1, 'the getter was true after the first draw');
  page.flush(64);
  assert.equal(page.queue.length, 0, 'and false after the second');
});

test('the layer of the live chapter mounts when the scroll settles on it and unmounts on departure; a stage that is only passed does not mount', () => {
  const { page, layer, cleanup, scrollTo, settle } = startPinned();
  const mounted = [];
  const unmounted = [];
  page.renderers.live.mount = element => mounted.push(element);
  page.renderers.live.unmount = () => unmounted.push(true);
  scrollTo(2);
  settle();
  assert.equal(mounted.length, 0, 'no mount before the chapter');
  scrollTo(5);
  assert.equal(mounted.length, 0, 'no mount while the scroll moves');
  settle();
  assert.deepEqual([mounted.length, unmounted.length], [1, 0], 'one mount when the scroll settles');
  assert.equal(mounted[0], layer, 'the layer is the element of the stage');
  scrollTo(5.4);
  settle();
  assert.deepEqual([mounted.length, unmounted.length], [1, 0], 'a scroll in the tail below the last stage keeps the layer');
  scrollTo(2);
  assert.deepEqual([mounted.length, unmounted.length], [1, 1], 'one unmount on the way out');
  settle();
  scrollTo(5);
  settle();
  cleanup();
  assert.deepEqual([mounted.length, unmounted.length], [2, 2], 'the unmount also runs when the story leaves the page');
});

test('a renderer that throws is reported once and the story goes on', () => {
  const { page, draws, ctx, scrollTo, settle } = startPinned();
  page.renderers.rock.draw = () => { throw new Error('broken art'); };
  scrollTo(2);
  settle();
  page.run(500);
  assert.equal(page.errors.length, 1, 'one report in the console');
  assert.ok(ctx.restores > 10, 'the stage drew on many frames');
  assert.equal(ctx.restores, ctx.calls.length, 'the context state is restored after each draw');
  scrollTo(3);
  assert.equal(draws[draws.length - 1].id, 'grid', 'the next chapter draws');
});

test('the listeners, the timer and the observers are removed when the story unmounts', () => {
  const { page, draws, cleanup, scrollTo } = startPinned();
  page.flush(16);
  scrollTo(1);
  assert.equal(page.timers.length, 1, 'the settle wait is pending');
  cleanup();
  assert.equal(page.listeners['window:scroll'], undefined);
  assert.equal(page.listeners['window:scrollend'], undefined);
  assert.equal(page.listeners['window:wheel'], undefined);
  assert.equal(page.listeners['document:visibilitychange'], undefined);
  assert.ok(page.observers.every(observer => observer.disconnected));
  assert.equal(page.queue.length, 0, 'no animation frame is waiting');
  assert.equal(page.timers.length, 0, 'and no timer');
  const count = draws.length;
  page.run(500);
  assert.equal(draws.length, count);
});

test('the rail fades out and the skip link hides when the stage starts to leave, and nothing changes while it is pinned', () => {
  const { page, skip, rail, rect, cleanup, scrollTo } = startPinned();
  page.run(16);
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
  for (const position of [0.3, 1, 2.5, 3.9, 4.8, 5]) {
    scrollTo(position);
    assert.deepEqual([clear(skip), clear(rail)], [['', ''], ['', '']], `pinned at ${position}`);
  }
  assert.equal(writes.length, 0, 'no style write while the stage is pinned');

  // The stage leaves: the bottom of the story rises above the bottom of the viewport (800 px). The fade is 160 px long.
  const leave = pixels => { rect.top = -(rect.height - 800) - pixels; page.fire('window:scroll'); page.run(16); };
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
  scrollTo(5);
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
  assert.match(source, /<StoryPinned sectionRef=\{sectionRef\} onNavigate=\{onNavigate\} \/>/);
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

test('the pinned story is 6 screens tall, one for each stage; reduced motion gives six static frames drawn once with local = 1', () => {
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
  assert.deepEqual(draws[0], { id: 'rock', frame: { local: 1, p: 0.5, width: 1000, height: 562.5, dpr: 2, time: 0, reducedMotion: true } });
  assert.equal(frame.props.role, 'group');
  assert.equal(frame.props['aria-label'], 'Into the rock');
  assert.ok(nodes(frame).some(node => node.type === 'canvas' && node.props['aria-hidden'] === 'true'), 'the canvas is hidden from assistive technology');
});

// ---- the scroll steps and the snap

// A small model of the CSS rule for the snap areas of one axis (CSS Scroll Snap). An area that fits in the viewport
// has one valid scroll offset: its top. An area that is taller than the viewport has every offset in which it covers
// the viewport. With mandatory snap, the browser rests only on a valid offset.
const snapRanges = (areas, viewport) => areas.map(({ top, height }) => [top, height > viewport ? top + height - viewport : top]);
const isSnapOffset = (ranges, offset) => ranges.some(([from, to]) => offset >= from && offset <= to);

test('the scroll steps are the snap points: six boxes of one screen, and the last box is as tall as the rest of the page', () => {
  const css = read('colors_and_type.css').replace(/\r\n/g, '\n');
  const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const block = (text, open) => {
    const at = text.indexOf(open);
    assert.ok(at >= 0, `${open} is in the stylesheet`);
    let depth = 0;
    for (let i = text.indexOf('{', at); i < text.length; i += 1) {
      if (text[i] === '{') depth += 1;
      if (text[i] === '}' && --depth === 0) return text.slice(text.indexOf('{', at) + 1, i);
    }
    return '';
  };

  // The steps in the page: one for each stage, in order, hidden from assistive technology.
  const page = fakePage();
  const steps = page.get('StorySteps')();
  assert.equal(steps.props.className, 'story-steps');
  assert.equal(steps.props['aria-hidden'], 'true');
  const boxes = nodes(steps).filter(node => node.props && node.props.className === 'story-step');
  assert.deepEqual(boxes.map(box => box.props['data-step']), IDS, 'one step for each stage');
  page.refs.push({});
  const pinned = page.get('StoryStage')({});
  assert.ok(nodes(pinned).some(node => node.type === page.get('StorySteps')), 'the pinned story has the steps');
  const reduced = fakePage({ reduced: true });
  reduced.refs.push({});
  assert.ok(!nodes(reduced.get('StoryStage')({})).some(node => node.type === reduced.get('StorySteps')), 'the static frames have no steps and no snap');

  // The rules: each step is one screen and one snap point that stops the scroll.
  const step = block(code, '.story-step {');
  assert.match(step, /height: 100vh;\s*height: 100svh;/, 'a step is one screen high, with a 100vh fallback');
  assert.match(step, /scroll-snap-align: start;/);
  assert.match(step, /scroll-snap-stop: always;/, 'a fast fling stops at each stage');
  assert.match(block(code, '.story-steps {'), /position: absolute;[\s\S]*inset: 0;[\s\S]*pointer-events: none;/);
  assert.match(block(code, '.story--pinned {'), /var\(--story-screens, 6\) \* 100svh/, 'the story is 6 screens tall');

  // The snap is mandatory and it is on the page scroll only when a pinned story is in the page.
  const guard = '@supports (overflow: clip) and selector(:has(*)) {';
  const inside = block(code, guard);
  assert.match(inside, /html:has\(\.story--pinned\) \{ scroll-snap-type: y mandatory; \}/, 'mandatory, so that one input moves exactly one stage');
  assert.match(inside, /\.story-steps \{ overflow: clip; \}/, 'the wrapper clips the tall box, so the page does not grow');
  const tall = Number(block(inside, '.story-step:last-child {').match(/calc\(100svh \+ (\d+)px\)/)[1]);
  assert.ok(tall >= 20000, `the last box is taller than any page of this site (${tall} px)`);
  assert.equal(code.match(/scroll-snap-type/g).length, 1, 'one snap container only: the page');
  assert.equal(code.match(/scroll-snap-align/g).length, 1, 'one snap align only: the steps');
  assert.equal(code.match(/scroll-snap-stop/g).length, 1);
  assert.doesNotMatch(code, /scroll-snap-type:\s*y\s+proximity/, 'not proximity: it snaps back after a small scroll and ignores a key press');
  assert.doesNotMatch(code.replace(inside, ''), /scroll-snap-type/, 'only inside the guard: a browser without :has or overflow: clip does not snap, so it cannot trap');

  // The model: nothing after the last stage snaps, and the stages in the story do.
  const viewport = 800;
  const areas = IDS.map((id, i) => ({ top: i * viewport, height: i === 5 ? viewport + tall : viewport }));
  const ranges = snapRanges(areas, viewport);
  for (let stage = 0; stage < 6; stage += 1) assert.ok(isSnapOffset(ranges, stage * viewport), `stage ${stage} is a snap offset`);
  for (const offset of [1, 100, 399, 400, 799, 801, 1300, 2399, 3100, 3999]) assert.ok(!isSnapOffset(ranges, offset), `${offset}: between two stages the page does not rest`);
  for (const pageHeight of [9300, 20000, 32000]) {
    for (let offset = 5 * viewport; offset <= pageHeight - viewport; offset += 37) {
      assert.ok(isSnapOffset(ranges, offset), `offset ${offset} of a page of ${pageHeight} px is free: no snap after the last stage`);
    }
  }
  assert.ok(isSnapOffset(ranges, 5 * viewport + 130), 'a hash target in the first section below the story is a valid offset, so the skip link and the header links land');
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
  assert.deepEqual(plain(painted[1].frame), { local: 1, p: 0.5, width: 1000, height: 562.5, dpr: 2, time: 0, reducedMotion: true });
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

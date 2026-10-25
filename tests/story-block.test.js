const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SITE_STORY } = require('../site-content.js');
const StoryGeometry = require('../story-geometry.js');
const storedRun = require('../assets/story-run.json');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const between = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to));

const stage = new Function(between(read('StoryStage.jsx'), '// ---- story helpers', '// ---- end story helpers') +
  '\nreturn { STORY_COLORS, storyClamp };')();
const { STORY_COLORS, storyClamp } = stage;

const blockSource = read('StoryBlock.jsx');
const helperText = between(blockSource, '// ---- story block helpers', '// ---- end story block helpers');
const NAMES = ['STORY_BLOCK_GRID_YEARS', 'STORY_BLOCK_RUN_MINUTES', 'STORY_BLOCK_RATE', 'STORY_BLOCK_KINDS', 'STORY_BLOCK_STEPS',
  'STORY_BLOCK_BANDS', 'STORY_BLOCK_TOPS', 'STORY_BLOCK_TONES', 'STORY_BLOCK_EAST', 'STORY_BLOCK_NORTH', 'STORY_BLOCK_FACE_EAST', 'STORY_BLOCK_FACE_NORTH',
  'storyBlockEase', 'storyBlockMix', 'storyBlockTint', 'storyBlockInt', 'storyBlockResolution', 'storyBlockLayout', 'storyBlockCaptionHeights',
  'storyBlockClear', 'storyBlockAxes', 'storyBlockExaggeration', 'storyBlockFit', 'storyBlockPlace', 'storyBlockLocate', 'storyBlockNearest',
  'storyBlockCut', 'storyBlockOrder', 'storyBlockFaces', 'storyBlockTone', 'storyBlockCellFill', 'storyBlockBand', 'storyBlockKind', 'storyBlockClock',
  'storyBlockGrid', 'storyBlockVe', 'storyBlockLive', 'storyBlockCounter', 'storyBlockFramePair', 'storyBlockBlend', 'storyBlockStep',
  'storyBlockAdvance', 'storyBlockPalette'];
const H = new Function('STORY_COLORS', 'storyClamp', `${helperText}\nreturn { ${NAMES.join(', ')} };`)(STORY_COLORS, storyClamp);

const plain = value => JSON.parse(JSON.stringify(value));
const sweep = (steps = 200) => Array.from({ length: steps + 1 }, (_, i) => i / steps);
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} is not ${b}`);

// ---- the helper block

test('the helper block is pure: it reads no page, no model and no worker', () => {
  assert.ok(helperText.length > 2000, 'the block exists');
  const code = helperText.replace(/\/\/.*$/gm, '');
  for (const word of ['document', 'window', 'fetch', 'Worker', 'StoryGeometry', 'Float32Array']) assert.ok(!new RegExp(`\\b${word}\\b`).test(code), `no ${word} in the helpers`);
  assert.ok(!code.includes('ctx.'), 'no canvas in the helpers');
});

test('a phone gets fewer cells than a wide stage', () => {
  assert.deepEqual(H.storyBlockResolution(1280), { nx: 30, ny: 18, nz: 5 });
  assert.deepEqual(H.storyBlockResolution(390), { nx: 20, ny: 12, nz: 4 });
  assert.deepEqual(H.storyBlockResolution(640), { nx: 20, ny: 12, nz: 4 });
  assert.deepEqual(H.storyBlockResolution(641), { nx: 30, ny: 18, nz: 5 });
});

test('the caption height estimate is close to the real captions at 1280 and 390 px', () => {
  const wide = H.storyBlockCaptionHeights(1280, SITE_STORY.captions);
  assert.ok(wide.bottom >= 5 * 37 && wide.bottom <= 7 * 37, `five to seven lines of caption (${wide.bottom})`);
  assert.ok(wide.top >= 64 + 37 && wide.top <= 64 + 4 * 37, `the live caption and its buttons (${wide.top})`);
  const narrow = H.storyBlockCaptionHeights(390, SITE_STORY.captions);
  assert.ok(narrow.bottom >= 4 * 25 && narrow.bottom <= 6 * 26, `four to six lines at 390 px (${narrow.bottom})`);
  assert.deepEqual(H.storyBlockCaptionHeights(1280, {}), { bottom: Math.round(0 * 1.5), top: 64 }, 'no copy gives no lines');
});

test('the layout keeps the block out of the caption areas at many stage sizes', () => {
  const sizes = [[1280, 800], [1920, 1080], [1024, 768], [1440, 900], [768, 1024], [641, 800], [640, 800], [390, 844], [360, 640], [844, 390], [1280, 500]];
  for (const [width, height] of sizes) {
    for (const reduced of [false, true]) {
      const copy = H.storyBlockCaptionHeights(width, SITE_STORY.captions);
      const layout = H.storyBlockLayout(width, height, reduced, copy);
      const label = `${width}x${height}${reduced ? ' static' : ''}`;
      for (const rect of [layout.box, layout.fit]) {
        assert.ok(rect.x0 >= 0 && rect.y0 >= 0 && rect.x1 <= width && rect.y1 <= height, `${label}: the area is inside the stage`);
        assert.ok(rect.x1 > rect.x0 && rect.y1 > rect.y0, `${label}: the area has a size`);
      }
      assert.ok(layout.fit.x0 >= layout.box.x0 && layout.fit.x1 <= layout.box.x1 && layout.fit.y0 >= layout.box.y0 && layout.fit.y1 <= layout.box.y1, `${label}: fit is inside box`);
      assert.ok(layout.clock.x >= 0 && layout.clock.y >= 0 && layout.clock.x < width && layout.clock.y < height, `${label}: the clock is on the stage`);
      if (!reduced && width > 640) {
        assert.ok(layout.box.y0 >= 64, `${label}: below the site header`);
        assert.ok(layout.box.y1 <= height - 100, `${label}: room for the controls of chapter live`);
        assert.equal(layout.keeps.length, 2, `${label}: the captions at the bottom left and the top left are kept clear`);
        const bottom = layout.keeps[0];
        assert.ok(bottom.y1 === height && bottom.x0 === 0 && bottom.x1 > width * 0.3, `${label}: the keep-out covers the caption width`);
      }
      if (!reduced && width <= 640) {
        assert.deepEqual(layout.keeps, [], `${label}: a phone has no side captions`);
        assert.ok(layout.box.y0 >= 64 + 64 + Math.max(copy.top, copy.bottom), `${label}: below the top caption band`);
        assert.ok(layout.clock.y > layout.box.y1, `${label}: the run clock is below the block`);
      }
      if (reduced) assert.ok(layout.keeps.length <= 1, `${label}: a static frame has its captions below it, so only the clock is kept clear`);
    }
  }
});

test('the fit centres the bounds in the region and keeps their shape', () => {
  const fit = H.storyBlockFit({ u0: -2, u1: 6, v0: 1, v1: 5 }, { x0: 100, y0: 50, x1: 500, y1: 450 });
  near(fit.scale, 50);
  near(fit.ox + -2 * fit.scale, 100);
  near(fit.ox + 6 * fit.scale, 500);
  near(fit.oy + 1 * fit.scale, 150, 1e-9);
  near(fit.oy + 5 * fit.scale, 350, 1e-9);
  const tall = H.storyBlockFit({ u0: 0, u1: 1, v0: 0, v1: 4 }, { x0: 0, y0: 0, x1: 400, y1: 400 });
  near(tall.scale, 100);
  near(tall.ox + 1 * tall.scale - (tall.ox + 0 * tall.scale), 100);
  assert.ok(H.storyBlockFit({ u0: 1, u1: 1, v0: 1, v1: 1 }, { x0: 0, y0: 0, x1: 10, y1: 10 }).scale > 0, 'a point does not divide by zero');
});

test('the placement moves the block right until it clears a keep-out rectangle', () => {
  const pu = [0, 1, 0, 1];
  const pv = [0, 0, 1, 1];
  const bounds = { u0: 0, u1: 1, v0: 0, v1: 1 };
  const region = { x0: 0, y0: 0, x1: 1000, y1: 400 };
  const free = H.storyBlockPlace(pu, pv, bounds, region, []);
  assert.deepEqual([free.scale, free.ox], [400, 300], 'no keep-out: centred');
  const keeps = [{ x0: 0, y0: 100, x1: 500, y1: 500 }];
  const moved = H.storyBlockPlace(pu, pv, bounds, region, keeps);
  assert.ok(H.storyBlockClear(pu, pv, moved, keeps), 'no corner is inside the rectangle');
  assert.ok(moved.ox > free.ox - 1e-9, 'the block moved right or stayed');
  assert.equal(H.storyBlockClear(pu, pv, free, keeps), false, 'the centred block would touch the keep-out');
});

test('the cut-away stands at the crest and at the well, and the painter order is back to front', () => {
  for (const [nx, ny, nz, icut, jcut] of [[30, 18, 5, 11, 8], [20, 12, 4, 8, 5]]) {
    const grid = StoryGeometry.storyGrid(nx, ny, nz);
    const cut = H.storyBlockCut(grid.xs, grid.ys, StoryGeometry.STORY_SCENARIO.dome.x + 0.25, StoryGeometry.STORY_SCENARIO.wellY + 0.25);
    assert.deepEqual(cut, { icut, jcut }, `${nx}x${ny}`);
    near(grid.xs[cut.icut], 10, 0.4);
    near(grid.ys[cut.jcut], 5.5, 0.5);
    const order = H.storyBlockOrder(nx, ny, cut);
    const removed = (nx - icut) * (ny - jcut);
    assert.equal(order.length, nx * ny - removed, 'the cut-away quarter is not drawn');
    assert.equal(new Set(order).size, order.length, 'each column once');
    let last = -1;
    for (const column of order) {
      const i = column % nx;
      const j = (column - i) / nx;
      assert.ok(!(i >= icut && j >= jcut), 'no removed column');
      assert.ok(i + j >= last, 'a column comes after all columns that it can hide');
      last = i + j;
    }
  }
});

test('the visible side faces: the block edge, the cut and the fault, and no hidden face between two equal neighbours', () => {
  const grid = StoryGeometry.storyGrid(30, 18, 5);
  const cut = { icut: 11, jcut: 8 };
  const flags = H.storyBlockFaces(grid.top, grid.nx, grid.ny, cut);
  const east = c => (flags[c] & H.STORY_BLOCK_FACE_EAST) !== 0;
  const north = c => (flags[c] & H.STORY_BLOCK_FACE_NORTH) !== 0;
  const col = (i, j) => j * grid.nx + i;
  for (let j = 0; j < grid.ny; j++) {
    if (j < cut.jcut) assert.ok(east(col(grid.nx - 1, j)), `the east edge, row ${j}`);
    else assert.ok(east(col(cut.icut - 1, j)), `the east cut face, row ${j}`);
  }
  for (let i = 0; i < grid.nx; i++) {
    if (i < cut.icut) assert.ok(north(col(i, grid.ny - 1)), `the north edge, column ${i}`);
    else assert.ok(north(col(i, cut.jcut - 1)), `the north cut face, column ${i}`);
  }
  for (let j = 0; j < grid.ny; j++) assert.ok(east(col(grid.faultLine.index - 1, j)), `the fault scarp, row ${j}`);
  for (let j = 0; j < grid.ny; j++) for (let i = 0; i < grid.nx; i++) {
    if (i >= cut.icut && j >= cut.jcut) { assert.equal(flags[col(i, j)], 0, 'a removed column has no face'); continue; }
    const edge = i === grid.nx - 1 || (i === cut.icut - 1 && j >= cut.jcut) || i === grid.faultLine.index - 1;
    if (!edge) assert.ok(!east(col(i, j)), `no east face inside the block (${i}, ${j})`);
    const front = j === grid.ny - 1 || (j === cut.jcut - 1 && i >= cut.icut);
    if (!front) assert.ok(!north(col(i, j)), `no north face inside the block (${i}, ${j})`);
  }
});

test('cell fill, band, methane share and tone', () => {
  assert.equal(H.storyBlockCellFill(0.5, 0, 5), 1);
  near(H.storyBlockCellFill(0.5, 2, 5), 0.5);
  assert.equal(H.storyBlockCellFill(0.5, 3, 5), 0);
  assert.equal(H.storyBlockCellFill(1, 4, 5), 1);
  assert.equal(H.storyBlockCellFill(0, 0, 5), 0);
  for (let k = 1; k < 5; k++) assert.ok(H.storyBlockCellFill(0.37, k, 5) <= H.storyBlockCellFill(0.37, k - 1, 5), 'the cells fill from the top');
  assert.deepEqual([0, 0.019, 0.02, 0.119, 0.12, 0.3, 0.47, 0.59, 0.6, 5].map(H.storyBlockBand), [0, 0, 1, 1, 2, 3, 4, 5, 5, 5]);
  assert.deepEqual([0, 0.1, 0.5, 0.9, 1, 5, NaN].map(H.storyBlockKind), [0, 0, 2, 4, 4, 4, 0]);
  assert.equal(H.storyBlockTone(0), 4, 'a flat top has a light tone');
  assert.ok(H.storyBlockTone(1) < H.storyBlockTone(-1), 'a face that rises toward the viewer is lighter');
  assert.deepEqual([H.storyBlockTone(-100), H.storyBlockTone(100), H.storyBlockTone(NaN)], [16, 0, 0]);
});

test('the run clock counts from 0 to 18 h 40 min', () => {
  assert.equal(H.storyBlockClock(0), '0 min');
  assert.equal(H.storyBlockClock(1), '18 h 40 min');
  assert.equal(H.storyBlockClock(0.5), '9 h 20 min');
  assert.equal(H.storyBlockClock(0.01), '11 min');
  assert.equal(H.storyBlockClock(2), '18 h 40 min');
  assert.equal(H.storyBlockClock(-1), '0 min');
  assert.match(H.storyBlockClock(0.9), /^16 h 48 min$/);
  let last = -1;
  for (const f of sweep()) {
    const text = H.storyBlockClock(f);
    const match = /^(?:(\d+) h )?(\d+) min$/.exec(text);
    assert.ok(match, text);
    const minutes = (match[1] ? Number(match[1]) * 60 : 0) + Number(match[2]);
    assert.ok(minutes >= last, 'the clock never goes back');
    last = minutes;
  }
  assert.equal(H.STORY_BLOCK_RUN_MINUTES, 1120);
});

test('chapter grid: pillars first, then layers, then the 3D run from year 0 to year 30', () => {
  const at = local => H.storyBlockGrid(local);
  assert.deepEqual([at(0).pillars, at(0).layers, at(0).gas, at(0).year, at(0).sharp, at(0).bands], [0, 0, 0, 0, 0, 0]);
  assert.equal(at(0.15).pillars, 1);
  assert.ok(at(0.1).pillars > 0 && at(0.1).pillars < 1);
  assert.equal(at(0.15).layers, 0, 'the layers wait for the pillars');
  assert.equal(at(0.3).layers, 1, 'the grid is complete at 0.3');
  assert.equal(at(0.3).year, 0);
  assert.equal(at(0.3).gas, 0, 'the gas shows after the grid');
  near(at(0.65).year, 15);
  const end = at(1);
  assert.deepEqual([end.pillars, end.layers, end.gas, end.year, end.sharp, end.bands, end.bracket], [1, 1, 1, 30, 0, 0, 0]);
  let last = { pillars: 0, layers: 0, gas: 0, year: 0, labels: 0 };
  for (const local of sweep()) {
    const s = at(local);
    for (const key of Object.keys(last)) {
      assert.ok(s[key] >= last[key] - 1e-12, `${key} never goes back`);
      assert.ok(s[key] >= 0 && (key === 'year' ? s[key] <= 30 : s[key] <= 1), `${key} is in range`);
    }
    if (s.layers > 0) assert.ok(s.pillars > 0.85, 'a layer line needs the pillars');
    assert.ok(s.clockAlpha >= 0 && s.clockAlpha <= 1);
    last = { pillars: s.pillars, layers: s.layers, gas: s.gas, year: s.year, labels: s.labels };
  }
  assert.equal(at(0.2).clockAlpha, 0, 'no clock before the run');
  assert.equal(at(1).clockAlpha, 0, 'the clock gives way to the counter');
  assert.equal(at(0.7).clockAlpha, 1);
  const reused = {};
  assert.equal(H.storyBlockGrid(0.5, reused), reused, 'a given object is filled and returned (no new object in the draw loop)');
});

test('chapter ve: layer lines fade first, then bands, bracket and counter; the year stays 30', () => {
  const at = local => H.storyBlockVe(local);
  assert.deepEqual([at(0).sharp, at(0).bands, at(0).bracket, at(0).year, at(0).pillars, at(0).layers, at(0).gas], [0, 0, 0, 30, 1, 1, 1]);
  assert.equal(at(0.5).sharp, 1, 'each column is one cell at 0.5');
  assert.equal(at(0.5).bands, 0, 'the bands wait');
  assert.equal(at(0.6).bracket, 0);
  assert.ok(at(0.3).sharp > 0 && at(0.3).sharp < 1);
  assert.equal(at(1).bands, 1);
  assert.equal(at(1).bracket, 1);
  assert.equal(at(1).sharp, 1);
  let last = { sharp: 0, bands: 0, bracket: 0, counterAlpha: 0 };
  for (const local of sweep()) {
    const s = at(local);
    for (const key of Object.keys(last)) assert.ok(s[key] >= last[key] - 1e-12 && s[key] <= 1, `${key} grows`);
    assert.equal(s.year, 30);
    last = { sharp: s.sharp, bands: s.bands, bracket: s.bracket, counterAlpha: s.counterAlpha };
  }
  assert.ok(at(0.4).counterAlpha === 1, 'the counter shows during the whole chapter');
});

test('chapter live: the notes of chapter ve fade out, and the 3D cells switch brings the layer lines back', () => {
  const columns = H.storyBlockLive(0, 0, 30);
  assert.deepEqual([columns.sharp, columns.bands, columns.bracket, columns.counterAlpha, columns.year], [1, 1, 1, 1, 30]);
  const later = H.storyBlockLive(0.5, 0, 44);
  assert.deepEqual([later.bracket, later.counterAlpha, later.year], [0, 0, 44]);
  const cells = H.storyBlockLive(0.5, 1, 44);
  assert.deepEqual([cells.sharp, cells.bands], [0, 0], 'the 3D cells show the cell colours and the layer lines');
  const half = H.storyBlockLive(0.5, 0.5, 44);
  assert.deepEqual([half.sharp, half.bands], [0.5, 0.5]);
});

test('the counter goes from the number of cells to the number of columns to solve', () => {
  assert.deepEqual(H.storyBlockCounter(2700, 540, 0), { big: '2,700 cells', small: 'in this 3D model' });
  assert.deepEqual(H.storyBlockCounter(2700, 540, 0.5), { big: '2,700 cells', small: 'in this 3D model' });
  assert.deepEqual(H.storyBlockCounter(2700, 540, 1), { big: '540 columns', small: 'to solve, not 2,700 cells' });
  const mid = H.storyBlockCounter(2700, 540, 0.75);
  assert.match(mid.big, /^1,6\d\d columns$/);
  let last = Infinity;
  for (const local of sweep()) {
    const n = Number(H.storyBlockCounter(2700, 540, local).big.replace(/[^\d]/g, ''));
    assert.ok(n <= last && n >= 540 && n <= 2700, 'the number only goes down');
    last = n;
  }
  assert.equal(H.storyBlockInt(1234567), '1,234,567');
  assert.equal(H.storyBlockInt(12), '12');
});

test('the year mapping picks the two nearest stored frames and blends their columns', () => {
  const years = Array.from(storedRun.years);
  const pair = {};
  assert.deepEqual(H.storyBlockFramePair(years, -5, pair), { lo: 0, hi: 0, t: 0 });
  assert.equal(H.storyBlockFramePair(years, 0, pair), pair, 'the out object is reused');
  assert.deepEqual({ ...H.storyBlockFramePair(years, 3, pair) }, { lo: 2, hi: 3, t: 1 / 3 });
  assert.deepEqual({ ...H.storyBlockFramePair(years, 30, pair) }, { lo: 8, hi: 9, t: 0 });
  near(H.storyBlockFramePair(years, 12.5, pair).t, 0.5);
  assert.deepEqual({ ...H.storyBlockFramePair(years, 250, pair) }, { lo: years.length - 1, hi: years.length - 1, t: 0 });
  assert.deepEqual({ ...H.storyBlockFramePair(Array.from({ length: 101 }, (_, i) => i), 57.25, {}) }, { lo: 57, hi: 58, t: 0.25 });

  const a = { h: Float32Array.from([0, 0.4, 0.2, 0]), ch4: Float32Array.from([0, 1, 0, 0]) };
  const b = { h: Float32Array.from([0.2, 0.4, 0, 0]), ch4: Float32Array.from([0, 0, 0, 0]) };
  const out = { h: new Float32Array(4), ch4: new Float32Array(4) };
  assert.equal(H.storyBlockBlend(out, a, b, 0.5), out);
  assert.deepEqual(Array.from(out.h).map(v => Number(v.toFixed(6))), [0.1, 0.4, 0.1, 0]);
  assert.deepEqual(Array.from(out.ch4).map(v => Number(v.toFixed(6))), [0, 0.5, 0, 0], 'the methane share follows the gas thickness');
  H.storyBlockBlend(out, a, b, 0);
  assert.deepEqual(Array.from(out.h), Array.from(a.h));
  H.storyBlockBlend(out, a, b, 1);
  assert.deepEqual(Array.from(out.h), Array.from(b.h));
});

test('the player steps in real time, ignores a long gap and stops at the last year', () => {
  assert.equal(H.storyBlockStep(1000, null), 0);
  assert.equal(H.storyBlockStep(1016, 1000), 16);
  assert.equal(H.storyBlockStep(9000, 1000), 250, 'a hidden tab counts as 250 ms');
  assert.equal(H.storyBlockStep(900, 1000), 0, 'time does not go back');
  assert.equal(H.STORY_BLOCK_RATE, 4);
  near(H.storyBlockAdvance(30, 1000, 100), 34);
  near(H.storyBlockAdvance(30, 250, 100), 31);
  assert.equal(H.storyBlockAdvance(99.9, 1000, 100), 100);
  assert.equal(H.storyBlockAdvance(100, 16, 100), 100);
});

test('the colours come from the story tokens: CO2 is the only blue, methane is brick red', () => {
  const pal = H.storyBlockPalette(STORY_COLORS);
  const T = H.STORY_BLOCK_TONES;
  const S = H.STORY_BLOCK_STEPS;
  const K = H.STORY_BLOCK_KINDS;
  assert.equal(pal.gas.length, K);
  assert.equal(pal.gas[0], STORY_COLORS.co2);
  assert.equal(pal.gas[K - 1], STORY_COLORS.ch4);
  assert.equal(pal.rock.length, T);
  assert.equal(pal.fill.length, K * T * (S + 1));
  assert.equal(pal.band.length, K * H.STORY_BLOCK_BANDS * H.STORY_BLOCK_TOPS);
  assert.equal(pal.line.length, 21);
  assert.equal(pal.line[0], 'rgba(255, 244, 223, 0.00)');
  assert.equal(pal.line[20], 'rgba(255, 244, 223, 1.00)');
  const all = [...pal.gas, ...pal.rock, ...pal.fill, ...pal.band, ...pal.edge];
  assert.ok(all.every(color => /^#[0-9a-f]{6}$/.test(color)), 'all colours are plain hex colours');
  const channels = color => [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
  for (const color of pal.rock) { const [r, , b] = channels(color); assert.ok(r > b + 40, `the rock is warm: ${color}`); }
  const fillAt = (kind, tone, step) => pal.fill[(kind * T + tone) * (S + 1) + step];
  for (let tone = 0; tone < T; tone++) assert.equal(fillAt(0, tone, 0), pal.rock[tone], 'a cell without gas has the colour of the rock');
  assert.equal(fillAt(0, 3, S), H.storyBlockTint(STORY_COLORS.co2, -0.06 + 0.02 * 3), 'a full cell is the CO2 colour in the tone of its face');
  assert.equal(fillAt(K - 1, H.STORY_BLOCK_EAST, S), H.storyBlockTint(STORY_COLORS.ch4, 0.22), 'the east face is darker');
  assert.equal(pal.band[(0 * 5 + 3) * H.STORY_BLOCK_TOPS + 2], H.storyBlockTint(STORY_COLORS.co2, -0.06 + 0.02 * 2), 'the fourth band is the token');
  // The CO2 kind is the blue. Methane and the rock are not blue.
  const blue = color => { const [r, g, b] = channels(color); return b > r + 40 && b > g + 20; };
  for (let tone = 0; tone < T; tone++) {
    assert.ok(blue(fillAt(0, tone, S)), 'a full CO2 cell is blue');
    for (let step = 0; step <= S; step++) assert.ok(!blue(fillAt(K - 1, tone, step)), 'methane has no blue part');
  }
  for (const color of pal.rock) assert.ok(!blue(color), 'the rock is not blue');
  const band = (kind, b, tone) => pal.band[(kind * 5 + b) * H.STORY_BLOCK_TOPS + tone];
  const light = channels(band(0, 0, 2));
  const dark = channels(band(0, 4, 2));
  assert.ok(light[0] > dark[0] && light[1] > dark[1] && light[2] > dark[2], 'the bands go from light to dark');
});

test('locate and nearest edge', () => {
  const edges = [0, 1, 2, 4, 8];
  assert.deepEqual([-1, 0, 0.5, 1, 3.9, 4, 7.99, 8, 20].map(v => H.storyBlockLocate(edges, v)), [0, 0, 0, 1, 2, 3, 3, 3, 3]);
  assert.equal(H.storyBlockNearest(edges, 3.5), 3);
  assert.equal(H.storyBlockNearest(edges, 0), 1, 'the cut is never on the outer edge');
  assert.equal(H.storyBlockNearest(edges, 99), 3);
  const axes = H.storyBlockAxes({ theta: 0, elevation: Math.PI / 2 });
  near(axes.ex, 1); near(axes.ey, 0); near(axes.nx, 0); near(axes.ny, 1); near(axes.zy, 0);
  const wide = H.storyBlockExaggeration({ theta: 0.49, zFrac: 0.15 }, { width: 15, height: 9 }, 211);
  assert.ok(wide > 9 && wide < 20, `the depth is drawn about 12 times larger (${wide})`);
});

// ---- the code that draws, run with a small fake page and the real model data

const makeCtx = () => {
  const ctx = {
    fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, font: '', textAlign: '', textBaseline: '', lineJoin: '', lineCap: '',
    counts: {}, fills: [], texts: [], numbers: 0, bad: 0, alphas: new Set(), transforms: [],
  };
  const count = name => { ctx.counts[name] = (ctx.counts[name] || 0) + 1; };
  const numbers = args => args.forEach(value => { ctx.numbers += 1; if (typeof value !== 'number' || !Number.isFinite(value)) ctx.bad += 1; });
  for (const name of ['save', 'restore', 'beginPath', 'closePath', 'stroke']) ctx[name] = () => count(name);
  ctx.fill = () => { count('fill'); ctx.fills.push(ctx.fillStyle); ctx.alphas.add(ctx.globalAlpha); };
  ctx.clearRect = (...args) => { count('clearRect'); numbers(args); };
  ctx.setTransform = (...args) => { count('setTransform'); ctx.transforms.push(args); numbers(args); };
  ctx.moveTo = (...args) => { count('moveTo'); numbers(args); };
  ctx.lineTo = (...args) => { count('lineTo'); numbers(args); };
  ctx.arc = (...args) => { count('arc'); numbers(args); };
  ctx.fillText = (text, x, y) => { count('fillText'); numbers([x, y]); ctx.texts.push(text); };
  return ctx;
};

const makeElement = tag => {
  const el = { tag, children: [], attrs: {}, className: '', listeners: {}, textContent: '', parentNode: null, checked: false, value: '', style: {} };
  el.style.setProperty = (name, value) => { el.style[name] = value; };
  el.setAttribute = (name, value) => { el.attrs[name] = String(value); if (name === 'value') el.value = String(value); };
  el.getAttribute = name => (name in el.attrs ? el.attrs[name] : null);
  el.appendChild = child => { child.parentNode = el; el.children.push(child); return child; };
  el.removeChild = child => { el.children.splice(el.children.indexOf(child), 1); child.parentNode = null; };
  el.addEventListener = (name, fn) => { (el.listeners[name] = el.listeners[name] || []).push(fn); };
  el.fire = name => (el.listeners[name] || []).forEach(fn => fn({ target: el }));
  return el;
};
const walk = (node, found = []) => { found.push(node); node.children.forEach(child => walk(child, found)); return found; };

// The source of StoryBlock.jsx, run in a function with the page globals that the bundle gives it.
const loadBlock = ({ reduced = false, withWorker = true, fetchFails = false } = {}) => {
  asked.count = 0;
  const page = {
    registry: {}, events: [], fetches: 0, workers: [], errors: [],
    document: { hidden: false, listeners: {}, createElement: makeElement },
  };
  page.document.addEventListener = (name, fn) => { page.document.listeners[name] = fn; };
  page.document.removeEventListener = name => { delete page.document.listeners[name]; };
  page.window = { dispatchEvent: event => { page.events.push(event.type); }, matchMedia: () => ({ matches: reduced }) };
  class Event { constructor(type) { this.type = type; } }
  class Worker {
    constructor(url) { this.url = url; this.messages = []; this.terminated = false; page.workers.push(this); }
    postMessage(message) { this.messages.push(message); }
    terminate() { this.terminated = true; }
  }
  const fetchRun = url => {
    page.fetches += 1;
    page.fetchUrl = url;
    return fetchFails ? Promise.reject(new Error('offline')) : Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(storedRun))) });
  };
  const guard = (key, run) => { try { run(); } catch (error) { page.errors.push([key, error]); } };
  const body = `${blockSource}\nreturn { storyBlockData, storyBlockState, storyLive, storyBlockBuild, storyBlockLayout };`;
  const api = new Function('STORY_COLORS', 'storyClamp', 'STORY_RENDERERS', 'storyGuard', 'StoryGeometry', 'SITE_STORY', 'document', 'window', 'fetch', 'Worker', 'Event', 'console', body)(
    STORY_COLORS, storyClamp, page.registry, guard, StoryGeometry, SITE_STORY, page.document, page.window, fetchRun, withWorker ? Worker : undefined, Event,
    { error: (...args) => page.errors.push(['console', args]) });
  Object.assign(page, api);
  return page;
};

// The requestDraw of the pinned stage: one function for all frames. It counts the calls.
// page.events collects the events that the code sends to the window. The code must send none.
const asked = { count: 0 };
const redraw = () => { asked.count += 1; };
const frame = (local, width = 1280, height = 800, extra = {}) => ({ local, p: 0.5, width, height, dpr: 2, time: 0, reducedMotion: false, requestDraw: redraw, ...extra });
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

test('StoryBlock.jsx registers grid, ve and live, and leaves the other chapters alone', () => {
  const page = loadBlock();
  assert.deepEqual(Object.keys(page.registry), ['grid', 've', 'live']);
  for (const id of ['grid', 've', 'live']) assert.equal(typeof page.registry[id].draw, 'function', `${id} draws`);
  assert.equal(page.registry.grid.animated, false);
  assert.equal(page.registry.ve.animated, false);
  assert.equal(page.registry.live.animated, false);
  assert.equal(typeof page.registry.live.mount, 'function');
  assert.equal(typeof page.registry.live.unmount, 'function');
  assert.equal(page.registry.grid.mount, undefined, 'only live has a layer');
  assert.equal(page.fetches, 0, 'nothing loads before the first draw');
});

test('the first draw loads the stored run and draws the rock; the arrival of the run asks the stage for one more draw', async () => {
  const page = loadBlock();
  const grid = page.registry.grid;
  const ctx = makeCtx();
  grid.draw(ctx, frame(0.8));
  assert.equal(page.fetches, 1);
  assert.equal(page.fetchUrl, './assets/story-run.json');
  assert.equal(grid.animated, false, 'the stage does not draw on each frame while the run loads');
  assert.deepEqual(page.events, [], 'no synthetic event');
  assert.equal(asked.count, 0, 'no request before the run arrives');
  assert.equal(ctx.bad, 0, 'all coordinates are finite');
  assert.ok(ctx.counts.fill > 300, 'the rock is drawn');
  assert.equal(page.storyBlockData.stored.status, 'loading');
  assert.equal(page.storyBlockState.waiting.size, 1, 'the draw waits with the requestDraw of its frame');
  grid.draw(ctx, frame(0.8));
  page.registry.ve.draw(makeCtx(), frame(0.3));
  assert.equal(page.fetches, 1, 'one load only');
  assert.equal(page.storyBlockState.waiting.size, 1, 'the same function of the stage is kept once');
  assert.equal(asked.count, 0);
  await settle();
  assert.equal(page.storyBlockData.stored.status, 'ready');
  assert.equal(page.storyBlockData.stored.entries.length, 12);
  assert.equal(asked.count, 1, 'the arrival asks for one more draw, once');
  assert.equal(page.storyBlockState.waiting.size, 0);
  assert.deepEqual(page.events, [], 'still no synthetic event');
  assert.equal(grid.animated, false, 'the stage rests: it draws once because it was asked');
  const after = makeCtx();
  grid.draw(after, frame(0.8));
  assert.equal(grid.animated, false);
  assert.equal(after.bad, 0);
  assert.ok(after.fills.some(color => color === STORY_COLORS.co2 || /^#[0-9a-f]{6}$/.test(color)));
  assert.equal(page.fetches, 1);
  assert.equal(asked.count, 1, 'a draw after the arrival asks for nothing');
  assert.equal(page.storyBlockState.waiting.size, 0);
});

test('chapter grid at the end shows the run clock, the labels and the gas on the block', async () => {
  const page = loadBlock();
  page.registry.grid.draw(makeCtx(), frame(1));
  await settle();
  const ctx = makeCtx();
  page.registry.grid.draw(ctx, frame(1));
  assert.equal(ctx.bad, 0);
  assert.equal(ctx.texts.filter(text => text === '18 h 40 min').length, 0, 'the clock gives way to the counter at the very end');
  const mid = makeCtx();
  page.registry.grid.draw(mid, frame(0.9));
  const texts = mid.texts;
  assert.ok(texts.includes('Gas cap (methane)') && texts.includes('CO₂') && texts.includes('Fault') && texts.includes('Injection well'), 'the four labels');
  assert.ok(texts.some(text => /^\d+ h \d\d min$/.test(text)), 'the run clock');
  assert.ok(texts.includes('3D run time so far, for a typical') && texts.includes('field model (for illustration)'), 'the clock says that it is a typical model');
  assert.ok(texts.some(text => /^Depth exaggerated ×\d+$/.test(text)), 'the note about the depth');
  const palette = page.storyBlockState.palette;
  assert.ok(mid.fills.some(color => palette.gas.includes(color) || palette.fill.slice(0, 275).includes(color)), 'gas colours are used');
  const methane = palette.fill.filter((_, i) => Math.floor(i / (H.STORY_BLOCK_TONES * (H.STORY_BLOCK_STEPS + 1))) === 4);
  const co2 = palette.fill.filter((_, i) => Math.floor(i / (H.STORY_BLOCK_TONES * (H.STORY_BLOCK_STEPS + 1))) === 0);
  assert.ok(mid.fills.some(color => methane.includes(color) && !co2.includes(color)), 'methane red cells');
  assert.ok(mid.fills.some(color => co2.includes(color) && !palette.rock.includes(color)), 'CO2 blue cells');
});

test('chapter grid draws the grid onto plain rock before the run: no gas colours and no labels', async () => {
  const page = loadBlock();
  page.registry.grid.draw(makeCtx(), frame(0.2));
  await settle();
  const ctx = makeCtx();
  page.registry.grid.draw(ctx, frame(0.2));
  const pal = page.storyBlockState.palette;
  assert.ok(ctx.fills.every(color => pal.rock.includes(color)), 'only rock tones');
  assert.deepEqual(ctx.texts.filter(text => /Gas cap|Injection|Fault|CO₂/.test(text)), [], 'no label before the grid is complete');
  assert.ok(ctx.counts.stroke > 100, 'the grid lines');
  const start = makeCtx();
  page.registry.grid.draw(start, frame(0));
  assert.ok(start.counts.stroke < ctx.counts.stroke, 'the pillars have not drawn yet');
  assert.ok(start.fills.every(color => pal.rock.includes(color)));
  assert.deepEqual(start.texts.filter(text => /\d+ (h|min)/.test(text)), [], 'no run clock before the run');
});

test('chapter ve shows the cells, then the columns: counts, bands and the bracket', async () => {
  const page = loadBlock();
  page.registry.ve.draw(makeCtx(), frame(0));
  await settle();
  const pal = page.storyBlockState.palette;
  const start = makeCtx();
  page.registry.ve.draw(start, frame(0.1));
  assert.ok(start.texts.includes('2,700 cells'), 'the cells of the 30 x 18 x 5 grid');
  const half = makeCtx();
  page.registry.ve.draw(half, frame(0.5));
  assert.ok(half.texts.includes('2,700 cells'));
  const end = makeCtx();
  page.registry.ve.draw(end, frame(1));
  assert.equal(end.bad, 0);
  assert.ok(end.texts.includes('540 columns') && end.texts.includes('to solve, not 2,700 cells'), 'the columns to solve');
  assert.ok(end.texts.includes('h') && end.texts.includes('One cell per column; brine below h'), 'the bracket and its note');
  assert.ok(page.storyBlockState.block.bracket >= 0, 'a column holds the bracket');
  const column = page.storyBlockState.block.bracket;
  const { grid, cut } = page.storyBlockState.block;
  assert.equal(column % grid.nx, cut.icut - 1, 'the bracket stands on the cut face');
  assert.ok(column / grid.nx >= cut.jcut);
  const bands = pal.band;
  assert.ok(end.fills.some(color => bands.includes(color)), 'the top face shows the bands');
  assert.ok(end.counts.fill < half.counts.fill + 600, 'the draw stays small');
  assert.ok(start.counts.fill > end.counts.fill - 700);
  const dense = makeCtx();
  page.registry.ve.draw(dense, frame(0));
  const sparse = makeCtx();
  page.registry.ve.draw(sparse, frame(0.5));
  assert.ok(sparse.counts.stroke < dense.counts.stroke, 'the layer lines are gone at 0.5');
});

test('the block is built once for a stage size and rebuilt only when the size changes', async () => {
  const page = loadBlock();
  page.registry.grid.draw(makeCtx(), frame(0.6));
  await settle();
  const first = page.storyBlockState.block;
  const builds = page.storyBlockState.builds;
  for (const local of [0.61, 0.7, 0.9]) page.registry.grid.draw(makeCtx(), frame(local));
  page.registry.ve.draw(makeCtx(), frame(0.4));
  assert.equal(page.storyBlockState.block, first, 'the same block');
  assert.equal(page.storyBlockState.builds, builds, 'no build in the draw loop');
  page.registry.grid.draw(makeCtx(), frame(0.6, 1000, 700));
  assert.notEqual(page.storyBlockState.block, first);
  assert.equal(page.storyBlockState.builds, builds + 1);
  page.registry.grid.draw(makeCtx(), frame(0.6, 390, 844));
  assert.equal(page.storyBlockState.block.grid.nx, 20, 'a phone gets the small grid');
});

test('at every stage size the block and the labels stay on the stage and clear of the captions', async () => {
  const page = loadBlock();
  page.registry.grid.draw(makeCtx(), frame(0.6));
  await settle();
  for (const [width, height] of [[1280, 800], [1920, 1080], [1024, 768], [1440, 900], [768, 1024], [390, 844], [360, 640], [412, 915]]) {
    for (const reducedMotion of [false, true]) {
      page.registry.live.draw(makeCtx(), frame(1, width, height, { reducedMotion }));
      const block = page.storyBlockState.block;
      const label = `${width}x${height}${reducedMotion ? ' static' : ''}`;
      const { layout } = block;
      let inside = true;
      let clear = true;
      for (const column of block.order) {
        for (let k = 0; k < 4; k++) {
          const x = block.X[4 * column + k];
          for (const y of [block.YT[4 * column + k], block.YB[4 * column + k]]) {
            if (x < 0 || x > width || y < 0 || y > height) inside = false;
            if (layout.keeps.some(rect => x > rect.x0 && x < rect.x1 && y > rect.y0 && y < rect.y1)) clear = false;
          }
        }
      }
      assert.ok(inside, `${label}: every corner is on the stage`);
      assert.ok(clear, `${label}: no corner is inside a caption area`);
      assert.ok(block.edge.top >= layout.box.y0 && block.edge.bottom <= layout.box.y1, `${label}: the block is inside the box`);
      for (const text of block.labels) {
        assert.ok(text.x >= 0 && text.x <= width, `${label}: anchor of ${text.id}`);
        assert.ok(text.y + text.dy >= 0 && text.y + text.dy <= height, `${label}: label ${text.id} is on the stage (y)`);
        const reach = text.id === 'well' ? 0 : text.dx;
        assert.ok(text.x + reach > 0 && text.x + reach < width, `${label}: label ${text.id} is on the stage (x)`);
      }
      if (!reducedMotion && width > 640) assert.ok(block.well.y0 - block.well.up > 72, `${label}: the well label is below the site header`);
      if (!reducedMotion && width <= 640) {
        assert.ok(block.edge.top - layout.fonts.label * 2 > layout.box.y0 - 2, `${label}: the top labels stay below the caption band`);
        assert.ok(block.labels.every(item => item.y + item.dy - layout.fonts.label > layout.box.y0 - 4), `${label}: labels below the caption band`);
      }
    }
  }
});

test('a static frame (reduced motion) draws once with local 1 and asks to paint again when the run has loaded', async () => {
  const page = loadBlock({ reduced: true });
  // Each static frame has its own requestDraw. The test counts the calls of each one.
  const asks = { ve: 0, grid: 0, live: 0 };
  const staticFrame = id => frame(1, 1000, 562.5, { reducedMotion: true, time: 0, requestDraw: () => { asks[id] += 1; } });
  const frames = { ve: staticFrame('ve'), grid: staticFrame('grid'), live: staticFrame('live') };
  const ctx = makeCtx();
  page.registry.ve.draw(ctx, frames.ve);
  assert.equal(page.registry.ve.animated, false, 'a static frame never asks for more frames');
  assert.deepEqual(page.events, [], 'and sends no event');
  assert.equal(page.storyBlockState.waiting.size, 1, 'it waits with its own requestDraw');
  assert.ok(!ctx.fills.some(color => page.storyBlockState.palette.band.includes(color)), 'before the run there are no gas bands');
  page.registry.grid.draw(makeCtx(), frames.grid);
  page.registry.live.draw(makeCtx(), frames.live);
  assert.equal(page.storyBlockState.waiting.size, 3, 'one entry for each static frame');
  assert.equal(page.fetches, 1, 'one load for all frames');
  assert.equal(page.workers.length, 0, 'no worker in a static frame');
  assert.deepEqual(asks, { ve: 0, grid: 0, live: 0 });
  assert.equal(asked.count, 0, 'the pinned stage was not asked');

  await settle();
  assert.deepEqual(asks, { ve: 1, grid: 1, live: 1 }, 'each static frame is asked once, to paint itself again');
  assert.equal(page.storyBlockState.waiting.size, 0);
  assert.equal(asked.count, 0);

  // The repaint: the static frame calls draw again with the same frame.
  const repaint = makeCtx();
  page.registry.ve.draw(repaint, frames.ve);
  assert.ok(repaint.texts.includes('540 columns'), 'the repaint shows the VE columns with the real counts');
  assert.ok(repaint.fills.some(color => page.storyBlockState.palette.band.includes(color)), 'and the bands');
  const liveAfter = makeCtx();
  page.registry.live.draw(liveAfter, frames.live);
  assert.ok(liveAfter.texts.includes('Gas cap (methane)'));
  assert.equal(page.registry.live.animated, false);
  const gridAfter = makeCtx();
  page.registry.grid.draw(gridAfter, frames.grid);
  assert.ok(gridAfter.fills.some(color => page.storyBlockState.palette.fill.includes(color) && !page.storyBlockState.palette.rock.includes(color)), 'grid at year 30 with the cells');
  assert.ok(gridAfter.counts.stroke > 300, 'the grid lines are all there');
  assert.deepEqual(asks, { ve: 1, grid: 1, live: 1 }, 'the repaints ask for nothing more');
  assert.equal(page.storyLive.redraw, null, 'a static frame is not the player');
});

test('a failed load leaves the rock, reports once and puts the stage to rest', async () => {
  const page = loadBlock({ fetchFails: true });
  page.registry.grid.draw(makeCtx(), frame(0.8));
  await settle();
  assert.equal(page.storyBlockData.stored.status, 'failed');
  assert.equal(asked.count, 1, 'the failure also asks for one draw, so that the stage shows the final state');
  assert.equal(page.errors.filter(([key]) => key === 'console').length, 1);
  const ctx = makeCtx();
  page.registry.grid.draw(ctx, frame(0.8));
  assert.equal(page.registry.grid.animated, false);
  assert.equal(ctx.bad, 0);
  assert.ok(ctx.fills.filter(color => color !== STORY_COLORS.ink).every(color => page.storyBlockState.palette.rock.includes(color)), 'only the rock (and the ink of the label dots)');
  const none = loadBlock();
  assert.equal(none.errors.length, 0);
});

test('live: mount builds real controls, the player runs from year 30 and the worker starts', async () => {
  const page = loadBlock();
  const live = page.registry.live;
  const layer = makeElement('div');
  live.mount(layer);
  assert.equal(layer.children.length, 1);
  const nodes = walk(layer.children[0]);
  const named = (tag, test) => nodes.filter(node => node.tag === tag && test(node));
  const [play] = named('button', () => true);
  assert.equal(play.attrs.type, 'button');
  assert.equal(play.attrs['aria-label'], 'Pause', 'the player starts at once');
  const [range] = named('input', node => node.attrs.type === 'range');
  assert.equal(range.attrs['aria-label'], 'Simulation year');
  assert.deepEqual([range.attrs.min, range.attrs.max, range.attrs.step, range.attrs.value], ['0', '100', '1', '30']);
  const [toggle] = named('input', node => node.attrs.type === 'checkbox');
  assert.equal(toggle.attrs.role, 'switch');
  const text = nodes.map(node => node.textContent).join('|');
  assert.ok(text.includes('Methane') && text.includes('CO₂') && text.includes('Show 3D cells'), 'legend and switch');
  assert.ok(!/Open the simulator|Read my research/.test(text), 'the links belong to StoryStage');
  assert.equal(layer.children[0].attrs.role, 'group');
  assert.equal(layer.children[0].attrs['aria-label'], 'Story block controls');
  assert.deepEqual(page.events, [], 'no synthetic event');
  assert.equal(live.animated, true, 'the first draw follows at once, and the player runs');
  assert.equal(page.storyLive.redraw, null, 'the requestDraw of the stage comes with the first draw');
  assert.equal(page.workers.length, 1);
  assert.equal(page.workers[0].url, './story-worker.js?v=1');
  assert.deepEqual(page.workers[0].messages, [{ type: 'run', id: 1 }]);
  assert.equal(typeof page.document.listeners.visibilitychange, 'function');
  assert.equal(page.storyLive.playing, true);
  assert.equal(page.storyLive.year, 30);

  // Draws advance the player in real time: 4 years each second.
  const times = [0, 16, 1016, 2016];
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 0 }));
  assert.equal(page.storyLive.redraw, redraw, 'the live draw keeps the requestDraw of the stage for the controls');
  await settle();
  times.slice(1).forEach(time => live.draw(makeCtx(), frame(0.5, 1280, 800, { time })));
  near(page.storyLive.year, 30 + 4 * (0.016 + 0.25 + 0.25), 1e-9);
  assert.equal(live.animated, true, 'animated while it plays');
  assert.equal(range.value, String(Math.round(page.storyLive.year)));
  assert.equal(range.attrs['aria-valuetext'], `Year ${Math.round(page.storyLive.year)}`);

  // The play button pauses. A paused player asks for no more frames. Each click asks for one draw.
  const clicks = asked.count;
  play.fire('click');
  assert.equal(asked.count, clicks + 1, 'a click asks the stage for one draw');
  assert.equal(page.storyLive.playing, false);
  assert.equal(play.attrs['aria-label'], 'Play');
  assert.equal(play.attrs['data-state'], 'paused');
  const year = page.storyLive.year;
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 3000 }));
  assert.equal(live.animated, false);
  assert.equal(page.storyLive.year, year);
  play.fire('click');
  assert.equal(asked.count, clicks + 2);
  assert.equal(page.storyLive.playing, true);
  assert.equal(play.attrs['aria-label'], 'Pause');
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 3016 }));
  assert.equal(live.animated, true, 'the draw after the click keeps the player on its frames');

  // The scrubber sets the year and pauses.
  range.value = '12';
  range.fire('input');
  assert.equal(page.storyLive.year, 12);
  assert.equal(page.storyLive.playing, false);
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 4000 }));
  assert.equal(page.storyLive.year, 12);
  const scrubs = asked.count;
  range.value = '13';
  range.fire('input');
  assert.equal(asked.count, scrubs + 1, 'a scrub asks the stage for one redraw');
  assert.equal(live.animated, false, 'and asks for no run of frames');
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 4100 }));
  assert.equal(page.storyLive.year, 13);
  assert.equal(live.animated, false, 'the stage rests again');

  // The 3D cells switch fades the layer lines in over about a third of a second.
  toggle.checked = true;
  const switches = asked.count;
  toggle.fire('change');
  assert.equal(page.storyLive.target, 1);
  assert.equal(asked.count, switches + 1, 'the switch asks for a draw');
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 4200 }));
  const cellsCtx = makeCtx();
  live.draw(cellsCtx, frame(0.5, 1280, 800, { time: 4216 }));
  assert.ok(page.storyLive.cells > 0 && page.storyLive.cells < 1);
  assert.equal(live.animated, true, 'frames while the cells change');
  for (let t = 4300; t < 5000; t += 50) live.draw(makeCtx(), frame(0.5, 1280, 800, { time: t }));
  assert.equal(page.storyLive.cells, 1);
  assert.equal(live.animated, false);

  live.unmount();
  assert.equal(layer.children.length, 0, 'the controls are gone');
  assert.equal(page.document.listeners.visibilitychange, undefined);
  assert.equal(page.storyLive.playing, false);
  assert.equal(page.storyLive.redraw, null, 'the player forgets the requestDraw of the stage');
  assert.equal(live.animated, false);
  assert.deepEqual(page.events, [], 'no synthetic event during the whole run');
});

test('live: the player pauses in a hidden tab, stops at the last year and starts again from year 0', () => {
  const page = loadBlock();
  const live = page.registry.live;
  const layer = makeElement('div');
  live.mount(layer);
  const nodes = walk(layer.children[0]);
  const play = nodes.find(node => node.tag === 'button');
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 0 }));
  page.document.hidden = true;
  page.document.listeners.visibilitychange();
  assert.equal(page.storyLive.playing, false);
  assert.equal(play.attrs['aria-label'], 'Play');
  const asks = asked.count;
  page.document.hidden = false;
  page.document.listeners.visibilitychange();
  assert.equal(page.storyLive.playing, true, 'it plays again when the tab returns');
  assert.equal(asked.count, asks + 1, 'and it asks the stage for a draw, so that the frames run again');

  page.storyLive.year = 99.9;
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 10 }));
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 1010 }));
  assert.equal(page.storyLive.year, 100);
  assert.equal(page.storyLive.playing, false);
  assert.equal(play.attrs['aria-label'], 'Play');
  play.fire('click');
  assert.equal(page.storyLive.year, 0, 'play at the end replays from year 0');
  assert.equal(page.storyLive.playing, true);

  // A paused player stays paused when the tab returns.
  play.fire('click');
  page.document.hidden = true;
  page.document.listeners.visibilitychange();
  page.document.hidden = false;
  page.document.listeners.visibilitychange();
  assert.equal(page.storyLive.playing, false);
  live.unmount();
});

test('live: under reduced motion the player does not start by itself', () => {
  const page = loadBlock({ reduced: true });
  const layer = makeElement('div');
  page.registry.live.mount(layer);
  assert.equal(page.storyLive.playing, false);
  assert.equal(walk(layer.children[0]).find(node => node.tag === 'button').attrs['aria-label'], 'Play');
  assert.deepEqual(page.events, [], 'no event without a reason');
  assert.equal(page.registry.live.animated, false, 'and no run of frames');
  assert.equal(asked.count, 0, 'and no request');
  page.registry.live.unmount();
});

test('live: frames from the worker replace the stored frames when the run is complete', async () => {
  const page = loadBlock();
  const live = page.registry.live;
  live.mount(makeElement('div'));
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 0 }));
  await settle();
  const worker = page.workers[0];
  const block = page.storyBlockState.block;
  const stored30 = storedRun.frames.find(item => item.year === 30);
  // Replay the real worker output with the model run in this process.
  const VE2D = require('../ve2d-model.js');
  VE2D.run(StoryGeometry.STORY_SCENARIO, {
    snapshotYears: 1,
    keepSnapshots: false,
    onSnapshot: snap => worker.onmessage({ data: { type: 'frame', id: 1, year: snap.year, h: snap.h, ch4: snap.ch4 } }),
  });
  assert.equal(page.storyBlockData.live.complete, false, 'not complete before done');
  assert.equal(page.storyBlockData.live.entries.length, 101);
  worker.onmessage({ data: { type: 'frame', id: 99, year: 5, h: new Float32Array(960), ch4: new Float32Array(960) } });
  assert.equal(page.storyBlockData.live.entries[5].h.some(value => value > 0), true, 'a message of another run is ignored');
  const asks = asked.count;
  worker.onmessage({ data: { type: 'done', id: 1, years: 101 } });
  assert.equal(page.storyBlockData.live.complete, true);
  assert.equal(page.storyBlockData.live.status, 'done');
  assert.equal(worker.terminated, true, 'the worker ends with the run');
  assert.equal(asked.count, asks + 1, 'the redraw is one request to the stage');
  assert.deepEqual(page.events, []);

  page.storyLive.year = 30;
  page.storyLive.playing = false;
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 100 }));
  const exact = Float32Array.from(block.cur.h);
  const fromStored = StoryGeometry.storyColumns(stored30, block.grid).h;
  let worst = 0;
  for (let c = 0; c < exact.length; c++) worst = Math.max(worst, Math.abs(exact[c] - fromStored[c]));
  assert.ok(worst < 0.002, `the worker frame at year 30 is the stored frame (${worst})`);
  page.storyLive.year = 57.25;
  live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 200 }));
  const a = StoryGeometry.storyColumns(page.storyBlockData.live.entries[57], block.grid).h;
  const b = StoryGeometry.storyColumns(page.storyBlockData.live.entries[58], block.grid).h;
  for (let c = 0; c < a.length; c++) near(block.cur.h[c], a[c] * 0.75 + b[c] * 0.25, 1e-5);
  live.unmount();
});

test('live: a worker that fails or is missing leaves the stored frames in use', async () => {
  const noWorker = loadBlock({ withWorker: false });
  noWorker.registry.live.mount(makeElement('div'));
  assert.equal(noWorker.storyBlockData.live.status, 'failed');
  noWorker.registry.live.draw(makeCtx(), frame(0.5, 1280, 800, { time: 0 }));
  await settle();
  const ctx = makeCtx();
  noWorker.registry.live.draw(ctx, frame(0.5, 1280, 800, { time: 16 }));
  assert.equal(ctx.bad, 0);
  assert.ok(ctx.fills.some(color => noWorker.storyBlockState.palette.band.includes(color)), 'the stored frames fill the columns');
  noWorker.registry.live.unmount();

  const broken = loadBlock();
  broken.registry.live.mount(makeElement('div'));
  broken.workers[0].onmessage({ data: { type: 'error', id: 1, message: 'boom' } });
  assert.equal(broken.storyBlockData.live.status, 'failed');
  assert.equal(broken.workers[0].terminated, true);
  assert.equal(broken.storyBlockData.live.complete, false);
  assert.ok(broken.errors.some(([key]) => key === 'console'));
  broken.registry.live.unmount();
});

// ---- the worker

const runWorker = () => {
  const out = { messages: [] };
  const self = { postMessage: (message, transfer) => out.messages.push({ message, transfer }) };
  const context = vm.createContext({ self, console });
  context.importScripts = (...urls) => {
    out.imports = urls;
    for (const url of urls) vm.runInContext(read(url.replace(/^\.\//, '').replace(/\?.*$/, '')), context);
  };
  vm.runInContext(read('story-worker.js'), context);
  out.self = self;
  out.context = context;
  return out;
};

test('story-worker.js imports the model and the geometry and posts one frame for each year', () => {
  const run = runWorker();
  assert.deepEqual(run.imports, ['./ve2d-model.js?v=5', './story-geometry.js?v=1']);
  assert.equal(typeof run.self.onmessage, 'function');
  run.self.onmessage({ data: { type: 'stop', id: 3 } });
  assert.equal(run.messages.length, 0, 'an unknown message does nothing');
  run.self.onmessage({ data: { type: 'run', id: 7 } });
  const frames = run.messages.filter(item => item.message.type === 'frame');
  assert.equal(frames.length, 101);
  assert.deepEqual(frames.map(item => item.message.year), Array.from({ length: 101 }, (_, i) => i));
  assert.ok(frames.every(item => item.message.id === 7));
  const first = frames[0].message;
  assert.deepEqual([first.h.constructor.name, first.ch4.constructor.name], ['Float32Array', 'Float32Array']);
  assert.equal(first.h.length, 40 * 24);
  assert.equal(first.ch4.length, 40 * 24);
  assert.deepEqual(plain(frames[0].transfer.map(buffer => buffer.constructor.name)), ['ArrayBuffer', 'ArrayBuffer'], 'the buffers move to the page');
  assert.ok(Math.max(...first.h) > 40, 'the gas cap is there at year 0');
  const last = run.messages[run.messages.length - 1].message;
  assert.deepEqual(plain(last), { type: 'done', id: 7, years: 101 });
  assert.equal(run.messages.filter(item => item.message.type === 'error').length, 0);

  const stored = storedRun.frames.find(item => item.year === 30);
  const thirty = frames[30].message;
  let worst = 0;
  let worstShare = 0;
  for (let c = 0; c < thirty.h.length; c++) {
    worst = Math.max(worst, Math.abs(thirty.h[c] - stored.h[c]));
    worstShare = Math.max(worstShare, Math.abs(thirty.ch4[c] - stored.ch4[c]));
  }
  assert.ok(worst <= 0.0501, `h at year 30 equals the stored run (${worst})`);
  assert.ok(worstShare <= 0.0051, `ch4 at year 30 equals the stored run (${worstShare})`);
});

test('story-worker.js reports an error and does not throw when the run fails', () => {
  const run = runWorker();
  vm.runInContext('VE2D.run = () => { throw new Error("boom"); }', run.context);
  assert.doesNotThrow(() => run.self.onmessage({ data: { type: 'run', id: 4 } }));
  assert.deepEqual(plain(run.messages.map(item => item.message)), [{ type: 'error', id: 4, message: 'boom' }]);
});

// ---- the build, the styles and the pages

test('the build puts StoryBlock.jsx after StoryChapters.jsx and the bundle has it', () => {
  const files = [...read('build.js').match(/const files = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(match => match[1]);
  assert.ok(files.indexOf('StoryBlock.jsx') > files.indexOf('StoryChapters.jsx'), 'the block replaces the placeholders, so it loads after them');
  assert.ok(files.indexOf('story-geometry.js') < files.indexOf('StoryBlock.jsx'), 'StoryGeometry exists before the block');
  const bundle = read('bundle.js');
  assert.ok(bundle.includes('// File: StoryBlock.jsx'), 'build the current source before testing');
  assert.ok(bundle.includes('const storyBlockLayout') && /STORY_RENDERERS\.live\s*=\s*\{/.test(bundle), 'the bundle holds the current block code');
  assert.ok(bundle.indexOf('// File: StoryChapters.jsx') < bundle.indexOf('// File: StoryBlock.jsx'));
  assert.ok(!/<StoryBlock|React\.createElement/.test(blockSource), 'the block has no React markup: the controls are plain DOM');
  assert.ok(fs.existsSync(path.join(root, 'story-worker.js')));
  assert.ok(fs.existsSync(path.join(root, 'assets', 'story-run.json')));
});

test('the Story block controls are the last part of the Story styles, in style C', () => {
  const css = read('colors_and_type.css');
  const start = css.indexOf('Story block controls');
  assert.ok(start > css.indexOf('.story-rail'), 'after the stage rules');
  assert.ok(start > css.indexOf('.app-header--site.is-over-story'), 'at the end of the Story block');
  const part = css.slice(start);
  for (const selector of ['.story-controls', '.story-controls__play', '.story-controls__range', '.story-controls__legend', '.story-controls__chip--ch4', '.story-controls__chip--co2', '.story-controls__switch', '.story-controls__toggle']) {
    assert.ok(part.includes(selector), `${selector} has a style`);
  }
  assert.match(part, /font:[^;]*var\(--story-font\)/, 'Literata through the story font token');
  assert.ok(!/box-shadow|radial-gradient|drop-shadow/.test(part), 'flat colour: no shadows');
  assert.match(part, /\.story-controls__chip--ch4 \{ --chip: var\(--story-ch4\)/);
  assert.match(part, /\.story-controls__chip--co2 \{ --chip: var\(--story-co2\)/);
  assert.match(part, /min-height: 44px/, 'touch targets of 44 px');
  assert.match(part, /prefers-reduced-motion/);
  assert.ok(!/outline:\s*none/.test(part), 'the focus ring stays (the Story rule draws it)');
  assert.match(css, /\.story :focus-visible \{[^}]*outline: 3px solid var\(--story-ink\)/, 'the Story focus ring covers the controls');
});

test('the story worker file has the protocol in its header and pins the model versions', () => {
  const source = read('story-worker.js');
  assert.match(source, /importScripts\('\.\/ve2d-model\.js\?v=5', '\.\/story-geometry\.js\?v=1'\)/);
  assert.match(source, /Protocol in:\s+\{ type: 'run', id \}/);
  assert.match(source, /snapshotYears: 1/);
  assert.match(source, /StoryGeometry\.STORY_SCENARIO/);
});

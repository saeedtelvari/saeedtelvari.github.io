// StoryBlock.jsx — the art of the chapters grid, ve and live.
// The three chapters draw one 3D corner-point block of the gas field (story-geometry.js):
//   grid  The grid draws onto the rock. Then the 3D run plays from the stored frames, years 0 to 30.
//   ve    The horizontal cell boundaries fade. Each column is one tall cell with a sharp interface at h.
//   live  The same block runs live in story-worker.js. The mount function builds the controls.
// The block is built when the stage size changes. A draw only reads the polygons and changes colours.
// The renderer API is at the top of StoryStage.jsx.

// ---- story block helpers (pure; tests/story-block.test.js evaluates this block)
const STORY_BLOCK_HEADER = 64;
const STORY_BLOCK_NARROW = 640;
const STORY_BLOCK_GRID_YEARS = 30;
const STORY_BLOCK_RUN_MINUTES = 18 * 60 + 40;
const STORY_BLOCK_RATE = 4;
const STORY_BLOCK_KINDS = 5;
const STORY_BLOCK_STEPS = 24;
const STORY_BLOCK_BANDS = 5;
const STORY_BLOCK_BAND_MAX = 0.6;
const STORY_BLOCK_TOPS = 17;
const STORY_BLOCK_TONES = STORY_BLOCK_TOPS + 2;
const STORY_BLOCK_EAST = STORY_BLOCK_TOPS;
const STORY_BLOCK_NORTH = STORY_BLOCK_TOPS + 1;
const STORY_BLOCK_FACE_EAST = 1;
const STORY_BLOCK_FACE_NORTH = 2;

const storyBlockEase = t => {
  const x = storyClamp(t);
  return x * x * (3 - 2 * x);
};

// The colour between two #rrggbb colours.
const storyBlockMix = (from, to, t) => {
  let out = '#';
  for (let i = 1; i < 7; i += 2) {
    const a = parseInt(from.slice(i, i + 2), 16);
    const b = parseInt(to.slice(i, i + 2), 16);
    out += Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  }
  return out;
};

// A positive amount darkens the colour. A negative amount lightens it.
const storyBlockTint = (hex, amount) => (amount >= 0 ? storyBlockMix(hex, '#000000', amount) : storyBlockMix(hex, '#ffffff', -amount));

const storyBlockInt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// Grid size. A phone gets fewer cells.
const storyBlockResolution = width => (width <= STORY_BLOCK_NARROW ? { nx: 20, ny: 12, nz: 4 } : { nx: 30, ny: 18, nz: 5 });

// Where the block and the text stand in a stage of width x height pixels.
// - box: the area for the block and its labels. On a wide stage it stays right of the captions
//   (bottom left) and above the controls. On a narrow stage it stays below the caption band.
// - fit: the area for the block itself, inside the box.
// - clock: top left corner of the run clock and the counter.
// - view: angles in radians and the share of the width that the depth takes (see storyBlockExaggeration).
// A reduced-motion frame is a 16:9 canvas with its captions below it, so only the run clock is kept clear.
const storyBlockLayout = (width, height, reduced = false, captions = { top: 150, bottom: 190 }) => {
  const narrow = width <= STORY_BLOCK_NARROW;
  const scale = narrow ? 0.7 : storyClamp(width / 1280, 0.7, 1.25);
  const fonts = {
    label: narrow ? 12 : storyClamp(width * 0.0105 + 1, 13, 17),
    big: narrow ? (reduced ? 17 : 24) : storyClamp(width * 0.034, 28, 52),
    small: narrow ? (reduced ? 11 : 13) : storyClamp(width * 0.0125 + 2, 14, 20),
  };
  let box;
  let clock;
  let inset = { top: Math.round(58 * scale), bottom: Math.round(30 * scale), side: Math.round(14 * scale) };
  const keeps = [];
  if (reduced && narrow) {
    box = { x0: 6, y0: 52, x1: width - 6, y1: height - 4 };
    clock = { x: 10, y: 8 };
    inset = { top: 26, bottom: 14, side: 8 };
  } else if (reduced) {
    box = { x0: Math.round(width * 0.03), y0: 6, x1: width - Math.round(width * 0.03), y1: height - 6 };
    clock = { x: Math.round(width * 0.04), y: Math.round(height * 0.07) };
    inset = { top: Math.round(34 * scale), bottom: Math.round(22 * scale), side: Math.round(10 * scale) };
    keeps.push({ x0: 0, y0: 0, x1: clock.x + Math.round(width * 0.3), y1: clock.y + fonts.big * 1.18 + fonts.small * 2.8 + 10 });
  } else if (narrow) {
    const band = STORY_BLOCK_HEADER + 64 + Math.max(captions.top, captions.bottom) + 12;
    box = { x0: 12, y0: band, x1: width - 12, y1: height - 118 };
    clock = { x: 16, y: height - 104 };
  } else {
    box = { x0: Math.round(width * 0.12), y0: STORY_BLOCK_HEADER + 8, x1: width - Math.round(width * 0.03), y1: height - 104 };
    clock = { x: Math.round(width * 0.055), y: Math.max(Math.round(height * 0.09), STORY_BLOCK_HEADER + 16) };
    const wordsBottom = Math.max(clock.y + fonts.big * 1.18 + fonts.small * 2.8, clock.y + captions.top) + 12;
    keeps.push({ x0: 0, y0: height - Math.round(height * 0.06) - 12 - captions.bottom - 12, x1: Math.round(width * 0.325) + 12, y1: height });
    keeps.push({ x0: 0, y0: 0, x1: Math.round(width * 0.375) + 12, y1: wordsBottom });
  }
  const fit = { x0: box.x0 + inset.side, y0: box.y0 + inset.top, x1: box.x1 - inset.side, y1: box.y1 - inset.bottom };
  const view = narrow && !reduced
    ? { theta: 1.15, elevation: 0.95, zFrac: 0.2 }
    : { theta: 0.49, elevation: 0.72, zFrac: 0.15 };
  return { narrow, reduced, scale, fonts, box, fit, keeps, clock, view, line: narrow ? 0.6 : 0.8 };
};

// The height in px that the captions of the story use, estimated from their length and the caption font of the
// stylesheet. The estimate is a little high, so the art keeps clear of the words. copy is SITE_STORY.captions.
// bottom: the captions of grid and ve (bottom left). top: the captions of live and its buttons (top left).
const storyBlockCaptionHeights = (width, copy) => {
  const narrow = width <= STORY_BLOCK_NARROW;
  const font = storyClamp(width * 0.0145 + 6, 17, 26);
  const perLine = Math.max(8, Math.floor((narrow ? width - 32 : width * 0.27) / (font * 0.55)));
  const lines = ids => Math.max(...ids.map(id => Math.max(...(copy[id] || ['']).map(text => Math.ceil(text.length / perLine)))));
  return { bottom: Math.round(lines(['grid', 've']) * font * 1.5), top: Math.round(lines(['live']) * font * 1.5 + 64) };
};

// True when no point (pu[k], pv[k]) falls inside a keep rectangle after the fit.
const storyBlockClear = (pu, pv, fit, keeps) => {
  for (let k = 0; k < pu.length; k++) {
    const x = fit.ox + pu[k] * fit.scale;
    const y = fit.oy + pv[k] * fit.scale;
    for (let n = 0; n < keeps.length; n++) {
      if (x > keeps[n].x0 && x < keeps[n].x1 && y > keeps[n].y0 && y < keeps[n].y1) return false;
    }
  }
  return true;
};

// The screen vectors of the east axis, the north axis and the vertical axis, in unit lengths.
// The viewer stands north-east of the block and looks down at the angle `elevation`.
const storyBlockAxes = view => ({
  ex: Math.cos(view.theta),
  ey: Math.sin(view.theta) * Math.sin(view.elevation),
  nx: -Math.sin(view.theta),
  ny: Math.cos(view.theta) * Math.sin(view.elevation),
  zy: Math.cos(view.elevation),
});

// The depth is drawn larger than it is. This factor makes the depth span take `zFrac` of the block width.
// windowKm is the size of the map window in km. spanM is the depth span of the grid in m.
const storyBlockExaggeration = (view, windowKm, spanM) => {
  const wide = windowKm.width * Math.abs(Math.cos(view.theta)) + windowKm.height * Math.abs(Math.sin(view.theta));
  return view.zFrac * wide / (Math.max(1, spanM) / 1000);
};

// Scale and offset that fit the bounds { u0, u1, v0, v1 } into the region, centred.
const storyBlockFit = (bounds, region) => {
  const w = Math.max(1e-9, bounds.u1 - bounds.u0);
  const h = Math.max(1e-9, bounds.v1 - bounds.v0);
  const scale = Math.max(1e-6, Math.min((region.x1 - region.x0) / w, (region.y1 - region.y0) / h));
  return {
    scale,
    ox: region.x0 + ((region.x1 - region.x0) - w * scale) / 2 - bounds.u0 * scale,
    oy: region.y0 + ((region.y1 - region.y0) - h * scale) / 2 - bounds.v0 * scale,
  };
};

// The largest fit that keeps clear of the rectangles. The left edge of the region moves right in steps, up to its middle.
const storyBlockPlace = (pu, pv, bounds, region, keeps, steps = 10) => {
  let fit = null;
  for (let s = 0; s <= steps; s++) {
    fit = storyBlockFit(bounds, { ...region, x0: region.x0 + (region.x1 - region.x0) * 0.5 * s / steps });
    if (storyBlockClear(pu, pv, fit, keeps)) break;
  }
  return fit;
};

// The index of the cell interval of the sorted edges that holds the value.
const storyBlockLocate = (edges, value) => {
  let lo = 0;
  let hi = edges.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (edges[mid] <= value) lo = mid; else hi = mid - 1;
  }
  return lo;
};

const storyBlockNearest = (edges, value) => {
  let best = 1;
  for (let i = 2; i < edges.length - 1; i++) if (Math.abs(edges[i] - value) < Math.abs(edges[best] - value)) best = i;
  return best;
};

// The cut-away quarter: the columns with i >= icut and j >= jcut are not drawn. The corner is at (x, y) km.
const storyBlockCut = (xs, ys, x, y) => ({ icut: storyBlockNearest(xs, x), jcut: storyBlockNearest(ys, y) });

// The columns that stay, from the back to the front. The viewer is north-east, so a column hides only columns
// with a smaller i + j.
const storyBlockOrder = (nx, ny, cut) => {
  const order = new Int32Array(nx * ny);
  let n = 0;
  for (let d = 0; d <= nx + ny - 2; d++) {
    for (let i = Math.max(0, d - ny + 1); i <= Math.min(d, nx - 1); i++) {
      const j = d - i;
      if (i >= cut.icut && j >= cut.jcut) continue;
      order[n++] = j * nx + i;
    }
  }
  return order.subarray(0, n);
};

// Which side faces of each column are visible. The east face (bit 1) and the north face (bit 2) show at the
// edge of the block, at the cut and where the depth of the neighbour is different (the fault).
const storyBlockFaces = (top, nx, ny, cut, tolerance = 2) => {
  const flags = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (i >= cut.icut && j >= cut.jcut) continue;
      const c = j * nx + i;
      let east = i === nx - 1 || (i + 1 >= cut.icut && j >= cut.jcut);
      if (!east) {
        const n = 4 * (c + 1);
        east = Math.abs(top[4 * c + 1] - top[n]) > tolerance || Math.abs(top[4 * c + 2] - top[n + 3]) > tolerance;
      }
      let north = j === ny - 1 || (j + 1 >= cut.jcut && i >= cut.icut);
      if (!north) {
        const n = 4 * (c + nx);
        north = Math.abs(top[4 * c + 2] - top[n + 1]) > tolerance || Math.abs(top[4 * c + 3] - top[n]) > tolerance;
      }
      flags[c] = (east ? STORY_BLOCK_FACE_EAST : 0) | (north ? STORY_BLOCK_FACE_NORTH : 0);
    }
  }
  return flags;
};

// The light comes from the back left. A top face that rises toward the viewer is lighter. Result: 0 to 16.
const storyBlockTone = slope => storyClamp(Math.round(4 - 6.4 * slope), 0, STORY_BLOCK_TOPS - 1);

// The share of cell k (0 is the top cell) that the gas fills, when the gas is h of the column (0 to 1).
const storyBlockCellFill = (h, k, nz) => storyClamp(h * nz - k);

// 0 for no gas, else 1 to 5: the band of h on the top face.
const storyBlockBand = h => (h < 0.02 ? 0 : 1 + Math.min(STORY_BLOCK_BANDS - 1, Math.floor(h / STORY_BLOCK_BAND_MAX * STORY_BLOCK_BANDS)));

// The colour of the gas for a methane share from 0 (CO2) to 1 (methane).
const storyBlockKind = share => Math.round(storyClamp(share) * (STORY_BLOCK_KINDS - 1));

// The run clock of a typical field model that takes 18 h 40 min for 30 years.
const storyBlockClock = fraction => {
  const minutes = Math.round(storyClamp(fraction) * STORY_BLOCK_RUN_MINUTES);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
};

// Chapter grid. Local 0 to 0.3 draws the grid: pillars first, then layers. Local 0.3 to 1 plays the years 0 to 30.
const storyBlockGrid = (local, s = {}) => {
  const l = storyClamp(local);
  s.pillars = storyBlockEase(l / 0.15);
  s.layers = storyClamp((l - 0.15) / 0.15);
  s.gas = storyBlockEase((l - 0.3) / 0.05);
  s.labels = storyBlockEase((l - 0.28) / 0.08);
  s.year = l <= 0.3 ? 0 : Math.min(STORY_BLOCK_GRID_YEARS, STORY_BLOCK_GRID_YEARS * (l - 0.3) / 0.7);
  s.sharp = 0;
  s.bands = 0;
  s.bracket = 0;
  s.clockAlpha = storyBlockEase((l - 0.3) / 0.04) * (1 - storyBlockEase((l - 0.96) / 0.04));
  s.counter = 0;
  s.counterAlpha = 0;
  return s;
};

// Chapter ve, at year 30. Local 0 to 0.5: the layer lines fade and each column gets a sharp interface.
// Local 0.5 to 1: the top face shows h as bands, a bracket marks h, and the counter goes from cells to columns.
const storyBlockVe = (local, s = {}) => {
  const l = storyClamp(local);
  s.pillars = 1;
  s.layers = 1;
  s.gas = 1;
  s.labels = 1;
  s.year = STORY_BLOCK_GRID_YEARS;
  s.sharp = storyBlockEase(l / 0.5);
  s.bands = storyBlockEase((l - 0.5) / 0.15);
  s.bracket = storyBlockEase((l - 0.6) / 0.15);
  s.clockAlpha = 0;
  s.counter = l;
  s.counterAlpha = storyBlockEase(l / 0.04);
  return s;
};

// Chapter live. cells is 0 for the VE columns and 1 for the 3D cells. The notes of chapter ve fade out first.
const storyBlockLive = (local, cells, year, s = {}) => {
  const note = 1 - storyBlockEase(storyClamp(local) / 0.1);
  s.pillars = 1;
  s.layers = 1;
  s.gas = 1;
  s.labels = 1;
  s.year = year;
  s.sharp = 1 - cells;
  s.bands = 1 - cells;
  s.bracket = note * (1 - cells);
  s.clockAlpha = 0;
  s.counter = 1;
  s.counterAlpha = note;
  return s;
};

// The counter of chapter ve. At local 0.5 it shows the cells. At local 1 it shows the columns to solve.
const storyBlockCounter = (cells, columns, local) => {
  const t = storyClamp((local - 0.5) / 0.5);
  const e = storyBlockEase(t);
  const count = storyBlockInt(cells + (columns - cells) * e);
  if (t <= 0) return { big: `${storyBlockInt(cells)} cells`, small: 'in this 3D model' };
  if (t >= 1) return { big: `${storyBlockInt(columns)} columns`, small: `to solve, not ${storyBlockInt(cells)} cells` };
  return e < 0.5 ? { big: `${count} cells`, small: 'in this 3D model' } : { big: `${count} columns`, small: 'to solve in the VE model' };
};

// Position of a year among the sorted years of the frames. Fills out with lo, hi and t.
const storyBlockFramePair = (years, year, out = {}) => {
  const last = years.length - 1;
  if (!(year > years[0])) {
    out.lo = 0; out.hi = 0; out.t = 0;
  } else if (year >= years[last]) {
    out.lo = last; out.hi = last; out.t = 0;
  } else {
    let i = 0;
    while (years[i + 1] <= year) i++;
    out.lo = i; out.hi = i + 1; out.t = (year - years[i]) / (years[i + 1] - years[i]);
  }
  return out;
};

// Blend the columns of two frames. The methane share uses the gas thickness as weight.
const storyBlockBlend = (out, a, b, t) => {
  for (let c = 0; c < out.h.length; c++) {
    const ha = a.h[c] * (1 - t);
    const hb = b.h[c] * t;
    out.h[c] = ha + hb;
    out.ch4[c] = ha + hb > 1e-6 ? (ha * a.ch4[c] + hb * b.ch4[c]) / (ha + hb) : 0;
  }
  return out;
};

// Time step of the player in ms. A long gap (a hidden tab) counts as 250 ms.
const storyBlockStep = (time, last) => (last === null ? 0 : storyClamp(time - last, 0, 250));
const storyBlockAdvance = (year, dtMs, lastYear, rate = STORY_BLOCK_RATE) => Math.min(lastYear, year + dtMs / 1000 * rate);

// All colours of the block as arrays of strings. A draw only reads them.
// - rock[tone]; fill[(kind * TONES + tone) * (STEPS + 1) + step]; band[(kind * BANDS + band - 1) * TOPS + tone]
// - gas[kind]; edge[kind]; line[i] is the grid line colour with the alpha i / 20.
const storyBlockPalette = colors => {
  const shades = [];
  for (let k = 0; k < STORY_BLOCK_TOPS; k++) shades.push(-0.06 + 0.02 * k);
  shades.push(0.22, 0.1);
  const gas = [];
  for (let k = 0; k < STORY_BLOCK_KINDS; k++) gas.push(storyBlockMix(colors.co2, colors.ch4, k / (STORY_BLOCK_KINDS - 1)));
  const rock = shades.map(shade => storyBlockTint(colors.sand, shade));
  const fill = [];
  const band = [];
  for (let kind = 0; kind < STORY_BLOCK_KINDS; kind++) {
    const light = storyBlockMix(gas[kind], '#ffffff', 0.62);
    for (let tone = 0; tone < STORY_BLOCK_TONES; tone++) {
      for (let step = 0; step <= STORY_BLOCK_STEPS; step++) {
        fill.push(storyBlockTint(step === 0 ? colors.sand : storyBlockMix(light, gas[kind], step / STORY_BLOCK_STEPS), shades[tone]));
      }
    }
    const ramp = [
      storyBlockMix(gas[kind], '#ffffff', 0.78), storyBlockMix(gas[kind], '#ffffff', 0.55), storyBlockMix(gas[kind], '#ffffff', 0.28),
      gas[kind], storyBlockTint(gas[kind], 0.38),
    ];
    for (let b = 0; b < STORY_BLOCK_BANDS; b++) for (let tone = 0; tone < STORY_BLOCK_TOPS; tone++) band.push(storyBlockTint(ramp[b], shades[tone]));
  }
  const rgb = [1, 3, 5].map(i => parseInt(colors.grid.slice(i, i + 2), 16));
  const line = [];
  for (let i = 0; i <= 20; i++) line.push(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(i / 20).toFixed(2)})`);
  return { gas, rock, fill, band, edge: gas.map(color => storyBlockTint(color, 0.45)), line };
};
// ---- end story block helpers

const STORY_BLOCK_FONT = "'Literata', Georgia, 'Times New Roman', serif";
const STORY_BLOCK_RUN_URL = './assets/story-run.json';
const STORY_BLOCK_WORKER_URL = './story-worker.js?v=1';

// Shared state of the three renderers. They draw one block at a time.
const storyBlockState = {
  block: null,
  builds: 0,
  palette: null,
  scene: {},
  replays: [],
  waiting: [],
};

// The model frames. stored comes from assets/story-run.json (years in STORY_YEARS).
// live comes from story-worker.js (one frame for each year). An entry holds the model grid h and ch4,
// and cols, the same data on the columns of the block grid.
const storyBlockData = {
  stored: { status: 'idle', entries: [], years: [] },
  live: { status: 'idle', entries: [], years: [], complete: false, worker: null, run: 0 },
};

const storyBlockBind = (entry, block) => {
  entry.cols = StoryGeometry.storyColumns(entry, block.grid);
  entry.colsKey = block.id;
};

const storyBlockBindAll = block => {
  storyBlockData.stored.entries.forEach(entry => storyBlockBind(entry, block));
  storyBlockData.live.entries.forEach(entry => entry && storyBlockBind(entry, block));
};

// The screen position of a point inside a column: fx and fy from 0 to 1 (east and north), depth from 0 (top) to 1 (base).
const storyBlockPoint = (block, column, fx, fy, depth = 0) => {
  const o = 4 * column;
  const w0 = (1 - fx) * (1 - fy);
  const w1 = fx * (1 - fy);
  const w2 = fx * fy;
  const w3 = (1 - fx) * fy;
  const at = (xs) => xs[o] * w0 + xs[o + 1] * w1 + xs[o + 2] * w2 + xs[o + 3] * w3;
  const top = at(block.YT);
  return [at(block.X), top + (at(block.YB) - top) * depth];
};

// The screen position of the map point (x, y) in km on the top of the block.
const storyBlockAt = (block, x, y) => {
  const { grid } = block;
  const i = storyBlockLocate(grid.xs, x);
  const j = storyBlockLocate(grid.ys, y);
  const fx = storyClamp((x - grid.xs[i]) / (grid.xs[i + 1] - grid.xs[i]));
  const fy = storyClamp((y - grid.ys[j]) / (grid.ys[j + 1] - grid.ys[j]));
  return storyBlockPoint(block, j * grid.nx + i, fx, fy, 0);
};

// Labels of the art. at is the map point in km. wide and tall give the leader as [dx, dy, align], with dx and dy
// as shares of the block width, for the wide view and for the tall view of a phone. The well has its own height.
const STORY_BLOCK_LABELS = [
  { id: 'cap', text: 'Gas cap (methane)', short: 'Gas cap', at: [9.25, 5.8], wide: [0.07, -0.2, 'center'], tall: [0.3, -0.17, 'start'] },
  { id: 'co2', text: 'CO₂', short: 'CO₂', at: [16.9, 4.4], wide: [0.07, -0.15, 'start'], tall: [0.16, -0.2, 'start'] },
  { id: 'fault', text: 'Fault', short: 'Fault', at: [6.5, 8.0], wide: [-0.08, -0.11, 'end'], tall: [-0.08, -0.11, 'end'] },
];
const STORY_BLOCK_WELL_UP = { wide: 0.2, tall: 0.3 };

// Build the polygons of the block for one stage size. The draw loop reads these arrays.
const storyBlockBuild = (width, height, reduced, captions) => {
  const layout = storyBlockLayout(width, height, reduced, captions);
  const { nx, ny, nz } = storyBlockResolution(width);
  const grid = StoryGeometry.storyGrid(nx, ny, nz);
  const scenario = StoryGeometry.STORY_SCENARIO;
  const count = grid.columns;
  const cut = storyBlockCut(grid.xs, grid.ys, scenario.dome.x + 0.25, scenario.wellY + 0.25);
  const axes = storyBlockAxes(layout.view);
  const win = grid.window;
  let minTop = Infinity;
  let maxBase = -Infinity;
  for (let c = 0; c < count; c++) {
    for (let k = 0; k < 4; k++) {
      minTop = Math.min(minTop, grid.top[4 * c + k]);
      maxBase = Math.max(maxBase, grid.top[4 * c + k] + grid.thickness[4 * c + k]);
    }
  }
  const exaggeration = storyBlockExaggeration(layout.view, { width: win.x1 - win.x0, height: win.y1 - win.y0 }, maxBase - minTop);

  // Unit coordinates in km: u to the right, v down. Then the fit scales them to pixels.
  const U = new Float64Array(4 * count);
  const VT = new Float64Array(4 * count);
  const VB = new Float64Array(4 * count);
  const tone = new Uint8Array(count);
  const bounds = { u0: Infinity, u1: -Infinity, v0: Infinity, v1: -Infinity };
  const pu = [];
  const pv = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = j * nx + i;
      const kept = !(i >= cut.icut && j >= cut.jcut);
      const cx = [grid.xs[i], grid.xs[i + 1], grid.xs[i + 1], grid.xs[i]];
      const cy = [grid.ys[j], grid.ys[j], grid.ys[j + 1], grid.ys[j + 1]];
      const rise = new Array(4);
      for (let k = 0; k < 4; k++) {
        const o = 4 * c + k;
        const east = cx[k] - win.x0;
        const north = cy[k] - win.y0;
        const flat = east * axes.ey + north * axes.ny;
        const dTop = (grid.top[o] - minTop) / 1000 * exaggeration * axes.zy;
        const dBase = (grid.top[o] + grid.thickness[o] - minTop) / 1000 * exaggeration * axes.zy;
        U[o] = east * axes.ex + north * axes.nx;
        VT[o] = flat + dTop;
        VB[o] = flat + dBase;
        rise[k] = -dTop;
        if (kept) {
          bounds.u0 = Math.min(bounds.u0, U[o]);
          bounds.u1 = Math.max(bounds.u1, U[o]);
          bounds.v0 = Math.min(bounds.v0, VT[o]);
          bounds.v1 = Math.max(bounds.v1, VB[o]);
          pu.push(U[o], U[o]);
          pv.push(VT[o], VB[o]);
        }
      }
      const cell = Math.max(1e-6, ((grid.xs[i + 1] - grid.xs[i]) + (grid.ys[j + 1] - grid.ys[j])) / 2);
      tone[c] = storyBlockTone(((rise[1] - rise[0] + rise[2] - rise[3]) / 2 + (rise[3] - rise[0] + rise[2] - rise[1]) / 2) / cell);
    }
  }
  const fit = storyBlockPlace(pu, pv, bounds, layout.fit, layout.keeps);
  const X = new Float32Array(4 * count);
  const YT = new Float32Array(4 * count);
  const YB = new Float32Array(4 * count);
  for (let o = 0; o < 4 * count; o++) {
    X[o] = fit.ox + U[o] * fit.scale;
    YT[o] = fit.oy + VT[o] * fit.scale;
    YB[o] = fit.oy + VB[o] * fit.scale;
  }
  const flags = storyBlockFaces(grid.top, nx, ny, cut);
  storyBlockState.builds += 1;
  const block = {
    id: storyBlockState.builds,
    key: `${width}x${height}${reduced ? 'r' : ''}`,
    layout, grid, nz, cut, flags, tone, X, YT, YB,
    order: storyBlockOrder(nx, ny, cut),
    exaggeration,
    edge: { left: fit.ox + bounds.u0 * fit.scale, right: fit.ox + bounds.u1 * fit.scale, top: fit.oy + bounds.v0 * fit.scale, bottom: fit.oy + bounds.v1 * fit.scale },
    cur: { h: new Float32Array(count), ch4: new Float32Array(count) },
    pair: { lo: 0, hi: 0, t: 0 },
    bracket: -1,
    scarp: [],
    labels: [],
    well: null,
    fonts: {
      label: `italic 400 ${layout.fonts.label}px ${STORY_BLOCK_FONT}`,
      h: `italic 600 ${Math.round(layout.fonts.label * 1.45)}px ${STORY_BLOCK_FONT}`,
      big: `600 ${Math.round(layout.fonts.big)}px ${STORY_BLOCK_FONT}`,
      small: `italic 400 ${Math.round(layout.fonts.small)}px ${STORY_BLOCK_FONT}`,
    },
    clockText: '',
    clockMinute: -1,
    counterStep: -1,
    counterText: '',
    counterNote: [],
    depthNote: `Depth exaggerated ×${Math.round(exaggeration)}`,
  };

  // The fault: the faces of the columns west of it, with the line along their top edge.
  if (grid.faultLine) {
    const west = grid.faultLine.index - 1;
    for (let j = 0; j < ny; j++) if (flags[j * nx + west] & STORY_BLOCK_FACE_EAST) block.scarp.push(j * nx + west);
  }
  const tall = layout.narrow && !reduced;
  const span = block.edge.right - block.edge.left;
  block.labels = STORY_BLOCK_LABELS.map(label => {
    const [x, y] = storyBlockAt(block, label.at[0], label.at[1]);
    const [dx, dy, align] = tall ? label.tall : label.wide;
    return { id: label.id, text: layout.narrow ? label.short : label.text, x, y, dx: dx * span, dy: dy * span, align };
  });
  // The injection well stands on the cut face, in the column that holds the well.
  const wi = storyBlockLocate(grid.xs, scenario.wellX);
  const wc = (cut.jcut - 1) * nx + wi;
  const wt = storyClamp((scenario.wellX - grid.xs[wi]) / (grid.xs[wi + 1] - grid.xs[wi]));
  const wellTop = storyBlockPoint(block, wc, wt, 1, 0);
  const wellEnd = storyBlockPoint(block, wc, wt, 1, 0.72);
  block.well = { x: wellTop[0], y0: wellTop[1], y1: wellEnd[1], up: span * (tall ? STORY_BLOCK_WELL_UP.tall : STORY_BLOCK_WELL_UP.wide) };
  block.labels.push({ id: 'well', text: layout.narrow ? 'Well' : 'Injection well', x: wellTop[0], y: wellTop[1] - block.well.up, dx: 0, dy: 0, align: 'center', anchor: false });
  return block;
};

const storyBlockGet = frame => {
  const key = `${frame.width}x${frame.height}${frame.reducedMotion ? 'r' : ''}`;
  const have = storyBlockState.block;
  if (have && have.key === key) return have;
  const copy = typeof SITE_STORY !== 'undefined' ? SITE_STORY.captions : {};
  const block = storyBlockBuild(frame.width, frame.height, frame.reducedMotion, storyBlockCaptionHeights(frame.width, copy));
  storyBlockState.block = block;
  storyBlockBindAll(block);
  return block;
};

// The methane column on the east cut face with the thickest gas. The bracket of chapter ve marks its h.
const storyBlockPickBracket = block => {
  const { cut, grid } = block;
  const entries = storyBlockData.live.complete ? storyBlockData.live.entries : storyBlockData.stored.entries;
  const entry = entries.find(item => item && item.year === STORY_BLOCK_GRID_YEARS);
  if (!entry || !entry.cols) return -1;
  let best = -1;
  let thickest = 0.05;
  for (let j = cut.jcut; j < grid.ny; j++) {
    const c = j * grid.nx + cut.icut - 1;
    if (entry.cols.ch4[c] >= 0.5 && entry.cols.h[c] > thickest) { best = c; thickest = entry.cols.h[c]; }
  }
  return best;
};

// Load the stored run once. A pinned renderer that waits for it runs on each frame. A static frame draws again.
const storyBlockLoad = () => {
  const stored = storyBlockData.stored;
  if (stored.status !== 'idle') return;
  stored.status = 'loading';
  const finish = ok => {
    stored.status = ok ? 'ready' : 'failed';
    storyBlockNotify();
  };
  if (typeof fetch !== 'function') { finish(false); return; }
  fetch(STORY_BLOCK_RUN_URL)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(run => {
      stored.entries = run.frames.map(frame => ({ year: frame.year, h: Float32Array.from(frame.h), ch4: Float32Array.from(frame.ch4), cols: null, colsKey: 0 }));
      stored.years = stored.entries.map(entry => entry.year);
      if (storyBlockState.block) storyBlockBindAll(storyBlockState.block);
      finish(true);
    })
    .catch(error => {
      console.error('The story run could not load.', error);
      finish(false);
    });
};

const storyBlockWake = entry => {
  entry.animated = true;
  if (typeof window !== 'undefined' && window.dispatchEvent && typeof Event === 'function') window.dispatchEvent(new Event('scroll'));
};

const storyBlockNotify = () => {
  storyBlockState.replays.splice(0).forEach(({ entry, id, ctx, frame }) => {
    storyGuard(`${id}.replay`, () => {
      ctx.save();
      ctx.setTransform(frame.dpr, 0, 0, frame.dpr, 0, 0);
      ctx.clearRect(0, 0, frame.width, frame.height);
      entry.draw(ctx, frame);
      ctx.restore();
    });
  });
  storyBlockState.waiting.splice(0).forEach(storyBlockWake);
};

// The columns of the model at a year, blended from the two nearest frames. It returns false when no frame exists.
const storyBlockSample = (block, year) => {
  const data = storyBlockData;
  const source = data.live.complete ? data.live : data.stored;
  if (!source.entries.length) {
    block.cur.h.fill(0);
    block.cur.ch4.fill(0);
    return false;
  }
  const pair = storyBlockFramePair(source.years, year, block.pair);
  const a = source.entries[pair.lo];
  const b = source.entries[pair.hi];
  if (a.colsKey !== block.id) storyBlockBind(a, block);
  if (b.colsKey !== block.id) storyBlockBind(b, block);
  storyBlockBlend(block.cur, a.cols, b.cols, pair.t);
  return true;
};

const storyBlockQuad = (ctx, ax, ta, da, bx, tb, db, f0, f1) => {
  ctx.beginPath();
  ctx.moveTo(ax, ta + da * f0);
  ctx.lineTo(bx, tb + db * f0);
  ctx.lineTo(bx, tb + db * f1);
  ctx.lineTo(ax, ta + da * f1);
  ctx.closePath();
};

// One side face of column c between the corners ia and ib. g is the gas share of the column (0 to 1).
const storyBlockFace = (ctx, block, pal, s, c, ia, ib, tone, g, kind) => {
  const pa = 4 * c + ia;
  const pb = 4 * c + ib;
  const ax = block.X[pa];
  const bx = block.X[pb];
  const ta = block.YT[pa];
  const tb = block.YT[pb];
  const da = block.YB[pa] - ta;
  const db = block.YB[pb] - tb;
  const nz = block.nz;
  const T = STORY_BLOCK_TONES;
  const S = STORY_BLOCK_STEPS;
  const rock = pal.rock[tone];
  const gas = g > 0.0005;
  if (s.sharp < 1) {
    ctx.fillStyle = rock;
    storyBlockQuad(ctx, ax, ta, da, bx, tb, db, 0, 1);
    ctx.fill();
    if (gas) {
      const used = Math.min(nz, Math.ceil(g * nz - 1e-9));
      for (let k = 0; k < used; k++) {
        const step = Math.round(storyBlockCellFill(g, k, nz) * S);
        if (!step) continue;
        ctx.fillStyle = pal.fill[(kind * T + tone) * (S + 1) + step];
        storyBlockQuad(ctx, ax, ta, da, bx, tb, db, k / nz, (k + 1) / nz);
        ctx.fill();
      }
    }
  }
  if (s.sharp > 0) {
    const h = storyClamp(g);
    if (s.sharp < 1) ctx.globalAlpha = s.sharp;
    if (h < 1) {
      ctx.fillStyle = rock;
      storyBlockQuad(ctx, ax, ta, da, bx, tb, db, h, 1);
      ctx.fill();
    }
    if (gas) {
      ctx.fillStyle = pal.fill[(kind * T + tone) * (S + 1) + S];
      storyBlockQuad(ctx, ax, ta, da, bx, tb, db, 0, h);
      ctx.fill();
      ctx.strokeStyle = pal.edge[kind];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax, ta + da * h);
      ctx.lineTo(bx, tb + db * h);
      ctx.stroke();
      ctx.lineWidth = block.layout.line;
    }
    ctx.globalAlpha = 1;
  }
  if (s.pillars > 0) {
    ctx.strokeStyle = pal.line[20];
    ctx.beginPath();
    ctx.moveTo(ax, ta);
    ctx.lineTo(ax, ta + da * s.pillars);
    ctx.moveTo(bx, tb);
    ctx.lineTo(bx, tb + db * s.pillars);
    ctx.stroke();
  }
  if (s.layers > 0) {
    // Layer line k grows from the left end of the face. The lines draw one after the other from the top.
    const fade = Math.round((1 - s.sharp) * 20);
    if (fade > 0) {
      ctx.strokeStyle = pal.line[fade];
      ctx.beginPath();
      for (let k = 1; k < nz; k++) {
        const w = storyClamp(s.layers * nz - (k - 1));
        if (w <= 0) break;
        ctx.moveTo(ax, ta + da * k / nz);
        ctx.lineTo(ax + (bx - ax) * w, ta + da * k / nz + (tb + db * k / nz - ta - da * k / nz) * w);
      }
      ctx.stroke();
    }
    const w = storyClamp(s.layers * nz - (nz - 1));
    if (w > 0) {
      ctx.strokeStyle = pal.line[20];
      ctx.beginPath();
      ctx.moveTo(ax, ta + da);
      ctx.lineTo(ax + (bx - ax) * w, ta + da + (tb + db - ta - da) * w);
      ctx.stroke();
    }
  }
};

// The top face of column c.
const storyBlockTop = (ctx, block, pal, s, c, g, kind) => {
  const o = 4 * c;
  const X = block.X;
  const Y = block.YT;
  const tone = block.tone[c];
  const T = STORY_BLOCK_TONES;
  const S = STORY_BLOCK_STEPS;
  const band = g > 0.0005 ? storyBlockBand(g) : 0;
  const bandColor = band > 0 ? pal.band[(kind * STORY_BLOCK_BANDS + band - 1) * STORY_BLOCK_TOPS + tone] : '';
  let color = pal.rock[tone];
  if (g > 0.0005 && s.bands < 1) color = pal.fill[(kind * T + tone) * (S + 1) + Math.round(storyBlockCellFill(g, 0, block.nz) * S)];
  else if (band > 0) color = bandColor;
  ctx.beginPath();
  ctx.moveTo(X[o], Y[o]);
  ctx.lineTo(X[o + 1], Y[o + 1]);
  ctx.lineTo(X[o + 2], Y[o + 2]);
  ctx.lineTo(X[o + 3], Y[o + 3]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (band > 0 && s.bands > 0 && s.bands < 1) {
    ctx.globalAlpha = s.bands;
    ctx.fillStyle = bandColor;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // The thin line in the colour of the face closes the gap between two faces.
  if (s.pillars < 0.98) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.lineWidth = block.layout.line;
  }
  if (s.pillars > 0) {
    ctx.strokeStyle = pal.line[Math.round(s.pillars * 20)];
    ctx.stroke();
  }
};

// The text of the run clock or the counter, top left.
const storyBlockHeadline = (ctx, block, big, small, alpha) => {
  if (alpha <= 0.01) return;
  const { clock, fonts } = block.layout;
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.font = block.fonts.big;
  ctx.fillText(big, clock.x, clock.y);
  ctx.fillStyle = STORY_COLORS.muted;
  ctx.font = block.fonts.small;
  for (let k = 0; k < small.length; k++) ctx.fillText(small[k], clock.x, clock.y + fonts.big * 1.18 + k * fonts.small * 1.4);
  ctx.globalAlpha = 1;
};

const storyBlockLabel = (ctx, block, label, alpha) => {
  if (alpha <= 0.01) return;
  const dot = label.anchor === false ? 0 : 2.4;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1;
  if (dot) {
    ctx.beginPath();
    ctx.moveTo(label.x, label.y);
    ctx.lineTo(label.x + label.dx, label.y + label.dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(label.x, label.y, dot, 0, Math.PI * 2);
    ctx.fill();
  }
  const pad = block.layout.fonts.label * 0.35;
  ctx.font = block.fonts.label;
  ctx.textAlign = label.align;
  ctx.textBaseline = label.anchor === false ? 'bottom' : label.dy < 0 ? 'bottom' : 'top';
  const tx = label.x + label.dx + (label.align === 'end' ? -pad : label.align === 'start' ? pad : 0);
  ctx.fillText(label.text, tx, label.y + label.dy + (label.anchor === false ? -pad : label.dy < 0 ? -pad * 0.3 : pad * 0.3));
  ctx.lineWidth = block.layout.line;
  ctx.globalAlpha = 1;
};

// Paint the whole block. scene says how much of each effect shows (see storyBlockGrid, storyBlockVe and storyBlockLive).
const storyBlockPaint = (ctx, block, pal, s) => {
  const { order, flags, nz } = block;
  const cur = block.cur;
  ctx.lineJoin = 'round';
  ctx.lineWidth = block.layout.line;
  for (let n = 0; n < order.length; n++) {
    const c = order[n];
    const g = cur.h[c] * s.gas;
    const kind = g > 0.0005 ? storyBlockKind(cur.ch4[c]) : 0;
    const f = flags[c];
    if (f & STORY_BLOCK_FACE_EAST) storyBlockFace(ctx, block, pal, s, c, 1, 2, STORY_BLOCK_EAST, g, kind);
    if (f & STORY_BLOCK_FACE_NORTH) storyBlockFace(ctx, block, pal, s, c, 2, 3, STORY_BLOCK_NORTH, g, kind);
    storyBlockTop(ctx, block, pal, s, c, g, kind);
  }
  // The fault trace along the top edge of its scarp.
  if (s.pillars > 0.5 && block.scarp.length) {
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let n = 0; n < block.scarp.length; n++) {
      const o = 4 * block.scarp[n];
      ctx.moveTo(block.X[o + 1], block.YT[o + 1]);
      ctx.lineTo(block.X[o + 2], block.YT[o + 2]);
    }
    ctx.stroke();
    ctx.lineWidth = block.layout.line;
  }
  // The injection well.
  const well = block.well;
  ctx.globalAlpha = s.labels;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 3 * block.layout.scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(well.x, well.y0 - well.up);
  ctx.lineTo(well.x, well.y1);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.lineWidth = block.layout.line;
  ctx.globalAlpha = 1;
  // The bracket that marks h on a cut face.
  if (s.bracket > 0.01 && block.bracket >= 0) {
    const o = 4 * block.bracket;
    const mx = (block.X[o + 1] + block.X[o + 2]) / 2;
    const y0 = (block.YT[o + 1] + block.YT[o + 2]) / 2;
    const y1 = y0 + ((block.YB[o + 1] - block.YT[o + 1]) + (block.YB[o + 2] - block.YT[o + 2])) / 2 * cur.h[block.bracket];
    ctx.globalAlpha = s.bracket;
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.fillStyle = STORY_COLORS.cream;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(mx, y0);
    ctx.lineTo(mx, y1);
    ctx.moveTo(mx - 6, y0);
    ctx.lineTo(mx + 6, y0);
    ctx.moveTo(mx - 6, y1);
    ctx.lineTo(mx + 6, y1);
    ctx.stroke();
    ctx.font = block.fonts.h;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('h', mx + 9, (y0 + y1) / 2);
    ctx.lineWidth = block.layout.line;
    ctx.globalAlpha = 1;
  }
};

// The labels, the run clock or counter, and the notes. They stay out of the caption areas (see storyBlockLayout).
const storyBlockAnnotate = (ctx, block, s, id) => {
  const co2 = storyBlockEase((s.year - 3) / 6);
  for (let n = 0; n < block.labels.length; n++) {
    const label = block.labels[n];
    storyBlockLabel(ctx, block, label, s.labels * (label.id === 'co2' ? co2 : 1));
  }
  const minute = Math.round(storyClamp(s.year / STORY_BLOCK_GRID_YEARS) * STORY_BLOCK_RUN_MINUTES);
  if (minute !== block.clockMinute) {
    block.clockMinute = minute;
    block.clockText = storyBlockClock(s.year / STORY_BLOCK_GRID_YEARS);
  }
  storyBlockHeadline(ctx, block, block.clockText, STORY_BLOCK_CLOCK_NOTE, s.clockAlpha);
  if (s.counterAlpha > 0.01) {
    // The text changes only when the counter moves by half a percent, so a draw makes no new strings.
    const step = Math.round(s.counter * 200);
    if (step !== block.counterStep) {
      block.counterStep = step;
      const counter = storyBlockCounter(block.grid.columns * block.nz, block.grid.columns, s.counter);
      block.counterText = counter.big;
      block.counterNote = [counter.small];
    }
    storyBlockHeadline(ctx, block, block.counterText, block.counterNote, s.counterAlpha);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = STORY_COLORS.muted;
  ctx.font = block.fonts.small;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  const note = block.layout.fit.x1;
  const below = block.edge.bottom + block.layout.fonts.label * 0.6;
  ctx.fillText(block.depthNote, note, below);
  if (id === 've' && s.bracket > 0.01) {
    ctx.globalAlpha = s.bracket;
    ctx.fillText('One cell per column; brine below h', note, below + block.layout.fonts.small * 1.35);
    ctx.globalAlpha = 1;
  }
};

const STORY_BLOCK_CLOCK_NOTE = ['3D run time so far, for a typical', 'field model (for illustration)'];

// Draw one frame of the chapter id. entry is the renderer object.
const storyBlockDraw = (entry, id, ctx, frame) => {
  const block = storyBlockGet(frame);
  const stored = storyBlockData.stored;
  if (stored.status === 'idle') storyBlockLoad();
  const loading = stored.status === 'loading';
  if (loading) {
    if (frame.reducedMotion) {
      if (!storyBlockState.replays.some(item => item.ctx === ctx)) storyBlockState.replays.push({ entry, id, ctx, frame });
      else storyBlockState.replays.find(item => item.ctx === ctx).frame = frame;
    } else if (!entry.animated) {
      storyBlockState.waiting.push(entry);
      storyBlockWake(entry);
    }
  }
  const pal = storyBlockState.palette || (storyBlockState.palette = storyBlockPalette(STORY_COLORS));
  const s = storyBlockState.scene;
  if (id === 'grid') storyBlockGrid(frame.local, s);
  else if (id === 've') storyBlockVe(frame.local, s);
  else storyBlockLiveScene(entry, frame, s);
  if (frame.reducedMotion && id === 'grid') s.clockAlpha = 1;
  storyBlockSample(block, s.year);
  if (s.bracket > 0.01 && block.bracket < 0) block.bracket = storyBlockPickBracket(block);
  storyBlockPaint(ctx, block, pal, s);
  storyBlockAnnotate(ctx, block, s, id);
  if (id === 'live') entry.animated = storyBlockLiveBusy(frame) || (loading && !frame.reducedMotion);
  else if (!loading) entry.animated = false;
};

// ---- chapter live: the player, the controls and the worker

const storyLive = {
  entry: null,
  nodes: null,
  mounted: false,
  playing: false,
  resume: false,
  year: STORY_BLOCK_GRID_YEARS,
  lastYear: 100,
  last: null,
  cells: 0,
  target: 0,
  shown: -1,
  shownState: '',
  onVisibility: null,
};

const storyBlockReducedNow = () => !!(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// Write the year and the play state to the controls. It writes only when a value changes.
const storyBlockSyncControls = () => {
  const live = storyLive;
  const n = live.nodes;
  if (!n) return;
  const year = Math.round(live.year);
  if (live.shown !== year) {
    live.shown = year;
    n.range.value = String(year);
    n.range.setAttribute('aria-valuetext', `Year ${year}`);
    n.range.style.setProperty('--fill', `${(year / live.lastYear * 100).toFixed(1)}%`);
    n.year.textContent = `Year ${year}`;
  }
  const state = live.playing ? 'playing' : 'paused';
  if (live.shownState !== state) {
    live.shownState = state;
    n.play.setAttribute('data-state', state);
    n.play.setAttribute('aria-label', live.playing ? 'Pause' : 'Play');
  }
};

// The player advances in the draw call. This returns the scene of the chapter live.
const storyBlockLiveScene = (entry, frame, s) => {
  const live = storyLive;
  const running = live.mounted && !frame.reducedMotion;
  if (running) {
    const dt = storyBlockStep(frame.time, live.last);
    live.last = frame.time;
    if (live.playing) {
      live.year = storyBlockAdvance(live.year, dt, live.lastYear);
      if (live.year >= live.lastYear) {
        live.playing = false;
        live.last = null;
      }
    }
    if (live.cells !== live.target) {
      const move = dt / 350;
      live.cells = live.target > live.cells ? Math.min(live.target, live.cells + move) : Math.max(live.target, live.cells - move);
    }
    storyBlockSyncControls();
  }
  return storyBlockLive(frame.local, running ? live.cells : 0, running ? live.year : STORY_BLOCK_GRID_YEARS, s);
};

// The renderer needs frames while the player runs and while the cells change.
const storyBlockLiveBusy = frame => storyLive.mounted && !frame.reducedMotion && (storyLive.playing || storyLive.cells !== storyLive.target);

const storyBlockVisibility = live => {
  if (document.hidden) {
    if (live.playing) {
      live.playing = false;
      live.resume = true;
      storyBlockSyncControls();
    }
  } else if (live.resume) {
    live.resume = false;
    live.playing = true;
    live.last = null;
    storyBlockSyncControls();
    storyBlockWake(live.entry);
  }
};

// Build the controls in the layer of the stage. The styles are in colors_and_type.css (Story block controls).
const storyBlockControls = (layer, live) => {
  const make = (tag, className, attrs, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    Object.keys(attrs || {}).forEach(name => node.setAttribute(name, attrs[name]));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const root = make('div', 'story-controls', { role: 'group', 'aria-label': 'Story block controls' });
  const play = make('button', 'story-controls__play', { type: 'button', 'data-state': 'paused', 'aria-label': 'Play' });
  play.appendChild(make('span', 'story-controls__icon', { 'aria-hidden': 'true' }));
  const time = make('div', 'story-controls__time');
  const year = make('span', 'story-controls__year', { 'aria-hidden': 'true' }, `Year ${STORY_BLOCK_GRID_YEARS}`);
  const range = make('input', 'story-controls__range', {
    type: 'range', min: '0', max: String(live.lastYear), step: '1', value: String(STORY_BLOCK_GRID_YEARS), 'aria-label': 'Simulation year',
  });
  time.appendChild(year);
  time.appendChild(range);
  const legend = make('ul', 'story-controls__legend', { 'aria-label': 'Legend' });
  legend.appendChild(make('li', 'story-controls__chip story-controls__chip--ch4', {}, 'Methane'));
  legend.appendChild(make('li', 'story-controls__chip story-controls__chip--co2', {}, 'CO₂'));
  const label = make('label', 'story-controls__switch');
  const toggle = make('input', 'story-controls__toggle', { type: 'checkbox', role: 'switch' });
  label.appendChild(toggle);
  label.appendChild(make('span', 'story-controls__track', { 'aria-hidden': 'true' }));
  label.appendChild(make('span', 'story-controls__switch-text', {}, 'Show 3D cells'));
  [play, time, legend, label].forEach(part => root.appendChild(part));
  layer.appendChild(root);

  play.addEventListener('click', () => {
    if (live.playing) {
      live.playing = false;
    } else {
      if (live.year >= live.lastYear) live.year = 0;
      live.playing = true;
      live.last = null;
    }
    live.resume = false;
    storyBlockSyncControls();
    storyBlockWake(live.entry);
  });
  range.addEventListener('input', () => {
    live.year = Number(range.value);
    live.playing = false;
    live.resume = false;
    live.last = null;
    storyBlockSyncControls();
    storyBlockWake(live.entry);
  });
  toggle.addEventListener('change', () => {
    live.target = toggle.checked ? 1 : 0;
    storyBlockWake(live.entry);
  });
  return { root, play, year, range, toggle };
};

// Run the scenario in the worker, once. The page uses the stored frames until all frames arrive.
const storyBlockStartWorker = () => {
  const live = storyBlockData.live;
  if (live.status !== 'idle' || live.complete) return;
  const fail = () => {
    live.status = 'failed';
    if (live.worker) live.worker.terminate();
    live.worker = null;
  };
  if (typeof Worker !== 'function') { live.status = 'failed'; return; }
  try {
    const worker = new Worker(STORY_BLOCK_WORKER_URL);
    live.run += 1;
    live.status = 'running';
    live.worker = worker;
    const run = live.run;
    const last = StoryGeometry.STORY_SCENARIO.years;
    worker.onmessage = ({ data }) => {
      if (data.id !== run) return;
      if (data.type === 'frame') {
        const entry = { year: data.year, h: data.h, ch4: data.ch4, cols: null, colsKey: 0 };
        if (storyBlockState.block) storyBlockBind(entry, storyBlockState.block);
        live.entries[data.year] = entry;
        live.years[data.year] = data.year;
      } else if (data.type === 'done') {
        live.complete = live.entries.length === last + 1 && live.entries.every(Boolean);
        live.status = live.complete ? 'done' : 'failed';
        live.worker = null;
        worker.terminate();
        if (storyLive.mounted) storyBlockWake(storyLive.entry);
      } else if (data.type === 'error') {
        console.error('The story worker failed.', data.message);
        fail();
      }
    };
    worker.onerror = fail;
    worker.postMessage({ type: 'run', id: run });
  } catch (error) {
    fail();
  }
};

const storyBlockRenderer = id => ({
  animated: false,
  draw(ctx, frame) {
    storyBlockDraw(this, id, ctx, frame);
  },
});

STORY_RENDERERS.grid = storyBlockRenderer('grid');
STORY_RENDERERS.ve = storyBlockRenderer('ve');
STORY_RENDERERS.live = {
  ...storyBlockRenderer('live'),
  mount(layer) {
    const live = storyLive;
    live.entry = this;
    live.lastYear = StoryGeometry.STORY_SCENARIO.years;
    live.year = STORY_BLOCK_GRID_YEARS;
    live.cells = 0;
    live.target = 0;
    live.last = null;
    live.resume = false;
    live.shown = -1;
    live.shownState = '';
    live.playing = !storyBlockReducedNow();
    live.nodes = storyBlockControls(layer, live);
    live.mounted = true;
    live.onVisibility = () => storyBlockVisibility(live);
    document.addEventListener('visibilitychange', live.onVisibility);
    storyBlockSyncControls();
    storyBlockStartWorker();
    if (live.playing) storyBlockWake(this);
  },
  unmount() {
    const live = storyLive;
    live.mounted = false;
    live.playing = false;
    live.resume = false;
    document.removeEventListener('visibilitychange', live.onVisibility);
    const root = live.nodes && live.nodes.root;
    if (root && root.parentNode) root.parentNode.removeChild(root);
    live.nodes = null;
    this.animated = false;
  },
};

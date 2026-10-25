const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Story = require('../story-geometry.js');
const { SITE_STORY } = require('../site-content.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const between = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to));

const source = read('StoryRock.jsx');
const NAMES = ['ROCK_BOTTOM', 'ROCK_DOMAIN', 'ROCK_PLUME_YEAR', 'ROCK_FOLLOW_END', 'ROCK_OUT_END', 'ROCK_RATIO', 'ROCK_SAMPLES',
  'rockClamp', 'rockSmooth', 'rockMix', 'rockShade', 'rockLayout', 'rockCameraSpec', 'rockCamera', 'rockView',
  'rockBands', 'rockBandsAt', 'rockBoundary', 'rockInner', 'rockCap', 'rockGasAlong', 'rockPlume', 'rockWaves', 'rockLabels', 'rockLabelBox', 'rockApart'];
const helpers = new Function(between(source, '// ---- story rock helpers', '// ---- end story rock helpers') + `\nreturn { ${NAMES.join(', ')} };`)();
const { ROCK_BOTTOM, ROCK_DOMAIN, ROCK_PLUME_YEAR, ROCK_FOLLOW_END, ROCK_OUT_END, ROCK_RATIO, ROCK_SAMPLES,
  rockClamp, rockSmooth, rockMix, rockShade, rockLayout, rockCameraSpec, rockCamera, rockView,
  rockBands, rockBandsAt, rockBoundary, rockInner, rockCap, rockGasAlong, rockPlume, rockWaves, rockLabels, rockLabelBox, rockApart } = helpers;

const section = Story.storySection(ROCK_SAMPLES);
const run = JSON.parse(read('assets/story-run.json'));
const frameAt = year => run.frames.find(frame => frame.year === year);
const SIZES = [[1280, 800], [1440, 900], [1920, 1080], [1024, 768], [844, 390], [768, 1024], [390, 844], [360, 640], [320, 568]];
const anchors = { wellS: section.well.s, seaFloor: section.horizons[0].depth[0] / 1000, reservoir: section.well.topDepth / 1000 };
const layoutOf = (width, height, options = {}) => rockLayout(width, height, { length: section.length, captionChars: 127, ...options });
const near = (actual, expected, tolerance, message) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} is not within ${tolerance} of ${expected}`);

test('the vertical scale label states the true ratio of the two screen scales', () => {
  for (const [width, height] of SIZES) {
    const layout = layoutOf(width, height);
    const fit = rockCamera(1, rockCameraSpec(layout, anchors));
    for (const zoom of [1, 2.6]) {
      const view = rockView(layout, { ...fit, zoom });
      const horizontal = (view.x(layout.s1) - view.x(layout.s0)) / (layout.s1 - layout.s0);
      const vertical = view.y(2) - view.y(1);
      near(vertical / horizontal, layout.ratio, 1e-9, `${width}x${height} at zoom ${zoom}`);
    }
    assert.equal(layout.exaggeration, Math.round(layout.ratio));
    assert.equal(layout.scaleLabel, `Vertical scale × ${Math.round(layout.vz / layout.sx)}`);
    assert.ok(layout.ratio >= 3 - 1e-9 && layout.ratio <= ROCK_RATIO.max + 1e-9, `${width}x${height}: the ratio ${layout.ratio} is in range`);
  }
  assert.equal(layoutOf(1280, 800).exaggeration, 6, 'the wide layout is about 6 times');
  assert.ok(layoutOf(390, 844).exaggeration > layoutOf(1280, 800).exaggeration, 'the phone layout needs more');
});

test('the block fits in its window and the captions stay clear', () => {
  for (const [width, height] of SIZES) {
    const layout = layoutOf(width, height);
    const { win } = layout;
    const right = layout.ox + (layout.s1 - layout.s0) * layout.sx + layout.qx * layout.back;
    assert.ok(layout.ox - layout.pad >= win.x0 - 1e-9, `${width}x${height}: left edge`);
    assert.ok(right <= win.x1 + 1e-9, `${width}x${height}: right edge ${right} <= ${win.x1}`);
    assert.ok(layout.oy - layout.qy * layout.back >= win.y0, `${width}x${height}: the back edge of the sea`);
    assert.ok(layout.oy - layout.plat >= win.y0, `${width}x${height}: the platform`);
    assert.ok(layout.oy + layout.vz * ROCK_BOTTOM <= win.y1 + 1e-9, `${width}x${height}: the bottom`);
    assert.ok(win.y1 <= height && win.x1 <= width);
    if (width > 640) {
      assert.equal(layout.narrow, false);
      assert.equal(layout.caption, 'side');
      assert.ok(layout.axisX - 40 >= width * 0.295 + 8, `${width}x${height}: the axis labels stand right of the caption (29.5% of the width)`);
      assert.ok(layout.oy - layout.plat >= 120, `${width}x${height}: the platform stands under the skip control`);
    } else {
      assert.equal(layout.narrow, true);
      assert.equal(layout.caption, 'top');
      const lines = Math.ceil(127 * 8.6 / (width - 32));
      assert.ok(win.y0 >= 128 + lines * 25.5, `${width}x${height}: the top band of the captions is clear`);
      assert.ok(layout.s1 - layout.s0 < section.length * 0.8, 'the phone block is narrower');
      assert.ok(layout.s0 < section.faults[0].s && layout.s1 > section.well.s, 'the phone block keeps the fault and the well');
    }
  }
  const still = layoutOf(1120, 630, { caption: 'none' });
  assert.equal(still.win.y0, 8, 'a static frame has no caption band');
  assert.equal(still.s0, 0);
});

test('the camera follows the well to the reservoir, zooms out, then holds', () => {
  for (const [width, height] of SIZES) {
    const layout = layoutOf(width, height);
    const spec = rockCameraSpec(layout, anchors);
    const start = rockCamera(0, spec);
    assert.deepEqual([start.s, start.d, start.x, start.y], [anchors.wellS, anchors.seaFloor, spec.anchorIn.x, spec.anchorIn.y], 'local 0 is the well at the sea floor');
    assert.equal(start.zoom, spec.zoomIn);
    assert.ok(spec.zoomIn > 2, 'the start is zoomed in');
    const middle = rockCamera(ROCK_FOLLOW_END, spec);
    near(middle.d, anchors.reservoir, 1e-12, 'local 0.5 is the reservoir top');
    assert.equal(middle.s, anchors.wellS);
    near(middle.zoom, spec.zoomIn, 1e-12, 'still zoomed in at 0.5');
    for (const local of [ROCK_OUT_END, 0.9, 1]) {
      const end = rockCamera(local, spec);
      near(end.zoom, 1, 1e-12, `zoom at ${local}`);
      assert.deepEqual([end.s, end.d, end.x, end.y], [spec.center.s, spec.center.d, spec.center.x, spec.center.y], `the whole cutaway at ${local}`);
      const view = rockView(layout, end);
      near(view.x(layout.s0), layout.ox, 1e-9, 'the fit view is the base layout');
      near(view.y(0), layout.oy, 1e-9, 'the fit view is the base layout');
    }
    assert.deepEqual(rockCamera(0.8, spec), rockCamera(1, spec), 'the hold does not move');
    assert.deepEqual(rockCamera(NaN, spec), start, 'NaN gives the start');
    assert.deepEqual(rockCamera(-1, spec), start);
    assert.deepEqual(rockCamera(5, spec), rockCamera(1, spec));

    let last = rockCamera(0, spec);
    let maxStep = 0;
    for (let i = 1; i <= 1000; i++) {
      const local = i / 1000;
      const cam = rockCamera(local, spec);
      assert.ok(cam.zoom <= last.zoom + 1e-12, `zoom never grows (${local})`);
      if (local <= ROCK_FOLLOW_END) {
        assert.ok(cam.d >= last.d - 1e-12, 'the camera only goes down the well');
        const view = rockView(layout, cam);
        near(view.x(anchors.wellS), spec.anchorIn.x, 1e-6, 'the well stays at one place on the screen while the camera follows');
        near(view.y(cam.d), spec.anchorIn.y, 1e-6, 'the followed point stays at one place on the screen');
      }
      const view = rockView(layout, cam);
      const x = view.x(anchors.wellS);
      assert.ok(x > layout.win.x0 && x < layout.win.x1, `the well is in the window at local ${local}`);
      maxStep = Math.max(maxStep, Math.abs(cam.zoom - last.zoom), Math.abs(cam.d - last.d));
      last = cam;
    }
    assert.ok(maxStep < 0.05, `the camera has no jump (${maxStep})`);
    const soft = rockCamera(0.01, spec);
    assert.ok(soft.d - start.d < 0.002 * (anchors.reservoir - anchors.seaFloor) * 10, 'the camera starts slowly');
  }
  assert.equal(rockSmooth(0), 0);
  assert.equal(rockSmooth(1), 1);
  assert.equal(rockSmooth(0.5), 0.5);
  assert.equal(ROCK_FOLLOW_END, 0.5);
  assert.equal(ROCK_OUT_END, 0.8);
});

test('the gas is sampled along the section line with bilinear weights', () => {
  const grid = [4, 3];
  const dx = ROCK_DOMAIN.lx / 4;
  const dy = ROCK_DOMAIN.ly / 3;
  const frame = { h: Float64Array.from({ length: 12 }, (_, cell) => 10 + cell), ch4: new Float64Array(12) };
  const at = (x, y) => ({ samples: 1, x: [x], y: [y] });
  const centre = (i, j) => [(i + 0.5) * dx, (j + 0.5) * dy];
  const gas = (x, y) => rockGasAlong(at(x, y), frame, grid).h[0];
  near(gas(...centre(0, 0)), 10, 1e-12, 'a cell centre gives the cell value');
  near(gas(...centre(2, 1)), 10 + 1 * 4 + 2, 1e-12, 'a cell centre in the middle');
  near(gas((centre(0, 0)[0] + centre(1, 0)[0]) / 2, centre(0, 0)[1]), 10.5, 1e-12, 'half way between two centres');
  near(gas(dx, dy), (10 + 11 + 14 + 15) / 4, 1e-12, 'the corner of four cells');
  near(gas(-5, -5), 10, 1e-12, 'outside the domain it takes the nearest cell');
  near(gas(ROCK_DOMAIN.lx + 5, ROCK_DOMAIN.ly + 5), 21, 1e-12, 'outside the far corner');

  // The share is weighted with the gas thickness: 10 m of methane and 30 m of CO2 give 0.25, not 0.5.
  const mixed = { h: Float64Array.of(10, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), ch4: Float64Array.of(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0) };
  const result = rockGasAlong(at(dx, dy / 2), mixed, grid);
  near(result.h[0], 20, 1e-12, 'the thickness is the mean');
  near(result.share[0], 0.25, 1e-12, 'the share has the thickness as weight');
  assert.equal(rockGasAlong(at(15, 11), mixed, grid).share[0], 0, 'no gas, no share');

  const line = { samples: 3, x: [2.5, 5, 7.5], y: [2, 2, 2] };
  const sampled = rockGasAlong(line, frame, grid);
  assert.equal(sampled.h.length, 3);
  assert.equal(sampled.share.length, 3);
});

test('the stored frame at year 10 gives the CO2 plume at the well and the gas cap at the crest', () => {
  assert.equal(ROCK_PLUME_YEAR, 10);
  assert.deepEqual(run.grid.map(count => count * 0.5), [ROCK_DOMAIN.lx, ROCK_DOMAIN.ly], 'the model cells are 0.5 km wide');
  assert.equal(ROCK_DOMAIN.lx, 20000 / 1000);
  assert.equal(ROCK_DOMAIN.ly, 12000 / 1000);
  const gas = rockGasAlong(section, frameAt(ROCK_PLUME_YEAR), run.grid);
  const peak = (from, to) => {
    let best = 0;
    section.s.forEach((s, k) => { if (s >= from && s <= to && gas.h[k] > gas.h[best]) best = k; });
    return best;
  };
  const well = peak(section.well.s - 1, section.well.s + 1);
  near(section.s[well], section.well.s, 0.15, 'the plume is thickest at the well');
  assert.ok(gas.h[well] > 40 && gas.h[well] < 60, `the plume at the well is about 50 m (${gas.h[well]})`);
  assert.ok(gas.share[well] < 0.01, 'the gas at the well is CO2');
  const crest = peak(section.cap.start, section.cap.end);
  near(section.s[crest], section.crest.s, 0.3, 'the gas cap is thickest at the crest');
  assert.ok(gas.h[crest] > 45 && gas.h[crest] < 55, `the gas cap is about 50 m (${gas.h[crest]})`);
  assert.ok(gas.share[crest] > 0.99, 'the gas cap is methane');
  const west = section.s.findIndex(s => s > 3);
  assert.equal(gas.h[west], 0, 'no gas in the west');
  for (let k = 0; k < section.samples; k++) assert.ok(gas.share[k] >= 0 && gas.share[k] <= 1 + 1e-12);

  const plume = rockPlume(section, gas);
  for (let k = 0; k < section.samples; k++) {
    assert.ok(plume.th[k] >= 0);
    assert.ok(plume.th[k] <= section.base[k] - section.top[k] + 1e-9, 'the plume stays in the sandstone');
    if (section.s[k] >= section.cap.start && section.s[k] <= section.cap.end) assert.equal(plume.th[k], 0, 'the plume skips the gas cap');
  }
  assert.ok(plume.th[well] > 40, 'the plume is there');
  const gap = Array.from(plume.th).map((value, k) => [value, section.s[k]]).filter(([value, s]) => value > 0 && s > section.cap.end);
  assert.ok(gap[0][1] - section.cap.end > 2, 'the plume and the gas cap stay about 2 km apart');

  const first = rockPlume(section, rockGasAlong(section, frameAt(0), run.grid));
  assert.equal(Math.max(...first.th), 0, 'at year 0 there is no plume, and the cap edge is not a plume');
  const later = rockPlume(section, rockGasAlong(section, frameAt(30), run.grid));
  assert.ok(Math.max(...later.th) > Math.max(...plume.th), 'the plume grows');
});

test('the layer boundaries along the section are ordered', () => {
  for (let k = 0; k < section.samples; k++) {
    const bands = rockBands(section, k);
    assert.equal(bands.length, 8);
    assert.equal(bands[0], 0);
    assert.equal(bands[7], ROCK_BOTTOM);
    for (let j = 0; j < 7; j++) assert.ok(bands[j + 1] > bands[j], `layer ${j} has a thickness at sample ${k}`);
  }
  for (const s of [0, 3.3, section.faults[0].s - 1e-6, section.faults[0].s + 1e-6, section.crest.s, section.well.s, section.length]) {
    const bands = rockBandsAt(section, s);
    for (let j = 0; j < 7; j++) assert.ok(bands[j + 1] > bands[j]);
  }
  near(rockBandsAt(section, section.crest.s)[5], section.crest.depth / 1000, 0.003, 'the reservoir top at the crest');
  near(rockBandsAt(section, section.well.s)[5], section.well.topDepth / 1000, 0.002, 'the reservoir top at the well');
  assert.ok(Math.max(...section.horizons[5].depth) / 1000 < ROCK_BOTTOM - 0.3, 'older rock has room under the reservoir');

  // The polylines of the boundaries: the same distance, the same order.
  const depthAt = (line, s, side) => {
    const last = line.s.length - 1;
    for (let i = 0; i < last; i++) {
      if (line.s[i] === s && line.s[i + 1] === s) return side === 'left' ? line.d[i] : line.d[i + 1];
    }
    for (let i = 0; i < last; i++) {
      if (s >= line.s[i] && s <= line.s[i + 1]) {
        const span = line.s[i + 1] - line.s[i];
        return span === 0 ? line.d[i] : line.d[i] + (line.d[i + 1] - line.d[i]) * (s - line.s[i]) / span;
      }
    }
    return NaN;
  };
  for (const [s0, s1] of [[0, section.length], [4.4, 19.2], [8, 15]]) {
    const lines = [0, 1, 2, 3, 4, 5, 6, 7].map(index => rockBoundary(section, index, s0, s1));
    lines.forEach(line => {
      assert.equal(line.s[0], s0);
      assert.equal(line.s[line.s.length - 1], s1);
      for (let i = 1; i < line.s.length; i++) assert.ok(line.s[i] >= line.s[i - 1], 'the distance never goes back');
    });
    for (const side of ['left', 'right']) {
      for (let j = 0; j < 7; j++) {
        const positions = [...lines[j].s, ...lines[j + 1].s];
        for (const s of positions) assert.ok(depthAt(lines[j + 1], s, side) > depthAt(lines[j], s, side), `layer ${j} is thicker than 0 at s = ${s} (${side}, window ${s0} to ${s1})`);
      }
    }
    const steps = lines.map(line => {
      const i = line.s.findIndex((s, k) => k > 0 && s === line.s[k - 1]);
      return i < 0 ? 0 : (line.d[i] - line.d[i - 1]) * 1000;
    });
    if (s0 < section.faults[0].s && s1 > section.faults[0].s) {
      assert.deepEqual(steps.map((value, j) => (value > 20 ? j : -1)).filter(j => j >= 0), [4, 5, 6], 'the fault offsets the chalk base, the reservoir top and the reservoir base');
      near(steps[5], section.faults[0].topAfter - section.faults[0].topBefore, 2, 'the step is the throw of the fault');
      near(steps[4], steps[5], 2, 'the layers below the chalk move together');
      assert.equal(lines[5].s.length, lines[6].s.length, 'the sandstone boundaries have the same points');
    } else {
      assert.deepEqual(steps, [0, 0, 0, 0, 0, 0, 0, 0], 'a window with no fault has no step');
    }
  }
  const inner = rockInner(rockBoundary(section, 5, 0, section.length), rockBoundary(section, 6, 0, section.length), 0.5);
  const top = rockBoundary(section, 5, 0, section.length);
  inner.d.forEach((value, i) => near(value, top.d[i] + 0.05, 1e-9, 'a thin shale is in the middle of the sandstone'));
});

test('the gas cap sits between the reservoir top and the flat contact', () => {
  const cap = rockCap(section);
  assert.equal(cap.contact, 2.05);
  assert.equal(cap.d[0], cap.contact);
  assert.equal(cap.d[cap.d.length - 1], cap.contact);
  assert.equal(cap.s[0], section.cap.start);
  assert.equal(cap.s[cap.s.length - 1], section.cap.end);
  assert.ok(cap.s.length > 10);
  for (let i = 1; i < cap.s.length - 1; i++) assert.ok(cap.d[i] <= cap.contact + 1e-12, 'the reservoir top is above the contact');
  near(Math.min(...cap.d), section.crest.depth / 1000, 0.003, 'the cap reaches the crest');
  assert.equal(rockCap({ ...section, cap: null }), null);
});

test('the labels are the ten of the spec and none overlap at the fit view', () => {
  const ALL = ['Sands and clays', 'Mudstone', 'Chalk', 'Shale caprock', 'Sandstone', 'Older rock', 'Gas cap (methane)', 'CO₂ from the well', 'Fault', 'Brine'];
  const wide = rockLabels(layoutOf(1280, 800), section);
  assert.deepEqual(wide.map(label => label.text).sort(), [...ALL].sort());
  assert.equal(new Set(wide.map(label => label.id)).size, wide.length, 'unique ids');
  const phone = rockLabels(layoutOf(390, 844), section).map(label => label.text);
  assert.ok(phone.length >= 5 && phone.length < wide.length, 'the phone has fewer labels');
  for (const text of ['Gas cap (methane)', 'CO₂ from the well', 'Fault', 'Sandstone', 'Chalk', 'Shale caprock']) assert.ok(phone.includes(text), `${text} stays on the phone`);

  for (const [width, height] of SIZES) {
    const layout = layoutOf(width, height);
    const labels = rockLabels(layout, section);
    assert.ok(labels.length >= 3, `${width}x${height}: some labels stay`);
    assert.ok(labels.some(label => label.id === 'gas') && labels.some(label => label.id === 'co2'), `${width}x${height}: the two fluids keep their labels`);
    const boxes = labels.map(label => ({ id: label.id, box: rockLabelBox(layout, section, label), label })).filter(item => item.box);
    boxes.forEach(({ id, box, label }) => {
      assert.ok(box.x0 >= layout.win.x0 && box.x1 <= layout.win.x1, `${width}x${height}: ${id} is inside the window (${box.x0} to ${box.x1})`);
      assert.ok(box.y0 >= layout.win.y0 && box.y1 <= layout.win.y1, `${width}x${height}: ${id} is inside the window`);
      if (label.kind === 'point') {
        const view = rockView(layout, rockCamera(1, rockCameraSpec(layout, anchors)));
        assert.ok(view.x(label.target.s) > layout.win.x0 && view.x(label.target.s) < layout.win.x1, `${width}x${height}: the dot of ${id} is in the window`);
      }
    });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        assert.ok(rockApart(boxes[i].box, boxes[j].box), `${width}x${height}: the labels ${boxes[i].id} and ${boxes[j].id} overlap`);
      }
    }
  }
  assert.ok(rockLabels(layoutOf(1024, 768), section).length === 10, 'a laptop screen keeps all ten labels');
  assert.ok(rockLabels(layoutOf(1920, 1080), section).length === 10, 'a large screen keeps all ten labels');

  const layout = layoutOf(1280, 800);
  const byId = Object.fromEntries(wide.map(label => [label.id, label]));
  const bandsAt = s => rockBandsAt(section, s);
  assert.ok(byId.gas.target.d > section.crest.depth / 1000 && byId.gas.target.d < 2.05, 'the gas cap dot is in the gas cap');
  assert.ok(byId.co2.target.d > bandsAt(byId.co2.target.s)[5] && byId.co2.target.d < bandsAt(byId.co2.target.s)[6], 'the CO2 dot is in the sandstone');
  assert.ok(byId.brine.target.d > 2.05, 'the brine dot is below the contact');
  assert.ok(byId.sandstone.target.d > bandsAt(byId.sandstone.target.s)[5] && byId.sandstone.target.d < bandsAt(byId.sandstone.target.s)[6]);
  assert.ok(byId.fault.target.s === section.faults[0].s && byId.fault.at.s < byId.fault.target.s, 'the fault text stands on the west side of the line');
  assert.ok(byId.gas.at.d > bandsAt(byId.gas.at.s)[6] && byId.gas.at.d < ROCK_BOTTOM, 'the gas cap text is in the older rock');
  assert.ok(layout.vz > 0);
});

test('the wave marks stay on the sea surface and do not change', () => {
  const layout = layoutOf(1280, 800);
  const waves = rockWaves(layout);
  assert.deepEqual(waves, rockWaves(layout));
  assert.ok(waves.length > 10);
  for (const wave of waves) {
    assert.ok(wave.s >= layout.s0 && wave.s <= layout.s1 - 1);
    assert.ok(wave.b > 0 && wave.b < layout.back);
  }
});

test('colours mix and shade as flat hex values', () => {
  assert.equal(rockMix('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(rockMix('#3b6cf0', '#c8463d', 0), '#3b6cf0');
  assert.equal(rockMix('#3b6cf0', '#c8463d', 1), '#c8463d');
  assert.equal(rockShade('#ffffff', 0.2), '#cccccc');
  assert.match(rockShade('#d8a657', 0.3), /^#[0-9a-f]{6}$/);
  assert.equal(rockClamp(NaN), 0);
  assert.equal(rockClamp(2), 1);
});

test('the file registers the rock renderer, after the placeholders, with flat colour only', () => {
  const build = read('build.js');
  assert.ok(build.indexOf("'StoryChapters.jsx'") > 0 && build.indexOf("'StoryRock.jsx'") > build.indexOf("'StoryChapters.jsx'"), 'StoryRock.jsx follows StoryChapters.jsx in build.js');
  assert.ok(build.indexOf("'StoryRock.jsx'") > build.indexOf("'StoryStage.jsx'") && build.indexOf("'StoryRock.jsx'") > build.indexOf("'story-geometry.js'"));
  assert.match(source, /STORY_RENDERERS\.rock = \{ animated: true, draw: rockDraw \};/);
  assert.doesNotMatch(source, /createLinearGradient|createRadialGradient|createConicGradient|shadowBlur|shadowColor|filter\s*=/, 'no gradients and no shadows');
  assert.doesNotMatch(read('StoryChapters.jsx'), /Rock/, 'StoryChapters.jsx stays as it is');
});

// A context that records what the renderer does. It checks every number that goes to the canvas.
const recorder = () => {
  const log = { fills: new Set(), strokes: new Set(), texts: [], calls: 0, bad: [] };
  const target = {
    measureText: text => ({ width: String(text).length * 6 }),
  };
  const numeric = ['moveTo', 'lineTo', 'arc', 'arcTo', 'fillRect', 'strokeRect', 'translate', 'scale', 'setLineDash', 'clearRect'];
  const ctx = new Proxy(target, {
    get(object, key) {
      if (key in object) return object[key];
      return (...args) => {
        log.calls += 1;
        if (numeric.includes(key)) args.flat().forEach(value => { if (typeof value !== 'number' || !Number.isFinite(value)) log.bad.push(`${String(key)}(${args.join(', ')})`); });
        if (key === 'fillText') { log.texts.push(args[0]); if (!args.slice(1).every(Number.isFinite)) log.bad.push(`fillText(${args.join(', ')})`); }
      };
    },
    set(object, key, value) {
      object[key] = value;
      if (key === 'fillStyle') log.fills.add(value);
      if (key === 'strokeStyle') log.strokes.add(value);
      if (key === 'globalAlpha' && !(value >= 0 && value <= 1)) log.bad.push(`globalAlpha = ${value}`);
      if (key === 'lineWidth' && !(value > 0)) log.bad.push(`lineWidth = ${value}`);
      return true;
    },
  });
  return { ctx, log };
};

const loadRenderer = (extra = {}) => {
  const stage = read('StoryStage.jsx');
  const colors = new Function(`${between(stage, 'const STORY_COLORS', '// A number from lo to hi')}\nreturn STORY_COLORS;`)();
  const context = { STORY_COLORS: colors, STORY_RENDERERS: {}, StoryGeometry: Story, SITE_STORY, console, ...extra };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { context, colors };
};

test('the renderer draws every chapter state without a bad number, at wide, phone and static sizes', () => {
  const { context, colors } = loadRenderer();
  const renderer = context.STORY_RENDERERS.rock;
  assert.equal(renderer.animated, true);
  assert.equal(typeof renderer.draw, 'function');
  const plumeFrame = frameAt(ROCK_PLUME_YEAR);
  vm.runInContext('rockState.plume = rockPlume(rockSection(), rockGasAlong(rockSection(), __frame, __grid));', Object.assign(context, { __frame: plumeFrame, __grid: run.grid }));
  const allowed = new Set([...Object.values(colors), '#d9cfae', '#a39a8b', '#74695c', '#7d6b5d', '#3d6c7b', '#5d8a98', '#8fb0ff']);
  for (const [width, height, reducedMotion] of [[1280, 800, false], [1920, 1080, false], [1024, 768, false], [390, 844, false], [320, 568, false], [1120, 630, true], [358, 201, true]]) {
    for (const local of [0, 0.1, 0.25, 0.5, 0.65, 0.8, 1]) {
      const { ctx, log } = recorder();
      renderer.draw(ctx, { local, p: 0.3, width, height, dpr: 2, time: 1234, reducedMotion });
      assert.deepEqual(log.bad, [], `${width}x${height} at ${local}`);
      assert.ok(log.calls > 200, 'it draws');
      for (const colour of [...log.fills, ...log.strokes]) {
        assert.ok(allowed.has(colour) || /^#[0-9a-f]{6}$/.test(colour), `a flat colour: ${colour}`);
      }
    }
  }
  const { ctx, log } = recorder();
  renderer.draw(ctx, { local: 1, p: 0.44, width: 1280, height: 800, dpr: 1, time: 0, reducedMotion: false });
  assert.ok(log.fills.has(colors.ch4) && log.fills.has(colors.co2), 'the gas cap is red and the plume is blue');
  for (const text of ['Sands and clays', 'Mudstone', 'Chalk', 'Shale caprock', 'Sandstone', 'Older rock', 'Gas cap (methane)', 'CO₂ from the well', 'Fault', 'Brine', 'Vertical scale × 6', '0', '1 km', '2 km']) {
    assert.ok(log.texts.includes(text), `the text "${text}" is on the stage`);
  }
  const start = recorder();
  renderer.draw(start.ctx, { local: 0, p: 0.26, width: 1280, height: 800, dpr: 1, time: 0, reducedMotion: false });
  assert.ok(!start.log.texts.includes('Gas cap (methane)'), 'the labels of the reservoir wait for the zoom out');
  const phone = recorder();
  renderer.draw(phone.ctx, { local: 1, p: 0.44, width: 390, height: 844, dpr: 1, time: 0, reducedMotion: false });
  assert.ok(!phone.log.texts.includes('Brine') && !phone.log.texts.includes('Mudstone') && !phone.log.texts.includes('Older rock'), 'the phone drops three labels');
  assert.ok(phone.log.texts.includes('Vertical scale × 10') || phone.log.texts.some(text => /^Vertical scale × \d+$/.test(text)));
});

test('the renderer does not draw the plume before the stored run has loaded', () => {
  const { context, colors } = loadRenderer();
  const { ctx, log } = recorder();
  context.STORY_RENDERERS.rock.draw(ctx, { local: 1, p: 0.44, width: 1280, height: 800, dpr: 1, time: 0, reducedMotion: false });
  assert.ok(log.fills.has(colors.ch4), 'the gas cap does not need the run');
  assert.ok(!log.fills.has(colors.co2), 'no plume without the run');
});

// A fetch that the test can release. It gives the stored run, or an error.
const slowFetch = ({ fail = false } = {}) => {
  const calls = [];
  let release;
  const pending = new Promise((resolve, reject) => {
    release = () => (fail ? reject(new Error('offline')) : resolve({ ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(run))) }));
  });
  return { calls, release: () => release(), fetch: url => { calls.push(url); return pending; } };
};
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const frameOf = (extra = {}) => ({ local: 1, p: 0.44, width: 1280, height: 800, dpr: 1, time: 0, reducedMotion: false, ...extra });

test('when the stored run arrives, each draw that ran before asks its frame for one more draw (stage and static frame)', async () => {
  const net = slowFetch();
  const { context, colors } = loadRenderer({ fetch: net.fetch });
  const renderer = context.STORY_RENDERERS.rock;
  let stage = 0;
  let still = 0;
  const stageFrame = frameOf({ requestDraw: () => { stage += 1; } });
  const stillFrame = frameOf({ reducedMotion: true, width: 1120, height: 630, requestDraw: () => { still += 1; } });
  const before = recorder();
  renderer.draw(before.ctx, stageFrame);
  renderer.draw(recorder().ctx, stageFrame);
  renderer.draw(recorder().ctx, stillFrame);
  assert.deepEqual(net.calls, ['./assets/story-run.json'], 'one request');
  assert.ok(!before.log.fills.has(colors.co2), 'no plume yet');
  assert.deepEqual([stage, still], [0, 0], 'nothing is asked before the run arrives');
  net.release();
  await settle();
  assert.deepEqual([stage, still], [1, 1], 'each function is called once, although the stage drew twice');
  for (const frame of [stageFrame, stillFrame]) {
    const after = recorder();
    renderer.draw(after.ctx, frame);
    assert.deepEqual(after.log.bad, []);
    assert.ok(after.log.fills.has(colors.co2), `the plume is there after the new draw (${frame.reducedMotion ? 'static' : 'pinned'})`);
  }
  assert.deepEqual([stage, still], [1, 1], 'a draw after the arrival asks for nothing');
  assert.equal(net.calls.length, 1);
});

test('a failed load of the stored run asks for nothing and leaves the picture without the plume', async () => {
  const net = slowFetch({ fail: true });
  const { context, colors } = loadRenderer({ fetch: net.fetch });
  let asks = 0;
  const frame = frameOf({ requestDraw: () => { asks += 1; } });
  context.STORY_RENDERERS.rock.draw(recorder().ctx, frame);
  net.release();
  await settle();
  assert.equal(asks, 0);
  const { ctx, log } = recorder();
  context.STORY_RENDERERS.rock.draw(ctx, frame);
  assert.ok(!log.fills.has(colors.co2));
  assert.equal(net.calls.length, 1, 'no second request');
});

test('the rock renderer keeps no canvas and no frame, and sends no event', () => {
  assert.doesNotMatch(source, /dispatchEvent|new Event\(|storyPaint|rockState\.last/, 'the stage owns the repaint');
  assert.match(source, /frame\.requestDraw/, 'the renderer uses the hook of the frame');
});

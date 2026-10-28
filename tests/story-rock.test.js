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
const NAMES = ['ROCK_BOTTOM', 'ROCK_DOMAIN', 'ROCK_PLUME_YEAR', 'ROCK_FOLLOW_END', 'ROCK_OUT_END', 'ROCK_RATIO', 'ROCK_SAMPLES', 'ROCK_APPROACH_END', 'ROCK_SCENE',
  'rockClamp', 'rockSmooth', 'rockMix', 'rockShade', 'rockLayout', 'rockCameraSpec', 'rockCamera', 'rockView',
  'rockBands', 'rockBandsAt', 'rockBoundary', 'rockInner', 'rockCap', 'rockGasAlong', 'rockPlume', 'rockWaves', 'rockLabels', 'rockLabelBox', 'rockApart',
  'rockPhase', 'rockApproachStart', 'rockApproachEnd', 'rockApproachAt', 'rockPlatformLines', 'rockFadeAt'];
const helpers = new Function(between(source, '// ---- story rock helpers', '// ---- end story rock helpers') + `\nreturn { ${NAMES.join(', ')} };`)();
const { ROCK_BOTTOM, ROCK_DOMAIN, ROCK_PLUME_YEAR, ROCK_FOLLOW_END, ROCK_OUT_END, ROCK_RATIO, ROCK_SAMPLES, ROCK_APPROACH_END, ROCK_SCENE,
  rockClamp, rockSmooth, rockMix, rockShade, rockLayout, rockCameraSpec, rockCamera, rockView,
  rockBands, rockBandsAt, rockBoundary, rockInner, rockCap, rockGasAlong, rockPlume, rockWaves, rockLabels, rockLabelBox, rockApart,
  rockPhase, rockApproachStart, rockApproachEnd, rockApproachAt, rockPlatformLines, rockFadeAt } = helpers;

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
  assert.match(source, /STORY_RENDERERS\.rock = \{ animated: true, draw: rockDraw, leave: rockLeave, fit: rockFit \};/);
  assert.doesNotMatch(source, /createLinearGradient|createRadialGradient|createConicGradient|shadowBlur|shadowColor|filter\s*=/, 'no gradients and no shadows');
  assert.doesNotMatch(read('StoryChapters.jsx'), /Rock/, 'StoryChapters.jsx stays as it is');
});

// A context that records what the renderer does. It checks every number that goes to the canvas.
const recorder = () => {
  const log = { fills: new Set(), strokes: new Set(), texts: [], calls: 0, bad: [] };
  const target = {
    measureText: text => ({ width: String(text).length * 6 }),
  };
  const numeric = ['moveTo', 'lineTo', 'arc', 'arcTo', 'bezierCurveTo', 'fillRect', 'strokeRect', 'translate', 'scale', 'setLineDash', 'clearRect'];
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

// earth: true runs StoryEarth.jsx first, as the bundle does. Then the chapter has its approach from the side view of descent.
// The land of the map never arrives in these tests, so the map in the inset has no land.
const loadRenderer = (extra = {}, earth = false) => {
  const stage = read('StoryStage.jsx');
  const colors = new Function(`${between(stage, 'const STORY_COLORS', '// A number from lo to hi')}\nreturn STORY_COLORS;`)();
  const context = { STORY_COLORS: colors, STORY_RENDERERS: {}, StoryGeometry: Story, SITE_STORY, console, ...extra };
  if (earth) {
    context.window = {};
    context.Path2D = class {};
    if (!context.fetch) context.fetch = () => new Promise(() => {});
  }
  vm.createContext(context);
  if (earth) vm.runInContext(read('StoryEarth.jsx'), context);
  vm.runInContext(source, context);
  return { context, colors };
};

test('the renderer draws every chapter state without a bad number, at wide, phone and static sizes', () => {
  const { context, colors } = loadRenderer({}, true);
  const renderer = context.STORY_RENDERERS.rock;
  assert.equal(renderer.animated, true);
  assert.equal(typeof renderer.draw, 'function');
  const plumeFrame = frameAt(ROCK_PLUME_YEAR);
  vm.runInContext('rockState.plume = rockPlume(rockSection(), rockGasAlong(rockSection(), __frame, __grid));', Object.assign(context, { __frame: plumeFrame, __grid: run.grid }));
  const allowed = new Set([...Object.values(colors), '#d9cfae', '#a39a8b', '#74695c', '#7d6b5d', '#3d6c7b', '#5d8a98', '#8fb0ff', '#264b58', '#c0b698', '#7fa4b1', '#f1ead6', '#e9eff1']);
  for (const [width, height, reducedMotion] of [[1280, 800, false], [1920, 1080, false], [1024, 768, false], [390, 844, false], [320, 568, false], [1120, 630, true], [358, 201, true]]) {
    for (const local of [0, 0.03, 0.1, 0.2, 0.25, 0.4, 0.5, 0.65, 0.8, 1]) {
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
  renderer.draw(start.ctx, { local: ROCK_APPROACH_END, p: 0.26, width: 1280, height: 800, dpr: 1, time: 0, reducedMotion: false });
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

// ---- the approach: the first frame of the chapter is the last frame of chapter descent

// The side view of descent: the layout that the approach starts from.
const earthApi = new Function(`${between(read('StoryEarth.jsx'), '// ---- story earth helpers', '// ---- end story earth helpers')}\nreturn { storyEarthLayout };`)();
const startOf = (width, height) => rockApproachStart(earthApi.storyEarthLayout(width, height, false));
const endOf = (width, height) => {
  const layout = layoutOf(width, height);
  return rockApproachEnd(layout, rockCameraSpec(layout, anchors));
};

test('local splits into the approach and the rest of the chapter', () => {
  assert.ok(ROCK_APPROACH_END >= 0.2 && ROCK_APPROACH_END <= 0.3, 'the approach takes 20 to 30 percent of local');
  assert.deepEqual(rockPhase(0), { t: 0, after: 0 });
  assert.deepEqual(rockPhase(ROCK_APPROACH_END), { t: 1, after: 0 });
  assert.deepEqual(rockPhase(1), { t: 1, after: 1 });
  near(rockPhase(ROCK_APPROACH_END / 2).t, 0.5, 1e-12, 'half way');
  near(rockPhase((1 + ROCK_APPROACH_END) / 2).after, 0.5, 1e-12, 'half of the rest');
  assert.deepEqual(rockPhase(NaN), { t: 0, after: 0 });
  assert.deepEqual(rockPhase(7), { t: 1, after: 1 });
});

test('the approach starts at the side view of descent and ends at the start of the well descent', () => {
  for (const [width, height] of SIZES) {
    const layout = layoutOf(width, height);
    const from = startOf(width, height);
    const to = endOf(width, height);
    const label = `${width}x${height}`;
    const first = rockApproachAt(from, to, 0, layout);
    const last = rockApproachAt(from, to, 1, layout);
    // The first state: the platform, the waterline and the sea floor of descent, and a window as large as the stage.
    near(first.px, from.ox + ROCK_SCENE.x * from.s, 1e-9, `${label}: the platform x`);
    near(first.yp, from.oy + ROCK_SCENE.base * from.s, 1e-9, `${label}: the platform base`);
    near(first.k, ROCK_SCENE.scale * from.s, 1e-9, `${label}: the platform scale`);
    near(first.yw, from.oy + ROCK_SCENE.water * from.s, 1e-9, `${label}: the waterline`);
    near(first.yf, from.oy + ROCK_SCENE.floor * from.s, 1e-9, `${label}: the sea floor`);
    near(first.yb, from.oy + ROCK_SCENE.back * from.s, 1e-9, `${label}: the back edge of the sea`);
    near(first.leg, ROCK_SCENE.leg, 1e-9, `${label}: the legs`);
    assert.deepEqual(first.iris, { x0: 0, y0: 0, x1: width, y1: height, r: 0 }, `${label}: the window is the stage`);
    assert.equal(first.alpha.sky, 1);
    assert.equal(first.alpha.border, 0, `${label}: no border at the start`);
    assert.equal(first.alpha.frame, 0, `${label}: no axis and no scale tag at the start`);
    assert.equal(first.amp, 1, `${label}: the sea floor is wavy`);
    // The last state: the zoomed cutaway of local 0 in the rest of the chapter.
    const view = rockView(layout, rockCamera(0, rockCameraSpec(layout, anchors)));
    near(last.px, view.x(anchors.wellS), 1e-9, `${label}: the platform stands over the well`);
    near(last.yp, view.y(0), 1e-9, `${label}: the platform stands on the waterline`);
    near(last.yw, view.y(0), 1e-9, `${label}: the waterline`);
    near(last.yf, view.y(anchors.seaFloor), 1e-9, `${label}: the sea floor`);
    near(last.yb, view.y(0, layout.back), 1e-9, `${label}: the back edge of the sea`);
    near(last.k, layout.plat / 64 * view.zoom, 1e-9, `${label}: the platform has its cutaway size`);
    near(last.leg, (view.y(anchors.seaFloor) - view.y(0)) / last.k, 1e-9, `${label}: the legs reach the sea floor`);
    near(last.zoom, view.zoom, 1e-9, `${label}: the zoom`);
    assert.deepEqual(last.iris, { x0: layout.win.x0 - 2, y0: layout.win.y0, x1: layout.win.x1, y1: layout.win.y1, r: 10 }, `${label}: the window of the cutaway`);
    assert.deepEqual([last.alpha.sky, last.alpha.pipe, last.alpha.words, last.alpha.wavesOut, last.alpha.deep], [0, 0, 0, 0, 0], `${label}: the side view is gone`);
    assert.deepEqual([last.alpha.wavesIn, last.alpha.beds, last.alpha.border, last.alpha.frame], [1, 1, 1, 1], `${label}: the cutaway is complete`);
    assert.equal(last.amp, 0, `${label}: the sea floor is flat`);
    assert.ok(to.k < from.k, `${label}: the platform shrinks to its cutaway size`);
    assert.ok(to.yf - to.yw < from.yf - from.yw, `${label}: the water gets thinner`);
  }
});

test('the approach moves in one direction, without a jump, and the window closes in from the caption side', () => {
  for (const [width, height] of SIZES) {
    const layout = layoutOf(width, height);
    const from = startOf(width, height);
    const to = endOf(width, height);
    const label = `${width}x${height}`;
    let last = rockApproachAt(from, to, 0, layout);
    let step = 0;
    const span = Math.hypot(to.px - from.px, to.yf - from.yf) + Math.abs(to.k - from.k) + width / 2;
    for (let i = 1; i <= 200; i++) {
      const now = rockApproachAt(from, to, i / 200, layout);
      const dir = (a, b) => Math.sign(a - b);
      assert.ok(dir(now.yf, last.yf) * dir(to.yf, from.yf) >= 0, `${label}: the sea floor moves one way`);
      assert.ok(dir(now.yp, last.yp) * dir(to.py, from.py) >= 0, `${label}: the platform moves one way`);
      assert.ok(now.k <= last.k + 1e-9 && now.a <= last.a + 1e-9, `${label}: the scene only gets smaller`);
      assert.ok(now.iris.x0 >= last.iris.x0 - 1e-9 && now.iris.y0 >= last.iris.y0 - 1e-9 && now.iris.x1 <= last.iris.x1 + 1e-9 && now.iris.y1 <= last.iris.y1 + 1e-9, `${label}: the window only closes`);
      assert.ok(now.alpha.sky <= last.alpha.sky + 1e-9 && now.alpha.pipe <= last.alpha.pipe + 1e-9 && now.alpha.deep <= last.alpha.deep + 1e-9, `${label}: the side view fades`);
      assert.ok(now.alpha.border >= last.alpha.border - 1e-9 && now.alpha.frame >= last.alpha.frame - 1e-9 && now.alpha.beds >= last.alpha.beds - 1e-9, `${label}: the cutaway comes in`);
      step = Math.max(step, Math.abs(now.yf - last.yf), Math.abs(now.px - last.px), Math.abs(now.k - last.k) * 10);
      last = now;
    }
    assert.ok(step < span * 0.01, `${label}: no jump (${step.toFixed(1)} px in one step of 1/200)`);
    // The caption stands on the sky early. On a wide stage the left edge of the window passes the caption (29.5 percent of the width).
    // On a phone the top edge passes the caption band.
    const early = rockApproachAt(from, to, 0.5, layout);
    if (layout.caption === 'side') assert.ok(early.iris.x0 >= width * 0.295, `${label}: at the middle of the approach the caption stands on the sky (${early.iris.x0})`);
    else assert.ok(early.iris.y0 >= layout.win.y0 * 0.9, `${label}: at the middle of the approach the caption band is clear (${early.iris.y0})`);
    assert.equal(rockApproachAt(from, to, 0.1, layout).alpha.words < 0.5, true, `${label}: the two words of the side view go first`);
  }
  const wide = layoutOf(1280, 800);
  const from = startOf(1280, 800);
  const to = endOf(1280, 800);
  assert.ok(rockApproachAt(from, to, 0.5, wide).iris.x0 > rockApproachAt(from, to, 0.5, wide).iris.y0 * 3, 'the left edge leads on a wide stage');
  assert.deepEqual(rockApproachAt(from, to, NaN, wide), rockApproachAt(from, to, 0, wide));
  assert.deepEqual(rockApproachAt(from, to, 3, wide), rockApproachAt(from, to, 1, wide));
});

test('the line widths of the platform are those of descent at the start and those of the cutaway at the end', () => {
  const k0 = 3.68;
  const first = rockPlatformLines(k0, 0, 1.6);
  near(first.leg, 2.2 / 2.3 * 1.4 * k0, 1e-12, 'the legs of descent');
  assert.deepEqual([first.brace, first.outline, first.derrick, first.crane].map(value => Number((value / k0).toFixed(6))), [1, 1, 1.2, 1.4]);
  const last = rockPlatformLines(2.7625, 1, 1.61);
  assert.deepEqual([last.leg, last.brace, last.outline, last.derrick, last.crane].map(value => Number((value / 1.61).toFixed(6))), [2.1, 0.9, 0.9, 1.1, 1.1]);
  const middle = rockPlatformLines(3, 0.5, 1.5);
  assert.ok(middle.brace < rockPlatformLines(3, 0, 1.5).brace && middle.brace > rockPlatformLines(3, 1, 1.5).brace, 'in between');
  assert.deepEqual(rockPlatformLines(3), rockPlatformLines(3, 1, 1), 'the default is the cutaway');
});

test('the fade of the cutaway: the overburden goes from the top, the sandstone stays, and the first state is the whole cutaway', () => {
  const whole = rockFadeAt(0);
  assert.deepEqual(whole.band, [1, 1, 1, 1, 1, 1, 1]);
  assert.deepEqual([whole.details, whole.labels, whole.frame], [1, 1, 1]);
  const gone = rockFadeAt(1, 1);
  assert.deepEqual(gone.band.filter((_, j) => j !== 5), [0, 0, 0, 0, 0, 0], 'the overburden and the older rock are gone');
  assert.equal(gone.band[5], 1, 'the sandstone stays');
  assert.deepEqual([gone.details, gone.labels, gone.frame], [0, 0, 0]);
  assert.equal(rockFadeAt(1, 0).band[5], 0, 'the alpha of the sandstone is a given value');
  assert.equal(rockFadeAt(1, 0).details, 0);
  for (let i = 0; i <= 100; i++) {
    const fade = rockFadeAt(i / 100);
    for (let j = 1; j < 5; j++) assert.ok(fade.band[j] >= fade.band[j - 1] - 1e-12, `the layer ${j} fades after the layer ${j - 1}`);
    assert.ok(fade.labels <= fade.details + 1e-12, 'the labels go before the details');
    assert.ok([...fade.band, fade.details, fade.labels, fade.frame].every(value => value >= 0 && value <= 1));
    if (i) assert.ok(fade.band[0] <= rockFadeAt((i - 1) / 100).band[0] + 1e-12, 'the alpha only falls');
  }
});

// A context that follows the transform (translate and scale) and writes what is drawn, in the px of the stage.
const tracker = () => {
  const events = [];
  const stack = [];
  let m = { a: 1, d: 1, e: 0, f: 0 };
  const state = { fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, font: '' };
  let path = [];
  const px = (x, y) => [m.a * x + m.e, m.d * y + m.f];
  const target = {
    measureText: text => ({ width: String(text).length * 6 }),
    save: () => { stack.push({ m: { ...m }, state: { ...state } }); },
    restore: () => { const top = stack.pop(); m = top.m; Object.assign(state, top.state); },
    translate: (x, y) => { m = { a: m.a, d: m.d, e: m.e + m.a * x, f: m.f + m.d * y }; },
    scale: (x, y) => { m = { a: m.a * x, d: m.d * y, e: m.e, f: m.f }; },
    beginPath: () => { path = []; },
    moveTo: (x, y) => { path.push(px(x, y)); },
    lineTo: (x, y) => { path.push(px(x, y)); },
    bezierCurveTo: (a, b, c, d, x, y) => { path.push(px(x, y)); },
    arcTo: (a, b, x, y) => { path.push(px(x, y)); },
    fillRect: (x, y, w, h) => { events.push({ op: 'fillRect', style: state.fillStyle, alpha: state.globalAlpha, x: px(x, y)[0], y: px(x, y)[1], w: m.a * w, h: m.d * h }); },
    arc: (x, y, r) => { const [cx, cy] = px(x, y); path.push([cx, cy]); events.push({ op: 'arc', style: state.fillStyle, alpha: state.globalAlpha, x: cx, y: cy, r: r * m.a }); },
    stroke: () => { events.push({ op: 'stroke', style: state.strokeStyle, alpha: state.globalAlpha, width: state.lineWidth * Math.sqrt(Math.abs(m.a * m.d)), points: path.slice() }); },
    fillText: (text, x, y) => { events.push({ op: 'text', text, style: state.fillStyle, alpha: state.globalAlpha, x: px(x, y)[0], y: px(x, y)[1] }); },
  };
  const ctx = new Proxy(target, {
    get: (object, key) => (key in object ? object[key] : () => {}),
    set: (object, key, value) => { state[key] = value; return true; },
  });
  return { ctx, events };
};

const rockFrame = (local, extra = {}) => frameOf({ local, p: 0.26, time: 3000, requestDraw: () => {}, ...extra });
const rectsOf = (events, style) => events.filter(event => event.op === 'fillRect' && event.style === style);

test('boundary descent to rock: the first frame of the cutaway is the last frame of the side view', () => {
  const { context, colors } = loadRenderer({}, true);
  for (const [width, height] of [[1280, 800], [1920, 1080], [1024, 768], [390, 844], [768, 1024]]) {
    const last = tracker();
    context.STORY_RENDERERS.descent.draw(last.ctx, rockFrame(1, { p: 0.26, width, height }));
    const first = tracker();
    context.STORY_RENDERERS.rock.draw(first.ctx, rockFrame(0, { p: 0.26, width, height }));
    const label = `${width}x${height}`;
    const same = (a, b, tolerance, message) => {
      assert.equal(a.length, b.length, `${label}: ${message}: the same number of shapes`);
      a.forEach((item, i) => ['x', 'y', 'w', 'h', 'r'].filter(key => key in item).forEach(key => near(item[key], b[i][key], tolerance, `${label}: ${message} (${key})`)));
    };
    // The sky, the sun, the sea and the platform stand at the same place and have the same size.
    same(rectsOf(last.events, colors.sky), rectsOf(first.events, colors.sky), 1e-6, 'the sky');
    same(last.events.filter(event => event.op === 'arc' && event.style === '#f1ead6'), first.events.filter(event => event.op === 'arc' && event.style === '#f1ead6'), 1e-6, 'the sun');
    // The sea is wider than the stage. Only its edges up and down matter.
    for (const [style, name] of [['#3d6c7b', 'the top of the sea'], ['#264b58', 'the front of the sea']]) {
      const a = rectsOf(last.events, style);
      const b = rectsOf(first.events, style);
      assert.equal(a.length, 1, `${label}: ${name} in descent`);
      assert.equal(b.length, 1, `${label}: ${name} in the approach`);
      near(a[0].y, b[0].y, 1e-6, `${label}: ${name}: the top edge`);
      if (style === '#3d6c7b') near(a[0].h, b[0].h, 1e-6, `${label}: ${name}: the height`);
      assert.ok(b[0].x <= 0 && b[0].x + b[0].w >= width && a[0].x <= 0 && a[0].x + a[0].w >= width, `${label}: ${name} spans the stage`);
    }
    const waterline = events => events.filter(event => event.op === 'stroke' && event.style === '#7fa4b1')[0];
    near(waterline(last.events).points[0][1], waterline(first.events).points[0][1], 1e-6, `${label}: the waterline`);
    near(waterline(last.events).width, waterline(first.events).width, 1e-6, `${label}: the waterline width`);
    // The platform: the deck is the one ink rectangle of 52 platform units. Its place and size say where the platform is.
    const deck = events => events.filter(event => event.op === 'fillRect' && event.style === colors.ink);
    same(deck(last.events), deck(first.events), 1e-6, 'the deck of the platform');
    assert.equal(deck(first.events).length, 1);
    // Every ink line of the platform, the pipe and the well has the same width.
    const widths = events => events.filter(event => event.op === 'stroke' && event.style === colors.ink && event.alpha === 1).map(event => event.width).sort((a, b) => a - b);
    const wa = widths(last.events);
    const wb = widths(first.events);
    assert.equal(wa.length, wb.length, `${label}: the same ink lines`);
    wa.forEach((value, i) => near(value, wb[i], 1e-6, `${label}: ink line ${i}`));
    // The map in the inset is there, at the same place and size.
    const lens = events => events.filter(event => event.op === 'fillRect' && event.style === colors.sea && event.w < 400);
    same(lens(last.events), lens(first.events), 1e-6, 'the map card');
    assert.equal(lens(first.events).length, 1);
    // The labels of the side view are there, with the same words and the same places.
    const words = events => events.filter(event => event.op === 'text' && /pipeline|Injection/.test(event.text));
    assert.deepEqual(words(first.events).map(event => event.text), words(last.events).map(event => event.text), `${label}: the two labels`);
    words(last.events).forEach((event, i) => { near(event.x, words(first.events)[i].x, 1e-6, `${label}: label x`); near(event.y, words(first.events)[i].y, 1e-6, `${label}: label y`); });
    // And nothing of the cutaway is there yet.
    assert.ok(!first.events.some(event => event.op === 'text' && /Vertical scale|Sands and clays/.test(event.text) && event.alpha > 0), `${label}: no label of the cutaway`);
    assert.equal(first.events.filter(event => event.op === 'stroke' && event.alpha > 0 && event.width === 1.4).length, 0, `${label}: no border of the window at the start`);
  }
});

test('the approach joins the well descent without a jump: the platform, the waterline and the sea floor do not move', () => {
  const { context, colors } = loadRenderer({}, true);
  for (const [width, height] of [[1280, 800], [1920, 1080], [390, 844]]) {
    const before = tracker();
    context.STORY_RENDERERS.rock.draw(before.ctx, rockFrame(ROCK_APPROACH_END - 0.0005, { width, height }));
    const after = tracker();
    context.STORY_RENDERERS.rock.draw(after.ctx, rockFrame(ROCK_APPROACH_END, { width, height }));
    const label = `${width}x${height}`;
    const deckOf = events => events.filter(event => event.op === 'fillRect' && event.style === colors.ink)[0];
    for (const key of ['x', 'y', 'w', 'h']) near(deckOf(before.events)[key], deckOf(after.events)[key], 0.6, `${label}: the platform deck (${key})`);
  }
  // The window of the cutaway is the same one: the clip and the border of the first frame after the approach.
  const edge = tracker();
  context.STORY_RENDERERS.rock.draw(edge.ctx, rockFrame(ROCK_APPROACH_END));
  const border = edge.events.filter(event => event.op === 'stroke' && event.width === 1.4);
  assert.equal(border.length, 1, 'one border');
  assert.equal(border[0].alpha, 1);
});

test('at the start of the chapter the grid can take over: rockLeave at 0 is the last frame, and the sandstone stays when the rest fades', () => {
  const { context, colors } = loadRenderer({}, true);
  const rock = context.STORY_RENDERERS.rock;
  assert.equal(typeof rock.leave, 'function');
  assert.equal(typeof rock.fit, 'function');
  const calls = leave => {
    const { ctx, log } = recorder();
    const seen = [];
    const spy = new Proxy(ctx, { get: (object, key) => (typeof object[key] === 'function' ? (...args) => { seen.push([String(key), ...args]); return object[key](...args); } : object[key]), set: (object, key, value) => { seen.push(['set', String(key), value]); object[key] = value; return true; } });
    leave(spy);
    return seen;
  };
  const whole = calls(ctx => rock.draw(ctx, rockFrame(1, { p: 0.44 })));
  const left = calls(ctx => rock.leave(ctx, rockFrame(0, { p: 0.44 }), 0, 1));
  assert.ok(whole.length > 400);
  assert.deepEqual(left, whole, 'leave 0 draws the last frame of the chapter');
  const fading = tracker();
  rock.leave(fading.ctx, rockFrame(0), 0.1, 1);
  const texts = fading.events.filter(event => event.op === 'text');
  assert.ok(texts.length > 3 && texts.every(event => event.alpha < 1), 'the labels fade');
  const gone = tracker();
  rock.leave(gone.ctx, rockFrame(0), 1, 1);
  assert.equal(gone.events.filter(event => event.op === 'text' && event.alpha > 0.01).length, 0, 'no label stays');
  assert.equal(rectsOf(gone.events, colors.ink).length, 0, 'the platform is gone');
  const layout = rock.fit(rockFrame(0));
  assert.equal(layout.width, 1280);
  assert.equal(layout.height, 800);
  assert.equal(layout.caption, 'side');
});

test('StoryRock.jsx draws the approach with flat colour, and keeps no gradient and no shadow', () => {
  assert.doesNotMatch(source, /createLinearGradient|createRadialGradient|createConicGradient|shadowBlur|shadowColor/);
  assert.match(source, /typeof storyEarthLayout !== 'function'/, 'without the side view the chapter starts at its zoomed view');
  assert.match(source, /rockApproachDraw\(ctx, frame, prep, phase\.t\)/);
});

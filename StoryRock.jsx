// StoryRock.jsx — the art of chapter 2, "Into the rock": a cutaway of a depleted gas field.
// The rock comes from StoryGeometry.storySection(). The CO2 plume comes from assets/story-run.json.
// The renderer API is at the top of StoryStage.jsx.
//
// Local 0 to ROCK_APPROACH_END is the approach. Its first frame is the last frame of chapter descent (the side view).
// The camera sinks below the waterline and the window of the cutaway closes in. The platform shrinks to its cutaway size.
// The rest of local is the well descent and the zoom out. The approach reads storyEarthLayout, storyEarthLoad,
// storyEarthDescentCamera and storyEarthDrawLens from StoryEarth.jsx (the bundle has one scope).
// Chapter grid starts from the last frame of this chapter. It calls STORY_RENDERERS.rock.leave and .fit (see StoryBlock.jsx).

// ---- story rock helpers (pure; tests/story-rock.test.js evaluates this block)
const ROCK_SAMPLES = 240;
const ROCK_BOTTOM = 2.65;
const ROCK_DOMAIN = { lx: 20, ly: 12 };
const ROCK_PLUME_YEAR = 10;
const ROCK_FOLLOW_END = 0.5;
const ROCK_OUT_END = 0.8;
const ROCK_NARROW = 640;
const ROCK_RATIO = { min: 4, max: 12 };
const ROCK_SLANT = { x: 0.39, y: 0.225 };
const ROCK_STEP = 0.002;
const ROCK_SKIP_BOTTOM = 120;
// The approach is the first part of local. The first frame of the chapter is the last frame of descent.
// The camera sinks below the waterline and the view closes in on the window of the cutaway.
// The well and the zoom out of the chapter run in the rest of local.
const ROCK_APPROACH_END = 0.25;
// The side view of descent, in its own units (the same numbers as in StoryEarth.jsx).
const ROCK_SCENE = { x: 548, base: 300, scale: 2.3, leg: 42, back: 232, water: 310, floor: 396 };

const rockClamp = (value, lo = 0, hi = 1) => (value > lo ? Math.min(value, hi) : lo);
const rockLerp = (a, b, t) => a + (b - a) * t;
const rockSmooth = t => { const u = rockClamp(t); return u * u * (3 - 2 * u); };

const rockMix = (a, b, t) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const rockShade = (color, t) => rockMix(color, '#000000', t);

// The screen scales of the block. sx is px per km along the front face. vz is px per km of depth.
// ratio = vz / sx is the true vertical exaggeration. The camera zoom changes both scales by the same factor.
// caption: 'side' keeps the left of the stage clear, 'top' keeps the top band clear, 'none' is a static frame.
const rockLayout = (width, height, options = {}) => {
  const narrow = width <= ROCK_NARROW;
  const caption = options.caption || (narrow ? 'top' : 'side');
  const length = options.length || 20.235;
  const chars = options.captionChars || 127;
  const foot = caption === 'none' ? 10 : narrow ? 28 : 22;
  let x0;
  let y0;
  if (narrow) {
    const lines = Math.ceil(chars * 8.6 / Math.max(120, width - 32));
    x0 = 54;
    y0 = caption === 'top' ? Math.min(height * 0.5, 128 + lines * 25.5 + 14) : 8;
  } else {
    x0 = caption === 'side' ? Math.round(width * 0.295 + 66) : 64;
    y0 = caption === 'none' ? 8 : 72;
  }
  const x1 = narrow ? width - 10 : width - 12;
  const y1 = height - foot;
  const s0 = narrow ? 4.4 : 0;
  const s1 = narrow ? Math.min(length, 19.2) : length;
  const back = narrow ? 3 : 4;
  const plat = narrow ? Math.min(44, height * 0.16) : rockClamp(height * 0.085, 46, 84);
  const pad = 4;
  const span = (s1 - s0) + ROCK_SLANT.x * back;
  const oyMin = (caption === 'side' ? ROCK_SKIP_BOTTOM : y0 + 10) + plat;
  const reserve = 6;
  let sx = (x1 - x0 - 2 * pad) / span;
  let vz = Math.max(1, (y1 - reserve - oyMin) / ROCK_BOTTOM);
  const lowest = caption === 'none' ? 3 : ROCK_RATIO.min;
  if (vz / sx < lowest) sx = vz / lowest;
  if (vz / sx > ROCK_RATIO.max) vz = sx * ROCK_RATIO.max;
  const free = Math.max(0, y1 - reserve - oyMin - vz * ROCK_BOTTOM);
  const ox = x0 + pad;
  const oy = oyMin + free / 2;
  const exaggeration = Math.round(vz / sx);
  return {
    narrow, caption, s0, s1, back, plat, pad, sx, vz, ox, oy, width, height,
    win: { x0, y0, x1, y1 },
    qx: sx * ROCK_SLANT.x,
    qy: sx * ROCK_SLANT.y,
    ratio: vz / sx,
    exaggeration,
    scaleLabel: `Vertical scale × ${exaggeration}`,
    font: rockClamp(width * 0.0095 + 1, 11, 14.5),
    axisX: x0 - 12,
    center: { s: (s0 + s1) / 2, d: ROCK_BOTTOM / 2, x: ox + (s1 - s0) / 2 * sx, y: oy + ROCK_BOTTOM / 2 * vz },
  };
};

// Where the camera stands, from local 0 to 1. anchors say where the well and the layers are.
const rockCameraSpec = (layout, anchors) => {
  const { win, narrow } = layout;
  return {
    followEnd: ROCK_FOLLOW_END,
    outEnd: ROCK_OUT_END,
    zoomIn: narrow ? 3 : 2.6,
    wellS: anchors.wellS,
    seaFloor: anchors.seaFloor,
    reservoir: anchors.reservoir,
    anchorIn: { x: win.x0 + (win.x1 - win.x0) * (narrow ? 0.64 : 0.68), y: win.y0 + (win.y1 - win.y0) * (narrow ? 0.42 : 0.46) },
    center: layout.center,
  };
};

// The camera is a world point (s, d) at a screen point (x, y), with a zoom factor.
// 0 to followEnd: the point goes down the well. followEnd to outEnd: the camera zooms out to the fit view. Then it holds.
const rockCamera = (local, spec) => {
  const t = rockClamp(local);
  const follow = rockSmooth(t / spec.followEnd);
  const out = rockSmooth((t - spec.followEnd) / (spec.outEnd - spec.followEnd));
  return {
    zoom: Math.pow(spec.zoomIn, 1 - out),
    s: rockLerp(spec.wellS, spec.center.s, out),
    d: rockLerp(rockLerp(spec.seaFloor, spec.reservoir, follow), spec.center.d, out),
    x: rockLerp(spec.anchorIn.x, spec.center.x, out),
    y: rockLerp(spec.anchorIn.y, spec.center.y, out),
  };
};

// The map from the block to the screen. s is the distance along the section in km, d the depth in km.
// b is the distance behind the front face in km. It only moves points on the sea surface and the right face.
const rockView = (layout, cam) => ({
  zoom: cam.zoom,
  x: (s, b = 0) => cam.x + cam.zoom * (layout.sx * (s - cam.s) + layout.qx * b),
  y: (d, b = 0) => cam.y + cam.zoom * (layout.vz * (d - cam.d) - layout.qy * b),
  s: x => cam.s + (x - cam.x) / (cam.zoom * layout.sx),
});

// The 8 boundaries of the 7 layers at sample k, in km: the sea surface, six horizons and the bottom.
const rockBands = (section, k) => [0, ...section.horizons.slice(0, 6).map(horizon => horizon.depth[k] / 1000), ROCK_BOTTOM];

// The same boundaries at the distance s in km along the section.
const rockBandsAt = (section, s) => {
  const u = rockClamp(s / section.length) * (section.samples - 1);
  const k = Math.min(section.samples - 2, Math.floor(u));
  const t = u - k;
  const a = rockBands(section, k);
  const b = rockBands(section, k + 1);
  return a.map((value, i) => rockLerp(value, b[i], t));
};

// One boundary as a polyline from s0 to s1. A fault gives a vertical step: two points at the same s.
const rockBoundary = (section, index, s0, s1) => {
  const n = section.samples;
  const s = section.s;
  const depth = k => (index === 0 ? 0 : index === 7 ? ROCK_BOTTOM : section.horizons[index - 1].depth[k] / 1000);
  const ss = [];
  const ds = [];
  const push = (a, b) => { ss.push(a); ds.push(b); };
  push(s0, rockBandsAt(section, s0)[index]);
  for (let k = 0; k < n; k++) {
    if (s[k] > s0 && s[k] < s1) push(s[k], depth(k));
    if (k > n - 3) continue;
    for (const fault of section.faults) {
      if (!(fault.s > s[k] && fault.s <= s[k + 1] && fault.s > s0 && fault.s < s1)) continue;
      const left = k > 0 ? depth(k) + (depth(k) - depth(k - 1)) * (fault.s - s[k]) / (s[k] - s[k - 1]) : depth(k);
      const right = depth(k + 1) - (depth(k + 2) - depth(k + 1)) * (s[k + 1] - fault.s) / (s[k + 2] - s[k + 1]);
      if (Math.abs(right - left) > ROCK_STEP) { push(fault.s, left); push(fault.s, right); }
    }
  }
  push(s1, rockBandsAt(section, s1)[index]);
  return { s: ss, d: ds };
};

// A line inside the sandstone at the fraction f of its thickness. Both boundaries must have the same points.
const rockInner = (top, base, f) => ({ s: top.s.slice(), d: top.d.map((value, i) => rockLerp(value, base.d[i], f)) });

// The top edge of the gas cap: the reservoir top between the two ends of the cap. The contact closes it.
const rockCap = section => {
  if (!section.cap) return null;
  const contact = section.contact / 1000;
  const ss = [section.cap.start];
  const ds = [contact];
  for (let k = 0; k < section.samples; k++) {
    if (section.s[k] > section.cap.start && section.s[k] < section.cap.end) { ss.push(section.s[k]); ds.push(section.top[k] / 1000); }
  }
  ss.push(section.cap.end);
  ds.push(contact);
  return { s: ss, d: ds, contact };
};

// The gas of one stored frame along the section line. h is the gas thickness in m, share the methane share.
// The 4 nearest cell centres give a bilinear mean. The share has the gas thickness as weight.
const rockGasAlong = (section, frame, grid, domain = ROCK_DOMAIN) => {
  const nx = grid[0];
  const ny = grid[1];
  const dx = domain.lx / nx;
  const dy = domain.ly / ny;
  const h = new Float64Array(section.samples);
  const share = new Float64Array(section.samples);
  for (let k = 0; k < section.samples; k++) {
    const fx = section.x[k] / dx - 0.5;
    const fy = section.y[k] / dy - 0.5;
    const i0 = Math.floor(fx);
    const j0 = Math.floor(fy);
    const tx = fx - i0;
    const ty = fy - j0;
    let gas = 0;
    let methane = 0;
    for (let c = 0; c < 4; c++) {
      const di = c & 1;
      const dj = c >> 1;
      const weight = (di ? tx : 1 - tx) * (dj ? ty : 1 - ty);
      const cell = Math.min(ny - 1, Math.max(0, j0 + dj)) * nx + Math.min(nx - 1, Math.max(0, i0 + di));
      gas += weight * frame.h[cell];
      methane += weight * frame.h[cell] * frame.ch4[cell];
    }
    h[k] = gas;
    share[k] = gas > 0 ? methane / gas : 0;
  }
  return { h, share };
};

// The CO2 plume under the reservoir top: the thickness in m at each sample, with the methane share.
// Gas that is mostly methane is the gas cap. The cap is drawn from the contact, so the plume skips it.
const rockPlume = (section, gas) => {
  const th = new Float64Array(section.samples);
  for (let k = 0; k < section.samples; k++) {
    const room = section.base[k] - section.top[k];
    th[k] = gas.share[k] < 0.5 && gas.h[k] > 0.3 ? Math.min(gas.h[k], room) : 0;
  }
  return { th, share: gas.share };
};

// Short wave marks on the sea surface. They stay at the same place in the block.
const rockWaves = (layout, count = 26) => {
  let seed = 5;
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const waves = [];
  for (let i = 0; i < count; i++) {
    waves.push({ s: layout.s0 + 0.4 + next() * (layout.s1 - layout.s0 - 1.2), b: 0.3 + next() * (layout.back - 0.6) });
  }
  return waves;
};

// The box of a label at the fit view, with a rough width for the text. It is null for a band label in a thin layer.
const rockLabelBox = (layout, section, label) => {
  const em = layout.font;
  const size = label.text.length * em * 0.52;
  const px = s => layout.ox + (s - layout.s0) * layout.sx;
  const py = d => layout.oy + d * layout.vz;
  if (label.kind === 'band') {
    const bands = rockBandsAt(section, label.s);
    if ((bands[label.layer + 1] - bands[label.layer]) * layout.vz < em * 1.3) return null;
    const x = px(label.s);
    const y = py(rockLerp(bands[label.layer], bands[label.layer + 1], label.f)) + label.px;
    return { x0: x, x1: x + size + (layout.narrow ? 16 : 26) + 3, y0: y - em * 0.6, y1: y + em * 0.6 };
  }
  const x = px(label.at.s);
  const y = py(label.at.d);
  const x0 = label.align === 'middle' ? x - size / 2 : label.align === 'end' ? x - size : x;
  return { x0, x1: x0 + size, y0: y - em * 0.6, y1: y + em * 0.6 };
};
const rockApart = (a, b) => a.x1 + 2 <= b.x0 || b.x1 + 2 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0;

// The labels, with all places in km. A band label sticks to the left of the window and follows its layer.
// A point label has a dot on the target, a leader and a text at its place. px is a shift in screen pixels.
// A label that has no room at the fit view is dropped. The least important label goes first.
const rockLabels = (layout, section) => {
  const { narrow, sx, vz, win } = layout;
  const fault = section.faults.length ? section.faults[0].s : null;
  const crest = section.crest.s;
  const well = section.well.s;
  const depthAt = (s, band, f, px = 0) => {
    const bands = rockBandsAt(section, s);
    return rockLerp(bands[band], bands[band + 1], f) + px / vz;
  };
  const band = (id, text, tone, layer, s, f = 0.5, px = 0) => ({ id, kind: 'band', text, tone, layer, s, f, px });
  const point = (id, text, align, attach, target, at) => ({
    id, kind: 'point', text, tone: 'cream', align, attach,
    target: { s: target.s, d: depthAt(target.s, target.band, target.f) },
    at: { s: at.s, d: depthAt(at.s, at.band, at.f, at.px) },
  });
  const older = (ROCK_BOTTOM - rockBandsAt(section, crest)[6]) * vz;
  const row1 = s => ({ s, band: 6, f: 0, px: rockClamp(older * 0.33, 8, 30) });
  const row2 = s => ({ s, band: 6, f: 1, px: -rockClamp(older * 0.22, 8, 20) });
  const options = {};
  const add = (...items) => items.forEach(item => { (options[item.id] = options[item.id] || []).push(item); });
  if (!narrow) {
    const edge = layout.s0 + 14 / sx;
    add(
      band('sands', 'Sands and clays', 'ink', 1, edge),
      band('mud', 'Mudstone', 'ink', 2, edge),
      band('chalk', 'Chalk', 'ink', 3, edge),
      band('caprock', 'Shale caprock', 'cream', 4, edge),
      band('older', 'Older rock', 'cream', 6, edge, 1, -18),
      point('sandstone', 'Sandstone', 'middle', 'top', { s: 3, band: 5, f: 0.5 }, row1(3)),
      point('brine', 'Brine', 'middle', 'top', { s: 13.3, band: 5, f: 0.55 }, row1(13.3)),
      point('gas', 'Gas cap (methane)', 'middle', 'top', { s: crest, band: 5, f: 0.25 }, row1(crest)),
      point('co2', 'CO₂ from the well', 'middle', 'top', { s: well - 0.3, band: 5, f: 0.2 }, row1(well + 1.35)),
    );
  } else {
    const edge = (fault === null ? layout.s0 : fault) + 24 / sx;
    add(
      band('sands', 'Sands and clays', 'ink', 1, edge),
      band('chalk', 'Chalk', 'ink', 3, edge),
      band('caprock', 'Shale caprock', 'cream', 4, crest + 20 / sx),
      point('sandstone', 'Sandstone', 'start', 'top', { s: layout.s0 + 0.8, band: 5, f: 0.5 }, row2(layout.s0 + 0.2)),
      point('gas', 'Gas cap (methane)', 'middle', 'top', { s: crest, band: 5, f: 0.25 }, row1(crest)),
      point('co2', 'CO₂ from the well', 'middle', 'top', { s: well - 0.3, band: 5, f: 0.2 }, row1(well + 0.4)),
    );
  }
  if (fault !== null) {
    // The text stands west of the fault line. If it has no room there, it stands east.
    const gap = (narrow ? 8 : 22) / sx;
    const target = { s: fault, band: 4, f: 0.5 };
    add(
      point('fault', 'Fault', 'end', 'side', target, { s: fault - gap, band: 4, f: 0.5 }),
      point('fault', 'Fault', 'start', 'side', target, { s: fault + gap, band: 4, f: 0.5 }),
    );
  }
  const chosen = {};
  const boxes = [];
  for (const id of ['gas', 'co2', 'fault', 'sandstone', 'brine', 'caprock', 'chalk', 'sands', 'mud', 'older']) {
    for (const label of options[id] || []) {
      const box = rockLabelBox(layout, section, label);
      if (box === null) { chosen[id] = label; break; }
      const inside = box.x0 >= win.x0 + 4 && box.x1 <= win.x1 - 4 && box.y0 >= win.y0 && box.y1 <= win.y1;
      if (inside && boxes.every(other => rockApart(other, box))) { chosen[id] = label; boxes.push(box); break; }
    }
  }
  return Object.keys(options).filter(id => chosen[id]).map(id => chosen[id]);
};

// The two parts of local. t is the progress of the approach (0 to 1). after is the progress of the rest of the chapter.
const rockPhase = local => ({
  t: rockClamp(local / ROCK_APPROACH_END),
  after: rockClamp((local - ROCK_APPROACH_END) / (1 - ROCK_APPROACH_END)),
});

// The side view at the end of descent, in px. E is the layout of StoryEarth (storyEarthLayout).
// a is the scale of the scene. The platform stands on (px, py) at the scale k. leg is the length of its legs.
// yb, yw and yf are the y of the back edge of the sea, of the waterline and of the sea floor.
const rockApproachStart = E => {
  const { s, ox, oy } = E.scene;
  return {
    s, ox, oy, a: s, k: ROCK_SCENE.scale * s, leg: ROCK_SCENE.leg,
    px: ox + ROCK_SCENE.x * s, py: oy + ROCK_SCENE.base * s,
    yb: oy + ROCK_SCENE.back * s, yw: oy + ROCK_SCENE.water * s, yf: oy + ROCK_SCENE.floor * s,
  };
};

// The same numbers at the start of the well descent. This is the zoomed view of the cutaway at local 0 after the approach.
const rockApproachEnd = (layout, spec) => {
  const view = rockView(layout, rockCamera(0, spec));
  const k = layout.plat / 64 * view.zoom;
  const yw = view.y(0);
  const yf = view.y(spec.seaFloor);
  return {
    zoom: view.zoom, grow: Math.sqrt(view.zoom), a: k / ROCK_SCENE.scale, k, leg: (yf - yw) / k,
    px: view.x(spec.wellS), py: yw, yb: view.y(0, layout.back), yw, yf,
  };
};

// The state of the approach at t (0 to 1). One easing moves the camera. The scene gets smaller and goes up.
// The water gets thinner, because the cutaway shows the sea in its true depth. The window of the cutaway closes
// in from the edges of the stage. The edge next to the captions leads, so the captions stand on the sky early.
// alpha: the parts that go (sky, pipe, words, wavesOut, deep) and the parts that come (wavesIn, beds, border, frame).
// The two words of the side view go first, because the caption of the chapter stands there.
const rockApproachAt = (from, to, t, layout) => {
  const u = rockClamp(t);
  const e = rockSmooth(u);
  const a = from.a * Math.pow(to.a / from.a, e);
  const { win, width, height } = layout;
  const lead = rockSmooth(u / 0.45);
  const late = rockSmooth((u - 0.15) / 0.85);
  const top = layout.caption === 'top';
  const x0 = rockLerp(0, win.x0 - 2, top ? late : lead);
  const y0 = rockLerp(0, win.y0, top ? lead : late);
  return {
    t: u, e, a,
    m: a / from.a,
    k: ROCK_SCENE.scale * a,
    zoom: to.zoom * a / to.a,
    px: rockLerp(from.px, to.px, e),
    yp: rockLerp(from.py, to.py, e),
    yb: rockLerp(from.yb, to.yb, e),
    yw: rockLerp(from.yw, to.yw, e),
    yf: rockLerp(from.yf, to.yf, e),
    leg: rockLerp(from.leg, to.leg, e),
    amp: 1 - e,
    iris: { x0, y0, x1: rockLerp(width, win.x1, late), y1: rockLerp(height, win.y1, late), r: 10 * late },
    alpha: {
      sky: 1 - rockSmooth(u / 0.5),
      pipe: 1 - rockSmooth(u / 0.35),
      words: 1 - rockSmooth(u / 0.15),
      wavesOut: 1 - rockSmooth(u / 0.6),
      wavesIn: rockSmooth((u - 0.3) / 0.7),
      deep: 1 - rockSmooth(u / 0.7),
      beds: rockSmooth((u - 0.4) / 0.6),
      border: rockSmooth((u - 0.1) / 0.6),
      frame: rockSmooth((u - 0.7) / 0.3),
    },
  };
};

// The line widths of the platform in px. At e = 0 they are the widths that descent draws with (platform scale k).
// There the legs are 2.2 / 2.3 * 1.4 wide in the units of the platform. At e = 1 they are the widths of the cutaway
// (grow is the square root of the zoom).
const rockPlatformLines = (k, e = 1, grow = 1) => ({
  leg: rockLerp(3.08 / ROCK_SCENE.scale * k, 2.1 * grow, e),
  brace: rockLerp(k, 0.9 * grow, e),
  outline: rockLerp(k, 0.9 * grow, e),
  derrick: rockLerp(1.2 * k, 1.1 * grow, e),
  crane: rockLerp(1.4 * k, 1.1 * grow, e),
});

// The alpha of each part of the cutaway when the grid takes over (chapter grid calls this).
// leave goes from 0 to 1. The layers of the overburden fade one after the other from the top. The older rock follows.
// The details (the shale lines, the gas cap and the plume) and the labels fade first. The sandstone keeps the alpha sand.
const rockFadeAt = (leave, sand = 1) => {
  const l = rockClamp(leave);
  const gone = j => 1 - rockSmooth((l - 0.07 * j) / 0.4);
  return {
    band: [gone(0), gone(1), gone(2), gone(3), gone(4), sand, gone(3)],
    details: (1 - rockSmooth(l / 0.35)) * sand,
    labels: 1 - rockSmooth(l / 0.25),
    frame: 1 - rockSmooth(l / 0.4),
  };
};
// ---- end story rock helpers

const ROCK_FILLS = [STORY_COLORS.sea, '#d9cfae', '#a39a8b', STORY_COLORS.chalk, '#74695c', STORY_COLORS.sand, '#7d6b5d'];
const ROCK_SIDES = ROCK_FILLS.map(color => rockShade(color, 0.22));
const ROCK_BED = rockShade(ROCK_FILLS[1], 0.12);
const ROCK_SHALE = rockShade(STORY_COLORS.sand, 0.3);
const ROCK_SURFACE = '#3d6c7b';
const ROCK_WAVE = '#5d8a98';
const ROCK_TUBING = '#8fb0ff';
const ROCK_FONT = 'Literata, Georgia, serif';

// waiting holds the frame.requestDraw of each draw that ran before the stored run arrived.
const rockState = { section: null, prep: null, plume: null, load: 'idle', waiting: new Set() };

const rockSection = () => {
  if (!rockState.section) rockState.section = StoryGeometry.storySection(ROCK_SAMPLES);
  return rockState.section;
};

// The stored run is small. It loads once, when the chapter draws for the first time.
// A draw that runs while the run loads keeps its frame.requestDraw. When the run arrives, each one asks for one more draw.
const rockLoad = frame => {
  if (rockState.load === 'idle' && typeof fetch === 'function') {
    rockState.load = 'loading';
    fetch('./assets/story-run.json')
      .then(response => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then(run => {
        const stored = run.frames.find(item => item.year === ROCK_PLUME_YEAR);
        if (!stored) throw new Error('The stored run has no frame for the plume.');
        const section = rockSection();
        rockState.plume = rockPlume(section, rockGasAlong(section, stored, run.grid));
        rockState.load = 'ready';
        const calls = Array.from(rockState.waiting);
        rockState.waiting.clear();
        calls.forEach(call => call());
      })
      .catch(() => { rockState.load = 'failed'; rockState.waiting.clear(); });
  }
  if (rockState.load === 'loading' && typeof frame.requestDraw === 'function') rockState.waiting.add(frame.requestDraw);
};

// Everything that depends on the size of the stage but not on the camera.
const rockPrepare = frame => {
  const key = `${frame.width}x${frame.height}${frame.reducedMotion ? 's' : 'p'}`;
  if (rockState.prep && rockState.prep.key === key) return rockState.prep;
  const section = rockSection();
  const captions = (typeof SITE_STORY === 'object' && SITE_STORY.captions && SITE_STORY.captions.rock) || [];
  const chars = captions.reduce((most, text) => Math.max(most, text.length), 0) || 127;
  const layout = rockLayout(frame.width, frame.height, { caption: frame.reducedMotion ? 'none' : undefined, length: section.length, captionChars: chars });
  const spec = rockCameraSpec(layout, { wellS: section.well.s, seaFloor: section.horizons[0].depth[0] / 1000, reservoir: section.well.topDepth / 1000 });
  const bounds = [0, 1, 2, 3, 4, 5, 6, 7].map(index => rockBoundary(section, index, layout.s0, layout.s1));
  const bandsAtWell = rockBandsAt(section, section.well.s);
  rockState.prep = {
    key, section, layout, spec, bounds,
    sides: rockBandsAt(section, layout.s1),
    cap: rockCap(section),
    shales: [0.38, 0.7].map(f => rockInner(bounds[5], bounds[6], f)),
    beds: [0.16, 0.31, 0.5, 0.66, 0.84].map(f => rockInner(bounds[1], bounds[2], f)),
    labels: rockLabels(layout, section),
    waves: rockWaves(layout),
    wellBottom: bandsAtWell[6] - 0.008,
    faultTip: section.faults.length ? rockBandsAt(section, section.faults[0].s)[3] : null,
    mudTop: Math.min(...bounds[2].d),
    approach: frame.reducedMotion ? null : rockApproachPrepare(frame, layout, spec),
  };
  return rockState.prep;
};

const rockRound = (ctx, x0, y0, x1, y1, r) => {
  ctx.beginPath();
  ctx.moveTo(x0 + r, y0);
  ctx.arcTo(x1, y0, x1, y1, r);
  ctx.arcTo(x1, y1, x0, y1, r);
  ctx.arcTo(x0, y1, x0, y0, r);
  ctx.arcTo(x0, y0, x1, y0, r);
  ctx.closePath();
};

const rockFont = (px, italic = true) => `${italic ? 'italic ' : ''}400 ${px}px ${ROCK_FONT}`;

// A flat shape with a stroke of the same colour. The stroke closes the thin gap between two layers.
const rockPaint = (ctx, color) => {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();
};

// One layer on the front face: its top boundary, and its base boundary backwards.
const rockFrontPath = (ctx, view, top, base) => {
  ctx.beginPath();
  for (let i = 0; i < top.s.length; i++) {
    const x = view.x(top.s[i]);
    const y = view.y(top.d[i]);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  for (let i = base.s.length - 1; i >= 0; i--) ctx.lineTo(view.x(base.s[i]), view.y(base.d[i]));
  ctx.closePath();
};

const rockSidePath = (ctx, view, layout, top, base) => {
  ctx.beginPath();
  ctx.moveTo(view.x(layout.s1, 0), view.y(top, 0));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(top, layout.back));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(base, layout.back));
  ctx.lineTo(view.x(layout.s1, 0), view.y(base, 0));
  ctx.closePath();
};

const rockLine = (ctx, view, line) => {
  for (let i = 0; i < line.s.length; i++) {
    const x = view.x(line.s[i]);
    const y = view.y(line.d[i]);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
};

// opts.fade: the alpha of each part (see rockFadeAt). opts.from: the first layer to draw, with the layers below it.
// A draw from layer 2 skips the sea. opts.outline false skips the ink outline of the block.
const rockBlock = (ctx, prep, view, opts = {}) => {
  const { layout, bounds, sides, cap, shales, beds } = prep;
  const fade = opts.fade || null;
  const from = opts.from || 0;
  // A part with an alpha of nearly 0 is not drawn. This sets the alpha only while a fade runs.
  const alpha = a => { if (fade) ctx.globalAlpha = a; return !fade || a > 0.003; };
  for (let j = from; j < 7; j++) {
    if (!alpha(fade ? fade.band[j] : 1)) continue;
    rockFrontPath(ctx, view, bounds[j], bounds[j + 1]);
    rockPaint(ctx, ROCK_FILLS[j]);
  }
  if (from <= 1 && alpha(fade ? fade.band[1] : 1)) {
    ctx.strokeStyle = ROCK_BED;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const bed of beds) rockLine(ctx, view, bed);
    ctx.stroke();
  }
  for (let j = from; j < 7; j++) {
    if (!alpha(fade ? fade.band[j] : 1)) continue;
    rockSidePath(ctx, view, layout, sides[j], sides[j + 1]);
    rockPaint(ctx, ROCK_SIDES[j]);
  }
  const grow = Math.sqrt(view.zoom);
  if (from === 0 && alpha(fade ? fade.band[0] : 1)) {
    ctx.beginPath();
    ctx.moveTo(view.x(layout.s0, 0), view.y(0, 0));
    ctx.lineTo(view.x(layout.s1, 0), view.y(0, 0));
    ctx.lineTo(view.x(layout.s1, layout.back), view.y(0, layout.back));
    ctx.lineTo(view.x(layout.s0, layout.back), view.y(0, layout.back));
    ctx.closePath();
    rockPaint(ctx, ROCK_SURFACE);

    ctx.strokeStyle = ROCK_WAVE;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const wave of prep.waves) {
      const x = view.x(wave.s, wave.b);
      const y = view.y(0, wave.b);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 11 * grow, y + 1.4 * grow);
    }
    ctx.stroke();
  }

  if (alpha(fade ? fade.details : 1)) {
    ctx.strokeStyle = ROCK_SHALE;
    ctx.lineWidth = Math.min(2.2, 1.2 * grow);
    ctx.setLineDash([22 * grow, 7 * grow]);
    ctx.lineJoin = 'round';
    for (const shale of shales) {
      ctx.beginPath();
      rockLine(ctx, view, shale);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    if (cap) {
      ctx.fillStyle = STORY_COLORS.ch4;
      ctx.beginPath();
      rockLine(ctx, view, cap);
      ctx.closePath();
      ctx.fill();
    }
    const plume = rockState.plume;
    if (plume) {
      const section = prep.section;
      // The colour of each part comes from the methane share: blue for CO2, red for methane.
      if (!plume.colors) plume.colors = Array.from(plume.th, (_, k) => rockMix(STORY_COLORS.co2, STORY_COLORS.ch4, rockClamp((plume.share[k] + plume.share[Math.min(k + 1, plume.share.length - 1)]) / 2)));
      ctx.lineWidth = 0.8;
      for (let k = 0; k < section.samples - 1; k++) {
        if (!(plume.th[k] > 0 || plume.th[k + 1] > 0)) continue;
        const colour = plume.colors[k];
        const xa = view.x(section.s[k]);
        const xb = view.x(section.s[k + 1]);
        ctx.fillStyle = colour;
        ctx.strokeStyle = colour;
        ctx.beginPath();
        ctx.moveTo(xa, view.y(section.top[k] / 1000));
        ctx.lineTo(xb, view.y(section.top[k + 1] / 1000));
        ctx.lineTo(xb, view.y((section.top[k + 1] + plume.th[k + 1]) / 1000));
        ctx.lineTo(xa, view.y((section.top[k] + plume.th[k]) / 1000));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  if (prep.faultTip !== null && alpha(fade ? fade.band[3] : 1)) {
    const x = view.x(prep.section.faults[0].s);
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, view.y(prep.faultTip));
    ctx.lineTo(x, view.y(ROCK_BOTTOM));
    ctx.stroke();
  }

  if (opts.outline !== false && alpha(fade ? fade.frame : 1)) {
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(view.x(layout.s0), view.y(0));
    ctx.lineTo(view.x(layout.s1), view.y(0));
    ctx.lineTo(view.x(layout.s1), view.y(ROCK_BOTTOM));
    ctx.lineTo(view.x(layout.s0), view.y(ROCK_BOTTOM));
    ctx.closePath();
    ctx.moveTo(view.x(layout.s1), view.y(0));
    ctx.lineTo(view.x(layout.s1, layout.back), view.y(0, layout.back));
    ctx.lineTo(view.x(layout.s1, layout.back), view.y(ROCK_BOTTOM, layout.back));
    ctx.lineTo(view.x(layout.s1), view.y(ROCK_BOTTOM));
    ctx.moveTo(view.x(layout.s0), view.y(0));
    ctx.lineTo(view.x(layout.s0, layout.back), view.y(0, layout.back));
    ctx.lineTo(view.x(layout.s1, layout.back), view.y(0, layout.back));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

// The well: a casing from the platform to the reservoir, perforations in the sandstone, and CO2 dashes in the tubing.
// alpha is the alpha of the well and of the platform (1 unless the grid takes over).
const rockWell = (ctx, prep, view, time, alpha = 1) => {
  if (alpha <= 0.003) return;
  const { section, layout } = prep;
  const grow = Math.sqrt(view.zoom);
  const x = view.x(section.well.s);
  const top = view.y(0);
  const bottom = view.y(prep.wellBottom);
  const reservoir = section.well.topDepth / 1000;
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 3.2 * grow;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();
  ctx.lineWidth = 1.5 * grow;
  for (let i = 0; i < 4; i++) {
    const y = view.y(reservoir + 0.018 * (i + 1));
    ctx.beginPath();
    ctx.moveTo(x - 6.5 * grow, y);
    ctx.lineTo(x + 6.5 * grow, y);
    ctx.stroke();
  }
  ctx.strokeStyle = ROCK_TUBING;
  ctx.lineWidth = 1.4 * grow;
  ctx.setLineDash([5 * grow, 7 * grow]);
  ctx.lineDashOffset = -(time / 1000) * 30 * grow;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, view.y(reservoir + 0.009));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  const k = layout.plat / 64 * view.zoom;
  const seaLocal = (view.y(section.horizons[0].depth[0] / 1000) - top) / k;
  rockPlatform(ctx, x, top, k, seaLocal, rockPlatformLines(k, 1, grow));
  ctx.globalAlpha = 1;
};

// An offshore platform that stands on (x, y) at the scale k. leg is the length of the legs under the water.
// lines holds the line widths in px (see rockPlatformLines). The shapes are the ones of storyEarthPlatform.
// split true strokes the parts in the same groups as storyEarthPlatform does. Each bay of the jacket has one stroke.
// The derrick and the crane have one stroke each. The approach needs this, so that its first frame is the last frame of descent.
const rockPlatform = (ctx, x, y, k, leg, lines, split = false) => {
  const ink = STORY_COLORS.ink;
  const cream = STORY_COLORS.cream;
  const unit = px => px / k;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  ctx.lineWidth = unit(lines.leg);
  ctx.beginPath();
  ctx.moveTo(-17, leg); ctx.lineTo(-12, -26);
  ctx.moveTo(17, leg); ctx.lineTo(12, -26);
  ctx.moveTo(-6, leg); ctx.lineTo(-4, -26);
  ctx.moveTo(6, leg); ctx.lineTo(4, -26);
  ctx.stroke();
  ctx.lineWidth = unit(lines.brace);
  const step = (leg + 26) / 3;
  if (!split) ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = -26 + i * step;
    const b = a + step;
    if (split) ctx.beginPath();
    ctx.moveTo(-15, b); ctx.lineTo(14, a);
    ctx.moveTo(15, b); ctx.lineTo(-14, a);
    if (split) ctx.stroke();
  }
  if (!split) ctx.stroke();
  ctx.fillStyle = ink;
  ctx.fillRect(-26, -33, 52, 7);
  ctx.fillStyle = cream;
  ctx.lineWidth = unit(lines.outline);
  ctx.fillRect(-22, -47, 19, 14);
  ctx.strokeRect(-22, -47, 19, 14);
  ctx.fillRect(-1, -42, 15, 9);
  ctx.strokeRect(-1, -42, 15, 9);
  ctx.beginPath();
  ctx.moveTo(26, -36); ctx.lineTo(38, -36); ctx.lineTo(38, -31); ctx.lineTo(26, -31);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = unit(lines.derrick);
  ctx.beginPath();
  ctx.moveTo(15, -33); ctx.lineTo(20, -64); ctx.lineTo(25, -33);
  ctx.moveTo(16.5, -43); ctx.lineTo(23.5, -43);
  ctx.moveTo(18, -53); ctx.lineTo(22, -53);
  if (split) {
    ctx.stroke();
    ctx.lineWidth = unit(lines.crane);
    ctx.beginPath();
  }
  ctx.moveTo(-12, -47); ctx.lineTo(-12, -58); ctx.lineTo(-34, -50);
  ctx.stroke();
  ctx.restore();
};

// A tiny dot with a ring, the end of a leader.
const rockDot = (ctx, x, y) => {
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(x, y, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
};

// alpha is the alpha of all labels (1 unless the grid takes over or the approach is not at its end).
const rockLabels2d = (ctx, prep, view, local, alpha = 1) => {
  if (alpha <= 0.003) return;
  const { layout, section } = prep;
  const win = layout.win;
  const font = layout.font;
  const reveal = rockSmooth((local - 0.45) / 0.2);
  ctx.font = rockFont(font);
  ctx.textBaseline = 'middle';
  ctx.lineCap = 'round';
  for (const label of prep.labels) {
    const colour = label.tone === 'cream' ? STORY_COLORS.cream : STORY_COLORS.ink;
    if (label.kind === 'band') {
      const x = Math.max(view.x(label.s), win.x0 + layout.pad + 14);
      const bands = rockBandsAt(section, view.s(x));
      const thickness = (bands[label.layer + 1] - bands[label.layer]) * layout.vz * view.zoom;
      const y = view.y(rockLerp(bands[label.layer], bands[label.layer + 1], label.f)) + label.px;
      if (thickness < font * 1.3) continue;
      const width = ctx.measureText(label.text).width;
      const lead = layout.narrow ? 16 : 26;
      // The label fades near the scale tag, near the window edges and where the fault line crosses it.
      let fade = Math.min(rockClamp((y - (win.y0 + font + 24)) / 12), rockClamp((win.y1 - 10 - y) / 10));
      if (prep.faultTip !== null && y > view.y(prep.faultTip)) {
        const line = view.x(section.faults[0].s);
        fade = Math.min(fade, rockClamp(Math.max(x - 6 - line, line - (x + width + lead + 4)) / 16));
      }
      if (fade <= 0.02) continue;
      ctx.globalAlpha = fade * alpha;
      ctx.fillStyle = colour;
      ctx.textAlign = 'left';
      ctx.fillText(label.text, x, y);
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + width + 6, y);
      ctx.lineTo(x + width + lead, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + width + lead, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      continue;
    }
    if (reveal <= 0) continue;
    const tx = view.x(label.target.s);
    const ty = view.y(label.target.d);
    const ax = view.x(label.at.s);
    const ay = view.y(label.at.d);
    const inside = (px, py) => px > win.x0 + 6 && px < win.x1 - 6 && py > win.y0 + 6 && py < win.y1 - 4;
    if (!inside(tx, ty) || !inside(ax, ay)) continue;
    const width = ctx.measureText(label.text).width;
    const edge = label.align === 'middle' ? ax - width / 2 : label.align === 'end' ? ax - width : ax;
    if (edge < win.x0 + 4 || edge + width > win.x1 - 4) continue;
    const toX = label.attach === 'top' ? ax : label.align === 'end' ? ax + 5 : ax - 5;
    const toY = label.attach === 'top' ? ay - font * 0.72 : ay;
    ctx.globalAlpha = reveal * alpha;
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    rockDot(ctx, tx, ty);
    ctx.fillStyle = colour;
    ctx.textAlign = label.align === 'middle' ? 'center' : label.align;
    ctx.fillText(label.text, ax, ay);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'left';
};

// The depth axis stays on the left of the window. Its ticks follow the camera.
const rockAxis = (ctx, layout, view, alpha = 1) => {
  if (alpha <= 0.003) return;
  ctx.globalAlpha = alpha;
  const { y0, y1 } = layout.win;
  const x = layout.axisX;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(x, rockClamp(view.y(0), y0, y1));
  ctx.lineTo(x, rockClamp(view.y(ROCK_BOTTOM), y0, y1));
  for (let d = 0; d <= 2.5001; d += 0.5) {
    const y = view.y(d);
    if (y < y0 + 1 || y > y1 - 1) continue;
    ctx.moveTo(x - (d % 1 === 0 ? 7 : 4), y);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.font = `400 ${layout.font}px ${ROCK_FONT}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let d = 0; d <= 2; d++) {
    const y = view.y(d);
    if (y < y0 + 8 || y > y1 - 8) continue;
    ctx.fillText(d ? `${d} km` : '0', x - 11, y);
  }
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
};

// The vertical scale. It stays in the top left corner of the window.
const rockScaleTag = (ctx, layout, alpha = 1) => {
  if (alpha <= 0.003) return;
  ctx.globalAlpha = alpha;
  const font = layout.font;
  ctx.font = rockFont(font);
  const width = ctx.measureText(layout.scaleLabel).width + 18;
  const height = font + 10;
  const x = layout.win.x0 + 10;
  const y = layout.win.y0 + 10;
  rockRound(ctx, x, y, x + width, y + height, height / 2);
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.fill();
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(layout.scaleLabel, x + 9, y + height / 2 + 0.5);
  ctx.globalAlpha = 1;
};

// ---- the approach: the last frame of descent turns into the cutaway
// These colours are the ones that StoryEarth.jsx uses for the side view (STORY_EARTH_COLORS).
const ROCK_SCENE_COLORS = { sun: '#f1ead6', cloud: '#e9eff1', seaTop: '#3d6c7b', water: '#264b58', wave: '#5d8a98', cut: '#7fa4b1', deep: '#c0b698' };

const rockCloudPaths = new Map();
const rockCloud = w => {
  if (!rockCloudPaths.has(w)) rockCloudPaths.set(w, new Path2D(`M0,0 h${w} a9,9 0 0 0 -9,-9 a14,14 0 0 0 -26,-6 a12,12 0 0 0 -20,4 a9,9 0 0 0 -${w - 55},11 z`));
  return rockCloudPaths.get(w);
};

// The approach needs these parts of the side view: the layout of StoryEarth.jsx, the first and the last state,
// the wave marks of the sea and the map in the inset. The wave marks come from the same generator as in descent.
// The function gives null when StoryEarth.jsx is not there.
const rockApproachPrepare = (frame, layout, spec) => {
  if (typeof storyEarthLayout !== 'function') return null;
  const E = storyEarthLayout(frame.width, frame.height, false);
  const from = rockApproachStart(E);
  const to = rockApproachEnd(layout, spec);
  const left = -from.ox / from.s - 4;
  const right = (frame.width - from.ox) / from.s + 4;
  let seed = 9;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const waves = [];
  for (let n = 0, count = Math.round(34 * (right - left) / 800); n < count; n++) {
    const y = 238 + next() * 66;
    const x = left + next() * (right - left);
    waves.push(x, y, 8 + (y - ROCK_SCENE.back) * 0.35);
  }
  const hasInset = typeof storyEarthDescentCamera === 'function' && typeof storyEarthDrawLens === 'function';
  return {
    E, from, to, waves, left,
    lens: hasInset ? storyEarthDescentCamera(1, E).lens : null,
    insetSize: 0.8 * (E.compact ? 1 : Math.min(E.scene.s, 1.7)),
  };
};

// Draws the chapter from local 0 to ROCK_APPROACH_END. At t = 0 it draws what descent draws at local 1.
// The camera sinks below the waterline. The sea gets thinner, the sea floor and the rock come up under it,
// and the window of the cutaway closes in. At t = 1 it draws what the well descent draws at its start.
// The art of the side view has the same shapes as in StoryEarth.jsx. It uses the units of that file.
// Each part of the picture of descent goes through a map. The sky moves with the camera.
// The sea stretches between the back edge, the waterline and the sea floor. The ground below keeps its scale.
const rockApproachDraw = (ctx, frame, prep, t) => {
  const { layout, spec } = prep;
  const ap = prep.approach;
  const { E, from, to } = ap;
  const st = rockApproachAt(from, to, t, layout);
  const al = st.alpha;
  const C = ROCK_SCENE_COLORS;
  const W = frame.width;
  const H = frame.height;
  const view = rockView(layout, { zoom: st.zoom, s: spec.wellS, d: spec.seaFloor, x: st.px, y: st.yf });
  const mapOf = (sy, ty) => ({ tx: st.px - st.m * from.px, ty, sx: st.m, sy });
  const sky = mapOf(st.m, st.yb - st.m * from.yb);
  const top = mapOf((st.yw - st.yb) / (from.yw - from.yb), 0);
  top.ty = st.yb - top.sy * from.yb;
  const front = mapOf((st.yf - st.yw) / (from.yf - from.yw), 0);
  front.ty = st.yw - front.sy * from.yw;
  const ground = mapOf(st.m, st.yf - st.m * from.yf);
  // The picture of descent in its own screen px (units false) or in its own units (units true), seen through a map.
  const enter = (map, units) => {
    ctx.save();
    ctx.translate(map.tx, map.ty);
    ctx.scale(map.sx, map.sy);
    if (units) {
      ctx.translate(from.ox, from.oy);
      ctx.scale(from.s, from.s);
    }
  };
  const FAR = 4000;
  const floor = ROCK_SCENE.floor;
  // The sea floor and the line under it are wavy at the start and flat at the end.
  const flat = y => floor + (y - floor) * st.amp;
  const grow = to.grow;

  ctx.save();
  rockRound(ctx, st.iris.x0, st.iris.y0, st.iris.x1, st.iris.y1, st.iris.r);
  ctx.clip();
  ctx.fillStyle = STORY_COLORS.sky;
  ctx.fillRect(0, 0, W, H);

  // The sun and the low clouds.
  if (al.sky > 0.003) {
    ctx.globalAlpha = al.sky;
    enter(sky, false);
    ctx.fillStyle = C.sun;
    ctx.beginPath();
    ctx.arc(E.sun.x, E.sun.y, E.sun.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    enter(sky, true);
    ctx.fillStyle = C.cloud;
    for (const [x, y, w] of E.clouds) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fill(rockCloud(w));
      ctx.restore();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // The top of the sea with its wave marks.
  enter(top, true);
  ctx.fillStyle = C.seaTop;
  ctx.fillRect(-FAR, ROCK_SCENE.back, 2 * FAR, ROCK_SCENE.water - ROCK_SCENE.back);
  if (al.wavesOut > 0.003) {
    ctx.globalAlpha = al.wavesOut;
    ctx.beginPath();
    for (let i = 0; i < ap.waves.length; i += 3) {
      ctx.moveTo(ap.waves[i], ap.waves[i + 1]);
      ctx.lineTo(ap.waves[i] + ap.waves[i + 2], ap.waves[i + 1]);
    }
    ctx.strokeStyle = C.wave;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (al.wavesIn > 0.003) {
    ctx.globalAlpha = al.wavesIn;
    ctx.strokeStyle = ROCK_WAVE;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const wave of prep.waves) {
      const x = view.x(wave.s, wave.b);
      const y = st.yw - (st.yw - st.yb) * wave.b / layout.back;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 11 * grow, y + 1.4 * grow);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // The front of the sea, from the waterline to the sea floor.
  enter(front, true);
  ctx.fillStyle = rockMix(C.water, ROCK_FILLS[0], st.e);
  ctx.fillRect(-FAR, ROCK_SCENE.water, 2 * FAR, FAR);
  ctx.restore();

  // The ground: the young sands and clays with the sea floor on top. The darker bed fades into the lines of the cutaway.
  enter(ground, true);
  ctx.fillStyle = ROCK_FILLS[1];
  ctx.beginPath();
  ctx.moveTo(-FAR, flat(396));
  ctx.lineTo(0, flat(396));
  ctx.bezierCurveTo(120, flat(390), 240, flat(400), 400, flat(394));
  ctx.bezierCurveTo(560, flat(388), 660, flat(388), 800, flat(396));
  ctx.lineTo(FAR, flat(396));
  ctx.lineTo(FAR, FAR);
  ctx.lineTo(-FAR, FAR);
  ctx.closePath();
  ctx.fill();
  if (st.e > 0.02) {
    // The cutaway closes the thin gap between two layers with a stroke of the colour of the layer.
    ctx.strokeStyle = ROCK_FILLS[1];
    ctx.lineWidth = st.e / st.a;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  if (al.deep > 0.003) {
    ctx.globalAlpha = al.deep;
    ctx.fillStyle = C.deep;
    ctx.beginPath();
    ctx.moveTo(-FAR, flat(424));
    ctx.lineTo(0, flat(424));
    ctx.bezierCurveTo(160, flat(420), 300, flat(428), 460, flat(422));
    ctx.bezierCurveTo(620, flat(416), 700, flat(418), 800, flat(424));
    ctx.lineTo(FAR, flat(424));
    ctx.lineTo(FAR, FAR);
    ctx.lineTo(-FAR, FAR);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (al.beds > 0.003) {
    ctx.globalAlpha = al.beds;
    ctx.strokeStyle = ROCK_BED;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const bed of prep.beds) rockLine(ctx, view, bed);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // The layers below the young sands come into view only on a very tall stage. They are drawn as in the cutaway.
  if (view.y(prep.mudTop) < st.iris.y1) rockBlock(ctx, prep, view, { from: 2, outline: false });

  // The back edge of the sea and the waterline.
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'butt';
  ctx.globalAlpha = st.e;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.beginPath();
  ctx.moveTo(-FAR, st.yb);
  ctx.lineTo(FAR, st.yb);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = rockMix(C.cut, STORY_COLORS.ink, st.e);
  ctx.lineWidth = rockLerp(1.5 * st.a, 1.2, st.e);
  ctx.beginPath();
  ctx.moveTo(-FAR, st.yw);
  ctx.lineTo(FAR, st.yw);
  ctx.stroke();

  // The pipeline from the shore, the riser and the first label. The ink pipe goes first, the CO2 dashes go on top.
  const flow = -(frame.time * 0.028);
  if (al.pipe > 0.003) {
    ctx.globalAlpha = al.pipe;
    const pipe = () => {
      ctx.beginPath();
      ctx.moveTo(ap.left, 399);
      ctx.lineTo(0, 399);
      ctx.bezierCurveTo(150, 393, 300, 402, 470, 396);
      ctx.lineTo(520, 396);
    };
    // The riser goes from the end of the pipe to the foot of the platform leg. It is drawn in px, not in a map.
    const riser = () => {
      ctx.beginPath();
      ctx.moveTo(st.px - (ROCK_SCENE.x - 520) * st.a, st.yf);
      ctx.lineTo(st.px - (ROCK_SCENE.x - 538) * st.a, st.yf);
      ctx.lineTo(st.px - (ROCK_SCENE.x - 538) * st.a, st.yp);
    };
    enter(ground, true);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 5;
    pipe();
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4 * st.a;
    riser();
    ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.strokeStyle = STORY_COLORS.co2;
    enter(ground, true);
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = flow;
    pipe();
    ctx.stroke();
    ctx.restore();
    ctx.lineWidth = 2 * st.a;
    ctx.setLineDash([7 * st.a, 7 * st.a]);
    ctx.lineDashOffset = flow * st.a;
    riser();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.globalAlpha = 1;
  }

  // The well: ink with CO2 dashes. In the cutaway the tubing is a lighter blue.
  const wellTop = st.yp - 10 * st.a * (1 - st.e);
  ctx.lineCap = st.e < 1 ? 'round' : 'butt';
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.lineWidth = rockLerp(4 * st.a, 3.2 * grow, st.e);
  ctx.beginPath();
  ctx.moveTo(st.px, wellTop);
  ctx.lineTo(st.px, H + 8);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = rockMix(STORY_COLORS.co2, ROCK_TUBING, st.e);
  ctx.lineWidth = rockLerp(1.6 * st.a, 1.4 * grow, st.e);
  ctx.setLineDash([rockLerp(6 * st.a, 5 * grow, st.e), rockLerp(6 * st.a, 7 * grow, st.e)]);
  ctx.lineDashOffset = rockLerp(flow * st.a, -(frame.time / 1000) * 30 * grow, st.e);
  ctx.beginPath();
  ctx.moveTo(st.px, wellTop);
  ctx.lineTo(st.px, H + 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  rockPlatform(ctx, st.px, st.yp, st.k, st.leg, rockPlatformLines(st.k, st.e, grow), true);

  // The labels of the side view, and the label of the cutaway that comes in at the end.
  if (al.words > 0.003) {
    ctx.globalAlpha = al.words;
    ctx.font = `italic 400 12.5px ${ROCK_FONT}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    // A text is drawn at the scale of the scene, so it is not stretched. It stands at its place in the map of its band.
    const say = (text, x, y, color) => {
      ctx.save();
      ctx.translate(st.px + (x - ROCK_SCENE.x) * st.a, y);
      ctx.scale(st.a, st.a);
      ctx.fillStyle = color;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };
    const labelY = st.yw + (386 - ROCK_SCENE.water) * (st.yf - st.yw) / (ROCK_SCENE.floor - ROCK_SCENE.water);
    say(E.compact ? 'CO₂ pipeline' : 'CO₂ pipeline from shore', E.compact ? ap.left + 14 : 30, labelY, STORY_COLORS.cream);
    say('Injection well', 560, st.yf + (440 - floor) * st.a, STORY_COLORS.ink);
    ctx.globalAlpha = 1;
  }
  rockLabels2d(ctx, prep, view, 0, al.frame);

  // The map of descent is the last part of the picture. It rides up with the sky and fades.
  if (al.sky > 0.003 && ap.lens) {
    ctx.globalAlpha = al.sky;
    enter(sky, false);
    storyEarthDrawLens(ctx, ap.lens, E, 1, ap.insetSize);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  if (al.border > 0.003) {
    ctx.globalAlpha = al.border;
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.4;
    rockRound(ctx, st.iris.x0, st.iris.y0, st.iris.x1, st.iris.y1, st.iris.r);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  rockAxis(ctx, layout, view, al.frame);
  rockScaleTag(ctx, layout, al.frame);
};

// ---- the cutaway

// The cutaway at the camera of local. fade is null or the alpha of each part (see rockFadeAt).
const rockScene = (ctx, frame, prep, local, fade) => {
  const { layout, spec } = prep;
  const win = layout.win;
  const view = rockView(layout, rockCamera(local, spec));

  ctx.save();
  rockRound(ctx, win.x0 - 2, win.y0, win.x1, win.y1, 10);
  ctx.clip();
  rockBlock(ctx, prep, view, { fade });
  rockWell(ctx, prep, view, frame.time, fade ? fade.frame : 1);
  rockLabels2d(ctx, prep, view, local, fade ? fade.labels : 1);
  ctx.restore();

  if (view.zoom > 1.005) {
    ctx.globalAlpha = rockClamp((view.zoom - 1) / 0.4);
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.4;
    rockRound(ctx, win.x0 - 2, win.y0, win.x1, win.y1, 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  rockAxis(ctx, layout, view, fade ? fade.frame : 1);
  rockScaleTag(ctx, layout, fade ? fade.frame : 1);
};

const rockDraw = (ctx, frame) => {
  rockLoad(frame);
  const prep = rockPrepare(frame);
  const phase = rockPhase(frame.reducedMotion ? 1 : frame.local);
  if (phase.t < 1 && prep.approach) {
    if (typeof storyEarthLoad === 'function') storyEarthLoad(frame);
    rockApproachDraw(ctx, frame, prep, phase.t);
    return;
  }
  rockScene(ctx, frame, prep, phase.after, null);
};

// The whole cutaway, as it stands at local 1, while the grid takes over (chapter grid calls this). leave goes from 0 to 1.
// sand is the alpha of the sandstone. The rest of the cutaway fades as rockFadeAt says. At leave 0 and sand 1 the frame is
// the last frame of the chapter.
const rockLeave = (ctx, frame, leave, sand = 1) => {
  rockLoad(frame);
  const prep = rockPrepare(frame);
  rockScene(ctx, frame, prep, 1, leave > 0 || sand < 1 ? rockFadeAt(leave, sand) : null);
};

// The layout of the cutaway for a stage size: the chapter grid places its block over the sandstone with it.
const rockFit = frame => rockPrepare(frame).layout;

STORY_RENDERERS.rock = { animated: true, draw: rockDraw, leave: rockLeave, fit: rockFit };

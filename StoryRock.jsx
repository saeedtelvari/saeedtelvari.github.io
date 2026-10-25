// StoryRock.jsx — the art of chapter 2, "Into the rock": a cutaway of a depleted gas field.
// The rock comes from StoryGeometry.storySection(). The CO2 plume comes from assets/story-run.json.
// The renderer API is at the top of StoryStage.jsx.

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
    narrow, caption, s0, s1, back, plat, pad, sx, vz, ox, oy,
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
// ---- end story rock helpers

const ROCK_FILLS = [STORY_COLORS.sea, '#d9cfae', '#a39a8b', STORY_COLORS.chalk, '#74695c', STORY_COLORS.sand, '#7d6b5d'];
const ROCK_SIDES = ROCK_FILLS.map(color => rockShade(color, 0.22));
const ROCK_BED = rockShade(ROCK_FILLS[1], 0.12);
const ROCK_SHALE = rockShade(STORY_COLORS.sand, 0.3);
const ROCK_SURFACE = '#3d6c7b';
const ROCK_WAVE = '#5d8a98';
const ROCK_TUBING = '#8fb0ff';
const ROCK_FONT = 'Literata, Georgia, serif';

const rockState = { section: null, prep: null, plume: null, load: 'idle', last: null };

const rockSection = () => {
  if (!rockState.section) rockState.section = StoryGeometry.storySection(ROCK_SAMPLES);
  return rockState.section;
};

// The stored run is small. It loads once, when the chapter draws for the first time.
const rockLoad = () => {
  if (rockState.load !== 'idle' || typeof fetch !== 'function') return;
  rockState.load = 'loading';
  fetch('./assets/story-run.json')
    .then(response => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
    .then(run => {
      const stored = run.frames.find(item => item.year === ROCK_PLUME_YEAR);
      if (!stored) throw new Error('The stored run has no frame for the plume.');
      const section = rockSection();
      rockState.plume = rockPlume(section, rockGasAlong(section, stored, run.grid));
      rockState.load = 'ready';
      const last = rockState.last;
      if (last && last.frame.reducedMotion) storyPaint(last.ctx, 'rock', last.frame);
    })
    .catch(() => { rockState.load = 'failed'; });
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

const rockBlock = (ctx, prep, view) => {
  const { layout, bounds, sides, cap, shales, beds } = prep;
  for (let j = 0; j < 7; j++) {
    rockFrontPath(ctx, view, bounds[j], bounds[j + 1]);
    rockPaint(ctx, ROCK_FILLS[j]);
  }
  ctx.strokeStyle = ROCK_BED;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const bed of beds) rockLine(ctx, view, bed);
  ctx.stroke();
  for (let j = 0; j < 7; j++) {
    rockSidePath(ctx, view, layout, sides[j], sides[j + 1]);
    rockPaint(ctx, ROCK_SIDES[j]);
  }
  ctx.beginPath();
  ctx.moveTo(view.x(layout.s0, 0), view.y(0, 0));
  ctx.lineTo(view.x(layout.s1, 0), view.y(0, 0));
  ctx.lineTo(view.x(layout.s1, layout.back), view.y(0, layout.back));
  ctx.lineTo(view.x(layout.s0, layout.back), view.y(0, layout.back));
  ctx.closePath();
  rockPaint(ctx, ROCK_SURFACE);

  const grow = Math.sqrt(view.zoom);
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

  if (prep.faultTip !== null) {
    const x = view.x(prep.section.faults[0].s);
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, view.y(prep.faultTip));
    ctx.lineTo(x, view.y(ROCK_BOTTOM));
    ctx.stroke();
  }

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
};

// The well: a casing from the platform to the reservoir, perforations in the sandstone, and CO2 dashes in the tubing.
const rockWell = (ctx, prep, view, time) => {
  const { section, layout } = prep;
  const grow = Math.sqrt(view.zoom);
  const x = view.x(section.well.s);
  const top = view.y(0);
  const bottom = view.y(prep.wellBottom);
  const reservoir = section.well.topDepth / 1000;
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
  rockPlatform(ctx, x, top, k, seaLocal, grow);
};

// An offshore platform that stands on (x, y) at the scale k. leg is the length of the legs under the water.
const rockPlatform = (ctx, x, y, k, leg, grow) => {
  const ink = STORY_COLORS.ink;
  const cream = STORY_COLORS.cream;
  const line = grow / k;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.1 * line;
  ctx.beginPath();
  ctx.moveTo(-17, leg); ctx.lineTo(-12, -26);
  ctx.moveTo(17, leg); ctx.lineTo(12, -26);
  ctx.moveTo(-6, leg); ctx.lineTo(-4, -26);
  ctx.moveTo(6, leg); ctx.lineTo(4, -26);
  ctx.stroke();
  ctx.lineWidth = 0.9 * line;
  ctx.beginPath();
  const step = (leg + 26) / 3;
  for (let i = 0; i < 3; i++) {
    const a = -26 + i * step;
    const b = a + step;
    ctx.moveTo(-15, b); ctx.lineTo(14, a);
    ctx.moveTo(15, b); ctx.lineTo(-14, a);
  }
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.fillRect(-26, -33, 52, 7);
  ctx.fillStyle = cream;
  ctx.lineWidth = 0.9 * line;
  ctx.fillRect(-22, -47, 19, 14);
  ctx.strokeRect(-22, -47, 19, 14);
  ctx.fillRect(-1, -42, 15, 9);
  ctx.strokeRect(-1, -42, 15, 9);
  ctx.beginPath();
  ctx.moveTo(26, -36); ctx.lineTo(38, -36); ctx.lineTo(38, -31); ctx.lineTo(26, -31);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 1.1 * line;
  ctx.beginPath();
  ctx.moveTo(15, -33); ctx.lineTo(20, -64); ctx.lineTo(25, -33);
  ctx.moveTo(16.5, -43); ctx.lineTo(23.5, -43);
  ctx.moveTo(18, -53); ctx.lineTo(22, -53);
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

const rockLabels2d = (ctx, prep, view, local) => {
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
      ctx.globalAlpha = fade;
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
    ctx.globalAlpha = reveal;
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
const rockAxis = (ctx, layout, view) => {
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
};

// The vertical scale. It stays in the top left corner of the window.
const rockScaleTag = (ctx, layout) => {
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
};

const rockDraw = (ctx, frame) => {
  rockLoad();
  const prep = rockPrepare(frame);
  const { layout, spec } = prep;
  const win = layout.win;
  const view = rockView(layout, rockCamera(frame.local, spec));
  rockState.last = { ctx, frame };

  ctx.save();
  rockRound(ctx, win.x0 - 2, win.y0, win.x1, win.y1, 10);
  ctx.clip();
  rockBlock(ctx, prep, view);
  rockWell(ctx, prep, view, frame.time);
  rockLabels2d(ctx, prep, view, frame.local);
  ctx.restore();

  if (view.zoom > 1.005) {
    ctx.globalAlpha = rockClamp((view.zoom - 1) / 0.4);
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 1.4;
    rockRound(ctx, win.x0 - 2, win.y0, win.x1, win.y1, 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  rockAxis(ctx, layout, view);
  rockScaleTag(ctx, layout);
};

STORY_RENDERERS.rock = { animated: true, draw: rockDraw };

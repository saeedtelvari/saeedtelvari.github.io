// StoryEarth.jsx — the art of the chapters orbit and descent (art direction C, flat colour).
//
// orbit    The Earth from orbit, with the North Sea near the top of the disc. Over local 0 to 1 the globe turns and
//          grows. A round window opens at the North Sea marker and grows into a map card at the right.
// descent  The map in the card zooms in. Then the card shrinks into the inset at the top right. The side view comes up
//          behind it: sky, sea, platform, pipeline and well. At the end, CO2 moves in the pipeline and down the well.
//
// The land comes from assets/land-110m.json (Natural Earth, TopoJSON). Until the file arrives, the art has no land.
// storyEarthPlatform and storyEarthLayout are global. The chapter rock can use them to start where descent ends.

// ---- story earth helpers (pure; tests/story-earth.test.js evaluates this block)
const STORY_EARTH_RAD = Math.PI / 180;
const STORY_EARTH_TARGET = [2.5, 57.5];            // The North Sea: lon and lat in degrees.
const STORY_EARTH_VIEW0 = [2, 30];                 // The view centre of the globe at local 0 of orbit.
const STORY_EARTH_VIEW1 = [3, 41];                 // The view centre at local 1 of orbit.
const STORY_EARTH_BOX = [[-5, 50.5], [12, 61.5]];  // The area that the inset shows.
const STORY_EARTH_EDGE = 2;                        // The longest edge of a land ring, in degrees.
const STORY_EARTH_OPEN = 0.3;                      // The map window starts to open at this local value of orbit.
const STORY_EARTH_HOLD = 0.7;                      // From this local value of descent the picture stays.
const STORY_EARTH_ZOOM = 0.4;                      // Descent: the map zooms until here. Then the card shrinks.

const storyEarthClamp = (v, lo = 0, hi = 1) => (v > lo ? Math.min(v, hi) : lo);
const storyEarthMix = (a, b, t) => (t >= 1 ? b : t <= 0 ? a : a + (b - a) * t);
const storyEarthGeo = (a, b, t) => (t >= 1 ? b : t <= 0 ? a : a * Math.pow(b / a, t));
const storyEarthSmooth = t => { const x = storyEarthClamp(t); return x * x * (3 - 2 * x); };
const storyEarthInOut = t => { const x = storyEarthClamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const storyEarthWrap = d => d - 360 * Math.round(d / 360);

// A colour mixed toward another colour. Both are '#rrggbb'.
const storyEarthTint = (from, to, t) => {
  if (t <= 0) return from;
  const a = [1, 3, 5].map(i => parseInt(from.slice(i, i + 2), 16));
  const b = [1, 3, 5].map(i => parseInt(to.slice(i, i + 2), 16));
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * Math.min(t, 1))).join(',')})`;
};

// The rings of land from the TopoJSON file, as arrays of [lon, lat]. Rings are closed.
// An arc stores its points as steps. The arc index ~i means the arc i in reverse.
const storyEarthDecode = topology => {
  const { scale, translate } = topology.transform;
  const arcs = topology.arcs.map(arc => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
  });
  const rings = [];
  const addRing = indexes => {
    const ring = [];
    indexes.forEach(index => {
      const points = index < 0 ? arcs[~index].slice().reverse() : arcs[index];
      points.forEach((point, k) => { if (k > 0 || ring.length === 0) ring.push(point); });
    });
    rings.push(ring);
  };
  const visit = geometry => {
    if (geometry.type === 'GeometryCollection') geometry.geometries.forEach(visit);
    else if (geometry.type === 'Polygon') geometry.arcs.forEach(addRing);
    else if (geometry.type === 'MultiPolygon') geometry.arcs.forEach(polygon => polygon.forEach(addRing));
  };
  Object.values(topology.objects).forEach(visit);
  return rings;
};

const storyEarthMercY = lat => Math.log(Math.tan(Math.PI / 4 + storyEarthClamp(lat, -85.05, 85.05) * STORY_EARTH_RAD / 2));

// One ring, ready to draw. No edge is longer than maxEdge degrees.
//   lon, lat  in degrees. lon runs on without a jump at 180 degrees.
//   hole      true for a hole in the land. The points of a hole are in reverse order.
//   xyz       unit vectors, for the globe.
//   x, y      longitude in radians and Mercator y, for the map.
//   bbox      [minLon, minLat, maxLon, maxLat] in degrees.
const storyEarthBuildRing = (ring, maxEdge = STORY_EARTH_EDGE) => {
  const closed = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
  const count = closed ? ring.length - 1 : ring.length;
  const lons = [];
  const lats = [];
  let lon = ring[0][0];
  for (let i = 0; i < count; i++) {
    const next = ring[(i + 1) % count];
    const lat = ring[i][1];
    const dlon = storyEarthWrap(next[0] - ring[i][0]);
    const dlat = next[1] - lat;
    lons.push(lon);
    lats.push(lat);
    const pole = Math.abs(lat) > 89.99 && Math.abs(next[1]) > 89.99;
    const steps = pole ? 1 : Math.max(1, Math.ceil(Math.max(Math.abs(dlon), Math.abs(dlat)) / maxEdge));
    for (let k = 1; k < steps; k++) {
      lons.push(lon + dlon * k / steps);
      lats.push(lat + dlat * k / steps);
    }
    lon += dlon;
  }
  // A hole (a lake in the land) goes counter-clockwise in the file. Its points go in reverse order. Then the clip of
  // the ring gives the water of the hole, and the fill rule takes the water out of the land.
  let area = 0;
  for (let i = 0; i < lons.length; i++) {
    const j = (i + 1) % lons.length;
    area += lons[i] * lats[j] - lons[j] * lats[i];
  }
  const hole = Math.abs(lon - lons[0]) < 1e-6 && area > 0;
  if (hole) { lons.reverse(); lats.reverse(); }
  const n = lons.length;
  const out = { count: n, hole, lon: Float64Array.from(lons), lat: Float64Array.from(lats), xyz: new Float64Array(n * 3), x: new Float64Array(n), y: new Float64Array(n), bbox: [Infinity, Infinity, -Infinity, -Infinity] };
  for (let i = 0; i < n; i++) {
    const l = lons[i] * STORY_EARTH_RAD;
    const p = lats[i] * STORY_EARTH_RAD;
    const c = Math.cos(p);
    out.xyz[3 * i] = c * Math.cos(l);
    out.xyz[3 * i + 1] = c * Math.sin(l);
    out.xyz[3 * i + 2] = Math.sin(p);
    out.x[i] = l;
    out.y[i] = storyEarthMercY(lats[i]);
    out.bbox[0] = Math.min(out.bbox[0], lons[i]);
    out.bbox[1] = Math.min(out.bbox[1], lats[i]);
    out.bbox[2] = Math.max(out.bbox[2], lons[i]);
    out.bbox[3] = Math.max(out.bbox[3], lats[i]);
  }
  return out;
};

// The orthographic view. lon and lat are the point at the centre of the disc.
const storyEarthView = (lon, lat) => {
  const l = lon * STORY_EARTH_RAD;
  const p = lat * STORY_EARTH_RAD;
  return { cl: Math.cos(l), sl: Math.sin(l), cp: Math.cos(p), sp: Math.sin(p) };
};

// A point on a globe of radius R with its centre at (cx, cy) on the screen (y goes down).
// depth is 1 at the centre of the view and 0 on the limb. A point with depth >= 0 is on the near side.
const storyEarthProject = (view, lon, lat, R = 1, cx = 0, cy = 0) => {
  const l = lon * STORY_EARTH_RAD;
  const p = lat * STORY_EARTH_RAD;
  const c = Math.cos(p);
  const X = c * Math.cos(l);
  const Y = c * Math.sin(l);
  const Z = Math.sin(p);
  const x1 = X * view.cl + Y * view.sl;
  const depth = x1 * view.cp + Z * view.sp;
  return { x: cx + R * (Y * view.cl - X * view.sl), y: cy - R * (Z * view.cp - x1 * view.sp), depth, visible: depth >= 0 };
};
const storyEarthVisible = (view, lon, lat) => storyEarthProject(view, lon, lat).visible;

// The limb clip. A ring goes in as unit vectors (xyz). The land is on the right of the ring.
// The function writes the screen points of the visible land to out, as x, y, x, y, ... A NaN pair ends a closed shape.
// A part of the ring on the far side is cut away. Each piece that stays starts where the ring enters the disc
// and ends where it leaves. The shape goes on along the limb circle, clockwise, to the next entry. So the fill is right
// for any ring, also for a ring with land on the far side of the globe.
// The function returns the number of points that it wrote.
let storyEarthD = new Float64Array(0);
let storyEarthRt = new Float64Array(0);
let storyEarthUp = new Float64Array(0);
const storyEarthTau = 2 * Math.PI;

// The point where the edge from a to b crosses the limb: its angle on the limb circle (y up).
const storyEarthCross = (a, b) => {
  const t = storyEarthD[a] / (storyEarthD[a] - storyEarthD[b]);
  return Math.atan2(storyEarthUp[a] + (storyEarthUp[b] - storyEarthUp[a]) * t, storyEarthRt[a] + (storyEarthRt[b] - storyEarthRt[a]) * t);
};

// The points of the limb circle from one angle to another one, clockwise. The two ends are not in the list.
const storyEarthArc = (from, span, R, cx, cy, out) => {
  const parts = Math.ceil(span / Math.sqrt(2 / Math.max(R, 1)));
  for (let j = 1; j < parts; j++) {
    const angle = from - span * j / parts;
    out.push(cx + R * Math.cos(angle), cy - R * Math.sin(angle));
  }
};

const storyEarthClipRing = (xyz, view, R, cx, cy, out) => {
  const n = xyz.length / 3;
  if (storyEarthD.length < n) {
    storyEarthD = new Float64Array(n);
    storyEarthRt = new Float64Array(n);
    storyEarthUp = new Float64Array(n);
  }
  const D = storyEarthD;
  const Rt = storyEarthRt;
  const Up = storyEarthUp;
  const { cl, sl, cp, sp } = view;
  let near = 0;
  for (let i = 0; i < n; i++) {
    const X = xyz[3 * i];
    const Y = xyz[3 * i + 1];
    const Z = xyz[3 * i + 2];
    const x1 = X * cl + Y * sl;
    D[i] = x1 * cp + Z * sp;
    Up[i] = Z * cp - x1 * sp;
    Rt[i] = Y * cl - X * sl;
    if (D[i] >= 0) near++;
  }
  if (near === 0) return 0;
  const start = out.length;
  if (near === n) {
    // A ring that goes counter-clockwise on the screen has its land outside. The disc is a shape too, so the fill is right.
    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = i + 1 < n ? i + 1 : 0;
      area -= Rt[i] * Up[j] - Rt[j] * Up[i];
    }
    if (area < 0) {
      const parts = Math.ceil(storyEarthTau / Math.sqrt(2 / Math.max(R, 1)));
      for (let j = 0; j < parts; j++) out.push(cx + R * Math.cos(storyEarthTau * j / parts), cy + R * Math.sin(storyEarthTau * j / parts));
      out.push(NaN, NaN);
    }
    for (let i = 0; i < n; i++) out.push(cx + R * Rt[i], cy - R * Up[i]);
    out.push(NaN, NaN);
    return (out.length - start) / 2;
  }
  // The pieces of the ring in the disc: first and last near point, and the angle of the entry and of the exit.
  const first = [];
  const last = [];
  const entry = [];
  const leave = [];
  for (let i = 0; i < n; i++) {
    const before = (i + n - 1) % n;
    if (!(D[i] >= 0 && D[before] < 0)) continue;
    let end = i;
    while (D[(end + 1) % n] >= 0) end++;
    first.push(i);
    last.push(end);
    entry.push(storyEarthCross(before, i));
    leave.push(storyEarthCross(end % n, (end + 1) % n));
  }
  const used = first.map(() => false);
  for (let s = 0; s < first.length; s++) {
    let k = s;
    while (k >= 0 && !used[k]) {
      used[k] = true;
      out.push(cx + R * Math.cos(entry[k]), cy - R * Math.sin(entry[k]));
      for (let i = first[k]; i <= last[k]; i++) out.push(cx + R * Rt[i % n], cy - R * Up[i % n]);
      out.push(cx + R * Math.cos(leave[k]), cy - R * Math.sin(leave[k]));
      let next = -1;
      let span = Infinity;
      for (let j = 0; j < first.length; j++) {
        let d = (leave[k] - entry[j]) % storyEarthTau;
        if (d < 0) d += storyEarthTau;
        if (d > storyEarthTau - 1e-9) d = 0;
        if (d < span) { span = d; next = j; }
      }
      storyEarthArc(leave[k], span, R, cx, cy, out);
      k = next;
    }
    if (out.length > start && out[out.length - 1] === out[out.length - 1]) out.push(NaN, NaN);
  }
  return (out.length - start) / 2;
};

// Draws the shapes that storyEarthClipRing wrote to out.
const storyEarthTrace = (ctx, out) => {
  let open = false;
  for (let i = 0; i < out.length; i += 2) {
    if (out[i] !== out[i]) {
      if (open) ctx.closePath();
      open = false;
    } else if (open) {
      ctx.lineTo(out[i], out[i + 1]);
    } else {
      ctx.moveTo(out[i], out[i + 1]);
      open = true;
    }
  }
  if (open) ctx.closePath();
};

// The Mercator map. A map is { S, lon, y, mx, my }: the point (lon in radians, y) is at (mx, my) on the screen,
// and S is the number of pixels for one radian.
const storyEarthMapPoint = (map, lon, lat) => ({
  x: map.mx + map.S * (lon * STORY_EARTH_RAD - map.lon),
  y: map.my - map.S * (storyEarthMercY(lat) - map.y),
});

// The scale at which a box of lon and lat (degrees) fits into a w by h rectangle. The centre of the box is mid-rectangle.
const storyEarthFit = (box, w, h) => {
  const [[lon0, lat0], [lon1, lat1]] = box;
  const y0 = storyEarthMercY(lat0);
  const y1 = storyEarthMercY(lat1);
  return {
    S: Math.min(w / ((lon1 - lon0) * STORY_EARTH_RAD), h / (y1 - y0)),
    lon: (lon0 + lon1) / 2 * STORY_EARTH_RAD,
    y: (y0 + y1) / 2,
  };
};

// The places of all parts of the art on a stage of width by height pixels. still is true in the static frames of the
// reduced-motion layout: there the captions are not on the canvas. compact is true below 641 px of width and on a
// tall screen: there the captions are in a band at the top, and the globe fills the lower half.
//   globe  The globe at local 0 of orbit: centre and radius.
//   keep   The corner of the caption. The globe stays away from it while it grows.
//   card   The map card at the end of orbit.
//   inset  The map at the end of descent.
//   scene  The map from the side view to the screen: x = ox + s * x, y = oy + s * y. The side view has 800 by 450 units.
//   maps   The scale of the map at the start of the zoom (a), at the end of the zoom (b) and in the inset (i).
const storyEarthLayout = (width, height, still = false) => {
  const W = width;
  const H = height;
  const compact = !still && (W <= 640 || W < 0.9 * H);
  const skip = still ? 0 : 128;
  let globe;
  let keep;
  let card;
  let inset;
  let scene;
  let sun;
  let clouds;
  if (compact) {
    const R = 0.78 * W;
    // The bottom of the caption. In the band at the top (below 641 px) it depends on the number of lines.
    const room = W - 32;
    const bottom = W <= 640 ? 128 + 36 + 11 + 25.5 * Math.ceil(1000 / room) + 11 + 21 * Math.ceil(302 / room) : 340;
    globe = { cx: 0.5 * W, cy: Math.max(0.46 * H, 360, bottom + 34 * R / 330 + 14) + R, R };
    keep = { x: 0.5 * W, y: bottom };
    const y = Math.max(0.42 * H, 352);
    card = { x: 16, y, w: W - 32, h: H - 24 - y };
    const s = storyEarthClamp(W / 260, 1.2, 2);
    scene = { s, ox: 0.52 * W - 548 * s, oy: 0.52 * H - 232 * s };
    const iw = storyEarthClamp(0.29 * W, 112, 200);
    // The caption of descent: 25.5 px for each line, below 128 px.
    const below = W <= 640 ? 128 + 25.5 * Math.ceil(640 / room) : 190;
    inset = { x: W - 16 - iw, y: Math.max(216, below + 12), w: iw, h: iw * 0.73 };
    const left = -scene.ox / s;
    sun = { x: 0.27 * W, y: Math.max(0.34 * H, below + 36), r: 20 };
    clouds = [[left + 4, 204, 96], [left + 118, 190, 112]];
  } else {
    // The globe of frame 0. On a screen that is not wide, it gets smaller, so it stays 28 px away from the caption.
    keep = { x: 0.43 * W, y: 0.45 * H };
    const centre = { cx: 0.8 * W, cy: H * 470 / 450 };
    const away = (Math.hypot(centre.cx - keep.x, centre.cy - keep.y) - 28) / 1.103;
    globe = { ...centre, R: Math.min(H * 330 / 450, 0.52 * W, away) };
    const x = 0.46 * W;
    const y = Math.max(skip, 0.16 * H);
    card = { x, y, w: W - Math.max(16, 0.03 * W) - x, h: H - 28 - y };
    const s = Math.min(W / 800, H / 450);
    scene = { s, ox: (W - 800 * s) / 2, oy: 0.516 * H - 232 * s };
    const si = Math.min(s, 1.7);
    inset = { x: W - Math.max(16, 24 * si) - 176 * si, y: Math.max(scene.oy + 62 * s, skip), w: 176 * si, h: 128 * si };
    sun = { x: scene.ox + 410 * s, y: scene.oy + 118 * s, r: 24 * s };
    clouds = [[120, 196, 120], [330, 168, 96], [470, 206, 140]];
  }
  const k = storyEarthClamp(globe.R / 330, 0.9, 1.6);
  card.cx = card.x + card.w / 2;
  card.cy = card.y + card.h / 2;
  card.r = 10 * k;
  inset.r = compact ? 6 : 6 * Math.min(scene.s, 1.7);
  const fit = storyEarthFit(STORY_EARTH_BOX, inset.w, inset.h);
  const Sa = Math.min(card.w / 0.37, card.h / 0.36);
  const target = storyEarthMapPoint({ S: fit.S, lon: fit.lon, y: fit.y, mx: inset.x + inset.w / 2, my: inset.y + inset.h / 2 }, STORY_EARTH_TARGET[0], STORY_EARTH_TARGET[1]);
  return {
    width: W, height: H, compact, still, skip, globe, keep, card, inset, scene, sun, clouds, k,
    maps: { a: Sa, b: Sa * 1.45, i: fit.S },
    insetMarker: target,
    fall: 1.05 * H,
  };
};

// Orbit. At local 0 the globe has the view of the first frame. Then the globe turns and grows. A window opens at the
// North Sea marker. It grows into the card. The globe fades out. At local 1 the card shows the map that descent starts with.
const storyEarthOrbitCamera = (local, layout) => {
  const u = storyEarthClamp(local);
  const turn = storyEarthSmooth(u);
  const { globe, keep, card } = layout;
  const R = globe.R * (1 + 0.12 * turn);
  const dx = globe.cx - keep.x;
  const dy = globe.cy - keep.y;
  const length = Math.hypot(dx, dy) || 1;
  const cx = globe.cx + dx / length * (R - globe.R);
  const cy = globe.cy + dy / length * (R - globe.R);
  const lon = storyEarthMix(STORY_EARTH_VIEW0[0], STORY_EARTH_VIEW1[0], turn);
  const lat = storyEarthMix(STORY_EARTH_VIEW0[1], STORY_EARTH_VIEW1[1], turn);
  const at = storyEarthProject(storyEarthView(lon, lat), STORY_EARTH_TARGET[0], STORY_EARTH_TARGET[1], R, cx, cy);
  const open = storyEarthInOut((u - STORY_EARTH_OPEN) / (1 - STORY_EARTH_OPEN));
  let lens = null;
  if (open > 0) {
    const w = card.w * open;
    const h = card.h * open;
    const mx = storyEarthMix(at.x, card.cx, open);
    const my = storyEarthMix(at.y, card.cy, open);
    const first = globe.R * 1.05 * Math.cos(STORY_EARTH_TARGET[1] * STORY_EARTH_RAD);
    lens = {
      x: open >= 1 ? card.x : mx - w / 2, y: open >= 1 ? card.y : my - h / 2, w, h,
      r: Math.min(card.r, w / 2, h / 2), S: storyEarthGeo(first, layout.maps.a, open), mx, my,
    };
  }
  return { lon, lat, R, cx, cy, marker: { x: at.x, y: at.y }, alpha: 1 - storyEarthSmooth((u - 0.5) / 0.45), lens };
};

// Descent. The map zooms in until local 0.4. Then the card shrinks into the inset, and the side view comes up
// (fall goes from its full value to 0). From local 0.7 nothing moves, except the CO2 in the pipe.
const storyEarthDescentCamera = (local, layout) => {
  const u = storyEarthClamp(local);
  const zoom = storyEarthInOut(u / STORY_EARTH_ZOOM);
  const shrink = storyEarthInOut((u - STORY_EARTH_ZOOM) / (STORY_EARTH_HOLD - STORY_EARTH_ZOOM));
  const { card, inset, maps } = layout;
  const mx = storyEarthMix(card.cx, layout.insetMarker.x, shrink);
  const my = storyEarthMix(card.cy, layout.insetMarker.y, shrink);
  const lens = {
    x: storyEarthMix(card.x, inset.x, shrink), y: storyEarthMix(card.y, inset.y, shrink),
    w: storyEarthMix(card.w, inset.w, shrink), h: storyEarthMix(card.h, inset.h, shrink),
    r: storyEarthMix(card.r, inset.r, shrink),
    S: u < STORY_EARTH_ZOOM ? storyEarthGeo(maps.a, maps.b, zoom) : storyEarthGeo(maps.b, maps.i, shrink),
    mx, my,
  };
  return { lens, shrink, fall: layout.fall * (1 - shrink) };
};
// ---- end story earth helpers

const STORY_EARTH_COLORS = {
  ringFar: '#dbe6ea', ringNear: '#e7eff2', oxygen: '#6e8793', night: '#14303a',
  sun: '#f1ead6', cloud: '#e9eff1', seaTop: '#3d6c7b', water: '#264b58', wave: '#5d8a98', cut: '#7fa4b1',
  young: '#d9cfae', deep: '#c0b698', white: '#ffffff',
};
const STORY_EARTH_FONT = 'Literata, Georgia, serif';

// ---- the land data: one request, one decode, shared by orbit and descent
const storyEarthLand = { state: 'idle', rings: [], version: 0 };
const storyEarthStills = new Map();

// Wakes the pinned stage. A scroll event makes it plan one frame.
const storyEarthWake = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('scroll')); };

// The data arrives. The static frames draw again. The pinned stage draws again, because animated is true for one frame.
const storyEarthRefresh = () => {
  storyEarthStills.forEach((entry, canvas) => {
    if (!canvas.isConnected) storyEarthStills.delete(canvas);
    else storyPaint(entry.ctx, entry.id, entry.frame);
  });
  storyEarthWake();
};

const storyEarthLoad = () => {
  if (storyEarthLand.state !== 'idle') return;
  storyEarthLand.state = 'loading';
  fetch('assets/land-110m.json?v=1')
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then(topology => {
      storyEarthLand.rings = storyEarthDecode(topology).filter(ring => ring.length > 3).map(ring => storyEarthBuildRing(ring));
      storyEarthLand.state = 'ready';
      storyEarthLand.version++;
      storyEarthRefresh();
    })
    .catch(error => {
      storyEarthLand.state = 'failed';
      storyEarthLand.version++;
      console.error('The land data of the story did not load.', error);
    });
};

// A renderer is animated for one frame after the land data changes.
const storyEarthWatch = () => {
  let seen = -1;
  return { stale: () => seen !== storyEarthLand.version, mark: () => { seen = storyEarthLand.version; } };
};

const storyEarthKeepStill = (ctx, id, frame) => {
  if (frame.reducedMotion) storyEarthStills.set(ctx.canvas, { ctx, id, frame });
};

// ---- drawing
const storyEarthRoundRect = (ctx, x, y, w, h, r) => {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const storyEarthCloudPaths = new Map();
const storyEarthCloud = w => {
  if (!storyEarthCloudPaths.has(w)) {
    storyEarthCloudPaths.set(w, new Path2D(`M0,0 h${w} a9,9 0 0 0 -9,-9 a14,14 0 0 0 -26,-6 a12,12 0 0 0 -20,4 a9,9 0 0 0 -${w - 55},11 z`));
  }
  return storyEarthCloudPaths.get(w);
};

// The shapes of the platform, one set for each length of the legs.
const storyEarthPlatformShapes = new Map();
const storyEarthShapes = legDepth => {
  if (!storyEarthPlatformShapes.has(legDepth)) {
    const bay = (legDepth + 26) / 3;
    storyEarthPlatformShapes.set(legDepth, {
      legs: new Path2D(`M-17,${legDepth} L-12,-26 M17,${legDepth} L12,-26 M-6,${legDepth} L-4,-26 M6,${legDepth} L4,-26`),
      braces: [0, 1, 2].map(k => new Path2D(`M-15,${-26 + (k + 1) * bay} L14,${-26 + k * bay} M15,${-26 + (k + 1) * bay} L-14,${-26 + k * bay}`)),
      derrick: new Path2D('M15,-33 L20,-64 L25,-33 M16.5,-43 L23.5,-43 M18,-53 L22,-53'),
      crane: new Path2D('M-12,-47 L-12,-58 L-34,-50'),
      pad: new Path2D('M26,-36 L38,-36 L38,-31 L26,-31 Z'),
    });
  }
  return storyEarthPlatformShapes.get(legDepth);
};

// The offshore platform that stands on (x, y). s is the scale. legDepth is the length of the legs under y.
const storyEarthPlatform = (ctx, x, y, s = 1, legDepth = 0) => {
  const shapes = storyEarthShapes(legDepth);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.fillStyle = STORY_COLORS.ink;
  ctx.lineWidth = 2.2 / Math.max(s, 1) * 1.4;
  ctx.stroke(shapes.legs);
  ctx.lineWidth = 1;
  shapes.braces.forEach(brace => ctx.stroke(brace));
  ctx.fillRect(-26, -33, 52, 7);
  ctx.fillStyle = STORY_COLORS.cream;
  ctx.fillRect(-22, -47, 19, 14);
  ctx.strokeRect(-22, -47, 19, 14);
  ctx.fillRect(-1, -42, 15, 9);
  ctx.strokeRect(-1, -42, 15, 9);
  ctx.lineWidth = 1.2;
  ctx.stroke(shapes.derrick);
  ctx.lineWidth = 1.4;
  ctx.stroke(shapes.crane);
  ctx.lineWidth = 1;
  ctx.fill(shapes.pad);
  ctx.stroke(shapes.pad);
  ctx.restore();
};

const storyEarthMarker = (ctx, x, y, size, label) => {
  ctx.beginPath();
  ctx.arc(x, y, 7 * size, 0, 2 * Math.PI);
  ctx.fillStyle = STORY_COLORS.co2;
  ctx.fill();
  ctx.lineWidth = 2 * size;
  ctx.strokeStyle = STORY_EARTH_COLORS.white;
  ctx.stroke();
  // At the globe the label is right and above the marker. In the inset it is below the marker, in the middle.
  ctx.font = `italic 400 ${14 * size}px ${STORY_EARTH_FONT}`;
  ctx.fillStyle = STORY_EARTH_COLORS.white;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const width = ctx.measureText('North Sea').width;
  // The label goes down first and then to the middle, so it does not cross the marker.
  ctx.fillText('North Sea', x + storyEarthMix(14 * size, -width / 2, storyEarthSmooth(label * 2 - 1)) + 8 * size * label, y + storyEarthMix(-10 * size, 23 * size, storyEarthSmooth(label * 2)));
};

// The land on the Mercator map, inside the current clip.
const storyEarthMapLand = (ctx, lens) => {
  const rings = storyEarthLand.rings;
  if (!rings.length) return;
  const map = { S: lens.S, lon: STORY_EARTH_TARGET[0] * STORY_EARTH_RAD, y: storyEarthMercY(STORY_EARTH_TARGET[1]), mx: lens.mx, my: lens.my };
  const lonOf = px => (map.lon + (px - map.mx) / map.S) / STORY_EARTH_RAD;
  const latOf = py => Math.atan(Math.sinh(map.y + (map.my - py) / map.S)) / STORY_EARTH_RAD;
  const west = lonOf(lens.x);
  const east = lonOf(lens.x + lens.w);
  const north = latOf(lens.y);
  const south = latOf(lens.y + lens.h);
  ctx.beginPath();
  for (const ring of rings) {
    const [minLon, minLat, maxLon, maxLat] = ring.bbox;
    if (maxLat < south || minLat > north) continue;
    for (let turn = -1; turn <= 1; turn++) {
      const shift = turn * 360;
      if (maxLon + shift < west || minLon + shift > east) continue;
      const offset = turn * 2 * Math.PI - map.lon;
      // The curve goes through the middle of each edge. The corners of the 110 m data become round.
      const n = ring.count;
      let px = map.mx + map.S * (ring.x[n - 1] + offset);
      let py = map.my - map.S * (ring.y[n - 1] - map.y);
      let qx = map.mx + map.S * (ring.x[0] + offset);
      let qy = map.my - map.S * (ring.y[0] - map.y);
      ctx.moveTo((px + qx) / 2, (py + qy) / 2);
      for (let i = 0; i < n; i++) {
        px = qx;
        py = qy;
        const next = (i + 1) % n;
        qx = map.mx + map.S * (ring.x[next] + offset);
        qy = map.my - map.S * (ring.y[next] - map.y);
        ctx.quadraticCurveTo(px, py, (px + qx) / 2, (py + qy) / 2);
      }
      ctx.closePath();
    }
  }
  ctx.fillStyle = STORY_COLORS.land;
  ctx.fill('evenodd');
};

// The map card: sea, land, outline and the North Sea marker.
const storyEarthDrawLens = (ctx, lens, layout, label, size) => {
  if (lens.w < 1 || lens.h < 1) return;
  ctx.save();
  ctx.beginPath();
  storyEarthRoundRect(ctx, lens.x, lens.y, lens.w, lens.h, lens.r);
  ctx.clip();
  ctx.fillStyle = STORY_COLORS.sea;
  ctx.fillRect(lens.x, lens.y, lens.w, lens.h);
  storyEarthMapLand(ctx, lens);
  ctx.restore();
  ctx.beginPath();
  storyEarthRoundRect(ctx, lens.x, lens.y, lens.w, lens.h, lens.r);
  ctx.lineWidth = 1.2 * layout.k;
  ctx.strokeStyle = STORY_COLORS.ink;
  ctx.stroke();
  storyEarthMarker(ctx, lens.mx, lens.my, size, label);
};

// The molecules of CO2 in the air. The numbers come from a fixed generator, so the picture is the same each time.
const storyEarthMolecules = (() => {
  let seed = 3;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 26 }, () => ({ angle: Math.PI * (1.06 + next() * 0.88), lift: 6 + next() * 24, turn: next() * Math.PI }));
})();

const storyEarthDrawGlobe = (ctx, layout, camera) => {
  const { cx, cy, R, alpha } = camera;
  const fade = 1 - alpha;
  const sky = STORY_COLORS.sky;
  const tint = color => storyEarthTint(color, sky, fade);
  const k = R / 330;
  ctx.fillStyle = tint(STORY_EARTH_COLORS.ringFar);
  ctx.beginPath();
  ctx.arc(cx, cy, R + 34 * k, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = tint(STORY_EARTH_COLORS.ringNear);
  ctx.beginPath();
  ctx.arc(cx, cy, R + 16 * k, 0, 2 * Math.PI);
  ctx.fill();
  const size = Math.min(k, 2);
  for (const molecule of storyEarthMolecules) {
    const x = cx + Math.cos(molecule.angle) * (R + molecule.lift * k);
    const y = cy + Math.sin(molecule.angle) * (R + molecule.lift * k);
    if (x < -20 || x > layout.width + 20 || y < -20 || y > layout.height + 20) continue;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(molecule.turn);
    ctx.fillStyle = tint(STORY_EARTH_COLORS.oxygen);
    ctx.beginPath();
    ctx.arc(-4.6 * size, 0, 2.6 * size, 0, 2 * Math.PI);
    ctx.moveTo(7.2 * size, 0);
    ctx.arc(4.6 * size, 0, 2.6 * size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = tint(STORY_COLORS.ink);
    ctx.beginPath();
    ctx.arc(0, 0, 2.9 * size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = tint(STORY_COLORS.sea);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.clip();
  const view = storyEarthView(camera.lon, camera.lat);
  const out = [];
  ctx.beginPath();
  for (const ring of storyEarthLand.rings) {
    out.length = 0;
    if (!storyEarthClipRing(ring.xyz, view, R, cx, cy, out)) continue;
    storyEarthTrace(ctx, out);
  }
  ctx.fillStyle = tint(STORY_COLORS.land);
  ctx.fill('evenodd');
  // The night side: a flat, translucent shape. It is the disc without a circle that is a little to the left.
  ctx.beginPath();
  ctx.rect(cx - R, cy - R, 2 * R, 2 * R);
  ctx.moveTo(cx - 0.35 * R + R, cy);
  ctx.arc(cx - 0.35 * R, cy, R, 0, 2 * Math.PI);
  ctx.fillStyle = `rgba(20, 48, 58, ${0.45 * alpha})`;
  ctx.fill('evenodd');
  ctx.restore();
};

const storyEarthFill = (ctx, layout) => {
  ctx.fillStyle = STORY_COLORS.sky;
  ctx.fillRect(0, 0, layout.width, layout.height);
};

STORY_RENDERERS.orbit = (() => {
  const watch = storyEarthWatch();
  return {
    get animated() { return watch.stale(); },
    draw(ctx, frame) {
      storyEarthLoad();
      watch.mark();
      storyEarthKeepStill(ctx, 'orbit', frame);
      const layout = storyEarthLayout(frame.width, frame.height, frame.reducedMotion);
      const camera = storyEarthOrbitCamera(frame.reducedMotion ? 0 : frame.local, layout);
      storyEarthFill(ctx, layout);
      if (camera.alpha > 0) storyEarthDrawGlobe(ctx, layout, camera);
      if (camera.lens) storyEarthDrawLens(ctx, camera.lens, layout, 0, layout.k);
      else storyEarthMarker(ctx, camera.marker.x, camera.marker.y, layout.k, 0);
    },
  };
})();

// The side view. Units are the 800 by 450 units of the storyboard. The sea is at y = 232 to 310, the sea floor at 396.
const storyEarthDrawScene = (ctx, layout, state, time) => {
  const { s, ox, oy } = layout.scene;
  const W = layout.width;
  const H = layout.height;
  const fall = state.fall;
  const x0 = -ox / s - 4;
  const x1 = (W - ox) / s + 4;
  const bottom = (H - oy - fall) / s + 4;
  const C = STORY_EARTH_COLORS;
  // The sun is far away, so it moves only a little. The high clouds move faster than the scene.
  ctx.fillStyle = C.sun;
  ctx.beginPath();
  ctx.arc(layout.sun.x, layout.sun.y + fall * 0.12, layout.sun.r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = C.cloud;
  [[0.12, -0.1, 120], [0.4, -0.32, 96], [0.18, -0.55, 140], [0.55, -0.74, 110], [0.08, -0.95, 100], [0.7, -0.4, 120]].forEach(([fx, fy, w]) => {
    ctx.save();
    ctx.translate(fx * W, fy * H + fall * 1.2);
    ctx.scale(s, s);
    ctx.fill(storyEarthCloud(w));
    ctx.restore();
  });
  ctx.save();
  ctx.translate(ox, oy + fall);
  ctx.scale(s, s);
  ctx.fillStyle = C.cloud;
  layout.clouds.forEach(([x, y, w]) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fill(storyEarthCloud(w));
    ctx.restore();
  });
  if (oy + fall + 232 * s < H) {
    ctx.fillStyle = C.seaTop;
    ctx.fillRect(x0, 232, x1 - x0, 78);
    let seed = 9;
    const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.beginPath();
    for (let n = 0, count = Math.round(34 * (x1 - x0) / 800); n < count; n++) {
      const y = 238 + next() * 66;
      const x = x0 + next() * (x1 - x0);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8 + (y - 232) * 0.35, y);
    }
    ctx.strokeStyle = C.wave;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.fillStyle = C.water;
    ctx.fillRect(x0, 310, x1 - x0, bottom - 310);
    ctx.fillStyle = C.young;
    ctx.beginPath();
    ctx.moveTo(x0, 396);
    ctx.lineTo(0, 396);
    ctx.bezierCurveTo(120, 390, 240, 400, 400, 394);
    ctx.bezierCurveTo(560, 388, 660, 388, 800, 396);
    ctx.lineTo(x1, 396);
    ctx.lineTo(x1, bottom);
    ctx.lineTo(x0, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.deep;
    ctx.beginPath();
    ctx.moveTo(x0, 424);
    ctx.lineTo(0, 424);
    ctx.bezierCurveTo(160, 420, 300, 428, 460, 422);
    ctx.bezierCurveTo(620, 416, 700, 418, 800, 424);
    ctx.lineTo(x1, 424);
    ctx.lineTo(x1, bottom);
    ctx.lineTo(x0, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x0, 310);
    ctx.lineTo(x1, 310);
    ctx.strokeStyle = C.cut;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Pipeline from shore, riser up the jacket, well that goes on down. The ink pipe goes first; the CO2 dashes go on top.
    const pipe = () => {
      ctx.beginPath();
      ctx.moveTo(x0, 399);
      ctx.lineTo(0, 399);
      ctx.bezierCurveTo(150, 393, 300, 402, 470, 396);
      ctx.lineTo(520, 396);
    };
    const riser = () => { ctx.beginPath(); ctx.moveTo(520, 396); ctx.lineTo(538, 396); ctx.lineTo(538, 300); };
    const well = () => { ctx.beginPath(); ctx.moveTo(548, 290); ctx.lineTo(548, bottom); };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = STORY_COLORS.ink;
    ctx.lineWidth = 5;
    pipe();
    ctx.stroke();
    ctx.lineWidth = 4;
    riser();
    ctx.stroke();
    well();
    ctx.stroke();
    // The dashes move with the time: 28 units in one second.
    const flow = -(time * 0.028);
    ctx.lineCap = 'butt';
    ctx.strokeStyle = STORY_COLORS.co2;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = flow;
    pipe();
    ctx.stroke();
    riser();
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = flow;
    well();
    ctx.stroke();
    ctx.setLineDash([]);
    storyEarthPlatform(ctx, 548, 300, 2.3, 42);
    ctx.font = `italic 400 12.5px ${STORY_EARTH_FONT}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = STORY_COLORS.cream;
    ctx.fillText(layout.compact ? 'CO₂ pipeline' : 'CO₂ pipeline from shore', layout.compact ? x0 + 14 : 30, 386);
    ctx.fillStyle = STORY_COLORS.ink;
    ctx.fillText('Injection well', 560, 440);
  }
  ctx.restore();
};

STORY_RENDERERS.descent = (() => {
  const watch = storyEarthWatch();
  let running = false;
  return {
    get animated() { return running || watch.stale(); },
    draw(ctx, frame) {
      storyEarthLoad();
      watch.mark();
      storyEarthKeepStill(ctx, 'descent', frame);
      const hold = !frame.reducedMotion && frame.local >= STORY_EARTH_HOLD;
      if (hold && !running) { running = true; storyEarthWake(); } else if (!hold) running = false;
      const layout = storyEarthLayout(frame.width, frame.height, frame.reducedMotion);
      const state = storyEarthDescentCamera(frame.local, layout);
      storyEarthFill(ctx, layout);
      if (state.shrink > 0) storyEarthDrawScene(ctx, layout, state, frame.time);
      const size = storyEarthMix(layout.k, 0.8 * (layout.compact ? 1 : Math.min(layout.scene.s, 1.7)), state.shrink);
      storyEarthDrawLens(ctx, state.lens, layout, state.shrink, size);
    },
  };
})();

Object.assign(window, { storyEarthPlatform, storyEarthLayout });

/* =====================================================
   HeroSurvey - the 4D seismic survey of the hero.
   At a survey year a ship crosses the hero, shoots, and a difference image of the CO2 appears behind it.
   The image is a convolutional model of the "real" CO2. The real CO2 is the model plume with small seeded changes.
   The canvas exists only while a pass runs. SubsurfaceHero mounts it at the start and removes it after the fade.
   ===================================================== */

// ---- hero survey helpers
const HERO_SURVEY_YEARS = [10, 25, 1000]; // two surveys during injection (years 0 to 30), one long after
const HERO_SURVEY_CROSS = 4.5;   // pass seconds: the ship crosses the hero and the image appears behind it
const HERO_SURVEY_HOLD = 1.4;    // pass seconds: the image stays
const HERO_SURVEY_FADE = 0.8;    // pass seconds: the image fades
const HERO_SURVEY_TOTAL = HERO_SURVEY_CROSS + HERO_SURVEY_HOLD + HERO_SURVEY_FADE;
const HERO_SURVEY_SHOT = 0.45;   // seconds between two shots
const HERO_SURVEY_SLOW = 0.03;   // the model clock factor during the cross, the hold and most of the fade
const HERO_SURVEY_EASE = 0.2;    // pass seconds to ease the clock factor down
const HERO_SURVEY_RISE = 0.3;    // pass seconds at the end of the fade to ease the clock factor back up
const HERO_SURVEY_JUMP = 30;     // a step of more than this many years is a jump (the same value as HERO_LEAK_JUMP)
const HERO_SURVEY_UNIT = 15;     // section units per solver unit of height (the same value as HERO_UNIT)
const HERO_SURVEY_FRAME_MS = 30; // the loop skips a frame that comes sooner than this (about 30 fps)
const HERO_SURVEY_MAX_WIDTH = 1600;
const HERO_SURVEY_RING = 430;    // px per second
const HERO_SURVEY_RING_MAX = 560; // px, where a shot has faded out

// Physics of the image. All lengths are in metres unless the name says px.
const HERO_SURVEY_SECTION_M = 10000; // the width of the section
const HERO_SURVEY_METRES_UNIT = 3;   // metres per section unit below the 800 m break (the storage zone)
const HERO_SURVEY_FREQ = 30;         // Hz, the peak frequency of the Ricker wavelet
const HERO_SURVEY_VEL = 2500;        // m/s, the velocity that sets the wavelet length in depth
const HERO_SURVEY_DI_MOBILE = -0.12;   // the fractional impedance change of mobile CO2
const HERO_SURVEY_DI_RESIDUAL = -0.07; // the same for residual CO2
const HERO_SURVEY_DI_BAR = -0.004;     // the same for each bar of overpressure in the storage aquifer
const HERO_SURVEY_BAR_MIN = 0.3;       // bar, the pressure signal below this value does not show
const HERO_SURVEY_R_FLOOR = 0.05;      // the reflection coefficient of the base of an aquifer
const HERO_SURVEY_PUSH = 0.176;        // push-down in metres for each metre of CO2 (CO2 sand is 15 % slower)
const HERO_SURVEY_RESIDUAL_T = 0.6;    // the residual zone counts as 0.6 of mobile CO2 for the push-down
const HERO_SURVEY_FRESNEL = 25;        // m, the sigma of the lateral blur (Fresnel zone after migration)
const HERO_SURVEY_NORM = 0.9 / 0.06;   // the top of a thick mobile column shows 0.9: a step of 0.12 gives a reflectivity of 0.06
const HERO_SURVEY_NOISE_RMS = 0.07;    // the RMS of the band-limited noise
const HERO_SURVEY_BOUNDARY_RMS = 0.05; // the RMS of the residuals at the aquifer boundaries
const HERO_SURVEY_TILE = 256;          // the side of the periodic noise tile
// The real plume differs from the model plume in a few small ways.
const HERO_SURVEY_THICK_VARY = 0.12;   // the relative change of the mobile column (times a smooth noise from -1 to 1)
const HERO_SURVEY_THICK_CORR = 600;    // m, the correlation length of that noise
const HERO_SURVEY_STRETCH = [0.02, 0.05]; // the stretch of the updip side of the plume
// Thin shale baffles: the place in the aquifer (0 is the roof, 1 is the floor), the reach (of the plume half-extent), the peak thickness (m).
const HERO_SURVEY_BAFFLES = [{ at: 0.30, reach: 0.60, thick: 8 }, { at: 0.55, reach: 0.45, thick: 6 }, { at: 0.78, reach: 0.30, thick: 5 }];

const heroSurveySmooth = t => { const v = Math.max(0, Math.min(1, t)); return v * v * (3 - 2 * v); };

// The factor for the model clock at the pass time u (in pass seconds). It is 1 when idle.
// The clock stays slow until the image has almost gone. Thus a pass moves the year by only about 3.5 years during
// injection, and the pass at year 25 ends before the shut-in at year 30.
const heroSurveyClock = u => {
  if (!(u > 0) || u >= HERO_SURVEY_TOTAL) return 1;
  if (u < HERO_SURVEY_EASE) return 1 - (1 - HERO_SURVEY_SLOW) * heroSurveySmooth(u / HERO_SURVEY_EASE);
  const rise = HERO_SURVEY_TOTAL - HERO_SURVEY_RISE;
  if (u <= rise) return HERO_SURVEY_SLOW;
  return HERO_SURVEY_SLOW + (1 - HERO_SURVEY_SLOW) * heroSurveySmooth((u - rise) / HERO_SURVEY_RISE);
};

// The survey year that playback crosses in one step, or null. A jump (a scrub or a restart) never starts a pass.
// A step that ends at the survey year counts, so each year starts once for each pass of the clock through it.
const heroSurveyCrossing = (prev, next, years = HERO_SURVEY_YEARS) => {
  const step = next - prev;
  if (!(step > 0) || step > HERO_SURVEY_JUMP) return null;
  for (const y of years) if (prev < y && y <= next) return y;
  return null;
};

// The next survey year after this year, or null.
const heroSurveyNext = (year, years = HERO_SURVEY_YEARS) => {
  for (const y of years) if (y > year) return y;
  return null;
};

// The first pass goes left to right (1). The next goes right to left (-1), and so on.
const heroSurveyDirection = count => (count % 2 === 0 ? 1 : -1);

// The opacity of the image: full during the cross and the hold, then a linear fade.
const heroSurveyFade = u => {
  const hold = HERO_SURVEY_CROSS + HERO_SURVEY_HOLD;
  return u <= hold ? 1 : Math.max(0, 1 - (u - hold) / HERO_SURVEY_FADE);
};

// The streamers are 3 km long. The section is 10 km wide, so a streamer is 0.3 of the width.
const heroSurveyStreamer = width => 0.3 * width;

// The x of the ship at the pass time u. It starts 60 px outside one edge.
// It ends 40 px beyond the point where the far edge has the full fold (half a streamer past the edge).
const heroSurveyShipX = (u, dir, width) => {
  const p = Math.max(0, Math.min(1, u / HERO_SURVEY_CROSS)), span = width + heroSurveyStreamer(width) / 2 + 40 + 60;
  return dir > 0 ? -60 + span * p : width + 60 - span * p;
};

// The left edge of the image: just right of the depth axis. The axis is 96 px wide, and 58 px on a phone.
const heroSurveyLeft = width => (width <= 600 ? 62 : 100);

// The fold of the image at x, from 0 to 1. The subsurface midpoints of one shot lie between the gun and
// half a streamer behind it. The image opacity is the square root of the fold.
const heroSurveyFold = (x, gun, dir, length) => Math.sqrt(Math.max(0, Math.min(1, ((gun - x) * dir) / (length / 2))));

// The chip shows once the image under its edge that is nearest to the gun has half of the opacity.
const heroSurveyChipShown = (x, w, gun, dir, length) => heroSurveyFold(dir > 0 ? x + w : x, gun, dir, length) >= 0.5;

// One reflected wavefront point. The plume top is a plane at the depth plane. The gun sits at the sea level sea.
// The reflected front is a circle with radius r about the image source (the gun mirrored in the plane).
// Only the part above the plane and below the sea counts. The reflection point of the ray must lie from x0 to x1.
// The point goes into out[0], out[1]. The result is false when the point is not drawn.
const heroSurveyEchoPoint = (gx, sea, plane, r, theta, x0, x1, out) => {
  const sy = 2 * plane - sea;
  const px = gx + r * Math.cos(theta), py = sy - r * Math.sin(theta);
  if (!(py < plane) || !(py > sea)) return false;
  const qx = gx + (plane - sy) / (py - sy) * (px - gx);
  if (qx < x0 || qx > x1) return false;
  out[0] = px; out[1] = py;
  return true;
};

// The first and the last cell with CO2 in one aquifer, and the mean roof (section units) over them. The result is null when there is no CO2.
const heroSurveyPlumeExtent = (h, hMax, layer) => {
  let a = -1, b = -1;
  for (let k = 0; k < 200; k++) if (hMax[k] > 0.002 || h[k] > 0.002) { if (a < 0) a = k; b = k; }
  if (a < 0) return null;
  let sum = 0;
  for (let k = a; k <= b; k++) sum += (layer.roofR[k] + layer.roofL[k + 1]) / 2;
  return { a, b, roof: sum / (b - a + 1) };
};

const heroSurveyHit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

// The place of the chip. A rect is { left, top, right, bottom } in one frame. The chip is { w, h }.
// Candidates, in order: the top left of the image, just right of the player card at the section top,
// just below the player card. The first one that fits in the section and misses both cards wins.
// player and leak can be null. The result is { x, y } for the top left of the chip.
const heroSurveyChipPlace = (chip, section, imageLeft, player, leak) => {
  const gap = 8, spots = [{ x: imageLeft + 10, y: section.top + 8 }];
  if (player) {
    spots.push({ x: player.right + gap, y: section.top + 8 });
    spots.push({ x: player.left, y: player.bottom + gap });
  }
  for (const s of spots) {
    const r = { left: s.x, top: s.y, right: s.x + chip.w, bottom: s.y + chip.h };
    const pad = { left: r.left - 4, top: r.top - 4, right: r.right + 4, bottom: r.bottom + 4 };
    if (r.right > section.right || r.bottom > section.bottom) continue;
    if (player && heroSurveyHit(pad, player)) continue;
    if (leak && heroSurveyHit(pad, leak)) continue;
    return s;
  }
  return spots[0];
};

// A seeded random generator (mulberry32). The survey code never uses the global random generator.
const heroSurveyRandom = seed => {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};

// The seed comes from the geology of the page. It is the same for each survey of one page load.
const heroSurveySeed = g => (Math.round(g.wellXPct * 1000) + Math.round(g.K * 100) * 31 + Math.round(g.reservoirThickness * 10) * 7) >>> 0;

// A smooth noise along x with values from -1 to 1. A random knot sits every corr px, and a smooth step joins the knots.
const heroSurveySmoothNoise = (rand, count, corr) => {
  const step = Math.max(1, corr), knots = Math.ceil(count / step) + 3, k = new Float32Array(knots), out = new Float32Array(count);
  for (let i = 0; i < knots; i++) k[i] = rand() * 2 - 1;
  for (let x = 0; x < count; x++) {
    const p = x / step, i = Math.floor(p);
    out[x] = k[i] + (k[i + 1] - k[i]) * heroSurveySmooth(p - i);
  }
  return out;
};

// The zero-phase Ricker wavelet in depth. dz is in metres. The peak frequency is 30 Hz and the velocity is 2500 m/s (two-way time).
const heroSurveyRicker = dz => {
  const a = (Math.PI * HERO_SURVEY_FREQ * 2 * dz / HERO_SURVEY_VEL) ** 2;
  return (1 - 2 * a) * Math.exp(-a);
};

// The wavelet samples for a vertical scale mv (metres per px). The wavelet stops where it is below 0.01 in the tail.
const heroSurveyWavelet = (() => {
  let cache = null;
  return mv => {
    if (cache && cache.mv === mv) return cache;
    let half = 1;
    while (half < 80 && !(half * mv > 20 && Math.abs(heroSurveyRicker(half * mv)) < 0.01)) half++;
    const taps = new Float32Array(2 * half + 1);
    for (let d = -half; d <= half; d++) taps[d + half] = heroSurveyRicker(d * mv);
    cache = { mv, half, taps };
    return cache;
  };
})();

// The scales of the image. mv is the metres per px down. mh is the metres per px across.
const heroSurveyScales = (width, height) => ({ mv: HERO_SURVEY_METRES_UNIT * 580 / height, mh: HERO_SURVEY_SECTION_M / width });

// The "real" CO2 in each column, in px of the section image. It starts from the model frame. Then small changes follow:
// the mobile thickness varies, the updip side stretches, and three thin baffle layers hold CO2 under shale.
// layers = { storage, overlying }: each has roofL, roofR, floorL and floorR (section units, 201 nodes).
// The geometry is the same as in the plume drawing: cell k lies between node k (roofR) and node k + 1 (roofL).
const heroSurveyColumns = (frame, layers, width, height, o, sc) => {
  const k580 = height / 580, unit = HERO_SURVEY_UNIT * k580;
  const rand = heroSurveyRandom(o.seed);
  const eps = HERO_SURVEY_STRETCH[0] + (HERO_SURVEY_STRETCH[1] - HERO_SURVEY_STRETCH[0]) * rand();
  const wob = heroSurveySmoothNoise(rand, width, HERO_SURVEY_THICK_CORR / sc.mh);
  const lerp = (a, b, t) => a + (b - a) * t;
  const geo = layer => {
    const roof = new Float32Array(width), floor = new Float32Array(width);
    for (let x = 0; x < width; x++) {
      const pos = (x + 0.5) / width * 200, k = Math.min(199, Math.floor(pos)), t = pos - k;
      roof[x] = lerp(layer.roofR[k], layer.roofL[k + 1], t) * k580;
      floor[x] = lerp(layer.floorR[k], layer.floorL[k + 1], t) * k580;
    }
    return { roof, floor };
  };
  // The model value at the position xs (px), by linear steps between the cell centres.
  const at = (arr, xs) => {
    const f = xs / width * 200 - 0.5, i = Math.floor(f), t = f - i;
    const a = arr[i < 0 ? 0 : i > 199 ? 199 : i], b = arr[i + 1 < 0 ? 0 : i + 1 > 199 ? 199 : i + 1];
    return a + (b - a) * t;
  };
  const body = (layer, g, h, hMax, stretch, vary) => {
    const mob = new Float32Array(width), swept = new Float32Array(width);
    for (let x = 0; x < width; x++) {
      let xs = x + 0.5;
      if (stretch) {
        if (stretch.side > 0 && xs > stretch.c) xs = stretch.c + (xs - stretch.c) / (1 + eps);
        else if (stretch.side < 0 && xs < stretch.c) xs = stretch.c - (stretch.c - xs) / (1 + eps);
      }
      const hv = at(h, xs), hm = at(hMax, xs);
      if (!(hm > 0.002 || hv > 0.002)) continue;
      const room = g.floor[x] - g.roof[x];
      mob[x] = Math.max(0, Math.min(room, hv * unit * (vary ? 1 + HERO_SURVEY_THICK_VARY * wob[x] : 1)));
      swept[x] = Math.min(room, Math.max(mob[x], hm * unit));
    }
    return { mob, swept };
  };
  const s = geo(layers.storage), ov = geo(layers.overlying);
  const model = heroSurveyPlumeExtent(frame.h, frame.hMax, layers.storage);
  let stretch = null;
  if (o.real && model) {
    const c = (model.a + model.b + 1) / 2 / 200 * width;
    stretch = { c, side: layers.storage.roofR[model.a] < layers.storage.roofR[model.b] ? -1 : 1 };
  }
  const sb = body(layers.storage, s, frame.h, frame.hMax, stretch, o.real);
  const ob = body(layers.overlying, ov, frame.h2, frame.h2Max, null, false);
  // The baffle layers. They sit around the well, inside the footprint of the real plume.
  const baf = [];
  if (o.real && model) {
    let x0 = width, x1 = -1;
    for (let x = 0; x < width; x++) if (sb.swept[x] > 0) { if (x < x0) x0 = x; x1 = x; }
    const wellX = o.wellXPct / 100 * width, half = (x1 - x0 + 1) / 2, sub = new Float32Array(width);
    for (const b of HERO_SURVEY_BAFFLES) {
      const row = new Float32Array(width), thick = new Float32Array(width), reach = b.reach * half;
      for (let x = Math.max(x0, Math.ceil(wellX - reach)); x <= Math.min(x1, Math.floor(wellX + reach)); x++) {
        const q = (x + 0.5 - wellX) / reach, t = b.thick * o.injectedFrac * (1 - q * q) / sc.mv;
        if (!(t > 0)) continue;
        const yb = s.roof[x] + b.at * (s.floor[x] - s.roof[x]);
        if (s.roof[x] + sb.mob[x] >= yb) continue; // the main column already reaches below this baffle
        row[x] = yb; thick[x] = Math.min(t, s.floor[x] - yb);
        sub[x] += thick[x] / 2;
      }
      baf.push({ row, thick });
    }
    for (let x = 0; x < width; x++) sb.mob[x] = Math.max(0, sb.mob[x] - sub[x]);
  }
  return { eps, stretch, sRoof: s.roof, sFloor: s.floor, sMob: sb.mob, sSw: sb.swept, oRoof: ov.roof, oFloor: ov.floor, oMob: ob.mob, oSw: ob.swept, baf };
};

// The amplitude image of one frame, in CSS pixels of the section: width x height values, row by row, in about -1 .. 1.
// Softening shows as positive (cream), hardening as negative (blue). The steps of one column:
//   the fractional impedance change dI(y) of the real CO2 and of the pressure, then the reflectivity (dI(y + 1) - dI(y)) / 2,
//   the push-down dipole at the aquifer floor, the lateral blur along x, and the Ricker wavelet along y.
// opts: real (small changes to the model plume), residuals (the weak boundary residuals), seed, year, wellXPct, injectedFrac,
// pressure (a function from the distance in metres to bar, or null).
const heroSurveyAmplitude = (frame, layers, width, height, left, opts = {}) => {
  const o = Object.assign({ real: true, residuals: true, seed: 1, year: 0, wellXPct: 70, injectedFrac: 1, pressure: null }, opts);
  const sc = heroSurveyScales(width, height), wav = heroSurveyWavelet(sc.mv), half = wav.half, taps = wav.taps;
  const cols = heroSurveyColumns(frame, layers, width, height, o, sc);
  const x0 = Math.max(0, Math.floor(left));
  const sigma = Math.max(1, HERO_SURVEY_FRESNEL / sc.mh), R = Math.ceil(2.5 * sigma), g = new Float32Array(2 * R + 1);
  let gs = 0;
  for (let t = -R; t <= R; t++) { g[t + R] = Math.exp(-0.5 * (t / sigma) ** 2); gs += g[t + R]; }
  for (let t = 0; t < g.length; t++) g[t] /= gs;
  const rs = new Float32Array(width * height), dI = new Float32Array(height + 1);
  // For each row, the first and the last column that hold a reflectivity. The wavelet pass skips the rest.
  const lo = new Int32Array(height).fill(width), hi = new Int32Array(height).fill(-1);
  // Add a reflectivity value v at the row j of the column x, blurred along x.
  const put = (x, j, v) => {
    if (j < 0 || j >= height || v === 0) return;
    const base = j * width, a = Math.max(0, x - R), b = Math.min(width - 1, x + R);
    if (a < lo[j]) lo[j] = a;
    if (b > hi[j]) hi[j] = b;
    for (let xx = a; xx <= b; xx++) rs[base + xx] += v * g[xx - x + R];
  };
  // A step at the edge e (px, a float) gives its reflectivity to the two nearest rows. The sample j lies at the edge j + 1.
  const spike = (x, e, v) => { const p = e - 1, j = Math.floor(p), t = p - j; put(x, j, v * (1 - t)); put(x, j + 1, v * t); };
  const range = (a, b, v) => {
    if (!(b > a)) return;
    for (let y = Math.max(0, Math.floor(a)), end = Math.min(height, Math.ceil(b)); y < end; y++) dI[y] += v * (Math.min(b, y + 1) - Math.max(a, y));
  };
  const wellM = o.wellXPct / 100 * HERO_SURVEY_SECTION_M;
  for (let x = x0; x < width; x++) {
    dI.fill(0);
    const rS = cols.sRoof[x], fS = cols.sFloor[x], mob = cols.sMob[x], sw = cols.sSw[x];
    const bar = o.pressure ? o.pressure(Math.abs((x + 0.5) * sc.mh - wellM)) : 0;
    if (bar >= HERO_SURVEY_BAR_MIN) range(rS, fS, HERO_SURVEY_DI_BAR * bar);
    range(rS, rS + mob, HERO_SURVEY_DI_MOBILE);
    range(rS + mob, rS + sw, HERO_SURVEY_DI_RESIDUAL);
    let thickSum = 0;
    for (const b of cols.baf) {
      const t = b.thick[x];
      if (!(t > 0)) continue;
      thickSum += t;
      range(b.row[x], b.row[x] + t, HERO_SURVEY_DI_MOBILE);
      range(Math.max(b.row[x], rS + mob), Math.min(b.row[x] + t, rS + sw), -HERO_SURVEY_DI_RESIDUAL); // mobile CO2 replaces residual CO2 here
    }
    const rO = cols.oRoof[x], omob = cols.oMob[x], osw = cols.oSw[x];
    range(rO, rO + omob, HERO_SURVEY_DI_MOBILE);
    range(rO + omob, rO + osw, HERO_SURVEY_DI_RESIDUAL);
    for (let y = 0; y < height; y++) { const v = (dI[y + 1] - dI[y]) * 0.5; if (v > 1e-7 || v < -1e-7) put(x, y, v); }
    // The velocity push-down: the floor of the aquifer appears deeper below CO2. The dipole is R_floor * (w(y - floor - shift) - w(y - floor)).
    const shiftS = HERO_SURVEY_PUSH * (mob + HERO_SURVEY_RESIDUAL_T * (sw - mob) + thickSum);
    if (shiftS > 0.01) { spike(x, fS + shiftS, HERO_SURVEY_R_FLOOR); spike(x, fS, -HERO_SURVEY_R_FLOOR); }
    const shiftO = HERO_SURVEY_PUSH * (omob + HERO_SURVEY_RESIDUAL_T * (osw - omob));
    if (shiftO > 0.01) { const fO = cols.oFloor[x]; spike(x, fO + shiftO, HERO_SURVEY_R_FLOOR); spike(x, fO, -HERO_SURVEY_R_FLOOR); }
  }
  // The wavelet along y, for the rows that hold a reflectivity. The display polarity is flipped: softening is positive.
  const amp = new Float32Array(width * height), k = -HERO_SURVEY_NORM;
  for (let j = 0; j < height; j++) {
    const from = Math.max(x0, lo[j]), to = hi[j];
    if (from > to) continue;
    const src = j * width;
    for (let d = -half; d <= half; d++) {
      const yy = j + d;
      if (yy < 0 || yy >= height) continue;
      const wd = taps[d + half] * k, dst = yy * width;
      for (let x = from; x <= to; x++) amp[dst + x] += rs[src + x] * wd;
    }
  }
  // The weak residuals at the strong boundaries: a wavelet with a smooth amplitude along x and a random sign.
  if (o.residuals) {
    const rr = heroSurveyRandom((o.seed + Math.imul(o.year + 1, 7919)) >>> 0);
    for (const edge of [cols.sRoof, cols.sFloor, cols.oRoof, cols.oFloor]) {
      const n = heroSurveySmoothNoise(rr, width, 500 / sc.mh);
      let sum = 0;
      for (let x = 0; x < width; x++) sum += n[x] * n[x];
      const scale = sum > 0 ? HERO_SURVEY_BOUNDARY_RMS / Math.sqrt(sum / width) : 0;
      for (let x = x0; x < width; x++) {
        const c = Math.round(edge[x]), a = n[x] * scale;
        for (let d = -half; d <= half; d++) { const yy = c + d; if (yy >= 0 && yy < height) amp[yy * width + x] += a * taps[d + half]; }
      }
    }
  }
  return amp;
};

// A periodic 256 x 256 tile of band-limited noise. The white noise is blurred along x (60 m, periodic) and shaped along y
// by the same wavelet (periodic). The RMS is 0.07. One tile exists for each pair of scales.
const heroSurveyTile = (() => {
  let cache = null;
  return (sc, seed) => {
    const key = `${sc.mv.toFixed(3)}|${sc.mh.toFixed(3)}|${seed}`;
    if (cache && cache.key === key) return cache.tile;
    const N = HERO_SURVEY_TILE, rand = heroSurveyRandom((seed + 0x5BD1E995) >>> 0), white = new Float32Array(N * N);
    for (let i = 0; i < white.length; i++) white[i] = rand() * 2 - 1;
    // Three periodic box passes along x give a near-Gaussian blur with the sigma of 60 m.
    const sigma = Math.max(1, 60 / sc.mh), R = Math.min(N / 2 - 1, Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2)));
    let blur = white, spare = new Float32Array(N * N);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < N; y++) {
        const row = y * N;
        let s = 0;
        for (let t = -R; t <= R; t++) s += blur[row + (t & (N - 1))];
        for (let x = 0; x < N; x++) {
          spare[row + x] = s / (2 * R + 1);
          s += blur[row + ((x + R + 1) & (N - 1))] - blur[row + ((x - R) & (N - 1))];
        }
      }
      const swap = blur; blur = spare; spare = pass === 0 ? new Float32Array(N * N) : swap;
    }
    const wav = heroSurveyWavelet(sc.mv), tile = new Float32Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let d = -wav.half; d <= wav.half; d++) {
        const w = wav.taps[d + wav.half], src = ((y - d) & (N - 1)) * N, dst = y * N;
        for (let x = 0; x < N; x++) tile[dst + x] += w * blur[src + x];
      }
    }
    let sum = 0;
    for (let i = 0; i < tile.length; i++) sum += tile[i] * tile[i];
    const scale = sum > 0 ? HERO_SURVEY_NOISE_RMS / Math.sqrt(sum / tile.length) : 0;
    for (let i = 0; i < tile.length; i++) tile[i] *= scale;
    cache = { key, tile };
    return tile;
  };
})();

// The colour table: 511 packed RGBA values for the amplitudes -1 .. 1. Dark ground, cream for positive, blue for negative.
const heroSurveyPalette = (() => {
  let table = null;
  return () => {
    if (table) return table;
    const Z = [13, 18, 25], P = [238, 243, 248], N = [63, 127, 217];
    const little = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
    table = new Uint32Array(511);
    for (let i = 0; i < 511; i++) {
      const v = (i - 255) / 255, m = Math.pow(Math.abs(v), 0.8), c = v >= 0 ? P : N;
      const r = Math.round(Z[0] + (c[0] - Z[0]) * m), g = Math.round(Z[1] + (c[1] - Z[1]) * m), b = Math.round(Z[2] + (c[2] - Z[2]) * m);
      table[i] = little ? ((238 << 24) | (b << 16) | (g << 8) | r) >>> 0 : ((r << 24) | (g << 16) | (b << 8) | 238) >>> 0;
    }
    return table;
  };
})();
// ---- end hero survey helpers

// The image of the next survey. The store holds one image at most. The pass takes it, and the pass drops it.
const heroSurveyStore = { run: null, year: null, image: null, w: 0, h: 0 };

// Build the difference image of one survey year at the CSS size of the section. The result is an offscreen canvas.
const heroSurveyBuild = (run, year, width, height, left) => {
  const frame = heroFrameAt(run, year);
  const total = run.inventory[run.years * 4 + 3], seed = heroSurveySeed(heroGeology);
  const amp = heroSurveyAmplitude(frame, { storage: heroStorage, overlying: heroOverlying }, width, height, left, {
    seed, year, wellXPct: heroGeology.wellXPct,
    injectedFrac: total > 0 ? Math.min(1, frame.inventory.injected / total) : 0,
    pressure: r => HeroGeology.overpressure(r, year, run.injectionYears),
  });
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const data = ctx.createImageData(width, height), out = new Uint32Array(data.data.buffer);
  const table = heroSurveyPalette(), noise = heroSurveyTile(heroSurveyScales(width, height), seed);
  const ox = (year * 37) & 255, oy = (year * 91) & 255; // each survey reads another part of the tile
  for (let y = 0; y < height; y++) {
    const row = y * width, nrow = ((y + oy) & 255) << 8;
    for (let x = Math.floor(left); x < width; x++) {
      const v = amp[row + x] + noise[nrow + ((x + ox) & 255)];
      out[row + x] = table[((v < -1 ? -1 : v > 1 ? 1 : v) * 255 + 255.5) | 0];
    }
  }
  ctx.putImageData(data, 0, 0);
  // Wiggle traces: only on the strong reflections, one trace every 16 px, in one stroke.
  ctx.strokeStyle = 'rgba(230,236,244,0.32)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let x0 = Math.floor(left) + 8; x0 < width; x0 += 16) {
    let pen = false;
    for (let y = 0; y < height; y++) {
      const a = amp[y * width + x0];
      if (Math.abs(a) < 0.14) { pen = false; continue; }
      const x = x0 + 6 * (a < -1 ? -1 : a > 1 ? 1 : a);
      if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; }
    }
  }
  ctx.stroke();
  return canvas;
};

// The size of the image for one section: whole CSS pixels, and at most 1600 px wide.
const heroSurveySizeOf = section => {
  const rect = section.getBoundingClientRect();
  return { width: Math.min(HERO_SURVEY_MAX_WIDTH, Math.round(rect.width)), height: Math.round(rect.height) };
};

const heroSurveyIdle = fn => {
  if (window.requestIdleCallback) {
    const id = window.requestIdleCallback(fn, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 250);
  return () => clearTimeout(id);
};

// Build the image of the next survey when the browser is idle. The result stays in the store. A new call replaces it.
// The return value cancels a build that did not start yet.
const heroSurveyPrepare = (run, year, sectionRef) => {
  if (!run || year === null) return undefined;
  if (heroSurveyStore.run === run && heroSurveyStore.year === year && heroSurveyStore.image) return undefined;
  return heroSurveyIdle(() => {
    const section = sectionRef.current;
    if (!section) return;
    const { width, height } = heroSurveySizeOf(section);
    if (!width || !height) return;
    heroSurveyStore.image = heroSurveyBuild(run, year, width, height, heroSurveyLeft(width));
    Object.assign(heroSurveyStore, { run, year, w: width, h: height });
  });
};

// The rect of an element as plain numbers. An element that is not there, or has no size, gives null.
const heroSurveyRectOf = el => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null;
};

// Draw one frame of the pass at the pass time u. The engine owns the image and the sizes. React never sees a frame.
const heroSurveyEngine = (canvas, sectionRef, run, year, reduced) => {
  const ctx = canvas.getContext('2d');
  const size = { w: 0, h: 0, ratio: 1, secTop: 0, secH: 0, left: 100, font: '', chipW: 0, chipH: 0, chipX: 0, chipY: 0, checked: -1, ramp: null, echo: null };
  let image = null;
  const label = `4D survey · year ${year}`;
  const WATERLINE = 44; // px from the top of the canvas to the sea level
  const SHIP_Y = WATERLINE - 20;
  const GUN = 30;       // px between the ship and the gun
  const plume = (() => { const f = heroFrameAt(run, year); return heroSurveyPlumeExtent(f.h, f.hMax, heroStorage); })();
  const point = [0, 0];

  const ensureImage = () => {
    const section = sectionRef.current;
    if (!section) return;
    const need = heroSurveySizeOf(section);
    if (image && image.width === need.width && image.height === need.height) return;
    const s = heroSurveyStore;
    if (s.image && s.run === run && s.year === year && s.w === need.width && s.h === need.height) image = s.image;
    else if (need.width && need.height) image = heroSurveyBuild(run, year, need.width, need.height, heroSurveyLeft(need.width));
  };

  // The chip moves to the first free place. The rects of the two cards are read here, at most every 500 ms and on a resize.
  const placeChip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const box = canvas.getBoundingClientRect(), sr = section.getBoundingClientRect();
    const pos = heroSurveyChipPlace({ w: size.chipW, h: size.chipH },
      { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom }, box.left + size.left,
      heroSurveyRectOf(document.querySelector('.hero-player')), heroSurveyRectOf(document.querySelector('.hero-leak-readout')));
    size.chipX = pos.x - box.left; size.chipY = pos.y - box.top;
  };

  const chip = (alpha) => {
    const phone = size.w <= 600, fs = phone ? 8.6 : 11, pad = phone ? 4.5 : 7, x = size.chipX, y = size.chipY;
    ctx.font = `500 ${fs}px ${size.font}`;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(8,15,25,0.84)';
    ctx.strokeStyle = 'rgba(232,237,242,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, size.chipW, size.chipH, 5); else ctx.rect(x, y, size.chipW, size.chipH);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#eef3f8';
    ctx.fillText(label, x + pad, y + pad * 0.6 + fs * 1.0);
    ctx.globalAlpha = 1;
  };

  // The ship tows five streamers of the length L (px) with a tail buoy on each. The platform has a higher z-index, so the ship passes behind it.
  const ship = (x, dir, now, L) => {
    ctx.save();
    ctx.translate(x, SHIP_Y);
    ctx.scale(dir, 1);
    for (let i = 0; i < 5; i++) {
      const y = 0.8 + i * 1.5, tail = -44 - L;
      ctx.strokeStyle = `rgba(150,170,190,${(0.5 - i * 0.06).toFixed(2)})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-14, 0.5); ctx.lineTo(-44, y); ctx.lineTo(tail, y); ctx.stroke();
      ctx.fillStyle = '#5b6f86';
      ctx.fillRect(tail - 1.6, y - 1.2, 3.2, 2.4);
      ctx.fillStyle = Math.sin(now * 4 + i) > 0.2 ? '#ffd27a' : 'rgba(255,210,122,0.35)';
      ctx.beginPath(); ctx.arc(tail, y - 2, 1.1, 0, 6.283); ctx.fill();
    }
    ctx.fillStyle = '#22344a';
    ctx.beginPath(); ctx.moveTo(-16, -3); ctx.lineTo(12, -3); ctx.lineTo(18, -6); ctx.lineTo(14, 1); ctx.lineTo(-15, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a4f69'; ctx.fillRect(2, -10, 10, 7); ctx.fillRect(5, -14, 4, 4);
    ctx.strokeStyle = '#4f6684'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-15, -3); ctx.lineTo(-12, -9); ctx.lineTo(-9, -3); ctx.stroke();
    ctx.fillStyle = '#f0cd8e'; for (const dx of [3.5, 6.5, 9.5]) ctx.fillRect(dx, -8, 1.4, 1.2);
    ctx.fillStyle = '#f6e3b8'; ctx.beginPath(); ctx.arc(7, -15, 0.9, 0, 6.283); ctx.fill();
    ctx.restore();
  };

  return {
    // Fit the canvas to its CSS box and read the place of the section in it.
    resize(ratio) {
      const box = canvas.getBoundingClientRect(), section = sectionRef.current;
      if (!box.width || !section) return false;
      const rect = section.getBoundingClientRect();
      size.w = box.width; size.h = box.height; size.ratio = ratio;
      size.secTop = rect.top - box.top; size.secH = rect.height;
      size.left = heroSurveyLeft(box.width);
      size.font = getComputedStyle(canvas).getPropertyValue('--sim-font-mono').trim() || 'ui-monospace, monospace';
      canvas.width = Math.round(box.width * ratio);
      canvas.height = Math.round(box.height * ratio);
      // The chip size, from the text width.
      const phone = size.w <= 600, fs = phone ? 8.6 : 11, pad = phone ? 4.5 : 7;
      ctx.font = `500 ${fs}px ${size.font}`;
      size.chipW = ctx.measureText(label).width + pad * 2; size.chipH = fs * 1.42 + pad * 1.2;
      // The fold ramp: a gradient from the point where the fold is 1 (half a streamer behind the gun) to the gun, where the fold is 0.
      // The removal is 1 - sqrt(d / half), where d is the distance behind the gun. The gradient lives at the origin and moves with a translate.
      const half = heroSurveyStreamer(size.w) / 2, soft = ctx.createLinearGradient(-half, 0, 0, 0);
      for (let i = 0; i <= 10; i++) { const fold = 1 - i / 10; soft.addColorStop(1 - fold * fold, `rgba(0,0,0,${(1 - fold).toFixed(3)})`); }
      size.ramp = soft;
      // The echo of the plume top: a horizontal plane at the mean roof depth, and the lateral range of the plume.
      size.echo = plume ? { plane: size.secTop + plume.roof / 580 * size.secH, x0: plume.a / 200 * size.w, x1: (plume.b + 1) / 200 * size.w } : null;
      ensureImage();
      placeChip();
      size.checked = -1;
      return true;
    },
    paint(s, now) {
      if (!size.w) return;
      const u = s.u, dir = s.dir;
      ctx.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);
      if (u < 0 || u > HERO_SURVEY_TOTAL) return;
      const fade = heroSurveyFade(u), { w, secTop, secH } = size, L = heroSurveyStreamer(w), half = L / 2;
      const gun = reduced ? (dir > 0 ? w + L : -L) : heroSurveyShipX(u, dir, w) - GUN * dir;
      // The rects of the two cards are read here, and only twice in a second.
      if (size.checked < 0 || now - size.checked >= 0.5) { size.checked = now; placeChip(); }
      if (image) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, secTop, w, secH); ctx.clip();
        ctx.globalAlpha = fade;
        const covered = dir > 0 ? Math.min(w, gun) : w - Math.max(0, gun);
        if (covered > 0) {
          ctx.save();
          ctx.beginPath(); ctx.rect(dir > 0 ? 0 : w - covered, secTop, covered, secH); ctx.clip();
          ctx.drawImage(image, 0, secTop, w, secH);
          ctx.restore();
          // The fold ramp: the image fades in over half a streamer behind the gun.
          if (!reduced && (dir > 0 ? gun - half < w : gun + half > 0)) {
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.translate(gun, 0);
            if (dir < 0) ctx.scale(-1, 1);
            ctx.fillStyle = size.ramp;
            ctx.fillRect(-half, secTop, half, secH);
            ctx.globalCompositeOperation = 'source-over';
          }
        }
        ctx.restore();
        ctx.globalAlpha = 1;
        if (reduced || heroSurveyChipShown(size.chipX, size.chipW, gun, dir, L)) chip(fade);
      }
      if (reduced) return;
      // Shots: the wavefronts go down through the sea and the rock from the gun point at the sea level.
      // When the plume exists, each front has an echo from the top of the CO2, with 0.7 of the alpha.
      if (u < HERO_SURVEY_CROSS + 1.2) {
        ctx.save();
        ctx.beginPath(); ctx.rect(0, WATERLINE, w, size.h); ctx.clip();
        const last = Math.floor(Math.min(u, HERO_SURVEY_CROSS) / HERO_SURVEY_SHOT), echo = size.echo;
        ctx.lineWidth = 1;
        for (let n = last; n >= Math.max(0, last - 5); n--) {
          const ts = n * HERO_SURVEY_SHOT, r = (u - ts) * HERO_SURVEY_RING;
          if (r > HERO_SURVEY_RING_MAX || r < 0) continue;
          const gx = heroSurveyShipX(ts, dir, w) - GUN * dir, a = 0.42 * (1 - r / HERO_SURVEY_RING_MAX);
          ctx.strokeStyle = `rgba(214,228,242,${a.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(gx, WATERLINE, r, 0.06, Math.PI - 0.06); ctx.stroke();
          if (echo) {
            ctx.strokeStyle = `rgba(214,228,242,${(0.7 * a).toFixed(3)})`;
            ctx.beginPath();
            let pen = false;
            for (let th = 0.02; th < Math.PI; th += 0.04) {
              if (!heroSurveyEchoPoint(gx, WATERLINE, echo.plane, r, th, echo.x0, echo.x1, point)) { pen = false; continue; }
              if (pen) ctx.lineTo(point[0], point[1]); else { ctx.moveTo(point[0], point[1]); pen = true; }
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      }
      if (u <= HERO_SURVEY_CROSS + 0.3) ship(heroSurveyShipX(u, dir, w), dir, now, L);
    },
  };
};

// One canvas over the hero. The loop runs only while the clock runs, the hero is in view and the tab is visible.
// The clock owns the pass time. This component reads it from the shared ref, so React does not render for each frame.
const HeroSurvey = ({ sectionRef, run, surveyRef, year, playing, visible, hidden }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const reduced = useMemo(() => siteReducedMotion(), []);
  const running = heroShouldTick({ playing, visible, hidden });

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = heroSurveyEngine(canvas, sectionRef, run, year, reduced);
    engineRef.current = engine;
    const fit = () => {
      if (engine.resize(Math.min(1.5, window.devicePixelRatio || 1))) engine.paint(surveyRef.current, performance.now() / 1000);
    };
    fit();
    const sizes = 'ResizeObserver' in window ? new ResizeObserver(fit) : null;
    if (sizes) { sizes.observe(canvas); sizes.observe(sectionRef.current); }
    return () => {
      if (sizes) sizes.disconnect();
      engineRef.current = null;
      // The pass is over: drop the image.
      Object.assign(heroSurveyStore, { run: null, year: null, image: null, w: 0, h: 0 });
    };
  }, []);

  useEffect(() => {
    if (!running) {
      if (engineRef.current) engineRef.current.paint(surveyRef.current, performance.now() / 1000);
      return undefined;
    }
    let frameId = 0, last = 0;
    const tick = now => {
      frameId = requestAnimationFrame(tick);
      if (last && now - last < HERO_SURVEY_FRAME_MS) return;
      last = now;
      if (engineRef.current) engineRef.current.paint(surveyRef.current, now / 1000);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);

  return <canvas ref={canvasRef} className="hero-survey" aria-hidden="true" data-survey-year={year} />;
};

// The 4D seismic survey of the hero: the schedule, the clock factor, the physical image, the real plume, the acquisition, the chip and the wiring.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const HeroGeology = require('../hero-geology.js');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const hero = read('SubsurfaceHero.jsx');
const survey = read('HeroSurvey.jsx');
const css = read('colors_and_type.css');
const build = read('build.js');
const readme = read('README.md');

const block = survey.slice(survey.indexOf('// ---- hero survey helpers'), survey.indexOf('// ---- end hero survey helpers'));
const S = new Function(`${block}
return { HERO_SURVEY_YEARS, HERO_SURVEY_CROSS, HERO_SURVEY_HOLD, HERO_SURVEY_FADE, HERO_SURVEY_TOTAL, HERO_SURVEY_SHOT, HERO_SURVEY_SLOW, HERO_SURVEY_JUMP, HERO_SURVEY_UNIT,
  HERO_SURVEY_FRAME_MS, HERO_SURVEY_FREQ, HERO_SURVEY_VEL, heroSurveyClock, heroSurveyCrossing, heroSurveyNext, heroSurveyDirection, heroSurveyFade, heroSurveyShipX,
  heroSurveyStreamer, heroSurveyLeft, heroSurveyFold, heroSurveyChipShown, heroSurveyEchoPoint, heroSurveyChipPlace, heroSurveyPlumeExtent, heroSurveyRicker,
  heroSurveyWavelet, heroSurveyScales, heroSurveyColumns, heroSurveyAmplitude, heroSurveyTile, heroSurveyPalette, heroSurveySeed, heroSurveyRandom };`)();

const rule = selector => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, `${selector} exists`);
  return css.slice(at, css.indexOf('}', at));
};
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} is close to ${b}`);
const same = (a, b) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).equals(Buffer.from(b.buffer, b.byteOffset, b.byteLength));

test('the schedule has two surveys during injection and one long after', () => {
  assert.deepEqual(S.HERO_SURVEY_YEARS, [10, 25, 1000]);
  assert.equal(S.HERO_SURVEY_YEARS.filter(y => y <= 30).length, 2);
});

test('the pass has a cross, a hold and a fade, and a shot every 0.45 s', () => {
  assert.equal(S.HERO_SURVEY_CROSS, 4.5);
  assert.equal(S.HERO_SURVEY_HOLD, 1.4);
  assert.equal(S.HERO_SURVEY_FADE, 0.8);
  near(S.HERO_SURVEY_TOTAL, 6.7);
  assert.equal(S.HERO_SURVEY_SHOT, 0.45);
});

test('the clock factor is 1 when idle, eases to 0.03 in 0.2 s, holds, and eases back in the last 0.3 s of the fade', () => {
  assert.equal(S.heroSurveyClock(0), 1);
  assert.equal(S.heroSurveyClock(-1), 1);
  near(S.heroSurveyClock(0.1), 1 - 0.97 * 0.5);
  near(S.heroSurveyClock(0.2), 0.03);
  assert.equal(S.heroSurveyClock(2), 0.03);
  near(S.heroSurveyClock(6.4), 0.03);
  near(S.heroSurveyClock(6.4 + 0.15), 0.03 + 0.97 * 0.5);
  assert.equal(S.heroSurveyClock(6.7), 1);
  assert.equal(S.heroSurveyClock(20), 1);
  let last = 1;
  for (let u = 0; u <= 0.2; u += 0.02) { const f = S.heroSurveyClock(u); assert.ok(f <= last + 1e-12); last = f; }
});

test('a pass during injection moves the year by less than 5 years, so the pass at year 25 ends before the shut-in at year 30', () => {
  let year = 25;
  for (let u = 0; u < S.HERO_SURVEY_TOTAL; u += 0.001) year += 0.001 * 8 * S.heroSurveyClock(u);
  assert.ok(year < 30, `the pass ends at year ${year.toFixed(2)}`);
  assert.ok(year - 25 < 5);
});

test('playback that crosses a survey year starts a pass, and the step ends at that year', () => {
  assert.equal(S.heroSurveyCrossing(9.8, 10.2), 10);
  assert.equal(S.heroSurveyCrossing(9.8, 10), 10);
  assert.equal(S.heroSurveyCrossing(10, 10.2), null, 'a step from the year does not start again');
  assert.equal(S.heroSurveyCrossing(1, 2), null);
  assert.equal(S.heroSurveyCrossing(24, 26), 25);
  assert.equal(S.heroSurveyCrossing(5, 30), 10, 'the first year in the step wins');
});

test('a jump never starts a pass', () => {
  assert.equal(S.heroSurveyCrossing(0, 200), null);
  assert.equal(S.heroSurveyCrossing(0, 31), null);
  assert.equal(S.heroSurveyCrossing(0, 30), 10);
  assert.equal(S.heroSurveyCrossing(300, 100), null, 'a scrub back');
  assert.equal(S.heroSurveyCrossing(3, 3), null);
  assert.equal(S.HERO_SURVEY_JUMP, 30);
  assert.match(hero, /const HERO_LEAK_JUMP = 30;/);
});

test('each survey year starts once for each pass of the clock through it', () => {
  const run = () => {
    const fired = [];
    let year = 0;
    for (let n = 0; n < 4000 && year < 1100; n++) {
      let next = year + 0.7;
      const hit = S.heroSurveyCrossing(year, next);
      if (hit !== null) { next = hit; fired.push(hit); }
      year = next;
    }
    return fired;
  };
  assert.deepEqual(run(), [10, 25, 1000]);
  assert.deepEqual(run(), [10, 25, 1000], 'a restart from year 0 lets all of them happen again');
});

test('the next survey is the first year after the current year', () => {
  assert.equal(S.heroSurveyNext(0), 10);
  assert.equal(S.heroSurveyNext(10), 25);
  assert.equal(S.heroSurveyNext(26), 1000);
  assert.equal(S.heroSurveyNext(1000), null);
  assert.equal(S.heroSurveyNext(1500), null);
});

test('the passes alternate: left to right first, then right to left', () => {
  assert.deepEqual([0, 1, 2, 3].map(S.heroSurveyDirection), [1, -1, 1, -1]);
});

test('the streamers are 3 km, which is 0.3 of the width of the 10 km section', () => {
  assert.equal(S.heroSurveyStreamer(1000), 300);
  assert.equal(S.heroSurveyStreamer(1600), 480);
});

test('the ship starts 60 px outside one edge and ends half a streamer plus 40 px beyond the far edge', () => {
  const W = 1000, half = S.heroSurveyStreamer(W) / 2;
  assert.equal(S.heroSurveyShipX(0, 1, W), -60);
  near(S.heroSurveyShipX(4.5, 1, W), W + half + 40);
  assert.equal(S.heroSurveyShipX(0, -1, W), W + 60);
  near(S.heroSurveyShipX(4.5, -1, W), -(half + 40));
  near(S.heroSurveyShipX(9, 1, W), W + half + 40, 1e-9);
  // At the end of the cross, the gun is 30 px behind the ship and the far edge has the full fold.
  assert.equal(S.heroSurveyFold(W, S.heroSurveyShipX(4.5, 1, W) - 30, 1, 300), 1);
  assert.equal(S.heroSurveyFold(0, S.heroSurveyShipX(4.5, -1, W) + 30, -1, 300), 1);
});

test('the image fades only after the hold', () => {
  assert.equal(S.heroSurveyFade(0), 1);
  assert.equal(S.heroSurveyFade(5.9), 1);
  near(S.heroSurveyFade(6.3), 0.5);
  near(S.heroSurveyFade(6.7), 0);
});

test('the fold ramp: the opacity is the square root of the fold between the gun and half a streamer behind it', () => {
  assert.equal(S.heroSurveyFold(600, 600, 1, 300), 0, 'at the gun');
  assert.equal(S.heroSurveyFold(450, 600, 1, 300), 1, 'half a streamer behind the gun');
  near(S.heroSurveyFold(525, 600, 1, 300), Math.sqrt(0.5));
  assert.equal(S.heroSurveyFold(100, 600, 1, 300), 1, 'full far behind the gun');
  assert.equal(S.heroSurveyFold(700, 600, 1, 300), 0, 'nothing ahead of the gun');
  assert.equal(S.heroSurveyFold(400, 400, -1, 300), 0);
  assert.equal(S.heroSurveyFold(550, 400, -1, 300), 1);
  near(S.heroSurveyFold(475, 400, -1, 300), Math.sqrt(0.5));
  assert.equal(S.heroSurveyFold(300, 400, -1, 300), 0, 'a right-to-left pass: nothing ahead');
  assert.equal(S.heroSurveyLeft(1440), 100);
  assert.equal(S.heroSurveyLeft(390), 62);
});

test('the chip shows once the image under its edge nearest to the gun has half of the opacity', () => {
  assert.equal(S.heroSurveyChipShown(110, 120, 380, 1, 300), true);
  assert.equal(S.heroSurveyChipShown(110, 120, 260, 1, 300), false);
  assert.equal(S.heroSurveyChipShown(110, 120, 700, -1, 300), false, 'a right-to-left pass has not reached the chip');
  assert.equal(S.heroSurveyChipShown(110, 120, -100, -1, 300), true);
  assert.equal(S.heroSurveyChipShown(110, 120, -300, -1, 300), true, 'a finished right-to-left pass');
});

test('the reflected wavefront: a point shows only above the plane, below the sea, and over the plume', () => {
  const out = [0, 0], ask = (r, theta, x0, x1) => S.heroSurveyEchoPoint(500, 44, 244, r, theta, x0, x1, out);
  // The image source is at y = 444. A point straight above it, at the radius 250, is at y = 194, between the sea and the plane.
  assert.equal(ask(250, Math.PI / 2, 400, 700), true);
  near(out[0], 500); near(out[1], 194);
  assert.equal(ask(250, Math.PI / 2, 600, 700), false, 'the reflection point (x = 500) lies outside the plume');
  assert.equal(ask(450, Math.PI / 2, 400, 700), false, 'above the sea level');
  assert.equal(ask(150, Math.PI / 2, 400, 700), false, 'below the plane');
  // A slanted ray: r = 300, theta = 45 degrees. The reflection point is at x = 500 + 200 = 700.
  assert.equal(ask(300, Math.PI / 4, 400, 700.5), true);
  assert.equal(ask(300, Math.PI / 4, 400, 699), false);
});

test('the plume extent gives the first and last cell with CO2 and the mean roof', () => {
  const layer = flat(300, 400);
  const none = emptyFrame();
  assert.equal(S.heroSurveyPlumeExtent(none.h, none.hMax, layer), null);
  const f = emptyFrame(); f.hMax[50] = 1; f.h[60] = 1;
  assert.deepEqual(S.heroSurveyPlumeExtent(f.h, f.hMax, layer), { a: 50, b: 60, roof: 300 });
});

test('the chip takes the first free place: the image corner, right of the player card, below the player card', () => {
  const section = { left: 0, top: 0, right: 1000, bottom: 500 }, chip = { w: 120, h: 20 };
  assert.deepEqual(S.heroSurveyChipPlace(chip, section, 100, null, null), { x: 110, y: 8 });
  const player = { left: 104, top: 0, right: 444, bottom: 90 };
  assert.deepEqual(S.heroSurveyChipPlace(chip, section, 100, player, null), { x: 452, y: 8 }, 'a player card at the section top');
  const low = { left: 104, top: 380, right: 444, bottom: 480 };
  assert.deepEqual(S.heroSurveyChipPlace(chip, section, 100, low, null), { x: 110, y: 8 }, 'a player card at the bottom does not matter');
  const leak = { left: 440, top: 0, right: 700, bottom: 60 };
  assert.deepEqual(S.heroSurveyChipPlace(chip, section, 100, player, leak), { x: 104, y: 98 }, 'the leak card blocks the second place');
  assert.deepEqual(S.heroSurveyChipPlace(chip, section, 100, null, { left: 90, top: 0, right: 300, bottom: 40 }), { x: 110, y: 8 }, 'with no player card, the first place is the only one');
  const tall = { left: 104, top: 0, right: 444, bottom: 490 };
  assert.deepEqual(S.heroSurveyChipPlace(chip, section, 100, tall, { left: 440, top: 0, right: 700, bottom: 60 }), { x: 110, y: 8 }, 'no place is free: the first place stays');
  const f1 = { left: 455, top: 6, right: 480, bottom: 22 };
  assert.deepEqual(S.heroSurveyChipPlace(chip, section, 100, player, [null, f1]), { x: 452, y: 38 }, 'a fault label blocks the second place: the chip goes one row lower');
  const narrow = { left: 0, top: 0, right: 500, bottom: 500 };
  assert.deepEqual(S.heroSurveyChipPlace(chip, narrow, 100, { left: 104, top: 0, right: 444, bottom: 90 }, null), { x: 104, y: 98 }, 'the second place does not fit in the width');
});

// ---- the physics
test('the Ricker wavelet in depth has its peak at 0 and its zero crossings where the formula says', () => {
  assert.equal(S.heroSurveyRicker(0), 1);
  const zero = Math.SQRT1_2 / (Math.PI * S.HERO_SURVEY_FREQ * 2 / S.HERO_SURVEY_VEL);
  near(zero, 9.378, 1e-2);
  near(S.heroSurveyRicker(zero), 0, 1e-12);
  near(S.heroSurveyRicker(-zero), 0, 1e-12);
  assert.ok(S.heroSurveyRicker(zero * 0.5) > 0 && S.heroSurveyRicker(zero * 1.5) < 0, 'the sign changes at the crossing');
  assert.equal(S.heroSurveyRicker(7), S.heroSurveyRicker(-7), 'it is symmetric (zero phase)');
  assert.ok(S.heroSurveyRicker(0) > Math.abs(S.heroSurveyRicker(3)) && S.heroSurveyRicker(3) > S.heroSurveyRicker(6));
});

test('the wavelet samples stop where the tail is below 0.01, and the scales follow the section size', () => {
  const w = S.heroSurveyWavelet(3);
  assert.equal(w.taps.length, 2 * w.half + 1);
  assert.equal(w.taps[w.half], 1);
  assert.ok(Math.abs(w.taps[0]) < 0.01 && Math.abs(w.taps[w.taps.length - 1]) < 0.01);
  assert.ok(Math.abs(S.heroSurveyRicker((w.half - 1) * 3)) >= 0.01 || (w.half - 1) * 3 <= 20, 'the wavelet does not stop too early');
  assert.deepEqual(S.heroSurveyScales(1000, 580), { mv: 3, mh: 10 });
  const s = S.heroSurveyScales(1600, 420);
  near(s.mv, 3 * 580 / 420); near(s.mh, 6.25);
});

// A layer with a flat roof and a flat floor, in section units.
function flat(roof, floor) { return { roofL: new Float64Array(201).fill(roof), roofR: new Float64Array(201).fill(roof), floorL: new Float64Array(201).fill(floor), floorR: new Float64Array(201).fill(floor) }; }
function emptyFrame() { return { h: new Float32Array(201), hMax: new Float32Array(201), h2: new Float32Array(201), h2Max: new Float32Array(201), inventory: { injected: 1 } }; }
const layers = { storage: flat(300, 400), overlying: flat(100, 160) };
// Model parameters without the small changes and the residuals: a pure physical image. At 580 px high, 1 px is 3 m.
const plain = { real: false, residuals: false };
const W = 1000, H = 580, X = 500;
const wide = (thick, hMax = thick) => { const f = emptyFrame(); f.h.fill(thick, 60, 141); f.hMax.fill(hMax, 60, 141); return f; };
const column = (amp, x, a, b) => { const out = []; for (let y = a; y <= b; y++) out.push(amp[y * W + x]); return out; };
const peak = (amp, x, a, b) => Math.max(...column(amp, x, a, b).map(Math.abs));

test('a thick mobile column gives about 0.9 at its top (softening is positive) and -0.9 at its base', () => {
  const amp = S.heroSurveyAmplitude(wide(2), layers, W, H, 100, plain);
  assert.ok(amp instanceof Float32Array && amp.length === W * H);
  const top = Math.max(...column(amp, X, 296, 302)), base = Math.min(...column(amp, X, 326, 332));
  assert.ok(top > 0.85 && top < 0.95, `top ${top}`);
  assert.ok(base < -0.85 && base > -0.95, `base ${base}`);
  assert.equal(peak(amp, 150, 290, 420), 0, 'no CO2 in other columns');
  assert.equal(peak(amp, X, 0, 280), 0, 'nothing above the roof');
});

test('tuning: a thin column gives a smaller peak than a thick one, with no hand-made scaling', () => {
  const thick = peak(S.heroSurveyAmplitude(wide(2), layers, W, H, 100, plain), X, 290, 340);
  const thin = peak(S.heroSurveyAmplitude(wide(1 / 15), layers, W, H, 100, plain), X, 290, 340); // 3 m
  const middle = peak(S.heroSurveyAmplitude(wide(0.4), layers, W, H, 100, plain), X, 290, 340); // 18 m
  assert.ok(thin < 0.6 * thick, `thin ${thin} thick ${thick}`);
  assert.ok(thin < middle && middle > thick && middle < 2 * thick, `the tuning peak ${middle}`);
});

test('residual CO2 alone gives a weaker top than mobile CO2, in the ratio of the impedance changes', () => {
  const mobile = S.heroSurveyAmplitude(wide(2), layers, W, H, 100, plain);
  const residual = S.heroSurveyAmplitude(wide(0, 2), layers, W, H, 100, plain);
  const a = Math.max(...column(mobile, X, 296, 302)), b = Math.max(...column(residual, X, 296, 302));
  assert.ok(b < a);
  near(b / a, 0.07 / 0.12, 0.03);
});

test('push-down: a dipole at the floor of the aquifer under the plume, and nothing at the floor away from it', () => {
  const amp = S.heroSurveyAmplitude(wide(2), layers, W, H, 100, plain);
  // 90 m of CO2 is 30 px. The shift is 0.176 * 30 = 5.3 px.
  const up = Math.max(...column(amp, X, 396, 401)), down = Math.min(...column(amp, X, 402, 408));
  assert.ok(up > 0.4, `the old floor position ${up}`);
  assert.ok(down < -0.4, `the new floor position ${down}`);
  assert.equal(peak(amp, 150, 395, 412), 0, 'no dipole where there is no CO2');
  // A thicker column pushes the floor further down.
  const deeper = S.heroSurveyAmplitude(wide(3), layers, W, H, 100, plain);
  const at = a => { const c = column(a, X, 396, 420); return 396 + c.indexOf(Math.min(...c)); };
  assert.ok(at(deeper) > at(amp));
});

test('leaked CO2 in the overlying aquifer gives its own signal and its own push-down', () => {
  const f = emptyFrame(); f.h2.fill(2, 60, 141); f.h2Max.fill(2, 60, 141);
  const amp = S.heroSurveyAmplitude(f, layers, W, H, 100, plain);
  assert.ok(Math.max(...column(amp, X, 96, 102)) > 0.85);
  assert.ok(Math.min(...column(amp, X, 126, 132)) < -0.85);
  assert.ok(Math.min(...column(amp, X, 162, 170)) < -0.3, 'the push-down below the floor of the overlying aquifer');
});

test('pressure: a faint signal at the roof and the floor away from the plume during injection, and none after it', () => {
  const empty = emptyFrame(), far = 100; // 1 km from the left edge, 6 km from the well
  const during = S.heroSurveyAmplitude(empty, layers, W, H, 60, { ...plain, wellXPct: 70, pressure: r => HeroGeology.overpressure(r, 10, 30) });
  const after = S.heroSurveyAmplitude(empty, layers, W, H, 60, { ...plain, wellXPct: 70, pressure: r => HeroGeology.overpressure(r, 1000, 30) });
  const roof = Math.max(...column(during, far, 296, 302)), floor = Math.min(...column(during, far, 396, 402));
  assert.ok(roof > 0.01 && roof < 0.3, `roof ${roof}`);
  assert.ok(floor < -0.01 && floor > -0.3, `floor ${floor}`);
  assert.equal(peak(after, far, 0, 579), 0, 'no signal at year 1000');
  // More pressure near the well gives more signal. A pressure below 0.3 bar gives none.
  const strong = S.heroSurveyAmplitude(empty, layers, W, H, 60, { ...plain, pressure: () => 2 });
  const weak = S.heroSurveyAmplitude(empty, layers, W, H, 60, { ...plain, pressure: () => 0.25 });
  near(Math.max(...column(strong, far, 296, 302)), 0.06, 0.005);
  assert.equal(peak(weak, far, 0, 579), 0);
});

test('lateral blur: the edge of a plume spreads over the Fresnel zone, and a long reflector keeps its amplitude', () => {
  const amp = S.heroSurveyAmplitude(wide(2), layers, W, H, 100, plain);
  const at = x => Math.max(...column(amp, x, 296, 302));
  assert.ok(at(500) > 0.85);
  const edge = 300; // the first cell with CO2 starts at x = 300
  assert.ok(at(edge - 10) < 0.1 && at(edge + 10) > 0.8, 'the step is a few px wide');
  assert.ok(at(edge - 4) < at(edge) && at(edge) < at(edge + 4), 'the amplitude grows across the edge');
});

test('residual noise at the boundaries is weak, has a random sign, and changes with the year', () => {
  const f = emptyFrame();
  const a = S.heroSurveyAmplitude(f, layers, W, H, 100, { real: false, seed: 5, year: 10 });
  const b = S.heroSurveyAmplitude(f, layers, W, H, 100, { real: false, seed: 5, year: 25 });
  assert.ok(!same(a, b));
  let sum = 0, n = 0, pos = 0, neg = 0;
  for (let x = 100; x < W; x++) for (let y = 296; y <= 302; y++) { const v = a[y * W + x]; sum += v * v; n++; if (v > 0.01) pos++; if (v < -0.01) neg++; }
  const rms = Math.sqrt(sum / n);
  assert.ok(rms > 0.01 && rms < 0.1, `rms ${rms}`);
  assert.ok(pos > 100 && neg > 100, 'both signs');
  assert.equal(peak(a, 500, 200, 280), 0, 'nothing between the boundaries');
});

test('determinism: the same seed gives the same image, and another seed gives another image', () => {
  const f = wide(1.5, 2);
  const opts = { seed: 77, year: 10, wellXPct: 70, injectedFrac: 0.4 };
  const a = S.heroSurveyAmplitude(f, layers, W, H, 100, opts), b = S.heroSurveyAmplitude(f, layers, W, H, 100, opts);
  assert.ok(same(a, b));
  assert.ok(!same(a, S.heroSurveyAmplitude(f, layers, W, H, 100, { ...opts, seed: 78 })));
  const sc = S.heroSurveyScales(1600, 420);
  assert.ok(same(S.heroSurveyTile(sc, 9), S.heroSurveyTile(sc, 9)));
  const first = Float32Array.from(S.heroSurveyTile(sc, 9));
  assert.ok(!same(first, S.heroSurveyTile(sc, 10)));
  assert.ok(same(first, S.heroSurveyTile(sc, 9)), 'a rebuilt tile is the same');
  assert.equal(S.heroSurveySeed({ wellXPct: 70, K: 1.3, reservoirThickness: 150 }), S.heroSurveySeed({ wellXPct: 70, K: 1.3, reservoirThickness: 150 }));
  const r1 = S.heroSurveyRandom(3), r2 = S.heroSurveyRandom(3);
  assert.deepEqual([r1(), r1(), r1()], [r2(), r2(), r2()]);
});

test('the noise tile is periodic, band limited, and has an RMS of 0.07', () => {
  const sc = S.heroSurveyScales(1600, 420), tile = S.heroSurveyTile(sc, 123);
  assert.equal(tile.length, 256 * 256);
  let sum = 0;
  for (const v of tile) sum += v * v;
  near(Math.sqrt(sum / tile.length), 0.07, 1e-4);
  // The correlation of neighbours along x is high (60 m is about 10 px), and the same across the seam.
  const corr = (dx, wrap) => {
    let s = 0, a = 0, b = 0;
    for (let y = 0; y < 256; y++) for (let x = 0; x < (wrap ? 256 : 255); x++) { const p = tile[y * 256 + x], q = tile[y * 256 + ((x + dx) & 255)]; s += p * q; a += p * p; b += q * q; }
    return s / Math.sqrt(a * b);
  };
  assert.ok(corr(1, false) > 0.9, `lag 1: ${corr(1, false)}`);
  assert.ok(corr(1, true) > 0.9, 'the seam');
  assert.ok(corr(40, true) < 0.5, 'far apart, the values are not alike');
});

// ---- the real plume
const tilted = () => {
  const roof = Float64Array.from({ length: 201 }, (_, k) => 300 + 0.15 * k); // the roof is shallower on the left
  return { roofL: roof, roofR: roof, floorL: Float64Array.from(roof, r => r + 100), floorR: Float64Array.from(roof, r => r + 100) };
};
const W2 = 2000;
const extent = arr => { let a = -1, b = -1; for (let x = 0; x < arr.length; x++) if (arr[x] > 0) { if (a < 0) a = x; b = x; } return [a, b]; };

test('the real plume is wider by 2 to 5 percent on the updip side only, and the same on the other side', () => {
  const frame = emptyFrame(); frame.h.fill(1.5, 60, 141); frame.hMax.fill(2, 60, 141);
  const lay = { storage: tilted(), overlying: flat(100, 160) }, sc = S.heroSurveyScales(W2, H);
  const base = S.heroSurveyColumns(frame, lay, W2, H, { real: false, seed: 4, wellXPct: 70, injectedFrac: 1 }, sc);
  const real = S.heroSurveyColumns(frame, lay, W2, H, { real: true, seed: 4, wellXPct: 70, injectedFrac: 1 }, sc);
  const [a0, b0] = extent(base.sSw), [a1, b1] = extent(real.sSw), half = (b0 - a0 + 1) / 2;
  assert.equal(real.stretch.side, -1, 'the updip side is the left');
  assert.ok(real.eps >= 0.02 && real.eps <= 0.05);
  const grow = a0 - a1;
  assert.ok(grow >= 0.019 * half - 1 && grow <= 0.051 * half + 1, `the left edge moved ${grow} px of ${half}`);
  assert.ok(Math.abs(b1 - b0) <= 1, 'the right edge stays');
});

test('the real mobile column changes by at most 12 percent, with a smooth change along x', () => {
  const frame = wide(1.5, 2), lay = { storage: flat(300, 400), overlying: flat(100, 160) }, sc = S.heroSurveyScales(W, H);
  const base = S.heroSurveyColumns(frame, lay, W, H, { real: false, seed: 4, wellXPct: 70, injectedFrac: 1 }, sc);
  const real = S.heroSurveyColumns(frame, lay, W, H, { real: true, seed: 4, wellXPct: 70, injectedFrac: 0 }, sc);
  let biggest = 0, jump = 0, differs = false;
  for (let x = 320; x < 680; x++) {
    const ratio = real.sMob[x] / base.sMob[x];
    biggest = Math.max(biggest, Math.abs(ratio - 1));
    if (Math.abs(ratio - 1) > 0.005) differs = true;
    if (x > 320) jump = Math.max(jump, Math.abs(real.sMob[x] / base.sMob[x] - real.sMob[x - 1] / base.sMob[x - 1]));
  }
  assert.ok(biggest <= 0.1201, `the biggest change is ${biggest}`);
  assert.ok(differs, 'the column does change');
  assert.ok(jump < 0.02, `the change is smooth: ${jump}`);
});

test('three baffle layers sit at 30, 55 and 78 percent of the aquifer, with the peak thickness 8, 6 and 5 m', () => {
  const frame = wide(1.5, 2), lay = { storage: flat(300, 400), overlying: flat(100, 160) }, sc = S.heroSurveyScales(W, H);
  const run = (injectedFrac, f = frame) => S.heroSurveyColumns(f, lay, W, H, { real: true, seed: 4, wellXPct: 70, injectedFrac }, sc);
  const full = run(1), well = 700; // wellXPct 70 of 1000 px
  assert.equal(full.baf.length, 3);
  [[0.3, 8], [0.55, 6], [0.78, 5]].forEach(([at, thick], i) => {
    near(full.baf[i].row[well], 300 + at * 100, 1e-3);
    near(full.baf[i].thick[well], thick / 3, 0.02);
  });
  assert.ok(full.baf[0].thick[well - 100] > 0 && full.baf[0].thick[well - 100] < full.baf[0].thick[well], 'a parabolic taper');
  assert.equal(full.baf[2].thick[well - 100], 0, 'the third layer is shorter than the first');
  const early = run(0.25);
  near(early.baf[0].thick[well], full.baf[0].thick[well] / 4, 0.01);
  // The main column loses half of the layer thickness where a layer sits.
  const without = S.heroSurveyColumns(frame, lay, W, H, { real: true, seed: 4, wellXPct: 70, injectedFrac: 0 }, sc);
  assert.ok(full.sMob[well] < without.sMob[well] - 0.5 * (8 + 6 + 5) / 3 * 0.9);
  // Where the main column already reaches below a baffle (60 units here), the baffle layer is skipped.
  const deep = run(1, wide(4, 4));
  assert.equal(deep.baf[0].thick[well], 0); assert.equal(deep.baf[1].thick[well], 0);
  assert.ok(deep.baf[2].thick[well] > 0);
});

test('the real plume stays clearly the same plume as the model', () => {
  const frame = wide(1.5, 2), opts = { seed: 4, wellXPct: 70, injectedFrac: 1, residuals: false };
  const base = S.heroSurveyAmplitude(frame, layers, W, H, 100, { ...opts, real: false }), real = S.heroSurveyAmplitude(frame, layers, W, H, 100, { ...opts, real: true });
  assert.ok(!same(base, real));
  let s = 0, a = 0, b = 0;
  for (let i = 0; i < base.length; i++) { s += base[i] * real[i]; a += base[i] ** 2; b += real[i] ** 2; }
  const corr = s / Math.sqrt(a * b);
  assert.ok(corr > 0.7 && corr < 0.999, `correlation ${corr}`);
});

test('the heroSurveyColumns result skips plume values outside the plume, and the leaked CO2 is not changed', () => {
  const frame = emptyFrame(); frame.h2.fill(1, 80, 121); frame.h2Max.fill(1, 80, 121);
  const sc = S.heroSurveyScales(W, H), lay = { storage: flat(300, 400), overlying: flat(100, 160) };
  const real = S.heroSurveyColumns(frame, lay, W, H, { real: true, seed: 4, wellXPct: 70, injectedFrac: 1 }, sc);
  const base = S.heroSurveyColumns(frame, lay, W, H, { real: false, seed: 4, wellXPct: 70, injectedFrac: 1 }, sc);
  assert.equal(real.baf.length, 0, 'no storage plume, no baffles');
  assert.ok(same(real.oMob, base.oMob));
  assert.ok(real.sMob.every(v => v === 0));
});

test('the palette maps zero to the dark ground', () => {
  const table = S.heroSurveyPalette();
  assert.equal(table.length, 511);
  const bytes = i => [table[i] & 255, (table[i] >>> 8) & 255, (table[i] >>> 16) & 255, table[i] >>> 24];
  assert.deepEqual(bytes(255), [13, 18, 25, 238]);
  assert.deepEqual(bytes(510), [238, 243, 248, 238]);
  assert.deepEqual(bytes(0), [63, 127, 217, 238]);
});

test('the survey code never uses the global random generator and the wiring uses the seed of the geology', () => {
  assert.ok(!/Math\.random/.test(survey));
  assert.match(survey, /heroSurveySeed\(heroGeology\)/);
  assert.match(survey, /HeroGeology\.overpressure\(r, year, run\.injectionYears\)/);
});

// ---- the canvas and the wiring
test('the canvas is above the rock and below the annotations, the platform, the card and the player', () => {
  const r = rule('.hero-survey');
  assert.match(r, /z-index: 4;/);
  assert.match(r, /top: calc\(var\(--hero-waterline\) - 44px\);/);
  assert.match(r, /height: calc\(var\(--hero-water\) \+ var\(--hero-depth\) \+ 44px\);/);
  assert.match(r, /pointer-events: none;/);
  assert.ok(!/will-change/.test(r));
  assert.match(css, /\.hero-injection-flow \{ position: absolute; z-index: 3;/);
  assert.match(css, /\.hero-annotations \{ position: absolute; inset: 0; z-index: 5;/);
  assert.match(rule('.hero-leak-readout'), /z-index: 6;/);
  assert.match(rule('.hero-player'), /z-index: 9;/);
  assert.match(survey, /className="hero-survey" aria-hidden="true" data-survey-year=\{year\}/);
});

test('the fold ramp is one clipped image and one destination-out gradient, and the old strips are gone', () => {
  assert.ok(!/heroSurveyStrips|heroSurveyRevealed/.test(survey));
  assert.equal((survey.match(/ctx\.drawImage\(/g) || []).length, 1);
  assert.match(survey, /ctx\.globalCompositeOperation = 'destination-out';/);
  assert.match(survey, /ctx\.globalCompositeOperation = 'source-over';/);
  assert.match(survey, /createLinearGradient\(/);
  assert.ok(survey.indexOf("'destination-out'") < survey.indexOf('// Shots:'), 'the ramp comes before the shots and the ship');
  assert.ok(survey.indexOf("'destination-out'") < survey.indexOf('ship(heroSurveyShipX'));
});

test('the chip place is read from the two cards at most every 500 ms and on a resize', () => {
  assert.match(survey, /document\.querySelector\('\.hero-player'\)/);
  assert.match(survey, /document\.querySelector\('\.hero-leak-readout'\)/);
  assert.equal((survey.match(/querySelector\(/g) || []).length, 2, 'one read of each card, in one function');
  assert.match(survey, /now - size\.checked >= 0\.5/);
  assert.match(survey, /placeChip\(\);\s*size\.checked = -1;/, 'a resize reads again');
  assert.equal((survey.match(/placeChip\(\)/g) || []).length, 2, 'the resize and the throttled check');
});

test('the hero mounts the canvas only while a pass runs', () => {
  assert.match(hero, /\{survey && <HeroSurvey key=\{survey\.id\} /);
  assert.match(hero, /const \[survey, setSurvey\] = useState\(null\);/);
  assert.equal((hero.match(/<HeroSurvey /g) || []).length, 1);
  assert.match(hero, /setSurvey\(\{ year: crossed, id: surveyCount\.current \}\)/);
  assert.match(hero, /if \(pass\.u >= HERO_SURVEY_TOTAL\) \{ surveyRef\.current = [^;]*; setSurvey\(null\); \}/);
});

test('a scrub, a restart and a replay from the end cancel the pass, and the next survey builds only when no pass runs', () => {
  assert.match(hero, /scrub: value => \{[^}]*cancelSurvey\(\);/);
  assert.match(hero, /restart: \(\) => \{[^}]*cancelSurvey\(\);[^}]*surveyCount\.current = 0;/);
  assert.match(hero, /if \(!playing && yearRef\.current >= HERO_YEARS\) \{ setYear\(0\); cancelSurvey\(\); surveyCount\.current = 0; \}/, 'a replay from the end starts the passes again left to right');
  assert.match(hero, /const nextSurvey = survey \? null : heroSurveyNext\(year\);/);
  assert.match(hero, /useEffect\(\(\) => heroSurveyPrepare\(run, nextSurvey, sectionRef\), \[run, nextSurvey\]\);/);
});

test('the clock multiplies the year step by the survey factor and only a crossing step starts a pass', () => {
  assert.match(hero, /yearsPerSecond\(yearRef\.current, injectionEnd\) \* speed \* pass\.factor\)/);
  assert.match(hero, /const crossed = pass\.active \? null : heroSurveyCrossing\(yearRef\.current, next\);/);
  assert.match(hero, /pass\.u \+= dt \* speed;/);
  assert.match(hero, /pass\.factor = heroSurveyClock\(pass\.u\);/);
  assert.match(hero, /if \(next >= HERO_YEARS\) \{ surveyRef\.current = \{ active: false/);
});

test('the factor cuts the droplet emission of the leak flow and of the injection flow, and not the droplet speed', () => {
  assert.match(hero, /update\(i, frame, dt \* L\.speed, dt \* L\.surveyRef\.current\.factor, /);
  assert.match(hero, /carry \+ HERO_INJ_RATE \* speed \* dt \* emitScale/);
  assert.match(hero, /engine\.tick\(dt, live\.current\.injecting, live\.current\.speed, live\.current\.surveyRef\.current\.factor\)/);
  assert.match(hero, /<HeroLeakFlow [^]*?surveyRef=\{surveyRef\} \/>/);
  assert.match(hero, /<HeroInjectionFlow [^>]*surveyRef=\{surveyRef\} \/>/);
});

test('the survey loop runs at 30 fps at most and only while the clock ticks', () => {
  assert.equal(S.HERO_SURVEY_FRAME_MS, 30);
  assert.match(survey, /const running = heroShouldTick\(\{ playing, visible, hidden \}\);/);
  assert.match(survey, /if \(last && now - last < HERO_SURVEY_FRAME_MS\) return;/);
  assert.match(survey, /if \(!running\) \{\s*if \(engineRef\.current\) engineRef\.current\.paint\([^\n]*\n\s*return undefined;/);
});

test('no animation loop runs when idle, and no frame costs a state update or a number format', () => {
  assert.equal((survey.match(/requestAnimationFrame\(/g) || []).length, 2, 'one loop (start and repeat), in the component, after the still-frame return');
  assert.ok(survey.indexOf('requestAnimationFrame(') > survey.indexOf('if (!running) {'));
  assert.ok(!/requestAnimationFrame/.test(hero.slice(hero.indexOf('{survey && <HeroSurvey'), hero.indexOf('{survey && <HeroSurvey') + 300)));
  assert.ok(!/toLocaleString/.test(survey));
  assert.ok(!/useState|setState/.test(survey), 'the component keeps no state');
  assert.ok(/requestIdleCallback/.test(survey) && /setTimeout\(fn, 250\)/.test(survey), 'idle build with a fallback');
  assert.match(survey, /Math\.min\(1\.5, window\.devicePixelRatio/);
  assert.ok(!/will-change/.test(survey));
});

test('the image build is capped at 1600 px, and the store holds one image that the pass drops', () => {
  assert.match(survey, /Math\.min\(HERO_SURVEY_MAX_WIDTH, Math\.round\(rect\.width\)\)/);
  assert.match(survey, /const HERO_SURVEY_MAX_WIDTH = 1600;/);
  assert.match(survey, /Object\.assign\(heroSurveyStore, \{ run: null, year: null, image: null/);
  assert.equal((survey.match(/heroSurveyStore\.image = /g) || []).length, 1, 'only one place stores an image');
});

test('the only text is the chip, and reduced motion shows the image with no ship and no shots', () => {
  assert.match(survey, /const label = `4D survey · year \$\{year\}`;/);
  assert.equal((survey.match(/fillText\(/g) || []).length, 1);
  assert.match(survey, /if \(reduced \|\| heroSurveyChipShown\(size\.chipX, size\.chipW, gun, dir, L\)\) chip\(fade\);/);
  assert.match(survey, /if \(reduced\) return;\s*\/\/ Shots/);
  assert.match(survey, /const gun = reduced \?/);
});

test('the reflected fronts draw only when the plume exists, with 0.7 of the alpha of the down-going front', () => {
  assert.match(survey, /size\.echo = plume \? \{/);
  assert.match(survey, /if \(echo\) \{/);
  assert.match(survey, /\(0\.7 \* a\)\.toFixed\(3\)/);
});

test('the hidden description names the survey years', () => {
  assert.match(hero, /Four-dimensional seismic surveys image the CO2 at years 10, 25 and 1000\./);
});

test('the shared constants match the hero constants', () => {
  assert.equal(S.HERO_SURVEY_UNIT, Number(hero.match(/const HERO_UNIT = (\d+);/)[1]));
});

test('HeroSurvey.jsx is built after HeroWaterLive.jsx and before SubsurfaceHero.jsx', () => {
  const a = build.indexOf("'HeroWaterLive.jsx'"), b = build.indexOf("'HeroSurvey.jsx'"), c = build.indexOf("'SubsurfaceHero.jsx'");
  assert.ok(a > 0 && a < b && b < c);
});

test('every top-level name in the survey file has the survey prefix', () => {
  const names = [...survey.matchAll(/^(?:const|let|var|function) ([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
  assert.ok(names.length > 20);
  for (const name of names) assert.match(name, /^(?:heroSurvey|HERO_SURVEY|HeroSurvey)/);
});

test('the README names the survey and its years', () => {
  assert.match(readme, /\*\*4D survey \(`HeroSurvey\.jsx`\)\.\*\*/);
  assert.match(readme, /At years 10, 25 and 1000/);
});

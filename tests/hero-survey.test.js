// The 4D seismic survey of the hero: the schedule, the clock factor, the image amplitude, the canvas rules and the wiring.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const hero = read('SubsurfaceHero.jsx');
const survey = read('HeroSurvey.jsx');
const css = read('colors_and_type.css');
const build = read('build.js');
const readme = read('README.md');

const block = survey.slice(survey.indexOf('// ---- hero survey helpers'), survey.indexOf('// ---- end hero survey helpers'));
const S = new Function(`${block}
return { HERO_SURVEY_YEARS, HERO_SURVEY_CROSS, HERO_SURVEY_HOLD, HERO_SURVEY_FADE, HERO_SURVEY_TOTAL, HERO_SURVEY_SHOT, HERO_SURVEY_SLOW, HERO_SURVEY_JUMP, HERO_SURVEY_UNIT,
  HERO_SURVEY_FRAME_MS, heroSurveyClock, heroSurveyCrossing, heroSurveyNext, heroSurveyDirection, heroSurveyFade, heroSurveyShipX, heroSurveyLeft, heroSurveyStrips,
  heroSurveyRevealed, heroSurveyAmplitude, heroSurveyNoise, heroSurveyPalette };`)();

const rule = selector => {
  const at = css.indexOf(`${selector} {`);
  assert.ok(at >= 0, `${selector} exists`);
  return css.slice(at, css.indexOf('}', at));
};
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} is close to ${b}`);

test('the schedule has three surveys during injection, then fewer', () => {
  assert.deepEqual(S.HERO_SURVEY_YEARS, [5, 15, 25, 200, 1000]);
  assert.equal(S.HERO_SURVEY_YEARS.filter(y => y <= 30).length, 3);
  const gaps = S.HERO_SURVEY_YEARS.slice(1).map((y, i) => y - S.HERO_SURVEY_YEARS[i]);
  assert.ok(gaps.every((g, i) => i === 0 || g >= gaps[i - 1]), 'the gaps do not shrink');
});

test('the pass has a cross, a hold and a fade, and a shot every 0.45 s', () => {
  assert.equal(S.HERO_SURVEY_CROSS, 4.5);
  assert.equal(S.HERO_SURVEY_HOLD, 1.4);
  assert.equal(S.HERO_SURVEY_FADE, 0.8);
  near(S.HERO_SURVEY_TOTAL, 6.7);
  assert.equal(S.HERO_SURVEY_SHOT, 0.45);
});

test('the clock factor is 1 when idle, eases to 0.06 in 0.3 s, holds, and eases back during the fade', () => {
  assert.equal(S.heroSurveyClock(0), 1);
  assert.equal(S.heroSurveyClock(-1), 1);
  near(S.heroSurveyClock(0.15), 1 - 0.94 * 0.5);
  near(S.heroSurveyClock(0.3), 0.06);
  assert.equal(S.heroSurveyClock(2), 0.06);
  near(S.heroSurveyClock(5.9), 0.06);
  near(S.heroSurveyClock(5.9 + 0.4), 0.06 + 0.94 * 0.5);
  assert.equal(S.heroSurveyClock(6.7), 1);
  assert.equal(S.heroSurveyClock(20), 1);
  let last = 1;
  for (let u = 0; u <= 0.3; u += 0.03) { const f = S.heroSurveyClock(u); assert.ok(f <= last + 1e-12); last = f; }
});

test('playback that crosses a survey year starts a pass, and the step ends at that year', () => {
  assert.equal(S.heroSurveyCrossing(4.8, 5.2), 5);
  assert.equal(S.heroSurveyCrossing(4.8, 5), 5);
  assert.equal(S.heroSurveyCrossing(5, 5.2), null, 'a step from the year does not start again');
  assert.equal(S.heroSurveyCrossing(1, 2), null);
  assert.equal(S.heroSurveyCrossing(14, 16), 15);
  assert.equal(S.heroSurveyCrossing(10, 30), 15, 'the first year in the step wins');
});

test('a jump never starts a pass', () => {
  assert.equal(S.heroSurveyCrossing(0, 200), null);
  assert.equal(S.heroSurveyCrossing(0, 31), null);
  assert.equal(S.heroSurveyCrossing(0, 30), 5);
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
  assert.deepEqual(run(), [5, 15, 25, 200, 1000]);
  assert.deepEqual(run(), [5, 15, 25, 200, 1000], 'a restart from year 0 lets all of them happen again');
});

test('the next survey is the first year after the current year', () => {
  assert.equal(S.heroSurveyNext(0), 5);
  assert.equal(S.heroSurveyNext(5), 15);
  assert.equal(S.heroSurveyNext(26), 200);
  assert.equal(S.heroSurveyNext(1000), null);
  assert.equal(S.heroSurveyNext(1500), null);
});

test('the passes alternate: left to right first, then right to left', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(S.heroSurveyDirection), [1, -1, 1, -1, 1]);
  assert.equal(S.heroSurveyShipX(0, 1, 1000), -60);
  assert.equal(S.heroSurveyShipX(4.5, 1, 1000), 1080);
  assert.equal(S.heroSurveyShipX(0, -1, 1000), 1060);
  assert.equal(S.heroSurveyShipX(4.5, -1, 1000), -80);
  assert.equal(S.heroSurveyShipX(9, 1, 1000), 1080, 'the ship stays at the end');
});

test('the image fades only after the hold', () => {
  assert.equal(S.heroSurveyFade(0), 1);
  assert.equal(S.heroSurveyFade(5.9), 1);
  near(S.heroSurveyFade(6.3), 0.5);
  near(S.heroSurveyFade(6.7), 0);
});

test('the reveal has a solid block and four soft strips behind the gun point', () => {
  const right = S.heroSurveyStrips(600, 1, 100, 1000);
  assert.deepEqual(right[0], { x: 100, w: 476, a: 1 });
  assert.equal(right.length, 5);
  assert.deepEqual(right.slice(1).map(s => s.x), [576, 582, 588, 594]);
  assert.deepEqual(right.slice(1).map(s => s.a.toFixed(1)), ['0.8', '0.6', '0.4', '0.2']);
  const left = S.heroSurveyStrips(400, -1, 100, 1000);
  assert.deepEqual(left[0], { x: 424, w: 576, a: 1 });
  assert.deepEqual(left.slice(1).map(s => s.x), [418, 412, 406, 400]);
  assert.deepEqual(S.heroSurveyStrips(1024, 1, 100, 1000)[0], { x: 100, w: 900, a: 1 }, 'a finished pass shows all');
  assert.deepEqual(S.heroSurveyStrips(-24, -1, 100, 1000)[0], { x: 100, w: 900, a: 1 });
  assert.deepEqual(S.heroSurveyStrips(50, 1, 100, 1000), [], 'nothing shows before the gun point reaches the axis');
  assert.equal(S.heroSurveyLeft(1440), 100);
  assert.equal(S.heroSurveyLeft(390), 62);
  assert.equal(S.heroSurveyRevealed(340, 1, 100, 1000), 240);
  assert.equal(S.heroSurveyRevealed(760, -1, 100, 1000), 240);
});

// A layer with a flat roof and a flat floor, in section units.
const flat = (roof, floor) => ({ roofL: new Float64Array(201).fill(roof), roofR: new Float64Array(201).fill(roof), floorL: new Float64Array(201).fill(floor), floorR: new Float64Array(201).fill(floor) });
const layers = { storage: flat(300, 400), overlying: flat(100, 160) };
const emptyFrame = () => ({ h: new Float32Array(201), hMax: new Float32Array(201), h2: new Float32Array(201), h2Max: new Float32Array(201) });

test('the amplitude has a positive peak at the roof of the CO2 and a negative peak at its base', () => {
  const frame = emptyFrame();
  frame.h[100] = 2; frame.hMax[100] = 2; // 30 units of mobile CO2 under the roof
  const W = 1000, H = 580, x = 502;
  const amp = S.heroSurveyAmplitude(frame, layers, W, H, 100);
  assert.ok(amp instanceof Float32Array && amp.length === W * H);
  assert.ok(amp[300 * W + x] > 0.95, 'roof');
  assert.ok(amp[330 * W + x] < -0.5, 'base');
  assert.ok(amp[307 * W + x] < 0, 'the first inner swing is negative');
  assert.ok(amp[342 * W + x] > 0.15, 'the push-down below the base');
  assert.equal(amp[300 * W + 300], 0, 'no CO2 in other columns');
  assert.equal(amp[100 * W + x], 0, 'nothing above the roof');
});

test('residual CO2 alone gives about 0.45 of the mobile amplitude', () => {
  const mobile = emptyFrame(), residual = emptyFrame();
  mobile.h[100] = 2; mobile.hMax[100] = 2;
  residual.hMax[100] = 2;
  const a = S.heroSurveyAmplitude(mobile, layers, 1000, 580, 100), b = S.heroSurveyAmplitude(residual, layers, 1000, 580, 100);
  near(b[300 * 1000 + 502] / a[300 * 1000 + 502], 0.45, 0.02);
});

test('leaked CO2 in the overlying aquifer gives 0.95 of the amplitude', () => {
  const frame = emptyFrame();
  frame.h2[100] = 2; frame.h2Max[100] = 2;
  const amp = S.heroSurveyAmplitude(frame, layers, 1000, 580, 100);
  assert.ok(amp[100 * 1000 + 502] > 0.9 && amp[100 * 1000 + 502] < 1.0);
  assert.ok(amp[130 * 1000 + 502] < -0.4);
});

test('the amplitude works in CSS pixels of the section and skips the axis', () => {
  const frame = emptyFrame();
  frame.h.fill(2); frame.hMax.fill(2);
  const W = 500, H = 290; // half size: 300 units are 150 px
  const amp = S.heroSurveyAmplitude(frame, layers, W, H, 60);
  assert.ok(amp[150 * W + 300] > 0.95);
  assert.ok(amp[165 * W + 300] < -0.5);
  assert.equal(amp[150 * W + 30], 0, 'left of the image edge');
  const none = S.heroSurveyAmplitude(emptyFrame(), layers, 100, 100, 0);
  assert.ok(none.every(v => v === 0));
});

test('the noise tile is faint and the palette maps zero to the dark ground', () => {
  const noise = S.heroSurveyNoise();
  assert.equal(noise.length, 128 * 128);
  assert.ok(noise.every(v => Math.abs(v) <= 0.07));
  const table = S.heroSurveyPalette();
  assert.equal(table.length, 511);
  const bytes = i => [table[i] & 255, (table[i] >>> 8) & 255, (table[i] >>> 16) & 255, table[i] >>> 24];
  assert.deepEqual(bytes(255), [13, 18, 25, 238]);
  assert.deepEqual(bytes(510), [238, 243, 248, 238]);
  assert.deepEqual(bytes(0), [63, 127, 217, 238]);
});

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
  assert.match(survey, /className="hero-survey" aria-hidden="true" data-survey-year=\{year\}/);
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
  assert.match(hero, /if \(!playing && yearRef\.current >= HERO_YEARS\) \{ setYear\(0\); cancelSurvey\(\); \}/);
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
  assert.match(survey, /if \(reduced \|\| heroSurveyRevealed\(edge, dir, left, w\) >= 240\) chip\(/);
  assert.match(survey, /if \(reduced\) return;\s*\/\/ Shots/);
  assert.match(survey, /const edge = reduced \?/);
});

test('the hidden description names the survey years', () => {
  assert.match(hero, /Four-dimensional seismic surveys image the CO2 at years 5, 15, 25, 200 and 1000\./);
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

test('the README names the survey', () => {
  assert.match(readme, /\*\*4D survey \(`HeroSurvey\.jsx`\)\.\*\*/);
});

// The player and the fault card of the hero: the scrubber map, the badge, the end state and the card states.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'SubsurfaceHero.jsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'colors_and_type.css'), 'utf8');
const between = (a, b) => source.slice(source.indexOf(a), source.indexOf(b));
const P = new Function(`${between('// ---- hero player helpers', '// ---- end hero player helpers')}
return { HERO_SCRUB_MAX, HERO_SCRUB_BREAK, heroYearToScrub, heroScrubToYear, heroReceiptTime, heroReceiptText, heroReceiptBadge };`)();
const L = new Function(`${between('// ---- hero leak helpers', '// ---- end hero leak helpers')}
return { heroLeakLine, heroLeakHold, heroLeakMode, heroLeakTitle, heroLeakStarted, heroLeakBandStops, heroLeakGauge, HERO_BREACH_MS };`)();

test('the scrubber maps the injection years to the first fifth and round trips', () => {
  assert.equal(P.heroYearToScrub(0, 30, 2000), 0);
  assert.equal(P.heroYearToScrub(30, 30, 2000), 200, 'the break is at 20 %');
  assert.equal(P.heroYearToScrub(2000, 30, 2000), 1000);
  assert.equal(P.heroYearToScrub(15, 30, 2000), 100);
  assert.equal(P.heroScrubToYear(200, 30, 2000), 30);
  assert.equal(P.heroScrubToYear(1000, 30, 2000), 2000);
  for (const year of [0, 7, 29.5, 30, 31, 45, 600, 1999, 2000]) {
    const back = P.heroScrubToYear(P.heroYearToScrub(year, 30, 2000), 30, 2000);
    assert.ok(Math.abs(back - year) < 1e-9, `year ${year}: ${back}`);
  }
  assert.equal(P.heroYearToScrub(5000, 30, 2000), 1000, 'the year is clamped');
  assert.equal(P.heroScrubToYear(-5, 30, 2000), 0);
  assert.equal(P.heroYearToScrub(1000, 0, 2000), 500, 'no injection, a straight line');
});

test('the band stops follow the scrub space', () => {
  const faults = 2, years = 100, peak = 4, first = 45;
  const flow = new Float32Array((years + 1) * faults);
  for (let y = first; y <= 80; y++) flow[y * faults + 1] = peak;
  const toScrub = y => P.heroYearToScrub(y, 30, years);
  const stops = L.heroLeakBandStops(flow, faults, years, peak, first, 20, toScrub);
  assert.equal(stops[0].at, 0);
  assert.equal(stops[stops.length - 1].at, 100);
  const at60 = 100 * (toScrub(60) - toScrub(first)) / (1000 - toScrub(first));
  assert.ok(stops.some(s => Math.abs(s.at - at60) < 0.06), 'a stop at year 60 sits at its scrub position');
  const linear = L.heroLeakBandStops(flow, faults, years, peak, first).map(s => s.at);
  assert.deepEqual(L.heroLeakBandStops(flow, faults, years, peak, first, 20, y => y).map(s => s.at), linear, 'a linear map is the default');
  assert.match(source, /left: `\$\{heroFixed\(100 \* toScrub\(first\) \/ HERO_SCRUB_MAX\)\}%`/, 'the first-leak tick uses the scrub position');
});

test('the scrubber input, the tick and the label use the scrub space', () => {
  assert.match(source, /max=\{HERO_SCRUB_MAX\}/);
  assert.match(source, /value=\{Math\.round\(heroYearToScrub\(year, injectionYears, HERO_YEARS\)\)\}/);
  assert.match(source, /controls\.scrub\(heroScrubToYear\(parseFloat\(event\.target\.value\), injectionYears, HERO_YEARS\)\)/);
  assert.match(source, /aria-valuetext=\{`Year \$\{shownYear\}, \$\{phase\}\$\{leak \? `, F\$\{leak\.fault \+ 1\} leaking` : ''\}`\}/, 'the spoken value stays in years');
  assert.match(source, /\{Math\.round\(injectionYears\)\} yr<\/span>/);
  assert.match(css, /\.hero-player__injtick \{[^}]*left: 20%/);
  assert.match(css, /\.hero-player__injlabel \{[^}]*left: 20%[^}]*top: -9px/);
});

test('the badge reads the years and the time, and the sentence stays for screen readers', () => {
  assert.equal(P.heroReceiptBadge(2000, 200), '2,000 yr · 0.2 s');
  assert.equal(P.heroReceiptBadge(2000, 20), '2,000 yr · under 0.1 s');
  assert.equal(P.heroReceiptText(2000, 200), 'This model ran 2,000 years in 0.2 s in your browser.');
  assert.equal(P.heroReceiptText(2000, 10), 'This model ran 2,000 years in under 0.1 s in your browser.');
  assert.doesNotMatch(source.match(/const heroReceiptText = [\s\S]*?\n};/)[0], /100×/);
  assert.match(source, /<span aria-hidden="true">\{heroReceiptBadge\(run\.years, run\.computeMs\)\}<\/span>/);
  assert.match(source, /<span className="visually-hidden">\{heroReceiptText\(run\.years, run\.computeMs\)\}<\/span>/);
  assert.doesNotMatch(source, /<p className="hero-player__receipt"/);
  assert.match(css, /\.hero-player__badge \{[^}]*var\(--sim-font-mono\)[^}]*\}/);
  assert.match(css, /\.hero-player__badge \{[^}]*color: var\(--hero-accent\)/);
  assert.match(css, /\.hero-player__badge \{[^}]*border: 1px solid/);
});

test('the end state reads "complete" and shows the simulator link only at the end', () => {
  assert.match(source, /const done = year >= HERO_YEARS;/);
  assert.match(source, /const phase = done \? 'complete' : heroPhase\(year, injectionYears, ship\);/);
  assert.match(source, /\{done && <a className="hero-player__cta" href="\.\/simulator\.html">Run your own case in the VE simulator →<\/a>\}/);
  assert.match(css, /\.hero-player__cta \{[^}]*color: var\(--hero-accent\)/);
  assert.match(source, /Teaching model: a schematic saline aquifer, 10 km wide, vertical exaggeration ×\{exaggeration\}\. The depleted-gas model is in the 2026 preprint\./);
});

const barPerHead = 1.77;
const noOver = () => 0;
test('a fault that holds shows the largest push against its seal limit', () => {
  const faults = [{ h: 0.5, distance: 100, entry: 3 }, { h: 0.3, distance: 200, entry: 0.5 }];
  const hold = L.heroLeakHold(faults, 100, 30, barPerHead, noOver);
  assert.deepEqual(hold, { fault: 1, state: 'holding', buoyancy: 0.5, overpressure: 0, entry: 0.5 }, 'F2 has the larger push over its seal limit');
  assert.equal(L.heroLeakHold([{ h: 0.002, distance: 1, entry: 1 }, { h: 0, distance: 1, entry: 1 }], 100, 30, barPerHead, noOver), null, 'no CO2 at a fault, no card');
  const withOver = L.heroLeakHold([{ h: 1, distance: 50, entry: 3 }], 10, 30, barPerHead, (r, y, inj) => (r === 50 && y === 10 && inj === 30 ? 0.84 : 0));
  assert.deepEqual(withOver, { fault: 0, state: 'holding', buoyancy: 1.8, overpressure: 0.8, entry: 3 });
});

test('the card line uses "seal limit" in all three states', () => {
  assert.equal(L.heroLeakLine({ state: 'holding', buoyancy: 0.2, overpressure: 0, entry: 0.3 }), 'Buoyancy 0.2 bar < seal limit 0.3 bar');
  assert.equal(L.heroLeakLine({ state: 'holding', buoyancy: 0.2, overpressure: 0.4, entry: 1.3 }), 'Buoyancy 0.2 bar + overpressure 0.4 bar < seal limit 1.3 bar');
  assert.equal(L.heroLeakLine({ state: 'above', buoyancy: 6.8, overpressure: 0, entry: 0.2 }), 'Buoyancy 6.8 bar > seal limit 0.2 bar');
  assert.equal(L.heroLeakLine({ state: 'above', buoyancy: 0.02, overpressure: 1, entry: 0.2 }), 'Buoyancy < 0.1 bar + overpressure 1 bar > seal limit 0.2 bar');
  assert.equal(L.heroLeakLine({ state: 'held', buoyancy: 0.2, overpressure: 0, entry: 0.2 }), 'Buoyancy held at the 0.2 bar seal limit');
  assert.equal(L.heroLeakLine({ state: 'held', buoyancy: 0.2, overpressure: 1, entry: 1.2 }), 'Buoyancy + overpressure held at the 1.2 bar seal limit');
});

test('the card is holding, breaching or leaking, with its own title and colour', () => {
  const holding = { fault: 1, state: 'holding' }, leaking = { fault: 1, state: 'above' };
  assert.equal(L.heroLeakMode(holding, -1), 'holding');
  assert.equal(L.heroLeakMode(leaking, -1), 'leaking');
  assert.equal(L.heroLeakMode(leaking, 1), 'breaching');
  assert.equal(L.heroLeakMode(leaking, 0), 'leaking', 'another fault is breaching');
  assert.equal(L.heroLeakTitle(holding, 'holding'), 'F2 holding');
  assert.equal(L.heroLeakTitle(leaking, 'breaching'), 'F2 breaching');
  assert.equal(L.HERO_BREACH_MS, 1200);
  assert.match(css, /\.hero-leak-readout--holding strong \{ color: var\(--hero-accent\); \}/);
  assert.match(css, /\.hero-leak-readout strong \{ color: var\(--sim-glow-leaked\)/, 'leaking and breaching stay amber');
  assert.match(css, /\.hero-leak-readout--holding \.hero-leak-gauge__b \{ background: var\(--hero-accent\); \}/);
  assert.match(css, /\.hero-leak-readout--breaching \{/);
  assert.match(source, /className=\{`hero-leak-readout hero-leak-readout--\$\{mode\}`\} aria-hidden="true"/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.hero-leak-readout \{ display: none; \}/);
});

test('a breach starts only from playback', () => {
  assert.deepEqual(L.heroLeakStarted([0, 0], [0, 1]), [1]);
  assert.deepEqual(L.heroLeakStarted([0, 1], [0, 2]), [], 'a fault that already leaks does not start');
  assert.deepEqual(L.heroLeakStarted(null, [0, 0]), []);
  assert.match(source, /flows && playing \? heroLeakStarted\(flowsRef\.current, flows\) : \[\]/, 'a paused scrub never starts it');
  assert.match(source, /scrub: value => \{[^}]*clearBreach\(\)/);
  assert.match(source, /restart: \(\) => \{[^}]*clearBreach\(\)/);
});

test('the bar has labels and a scale for a fault that never leaks', () => {
  assert.match(source, /hero-leak-gauge__push">push<\/b>/);
  assert.match(source, /▼ seal limit<\/b>/);
  assert.match(css, /\.hero-leak-gauge \.hero-leak-gauge__label \{[^}]*font: 400 10px/);
  assert.match(source, /const leaks = firstLeakYears\[i\] >= 0;/);
  assert.match(source, /if \(!leaks\) sums\.push\(heroGeology\.faults\[i\]\.entryPressure\);/);
});

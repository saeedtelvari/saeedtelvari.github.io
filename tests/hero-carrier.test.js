// The CO2 carrier, the transfer hose and the well in the hero: arrival time, shut-in at the end of injection,
// the label of the carrier and the injection droplets.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'SubsurfaceHero.jsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'colors_and_type.css'), 'utf8');
const block = source.slice(source.indexOf('// ---- hero playback helpers'), source.indexOf('// ---- end hero playback helpers'));
const H = new Function(`${block}
return { HERO_SHIP_SECONDS, HERO_SHUTIN_SECONDS, heroShipStep, heroShutIn, heroShutStyle, heroShutCore };`)();
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);

test('the carrier arrives in 2.2 s', () => {
  assert.equal(H.HERO_SHIP_SECONDS.arriving, 2.2);
  let ship = { phase: 'away', p: 1 }, t = 0;
  while (ship.phase !== 'connecting' && t < 20) { ship = H.heroShipStep(ship, 0.01, true); t += 0.01; }
  assert.ok(Math.abs(t - 2.2) < 0.05, `arrival took ${t.toFixed(2)} s`);
});

test('the pulses and the hose ease out over 0.8 s of real time', () => {
  const at = s => H.heroShutIn(30, 30, s);
  const start = at(0), mid = at(0.4), end = at(0.8);
  near(start.speed, 1, 'full pulse speed at shut-in'); near(start.hose, 1, 'full hose'); near(start.dim, 0, 'bright tubing');
  near(mid.speed, 0.25, 'quarter speed at 0.4 s'); near(mid.hose, 0.5, 'half hose at 0.4 s'); near(mid.dim, 0.5, 'half dim at 0.4 s');
  near(end.speed, 0, 'stopped at 0.8 s'); near(end.hose, 0, 'empty hose'); near(end.dim, 1, 'dim tubing');
  assert.equal(end.tubing, 'dim');
  assert.equal(mid.tubing, 'settling');
  let last = 2;
  for (let s = 0; s <= 0.8; s += 0.05) { const v = at(s).speed; assert.ok(v <= last + 1e-12, 'the speed only falls'); last = v; }
  assert.ok(at(0.8).travel > at(0.4).travel && at(0.4).travel > 0, 'the pulses still travel while they slow');
  near(at(0.8).travel, 0.8 / 3, 'the pulses travel a third of 0.8 s at full speed');
});

test('a scrub or a restart sets the end state at once', () => {
  for (const year of [30, 31, 100, 400]) {
    const state = H.heroShutIn(year, 30);
    assert.equal(state.tubing, 'dim');
    assert.equal(state.speed, 0);
    assert.equal(state.hose, 0);
    assert.equal(state.dim, 1);
  }
  assert.equal(H.heroShutIn(100, 30, 5).tubing, 'dim', 'later than 0.8 s is the end state too');
});

test('injection before year 30 is as before, whatever the seconds say', () => {
  for (const s of [undefined, 0, 0.4, 3]) {
    const state = H.heroShutIn(29.99, 30, s);
    assert.deepEqual(state, { speed: 1, travel: 0, hose: 1, dim: 0, tubing: 'flowing' });
  }
});

test('the dim tubing has no glow and a dim core, and the bright tubing keeps its class look', () => {
  assert.equal(H.heroShutStyle(0), undefined);
  assert.equal(H.heroShutStyle(1).filter, 'none');
  near(H.heroShutCore(1).strokeOpacity, 0.35, 'the dim core is at 35 percent');
  assert.equal(H.heroShutCore(0), undefined);
});

test('the shut-in keeps the carrier connected until the hose is empty, and a pause or a scrub ends it at once', () => {
  assert.match(source, /heroShipStep\(shipRef\.current, dt, injecting \|\| shutRef\.current < HERO_SHUTIN_SECONDS, shipSeconds\)/);
  assert.match(source, /A pause stops the shut-in fade at once/);
  assert.match(source, /A scrub sets the end state at once/);
  assert.match(source, /heroFlowPhase\(injectionYears\) \+ shut\.travel \* shutRate/, 'the tubing stays filled after shut-in');
});

test('the carrier label sits in the ship group and is decorative', () => {
  const ship = source.slice(source.indexOf('const HeroShip = ('), source.indexOf('const HeroShipBody'));
  const group = ship.slice(ship.indexOf('<g className="hero-ship"'), ship.indexOf('</g>', ship.indexOf('<HeroShipBody />')));
  assert.match(group, /<text className="hero-ship__label"[^>]*aria-hidden="true">CO₂ carrier<\/text>/);
  const rule = css.match(/\.hero-ship__label \{[^}]*\}/)[0];
  assert.match(rule, /var\(--sim-ink-muted, #9fb0c0\)/);
  assert.match(rule, /var\(--sim-font-ui\)/);
  assert.match(css, /@media \(max-width: 931px\) \{ \.hero-ship__label \{ display: none; \} \}/, 'hidden where it would render under 8 px');
});

test('the injection droplets run only while CO2 flows, playback runs, the hero is visible, the tab is shown and motion is allowed', () => {
  const comp = source.slice(source.indexOf('const HeroInjectionFlow ='), source.indexOf('/* ====', source.indexOf('const HeroInjectionFlow =')));
  assert.match(comp, /const canRun = !reduced && heroShouldTick\(\{ playing, visible, hidden \}\);/);
  assert.match(comp, /const go = canRun && \(injecting \|\| tail\);/);
  assert.match(comp, /if \(!go\) return undefined;/);
  assert.match(comp, /now - last < HERO_LEAK_FRAME_MS/, 'at most 30 fps');
  assert.match(comp, /engine\.tick\(dt, live\.current\.injecting, live\.current\.speed, live\.current\.surveyRef\.current\.factor\)/);
  assert.match(comp, /!live\.current\.injecting && !engine\.count\(\)/, 'the loop ends when the live droplets have finished');
  assert.match(comp, /Math\.min\(2, window\.devicePixelRatio \|\| 1\)/);
  assert.match(source, /<HeroInjectionFlow [^>]*injecting=\{!!run && year < injectionYears && ship\.phase === 'moored'\}/);
  assert.match(source, /heroLeakRandom\(HERO_INJ_SEED\)/);
  assert.match(source, /heroLeakDrawDrop\(ctx, q\)/, 'the droplets share the look of the leak droplets');
  const engine = source.slice(source.indexOf('const heroInjectionEngine'), source.indexOf('const HeroInjectionFlow ='));
  assert.match(engine, /tick\(dt, emit, speed, emitScale = 1\)/);
  assert.match(engine, /while \(emit && carry >= 1/, 'no new droplets start without emit');
  assert.match(engine, /HERO_INJ_RATE \* speed \* dt \* emitScale/, 'the rate follows the playback speed and the survey factor');
});

test('a droplet is green, travels 6 to 16 px and fades out', () => {
  const eng = source.slice(source.indexOf('const HERO_INJ_RATE'), source.indexOf('const heroInjectionEngine'));
  const F = new Function('heroLeakEase', 'heroLeakClamp', `${eng}\nreturn { HERO_INJ_RATE, heroInjSpawn, heroInjLook };`)(
    t => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3), (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)));
  assert.ok(F.HERO_INJ_RATE >= 6 && F.HERO_INJ_RATE <= 10);
  let seed = 5; const rand = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  for (let i = 0; i < 200; i++) {
    const p = F.heroInjSpawn(rand, [100, 120], 40);
    const dist = Math.hypot(p.dx, p.dy);
    assert.ok(dist >= 6 - 1e-9 && dist <= 16 + 1e-9, `distance ${dist}`);
    assert.ok(p.dy < 0, 'it rises');
    assert.equal(F.heroInjLook(p).c, 'green');
    p.t = 1;
    assert.ok(F.heroInjLook(p).a < 0.01, 'it has faded at the end');
  }
});

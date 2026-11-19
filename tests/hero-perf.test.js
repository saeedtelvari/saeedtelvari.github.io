// The hero must not block the first paint. These tests pin how the load work is split.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const sea = read('HeroSea.jsx');
const hero = read('SubsurfaceHero.jsx');
const css = read('colors_and_type.css');

// Load the shader constants and the GL functions of HeroSea.jsx into a sandbox.
const seaApi = (extra = {}) => {
  const constants = sea.slice(sea.indexOf('const HERO_SEA_VERT'), sea.indexOf('const heroSeaRandom'));
  const gl = sea.slice(sea.indexOf('// Start the program.'), sea.indexOf('const HeroSea = ('));
  const context = { ...extra };
  vm.runInNewContext(`${constants}\n${gl}\nthis.api = { heroSeaStart, heroSeaDriver, heroSeaWorkerSource, heroSeaCanUseWorker };`, context);
  return context.api;
};

// A fake WebGL context. The log records the order of the calls.
const fakeGl = ({ parallel = true, done = () => true, log = [] } = {}) => {
  const gl = {
    COMPLETION_STATUS_KHR: 0x91b1, COMPILE_STATUS: 1, LINK_STATUS: 2, VERTEX_SHADER: 3, FRAGMENT_SHADER: 4,
    ARRAY_BUFFER: 5, STATIC_DRAW: 6, FLOAT: 7, TRIANGLE_STRIP: 8,
    getExtension: name => (name === 'OES_standard_derivatives' ? {} : name === 'KHR_parallel_shader_compile' && parallel ? { COMPLETION_STATUS_KHR: 0x91b1 } : null),
    isContextLost: () => false,
    createShader: () => ({}), shaderSource() {}, compileShader: () => log.push('compile'),
    createProgram: () => ({}), attachShader() {}, linkProgram: () => log.push('link'),
    getProgramParameter: (program, name) => {
      log.push(name === 0x91b1 ? 'poll' : 'status');
      return name === 0x91b1 ? done() : true;
    },
    getShaderParameter: () => true, getShaderInfoLog: () => '', getProgramInfoLog: () => '',
    useProgram() {}, createBuffer: () => ({}), bindBuffer() {}, bufferData() {}, getAttribLocation: () => 0,
    enableVertexAttribArray() {}, vertexAttribPointer() {}, getUniformLocation: name => name,
    deleteBuffer() {}, deleteShader() {}, deleteProgram() {},
    viewport: () => log.push('viewport'), uniform1f() {}, uniform2f() {}, drawArrays: () => log.push('draw'),
  };
  return gl;
};
const fakeCanvas = gl => ({ width: 300, height: 150, getContext: () => gl });

test('the shader program starts after the load, in an idle callback, and never in the first render', () => {
  const effect = sea.slice(sea.indexOf('The shader starts after the page has loaded'), sea.indexOf('  return (\n    <div ref={wrapRef}'));
  assert.match(effect, /requestIdleCallback\(begin, \{ timeout: HERO_SEA_IDLE_MS \}\)/);
  assert.match(sea, /HERO_SEA_IDLE_MS = 2000/);
  assert.match(effect, /document\.readyState === 'complete'/);
  assert.match(effect, /addEventListener\('load', schedule/);
  assert.match(effect, /window\.setTimeout\(begin, 200\)/, 'a timer replaces the idle callback');
  // No call that makes a context or a program is in the component body outside the scheduled begin.
  const component = sea.slice(sea.indexOf('const HeroSea = ('));
  assert.ok(component.indexOf('getContext') < 0, 'the component never calls getContext');
  assert.ok(component.indexOf('heroSeaStart') > component.indexOf('const begin'), 'the program starts only inside begin');
});

test('with the parallel extension the page polls the completion status and never asks the link status first', () => {
  const log = [];
  let ready = false;
  const gl = fakeGl({ log, done: () => ready });
  const frames = [];
  const api = seaApi({
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
    cancelAnimationFrame: () => {},
  });
  let program = null;
  api.heroSeaStart(fakeCanvas(gl), result => { program = result; }, error => { throw error; });
  assert.deepEqual(log, ['compile', 'compile', 'link', 'poll'], 'link, then one poll, and no status call');
  assert.equal(program, null);
  assert.equal(frames.length, 1, 'the next poll waits for an animation frame');
  frames.shift()();
  assert.equal(program, null);
  assert.deepEqual(log.slice(-1), ['poll']);
  ready = true;
  frames.shift()();
  assert.ok(program, 'the program is ready after the browser finished');
  assert.ok(log.indexOf('status') > log.lastIndexOf('poll'), 'the link status comes after the last poll');
});

test('without the extension the program is checked at once, and a failed program calls fail', () => {
  const gl = fakeGl({ parallel: false });
  const api = seaApi({ requestAnimationFrame: () => 1, cancelAnimationFrame: () => {} });
  let program = null;
  api.heroSeaStart(fakeCanvas(gl), result => { program = result; }, () => assert.fail('no failure'));
  assert.ok(program);
  const bad = fakeGl({ parallel: false });
  bad.getProgramParameter = () => false;
  let failure = null;
  api.heroSeaStart(fakeCanvas(bad), () => assert.fail('no program'), error => { failure = error; });
  assert.ok(failure, 'a failed link calls fail, and the page shows the SVG sea');
  let noGl = null;
  api.heroSeaStart({ getContext: () => null }, () => assert.fail('no program'), error => { noGl = error; });
  assert.ok(noGl, 'no WebGL calls fail');
});

test('the driver draws one frame when it stops and loops at most 30 times per second when it runs', () => {
  const log = [];
  const callbacks = [];
  const api = seaApi({ requestAnimationFrame: fn => { callbacks.push(fn); return callbacks.length; }, cancelAnimationFrame: () => {}, performance: { now: () => 0 } });
  const gl = fakeGl({ log });
  const canvas = fakeCanvas(gl);
  let program = null;
  api.heroSeaStart(canvas, result => { program = result; }, error => { throw error; });
  const driver = api.heroSeaDriver(program, canvas);
  driver.set({ width: 800, height: 120, scale: 2, moonX: 0.9 }, true);
  assert.equal(canvas.width, 800);
  assert.equal(canvas.height, 120);
  assert.equal(log.filter(entry => entry === 'draw').length, 1, 'set with redraw draws once');
  driver.run(true);
  assert.equal(callbacks.length, 1, 'the loop starts');
  callbacks.shift()(100);
  callbacks.shift()(105);
  callbacks.shift()(140);
  assert.equal(log.filter(entry => entry === 'draw').length, 3, 'a frame under 33 ms after the last one is skipped');
  driver.run(false);
  assert.equal(log.filter(entry => entry === 'draw').length, 4, 'stop draws one frame');
});

test('the worker source is self-contained and answers ready after the program is linked', () => {
  const source = seaApi().heroSeaWorkerSource();
  assert.match(source, /const HERO_SEA_VERT = /);
  assert.match(source, /const heroSeaDriver = /);
  const log = [];
  const posted = [];
  const frames = [];
  const gl = fakeGl({ log });
  const self = { postMessage: message => posted.push(message.type), close: () => posted.push('closed') };
  vm.runInNewContext(source, {
    self, performance: { now: () => 0 },
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; }, cancelAnimationFrame: () => {},
    setTimeout: () => 1, clearTimeout: () => {},
  });
  const canvas = { ...fakeCanvas(gl), addEventListener() {} };
  self.onmessage({ data: { type: 'init', canvas, params: { width: 400, height: 60, scale: 1, moonX: 0.9, wind: 6, moon: 1, fog: 0 }, run: false } });
  while (frames.length && !posted.includes('ready')) frames.shift()(0);
  assert.ok(posted.includes('ready'), 'the worker reports ready');
  assert.equal(canvas.width, 400, 'the worker sizes the canvas');
  self.onmessage({ data: { type: 'free' } });
  assert.ok(posted.includes('closed'));
});

test('the page uses a worker and an OffscreenCanvas when it can, and the page thread otherwise', () => {
  const full = { Worker: function Worker() {}, Blob: function Blob() {}, OffscreenCanvas: function OffscreenCanvas() {}, window: { URL: { createObjectURL() {} } }, URL: { createObjectURL() {} } };
  assert.equal(seaApi(full).heroSeaCanUseWorker({ transferControlToOffscreen() {} }), true);
  assert.equal(seaApi(full).heroSeaCanUseWorker({}), false, 'a canvas without transfer uses the page thread');
  assert.equal(seaApi({ ...full, OffscreenCanvas: undefined }).heroSeaCanUseWorker({ transferControlToOffscreen() {} }), false);
  const component = sea.slice(sea.indexOf('const HeroSea = ('));
  assert.match(component, /transferControlToOffscreen/);
  assert.match(component, /heroSeaCanUseWorker\(canvas\) && beginWorker\(\)\)\) beginLocal\(\)/);
  assert.match(component, /type === 'fail' \|\| type === 'lost'/);
});

test('the canvas shows flat tones first and fades in, and reduced motion has no fade', () => {
  assert.match(css, /\.hero-sea \{ background: linear-gradient\(180deg, #2b4263 0%, #12223b 42%, #040a15 100%\); \}/);
  assert.match(css, /\.hero-sea__canvas \{ opacity: 0; transition: opacity 400ms/);
  assert.match(css, /\.hero-sea\[data-ready="true"\] \.hero-sea__canvas \{ opacity: 1; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.hero-sea__canvas \{ transition: none; \}/);
  assert.match(sea, /setAttribute\('data-ready', 'true'\)/);
});

test('the SVG sea is built only in svg mode', () => {
  const component = sea.slice(sea.indexOf('const HeroSea = ('));
  assert.match(component, /mode === 'gl'\s*\? <canvas/);
  assert.match(component, /size\.width > 0 && <HeroSeaSvg/);
  assert.match(component, /if \(mode !== 'svg'\) return undefined;/, 'only svg mode measures the strip');
});

test('the hero mounts the heavy scenery in later steps, as transitions', () => {
  assert.match(hero, /React\.startTransition\(\(\) => setStep\(step \+ 1\)\)/);
  assert.match(hero, /<Sky weather=\{scene\} late=\{step >= 1\} \/>/);
  assert.match(hero, /\{late && <SurfaceSite /);
  const identity = hero.indexOf('<Identity onNavigate={onNavigate} />');
  assert.ok(identity > 0, 'the identity is in the first step');
  // The identity, the section, the plume and the player do not wait for a step.
  const body = hero.slice(hero.indexOf('<section id="home"'), hero.indexOf('</section>'));
  for (const name of ['<HeroSection', '<HeroPlume', '<HeroWell', '<Identity', '<HeroPlayer']) {
    assert.ok(body.indexOf(name) > 0 && !new RegExp(`&& ${name}`).test(body), `${name} is in the first step`);
  }
});

test('the clock waits for the platform, because a per-frame update would restart the transition', () => {
  assert.match(hero, /if \(!late \|\| !heroShouldTick\(\{ playing, visible, hidden \}\)\) return undefined;/);
  assert.match(hero, /\[late, run, playing, speed, visible, hidden, shipSeconds\]/);
});

test('the weather reaches the sky through custom properties, so the big sky parts do not build again', () => {
  const sky = hero.slice(hero.indexOf('const Sky = ('), hero.indexOf('const SkyBack = '));
  for (const name of ['--wx-stars', '--wx-cloud', '--wx-deck', '--wx-fog', '--wx-horizon', '--wx-moon-op', '--moon-glow']) {
    assert.ok(sky.includes(`'${name}'`), name);
  }
  assert.ok(sky.indexOf('Array.from') < 0, 'the Sky function holds no star or cloud drawing');
  assert.ok(sky.indexOf('useMemo') < 0 && sky.indexOf('[weather]') < 0);
  for (const name of ['SkyStars', 'SkyMoon', 'SkyClouds', 'SkyHaze', 'SkyHorizon', 'SkyRain']) {
    assert.match(hero, new RegExp(`const ${name} = React\\.memo\\(`), `${name} is memoized`);
  }
  assert.match(hero, /<SkyStars \/>/);
  assert.match(hero, /<SkyClouds \/>/);
  assert.match(hero, /style=\{\{ opacity: 'var\(--wx-stars\)' \}\}/);
  assert.match(hero, /className="hero-deck" style=\{\{ opacity: 'var\(--wx-deck\)' \}\}/);
  assert.match(hero, /className="hero-fog" style=\{\{ opacity: 'var\(--wx-fog\)' \}\}/);
  assert.match(hero, /<SkyMoon moonPath=\{moonPath\} \/>/, 'only the moon phase path builds the moon again');
  assert.match(hero, /<SkyRain rain=\{rain\} live=\{!!weather\.live\} \/>/);
});

test('the platform and the carrier are static memo parts, and only the moving parts are in the frame', () => {
  for (const name of ['SurfaceSite', 'SiteDefs', 'SitePlatformDeck', 'SitePlatformTop', 'HeroShipBody']) {
    assert.match(hero, new RegExp(`const ${name} = React\\.memo\\(`), `${name} is memoized`);
  }
  const body = hero.slice(hero.indexOf('const HeroShipBody'), hero.indexOf('// Both share the viewBox'));
  assert.ok(body.indexOf('pose') < 0, 'the carrier drawing does not read the pose');
  assert.ok(body.indexOf('flow') < 0, 'the carrier drawing does not read the flow');
  for (const name of ['--ship-wake', '--ship-lights', '--ship-engine']) {
    assert.ok(hero.includes(`'${name}'`), `${name} is set on the wrapper`);
    assert.ok(body.includes(`var(${name})`), `${name} is read by the drawing`);
  }
  const deck = hero.slice(hero.indexOf('const SitePlatformDeck'), hero.indexOf('const SitePlatformTop'));
  const top = hero.slice(hero.indexOf('const SitePlatformTop'), hero.indexOf('const HeroName'));
  for (const part of [deck, top]) assert.ok(!/\bflow\b/.test(part.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')), 'static platform parts do not read the flow');
  const site = hero.slice(hero.indexOf('const SurfaceSite'), hero.indexOf('const SiteDefs'));
  assert.match(site, /<SiteDefs \/>/);
  assert.match(site, /<SitePlatformDeck \/>/);
  assert.match(site, /<SitePlatformTop \/>/);
  assert.match(site, /site-flow-x/, 'the flow gradients stay in the frame');
  assert.match(site, /data-site-status="true"/, 'the status light stays in the frame');
  assert.match(hero, /display: 'none' \}\}>/, 'the carrier is hidden between the manoeuvres, not removed');
});

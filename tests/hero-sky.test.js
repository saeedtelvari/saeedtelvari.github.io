const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('sky interaction brightens fixed stars and resets on leave, reduced motion, and unmount', () => {
  const bundle = fs.readFileSync(path.join(__dirname, '../bundle.js'), 'utf8');
  const start = bundle.search(/const Skys*=/);
  // The compact bundle has no comments, so the slice ends at the next component.
  const end = bundle.indexOf('const HeroShip', start);
  assert.ok(start >= 0 && end > start, 'build.js must produce the sky component');

  const listeners = new Map();
  const events = {
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
  };
  const star = { style: { left: '50%', top: '50%', setProperty(name, value) { this[name] = value; } } };
  const sky = { getBoundingClientRect: () => ({ left: 10, top: 20, width: 1000, height: 400 }) };
  // The stars layer finds the sky and the hero by itself, because it mounts after the sky.
  const layer = {
    style: {},
    children: [star],
    closest: selector => (selector === '#home' ? events : sky),
  };
  const layers = { '.hero-stars': layer };
  const motion = { matches: true, ...events };
  const rain = [];
  let effect, frame, skyStyle;
  vm.runInNewContext(bundle.slice(start, end) + '\nSky({ weather: { cloud: 0.9, fog: 0.5, rain: 0, moon: 0.4, moonPath: "" } });\nSkyStars();\nSkyRain({ rain: 0.5, live: false });', {
    useRef: () => ({ current: layer }),
    useEffect: fn => { effect = fn; },
    useMemo: fn => fn(),
    heroFixed: value => Math.round(value * 10) / 10,
    // Sky mounts the sea component and reads the default weather. The stubs keep this test on the sky.
    HeroSea: () => null,
    HERO_WEATHER_DEFAULT: { wind: 6, cloud: 0.35, fog: 0, moon: 1 },
    React: {
      memo: component => component,
      Fragment: 'fragment',
      createElement: (type, props) => {
        if (props?.className === 'hero-rain-drop') rain.push(props.style);
        if (props && props['data-layer'] === 'sky') skyStyle = props.style;
        return {};
      },
    },
    window: {
      ...events,
      matchMedia: () => motion,
      requestAnimationFrame: fn => { frame = fn; return 1; },
      cancelAnimationFrame: () => { frame = null; },
    },
  });
  // The weather reaches the sky through custom properties on one container.
  assert.equal(skyStyle['--wx-stars'], 0.133, 'stars fade with cloud and fog');
  assert.equal(skyStyle['--wx-cloud'], 1);
  assert.equal(skyStyle['--wx-deck'], 0.717);
  assert.equal(skyStyle['--wx-fog'], 0.5);
  assert.equal(skyStyle['--wx-moon-op'], 0.5, 'fog dims the moon');
  assert.equal(skyStyle['--moon-glow'], 0.4);
  assert.ok(rain.length > 0 && rain.every(drop =>
    parseFloat(drop.left) >= 0 && parseFloat(drop.left) <= 100 &&
    parseFloat(drop['--rain-speed']) > 0 && parseFloat(drop['--rain-phase']) <= 0 &&
    parseFloat(drop['--rain-length']) > 0 && drop['--rain-alpha'] > 0 && drop['--rain-alpha'] <= 1
  ), 'rain streaks have valid positions, timing, and opacity');
  const cleanup = effect();
  const move = (x, y = 220, pointerType = 'mouse') => listeners.get('pointermove')({ pointerType, clientX: x, clientY: y });
  move(510);
  frame();
  assert.equal(star.style['--star-near'], '1.000');
  move(1010);
  frame();
  assert.equal(layers['.hero-stars'].style.transform, undefined, 'the stars stay fixed under the pointer');
  assert.equal(star.style['--star-near'], '0.000');
  listeners.get('pointerleave')();
  assert.equal(star.style['--star-near'], '0');

  move(510);
  motion.matches = false;
  listeners.get('change')();
  assert.equal(frame, null, 'changing motion preferences cancels pending movement');
  move(510);
  assert.equal(frame, null, 'reduced motion or coarse pointers do not schedule movement');
  motion.matches = true;
  move(510, 220, 'touch');
  assert.equal(frame, null);
  move(510, 450);
  assert.equal(frame, null, 'movement below the sky resets the effect');
  move(510);
  cleanup();
  assert.equal(frame, null);
  assert.equal(star.style['--star-near'], '0');
  assert.equal(listeners.size, 0, 'unmount removes all listeners');
});

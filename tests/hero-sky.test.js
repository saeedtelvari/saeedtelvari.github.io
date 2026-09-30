const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('sky interaction brightens fixed stars and resets on leave, reduced motion, and unmount', () => {
  const bundle = fs.readFileSync(path.join(__dirname, '../bundle.js'), 'utf8');
  const start = bundle.indexOf('const Sky =');
  const end = bundle.indexOf('// Decorative equipment', start);
  assert.ok(start >= 0 && end > start, 'build.js must produce the sky component');

  const listeners = new Map();
  const events = {
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
  };
  const star = { style: { left: '50%', top: '50%', setProperty(name, value) { this[name] = value; } } };
  const layers = {
    '.hero-stars': { style: {}, children: [star] },
  };
  const sky = {
    closest: () => events,
    querySelector: selector => layers[selector],
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 1000, height: 400 }),
  };
  const motion = { matches: true, ...events };
  const rain = [];
  let effect, frame;
  vm.runInNewContext(bundle.slice(start, end) + '\nSky();', {
    useRef: () => ({ current: sky }),
    useEffect: fn => { effect = fn; },
    useMemo: fn => fn(),
    React: { createElement: (type, props) => {
      if (props?.className === 'hero-rain-drop') rain.push(props.style);
      return {};
    } },
    window: {
      ...events,
      matchMedia: () => motion,
      requestAnimationFrame: fn => { frame = fn; return 1; },
      cancelAnimationFrame: () => { frame = null; },
    },
  });
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

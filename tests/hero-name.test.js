const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('name interaction stays bounded and stops for touch, reduced motion, scrolling and unmount', () => {
  const bundle = fs.readFileSync(path.join(__dirname, '../bundle.js'), 'utf8');
  const start = bundle.indexOf('const HeroName =');
  const end = bundle.indexOf('const Identity =', start);
  assert.ok(start >= 0 && end > start, 'build.js must produce HeroName');
  const listeners = new Map();
  const events = {
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
  };
  const bounds = { left: 100, top: 100, width: 400, height: 64 };
  const word = { getBoundingClientRect: () => bounds, style: { setProperty(name, value) { this[name] = value; } } };
  const title = {
    style: {}, closest: () => events, querySelectorAll: () => [word],
    getBoundingClientRect: () => bounds,
    setAttribute(name) { this[name] = true; },
    removeAttribute(name) { delete this[name]; },
  };
  const motion = { matches: true, ...events };
  let effect, frame;
  vm.runInNewContext(bundle.slice(start, end) + '\nHeroName({ variant: "moonlight" });', {
    useRef: () => ({ current: title }), useEffect: fn => { effect = fn; },
    React: { createElement: () => ({}) },
    window: { ...events, matchMedia: () => motion,
      requestAnimationFrame: fn => { frame = fn; return 1; },
      cancelAnimationFrame: () => { frame = null; } },
  });
  const cleanup = effect();
  const move = (clientX, clientY = 132, pointerType = 'mouse') => listeners.get('pointermove')({ clientX, clientY, pointerType });
  move(480, 160);
  frame();
  const displacement = title.style.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
  assert.ok(Math.abs(+displacement[1]) <= 4 && Math.abs(+displacement[2]) <= 3);
  assert.equal(title['data-lit'], true);
  assert.equal(word.style['--name-light-x'], '95%');
  listeners.get('scroll')();
  assert.equal(title.style.transform, '');
  assert.equal(title['data-lit'], undefined);
  move(300, 132, 'touch');
  assert.equal(frame, null);
  move(300);
  motion.matches = false;
  listeners.get('change')();
  assert.equal(frame, null);
  move(300);
  assert.equal(frame, null);
  motion.matches = true;
  move(1000);
  frame();
  assert.equal(title['data-lit'], undefined, 'pointer outside the name restores its resting position');
  move(300);
  cleanup();
  assert.equal(frame, null);
  assert.equal(listeners.size, 0);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const VE2D = require('../ve2d-model');

// Exercise the real map hooks without a DOM or a second copy of its lifecycle.
function mapPanel(initial) {
  const source = fs.readFileSync(require.resolve('../SimulatorPage.jsx'), 'utf8');
  const hooks = [];
  let cursor, dirty, pending, props = initial, snapshot;
  const React = {
    useRef(value) { const i = cursor++; return hooks[i] ||= { current: value }; },
    useState(value) {
      const i = cursor++;
      if (!(i in hooks)) hooks[i] = typeof value === 'function' ? value() : value;
      return [hooks[i], next => {
        next = typeof next === 'function' ? next(hooks[i]) : next;
        if (!Object.is(next, hooks[i])) { hooks[i] = next; dirty = true; }
      }];
    },
    useCallback(fn, deps) { cursor++; return fn; },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!hooks[i] || deps.some((v, j) => !Object.is(v, hooks[i][j]))) pending.push(fn);
      hooks[i] = deps;
    }
  };
  // Keep useCallback stable when its dependencies are unchanged, as React does.
  React.useCallback = (fn, deps) => {
    const i = cursor++;
    if (!hooks[i] || deps.some((v, j) => !Object.is(v, hooks[i].deps[j]))) hooks[i] = { fn, deps };
    return hooks[i].fn;
  };
  const context = { React, VE2D, setInterval: () => 1, clearInterval() {} };
  const prelude = source.slice(0, source.indexOf('const UQParamConfig'));
  const panel = source.slice(source.indexOf('const Ve2DMapPanel'), source.indexOf('  const downloadMap'));
  vm.runInNewContext(`${prelude}\n${panel}\nreturn { advanceMap }; }; this.Panel = Ve2DMapPanel;`, context);
  const onSnapshot = next => { snapshot = next; };
  const onCommandConsumed = () => {};
  const render = patch => {
    props = { ...props, ...patch };
    let passes = 0;
    do {
      cursor = 0; pending = []; dirty = false;
      context.Panel({ ...props, onSnapshot, onCommandConsumed });
      pending.forEach(effect => effect());
      assert.ok(++passes < 10, 'map lifecycle must settle');
    } while (dirty);
    return snapshot;
  };
  return render;
}

test('terrain, nested faults and flow edits reset the real map lifecycle before stepping', () => {
  const render = mapPanel({ mapCols: 24, K: 1.7, porosity: 0.25, Q: 2, injLocation: 70,
    wellY: 50, injDuration: 240, residualTrapFraction: 0.25, amplitude: 15, frequency: 1,
    terrainSeed: 42, heterogeneity: 0.5, dipPercent: 0.8, faultOffset: 1, faultCount: 1,
    faults: [{ xPercent: 50, isSealed: true }], preset: 'default' });
  render();
  assert.equal(render({ command: { id: 1, type: 'step' } }).time, 1);
  for (const patch of [{ terrainSeed: 43 }, { faults: [{ xPercent: 60, isSealed: true }] }, { porosity: 0.3 }, { mapCols: 32 }]) {
    const reset = render({ ...patch, command: null });
    assert.equal(reset.time, 0);
    assert.equal(reset.masses.injected, 0);
    assert.ok(reset.h.every(h => h === 0));
    assert.equal(render({ command: { id: 2, type: 'step' } }).time, 1);
  }
});

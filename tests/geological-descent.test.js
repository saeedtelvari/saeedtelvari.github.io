const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('smooth beds share continuous materials, concentrate faults by rock, and resize cleanly', () => {
  const root = path.join(__dirname, '..');
  const bundle = fs.readFileSync(path.join(root, 'bundle.js'), 'utf8');
  const code = bundle.slice(bundle.indexOf('// File: GeologicalDescent.jsx'), bundle.indexOf('// File: HomeSections.jsx'));
  assert.ok(code.includes('const GeologicalDescent'), 'build the current source before testing');
  const cases = [[1100, 1500, 850, 240], [2600, 1900, 1200, 350], [1000, 600, 800, 200]];
  for (const heights of cases) {
    const nodes = [], observers = [];
    const sections = heights.map(offsetHeight => ({ offsetHeight }));
    const motion = { dataset: {} };
    const texture = { setAttribute(name, value) { this[name] = value; } };
    const pattern = { ...texture, querySelector: () => texture };
    const types = { AboutSection: () => {}, PublicationsList: () => {}, ContactSection: () => {}, Footer: () => {} };
    let effect, updated;
    const makeObserver = function(callback) {
      this.callback = callback;
      this.observed = [];
      this.observe = node => this.observed.push(node);
      this.disconnect = () => { this.disconnected = true; };
      observers.push(this);
    };
    const context = {
      ...types,
      window: {},
      ResizeObserver: makeObserver, IntersectionObserver: makeObserver,
      React: {
        Fragment: 'fragment', Children: { map: (children, fn) => children.map(fn) },
        useRef: () => ({ current: {
          clientWidth: heights[0] > 2000 ? 360 : 1280,
          querySelectorAll: selector => selector === '.section-panel' ? sections.slice(0, 3) : selector === '.descent-material' ? [pattern] : [motion],
          querySelector: () => sections[3],
        } }),
        useState: () => [heights, fn => { updated = fn(heights); }],
        useEffect: fn => { effect = fn; },
        createElement: (type, props, ...children) => {
          const node = { type, props: props || {}, children };
          nodes.push(node);
          return node;
        },
      },
    };
    vm.runInNewContext(code + '\nGeologicalDescent({ children: [AboutSection, PublicationsList, ContactSection, Footer].map(type => ({ type })) });', context);
    const beds = nodes.filter(node => node.props['data-bed'] !== undefined);
    assert.equal(beds.length, 41);
    const points = d => [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(match => [+match[1], +match[2]]);
    const split = d => {
      const all = points(d);
      const seam = all.findIndex((p, i) => i > 0 && p[0] < all[i - 1][0]);
      // Both traces include their rightmost endpoint before the lower trace turns left.
      return [all.slice(0, seam - 1), all.slice(seam - 1).reverse()];
    };
    for (let i = 0; i < beds.length - 1; i++) {
      assert.deepEqual(split(beds[i].props.d)[1], split(beds[i + 1].props.d)[0], 'adjoining beds must have the exact same contact');
    }
    const contacts = nodes.filter(node => node.props['data-contact'] !== undefined).map(node => points(node.props.d));
    const sample = (line, x) => {
      const right = line.findIndex(point => point[0] >= x);
      if (right === 0) return line[0][1];
      const [a, b] = [line[right - 1], line[right]];
      return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    };
    for (const x of new Set([...Array.from({ length: 181 }, (_, i) => i * 8), ...contacts.flatMap(line => line.map(point => point[0]))])) {
      for (let i = 1; i < contacts.length; i++) assert.ok(sample(contacts[i], x) > sample(contacts[i - 1], x), 'beds must stay ordered after resizing');
    }
    for (const line of contacts) {
      for (let i = 1; i < line.length - 1; i++) assert.ok(Math.abs(line[i - 1][1] - 2 * line[i][1] + line[i + 1][1]) < 1, 'contacts must not have small angular kinks');
    }
    const faults = nodes.filter(node => node.props['data-fault'] !== undefined);
    assert.ok(faults.length >= 18, 'the wider view needs numerous local fault splays');
    for (const fault of faults) {
      const line = points(fault.props.d);
      assert.ok(line.at(-1)[1] - line[0][1] < 300, 'fault splays must end within a few beds');
      assert.ok(Math.abs(line.at(-1)[0] - line[0][0]) > (line.at(-1)[1] - line[0][1]) * .4, 'faults must be inclined at any size');
      assert.ok(+fault.props.strokeWidth < 2, 'faults must not read as heavy black stripes');
      assert.ok(['basement', 'limestone', 'dolomite'].includes(fault.props['data-fault-material']), 'faults belong only in selected brittle rock units');
    }
    assert.ok(faults.filter(node => node.props['data-fault-material'] === 'basement').length > faults.length / 2, 'most fault splays must be in granite');
    const fractures = nodes.filter(node => node.props['data-fractures'] !== undefined);
    assert.equal(fractures.length, beds.length);
    for (const node of fractures.filter(node => node.props['data-material'] === 'shale')) assert.equal(node.props['data-fracture-count'], 0, 'shale must remain sparsely fractured');
    assert.ok(fractures.find(node => node.props['data-material'] === 'basement').props['data-fracture-count'] >= 150, 'granite needs a dense joint network');
    const materials = nodes.filter(node => node.props.className === 'descent-material');
    assert.equal(materials.length, 6, 'beds must reuse six shared material origins instead of resetting every interval');
    assert.equal(nodes.filter(node => node.type === 'details' || node.props.className === 'descent-sensor').length, 0, 'inspection and monitoring graphics must be removed');
    assert.equal(nodes.find(node => node.props.className === 'geological-descent-art').props.viewBox, `0 0 1440 ${heights.reduce((a, b) => a + b)}`);
    const cleanup = effect();
    assert.equal(pattern.width, 840 * 1440 / (heights[0] > 2000 ? 360 : 1280), 'smaller texture grains must retain their aspect ratio on mobile');
    assert.equal(texture.transform, `scale(${1440 / (heights[0] > 2000 ? 360 : 1280)} 1)`, 'texture blending and mineral scale must resize together');
    assert.equal(updated, heights, 'unchanged measurements must not trigger another render');
    observers[1].callback([{ target: motion, isIntersecting: true }]);
    assert.equal(motion.dataset.visible, 'true');
    observers[1].callback([{ target: motion, isIntersecting: false }]);
    assert.equal(motion.dataset.visible, 'false');
    cleanup();
    assert.ok(observers.every(observer => observer.disconnected));
  }
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'colors_and_type.css'), 'utf8'), /descent-inspection|descent-sensor/, 'remove unused inspection and monitoring styles');
  for (const material of ['shale', 'sandstone', 'limestone', 'basement', 'siltstone', 'dolomite']) {
    assert.ok(fs.statSync(path.join(root, `assets/geology-${material}.webp`)).size > 0, 'all referenced material textures must exist');
  }
});

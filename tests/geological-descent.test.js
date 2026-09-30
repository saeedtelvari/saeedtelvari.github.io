const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('cutaway beds share contacts, retain fault offsets, resize, and clean up visibility observers', () => {
  const root = path.join(__dirname, '..');
  const bundle = fs.readFileSync(path.join(root, 'bundle.js'), 'utf8');
  const code = bundle.slice(bundle.indexOf('// File: GeologicalDescent.jsx'), bundle.indexOf('// File: HomeSections.jsx'));
  assert.ok(code.includes('const GeologicalDescent'), 'build the current source before testing');
  const cases = [[1100, 1500, 850, 240], [2600, 1900, 1200, 350], [1000, 600, 800, 200]]
    .flatMap(heights => [[-.2, .2], [.2, -.2]].map(slopes => ({ heights, slopes })));
  for (const { heights, slopes } of cases) {
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
      currentGeology: { faults: [{ xPercent: 22, dipSlope: slopes[0] }, { xPercent: 52, dipSlope: slopes[1] }] },
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
    assert.equal(beds.length, 15);
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
    assert.ok(contacts.some(line => line.some((p, i) => i && p[0] - line[i - 1][0] < 1 && Math.abs(p[1] - line[i - 1][1]) > 12)), 'faults must displace the beds');
    assert.equal(nodes.find(node => node.props.className === 'geological-descent-art').props.viewBox, `0 0 1440 ${heights.reduce((a, b) => a + b)}`);
    const cleanup = effect();
    assert.equal(texture.width, 1440 * 1440 / (heights[0] > 2000 ? 360 : 1280), 'texture aspect ratios must survive mobile scaling');
    assert.equal(updated, heights, 'unchanged measurements must not trigger another render');
    observers[1].callback([{ target: motion, isIntersecting: true }]);
    assert.equal(motion.dataset.visible, 'true');
    observers[1].callback([{ target: motion, isIntersecting: false }]);
    assert.equal(motion.dataset.visible, 'false');
    cleanup();
    assert.ok(observers.every(observer => observer.disconnected));
  }
  for (const material of ['shale', 'sandstone', 'limestone', 'basement']) {
    assert.ok(fs.statSync(path.join(root, `assets/geology-${material}.webp`)).size > 0, 'all referenced material textures must exist');
  }
});

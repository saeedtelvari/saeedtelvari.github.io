const test = require('node:test');
const assert = require('node:assert/strict');
const VE2D = require('../ve2d-model.js');
const B = require('../sim-block3d.js');

// The view the page hands to the 3D renderer: the worker's model view plus the
// scenario that produced it, so the surface can be evaluated exactly.
const setup = patch => {
  const scenario = VE2D.normalizeScenario({ ...VE2D.DEFAULTS, ...patch });
  const model = VE2D.buildModel(scenario);
  const view = { nx: model.nx, ny: model.ny, dx: model.dx, dy: model.dy, Lx: model.Lx, Ly: model.Ly, H: model.H, faults: scenario.faults, faultLines: model.faultLines };
  const depthAt = (x, y) => VE2D.topDepth(x, y, scenario);
  return { scenario, model, view, depthAt, geometry: B.buildGeometry(view, depthAt) };
};

const triangles = (mesh, size = 3) => {
  const list = [];
  for (let k = 0; k < mesh.index.length; k += 3) {
    list.push([0, 1, 2].map(v => Array.from(mesh.position.slice(size * mesh.index[k + v], size * mesh.index[k + v] + size))));
  }
  return list;
};
const planArea = ([a, b, c]) => 0.5 * ((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
// Display space: x east, y north, z up = -depth.
const normalOf = ([a, b, c]) => {
  const u = [b[0] - a[0], b[1] - a[1], -(b[2] - a[2])];
  const v = [c[0] - a[0], c[1] - a[1], -(c[2] - a[2])];
  return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
};
const vertexKey = (x, y, z) => `${Math.round(x * 100)},${Math.round(y * 100)},${Math.round(z * 100)}`;
const surfaceKeys = geometry => {
  const keys = new Set();
  const p = geometry.surface.position;
  for (let k = 0; k < p.length; k += 3) keys.add(vertexKey(p[k], p[k + 1], p[k + 2]));
  return keys;
};
const sectionVertices = (geometry, kind) => {
  const s = geometry.section;
  const list = [];
  for (let v = 0; v < s.fault.length; v++) {
    const fault = s.fault[v] - 1;
    if (kind === 'wall' ? fault >= 0 : fault < 0) continue;
    list.push({ x: s.position[3 * v], y: s.position[3 * v + 1], z: s.position[3 * v + 2], top: s.top[v], nx: s.normal[2 * v], ny: s.normal[2 * v + 1], fault });
  }
  return list;
};

test('the top surface tiles the whole domain once, facing up', () => {
  for (const patch of [{ faults: [] }, {}, VE2D.PRESETS['sealed-block'].patch]) {
    const { view, geometry } = setup(patch);
    let area = 0;
    for (const triangle of triangles(geometry.surface)) {
      const a = planArea(triangle);
      assert.ok(a > -1e-3, `flipped triangle (${a} m²)`);
      area += a;
    }
    assert.ok(Math.abs(area - view.Lx * view.Ly) < 1e-6 * view.Lx * view.Ly, `plan area ${area}`);
  }
});

test('without faults every surface vertex lies on the engine top surface', () => {
  const { geometry, depthAt } = setup({ faults: [] });
  const p = geometry.surface.position;
  for (let k = 0; k < p.length; k += 3) assert.ok(Math.abs(p[k + 2] - depthAt(p[k], p[k + 1])) < 1e-3);
  assert.equal(geometry.section.fault.filter(f => f > 0).length, 0, 'no fault faces');
});

test('fault scarps sit on the trace and reproduce the throw profile', () => {
  const { scenario, geometry } = setup({});
  const fault = scenario.faults[0];
  const strike = fault.strike * Math.PI / 180;
  const along = [Math.sin(strike), Math.cos(strike)];
  const normal = [Math.cos(strike), -Math.sin(strike)];
  const half = fault.length * 500;
  const faces = sectionVertices(geometry, 'fault');
  assert.ok(faces.length > 0, 'the fault has a scarp');
  let highest = 0;
  for (const v of faces) {
    const dx = v.x - fault.x * 1000;
    const dy = v.y - fault.y * 1000;
    assert.ok(Math.abs(dx * normal[0] + dy * normal[1]) < 0.01, 'scarp vertex off the trace');
    const t = (dx * along[0] + dy * along[1]) / half;
    const height = v.z - v.top;
    const expected = Math.abs(t) < 1 ? fault.throw * (1 - t * t) : 0;
    assert.ok(Math.abs(height - (v.z === v.top ? 0 : expected)) < 0.05, `height ${height} vs ${expected} at t=${t.toFixed(3)}`);
    highest = Math.max(highest, height);
  }
  assert.ok(Math.abs(highest - fault.throw) < 0.05, `largest throw ${highest}`);
});

test('fault scarps close the surface and face the downthrown side', () => {
  for (const patch of [{}, VE2D.PRESETS['sealed-block'].patch, { faults: [{ x: 8, y: 6, strike: 0, length: 10, throw: 30, trans: 0, sealCap: 50, kf: 0 }] }]) {
    const { scenario, geometry } = setup(patch);
    const keys = surfaceKeys(geometry);
    const faces = sectionVertices(geometry, 'fault');
    assert.ok(faces.length > 0, 'scarp present');
    for (const v of faces) assert.ok(keys.has(vertexKey(v.x, v.y, v.z)), `scarp vertex ${v.x},${v.y},${v.z} not on the surface`);
    const s = geometry.section;
    for (let k = 0; k < s.index.length; k += 3) {
      const fault = s.fault[s.index[k]] - 1;
      if (fault < 0) continue;
      const tri = [0, 1, 2].map(v => Array.from(s.position.slice(3 * s.index[k + v], 3 * s.index[k + v] + 3)));
      const n = normalOf(tri);
      const strike = scenario.faults[fault].strike * Math.PI / 180;
      const facing = n[0] * Math.cos(strike) - n[1] * Math.sin(strike);
      assert.ok(facing > 0, 'scarp faces the footwall');
    }
  }
});

test('walls seal the four edges from the surface down through aquifer and base', () => {
  for (const patch of [{}, VE2D.PRESETS['sealed-block'].patch]) {
    const { view, geometry } = setup(patch);
    const keys = surfaceKeys(geometry);
    const walls = sectionVertices(geometry, 'wall');
    const sides = new Set();
    for (const v of walls) {
      const onEdge = [v.x === 0 && v.nx === -1, v.x === view.Lx && v.nx === 1, v.y === 0 && v.ny === -1, v.y === view.Ly && v.ny === 1];
      assert.ok(onEdge.some(Boolean), `wall vertex ${v.x},${v.y} off the edge or facing inwards`);
      sides.add(onEdge.indexOf(true));
      if (v.z === v.top) assert.ok(keys.has(vertexKey(v.x, v.y, v.z)), 'wall top not on the surface');
      else assert.ok(Math.abs(v.z - v.top - (view.H + geometry.base)) < 1e-3, 'wall bottom below the base');
    }
    assert.equal(sides.size, 4);
    const s = geometry.section;
    for (let k = 0; k < s.index.length; k += 3) {
      if (s.fault[s.index[k]] > 0) continue;
      const tri = [0, 1, 2].map(v => Array.from(s.position.slice(3 * s.index[k + v], 3 * s.index[k + v] + 3)));
      const n = normalOf(tri);
      if (Math.hypot(n[0], n[1]) < 1e-6) continue;
      assert.ok(n[0] * s.normal[2 * s.index[k]] + n[1] * s.normal[2 * s.index[k] + 1] > 0, 'wall winding faces inwards');
    }
  }
});

test('the camera frames the whole block at every orbit angle without changing scale', () => {
  const { view, geometry } = setup({});
  const box = B.sceneBox(geometry, view, 25, 1530);
  const viewport = { width: 820, height: 640, top: 96, bottom: 62, side: 16 };
  for (const elevation of [0.12, 0.62, 1.45]) {
    const distances = new Set();
    for (let degrees = -180; degrees < 180; degrees += 15) {
      const cam = B.cameraFor({ azimuth: degrees * Math.PI / 180, elevation, zoom: 1, panX: 0, panY: 0 }, box, viewport);
      distances.add(cam.distance.toFixed(6));
      for (const x of [-box.Lx / 2, box.Lx / 2]) for (const y of [-box.Ly / 2, box.Ly / 2]) for (const z of [box.top, box.bottom]) {
        const [px, py] = B.project(cam, x, y, z);
        assert.ok(px >= viewport.side - 1 && px <= viewport.width - viewport.side + 1, `x ${px} at ${degrees}°`);
        assert.ok(py >= viewport.top - 1 && py <= viewport.height - viewport.bottom + 1, `y ${py} at ${degrees}°`);
      }
    }
    assert.equal(distances.size, 1, 'orbiting must not zoom');
  }
});

test('picking finds the surface point under the cursor', () => {
  const depthAt = (x, y) => 1500 + 0.012 * (x - 10000) - 0.008 * (y - 6000);
  const view = { nx: 80, ny: 48, dx: 250, dy: 250, Lx: 20000, Ly: 12000, H: 50, faults: [], faultLines: [] };
  const geometry = B.buildGeometry(view, depthAt);
  const box = B.sceneBox(geometry, view, 25, depthAt(14000, 6000));
  const viewport = { width: 820, height: 640, top: 96, bottom: 62, side: 16 };
  // (A low view up a slope steeper than the line of sight sees only walls, so stay above it.)
  for (const camera of [{ azimuth: -0.55, elevation: 0.62 }, { azimuth: 2.4, elevation: 0.62 }, { azimuth: 0, elevation: 1.4 }]) {
    const cam = B.cameraFor({ ...camera, zoom: 1.4, panX: 0, panY: 0 }, box, viewport);
    for (const [x, y] of [[12000, 5000], [3000, 9000], [17500, 1500]]) {
      const [px, py] = B.project(cam, ...B.toDisplay(box, x, y, depthAt(x, y)));
      const hit = B.pick(cam, box, depthAt, px, py);
      assert.ok(hit, `no hit at ${x},${y}`);
      assert.ok(Math.hypot(hit.x - x, hit.y - y) < 5, `hit ${hit.x.toFixed(1)},${hit.y.toFixed(1)} for ${x},${y}`);
    }
    assert.equal(B.pick(cam, box, depthAt, 2, 2), null, 'the corner of the canvas is empty');
  }
});

test('cell state is packed for the GPU in SI units', () => {
  const view = { nx: 2, ny: 1, disCapacity: 100, traps: [{ id: 0, size: 6, capacity: 1e6 }], rhoG: 700, trapId: Int32Array.from([0, -1]), zt: Float32Array.from([1500, 1510]), zSpill: Float32Array.from([1520, Infinity]) };
  const frame = { h: Float32Array.from([3, 0]), hMax: Float32Array.from([4, 1]), md: Float32Array.from([50, 0]), p: Float32Array.from([2.5e5, 0]) };
  assert.deepEqual(Array.from(B.packFrame(view, frame)), [3, 4, 0.5, 2.5, 0, 1, 0, 0]);
  assert.deepEqual(Array.from(B.packStatic(view)), [20, 1, 0, 0, 1000, 0, 0, 0]);
});

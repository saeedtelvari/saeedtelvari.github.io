const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const between = (text, from, to) => text.slice(text.indexOf(from), text.indexOf(to));

const api = new Function(between(read('StoryEarth.jsx'), '// ---- story earth helpers', '// ---- end story earth helpers') + `
return { STORY_EARTH_TARGET, STORY_EARTH_VIEW0, STORY_EARTH_VIEW1, STORY_EARTH_BOX, STORY_EARTH_HOLD, STORY_EARTH_ZOOM,
  storyEarthDecode, storyEarthBuildRing, storyEarthView, storyEarthProject, storyEarthVisible, storyEarthClipRing,
  storyEarthMercY, storyEarthFit, storyEarthMapPoint, storyEarthLayout, storyEarthOrbitCamera, storyEarthDescentCamera, storyEarthTint };`)();
const {
  STORY_EARTH_TARGET, STORY_EARTH_VIEW0, STORY_EARTH_VIEW1, STORY_EARTH_BOX, STORY_EARTH_HOLD, STORY_EARTH_ZOOM,
  storyEarthDecode, storyEarthBuildRing, storyEarthView, storyEarthProject, storyEarthVisible, storyEarthClipRing,
  storyEarthMercY, storyEarthFit, storyEarthMapPoint, storyEarthLayout, storyEarthOrbitCamera, storyEarthDescentCamera, storyEarthTint,
} = api;

const RAD = Math.PI / 180;
const topology = JSON.parse(read('assets/land-110m.json'));
const rawRings = storyEarthDecode(topology);
const rings = rawRings.map(ring => storyEarthBuildRing(ring));
const sweep = (count = 100) => Array.from({ length: count + 1 }, (_, i) => i / count);
const plain = value => JSON.parse(JSON.stringify(value));

// Is a point on land? An even-odd test in the plane of lon and lat. The longitude of a ring runs on at 180 degrees,
// so the test uses a copy of each ring that is 360 degrees to the left, in place and to the right.
const onLand = (lon, lat) => {
  let crossings = 0;
  for (const ring of rings) {
    for (const shift of [-360, 0, 360]) {
      for (let i = 0, j = ring.count - 1; i < ring.count; j = i++) {
        const yi = ring.lat[i];
        const yj = ring.lat[j];
        if ((yi > lat) === (yj > lat)) continue;
        const xi = ring.lon[i] + shift;
        const xj = ring.lon[j] + shift;
        if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) crossings++;
      }
    }
  }
  return crossings % 2 === 1;
};

const angleBetween = (lonA, latA, lonB, latB) => {
  const a = [Math.cos(latA * RAD) * Math.cos(lonA * RAD), Math.cos(latA * RAD) * Math.sin(lonA * RAD), Math.sin(latA * RAD)];
  const b = [Math.cos(latB * RAD) * Math.cos(lonB * RAD), Math.cos(latB * RAD) * Math.sin(lonB * RAD), Math.sin(latB * RAD)];
  return Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) / RAD;
};

// The shapes that storyEarthClipRing writes: arrays of [x, y], split at the NaN pairs.
const shapesOf = out => {
  const shapes = [];
  let current = [];
  for (let i = 0; i < out.length; i += 2) {
    if (Number.isNaN(out[i])) { if (current.length) shapes.push(current); current = []; } else current.push([out[i], out[i + 1]]);
  }
  if (current.length) shapes.push(current);
  return shapes;
};
const shoelace = shape => {
  let sum = 0;
  for (let i = 0; i < shape.length; i++) {
    const j = (i + 1) % shape.length;
    sum += shape[i][0] * shape[j][1] - shape[j][0] * shape[i][1];
  }
  return sum / 2;
};
const clip = (ring, view, R = 100) => { const out = []; storyEarthClipRing(ring.xyz, view, R, 0, 0, out); return out; };

test('the decoder gives the rings of the file, in lon and lat, within the bounding box of the file', () => {
  const expected = topology.objects.land.geometries.reduce((sum, geometry) => sum + geometry.arcs.reduce((n, polygon) => n + polygon.length, 0), 0);
  assert.equal(rawRings.length, expected, 'one ring for each ring of each polygon');
  assert.ok(rawRings.length > 100);
  let minLon = Infinity; let minLat = Infinity; let maxLon = -Infinity; let maxLat = -Infinity;
  for (const ring of rawRings) {
    assert.deepEqual(ring[0], ring[ring.length - 1], 'a ring is closed');
    for (const [lon, lat] of ring) { minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon); minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat); }
  }
  const [bx0, by0, bx1, by1] = topology.bbox;
  assert.ok(Math.abs(minLon - bx0) < 0.01 && Math.abs(maxLon - bx1) < 0.01, `lon range ${minLon} to ${maxLon}`);
  assert.ok(Math.abs(minLat - by0) < 0.01 && Math.abs(maxLat - by1) < 0.01, `lat range ${minLat} to ${maxLat}`);
});

test('a reversed arc (the index ~i) gives the same points as the arc i, in reverse order', () => {
  const topo = { transform: { scale: [1, 1], translate: [0, 0] }, arcs: [[[0, 0], [2, 0], [0, 2]], [[2, 2], [-2, 0], [0, -2]]], objects: { land: { type: 'GeometryCollection', geometries: [{ type: 'Polygon', arcs: [[0, 1]] }, { type: 'Polygon', arcs: [[~1, ~0]] }] } } };
  const [forward, backward] = storyEarthDecode(topo);
  assert.deepEqual(plain(forward), [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]], 'the arcs run in the delta steps, with the transform');
  assert.deepEqual(plain(backward), plain(forward).slice().reverse(), 'the same ring, the other way round');
});

test('the land is where it must be: Norway, Britain and Denmark are land, the North Sea is not', () => {
  assert.equal(onLand(...STORY_EARTH_TARGET), false, 'the North Sea marker is in the sea');
  assert.equal(onLand(2.5, 55.5), false, 'the middle of the North Sea');
  assert.equal(onLand(9, 61), true, 'Norway');
  assert.equal(onLand(-1.5, 52.5), true, 'England');
  assert.equal(onLand(-4.2, 57), true, 'Scotland');
  assert.equal(onLand(9.5, 56), true, 'Denmark');
  assert.equal(onLand(10.5, 51.5), true, 'Germany');
  assert.equal(onLand(-30, 40), false, 'the Atlantic');
  assert.equal(onLand(170, -20), false, 'the Pacific');
  assert.equal(onLand(20, 0), true, 'Africa');
  assert.equal(onLand(100, 40), true, 'Asia');
  assert.equal(onLand(0, -80), true, 'Antarctica');
  assert.equal(onLand(50, 42), false, 'the Caspian Sea is a hole in the land');
});

test('no edge of a ring is longer than 2 degrees, the longitude has no jump, and the hole is reversed', () => {
  let raw = 0;
  let total = 0;
  rawRings.forEach(ring => { raw += ring.length - 1; });
  rings.forEach((ring, index) => {
    total += ring.count;
    for (let i = 0; i < ring.count; i++) {
      const j = (i + 1) % ring.count;
      if (j === 0 && Math.abs(ring.lon[j] - ring.lon[i]) > 180) continue;
      assert.ok(Math.abs(ring.lon[j] - ring.lon[i]) <= 2.0001, `ring ${index}: lon step ${ring.lon[j] - ring.lon[i]}`);
      assert.ok(Math.abs(ring.lat[j] - ring.lat[i]) <= 2.0001, `ring ${index}: lat step ${ring.lat[j] - ring.lat[i]}`);
    }
    assert.equal(ring.xyz.length, ring.count * 3);
    for (let i = 0; i < ring.count; i++) {
      assert.ok(Math.abs(Math.hypot(ring.xyz[3 * i], ring.xyz[3 * i + 1], ring.xyz[3 * i + 2]) - 1) < 1e-12, 'unit vectors');
    }
  });
  assert.ok(total > raw, 'long edges got more points');
  assert.equal(rings.filter(ring => ring.hole).length, 1, 'the Caspian Sea is the only hole');
  const caspian = rings.find(ring => ring.hole);
  assert.ok(caspian.bbox[0] > 45 && caspian.bbox[2] < 56 && caspian.bbox[1] > 36 && caspian.bbox[3] < 48);
});

test('the centre of the view is the centre of the disc, north is up and east is right', () => {
  for (const [lon, lat] of [[2, 30], [3, 41], [-150, 20], [0, 0], [170, -60]]) {
    const view = storyEarthView(lon, lat);
    const centre = storyEarthProject(view, lon, lat, 300, 640, 470);
    assert.ok(Math.abs(centre.x - 640) < 1e-9 && Math.abs(centre.y - 470) < 1e-9, `centre of ${lon}, ${lat}`);
    assert.ok(Math.abs(centre.depth - 1) < 1e-12);
    assert.ok(storyEarthProject(view, lon, lat + 5, 300, 640, 470).y < 470, 'north is up (y goes down on the screen)');
    assert.ok(storyEarthProject(view, lon + 5, lat, 300, 640, 470).x > 640, 'east is right');
  }
  const north = storyEarthProject(storyEarthView(0, 0), 0, 90, 100);
  assert.ok(Math.abs(north.x) < 1e-9 && Math.abs(north.y + 100) < 1e-9, 'the pole is at the top of the disc');
  const limb = storyEarthProject(storyEarthView(0, 0), 90, 0, 100);
  assert.ok(Math.abs(limb.x - 100) < 1e-9 && Math.abs(limb.depth) < 1e-12, 'a point 90 degrees away is on the limb');
});

test('a point is visible exactly when it is less than 90 degrees from the centre of the view', () => {
  const views = [[2, 30], [3, 41], [-150, 20], [0, 0], [60, -70], [180, 85]];
  for (const [lon0, lat0] of views) {
    const view = storyEarthView(lon0, lat0);
    for (let lon = -180; lon <= 180; lon += 7) {
      for (let lat = -89; lat <= 89; lat += 7) {
        const angle = angleBetween(lon0, lat0, lon, lat);
        if (Math.abs(angle - 90) < 1e-6) continue;
        assert.equal(storyEarthVisible(view, lon, lat), angle < 90, `view ${lon0}, ${lat0}, point ${lon}, ${lat} (${angle.toFixed(2)} degrees)`);
        const at = storyEarthProject(view, lon, lat, 1);
        assert.ok(Math.hypot(at.x, at.y) <= 1 + 1e-9, 'every point is in the disc of its globe');
      }
    }
    assert.equal(storyEarthVisible(view, lon0 + 180, -lat0), false, 'the antipode');
    assert.equal(storyEarthVisible(view, lon0, lat0), true, 'the centre');
  }
});

// A ring that goes clockwise around a centre, at an angular distance (the land is on the right: the cap).
const cap = (lon, lat, distance, reverse = false) => {
  const l = lon * RAD;
  const p = lat * RAD;
  const centre = [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
  const east = [-Math.sin(l), Math.cos(l), 0];
  const north = [-Math.sin(p) * Math.cos(l), -Math.sin(p) * Math.sin(l), Math.cos(p)];
  const points = [];
  for (let degrees = 0; degrees < 360; degrees += 1) {
    const a = degrees * RAD;
    const d = distance * RAD;
    points.push([0, 1, 2].map(k => Math.cos(d) * centre[k] + Math.sin(d) * (Math.cos(a) * north[k] + Math.sin(a) * east[k])));
  }
  if (reverse) points.reverse();
  const xyz = new Float64Array(points.length * 3);
  points.forEach((point, i) => xyz.set(point, 3 * i));
  return { xyz, centre };
};

// The area of the cap on the screen, on a disc of radius 1: the sum of the depth on the surface that the cap covers.
const capArea = (lon, lat, distance, view) => {
  const { centre } = cap(lon, lat, distance);
  const axis = [view.cp * view.cl, view.cp * view.sl, view.sp];
  let area = 0;
  const step = 0.2 * RAD;
  for (let p = -90 * RAD + step / 2; p < 90 * RAD; p += step) {
    for (let l = -Math.PI + step / 2; l < Math.PI; l += step) {
      const point = [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
      const inside = point[0] * centre[0] + point[1] * centre[1] + point[2] * centre[2] >= Math.cos(distance * RAD);
      const depth = point[0] * axis[0] + point[1] * axis[1] + point[2] * axis[2];
      if (inside && depth > 0) area += depth * Math.cos(p) * step * step;
    }
  }
  return area;
};

test('the limb clip: a ring on the far side gives nothing, a ring on the near side is not changed', () => {
  const view = storyEarthView(0, 0);
  const far = cap(180, 0, 30);
  assert.equal(storyEarthClipRing(far.xyz, view, 100, 0, 0, []), 0);
  const near = cap(0, 0, 30);
  const out = [];
  storyEarthClipRing(near.xyz, view, 100, 50, 60, out);
  assert.equal(shapesOf(out).length, 1);
  assert.equal(shapesOf(out)[0].length, 360, 'every point stays');
  for (let i = 0; i < 360; i++) {
    const at = storyEarthProject(view, 0, 0, 100, 50, 60);
    assert.ok(Number.isFinite(out[2 * i]) && Number.isFinite(out[2 * i + 1]));
    assert.ok(Math.hypot(out[2 * i] - at.x, out[2 * i + 1] - at.y) <= 100 * Math.sin(30 * RAD) + 1e-6);
  }
});

test('the limb clip: land that crosses the limb fills the right part of the disc, with no spill', () => {
  const R = 100;
  const cases = [
    [0, 0, 70, 0, 40], [0, 0, 90, 0, 30], [0, 0, 100, 0, 15], [0, 0, 180, 0, 100], [0, 0, 150, 40, 70], [0, 0, 0, 90, 80],
    [20, 50, 20, -40, 120], [-30, 10, 60, 10, 60], [0, 0, 120, 20, 95],
  ];
  for (const [lon0, lat0, lon, lat, distance] of cases) {
    const view = storyEarthView(lon0, lat0);
    const inside = cap(lon, lat, distance);
    const shapes = shapesOf(clip(inside, view, R));
    for (const point of shapes.flat()) assert.ok(Math.hypot(point[0], point[1]) <= R * (1 + 1e-9), `inside the disc: ${point}`);
    const area = shapes.reduce((sum, shape) => sum + shoelace(shape), 0) / (R * R);
    const expected = capArea(lon, lat, distance, view);
    assert.ok(Math.abs(area - expected) < 0.01 * Math.PI + 0.01 * expected, `view ${lon0}, ${lat0}, cap ${lon}, ${lat}, ${distance} degrees: area ${area.toFixed(4)}, expected ${expected.toFixed(4)}`);
    // A hole is the same ring in reverse order: the land is the rest of the disc.
    const hole = shapesOf(clip(cap(lon, lat, distance, true), view, R));
    const holeArea = hole.reduce((sum, shape) => sum + shoelace(shape), 0) / (R * R);
    if (distance < 170) assert.ok(Math.abs(holeArea - (Math.PI - expected)) < 0.01 * Math.PI + 0.01 * expected, `the reverse ring of ${lon}, ${lat}, ${distance}: area ${holeArea.toFixed(4)}`);
  }
});

test('the limb clip does not depend on the point where the ring starts, and a ring that is far gives the same shape each time', () => {
  const view = storyEarthView(-90, 40);
  for (const index of [90, 95, 7, 125]) {
    const ring = rings[index];
    const area = shapes => shapes.reduce((sum, shape) => sum + Math.abs(shoelace(shape)), 0);
    const base = area(shapesOf(clip(ring, view)));
    for (const shift of [1, 37, Math.floor(ring.count / 2), ring.count - 1]) {
      const xyz = new Float64Array(ring.xyz.length);
      for (let i = 0; i < ring.count; i++) xyz.set(ring.xyz.subarray(3 * ((i + shift) % ring.count), 3 * ((i + shift) % ring.count) + 3), 3 * i);
      const out = [];
      storyEarthClipRing(xyz, view, 100, 0, 0, out);
      assert.ok(Math.abs(area(shapesOf(out)) - base) < 1e-6 * Math.max(1, base), `ring ${index}, shift ${shift}`);
    }
  }
});

test('the limb clip with the real land: the fill agrees with a test on the sphere (winding around the point)', () => {
  const winding = (q, ring) => {
    let ax = -q[1];
    let ay = q[0];
    let length = Math.hypot(ax, ay);
    if (length < 1e-6) { ax = 1; ay = 0; length = 1; }
    ax /= length; ay /= length;
    const b = [q[1] * 0 - q[2] * ay, q[2] * ax - q[0] * 0, q[0] * ay - q[1] * ax];
    let sum = 0;
    let before = null;
    for (let i = 0; i <= ring.count; i++) {
      const k = i % ring.count;
      const p = [ring.xyz[3 * k], ring.xyz[3 * k + 1], ring.xyz[3 * k + 2]];
      const angle = Math.atan2(p[0] * b[0] + p[1] * b[1] + p[2] * b[2], p[0] * ax + p[1] * ay);
      if (before !== null) {
        let step = angle - before;
        while (step > Math.PI) step -= 2 * Math.PI;
        while (step < -Math.PI) step += 2 * Math.PI;
        sum += step;
      }
      before = angle;
    }
    return Math.abs(sum + 2 * Math.PI) < 1 ? 1 : 0;
  };
  const planar = (shapes, x, y) => {
    let crossings = 0;
    for (const shape of shapes) {
      for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
        const [xi, yi] = shape[i];
        const [xj, yj] = shape[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) crossings++;
      }
    }
    return crossings % 2;
  };
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // The views include land on the far side (Africa and the Americas), the pole, and the hole of the Caspian Sea.
  for (const [lon, lat] of [[2, 30], [3, 41], [170, -20], [-150, 20], [-90, 40], [0, -90], [75, 45]]) {
    const view = storyEarthView(lon, lat);
    const shapes = [];
    rings.forEach(ring => shapes.push(...shapesOf(clip(ring, view))));
    let wrong = 0;
    const samples = 400;
    for (let n = 0; n < samples; n++) {
      const r = Math.sqrt(random()) * 0.995;
      const a = random() * 2 * Math.PI;
      const right = r * Math.cos(a);
      const up = r * Math.sin(a);
      const depth = Math.sqrt(1 - r * r);
      const x1 = depth * view.cp - up * view.sp;
      const q = [x1 * view.cl - right * view.sl, x1 * view.sl + right * view.cl, depth * view.sp + up * view.cp];
      const truth = rings.reduce((sum, ring) => sum + winding(q, ring), 0) % 2;
      if (truth !== planar(shapes, right * 100, -up * 100)) wrong++;
    }
    assert.ok(wrong <= 3, `view ${lon}, ${lat}: ${wrong} of ${samples} points are wrong`);
  }
});

test('the Mercator map: the box fits into the inset and its centre is in the middle', () => {
  assert.ok(Math.abs(storyEarthMercY(0)) < 1e-12 && storyEarthMercY(60) > storyEarthMercY(30));
  assert.ok(Math.abs(storyEarthMercY(-40) + storyEarthMercY(40)) < 1e-12, 'the map is symmetric');
  assert.ok(Number.isFinite(storyEarthMercY(90)), 'the pole stays on the map');
  const fit = storyEarthFit(STORY_EARTH_BOX, 176, 128);
  const map = { S: fit.S, lon: fit.lon, y: fit.y, mx: 688, my: 126 };
  const [[lon0, lat0], [lon1, lat1]] = STORY_EARTH_BOX;
  const corner0 = storyEarthMapPoint(map, lon0, lat0);
  const corner1 = storyEarthMapPoint(map, lon1, lat1);
  assert.ok(corner0.x >= 600 - 1e-9 && corner1.x <= 776 + 1e-9 && corner1.y >= 62 - 1e-9 && corner0.y <= 190 + 1e-9, 'the box is inside the rectangle');
  assert.ok(Math.abs((corner1.x - corner0.x) - 176) < 1e-9 || Math.abs((corner0.y - corner1.y) - 128) < 1e-9, 'one side of the box touches the rectangle');
  const middle = storyEarthMapPoint(map, (lon0 + lon1) / 2, 0);
  assert.ok(Math.abs(middle.x - 688) < 1e-9, 'the centre in lon is in the middle');
  assert.ok(Math.abs((corner0.y + corner1.y) / 2 - 126) < 1e-9, 'the centre in y is in the middle');
  const marker = storyEarthMapPoint(map, ...STORY_EARTH_TARGET);
  assert.ok(marker.x > 600 && marker.x < 776 && marker.y > 62 && marker.y < 190, 'the North Sea marker is in the inset');
});

test('tints go from a colour toward another one', () => {
  assert.equal(storyEarthTint('#102030', '#ffffff', 0), '#102030');
  assert.equal(storyEarthTint('#000000', '#ffffff', 0.5), 'rgb(128,128,128)');
  assert.equal(storyEarthTint('#000000', '#c9d6dc', 1), 'rgb(201,214,220)');
});

const SIZES = [[1280, 800], [1920, 1080], [1024, 768], [1440, 900], [800, 450], [390, 844], [375, 667], [360, 640], [768, 1024]];

test('the layout: the storyboard numbers at 800 by 450, and each part stays in the stage at all sizes', () => {
  const frame = storyEarthLayout(800, 450, true);
  assert.deepEqual([frame.globe.cx, frame.globe.cy, Math.round(frame.globe.R)], [640, 470, 330], 'the globe of frame 0');
  assert.equal(frame.compact, false);
  assert.ok(Math.abs(frame.inset.x - 600) < 0.01 && Math.abs(frame.inset.y - 62) < 0.5 && frame.inset.w === 176 && frame.inset.h === 128, 'the inset of frame 1');
  assert.ok(Math.abs(frame.scene.s - 1) < 1e-9 && Math.abs(frame.scene.ox) < 1e-9 && Math.abs(frame.scene.oy) < 0.5, 'the side view of frame 1');
  assert.ok(Math.abs(frame.insetMarker.x - 681.5) < 2 && Math.abs(frame.insetMarker.y - 113) < 2, `the marker in the inset: ${frame.insetMarker.x}, ${frame.insetMarker.y}`);

  for (const [width, height] of SIZES) {
    const layout = storyEarthLayout(width, height);
    const label = `${width} by ${height}`;
    assert.equal(layout.compact, width <= 640 || width < 0.9 * height, label);
    const { card, inset, scene, globe } = layout;
    assert.ok(card.x >= 0 && card.y >= layout.skip && card.x + card.w <= width && card.y + card.h <= height, `${label}: the card is in the stage, under the skip control`);
    assert.ok(inset.x >= 0 && inset.y >= layout.skip && inset.x + inset.w <= width && inset.y + inset.h <= height, `${label}: the inset is in the stage, under the skip control`);
    assert.ok(Math.abs(scene.oy + 232 * scene.s - (layout.compact ? 0.52 : 0.516) * height) < 1e-9, `${label}: the horizon`);
    if (!layout.compact) assert.ok(card.x >= 0.43 * width, `${label}: the card stays right of the caption`);
    assert.ok(globe.cx - globe.R < card.x + card.w && globe.R > 100, label);
    assert.ok(layout.maps.a < layout.maps.b && layout.maps.i < layout.maps.b, `${label}: the zoom goes in, and the inset is further out`);
    if (layout.compact) assert.ok(globe.cy - globe.R >= 360 - 1e-9 && inset.y >= 200, `${label}: the top band stays clear`);
  }
});

test('orbit camera: local 0 is the first frame, local 1 is the card, the globe never comes near the caption', () => {
  for (const [width, height] of SIZES) {
    const layout = storyEarthLayout(width, height);
    const label = `${width} by ${height}`;
    const first = storyEarthOrbitCamera(0, layout);
    assert.deepEqual([first.lon, first.lat], STORY_EARTH_VIEW0, label);
    assert.deepEqual([first.cx, first.cy, first.R], [layout.globe.cx, layout.globe.cy, layout.globe.R], `${label}: the globe of frame 0`);
    assert.equal(first.lens, null, `${label}: no map window at the start`);
    assert.equal(first.alpha, 1);
    const last = storyEarthOrbitCamera(1, layout);
    assert.deepEqual([last.lon, last.lat], STORY_EARTH_VIEW1, label);
    assert.equal(last.alpha, 0, `${label}: the globe is gone at the end`);
    const { card } = layout;
    assert.deepEqual(plain(last.lens), { x: card.x, y: card.y, w: card.w, h: card.h, r: card.r, S: layout.maps.a, mx: card.cx, my: card.cy }, `${label}: the card`);

    const clearance = camera => Math.hypot(camera.cx - layout.keep.x, camera.cy - layout.keep.y) - camera.R;
    const start = clearance(first);
    let lastR = 0;
    for (const local of sweep(200)) {
      const camera = storyEarthOrbitCamera(local, layout);
      assert.ok(Math.abs(clearance(camera) - start) < 1e-6, `${label}, local ${local}: the globe keeps its distance to the caption`);
      assert.ok(camera.R >= lastR - 1e-9 && camera.R >= layout.globe.R - 1e-9 && camera.R <= layout.globe.R * 1.12 + 1e-9, 'the globe grows a little');
      lastR = camera.R;
      assert.ok(camera.alpha >= 0 && camera.alpha <= 1);
      if (camera.lens) {
        const { lens } = camera;
        assert.ok(lens.mx >= lens.x - 1e-9 && lens.mx <= lens.x + lens.w + 1e-9 && lens.my >= lens.y - 1e-9 && lens.my <= lens.y + lens.h + 1e-9, `${label}, local ${local}: the marker is in the window`);
        assert.ok(lens.x >= -1e-9 && lens.y >= -1e-9 && lens.x + lens.w <= width + 1e-9 && lens.y + lens.h <= height + 1e-9, `${label}, local ${local}: the window is in the stage`);
        assert.ok(lens.w <= card.w + 1e-9 && lens.h <= card.h + 1e-9 && lens.r <= card.r + 1e-9);
      }
    }
    if (!layout.compact) assert.ok(start >= 0, `${label}: the first globe does not touch the caption`);
  }
});

test('descent camera: it starts where orbit ends, zooms, shrinks into the inset, and then holds', () => {
  for (const [width, height] of SIZES) {
    const layout = storyEarthLayout(width, height);
    const label = `${width} by ${height}`;
    const { card, inset, maps } = layout;
    assert.deepEqual(plain(storyEarthDescentCamera(0, layout).lens), plain(storyEarthOrbitCamera(1, layout).lens), `${label}: no jump between the chapters`);
    const zoomed = storyEarthDescentCamera(STORY_EARTH_ZOOM, layout);
    assert.deepEqual(plain(zoomed.lens), { x: card.x, y: card.y, w: card.w, h: card.h, r: card.r, S: maps.b, mx: card.cx, my: card.cy }, `${label}: the card is zoomed in`);
    assert.equal(zoomed.shrink, 0);
    assert.equal(zoomed.fall, layout.fall, `${label}: the side view is still below the stage`);
    const held = storyEarthDescentCamera(STORY_EARTH_HOLD, layout);
    assert.deepEqual(plain(held.lens), { x: inset.x, y: inset.y, w: inset.w, h: inset.h, r: inset.r, S: maps.i, mx: layout.insetMarker.x, my: layout.insetMarker.y }, `${label}: the inset`);
    assert.equal(held.shrink, 1);
    assert.equal(held.fall, 0, `${label}: the side view is in its place`);
    assert.deepEqual(plain(storyEarthDescentCamera(1, layout)), plain(held), `${label}: from 0.7 nothing moves`);
    assert.deepEqual(plain(storyEarthDescentCamera(0.85, layout)), plain(held));

    let before = storyEarthDescentCamera(0, layout);
    for (const local of sweep(200).slice(1)) {
      const now = storyEarthDescentCamera(local, layout);
      if (local <= STORY_EARTH_ZOOM) assert.ok(now.lens.S >= before.lens.S - 1e-9, `${label}, local ${local}: the map zooms in`);
      else assert.ok(now.lens.S <= before.lens.S + 1e-9, `${label}, local ${local}: the map goes out`);
      assert.ok(now.lens.w <= before.lens.w + 1e-9 && now.lens.h <= before.lens.h + 1e-9, 'the card does not grow');
      assert.ok(now.fall <= before.fall + 1e-9 && now.shrink >= before.shrink - 1e-9);
      assert.ok(now.lens.mx >= now.lens.x - 1e-9 && now.lens.mx <= now.lens.x + now.lens.w + 1e-9 && now.lens.my >= now.lens.y - 1e-9 && now.lens.my <= now.lens.y + now.lens.h + 1e-9, `${label}, local ${local}: the marker is in the card`);
      before = now;
    }
  }
});

test('the files: StoryEarth.jsx fills orbit and descent after StoryChapters.jsx, with one local file, no library and no CDN', () => {
  const build = read('build.js');
  assert.ok(build.indexOf("'StoryChapters.jsx'") > 0 && build.indexOf("'StoryEarth.jsx'") > build.indexOf("'StoryChapters.jsx'"), 'the order in build.js');
  assert.ok(build.indexOf("'StoryEarth.jsx'") < build.indexOf("'HomeSections.jsx'"), 'the story files come before the sections (the descent is not in the build)');
  const source = read('StoryEarth.jsx');
  assert.match(source, /STORY_RENDERERS\.orbit\s*=/);
  assert.match(source, /STORY_RENDERERS\.descent\s*=/);
  assert.match(source, /fetch\('assets\/land-110m\.json\?v=1'\)/, 'one request, for the local file');
  assert.equal((source.match(/fetch\(/g) || []).length, 1);
  assert.doesNotMatch(source, /https?:\/\/|\bd3\b|cdnjs|unpkg|jsdelivr/i, 'no CDN and no library');
  assert.ok(fs.existsSync(path.join(root, 'assets/land-110m.json')));
  assert.match(read('bundle.js'), /STORY_RENDERERS\.orbit\s*=/, 'the bundle has the new renderers');
});

// ---- the renderers, run with a recording context and a fetch that the test releases

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

const loadEarth = ({ fail = false } = {}) => {
  const stage = read('StoryStage.jsx');
  const colors = new Function(`${between(stage, 'const STORY_COLORS', '// A number from lo to hi')}\nreturn STORY_COLORS;`)();
  const calls = [];
  const errors = [];
  let release;
  const pending = new Promise((resolve, reject) => {
    release = () => (fail ? reject(new Error('offline')) : resolve({ ok: true, json: () => Promise.resolve(topology) }));
  });
  // window has no dispatchEvent: a renderer that sends a synthetic event would throw.
  const context = {
    STORY_COLORS: colors, STORY_RENDERERS: {}, window: {}, Path2D: class {}, console: { error: (...args) => errors.push(args) },
    fetch: url => { calls.push(url); return pending; },
  };
  vm.createContext(context);
  vm.runInContext(read('StoryEarth.jsx'), context);
  return { renderers: context.STORY_RENDERERS, calls, errors, release: () => release() };
};

// A context that accepts every call and keeps the values of the line dash offset.
const recordingContext = () => {
  const log = { offsets: [], fillTexts: 0 };
  const target = { measureText: text => ({ width: String(text).length * 6 }) };
  const ctx = new Proxy(target, {
    get: (object, key) => (key in object ? object[key] : (...args) => { if (key === 'fillText') log.fillTexts += 1; return args; }),
    set: (object, key, value) => { object[key] = value; if (key === 'lineDashOffset') log.offsets.push(value); return true; },
  });
  return { ctx, log };
};

const earthFrame = (extra = {}) => ({ local: 0.5, p: 0.1, width: 1280, height: 800, dpr: 1, time: 0, reducedMotion: false, ...extra });

test('the land arrives: each draw that ran before it asks its frame for one more draw, with no event', async () => {
  const earth = loadEarth();
  const counts = { orbit: 0, descent: 0, still: 0 };
  const frames = {
    orbit: earthFrame({ local: 0.05, requestDraw: () => { counts.orbit += 1; } }),
    descent: earthFrame({ local: 0.3, requestDraw: () => { counts.descent += 1; } }),
    still: earthFrame({ local: 1, reducedMotion: true, width: 1000, height: 562.5, requestDraw: () => { counts.still += 1; } }),
  };
  earth.renderers.orbit.draw(recordingContext().ctx, frames.orbit);
  earth.renderers.orbit.draw(recordingContext().ctx, frames.orbit);
  earth.renderers.descent.draw(recordingContext().ctx, frames.descent);
  earth.renderers.orbit.draw(recordingContext().ctx, frames.still);
  assert.deepEqual(earth.calls, ['assets/land-110m.json?v=1'], 'one request');
  assert.deepEqual(counts, { orbit: 0, descent: 0, still: 0 }, 'nothing is asked before the land arrives');
  assert.equal(earth.renderers.orbit.animated, false, 'orbit does not run on each frame to wait for the land');
  assert.equal(earth.renderers.descent.animated, false);
  earth.release();
  await settle();
  assert.deepEqual(counts, { orbit: 1, descent: 1, still: 1 }, 'each function is called once');
  earth.renderers.orbit.draw(recordingContext().ctx, frames.orbit);
  earth.renderers.descent.draw(recordingContext().ctx, frames.descent);
  assert.deepEqual(counts, { orbit: 1, descent: 1, still: 1 }, 'a draw after the arrival asks for nothing');
  assert.equal(earth.calls.length, 1);
  assert.deepEqual(earth.errors, []);
});

test('a failed land request asks for nothing, reports once, and does not request again', async () => {
  const earth = loadEarth({ fail: true });
  let asks = 0;
  const frame = earthFrame({ local: 0.05, requestDraw: () => { asks += 1; } });
  earth.renderers.orbit.draw(recordingContext().ctx, frame);
  earth.release();
  await settle();
  earth.renderers.orbit.draw(recordingContext().ctx, frame);
  earth.renderers.descent.draw(recordingContext().ctx, earthFrame({ requestDraw: () => { asks += 1; } }));
  assert.equal(asks, 0);
  assert.equal(earth.calls.length, 1);
  assert.equal(earth.errors.length, 1);
});

test('descent: animated is true in the hold after the draw, so the dashes move after a jump into the hold', () => {
  const earth = loadEarth();
  const descent = earth.renderers.descent;
  const ask = () => {};
  assert.equal(descent.animated, false, 'idle before the first draw');
  descent.draw(recordingContext().ctx, earthFrame({ local: STORY_EARTH_ZOOM / 2, requestDraw: ask }));
  assert.equal(descent.animated, false, 'not in the hold');
  // A jump straight into the hold: the first draw there turns animated on, and the stage reads it after the draw.
  const first = recordingContext();
  descent.draw(first.ctx, earthFrame({ local: STORY_EARTH_HOLD, time: 0, requestDraw: ask }));
  assert.equal(descent.animated, true, 'the hold needs a frame after each draw');
  const second = recordingContext();
  descent.draw(second.ctx, earthFrame({ local: STORY_EARTH_HOLD, time: 1000, requestDraw: ask }));
  assert.equal(descent.animated, true);
  assert.ok(first.log.offsets.length > 0 && second.log.offsets.length > 0, 'the dashes are drawn');
  assert.notDeepEqual(second.log.offsets, first.log.offsets, 'the dashes move with the time');
  assert.ok(second.log.offsets.some(value => value !== 0), 'and the offset is not zero after one second');
  descent.draw(recordingContext().ctx, earthFrame({ local: 1, time: 2000, reducedMotion: true, width: 1000, height: 562.5, requestDraw: ask }));
  assert.equal(descent.animated, false, 'a static frame never runs');
  descent.draw(recordingContext().ctx, earthFrame({ local: 0.5, requestDraw: ask }));
  assert.equal(descent.animated, false, 'the stage rests when the visitor scrolls out of the hold');
  assert.equal(earth.renderers.orbit.animated, false);
});

test('StoryEarth.jsx keeps no canvas, no frame and no version flag, and sends no event', () => {
  const source = read('StoryEarth.jsx');
  assert.doesNotMatch(source, /dispatchEvent|new Event\(|storyPaint|storyEarthStills|storyEarthWatch|storyEarthWake|\.version/);
  assert.match(source, /frame\.requestDraw/);
});

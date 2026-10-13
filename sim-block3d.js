// sim-block3d.js — WebGL 2 block diagram of a VE run. The top of the aquifer (caprock
// removed) is a corner-point surface evaluated from the engine's own depth function and
// cut along every fault trace, so throw shows as a vertical scarp at the trace; the side
// walls and the scarps show the CO2 column in section. Geometry, camera and picking are
// pure functions shared with the Node tests; createRenderer is the only WebGL code.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SimBlock3D = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SIDE_OFFSET = 0.05;  // m: the depth on one side of a trace is read this far from it
  const ON_LINE = 1e-4;      // m: a vertex closer than this to a trace lies on it
  const MESH_NODES = 160;    // surface resolution across the long side of the domain
  const FOV = 30 * Math.PI / 180;
  // Key light from the north-west, as on the map's hillshade.
  const LIGHT = [-0.5, 0.5, 0.707].map(v => v / Math.hypot(-0.5, 0.5, 0.707));

  // ------------------------------------------------------------------ geometry

  // Fault trace with its hanging-wall normal (to the right of strike, as in the engine).
  const traceOf = (fault, line, index) => {
    const strike = fault.strike * Math.PI / 180;
    return { index, x0: line[0], y0: line[1], x1: line[2], y1: line[3], nx: Math.cos(strike), ny: -Math.sin(strike) };
  };
  const signedDistance = (trace, x, y) => (x - trace.x0) * trace.nx + (y - trace.y0) * trace.ny;
  const segmentDistance = (trace, x, y) => {
    const dx = trace.x1 - trace.x0;
    const dy = trace.y1 - trace.y0;
    const t = Math.max(0, Math.min(1, ((x - trace.x0) * dx + (y - trace.y0) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - trace.x0 - t * dx, y - trace.y0 - t * dy);
  };

  // Does the trace segment reach the closed rectangle? (Liang–Barsky.)
  const touches = (trace, xa, ya, xb, yb) => {
    const dx = trace.x1 - trace.x0;
    const dy = trace.y1 - trace.y0;
    let t0 = 0;
    let t1 = 1;
    for (const [p, q] of [[-dx, trace.x0 - xa], [dx, xb - trace.x0], [-dy, trace.y0 - ya], [dy, yb - trace.y0]]) {
      if (Math.abs(p) < 1e-12) { if (q < 0) return false; continue; }
      const r = q / p;
      if (p < 0) t0 = Math.max(t0, r); else t1 = Math.min(t1, r);
      if (t0 > t1) return false;
    }
    return true;
  };

  // Where the trace line crosses edge a–b. The endpoints are ordered first so the two
  // cells sharing the edge get the identical point and the surface stays watertight.
  const crossing = (a, b, trace) => {
    const [p, q] = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? [a, b] : [b, a];
    const dp = signedDistance(trace, p[0], p[1]);
    const dq = signedDistance(trace, q[0], q[1]);
    const t = dp / (dp - dq);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, -1];
  };

  const splitPolygon = (polygon, trace) => {
    const d = polygon.map(v => { const s = signedDistance(trace, v[0], v[1]); return Math.abs(s) < ON_LINE ? 0 : s; });
    if (!d.some(s => s < 0) || !d.some(s => s > 0)) return [polygon];
    const footwall = [];
    const hangingWall = [];
    for (let k = 0; k < polygon.length; k++) {
      const next = (k + 1) % polygon.length;
      if (d[k] <= 0) footwall.push(polygon[k]);
      if (d[k] >= 0) hangingWall.push(polygon[k]);
      if (d[k] * d[next] < 0) {
        const point = crossing(polygon[k], polygon[next], trace);
        footwall.push(point);
        hangingWall.push(point);
      }
    }
    return [footwall, hangingWall];
  };

  // Quad p–q from depth `top` down to depth `low`, wound to face `normal` (display space).
  const addQuad = (mesh, p, q, top, low, normal, attributes) => {
    if ((p[1] - q[1]) * normal[0] + (q[0] - p[0]) * normal[1] < 0) {
      [p, q] = [q, p];
      top = [top[1], top[0]];
      low = [low[1], low[0]];
    }
    const first = mesh.top.length;
    for (const [point, depth, column] of [[p, top[0], 0], [q, top[1], 1], [q, low[1], 1], [p, low[0], 0]]) {
      mesh.position.push(point[0], point[1], depth);
      mesh.top.push(top[column]);
      mesh.normal.push(normal[0], normal[1]);
      const sample = attributes.sample(point);
      mesh.sample.push(sample[0], sample[1]);
      mesh.fault.push(attributes.fault);
    }
    mesh.index.push(first, first + 1, first + 2, first, first + 2, first + 3);
  };

  // The aquifer top as a heightfield on a lattice finer than the grid, cut at fault
  // traces; scarps on the footwall edge of every cut; four walls down to the aquifer
  // base, which follows the local thickness.
  const buildGeometry = (view, depthAt, options = {}) => {
    const { Lx, Ly } = view;
    const thicknessAt = options.thicknessAt || (() => view.H);
    const subdivisions = options.subdivisions || Math.max(1, Math.round(MESH_NODES / view.nx));
    const MX = view.nx * subdivisions;
    const MY = view.ny * subdivisions;
    const traces = view.faults.map((fault, index) => traceOf(fault, view.faultLines[index], index));
    const node = (a, b) => [a * Lx / MX, b * Ly / MY, b * (MX + 1) + a];

    // Depth and depth gradient at a vertex, read on the polygon's side of every trace
    // the vertex lies on; finite differences never straddle a trace.
    const cache = new Map();
    const evaluate = (vertex, sides) => {
      let x = vertex[0];
      let y = vertex[1];
      let nudged = false;
      for (const { trace, side } of sides) {
        if (Math.abs(signedDistance(trace, vertex[0], vertex[1])) >= ON_LINE) continue;
        x += side * SIDE_OFFSET * trace.nx;
        y += side * SIDE_OFFSET * trace.ny;
        nudged = true;
      }
      const key = nudged || vertex[2] < 0 ? `${x},${y}` : vertex[2];
      if (cache.has(key)) return cache.get(key);
      let step = nudged ? 0.4 * SIDE_OFFSET : 5;
      if (!nudged) for (const trace of traces) step = Math.min(step, Math.max(1e-3, 0.45 * segmentDistance(trace, x, y)));
      const value = [
        depthAt(x, y),
        (depthAt(x + step, y) - depthAt(x - step, y)) / (2 * step),
        (depthAt(x, y + step) - depthAt(x, y - step)) / (2 * step)
      ];
      cache.set(key, value);
      return value;
    };

    const surface = { position: [], gradient: [], index: [] };
    const section = { position: [], top: [], normal: [], sample: [], fault: [], index: [] };
    let zMin = Infinity;
    let zMax = -Infinity;
    let zBottom = -Infinity;
    const cellStep = 0.3 * Math.min(view.dx, view.dy);

    for (let b = 0; b < MY; b++) {
      for (let a = 0; a < MX; a++) {
        const corners = [node(a, b), node(a + 1, b), node(a + 1, b + 1), node(a, b + 1)];
        const local = traces.filter(trace => touches(trace, corners[0][0] - ON_LINE, corners[0][1] - ON_LINE, corners[2][0] + ON_LINE, corners[2][1] + ON_LINE));
        let polygons = [corners];
        for (const trace of local) polygons = polygons.flatMap(polygon => splitPolygon(polygon, trace));
        for (const polygon of polygons) {
          const cx = polygon.reduce((sum, v) => sum + v[0], 0) / polygon.length;
          const cy = polygon.reduce((sum, v) => sum + v[1], 0) / polygon.length;
          const sides = local.map(trace => ({ trace, side: signedDistance(trace, cx, cy) > 0 ? 1 : -1 }));
          const values = polygon.map(vertex => evaluate(vertex, sides));
          const first = surface.position.length / 3;
          polygon.forEach((vertex, k) => {
            surface.position.push(vertex[0], vertex[1], values[k][0]);
            surface.gradient.push(values[k][1], values[k][2]);
            zMin = Math.min(zMin, values[k][0]);
            zMax = Math.max(zMax, values[k][0]);
          });
          for (let k = 1; k < polygon.length - 1; k++) surface.index.push(first, first + k, first + k + 1);

          // Scarp: every footwall edge lying on a trace, down to the hanging wall.
          for (const { trace, side } of sides) {
            if (side > 0) continue;
            const flipped = sides.map(entry => entry.trace === trace ? { trace, side: 1 } : entry);
            for (let k = 0; k < polygon.length; k++) {
              const next = (k + 1) % polygon.length;
              const p = polygon[k];
              const q = polygon[next];
              if (Math.abs(signedDistance(trace, p[0], p[1])) >= ON_LINE || Math.abs(signedDistance(trace, q[0], q[1])) >= ON_LINE) continue;
              const low = [evaluate(p, flipped)[0], evaluate(q, flipped)[0]];
              const top = [values[k][0], values[next][0]];
              if (Math.max(low[0] - top[0], low[1] - top[1]) < 1e-3) continue;
              addQuad(section, p, q, top, low, [trace.nx, trace.ny], {
                fault: trace.index + 1,
                sample: point => [point[0] - cellStep * trace.nx, point[1] - cellStep * trace.ny]
              });
            }
          }
        }
      }
    }

    // Walls: columns at the lattice nodes on each edge, plus two columns (one per side)
    // wherever a trace meets the edge, so the wall top follows the surface exactly.
    const edges = [
      { normal: [0, -1], nodes: Array.from({ length: MX + 1 }, (_, a) => node(a, 0)) },
      { normal: [0, 1], nodes: Array.from({ length: MX + 1 }, (_, a) => node(a, MY)) },
      { normal: [-1, 0], nodes: Array.from({ length: MY + 1 }, (_, b) => node(0, b)) },
      { normal: [1, 0], nodes: Array.from({ length: MY + 1 }, (_, b) => node(MX, b)) }
    ];
    const sideOf = (trace, point) => signedDistance(trace, point[0], point[1]) > 0 ? 1 : -1;
    for (const edge of edges) {
      const columns = [];
      const push = (point, sides) => columns.push({ point, depth: evaluate(point, sides)[0], thickness: thicknessAt(point[0], point[1]) });
      edge.nodes.forEach((point, k) => {
        const previous = edge.nodes[k - 1];
        const next = edge.nodes[k + 1];
        const on = traces.filter(trace => Math.abs(signedDistance(trace, point[0], point[1])) < ON_LINE
          && touches(trace, point[0] - ON_LINE, point[1] - ON_LINE, point[0] + ON_LINE, point[1] + ON_LINE));
        if (!on.length) push(point, []);
        else {
          if (previous) push(point, on.map(trace => ({ trace, side: sideOf(trace, previous) })));
          if (next) push(point, on.map(trace => ({ trace, side: sideOf(trace, next) })));
        }
        if (!next) return;
        const crossings = traces
          .filter(trace => {
            const dp = signedDistance(trace, point[0], point[1]);
            const dq = signedDistance(trace, next[0], next[1]);
            return Math.abs(dp) >= ON_LINE && Math.abs(dq) >= ON_LINE && dp * dq < 0
              && touches(trace, Math.min(point[0], next[0]) - ON_LINE, Math.min(point[1], next[1]) - ON_LINE, Math.max(point[0], next[0]) + ON_LINE, Math.max(point[1], next[1]) + ON_LINE);
          })
          .map(trace => ({ trace, at: crossing(point, next, trace) }))
          .sort((u, v) => Math.hypot(u.at[0] - point[0], u.at[1] - point[1]) - Math.hypot(v.at[0] - point[0], v.at[1] - point[1]));
        for (const { trace, at } of crossings) {
          push(at, [{ trace, side: sideOf(trace, point) }]);
          push(at, [{ trace, side: sideOf(trace, next) }]);
        }
      });
      for (let k = 0; k < columns.length - 1; k++) {
        const p = columns[k];
        const q = columns[k + 1];
        if (p.point[0] === q.point[0] && p.point[1] === q.point[1]) continue;
        addQuad(section, p.point, q.point, [p.depth, q.depth], [p.depth + p.thickness, q.depth + q.thickness], edge.normal, { fault: 0, sample: point => point });
        zBottom = Math.max(zBottom, p.depth + p.thickness, q.depth + q.thickness);
      }
    }

    return {
      surface: { position: Float32Array.from(surface.position), gradient: Float32Array.from(surface.gradient), index: Uint32Array.from(surface.index) },
      section: {
        position: Float32Array.from(section.position), top: Float32Array.from(section.top), normal: Float32Array.from(section.normal),
        sample: Float32Array.from(section.sample), fault: Float32Array.from(section.fault), index: Uint32Array.from(section.index)
      },
      zMin, zMax, zBottom
    };
  };

  // Cell state for the GPU: column (m), historical maximum (m), dissolved fraction of
  // the cell's capacity, pressure build-up (bar).
  const packFrame = (view, frame) => {
    const n = frame.h.length;
    const data = new Float32Array(4 * n);
    for (let c = 0; c < n; c++) {
      data[4 * c] = frame.h[c];
      data[4 * c + 1] = frame.hMax[c];
      data[4 * c + 2] = view.disCapacity[c] > 0 ? frame.md[c] / view.disCapacity[c] : 0;
      data[4 * c + 3] = frame.p[c] / 1e5;
    }
    return data;
  };

  // Static per-model fields: structural closure below the spill point (m, capped), the
  // outline mask of the traps the map also draws, and the aquifer thickness (m).
  const packStatic = view => {
    const n = view.zt.length;
    const data = new Float32Array(4 * n);
    const big = new Set(view.traps.filter(t => t.size >= 4 && t.capacity * view.rhoG > 0.02e9).map(t => t.id));
    for (let c = 0; c < n; c++) {
      data[4 * c] = Math.min(1000, Math.max(0, view.zSpill[c] - view.zt[c]));
      data[4 * c + 1] = big.has(view.trapId[c]) ? 1 : 0;
      data[4 * c + 2] = view.Hc[c];
    }
    return data;
  };

  // ------------------------------------------------------------------ camera

  // Display space: x east and y north from the domain centre (m), z up = exaggerated
  // height above the mid-depth of the surface. The box includes the well stem.
  const sceneBox = (geometry, view, exaggeration, wellDepth) => {
    const zRef = 0.5 * (geometry.zMin + geometry.zMax);
    const Z = depth => -(depth - zRef) * exaggeration;
    const stem = 0.11 * Math.max(view.Lx, view.Ly);
    return {
      Lx: view.Lx, Ly: view.Ly, zRef, exaggeration, stem,
      surfaceTop: Z(geometry.zMin),
      surfaceBottom: Z(geometry.zMax),
      top: Math.max(Z(geometry.zMin), Z(wellDepth) + stem),
      bottom: Z(Math.max(geometry.zMax, geometry.zBottom))
    };
  };
  const toDisplay = (box, x, y, depth) => [x - box.Lx / 2, y - box.Ly / 2, -(depth - box.zRef) * box.exaggeration];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  // Smallest camera distance at which the block's bounding cylinder (vertical axis through
  // the target) fits the free area. The cylinder is round, so the fit does not depend on
  // the azimuth: orbiting never zooms, and the block fills the frame better than a sphere.
  const fitDistance = (box, elevation, usableWidth, usableHeight, focal) => {
    const radius = 0.5 * Math.hypot(box.Lx, box.Ly);
    const half = 0.5 * (box.top - box.bottom);
    const ce = Math.cos(elevation);
    const se = Math.sin(elevation);
    // Camera at azimuth 0: offsets of rim points on screen, relative to the target.
    const fits = distance => {
      for (let k = 0; k < 48; k++) {
        const x = radius * Math.cos(2 * Math.PI * k / 48);
        const y = radius * Math.sin(2 * Math.PI * k / 48);
        for (const z of [-half, half]) {
          const depth = distance + y * ce - z * se;
          if (Math.abs(focal * x / depth) > usableWidth / 2 || Math.abs(focal * (y * se + z * ce) / depth) > usableHeight / 2) return false;
        }
      }
      return true;
    };
    let lo = radius + half;
    let hi = 200 * (radius + half);
    for (let k = 0; k < 40; k++) {
      const mid = 0.5 * (lo + hi);
      if (fits(mid)) hi = mid; else lo = mid;
    }
    return hi;
  };

  // Orbit camera around the block centre, framed by fitDistance.
  const cameraFor = ({ azimuth, elevation, zoom = 1, panX = 0, panY = 0 }, box, viewport) => {
    const { width, height, top = 0, bottom = 0, side = 0 } = viewport;
    const usableWidth = Math.max(40, width - 2 * side);
    const usableHeight = Math.max(40, height - top - bottom);
    const tanY = Math.tan(FOV / 2);
    const focal = height / 2 / tanY;
    const radius = 0.5 * Math.hypot(box.Lx, box.Ly, box.top - box.bottom);
    const distance = fitDistance(box, elevation, usableWidth, usableHeight, focal) / zoom;
    const centreY = top + usableHeight / 2;
    const target = [panX, panY, 0.5 * (box.top + box.bottom)];
    const ce = Math.cos(elevation);
    const se = Math.sin(elevation);
    const sa = Math.sin(azimuth);
    const ca = Math.cos(azimuth);
    const forward = [ce * sa, ce * ca, -se];
    const right = [ca, -sa, 0];
    const up = [sa * se, ca * se, ce];
    const eye = target.map((v, i) => v - distance * forward[i]);
    const reach = radius + Math.hypot(panX, panY);
    const near = Math.max(distance * 0.01, distance - 1.2 * reach);
    const far = distance + 1.2 * reach;
    // Clip space with the image centre moved to the middle of the free area.
    const shift = 1 - 2 * centreY / height;
    const aspect = width / height;
    const k1 = (far + near) / (far - near);
    const k2 = 2 * far * near / (far - near);
    const rows = [
      [...right.map(v => v / (tanY * aspect)), -dot(right, eye) / (tanY * aspect)],
      [...up.map((v, i) => v / tanY + shift * forward[i]), -dot(up, eye) / tanY - shift * dot(forward, eye)],
      [...forward.map(v => k1 * v), -k1 * dot(forward, eye) - k2],
      [...forward, -dot(forward, eye)]
    ];
    const viewProj = new Float32Array(16);
    for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) viewProj[col * 4 + row] = rows[row][col];
    return { viewProj, eye, target, forward, right, up, distance, focal, width, height, centreY };
  };

  // Display point to CSS pixels; null behind the camera.
  const project = (cam, x, y, z) => {
    const v = [x - cam.eye[0], y - cam.eye[1], z - cam.eye[2]];
    const depth = dot(v, cam.forward);
    if (depth <= 1e-6) return null;
    return [cam.width / 2 + cam.focal * dot(v, cam.right) / depth, cam.centreY - cam.focal * dot(v, cam.up) / depth, depth];
  };

  // Surface point under a pixel: march the view ray through the slab that holds the
  // surface, then bisect onto the first crossing. Null if the ray misses the top.
  const pick = (cam, box, depthAt, px, py) => {
    const a = (px - cam.width / 2) / cam.focal;
    const b = (cam.centreY - py) / cam.focal;
    const dir = [0, 1, 2].map(i => cam.forward[i] + a * cam.right[i] + b * cam.up[i]);
    let t0 = 0;
    let t1 = Infinity;
    const slabs = [[-box.Lx / 2, box.Lx / 2], [-box.Ly / 2, box.Ly / 2], [box.surfaceBottom, box.surfaceTop]];
    for (let i = 0; i < 3; i++) {
      const [lo, hi] = slabs[i];
      if (Math.abs(dir[i]) < 1e-12) {
        if (cam.eye[i] < lo || cam.eye[i] > hi) return null;
        continue;
      }
      const ta = (lo - cam.eye[i]) / dir[i];
      const tb = (hi - cam.eye[i]) / dir[i];
      t0 = Math.max(t0, Math.min(ta, tb));
      t1 = Math.min(t1, Math.max(ta, tb));
    }
    if (!(t0 < t1)) return null;
    const below = t => {
      const p = cam.eye.map((v, i) => v + t * dir[i]);
      const x = p[0] + box.Lx / 2;
      const y = p[1] + box.Ly / 2;
      return { x, y, under: box.zRef - p[2] / box.exaggeration >= depthAt(x, y) };
    };
    const steps = 400;
    let previous = t0;
    if (below(t0).under) return null;
    for (let s = 1; s <= steps; s++) {
      const t = t0 + (t1 - t0) * s / steps;
      if (!below(t).under) { previous = t; continue; }
      let lo = previous;
      let hi = t;
      for (let k = 0; k < 40; k++) {
        const mid = 0.5 * (lo + hi);
        if (below(mid).under) hi = mid; else lo = mid;
      }
      const hit = below(hi);
      return { x: hit.x, y: hit.y, depth: depthAt(hit.x, hit.y) };
    }
    return null;
  };

  // ------------------------------------------------------------------ WebGL renderer

  const SURFACE_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec2 aGrad;
uniform mat4 uViewProj;
uniform vec2 uSize;
uniform float uRef;
uniform float uEx;
out vec3 vWorld;
out vec3 vNormal;
centroid out vec2 vPlan;
void main() {
  vWorld = aPos;
  vPlan = aPos.xy;
  vNormal = vec3(uEx * aGrad, 1.0);
  gl_Position = uViewProj * vec4(aPos.xy - 0.5 * uSize, -(aPos.z - uRef) * uEx, 1.0);
}`;

  const SURFACE_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vNormal;
// Position inside the triangle even on partly covered edge pixels (MSAA), for the
// side-of-fault test, which must not leak onto the hanging wall.
centroid in vec2 vPlan;
uniform sampler2D uData;
uniform sampler2D uStatic;
uniform vec2 uSize;
uniform vec2 uDepthRange;
uniform vec3 uRamp[7];
uniform vec3 uLight;
uniform vec3 uFree;
uniform vec3 uStructural;
uniform vec3 uResidual;
uniform vec3 uDissolved;
uniform vec3 uInk;
uniform vec3 uContourInk;
uniform vec3 uAccent;
uniform float uRefH;
uniform vec4 uLayers;
uniform float uInterval;
uniform float uPressure;
uniform vec3 uWell;
uniform float uTime;
uniform float uHatch;
uniform vec4 uTraces[3];
uniform int uTraceCount;
uniform vec3 uLeaking;
uniform vec3 uLeak;
out vec4 outColor;

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * 6.0;
  int i = min(int(x), 5);
  return mix(uRamp[i], uRamp[i + 1], x - float(i));
}

// Anti-aliased iso-lines of v at whole numbers, about px pixels wide.
float isoLine(float v, float px) {
  float w = max(fwidth(v), 1e-6);
  return 1.0 - smoothstep(0.5 * px, 0.5 * px + 1.0, abs(fract(v - 0.5) - 0.5) / w);
}

float level(float v, float at, float px) {
  return 1.0 - smoothstep(0.5 * px, 0.5 * px + 1.0, abs(v - at) / max(fwidth(v), 1e-6));
}

void main() {
  vec2 uv = vWorld.xy / uSize;
  vec4 d = texture(uData, uv);
  vec4 s = texture(uStatic, uv);
  float h = max(d.r, 0.0);
  float zone = max(0.0, d.g - d.r);

  float depthLines = uInterval > 0.0 ? max(0.5 * isoLine(vWorld.z / uInterval, 0.8), isoLine(vWorld.z / (5.0 * uInterval), 1.2)) : 0.0;
  float pressureLines = uPressure > 0.0 ? isoLine(d.a / uPressure, 1.2) * step(0.5 * uPressure, d.a) : 0.0;
  float plumeEdge = level(h, 0.5, 1.6);
  float trapEdge = level(s.g, 0.5, 1.4);
  float fwH = fwidth(h);
  float hatch = (vWorld.x + vWorld.y) / uHatch;
  float hatchWidth = fwidth(hatch);
  float wellDistance = length(vWorld.xy - uWell.xy);
  float fwWell = max(fwidth(wellDistance), 1e-3);

  // Fault traces on the footwall edge of each scarp, so a fault stays visible from the
  // footwall side too, where its scarp faces away. Derivatives stay outside the loop:
  // inside it they are undefined on Direct3D (ANGLE) and the line vanished.
  float gap = 1e9;
  float footwall = 0.0;
  float traceLeak = 0.0;
  for (int k = 0; k < 3; k++) {
    if (k >= uTraceCount) break;
    vec2 a = uTraces[k].xy;
    vec2 ab = uTraces[k].zw - a;
    vec2 r = vWorld.xy - a;
    float g = length(r - clamp(dot(r, ab) / dot(ab, ab), 0.0, 1.0) * ab);
    if (g < gap) {
      gap = g;
      footwall = step(dot(vPlan - a, vec2(ab.y, -ab.x)), 0.0);
      traceLeak = uLeaking[k];
    }
  }
  float trace = (1.0 - smoothstep(1.0, 2.0, gap / max(fwidth(gap), 1e-3))) * footwall;

  float t = (vWorld.z - uDepthRange.x) / max(1e-3, uDepthRange.y - uDepthRange.x);
  float shade = max(0.0, dot(normalize(vNormal), uLight));
  vec3 rgb = ramp(t) * (0.5 + 0.6 * shade);
  rgb = mix(rgb, uContourInk, uLayers.z * 0.3 * depthLines);

  if (uLayers.y > 0.5) rgb = mix(rgb, uDissolved, min(0.6, max(d.b, 0.0)));

  // Residual CO2: hatched like the map (about 6 px apart at the block centre) over a
  // light fill, alpha growing with the trapped zone.
  float stripe = 1.0 - smoothstep(0.12, 0.12 + hatchWidth, abs(fract(hatch) - 0.5));
  stripe = 0.25 + 0.75 * mix(stripe, 0.3, smoothstep(0.2, 0.45, hatchWidth));
  float residual = min(0.85, 0.3 + zone / uRefH) * smoothstep(0.05, 0.1, zone);
  rgb = mix(rgb, uResidual, uLayers.x * residual * stripe);

  // Free CO2: teal, turning amber where the column sits inside a structural closure.
  float present = smoothstep(0.05, 0.05 + max(fwH, 0.02), h);
  vec3 plume = mix(uFree, uStructural, clamp(min(h, s.r) / max(h, 1e-4), 0.0, 1.0));
  rgb = mix(rgb, plume, present * (0.35 + 0.65 * min(1.0, sqrt(h / uRefH))));
  rgb = mix(rgb, uFree, plumeEdge);

  rgb = mix(rgb, uStructural, uLayers.w * 0.9 * trapEdge);
  rgb = mix(rgb, uAccent, 0.85 * pressureLines);
  rgb = mix(rgb, mix(uInk, uLeak, step(0.5, traceLeak)), trace);

  // Injector: entry ring; while injecting, a ring pulses outwards (static if motion is off).
  rgb = mix(rgb, uInk, 1.0 - smoothstep(1.0, 2.0, abs(wellDistance - 170.0) / fwWell));
  if (uWell.z > 0.5) {
    float phase = uTime >= 0.0 ? fract(uTime / 1.6) : 0.12;
    float radius = 260.0 + phase * 1500.0;
    float pulse = (1.0 - smoothstep(1.0, 2.5, abs(wellDistance - radius) / fwWell)) * (1.0 - phase);
    rgb = mix(rgb, uFree, pulse);
  }
  outColor = vec4(rgb, 1.0);
}`;

  const SECTION_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in float aTop;
layout(location = 2) in vec2 aNormal;
layout(location = 3) in vec2 aSample;
layout(location = 4) in float aFault;
uniform mat4 uViewProj;
uniform vec2 uSize;
uniform float uRef;
uniform float uEx;
out vec3 vWorld;
out float vTop;
out vec2 vNormal;
out vec2 vSample;
flat out int vFault;
void main() {
  vWorld = aPos;
  vTop = aTop;
  vNormal = aNormal;
  vSample = aSample;
  vFault = int(aFault + 0.5);
  gl_Position = uViewProj * vec4(aPos.xy - 0.5 * uSize, -(aPos.z - uRef) * uEx, 1.0);
}`;

  const SECTION_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
in float vTop;
in vec2 vNormal;
in vec2 vSample;
flat in int vFault;
uniform sampler2D uData;
uniform sampler2D uStatic;
uniform vec2 uSize;
uniform vec2 uCell;
uniform ivec2 uGrid;
uniform vec3 uFree;
uniform vec3 uStructural;
uniform vec3 uResidual;
uniform vec3 uDissolved;
uniform vec3 uInk;
uniform vec3 uLeak;
uniform vec3 uAquifer;
uniform vec3 uBase;
uniform vec4 uLayers;
uniform vec3 uLeaking;
uniform float uTime;
out vec4 outColor;
void main() {
  float below = vWorld.z - vTop;
  float fw = max(fwidth(below), 1e-4);
  vec4 d;
  vec4 s;
  if (vFault > 0) {
    // Scarps show the footwall column: read that cell without blending across the fault.
    ivec2 cell = clamp(ivec2(floor(vSample / uCell)), ivec2(0), uGrid - 1);
    d = texelFetch(uData, cell, 0);
    s = texelFetch(uStatic, cell, 0);
  } else {
    d = textureLod(uData, vSample / uSize, 0.0);
    s = textureLod(uStatic, vSample / uSize, 0.0);
  }
  // Below the aquifer only on scarps whose throw exceeds the thickness.
  float H = s.b;
  vec3 rgb = below < H ? uAquifer : uBase;
  if (vFault > 0) rgb = mix(rgb, uInk, 0.28);
  if (uLayers.y > 0.5 && below < H && below > H * (1.0 - clamp(d.b, 0.0, 1.0))) rgb = mix(rgb, uDissolved, 0.55);
  if (uLayers.x > 0.5 && d.g > 0.05 && below >= d.r && below < d.g) rgb = mix(rgb, uResidual, 0.6);
  if (d.r > 0.05 && below < d.r) rgb = mix(rgb, mix(uFree, uStructural, clamp(min(d.r, s.r) / max(d.r, 1e-4), 0.0, 1.0)), 0.95);
  rgb = mix(rgb, uInk, 0.16 * (1.0 - smoothstep(0.5, 1.5, abs(below - H) / fw)));
  // A fill light from the south-east keeps both walls facing the default view readable.
  rgb *= 0.8 + 0.2 * dot(normalize(vNormal), vec2(0.447, -0.894));
  float edge = 1.0 - smoothstep(0.8, 1.8, below / fw);
  if (vFault > 0) {
    float leaking = uLeaking[vFault - 1];
    float pulse = uTime >= 0.0 ? 0.5 + 0.5 * sin(uTime * 3.6) : 1.0;
    rgb = mix(rgb, uLeak, leaking * (0.2 + 0.35 * pulse));
    rgb = mix(rgb, leaking > 0.5 ? uLeak : uInk, edge);
  } else {
    rgb = mix(rgb, uInk, 0.3 * edge);
  }
  outColor = vec4(rgb, 1.0);
}`;

  const SOLID_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec2 aNormal;
uniform mat4 uViewProj;
uniform vec2 uSize;
uniform float uRef;
uniform float uEx;
out vec2 vNormal;
void main() {
  vNormal = aNormal;
  gl_Position = uViewProj * vec4(aPos.xy - 0.5 * uSize, -(aPos.z - uRef) * uEx, 1.0);
}`;

  const SOLID_FS = `#version 300 es
precision highp float;
in vec2 vNormal;
uniform vec4 uColor;
out vec4 outColor;
void main() {
  float light = length(vNormal) > 0.5 ? 0.72 + 0.28 * dot(normalize(vNormal), vec2(-0.6, 0.8)) : 1.0;
  outColor = vec4(uColor.rgb * light, uColor.a);
}`;

  const compile = (gl, vertex, fragment) => {
    const program = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const uniforms = {};
    for (let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i++) {
      const name = gl.getActiveUniform(program, i).name.replace(/\[0\]$/, '');
      uniforms[name] = gl.getUniformLocation(program, gl.getActiveUniform(program, i).name);
    }
    return { program, uniforms };
  };

  // Well: a vertical tube from the stem top down to the base of the aquifer.
  const wellMesh = (x, y, top, bottom, radius) => {
    const segments = 20;
    const position = [];
    const normal = [];
    const index = [];
    for (let k = 0; k <= segments; k++) {
      const angle = 2 * Math.PI * k / segments;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      position.push(x + radius * c, y + radius * s, top, x + radius * c, y + radius * s, bottom);
      normal.push(c, s, c, s);
      if (k < segments) index.push(2 * k, 2 * k + 1, 2 * k + 3, 2 * k, 2 * k + 3, 2 * k + 2);
    }
    const centre = position.length / 3;
    position.push(x, y, top);
    normal.push(0, 0);
    for (let k = 0; k < segments; k++) index.push(centre, 2 * k, 2 * k + 2);
    return { position: Float32Array.from(position), normal: Float32Array.from(normal), index: Uint16Array.from(index) };
  };

  const createRenderer = canvas => {
    let gl = null;
    try { gl = canvas.getContext('webgl2', { antialias: true, preserveDrawingBuffer: true, alpha: false }); } catch (error) { gl = null; }
    if (!gl) return null;
    const programs = {
      surface: compile(gl, SURFACE_VS, SURFACE_FS),
      section: compile(gl, SECTION_VS, SECTION_FS),
      solid: compile(gl, SOLID_VS, SOLID_FS)
    };
    const makeTexture = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return texture;
    };
    const textures = { data: makeTexture(), statics: makeTexture() };
    const meshes = {};
    let grid = null;
    let well = null;

    const upload = (attributes, index) => {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buffers = attributes.map(([location, data, size]) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        return buffer;
      });
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      return { vao, buffers: [...buffers, indexBuffer], count: index.length, type: index instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT };
    };
    const release = mesh => {
      if (!mesh) return;
      gl.deleteVertexArray(mesh.vao);
      mesh.buffers.forEach(buffer => gl.deleteBuffer(buffer));
    };
    const fill = (texture, values) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, grid.nx, grid.ny, 0, gl.RGBA, gl.FLOAT, values);
    };

    return {
      setGeometry(geometry, view) {
        release(meshes.surface);
        release(meshes.section);
        meshes.surface = upload([[0, geometry.surface.position, 3], [1, geometry.surface.gradient, 2]], geometry.surface.index);
        const s = geometry.section;
        meshes.section = upload([[0, s.position, 3], [1, s.top, 1], [2, s.normal, 2], [3, s.sample, 2], [4, s.fault, 1]], s.index);
        grid = { nx: view.nx, ny: view.ny, dx: view.dx, dy: view.dy };
      },
      setStatic(values) { if (grid) fill(textures.statics, values); },
      setFrame(values) { if (grid) fill(textures.data, values); },

      // state: { cam, box, colors, layers, time, well, leaking, interval, pressure, refH, H, pixelWidth, pixelHeight }
      render(state) {
        if (!grid || !meshes.surface) return;
        const { cam, box, colors } = state;
        gl.viewport(0, 0, state.pixelWidth, state.pixelHeight);
        gl.clearColor(colors.stage[0], colors.stage[1], colors.stage[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(true);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.disable(gl.BLEND);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures.data);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures.statics);
        const layers = [state.layers.residual ? 1 : 0, state.layers.dissolved ? 1 : 0, state.layers.contours ? 1 : 0, state.layers.traps ? 1 : 0];
        const common = u => {
          gl.uniformMatrix4fv(u.uViewProj, false, cam.viewProj);
          gl.uniform2f(u.uSize, box.Lx, box.Ly);
          gl.uniform1f(u.uRef, box.zRef);
          gl.uniform1f(u.uEx, box.exaggeration);
        };

        let p = programs.surface;
        gl.useProgram(p.program);
        common(p.uniforms);
        const u = p.uniforms;
        gl.uniform1i(u.uData, 0);
        gl.uniform1i(u.uStatic, 1);
        gl.uniform2f(u.uDepthRange, state.depthRange[0], state.depthRange[1]);
        gl.uniform3fv(u.uRamp, colors.ramp.flat());
        gl.uniform3fv(u.uLight, LIGHT);
        for (const name of ['Free', 'Structural', 'Residual', 'Dissolved', 'Ink', 'ContourInk', 'Accent']) gl.uniform3fv(u[`u${name}`], colors[name[0].toLowerCase() + name.slice(1)]);
        gl.uniform1f(u.uRefH, state.refH);
        gl.uniform4fv(u.uLayers, layers);
        gl.uniform1f(u.uInterval, state.interval);
        gl.uniform1f(u.uPressure, state.pressure);
        gl.uniform3f(u.uWell, state.well.x, state.well.y, state.well.injecting ? 1 : 0);
        gl.uniform1f(u.uTime, state.time);
        gl.uniform1f(u.uHatch, state.hatch);
        const traces = state.traces.slice(0, 3);
        gl.uniform4fv(u.uTraces, [0, 1, 2].flatMap(i => traces[i] || [0, 0, 1, 0]));
        gl.uniform1i(u.uTraceCount, traces.length);
        gl.uniform3fv(u.uLeaking, [0, 1, 2].map(i => state.leaking[i] ? 1 : 0));
        gl.uniform3fv(u.uLeak, colors.leak);
        gl.bindVertexArray(meshes.surface.vao);
        gl.drawElements(gl.TRIANGLES, meshes.surface.count, meshes.surface.type, 0);

        p = programs.section;
        gl.useProgram(p.program);
        common(p.uniforms);
        const v = p.uniforms;
        gl.uniform1i(v.uData, 0);
        gl.uniform1i(v.uStatic, 1);
        gl.uniform2f(v.uCell, grid.dx, grid.dy);
        gl.uniform2i(v.uGrid, grid.nx, grid.ny);
        for (const name of ['Free', 'Structural', 'Residual', 'Dissolved', 'Ink', 'Leak', 'Aquifer', 'Base']) gl.uniform3fv(v[`u${name}`], colors[name[0].toLowerCase() + name.slice(1)]);
        gl.uniform4fv(v.uLayers, layers);
        gl.uniform3fv(v.uLeaking, [0, 1, 2].map(i => state.leaking[i] ? 1 : 0));
        gl.uniform1f(v.uTime, state.time);
        gl.bindVertexArray(meshes.section.vao);
        gl.drawElements(gl.TRIANGLES, meshes.section.count, meshes.section.type, 0);

        // Injector tube, then the part hidden by rock drawn faintly through it.
        const key = [state.well.x, state.well.y, state.well.top, state.well.bottom, state.well.radius].join();
        if (!well || well.key !== key) {
          release(well);
          const mesh = wellMesh(state.well.x, state.well.y, state.well.top, state.well.bottom, state.well.radius);
          well = { ...upload([[0, mesh.position, 3], [1, mesh.normal, 2]], mesh.index), key };
        }
        p = programs.solid;
        gl.useProgram(p.program);
        common(p.uniforms);
        gl.bindVertexArray(well.vao);
        gl.uniform4f(p.uniforms.uColor, colors.ink[0], colors.ink[1], colors.ink[2], 1);
        gl.drawElements(gl.TRIANGLES, well.count, well.type, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthFunc(gl.GREATER);
        gl.depthMask(false);
        gl.uniform4f(p.uniforms.uColor, colors.ink[0], colors.ink[1], colors.ink[2], 0.3);
        gl.drawElements(gl.TRIANGLES, well.count, well.type, 0);
        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gl.bindVertexArray(null);
      },

      dispose() {
        release(meshes.surface);
        release(meshes.section);
        release(well);
        gl.deleteTexture(textures.data);
        gl.deleteTexture(textures.statics);
        Object.values(programs).forEach(p => gl.deleteProgram(p.program));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  };

  return { buildGeometry, packFrame, packStatic, sceneBox, toDisplay, cameraFor, project, pick, createRenderer };
});

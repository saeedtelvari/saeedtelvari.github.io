// story-geometry.js — the shared geometry of the story homepage (chapters 2 to 5).
// It describes one depleted gas field: a sandstone dome with a methane gas cap at the crest,
// a fault on the west flank and a CO2 injection well on the east flank. The section drawing,
// the 3D grid and the live VE model all read this one scenario. The module draws nothing.
// Units: map positions in km, depths in m (positive down), gas thickness in m or as a fraction.
(function (root, factory) {
  const VE2D = typeof module === 'object' && module.exports ? require('./ve2d-model.js') : root.VE2D;
  const api = factory(VE2D);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.StoryGeometry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (VE2D) {
  const KM = VE2D.KM;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Why these values:
  // - The dome has no regional dip. A dip with a flat gas contact lets the gas cap flood the
  //   up-dip side. The contact is 50 m below the crest, and 40 m above the spill depth.
  // - The fault strikes north-south, along the dome. Its east side is the dome side and goes down.
  //   The fault is 3.25 km from the crest, so the gas cap does not touch it.
  // - The boundary is closed. The injection pressure then moves the gas cap by up to 220 m.
  //   An open boundary moves it by 75 m for the same plume. An open boundary needs 1.5 Mt/yr
  //   for the same push, and then the plume comes within 1 km of the gas cap.
  // - The rate is 0.5 Mt/yr and the permeability is 25 mD. The closest cells of the two gases
  //   stay 2 km apart. At 100 mD they are 1.5 km apart, and at 500 mD they touch.
  // - The residual gas saturation is 0.35, so the inventory shows a clear residual part.
  // - The run is 100 years, the shortest run that VE2D accepts. Injection stops at year 30.
  const STORY_SCENARIO = Object.freeze({
    preset: 'story',
    grid: 'coarse',
    boundary: 'closed',
    years: 100,
    injYears: 30,
    rateMt: 0.5,
    wellX: 16.25,
    wellY: 5.25,
    permMd: 25,
    porosity: 0.2,
    thickness: 100,
    thicknessVar: 0,
    ct: 2,
    sgr: 0.35,
    depth: 2091,
    dipDeg: 0,
    domes: 1,
    domeRelief: 100,
    roughness: 0,
    dome: Object.freeze({ x: 9.75, y: 6.25, along: 2.2, across: 1.5, angle: 80 }),
    gasContactDepth: 2050,
    faults: Object.freeze([Object.freeze({ x: 6.5, y: 6.25, strike: 0, length: 14, throw: 40, trans: 0.5, sealCap: 30, kf: 20 })])
  });

  // Map window of the 3D block, in km. Its edges are on cell faces of the coarse model grid.
  const STORY_WINDOW = Object.freeze({ x0: 4.5, x1: 19.5, y0: 1.5, y1: 10.5 });

  // Years that the precomputed run stores.
  const STORY_YEARS = Object.freeze([0, 1, 2, 5, 10, 15, 20, 25, 30, 40, 60, 100]);

  // Overburden horizons above the reservoir. Each depth is the depth at the crest. A horizon
  // follows the relief of the reservoir top by the drape fraction. The fault offsets the
  // horizons from the base of the chalk down.
  const OVERBURDEN = Object.freeze([
    { id: 'sea-floor', name: 'Sea floor', depth: 100, drape: 0, faulted: false },
    { id: 'sands-base', name: 'Base of young sands and clays', depth: 800, drape: 0.05, faulted: false },
    { id: 'mudstone-base', name: 'Base of mudstone', depth: 1400, drape: 0.25, faulted: false },
    { id: 'chalk-base', name: 'Base of chalk', depth: 1800, drape: 0.6, faulted: true }
  ]);
  const LAYER_NAMES = Object.freeze(['Sea', 'Young sands and clays', 'Mudstone', 'Chalk', 'Shale caprock', 'Reservoir sandstone', 'Older rock']);

  let cache = null;

  // The normalised scenario and its VE2D model, built once. Do not change the returned objects.
  // crest is the shallowest model cell (x, y in km, depth in m). spillDepth is the spill depth
  // in m of the trap that holds the crest.
  const storyModel = () => {
    if (cache) return cache;
    const model = VE2D.buildModel(STORY_SCENARIO);
    let crestCell = 0;
    for (let c = 1; c < model.n; c++) if (model.zt[c] < model.zt[crestCell]) crestCell = c;
    const trap = model.traps.traps[model.traps.trapId[crestCell]];
    const i = crestCell % model.nx;
    const j = (crestCell - i) / model.nx;
    cache = {
      scenario: model.scenario,
      model,
      crest: { cell: crestCell, i, j, x: model.xc[i] / KM, y: model.yc[j] / KM, depth: model.zt[crestCell] },
      spillDepth: trap ? trap.spillDepth : null
    };
    return cache;
  };

  // The straight map line through the crest and the well, from one model edge to the other.
  // The line starts on the fault side. The value s is the distance along the line in km.
  const storySectionLine = () => {
    const { scenario, model } = storyModel();
    const crest = scenario.dome;
    const well = { x: model.xc[model.well % model.nx] / KM, y: model.yc[Math.floor(model.well / model.nx)] / KM };
    const length = Math.hypot(well.x - crest.x, well.y - crest.y);
    const ux = (well.x - crest.x) / length;
    const uy = (well.y - crest.y) / length;
    // The line leaves the model at the first edge that it reaches in each direction.
    const reach = (step, from, max) => step > 0 ? (max - from) / step : step < 0 ? from / -step : Infinity;
    const forward = Math.min(reach(ux, crest.x, VE2D.LX / KM), reach(uy, crest.y, VE2D.LY / KM));
    const backward = Math.min(reach(-ux, crest.x, VE2D.LX / KM), reach(-uy, crest.y, VE2D.LY / KM));
    return {
      x0: crest.x - ux * backward,
      y0: crest.y - uy * backward,
      x1: crest.x + ux * forward,
      y1: crest.y + uy * forward,
      ux,
      uy,
      length: backward + forward,
      crestS: backward,
      wellS: backward + length,
      well
    };
  };

  // Intersection of the section line with a fault trace [x0, y0, x1, y1] in metres.
  // It returns the distance s along the line in metres and the strike parameter t (-1 to 1).
  const traceCrossing = (line, trace) => {
    const dx = trace[2] - trace[0];
    const dy = trace[3] - trace[1];
    const px = trace[0] - line.x0 * KM;
    const py = trace[1] - line.y0 * KM;
    const determinant = dx * line.uy - line.ux * dy;
    if (Math.abs(determinant) < 1e-12) return null;
    const s = (dx * py - px * dy) / determinant;
    const v = (line.ux * py - line.uy * px) / determinant;
    if (s < 0 || s > line.length * KM || v < 0 || v > 1) return null;
    return { s, t: 2 * v - 1 };
  };

  // Depth of the reservoir top along the line, with and without the faults, as functions of
  // the distance s in metres.
  const topFunctions = line => {
    const { scenario } = storyModel();
    const topAt = VE2D.depthField(scenario);
    const smoothAt = VE2D.depthField({ ...scenario, faults: [] });
    const place = s => [line.x0 * KM + s * line.ux, line.y0 * KM + s * line.uy];
    return {
      top: s => topAt(...place(s)),
      smooth: s => smoothAt(...place(s))
    };
  };

  // The gas cap along the line, as the interval around the crest where the top is above the
  // contact. A bisection finds each end.
  const capInterval = (top, crestS, length, contact) => {
    if (contact === null || !(top(crestS) < contact)) return null;
    const edge = direction => {
      let inside = crestS;
      let outside = crestS;
      do { inside = outside; outside += direction * 20; } while (outside > 0 && outside < length && top(outside) < contact);
      outside = clamp(outside, 0, length);
      for (let k = 0; k < 40; k++) {
        const middle = (inside + outside) / 2;
        if (top(middle) < contact) inside = middle; else outside = middle;
      }
      return inside / KM;
    };
    return { start: edge(-1), end: edge(1) };
  };

  // The geological cross-section along the line, with `samples` points.
  // - s, x, y: position of each sample in km.
  // - top, base: reservoir top and base in m. Both include the fault offset.
  // - horizons: the six surfaces from the sea floor to the reservoir base, each with depth in m.
  // - layers: the seven layers. Each layer has the index of its top and base horizon, or -1
  //   for the sea surface (top) and for the bottom of the drawing (base).
  // - contact: depth of the flat gas-water contact in m.
  // - cap: the s range of the gas cap in km.
  // - faults: each crossing of the line with a fault. The top just before and after the
  //   crossing gives the step. downSide names the side of the fault that goes down.
  const storySection = (samples = 200) => {
    const count = Math.max(2, Math.round(samples));
    const { scenario, model, spillDepth } = storyModel();
    const line = storySectionLine();
    const { top: topAt, smooth: smoothAt } = topFunctions(line);
    const lengthM = line.length * KM;
    const reference = smoothAt(line.crestS * KM);
    const H = scenario.thickness;

    const s = new Float64Array(count);
    const x = new Float64Array(count);
    const y = new Float64Array(count);
    const horizons = [...OVERBURDEN.map(horizon => ({ id: horizon.id, name: horizon.name, depth: new Float64Array(count) })),
      { id: 'reservoir-top', name: 'Reservoir top', depth: new Float64Array(count) },
      { id: 'reservoir-base', name: 'Reservoir base', depth: new Float64Array(count) }];
    const reservoirTop = horizons[OVERBURDEN.length].depth;
    const reservoirBase = horizons[OVERBURDEN.length + 1].depth;
    for (let k = 0; k < count; k++) {
      const along = lengthM * k / (count - 1);
      s[k] = along / KM;
      x[k] = line.x0 + line.ux * s[k];
      y[k] = line.y0 + line.uy * s[k];
      const top = topAt(along);
      const smooth = smoothAt(along);
      OVERBURDEN.forEach((horizon, index) => {
        horizons[index].depth[k] = horizon.depth + horizon.drape * (smooth - reference) + (horizon.faulted ? top - smooth : 0);
      });
      reservoirTop[k] = top;
      reservoirBase[k] = top + H;
    }

    const faults = [];
    model.faultLines.forEach((trace, index) => {
      const crossing = traceCrossing(line, trace);
      if (!crossing) return;
      const before = topAt(crossing.s - 1);
      const after = topAt(crossing.s + 1);
      faults.push({
        index,
        s: crossing.s / KM,
        x: line.x0 + line.ux * crossing.s / KM,
        y: line.y0 + line.uy * crossing.s / KM,
        t: crossing.t,
        throw: scenario.faults[index].throw * (1 - crossing.t * crossing.t),
        topBefore: before,
        topAfter: after,
        downSide: after > before ? 'end' : 'start'
      });
    });

    // The crest is the shallowest point within 2 km of the dome centre.
    let crest = { s: line.crestS, depth: Infinity };
    for (let offset = -2000; offset <= 2000; offset += 10) {
      const along = line.crestS * KM + offset;
      const depth = topAt(along);
      if (depth < crest.depth) crest = { s: along / KM, depth };
    }

    const contact = scenario.gasContactDepth;
    const layers = LAYER_NAMES.map((name, index) => ({ name, top: index - 1, base: index < LAYER_NAMES.length - 1 ? index : -1 }));
    return {
      samples: count,
      length: line.length,
      s,
      x,
      y,
      top: reservoirTop,
      base: reservoirBase,
      horizons,
      layers,
      contact,
      spillDepth,
      cap: capInterval(topAt, line.crestS * KM, lengthM, contact),
      faults,
      crest,
      well: { s: line.wellS, x: line.well.x, y: line.well.y, topDepth: topAt(line.wellS * KM) }
    };
  };

  // Overlap of each grid column with the model cells. Column c covers the model cells
  // cellIndex[cellStart[c] .. cellStart[c + 1] - 1]. The weights of a column sum to 1.
  const mapColumns = (model, xs, ys) => {
    const nx = xs.length - 1;
    const ny = ys.length - 1;
    const cellStart = new Int32Array(nx * ny + 1);
    const centerCell = new Int32Array(nx * ny);
    const cells = [];
    const weights = [];
    const eps = 1e-6;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const column = j * nx + i;
        const xa = xs[i] * KM;
        const xb = xs[i + 1] * KM;
        const ya = ys[j] * KM;
        const yb = ys[j + 1] * KM;
        const first = cells.length;
        let total = 0;
        for (let cj = clamp(Math.floor(ya / model.dy + eps), 0, model.ny - 1); cj * model.dy < yb - eps && cj < model.ny; cj++) {
          const overlapY = Math.min(yb, (cj + 1) * model.dy) - Math.max(ya, cj * model.dy);
          for (let ci = clamp(Math.floor(xa / model.dx + eps), 0, model.nx - 1); ci * model.dx < xb - eps && ci < model.nx; ci++) {
            const overlap = overlapY * (Math.min(xb, (ci + 1) * model.dx) - Math.max(xa, ci * model.dx));
            if (!(overlap > eps)) continue;
            cells.push(cj * model.nx + ci);
            weights.push(overlap);
            total += overlap;
          }
        }
        for (let k = first; k < weights.length; k++) weights[k] /= total;
        cellStart[column + 1] = cells.length;
        centerCell[column] = clamp(Math.floor((ya + yb) / 2 / model.dy), 0, model.ny - 1) * model.nx + clamp(Math.floor((xa + xb) / 2 / model.dx), 0, model.nx - 1);
      }
    }
    return { cellStart, cellIndex: Int32Array.from(cells), cellWeight: Float32Array.from(weights), centerCell };
  };

  // A corner-point grid over STORY_WINDOW for the 3D block. Column c = j * nx + i, with i to the
  // east and j to the north. The corners of a column are 0 south-west, 1 south-east,
  // 2 north-east and 3 north-west. top and thickness hold 4 values for each column, in m.
  // A column line lies on the fault, so each column takes the depth of its own side of the fault.
  // The fault then shows as a step. The layer k of a corner has the depth
  // top + thickness * k / nz (see storyNodeDepth).
  const storyGrid = (nx = 30, ny = 18, nz = 5) => {
    const countX = Math.max(2, Math.round(nx));
    const countY = Math.max(1, Math.round(ny));
    const layers = Math.max(1, Math.round(nz));
    const { scenario, model } = storyModel();
    const { x0, x1, y0, y1 } = STORY_WINDOW;

    const xs = new Float64Array(countX + 1);
    const ys = new Float64Array(countY + 1);
    const fault = scenario.faults[0];
    const onLine = fault && fault.strike % 180 === 0 && fault.x > x0 && fault.x < x1;
    const left = onLine ? clamp(Math.round(countX * (fault.x - x0) / (x1 - x0)), 1, countX - 1) : 0;
    for (let i = 0; i <= countX; i++) {
      if (!onLine) xs[i] = x0 + (x1 - x0) * i / countX;
      else if (i <= left) xs[i] = x0 + (fault.x - x0) * i / left;
      else xs[i] = fault.x + (x1 - fault.x) * (i - left) / (countX - left);
    }
    for (let j = 0; j <= countY; j++) ys[j] = y0 + (y1 - y0) * j / countY;

    const topAt = VE2D.depthField(scenario);
    const thicknessAt = VE2D.thicknessField(scenario);
    const top = new Float32Array(4 * countX * countY);
    const thickness = new Float32Array(4 * countX * countY);
    const inset = 1;
    for (let j = 0; j < countY; j++) {
      for (let i = 0; i < countX; i++) {
        const column = j * countX + i;
        // Each corner is read 1 m inside its own column, so it is on its own side of the fault.
        const xw = xs[i] * KM + inset;
        const xe = xs[i + 1] * KM - inset;
        const ys0 = ys[j] * KM + inset;
        const ys1 = ys[j + 1] * KM - inset;
        [[xw, ys0], [xe, ys0], [xe, ys1], [xw, ys1]].forEach(([px, py], corner) => {
          top[4 * column + corner] = topAt(px, py);
          thickness[4 * column + corner] = thicknessAt(px, py);
        });
      }
    }
    return {
      nx: countX,
      ny: countY,
      nz: layers,
      columns: countX * countY,
      window: { x0, x1, y0, y1 },
      xs,
      ys,
      faultLine: onLine ? { index: left, x: fault.x } : null,
      top,
      thickness,
      ...mapColumns(model, xs, ys)
    };
  };

  // Depth in m of layer boundary `layer` (0 to nz) at one corner of one column.
  const storyNodeDepth = (grid, column, corner, layer) => grid.top[4 * column + corner] + grid.thickness[4 * column + corner] * layer / grid.nz;

  // The gas of a model snapshot on the columns of a grid. h is the gas thickness as a fraction
  // of the column thickness (0 to 1). ch4 is the methane share of the gas (0 to 1), averaged
  // with the gas thickness of the covered model cells as weight. The snapshot needs h in m, and
  // ch4 as a fraction, on the model grid. A stored run from story-run.json works too.
  const storyColumns = (snapshot, grid) => {
    const { model } = storyModel();
    const h = new Float32Array(grid.columns);
    const ch4 = new Float32Array(grid.columns);
    for (let column = 0; column < grid.columns; column++) {
      let fraction = 0;
      let gas = 0;
      let methane = 0;
      for (let k = grid.cellStart[column]; k < grid.cellStart[column + 1]; k++) {
        const cell = grid.cellIndex[k];
        const weight = grid.cellWeight[k];
        const thickness = snapshot.h[cell];
        fraction += weight * Math.min(1, thickness / model.Hc[cell]);
        gas += weight * thickness;
        methane += weight * thickness * snapshot.ch4[cell];
      }
      h[column] = fraction;
      ch4[column] = gas > 0 ? methane / gas : 0;
    }
    return { h, ch4 };
  };

  return {
    STORY_SCENARIO, STORY_WINDOW, STORY_YEARS,
    storyModel, storySectionLine, storySection, storyGrid, storyNodeDepth, storyColumns
  };
});

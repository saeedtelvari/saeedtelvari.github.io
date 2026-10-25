const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const VE2D = require('../ve2d-model.js');
const Story = require('../story-geometry.js');
const { precompute, OUTPUT } = require('../tools/story-precompute.js');

const KM = VE2D.KM;
const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected} (±${tolerance})`);

// One run with a snapshot every year. Tests share it.
let shared = null;
const freshRun = () => shared || (shared = VE2D.run(Story.STORY_SCENARIO, { snapshotYears: 1 }));
const snapshotAt = year => freshRun().snapshots[year];

const cellX = (model, cell) => model.xc[cell % model.nx] / KM;
const cellY = (model, cell) => model.yc[Math.floor(cell / model.nx)] / KM;
const edgeCells = model => {
  const cells = [];
  for (let c = 0; c < model.n; c++) {
    const i = c % model.nx;
    const j = (c - i) / model.nx;
    if (i === 0 || j === 0 || i === model.nx - 1 || j === model.ny - 1) cells.push(c);
  }
  return cells;
};
// Methane thickness in m of one model cell.
const methaneThickness = (snapshot, c) => snapshot.h[c] * snapshot.ch4[c];

// ---------------------------------------------------------------- scenario

test('the story scenario is a frozen coarse-grid scenario that VE2D keeps as it is', () => {
  const { scenario, model } = Story.storyModel();
  assert.ok(Object.isFrozen(Story.STORY_SCENARIO));
  assert.equal(Story.storyModel(), Story.storyModel(), 'the model is cached');
  assert.deepEqual(scenario, VE2D.normalizeScenario(Story.STORY_SCENARIO));
  for (const [key, value] of Object.entries(Story.STORY_SCENARIO)) {
    if (key === 'dome' || key === 'faults') continue;
    assert.equal(scenario[key], value, `${key} is not clamped`);
  }
  assert.deepEqual(scenario.dome, Story.STORY_SCENARIO.dome);
  assert.equal(scenario.faults.length, 1);
  assert.equal(scenario.grid, 'coarse');
  assert.equal(scenario.roughness, 0);
  assert.equal(scenario.thicknessVar, 0);
  assert.equal(scenario.dipDeg, 0, 'no regional dip');
  assert.equal(scenario.injYears, 30);
  assert.equal(scenario.years, 100);
  assert.equal([model.nx, model.ny].join('x'), '40x24');
  assert.ok(scenario.gasContactDepth > 0);
  assert.ok(model.Hc.every(value => value === scenario.thickness), 'the thickness is constant');
});

test('the crest is at the dome position', () => {
  const { scenario, model, crest } = Story.storyModel();
  const dome = scenario.dome;
  const cell = Math.floor(dome.y * KM / model.dy) * model.nx + Math.floor(dome.x * KM / model.dx);
  assert.equal(crest.cell, cell, 'the shallowest cell holds the dome centre');
  assert.equal(model.traps.traps[model.traps.trapId[cell]].crestCell, cell, 'the trap crest is the same cell');
  near(crest.depth, 2000, 5, 'crest depth');
  // A fine search for the shallowest point: it is within 150 m of the dome centre.
  const depthAt = VE2D.depthField(scenario);
  let best = { depth: Infinity };
  for (let x = (dome.x - 1) * KM; x <= (dome.x + 1) * KM; x += 25) {
    for (let y = (dome.y - 1) * KM; y <= (dome.y + 1) * KM; y += 25) {
      const depth = depthAt(x, y);
      if (depth < best.depth) best = { depth, x, y };
    }
  }
  assert.ok(Math.hypot(best.x - dome.x * KM, best.y - dome.y * KM) <= 150, `shallowest point ${best.x}, ${best.y}`);
  for (const c of model.traps.traps[model.traps.trapId[cell]].cells) assert.ok(model.zt[c] >= crest.depth);
});

test('the gas contact lies between the crest and the spill depth', () => {
  const { scenario, crest, spillDepth } = Story.storyModel();
  assert.ok(Number.isFinite(spillDepth));
  assert.ok(crest.depth < scenario.gasContactDepth, 'the contact is below the crest');
  assert.ok(scenario.gasContactDepth < spillDepth - 20, 'the contact is at least 20 m above the spill depth');
});

// ---------------------------------------------------------------- gas cap, well and fault

test('there is no gas at the model edges at year 0, and no mobile gas there later', () => {
  const { model } = Story.storyModel();
  const state = VE2D.createState(model);
  const edges = edgeCells(model);
  for (const c of edges) assert.ok(state.h[c] === 0 && state.s[c] === 0 && state.ch4[c] === 0, `edge cell ${c} holds no gas at year 0`);
  assert.ok(state.hasMethane && state.h.some(value => value > 0), 'the gas cap exists');
  assert.ok(state.h.every(value => value <= model.p.H), 'the gas column fits in the aquifer');
  for (const snapshot of freshRun().snapshots) {
    for (const c of edges) assert.ok(snapshot.h[c] < 0.5 && snapshot.hMax[c] < 0.5, `year ${snapshot.year}, edge cell ${c}`);
  }
});

test('the well is outside the gas cap, and the fault is on the other side of the crest', () => {
  const { scenario, model, crest } = Story.storyModel();
  const first = snapshotAt(0);
  const wellX = cellX(model, model.well);
  const wellY = cellY(model, model.well);
  assert.equal(first.h[model.well], 0, 'the well starts outside the cap');
  assert.ok(model.zt[model.well] > scenario.gasContactDepth + 30, 'the well top is well below the contact');
  let nearest = Infinity;
  let westEdge = Infinity;
  const fault = scenario.faults[0];
  for (let c = 0; c < model.n; c++) {
    if (!(first.h[c] > 0)) continue;
    nearest = Math.min(nearest, Math.hypot(cellX(model, c) - wellX, cellY(model, c) - wellY));
    westEdge = Math.min(westEdge, cellX(model, c));
  }
  assert.ok(nearest > 3, `the cap is ${nearest} km from the well`);
  assert.ok(westEdge > fault.x + 1, `the cap stays ${westEdge - fault.x} km from the fault`);

  // From the crest, the nearest point of the fault trace and the well lie in opposite directions.
  const [x0, y0, x1, y1] = model.faultLines[0].map(value => value / KM);
  const along = clamp01(((crest.x - x0) * (x1 - x0) + (crest.y - y0) * (y1 - y0)) / ((x1 - x0) ** 2 + (y1 - y0) ** 2));
  const toFault = [x0 + along * (x1 - x0) - crest.x, y0 + along * (y1 - y0) - crest.y];
  const toWell = [wellX - crest.x, wellY - crest.y];
  assert.ok(toFault[0] * toWell[0] + toFault[1] * toWell[1] < 0, 'opposite sides of the crest');
  assert.ok(Math.hypot(...toFault) > 2 && Math.hypot(...toWell) > 4, 'both are clear of the crest');
});

const clamp01 = value => Math.max(0, Math.min(1, value));

test('the CO2 plume and the gas cap do not meet in any snapshot', () => {
  const { model } = Story.storyModel();
  let plume = 0;
  for (const snapshot of freshRun().snapshots) {
    const methane = [];
    const co2 = [];
    for (let c = 0; c < model.n; c++) {
      const share = snapshot.ch4[c];
      // A cell with more than 0.5 m of gas holds one gas only, up to a 5 % trace of the other.
      if (snapshot.h[c] > 0.5) assert.ok(share <= 0.05 || share >= 0.95, `year ${snapshot.year}, cell ${c} holds a mix (${share})`);
      if (snapshot.hMax[c] > 0.1) (share > 0.5 ? methane : co2).push(c);
    }
    if (snapshot.year === 30) plume = co2.length;
    // At least three empty cells stay between the two gases: their centres are 2 km apart.
    for (const a of methane) {
      for (const b of co2) {
        const distance = Math.hypot(cellX(model, a) - cellX(model, b), cellY(model, a) - cellY(model, b));
        assert.ok(distance >= 1.99, `year ${snapshot.year}: cells ${a} and ${b} are ${distance} km apart`);
      }
    }
  }
  assert.ok(plume > 40, `the plume exists at year 30 (${plume} cells)`);
});

test('the gas cap moves with the injection pressure and stays a cap', () => {
  const { scenario, model } = Story.storyModel();
  const start = snapshotAt(0);
  const centroid = snapshot => {
    let sum = 0;
    let weight = 0;
    for (let c = 0; c < model.n; c++) {
      sum += methaneThickness(snapshot, c) * cellX(model, c);
      weight += methaneThickness(snapshot, c);
    }
    return sum / weight;
  };
  const area = snapshot => {
    let cells = 0;
    for (let c = 0; c < model.n; c++) if (methaneThickness(snapshot, c) > 0.5) cells++;
    return cells;
  };
  const change = snapshot => {
    let total = 0;
    let moved = 0;
    let columns = 0;
    for (let c = 0; c < model.n; c++) {
      const delta = Math.abs(methaneThickness(snapshot, c) - methaneThickness(start, c));
      total += methaneThickness(start, c);
      moved += delta;
      if (delta > 0.05 * scenario.thickness) columns++;
    }
    return { relative: moved / total, columns };
  };

  const end = snapshotAt(scenario.injYears);
  const { relative, columns } = change(end);
  assert.ok(relative > 0.1, `the methane thickness changes by ${(100 * relative).toFixed(1)} % at the end of injection`);
  assert.ok(columns >= 8, `${columns} cells change by more than 5 % of the aquifer thickness`);
  const shift = centroid(start) - centroid(end);
  assert.ok(shift > 0.1 && shift < 1, `the cap moves ${shift} km away from the well`);

  // It stays a cap through the whole run.
  const initial = area(start);
  for (const snapshot of freshRun().snapshots) {
    const cells = area(snapshot);
    assert.ok(cells > 0.7 * initial && cells < 1.5 * initial, `year ${snapshot.year}: ${cells} cells against ${initial}`);
    assert.ok(snapshot.inv.methane > 0.95 * start.inv.methane, `year ${snapshot.year}: methane in place`);
    for (let c = 0; c < model.n; c++) {
      if (methaneThickness(snapshot, c) > 0.5) assert.ok(cellX(model, c) > scenario.faults[0].x + 0.5, `year ${snapshot.year}: methane at the fault`);
    }
  }
});

test('the injected CO2 is accounted for, and the run does not truncate', () => {
  const result = freshRun();
  assert.equal(result.truncated, false);
  const end = snapshotAt(Story.storyModel().scenario.injYears).inv;
  near(end.injected / VE2D.MT, 15, 0.01, 'Mt injected in 30 years');
  const classes = end.free + end.structural + end.residual + end.dissolved + end.exited + end.leaked;
  near(classes, end.injected, 1e-6 * end.injected, 'inventory classes add up to the injected mass');
  assert.equal(end.exited, 0, 'the closed boundary keeps all CO2 in the model');
  assert.equal(end.leaked, 0, 'the fault does not leak');
});

// ---------------------------------------------------------------- section

test('the section depths are finite and ordered', () => {
  const section = Story.storySection(161);
  assert.equal(section.samples, 161);
  const arrays = [section.s, section.x, section.y, section.top, section.base, ...section.horizons.map(horizon => horizon.depth)];
  for (const array of arrays) {
    assert.equal(array.length, 161);
    assert.ok(Array.from(array).every(Number.isFinite));
  }
  assert.deepEqual(section.horizons.map(horizon => horizon.id), ['sea-floor', 'sands-base', 'mudstone-base', 'chalk-base', 'reservoir-top', 'reservoir-base']);
  assert.equal(section.horizons[4].depth, section.top);
  assert.equal(section.horizons[5].depth, section.base);
  for (let k = 0; k < 161; k++) {
    for (let h = 1; h < section.horizons.length; h++) {
      assert.ok(section.horizons[h].depth[k] > section.horizons[h - 1].depth[k], `sample ${k}: ${section.horizons[h].id} below ${section.horizons[h - 1].id}`);
    }
    assert.equal(section.horizons[0].depth[k], 100);
    near(section.base[k] - section.top[k], Story.storyModel().scenario.thickness, 1e-9, 'reservoir thickness');
  }
  // The depths at the crest follow the Geology table: sands 0.8 km, mudstone 1.4 km, chalk 1.8 km, reservoir 2.0 km.
  const crest = section.s.findIndex(value => value >= section.crest.s);
  near(section.horizons[1].depth[crest], 800, 5, 'base of sands at the crest');
  near(section.horizons[2].depth[crest], 1400, 5, 'base of mudstone at the crest');
  near(section.horizons[3].depth[crest], 1800, 15, 'base of chalk at the crest');
  near(section.top[crest], 2000, 10, 'reservoir top at the crest');
  // The drape follows the dome and decays upward: the relief of the horizons is smaller higher up.
  const flank = section.s.findIndex(value => value >= section.s[160] - 1);
  const relief = depths => depths[flank] - depths[crest];
  assert.ok(relief(section.horizons[1].depth) < relief(section.horizons[2].depth));
  assert.ok(relief(section.horizons[2].depth) < relief(section.horizons[3].depth));
  assert.ok(relief(section.horizons[3].depth) < relief(section.top));
  assert.equal(section.layers.length, 7);
  assert.deepEqual(section.layers.map(layer => layer.name), ['Sea', 'Young sands and clays', 'Mudstone', 'Chalk', 'Shale caprock', 'Reservoir sandstone', 'Older rock']);
});

test('the section line runs through the crest and the well from edge to edge', () => {
  const { scenario, model } = Story.storyModel();
  const line = Story.storySectionLine();
  const well = { x: cellX(model, model.well), y: cellY(model, model.well) };
  const point = s => [line.x0 + line.ux * s, line.y0 + line.uy * s];
  near(Math.hypot(line.ux, line.uy), 1, 1e-12, 'unit direction');
  near(line.x1 - line.x0, line.ux * line.length, 1e-9, 'end x');
  near(line.y1 - line.y0, line.uy * line.length, 1e-9, 'end y');
  const [crestX, crestY] = point(line.crestS);
  near(crestX, scenario.dome.x, 1e-9, 'crest x');
  near(crestY, scenario.dome.y, 1e-9, 'crest y');
  const [wellX, wellY] = point(line.wellS);
  near(wellX, well.x, 1e-9, 'well x');
  near(wellY, well.y, 1e-9, 'well y');
  const onEdge = (x, y) => [x, y].some((value, axis) => Math.abs(value) < 1e-9 || Math.abs(value - [VE2D.LX, VE2D.LY][axis] / KM) < 1e-9);
  assert.ok(onEdge(line.x0, line.y0) && onEdge(line.x1, line.y1), 'both ends are on the model edge');
  for (const [x, y] of [[line.x0, line.y0], [line.x1, line.y1]]) assert.ok(x >= -1e-9 && x <= 20 + 1e-9 && y >= -1e-9 && y <= 12 + 1e-9);
  assert.ok(line.crestS > 2 && line.wellS > line.crestS + 4 && line.length > line.wellS + 2);
});

test('the fault crosses the section between the line start and the crest, with its throw', () => {
  const { scenario } = Story.storyModel();
  const section = Story.storySection(200);
  assert.equal(section.faults.length, 1);
  const [fault] = section.faults;
  const line = Story.storySectionLine();
  assert.ok(fault.s > 0 && fault.s < line.crestS, 'between the start and the crest');
  assert.ok(fault.s < section.crest.s && section.crest.s < section.well.s, 'fault, crest, well in this order');
  near(fault.x, scenario.faults[0].x, 1e-9, 'the crossing is on the fault trace');
  assert.ok(Math.abs(fault.t) < 1);
  near(fault.throw, scenario.faults[0].throw * (1 - fault.t ** 2), 1e-9, 'throw at the crossing');
  near(fault.topAfter - fault.topBefore, fault.throw, 0.5, 'step of the reservoir top');
  assert.equal(fault.downSide, 'end', 'the dome side goes down');
  // The step shows in the samples: the reservoir top jumps between the two samples around the crossing.
  const next = section.s.findIndex(value => value > fault.s);
  assert.ok(section.top[next] - section.top[next - 1] > 0.6 * fault.throw);
  // The chalk base carries the offset too, and the layers above it do not.
  const jump = depths => depths[next] - depths[next - 1];
  assert.ok(jump(section.horizons[3].depth) > 0.6 * fault.throw);
  assert.ok(Math.abs(jump(section.horizons[2].depth)) < 2);
  assert.ok(Math.abs(jump(section.horizons[1].depth)) < 1);
});

test('the gas cap crosses the crest of the section and lies above the contact', () => {
  const section = Story.storySection(400);
  const { crest, cap, contact, spillDepth } = section;
  assert.ok(crest.depth < contact && contact < spillDepth);
  assert.ok(cap.start < crest.s && crest.s < cap.end);
  assert.ok(cap.start > section.faults[0].s + 1, 'the cap does not reach the fault');
  assert.ok(cap.end < section.well.s - 3, 'the cap does not reach the well');
  for (let k = 0; k < section.samples; k++) {
    const inside = section.s[k] > cap.start + 0.05 && section.s[k] < cap.end - 0.05;
    if (inside) assert.ok(section.top[k] < contact, `sample ${k} is inside the cap`);
    else if (section.s[k] < cap.start - 0.05 || section.s[k] > cap.end + 0.05) assert.ok(section.top[k] > contact, `sample ${k} is outside the cap`);
  }
  assert.ok(section.well.topDepth > contact + 30);
  near(Math.min(...section.top), crest.depth, 0.5, 'crest depth');
});

// ---------------------------------------------------------------- grid

const columnArea = (grid, i, j) => (grid.xs[i + 1] - grid.xs[i]) * (grid.ys[j + 1] - grid.ys[j]);

test('storyGrid columns cover the window and put a column line on the fault', () => {
  const { scenario } = Story.storyModel();
  const fault = scenario.faults[0];
  const { x0, x1, y0, y1 } = Story.STORY_WINDOW;
  for (const [nx, ny, nz] of [[30, 18, 5], [24, 14, 4], [17, 9, 3], [10, 6, 2]]) {
    const grid = Story.storyGrid(nx, ny, nz);
    assert.deepEqual([grid.nx, grid.ny, grid.nz, grid.columns], [nx, ny, nz, nx * ny]);
    assert.deepEqual(grid.window, Story.STORY_WINDOW);
    assert.equal(grid.xs.length, nx + 1);
    assert.equal(grid.ys.length, ny + 1);
    near(grid.xs[0], x0, 1e-12, 'west edge');
    near(grid.xs[nx], x1, 1e-12, 'east edge');
    near(grid.ys[0], y0, 1e-12, 'south edge');
    near(grid.ys[ny], y1, 1e-12, 'north edge');
    for (let i = 0; i < nx; i++) assert.ok(grid.xs[i + 1] > grid.xs[i]);
    for (let j = 0; j < ny; j++) assert.ok(grid.ys[j + 1] > grid.ys[j]);
    let area = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) area += columnArea(grid, i, j);
    near(area, (x1 - x0) * (y1 - y0), 1e-9, `${nx} x ${ny} columns cover the window`);
    near(grid.xs[grid.faultLine.index], fault.x, 1e-12, 'a column line lies on the fault');
    assert.equal(grid.top.length, 4 * nx * ny);
    assert.equal(grid.thickness.length, 4 * nx * ny);
    assert.ok(grid.thickness.every(value => value === scenario.thickness));
    assert.ok(grid.top.every(Number.isFinite));
  }
});

test('storyGrid maps each column to the model cells that it covers', () => {
  const { model } = Story.storyModel();
  const { x0, x1, y0, y1 } = Story.STORY_WINDOW;
  for (const [nx, ny] of [[30, 18], [24, 14], [17, 9], [15, 9]]) {
    const grid = Story.storyGrid(nx, ny, 3);
    const covered = new Float64Array(model.n);
    assert.equal(grid.cellStart.length, grid.columns + 1);
    assert.equal(grid.cellStart[0], 0);
    assert.equal(grid.cellStart[grid.columns], grid.cellIndex.length);
    assert.equal(grid.cellWeight.length, grid.cellIndex.length);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const column = j * nx + i;
        assert.ok(grid.cellStart[column + 1] > grid.cellStart[column]);
        let sum = 0;
        for (let k = grid.cellStart[column]; k < grid.cellStart[column + 1]; k++) {
          sum += grid.cellWeight[k];
          covered[grid.cellIndex[k]] += grid.cellWeight[k] * columnArea(grid, i, j) * KM * KM;
        }
        near(sum, 1, 1e-6, `weights of column ${column}`);
        const centre = grid.centerCell[column];
        near(cellX(model, centre), (grid.xs[i] + grid.xs[i + 1]) / 2, model.dx / KM / 2 + 1e-9, 'centre cell x');
        near(cellY(model, centre), (grid.ys[j] + grid.ys[j + 1]) / 2, model.dy / KM / 2 + 1e-9, 'centre cell y');
      }
    }
    // Every model cell inside the window is covered once, and no cell outside it is covered.
    for (let c = 0; c < model.n; c++) {
      const inside = cellX(model, c) > x0 && cellX(model, c) < x1 && cellY(model, c) > y0 && cellY(model, c) < y1;
      near(covered[c], inside ? model.area : 0, 1e-3 * model.area, `cell ${c} in the ${nx} x ${ny} grid`);
    }
  }
  // With one column for each model cell, the mapping is one to one.
  const grid = Story.storyGrid(30, 18, 5);
  for (let j = 0; j < 18; j++) {
    for (let i = 0; i < 30; i++) {
      const column = j * 30 + i;
      assert.equal(grid.cellStart[column + 1] - grid.cellStart[column], 1);
      assert.equal(grid.cellIndex[grid.cellStart[column]], (3 + j) * model.nx + 9 + i);
      near(grid.cellWeight[grid.cellStart[column]], 1, 1e-6, 'weight');
    }
  }
});

test('the storyGrid node depths show the fault as a step and are continuous elsewhere', () => {
  const { scenario } = Story.storyModel();
  const fault = scenario.faults[0];
  for (const [nx, ny] of [[30, 18], [24, 14], [17, 9]]) {
    const grid = Story.storyGrid(nx, ny, 4);
    const line = grid.faultLine.index;
    const top = (i, j, corner) => grid.top[4 * (j * nx + i) + corner];
    for (let j = 0; j < ny; j++) {
      // The fault trace runs north-south, so the throw depends on the y position of the corner row.
      for (const [corner, row] of [[0, grid.ys[j]], [3, grid.ys[j + 1]]]) {
        const t = (row - fault.y) / (fault.length / 2);
        const expected = fault.throw * (1 - t * t);
        const step = top(line, j, corner) - top(line - 1, j, corner === 0 ? 1 : 2);
        near(step, expected, 0.5, `step on row ${j}, y ${row} km`);
        assert.ok(step > 0, 'the east side is deeper');
      }
    }
    // Columns next to each other share their node depths, except across the fault.
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx - 1; i++) {
        if (i + 1 === line) continue;
        near(top(i, j, 1), top(i + 1, j, 0), 0.5, `south edge, columns ${i} and ${i + 1}`);
        near(top(i, j, 2), top(i + 1, j, 3), 0.5, `north edge, columns ${i} and ${i + 1}`);
      }
    }
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx; i++) {
        near(top(i, j, 3), top(i, j + 1, 0), 0.5, `column ${i}, rows ${j} and ${j + 1}`);
        near(top(i, j, 2), top(i, j + 1, 1), 0.5, `column ${i}, rows ${j} and ${j + 1}`);
      }
    }
    const column = 5 * nx + 9;
    for (let corner = 0; corner < 4; corner++) {
      assert.equal(Story.storyNodeDepth(grid, column, corner, 0), grid.top[4 * column + corner]);
      near(Story.storyNodeDepth(grid, column, corner, 4) - Story.storyNodeDepth(grid, column, corner, 0), 100 * 4 / grid.nz, 1e-3, 'layer step');
      near(Story.storyNodeDepth(grid, column, corner, grid.nz) - grid.top[4 * column + corner], scenario.thickness, 1e-3, 'base');
    }
  }
});

test('the crest column of the grid is the shallowest', () => {
  const { crest } = Story.storyModel();
  const grid = Story.storyGrid(30, 18, 5);
  let best = 0;
  for (let c = 1; c < grid.columns; c++) {
    const mean = k => (grid.top[4 * k] + grid.top[4 * k + 1] + grid.top[4 * k + 2] + grid.top[4 * k + 3]) / 4;
    if (mean(c) < mean(best)) best = c;
  }
  const i = best % 30;
  const j = (best - i) / 30;
  near(grid.xs[i] + 0.25, crest.x, 0.5, 'crest column x');
  near(grid.ys[j] + 0.25, crest.y, 0.5, 'crest column y');
});

// ---------------------------------------------------------------- columns

test('storyColumns gives the gas fraction and the methane share of each column', () => {
  const { scenario, model, crest } = Story.storyModel();
  const grid = Story.storyGrid(30, 18, 5);
  const columnOf = cell => (Math.floor(cell / model.nx) - 3) * 30 + (cell % model.nx) - 9;
  const start = Story.storyColumns(snapshotAt(0), grid);
  assert.ok(start.h instanceof Float32Array && start.ch4 instanceof Float32Array);
  assert.equal(start.h.length, grid.columns);
  const crestColumn = columnOf(crest.cell);
  near(start.h[crestColumn], (scenario.gasContactDepth - crest.depth) / scenario.thickness, 1e-6, 'crest gas fraction');
  assert.equal(start.ch4[crestColumn], 1, 'the cap is methane');
  const wellColumn = columnOf(model.well);
  assert.equal(start.h[wellColumn], 0);
  assert.equal(start.ch4[wellColumn], 0);

  const end = Story.storyColumns(snapshotAt(scenario.injYears), grid);
  assert.ok(end.h[wellColumn] > 0.3, `gas fraction at the well: ${end.h[wellColumn]}`);
  assert.ok(end.ch4[wellColumn] < 0.01, 'the plume is CO2');
  for (const snapshot of freshRun().snapshots) {
    const columns = Story.storyColumns(snapshot, grid);
    assert.ok(columns.h.every(value => value >= 0 && value <= 1 + 1e-6));
    assert.ok(columns.ch4.every(value => value >= 0 && value <= 1 + 1e-6));
    assert.ok(columns.ch4.every((value, c) => columns.h[c] > 0 || value === 0), 'no methane share without gas');
  }

  // A coarse grid averages the model cells that each column covers.
  const coarse = Story.storyGrid(15, 9, 3);
  const snapshot = snapshotAt(scenario.injYears);
  const averaged = Story.storyColumns(snapshot, coarse);
  for (let c = 0; c < coarse.columns; c++) {
    let fraction = 0;
    let gas = 0;
    let methane = 0;
    for (let k = coarse.cellStart[c]; k < coarse.cellStart[c + 1]; k++) {
      const cell = coarse.cellIndex[k];
      fraction += coarse.cellWeight[k] * snapshot.h[cell] / model.Hc[cell];
      gas += coarse.cellWeight[k] * snapshot.h[cell];
      methane += coarse.cellWeight[k] * snapshot.h[cell] * snapshot.ch4[cell];
    }
    near(averaged.h[c], fraction, 1e-5, `gas fraction of column ${c}`);
    near(averaged.ch4[c], gas > 0 ? methane / gas : 0, 1e-5, `methane share of column ${c}`);
  }
});

// ---------------------------------------------------------------- stored run

test('assets/story-run.json equals a fresh run, within the rounding', () => {
  const text = fs.readFileSync(OUTPUT, 'utf8');
  const stored = JSON.parse(text);
  const fresh = precompute();
  assert.ok(text.length < 60 * 1024, `${text.length} bytes`);
  assert.deepEqual(stored.scenario, fresh.scenario);
  assert.deepEqual(stored.grid, [40, 24]);
  assert.deepEqual(stored.years, Array.from(Story.STORY_YEARS));
  assert.deepEqual(stored.steps, fresh.steps);
  for (const year of [0, 5, 10, 20, 30, 100]) assert.ok(stored.years.includes(year), `year ${year} is stored`);
  assert.equal(stored.frames.length, fresh.frames.length);
  stored.frames.forEach((frame, index) => {
    const expected = fresh.frames[index];
    assert.equal(frame.year, expected.year);
    assert.equal(frame.h.length, 960);
    assert.equal(frame.ch4.length, 960);
    for (let c = 0; c < 960; c++) {
      assert.ok(Math.abs(frame.h[c] - expected.h[c]) <= fresh.steps.h + 1e-9, `year ${frame.year}, h of cell ${c}`);
      assert.ok(Math.abs(frame.ch4[c] - expected.ch4[c]) <= fresh.steps.ch4 + 1e-9, `year ${frame.year}, ch4 of cell ${c}`);
    }
    for (const key of Object.keys(expected.inventoryMt)) {
      assert.ok(Math.abs(frame.inventoryMt[key] - expected.inventoryMt[key]) <= fresh.steps.inventoryMt + 1e-9, `year ${frame.year}, ${key}`);
    }
  });
  // The stored frames feed storyColumns like a live snapshot does.
  const grid = Story.storyGrid(30, 18, 5);
  const live = Story.storyColumns(snapshotAt(30), grid);
  const frame = stored.frames.find(entry => entry.year === 30);
  const fromFile = Story.storyColumns(frame, grid);
  for (let c = 0; c < grid.columns; c++) {
    near(fromFile.h[c], live.h[c], 0.001, `stored gas fraction of column ${c}`);
    // The methane share of a film thinner than the rounding step is not stored.
    if (live.h[c] * Story.storyModel().scenario.thickness > 1) near(fromFile.ch4[c], live.ch4[c], 0.02, `stored methane share of column ${c}`);
  }
  near(frame.inventoryMt.injected, 15, 0.01, 'stored injected Mt at year 30');
  assert.ok(stored.frames[0].inventoryMt.methane > 30, 'methane in place at year 0');
});

// ---------------------------------------------------------------- browser use

test('StoryGeometry loads in a browser-like context on top of the VE2D global', () => {
  const sandbox = { VE2D };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'story-geometry.js'), 'utf8'), sandbox);
  const { StoryGeometry } = sandbox;
  assert.deepEqual(Object.keys(StoryGeometry).sort(), Object.keys(Story).sort());
  assert.equal(StoryGeometry.storySection(10).samples, 10);
  assert.equal(StoryGeometry.storyGrid(8, 5, 2).columns, 40);
});

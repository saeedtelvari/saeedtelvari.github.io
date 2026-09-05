# VE Simulator 3D Topography Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive native-canvas orbit viewer for the existing 2D Map grid without changing solver, playback, UQ, or export semantics.

**Architecture:** Keep `Ve2DMapPanel` as the single owner of map simulation state and add a sibling `Ve3DTopographyPanel` that consumes its snapshots. Pure projection/camera helpers stay at the top of `SimulatorPage.jsx`; camera interaction is local component state, and the existing CSS workbench tokens style the new tab and canvas.

**Tech Stack:** React via the existing global bundle, native Canvas 2D API, Pointer Events, Wheel Events, Node’s built-in test runner, existing build script.

---

### Task 1: Add projection and camera contracts

**Files:**
- Modify: `SimulatorPage.jsx` near the existing map helpers
- Modify: `tests/simulator-workbench.test.js`

- [ ] **Step 1: Write failing pure-helper tests**

Add tests that load the pre-React helper prelude and assert literal behavior:

```js
test('topography projection stays inside the canvas for bounded camera values', () => {
  const { projectTopographyPoint } = loadTopographyHelpers();
  const point = projectTopographyPoint({ x: 0.5, y: 0.5, height: 1 }, {
    width: 1000, height: 600, azimuth: 0.8, elevation: 0.55, zoom: 1
  });
  assert.ok(point.x >= -80 && point.x <= 1080);
  assert.ok(point.y >= -80 && point.y <= 680);
});

test('camera values clamp and reset to the readable default', () => {
  const { clampTopographyCamera, DEFAULT_TOPOGRAPHY_CAMERA } = loadTopographyHelpers();
  assert.deepEqual(clampTopographyCamera({ azimuth: 99, elevation: -5, zoom: 9 }), {
    azimuth: Math.PI * 2,
    elevation: 0.22,
    zoom: 2.2
  });
  assert.deepEqual(DEFAULT_TOPOGRAPHY_CAMERA, { azimuth: -0.72, elevation: 0.62, zoom: 1 });
});
```

Extend the existing VM helper loader to expose only these pure helpers.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `node --test --test-name-pattern="topography projection|camera values" tests/simulator-workbench.test.js`

Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement the smallest pure helpers**

Add these module-scope helpers before `Ve2DMapPanel`:

```js
const DEFAULT_TOPOGRAPHY_CAMERA = { azimuth: -0.72, elevation: 0.62, zoom: 1 };
const clampTopographyCamera = camera => ({
  azimuth: Math.max(-Math.PI * 2, Math.min(Math.PI * 2, Number(camera.azimuth) || 0)),
  elevation: Math.max(0.22, Math.min(1.12, Number(camera.elevation) || DEFAULT_TOPOGRAPHY_CAMERA.elevation)),
  zoom: Math.max(0.65, Math.min(2.2, Number(camera.zoom) || DEFAULT_TOPOGRAPHY_CAMERA.zoom))
});
const projectTopographyPoint = ({ x, y, height }, camera) => {
  const cosA = Math.cos(camera.azimuth);
  const sinA = Math.sin(camera.azimuth);
  const lateral = (x - 0.5) * cosA - (y - 0.5) * sinA;
  const depth = (x - 0.5) * sinA + (y - 0.5) * cosA;
  const scale = 520 * camera.zoom;
  return {
    x: 500 + lateral * scale,
    y: 350 + depth * scale * camera.elevation - height * 180 * camera.elevation * camera.zoom
  };
};
```

- [ ] **Step 4: Run focused tests and commit**

Run: `node --test --test-name-pattern="topography projection|camera values" tests/simulator-workbench.test.js`

Expected: PASS.

```bash
git add SimulatorPage.jsx tests/simulator-workbench.test.js
git commit -m "test: define topography projection contract"
```

### Task 2: Build the native-canvas orbit panel

**Files:**
- Modify: `SimulatorPage.jsx` after `Ve2DMapPanel`
- Modify: `simulator-workbench.css`
- Modify: `tests/simulator-workbench.test.js`

- [ ] **Step 1: Add structural/accessibility RED tests**

Assert that the source exposes one `Ve3DTopographyPanel`, a labelled canvas, `Reset view`, bounded elevation control, pointer handlers, and no auto-rotation:

```js
test('3D topography panel exposes orbit controls without a new renderer dependency', () => {
  const page = read('SimulatorPage.jsx');
  assert.match(page, /const Ve3DTopographyPanel/);
  assert.match(page, /aria-label=\{`3D topography grid at year/);
  assert.match(page, />Reset view</);
  assert.match(page, /onPointerDown=/);
  assert.match(page, /onPointerMove=/);
  assert.match(page, /onWheel=/);
  assert.doesNotMatch(page, /three|THREE|requestAnimationFrame/);
});
```

Run: `node --test --test-name-pattern="3D topography panel" tests/simulator-workbench.test.js`

Expected: FAIL because the component does not exist.

- [ ] **Step 2: Implement the panel with shared map state**

Implement `Ve3DTopographyPanel({ mapSnapshot, mapCols, mapRows, faultCount, faults, injLocation, wellY })` with:

- one canvas and a `useEffect` that clears/draws the grid from `mapSnapshot.h`/`hMax`;
- camera state initialized from `DEFAULT_TOPOGRAPHY_CAMERA` and updated through `clampTopographyCamera`;
- pointer capture drag handling that changes azimuth/elevation only;
- wheel handling that changes bounded zoom;
- two-finger pinch handling via the existing pointer events, with single-finger drag preserved;
- a `Reset view` button and a bounded `Elevation exaggeration` native range input;
- fault lines and injector marker projected into the same surface;
- text showing `Year`, `mapCols × mapRows`, zoom, and elevation scale;
- no changes to `Ve2DMapPanel` simulation commands or snapshots.

Use explicit transitions only for control feedback; do not animate camera movement or auto-rotate.

- [ ] **Step 3: Add scoped CSS and verify GREEN**

Add `.ve-topography-panel`, `.ve-topography-canvas`, `.ve-topography-toolbar`, and `.ve-topography-status` using existing `--ve-canvas`, `--ve-border`, `--ve-accent`, `--ve-ink`, and `--ve-muted` tokens. Keep the canvas touch action `none`, controls at least 44px on mobile, and add `:focus-visible` without `transition: all`.

Run: `node --test --test-name-pattern="3D topography panel|topography projection|camera values" tests/simulator-workbench.test.js`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add SimulatorPage.jsx simulator-workbench.css tests/simulator-workbench.test.js
git commit -m "feat: add 3D topography orbit panel"
```

### Task 3: Integrate the viewer into the simulator tabs

**Files:**
- Modify: `SimulatorPage.jsx`
- Modify: `simulator-workbench.css`
- Modify: `tests/simulator-workbench.test.js`

- [ ] **Step 1: Write failing integration tests**

Assert exact tab and mounting semantics:

```js
test('3D topography is a visualization peer and keeps the 2D map mounted', () => {
  const page = read('SimulatorPage.jsx');
  assert.match(page, /VISUALIZATION_TABS = \['profile', 'map', 'topography'\]/);
  assert.match(page, /id="tab-topography"/);
  assert.match(page, /aria-controls="tabpanel-topography"/);
  assert.match(page, /<Ve3DTopographyPanel/);
  assert.match(page, /hidden=\{activeSubTab !== 'map' && activeSubTab !== 'topography'\}/);
});
```

Run: `node --test --test-name-pattern="3D topography is a visualization peer" tests/simulator-workbench.test.js`

Expected: FAIL because only profile/map are registered.

- [ ] **Step 2: Wire the shared map lifecycle**

Add `'topography'` to `SIM_TABS` and `VISUALIZATION_TABS`; include it in map run/reset status branches; render the 3D tab and panel; keep the single `Ve2DMapPanel` mounted while either map view is active; pass the latest `mapSnapshot` into `Ve3DTopographyPanel`. Do not add a second worker or solver.

- [ ] **Step 3: Update labels and responsive rules**

Use `3D Topography` as the visible tab label, keep the existing 2D Map default behavior, and ensure the tab strip scrolls cleanly at narrow widths. At mobile widths, preserve the normal-flow legend and keep the orbit canvas above the sheet triggers.

- [ ] **Step 4: Run all focused tests and commit**

Run: `node --test tests/simulator-workbench.test.js tests/ve2d-model.test.js`

Expected: PASS.

```bash
git add SimulatorPage.jsx simulator-workbench.css tests/simulator-workbench.test.js
git commit -m "feat: integrate 3D topography workspace tab"
```

### Task 4: Rebuild and verify the live viewer

**Files:**
- Modify: `simulator.html` only if the generated bundle cache version changes
- Modify: `tests/site-smoke.js` only if the cache version changes
- Generate: `bundle.js`, `simulator-bundle.js`

- [ ] **Step 1: Run complete automated verification**

Run:

```bash
node --test tests/ve2d-model.test.js tests/simulator-workbench.test.js
node tests/site-smoke.js
node build.js
git diff HEAD~1 --check
```

Expected: all tests pass, smoke succeeds, both bundles execute cleanly, and diff check is clean.

- [ ] **Step 2: Verify the live browser flow**

At desktop, open `3D Topography`, drag to rotate, wheel to zoom, change elevation exaggeration, reset the camera, switch back to 2D Map, and confirm year/grid/mass state is unchanged. At 390×844, confirm the tab strip, canvas, controls, and mobile sheets remain usable without horizontal overflow.

- [ ] **Step 3: Capture evidence and inspect fidelity**

Capture the 3D desktop and mobile states outside tracked source, then compare them to the approved slate references. Check canvas contrast, grid readability, fault/injector overlays, control spacing, focus rings, and reduced-motion behavior. Record any material mismatch before making a minimal fix.

- [ ] **Step 4: Commit generated output**

```bash
git add SimulatorPage.jsx simulator-workbench.css tests/simulator-workbench.test.js simulator.html tests/site-smoke.js bundle.js simulator-bundle.js
git commit -m "feat: ship 3D topography viewer"
```

- [ ] **Step 5: Final status**

Run: `git status --short`

Expected: clean worktree except unrelated user-owned files outside this feature.

# CO₂ Storage Simulator (Night Survey) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the teal VE workbench and its two toy solvers with one SI vertical-equilibrium engine and a night-survey UI (Map · 3D · Section, Uncertainty, Method).

**Architecture:** `ve2d-model.js` is a dependency-free UMD engine (Node + browser + worker). `simulation-worker.js` runs scenarios and Monte-Carlo batches off the main thread and streams snapshots. React (CDN UMD, Babel pre-compiled by `build.js`) renders three canvas/SVG views from the streamed snapshots; playback is pure scrubbing of precomputed results.

**Tech Stack:** React 18 UMD, Babel-standalone build (`node build.js`), Canvas 2D + SVG, Web Workers, `node:test`, KaTeX 0.16.9 (cdnjs) for the Method page, puppeteer-core (scratchpad only) for screenshot QA.

**Spec:** `docs/superpowers/specs/2026-10-13-co2-simulator-night-survey-design.md`

**Execution note:** the owner pre-authorised implementation and will review the branch. Engine tasks carry full test code; UI tasks specify interfaces, behaviour and acceptance checks, and the code is written once, in the files, during execution.

## Global Constraints

- SI internally; display units: Mt, Mt/yr, mD, m, km, bar, years, mPa·s, kg/m³, kg m⁻² yr⁻¹.
- Domain 20 × 12 km; grids coarse 40 × 24, standard 80 × 48, fine 120 × 72.
- Inventory classes and colours exactly as spec §4.2 (night/day); stack order dissolved, residual, structural, free, left the model, leaked.
- Fonts: Montserrat, Open Sans, JetBrains Mono only; minimum text 12 px; KaTeX 0.16.9 from cdnjs.
- No new runtime dependencies besides KaTeX. Homepage hero untouched.
- `build.js` concatenates into one script scope: top-level names must be unique across `ve2d-model.js`, `GuidePage.jsx`, `SimCharts.jsx`, `SimViews.jsx`, `SimulatorPage.jsx` and the home bundle files.
- No module-scope access to `window`, `document`, `Worker`, `matchMedia` (the build validates bundles in a mocked VM).
- CRLF files (`index.html`, some `.jsx`) are edited with the Edit tool, never MSYS `sed -i`.
- Never `transition: all`; UI motion 150–250 ms `cubic-bezier(0.23, 1, 0.32, 1)`; everything decorative off under `prefers-reduced-motion`.
- Page/browser names: "CO₂ Storage Simulator", "CO₂ Storage Simulator | Sa'eed Telvari"; nav label "CO₂ Simulator"; sections Simulator · Uncertainty · Method; views Map · 3D · Section.

## Review Focus

1. Extreme but legal inputs (5 Mt/yr into a 10 m, 10 mD aquifer, closed boundaries): the run must finish in bounded time, conserve mass and surface a pressure warning instead of freezing the tab — pinned in Task 5 (`extreme inputs finish and conserve`).
2. Well or fault geometry at the edges (well on a fault trace or at the domain edge, zero-length fault, throw ≥ H): positions clamp inside the domain and the run conserves mass — pinned in Task 1 (`normalizeScenario clamps geometry`) and Task 5.
3. Rapid input changes while a run streams: stale snapshots from an older run must never be displayed — pinned in Task 6 (`stale run ids are ignored`).
4. Hand-edited or truncated share links (NaN, out-of-range, unknown keys, too many faults): decode to a valid scenario — pinned in Task 8 (`share link round trip and hostile query`).
5. Reduced-motion users and phones at 390 px: no particles/loops, no horizontal overflow, scrubber visible — pinned in Task 15 (CSS contract test) and the Task 16 screenshot checks.

---

### Task 1: Engine scenario, geometry and grid

**Files:**
- Rewrite: `ve2d-model.js`
- Rewrite: `tests/ve2d-model.test.js`

**Interfaces:**
- Produces: `VE2D.DEFAULTS`, `VE2D.LIMITS` (`{key: [min, max, step]}`), `VE2D.PRESETS` (`{id: {label, description, patch}}`), `VE2D.normalizeScenario(raw) → scenario`, `VE2D.topDepth(x_m, y_m, scenario) → depth_m`, `VE2D.buildModel(scenario) → model`, unit constants `YEAR, MT, MD, BAR, MPAS, KM`.
- Scenario (flat, display units): `grid, years, boundary, rateMt, injYears, wellX, wellY (km), permMd, porosity, thickness, ct (×1e-4/bar), rhoCo2, rhoBrine, muCo2, muBrine (mPa·s), swr, sgr, krg, disRate, disCap, depth, dipDeg, dipAz, domes, domeRelief, roughness, seed, faults: [{x, y, strike, length, throw, trans, sealCap, kf}]` (x, y, length in km).
- Model: `{nx, ny, n, dx, dy, Lx, Ly, H, phi, k, zt: Float64Array, xc, yc, tx: Float64Array((nx+1)*ny), ty: Float64Array(nx*(ny+1)), mx, my (fault multipliers), ghostX, ghostY (boundary ghost depths), well: index, leakCells: [{cell, length, fault}], faultLines: [[x0,y0,x1,y1]], p: SI parameter bag}`.

- [ ] **Step 1: Write failing tests** — `normalizeScenario` fills defaults and clamps (`{rateMt: 99, wellX: -5, faults: 5 × fault}` → rate 5, wellX ≥ 0.5 km, faults.length 3; NaN → default); `topDepth` relief: dip 1° over 20 km gives 349 ± 1 m east–west difference with no domes/roughness; a fault with throw 30 m offsets depth by 30 m across the trace mid-length and tapers to 0 at its tips; `buildModel` x-face multiplier 0 across a fault with `trans: 0`, and `max(0, 1 − throw/H)` for `throw/H = 0.5, trans 1` → 0.5; leak lengths summed over cells equal the clipped trace length within 2 % at all three grids.
- [ ] **Step 2: Run** `node --test tests/ve2d-model.test.js` → FAIL (functions undefined).
- [ ] **Step 3: Implement** scenario defaults/limits/presets, normaliser, analytic top surface (dip plane, seeded anisotropic Gaussian domes in metres, seeded multi-octave roughness normalised to ±1 × roughness, tapered fault throw on the hanging wall), grid build, face transmissibilities (TPFA, `k · face length / centre distance`), fault crossing multipliers via segment–face intersection, boundary ghost depths from the analytic surface at half a cell outside, per-cell fault trace lengths by sampling the clipped trace at Δs = min(dx, dy)/20.
- [ ] **Step 4: Run tests** → PASS.
- [ ] **Step 5: Commit** `feat(engine): SI scenario, geometry and grid`.

### Task 2: Spill-point trap analysis and contouring

**Files:** Modify `ve2d-model.js`; Test `tests/ve2d-model.test.js`

**Interfaces:**
- Produces: `VE2D.trapAnalysis(model) → {zSpill: Float64Array, trapId: Int32Array, traps: [{id, cells, spillCell, spillDepth, crestCell, capacity_m3}]}` (stored on `model.traps` by `buildModel`); `VE2D.contourSegments(values, nx, ny, level) → Float64Array` of segment endpoints `[x0, y0, x1, y1, …]` in cell-centre index coordinates.

- [ ] **Step 1: Failing tests** — single Gaussian dome (relief 40 m, no dip): exactly one trap, crest at the dome centre cell, spill depth equals the highest edge-connected saddle (within one grid cell's depth change), `zSpill > zt` only inside; a sealing fault (`trans 0`) across a dipping plane creates a fault-bounded trap on its up-dip side; with `trans 1` no trap; `contourSegments` on `f(i, j) = i` at level 2.5 returns vertical segments at x = 2.5 covering the full height.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** priority flood (binary heap) seeded from all boundary cells with their own depth; neighbours only through faces with multiplier > 0; `zSpill[n] = max(zt[n], level)` where CO₂ "falls" toward smaller depth, i.e. flood on −depth; label connected `zSpill > zt + 1e-6` regions as traps, record crest (min depth) and spill cell (where the flood entered). Marching squares with saddle disambiguation by the cell-average.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `feat(engine): spill-point trap analysis and contours`.

### Task 3: Explicit VE transport, residual hysteresis, boundaries

**Files:** Modify `ve2d-model.js`; Test `tests/ve2d-model.test.js`

**Interfaces:**
- Produces: `VE2D.createState(model) → {t, h, hMax, md, p, s, injected, exited, leaked, dissolved, ux, uy, fx, fy, pressureActive}`; `VE2D.advance(model, state, tTarget_s)`; internal `stepTransport(model, state, dtMax) → dt`.

- [ ] **Step 1: Failing tests** —
  - *conservation*: inject 1 Mt/yr for 30 yr into the default geometry, open and closed, 300 yr: `|injected − (Σ s ρ A + exited + leaked + dissolved)| / injected < 1e-9`;
  - *bounds*: every snapshot `0 ≤ h ≤ H`, `h ≤ hMax + 1e-12`;
  - *symmetry*: flat surface, centred well, closed: `h` mirror-symmetric in x and y to 1e-9 relative;
  - *slope speed*: 1° dip, no injection, initial 2 m thin lens: centroid speed over 50 yr within 15 % of `k k_rg* Δρ g sinθ / (μ_g φ (1 − S_wr))`;
  - *residual*: after the lens passes, cells behind it hold `s = φ S_gr hMax` (h = 0);
  - *open boundary direction*: lens at the down-dip edge (no injection) exits 0; lens at the up-dip edge exits > 0.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** inversion `s ↔ (h, hMax)`; face gas flux with hybrid upwinding (spec §5.2) for interior and ghost faces; CFL Δt (spec §5.8, factor 0.4, bounds on ∂F/∂h for buoyancy, slope and viscous terms); explicit update of `s`; exited bookkeeping on ghost faces; store face fluxes in `fx`, `fy`.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `feat(engine): conservative VE transport with hybrid upwinding`.

### Task 4: Pressure, injection and Peaceman build-up

**Files:** Modify `ve2d-model.js`; Test `tests/ve2d-model.test.js`

**Interfaces:**
- Produces: `solvePressure(model, state, dt) → iterations` (Jacobi-PCG, warm start, rel. tol 1e-8, max 2000 its) setting `state.p`, `state.ux`, `state.uy`; `VE2D.kpis(model, state) → {footprint_m2, maxColumn_m, migration_m, bhp_Pa, pMax_Pa}`.

- [ ] **Step 1: Failing tests** —
  - *closed box*: inject 30 Mt over 30 yr, closed: mean `p` within 3 % of `V_inj/(φ c_t V_bulk)`;
  - *Nordbotten–Celia*: Δρ = 0, flat, open, 10 yr at 1 Mt/yr on the fine grid: equivalent plume radius `sqrt(footprint/π)` within 10 % of `sqrt(M V/(π φ (1 − S_wr) H))`, with `M = (k_rg*/μ_g)/(1/μ_w)`;
  - *open relaxes*: 20 yr after injection stops, open: `max|p| < 0.05 bar`; pressure flag off;
  - *Peaceman*: `bhp` decreases by < 10 % between standard and fine grids for the same scenario at end of injection.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** matrix-free operator `(φ c_t H A/Δt) p + Σ T m Λ_T Δp` with Λ_T face average, gravity RHS, Dirichlet ghost faces (open), source at the well cell; total face flux; pressure active while injecting and until the largest change over one year < 0.05 bar, then `ux = uy = 0`; Peaceman correction.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `feat(engine): IMPES pressure, injection and Peaceman build-up`.

### Task 5: Leakage, dissolution, inventory and run driver

**Files:** Modify `ve2d-model.js`; Test `tests/ve2d-model.test.js`

**Interfaces:**
- Produces: `VE2D.inventory(model, state) → {injected, free, structural, residual, dissolved, exited, leaked, balance}` (kg); `VE2D.run(scenario, {snapshotYears = 5, onModel(modelView), onSnapshot(snap), keepSnapshots = true}) → {modelView, snapshots, history}` where `modelView = {nx, ny, dx, dy, Lx, Ly, H, zt, zSpill, trapId, traps, faultLines, faults, well, depth}` and `snap = {year, h, hMax, md, p (Float32Array), fx, fy, leaking: Uint8Array(faults), inv, kpi}`; history rows `{year, injected, free, structural, residual, dissolved, exited, leaked, balance, footprint, maxColumn, migration, bhp}`.

- [ ] **Step 1: Failing tests** —
  - *leak threshold*: fault-bounded column below `sealCap` leaks 0; raising the column above it leaks > 0 and the column never drops below `sealCap − 1e-9`;
  - *dissolution capacity*: `md ≤ disCap φ H + 1e-9` always; with `disRate = 0` dissolved = 0;
  - *inventory sums*: `|balance| / injected < 1e-9` at every history row of the default preset;
  - *grid convergence*: default preset at 1000 yr, standard vs fine: footprint and leaked fraction differ < 10 %;
  - *extreme inputs finish and conserve*: `rateMt 5, thickness 10, permMd 10, boundary closed, years 200` finishes in < 20 s and conserves to 1e-9;
  - *performance*: default preset, standard grid, 1000 yr runs in < 3 s in Node.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** leakage (spec §5.5) and dissolution (spec §5.6) as operator-split sinks after each transport step, structural/free split with `zSpill`, history/snapshot driver with output-time alignment, `MAX_STEPS = 400000` guard that ends the run early with `result.truncated = true`.
- [ ] **Step 4: Run** → PASS. **Step 5: Commit** `feat(engine): leakage, dissolution, inventory and run driver`.

### Task 6: Simulation worker and uncertainty batch

**Files:** Create `simulation-worker.js`; Delete `uq-worker.js`; Modify `ve2d-model.js`; Test `tests/ve2d-model.test.js`

**Interfaces:**
- Produces engine helpers: `VE2D.mulberry32(seed)`, `VE2D.latinHypercube(n, d, rng) → number[][]`, `VE2D.spearman(x, y)`, `VE2D.UQ_PARAMS` (`[{key, label, unit, log}]`), `VE2D.sampleBatch(base, specs, n, seed) → scenario[]`, `VE2D.summarize(model, state) → {leakedPct, exitedPct, residualPct, dissolvedPct, structuralPct, freePct, footprintKm2, bhpBar}`.
- Worker protocol in: `{type: 'run', id, scenario}` | `{type: 'batch', id, scenarios}` | `{type: 'cancel', id}`. Out: `{type: 'model', id, model}`, `{type: 'snapshot', id, snap}` (transferable buffers), `{type: 'done', id, history, truncated}`, `{type: 'progress', id, done, total}`, `{type: 'batch-done', id, rows}`, `{type: 'error', id, message}`.

- [ ] **Step 1: Failing tests** — LHS: each column has exactly one sample per stratum; Spearman of monotone data = 1, reversed = −1; `sampleBatch` respects ranges; *parity*: `summarize` after `run(scenario)` equals the batch path's row for the same scenario bit-for-bit; *stale run ids are ignored*: the page-side reducer `applyWorkerMessage(state, msg)` (Task 8) drops messages whose `id` ≠ current id.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat: simulation worker with streamed snapshots and LHS batches`.

### Task 7: Design tokens, shell and page chrome

**Files:** Rewrite `simulator-workbench.css`; Modify `simulator.html`, `Header.jsx` (nav label), `build.js` (simulator file list); Create `SimCharts.jsx`, `SimViews.jsx`; Rewrite `SimulatorPage.jsx` (shell only in this task).

**Interfaces:**
- CSS custom properties on `.sim` root: `--bg, --surface, --surface-2, --rule, --ink, --ink-muted, --accent, --focus, --c-dissolved, --c-residual, --c-structural, --c-free, --c-exited, --c-leaked, --depth-0 … --depth-6, --pressure-0 … --pressure-4`, night default and `[data-theme="day"]`; legacy `--ve-ink`, `--ve-accent`, `--ve-accent-soft`, `--ve-border`, `--ve-muted` mapped for the shared `Header` workbench variant.
- `SimulatorPage` sections `simulator | uncertainty | method` with `role="tablist"` and roving `tabIndex`.

- [ ] **Step 1:** Update `tests/site-smoke.js` contracts (new names, bundle version 19, KaTeX pinned, `simulation-worker.js`, no `uq-worker.js`) → run → FAIL.
- [ ] **Step 2:** Implement tokens, app bar, three-zone grid with internal scrolling only (no page scroll at ≥ 1180 px), sheets for ≤ 1179 px, header re-skin, loader text, meta/title, KaTeX links, build list `['ve2d-model.js', 'GuidePage.jsx', 'SimCharts.jsx', 'SimViews.jsx', 'SimulatorPage.jsx']`.
- [ ] **Step 3:** `node build.js && node tests/site-smoke.js` → PASS. **Step 4: Commit** `feat(ui): night-survey tokens and simulator shell`.

### Task 8: Scenario state, input rail and share links

**Files:** Modify `SimulatorPage.jsx`; Test `tests/simulator-workbench.test.js` (rewritten)

**Interfaces:**
- Pure helpers (top of `SimulatorPage.jsx`, before `const SimulatorPage`): `encodeScenario(scenario) → string`, `decodeScenario(search) → scenario`, `inventoryCsv(history) → string`, `gridCsv(modelView, snap) → string`, `formatMass(kg)`, `formatPercent`, `applyWorkerMessage(runState, msg) → runState`.
- `useSimulation(scenario) → {status, progress, model, snapshots, history, truncated, error}`.

- [ ] **Step 1: Failing tests** — share link round trip for every preset; hostile query (`?rateMt=NaN&faults=9&porosity=7&evil=1`) decodes to a normalised scenario; CSV headers `year,injected_Mt,free_Mt,structural_Mt,residual_Mt,dissolved_Mt,exited_Mt,leaked_Mt,balance_Mt` and `x_km,y_km,top_depth_m,h_m,hmax_m,dissolved_kg_m2,dp_bar`; stale run ids ignored.
- [ ] **Step 2: Run** → FAIL. **Step 3:** Implement helpers, debounced worker hook, input rail (scenario picker with descriptions, grouped `ParameterField` with numeric input + unit + slider (log for permeability) + hint, fault editor cards, `<details>` for advanced groups). **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(ui): scenario inputs, presets and share links`.

### Task 9: Map view

**Files:** Modify `SimViews.jsx`

**Interfaces:** `MapView({model, frame, layers, sectionLine, onSectionLine, wellDraggable, onWellMove, theme, reducedMotion})` where `frame = interpolateSnapshots(a, b, w)`.

- [ ] Depth raster (offscreen nx × ny canvas upscaled with smoothing) using the indigo ramp × hillshade; contours via `contourSegments` at a nice interval (10/20/25/50 m) with labels; faults with downthrown ticks and leak state; trap outlines + spill markers; plume raster (free green alpha by thickness, structural amber, residual magenta hatch pattern), dissolved/pressure toggles; injector symbol + label; section line with draggable ends; scale bar (km), north arrow up, km tick labels; pointer readout (x, y, depth, h). Acceptance: screenshot shows smooth contours, no cell staircase at standard grid.
- [ ] Commit `feat(ui): structure map view`.

### Task 10: Section view

**Files:** Modify `SimViews.jsx`

**Interfaces:** `SectionView({model, frame, sectionLine, theme, reducedMotion})` (SVG).

- [ ] Sample along the line at 400 points (bilinear inside fault blocks, split at fault crossings), draw overburden/caprock/aquifer/base bands with patterns, free + structural plume polygons, residual hatch, dissolved tint + illustrative fingers, faults with offset, injector, leakage bubbles; axes in km and m; vertical exaggeration label. Acceptance: section through the well at year 30 shows plume thickness equal (± 1 px) to the map readout at the well.
- [ ] Commit `feat(ui): geological section view`.

### Task 11: 3D block view

**Files:** Modify `SimViews.jsx`

**Interfaces:** `BlockView({model, frame, theme, reducedMotion})` (canvas, own camera state `{azimuth, elevation, zoom}` with inertia).

- [ ] Painter's-ordered quads of the top surface (map colours + plume overlay), side walls on the two camera-facing sides with strata bands and the plume in section, fault planes, well; vertical exaggeration slider; drag/pinch/wheel/keyboard; eased reset. Acceptance: plume sits on/below the top surface, never above it.
- [ ] Commit `feat(ui): 3D block diagram view`.

### Task 12: Transport bar, outcome rail, charts and exports

**Files:** Modify `SimulatorPage.jsx`, `SimCharts.jsx`

**Interfaces:** `TransportBar({year, years, injYears, computedYears, playing, speed, onPlay, onSeek, onStep, onSpeed})`; `InventoryBar({inv})`; `InventoryChart({history, year, theme})` (stacked area + injected line + cursor + hover tooltip + table toggle); `KpiList`; `StatusList`.

- [ ] Smooth playback via `requestAnimationFrame` interpolating between snapshots; outcome rail content per spec §3.1; exports (inventory CSV, grid CSV, PNG of the active view). Acceptance: the stack top coincides with the injected line within 1 px.
- [ ] Commit `feat(ui): playback, inventory charts and exports`.

### Task 13: Uncertainty section

**Files:** Modify `SimulatorPage.jsx`, `SimCharts.jsx`

- [ ] Parameter table (include, min, max, log), runs (20–400), grid (same as simulator / coarse, labelled), seed; run with progress and cancel; results: P10/P50/P90 table for each metric, histogram for the selected metric, tornado (Spearman), scatter (selected parameter vs metric) with click-to-load into the simulator. Acceptance: loaded realization reproduces its batch metrics to the displayed precision.
- [ ] Commit `feat(ui): uncertainty analysis on the shared engine`.

### Task 14: Method page

**Files:** Rewrite `GuidePage.jsx`

- [ ] Sections per spec §8 with KaTeX rendering (`katex.render` into refs; plain-text fallback if KaTeX failed to load); parameter table generated from `VE2D.DEFAULTS`/`LIMITS`; verification numbers from the test suite. Acceptance: no hand-built fractions; site smoke still finds "educational model" scope sentence.
- [ ] Commit `feat(ui): method page matching the implemented model`.

### Task 15: Motion

**Files:** Modify `SimViews.jsx`, `simulator-workbench.css`; Test `tests/simulator-workbench.test.js`

- [ ] Flow particles from `fx, fy` (≤ 1200 particles, trails, respawn in plume), injection pulse while `year ≤ injYears`, leak beacons on leaking faults, dissolution fingers (section), trap outline draw-in, recompute morph (250 ms), number tween, press scale, sheet slide; all gated by `prefers-reduced-motion` (JS `matchMedia` read inside effects) and CSS media query. Test: CSS contains a reduced-motion block disabling animations; no `transition: all`.
- [ ] Commit `feat(ui): data-driven motion layer`.

### Task 16: Tests, docs, build and visual QA

**Files:** Rewrite `tests/simulator-workbench.test.js`, delete `tests/simulator-runtime.test.js`, update `tests/site-smoke.js`, `README.md`; regenerate `simulator-bundle.js`, `bundle.js`.

- [ ] `node build.js`, `node --test tests/*.test.js`, `node tests/site-smoke.js` all green.
- [ ] Puppeteer screenshots (scratchpad script) of Map, 3D, Section, Uncertainty (after a run), Method at 1440 × 900 and 390 × 844, night and day; check: no overflow, no clipped legend/scrubber, readable text, colours per spec, no console errors.
- [ ] Commit `chore: rebuild bundles, docs and QA fixes`.

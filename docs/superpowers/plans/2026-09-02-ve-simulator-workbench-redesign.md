# VE Simulator Engineering Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the standalone VE simulator's portfolio-style presentation with the approved slate-precision engineering workbench while preserving every numerical, sharing, export, timeline, map, UQ, and accessibility capability.

**Architecture:** Keep the existing dependency-free React/CDN runtime and the model/worker files unchanged. Add one simulator-specific stylesheet, a compact variant of the existing shared header, and focused local view components inside `SimulatorPage.jsx`; recompose the existing state and handlers rather than rewriting model logic.

**Tech Stack:** React 18 UMD, Babel build script, plain CSS, SVG/canvas visualization, Web Workers, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-01-ve-simulator-workbench-redesign-design.md`

## Global Constraints

- Preserve `ve2d-model.js`, `uq-worker.js`, and the implemented scientific equations.
- Do not add UI, animation, icon, or font dependencies.
- Reuse Montserrat for brand/navigation, Open Sans for controls, and the existing monospace stack for numerical values.
- Keep Cross-section and Map on one shared scenario state.
- Keep UQ on the existing worker and allow a selected realization to load back into the workbench.
- Retain Copy Scenario Link, mass-balance CSV, reservoir SVG, map PNG, and grid CSV exports.
- Use cool-gray/white application chrome, restrained teal state color, and a deep-slate geological canvas; do not reintroduce glassmorphism, purple chrome, a marketing hero, or nested card grids.
- Keep routine UI motion under 220ms, specify exact transitioned properties, use no `ease-in`, and honor `prefers-reduced-motion`.
- Preserve labelled controls, semantic tabs, visible focus, textual status, and scientific figure descriptions.
- Never edit `bundle.js` or `simulator-bundle.js` manually; generate both with `node build.js`.

## File Structure

- Create `simulator-workbench.css`: all simulator-shell, workbench, rail, control, responsive-sheet, risk-workspace, and reduced-motion styles.
- Create `tests/simulator-workbench.test.js`: focused source-level contracts for the new structure and forbidden old presentation.
- Modify `Header.jsx`: add a `workbench` visual variant without changing the home-page header behavior.
- Modify `App.jsx`: select the compact header variant and omit the site footer for the standalone tool.
- Modify `SimulatorPage.jsx`: add scenario-status derivation, focused local UI components, and recompose existing handlers/visualizations into the approved workbench.
- Modify `simulator.html`: load the simulator stylesheet, replace the decorative loader with a static accessible loading state, and update the generated bundle cache version.
- Modify `tests/site-smoke.js`: recognize the new stylesheet and cache version while retaining existing simulator capability contracts.
- Generate `docs/design/ve-simulator-workbench-desktop.png`, `docs/design/ve-simulator-risk-analysis.png`, and `docs/design/ve-simulator-mobile.png`: approved production visual references.

---

### Task 1: Generate and approve the production visual references

**Files:**
- Create: `docs/design/ve-simulator-workbench-desktop.png`
- Create: `docs/design/ve-simulator-risk-analysis.png`
- Create: `docs/design/ve-simulator-mobile.png`

**Interfaces:**
- Consumes: the approved design spec and visual-companion choices `Engineering workbench` + `Slate precision`.
- Produces: three immutable visual references used by every CSS and browser-fidelity task.

- [ ] **Step 1: Generate the desktop workbench concept**

Use the installed `imagegen` skill with this complete brief:

```text
Create a production UI design screenshot for a professional Vertical Equilibrium CO2 reservoir simulator at 1440x1000. Audience: reservoir researchers, reservoir engineers, and industry decision-makers. Optimize the first 30 seconds for configuring and running a scenario.

Use the approved engineering-workbench structure: a compact 56px header with the ST brand mark, “VE Simulator”, Research, Methodology, and Sa'eed navigation; a slim scenario bar with Default, Anticline, Faulted trap, Dipping layer, status, Reset, Share, Export, and one dominant “Run scenario” action; a three-zone main workspace with a 280px left input rail, fluid central reservoir cross-section, and 300px right outcome rail.

Left rail groups: Injection, Rock properties, Structure, Faults, Capillary behavior, Grid/detail. Each numeric field visibly pairs a slider, editable value, and unit. Centre: deep-slate scientific geological canvas with caprock, sandstone, faults, injector, brine, mobile CO2, trapped gas, legend, Cross-section/Map tabs, and attached playback/timeline controls. Right rail: run status/year, injected, mobile, trapped, leaked, efficiencies, and compact mass-balance chart.

Visual language: cool-gray application background, white structural rails, ink text, restrained teal selection/success, amber caution, red only for leakage/error, deep-slate canvas. Montserrat-like brand type, Open-Sans-like control type, monospace tabular data. Restrained radii, separators and whitespace instead of cards, no glass, no purple, no gradients or glows in application chrome, no hero, no eyebrow, no decorative dashboard filler. Code-native text and controls, realistic readable scientific labels, practical React/CSS implementation.
```

- [ ] **Step 2: Generate the risk-analysis concept**

Use the same visual system at 1440x1000. Show `Risk analysis` as a dedicated workspace with parameter inclusion, sampling-mode editors, target metric, run count, worker progress, percentile outputs, distribution, sensitivity ranking, and a clear `Load realization` action. Keep tables/plots open and structured; do not turn the page into a card grid.

- [ ] **Step 3: Generate the mobile concept**

Use a 390x844 viewport. Keep the compact brand header, scenario/run row, Cross-section/Map selector, geological canvas, and playback visible. Show Inputs and Outcomes as labelled sheet triggers with one sheet open, 44px targets, no hover-dependent controls, no clipped legend, and the same cool palette.

- [ ] **Step 4: Inspect and obtain approval**

Use `view_image` on all three local files. Reject any concept containing a marketing hero, glass/purple chrome, unreadable controls, filler metrics, nested cards, missing units, or a canvas that is not primary. Present the accepted images to the user and stop until they approve them.

- [ ] **Step 5: Commit the accepted references**

```bash
git add docs/design/ve-simulator-workbench-desktop.png docs/design/ve-simulator-risk-analysis.png docs/design/ve-simulator-mobile.png
git commit -m "design: add VE simulator workbench references"
```

### Task 2: Lock the workbench contract with a failing test

**Files:**
- Create: `tests/simulator-workbench.test.js`
- Modify: `tests/site-smoke.js:41-55`

**Interfaces:**
- Consumes: exact landmarks and constraints from the design spec.
- Produces: a runnable contract that later tasks must satisfy.

- [ ] **Step 1: Create the focused failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('standalone simulator exposes the engineering workbench', () => {
  const app = read('App.jsx');
  const page = read('SimulatorPage.jsx');
  const html = read('simulator.html');

  assert.match(app, /variant="workbench"/);
  assert.match(html, /simulator-workbench\.css/);
  assert.match(page, /className="ve-workbench"/);
  assert.match(page, /className="ve-input-rail"/);
  assert.match(page, /className="ve-visualization-workspace"/);
  assert.match(page, /className="ve-outcome-rail"/);
  assert.match(page, />Run scenario</);
  assert.match(page, />Risk analysis</);
});

test('workbench removes the old marketing presentation', () => {
  const page = read('SimulatorPage.jsx');
  const html = read('simulator.html');

  assert.doesNotMatch(page, /Interactive Numerical Simulator/);
  assert.doesNotMatch(page, /sim-evidence-grid/);
  assert.doesNotMatch(html, /seismic-scanner/);
});

test('workbench motion is restrained and accessible', () => {
  const css = read('simulator-workbench.css');

  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /ease-in(?:\s|;|,)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
});
```

- [ ] **Step 2: Add the stylesheet/cache contracts to the existing smoke test**

Add these assertions beside the current simulator contracts:

```js
has('simulator.html', /simulator-workbench\.css/, 'simulator needs its dedicated workbench stylesheet');
assert.ok(fs.existsSync(path.join(root, 'simulator-workbench.css')), 'workbench stylesheet must exist');
```

Do not change the cache-version expectation yet; Task 8 changes both the document and assertion together.

- [ ] **Step 3: Run the focused test and verify failure**

Run: `node --test tests/simulator-workbench.test.js`

Expected: FAIL because `simulator-workbench.css` and the workbench landmarks do not exist.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/simulator-workbench.test.js tests/site-smoke.js
git commit -m "test: define VE simulator workbench contract"
```

### Task 3: Build the compact standalone shell

**Files:**
- Create: `simulator-workbench.css`
- Modify: `Header.jsx:1-220`
- Modify: `App.jsx:150-180`
- Modify: `simulator.html:27-416`

**Interfaces:**
- Consumes: `Header({ active, onNavigate })` and `SimulatorStandalone` composition.
- Produces: `Header({ active, onNavigate, variant = 'site' })`, `.app-header--workbench`, and the static `#app-loader` shell.

- [ ] **Step 1: Add the dedicated stylesheet entry**

Immediately after `colors_and_type.css` in `simulator.html`, add:

```html
<link rel="stylesheet" href="./simulator-workbench.css">
```

- [ ] **Step 2: Add the header variant without changing the default**

Change the Header signature, derive the variant once, and add a root modifier:

```jsx
const Header = ({ active, onNavigate, variant = 'site' }) => {
  const isWorkbench = variant === 'workbench';
  return (
    <header
      className={isWorkbench ? 'app-header app-header--workbench' : 'app-header'}
      role="banner"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, pointerEvents: 'none' }}
    >
      {/* Keep the current style element, header-container, brand, navigation, hamburger, and conditional mobile drawer as this header's children. */}
    </header>
  );
};
```

In the existing `.header-container` inline style, use the variant for the properties that CSS cannot safely override:

```jsx
height: isWorkbench ? 56 : (scrolled ? 64 : 88),
background: isWorkbench ? '#ffffff' : (scrolled ? existingScrolledBackground : existingTopBackground),
backdropFilter: isWorkbench ? 'none' : (scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)'),
WebkitBackdropFilter: isWorkbench ? 'none' : (scrolled ? 'blur(20px) saturate(180%)' : 'blur(6px)'),
borderBottom: isWorkbench ? '1px solid var(--ve-border)' : existingBorderBottom,
boxShadow: isWorkbench ? 'none' : existingBoxShadow,
```

Define the existing values immediately before the return:

```jsx
const siteScrolledBackground = 'linear-gradient(180deg, rgba(19, 13, 28, 0.92) 0%, rgba(19, 13, 28, 0.75) 100%)';
const siteTopBackground = 'linear-gradient(180deg, rgba(19, 13, 28, 0.60) 0%, rgba(19, 13, 28, 0.20) 60%, transparent 100%)';
const siteBorderBottom = scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent';
const siteBoxShadow = scrolled ? '0 4px 30px rgba(0,0,0,0.30), inset 0 -1px 0 rgba(255,255,255,0.08)' : 'none';
```

Pass `variant` to every `NavItem` and change its signature to `NavItem({ label, href, active, onClick, variant = 'site' })`. Use these exact workbench expressions while leaving the site branch unchanged:

```jsx
color: variant === 'workbench' ? (active ? 'var(--ve-accent)' : 'var(--ve-ink)') : (active ? '#64ffda' : 'azure'),
background: variant === 'workbench' && showPill ? 'var(--ve-accent-soft)' : existingBackground,
border: variant === 'workbench' && active ? '1px solid rgba(23,111,104,0.28)' : existingBorder,
transition: variant === 'workbench'
  ? 'color 140ms ease, background-color 140ms ease, border-color 140ms ease, transform 140ms cubic-bezier(0.23,1,0.32,1)'
  : 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
transform: variant === 'workbench' && hover ? 'translateY(-1px)' : existingTransform,
```

Assign `existingBackground`, `existingBorder`, and `existingTransform` immediately above the returned anchor from the current expressions so the default branch remains visually unchanged.

- [ ] **Step 3: Select the workbench shell in the standalone app**

In `SimulatorStandalone`, pass the variant, change its wrapper to the workbench background, and remove only its footer:

```jsx
<div className="ve-standalone" data-screen-label="03 VE Simulator">
  <Header active="simulator" onNavigate={simNav} variant="workbench" />
  <main id="main-content"><SimulatorPage /></main>
</div>
```

The normal site app keeps the existing Header and Footer unchanged.

- [ ] **Step 4: Replace the decorative simulator loader**

Delete the seismic rings, telemetry carousel, animated beacon, and their simulator-only CSS from `simulator.html`. Keep the ID expected by the existing boot code:

```html
<div id="app-loader" class="ve-app-loader" role="status" aria-live="polite">
  <img src="./assets/logo-minimalist.webp" alt="" width="28" height="28">
  <span>Loading VE Simulator…</span>
</div>
```

- [ ] **Step 5: Create the shell tokens and header/loader styles**

Start `simulator-workbench.css` with:

```css
:root {
  --ve-app: #edf1f4;
  --ve-surface: #ffffff;
  --ve-surface-subtle: #f7f9fa;
  --ve-ink: #17212b;
  --ve-muted: #617080;
  --ve-border: #d6dde4;
  --ve-accent: #176f68;
  --ve-accent-soft: #e3f1ef;
  --ve-warning: #a86616;
  --ve-danger: #b42318;
  --ve-canvas: #10202d;
  --ve-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ve-ease-move: cubic-bezier(0.77, 0, 0.175, 1);
}

.app-header--workbench {
  min-height: 56px;
}

.ve-standalone {
  min-height: 100vh;
  color: var(--ve-ink);
  background: var(--ve-app);
}

.ve-app-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--ve-muted);
  background: var(--ve-app);
  font: 600 13px/1.4 var(--font-prose);
}
```

- [ ] **Step 6: Run the existing smoke/build checks**

Run: `node tests/site-smoke.js`

Expected: PASS.

Run: `node build.js`

Expected: both bundles compile and execute cleanly.

- [ ] **Step 7: Commit the standalone shell**

```bash
git add simulator-workbench.css simulator.html Header.jsx App.jsx bundle.js simulator-bundle.js
git commit -m "feat: add compact VE simulator shell"
```

### Task 4: Add explicit scenario status and the scenario command bar

**Files:**
- Modify: `SimulatorPage.jsx:424-820,2098-2650`
- Modify: `simulator-workbench.css`

**Interfaces:**
- Consumes: `resetSimulation()`, `applyPreset(name)`, `handlePlayToggle()`, `copyScenarioLink()`, `exportCsv()`, and `exportSvg()`.
- Produces: `scenarioSignature: string`, `lastRunSignatureRef`, `runStatus`, `handleRunScenario()`, and `.ve-scenario-bar`.

- [ ] **Step 1: Derive a stable scenario signature**

After the parameter state declarations, add:

```jsx
const scenarioSignature = useMemo(() => JSON.stringify({
  K, porosity, cellCount, residualTrapFraction, dipPercent, amplitude,
  frequency, faultOffset, Q, injLocation, wellY, mapCols, injDuration,
  faultCount, faults, hasCapillaryFringe, fringeScale, entryPressure
}), [
  K, porosity, cellCount, residualTrapFraction, dipPercent, amplitude,
  frequency, faultOffset, Q, injLocation, wellY, mapCols, injDuration,
  faultCount, faults, hasCapillaryFringe, fringeScale, entryPressure
]);
const lastRunSignatureRef = useRef(scenarioSignature);
```

- [ ] **Step 2: Add one run entry point and textual status**

```jsx
const handleRunScenario = () => {
  resetSimulation();
  lastRunSignatureRef.current = scenarioSignature;
  setIsPlaying(true);
};

const runStatus = isPlaying
  ? 'Running'
  : isReversing
    ? 'Running backward'
    : scenarioSignature !== lastRunSignatureRef.current
      ? 'Inputs changed'
      : simTime > 0
        ? 'Paused'
        : 'Ready';
```

When applying a preset, allow the resulting render to show `Inputs changed`; do not write a stale pre-render signature into the ref.

- [ ] **Step 3: Replace the old title/preset/evidence rows with the command bar**

Use this structure and existing handlers:

```jsx
<section className="ve-scenario-bar" aria-label="Scenario controls">
  <div className="ve-presets" aria-label="Reservoir presets">
    {[
      ['default', 'Default'],
      ['dome', 'Anticline'],
      ['faulted', 'Faulted trap'],
      ['monocline', 'Dipping layer']
    ].map(([id, label]) => (
      <button key={id} className={selectedPreset === id ? 'is-active' : ''} onClick={() => applyPreset(id)}>{label}</button>
    ))}
  </div>
  <span className={`ve-run-status ve-run-status--${runStatus.toLowerCase().replace(/\s+/g, '-')}`} role="status">{runStatus}</span>
  <button onClick={resetSimulation}>Reset</button>
  <button onClick={copyScenarioLink}>Copy scenario link</button>
  <details className="ve-export-menu">
    <summary>Export</summary>
    <button onClick={exportCsv}>Mass balance CSV</button>
    <button onClick={exportSvg}>Reservoir SVG</button>
  </details>
  <button className="ve-run-button" onClick={handleRunScenario}>Run scenario</button>
</section>
```

Keep `shareStatus` immediately after the bar as a live status message.

- [ ] **Step 4: Style exact command states**

Add explicit `background-color`, `border-color`, `color`, and `transform` transitions only. Add `.ve-run-button:active { transform: scale(0.97); }` with 140ms strong ease-out. Use text plus color for every run state.

- [ ] **Step 5: Preserve state on share/export failure**

Add one synchronous action guard and use it for both download handlers:

```jsx
const runFileAction = (action, failureMessage) => {
  try {
    action();
  } catch (_) {
    setShareStatus(failureMessage);
    setTimeout(() => setShareStatus(''), 3200);
  }
};
```

Wire the menu to `onClick={() => runFileAction(exportCsv, 'Mass balance export failed. Please retry.')}` and `onClick={() => runFileAction(exportSvg, 'Reservoir export failed. Please retry.')}`. Keep the existing clipboard fallback and worker `onerror` retry message.

- [ ] **Step 6: Run focused and existing checks**

Run: `node --test tests/simulator-workbench.test.js`

Expected: still FAIL only for missing three-zone landmarks.

Run: `node tests/site-smoke.js`

Expected: PASS.

- [ ] **Step 7: Commit scenario workflow**

```bash
git add SimulatorPage.jsx simulator-workbench.css
git commit -m "feat: add simulator scenario command bar"
```

### Task 5: Recompose the primary simulator into the three-zone workbench

**Files:**
- Modify: `SimulatorPage.jsx:2098-3610`
- Modify: `simulator-workbench.css`

**Interfaces:**
- Consumes: all existing parameter states/setters, `Slider`, Cross-section SVG, `Ve2DMapPanel`, `renderSVGChart()`, timeline handlers, and computed mass/efficiency values.
- Produces: `ParameterField`, `InputRail`, `VisualizationWorkspace`, `OutcomeRail`, and `.ve-workbench` landmarks.

- [ ] **Step 1: Upgrade the existing Slider into a precise parameter field**

Define one mass formatter beside the existing helper components, then replace the bottom `Slider` helper with:

```jsx
const formatMass = value => `${Number(value || 0).toLocaleString('en-GB', { maximumFractionDigits: 1 })} kt`;

const ParameterField = ({ label, value, min, max, step, unit, format = v => v, onChange }) => {
  const setValue = raw => {
    const number = Number(raw);
    if (!Number.isFinite(number)) return;
    onChange(Math.max(min, Math.min(max, number)));
  };
  return (
    <label className="ve-parameter-field">
      <span className="ve-parameter-heading"><span>{label}</span><span className="ve-parameter-value"><input type="number" value={value} min={min} max={max} step={step} onChange={event => setValue(event.target.value)} /><span>{unit}</span></span></span>
      <input type="range" aria-label={label} value={value} min={min} max={max} step={step} onChange={event => setValue(event.target.value)} />
      <span className="sr-only">Displayed value {format(value)} {unit}</span>
    </label>
  );
};
```

Call it with raw state values and units; do not pass a separately formatted value as the editable value.

- [ ] **Step 2: Move existing controls into `InputRail`**

Create a local component that renders the current controls under these headings in this order:

```jsx
<aside className="ve-input-rail" aria-label="Scenario inputs">
  <div className="ve-rail-heading"><h2>Scenario inputs</h2></div>
  <section><h3>Injection</h3>{/* Q, injLocation, injDuration */}</section>
  <section><h3>Rock properties</h3>{/* K, porosity, residualTrapFraction */}</section>
  <section><h3>Structure</h3>{/* dipPercent, amplitude, frequency, faultOffset */}</section>
  <section><h3>Faults</h3>{/* faultCount and current fault editors */}</section>
  <section><h3>Capillary behavior</h3>{/* fringe toggle, fringeScale, entryPressure */}</section>
  <section><h3>Grid detail</h3>{/* cellCount, mapCols, wellY where relevant */}</section>
</aside>
```

Reuse the current fault update callbacks and bounds verbatim. Do not change scientific defaults.

- [ ] **Step 3: Build `VisualizationWorkspace` around existing plots**

Add `const VISUALIZATION_TABS = ['profile', 'map'];` beside `SIM_TABS`, and make `handleTabKeys` cycle through `VISUALIZATION_TABS`. Use semantic tabs for only Cross-section and Map:

```jsx
<section className="ve-visualization-workspace" aria-label="Reservoir visualization">
  <div className="ve-view-tabs" role="tablist" aria-label="Visualization view">
    {/* Cross-section and Map buttons retain aria-selected, aria-controls, roving tabIndex, and ArrowLeft/ArrowRight behavior */}
  </div>
  <div className="ve-canvas-frame">
    {/* render the existing cross-section panel or Ve2DMapPanel without changing numerical props */}
  </div>
  <div className="ve-playback-bar" aria-label="Simulation playback">
    {/* reuse backward, play/pause, step, reset, year range, speed, and Timeline/History handlers */}
  </div>
</section>
```

Retain the cross-section legend and screen-reader table. Remove duplicate floating playback chrome once the attached bar exists. Keep the current time-travel capability behind a labelled `Timeline` button in this playback bar. Restyle its existing branch differences, `Branch & Run`, `Return to Present`, year milestones, and close action as `.ve-history-sheet`; do not delete those handlers or history data.

- [ ] **Step 4: Build `OutcomeRail` from current result blocks**

```jsx
<aside className="ve-outcome-rail" aria-label="Simulation outcomes">
  <div className="ve-rail-heading"><h2>Live outcome</h2><span>Year {simTime}</span></div>
  <dl className="ve-metric-list">
    <div><dt>Injected</dt><dd>{formatMass(currentMasses.injected)}</dd></div>
    <div><dt>Mobile</dt><dd>{formatMass(currentMasses.mobile)}</dd></div>
    <div><dt>Residually trapped</dt><dd>{formatMass(currentMasses.trapped)}</dd></div>
    <div className={currentMasses.leaked > 0 ? 'is-danger' : ''}><dt>Leaked</dt><dd>{formatMass(currentMasses.leaked)}</dd></div>
  </dl>
  {renderSVGChart()}
  {/* reuse existing structural, residual, and leaked efficiency progress rows */}
</aside>
```

Use `formatMass` for every mass value in this rail. Keep the screen-reader mass-balance table numeric.

- [ ] **Step 5: Compose the landmarks**

```jsx
<div className="simulator-page-wrapper">
  {/* scenario bar */}
  {activeSubTab === 'profile' || activeSubTab === 'map' ? (
    <div className="ve-workbench">
      <InputRail />
      <VisualizationWorkspace />
      <OutcomeRail />
    </div>
  ) : null}
</div>
```

- [ ] **Step 6: Add structural CSS**

```css
.simulator-page-wrapper {
  min-height: calc(100dvh - 56px);
  padding: 0;
  color: var(--ve-ink);
  background: var(--ve-app);
  font-family: var(--font-prose);
}

.ve-workbench {
  display: grid;
  grid-template-columns: 280px minmax(480px, 1fr) 300px;
  min-height: calc(100dvh - 106px);
  border-top: 1px solid var(--ve-border);
}

.ve-input-rail,
.ve-outcome-rail {
  min-width: 0;
  overflow-y: auto;
  background: var(--ve-surface);
}

.ve-visualization-workspace {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(420px, 1fr) auto;
  background: var(--ve-canvas);
}
```

Add restrained borders, spacing, control typography, native range styling, focus-visible rings, and tabular result values using the accepted desktop reference.

- [ ] **Step 7: Run focused, scientific, and smoke checks**

Run: `node --test tests/simulator-workbench.test.js tests/ve2d-model.test.js`

Expected: PASS.

Run: `node tests/site-smoke.js`

Expected: PASS.

- [ ] **Step 8: Commit the primary workbench**

```bash
git add SimulatorPage.jsx simulator-workbench.css
git commit -m "feat: build VE simulator engineering workbench"
```

### Task 6: Reframe Risk analysis and Methodology as dedicated workspaces

**Files:**
- Modify: `SimulatorPage.jsx:3016-3300`
- Modify: `simulator-workbench.css`

**Interfaces:**
- Consumes: `activeSubTab`, `setActiveSubTab`, `runMonteCarloBatch()`, `uqRunning`, `uqProgress`, `mcResults`, `loadUQRealization()`, and `GuidePage`.
- Produces: `.ve-workspace-nav`, `.ve-risk-workspace`, and `.ve-methodology-workspace`.

- [ ] **Step 1: Add top-level workspace navigation**

Immediately below the scenario bar, render:

```jsx
<nav className="ve-workspace-nav" aria-label="Simulator workspace">
  <button aria-current={['profile', 'map'].includes(activeSubTab) ? 'page' : undefined} onClick={() => setActiveSubTab('profile')}>Simulator</button>
  <button aria-current={activeSubTab === 'uq' ? 'page' : undefined} onClick={() => setActiveSubTab('uq')}>Risk analysis</button>
  <button aria-current={activeSubTab === 'guide' ? 'page' : undefined} onClick={() => setActiveSubTab('guide')}>Methodology</button>
</nav>
```

This navigation is not the Cross-section/Map tablist. Keep the tab semantics only inside the visualization workspace.

- [ ] **Step 2: Rewrap the existing UQ controls and outputs**

```jsx
<section className="ve-risk-workspace" aria-labelledby="risk-title">
  <header className="ve-workspace-heading">
    <div><h1 id="risk-title">Risk analysis</h1><p>Use the current scenario as the nominal case.</p></div>
    <button className="ve-run-button" onClick={runMonteCarloBatch} disabled={uqRunning}>{uqRunning ? `Running ${uqProgress}%` : 'Run uncertainty analysis'}</button>
  </header>
  <div className="ve-risk-layout">
    <aside className="ve-risk-config">{/* existing parameter editors, metric, and run count */}</aside>
    <div className="ve-risk-results">{/* existing percentiles, charts, ranking, and realization rows */}</div>
  </div>
</section>
```

Retain all existing worker messages and `loadUQRealization(realization)` calls. Change only composition, labels, and classes.

- [ ] **Step 3: Rewrap the existing guide**

```jsx
<section className="ve-methodology-workspace" aria-labelledby="methodology-title">
  <header className="ve-workspace-heading"><h1 id="methodology-title">Methodology</h1></header>
  <GuidePage />
</section>
```

Do not duplicate guide copy inside `SimulatorPage.jsx`.

- [ ] **Step 4: Style both workspaces from the same tokens**

Use open two-column layouts and divider-based sections. Do not add card grids. Keep the risk configuration column at approximately 340px and allow result tables/charts to use the remaining width.

- [ ] **Step 5: Verify UQ source contracts**

Run: `node tests/site-smoke.js`

Expected: PASS, including the worker and load-realization source contracts.

Run: `node build.js`

Expected: both bundles compile and execute cleanly.

- [ ] **Step 6: Commit dedicated workspaces**

```bash
git add SimulatorPage.jsx simulator-workbench.css bundle.js simulator-bundle.js
git commit -m "feat: add dedicated simulator risk workspace"
```

### Task 7: Add responsive rails, accessible mobile sheets, and restrained motion

**Files:**
- Modify: `SimulatorPage.jsx:424-480,2098-3610`
- Modify: `simulator-workbench.css`

**Interfaces:**
- Consumes: `InputRail` and `OutcomeRail` from Task 5.
- Produces: `mobilePanel: null | 'inputs' | 'outcomes'`, sheet triggers, dismissible sheet behavior, and responsive CSS at 1180px and 760px.

- [ ] **Step 1: Add mobile panel state and focus-safe dismissal**

```jsx
const [mobilePanel, setMobilePanel] = useState(null);
useEffect(() => {
  if (!mobilePanel) return undefined;
  const closeOnEscape = event => event.key === 'Escape' && setMobilePanel(null);
  window.addEventListener('keydown', closeOnEscape);
  return () => window.removeEventListener('keydown', closeOnEscape);
}, [mobilePanel]);
```

- [ ] **Step 2: Add visible mobile triggers**

```jsx
<div className="ve-mobile-panel-triggers" aria-label="Workbench panels">
  <button aria-expanded={mobilePanel === 'inputs'} onClick={() => setMobilePanel(mobilePanel === 'inputs' ? null : 'inputs')}>Inputs</button>
  <button aria-expanded={mobilePanel === 'outcomes'} onClick={() => setMobilePanel(mobilePanel === 'outcomes' ? null : 'outcomes')}>Outcomes</button>
</div>
```

Apply `data-mobile-open={mobilePanel === 'inputs'}` to the input rail and the analogous value to the outcome rail. Each rail receives a visible close button at mobile sizes.

- [ ] **Step 3: Implement responsive layout**

```css
@media (max-width: 1180px) {
  .ve-workbench { grid-template-columns: 260px minmax(440px, 1fr); }
  .ve-outcome-rail { position: fixed; right: 0; top: 106px; bottom: 0; width: min(340px, 92vw); transform: translateX(100%); box-shadow: -16px 0 32px rgba(23, 33, 43, 0.16); transition: transform 200ms var(--ve-ease-out); }
  .ve-outcome-rail[data-mobile-open="true"] { transform: translateX(0); }
}

@media (max-width: 760px) {
  .ve-workbench { display: block; min-height: 0; }
  .ve-input-rail,
  .ve-outcome-rail { position: fixed; top: 106px; bottom: 0; width: min(340px, 92vw); z-index: 30; box-shadow: 16px 0 32px rgba(23, 33, 43, 0.16); transition: transform 200ms var(--ve-ease-out); }
  .ve-input-rail { left: 0; transform: translateX(-100%); }
  .ve-outcome-rail { right: 0; transform: translateX(100%); }
  .ve-input-rail[data-mobile-open="true"],
  .ve-outcome-rail[data-mobile-open="true"] { transform: translateX(0); }
  .ve-visualization-workspace { min-height: calc(100dvh - 150px); grid-template-rows: auto minmax(360px, 1fr) auto; }
  .ve-mobile-panel-triggers { display: grid; grid-template-columns: 1fr 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .ve-input-rail,
  .ve-outcome-rail,
  .ve-run-button,
  .ve-scenario-bar button { transition-duration: 0.01ms; }
}
```

- [ ] **Step 4: Add accessibility details**

Give close buttons explicit `aria-label`s, maintain 44px mobile targets, keep visible focus rings, lock background scroll only while a sheet is open, and return focus to the trigger after closing. Use a trigger ref for each button; do not introduce a modal library.

- [ ] **Step 5: Run automated checks**

Run: `node --test tests/simulator-workbench.test.js tests/ve2d-model.test.js`

Expected: PASS.

Run: `node tests/site-smoke.js`

Expected: PASS.

- [ ] **Step 6: Commit responsive behavior**

```bash
git add SimulatorPage.jsx simulator-workbench.css
git commit -m "feat: add responsive simulator workbench panels"
```

### Task 8: Rebuild, test, and complete browser fidelity QA

**Files:**
- Modify: `simulator.html:32,418`
- Modify: `tests/site-smoke.js:51-54`
- Modify as required by verified mismatches: `SimulatorPage.jsx`, `Header.jsx`, `App.jsx`, `simulator-workbench.css`
- Generate: `simulator-bundle.js`, `bundle.js`

**Interfaces:**
- Consumes: accepted concept files and all implementation tasks.
- Produces: versioned generated bundles, passing tests, desktop/mobile screenshots, and a written fidelity ledger in the execution record.

- [ ] **Step 1: Bump the simulator bundle cache version**

Change both simulator bundle URLs in `simulator.html` from `v=14` to `v=15`. Change the corresponding site-smoke expectation:

```js
assert.equal(simulatorBundleVersions[0], '15', 'simulator page must load the current bundle version');
```

- [ ] **Step 2: Rebuild generated assets**

Run: `node build.js`

Expected: both bundles compile and execute cleanly with no syntax/runtime errors.

- [ ] **Step 3: Run the complete automated suite**

Run: `node --test tests/ve2d-model.test.js tests/simulator-workbench.test.js`

Expected: PASS.

Run: `node tests/site-smoke.js`

Expected: `site smoke contracts passed`.

- [ ] **Step 4: Verify desktop in the in-app Browser**

Serve the repo locally, reload `simulator.html`, and set the viewport to the accepted desktop concept size. Verify this core path:

1. select Faulted trap;
2. edit Injection rate and Permeability using both number and slider controls;
3. confirm `Inputs changed`;
4. run the scenario;
5. pause, seek, step, and change speed;
6. switch Cross-section → Map → Cross-section without losing values;
7. inspect mass and leakage outcomes;
8. copy the scenario URL;
9. trigger CSV and SVG downloads.

Check the browser console for errors after the path.

- [ ] **Step 5: Verify Risk analysis**

Open Risk analysis, enable at least two uncertain parameters, run the smallest batch, wait for completion, inspect percentiles/sensitivity, and load one realization. Confirm the workbench receives the realization and remains runnable.

- [ ] **Step 6: Verify mobile**

Set 390x844. Confirm no horizontal overflow, canvas/playback remain visible, Inputs and Outcomes sheets open/close, Escape and close buttons work, focus returns to the trigger, targets are usable, and the legend does not obscure the data.

- [ ] **Step 7: Capture and compare screenshots**

Capture the latest desktop primary screen, risk screen, and mobile screen to local files. In the same QA pass, use `view_image` on each accepted concept and its corresponding implementation screenshot.

Write a fidelity ledger covering at least:

- copy and navigation;
- three-zone geometry;
- palette and canvas contrast;
- typography and numerical treatment;
- control spacing and units;
- icons and status states;
- desktop first-viewport fit;
- mobile sheets and overflow;
- motion/reduced-motion behavior.

Fix every material mismatch before proceeding. The above-the-fold copy diff must contain only copy approved in the design spec.

- [ ] **Step 8: Commit the verified implementation**

```bash
git add SimulatorPage.jsx Header.jsx App.jsx simulator-workbench.css simulator.html tests/site-smoke.js tests/simulator-workbench.test.js bundle.js simulator-bundle.js
git commit -m "feat: complete VE simulator workbench redesign"
```

- [ ] **Step 9: Inspect the final diff**

Run: `git diff HEAD~1 --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only pre-existing unrelated files remain untracked or modified.

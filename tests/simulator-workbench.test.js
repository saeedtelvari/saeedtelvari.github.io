const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ve2d = require('../ve2d-model.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const loadRunStateHelpers = () => {
  const page = read('SimulatorPage.jsx');
  const prelude = page.slice(0, page.indexOf('const UQParamConfig'));
  const context = { React: {} };
  vm.runInNewContext(`${prelude}\nthis.helpers = {\n    createScenarioSignature: typeof createScenarioSignature === 'undefined' ? undefined : createScenarioSignature,\n    deriveRunStatus: typeof deriveRunStatus === 'undefined' ? undefined : deriveRunStatus,\n    executeFileAction: typeof executeFileAction === 'undefined' ? undefined : executeFileAction,\n    getPlaybackAction: typeof getPlaybackAction === 'undefined' ? undefined : getPlaybackAction,\n    copyTextToClipboard: typeof copyTextToClipboard === 'undefined' ? undefined : copyTextToClipboard,\n    toggleMobilePanel: typeof toggleMobilePanel === 'undefined' ? undefined : toggleMobilePanel,\n    focusMobilePanelTrigger: typeof focusMobilePanelTrigger === 'undefined' ? undefined : focusMobilePanelTrigger,\n    lockPageScroll: typeof lockPageScroll === 'undefined' ? undefined : lockPageScroll,\n    selectPresentedMobilePanel: typeof selectPresentedMobilePanel === 'undefined' ? undefined : selectPresentedMobilePanel,\n    getMobileFocusWrapTarget: typeof getMobileFocusWrapTarget === 'undefined' ? undefined : getMobileFocusWrapTarget,\n    setMobilePanelBackgroundInert: typeof setMobilePanelBackgroundInert === 'undefined' ? undefined : setMobilePanelBackgroundInert,\n    normalizeParameterInput: typeof normalizeParameterInput === 'undefined' ? undefined : normalizeParameterInput\n  };`, context);
  vm.runInNewContext(`this.helpers.clampTopographyCamera = typeof clampTopographyCamera === 'undefined' ? undefined : clampTopographyCamera;
this.helpers.resetTopographyCamera = typeof resetTopographyCamera === 'undefined' ? undefined : resetTopographyCamera;
this.helpers.projectTopographyPoint = typeof projectTopographyPoint === 'undefined' ? undefined : projectTopographyPoint;`, context);
  return context.helpers;
};

const loadHeaderModalHelpers = () => {
  const header = read('Header.jsx');
  const prelude = header.slice(0, header.indexOf('const Header ='));
  const context = { React: { useEffect() {}, useState() {}, useRef() {} } };
  vm.runInNewContext(`${prelude}\nthis.helpers = {\n    getHeaderFocusWrapTarget: typeof getHeaderFocusWrapTarget === 'undefined' ? undefined : getHeaderFocusWrapTarget,\n    setHeaderBackgroundInert: typeof setHeaderBackgroundInert === 'undefined' ? undefined : setHeaderBackgroundInert\n  };`, context);
  return context.helpers;
};

const loadActiveResultSelector = () => {
  const page = read('SimulatorPage.jsx');
  const prelude = page.slice(0, page.indexOf('const UQParamConfig'));
  const context = { React: {} };
  vm.runInNewContext(`${prelude}\nthis.select = typeof selectActiveResults === 'undefined' ? undefined : selectActiveResults;`, context);
  return context.select;
};

const loadMapLifecycleHelpers = () => {
  const page = read('SimulatorPage.jsx');
  const prelude = page.slice(0, page.indexOf('const UQParamConfig'));
  const context = { React: {} };
  vm.runInNewContext(`${prelude}\nthis.helpers = {\n    consumeMapCommand: typeof consumeMapCommand === 'undefined' ? undefined : consumeMapCommand,\n    deriveMapRunStatus: typeof deriveMapRunStatus === 'undefined' ? undefined : deriveMapRunStatus,\n    createMapSnapshot: typeof createMapSnapshot === 'undefined' ? undefined : createMapSnapshot,\n    getMapPlaybackTransition: typeof getMapPlaybackTransition === 'undefined' ? undefined : getMapPlaybackTransition\n  };`, context);
  return context.helpers;
};

test('scenario signature changes when a nested fault input changes', () => {
  const createSignature = loadRunStateHelpers().createScenarioSignature || (() => '');
  const scenario = {
    K: 1.7,
    faults: [{ xPercent: 28, isSealed: false }]
  };

  const before = createSignature(scenario);
  const after = createSignature({ ...scenario, faults: [{ ...scenario.faults[0], xPercent: 35 }] });

  assert.notEqual(after, before);
});

test('active playback state wins over modified inputs', () => {
  const deriveStatus = loadRunStateHelpers().deriveRunStatus || (() => 'missing');
  const changed = { scenarioSignature: 'new', lastRunSignature: 'old', simTime: 20 };

  assert.equal(deriveStatus({ ...changed, isPlaying: true, isReversing: false }), 'Running');
  assert.equal(deriveStatus({ ...changed, isPlaying: false, isReversing: true }), 'Running backward');
});

test('idle run status reflects the scenario lifecycle', () => {
  const deriveStatus = loadRunStateHelpers().deriveRunStatus || (() => 'missing');
  const idle = { isPlaying: false, isReversing: false };

  assert.equal(deriveStatus({ ...idle, scenarioSignature: 'same', lastRunSignature: 'same', simTime: 0 }), 'Ready');
  assert.equal(deriveStatus({ ...idle, scenarioSignature: 'new', lastRunSignature: 'old', simTime: 0 }), 'Inputs changed');
  assert.equal(deriveStatus({ ...idle, scenarioSignature: 'same', lastRunSignature: 'same', simTime: 20 }), 'Paused');
});

test('a successful file action completes without reporting failure', () => {
  const execute = loadRunStateHelpers().executeFileAction || (() => false);
  let actionCalls = 0;
  let failureCalls = 0;

  const completed = execute(() => { actionCalls += 1; }, () => { failureCalls += 1; });

  assert.equal(completed, true);
  assert.equal(actionCalls, 1);
  assert.equal(failureCalls, 0);
});

test('a failed file action reports failure without retrying the action', () => {
  const execute = loadRunStateHelpers().executeFileAction || (() => false);
  let actionCalls = 0;
  let failureCalls = 0;

  const completed = execute(() => {
    actionCalls += 1;
    throw new Error('download unavailable');
  }, () => { failureCalls += 1; });

  assert.equal(completed, false);
  assert.equal(actionCalls, 1);
  assert.equal(failureCalls, 1);
});

test('playback routes fresh or modified scenarios through the run lifecycle', () => {
  const getAction = loadRunStateHelpers().getPlaybackAction || (() => 'resume');

  assert.equal(getAction({ isPlaying: false, simTime: 0, scenarioChanged: false }), 'run-scenario');
  assert.equal(getAction({ isPlaying: false, simTime: 40, scenarioChanged: true }), 'run-scenario');
});

test('clipboard success is reported only after the text is written', async () => {
  const copy = loadRunStateHelpers().copyTextToClipboard || (async () => true);
  let writtenText = '';
  let fallbackCalls = 0;
  let finishWrite;
  let settled = false;
  const writeFinished = new Promise(resolve => { finishWrite = resolve; });

  const copyFinished = copy('scenario-url', {
    writeText: text => { writtenText = text; return writeFinished; }
  }, () => { fallbackCalls += 1; return true; }).then(copied => { settled = true; return copied; });

  await Promise.resolve();
  assert.equal(settled, false);
  finishWrite();
  const copied = await copyFinished;

  assert.equal(copied, true);
  assert.equal(writtenText, 'scenario-url');
  assert.equal(fallbackCalls, 0);
});

test('unsupported or rejected clipboard writes report the fallback result', async () => {
  const copy = loadRunStateHelpers().copyTextToClipboard || (async () => true);
  let fallbackCalls = 0;
  const fallback = () => { fallbackCalls += 1; return false; };

  assert.equal(await copy('scenario-url', null, fallback), false);
  assert.equal(await copy('scenario-url', { writeText: async () => { throw new Error('denied'); } }, fallback), false);
  assert.equal(fallbackCalls, 2);
});

test('mobile panel toggles open, switches panels, and closes the active panel', () => {
  const toggle = loadRunStateHelpers().toggleMobilePanel;

  assert.equal(typeof toggle, 'function');
  assert.equal(toggle(null, 'inputs'), 'inputs');
  assert.equal(toggle('inputs', 'outcomes'), 'outcomes');
  assert.equal(toggle('outcomes', 'outcomes'), null);
});

test('dismissing a mobile panel restores focus to its trigger', () => {
  const focusTrigger = loadRunStateHelpers().focusMobilePanelTrigger;
  const focused = [];
  const triggers = {
    inputs: { focus: () => focused.push('inputs') },
    outcomes: { focus: () => focused.push('outcomes') }
  };

  assert.equal(typeof focusTrigger, 'function');
  focusTrigger('outcomes', triggers);
  assert.deepEqual(focused, ['outcomes']);
});

test('mobile panel scroll lock restores the page overflow it replaced', () => {
  const lockScroll = loadRunStateHelpers().lockPageScroll;
  const pageDocument = { body: { style: { overflow: 'clip' } } };

  assert.equal(typeof lockScroll, 'function');
  const release = lockScroll(pageDocument);
  assert.equal(pageDocument.body.style.overflow, 'hidden');
  release();
  assert.equal(pageDocument.body.style.overflow, 'clip');
});

test('responsive rails expose accessible sheet controls and mobile layout contracts', () => {
  const page = read('SimulatorPage.jsx');
  const css = read('simulator-workbench.css');

  assert.match(page, /className="ve-mobile-panel-triggers"[^>]+aria-label="Workbench panels"/);
  assert.match(page, /aria-controls="ve-input-rail"/);
  assert.match(page, /aria-controls="ve-outcome-rail"/);
  assert.match(page, /aria-label="Close inputs panel"/);
  assert.match(page, /aria-label="Close outcomes panel"/);
  assert.match(page, /data-mobile-open=\{presentedPanel === 'inputs'\}/);
  assert.match(page, /data-mobile-open=\{presentedPanel === 'outcomes'\}/);
  assert.match(page, /role=\{presentedPanel \? 'dialog' : undefined\}/);
  assert.match(page, /aria-modal=\{presentedPanel \? 'true' : undefined\}/);
  assert.match(page, /onClick=\{\(\) => handleWorkspaceChange\('uq'\)\}/);
  assert.match(page, /@media \(max-width: 768px\)[\s\S]*?\.sim-hud-legend \{[\s\S]*?position: static !important;[\s\S]*?overflow-x: auto;[\s\S]*?pointer-events: auto !important;/);
  assert.match(page, /\.sim-hud-legend > span \{ flex: 0 0 auto; \}/);
  assert.match(css, /@media \(max-width: 1180px\)[\s\S]*\.ve-outcome-rail\[data-mobile-open="true"\]/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.ve-input-rail[\s\S]*translateY\(100%\)/);
  assert.match(css, /\.ve-mobile-panel-triggers button[\s\S]*min-height: 44px/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*\.ve-input-rail[\s\S]*transition-duration: 0\.01ms/);
});

test('tablet keeps the docked input rail close control hidden', () => {
  const css = read('simulator-workbench.css');
  const tabletRules = css.slice(css.indexOf('@media (max-width: 1180px)'), css.indexOf('@media (max-width: 760px)'));
  const genericCloseRule = tabletRules.match(/(?:^|\n)\s*\.ve-mobile-panel-close\s*\{([^}]*)\}/)?.[1] || '';

  assert.doesNotMatch(genericCloseRule, /display: inline-flex/);
  assert.match(tabletRules, /\.ve-outcome-rail \.ve-mobile-panel-close\s*\{[\s\S]*?display: inline-flex/);
});

test('responsive mode presents only panels that are currently sheets', () => {
  const selectPanel = loadRunStateHelpers().selectPresentedMobilePanel;

  assert.equal(typeof selectPanel, 'function');
  assert.equal(selectPanel('inputs', { mobile: true, compact: true }), 'inputs');
  assert.equal(selectPanel('outcomes', { mobile: false, compact: true }), 'outcomes');
  assert.equal(selectPanel('inputs', { mobile: false, compact: true }), null);
  assert.equal(selectPanel('outcomes', { mobile: false, compact: false }), null);
});

test('focus return ignores triggers that are detached or hidden by a breakpoint', () => {
  const focusTrigger = loadRunStateHelpers().focusMobilePanelTrigger;
  let focusCalls = 0;

  focusTrigger('inputs', { inputs: { isConnected: false, focus: () => { focusCalls += 1; } } });
  focusTrigger('inputs', { inputs: { isConnected: true, getClientRects: () => [], focus: () => { focusCalls += 1; } } });

  assert.equal(focusCalls, 0);
});

test('mobile modal focus wraps across the sheet and its persistent switcher', () => {
  const getWrapTarget = loadRunStateHelpers().getMobileFocusWrapTarget;
  const first = { id: 'inputs' };
  const middle = { id: 'close' };
  const last = { id: 'field' };
  const focusables = [first, middle, last];

  assert.equal(typeof getWrapTarget, 'function');
  assert.equal(getWrapTarget(focusables, last, false), first);
  assert.equal(getWrapTarget(focusables, first, true), last);
  assert.equal(getWrapTarget(focusables, {}, false), first);
});

test('mobile modal background inert state is reversible', () => {
  const setInert = loadRunStateHelpers().setMobilePanelBackgroundInert;
  const background = [{ inert: false }, { inert: false }];

  assert.equal(typeof setInert, 'function');
  setInert(background, true);
  assert.deepEqual(background.map(element => element.inert), [true, true]);
  setInert(background, false);
  assert.deepEqual(background.map(element => element.inert), [false, false]);
});

test('open mobile sheet keeps its labelled switcher above the modal surface', () => {
  const page = read('SimulatorPage.jsx');
  const css = read('simulator-workbench.css');

  assert.match(page, /data-panel-open=\{Boolean\(presentedPanel\)\}/);
  assert.match(css, /\.ve-mobile-panel-triggers\[data-panel-open="true"\][\s\S]*z-index: 32/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.ve-mobile-panel-triggers\[data-panel-open="true"\][\s\S]*bottom: min\(72dvh, 620px\)/);
});

test('remaining essential mobile controls expose touch and keyboard focus targets', () => {
  const page = read('SimulatorPage.jsx');
  const css = read('simulator-workbench.css');
  const canvasControls = page.slice(page.indexOf('<div className="sim-tab-header"'), page.indexOf("} else if (activeSubTab === 'uq')"));
  const mobileRules = css.slice(css.indexOf('@media (max-width: 760px)'), css.indexOf('@media (max-width: 900px)'));

  assert.doesNotMatch(canvasControls, /outline:\s*'none'/);
  assert.match(mobileRules, /\.ve-presets button\s*\{[\s\S]*?min-height: 44px/);
  assert.match(mobileRules, /\.sim-tab-header \[role="tab"\][\s\S]*?min-height: 44px/);
  assert.match(mobileRules, /\.ve-playback-bar button\s*\{[\s\S]*?min-(?:width|height): 44px/);
  assert.match(mobileRules, /input\[type="range"\][\s\S]*?height: 44px/);
});

test('export accessible names contain their visible labels', () => {
  const page = read('SimulatorPage.jsx');
  const accessibleName = visibleLabel => {
    const button = page.split(/\r?\n/).find(line => line.includes(`>${visibleLabel}</button>`));
    assert.ok(button, `${visibleLabel} button must exist`);
    const ariaLabel = button.match(/aria-label="([^"]+)"/);
    return ariaLabel ? ariaLabel[1] : visibleLabel;
  };

  assert.match(accessibleName('Mass balance CSV'), /Mass balance CSV/);
  assert.match(accessibleName('Reservoir SVG'), /Reservoir SVG/);
});

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

test('map view reports map simulation results', () => {
  const select = loadActiveResultSelector() || (() => ({ time: -1, masses: {} }));
  const crossSection = { time: 120, masses: { injected: 12 } };
  const map = { time: 44, masses: { injected: 7 } };

  assert.deepEqual(select('map', crossSection, map), map);
  assert.deepEqual(select('profile', crossSection, map), crossSection);
});

test('map commands are consumed once without clearing a newer command', () => {
  const consume = loadMapLifecycleHelpers().consumeMapCommand || (() => ({ type: 'missing' }));
  const handled = { type: 'run', id: 2 };
  const newer = { type: 'reset', id: 3 };

  assert.equal(consume(handled, 2), null);
  assert.deepEqual(consume(newer, 2), newer);
});

test('map snapshots publish grid heights for the 3D topography consumer', () => {
  const { createMapSnapshot } = loadMapLifecycleHelpers();
  const h = [0.1, 0.3];
  const hMax = [0.2, 0.4];
  const params = { width: 1000, height: 600, structureAmplitude: 30, faults: [] };

  assert.equal(typeof createMapSnapshot, 'function');
  const snapshot = createMapSnapshot({
    time: 12,
    mapState: { h, hMax, masses: { injected: 6 } },
    history: [{ time: 12 }],
    isRunning: true,
    speed: 2,
    params
  });

  assert.deepEqual(JSON.parse(JSON.stringify(snapshot.h)), h);
  assert.deepEqual(JSON.parse(JSON.stringify(snapshot.hMax)), hMax);
  assert.deepEqual(JSON.parse(JSON.stringify(snapshot.params)), params);
  assert.match(read('SimulatorPage.jsx'), /const h = Array\.isArray\(mapSnapshot\.h\) \? mapSnapshot\.h : \[\]/);
});

test('shared map playback pauses, steps once, and retains one speed state', () => {
  const { getMapPlaybackTransition } = loadMapLifecycleHelpers();

  assert.deepEqual(JSON.parse(JSON.stringify(getMapPlaybackTransition({ isRunning: true, speed: 2 }, 'pause'))), { isRunning: false });
  assert.deepEqual(JSON.parse(JSON.stringify(getMapPlaybackTransition({ isRunning: false, speed: 2 }, 'step'))), { isRunning: false, advance: true });
  assert.deepEqual(JSON.parse(JSON.stringify(getMapPlaybackTransition({ isRunning: false, speed: 2 }, 'speed'))), { speed: 4 });
});

test('map lifecycle stays mounted while workspace tabs change', () => {
  const page = read('SimulatorPage.jsx');

  assert.match(page, /hidden=\{activeSubTab !== 'map' && activeSubTab !== 'topography'\}[\s\S]*<Ve2DMapPanel/);
  assert.equal((page.match(/<Ve2DMapPanel/g) || []).length, 1);
});

test('3D topography is a visualization peer and keeps the 2D map mounted', () => {
  const page = read('SimulatorPage.jsx');

  assert.match(page, /SIM_TABS = \['profile', 'map', 'topography', 'uq', 'guide'\]/);
  assert.match(page, /VISUALIZATION_TABS = \['profile', 'map', 'topography'\]/);
  assert.match(page, /id="tab-topography"/);
  assert.match(page, /aria-controls="tabpanel-topography"/);
  assert.match(page, /id="tabpanel-topography" role="tabpanel" aria-labelledby="tab-topography"/);
  assert.match(page, /<Ve3DTopographyPanel[\s\S]*mapSnapshot=\{mapSnapshot\}/);
  assert.match(page, /hidden=\{activeSubTab !== 'map' && activeSubTab !== 'topography'\}/);
  assert.match(page, /activeSubTab === 'map' \|\| activeSubTab === 'topography'/);
  assert.match(page, /const resetActiveSimulation = \(\) => isMapView \? sendMapCommand\('reset'\) : resetSimulation\(\)/);
  assert.match(page, /if \(!isMapView\) \{/);
  assert.match(page, /const runStatus = isMapView/);
});

test('map run status reports changed inputs after the last run', () => {
  const deriveStatus = loadMapLifecycleHelpers().deriveMapRunStatus || (() => 'missing');
  const snapshot = { isRunning: false, time: 18 };

  assert.equal(deriveStatus(snapshot, 'new-inputs', 'last-run'), 'Inputs changed');
  assert.equal(deriveStatus({ ...snapshot, isRunning: true }, 'new-inputs', 'last-run'), 'Running');
});

test('topography camera clamps to its literal orbit bounds and resets to the approved view', () => {
  const { clampTopographyCamera, resetTopographyCamera } = loadRunStateHelpers();

  assert.equal(typeof clampTopographyCamera, 'function');
  assert.equal(typeof resetTopographyCamera, 'function');
  assert.deepEqual(JSON.parse(JSON.stringify(clampTopographyCamera({ azimuth: 99, elevation: -4, zoom: 8 }))), {
    azimuth: Math.PI * 2,
    elevation: 0.22,
    zoom: 2.2
  });
  assert.deepEqual(JSON.parse(JSON.stringify(clampTopographyCamera({ azimuth: -99, elevation: 8, zoom: 0 }))), {
    azimuth: -Math.PI * 2,
    elevation: 1.12,
    zoom: 0.65
  });
  assert.deepEqual(JSON.parse(JSON.stringify(resetTopographyCamera())), {
    azimuth: -0.72,
    elevation: 0.62,
    zoom: 1
  });
});

test('topography projection is deterministic and preserves raw geometry for canvas clipping', () => {
  const { projectTopographyPoint } = loadRunStateHelpers();
  const camera = { azimuth: -0.72, elevation: 0.62, zoom: 1 };

  assert.equal(typeof projectTopographyPoint, 'function');
  const point = JSON.parse(JSON.stringify(projectTopographyPoint({ x: 0.5, y: 0.5, height: 0.5 }, camera, 1000, 600)));
  assert.deepEqual(point, { x: 500, y: 300 });
  const raw = projectTopographyPoint({ x: -5, y: 9, height: 4 }, { azimuth: 99, elevation: 9, zoom: 9 }, 1000, 600);
  assert.ok(raw.x < 0 || raw.x > 1000 || raw.y < 0 || raw.y > 600);
  const low = projectTopographyPoint({ x: 0.5, y: 0.5, height: 1 }, camera, 1000, 600);
  const high = projectTopographyPoint({ x: 0.5, y: 0.5, height: 2 }, camera, 1000, 600);
  assert.notEqual(low.y, high.y);
});

test('3D topography reuses the map structure, surface overlays, and shared playback path', () => {
  const page = read('SimulatorPage.jsx');
  const panel = page.slice(page.indexOf('const Ve3DTopographyPanel'), page.indexOf('// Main Simulator component'));

  assert.match(panel, /globalThis\.VE2D\.topDepth/);
  assert.match(panel, /slope \* 0\.3/);
  assert.match(panel, /surfaceAt\(/);
  assert.match(panel, /onMapCommand\(mapSnapshot\.isRunning \? 'pause' : 'resume'\)/);
  assert.match(panel, /onMapCommand\('step'\)/);
  assert.match(panel, /onMapCommand\('speed'\)/);
  assert.match(page, /getMapPlaybackTransition\(\{ isRunning, speed: mapSpeed \}, command\.type\)/);
  assert.match(page, /onMapCommand=\{sendMapCommand\}/);
});

test('year-zero dome structure has non-flat authoritative topography', () => {
  const params = {
    width: 1000,
    height: 600,
    dipX: 0,
    dipY: 0,
    structureAmplitude: 45,
    structureFrequency: 1,
    faultOffset: 0,
    faults: []
  };
  const depths = [0, 500, 1000].map(x => ve2d.topDepth(x, 300, params));

  assert.notEqual(depths[0], depths[1]);
  assert.equal(depths[0], depths[2]);
});

test('3D topography panel exposes orbit controls without a new renderer dependency', () => {
  const page = read('SimulatorPage.jsx');
  const panel = page.slice(page.indexOf('const Ve3DTopographyPanel'), page.indexOf('// Main Simulator component'));
  const css = read('simulator-workbench.css');

  assert.match(panel, /const Ve3DTopographyPanel/);
  assert.match(panel, /aria-label=\{`3D topography grid at year/);
  assert.match(panel, /azimuth \$\{camera\.azimuth\.toFixed\(2\)\} radians; elevation \$\{camera\.elevation\.toFixed\(2\)\} radians/);
  assert.match(panel, />Reset view</);
  assert.match(panel, /onPointerDown=/);
  assert.match(panel, /onPointerMove=/);
  assert.match(panel, /onWheel=/);
  assert.match(panel, /Elevation exaggeration/);
  assert.doesNotMatch(panel, /three|THREE|requestAnimationFrame/);
  assert.match(css, /\.ve-topography-canvas\s*\{[\s\S]*?touch-action:\s*none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.ve-topography-actions button/);
});

test('risk and methodology render as peer workspaces outside the visualization tabs', () => {
  const page = read('SimulatorPage.jsx');
  const css = read('simulator-workbench.css');

  assert.match(page, /<nav className="ve-workspace-nav" aria-label="Simulator workspace">/);
  assert.match(page, /aria-current=\{VISUALIZATION_TABS\.includes\(activeSubTab\) \? 'page'/);
  assert.match(page, /<section className="ve-risk-workspace" aria-labelledby="risk-title">/);
  assert.match(page, /onClick=\{runMonteCarloBatch\}/);
  assert.match(page, /<section className="ve-methodology-workspace" aria-labelledby="methodology-title">[\s\S]*<GuidePage isEmbedded=\{true\} \/>/);
  assert.doesNotMatch(page, /id="tab-uq"/);
  assert.doesNotMatch(page, /id="tab-guide"/);
  assert.match(css, /\.ve-workbench\[data-workspace="uq"\] \.sim-tab-header,[\s\S]*?display:\s*none\s*!important/);
});

test('risk controls expose approved labels, selection, progress, and realization loading', () => {
  const page = read('SimulatorPage.jsx');

  assert.match(page, />Run count<\/span>/);
  assert.match(page, /aria-pressed=\{mcRunsCount === cnt\}/);
  assert.match(page, />Target metric<\/span>/);
  assert.match(page, /aria-label="Target metric"/);
  assert.match(page, /<option value="leaked">Leaked mass \(kt\)<\/option>/);
  assert.match(page, /<option value="trapped">Trapping efficiency<\/option>/);
  assert.match(page, /<progress[^>]+value=\{uqProgress\}[^>]+max="100"/);
  assert.equal((page.match(/>\s*Load realization\s*<\/button>/g) || []).length, 3);

  const loadPath = page.slice(page.indexOf('const loadUQRealization'), page.indexOf('// SVG Histogram Renderer'));
  assert.match(loadPath, /setActiveSubTab\('profile'\)/);
});

test('risk and methodology accessibility remains visible in the restrained theme', () => {
  const page = read('SimulatorPage.jsx');
  const css = read('simulator-workbench.css');
  const riskSettings = page.slice(page.indexOf('<div className="ve-uq-settings"'), page.indexOf('<div className="ve-risk-results">'));

  assert.doesNotMatch(page, /Load realization[\s\S]{0,250}outline: 'none'/);
  assert.doesNotMatch(riskSettings, /outline: 'none'/);
  assert.match(css, /\.ve-workspace-heading h1\s*\{[\s\S]*?background:\s*none;[\s\S]*?-webkit-background-clip:\s*border-box;[\s\S]*?background-clip:\s*border-box;[\s\S]*?-webkit-text-fill-color:\s*var\(--ve-ink\);[\s\S]*?font:\s*700 20px\/1\.2 var\(--font-prose\)/);
  assert.match(css, /\.ve-uq-realization:focus-visible[\s\S]*outline:/);
  assert.doesNotMatch(css, /guide-page-wrapper > div:first-of-type\s*\{[^}]*display:\s*none/);
  assert.match(css, /guide-page-wrapper > div:first-of-type > p[\s\S]*color: var\(--ve-muted\)/);
  assert.match(css, /\.ve-methodology-workspace \.numerator[\s\S]*border-bottom:[^;]*var\(--ve-(?:ink|muted)\)/);
  assert.match(css, /\.ve-risk-results svg\s*\{[\s\S]*?background:\s*var\(--ve-canvas\)\s*!important/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*\.ve-workspace-nav button:active[\s\S]*transform: none/);
});

test('workbench landmarks and input groups follow visual focus order', () => {
  const page = read('SimulatorPage.jsx');
  const input = page.indexOf('<InputRail');
  const visualization = page.indexOf('<VisualizationWorkspace');
  const outcome = page.indexOf('<OutcomeRail');
  const headings = ['Injection', 'Rock properties', 'Structure', 'Faults', 'Capillary behavior', 'Grid detail']
    .map(heading => page.indexOf(`<h3>${heading}</h3>`));

  assert.ok(input > -1 && input < visualization && visualization < outcome);
  assert.ok(headings.every((position, index) => position > -1 && (index === 0 || headings[index - 1] < position)));
  assert.doesNotMatch(page, /<summary className="sr-only">/);
});

test('outcome chart uses the shared mass formatter', () => {
  const page = read('SimulatorPage.jsx');

  assert.match(page, /formatMass\(chartMasses\.injected\)/);
  assert.match(page, /formatMass\(chartMasses\.mobile\)/);
  assert.match(page, /formatMass\(chartMasses\.trapped\)/);
  assert.match(page, /formatMass\(chartMasses\.leaked\)/);
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

test('desktop workbench keeps the visualization and rails within the first viewport', () => {
  const css = read('simulator-workbench.css');

  assert.match(css, /\.ve-workbench\s*\{[\s\S]*?height:\s*calc\(100dvh - 171px\)/);
  assert.match(css, /\.ve-visualization-workspace > \.sim-reservoir-card\s*\{[\s\S]*?min-height:\s*0\s*!important/);
  assert.match(css, /\.ve-visualization-workspace \[role="tabpanel"\][\s\S]*?min-height:\s*0/);
  assert.match(css, /\.ve-visualization-workspace \[role="tabpanel"\] > svg[\s\S]*?height:\s*auto\s*!important/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.ve-workbench\s*\{[\s\S]*?height:\s*auto/);
});

test('workbench navigation drawer contains focus and reversibly inerts its workspace', () => {
  const { getHeaderFocusWrapTarget, setHeaderBackgroundInert } = loadHeaderModalHelpers();
  const first = { id: 'close' };
  const last = { id: 'email' };
  const focusables = [first, last];
  const workspace = { inert: false };

  assert.equal(typeof getHeaderFocusWrapTarget, 'function');
  assert.equal(getHeaderFocusWrapTarget(focusables, last, false), first);
  assert.equal(getHeaderFocusWrapTarget(focusables, first, true), last);
  assert.equal(typeof setHeaderBackgroundInert, 'function');
  setHeaderBackgroundInert(workspace, true);
  assert.equal(workspace.inert, true);
  setHeaderBackgroundInert(workspace, false);
  assert.equal(workspace.inert, false);
});

test('workbench navigation drawer is a flat restrained modal without changing the site variant', () => {
  const header = read('Header.jsx');
  const workbenchRules = header.slice(header.indexOf('.mobile-drawer-backdrop.workbench'), header.indexOf('@media (max-width: 768px)'));

  assert.match(header, /ref=\{mobileDrawerRef\}/);
  assert.match(header, /document\.getElementById\('main-content'\)/);
  assert.match(header, /getHeaderFocusWrapTarget\(focusables, document\.activeElement, event\.shiftKey\)/);
  assert.match(workbenchRules, /\.mobile-drawer-backdrop\.workbench\s*\{[\s\S]*?background:\s*rgba\([^;]+;[\s\S]*?backdrop-filter:\s*none;[\s\S]*?transition:\s*opacity 180ms cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.match(workbenchRules, /\.mobile-drawer-panel\.workbench\s*\{[\s\S]*?background:\s*#fff;[\s\S]*?border-left:\s*1px solid var\(--ve-border\);[\s\S]*?box-shadow:\s*none;[\s\S]*?transition:\s*transform 180ms cubic-bezier\(0\.23, 1, 0\.32, 1\)/);
  assert.doesNotMatch(workbenchRules, /linear-gradient|blur\(|transition:\s*all|0\.3s|0\.4s/);
  assert.match(header, /className=\{`mobile-drawer-panel open\$\{isWorkbench \? ' workbench' : ''\}`\}/);
});

test('all enabled uncertainty parameter inputs retain a visible keyboard focus indicator', () => {
  const page = read('SimulatorPage.jsx');
  const uqParameter = page.slice(page.indexOf('const UQParamConfig'), page.indexOf('const Ve2DMapPanel'));

  assert.doesNotMatch(uqParameter, /outline:\s*'none'/);
  assert.match(read('simulator-workbench.css'), /\.ve-standalone :focus-visible\s*\{[\s\S]*?outline:/);
});

test('typed main parameter values report rejection or correction beside the field', () => {
  const normalize = loadRunStateHelpers().normalizeParameterInput;
  const page = read('SimulatorPage.jsx');
  const field = page.slice(page.indexOf('const ParameterField'), page.indexOf('// Stat numeric display'));
  const plainResult = raw => JSON.parse(JSON.stringify(normalize(raw, 0.1, 3.5)));

  assert.equal(typeof normalize, 'function');
  assert.deepEqual(plainResult(''), { value: null, message: 'Enter a number from 0.1 to 3.5.' });
  assert.deepEqual(plainResult('9'), { value: 3.5, message: 'Corrected to 3.5 (allowed range 0.1–3.5).' });
  assert.deepEqual(plainResult('1.7'), { value: 1.7, message: '' });
  assert.match(field, /aria-describedby=\{feedback \? feedbackId : undefined\}/);
  assert.match(field, /aria-invalid=\{feedback \? 'true' : undefined\}/);
  assert.match(field, /id=\{feedbackId\}[\s\S]*?className="ve-parameter-feedback"[\s\S]*?role="status"/);
});

test('storage efficiency updates without a trailing layout animation', () => {
  const page = read('SimulatorPage.jsx');
  const progress = page.slice(page.indexOf('const ProgressBar'), page.indexOf('// Bind to window object'));

  assert.match(progress, /width:\s*`\$\{clampedPct\}%`/);
  assert.doesNotMatch(progress, /transition|transform/);
});

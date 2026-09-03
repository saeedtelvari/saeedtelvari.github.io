const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const loadRunStateHelpers = () => {
  const page = read('SimulatorPage.jsx');
  const prelude = page.slice(0, page.indexOf('const UQParamConfig'));
  const context = { React: {} };
  vm.runInNewContext(`${prelude}\nthis.helpers = {\n    createScenarioSignature: typeof createScenarioSignature === 'undefined' ? undefined : createScenarioSignature,\n    deriveRunStatus: typeof deriveRunStatus === 'undefined' ? undefined : deriveRunStatus,\n    executeFileAction: typeof executeFileAction === 'undefined' ? undefined : executeFileAction,\n    getPlaybackAction: typeof getPlaybackAction === 'undefined' ? undefined : getPlaybackAction,\n    copyTextToClipboard: typeof copyTextToClipboard === 'undefined' ? undefined : copyTextToClipboard,\n    toggleMobilePanel: typeof toggleMobilePanel === 'undefined' ? undefined : toggleMobilePanel,\n    focusMobilePanelTrigger: typeof focusMobilePanelTrigger === 'undefined' ? undefined : focusMobilePanelTrigger,\n    lockPageScroll: typeof lockPageScroll === 'undefined' ? undefined : lockPageScroll,\n    selectPresentedMobilePanel: typeof selectPresentedMobilePanel === 'undefined' ? undefined : selectPresentedMobilePanel,\n    getMobileFocusWrapTarget: typeof getMobileFocusWrapTarget === 'undefined' ? undefined : getMobileFocusWrapTarget,\n    setMobilePanelBackgroundInert: typeof setMobilePanelBackgroundInert === 'undefined' ? undefined : setMobilePanelBackgroundInert\n  };`, context);
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
  vm.runInNewContext(`${prelude}\nthis.helpers = {\n    consumeMapCommand: typeof consumeMapCommand === 'undefined' ? undefined : consumeMapCommand,\n    deriveMapRunStatus: typeof deriveMapRunStatus === 'undefined' ? undefined : deriveMapRunStatus\n  };`, context);
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

test('map lifecycle stays mounted while workspace tabs change', () => {
  const page = read('SimulatorPage.jsx');

  assert.match(page, /hidden=\{activeSubTab !== 'map'\}[\s\S]*<Ve2DMapPanel/);
  assert.equal((page.match(/<Ve2DMapPanel/g) || []).length, 1);
});

test('map run status reports changed inputs after the last run', () => {
  const deriveStatus = loadMapLifecycleHelpers().deriveMapRunStatus || (() => 'missing');
  const snapshot = { isRunning: false, time: 18 };

  assert.equal(deriveStatus(snapshot, 'new-inputs', 'last-run'), 'Inputs changed');
  assert.equal(deriveStatus({ ...snapshot, isRunning: true }, 'new-inputs', 'last-run'), 'Running');
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
  assert.match(css, /\.ve-workspace-heading h1\s*\{[\s\S]*?font:\s*700 20px\/1\.2 var\(--font-prose\)/);
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

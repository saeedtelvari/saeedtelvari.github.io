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
  vm.runInNewContext(`${prelude}\nthis.helpers = {\n    createScenarioSignature: typeof createScenarioSignature === 'undefined' ? undefined : createScenarioSignature,\n    deriveRunStatus: typeof deriveRunStatus === 'undefined' ? undefined : deriveRunStatus,\n    executeFileAction: typeof executeFileAction === 'undefined' ? undefined : executeFileAction,\n    getPlaybackAction: typeof getPlaybackAction === 'undefined' ? undefined : getPlaybackAction,\n    copyTextToClipboard: typeof copyTextToClipboard === 'undefined' ? undefined : copyTextToClipboard,\n    resolveWorkspaceTab: typeof resolveWorkspaceTab === 'undefined' ? undefined : resolveWorkspaceTab\n  };`, context);
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

test('workspace actions select the correct view and loaded realizations return to the simulator', () => {
  const resolveTab = loadRunStateHelpers().resolveWorkspaceTab || (() => 'missing');

  assert.equal(resolveTab('simulator'), 'profile');
  assert.equal(resolveTab('risk'), 'uq');
  assert.equal(resolveTab('methodology'), 'guide');
  assert.equal(resolveTab('loaded-realization'), 'profile');
});

test('risk and methodology render as peer workspaces outside the visualization tabs', () => {
  const page = read('SimulatorPage.jsx');

  assert.match(page, /<nav className="ve-workspace-nav" aria-label="Simulator workspace">/);
  assert.match(page, /aria-current=\{VISUALIZATION_TABS\.includes\(activeSubTab\) \? 'page'/);
  assert.match(page, /<section className="ve-risk-workspace" aria-labelledby="risk-title">/);
  assert.match(page, /onClick=\{runMonteCarloBatch\}/);
  assert.match(page, /<section className="ve-methodology-workspace" aria-labelledby="methodology-title">[\s\S]*<GuidePage isEmbedded=\{true\} \/>/);
  assert.doesNotMatch(page, /id="tab-uq"/);
  assert.doesNotMatch(page, /id="tab-guide"/);
});

test('workbench landmarks and input groups follow visual focus order', () => {
  const page = read('SimulatorPage.jsx');
  const input = page.indexOf('<InputRail>');
  const visualization = page.indexOf('<VisualizationWorkspace>');
  const outcome = page.indexOf('<OutcomeRail>');
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

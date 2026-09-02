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
  vm.runInNewContext(`${prelude}\nthis.helpers = {\n    createScenarioSignature: typeof createScenarioSignature === 'undefined' ? undefined : createScenarioSignature,\n    deriveRunStatus: typeof deriveRunStatus === 'undefined' ? undefined : deriveRunStatus,\n    executeFileAction: typeof executeFileAction === 'undefined' ? undefined : executeFileAction\n  };`, context);
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

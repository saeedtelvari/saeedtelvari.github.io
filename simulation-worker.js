// simulation-worker.js — runs VE2D scenarios and uncertainty batches off the main thread.
// Protocol in:  { type: 'run', id, scenario } | { type: 'batch', id, scenarios }
// Protocol out: model, frame (snapshot + new history rows), done, progress, batch-done, error.
importScripts('./ve2d-model.js?v=5');

self.onmessage = ({ data }) => {
  const { type, id } = data;
  try {
    if (type === 'run') {
      let sent = 0;
      const result = VE2D.run(data.scenario, {
        keepSnapshots: false,
        onModel: model => self.postMessage({ type: 'model', id, model }),
        onSnapshot: (snap, history) => {
          const rows = history.slice(sent);
          sent = history.length;
          self.postMessage({ type: 'frame', id, snap, rows },
            [snap.h.buffer, snap.hMax.buffer, snap.ch4.buffer, snap.md.buffer, snap.p.buffer, snap.fx.buffer, snap.fy.buffer]);
        }
      });
      self.postMessage({ type: 'done', id, rows: result.history.slice(sent), truncated: result.truncated, steps: result.steps });
    } else if (type === 'batch') {
      const rows = VE2D.runBatch(data.scenarios, (done, total) => self.postMessage({ type: 'progress', id, done, total }));
      self.postMessage({ type: 'batch-done', id, rows });
    }
  } catch (error) {
    self.postMessage({ type: 'error', id, message: String((error && error.message) || error) });
  }
};

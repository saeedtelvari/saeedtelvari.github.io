// story-worker.js — runs the story scenario once, off the main thread (chapter 5 of the homepage story).
// Protocol in:  { type: 'run', id }
// Protocol out: { type: 'frame', id, year, h, ch4 } for each model year from 0 to the last year,
//               then { type: 'done', id, years } or { type: 'error', id, message }.
// h is the gas thickness in m on the model grid. ch4 is the methane share of the gas, from 0 to 1.
// The buffers of h and ch4 move to the page with the message.
importScripts('./ve2d-model.js?v=5', './story-geometry.js?v=1');

self.onmessage = ({ data }) => {
  const { type, id } = data;
  if (type !== 'run') return;
  try {
    let years = 0;
    VE2D.run(StoryGeometry.STORY_SCENARIO, {
      snapshotYears: 1,
      keepSnapshots: false,
      onSnapshot: snap => {
        years += 1;
        self.postMessage({ type: 'frame', id, year: snap.year, h: snap.h, ch4: snap.ch4 }, [snap.h.buffer, snap.ch4.buffer]);
      }
    });
    self.postMessage({ type: 'done', id, years });
  } catch (error) {
    self.postMessage({ type: 'error', id, message: String((error && error.message) || error) });
  }
};

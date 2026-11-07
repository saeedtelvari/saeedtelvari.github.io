importScripts('./hero-geology.js?v=5');

// One shared implementation (hero-geology.js) runs the model; the typed arrays are transferred.
self.onmessage = ({ data }) => {
  const start = performance.now();
  const run = HeroGeology.simulate(data.geology, data.options || {});
  // The page shows this time. It is a plain number, so the message shape and the transfer list stay the same.
  run.computeMs = performance.now() - start;
  const buffers = [...run.S, ...run.h, ...run.hMax, run.faultFlow, run.inventory].map(array => array.buffer);
  self.postMessage(run, buffers);
};

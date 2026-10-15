importScripts('./hero-geology.js?v=5');

// One shared implementation (hero-geology.js) runs the model; the typed arrays are transferred.
self.onmessage = ({ data }) => {
  const run = HeroGeology.simulate(data.geology, data.options || {});
  const buffers = [...run.S, ...run.h, ...run.hMax, run.faultFlow, run.inventory].map(array => array.buffer);
  self.postMessage(run, buffers);
};

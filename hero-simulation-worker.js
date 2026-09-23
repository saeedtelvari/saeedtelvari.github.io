importScripts('./hero-geology.js?v=1');
const { capRockY, getFaultIntersection, layerThicknessAt } = HeroGeology;

const advanceLayer = (h, hMax, faces, maxHeight, g, dt, leaksAt) => {
  const n = h.length;
  const mobile = h.map((height, i) => Math.min(height, Math.max(0, (height - g.R * hMax[i]) / (1 - g.R))));
  const flux = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const left = faces[i][0] + h[i];
    const right = faces[i][1] + h[i + 1];
    flux[i] = -g.K * (right - left > 0 ? mobile[i + 1] : mobile[i]) * (right - left);
  }
  const next = h.map((height, i) => Math.max(0, Math.min(maxHeight[i], height + dt * ((i ? flux[i - 1] : 0) - (i < n - 1 ? flux[i] : 0)))));
  if (leaksAt) leaksAt.forEach(({ index, amount }) => { next[index] = Math.min(maxHeight[index], next[index] + amount); });
  return next;
};

self.onmessage = ({ data }) => {
  const g = data.geology;
  const n = 201, dt = 0.02;
  const primaryMax = Array.from({ length: n }, (_, i) => layerThicknessAt(i * 5, 1, g.faults, i, g) / 15);
  const secondaryMax = Array.from({ length: n }, (_, i) => layerThicknessAt(i * 5, 0.4, g.faults, i, g) / 15);
  // Geometry is static for all 10,010 substeps; evaluate it only once.
  const faces = depth => Array.from({ length: n - 1 }, (_, i) => [
    capRockY(i * 5, g.faults, i, depth, g) / 15,
    capRockY((i + 1) * 5, g.faults, i, depth, g) / 15,
  ]);
  const primaryFaces = faces(1), secondaryFaces = faces(0.4);
  const faultCells = g.faults.map(fault => [1, 0.4].map(depth =>
    Math.max(0, Math.min(n - 1, Math.round(getFaultIntersection(fault, depth, g).x / 5)))));
  let h = new Array(n).fill(0), hMax = new Array(n).fill(0);
  let h2 = new Array(n).fill(0), h2Max = new Array(n).fill(0);
  const history = [];
  const faultFlow = g.faults.map(() => 0);

  for (let frame = 0; frame <= 1000; frame++) {
    history.push({ h: h.slice(), hMax: hMax.slice(), h2: h2.slice(), h2Max: h2Max.slice(), faultFlow: faultFlow.slice() });
    faultFlow.fill(0);
    for (let step = 0; step < 10; step++) {
      h = advanceLayer(h, hMax, primaryFaces, primaryMax, g, dt);
      const leaks = [];
      g.faults.forEach((fault, faultIndex) => {
        const [index, upper] = faultCells[faultIndex];
        if (h[index] > fault.thresholdHeight) {
          const amount = Math.min(h[index] - fault.thresholdHeight, fault.leakRate * dt);
          h[index] -= amount;
          faultFlow[faultIndex] += amount / (dt * 10);
          leaks.push({ index: upper, amount: amount * 1.5 });
        }
      });
      if (frame <= 320 && g.wellCellIdx >= 2 && g.wellCellIdx <= n - 3) {
        [0.15, 0.25, 0.4, 0.25, 0.15].forEach((weight, j) => {
          const i = g.wellCellIdx + j - 2;
          h[i] = Math.min(primaryMax[i], h[i] + g.Q * dt * weight);
        });
      }
      h.forEach((value, i) => { hMax[i] = Math.max(hMax[i], value); });
      h2 = advanceLayer(h2, h2Max, secondaryFaces, secondaryMax, g, dt, leaks);
      h2.forEach((value, i) => { h2Max[i] = Math.max(h2Max[i], value); });
    }
  }
  self.postMessage({ history });
};

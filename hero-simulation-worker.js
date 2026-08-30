const capRockBaseProfile = (x, g, depth = 1) => (
  g.baseDepth + x * g.dipSlope
  - g.amp1 * Math.sin((x + g.phase1) * Math.PI / g.lambda1)
  - g.amp2 * Math.sin(x * Math.PI / g.lambda2)
  - g.amp3 * Math.sin(x * Math.PI / g.lambda3)
) * depth;

const intersection = (fault, g, depth) => {
  const x0 = fault.xPercent * 10;
  let x = x0;
  for (let i = 0; i < 3; i++) x = x0 + (fault.dipSlope || 0) * capRockBaseProfile(x, g, depth);
  return x;
};

const capRockY = (x, cell, depth, g) => {
  let y = capRockBaseProfile(x, g, depth);
  const reference = cell == null ? x : cell * 5 + 2.5;
  g.faults.forEach((fault, i) => {
    if (reference > intersection(fault, g, depth)) y += (i % 2 ? -1 : 1) * g.faultThrow * (depth < 0.5 ? 0.4 : 1);
  });
  return y;
};

const advanceLayer = (h, hMax, depth, maxHeight, g, dt, leaksAt) => {
  const n = h.length;
  const mobile = h.map((height, i) => Math.min(height, Math.max(0, (height - g.R * hMax[i]) / (1 - g.R))));
  const flux = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const left = capRockY(i * 5, i, depth, g) / 15 + h[i];
    const right = capRockY((i + 1) * 5, i, depth, g) / 15 + h[i + 1];
    flux[i] = -g.K * (right - left > 0 ? mobile[i + 1] : mobile[i]) * (right - left);
  }
  const next = h.map((height, i) => Math.max(0, Math.min(maxHeight, height + dt * ((i ? flux[i - 1] : 0) - (i < n - 1 ? flux[i] : 0)))));
  if (leaksAt) leaksAt.forEach(({ index, amount }) => { next[index] = Math.min(maxHeight, next[index] + amount); });
  return next;
};

self.onmessage = ({ data }) => {
  const g = data.geology;
  const n = 201, dt = 0.02, primaryMax = g.reservoirThickness / 15, secondaryMax = 4;
  let h = new Array(n).fill(0), hMax = new Array(n).fill(0);
  let h2 = new Array(n).fill(0), h2Max = new Array(n).fill(0);
  const history = [];

  for (let frame = 0; frame <= 1000; frame++) {
    history.push({ h: h.slice(), hMax: hMax.slice(), h2: h2.slice(), h2Max: h2Max.slice() });
    for (let step = 0; step < 10; step++) {
      h = advanceLayer(h, hMax, 1, primaryMax, g, dt);
      const leaks = [];
      g.faults.forEach((fault) => {
        const index = Math.max(0, Math.min(n - 1, Math.round(intersection(fault, g, 1) / 5)));
        if (h[index] > fault.thresholdHeight) {
          const amount = Math.min(h[index] - fault.thresholdHeight, fault.leakRate * dt);
          h[index] -= amount;
          const upper = Math.max(0, Math.min(n - 1, Math.round(intersection(fault, g, 0.4) / 5)));
          leaks.push({ index: upper, amount: amount * 1.5 });
        }
      });
      if (frame <= 320 && g.wellCellIdx >= 2 && g.wellCellIdx <= n - 3) {
        [0.15, 0.25, 0.4, 0.25, 0.15].forEach((weight, j) => {
          const i = g.wellCellIdx + j - 2;
          h[i] = Math.min(primaryMax, h[i] + g.Q * dt * weight);
        });
      }
      h.forEach((value, i) => { hMax[i] = Math.max(hMax[i], value); });
      h2 = advanceLayer(h2, h2Max, 0.4, secondaryMax, g, dt, leaks);
      h2.forEach((value, i) => { h2Max[i] = Math.max(h2Max[i], value); });
    }
  }
  self.postMessage({ history });
};

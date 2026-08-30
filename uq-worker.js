const capRockBaseProfile = (x, p) => 150 + x * (p.dipPercent / 100) * 8 - p.amplitude * Math.sin((x * Math.PI / 1000) * p.frequency * 2);

const faultIntersection = (fault, index, p) => {
  const x0 = fault.xPercent * 10;
  const slope = fault.dipSlope == null ? (index % 2 ? 0.25 : -0.22) : fault.dipSlope;
  let x = x0;
  for (let i = 0; i < 3; i++) x = x0 + slope * capRockBaseProfile(x, p);
  return x;
};

const capRockY = (x, cellIndex, p) => {
  let y = capRockBaseProfile(x, p);
  const reference = cellIndex * p.parentDX + p.parentDX / 2;
  for (let i = 0; i < p.faultCount; i++) {
    if (reference > faultIntersection(p.faults[i], i, p)) y += (i % 2 ? -1 : 1) * p.faultOffset * 12;
  }
  return y;
};

const step = (currentH, currentHMax, masses, year, p) => {
  const n = p.cellCount, dx = p.parentDX || 1000 / n, dt = 1 / 25, maxHeight = 175 / 15;
  let h = currentH.slice(), hMax = currentHMax.slice();
  let injected = masses.injected, leaked = masses.leaked;
  const top = Array.from({ length: n }, (_, i) => capRockY(i * dx + dx / 2, i, p) / 15);

  for (let sub = 0; sub < 25; sub++) {
    const mobile = h.map((height, i) => Math.min(height, Math.max(0, (height - p.residualTrapFraction * hMax[i]) / (1 - p.residualTrapFraction))));
    const flux = new Array(n - 1).fill(0);
    for (let i = 0; i < n - 1; i++) {
      const gradient = (top[i + 1] + h[i + 1] - top[i] - h[i]) / (dx / 5);
      let transmission = 1;
      for (let f = 0; f < p.faultCount; f++) {
        if (Math.round(faultIntersection(p.faults[f], f, p) / dx) - 1 === i) {
          transmission = p.faults[f].isSealed ? 0 : (p.faults[f].transmissibility == null ? 1 : p.faults[f].transmissibility);
          break;
        }
      }
      let value = -(p.K / p.porosity) * (gradient > 0 ? mobile[i + 1] : mobile[i]) * gradient * 0.08 * transmission;
      value = value > 0 ? Math.min(value, 0.3 * mobile[i] / dt) : Math.max(value, -0.3 * mobile[i + 1] / dt);
      flux[i] = value;
    }
    const next = h.map((height, i) => Math.max(0, Math.min(maxHeight, height + dt * ((i ? flux[i - 1] : 0) - (i < n - 1 ? flux[i] : 0)))));
    if (p.Q > 0 && year <= p.injDuration) {
      const center = Math.floor(p.injLocation / 100 * n);
      [0.1, 0.2, 0.4, 0.2, 0.1].forEach((weight, offset) => {
        const i = Math.max(0, Math.min(n - 1, center + offset - 2));
        next[i] = Math.min(maxHeight, next[i] + p.Q * dt * weight / (p.porosity * (dx / 5)));
      });
      injected += p.Q * dt;
    }
    for (let f = 0; f < p.faultCount; f++) {
      const fault = p.faults[f];
      if (fault.isSealed) continue;
      const i = Math.max(0, Math.min(n - 1, Math.round(faultIntersection(fault, f, p) / dx)));
      if (next[i] > fault.thresholdHeight) {
        const amount = Math.min(next[i] - fault.thresholdHeight, fault.leakRate * dt * 0.8);
        next[i] -= amount;
        leaked += amount * p.porosity * (dx / 5);
      }
    }
    h = next;
    h.forEach((value, i) => { hMax[i] = Math.max(hMax[i], value); });
  }

  let mobile = 0, trapped = 0;
  h.forEach((height, i) => {
    const moving = Math.min(height, Math.max(0, (height - p.residualTrapFraction * hMax[i]) / (1 - p.residualTrapFraction)));
    mobile += moving * (dx / 5) * p.porosity;
    trapped += (height - moving) * (dx / 5) * p.porosity;
  });
  return { h, hMax, masses: { injected: +injected.toFixed(2), trapped: +trapped.toFixed(2), mobile: +mobile.toFixed(2), leaked: +leaked.toFixed(2) } };
};

self.onmessage = ({ data }) => {
  const results = [];
  data.realizations.forEach((r, index) => {
    const p = { ...data.base, ...r, faults: r.faults };
    let h = new Array(p.cellCount).fill(0), hMax = new Array(p.cellCount).fill(0);
    let masses = { injected: 0, trapped: 0, mobile: 0, leaked: 0 };
    for (let year = 1; year <= 1000; year++) {
      const result = step(h, hMax, masses, year, p);
      h = result.h; hMax = result.hMax; masses = result.masses;
    }
    results.push({
      id: r.id, params: r, finalLeaked: masses.leaked, finalTrapped: masses.trapped,
      finalMobile: masses.mobile, finalInjected: masses.injected,
      trappingEfficiency: masses.injected ? masses.trapped / masses.injected * 100 : 0,
      leakedFraction: masses.injected ? masses.leaked / masses.injected * 100 : 0,
      h, hMax
    });
    self.postMessage({ type: 'progress', value: Math.round((index + 1) / data.realizations.length * 100) });
  });
  self.postMessage({ type: 'complete', results });
};

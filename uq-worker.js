const capRockBaseProfile = (x, p) => 150 + x * (p.dipPercent / 100) * 8 - p.amplitude * Math.sin((x * Math.PI / 1000) * p.frequency * 2);

const faultIntersection = (fault, index, p) => {
  const x0 = fault.xPercent * 10;
  const slope = fault.dipSlope == null ? (index % 2 ? 0.25 : -0.22) : fault.dipSlope;
  let x = x0;
  for (let i = 0; i < 3; i++) x = x0 + slope * capRockBaseProfile(x, p);
  return x;
};

const capRockY = (x, cellIndex, p, faultX) => {
  let y = capRockBaseProfile(x, p);
  const reference = cellIndex * p.parentDX + p.parentDX / 2;
  for (let i = 0; i < p.faultCount; i++) {
    if (reference > faultX[i]) y += (i % 2 ? -1 : 1) * p.faultOffset * 12;
  }
  return y;
};

self.onmessage = ({ data }) => {
  const results = [];
  const total = data.realizations.length;

  data.realizations.forEach((r, index) => {
    const p = { ...data.base, ...r, faults: r.faults || [] };
    const n = p.cellCount || 200;
    const dx = p.parentDX || 1000 / n;
    const dt = 1 / 25;
    const maxHeight = 175 / 15;
    const scaledArea = (dx / 5);
    const mobFactor = (p.K / p.porosity) * 0.08;
    const invResidual = p.residualTrapFraction < 1 ? 1 / (1 - p.residualTrapFraction) : 0;
    const injCenter = Math.floor((p.injLocation / 100) * n);
    const weights = [0.1, 0.2, 0.4, 0.2, 0.1];

    // Precompute geometry once per realization (eliminates redundant evaluations)
    const faultX = (p.faults || []).slice(0, p.faultCount).map((f, i) => faultIntersection(f, i, p));
    const faultCells = faultX.map(x => Math.round(x / dx));
    const faultTrans = (p.faults || []).slice(0, p.faultCount).map(f => f.isSealed ? 0 : (f.transmissibility == null ? 1 : f.transmissibility));

    const top = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      top[i] = capRockY(i * dx + dx / 2, i, p, faultX) / 15;
    }

    const h = new Float64Array(n);
    const hMax = new Float64Array(n);
    const mobile = new Float64Array(n);
    const flux = new Float64Array(n - 1);
    let injected = 0, leaked = 0;

    for (let year = 1; year <= 1000; year++) {
      for (let sub = 0; sub < 25; sub++) {
        // 1. Partition mobile gas
        for (let i = 0; i < n; i++) {
          const height = h[i];
          if (height <= 0) {
            mobile[i] = 0;
          } else {
            const m = (height - p.residualTrapFraction * hMax[i]) * invResidual;
            mobile[i] = Math.min(height, Math.max(0, m));
          }
        }

        // 2. Upwind flux calculation
        for (let i = 0; i < n - 1; i++) {
          const grad = (top[i + 1] + h[i + 1] - top[i] - h[i]) / scaledArea;
          let transmission = 1;
          for (let f = 0; f < p.faultCount; f++) {
            if (faultCells[f] - 1 === i) {
              transmission = faultTrans[f];
              break;
            }
          }
          let val = -mobFactor * (grad > 0 ? mobile[i + 1] : mobile[i]) * grad * transmission;
          const maxF1 = 0.3 * mobile[i] / dt;
          const maxF2 = -0.3 * mobile[i + 1] / dt;
          if (val > maxF1) val = maxF1;
          else if (val < maxF2) val = maxF2;
          flux[i] = val;
        }

        // 3. Advance finite-volume cell heights
        for (let i = 0; i < n; i++) {
          const netFlux = (i > 0 ? flux[i - 1] : 0) - (i < n - 1 ? flux[i] : 0);
          let nextH = h[i] + dt * netFlux;
          if (nextH < 0) nextH = 0;
          else if (nextH > maxHeight) nextH = maxHeight;
          h[i] = nextH;
        }

        // 4. Source injection
        if (p.Q > 0 && year <= p.injDuration) {
          const injStep = p.Q * dt / (p.porosity * scaledArea);
          for (let o = 0; o < 5; o++) {
            const idx = Math.max(0, Math.min(n - 1, injCenter + o - 2));
            const nextVal = h[idx] + injStep * weights[o];
            h[idx] = nextVal > maxHeight ? maxHeight : nextVal;
          }
          injected += p.Q * dt;
        }

        // 5. Fault leakage
        for (let f = 0; f < p.faultCount; f++) {
          const fault = p.faults[f];
          if (fault.isSealed) continue;
          const i = Math.max(0, Math.min(n - 1, faultCells[f]));
          if (h[i] > fault.thresholdHeight) {
            const amount = Math.min(h[i] - fault.thresholdHeight, fault.leakRate * dt * 0.8);
            h[i] -= amount;
            leaked += amount * p.porosity * scaledArea;
          }
        }

        // 6. Update max historical envelope
        for (let i = 0; i < n; i++) {
          if (h[i] > hMax[i]) hMax[i] = h[i];
        }
      }
    }

    let finalMobile = 0, finalTrapped = 0;
    const scaledCellArea = scaledArea * p.porosity;
    for (let i = 0; i < n; i++) {
      const height = h[i];
      const moving = Math.min(height, Math.max(0, (height - p.residualTrapFraction * hMax[i]) * invResidual));
      finalMobile += moving * scaledCellArea;
      finalTrapped += (height - moving) * scaledCellArea;
    }

    results.push({
      id: r.id,
      params: r,
      finalLeaked: +leaked.toFixed(2),
      finalTrapped: +finalTrapped.toFixed(2),
      finalMobile: +finalMobile.toFixed(2),
      finalInjected: +injected.toFixed(2),
      trappingEfficiency: injected > 0 ? (finalTrapped / injected) * 100 : 0,
      leakedFraction: injected > 0 ? (leaked / injected) * 100 : 0,
      h: Array.from(h),
      hMax: Array.from(hMax)
    });

    self.postMessage({ type: 'progress', value: Math.round(((index + 1) / total) * 100) });
  });

  self.postMessage({ type: 'complete', results });
};

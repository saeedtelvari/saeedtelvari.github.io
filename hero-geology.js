// Shared by the homepage renderer, its worker and Node tests. Coordinates are SVG units
// (x 0–1000 across the section, y 0–580 down from the ground surface).
const HeroGeology = (() => {
  // Two faults with opposing dips of 0–20° from vertical that never cross inside the section.
  const randomFaults = random => {
    const angle1 = random() * 20, angle2 = random() * 20;
    const slope1 = parseFloat(Math.tan(angle1 * Math.PI / 180).toFixed(3));
    const slope2 = parseFloat(Math.tan(angle2 * Math.PI / 180).toFixed(3));
    // 65 % diverge (horst-like), 35 % converge with a guaranteed clearance at the base.
    const divergent = random() < 0.65;
    let dip1 = divergent ? -slope1 : slope1;
    let dip2 = divergent ? slope2 : -slope2;
    let x1, x2;
    if (divergent) {
      x1 = Math.floor(random() * 15) + 18; // 18–32 %
      x2 = Math.floor(random() * 11) + 44; // 44–54 %
    } else {
      x1 = Math.floor(random() * 9) + 14; // 14–22 %
      const minX2 = Math.max(46, Math.ceil((x1 * 10 + (dip1 - dip2) * 580 + 80) / 10));
      x2 = minX2 <= 54 ? Math.floor(random() * (54 - minX2 + 1)) + minX2 : 54;
      if ((x2 * 10 + dip2 * 580) - (x1 * 10 + dip1 * 580) < 60) { dip1 = -slope1; dip2 = slope2; }
    }
    const fault = (xPercent, dipSlope, angleDeg) => ({
      xPercent, dipSlope, angleDeg: parseFloat(angleDeg.toFixed(1)),
      // Entry height of the fault rock (column height of mobile CO2) and the leak rate above it.
      thresholdHeight: parseFloat((random() * 0.4 + 0.15).toFixed(2)),
      leakRate: parseFloat((random() * 0.18 + 0.08).toFixed(2)),
    });
    return [fault(x1, dip1, angle1), fault(x2, dip2, angle2)].sort((a, b) => a.xPercent - b.xPercent);
  };

  // A new, physically bounded section for every page load.
  const randomGeology = (random = Math.random) => {
    const faults = randomFaults(random);
    const dipSlope = parseFloat((0.025 + random() * 0.085).toFixed(3));
    const baseDepth = parseFloat((110 + random() * 45).toFixed(1));
    // Broad folds, shorter anticlines and micro-topography of the storage aquifer roof.
    const amp1 = parseFloat((12 + random() * 20).toFixed(1));
    const lambda1 = parseFloat((120 + random() * 150).toFixed(1));
    const phase1 = parseFloat(((random() - 0.5) * 180).toFixed(1));
    const amp2 = parseFloat((5 + random() * 7).toFixed(1));
    const lambda2 = parseFloat((65 + random() * 55).toFixed(1));
    const amp3 = parseFloat((2 + random() * 3).toFixed(1));
    const lambda3 = parseFloat((40 + random() * 12).toFixed(1));
    const faultThrow = parseFloat((12 + random() * 8).toFixed(1));
    const reservoirThickness = parseFloat((100 + random() * 150).toFixed(1));
    // Keep a seal between the overlying aquifer and the storage aquifer, even at fold crests.
    const shallowThickness = Math.min(25 + random() * 25, 0.6 * (baseDepth - amp1 - amp2 - amp3) - 0.4 * faultThrow - 8);
    const capLayerDepths = [0.55 + random() * 0.03, 0.28 + random() * 0.07, 0.06 + random() * 0.04];
    const aquiferLayerOffsets = [90 + random() * 12, 176 + random() * 16, 256 + random() * 12];
    // Mobility (solver units), residual saturation and the legacy injection rate.
    const K = parseFloat((1.15 + random() * 0.35).toFixed(2));
    const R = parseFloat((0.24 + random() * 0.07).toFixed(2));
    const Q = parseFloat((3.40 + random() * 0.60).toFixed(2));
    const wellXPct = 68 + Math.floor(random() * 5);
    const wellX = wellXPct * 10;
    return {
      faults, dipSlope, baseDepth, amp1, lambda1, phase1, amp2, lambda2, amp3, lambda3, faultThrow,
      reservoirThickness, shallowThickness, capLayerDepths, aquiferLayerOffsets,
      thicknessWavelength: 650 + random() * 350,
      reservoirThicknessPhase: random() * 2 * Math.PI,
      capThicknessPhase: random() * 2 * Math.PI,
      aquiferThicknessPhase: random() * 2 * Math.PI,
      K, R, Q, wellXPct, wellX, wellCellIdx: Math.round(wellX / 5),
    };
  };

  const layerFraction = (t, x, phase, wavelength) =>
    t + 0.08 * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * x / wavelength + phase);

  const capRockBaseProfile = (x, depth = 1, g) => (
    g.baseDepth + x * g.dipSlope
    - g.amp1 * Math.sin((x + g.phase1) * Math.PI / g.lambda1)
    - g.amp2 * Math.sin(x * Math.PI / g.lambda2)
    - g.amp3 * Math.sin(x * Math.PI / g.lambda3)
  ) * layerFraction(depth, x, g.capThicknessPhase, g.thicknessWavelength);

  const stratumBaseProfile = (x, depth = 1, yOffset = 0, g) => {
    const roof = capRockBaseProfile(x, depth, g);
    if (!yOffset) return roof;
    const top = capRockBaseProfile(x, 1, g);
    const wave = Math.sin(2 * Math.PI * x / g.thicknessWavelength + g.reservoirThicknessPhase);
    if (depth < 0.5) {
      // The shallow bed occupies part of the seal, with clearance for fault steps.
      return roof + (top - roof - 0.4 * g.faultThrow - 8) * (0.45 + 0.15 * wave);
    }
    const floor = top + 65 + (435 - top) * (g.reservoirThickness / 300) * (0.65 + 0.30 * wave);
    const t = Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320));
    // Lower beds redistribute the remaining height; the bottom never moves.
    return t === 1 ? 580 : floor + (580 - floor) * layerFraction(t, x, g.aquiferThicknessPhase, g.thicknessWavelength * 1.2);
  };

  const getStratumFaultIntersection = (fault, depth = 1, yOffset = 0, g) => {
    const x0 = fault.xPercent * 10;
    const slope = fault.dipSlope || 0;
    let x = x0;
    for (let i = 0; i < 3; i++) x = x0 + slope * stratumBaseProfile(x, depth, yOffset, g);
    return { x, y: stratumBaseProfile(x, depth, yOffset, g), x0, slope };
  };

  const getFaultIntersection = (fault, depth = 1, g) => getStratumFaultIntersection(fault, depth, 0, g);

  const stratumY = (x, faults, cell = null, depth = 1, yOffset = 0, g) => {
    let y = stratumBaseProfile(x, depth, yOffset, g);
    const reference = cell === null ? x : cell * 5 + 2.5;
    const lowerFraction = depth === 1 ? Math.max(0, Math.min(1, (yOffset - g.reservoirThickness) / 320)) : 0;
    const throwScale = depth < 0.5 ? depth : 1 - lowerFraction;
    faults.forEach((fault, i) => {
      if (reference > getStratumFaultIntersection(fault, depth, yOffset, g).x) {
        y += (i % 2 ? -1 : 1) * g.faultThrow * throwScale;
      }
    });
    return y;
  };

  const capRockY = (x, faults, cell = null, depth = 1, g) => stratumY(x, faults, cell, depth, 0, g);
  const layerThicknessAt = (x, depth, faults, cell, g) =>
    stratumY(x, faults, cell, depth, depth < 0.5 ? g.shallowThickness : g.reservoirThickness, g)
    - capRockY(x, faults, cell, depth, g);

  // ---------------------------------------------------------------- VE model
  // One sharp-interface vertical-equilibrium layer per aquifer. Each node holds S, the CO2
  // volume per unit area over porosity (conserved), and hMax, the deepest interface so far.
  // The mobile plume is h; the swept zone below it keeps residual CO2: S = h + R (hMax - h).
  const HERO_NODES = 201, HERO_DX = 5, HERO_UNIT = 15, HERO_YEAR = 0.2;
  const HERO_WEIGHTS = [0.15, 0.25, 0.4, 0.25, 0.15];
  // Depth below the axis break is linear; the overburden above it is drawn compressed.
  const HERO_DEPTH = { breakY: 28, breakDepth: 800, metresPerUnit: 3, sectionWidth: 10000 };

  const mobileThickness = (S, hMax, R) => S >= hMax ? S : Math.max(0, Math.min(S, (S - R * hMax) / (1 - R)));
  const storedVolume = (h, hMax, R) => h >= hMax ? h : h + R * (hMax - h);

  // A permeable fault shares one gas-water level across its two adjacent columns.
  // Solve for that level without creating or removing CO2; residual CO2 stays where it is.
  const balanceFaultContact = (S, left, right, roofLeft, roofRight, capLeft, capRight, hMax = null, R = 0) => {
    const total = S[left] + S[right];
    if (total <= 0) return;
    const mL = hMax ? hMax[left] : 0, mR = hMax ? hMax[right] : 0;
    const volume = (level, roof, cap, m) => storedVolume(Math.max(0, Math.min(cap, level - roof)), m, R);
    let low = Math.min(roofLeft, roofRight), high = Math.max(roofLeft + capLeft, roofRight + capRight);
    for (let i = 0; i < 48; i++) {
      const level = (low + high) / 2;
      if (volume(level, roofLeft, capLeft, mL) + volume(level, roofRight, capRight, mR) < total) low = level;
      else high = level;
    }
    S[left] = Math.min(total, volume((low + high) / 2, roofLeft, capLeft, mL));
    S[right] = total - S[left];
  };

  // Static geometry, evaluated once per section: roof and floor of both aquifers at every node.
  // L belongs to the cell left of the node, R to the cell on its right; they differ at faults.
  const section = g => {
    const layer = (depth, thickness) => {
      const roofL = new Float64Array(HERO_NODES), roofR = new Float64Array(HERO_NODES);
      const floorL = new Float64Array(HERO_NODES), floorR = new Float64Array(HERO_NODES);
      for (let k = 0; k < HERO_NODES; k++) {
        const x = k * HERO_DX;
        roofR[k] = capRockY(x, g.faults, k, depth, g);
        floorR[k] = stratumY(x, g.faults, k, depth, thickness, g);
        roofL[k] = k ? capRockY(x, g.faults, k - 1, depth, g) : roofR[k];
        floorL[k] = k ? stratumY(x, g.faults, k - 1, depth, thickness, g) : floorR[k];
      }
      const inside = k => k > 0 && k < HERO_NODES - 1;
      const cap = Float64Array.from(roofR, (roof, k) => Math.max(0, (floorR[k] - roof) / HERO_UNIT));
      const faultTop = Uint8Array.from(roofR, (roof, k) => inside(k) && Math.abs(roofL[k] - roof) > 0.1 ? 1 : 0);
      const faultBottom = Uint8Array.from(faultTop, (top, k) => top || (inside(k) && Math.abs(floorL[k] - floorR[k]) > 0.1) ? 1 : 0);
      return { depth, roofL, roofR, floorL, floorR, cap, faultTop, faultBottom };
    };
    const layers = [layer(1, g.reservoirThickness), layer(0.4, g.shallowThickness)];
    const clampCell = k => Math.max(0, Math.min(HERO_NODES - 1, k));
    return {
      layers,
      faultCells: g.faults.map(f => layers.map(l => clampCell(Math.round(getFaultIntersection(f, l.depth, g).x / HERO_DX)))),
      wellCell: g.wellCellIdx,
      wellBottom: stratumY(g.wellX, g.faults, null, 1, g.reservoirThickness, g) - 20,
    };
  };

  // Gravity-driven migration with residual trapping, fault contacts and threshold-gated fault
  // leakage into the overlying aquifer. CO2 is injected for `injectionYears`, then migrates.
  const simulate = (g, { years = 2000, injectionYears = 30, injectedVolume = 260 } = {}) => {
    const n = HERO_NODES, R = g.R, K = g.K, nF = g.faults.length;
    const sec = section(g);
    const L = sec.layers.map(l => ({ ...l, S: new Float64Array(n), hMax: new Float64Array(n),
      roof: Float64Array.from(l.roofR, r => r / HERO_UNIT), h: new Float64Array(n), move: new Float64Array(n - 1) }));
    const out = { years, injectionYears, nodes: n, faults: nF, lost: 0,
      S: [0, 1].map(() => new Float32Array((years + 1) * n)),
      h: [0, 1].map(() => new Float32Array((years + 1) * n)),
      hMax: [0, 1].map(() => new Float32Array((years + 1) * n)),
      faultFlow: new Float32Array((years + 1) * nF), inventory: new Float64Array((years + 1) * 4) };
    let injected = 0;
    const settle = l => { for (let i = 0; i < n; i++) if (l.S[i] > l.hMax[i]) l.hMax[i] = l.S[i]; };
    // Place `amount` at `center`, spilling into the nearest columns with room; returns what did not fit.
    const deposit = (l, center, amount) => {
      for (let d = 0; amount > 0 && d < n; d++) {
        for (const i of d ? [center - d, center + d] : [center]) {
          if (i < 0 || i >= n || amount <= 0) continue;
          const a = Math.min(Math.max(0, l.cap[i] - l.S[i]), amount);
          l.S[i] += a; amount -= a;
        }
      }
      return Math.max(0, amount);
    };
    // Explicit fluxes from the start-of-step state, q = -K h_up d(roof + h)/dx. Each transfer is
    // limited by what the donor can release (mobile CO2 above its residual) and the receiver can
    // hold, so every move conserves CO2; sweeps alternate direction to stay unbiased.
    const transport = (l, dt, reverse) => {
      const { S, hMax, roof, cap, h, move } = l;
      for (let i = 0; i < n; i++) h[i] = mobileThickness(S[i], hMax[i], R);
      for (let i = 0; i < n - 1; i++) {
        const grad = roof[i + 1] + h[i + 1] - roof[i] - h[i];
        move[i] = -K * (grad > 0 ? h[i + 1] : h[i]) * grad * dt;
      }
      const shift = (from, to, amount) => {
        const a = Math.max(0, Math.min(amount, S[from] - R * Math.max(hMax[from], S[from]), cap[to] - S[to]));
        S[from] -= a; S[to] += a;
      };
      for (let j = 0; j < n - 1; j++) {
        const i = reverse ? n - 2 - j : j;
        if (move[i] > 0) shift(i, i + 1, move[i]);
        else if (move[i] < 0) shift(i + 1, i, -move[i]);
      }
      settle(l);
    };
    const record = y => {
      let mobile = 0, residual = 0, leaked = 0;
      L.forEach((l, j) => {
        for (let i = 0; i < n; i++) {
          const h = mobileThickness(l.S[i], l.hMax[i], R);
          out.S[j][y * n + i] = l.S[i]; out.h[j][y * n + i] = h; out.hMax[j][y * n + i] = l.hMax[i];
          if (j === 0) { mobile += h; residual += l.S[i] - h; } else leaked += l.S[i];
        }
      });
      out.inventory.set([mobile, residual, leaked, injected], y * 4);
    };
    const rate = injectedVolume / (injectionYears * HERO_YEAR);
    record(0);
    for (let y = 1; y <= years; y++) {
      const flow = new Float64Array(nF);
      let t = 0, sweep = 0;
      while (t < HERO_YEAR - 1e-12) {
        let peak = 0;
        for (const l of L) for (let i = 0; i < n; i++) peak = Math.max(peak, mobileThickness(l.S[i], l.hMax[i], R));
        // Explicit stability: K h dt stays below 0.45 (dx = 1 in solver units).
        const dt = Math.min(HERO_YEAR - t, 0.02, 0.45 / (K * peak + 1e-9));
        L.forEach(l => transport(l, dt, sweep % 2 === 1));
        sec.faultCells.forEach(cells => L.forEach((l, j) => {
          const k = cells[j];
          if (k > 0 && k < n) balanceFaultContact(l.S, k - 1, k, l.roofL[k] / HERO_UNIT, l.roofR[k] / HERO_UNIT, l.cap[k - 1], l.cap[k], l.hMax, R);
        }));
        L.forEach(settle);
        // Leakage starts once the mobile column at the fault exceeds the fault rock's entry height.
        g.faults.forEach((fault, i) => {
          const [k, up] = sec.faultCells[i];
          const h = mobileThickness(L[0].S[k], L[0].hMax[k], R);
          if (h <= fault.thresholdHeight) return;
          const want = Math.min((h - fault.thresholdHeight) * (1 - R), fault.leakRate * dt);
          const moved = want - deposit(L[1], up, want);
          L[0].S[k] -= moved;
          flow[i] += moved;
        });
        if (y <= injectionYears) {
          HERO_WEIGHTS.forEach((w, j) => {
            const amount = rate * dt * w / 1.2;
            const rest = deposit(L[0], sec.wellCell + j - 2, amount);
            injected += amount - rest;
            out.lost += rest;
          });
        }
        L.forEach(settle);
        t += dt; sweep++;
      }
      out.faultFlow.set(Array.from(flow, v => v / HERO_YEAR), y * nF);
      record(y);
    }
    return out;
  };

  // Views into one recorded year (no copies), plus the volume each fault has passed so far.
  const frameOf = (run, year) => {
    const y = Math.max(0, Math.min(run.years, Math.round(year))), a = y * run.nodes, b = a + run.nodes;
    const [mobile, residual, leaked, injected] = run.inventory.subarray(y * 4, y * 4 + 4);
    const faultLeaked = new Float64Array(run.faults);
    for (let t = 1; t <= y; t++) for (let i = 0; i < run.faults; i++) faultLeaked[i] += run.faultFlow[t * run.faults + i] * HERO_YEAR;
    return {
      S: run.S[0].subarray(a, b), h: run.h[0].subarray(a, b), hMax: run.hMax[0].subarray(a, b),
      S2: run.S[1].subarray(a, b), h2: run.h[1].subarray(a, b), h2Max: run.hMax[1].subarray(a, b),
      faultFlow: run.faultFlow.subarray(y * run.faults, (y + 1) * run.faults), faultLeaked,
      inventory: { mobile, residual, leaked, injected },
    };
  };

  // What the label beside a leaking fault says: which fault, its CO2 column against its entry height
  // (both in metres of section depth), and the share of injected CO2 that has leaked. A steady leak
  // drains the column down to the entry height, so the column is either above it or held at it.
  const leakReadout = (g, sec, frame) => {
    let i = -1;
    frame.faultFlow.forEach((v, j) => { if (v > 0 && (i < 0 || v > frame.faultFlow[i])) i = j; });
    if (i < 0) return null;
    const metres = units => Math.round(units * HERO_UNIT * HERO_DEPTH.metresPerUnit);
    const column = metres(frame.h[sec.faultCells[i][0]]), entry = metres(g.faults[i].thresholdHeight);
    const { leaked, injected } = frame.inventory;
    return { fault: i, state: column > entry ? 'above' : 'held', column, entry,
      leakedPct: injected > 0 ? Math.round(100 * leaked / injected) : 0 };
  };

  const depthToY = metres => HERO_DEPTH.breakY + (metres - HERO_DEPTH.breakDepth) / HERO_DEPTH.metresPerUnit;
  const depthTicks = () => [1000, 1500, 2000];
  // Horizontal metres per pixel over vertical metres per pixel of the rendered section.
  const exaggeration = (widthPx, heightPx) =>
    Math.max(1, Math.round((HERO_DEPTH.sectionWidth / widthPx) / (HERO_DEPTH.metresPerUnit * 580 / heightPx)));
  // Playback speed in simulated years per second: slow while injecting, eased up to fast migration.
  const yearsPerSecond = (year, injectionYears = 30) => {
    const t = Math.max(0, Math.min(1, (year - injectionYears) / 10));
    return 8 + 52 * t * t * (3 - 2 * t);
  };

  return { randomGeology, capRockBaseProfile, stratumBaseProfile, getStratumFaultIntersection,
    getFaultIntersection, stratumY, capRockY, layerThicknessAt, balanceFaultContact,
    mobileThickness, storedVolume, section, simulate, frameOf, leakReadout,
    HERO_DEPTH, depthToY, depthTicks, exaggeration, yearsPerSecond };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = HeroGeology;

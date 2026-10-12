// ve-engine.js — Vertical Equilibrium (VE) CO2 storage engine. Pure functions, no DOM/React.
// Spec: docs/superpowers/specs/2026-10-12-ve-engine-design.md
(function () {
  'use strict';

  const G = 9.81;
  const MD = 9.869233e-16;          // m² per millidarcy
  const CP = 1e-3;                  // Pa·s per centipoise
  const KPA = 1e3;                  // Pa per kPa
  const YEAR = 365.25 * 86400;      // s
  const MT = 1e9;                   // kg per megatonne
  const ALPHA_D = 0.017;            // convective dissolution prefactor (Pau et al. 2010)
  const DRHO_S = 10;                // kg/m³ density increase of CO2-saturated brine
  const C_S = 50;                   // kg/m³ CO2 solubility in brine
  const WF = 1;                     // m, fault-zone width for up-fault leakage
  const MAX_SUB = 5000;             // substeps per simulated year before dt is floored

  const clone = o => JSON.parse(JSON.stringify(o));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function deepFreeze(o) {
    Object.values(o).forEach(v => { if (v && typeof v === 'object') deepFreeze(v); });
    return Object.freeze(o);
  }

  const FAULT_A = { xFrac: 0.28, throw_m: 15, Trock: 1, Pth_kPa: 20, kf_mD: 5, sealed: false, dipSlope: -0.22 };
  const FAULT_B = { xFrac: 0.48, throw_m: -12, Trock: 0.8, Pth_kPa: 30, kf_mD: 5, sealed: false, dipSlope: 0.25 };
  const FAULT_C = { xFrac: 0.62, throw_m: 10, Trock: 1, Pth_kPa: 25, kf_mD: 5, sealed: false, dipSlope: -0.2 };

  const DEFAULT_PARAMS = deepFreeze({
    L: 20000, nx: 200, W: 5000, H: 50, C: 30, H2: 30, z0: 1000,
    dipPct: 0.5, foldAmp: 20, foldCount: 2,
    k_mD: 500, phi: 0.25, Swr: 0.2, Sgr: 0.25, krgStar: 0.6,
    rhoW: 1050, dRho: 350, muW_cP: 0.5, M: 5,
    Q_Mtpa: 1, injYears: 30, wellFrac: 0.7,
    fringeOn: true, Pe_kPa: 5, dissMult: 1,
    faults: [FAULT_A, FAULT_B]
  });

  function withDefaults(over) {
    return Object.assign(clone(DEFAULT_PARAMS), clone(over || {}));
  }

  const PRESETS = deepFreeze({
    default: withDefaults({}),
    dome: withDefaults({ dipPct: 0.1, foldAmp: 45, foldCount: 1.5, faults: [] }),
    faultedTrap: withDefaults({
      dipPct: 1.5, foldAmp: 5, foldCount: 1,
      faults: [{ ...FAULT_A, xFrac: 0.4, throw_m: 60, Pth_kPa: 200, kf_mD: 1 }]
    }),
    dipping: withDefaults({ dipPct: -2, foldAmp: 5, foldCount: 1, faults: [], Sgr: 0.3, dissMult: 2, wellFrac: 0.2 }),
    leakyFault: withDefaults({ wellFrac: 0.35, faults: [{ ...FAULT_A, Pth_kPa: 10, kf_mD: 200 }, FAULT_B] })
  });

  // ---------------------------------------------------------------- geometry

  // 1D spill-point trap analysis on cell-centre caprock depths. mult[f] === 0 marks a barrier face
  // (face f sits between cells f-1 and f). Returns [{ crest, lo, hi, spill }] with spill = Infinity
  // for compartments closed by barriers on both sides.
  // ponytail: traps are independent, no merging of nested traps on overfill (co2lab trap tree = upgrade).
  function findTraps(zt, mult) {
    const n = zt.length, traps = [];
    const walk = (start, dir) => {
      for (let i = start; ;) {
        const j = i + dir;
        if (j < 0 || j >= n) return zt[i];                 // domain edge: spills at edge depth
        if (mult[dir < 0 ? i : j] === 0) return Infinity;  // barrier: never spills this way
        if (zt[j] < zt[i]) return zt[i];                   // turns shallower: saddle
        i = j;
      }
    };
    for (let a = 0; a < n;) {
      let b = a;
      while (b + 1 < n && mult[b + 1] > 0 && zt[b + 1] === zt[a]) b++;
      const leftUp = a > 0 && (mult[a] === 0 || zt[a - 1] > zt[a]);
      const rightUp = b < n - 1 && (mult[b + 1] === 0 || zt[b + 1] > zt[b]);
      if (leftUp && rightUp) {
        const spill = Math.min(walk(a, -1), walk(b, 1));
        let lo = a, hi = b;
        while (lo > 0 && mult[lo] > 0 && zt[lo - 1] < spill) lo--;
        while (hi < n - 1 && mult[hi + 1] > 0 && zt[hi + 1] < spill) hi++;
        traps.push({ crest: a, lo, hi, spill });
      }
      a = b + 1;
    }
    return traps;
  }

  function createModel(params) {
    const p = withDefaults(params);
    if (p.Swr + p.Sgr >= 0.9) throw new Error('VE: Swr + Sgr must be < 0.9');
    const nx = Math.round(p.nx), dx = p.L / nx;
    const rhoG = p.rhoW - p.dRho;
    const muW = p.muW_cP * CP, muG = p.krgStar * muW / p.M;
    const k = p.k_mD * MD;
    const xc = new Float64Array(nx), base = new Float64Array(nx);
    for (let i = 0; i < nx; i++) {
      const x = (i + 0.5) * dx;
      xc[i] = x;
      base[i] = p.z0 + (p.dipPct / 100) * x - p.foldAmp * Math.sin(2 * Math.PI * p.foldCount * x / p.L);
    }

    // lift = how far above the lower caprock this layer's top sits; the fault plane shifts by dipSlope·lift
    const buildLayer = (H, lift) => {
      const zt = base.map(z => z - lift);
      const mult = new Float64Array(nx + 1).fill(1);
      const faultFaces = p.faults.map(f => {
        const face = clamp(Math.round((f.xFrac * p.L - f.dipSlope * lift) / dx), 1, nx - 1);
        for (let i = face; i < nx; i++) zt[i] += f.throw_m;
        const jux = Math.max(0, H - Math.abs(f.throw_m)) / H;
        mult[face] *= f.sealed ? 0 : jux * f.Trock;
        return face;
      });
      const traps = findTraps(zt, mult).map(t => {
        let cap = 0;
        for (let i = t.lo; i <= t.hi; i++) cap += Math.min(H, t.spill - zt[i]);
        return { ...t, capacity: cap * p.phi * (1 - p.Swr) * dx * p.W * rhoG };
      }).filter(t => t.capacity > 0);
      return { H, zt, mult, faultFaces, traps };
    };
    const layers = [buildLayer(p.H, 0), buildLayer(p.H2, p.C + p.H2)];

    const faults = p.faults.map((f, fi) => ({
      ...f,
      lowerFace: layers[0].faultFaces[fi],
      upperFace: layers[1].faultFaces[fi],
      hth: f.Pth_kPa * KPA / (p.dRho * G),
      cond: f.sealed ? 0 : f.kf_mD * MD * p.krgStar / muG
    }));
    const Qkg = p.Q_Mtpa * MT / YEAR;

    const model = {
      p, nx, dx, xc, rhoG, muG, muW, k, layers, faults,
      lamG: p.krgStar / muG, lamW: 1 / muW,
      kdg: k * p.dRho * G,
      well: clamp(Math.floor(p.wellFrac * nx), 0, nx - 1),
      Qkg, q: Qkg / (rhoG * p.W),
      tInjEnd: p.injYears * YEAR,
      Fd: p.dissMult * ALPHA_D * k * DRHO_S * G * C_S / muW,
      hc: p.Pe_kPa * KPA / (p.dRho * G),
      a: p.phi * (1 - p.Swr), r: p.phi * p.Sgr, b: p.phi * (1 - p.Swr - p.Sgr)
    };
    // Purely geometric: column transmissivities are always > 0, so only zero-multiplier faces can seal the well in
    model.injectionBlocked = splitInjection(model, new Float64Array(nx)) === null;
    return model;
  }

  // ---------------------------------------------------------------- state

  function initState(m) {
    const mk = () => new Float64Array(m.nx);
    return {
      t: 0, injected: 0, exited: 0, leakedCum: 0, substepsLastYear: 0, flags: {},
      layers: [0, 1].map(() => ({ V: mk(), hmax: mk(), D: mk() }))
    };
  }

  function cloneState(s) {
    return {
      ...s, flags: { ...s.flags },
      layers: s.layers.map(L => ({ V: Float64Array.from(L.V), hmax: Float64Array.from(L.hmax), D: Float64Array.from(L.D) }))
    };
  }

  // V = φ[(1−Swr)h + Sgr(hmax−h)] → h (writes h, may update hmax). Returns true if a column overflowed H.
  function invert(m, H, V, hmax, h) {
    const { a, r, b } = m;
    let overflow = false;
    for (let i = 0; i < V.length; i++) {
      const v = V[i];
      if (v <= 0) { h[i] = 0; hmax[i] = 0; continue; }
      if (v >= a * hmax[i]) { h[i] = v / a; hmax[i] = h[i]; }
      else {
        const hi = (v - r * hmax[i]) / b;
        if (hi >= 0) h[i] = hi;
        else { h[i] = 0; hmax[i] = r > 0 ? v / r : 0; }
      }
      if (h[i] > H) { h[i] = H; hmax[i] = Math.min(hmax[i], H); overflow = true; }
    }
    return overflow;
  }

  // ---------------------------------------------------------------- fluxes

  // Face fluxes of CO2 per unit slab width (m²/s). Face f sits between cells f-1 and f; faces 0 and nx
  // are the open lateral boundaries (ghost cell: same h, linearly extrapolated zt, no CO2 inflow).
  // Returns wave-speed and diffusivity bounds for the time-step limiter.
  function fluxes(m, L, h, U, F) {
    const { nx, dx, lamG, lamW, kdg, b } = m, H = L.H, zt = L.zt, mult = L.mult;
    const lmax = Math.max(lamG, lamW), fpmax = lmax / (H * Math.min(lamG, lamW));
    let c = 0, d = 0;
    for (let f = 0; f <= nx; f++) {
      const hL = f > 0 ? h[f - 1] : h[0];
      const hR = f < nx ? h[f] : h[nx - 1];
      const zL = f > 0 ? zt[f - 1] : 2 * zt[0] - zt[1];
      const zR = f < nx ? zt[f] : 2 * zt[nx - 1] - zt[nx - 2];
      const dPhi = (zL + hL) - (zR + hR);          // > 0: CO2 moves left → right
      let grav = 0, cf = 0;
      if (mult[f] > 0 && dPhi !== 0) {
        // counter-current upwinding (Brenier & Jaffré 1991): CO2 mobility from its upstream side,
        // brine mobility from the opposite side
        const hg = dPhi > 0 ? hL : hR, hw = dPhi > 0 ? hR : hL;
        const mg = lamG * hg, mw = lamW * (H - hw);
        const gm = mg + mw > 0 ? mg * mw / (mg + mw) : 0;
        grav = gm * kdg * mult[f] * dPhi / dx;
        d = Math.max(d, gm * kdg * mult[f] / b);
        cf += lmax * kdg * mult[f] * Math.abs(dPhi) / dx;
      }
      let visc = 0;
      const u = U[f];
      if (u !== 0) {
        const hu = u > 0 ? hL : hR, mg = lamG * hu, mw = lamW * (H - hu);
        visc = mg / (mg + mw) * u;
        cf += Math.abs(u) * fpmax;
      }
      let flux = visc + grav;
      if (f === 0 && flux > 0) flux = 0;
      if (f === nx && flux < 0) flux = 0;
      F[f] = flux;
      if (cf > c) c = cf;
    }
    return { c, d };
  }

  // Split of the injection rate between left and right by column flow resistance (open hydrostatic ends).
  // ponytail: net buoyancy-driven total flux ignored; full 1D pressure solve is the upgrade.
  function splitInjection(m, h) {
    const { nx, dx, k, lamG, lamW, well } = m, L = m.layers[0], H = L.H;
    const tau = i => k * (lamG * h[i] + lamW * (H - h[i]));
    const side = (f0, f1) => {
      let R = 0;
      for (let f = f0; f <= f1; f++) {
        if (L.mult[f] === 0) return Infinity;
        const t1 = tau(f - 1), t2 = tau(f);
        R += dx * (t1 + t2) / (2 * t1 * t2) / L.mult[f];
      }
      return R;
    };
    const RL = side(1, well), RR = side(well + 1, nx - 1);
    if (RL === Infinity && RR === Infinity) return null;
    if (RL === Infinity) return { L: 0, R: 1 };
    if (RR === Infinity) return { L: 1, R: 0 };
    return RL + RR > 0 ? { L: RR / (RL + RR), R: RL / (RL + RR) } : { L: 0.5, R: 0.5 };
  }

  // ---------------------------------------------------------------- time stepping

  function advance(m, s0, years, opts) {
    const s = cloneState(s0);
    const { nx, dx, p, a, b, rhoG } = m;
    const onSubstep = opts && opts.onSubstep;
    const h = [new Float64Array(nx), new Float64Array(nx)];
    const F = [new Float64Array(nx + 1), new Float64Array(nx + 1)];
    const R = [new Float64Array(nx), new Float64Array(nx)];     // dV/dt from fluxes, sources, leakage (m/s)
    const O = [new Float64Array(nx), new Float64Array(nx)];     // outgoing volume rate, fluxes + leakage (m/s)
    const U = new Float64Array(nx + 1), U0 = new Float64Array(nx + 1);
    const leakIn = new Float64Array(nx);                         // leak inflow per upper-layer cell (m/s)
    const Dcap = m.layers.map(L => p.phi * L.H * C_S);
    const dtMin = YEAR / MAX_SUB;
    s.flags = {};
    for (let l = 0; l < 2; l++) invert(m, m.layers[l].H, s.layers[l].V, s.layers[l].hmax, h[l]);

    let tSec = s0.t * YEAR, steps = 0;
    const tEnd = tSec + years * YEAR;
    while (tEnd - tSec > 1e-3) {
      const injecting = m.Qkg > 0 && tSec < m.tInjEnd - 1e-3;
      let split = null;
      U.fill(0);
      if (injecting) {
        split = splitInjection(m, h[0]);
        if (!split) s.flags.injectionBlocked = true;
        else {
          for (let f = 0; f <= m.well; f++) U[f] = -m.q * split.L;
          for (let f = m.well + 1; f <= nx; f++) U[f] = m.q * split.R;
        }
      }

      let c = 0, d = 0;
      for (let l = 0; l < 2; l++) {
        const st = fluxes(m, m.layers[l], h[l], l === 0 ? U : U0, F[l]);
        c = Math.max(c, st.c); d = Math.max(d, st.d);
        const Fl = F[l], Rl = R[l], Ol = O[l];
        for (let i = 0; i < nx; i++) {
          Rl[i] = (Fl[i] - Fl[i + 1]) / dx;
          Ol[i] = (Fl[i] < 0 ? -Fl[i] : 0) / dx + (Fl[i + 1] > 0 ? Fl[i + 1] : 0) / dx;
        }
      }
      if (split) R[0][m.well] += m.q / dx;

      // up-fault leakage from the lower layer into the upper layer
      let leakVolRate = 0;                                       // m²/s per unit slab width
      const pg = p.dRho * G;
      const leaks = [];
      leakIn.fill(0);
      for (const f of m.faults) {
        if (f.cond === 0) continue;
        for (let side = 0; side < 2; side++) {
          const i = f.lowerFace - 1 + side, hi = h[0][i];
          if (hi <= f.hth) continue;
          const v = f.cond * ((pg * hi - f.Pth_kPa * KPA) / p.C + pg);
          const rate = v * WF / dx;
          const j = clamp(f.upperFace - 1 + side, 0, nx - 1);
          R[0][i] -= rate; O[0][i] += rate; R[1][j] += rate; leakIn[j] += rate;
          leakVolRate += v * WF;
          leaks.push({ i, j, rate });
        }
      }

      // adaptive dt
      let dtEvent = tEnd - tSec;                                 // next event: end of interval or injection stop
      if (injecting) dtEvent = Math.min(dtEvent, m.tInjEnd - tSec);
      let dt = dtEvent;
      if (c > 0) dt = Math.min(dt, 0.5 * b * dx / c);
      if (d > 0) dt = Math.min(dt, 0.45 * dx * dx / d);
      for (let l = 0; l < 2; l++) {
        const cap = a * m.layers[l].H, V = s.layers[l].V;
        for (let i = 0; i < nx; i++) {
          if (O[l][i] > 0) dt = Math.min(dt, 0.5 * b * h[l][i] / O[l][i]);
          // leak inflow is trimmed to capacity below, so only lateral/source inflow limits dt here
          const inflow = l === 1 ? R[1][i] - leakIn[i] : R[0][i];
          if (inflow > 0 && V[i] < cap) dt = Math.min(dt, 0.9 * (cap - V[i]) / inflow);
        }
      }
      // Hard cap: every substep advances ≥ min(dtMin, next event) → at most MAX_SUB (+ events) substeps per year
      const dtFloor = Math.min(dtMin, dtEvent);
      if (dt < dtFloor) { dt = dtFloor; s.flags.dtFloor = true; }

      // A full receiving column takes no more: CO2 that would overfill it stays in the lower cell
      const cap1 = a * m.layers[1].H, V1 = s.layers[1].V;
      for (const lk of leaks) {
        const excess = V1[lk.j] + R[1][lk.j] * dt - cap1;
        if (excess <= 0) continue;
        const cut = Math.min(lk.rate, excess / dt);
        R[1][lk.j] -= cut; R[0][lk.i] += cut;
        leakVolRate -= cut * dx;
      }

      // apply
      for (let l = 0; l < 2; l++) {
        const S = s.layers[l], Rl = R[l], hl = h[l];
        for (let i = 0; i < nx; i++) {
          S.V[i] += Rl[i] * dt;
          if (m.Fd > 0 && hl[i] > 0) {
            // capped at half the removable volume: fluxes take ≤ ½·b·h (dt limit) + this ≤ ½·b·h → V stays ≥ 0
            const dm = Math.min(m.Fd * dt, Dcap[l] - S.D[i], 0.5 * b * hl[i] * rhoG);
            if (dm > 0) { S.D[i] += dm; S.V[i] -= dm / rhoG; }
          }
        }
        s.exited += (Math.max(0, -F[l][0]) + Math.max(0, F[l][nx])) * dt * p.W * rhoG;
      }
      if (split) s.injected += m.Qkg * dt;
      s.leakedCum += leakVolRate * dt * p.W * rhoG;
      tSec += dt; steps++;
      for (let l = 0; l < 2; l++) {
        if (invert(m, m.layers[l].H, s.layers[l].V, s.layers[l].hmax, h[l])) s.flags.overflow = true;
      }
      if (onSubstep) onSubstep(s, dt, h);
    }
    s.t = s0.t + years;
    s.substepsLastYear = years > 0 ? steps / years : 0;
    return s;
  }

  // ---------------------------------------------------------------- diagnostics

  function diagnose(m, s) {
    const { nx, dx, p, a, rhoG } = m, cell = dx * p.W;
    let stored = 0;
    const layers = m.layers.map((L, l) => {
      const S = s.layers[l], h = new Float64Array(nx), hmax = Float64Array.from(S.hmax);
      invert(m, L.H, S.V, hmax, h);
      let vol = 0, mob = 0, dis = 0;
      for (let i = 0; i < nx; i++) { vol += S.V[i]; mob += a * h[i]; dis += S.D[i]; }
      const total = vol * cell * rhoG, mobile = mob * cell * rhoG, dissolved = dis * cell;
      const traps = L.traps.map(t => {
        let st = 0;
        for (let i = t.lo; i <= t.hi; i++) st += Math.min(h[i], t.spill - L.zt[i], L.H);
        st *= a * cell * rhoG;
        return { ...t, structural: st, fill: st / t.capacity };
      });
      const structural = traps.reduce((acc, t) => acc + t.structural, 0);
      stored += total + dissolved;
      return { structural, migrating: Math.max(0, mobile - structural), residual: total - mobile, dissolved, total: total + dissolved, h, hmax, traps };
    });
    return {
      layers, injected: s.injected, exited: s.exited, leakedCum: s.leakedCum,
      balanceError: (s.injected - stored - s.exited) / Math.max(s.injected, 1),
      flags: { ...s.flags }
    };
  }

  // Depth of the free-water level below the caprock for sharp-interface thickness h, volume-preserving
  // Brooks–Corey (λ = 2) capillary fringe: ∫Sg = (1−Swr)·h  ⇒  (h' − hc)²/h' = h.
  function fringeBase(m, h) {
    if (!m.p.fringeOn || h <= 0) return h;
    const hc = m.hc;
    return ((2 * hc + h) + Math.sqrt(h * h + 4 * hc * h)) / 2;
  }

  // Saturation profile Sg(z), z measured down from the caprock, for rendering. Same CO2 volume as the
  // sharp-interface column. ponytail: fringe is display-only; flow uses the sharp interface.
  function columnProfile(m, s, l, i, n) {
    n = n || 50;
    const L = m.layers[l], S = s.layers[l], p = m.p;
    const h1 = new Float64Array(1), hm = Float64Array.of(S.hmax[i]);
    invert(m, L.H, S.V.subarray(i, i + 1), hm, h1);
    const h = h1[0], hf = fringeBase(m, h), resBot = hf + (hm[0] - h);
    const zMax = Math.min(L.H, Math.max(hf, resBot));
    const out = [];
    for (let k = 0; k <= n; k++) {
      const z = zMax * k / n;
      let Sg = 0;
      if (z < hf) {
        if (!p.fringeOn) Sg = 1 - p.Swr;
        else { const y = hf - z; Sg = y > m.hc ? (1 - p.Swr) * (1 - (m.hc / y) ** 2) : 0; }
      } else if (z < resBot) Sg = p.Sgr;
      out.push({ z, Sg });
    }
    return out;
  }

  const VE = {
    createModel, initState, cloneState, advance, diagnose, columnProfile, fringeBase, withDefaults, findTraps,
    DEFAULT_PARAMS, PRESETS, FAULT_TEMPLATES: deepFreeze([FAULT_A, FAULT_B, FAULT_C]),
    units: { G, MD, CP, KPA, YEAR, MT }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = VE;
  else (typeof window !== 'undefined' ? window : globalThis).VE = VE;
})();

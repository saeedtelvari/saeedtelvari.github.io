# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage, the CV page and the shared styles in the simulator's Earth night family. The hero runs a conservative, correctly labelled VE model. The content gets the corrections and additions the user approved.

**Architecture:**
- The site stays a Babel-precompiled React app. `build.js` concatenates the files into one shared script scope.
- The hero physics moves into `hero-geology.js` as pure functions (`section`, `simulate`, helpers). The worker, the in-page fallback and Node tests all call these.
- Publication and CV data move to `site-content.js`, read by both the homepage and the new `cv.html` entry.
- Earth tokens are defined on `:root` under the simulator's `--sim-*` names, so the shared header renders correctly on all three pages.

**Tech Stack:** React 18 UMD (unpkg), Babel standalone (build only), plain CSS, Node 24 `node:test`, puppeteer-core with the system Chrome for QA.

**Spec:** [docs/superpowers/specs/2026-10-13-homepage-redesign-design.md](../specs/2026-10-13-homepage-redesign-design.md). The audit is [2026-10-13-homepage-audit.md](../specs/2026-10-13-homepage-audit.md).

## Global Constraints

- Run every git call as `git -c safe.directory=D:/saeedtelvari.github.io …` from `D:\saeedtelvari.github.io\.worktrees\homepage`. Commit on `redesign/homepage` only. No push, no PR, no merge.
- Commit messages carry no Claude attribution: no `Co-Authored-By`, no "Generated with".
- `index.html`, `GuidePage.jsx` and other CRLF files are edited with the Edit tool, never MSYS `sed -i`.
- `node build.js` regenerates `bundle.js` and `simulator-bundle.js`. Top-level names must be unique across all built files (prefix new ones with `SITE_`, `HERO_` or `Hero`).
- Asset versions:
  - `index.html`, `cv.html` and `simulator.html` load the same `bundle.js?v=` and `colors_and_type.css?v=` (start at `41`).
  - `simulator-bundle.js` goes to `v=24` when `SimulatorPage.jsx` changes.
  - Bump all of these whenever the file changes.
- Copy rules:
  - Sentence case.
  - "PhD".
  - Never call the IGE seminar "invited".
  - Both awards are "runner-up".
  - No "100–400×".
  - The SPE DOI is `10.2118/231836-PA`.
- Colour rules:
  - Chrome uses only `--sim-ink*`, `--sim-surface*`, `--sim-rule*` and `--sim-accent*`.
  - CO₂ data uses `--sim-c-*` and `--sim-glow-*`.
  - These must not appear in homepage, CV or shared files: `#64ffda`, `#4ecdc4`, `#0dfca2`, `#7ee8e2`, `#a8edea`, `#20c997`, `#1a8e8f`, `#211d34`, `#1c2645`, `#1d416e`, `#2b2336`, `#c4b5fd`, `rgba(100,255,218`, `rgba(78,205,196`, `rgba(13,252,162`.
- Tests: `node --test tests/*.test.js` and `node tests/site-smoke.js` must pass at every commit after Task 1 (run `node build.js` first).

## Review Focus

1. **Reduced motion.** A visitor with `prefers-reduced-motion: reduce` should see a still hero at year 400 with a working play button: no autoplay, no rain, no drifting clouds. *Test:* in Task 5, `heroInitialPlayback(true)` returns `{ year: 400, playing: false }`.
2. **Old links.** `index.html#about`, `#cv`, `#simulator` and `#research` must still land somewhere sensible: research, `cv.html`, the simulator, research. *Test:* in Task 4, the `siteLegacyTarget` table test.
3. **Hero off-screen or tab hidden.** A visitor who scrolls away or switches tabs must not keep paying CPU. *Test:* in Task 5, `heroShouldTick({ playing, visible, hidden })` is false unless playing, visible and not hidden.
4. **Narrow phones (320 px).** The hero's labels, player and actions must not overflow or overlap. Checked in Task 10 at 320×640 as well as 390×844, with `document.documentElement.scrollWidth <= innerWidth`.
5. **Clipboard blocked** (insecure context or denied permission). "Copy BibTeX" and the email copy button must say the copy failed instead of claiming "Copied". *Test:* in Task 6, `siteCopy` returns `false` when `clipboard.writeText` rejects or is missing.

---

### Task 1: Conservative hero VE model in `hero-geology.js`

**Files:**
- Modify: `hero-geology.js` (add `randomGeology`, `section`, `simulate`, `frameOf`, `mobileThickness`, `storedVolume`, generalised `balanceFaultContact`, depth, playback and exaggeration helpers)
- Modify: `hero-simulation-worker.js` (thin wrapper, transfers buffers)
- Create: `tests/hero-model.test.js`
- Modify: `tests/hero-geology.test.js`. Keep tests 1 and 2. Rewrite test 3 against the new API: the ×1.5 "height scale" and `getColumnPath` are gone on purpose.

**Interfaces:**
- Produces:
  - `HeroGeology.randomGeology(random = Math.random)` returns a geology object with the same fields as today's `generateRandomGeology`.
  - `HeroGeology.section(g)` returns `{ layers: [storage, overlying], faultCells: [[kStorage, kOverlying], …], wellCell, wellBottom }`. Each layer has `depth, roofL, roofR, floorL, floorR, cap` (`Float64Array(201)`, SVG units except `cap` in solver units) and `faultTop` / `faultBottom` (`Uint8Array(201)`).
  - `HeroGeology.simulate(g, { years = 2000, injectionYears = 30, injectedVolume = 260 })` returns `{ years, injectionYears, nodes: 201, faults, S: [F32, F32], h: [F32, F32], hMax: [F32, F32], faultFlow: F32, inventory: F64, lost }`.
  - `HeroGeology.frameOf(run, year)` returns `{ S, h, hMax, S2, h2, h2Max, faultFlow, inventory: { mobile, residual, leaked, injected } }`. These are subarray views.
  - `HeroGeology.mobileThickness(S, hMax, R)` and `HeroGeology.storedVolume(h, hMax, R)`.
  - `HeroGeology.depthToY(metres)`, `HeroGeology.depthTicks()` (`[1000, 1500, 2000]`), `HeroGeology.HERO_DEPTH` (`{ breakY: 28, breakDepth: 800, metresPerUnit: 3, sectionWidth: 10000 }`).
  - `HeroGeology.exaggeration(widthPx, heightPx)` returns an integer ≥ 1.
  - `HeroGeology.yearsPerSecond(year, injectionYears = 30)` returns 8 to 60.

- [ ] **Step 1: Write the failing model tests** in `tests/hero-model.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const G = require('../hero-geology.js');

const rng = seed => () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);

test('mobile thickness inverts stored volume and respects hysteresis', () => {
  for (const [h, hMax, R] of [[0, 0, .3], [2, 2, .3], [1, 4, .25], [0, 4, .31], [3.5, 3, .3]]) {
    const S = G.storedVolume(h, hMax, R);
    assert.ok(Math.abs(G.mobileThickness(S, Math.max(hMax, S), R) - h) < 1e-12);
  }
  assert.equal(G.mobileThickness(5, 5, .3), 5, 'a freshly drained column is all mobile');
  assert.equal(G.mobileThickness(.3 * 4, 4, .3), 0, 'pure residual has no mobile CO2');
});

test('injected CO2 is conserved and no column overfills, across 100 random geologies', () => {
  const random = rng(7);
  for (let n = 0; n < 100; n++) {
    const g = G.randomGeology(random);
    const run = G.simulate(g, { years: 90 });
    assert.equal(run.lost, 0, 'every injected volume found room');
    const sec = G.section(g);
    for (let y = 0; y <= run.years; y++) {
      const f = G.frameOf(run, y);
      const { mobile, residual, leaked, injected } = f.inventory;
      assert.ok(Math.abs(mobile + residual + leaked - injected) <= 1e-9 * Math.max(1, injected), `balance at year ${y}`);
      for (const [S, h, hMax, cap] of [[f.S, f.h, f.hMax, sec.layers[0].cap], [f.S2, f.h2, f.h2Max, sec.layers[1].cap]]) {
        for (let i = 0; i < 201; i++) {
          assert.ok(S[i] >= -1e-6 && S[i] <= cap[i] + 1e-4, 'within capacity');
          assert.ok(h[i] >= -1e-6 && h[i] <= S[i] + 1e-4 && S[i] <= hMax[i] + 1e-4, 'mobile <= stored <= swept');
        }
      }
    }
    assert.ok(G.frameOf(run, 30).inventory.injected > 0 && Math.abs(G.frameOf(run, 31).inventory.injected - G.frameOf(run, 30).inventory.injected) < 1e-12,
      'injection stops at year 30');
  }
});

test('a fault leaks only once its mobile column exceeds the entry height', () => {
  const g = G.randomGeology(rng(11));
  const run = G.simulate(g, { years: 400 });
  const sec = G.section(g);
  let leaked = false;
  for (let y = 1; y <= run.years; y++) {
    const before = G.frameOf(run, y - 1), now = G.frameOf(run, y);
    g.faults.forEach((fault, i) => {
      const flow = now.faultFlow[i];
      assert.ok(flow >= 0 && flow <= fault.leakRate + 1e-9, 'bounded by the leak rate');
      if (flow > 0) {
        leaked = true;
        const k = sec.faultCells[i][0];
        // Leakage can drain the column back below the entry height within the year; the swept depth remembers it.
        assert.ok(now.hMax[k] > fault.thresholdHeight, 'column reached the entry height');
      }
    });
  }
  assert.equal(G.frameOf(run, 0).faultFlow.every(v => v === 0), true);
  assert.ok(leaked || G.frameOf(run, run.years).inventory.leaked === 0);
});

test('worker and in-page fallback produce identical frames', () => {
  const g = G.randomGeology(rng(3));
  let posted, transfers;
  const self = { postMessage: (data, list) => { posted = data; transfers = list; } };
  new Function('self', 'importScripts', 'HeroGeology', fs.readFileSync(require.resolve('../hero-simulation-worker.js'), 'utf8'))(self, () => {}, G);
  self.onmessage({ data: { geology: g, options: { years: 60 } } });
  const direct = G.simulate(g, { years: 60 });
  assert.deepEqual([...posted.h[0]], [...direct.h[0]]);
  assert.deepEqual([...posted.inventory], [...direct.inventory]);
  assert.ok(transfers.length >= 7, 'typed arrays are transferred, not cloned');
});

test('depth axis is linear below its break and exaggeration follows the rendered size', () => {
  const ticks = G.depthTicks();
  assert.deepEqual(ticks, [1000, 1500, 2000]);
  const ys = ticks.map(G.depthToY);
  assert.ok(Math.abs((ys[1] - ys[0]) - (ys[2] - ys[1])) < 1e-9);
  assert.ok(ys.every(y => y > G.HERO_DEPTH.breakY && y < 580));
  assert.equal(G.exaggeration(1440, 420), 2);
  assert.equal(G.exaggeration(390, 414), 6);
});

test('playback is slow during injection and fast during migration', () => {
  assert.equal(G.yearsPerSecond(0), 8);
  assert.equal(G.yearsPerSecond(29), 8);
  assert.equal(G.yearsPerSecond(100), 60);
  for (let y = 0; y < 60; y++) assert.ok(G.yearsPerSecond(y + 1) >= G.yearsPerSecond(y));
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `node --test tests/hero-model.test.js`
Expected: FAIL. `G.storedVolume is not a function`, `G.randomGeology is not a function`.

- [ ] **Step 3: Implement the model in `hero-geology.js`**

`randomGeology(random)` is today's `generateRandomGeology` and `generateRandomizedFaults` with every `Math.random()` replaced by `random()`. Then add:

```js
  const HERO_NODES = 201, HERO_DX = 5, HERO_UNIT = 15, HERO_YEAR = 0.2;
  const HERO_WEIGHTS = [0.15, 0.25, 0.4, 0.25, 0.15];
  const HERO_DEPTH = { breakY: 28, breakDepth: 800, metresPerUnit: 3, sectionWidth: 10000 };

  const mobileThickness = (S, hMax, R) => S >= hMax ? S : Math.max(0, Math.min(S, (S - R * hMax) / (1 - R)));
  const storedVolume = (h, hMax, R) => h >= hMax ? h : h + R * (hMax - h);

  // A permeable fault shares one gas-water level across its two adjacent columns. Residual CO2 stays put.
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
      const cap = Float64Array.from(roofR, (roof, k) => Math.max(0, (floorR[k] - roof) / HERO_UNIT));
      const faultTop = Uint8Array.from(roofR, (roof, k) => k > 0 && k < HERO_NODES - 1 && Math.abs(roofL[k] - roof) > 0.1 ? 1 : 0);
      const faultBottom = Uint8Array.from(faultTop, (f, k) => f || (k > 0 && k < HERO_NODES - 1 && Math.abs(floorL[k] - floorR[k]) > 0.1) ? 1 : 0);
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

  const simulate = (g, { years = 2000, injectionYears = 30, injectedVolume = 260 } = {}) => {
    const n = HERO_NODES, R = g.R, K = g.K, nF = g.faults.length;
    const sec = section(g);
    const L = sec.layers.map(l => ({ ...l, S: new Float64Array(n), hMax: new Float64Array(n),
      roof: Float64Array.from(l.roofR, r => r / HERO_UNIT), h: new Float64Array(n), move: new Float64Array(n - 1) }));
    const out = { years, injectionYears, nodes: n, faults: nF, lost: 0,
      S: [0, 1].map(() => new Float32Array((years + 1) * n)), h: [0, 1].map(() => new Float32Array((years + 1) * n)),
      hMax: [0, 1].map(() => new Float32Array((years + 1) * n)),
      faultFlow: new Float32Array((years + 1) * nF), inventory: new Float64Array((years + 1) * 4) };
    let injected = 0;
    const settle = l => { for (let i = 0; i < n; i++) if (l.S[i] > l.hMax[i]) l.hMax[i] = l.S[i]; };
    // Place `amount` at `center`, spilling into the nearest columns with room; returns what did not fit.
    const deposit = (l, center, amount) => {
      for (let d = 0; amount > 0 && d < n; d++) for (const i of d ? [center - d, center + d] : [center]) {
        if (i < 0 || i >= n || amount <= 0) continue;
        const a = Math.min(Math.max(0, l.cap[i] - l.S[i]), amount);
        l.S[i] += a; amount -= a;
      }
      return Math.max(0, amount);
    };
    // Explicit fluxes from the start-of-step state; transfers are limited by what the donor can
    // release (mobile CO2 above its residual) and the receiver can hold, so every move is conservative.
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
        if (move[i] > 0) shift(i, i + 1, move[i]); else if (move[i] < 0) shift(i + 1, i, -move[i]);
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
        const dt = Math.min(HERO_YEAR - t, 0.02, 0.45 / (K * peak + 1e-9));
        L.forEach(l => transport(l, dt, sweep % 2 === 1));
        sec.faultCells.forEach(cells => L.forEach((l, j) => {
          const k = cells[j];
          if (k > 0 && k < n) balanceFaultContact(l.S, k - 1, k, l.roofL[k] / HERO_UNIT, l.roofR[k] / HERO_UNIT, l.cap[k - 1], l.cap[k], l.hMax, R);
        }));
        L.forEach(settle);
        g.faults.forEach((fault, i) => {
          const [k, up] = sec.faultCells[i];
          const h = mobileThickness(L[0].S[k], L[0].hMax[k], R);
          if (h <= fault.thresholdHeight) return;
          const want = Math.min((h - fault.thresholdHeight) * (1 - R), fault.leakRate * dt);
          const moved = want - deposit(L[1], up, want);
          L[0].S[k] -= moved;
          flow[i] += moved;
        });
        if (y <= injectionYears) HERO_WEIGHTS.forEach((w, j) => {
          const amount = rate * dt * w / 1.2;
          const rest = deposit(L[0], sec.wellCell + j - 2, amount);
          injected += amount - rest; out.lost += rest;
        });
        L.forEach(settle);
        t += dt; sweep++;
      }
      out.faultFlow.set(Array.from(flow, v => v / HERO_YEAR), y * nF);
      record(y);
    }
    return out;
  };

  const frameOf = (run, year) => {
    const y = Math.max(0, Math.min(run.years, Math.round(year))), a = y * run.nodes, b = a + run.nodes;
    const [mobile, residual, leaked, injected] = run.inventory.subarray(y * 4, y * 4 + 4);
    return { S: run.S[0].subarray(a, b), h: run.h[0].subarray(a, b), hMax: run.hMax[0].subarray(a, b),
      S2: run.S[1].subarray(a, b), h2: run.h[1].subarray(a, b), h2Max: run.hMax[1].subarray(a, b),
      faultFlow: run.faultFlow.subarray(y * run.faults, (y + 1) * run.faults), inventory: { mobile, residual, leaked, injected } };
  };

  const depthToY = metres => HERO_DEPTH.breakY + (metres - HERO_DEPTH.breakDepth) / HERO_DEPTH.metresPerUnit;
  const depthTicks = () => [1000, 1500, 2000];
  const exaggeration = (widthPx, heightPx) =>
    Math.max(1, Math.round((HERO_DEPTH.sectionWidth / widthPx) / (HERO_DEPTH.metresPerUnit * 580 / heightPx)));
  const yearsPerSecond = (year, injectionYears = 30) => {
    const t = Math.max(0, Math.min(1, (year - injectionYears) / 10));
    return 8 + 52 * t * t * (3 - 2 * t);
  };
```

Export all of them from the IIFE's return object.

- [ ] **Step 4: Replace the worker body**

```js
importScripts('./hero-geology.js?v=3');
self.onmessage = ({ data }) => {
  const run = HeroGeology.simulate(data.geology, data.options || {});
  const buffers = [...run.S, ...run.h, ...run.hMax, run.faultFlow, run.inventory].map(a => a.buffer);
  self.postMessage(run, buffers);
};
```

- [ ] **Step 5: Rewrite test 3 in `tests/hero-geology.test.js`** as "varied hero layers stay ordered and the well ends inside the storage aquifer". Keep every geometric assertion (surface at 0, bottom at 580, ordered beds, lateral variation over 30 units, every bed varies by more than 2). Draw geologies from `HeroGeology.randomGeology(seeded)`. Replace the `getColumnPath` check with `section(g).wellBottom` lying between the roof and the floor at `g.wellX`. Delete the solver half: `tests/hero-model.test.js` now covers it.

- [ ] **Step 6: Run the tests**

Run: `node --test tests/hero-model.test.js tests/hero-geology.test.js`
Expected: PASS. If the conservation test fails, print `mobile+residual+leaked−injected` per year to find the first step that leaks mass before changing tolerances.

- [ ] **Step 7: Commit**

```bash
git add hero-geology.js hero-simulation-worker.js tests/hero-model.test.js tests/hero-geology.test.js
git commit -m "feat(hero): conservative VE model with hysteresis-aware faults, 30-year injection and inventory"
```

### Task 2: Shared site content and the content-facts test

**Files:**
- Create: `site-content.js`. It holds plain data, defines globals in the bundle, and has a CommonJS export for tests.
- Create: `tests/site-content.test.js`
- Modify: `build.js` (add `'site-content.js'` after `'Primitives.jsx'`)

**Interfaces:**
- Produces globals:
  - `SITE_LINKS`: `{ email, scholar, orcid, orcidId, github, githubUser, linkedin, linkedinUser }`.
  - `SITE_PUBLICATIONS`: an array of `{ id, year, title, authors: string[], venue, status, doi, url, summary, bibtex }`, newest first.
  - `SITE_ACTIVITY`: an array of `{ month: 'YYYY-MM', date, title, body }`, newest first.
  - `SITE_PROJECTS`.
  - `SITE_CV`: `{ interests, education, experience, presentations, teaching, service, training, skills, recognition }`.

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const content = require('../site-content.js');
const root = path.resolve(__dirname, '..');

test('publication facts are correct and shared by the homepage and CV', () => {
  const pubs = content.SITE_PUBLICATIONS;
  assert.equal(pubs.length, 4);
  for (const p of pubs) {
    assert.match(p.doi, /^10\.\d{4,9}\/\S+$/);
    assert.equal(p.url, `https://doi.org/${p.doi}`);
    assert.ok(p.bibtex.includes(`doi={${p.doi}}`), `${p.id} BibTeX carries its DOI`);
    assert.ok(p.authors.includes('Telvari, S.'));
  }
  const spe = pubs.find(p => /Permeability Upscaling/.test(p.title));
  assert.equal(spe.doi, '10.2118/231836-PA');
  assert.equal(spe.title, 'Accelerated Permeability Upscaling: A Convolutional Neural Network Approach');
  assert.match(pubs[0].status, /under review/i);
  assert.deepEqual(pubs.map(p => p.year), [...pubs.map(p => p.year)].sort((a, b) => b - a));
  for (const file of ['HomeSections.jsx', 'CVPage.jsx']) assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /SITE_PUBLICATIONS/);
});

test('wording rules the user set on 2026-10-13', () => {
  const text = JSON.stringify(content);
  assert.doesNotMatch(text, /100.400/, 'no 100–400x claim');
  assert.doesNotMatch(text, /invited/i, 'the IGE seminar is not called invited');
  assert.doesNotMatch(text, /Ph\.D\./, 'PhD without dots');
  assert.match(text, /Runner-up, SPE Aberdeen Section Student Bursary/);
  assert.match(text, /Team runner-up, EAGE/);
  const months = content.SITE_ACTIVITY.map(a => a.month);
  assert.deepEqual(months, [...months].sort().reverse(), 'activity is newest first');
});
```

- [ ] **Step 2: Run it and confirm it fails.** `node --test tests/site-content.test.js` fails with "Cannot find module '../site-content.js'".
- [ ] **Step 3: Write `site-content.js`** with the exact copy from the spec:
  - Research themes, Projects and Publications summaries.
  - The activity table: eight entries, newest first.
  - CV sections 1–10.
  - BibTeX for all four entries, each with a `doi={…}` field. The SPE entry uses `doi={10.2118/231836-PA}`.

  End the file with `if (typeof module !== 'undefined' && module.exports) module.exports = { SITE_LINKS, SITE_PUBLICATIONS, SITE_ACTIVITY, SITE_PROJECTS, SITE_CV };`.
- [ ] **Step 4: Add `site-content.js` to `build.js`**, run `node build.js`, then `node --test tests/site-content.test.js`. The two `SITE_PUBLICATIONS` file assertions stay red until Tasks 6 and 7. Mark them `{ todo: 'Tasks 6–7' }` now and remove the flag in Task 7.
- [ ] **Step 5: Commit.** Message: `feat(content): one source for publications, activity, projects and CV`.

### Task 3: Earth tokens, base styles and icons

**Files:**
- Rewrite: `colors_and_type.css`. This task covers the tokens, base, buttons and sheets; later tasks append their section blocks.
- Modify: `Primitives.jsx`. Remove `GlassCard`, `GlassButton`, `Badge`, `BADGE_TINTS`, `Tag`, `ResearchIcon`, `SectionTitle`, `Divider` and `Reveal`. Add `Icon` and `SITE_ICONS`.
- Create: `tests/site-tokens.test.js`

**Interfaces:**
- Produces:
  - CSS custom properties `--sim-*` on `:root` (Earth night) and `--site-header-h: 64px`.
  - Classes `.sheet`, `.section-panel`, `.btn`, `.btn--primary`, `.btn--quiet`, `.btn--small`, `.text-link`, `.skip-link`, `.visually-hidden`.
  - `<Icon name="menu|close|external|copy|check|play|pause|restart|arrow-up|mail|print|pin|scholar|orcid|github|linkedin" size={18} />`. The SVG is `aria-hidden`.

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const block = (css, selector) => { const s = css.indexOf(`${selector} {`); assert.ok(s >= 0, selector); return css.slice(s, css.indexOf('}', s)); };
const tokens = text => Object.fromEntries([...text.matchAll(/(--sim-[a-z0-9-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));

test('homepage tokens are the simulator Earth night tokens', () => {
  const site = tokens(block(read('colors_and_type.css'), ':root'));
  const sim = tokens(block(read('simulator-workbench.css'), '.ve-standalone'));
  const shared = Object.keys(sim).filter(k => !/font|ease/.test(k));
  for (const key of shared) assert.equal(site[key], sim[key], key);
});

test('no mint, teal, aubergine, indigo or lilac in homepage sources', () => {
  const banned = /#64ffda|#4ecdc4|#0dfca2|#7ee8e2|#a8edea|#20c997|#1a8e8f|#211d34|#1c2645|#1d416e|#2b2336|#c4b5fd|rgba\(100,\s*255,\s*218|rgba\(78,\s*205,\s*196|rgba\(13,\s*252,\s*162/i;
  for (const file of ['index.html', 'cv.html', 'colors_and_type.css', 'App.jsx', 'Header.jsx', 'Footer.jsx', 'Primitives.jsx',
    'SubsurfaceHero.jsx', 'GeologicalDescent.jsx', 'HomeSections.jsx', 'CVPage.jsx', 'site-content.js']) {
    if (!fs.existsSync(path.join(root, file))) continue;
    assert.doesNotMatch(read(file), banned, file);
  }
});
```

- [ ] **Step 2: Run it and confirm it fails.** `node --test tests/site-tokens.test.js` fails on the missing tokens and the banned colours.
- [ ] **Step 3: Rewrite the head of `colors_and_type.css`**
  - `:root` copies every `--sim-*` colour, rock and depth token verbatim from the `.ve-standalone` block. Add `--sim-ease`, the three font stacks and `--site-header-h`.
  - The base element rules keep today's sizes, weights, line heights and h2 padding, so the simulator keeps its layout. Colours change to tokens: `strong { color: inherit }`, `a { color: var(--sim-accent) }`, `code` neutral.
  - Remove the global `h1` gradient.
  - `:focus-visible` uses a 2 px `--sim-focus` outline.
  - Keep the global reduced-motion kill switch and the print rule.
  - Delete every legacy block listed in the audit's code-health finding.
- [ ] **Step 4: Rewrite `Primitives.jsx`** to hold only `SITE_ICONS` (path data) and `Icon`:
  - UI icons are 24-unit stroke paths.
  - Brand marks are fill paths: the GitHub and LinkedIn marks, the ORCID "iD" roundel, and a Scholar cap.
- [ ] **Step 5: Run `node build.js && node --test tests/site-tokens.test.js`.** The token test passes. The banned-colour test passes once the later tasks finish. Mark it `{ todo: 'Tasks 4–8' }` and remove the flag in Task 8.
- [ ] **Step 6: Commit.** Message: `feat(style): Earth night tokens shared with the simulator; inline icon set`.

### Task 4: Routing, scroll spy, header and footer

**Files:**
- Modify: `App.jsx`:
  - Entries: home, cv, simulator.
  - Helpers: `siteActiveSection`, `siteLegacyTarget`, `siteNavigate`.
  - The footer moves outside `<main>`.
  - A skip link.
- Modify: `Header.jsx` (CSS classes, new items, `Icon`, no own scroll spy)
- Modify: `Footer.jsx`
- Create: `tests/site-nav.test.js`
- Append to `colors_and_type.css`: header, drawer, footer and skip-link blocks.

**Interfaces:**
- Produces:
  - `SITE_NAV_ITEMS`: `[{ id: 'research'|'projects'|'publications'|'simulator'|'cv'|'contact', label, href }]`, with hrefs `./index.html#research`, `./index.html#projects`, `./index.html#publications`, `./simulator.html`, `./cv.html`, `./index.html#contact`.
  - `siteActiveSection(rects, line)` takes `rects: [{ id, top, bottom }]` and returns the id whose box contains `line`, or `'home'`.
  - `siteLegacyTarget(hash)` maps `'#about' → 'research'`, `'#cv' → 'cv'`, `'#simulator' → 'simulator'`, `'#research' → 'research'`, `'#publications'` and `'#contact'` to themselves, `'' → 'home'`, and anything unknown → `'home'`.
  - `Header({ active, onNavigate, variant })`, where `onNavigate(id, event)` may call `event.preventDefault()`.

- [ ] **Step 1: Write the failing test.** Load the helpers by slicing `App.jsx` between `// ---- navigation helpers` and `// ---- end navigation helpers`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../App.jsx'), 'utf8');
const helpers = new Function(src.slice(src.indexOf('// ---- navigation helpers'), src.indexOf('// ---- end navigation helpers')) +
  '\nreturn { siteActiveSection, siteLegacyTarget, SITE_NAV_ITEMS };')();

test('the active section is the one under the reading line', () => {
  const rects = [{ id: 'research', top: 900, bottom: 2000 }, { id: 'projects', top: 2100, bottom: 2900 }];
  assert.equal(helpers.siteActiveSection(rects, 300), 'home', 'hero at the top lights nothing');
  assert.equal(helpers.siteActiveSection(rects, 950), 'research');
  assert.equal(helpers.siteActiveSection(rects, 2050), 'research', 'the gap between sheets keeps the previous section');
  assert.equal(helpers.siteActiveSection(rects, 2500), 'projects');
});

test('old links still land somewhere sensible', () => {
  for (const [hash, id] of [['#about', 'research'], ['#research', 'research'], ['#publications', 'publications'],
    ['#contact', 'contact'], ['#cv', 'cv'], ['#simulator', 'simulator'], ['', 'home'], ['#nope', 'home']]) {
    assert.equal(helpers.siteLegacyTarget(hash), id, hash);
  }
});

test('navigation items are real links in the agreed order', () => {
  assert.deepEqual(helpers.SITE_NAV_ITEMS.map(i => i.label), ['Research', 'Projects', 'Publications', 'Simulator', 'CV', 'Contact']);
  assert.ok(helpers.SITE_NAV_ITEMS.every(i => /^\.\/(index|cv|simulator)\.html/.test(i.href)));
});
```

- [ ] **Step 2: Run it and confirm it fails.** `node --test tests/site-nav.test.js` fails: the helpers are missing.
- [ ] **Step 3: Implement the helpers in `App.jsx`**:
  - `siteActiveSection`: the last rect with `top <= line` wins if `line < next.top`; return `'home'` if `line` is above the first rect.
  - `siteLegacyTarget`.
  - `siteNavigate(page, id, event)`:
    - Same-page sections: `preventDefault`, smooth scroll (instant under reduced motion), then `history.pushState`.
    - Cross-page links: only plain left clicks are handled; modified clicks keep their default.
    - `'cv'` and `'simulator'` hrefs navigate.
  - Rewrite `App`:
    - The home entry renders `SkipLink`, `Header`, `<main id="main-content">` (hero plus descent sections), then `<Footer>`.
    - The scroll spy: on scroll, a `requestAnimationFrame` reads the rects of `#research, #projects, #publications, #contact` and calls `siteActiveSection(rects, window.innerHeight * 0.45)`.
    - On load, a legacy hash redirects with `location.replace` for cv and simulator, and scrolls to sections after first layout.
  - `CVStandalone` for `data-page="cv"`.
  - `SimulatorStandalone` keeps the workbench header, and its links resolve through `siteNavigate('simulator', …)`.
- [ ] **Step 4: Restyle `Header.jsx` and `Footer.jsx`** with classes (`.app-header`, `.app-header--site|--workbench`, `.is-scrolled`, `.app-nav__link[aria-current]`, `.app-drawer`).
  - Delete the internal spy.
  - The hamburger and close buttons use `Icon`.
  - The drawer's connect row lists email, Scholar, ORCID, GitHub and LinkedIn.
  - The workbench variant keeps its look through `--ve-*`.
  - The footer has the © line, the affiliation, the six links and "Back to top" (`Icon arrow-up`).
- [ ] **Step 5: Run `node build.js && node --test tests/site-nav.test.js && node --test tests/*.test.js`.** Expected: PASS. The hero and descent tests are still green because those files have not changed yet.
- [ ] **Step 6: Commit.** Message: `feat(nav): one scroll spy, real links, cv entry routing; Earth header and footer`.

### Task 5: Hero UI

**Files:**
- Modify: `SubsurfaceHero.jsx`.
  - Keep `Sky` and `HeroName` byte-for-byte apart from colours. `tests/hero-sky.test.js` and `tests/hero-name.test.js` slice them by the markers `const Sky =` … `// Decorative equipment` and `const HeroName =` … `const Identity =`.
- Append to `colors_and_type.css`: hero identity, axis, labels, player, buttons in the hero, and the phone layout.
- Modify: `tests/hero-model.test.js`. Add `heroInitialPlayback` and `heroShouldTick` tests, loaded by slicing `SubsurfaceHero.jsx` between `// ---- hero playback helpers` and `// ---- end hero playback helpers`.

**Interfaces:**
- Consumes `HeroGeology.randomGeology`, `section`, `simulate` (via the worker), `frameOf`, `depthToY`, `depthTicks`, `exaggeration` and `yearsPerSecond` from Task 1, and `Icon` from Task 3.
- Produces:
  - `SubsurfaceHero({ onNavigate })`.
  - `heroInitialPlayback(reducedMotion)` returns `{ year: reducedMotion ? 400 : 0, playing: !reducedMotion }`.
  - `heroShouldTick({ playing, visible, hidden })`.
  - `heroPhase(year, injectionYears)` returns `'injecting' | 'migrating'`.

- [ ] **Step 1: Write the failing helper tests** (append to `tests/hero-model.test.js`):

```js
test('hero playback starts still under reduced motion and never ticks unseen', () => {
  const src = fs.readFileSync(require.resolve('../SubsurfaceHero.jsx'), 'utf8');
  const h = new Function(src.slice(src.indexOf('// ---- hero playback helpers'), src.indexOf('// ---- end hero playback helpers')) +
    '\nreturn { heroInitialPlayback, heroShouldTick, heroPhase };')();
  assert.deepEqual(h.heroInitialPlayback(true), { year: 400, playing: false });
  assert.deepEqual(h.heroInitialPlayback(false), { year: 0, playing: true });
  for (const playing of [true, false]) for (const visible of [true, false]) for (const hidden of [true, false]) {
    assert.equal(h.heroShouldTick({ playing, visible, hidden }), playing && visible && !hidden);
  }
  assert.equal(h.heroPhase(12, 30), 'injecting');
  assert.equal(h.heroPhase(30, 30), 'migrating');
});
```

- [ ] **Step 2: Run it and confirm it fails** (the helpers are missing).
- [ ] **Step 3: Rebuild the hero** per the spec's Hero section:
  - The geology comes from `HeroGeology.randomGeology()` at module scope, and `HeroGeology.section(geology)` is memoised once.
  - **`HeroScene`** (memo, static): overburden, caprock (shale pattern), overlying and storage aquifers (sand pattern), underburden (base colour plus the masked shale photo plus a bridge gradient), `GeologyTexture` (keep its `trace` code), faults F1 and F2, the well with perforation ticks, and the surface hairline.
  - **`HeroPlume`** (per frame):
    - Mobile ribbons (`--sim-glow-free → --sim-c-free`, roof to roof + h·15).
    - Residual ribbons (`#hero-residual` hatch, roof + h·15 to roof + hMax·15).
    - Overlying-aquifer CO₂ in the leaked colours.
    - The contact line.
    - The leaking fault segment with `strokeDashoffset` tied to the year.
    - Frames between whole years are interpolated linearly.
  - **`HeroDepthAxis`**: "Depth (m)", 0 at the surface, a break mark, then the ticks from `depthTicks()` placed with `depthToY`.
  - **`HeroLabels`**: a wide set (x = 980, right-aligned) and a narrow set (x = 170, left of the well, placed after the axis), toggled by CSS.
  - **`HeroPlayer`**:
    - Play/pause, a range input labelled "Simulation year" with `aria-valuetext`, restart and speed buttons, all with accessible names.
    - The inventory bar (`role="img"`, labelled with percentages) and a legend with percentages.
    - The scale note, whose ×N comes from `exaggeration()` measured by a ResizeObserver on the section SVG.
  - **Playback**:
    - A `requestAnimationFrame` loop advances `year += dt · yearsPerSecond(year) · speed` and stops at 2000.
    - It runs only while `heroShouldTick()` holds (IntersectionObserver on `#home` plus `visibilitychange`).
    - The initial state comes from `heroInitialPlayback(matchMedia('(prefers-reduced-motion: reduce)').matches)`.
  - **`SurfaceSite`** receives `injecting`. The feed flow, the tubing dash and the status lamp run only while injecting.
  - **Identity**: role, `HeroName`, summary, the two buttons and the profile icons from `SITE_LINKS`.
  - **Delete**: `generateRandomizedFaults`/`generateRandomGeology` (moved), `precomputeSimulation`, `buildSmoothRibbonPath`'s per-point geometry calls, `ReservoirGrid`, `Streamlines`, `SimCells`, `PLUME_B*`, `getColumnPath`, `CAP_ROCK_*` constants, `Annotation`, `ScrollCue`, `Horizon` and the name-preview switcher.
- [ ] **Step 4: Run `node build.js && node --test tests/*.test.js`.** Expected: PASS, including the hero sky and name tests.
- [ ] **Step 5: Look at it.** Run `node capture.js http://127.0.0.1:8137 <scratch>/after home`. Read `home-desktop.png` and `home-phone.png`. Fix overlaps before committing.
- [ ] **Step 6: Commit.** Message: `feat(hero): Earth night section, correct labels and depth axis, inventory player, paused off-screen`.

### Task 6: Homepage sections and the descent

**Files:**
- Rewrite: `HomeSections.jsx`. Exports `ResearchSection`, `ProjectsSection`, `PublicationsSection`, `ContactSection`, `ActivityList`, and the helper `siteCopy(text, clipboard)`.
- Modify: `GeologicalDescent.jsx`:
  - N sections.
  - Captured root.
  - Earth flat colours and veil.
  - Lazy texture `href`s through a third observer.
  - The same bridge colour as the hero.
- Modify: `App.jsx` (render the four sections)
- Modify: `tests/geological-descent.test.js`. Replace the slate-colour assertions with "hero and descent bridges use the same colour". Add a five-height case (four sheets plus the footer).
- Append to `colors_and_type.css`: sheets, research, activity, projects, publications, contact and descent.
- Create: `assets/project-simulator.webp` (640×360, captured from the local simulator)

**Interfaces:**
- Consumes `SITE_*` from Task 2, `Icon` from Task 3 and `siteNavigate` from Task 4.
- Produces `siteCopy(text, clipboard) → Promise<boolean>`.

- [ ] **Step 1: Write the failing clipboard test** in `tests/site-content.test.js`:

```js
test('copy reports failure instead of claiming success', async () => {
  const src = fs.readFileSync(path.join(root, 'HomeSections.jsx'), 'utf8');
  const siteCopy = new Function(src.slice(src.indexOf('// ---- copy helper'), src.indexOf('// ---- end copy helper')) + '\nreturn siteCopy;')();
  assert.equal(await siteCopy('x', { writeText: async () => {} }), true);
  assert.equal(await siteCopy('x', { writeText: async () => { throw new Error('denied'); } }), false);
  assert.equal(await siteCopy('x', undefined), false);
});
```

- [ ] **Step 2: Run it and confirm it fails.**
- [ ] **Step 3: Implement the sections** with the spec copy and the data from `site-content.js`. Each section is `<section id=… className="section-panel" aria-labelledby=…><div className="sheet">…`. Use `scroll-margin-top: calc(var(--site-header-h) + 16px)`. There are no `Reveal` wrappers.
- [ ] **Step 4: Update the descent**:
  - `const root = rootRef.current` is captured in the effect.
  - The heights come from all `.section-panel` elements plus the footer.
  - `basementLevel = total - footer - last * 0.58`.
  - Flow streaks use `heights[0]` and `heights[1]`.
  - The texture observer uses `rootMargin: '0px 0px -5% 0px'`.
  - Images get `href` only when textures are on, with a 400 ms opacity fade on `.descent-rock`.
- [ ] **Step 5: Run `node build.js && node --test tests/*.test.js`.** Expected: PASS.
- [ ] **Step 6: Commit.** Message: `feat(home): research, projects, publications and contact on Earth sheets; lighter descent`.

### Task 7: CV page

**Files:**
- Create: `cv.html` (its own head; `<div id="root" data-page="cv">`)
- Rewrite: `CVPage.jsx` (data from `SITE_CV` and `SITE_PUBLICATIONS`; print button with `Icon print`)
- Append to `colors_and_type.css`: the CV document and print blocks.
- Modify: `tests/site-content.test.js`. Drop the `todo` flags; the CV now reads `SITE_PUBLICATIONS`.

**Interfaces:**
- Consumes `SITE_CV`, `SITE_PUBLICATIONS`, `SITE_LINKS`, `Icon`, `Header`, `Footer` and `siteNavigate`.

- [ ] **Step 1: Extend `tests/site-smoke.js`** with CV contracts. These fail first.

```js
has('cv.html', /<title>CV — Sa'eed Telvari<\/title>/, 'CV needs its own title');
has('cv.html', /rel="canonical" href="https:\/\/saeedtelvari\.github\.io\/cv\.html"/, 'CV needs a canonical URL');
has('cv.html', /data-page="cv"/, 'CV renders its own entry');
lacks('cv.html', /font-awesome/, 'CV must not load Font Awesome');
has('CVPage.jsx', /window\.print\(\)/, 'CV print action invokes browser print');
has('CVPage.jsx', /Print or save as PDF/, 'CV offers print and PDF export');
lacks('CVPage.jsx', /headerbg3|backgroundImage/, 'CV has no photo background');
```

- [ ] **Step 2: Run `node tests/site-smoke.js`** and confirm it fails because `cv.html` is missing.
- [ ] **Step 3: Implement `cv.html` and `CVPage.jsx`** as the spec's CV section describes:
  - Use `<article class="cv">`.
  - Each section is `<section aria-labelledby>` with an `h2`.
  - Entries are `<div class="cv-row"><time class="cv-date">…</time><div>…</div></div>`.
  - Print CSS: black on white, no header, footer or button, `break-inside: avoid` on rows, and `a[href^="https://doi.org"]::after { content: " " attr(href) }`.
- [ ] **Step 4: Run `node build.js && node --test tests/*.test.js && node tests/site-smoke.js`.** Expected: PASS.
- [ ] **Step 5: Commit.** Message: `feat(cv): standalone CV page with approved additions and clean print`.

### Task 8: Page heads, loader shell, SEO files, simulator deep link

**Files:**
- Modify (Edit tool, CRLF): `index.html`
  - Head: title and description, `theme-color`, enriched Person JSON-LD, trimmed Google Fonts, no Font Awesome.
  - `defer` on React, ReactDOM and the bundle.
  - Favicons and the new OG image.
  - The Earth sky loader shell. The `#app-loader` id stays.
  - `<noscript>`.
  - Keyframes trimmed to those still used.
- Modify: `simulator.html`
  - The same `bundle.js` and `colors_and_type.css` versions as `index.html`.
  - `og:image` → `social-simulator.jpg`, plus favicon fallbacks.
  - `simulator-bundle.js?v=24` in both the preload and the script tag.
- Modify: `SimulatorPage.jsx`. The initial section comes from `location.hash`: `#method` → `'method'`, `#uncertainty` → `'uncertainty'`.
- Create: `robots.txt`, `sitemap.xml`
- Modify: `tests/site-smoke.js`:
  - CTA text.
  - The simulator version is `'24'`.
  - Bundle versions are equal across `index.html`, `cv.html` and `simulator.html`.
  - `defer` is present.
  - No Font Awesome on `index.html`.
  - `noscript`, favicon fallbacks and the robots/sitemap files exist.
  - The `three-phase` and `EarthArXiv` regexes point at `site-content.js`.

- [ ] **Step 1: Write the new smoke assertions** as listed above, using the existing `has` and `lacks` helpers:

```js
for (const page of ['index.html', 'cv.html']) {
  lacks(page, /font-awesome/, `${page} uses inline icons`);
  has(page, /<script defer src="https:\/\/unpkg\.com\/react@18\.3\.1/, `${page} defers React`);
  has(page, /<noscript>/, `${page} has a no-JavaScript fallback`);
  has(page, /rel="apple-touch-icon"/, `${page} has a touch icon`);
}
const bundleVersion = page => [...read(page).matchAll(/bundle\.js\?v=([\d.]+)/g)].filter(m => !m[0].startsWith('simulator')).map(m => m[1]);
const versions = new Set(['index.html', 'cv.html', 'simulator.html'].flatMap(bundleVersion));
assert.equal(versions.size, 1, 'all pages load the same bundle.js version');
assert.ok(fs.existsSync(path.join(root, 'robots.txt')) && fs.existsSync(path.join(root, 'sitemap.xml')));
has('SimulatorPage.jsx', /location\.hash === '#method'/, 'the method guide can be linked directly');
```

- [ ] **Step 2: Run `node tests/site-smoke.js`** and confirm it fails.
- [ ] **Step 3: Make the edits** listed under Files.
- [ ] **Step 4: Run `node build.js && node --test tests/*.test.js && node tests/site-smoke.js`.** Expected: PASS.
- [ ] **Step 5: Commit.** Message: `feat(seo): deferred scripts, sky shell, noscript, favicons, sitemap; simulator deep links and versions`.

### Task 9: Assets and documentation

**Files:**
- Replace: `assets/geology-*.webp` (640 px, quality 0.6; check sizes are about 60–100 KB each)
- Create:
  - `assets/social-card.jpg` (1200×630, the rendered hero with the name).
  - `assets/social-simulator.jpg` (1200×630, the simulator map).
  - `favicon.ico` (32 px PNG-in-ICO).
  - `assets/favicon-32.png`.
  - `assets/apple-touch-icon.png` (180 px on `#120e0b`).
- Delete:
  - Unreferenced images: `about_bg.png`, `aut.png`, `bg10.jpg`, `bg18.png`, `bg8.jpg`, `carbondigital.jpeg`, `co2.jpg`, `contact_bg.png`, `contact_bg_v2.png`, `DLpetro.jpeg`, `engineer.ico`, `geothermal.jpeg`, `headerbg3.jpg`, `linkedin.png`, `logo-minimalist-jpg.png`, `logo-no-name.png`, `logo.png`, `research_bg.png`, `research_bg_3.png`, `research_bg_v2.png`, `reservoirsim.jpeg`, `social-preview.jpg`.
  - `agent_handoff.md`.
- Modify: `README.md`, `docs/geology-textures.md`

- [ ] **Step 1: Check no references remain** for each file to delete: `git grep -n "<name>" -- ':!docs/superpowers'` must be empty.
- [ ] **Step 2: Generate the images** with the scratchpad puppeteer scripts (canvas → WebP/JPEG/PNG). Write the ICO header around the PNG bytes.
- [ ] **Step 3: Update the docs.**
  - README: structure, design system, `cv.html`, the hero model, the commands.
  - `geology-textures.md`: the 640 px web copies and lazy loading.
- [ ] **Step 4: Run `node build.js && node --test tests/*.test.js && node tests/site-smoke.js`.** Expected: PASS.
- [ ] **Step 5: Commit, in two commits.**
  - `chore(assets): compress geology textures, add social cards and favicons`.
  - `chore: remove unreferenced images and the stale agent handoff`.

### Task 10: Browser QA and fixes

- [ ] **Step 1: Capture the pages.** Run `capture.js` for home, cv and sim at 1440×900 and 390×844 with motion on, plus `extra.js`-style shots at 320×640, 834×1112 and 1280×720.
  - Expected: no console errors, no `pageErrors`, no failed requests.
  - `docScrollWidth == innerWidth` everywhere.
- [ ] **Step 2: Run accessibility.** `a11y.js` should report 0 axe violations on home and CV at both widths.
- [ ] **Step 3: Check runtime.** `perf.js` at the top and scrolled 2,500 px, with `node perf.js … 0` and `… 2500`:
  - Below 80 ms of script per second while playing.
  - About 0 when scrolled away.
- [ ] **Step 4: Check the throttled phone.** `slow.js` on `/index.html` and `/cv.html`. The name paints by 2.5 s; record the measured LCP.
- [ ] **Step 5: Check the simulator.** Run `simshot.js` and compare with `simbefore/` by eye. Only the header items and the icon glyphs should differ.
- [ ] **Step 6: Check weight.** Homepage wire transfer at most 0.9 MB; CV at most 0.5 MB.
- [ ] **Step 7: Fix and rerun.** Fix what fails. Rerun `node build.js && node --test tests/*.test.js && node tests/site-smoke.js`.
- [ ] **Step 8: Save the after screenshots** as WebP in `docs/superpowers/specs/2026-10-13-homepage-audit/after-*.webp` and add an "After" section to the audit with the measured numbers.
- [ ] **Step 9: Commit.** Message: `docs: after screenshots and measurements`.

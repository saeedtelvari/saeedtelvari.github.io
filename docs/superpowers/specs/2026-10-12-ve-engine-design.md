# VE Engine Rewrite — Design Spec

Date: 2026-10-12 · Branch: `ve-engine` · Status: approved

Sub-project 1 of the VE simulator overhaul. Order: **(1) engine** → (2) visual redesign → (3) UQ overhaul → (4) depleted-gas-field preset.

## 1. Goal

Replace the solver inside `SimulatorPage.jsx` with a pure, unit-correct, mass-conservative Vertical Equilibrium (VE) engine — "co2lab-lite in the browser" — and wire it into the existing page with minimal UI change. The visual redesign follows as a separate sub-project and will render the quantities this engine produces.

Success = a reservoir engineer familiar with MRST/co2lab can inspect the page and find the physics honest: real units, exact mass balance, correct residual-zone placement, no dead controls.

## 2. Problems this fixes (from audit)

| # | Problem | Evidence |
|---|---|---|
| 1 | CO₂ mass destroyed: clamp `Math.min(H_res, …)` deletes volume once a column fills; injected keeps counting | Headless run, default case: 552 injected → 192 stored+leaked at yr 1000 (**−65%**); low-K/high-Q: **−88%** (`SimulatorPage.jsx:1100,1110,1133`) |
| 2 | Stale closure: play loop captures `runSolverStep`/`capRockY` from the render where play started; topography edits mid-run never reach the solver while the renderer draws the new geometry | Effect deps `[isPlaying, isReversing, speed]` (`SimulatorPage.jsx:334`) |
| 3 | No viscous term / mobility ratio → not a gravity tongue; injection is a volume kernel | `SimulatorPage.jsx:1083,1104-1113` |
| 4 | Fake units: "mD" = slider×1000, Q unitless, "kt" = Σh·dx·φ, depth = px/15, threshold "m" vs unitless h | throughout |
| 5 | Dead control: entry pressure `P_e` unused by solver; fringe cosmetic | `entryPressure` never read in solver |
| 6 | Residual zone drawn from caprock down; physically sits between h and h_max under the mobile plume; legend hard-codes `S_g→0.90`, `S_gr≈0.25` | `SimulatorPage.jsx:1276`, `:2001-2004` |
| 7 | "TVD limiter" is a 30%-per-substep flux cap with fixed 25 substeps, no CFL | `SimulatorPage.jsx:1036,1085-1090` |
| 8 | Leaked CO₂ vanishes; no juxtaposition | `SimulatorPage.jsx:1115-1131` |
| 9 | UQ "P10 (Low Risk)" mislabelled when metric = trapping efficiency | `SimulatorPage.jsx:2490` |

## 3. Decisions (agreed)

- Physics fidelity: **real-units sharp-interface VE** (option 2). Depleted-gas-field physics later (sub-project 4).
- Fluid properties: **fixed realistic values + knobs** (Δρ, mobility ratio M, S_gr, S_wr); slab of width W converts 2D results to Mt.
- Include **trap analysis** (spill points, capacity, fill %) and **convective dissolution**.
- Fault leakage feeds a **second, upper aquifer** solved by the same code.
- Engine = **one plain-JS file exposed as `window.VE`** (Approach A). No Web Worker yet (UQ sub-project), no bundler migration.
- Capillary fringe affects the **rendered saturation profile only** (volume-preserving); flow uses the sharp interface.
- UI wiring is **minimal**; restyling, Time Machine removal, and layout are sub-project 2.

## 4. Architecture

```
ve-engine.js           pure functions, no DOM/React, wrapped in an IIFE
ve-engine.check.js     node assert-only self-check:  node ve-engine.check.js
```

`ve-engine.js` ends with:

```js
if (typeof module !== 'undefined' && module.exports) module.exports = VE;
else (typeof window !== 'undefined' ? window : globalThis).VE = VE;
```

The IIFE is required: `build.js` concatenates all files into one script scope, so top-level `const`s would collide. `build.js` adds `'ve-engine.js'` as the **first** entry of its file list. The check file is not bundled.

### 4.1 API

```js
VE.createModel(params)              // → model: geometry (m), layers, face multipliers, traps, derived constants
VE.initState(model)                 // → state
VE.advance(model, state, years, opts)
                                    // → new state (input not mutated); adaptive substeps
                                    //   opts.onSubstep(state, dt) optional, used by the self-check
VE.diagnose(model, state)           // → { masses, balanceError, traps, flags }
VE.columnProfile(model, state, layer, i, nSamples)
                                    // → [{ z, Sg }]  saturation vs depth below caprock (rendering)
VE.DEFAULT_PARAMS                   // frozen default params object
VE.PRESETS                          // { default, dome, faultedTrap, dipping, leakyFault } → params
```

`model` is rebuilt whenever params change. If `nx` is unchanged, the existing `state` remains valid for the new model (the simulation continues = "branch"). If `nx` changes, the UI resets.

### 4.2 State

Per layer ℓ ∈ {0 = lower (injection), 1 = upper}, per cell i (`Float64Array(nx)`):

- `V[ℓ][i]` — CO₂ volume per unit column area (m). **The conserved quantity.**
- `hmax[ℓ][i]` — historical max plume thickness (m).
- `D[ℓ][i]` — dissolved CO₂ per unit area (kg/m²).

Scalars: `t` (yr), `injected` (kg), `exited` (kg, left/right boundaries), `leakedCum` (kg, fault flux into upper layer), `substepsLastYear`, `flags`.

`h` is never stored; it is derived from (V, hmax) — §5.1.

### 4.3 Params (flat-ish, SI internally except where suffixed)

| Key | Default | UI range | Notes |
|---|---|---|---|
| `L` | 20000 m | fixed | domain length |
| `nx` | 200 | 50–300 | cells |
| `W` | 5000 m | 1–20 km | slab width (out of plane) |
| `H` | 50 m | 10–100 | lower aquifer thickness |
| `C` | 30 m | fixed | caprock thickness between layers |
| `H2` | 30 m | fixed | upper aquifer thickness |
| `z0` | 1000 m | fixed | caprock depth at x = 0 |
| `dipPct` | 0.5 | −3…3 | + = deeper to the right |
| `foldAmp` | 20 m | 0–60 | anticline amplitude |
| `foldCount` | 2 | 0.5–4 | anticline wavenumber over L |
| `k_mD` | 500 | 10–3000 | aquifer permeability |
| `phi` | 0.25 | 0.05–0.35 | porosity |
| `Swr` | 0.20 | 0.05–0.4 | residual brine |
| `Sgr` | 0.25 | 0–0.4 | residual CO₂ (must satisfy Swr+Sgr < 0.9) |
| `krgStar` | 0.6 | fixed | CO₂ rel-perm endpoint |
| `rhoW` | 1050 kg/m³ | fixed | |
| `dRho` | 350 kg/m³ | 100–600 | ρ_g = rhoW − dRho |
| `muW_cP` | 0.5 | fixed | |
| `M` | 5 | 1–20 | endpoint mobility ratio; μ_g = krgStar·μ_w/M (≈0.06 cP at default) |
| `Q_Mtpa` | 1.0 | 0–5 | injection rate |
| `injYears` | 30 | 5–200 | injection stops after |
| `wellFrac` | 0.70 | 0.1–0.9 | well x / L |
| `fringeOn` | true | toggle | |
| `Pe_kPa` | 5 | 1–40 | entry pressure → fringe height |
| `dissMult` | 1 | 0–3 | 0 = off |
| `faults` | see §7 | 0–3 faults | array of fault objects |

Default geometry check: fold slope `foldAmp·2π·foldCount/L` ≈ 1.26% exceeds dip 0.5%, so the default caprock has real crests (traps). Final default values may be tuned during implementation so presets showcase their features; the table is the starting point.

Unit conversions live in the engine (`mD → m²`, `cP → Pa·s`, `Mt/yr → kg/s`, `kPa → Pa`); the UI deals only in display units.

## 5. Physics

Coordinates: x horizontal; z depth, **positive down**. Layer ℓ has caprock-base depth `zt_ℓ(x)` and thickness `H_ℓ`. Plume thickness `h` is measured down from `zt`.

### 5.1 Column volume and hysteresis

```
V = φ[(1−Swr)·h + Sgr·(hmax − h)]
```

Inversion (each substep, after updating V):

- If `V ≥ φ(1−Swr)·hmax` → drainage: `h = V/(φ(1−Swr))`, `hmax = h`.
- Else → imbibition: `h = (V/φ − Sgr·hmax)/(1 − Swr − Sgr)`.
- If that gives `h < 0` (should not occur — fluxes, leakage and dissolution only remove mobile volume and the positivity limit in §5.6 bounds them — but guarded against round-off): `h = 0`, `hmax = V/(φ·Sgr)` (or `hmax = 0` if `Sgr = 0`).

Mobile volume `φ(1−Swr)h`; residual volume `φ·Sgr·(hmax − h)`.

### 5.2 Flux (per unit slab width, m²/s of CO₂)

```
λg = krgStar/μg      λw = 1/μw
mg = λg·h            mw = λw·(H − h)
F  = mg/(mg+mw) · U  +  mg·mw/(mg+mw) · k·Δρ·g · ( −∂(zt + h)/∂x )
```

- `(H − h)` shuts gravity flow off as a column fills — replaces the destructive clamp.
- At each face, `∂(zt + h)/∂x ≈ ((zt_R + h_R) − (zt_L + h_L))/dx`. A fault throw appears as a zt jump across a face and drives flow through it correctly.
- The **gravity** term is multiplied by the face multiplier `T_face` (§7.1). The viscous term is not: `U` already carries fault resistance through the left/right split (§5.3), and the total flux must pass the face.
- Cell update: `V_i += (F_{i−½} − F_{i+½}) · dt/dx`.

**Upwinding at a face:**

- Viscous term: `h` from the upstream side by sign of `U`.
- Gravity term (counter-current, Brenier & Jaffré 1991): with interface potential `Φ = zt + h`, CO₂ flows from the side with the **larger** Φ to the smaller. `mg` takes `h` from that CO₂-upstream side; `mw` takes `h` from the opposite (brine-upstream) side. `H` at the face = min(H_L, H_R).

### 5.3 Total flux U (lower layer only)

Both lateral boundaries are open at hydrostatic pressure. The injection rate (volumetric, per unit width) `q = Q/(ρg·W)` splits between left and right by flow resistance:

```
τ_i  = k · (λg·h_i + λw·(H − h_i))              total transmissivity of column i
R_L  = Σ_{faces left of well}  dx / (T_face · τ_face)
R_R  = Σ_{faces right of well} dx / (T_face · τ_face)
q_L  = q · R_R/(R_L + R_R)      q_R = q · R_L/(R_L + R_R)
U    = −q_L left of the well, +q_R right of the well, 0 after injection stops
```

`τ_face` = harmonic mean of the two adjacent `τ_i`; `T_face` is the fault multiplier (§7.1, 1 elsewhere). If both sides contain a zero-multiplier face (compartment), incompressible injection is impossible: set `q = 0` and raise `flags.injectionBlocked`. If only one side is blocked, all flow goes to the other side.

`ponytail:` the small net total flux induced by buoyancy is neglected; upgrade = full 1D pressure solve.

Upper layer: `U = 0` always.

### 5.4 Injection source

Well cell `w = floor(wellFrac·nx)`: `V_w += q·dt/dx` while `t < injYears` and not blocked. `injected += Q·dt`.

### 5.5 Boundaries

Outflow at x = 0 and x = L uses the interior cell as upstream with `zt` extrapolated linearly (zero-gradient h). Inflow from outside is zero (no CO₂ outside). Mass leaving is added to `exited`.

### 5.6 Time stepping

Explicit forward Euler in substeps inside `advance`. Each substep `dt` is the minimum of:

1. Advective CFL: `0.5 · φ(1−Swr−Sgr)·dx / max|∂F/∂h|`, derivative by finite difference with `δ = 1e-3·H`.
2. Diffusive: `0.45 · dx² / max D`, with `D = (mg·mw/(mg+mw))·kΔρg / (φ(1−Swr−Sgr))`.
3. Positivity: fluxes + leakage remove at most 50% of a cell's removable volume `b·h` (b = φ(1−Swr−Sgr)) per substep. Dissolution is capped separately at the other 50% (§8), so V stays ≥ 0. (A constant-rate dissolution sink inside this limit collapses dt at the thin plume tip.)
4. Capacity: for every cell with net inflow, `inflow·dt ≤ 0.9 · (φ(1−Swr)·H − V_i)`.
5. Event: remaining time to injection stop and to the end of the requested interval.

Hard cap 5000 substeps per simulated year; if hit, set `flags.substepCap` and continue (UI shows a warning). Mass balance is exact to round-off by construction (V-based flux differencing, sources and sinks booked in the same substep).

### 5.7 Capillary fringe (rendering only)

`hc = Pe/(Δρ·g)` (default 5 kPa → ≈1.46 m). `columnProfile` returns a Brooks–Corey-shaped `Sg(z)` (λ_BC = 2, fixed) that integrates to the same CO₂ volume as the sharp-interface column: mobile zone `Sg = 1 − Swr` near the top grading to 0 over `hc` at the base, then the residual zone at `Sgr` down to `hmax`. With `fringeOn = false`, the profile is the sharp step.

`ponytail:` fringe does not alter flow. Upgrade = co2lab capillary-fringe upscaled relative permeability.

## 6. Upper layer

- `zt_1(x) = zt_0(x) − C − H2` (conformable), same fault throws applied (§7).
- Same flux, hysteresis, dissolution, traps; `U = 0`; only source is fault leakage.
- Top of upper layer is sealed. `ponytail:` no leakage beyond the upper layer.

## 7. Faults

Fault object:

```js
{ xFrac, throw_m, Trock, Pth_kPa, kf_mD, sealed, dipSlope }
// throw_m > 0: downthrown to the right. dipSlope = dx/dz of the fault plane, drawing + upper-layer position only.
```

Defaults: `[{ xFrac: 0.28, throw_m: 15, Trock: 1, Pth_kPa: 20, kf_mD: 5, sealed: false, dipSlope: -0.22 }, { xFrac: 0.48, throw_m: -12, Trock: 0.8, Pth_kPa: 30, kf_mD: 5, sealed: false, dipSlope: 0.25 }]` (threshold columns ≈ 5.8 m and 8.7 m at Δρ = 350).

Geometry: `zt_ℓ(x) += throw_m` for all x right of the fault face in layer ℓ. Lower-layer face = nearest face to `xFrac·L`. Upper-layer face = nearest face to `xFrac·L − dipSlope·(C + H2)`.

### 7.1 Lateral transmissibility

```
T_jux  = max(0, H_ℓ − |throw_m|) / H_ℓ          sand-on-sand overlap
T_face = sealed ? 0 : T_jux · Trock
```

Throw ≥ H_ℓ → sand against shale → face is a barrier → fault-bounded trap.

`ponytail:` no cross-layer juxtaposition (lower sand against upper sand when throw ≈ C + H2).

### 7.2 Vertical leakage into the upper layer

For each non-sealed fault, check both lower-layer cells adjacent to its face:

```
hth = Pth/(Δρ·g)
if h_i > hth:
    v   = (kf·krgStar/μg) · [ (Δρ·g·h_i − Pth)/C + Δρ·g ]     Darcy velocity up the fault
    dV  = v · wf · dt / dx           (wf = 1 m fault-zone width, fixed)
    V_lower[i] −= dV;   V_upper[j] += dV;   leakedCum += dV·dx·W·ρg
```

`j` = upper-layer cell at the fault's upper-layer face (the cell on the same side as `i`).

## 8. Dissolution

Convective mixing (Pau et al. 2010):

```
Fd = dissMult · α · k·Δρs·g·Cs / μw      α = 0.017, Δρs = 10 kg/m³, Cs = 50 kg/m³
```

Default ≈ 2.6 kg/m²/yr. Applied where `h > 0`:

```
dm = min(Fd·dt, Dcap − D_i, 0.5·b·h_i·ρg)     Dcap = φ·H·Cs
D_i += dm;   V_i −= dm/ρg
```

Removed from mobile volume only. `ponytail:` dissolved CO₂ is not advected with brine; residual CO₂ does not dissolve. Upgrade = brine-transported tracer.

## 9. Trap analysis

Computed in `createModel` per layer from cell-centre `zt` and face barriers (`T_face = 0`).

1. Crests: cells that are local minima of `zt` (plateaus collapse to one crest).
2. From each crest, walk left while `zt` stays ≥ the previous cell (deepening/flat). Stop at:
   - a cell where `zt` becomes shallower → saddle; side spill depth = `zt` at the saddle;
   - a barrier face → side never spills (`+∞`);
   - the domain edge → side spill depth = `zt` of the edge cell.
3. Same to the right. `spill = min(left, right)`. If both are `+∞` the compartment fills to `zt + H`.
4. Trap cells = contiguous cells around the crest with `zt < spill`, not crossing barriers.
5. Capacity (kg) = `Σ ρg·φ(1−Swr)·min(H, spill − zt_i)·dx·W`.

In `diagnose`: per trap, structural mass = `Σ ρg·φ(1−Swr)·min(h_i, spill − zt_i)·dx·W`; `fill = structural/capacity`.

`ponytail:` traps are independent; no merging of nested traps on overfill. Upgrade = co2lab trap tree.

## 10. Mass accounting

`diagnose` returns, per layer: `structural`, `migrating` (mobile − structural), `residual`, `dissolved` (all kg; UI shows Mt) plus `injected`, `exited`, `leakedCum`, and

```
balanceError = (injected − Σ_layers(structural+migrating+residual+dissolved) − exited) / max(injected, 1)
```

Expected |balanceError| < 1e-10.

## 11. UI wiring (minimal, `SimulatorPage.jsx`)

Remove: `runSolverStep`, `capRockBaseProfile`, `stratumBaseProfile`, `getSimStratumFaultIntersection`, `getSimFaultIntersection`, `stratumY`, `capRockY`, the `hMobile/hTrapped` memo, the individual param `useState`s, and the 80-line `getParamDiff`.

Add/change:

- One `params` state (`VE.DEFAULT_PARAMS` initial). `model = useMemo(() => VE.createModel(params), [params])`. A `modelRef` holds the latest model; the play loop reads `modelRef.current` → fixes stale closure (#2).
- Engine state in a ref + React state for render; history stores deep copies of engine state per year (~10 MB at nx = 200, 1000 yr — acceptable).
- Generic `diffParams(a, b)` (~15 lines, walks keys incl. `faults[i].*`) feeds the Time Machine "Branch Parameters" list.
- Rendering maps metres → SVG with a computed vertical exaggeration (label it in a corner). Draw: caprock + lower aquifer + upper aquifer bodies; mobile plume `0→h`; residual zone `h→hmax` (fix #6); upper-layer plume with the same ribbon helper; one dashed spill line per trap; fringe gradient band sized by `hc`; fault planes; well.
- Sliders: replace with §4.3 keys in display units; per-fault rows: position, throw, Trock, P_th, k_f, sealed. Delete: global fault slip, leak rate, threshold-in-metres. `P_e` now drives the fringe (#5).
- Legend reads `1 − Swr`, `Sgr` from params.
- Mass panel: six categories (structural, migrating, residual, dissolved, upper layer, exited) + injected; one chart line each; efficiency bars become category fractions; live `balanceError` readout; warning chip for `flags`.
- Presets: buttons call `setParams(VE.PRESETS[name])` + reset.
- UQ tab: sample `k_mD`, `Sgr`, each fault `Pth_kPa` (uniform ± ranges as today); run `VE.advance` per realization in the existing chunked loop. Metrics: "Leaked to upper layer (Mt)" and "Immobilised fraction (%)" = (residual + dissolved)/injected. P-labels derived from metric direction (fix #9).
- Time Machine stays functional (removal is sub-project 2).

Other files:

- `GuidePage.jsx`: replace equations/text with §5–§9 content (text only, no restyle). List known simplifications (`ponytail` items).
- `build.js`: add `'ve-engine.js'` first.
- `index.html`: bump `bundle.js?v=` query.
- `README.md`: remove claims of box plots, KDE and plume envelopes; describe the engine accurately.

**Working-tree caution:** at branch creation, `CVPage.jsx`, `HomeSections.jsx`, `SubsurfaceHero.jsx`, `bundle.js`, `index.html` carry uncommitted user WIP. Rebuilding `bundle.js` will include that WIP. Implementation must not revert or stage those changes without the user's say; commit only engine-related hunks (`git add -p` for `index.html`; ask before committing a regenerated `bundle.js`).

## 12. Presets

| Key | Showcases | Sketch |
|---|---|---|
| `default` | general | dip 0.5%, fold 20 m × 2, two faults (above) |
| `dome` | structural trapping, fill % | dip 0.1%, fold 45 m × 1.5, no faults |
| `faultedTrap` | juxtaposition seal, fault-bounded trap | dip 1.5% up toward fault A, fault A throw 60 m (> H) |
| `dipping` | migration, residual trail, dissolution | dip −2%, fold 5 m, no faults, Sgr 0.3, dissMult 2 |
| `leakyFault` | upper-layer charging | default geometry, well at 0.35 L (between faults A and B), fault A Pth 10 kPa, kf 200 mD |

Values are starting points; tune in implementation so each preset visibly shows its feature within ~300 simulated years.

## 13. Testing

`node ve-engine.check.js` — asserts only, exits non-zero on failure:

1. Every preset: `|balanceError| < 1e-10` at yr 10, 30, 100, 1000.
2. Every substep (debug hook): `0 ≤ h ≤ H`, `h ≤ hmax`, `V ≥ 0`, `D ≤ Dcap`.
3. Flat caprock, no faults, no injection, central Gaussian mound: h stays symmetric to 1e-12.
4. Tilted caprock: plume centroid moves up-dip monotonically.
5. Sealed fault: zero flux across its face, zero leakage.
6. `|throw| ≥ H`: `T_jux = 0` and a fault-bounded trap is detected.
7. Single anticline profile: exactly one trap, spill at the shallower saddle, capacity equals a hand computation.
8. Dissolution: `D ≤ Dcap`; `dissMult = 0` → `D ≡ 0`.
9. Post-injection: residual mass > 0; cells with `h = 0` satisfy `V = φ·Sgr·hmax`.
10. Column with `h < hth`: zero leak.
11. Analytic: fixed-volume gravity current on a flat caprock (h ≪ H, no residual) — fitted front-position exponent within 0.33 ± 0.05 (Huppert & Woods 1995, t^{1/3}).

Plus: `node build.js` VM smoke test passes; manual browser check (`python -m http.server`): every preset runs to yr 1000, balance readout ≈ 0, scrub/branch works, one UQ batch completes.

## 14. Out of scope (this sub-project)

Palette/type/layout redesign; Time Machine removal; UQ Web Worker, LHS, ensemble outlines; hero (`SubsurfaceHero.jsx`) adopting the engine; depleted-gas-field preset; KaTeX; ES-module/bundler migration.

## 15. Known limitations (to list in the guide)

Incompressible fluids; small-dip (cos θ ≈ 1); brine mobility unreduced in residual zone; fringe display-only; net buoyancy-driven total flux neglected; no leakage above the upper layer; no cross-layer juxtaposition; independent traps (no spill-merge tree); dissolved CO₂ immobile; residual CO₂ does not dissolve; 1D VE (no out-of-plane variation).

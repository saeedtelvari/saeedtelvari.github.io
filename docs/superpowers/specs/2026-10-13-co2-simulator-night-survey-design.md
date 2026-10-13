# CO₂ Storage Simulator — "Night Survey" Redesign

Date: 2026-10-13
Base: `origin/main` @ `e57c669`
Supersedes: `2026-09-01-ve-simulator-workbench-redesign-design.md` (slate/teal workbench) and
`2026-09-06-ve-simulator-3d-topography-design.md` for everything they conflict with.

## 1. Why

The owner finds the current page bleak (almost everything is one teal), and an audit showed
that the numbers it reports do not survive a domain expert's scrutiny. The redesign therefore
changes both the physics engine and the visual design.

### 1.1 Audit evidence (measured, not assumed)

Measured headless in Node against `origin/main` with every clamp instrumented.

| # | Finding | Evidence |
|---|---|---|
| P1 | 1D solver silently deletes CO₂ (`Math.min(H_res, …)` in flux update, injection and final pass) | Default run: 339 of 552 "kt" (61 %) missing at year 1000; 74 % at max rate. Well cells hit full thickness at year 23. Visible on screen: 90.9 + 39.9 + 82.4 ≠ 552. |
| P2 | Both solvers are grid dependent (flux not scaled by face length, area or distance) | Flat 2D plume area at year 50: 17.8 / 8.7 / 4.2 % for 36 / 72 / 144 columns. 2D leak fraction 51 / 23 / 10 %. 1D leak 35 → 1.6 % for N = 50 → 400. |
| P3 | Risk analysis does not reproduce the workbench | Map UQ drops boundary condition, caps grid at 64 columns, runs 420 years. 1D UQ has no boundary outflow. Nominal leak 10.4 % vs 7.4 % (2D), 6.1 % vs 14.9 % (1D). |
| P4 | "Leaked" conflates lateral exit, fault leakage and capacity overflow | 57 of 183 kt "leaked" in default 2D is lateral exit through the open boundary. 1D open boundary drains regardless of dip direction. |
| P5 | Regional dip is nearly cosmetic in 2D | ±5 % dip moves the plume centroid < 1 cell in 500 years; dip adds 0.27 model units of relief vs 2.8 from noise. |
| P6 | No SI units, but SI labels | kt, kt/yr, `x_m`, `h_m`, "200 m" scale bar, kPa, "px" — engine has no density, viscosity, gravity or calibrated time. |
| P7 | Driving potential uses total height including residual CO₂ | `zt + h_total` in both solvers; residual zone carries no CO₂ head. |
| P8 | No dissolution, no spill-point analysis; "Structural trapping (Mobile)" = all mobile CO₂ | — |
| P9 | Capillary fringe inputs (h_c in m, entry pressure in kPa) only change the drawing | Drawn plume thicker than computed. |
| P10 | 1D and 2D model different reservoirs | Sinusoid vs Gaussian domes + noise; "Anticline count" means different things. |
| P11 | Methodology contradicts the code | Leak law, trapped formula, flux cap 0.30 vs 0.22, gradient vs difference, promised mass-balance diagnostic absent, S_g → 0.90 label with S_g = 1 volumes. |
| — | Checked, not occurring | Residual CO₂ transported/leaked (deficit 0); 2D capacity clamp (max h 1.15 vs 12); 2D conserves to ~1e-2 (rounding). |

Design findings: one hue (three teals) for chrome, controls, terrain and sealed faults;
contradictory colour semantics (2D bright = deep, 3D bright = shallow; pink→purple means
trapped fraction in 2D but thickness in 3D; 3D draws the plume above the caprock); four
navigation rows (~220 px) above the data; three run controls; the same four numbers shown
three times; most text 8.5–11 px across five families; hand-built math with broken limits;
cell-outline "contours"; a north arrow pointing south; 5 px chart axis labels; input rail
overflow scrolls the page ~1,200 px into empty gradient; dark mode makes the site navigation
unreadable; phone layout clips presets, legend and timeline. The page is visually
disconnected from the homepage's night-sky geology hero.

## 2. Direction

Three directions were considered:

- **A. Field atlas** — light paper, top-structure map, textbook block diagram. Most
  "scientific", but breaks continuity with the homepage night scene.
- **B. Night survey (chosen)** — the simulator continues the homepage world: night sky,
  layered strata, a luminous CO₂ plume, with one colour per trapping mechanism and neutral
  chrome. Includes a light "Day" theme for reading and printing.
- **C. Workbench refresh** — keep the slate layout, swap colours. Cheapest; keeps the
  structure that feels bleak.

The owner pre-authorised implementation of the recommended direction and will review after.

## 3. Product structure

Page name: **CO₂ Storage Simulator** — subtitle "Vertical-equilibrium model of plume
migration, trapping and leakage in a saline aquifer". Browser title: "CO₂ Storage Simulator |
Sa'eed Telvari". Site navigation label: "CO₂ Simulator".

One scenario, one model, three synchronised views. The separate 1D solver is removed; the
cross-section is a true vertical slice through the 2D state.

Sections (app-bar tabs): **Simulator · Uncertainty · Method**.
Simulator views (segmented control on the stage): **Map · 3D · Section**.

### 3.1 Layout (desktop ≥ 1180 px)

1. Shared site header (existing `Header`, `workbench` variant re-skinned through tokens).
2. App bar (one row): title + subtitle · section tabs · Share · Export menu · Theme toggle.
3. Workbench, filling the remaining viewport, no page scroll:
   - **Input rail** (300 px, scrolls internally): scenario picker, then groups Injection,
     Aquifer, Structure, Faults, Trapping & fluids (`<details>`), Numerics (`<details>`).
   - **Stage** (fluid): view switch, layer menu and legend overlaid; the view canvas; the
     transport bar (play/pause, step, scrubber with injection band and computed-progress
     band, speed, `Year 125 / 1000`).
   - **Outcome rail** (320 px): inventory at current year (100 % bar + labelled list in Mt
     and %), inventory-through-time stacked area with injected line and cursor, KPIs
     (footprint, max column, migration distance, BHP build-up, mass-balance error),
     status messages.

Tablet (761–1179 px): input rail becomes a sheet; outcome rail stays docked below the stage.
Phone (≤ 760 px): stage first (aspect 4:3), transport bar, a compact inventory strip, then
Inputs / Outcomes bottom sheets (existing accessible sheet pattern). No horizontal overflow at
390 px; the scrubber stays visible; legends wrap.

### 3.2 Behaviour

- Any input change recomputes the whole run in a Web Worker (debounced 250 ms). Snapshots
  stream back; playback can start before the run completes. There is no "Inputs changed"
  state and no separate Run button: the play button plays the current result.
- The current year is preserved across recomputes (results morph in place).
- Presets: **Dome & leaky fault** (default, shows all six inventory classes), **Dipping
  aquifer**, **Anticline trap**, **Sealed fault block**, **Rough top surface**, **Random**.
- Share link encodes the scenario in the query string; Export: inventory CSV, grid CSV
  (current year), view PNG. All exports in SI with units in headers.
- Uncertainty runs the same engine at the same grid (or an explicitly labelled coarse grid);
  loading a realization reproduces its numbers exactly.

## 4. Visual system

### 4.1 Tokens (night default; day variant via `data-theme="day"`)

| Role | Night | Day |
|---|---|---|
| Page background | `#0b1120` + subtle star noise | `#f4f2ec` |
| Surface (rails) | `#111a2e` | `#fbfaf7` |
| Surface raised | `#18233b` | `#ffffff` |
| Rule | `#26324d` | `#dcd7cb` |
| Ink | `#e8ecf4` | `#1e2230` |
| Ink muted | `#9aa6bf` | `#5d6475` |
| Action (UI accent, not data) | `#f2c66d` (lantern amber) | `#8a5a00` |
| Focus ring | `#f2c66d` 2 px + 2 px offset | `#8a5a00` |

Chrome is neutral; colour is reserved for data. The UI accent is a warm lantern amber used
only for primary actions, the selected tab marker, the scrubber thumb and focus.

### 4.2 Data colours (validated with the dataviz validator; stacked order adjacent-pair CVD ΔE ≥ 8.4, normal-vision ≥ 17)

| Inventory class (stack order, bottom→top) | Night | Day |
|---|---|---|
| Dissolved | `#3b82d4` | `#2f74c4` |
| Residually trapped | `#cf5f9e` | `#c24d8f` |
| Structurally trapped | `#c08417` | `#a8700a` |
| Free plume | `#23a07a` | `#178a66` |
| Left the model | `#8270e0` | `#6e5bd0` |
| Leaked through faults | `#d94a3f` | `#c93a30` |

Map/3D/section layers use the same hue families (lighter "glow" steps allowed for the plume
on the dark stage). Depth (top structure) is a single-hue indigo ramp, light = shallow,
dark = deep, in every view. Pressure build-up uses an amber sequential ramp. Status
messages use icons + labels.

### 4.3 Typography

Brand families only (already loaded): Montserrat (titles, section headings), Open Sans (UI
and prose), JetBrains Mono (numbers, axis labels, small-caps layer labels). Minimum 12 px;
UI 14 px; numbers tabular. Equations typeset with KaTeX (cdnjs, pinned version).

### 4.4 Geological conventions

Structure-map contours with labels; faults drawn with tick marks on the downthrown side;
the injector as a well symbol labelled `INJ-1`; north arrow up; scale bar in km; section
with vertical-exaggeration label ("Vertical exaggeration ×15"), never "VE" (which means
vertical equilibrium here).

## 5. Physics model (ve2d-model.js)

Sharp-interface vertical-equilibrium model of a homogeneous confined aquifer of thickness H
under a caprock of depth z_t(x, y) (positive down). SI throughout.

### 5.1 State

Per cell: mobile plume thickness h, historical maximum h_max, dissolved mass per area m_d,
brine pressure deviation from hydrostatic p.

CO₂ volume per area (conserved, m³/m²):
`s = φ[(1 − S_wr) h + S_gr (h_max − h)]`.
Inversion: if `s ≥ φ(1 − S_wr) h_max` then `h = h_max = s / (φ(1 − S_wr))`; else
`h = max(0, (s − φ S_gr h_max) / (φ(1 − S_wr − S_gr)))`, and if `s < φ S_gr h_max` the
residual zone shrinks: `h_max = s / (φ S_gr)`.

### 5.2 Fluxes (TPFA, per face, m³/s)

Interface depth ζ = z_t + h. Phase mobilities λ_g = k_rg* h / μ_g, λ_w = (H − h) / μ_w
(per unit permeability; the brine mobility reduction in the residual zone is neglected).
Geometric transmissibility T = k · face length / centre distance; fault multiplier m.

Gas flux i→j (hybrid upwinding):
`F = f_g(h_up(U)) · U + T m Δρ g (ζ_i − ζ_j) · λ_g(h_gas-up) λ_w(h_w-up) / (λ_g(h_gas-up) + λ_w(h_w-up))`
where U is the total face flux, up(U) its upstream cell, gas-up the cell with larger ζ and
w-up the other one.

### 5.3 Total flux

While injecting and until the pressure transient decays (max change < 0.05 bar per year):
`φ c_t H A (p − pⁿ)/Δt + Σ T m Λ_T (p_i − p_j) = Q_v − Σ T m Λ_g Δρ g (ζ_i − ζ_j)`,
solved with Jacobi-preconditioned CG (matrix-free, warm start); then
`U = T m [Λ_T (p_i − p_j) + Λ_g Δρ g (ζ_i − ζ_j)]`. Afterwards U = 0 (gravity-current
regime). Bottom-hole build-up uses Peaceman: `Δp_bh = Δp_block + Q_v/(2π k H λ_T) ln(r_e/r_w)`,
r_e = 0.2 Δx, r_w = 0.1 m.

### 5.4 Boundaries

Open: hydrostatic ghost cells at half a cell outside the domain, depth from the analytic top
surface, h = 0, p = 0. CO₂ leaves only when its potential points outward; outflow is booked
as "left the model". Closed: no-flow; pressure builds up through compressibility.

### 5.5 Faults

Trace through a point, with strike and length. Throw displaces the hanging wall (tapered at
tips). Faces crossed by a trace get `m = T_mult · max(0, 1 − throw/H)` (juxtaposition).
Vertical leakage per cell: `Q_leak = L_c w (k_f k_rg*/μ_g) Δρ g [(h − h_th)/L_cap + 1]` for
`h > h_th`, limited so the column cannot drop below h_th; L_c = trace length inside the
cell (grid independent); w = 5 m fault-zone width; L_cap = 100 m caprock thickness.
Inputs: seal capacity h_th (m of CO₂ column) and fault-zone permeability k_f (mD).

### 5.6 Dissolution

Convective dissolution at rate r_d (kg m⁻² yr⁻¹) wherever CO₂ is present, until the brine
column is saturated (capacity 53 kg m⁻³ × φ H, CO2store value used by co2lab). Taken from the
mobile plume first, then the residual zone. Default r_d = 0.2 kg m⁻² yr⁻¹ (≈ co2lab default
`dis_rate = 5e-11` at φ = 0.2).

### 5.7 Traps and inventory

Spill-point analysis by priority flood (Barnes et al. 2014) on z_t from the model edge
(co2lab convention), through faces with m > 0: spill depth z_s. Inventory (mass, Mt):
dissolved Σ m_d A; residual Σ ρ_g φ S_gr (h_max − h) A; structural
Σ ρ_g φ (1 − S_wr) min(h, max(0, z_s − z_t)) A; free = mobile − structural; left the model;
leaked; balance error = injected − sum (displayed).

### 5.8 Time stepping

Explicit, adaptive: Δt = 0.4 · min over cells of `φ(1 − S_wr − S_gr) A / Σ_faces |∂F/∂h|`
(bounds of the advective, viscous and buoyancy derivatives), capped at the output interval and
aligned to output times and the end of injection. Snapshots every 5 years.

### 5.9 Defaults

| Parameter | Default | Range |
|---|---|---|
| Domain | 20 × 12 km | fixed |
| Grid | 80 × 48 (250 m) | 40 × 24, 80 × 48, 120 × 72 |
| Injection rate | 1.0 Mt/yr | 0.1–5 |
| Injection period | 30 yr | 1–100 |
| Simulated period | 1000 yr | 100–2000 |
| Permeability | 500 mD | 10–5000 (log) |
| Porosity | 0.20 | 0.05–0.35 |
| Aquifer thickness | 50 m | 10–200 |
| Reference depth (top) | 1500 m | display only |
| Regional dip / direction | 0.6° / 90° | 0–3°, 0–360° |
| Domes / relief | 1 / 40 m | 0–4, 0–150 m |
| Roughness | 4 m | 0–40 m |
| ρ_CO2, ρ_brine | 700, 1050 kg/m³ | 400–900, 1000–1200 |
| μ_CO2, μ_brine | 0.055, 0.6 mPa·s | 0.02–0.1, 0.3–1.5 |
| S_wr, S_gr, k_rg* | 0.27, 0.20, 0.5 | co2lab Johansen; Bennion & Bachu range |
| Total compressibility | 1.0 ×10⁻⁴ bar⁻¹ | 0.2–5 |
| Dissolution rate | 0.2 kg m⁻² yr⁻¹ | 0–2 |
| Boundaries | Open (hydrostatic) | Open / Closed |

## 6. Views

**Map** — structure map: indigo depth ramp with hillshade, labelled contours (marching
squares), faults with downthrown ticks (solid sealing, dashed partially sealing, red pulse
where leaking now), trap outlines (amber dashed) and spill points, free plume (green, opacity
by thickness), structural part (amber), residual zone (magenta hatch), dissolved (blue tint,
toggle), pressure build-up contours (toggle), flow particles (toggle), injector, section line
with draggable ends, scale bar, north arrow, km ticks.

**3D** — block diagram (WebGL 2, revised 2026-10-13 after review): top of the aquifer with the
caprock removed, coloured and hatched like the map. The surface is built at cell corners from
the engine's own depth function and cut along every fault trace, so throw is a vertical scarp at
the trace (parabolic along strike, zero at the tips) rather than a ramp across a cell; scarps
and the four side walls show the CO₂ column in section (aquifer and base, no caprock lip);
fault traces stay visible from the footwall side; the injector is a stem with an entry ring
and a faint continuation into the aquifer. Depth-tested, so nothing is drawn through rock.
Vertical exaggeration control; orbit with inertia, pan, zoom, reset (eased); the camera
distance depends on elevation only, so orbiting never zooms; hover readout as on the map;
north arrow, km ticks and a depth key.

**Section** — slice along the section line: overburden, caprock, aquifer, base; free and
structural plume; residual zone; dissolved tint with illustrative convective fingers; faults
offset by their throw; injector; leakage bubbles in leaking faults; km and m axes.

## 7. Motion

Durations 150–250 ms for UI, `cubic-bezier(0.23, 1, 0.32, 1)`, never `transition: all`,
press scale 0.97. Data motion: smooth playback interpolation between snapshots; flow
particles along the CO₂ flux; injection pulse while injecting; leak beacons while leaking;
dissolution fingers; trap outlines draw in when shown; results morph (250 ms) after a
recompute; numbers tween. Under `prefers-reduced-motion` all loops, particles and tweens are
off; state changes are instant.

## 8. Method page

Rewritten to match the code exactly: scope and assumptions, geometry, governing equations,
total flux and pressure, boundaries, faults and leakage, dissolution, traps and inventory,
numerics, verification results (from the test suite), limitations, references (Nordbotten &
Celia 2012; Gasda et al. 2009; Hesse et al. 2008; MacMinn et al. 2011; Nilsen et al. 2016;
Neufeld et al. 2010; Barnes et al. 2014; Peaceman 1978; Lee, Efendiev & Tchelepi 2015;
Bennion & Bachu 2008). No "Navier–Stokes".

## 9. Verification

Engine (Node, `node --test`):
- mass balance relative error < 1e-9 over 1000 years for open/closed, faulted, leaky,
  dissolving scenarios;
- 0 ≤ h ≤ H and h ≤ h_max everywhere, always;
- injection-only radial plume vs Nordbotten & Celia (2006) similarity solution (Δρ = 0):
  extent within 10 %;
- thin plume on a slope (no injection flux): centroid speed within 15 % of
  `k k_rg* Δρ g sinθ / (μ_g φ (1 − S_wr))`;
- closed box: mean pressure build-up within 3 % of `V_inj / (φ c_t V_bulk)`;
- grid convergence: footprint and leaked fraction change < 10 % between 80 × 48 and 120 × 72;
- symmetry on a flat aquifer with a centred well; sealed fault blocks flow; leakage only above
  the seal capacity; dissolution capped by brine capacity; trap analysis on a synthetic dome;
  outflow only where the boundary potential points outward;
- Uncertainty parity: a realization run in the batch path equals the workbench run.

UI: pure helpers (URL round trip, CSV headers and units, marching squares, number formats)
plus the site smoke contracts. Visual QA by screenshot at 1440 × 900 and 390 × 844 for every
view and theme.

## 10. Non-goals

No new runtime dependency except KaTeX. Homepage hero untouched. No geomechanics, thermal,
compositional or capillary-fringe physics; CO₂ density constant. No heterogeneous
permeability field.

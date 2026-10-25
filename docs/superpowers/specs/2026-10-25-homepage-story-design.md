# Story homepage — design spec (draft)

Date: 2026-10-25. Branch: `redesign/homepage-story` (from origin/main `c9cc5f5`). Style board: [2026-10-25-homepage-story-mockups/styles.html](2026-10-25-homepage-story-mockups/styles.html). Storyboard: [2026-10-25-homepage-story-mockups/storyboard.html](2026-10-25-homepage-story-mockups/storyboard.html).

Status: draft. Art direction C (textbook cutaway) is chosen. The storyboard has one key frame for each chapter, ready for review.

## Intent

**Outcome.** The homepage tells one short story with scroll. The story starts in orbit and goes down into the North Sea and the reservoir. It then shows how a VE model turns a slow 3D model into a fast 2D map. The story ends on a live VE simulation that the visitor can control. After the story, the visitor finds the research, publications, CV and contact details.

**Audience.** Reservoir engineers, CCS researchers, supervisors and recruiters. Some visitors know VE well. Other visitors know nothing about CCS. The story must be correct for the first group and clear for the second group.

**User decisions (2026-10-25).**
- The story is scroll-driven. It is not an autoplay film.
- The site is the North Sea. The story names no field and no company.
- The live VE simulation is the last chapter. It replaces the current hero as the first screen.
- The page uses a new art style. It does not reuse the current hero art, the sky, the platform or the geology textures.
- The physics code can stay: `ve2d-model.js` and `hero-geology.js` are not art.
- The story shows how VE works. It does not show where VE fails. The papers give the details.
- The art direction is C, textbook cutaway. B is rejected: the research does not use seismic data, and the trace Earth does not look good. A is rejected.
- In chapter 4 the rock does not compress. The rock keeps its full 3D thickness. Only the vertical grid goes, so each column becomes one cell. This shows that the physical model is still 3D, and that the speed-up comes from the number of unknowns.
- A detailed geological cutaway comes after the descent and before the grid. The grid is then the model of the rock that the visitor just saw.
- The reservoir is a depleted gas field: a sandstone dome with a gas cap of methane at the crest. Methane and CO₂ have different colours.
- The model stays two-phase. Methane uses the same equations and properties as CO₂: it is the same light phase with a different colour. The gas cap moves with the pressure response from injection. The CO₂ plume and the gas cap do not need to meet during the model run.
- A fault cuts one flank of the dome. The story mentions MuPSI once, as one project where this work is applied. The story is not about MuPSI.

## Storyboard

The stage stays pinned while the visitor scrolls. One value, `progress` from 0 to 1, sets the camera, the time and the captions. The visitor can scroll back to replay a step. The total story is 6 to 7 screen heights.

The story removes detail in steps: the real Earth, then the real rock, then a 3D model of the rock, then the VE model. Each step keeps the same dome, fault and gas cap, so the visitor can follow one object from start to end.

| # | Chapter | Scroll | What the visitor sees | Copy (draft) |
|---|---|---|---|---|
| 0 | Orbit | 0.00–0.10 | The Earth from orbit, with the North Sea near the top of the disc. A ppm counter goes from 280 to the current value. | Name. "There is more than 420 ppm of CO₂ in the air. I model how rock under the North Sea can hold it for thousands of years." |
| 1 | Descent | 0.10–0.26 | The camera zooms to the North Sea. It goes down to one offshore platform. | "Carbon capture and storage puts CO₂ back into rock, deep under the sea floor." |
| 2 | Into the rock | 0.26–0.44 | The camera follows the well down a detailed cutaway (see [Geology](#geology)). At the bottom it stops on the reservoir: a sandstone dome with a methane gas cap at the crest, brine below, and a fault on one flank. The well is on the flank, away from the gas cap. | (a) "The well goes about 2 km down, through clay, chalk and a shale caprock." (b) "The sandstone is a dome that held natural gas for millions of years. Most of the gas is produced, so the dome can now store CO₂." |
| 3 | Rock to grid | 0.44–0.60 | The camera moves to the dome, and the rest of the cutaway fades. A grid draws onto the reservoir: vertical pillars first, then layers that follow the curved top and base. The fault offsets the grid. The cells show permeability colours for a moment. Then the 3D run starts: the CO₂ plume grows near the well and rises toward the crest, and the gas cap moves a little as the pressure rises. A run clock counts hours and days. | (a) "A 3D model splits the reservoir into cells that follow the layers and the fault. Field models have millions of cells, and one run can take days." (b) "Faults cut the reservoir and can leak. In the MuPSI project, which studies fault integrity, I apply these models to depleted gas fields." |
| 4 | 3D to VE | 0.60–0.80 | Three steps on the same curved grid. (a) The 3D cells: the gas cap at the crest and the CO₂ plume near the well, both in the top cells. (b) The horizontal cell boundaries fade out. The rock keeps its full thickness. (c) Each column is one tall cell. Gas fills the column down to depth *h*, and brine fills the rest. The gas is red where it is methane and blue where it is CO₂. The top face shows *h* as stepped bands in the same two colours. A bracket marks *h* on a cut face. A counter goes from the number of cells to the number of columns. | (a) "Gas is lighter than brine. Both the CO₂ and the methane rise to the top of each column." (b) "The rock stays 3D, but the vertical cells go. VE solves one value per column, the plume thickness *h*, so it runs up to 100× faster." |
| 5 | Live VE | 0.80–1.00 | The same dome and fault run live with `ve2d-model.js` on the coarse grid. The gas cap moves with the pressure from injection. The top face shows *h* each year, and the cut faces show the interface that VE rebuilds from *h*. The visitor can play, pause and scrub the years. | "This VE model runs in your browser." Buttons: "Open the simulator" and "Read my research". |

**Rules for the story.**
- Each chapter has one message. A caption has a maximum of two sentences.
- A "Skip to research" control is always on screen during the story.
- Numbers are real. The ppm value comes from the NOAA Mauna Loa record and is updated at build time. "Up to 100×" comes from the preprint. Run times in chapter 3 are labelled as typical values.
- The chapter 4 grid is illustrative, but the step is correct: the 3D cells and the single VE cell of each column come from the same plume thickness. The block never changes its height.
- The cell and column counts in chapter 4 are the real counts of the grid on screen.
- Chapter 5 is the real model, not an animation.

## Geology

The cutaway is generic but correct for the central North Sea. It uses no formation names. The vertical scale is 5 times the horizontal scale, and the depth axis says so.

| From the top | Depth (approx.) | Drawing |
|---|---|---|
| Sea | 0–100 m | Flat dark sea, with the platform on top |
| Young sands and clays | 0.1–0.8 km | Thin, flat layers |
| Mudstone | 0.8–1.4 km | Thick, quiet layer |
| Chalk | 1.4–1.8 km | Pale layer that follows the dome a little |
| Shale caprock | 1.8–2.0 km | Dark layer that follows the dome |
| Reservoir sandstone | 2.0–2.1 km at the crest (100 m thick) | The dome, with two or three thin shale layers inside |
| Older rock | below 2.2 km | Plain base |

- **The dome** is an anticline. Its crest is above the well, a little off centre, so the CO₂ has a short path up-dip.
- **The fault** cuts one flank and offsets every layer below the chalk. A short label names it.
- **The gas cap** fills the crest of the sandstone down to a flat gas–water contact at the start. It has its own colour (methane). Below the contact, the pore fluid is brine and the sandstone keeps its rock colour.
- **The CO₂** has its own colour. The well is on the flank, below and away from the gas–water contact, so the plume and the gas cap stay apart during the run.

**One geometry for all chapters.** `story-geometry.js` holds the one scenario (`STORY_SCENARIO`): the dome, the fault, the initial gas–water contact and the well. The chapter 2 section (`storySection`), the chapter 3 and 4 grid (`storyGrid`, `storyColumns`) and the chapter 5 model all read it. `assets/story-run.json` stores the run at fixed years, and a test keeps it equal to a fresh run. To keep the CO₂ plume and the gas cap apart while the cap still moves visibly, the scenario uses a closed boundary, 25 mD permeability, a 100 m reservoir and 0.5 Mt/yr for 30 years. The closest approach of the two gases is 2 km.

**Methane in the two-phase model.** The physics stays gas–brine. Methane is the same light phase as CO₂, with the same equations, density and viscosity. Only its colour is different.
- **Start state.** Each column under the crest starts with gas from the caprock down to the contact: `h = hMax = clamp(contact − top, 0, H)`. This needs a new scenario input in `ve2d-model.js`, for example `gasContactDepth`.
- **Colour.** A passive tracer gives the methane fraction of the gas in each column. It moves with the gas face fluxes that `stepTransport` already computes, with upwind values. Fault leakage, boundary outflow and dissolution remove both gases in proportion. The tracer does not change the flow.
- **Motion.** The gas cap moves with the pressure response from injection, because the gas flux already depends on the total velocity from the pressure solve.
- **Meeting.** The CO₂ plume and the gas cap do not need to meet during the run. If they meet, the tracer still keeps each gas correct, and the column shows a mixed colour.
- **Inventory.** The CO₂ inventory and its mass balance count only the CO₂ part of the gas. The page shows no methane mass, because the model gives methane the properties of CO₂.
- **Tests.** The current mass-balance tests stay green with no gas cap. New tests check that injected CO₂ equals the sum of the CO₂ classes with a gas cap, and that the methane volume stays constant when nothing leaves the model.
- **Later.** Real methane properties and CO₂–methane mixing (the three-phase model) are a later step.

## Art direction

**Chosen: C, textbook cutaway.** Flat colour, like the block diagrams in a geology textbook. It is clear for visitors without a geoscience background, and it is easy to read on a phone. The style board keeps A and B as a record.

| Role | Token (draft) | Value |
|---|---|---|
| Sky | `--story-sky` | `#c9d6dc` |
| Sea | `--story-sea` | `#2f5866` |
| Land | `--story-land` | `#c9b26b` |
| Sandstone | `--story-sand` | `#d8a657` |
| Shale | `--story-shale` | `#8c7f70` |
| Chalk | `--story-chalk` | `#ece6d6` |
| CO₂ (data only) | `--story-co2` | `#3b6cf0` |
| Methane gas cap (data only) | `--story-ch4` | `#c8463d` |
| Ink | `--story-ink` | `#1f2a30` |
| Cell grid | `--story-grid` | `#fff4df` |

**Type.** Literata for headings, captions and body text. One family, with italic for labels on the art.

**Rules.**
- CO₂ is the only saturated blue. The sea uses a dark, grey-blue so that the two never mix.
- Methane is brick red. Red and blue stay different for the common types of colour blindness. Each fluid also has a label the first time it appears.
- Flat colour only. Each face of a block has a fixed light and dark tone. There are no gradients and no shadows.
- The cell grid is a light line on the rock. In chapter 4, the grid is the thing that changes, so it must be clear at all sizes.
- Captions use sentence case and plain words.

**Rejected.** A (survey chart) and B (time-lapse seismic). B does not match the research, which does not use seismic data, and its trace Earth does not look good.

## Architecture

- **Stage.** One `position: sticky` stage inside a tall scroll container. A scroll listener writes `progress` once per animation frame. No new library is necessary.
- **Pure chapter functions.** Each chapter is a pure function from `progress` to a state object, for example `orbitState(p)` and `collapseState(p)`. Node tests check these functions, in the same way as the current hero helpers.
- **Rendering.** Chapters 0–4 draw on one 2D canvas, with HTML captions on top. The grid in chapters 3–4 has about 600 cells, so WebGL is not necessary. Chapter 5 uses `ve2d-model.js` in a worker on the coarse grid (40 × 24).
- **Coastlines.** Natural Earth land at 1:110 m, as a small static file in `assets/`. No CDN request at run time.
- **Build.** New components go into `bundle.js` through `build.js`, as now. The current `SubsurfaceHero.jsx` and `GeologicalDescent.jsx` are removed when the story ships.
- **Archive.** The tag `homepage-archive-2026-10` (commit `c9cc5f5`) keeps the old homepage exactly as it was on main on 2026-10-17. To see it, check out the tag and serve the folder. To bring it back, restore its files from the tag.

## Accessibility and motion

- With `prefers-reduced-motion`, the story becomes six static frames, each with its caption. The camera does not move.
- The captions are real text in reading order. The canvas is `aria-hidden`.
- The skip control and the chapter 5 controls work with the keyboard and show a visible focus ring.
- On a phone the story uses a simpler camera path and fewer cells. The six messages stay the same.

## Success criteria

| Area | Criterion |
|---|---|
| Speed | On a throttled phone (1.6 Mbps, 150 ms RTT, 4× CPU), the name and the first caption paint by 2.5 s. |
| Weight | The homepage transfer is at most 0.9 MB before the visitor scrolls. |
| Runtime | The story uses no script time when the tab is hidden. Scroll stays at 60 fps on a mid-range laptop. |
| Physics | In chapter 5, injected CO₂ equals the sum of the inventory classes, as in the current tests. |
| Accessibility | axe-core reports 0 violations at 390 px and 1440 px. |
| Mobile | At 390 px nothing scrolls horizontally and no caption overlaps the art. |
| Errors | No console errors or failed requests on the three pages. |
| Tests | All existing tests stay green until the cleanup in phase 7. In phase 7, the tests of the old hero and descent go together with their files: `hero-model`, `hero-sky`, `hero-name`, the bedding test in `hero-geology`, `geological-descent`, the hero lines in `site-smoke.js`, and test 3 in `site-tokens`. The archive tag keeps them. New tests cover the chapter functions. |

## Phases

1. **Choose the art direction.** Done: C.
2. **Storyboard frames.** Make one static mockup per chapter in the chosen style, then get approval.
3. **Scroll engine.** Pinned stage, `progress`, chapter mapping, skip control, reduced-motion frames and tests.
4. **Geometry and chapters 4 and 5.** The shared scenario (dome, fault, gas–water contact), the gas-cap start state and the methane tracer with their tests, the merge of the vertical cells and the live VE block. These chapters are the core message, so they come first.
5. **Chapters 0 to 3.** Orbit, descent, the geological cutaway and the rock-to-grid step.
6. **Sections and CV.** Apply the new tokens to the content below the story.
7. **Cleanup, QA and release.** Remove the old hero and descent files, their tests and their CSS (see Tests in the success criteria), and update the README. Then check mobile, speed, weight, accessibility, smoke tests and the `?v=N` bump on all three pages, and open a PR.

## Open questions

1. Does the new style also apply to the sections, the CV and the header, or only to the story?
2. Does the simulator page stay as it is now?

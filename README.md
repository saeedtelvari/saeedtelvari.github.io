# Sa'eed Telvari — personal site and VE simulator

The homepage, the story page, the CV and the browser-based VE simulator of Sa'eed Telvari, PhD candidate in Petroleum Engineering at Heriot-Watt University.

React 18 (UMD) components. Babel precompiles them into three bundles. There are two looks:

- The homepage, the CV and the simulator use the dark "Earth night" look.
- The story page uses a light flat look: art direction C, the textbook cutaway.

---

## Pages

1. **Homepage (`index.html`).** This is the restored earlier design. The tag `homepage-archive-2026-10` keeps the original.
   - **Hero (`SubsurfaceHero.jsx`).** A moonlit offshore platform above a live vertical-equilibrium (VE) section of CO₂ injected into a faulted saline aquifer. It has two buttons: "Open the VE simulator" (primary) and "How VE models work" (the story page).
   - **Hero model (`hero-geology.js`).** The page, `hero-simulation-worker.js` and the tests share it. It is a conservative sharp-interface VE model:
     - residual-trapping hysteresis;
     - fault contacts that balance the gas-water level;
     - fault leakage into an overlying aquifer once the mobile column passes the fault rock's entry height;
     - a 30-year injection followed by migration to year 2000.
   - **Hero display.** The player shows the CO₂ inventory (mobile, residual, leaked). The depth axis is linear below an explicit break. Playback pauses off-screen and does not autoplay under reduced motion.
   - **Sections (`HomeSections.jsx`).** Research with recent activity, projects, publications (DOIs and BibTeX) and contact. They sit on a geological descent (`GeologicalDescent.jsx`) that continues the hero's rock down to the basement.
   - **Wording.** The text of the MuPSI case study is "field-scale case study", as in `site-content.js`.
2. **Story page (`ve-story.html`, "How VE models work").** A scroll story in seven stages, from orbit to a live VE model.
   - **Stage.** The stage stays pinned for seven screens. One value, `progress`, from 0 to 1, sets the camera, the time and the captions. The visitor can scroll back to replay a step. The story removes detail in steps, and it keeps one dome, one fault and one gas cap from start to end. It names no company. The map of the North Sea names projects only.
   - **Skip and rail.** A "Skip to the end" link is always on screen while the story is pinned. It goes to the end panel. A seven-part rail shows the progress. When the stage starts to leave, the rail fades out and the link leaves with the stage.
   - **End panel.** One short panel follows the live stage. It has three links: "Back to the homepage", "Open the VE simulator" and "Read the publications". It has no copy of the homepage sections.
   - **Header and footer.** The header is clear over the pinned story (ink text on the light sky) and a solid bar after it. The footer is small and in the same look.
   - **Reduced motion.** The story becomes seven static frames, each with its caption. The camera does not move.
3. **CV (`cv.html`, `CVPage.jsx`).** One document in the dark look. It prints black on white. Every fact comes from `site-content.js`, which the homepage shares.
4. **VE simulator (`simulator.html`, `SimulatorPage.jsx`, `SimViews.jsx`, `SimCharts.jsx`, `GuidePage.jsx`).** The address is still `simulator.html`. Only the name text changed.
   - **Model.** One SI vertical-equilibrium (VE) model (`ve2d-model.js`) drives a structure map, a WebGL block diagram (`sim-block3d.js`) and a geological section.
   - **Physics.** Hysteretic residual trapping, a compressible pressure solve during injection, faults with throw and threshold-gated leakage, convective dissolution and spill-point trap analysis.
   - **Inventory.** Six classes, with the mass-balance error shown.
   - **Uncertainty.** Latin hypercube sampling in a worker, with P10/P50/P90 and a tornado.
   - **Sharing and display.** Share links, CSV exports, night and day themes, and five palettes.
   - **Method guide.** `simulator.html#method` opens the Method guide directly.

## The seven stages of the story page

| # | Chapter | What the visitor sees |
| --- | --- | --- |
| 0 | Orbit | The Earth from orbit, with the North Sea near the top of the disc. A ppm counter goes from 280 to the current value. |
| 1 | North Sea map | The map card grows into a large map of the southern and central North Sea. Grey points are the gas fields that no longer produce. Then come the outlines of the project fields, the markers and the names of the CO₂ storage projects. A key and the attribution are on the map. A list ("Map data and sources") gives each project with its status and its source. |
| 2 | Descent | The layers of the map fade out. The map zooms to the example site of the story, and the camera goes down to one offshore platform. |
| 3 | Into the rock | A cutaway of the rock under the platform. It ends on a depleted gas field: a sandstone dome with a methane gas cap, brine below, and a fault on one flank. |
| 4 | Rock to grid | A 3D grid draws onto the dome. Then a 3D run starts: the CO₂ plume grows near the well and the gas cap moves a little. |
| 5 | 3D to VE | The horizontal cell boundaries fade out. The rock keeps its full thickness. Each column becomes one cell with a sharp gas interface at depth *h*. |
| 6 | Live VE | The same dome and fault run live in the browser with `ve2d-model.js`. The visitor can play, pause and scrub the years. Then the end panel follows. |

The spec is `docs/superpowers/specs/2026-10-25-homepage-story-design.md`.

## Bundles and page load

`node build.js` makes three bundles. A page loads only the bundles that it needs.

| Bundle | Source files | Loaded by |
| --- | --- | --- |
| `bundle.js` | `Primitives.jsx`, `site-content.js`, `Header.jsx`, `Footer.jsx`, `hero-geology.js`, `SubsurfaceHero.jsx`, `GeologicalDescent.jsx`, `HomeSections.jsx`, `CVPage.jsx`, `App.jsx` | All four pages. It is last on each page. |
| `story-bundle.js` | `story-content.js`, `ve2d-model.js`, `story-geometry.js`, `StoryStage.jsx`, `StoryChapters.jsx`, `StoryEarth.jsx`, `StoryFields.jsx`, `StoryRock.jsx`, `StoryBlock.jsx`, `StoryPage.jsx` | `ve-story.html` only, before `bundle.js`. |
| `simulator-bundle.js` | `ve2d-model.js`, `sim-block3d.js`, `GuidePage.jsx`, `SimCharts.jsx`, `SimViews.jsx`, `SimulatorPage.jsx` | `simulator.html` only, before `bundle.js`. |

`bundle.js` and `story-bundle.js` have no comments and no extra white space. `index.html` does not load `story-bundle.js`, `story.css`, the story JSON files or `land-110m.json`. `App.jsx` works on a page where `story-bundle.js` is absent.

## Styles

- `colors_and_type.css` is the dark look. The homepage, the CV, the simulator and the shared header and footer use it.
- `story.css` is style C. Only `ve-story.html` loads it, after `colors_and_type.css`, and only that page has the class `site-c` on `<html>`. Rules that change a shared part (body, buttons, skip link, header, footer) start with `.site-c`, so they override the dark rules on that page only. The story rules have names that no other page uses.
- `tests/site-style.test.js` pins the border between the two files and keeps the shared rules unchanged.

## Repository structure

| Path | Role |
| --- | --- |
| `index.html`, `ve-story.html`, `cv.html`, `simulator.html` | Page entries. `App.jsx` picks the component from `data-page` on `#root`. |
| `colors_and_type.css` | The dark look: site tokens (the simulator's Earth night `--sim-*` values, kept identical by `tests/site-tokens.test.js`), base elements, hero, descent, sections, CV, header, footer and print. |
| `story.css` | Style C, for the story page only: the `--story-*` tokens, the story, its controls, the end panel, and the light header and footer. |
| `simulator-workbench.css` | The simulator's layout and its five palettes × night/day. |
| `site-content.js` | Links, publications (verified DOIs, BibTeX), activity, projects and CV data. |
| `story-content.js` | The words and the ppm numbers of the story (`SITE_STORY`). |
| `Primitives.jsx` | Inline SVG icon set (`Icon`). |
| `Header.jsx`, `Footer.jsx` | Shared navigation. The site variant is transparent over the hero. On the story page (`story` prop) it is clear over the pinned story and a solid bar after it. The workbench variant is the simulator's bar. |
| `hero-geology.js`, `hero-simulation-worker.js`, `SubsurfaceHero.jsx` | The hero's geometry, model and rendering. |
| `GeologicalDescent.jsx` | The rock behind the homepage sections. |
| `StoryPage.jsx` | The story page: the header, the stage, the end panel and the footer. |
| `StoryStage.jsx` | The pinned stage. It has the `progress` value, the chapter map, the captions, the skip link, the rail and the reduced-motion frames. The renderer API is in the first lines of the file. |
| `StoryChapters.jsx` | Placeholder art for each chapter. The art files below replace the placeholders. |
| `StoryEarth.jsx` | The art of chapters 0 and 2, and the camera of chapter 1: the globe, the map card, the large map and the platform. |
| `StoryFields.jsx` | The layers of chapter 1: the grey points, the outlines, the markers, the names, the key and the attribution. It places the names so that they do not overlap. It also has the list "Map data and sources". |
| `StoryRock.jsx` | The art of chapter 3: the cutaway. |
| `StoryBlock.jsx` | The art of chapters 4 to 6: the 3D grid, the VE columns and the live block with its controls. |
| `story-geometry.js` | The one scenario of the story (dome, fault, gas cap, well) and the section, grid and columns that come from it. The page, the worker, the precompute tool and the tests all read it. |
| `story-worker.js` | Runs the scenario once in a Web Worker for chapter 6. |
| `assets/story-run.json` | The stored run for chapters 3 to 5, at fixed years. A test keeps it equal to a fresh run. |
| `tools/story-precompute.js` | Writes `assets/story-run.json`. |
| `assets/land-110m.json` | The coastlines of chapters 0 to 2, as TopoJSON. They come from Natural Earth (public domain) at 1:110 m, through the `world-atlas@2.0.2` package. The page loads the file from this repository. It uses no CDN at run time. |
| `assets/north-sea-ccs.json` | The data of chapter 1: the gas fields that no longer produce, the outlines of the project fields and the projects (name, status, year, place, source). It has no company name. `tools/north-sea-map.js` makes it from the public map services of NSTA (UK) and NLOG (NL) and from `tools/north-sea-projects.json`. See the end of `docs/superpowers/specs/2026-10-28-north-sea-ccs-map-research.md`. |
| `ve2d-model.js` | The VE model. The simulator, the live chapter and the tests share it. |
| `HomeSections.jsx`, `CVPage.jsx`, `App.jsx` | The homepage sections, the CV and the page entries. |
| `sim-block3d.js`, `SimulatorPage.jsx`, `SimViews.jsx`, `SimCharts.jsx`, `GuidePage.jsx`, `simulation-worker.js` | The VE simulator. |
| `bundle.js`, `story-bundle.js`, `simulator-bundle.js` | Generated by `node build.js`. Do not edit. |
| `assets/` | Logo, favicons, the story data files, six geology textures (see `docs/geology-textures.md`), the project image and the social cards. |
| `docs/superpowers/` | Specs, plans and audits for the redesigns. |
| `tests/`, `tools/` | The tests, and the script that makes the stored story run. |

## The archive tag

The tag `homepage-archive-2026-10` (commit `c9cc5f5`) keeps the earlier homepage. The homepage of this site is that design again, with the newer content. To compare, check out the tag and serve the folder. To bring back one file, run `git checkout homepage-archive-2026-10 -- <file>`.

## Run locally

Serve the folder with any static server:

```bash
python -m http.server 8000
```

If Python is not installed, use Node:

```bash
npx http-server -p 8080 -c-1
```

Open `http://localhost:8000` (or `:8080`).

## Rebuild and test

After you change a source file, rebuild the three bundles and run the checks:

```bash
node build.js
node --test tests/*.test.js
node tests/site-smoke.js
```

`node build.js` loads the Babel compiler from cdnjs, so it needs a network connection. The tests that read `bundle.js` need a fresh build.

Assets use `?v=N` for cache busting. When `bundle.js` or `colors_and_type.css` change, bump the version on all four pages together. `tests/site-smoke.js` checks that they match. `story-bundle.js`, `story.css` and `simulator-bundle.js` have their own version, on the page that loads them.

If you change the story scenario or `ve2d-model.js`, write the stored run again:

```bash
node tools/story-precompute.js
```

## Update the ppm value

Do this before each release.

1. Open the NOAA file `https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt`.
2. Take the last row of a complete year.
3. Write its year and its mean in `SITE_STORY.co2` in `story-content.js`, as `year` and `value`.
4. Run `node build.js` and `node --test tests/*.test.js`.

The ppm line is then `280 ppm in 1850. {value} ppm in {year}.` The value is a whole number. The first caption says "more than 420 ppm". A test fails if the value is not above 420. In that case, change the caption.

## Social cards

- `assets/social-card.jpg` is the card of the homepage and the CV (the hero).
- `assets/social-card-story.jpg` (1200 × 630) is the card of the story page: the first frame of the story, with the name, the line and the globe. To make it again, serve the site and open `ve-story.html` in headless Chrome at 1200 × 630. Hide the header, the skip link and the rail. Wait for the ppm line to finish. Save the frame as JPEG. Keep the file under about 150 KB.
- `assets/social-simulator.jpg` is the simulator card.

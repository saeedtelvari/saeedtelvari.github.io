# Sa'eed Telvari — personal site and VE simulator

The homepage, the story page, the CV and the browser-based VE simulator of Sa'eed Telvari, PhD candidate in Petroleum Engineering at Heriot-Watt University.

React 18 (UMD) components. Babel precompiles them into three bundles. There are two looks:

- The homepage, the CV and the simulator use the dark "North Sea night" look. The simulator gets it from its default palette, `north-sea`.
- The story page uses a light flat look: art direction C, the textbook cutaway.

---

## Pages

1. **Homepage (`index.html`).** This is the restored earlier design. The tag `homepage-archive-2026-10` keeps the original.
   - **Hero (`SubsurfaceHero.jsx`).** A moonlit offshore platform above a live vertical-equilibrium (VE) section of CO₂ injected into a faulted saline aquifer. It has two buttons: "Open the VE simulator" (primary) and "How VE models work" (the story page).
     - **Source of the claim.** "Up to 100× faster" links to the preprint card (`#pub-ve-depleted-gas-2026`), as "(preprint, 2026)".
     - **Three doors.** Under the buttons, one line for each kind of visitor: "Reviewing my work? Papers and BibTeX", "Hiring? CV (PDF)", "Working on CCS? The method and its checks". On phones the line is short ("Papers & BibTeX · CV (PDF) · Method"); the questions stay for screen readers.
     - **Fast first paint.** `#app-loader` in `index.html` holds a static copy of the role, the name and the summary, with the same classes as the React hero. The visitor reads them before React runs. The loader is `aria-hidden`, so screen readers hear the text once. The Google Fonts stylesheet loads without blocking the render.
   - **Hero model (`hero-geology.js`).** The page, `hero-simulation-worker.js` and the tests share it. It is a conservative sharp-interface VE model:
     - residual-trapping hysteresis;
     - fault contacts that balance the gas-water level;
     - fault leakage into an overlying aquifer once the mobile column passes the fault rock's entry height;
     - a 30-year injection followed by migration to year 2000.
   - **Hero display.** The player shows the CO₂ inventory (mobile, residual, leaked). The depth axis is linear below an explicit break. Playback pauses off-screen and does not autoplay under reduced motion. The note says that this is a teaching model of a saline aquifer, and that the depleted-gas model is in the 2026 preprint. The last line gives the real run time of the hero model in the visitor's browser (`run.computeMs` from the worker). It never says "100×".
   - **Sections (`HomeSections.jsx`).** Research with recent activity, projects, publications (DOIs and BibTeX; each card has the id `pub-<id>`) and contact (with "CV (PDF)" and "CV (web)"). They sit on a geological descent (`GeologicalDescent.jsx`) that continues the hero's rock down to the basement.
   - **Wording.** The text of the MuPSI case study is "field-scale case study", as in `site-content.js`.
2. **Story page (`ve-story.html`, "How VE models work").** A scroll story in seven stages, from orbit to a live VE model.
   - **Stage.** The stage stays pinned for seven screens. One value, `progress`, from 0 to 1, sets the camera, the time and the captions. Each stage plays by itself after a scroll step; scrolling back shows the end state. The story removes detail in steps, and it keeps one dome, one fault and one gas cap from start to end. It names no company. The map of the North Sea names projects only.
   - **First screen.** The h1 is "How VE models work", shown as an eyebrow above the name. Under the ppm line are its source (NOAA, Mauna Loa annual mean) and "7 short steps, about 1 minute. Scroll, or press Play all."
   - **Chapters and Play all.** A chapter bar (`nav aria-label="Story chapters"`) names the seven stages. A click goes to a stage and plays it. "Play all" plays each stage, waits 1.5 s, then goes on to the next; any scroll, key or click stops it. On phones the bar shows "3 of 7 · Into the rock" with previous and next buttons. The art keeps clear of the measured caption block and of the bar.
   - **Skip.** A "Skip to the end" link is always on screen while the story is pinned. It goes to the end panel. `main#main-content` holds the whole story, so "Skip to content" lands at its start.
   - **Sources and text versions.** The VE caption has a source line for the speed-up (the 2026 preprint). Each stage has a visually hidden description of its figure (`SITE_STORY.descriptions`). The cell counter says "in this sketch", because the count depends on the screen width.
   - **End panel.** One short panel follows the live stage. It has three links: "Back to the homepage", "Open the VE simulator" and "Read the publications". It has no copy of the homepage sections.
   - **Header and footer.** The header is clear over the pinned story (ink text on the light sky) and a solid bar after it. The footer is small and in the same look.
   - **Reduced motion.** The story becomes seven static frames, each with its caption. The camera does not move. The chapter buttons jump to the frames, and "Play all" is not shown. The live frame has its controls (play, year slider, 3D cells) and does not autoplay.
3. **CV (`cv.html`, `CVPage.jsx`).** One document in the dark look. It prints black on white. Every fact comes from `site-content.js`, which the homepage shares. `assets/cv.pdf` is a printed copy: run `node tools/cv-pdf.js` after a change to the CV data.
4. **VE simulator (`simulator.html`, `SimulatorPage.jsx`, `SimViews.jsx`, `SimCharts.jsx`, `GuidePage.jsx`, `SimFirstRun.jsx`, `SimReport.jsx`).** The address is still `simulator.html`. Only the name text changed.
   - **Model.** One SI vertical-equilibrium (VE) model (`ve2d-model.js`) drives a structure map, a WebGL block diagram (`sim-block3d.js`) and a geological section.
   - **Physics.** Hysteretic residual trapping, a compressible pressure solve during injection, faults with throw and threshold-gated leakage, convective dissolution and spill-point trap analysis.
   - **Inventory.** Six classes, with the mass-balance error shown.
   - **Trust line.** The outcomes rail ends with "Educational VE model of a saline aquifer", a link to the Method verification and a "Cite this run" button. That button copies a citation with the scenario link and the date.
   - **Uncertainty.** Latin hypercube sampling in a worker, with P10/P50/P90 and a tornado.
   - **Sharing and display.** Share links, CSV exports, night and day themes, and six palettes. `north-sea` (the homepage colours) is the default; a stored choice wins.
   - **First-run guide (`SimFirstRun.jsx`).** Three short cards on the first visit (key `ve-simulator-guide-seen`), with the goal "Move the well so that nothing leaks in 1,000 years" (the default scenario leaks 5.2 %). The "Guide" button next to "Layers" opens it again. It takes the focus only when the visitor opens it with that button.
   - **Screening report (`SimReport.jsx`).** Export → "Screening report" opens a two-page A4 report to print or save as PDF: inputs, results at the final and current year, mass balance, figures, uncertainty, limitations and references with DOIs. The report and the Method tab share their text through constants in `GuidePage.jsx`.
   - **Method guide.** `simulator.html#method` opens the Method guide directly. KaTeX loads only when the Method tab opens.
   - **Icons.** The simulator uses the site's inline SVG icons (`Icon` in `Primitives.jsx`), not Font Awesome.

## The seven stages of the story page

| # | Chapter | What the visitor sees |
| --- | --- | --- |
| 0 | Orbit | The Earth from orbit, with the North Sea near the top of the disc. A ppm counter goes from 280 to the current value. |
| 1 | North Sea map | The map card grows into a large map of the southern and central North Sea. Grey points are the gas fields that no longer produce. Then come the outlines of the project fields, the markers and the names of the CO₂ storage projects. A key and the attribution are on the map. A list ("Map data and sources") gives each project with its status and its source. |
| 2 | Descent | The layers of the map fade out. The map zooms to the example site of the story, and the camera goes down to one offshore platform. |
| 3 | Into the rock | A cutaway of the rock under the platform. It ends on a depleted gas field: a sandstone dome with a methane gas cap, brine below, and a fault on one flank. |
| 4 | Rock to grid | A 3D grid draws onto the dome. Then a 3D run starts: the CO₂ plume grows near the well and the gas cap moves a little. |
| 5 | 3D to VE | The horizontal cell boundaries fade out. The rock keeps its full thickness. Each column becomes one cell with a sharp gas interface at depth *h*. |
| 6 | Live VE | The same dome and fault run live in the browser with `ve2d-model.js`. The visitor can play, pause and scrub the years. Two links follow: "Open the VE simulator" and "Read the publications". Then the end panel follows. |

The spec is `docs/superpowers/specs/2026-10-25-homepage-story-design.md`.

## Bundles and page load

`node build.js` makes three bundles. A page loads only the bundles that it needs.

| Bundle | Source files | Loaded by |
| --- | --- | --- |
| `bundle.js` | `Primitives.jsx`, `site-content.js`, `Header.jsx`, `Footer.jsx`, `hero-geology.js`, `SubsurfaceHero.jsx`, `GeologicalDescent.jsx`, `HomeSections.jsx`, `CVPage.jsx`, `App.jsx` | All four pages. It is last on each page. |
| `story-bundle.js` | `story-content.js`, `ve2d-model.js`, `story-geometry.js`, `StoryStage.jsx`, `StoryChapters.jsx`, `StoryEarth.jsx`, `StoryFields.jsx`, `StoryRock.jsx`, `StoryBlock.jsx`, `StoryPage.jsx` | `ve-story.html` only, before `bundle.js`. |
| `simulator-bundle.js` | `ve2d-model.js`, `sim-block3d.js`, `GuidePage.jsx`, `SimCharts.jsx`, `SimViews.jsx`, `SimFirstRun.jsx`, `SimReport.jsx`, `SimulatorPage.jsx` | `simulator.html` only, before `bundle.js`. |

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
| `simulator-workbench.css` | The simulator's layout and its six palettes × night/day. `north-sea` is the default; the Earth tokens stay in the base `.ve-standalone` block. |
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
| `tools/cv-pdf.js` | Prints `cv.html` to `assets/cv.pdf` with headless Chrome (`CHROME_PATH` or the default path). |
| `assets/land-110m.json` | The coastlines of chapters 0 to 2, as TopoJSON. They come from Natural Earth (public domain) at 1:110 m, through the `world-atlas@2.0.2` package. The page loads the file from this repository. It uses no CDN at run time. |
| `assets/north-sea-ccs.json` | The data of chapter 1: the gas fields that no longer produce, the outlines of the project fields and the projects (name, status, year, place, source). It has no company name. `tools/north-sea-map.js` makes it from the public map services of NSTA (UK) and NLOG (NL) and from `tools/north-sea-projects.json`. See the end of `docs/superpowers/specs/2026-10-28-north-sea-ccs-map-research.md`. |
| `ve2d-model.js` | The VE model. The simulator, the live chapter and the tests share it. |
| `HomeSections.jsx`, `CVPage.jsx`, `App.jsx` | The homepage sections, the CV and the page entries. |
| `sim-block3d.js`, `SimulatorPage.jsx`, `SimViews.jsx`, `SimCharts.jsx`, `GuidePage.jsx`, `SimFirstRun.jsx`, `SimReport.jsx`, `simulation-worker.js` | The VE simulator, its first-run guide and its screening report. |
| `bundle.js`, `story-bundle.js`, `simulator-bundle.js` | Generated by `node build.js`. Do not edit. |
| `assets/` | Logo, favicons, the story data files, six geology textures (see `docs/geology-textures.md`), the project image and the social cards. |
| `docs/superpowers/` | Specs, plans and audits for the redesigns. |
| `tests/`, `tools/` | The tests, the script that makes the stored story run, the North Sea map tool and the CV PDF tool. |

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

Assets use `?v=N` for cache busting. When `bundle.js` or `colors_and_type.css` change, bump the version on all four pages together. `tests/site-smoke.js` checks that they match. `story-bundle.js`, `story.css`, `simulator-bundle.js` and `simulator-workbench.css` have their own version, on the page that loads them. `tests/site-smoke.js` also pins the current `simulator-bundle.js` version: change it there when you bump it.

If you change the story scenario or `ve2d-model.js`, write the stored run again:

```bash
node tools/story-precompute.js
```

If you change the CV data or `CVPage.jsx`, print the CV PDF again (it needs a fresh `bundle.js`):

```bash
node tools/cv-pdf.js
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

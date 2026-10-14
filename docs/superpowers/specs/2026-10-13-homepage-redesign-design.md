# Homepage redesign — design spec

Date: 2026-10-13. Branch: `redesign/homepage` (from origin/main `b0d87fb`). Findings: [homepage audit](2026-10-13-homepage-audit.md). Mockups: [2026-10-13-homepage-mockups/](2026-10-13-homepage-mockups/).

## Intent

**Outcome.** A visitor from reservoir engineering or CCS should know within five seconds who Sa'eed Telvari is: a PhD candidate at Heriot-Watt who builds vertical-equilibrium (VE) models of CO₂ storage in depleted gas fields. They should see that work in a live, physically honest VE section. From there the page leads to the CO₂ storage simulator, the publications, the CV and contact details. The homepage, the CV and the simulator should read as one family.

**Audience.** Researchers and supervisors in reservoir simulation, CCS practitioners, prospective collaborators and recruiters. Most read on laptops and phones. Some will look closely at the physics.

**User decisions (2026-10-13).**
- Theme: Earth night only. The homepage and CV adopt the simulator's Earth night tokens and CO₂ class colours. There is no theme or palette switching on the homepage.
- Carry over draft content D1–D6 (teaching, MuPSI project, MRST fault-detection tool, service, training, skills), D8 (preprint under review at *Geoenergy Science and Engineering*), and D9–D10 (news items and plainer copy).
- Leave out the older entrance-exam honours (D7).
- Call the IGE GeoEnergy Seminar Series talk a seminar talk, never "invited".
- Both awards stay "runner-up": the SPE Aberdeen bursary (£1,000 awarded) and the EAGE hackathon (team runner-up).
- Remove "100–400×" from the SPE paper entirely. That number belongs to another paper.

**Success criteria (each is measured in the final QA).**

| Area | Criterion |
| --- | --- |
| Accuracy | Every DOI resolves to its paper (Crossref). The SPE DOI is `10.2118/231836-PA`. |
| Physics | In the hero model, injected CO₂ equals mobile + residual + leaked to 1e-9 relative, across 100 random geologies. No column exceeds its capacity. Depth ticks below the axis break are linear. Layers are named correctly. A legend is shown. Injection lasts 30 years. |
| Runtime | The hero uses 0 ms of script when it is off-screen or the tab is hidden. It averages under 80 ms of script per second while playing. |
| Weight | Homepage transfer is at most 0.9 MB (was 2.7 MB). CV transfer is at most 0.5 MB (was 6.8 MB). |
| Speed | On a throttled phone (1.6 Mbps, 150 ms RTT, 4× CPU) the name and summary paint by 2.5 s (was 3.9 s). |
| Errors | No console errors or failed requests on `index.html`, `cv.html` and `simulator.html`. |
| Look | No mint/teal or purple in chrome. Amber is the only interactive accent, and other colour appears only on CO₂ data. |
| Mobile | At 390 px nothing scrolls horizontally and no hero labels overlap. At 834 px the name sits on its own line. |
| Accessibility | axe-core reports 0 violations on the homepage and CV at both widths. |
| Simulator | `simulator.html` looks the same as before (before/after screenshots) apart from the shared header, which is unchanged in the workbench variant. |
| Tests | All 83 existing tests stay green, and new tests cover the hero model, navigation, content facts and tokens. |

## Visual system

### Tokens

`colors_and_type.css` defines the simulator's Earth night tokens on `:root` under the **same names** (`--sim-*`), copied from the `.ve-standalone` block in `simulator-workbench.css`. A test asserts the values match, so the two pages cannot drift. Inside `simulator.html` the `.ve-standalone` element redefines them for its own palette, so nothing changes there.

| Role | Token | Earth night |
| --- | --- | --- |
| Ground | `--sim-bg` | `#120e0b` |
| Surfaces | `--sim-surface`, `--sim-surface-2`, `--sim-surface-3` | `#1a1511`, `#221c17`, `#2c241d` |
| Rules | `--sim-rule`, `--sim-rule-strong` | `#352b23`, `#4a3c30` |
| Ink | `--sim-ink`, `--sim-ink-muted`, `--sim-ink-faint` | `#f4ede3`, `#bcae9c`, `#8d7f6e` |
| Accent (interactive only) | `--sim-accent`, `--sim-accent-ink`, `--sim-accent-soft`, `--sim-focus` | `#e8a15a`, `#1e1206`, `rgba(232,161,90,.14)`, `#e8a15a` |
| CO₂ classes (data only) | `--sim-c-free` / `--sim-glow-free`, `--sim-c-residual` / `--sim-glow-residual`, `--sim-c-leaked` / `--sim-glow-leaked` | `#00a392` / `#38e8d1`, `#c1628a` / `#ff99c2`, `#d64a33` / `#ff6247` |
| Rock | `--sim-rock-over`, `--sim-rock-cap`, `--sim-rock-aquifer`, `--sim-rock-base` | `#17120e`, `#5e5348`, `#59402e`, `#2a140a` |

**Rules**
- Chrome (header, buttons, rules, text) uses only ink, surfaces and amber.
- The sky stays a night sky: blue is representational there, not chrome.
- The mint, teal, aubergine, indigo and lilac values are deleted, and a test fails if any of them returns to homepage sources.

### Type

| Face | Weights | Use |
| --- | --- | --- |
| Montserrat | 600, 700 | The name and headings, as in the simulator (`--sim-font-head`) |
| Open Sans | 400, 600 | Body and UI (`--sim-font-ui`) |
| JetBrains Mono | 400, 500 | Numbers that are data: depths, years, dates, DOIs (`--sim-font-mono`) |

Arizonia and the unused weights are no longer loaded.

| Style | Size / line height |
| --- | --- |
| Body | 16/1.7 |
| Lead | 18/1.65 |
| h2 | 30/1.2 (phone 26) |
| h3 | 19/1.35 |
| Small | 13.5 |
| Mono data | 12.5 |
| Minimum on screen | 12 |

Text is sentence case: no all-caps eyebrows, no letter-spaced labels and no "A · B · C" meta strings. Prose stays under 72 ch.

### Shape and motion

- **Radius:** one radius per level. Sheets are 14 px, buttons and inputs 10 px, and chips are fully round.
- **No glass:** no backdrop blur except the fixed header once it is scrolled, where it is legibility over moving content.
- **One orchestrated moment:** the hero, with its name reveal and simulation.
- **Sections:** no scroll-reveal fade-ins. Content is visible immediately; the `Reveal` wrapper is removed.
- **Interaction:** feedback uses `--sim-ease` (`cubic-bezier(0.23,1,0.32,1)`): 160 ms for press and colour, 200 ms for the drawer.
- **Reduced motion:**
  - The hero starts paused on an informative frame (year 400), with the play button available.
  - Clouds, rain and twinkling stop.
  - Hover parallax is off.

## Page structure

```
index.html
├─ Header (fixed; transparent over the sky, Earth surface once scrolled)
├─ <main>
│  ├─ Hero — sky (identity) + live VE section (figure, player, legend)
│  └─ GeologicalDescent (tuned cutaway)
│     ├─ #research    Research — lead, three themes, methods, background | Recent activity
│     ├─ #projects    Projects — CO₂ storage simulator (feature), MuPSI, 3D fault detection for MRST
│     ├─ #publications Publications — all four, newest first
│     └─ #contact     Contact — email, profiles, address
└─ Footer (outside <main>, still drawn on the basement rock)
cv.html → CV document (own URL, title, description; index.html#cv redirects here)
simulator.html → unchanged except header link targets, bundle version, social card, #method deep link
```

Navigation, in this order for the header, drawer and footer: **Research, Projects, Publications, Simulator, CV, Contact**. The logo goes home. "Simulator" opens `simulator.html`. "CV" opens `cv.html`. A single scroll spy in `App.jsx` (IntersectionObserver on the four section ids) sets the active item. The header no longer runs its own spy.

## Hero

Mockup: [hero, recommended vs alternative](2026-10-13-homepage-mockups/hero.webp) and [phone](2026-10-13-homepage-mockups/hero-phone.webp).

**Identity (in the sky, top left)**
- Role line, sentence case, `--sim-ink-muted`, 15 px: *PhD candidate, Heriot-Watt University*.
- Name: keep the contour reveal and hover light exactly as they are now.
- Summary, 17 px, at most 46 ch per line: *I build vertical-equilibrium models of CO₂ storage in depleted gas fields: reduced-order simulators that run up to 100× faster than full 3D compositional models.*
- Actions:
  - Primary, amber fill: **Open the CO₂ simulator** → `simulator.html`.
  - Secondary, outline: **Read my CV** → `cv.html`.
- Profiles: a row of five neutral icon links with accessible names: Google Scholar, ORCID, GitHub, LinkedIn, Email. Each is a 40 px target, ink-muted, ink on hover.
- The role line, name, summary and actions stack vertically at every width. This fixes the 834 px collision.

**Scene: the same composition, recoloured and corrected**
- *Sky, moon, clouds, rain, Highland landscape and field site* stay. The dashed mint horizon becomes a hairline at the ground surface (`--sim-ink`, 0.25).
- *Rock* follows the simulator's section view at night:
  - Overburden: `--sim-rock-over`, with faint bedding.
  - Caprock and seals: a darkened `--sim-rock-cap` shale pattern.
  - Storage aquifer and overlying aquifer: a darkened `--sim-rock-aquifer` sandstone pattern. Brine is the rock colour, exactly as in the simulator.
  - Underburden: `--sim-rock-base`, with the shale photo texture fading into the descent.
  - The purple and navy fills are removed.
- *CO₂ is drawn in its class colours*, the same as the simulator legend:
  - Mobile plume: `--sim-glow-free` → `--sim-c-free` gradient, from roof to roof + **h** (mobile thickness).
  - Residual CO₂: `--sim-c-residual` hatching, from roof + h to roof + h<sub>max</sub>.
  - CO₂ that leaked into the overlying aquifer: `--sim-c-leaked` → `--sim-glow-leaked`.
  - A leaking fault segment: `--sim-glow-leaked`, with moving dashes timed to the simulation clock (already implemented).
- *Well:* an ink line with perforation ticks, as in the simulator. While injection runs (years 0–30) a `--sim-glow-free` dash moves down the tubing and the surface feed line pulses. Both stop when injection stops, so the motion says *injecting*. The status lamp on the wellhead does the same.
- *Faults:* ink lines at 0.35 opacity, labelled F1 and F2 at the top of the section.
- *Layer labels* sit on the right, 12 px, sentence case, with a text halo: Overburden, Overlying aquifer, Caprock, Storage aquifer, Underburden. They are placed by computed depth. On phones Overburden is hidden, and the others are shortened only if they collide with the well. The "Brine" label is removed.
- *Depth axis* on the left:
  - "0 m" at the surface, then an axis break (two short slashes).
  - Below the break the axis is linear: 3.0 m per SVG unit from 800 m at y = 28, so ticks fall at 1000, 1500 and 2000 m.
  - The unit sits in the axis title: "Depth (m)".
  - The reservoir roof therefore sits at about 1.0–1.3 km and its base at about 1.6–1.9 km, which are realistic depths for dense-phase CO₂.

**Player (bottom left, beside the axis): a figure caption with controls**
- Line 1: *Live VE model, year 412*, with the phase in muted text: *injecting* during years 0–30, *migrating* after.
- Line 2: the inventory bar. It has three segments in class colours, labelled with percentages of injected CO₂: mobile, residual, and leaked into the overlying aquifer. This is the same idea as the simulator's "Where the CO₂ is" bar.
- Line 3: play/pause, a scrubber with the injection period shaded, restart, and speed (1×, 2×, 4×). Every control has an accessible name.
- Line 4, 12 px muted: *Schematic saline aquifer, 10 km wide, vertical exaggeration ×N.* This says plainly what the section shows. N is measured from the rendered size, so it reads about ×2 on desktop and about ×6 on phones.
- **Phone:** one compact row (play, year and phase, inventory bar) 16 px above the bottom edge. The scale note is hidden.
- The **annotation box, the "Scroll" cue and the developer name-preview switcher are removed.**

**Playback**
- The simulation autoplays once and stops at year 2000. There is no endless loop.
- Speed is variable: 8 years per second during injection, easing to 60 years per second after year 40. The whole story takes about 37 s; 2× and 4× scale this.
- A `requestAnimationFrame` clock replaces the 50 ms interval.
- Playback pauses while the hero is off-screen or the tab is hidden.
- Under reduced motion the hero does not autoplay. It shows year 400.

## The hero model (physics)

The solver stays a 1-D sharp-interface VE model on 200 cells across two layers (storage and overlying aquifer), joined at the two faults. One implementation in `hero-geology.js`, `HeroGeology.simulate(geology)`, is used by the worker, by the no-Worker fallback and by Node tests, replacing the two copies.

1. **State.** Each cell holds `S`, the CO₂ volume per unit area divided by porosity (the conserved quantity), and `hMax`, the deepest historical interface. The mobile thickness is h = min(S, max(0, (S − R·h<sub>max</sub>)/(1 − R))), so S = h + R·(h<sub>max</sub> − h). Updating h<sub>max</sub> ← max(h<sub>max</sub>, S) is exact (the existing hysteresis rule): wherever S reaches h<sub>max</sub>, the whole swept column is mobile.
2. **Flux.** Flux between cells is q = −K·h<sub>up</sub>·∂(z<sub>roof</sub> + **h**)/∂x. The potential uses the mobile interface, not S. Upwinding is on h.
3. **Capacity.** A cell cannot hold more than its local thickness. Transfers are limited so that a receiving cell does not overfill and a donor does not go below zero. What does not fit stays in the donor, so every transfer is conservative. No clamp ever discards CO₂.
4. **Faults.**
   - The existing volume-conserving contact balance (`balanceFaultContact`) is kept.
   - Leakage starts when the **mobile** column at the fault cell exceeds the fault rock's entry height.
   - It moves `min(h − h_entry, rate·dt)` into the overlying aquifer **1:1**, limited by room in the receiving cell and spilled to its neighbours if that cell is full.
   - The ×1.5 factor is removed.
5. **Injection.**
   - Years 0–30, at a constant rate.
   - The total volume (about 260 cell-units, tuned by eye) is chosen so the final plume reaches the same visual extent as today.
   - The rate is spread over five cells around the well; any part that does not fit spills to the nearest cells with room.
6. **Time step.** Sub-steps adapt so that K·h<sub>max mobile</sub>·dt ≤ 0.4 (explicit stability), with at least 10 per year.
7. **Output.** Annual frames go into `Float32Array`s (S, h, h<sub>max</sub> for both layers, and fault flow), plus an inventory per frame (mobile, residual, leaked, injected). The worker transfers the buffers instead of structured-cloning arrays of arrays.
8. **Rendering.** `HeroGeology.section(geology)` precomputes, once per geology, the roof and floor of both layers at every node, with left and right values at faults. Every path builder reads these arrays, so no trigonometry runs per frame. The static layers are memoised; per frame, only the plume group re-renders.

**Tests** (`tests/hero-model.test.js`):
- Conservation and capacity over 100 seeded geologies.
- No leak below the entry height; leakage starts after the column passes it.
- Injection ends at year 30.
- The mobile thickness never exceeds S or capacity, and h = S where S = h<sub>max</sub>.
- The worker and the in-page fallback produce identical frames.
- Depth ticks are equally spaced below the break.

## Sections

Mockups: [sections, recommended vs alternative](2026-10-13-homepage-mockups/sections.webp).

**Descent (recommended: tuned cutaway).** Keep the geological descent: scrolling down still means going down through the column.
- *Weight:* the six textures become 640 px WebP at about 60–90 KB each, loaded only when the descent comes within one viewport.
- *Colour:* the reading veil becomes Earth (`#120e0b`, 0.55–0.7) instead of slate, which brings the ochre and pink rock into the Earth family.
- *Bugs:* the ResizeObserver race is fixed by capturing the root element. The descent handles any number of sections instead of exactly three.
- *Alternative B, shown in the mockup:* a lithology log track down the left edge with content on plain Earth surfaces. It is lighter still, but it replaces the cutaway you built, so it is not the default.

**Sheets.** Each section's content sits on one Earth sheet: `--sim-surface` at 0.94, a 1 px `--sim-rule` border, 14 px radius, 40–48 px padding on desktop and 20 px on phones. There are no cards inside sheets. Structure comes from headings, hairline rules and columns.

### Research (`#research`)

The heading "Research". Desktop uses two columns, about 62/38; phones use one.

**Left column**
- Lead paragraph (D10): *I'm a PhD candidate in Petroleum Engineering at Heriot-Watt University. I study how injected CO₂ migrates through depleted gas reservoirs, and how to simulate it quickly at field scale.*
- Body paragraph: *My main tool is the vertical-equilibrium (VE) model, which assumes that CO₂, methane and brine separate vertically under buoyancy. That reduces a 3D reservoir model to 2D and makes it fast enough for screening, uncertainty quantification and optimisation studies. I build these models in MRST, apply them to Dutch depleted gas fields in the MuPSI project, and teach MRST's rapid-prototyping framework at Heriot-Watt.*
- **Themes**, a definition list, not cards:
  - *VE models for depleted gas fields*: three-phase CO₂–methane–brine VE with a black-oil approximation, checked against compositional simulation, up to 100× faster.
  - *Storage screening under uncertainty*: ensembles of fast VE runs, such as the 28-case EBN study in MuPSI.
  - *Machine learning for upscaling and digital rock*: CNNs that upscale permeability tensors and predict two-phase flow properties from micro-CT images.
- **Methods and tools**: two short lines.
  - VE modelling, multiphase and compositional simulation, permeability upscaling, scientific machine learning.
  - MATLAB/MRST, Python, Julia/JutulDarcy.
- **Background**: *BSc and MSc in Petroleum Engineering, Amirkabir University of Technology, Tehran, focused on reservoir simulation and machine learning for upscaling and digital rock.*

**Right column: "Recent activity"**
- A dated list (`<time>` in mono). It shows the five most recent items, then a "Show earlier activity" toggle. The toggle uses `aria-expanded` and only renders when there are more than five items.
- Items, newest first:

| Date | Item |
| --- | --- |
| Sep 2026 | Talk and session co-chair, 9th InterPore UK Chapter Conference, Edinburgh: *A Compositional Vertical Equilibrium Model for CO₂ Storage in Depleted Gas Reservoirs*. |
| Sep 2026 | Approved as MSc demonstrator for Formation Evaluation and Production Technology, from November 2026. |
| Aug 2026 | MuPSI case study with EBN: VE models of Dutch depleted gas fields, presented to the project partners. |
| Jun 2026 | Team runner-up, EAGE "The Energy–AI Nexus" Hackathon, EAGE Annual 2026, Aberdeen: a Python AI agent that manages an energy grid under growing AI demand. |
| May 2026 | Talk at InterPore2026, Nantes: *Vertical-Equilibrium Modelling of CO₂ Migration in Depleted Reservoirs*. Preprint posted on EarthArXiv. |
| Mar 2026 | Led the MRST rapid-prototyping session of the SET-IT MATLAB/MRST workshop series: building a single-phase flow simulator from scratch. |
| Feb 2026 | Seminar talk, IGE GeoEnergy Seminar Series, Heriot-Watt. Runner-up, SPE Aberdeen Section Student Bursary (£1,000 awarded). |
| Oct 2025 | Poster, Sixth EAGE Global Energy Transition Conference, Rotterdam: *Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs*. |

### Projects (`#projects`)

**CO₂ storage simulator (feature).** A two-column row: text on the left, and on the right a 640×360 WebP screenshot of the simulator's map view (lazy-loaded, with fixed dimensions).
- Text: *A vertical-equilibrium simulator of CO₂ plume migration, structural, residual and dissolution trapping, fault leakage and pressure build-up in a saline aquifer, in SI units with a visible mass balance and an uncertainty study. It runs in the browser.*
- Links: **Open the simulator** (`simulator.html`) and **Read the method** (`simulator.html#method`).

**MuPSI** (2026): *Multiscale Pressure-Stress Impacts on fault integrity for multi-site regional CO₂ storage*, a Clean Energy Transition Partnership project. VE models and a 28-case ensemble for EBN's case study of Dutch depleted gas fields, with NORCE, TU Delft and IDAEA-CSIC.

**3D fault detection for MRST**: extended a 2D tool to 3D. It finds fault faces with signed distance fields on Cartesian and unstructured grids, and members of the MuPhi group use it.

### Publications (`#publications`)

All four papers are shown, newest first, as a list. There is no filter and no "view more".

**Desktop layout:** a mono year column on the left, then:
1. The title, linked to its DOI.
2. The authors, with "Telvari, S." in semibold ink.
3. The venue and status.
4. One sentence on the contribution.
5. Actions: **DOI** (link), **Copy BibTeX** (button, with a "Copied" state announced politely).

| Year | Entry | DOI |
| --- | --- | --- |
| 2026 | *A Vertical Equilibrium Model for CO₂ Migration in Depleted Gas Fields*. Telvari, Ramachandran, Wang, Doster. EarthArXiv preprint, under review in *Geoenergy Science and Engineering*. Contribution: *Extends VE modelling to CO₂–methane–brine flow in depleted gas reservoirs and reproduces compositional simulations, including a Hugin Formation East field case, with speed-ups up to 100×.* | `10.31223/X5P49D` |
| 2026 | *Accelerated Permeability Upscaling: A Convolutional Neural Network Approach*. Sayyafzadeh, Telvari, Guérillot, Sharifi. *SPE Journal* 31(04), 2242–2260. Contribution: *A compact 3D CNN estimates upscaled permeability tensors from fine-scale permeability maps, tested on Gaussian fields and the Egg model and checked against pressure solutions.* (No speed-up figure.) BibTeX gains the DOI. | `10.2118/231836-PA` |
| 2025 | *Three-Phase VE Simulation of CO₂–Methane–Brine Flow in Reservoirs*. Telvari, Ramachandran, Wang, Doster. Sixth EAGE Global Energy Transition Conference & Exhibition (GET 2025), extended abstract and poster. | `10.3997/2214-4609.202521145` |
| 2023 | *Prediction of two-phase flow properties for digital sandstones using 3D convolutional neural networks*. Telvari, Sayyafzadeh, Siavashi, Sharifi. *Advances in Water Resources* 176, 104442. Contribution: *3D CNNs predict relative permeability and capillary pressure curves from micro-CT images of sandstone.* | `10.1016/j.advwatres.2023.104442` |

Links to Google Scholar and ORCID close the list.

### Contact (`#contact`)

- One sentence: *For collaborations, preprints or questions about VE models and the simulator, email me.*
- The email address `st4014@hw.ac.uk` as a mailto link, with a **Copy** button that shows a polite live "Copied" state.
- Profiles as a plain list, each with a neutral icon and a short factual label: Google Scholar, ORCID `0000-0002-4896-295X`, GitHub `saeedtelvari`, LinkedIn `stelvari`.
- The address: Institute of GeoEnergy Engineering, Heriot-Watt University, Edinburgh, UK.
- The live clock and "(Verified)" are removed.

### Footer

- "© 2024–2026 Sa'eed Telvari", the affiliation line, the six navigation links and "Back to top".
- Ink-muted text at 4.5:1 or better, on a `--sim-bg` band at 0.85 over the basement rock.
- `<footer>` sits outside `<main>`, which fixes the landmark violation.

## CV page (`cv.html`)

- **Own entry.** `cv.html` (`<div id="root" data-page="cv">`) has its own title, description, canonical URL and social card. `index.html#cv` redirects to it, the same way `#simulator` already redirects. The CV no longer mounts the homepage, so it loads no textures and the ResizeObserver race cannot occur.
- **Document look.**
  - An Earth night page with no photo background, at most 860 px wide.
  - The header block holds the name, *PhD Candidate in Petroleum Engineering*, Edinburgh, the email, LinkedIn, ORCID and Scholar, and a **Print or save as PDF** button.
  - Every section is a two-column grid: dates in mono on the left, entries on the right. Phones use one column with the date above each entry.
- **Sections and content, in this order:**
  1. *Research interests* (one line).
  2. *Education.* PhD, Heriot-Watt, 2024–present, with the thesis. MSc 2022–2024, Amirkabir, GPA 3.65/4 (17.23/20), with the thesis. BSc 2018–2022, Amirkabir, GPA 17.43/20, with the thesis.
  3. *Research projects and experience.* Doctoral research. MuPSI (D2). 3D fault detection for MRST (D2). Machine-learning permeability upscaling. Digital-sandstone two-phase flow prediction.
  4. *Publications.* The same four entries and DOIs as the homepage, from one shared array.
  5. *Presentations*, the four talks (D4):

     | Date | Talk |
     | --- | --- |
     | Sep 2026 | InterPore UK, oral |
     | May 2026 | InterPore2026, oral |
     | Feb 2026 | IGE GeoEnergy Seminar Series, seminar talk |
     | Oct 2025 | EAGE GET 2025, poster |

  6. *Teaching* (D1). Approved Demonstrator, MSc Petroleum Engineering 2026–27: Formation Evaluation labs (Nov 2026) and Production Technology PipeSim tutorials (Jan–Feb 2027). Co-organiser and lead instructor, MATLAB/MRST workshop series, SET-IT, Feb–Apr 2026. Teaching assistant during the MSc: Advanced Naturally Fractured Reservoirs and Advanced EOR, with Eclipse and Petrel tutorials.
  7. *Service and leadership* (D3). Session co-chair, InterPore UK 2026. Co-reviewer for *Geophysical Research Letters*, with Prof. Florian Doster. Volunteer, InterPore2026, minisymposia MS05 and MS08. Webmaster, SPE Heriot-Watt Student Chapter, 2025: officer certificate of appreciation; the chapter won the 2026 SPE Regional Outstanding Student Chapter Award. Web contributor to the SET-IT and MuPhi websites.
  8. *Professional training* (D5). SLB Intersect CCS, five-day course, Sep 2026. CMG Carbon Capture Underground Storage Modelling certificate, Mar 2026.
  9. *Skills* (D6), as definition rows:

     | Area | Skills |
     | --- | --- |
     | Programming | Python, MATLAB, Julia, Rust, LaTeX |
     | Machine learning | TensorFlow, PyTorch, scikit-learn, OpenCV, OpenPNM |
     | Reservoir simulation | MRST, Eclipse, Intersect, CMG, Petrel RE, PipeSim, Saphir, PVTSim |
     | CFD and imaging | OpenFOAM, PerGeos, SALOME, MeshLab |
     | Tools | Linux, Docker, Git, Jupyter, VS Code |

  10. *Recognition.* James Watt Scholarship, full PhD funding, Heriot-Watt, 2024–present. Runner-up, SPE Aberdeen Section Student Bursary, £1,000 awarded, 2026. Team runner-up, EAGE "The Energy–AI Nexus" Hackathon, 2026. National undergraduate scholarship, full tuition waiver.
- **Print.** Black on white with no header or footer. Section headings get a 1 px rule, page breaks avoid splitting an entry, and links print their DOIs.

## Header

- **One component, two variants.** The site variant takes its visual language from the simulator's workbench header: Earth surface, a `--sim-rule` bottom border, nav text in `--sim-ink`, and the active item as an `--sim-accent-soft` pill with accent text and a small accent dot.
- **Over the hero** (scrollY < 24) the site variant is transparent over a soft top gradient. Below that it shows the solid surface. Only the colour changes, with no height animation. It is 64 px tall.
- **Workbench variant** keeps its current look. Its `--ve-*` tokens resolve to `--sim-*`.
- **Icons:** a small inline-SVG `Icon` component (menu, close, external, copy, check, play, pause, restart, arrow-up, mail, and the Scholar, ORCID, GitHub and LinkedIn marks) replaces Font Awesome on the homepage and CV. The simulator keeps Font Awesome for its own controls.
- **Skip link:** "Skip to content" is the first focus stop on the homepage and CV.
- **Mobile drawer:** keeps the focus trap. It uses a 200 ms ease-out slide (no overshoot), Earth surface and the same six items. Its "Connect" row is replaced by email and the profile links.

## Performance plan

| Item | Before | After |
| --- | --- | --- |
| React, ReactDOM, bundle | parser-blocking in `<head>` | `defer`, in order |
| Font Awesome on homepage and CV | 267 KB | 0 (inline SVG) |
| Google Fonts | Montserrat 400–800, Open Sans ×3, Arizonia | Montserrat 600/700, Open Sans 400/600, JetBrains Mono 400/500 |
| Geology textures | 2.15 MB, eager | about 0.45 MB, loaded when the descent is near |
| CV background | 4.3 MB JPEG | none |
| Loader | full-screen neon scanner, React-blocked | a static night-sky shell in Earth tones that matches the hero and fades out when React mounts |
| Hero runtime | about 600 ms of script per second, always | rAF at about 35 ms of script per second while playing, 0 when paused, off-screen or hidden |
| Hero history | arrays of arrays, about 16 MB of heap | `Float32Array`s, about 6 MB, transferred |
| `simulator.html` | `bundle.js?v=13.2`, unversioned CSS | the same versions as `index.html` |

## Discoverability

- `index.html`:
  - Title *Sa'eed Telvari — CO₂ storage and reservoir simulation*.
  - Description (D10): *Sa'eed Telvari is a PhD candidate at Heriot-Watt University who builds vertical-equilibrium models in MRST for CO₂ storage in depleted gas fields.*
  - Person JSON-LD with `alumniOf` (Amirkabir), `affiliation`, `knowsAbout` and `sameAs` (Scholar, ORCID, GitHub, LinkedIn).
  - `theme-color` `#120e0b`.
  - A `<noscript>` block with the name, role, summary and links.
- `cv.html`: its own title, description, canonical URL and JSON-LD `ProfilePage`.
- Social cards (1200×630 JPEG): `assets/social-card.jpg` is a real render of the hero with the name. `assets/social-simulator.jpg` is the simulator map. Both replace the waterfall photo.
- Favicons: `favicon.ico`, 32 px and 180 px PNGs (`apple-touch-icon`) made from the existing logo.
- `robots.txt` and `sitemap.xml` covering `/`, `/cv.html` and `/simulator.html`.

## Code health

**Delete**
- The dead hero code (`Streamlines`, `SimCells`, `PLUME_B1–B5`, `getColumnPath`, `CAP_ROCK_PATH`, the name-preview switcher, `Annotation`, `ScrollCue`, `ReservoirGrid`'s 200 polygons).
- The main-thread solver copy.
- The unused primitives (`GlassCard`, `ResearchIcon`, `SectionTitle`, `Badge`, `GlassButton`, `Tag`, `Divider`, `Reveal`).
- About 1,400 lines of mint, glass and dead CSS, and the unused `index.html` keyframes.
- `agent_handoff.md`, which is stale.
- About 27 MB of unreferenced images, in a separate commit.

**Restructure**
- Large inline style objects in `Header.jsx`, `Footer.jsx`, `CVPage.jsx` and the hero become classes in `colors_and_type.css`.
- Publication data lives once and is shared by the homepage and CV.

**Leave**
- `graphify-out/`: it is not part of the site; flag it to the user.

## Testing

**New tests**
- `tests/hero-model.test.js`: physics and conservation (see above).
- `tests/site-nav.test.js`: the pure `activeSection(rects, viewportOffset)` helper, plus the header and footer link targets.
- `tests/site-content.test.js`:
  - Every DOI matches `^10\.\d{4,9}/\S+$`, and the SPE DOI is `10.2118/231836-PA`.
  - "100–400" and "invited" do not appear.
  - Both awards say runner-up.
  - The homepage and CV read publications from one shared array.
- `tests/site-tokens.test.js`:
  - Homepage `--sim-*` values match the simulator's Earth night block.
  - No mint, teal or purple hex values in homepage sources.

**Updated tests**
- `tests/site-smoke.js`: deferred scripts, no Font Awesome on `index.html` and `cv.html`, `cv.html` meta, `noscript`, favicons, robots and sitemap, and the same `bundle.js` version on all three pages.
- Existing tests are edited only where code moved. For example, the hero sky and name tests slice the bundle by component markers, and the descent test supports N sections.

**Browser QA** (puppeteer, 1440×900 and 390×844, motion on and off)
- Before/after screenshots.
- Console and network errors on all three pages.
- axe-core.
- The throttled phone profile.
- Hero runtime per second, playing and off-screen.
- Simulator before/after comparison.

## Out of scope / follow-ups

- Day theme and palette sync with the simulator (decided against for now). The `--sim-*` token names make this an additive change later.
- A three-phase CO₂–CH₄–brine hero with a residual-gas cap would match the research better than the saline-aquifer analogue. The caption says plainly what is shown.
- Removing `graphify-out/` from the repository, and a custom 404 page.

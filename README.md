# Sa'eed Telvari — Personal Portfolio & CO₂ Storage Simulator

An interactive portfolio website and a browser-based CO₂ storage simulator built on the vertical-equilibrium (VE) approximation, for Sa'eed Telvari (Ph.D. Candidate in Petroleum Engineering at Heriot-Watt University).

Built with React 18, SVG mathematical visualizations, and a custom liquid glassmorphism design system.

---

## 🌟 Key Features

1. **Interactive Subsurface Hero (`SubsurfaceHero.jsx`)**:
   - Educational height-based VE animation for $\mathrm{CO}_2$ plume migration and capillary trapping across faulted sandstone formations; precomputation runs in a Web Worker.
   - Conforming SVG geological cross-section with real-time dynamic fault step interpolation, buoyancy streamlines, active wellbore casing, and glassmorphic simulation playback controls.

2. **CO₂ Storage Simulator (`simulator.html`, `SimulatorPage.jsx`, `SimViews.jsx`, `SimCharts.jsx`)**:
   - One SI vertical-equilibrium model (`ve2d-model.js`) drives three synchronised views: a structure map, a 3D block diagram and a geological section through the same run.
   - Physics: sharp-interface VE with hysteretic residual trapping, a compressible pressure solve during injection (Peaceman bottom-hole build-up), open (hydrostatic) or closed model edges, faults with throw, cross-fault transmissibility and threshold-gated leakage, convective dissolution and co2lab-style spill-point trap analysis.
   - A six-class inventory (free, structural, residual, dissolved, left the model, leaked) with its mass-balance error, the inventory through time, plume and pressure figures and plain-language notes.
   - Uncertainty study: Latin hypercube sampling of the same engine in a Web Worker, P10/P50/P90, histograms, Spearman tornado and a run scatter that opens any run in the simulator.
   - Share links, inventory and grid CSV exports, view images, night and day themes, keyboard playback and data-driven motion that respects `prefers-reduced-motion`.

3. **Method (`GuidePage.jsx`)**:
   - The equations, numerics, verification results and limitations of the implemented model, typeset with KaTeX.

4. **Academic CV View (`CVPage.jsx`)**:
   - Academic milestones, education, peer-reviewed publications, honors, and technical skill matrices with clean `@media print` export.

5. **Responsive & Accessible Design (`Header.jsx`, `colors_and_type.css`)**:
   - Mobile slide-out glass drawer navigation with scroll-spy section tracking.
   - Fully accessible with `:focus-visible` outlines, ARIA attributes, and `@media (prefers-reduced-motion: reduce)` support.

---

## 📁 Repository Structure

- `index.html` — Home page entry point with CDN imports (React 18, ReactDOM, FontAwesome 6).
- `simulator.html` — Standalone CO₂ Storage Simulator page (own URL; loads independently of the home page).
- `colors_and_type.css` — Design system design tokens, glassmorphism filters, accessible focus rings, and typography.
- `Primitives.jsx` — Reusable glass UI primitives (`GlassCard`, `GlassButton`, `Badge`, `Tag`, `Reveal`, `SectionPanel`).
- `Header.jsx` — Fixed glassmorphic navigation header with shrink-on-scroll, scroll-spy, and mobile hamburger drawer.
- `Footer.jsx` — Translucent footer with copyright and interactive navigation links.
- `SubsurfaceHero.jsx` — Landing hero with real-time VE fluid solver and animated faulted geological cross-section.
- `HomeSections.jsx` — Homepage content sections: About, Research Interests, Peer-Reviewed Publications, and Contact.
- `SimulatorPage.jsx` — Simulator page: scenario inputs, streamed results, playback, outcomes, uncertainty study, share links and exports.
- `SimViews.jsx`, `SimCharts.jsx` — Map, 3D and section views with their motion layer; inventory, histogram, tornado and scatter charts.
- `ve2d-model.js` — Dependency-free SI vertical-equilibrium engine (geometry, traps, pressure, transport, leakage, dissolution, inventory, uncertainty sampling) shared by the page, the worker and Node tests.
- `simulation-worker.js` — Runs simulator scenarios (streamed snapshots) and uncertainty batches off the main thread.
- `hero-simulation-worker.js` — Precomputes the home-page hero animation.
- `bundle.js`, `simulator-bundle.js` — Generated home/common and simulator-specific bundles; do not edit directly.
- `GuidePage.jsx` — Method page for the simulator.
- `CVPage.jsx` — Interactive and printable Curriculum Vitae.
- `App.jsx` — Top-level router managing multi-view state and smooth scroll anchors.
- `assets/` — Optimized image assets, badges, and background textures.

---

## 🚀 Running Locally

Simply serve the repository folder using any local HTTP server:

```bash
# Python 3
python -m http.server 8000

# or Node.js / npx
npx serve .
```

Navigate to `http://localhost:8000` in any modern web browser.

Rebuild generated bundles and run the repository smoke check after source changes:

```bash
node build.js
node --test tests/*.test.js
node tests/site-smoke.js
```

To enable the direct CV download, add the final PDF at `assets/Saeed-Telvari-CV.pdf`. Until then, the CV page offers the browser's Print / Save as PDF flow.

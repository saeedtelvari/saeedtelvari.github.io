# Sa'eed Telvari — Personal Portfolio & VE Simulator Platform

An interactive portfolio website and educational Vertical Equilibrium (VE) reservoir simulator for Sa'eed Telvari (Ph.D. Candidate in Petroleum Engineering at Heriot-Watt University).

Built with React 18, SVG mathematical visualizations, and a custom liquid glassmorphism design system.

---

## 🌟 Key Features

1. **Interactive Subsurface Hero (`SubsurfaceHero.jsx`)**:
   - Educational height-based VE animation for $\mathrm{CO}_2$ plume migration and capillary trapping across faulted sandstone formations; precomputation runs in a Web Worker.
   - Conforming SVG geological cross-section with real-time dynamic fault step interpolation, buoyancy streamlines, active wellbore casing, and glassmorphic simulation playback controls.

2. **Interactive VE Cross-section, x–y Map & UQ Dashboard (`SimulatorPage.jsx`)**:
   - Interactive parameter controls: permeability, porosity, residual trapping coefficients, injection rate, dip angle, and fault transmissibility multipliers.
   - True x–y finite-volume plume-height model with heatmap contours, well placement, cross-fault flow, residual trapping, PNG export, and grid CSV export.
   - Web Worker Monte Carlo uncertainty engine with percentile outcomes, distributions, and correlation-based sensitivity summaries.
   - Live $\mathrm{CO}_2$ Mass Balance accounting with real-time structural vs residual capillary trapping efficiency tracking.

3. **Mathematical & Physical Guide (`GuidePage.jsx`)**:
   - Reference theory is clearly separated from the simplified equations actually evaluated by the browser model.

4. **Academic CV View (`CVPage.jsx`)**:
   - Academic milestones, education, peer-reviewed publications, honors, and technical skill matrices with clean `@media print` export.

5. **Responsive & Accessible Design (`Header.jsx`, `colors_and_type.css`)**:
   - Mobile slide-out glass drawer navigation with scroll-spy section tracking.
   - Fully accessible with `:focus-visible` outlines, ARIA attributes, and `@media (prefers-reduced-motion: reduce)` support.

---

## 📁 Repository Structure

- `index.html` — Home page entry point with CDN imports (React 18, ReactDOM, FontAwesome 6).
- `simulator.html` — Standalone VE Simulator page (own URL; loads independently of the home page).
- `colors_and_type.css` — Design system design tokens, glassmorphism filters, accessible focus rings, and typography.
- `Primitives.jsx` — Reusable glass UI primitives (`GlassCard`, `GlassButton`, `Badge`, `Tag`, `Reveal`, `SectionPanel`).
- `Header.jsx` — Fixed glassmorphic navigation header with shrink-on-scroll, scroll-spy, and mobile hamburger drawer.
- `Footer.jsx` — Translucent footer with copyright and interactive navigation links.
- `SubsurfaceHero.jsx` — Landing hero with real-time VE fluid solver and animated faulted geological cross-section.
- `HomeSections.jsx` — Homepage content sections: About, Research Interests, Peer-Reviewed Publications, and Contact.
- `SimulatorPage.jsx` — VE simulation sandbox, Monte Carlo UQ dashboard, share links, exports, and mass-balance analytics.
- `ve2d-model.js` — Dependency-free x–y VE plume-height solver shared by the browser and Node tests.
- `hero-simulation-worker.js`, `uq-worker.js` — Background numerical work that keeps interaction responsive.
- `bundle.js`, `simulator-bundle.js` — Generated home/common and simulator-specific bundles; do not edit directly.
- `GuidePage.jsx` — Mathematical formulation and PDE methodology guide.
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
node --test tests/ve2d-model.test.js
node tests/site-smoke.js
```

To enable the direct CV download, add the final PDF at `assets/Saeed-Telvari-CV.pdf`. Until then, the CV page offers the browser's Print / Save as PDF flow.

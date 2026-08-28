# Sa'eed Telvari — Personal Portfolio & VE Simulator Platform

An interactive portfolio website and educational Vertical Equilibrium (VE) reservoir simulator for Sa'eed Telvari (Ph.D. Candidate in Petroleum Engineering at Heriot-Watt University).

Built with React 18, SVG mathematical visualizations, and a custom liquid glassmorphism design system.

---

## 🌟 Key Features

1. **Interactive Subsurface Hero (`SubsurfaceHero.jsx`)**:
   - Real-time numerical solver calculating Vertical Equilibrium (VE) $\mathrm{CO}_2$ plume migration and capillary trapping across faulted sandstone formations.
   - Conforming SVG geological cross-section with real-time dynamic fault step interpolation, buoyancy streamlines, active wellbore casing, and glassmorphic simulation playback controls.

2. **Interactive 2D VE Sandbox & UQ Dashboard (`SimulatorPage.jsx`)**:
   - Interactive parameter controls: permeability, porosity, residual trapping coefficients, injection rate, dip angle, and fault transmissibility multipliers.
   - Monte Carlo Uncertainty Quantification (UQ) engine with box plots, kernel density distributions, and multi-scenario plume envelopes.
   - Live $\mathrm{CO}_2$ Mass Balance accounting with real-time structural vs residual capillary trapping efficiency tracking.

3. **Mathematical & Physical Guide (`GuidePage.jsx`)**:
   - Comprehensive reference manual detailing 1D/2D Vertical Equilibrium formulations, pseudo-relative permeability upscaling, and boundary conditions.

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
- `SimulatorPage.jsx` — Full-featured VE simulation sandbox, Monte Carlo UQ dashboard, and mass balance analytics.
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

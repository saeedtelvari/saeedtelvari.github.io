# Hero lateral layer thickness implementation plan

**Goal:** Beds visibly thicken and thin along X within one randomized homepage section, with the surface at 0 and the section bottom at 580 SVG units.

**Architecture:** Share the profile functions between the SVG renderer and simulation worker. Smooth, bounded waves redistribute available vertical space; the reservoir floor is independent of its roof, and deeper beds divide the remaining space down to the fixed bottom. Preserve the existing fault-intersection and ribbon-rendering approach.

**Stack:** Existing React, SVG, JavaScript worker, Node test runner. No new dependencies. Implement inline and preview locally; do not publish.

## 1. Geometry and regression check

- [x] Extend `tests/hero-geology.test.js` to measure thickness at 201 X positions in each of 100 seeded sections. Assert lateral reservoir variation greater than 30 SVG units, positive upper/lower bed thickness, a fixed 580-unit bottom, a well inside the local bed, and finite plume heights bounded by each cell's thickness.
- [x] Extract the existing geometry functions into `hero-geology.js`, exposed as `HeroGeology` for the bundle/worker and CommonJS for tests.
- [x] Add independent phases and broad wavelengths to generated geology in `SubsurfaceHero.jsx`.
- [x] Use a monotone depth fraction for upper and lower boundaries:
  ```js
  t + 0.08 * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * x / wavelength + phase)
  ```
  This fixes fractions 0 and 1 and keeps intermediate boundaries ordered before faults.
- [x] Reserve space beneath the reservoir and use a bounded sinusoidal reservoir thickness, with a positive minimum. Interpolate deeper boundaries through the remaining depth; fade their fault throw to zero at the section bottom.

## 2. Solver and SVG integration

- [x] Expose `layerThicknessAt(x, depth, faults, cell, geology)` as the difference between the actual local floor and roof. Precompute 201 capacity values per reservoir before stepping the worker and fallback.
- [x] Replace scalar height limits in injection, transport, leakage reception, and historical maxima with the corresponding cell capacity.
- [x] Use the same floor for the well, plume clipping, brine fill, and labels. Preserve both sides of floor fault steps in SVG paths.
- [x] Include `hero-geology.js` before the hero in `build.js`; import it in the worker. Increment homepage asset versions together.

## 3. Verification and local preview

- [x] Run `node --test tests/hero-geology.test.js` and compare every worker frame with the fallback. Run the existing three test files and `node tests/site-smoke.js`.
- [x] Rebuild the homepage bundle while protecting existing unrelated simulator-bundle edits.
- [x] In the local browser, compare the empty section and years 320/1000, reload once, and check desktop/mobile layouts and browser errors.
- [x] Leave `http://127.0.0.1:8000/` running and open the updated preview in Codex. Report any remaining layout limitations separately.

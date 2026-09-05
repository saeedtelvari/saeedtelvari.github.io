# VE Simulator 3D Topography Viewer Design

## Goal

Add an interactive 3D viewer to the existing 2D Map workspace so reservoir researchers, engineers, and decision-makers can inspect grid topography without leaving the simulator workflow.

## Approved direction

Use a native canvas orbit mesh. The viewer is a sibling of the existing Cross-section and 2D Map views, uses the same slate-precision visual system, and introduces no rendering dependency or second simulation model.

## Architecture

- Add a focused `Ve3DTopographyPanel` beside `Ve2DMapPanel`.
- Feed it the existing map state, year, grid dimensions, faults, injector position, and run/reset command path.
- Keep camera state local to the component: azimuth, elevation, and bounded zoom.
- Add a `3D Topography` visualization tab while preserving Cross-section and 2D Map behavior.
- Render with the platform canvas API; no new package or WebGL engine.

## Data flow and behavior

- The mesh derives from the existing `mapState.h` and `mapState.hMax` snapshots.
- Switching tabs never forks model state or resets playback.
- Pointer drag rotates azimuth/elevation with pointer capture.
- Wheel and touch pinch zoom within bounded limits; single-finger drag rotates.
- Reset view restores a readable default camera.
- Elevation exaggeration is a bounded presentation-only control and never changes solver values.
- Current year, grid dimensions, faults, and injector marker remain visible.
- Existing playback, run, reset, export, and map lifecycle semantics remain authoritative.

## Visual system and accessibility

- Deep slate canvas with restrained teal height shading.
- Warm sandstone/caprock tones only where geological meaning benefits.
- Thin grid lines and fault overlays; no decorative glow.
- Compact mono labels for year, grid size, zoom, and elevation scale.
- Explicit selected `3D Topography` tab and visible `Reset view` control.
- Label the canvas with current year, camera orientation, zoom, elevation scale, and grid dimensions.
- Keep keyboard controls available for reset and bounded zoom; gestures are enhancements.
- Preserve visible `:focus-visible` rings and remove camera/presentation motion under reduced-motion preferences.

## Non-goals

- No new solver, grid topology, or physical interpretation.
- No Three.js/WebGL dependency.
- No change to Cross-section, 2D Map, UQ, or export data semantics.
- No decorative auto-rotation.

## Verification

- Add behavior tests for projection bounds, camera reset/clamping, and map-state reuse.
- Add structural/accessibility tests for the new tab, canvas label, reset control, and reduced-motion contract.
- Run the existing model/workbench tests, site smoke, and build.
- Verify desktop and 390×844 mobile rendering in the live browser when available; compare the 3D tab to the approved slate references.

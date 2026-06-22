# Agent Handoff: Reservoir Gas Plume Visualization Bug

## Current Status
The user is experiencing severe visual artifacts in the gas-water interface on both the `SimulatorPage.jsx` and `SubsurfaceHero.jsx` components. The visualization looks like a "jagged staircase" with discontinuous vertical steps at every single grid block, and the plumes appear misaligned or overlapping.

## Goal
The original goal was to fix a small visual anomaly ("gap" or "discrepancy") at the fault lines. The interpolation function was drawing a slanted line across the sharp vertical fault steps, causing the plume's boundary to incorrectly slice through the caprock. 

## Files Modified
1. `e:\Github Repos\saeedtelvari.github.io\SimulatorPage.jsx`
2. `e:\Github Repos\saeedtelvari.github.io\SubsurfaceHero.jsx`

## What Was Tried (And Why It Failed)
1. **Removed Continuous Interpolation:** To fix the smoothing at the faults, I completely removed the `yTotalBound` and `yBound` interpolation arrays. I rewrote the SVG paths to evaluate `h[i]` as a piecewise constant value for each cell.
2. **The First Bug (Diagonal Cut):** I accidentally included an `if (i < lastActive)` statement in the bottom-boundary path generation loop. This skipped the vertical edge of the right-most cell, drawing a diagonal cut that exposed a large triangular gap of the background sandstone.
3. **The Second Bug (Minecraft Staircase):** To fix the diagonal cut, I removed the `if (i < lastActive)` statement. This made the polygons geometrically "correct" according to my piecewise code. However, the user immediately reported it was "way worse and back to square one."

## Root Cause Analysis
The numerical VE (Vertical Equilibrium) solver computes `h[i]` (the gas thickness) as a discrete, piecewise constant value for each grid cell. 
Before my changes, the visualization used `0.5 * (yCenter[i-1] + yCenter[i])` to interpolate these discrete `h[i]` values at the cell boundaries. This made the gas plumes look beautifully smooth and continuous.

By completely removing the interpolation, the SVG now draws the discrete `h[i]` values directly. Because `h[i]` naturally varies from cell to cell, the bottom of the gas plume (and the top of the brine layer) now has a jarring vertical jump at *every single cell boundary*. This completely ruined the smooth aesthetic of the simulation, turning it into a jagged "Minecraft" staircase. 

**The original bug was ONLY at the faults:** The interpolation was inappropriately smoothing across the physical fault offsets, causing the visual gap. I should have only broken the interpolation *at the fault boundaries*, not everywhere.

## Next Steps for the Next Agent
1. **Revert the Pathing Logic:** Re-introduce the `yBound` and `yTotalBound` continuous interpolation arrays in both `SimulatorPage.jsx` and `SubsurfaceHero.jsx` to restore the smooth, continuous gas plumes.
2. **Fix Interpolation at Faults:** Modify the interpolation logic so that it averages adjacent cells `0.5 * (y[i-1] + y[i])` *unless* there is a fault between cell `i-1` and cell `i`. If there is a fault, the interpolation should be broken, and the path should draw a clean vertical step down/up along the fault slip without smoothing.
3. **Verify:** Ensure the gas plume perfectly aligns with the `ReservoirGrid` brine layer by using the exact same corrected boundary interpolation.

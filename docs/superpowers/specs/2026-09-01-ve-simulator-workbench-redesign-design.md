# VE Simulator Engineering Workbench Redesign

Date: 2026-09-01

## Objective

Redesign the standalone VE simulator as a restrained engineering workspace for reservoir researchers, reservoir engineers, and industry decision-makers. The first 30 seconds must optimize for configuring and running a scenario. The redesign must retain Sa'eed's brand mark and navigation while removing the portfolio-style hero and glass-heavy presentation from the simulator surface.

The numerical model, existing simulator capabilities, and scientific scope remain unchanged.

## Approved Direction

The approved direction is an **engineering workbench** with a **slate precision** visual language:

- persistent scenario inputs on the left;
- the reservoir visualization and playback controls in the centre;
- live outcomes on the right;
- cool-gray application chrome, white working surfaces, ink typography, restrained teal status color, and a deep-slate geological canvas.

Two alternatives were considered and rejected:

- A canvas-first studio made the visualization dominant but hid dense configuration in drawers.
- A guided assessment made the workflow approachable but slowed repeated expert iteration.

## Information Architecture

### Header

A compact 56px application header replaces the existing marketing-style title area. It contains:

- Sa'eed's existing brand mark;
- `VE Simulator` product name;
- links to Research and Methodology;
- a link back to Sa'eed's portfolio/navigation context.

The simulator starts immediately below the header. There is no hero eyebrow, promotional summary, evidence-card row, or decorative first-load animation.

### Scenario bar

A slim scenario bar sits below the header and remains visible at the top of the workbench. It contains:

- named reservoir presets;
- the active scenario name and modified state;
- Reset;
- Copy scenario link;
- export actions;
- one visually dominant `Run scenario` action;
- a persistent status label: `Ready`, `Running`, `Paused`, or `Inputs changed`.

Secondary actions may collapse into one menu at narrower desktop widths, but the run action remains visible.

### Primary workbench

At wide desktop sizes, the remaining viewport is divided into three zones:

1. **Input rail** — fixed-width, scrollable, approximately 280px.
2. **Visualization workspace** — fluid width and the primary spatial focus.
3. **Outcome rail** — fixed-width, approximately 300px.

The workbench should fit within a typical laptop viewport without requiring users to scroll past introductory content before reaching the simulator.

### Dedicated risk workspace

Sensitivity and UQ move from a competing canvas tab into a dedicated `Risk analysis` workspace. It inherits the current scenario as its nominal case, uses the existing background worker, and can load a selected realization back into the primary workbench.

The PDE methodology remains directly accessible from navigation rather than sharing the visualization's most prominent tabs.

## Component Inventory

### Input rail

Inputs are grouped by scientific task, separated by headings and rules rather than nested cards:

- Injection;
- Rock properties;
- Structure;
- Faults;
- Capillary behavior;
- Grid/detail settings.

Each continuous parameter pairs:

- a descriptive label;
- an editable numeric input;
- an explicit unit;
- a range slider for quick adjustment.

Checkboxes, segmented controls, and fault-count controls retain semantic HTML and accessible labels. Invalid values are corrected or rejected at the field with concise inline feedback. The existing model bounds remain authoritative.

### Visualization workspace

The workspace provides two peer views:

- Cross-section;
- Map.

Both views share the same configured scenario and do not discard state when switched. The geological canvas remains deep slate so brine, plume, trapped gas, fault, and well colors retain strong contrast.

The following controls are attached directly below the canvas:

- play/pause;
- step backward/forward;
- seek timeline;
- speed;
- reset.

The scientific legend stays close to the visualization but must not obscure the plotted area on small screens.

### Outcome rail

The outcome rail presents, in order:

- run state and simulated year;
- injected mass;
- stored/mobile mass;
- residually trapped mass;
- leaked mass/fraction;
- structural and residual trapping efficiency;
- compact mass-balance history;
- warnings or threshold states;
- comparison/export actions after a completed run.

Numbers use tabular/monospace treatment. Semantic status colors are reserved for meaningful outcome states rather than decoration.

### Risk analysis workspace

The risk workspace retains the current capabilities:

- parameter inclusion;
- range, percentage, and discrete-value sampling modes;
- target metric selection;
- run-count selection;
- worker progress;
- percentile results;
- distributions;
- sensitivity/correlation results;
- loading a selected realization into the simulator.

It uses the same slate-precision controls and hierarchy as the primary workbench. It is not redesigned as a card grid.

## Visual System

### Color

The approved palette is light application chrome around a dark visualization canvas:

- cool-gray page background;
- white control and outcome rails;
- dark ink primary text;
- muted slate secondary text;
- cool-gray borders and dividers;
- restrained teal for active, selected, and successful states;
- amber for caution;
- red for leakage and errors only;
- deep slate for the geological canvas.

Exact color values will be derived during the image-concept pass and locked before implementation. The palette must remain cool rather than cream, beige, or glassy purple.

### Typography

No new font dependency is required:

- Montserrat remains for the brand/product identity and main navigation;
- Open Sans is used for controls, labels, and supporting copy;
- the existing monospace stack is used for parameter and result values.

Control typography is explicitly sized and never left to browser defaults.

### Shape and elevation

- Rails are structural surfaces, not floating glass cards.
- Separators, alignment, and whitespace establish hierarchy.
- Corners are restrained and consistent.
- Shadows are rare and limited to temporary overlays or mobile sheets.
- Gradients and glows are not part of the application chrome.

### Icons

Icons appear only when they clarify a control. Existing Font Awesome assets may be reused where their weight matches the design. Text labels remain visible for primary actions. Carets and navigation glyphs use actual icon elements rather than text characters.

## Interaction and Motion

Motion follows Emil Kowalski's frequency and purpose rules:

- no page-load flourish;
- no routine keyboard-triggered animation;
- no decorative animation on view tabs or frequently used controls;
- pressable controls scale to approximately `0.97` for 100–160ms;
- temporary panels and mobile sheets enter with a 160–220ms strong ease-out;
- simulation progress remains linear;
- transitions specify exact properties and never use `transition: all`;
- `prefers-reduced-motion` removes position movement while retaining useful opacity/color state feedback.

The run button provides immediate press feedback. Running, paused, modified, success, and failure states are communicated through text as well as color.

## State and Data Flow

The redesign reuses the existing React state and numerical functions. It changes composition and presentation, not model logic.

1. Selecting a preset populates the complete parameter state.
2. Editing any parameter marks the active scenario as modified.
3. The visualization may reflect safe geometric input changes immediately, but result status becomes `Inputs changed` until a fresh run begins.
4. `Run scenario` resets the timeline and starts the configured case.
5. Playback controls update the simulated year and current mass outcomes.
6. Cross-section and Map consume the same scenario state.
7. Risk analysis snapshots the current scenario as the nominal case and executes through the existing UQ worker.
8. Loading a realization writes its parameter set back to the shared scenario state and returns the user to the workbench.
9. Share links serialize the current scenario using the existing query-string behavior.
10. Export actions use the existing CSV, SVG, map PNG, and grid CSV implementations.

## Responsive Behavior

### Wide desktop

All three workbench zones remain visible. The centre canvas grows with the viewport.

### Narrow desktop/tablet

The visualization remains primary. One rail may become a docked tab or sheet, while `Run scenario`, status, and playback controls remain visible. Secondary share/export actions collapse into a menu.

### Mobile

The app header simplifies while retaining brand and a route back to the portfolio. Inputs and outcomes open as accessible side or bottom sheets. The canvas, view selector, run action, and playback controls remain in the primary flow. Legends become horizontally scrollable or compact without covering data.

Sheets use semantic buttons, focus management, Escape dismissal where appropriate, and appropriately sized touch targets. No essential action relies on hover.

## Accessibility

- Preserve semantic tabs for Cross-section and Map.
- Preserve labelled form controls and range inputs.
- Maintain visible keyboard focus throughout the application.
- Meet readable contrast for text, controls, charts, and status states.
- Pair status colors with text or symbols.
- Keep primary touch targets at least 44px where mobile layout permits.
- Announce simulation/UQ progress without flooding assistive technology.
- Retain reduced-motion behavior.
- Keep scientific figures supplied with meaningful accessible names/descriptions.

## Error Handling

- Invalid input appears beside the responsible field and does not erase the scenario.
- Worker failure stops progress, preserves parameters, and offers a retry.
- Share/export failure appears inline or in a concise toast and never resets the run.
- Unsupported browser capabilities degrade to existing non-worker or non-download behavior only where the current implementation already supports it.
- Warnings distinguish model limitations from runtime failures.

## Implementation Boundaries

- Preserve `ve2d-model.js`, worker behavior, and scientific equations unless a separate defect is found and approved.
- Do not edit generated bundles directly; rebuild them through `build.js`.
- Reuse the existing dependency-free React/CDN architecture and installed icon/font assets.
- Avoid new UI dependencies for layout, sheets, menus, or animation unless a concrete accessibility requirement cannot be met with the existing platform.
- Refactor only the simulator composition and the smallest supporting shared styles/tests needed for the redesign.

## Verification

### Functional checks

- Configure parameters and run a cross-section scenario.
- Pause, seek, step, change speed, and reset.
- Switch to Map without losing the scenario.
- Copy a scenario link and verify it restores the same values.
- Export mass balance CSV and reservoir SVG.
- Run UQ in the worker and load one realization into the workbench.
- Confirm field and worker errors preserve user state.

### Automated checks

- Rebuild with `node build.js`.
- Run `node --test tests/ve2d-model.test.js`.
- Run `node tests/site-smoke.js`.
- Add one focused smoke check for the new workbench structure and required primary actions.

### Visual checks

- Generate and approve a complete desktop concept before implementation.
- Verify the first viewport, primary run state, risk workspace, and mobile layout.
- Compare the approved concept and latest browser screenshot with `view_image`.
- Inspect copy, three-zone layout, typography, cool palette, canvas contrast, spacing, controls, icons, responsive sheets, and restrained motion.
- Verify no accidental glassmorphism, marketing hero, nested card grid, clipped content, default control typography, or mobile overflow remains.

## Success Criteria

The redesign is successful when a reservoir professional can land on the page, identify the current case, change the main engineering parameters, and start a run without scrolling or hunting; can interpret the primary storage and leakage outcomes while the run proceeds; and can move into risk analysis without rebuilding the scenario.

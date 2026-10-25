# Story homepage — dark-theme audit

Date: 2026-10-25. A read-only survey of every place that depends on the old night hero or the "Earth night" theme. Use it to plan phase 6 (sections, CV, header) and phase 7 (cleanup). Line numbers are from commit `abbe2e1`.

Scope tags: [home] homepage only, [home+CV], [all] homepage, CV and simulator (the simulator loads `colors_and_type.css` too), [sim] simulator only.

## Key points

- `Header.jsx`, `Footer.jsx`, `App.jsx`, `HomeSections.jsx` and `CVPage.jsx` have no colour literals. Their dark look comes from `colors_and_type.css`.
- `SubsurfaceHero.jsx` and `GeologicalDescent.jsx` hard-code their colours in JSX.
- `index.html:37` and `cv.html:34` set the body colours inline, after the stylesheet. A token change alone does not change those page backgrounds.
- `colors_and_type.css` has 18 literal `rgba(244, 237, 227, …)` (cream) lines outside `:root` (151, 210, 214, 230, 232, 291, 387, 398, 501, 503, 529, 1040, 1051, 1071, 1079, 1089, 1108, 1125) and dark `rgba` literals at 158, 328, 332, 1328, 1332, 1406, 1431, 1502. A token edit does not change them.

## By file

**Header** [home, drawer: all]
- `Header.jsx:38-44, :80`: transparent over the hero; adds `is-scrolled` after 24 px.
- `colors_and_type.css:1327-1336`: dark gradient, then `rgba(18,14,11,.9)` when scrolled. `:1363-1376`: nav text is cream `--sim-ink`, so it is not legible on a light sky.
- `Header.jsx:89-90`: the logo `assets/logo-minimalist.webp`; contrast on a light sky is not checked.
- Mobile drawer: `colors_and_type.css:1431` (backdrop) and `:1447` (`--sim-surface`). The simulator uses the same drawer.

**Footer** [home+CV]
- `Footer.jsx:10`: `site-footer--geological`; CSS `:1502` is translucent dark. The CV footer uses `--sim-bg` (`:1499`).

**Sections** [home]
- `HomeSections.jsx:29-36`: `section.section-panel > div.sheet`; the sheet is dark translucent (`colors_and_type.css:224-235`, `--site-sheet`).
- `GeologicalDescent.jsx:30` measures `.section-panel`; a rename breaks the descent.
- `colors_and_type.css:387, 422-423, 452-454`: cream text and dark surfaces in the sheets.

**Descent** [home]
- `GeologicalDescent.jsx:73, 194-251`: hard-coded rock colours, light strokes for dark rock, and a bridge colour `#1d150f` that a test ties to `SubsurfaceHero.jsx:324`.
- `colors_and_type.css:339`: art top is `max(100svh, 720px)` and must match `.hero-scene` (`:937-938`).

**CV** [CV]
- `colors_and_type.css:243-324`: CV colours, with cream `.cv-detail` at `:291`. Keep the print rules at `:307-324` (black on white).

**Shared CSS** [all]
- `colors_and_type.css:10-76`: the `:root` tokens copied from the simulator, with `color-scheme: dark` at `:75`. The simulator redefines its own tokens in `simulator-workbench.css:8-72`.
- `:935-1290`: the whole hero block, which goes in phase 7.
- `simulator-workbench.css:77-118` has a light "day" palette (bg `#f3eee7`, ink `#2a2019`), a useful reference.

**Pages** [home+CV]
- `index.html:9`, `cv.html:9`: `theme-color` `#120e0b`. `index.html:26`, `cv.html:23`: no Literata in the font link. `index.html:43-51`: the night loader gradient.

## Tests that depend on the old hero, descent or palette

These break when the old files are deleted or the build list changes, or when the strings and markers that they read change. No test mounts the React tree, so a change to the `App.jsx` render alone breaks nothing.

1. `hero-model.test.js`: reads the helper block of `SubsurfaceHero.jsx` and `hero-simulation-worker.js`.
2. `hero-geology.test.js`: only the bedding test (`:19-27`) reads `SubsurfaceHero.jsx`.
3. `hero-sky.test.js`: reads a slice of `bundle.js` from `SubsurfaceHero.jsx`.
4. `hero-name.test.js`: reads a slice of `bundle.js` from `SubsurfaceHero.jsx`.
5. `geological-descent.test.js`: reads a slice of `bundle.js` from `GeologicalDescent.jsx`, and ties the hero and descent bridge colours (`:128-133`).
6. `site-smoke.js:24-28`: the hero CTA, aria labels and worker file.
7. `site-tokens.test.js` test 3 (`:31-39`): pins the hero night palette.
8. `site-tokens.test.js` test 1 (`:11-17`): the `:root --sim-*` values must equal the simulator's.
9. `site-smoke.js:74-78`: the `?v=` values must match on all three pages.

Keep these literal patterns when you restyle: `href={it.href}` and `mobileOpen &&` in `Header.jsx`, and `href={href}` in `Footer.jsx` (`site-smoke.js:14-16`). The tests that read `bundle.js` need `node build.js` after each source change.

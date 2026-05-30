# Portfolio UI Kit

A faithful interactive recreation of Sa'eed Telvari's portfolio site (homepage + CV) as React components. Use these to compose new pages in this brand without rebuilding the glass/motion plumbing.

Open **`index.html`** for the prototype. It boots a multi-screen interactive demo:
- Homepage with the auto-advancing card slider hero, About, Research grid, Publications, Projects, News timeline, and Contact.
- CV page with the timeline, publication entries, research tags, skills grid, and download button.

The view switches via the top navbar (Home / CV) and the slider auto-advances every ~10s. Click the small stacked cards on the right to bring one forward.

## File map

- `index.html` — wires React + Babel, imports the JSXs, mounts `<App/>` (which toggles Home vs CV).
- `Primitives.jsx` — `GlassCard`, `GlassButton`, `Badge`, `Tag`, `ResearchIcon`, `EyebrowDivider`.
- `Header.jsx` — fixed translucent nav with shrink-on-scroll behaviour and logo monogram.
- `CardSlider.jsx` — the iconic homepage hero. Auto-advances, prev/next pod, manual click on stacked cards.
- `HomeSections.jsx` — `<AboutSection/>`, `<ResearchGrid/>`, `<PublicationsList/>`, `<ProjectsGrid/>`, `<NewsTimeline/>`, `<ContactSection/>`.
- `CVPage.jsx` — single long glass page: header, research tags, education timeline, publications, awards, skills, certifications, languages.
- `Footer.jsx` — minimal footer.
- `App.jsx` — top-level. Holds `screen` state ("home" | "cv"), renders the right tree.

## Conventions

- Every container uses the glass recipe defined in `../../colors_and_type.css`. The kit imports it once via the index page.
- Icons: Font Awesome 6 (loaded via CDN in `index.html`).
- Motion: bouncy `cubic-bezier(0.175, 0.885, 0.32, 1.275)`, ~0.4s. Hover translates Y up + grows slightly. Press shrinks.
- No emoji. Body copy is calm and academic.
- **Asset paths** assume `../../assets/<file>`. If you move the kit, fix those references.

## What's intentionally faked

This is a kit, not production code: the slider is real but doesn't fetch data, publication DOIs link to the real DOI, navigation between Home and CV is local state, mobile drawer is not wired, and `prefers-reduced-motion` is not handled. For real production, port the relevant CSS files (`master.css`, `glass-effects.css`, `sections.css`, `cv.css`, `navbar.css`, `animations.css`) from the source repo.

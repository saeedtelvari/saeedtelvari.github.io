# Emil Kowalski UI skills and design-pattern inventory

Research snapshot: **2026-09-01**. This inventory uses only Emil Kowalski's own repositories, products, course pages, and articles. The open-source skill repository was inspected at commit [`d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7`](https://github.com/emilkowalski/skills/tree/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7).

## What “pull every skill” can mean

There are two distinct collections:

1. **Open-source skills:** 12 complete `SKILL.md` packages in [`emilkowalski/skills`](https://github.com/emilkowalski/skills). These can be installed together with the repository's documented command:

   ```sh
   npx skills@latest add emilkowalski/skills
   ```

   A literal source checkout is `git clone https://github.com/emilkowalski/skills.git`. The install command is the better interpretation of “pull” when the goal is to make the skills available to a coding agent. [Source: repository README](https://github.com/emilkowalski/skills/tree/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7#install)

2. **AI for UI course bundle:** [`aiforui.dev`](https://aiforui.dev/) publicly names 20 UI skills, but supplies their complete contents only to paying course members. Those files cannot be truthfully “pulled” from public sources. The public names and scopes can be catalogued; reproducing their unpublished implementation would not be source retrieval.

The older [`emilkowal.ski/skill`](https://emilkowal.ski/skill) index currently lists fewer entries than the GitHub repository, so the repository tree is authoritative for the open-source set.

## Complete open-source skill inventory

| Skill | Public scope | UI relevance |
| --- | --- | --- |
| [`emil-design-eng`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/emil-design-eng/SKILL.md) | Emil's core philosophy for UI polish, component design, animation decisions, and unseen details | Core design-system and motion guidance |
| [`animate`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate/SKILL.md) | Builds web motion after deciding purpose, tool, properties, curve, duration, interruption, and exit | Implementation skill; includes reusable [recipes](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate/RECIPES.md) |
| [`animate-expo`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate-expo/SKILL.md) | React Native/Expo motion, gestures, sheets, haptics, screen transitions, and off-JS-thread execution | Native-mobile equivalent of `animate`; includes [Expo recipes](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate-expo/RECIPES.md) |
| [`review-animations`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/SKILL.md) | Strict review of existing animation code | Encodes ten non-negotiable motion standards and a precise [standards reference](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md) |
| [`improve-animations`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/improve-animations/SKILL.md) | Read-only, codebase-wide motion audit and prioritized implementation plans | System-level audit using eight [audit categories](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/improve-animations/AUDIT.md) |
| [`find-animation-opportunities`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/find-animation-opportunities/SKILL.md) | Finds justified motion and explicitly rejects gratuitous motion | Read-only opportunity finder governed by frequency, purpose, speed, and function |
| [`animation-vocabulary`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animation-vocabulary/SKILL.md) | Reverse-lookup glossary for precise animation terminology | Covers entrances/exits, sequencing, movement, state transitions, scroll, feedback, easing, springs, ambient motion, polish, and performance |
| [`apple-design`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/apple-design/SKILL.md) | Apple's interface and fluid-motion principles translated to web | Response, direct manipulation, interruptibility, springs, velocity, momentum, materials, multimodal feedback, accessibility, and typography |
| [`pick-ui-library`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/pick-ui-library/SKILL.md) | Opinionated dependency selection by UI task | Prevents hand-rolled primitives and dependency drift |
| [`prototype`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/prototype/SKILL.md) | Builds genuinely different UI variants behind a visual picker | Formalizes exploration before promotion; includes a reusable [picker contract](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/prototype/PICKER.md) |
| [`ask-sonner`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/ask-sonner/SKILL.md) | Sonner installation, API choice, styling, recipes, and troubleshooting | Product-specific toast-system guidance backed by its [API reference](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/ask-sonner/API.md) |
| [`write-swift`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/write-swift/SKILL.md) | Modern Swift modeling, concurrency, API design, performance, testing, and migration | Part of the complete public repo, but not primarily a UI/design-system skill |

## Complete publicly named AI for UI bundle

The paid collection names these 20 skills publicly: `/prototype`, `/design-foundations`, `/typography`, `/color`, `/surfaces`, `/component-design`, `/design-vocabulary`, `/marketing-pages`, `/animations`, `/ui-polish`, `/performance`, `/touch-and-accessibility`, `/ask-lapse`, `/ask-emil`, `/writing-skills`, `/get-creative`, `/build-a-tool`, `/engineering-vocabulary`, `/forms-and-inputs`, and `/ui-review`. The course describes them as a prototype-to-polish UI workflow with taste encoding, delegation, review, and Lapse-assisted animation inspection. [Source: official AI for UI course page](https://aiforui.dev/)

Only those names and the marketing-page descriptions are public. Do not invent or mirror full rules for these paid files.

## Public design-system pattern catalogue

This is a synthesis of the open-source skills and Emil's first-party essays, not a claim that Emil publishes a conventional token/component design-system package.

### 1. Decision and taste layer

- **Taste is trained:** surround yourself with strong work, reverse-engineer it, articulate why it works, compare alternatives, and revisit with fresh eyes. Small, usually unnoticed choices compound into perceived quality. [`emil-design-eng`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/emil-design-eng/SKILL.md), [Developing Taste](https://emilkowal.ski/ui/developing-taste), [Train Your Judgement](https://emilkowal.ski/ui/train-your-judgement)
- **Motion needs a named purpose:** feedback, spatial consistency, state indication, preventing a jarring change, explanation, or rare delight. “It looks cool” is insufficient. [`animate`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate/SKILL.md)
- **Frequency is a design token in practice:** never animate keyboard/100+-times-per-day actions; drastically reduce tens-per-day motion; use normal motion for occasional interactions; reserve delight for rare or first-time moments. [You Don't Need Animations](https://emilkowal.ski/ui/you-dont-need-animations), [`find-animation-opportunities`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/find-animation-opportunities/SKILL.md)
- **Prototype to think, then validate:** build meaningfully different directions in isolation, compare them through a stable picker, and promote only the selected variant. [`prototype`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/prototype/SKILL.md), [Friction as a Feature](https://emilkowal.ski/ui/friction-as-a-feature)

### 2. Motion tokens

- **Easing decision:** enter/exit → strong `ease-out`; movement/morphing on screen → strong `ease-in-out`; hover/color → `ease`; constant motion → `linear`; never `ease-in` for ordinary UI entry. Recommended curves include `cubic-bezier(0.23, 1, 0.32, 1)` for UI ease-out, `cubic-bezier(0.77, 0, 0.175, 1)` for ease-in-out, and `cubic-bezier(0.32, 0.72, 0, 1)` for an iOS-like drawer. [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md)
- **Duration scale:** press feedback 100–160ms; tooltip/small popover 125–200ms; dropdown/select 150–250ms; modal/drawer 200–500ms; ordinary UI generally under 300ms; explanatory marketing motion may be longer. [You Don't Need Animations](https://emilkowal.ski/ui/you-dont-need-animations), [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md)
- **Spring scale:** use springs for momentum, living/decorative elements, interruptible gestures, and mouse-following; an approachable baseline is `{ type: "spring", duration: 0.5, bounce: 0.2 }`, with bounce usually restrained to 0.1–0.3. [`emil-design-eng`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/emil-design-eng/SKILL.md)
- **System rule:** reuse or extend existing easing/duration/spring tokens; do not create a parallel motion system. [`animate`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate/SKILL.md)

### 3. Component patterns

- **Pressables:** `scale(0.97)` on active/press for immediate feedback; roughly 0.95–0.98 is the useful range. [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips)
- **Entrances:** never animate from `scale(0)`; start around 0.9–0.97 with opacity. Prefer `@starting-style` for mount entry when browser support fits. [`emil-design-eng`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/emil-design-eng/SKILL.md)
- **Popover/dropdown/menu/tooltip:** place `transform-origin` at the trigger; a centered modal is the explicit exception. [Good vs Great Animations](https://emilkowal.ski/ui/good-vs-great-animations)
- **Tooltip group:** delay the first tooltip to avoid accidents, then remove delay and animation while moving among adjacent tooltips. [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips)
- **Toast:** make add/remove/swipe interruptible; enter and exit through the same edge; stack with visible depth, expand on hover, account for swipe velocity, pause timers while the document is hidden, and expose loading/promise/update/dismiss APIs. [Building a Toast Component](https://emilkowal.ski/ui/building-a-toast-component), [Sonner repository](https://github.com/emilkowalski/sonner)
- **Drawer/sheet:** use an anchored iOS-like curve or spring, 1:1 drag tracking, velocity-aware dismissal, friction/rubber-banding at limits, snap points where required, and a coherent background treatment. [Building a Drawer Component](https://emilkowal.ski/ui/building-a-drawer-component), [Vaul repository](https://github.com/emilkowalski/vaul)
- **Accordion/collapse:** height animation is a tolerated exception where transform has no equivalent; coordinate height and opacity by feel. [`animate` recipes](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate/RECIPES.md)
- **Tabs and state swaps:** duplicate foreground content and reveal the active copy with `clip-path` for exact color transitions; if an imperfect crossfade remains visible, use a small blur (around 2px) to bridge the states. [The Magic of Clip Path](https://emilkowal.ski/ui/the-magic-of-clip-path), [`emil-design-eng`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/emil-design-eng/SKILL.md)
- **Hold to confirm:** slow, linear progress while the user decides; fast ease-out reversal/release when the system responds. [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md)
- **Lists/groups:** stagger rare group entrances by about 30–80ms and never block interaction while the stagger plays. [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md)
- **Image/scroll reveal and comparison:** use `clip-path: inset()` to reveal without layout shift; use native observation or the already-installed motion layer rather than adding another dependency. [The Magic of Clip Path](https://emilkowal.ski/ui/the-magic-of-clip-path)

### 4. Gesture patterns

- Track the pointer 1:1 during direct manipulation, hand off velocity to the spring, and project toward where the gesture is going rather than only where it stopped. [`apple-design`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/apple-design/SKILL.md)
- Make gesture animation interruptible, use pointer capture, ignore additional touches once dragging starts, and prefer rising friction to a hard boundary. [`emil-design-eng`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/emil-design-eng/SKILL.md)
- Allow a fast flick to dismiss even without a large distance; the public standard uses velocity around `abs(distance) / elapsedMs > 0.11` as an example threshold. [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md)
- On Expo, prefer Reanimated/Gesture Handler worklets, keep continuous motion off the JS thread, design for press rather than hover, use haptics sparingly at meaningful thresholds, and verify on real devices/120Hz hardware. [`animate-expo`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate-expo/SKILL.md)

### 5. Performance and tool-selection patterns

- **Cheapest tool that fits:** CSS transition for simple state changes; `@starting-style` for mount entry; CSS animation for predetermined off-main-thread motion; WAAPI for programmatic control without a library; Motion for springs, layout/exit animation, and gesture-driven values. [`animate`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/animate/SKILL.md)
- Prefer `transform` and `opacity`; `clip-path` is the sanctioned specialist property. Avoid animating width, height, spacing, or positional layout properties unless no transform equivalent exists. [Great Animations](https://emilkowal.ski/ui/great-animations)
- Use CSS transitions instead of keyframes for rapidly retriggered UI because transitions retarget from the current value. Use a full transform string instead of Motion `x`/`y`/`scale` shorthands under load. [Great Animations](https://emilkowal.ski/ui/great-animations), [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md)
- Do not update an inherited CSS variable on a parent every frame to drive a child transform; set the target element's transform directly to avoid descendant style recalculation. [`emil-design-eng`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/emil-design-eng/SKILL.md)
- Use established accessible primitives and focused libraries rather than rebuilding them. Emil's current curated choices include Base UI, cmdk, Sonner, input-otp, Motion, NumberFlow, Recharts/Liveline, dnd kit, Virtuoso, Zustand, clsx, cva, and next-themes. [`pick-ui-library`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/pick-ui-library/SKILL.md)

### 6. Accessibility and input patterns

- Ship reduced-motion behavior with each animation. Keep comprehension-aiding opacity/color transitions, but remove or soften position and large movement. [Great Animations](https://emilkowal.ski/ui/great-animations)
- Gate hover motion with `@media (hover: hover) and (pointer: fine)` so touch taps do not create false hover behavior. [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md)
- Use proven primitives for focus management, dismissal, keyboard behavior, and screen-reader semantics; do not replace a dialog/menu/select with a styled `<div>`. [`pick-ui-library`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/pick-ui-library/SKILL.md)

### 7. Review and governance patterns

- Review motion against purpose/frequency, easing/duration, physicality/origin, interruptibility, performance, accessibility, cohesion/tokens, and missed opportunities. [`improve-animations` audit](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/improve-animations/AUDIT.md)
- Inspect uncertain motion slowed to 2–5×, frame by frame, on real hardware, and again with fresh eyes. Lapse extends that workflow by recording, scrubbing, commenting, and copying the exact state at a frame. [`STANDARDS.md`](https://github.com/emilkowalski/skills/blob/d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7/skills/review-animations/STANDARDS.md), [AI for UI](https://aiforui.dev/)
- Match motion personality to the product: playful surfaces may tolerate subtle bounce; dense professional tools should remain crisp. Cohesion beats mechanically applying the same tokens everywhere. [Great Animations](https://emilkowal.ski/ui/great-animations)

## First-party implementation and learning sources

- [Emil Kowalski's official site and writing index](https://emilkowal.ski/)
- [Animations on the Web](https://animations.dev/) — paid course covering animation theory, easing, timing, springs, CSS, Motion, performance, accessibility, and exercises
- [AI for Designers and Engineers](https://aiforui.dev/) — paid course and the separately licensed 20-skill UI bundle
- [Sonner](https://github.com/emilkowalski/sonner) and its [live documentation](https://sonner.emilkowal.ski/) — canonical toast-system implementation
- [Vaul](https://github.com/emilkowalski/vaul) and its [live documentation](https://vaul.emilkowal.ski/) — canonical drawer implementation

## Scope caveats

- “Every public skill” means the 12 complete skill packages in the public repository at the pinned snapshot. The 20 AI for UI names are public, but their full files are paid material.
- The pattern catalogue captures rules actually published in the open-source files and first-party articles. It does not reconstruct paid course lessons, private Vault resources, Discord material, newsletter-only posts, or volatile social posts without stable direct URLs.
- Emil publishes a philosophy, standards, recipes, selection rules, and component implementations—not a standalone, versioned visual design system with a complete public color/spacing/type token package.

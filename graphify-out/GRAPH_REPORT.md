# Graph Report - .  (2026-06-18)

## Corpus Check
- Large corpus: 32 files · ~882,776 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 78 nodes · 140 edges · 12 communities (6 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.89)
- Token cost: 15,420 input · 2,350 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Subsurface Simulation UI Components|Subsurface Simulation UI Components]]
- [[_COMMUNITY_Portfolio Sections Components|Portfolio Sections Components]]
- [[_COMMUNITY_Glassmorphism UI Primitives and CV|Glassmorphism UI Primitives and CV]]
- [[_COMMUNITY_Reservoir Grid and Plume Geometry|Reservoir Grid and Plume Geometry]]
- [[_COMMUNITY_Core App Structure and HeaderFooter|Core App Structure and Header/Footer]]
- [[_COMMUNITY_Claude Settings Configuration|Claude Settings Configuration]]
- [[_COMMUNITY_Vertical Equilibrium Simulation Logic|Vertical Equilibrium Simulation Logic]]
- [[_COMMUNITY_Simulation Visual Cells and Streamlines|Simulation Visual Cells and Streamlines]]
- [[_COMMUNITY_VS Code Workspace Settings|VS Code Workspace Settings]]
- [[_COMMUNITY_Claude Environment Config Node|Claude Environment Config Node]]
- [[_COMMUNITY_VS Code Config Node|VS Code Config Node]]
- [[_COMMUNITY_Project Readme Documentation|Project Readme Documentation]]

## God Nodes (most connected - your core abstractions)
1. `SubsurfaceHero()` - 16 edges
2. `capRockY()` - 15 edges
3. `App()` - 10 edges
4. `CVPage()` - 8 edges
5. `PublicationsList()` - 8 edges
6. `Subsurface()` - 8 edges
7. `GlassCard()` - 7 edges
8. `Plume()` - 7 edges
9. `AboutSection()` - 6 edges
10. `ResearchInterestsStrip()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Global Scope Script Loading Pattern` --rationale_for--> `App()`  [INFERRED]
  index.html → App.jsx
- `Timeline()` --semantically_similar_to--> `NEWS`  [INFERRED] [semantically similar]
  CVPage.jsx → HomeSections.jsx
- `Carbon Capture, Utilization, and Storage (CCUS)` --conceptually_related_to--> `SubsurfaceHero()`  [INFERRED]
  HomeSections.jsx → SubsurfaceHero.jsx
- `UI Kit Entry Index HTML` --references--> `React DOM Root Render`  [EXTRACTED]
  index.html → App.jsx
- `App()` --calls--> `CVPage()`  [EXTRACTED]
  App.jsx → CVPage.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Glassmorphism UI Primitives** — primitives_glasscard, primitives_glassbutton, primitives_sectionpanel [INFERRED 0.85]
- **Interactive CO2 Numerical Simulation Scene** — subsurfacehero_precomputesimulation, subsurfacehero_plume, subsurfacehero_well, subsurfacehero_wellhead, subsurfacehero_reservoirgrid [INFERRED 0.95]
- **Main Page Components Layout** — app_app, header_header, subsurfacehero_subsurfacehero, cvpage_cvpage, homesections_aboutsection, homesections_publicationslist, homesections_contactsection, footer_footer [INFERRED 0.95]

## Communities (12 total, 6 thin omitted)

### Community 0 - "Subsurface Simulation UI Components"
Cohesion: 0.22
Nodes (15): Carbon Capture, Utilization, and Storage (CCUS), Annotation(), BrandSocial(), CAP_ROCK_FILL, CAP_ROCK_UNDERSIDE, DepthAxis(), GasFeedAnimation(), Horizon() (+7 more)

### Community 1 - "Portfolio Sections Components"
Cohesion: 0.32
Nodes (12): Glassmorphism UI System Design, AboutSection(), ContactCard(), ContactSection(), NEWS, PUBLICATIONS, PublicationsList(), RESEARCH (+4 more)

### Community 2 - "Glassmorphism UI Primitives and CV"
Cohesion: 0.24
Nodes (10): CVPage(), CVSection(), SkillCategory(), Timeline(), Badge(), BADGE_TINTS, Divider(), GlassButton() (+2 more)

### Community 3 - "Reservoir Grid and Plume Geometry"
Cohesion: 0.30
Nodes (12): CapRockGrid(), capRockY(), getAquiferPath(), getBandPath(), getCapRockFillPath(), getCapRockPath(), getColumnPath(), getMeniscusPath() (+4 more)

### Community 4 - "Core App Structure and Header/Footer"
Cohesion: 0.22
Nodes (8): App(), root, React DOM Root Render, Global Scope Script Loading Pattern, Footer(), Header(), NavItem(), UI Kit Entry Index HTML

### Community 5 - "Claude Settings Configuration"
Cohesion: 0.50
Nodes (3): permissions, allow, deny

## Knowledge Gaps
- **11 isolated node(s):** `allow`, `deny`, `liveServer.settings.port`, `root`, `CAP_ROCK_UNDERSIDE` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App()` connect `Core App Structure and Header/Footer` to `Subsurface Simulation UI Components`, `Portfolio Sections Components`, `Glassmorphism UI Primitives and CV`?**
  _High betweenness centrality (0.508) - this node is a cross-community bridge._
- **Why does `SubsurfaceHero()` connect `Subsurface Simulation UI Components` to `Reservoir Grid and Plume Geometry`, `Core App Structure and Header/Footer`, `Vertical Equilibrium Simulation Logic`?**
  _High betweenness centrality (0.417) - this node is a cross-community bridge._
- **Why does `CVPage()` connect `Glassmorphism UI Primitives and CV` to `Core App Structure and Header/Footer`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **What connects `allow`, `deny`, `liveServer.settings.port` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
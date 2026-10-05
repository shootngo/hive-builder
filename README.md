# Frank's Hive Builder

Phone PWA for building Langstroth beehive boxes in the shop (plain HTML/CSS/JS, GitHub Pages, works offline).

**Live:** https://shootngo.github.io/hive-builder/

## Features
- **Parts**: deep / medium / shallow boxes (8- or 10-frame, 3/4" or 7/8" stock), solid or screened bottom board, inner cover, telescoping cover, frames, entrance reducer, and stand. Each one has dimensioned SVG diagrams with pinch-zoom and a box-joint finger layout.
- **Cut list**: hives × stack, species, thickness, joint, board widths and lengths. Gives part / qty / T×W×L / operation, an optimized board layout (SVG), board feet and waste %.
- **Steps**: one step per screen with a figure, tool settings, safety notes and a big Done checkbox. Progress is saved per build.
- **Builds**: tracker in IndexedDB with cut/built checkoffs, photos and notes. Export/import JSON.
- **Cost**: editable estimate prices and a shopping-list export.
- Units toggle (1/16" fractions ↔ mm), dark shop theme, big tap targets.
- **MS** tab: north Mississippi care tips, each linked to MSU Extension / MDAC / USDA sources.
- **Materials mode** (V 1.1): *Solid boards* (the original behavior, default) or *Cedar fence boards* (tongue-and-groove or dog-eared pickets). Fence mode assumes actual 5/8" × 5 1/2" × 6' (or 8') stock, edge-joins 2 boards per wall, holds the inside at standard size so frames fit (outside shrinks to 19 5/8" × 16" for 10-frame), and recalculates the cut list, joined-board counts, board layout, costs and shopping list. It shows structural warnings inline, marks the parts that stay solid (bottom rails, covers, reducer, cleats), and adds edge-joining build steps (rip, spline/dowel, Titebond III glue-up, clamp, cleats screwed across the joint).
- Build locations are fixed: Southaven, MS and Olive Branch, MS.
- ☰ menu: Check for update, units, Specs & corrections, About (V 1.1).

## Release
Bump `CACHE` in `sw.js` and `HB_VERSION` in `index.html` together. Icons are stored as `.hex` and decoded by the Pages workflow.

Dimensions come from Beesource 10-frame plans, MSU Extension Pub. 3594, and Dadant. See Specs in the app.

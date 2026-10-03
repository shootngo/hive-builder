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
- ☰ menu: Check for update, units, Specs & corrections, About (V 1.0).

## Release
Bump `CACHE` in `sw.js` and `HB_VERSION` in `index.html` together. Icons are stored as `.hex` and decoded by the Pages workflow.

Dimensions come from Beesource 10-frame plans, MSU Extension Pub. 3594, and Dadant. See Specs in the app.

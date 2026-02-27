# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GridFlow is a client-side React web app for creating image grid collages. It has two phases:
- **Phase 1 (layout)**: Users arrange images into customizable grid layouts with draggable dividers, styling options, and real-time preview.
- **Phase 2 (finetune)**: The grid layout converts to a free canvas where each image is an independent element supporting move, resize (8 handles), and rotate. Elements can overlap freely; layer order is adjustable.

Both phases export 2400px-wide high-resolution PNG. All UI text is in Simplified Chinese.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build → dist/
npm run preview      # Preview production build
```

No test framework is configured. Testing is manual via `npm run dev`.

## Architecture

**Stack**: React 18 + Vite 5 + native Canvas API. CSS is co-located per component (no preprocessors).

**State flow**: Top-down props from `App.jsx`, which holds all root state (config, images, layout) via React hooks (`useState`, `useCallback`, `useRef`). No external state management library.

**Key components**:
- `App.jsx` — Root state: grid count, aspect ratio, padding, corner radius, background color, images map, layout ratios. Also holds `phase` (`'layout'`|`'finetune'`), `elements` (FinetuneElement[]), `canvasDisplaySize`, `selectedId`. `handleEnterFinetune` reads the grid canvas `getBoundingClientRect`, calls `calculateLayout`, builds the elements array, then switches phase.
- `GridLayout.jsx` — Phase 1. Generates layout structures for 1-9 images using 8 predefined layout types plus auto-grid. Renders cells and dividers. Accepts `onCanvasRef` prop to expose the `.canvas-wrapper` DOM node.
- `ImageCell.jsx` — Handles image input (drag-and-drop, click-to-select, clipboard paste via Ctrl+V on hovered cell). Uses FileReader API for file→base64 conversion.
- `Divider.jsx` — Draggable dividers between cells. Converts pixel deltas to percentage ratios (clamped 20%-80%). Uses document-level mouse listeners.
- `ControlPanel.jsx` — Settings sidebar. Phase 1: layout/styling/export. Phase 2: return button, selected element properties (x/y/w/h/rotation/cornerRadius), crop controls (cropZoom/cropOffsetX/cropOffsetY), layer order buttons, export.
- `FinetuneCanvas.jsx` — Phase 2 canvas container. `position: relative; width: 90%; max-width: 1200px` (must match `.canvas-wrapper` sizing so element coordinates align). Renders `FinetuneElementItem` per element.
- `FinetuneElementItem.jsx` — Phase 2 element. Handles move/resize/rotate via document-level mousemove/mouseup. Resize math: anchor stays fixed; new center = midpoint(anchor, mouse); mouse→local via inverse rotation `(dx·cosθ + dy·sinθ, -dx·sinθ + dy·cosθ)`; edge handles project mouse onto local axis before computing center. Image crop: `<div overflow:hidden>` wrapper + `<img>` with `transform: translate(-50%,-50%) translate(cropOffsetX%, cropOffsetY%) scale(cropZoom)`.

**FinetuneElement data shape**:
```js
{ id, x, y, width, height, rotation, src, cornerRadius, cropOffsetX, cropOffsetY, cropZoom }
// x/y in CSS px relative to finetune-canvas; rotation in degrees (CSS clockwise)
// array index = z-index (higher index = top layer)
// cropOffsetX/Y: -100 to 100 (%), cropZoom: 0.1 to 2.0 (default 1)
```

**Export pipeline** (`utils/exportCanvas.js`):
- `renderToCanvas()` — Phase 1 shared canvas rendering
- `calculateLayout()` — converts layout ratios to absolute pixel coordinates (exported, used by both phases)
- `drawImageToCell()` — renders each image with center-crop and rounded corner clipping via Canvas API
- `exportToImage()` / `copyToClipboard()` — Phase 1 download/clipboard
- `renderFinetunedToCanvas()` — Phase 2: scale = 2400/displayWidth; per element: `ctx.translate(cx·scale, cy·scale)` → `ctx.rotate(rad)` → rounded-rect clip → cover baseW/baseH × cropZoom → offset by cropOffsetX/Y (relative to scaled image size) → drawImage
- `exportFinetuned()` / `copyFinetuned()` — Phase 2 download/clipboard

## Conventions

- Functional components with hooks only
- Event handlers prefixed with `handle*`
- CSS uses BEM-like naming (`.control-section`, `.delete-button`)
- State classes: `.dragging`, `.has-image`
- `fabric` is listed as a dependency but not imported anywhere (legacy/future)

## Layout Types

The 8 predefined layouts in `GridLayout.jsx`: `single`, `horizontal`, `left-right-1x2`, `grid-2x2`, `left-right-2x2`, `grid-2x3`, `left-right-2x3`, `left2-right-2x3`, plus `grid-auto` for 9+ images.

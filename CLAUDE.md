# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GridFlow is a client-side React web app for creating image grid collages. Users arrange multiple images into customizable grid layouts with styling options, real-time preview, and high-resolution PNG export (2400px width). All UI text is in Simplified Chinese.

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
- `App.jsx` — Root state: grid count, aspect ratio, padding, corner radius, background color, images map, layout ratios
- `GridLayout.jsx` — Generates layout structures for 1-9 images using 8 predefined layout types plus auto-grid. Renders cells and dividers
- `ImageCell.jsx` — Handles image input (drag-and-drop, click-to-select, clipboard paste via Ctrl+V on hovered cell). Uses FileReader API for file→base64 conversion
- `Divider.jsx` — Draggable dividers between cells. Converts pixel deltas to percentage ratios (clamped 20%-80%). Uses document-level mouse listeners
- `ControlPanel.jsx` — Settings sidebar (layout, styling, export and copy-to-clipboard)

**Export pipeline** (`utils/exportCanvas.js`):
- `renderToCanvas()` shared canvas rendering (used by both export and copy)
- `calculateLayout()` converts layout ratios to absolute pixel coordinates
- `drawImageToCell()` renders each image with center-crop and rounded corner clipping via Canvas API
- `exportToImage()` downloads PNG as `gridflow-[timestamp].png`
- `copyToClipboard()` writes PNG to system clipboard via `navigator.clipboard.write` + `ClipboardItem`

## Conventions

- Functional components with hooks only
- Event handlers prefixed with `handle*`
- CSS uses BEM-like naming (`.control-section`, `.delete-button`)
- State classes: `.dragging`, `.has-image`
- `fabric` is listed as a dependency but not imported anywhere (legacy/future)

## Layout Types

The 8 predefined layouts in `GridLayout.jsx`: `single`, `horizontal`, `left-right-1x2`, `grid-2x2`, `left-right-2x2`, `grid-2x3`, `left-right-2x3`, `left2-right-2x3`, plus `grid-auto` for 9+ images.

# NBA Second Apron Risk Dashboard

A single-page dashboard for modeling NBA team payrolls against the second
apron across four seasons, with a drag-and-drop roster editor and trade
simulator that validates trades against CBA salary-matching and apron rules.

Team names are real; player names, ages, and contract figures are
procedurally generated placeholder data (deterministic seed), not actual
2026 Spotrac/Hoopshype figures.

## Stack

React 19 + TypeScript, Zustand, @dnd-kit, Tailwind CSS v4, Vite.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Features

- Team grid with risk-level filtering, sorting, and search
- Slide-out team detail panel: 4-year cap projection, extensions, trade candidates
- Edit Mode: drag-and-drop (or keyboard "Move →") players between two teams,
  add/edit/remove players, propose trades with live CBA validation
- Undo/redo (Ctrl+Z / Ctrl+Y) with a bounded history stack
- Export/import roster state as JSON; auto-saves to localStorage

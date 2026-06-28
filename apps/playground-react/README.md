# playground-react

React 19 development sandbox for forge-ui primitives. All 22 components wired up in a single-page demo with live interaction.

## Run

```bash
# From repo root
pnpm dev --filter playground-react

# Or from this directory
pnpm dev
```

Opens at `http://localhost:5174` (Vite dev server).

## What's included

- All 22 forge-ui primitives with interactive examples
- Slider: horizontal with marks, range (2 thumbs), vertical
- Combobox: single, async, creatable, multi-select with TagsInput
- DatePicker / DateRangePicker: min/max constraints, forceMount for CSS animations
- Select: virtual scroll demo with `allOptions`

## Stack

- React 19
- Vite 6
- `@forge-ui/react` (local workspace package)

# playground-react

React 19 development sandbox for forge-ui primitives. All 28 components wired up in a single-page demo with live interaction.

## Run

```bash
# From repo root
bun dev:react

# Or from this directory
bun dev
```

Opens at `http://localhost:3000` (Vite dev server).

## What's included

- All 28 forge-ui primitives with interactive examples
- Toggle / Toggle Group — pressed state, single/multiple toolbar selection
- Avatar — image load FSM, fallback with delayMs, auto-initials
- Separator — horizontal and vertical variants
- Slider — horizontal with marks, range (2 thumbs), vertical
- Combobox — single, async, creatable, multi-select with TagsInput
- DatePicker / DateRangePicker — min/max constraints, forceMount for CSS animations
- Select — virtual scroll demo with `allOptions`
- Menu — keyboard navigation, separator, disabled items

## Stack

- React 19
- Vite 6
- `@forge-ui/react` (local workspace package)

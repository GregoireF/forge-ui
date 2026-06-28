# playground-vue

Vue 3.5 development sandbox for forge-ui primitives. All 22 components wired up with Vue namespace imports and composables.

## Run

```bash
# From repo root
pnpm dev --filter playground-vue

# Or from this directory
pnpm dev
```

Opens at `http://localhost:5175` (Vite dev server).

## What's included

- All 22 forge-ui primitives with interactive examples
- Namespace imports (`Dialog.Root`, `Select.Root`, etc.)
- Composable usage (`useDialog()`, `useSelect()`)
- Slider: marks, range, vertical
- Combobox: multi-select with TagsInput
- DatePicker / DateRangePicker with forceMount

## Stack

- Vue 3.5
- Vite 6
- `@forge-ui/vue` (local workspace package)

# playground-vue

Vue 3.5 development sandbox for forge-ui primitives. All 28 components wired up with Vue namespace imports and composables.

## Run

```bash
# From repo root
bun dev:vue

# Or from this directory
bun dev
```

Opens at `http://localhost:3001` (Vite dev server).

## What's included

- All 28 forge-ui primitives with interactive examples
- Namespace imports (`Dialog.Root`, `Select.Root`, etc.)
- Composable usage (`useDialog()`, `useSelect()`)
- Toggle / Toggle Group — v-model:pressed, single/multiple toolbar
- Avatar — image load FSM, fallback, injectAvatarContext() for initials
- Separator — horizontal and vertical variants
- Slider — marks, range, vertical
- Combobox — multi-select with TagsInput
- DatePicker / DateRangePicker with forceMount

## Stack

- Vue 3.5
- Vite 6
- `@forge-ui/vue` (local workspace package)

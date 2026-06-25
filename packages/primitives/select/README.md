# @forge-ui/select

Framework-agnostic Select machine and connect function. Implements the WAI-ARIA 1.2 [Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) pattern. Supports groups, separators, multi-select, typeahead, and virtual scroll.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. Use directly only for custom framework bindings.

## Install

```bash
npm install @forge-ui/select
```

## API

### `createSelectMachine(options)`

```ts
import { createSelectMachine } from '@forge-ui/select'

const machine = createSelectMachine({
  id: 'framework',
  options: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular', disabled: true },
  ],
  placeholder: 'Pick a framework…',
  onValueChange: (values) => console.log(values),
  onOpenChange: (open) => console.log('open:', open),
})

machine.start()
machine.send('OPEN')
machine.send({ type: 'SELECT_OPTION', value: 'react' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `options` | `SelectOption[]` | `[]` |
| `value` | `string[]` | `[]` |
| `defaultValue` | `string[]` | `[]` |
| `multiple` | `boolean` | `false` |
| `placeholder` | `string` | `""` |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `positioning` | `FloatingPositioning` | `{ placement: 'bottom' }` |
| `allOptions` | `SelectOption[]` | — |
| `onHighlightedScroll` | `(value: string, index: number) => void` | — |
| `onValueChange` | `(values: string[]) => void` | — |
| `onOpenChange` | `(open: boolean) => void` | — |
| `onHighlightChange` | `(value: string \| null) => void` | — |

```ts
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
```

### Virtual scroll

For thousands of options, pass a static `allOptions` list and hook up a virtualizer via `onHighlightedScroll`. The machine uses `allOptions` for keyboard navigation and typeahead, while you render only the visible slice:

```ts
const machine = createSelectMachine({
  id: 'lang',
  options: visibleSlice,          // rendered slice (e.g. 20 items)
  allOptions: allThousandOptions, // full list for navigation
  onHighlightedScroll: (value, index) => {
    virtualizerRef.scrollToIndex(index)
  },
})
```

### Events

| Event | Description |
|---|---|
| `OPEN` | Open the listbox |
| `CLOSE` | Close the listbox |
| `TOGGLE` | Toggle open/closed |
| `ESCAPE_KEY` | Close via Escape |
| `SELECT_OPTION { value }` | Select a specific option |
| `SELECT_HIGHLIGHTED` | Select the currently highlighted option (Enter/Space) |
| `HIGHLIGHT_OPTION { value }` | Highlight a specific option |
| `HIGHLIGHT_NEXT` | Move highlight down (ArrowDown) |
| `HIGHLIGHT_PREV` | Move highlight up (ArrowUp) |
| `HIGHLIGHT_FIRST` | Move to first option (Home) |
| `HIGHLIGHT_LAST` | Move to last option (End) |
| `REGISTER_OPTION { option }` | Register an option (on mount) |
| `UNREGISTER_OPTION { value }` | Unregister an option (on unmount) |

### `connectSelect(snapshot, send, machine)`

```ts
import { connectSelect } from '@forge-ui/select'

const api = connectSelect(machine.getSnapshot(), machine.send, machine)

api.isOpen           // boolean
api.value            // string[]   selected values
api.highlighted      // string | null
api.options          // SelectOption[]  effective options (allOptions ?? options)
api.valueLabelMap    // Record<string, string>  persistent label map

api.getLabelProps()
api.getTriggerProps()         // button — role, aria-haspopup, aria-expanded, aria-controls
api.getValueProps()           // displays selected label
api.getPlaceholderProps()     // shown when no value
api.getIndicatorProps()       // chevron/arrow indicator
api.getPositionerProps()      // floating positioner div
api.getContentProps()         // role="listbox"
api.getOptionProps({ value, disabled })  // role="option", aria-selected, mouse/keyboard handlers
api.getGroupProps()           // role="group"
api.getGroupLabelProps()      // group label
api.getSeparatorProps()       // role="separator"
api.getItemTextProps()        // span for option text
api.getItemIndicatorProps()   // indicator shown when option is selected
```

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"select"` | all |
| `data-forge-part` | `"trigger"` / `"content"` / `"option"` / `"group"` / … | |
| `data-state` | `"open"` / `"closed"` | trigger, content |
| `data-selected` | `""` | selected options |
| `data-highlighted` | `""` | keyboard-focused option |
| `data-disabled` | `""` | disabled elements |

## States

| State | Description |
|---|---|
| `closed` | Listbox hidden |
| `open` | Listbox visible |

## WAI-ARIA

- Trigger: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`
- Content: `role="listbox"`, `aria-multiselectable` (when multiple)
- Options: `role="option"`, `aria-selected`, `aria-disabled`
- Typeahead: printable character keys match option labels (case-insensitive, cycles through matches)

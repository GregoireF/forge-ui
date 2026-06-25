# @forge-ui/combobox

Framework-agnostic Combobox machine and connect function. Implements the WAI-ARIA 1.2 [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). Supports client-side filter, async loading, multi-select, option creation, groups, virtual scroll, and TagsInput.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. Use directly only for custom framework bindings.

## Install

```bash
npm install @forge-ui/combobox
```

## API

### `createComboboxMachine(options)`

```ts
import { createComboboxMachine } from '@forge-ui/combobox'

const machine = createComboboxMachine({
  id: 'lang',
  options: [
    { value: 'ts', label: 'TypeScript' },
    { value: 'js', label: 'JavaScript' },
    { value: 'rs', label: 'Rust', disabled: true },
  ],
  onValueChange: (values) => console.log(values),
})

machine.start()
machine.send('OPEN')
machine.send({ type: 'INPUT_CHANGE', value: 'type' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `options` | `ComboboxOption[]` | `[]` |
| `value` | `string[]` | `[]` |
| `defaultValue` | `string[]` | `[]` |
| `multiple` | `boolean` | `false` |
| `placeholder` | `string` | — |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `filterFn` | `(option, inputValue) => boolean` | case-insensitive substring |
| `onInputChange` | `(value: string) => void` | — |
| `isLoading` | `boolean` | `false` |
| `allOptions` | `ComboboxOption[]` | — |
| `onHighlightedScroll` | `(value: string, index: number) => void` | — |
| `onCreateOption` | `(value: string) => void` | — |
| `translations` | `Partial<ComboboxTranslations>` | — |
| `onValueChange` | `(values: string[]) => void` | — |
| `onOpenChange` | `(open: boolean) => void` | — |
| `onHighlightChange` | `(value: string \| null) => void` | — |
| `positioning` | `FloatingPositioning` | `{ placement: 'bottom' }` |

```ts
interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}
```

### Modes

**Client-side filter** (default): machine filters `options` against `inputValue` using `filterFn`.

**Async filter**: set `onInputChange` to fetch and replace `options` externally. The machine renders all provided `options` unfiltered. Set `isLoading: true` while fetching — it adds `aria-busy="true"` to the listbox.

**Virtual scroll**: pass `allOptions` (full dataset) and `onHighlightedScroll` for keyboard navigation through thousands of items while rendering only the visible slice in `options`.

**Multi-select**: set `multiple: true`. Selecting an already-selected option deselects it.

**Creatable**: set `onCreateOption`. When no option matches the current input, `hasCreateOption` becomes `true`. Render `<Combobox.CreateOption>` inside Content; clicking or pressing Enter fires `onCreateOption(inputValue)`.

### Events

| Event | Description |
|---|---|
| `OPEN` / `CLOSE` | Open or close the listbox |
| `INPUT_CHANGE { value }` | User typed in the input |
| `SELECT_OPTION { value }` | Select/deselect a specific option |
| `SELECT_HIGHLIGHTED` | Select keyboard-highlighted option |
| `HIGHLIGHT_OPTION { value }` | Highlight a specific option |
| `HIGHLIGHT_NEXT` / `HIGHLIGHT_PREV` | Arrow key navigation |
| `HIGHLIGHT_FIRST` / `HIGHLIGHT_LAST` | Home / End |
| `CLEAR` | Clear input and selection |
| `CREATE_OPTION` | Create option from current inputValue |
| `REGISTER_OPTION { option }` | Register on mount |
| `UNREGISTER_OPTION { value }` | Unregister on unmount |

### `connectCombobox(snapshot, send, machine)`

```ts
import { connectCombobox } from '@forge-ui/combobox'

const api = connectCombobox(machine.getSnapshot(), machine.send, machine)

api.isOpen             // boolean
api.inputValue         // string   current text in input
api.value              // string[] selected values
api.valueLabel         // string   label of first selected value
api.valueLabels        // string[] labels of all selected values
api.selectedLabels     // Record<string, string>  value → label map for selected items
api.filteredOptions    // ComboboxOption[]  options after filtering
api.hasCreateOption    // boolean  true when no option matches inputValue
api.createOptionLabel  // string   current inputValue (for "Create …" label)
api.isDisabled         // boolean
api.isReadOnly         // boolean

api.getLabelProps()
api.getInputProps()          // role="combobox", aria-expanded, aria-controls, aria-activedescendant
api.getTriggerProps()        // toggle button
api.getClearTriggerProps()   // clear button
api.getPositionerProps()     // floating positioner
api.getContentProps()        // role="listbox", aria-busy (when isLoading)
api.getOptionProps({ value, disabled })  // role="option", aria-selected
api.getCreateOptionProps()   // "Create" list item
```

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"combobox"` | all |
| `data-forge-part` | `"input"` / `"content"` / `"option"` / `"tag"` / `"tag-delete"` / … | |
| `data-state` | `"open"` / `"closed"` | input, content |
| `data-selected` | `""` | selected options |
| `data-highlighted` | `""` | keyboard-focused option |
| `data-disabled` | `""` | disabled elements |

## States

| State | Description |
|---|---|
| `closed` | Listbox hidden |
| `open` | Listbox visible — input focused, options rendered |

## WAI-ARIA

- Input: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`
- Content: `role="listbox"`, `aria-busy` (async loading)
- Options: `role="option"`, `aria-selected`, `aria-disabled`
- Multi-select: `aria-multiselectable="true"` on listbox

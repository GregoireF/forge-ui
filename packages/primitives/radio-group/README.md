# @forge-ui/radio-group

Framework-agnostic Radio Group machine and connect function. WAI-ARIA [Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/). Keyboard navigation with roving tabindex. Renders hidden `<input type="radio">` elements for form submission.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/radio-group
```

## API

### `createRadioGroupMachine(options)`

```ts
import { createRadioGroupMachine } from '@forge-ui/radio-group'

const machine = createRadioGroupMachine({
  id: 'plan',
  defaultValue: 'pro',
  name: 'plan',
  orientation: 'vertical',
  onValueChange: (value) => console.log(value),
})

machine.start()
machine.send({ type: 'SELECT', value: 'enterprise' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `string` | — |
| `defaultValue` | `string` | — |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |
| `name` | `string` | auto |
| `onValueChange` | `(value: string) => void` | — |

### Events

| Event | Payload | Description |
|---|---|---|
| `SELECT` | `{ value: string }` | Select a radio item |
| `SET_VALUE` | `{ value: string }` | Same as SELECT |

### `connectRadioGroup(snapshot, send, machine)`

```ts
const api = connectRadioGroup(machine.getSnapshot(), machine.send, machine)

api.value     // string  currently selected value
api.disabled  // boolean

api.getRootProps()                        // role="radiogroup", aria-orientation
api.getItemProps(value)                   // per-item container — click handler, data-state
api.getRadioProps(value)                  // the visual radio circle — data-state, data-checked
api.getLabelProps(value)                  // text label for the item
api.getHiddenInputProps(value)            // hidden <input type="radio"> for form submission
```

## States

The machine tracks the selected `value` string. Each item is either checked or unchecked.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"radio-group"` | all |
| `data-forge-part` | `"root"` / `"item"` / `"radio"` / `"label"` | |
| `data-state` | `"checked"` / `"unchecked"` | item, radio |
| `data-disabled` | `""` | disabled elements |
| `data-required` | `""` | required elements |
| `data-orientation` | `"horizontal"` / `"vertical"` | root |

## WAI-ARIA

- Root: `role="radiogroup"`, `aria-orientation`, `aria-required`
- Items use roving tabindex: the selected item (or first item if nothing is selected) has `tabIndex={0}`, all others have `tabIndex={-1}`
- Hidden inputs carry the `name` attribute for form serialization

**Keyboard navigation** (within the group):
- `ArrowDown` / `ArrowRight` → select next item
- `ArrowUp` / `ArrowLeft` → select previous item
- `Home` → first item
- `End` → last item

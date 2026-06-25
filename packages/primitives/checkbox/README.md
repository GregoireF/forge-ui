# @forge-ui/checkbox

Framework-agnostic Checkbox machine and connect function. WAI-ARIA [Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/). Supports tri-state (`checked` / `unchecked` / `indeterminate`) and Checkbox Group with select-all logic. Renders a hidden `<input type="checkbox">` for form submission.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/checkbox
```

## API

### `createCheckboxMachine(options)`

```ts
import { createCheckboxMachine } from '@forge-ui/checkbox'

const machine = createCheckboxMachine({
  id: 'terms',
  defaultChecked: false,
  name: 'terms',
  required: true,
  onCheckedChange: (checked) => console.log(checked), // true | false | "indeterminate"
})

machine.start()
machine.send('TOGGLE')
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `checked` | `boolean \| "indeterminate"` | — |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `name` | `string` | — |
| `value` | `string` | `"on"` |
| `form` | `string` | — |
| `onCheckedChange` | `(checked: boolean \| "indeterminate") => void` | — |

### Events

| Event | Description |
|---|---|
| `TOGGLE` | Cycle: unchecked → checked → unchecked (indeterminate → checked) |
| `CHECK` | Force to checked |
| `UNCHECK` | Force to unchecked |
| `SET_INDETERMINATE` | Force to indeterminate |

### `connectCheckbox(snapshot, send, machine)`

```ts
const api = connectCheckbox(machine.getSnapshot(), machine.send, machine)

api.checked        // boolean | "indeterminate"
api.isChecked      // boolean  (true only when checked, not indeterminate)
api.isIndeterminate // boolean
api.dataState      // "checked" | "unchecked" | "indeterminate"
api.isDisabled     // boolean
api.isRequired     // boolean
api.isReadOnly     // boolean

api.getRootProps()          // wrapper — can be a label
api.getControlProps()      // visual checkbox — data-state
api.getIndicatorProps()    // checkmark shown when checked/indeterminate
api.getLabelProps()        // text label
api.getHiddenInputProps()  // hidden <input type="checkbox"> — aria-hidden, tabIndex={-1}
```

## Checkbox Group

The Group layer is separate from the single-checkbox machine. It manages a `string[]` of checked values and exposes a select-all control with partial/indeterminate state.

```ts
import { createCheckboxGroupMachine } from '@forge-ui/checkbox'

const machine = createCheckboxGroupMachine({
  id: 'options',
  defaultValue: ['a'],
  onValueChange: (values) => console.log(values),
})

// Items register themselves — the group derives isAll/isPartial
const api = connectCheckboxGroup(machine.getSnapshot(), machine.send, machine)

api.value                // string[]  checked item values
api.isAll                // boolean   all items checked
api.isPartial            // boolean   some (but not all) checked — drive select-all indeterminate state

api.getGroupAllProps()   // select-all checkbox control
api.getItemProps(value)  // individual checkbox within the group
```

## States

| State | `data-state` |
|---|---|
| `unchecked` | `"unchecked"` |
| `checked` | `"checked"` |
| `indeterminate` | `"indeterminate"` |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"checkbox"` | all |
| `data-forge-part` | `"root"` / `"control"` / `"indicator"` / `"label"` | |
| `data-state` | `"checked"` / `"unchecked"` / `"indeterminate"` | root, control, indicator |
| `data-disabled` | `""` | disabled elements |
| `data-required` | `""` | required elements |
| `data-invalid` | `""` | invalid elements |

## WAI-ARIA

Control renders `role="checkbox"` with:
- `aria-checked`: `"true"` / `"false"` / `"mixed"` (indeterminate)
- `aria-disabled`, `aria-required`

The hidden input is `aria-hidden="true"` and `tabIndex={-1}` — it exists solely for form serialization.

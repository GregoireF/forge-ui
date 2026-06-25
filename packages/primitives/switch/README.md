# @forge-ui/switch

Framework-agnostic Switch machine and connect function. WAI-ARIA [Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/). Renders a visually hidden `<input type="checkbox">` for form submission.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/switch
```

## API

### `createSwitchMachine(options)`

```ts
import { createSwitchMachine } from '@forge-ui/switch'

const machine = createSwitchMachine({
  id: 'dark-mode',
  defaultChecked: false,
  name: 'darkMode',
  onCheckedChange: (checked) => console.log(checked),
})

machine.start()
machine.send('TOGGLE')
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `checked` | `boolean` | — |
| `defaultChecked` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `name` | `string` | — |
| `value` | `string` | `"on"` |
| `form` | `string` | — |
| `onCheckedChange` | `(checked: boolean) => void` | — |

### Events

| Event | Description |
|---|---|
| `TOGGLE` | Toggle checked state |
| `CHECK` | Force to checked |
| `UNCHECK` | Force to unchecked |

### `connectSwitch(snapshot, send, machine)`

```ts
const api = connectSwitch(machine.getSnapshot(), machine.send, machine)

api.isChecked    // boolean
api.dataState    // "checked" | "unchecked"
api.isDisabled   // boolean
api.isRequired   // boolean
api.isReadOnly   // boolean
api.isInvalid    // boolean

api.getRootProps()        // label wrapper — htmlFor wiring
api.getControlProps()    // the visual toggle element — role="switch", aria-checked
api.getThumbProps()      // the sliding indicator inside Control
api.getLabelProps()      // text label
api.getHiddenInputProps() // hidden <input type="checkbox"> for forms
```

## States

| State | `data-state` |
|---|---|
| `off` | `"unchecked"` |
| `on` | `"checked"` |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"switch"` | all |
| `data-forge-part` | `"root"` / `"control"` / `"thumb"` / `"label"` | |
| `data-state` | `"checked"` / `"unchecked"` | root, control, thumb |
| `data-disabled` | `""` | disabled elements |
| `data-required` | `""` | required elements |
| `data-invalid` | `""` | invalid elements |
| `data-readonly` | `""` | read-only elements |

## WAI-ARIA

Control renders `role="switch"` with `aria-checked`, `aria-disabled`, `aria-required`. The hidden input is `tabIndex={-1}` and `aria-hidden` — it exists only for form serialization.

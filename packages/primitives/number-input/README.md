# @forge-ui/number-input

Framework-agnostic Number Input machine and connect function. WAI-ARIA [Spinbutton Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/). Locale-aware formatting, continuous spin on press-and-hold, min/max clamping, step/page step.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/number-input
```

## API

### `createNumberInputMachine(options)`

```ts
import { createNumberInputMachine } from '@forge-ui/number-input'

const machine = createNumberInputMachine({
  id: 'qty',
  defaultValue: 1,
  min: 0,
  max: 99,
  step: 1,
  largeStep: 10,    // used with Page Up / Page Down
  fractionDigits: 0,
  locale: 'en-US',
  onValueChange: ({ value, valueAsNumber }) => console.log(valueAsNumber),
  onValueCommit: ({ value, valueAsNumber }) => console.log('committed', valueAsNumber),
})

machine.start()
machine.send('INCREMENT')
machine.send({ type: 'SET_VALUE', value: '5' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `string` | — |
| `defaultValue` | `number \| string` | — |
| `min` | `number` | `-Infinity` |
| `max` | `number` | `Infinity` |
| `step` | `number` | `1` |
| `largeStep` | `number` | `10` |
| `fractionDigits` | `number` | `0` |
| `locale` | `string` | `"en-US"` |
| `formatOptions` | `Intl.NumberFormatOptions` | — |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `allowEmpty` | `boolean` | `false` |
| `getValueLabel` | `(value: number) => string` | — |
| `onValueChange` | `({ value, valueAsNumber }) => void` | — |
| `onValueCommit` | `({ value, valueAsNumber }) => void` | — |
| `onFocus` | `(event) => void` | — |
| `onBlur` | `(event) => void` | — |

### Events

| Event | Description |
|---|---|
| `INCREMENT` | Add `step` (ArrowUp) |
| `DECREMENT` | Subtract `step` (ArrowDown) |
| `INCREMENT_PAGE` | Add `largeStep` (Page Up) |
| `DECREMENT_PAGE` | Subtract `largeStep` (Page Down) |
| `SET_MIN` | Jump to `min` (Home) |
| `SET_MAX` | Jump to `max` (End) |
| `SET_VALUE { value }` | Set an exact value string |
| `SET_INPUT_TEXT { value }` | Live input text (during typing) |
| `FOCUS` / `BLUR` | Focus management |
| `SPIN_START_UP` / `SPIN_START_DOWN` | Start continuous spin on press-and-hold |
| `SPIN_STOP` | Stop continuous spin on pointerup |

### `connectNumberInput(snapshot, send, machine)`

```ts
const api = connectNumberInput(machine.getSnapshot(), machine.send, machine)

api.value        // string  formatted value (e.g. "1,234.56")
api.inputText    // string  live input text (may be partially typed)
api.focused      // boolean
api.isSpinning   // boolean

api.getLabelProps()              // <label>
api.getControlProps()           // wrapper for input + buttons
api.getInputProps()             // role="spinbutton", aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext
api.getIncrementTriggerProps()  // + button — onPointerDown (spin), aria-label
api.getDecrementTriggerProps()  // − button — onPointerDown (spin), aria-label
api.getHiddenInputProps()       // hidden <input> for form submission with numeric value
```

## States

| State | Description |
|---|---|
| `idle` | No interaction |
| `focused` | Input is focused |
| `spinning.up` | Press-and-hold on increment |
| `spinning.down` | Press-and-hold on decrement |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"number-input"` | all |
| `data-forge-part` | `"label"` / `"control"` / `"input"` / `"increment-trigger"` / `"decrement-trigger"` | |
| `data-focused` | `""` | control when input is focused |
| `data-disabled` | `""` | disabled elements |
| `data-invalid` | `""` | value outside min/max |
| `data-spinning` | `"up"` / `"down"` | control while spinning |

## WAI-ARIA

- Input: `role="spinbutton"`, `aria-valuenow` (numeric), `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (from `getValueLabel` or formatted value)
- Increment/decrement buttons: `aria-label` for screen readers ("+1" / "-1" or custom)

**Keyboard** (when input is focused):
- `ArrowUp` → increment by step
- `ArrowDown` → decrement by step
- `Page Up` → increment by largeStep
- `Page Down` → decrement by largeStep
- `Home` → set to min
- `End` → set to max

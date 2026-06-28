# @forge-ui/tabs

Framework-agnostic Tabs machine and connect function. WAI-ARIA [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Supports automatic and manual activation modes, horizontal and vertical orientation.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/tabs
```

## API

### `createTabsMachine(options)`

```ts
import { createTabsMachine } from '@forge-ui/tabs'

const machine = createTabsMachine({
  id: 'nav',
  defaultValue: 'tab1',
  activationMode: 'automatic',
  orientation: 'horizontal',
  onValueChange: (value) => console.log(value),
})

machine.start()
machine.send({ type: 'SELECT_TAB', value: 'tab2' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `value` | `string` | — |
| `defaultValue` | `string` | — |
| `activationMode` | `"automatic" \| "manual"` | `"automatic"` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `disabled` | `boolean` | `false` |
| `label` | `string` | — |
| `onValueChange` | `(value: string) => void` | — |

### Activation modes

- **`automatic`**: Tab panel activates immediately on focus (arrow key navigation also activates)
- **`manual`**: Arrow keys move focus without activating — Enter or Space activates the focused tab

### Events

| Event | Payload | Description |
|---|---|---|
| `SELECT_TAB` | `{ value: string }` | Activate a tab |
| `SET_VALUE` | `{ value: string }` | Same as SELECT_TAB |

### `connectTabs(snapshot, send, machine)`

```ts
const api = connectTabs(machine.getSnapshot(), machine.send, machine)

api.value  // string  currently active tab value

api.getRootProps()              // container
api.getListProps()              // role="tablist", aria-orientation, aria-label
api.getTriggerProps(value)      // role="tab", aria-selected, aria-controls, id, keyboard events
api.getPanelProps(value)        // role="tabpanel", aria-labelledby, hidden when inactive
```

## States

The machine tracks the active `value` string. No additional named states.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"tabs"` | all |
| `data-forge-part` | `"root"` / `"list"` / `"trigger"` / `"panel"` | |
| `data-state` | `"active"` / `"inactive"` | trigger, panel |
| `data-orientation` | `"horizontal"` / `"vertical"` | root, list, trigger |
| `data-disabled` | `""` | disabled triggers |

## WAI-ARIA

- `List`: `role="tablist"`, `aria-orientation`
- `Trigger`: `role="tab"`, `aria-selected`, `aria-controls` → panel ID, `tabIndex` managed (roving tabindex)
- `Panel`: `role="tabpanel"`, `aria-labelledby` → trigger ID

**Keyboard navigation** (in the tablist):
- `ArrowRight` / `ArrowDown` → next tab
- `ArrowLeft` / `ArrowUp` → previous tab
- `Home` → first tab
- `End` → last tab

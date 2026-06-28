# @forge-ui/accordion

Framework-agnostic Accordion machine and connect function. WAI-ARIA [Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/). Supports single and multiple open panels, collapsible single mode, and vertical/horizontal orientation.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/accordion
```

## API

### `createAccordionMachine(options)`

```ts
import { createAccordionMachine } from '@forge-ui/accordion'

// Single — one panel open at a time, non-collapsible by default
const machine = createAccordionMachine({
  id: 'faq',
  type: 'single',
  defaultValue: ['item-1'],
  collapsible: true,
  onValueChange: (value) => console.log(value),
})

// Multiple — any number open simultaneously
const machine = createAccordionMachine({
  id: 'faq',
  type: 'multiple',
  defaultValue: ['item-1', 'item-2'],
  onValueChange: (value) => console.log(value),
})

machine.start()
machine.send({ type: 'TOGGLE_ITEM', value: 'item-2' })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `type` | `"single" \| "multiple"` | `"single"` |
| `value` | `string[]` | — |
| `defaultValue` | `string[]` | `[]` |
| `collapsible` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |
| `onValueChange` | `(value: string[]) => void` | — |

> `collapsible` only applies to `type: "single"`. When `false`, clicking the open item has no effect.

### Events

| Event | Payload | Description |
|---|---|---|
| `TOGGLE_ITEM` | `{ value: string }` | Toggle a specific panel |
| `SET_VALUE` | `{ value: string[] }` | Set open panels directly |

### `connectAccordion(snapshot, send, machine)`

```ts
const api = connectAccordion(machine.getSnapshot(), machine.send, machine)

api.value             // string[]   currently open item values
api.disabled          // boolean
api.isItemOpen(value) // boolean    is a specific item open?

api.getRootProps()                // container
api.getItemProps(value)          // per-item wrapper — data-state
api.getHeaderProps(value)        // <h2> or heading wrapper
api.getTriggerProps(value)       // button — aria-expanded, aria-controls
api.getContentProps(value)       // panel — id, aria-labelledby, hidden when closed
```

## States

Each item is independently open or closed. `api.isItemOpen(value)` reflects the current state for any given item value.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"accordion"` | all |
| `data-forge-part` | `"root"` / `"item"` / `"header"` / `"trigger"` / `"content"` | |
| `data-state` | `"open"` / `"closed"` | item, trigger, content |
| `data-disabled` | `""` | disabled elements |
| `data-orientation` | `"vertical"` / `"horizontal"` | root, item |

## WAI-ARIA

- Trigger: `role="button"` (native `<button>`), `aria-expanded`, `aria-controls` → content ID
- Content: `id`, `aria-labelledby` → trigger ID
- Each trigger/content pair uses generated IDs derived from `{rootId}-{value}`

**Keyboard navigation** (focus within the accordion):
- `Tab` / `Shift+Tab` — move focus to next/previous trigger
- `Enter` / `Space` — toggle the focused item
- `ArrowDown` / `ArrowUp` — move to next/previous trigger (vertical orientation)
- `Home` / `End` — first / last trigger

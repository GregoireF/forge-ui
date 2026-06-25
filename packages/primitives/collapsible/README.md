# @forge-ui/collapsible

Framework-agnostic Collapsible machine and connect function. WAI-ARIA [Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). Single panel with a toggle trigger.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. For multi-panel accordion, use `@forge-ui/accordion`.

## Install

```bash
npm install @forge-ui/collapsible
```

## API

### `createCollapsibleMachine(options)`

```ts
import { createCollapsibleMachine } from '@forge-ui/collapsible'

const machine = createCollapsibleMachine({
  id: 'details',
  defaultOpen: false,
  onOpenChange: (open) => console.log(open),
})

machine.start()
machine.send('TOGGLE')
machine.send('SET_OPEN', { value: true })
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `open` | `boolean` | — |
| `defaultOpen` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | — |

### Events

| Event | Payload | Description |
|---|---|---|
| `TOGGLE` | — | Toggle open/closed |
| `SET_OPEN` | `{ value: boolean }` | Set explicit state |

### `connectCollapsible(snapshot, send, machine)`

```ts
const api = connectCollapsible(machine.getSnapshot(), machine.send, machine)

api.isOpen    // boolean
api.disabled  // boolean

api.getRootProps()     // container div — data-state
api.getTriggerProps()  // button — aria-expanded, aria-controls
api.getContentProps()  // collapsible panel — id, hidden when closed
```

## States

| State | `data-state` |
|---|---|
| `closed` | `"closed"` |
| `open` | `"open"` |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"collapsible"` | all |
| `data-forge-part` | `"root"` / `"trigger"` / `"content"` | |
| `data-state` | `"open"` / `"closed"` | root, trigger, content |
| `data-disabled` | `""` | disabled elements |

## WAI-ARIA

Trigger renders `aria-expanded` (`"true"` / `"false"`) and `aria-controls` pointing to the content panel's ID. The content panel is hidden (`hidden` attribute) when closed unless `forceMount` is used in framework bindings.

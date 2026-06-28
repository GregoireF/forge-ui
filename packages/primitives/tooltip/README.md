# @forge-ui/tooltip

Framework-agnostic Tooltip machine and connect function. WAI-ARIA [Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). Open/close delays, skip-delay (provider-level), keyboard focus support, optional interactive mode.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`.

## Install

```bash
npm install @forge-ui/tooltip
```

## API

### Provider

The provider coordinates multiple tooltips: when one is open, the next opens without delay (skip-delay).

```ts
import { createTooltipProvider } from '@forge-ui/tooltip'

const provider = createTooltipProvider({
  openDelay: 700,   // ms before opening
  closeDelay: 300,  // ms before closing
})
```

### `createTooltipMachine(options)`

```ts
import { createTooltipMachine } from '@forge-ui/tooltip'

const machine = createTooltipMachine({
  id: 'help',
  openDelay: 700,
  closeDelay: 300,
  interactive: false,       // if true, mouse can enter Content without closing
  closeOnPointerDown: true, // close when trigger is clicked
  disabled: false,
  positioning: { placement: 'top' },
  onOpenChange: (open) => console.log(open),
})

machine.start()
machine.send('OPEN')
machine.send('CLOSE')
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `open` | `boolean` | — |
| `openDelay` | `number` | `700` |
| `closeDelay` | `number` | `300` |
| `interactive` | `boolean` | `false` |
| `closeOnPointerDown` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `positioning` | `FloatingPositioning` | `{ placement: 'top' }` |
| `onOpenChange` | `(open: boolean) => void` | — |

### Events

| Event | Description |
|---|---|
| `OPEN` | Open immediately (or after delay) |
| `CLOSE` | Close (or after delay) |

### `connectTooltip(snapshot, send, machine)`

```ts
const api = connectTooltip(machine.getSnapshot(), machine.send, machine)

api.isOpen  // boolean

api.getTriggerProps()     // pointer/focus events, aria-describedby → content ID
api.getPositionerProps()  // floating positioner div
api.getContentProps()     // role="tooltip", id
api.getAnchorProps()      // optional custom anchor (separate from trigger)
api.getArrowProps()       // arrow triangle
api.getArrowTipProps()    // inner tip element
```

## States

| State | Description |
|---|---|
| `closed` | Hidden |
| `open` | Visible — pointer/focus on trigger |

Internal intermediate states (`opening`, `closing`) manage delay timers but surface as `closed`/`open` via `isOpen`.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"tooltip"` | all |
| `data-forge-part` | `"trigger"` / `"content"` / `"arrow"` | |
| `data-state` | `"open"` / `"closed"` | trigger, content |
| `data-placement` | `"top"` / `"bottom"` / `"left"` / `"right"` | content |
| `data-disabled` | `""` | disabled trigger |

## WAI-ARIA

- Content: `role="tooltip"`, `id`
- Trigger: `aria-describedby` → content ID
- When `disabled: true`, the tooltip never opens and `aria-describedby` is removed from the trigger
- Tooltip is not interactive by default — use `interactive: true` for rich tooltips (links, buttons inside the content). Note: interactive tooltips are not covered by the WAI-ARIA tooltip pattern; prefer Popover for rich content.

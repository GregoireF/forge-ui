# @forge-ui/hover-card

Framework-agnostic Hover Card machine and connect function. Rich card that appears on pointer hover — unlike Tooltip, it can contain interactive content (links, buttons). Open/close with configurable delays.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. For non-interactive text hints use `@forge-ui/tooltip`.

## Install

```bash
npm install @forge-ui/hover-card
```

## API

### `createHoverCardMachine(options)`

```ts
import { createHoverCardMachine } from '@forge-ui/hover-card'

const machine = createHoverCardMachine({
  id: 'profile',
  openDelay: 500,
  closeDelay: 200,
  positioning: { placement: 'bottom' },
  onOpenChange: (open) => console.log(open),
})

machine.start()
machine.send('OPEN')
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `open` | `boolean` | — |
| `openDelay` | `number` | `500` |
| `closeDelay` | `number` | `200` |
| `positioning` | `FloatingPositioning` | `{ placement: 'bottom' }` |
| `onOpenChange` | `(open: boolean) => void` | — |

### Events

| Event | Description |
|---|---|
| `MOUSE_ENTER` | Pointer enters trigger — starts open timer |
| `MOUSE_LEAVE` | Pointer leaves trigger/content — starts close timer |
| `FOCUS` | Keyboard focus on trigger |
| `BLUR` | Keyboard blur |
| `OPEN_TIMEOUT` | Internal — fires when open delay expires |
| `CLOSE_TIMEOUT` | Internal — fires when close delay expires |

### `connectHoverCard(snapshot, send, machine)`

```ts
const api = connectHoverCard(machine.getSnapshot(), machine.send, machine)

api.isOpen  // boolean

api.getTriggerProps()     // onMouseEnter, onMouseLeave, onFocus, onBlur, aria-haspopup, aria-expanded
api.getPositionerProps()  // floating positioner div
api.getContentProps()     // card content — onMouseEnter, onMouseLeave (prevents close while hovered)
api.getArrowProps()       // optional decorative arrow
```

## States

| State | Description |
|---|---|
| `idle` | Closed, no hover |
| `opening` | Waiting for `openDelay` before showing |
| `open` | Card visible |
| `closing` | Waiting for `closeDelay` before hiding |

`api.isOpen` is `true` only in the `open` state.

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"hover-card"` | all |
| `data-forge-part` | `"trigger"` / `"content"` / `"arrow"` | |
| `data-state` | `"open"` / `"closed"` | trigger, content |
| `data-placement` | `"top"` / `"bottom"` / `"left"` / `"right"` | content |

## Key differences from Tooltip

| Behaviour | Tooltip | Hover Card |
|---|---|---|
| Interactive content | ✗ (not WAI-ARIA conformant) | ✓ |
| Keyboard accessible | Trigger focus only | Trigger + content focus |
| WAI-ARIA role | `role="tooltip"` | No special role (dialog-like) |
| Use case | Short descriptive text | Rich preview (profiles, links, media) |

# @forge-ui/popover

Framework-agnostic Popover machine and connect function. WAI-ARIA [Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Floating panel positioned relative to a trigger. Modal and non-modal modes. Optional focus trap, scroll lock, and aria-hidden.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. For non-interactive hints use `@forge-ui/tooltip`.

## Install

```bash
npm install @forge-ui/popover
```

## API

### `createPopoverMachine(options)`

```ts
import { createPopoverMachine } from '@forge-ui/popover'

const machine = createPopoverMachine({
  id: 'filter',
  modal: false,
  positioning: {
    placement: 'bottom-start',
    offset: { mainAxis: 8 },
  },
  onOpenChange: (open) => console.log(open),
})

machine.start()
machine.send('TOGGLE')
machine.send('CLOSE')
machine.stop()
```

#### Options

| Option | Type | Default |
|---|---|---|
| `id` | `string` | required |
| `open` | `boolean` | — |
| `modal` | `boolean` | `false` |
| `trapFocus` | `boolean` | follows `modal` |
| `preventScroll` | `boolean` | follows `modal` |
| `hideOthers` | `boolean` | follows `modal` |
| `positioning` | `FloatingPositioning` | `{ placement: 'bottom' }` |
| `initialFocusEl` | `() => HTMLElement \| null` | first focusable element |
| `finalFocusEl` | `() => HTMLElement \| null` | trigger element |
| `onOpenChange` | `(open: boolean) => void` | — |
| `onPointerDownOutside` | `(event) => void` | — |
| `onFocusOutside` | `(event) => void` | — |
| `onInteractOutside` | `(event) => void` | — |
| `onEscapeKeyDown` | `(event) => void` | — |

### Events

| Event | Description |
|---|---|
| `OPEN` | Open popover |
| `CLOSE` | Close popover |
| `TOGGLE` | Toggle open/closed |
| `ESCAPE_KEY` | Close via Escape |
| `INTERACT_OUTSIDE` | Close on pointer/focus outside |
| `REGISTER_TITLE` | Internal — called by Title on mount |
| `REGISTER_DESCRIPTION` | Internal — called by Description on mount |

### `connectPopover(snapshot, send, machine)`

```ts
const api = connectPopover(machine.getSnapshot(), machine.send, machine)

api.isOpen  // boolean

api.getTriggerProps()     // aria-expanded, aria-controls, aria-haspopup="dialog"
api.getAnchorProps()      // optional separate anchor (floating reference)
api.getPositionerProps()  // floating positioner div
api.getContentProps()     // role="dialog", aria-labelledby, aria-describedby
api.getArrowProps()       // decorative arrow
api.getArrowTipProps()    // inner arrow tip
api.getCloseProps()       // close button inside content
api.getTitleProps()       // optional title
api.getDescriptionProps() // optional description
```

### `FloatingPositioning`

```ts
interface FloatingPositioning {
  placement?: 'top' | 'bottom' | 'left' | 'right'
           | 'top-start' | 'top-end'
           | 'bottom-start' | 'bottom-end'
           | 'left-start' | 'left-end'
           | 'right-start' | 'right-end'
  offset?: { mainAxis?: number; crossAxis?: number }
  flip?: boolean      // default: true
  shift?: boolean     // default: true
  sameWidth?: boolean // content matches trigger width
}
```

## States

| State | Description |
|---|---|
| `closed` | Hidden |
| `open` | Visible and positioned |

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"popover"` | all |
| `data-forge-part` | `"trigger"` / `"content"` / `"arrow"` / `"close"` | |
| `data-state` | `"open"` / `"closed"` | trigger, content |
| `data-placement` | `"top"` / `"bottom"` / `"left"` / `"right"` (and `-start`/`-end`) | content |
| `data-side` | `"top"` / `"bottom"` / `"left"` / `"right"` | content |

## WAI-ARIA

- Content: `role="dialog"`, `aria-labelledby` (when Title present), `aria-describedby` (when Description present)
- Trigger: `aria-expanded`, `aria-controls` → content ID, `aria-haspopup="dialog"`
- Non-modal (default): focus is not trapped; Escape and outside click close the popover
- Modal: focus trap active, body scroll locked, `aria-hidden` on background

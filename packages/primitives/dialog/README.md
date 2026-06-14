# @forge-ui/dialog

Framework-agnostic dialog machine and connect function. Provides the state logic and prop getters for the dialog primitive — with no knowledge of React, Vue, or any other framework.

> This package is consumed by `@forge-ui/react` and `@forge-ui/vue`. You only need it directly if you are building a new framework binding or a Web Component.

## Install

```bash
npm install @forge-ui/dialog
```

`@forge-ui/core` is a peer dependency (resolved automatically inside a forge-ui monorepo).

## API

### `createDialogMachine(options)`

Creates a dialog FSM instance. Two states: `closed` → `open`.

```ts
import { createDialogMachine } from '@forge-ui/dialog'

const machine = createDialogMachine({
  id: 'my-dialog',
  modal: true,               // default: true  — enables focus trap, scroll lock, aria-hidden
  closeOnEscapeKey: true,    // default: true
  closeOnInteractOutside: true, // default: true
  open: false,               // initial open state
  onOpen: () => {},
  onClose: () => {},
  onOpenChange: (open) => {},
})

machine.start()
machine.send('OPEN')
machine.send('CLOSE')
machine.stop()
```

#### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Base ID for ARIA attributes |
| `modal` | `boolean` | `true` | Enable focus trap, scroll lock, and aria-hidden on background |
| `closeOnEscapeKey` | `boolean` | `true` | Send `CLOSE` on Escape keydown |
| `closeOnInteractOutside` | `boolean` | `true` | Send `CLOSE` on pointerdown outside content |
| `open` | `boolean` | `false` | Initial open state |
| `onOpen` | `() => void` | — | Called when transitioning to `open` |
| `onClose` | `() => void` | — | Called when transitioning to `closed` |
| `onOpenChange` | `(open: boolean) => void` | — | Called on every transition |

### `connectDialog(snapshot, send, machine)`

Derives ARIA-correct prop getters from the current machine snapshot. Call this on every render.

```ts
import { connectDialog } from '@forge-ui/dialog'

const api = connectDialog(machine.getSnapshot(), machine.send, machine)

// Spread onto your elements:
api.getTriggerProps()     // button — aria-expanded, aria-controls, data-state, onClick, ref
api.getBackdropProps()    // div     — data-state, data-forge-part
api.getContentProps()     // div     — role=dialog, aria-modal, aria-labelledby, aria-describedby, data-state, ref
api.getTitleProps()       // h2      — id
api.getDescriptionProps() // p       — id
api.getCloseProps()       // button  — onClick
```

All `ref` callbacks are typed as `(el: unknown) => void` for cross-framework compatibility.

## Activities (modal behaviour)

When `modal: true`, the `open` state runs five activities in parallel:

| Activity | Description |
|---|---|
| `manageFocus` | Saves previous focus on enter; restores it on exit. Focuses first focusable element inside content on next rAF. |
| `trapKeyboard` | Document keydown: Tab → `trapFocus`, Escape → `send("ESCAPE_KEY")`. |
| `hideBackground` | `hideOthers(contentEl)` sets `aria-hidden="true"` on everything outside the dialog. |
| `lockBodyScroll` | `lockScroll()` prevents body scroll (iOS-safe). |
| `watchOutside` | `pointerdown` capture: if target is outside `contentEl`, sends `INTERACT_OUTSIDE`. |

All activities read DOM refs (`contentEl`, `triggerEl`) from the live mutable context — refs set by framework ref callbacks are visible immediately without restarting activities.

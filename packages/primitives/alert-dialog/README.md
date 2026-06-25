# @forge-ui/alert-dialog

Framework-agnostic Alert Dialog machine and connect function. WAI-ARIA [Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/). A modal dialog for critical confirmations — Escape key and outside clicks do **not** close it.

> Consumed by `@forge-ui/react` and `@forge-ui/vue`. For dismissible dialogs, use `@forge-ui/dialog`.

## Install

```bash
npm install @forge-ui/alert-dialog
```

## Key differences from Dialog

| Behaviour | Dialog | Alert Dialog |
|---|---|---|
| Escape closes | ✓ (default) | ✗ |
| Click outside closes | ✓ (default) | ✗ |
| `role` | `"dialog"` | `"alertdialog"` |
| `aria-modal` | `"true"` | `"true"` |
| Cancel button | Optional | Required (provides keyboard exit) |

## API

### `createAlertDialogMachine(options)`

```ts
import { createAlertDialogMachine } from '@forge-ui/alert-dialog'

const machine = createAlertDialogMachine({
  id: 'confirm-delete',
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
| `onOpenChange` | `(open: boolean) => void` | — |

> Alert Dialog does not expose `closeOnEscapeKey` or `closeOnInteractOutside` — these are intentionally locked to `false`.

### Events

| Event | Description |
|---|---|
| `OPEN` | Open the dialog |
| `CLOSE` | Close the dialog (triggered by Cancel/Action buttons only) |
| `REGISTER_TITLE` / `UNREGISTER_TITLE` | Internal — called by Title on mount/unmount |
| `REGISTER_DESCRIPTION` / `UNREGISTER_DESCRIPTION` | Internal — called by Description on mount/unmount |

### `connectAlertDialog(snapshot, send, machine)`

```ts
const api = connectAlertDialog(machine.getSnapshot(), machine.send, machine)

api.isOpen               // boolean
api.titleRegistered      // boolean
api.descriptionRegistered // boolean

api.getTriggerProps()    // button that opens the dialog
api.getOverlayProps()    // backdrop overlay — data-state
api.getContentProps()    // role="alertdialog", aria-modal, aria-labelledby, aria-describedby
api.getTitleProps()      // h2 — registers id for aria-labelledby
api.getDescriptionProps() // p — registers id for aria-describedby
api.getCancelProps()     // cancel button — onClick sends CLOSE
api.getActionProps()     // confirm button — onClick sends CLOSE (consumer handles action)
```

## States

| State | Description |
|---|---|
| `closed` | Dialog hidden |
| `open` | Dialog visible, focus trapped inside, body scroll locked |

Activities running in `open` state:
- Focus trap (Tab / Shift+Tab stays inside content)
- `aria-hidden` on all background elements
- Body scroll lock

## Data attributes

| Attribute | Values | Elements |
|---|---|---|
| `data-forge-scope` | `"alert-dialog"` | all |
| `data-forge-part` | `"trigger"` / `"overlay"` / `"content"` / `"title"` / `"description"` / `"cancel"` / `"action"` | |
| `data-state` | `"open"` / `"closed"` | trigger, overlay, content |

## WAI-ARIA

- Content: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` → title ID, `aria-describedby` → description ID
- Initial focus lands on the Cancel button by default (safest action per APG)
- Screen readers announce the title and description immediately on open

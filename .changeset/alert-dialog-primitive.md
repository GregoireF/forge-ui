---
"@forge-ui/alert-dialog": minor
"@forge-ui/dialog": minor
"@forge-ui/react": minor
"@forge-ui/vue": minor
---

**New primitive: `@forge-ui/alert-dialog` — AlertDialog extracted from Dialog**

### `@forge-ui/alert-dialog` (new package)

A dedicated primitive for destructive-action confirmation dialogs, fully
compliant with the WAI-ARIA `alertdialog` pattern.

- `createAlertDialogMachine` — wraps `createDialogMachine` with
  `role: "alertdialog"` and unconditionally blocks Escape and interact-outside
  (WAI-ARIA requirement). The user's `onEscapeKeyDown` / `onInteractOutside`
  callback fires **first** (before `e.preventDefault()`), so callers can show
  a warning toast or log the attempt without the event appearing pre-prevented.
- `connectAlertDialog` — wraps `connectDialog`, sets
  `data-forge-scope="alert-dialog"` on all parts, exposes `getCancelProps()`
  (closes the dialog) and `getActionProps()` (does **not** close — the caller
  decides after a successful async operation), hides `getCloseProps()`.

### `@forge-ui/dialog` — breaking change: `role` removed from public API

The `role` option is no longer accepted by `useDialog` (React) or
`useDialog` (Vue). Use `@forge-ui/alert-dialog` for `role="alertdialog"`
use-cases. The machine itself still accepts `role` internally (used by
`createAlertDialogMachine`).

### `@forge-ui/react`

- New exports: `AlertDialog`, `useAlertDialog`, `UseAlertDialogOptions`,
  `AlertDialogRootProps`, `AlertDialogTriggerProps`, `AlertDialogPortalProps`,
  `AlertDialogOverlayProps`, `AlertDialogContentProps`, `AlertDialogTitleProps`,
  `AlertDialogDescriptionProps`, `AlertDialogCancelProps`, `AlertDialogActionProps`.
- `Dialog.Root` / `useDialog`: `role` prop removed.

### `@forge-ui/vue`

- New exports: `AlertDialog`, `AlertDialogRoot`, `AlertDialogTrigger`,
  `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`,
  `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogCancel`,
  `AlertDialogAction`, `useAlertDialog`, `UseAlertDialogOptions`.
- `Dialog.Root` / `useDialog`: `role` prop removed.

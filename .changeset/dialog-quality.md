---
"@forge-ui/dialog": patch
"@forge-ui/react": minor
"@forge-ui/vue": patch
---

**Dialog: dev a11y warning + `titleRegistered`/`descriptionRegistered` API**

- `Dialog.Content` emits a `console.warn` in development when the dialog opens without an accessible name — no `<Dialog.Title>` mounted and no `aria-label`/`aria-labelledby` on `<Dialog.Content>` (React and Vue)
- `connectDialog` now exposes `titleRegistered` and `descriptionRegistered` booleans directly on the API; `useDialog` (Vue) exposes them as reactive computed refs
- **Fix**: `useMachine` (React) now starts the machine synchronously instead of in `useEffect` — the previous ordering caused `REGISTER_TITLE` / `REGISTER_DESCRIPTION` events to silently drop when `Dialog.Title`/`Dialog.Description` were mounted before the machine started (e.g. `defaultOpen`, `open={true}`, `forceMount`), leaving `aria-labelledby`/`aria-describedby` unset on those dialogs

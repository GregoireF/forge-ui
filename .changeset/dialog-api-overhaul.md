---
"@forge-ui/dialog": major
"@forge-ui/react": major
"@forge-ui/vue": major
"@forge-ui/core": minor
---

**Breaking:** Dialog API overhaul — granular callbacks replace boolean guards, new FSM capabilities.

### Breaking changes

- `closeOnEscapeKey` and `closeOnInteractOutside` boolean props removed — use `onEscapeKeyDown`/`onInteractOutside` callbacks and call `e.preventDefault()` to cancel.
- `onOpen` and `onClose` callbacks removed — use `onOpenChange(open: boolean)`.
- `getBackdropProps()` renamed to `getOverlayProps()` (`data-forge-part` changes from `"backdrop"` to `"overlay"`).

### New features

- `role`: `"dialog"` (default) or `"alertdialog"` — alertdialog blocks escape/outside-click by default per WAI-ARIA.
- `modal`, `trapFocus`, `preventScroll`, `hideOthers` as independent options (`modal` sets all four as a shorthand).
- `onPointerDownOutside`, `onFocusOutside`, `onInteractOutside`, `onEscapeKeyDown`, `onOpenAutoFocus`, `onCloseAutoFocus` preventable callbacks.
- Title/Description presence registration via `REGISTER_TITLE` / `REGISTER_DESCRIPTION` events.
- `asChild` prop on Trigger, Overlay, Content, Title, Description, Close (React + Vue).
- `forceMount` on Portal and Content.
- `data-forge-scope` attribute on every part prop return.

### Core improvements (`@forge-ui/core` minor)

- `after` delayed transitions in state machine (`StateNodeConfig.after`).
- `notify()` in activity API — triggers re-render without state transition.
- 5 generic activity factories: `makeFocusActivity`, `makeWatchOutsideActivity`, `makeKeyboardActivity`, `makeHideBackgroundActivity`, `makeLockScrollActivity`.
- `focusFirst` respects `[autofocus]` attribute before falling back to first focusable element.

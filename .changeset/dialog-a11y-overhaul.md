---
"@forge-ui/dialog": minor
"@forge-ui/react": minor
"@forge-ui/vue": minor
"@forge-ui/popover": patch
---

**Dialog: a11y overhaul, `defaultOpen`, Content-level callbacks**

- `defaultOpen` prop for uncontrolled initial open state (no need to lift state just to start open)
- `setContentCallbacks()` on the connect API: `Dialog.Content` callback props (`onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`, `onInteractOutside`, `onOpenAutoFocus`, `onCloseAutoFocus`) now override Root-level equivalents, matching Radix behavior
- Fixed `aria-haspopup` on Trigger: now reflects `context.role` instead of hardcoding `"dialog"` (correctly emits `"alertdialog"` when `role="alertdialog"`)
- `aria-labelledby` / `aria-describedby` on Content are now conditional — only emitted when `Dialog.Title` / `Dialog.Description` are mounted, preventing dangling ARIA references
- `DialogContentCallbacks` type exported from `@forge-ui/dialog`
- Removed deprecated `getBackdropProps()` alias (dead code — use `getOverlayProps()`)

**Popover: a11y fixes**

- `aria-labelledby` / `aria-describedby` on Content are now conditional (same fix as Dialog)
- Removed hardcoded `aria-label="Close popover"` from `getCloseProps()` (violated WCAG 2.5.3 Label in Name when the button has text children)

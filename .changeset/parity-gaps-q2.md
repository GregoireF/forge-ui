---
"@forge-ui/floating": minor
"@forge-ui/popover": patch
"@forge-ui/react": patch
"@forge-ui/vue": patch
---

**Parity gaps resolved — Floating UI API, Popover, AlertDialog, Dialog**

### `@forge-ui/floating` — new positioning options

- **`alignOffset`** (`number`, default `0`): offset on the cross-axis (secondary
  axis), equivalent to Radix `alignOffset`. Maps to `@floating-ui/dom` offset
  middleware `crossAxis`.
- **`avoidCollisions`** (`boolean`, default `true`): when `false`, disables
  the `flip` and `shift` middleware so the floating element stays anchored even
  if it would overflow the boundary. Matches Radix `avoidCollisions`.
- **`buildPlacement(side, align)`**: helper to compose a floating-ui
  `Placement` string from separate `Side` + `Align` values.

### `@forge-ui/react` — Popover integration tests

Added 19 integration tests covering: open/close lifecycle, ARIA attributes
(`aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-labelledby`),
keyboard (Escape), callbacks (`onOpenChange`, `onEscapeKeyDown`), `forceMount`,
controlled state (`open` prop), and compound component API.

### `@forge-ui/vue` — Popover & AlertDialog & Dialog fixes + tests

- **`PopoverContent`**: added `inheritAttrs: false` to prevent `data-testid`
  and other pass-through attrs from being applied to both the positioner div
  (via Vue's fallthrough) and the inner content div (via explicit spread) —
  would cause duplicate attributes and `getByTestId` ambiguity.
- Added 17 Popover integration tests (mirrors React coverage).
- Added Vue AlertDialog **interact-outside blocking** test: clicking outside an
  open alertdialog must not close it (WAI-ARIA requirement).
- Added Vue Dialog **non-modal** test: `modal=false` must not set `aria-hidden`
  on background elements.

### Nuxt playground

Added AlertDialog demo section in `apps/playground-nuxt/app.vue` showing:
destructive confirmation pattern, Action async simulation (stays open during
request), Cancel dismiss, Escape/outside-click blocking.

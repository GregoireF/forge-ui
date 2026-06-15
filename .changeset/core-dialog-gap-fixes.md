---
"@forge-ui/core": patch
"@forge-ui/dialog": patch
---

**Fix four parity gaps identified vs. Radix UI / Ark UI**

### scroll-lock — layout shift on Windows (bug)

`scrollbarWidth` was measured _after_ `overflow:hidden` was applied. Once the
scrollbar disappears `window.innerWidth - clientWidth` collapses to 0, so the
`padding-right` compensation branch never fired. The measurement now happens
_before_ the overflow change. `getComputedStyle` is used instead of the saved
inline style so that CSS-declared body padding is accounted for.

### focus-trap — `contenteditable` missing

Rich-text editors (Tiptap, Quill, Slate…) use `contenteditable` elements.
They were absent from the `FOCUSABLE` selector, so Tab/Shift+Tab would skip
them inside a dialog. Added
`[contenteditable]:not([contenteditable='false'])`.

### focus-trap — CSS `display:none` / `visibility:hidden` not filtered

`querySelectorAll` returns elements inside `display:none` subtrees. The
previous filter only covered the `[hidden]` and `[inert]` attributes. Elements
hidden via CSS (inline `style="display:none"`, a stylesheet rule, or an
ancestor with `display:none`) were incorrectly included in the focus list,
breaking Tab-order wrapping.

Fix: `isVisibleAndRendered()` walks the ancestor chain checking
`getComputedStyle(node).display` (since `display` is not inherited, each
ancestor must be checked individually), then checks
`getComputedStyle(el).visibility` (inherited — one check on the element
suffices).

### alertdialog — user callback received a pre-prevented event (API correctness)

`makeDefaultAlertOnEscapeKeyDown` / `makeDefaultAlertOnInteractOutside` called
`e.preventDefault()` _before_ the user callback. The callback always saw
`e.defaultPrevented === true`, making it impossible to distinguish "user
prevented this" from "alertdialog always prevents this". The callback is now
fired first (informational — e.g. show a warning toast on Escape attempt), and
`e.preventDefault()` is applied unconditionally afterwards.

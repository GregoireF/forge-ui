---
"@forge-ui/floating": patch
"@forge-ui/popover": patch
---

**fix(floating): Popover/Tooltip now position correctly on first open**

`makeComputePositionActivity` was reading `ctx.contentEl` synchronously when the activity started — before React/Vue had a chance to render the floating element. Since `contentEl` was always `null` at that point, the activity returned early and `autoUpdate` was never set up, leaving the floating element stuck at `position: fixed; top: 0px; left: 0px`.

The fix defers the initial positioning setup to `requestAnimationFrame` (the same pattern used by `makeFocusActivity`): by the time the rAF fires, the framework has committed the DOM and the `ref` callback has populated `ctx.contentEl`.

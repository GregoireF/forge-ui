---
"@forge-ui/popover": minor
"@forge-ui/nuxt": minor
---

New package: `@forge-ui/popover` — floating popover primitive built on `@floating-ui/dom`.

### Features

- `createPopoverMachine` — FSM with open/closed states, positioning context, presence registration.
- `connectPopover` — prop getters: `getTriggerProps`, `getAnchorProps`, `getContentProps`, `getPositionerProps`, `getArrowProps`, `getArrowTipProps`, `getCloseProps`, `getTitleProps`, `getDescriptionProps`.
- Positioning via `@floating-ui/dom` (`computePosition` + `autoUpdate`): `placement`, `strategy`, `offset`, custom `middleware`.
- `<Content>` renders a hidden positioner div internally — consumer gets a clean content div for animations.
- `<Arrow>` is renderless (always Slot) — merges `getArrowProps()` onto consumer's child.
- `modal` defaults to `false`; `preventScroll` defaults to `false`.
- All parts have `asChild` + `forceMount` where applicable.
- `data-side`, `data-align`, `data-placement` on content and positioner.
- `--forge-popover-content-transform-origin` CSS custom property on content.

Compound API: `Popover.Root`, `Popover.Trigger`, `Popover.Anchor`, `Popover.Portal`, `Popover.Content`, `Popover.Arrow`, `Popover.Close`, `Popover.Title`, `Popover.Description` (React + Vue).

Nuxt: `usePopover`, `Popover` namespace, and 9 named components (`PopoverRoot`, `PopoverTrigger`, etc.) auto-imported.

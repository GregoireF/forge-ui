---
"@forge-ui/tooltip": minor
"@forge-ui/react": minor
"@forge-ui/vue": minor
---

**✨ New primitive: `@forge-ui/tooltip`**

### `@forge-ui/tooltip`

New standalone primitive for accessible tooltip overlays, positioned via `@floating-ui/dom`.

**Architecture highlights vs Radix UI, Ark UI, Headless UI:**

- **Timer IDs in mutable machine context** — `_openTimerId`/`_closeTimerId` live in the FSM context (same pattern as DOM refs). Connect reads them lazily. Zero exceptions to the 3-tier law: machine → connect → framework.
- **`interactive` prop** (positive naming) vs Radix's confusing `disableHoverableContent: false`. Default `false`.
- **Provider skip-delay via per-instance `useRef`** — not a module-level singleton (Radix's approach breaks SSR and multiple Provider groups). Each `<Tooltip.Provider>` tracks `lastClosedAt` in its own ref → SSR-safe, multiple groups on one page work correctly.
- **`onPointerEnter` touch exclusion** — touch pointer events skip `scheduleOpen()`, preventing unwanted opens on mobile.
- **Positioner internal to Content** — simpler API: users don't manage a `<Tooltip.Positioner>` wrapper. Consistent with our Popover implementation.
- **Vue h() event normalization** — `patchVueEvents()` remaps camelCase event props (`onPointerEnter` → `onPointerenter`) so Vue's `hyphenate()` yields the correct DOM event name `pointerenter`, not `pointer-enter`.

**API:**
- `createTooltipMachine(options)` — FSM with `closed | open` states + `computePosition` activity
- `connectTooltip(snapshot, send, machine)` — framework-agnostic props, timer scheduling

### `@forge-ui/react` — compound components + hook

```tsx
// With global delay management (skip-delay between tooltips)
<Tooltip.Provider openDelay={700} closeDelay={300} skipDelay={300}>
  <Tooltip.Root>
    <Tooltip.Trigger>Hover me</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content>Helpful tip</Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>

// Interactive tooltip (stays open when mouse moves from trigger to content)
<Tooltip.Root interactive openDelay={0}>
  <Tooltip.Trigger>Hover</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Content>
      <a href="#">Click me</a>
    </Tooltip.Content>
  </Tooltip.Portal>
</Tooltip.Root>

// With arrow
<Tooltip.Root>
  <Tooltip.Trigger>Info</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Content>
      <Tooltip.Arrow><svg><polygon /></svg></Tooltip.Arrow>
      Tooltip text
    </Tooltip.Content>
  </Tooltip.Portal>
</Tooltip.Root>
```

### `@forge-ui/vue` — compound components + composable

Same API adapted for Vue 3, with `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Portal`, `Tooltip.Content`, `Tooltip.Arrow`.

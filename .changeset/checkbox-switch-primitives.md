---
"@forge-ui/checkbox": minor
"@forge-ui/switch": minor
"@forge-ui/react": minor
"@forge-ui/vue": minor
---

**✨ New primitives: `@forge-ui/checkbox` + `@forge-ui/switch`**

### `@forge-ui/checkbox`

New standalone primitive with tri-state support and built-in `Checkbox.Group`.

**Architecture highlights vs Radix UI, Ark UI, Headless UI:**
- `checked: true | false | "indeterminate"` — single prop, three states, no `indeterminate` boolean hack
- `Checkbox.Group` + `Checkbox.GroupAll` (select-all) from day 1 — competitors require hand-rolling
- `GroupAll` derives `groupChecked: true | false | "indeterminate"` automatically — no consumer logic needed
- Hidden `<input type="checkbox">` auto-rendered when `name` is set — zero extra markup, native forms + react-hook-form work transparently
- `role="checkbox"` on `<button>` — full keyboard + pointer control, no native checkbox quirks
- `aria-checked="mixed"` for indeterminate per WAI-ARIA 1.2

**API:**
- `createCheckboxMachine(options)` — FSM with `unchecked | indeterminate | checked` states
- `connectCheckbox(snapshot, send, machine)` — framework-agnostic props

### `@forge-ui/switch`

New standalone primitive for boolean toggle switches.

**Architecture highlights:**
- `role="switch"` on `<button>` per WAI-ARIA 1.2 (not native `<input type="checkbox">`)
- `Switch.Thumb` decorative part with `data-state="on|off"` for CSS transitions
- Hidden input auto-rendered when `name` is set — same transparent form integration as Checkbox
- `off | on` FSM — minimal surface, impossible invalid states

**API:**
- `createSwitchMachine(options)` — FSM
- `connectSwitch(snapshot, send, machine)` — framework-agnostic props

### `@forge-ui/react` — compound components + hooks

```tsx
// Standalone checkbox
<Checkbox.Root defaultChecked onCheckedChange={onChange}>
  <Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control>
  <Checkbox.Label>Accept terms</Checkbox.Label>
</Checkbox.Root>

// Group with select-all
<Checkbox.Group defaultValue={["a"]} onValueChange={setValues}>
  <Checkbox.GroupAll>
    <Checkbox.Control /><Checkbox.Label>Select all</Checkbox.Label>
  </Checkbox.GroupAll>
  <Checkbox.Root value="a"><Checkbox.Control /><Checkbox.Label>Option A</Checkbox.Label></Checkbox.Root>
  <Checkbox.Root value="b"><Checkbox.Control /><Checkbox.Label>Option B</Checkbox.Label></Checkbox.Root>
</Checkbox.Group>

// Switch
<Switch.Root onCheckedChange={onChange}>
  <Switch.Control><Switch.Thumb /></Switch.Control>
  <Switch.Label>Notifications</Switch.Label>
</Switch.Root>
```

### `@forge-ui/vue` — compound components + composables

Same API as React, adapted for Vue 3 composition API + `defineComponent` pattern.
`use-checkbox` and `use-switch` composables expose reactive refs (`isChecked`, `isIndeterminate`, `dataState`) for template usage.

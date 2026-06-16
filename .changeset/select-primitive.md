---
"@forge-ui/select": minor
"@forge-ui/react": minor
"@forge-ui/vue": minor
---

**✨ New primitive: `@forge-ui/select` — WAI-ARIA 1.2 Select-Only Combobox**

### `@forge-ui/select`

New standalone primitive implementing the [WAI-ARIA 1.2 Select-Only Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/).

**Architecture highlights vs competitors:**
- Trigger keeps focus at all times (no focus-trap in listbox) — correct per WAI-ARIA 1.2
- `aria-activedescendant` on trigger tracks highlighted option — screen readers stay in the button context
- `value: string[]` always — multi-select is a flag, same machine, zero code duplication
- Typeahead (500ms buffer, cycle through same-prefix matches) in connect layer — FSM stays pure
- `sameWidth: true` by default — listbox matches trigger width out of the box
- `valueLabelMap` persists labels across open/close — trigger label always correct after selection
- `defaultLabel` prop — pre-seeds label display before listbox mounts

**API:**
- `createSelectMachine(options)` — FSM
- `connectSelect(snapshot, send, machine)` — framework-agnostic props (React + Vue compatible event casing)
- `getOptionId(selectId, value)` — stable option id for `aria-activedescendant`

### `@forge-ui/react` — `Select` compound + `useSelect`

Compound component API:
```tsx
<Select.Root defaultValue="apple" defaultLabel="Apple" onValueChange={onChange}>
  <Select.Label>Fruit</Select.Label>
  <Select.Trigger><Select.Value placeholder="Pick a fruit" /></Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Item value="apple">Apple</Select.Item>
      <Select.Item value="banana">Banana</Select.Item>
      <Select.Item value="cherry" disabled>Cherry</Select.Item>
      <Select.Separator />
      <Select.Group>
        <Select.GroupLabel>More</Select.GroupLabel>
        <Select.Item value="date">Date</Select.Item>
      </Select.Group>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

### `@forge-ui/vue` — `Select` compound + `useSelect`

Same API as React, adapted for Vue 3 composition API + defineComponent pattern.
`SelectContent` has `inheritAttrs: false` to prevent double attr application (same as PopoverContent).

---
"@forge-ui/combobox": minor
"@forge-ui/field": minor
"@forge-ui/switch": patch
"@forge-ui/tooltip": patch
"@forge-ui/select": patch
"@forge-ui/react": minor
"@forge-ui/vue": minor
"@forge-ui/nuxt": minor
---

**✨ New primitive: `@forge-ui/combobox`**

WAI-ARIA 1.2 Combobox with client-side filtering, async mode, and multi-select.

- `role="combobox"` on `<input>` (not button — different from Select-Only pattern)
- `aria-expanded`, `aria-controls`, `aria-activedescendant` on the input
- `role="listbox"` on the content, `role="option"` on items
- Client-side filtering: items self-hide when not in `filteredOptions` (case-insensitive includes by default, configurable via `filterFn`)
- Async mode: pass `onInputChange` to delegate filtering to the caller — `filteredOptions` returns all options unfiltered
- Multi-select: stays open after each selection; single-select auto-closes
- Keyboard: ArrowDown/Up, Home/End, Enter, Escape, Tab
- Floating UI positioning (input as reference element) + outside-click detection

**Compounds:** `Root`, `Label`, `Input`, `Trigger`, `ClearTrigger`, `Portal`, `Content`, `Item`, `ItemText`, `ItemIndicator`

```tsx
// React — single-select with client-side filter
<Combobox.Root onValueChange={setSelected}>
  <Combobox.Label>Framework</Combobox.Label>
  <div>
    <Combobox.Input />
    <Combobox.Trigger>▾</Combobox.Trigger>
    <Combobox.ClearTrigger>✕</Combobox.ClearTrigger>
  </div>
  <Combobox.Portal>
    <Combobox.Content>
      {options.map(o => (
        <Combobox.Item key={o.value} value={o.value} label={o.label}>
          <Combobox.ItemIndicator value={o.value}>✓</Combobox.ItemIndicator>
          <Combobox.ItemText>{o.label}</Combobox.ItemText>
        </Combobox.Item>
      ))}
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>

// Multi-select
<Combobox.Root multiple>...</Combobox.Root>

// Async mode
<Combobox.Root onInputChange={fetchResults}>...</Combobox.Root>
```

---

**✨ `@forge-ui/field` improvements**

- **SSR-safe IDs:** `useId()` in React, `getCurrentInstance()?.uid` in Vue — no module-level counter
- **`aria-live="assertive"`** on `FieldError` (Deque recommendation for inline validation errors)
- **`Field.RequiredIndicator`:** renders `<span aria-hidden>` — visual `*` only; screen readers get `aria-required` on the control
- **`Field.Group` + `Field.GroupLabel`:** wraps related fields with `role="group" aria-labelledby` — uses a generated ID for the label

```tsx
<Field.Root required invalid={invalid}>
  <Field.Label>
    Email <Field.RequiredIndicator />
  </Field.Label>
  <Field.Control><input type="email" /></Field.Control>
  <Field.Description>Entrez votre adresse e-mail.</Field.Description>
  <Field.Error>Adresse e-mail invalide.</Field.Error>
</Field.Root>

<Field.Group>
  <Field.GroupLabel>Notifications</Field.GroupLabel>
  {/* checkboxes or other controls */}
</Field.Group>
```

---

**✨ `@forge-ui/switch` — `invalid` state + ARIA attributes**

- `invalid?: boolean` prop on `Switch.Root` (React/Vue)
- `data-invalid=""` on root, control, thumb, label when invalid
- `data-readonly=""` on all parts when readOnly
- `aria-invalid` + `aria-readonly` on the control button

---

**✨ `Tooltip.Anchor`**

Anchor the tooltip to a different element than the trigger. The positioner uses `anchorEl` (if set) as the floating reference, falling back to `triggerEl`.

```tsx
<Tooltip.Root>
  <Tooltip.Trigger>Hover me</Tooltip.Trigger>
  <Tooltip.Anchor><div>Tooltip points here</div></Tooltip.Anchor>
  <Tooltip.Portal><Tooltip.Content>Info</Tooltip.Content></Tooltip.Portal>
</Tooltip.Root>
```

---

**✨ `Select.Placeholder`**

Replaces the static placeholder string approach. Renders only when no value is selected.

```tsx
<Select.Trigger>
  <Select.Value>
    <Select.Placeholder>Choisir un pays…</Select.Placeholder>
  </Select.Value>
</Select.Trigger>
```

---

**`@forge-ui/nuxt`** — auto-imports updated:

- `useCombobox` composable + `Combobox` namespace + all individual `ComboboxXxx` components
- `FieldRequiredIndicator`, `FieldGroup`, `FieldGroupLabel`
- `SelectPlaceholder`
- `TooltipAnchor`

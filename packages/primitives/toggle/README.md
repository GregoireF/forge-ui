# @forge-ui/toggle

Toggle button primitive — WAI-ARIA Button Pattern §3.5.

## WAI-ARIA

| Attribute | Value | Condition |
|-----------|-------|-----------|
| `role` | `button` (native `<button>`) | always |
| `aria-pressed` | `"true"` / `"false"` | reflects pressed state |
| `aria-disabled` | `"true"` | when `disabled` |
| `type` | `"button"` | prevents form submission |

**Why `role="button"` and NOT `role="checkbox"`?**  
A checkbox represents a persistent binary setting (e.g., "enable dark mode"). A toggle button represents a transient action with state (e.g., "bold is currently on"). The APG distinguishes them explicitly: §3.5 Button Pattern vs §3.7 Checkbox Pattern. Both use `aria-pressed`/`aria-checked` respectively, but the semantics differ for AT.

## Architecture

```
toggle.machine.ts   — FSM: off ↔ on states (TOGGLE / PRESS / RELEASE events)
toggle.connect.ts   — prop-getter: getRootProps() with all ARIA attrs + event handlers
toggle.types.ts     — ToggleState, ToggleContext, CreateToggleOptions
```

## API

```ts
interface CreateToggleOptions {
  id?: string;
  pressed?: boolean;          // controlled
  defaultPressed?: boolean;   // uncontrolled
  disabled?: boolean;
  value?: string;             // useful inside ToggleGroup
  onPressedChange?: (pressed: boolean) => void;
}
```

## React

```tsx
import { Toggle } from "@forge-ui/react";

// Uncontrolled
<Toggle aria-label="Bold" defaultPressed={false}>B</Toggle>

// Controlled
<Toggle pressed={isBold} onPressedChange={setIsBold} aria-label="Bold">B</Toggle>

// Disabled
<Toggle disabled aria-label="Bold (disabled)">B</Toggle>
```

## Vue

```vue
<script setup>
import { ToggleRoot } from "@forge-ui/vue";
const isBold = ref(false);
</script>

<template>
  <ToggleRoot v-model:pressed="isBold" aria-label="Gras">B</ToggleRoot>
</template>
```

## Data attributes

| Attribute | Value |
|-----------|-------|
| `data-forge-scope` | `"toggle"` |
| `data-forge-part` | `"root"` |
| `data-state` | `"on"` \| `"off"` |
| `data-pressed` | `""` when pressed, absent otherwise |
| `data-disabled` | `""` when disabled |
| `data-value` | the `value` prop (if set) |

## Keyboard

| Key | Behavior |
|-----|----------|
| `Space` | Toggle pressed state |
| `Enter` | Toggle pressed state |

## Competitors

| Library | Role | Navigation |
|---------|------|------------|
| Radix UI | `<button>` (implicit `role="button"`) | Space/Enter |
| Ark UI | `<button>` + `aria-pressed` | Space/Enter |
| **@forge-ui/toggle** | `<button>` + `aria-pressed` | Space/Enter |

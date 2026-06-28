# @forge-ui/toggle-group

Group of toggle buttons with roving tabindex — WAI-ARIA APG Toolbar Pattern.

## WAI-ARIA

### Root
| Attribute | Value | Notes |
|-----------|-------|-------|
| `role` | `"toolbar"` | APG Toolbar Pattern (not `role="group"`) |
| `aria-orientation` | `"horizontal"` \| `"vertical"` | matches `orientation` prop |
| `aria-disabled` | `"true"` | when all items disabled |
| `aria-label` | required | consumers must provide accessible name |

### Items
| Attribute | Value | Notes |
|-----------|-------|-------|
| `role` | `button` (native `<button>`) | WAI-ARIA Button Pattern |
| `aria-pressed` | `"true"` / `"false"` | individual pressed state |
| `aria-disabled` | `"true"` | when item or group disabled |
| `tabindex` | `0` \| `-1` | roving tabindex pattern |

**Why `role="toolbar"` and NOT `role="group"`?**  
Radix UI and Ark UI both use `role="group"`, which is technically valid. However, the APG explicitly defines a Toolbar Pattern for "a container for grouping a set of controls, such as buttons, menubuttons, or checkboxes." The Toolbar Pattern mandates:
1. Arrow-key navigation between items (roving tabindex)
2. `role="toolbar"` on the container
3. `aria-label` or `aria-labelledby` on the container

Using `role="group"` loses these AT expectations. We follow the APG strictly.

## Architecture

```
toggle-group.machine.ts   — FSM: single/multiple value management
toggle-group.connect.ts   — getRootProps() + getItemProps(value, disabled?)
                          — navigateToolbar() handles Arrow/Home/End roving tabindex
toggle-group.types.ts     — ToggleGroupContext, CreateToggleGroupOptions
```

## API

```ts
interface CreateToggleGroupOptions {
  id?: string;
  type?: "single" | "multiple";   // default: "single"
  value?: string[];               // controlled
  defaultValue?: string[];        // uncontrolled
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";  // default: "horizontal"
  rovingFocus?: boolean;          // default: true
  loop?: boolean;                 // default: true (wraps at edges)
  onValueChange?: (value: string[]) => void;
}
```

## React

```tsx
import { ToggleGroup } from "@forge-ui/react";

// Single selection (text alignment)
<ToggleGroup.Root type="single" aria-label="Text alignment">
  <ToggleGroup.Item value="left" aria-label="Align left">←</ToggleGroup.Item>
  <ToggleGroup.Item value="center" aria-label="Center">↔</ToggleGroup.Item>
  <ToggleGroup.Item value="right" aria-label="Align right">→</ToggleGroup.Item>
</ToggleGroup.Root>

// Multiple selection (formatting)
<ToggleGroup.Root type="multiple" aria-label="Text formatting">
  <ToggleGroup.Item value="bold" aria-label="Bold">B</ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Italic">I</ToggleGroup.Item>
  <ToggleGroup.Item value="underline" aria-label="Underline">U</ToggleGroup.Item>
</ToggleGroup.Root>
```

## Vue

```vue
<script setup>
import { ToggleGroup, ToggleGroupRoot, ToggleGroupItem } from "@forge-ui/vue";
const alignment = ref([]);
</script>

<template>
  <ToggleGroupRoot v-model:value="alignment" type="single" aria-label="Alignement">
    <ToggleGroupItem value="left" aria-label="Gauche">←</ToggleGroupItem>
    <ToggleGroupItem value="center" aria-label="Centre">↔</ToggleGroupItem>
    <ToggleGroupItem value="right" aria-label="Droite">→</ToggleGroupItem>
  </ToggleGroupRoot>
</template>
```

## Keyboard

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowDown` | Focus next item |
| `ArrowLeft` / `ArrowUp` | Focus previous item |
| `Home` | Focus first item |
| `End` | Focus last item |
| `Space` / `Enter` | Toggle the focused item |

Both axes (ArrowRight+Down = next, ArrowLeft+Up = prev) respond regardless of `orientation` — this matches the APG recommendation for toolbar keyboard interaction.

## Data attributes

| Attribute | Value |
|-----------|-------|
| `data-forge-scope` | `"toggle-group"` |
| `data-forge-part` | `"root"` \| `"item"` |
| `data-state` | `"on"` \| `"off"` (items) |
| `data-orientation` | `"horizontal"` \| `"vertical"` |

## Competitors

| Library | Root role | Navigation |
|---------|-----------|------------|
| Radix UI | `role="group"` | Arrow keys |
| Ark UI | `role="group"` | Arrow keys |
| **@forge-ui/toggle-group** | `role="toolbar"` (APG strict) | Arrow/Home/End |

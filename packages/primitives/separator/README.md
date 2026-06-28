# @forge-ui/separator

Semantic or decorative separator — WAI-ARIA §6.15.

## WAI-ARIA

### Semantic (`decorative={false}`, default)
| Attribute | Value |
|-----------|-------|
| `role` | `"separator"` |
| `aria-orientation` | `"horizontal"` \| `"vertical"` |

### Decorative (`decorative={true}`)
| Attribute | Value | Rationale |
|-----------|-------|-----------|
| `role` | `"none"` | Removes element from accessibility tree |
| `aria-hidden` | `"true"` | Belt-and-suspenders: some AT ignore role=none |

**When to use `decorative`?**  
If the separator is purely visual spacing (e.g., between two sections of a menu that a sighted user finds helpful but carries no structural meaning for AT), use `decorative={true}`. If the separator delineates a content boundary that matters for navigation or understanding (e.g., separating "Recent" from "All" in a listbox), use `decorative={false}`.

This matches the same distinction made by Radix UI's `<Separator>` component and WCAG 1.1.1 (non-text content).

## Architecture

```
separator.connect.ts   — stateless: getSeparatorProps() only, no machine needed
```

No FSM is required — separator has no interactive state. This is why it lives in a separate package from `@forge-ui/core` (no machine import).

## API

```ts
interface SeparatorOptions {
  orientation?: "horizontal" | "vertical";  // default: "horizontal"
  decorative?: boolean;                     // default: false
}

connectSeparator(options?) => {
  getSeparatorProps(): Record<string, unknown>
}
```

## React

```tsx
import { Separator } from "@forge-ui/react";

// Semantic (announces to screen readers)
<Separator />
<Separator orientation="vertical" />

// Decorative (invisible to AT)
<Separator decorative />
```

## Vue

```vue
<template>
  <!-- Semantic -->
  <SeparatorRoot />

  <!-- Vertical -->
  <SeparatorRoot orientation="vertical" />

  <!-- Decorative -->
  <SeparatorRoot :decorative="true" />
</template>
```

## Data attributes

| Attribute | Value |
|-----------|-------|
| `data-forge-scope` | `"separator"` |
| `data-forge-part` | `"root"` |
| `data-orientation` | `"horizontal"` \| `"vertical"` |

## Competitors

| Library | Semantic | Decorative |
|---------|----------|------------|
| Radix UI | `role="separator"` | `role="none"` |
| Ark UI | `role="separator"` | not documented |
| **@forge-ui/separator** | `role="separator"` + `aria-orientation` | `role="none"` + `aria-hidden` |

We add `aria-hidden="true"` on decorative separators as belt-and-suspenders — some older AT implementations do not fully honor `role="none"`.

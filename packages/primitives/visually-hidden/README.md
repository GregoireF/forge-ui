# @forge-ui/visually-hidden

CSS technique to hide content visually while keeping it accessible to screen readers.

## Why this exists

Icon buttons, status indicators, and decorative text often lack visible labels. `VisuallyHidden` wraps content in a span with a CSS clip that removes it from the visual render while preserving it in the accessibility tree. This satisfies WCAG 2.1 §1.3.1 (Info and Relationships) and §4.1.2 (Name, Role, Value).

**Alternatives considered:**

| Approach | Visible | AT reads | Focusable | Problem |
|----------|---------|----------|-----------|---------|
| `display:none` | No | No | No | AT can't see it |
| `visibility:hidden` | No | No | No | AT can't see it |
| `opacity:0` | No | Yes (maybe) | Yes | Fragile, layout space used |
| `aria-label` | No | Yes | — | Only works on interactive elements |
| **VisuallyHidden** | No | Yes | Optional | Correct for all cases |

## CSS technique

```css
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
clip: rect(0, 0, 0, 0);
clip-path: inset(50%);
white-space: nowrap;
border-width: 0;
```

`clip-path: inset(50%)` is the modern replacement for the deprecated `clip` property. Both are included for maximum browser compatibility. `white-space: nowrap` prevents the 1px box from wrapping text, which could cause layout glitches.

## API

```ts
interface VisuallyHiddenOptions {
  focusable?: boolean;  // default: false — set true for skip links
}

connectVisuallyHidden(options?) => {
  getProps(): { style, tabIndex?, "data-forge-scope", "data-forge-part" }
}
```

## React

```tsx
import { VisuallyHidden } from "@forge-ui/react";

// Icon button with accessible label
<button aria-label={undefined}>
  <CloseIcon />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>

// Skip link (focusable visually-hidden until focused)
<VisuallyHidden focusable>
  <a href="#main-content">Skip to content</a>
</VisuallyHidden>
```

## Vue

```vue
<template>
  <button>
    <CloseIcon />
    <VisuallyHiddenRoot>Fermer le dialog</VisuallyHiddenRoot>
  </button>

  <!-- Skip link -->
  <VisuallyHiddenRoot :focusable="true">
    <a href="#main">Aller au contenu</a>
  </VisuallyHiddenRoot>
</template>
```

## `focusable` prop — skip links

When `focusable={true}`, the element gets `tabIndex=0`, making it reachable by keyboard. Combined with a `:focus-visible` CSS rule that unhides the element, this is the standard "skip navigation" link pattern (WCAG 2.4.1).

```css
[data-forge-scope="visually-hidden"]:focus-within {
  /* Reveal when focused */
  position: static;
  width: auto;
  height: auto;
  clip: auto;
  clip-path: none;
  overflow: visible;
  white-space: normal;
}
```

## The `forge-sr-only` CSS class

`@forge-ui/css` ships `.forge-sr-only` and `.forge-sr-only-focusable:not(:focus-visible)` classes that implement the same technique for contexts where JSX components aren't available (e.g., plain HTML).

## Data attributes

| Attribute | Value |
|-----------|-------|
| `data-forge-scope` | `"visually-hidden"` |
| `data-forge-part` | `"root"` |

# @forge-ui/css

Opt-in CSS animations and utility classes for forge-ui primitives.

## Installation

```sh
npm install @forge-ui/css
```

## Entrypoints

| Import path | Contents | Motion |
|-------------|----------|--------|
| `@forge-ui/css` | All animations unconditionally | Always plays |
| `@forge-ui/css/animations` | Same as above, explicit path | Always plays |
| `@forge-ui/css/motion-safe` | All animations wrapped in `@media (prefers-reduced-motion: no-preference)` | Respects OS setting |

**Recommendation:** Use `motion-safe` in production. It satisfies WCAG 2.1 §2.3.3 (Animation from Interactions) by not playing animations for users who have requested reduced motion in their OS settings.

## Usage

```ts
// Vite / bundler
import "@forge-ui/css/motion-safe";

// Or in your CSS entrypoint
@import "@forge-ui/css/motion-safe";
```

## Animations

### Overlay (Dialog, AlertDialog, Popover, HoverCard)

```css
[data-forge-part="overlay"][data-state="open"]  { animation: forge-fade-in ... }
[data-forge-part="overlay"][data-state="closed"] { animation: forge-fade-out ... }
```

### Content (Collapsible, Accordion, Dialog content, Popover content)

```css
[data-forge-part="content"][data-state="open"]  { animation: forge-slide-up-and-fade ... }
[data-forge-part="content"][data-state="closed"] { animation: forge-slide-down-and-fade ... }
```

### Per-scope overrides

Tooltips and HoverCards animate faster than dialogs (faster UX feedback expected):

```css
[data-forge-scope="tooltip"][data-forge-part="content"] { --forge-overlay-duration: 100ms; }
[data-forge-scope="hover-card"][data-forge-part="content"] { --forge-overlay-duration: 120ms; }
```

## CSS Custom Properties

Override at any level — globally, per-component, or per-instance:

| Variable | Default | Controls |
|----------|---------|----------|
| `--forge-overlay-duration` | `150ms` | Fade in/out duration |
| `--forge-overlay-ease-in` | `cubic-bezier(0.16,1,0.3,1)` | Ease in curve |
| `--forge-overlay-ease-out` | `cubic-bezier(0.7,0,0.84,0)` | Ease out curve |
| `--forge-slide-offset` | `4px` | Slide travel distance |
| `--forge-zoom-from` | `0.96` | Zoom scale origin |

```css
/* Custom dialog timing */
[data-forge-scope="dialog"] {
  --forge-overlay-duration: 200ms;
  --forge-slide-offset: 8px;
}
```

## Utility classes

| Class | Effect |
|-------|--------|
| `.forge-sr-only` | Visually hidden, accessible to screen readers |
| `.forge-sr-only-focusable:not(:focus-visible)` | Hidden until focused (skip links) |

These classes are **not** inside a `@media (prefers-reduced-motion)` query — they are layout/accessibility utilities, not motion.

## Keyframes

| Name | Description |
|------|-------------|
| `forge-fade-in` | Opacity 0 → 1 |
| `forge-fade-out` | Opacity 1 → 0 |
| `forge-slide-up-and-fade` | Slide up + fade in |
| `forge-slide-down-and-fade` | Slide down + fade out |
| `forge-slide-right-and-fade` | Slide right + fade in (drawer) |
| `forge-slide-left-and-fade` | Slide left + fade out (drawer) |
| `forge-zoom-in` | Scale from `var(--forge-zoom-from)` + fade |
| `forge-zoom-out` | Scale to `var(--forge-zoom-from)` + fade |

## WCAG compliance

- `motion-safe.css` wraps all animations in `@media (prefers-reduced-motion: no-preference)` → WCAG 2.1 §2.3.3 (Level AAA)
- `.forge-sr-only` enables accessible text for icon-only elements → WCAG 2.1 §1.3.1, §4.1.2

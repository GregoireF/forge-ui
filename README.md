# forge-ui

Headless, accessible UI primitives for React and Vue. Zero styling — you own the CSS.

> **Status: pre-release (alpha).** API is stabilising. Not yet published to npm.

## Architecture

Three-tier design inspired by [Zag.js](https://zagjs.com/):

```
@forge-ui/core     framework-agnostic FSM engine + a11y utilities
@forge-ui/dialog   dialog machine + connect (no framework knowledge)
@forge-ui/react    thin React 19+ binding  (useMachine, Dialog.*, useDialog)
@forge-ui/vue      thin Vue 3.5+ binding   (useMachine, Dialog.*, useDialog)
@forge-ui/nuxt     Nuxt 4 module with auto-imports
```

Each layer is independent — `@forge-ui/core` has no knowledge of Dialog, and the framework bindings contain no behaviour logic.

## Packages

| Package | Description |
|---|---|
| [`@forge-ui/core`](packages/core) | FSM engine, focus trap, scroll lock, aria-hidden, SSR utils |
| [`@forge-ui/dialog`](packages/primitives/dialog) | Dialog machine + connect (framework-agnostic) |
| [`@forge-ui/react`](packages/react) | React 19+ binding |
| [`@forge-ui/vue`](packages/vue) | Vue 3.5+ binding |
| [`@forge-ui/nuxt`](packages/nuxt) | Nuxt 4 module |

## Quick start

### React

```bash
npm install @forge-ui/react
```

```tsx
import { Dialog } from '@forge-ui/react'

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
          <Dialog.Description>A headless dialog.</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Vue

```bash
npm install @forge-ui/vue
```

```vue
<script setup>
import { Dialog } from '@forge-ui/vue'
</script>

<template>
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Hello</Dialog.Title>
        <Dialog.Description>A headless dialog.</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
```

### Nuxt

```bash
npm install @forge-ui/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@forge-ui/nuxt'],
})
```

No explicit imports needed — all components and composables are auto-imported.

## Styling

Every rendered element exposes `data-state` and `data-forge-part` attributes:

```
data-state        "open" | "closed"
data-forge-part   "trigger" | "overlay" | "content" | "title" | "description" | "close"
```

**Tailwind**

```html
<div data-forge-part="overlay"
     class="fixed inset-0 bg-black/50 data-[state=closed]:hidden" />
<div data-forge-part="content"
     class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6
            data-[state=closed]:hidden" />
```

**Plain CSS with exit animations** — use `forceMount` to keep content in the DOM:

```css
[data-forge-part="content"][data-state="open"]   { animation: fadeIn  150ms ease; }
[data-forge-part="content"][data-state="closed"] { animation: fadeOut 150ms ease forwards; }
```

## Development

```bash
bun install
bun run build       # build all packages
bun run test        # unit tests (153 specs)
bun run test:e2e    # Playwright E2E (start playground servers first)
bun run lint
bun run typecheck
```

## License

MIT

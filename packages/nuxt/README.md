# @forge-ui/nuxt

Nuxt 4 module for forge-ui. Auto-imports all Vue components and composables — no explicit imports needed in your pages or components.

## Install

```bash
npm install @forge-ui/nuxt
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@forge-ui/nuxt'],
})
```

## Usage

Everything from `@forge-ui/vue` is available without imports:

```vue
<template>
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Description.</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
```

```vue
<script setup>
// useDialog is auto-imported
const dialog = useDialog()
</script>
```

## Auto-imported exports

| Export | Type |
|---|---|
| `Dialog` | Compound component namespace (`Dialog.Root`, `Dialog.Trigger`, …) |
| `DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose` | Individual components |
| `useDialog` | Composable |
| `useMachine` | Low-level composable |

## Peer dependencies

- `nuxt >= 4.0.0`
- `@forge-ui/vue` (auto-installed as a dependency)

---
"@forge-ui/core": minor
"@forge-ui/dialog": minor
"@forge-ui/react": minor
"@forge-ui/vue": minor
"@forge-ui/nuxt": minor
---

Initial alpha release of the forge-ui headless UI library.

Three-tier architecture: `@forge-ui/core` (FSM engine + a11y utils) → `@forge-ui/dialog` (machine + connect, framework-agnostic) → `@forge-ui/react` / `@forge-ui/vue` (thin bindings). `@forge-ui/nuxt` provides Nuxt 4 auto-imports.

Includes: Dialog primitive with compound API (`Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Portal`, …), hook API (`useDialog`), focus trap, scroll lock, aria-hidden background, interact-outside, keyboard navigation, `data-state` / `data-forge-part` attributes, `asChild`, `forceMount`, controlled mode, and `v-model:open` (Vue).

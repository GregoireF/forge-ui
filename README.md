# forge-ui

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg?token=TOKEN)](https://codecov.io/gh/OWNER/REPO)
[![WAI-ARIA 1.2](https://img.shields.io/badge/WAI--ARIA-1.2-0057b8)](https://www.w3.org/TR/wai-aria-1.2/)
[![E2E Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33)](e2e/)

Composants headless accessibles pour React 19 et Vue 3. Zéro style — vous gérez le CSS.

> **Statut : pré-release (alpha).** API en cours de stabilisation. Pas encore publié sur npm.
> **Badges** : remplacez `OWNER/REPO` et `TOKEN` par vos valeurs et ajoutez le secret `CODECOV_TOKEN` dans les settings GitHub.

---

## Primitives

| Primitive | Package | React | Vue | Nuxt | WAI-ARIA |
|-----------|---------|:-----:|:---:|:----:|----------|
| Dialog | `@forge-ui/dialog` | ✅ | ✅ | ✅ | [Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| AlertDialog | `@forge-ui/alert-dialog` | ✅ | ✅ | ✅ | [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) |
| Popover | `@forge-ui/popover` | ✅ | ✅ | ✅ | [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) |
| Select | `@forge-ui/select` | ✅ | ✅ | ✅ | [Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) |

---

## Architecture

Inspirée de [Zag.js](https://zagjs.com) — notre propre implémentation FSM (~150 lignes, zéro dépendance runtime).

```
packages/
  core/                  # FSM engine + a11y (focus-trap, scroll-lock, aria-hidden, stack-registry)
  floating/              # @floating-ui/dom wrapper (makeComputePositionActivity)
  field/                 # Field / FieldLabel / FieldControl / FieldDescription / FieldError
  primitives/
    dialog/              # createDialogMachine + connectDialog
    alert-dialog/        # createAlertDialogMachine + connectAlertDialog
    popover/             # createPopoverMachine + connectPopover
    select/              # createSelectMachine + connectSelect
  react/                 # Bindings React 19 (compound components + hooks)
  vue/                   # Bindings Vue 3.5 (defineComponent + provide/inject)
  nuxt/                  # Module Nuxt 3 (auto-import)
apps/
  playground-react/      # Vite + React 19
  playground-vue/        # Vite + Vue 3
  playground-nuxt/       # Nuxt 3 — aucun import manuel
```

### Pattern machine → connect → binding

```
createXMachine(options)              # FSM pure, aucun DOM, testable unitairement
        ↓
connectX(snapshot, send, machine)   # prop-getters framework-agnostiques (React + Vue compatibles)
        ↓
useX() + X.Root / X.Trigger / …     # Binding React ou Vue
```

---

## Quick start

### React

```tsx
import { Dialog, AlertDialog, Popover, Select } from '@forge-ui/react'

// Dialog
<Dialog.Root>
  <Dialog.Trigger>Ouvrir</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Titre</Dialog.Title>
      <Dialog.Description>Description.</Dialog.Description>
      <Dialog.Close>Fermer</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// AlertDialog — Escape et outside-click bloqués
<AlertDialog.Root>
  <AlertDialog.Trigger>Supprimer</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content>
      <AlertDialog.Title>Confirmer la suppression ?</AlertDialog.Title>
      <AlertDialog.Description>Action irréversible.</AlertDialog.Description>
      <AlertDialog.Cancel>Annuler</AlertDialog.Cancel>
      <AlertDialog.Action>Supprimer</AlertDialog.Action>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>

// Select — WAI-ARIA 1.2 Select-Only Combobox
<Select.Root onValueChange={(v) => console.log(v)}>
  <Select.Label>Framework</Select.Label>
  <Select.Trigger>
    <Select.Value placeholder="Choisir…" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Item value="react">React</Select.Item>
      <Select.Item value="vue">Vue</Select.Item>
      <Select.Item value="angular" disabled>Angular</Select.Item>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

### Vue

```vue
<script setup>
import { Dialog, AlertDialog, Select } from '@forge-ui/vue'
</script>

<template>
  <!-- Dialog -->
  <Dialog.Root>
    <Dialog.Trigger>Ouvrir</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Titre</Dialog.Title>
        <Dialog.Close>Fermer</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>

  <!-- Select -->
  <Select.Root @update:value="console.log($event)">
    <Select.Label>Framework</Select.Label>
    <Select.Trigger>
      <Select.Value placeholder="Choisir…" />
    </Select.Trigger>
    <Select.Portal>
      <Select.Content>
        <Select.Item value="react">React</Select.Item>
        <Select.Item value="vue">Vue</Select.Item>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>
```

### Nuxt (auto-import)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@forge-ui/nuxt'],
})
```

```vue
<!-- app.vue — aucun import, tout est auto-importé -->
<template>
  <Dialog.Root>
    <Dialog.Trigger>Ouvrir</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title>Titre</Dialog.Title>
        <Dialog.Close>Fermer</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
```

---

## Styling

Chaque élément expose `data-state` et `data-forge-part` :

```
data-state          "open" | "closed"
data-forge-part     "trigger" | "overlay" | "content" | "title" | "description" | "close"
                    "positioner" | "option" | "item-text" | "separator" | "group-label"
data-selected       présent sur les options sélectionnées (Select)
data-highlighted    présent sur l'option survolée/clavier (Select)
data-disabled       présent sur les éléments désactivés
data-side           "top" | "bottom" | "left" | "right" (Popover, Select)
data-align          "start" | "center" | "end" (Popover, Select)
```

**Tailwind**

```html
<button data-forge-part="trigger"
        class="px-4 py-2 bg-slate-900 text-white rounded data-[state=open]:ring-2" />

<li data-forge-part="option"
    class="px-3 py-1.5 rounded cursor-pointer
           data-[highlighted]:bg-blue-50 data-[selected]:font-semibold
           data-[disabled]:opacity-40 data-[disabled]:pointer-events-none" />
```

**Animations CSS avec `forceMount`**

```css
[data-forge-part="content"][data-state="open"]   { animation: fadeIn  150ms ease; }
[data-forge-part="content"][data-state="closed"] { animation: fadeOut 150ms ease forwards; }
```

---

## Développement

```bash
bun install

# Playgrounds
bun --filter @forge-ui/playground-react dev
bun --filter @forge-ui/playground-vue dev
bun --filter @forge-ui/playground-nuxt dev

# Tests
bun run test               # tous les packages (turbo)
bun run test:coverage      # + rapport de couverture lcov + json-summary
cd packages/react && bun run test
cd packages/vue   && bun run test

# Build + typecheck
bun run build
bun run typecheck
bun run lint
```

---

## Pourquoi pas Radix / Ark / Headless UI ?

| | forge-ui | Radix UI | Ark UI | Headless UI |
|---|---|---|---|---|
| React | ✅ | ✅ | ✅ | ✅ |
| Vue | ✅ | ❌ | ✅ | ✅ |
| FSM partagé React+Vue | ✅ | — | ✅ (Zag) | ❌ |
| Zero runtime deps | ✅ | — | ❌ (Zag) | — |
| Select-Only Combobox WAI-ARIA 1.2 | ✅ | ✅ | ✅ | ❌ |
| AlertDialog séparé du Dialog | ✅ | ✅ | ✅ | ❌ |
| Floating positioning intégré | ✅ | ✅ | ✅ | ❌ |
| Stack registry (dialogs imbriqués) | ✅ | ✅ | ✅ | ⚠️ |

---

## Licence

MIT

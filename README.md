# forge-ui

[![CI](https://github.com/GregoireF/forge-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/GregoireF/forge-ui/actions/workflows/ci.yml)
[![E2E](https://github.com/GregoireF/forge-ui/actions/workflows/e2e.yml/badge.svg)](https://github.com/GregoireF/forge-ui/actions/workflows/e2e.yml)
[![Coverage](https://codecov.io/gh/GregoireF/forge-ui/branch/main/graph/badge.svg)](https://codecov.io/gh/GregoireF/forge-ui)
[![axe-core WCAG 2.1 AA](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/GregoireF/forge-ui/main/axe-badge.json)](e2e/react/a11y.spec.ts)
[![Bundle size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/GregoireF/forge-ui/main/bundle-size-badge.json)](tooling/scripts/bundle-size.ts)
[![WAI-ARIA 1.2](https://img.shields.io/badge/WAI--ARIA-1.2-0057b8)](https://www.w3.org/TR/wai-aria-1.2/)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Primitifs headless accessibles pour **React 19**, **Vue 3** et **Nuxt 4**. Zéro style — vous gérez le CSS, forge-ui gère la logique.

> **Statut : pré-release (alpha).** API en cours de stabilisation. Pas encore publié sur npm.

---

## Pourquoi forge-ui ?

| | forge-ui | Radix UI | Ark UI | Headless UI | Reka UI |
|---|:---:|:---:|:---:|:---:|:---:|
| **React** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Vue** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Nuxt (auto-import)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **FSM machine exposée** | ✅ | ❌ | ✅ (Zag.js) | ❌ | ❌ |
| **Core sans dépendance runtime** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Date Picker** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Date Range Picker** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Combobox creatable** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Virtual scroll (Select / Combobox)** | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## Primitives (28)

### Overlays & floating

| Primitive | Package | Spec WAI-ARIA |
|---|---|---|
| Dialog | `@forge-ui/dialog` | [Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| Alert Dialog | `@forge-ui/alert-dialog` | [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) |
| Popover | `@forge-ui/popover` | Panel flottant modal/non-modal |
| Tooltip | `@forge-ui/tooltip` | `role="tooltip"` — provider skip-delay |
| Hover Card | `@forge-ui/hover-card` | Popover déclenché au survol |
| Menu | `@forge-ui/menu` | `role="menu"` — keyboard nav, submenus |

### Formulaires & interactions

| Primitive | Package | Spec WAI-ARIA |
|---|---|---|
| Checkbox | `@forge-ui/checkbox` | `role="checkbox"` — tri-state, groupe, select-all |
| Radio Group | `@forge-ui/radio-group` | `role="radiogroup"` |
| Switch | `@forge-ui/switch` | `role="switch"` |
| Toggle | `@forge-ui/toggle` | `<button aria-pressed>` |
| Toggle Group | `@forge-ui/toggle-group` | `role="toolbar"` — roving tabindex |
| Slider | `@forge-ui/slider` | `role="slider"` — multi-thumb, marks, vertical |
| Number Input | `@forge-ui/number-input` | `role="spinbutton"` — spin-repeat, locale |
| Tags Input | `@forge-ui/tags-input` | Live region `role="status"` |
| Field | `@forge-ui/field` | Provider IDs label / description / error |

### Sélection

| Primitive | Package | Spec WAI-ARIA |
|---|---|---|
| Select | `@forge-ui/select` | [Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) — groupes, multi, virtual scroll |
| Combobox | `@forge-ui/combobox` | [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — async, creatable, TagsInput, virtual scroll |

### Date & Heure

| Primitive | Package | Notes |
|---|---|---|
| Date Field | `@forge-ui/date-field` | Saisie segmentée spinbutton |
| Time Picker | `@forge-ui/time-picker` | 12 h / 24 h, secondes optionnelles |
| Date Picker | `@forge-ui/date-picker` | Pop-up calendrier — vues jour/mois/année, min/max |
| Date Range Picker | `@forge-ui/date-range-picker` | Sélection de plage deux phases, dual-calendar |

### Navigation & Layout

| Primitive | Package | Spec WAI-ARIA |
|---|---|---|
| Accordion | `@forge-ui/accordion` | `role="region"` — single / multiple |
| Collapsible | `@forge-ui/collapsible` | Disclosure widget |
| Tabs | `@forge-ui/tabs` | `role="tablist"` — activation auto / manuelle |
| Progress | `@forge-ui/progress` | `role="progressbar"` — déterminé / indéterminé |

### Utilitaires

| Primitive | Package | Notes |
|---|---|---|
| Avatar | `@forge-ui/avatar` | FSM image load — fallback, initiales auto |
| Separator | `@forge-ui/separator` | `role="separator"` ou `role="none"` |
| Visually Hidden | `@forge-ui/visually-hidden` | CSS clip-path — visible aux AT uniquement |

---

## Poids des primitives

Les tailles ci-dessous sont mesurées en **gzip** après tree-shaking et minification (esbuild). Peer deps (`react`, `vue`, `@floating-ui/dom`) sont externalisés.

| Catégorie | Primitives | Budget gzip | Seuil d'alerte |
|---|---|---|---|
| Stateless / zéro-machine | `separator`, `visually-hidden` | < 1 kB | 0,5 kB |
| Simples (toggle, switch, progress…) | `toggle`, `toggle-group`, `checkbox`, `radio-group`, `switch`, `progress`, `tabs`, `collapsible` | < 3,5 kB | 2 kB |
| Moyens (slider, accordion, tags…) | `accordion`, `slider`, `tags-input`, `dialog`, `field` | < 7 kB | 4 kB |
| Floating (select, combobox, popover…) | `popover`, `select`, `combobox`, `tooltip`, `hover-card`, `menu` | < 12 kB | 6 kB |

**Référence concurrente :**

| Package | Gzip (gzip) |
|---|---|
| Radix UI `@radix-ui/react-dialog` | ~5.2 kB |
| Radix UI `@radix-ui/react-select` | ~9.2 kB |
| Zag.js `@zag-js/accordion` | ~2.5 kB |
| Zag.js `@zag-js/combobox` | ~8.1 kB |
| Headless UI `@headlessui/react` (Combobox) | ~12 kB |

Le script d'analyse complet tourne à chaque PR :

```bash
bun run size         # rapport local
bun run size:ci      # + sortie 1 si seuil dépassé
```

---

## Architecture

Inspirée de [Zag.js](https://zagjs.com) — FSM maison (~150 lignes, zéro dépendance runtime).

```
packages/
  core/                        # FSM engine + utilitaires a11y
  floating/                    # Wrapper @floating-ui/dom
  primitives/                  # 28 packages machine + connect
  react/                       # Bindings React 19
  vue/                         # Bindings Vue 3.5
  nuxt/                        # Module Nuxt 4 (auto-import)
apps/
  playground-react/            # Vite + React 19  (localhost:3000)
  playground-vue/              # Vite + Vue 3     (localhost:3001)
  playground-nuxt/             # Nuxt 4           (localhost:3002)
e2e/                           # Playwright — 3 browsers × 3 playgrounds
```

### Pattern machine → connect → binding

```
createXMachine(options)              # FSM pure, testable unitairement
        ↓
connectX(snapshot, send, machine)   # prop-getters framework-agnostiques
        ↓
useX() + X.Root / X.Trigger / …     # Binding React / Vue (couche mince)
```

---

## Quick start

### React

```bash
npm install @forge-ui/react
```

```tsx
import { Dialog, Select, Slider, DatePicker } from '@forge-ui/react'

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

<Select.Root onValueChange={console.log}>
  <Select.Trigger><Select.Value><Select.Placeholder>Choisir…</Select.Placeholder></Select.Value></Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Item value="react"><Select.ItemText>React</Select.ItemText></Select.Item>
      <Select.Item value="vue"><Select.ItemText>Vue</Select.ItemText></Select.Item>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

Voir [packages/react/README.md](packages/react/README.md) pour l'API complète des 28 primitives.

### Vue

```bash
npm install @forge-ui/vue
```

```vue
<script setup>
import { Dialog, Select } from '@forge-ui/vue'
</script>

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

Voir [packages/vue/README.md](packages/vue/README.md) pour l'API complète.

### Nuxt (auto-import)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@forge-ui/nuxt'],
})
```

Toutes les primitives sont auto-importées — aucun `import` requis dans les composants.

---

## Patterns clés

### `asChild` — rendu polymorphe

```tsx
<Dialog.Trigger asChild>
  <MyButton variant="primary">Ouvrir</MyButton>
</Dialog.Trigger>
```

### `forceMount` — animations CSS de sortie

```tsx
<Dialog.Content forceMount>...</Dialog.Content>
```

```css
[data-forge-part="content"][data-state="open"]   { animation: fadeIn  150ms ease; }
[data-forge-part="content"][data-state="closed"] { animation: fadeOut 150ms ease forwards; }
```

### Data attributes (Tailwind-friendly)

| Attribut | Valeurs | Éléments |
|---|---|---|
| `data-state` | `"open"` / `"closed"` / `"checked"` / `"unchecked"` | Tous les overlays et inputs |
| `data-forge-part` | `"trigger"` / `"content"` / `"item"` / `"thumb"` / … | Tous |
| `data-disabled` | `""` (présent) | Éléments désactivés |
| `data-selected` | `""` (présent) | Options sélectionnées |
| `data-highlighted` | `""` (présent) | Option active au clavier |
| `data-orientation` | `"horizontal"` / `"vertical"` | Slider, Tabs |
| `data-side` | `"top"` / `"bottom"` / `"left"` / `"right"` | Popover, Select, Tooltip |

```html
<!-- Utilisation Tailwind v4 -->
<li data-forge-part="option"
    class="px-3 py-1.5 rounded
           data-highlighted:bg-blue-50
           data-selected:font-semibold
           data-disabled:opacity-40 data-disabled:pointer-events-none" />
```

---

## Développement

```bash
bun install

# Playgrounds simultanés
bun run dev

# Individuels
bun run dev:react    # localhost:3000
bun run dev:vue      # localhost:3001
bun run dev:nuxt     # localhost:3002

# Tests
bun run test             # unitaires
bun run test:coverage    # + rapport couverture
bun run test:e2e         # Playwright 3 browsers

# Qualité
bun run build
bun run typecheck
bun run lint

# Analyse de taille
bun run size             # rapport local
bun run size:ci          # échoue si seuil dépassé
```

---

## Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) — GitFlow, conventions de commit (gitmoji), checklist PR, et processus de promotion vers main.

---

## Licence

MIT © [GregoireF](https://github.com/GregoireF)

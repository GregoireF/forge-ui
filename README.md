# forge-ui

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg?token=TOKEN)](https://codecov.io/gh/OWNER/REPO)
[![WAI-ARIA 1.2](https://img.shields.io/badge/WAI--ARIA-1.2-0057b8)](https://www.w3.org/TR/wai-aria-1.2/)
[![E2E Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33)](e2e/)
[![axe-core WCAG 2.1 AA](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OWNER/REPO/main/axe-badge.json)](e2e/react/a11y.spec.ts)

Composants headless accessibles pour React 19 et Vue 3. Zéro style — vous gérez le CSS.

> **Statut : pré-release (alpha).** API en cours de stabilisation. Pas encore publié sur npm.  
> **Badges** : remplacez `OWNER/REPO` et `TOKEN` par vos valeurs et ajoutez le secret `CODECOV_TOKEN` dans les settings GitHub.  
> **Badge axe-core** : après chaque run CI, le script `e2e/update-axe-badge.mjs` met à jour `axe-badge.json` et le commit automatiquement. Shields.io lit le JSON via l'endpoint `raw.githubusercontent.com`.

---

## Primitives

### Disponibles (React · Vue · Nuxt)

| Primitive | Package | WAI-ARIA |
|-----------|---------|----------|
| Dialog | `@forge-ui/dialog` | [Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |
| AlertDialog | `@forge-ui/alert-dialog` | [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) |
| Popover | `@forge-ui/popover` | [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) |
| Select | `@forge-ui/select` | [Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) |
| Combobox | `@forge-ui/combobox` | [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) |
| Checkbox | `@forge-ui/checkbox` | [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) |
| RadioGroup | `@forge-ui/radio-group` | [Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) |
| Switch | `@forge-ui/switch` | [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) |
| Tooltip | `@forge-ui/tooltip` | [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) |
| HoverCard | `@forge-ui/hover-card` | Popover non-modal au survol |
| Accordion | `@forge-ui/accordion` | [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) |
| Collapsible | `@forge-ui/collapsible` | [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) |
| Tabs | `@forge-ui/tabs` | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) |
| TagsInput | `@forge-ui/tags-input` | Live region `role=status` |
| Field | `@forge-ui/field` | Label · aria-describedby · aria-invalid |
| Progress | `@forge-ui/progress` | [Progressbar](https://www.w3.org/WAI/ARIA/apg/patterns/meter/) |
| Slider | `@forge-ui/slider` | [Slider (multi-thumb)](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) |
| NumberInput | `@forge-ui/number-input` | [Spinbutton §3.21](https://www.w3.org/TR/wai-aria-1.2/#spinbutton) |

### Primitives disponibles (machine + connect — bindings framework à venir)

| Primitive | Package | WAI-ARIA |
|-----------|---------|----------|
| DatePicker | `@forge-ui/date-picker` | [Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) |
| DateRangePicker | `@forge-ui/date-range-picker` | Date Picker (dual input) |
| DateField | `@forge-ui/date-field` | Spinbutton §3.21 |
| TimePicker | `@forge-ui/time-picker` | Spinbutton §3.21 |

---

## Architecture

Inspirée de [Zag.js](https://zagjs.com) — notre propre implémentation FSM (~150 lignes, zéro dépendance runtime).

```
packages/
  core/                        # FSM engine + a11y (focus-trap, scroll-lock, aria-hidden, stack-registry)
  floating/                    # @floating-ui/dom wrapper (makeComputePositionActivity)
  primitives/
    dialog/                    # @forge-ui/dialog          — machine + connect
    alert-dialog/              # @forge-ui/alert-dialog    — machine + connect
    popover/                   # @forge-ui/popover         — machine + connect
    select/                    # @forge-ui/select          — machine + connect
    combobox/                  # @forge-ui/combobox        — machine + connect (groups, creatable)
    checkbox/                  # @forge-ui/checkbox        — machine + connect (tri-state, group)
    radio-group/               # @forge-ui/radio-group     — machine + connect
    switch/                    # @forge-ui/switch          — machine + connect
    tooltip/                   # @forge-ui/tooltip         — machine + connect (provider, skip-delay)
    hover-card/                # @forge-ui/hover-card      — machine + connect
    accordion/                 # @forge-ui/accordion       — machine + connect (single/multiple)
    collapsible/               # @forge-ui/collapsible     — machine + connect
    tabs/                      # @forge-ui/tabs            — machine + connect
    tags-input/                # @forge-ui/tags-input      — machine + connect
    field/                     # @forge-ui/field           — provider pur (pas de FSM)
    progress/                  # @forge-ui/progress        — machine + connect
    slider/                    # @forge-ui/slider          — machine + connect (multi-thumb, range)
    number-input/              # @forge-ui/number-input    — machine + connect (spinbutton, spin-repeat)
    date-picker/               # @forge-ui/date-picker     — machine + connect (calendar grid)
    date-range-picker/         # @forge-ui/date-range-picker
    date-field/                # @forge-ui/date-field
    time-picker/               # @forge-ui/time-picker
  react/                       # Bindings React 19 (compound components + hooks)
  vue/                         # Bindings Vue 3.5 (defineComponent + provide/inject)
  nuxt/                        # Module Nuxt 3 (auto-import)
apps/
  playground-react/            # Vite + React 19 (localhost:3000)
  playground-vue/              # Vite + Vue 3   (localhost:3001)
  playground-nuxt/             # Nuxt 3         (localhost:3002) — aucun import manuel
e2e/
  react/  vue/  nuxt/          # Playwright — specs par composant × framework
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
import { NumberInput, Slider, Tabs, Dialog, Select, Combobox } from '@forge-ui/react'

// NumberInput — WAI-ARIA §3.21 spinbutton
<NumberInput.Root defaultValue={50} min={0} max={100} step={1} onValueChange={console.log}>
  <NumberInput.Label>Quantité</NumberInput.Label>
  <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
  <NumberInput.Input aria-label="Quantité" />
  <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
  <NumberInput.HiddenInput name="quantity" />
</NumberInput.Root>

// Slider — multi-thumb, range support
<Slider.Root value={[20, 80]} onValueChange={console.log} min={0} max={100}>
  <Slider.Track>
    <Slider.Range />
  </Slider.Track>
  <Slider.Thumb index={0} aria-label="Minimum" />
  <Slider.Thumb index={1} aria-label="Maximum" />
</Slider.Root>

// Tabs — WAI-ARIA tablist pattern
<Tabs.Root defaultValue="react">
  <Tabs.List>
    <Tabs.Trigger value="react">React</Tabs.Trigger>
    <Tabs.Trigger value="vue">Vue</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="react">Contenu React</Tabs.Panel>
  <Tabs.Panel value="vue">Contenu Vue</Tabs.Panel>
</Tabs.Root>

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

// Select — WAI-ARIA 1.2 Select-Only Combobox
<Select.Root onValueChange={console.log}>
  <Select.Label>Framework</Select.Label>
  <Select.Trigger>
    <Select.Value>
      <Select.Placeholder>Choisir…</Select.Placeholder>
    </Select.Value>
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Item value="react">React</Select.Item>
      <Select.Item value="vue">Vue</Select.Item>
      <Select.Item value="angular" disabled>Angular</Select.Item>
    </Select.Content>
  </Select.Portal>
</Select.Root>

// Combobox — filtre client-side, multi-select, creatable, groups
<Combobox.Root onValueChange={console.log}>
  <Combobox.Label>Langage</Combobox.Label>
  <Combobox.Input />
  <Combobox.Trigger>▾</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Content>
      <Combobox.Item value="ts" label="TypeScript">
        <Combobox.ItemText>TypeScript</Combobox.ItemText>
      </Combobox.Item>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
```

### Vue

```vue
<script setup>
import { NumberInput, Slider, Tabs, Dialog, Select } from '@forge-ui/vue'
</script>

<template>
  <!-- NumberInput -->
  <NumberInput.Root :default-value="50" :min="0" :max="100" :step="1">
    <NumberInput.Label>Quantité</NumberInput.Label>
    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
    <NumberInput.Input aria-label="Quantité" />
    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    <NumberInput.HiddenInput name="quantity" />
  </NumberInput.Root>

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
  <!-- NumberInput -->
  <NumberInput.Root :default-value="50" :min="0" :max="100">
    <NumberInput.Label>Quantité</NumberInput.Label>
    <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
    <NumberInput.Input aria-label="Quantité" />
    <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
  </NumberInput.Root>

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
</template>
```

---

## Styling

Chaque élément expose des attributs `data-*` pour piloter le CSS et Tailwind :

```
data-state           "open" | "closed" | "checked" | "unchecked" | "indeterminate"
data-forge-scope     nom de la primitive  ("dialog" | "select" | "slider" | "number-input" …)
data-forge-part      anatomie de l'élément ("trigger" | "content" | "input" | "thumb" …)
data-selected        présent sur les options sélectionnées (Select, Combobox, RadioGroup)
data-highlighted     présent sur l'option courante au clavier (Select, Combobox)
data-disabled        présent sur les éléments désactivés
data-readonly        présent sur les éléments en lecture seule (NumberInput, Slider)
data-focused         présent quand le composant a le focus (NumberInput)
data-invalid         présent sur les éléments en état invalide (Switch, Field)
data-required        présent quand le champ est requis (NumberInput, Field)
data-side            "top" | "bottom" | "left" | "right" (Popover, Select, Tooltip…)
data-align           "start" | "center" | "end" (Popover, Select…)
data-orientation     "horizontal" | "vertical" (Slider, Tabs)
```

**Tailwind**

```html
<!-- Slider thumb -->
<div data-forge-part="thumb"
     class="w-5 h-5 rounded-full bg-white border-2 border-slate-900
            data-[disabled]:opacity-40 data-[disabled]:pointer-events-none" />

<!-- Select option -->
<li data-forge-part="option"
    class="px-3 py-1.5 rounded cursor-pointer
           data-[highlighted]:bg-blue-50 data-[selected]:font-semibold
           data-[disabled]:opacity-40 data-[disabled]:pointer-events-none" />

<!-- NumberInput input -->
<input data-forge-part="input"
       class="w-20 text-center border rounded
              data-[disabled]:opacity-40 data-[readonly]:cursor-default" />
```

**Animations CSS (data-state)**

```css
/* Entrée/sortie sans forceMount — watchPresence retarde le démontage */
[data-forge-scope="dialog"][data-forge-part="content"][data-state="open"] {
  animation: fade-in 150ms ease;
}
[data-forge-scope="dialog"][data-forge-part="content"][data-state="closed"] {
  animation: fade-out 150ms ease forwards;
}
```

---

## Développement

```bash
bun install

# Playgrounds
bun --filter @forge-ui/playground-react dev   # localhost:3000
bun --filter @forge-ui/playground-vue dev     # localhost:3001
bun --filter @forge-ui/playground-nuxt dev    # localhost:3002

# Tests unitaires
bun run test               # tous les packages (turbo)
bun run test:coverage      # + rapport de couverture lcov + json-summary

# E2E Playwright (nécessite les 3 serveurs dev lancés)
bun run test:e2e

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
| Nuxt (auto-import) | ✅ | ❌ | ❌ | ❌ |
| FSM partagé React+Vue | ✅ | — | ✅ (Zag) | ❌ |
| Zero runtime deps | ✅ | — | ❌ (Zag) | — |
| Select-Only Combobox WAI-ARIA 1.2 | ✅ | ✅ | ✅ | ❌ |
| Combobox groups + creatable | ✅ | ❌ | ✅ | ❌ |
| AlertDialog séparé du Dialog | ✅ | ✅ | ✅ | ❌ |
| Floating positioning intégré | ✅ | ✅ | ✅ | ❌ |
| Stack registry (dialogs imbriqués) | ✅ | ✅ | ✅ | ⚠️ |
| Slider multi-thumb / range | ✅ | ✅ | ✅ | ❌ |
| NumberInput (spinbutton WAI-ARIA) | ✅ | ❌ | ✅ | ❌ |
| Date Picker (machine) | ✅¹ | ❌ | ✅ | ❌ |

> ¹ Machine + connect disponibles ; bindings React/Vue en cours.

---

## Licence

MIT

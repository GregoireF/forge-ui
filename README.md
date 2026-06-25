# forge-ui

<!-- Dynamic badges (updated by CI) -->
[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![E2E](https://github.com/OWNER/REPO/actions/workflows/e2e.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/e2e.yml)
[![Coverage](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg?token=TOKEN)](https://codecov.io/gh/OWNER/REPO)
[![axe-core WCAG 2.1 AA](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OWNER/REPO/main/axe-badge.json)](e2e/react/a11y.spec.ts)
[![Bundle size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OWNER/REPO/main/bundle-size-badge.json)](tooling/scripts/bundle-size.ts)
<!-- Static badges -->
[![WAI-ARIA 1.2](https://img.shields.io/badge/WAI--ARIA-1.2-0057b8)](https://www.w3.org/TR/wai-aria-1.2/)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](tsconfig.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Composants headless accessibles pour **React 19** et **Vue 3**. Zéro style — vous gérez le CSS.

> **Statut : pré-release (alpha).** API en cours de stabilisation. Pas encore publié sur npm.

---

## Primitives (22 disponibles — React · Vue · Nuxt)

### Overlays & floating

| Primitive | Package | WAI-ARIA |
|---|---|---|
| Dialog | `@forge-ui/dialog` | [Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — focus trap, scroll lock, aria-hidden |
| Alert Dialog | `@forge-ui/alert-dialog` | [Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) — non-dismissible |
| Popover | `@forge-ui/popover` | Floating panel — modal ou non-modal |
| Tooltip | `@forge-ui/tooltip` | `role="tooltip"` — provider skip-delay |
| Hover Card | `@forge-ui/hover-card` | Popover déclenché au survol |

### Formulaires

| Primitive | Package | WAI-ARIA |
|---|---|---|
| Checkbox | `@forge-ui/checkbox` | `role="checkbox"` — tri-state, groupe |
| Radio Group | `@forge-ui/radio-group` | `role="radiogroup"` |
| Switch | `@forge-ui/switch` | `role="switch"` |
| Slider | `@forge-ui/slider` | `role="slider"` — multi-thumb, marks décoratifs, vertical |
| Number Input | `@forge-ui/number-input` | `role="spinbutton"` — spin-repeat, locale |
| Tags Input | `@forge-ui/tags-input` | Live region `role="status"` — delimiter, maxTags |
| Field | `@forge-ui/field` | Provider d'IDs label / description / error |

### Sélection

| Primitive | Package | WAI-ARIA |
|---|---|---|
| Select | `@forge-ui/select` | [Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/) — groupes, multi, virtual scroll |
| Combobox | `@forge-ui/combobox` | [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — async, creatable, TagsInput, virtual scroll |

### Date & Heure

| Primitive | Package | Notes |
|---|---|---|
| Date Field | `@forge-ui/date-field` | Saisie segmentée spinbutton (jour / mois / année) |
| Time Picker | `@forge-ui/time-picker` | 12 h / 24 h — secondes optionnelles |
| Date Picker | `@forge-ui/date-picker` | Calendrier pop-up — vues jour/mois/année, presets, min/max, forceMount |
| Date Range Picker | `@forge-ui/date-range-picker` | Sélection de plage deux phases — dual-calendar |

### Navigation & Layout

| Primitive | Package | WAI-ARIA |
|---|---|---|
| Accordion | `@forge-ui/accordion` | `role="region"` — single / multiple |
| Collapsible | `@forge-ui/collapsible` | Disclosure widget |
| Tabs | `@forge-ui/tabs` | `role="tablist"` — activation automatique / manuelle |
| Progress | `@forge-ui/progress` | `role="progressbar"` — déterminé / indéterminé |

---

## Architecture

Inspirée de [Zag.js](https://zagjs.com) — implémentation FSM maison (~150 lignes, zéro dépendance runtime).

```
packages/
  core/                        # FSM engine + utilitaires a11y
  floating/                    # Wrapper @floating-ui/dom
  primitives/                  # 22 packages machine + connect
  react/                       # Bindings React 19 (compound components + hooks)
  vue/                         # Bindings Vue 3.5 (defineComponent + provide/inject)
  nuxt/                        # Module Nuxt 4 (auto-import)
apps/
  playground-react/            # Vite + React 19  (localhost:3000)
  playground-vue/              # Vite + Vue 3     (localhost:3001)
  playground-nuxt/             # Nuxt 4           (localhost:3002)
e2e/                           # Playwright — 3 browsers × 3 playgrounds
```

### Pattern machine → connect → binding

```
createXMachine(options)              # FSM pure, sans DOM, testable unitairement
        ↓
connectX(snapshot, send, machine)   # prop-getters framework-agnostiques
        ↓
useX() + X.Root / X.Trigger / …     # Binding React ou Vue mince
```

---

## Quick start

### React

```bash
npm install @forge-ui/react
```

```tsx
import { Dialog, Select, Combobox, Slider, DatePicker } from '@forge-ui/react'

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
  <Select.Trigger><Select.Value><Select.Placeholder>Choisir…</Select.Placeholder></Select.Value></Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Item value="react"><Select.ItemText>React</Select.ItemText></Select.Item>
      <Select.Item value="vue"><Select.ItemText>Vue</Select.ItemText></Select.Item>
    </Select.Content>
  </Select.Portal>
</Select.Root>

// Combobox — async, multi, creatable, TagsInput
<Combobox.Root multiple>
  <Combobox.Label>Langages</Combobox.Label>
  <Combobox.TagsInput>
    {selectedValues.map(v => (
      <Combobox.Tag key={v} value={v}>
        {labels[v]}
        <Combobox.TagDelete value={v}>✕</Combobox.TagDelete>
      </Combobox.Tag>
    ))}
  </Combobox.TagsInput>
  <Combobox.Input />
  <Combobox.Portal>
    <Combobox.Content>
      <Combobox.Item value="ts" label="TypeScript"><Combobox.ItemText>TypeScript</Combobox.ItemText></Combobox.Item>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>

// Slider — range (2 thumbs) + marks décoratifs
<Slider.Root value={[20, 80]} onValueChange={setRange} min={0} max={100} marks={[{value:0},{value:50,label:"50"},{value:100}]}>
  <Slider.Track><Slider.Range /></Slider.Track>
  <Slider.Thumb index={0} aria-label="Min" />
  <Slider.Thumb index={1} aria-label="Max" />
  <Slider.MarkerGroup>
    {marks.map(m => <Slider.Marker key={m.value} value={m.value}>{m.label}</Slider.Marker>)}
  </Slider.MarkerGroup>
</Slider.Root>

// DatePicker — min/max, forceMount, vues jour/mois/année
<DatePicker.Root min={{year:2024,month:1,day:1}} max={{year:2025,month:12,day:31}} onValueChange={setDate}>
  <DatePicker.Trigger>Choisir une date</DatePicker.Trigger>
  <DatePicker.Portal>
    <DatePicker.Content forceMount>
      <DatePicker.CalendarHeader />
      <DatePicker.CalendarGrid>
        <DatePicker.CalendarRow weekIndex={-1}>
          {Array.from({length:7},(_,i) => <DatePicker.WeekdayHeader key={i} dayIndex={i} />)}
        </DatePicker.CalendarRow>
      </DatePicker.CalendarGrid>
    </DatePicker.Content>
  </DatePicker.Portal>
</DatePicker.Root>
```

### Vue

```bash
npm install @forge-ui/vue
```

```vue
<script setup>
import { Dialog, Select, Combobox, Slider, DatePicker } from '@forge-ui/vue'
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
    <Select.Trigger><Select.Value placeholder="Choisir…" /></Select.Trigger>
    <Select.Portal>
      <Select.Content>
        <Select.Item value="react">React</Select.Item>
        <Select.Item value="vue">Vue</Select.Item>
      </Select.Content>
    </Select.Portal>
  </Select.Root>

  <!-- Slider avec marks -->
  <Slider.Root :value="50" :min="0" :max="100" :marks="[{value:0},{value:50,label:'50'},{value:100}]">
    <Slider.Track><Slider.Range /></Slider.Track>
    <Slider.Thumb aria-label="Valeur" />
    <Slider.MarkerGroup>
      <Slider.Marker :value="0" />
      <Slider.Marker :value="50">50</Slider.Marker>
      <Slider.Marker :value="100" />
    </Slider.MarkerGroup>
  </Slider.Root>

  <!-- DatePicker -->
  <DatePicker.Root :min="{year:2024,month:1,day:1}" @update:value="setDate">
    <DatePicker.Trigger>Choisir une date</DatePicker.Trigger>
    <DatePicker.Portal>
      <DatePicker.Content>
        <DatePicker.CalendarHeader />
        <DatePicker.CalendarGrid>
          <DatePicker.CalendarRow :week-index="-1">
            <DatePicker.WeekdayHeader v-for="i in 7" :key="i" :day-index="i-1" />
          </DatePicker.CalendarRow>
        </DatePicker.CalendarGrid>
      </DatePicker.Content>
    </DatePicker.Portal>
  </DatePicker.Root>
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
<!-- Aucun import — tout est auto-importé -->
<template>
  <Dialog.Root>
    <Dialog.Trigger>Ouvrir</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Content>
        <Dialog.Title>Titre</Dialog.Title>
        <Dialog.Close>Fermer</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
```

---

## Patterns clés

### `asChild` — rendu polymorphe

```tsx
// Merge les props forge-ui sur votre propre élément
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
| `data-forge-scope` | `"dialog"` / `"select"` / `"slider"` / … | Tous |
| `data-forge-part` | `"trigger"` / `"content"` / `"item"` / `"thumb"` / … | Tous |
| `data-disabled` | `""` (présent) | Éléments désactivés |
| `data-selected` | `""` (présent) | Options sélectionnées |
| `data-highlighted` | `""` (présent) | Option active au clavier |
| `data-in-range` | `""` (présent) | Marks Slider dans la plage |
| `data-orientation` | `"horizontal"` / `"vertical"` | Slider, Tabs |
| `data-side` | `"top"` / `"bottom"` / `"left"` / `"right"` | Popover, Select, Tooltip |

```html
<!-- Slider thumb -->
<div data-forge-part="thumb"
     class="w-5 h-5 rounded-full bg-white border-2 border-slate-900
            data-[disabled]:opacity-40 data-[active]:scale-110" />

<!-- Select option -->
<li data-forge-part="option"
    class="px-3 py-1.5 rounded cursor-pointer
           data-[highlighted]:bg-blue-50 data-[selected]:font-semibold
           data-[disabled]:opacity-40 data-[disabled]:pointer-events-none" />
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
bun run test             # unitaires (tous packages)
bun run test:coverage    # + rapport de couverture
bun run test:e2e         # Playwright 3 browsers

# Qualité
bun run build
bun run typecheck
bun run lint
```

---

## Comparatif concurrents

| | forge-ui | Radix UI | Ark UI | Headless UI | Reka UI |
|---|---|---|---|---|---|
| React | ✅ | ✅ | ✅ | ✅ | ❌ |
| Vue | ✅ | ❌ | ✅ | ✅ | ✅ |
| Nuxt auto-import | ✅ | ❌ | ❌ | ❌ | ❌ |
| FSM machine exposée | ✅ | ❌ | ✅ (Zag) | ❌ | ❌ |
| Date Picker complet | ✅ | ❌ | ✅ | ❌ | ✅ |
| Combobox creatable | ✅ | ❌ | ✅ | ❌ | ✅ |
| Slider marks | ✅ | ❌ | ✅ | ❌ | ✅ |
| Virtual scroll Select | ✅ | ❌ | ✅ | ❌ | ❌ |
| TagsInput natif | ✅ | ❌ | ✅ | ❌ | ✅ |

---

## Licence

MIT

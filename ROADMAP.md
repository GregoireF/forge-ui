# forge-ui — ROADMAP

Headless, framework-agnostic UI primitives. Zero published deps.  
Stack: Bun · TypeScript · Biome · Lefthook · Turborepo · Vitest · Playwright

---

## ARCHITECTURE — 3-tier layers

```
@forge-ui/core     — infra pure (FSM, focus, scroll-lock, aria-hidden, ids, SSR utils)
@forge-ui/<prim>   — machine + connect (framework-agnostic; dépend de core)
@forge-ui/react    — thin binding (useMachine + compound components; dépend des primitives)
@forge-ui/vue      — thin binding (useMachine + defineComponent; dépend des primitives)
@forge-ui/nuxt     — module Nuxt 3 auto-import (peerDep de vue)
```

Règle : chaque couche ne connaît pas la couche supérieure. Core n'a aucune notion de Dialog. Les bindings framework ne contiennent aucune logique de comportement.

Les activities (pattern Zag.js) sont des effets longs liés à un état — démarrent à l'entrée, se nettoient à la sortie. Focus, scroll-lock, aria-hidden, keyboard, interact-outside, spin-repeat, compute-position sont tous gérés en activities dans la machine.

---

## PHASE 0 — Fondations ✅

- [x] Monorepo scaffold (Bun workspaces, Biome 2, Lefthook, Turbo 3)
- [x] Tooling: tsconfig partagés (base / dom / react / vue)
- [x] Script de build partagé (`bun build` + `tsc -b --force`, composite projects)
- [x] `@forge-ui/core` — FSM engine (`createMachine`) zéro dep
- [x] `@forge-ui/react` — `useMachine` + `useDialog` (focus trap, restore)
- [x] `@forge-ui/vue` — `useMachine` + `useDialog` (focus trap, restore)
- [x] Tests Vitest — 153 tests initiaux (core, dialog, react, vue, nuxt)
- [x] E2E Playwright centralisé (react/ + vue/ + nuxt/)
- [x] Playgrounds Vite React (3000) + Vue (3001) + Nuxt (3002)

---

## PHASE 0.5 — Refacto architecture 3-tier ✅

- [x] Suppression `@forge-ui/elements` (Web Components déprioritisés)
- [x] `@forge-ui/core` — retiré Dialog machine; ajout activities, contexte mutable, `setContext` + `update` exposés
- [x] `@forge-ui/core` utils — `lockScroll`, `interactOutside`, `hideOthers`, `trapFocus`, `focusFirst`, SSR guards
- [x] `packages/primitives/dialog/` — nouveau package `@forge-ui/dialog` (machine + connect, 5 activities)
- [x] Activities dialog : `manageFocus`, `trapKeyboard`, `hideBackground`, `lockBodyScroll`, `watchOutside`
- [x] Callbacks `onOpen`/`onClose`/`onOpenChange` dans la machine (pas dans les bindings)
- [x] `@forge-ui/react` thin binding — `useDialog` délègue tout à `connectDialog`/`createDialogMachine`
- [x] `@forge-ui/vue` thin binding — idem, plus de `watchPostEffect`/`hideOthers` dans Vue
- [x] `machine.update(partial)` — `setContext` + `emit()` pour la sync des props contrôlées (distinct de `setContext` interne)

---

## PHASE 1 — Intégration Tailwind / CSS ✅

- [x] `data-state` sur chaque élément (`open` | `closed` | `checked` | `indeterminate`…) — foundation Tailwind
- [x] `data-forge-scope` + `data-forge-part` sur chaque élément (anatomy identifier, équiv. `data-slot` shadcn)
- [x] `data-disabled`, `data-focused`, `data-readonly`, `data-invalid`, `data-required`
- [x] `data-orientation`, `data-side`, `data-align`, `data-selected`, `data-highlighted`
- [x] `DialogPortal` React — `createPortal` SSR-safe (gate `useState/useEffect`)
- [x] `DialogPortal` Vue — `<Teleport>` SSR-safe (gate `onMounted/isMounted`)
- [x] Vue `useId()` (3.5+) — IDs SSR-stables, remplace le compteur module-level
- [x] Système `watchPresence` — retarde le démontage jusqu'à `animationend` (animations de sortie CSS-only)
- [x] Pattern `forceMount` sur tous les overlays (Dialog, AlertDialog, Popover, Tooltip, HoverCard, Select, Combobox)

---

## PHASE 2 — Compound components ✅

### Dialog compound ✅
- [x] `Dialog.Root`, `Trigger`, `Close`, `Portal`, `Overlay`, `Content`, `Title`, `Description`
- [x] `AlertDialog.Root`, `Trigger`, `Cancel`, `Action` (Escape + outside-click bloqués)
- [x] Pattern `asChild` (React `cloneElement` via Slot / Vue `cloneVNode` via Slot)
- [x] Mode contrôlé (`open` + `onOpenChange`) + `v-model:open` Vue
- [x] Stack registry — dialogs imbriqués, seule la couche supérieure capture Escape
- [x] `@forge-ui/nuxt` — module Nuxt 3, auto-import composables + composants

### Primitives flottantes ✅
- [x] **Popover** — `Popover.Root/Trigger/Portal/Content/Title/Description/Arrow/Close`
- [x] **Tooltip** — `Tooltip.Provider/Root/Trigger/Portal/Content/Anchor` + skip-delay, interactive mode
- [x] **HoverCard** — `HoverCard.Root/Trigger/Portal/Content/Arrow` + openDelay/closeDelay

### Primitives de formulaire ✅
- [x] **Select** — `Select.Root/Label/Trigger/Value/Placeholder/Portal/Content/Item/Separator/Group/GroupLabel`
- [x] **Combobox** — filtre client-side, multi-select, groups, creatable (`onCreateOption`), `ClearTrigger`, `CreateOption`, `ItemIndicator`
- [x] **Checkbox** — tri-state (unchecked / indeterminate / checked), `Checkbox.Group` + `GroupAll` select-all natif
- [x] **RadioGroup** — `RadioGroup.Root/Item/Radio/Label/HiddenInput`
- [x] **Switch** — `Switch.Root/Control/Thumb/Label`, `aria-checked`, mode invalide
- [x] **Field** — `Field.Root/Label/Control/RequiredIndicator/Description/Error/Group/GroupLabel`
- [x] **TagsInput** — `TagsInput.Root/Tag/TagDelete/Input`, live region `role=status`
- [x] **NumberInput** — `NumberInput.Root/Label/Control/Input/IncrementTrigger/DecrementTrigger/HiddenInput`
  - WAI-ARIA §3.21 spinbutton — `role=spinbutton`, `aria-valuenow/min/max/valuetext`
  - Clavier : ArrowUp/Down (step), PageUp/Down (largeStep = step×10), Home/End
  - Spin-repeat sur pointer hold (rAF, délai 300ms, répétition 50ms)
  - Mode édition (FOCUS → nombre brut ; BLUR → parse + clamp + `Intl.NumberFormat`)
  - `fractionDigits`, `locale`, `allowEmpty`, contrôlé (`value` + `onValueChange`)

### Primitives de layout ✅
- [x] **Accordion** — single/multiple, collapsible, `Accordion.Root/Item/Header/Trigger/Content`
- [x] **Collapsible** — `Collapsible.Root/Trigger/Content`
- [x] **Tabs** — `Tabs.Root/List/Trigger/Panel`, activation au focus ou au clic, keyboard ArrowLeft/Right

### Primitives de feedback ✅
- [x] **Progress** — `Progress.Root/Label/ValueText/Track/Fill`, déterminé et indéterminé (`aria-busy`)
- [x] **Slider** — `Slider.Root/Track/Range/Thumb/HiddenInput`
  - Multi-thumb (range `value: number[]`)
  - WAI-ARIA §3.23 — `role=slider`, `aria-valuenow/min/max/valuetext`, `aria-orientation`
  - Drag (pointer capture) + clavier ArrowLeft/Right/Up/Down/PageUp/PageDown/Home/End

---

## PHASE 3 — CI/CD + Publish

- [x] GitHub Actions : CI (lint + typecheck + test + build) on PR
- [x] Commitlint (Conventional Commits + emoji gitmoji obligatoire) + Lefthook hook commit-msg
- [x] Changesets CLI configuré
- [x] `bun run prepare` → lefthook install auto
- [x] GitHub repository créé + premier push
- [ ] BundleMon : bundle size check on PR
- [ ] Release workflow : OIDC npm publish on merge main
- [ ] Changesets workaround script (Bun `workspace:*` compat)

---

## PHASE 4 — Documentation

- [ ] Astro Starlight setup (`apps/docs/`)
- [ ] Deploy GitHub Pages (gratuit, static)
- [ ] Pages par composant : usage, ARIA, exemples React + Vue côte à côte
- [ ] Pagefind search (built-in Starlight, zéro coût)

---

## PHASE 5 — Primitives avancées

- [x] **Date Picker** — machine + connect + React + Vue + Nuxt ✅ complet
- [x] **Date Range Picker** — machine + connect + React + Vue + Nuxt ✅ complet
- [x] **Date Field** — machine + connect + React + Vue + Nuxt ✅ complet
- [x] **Time Picker** — machine + connect + React + Vue + Nuxt ✅ complet
- [x] **Number Input** — machine + connect + React + Vue + Nuxt ✅ complet
- [ ] Color Picker
- [ ] File Upload (drag & drop)
- [ ] Tree View
- [ ] Data Table (sort, filter, pagination)
- [ ] Toast / Notification (live region)
- [ ] Context Menu / Dropdown Menu (sub-menus)

---

## Couverture de tests (état actuel)

| Package | Tests unitaires | E2E specs |
|---------|----------------|-----------|
| `@forge-ui/core` | ~80 | — |
| `@forge-ui/primitives/*` | ~500+ | — |
| `@forge-ui/react` | ~440 | 28+ specs × 3 browsers |
| `@forge-ui/vue` | ~440 | 28+ specs × 3 browsers |
| `@forge-ui/nuxt` | ~20 | 28+ specs × 3 browsers |
| **Total** | **~1500+** | **~250+ specs** |

Couverture V8 : 100% branch coverage sur les 22 primitives avec bindings complets.

---

## Known limitations / tech debt

| Item | Impact | Priorité |
|---|---|---|
| Changesets + Bun `workspace:*` non résolu | Publish manuel | Moyen |
| Firefox / WebKit Playwright browsers à installer en CI | E2E partielle (Chromium only en local) | Bas |
| DatePicker portal React — reuse DialogPortal sans teleport Vue natif | Légère incohérence DX React/Vue | Bas |
| Pas de virtualizer intégré | Select/Combobox sans virtual scroll | Moyen |

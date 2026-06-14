# forge-ui — ROADMAP

Headless, framework-agnostic UI primitives. Zero published deps.  
Stack: Bun · TypeScript · Biome · Lefthook · Turborepo · Vitest · Playwright

---

## ARCHITECTURE — 3-tier layers

```
@forge-ui/core     — infra pure (FSM, focus, scroll-lock, aria-hidden, ids, SSR utils)
@forge-ui/dialog   — machine + connect (framework-agnostic; dépend de core)
@forge-ui/react    — thin binding (useMachine + spread props; dépend de dialog)
@forge-ui/vue      — thin binding (useMachine + spread props; dépend de dialog)
@forge-ui/nuxt     — module Nuxt 4 auto-import (peerDep de vue)
```

Règle : chaque couche ne connaît pas la couche supérieure. Core n'a aucune notion de Dialog. Référence : Zag.js (`@zag-js/core` / `@zag-js/dialog` / `@zag-js/react`).

Les activities (pattern Zag.js) sont des effets longs liés à un état — démarrent à l'entrée, se nettoient à la sortie. Focus, scroll-lock, aria-hidden, keyboard, interact-outside sont tous gérés en activities dans la machine.

---

## PHASE 0 — Fondations ✅

- [x] Monorepo scaffold (Bun workspaces, Biome 2, Lefthook, Turbo 3)
- [x] Tooling: tsconfig partagés (base / dom / react / vue)
- [x] Script de build partagé (`bun build` + `tsc -b --force`, composite projects)
- [x] `@forge-ui/core` — FSM engine (`createMachine`) zéro dep
- [x] `@forge-ui/react` — `useMachine` + `useDialog` (focus trap, restore)
- [x] `@forge-ui/vue` — `useMachine` + `useDialog` (focus trap, restore)
- [x] Tests Vitest — 153 tests (core 43, dialog 33, react 35, vue 29, nuxt 13)
- [x] E2E Playwright centralisé (react/ + vue/ — 40 specs)
- [x] Playgrounds Vite React (port 3000) + Vue (port 3001)

---

## PHASE 0.5 — Refacto architecture 3-tier ✅

- [x] Suppression `@forge-ui/elements` (Web Components déprioritisés)
- [x] `@forge-ui/core` — retiré Dialog machine; ajout activities, contexte mutable, `setContext` exposé
- [x] `@forge-ui/core` utils — `lockScroll`, `interactOutside`, `hideOthers`, `trapFocus`, `focusFirst`, SSR guards
- [x] `packages/primitives/dialog/` — nouveau package `@forge-ui/dialog` (machine + connect, 5 activities)
- [x] Activities dialog : `manageFocus`, `trapKeyboard`, `hideBackground`, `lockBodyScroll`, `watchOutside`
- [x] Callbacks `onOpen`/`onClose`/`onOpenChange` dans la machine (pas dans les bindings)
- [x] `@forge-ui/react` thin binding — `useDialog` délègue tout à `connectDialog`/`createDialogMachine`
- [x] `@forge-ui/vue` thin binding — idem, plus de `watchPostEffect`/`hideOthers` dans Vue
- [x] 153 tests verts (core 43, dialog 33, react 35, vue 29, nuxt 13)

---

## PHASE 1 — Intégration Tailwind / CSS ✅

> Justification : Radix UI, Ark UI et shadcn/ui reposent tous sur `data-state` pour
> piloter les transitions CSS et Tailwind (`data-[state=open]:block`). Sans cela,
> les consumers doivent gérer l'état manuellement — on ne peut pas prétendre rivaliser.

- [x] `data-state` sur chaque élément dialog (`open` | `closed`) — foundation Tailwind
- [x] `data-forge-part` sur chaque élément (anatomy identifier, équiv. `data-slot` shadcn)
- [x] `DialogPortal` React — `createPortal` SSR-safe (gate `useState/useEffect`)
- [x] `DialogPortal` Vue — `<Teleport>` SSR-safe (gate `onMounted/isMounted`)
- [x] Vue `useId()` (3.5+) — IDs SSR-stables, remplace le compteur module-level
- [x] Tests data-state + portal mis à jour (unit + E2E)

---

## PHASE 2 — Compound components

> Justification : Radix, Ark, shadcn exposent tous `Dialog.Root / Dialog.Trigger /
> Dialog.Content`. C'est le pattern attendu par les consumers React/Vue modernes.
> Un hook-only API n'est pas suffisant pour une lib sérieuse.

### Dialog compound ✅

- [x] `Dialog.Root` (provider de contexte inject/provide Vue, createContext React)
- [x] `Dialog.Trigger`, `Dialog.Close`
- [x] `Dialog.Portal` (wraps `DialogPortal`)
- [x] `Dialog.Overlay` / `Dialog.Backdrop`
- [x] `Dialog.Content`, `Dialog.Title`, `Dialog.Description`
- [x] Pattern `asChild` (React `cloneElement` via Slot / Vue `cloneVNode` via Slot)
- [x] `forceMount` prop pour animations de sortie (Framer Motion compat)
- [x] Mode contrôlé (`open` + `onOpenChange`) + `v-model:open` Vue
- [x] `@forge-ui/nuxt` — module Nuxt 4, auto-import composables + composants
- [x] Tests compound complets + E2E (Tab trap, aria-hidden, focus, portal)

### Autres primitives

- [ ] Toggle / Switch (`createToggleMachine`)
- [ ] Checkbox (tri-state, indeterminate)
- [ ] Radio Group
- [ ] Accordion (single / multiple)
- [ ] Tabs (ARIA tablist pattern)
- [ ] Tooltip (hover + focus, positioning)
- [ ] Dropdown Menu (keyboard nav, sub-menus)
- [ ] Popover (anchor positioning)
- [ ] Select (custom, WAI-ARIA listbox)
- [ ] Combobox (WAI-ARIA combobox pattern)
- [ ] Toast / Notification
- [ ] Context Menu

---

## PHASE 3 — CI/CD + Publish

- [x] GitHub Actions : CI (lint + typecheck + test + build) on PR
- [x] Commitlint (Conventional Commits) + Lefthook hook commit-msg
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

- [ ] Date Picker (WAI-ARIA calendar grid)
- [ ] Time Picker
- [ ] Number Input (stepper)
- [ ] Color Picker
- [ ] File Upload (drag & drop)
- [ ] Tree View
- [ ] Data Table (sort, filter, pagination)

---

## Known limitations / tech debt

| Item | Impact | Priorité |
|---|---|---|
| Changesets + Bun `workspace:*` non résolu | Publish manuel | Moyen |
| Firefox / WebKit Playwright browsers à installer en CI | E2E partielle (Chromium only en local) | Bas |

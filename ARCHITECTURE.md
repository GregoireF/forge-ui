# Architecture de forge-ui

Ce document explique les choix d'architecture de forge-ui, le flux de données entre couches, et comment ajouter une nouvelle primitive. Il est destiné aux contributeurs qui veulent comprendre le projet en profondeur avant de l'étendre.

---

## Vue d'ensemble — 3 couches

```
@forge-ui/core              moteur FSM + utilitaires a11y
       ↓
@forge-ui/<primitive>       machine + connect (agnostique framework)
       ↓
@forge-ui/react             binding React 19
@forge-ui/vue               binding Vue 3.5
@forge-ui/nuxt              module Nuxt 3 (re-exporte @forge-ui/vue)
```

**Règle fondamentale** : chaque couche ne connaît que la couche immédiatement inférieure. `@forge-ui/core` n'a aucune notion de Dialog. `@forge-ui/dialog` n'a aucune notion de React. Les bindings framework ne contiennent aucune logique de comportement — uniquement de la "plomberie réactive".

---

## Packages

| Package | Rôle |
|---------|------|
| `@forge-ui/core` | Machine FSM, activités réutilisables, utilitaires a11y, `machine.update()` |
| `@forge-ui/floating` | Infrastructure positionnement floating-ui (pas une primitive) |
| `@forge-ui/dialog` | Primitive Dialog + AlertDialog |
| `@forge-ui/popover` | Primitive Popover |
| `@forge-ui/select` | Primitive Select (Select-Only Combobox WAI-ARIA 1.2) |
| `@forge-ui/combobox` | Primitive Combobox (éditable, groups, creatable) |
| `@forge-ui/checkbox` | Primitive Checkbox (tri-state) + CheckboxGroup |
| `@forge-ui/radio-group` | Primitive RadioGroup |
| `@forge-ui/switch` | Primitive Switch |
| `@forge-ui/tooltip` | Primitive Tooltip + Provider (skip-delay, interactive) |
| `@forge-ui/hover-card` | Primitive HoverCard (popover non-modal au survol) |
| `@forge-ui/accordion` | Primitive Accordion (single/multiple/collapsible) |
| `@forge-ui/collapsible` | Primitive Collapsible |
| `@forge-ui/tabs` | Primitive Tabs |
| `@forge-ui/tags-input` | Primitive TagsInput (live region) |
| `@forge-ui/field` | Contexte form field sans FSM — provider pur |
| `@forge-ui/progress` | Primitive Progress (déterminé + indéterminé) |
| `@forge-ui/slider` | Primitive Slider (multi-thumb, range, drag + clavier) |
| `@forge-ui/number-input` | Primitive NumberInput (spinbutton WAI-ARIA §3.21, spin-repeat) |
| `@forge-ui/date-picker` | Primitive DatePicker (calendrier grille, localisation) |
| `@forge-ui/date-range-picker` | Primitive DateRangePicker (dual input, range selection) |
| `@forge-ui/date-field` | Primitive DateField (spinbutton segmenté) |
| `@forge-ui/time-picker` | Primitive TimePicker (spinbutton heures/minutes/secondes) |
| `@forge-ui/react` | Bindings React pour toutes les primitives (sauf date/time à venir) |
| `@forge-ui/vue` | Bindings Vue pour toutes les primitives (sauf date/time à venir) |
| `@forge-ui/nuxt` | Module Nuxt — auto-imports de @forge-ui/vue |

---

## Le pattern Machine → Connect → Binding

C'est le cœur de l'architecture. Chaque primitive suit exactement ce flux.

### 1. La machine (`<name>.machine.ts`)

La machine FSM décrit **tous les états et transitions possibles**. Elle ne touche jamais le DOM, ne reçoit jamais de props framework.

```ts
// packages/primitives/dialog/src/dialog.machine.ts
export function createDialogMachine(options: CreateDialogMachineOptions) {
  return createMachine<DialogContext, DialogState, DialogEvent>({
    id: `forge-dialog:${options.id}`,
    context: { id, open: false, modal: true, contentEl: null, ... },
    initial: "closed",
    states: {
      closed: { on: { OPEN: { target: "open" } } },
      open: {
        activities: ["registerLayer", "manageFocus", "trapKeyboard", ...],
        on: { CLOSE: { target: "closed" }, ESCAPE_KEY: { target: "closed" } }
      },
    },
    activities: { registerLayer, manageFocus, trapKeyboard, ... },
  });
}
```

**Ce que la machine contient** : context typé, états, transitions, activités, actions (callbacks).

**Ce que la machine ne contient pas** : refs DOM directes (elle stocke `contentEl: HTMLElement | null` dans le context, mais c'est le connect qui la remplit), props JSX/Vue, logique de rendu.

### 2. Le connect (`<name>.connect.ts`)

Le connect prend un **snapshot de la machine** et **produit des prop-getters** — des objets d'attributs HTML/ARIA prêts à être étalés sur des éléments DOM.

```ts
// packages/primitives/dialog/src/dialog.connect.ts
export function connectDialog(
  snapshot: MachineSnapshot<DialogContext, DialogState>,
  send: (event: string) => void,
  machine: MachineInstance<...>,
) {
  const { context } = snapshot;

  return {
    isOpen: snapshot.matches("open"),

    getTriggerProps() {
      return {
        id: context.triggerId,
        "aria-haspopup": "dialog" as const,
        "aria-expanded": snapshot.matches("open"),
        onClick: () => send("TOGGLE"),
      };
    },

    getContentProps() {
      return {
        id: context.contentId,
        role: context.role,
        "aria-modal": context.modal,
        ref: (el: HTMLElement | null) => {
          machine.setContext({ contentEl: el });
          updateLayerContentEl(context.id, el);
        },
      };
    },
    // ...
  };
}
```

**Ce que le connect produit** : objets de props purs (id, aria-*, data-*, event handlers, ref callback). Jamais d'éléments JSX/Vue.

**Le ref callback** : le connect expose un `ref` callback sur `getContentProps()` et `getTriggerProps()` pour que le binding puisse alimenter la machine avec les éléments DOM réels (`contentEl`, `triggerEl`). La machine ne sait pas comment obtenir ces refs — c'est le contrat avec le binding.

### 3. Le binding (`packages/react/` ou `packages/vue/`)

Le binding connecte la machine FSM à un système de rendu framework.

```ts
// packages/react/src/components/dialog/use-dialog.ts
export function useDialog(options: UseDialogOptions = {}): DialogApi {
  const machine = useMemo(() => createDialogMachine({ id: generateId(), ...options }), []);
  const snapshot = useSyncExternalStore(machine.subscribe, machine.getSnapshot);
  const send = useCallback((type: string) => machine.send(type), [machine]);

  // biome-ignore: machine is stable
  useLayoutEffect(() => { machine.start(); return () => machine.stop(); }, []);

  return connectDialog(snapshot, send, machine);
}
```

```tsx
// packages/react/src/components/dialog/Dialog.tsx
function Content({ children, ...rest }: DialogContentProps) {
  const api = useCtx();
  const { isPresent, presenceRef } = usePresence(api.isOpen);

  if (!isPresent) return null;

  const contentProps = api.getContentProps();
  return (
    <div
      {...contentProps}
      {...(!api.isOpen && { "aria-hidden": true, style: { pointerEvents: "none" } })}
      {...rest}
      ref={mergeRefs(contentProps.ref, presenceRef)}
    >
      {children}
    </div>
  );
}
```

**Ce que le binding fait** :
- Instancie et pilote la machine (start/stop dans useEffect/onMounted)
- Abonne le composant aux changements de snapshot (useSyncExternalStore, watch)
- Intègre Presence pour les animations de sortie
- Orchestre les compound parts via Context React/Vue
- Synchronise les props contrôlées via `machine.update(partial)` (voir ci-dessous)

**Ce que le binding ne fait pas** : aucune logique de comportement. Si un comportement manque, il faut l'ajouter dans la machine et exposer via le connect.

---

## machine.setContext vs machine.update

Deux méthodes sur `MachineInstance` pour modifier le context, avec des sémantiques différentes :

```ts
/** Modifie le context en place SANS notifier les subscribers. Usage : refs DOM internes. */
machine.setContext({ contentEl: el });

/** Modifie le context ET notifie les subscribers. Usage : sync props contrôlées. */
machine.update({ value: props.value });
```

`setContext` est utilisé par les ref callbacks du connect (remplir `contentEl`, `triggerEl`, etc.) — des mutations DOM qui ne doivent pas déclencher de re-render.

`machine.update` est utilisé par les bindings framework pour synchroniser les props contrôlées (React `useLayoutEffect`, Vue `watch` sur `props.*`) — ces mutations DOIVENT déclencher un re-render pour que le snapshot reflète la nouvelle valeur.

---

## Le pattern Activité

Les activités sont des **effets de bord avec nettoyage** qui s'exécutent tant qu'un état est actif.

```ts
// Signature : (ctx, { send, notify }) => cleanup | void
export function makeKeyboardActivity<TContext extends object>(
  opts: KeyboardActivityOptions<TContext>,
): ActivityFn<TContext> {
  return (ctx, { send }) => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape" && isTopLayer(opts.getId(ctx))) {
        send(opts.sendEscape);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  };
}
```

**Activités disponibles dans `@forge-ui/core`** :

| Activité | Rôle |
|----------|------|
| `makeLayerActivity` | Enregistre l'id dans le stack registry. **Doit être première.** |
| `makeKeyboardActivity` | Tab (trap focus) + Escape (top layer uniquement) |
| `makeWatchOutsideActivity` | Pointer/focus outside, top layer uniquement |
| `makeHideBackgroundActivity` | `aria-hidden` sur tout sauf les couches ouvertes |
| `makeLockScrollActivity` | Scroll-lock avec scrollbar-gutter + iOS fix |
| `makeFocusActivity` | Focus management open/close avec callbacks preventable |
| `makeComputePositionActivity` | Positionnement floating-ui (dans `@forge-ui/floating`) |

**Activité spin-repeat (NumberInput)** — activité locale, non partagée :

```ts
// Démarre sur SPIN_START_UP/DOWN ; s'arrête sur SPIN_STOP
function makeSpinActivity(direction: "up" | "down"): ActivityFn<NumberInputContext> {
  return (ctx, { send }) => {
    let rafId: number;
    let startTime: number | null = null;
    const DELAY = 300;   // délai avant répétition (ms)
    const INTERVAL = 50; // intervalle de répétition (ms)

    function tick(now: number) {
      if (startTime === null) startTime = now;
      if (now - startTime > DELAY) {
        send({ type: direction === "up" ? "INCREMENT" : "DECREMENT" });
        startTime = now - DELAY - INTERVAL; // répétition immédiate
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  };
}
```

**Ordre obligatoire** : `makeLayerActivity` TOUJOURS en premier dans `activities[]`. Les autres activités lisent le registry au moment de l'événement (pas au montage), donc l'ordre relatif entre elles importe peu — sauf `registerLayer` qui doit pousser avant que `hideBackground` lise.

---

## Stack Registry

Le registry est un singleton module-level qui track toutes les couches flottantes ouvertes (Dialogs, Popovers, Tooltips...).

```ts
// packages/core/src/utils/stack-registry.ts
const layers = new Map<string, { contentEl: HTMLElement | null }>();

pushLayer(id, contentEl)     // appelé par makeLayerActivity au setup
popLayer(id)                 // appelé par makeLayerActivity au cleanup
isTopLayer(id)               // true si id est le dernier inséré dans la Map
getLayerContentEls()         // tous les contentEl — passés à hideOthers()
updateLayerContentEl(id, el) // mis à jour par le ref callback du connect
clearRegistry()              // à appeler dans afterEach des tests
```

**Pourquoi singleton ?** Dialog → Popover → Dialog imbriqués doivent tous partager la même pile. Un registry par instance est impossible.

**isTopLayer() au moment de l'événement** : l'activité `makeKeyboardActivity` vérifie `isTopLayer()` dans le handler, pas au setup. Ça permet aux couches inférieures de se "réveiller" automatiquement quand la couche supérieure se ferme.

**Dans les tests** : appeler `clearRegistry()` dans `afterEach` pour éviter les fuites entre tests.

---

## Système de Présence (animations de sortie)

Le problème : quand `open` passe à `false`, on veut retarder le démontage jusqu'à ce que l'animation CSS de sortie se termine.

```ts
// packages/core/src/utils/presence.ts
export function watchPresence(
  getEl: () => HTMLElement | null,
  open: boolean,
  options: { onMount: () => void; onUnmount: () => void; fallbackMs?: number },
): () => void
```

**Algorithme** :
1. `open = true` → `onMount()` immédiat
2. `open = false` → écoute `animationend` + `transitionend` sur l'élément → `onUnmount()` à la fin
3. Fallback : si aucun événement animation en 1s → `onUnmount()` quand même
4. Pendant la sortie (`machine=closed, isPresent=true`) : `aria-hidden: true` + `pointerEvents: none` pour garder l'élément inerte

**Bindings** :
- React : `usePresence(open: boolean)` → `{ isPresent: boolean, presenceRef: RefCallback }`
- Vue : `usePresence(open: Ref<boolean>)` → `{ isPresent: Ref<boolean>, presenceRef: Ref<HTMLElement | null> }`

Utilisation :
```tsx
// React — dans Content/Overlay
const { isPresent, presenceRef } = usePresence(api.isOpen);
if (!isPresent) return null;
// ref={mergeRefs(contentProps.ref, presenceRef)} sur l'élément DOM
```

---

## @forge-ui/floating

Pas une primitive — une **infrastructure partagée** pour le positionnement.

Wrape `@floating-ui/dom ^1.6` avec les options de haut niveau qu'on utilise partout :

```ts
interface FloatingPositioning {
  placement?: Placement;       // "bottom" par défaut
  strategy?: Strategy;         // "fixed" par défaut (safe pour portals)
  offset?: number;             // 4px
  shiftPadding?: number;       // 8px — espace viewport
  sameWidth?: boolean;         // largeur = référence (via size())
  boundary?: Element | ...;    // pour flip + shift
  hideWhenDetached?: boolean;  // data-hidden via hide()
  disableAutoUpdate?: boolean; // désactive l'autoUpdate scroll/resize
  middleware?: Middleware[];   // escape hatch
}
```

`makeComputePositionActivity` — activité clé-en-main. Ajoute à la machine Popover / Tooltip / HoverCard / Select / Combobox :
- `--forge-floating-transform-origin` CSS var sur le content
- `data-side`, `data-align`, `data-placement` sur le content et positioner

---

## @forge-ui/field

Field est différent des autres primitives : **pas de FSM**. C'est un provider de contexte pur qui génère des IDs stables et des props ARIA.

```ts
// packages/field/src/field.ts
export function createField(options: CreateFieldOptions): FieldApi
// FieldApi : getLabelProps, getControlProps, getDescriptionProps, getErrorProps
// + register/unregister Description et Error (pour aria-describedby dynamique)
```

**Pourquoi pas de machine ?** Field n'a pas d'états propres. `invalid`, `required`, `disabled` sont des props passées par le parent. La seule réactivité interne concerne `hasDescription` et `hasError` — mis à jour par `Field.Description` et `Field.Error` à leur montage.

**Field.Control est toujours un Slot** : il ne rend aucun élément lui-même. Il injecte les props (`id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, ...) sur l'enfant. L'enfant (input, select, custom trigger) garde sa sémantique et son élément DOM.

**Vue spécifique** : `useField` dans Vue crée un `context` réactif via `reactive()` directement — pas via `createField` — parce que les mutations de `hasDescription`/`hasError` doivent passer par le proxy Vue pour déclencher les re-rendus.

---

## Ce qu'on ne fait PAS (et pourquoi)

### Listes virtuelles

On n'embarque pas de virtualizer. Notre connect expose une API que le consumer connecte à son virtualizer favori (TanStack Virtual, Virtua, etc.). Les primitives futures qui en auront besoin (Select, Combobox) exposeront les callbacks `onScroll`, les items visibles, etc. via le connect — pas une dépendance sur un virtualizer spécifique.

### Animation

On ne ship pas de système d'animation. Le Presence system (`watchPresence`) retarde le démontage et expose `data-state="open/closed"` — c'est tout. L'animation elle-même (CSS transitions, Framer Motion, GSAP, etc.) est à la charge du consumer. Pas de valeurs d'animation hardcodées dans forge-ui.

### Validation de formulaire

`@forge-ui/field` gère le contexte accessible (IDs, aria-*) mais **pas la validation**. La source de vérité pour `invalid`, le message d'erreur, etc. vient du consumer (React Hook Form, Vee-Validate, Zod, validation manuelle).

### SFC Vue

Les composants Vue sont écrits en `.ts` avec `defineComponent`, pas en `.vue` (SFC). Raisons :
- Contrôle TypeScript complet sur les slots et les types de props
- Pas de step de compilation supplémentaire (`@vitejs/plugin-vue`) dans le pipeline de la lib
- Pattern identique à Ark UI / Zag.js — cohérent avec l'écosystème
- Les SFCs sont réservées aux apps consommatrices et aux exemples de doc

---

## Ajouter une primitive

Exemple concret : ajouter un **ColorPicker**.

### 1. Créer le package primitif

```
packages/primitives/color-picker/
  src/
    color-picker.types.ts    — ColorPickerContext, ColorPickerEvent, ColorPickerState
    color-picker.machine.ts  — createColorPickerMachine(options)
    color-picker.connect.ts  — connectColorPicker(snapshot, send, machine)
    index.ts
  tests/
    color-picker.machine.test.ts
    color-picker.connect.test.ts
    setup.ts
  package.json          — "@forge-ui/color-picker", deps: @forge-ui/core
  tsconfig.json
  vitest.config.ts
```

**Types** (`color-picker.types.ts`) :
```ts
interface ColorPickerContext {
  id: string;
  value: string;          // "#rrggbb" ou "hsl(...)"
  format: "hex" | "hsl" | "rgb";
  open: boolean;
  contentEl: HTMLElement | null;
  // ...
}
```

**Machine** (`color-picker.machine.ts`) :
```ts
const registerLayer = makeLayerActivity<ColorPickerContext>({ ... }); // PREMIER
const computePosition = makeComputePositionActivity<ColorPickerContext>();

activities: {
  registerLayer,       // TOUJOURS premier
  computePosition,
  watchOutside,
}
```

**Connect** (`color-picker.connect.ts`) :
- `getTriggerProps()` → `aria-haspopup`, `aria-expanded`, onClick → TOGGLE
- `getContentProps()` → `role="dialog"`, `aria-label`, ref callback → `updateLayerContentEl`
- `getChannelSliderProps(channel)` → `role="slider"`, `aria-valuenow`, onKeyDown, onPointerDown

### 2. Binding React

```
packages/react/src/components/color-picker/
  use-color-picker.ts   — useState(createColorPickerMachine) + useSyncExternalStore + connectColorPicker
  ColorPicker.tsx       — ColorPicker.Root, Trigger, Portal, Content, ChannelSlider, Swatch...
```

- Ajouter `@forge-ui/color-picker: workspace:*` dans `packages/react/package.json`
- Ajouter path alias dans `packages/react/tsconfig.json`
- Exporter depuis `packages/react/src/index.ts`
- Pour les props contrôlées, utiliser `machine.update({ value: props.value })` dans `useLayoutEffect`

### 3. Binding Vue

Même structure dans `packages/vue/src/components/color-picker/`.

**Pattern controlled Vue** : ne pas mettre le watch dans `use-color-picker.ts` (options est un snapshot statique). Mettre le watch dans `ColorPicker.ts` Root sur `() => props.value` :

```ts
// ColorPicker.ts — Root setup()
watch(
  () => props.value,
  (v) => { if (v !== undefined) api.machine.update({ value: v }); },
);
```

### 4. Nuxt

Dans `packages/nuxt/src/module.ts` :
```ts
addImports({ name: "useColorPicker", from });
addImports({ name: "ColorPicker", from });
const components = ["ColorPickerRoot", "ColorPickerTrigger", "ColorPickerContent", ...];
for (const name of components) addComponent({ name, export: name, filePath: from });
```

### 5. Tests

Chaque couche a ses propres tests :
- **Machine** : transitions d'états, callbacks, valeurs initiales, clamp/snap
- **Connect** : prop-getters, IDs générés, ref callbacks, aria-* attrs
- **React/Vue** : render, interaction, ARIA avec Testing Library
- **E2E** : specs Playwright dans `e2e/react/`, `e2e/vue/`, `e2e/nuxt/`

**Règle tests** : toujours appeler `clearRegistry()` dans `afterEach` quand les tests créent des machines. Toujours stopper les machines (`m.stop()`) pour éviter que les handlers d'événements saignent entre tests.

### 6. Playground

Ajouter une section dans les 3 playgrounds :
- `apps/playground-react/src/App.tsx` — `<Section>` + composant `<ColorPickerDemo />`
- `apps/playground-vue/src/App.vue` — section template + state réactif
- `apps/playground-nuxt/app.vue` — idem Nuxt (auto-import, no manual import)

### 7. Changeset

```bash
bun run changeset
# Sélectionner @forge-ui/color-picker, @forge-ui/react, @forge-ui/vue, @forge-ui/nuxt
# Niveau : minor (nouvelle feature)
# Description : courte en anglais
```

---

## Flux de données résumé

```
User action (click, keydown, pointerdown)
       ↓
Activity listener (document keydown) ou Event handler (onClick dans prop-getter)
       ↓
machine.send({ type: "EVENT" })
       ↓
machine.ts — transition d'état → nouveau context
       ↓
snapshot émis → listener notifié (subscribe)
       ↓
binding re-render (useSyncExternalStore en React, watch en Vue)
       ↓
connectXxx(snapshot, send, machine) → nouveaux prop-getters
       ↓
DOM mis à jour (aria-*, data-*, style, value)
```

**Cas contrôlé (props externes) :**

```
Parent re-render (props.value change)
       ↓
React useLayoutEffect / Vue watch(() => props.value)
       ↓
machine.update({ value: newVal })    — setContext + emit()
       ↓
snapshot émis → binding re-render
       ↓
DOM mis à jour
```

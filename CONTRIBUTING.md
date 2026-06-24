# Contributing to forge-ui

## Setup

**Requirements**: [Bun](https://bun.sh) ≥ 1.2, Node ≥ 20 (for tooling only), Git

```bash
git clone https://github.com/GregoireF/forge-ui.git
cd forge-ui
bun install        # installe tous les packages (workspaces)
bun run build      # build tous les packages une fois (nécessaire pour les références TypeScript composites)
```

Les hooks Git (Biome pre-commit + commitlint commit-msg) s'installent automatiquement via `bun run prepare` (appelé par `bun install`).

---

## Structure du monorepo

```
packages/
  core/                     @forge-ui/core           — moteur FSM + utils a11y
  floating/                 @forge-ui/floating        — wrapper @floating-ui/dom
  primitives/
    dialog/                 @forge-ui/dialog          — machine + connect
    alert-dialog/           @forge-ui/alert-dialog    — machine + connect
    popover/                @forge-ui/popover         — machine + connect
    select/                 @forge-ui/select          — machine + connect
    combobox/               @forge-ui/combobox        — machine + connect (groups, creatable)
    checkbox/               @forge-ui/checkbox        — machine + connect (tri-state, group)
    radio-group/            @forge-ui/radio-group     — machine + connect
    switch/                 @forge-ui/switch          — machine + connect
    tooltip/                @forge-ui/tooltip         — machine + connect (provider, skip-delay)
    hover-card/             @forge-ui/hover-card      — machine + connect
    accordion/              @forge-ui/accordion       — machine + connect (single/multiple)
    collapsible/            @forge-ui/collapsible     — machine + connect
    tabs/                   @forge-ui/tabs            — machine + connect
    tags-input/             @forge-ui/tags-input      — machine + connect
    field/                  @forge-ui/field           — provider pur (pas de FSM)
    progress/               @forge-ui/progress        — machine + connect
    slider/                 @forge-ui/slider          — machine + connect (multi-thumb)
    number-input/           @forge-ui/number-input    — machine + connect (spinbutton)
    date-picker/            @forge-ui/date-picker     — machine + connect (bindings à faire)
    date-range-picker/      @forge-ui/date-range-picker
    date-field/             @forge-ui/date-field
    time-picker/            @forge-ui/time-picker
  react/                    @forge-ui/react           — binding React 19+
  vue/                      @forge-ui/vue             — binding Vue 3.5+
  nuxt/                     @forge-ui/nuxt            — module Nuxt 3
apps/
  playground-react/         sandbox React             (localhost:3000)
  playground-vue/           sandbox Vue               (localhost:3001)
  playground-nuxt/          sandbox Nuxt              (localhost:3002)
e2e/
  react/  vue/  nuxt/       Playwright E2E — specs par composant × framework
tooling/                    tsconfig + scripts build partagés
```

**Règle d'architecture** : chaque couche ne connaît que la couche immédiatement inférieure. `@forge-ui/core` n'a aucune notion de Dialog. Les bindings framework ne contiennent aucune logique de comportement — uniquement de la "plomberie réactive".

---

## Commandes

```bash
# Développement
bun run dev               # démarre tous les playgrounds en parallèle
bun run build             # build tous les packages

# Tests unitaires
bun run test              # tests unitaires (Vitest, tous les packages)
bun run test:coverage     # + rapport de couverture lcov + json-summary

# E2E Playwright (nécessite les 3 serveurs dev actifs)
bun run test:e2e

# Qualité
bun run lint              # Biome check
bun run lint:fix          # Biome check + auto-fix
bun run typecheck         # tsc --noEmit sur tous les packages
```

Pour travailler sur un package spécifique :

```bash
cd packages/primitives/number-input && bun run test   # tests d'un primitif uniquement
cd packages/react && bun run test                     # tests binding React uniquement
cd packages/react && bun run build                    # build d'un package uniquement
```

---

## Workflow

### Branches

```
main          — branche principale, toujours stable
feat/xxx      — nouvelle fonctionnalité
fix/xxx       — correction de bug
chore/xxx     — maintenance, tooling
docs/xxx      — documentation uniquement
```

### Pull Requests

1. Créer une branche depuis `main`
2. Faire les changements + tests
3. S'assurer que `bun run test`, `bun run lint` et `bun run typecheck` passent tous
4. Ouvrir une PR vers `main`
5. La CI (GitHub Actions) doit être verte avant merge

---

## Convention de commits

Les commits suivent [Conventional Commits](https://www.conventionalcommits.org/) **avec un emoji obligatoire en préfixe**.

### Format

```
<emoji> <type>(<scope>): <description>

[body optionnel]
```

### Tableau des types

| Emoji | Type | Usage |
|-------|------|-------|
| ✨ | `feat` | Nouvelle fonctionnalité |
| 🐛 | `fix` | Correction de bug |
| 📝 | `docs` | Documentation uniquement |
| 💄 | `style` | Formatage, Biome, pas de changement logique |
| ♻️ | `refactor` | Refacto sans ajout de feature ni fix de bug |
| ⚡️ | `perf` | Amélioration de performance |
| 🧪 | `test` | Ajout ou correction de tests |
| 🏗️ | `build` | Système de build, dépendances, tsconfig |
| 👷 | `ci` | GitHub Actions, CI/CD |
| 🔧 | `chore` | Maintenance, tooling, scripts |
| ⏪ | `revert` | Annulation d'un commit |
| 🚧 | `wip` | Travail en cours (à éviter sur `main`) |

### Scopes courants

| Scope | Package / zone |
|-------|----------------|
| `core` | `@forge-ui/core` |
| `floating` | `@forge-ui/floating` |
| `dialog` | `@forge-ui/dialog` |
| `alert-dialog` | `@forge-ui/alert-dialog` |
| `popover` | `@forge-ui/popover` |
| `select` | `@forge-ui/select` |
| `combobox` | `@forge-ui/combobox` |
| `checkbox` | `@forge-ui/checkbox` |
| `radio-group` | `@forge-ui/radio-group` |
| `switch` | `@forge-ui/switch` |
| `tooltip` | `@forge-ui/tooltip` |
| `hover-card` | `@forge-ui/hover-card` |
| `accordion` | `@forge-ui/accordion` |
| `collapsible` | `@forge-ui/collapsible` |
| `tabs` | `@forge-ui/tabs` |
| `tags-input` | `@forge-ui/tags-input` |
| `field` | `@forge-ui/field` |
| `progress` | `@forge-ui/progress` |
| `slider` | `@forge-ui/slider` |
| `number-input` | `@forge-ui/number-input` |
| `date-picker` | `@forge-ui/date-picker` |
| `react` | `@forge-ui/react` |
| `vue` | `@forge-ui/vue` |
| `nuxt` | `@forge-ui/nuxt` |
| `e2e` | Tests Playwright |
| `a11y` | WAI-ARIA, axe, accessibilité |
| `tooling` | Scripts build, tsconfig |
| `release` | Changesets, versioning |

### Exemples

```bash
✨ feat(number-input): add spin-repeat on pointer hold (rAF, 300ms delay)
🐛 fix(react): stabilise useMachine snapshot reference for useSyncExternalStore
📝 docs: update README primitives table + ROADMAP phase 2 status
♻️ refactor(core): extract resolveTransition helper to reduce send() complexity
🧪 test(e2e): add number-input Playwright specs (React/Vue/Nuxt)
🔧 chore: add *.d.ts.map to .gitignore
```

### Breaking changes

Ajouter `!` après le type et documenter dans le body :

```bash
💥 feat(core)!: rename snapshot() to getSnapshot()

BREAKING CHANGE: `snapshot()` is now `getSnapshot()`. Update all call sites.
```

---

## Changesets (versioning)

forge-ui utilise [Changesets](https://github.com/changesets/changesets) pour la gestion des versions.

Après chaque changement notable sur un package publiable :

```bash
bun run changeset      # crée un fichier de changeset interactif
```

Choisir le ou les packages impactés, le niveau de bump (`patch` / `minor` / `major`), et écrire une description en anglais.

Les changesets sont mergés dans les PRs et appliqués lors du release :

```bash
bun run changeset:version   # bumpe les versions + met à jour les CHANGELOGs
bun run release             # build + publish npm (CI only)
```

---

## Ajouter une primitive

La structure à respecter pour chaque nouvelle primitive `<name>` :

```
packages/primitives/<name>/
  src/
    <name>.types.ts     — XxxContext, XxxEvent, XxxState
    <name>.machine.ts   — createXxxMachine(options)
    <name>.connect.ts   — connectXxx(snapshot, send, machine)
    index.ts
  tests/
    <name>.machine.test.ts
    <name>.connect.test.ts
    setup.ts
  package.json          — name: "@forge-ui/<name>", deps: @forge-ui/core
  tsconfig.json
  vitest.config.ts
```

Puis ajouter les bindings dans :
- `packages/react/src/components/<name>/` — `use-<name>.ts` + composants compound (`<Name>.tsx`)
- `packages/vue/src/components/<name>/` — idem (`.ts`, pas `.vue` — voir ARCHITECTURE.md)
- Exports dans `packages/react/src/index.ts` et `packages/vue/src/index.ts`
- Auto-import dans `packages/nuxt/src/module.ts`
- Section dans les 3 playgrounds (`apps/playground-*/`)
- Specs e2e dans `e2e/react/`, `e2e/vue/`, `e2e/nuxt/`

Chaque couche doit avoir ses propres tests. Pas de logique de comportement dans les bindings framework.

**Règle tests** : toujours appeler `clearRegistry()` dans `afterEach` quand les tests créent des machines avec des overlays (Dialog, Popover, etc.). Toujours stopper les machines (`m.stop()`) pour éviter les fuites de listeners entre tests.

---

## Notes Windows

Les hooks Git s'installent automatiquement via `bun install` (`scripts/setup-hooks.mjs`).

**Sur Windows**, `lefthook` échoue systématiquement avec `fork(): Resource temporarily unavailable` — c'est un bug MSYS/Git-for-Windows non corrigeable depuis le contenu du script. Le script détecte automatiquement Windows et **désactive les hooks locaux** (`core.hooksPath → .git/no-hooks`).

Tu n'as rien à configurer manuellement. En échange :

- Lance `bun run lint && bun run typecheck` avant d'ouvrir une PR.
- La CI (GitHub Actions, Linux) applique Biome + commitlint sur chaque push et bloque le merge si ça échoue.

> Les hooks fonctionnent normalement sur macOS et Linux.

---

## Questions

Ouvrir une [issue GitHub](https://github.com/GregoireF/forge-ui/issues) ou contacter directement l'équipe.

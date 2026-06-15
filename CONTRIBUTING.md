# Contributing to forge-ui

## Setup

**Requirements**: [Bun](https://bun.sh) ≥ 1.2, Node ≥ 20 (for tooling only), Git

```bash
git clone https://github.com/GregoireF/forge-ui.git
cd forge-ui
bun install        # installe tous les packages (workspaces)
bun run build      # build tous les packages une fois
```

Les hooks Git (Biome pre-commit + commitlint commit-msg) s'installent automatiquement via `bun run prepare` (appelé par `bun install`).

---

## Structure du monorepo

```
packages/core/              @forge-ui/core      — moteur FSM + utils a11y
packages/primitives/dialog/ @forge-ui/dialog    — machine dialog + connect (agnostique)
packages/react/             @forge-ui/react     — binding React 19+
packages/vue/               @forge-ui/vue       — binding Vue 3.5+
packages/nuxt/              @forge-ui/nuxt      — module Nuxt 4
apps/playground-react/      sandbox React       (localhost:3000)
apps/playground-vue/        sandbox Vue         (localhost:3001)
e2e/                        Playwright E2E
tooling/                    tsconfig + scripts build partagés
```

**Règle d'architecture** : chaque couche ne connaît pas la couche supérieure. `@forge-ui/core` n'a aucune notion de Dialog. Les bindings framework ne contiennent aucune logique de comportement.

---

## Commandes

```bash
# Développement
bun run dev               # démarre tous les playgrounds en parallèle
bun run build             # build tous les packages

# Tests
bun run test              # tests unitaires (Vitest, tous les packages)
bun run test:e2e          # tests E2E Playwright (nécessite les serveurs dev)

# Qualité
bun run lint              # Biome check
bun run lint:fix          # Biome check + auto-fix
bun run typecheck         # tsc --noEmit sur tous les packages
```

Pour travailler sur un package spécifique :

```bash
cd packages/nuxt && bun run test        # tests nuxt uniquement
cd packages/nuxt && bun run build       # build nuxt uniquement
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
| `dialog` | `@forge-ui/dialog` |
| `react` | `@forge-ui/react` |
| `vue` | `@forge-ui/vue` |
| `nuxt` | `@forge-ui/nuxt` |
| `e2e` | Tests Playwright |
| `tooling` | Scripts build, tsconfig |
| `release` | Changesets, versioning |

### Exemples

```bash
✨ feat(dialog): add closeOnInteractOutside option
🐛 fix(react): stabilise useMachine snapshot reference for useSyncExternalStore
📝 docs(nuxt): document auto-imported exports in README
♻️ refactor(core): extract resolveTransition helper to reduce send() complexity
🧪 test(react): add asChild merge props tests
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
    <name>.types.ts     — DialogContext, DialogEvent, DialogState
    <name>.machine.ts   — createXxxMachine()
    <name>.connect.ts   — connectXxx()
    index.ts
  tests/
    <name>.machine.test.ts
    <name>.connect.test.ts
    setup.ts
  package.json          — name: "@forge-ui/<name>"
  tsconfig.json
  vitest.config.ts
```

Puis ajouter les bindings dans :
- `packages/react/src/components/<name>/` — `use-<name>.ts` + composants
- `packages/vue/src/components/<name>/` — idem
- Exports dans `packages/react/src/index.ts` et `packages/vue/src/index.ts`
- Auto-import dans `packages/nuxt/src/module.ts`

Chaque couche doit avoir ses propres tests. Pas de logique de comportement dans les bindings framework.

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

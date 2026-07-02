# Contributing to forge-ui

Guide complet pour contribuer à forge-ui — bibliothèque de primitifs UI headless,
architecture machine-état (FSM) → connect → framework, monorepo Bun + Turbo.

---

## Table des matières

1. [Prérequis & setup](#1-prérequis--setup)
2. [Structure du monorepo](#2-structure-du-monorepo)
3. [Architecture (loi fondamentale)](#3-architecture-loi-fondamentale)
4. [Commandes](#4-commandes)
5. [Workflow GitFlow](#5-workflow-gitflow)
6. [Convention de commits](#6-convention-de-commits)
7. [Pull Requests](#7-pull-requests)
8. [VS Code — setup recommandé](#8-vs-code--setup-recommandé)
9. [Ajouter une primitive](#9-ajouter-une-primitive)
10. [Changesets (versioning)](#10-changesets-versioning)
11. [Notes Windows](#11-notes-windows)
12. [Questions](#12-questions)

---

## 1. Prérequis & setup

**Prérequis** : [Bun](https://bun.sh) ≥ 1.2 · Node ≥ 24 (pour tooling) · Git ≥ 2.40

```bash
git clone https://github.com/GregoireF/forge-ui.git
cd forge-ui
bun install          # installe tous les packages (workspaces) + hooks Git
bun run build        # build initial — requis pour les références TypeScript composites
```

Les hooks Git (Biome pre-commit + commitlint commit-msg) s'installent automatiquement
via `bun run prepare` (appelé par `bun install`).

> **Sur Windows** : les hooks sont désactivés localement (bug MSYS/lefthook). Lance
> `bun run lint && bun run typecheck` manuellement avant d'ouvrir une PR.
> La CI les applique sur chaque push et bloque le merge si ça échoue.

---

## 2. Structure du monorepo

```
forge-ui/
├── packages/
│   ├── core/                   @forge-ui/core           — moteur FSM + utils a11y
│   ├── floating/               @forge-ui/floating        — wrapper @floating-ui/dom
│   ├── primitives/
│   │   ├── accordion/          @forge-ui/accordion
│   │   ├── alert-dialog/       @forge-ui/alert-dialog
│   │   ├── avatar/             @forge-ui/avatar
│   │   ├── checkbox/           @forge-ui/checkbox
│   │   ├── collapsible/        @forge-ui/collapsible
│   │   ├── combobox/           @forge-ui/combobox        — groups, creatable
│   │   ├── date-field/         @forge-ui/date-field
│   │   ├── date-picker/        @forge-ui/date-picker
│   │   ├── date-range-picker/  @forge-ui/date-range-picker
│   │   ├── dialog/             @forge-ui/dialog
│   │   ├── field/              @forge-ui/field           — provider pur (pas de FSM)
│   │   ├── hover-card/         @forge-ui/hover-card
│   │   ├── menu/               @forge-ui/menu
│   │   ├── number-input/       @forge-ui/number-input    — spinbutton
│   │   ├── popover/            @forge-ui/popover
│   │   ├── progress/           @forge-ui/progress
│   │   ├── radio-group/        @forge-ui/radio-group
│   │   ├── select/             @forge-ui/select
│   │   ├── separator/          @forge-ui/separator
│   │   ├── slider/             @forge-ui/slider          — multi-thumb
│   │   ├── switch/             @forge-ui/switch
│   │   ├── tabs/               @forge-ui/tabs
│   │   ├── tags-input/         @forge-ui/tags-input
│   │   ├── time-picker/        @forge-ui/time-picker
│   │   ├── toggle/             @forge-ui/toggle
│   │   ├── toggle-group/       @forge-ui/toggle-group
│   │   ├── tooltip/            @forge-ui/tooltip
│   │   └── visually-hidden/    @forge-ui/visually-hidden
│   ├── react/                  @forge-ui/react           — binding React 19+
│   ├── vue/                    @forge-ui/vue             — binding Vue 3.5+
│   └── nuxt/                   @forge-ui/nuxt            — module Nuxt 3
├── apps/
│   ├── playground-react/       sandbox React  → localhost:3000
│   ├── playground-vue/         sandbox Vue    → localhost:3001
│   └── playground-nuxt/        sandbox Nuxt   → localhost:3002
├── e2e/
│   ├── react/  vue/  nuxt/     specs Playwright par composant × framework
└── tooling/                    tsconfig + scripts build partagés
```

---

## 3. Architecture (loi fondamentale)

```
@forge-ui/core          — moteur FSM pur, aucune dépendance framework
        ↓
packages/primitives/*   — machine.ts + connect.ts (logique comportementale)
        ↓
@forge-ui/react         — binding React : useMachine + composants compound
@forge-ui/vue           — binding Vue : useVueMachine + composants compound
@forge-ui/nuxt          — auto-import du binding Vue
```

**Règles strictes :**

- `@forge-ui/core` n'a aucune notion d'un composant spécifique (pas d'import de dialog, etc.)
- Les fichiers `*.machine.ts` contiennent 100 % de la logique comportementale
- Les fichiers `*.connect.ts` exposent une API dérivée du snapshot (propriétés ARIA, handlers) — zéro logique comportementale
- Les bindings framework (`react/`, `vue/`) ne contiennent que de la "plomberie réactive" — aucune logique FSM

---

## 4. Commandes

```bash
# Développement
bun run dev               # tous les playgrounds en parallèle
bun run dev:react         # React uniquement     (localhost:3000)
bun run dev:vue           # Vue uniquement        (localhost:3001)
bun run dev:nuxt          # Nuxt uniquement       (localhost:3002)
bun run build             # build tous les packages

# Tests
bun run test              # tests unitaires (Vitest, tous les packages)
bun run test:coverage     # + rapport de couverture lcov + json-summary
bun run test:e2e          # E2E Playwright (nécessite les 3 serveurs dev actifs)

# Qualité
bun run lint              # Biome check
bun run lint:fix          # Biome check + auto-fix
bun run typecheck         # tsc --noEmit sur tous les packages

# Vérification complète avant push
bun run lint && bun run typecheck && bun run test && bun run build
```

Pour travailler sur un seul package :

```bash
cd packages/primitives/number-input && bun run test
cd packages/react && bun run build
```

---

## 5. Workflow GitFlow

### Vue d'ensemble

```
main ──────────────────────────────────────── production, tags de release npm
  ↑ PR "promote" (CI + E2E + CodeQL requis)
develop ───────────────────────────────────── intégration, CI seule
  ↑ PR (CI requise)                        ↑ Renovate PRs (auto)
feat/<nom>   fix/<nom>   chore/<nom>   docs/<nom>
```

```
[hotfix/*] ──→ main (PR directe + CI + E2E)
               └──→ develop (merge-back immédiat)
```

### Règles des branches

| Branche | Créée depuis | Merge vers | Protection |
|---|---|---|---|
| `main` | — | — | PR obligatoire · CI + E2E + CodeQL · push direct interdit |
| `develop` | `main` | `main` (promote) | PR obligatoire · CI |
| `feat/<nom>` | `develop` | `develop` | — |
| `fix/<nom>` | `develop` | `develop` | — |
| `chore/<nom>` | `develop` | `develop` | — |
| `docs/<nom>` | `develop` | `develop` | — |
| `hotfix/<nom>` | `main` | `main` + `develop` | — |
| `nightly-release` | — | — | Read-only humains (CI seule) |

### Créer une feature ou un fix

```bash
# 1. Toujours partir de develop à jour
git switch develop && git pull origin develop

# 2. Créer la branche
git switch -c feat/mon-composant
# ou : fix/dialog-focus-trap, chore/update-deps, docs/avatar-readme

# 3. Coder + committer (voir convention de commits)
git add packages/primitives/mon-composant/
git commit -m "✨ feat(mon-composant): description"

# 4. Créer un changeset si un package publié est impacté
bun run changeset

# 5. Pousser et ouvrir une PR vers develop
git push -u origin feat/mon-composant
gh pr create --base develop
```

### Hotfix d'urgence (bug de production)

```bash
# 1. Partir de main
git switch main && git pull origin main
git switch -c hotfix/dialog-crash

# 2. Fix + commit
git commit -m "🐛 fix(dialog): ..."

# 3. PR vers main (pas develop)
gh pr create --base main --label hotfix

# 4. Après merge sur main → merge-back vers develop IMMÉDIATEMENT
git switch develop && git pull origin develop
git merge origin/main
git push origin develop
```

> Un hotfix non merge-back dans develop sera écrasé à la prochaine promote.

### Promote develop → main (release)

La promote est déclenchée manuellement via GitHub Actions :

1. Aller dans **Actions → "Promote develop → main"**
2. Cliquer **Run workflow**
3. Renseigner ce qui est inclus dans cette promotion
4. Un PR `release-candidate` est créé automatiquement
5. La CI complète (CI + E2E + CodeQL) doit être verte
6. Merger le PR → changesets crée un PR **"Version Packages"**
7. Merger "Version Packages" → publication npm automatique

---

## 6. Convention de commits

Les commits suivent [Conventional Commits](https://www.conventionalcommits.org/)
**avec un emoji obligatoire en préfixe** (commitlint l'applique en CI).

### Format

```
<emoji> <type>(<scope>): <description courte>

[body optionnel]
[BREAKING CHANGE: ...]
```

### Tableau des types

| Emoji | Type | Usage |
|-------|------|-------|
| ✨ | `feat` | Nouvelle fonctionnalité |
| 🐛 | `fix` | Correction de bug |
| 📝 | `docs` | Documentation uniquement |
| 💄 | `style` | Formatage, Biome, pas de changement logique |
| ♻️ | `refactor` | Refacto sans ajout de feature ni fix |
| ⚡️ | `perf` | Amélioration de performance |
| 🧪 | `test` | Ajout ou correction de tests |
| 🏗️ | `build` | Système de build, dépendances, tsconfig |
| 👷 | `ci` | GitHub Actions, CI/CD |
| 🔧 | `chore` | Maintenance, tooling, scripts |
| 🔒 | `security` | Corrections de sécurité |
| ⏪ | `revert` | Annulation d'un commit |
| 🚧 | `wip` | Travail en cours (jamais sur `main`) |
| 💥 | `feat!` / `fix!` | Breaking change |

### Scopes

`core` · `floating` · `accordion` · `alert-dialog` · `avatar` · `checkbox` · `collapsible`
· `combobox` · `date-field` · `date-picker` · `date-range-picker` · `dialog` · `field`
· `hover-card` · `menu` · `number-input` · `popover` · `progress` · `radio-group`
· `select` · `separator` · `slider` · `switch` · `tabs` · `tags-input` · `time-picker`
· `toggle` · `toggle-group` · `tooltip` · `visually-hidden` · `react` · `vue` · `nuxt`
· `e2e` · `a11y` · `tooling` · `release`

### Exemples

```bash
✨ feat(number-input): add spin-repeat on pointer hold (rAF, 300ms delay)
🐛 fix(react): stabilise useMachine snapshot reference for useSyncExternalStore
📝 docs: add avatar section to react README
♻️ refactor(core): extract resolveTransition helper to reduce send() complexity
🧪 test(e2e): add number-input Playwright specs (React/Vue/Nuxt)
👷 ci: upgrade GitHub Actions to node24 runtime
🔒 fix(security): update astro 5.x → 7.x to patch 5 CVEs
```

### Breaking change

```bash
💥 feat(core)!: rename snapshot() to getSnapshot()

BREAKING CHANGE: `snapshot()` est maintenant `getSnapshot()`. Mettre à jour tous les
call sites. Migration : s/\.snapshot()/\.getSnapshot()/g dans les bindings.
```

---

## 7. Pull Requests

### Avant d'ouvrir une PR

```bash
bun run lint       # doit passer sans erreur
bun run typecheck  # doit passer sans erreur
bun run test       # tous les tests doivent être verts
```

### Checklist PR (rappel dans le template)

- [ ] Lint + typecheck + tests passent
- [ ] Nouveau comportement couvert par des tests
- [ ] Changeset créé si package publié impacté
- [ ] Architecture 3 niveaux respectée
- [ ] Pas de logique comportementale dans les bindings framework

### Règles de review

- Toute PR vers `develop` nécessite **1 approbation**
- Toute PR vers `main` nécessite **1 approbation + CI verte**
- Le PR auteur ne peut pas merger son propre PR
- Les PRs `Renovate` s'automerge si la CI est verte (configuré dans `renovate.json`)

### Labels appliqués automatiquement

| Préfixe de branche | Label |
|---|---|
| `feat/*` | `enhancement` |
| `fix/*` | `bug` |
| `hotfix/*` | `hotfix` · `priority: high` |
| `docs/*` | `documentation` |
| `chore/*` | `chore` |
| `refactor/*` | `refactor` |
| `test/*` | `test` |
| `ci/*` | `ci` |
| `develop → main` | `release-candidate` |

---

## 8. VS Code — setup recommandé

Le dossier `.vscode/` est versionné dans le repo. Il configure automatiquement :

- **Formateur** : Biome (remplace ESLint + Prettier) sur save
- **Vitest** : intégration native dans le panneau Tests
- **Playwright** : runner E2E intégré
- **TypeScript** : SDK workspace (version du repo, pas la globale)

### Extensions recommandées

À l'ouverture du repo, VS Code proposera d'installer :

| Extension | Rôle |
|---|---|
| `biomejs.biome` | Linter + formatter |
| `vue.volar` | Support Vue 3 + TypeScript |
| `vitest.explorer` | UI tests Vitest |
| `ms-playwright.playwright` | Runner E2E |
| `eamodio.gitlens` | Git blame inline |
| `github.vscode-pull-request-github` | PRs dans VS Code |
| `github.vscode-github-actions` | Autocomplétion workflows CI |
| `usernamehw.errorlens` | Erreurs inline |
| `ms-vsliveshare.vsliveshare` | Pair programming |

### Tâches VS Code (Ctrl+Shift+P → "Run Task")

| Tâche | Commande |
|---|---|
| `dev: React (localhost:3000)` | `bun run dev:react` |
| `dev: Vue (localhost:3001)` | `bun run dev:vue` |
| `dev: Nuxt (localhost:3002)` | `bun run dev:nuxt` |
| `test: unitaires` | `bun run test` |
| `test: E2E Playwright` | `bun run test:e2e` |
| `lint: corriger auto` | `bun run lint:fix` |
| `ci: vérification complète` | lint + typecheck + test + build |

---

## 9. Ajouter une primitive

### Structure requise

```
packages/primitives/<name>/
├── src/
│   ├── <name>.types.ts       XxxContext, XxxEvent, XxxState
│   ├── <name>.machine.ts     createXxxMachine(options)
│   ├── <name>.connect.ts     connectXxx(snapshot, send, machine)
│   └── index.ts
├── tests/
│   ├── <name>.machine.test.ts
│   ├── <name>.connect.test.ts
│   └── setup.ts
├── package.json              name: "@forge-ui/<name>", deps: @forge-ui/core
├── tsconfig.json
└── vitest.config.ts
```

### Checklist d'intégration complète

- [ ] Primitive créée (`machine.ts` + `connect.ts` + tests)
- [ ] Binding React : `packages/react/src/components/<name>/`
- [ ] Binding Vue : `packages/vue/src/components/<name>/`
- [ ] Export dans `packages/react/src/index.ts`
- [ ] Export dans `packages/vue/src/index.ts`
- [ ] Auto-import Nuxt dans `packages/nuxt/src/module.ts`
- [ ] Exemple dans `apps/playground-react/`
- [ ] Exemple dans `apps/playground-vue/`
- [ ] Exemple dans `apps/playground-nuxt/`
- [ ] Specs E2E dans `e2e/react/`, `e2e/vue/`, `e2e/nuxt/`
- [ ] Section dans `packages/react/README.md`
- [ ] Section dans `packages/vue/README.md`
- [ ] Coverage uploadée dans `ci.yml`

### Règles tests

- Toujours appeler `clearRegistry()` dans `afterEach` quand les tests créent des machines
  avec des overlays (Dialog, Popover, etc.)
- Toujours stopper les machines (`m.stop()`) pour éviter les fuites de listeners
- Les machines avec un `context` objet instable dans les deps `useEffect` provoquent des
  boucles infinies → OOM silencieux. Stabiliser le context ou le mémoïser.

---

## 10. Changesets (versioning)

forge-ui utilise [Changesets](https://github.com/changesets/changesets) pour la gestion
des versions sémantiques.

```bash
# Après un changement notable sur un package publié
bun run changeset

# Choisir : package(s) impacté(s), niveau (patch/minor/major), description en anglais
# → crée un fichier dans .changeset/

# Commit le fichier changeset dans la même PR que le changement
git add .changeset/
git commit -m "📝 docs(release): add changeset for <feature>"
```

**Le processus de release est entièrement automatisé :**

1. Changesets s'accumulent sur `develop`
2. Promote `develop → main` (workflow manuel)
3. Changesets Action détecte les fichiers `.changeset/` sur `main`
4. Crée un PR **"Version Packages"** qui bumpe les versions + met à jour les CHANGELOGs
5. Merger ce PR → `bun run release` s'exécute en CI → publication npm

---

## 11. Notes Windows

Les hooks Git s'installent via `bun install` (`scripts/setup-hooks.mjs`).

Sur Windows, `lefthook` échoue avec `fork(): Resource temporarily unavailable`
(bug MSYS/Git-for-Windows non corrigeable). Le script détecte Windows et désactive
les hooks locaux (`core.hooksPath → .git/no-hooks`).

**En conséquence** : lance toujours `bun run lint && bun run typecheck` avant de pousser.
La CI (Linux) les applique sur chaque push et bloque le merge si ça échoue.

---

## 12. Questions

- Ouvrir une [issue GitHub](https://github.com/GregoireF/forge-ui/issues)
- Utiliser les [Discussions](https://github.com/GregoireF/forge-ui/discussions) pour les questions informelles
- Contacter directement l'équipe si besoin urgent

## Résumé

<!-- Une ou deux phrases. Ce que ce PR fait et POURQUOI. -->

## Type de changement

- [ ] ✨ `feat` — nouvelle fonctionnalité
- [ ] 🐛 `fix` — correction de bug
- [ ] 📝 `docs` — documentation uniquement
- [ ] ♻️ `refactor` — refacto sans changement de comportement
- [ ] 🧪 `test` — tests uniquement
- [ ] 👷 `ci` — GitHub Actions / tooling CI
- [ ] 🔧 `chore` — maintenance, dépendances
- [ ] 💥 breaking change (ajouter `!` dans le titre du commit)

## Packages affectés

<!-- Cocher ce qui s'applique -->

- [ ] `@forge-ui/core` — moteur FSM
- [ ] `@forge-ui/floating` — positioning
- [ ] Primitif(s) : <!-- ex: dialog, combobox, date-picker… -->
- [ ] `@forge-ui/react` — binding React
- [ ] `@forge-ui/vue` — binding Vue
- [ ] `@forge-ui/nuxt` — module Nuxt
- [ ] Apps / playground
- [ ] E2E / Playwright
- [ ] CI / Tooling

## Checklist avant merge

- [ ] `bun run lint` passe sans erreur
- [ ] `bun run typecheck` passe sans erreur
- [ ] `bun run test` passe (100 % des tests existants verts)
- [ ] Nouveau comportement couvert par des tests (unit ou e2e)
- [ ] Changeset créé si package publiable impacté (`bun run changeset`)
- [ ] Architecture 3 niveaux respectée : machine → connect → framework

## Changeset

<!-- Si ce PR modifie un package publié sur npm, coller le nom du fichier .changeset ici.
     Sinon, écrire "N/A — pas de changement publiable". -->

## Notes pour le reviewer

<!-- Contexte, compromis, questions, points d'attention... -->

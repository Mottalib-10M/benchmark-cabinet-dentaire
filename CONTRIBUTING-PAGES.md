# Ajouter ou modifier une page de Dentimètre

Notice pour les agents qui prolongent le site. À lire avec `~/Documents/GitHub/RECETTE-SITE.md` (§0, §6, §7, §9.3, §11, §17.4, §21, §26).

## Architecture : une page = un fichier de données

| Type de page | Fichier | Rendu par |
|---|---|---|
| Accueil (simulateur + page pilier) | `src/content/accueil.ts` | `components/HomePage.astro` |
| Spécialité (omnipraticien, ODF, stomatologue) et guides de gestion | `src/content/guides/<id>.ts` | `components/ContentPage.astro` |
| Département (27 × 2 pages) | texte rédigé : `src/content/departements/<code>.ts` ; le reste est calculé (`lib/dep-gen.ts`) | `components/DepartementPage.astro` |
| Méthode, à propos, légal | `src/pages/<langue>/*.astro`, `components/MethodPage.astro` | — |

Le cœur (routes `src/i18n/routes.ts`, menus `src/i18n/nav.ts`, sitemap, hreflang, schémas, FAQ) lit ces fichiers seul : **on ne touche pas au cœur pour ajouter une page**.

## Les données, et d'où elles viennent

| Fichier | Contenu | Rejouer |
|---|---|---|
| `src/data/ameli.json` | Honoraires moyens (sans dépassement, dépassements), effectifs, densité, âges, exercice mixte, patientèle, par spécialité (omnipraticiens = « hors ODF », ODF, stomatologues) × département × région × France, 2015-2025 | `python3 scripts/data/build-ameli.py --force` (télécharge l'open data data.ameli.fr, licence ODbL ; la Cnam ajoute l'année N-1 en octobre) |
| `src/data/unasa.json` | Comptes 2024 et 2023 des cabinets adhérents UNASA (chirurgiens-dentistes 851EAA, orthodontistes 851EAB), par quart de recettes | `python3 scripts/data/build-unasa.py` (réponses du formulaire https://unasa.fr/statistiques/ gardées dans `scripts/data/unasa/`) |
| `src/data/params-2026.json` | DREES (revenus 2021 et quantiles), Insee (2022), CARCDSF (chiffres clés, barème 2026), grille IDCC 1619 2026, Smic, taux Urssaf employeur et RGDU, IS, PFU, prélèvements sociaux, comptes de la santé 2024, RPPS | à la main, chaque bloc a sa clé `_source` dans `sources` |

**Règle de vérité** : un chiffre affiché vient d'un de ces fichiers, par le code (`P.…`, `stat(…)`, `reference(…)`), jamais tapé dans un texte. Ce qui n'existe pas dans les sources ne se publie pas. Ce qui n'existe pas :
- aucune distribution (percentile) des **honoraires** : l'Assurance Maladie ne publie que des moyennes ; le seul percentile du site porte sur le **revenu** (quantiles DREES 2021, interpolés) ;
- aucune donnée officielle par praticien sur l'implantologie, la parodontie ou l'orthodontie adulte (actes hors nomenclature, absents du SNDS : DREES, comptes de la santé 2024, fiche 09) ;
- aucune statistique publique séparée pour la chirurgie orale et la médecine bucco-dentaire (comptées dans « chirurgiens-dentistes hors ODF ») ;
- aucune statistique de cabinets pour les stomatologues (le simulateur prend alors la référence UNASA des chirurgiens-dentistes, et le dit) ;
- aucune moyenne publique par fauteuil.

## Un guide (`src/content/guides/<id>.ts`)

Copier la structure de `classement-departements.ts`, jamais ses phrases. Champs : `id` (= nom du fichier), `group` (`specialites`, `gestion`, `territoires`), `order`, `mini` (un fichier de `src/lib/minis/`) ou `tool: 'benchmark'` + `spec` (pages spécialité), `related` (3 à 6 identifiants existants), `sources` (clés de `params-2026.json > sources`, 2 au moins), puis `fr` et `en` :

| Champ | Règle |
|---|---|
| `slug` | minuscules et tirets, sans année ni nombre à 3 chiffres, sans `conditions`, `contact`, `legal`, `method` |
| `title` | 50-60 caractères, terme-clé d'abord, année (2026 pour les règles, 2025 pour les données Ameli) |
| `description` | 150-160 caractères, année et un fait chiffré |
| `resume` | UN paragraphe d'au moins 120 mots, citable seul (§21) |
| `faqs` | 4 à 8 questions réelles, réponses de 40 à 90 mots ; une question n'existe qu'une fois sur tout le site |
| `body` | `(h) => html` ; `h.eur`, `h.pct`, `h.num`, `h.src(clé)`, `h.a(id, texte)`, `h.table(…)`, `h.P` ; `<!--mini:kind-->` ajoute un second mini-simulateur |

Contrôle d'une fiche : `PAGE_FILES=<id> npx vitest run tests/pages.test.ts`.

## Une page département

Le texte rédigé (2-3 sections, 400 mots par langue au moins) vit dans `src/content/departements/<code>.ts` ; les nombres passent par `h` (`src/lib/dep-types.ts`). Une page n'existe que si le département compte au moins `SEUIL` (510) chirurgiens-dentistes libéraux (`src/lib/departements.ts`), seuil fixé par la limite de 100 pages du site (RECETTE §3) ; les autres départements restent dans le classement des 101 et dans le simulateur, et les 33 pages retirées le 2026-10-16 redirigent depuis `404.astro`. Ne pas ajouter de page département sans en retirer une autre : `check-trame.py` bloque au-delà de 100 pages. Le titre, la description, le bloc citable et la FAQ sont générés (`lib/dep-gen.ts`) et marqués `data-chrome` (RECETTE §6.4) : seul le texte rédigé fait l'unicité.

## Contrôles (tous à 0)

```bash
export NODE_PATH=$(npm root -g):$PWD/node_modules
npm run check        # build + vitest + tous les contrôles de la trame
```

Ports réservés à ce site : 5407 (dev/preview). Arrêter un serveur par son port : `lsof -ti tcp:5407 | xargs kill`.

## Mise à jour annuelle

1. Octobre : `build-ameli.py --force` (nouvelle année Ameli) ; vérifier `DATA_YEAR` dans les titres.
2. UNASA : relever l'année suivante sur https://unasa.fr/statistiques/ (codes 851EAA, 851EAB), ranger la réponse dans `scripts/data/unasa/`, passer `UNASA_YEAR`.
3. `params-<année>.json` : DREES, Insee, CARCDSF, grille IDCC 1619, Smic, Urssaf, IS, PFU ; relire chaque valeur sur sa source.
4. `npx vitest run` puis `npm run check`.

**Pages département à la mise à jour annuelle** : les nombres suivent les données, mais certains textes classent en mots (« meilleure moyenne de la région », « seule la Haute-Garonne fait moins », « au sommet du classement »). Après `build-ameli.py --force`, relire chaque `src/content/departements/<code>.ts` contre `src/data/ameli.json` et corriger les comparaisons qui ne tiennent plus.

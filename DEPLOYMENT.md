# Publication GitHub Pages

Le jeu fonctionne sans serveur applicatif, compte joueur ni base de données distante.

## Préparation

`npm test` vérifie les règles et les parcours de campagne. `npm run build` prépare `_site/` en suivant les dépendances du navigateur depuis `index.html`. Les tests, documents et journaux locaux ne font pas partie du site publié.

`node tests/pages-browser.cjs` vérifie le résultat sous un préfixe de projet GitHub Pages, en largeur 390 px : ressources JavaScript/CSS, prologue, première libération et conservation de la sauvegarde après rechargement. Ce test utilise Playwright et Chrome comme les autres tests navigateur locaux.

## Publication

Le workflow `.github/workflows/pages.yml` lance les tests, construit le site et le publie après chaque push sur `main`. Dans Settings → Pages, la source doit être **GitHub Actions**. Le déploiement utilise uniquement les permissions de publication Pages et de lecture du contenu du dépôt.

Le nom proposé pour le dépôt est `la-couronne-des-jours-morts`, sur le compte GitHub connecté. L’URL définitive sera enregistrée après la première publication réussie.

## Sauvegardes et retours

Les sauvegardes sont locales à l’origine du site et au navigateur. Pour reprendre une partie jouée sur localhost : exporter depuis la page locale, ouvrir le site GitHub Pages, puis importer le fichier. Le jeu crée une copie de secours avant remplacement.

Une mise à jour ne change pas la clé de stockage de la campagne. Aucun fichier de sauvegarde personnel ne doit être ajouté au dépôt. Les copies de sauvegarde locales ne sont pas synchronisées entre téléphone et ordinateur ; export/import permet de transférer une partie.

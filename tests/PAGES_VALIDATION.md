# Prépublication GitHub Pages

Préparation du 25 octobre 2026, version 0.4.0.

- 100 tests unitaires et d’intégration réussis, dont la campagne économique complète sans ressources offertes.
- Construction statique : 17 fichiers du navigateur, découverts depuis `index.html` ; aucun journal ou fichier de sauvegarde dans le site généré.
- Test navigateur du résultat sous `/la-couronne-des-jours-morts/`, à 390 px : tous les modules et styles chargent, aucune erreur JavaScript, première libération réussie, onglets débloqués et sauvegarde conservée après rechargement.

Reproduction : `npm test`, `npm run build`, puis `node tests/pages-browser.cjs` avec Playwright et Chrome configurés comme les autres tests navigateur.

La publication distante doit ensuite être vérifiée séparément : ce document prouve la préparation locale et ne prétend pas qu’un dépôt ou un site distant existe déjà. Les rapports et captures générés restent dans `tests/reports/`, ignoré par Git.

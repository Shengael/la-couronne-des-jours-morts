# Validation du prototype 0.1

24 octobre 2026.

## Moteur

14 tests passent via `node --test tests/engine.test.mjs` : victoire et récompenses, formation figée pendant un combat, retour en farming, achats atomiques, préparation valide, production des sites, sauvegarde, reconstruction, imports invalides, mise à jour déterministe, effet de l’arme du souverain, XP du commandant, interruption et déblocages non répétés.

## Simulation de progression

Politique automatique de test : achats successifs dans un ordre fixe, passage à trois régiments et Tesk après libération, puis Silence/Rempart. Ce n’est pas une mesure de temps d’une partie humaine.

- Première progression : portion terminée en **302 secondes simulées**, 14 victoires et 1 défaite.
- Essai de reconstruction : portion terminée en **230 secondes simulées**, 9 victoires et 1 défaite.
- Réduction observée dans ce cas : environ **24 %**.

Ces résultats montrent qu’une progression et une reconquête sont possibles avec une politique simple. Ils ne démontrent ni un équilibrage global ni la durée d’un chapitre complet. Les nombres, objets de butin et seuils de cette portion restent provisoires.

## Navigateur

Parcours Playwright avec Chrome dans un contexte isolé, sans profil personnel :

1. Démarrage, guide, premier combat et récompenses réellement attribuées.
2. Défaite puis farming automatique.
3. Achat d’amélioration et débit effectif des ressources.
4. Préparation conservée après rechargement ; combat partiel sans récompense.
5. Formation avancée importée par le vrai sélecteur de fichier : commandant, régiments et interruption automatique.
6. Import invalide rejeté en conservant la progression existante.
7. Essai de reconstruction depuis une sauvegarde de test : savoir conservé, moyens matériels remis à zéro.
8. Affichage à 1440 et 390 pixels ; pas de débordement horizontal mobile ni d’exception navigateur.

Les cas avancés utilisent des sauvegardes synthétiques pour atteindre rapidement les situations à tester. Le parcours complet est mesuré séparément dans la simulation du moteur.

Les captures `expedition.png`, `preparation.png` et `mobile.png` permettent une vérification visuelle. Le serveur local a aussi répondu HTTP 200 sur le port 8081.

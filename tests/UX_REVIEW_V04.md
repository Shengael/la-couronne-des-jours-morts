# Revue UX V04 — coalition et campagne

Revue du 25 octobre 2026 ; les corrections observées pendant la revue sont distinguées des points encore ouverts.

**Suivi de livraison :** les trois écarts P1 ci-dessous ont été corrigés après cette revue. Le total des cibles automatiques dispose de tests de coût réel ; les régiments en formation portent un libellé explicite ; la progression importée est validée avec la durée accélérée canonique. Les places de doctrines sont affichées, la pause libère une place dans les deux systèmes et le bilan d’absence inclut la coalition. Voir [la validation actuelle](reports/v04-validation.md). Le tableau conserve les reproductions du diagnostic initial.

## Méthode et limites

Lecture croisée de `legion-view.mjs`, `saga-view.mjs`, `frontier-ux.mjs`, `legion.mjs` et `campaign.mjs`. Vérification des textes, attributs des actions et formules correspondantes ; appui sur les 23 tests Légion et intégration réussis au moment de cette revue.

Ce sont des **indicateurs techniques de cohérence**, pas un test de compréhension humaine. Aucun nouveau parcours avec un joueur, contrôle au clavier, lecteur d’écran, ni contrôle visuel mobile n’a été effectué pour ce rapport. Les tests de moteur ne prouvent pas que les informations sont trouvables ou comprises.

## Écarts à traiter en priorité

| Priorité | Observation reproductible | Conséquence et correction proposée |
|---|---|---|
| P1 | Dans `development()`, le coût et la durée affichés proviennent de `legionQuote()` pour une étape, mais le bouton Auto vise trois lots ou deux rangs. Exemple : vampires depuis zéro, Auto → 12, annonce 50 os / 12 fer / 16 herbes ; le programme consomme 150 / 36 / 48 et dure trois étapes, même avec le bonus d’ascension. | Montrer le **total de la cible automatique**, comme les programmes du Royaume initial. Pour les rangs, additionner les devis successifs ; ne pas multiplier le premier coût, car il augmente. Correction en cours par le coordinateur. |
| P1 | Un régiment spécialisé en entraînement reste coché dans `build()`, avec seulement « Formation dans Royaume ». `legionArmy()` l’écarte pourtant dès que sa formation a progressé. | Afficher « En entraînement : absent du prochain combat », et distinguer sélection conservée et disponibilité réelle. Le combat déjà engagé conserve correctement son snapshot. Correction en cours par le coordinateur. |
| P1 technique | Après l’ajout du bonus aux devis Légion, `normalizeLegion()` reconstruit un `holder` sans `saga`. Il valide donc la progression importée contre la durée sans bonus. Exemple chapitre II : progression de recrutement vampire de 30 s acceptée contre 32 s, alors que la tâche réelle ne dure que 32 / 1,35 ≈ 23,70 s ; le travail restant devient négatif et la tâche peut rester bloquée. | Reconstruire le devis avec le nombre d’ascensions validé, y compris dans le normaliseur. Signalé au coordinateur ; relève de la robustesse du moteur plutôt que d’un problème de compréhension. |

## Clarifications utiles

- **P2 — Places de doctrines.** Le texte présente les limites de régiments, sorts et compagnons, mais omet la limite de passifs : un avant le chapitre III, deux ensuite. Afficher places utilisées et plafond près des doctrines évitera de découvrir la règle via un refus générique.
- **P2 — Pause et capacité.** L’aide globale dit qu’une pause garde la place et les personnes. C’est le comportement des tâches historiques ; les programmes Légion en pause libèrent leur emplacement. Harmoniser la règle ou préciser cette différence près de la pause.
- **P2 — Retour hors ligne.** Le moteur fait progresser la Légion hors ligne, mais le bilan `applyOffline()` compte seulement les soldats, sorts et tâches historiques. Mentionner aussi les formations et connaissances de coalition terminées, pour que l’absence ait un résultat identifiable.
- **P2 — Valeurs de soutien.** Les fiches compagnons annoncent leurs pourcentages de base et précisent qu’expérience et formation les renforcent. Une valeur finale calculée rendrait l’effet d’un entraînement directement comparable, sans devoir le déduire des statistiques globales.

## Points cohérents constatés

- Les fonctionnalités restent réparties entre **Monde, Royaume et Armée** ; journal et ascension sont des vues secondaires.
- **Accélération vérifiée sur le code actualisé :** `legionQuote()` divise maintenant la durée nominale par `1 + 0,35 × ascensions`, comme les devis des tâches historiques. `tickLegion()` consomme cette durée réduite ; l’affichage et le travail bénéficient donc du bonus. L’absence de coefficient sur l’appel `tickLegion(s, dt)` n’est pas un défaut. Le premier signalement de revue sur ce point concernait une version antérieure.
- L’interface distingue apprendre/former dans Royaume et équiper dans Armée. Elle ne recrute pas d’armée gratuitement à l’ascension.
- Les sorts avancés décrivent dégâts, mana, recharge et protection ; le seuil d’Aube libre correspond désormais au moteur (75 % des PV).
- La sauvegarde des formations, les capacités partagées, le maintien de la magie à l’ascension, les doctrines appliquées aux unités avancées et l’XP des compagnons du combat courant disposent de tests d’intégration.
- La réouverture des peuples mémorisés exige la reconstruction de l’accueil courant et permet un recrutement payant, sans conserver les anciens effectifs.

Les traits ennemis publics annoncés par le coordinateur restent à examiner après intégration. Ce rapport ne conclut donc rien sur la lisibilité des résistances argentées, du ciblage ou des contre-mesures à venir.

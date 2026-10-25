# Validation — Frontières 0.2

## Mise à jour 0.2.1 — parcours contextuel

**37 tests moteur passent : 23 pour Frontières et 14 pour le prototype historique.** Les trois ajouts contrôlent le gel des explications (sauvegarde et hors ligne compris), l’ordre d’une nouvelle destination après un combat et la correspondance du butin affiché avec la récompense réelle.

`node tests/contextual-browser.cjs` traverse le guide actif : cible réellement éclairée, pause des compteurs, navigation dans Royaume, formation et apprentissage suivis dans leur propre carte, démobilisation explicitée, départ vers une autre zone et combat visible avant les territoires sur écran portrait. Les sept contrôles de ce parcours et les huit contrôles du parcours général passent.

Les captures `contextual-intro.png`, `contextual-task.png`, `contextual-world.png`, `contextual-mobile.png` montrent ces nouveaux états. Le reste du document conserve les mesures de la version initiale.

24 octobre 2026. Tests automatisés et inspection visuelle ; pas une mesure de rythme avec des joueurs.

## Commandes

Depuis `outputs/prototype-couronne/` :

```powershell
node --test tests/*.test.mjs
node tests/frontier-simulate.mjs
node tests/frontier-browser.cjs
```

Les tests navigateur utilisent Playwright et Chrome dans un profil isolé. `PLAYWRIGHT_MODULE` et `CHROME_PATH` permettent de sélectionner les installations. Par défaut, le test cherche le runtime fourni dans cet environnement et Chrome sous Windows.

## Couverture du moteur actuel

Résultat final : **20 tests du moteur Frontières et 14 tests V1 réussis**, ainsi que les huit contrôles du parcours navigateur actuel. Les trois simulations de routes atteignent le bastion.

- Départ sans troupes ni sorts, libération et récompenses uniques.
- Deux formations parallèles, étude et chantier ; attente d’une place supplémentaire.
- Coûts progressifs, répétition bornée et fin de cible.
- Production réelle, affinités, outils et capacité des sites.
- Conservation des effectifs entre travail, armée et formation.
- Réserves, pénurie, pause, annulation, absence de création de ressources à coût nul.
- Formation militaire et instantané du combat déjà engagé.
- Démobilisation sans double attribution ni remboursement.
- Apprentissage distinct de l’équipement d’un sort ; soin effectivement interruptible.
- Hors ligne sans victoire ni progression territoriale, plafond technique et horloge à rebours.
- Sauvegarde partielle, coûts reconstruits depuis les définitions et données incohérentes rejetées.

Les 14 tests V1 concernent le prototype conservé sur `legacy.html`. Ils ne testent pas la nouvelle économie de population.

## Simulations de parcours

Trois parcours partent d’une sauvegarde neuve, sans ressources ajoutées :

| Ordre après le passage | Temps simulé | Victoires | Défaites |
|---|---:|---:|---:|
| Carrière → roseaux → archives → forêt → bastion | 938 s | 19 | 38 |
| Archives → roseaux → carrière → forêt → bastion | 1058 s | 19 | 58 |
| Roseaux → carrière → archives → forêt → bastion | 952 s | 19 | 28 |

Ce sont les résultats d’une politique automatique fixe, pas une durée promise au joueur. Elle réessaie agressivement, y compris pendant les entraînements, et provoque des défaites évitables. Elle doit renforcer l’équipement et adapter sa doctrine au dernier palier. Un joueur peut attendre, farmer ou choisir d’autres investissements.

## Navigateur

Le test traverse réellement : départ, libération, formation automatisée et apprentissage en parallèle, équipement du build, conquête de la carrière, affectation et production. Il vérifie ensuite les gains hors ligne sans combat, un import invalide sans perte de campagne, puis les largeurs 1440, 390 et 320 pixels sans débordement horizontal ni exception navigateur.

Captures : `frontier-world.png`, `frontier-kingdom.png`, `frontier-mobile.png`. Elles montrent des états de test, pas la sauvegarde personnelle de l’utilisateur.

## Limites

Les quatre chapitres, ascensions narratives, spécialistes rares et chaînes de qualité ne sont pas encore implémentés dans cette campagne. La compréhension et le rythme sur une longue session demandent un retour de joueur avant extension.

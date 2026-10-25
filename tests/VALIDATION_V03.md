# Validation — Frontières 0.3

24 octobre 2026. Les chiffres de rythme sont des simulations de prototype, pas des durées de campagne validées avec des joueurs.

## Moteur

`node --test tests/*.test.mjs` : **45 tests réussis**, dont 14 du prototype historique conservé séparément.

Les nouveaux contrôles portent sur les devis et temps cumulés, la limite de qualification de la première région, les conditions réellement exigées pour lancer ou reprendre une progression, l’identité des sources de matériaux, la nécessité des jardins pour une recherche stratégique et la conservation des anciens coûts et qualifications après migration.

## Parcours navigateur

- `node tests/frontier-browser.cjs` : parcours général, économie, sauvegarde et import.
- `node tests/contextual-browser.cjs` : parcours guidé avec temps arrêté et éléments réellement désignés.
- `node tests/stability-browser.cjs` : prologue, gel de lecture, stabilité du panneau et du défilement sur seize échantillons de quatre secondes, alignement à 565 px, absence d’action redondante et devis visibles avant lancement.

Les tests utilisent un profil isolé et des fixtures, sans modifier la sauvegarde personnelle du navigateur. Les captures `v03-prologue.png`, `v03-exploitation.png`, `v03-kingdom.png`, `v03-mobile.png` sont issues de ces fixtures. L’équilibrage des tests de disposition n’est pas présenté comme un parcours de nouvelle partie.

## Nouvelles parties simulées

`node tests/frontier-simulate.mjs` : trois stratégies automatiques partent sans ressources ajoutées ni territoire préaccordé et respectent les nouveaux prérequis.

| Ordre principal | Temps simulé | Victoires | Défaites |
|---|---:|---:|---:|
| Carrière → roseaux → archives → forêt → bastion | 1325 s | 51 | 14 |
| Archives → roseaux → carrière → forêt → bastion | 1535 s | 60 | 22 |
| Roseaux → carrière → archives → forêt → bastion | 995 s | 51 | 4 |

La région comprend dix-neuf victoires uniques ; le reste comprend des victoires de farming. La stratégie peut tenter trop tôt et attendre des ressources : elle démontre qu’il existe plusieurs parcours possibles, pas leur agrément ni leur durée moyenne pour un joueur.

## Sauvegarde fournie

La session fournie a été chargée uniquement dans le modèle en mémoire pour examiner les nouvelles conditions. Les ressources restent identiques et les quatre gardes T4 sont conservés. Aucun import n’a remplacé la partie réelle.

Empreinte SHA-256 du fichier lu : `f73c39701befbe93ae9559d86e79e35c4e89fbda6fbff5c489204b2e3da1f76c`.

Le fichier garde ses valeurs historiques. Tester le nouvel équilibrage depuis ces stocks n’est pas équivalent à tester une nouvelle partie ; l’interface permet de conserver la session et d’exporter avant tout nouvel essai.

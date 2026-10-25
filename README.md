# La Couronne des Jours morts — campagne 0.4

Jeu navigateur incrémental, en français, pour ordinateur et smartphone en portrait. Vous incarnez Néran. Les révélations restent dans le jeu et dans le scénario séparé.

## Jouer

**[Ouvrir le jeu en ligne](https://shengael.github.io/la-couronne-des-jours-morts/)** — ordinateur et smartphone. Pour reprendre une partie locale, exporter sur localhost puis importer sur le site hébergé.

Depuis ce dossier : `npm start`, puis ouvrir http://127.0.0.1:8081/ dans un navigateur. Si le serveur tourne déjà, rafraîchir simplement la page. Le jeu utilise des modules JavaScript : ouvrir le fichier HTML directement ne suffit pas.

La sauvegarde reste locale à ce navigateur, sous `couronne.frontier.v2`. Export et import sont dans la barre latérale. Une ancienne partie est migrée en conservant ses stocks et ses régiments ; sa première migration crée une copie locale `couronne.frontier.v2.pre-campaign-v04`. L’import et la remise à zéro conservent également une copie de secours. Un fichier importé ne reçoit jamais arbitrairement des gains d’absence.

## Contenu jouable

- Quatre chapitres, quarante territoires nommés, routes alternatives, objectifs économiques, libérations, défenses et affrontements de chapitre.
- Trois ascensions uniques, avec récapitulatif avant le retour, connaissances conservées, moyens matériels à reconstruire et reconstruction accélérée. Le quatrième chapitre conduit à une conclusion et un choix d’épilogue.
- Trois écrans principaux : Monde, Armée, Royaume. Prologue et chroniques sont lus en pause ; les aides contextuelles pointent vers les vrais contrôles.
- Populations civiles et militaires, affinités, productions communes de fer et d’herbes, outils, études, qualifications, coûts progressifs et réserves protégées. Les nouveaux territoires économiques augmentent la filière commune sans créer une nouvelle affectation de mineurs à chaque conquête.
- Lots de formation et cibles automatiques ; deux formations, une étude et un chantier partagent leurs places entre toutes les familles de développement. Pause conserve l’avancement et les personnes mais libère une place de travail.
- Trois régiments et deux sorts par build, doctrines, six compagnons à découvrir, troupes spécialisées, artefacts, expérience et équipement personnel. Le build d’un combat est figé au départ ; les changements préparent le suivant.
- Qualifications ordinaires jusqu’à T10 selon les chapitres. Une qualification militaire T11 exceptionnelle exige trois trésors uniques, une formation dédiée et des matériaux ; elle concerne les régiments ordinaires et n’est pas indispensable à la fin.
- Production et tâches pendant l’absence, avec plafond technique de sept jours. Aucun combat hors ligne. Bilan net des ressources, formations et connaissances au retour.

Le combat reste abstrait : effectifs, statistiques, sorts et faits marquants. Les défaites renvoient au farming d’un palier déjà maîtrisé ; elles ne provoquent pas une ascension.

## Vérifier un jalon

`npm run verify` exécute les tests unitaires et d’intégration, trois parcours de navigateur, les parcours complets de campagne et les bots. Résultat dans `tests/reports/v04-validation.md` et son JSON.

Pour un nouveau jalon : `node tests/bots/run.mjs --milestone nom-du-jalon`. Chaque rapport conserve le nom, les empreintes du code, les paramètres, les cas, les observations et les reproductions d’échec. Voir `tests/BOTS.md`.

Les tests navigateur utilisent Playwright et Chrome installés sur cette machine. Les variables `PLAYWRIGHT_MODULE` et `CHROME_PATH` permettent d’adapter ces chemins. Ils travaillent dans des profils isolés et n’importent rien dans la partie ouverte.

## Portée de cette première campagne complète

Le récit est jouable jusqu’à sa fin ; les valeurs économiques constituent un premier équilibrage. Les bots comparent des politiques explicites et ne démontrent pas un plaisir de jeu ou un optimum global. Le parcours économique complet paie ses améliorations sans puissance offerte ; les parcours structurels accélérés sont séparés dans les rapports.

Le monde comporte quarante objectifs écrits, pas une génération infinie. Les défenses utilisent le moteur de combat et le build de l’expédition. Les missions simultanées indépendantes par commandant, les spécialistes civils individuels rares et les chaînes industrielles supplémentaires restent des extensions possibles. Les accords locaux influencent le récit et le bilan politique ; ils ne constituent pas encore une simulation de fiscalité ou de diplomatie.

## Organisation

`campaign.mjs` : économie, combats et sauvegarde ; `saga.mjs` : territoires et récit ; `legion.mjs` : coalition et builds ; `relics.mjs` : trésors exceptionnels ; `frontier.mjs` et modules `*-view.mjs` : interface ; `tests/` : tests et rapports.

L’ancien prototype reste dans `legacy.html` avec sa sauvegarde séparée. Aucun compte, achat ou service distant n’est nécessaire.

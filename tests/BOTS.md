# Bots de jalon

Depuis la racine :

```sh
node tests/bots/run.mjs --milestone v03-baseline
node tests/bots/run.mjs --milestone v03-baseline --model-only
node tests/bots/run.mjs --milestone v03-baseline --ui-only
```

Le nom de jalon est obligatoire et limité aux lettres, chiffres, points, tirets et underscores. La commande écrit un JSON détaillé et un résumé Markdown sans révélations dans `tests/reports/`. Les exécutions partielles ont les suffixes `-model` et `-ui` pour ne pas remplacer un rapport complet. Réexécuter le même jalon remplace ses rapports et captures ; utiliser un nouveau nom pour conserver l’historique. Le code de sortie est 1 si un cas échoue, 2 pour une commande invalide. Les empreintes SHA-256 du code identifient exactement la version examinée.

Le moteur est importé réellement, sans recopier ses règles de calcul. Trois chemins et trois politiques déterministes sont comparés : équilibrée, économie, priorité militaire. Chaque seconde simulée vérifie stocks, population disponible, postes, files et capacités de travail. L’objectif et l’horizon de 7200 secondes concernent uniquement la frontière actuellement jouable ; un moteur de saga devra avoir son propre adaptateur. La politique la plus rapide parmi ces trois essais ne constitue pas un optimum général ni une recommandation d’équilibrage.

Les cas adversariaux couvrent les importations falsifiées, l’absence de mutation du jeu courant, les spécifications de tâches reconstruites, les réserves, pause/annulation, le hors ligne, le recul d’horloge et 450 opérations seedées (`0xC0FFEE`). Si les modules Saga et Légion sont présents, les ponts sont aussi contrôlés : rechargement d’expérience, plafonds du deck partagé dans les deux sens, emplacement de chantier commun et sauvegarde après ascension avec savoir retenu. L’ascension utilise un jalon synthétique pour isoler son contrat : ce n’est pas une traversée de la saga entière. Les erreurs n’arrêtent pas les autres cas. Le champ `repro` et les détails du JSON permettent de rejouer un cas. Une attente du bot peut être erronée : vérifier les règles du jeu avant d’attribuer l’échec au moteur.

Le bot UI utilise Playwright et Chrome. Il cherche `playwright` localement, puis dans le runtime de Node, ou dans `PLAYWRIGHT_MODULE`. `CHROME_PATH` permet de remplacer le chemin Windows de Chrome. Aucun serveur, compte, téléchargement ou accès Internet n’est utilisé : toutes les ressources sont servies par interception depuis le dossier du projet. Chaque largeur (320, 390, 768 et 1440 px) a son contexte navigateur et une sauvegarde synthétique isolée. Les trois écrans sont contrôlés, ainsi que la pause du contexte initial et le refus transactionnel d’un import invalide. Les captures sont des artefacts techniques pouvant contenir des éléments de progression.

À 1440 px, les contrôles étendus vérifient aussi une scène importée avec balises HTML réellement affichées comme texte, sa pause pendant 20 secondes puis sa conservation au rechargement, une formation avancée conservée au rechargement et les lectures d’ascension/conclusion sans progression du temps. Les fixtures isolent ces écrans au moyen de jalons synthétiques validés ; elles ne prouvent pas que tous les chapitres sont atteignables par le combat réel. Le coordinateur complète cette couverture avec son parcours complet. L’horloge navigateur est arrêtée entre les avances explicites ; les fixtures sont injectées après la sauvegarde `pagehide` pour ne pas confondre un comportement normal du navigateur avec un échec d’import.

Les débordements, contrôles hors écran, contrôles sans nom, erreurs JavaScript et accès clavier absent sont des échecs. Les cibles compactes et noms composés uniquement d’un symbole sont des observations à examiner en contexte ; les exceptions d’espacement ne sont pas calculées. Ce contrôle de noms est une heuristique DOM, pas le calcul complet du nom accessible. Les bots ne certifient ni contraste, lecteur d’écran, qualité des textes, compréhension humaine ou agrément de jeu. Prévoir un véritable essai utilisateur à chaque jalon important.

Le coordinateur déclenche explicitement cette commande à chaque jalon. Ces scripts n’installent aucune tâche planifiée et ne corrigent jamais le moteur automatiquement. Une régression devrait être rejouée après sa correction puis conservée dans le harnais ; les rapports d’échec sont utiles et doivent rester honnêtes.

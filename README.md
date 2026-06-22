# URGENCE REB · Serious game COREB

Prototype HTML5 d'un serious game pédagogique pour entraîner les équipes d'urgences à la prise en charge d'un patient suspect de **Risque Épidémique et Biologique (REB)**, conformément à la doctrine [COREB](https://www.coreb.infectiologie.com/) (procédure générique 5 étapes / 10 points-clés, SFMU 2018).

> Outil pédagogique, données fictives. Aucun jugement clinique réel ne doit être tiré de cet outil.

**Démo en ligne** https://jetpod.github.io/urgence-reb-serious-game/

## Aperçu

Deux modules jouables, deux rôles cliniques différents, pour couvrir le parcours du patient suspect REB aux urgences.

### Module 1 · Le Repérage
**Rôle** Infirmier(e) d'accueil et d'orientation (IOA)
**Étapes COREB** 1 · Dépister, 2 · Protéger
**Durée** ≈ 8 min · 6 patients à trier au SAU

Une garde de nuit. Six patients se présentent. Pour chacun, il faut poser les bonnes questions, prendre la bonne décision de classement et équiper patient + soignant. Score sur quatre axes : Vigilance, Protection, Délai, Pratiques.

### Module 2 · La Triade
**Rôle** Médecin sénior aux urgences
**Étapes COREB** 3 · Évaluer, 4 · Traiter, 5 · Alerter, 6 · Classer
**Durée** ≈ 10 min · 3 patients suspects REB

Trois patients déjà classés suspects par l'IOA. Évaluation qSOFA, prescription d'examens et de traitement, construction d'une transmission SBAR (SAED) et déclenchement de la triade COREB (SAMU + Infectiologue référent + ARS/CIRE) dans le bon ordre. Score sur quatre axes : Évaluation, Traitement, Communication SBAR, Triade COREB.

## Stack technique

- HTML5 / CSS3 / JavaScript vanilla, sans framework
- Charte visuelle NutriCellScience (palette emerald / teal, General Sans + Cabinet Grotesk)
- Aucune dépendance externe, aucun build — ouvrez `index.html` dans un navigateur moderne

## Démarrage rapide

```bash
git clone https://github.com/<votre-utilisateur>/urgence-reb-serious-game.git
cd urgence-reb-serious-game
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## Structure du projet

```
urgence-reb-serious-game/
├── index.html       # Écrans : accueil, module 1, module 2, debriefs
├── style.css        # Thème NutriCellScience + responsive (≤ 720 px)
├── game.js          # Logique Module 1 + helpers globaux
├── game2.js         # Logique Module 2
└── README.md
```

## Sources et références pédagogiques

- [COREB · Coordination opérationnelle risque épidémique et biologique](https://www.coreb.infectiologie.com/)
- [SFMU · Procédure générique COREB 10 points (PDF, 2018)](https://www.sfmu.org/upload/consensus/coreb-procgen_180501.pdf)
- [Procédure ARS / ESR (mise à jour 2020)](https://www.coreb.infectiologie.com/UserFiles/File/procedures/20200408-procgenvalidee30mai2018-majars-esr.pdf)
- [SPILF · qSOFA et Sepsis-3](https://www.infectiologie.com/UserFiles/File/spilf/atb/info-antibio/info-antibio-2016-06.pdf)
- [Prévention médicale · Outil SAED / SBAR](https://www.prevention-medicale.org/formations-outils-et-methodes/methodes-de-prevention/Approche-par-processus/sbar)

### Benchmarks serious games hygiène / IAS

- [CPias Normandie · JASPER](https://www.cpias-normandie.org/outils-du-cpias-normandie/jeu-serieux-jasper/serious-game-jasper,6473,14014.html)
- [CPias Occitanie · Itinéraires à risques](https://cpias-occitanie.fr/outils-cpias-occitanie/serious-game-itineraires-a-risques/)
- [Escape COVID-19 (PubMed 33242312)](https://pubmed.ncbi.nlm.nih.gov/33242312/)

## Statut du prototype

Version 0.2 · Modules 1 & 2 fonctionnels.

**À venir** Module 3 « La Filière » (rôle coordination du service, étapes 7 à 10 COREB) : orientation, transport sécurisé, prélèvements en triple emballage, supervision du déshabillage, traçabilité des contacts.

## Licence

[MIT](LICENSE) — utilisation libre y compris pédagogique, à condition de citer la source.

## Crédits

Conception et développement Dr Jean-Etienne Podik · NutriCellScience · 2026.
Toute contribution (issue, pull request, retour d'utilisation en formation) est bienvenue.

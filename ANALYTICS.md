# URGENCE REB · Configuration Plausible

Le jeu utilise le site Plausible existant **jetpod.github.io** (même script que « Garde sous vigilance »). Le script n'est chargé que sur le chemin `/urgence-reb-serious-game/` : les prévisualisations et tests locaux ne sont pas comptabilisés.

## Objectifs à créer dans le compte

Dans Plausible, ouvrir le site **jetpod.github.io**, puis **Settings → Goals → Add goal → Custom event**. Créer les 7 objectifs avec les noms exacts suivants (accents et espaces compris) :

```text
REB Module 1 démarré
REB Module 1 terminé
REB Module 2 démarré
REB Module 2 terminé
REB Module 3 démarré
REB Module 3 terminé
REB Mémo COREB ouvert
```

Les événements ne sont pas rétroactifs : créer les objectifs avant de diffuser le jeu ([documentation Plausible](https://plausible.io/docs/custom-event-goals)).

## Lecture du tableau de bord

- Filtrer les pages sur `/urgence-reb-serious-game/` pour isoler ce jeu des autres applications du domaine.
- Taux de complétion d'un module : total « terminé » / total « démarré », sur la même période.
- Fuseau horaire du site : Europe/Paris.

## Confidentialité

Plausible fonctionne sans cookie ni identifiant persistant ([politique de données](https://plausible.io/data-policy)). Le fichier `analytics.js` applique un schéma fermé : tout événement hors liste est bloqué, l'URL est réduite à l'origine et au chemin, le référent est supprimé. Aucun score, aucune réponse ni aucun identifiant d'apprenant n'est transmis.

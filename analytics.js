/* URGENCE REB · Mesure d'audience Plausible (sans cookie ni identifiant persistant).
   Schéma fermé : seuls les événements listés ci-dessous sont transmis.
   Aucun score individuel, aucune réponse, aucun identifiant d'apprenant.
   Le script Plausible n'est chargé que sur le site public GitHub Pages. */
(() => {
  const ALLOWED = /^(pageview|engagement|REB Module [123] (démarré|terminé)|REB Mémo COREB ouvert)$/;
  const PATH = "/urgence-reb-serious-game/";

  window.plausible = window.plausible || function () { (plausible.q = plausible.q || []).push(arguments); };
  plausible.init = plausible.init || function (i) { plausible.o = i || {}; };
  plausible.init({
    outboundLinks: false,
    fileDownloads: false,
    formSubmissions: false,
    transformRequest(payload) {
      if (!ALLOWED.test(payload.n)) return null;
      payload.u = location.origin + location.pathname;
      payload.r = null;
      delete payload.p;
      delete payload.$;
      return payload;
    }
  });

  if (location.hostname === "jetpod.github.io" && location.pathname.startsWith(PATH)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://plausible.io/js/pa-tStNr5ifi5Ciowo1JXWCY.js";
    document.head.appendChild(s);
  }

  function track(name) {
    if (!ALLOWED.test(name)) return;
    try { if (typeof window.plausible === "function") window.plausible(name); } catch (e) { /* ne jamais bloquer le jeu */ }
  }

  const SCREENS = {
    "screen-game": "REB Module 1 démarré",
    "screen-game2": "REB Module 2 démarré",
    "screen-game3": "REB Module 3 démarré",
    "screen-debrief": "REB Module 1 terminé",
    "screen-debrief2": "REB Module 2 terminé",
    "screen-debrief3": "REB Module 3 terminé"
  };

  // Branché après le chargement des scripts du jeu (showScreen est global, défini dans game.js).
  window.addEventListener("DOMContentLoaded", () => {
    let current = "screen-intro";
    if (typeof window.showScreen === "function") {
      const original = window.showScreen;
      window.showScreen = function (id) {
        const prev = current;
        current = id;
        const r = original.apply(this, arguments);
        if (id !== prev && SCREENS[id]) track(SCREENS[id]);
        return r;
      };
    }
    const cheat = document.getElementById("cheat-toggle");
    if (cheat) cheat.addEventListener("click", () => {
      const panel = document.getElementById("cheat-panel");
      if (panel && !panel.hidden) track("REB Mémo COREB ouvert");
    });
  });

  window.urgenceRebAnalytics = { track, allowed: ALLOWED };
})();

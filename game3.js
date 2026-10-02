// ====================================================================
// URGENCE REB · MODULE 3 · La Filière
// Rôle : Coordination du service (cadre / IDE référent)
// Étapes COREB 7 à 10 · Cellule de crise multitâche
// Scoring : 4 axes × 25 pts = 100 (Sécu bio / Logistique / Contacts / Priorisation)
// ====================================================================

const M3_TOTAL_TIME = 720; // 12 min
const M3_AXIS_MAX = 25;    // cap par axe
const M3_PER_PATIENT_MAX = M3_AXIS_MAX / 3; // env. 8.33 pts par patient par axe

// ====================================================================
// DONNÉES · 3 patients repris du Module 2
// ====================================================================

const M3_PATIENTS = [
  // -----------------------------------------------------------------
  // Mme Diallo · Ebola (FHV) — enjeu Sécu bio + Contacts
  // -----------------------------------------------------------------
  {
    id: "diallo",
    name: "Mme Aïssatou Diallo",
    tag: "Suspect Ebola",
    followDays: 21,
    motif: "Retour RDC (Ituri) J7 · fièvre + diarrhées sanglantes · classée cas possible",
    tasks: {
      // Tâche 1 · Prélèvement (ordonnancement)
      preleve: {
        title: "Sécuriser le prélèvement (étape 7)",
        instruction: "Rangez les 8 étapes dans le bon ordre pour un envoi UN2814 (P620) catégorie A.",
        axis: "secu",
        // Ordre attendu 1..8
        expected: [
          "Contact préalable biologiste et labo de référence.",
          "Prélever sous EPI complet en box dédié.",
          "Décontaminer l'extérieur du tube primaire (SHA + compresse).",
          "Placer dans emballage secondaire étanche + absorbant.",
          "Emballage tertiaire rigide agréé P620.",
          "Étiqueter UN2814, catégorie A, avec fiche COREB.",
          "Transport dédié, tracé, sans intermédiaire.",
          "Accusé de réception et enregistrement."
        ],
        peda: "Sur une FHV, tout retard ou toute rupture de barrière expose durablement la chaîne. Le contact préalable au biologiste conditionne la réception, avant même le premier geste."
      },
      // Tâche 2 · Déshabillage (séquence)
      desha: {
        title: "Superviser le déshabillage EPI (étape 8)",
        instruction: "Placez les 7 gestes de retrait EPI dans l'ordre SF2H.",
        axis: "secu",
        expected: [
          "SHA sur gants encore portés.",
          "Retrait tablier / surblouse par déroulement vers l'extérieur.",
          "Retrait des gants (technique roll-over).",
          "SHA sur mains nues.",
          "Retrait lunettes / écran facial (branches uniquement).",
          "Sortie de la zone, retrait de la FFP2 par les élastiques sans toucher la face avant.",
          "SHA finale + habillage propre."
        ],
        peda: "Le retrait EPI est le moment le plus à risque de contamination. Sur FHV, une seule inversion peut suffire à contaminer le soignant."
      },
      // Tâche 3 · Transport (checklist)
      trans: {
        title: "Organiser le transport (étape 9)",
        instruction: "Cochez les actions obligatoires pour un transport ESR sécurisé. Les distracteurs pénalisent.",
        axis: "logi",
        items: [
          { id: "esr", label: "Confirmer l'accueil de l'ESR de référence (Bichat, Necker, HCL, IHU...).", kind: "mandatory" },
          { id: "brancard", label: "Mobiliser une équipe de brancardage dédiée et formée.", kind: "mandatory" },
          { id: "clean", label: "Planifier le bio-nettoyage du parcours emprunté.", kind: "mandatory" },
          { id: "escorte", label: "Escorte médicale + valise EPI de rechange.", kind: "mandatory" },
          { id: "asc", label: "Ascenseur bloqué pendant le trajet.", kind: "recommended" },
          { id: "services", label: "Prévenir les services traversés (radiologie, blocs).", kind: "recommended" },
          { id: "brancard-dispo", label: "Demander à un brancardier disponible « qui a un moment ».", kind: "trap" },
          { id: "no-direction", label: "Éviter d'informer la direction pour ne pas perdre de temps.", kind: "trap" }
        ],
        peda: "Le transport doit être piloté comme une opération à part entière : équipe dédiée formée, itinéraire sécurisé, bio-nettoyage anticipé, et transparence institutionnelle."
      },
      // Tâche 4 · Contacts (classement A/B/C)
      contacts: {
        title: "Tracer et graduer les contacts (étape 10)",
        instruction: "Attribuez un niveau d'exposition à chaque personne présente autour de la patiente.",
        axis: "contacts",
        people: [
          { id: "ide1", name: "IDE 1 · soins initiaux", detail: "A prodigué 40 min de soins directs sans surblouse ni FFP2 avant classement.", expected: "A" },
          { id: "ao", name: "Aide-soignant AS-1", detail: "A aidé aux changes, EPI incomplet (pas de lunettes).", expected: "A" },
          { id: "med", name: "Médecin urgentiste sénior", detail: "Examen sous EPI complet, distance rapprochée mais brève.", expected: "B" },
          { id: "brancard", name: "Brancardier", detail: "Transfert du hall au box, masque chirurgical seul.", expected: "B" },
          { id: "voisin", name: "Patient voisin (salle d'attente)", detail: "Assis à 3 m, environ 10 min, sans EPI.", expected: "C" },
          { id: "famille", name: "Fils de la patiente", detail: "Contacts prolongés à domicile avant hospitalisation.", expected: "A" },
          { id: "agent", name: "Agent d'accueil", detail: "A distribué un bracelet, contact bref, masque en place.", expected: "C" },
          { id: "menage", name: "Agent de bio-nettoyage", detail: "Intervention post-transfert, EPI complet et formé.", expected: "N" }
        ],
        peda: "Sur une FHV, tout contact étroit A doit être identifié précocement pour un suivi actif de 21 jours. Contacts communautaires : coordination ARS ; soignants : EOH et santé au travail."
      }
    }
  },

  // -----------------------------------------------------------------
  // M. Aroua · Mpox clade I — enjeu Logistique / Priorisation
  // -----------------------------------------------------------------
  {
    id: "aroua",
    name: "M. Karim Aroua",
    tag: "Suspect Mpox I",
    followDays: 21,
    motif: "Retour RDC J10 · lésions vésiculo-pustuleuses · classé cas possible",
    tasks: {
      preleve: {
        title: "Sécuriser le prélèvement (étape 7)",
        instruction: "Rangez les 8 étapes dans le bon ordre pour un cas suspect Mpox (procédure COREB du 24/10/2024).",
        axis: "secu",
        expected: [
          "Contact préalable biologiste et labo de référence.",
          "Prélèvement sous précautions contact + masque de soins, FFP2 et lunettes si risque d'aérosolisation (lésion + écouvillon oropharyngé).",
          "Décontaminer l'extérieur du contenant primaire (SHA + compresse).",
          "Placer dans un sachet étanche 95 kPa avec absorbant.",
          "Emballage tertiaire rigide cartonné (P650).",
          "Étiqueter UN3373, catégorie B, avec fiche de demande.",
          "Acheminement tracé par le circuit habituel du laboratoire (COREB).",
          "Accusé de réception et enregistrement."
        ],
        peda: "Selon la COREB (24/10/2024), un prélèvement de cas suspect ou possible Mpox voyage en triple emballage catégorie B (UN3373). La catégorie A (UN2814) est réservée aux envois au CNR de prélèvements non inactivés de cas confirmés et aux cultures virales."
      },
      desha: {
        title: "Superviser le déshabillage EPI (étape 8)",
        instruction: "Placez les 7 gestes de retrait EPI dans l'ordre SF2H.",
        axis: "secu",
        expected: [
          "SHA sur gants encore portés.",
          "Retrait tablier / surblouse par déroulement vers l'extérieur.",
          "Retrait des gants (technique roll-over).",
          "SHA sur mains nues.",
          "Retrait lunettes / écran facial (branches uniquement).",
          "Sortie de la zone, retrait de la FFP2 par les élastiques sans toucher la face avant.",
          "SHA finale + habillage propre."
        ],
        peda: "Sur Mpox, la contamination se fait surtout par contact avec les lésions et les fluides — le retrait des gants avant le SHA sur mains nues est la clé de voûte."
      },
      trans: {
        title: "Organiser le transport (étape 9)",
        instruction: "Cochez les actions obligatoires. Attention aux pièges.",
        axis: "logi",
        items: [
          { id: "esr", label: "Confirmer l'accueil de l'ESR REB de référence.", kind: "mandatory" },
          { id: "brancard", label: "Mobiliser une équipe de brancardage dédiée et formée.", kind: "mandatory" },
          { id: "clean", label: "Planifier le bio-nettoyage du parcours emprunté.", kind: "mandatory" },
          { id: "escorte", label: "Escorte médicale + valise EPI de rechange.", kind: "mandatory" },
          { id: "masque-patient", label: "Faire porter un masque chirurgical au patient conscient et coopérant.", kind: "recommended" },
          { id: "services", label: "Prévenir les services traversés.", kind: "recommended" },
          { id: "vsl", label: "Utiliser un VSL classique pour aller plus vite.", kind: "trap" },
          { id: "no-drap", label: "Ne pas draper le brancard (gain de temps).", kind: "trap" }
        ],
        peda: "Un VSL n'est pas adapté au transfert d'un patient REB : le transport est organisé avec le SAMU-Centre 15. Le drapage protège l'environnement mobilier et facilite le bio-nettoyage aval."
      },
      contacts: {
        title: "Tracer et graduer les contacts (étape 10)",
        instruction: "Attribuez un niveau d'exposition à chaque personne autour du patient.",
        axis: "contacts",
        people: [
          { id: "med", name: "Médecin urgentiste", detail: "Examen dermatologique rapproché, gants + surblouse, EPI conforme à la fiche COREB.", expected: "B" },
          { id: "ide", name: "IDE d'accueil", detail: "Prise des constantes, EPI complet.", expected: "B" },
          { id: "dermato", name: "Dermatologue en consultation", detail: "Toucher direct des lésions sans gants.", expected: "A" },
          { id: "conjoint", name: "Conjoint du patient", detail: "Cohabitation continue depuis le retour, contacts intimes.", expected: "A" },
          { id: "voisin-attente", name: "Autre patient en salle d'attente", detail: "Assis à 2 m pendant 25 min, masque chirurgical patient absent.", expected: "B" },
          { id: "agent", name: "Agent administratif", detail: "Remise du dossier, à distance, sans contact physique.", expected: "C" },
          { id: "labo", name: "Technicien de laboratoire", detail: "A manipulé le prélèvement en triple emballage conforme, sous PSM.", expected: "N" },
          { id: "friend", name: "Ami hébergé au domicile", detail: "Cohabitation partielle, pas de contact avec lésions.", expected: "B" }
        ],
        peda: "Pour Mpox, l'identification précoce des contacts à risque conditionne la vaccination post-exposition, à proposer idéalement dans les 4 jours et au plus tard 14 jours après le contact (fiche COREB du 18/03/2026). Contacts communautaires : ARS ; soignants : EOH et santé au travail."
      }
    }
  },

  // -----------------------------------------------------------------
  // M. Yılmaz · MERS-CoV — enjeu Sécu bio (air) + Logistique
  // -----------------------------------------------------------------
  {
    id: "yilmaz",
    name: "M. Emre Yılmaz",
    tag: "Suspect MERS-CoV",
    followDays: 14,
    motif: "Retour Arabie Saoudite J5 · pneumopathie hypoxémiante · classé cas possible",
    tasks: {
      preleve: {
        title: "Sécuriser le prélèvement (étape 7)",
        instruction: "Rangez les 8 étapes dans le bon ordre (fiche COREB MERS-CoV du 09/12/2025).",
        axis: "secu",
        expected: [
          "Classement cas possible validé avec l'infectiologue référent REB, contact du laboratoire de l'ESR.",
          "Prélever sous FFP2, surblouse, gants, lunettes : naso-pharyngé + prélèvement profond (aspiration, crachat induit, LBA).",
          "Décontaminer l'extérieur du tube primaire (SHA + compresse).",
          "Placer dans emballage secondaire étanche + absorbant.",
          "Emballage tertiaire rigide cartonné (P650).",
          "Étiqueter UN3373, catégorie B (échantillon clinique), selon consigne du laboratoire de l'ESR.",
          "Acheminement tracé vers le laboratoire de l'ESR.",
          "Accusé de réception et enregistrement."
        ],
        peda: "Selon la fiche COREB du 09/12/2025, associer prélèvement naso-pharyngé et prélèvements profonds. Si les prélèvements réalisés avant J4 sont négatifs, les répéter à partir de J4. Ils peuvent être faits dans l'établissement d'accueil et transférés au laboratoire de l'ESR."
      },
      desha: {
        title: "Superviser le déshabillage EPI (étape 8)",
        instruction: "Placez les 7 gestes de retrait EPI dans l'ordre SF2H.",
        axis: "secu",
        expected: [
          "SHA sur gants encore portés.",
          "Retrait tablier / surblouse par déroulement vers l'extérieur.",
          "Retrait des gants (technique roll-over).",
          "SHA sur mains nues.",
          "Retrait lunettes / écran facial (branches uniquement).",
          "Sortie de la zone, retrait de la FFP2 par les élastiques sans toucher la face avant.",
          "SHA finale + habillage propre."
        ],
        peda: "Sur agent respiratoire, la FFP2 est retirée en dernier, hors de la zone de soins, par les élastiques, après retrait des gants et hygiène des mains. EPI COREB MERS : FFP2, une paire de gants, surblouse, lunettes, tablier si soins mouillants."
      },
      trans: {
        title: "Organiser le transport (étape 9)",
        instruction: "Cochez les actions obligatoires. Attention aux pièges.",
        axis: "logi",
        items: [
          { id: "esr", label: "Confirmer l'accueil de l'ESR de référence (chambre pression négative).", kind: "mandatory" },
          { id: "brancard", label: "Mobiliser une équipe de brancardage dédiée et formée.", kind: "mandatory" },
          { id: "clean", label: "Planifier le bio-nettoyage du parcours emprunté.", kind: "mandatory" },
          { id: "masque-patient", label: "Masque chirurgical au patient (patient conscient, non intubé).", kind: "mandatory" },
          { id: "samu-ars", label: "Transfert vers l'ESR sous la responsabilité du SAMU-Centre 15, ARS informée.", kind: "mandatory" },
          { id: "asc-bloque", label: "Ascenseur bloqué pendant le trajet.", kind: "recommended" },
          { id: "no-oxy", label: "Retirer l'oxygène du patient pour ne pas contaminer.", kind: "trap" },
          { id: "aerosol", label: "Réaliser une aérosolthérapie pendant le transport.", kind: "trap" },
          { id: "escorte", label: "Escorte médicale + valise EPI de rechange.", kind: "mandatory" }
        ],
        peda: "L'aérosolthérapie et les gestes générateurs d'aérosols sont formellement à éviter hors chambre adaptée. Ne jamais retirer une oxygénothérapie utile."
      },
      contacts: {
        title: "Tracer et graduer les contacts (étape 10)",
        instruction: "Attribuez un niveau d'exposition à chaque personne autour du patient.",
        axis: "contacts",
        people: [
          { id: "med-ur", name: "Urgentiste ayant intubé", detail: "Geste générateur d'aérosols, EPI complet + APR filtrant.", expected: "B" },
          { id: "iade", name: "IADE en salle de déchoquage", detail: "Ventilation manuelle 5 min, EPI incomplet (FFP2 mal ajustée).", expected: "A" },
          { id: "ide-tri", name: "IDE de tri", detail: "Contact bref, masque chirurgical seul, patient tousseur.", expected: "A" },
          { id: "voisin", name: "Patient voisin en salle d'attente", detail: "Assis à 1,5 m pendant 35 min, sans masque.", expected: "A" },
          { id: "medico", name: "Médecin traitant vu la veille", detail: "Consultation face à face 20 min sans masque respiratoire.", expected: "A" },
          { id: "brancard", name: "Brancardier post-classement", detail: "Escorte sous EPI complet, patient masqué.", expected: "B" },
          { id: "labo", name: "Technicien de biologie", detail: "Manipulation sous PSM, prélèvement conforme.", expected: "N" },
          { id: "fils", name: "Fils de retour du même voyage", detail: "Voyage commun mais asymptomatique et masqué en cabine.", expected: "C" }
        ],
        peda: "Le MERS-CoV a un R0 modeste mais des super-propagations hospitalières documentées. Toute exposition sans APR à un patient tousseur classe A. Fenêtre de surveillance : 14 jours. Contacts communautaires : ARS ; soignants : EOH et santé au travail."
      }
    }
  }
];

// ====================================================================
// FILE D'APPELS ENTRANTS · programmée
// ====================================================================

const M3_CALLS = [
  { id: "samu",      who: "SAMU · Centre 15",        object: "Confirmer place ESR + créneau brancardage.",           crit: "critical",  spawnAt: 20,  correct: "answer" },
  { id: "biolo",     who: "Biologiste de garde",     object: "Valider mode de prélèvement et acheminement.",         crit: "critical",  spawnAt: 60,  correct: "answer" },
  { id: "direction", who: "Direction générale",      object: "Point de situation cellule de crise.",                 crit: "secondary", spawnAt: 110, correct: "defer" },
  { id: "eoh",       who: "EOH · hygiène",           object: "Confirmer bio-nettoyage + traçage soignants.",         crit: "critical",  spawnAt: 170, correct: "answer" },
  { id: "presse",    who: "Presse locale",           object: "Demande de réaction sur rumeur en ville.",             crit: "noise",     spawnAt: 230, correct: "reject" },
  { id: "infectio",  who: "Infectiologue référent",  object: "Avis complémentaire, ajustement traitement.",          crit: "critical",  spawnAt: 300, correct: "answer" },
  { id: "famille",   who: "Famille patient",         object: "Demande d'informations.",                              crit: "secondary", spawnAt: 380, correct: "defer" },
  { id: "ars",       who: "ARS · CIRE",              object: "Signalement et remontée cas possible.",                crit: "critical",  spawnAt: 460, correct: "answer" }
];

// Points par appel (bonus/malus)
const M3_CALL_POINTS = {
  answer: { critical:  2.2, secondary: -0.5, noise: -1.5 },
  defer:  { critical: -0.8, secondary:  0.8, noise:  0.4 },
  reject: { critical: -2.0, secondary: -0.4, noise:  1.5 }
};

// ====================================================================
// STATE
// ====================================================================

let m3State = null;
let m3TimerHandle = null;
let m3CallHandle = null;

function m3InitState() {
  m3State = window.m3State = {
    startTs: Date.now(),
    elapsed: 0,
    scores: { secu: 0, logi: 0, contacts: 0, prio: 0 },
    perPatient: {}, // patientId -> { taskId -> { done, score, ...} }
    selectedPatient: 0,
    selectedTask: null,
    spawnedCalls: new Set(),
    calls: [], // { id, spawnedAt, resolvedAt, resolution }
    resolved: 0,
    ended: false,
  };
  M3_PATIENTS.forEach((p) => {
    m3State.perPatient[p.id] = {};
    Object.keys(p.tasks).forEach((tk) => {
      m3State.perPatient[p.id][tk] = { done: false };
    });
  });
}

// ====================================================================
// HELPERS DOM
// ====================================================================

const m3$ = (sel) => document.querySelector(sel);
const m3$$ = (sel) => Array.from(document.querySelectorAll(sel));

function m3Fmt(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function m3Toast(msg, kind = "") {
  if (typeof toast === "function") toast(msg, kind);
}

// ====================================================================
// TIMER GLOBAL 12 min
// ====================================================================

function m3StartTimer() {
  m3StopTimer();
  m3TimerHandle = setInterval(() => {
    if (!m3State || m3State.ended) return;
    m3State.elapsed += 1;
    m3UpdateTimerUI();
    m3TickCalls();
    if (m3State.elapsed >= M3_TOTAL_TIME) {
      m3EndModule(true);
    }
  }, 1000);
}

function m3StopTimer() {
  if (m3TimerHandle) { clearInterval(m3TimerHandle); m3TimerHandle = null; }
}

function m3UpdateTimerUI() {
  const remaining = M3_TOTAL_TIME - m3State.elapsed;
  m3$("#m3-timer-value").textContent = m3Fmt(remaining);
  const ring = m3$("#m3-timer-ring-fg");
  if (ring) {
    const pct = (remaining / M3_TOTAL_TIME);
    ring.style.strokeDasharray = `${(pct * 100).toFixed(1)}, 100`;
  }
}

// ====================================================================
// CALLS : spawn + tick + age
// ====================================================================

function m3TickCalls() {
  // Faire naître les nouveaux appels
  M3_CALLS.forEach((def) => {
    if (m3State.elapsed >= def.spawnAt && !m3State.spawnedCalls.has(def.id)) {
      m3State.spawnedCalls.add(def.id);
      m3State.calls.push({
        id: def.id,
        spawnedAt: m3State.elapsed,
        resolvedAt: null,
        resolution: null,
        overduePenalized: false
      });
    }
  });

  // Vérifier les critiques en attente > 90 s
  m3State.calls.forEach((c) => {
    if (c.resolvedAt !== null) return;
    const def = M3_CALLS.find((d) => d.id === c.id);
    if (!def) return;
    const age = m3State.elapsed - c.spawnedAt;
    if (def.crit === "critical" && age > 90 && !c.overduePenalized) {
      c.overduePenalized = true;
      m3State.scores.prio = Math.max(0, m3State.scores.prio - 1.5);
      m3UpdateScoresUI();
      m3Toast("Appel critique différé trop longtemps.", "warn");
    }
  });

  m3RenderCalls();
}

function m3ResolveCall(callId, action) {
  const c = m3State.calls.find((c) => c.id === callId && c.resolvedAt === null);
  if (!c) return;
  const def = M3_CALLS.find((d) => d.id === callId);
  if (!def) return;

  c.resolvedAt = m3State.elapsed;
  c.resolution = action;

  const pts = M3_CALL_POINTS[action][def.crit] || 0;
  m3State.scores.prio = Math.min(M3_AXIS_MAX, Math.max(0, m3State.scores.prio + pts));
  m3State.resolved += 1;

  const ok = def.correct === action;
  const label = { answer: "Répondu", defer: "Différé", reject: "Rejeté" }[action] || action;
  m3Toast(`${def.who} · ${label}${ok ? " · +" : " · "}${pts > 0 ? "+" : ""}${pts.toFixed(1)} pt`, ok ? "ok" : "warn");

  m3UpdateScoresUI();
  m3RenderCalls();
  m3CheckEndAvailability();
}

function m3RenderCalls() {
  const list = m3$("#m3-call-list");
  if (!list) return;
  const pending = m3State.calls.filter((c) => c.resolvedAt === null);
  m3$("#m3-calls-count").textContent = `${pending.length} en attente`;

  if (pending.length === 0) {
    list.innerHTML = `<div class="m3-call-empty">Ligne calme. Les appels arrivent quand la garde s'accélère.</div>`;
    return;
  }

  list.innerHTML = pending.map((c) => {
    const def = M3_CALLS.find((d) => d.id === c.id);
    const age = m3State.elapsed - c.spawnedAt;
    const ageWarn = def.crit === "critical" && age > 60;
    return `
      <div class="m3-call m3-call-${def.crit}" data-call="${c.id}">
        <div class="m3-call-header">
          <div class="m3-call-who">${def.who}</div>
          <div class="m3-call-age ${ageWarn ? "m3-call-age-warn" : ""}">+${m3Fmt(age)}</div>
        </div>
        <div class="m3-call-object">${def.object}</div>
        <div class="m3-call-actions">
          <button class="m3-call-btn m3-call-btn-answer" data-action="answer">Répondre</button>
          <button class="m3-call-btn m3-call-btn-defer" data-action="defer">Différer</button>
          <button class="m3-call-btn m3-call-btn-reject" data-action="reject">Rejeter</button>
        </div>
      </div>
    `;
  }).join("");

  m3$$("#m3-call-list .m3-call-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const call = e.target.closest("[data-call]");
      if (!call) return;
      m3ResolveCall(call.dataset.call, btn.dataset.action);
    });
  });
}

// ====================================================================
// UI · scores + progression
// ====================================================================

function m3UpdateScoresUI() {
  const round = (v) => Math.round(v * 10) / 10;
  m3$("#m3-score-secu").textContent = round(m3State.scores.secu);
  m3$("#m3-score-logi").textContent = round(m3State.scores.logi);
  m3$("#m3-score-contacts").textContent = round(m3State.scores.contacts);
  m3$("#m3-score-prio").textContent = round(m3State.scores.prio);
}

function m3TasksDone() {
  let n = 0;
  Object.values(m3State.perPatient).forEach((pt) => {
    Object.values(pt).forEach((t) => { if (t.done) n += 1; });
  });
  return n;
}

function m3UpdateProgress() {
  const done = m3TasksDone();
  m3$("#m3-tasks-done").textContent = done;
  m3$("#m3-progress-fill").style.width = (done / 12 * 100) + "%";
  m3CheckEndAvailability();
}

function m3CheckEndAvailability() {
  // Toutes les tâches faites OU délai écoulé permet de terminer.
  const done = m3TasksDone();
  m3$("#m3-btn-end").disabled = !(done >= 12);
}

// ====================================================================
// UI · patients + tâches
// ====================================================================

const TASK_KEYS = ["preleve", "desha", "trans", "contacts"];
const TASK_LABELS = {
  preleve: "Prélèvement",
  desha: "Déshabillage",
  trans: "Transport",
  contacts: "Contacts"
};

function m3RenderPatientList() {
  const list = m3$("#m3-patient-list");
  list.innerHTML = "";
  M3_PATIENTS.forEach((p, idx) => {
    const state = m3State.perPatient[p.id];
    const doneCount = Object.values(state).filter((t) => t.done).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "m3-patient-card" + (idx === m3State.selectedPatient ? " m3-patient-active" : "") + (doneCount === 4 ? " m3-patient-done" : "");
    btn.innerHTML = `
      <div class="m3-patient-name">${p.name}</div>
      <span class="m3-patient-tag">${p.tag}</span>
      <div class="m3-patient-progress">
        ${TASK_KEYS.map((k) => `<span class="m3-patient-progress-dot ${state[k].done ? "m3-done" : ""}" title="${TASK_LABELS[k]}"></span>`).join("")}
      </div>
    `;
    btn.addEventListener("click", () => {
      m3State.selectedPatient = idx;
      m3State.selectedTask = null;
      m3RenderPatientList();
      m3RenderActionPanel();
    });
    list.appendChild(btn);
  });
}

function m3RenderActionPanel() {
  const p = M3_PATIENTS[m3State.selectedPatient];
  m3$("#m3-selected-name").textContent = p.name;
  m3$("#m3-selected-motif").textContent = p.motif;

  // Tabs
  const tabs = m3$("#m3-task-tabs");
  tabs.innerHTML = "";
  TASK_KEYS.forEach((k) => {
    const done = m3State.perPatient[p.id][k].done;
    const active = m3State.selectedTask === k;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "m3-task-tab" + (active ? " m3-task-tab-active" : "") + (done ? " m3-task-tab-done" : "");
    b.textContent = TASK_LABELS[k];
    b.addEventListener("click", () => {
      m3State.selectedTask = k;
      m3RenderActionPanel();
    });
    tabs.appendChild(b);
  });

  const body = m3$("#m3-task-body");
  if (!m3State.selectedTask) {
    body.innerHTML = `<div class="m3-empty">Sélectionnez une tâche pour ce patient.</div>`;
    return;
  }
  const taskDef = p.tasks[m3State.selectedTask];
  const taskState = m3State.perPatient[p.id][m3State.selectedTask];

  if (taskState.done) {
    m3RenderTaskFeedback(body, p, m3State.selectedTask, taskState, taskDef);
    return;
  }

  // Router vers le bon mini-jeu
  switch (m3State.selectedTask) {
    case "preleve":  m3RenderOrder(body, p, "preleve", taskDef);  break;
    case "desha":    m3RenderSequence(body, p, "desha", taskDef); break;
    case "trans":    m3RenderChecklist(body, p, "trans", taskDef); break;
    case "contacts": m3RenderContacts(body, p, "contacts", taskDef); break;
  }
}

// ====================================================================
// MINI-JEU 1 · ORDRE (prélèvement)
// ====================================================================

function m3RenderOrder(body, p, taskId, taskDef) {
  const key = `order_${p.id}_${taskId}`;
  if (!m3State[key]) {
    m3State[key] = m3Shuffle(taskDef.expected.slice());
  }
  const list = m3State[key];

  body.innerHTML = `
    <div class="m3-task-title">${taskDef.title}</div>
    <div class="m3-task-instruction">${taskDef.instruction}</div>
    <ol class="m3-order-list">
      ${list.map((label, i) => `
        <li class="m3-order-item">
          <span class="m3-order-num">${i + 1}</span>
          <span class="m3-order-label">${label}</span>
          <span class="m3-order-controls">
            <button class="m3-order-btn" data-move="up"   data-i="${i}" ${i === 0 ? "disabled" : ""} aria-label="Monter">▲</button>
            <button class="m3-order-btn" data-move="down" data-i="${i}" ${i === list.length - 1 ? "disabled" : ""} aria-label="Descendre">▼</button>
          </span>
        </li>
      `).join("")}
    </ol>
    <button class="btn btn-primary m3-task-validate" data-validate-order="${taskId}">Valider l'ordre</button>
  `;

  body.querySelectorAll(".m3-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.i, 10);
      const move = btn.dataset.move;
      const arr = m3State[key];
      if (move === "up" && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      if (move === "down" && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
      m3RenderActionPanel();
    });
  });

  body.querySelector("[data-validate-order]").addEventListener("click", () => {
    const user = m3State[key];
    let correct = 0;
    for (let i = 0; i < taskDef.expected.length; i += 1) {
      if (user[i] === taskDef.expected[i]) correct += 1;
    }
    const ratio = correct / taskDef.expected.length;
    const points = Math.round(ratio * M3_PER_PATIENT_MAX * 10) / 10;
    m3State.scores[taskDef.axis] = Math.min(M3_AXIS_MAX, m3State.scores[taskDef.axis] + points);
    m3State.perPatient[p.id][taskId] = {
      done: true,
      score: points,
      correct, total: taskDef.expected.length,
      userAnswer: user.slice()
    };
    m3UpdateScoresUI();
    m3UpdateProgress();
    m3RenderPatientList();
    m3RenderActionPanel();
    m3Toast(`Prélèvement validé · ${correct}/${taskDef.expected.length} corrects · +${points} pt`, ratio >= 0.7 ? "ok" : "warn");
  });
}

// ====================================================================
// MINI-JEU 2 · SÉQUENCE (déshabillage) — clic dans l'ordre
// ====================================================================

function m3RenderSequence(body, p, taskId, taskDef) {
  const key = `seq_${p.id}_${taskId}`;
  const poolKey = key + "_pool";
  if (!m3State[key]) {
    m3State[key] = [];
    m3State[poolKey] = m3Shuffle(taskDef.expected.slice());
  }
  const seq = m3State[key];
  const pool = m3State[poolKey];

  const N = taskDef.expected.length;
  body.innerHTML = `
    <div class="m3-task-title">${taskDef.title}</div>
    <div class="m3-task-instruction">${taskDef.instruction} Cliquez les gestes dans l'ordre attendu.</div>
    <div class="m3-seq-slots">
      ${Array.from({ length: N }, (_, i) => `
        <div class="m3-seq-slot ${seq[i] ? "m3-seq-slot-filled" : ""}">
          <span class="m3-seq-slot-num">${i + 1}</span>
          <span class="m3-seq-slot-label ${seq[i] ? "" : "m3-seq-slot-label-empty"}">${seq[i] || "— à placer"}</span>
          ${seq[i] ? `<button class="m3-seq-slot-clear" data-clear="${i}" aria-label="Retirer">×</button>` : ""}
        </div>
      `).join("")}
    </div>
    <div class="m3-seq-pool">
      ${pool.map((label) => `
        <button class="m3-seq-chip" data-chip="${escapeHtml(label)}" ${seq.includes(label) ? "disabled" : ""}>${label}</button>
      `).join("")}
    </div>
    <button class="btn btn-primary m3-task-validate" data-validate-seq="${taskId}" ${seq.filter(Boolean).length !== N ? "disabled" : ""}>Valider la séquence</button>
  `;

  body.querySelectorAll("[data-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const label = chip.dataset.chip;
      const nextEmpty = seq.findIndex((v) => !v);
      const idx = nextEmpty === -1 ? seq.length : nextEmpty;
      if (idx >= N) return;
      seq[idx] = label;
      m3RenderActionPanel();
    });
  });

  body.querySelectorAll("[data-clear]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.dataset.clear, 10);
      seq[i] = undefined;
      m3RenderActionPanel();
    });
  });

  const validate = body.querySelector("[data-validate-seq]");
  if (validate) {
    validate.addEventListener("click", () => {
      let correct = 0;
      for (let i = 0; i < N; i += 1) if (seq[i] === taskDef.expected[i]) correct += 1;
      const ratio = correct / N;
      const points = Math.round(ratio * M3_PER_PATIENT_MAX * 10) / 10;
      m3State.scores[taskDef.axis] = Math.min(M3_AXIS_MAX, m3State.scores[taskDef.axis] + points);
      m3State.perPatient[p.id][taskId] = {
        done: true, score: points,
        correct, total: N,
        userAnswer: seq.slice()
      };
      m3UpdateScoresUI();
      m3UpdateProgress();
      m3RenderPatientList();
      m3RenderActionPanel();
      m3Toast(`Séquence EPI validée · ${correct}/${N} corrects · +${points} pt`, ratio >= 0.7 ? "ok" : "warn");
    });
  }
}

// ====================================================================
// MINI-JEU 3 · CHECKLIST (transport)
// ====================================================================

function m3RenderChecklist(body, p, taskId, taskDef) {
  const key = `check_${p.id}_${taskId}`;
  if (!m3State[key]) m3State[key] = new Set();
  const checked = m3State[key];

  body.innerHTML = `
    <div class="m3-task-title">${taskDef.title}</div>
    <div class="m3-task-instruction">${taskDef.instruction}</div>
    <div class="m3-check-list">
      ${taskDef.items.map((it) => `
        <label class="m3-check-item ${checked.has(it.id) ? "m3-checked" : ""}" data-item="${it.id}">
          <input type="checkbox" ${checked.has(it.id) ? "checked" : ""}>
          <span class="m3-check-label">${it.label}</span>
        </label>
      `).join("")}
    </div>
    <button class="btn btn-primary m3-task-validate" data-validate-check="${taskId}">Valider la checklist</button>
  `;

  body.querySelectorAll("[data-item]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return; // laisse le change native
      const id = row.dataset.item;
      if (checked.has(id)) checked.delete(id); else checked.add(id);
      m3RenderActionPanel();
    });
    row.querySelector("input").addEventListener("change", () => {
      const id = row.dataset.item;
      if (row.querySelector("input").checked) checked.add(id); else checked.delete(id);
      m3RenderActionPanel();
    });
  });

  body.querySelector("[data-validate-check]").addEventListener("click", () => {
    let good = 0, missed = 0, trapped = 0, recos = 0;
    const total = taskDef.items.filter((it) => it.kind === "mandatory").length;
    taskDef.items.forEach((it) => {
      const isChecked = checked.has(it.id);
      if (it.kind === "mandatory" && isChecked) good += 1;
      if (it.kind === "mandatory" && !isChecked) missed += 1;
      if (it.kind === "recommended" && isChecked) recos += 1;
      if (it.kind === "trap" && isChecked) trapped += 1;
    });
    const base = (good / total) * M3_PER_PATIENT_MAX;
    const bonus = Math.min(0.8, recos * 0.3);
    const penalty = trapped * 1.4;
    const points = Math.max(0, Math.round((base + bonus - penalty) * 10) / 10);
    m3State.scores[taskDef.axis] = Math.min(M3_AXIS_MAX, m3State.scores[taskDef.axis] + points);
    m3State.perPatient[p.id][taskId] = {
      done: true, score: points,
      good, missed, trapped, recos,
      userAnswer: Array.from(checked)
    };
    m3UpdateScoresUI();
    m3UpdateProgress();
    m3RenderPatientList();
    m3RenderActionPanel();
    m3Toast(`Transport validé · ${good}/${total} obligatoires · +${points} pt`, missed + trapped === 0 ? "ok" : "warn");
  });
}

// ====================================================================
// MINI-JEU 4 · CONTACTS (classement A/B/C/N)
// ====================================================================

const LEVEL_LABELS = {
  A: "Étroit A",
  B: "Occasionnel B",
  C: "Faible C",
  N: "Non-contact"
};

function m3RenderContacts(body, p, taskId, taskDef) {
  const key = `contacts_${p.id}_${taskId}`;
  if (!m3State[key]) m3State[key] = {};
  const answers = m3State[key];

  body.innerHTML = `
    <div class="m3-task-title">${taskDef.title}</div>
    <div class="m3-task-instruction">${taskDef.instruction}</div>
    <div class="m3-contact-list">
      ${taskDef.people.map((person) => `
        <div class="m3-contact-row" data-person="${person.id}">
          <div class="m3-contact-name">
            <strong>${person.name}</strong>
            <div class="m3-contact-detail">${person.detail}</div>
          </div>
          <div class="m3-contact-levels">
            ${["A", "B", "C", "N"].map((lvl) => `
              <button class="m3-contact-level ${answers[person.id] === lvl ? "m3-level-active" : ""}" data-level="${lvl}">${lvl}</button>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
    <div class="m3-task-instruction" style="font-size:0.78rem;">A · étroit · B · occasionnel · C · faible · N · non-contact</div>
    <button class="btn btn-primary m3-task-validate" data-validate-contacts="${taskId}" ${Object.keys(answers).length < taskDef.people.length ? "disabled" : ""}>Valider les contacts</button>
  `;

  body.querySelectorAll(".m3-contact-row").forEach((row) => {
    const pid = row.dataset.person;
    row.querySelectorAll(".m3-contact-level").forEach((btn) => {
      btn.addEventListener("click", () => {
        answers[pid] = btn.dataset.level;
        m3RenderActionPanel();
      });
    });
  });

  const v = body.querySelector("[data-validate-contacts]");
  if (v) {
    v.addEventListener("click", () => {
      let correct = 0, missedA = 0, wrongA = 0;
      taskDef.people.forEach((person) => {
        const got = answers[person.id];
        if (got === person.expected) correct += 1;
        if (person.expected === "A" && got !== "A") missedA += 1;
        if (got === "A" && person.expected !== "A") wrongA += 1;
      });
      const N = taskDef.people.length;
      const ratio = correct / N;
      let points = ratio * M3_PER_PATIENT_MAX;
      // Bonus si 100% des A trouvés (missedA == 0)
      if (missedA === 0) points += 0.5;
      // Malus par contact A manqué
      points -= missedA * 0.6;
      points = Math.max(0, Math.round(points * 10) / 10);
      m3State.scores[taskDef.axis] = Math.min(M3_AXIS_MAX, m3State.scores[taskDef.axis] + points);
      m3State.perPatient[p.id][taskId] = {
        done: true, score: points,
        correct, total: N, missedA, wrongA,
        userAnswer: { ...answers }
      };
      m3UpdateScoresUI();
      m3UpdateProgress();
      m3RenderPatientList();
      m3RenderActionPanel();
      m3Toast(`Contacts classés · ${correct}/${N} · +${points} pt${missedA > 0 ? ` · ${missedA} contact(s) A manqué(s)` : ""}`, missedA === 0 ? "ok" : "warn");
    });
  }
}

// ====================================================================
// FEEDBACK APRÈS TÂCHE (récapitulatif dans la même tab)
// ====================================================================

function m3RenderTaskFeedback(body, p, taskId, state, taskDef) {
  let detail = "";
  if (taskId === "preleve" || taskId === "desha") {
    const lines = taskDef.expected.map((label, i) => {
      const got = (state.userAnswer && state.userAnswer[i]) || "—";
      const ok = got === label;
      return `<li class="${ok ? "fb-ok" : "fb-ko"}">${i + 1}. ${label}${ok ? "" : ` <span style="opacity:0.7">· votre choix : ${got}</span>`}</li>`;
    });
    detail = `<ul class="fb-list">${lines.join("")}</ul>`;
  } else if (taskId === "trans") {
    const lines = [];
    if (state.missed > 0) lines.push(`<li class="fb-ko">${state.missed} action(s) obligatoire(s) manquée(s)</li>`);
    if (state.trapped > 0) lines.push(`<li class="fb-ko">${state.trapped} piège(s) coché(s)</li>`);
    if (state.recos > 0) lines.push(`<li class="fb-ok">${state.recos} action(s) recommandée(s) cochée(s)</li>`);
    if (lines.length === 0) lines.push(`<li class="fb-ok">Sans faute — checklist maîtrisée.</li>`);
    detail = `<ul class="fb-list">${lines.join("")}</ul>`;
  } else if (taskId === "contacts") {
    const lines = [`<li class="${state.correct === state.total ? "fb-ok" : "fb-warn"}">Classement correct sur ${state.correct} / ${state.total} personnes.</li>`];
    if (state.missedA > 0) lines.push(`<li class="fb-ko">${state.missedA} contact(s) étroit(s) A manqué(s) — impact sur le suivi de ${p.followDays} j.</li>`);
    if (state.wrongA > 0) lines.push(`<li class="fb-warn">${state.wrongA} contact(s) surclassé(s) A à tort.</li>`);
    detail = `<ul class="fb-list">${lines.join("")}</ul>`;
  }

  body.innerHTML = `
    <div class="m3-task-title">${taskDef.title}</div>
    <div class="m3-task-instruction">Tâche validée · <strong>+${state.score} pt</strong> sur l'axe <em>${axisLabel(taskDef.axis)}</em>.</div>
    <div class="m3-task-feedback">
      <div class="m3-task-feedback-title">Récapitulatif</div>
      <div class="m3-task-feedback-body">${detail}</div>
    </div>
    <div class="m3-task-feedback" style="margin-top:8px; border-color: var(--c-accent); background: var(--c-primary-light);">
      <div class="m3-task-feedback-title">Note pédagogique</div>
      <div class="m3-task-feedback-body">${taskDef.peda}</div>
    </div>
  `;
}

function axisLabel(a) {
  return { secu: "Sécu bio", logi: "Logistique", contacts: "Contacts", prio: "Priorisation" }[a] || a;
}

// ====================================================================
// UTILS
// ====================================================================

function m3Shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ====================================================================
// ENTRY / EXIT
// ====================================================================

function startModule3() {
  m3InitState();
  if (typeof setCheat === "function") setCheat(3);
  m3RenderPatientList();
  m3State.selectedTask = "preleve"; // ouvre par défaut la 1re tâche
  m3RenderActionPanel();
  m3RenderCalls();
  m3UpdateScoresUI();
  m3UpdateProgress();
  m3UpdateTimerUI();
  showScreen("screen-game3");
  m3StartTimer();
}
window.startModule3 = startModule3;
window.M3_PATIENTS = M3_PATIENTS;

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "m3-btn-quit") {
    if (!m3State || m3State.ended) return;
    if (confirm("Quitter la cellule de crise et perdre la partie en cours ?")) {
      m3StopTimer();
      m3State.ended = true;
      if (typeof setCheat === "function") setCheat(null);
      showScreen("screen-intro");
    }
  }
  if (e.target && e.target.id === "m3-btn-end") {
    m3EndModule(false);
  }
  if (e.target && e.target.id === "m3-btn-restart") {
    if (typeof setCheat === "function") setCheat(null);
    showScreen("screen-intro");
  }
  if (e.target && e.target.id === "m3-btn-replay") {
    startModule3();
  }
});

// ====================================================================
// DEBRIEF FIN DE MODULE
// ====================================================================

function m3EndModule(fromTimeout) {
  if (!m3State || m3State.ended) return;
  m3State.ended = true;
  m3StopTimer();

  // Bonus terminaison rapide : si finalisé avant 10 min et 100% tâches faites, +2 sur prio
  const done = m3TasksDone();
  const timeUsed = m3State.elapsed;
  if (!fromTimeout && done === 12 && timeUsed < 600) {
    m3State.scores.prio = Math.min(M3_AXIS_MAX, m3State.scores.prio + 2);
  }

  const cap = (v) => Math.min(M3_AXIS_MAX, Math.round(v * 10) / 10);
  const capped = {
    secu: cap(m3State.scores.secu),
    logi: cap(m3State.scores.logi),
    contacts: cap(m3State.scores.contacts),
    prio: cap(m3State.scores.prio)
  };
  const total = Math.round(capped.secu + capped.logi + capped.contacts + capped.prio);

  m3$("#m3-total-score").textContent = total;
  m3$("#m3-val-secu").textContent = `${capped.secu}/25`;
  m3$("#m3-val-logi").textContent = `${capped.logi}/25`;
  m3$("#m3-val-contacts").textContent = `${capped.contacts}/25`;
  m3$("#m3-val-prio").textContent = `${capped.prio}/25`;
  m3$("#m3-bar-secu").style.width = (capped.secu / M3_AXIS_MAX * 100) + "%";
  m3$("#m3-bar-logi").style.width = (capped.logi / M3_AXIS_MAX * 100) + "%";
  m3$("#m3-bar-contacts").style.width = (capped.contacts / M3_AXIS_MAX * 100) + "%";
  m3$("#m3-bar-prio").style.width = (capped.prio / M3_AXIS_MAX * 100) + "%";

  let grade = "À reprendre — relire la procédure COREB annexe ARS/ESR.";
  if (total >= 85) grade = "Excellent — coordination REB maîtrisée, prêt pour rôle de cadre référent.";
  else if (total >= 70) grade = "Bon niveau — quelques points d'amélioration sur la priorisation ou les contacts.";
  else if (total >= 50) grade = "Niveau correct — formation complémentaire recommandée avant exercice réel.";
  m3$("#m3-score-grade").textContent = grade;

  // Badges
  const badges = [];
  if (capped.secu >= 22) badges.push({ icon: "◈", label: "Emballage impeccable", desc: "Sécu bio ≥ 22 sur les 3 patients." });
  if (capped.prio >= 22) badges.push({ icon: "▲", label: "Aiguilleur du ciel", desc: "Priorisation ≥ 22." });
  // Zéro A manqué
  let allAFound = true;
  M3_PATIENTS.forEach((p) => {
    const s = m3State.perPatient[p.id].contacts;
    if (!s || !s.done || s.missedA > 0) allAFound = false;
  });
  if (allAFound) badges.push({ icon: "○", label: "Filet à contacts", desc: "Zéro contact étroit A manqué sur les 3 patients." });
  if (total >= 85) badges.push({ icon: "★", label: "Coordinateur REB", desc: "Score total ≥ 85 / 100." });

  const badgesEl = m3$("#m3-badges-earned");
  badgesEl.innerHTML = "";
  badges.forEach((b) => {
    const c = document.createElement("div");
    c.className = "badge-card";
    c.innerHTML = `<div class="badge-icon">${b.icon}</div><div class="badge-label">${b.label}</div><div class="badge-desc">${b.desc}</div>`;
    badgesEl.appendChild(c);
  });
  if (badges.length === 0) {
    badgesEl.innerHTML = `<div class="badge-empty">Aucun badge cette session — relancez le module pour progresser.</div>`;
  }

  // Détail par patient
  const replay = m3$("#m3-replay-list");
  replay.innerHTML = "";
  M3_PATIENTS.forEach((p, idx) => {
    const st = m3State.perPatient[p.id];
    const rows = TASK_KEYS.map((k) => {
      const s = st[k];
      if (!s.done) return `<div class="fb-ko">${TASK_LABELS[k]} · non traité</div>`;
      return `<div class="fb-ok">${TASK_LABELS[k]} · +${s.score} pt</div>`;
    }).join("");
    const item = document.createElement("div");
    item.className = "replay-item";
    item.innerHTML = `
      <div class="replay-head">
        <span class="replay-num">${idx + 1}</span>
        <span class="replay-name">${p.name} · ${p.tag}</span>
      </div>
      <div class="replay-detail" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;">${rows}</div>
    `;
    replay.appendChild(item);
  });

  if (typeof setCheat === "function") setCheat(null);
  showScreen("screen-debrief3");
}

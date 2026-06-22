// ====================================================================
// URGENCE REB · MODULE 2 · La Triade
// Rôle : Médecin sénior aux urgences
// Phases : qSOFA → Examens/Tt → SBAR → Triade → Classement → Feedback
// ====================================================================

const M2_PATIENT_TIME = 90; // secondes
const M2_PER_AXIS_MAX = 25; // 4 axes × 25 = 100
// Par patient : 25/3 ≈ 8.33 pts max par axe
const M2_PER_PATIENT = M2_PER_AXIS_MAX / 3;

// ====================================================================
// DONNÉES PATIENTS
// ====================================================================

const M2_PATIENTS = [
  // -----------------------------------------------------------------
  // Patient 1 — Mme Diallo · suspicion Ebola
  // -----------------------------------------------------------------
  {
    id: "diallo",
    name: "Mme Aïssatou Diallo",
    age: "34 ans · F",
    avatar: "D",
    arrivee: "23h45",
    motif: "Fièvre 39,4 °C + diarrhées, retour Guinée J7",
    context: "Suspicion REB déjà confirmée par l'IOA. Patiente isolée en box dédié, EPI complets en place. Vous prenez le relais en tant que médecin sénior.",
    vitals: {
      "TA": "98 / 56 mmHg",
      "FC": "118 / min",
      "FR": "24 / min",
      "SpO₂": "95 % air",
      "T°": "39,4 °C",
      "Glasgow": "15"
    },
    quote: "Je me sens vraiment faible. Hier soir, j'ai eu un peu de sang dans les selles. J'ai aussi très mal au ventre.",
    // qSOFA attendu
    qsofa: { tas: true, fr: true, conf: false },
    qsofaExpected: 2,
    // Examens : id → { label, kind:'utile'|'inutile'|'piege', explain }
    examens: [
      { id: "hemoc-isolement", label: "Hémocultures aérobie + anaérobie sous EPI", kind: "utile", explain: "Recherche bactériémie/co-infection — prélèvement sous EPI, étiquetage REB." },
      { id: "frottis-palu", label: "Frottis + goutte épaisse paludisme", kind: "utile", explain: "Diagnostic différentiel n°1 au retour de zone tropicale fébrile." },
      { id: "nfs-iono-tp", label: "NFS, ionogramme, créatinine, BH, TP/TCA, lactates", kind: "utile", explain: "Évaluation de la gravité, retentissement viscéral, coagulopathie." },
      { id: "rt-pcr-ebola", label: "RT-PCR Ebola via labo de confiance / CNR", kind: "utile", explain: "Diagnostic spécifique. Prélèvement en triple emballage, transport tracé." },
      { id: "scanner-tap-systematique", label: "Scanner TAP en imagerie ouverte (systématique)", kind: "piege", explain: "Risque de contamination du plateau d'imagerie. À discuter au cas par cas, jamais sans concertation." },
      { id: "edn-urgentes", label: "Endoscopie digestive haute en urgence", kind: "inutile", explain: "Hors filière, retarde la prise en charge, expose des soignants supplémentaires." }
    ],
    examensExpected: ["hemoc-isolement", "frottis-palu", "nfs-iono-tp", "rt-pcr-ebola"],
    treatments: [
      { id: "rea-cristalloides", label: "Remplissage cristalloïdes prudent (500 mL bolus, réévaluation)", kind: "utile", explain: "Correction de l'hypovolémie sur diarrhées + sepsis débutant." },
      { id: "atb-large-spectre", label: "Antibiothérapie probabiliste large spectre (C3G + doxycycline)", kind: "utile", explain: "Couverture sepsis bactérien, en attente d'orientation diagnostique." },
      { id: "antipal-empirique", label: "Antipaludique présomptif (artésunate IV) en concertation", kind: "utile", explain: "Selon recommandations OMS si paludisme à P. falciparum très probable." },
      { id: "corticoides-fortes-doses", label: "Corticoïdes à fortes doses d'emblée", kind: "piege", explain: "Pas de bénéfice démontré, peut aggraver une fièvre hémorragique virale." },
      { id: "aspirine-fievre", label: "Aspirine pour la fièvre", kind: "inutile", explain: "Aggrave le risque hémorragique chez un patient suspect FHV." }
    ],
    treatmentsExpected: ["rea-cristalloides", "atb-large-spectre", "antipal-empirique"],
    // SBAR : pour chaque rubrique, options [bonne, moyenne, mauvaise]
    sbar: {
      situation: [
        { id: "s-bonne", label: "Patiente de 34 ans, suspecte REB type FHV (Ebola), arrivée 23h45, fièvre 39,4 °C + diarrhées sanglantes au retour de Guinée à J7.", quality: "bonne" },
        { id: "s-moy", label: "J'ai une dame qui revient d'Afrique avec de la fièvre, ça m'a l'air bizarre.", quality: "moy" },
        { id: "s-mauv", label: "Bonjour, on a une patiente, je vous appelle juste pour avoir votre avis quand vous pourrez.", quality: "mauv" }
      ],
      background: [
        { id: "b-bonne", label: "Pas d'antécédent notable, séjour rural en Guinée 7 jours, contact possible avec un proche fébrile décédé, pas de vaccination FHV.", quality: "bonne" },
        { id: "b-moy", label: "Pas grand-chose dans le dossier, je crois qu'elle a voyagé.", quality: "moy" },
        { id: "b-mauv", label: "On n'a pas eu le temps de creuser les antécédents, je vous rappellerai.", quality: "mauv" }
      ],
      analyse: [
        { id: "a-bonne", label: "qSOFA à 2 (TAS 98, FR 24), sepsis débutant, suspicion FHV au premier plan, paludisme à éliminer. Hémodynamique fragile.", quality: "bonne" },
        { id: "a-moy", label: "Elle n'a pas l'air bien, je pense à un truc tropical.", quality: "moy" },
        { id: "a-mauv", label: "À votre avis, qu'est-ce qu'elle a ?", quality: "mauv" }
      ],
      demande: [
        { id: "d-bonne", label: "Je demande votre avis spécialisé, l'activation de la filière ESR REB et la conduite à tenir sur les prélèvements et l'antiviral.", quality: "bonne" },
        { id: "d-moy", label: "Vous voulez qu'on fasse quoi ?", quality: "moy" },
        { id: "d-mauv", label: "On verra plus tard, je voulais juste vous prévenir.", quality: "mauv" }
      ]
    },
    classement: "possible",
    classementExplain: "Tableau clinique compatible FHV + exposition + qSOFA ≥ 2 : cas <strong>possible</strong>, transfert ESR + alerte CORRUSS via ARS.",
    pedaTitle: "Sepsis débutant chez un suspect FHV — la triade prime sur l'imagerie.",
    pedaBody: "<p>Devant un retour de zone à risque avec fièvre + signes digestifs hémorragiques, la filière ESR doit primer sur toute exploration ouverte. Le qSOFA détecte précocement la gravité et conditionne la rapidité du transfert. Le scanner ouvert sans précaution est un piège classique.</p>"
  },

  // -----------------------------------------------------------------
  // Patient 2 — M. Aroua · suspicion Mpox clade I
  // -----------------------------------------------------------------
  {
    id: "aroua",
    name: "M. Karim Aroua",
    age: "29 ans · H",
    avatar: "A",
    arrivee: "00h12",
    motif: "Lésions vésiculo-pustuleuses + fièvre, retour RDC J10",
    context: "Patient suspect Mpox (clade I) classé par l'IOA. Stable. EPI déjà revêtus. Vous évaluez la gravité et organisez la suite.",
    vitals: {
      "TA": "126 / 78 mmHg",
      "FC": "92 / min",
      "FR": "18 / min",
      "SpO₂": "98 % air",
      "T°": "38,7 °C",
      "Glasgow": "15"
    },
    quote: "J'ai des boutons sur le visage, les mains, et même la bouche. Ça brûle. Je suis rentré de mission humanitaire en RDC il y a 10 jours.",
    qsofa: { tas: false, fr: false, conf: false },
    qsofaExpected: 0,
    examens: [
      { id: "pcr-mpox", label: "PCR Monkeypox (prélèvement lésion + écouvillon oropharyngé)", kind: "utile", explain: "Confirmation diagnostique. Prélèvement sous EPI, double emballage." },
      { id: "serologies-ist", label: "Sérologies VIH / syphilis / VHB / VHC", kind: "utile", explain: "Diagnostic différentiel et co-infections fréquentes." },
      { id: "nfs-crp", label: "NFS, CRP, transaminases", kind: "utile", explain: "Bilan inflammatoire et hépatique de base." },
      { id: "scanner-tap-systematique", label: "Scanner TAP systématique", kind: "inutile", explain: "Pas d'indication chez un patient stable sans signe respiratoire." },
      { id: "biopsie-derma", label: "Biopsie cutanée en urgence sans concertation", kind: "piege", explain: "Risque d'aérosolisation. À discuter avec l'infectiologue référent." }
    ],
    examensExpected: ["pcr-mpox", "serologies-ist", "nfs-crp"],
    treatments: [
      { id: "antalgie-palier", label: "Antalgie adaptée (palier OMS, soins de bouche)", kind: "utile", explain: "Les lésions sont très douloureuses, en particulier oropharyngées." },
      { id: "tecovirimat-discuss", label: "Discussion tecovirimat avec l'infectiologue référent", kind: "utile", explain: "Indication ATU/RTU au cas par cas selon gravité et terrain." },
      { id: "soins-locaux", label: "Soins locaux et prévention surinfection", kind: "utile", explain: "Limite la surinfection bactérienne, support de cicatrisation." },
      { id: "atb-systematique", label: "Antibiothérapie systémique systématique", kind: "piege", explain: "Pas d'indication d'emblée sans surinfection documentée." },
      { id: "corticoides", label: "Corticoïdes par voie générale", kind: "inutile", explain: "Risque d'aggravation virale, hors recommandation." }
    ],
    treatmentsExpected: ["antalgie-palier", "tecovirimat-discuss", "soins-locaux"],
    sbar: {
      situation: [
        { id: "s-bonne", label: "Patient de 29 ans, suspect Mpox clade I, fièvre 38,7 °C + éruption vésiculo-pustuleuse polymorphe au retour de RDC à J10, stable.", quality: "bonne" },
        { id: "s-moy", label: "J'ai un patient avec des boutons, je pense à la variole du singe.", quality: "moy" },
        { id: "s-mauv", label: "C'est pour un avis dermato, vous pouvez passer ?", quality: "mauv" }
      ],
      background: [
        { id: "b-bonne", label: "Mission humanitaire en RDC, pas de vaccination antivariolique, pas de comorbidité, pas d'immunodépression connue.", quality: "bonne" },
        { id: "b-moy", label: "Il a voyagé, c'est tout ce que je sais.", quality: "moy" },
        { id: "b-mauv", label: "Je n'ai pas regardé les antécédents en détail.", quality: "mauv" }
      ],
      analyse: [
        { id: "a-bonne", label: "qSOFA à 0, patient stable, suspicion clinique forte de Mpox clade I, présentation polymorphe avec atteinte muqueuse.", quality: "bonne" },
        { id: "a-moy", label: "Il a l'air OK pour l'instant.", quality: "moy" },
        { id: "a-mauv", label: "Je ne suis pas sûr de ce qu'il a.", quality: "mauv" }
      ],
      demande: [
        { id: "d-bonne", label: "Je demande validation du classement, modalités de prélèvement PCR et discussion de l'orientation (filière clade I / hospitalisation isolement).", quality: "bonne" },
        { id: "d-moy", label: "Vous le prenez chez vous ?", quality: "moy" },
        { id: "d-mauv", label: "Bon, je vous le garde, dites-moi quoi.", quality: "mauv" }
      ]
    },
    classement: "suspect",
    classementExplain: "Clinique + exposition compatibles, gravité limitée, qSOFA = 0 : <strong>reste suspect</strong>, maintien des mesures et attente PCR.",
    pedaTitle: "Mpox clade I — vigilance, mais pas de surenchère.",
    pedaBody: "<p>Le Mpox clade I impose la filière REB, mais en l'absence de défaillance la prise en charge reste centrée sur l'antalgie, la prévention de surinfection et la confirmation PCR. Antibiothérapie et corticoïdes systématiques sont des pièges classiques.</p>"
  },

  // -----------------------------------------------------------------
  // Patient 3 — M. Yılmaz · suspicion MERS-CoV
  // -----------------------------------------------------------------
  {
    id: "yilmaz",
    name: "M. Mehmet Yılmaz",
    age: "58 ans · H",
    avatar: "Y",
    arrivee: "01h28",
    motif: "Toux fébrile + dyspnée, retour pèlerinage Arabie Saoudite J5",
    context: "Patient suspect MERS-CoV classé par l'IOA. Box dédié. Soignant en EPI complet. Vous évaluez la gravité respiratoire et activez la filière.",
    vitals: {
      "TA": "104 / 64 mmHg",
      "FC": "108 / min",
      "FR": "26 / min",
      "SpO₂": "92 % air",
      "T°": "39,1 °C",
      "Glasgow": "14 (légèrement somnolent)"
    },
    quote: "Je tousse depuis 3 jours, j'ai du mal à respirer. J'étais à La Mecque le mois dernier et j'ai été en contact avec des dromadaires lors d'une excursion.",
    qsofa: { tas: false, fr: true, conf: true },
    qsofaExpected: 2,
    examens: [
      { id: "pcr-mers", label: "RT-PCR MERS-CoV (écouvillon nasopharyngé + aspiration trachéale si possible)", kind: "utile", explain: "Diagnostic spécifique. Voies basses plus sensibles." },
      { id: "gds-rx-thorax", label: "Gaz du sang + radio thorax au lit", kind: "utile", explain: "Évaluation de la défaillance respiratoire au box dédié, pas de transfert imagerie." },
      { id: "nfs-iono-crp", label: "NFS, CRP, ionogramme, créatinine, lactates", kind: "utile", explain: "Évaluation de la gravité." },
      { id: "scanner-tap-systematique", label: "Scanner thoracique en imagerie ouverte d'emblée", kind: "piege", explain: "Risque de contamination du scanner. À discuter au cas par cas, après concertation, sur scanner dédié si possible." },
      { id: "epreuve-marche", label: "Test de marche 6 min en salle d'attente", kind: "inutile", explain: "Aberrant chez un patient hypoxique suspect REB." }
    ],
    examensExpected: ["pcr-mers", "gds-rx-thorax", "nfs-iono-crp"],
    treatments: [
      { id: "o2-titration", label: "Oxygénothérapie titrée (SpO₂ cible ≥ 94 %)", kind: "utile", explain: "Correction de l'hypoxémie, en évitant l'aérosolisation excessive." },
      { id: "atb-pac", label: "Antibiothérapie probabiliste de PAC (C3G + macrolide)", kind: "utile", explain: "Couvre les co-infections bactériennes potentielles." },
      { id: "rea-prudent", label: "Remplissage prudent + surveillance rapprochée USC/REA", kind: "utile", explain: "Patient qSOFA ≥ 2, à monitorer en soins continus." },
      { id: "vni-d-emblee", label: "VNI / haut débit nasal d'emblée hors box pression négative", kind: "piege", explain: "Très aérosolisant — à éviter si box non adapté, à discuter avec REA." },
      { id: "corticoides-systematique", label: "Corticoïdes systématiques fortes doses", kind: "inutile", explain: "Pas d'indication systématique sans SDRA documenté." }
    ],
    treatmentsExpected: ["o2-titration", "atb-pac", "rea-prudent"],
    sbar: {
      situation: [
        { id: "s-bonne", label: "Patient de 58 ans, suspect MERS-CoV, toux + dyspnée + SpO₂ 92 %, T° 39,1 °C, retour pèlerinage Arabie Saoudite J5 avec contact dromadaires.", quality: "bonne" },
        { id: "s-moy", label: "Un monsieur qui tousse beaucoup, il revient du pèlerinage.", quality: "moy" },
        { id: "s-mauv", label: "J'ai un pneumo qui dégrade, vous pouvez venir le voir ?", quality: "mauv" }
      ],
      background: [
        { id: "b-bonne", label: "HTA traitée, diabète type 2, pas d'immunodépression, contact direct dromadaires lors d'une excursion, pas de vaccin spécifique disponible.", quality: "bonne" },
        { id: "b-moy", label: "Diabétique, HTA je crois.", quality: "moy" },
        { id: "b-mauv", label: "Je vous envoie le dossier après.", quality: "mauv" }
      ],
      analyse: [
        { id: "a-bonne", label: "qSOFA à 2 (FR 26, somnolence), hypoxémie 92 %, suspicion MERS-CoV au premier plan, indication d'orientation USC/REA après stabilisation.", quality: "bonne" },
        { id: "a-moy", label: "Il sature mal, je m'inquiète.", quality: "moy" },
        { id: "a-mauv", label: "Vous me dites s'il faut s'inquiéter.", quality: "mauv" }
      ],
      demande: [
        { id: "d-bonne", label: "Je demande activation ESR REB, modalités prélèvement, orientation USC/REA en box pression négative, et conduite à tenir oxygénation.", quality: "bonne" },
        { id: "d-moy", label: "On l'envoie en REA ?", quality: "moy" },
        { id: "d-mauv", label: "Je vous laisse organiser, je m'occupe d'autres patients.", quality: "mauv" }
      ]
    },
    classement: "possible",
    classementExplain: "Tableau pulmonaire + exposition + qSOFA ≥ 2 : cas <strong>possible</strong>, transfert ESR REB et hospitalisation USC/REA en box pression négative.",
    pedaTitle: "MERS-CoV — pneumopathie grave : oxygénation prudente, pas d'aérosolisation sauvage.",
    pedaBody: "<p>Chez un suspect MERS avec qSOFA ≥ 2, l'orientation soins continus en box adapté prime. Imagerie ouverte et VNI hors box pression négative sont les deux pièges majeurs. La concertation avec REA et infectiologue référent doit précéder tout geste aérosolisant.</p>"
  }
];

// ====================================================================
// CONTACTS — Triade COREB
// ====================================================================

const M2_CONTACTS = [
  // Premier cercle (triade COREB) — slots 0, 1, 2
  { id: "samu", label: "SAMU-Centre 15", group: "1er cercle", role: "Régulation, orientation, transport sécurisé.", rank: 0 },
  { id: "infectio", label: "Infectiologue référent REB", group: "1er cercle", role: "Validation diagnostic, conduite à tenir spécifique.", rank: 1 },
  { id: "ars", label: "ARS / CIRE", group: "1er cercle", role: "Signalement, alerte sanitaire, activation ESR.", rank: 2 },
  // Deuxième cercle — slots 3, 4, 5 (ordre interchangeable)
  { id: "biolo", label: "Microbiologiste / biologiste", group: "2e cercle", role: "Acheminement et traitement des prélèvements.", rank: 3 },
  { id: "eoh", label: "Hygiéniste / EOH", group: "2e cercle", role: "Sécurisation environnement, traçage contacts.", rank: 3 },
  { id: "direction", label: "Directeur d'établissement", group: "2e cercle", role: "Activation cellule de crise / plan blanc.", rank: 3 },
  // Distracteurs (ne devraient pas être appelés en priorité)
  { id: "presse", label: "Service communication / presse", group: "À ne pas appeler", role: "Pas en priorité — risque de fuite avant cellule de crise.", rank: 9, distract: true },
  { id: "famille", label: "Famille du patient", group: "À ne pas appeler", role: "Information secondaire, après stabilisation.", rank: 9, distract: true }
];

// ====================================================================
// ÉTAT GLOBAL MODULE 2
// ====================================================================

const m2State = {
  patientIndex: 0,
  scores: { eval: 0, traitement: 0, comm: 0, triade: 0 },
  patientResults: [],
  badges: new Set(),
  // état courant
  qsofaChoices: { tas: false, fr: false, conf: false },
  examensChoices: new Set(),
  treatmentsChoices: new Set(),
  sbarChoices: { situation: null, background: null, analyse: null, demande: null },
  sequence: [null, null, null, null, null, null],
  classement: null,
  patientStartTime: 0,
  timeLeft: M2_PATIENT_TIME,
  totalTime: M2_PATIENT_TIME,
  timerId: null,
  phaseScores: null
};

// ====================================================================
// HELPERS LOCAUX
// ====================================================================

function m2$(sel) { return document.querySelector(sel); }
function m2$$(sel) { return Array.from(document.querySelectorAll(sel)); }

function m2ShowPhase(name) {
  document.querySelectorAll("#screen-game2 .phase").forEach((p) => p.classList.remove("phase-active"));
  document.getElementById(`phase-${name}`).classList.add("phase-active");
  document.querySelectorAll("#screen-game2 .phase-tab").forEach((t) => {
    t.classList.remove("phase-active");
    if (t.dataset.phase2 === name) t.classList.add("phase-active");
  });
}

function m2UpdateScoresUI() {
  m2$("#m2-score-eval").textContent = Math.round(m2State.scores.eval);
  m2$("#m2-score-traitement").textContent = Math.round(m2State.scores.traitement);
  m2$("#m2-score-comm").textContent = Math.round(m2State.scores.comm);
  m2$("#m2-score-triade").textContent = Math.round(m2State.scores.triade);
}

// ====================================================================
// DÉMARRAGE
// ====================================================================

function startModule2() {
  m2State.patientIndex = 0;
  m2State.scores = { eval: 0, traitement: 0, comm: 0, triade: 0 };
  m2State.patientResults = [];
  m2State.badges = new Set();
  m2UpdateScoresUI();
  if (typeof setCheat === "function") setCheat(2);
  showScreen("screen-game2");
  m2LoadPatient(0);
}
window.startModule2 = startModule2;

function m2LoadPatient(i) {
  m2State.patientIndex = i;
  const p = M2_PATIENTS[i];
  m2State.patientStartTime = Date.now();
  m2State.qsofaChoices = { tas: false, fr: false, conf: false };
  m2State.examensChoices = new Set();
  m2State.treatmentsChoices = new Set();
  m2State.sbarChoices = { situation: null, background: null, analyse: null, demande: null };
  m2State.sequence = [null, null, null, null, null, null];
  m2State.classement = null;
  m2State.timeLeft = M2_PATIENT_TIME;
  m2State.totalTime = M2_PATIENT_TIME;
  m2State.phaseScores = { eval: 0, traitement: 0, comm: 0, triade: 0 };

  // UI patient
  m2$("#m2-patient-index").textContent = i + 1;
  m2$("#m2-progress-fill").style.width = ((i) / M2_PATIENTS.length * 100) + "%";
  m2$("#m2-patient-name").textContent = p.name;
  m2$("#m2-patient-age").textContent = p.age;
  m2$("#m2-patient-motif").textContent = p.motif;
  m2$("#m2-patient-time").textContent = "Heure · " + p.arrivee;
  m2$("#m2-patient-avatar").textContent = p.avatar;
  m2$("#m2-patient-context").innerHTML = `<strong>Contexte :</strong> ${p.context}`;
  m2$("#m2-patient-quote").textContent = "« " + p.quote + " »";

  // Vitals
  const vitalsEl = m2$("#m2-vitals");
  vitalsEl.innerHTML = "";
  Object.entries(p.vitals).forEach(([k, v]) => {
    const item = document.createElement("div");
    item.className = "vital";
    item.innerHTML = `<div class="vital-label">${k}</div><div class="vital-value">${v}</div>`;
    vitalsEl.appendChild(item);
  });

  // Reset UI des phases
  m2ResetQsofaUI();
  m2RenderExamens(p);
  m2RenderSBAR(p);
  m2RenderTriade();
  m2ResetClassementUI();

  m2ShowPhase("qsofa");
  m2StartTimer();
}

// ====================================================================
// TIMER
// ====================================================================

function m2StartTimer() {
  if (m2State.timerId) clearInterval(m2State.timerId);
  m2UpdateTimerUI();
  m2State.timerId = setInterval(() => {
    m2State.timeLeft--;
    if (m2State.timeLeft <= 0) {
      clearInterval(m2State.timerId);
      m2State.timeLeft = 0;
      m2UpdateTimerUI();
      toast("Temps écoulé — finalisation automatique.", "danger");
      m2AutoFinish();
    } else {
      m2UpdateTimerUI();
    }
  }, 1000);
}

function m2UpdateTimerUI() {
  m2$("#m2-timer-value").textContent = m2State.timeLeft;
  const ring = m2$("#m2-timer-ring-fg");
  const pct = m2State.timeLeft / m2State.totalTime;
  const circ = 2 * Math.PI * 15.5;
  ring.style.strokeDasharray = circ;
  ring.style.strokeDashoffset = circ * (1 - pct);
  if (m2State.timeLeft <= 10) m2$("#m2-timer").classList.add("timer-danger");
  else m2$("#m2-timer").classList.remove("timer-danger");
}

function m2StopTimer() {
  if (m2State.timerId) clearInterval(m2State.timerId);
}

function m2AutoFinish() {
  // Si timeout, on évalue ce qui a été fait et on passe au feedback
  m2GotoFeedback(true);
}

// ====================================================================
// PHASE 1 — qSOFA
// ====================================================================

function m2ResetQsofaUI() {
  m2$$("#phase-qsofa .qsofa-item input").forEach((input) => { input.checked = false; });
  m2$("#qsofa-score").textContent = "0";
  m2$("#qsofa-interp").textContent = "Aucun critère coché.";
  m2$("#qsofa-result").classList.remove("qsofa-alert");
}

m2$$("#phase-qsofa .qsofa-item input").forEach((input) => {
  input.addEventListener("change", (e) => {
    const item = e.target.closest(".qsofa-item");
    const key = item.dataset.q;
    m2State.qsofaChoices[key] = e.target.checked;
    m2UpdateQsofaResult();
  });
});

function m2UpdateQsofaResult() {
  const c = m2State.qsofaChoices;
  const score = (c.tas ? 1 : 0) + (c.fr ? 1 : 0) + (c.conf ? 1 : 0);
  m2$("#qsofa-score").textContent = score;
  let interp = "";
  if (score === 0) interp = "Aucun critère qSOFA. Pronostic rassurant à ce stade.";
  else if (score === 1) interp = "1 critère qSOFA. Surveillance rapprochée recommandée.";
  else interp = "qSOFA ≥ 2 : risque de mauvais pronostic. Concertation USC/REA.";
  m2$("#qsofa-interp").textContent = interp;
  m2$("#qsofa-result").classList.toggle("qsofa-alert", score >= 2);
}

m2$("#btn-validate-qsofa").addEventListener("click", () => {
  const p = M2_PATIENTS[m2State.patientIndex];
  const c = m2State.qsofaChoices;
  const expected = p.qsofa;
  let exact = 0;
  ["tas", "fr", "conf"].forEach((k) => { if (c[k] === expected[k]) exact++; });
  // Score: 8.33 max si parfait
  const ratio = exact / 3;
  const gained = M2_PER_PATIENT * ratio;
  m2State.phaseScores.eval = gained;
  m2State.scores.eval += gained;
  m2UpdateScoresUI();
  if (exact === 3) toast("qSOFA correctement évalué.", "success");
  else toast(`qSOFA partiel (${exact}/3 critères justes).`, "warn");
  m2ShowPhase("examens");
});

// ====================================================================
// PHASE 2 — Examens / Traitement
// ====================================================================

function m2RenderExamens(p) {
  const exList = m2$("#exam-list");
  const txList = m2$("#treatment-list");
  exList.innerHTML = "";
  txList.innerHTML = "";
  p.examens.forEach((ex) => exList.appendChild(m2MakeExamItem(ex, "exam")));
  p.treatments.forEach((tx) => txList.appendChild(m2MakeExamItem(tx, "treatment")));
}

function m2MakeExamItem(item, type) {
  const label = document.createElement("label");
  label.className = "exam-item";
  label.dataset.id = item.id;
  label.dataset.kind = item.kind;
  label.innerHTML = `
    <input type="checkbox">
    <div class="exam-content">
      <div class="exam-title">${item.label}</div>
    </div>
  `;
  label.querySelector("input").addEventListener("change", (e) => {
    const target = type === "exam" ? m2State.examensChoices : m2State.treatmentsChoices;
    if (e.target.checked) target.add(item.id);
    else target.delete(item.id);
  });
  return label;
}

m2$("#btn-validate-examens").addEventListener("click", () => {
  const p = M2_PATIENTS[m2State.patientIndex];
  // Évaluation : pour chaque liste, +1 par bon choix coché, -1 par piège coché, 0 par inutile coché
  const evaluateList = (items, chosen, expected) => {
    let raw = 0;
    items.forEach((it) => {
      const picked = chosen.has(it.id);
      if (it.kind === "utile") {
        if (picked) raw += 1;
        else raw -= 0.5; // omission d'un bon examen
      } else if (it.kind === "piege") {
        if (picked) raw -= 1;
      } else if (it.kind === "inutile") {
        if (picked) raw -= 0.5;
      }
    });
    const maxRaw = expected.length; // = nb d'utiles
    const ratio = Math.max(0, Math.min(1, raw / maxRaw));
    return ratio;
  };
  const rEx = evaluateList(p.examens, m2State.examensChoices, p.examensExpected);
  const rTx = evaluateList(p.treatments, m2State.treatmentsChoices, p.treatmentsExpected);
  // 1/2 du score traitement = examens (évaluation) + 1/2 = traitements (traitement)
  // En réalité examens compte pour l'axe ÉVALUATION (complète qSOFA) et traitements pour TRAITEMENT
  const gainedEval = (M2_PER_PATIENT * 0.5) * rEx; // demi-poids car qSOFA a déjà compté
  // Mais pour rester cohérent, on simplifie : examens → axe Évaluation; traitements → axe Traitement, chacun M2_PER_PATIENT max
  // Redéfinissons proprement :
  const gainedEval2 = M2_PER_PATIENT * rEx;
  const gainedTx = M2_PER_PATIENT * rTx;
  // On veut conserver le score qSOFA déjà attribué, donc on ajoute les examens à part : 50/50
  // Pour ne pas dépasser, on attribue : examens = bonus complémentaire à eval (moitié de M2_PER_PATIENT)
  // Et traitement axe propre = gainedTx
  // Recap axes : eval (qSOFA 8.33 max + examens 8.33 max) → mais on a déjà ajouté qSOFA en M2_PER_PATIENT.
  // Simplification : qSOFA = 50% de M2_PER_PATIENT, examens = 50% de M2_PER_PATIENT
  // On corrige rétroactivement le qSOFA déjà ajouté.
  const qsofaCorrected = m2State.phaseScores.eval * 0.5;
  const delta = qsofaCorrected - m2State.phaseScores.eval; // négatif
  m2State.scores.eval += delta; // on retire la moitié déjà comptée
  m2State.phaseScores.eval = qsofaCorrected;

  const examGain = (M2_PER_PATIENT * 0.5) * rEx;
  m2State.phaseScores.eval += examGain;
  m2State.scores.eval += examGain;

  m2State.phaseScores.traitement = gainedTx;
  m2State.scores.traitement += gainedTx;

  m2UpdateScoresUI();
  if (rEx >= 0.8 && rTx >= 0.8) toast("Prescription cohérente.", "success");
  else toast("Prescription perfectible.", "warn");
  m2ShowPhase("sbar");
});

// ====================================================================
// PHASE 3 — SBAR
// ====================================================================

const SBAR_SECTIONS = [
  { key: "situation", title: "S · Situation", help: "Qui, quoi, quand, en 1 phrase." },
  { key: "background", title: "B · Background / Antécédents", help: "Contexte clinique pertinent." },
  { key: "analyse", title: "A · Analyse / Évaluation", help: "Gravité, hypothèses diagnostiques." },
  { key: "demande", title: "R · Request / Demande", help: "Action attendue, claire et explicite." }
];

function m2RenderSBAR(p) {
  const builder = m2$("#sbar-builder");
  builder.innerHTML = "";
  SBAR_SECTIONS.forEach((section) => {
    const block = document.createElement("div");
    block.className = "sbar-section";
    block.innerHTML = `
      <div class="sbar-section-title">${section.title}</div>
      <div class="sbar-section-help">${section.help}</div>
      <div class="sbar-options" data-section="${section.key}"></div>
    `;
    const optsEl = block.querySelector(".sbar-options");
    p.sbar[section.key].forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sbar-option";
      btn.dataset.id = opt.id;
      btn.dataset.quality = opt.quality;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => m2PickSbar(section.key, opt));
      optsEl.appendChild(btn);
    });
    builder.appendChild(block);
  });
  m2UpdateSbarPreview();
}

function m2PickSbar(key, opt) {
  m2State.sbarChoices[key] = opt;
  m2$$(`#sbar-builder .sbar-options[data-section="${key}"] .sbar-option`).forEach((b) => {
    b.classList.toggle("sbar-option-active", b.dataset.id === opt.id);
  });
  m2UpdateSbarPreview();
}

function m2UpdateSbarPreview() {
  const body = m2$("#sbar-preview-body");
  const c = m2State.sbarChoices;
  const allSelected = SBAR_SECTIONS.every((s) => c[s.key]);
  if (!allSelected) {
    body.innerHTML = "<em>Sélectionnez une option dans chaque rubrique pour visualiser votre transmission.</em>";
    m2$("#btn-validate-sbar").disabled = true;
    return;
  }
  body.innerHTML = SBAR_SECTIONS.map((s) =>
    `<p><strong>${s.title} —</strong> ${c[s.key].label}</p>`
  ).join("");
  m2$("#btn-validate-sbar").disabled = false;
}

m2$("#btn-validate-sbar").addEventListener("click", () => {
  const c = m2State.sbarChoices;
  let raw = 0;
  SBAR_SECTIONS.forEach((s) => {
    const q = c[s.key].quality;
    if (q === "bonne") raw += 1;
    else if (q === "moy") raw += 0.4;
    else raw += 0;
  });
  const ratio = raw / SBAR_SECTIONS.length;
  const gained = M2_PER_PATIENT * ratio;
  m2State.phaseScores.comm = gained;
  m2State.scores.comm += gained;
  m2UpdateScoresUI();
  if (ratio >= 0.9) toast("Transmission SBAR claire et structurée.", "success");
  else if (ratio >= 0.6) toast("SBAR correct, peut être affiné.", "warn");
  else toast("SBAR insuffisamment structuré.", "danger");
  m2ShowPhase("triade");
});

// ====================================================================
// PHASE 4 — Triade (chaîne d'alerte)
// ====================================================================

function m2RenderTriade() {
  const pool = m2$("#contact-pool");
  pool.innerHTML = "";
  M2_CONTACTS.forEach((c) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "contact-chip";
    chip.dataset.id = c.id;
    chip.dataset.group = c.group;
    chip.innerHTML = `
      <div class="contact-chip-group">${c.group}</div>
      <div class="contact-chip-label">${c.label}</div>
      <div class="contact-chip-role">${c.role}</div>
    `;
    chip.addEventListener("click", () => m2AddContactToSequence(c.id));
    pool.appendChild(chip);
  });
  // Reset slots
  m2$$("#contact-sequence .contact-slot").forEach((slot, idx) => {
    slot.textContent = `${idx + 1}. ⋯`;
    slot.classList.remove("contact-slot-filled");
    slot.dataset.contact = "";
    // Cliquer un slot rempli = retirer
    slot.onclick = () => {
      if (slot.dataset.contact) {
        const id = slot.dataset.contact;
        m2State.sequence[idx] = null;
        slot.dataset.contact = "";
        slot.textContent = `${idx + 1}. ⋯`;
        slot.classList.remove("contact-slot-filled");
        // Re-enable chip
        const chip = m2$$(`#contact-pool .contact-chip`).find((c) => c.dataset.id === id);
        if (chip) chip.classList.remove("contact-chip-used");
      }
    };
  });
}

function m2AddContactToSequence(id) {
  const slotIdx = m2State.sequence.findIndex((s) => s === null);
  if (slotIdx === -1) { toast("Tous les emplacements sont remplis.", "warn"); return; }
  if (m2State.sequence.includes(id)) { toast("Contact déjà placé.", "warn"); return; }
  m2State.sequence[slotIdx] = id;
  const contact = M2_CONTACTS.find((c) => c.id === id);
  const slot = m2$$(`#contact-sequence .contact-slot`)[slotIdx];
  slot.dataset.contact = id;
  slot.textContent = `${slotIdx + 1}. ${contact.label}`;
  slot.classList.add("contact-slot-filled");
  // Disable chip
  const chip = m2$$(`#contact-pool .contact-chip`).find((c) => c.dataset.id === id);
  if (chip) chip.classList.add("contact-chip-used");
}

m2$("#btn-reset-sequence").addEventListener("click", () => {
  m2State.sequence = [null, null, null, null, null, null];
  m2$$("#contact-sequence .contact-slot").forEach((slot, idx) => {
    slot.textContent = `${idx + 1}. ⋯`;
    slot.classList.remove("contact-slot-filled");
    slot.dataset.contact = "";
  });
  m2$$("#contact-pool .contact-chip").forEach((c) => c.classList.remove("contact-chip-used"));
});

m2$("#btn-validate-triade").addEventListener("click", () => {
  const seq = m2State.sequence.filter((x) => x !== null);
  if (seq.length < 3) { toast("Placez au moins les 3 contacts du premier cercle.", "warn"); return; }
  // Évaluation : 1er cercle (samu, infectio, ars) doivent être les 3 premiers, ordre fixé.
  // Puis 2e cercle dans les slots 3-5 (ordre interchangeable). Distracteurs = pénalité.
  const expectedFirst = ["samu", "infectio", "ars"];
  const secondCircle = ["biolo", "eoh", "direction"];
  let raw = 0;
  // Premier cercle : 0.5 pt par bonne position (max 1.5)
  expectedFirst.forEach((id, idx) => { if (seq[idx] === id) raw += 0.5; });
  // Présence du 2e cercle (slots 3+) : 0.5 pt par contact 2e cercle présent dans n'importe quel slot ≥3
  secondCircle.forEach((id) => {
    const pos = seq.indexOf(id);
    if (pos >= 3) raw += 0.5;
    else if (pos >= 0 && pos < 3) raw -= 0.3; // mal placé (avant la triade)
  });
  // Distracteurs : −0.5 chacun
  seq.forEach((id) => {
    const c = M2_CONTACTS.find((x) => x.id === id);
    if (c && c.distract) raw -= 0.5;
  });
  // Max théorique : 1.5 + 1.5 = 3
  const ratio = Math.max(0, Math.min(1, raw / 3));
  const gained = M2_PER_PATIENT * ratio;
  m2State.phaseScores.triade = gained;
  m2State.scores.triade += gained;
  m2UpdateScoresUI();
  if (ratio >= 0.9) toast("Chaîne d'alerte conforme à la doctrine COREB.", "success");
  else if (ratio >= 0.6) toast("Ordre globalement bon, à affiner.", "warn");
  else toast("Ordre de la triade à revoir.", "danger");
  m2ShowPhase("classement");
});

// ====================================================================
// PHASE 5 — Classement
// ====================================================================

function m2ResetClassementUI() {
  m2$$("#phase-classement .classement-card").forEach((c) => c.classList.remove("classement-active"));
}

m2$$("#phase-classement .classement-card").forEach((card) => {
  card.addEventListener("click", () => {
    m2$$("#phase-classement .classement-card").forEach((c) => c.classList.remove("classement-active"));
    card.classList.add("classement-active");
    m2State.classement = card.dataset.class;
    // Petit délai puis on enchaîne sur feedback
    setTimeout(() => m2GotoFeedback(false), 350);
  });
});

// ====================================================================
// FEEDBACK + ENCHAÎNEMENT
// ====================================================================

function m2GotoFeedback(fromTimeout) {
  m2StopTimer();
  const p = M2_PATIENTS[m2State.patientIndex];
  // Bonus rapidité : si fini en < 60s avec score correct, +5% sur le total patient
  // Simplifié : pas de bonus pour le moment.

  // Bonus classement correct : +20% sur l'axe triade
  if (m2State.classement === p.classement) {
    const bonus = m2State.phaseScores.triade * 0.2;
    m2State.scores.triade += bonus;
    m2State.phaseScores.triade += bonus;
    m2UpdateScoresUI();
  }

  // Construire le feedback
  m2$("#feedback2-title").textContent = p.pedaTitle;
  const body = m2$("#feedback2-body");

  // Détails par phase
  const c = m2State.qsofaChoices;
  const qLines = [];
  ["tas", "fr", "conf"].forEach((k) => {
    const exp = p.qsofa[k];
    const got = c[k];
    const labels = { tas: "TAS ≤ 100", fr: "FR ≥ 22", conf: "Confusion / GCS < 15" };
    const ok = exp === got;
    qLines.push(`<li class="${ok ? 'fb-ok' : 'fb-ko'}">${labels[k]} — ${ok ? "correct" : (exp ? "manqué (présent)" : "à tort (absent)")}</li>`);
  });

  // Examens : bons / piégés / manqués
  const exExpected = new Set(p.examensExpected);
  const exMissed = [], exTrapped = [], exGood = [];
  p.examens.forEach((ex) => {
    const picked = m2State.examensChoices.has(ex.id);
    if (ex.kind === "utile" && !picked) exMissed.push(ex.label);
    if (ex.kind === "utile" && picked) exGood.push(ex.label);
    if ((ex.kind === "piege" || ex.kind === "inutile") && picked) exTrapped.push(ex.label);
  });
  const txMissed = [], txTrapped = [], txGood = [];
  p.treatments.forEach((tx) => {
    const picked = m2State.treatmentsChoices.has(tx.id);
    if (tx.kind === "utile" && !picked) txMissed.push(tx.label);
    if (tx.kind === "utile" && picked) txGood.push(tx.label);
    if ((tx.kind === "piege" || tx.kind === "inutile") && picked) txTrapped.push(tx.label);
  });

  // SBAR
  const sbarLines = SBAR_SECTIONS.map((s) => {
    const choice = m2State.sbarChoices[s.key];
    if (!choice) return `<li class="fb-ko">${s.title} — non renseigné</li>`;
    const cls = choice.quality === "bonne" ? "fb-ok" : (choice.quality === "moy" ? "fb-warn" : "fb-ko");
    const tag = choice.quality === "bonne" ? "structuré" : (choice.quality === "moy" ? "perfectible" : "à revoir");
    return `<li class="${cls}">${s.title} — ${tag}</li>`;
  });

  // Triade
  const seq = m2State.sequence.filter((x) => x !== null);
  const expectedOrder = ["samu", "infectio", "ars"];
  const triadeLines = expectedOrder.map((id, idx) => {
    const got = seq[idx];
    const labelMap = { samu: "SAMU-Centre 15", infectio: "Infectiologue référent REB", ars: "ARS / CIRE" };
    if (got === id) return `<li class="fb-ok">Position ${idx + 1} : ${labelMap[id]} — correct</li>`;
    return `<li class="fb-ko">Position ${idx + 1} attendue : ${labelMap[id]}</li>`;
  });

  const classementBlock = m2State.classement === p.classement
    ? `<p class="fb-success">Classement <strong>correct</strong>. ${p.classementExplain}</p>`
    : `<p class="fb-warn">Classement <strong>discutable</strong>. Réponse attendue : <strong>${p.classement === "exclu" ? "Cas exclu" : (p.classement === "suspect" ? "Reste suspect" : "Cas possible")}</strong>. ${p.classementExplain}</p>`;

  body.innerHTML = `
    <div class="fb-section"><h4>qSOFA</h4><ul class="fb-list">${qLines.join("")}</ul></div>
    <div class="fb-section">
      <h4>Examens prescrits</h4>
      ${exGood.length ? `<p class="fb-ok-p">Bons choix : ${exGood.join(" · ")}</p>` : ""}
      ${exMissed.length ? `<p class="fb-ko-p">Manqués : ${exMissed.join(" · ")}</p>` : ""}
      ${exTrapped.length ? `<p class="fb-ko-p">Inappropriés / pièges : ${exTrapped.join(" · ")}</p>` : ""}
    </div>
    <div class="fb-section">
      <h4>Traitement</h4>
      ${txGood.length ? `<p class="fb-ok-p">Bons choix : ${txGood.join(" · ")}</p>` : ""}
      ${txMissed.length ? `<p class="fb-ko-p">Manqués : ${txMissed.join(" · ")}</p>` : ""}
      ${txTrapped.length ? `<p class="fb-ko-p">Inappropriés / pièges : ${txTrapped.join(" · ")}</p>` : ""}
    </div>
    <div class="fb-section"><h4>SBAR</h4><ul class="fb-list">${sbarLines.join("")}</ul></div>
    <div class="fb-section"><h4>Triade COREB</h4><ul class="fb-list">${triadeLines.join("")}</ul></div>
    <div class="fb-section"><h4>Classement</h4>${classementBlock}</div>
    <div class="fb-section fb-peda">${p.pedaBody}</div>
  `;

  // Résolution
  m2$("#patient-resolution2").innerHTML = `<strong>Suite du patient :</strong> Filière REB activée, transfert organisé selon classification. Données fictives.`;

  // Enregistrer le résultat
  m2State.patientResults.push({
    patient: p.name,
    classement: m2State.classement,
    expected: p.classement,
    phaseScores: { ...m2State.phaseScores },
    timeout: fromTimeout
  });

  m2ShowPhase("feedback2");
}

m2$("#btn-next-patient2").addEventListener("click", () => {
  const next = m2State.patientIndex + 1;
  if (next >= M2_PATIENTS.length) {
    m2EndModule();
  } else {
    m2LoadPatient(next);
  }
});

// ====================================================================
// FIN DE MODULE — DEBRIEF
// ====================================================================

function m2EndModule() {
  m2StopTimer();
  // Cap à 25 par axe
  const cap = (v) => Math.min(M2_PER_AXIS_MAX, Math.round(v * 10) / 10);
  const s = m2State.scores;
  const capped = {
    eval: cap(s.eval),
    traitement: cap(s.traitement),
    comm: cap(s.comm),
    triade: cap(s.triade)
  };
  const total = Math.round(capped.eval + capped.traitement + capped.comm + capped.triade);

  m2$("#m2-total-score").textContent = total;
  m2$("#m2-val-eval").textContent = `${capped.eval}/25`;
  m2$("#m2-val-traitement").textContent = `${capped.traitement}/25`;
  m2$("#m2-val-comm").textContent = `${capped.comm}/25`;
  m2$("#m2-val-triade").textContent = `${capped.triade}/25`;
  m2$("#m2-bar-eval").style.width = (capped.eval / 25 * 100) + "%";
  m2$("#m2-bar-traitement").style.width = (capped.traitement / 25 * 100) + "%";
  m2$("#m2-bar-comm").style.width = (capped.comm / 25 * 100) + "%";
  m2$("#m2-bar-triade").style.width = (capped.triade / 25 * 100) + "%";

  let grade = "À reprendre — relire la procédure COREB en 10 points.";
  if (total >= 85) grade = "Excellent — réflexes COREB acquis.";
  else if (total >= 70) grade = "Bon niveau — quelques points à consolider.";
  else if (total >= 50) grade = "Niveau correct — formation complémentaire utile.";

  m2$("#m2-score-grade").textContent = grade;

  // Badges
  const badgesEl = m2$("#m2-badges-earned");
  badgesEl.innerHTML = "";
  const badges = [];
  if (capped.eval >= 22) badges.push({ icon: "✓", label: "qSOFA précis", desc: "Score qSOFA évalué juste sur les 3 patients." });
  if (capped.triade >= 22) badges.push({ icon: "△", label: "Triade conforme", desc: "Ordre SAMU + Infectio + ARS maîtrisé." });
  if (capped.comm >= 22) badges.push({ icon: "✎", label: "SBAR exemplaire", desc: "Transmissions structurées sur les 3 cas." });
  if (total >= 85) badges.push({ icon: "★", label: "Médecin sénior REB", desc: "Score global supérieur à 85/100." });
  badges.forEach((b) => {
    const card = document.createElement("div");
    card.className = "badge-card";
    card.innerHTML = `<div class="badge-icon">${b.icon}</div><div class="badge-label">${b.label}</div><div class="badge-desc">${b.desc}</div>`;
    badgesEl.appendChild(card);
  });
  if (badges.length === 0) {
    badgesEl.innerHTML = `<div class="badge-empty">Aucun badge cette session — relancez un module pour progresser.</div>`;
  }

  // Replay
  const replay = m2$("#m2-replay-list");
  replay.innerHTML = "";
  m2State.patientResults.forEach((r, idx) => {
    const max = Math.round(M2_PER_PATIENT * 4);
    const total = Math.min(max, Math.round(r.phaseScores.eval + r.phaseScores.traitement + r.phaseScores.comm + r.phaseScores.triade));
    const ok = r.classement === r.expected;
    const item = document.createElement("div");
    item.className = "replay-item";
    item.innerHTML = `
      <div class="replay-head">
        <span class="replay-num">${idx + 1}</span>
        <span class="replay-name">${r.patient}</span>
        <span class="replay-score">${total} / ${max}</span>
      </div>
      <div class="replay-detail">
        Classement : <strong>${r.classement || "non classé"}</strong> · attendu : <strong>${r.expected}</strong> ${ok ? "✓" : "✕"}
        ${r.timeout ? " · finalisé par timeout" : ""}
      </div>
    `;
    replay.appendChild(item);
  });

  if (typeof setCheat === "function") setCheat(null);
  showScreen("screen-debrief2");
}

m2$("#m2-btn-restart").addEventListener("click", () => {
  if (typeof setCheat === "function") setCheat(null);
  showScreen("screen-intro");
});

m2$("#m2-btn-replay").addEventListener("click", () => {
  startModule2();
});

// ====================================================================
// Tabs M2 — navigation libre (forward only sur phases déjà validées)
// ====================================================================
// Désactivé volontairement : navigation séquentielle uniquement.

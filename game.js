/* ====================================================================
   URGENCE REB — Module 1 · Logique de jeu
   Prototype URGENCE REB · Mai 2026
   ==================================================================== */

// ====================================================================
// QUESTIONS DE TRI (banque commune)
// Chaque question a un id, un libellé, un axe (symptômes / exposition / délai)
// et peut "révéler" une info pour un patient donné.
// ====================================================================
const QUESTIONS = {
  Q_FIEVRE:   { axis: "symp", label: "Avez-vous de la fièvre ou des frissons ?" },
  Q_RESPI:    { axis: "symp", label: "Toux, gêne respiratoire, essoufflement ?" },
  Q_DIG:      { axis: "symp", label: "Diarrhée, vomissements, douleurs abdominales ?" },
  Q_ERUPT:    { axis: "symp", label: "Éruption cutanée, lésions, vésicules ?" },
  Q_SAIGN:    { axis: "symp", label: "Saignements inhabituels, ecchymoses ?" },

  Q_VOYAGE:   { axis: "expo", label: "Retour récent de l'étranger ? (zone, dates)" },
  Q_ANIMAL:   { axis: "expo", label: "Contact avec animaux, rongeurs, chauves-souris ?" },
  Q_CONTACT:  { axis: "expo", label: "Contact avec une personne malade fébrile ?" },
  Q_HOSPI:    { axis: "expo", label: "Hospitalisation à l'étranger dans les 12 derniers mois ?" },
  Q_PROF:     { axis: "expo", label: "Profession à risque ? (santé, labo, élevage)" },

  Q_DELAI:    { axis: "delai", label: "Depuis combien de temps les symptômes ?" },
  Q_VAX:      { axis: "expo", label: "Vaccinations à jour ? Antécédents notables ?" },
  Q_GORGE:    { axis: "symp", label: "Mal de gorge, difficulté à avaler ?" },
  Q_PIQURE:   { axis: "expo", label: "Piqûres de tique ou de moustique récentes ?" },
};

// ====================================================================
// PATIENTS — banque de 14 cas ; 6 tirés au sort à chaque partie
// Chaque patient a :
//   - identité, motif d'accueil
//   - vitals
//   - "quote" : ce que dit le patient à l'accueil
//   - relevantQuestions : questions qui révèlent une info utile (priorisées)
//   - reveals : info révélée par question
//   - isREB : vraie suspicion REB ?
//   - expected : checklist EPI/protection attendue
//   - resolution : narration de l'agent suspecté
// ====================================================================
const PATIENTS_BANK = [
  {
    id: 1,
    name: "Mme Diallo",
    age: "42 ans · F",
    motif: "Fièvre et fatigue extrême depuis 4 jours.",
    avatar: "MD",
    arrivee: "23h17",
    vitals: [
      { label: "Temp.", value: "39.4°C", alert: true },
      { label: "FC", value: "108" },
      { label: "TA", value: "112/68" },
      { label: "SpO2", value: "96%" },
    ],
    quote: "Je suis revenue de Bunia, en RDC, il y a une semaine, j'ai aidé mon oncle qui était malade là-bas. Je me sens vraiment faible et j'ai mal au ventre.",
    relevantQuestions: ["Q_FIEVRE", "Q_VOYAGE", "Q_CONTACT", "Q_DELAI", "Q_DIG", "Q_SAIGN"],
    reveals: {
      Q_FIEVRE:  { txt: "Fièvre à 39.4°C, frissons, asthénie majeure.", critical: false },
      Q_VOYAGE:  { txt: "Retour de RDC (Bunia, province de l'Ituri) il y a 7 jours. Zone d'épidémie Ebola à virus Bundibugyo active (COREB, sept. 2026).", critical: true },
      Q_CONTACT: { txt: "A soigné son oncle malade à Bunia — décédé depuis. Diarrhée et saignements gingivaux selon elle.", critical: true },
      Q_DELAI:   { txt: "Symptômes depuis 4 jours, compatibles avec l'incubation Ebola (2-21 j).", critical: false },
      Q_DIG:     { txt: "Diarrhées profuses depuis 48h, vomissements ce matin.", critical: true },
      Q_SAIGN:   { txt: "Petits saignements de nez ce soir. Pas d'ecchymoses pour l'instant.", critical: true },
    },
    isREB: true,
    agent: "Maladie à virus Ebola — fièvre hémorragique",
    severity: "high",
    expected: {
      must: ["patient-mask", "ffp2", "surblouse", "gants", "lunettes", "box-dedie", "dasri", "usage-unique"],
      forbidden: ["salle-attente"],
      bonus: ["stop-clim", "patient-sha"],
    },
    resolution: "Patiente suspecte Ebola (virus Bundibugyo, épidémie RDC 2026) classée « cas possible ». Orientation vers ESR REB après alerte SAMU/infectiologue/ARS. Chaîne contact à tracer.",
  },

  {
    id: 2,
    name: "M. Berthier",
    age: "67 ans · H",
    motif: "Douleur thoracique constrictive, sueurs.",
    avatar: "MB",
    arrivee: "23h31",
    vitals: [
      { label: "Temp.", value: "36.8°C" },
      { label: "FC", value: "92" },
      { label: "TA", value: "148/92" },
      { label: "SpO2", value: "97%" },
    ],
    quote: "J'ai une douleur dans la poitrine depuis 40 minutes, ça serre, ça irradie dans le bras gauche. J'ai du mal à respirer.",
    relevantQuestions: ["Q_FIEVRE", "Q_RESPI", "Q_DELAI", "Q_VOYAGE", "Q_CONTACT"],
    reveals: {
      Q_FIEVRE:  { txt: "Pas de fièvre. Sueurs profuses.", critical: false },
      Q_RESPI:   { txt: "Dyspnée modérée, pas de toux. Pas de contexte infectieux.", critical: false },
      Q_DELAI:   { txt: "Douleur brutale depuis 40 minutes.", critical: false },
      Q_VOYAGE:  { txt: "Pas de voyage. Vit à Lille, n'a pas quitté la région.", critical: false },
      Q_CONTACT: { txt: "Aucun contact avec personne malade.", critical: false },
    },
    isREB: false,
    agent: "Syndrome coronarien aigu — pas de suspicion REB",
    severity: "high",
    expected: {
      must: [],
      forbidden: ["patient-mask", "ffp2", "surblouse", "lunettes", "box-dedie", "stop-clim", "dasri"],
      bonus: [],
    },
    resolution: "Pas de REB. Urgence vitale cardiologique : ECG immédiat, déchocage, appel cardio/SMUR. Filière classique ultra-prioritaire.",
  },

  {
    id: 3,
    name: "M. Aroua",
    age: "31 ans · H",
    motif: "Fièvre et lésions cutanées.",
    avatar: "MA",
    arrivee: "00h04",
    vitals: [
      { label: "Temp.", value: "38.6°C", alert: true },
      { label: "FC", value: "94" },
      { label: "TA", value: "124/74" },
      { label: "SpO2", value: "98%" },
    ],
    quote: "Je reviens de République Démocratique du Congo il y a 12 jours. J'ai des boutons étranges qui sortent depuis 3 jours, surtout sur les mains et le visage. Et mes ganglions sont gonflés.",
    relevantQuestions: ["Q_FIEVRE", "Q_ERUPT", "Q_VOYAGE", "Q_CONTACT", "Q_DELAI"],
    reveals: {
      Q_FIEVRE:  { txt: "Fièvre à 38.6°C, céphalées, courbatures intenses avant l'éruption.", critical: false },
      Q_ERUPT:   { txt: "Vésicules / pustules toutes au même stade, profondes, paume + plante + visage. Adénopathies marquées.", critical: true },
      Q_VOYAGE:  { txt: "Retour de RDC (province du Sud-Kivu) il y a 12 jours. Zone d'épidémie Mpox clade I.", critical: true },
      Q_CONTACT: { txt: "A été hébergé chez de la famille avec enfants présentant des lésions similaires.", critical: true },
      Q_DELAI:   { txt: "Prodromes fébriles il y a 5 jours, éruption depuis 3 jours.", critical: false },
    },
    isREB: true,
    agent: "Mpox clade I (variole simienne)",
    severity: "high",
    expected: {
      must: ["patient-mask", "ffp2", "surblouse", "gants", "lunettes", "box-dedie", "dasri", "usage-unique"],
      forbidden: ["salle-attente"],
      bonus: ["patient-sha"],
    },
    resolution: "Suspicion Mpox clade I. Précautions contact, masque chirurgical au patient ; FFP2 et lunettes retenues ici par précaution au tri (lésions buccales), la fiche COREB du 18/03/2026 les réservant aux soins à risque d'aérosolisation. Alerte infectiologue référent ESR. Recherche des contacts (avion, hébergement) : vaccination post-exposition idéalement sous 4 jours.",
  },

  {
    id: 4,
    name: "Léa Marchand",
    age: "8 ans · F",
    motif: "Fièvre et vomissements depuis 24h.",
    avatar: "LM",
    arrivee: "00h22",
    vitals: [
      { label: "Temp.", value: "38.9°C", alert: true },
      { label: "FC", value: "118" },
      { label: "TA", value: "98/56" },
      { label: "SpO2", value: "99%" },
    ],
    quote: "(la maman) Elle a la gastro je crois. Toute la classe l'a eue cette semaine. Elle vomit beaucoup et a la diarrhée.",
    relevantQuestions: ["Q_FIEVRE", "Q_DIG", "Q_CONTACT", "Q_VOYAGE", "Q_DELAI", "Q_ERUPT"],
    reveals: {
      Q_FIEVRE:  { txt: "Fièvre 38.9°C, état général conservé entre les vomissements.", critical: false },
      Q_DIG:     { txt: "5 épisodes de vomissements, 3 selles liquides. Pas de sang.", critical: false },
      Q_CONTACT: { txt: "Épidémie scolaire de gastro-entérite virale documentée à l'école — 8 cas dans la classe.", critical: false },
      Q_VOYAGE:  { txt: "Aucun voyage hors France ces 6 derniers mois.", critical: false },
      Q_DELAI:   { txt: "Symptômes depuis 24 heures.", critical: false },
      Q_ERUPT:   { txt: "Pas d'éruption.", critical: false },
    },
    isREB: false,
    agent: "Gastro-entérite virale communautaire pédiatrique",
    severity: "medium",
    expected: {
      must: [],
      forbidden: ["ffp2", "surblouse", "lunettes", "stop-clim"],
      bonus: ["patient-mask", "box-dedie"],
    },
    resolution: "GEA virale d'origine collective scolaire — précautions standard + contact suffisantes. Hydratation, surveillance. Pas de REB.",
  },

  {
    id: 5,
    name: "M. Yılmaz",
    age: "54 ans · H",
    motif: "Fièvre, toux et essoufflement depuis 5 jours.",
    avatar: "MY",
    arrivee: "01h08",
    vitals: [
      { label: "Temp.", value: "39.1°C", alert: true },
      { label: "FC", value: "112" },
      { label: "TA", value: "126/76" },
      { label: "SpO2", value: "92%", alert: true },
    ],
    quote: "Je suis chauffeur, je rentre d'un convoi entre Istanbul et Riyad il y a 9 jours. J'ai eu de la fièvre puis une grosse toux, et là j'ai du mal à respirer. J'ai dormi près des chameaux d'un éleveur.",
    relevantQuestions: ["Q_FIEVRE", "Q_RESPI", "Q_VOYAGE", "Q_ANIMAL", "Q_DELAI", "Q_CONTACT"],
    reveals: {
      Q_FIEVRE:  { txt: "Fièvre 39.1°C depuis 5 jours, frissons.", critical: false },
      Q_RESPI:   { txt: "Toux productive, dyspnée d'aggravation rapide. Sat. 92% à l'arrivée.", critical: true },
      Q_VOYAGE:  { txt: "Retour de péninsule arabique (Arabie saoudite) il y a 9 jours.", critical: true },
      Q_ANIMAL: { txt: "Contact rapproché avec dromadaires d'un éleveur local (lait cru, étable).", critical: true },
      Q_DELAI:   { txt: "Incubation compatible avec MERS-CoV (2-14 jours).", critical: false },
      Q_CONTACT: { txt: "Pas de cas similaire documenté dans son entourage proche.", critical: false },
    },
    isREB: true,
    agent: "Suspicion MERS-CoV",
    severity: "high",
    expected: {
      must: ["patient-mask", "ffp2", "surblouse", "gants", "lunettes", "box-dedie", "dasri", "usage-unique"],
      forbidden: ["salle-attente"],
      bonus: ["stop-clim", "patient-sha"],
    },
    resolution: "Suspicion MERS-CoV : zone d'exposition + contact dromadaire + détresse respiratoire. Alerte triade SAMU/infectiologue/ARS, transfert ESR REB.",
  },

  {
    id: 6,
    name: "Mme Costa",
    age: "29 ans · F",
    motif: "Maux de tête et nausées après une soirée.",
    avatar: "MC",
    arrivee: "02h11",
    vitals: [
      { label: "Temp.", value: "37.1°C" },
      { label: "FC", value: "88" },
      { label: "TA", value: "118/70" },
      { label: "SpO2", value: "99%" },
    ],
    quote: "J'ai trop bu hier, et j'ai mal au crâne depuis ce matin. J'ai vomi 2 fois. C'est tout, je crois.",
    relevantQuestions: ["Q_FIEVRE", "Q_RESPI", "Q_DIG", "Q_VOYAGE", "Q_CONTACT", "Q_DELAI"],
    reveals: {
      Q_FIEVRE:  { txt: "Pas de fièvre (37.1°C).", critical: false },
      Q_RESPI:   { txt: "Pas de toux, pas de dyspnée.", critical: false },
      Q_DIG:     { txt: "2 vomissements, pas de diarrhée.", critical: false },
      Q_VOYAGE:  { txt: "Aucun voyage récent. Soirée à Amiens.", critical: false },
      Q_CONTACT: { txt: "Aucun contact malade.", critical: false },
      Q_DELAI:   { txt: "Apparition ce matin, post-prandial post-alcoolisation.", critical: false },
    },
    isREB: false,
    agent: "Céphalées post-éthyliques — pas de REB",
    severity: "low",
    expected: {
      must: [],
      forbidden: ["patient-mask", "ffp2", "surblouse", "lunettes", "box-dedie", "stop-clim", "dasri"],
      bonus: [],
    },
    resolution: "Tableau bénin d'imprégnation alcoolique. Filière classique, surveillance, réhydratation. Aucune mesure REB.",
  },

  // ---------------- Banque élargie v0.5 (fiches COREB 2025-2026) ----------------
  {
    id: 7,
    name: "M. Haidari",
    age: "24 ans · H",
    motif: "Mal de gorge intense, difficulté à avaler.",
    avatar: "MH",
    vitals: [
      { label: "Temp.", value: "38.3°C", alert: true },
      { label: "FC", value: "104" },
      { label: "TA", value: "122/70" },
      { label: "SpO2", value: "97%" },
    ],
    quote: "J'ai très mal à la gorge depuis trois jours, j'ai du mal à avaler, et mon cou est gonflé. Je dors dans un campement près de Dunkerque.",
    relevantQuestions: ["Q_GORGE", "Q_VAX", "Q_CONTACT", "Q_FIEVRE", "Q_DELAI", "Q_RESPI"],
    reveals: {
      Q_GORGE:   { txt: "Fausses membranes blanchâtres très adhérentes sur les amygdales, qui saignent au contact. Volumineuses adénopathies cervicales.", critical: true },
      Q_VAX:     { txt: "Statut vaccinal inconnu, aucun carnet. Arrivé en France il y a deux mois après un long parcours migratoire.", critical: true },
      Q_CONTACT: { txt: "Un autre occupant du campement a eu la même angine la semaine dernière.", critical: true },
      Q_FIEVRE:  { txt: "Fièvre à 38.3°C, frissons modérés.", critical: false },
      Q_DELAI:   { txt: "Symptômes depuis 3 jours, compatibles avec l'incubation (2 à 5 jours en moyenne).", critical: false },
      Q_RESPI:   { txt: "Voix légèrement rauque, pas de stridor pour l'instant. À surveiller : risque d'extension laryngée.", critical: true },
    },
    isREB: true,
    agent: "Suspicion de diphtérie ORL",
    severity: "high",
    soignantSet: ["soignant-mask"],
    expected: {
      must: ["patient-mask", "soignant-mask", "box-dedie", "dasri"],
      forbidden: ["salle-attente"],
      bonus: ["patient-sha", "gants"],
    },
    resolution: "Suspicion de diphtérie ORL (fiche COREB du 24/09/2026). Isolement en chambre individuelle, masque chirurgical et SHA pour le patient, masque à usage médical pour le soignant (FFP2 et lunettes seulement pour les gestes à risque d'aérosolisation). Écouvillonnage ORL en urgence, culture et PCR du gène tox, antibiothérapie dès les prélèvements faits ; sérothérapie sans attendre si atteinte cardiaque ou neurologique. Signalement ARS dès le gène tox mis en évidence, recensement des contacts (antibioprophylaxie, prélèvement de gorge, rappel vaccinal).",
  },

  {
    id: 8,
    name: "Mme Okafor",
    age: "38 ans · F",
    motif: "Fièvre progressive, mal de gorge, grande fatigue.",
    avatar: "MO",
    vitals: [
      { label: "Temp.", value: "38.9°C", alert: true },
      { label: "FC", value: "102" },
      { label: "TA", value: "104/64" },
      { label: "SpO2", value: "97%" },
    ],
    quote: "Je suis rentrée du Nigeria il y a neuf jours, j'étais dans le village de ma mère. Depuis quelques jours la fièvre monte, j'ai mal en avalant et mon visage a gonflé ce matin.",
    relevantQuestions: ["Q_VOYAGE", "Q_ANIMAL", "Q_GORGE", "Q_FIEVRE", "Q_SAIGN", "Q_DELAI", "Q_CONTACT"],
    reveals: {
      Q_VOYAGE:  { txt: "Séjour de trois semaines en zone rurale, État d'Edo (Nigeria), zone d'endémie de la fièvre de Lassa.", critical: true },
      Q_ANIMAL:  { txt: "Des rats circulaient dans la réserve de riz de la maison familiale ; elle a nettoyé leurs déjections.", critical: true },
      Q_GORGE:   { txt: "Odynophagie, pharynx inflammatoire, œdème du visage et du cou apparu ce matin.", critical: true },
      Q_FIEVRE:  { txt: "Fièvre d'installation progressive depuis 5 jours, céphalées, douleurs diffuses.", critical: false },
      Q_SAIGN:   { txt: "Saignement des gencives au brossage depuis hier.", critical: true },
      Q_DELAI:   { txt: "Retour il y a 9 jours, symptômes depuis 5 jours : compatible avec l'incubation (2 à 21 jours).", critical: false },
      Q_CONTACT: { txt: "Pas de malade connu dans l'entourage.", critical: false },
    },
    isREB: true,
    agent: "Suspicion de fièvre de Lassa (fièvre hémorragique virale)",
    severity: "high",
    expected: {
      must: ["patient-mask", "ffp2", "surblouse", "gants", "lunettes", "box-dedie", "dasri", "usage-unique"],
      forbidden: ["salle-attente"],
      bonus: ["stop-clim", "patient-sha"],
    },
    resolution: "Suspicion de fièvre de Lassa (fiche COREB FHV Lassa, juillet 2026). EPI FHV complets, isolement strict. Aux urgences : aucun examen ni prélèvement, aucun geste invasif sans urgence thérapeutique, AINS et anticoagulants contre-indiqués. Triade d'expertise (infectiologue référent REB, SAMU-Centre 15, ARS) et CNR FHV pour le classement, transfert par le SAMU compétent vers l'ESR, qui réalise le diagnostic.",
  },

  {
    id: 9,
    name: "M. Ferrer",
    age: "46 ans · H",
    motif: "Fièvre brutale, courbatures, saignement de nez.",
    avatar: "MF",
    vitals: [
      { label: "Temp.", value: "39.6°C", alert: true },
      { label: "FC", value: "116" },
      { label: "TA", value: "100/62" },
      { label: "SpO2", value: "96%" },
    ],
    quote: "Je rentre d'une semaine de chasse en Estrémadure, en Espagne. La fièvre est tombée d'un coup avant-hier, j'ai vomi, et ce soir je saigne du nez.",
    relevantQuestions: ["Q_PIQURE", "Q_ANIMAL", "Q_VOYAGE", "Q_SAIGN", "Q_FIEVRE", "Q_DIG", "Q_DELAI"],
    reveals: {
      Q_PIQURE:  { txt: "A retiré une grosse tique aux pattes annelées sur sa jambe il y a 5 jours.", critical: true },
      Q_ANIMAL:  { txt: "A dépecé des lièvres à mains nues pendant le séjour.", critical: true },
      Q_VOYAGE:  { txt: "Retour d'Estrémadure (Espagne), zone où des cas de fièvre hémorragique de Crimée-Congo sont décrits.", critical: true },
      Q_SAIGN:   { txt: "Épistaxis ce soir, quelques ecchymoses sur les avant-bras.", critical: true },
      Q_FIEVRE:  { txt: "Fièvre brutale à 39.6°C, syndrome pseudo-grippal intense.", critical: false },
      Q_DIG:     { txt: "Vomissements depuis hier, diarrhée ce matin.", critical: true },
      Q_DELAI:   { txt: "Symptômes 3 jours après la piqûre : compatible (1 à 3 jours, maximum 9 jours après piqûre de tique).", critical: false },
    },
    isREB: true,
    agent: "Suspicion de fièvre hémorragique de Crimée-Congo (FHCC)",
    severity: "high",
    expected: {
      must: ["patient-mask", "ffp2", "surblouse", "gants", "lunettes", "box-dedie", "dasri", "usage-unique"],
      forbidden: ["salle-attente"],
      bonus: ["stop-clim", "patient-sha"],
    },
    resolution: "Suspicion de FHCC (fiche COREB du 31/03/2026). Patient excréteur (vomissements, épistaxis) : mesures renforcées REB, EPI complets. Signes hémorragiques : classement d'emblée en cas possible. AINS et anticoagulants contre-indiqués ; traitement d'épreuve (antipaludique et/ou C3G + doxycycline) après avis de l'infectiologue référent. Triade d'expertise, CNR FHV, transfert par SAMU vers l'ESR.",
  },

  {
    id: 10,
    name: "M. Lefebvre",
    age: "58 ans · H",
    motif: "Fièvre, toux et yeux rouges.",
    avatar: "ML",
    vitals: [
      { label: "Temp.", value: "38.8°C", alert: true },
      { label: "FC", value: "98" },
      { label: "TA", value: "134/80" },
      { label: "SpO2", value: "94%", alert: true },
    ],
    quote: "Je suis éleveur de canards. Les services vétérinaires sont venus cette semaine, il y a eu de la mortalité dans mes bâtiments. Depuis hier j'ai de la fièvre, je tousse et j'ai les yeux qui piquent.",
    relevantQuestions: ["Q_ANIMAL", "Q_PROF", "Q_RESPI", "Q_FIEVRE", "Q_DELAI", "Q_CONTACT"],
    reveals: {
      Q_ANIMAL:  { txt: "A ramassé des canards morts sans masque ; foyer d'influenza aviaire hautement pathogène confirmé dans l'élevage par la DDPP.", critical: true },
      Q_PROF:    { txt: "Éleveur de volailles, exposition professionnelle directe.", critical: true },
      Q_RESPI:   { txt: "Toux sèche, gêne respiratoire modérée, conjonctivite bilatérale.", critical: true },
      Q_FIEVRE:  { txt: "Fièvre à 38.8°C d'apparition brutale, myalgies.", critical: false },
      Q_DELAI:   { txt: "Symptômes 4 jours après l'exposition : compatible (moins de 10 jours).", critical: false },
      Q_CONTACT: { txt: "Son fils travaille avec lui, sans symptôme à ce jour.", critical: false },
    },
    isREB: true,
    agent: "Suspicion de grippe zoonotique A(H5N1)",
    severity: "high",
    expected: {
      must: ["patient-mask", "ffp2", "surblouse", "gants", "lunettes", "box-dedie", "dasri"],
      forbidden: ["salle-attente"],
      bonus: ["patient-sha", "usage-unique"],
    },
    resolution: "Suspicion de grippe zoonotique (fiche COREB du 13/11/2025). Patient : SHA, masque chirurgical, chambre individuelle. Soignant : FFP2, gants, surblouse, lunettes, équipe dédiée sans étudiant. PCR grippe A/B avec sous-typage sur écouvillon nasopharyngé et conjonctival (test antigénique rapide inutilisable). Oseltamivir le plus tôt possible. Avis infectiologue référent REB, déclaration obligatoire à l'ARS, hospitalisation à privilégier en ESR ; prélèvements en triple emballage UN3373.",
  },

  {
    id: 11,
    name: "Mme Rasoanaivo",
    age: "33 ans · F",
    motif: "Fièvre brutale, toux, crachats sanglants.",
    avatar: "MR",
    vitals: [
      { label: "Temp.", value: "39.9°C", alert: true },
      { label: "FC", value: "124" },
      { label: "TA", value: "96/58" },
      { label: "SpO2", value: "91%", alert: true },
    ],
    quote: "Je suis rentrée de Madagascar il y a quatre jours. Là-bas, je suis allée à la veillée d'un voisin mort très vite d'une fièvre avec de la toux. Depuis hier je tousse et je crache du sang.",
    relevantQuestions: ["Q_VOYAGE", "Q_CONTACT", "Q_RESPI", "Q_FIEVRE", "Q_ANIMAL", "Q_DELAI"],
    reveals: {
      Q_VOYAGE:  { txt: "Retour des hauts plateaux de Madagascar, zone d'endémie de la peste, en pleine saison épidémique.", critical: true },
      Q_CONTACT: { txt: "Veillée funéraire d'un voisin décédé en 48 h d'une pneumopathie fébrile, contact rapproché.", critical: true },
      Q_RESPI:   { txt: "Toux, douleur thoracique, expectorations hémoptoïques, dyspnée d'aggravation rapide.", critical: true },
      Q_FIEVRE:  { txt: "Fièvre à 39.9°C de début brutal, frissons.", critical: false },
      Q_ANIMAL:  { txt: "Rats morts signalés dans le village.", critical: true },
      Q_DELAI:   { txt: "Symptômes 3 jours après le contact : compatible avec une forme pulmonaire primitive (1 à 4 jours).", critical: false },
    },
    isREB: true,
    agent: "Suspicion de peste pulmonaire",
    severity: "high",
    soignantSet: ["soignant-mask", "gants"],
    expected: {
      must: ["patient-mask", "soignant-mask", "box-dedie", "dasri"],
      forbidden: ["salle-attente"],
      bonus: ["patient-sha", "gants", "ffp2"],
    },
    resolution: "Suspicion de peste pulmonaire (fiche radar COREB peste). Chambre individuelle, masque chirurgical au patient, précautions gouttelettes avec masque chirurgical pour le soignant dès l'entrée, FFP2 pour tout geste aérosolisant. Urgence thérapeutique : hémocultures et expectorations sans retarder l'antibiothérapie (fluoroquinolone IV, gentamicine si gravité) après avis de l'infectiologue référent. Déclaration obligatoire à l'ARS, transport SMUR sous régulation SAMU, prélèvements en catégorie B, prophylaxie de 7 jours pour les contacts.",
  },

  {
    id: 12,
    name: "M. Kouassi",
    age: "41 ans · H",
    motif: "Fièvre élevée et frissons depuis 2 jours.",
    avatar: "MK",
    vitals: [
      { label: "Temp.", value: "39.8°C", alert: true },
      { label: "FC", value: "112" },
      { label: "TA", value: "118/72" },
      { label: "SpO2", value: "98%" },
    ],
    quote: "Je suis rentré d'Abidjan il y a dix jours, un déplacement professionnel. Je n'ai pas pris de traitement contre le paludisme. J'ai de grosses poussées de fièvre avec des frissons.",
    relevantQuestions: ["Q_VOYAGE", "Q_FIEVRE", "Q_CONTACT", "Q_ANIMAL", "Q_SAIGN", "Q_DELAI"],
    reveals: {
      Q_VOYAGE:  { txt: "Séjour de 2 semaines à Abidjan (Côte d'Ivoire), en hôtel, réunions en ville, sans chimioprophylaxie antipaludique.", critical: true },
      Q_FIEVRE:  { txt: "Accès fébriles à 39.8°C avec frissons et sueurs, céphalées.", critical: true },
      Q_CONTACT: { txt: "Aucun contact avec une personne malade, aucun soin, aucune cérémonie funéraire.", critical: false },
      Q_ANIMAL:  { txt: "Aucun contact avec des animaux ou des rongeurs.", critical: false },
      Q_SAIGN:   { txt: "Aucun saignement.", critical: false },
      Q_DELAI:   { txt: "Fièvre depuis 48 heures, apparue 8 jours après le retour.", critical: false },
    },
    isREB: false,
    agent: "Paludisme probable, sans critère d'exposition REB",
    severity: "high",
    nonRebNote: "Urgence diagnostique : frottis-goutte épaisse ou TDR immédiat, recherche des signes de gravité. Toute fièvre au retour de zone d'endémie est un paludisme jusqu'à preuve du contraire.",
    expected: {
      must: [],
      forbidden: ["ffp2", "surblouse", "lunettes", "stop-clim", "dasri"],
      bonus: [],
    },
    resolution: "Pas de critère d'exposition FHV (pas de contact malade, pas de rongeur, pas de zone d'alerte) : pas de suspicion REB, précautions standard. Mais urgence diagnostique : paludisme à P. falciparum probable, frottis-goutte épaisse ou TDR immédiat, signes de gravité, artésunate IV si paludisme grave.",
  },

  {
    id: 13,
    name: "Mme Lucas",
    age: "27 ans · F",
    motif: "Fièvre, douleurs derrière les yeux, boutons.",
    avatar: "ML",
    vitals: [
      { label: "Temp.", value: "38.7°C", alert: true },
      { label: "FC", value: "96" },
      { label: "TA", value: "112/70" },
      { label: "SpO2", value: "99%" },
    ],
    quote: "Je rentre de Guadeloupe depuis six jours. J'ai de la fièvre, très mal derrière les yeux et dans les muscles, et depuis ce matin des petits boutons rouges sur le corps.",
    relevantQuestions: ["Q_VOYAGE", "Q_PIQURE", "Q_ERUPT", "Q_FIEVRE", "Q_SAIGN", "Q_DELAI"],
    reveals: {
      Q_VOYAGE:  { txt: "Séjour de 10 jours en Guadeloupe, zone de circulation de la dengue.", critical: true },
      Q_PIQURE:  { txt: "Nombreuses piqûres de moustiques, sans répulsif.", critical: true },
      Q_ERUPT:   { txt: "Éruption maculopapuleuse diffuse apparue au 4e jour de fièvre.", critical: true },
      Q_FIEVRE:  { txt: "Fièvre à 38.7°C, céphalées rétro-orbitaires, myalgies, arthralgies.", critical: false },
      Q_SAIGN:   { txt: "Aucun saignement, pas de douleur abdominale ni de vomissements.", critical: false },
      Q_DELAI:   { txt: "Fièvre apparue 2 jours après le retour.", critical: false },
    },
    isREB: false,
    agent: "Dengue probable, arbovirose sans REB",
    severity: "medium",
    nonRebNote: "Pas de REB, mais pas d'AINS ni d'aspirine, NFS-plaquettes, recherche des signes d'alerte. Protection contre les moustiques si vecteur actif (avis ARS).",
    expected: {
      must: [],
      forbidden: ["ffp2", "surblouse", "lunettes", "stop-clim", "dasri"],
      bonus: [],
    },
    resolution: "Dengue probable : arbovirose sans transmission interhumaine directe, précautions standard. Pas d'AINS ni d'aspirine, NFS-plaquettes, NS1 ou PCR, surveillance des signes d'alerte. Déclaration à l'ARS en France hexagonale pour la lutte anti-vectorielle. Penser au paludisme si séjour en zone d'endémie.",
  },

  {
    id: 14,
    name: "M. Girard",
    age: "22 ans · H",
    motif: "Fièvre, toux, yeux rouges, éruption.",
    avatar: "MG",
    vitals: [
      { label: "Temp.", value: "39.4°C", alert: true },
      { label: "FC", value: "108" },
      { label: "TA", value: "120/74" },
      { label: "SpO2", value: "97%" },
    ],
    quote: "J'ai de la fièvre et je tousse depuis quatre jours, j'ai les yeux rouges, et ce matin des plaques rouges sont apparues derrière les oreilles puis sur le visage.",
    relevantQuestions: ["Q_ERUPT", "Q_VAX", "Q_CONTACT", "Q_FIEVRE", "Q_RESPI", "Q_DELAI"],
    reveals: {
      Q_ERUPT:   { txt: "Éruption maculopapuleuse débutant derrière les oreilles, descendante. Petites taches blanches à l'intérieur des joues.", critical: true },
      Q_VAX:     { txt: "Jamais vacciné contre la rougeole (choix parental).", critical: true },
      Q_CONTACT: { txt: "Soirée étudiante il y a 12 jours ; un participant a depuis été hospitalisé pour rougeole.", critical: true },
      Q_FIEVRE:  { txt: "Fièvre à 39.4°C depuis 4 jours.", critical: false },
      Q_RESPI:   { txt: "Toux sèche, rhinite, conjonctivite.", critical: false },
      Q_DELAI:   { txt: "Éruption 12 jours après le contage : typique.", critical: false },
    },
    isREB: false,
    noOverReachPenalty: true,
    agent: "Rougeole : pas un REB COREB, précautions AIR immédiates",
    severity: "medium",
    nonRebNote: "Pas un REB au sens COREB, mais précautions AIR immédiates : masque chirurgical au patient, FFP2 pour le soignant, chambre individuelle porte fermée, pas de salle d'attente commune.",
    expected: {
      must: [],
      forbidden: ["stop-clim", "dasri"],
      bonus: [],
    },
    resolution: "Rougeole probable. Pas de procédure REB ni d'ESR, mais virus très contagieux par voie aérienne : précautions AIR (masque chirurgical au patient, FFP2 pour le soignant, chambre individuelle porte fermée, pièce aérée ou condamnée 2 h après départ). PCR salivaire ou oropharyngée, déclaration obligatoire immédiate à l'ARS, alerte EOH et santé au travail. Contacts : vaccination dans les 72 h, immunoglobulines dans les 6 jours pour les personnes à risque.",
  },
];

// Tirage : 6 patients par partie, dont 3 ou 4 suspicions REB.
const PATIENTS_PER_GAME = 6;
const ARRIVALS = ["23h17", "23h31", "00h04", "00h22", "01h08", "02h11"];
let PATIENTS = [];
function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
function drawPatients() {
  const reb = shuffle(PATIENTS_BANK.filter((p) => p.isREB));
  const non = shuffle(PATIENTS_BANK.filter((p) => !p.isREB));
  const nReb = Math.random() < 0.5 ? 3 : 4;
  const pick = shuffle(reb.slice(0, nReb).concat(non.slice(0, PATIENTS_PER_GAME - nReb)));
  return pick.map((p, i) => Object.assign({}, p, { arrivee: ARRIVALS[i] }));
}
window.PATIENTS_BANK = PATIENTS_BANK;

// ====================================================================
// ÉTAT DE JEU
// ====================================================================

const state = {
  patientIndex: 0,
  patientStartTime: 0,
  questionsAsked: [],
  selectedQuestions: [],
  decision: null,
  protectionChoices: [],
  timer: null,
  timeLeft: 60,
  totalTime: 60,
  scores: { vigilance: 0, protection: 0, delai: 0, pratiques: 0 },
  patientResults: [],
  badges: new Set(),
};

// Chronomètres désactivés pour le moment (v0.4).
// Passer à true pour réactiver les timers des modules 1, 2 et 3.
window.REB_TIMERS_ENABLED = false;
const TIMERS_ON = () => window.REB_TIMERS_ENABLED === true;
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.toggle("timers-off", !TIMERS_ON());
});

const MAX_QUESTIONS = 3;
const PATIENT_TIME = 60;

// ====================================================================
// HELPERS DOM
// ====================================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showScreen(id) {
  $$(".screen").forEach((s) => s.classList.remove("screen-active"));
  $(`#${id}`).classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function showPhase(name) {
  $$(".phase").forEach((p) => p.classList.remove("phase-active"));
  $(`#phase-${name}`).classList.add("phase-active");
  $$(".phase-tab").forEach((t) => {
    t.classList.remove("phase-active");
    if (t.dataset.phase === name) t.classList.add("phase-active");
  });
}

function toast(msg, kind = "") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast " + kind;
  t.hidden = false;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => { t.hidden = true; }, 300);
  }, 2200);
}

// ====================================================================
// INTRO / NAVIGATION
// ====================================================================

// Module 1/2 selector buttons on intro
$$("[data-start-module]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const m = btn.dataset.startModule;
    if (m === "1") {
      startGame();
    } else if (m === "2" && typeof startModule2 === "function") {
      startModule2();
    } else if (m === "3" && typeof startModule3 === "function") {
      startModule3();
    }
  });
});

// Module 2 CTA on Module 1 debrief
const goM2 = document.getElementById("btn-go-module2");
if (goM2) {
  goM2.addEventListener("click", () => {
    if (typeof startModule2 === "function") startModule2();
  });
}

$("#btn-howto").addEventListener("click", () => {
  $("#modal-howto").hidden = false;
});

$("#btn-howto-close").addEventListener("click", () => {
  $("#modal-howto").hidden = true;
});

$("#modal-howto").addEventListener("click", (e) => {
  if (e.target.id === "modal-howto") $("#modal-howto").hidden = true;
});

// Cheat sheet
$("#cheat-toggle").addEventListener("click", () => {
  $("#cheat-panel").hidden = !$("#cheat-panel").hidden;
});
$("#cheat-close").addEventListener("click", () => {
  $("#cheat-panel").hidden = true;
});

// ====================================================================
// GAME FLOW
// ====================================================================

// ====================================================================
// CHEAT SHEET CONTENT (per module)
// ====================================================================

const CHEAT_M1 = `
  <h5>Étape 1 · Dépister</h5>
  <ul>
    <li><strong>Triade</strong> Symptômes + Exposition + Délai d'incubation</li>
    <li>Fièvre + voyage en zone à risque &lt; 21 j ⇒ rechercher une exposition</li>
    <li>Sans exposition : penser paludisme, dengue, rougeole (non REB)</li>
    <li>Contact avec cas, animal, funéraire, soins : à rechercher</li>
  </ul>
  <h5>Étape 2 · Protéger</h5>
  <ul>
    <li>Masque chirurgical au patient + SHA</li>
    <li>EPI soignant : FFP2, sur-blouse, gants, lunettes</li>
    <li>Adapter à l'agent : diphtérie ORL, peste pulmonaire = gouttelettes (masque à usage médical, FFP2 si geste aérosolisant)</li>
    <li>Box dédié porte fermée · ventilation/clim coupées</li>
    <li>DASRI · matériel à usage unique</li>
  </ul>
  <p class="cheat-note">Source : Procédure générique COREB · SFMU 2018.</p>
`;

const CHEAT_M2 = `
  <h5>qSOFA (Sepsis-3)</h5>
  <ul>
    <li>TAS ≤ 100 mmHg</li>
    <li>FR ≥ 22/min</li>
    <li>Confusion / Glasgow &lt; 15</li>
    <li><strong>Score ≥ 2</strong> ⇒ mauvais pronostic</li>
  </ul>
  <h5>SBAR / SAED</h5>
  <ul>
    <li><strong>S</strong>ituation · qui, quoi, quand</li>
    <li><strong>B</strong>ackground / Antécédents · contexte clinique</li>
    <li><strong>A</strong>nalyse / Évaluation · gravité, hypothèses</li>
    <li><strong>R</strong>equest / Demande · action attendue</li>
  </ul>
  <h5>Triade COREB · 1<sup>er</sup> cercle</h5>
  <ol>
    <li>SAMU-Centre 15</li>
    <li>Infectiologue référent REB</li>
    <li>ARS / CIRE</li>
  </ol>
  <p>2<sup>e</sup> cercle : microbiologiste, EOH, direction.</p>
  <p class="cheat-note">Source : COREB · ARS · ESR (procédure 2018-2020).</p>
`;

const CHEAT_M3 = `
  <h5>Étape 7 · Prélever en sécurité</h5>
  <ul>
    <li>Prélèvement sous EPI complet, box dédié</li>
    <li>Triple emballage systématique. FHV : UN2814 catégorie A (P620). Mpox suspect : UN3373 catégorie B (COREB oct. 2024). MERS : UN3373 catégorie B (OMS), selon consigne du labo ESR</li>
    <li>Décontamination du tube primaire (SHA + compresse)</li>
    <li>Contact biologiste + labo de référence préalable</li>
  </ul>
  <h5>Étape 8 · Déshabillage EPI (SF2H)</h5>
  <ol>
    <li>SHA sur gants</li>
    <li>Retrait tablier / surblouse</li>
    <li>Retrait des gants (roll-over)</li>
    <li>SHA sur mains nues</li>
    <li>Retrait lunettes / écran</li>
    <li>Retrait de la FFP2 par les élastiques, en dernier</li>
    <li>SHA finale</li>
  </ol>
  <h5>Étape 9 · Transport</h5>
  <ul>
    <li>ESR de référence confirmé</li>
    <li>Brancardage dédié formé + escorte médicale</li>
    <li>Bio-nettoyage du parcours emprunté</li>
  </ul>
  <h5>Étape 10 · Tracer les contacts</h5>
  <ul>
    <li><strong>A</strong> étroit : soin direct sans EPI complet, fluides, &lt; 1 m prolongé → suivi actif</li>
    <li><strong>B</strong> occasionnel : pièce partagée, EPI incomplet ou bref → auto-surveillance</li>
    <li><strong>C</strong> faible : croisement, EPI complet → information</li>
    <li>Durée : 21 j (Ebola, Mpox) · 14 j (MERS-CoV)</li>
    <li>Mpox : vaccination post-exposition idéalement &lt; 4 j, au plus tard 14 j</li>
    <li>Contacts communautaires → ARS · soignants → EOH + santé au travail</li>
  </ul>
  <p class="cheat-note">Graduation A/B/C : simplification pédagogique, à rapprocher des fiches contacts SpF et COREB.</p>
  <h5>Priorisation appels</h5>
  <ul>
    <li>Critiques (SAMU, biologiste, infectio, ARS, EOH) → répondre</li>
    <li>Secondaires (direction, famille) → différer &lt; 90 s</li>
    <li>Presse → rejeter, renvoi service com</li>
  </ul>
  <p class="cheat-note">Sources : COREB procédure générique (annexe ARS-ESR 2020) · fiche MERS-CoV 09/12/2025 · fiches Mpox 24/10/2024 et 18/03/2026 · SF2H · ADR P620/P650.</p>
`;

function setCheat(module) {
  const body = document.getElementById("cheat-body");
  const title = document.getElementById("cheat-title");
  const toggle = document.getElementById("cheat-toggle");
  if (!body) return;
  if (module === 1) {
    title.textContent = "Mémo COREB · Repérer & Protéger";
    body.innerHTML = CHEAT_M1;
    toggle.hidden = false;
  } else if (module === 2) {
    title.textContent = "Mémo COREB · qSOFA · SBAR · Triade";
    body.innerHTML = CHEAT_M2;
    toggle.hidden = false;
  } else if (module === 3) {
    title.textContent = "Mémo COREB · Prélever · Déshabiller · Transporter · Tracer";
    body.innerHTML = CHEAT_M3;
    toggle.hidden = false;
  } else {
    toggle.hidden = true;
    document.getElementById("cheat-panel").hidden = true;
  }
}
window.setCheat = setCheat;

function startGame() {
  PATIENTS = drawPatients();
  window.PATIENTS = PATIENTS;
  state.patientIndex = 0;
  state.scores = { vigilance: 0, protection: 0, delai: 0, pratiques: 0 };
  state.patientResults = [];
  state.badges = new Set();
  updateScoresUI();
  setCheat(1);
  showScreen("screen-game");
  loadPatient(0);
}

function loadPatient(i) {
  state.patientIndex = i;
  const p = PATIENTS[i];
  state.patientStartTime = Date.now();
  state.selectedQuestions = [];
  state.decision = null;
  state.protectionChoices = [];
  state.timeLeft = PATIENT_TIME;
  state.totalTime = PATIENT_TIME;

  // UI: patient
  $("#patient-index").textContent = i + 1;
  $("#progress-fill").style.width = ((i) / PATIENTS.length * 100) + "%";
  $("#patient-name").textContent = p.name;
  $("#patient-age").textContent = p.age;
  $("#patient-motif").textContent = p.motif;
  $("#patient-time").textContent = "Arrivée · " + p.arrivee;
  $("#patient-avatar").textContent = p.avatar;
  $("#patient-quote").textContent = "« " + p.quote + " »";

  // vitals
  const vitalsEl = $("#vitals");
  vitalsEl.innerHTML = "";
  p.vitals.forEach((v) => {
    const div = document.createElement("div");
    div.className = "vital" + (v.alert ? " alert" : "");
    div.innerHTML = `<span class="vital-label">${v.label}</span><span class="vital-value">${v.value}</span>`;
    vitalsEl.appendChild(div);
  });

  // Render questions
  renderQuestions(p);
  $("#reveals").innerHTML = "";
  $("#btn-to-decision").disabled = true;

  // Reset protection
  $$(".check-item input").forEach((cb) => { cb.checked = false; });

  // Reset phase
  showPhase("interrogation");
  $$(".phase-tab").forEach((t) => t.classList.remove("phase-done"));

  startTimer();
}

function renderQuestions(p) {
  const ql = $("#question-list");
  ql.innerHTML = "";
  // Mix relevant + a few distractors
  const all = Object.keys(QUESTIONS);
  const distractors = all.filter((q) => !p.relevantQuestions.includes(q));
  const shuffled = shuffle([...p.relevantQuestions, ...shuffle(distractors).slice(0, 3)]);
  shuffled.forEach((qId) => {
    const btn = document.createElement("button");
    btn.className = "question-item";
    btn.textContent = QUESTIONS[qId].label;
    btn.dataset.q = qId;
    btn.addEventListener("click", () => selectQuestion(qId, btn));
    ql.appendChild(btn);
  });
}

function selectQuestion(qId, btn) {
  if (state.selectedQuestions.includes(qId)) return;
  if (state.selectedQuestions.length >= MAX_QUESTIONS) {
    toast("Vous avez utilisé vos 3 questions.", "warn");
    return;
  }
  state.selectedQuestions.push(qId);
  btn.classList.add("selected");
  // Reveal
  const p = PATIENTS[state.patientIndex];
  const r = p.reveals[qId];
  const revealEl = document.createElement("div");
  revealEl.className = "reveal" + (r && r.critical ? " reveal-critical" : "");
  if (r) {
    revealEl.innerHTML = `<span class="reveal-label">${QUESTIONS[qId].label}</span>${r.txt}`;
  } else {
    revealEl.innerHTML = `<span class="reveal-label">${QUESTIONS[qId].label}</span><em>« Rien de particulier à signaler de ce côté-là. »</em>`;
  }
  $("#reveals").appendChild(revealEl);

  if (state.selectedQuestions.length >= MAX_QUESTIONS) {
    $$(".question-item:not(.selected)").forEach((b) => b.disabled = true);
    $("#btn-to-decision").disabled = false;
  } else if (state.selectedQuestions.length >= 1) {
    $("#btn-to-decision").disabled = false;
  }
}

$("#btn-to-decision").addEventListener("click", () => {
  $$(".phase-tab[data-phase=interrogation]").forEach((t) => t.classList.add("phase-done"));
  showPhase("decision");
});

// Decision
$$(".decision-card").forEach((card) => {
  card.addEventListener("click", () => {
    state.decision = card.dataset.decision;
    $$(".phase-tab[data-phase=decision]").forEach((t) => t.classList.add("phase-done"));
    if (state.decision === "suspect-reb") {
      showPhase("protection");
    } else {
      // skip protection
      finalizePatient();
    }
  });
});

// Validate protection
$("#btn-validate-protection").addEventListener("click", () => {
  state.protectionChoices = $$(".check-item input:checked").map((cb) => cb.closest(".check-item").dataset.tag);
  $$(".phase-tab[data-phase=protection]").forEach((t) => t.classList.add("phase-done"));
  finalizePatient();
});

// Next patient
$("#btn-next-patient").addEventListener("click", () => {
  if (state.patientIndex + 1 >= PATIENTS.length) {
    showDebrief();
  } else {
    loadPatient(state.patientIndex + 1);
  }
});

// ====================================================================
// TIMER
// ====================================================================

function startTimer() {
  clearInterval(state.timer);
  if (!TIMERS_ON()) return;
  updateTimerUI();
  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      clearInterval(state.timer);
      updateTimerUI();
      // Force finalize with current state
      if (!isFinalizing()) {
        toast("Temps écoulé — finalisation automatique.", "danger");
        finalizePatient(true);
      }
      return;
    }
    updateTimerUI();
  }, 1000);
}

function updateTimerUI() {
  $("#timer-value").textContent = state.timeLeft;
  const ring = $("#timer-ring-fg");
  const pct = state.timeLeft / state.totalTime;
  const total = 2 * Math.PI * 15.5;
  ring.style.strokeDashoffset = total * (1 - pct);
  ring.classList.toggle("warn", pct < 0.5 && pct >= 0.25);
  ring.classList.toggle("danger", pct < 0.25);
}

let _finalizing = false;
function isFinalizing() { return _finalizing; }

// ====================================================================
// SCORING & FEEDBACK
// ====================================================================

function finalizePatient(timedOut = false) {
  if (_finalizing) return;
  _finalizing = true;
  clearInterval(state.timer);

  const p = PATIENTS[state.patientIndex];
  const elapsed = Math.max(0, (Date.now() - state.patientStartTime) / 1000);
  const timeUsed = Math.min(elapsed, state.totalTime);

  // ===== Scoring par patient =====
  // Total max = 100 points, répartis sur 4 axes (25 points max par axe).
  // Chaque patient peut donner jusqu'à 25/6 ≈ 4.17 points par axe.
  const PER_PATIENT = 25 / PATIENTS.length; // ≈ 4.17 points max par axe par patient

  let vig = 0, prot = 0, delai = 0, prat = 0;
  const feedback = { ok: [], bad: [], warn: [] };

  // === VIGILANCE : qualité du tri (questions ciblées + décision juste) ===
  const goodQuestions = state.selectedQuestions.filter((q) => p.relevantQuestions.includes(q)).length;
  const vigFromQuestions = (goodQuestions / MAX_QUESTIONS) * (PER_PATIENT * 0.4);
  vig += vigFromQuestions;
  if (goodQuestions >= 2) {
    feedback.ok.push(`Questions ciblées : ${goodQuestions} / ${MAX_QUESTIONS} pertinentes.`);
  } else {
    feedback.warn.push(`Questions ciblées : seulement ${goodQuestions} / ${MAX_QUESTIONS} pertinentes pour ce tableau.`);
  }

  // Decision correctness
  const decisionCorrect = (p.isREB && state.decision === "suspect-reb") || (!p.isREB && state.decision === "non-reb");
  if (decisionCorrect) {
    vig += PER_PATIENT * 0.6;
    feedback.ok.push(p.isREB ? "Décision juste : patient classé suspect REB." : "Décision juste : pas de suspicion REB.");
  } else {
    if (p.isREB && state.decision === "non-reb") {
      feedback.bad.push("Erreur critique : patient REB classé en filière classique. Risque de transmission majeur.");
    } else if (!p.isREB && state.decision === "suspect-reb") {
      feedback.bad.push("Faux positif : ressources et anxiété mobilisées inutilement.");
      vig += PER_PATIENT * 0.2; // un peu de crédit pour la prudence
    } else if (state.decision === null && timedOut) {
      feedback.bad.push("Pas de décision prise dans le temps imparti.");
    }
  }

  // === PROTECTION : si REB, EPI correct ; sinon, pas de sur-protection ===
  if (p.isREB) {
    if (state.decision === "suspect-reb") {
      const must = p.expected.must;
      const forbidden = p.expected.forbidden;
      const bonus = p.expected.bonus;
      const chosen = new Set(state.protectionChoices);

      const mustHit = must.filter((m) => chosen.has(m)).length;
      const mustMiss = must.filter((m) => !chosen.has(m));
      const forbiddenHit = forbidden.filter((f) => chosen.has(f));
      const bonusHit = bonus.filter((b) => chosen.has(b)).length;

      const baseProt = (mustHit / Math.max(must.length, 1)) * (PER_PATIENT * 0.85);
      const bonusProt = (bonusHit / Math.max(bonus.length, 1)) * (PER_PATIENT * 0.15);
      const penalty = forbiddenHit.length * (PER_PATIENT * 0.25);
      prot = Math.max(0, baseProt + bonusProt - penalty);

      if (mustHit === must.length) {
        feedback.ok.push("EPI et isolement : ensemble complet et conforme.");
      } else if (mustMiss.length > 0) {
        feedback.bad.push("Mesures manquantes : " + mustMiss.map(prettyTag).join(", ") + ".");
      }
      if (forbiddenHit.length > 0) {
        feedback.bad.push("Mesure inappropriée : " + forbiddenHit.map(prettyTag).join(", ") + ".");
      }
      if (bonusHit > 0) {
        feedback.ok.push("Bonus : " + bonus.filter((b) => chosen.has(b)).map(prettyTag).join(", ") + ".");
      }

      // Pratiques : cohérence patient + soignant + environnement
      const hasPatientMeasure = chosen.has("patient-mask");
      const hasSoignantEPI = (p.soignantSet || ["ffp2", "surblouse", "gants"]).every((x) => chosen.has(x));
      const hasEnvIsolement = chosen.has("box-dedie");
      const triple = [hasPatientMeasure, hasSoignantEPI, hasEnvIsolement].filter(Boolean).length;
      prat = (triple / 3) * PER_PATIENT;
      if (triple === 3) feedback.ok.push("Triade patient + soignant + environnement appliquée.");
    } else {
      feedback.bad.push("Aucune protection mise en place sur un patient REB.");
    }
  } else {
    // Non-REB
    if (state.decision === "non-reb") {
      prot = PER_PATIENT;
      prat = PER_PATIENT;
      if (!p.noOverReachPenalty) feedback.ok.push("Pas de sur-protection inutile sur un patient non REB.");
      if (p.nonRebNote) feedback.warn.push(p.nonRebNote);
    } else if (state.decision === "suspect-reb") {
      // sur-réaction : ne pas pénaliser trop, c'est mieux que de rater
      const chosen = new Set(state.protectionChoices);
      const overReach = p.noOverReachPenalty ? 0 : ["ffp2", "surblouse"].filter((x) => chosen.has(x)).length;
      prot = Math.max(0, PER_PATIENT * 0.4 - overReach * PER_PATIENT * 0.1);
      prat = PER_PATIENT * 0.5;
      feedback.warn.push("Sur-réaction. Le tableau ne justifiait pas une procédure REB complète, mais la vigilance reste valorisée.");
      if (p.nonRebNote) feedback.warn.push(p.nonRebNote);
    }
  }

  // === DÉLAI : récompenser la rapidité quand la décision est juste ===
  if (decisionCorrect && !TIMERS_ON()) {
    // Sans chronomètre : l'axe valorise la décision d'orientation juste.
    delai = PER_PATIENT;
    feedback.ok.push("Orientation juste.");
  } else if (decisionCorrect) {
    // Plus c'est rapide, plus on gagne. 100% si <20s, 0% si timedOut.
    const pct = timedOut ? 0 : Math.max(0, Math.min(1, (state.totalTime - timeUsed) / (state.totalTime - 15)));
    delai = pct * PER_PATIENT;
    if (pct > 0.7) feedback.ok.push(`Décision rapide (${Math.round(timeUsed)}s).`);
    else if (pct > 0.3) feedback.warn.push(`Décision tardive (${Math.round(timeUsed)}s).`);
    else if (!timedOut) feedback.warn.push(`Décision très tardive (${Math.round(timeUsed)}s).`);
  } else {
    delai = 0;
  }

  // Cap each axis at PER_PATIENT
  vig = Math.min(vig, PER_PATIENT);
  prot = Math.min(prot, PER_PATIENT);
  delai = Math.min(delai, PER_PATIENT);
  prat = Math.min(prat, PER_PATIENT);

  state.scores.vigilance += vig;
  state.scores.protection += prot;
  state.scores.delai += delai;
  state.scores.pratiques += prat;

  state.patientResults.push({
    patient: p,
    decision: state.decision,
    decisionCorrect,
    timeUsed,
    timedOut,
    questionsAsked: state.selectedQuestions.slice(),
    protectionChoices: state.protectionChoices.slice(),
    feedback,
    pointsTotal: vig + prot + delai + prat,
  });

  // Badges
  if (TIMERS_ON() && p.isREB && decisionCorrect && timeUsed < 30) state.badges.add("Sentinelle rapide");
  if (decisionCorrect && state.patientResults.filter((r) => r.decisionCorrect).length >= 3) state.badges.add("Tri sans faute");
  if (p.isREB && decisionCorrect && state.protectionChoices.includes("ffp2") && state.protectionChoices.includes("box-dedie")) {
    state.badges.add("EPI conforme");
  }

  updateScoresUI();
  renderFeedback();
  _finalizing = false;
}

function prettyTag(tag) {
  const map = {
    "patient-mask": "masque chirurgical au patient",
    "patient-sha": "SHA pour le patient",
    "soignant-mask": "masque à usage médical pour le soignant",
    "ffp2": "APR FFP2",
    "surblouse": "sur-blouse",
    "gants": "gants",
    "lunettes": "lunettes de protection",
    "box-dedie": "box dédié porte fermée",
    "salle-attente": "salle d'attente commune",
    "stop-clim": "arrêt ventilation/clim",
    "dasri": "filière DASRI",
    "usage-unique": "matériel usage unique",
  };
  return map[tag] || tag;
}

function renderFeedback() {
  const r = state.patientResults[state.patientResults.length - 1];
  const p = r.patient;

  let title = "";
  let titleEmoji = "";
  const maxPerPatient = 4 * (25 / PATIENTS.length); // 4 axes × ~4.17 = ~16.67 max par patient
  const ratio = r.pointsTotal / maxPerPatient;
  if (ratio >= 0.85) { title = "Excellent."; titleEmoji = "✓"; }
  else if (ratio >= 0.6) { title = "Correct, à affiner."; titleEmoji = "≈"; }
  else { title = "À retravailler."; titleEmoji = "!"; }

  $("#feedback-title").textContent = title;

  const body = $("#feedback-body");
  body.innerHTML = "";

  // OK / WARN / BAD sections
  const renderSection = (title, lines, kind) => {
    if (lines.length === 0) return "";
    const sec = document.createElement("div");
    sec.className = "feedback-section";
    sec.innerHTML = `<div class="feedback-section-title">${title}</div>` +
      lines.map((l) => `<div class="feedback-line feedback-line-${kind}"><span class="feedback-icon">${kind === 'ok' ? '✓' : kind === 'warn' ? '!' : '✕'}</span><span>${l}</span></div>`).join("");
    body.appendChild(sec);
  };

  renderSection("Points forts", r.feedback.ok, "ok");
  renderSection("À surveiller", r.feedback.warn, "warn");
  renderSection("Erreurs", r.feedback.bad, "bad");

  // Resolution
  const res = $("#patient-resolution");
  res.innerHTML = `<h4>Issue de la prise en charge</h4><p><strong>${p.agent}.</strong> ${p.resolution}</p>`;

  $$(".phase-tab[data-phase=feedback]").forEach((t) => t.classList.remove("phase-done"));
  showPhase("feedback");

  // Update next button label
  const nextBtn = $("#btn-next-patient");
  if (state.patientIndex + 1 >= PATIENTS.length) {
    nextBtn.textContent = "Voir mon debrief";
  } else {
    nextBtn.textContent = "Patient suivant";
  }
}

function updateScoresUI() {
  const animateTo = (el, target) => {
    const cur = parseInt(el.textContent, 10) || 0;
    const tgt = Math.round(target);
    if (cur === tgt) return;
    el.classList.add("pulse");
    setTimeout(() => el.classList.remove("pulse"), 420);
    el.textContent = tgt;
  };
  animateTo($("#score-vigilance"), state.scores.vigilance);
  animateTo($("#score-protection"), state.scores.protection);
  animateTo($("#score-delai"), state.scores.delai);
  animateTo($("#score-pratiques"), state.scores.pratiques);
}

// ====================================================================
// DEBRIEF
// ====================================================================

function showDebrief() {
  showScreen("screen-debrief");
  const total = Math.round(state.scores.vigilance + state.scores.protection + state.scores.delai + state.scores.pratiques);
  $("#total-score").textContent = total;

  let grade = "Apprenti IOA";
  if (total >= 85) grade = "IOA Sentinelle expert";
  else if (total >= 70) grade = "IOA confirmé";
  else if (total >= 50) grade = "IOA en formation";
  $("#score-grade").textContent = grade;

  // Bars (max 25 per axis since 100/4)
  const fill = (id, val, max = 25) => {
    const pct = Math.min(100, (val / max) * 100);
    $(`#bar-${id}`).style.width = pct + "%";
    $(`#val-${id}`).textContent = `${Math.round(val)}/${max}`;
  };
  fill("vigilance", state.scores.vigilance);
  fill("protection", state.scores.protection);
  fill("delai", state.scores.delai);
  fill("pratiques", state.scores.pratiques);

  // Badges
  const badgesEl = $("#badges-earned");
  badgesEl.innerHTML = "";
  if (state.badges.size === 0) {
    badgesEl.innerHTML = '<div style="font-size:0.85rem; color: var(--c-text-muted)">Aucun badge cette session. Rejouez pour les décrocher.</div>';
  } else {
    Array.from(state.badges).forEach((b) => {
      const el = document.createElement("div");
      el.className = "earned-badge";
      el.textContent = b;
      badgesEl.appendChild(el);
    });
  }

  // Replay list
  const replay = $("#replay-list");
  replay.innerHTML = "";
  state.patientResults.forEach((r, i) => {
    const card = document.createElement("div");
    const ratio = r.pointsTotal / (4 * (25 / PATIENTS.length));
    const klass = ratio >= 0.8 ? "r-ok" : ratio >= 0.5 ? "r-warn" : "r-bad";
    card.className = `replay-card ${klass}`;
    const decisionLabel = r.decision === "suspect-reb" ? "Suspect REB" : r.decision === "non-reb" ? "Filière classique" : "Pas de décision";
    const correctLabel = r.decisionCorrect ? "✓ juste" : "✕ erronée";
    card.innerHTML = `
      <div class="replay-num">${i + 1}</div>
      <div class="replay-info">
        <div class="replay-name">${r.patient.name} <span style="font-weight:500; color: var(--c-text-muted); font-size:0.82rem">· ${r.patient.agent}</span></div>
        <div class="replay-summary">Décision : ${decisionLabel} · ${correctLabel}${TIMERS_ON() ? " · " + Math.round(r.timeUsed) + "s" : ""}</div>
      </div>
      <div class="replay-score">${Math.round(r.pointsTotal)}</div>
    `;
    replay.appendChild(card);
  });
}

$("#btn-restart").addEventListener("click", () => {
  setCheat(null);
  showScreen("screen-intro");
});

$("#btn-share-results").addEventListener("click", () => {
  const total = Math.round(state.scores.vigilance + state.scores.protection + state.scores.delai + state.scores.pratiques);
  const txt = `URGENCE REB · Module 1 — Score ${total}/100 · ${$("#score-grade").textContent}\n` +
    `Vigilance ${Math.round(state.scores.vigilance)}/25 · Protection ${Math.round(state.scores.protection)}/25 · ${TIMERS_ON() ? "Délai" : "Orientation"} ${Math.round(state.scores.delai)}/25 · Pratiques ${Math.round(state.scores.pratiques)}/25`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => toast("Résumé copié.", "success"));
  } else {
    toast(txt);
  }
});

// ====================================================================
// UTIL
// ====================================================================

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

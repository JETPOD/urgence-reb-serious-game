// Requires jsdom. Run with: node --test tests/module1-attestation.test.cjs
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const { runInContext } = require("node:vm");
const { JSDOM } = require("jsdom");

const root = process.env.REB_TEST_ROOT || resolve(__dirname, "..");

async function openGame(t) {
  const dom = new JSDOM(readFileSync(resolve(root, "index.html"), "utf8"), {
    url: "https://example.test/urgence-reb-serious-game/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  t.after(() => window.close());

  const context = dom.getInternalVMContext();
  const run = (script) => runInContext(script, context);
  run("Math.random = () => 0.42");
  window.scrollTo = () => {};
  window.print = () => window.dispatchEvent(new window.Event("afterprint"));
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new window.Event("close"));
  };
  // Load the same scripts in the same order as the page.
  const loaded = new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  for (const script of window.document.scripts) {
    const source = script.getAttribute("src");
    run(source ? readFileSync(resolve(root, source), "utf8") : script.textContent);
  }
  await loaded;
  return { window, run, find: (selector) => window.document.querySelector(selector) };
}

function playModule1(game, missOneSuspect) {
  const { window, find } = game;
  find('[data-start-module="1"]').click();
  const patients = Array.from(window.PATIENTS);
  assert.equal(patients.length, 6);
  const missedPatient = missOneSuspect ? patients.findIndex((patient) => patient.isREB) : -1;

  for (const [index, patient] of patients.entries()) {
    for (const question of patient.relevantQuestions.slice(0, 3)) {
      find(`#question-list [data-q="${question}"]`).click();
    }
    assert.equal(find("#btn-to-decision").disabled, false);
    find("#btn-to-decision").click();
    const suspect = patient.isREB && index !== missedPatient;
    find(`#screen-game [data-decision="${suspect ? "suspect-reb" : "non-reb"}"]`).click();
    if (suspect) {
      const measures = new Set([...patient.expected.must, ...patient.expected.bonus]);
      for (const measure of measures) {
        find(`#screen-game [data-tag="${measure}"] input`).click();
      }
      find("#btn-validate-protection").click();
    }
    if (index === missedPatient) {
      assert.match(find("#feedback-body").textContent, /Erreur critique/);
    }
    find("#btn-next-patient").click();
  }
  assert.ok(find("#screen-debrief.screen-active"));
  return patients;
}

function openAttestation({ find }, module = 1) {
  find(`[data-reb-att="${module}"]`).click();
  const dialog = find("dialog.sga-dlg");
  assert.equal(dialog.open, true);
  return dialog;
}

function printAttestation({ window }, dialog) {
  dialog.querySelector("#sga-name").value = "Personne Fictive";
  dialog.querySelector("form").dispatchEvent(new window.Event("submit", { cancelable: true }));
  assert.equal(dialog.open, false);
}

test("partie à 85 avec faux négatif, puis rejeu à 100", async (t) => {
  const game = await openGame(t);
  const { find, run, window } = game;
  const errors = [];
  window.addEventListener("error", (event) => errors.push(event.message));
  const patients = playModule1(game, true);
  assert.equal(find("#total-score").textContent, "85");
  const points = run("state.patientResults.map((r) => r.pointsTotal)");
  const missed = patients.findIndex((patient) => patient.isREB);
  assert.ok(Math.abs(points[missed] - 5 / 3) < 1e-10);
  assert.ok(points.every((score, index) => index === missed || Math.abs(score - 100 / 6) < 1e-10));

  const replay = Array.from(find("#replay-list").children);
  assert.equal(replay.length, 6);
  assert.deepEqual(
    replay.map((card) => card.querySelector(".replay-name").textContent),
    patients.map((p) => `${p.name} · ${p.agent}`)
  );
  assert.match(replay[missed].querySelector(".replay-summary").textContent, /Filière classique · ✕ erronée/);
  assert.equal(replay[missed].querySelector(".replay-score").textContent, "2");

  let dialog = openAttestation(game);
  assert.deepEqual(
    [find("#score-grade").textContent, dialog.querySelector("h2").textContent],
    ["Décisions de sécurité à revoir. Reprenez le repérage et l’orientation des patients suspects REB.", "Attestation de participation"]
  );
  printAttestation(game, dialog);

  find("#btn-restart").click();
  assert.ok(find("#screen-intro.screen-active"));
  playModule1(game, false);
  assert.equal(find("#total-score").textContent, "100");
  assert.equal(find("#score-grade").textContent, "IOA Sentinelle expert");
  assert.equal(find("#replay-list").children.length, 6);

  dialog = openAttestation(game);
  assert.equal(dialog.querySelector(".sga-badge").textContent, "Palier : Réussite avec excellence");
  printAttestation(game, dialog);

  const events = Array.from(window.plausible.q, (args) => Array.from(args));
  assert.deepEqual(events, [
    ["REB Module 1 démarré"],
    ["REB Module 1 terminé"],
    ["Attestation · Participation"],
    ["REB Module 1 démarré"],
    ["REB Module 1 terminé"],
    ["Attestation · Excellence"],
  ]);
  assert.deepEqual(errors, []);
});

for (const [score, display, palier] of [
  [79.99, "80", "Participation"],
  [80, "80", "Réussite"],
  [94.99, "95", "Réussite"],
  [95, "95", "Réussite avec excellence"],
]) {
  test(`score brut ${score} : ${palier}`, async (t) => {
    const game = await openGame(t);
    // Inject the exact score to exercise the real debrief and attestation button.
    game.run(`
      Object.assign(state.scores, { vigilance: 25, protection: 25, delai: 25, pratiques: ${score - 75} });
      showDebrief();
    `);
    assert.equal(game.find("#total-score").textContent, display);
    assert.equal(openAttestation(game).querySelector(".sga-badge").textContent, `Palier : ${palier}`);
  });
}

test("seuls les faux négatifs explicites sont comptés", async (t) => {
  const { run } = await openGame(t);
  const critical = run(`
    state.patientResults = [
      { patient: { isREB: true }, decision: "non-reb" },
      { patient: { isREB: true }, decision: "non-reb" },
      { patient: { isREB: true }, decision: "suspect-reb" },
      { patient: { isREB: false }, decision: "suspect-reb" },
      { patient: { isREB: true }, decision: null },
    ];
    getModule1Result().critical;
  `);
  assert.equal(critical, 2);
});

test("module 1 : à score égal, un faux négatif bloque l’excellence", async (t) => {
  const game = await openGame(t);
  for (const [decision, grade, label] of [
    ["non-reb", /^Décisions de sécurité à revoir/, "Participation"],
    ["suspect-reb", /^IOA Sentinelle expert$/, "Réussite avec excellence"],
  ]) {
    game.run(`
      Object.assign(state.scores, { vigilance: 25, protection: 25, delai: 25, pratiques: 21 });
      state.patientResults = [{
        patient: { isREB: true, name: "Cas fictif", agent: "" },
        decision: "${decision}",
        decisionCorrect: "${decision}" === "suspect-reb",
        pointsTotal: 0,
      }];
      showDebrief();
    `);
    assert.equal(game.find("#total-score").textContent, "96");
    assert.match(game.find("#score-grade").textContent, grade);
    printAttestation(game, openAttestationWithPalier(game, 1, label));
  }
});

function openAttestationWithPalier(game, module, label) {
  const dialog = openAttestation(game, module);
  assert.equal(dialog.querySelector(".sga-badge").textContent, `Palier : ${label}`);
  return dialog;
}

test("module 2 : palier et libellé conservés", async (t) => {
  const game = await openGame(t);
  game.find("#m2-total-score").textContent = "80";
  game.run('showScreen("screen-debrief2")');
  printAttestation(game, openAttestationWithPalier(game, 2, "Réussite"));
  assert.match(game.find("#sga-print").textContent, /module 2 : La Triade/);
});

test("module 3 : à score égal, un rejet critique bloque l’excellence et le badge", async (t) => {
  const game = await openGame(t);
  for (const [resolution, grade, label, badge] of [
    ["reject", /^Appel critique rejeté/, "Participation", false],
    ["answer", /^Réussite avec excellence/, "Réussite avec excellence", true],
  ]) {
    game.run(`
      m3InitState();
      Object.assign(m3State.scores, { secu: 25, logi: 25, contacts: 25, prio: 21.5 });
      m3State.calls.push({ id: "samu", resolution: "${resolution}" });
      m3EndModule(false);
    `);
    assert.equal(game.find("#m3-total-score").textContent, "96,5");
    assert.match(game.find("#m3-score-grade").textContent, grade);
    assert.equal(game.find("#m3-badges-earned").textContent.includes("Coordinateur REB"), badge);
    printAttestation(game, openAttestationWithPalier(game, 3, label));
    assert.match(game.find("#sga-print").textContent, /module 3 : La Filière/);
  }
});

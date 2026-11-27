// Exécution : node --test tests/module2-classement.test.cjs (Playwright et Chromium requis).
// CHROMIUM_PATH permet d'utiliser un Chromium installé sur le système.
const assert = require("node:assert/strict");
const { resolve } = require("node:path");
const { pathToFileURL } = require("node:url");
const { after, before, test } = require("node:test");
const { chromium } = require("playwright");

const root = process.env.REB_TEST_ROOT || resolve(__dirname, "..");
let browser;

before(async () => {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
});

after(async () => {
  await browser?.close();
});

async function openGame(t, timed) {
  const page = await browser.newPage();
  t.after(() => page.close());
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://**/*", (route) => route.abort());
  await page.goto(pathToFileURL(resolve(root, "index.html")).href);
  await page.evaluate((enabled) => { window.REB_TIMERS_ENABLED = enabled; }, timed);
  return { page, errors };
}

async function startModule(page) {
  await page.locator('[data-start-module="2"]').click();
}

async function answerBeforeClassification(page, patient) {
  for (const [key, selected] of Object.entries(patient.qsofa)) {
    if (selected) await page.locator(`#phase-qsofa [data-q="${key}"] input`).check();
  }
  await page.locator("#btn-validate-qsofa").click();
  for (const id of patient.examensExpected) {
    await page.locator(`#exam-list [data-id="${id}"] input`).check();
  }
  for (const id of patient.treatmentsExpected) {
    await page.locator(`#treatment-list [data-id="${id}"] input`).check();
  }
  await page.locator("#btn-validate-examens").click();
  for (const key of Object.keys(patient.sbar)) {
    await page.locator(`[data-section="${key}"] [data-quality="bonne"]`).click();
  }
  await page.locator("#btn-validate-sbar").click();
  for (const id of ["samu", "infectio", "ars", "biolo", "eoh", "direction"]) {
    await page.locator(`#contact-pool [data-id="${id}"]`).click();
  }
  await page.locator("#btn-validate-triade").click();
}

async function playModule(page, mistakes, exclude = false) {
  await startModule(page);
  const patients = await page.evaluate(() => M2_PATIENTS);
  for (const [index, patient] of patients.entries()) {
    await answerBeforeClassification(page, patient);
    const wrongClassification = patient.classement === "possible" ? "suspect" : "possible";
    const classification = index < mistakes ? (exclude ? "exclu" : wrongClassification) : patient.classement;
    await page.locator(`#phase-classement [data-class="${classification}"]`).click();
    await page.locator("#btn-next-patient2").click();
  }
}

async function attestationLabel(page) {
  await page.locator('[data-reb-att="2"]').click();
  return page.locator("dialog.sga-dlg[open] .sga-badge").textContent();
}

for (const timed of [false, true]) {
  for (const [mistakes, score, label] of [
    [3, "79", "Participation"],
    [0, "100", "Réussite avec excellence"],
    [1, "93", "Réussite"],
    [2, "86", "Réussite"],
  ]) {
    test(`${mistakes} erreur(s), chrono ${timed ? "activé" : "désactivé"}`, async (t) => {
      const { page, errors } = await openGame(t, timed);
      await playModule(page, mistakes);
      assert.equal(await page.locator("#m2-total-score").textContent(), score);
      assert.equal(await page.locator("#m2-val-classement").textContent(), `${(3 - mistakes) * 7}/21`);
      assert.match(await page.locator("#m2-classement-summary").textContent(), new RegExp(`Erronés : ${mistakes} · Non renseignés : 0`));
      assert.equal(await page.locator("#m2-replay-list .replay-item").count(), 3);
      assert.equal(await page.locator("#m2-replay-list .replay-detail").filter({ hasText: "✕" }).count(), mistakes);
      assert.equal(await attestationLabel(page), `Palier : ${label}`);
      await page.evaluate(() => {
        window.print = () => window.dispatchEvent(new Event("afterprint"));
        document.querySelector("#sga-name").value = "Personne Fictive";
        document.querySelector("dialog.sga-dlg[open] form").requestSubmit();
      });
      const attestationEvent = label === "Réussite avec excellence" ? "Excellence" : label;
      assert.deepEqual(await page.evaluate(() => window.plausible.q.map((args) => Array.from(args))), [
        ["REB Module 2 démarré"],
        ["REB Module 2 terminé"],
        [`Attestation · ${attestationEvent}`],
      ]);
      assert.match(await page.locator("#m2-score-grade").textContent(), label === "Participation" ? /^Seuil de réussite non atteint/ : new RegExp(`^${label} —`));
      assert.equal(await page.locator("#m2-badges-earned").getByText("Médecin sénior REB").count(), mistakes === 0 ? 1 : 0);
      assert.deepEqual(errors, []);
    });
  }
}

test("une exclusion injustifiée plafonne l’attestation à la participation malgré un score de 93", async (t) => {
  const { page, errors } = await openGame(t, false);
  await playModule(page, 1, true);
  assert.equal(await page.locator("#m2-total-score").textContent(), "93");
  assert.equal(await page.evaluate(() => m2State.attestation.critical), 1);
  assert.match(await page.locator("#m2-score-grade").textContent(), /^1 exclusion injustifiée/);
  const exclusions = page.locator("#m2-replay-list .replay-detail").filter({ hasText: "Exclusion injustifiée" });
  assert.equal(await exclusions.count(), 1);
  assert.match(await exclusions.first().textContent(), /Cas exclu.*Cas possible/s);
  assert.equal(await attestationLabel(page), "Palier : Participation");
  assert.deepEqual(errors, []);
});

test("seules les exclusions d’un cas suspect ou possible sont éliminatoires", async (t) => {
  const { page } = await openGame(t, false);
  const result = await page.evaluate(() => [
    { classement: "exclu", expected: "suspect" },
    { classement: "exclu", expected: "possible" },
    { classement: "exclu", expected: "exclu" },
    { classement: "suspect", expected: "possible" },
    { classement: "possible", expected: "suspect" },
    { classement: null, expected: "possible" },
  ].map(m2IsUnjustifiedExclusion));
  assert.deepEqual(result, [true, true, false, false, false, false]);
});

for (const [alertPoints, display, label] of [
  [12.999, "80", "Participation"],
  [13, "80", "Réussite"],
  [13.999, "95", "Réussite"],
  [14, "95", "Réussite avec excellence"],
]) {
  test(`palier ${label} pour ${alertPoints} points d’alerte`, async (t) => {
    const { page, errors } = await openGame(t, false);
    // Injecter un total près d'un seuil et utiliser le vrai bilan et son bouton.
    await page.evaluate(({ alertPoints, classificationPoints }) => {
      Object.assign(m2State.scores, { eval: 20, traitement: 20, comm: 20, triade: alertPoints, classement: classificationPoints });
      m2EndModule();
    }, { alertPoints, classificationPoints: display === "80" ? 7 : 21 });
    assert.equal(await page.locator("#m2-total-score").textContent(), display);
    assert.equal(await attestationLabel(page), `Palier : ${label}`);
    assert.deepEqual(errors, []);
  });
}

test("temps écoulé et clics rapprochés : un seul résultat par patient", async (t) => {
  const { page, errors } = await openGame(t, true);
  await page.clock.install();
  await startModule(page);
  const patients = await page.evaluate(() => M2_PATIENTS);
  await answerBeforeClassification(page, patients[0]);
  await page.evaluate(() => { m2State.timeLeft = 1; });
  await page.clock.runFor(1000);
  await page.locator("#btn-next-patient2").click();
  await answerBeforeClassification(page, patients[1]);
  await page.evaluate((expected) => {
    document.querySelector(`#phase-classement [data-class="${expected}"]`).click();
    document.querySelector('#phase-classement [data-class="exclu"]').click();
  }, patients[1].classement);
  await page.clock.runFor(1000);
  await page.locator("#btn-next-patient2").click();
  await answerBeforeClassification(page, patients[2]);
  await page.locator(`#phase-classement [data-class="${patients[2].classement}"]`).click();
  await page.locator("#btn-next-patient2").click();
  assert.equal(await page.locator("#m2-total-score").textContent(), "93");
  assert.match(await page.locator("#m2-classement-summary").textContent(), /Erronés : 0 · Non renseignés : 1/);
  assert.equal(await page.locator("#m2-replay-list .replay-item").count(), 3);
  assert.match(await page.locator("#m2-replay-list .replay-detail").first().textContent(), /Non renseigné.*temps écoulé/s);
  assert.equal(await page.evaluate(() => m2State.attestation.critical), 0);
  await page.locator("#m2-btn-replay").click();
  assert.equal(await page.locator("#m2-score-classement").textContent(), "0");
  assert.equal(await page.evaluate(() => m2State.attestation), null);
  assert.deepEqual(errors, []);
});

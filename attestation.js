/* Attestation de fin de parcours, commune aux serious games d'hygiène hospitalière.
   Tout est calculé dans le navigateur. Le nom saisi n'est ni stocké ni transmis.
   Seul le palier peut être compté par Plausible ("Attestation · <palier>"), sans score ni nom.
   Usage : SGAttestation.open({ jeu, module, ratio, critical, color, track(eventName) }) */
(() => {
  const SIGNATAIRE = "Dr Jean-Etienne Podik";
  const SERVICE = "EOH AHNAC";
  const SEUIL = 0.8, EXCELLENCE = 0.95;
  const PALIERS = {
    excellence: { label: "Réussite avec excellence", titre: "Attestation de réussite", event: "Attestation · Excellence" },
    reussite: { label: "Réussite", titre: "Attestation de réussite", event: "Attestation · Réussite" },
    participation: { label: "Participation", titre: "Attestation de participation", event: "Attestation · Participation" }
  };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function palier(ratio, critical) {
    const crit = Number(critical) || 0;
    if (crit === 0 && ratio >= EXCELLENCE) return "excellence";
    if (crit === 0 && ratio >= SEUIL) return "reussite";
    return "participation";
  }

  const CSS = `
  .sga-dlg{position:fixed;inset:0;margin:auto!important;height:fit-content;max-height:92vh;overflow:auto;box-sizing:border-box;border:0;border-radius:14px;padding:0;max-width:min(560px,94vw);width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:inherit;color:#1d2a2a;background:#fff}
  .sga-dlg::backdrop{background:rgba(10,30,30,.55)}
  .sga-form{padding:24px 24px 20px}
  .sga-form h2{margin:0 0 6px;font-size:1.25rem;color:var(--sga-c)}
  .sga-form p{margin:0 0 14px;font-size:.92rem;line-height:1.45;color:#44514f}
  .sga-badge{display:inline-block;padding:6px 12px;border-radius:999px;background:var(--sga-c);color:#fff;font-weight:700;font-size:.95rem;margin:2px 0 14px}
  .sga-badge.p{background:#6b7776}
  .sga-form label{display:block;font-weight:600;font-size:.88rem;margin:10px 0 4px}
  .sga-form input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #b9c6c4;border-radius:8px;font:inherit;font-size:1rem;background:#fff;color:#1d2a2a}
  .sga-form input:focus{outline:2px solid var(--sga-c);outline-offset:1px}
  .sga-err{color:#a12c2c;font-size:.85rem;min-height:1.2em;margin-top:4px}
  .sga-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:16px}
  .sga-actions button{font:inherit;font-weight:600;border-radius:8px;padding:10px 16px;cursor:pointer;border:1px solid var(--sga-c)}
  .sga-ok{background:var(--sga-c);color:#fff}
  .sga-no{background:#fff;color:var(--sga-c)}
  .sga-small{font-size:.8rem!important;color:#6b7776!important;margin-top:12px!important}
  #sga-print{display:none}
  @media print{
    @page{size:A4 landscape;margin:0}
    html.sga-printing body>*:not(#sga-print){display:none!important}
    html.sga-printing body{margin:0!important;padding:0!important;background:#fff!important}
    html.sga-printing #sga-print{display:block!important}
  }
  .sga-page{box-sizing:border-box;width:297mm;height:209mm;padding:14mm;font-family:Calibri,"Segoe UI",Arial,sans-serif;color:#1d2a2a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sga-frame{box-sizing:border-box;height:100%;border:2.5mm solid var(--sga-c);border-radius:4mm;padding:11mm 18mm 9mm;display:flex;flex-direction:column;text-align:center;position:relative}
  .sga-top{display:flex;justify-content:space-between;align-items:baseline;font-size:10.5pt;color:#4a5856;letter-spacing:.04em;text-transform:uppercase}
  .sga-top b{color:var(--sga-c)}
  .sga-h{font-size:32pt;margin:12mm 0 5mm;color:var(--sga-c);font-weight:700;letter-spacing:.01em}
  .sga-lead{font-size:13pt;margin:2mm 0;color:#4a5856}
  .sga-name{font-size:26pt;font-weight:700;margin:3mm 0 1mm}
  .sga-fn{font-size:12.5pt;color:#4a5856;margin:0 0 3mm;min-height:1em}
  .sga-body{font-size:14pt;line-height:1.45;margin:2mm auto;max-width:210mm}
  .sga-pal{margin:9mm auto 3mm;display:inline-block;padding:3mm 9mm;border-radius:20mm;background:var(--sga-c);color:#fff;font-size:17pt;font-weight:700}
  .sga-pal.p{background:#6b7776}
  .sga-seuil{font-size:10.5pt;color:#4a5856;margin:2mm 0 0}
  .sga-bottom{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;text-align:left;gap:12mm}
  .sga-ref{font-size:9pt;color:#5d6a68;line-height:1.45;max-width:150mm}
  .sga-sign{text-align:center;min-width:75mm}
  .sga-sign .l{border-top:.4mm solid #1d2a2a;margin:16mm 0 2mm}
  .sga-sign b{font-size:12pt}
  .sga-sign span{display:block;font-size:11pt;color:#4a5856}
  `;

  let dlg, styleDone = false;
  function ensureStyle(color) {
    if (!styleDone) { const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); styleDone = true; }
    document.documentElement.style.setProperty("--sga-c", color || "#0C5F5B");
  }

  function ref(prefix) {
    const d = new Date(), p = (n) => String(n).padStart(2, "0");
    const rnd = Array.from(crypto.getRandomValues(new Uint8Array(3)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
    return `${prefix || "SG"}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
  }

  function docHTML(o, k, name, fn) {
    const P = PALIERS[k];
    const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }).replace(/ /g, "\u00a0");
    const seuil = o.critical === null
      ? "Seuil de réussite : au moins 80 % de réponses adaptées. Excellence : au moins 95 %."
      : "Seuil de réussite : au moins 80 % de décisions adaptées, sans erreur critique. Excellence : au moins 95 %, sans erreur critique.";
    const verbe = k === "participation" ? "a participé au serious game" : "a validé le serious game";
    return `<div class="sga-page"><div class="sga-frame">
      <div class="sga-top"><span><b>${esc(o.jeu)}</b></span><span>Équipe opérationnelle d'hygiène · AHNAC</span></div>
      <div class="sga-h">${P.titre}</div>
      <p class="sga-lead">Il est attesté que</p>
      <p class="sga-name">${esc(name)}</p>
      <p class="sga-fn">${esc(fn)}</p>
      <p class="sga-body">${verbe} <b>« ${esc(o.jeu)} »</b>${o.module ? `, ${esc(o.module)},` : ""} le ${date}.</p>
      <div><span class="sga-pal ${k === "participation" ? "p" : ""}">Palier atteint : ${P.label}</span></div>
      <p class="sga-seuil">${seuil}</p>
      <div class="sga-bottom">
        <div class="sga-ref">Référence : ${esc(ref(o.code))}<br>${esc(location.origin + location.pathname)}<br>Attestation délivrée à l'issue d'un outil pédagogique en ligne à partir de cas fictifs. Elle ne vaut ni validation des compétences ni action de DPC.</div>
        <div class="sga-sign"><div class="l"></div><b>${SIGNATAIRE}</b><span>${SERVICE}</span></div>
      </div>
    </div></div>`;
  }

  function print(o, k, name, fn) {
    let box = document.getElementById("sga-print");
    if (!box) { box = document.createElement("div"); box.id = "sga-print"; document.body.appendChild(box); }
    box.innerHTML = docHTML(o, k, name, fn);
    const root = document.documentElement;
    root.classList.add("sga-printing");
    const done = () => { root.classList.remove("sga-printing"); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    try { const t = typeof o.track === "function" ? o.track : (n) => { if (typeof window.plausible === "function") window.plausible(n); }; t(PALIERS[k].event); } catch { /* Ne jamais bloquer le jeu. */ }
    setTimeout(() => { try { window.print(); } catch { /* impression indisponible */ } setTimeout(done, 1500); }, 80);
  }

  function open(o) {
    o = Object.assign({ critical: 0 }, o);
    ensureStyle(o.color);
    const k = palier(o.ratio, o.critical);
    const P = PALIERS[k];
    if (dlg) dlg.remove();
    dlg = document.createElement("dialog");
    dlg.className = "sga-dlg";
    dlg.setAttribute("aria-labelledby", "sga-t");
    const msg = k === "participation"
      ? "Le seuil de réussite n'est pas atteint pour ce parcours. Vous pouvez imprimer une attestation de participation, ou rejouer pour viser la réussite."
      : "Bravo, le seuil de réussite est atteint pour ce parcours.";
    dlg.innerHTML = `<form class="sga-form" method="dialog">
      <h2 id="sga-t">${P.titre}</h2>
      <div class="sga-badge ${k === "participation" ? "p" : ""}">Palier : ${P.label}</div>
      <p>${msg}</p>
      <label for="sga-name">Nom et prénom</label>
      <input id="sga-name" maxlength="70" autocomplete="name" required>
      <label for="sga-fn">Fonction et service (facultatif)</label>
      <input id="sga-fn" maxlength="80" placeholder="Ex. IDE, service des urgences">
      <div class="sga-err" id="sga-err" role="alert"></div>
      <div class="sga-actions"><button type="button" class="sga-no" value="cancel">Annuler</button><button type="submit" class="sga-ok">Imprimer ou enregistrer en PDF</button></div>
      <p class="sga-small">Le nom reste sur votre appareil : il n'est ni enregistré ni transmis. Seul le palier atteint est compté de façon anonyme.</p>
    </form>`;
    document.body.appendChild(dlg);
    const name = dlg.querySelector("#sga-name"), fn = dlg.querySelector("#sga-fn"), err = dlg.querySelector("#sga-err");
    dlg.querySelector(".sga-no").addEventListener("click", () => dlg.close());
    dlg.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const n = name.value.trim();
      if (n.length < 2) { err.textContent = "Indiquez votre nom pour personnaliser l'attestation."; name.focus(); return; }
      dlg.close();
      print(o, k, n, fn.value.trim());
    });
    dlg.addEventListener("close", () => setTimeout(() => dlg && dlg.remove(), 0));
    dlg.showModal();
    name.focus();
    return k;
  }

  window.SGAttestation = { open, palier, PALIERS, EVENTS: Object.values(PALIERS).map((p) => p.event) };
})();

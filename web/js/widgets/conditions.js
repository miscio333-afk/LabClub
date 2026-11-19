/* Widget — buttafuori: condizioni, and, if/else. */
(function (App) {
  "use strict";

  const PROFILES = [
    { name: "Ada", age: 20, ticket: true },
    { name: "Luca", age: 17, ticket: true },
    { name: "Sara", age: 20, ticket: false },
    { name: "Marta", age: 16, ticket: false }
  ];

  App.widgets.register("conditions", function (mount) {
    let age = 20;
    let ticket = true;

    mount.innerHTML =
      '<div class="w-actions">' +
      PROFILES.map(function (p, i) {
        return '<button type="button" class="w-btn" data-profile="' + i + '">' + p.name + " · " + p.age + (p.ticket ? " + ticket" : " · no ticket") + "</button>";
      }).join("") +
      "</div>" +
      '<div class="w-row mt-12">' +
      '<label class="w-field" style="flex:1;min-width:170px">ETÀ <input class="w-range" type="range" id="cond-age" min="14" max="25" value="20"><span class="w-range-val" id="cond-age-val">20 anni</span></label>' +
      '<label class="w-check"><input type="checkbox" id="cond-ticket" checked> Ha il biglietto</label>' +
      "</div>" +
      '<div class="cond-flow mt-12">' +
      '<div class="cond-line"><span class="w-kw">if</span> età &gt;= 18 <span class="w-kw">and</span> biglietto:</div>' +
      '<div class="cond-checks">' +
      '<span data-check="age">età &gt;= 18</span>' +
      '<span data-check="ticket">biglietto</span>' +
      "</div>" +
      '<div class="cond-branches">' +
      '<div class="cond-branch" data-branch="yes"><b>SÌ</b><span>Entra nel locale</span></div>' +
      '<div class="cond-branch" data-branch="no"><b>NO</b><span>Resta fuori</span></div>' +
      "</div></div>" +
      '<div class="w-panel mt-12"><div class="w-head"><span class="kicker">RISULTATO</span><span class="w-tag" id="cond-tag">—</span></div>' +
      '<p class="w-text" id="cond-out" aria-live="polite">—</p></div>';

    const ageInput = mount.querySelector("#cond-age");
    const ageVal = mount.querySelector("#cond-age-val");
    const ticketInput = mount.querySelector("#cond-ticket");
    const ageCheck = mount.querySelector('[data-check="age"]');
    const ticketCheck = mount.querySelector('[data-check="ticket"]');
    const yesBranch = mount.querySelector('[data-branch="yes"]');
    const noBranch = mount.querySelector('[data-branch="no"]');
    const tag = mount.querySelector("#cond-tag");
    const out = mount.querySelector("#cond-out");

    function paint() {
      age = Number(ageInput.value);
      ticket = ticketInput.checked;
      ageVal.textContent = age + " anni";
      const ageOk = age >= 18;
      const enters = ageOk && ticket;

      ageCheck.textContent = "età >= 18  " + (ageOk ? "✓" : "✗");
      ageCheck.classList.toggle("ok", ageOk);
      ageCheck.classList.toggle("ko", !ageOk);
      ticketCheck.textContent = "biglietto  " + (ticket ? "✓" : "✗");
      ticketCheck.classList.toggle("ok", ticket);
      ticketCheck.classList.toggle("ko", !ticket);

      yesBranch.classList.toggle("active", enters);
      noBranch.classList.toggle("active", !enters);
      tag.textContent = enters ? "ENTRA" : "RESTA FUORI";
      tag.className = "w-tag " + (enters ? "ok" : "danger");
      out.textContent = enters
        ? "Entrambe le condizioni sono vere: " + age + " anni e biglietto. Il blocco if viene eseguito."
        : !ageOk && !ticket
          ? "Nessuna delle due condizioni è vera: " + age + " anni e nessun biglietto. Il blocco else viene eseguito."
          : !ageOk
            ? "Hai il biglietto, ma " + age + " anni non bastano: con and serve anche l'altra condizione."
            : "Hai almeno 18 anni, ma manca il biglietto: con and serve anche l'altra condizione.";
    }

    mount.querySelectorAll("[data-profile]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const p = PROFILES[Number(btn.dataset.profile)];
        ageInput.value = String(p.age);
        ticketInput.checked = p.ticket;
        paint();
      });
    });

    ageInput.addEventListener("input", paint);
    ticketInput.addEventListener("change", paint);

    paint();
    return function () {};
  });
})(window.App = window.App || {});

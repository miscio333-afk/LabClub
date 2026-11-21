/* Widget — flowchart pari/dispari passo-passo. */
(function (App) {
  "use strict";

  App.widgets.register("flowchart", function (mount) {
    let n = 7;
    let phase = 0;
    let bug = false;

    mount.innerHTML =
      '<div class="w-row">' +
      '<input class="w-input" type="number" id="fc-input" min="0" max="99" value="7" aria-label="Numero da verificare">' +
      '<button type="button" class="w-btn" data-load>Carica</button>' +
      "</div>" +
      '<div class="fc-flow">' +
      '<div class="fc-node" data-node="start"><span class="fc-kind">OVALE</span><b>INIZIO</b></div>' +
      '<div class="fc-node" data-node="read"><span class="fc-kind">I/O</span><b>LEGGI N</b></div>' +
      '<div class="fc-node fc-decision" data-node="dec"><span class="fc-kind">DECISIONE</span><b>N è pari?</b><em id="fc-n">N = 7</em></div>' +
      '<div class="fc-branches"><span data-branch="yes">SÌ</span><span data-branch="no">NO</span></div>' +
      '<div class="fc-node" data-node="out"><span class="fc-kind">OUTPUT</span><b id="fc-result">—</b></div>' +
      '<div class="fc-node" data-node="end"><span class="fc-kind">OVALE</span><b>FINE</b></div>' +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn w-btn-primary" data-next>Passo</button>' +
      '<button type="button" class="w-btn" data-bug>Introduci bug</button>' +
      '<button type="button" class="w-btn" data-reset>Reset</button>' +
      "</div>" +
      '<pre class="w-console mt-12" id="fc-out" aria-live="polite">Carica un numero e premi «Passo».</pre>';

    const out = mount.querySelector("#fc-out");
    const resultEl = mount.querySelector("#fc-result");
    const nEl = mount.querySelector("#fc-n");
    const nextBtn = mount.querySelector("[data-next]");
    const bugBtn = mount.querySelector("[data-bug]");
    const input = mount.querySelector("#fc-input");

    function isEven() {
      return n % 2 === 0;
    }

    function paint() {
      mount.querySelectorAll("[data-node]").forEach(function (el) {
        el.classList.remove("active", "done");
      });
      const order = ["start", "read", "dec", "out", "end"];
      order.forEach(function (name, i) {
        const el = mount.querySelector('[data-node="' + name + '"]');
        if (!el) return;
        if (phase === i + 1) el.classList.add("active");
        if (phase > i + 1) el.classList.add("done");
      });
      const yes = mount.querySelector('[data-branch="yes"]');
      const no = mount.querySelector('[data-branch="no"]');
      yes.classList.toggle("active", phase >= 4 && isEven() !== bug);
      no.classList.toggle("active", phase >= 4 && isEven() === bug);
      yes.classList.toggle("bug", bug && phase >= 4 && isEven() !== bug);
      no.classList.toggle("bug", bug && phase >= 4 && isEven() === bug);
      resultEl.textContent =
        phase >= 4 ? (isEven() !== bug ? "N è pari" : "N è dispari") : "—";
      nEl.textContent = "N = " + n;
      nextBtn.textContent = phase >= 5 ? "Ricomincia" : "Passo";
      bugBtn.textContent = bug ? "Togli il bug" : "Introduci bug";
      bugBtn.classList.toggle("danger", bug);
    }

    function step() {
      if (phase === 0) {
        phase = 1;
        out.textContent = "Inizio del diagramma.";
      } else if (phase === 1) {
        phase = 2;
        out.textContent = "Leggo il valore in ingresso: N = " + n + ".";
      } else if (phase === 2) {
        phase = 3;
        out.textContent =
          "Calcolo " + n + " % 2 = " + (n % 2) + ". " +
          (bug
            ? "BUG: la condizione è «N % 2 == 1», quindi il ramo scelto è invertito."
            : n % 2 === 0
              ? "Resto 0: il ramo è SÌ (pari)."
              : "Resto diverso da 0: il ramo è NO (dispari).");
      } else if (phase === 3) {
        phase = 4;
        const result = isEven() !== bug ? "pari" : "dispari";
        out.textContent = "Output: N è " + result + ".";
      } else if (phase === 4) {
        phase = 5;
        out.textContent = bug
          ? "Fine. Il diagramma termina, ma il risultato è sbagliato: è un errore logico."
          : "Fine. Il diagramma termina con il risultato corretto.";
      } else {
        phase = 0;
        out.textContent = "Ricomincia: premi «Passo».";
      }
      paint();
    }

    nextBtn.addEventListener("click", step);

    bugBtn.addEventListener("click", function () {
      bug = !bug;
      phase = 0;
      out.textContent = bug
        ? "Bug inserito: la decisione usa «N % 2 == 1» invece di «N % 2 == 0». Prova con un numero dispari."
        : "Bug rimosso. Il flowchart torna corretto.";
      paint();
    });

    mount.querySelector("[data-reset]").addEventListener("click", function () {
      phase = 0;
      out.textContent = "Reset. Carica un numero e premi «Passo».";
      paint();
    });

    mount.querySelector("[data-load]").addEventListener("click", function () {
      n = Math.max(0, Math.min(99, Math.floor(Number(input.value) || 0)));
      input.value = String(n);
      phase = 0;
      out.textContent = "Numero caricato: N = " + n + ". Premi «Passo».";
      paint();
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        mount.querySelector("[data-load]").click();
      }
    });

    paint();
    return function () {};
  });
})(window.App = window.App || {});

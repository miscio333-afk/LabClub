/* Widget — tracer del ciclo while con cinque bicchieri. */
(function (App) {
  "use strict";

  App.widgets.register("loops", function (mount) {
    let i = 1;
    let filled = 0;
    let bug = false;
    let done = false;
    let bugSteps = 0;

    mount.innerHTML =
      '<div class="loop-head">' +
      '<div><span>CONTATORE</span><b id="loop-i">1</b></div>' +
      '<div><span>CONDIZIONE</span><b id="loop-cond">i &lt;= 5</b></div>' +
      '<div><span>BICCHIERI</span><b id="loop-filled">0 / 5</b></div>' +
      "</div>" +
      '<div class="loop-glasses" id="loop-glasses" aria-label="Cinque bicchieri">' +
      [1, 2, 3, 4, 5].map(function (n) {
        return (
          '<div class="loop-glass" data-glass="' + n + '">' +
          '<span class="loop-water"></span>' +
          '<em>' + n + "</em></div>"
        );
      }).join("") +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn w-btn-primary" data-next>Passo</button>' +
      '<button type="button" class="w-btn" data-bug>Introduci bug</button>' +
      '<button type="button" class="w-btn" data-reset>Reset</button>' +
      "</div>" +
      '<pre class="w-console mt-12" id="loop-out" aria-live="polite">Premi «Passo» per eseguire un giro del ciclo.</pre>';

    const iEl = mount.querySelector("#loop-i");
    const condEl = mount.querySelector("#loop-cond");
    const filledEl = mount.querySelector("#loop-filled");
    const out = mount.querySelector("#loop-out");
    const nextBtn = mount.querySelector("[data-next]");
    const bugBtn = mount.querySelector("[data-bug]");
    const glasses = mount.querySelectorAll("[data-glass]");

    function paint() {
      iEl.textContent = String(i);
      filledEl.textContent = filled + " / 5";
      condEl.textContent = i <= 5 ? "i <= 5  ✓" : "i <= 5  ✗";
      condEl.className = i <= 5 ? "ok" : "ko";
      glasses.forEach(function (g, idx) {
        g.classList.toggle("filled", idx < filled);
        g.classList.toggle("current", idx === i - 1 && !done && i <= 5);
      });
      nextBtn.textContent = done ? "Ricomincia" : "Passo";
      bugBtn.textContent = bug ? "Togli il bug" : "Introduci bug";
      bugBtn.classList.toggle("danger", bug);
    }

    function step() {
      if (done) {
        i = 1;
        filled = 0;
        done = false;
        bugSteps = 0;
        out.textContent = "Reset del ciclo. Premi «Passo».";
        out.classList.remove("error");
        paint();
        return;
      }

      if (i > 5) {
        done = true;
        out.textContent = "i = " + i + ": la condizione è falsa. Il ciclo termina.";
        paint();
        return;
      }

      filled = Math.max(filled, i);
      if (bug) {
        bugSteps++;
        if (bugSteps >= 2) {
          done = true;
          out.textContent =
            "BUG: i è rimasto " + i + ", quindi la condizione è ancora vera. " +
            "Senza l'aggiornamento il ciclo non termina mai: è un ciclo infinito.";
          out.classList.add("error");
          paint();
          return;
        }
        out.textContent =
          "Giro con i = " + i + ": condizione vera → riempi il bicchiere " + i +
          ". BUG: manca i = i + 1, quindi i resta " + i + ".";
        out.classList.add("error");
        paint();
        return;
      }

      out.textContent = "Giro con i = " + i + ": condizione vera → riempi il bicchiere " + i + ".";
      out.classList.remove("error");
      i = i + 1;
      if (i > 5) {
        out.textContent += " i diventa 6: condizione falsa, ciclo terminato.";
        done = true;
      }
      paint();
    }

    nextBtn.addEventListener("click", step);

    bugBtn.addEventListener("click", function () {
      bug = !bug;
      i = 1;
      filled = 0;
      done = false;
      bugSteps = 0;
      out.textContent = bug
        ? "Bug inserito: il corpo del ciclo non aggiorna più il contatore."
        : "Bug rimosso: il contatore torna ad avanzare a ogni giro.";
      out.classList.toggle("error", bug);
      paint();
    });

    mount.querySelector("[data-reset]").addEventListener("click", function () {
      i = 1;
      filled = 0;
      done = false;
      bugSteps = 0;
      out.textContent = "Reset. Premi «Passo» per iniziare.";
      out.classList.remove("error");
      paint();
    });

    paint();
    return function () {};
  });
})(window.App = window.App || {});

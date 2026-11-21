/* Widget — lista dei voti: indici, len, append e IndexError. */
(function (App) {
  "use strict";

  App.widgets.register("lists", function (mount) {
    let voti = [7, 8, 6];
    let bug = false;

    mount.innerHTML =
      '<div class="list-cells" id="list-cells" aria-label="Lista dei voti"></div>' +
      '<div class="w-head mt-12"><span class="kicker">STATO</span><span class="w-tag" id="list-tag">3 ELEMENTI</span></div>' +
      '<p class="w-text" id="list-meta">len(voti) = 3 · media = 7.0</p>' +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn" data-append="9">append(9)</button>' +
      '<button type="button" class="w-btn" data-append="5">append(5)</button>' +
      "</div>" +
      '<div class="w-row mt-12">' +
      '<input class="w-input" type="number" id="list-index" value="1" min="0" aria-label="Indice da leggere">' +
      '<button type="button" class="w-btn w-btn-primary" data-read>Leggi indice</button>' +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn" data-bug>Introduci bug</button>' +
      '<button type="button" class="w-btn" data-reset>Reset</button>' +
      "</div>" +
      '<pre class="w-console mt-12" id="list-out" aria-live="polite">Clicca una cella o leggi un indice.</pre>';

    const cellsEl = mount.querySelector("#list-cells");
    const tag = mount.querySelector("#list-tag");
    const meta = mount.querySelector("#list-meta");
    const out = mount.querySelector("#list-out");
    const indexInput = mount.querySelector("#list-index");
    const bugBtn = mount.querySelector("[data-bug]");

    function media() {
      let totale = 0;
      for (let i = 0; i < voti.length; i++) totale += voti[i];
      return totale / voti.length;
    }

    function paint() {
      cellsEl.innerHTML = voti
        .map(function (value, i) {
          return (
            '<button type="button" class="list-cell" data-cell="' + i + '">' +
            '<span class="list-index">[' + i + "]</span>" +
            "<b>" + value + "</b>" +
            "</button>"
          );
        })
        .join("");
      cellsEl.querySelectorAll("[data-cell]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const i = Number(btn.dataset.cell);
          out.textContent = "voti[" + i + "] = " + voti[i];
          out.classList.remove("error");
        });
      });
      tag.textContent = voti.length + " ELEMENTI";
      meta.textContent = "len(voti) = " + voti.length + " · media = " + media().toFixed(1);
      bugBtn.textContent = bug ? "Togli il bug" : "Introduci bug";
      bugBtn.classList.toggle("danger", bug);
    }

    mount.querySelectorAll("[data-append]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const value = Number(btn.dataset.append);
        voti.push(value);
        paint();
        out.textContent = "voti.append(" + value + ")\nLa lista ora contiene " + voti.length + " elementi. L'indice massimo valido è " + (voti.length - 1) + ".";
        out.classList.remove("error");
      });
    });

    mount.querySelector("[data-read]").addEventListener("click", function () {
      let index = Math.floor(Number(indexInput.value) || 0);
      if (bug) {
        index = voti.length;
        out.textContent =
          "voti[" + index + "]\nIndexError: list index out of range\n\n" +
          "La lista ha indici da 0 a " + (voti.length - 1) + ": l'indice " + index + " non esiste.";
        out.classList.add("error");
        return;
      }
      if (index < 0 || index >= voti.length) {
        out.textContent =
          "voti[" + index + "]\nIndexError: list index out of range\n\n" +
          "La lista ha indici da 0 a " + (voti.length - 1) + ".";
        out.classList.add("error");
        return;
      }
      out.textContent = "voti[" + index + "] = " + voti[index];
      out.classList.remove("error");
    });

    bugBtn.addEventListener("click", function () {
      bug = !bug;
      if (bug) {
        out.textContent = "Bug inserito: la lettura usa voti[len(voti)] invece di un indice valido. Prova a leggere.";
        out.classList.add("error");
      } else {
        out.textContent = "Bug rimosso: la lettura controlla di nuovo l'intervallo.";
        out.classList.remove("error");
      }
      paint();
    });

    mount.querySelector("[data-reset]").addEventListener("click", function () {
      voti = [7, 8, 6];
      bug = false;
      paint();
      out.textContent = "Reset: la lista torna a [7, 8, 6].";
      out.classList.remove("error");
    });

    paint();
    return function () {};
  });
})(window.App = window.App || {});

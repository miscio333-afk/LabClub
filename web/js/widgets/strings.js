/* Widget — stringhe: indice, slice, metodi e immutabilità. */
(function (App) {
  "use strict";

  App.widgets.register("strings", function (mount) {
    let word = "CIAO";

    mount.innerHTML =
      '<div class="str-tiles" id="str-tiles" aria-label="Caratteri della parola"></div>' +
      '<p class="w-text mt-12" id="str-meta">len(parola) = 4</p>' +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn" data-action="read">Leggi [1]</button>' +
      '<button type="button" class="w-btn" data-action="slice">Slice [1:3]</button>' +
      '<button type="button" class="w-btn" data-action="lower">minuscolo</button>' +
      '<button type="button" class="w-btn" data-action="invert">Inverti</button>' +
      '<button type="button" class="w-btn" data-action="change">Cambia [0] in X</button>' +
      '<button type="button" class="w-btn" data-action="reset">Reset</button>' +
      "</div>" +
      '<pre class="w-console mt-12" id="str-out" aria-live="polite">La parola è CIAO. Prova una lettura o uno slice.</pre>';

    const tilesEl = mount.querySelector("#str-tiles");
    const meta = mount.querySelector("#str-meta");
    const out = mount.querySelector("#str-out");

    function paint(highlight, error) {
      tilesEl.innerHTML = word
        .split("")
        .map(function (ch, i) {
          return (
            '<div class="str-tile' + (highlight && highlight.indexOf(i) !== -1 ? " active" : "") + (error && highlight && highlight.indexOf(i) !== -1 ? " bad" : "") + '">' +
            "<b>" + App.ui.esc(ch) + "</b>" +
            "<span>[" + i + "]</span>" +
            "</div>"
          );
        })
        .join("");
      meta.textContent = "len(parola) = " + word.length;
    }

    function reset() {
      word = "CIAO";
      paint([]);
      out.textContent = "Reset: parola = \"CIAO\".";
      out.classList.remove("error");
    }

    mount.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const action = btn.dataset.action;
        if (action === "read") {
          paint([1]);
          out.textContent = 'parola[1]\nIl carattere all\'indice 1 è "' + word[1] + '". Il primo carattere è all\'indice 0.';
          out.classList.remove("error");
        } else if (action === "slice") {
          paint([1, 2]);
          out.textContent = 'parola[1:3]\nEstrae gli indici 1 e 2, esclude il 3: "' + word.slice(1, 3) + '".';
          out.classList.remove("error");
        } else if (action === "lower") {
          word = word.toLowerCase();
          paint([]);
          out.textContent = 'parola.lower()\nRestituisce una nuova stringa: "' + word + '". L\'originale non viene modificato sul posto.';
          out.classList.remove("error");
        } else if (action === "invert") {
          word = word.split("").reverse().join("");
          paint([]);
          out.textContent = 'Inversione con slice e concatenazione: "' + word + '".';
          out.classList.remove("error");
        } else if (action === "change") {
          paint([0], true);
          out.textContent =
            'parola[0] = "X"\nTypeError: \'str\' object does not support item assignment\n\n' +
            "Le stringhe sono immutabili: per cambiare una lettera devi creare una nuova stringa.";
          out.classList.add("error");
        } else {
          reset();
        }
      });
    });

    paint([]);
    return function () {};
  });
})(window.App = window.App || {});

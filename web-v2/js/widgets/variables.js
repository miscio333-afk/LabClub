/* Widget — scatole delle variabili, tipi e operazioni. */
(function (App) {
  "use strict";

  App.widgets.register("variables", function (mount) {
    mount.innerHTML =
      '<div class="w-grid-3">' +
      '<label class="w-field">NOME<input class="w-input" id="var-name" value="Ada" autocomplete="off"></label>' +
      '<label class="w-field">ETÀ<input class="w-input" id="var-age" type="number" value="16"></label>' +
      '<label class="w-field">MEDIA<input class="w-input" id="var-media" type="number" step="0.1" value="8.5"></label>' +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn w-btn-primary" data-apply>Aggiorna scatole</button>' +
      '<button type="button" class="w-btn" data-reset>Reset</button>' +
      "</div>" +
      '<div class="var-boxes mt-12">' +
      '<div class="var-box"><span>nome</span><b id="var-name-val">"Ada"</b><em>str</em></div>' +
      '<div class="var-box"><span>età</span><b id="var-age-val">16</b><em>int</em></div>' +
      '<div class="var-box"><span>media</span><b id="var-media-val">8.5</b><em>float</em></div>' +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn" data-expr="age">età + 1</button>' +
      '<button type="button" class="w-btn" data-expr="name">nome + "!"</button>' +
      '<button type="button" class="w-btn" data-expr="bad">"20" + 1</button>' +
      "</div>" +
      '<pre class="w-console mt-12" id="var-out" aria-live="polite">Le scatole sono pronte. Prova un\'operazione.</pre>';

    const nameInput = mount.querySelector("#var-name");
    const ageInput = mount.querySelector("#var-age");
    const mediaInput = mount.querySelector("#var-media");
    const nameVal = mount.querySelector("#var-name-val");
    const ageVal = mount.querySelector("#var-age-val");
    const mediaVal = mount.querySelector("#var-media-val");
    const out = mount.querySelector("#var-out");

    function ageNumber() {
      return Math.floor(Number(ageInput.value) || 0);
    }

    function mediaNumber() {
      const v = Number(mediaInput.value);
      return Number.isFinite(v) ? v : 0;
    }

    function paint() {
      nameVal.textContent = '"' + nameInput.value + '"';
      ageVal.textContent = String(ageNumber());
      mediaVal.textContent = String(mediaNumber());
      out.textContent = "Le scatole contengono i valori aggiornati. Osserva il tipo accanto a ogni valore.";
      out.classList.remove("error");
    }

    mount.querySelector("[data-apply]").addEventListener("click", paint);

    mount.querySelector("[data-reset]").addEventListener("click", function () {
      nameInput.value = "Ada";
      ageInput.value = "16";
      mediaInput.value = "8.5";
      paint();
    });

    mount.querySelectorAll("[data-expr]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const kind = btn.dataset.expr;
        if (kind === "age") {
          out.textContent =
            "età + 1\n" +
            ageNumber() + " + 1 = " + (ageNumber() + 1) +
            "\n\nint + int produce un int.";
          out.classList.remove("error");
        } else if (kind === "name") {
          out.textContent =
            'nome + "!"\n"' + nameInput.value + '" + "!" = "' + nameInput.value + '!"' +
            "\n\nstr + str concatena due testi.";
          out.classList.remove("error");
        } else {
          out.textContent =
            '"20" + 1\nTypeError: can only concatenate str (not "int") to str\n\n' +
            "Il testo e il numero sono tipi diversi: prima serve int(\"20\").";
          out.classList.add("error");
        }
      });
    });

    paint();
    return function () {};
  });
})(window.App = window.App || {});

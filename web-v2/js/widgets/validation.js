/* Widget — form di validazione: testo, numero, limite. */
(function (App) {
  "use strict";

  App.widgets.register("validation", function (mount) {
    mount.innerHTML =
      '<div class="w-grid-2">' +
      '<label class="w-field">NOME<input class="w-input" id="val-name" value="Ada" autocomplete="off"></label>' +
      '<label class="w-field">ETÀ<input class="w-input" id="val-age" value="16" inputmode="numeric" autocomplete="off"></label>' +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn" data-preset="valid">valido</button>' +
      '<button type="button" class="w-btn" data-preset="empty">vuoto</button>' +
      '<button type="button" class="w-btn" data-preset="abc">abc</button>' +
      '<button type="button" class="w-btn" data-preset="200">200</button>' +
      "</div>" +
      '<div class="val-checks mt-12">' +
      '<div data-check="name"><span>○</span> Il nome non è vuoto</div>' +
      '<div data-check="age"><span>○</span> L\'età contiene solo cifre</div>' +
      '<div data-check="limit"><span>○</span> L\'età è tra 0 e 120</div>' +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn w-btn-primary" data-validate>Valida profilo</button>' +
      '<button type="button" class="w-btn" data-bug>int() senza controllo</button>' +
      "</div>" +
      '<pre class="w-console mt-12" id="val-out" aria-live="polite">Compila i campi e premi «Valida profilo».</pre>';

    const nameInput = mount.querySelector("#val-name");
    const ageInput = mount.querySelector("#val-age");
    const out = mount.querySelector("#val-out");
    const checkName = mount.querySelector('[data-check="name"]');
    const checkAge = mount.querySelector('[data-check="age"]');
    const checkLimit = mount.querySelector('[data-check="limit"]');

    function setCheck(el, ok, text) {
      el.classList.toggle("ok", ok);
      el.classList.toggle("ko", !ok);
      el.querySelector("span").textContent = ok ? "✓" : "✗";
      el.lastChild.textContent = text;
    }

    function validate() {
      const name = nameInput.value.trim();
      const ageText = ageInput.value.trim();
      const nameOk = name.length > 0;
      const ageOk = /^\d+$/.test(ageText);
      const limitOk = ageOk && Number(ageText) >= 0 && Number(ageText) <= 120;

      setCheck(checkName, nameOk, " Il nome non è vuoto");
      setCheck(checkAge, ageOk, " L'età contiene solo cifre");
      setCheck(checkLimit, limitOk, " L'età è tra 0 e 120");

      if (!nameOk) {
        out.textContent = "ESITO: profilo non valido.\nIl nome è vuoto: fermati al primo controllo.";
        out.classList.add("error");
      } else if (!ageOk) {
        out.textContent = "ESITO: profilo non valido.\n\"" + ageText + "\" non è fatto solo di cifre: int() produrrebbe ValueError.";
        out.classList.add("error");
      } else if (!limitOk) {
        out.textContent = "ESITO: profilo non valido.\n" + ageText + " è un numero, ma è fuori dall'intervallo 0–120.";
        out.classList.add("error");
      } else {
        out.textContent = "ESITO: profilo valido.\n" + name + ", " + ageText + " anni.";
        out.classList.remove("error");
      }
    }

    mount.querySelectorAll("[data-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const preset = btn.dataset.preset;
        if (preset === "valid") {
          nameInput.value = "Ada";
          ageInput.value = "16";
        } else if (preset === "empty") {
          nameInput.value = "";
          ageInput.value = "";
        } else if (preset === "abc") {
          nameInput.value = "Ada";
          ageInput.value = "abc";
        } else {
          nameInput.value = "Ada";
          ageInput.value = "200";
        }
        validate();
      });
    });

    mount.querySelector("[data-validate]").addEventListener("click", validate);

    mount.querySelector("[data-bug]").addEventListener("click", function () {
      const ageText = ageInput.value.trim();
      if (/^-?\d+$/.test(ageText)) {
        out.textContent = "int(\"" + ageText + "\") = " + Number(ageText) + "\nLa conversione funziona, ma non hai controllato l'intervallo.";
        out.classList.remove("error");
      } else {
        out.textContent = "int(\"" + ageText + "\")\nValueError: invalid literal for int() with base 10\n\nHai convertito senza prima controllare con isdigit().";
        out.classList.add("error");
      }
    });

    validate();
    return function () {};
  });
})(window.App = window.App || {});

/* Widget — quadro a 8 lampadine: binario, decimale, ASCII. */
(function (App) {
  "use strict";

  const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

  App.widgets.register("binary", function (mount) {
    let bits = [0, 1, 0, 0, 0, 0, 0, 1];

    mount.innerHTML =
      '<div class="bin-bulbs" role="group" aria-label="Bit del byte">' +
      WEIGHTS.map(function (weight, i) {
        return (
          '<button type="button" class="bin-bit" data-bit="' + i + '" aria-pressed="false">' +
          '<span class="bin-lamp"></span>' +
          "<b>" + weight + "</b>" +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<div class="bin-readout">' +
      '<div><span>DECIMALE</span><b id="bin-dec">0</b></div>' +
      '<div><span>BINARIO</span><b class="mono" id="bin-str">00000000</b></div>' +
      '<div><span>ASCII</span><b id="bin-char">·</b></div>' +
      "</div>" +
      '<div class="w-actions">' +
      '<button type="button" class="w-btn" data-preset="65">A = 65</button>' +
      '<button type="button" class="w-btn" data-preset="255">255</button>' +
      '<button type="button" class="w-btn" data-preset="0">0</button>' +
      "</div>" +
      '<div class="w-row mt-12">' +
      '<input class="w-input" type="number" id="bin-input" min="0" max="255" value="65" aria-label="Numero decimale da 0 a 255">' +
      '<button type="button" class="w-btn w-btn-primary" data-set>Accendi</button>' +
      '<button type="button" class="w-btn" data-div>Mostra divisioni</button>' +
      "</div>" +
      '<pre class="w-console hidden" id="bin-out" aria-live="polite"></pre>';

    const bitButtons = mount.querySelectorAll("[data-bit]");
    const decEl = mount.querySelector("#bin-dec");
    const strEl = mount.querySelector("#bin-str");
    const charEl = mount.querySelector("#bin-char");
    const input = mount.querySelector("#bin-input");
    const out = mount.querySelector("#bin-out");

    function value() {
      return bits.reduce(function (sum, bit, i) {
        return sum + (bit ? WEIGHTS[i] : 0);
      }, 0);
    }

    function paint() {
      bitButtons.forEach(function (btn, i) {
        btn.classList.toggle("on", !!bits[i]);
        btn.setAttribute("aria-pressed", bits[i] ? "true" : "false");
      });
      const n = value();
      decEl.textContent = String(n);
      strEl.textContent = bits.join("");
      charEl.textContent = n >= 32 && n <= 126 ? String.fromCharCode(n) : "·";
      input.value = String(n);
    }

    function setValue(n) {
      n = Math.max(0, Math.min(255, Math.floor(Number(n) || 0)));
      bits = WEIGHTS.map(function (weight) {
        return Math.floor(n / weight) % 2;
      });
      paint();
    }

    bitButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const i = Number(btn.dataset.bit);
        bits[i] = bits[i] ? 0 : 1;
        out.classList.add("hidden");
        paint();
      });
    });

    mount.querySelectorAll("[data-preset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setValue(Number(btn.dataset.preset));
        out.classList.add("hidden");
      });
    });

    mount.querySelector("[data-set]").addEventListener("click", function () {
      setValue(input.value);
      out.classList.add("hidden");
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        setValue(input.value);
      }
    });

    mount.querySelector("[data-div]").addEventListener("click", function () {
      let n = value();
      if (n === 0) {
        out.textContent = "0 in binario è semplicemente 0.";
      } else {
        const rows = [];
        const start = n;
        while (n > 0) {
          rows.push(n + " ÷ 2 = " + Math.floor(n / 2) + "  resto " + (n % 2));
          n = Math.floor(n / 2);
        }
        out.textContent =
          "Divisioni per 2 (leggi i resti dal basso):\n" +
          rows.join("\n") +
          "\n\n" + start + " = " + bits.join("") + " in binario";
      }
      out.classList.remove("hidden");
    });

    paint();
    return function () {};
  });
})(window.App = window.App || {});

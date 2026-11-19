/* Widget — macchina delle funzioni: parametri, corpo, return. */
(function (App) {
  "use strict";

  const FUNCTIONS = {
    doppio: {
      label: "doppio(n)",
      params: ["n"],
      body: "return n * 2",
      run: function (args) { return args[0] * 2; },
      numeric: true,
      hint: "5"
    },
    saluta: {
      label: "saluta(nome)",
      params: ["nome"],
      body: 'return "Ciao, " + nome + "!"',
      run: function (args) { return "Ciao, " + args[0] + "!"; },
      numeric: false,
      hint: "Ada"
    },
    maggiorenne: {
      label: "maggiorenne(età)",
      params: ["età"],
      body: "return età >= 18",
      run: function (args) { return args[0] >= 18; },
      numeric: true,
      hint: "20"
    },
    media: {
      label: "media(a, b)",
      params: ["a", "b"],
      body: "return (a + b) / 2",
      run: function (args) { return (args[0] + args[1]) / 2; },
      numeric: true,
      hint: "6, 8"
    }
  };

  App.widgets.register("functions", function (mount) {
    let current = "doppio";

    mount.innerHTML =
      '<div class="w-actions">' +
      Object.keys(FUNCTIONS).map(function (key) {
        return '<button type="button" class="w-btn' + (key === current ? " active" : "") + '" data-fn="' + key + '">' + FUNCTIONS[key].label + "</button>";
      }).join("") +
      "</div>" +
      '<div class="w-row mt-12">' +
      '<input class="w-input" id="fn-args" value="5" aria-label="Argomenti della funzione" autocomplete="off">' +
      '<button type="button" class="w-btn w-btn-primary" data-run>Esegui</button>' +
      "</div>" +
      '<p class="w-hint" id="fn-hint">Argomenti separati da virgola. Esempio: 5</p>' +
      '<div class="fn-machine mt-12">' +
      '<div class="fn-stage" data-stage="call"><span>CHIAMATA</span><b id="fn-call">doppio(5)</b></div>' +
      '<div class="fn-arrow" aria-hidden="true">↓</div>' +
      '<div class="fn-stage" data-stage="param"><span>PARAMETRI</span><b id="fn-params">n = 5</b></div>' +
      '<div class="fn-arrow" aria-hidden="true">↓</div>' +
      '<div class="fn-stage" data-stage="body"><span>CORPO</span><code id="fn-body">return n * 2</code></div>' +
      '<div class="fn-arrow" aria-hidden="true">↓</div>' +
      '<div class="fn-stage fn-return" data-stage="ret"><span>RETURN</span><b id="fn-ret">10</b></div>' +
      "</div>" +
      '<pre class="w-console mt-12" id="fn-out" aria-live="polite">Scegli una funzione e premi «Esegui».</pre>';

    const argsInput = mount.querySelector("#fn-args");
    const hint = mount.querySelector("#fn-hint");
    const callEl = mount.querySelector("#fn-call");
    const paramsEl = mount.querySelector("#fn-params");
    const bodyEl = mount.querySelector("#fn-body");
    const retEl = mount.querySelector("#fn-ret");
    const out = mount.querySelector("#fn-out");

    function parseArgs() {
      return argsInput.value
        .split(",")
        .map(function (part) { return part.trim(); })
        .filter(function (part, i, arr) { return part !== "" || arr.length > 1; });
    }

    function format(value) {
      if (typeof value === "string") return '"' + value + '"';
      if (typeof value === "boolean") return value ? "True" : "False";
      return String(value);
    }

    function paint(fn) {
      callEl.textContent = fn.label.replace(/\(.*\)$/, "") + "(" + parseArgs().join(", ") + ")";
      paramsEl.textContent = fn.params.map(function (p, i) {
        return p + " = " + (parseArgs()[i] || "?");
      }).join(", ");
      bodyEl.textContent = fn.body;
    }

    function run() {
      const fn = FUNCTIONS[current];
      const raw = parseArgs();
      let args = raw;
      if (fn.numeric) {
        args = raw.map(function (v) { return Number(v); });
        if (args.some(function (v) { return !Number.isFinite(v); })) {
          out.textContent = "Errore: questa funzione accetta numeri. Controlla gli argomenti.";
          out.classList.add("error");
          return;
        }
      }
      if (args.length < fn.params.length) {
        out.textContent = "Errore: mancano argomenti. La funzione " + fn.label + " richiede " + fn.params.length + ".";
        out.classList.add("error");
        return;
      }
      const result = fn.run(args);
      paint(fn);
      retEl.textContent = format(result);
      mount.querySelectorAll(".fn-stage").forEach(function (el) {
        el.classList.add("on");
      });
      out.textContent =
        fn.label + " riceve " + args.map(format).join(", ") + ".\n" +
        "Esegue: " + fn.body + "\n" +
        "Restituisce: " + format(result);
      out.classList.remove("error");
    }

    mount.querySelectorAll("[data-fn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        current = btn.dataset.fn;
        mount.querySelectorAll("[data-fn]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        const fn = FUNCTIONS[current];
        argsInput.value = fn.hint;
        hint.textContent = "Argomenti separati da virgola. Esempio: " + fn.hint;
        mount.querySelectorAll(".fn-stage").forEach(function (el) {
          el.classList.remove("on");
        });
        retEl.textContent = "—";
        paint(fn);
        run();
      });
    });

    mount.querySelector("[data-run]").addEventListener("click", run);
    argsInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        run();
      }
    });

    paint(FUNCTIONS[current]);
    run();
    return function () {};
  });
})(window.App = window.App || {});

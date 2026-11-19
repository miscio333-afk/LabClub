/* Widget — compilatore vs interprete con un bug alla riga 3. */
(function (App) {
  "use strict";

  const SCRIPT = [
    'print("Ciao")',
    'print("Mondo")',
    'print("',
    'print("Fine")'
  ];

  App.widgets.register("compilers", function (mount) {
    let mode = "idle";
    let line = -1;
    let fixed = false;
    let output = "";
    let failed = false;

    mount.innerHTML =
      '<div class="w-actions">' +
      '<button type="button" class="w-btn w-btn-primary" data-compile>Compila tutto</button>' +
      '<button type="button" class="w-btn" data-step>Esegui riga</button>' +
      '<button type="button" class="w-btn" data-fix>Correggi riga 3</button>' +
      '<button type="button" class="w-btn" data-reset>Reset</button>' +
      "</div>" +
      '<div class="w-code" id="cmp-code">' +
      SCRIPT.map(function (text, i) {
        return (
          '<div class="w-code-line" data-line="' + i + '">' +
          '<span class="w-ln">' + (i + 1) + "</span>" +
          '<code>' + App.ui.esc(text) + "</code>" +
          "</div>"
        );
      }).join("") +
      "</div>" +
      '<div class="w-head mt-12"><span class="kicker">CONSOLE</span><span class="w-tag" id="cmp-mode">PRONTO</span></div>' +
      '<pre class="w-console" id="cmp-out" aria-live="polite">Scegli una modalità: compila tutto oppure esegui una riga alla volta.</pre>';

    const lines = mount.querySelectorAll("[data-line]");
    const out = mount.querySelector("#cmp-out");
    const modeEl = mount.querySelector("#cmp-mode");
    const fixBtn = mount.querySelector("[data-fix]");

    function paintLines() {
      lines.forEach(function (el, i) {
        const codeEl = el.querySelector("code");
        if (codeEl && i === 2) codeEl.textContent = fixed ? 'print("Fine")' : 'print("';
        const isError = failed && i === 2 && !fixed;
        el.classList.toggle("active", i === line && !failed);
        el.classList.toggle("done", line > i || (failed && i < 2 && line >= 2));
        el.classList.toggle("error", isError);
      });
      fixBtn.textContent = fixed ? "Rimetti il bug" : "Correggi riga 3";
    }

    function paint() {
      out.textContent = output || "Nessun output.";
      out.classList.toggle("error", failed);
      modeEl.textContent = mode === "compile" ? "COMPILATORE" : mode === "interpret" ? "INTERPRETE" : "PRONTO";
      modeEl.className = "w-tag" + (mode === "compile" ? " live" : mode === "interpret" ? " ok" : "");
      paintLines();
    }

    function reset() {
      mode = "idle";
      line = -1;
      output = "";
      failed = false;
      paint();
    }

    mount.querySelector("[data-compile]").addEventListener("click", function () {
      mode = "compile";
      line = -1;
      failed = false;
      if (fixed) {
        output = "Compilazione riuscita.\n4 righe controllate, eseguibile pronto.";
      } else {
        failed = true;
        output =
          "Compilazione fallita.\nErrore di sintassi alla riga 3: stringa non chiusa.\nNessuna riga è stata eseguita.";
      }
      paint();
    });

    mount.querySelector("[data-step]").addEventListener("click", function () {
      if (mode === "idle" || mode === "compile") {
        mode = "interpret";
        line = -1;
        output = "";
        failed = false;
      }
      if (failed) return;
      if (line >= SCRIPT.length - 1) return;
      line++;
      if (line === 2 && !fixed) {
        failed = true;
        output += (output ? "\n" : "") + "SyntaxError: stringa non chiusa (riga 3). Esecuzione interrotta.";
        paint();
        return;
      }
      if (line === 0) output += (output ? "\n" : "") + "Ciao";
      if (line === 1) output += (output ? "\n" : "") + "Mondo";
      if (line === 2 && fixed) output += (output ? "\n" : "") + "Fine";
      if (line === 3) output += (output ? "\n" : "") + "Fine";
      if (line === SCRIPT.length - 1) {
        output += "\n\nProgramma terminato.";
      }
      paint();
    });

    fixBtn.addEventListener("click", function () {
      fixed = !fixed;
      reset();
    });

    mount.querySelector("[data-reset]").addEventListener("click", reset);

    paint();
    return function () {};
  });
})(window.App = window.App || {});

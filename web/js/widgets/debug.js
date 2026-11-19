/* Widget — debugger passo-passo con watch delle variabili. */
(function (App) {
  "use strict";

  const CODE_BUG = [
    "voti = [6, 8, 10]",
    "somma = 0",
    "for n in voti:",
    "    somma = n",
    "media = somma / len(voti)",
    'print("Media:", media)'
  ];

  const CODE_FIX = [
    "voti = [6, 8, 10]",
    "somma = 0",
    "for n in voti:",
    "    somma = somma + n",
    "media = somma / len(voti)",
    'print("Media:", media)'
  ];

  function fmt(n) {
    if (!Number.isFinite(n)) return "—";
    return Number.isInteger(n) ? n.toFixed(1) : n.toFixed(2);
  }

  App.widgets.register("debug", function (mount) {
    let fixed = false;
    let step = -1;
    let steps = [];
    let lastMedia = null;

    mount.innerHTML =
      '<div class="dbg-code" id="dbg-code"></div>' +
      '<div class="dbg-watch mt-12">' +
      '<div><span>n</span><b id="dbg-n">—</b></div>' +
      '<div><span>somma</span><b id="dbg-somma">—</b></div>' +
      '<div><span>media</span><b id="dbg-media">—</b></div>' +
      "</div>" +
      '<div class="w-actions mt-12">' +
      '<button type="button" class="w-btn w-btn-primary" data-next>Passo</button>' +
      '<button type="button" class="w-btn" data-fix>Correggi bug</button>' +
      '<button type="button" class="w-btn" data-reset>Reset</button>' +
      "</div>" +
      '<pre class="w-console mt-12" id="dbg-out" aria-live="polite">Premi «Passo» per eseguire una riga alla volta.</pre>';

    const codeEl = mount.querySelector("#dbg-code");
    const nEl = mount.querySelector("#dbg-n");
    const sommaEl = mount.querySelector("#dbg-somma");
    const mediaEl = mount.querySelector("#dbg-media");
    const out = mount.querySelector("#dbg-out");
    const fixBtn = mount.querySelector("[data-fix]");
    const nextBtn = mount.querySelector("[data-next]");

    function buildSteps() {
      const list = [];
      const voti = [6, 8, 10];
      let somma = 0;
      let lastN = "—";
      list.push({ line: 0, text: "voti = [6, 8, 10]", n: "—", somma: "—", media: "—" });
      list.push({ line: 1, text: "somma = 0", n: "—", somma: "0", media: "—" });
      voti.forEach(function (n) {
        list.push({ line: 2, text: "for n in voti:  n = " + n, n: String(n), somma: String(somma), media: "—" });
        somma = fixed ? somma + n : n;
        lastN = String(n);
        list.push({
          line: 3,
          text: fixed ? "somma = somma + n  →  " + somma : "somma = n  →  " + somma,
          n: lastN,
          somma: String(somma),
          media: "—"
        });
      });
      const media = somma / voti.length;
      lastMedia = media;
      list.push({ line: 4, text: "media = somma / len(voti)", n: lastN, somma: String(somma), media: fmt(media) });
      list.push({
        line: 5,
        text: 'print("Media:", media)',
        n: lastN,
        somma: String(somma),
        media: fmt(media),
        output: "Media: " + fmt(media)
      });
      return list;
    }

    function paintCode() {
      const lines = fixed ? CODE_FIX : CODE_BUG;
      codeEl.innerHTML = lines
        .map(function (text, i) {
          return (
            '<div class="w-code-line" data-dbg-line="' + i + '">' +
            '<span class="w-ln">' + (i + 1) + "</span>" +
            '<code>' + App.ui.esc(text) + "</code></div>"
          );
        })
        .join("");
    }

    function paint() {
      const current = step >= 0 ? steps[step] : null;
      codeEl.querySelectorAll("[data-dbg-line]").forEach(function (el, i) {
        el.classList.toggle("active", !!current && current.line === i);
        el.classList.toggle("done", !!current && current.line > i);
        el.classList.toggle("bug", fixed === false && step === steps.length - 1 && i === 3);
      });
      nEl.textContent = current ? current.n : "—";
      sommaEl.textContent = current ? current.somma : "—";
      mediaEl.textContent = current ? current.media : "—";
      nextBtn.textContent = step >= steps.length - 1 ? "Ricomincia" : "Passo";
      fixBtn.textContent = fixed ? "Rimetti il bug" : "Correggi bug";
      fixBtn.classList.toggle("active", fixed);
    }

    function reset(message) {
      step = -1;
      steps = buildSteps();
      out.textContent = message || "Pronto. Premi «Passo» per eseguire una riga alla volta.";
      out.classList.remove("error");
      paintCode();
      paint();
    }

    nextBtn.addEventListener("click", function () {
      if (step >= steps.length - 1) {
        reset("Esecuzione riavviata dall'inizio.");
        return;
      }
      step++;
      const s = steps[step];
      let text = "Riga " + (s.line + 1) + ": " + s.text;
      if (s.output) {
        text += "\nOutput: " + s.output;
        if (!fixed) {
          text += "\n\nLa media è sbagliata: il totale non si è mai accumulato.";
          out.classList.add("error");
        } else {
          text += "\n\nLa media ora è corretta: somma contiene 24 e 24 / 3 = 8.0.";
          out.classList.remove("error");
        }
      } else {
        out.classList.remove("error");
      }
      out.textContent = text;
      paint();
    });

    fixBtn.addEventListener("click", function () {
      fixed = !fixed;
      reset(
        fixed
          ? "Bug corretto: la riga 4 ora fa somma = somma + n. Esegui di nuovo e osserva il watch."
          : "Bug rimesso: la riga 4 sovrascrive di nuovo il totale."
      );
    });

    mount.querySelector("[data-reset]").addEventListener("click", function () {
      reset();
    });

    reset();
    return function () {};
  });
})(window.App = window.App || {});

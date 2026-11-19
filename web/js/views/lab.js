/* LabClub — playground Python e HTML */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  const PY_EXAMPLES = [
    {
      name: "FizzBuzz",
      code:
        'for n in range(1, 16):\n' +
        '    if n % 15 == 0:\n' +
        '        print("LABCLUB")\n' +
        '    elif n % 3 == 0:\n' +
        '        print("LAB")\n' +
        '    elif n % 5 == 0:\n' +
        '        print("CLUB")\n' +
        '    else:\n' +
        '        print(n)'
    },
    {
      name: "Lista punti",
      code:
        'punti = [65, 92, 84, 50]\n' +
        'print("Totale:", sum(punti))\n' +
        'print("Massimo:", max(punti))\n' +
        'print("Media:", sum(punti) / len(punti))\n' +
        'for p in punti:\n' +
        '    if p >= 80:\n' +
        '        print("Top score:", p)'
    },
    {
      name: "Countdown",
      code:
        'n = 5\n' +
        'while n > 0:\n' +
        '    print("Countdown", n)\n' +
        '    n -= 1\n' +
        'print("Via!")'
    },
    {
      name: "F-string",
      code:
        'nome = "Crew"\n' +
        'punti = 120\n' +
        'print(f"Ciao {nome}, hai {punti} punti")\n' +
        'for lettera in nome:\n' +
        '    print(lettera)'
    }
  ];

  const HTML_EXAMPLES = [
    {
      name: "Card neon",
      code:
        '<div style="background:#0A0A0A;color:#00FF88;padding:20px;border:2px solid #A100FF;font-family:sans-serif">\n' +
        '  <h1 style="margin:0 0 6px">LABCLUB DROP</h1>\n' +
        '  <p style="margin:0;color:#A2A2B3">Edizione limitata Web.</p>\n' +
        "</div>"
    },
    {
      name: "Counter",
      code:
        '<div style="background:#101014;color:#F7F7FA;font-family:sans-serif;padding:20px;border-radius:14px">\n' +
        '  <h2 id="n" style="color:#00FF88">0</h2>\n' +
        '  <button id="b" style="background:#00FF88;border:0;padding:10px 16px;border-radius:9px;font-weight:700">+1</button>\n' +
        "</div>\n" +
        "<script>\n" +
        '  let n = 0;\n' +
        '  const out = document.getElementById("n");\n' +
        '  document.getElementById("b").onclick = () => {\n' +
        "    n += 1;\n" +
        "    out.textContent = n;\n" +
        '    console.log("click", n);\n' +
        "  };\n" +
        '  console.log("Counter pronto");\n' +
        "</script>"
    },
    {
      name: "Flex gallery",
      code:
        '<div style="display:flex;gap:8px;padding:14px;background:#0A0A0A;font-family:sans-serif">\n' +
        '  <div style="flex:1;aspect-ratio:1;background:#00FF88;border-radius:12px"></div>\n' +
        '  <div style="flex:1;aspect-ratio:1;background:#A100FF;border-radius:12px"></div>\n' +
        '  <div style="flex:1;aspect-ratio:1;background:#E5FF00;border-radius:12px"></div>\n' +
        "</div>"
    }
  ];

  const BRIDGE =
    "<script>(function(){function send(t,a){try{parent.postMessage({__lab:1,type:t,text:Array.prototype.map.call(a,function(x){try{return typeof x==='string'?x:JSON.stringify(x);}catch(e){return String(x);}}).join(' ')},'*');}catch(e){}}" +
    "['log','info','warn','error'].forEach(function(k){var o=console[k]?console[k].bind(console):function(){};console[k]=function(){send(k,arguments);o.apply(null,arguments);};});" +
    "window.addEventListener('error',function(e){send('error',[e.message+' (riga '+(e.lineno||'?')+')']);});})();<\/script>";

  const EMPTY_PREVIEW =
    '<!doctype html><body style="margin:0;background:#0b0b0e;color:#686878;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;font-size:12px">' +
    "Premi Esegui per l'anteprima</body>";

  views.lab = function (root) {
    let lang = "PYTHON";
    const code = {
      PYTHON: PY_EXAMPLES[0].code,
      HTML: HTML_EXAMPLES[0].code
    };
    let previewEl = null;
    let consoleEl = null;
    let htmlLog = "";
    let htmlHadError = false;
    let logTimer = null;

    root.innerHTML =
      '<div class="page-head">' +
      "<h1>Lab</h1>" +
      "<p>Scrivi ed esegui. Python gira nel browser; HTML in una sandbox isolata dai tuoi dati.</p>" +
      "</div>" +
      '<div class="segmented" id="lab-tabs">' +
      '<button type="button" class="active" data-lang="PYTHON">Python</button>' +
      '<button type="button" data-lang="HTML">HTML</button>' +
      "</div>" +
      '<div id="lab-stage" class="mt-16"></div>' +
      '<div class="notice mt-24"><b>Python Lite</b> supporta variabili, numeri, stringhe, liste, if/elif/else, for, while, print e f-string. ' +
      "Limite: 2000 passi. <b>HTML</b> gira con sandbox e senza accesso al sito: i log arrivano qui sotto via postMessage.</div>";

    const stage = root.querySelector("#lab-stage");

    function currentExamples() {
      return lang === "PYTHON" ? PY_EXAMPLES : HTML_EXAMPLES;
    }

    function drawStage() {
      const examples = currentExamples();
      stage.innerHTML =
        '<div class="example-row mb-8">' +
        examples.map(function (example, i) {
          return '<button type="button" class="btn btn-soft btn-sm" data-example="' + i + '">' + App.ui.esc(example.name) + "</button>";
        }).join("") +
        "</div>" +
        '<textarea class="code" id="lab-editor" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Editor codice"></textarea>' +
        '<div class="lab-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" id="lab-run">' + App.ui.icon("play", 15) + " Esegui</button>" +
        '<button type="button" class="btn btn-soft btn-sm" id="lab-reset">Ripristina esempio</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="lab-clear">Pulisci</button>' +
        "</div>" +
        (lang === "HTML"
          ? '<p class="mt-16" style="font-size:11px;color:var(--zinc)">ANTEPRIMA ISOLATA</p>' +
            '<iframe class="preview-frame" id="lab-preview" title="Anteprima HTML" sandbox="allow-scripts"></iframe>'
          : "") +
        '<p class="mt-16" style="font-size:11px;color:var(--zinc)">CONSOLE</p>' +
        '<pre class="console" id="lab-console" aria-live="polite"></pre>';

      const editor = stage.querySelector("#lab-editor");
      const localConsole = stage.querySelector("#lab-console");
      const localPreview = stage.querySelector("#lab-preview");
      consoleEl = localConsole;
      previewEl = localPreview || null;
      if (localPreview) localPreview.srcdoc = EMPTY_PREVIEW;

      editor.value = code[lang];
      localConsole.textContent =
        lang === "HTML" ? "Esegui per vedere l'anteprima e i log." : "Esegui per lanciare il codice.";

      editor.addEventListener("input", function () {
        code[lang] = editor.value;
      });
      editor.addEventListener("keydown", function (event) {
        if (event.key === "Tab") {
          event.preventDefault();
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.value = editor.value.slice(0, start) + "    " + editor.value.slice(end);
          editor.selectionStart = editor.selectionEnd = start + 4;
          code[lang] = editor.value;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          run();
        }
      });

      stage.querySelectorAll("[data-example]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const example = currentExamples()[Number(btn.dataset.example)];
          code[lang] = example.code;
          editor.value = example.code;
          if (localPreview) localPreview.srcdoc = EMPTY_PREVIEW;
          localConsole.textContent = "Esempio caricato: " + example.name + ". Premi Esegui.";
          localConsole.classList.remove("error");
          objectiveReset();
        });
      });

      function objectiveReset() {
        /* il lab non ha obiettivi: placeholder per simmetria futura */
      }

      function run() {
        const source = editor.value;
        code[lang] = source;
        if (lang === "HTML") {
          htmlLog = "";
          htmlHadError = false;
          localConsole.classList.remove("error");
          localConsole.textContent = "Anteprima aggiornata. In attesa di log…";
          if (localPreview) localPreview.srcdoc = BRIDGE + source;
          clearTimeout(logTimer);
          logTimer = setTimeout(function () {
            if (consoleEl !== localConsole) return;
            if (!htmlLog) localConsole.textContent = "Nessun log di console. L'anteprima è nel riquadro sopra.";
          }, 650);
        } else {
          const result = App.python.run(source);
          localConsole.textContent = result.output;
          localConsole.classList.toggle("error", result.hasError);
        }
      }

      stage.querySelector("#lab-run").addEventListener("click", run);
      stage.querySelector("#lab-clear").addEventListener("click", function () {
        localConsole.textContent = lang === "HTML" ? "Anteprima e log puliti." : "Console pulita.";
        localConsole.classList.remove("error");
        if (localPreview) localPreview.srcdoc = EMPTY_PREVIEW;
        htmlLog = "";
        htmlHadError = false;
      });
      stage.querySelector("#lab-reset").addEventListener("click", function () {
        const example = currentExamples()[0];
        code[lang] = example.code;
        editor.value = example.code;
        localConsole.textContent = "Esempio ripristinato: " + example.name + ".";
        localConsole.classList.remove("error");
        if (localPreview) localPreview.srcdoc = EMPTY_PREVIEW;
      });
    }

    function onMessage(event) {
      if (!previewEl || event.source !== previewEl.contentWindow) return;
      const data = event.data;
      if (!data || data.__lab !== 1) return;
      if (!consoleEl) return;
      if (data.type === "error") {
        htmlHadError = true;
        consoleEl.classList.add("error");
      }
      if (consoleEl.textContent.indexOf("In attesa di log") !== -1) {
        consoleEl.textContent = "";
      }
      htmlLog += (htmlLog ? "\n" : "") + data.text;
      consoleEl.textContent = htmlLog;
    }
    window.addEventListener("message", onMessage);

    root.querySelectorAll("#lab-tabs [data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (lang === btn.dataset.lang) return;
        const editor = stage.querySelector("#lab-editor");
        if (editor) code[lang] = editor.value;
        lang = btn.dataset.lang;
        root.querySelectorAll("#lab-tabs [data-lang]").forEach(function (other) {
          other.classList.toggle("active", other === btn);
        });
        drawStage();
      });
    });

    drawStage();

    return function cleanup() {
      clearTimeout(logTimer);
      window.removeEventListener("message", onMessage);
    };
  };
})(window.App = window.App || {});

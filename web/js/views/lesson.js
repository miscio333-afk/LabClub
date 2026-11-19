/* LabClub — lezione: studio, quiz, codice */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  const BRIDGE =
    "<script>(function(){function send(t,a){try{parent.postMessage({__lab:1,type:t,text:Array.prototype.map.call(a,function(x){try{return typeof x==='string'?x:JSON.stringify(x);}catch(e){return String(x);}}).join(' ')},'*');}catch(e){}}" +
    "['log','info','warn','error'].forEach(function(k){var o=console[k]?console[k].bind(console):function(){};console[k]=function(){send(k,arguments);o.apply(null,arguments);};});" +
    "window.addEventListener('error',function(e){send('error',[e.message+' (riga '+(e.lineno||'?')+')']);});})();<\/script>";

  function quizFull(lesson) {
    const result = App.store.state.profile.quizResults[lesson.id];
    return !!result && result.total === lesson.quizQuestions.length;
  }

  views.lesson = function (root, params) {
    const lesson = App.store.getLesson(params.id);
    if (!lesson) {
      root.innerHTML =
        '<div class="empty" style="margin-top:32px"><span class="empty-icon">📖</span>' +
        "<h2 style=\"font-size:20px\">Lezione non trovata</h2><p>Controlla il link o torna ai corsi.</p>" +
        '<a class="btn btn-primary mt-16" href="#/corsi">Tutti i corsi</a></div>';
      return;
    }

    const course = App.store.getCourse(lesson.courseId) || { title: "Corso", id: lesson.courseId, accent: "green" };
    const purple = course.accent === "purple";
    const questions = lesson.quizQuestions;
    const stored = App.store.state.profile.quizResults[lesson.id];
    const answers = new Array(questions.length).fill(null);
    let index = 0;
    let showResult = false;
    let resultCorrect = 0;

    if (stored && stored.total === questions.length) {
      showResult = true;
      resultCorrect = stored.correct;
    }

    root.innerHTML =
      '<a class="back" href="#/corso/' + course.id + '">← ' + App.ui.esc(course.title) + "</a>" +
      '<div class="lesson-head">' +
      '<span class="kicker' + (purple ? " purple" : "") + '">CORSO · ' + App.ui.esc(course.title).toUpperCase() + "</span>" +
      '<h1 class="lesson-title">' + App.ui.esc(lesson.title) + "</h1>" +
      '<div class="lesson-meta">' +
      '<span class="chip">' + lesson.durationMinutes + " MIN</span>" +
      '<span class="chip' + (purple ? " chip-purple" : " chip-green") + '">' + App.ui.esc(lesson.topicTag) + "</span>" +
      '<span id="lesson-status"></span>' +
      "</div></div>" +
      '<div class="segmented" id="lesson-tabs" role="tablist">' +
      '<button type="button" role="tab" class="active" data-tab="study">Studio</button>' +
      '<button type="button" role="tab" data-tab="quiz">Quiz</button>' +
      '<button type="button" role="tab" data-tab="code">Codice</button>' +
      "</div>" +
      '<section class="panel" data-panel="study"></section>' +
      '<section class="panel hidden" data-panel="quiz"><div id="quiz-slot"></div></section>' +
      '<section class="panel hidden" data-panel="code"></section>';

    const statusSlot = root.querySelector("#lesson-status");
    const studyPanel = root.querySelector('[data-panel="study"]');
    const quizPanel = root.querySelector('[data-panel="quiz"]');
    const codePanel = root.querySelector('[data-panel="code"]');
    const quizSlot = root.querySelector("#quiz-slot");

    function paintStatus() {
      statusSlot.innerHTML = App.store.isLessonCompleted(lesson.id)
        ? '<span class="chip chip-green">COMPLETATA</span>'
        : "";
    }

    /* ---------------- studio ---------------- */
    let cleanupLab = function () {};

    if (lesson.chapters && lesson.chapters.length) {
      const chapters = lesson.chapters
        .map(function (chapter, i) {
          return (
            '<article class="chapter">' +
            '<div class="chapter-head">' +
            '<span class="chapter-num">' + String(i + 1).padStart(2, "0") + "</span>" +
            '<h2 class="chapter-title">' + App.ui.esc(chapter.title) + "</h2>" +
            "</div>" +
            '<div class="prose">' + chapter.html + "</div>" +
            "</article>"
          );
        })
        .join("");

      const keyPoints = lesson.keyPoints && lesson.keyPoints.length
        ? '<div class="card keypoints">' +
          '<span class="kicker' + (purple ? " purple" : "") + '">3 PUNTI CHIAVE</span>' +
          '<ol class="keypoints-list">' +
          lesson.keyPoints
            .map(function (point, i) {
              return (
                '<li><span class="kp-num">' + String(i + 1).padStart(2, "0") + "</span>" +
                "<p>" + App.ui.esc(point) + "</p></li>"
              );
            })
            .join("") +
          "</ol></div>"
        : "";

      const lab = lesson.lab
        ? '<section class="card lab-block">' +
          '<span class="kicker' + (purple ? " purple" : "") + '">LABORATORIO</span>' +
          '<h3 class="lab-title">' + App.ui.esc(lesson.lab.title) + "</h3>" +
          '<p class="lab-desc">' + App.ui.esc(lesson.lab.description) + "</p>" +
          '<div class="widget" id="lab-mount"></div>' +
          "</section>"
        : "";

      studyPanel.innerHTML =
        '<div class="card study-block">' +
        '<span class="kicker' + (purple ? " purple" : "") + '">OBIETTIVO</span>' +
        '<p class="mt-8">' + App.ui.esc(lesson.description) + "</p>" +
        "</div>" +
        '<div class="chapters">' + chapters + "</div>" +
        lab +
        keyPoints +
        '<div class="stack mt-16">' +
        '<a class="btn btn-soft btn-block" href="#/indizi/' + lesson.id + '">' +
        App.ui.icon("bulb", 16) + " Ho un dubbio: 3 indizi</a>" +
        '<button type="button" class="btn btn-primary btn-block" data-goto="quiz">Vai al quiz · ' + questions.length + " domande</button>" +
        "</div>" +
        '<div class="notice mt-16">Per completare la lezione devi rispondere a tutte le ' + questions.length +
        " domande del quiz. Puoi usare il codice quando vuoi: nessun voto, nessuna classifica.</div>";

      const labMount = studyPanel.querySelector("#lab-mount");
      if (labMount && lesson.lab && App.widgets && App.widgets.mount) {
        cleanupLab = App.widgets.mount(lesson.lab.widget, labMount);
      }
    } else {
      studyPanel.innerHTML =
        '<div class="card study-block">' +
        '<span class="kicker' + (purple ? " purple" : "") + '">OBIETTIVO</span>' +
        '<p class="mt-8">' + App.ui.esc(lesson.description) + "</p>" +
        (lesson.videoUrl
          ? '<a class="resource-row" style="margin-top:16px" href="' + App.ui.esc(lesson.videoUrl) + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="res-icon">' + App.ui.icon("play", 16) + "</span>" +
            "<span>Video lezione</span>" +
            '<span class="res-arrow">' + App.ui.icon("external", 15) + "</span>" +
            "</a>"
          : "") +
        (lesson.pdfUrl
          ? '<a class="resource-row" style="margin-top:8px" href="' + App.ui.esc(lesson.pdfUrl) + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="res-icon">' + App.ui.icon("book", 16) + "</span>" +
            "<span>Letture e documentazione</span>" +
            '<span class="res-arrow">' + App.ui.icon("external", 15) + "</span>" +
            "</a>"
          : "") +
        "</div>" +
        '<div class="stack mt-16">' +
        '<a class="btn btn-soft btn-block" href="#/indizi/' + lesson.id + '">' +
        App.ui.icon("bulb", 16) + " Ho un dubbio: 3 indizi</a>" +
        '<button type="button" class="btn btn-primary btn-block" data-goto="quiz">Vai al quiz · ' + questions.length + " domande</button>" +
        "</div>" +
        '<div class="notice mt-16">Per completare la lezione devi rispondere a tutte le ' + questions.length +
        " domande del quiz. Puoi usare il codice quando vuoi: nessun voto, nessuna classifica.</div>";
    }

    studyPanel.querySelectorAll("[data-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showTab(btn.dataset.goto);
      });
    });

    /* ---------------- quiz ---------------- */
    function drawQuiz() {
      if (showResult) {
        const perfect = resultCorrect === questions.length;
        const completed = App.store.isLessonCompleted(lesson.id);
        let cta = "";
        if (!completed) {
          cta =
            '<button type="button" class="btn btn-primary btn-block" data-complete>Completa lezione · +10 PT</button>';
        } else {
          cta = '<span class="objective ok">' + App.ui.icon("check", 13) + " LEZIONE COMPLETATA</span>";
        }
        quizSlot.innerHTML =
          '<div class="quiz-wrap">' +
          '<div class="quiz-result">' +
          '<div class="quiz-score">' + resultCorrect + "/" + questions.length + "</div>" +
          "<div>" +
          "<h3>" + (perfect ? "Quiz perfetto" : resultCorrect >= Math.ceil(questions.length * 0.6) ? "Ci siamo quasi" : "Ripassa e riprova") + "</h3>" +
          '<p class="muted" style="font-size:12px">' +
          (perfect ? "Nessun errore. Livello pro." : "Leggi le spiegazioni e ritenta: nessun limite di tentativi.") +
          "</p></div></div>" +
          '<div class="row wrap">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-retry>Riprova quiz</button>' +
          '<a class="btn btn-ghost btn-sm" href="#/indizi/' + lesson.id + '">Rivedi gli indizi</a>' +
          "</div>" +
          cta +
          "</div>";
        const completeBtn = quizSlot.querySelector("[data-complete]");
        if (completeBtn) completeBtn.addEventListener("click", completeNow);
        quizSlot.querySelector("[data-retry]").addEventListener("click", function () {
          answers.fill(null);
          index = 0;
          showResult = false;
          resultCorrect = 0;
          drawQuiz();
        });
        return;
      }

      const q = questions[index];
      const selected = answers[index];
      const dots = questions
        .map(function (_, i) {
          const cls = i === index ? " current" : answers[i] !== null ? " done" : "";
          return "<span class=\"" + cls.trim() + '"></span>';
        })
        .join("");

      const options = q.options
        .map(function (option, i) {
          let cls = "option";
          if (selected !== null) {
            if (i === q.correctIndex) cls += " correct";
            else if (i === selected) cls += " wrong";
            else cls += " dim";
          }
          return (
            '<button type="button" class="' + cls + '" data-option="' + i + '"' + (selected !== null ? " disabled" : "") + ">" +
            '<span class="option-letter">' + String.fromCharCode(65 + i) + "</span>" +
            "<span>" + App.ui.esc(option) + "</span>" +
            "</button>"
          );
        })
        .join("");

      const explanation =
        selected === null
          ? ""
          : '<div class="explain' + (selected === q.correctIndex ? "" : " bad") + '">' +
            "<b>" + (selected === q.correctIndex ? "Corretto. " : "Non ci siamo. ") + "</b>" +
            App.ui.esc(q.explanation) +
            "</div>";

      quizSlot.innerHTML =
        '<div class="quiz-wrap">' +
        '<div class="quiz-head"><div class="quiz-dots">' + dots + "</div>" +
        '<span class="quiz-progress-text">DOMANDA ' + (index + 1) + "/" + questions.length + "</span></div>" +
        '<div class="question-text">' + App.ui.esc(q.question) + "</div>" +
        '<div class="quiz-options">' + options + "</div>" +
        explanation +
        '<div class="quiz-footer">' +
        '<span class="quiz-progress-text">' + (selected === null ? "SCEGLI UNA RISPOSTA" : "RISPOSTA REGISTRATA") + "</span>" +
        '<button type="button" class="btn btn-primary btn-sm" data-next' + (selected === null ? " disabled" : "") + ">" +
        (index === questions.length - 1 ? "Vedi risultato" : "Avanti") +
        "</button></div></div>";

      quizSlot.querySelectorAll("[data-option]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (answers[index] !== null) return;
          answers[index] = Number(btn.dataset.option);
          if (answers[index] === q.correctIndex) App.ui.haptic();
          drawQuiz();
        });
      });

      const nextBtn = quizSlot.querySelector("[data-next]");
      nextBtn.addEventListener("click", function () {
        if (answers[index] === null) return;
        if (index === questions.length - 1) {
          const correct = answers.reduce(function (acc, value, i) {
            return acc + (value === questions[i].correctIndex ? 1 : 0);
          }, 0);
          resultCorrect = correct;
          showResult = true;
          App.store.setQuizResult(lesson, correct, questions.length);
          if (correct === questions.length) {
            App.ui.confetti();
            App.ui.toast("Quiz perfetto: " + correct + "/" + questions.length, "good");
          }
          App.shell.syncChrome();
          drawQuiz();
          drawCodeFoot();
        } else {
          index++;
          drawQuiz();
        }
      });
    }

    /* ---------------- codice ---------------- */
    const isHtml = lesson.language === "HTML";
    codePanel.innerHTML =
      '<div class="card">' +
      '<div class="code-head">' +
      "<div>" +
      '<span class="kicker">' + (isHtml ? "HTML / JS" : "PYTHON") + "</span>" +
      '<p class="mt-8">' + App.ui.esc(lesson.codePrompt) + "</p>" +
      "</div>" +
      '<span class="objective ko" id="objective-chip">DA VERIFICARE</span>' +
      "</div>" +
      '<textarea class="code" id="code-editor" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Editor codice"></textarea>' +
      '<div class="lab-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" id="btn-run">' + App.ui.icon("play", 15) + " Esegui</button>" +
      '<button type="button" class="btn btn-soft btn-sm" id="btn-reset">Ripristina</button>' +
      '<a class="btn btn-ghost btn-sm" href="#/indizi/' + lesson.id + '">Indizi</a>' +
      "</div>" +
      (isHtml
        ? '<p class="mt-16" style="font-size:11px;color:var(--zinc)">ANTEPRIMA ISOLATA</p>' +
          '<iframe class="preview-frame" id="preview" title="Anteprima HTML" sandbox="allow-scripts"></iframe>'
        : "") +
      '<p class="mt-16" style="font-size:11px;color:var(--zinc)">CONSOLE</p>' +
      '<pre class="console" id="console" aria-live="polite"></pre>' +
      "</div>" +
      '<div id="code-foot" class="mt-16"></div>';

    const editor = root.querySelector("#code-editor");
    const consoleEl = root.querySelector("#console");
    const preview = root.querySelector("#preview");
    const objectiveChip = root.querySelector("#objective-chip");
    const codeFoot = root.querySelector("#code-foot");
    let codeOk = false;

    editor.value = lesson.codeStarter;

    function setConsole(text, isError) {
      consoleEl.textContent = text;
      consoleEl.classList.toggle("error", !!isError);
    }

    function checkObjective(code, output, hadError) {
      const needle = lesson.expectedKeyword || "";
      const found = !needle || code.indexOf(needle) !== -1 || (output || "").indexOf(needle) !== -1;
      codeOk = found && !hadError;
      objectiveChip.className = "objective " + (codeOk ? "ok" : "ko");
      objectiveChip.innerHTML = codeOk
        ? App.ui.icon("check", 13) + " OBIETTIVO OK"
        : "DA VERIFICARE";
      return codeOk;
    }

    function resetConsole() {
      setConsole(
        isHtml
          ? "Premi Esegui per vedere l'anteprima e i log."
          : "Premi Esegui per lanciare il codice.",
        false
      );
      objectiveChip.className = "objective ko";
      objectiveChip.textContent = "DA VERIFICARE";
      codeOk = false;
    }

    resetConsole();

    let htmlLog = "";
    let htmlHadError = false;

    function onMessage(event) {
      if (!preview || event.source !== preview.contentWindow) return;
      const data = event.data;
      if (!data || data.__lab !== 1) return;
      if (data.type === "error") {
        htmlHadError = true;
        consoleEl.classList.add("error");
      }
      htmlLog += (htmlLog ? "\n" : "") + data.text;
      consoleEl.textContent = htmlLog;
    }
    window.addEventListener("message", onMessage);

    function runCode() {
      const code = editor.value;
      if (isHtml) {
        htmlLog = "";
        htmlHadError = false;
        consoleEl.classList.remove("error");
        consoleEl.textContent = "(Anteprima aggiornata. I log di console appaiono qui.)";
        preview.srcdoc = BRIDGE + code;
        preview.style.display = "block";
        setTimeout(function () {
          checkObjective(code, htmlLog, htmlHadError);
        }, 450);
      } else {
        const result = App.python.run(code);
        setConsole(result.output, result.hasError);
        checkObjective(code, result.output, result.hasError);
      }
      drawCodeFoot();
    }

    function drawCodeFoot() {
      if (App.store.isLessonCompleted(lesson.id)) {
        codeFoot.innerHTML = '<span class="objective ok">' + App.ui.icon("check", 13) + " LEZIONE COMPLETATA</span>";
        return;
      }
      if (!quizFull(lesson)) {
        codeFoot.innerHTML =
          '<div class="notice">Per completare la lezione rispondi prima a tutte le ' + questions.length +
          " domande del quiz.</div>" +
          '<button type="button" class="btn btn-ghost btn-block mt-8" data-go-quiz>Vai al quiz</button>';
        codeFoot.querySelector("[data-go-quiz]").addEventListener("click", function () {
          showTab("quiz");
        });
        return;
      }
      codeFoot.innerHTML =
        '<button type="button" class="btn btn-primary btn-block" data-complete>Completa lezione · +10 PT</button>';
      codeFoot.querySelector("[data-complete]").addEventListener("click", completeNow);
    }

    function completeNow() {
      App.actions.completeLesson(lesson);
      paintStatus();
      drawQuiz();
      drawCodeFoot();
      App.shell.syncChrome();
    }

    root.querySelector("#btn-run").addEventListener("click", runCode);
    root.querySelector("#btn-reset").addEventListener("click", function () {
      editor.value = lesson.codeStarter;
      if (preview) preview.srcdoc = "";
      resetConsole();
      htmlLog = "";
      htmlHadError = false;
      drawCodeFoot();
    });
    editor.addEventListener("keydown", function (event) {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.slice(0, start) + "    " + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        runCode();
      }
    });

    /* ---------------- tab ---------------- */
    const tabButtons = root.querySelectorAll("#lesson-tabs [data-tab]");
    const panels = {
      study: studyPanel,
      quiz: quizPanel,
      code: codePanel
    };

    function showTab(name) {
      tabButtons.forEach(function (btn) {
        const active = btn.dataset.tab === name;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      Object.keys(panels).forEach(function (key) {
        panels[key].classList.toggle("hidden", key !== name);
      });
      if (name === "quiz") drawQuiz();
      if (name === "code") drawCodeFoot();
    }

    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        showTab(btn.dataset.tab);
      });
    });

    paintStatus();
    drawQuiz();
    drawCodeFoot();

    return function cleanup() {
      if (typeof cleanupLab === "function") {
        try {
          cleanupLab();
        } catch (_) {
          /* ignore */
        }
      }
      window.removeEventListener("message", onMessage);
    };
  };
})(window.App = window.App || {});

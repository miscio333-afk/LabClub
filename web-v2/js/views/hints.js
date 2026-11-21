/* LabClub — indizi statici + glossario errori */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  function findLessonByTopic(topic) {
    return App.store.allLessons().find(function (lesson) {
      return lesson.topicTag === topic;
    });
  }

  function hintListHtml(lesson, state) {
    const data = App.content.hints[lesson.id];
    const hints = data ? data.hints : [];
    const solution = data ? data.solution : "";
    let out = "";

    hints.forEach(function (hint, i) {
      const unlocked = i < state.revealed;
      const current = i === state.revealed;
      out +=
        '<div class="hint-card' + (unlocked ? "" : " locked") + '">' +
        '<div class="row between"><span class="hint-num">INDIZIO ' + (i + 1) + "/" + hints.length + "</span>" +
        (unlocked ? '<span class="chip chip-green">SBLOCCATO</span>' : current ? '<span class="chip chip-purple">PROSSIMO</span>' : "") +
        "</div>";
      if (unlocked) {
        out += '<p class="hint-text">' + App.ui.esc(hint) + "</p>";
      } else if (current) {
        out +=
          '<p class="hint-text muted">' + (i === 0 ? "Parti da qui: un suggerimento leggero, senza soluzione." : "Sbloccalo solo se il precedente non basta.") + "</p>" +
          '<button type="button" class="btn btn-purple btn-sm mt-8" data-reveal="' + i + '">Sblocca indizio ' + (i + 1) + "</button>";
      } else {
        out += '<p class="hint-text muted">Si sblocca dopo l\'indizio ' + i + ".</p>";
      }
      out += "</div>";
    });

    out +=
      '<div class="card mt-16">' +
      '<div class="row between"><span class="kicker">SOLUZIONE</span>' +
      (state.solution
        ? '<span class="chip chip-green">VISIBILE</span>'
        : '<button type="button" class="btn btn-ghost btn-sm" data-solution>Mostra</button>') +
      "</div>";
    if (state.solution) {
      out +=
        '<p class="mt-8" style="font-size:12px;color:var(--muted)">Prova prima da solo: leggerla dopo vale molto di più.</p>' +
        '<pre class="code mt-8"><code>' + App.ui.esc(solution) + "</code></pre>";
    } else {
      out += '<p class="mt-8" style="font-size:12px;color:var(--muted)">La soluzione è nascosta. Aprila solo dopo aver provato.</p>';
    }
    out += "</div>";

    return out;
  }

  function drawHintScreen(root, lesson, course) {
    const state = { revealed: 0, solution: false };
    root.innerHTML =
      '<a class="back" href="#/indizi">← Tutti gli indizi</a>' +
      '<div class="tutor-head" style="margin-bottom:16px">' +
      '<span class="tutor-orb">💡</span>' +
      "<div>" +
      '<span class="kicker purple">INDIZI · ' + App.ui.esc((course || {}).title || "LABCLUB").toUpperCase() + "</span>" +
      "<h1 style=\"font-size:22px;margin-top:4px\">" + App.ui.esc(lesson.title) + "</h1>" +
      '<p style="font-size:11.5px;color:var(--muted);margin-top:3px">Tre indizi progressivi, poi la soluzione. Nessuna IA, nessuna attesa.</p>' +
      "</div></div>" +
      '<div id="hints-slot"></div>' +
      '<div class="row wrap mt-16">' +
      '<a class="btn btn-primary btn-sm" href="#/lezione/' + lesson.id + '">Apri la lezione</a>' +
      '<a class="btn btn-ghost btn-sm" href="#/lab">Apri il Lab</a>' +
      '<a class="btn btn-ghost btn-sm" href="#/indizi">Altri indizi</a>' +
      "</div>";

    const slot = root.querySelector("#hints-slot");

    function draw() {
      slot.innerHTML = hintListHtml(lesson, state);
      slot.querySelectorAll("[data-reveal]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const i = Number(btn.dataset.reveal);
          if (i !== state.revealed) return;
          state.revealed = i + 1;
          App.ui.haptic();
          draw();
        });
      });
      const solutionBtn = slot.querySelector("[data-solution]");
      if (solutionBtn) {
        solutionBtn.addEventListener("click", function () {
          state.solution = true;
          draw();
        });
      }
    }

    draw();
  }

  function drawIndex(root) {
    const courses = App.content.courses || [];
    const weak = App.store.state.profile.weakTopics || [];

    const options = courses
      .map(function (course) {
        return (
          '<optgroup label="' + App.ui.esc(course.title) + '">' +
          course.lessons.map(function (lesson) {
            return '<option value="' + lesson.id + '">' + App.ui.esc(lesson.title) + "</option>";
          }).join("") +
          "</optgroup>"
        );
      })
      .join("");

    const weakChips = weak.length
      ? '<div class="section-title"><h2>Da rivedere</h2><span>' + weak.length + "</span></div>" +
        '<div class="chip-row">' +
        weak.map(function (topic) {
          const lesson = findLessonByTopic(topic);
          return lesson
            ? '<a class="chip chip-coral" href="#/indizi/' + lesson.id + '">' + App.ui.esc(topic) + " →</a>"
            : '<span class="chip chip-coral">' + App.ui.esc(topic) + "</span>";
        }).join("") +
        "</div>"
      : "";

    const courseBlocks = courses
      .map(function (course) {
        const rows = course.lessons.map(function (lesson) {
          return (
            '<a class="lesson-row" href="#/indizi/' + lesson.id + '">' +
            '<span class="lesson-index">' + lesson.orderIndex + "</span>" +
            '<span class="lesson-info"><span class="lesson-name">' + App.ui.esc(lesson.title) + "</span>" +
            '<span class="lesson-sub">' + App.ui.esc(lesson.topicTag) + "</span></span>" +
            '<span class="lesson-arrow">' + App.ui.icon("chevron", 17) + "</span></a>"
          );
        }).join("");
        return (
          '<div class="card mt-16" style="padding-top:16px;padding-bottom:6px">' +
          '<span class="kicker' + (course.accent === "purple" ? " purple" : "") + '">' + App.ui.esc(course.title).toUpperCase() + "</span>" +
          '<div class="lesson-list" style="margin-top:10px">' + rows + "</div></div>"
        );
      })
      .join("");

    const errors = (App.content.errors || [])
      .map(function (err) {
        return (
          '<details class="error-item">' +
          "<summary>" + App.ui.esc(err.name) + "</summary>" +
          '<div class="error-body">' +
          '<p class="mb-8">' + App.ui.esc(err.cause) + "</p>" +
          '<p class="mb-8"><b style="color:var(--white)">Fix:</b> ' + App.ui.esc(err.fix) + "</p>" +
          '<pre class="code" style="padding:9px;font-size:10.5px"><code>' + App.ui.esc(err.example) + "</code></pre>" +
          "</div></details>"
        );
      })
      .join("");

    root.innerHTML =
      '<div class="page-head">' +
      "<h1>Indizi</h1>" +
      "<p>Il tutor LabClub è statico: tre indizi per lezione e un glossario errori. Tutto offline, nessuna API.</p>" +
      "</div>" +
      '<div class="tutor-head">' +
      '<span class="tutor-orb">💡</span>' +
      "<div>" +
      '<span class="kicker purple">TUTOR STATICO</span>' +
      '<p style="font-size:12px;color:#c9c9d3;margin-top:3px">Scegli la lezione e sblocca gli indizi uno alla volta.</p>' +
      "</div></div>" +
      '<div class="card mt-16">' +
      '<div class="field"><label for="hint-lesson">Lezione</label>' +
      '<select id="hint-lesson"><option value="">Scegli una lezione…</option>' + options + "</select></div>" +
      "</div>" +
      weakChips +
      '<div class="section-title"><h2>Per lezione</h2><span>' + App.store.allLessons().length + "</span></div>" +
      courseBlocks +
      '<div class="section-title"><h2>Glossario errori</h2><span>Python</span></div>' +
      '<div>' + errors + "</div>" +
      '<div class="notice mt-24">Nessun messaggio viene inviato: gli indizi sono testi salvati nell\'app. ' +
      "Se un errore non è in elenco, controlla riga, due punti e rientri.</div>";

    root.querySelector("#hint-lesson").addEventListener("change", function (event) {
      if (event.target.value) App.actions.go("/indizi/" + event.target.value);
    });
  }

  views.hints = function (root, params) {
    if (!params.lessonId) {
      drawIndex(root);
      return;
    }
    const lesson = App.store.getLesson(params.lessonId);
    if (!lesson) {
      root.innerHTML =
        '<div class="empty" style="margin-top:32px"><span class="empty-icon">💡</span>' +
        "<h2 style=\"font-size:20px\">Lezione non trovata</h2><p>Torna all'elenco e scegli una lezione.</p>" +
        '<a class="btn btn-primary mt-16" href="#/indizi">Tutti gli indizi</a></div>';
      return;
    }
    drawHintScreen(root, lesson, App.store.getCourse(lesson.courseId));
  };
})(window.App = window.App || {});

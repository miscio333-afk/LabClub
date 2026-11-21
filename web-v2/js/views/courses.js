/* LabClub — elenco corsi e dettaglio corso */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  function courseCard(course) {
    const progress = App.store.courseProgress(course);
    const pct = Math.round((progress.done / progress.total) * 100);
    const purple = course.accent === "purple";
    return (
      '<a class="card card-accent course-card' + (purple ? " purple" : "") + '" data-morph="course-' + course.id + '" href="#/corso/' + course.id + '">' +
      '<div class="course-top">' +
      '<span class="course-index">' + course.orderIndex + "</span>" +
      '<div style="flex:1;min-width:0">' +
      '<span class="course-title">' + App.ui.esc(course.title) + "</span>" +
      '<span class="course-sub">' + App.ui.esc(course.subtitle) + "</span>" +
      "</div>" +
      '<span class="chip' + (progress.done === progress.total ? " chip-green" : "") + '">' + progress.done + "/" + progress.total + "</span>" +
      "</div>" +
      '<div class="chip-row mt-16">' +
      course.topics.slice(0, 3).map(function (topic) {
        return '<span class="chip">' + App.ui.esc(topic) + "</span>";
      }).join("") +
      (course.topics.length > 3 ? '<span class="chip">+' + (course.topics.length - 3) + "</span>" : "") +
      "</div>" +
      '<div class="course-meta"><span>' + pct + "% completato</span><span>" + course.lessons.length + " lezioni</span></div>" +
      App.ui.progressBar(progress.done, progress.total, purple) +
      "</a>"
    );
  }

  views.courses = function (root) {
    const all = App.content.courses || [];
    const totalLessons = App.store.allLessons().length;
    const done = App.store.state.profile.completedLessons.length;
    const questions = all.reduce(function (acc, course) {
      return (
        acc +
        course.lessons.reduce(function (sum, lesson) {
          return sum + lesson.quizQuestions.length;
        }, 0)
      );
    }, 0);

    root.innerHTML =
      '<div class="page-head">' +
      "<h1>Corsi</h1>" +
      "<p>" + all.length + " percorsi · " + totalLessons + " lezioni · " + questions + " domande. Scegli da dove partire.</p>" +
      "</div>" +
      '<div class="card card-flat">' +
      '<div class="progress-meta"><span>Avanzamento totale</span><span>' + done + "/" + totalLessons + "</span></div>" +
      App.ui.progressBar(done, totalLessons) +
      '<p class="mt-8">' +
      (done === 0 ? "Ancora nessuna lezione: il primo passo è il più importante." : done >= totalLessons ? "Percorso completo. Ora alza il livello con i drop." : "Continua da dove eri rimasto.") +
      "</p></div>" +
      '<div class="mt-16">' + all.map(courseCard).join("") + "</div>";
  };

  function courseCover(course, progress) {
    const purple = course.accent === "purple";
    const questions = course.lessons.reduce(function (sum, lesson) {
      return sum + lesson.quizQuestions.length;
    }, 0);
    const number = String(course.orderIndex).padStart(2, "0");
    return (
      '<section class="course-cover' + (purple ? " purple" : "") + '" data-morph-target="course-' + course.id + '" aria-labelledby="course-title">' +
      (course.image
        ? '<img class="course-cover-media" src="' + course.image + '" alt="" width="1200" height="675" decoding="async" />'
        : "") +
      '<span class="cover-grid" aria-hidden="true"></span>' +
      '<span class="cover-glow" aria-hidden="true"></span>' +
      '<span class="cover-watermark" aria-hidden="true">' + number + "</span>" +
      '<div class="course-cover-body">' +
      '<span class="kicker' + (purple ? " purple" : "") + '">PERCORSO ' + number + "</span>" +
      '<h1 id="course-title">' + App.ui.esc(course.title) + "</h1>" +
      "<p>" + App.ui.esc(course.subtitle) + "</p>" +
      '<div class="course-cover-meta">' +
      '<span class="chip">' + course.lessons.length + " lezioni</span>" +
      '<span class="chip">' + questions + " domande</span>" +
      '<span class="chip">' + progress.done + "/" + progress.total + " fatte</span>" +
      "</div></div></section>"
    );
  }

  views.course = function (root, params) {
    const course = App.store.getCourse(params.id);
    if (!course) {
      root.innerHTML =
        '<div class="empty" style="margin-top:32px"><span class="empty-icon">📚</span>' +
        "<h2 style=\"font-size:20px\">Corso non trovato</h2><p>Controlla il link o torna all'elenco.</p>" +
        '<a class="btn btn-primary mt-16" href="#/corsi">Tutti i corsi</a></div>';
      return;
    }
    const progress = App.store.courseProgress(course);
    const pct = Math.round((progress.done / progress.total) * 100);
    const purple = course.accent === "purple";
    const firstOpen =
      course.lessons.find(function (lesson) {
        return !App.store.isLessonCompleted(lesson.id);
      }) || course.lessons[course.lessons.length - 1];

    const lessons = course.lessons.map(function (lesson) {
      const completed = App.store.isLessonCompleted(lesson.id);
      return (
        '<a class="lesson-row' + (completed ? " done" : "") + '" href="#/lezione/' + lesson.id + '">' +
        '<span class="lesson-index">' + (completed ? App.ui.icon("check", 14) : lesson.orderIndex) + "</span>" +
        '<span class="lesson-info">' +
        '<span class="lesson-name">' + App.ui.esc(lesson.title) + "</span>" +
        '<span class="lesson-sub">' + lesson.durationMinutes + " min · " + App.ui.esc(lesson.topicTag) + "</span>" +
        "</span>" +
        '<span class="' + (completed ? "lesson-check" : "lesson-arrow") + '">' +
        App.ui.icon(completed ? "check" : "chevron", 17) +
        "</span></a>"
      );
    }).join("");

    root.innerHTML =
      '<a class="back" href="#/corsi">← Tutti i corsi</a>' +
      courseCover(course, progress) +
      (course.credit
        ? '<div class="notice">' + App.ui.esc(course.credit) + "</div>"
        : "") +
      '<div class="card card-flat mt-16">' +
      '<div class="progress-meta"><span>' + progress.done + " di " + progress.total + " lezioni</span><span>" + pct + "%</span></div>" +
      App.ui.progressBar(progress.done, progress.total, purple) +
      '<div class="chip-row mt-16">' +
      course.topics.map(function (topic) {
        return '<span class="chip' + (purple ? " chip-purple" : "") + '">' + App.ui.esc(topic) + "</span>";
      }).join("") +
      "</div></div>" +
      '<div class="section-title"><h2>Lezioni</h2><span>' + progress.done + "/" + progress.total + "</span></div>" +
      '<div class="card" style="padding-top:2px;padding-bottom:2px">' + lessons + "</div>" +
      '<div class="card card-accent mt-16' + (purple ? " purple" : "") + '">' +
      '<span class="kicker' + (purple ? " purple" : "") + '">RIPASSO</span>' +
      "<h3 class=\"mt-8\">Bloccato su qualcosa?</h3>" +
      '<p class="mt-8">Apri i tre indizi della lezione o prova il codice nel Lab.</p>' +
      '<div class="row mt-16">' +
      '<a class="btn btn-soft btn-sm" href="#/indizi/' + firstOpen.id + '">Indizi</a>' +
      '<a class="btn btn-ghost btn-sm" href="#/lab">Apri il Lab</a>' +
      "</div></div>" +
      '<a class="btn btn-primary btn-block mt-16" href="#/lezione/' + firstOpen.id + '">' +
      (progress.done === 0 ? "Inizia la prima lezione" : progress.done === progress.total ? "Ripassa l'ultima lezione" : "Continua il corso") +
      "</a>";
  };
})(window.App = window.App || {});

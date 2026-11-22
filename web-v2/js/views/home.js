/* LabClub — Home */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  function nextLesson() {
    const profile = App.store.state.profile;
    if (profile.lastLessonId) {
      const last = App.store.getLesson(profile.lastLessonId);
      if (last && !App.store.isLessonCompleted(last.id)) return last;
    }
    const all = [];
    App.content.courses.forEach(function (course) {
      course.lessons.forEach(function (lesson) {
        all.push(lesson);
      });
    });
    return (
      all.find(function (lesson) {
        return !App.store.isLessonCompleted(lesson.id);
      }) || all[all.length - 1]
    );
  }

  function mountHeroVideo(root) {
    const video = root.querySelector(".hero-video");
    if (!video) return null;
    const connection = navigator.connection || {};
    if (App.ui.prefersReducedMotion() || connection.saveData) return video;
    const playback = video.play();
    if (playback && playback.catch) playback.catch(function () {});
    return video;
  }

  function heroFor(profile) {
    const name = (profile.name || "").trim();
    const greeting = name ? "BENTORNATO, " + App.ui.esc(name.toUpperCase()) : "IMPARA. CREA.";
    return (
      '<section class="hero">' +
      '<video class="hero-media hero-video" poster="assets/img/hero-001-poster.webp" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1">' +
      '<source src="assets/video/hero-001-loop.mp4" type="video/mp4" />' +
      "</video>" +
      '<div class="hero-shade"></div>' +
      '<div class="hero-body">' +
      '<span class="kicker">LABCLUB · TECH CREW</span>' +
      "<h1>" + greeting + (name ? "" : "<br><em>DOMINA.</em>") + "</h1>" +
      "<p>" + (App.content.courses || []).length + " corsi, quiz, drop settimanali e un lab di codice. Zero login: apri, impara, costruisci.</p>" +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="#/lezione/' + nextLesson().id + '">' +
      (App.store.state.profile.completedLessons.length ? "Riprendi" : "Inizia ora") +
      "</a>" +
      '<a class="btn btn-ghost" href="#/corsi">Corsi</a>' +
      "</div></div></section>"
    );
  }

  function stats() {
    const profile = App.store.state.profile;
    return (
      '<div class="stat-grid">' +
      '<div class="stat"><div class="stat-value green">' + profile.points + '</div><div class="stat-label">Punti</div></div>' +
      '<div class="stat"><div class="stat-value purple">' + App.store.level() + '</div><div class="stat-label">Livello</div></div>' +
      '<div class="stat"><div class="stat-value yellow">' + App.store.stamps() + '/10</div><div class="stat-label">Timbri</div></div>' +
      "</div>"
    );
  }

  function continueCard() {
    const lesson = nextLesson();
    if (!lesson) return "";
    const course = App.store.getCourse(lesson.courseId);
    const done = App.store.state.profile.completedLessons.length;
    const total = App.store.allLessons().length;
    return (
      '<div class="section-title"><h2>Continua</h2><a href="#/corsi">Tutti i corsi →</a></div>' +
      '<div class="card continue-card card-accent">' +
      '<div class="continue-top">' +
      '<span class="kicker">' + App.ui.esc(course ? course.title : "Corso") + "</span>" +
      '<span class="chip">' + done + "/" + total + " FATTE</span>" +
      "</div>" +
      '<div class="continue-title">' + App.ui.esc(lesson.title) + "</div>" +
      '<div class="continue-meta">Lezione ' + lesson.orderIndex + " · " + lesson.durationMinutes + " min · " + App.ui.esc(lesson.topicTag) + "</div>" +
      '<div class="continue-cta"><a class="btn btn-primary btn-block" href="#/lezione/' + lesson.id + '">Apri lezione</a></div>' +
      "</div>"
    );
  }

  function quickActions() {
    return (
      '<div class="quick-grid mt-16">' +
      '<a class="card quick-card" href="#/lab">' +
      '<span class="kicker">LAB</span>' +
      '<h3 class="mt-8">Scrivi codice</h3>' +
      '<p>Python e HTML nella sandbox.</p>' +
      "</a>" +
      '<a class="card quick-card" href="#/indizi">' +
      '<span class="kicker purple">INDIZI</span>' +
      '<h3 class="mt-8">Sblocca il dubbio</h3>' +
      '<p>Tre indizi e la soluzione.</p>' +
      "</a>" +
      '<a class="card quick-card quick-card-ai" href="#/assistente">' +
      '<span class="kicker purple">ASSISTENTE AI · VOICE LIVE</span>' +
      '<h3 class="mt-8">Parla con il tutor AI</h3>' +
      '<p>Conversazione vocale in tempo reale su lezioni, quiz e codice.</p>' +
      "</a>" +
      "</div>"
    );
  }

  function coursesPreview() {
    const rows = App.content.courses.map(function (course) {
      const progress = App.store.courseProgress(course);
      const pct = Math.round((progress.done / progress.total) * 100);
      return (
        '<a class="card card-accent course-card' + (course.accent === "purple" ? " purple" : "") + '" data-morph="course-' + course.id + '" href="#/corso/' + course.id + '">' +
        '<div class="course-top">' +
        '<span class="course-index">' + course.orderIndex + "</span>" +
        "<div style=\"flex:1;min-width:0\">" +
        '<span class="course-title">' + App.ui.esc(course.title) + "</span>" +
        '<span class="course-sub">' + App.ui.esc(course.subtitle) + "</span>" +
        "</div>" +
        '<span class="chip' + (progress.done === progress.total ? " chip-green" : "") + '">' + progress.done + "/" + progress.total + "</span>" +
        "</div>" +
        '<div class="course-meta"><span>' + pct + "% completato</span><span>" + course.lessons.length + " lezioni</span></div>" +
        App.ui.progressBar(progress.done, progress.total, course.accent === "purple") +
        "</a>"
      );
    });
    return '<div class="section-title"><h2>Percorsi</h2><a href="#/corsi">Apri tutti →</a></div>' + rows.join("");
  }

  function dropHighlight() {
    const drops = App.content.drops || [];
    const open = drops.filter(function (drop) {
      return App.ui.dropReleased(drop) && !App.store.isDropDone(drop.id);
    });
    const drop = open[0] || drops[0];
    if (!drop) return "";
    const released = App.ui.dropReleased(drop);
    return (
      '<div class="section-title"><h2>Drop</h2><a href="#/drops">Tutti i drop →</a></div>' +
      '<a class="drop-highlight" href="#/drops">' +
      '<img src="' + (drop.image || "assets/img/drop-banner.jpg") + '" alt="" width="1200" height="600" loading="lazy" decoding="async" />' +
      '<span class="drop-shade"></span>' +
      '<span class="drop-body">' +
      '<span class="drop-tag">' + App.ui.esc(drop.tag) + (released ? " · LIVE" : " · IN ARRIVO") + "</span>" +
      "<h3>" + App.ui.esc(drop.title) + "</h3>" +
      "<p>" + (released ? "Sfida aperta · +" + drop.rewardPoints + " PT" : "Si sblocca il " + App.ui.fmtDate(App.ui.dropDate(drop).toISOString())) + "</p>" +
      "</span></a>"
    );
  }

  function stampPreview() {
    const stamps = App.store.stamps();
    return (
      '<div class="section-title"><h2>Stamp card</h2><a href="#/profilo">Profilo →</a></div>' +
      '<div class="card">' +
      '<div class="row between"><span class="kicker">TIMBRI</span><span class="mono muted" style="font-size:11px">' + stamps + "/10</span></div>" +
      '<div class="mt-16">' + App.ui.stampGrid(stamps) + "</div>" +
      '<p class="mt-8">' + (stamps >= 10 ? "Bonus Super Coder sbloccato." : "Completa lezioni per riempire la card e sbloccare Super Coder.") + "</p>" +
      "</div>"
    );
  }

  function welcomeSheet() {
    const profile = App.store.state.profile;
    const lessons = App.store.allLessons();
    const questions = lessons.reduce(function (sum, lesson) {
      return sum + lesson.quizQuestions.length;
    }, 0);
    const html =
      '<div class="welcome-hero">' +
      '<video class="welcome-video hero-video" poster="assets/img/hero-001-poster.webp" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1">' +
      '<source src="assets/video/hero-001-loop.mp4" type="video/mp4" />' +
      "</video>" +
      '<span class="shade"></span>' +
      "<h2>Entra nel Lab</h2>" +
      "</div>" +
      '<p class="muted" style="font-size:12.5px">Nessun account, nessun server: tutto quello che fai resta su questo dispositivo. Il nome serve solo a personalizzare la home.</p>' +
      '<div class="field"><label for="w-name">Nome o nickname (opzionale)</label>' +
      '<input id="w-name" maxlength="60" autocomplete="nickname" placeholder="Es. Alex" value="' + App.ui.esc(profile.name) + '" /></div>' +
      '<div class="field"><label for="w-class">Classe o crew (opzionale)</label>' +
      '<input id="w-class" maxlength="30" placeholder="Es. 3A / Neon Team" value="' + App.ui.esc(profile.className) + '" /></div>' +
      '<div class="welcome-list mt-8">' +
      '<div class="welcome-item"><span class="dot">1</span><span><b>' + (App.content.courses || []).length + ' corsi</b>, ' + lessons.length + ' lezioni e ' + questions + ' domande di quiz.</span></div>' +
      '<div class="welcome-item"><span class="dot">2</span><span><b>Drop e timbri</b>: +10 PT a lezione, badge e stamp card.</span></div>' +
      '<div class="welcome-item"><span class="dot">3</span><span><b>Lab e indizi</b> senza API: Python, HTML e aiuti scritti a mano.</span></div>' +
      "</div>";

    App.ui.sheet({
      title: "Benvenuto",
      html: html,
      autoFocus: false,
      onMount: function (root) {
        mountHeroVideo(root);
      },
      actions: [
        {
          label: "Salta per ora",
          kind: "ghost",
          onClick: function () {
            App.store.updateProfile({ welcomed: true });
            setTimeout(App.router.refresh, 60);
          }
        },
        {
          label: "Inizia",
          kind: "primary",
          onClick: function (root) {
            const name = (root.querySelector("#w-name") || {}).value || "";
            const className = (root.querySelector("#w-class") || {}).value || "";
            App.store.updateProfile({ name: name, className: className, welcomed: true });
            const display = name.trim();
            App.ui.toast(display ? "Benvenuto, " + display + "!" : "Benvenuto nel Lab!", "good");
            App.ui.confetti();
            setTimeout(App.router.refresh, 60);
          }
        }
      ]
    });
  }

  views.home = function (root) {
    const profile = App.store.state.profile;
    root.innerHTML =
      heroFor(profile) +
      stats() +
      continueCard() +
      quickActions() +
      coursesPreview() +
      dropHighlight() +
      stampPreview() +
      '<div class="notice mt-24">LabClub è aperto a tutti: niente login, niente classifica, niente dati inviati altrove. ' +
      'I progressi vivono in questo browser.</div>';

    const heroVideo = mountHeroVideo(root);
    const cleanupReveal = App.ui.revealOnScroll(root, "[data-reveal='stamps']");
    let welcomeTimer = null;
    if (!profile.welcomed) {
      welcomeTimer = setTimeout(welcomeSheet, 420);
    }

    return function () {
      if (welcomeTimer) clearTimeout(welcomeTimer);
      if (heroVideo) heroVideo.pause();
      cleanupReveal();
    };
  };
})(window.App = window.App || {});

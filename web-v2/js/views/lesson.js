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

  function frameSvg() {
    return (
      '<svg class="card-frame" aria-hidden="true" focusable="false">' +
      '<rect class="frame-glow" x="0.75" y="0.75" width="100%" height="100%" rx="21" ry="21" pathLength="100"></rect>' +
      '<rect class="frame-trace" x="0.75" y="0.75" width="100%" height="100%" rx="21" ry="21" pathLength="100"></rect>' +
      "</svg>"
    );
  }

  function decorateCards(root, purple, acceptIn) {
    const cards = root.querySelectorAll(".chapter, .card");
    cards.forEach(function (card, i) {
      if (!card || card.classList.contains("has-frame")) return;
      const number = card.querySelector(".chapter-num");
      const ghost = number
        ? '<span class="chapter-ghost" aria-hidden="true">' + App.ui.esc(number.textContent) + "</span>"
        : "";
      card.classList.add("has-frame");
      if (purple) card.classList.add("frame-purple");
      card.style.setProperty("--frame-i", String(i));
      card.insertAdjacentHTML(
        "afterbegin",
        '<span class="card-fx-grid" aria-hidden="true"></span>' +
          ghost +
          frameSvg()
      );
      App.ui.decorateAmbientCard(card, { purple: purple, index: i });
      if (acceptIn && !card.classList.contains("reveal")) card.classList.add("in");
    });
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

    const lessonNumber = String(lesson.orderIndex || 1).padStart(2, "0");
    const totalLessons = course.lessons ? course.lessons.length : 1;
    const lessonTotal = String(totalLessons).padStart(2, "0");

    root.innerHTML =
      '<section class="lesson-cover' + (purple ? " purple" : "") + '" aria-labelledby="lesson-title">' +
      '<a class="lesson-cover-back" href="#/corso/' + course.id + '">← ' + App.ui.esc(course.title) + "</a>" +
      '<span class="lesson-cover-bg" aria-hidden="true">' +
      '<img class="lesson-cover-media" src="' + App.ui.lessonTexture(lesson.topicTag) + '" alt="" width="960" height="540" loading="lazy" decoding="async" />' +
      '<span class="cover-grid"></span>' +
      '<span class="cover-glow"></span>' +
      "</span>" +
      '<span class="cover-watermark" aria-hidden="true">' + lessonNumber + "</span>" +
      '<div class="lesson-cover-body">' +
      '<span class="kicker' + (purple ? " purple" : "") + '">' + App.ui.esc(course.title).toUpperCase() + " · LEZIONE " + lessonNumber + " / " + lessonTotal + "</span>" +
      '<h1 class="lesson-title" id="lesson-title">' + App.ui.esc(lesson.title) + "</h1>" +
      '<div class="lesson-meta">' +
      '<span class="chip">' + lesson.durationMinutes + " MIN</span>" +
      '<span class="chip' + (purple ? " chip-purple" : " chip-green") + '">' + App.ui.esc(lesson.topicTag) + "</span>" +
      '<span id="lesson-status"></span>' +
      "</div></div></section>" +
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
    let cleanupReveal = function () {};
    let cleanupSchemas = function () {};
    const introVideos = [];
    const introCleanups = [];

    function renderSchemasBlock() {
      const list = lesson.schemas || [];
      if (!list.length) return "";
      const first = list[0];
      const kicker = list.length > 1 ? "SCHEMI DI APPROFONDIMENTO" : "SCHEMA DI RIPASSO";
      const tabs =
        list.length > 1
          ? '<div class="schema-tabs" role="tablist" aria-label="Seleziona schema di ripasso">' +
            list
              .map(function (item, idx) {
                return (
                  '<button type="button" role="tab" class="schema-tab' + (idx === 0 ? " active" : "") + '"' +
                  ' aria-selected="' + (idx === 0 ? "true" : "false") + '" data-schema-index="' + idx + '">' +
                  App.ui.esc(item.label) +
                  "</button>"
                );
              })
              .join("") +
            "</div>"
          : "";
      return (
        '<section class="card schema-block">' +
        '<span class="kicker' + (purple ? " purple" : "") + '">' + kicker + "</span>" +
        '<h3 class="schema-block-title" data-schema-heading>' + App.ui.esc(first.title) + "</h3>" +
        '<p class="schema-block-desc" data-schema-desc>' + App.ui.esc(first.desc || "") + "</p>" +
        tabs +
        '<div class="schema-stage">' +
        '<button type="button" class="schema-trigger" data-schema-zoom' +
        ' data-schema-src="' + App.ui.esc(first.src) + '"' +
        ' data-schema-title="' + App.ui.esc(first.title) + '"' +
        ' data-schema-desc="' + App.ui.esc(first.desc || "") + '"' +
        ' aria-label="Ingrandisci lo schema: ' + App.ui.esc(first.title) + '">' +
        '<img class="schema-img" data-schema-img src="' + App.ui.esc(first.src) + '" alt="' + App.ui.esc(first.title) + '"' +
        ' width="' + Number(first.width || 1000) + '" height="' + Number(first.height || 1180) + '" loading="lazy" decoding="async" />' +
        '<span class="schema-zoom-pill"><span>Schema animato · tocca per leggere i dettagli</span><b>Ingrandisci</b></span>' +
        "</button>" +
        "</div>" +
        "</section>"
      );
    }

    function mountSchemas() {
      let activeModalClose = null;

      function openZoom(src, title, desc) {
        if (activeModalClose) activeModalClose();
        const prevFocus = document.activeElement;
        const modal = document.createElement("div");
        modal.className = "schema-modal" + (purple ? " purple" : "");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-label", title || "Schema ingrandito");
        modal.innerHTML =
          '<div class="schema-modal-head">' +
          '<div class="schema-modal-copy">' +
          "<h2>" + App.ui.esc(title || "Schema") + "</h2>" +
          (desc ? "<p>" + App.ui.esc(desc) + "</p>" : "") +
          "</div>" +
          '<div class="schema-modal-actions">' +
          '<button type="button" class="btn btn-soft btn-sm" data-zoom-toggle aria-pressed="false">Zoom 1.8×</button>' +
          '<button type="button" class="icon-btn" data-zoom-close aria-label="Chiudi">' + App.ui.icon("x", 18) + "</button>" +
          "</div>" +
          "</div>" +
          '<div class="schema-modal-body">' +
          '<img class="schema-modal-img" src="' + App.ui.esc(src) + '" alt="' + App.ui.esc(title || "") + '" decoding="async" />' +
          "</div>";

        document.body.appendChild(modal);
        document.body.classList.add("sheet-open");

        const zoomBtn = modal.querySelector("[data-zoom-toggle]");
        const bodyEl = modal.querySelector(".schema-modal-body");
        let zoomed = false;

        function close() {
          document.removeEventListener("keydown", onKey);
          document.body.classList.remove("sheet-open");
          if (modal.parentNode) modal.parentNode.removeChild(modal);
          if (prevFocus && prevFocus.focus) prevFocus.focus();
          activeModalClose = null;
        }
        activeModalClose = close;

        function onKey(e) {
          if (e.key === "Escape") close();
        }

        zoomBtn.addEventListener("click", function () {
          zoomed = !zoomed;
          bodyEl.classList.toggle("is-zoomed", zoomed);
          zoomBtn.setAttribute("aria-pressed", zoomed ? "true" : "false");
          zoomBtn.textContent = zoomed ? "Adatta" : "Zoom 1.8×";
        });
        modal.querySelector("[data-zoom-close]").addEventListener("click", close);
        bodyEl.addEventListener("click", function (e) {
          if (e.target === bodyEl) close();
        });
        document.addEventListener("keydown", onKey);
        requestAnimationFrame(function () {
          modal.classList.add("open");
        });
        modal.querySelector("[data-zoom-close]").focus({ preventScroll: true });
      }

      const list = lesson.schemas || [];
      const block = studyPanel.querySelector(".schema-block");
      if (block && list.length > 1) {
        const heading = block.querySelector("[data-schema-heading]");
        const descEl = block.querySelector("[data-schema-desc]");
        const trigger = block.querySelector("[data-schema-zoom]");
        const img = block.querySelector("[data-schema-img]");
        const pills = block.querySelectorAll("[data-schema-index]");
        pills.forEach(function (pill) {
          pill.addEventListener("click", function () {
            const item = list[Number(pill.dataset.schemaIndex)];
            if (!item) return;
            pills.forEach(function (p) {
              const active = p === pill;
              p.classList.toggle("active", active);
              p.setAttribute("aria-selected", active ? "true" : "false");
            });
            if (heading) heading.textContent = item.title;
            if (descEl) descEl.textContent = item.desc || "";
            if (img) {
              img.src = item.src;
              img.alt = item.title;
              img.width = Number(item.width || 1000);
              img.height = Number(item.height || 1180);
            }
            if (trigger) {
              trigger.dataset.schemaSrc = item.src;
              trigger.dataset.schemaTitle = item.title;
              trigger.dataset.schemaDesc = item.desc || "";
              trigger.setAttribute("aria-label", "Ingrandisci lo schema: " + item.title);
            }
          });
        });
      }

      function onPanelClick(event) {
        const trigger = event.target.closest("[data-schema-zoom]");
        if (!trigger) return;
        event.preventDefault();
        event.stopPropagation();
        openZoom(
          trigger.dataset.schemaSrc || "",
          trigger.dataset.schemaTitle || "",
          trigger.dataset.schemaDesc || ""
        );
      }

      studyPanel.addEventListener("click", onPanelClick);
      return function () {
        studyPanel.removeEventListener("click", onPanelClick);
        if (activeModalClose) activeModalClose();
      };
    }

    function formatDuration(seconds) {
      const total = Math.max(0, Math.round(Number(seconds) || 0));
      return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
    }

    function mountIntro(article) {
      const video = article.querySelector("[data-intro-video]");
      const toggle = article.querySelector("[data-intro-toggle]");
      if (!video || !toggle) return function () {};
      const iconSlot = article.querySelector("[data-intro-icon]");
      const labelSlot = article.querySelector("[data-intro-label]");
      const metaSlot = article.querySelector("[data-intro-meta]");
      const progress = article.querySelector("[data-intro-progress]");
      const speaker = article.getAttribute("data-intro-speaker") || "Aria";
      const fallbackTotal = Number(article.getAttribute("data-intro-duration")) || 0;

      function total() {
        return isFinite(video.duration) && video.duration > 0 ? video.duration : fallbackTotal;
      }

      function paint() {
        const length = total();
        const ended = video.ended;
        const playing = !video.paused && !ended;
        const started = ended || video.currentTime > 0.2;
        article.classList.toggle("is-playing", playing);
        article.classList.toggle("is-paused", started && !playing && !ended);
        article.classList.toggle("is-ended", ended);
        toggle.setAttribute("aria-pressed", playing ? "true" : "false");

        if (playing) {
          labelSlot.textContent = "In ascolto";
          metaSlot.textContent = speaker + " · " + formatDuration(video.currentTime) + " / " + formatDuration(length);
          iconSlot.innerHTML = App.ui.icon("pause", 15);
          toggle.setAttribute("aria-label", "Metti in pausa l'introduzione di " + speaker);
        } else if (ended) {
          labelSlot.textContent = "Riascolta l'introduzione";
          metaSlot.textContent = speaker + " · " + formatDuration(length);
          iconSlot.innerHTML = App.ui.icon("replay", 15);
          toggle.setAttribute("aria-label", "Riascolta l'introduzione di " + speaker);
        } else if (started) {
          labelSlot.textContent = "Riprendi l'ascolto";
          metaSlot.textContent = speaker + " · " + formatDuration(video.currentTime) + " / " + formatDuration(length);
          iconSlot.innerHTML = App.ui.icon("play", 15);
          toggle.setAttribute("aria-label", "Riprendi l'introduzione di " + speaker);
        } else {
          labelSlot.textContent = "Ascolta l'introduzione";
          metaSlot.textContent = speaker + " · " + formatDuration(length);
          iconSlot.innerHTML = App.ui.icon("play", 15);
          toggle.setAttribute("aria-label", "Ascolta l'introduzione di " + speaker);
        }

        const fraction = length > 0 ? Math.min(1, Math.max(0, video.currentTime / length)) : 0;
        if (progress) progress.style.transform = "scaleX(" + fraction + ")";
      }

      function play() {
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            paint();
          });
        }
      }

      function togglePlay() {
        if (video.ended) {
          video.currentTime = 0;
          play();
          return;
        }
        if (video.paused) play();
        else video.pause();
      }

      function onArticleClick(event) {
        if (event.target.closest("[data-intro-toggle]")) return;
        const selection = window.getSelection ? String(window.getSelection()) : "";
        if (selection) return;
        togglePlay();
      }

      function onButtonClick(event) {
        event.preventDefault();
        event.stopPropagation();
        togglePlay();
      }

      function onVisibilityChange() {
        if (document.hidden && !video.paused) video.pause();
      }

      video.addEventListener("loadedmetadata", paint);
      video.addEventListener("play", paint);
      video.addEventListener("pause", paint);
      video.addEventListener("ended", paint);
      video.addEventListener("timeupdate", paint);
      video.addEventListener("error", paint);
      toggle.addEventListener("click", onButtonClick);
      article.addEventListener("click", onArticleClick);
      document.addEventListener("visibilitychange", onVisibilityChange);
      paint();

      return function () {
        if (!video.paused) video.pause();
        video.removeEventListener("loadedmetadata", paint);
        video.removeEventListener("play", paint);
        video.removeEventListener("pause", paint);
        video.removeEventListener("ended", paint);
        video.removeEventListener("timeupdate", paint);
        video.removeEventListener("error", paint);
        toggle.removeEventListener("click", onButtonClick);
        article.removeEventListener("click", onArticleClick);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    }

    if (lesson.chapters && lesson.chapters.length) {
      const chapters = lesson.chapters
        .map(function (chapter, i) {
          const intro = chapter.intro;
          const num = String(i + 1).padStart(2, "0");
          const speaker = intro ? intro.speaker || "Aria" : "";
          const introBg = intro
            ? '<span class="chapter-video-bg" aria-hidden="true">' +
              '<video class="chapter-video" data-intro-video src="' + App.ui.esc(intro.src) + '" poster="' + App.ui.esc(intro.poster) + '" preload="auto" playsinline></video>' +
              '<span class="chapter-video-scrim"></span>' +
              "</span>"
            : "";
          const introBar = intro
            ? '<button type="button" class="chapter-listen" data-intro-toggle aria-pressed="false">' +
              '<span class="chapter-listen-icon" data-intro-icon>' + App.ui.icon("play", 15) + "</span>" +
              '<span class="chapter-listen-copy">' +
              '<span class="chapter-listen-label" data-intro-label>Ascolta l\'introduzione</span>' +
              '<span class="chapter-listen-meta" data-intro-meta>' + App.ui.esc(speaker) + " · " + formatDuration(intro.duration) + "</span>" +
              "</span>" +
              '<span class="chapter-eq" aria-hidden="true"><i></i><i></i><i></i></span>' +
              "</button>" +
              '<span class="chapter-video-progress" aria-hidden="true"><span class="chapter-video-progress-bar" data-intro-progress></span></span>'
            : "";
          return (
            '<article class="chapter' + (intro ? " has-intro" : "") + '"' +
            (intro
              ? ' data-intro data-intro-duration="' + Number(intro.duration || 0) + '" data-intro-speaker="' + App.ui.esc(speaker) + '"'
              : "") +
            ">" +
            introBg +
            '<div class="chapter-head">' +
            '<span class="chapter-num">' + num + "</span>" +
            '<h2 class="chapter-title">' + App.ui.esc(chapter.title) + "</h2>" +
            "</div>" +
            introBar +
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

      const schemas = renderSchemasBlock();

      studyPanel.innerHTML =
        '<div class="card study-block">' +
        '<span class="kicker' + (purple ? " purple" : "") + '">OBIETTIVO</span>' +
        '<p class="mt-8">' + App.ui.esc(lesson.description) + "</p>" +
        "</div>" +
        '<div class="chapters">' + chapters + "</div>" +
        lab +
        schemas +
        keyPoints +
        '<div class="stack mt-16">' +
        '<a class="btn btn-soft btn-block" href="#/indizi/' + lesson.id + '">' +
        App.ui.icon("bulb", 16) + " Ho un dubbio: 3 indizi</a>" +
        '<button type="button" class="btn btn-purple btn-block" data-ask-ai>' +
        App.ui.icon("sparkles", 16) + " Parla con l'Assistente AI</button>" +
        '<button type="button" class="btn btn-primary btn-block" data-goto="quiz">Vai al quiz · ' + questions.length + " domande</button>" +
        "</div>" +
        '<div class="notice mt-16">Per completare la lezione devi rispondere a tutte le ' + questions.length +
        " domande del quiz. Puoi usare il codice quando vuoi: nessun voto, nessuna classifica.</div>";

      const labMount = studyPanel.querySelector("#lab-mount");
      if (labMount && lesson.lab && App.widgets && App.widgets.mount) {
        cleanupLab = App.widgets.mount(lesson.lab.widget, labMount);
      }

      cleanupReveal = App.ui.revealOnScroll(
        studyPanel,
        ".chapter, .lab-block, .schema-block, .keypoints",
        { skipFirst: true }
      );
    } else {
      const schemas = renderSchemasBlock();

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
        schemas +
        '<div class="stack mt-16">' +
        '<a class="btn btn-soft btn-block" href="#/indizi/' + lesson.id + '">' +
        App.ui.icon("bulb", 16) + " Ho un dubbio: 3 indizi</a>" +
        '<button type="button" class="btn btn-purple btn-block" data-ask-ai>' +
        App.ui.icon("sparkles", 16) + " Parla con l'Assistente AI</button>" +
        '<button type="button" class="btn btn-primary btn-block" data-goto="quiz">Vai al quiz · ' + questions.length + " domande</button>" +
        "</div>" +
        '<div class="notice mt-16">Per completare la lezione devi rispondere a tutte le ' + questions.length +
        " domande del quiz. Puoi usare il codice quando vuoi: nessun voto, nessuna classifica.</div>";
    }

    decorateCards(studyPanel, purple, true);
    cleanupSchemas = mountSchemas();

    studyPanel.querySelectorAll(".chapter.has-intro").forEach(function (article) {
      const video = article.querySelector("[data-intro-video]");
      if (video) introVideos.push(video);
      introCleanups.push(mountIntro(article));
    });

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
      '<button type="button" class="btn btn-purple btn-sm" id="btn-code-ai">' + App.ui.icon("sparkles", 14) + " AI</button>" +
      "</div>" +
      (isHtml
        ? '<p class="mt-16" style="font-size:11px;color:var(--zinc)">ANTEPRIMA ISOLATA</p>' +
          '<iframe class="preview-frame" id="preview" title="Anteprima HTML" sandbox="allow-scripts"></iframe>'
        : "") +
      '<p class="mt-16" style="font-size:11px;color:var(--zinc)">CONSOLE</p>' +
      '<pre class="console" id="console" aria-live="polite"></pre>' +
      "</div>" +
      '<div id="code-foot" class="mt-16"></div>';

    decorateCards(codePanel, purple, false);

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
    root.querySelectorAll("[data-ask-ai]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        App.actions.openAssistant({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          courseTitle: course.title,
          topicTag: lesson.topicTag
        });
      });
    });
    const codeAiBtn = root.querySelector("#btn-code-ai");
    if (codeAiBtn) {
      codeAiBtn.addEventListener("click", function () {
        App.actions.openAssistant({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          courseTitle: course.title,
          topicTag: lesson.topicTag,
          code: editor.value
        });
      });
    }
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
      if (name !== "study") {
        introVideos.forEach(function (video) {
          if (!video.paused) video.pause();
        });
      }
      if (name === "quiz") drawQuiz();
      if (name === "code") {
        codePanel.querySelectorAll(".has-frame").forEach(function (card) {
          card.classList.add("in");
        });
        drawCodeFoot();
      }
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
      if (typeof cleanupReveal === "function") {
        try {
          cleanupReveal();
        } catch (_) {
          /* ignore */
        }
      }
      if (typeof cleanupSchemas === "function") {
        try {
          cleanupSchemas();
        } catch (_) {
          /* ignore */
        }
      }
      introCleanups.forEach(function (fn) {
        try {
          fn();
        } catch (_) {
          /* ignore */
        }
      });
      window.removeEventListener("message", onMessage);
    };
  };
})(window.App = window.App || {});

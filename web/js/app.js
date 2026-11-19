/* LabClub — shell, router hash, azioni condivise. */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});
  let activeCleanup = null;

  function parseHash() {
    const raw = String(location.hash || "")
      .replace(/^#/, "")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
    const parts = raw.split("/").filter(Boolean).map(function (part) {
      try {
        return decodeURIComponent(part);
      } catch (_) {
        return part;
      }
    });

    const head = parts[0] || "";
    switch (head) {
      case "":
        return { view: "home", params: {}, title: "Home", tab: "home" };
      case "corsi":
        return { view: "courses", params: {}, title: "Corsi", tab: "corsi" };
      case "corso":
        return { view: "course", params: { id: parts[1] || "" }, title: "Corso", tab: "corsi" };
      case "lezione":
        return { view: "lesson", params: { id: parts[1] || "" }, title: "Lezione", tab: "corsi" };
      case "drops":
        return { view: "drops", params: {}, title: "Drops", tab: "drops" };
      case "indizi":
        return { view: "hints", params: { lessonId: parts[1] || "" }, title: "Indizi", tab: "indizi" };
      case "lab":
        return { view: "lab", params: {}, title: "Lab", tab: "corsi" };
      case "profilo":
        return { view: "profile", params: {}, title: "Profilo", tab: "profilo" };
      case "portfolio":
        return { view: "portfolio", params: {}, title: "Portfolio", tab: "profilo" };
      default:
        return { view: "notfound", params: {}, title: "Pagina non trovata", tab: "" };
    }
  }

  function setTab(tab) {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(function (el) {
      const active = el.dataset.tab === tab;
      el.classList.toggle("active", active);
      if (active) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  function syncChrome() {
    const profile = App.store.state.profile;
    const points = document.getElementById("points-value");
    if (points) points.textContent = String(profile.points);
    const avatar = document.getElementById("avatar-btn");
    if (avatar) avatar.textContent = App.ui.avatar(profile.avatarId);

    const warning = document.getElementById("storage-warning");
    if (!warning) return;
    if (App.store.available) {
      warning.classList.add("hidden");
      warning.innerHTML = "";
    } else {
      warning.classList.remove("hidden");
      warning.innerHTML =
        '<span aria-hidden="true">⚠️</span><span><b>Salvataggio non disponibile.</b> ' +
        "Questo browser blocca la memoria locale: i progressi restano solo in questa scheda. " +
        'Apri il <a href="#/profilo">Profilo</a> per esportare i dati.</span>';
    }
  }

  function notFound(root) {
    root.innerHTML =
      '<div class="empty" style="margin-top:40px">' +
      '<span class="empty-icon">🧭</span>' +
      "<h2 style=\"font-size:20px\">Pagina non trovata</h2>" +
      "<p>Il link che hai aperto non esiste o è stato spostato.</p>" +
      '<a class="btn btn-primary mt-16" href="#/">Torna alla home</a>' +
      "</div>";
  }

  function render() {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (_) {
        /* ignore */
      }
    }
    activeCleanup = null;

    const route = parseHash();
    const root = document.getElementById("view");
    if (!root) return;

    root.innerHTML = "";
    const view = views[route.view];
    if (!view) {
      notFound(root);
    } else {
      const result = view(root, route.params);
      if (typeof result === "function") activeCleanup = result;
    }

    root.style.animation = "none";
    void root.offsetWidth;
    root.style.animation = "";

    let dynamicTitle = route.title;
    if (route.view === "hints" && route.params.lessonId) {
      const hintLesson = App.store.getLesson(route.params.lessonId);
      if (hintLesson) dynamicTitle = hintLesson.title;
    }
    const routeId = route.params && route.params.id;
    if (routeId) {
      const lesson = App.store.getLesson(routeId);
      const course = App.store.getCourse(routeId);
      if (lesson) dynamicTitle = lesson.title;
      else if (course) dynamicTitle = course.title;
      else if (route.view === "lesson" || route.view === "course") dynamicTitle = "Non trovata";
    }
    document.title = dynamicTitle + " · LabClub";

    setTab(route.tab);
    syncChrome();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  const router = {
    render: render,
    refresh: render,
    current: parseHash
  };

  const actions = {
    completeLesson: function (lesson) {
      if (!lesson) return null;
      const stored = App.store.state.profile.quizResults[lesson.id];
      const total = (lesson.quizQuestions || []).length;
      if (!stored || stored.total !== total) {
        App.ui.toast("Prima completa il quiz: " + total + " domande.", "bad");
        return null;
      }
      const result = App.store.completeLesson(lesson);
      if (result.already) {
        App.ui.toast("Lezione già completata.", "");
        return result;
      }
      App.ui.confetti();
      App.ui.haptic();
      App.ui.toast("Lezione completata · +10 PT · Timbro " + result.stamps + "/10", "good");
      syncChrome();
      if (result.newBadges && result.newBadges.length) {
        setTimeout(function () {
          App.ui.toast("Nuovo badge: " + result.newBadges.join(", "), "good");
        }, 1200);
      }
      return result;
    },
    go: function (path) {
      const target = "#" + (path.charAt(0) === "/" ? path : "/" + path);
      if (location.hash === target) render();
      else location.hash = target;
    }
  };

  App.shell = { syncChrome: syncChrome, setTab: setTab };
  App.router = router;
  App.actions = actions;

  App.store.subscribe(function () {
    syncChrome();
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", function () {
    render();
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* offline opzionale: se fallisce l'app resta usabile */
      });
    }
  });

  // Caso limite: lo script viene caricato dopo il DOMContentLoaded.
  if (document.readyState !== "loading") {
    render();
  }
})(window.App = window.App || {});

/* LabClub — shell, router hash, azioni condivise. */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});
  let activeCleanup = null;
  let currentRoute = null;
  let activeTransition = null;
  let pendingMorph = null;
  let pendingForward = false;
  let morphSourceEl = null;
  let morphTargetEl = null;
  let morphTimer = null;
  let booted = false;

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

  function routeDepth(route) {
    if (!route) return 0;
    switch (route.view) {
      case "courses":
        return 1;
      case "course":
        return 2;
      case "lesson":
        return 3;
      case "hints":
        return route.params.lessonId ? 2 : 1;
      case "portfolio":
        return 1;
      default:
        return 0;
    }
  }

  function navDirection(from, to, forceForward) {
    if (!from || !to) return "fade";
    if (from.tab !== to.tab) return forceForward ? "forward" : "fade";
    const fromDepth = routeDepth(from);
    const toDepth = routeDepth(to);
    if (toDepth > fromDepth) return "forward";
    if (toDepth < fromDepth) return "back";
    return "fade";
  }

  function supportsViewTransition() {
    return (
      typeof document.startViewTransition === "function" &&
      !App.ui.prefersReducedMotion() &&
      document.visibilityState !== "hidden"
    );
  }

  function setNavState(direction) {
    if (direction) document.documentElement.dataset.nav = direction;
    else delete document.documentElement.dataset.nav;
  }

  function findMorphTarget(root, name) {
    const targets = root.querySelectorAll("[data-morph-target]");
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].getAttribute("data-morph-target") === name) return targets[i];
    }
    return null;
  }

  function clearMorph() {
    if (morphSourceEl) {
      try {
        morphSourceEl.style.viewTransitionName = "";
      } catch (_) {
        /* ignore */
      }
      morphSourceEl = null;
    }
    if (morphTargetEl) {
      try {
        morphTargetEl.style.viewTransitionName = "";
      } catch (_) {
        /* ignore */
      }
      morphTargetEl = null;
    }
    pendingMorph = null;
    if (morphTimer) {
      clearTimeout(morphTimer);
      morphTimer = null;
    }
  }

  document.addEventListener("click", function (event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const node = event.target;
    if (!node || !node.closest) return;
    const source = node.closest("[data-morph]");
    if (!source) return;
    const name = source.getAttribute("data-morph");
    pendingForward = true;
    if (!name || !supportsViewTransition()) return;

    clearMorph();
    pendingMorph = name;
    morphSourceEl = source;
    source.style.viewTransitionName = name;
    morphTimer = setTimeout(function () {
      if (!activeTransition) clearMorph();
    }, 1200);
  });

  function playFallback(direction) {
    const root = document.getElementById("view");
    if (!root) return;
    root.dataset.nav = direction || "fade";
    root.classList.remove("view-enter");
    void root.offsetWidth;
    root.classList.add("view-enter");
  }

  function paint(route) {
    if (typeof activeCleanup === "function") {
      try {
        activeCleanup();
      } catch (_) {
        /* ignore */
      }
    }
    activeCleanup = null;

    const root = document.getElementById("view");
    if (!root) return;
    root.classList.remove("view-enter");
    root.innerHTML = "";

    const view = views[route.view];
    if (!view) {
      notFound(root);
    } else {
      const result = view(root, route.params);
      if (typeof result === "function") activeCleanup = result;
    }

    if (route.view === "home" || route.view === "courses" || route.view === "course") {
      App.ui.decorateAmbientCards(root, ".card");
    } else if (route.view === "drops") {
      App.ui.decorateAmbientCards(root, ".drop-card", { amber: true });
      App.ui.decorateAmbientCards(root, ".card:not(.drop-card)");
    }

    if (pendingMorph) {
      const target = findMorphTarget(root, pendingMorph);
      if (target) {
        morphTargetEl = target;
        target.style.viewTransitionName = pendingMorph;
      }
    }

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

  function render(options) {
    const opts = options || {};
    const nextRoute = parseHash();
    const direction = navDirection(currentRoute, nextRoute, pendingForward);
    pendingForward = false;
    const wantsTransition =
      opts.transition !== false && !!currentRoute && supportsViewTransition();

    if (!wantsTransition) {
      paint(nextRoute);
      currentRoute = nextRoute;
      if (opts.animate === false) {
        clearMorph();
      } else {
        playFallback(direction);
        clearMorph();
      }
      return;
    }

    if (activeTransition) {
      try {
        activeTransition.skipTransition();
      } catch (_) {
        /* ignore */
      }
      activeTransition = null;
    }

    setNavState(direction || "fade");

    let transition;
    try {
      transition = document.startViewTransition(function () {
        paint(nextRoute);
        currentRoute = nextRoute;
      });
    } catch (_) {
      setNavState(null);
      paint(nextRoute);
      currentRoute = nextRoute;
      playFallback(direction);
      clearMorph();
      return;
    }

    activeTransition = transition;

    function finish() {
      if (activeTransition !== transition) return;
      activeTransition = null;
      setNavState(null);
      clearMorph();
    }

    transition.finished.then(finish).catch(finish);
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
    if (avatar) avatar.innerHTML = App.ui.avatar(profile.avatarId);

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

  const router = {
    render: function () {
      render({ transition: true, animate: true });
    },
    refresh: function () {
      render({ transition: false, animate: false });
    },
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
      App.ui.stampSlam(result.stamps);
      App.ui.haptic();
      syncChrome();
      setTimeout(function () {
        App.ui.toast("Lezione completata · +10 PT · Timbro " + result.stamps + "/10", "good");
      }, 420);
      if (result.newBadges && result.newBadges.length) {
        setTimeout(function () {
          App.ui.toast("Nuovo badge: " + result.newBadges.join(", "), "good");
        }, 1500);
      }
      return result;
    },
    go: function (path) {
      const target = "#" + (path.charAt(0) === "/" ? path : "/" + path);
      if (location.hash === target) render({ transition: false, animate: false });
      else location.hash = target;
    }
  };

  function boot() {
    if (booted) return;
    booted = true;
    render({ transition: false, animate: true });
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* offline opzionale: se fallisce l'app resta usabile */
      });
    }
  }

  App.shell = { syncChrome: syncChrome, setTab: setTab };
  App.router = router;
  App.actions = actions;

  App.store.subscribe(function () {
    syncChrome();
  });

  window.addEventListener("hashchange", function () {
    render({ transition: true, animate: true });
  });
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.App = window.App || {});

/* LabClub — stato locale, ricompense, export/import.
 * Tutto vive nel browser: nessun account, nessun server.
 */
(function (App) {
  "use strict";

  const KEY = "labclub.v1";
  const SCHEMA = 1;
  const MAX_POINTS = 1000000;
  const MAX_PROJECTS = 8;
  const MAX_SHOT_CHARS = 220000;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const int = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.floor(n) : fallback;
  };
  const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");

  function defaultState() {
    return {
      schemaVersion: SCHEMA,
      startedAt: new Date().toISOString(),
      profile: {
        name: "",
        className: "",
        avatarId: "cyber_neon",
        welcomed: false,
        points: 0,
        completedLessons: [],
        weakTopics: [],
        lastCourseId: "",
        lastLessonId: "",
        lastLessonTitle: "",
        quizResults: {},
        completedDrops: [],
        dropNotes: {},
        dropBadges: [],
        projects: []
      },
      settings: { sound: true }
    };
  }

  function normalize(raw) {
    const d = defaultState();
    if (!raw || typeof raw !== "object") return d;
    const p = raw.profile && typeof raw.profile === "object" ? raw.profile : {};
    const s = raw.settings && typeof raw.settings === "object" ? raw.settings : {};

    const state = {
      schemaVersion: SCHEMA,
      startedAt: typeof raw.startedAt === "string" ? raw.startedAt : d.startedAt,
      profile: {
        name: str(p.name, 60),
        className: str(p.className, 30),
        avatarId: str(p.avatarId, 40) || "cyber_neon",
        welcomed: p.welcomed === true,
        points: clamp(int(p.points, 0), 0, MAX_POINTS),
        completedLessons: Array.isArray(p.completedLessons)
          ? [...new Set(p.completedLessons.filter((x) => typeof x === "string"))].slice(0, 50)
          : [],
        weakTopics: Array.isArray(p.weakTopics)
          ? [...new Set(p.weakTopics.filter((x) => typeof x === "string"))].slice(0, 20)
          : [],
        lastCourseId: str(p.lastCourseId, 128),
        lastLessonId: str(p.lastLessonId, 128),
        lastLessonTitle: str(p.lastLessonTitle, 120),
        quizResults: p.quizResults && typeof p.quizResults === "object" ? p.quizResults : {},
        completedDrops: Array.isArray(p.completedDrops)
          ? [...new Set(p.completedDrops.filter((x) => typeof x === "string"))]
          : [],
        dropNotes: p.dropNotes && typeof p.dropNotes === "object" ? p.dropNotes : {},
        dropBadges: Array.isArray(p.dropBadges)
          ? [...new Set(p.dropBadges.filter((x) => typeof x === "string"))].slice(0, 20)
          : [],
        projects: Array.isArray(p.projects)
          ? p.projects
              .filter((x) => x && typeof x === "object" && typeof x.title === "string")
              .slice(0, MAX_PROJECTS)
              .map((x) => ({
                id: str(x.id, 40) || "p_" + Math.random().toString(36).slice(2, 9),
                title: str(x.title, 80),
                description: str(x.description, 400),
                url: str(x.url, 300),
                tags: Array.isArray(x.tags)
                  ? x.tags.filter((t) => typeof t === "string").slice(0, 6).map((t) => t.slice(0, 20))
                  : [],
                screenshot: typeof x.screenshot === "string" ? x.screenshot.slice(0, MAX_SHOT_CHARS) : "",
                createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString()
              }))
          : []
      },
      settings: { sound: s.sound !== false }
    };
    return state;
  }

  function sanitizeProgress(s) {
    const lessons = {};
    const courses = {};
    (App.content.courses || []).forEach(function (course) {
      courses[course.id] = true;
      course.lessons.forEach(function (lesson) {
        lessons[lesson.id] = true;
      });
    });
    s.profile.completedLessons = s.profile.completedLessons.filter(function (id) {
      return !!lessons[id];
    });
    Object.keys(s.profile.quizResults).forEach(function (id) {
      if (!lessons[id]) delete s.profile.quizResults[id];
    });
    if (s.profile.lastLessonId && !lessons[s.profile.lastLessonId]) {
      s.profile.lastLessonId = "";
      s.profile.lastLessonTitle = "";
    }
    if (s.profile.lastCourseId && !courses[s.profile.lastCourseId]) {
      s.profile.lastCourseId = "";
    }
    return s;
  }

  let available = true;
  let lastError = null;
  let state;

  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? sanitizeProgress(normalize(JSON.parse(raw))) : defaultState();
  } catch (err) {
    available = false;
    lastError = err;
    state = defaultState();
  }

  const listeners = new Set();

  function emit() {
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      available = true;
      lastError = null;
      return true;
    } catch (err) {
      available = false;
      lastError = err;
      return false;
    }
  }

  // Indice dei contenuti
  let index = null;
  function buildIndex() {
    index = { lessons: {}, courses: {} };
    (App.content.courses || []).forEach((course) => {
      index.courses[course.id] = course;
      course.lessons.forEach((lesson) => {
        index.lessons[lesson.id] = Object.assign({}, lesson, { courseId: course.id });
      });
    });
  }
  function contentIndex() {
    if (!index) buildIndex();
    return index;
  }

  const api = {
    KEY: KEY,
    get state() {
      return state;
    },
    get available() {
      return available;
    },
    get lastError() {
      return lastError;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    save,
    getLesson(id) {
      return contentIndex().lessons[id] || null;
    },
    getCourse(id) {
      return contentIndex().courses[id] || null;
    },
    allLessons() {
      return Object.values(contentIndex().lessons);
    },
    lessonCountOfCourse(courseId) {
      const c = contentIndex().courses[courseId];
      return c ? c.lessons.length : 0;
    },
    stamps() {
      return Math.min(10, state.profile.completedLessons.length);
    },
    level() {
      return clamp(1 + Math.floor(state.profile.points / 30), 1, 100);
    },
    levelProgress() {
      if (api.level() >= 100) return 1;
      return (state.profile.points % 30) / 30;
    },
    pointsToNextLevel() {
      if (api.level() >= 100) return 0;
      return 30 - (state.profile.points % 30);
    },
    bonusUnlocked() {
      return api.stamps() >= 10;
    },
    badges() {
      const names = new Set(state.profile.dropBadges);
      (App.content.badges || []).forEach((b) => {
        if (b.courseId) {
          const course = contentIndex().courses[b.courseId];
          if (course && course.lessons.every((l) => state.profile.completedLessons.includes(l.id))) {
            names.add(b.name);
          }
        }
        if (b.stamps && api.stamps() >= b.stamps) names.add(b.name);
      });
      return [...names];
    },
    hasBadge(name) {
      return api.badges().includes(name);
    },
    isLessonCompleted(id) {
      return state.profile.completedLessons.includes(id);
    },
    courseProgress(course) {
      const done = course.lessons.filter((l) => api.isLessonCompleted(l.id)).length;
      return { done, total: course.lessons.length };
    },
    updateProfile(patch) {
      if (typeof patch.name === "string") state.profile.name = patch.name.trim().slice(0, 60);
      if (typeof patch.className === "string") state.profile.className = patch.className.trim().slice(0, 30);
      if (typeof patch.avatarId === "string") state.profile.avatarId = patch.avatarId.slice(0, 40);
      if (typeof patch.welcomed === "boolean") state.profile.welcomed = patch.welcomed;
      save();
      emit();
    },
    completeLesson(lesson) {
      const id = typeof lesson === "string" ? lesson : lesson.id;
      const found = api.getLesson(id);
      if (!found) return { already: true, points: 0, stamps: api.stamps(), newBadges: [] };
      if (state.profile.completedLessons.includes(id)) {
        return { already: true, points: 0, stamps: api.stamps(), newBadges: [] };
      }
      const before = new Set(api.badges());
      state.profile.completedLessons.push(id);
      state.profile.points = clamp(state.profile.points + 10, 0, MAX_POINTS);
      state.profile.lastCourseId = found.courseId;
      state.profile.lastLessonId = id;
      state.profile.lastLessonTitle = found.title;
      save();
      emit();
      const after = new Set(api.badges());
      return {
        already: false,
        points: 10,
        stamps: api.stamps(),
        level: api.level(),
        newBadges: [...after].filter((b) => !before.has(b))
      };
    },
    setQuizResult(lesson, correct, total) {
      const safeTotal = Math.max(1, int(total, 1));
      const safeCorrect = clamp(int(correct, 0), 0, safeTotal);
      state.profile.quizResults[lesson.id] = {
        correct: safeCorrect,
        total: safeTotal,
        at: new Date().toISOString()
      };
      const topic = lesson.topicTag;
      if (topic) {
        const weak = new Set(state.profile.weakTopics);
        if (safeCorrect < safeTotal) weak.add(topic);
        else weak.delete(topic);
        state.profile.weakTopics = [...weak].slice(0, 20);
      }
      save();
      emit();
    },
    markDropDone(drop) {
      if (state.profile.completedDrops.includes(drop.id)) {
        return { already: true, points: 0, badge: "" };
      }
      state.profile.completedDrops.push(drop.id);
      state.profile.points = clamp(state.profile.points + drop.rewardPoints, 0, MAX_POINTS);
      let badge = "";
      if (drop.rewardBadge && !state.profile.dropBadges.includes(drop.rewardBadge)) {
        state.profile.dropBadges.push(drop.rewardBadge);
        badge = drop.rewardBadge;
      }
      save();
      emit();
      return { already: false, points: drop.rewardPoints, badge };
    },
    isDropDone(id) {
      return state.profile.completedDrops.includes(id);
    },
    setDropNote(id, note) {
      state.profile.dropNotes[id] = String(note || "").slice(0, 1200);
      save();
    },
    getDropNote(id) {
      return state.profile.dropNotes[id] || "";
    },
    addProject(project) {
      if (!project || !project.title || !project.title.trim()) {
        throw new Error("Dai un titolo al progetto.");
      }
      if (state.profile.projects.length >= MAX_PROJECTS) {
        throw new Error("Hai raggiunto il limite di " + MAX_PROJECTS + " progetti. Eliminane uno.");
      }
      const shot = typeof project.screenshot === "string" ? project.screenshot : "";
      if (shot.length > MAX_SHOT_CHARS) {
        throw new Error("Screenshot troppo grande: usa un'immagine più leggera.");
      }
      state.profile.projects.unshift({
        id: "p_" + Date.now().toString(36),
        title: str(project.title.trim(), 80),
        description: str((project.description || "").trim(), 400),
        url: str((project.url || "").trim(), 300),
        tags: Array.isArray(project.tags)
          ? project.tags.filter(Boolean).slice(0, 6).map((t) => String(t).slice(0, 20))
          : [],
        screenshot: shot,
        createdAt: new Date().toISOString()
      });
      if (!save()) {
        state.profile.projects.shift();
        throw new Error("Memoria piena: rimuovi uno screenshot o esporta i dati.");
      }
      emit();
    },
    deleteProject(id) {
      state.profile.projects = state.profile.projects.filter((p) => p.id !== id);
      save();
      emit();
    },
    exportData() {
      return JSON.stringify(
        {
          app: "LabClub",
          exportedAt: new Date().toISOString(),
          state: state
        },
        null,
        2
      );
    },
    importData(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        return { ok: false, error: "Il file non è un JSON valido." };
      }
      const incoming = parsed && parsed.state ? parsed.state : parsed;
      if (!incoming || typeof incoming !== "object" || !incoming.profile) {
        return { ok: false, error: "Il file non contiene un profilo LabClub." };
      }
      const validDrops = new Set((App.content.drops || []).map((d) => d.id));
      state = sanitizeProgress(normalize(incoming));
      state.profile.completedDrops = state.profile.completedDrops.filter((id) => validDrops.has(id));
      state.profile.lastLessonTitle = state.profile.lastLessonId
        ? (api.getLesson(state.profile.lastLessonId) || {}).title || state.profile.lastLessonTitle
        : "";
      if (!save()) return { ok: false, error: "Import riuscito ma memoria piena: esporta e libera spazio." };
      emit();
      return { ok: true };
    },
    reset() {
      state = defaultState();
      save();
      emit();
    }
  };

  // Primo avvio: salva subito startedAt, così i drop hanno una data stabile.
  try {
    if (available && !localStorage.getItem(KEY)) save();
  } catch (_) {
    /* ignore */
  }

  App.store = api;
  App.store.emit = emit;
})(window.App = window.App || {});

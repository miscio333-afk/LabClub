/* LabClub — helper UI condivisi */
(function (App) {
  "use strict";

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7z"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    terminal: '<path d="M4 17l6-6-6-6"/><path d="M12 19h8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    back: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
    arrow: '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="7" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
    replay: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/>',
    download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/>',
    upload: '<path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M4 3h16"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/>',
    external: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v7H3V3h7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    code: '<path d="M8 6 2 12l6 6"/><path d="M16 6l6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3"/><path d="M17 6h3v2a3 3 0 0 1-3 3"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    chevron: '<path d="M9 18l6-6-6-6"/>',
    sparkles: '<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'
  };

  const AVATAR_IMAGES = {
    cyber_neon: "assets/img/avatars/cyber-neon.webp",
    hoodie_purple: "assets/img/avatars/hoodie-purple.webp",
    glitch_bot: "assets/img/avatars/glitch-bot.webp",
    arcade_volt: "assets/img/avatars/arcade-volt.webp"
  };

  const AVATARS = [
    { id: "cyber_neon", label: "Cyber Neon", image: AVATAR_IMAGES.cyber_neon },
    { id: "hoodie_purple", label: "Hoodie Purple", image: AVATAR_IMAGES.hoodie_purple },
    { id: "glitch_bot", label: "Glitch Bot", image: AVATAR_IMAGES.glitch_bot },
    { id: "arcade_volt", label: "Arcade Volt", image: AVATAR_IMAGES.arcade_volt }
  ];

  const LESSON_TEXTURES = {
    Hardware: "hardware",
    Binario: "binary",
    Compilatori: "code",
    Algoritmi: "algorithms",
    Variabili: "data",
    Condizioni: "algorithms",
    Cicli: "algorithms",
    Funzioni: "algorithms",
    Liste: "data",
    Stringhe: "data",
    Validazione: "data",
    Debug: "code",
    "HTML e CSS": "code",
    JavaScript: "code",
    "Android e Firebase": "hardware",
    "Database e SQL": "data",
    "Fondamenti IA": "data",
    "Prompt Engineering": "data",
    "Password e 2FA": "security",
    "Phishing e Privacy": "security",
    "Etica IA e Fake News": "security"
  };


  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function icon(name, size) {
    const body = ICONS[name] || ICONS.sparkles;
    const s = size || 22;
    return (
      '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + body + "</svg>"
    );
  }

  const motionQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

  function prefersReducedMotion() {
    return !!(motionQuery && motionQuery.matches);
  }

  function revealOnScroll(root, selector, options) {
    const opts = options || {};
    const scope = root || document;
    let elements = Array.prototype.slice.call(scope.querySelectorAll(selector));
    if (!elements.length) return function () {};
    let first = null;
    if (opts.skipFirst) {
      first = elements.shift();
      if (first) first.classList.add("in");
    }
    if (!elements.length) return function () {};

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      elements.forEach(function (el) {
        el.classList.add("reveal", "in");
      });
      return function () {};
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    elements.forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });

    return function () {
      observer.disconnect();
    };
  }

  function ambientMarkup() {
    return (
      '<span class="card-ambient" aria-hidden="true">' +
      '<span class="ambient-orb orb-a"></span>' +
      '<span class="ambient-orb orb-b"></span>' +
      '<span class="ambient-sweep"></span>' +
      "</span>"
    );
  }

  function decorateAmbientCard(card, options) {
    if (!card || card.classList.contains("has-ambient")) return;
    const opts = options || {};
    card.classList.add("has-ambient");
    if (opts.purple) card.classList.add("ambient-purple");
    if (opts.amber) card.classList.add("ambient-amber");
    const index = typeof opts.index === "number" ? opts.index : 0;
    card.style.setProperty("--ambient-delay", index * -2.7 + "s");
    card.insertAdjacentHTML("afterbegin", ambientMarkup());
  }

  function decorateAmbientCards(root, selector, options) {
    const opts = options || {};
    const scope = root || document;
    const cards = Array.prototype.slice.call(
      scope.querySelectorAll(selector || ".card")
    );
    cards.forEach(function (card, i) {
      decorateAmbientCard(card, {
        purple: card.classList.contains("purple"),
        amber: !!opts.amber,
        index: i
      });
    });
  }

  let toastTimer = null;
  function toast(message, kind) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.className = "toast show " + (kind || "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.className = "toast " + (kind || "");
    }, 2600);
  }

  let closeSheetFn = null;
  function closeSheet() {
    if (closeSheetFn) closeSheetFn();
  }

  function sheet(opts) {
    closeSheet();
    const options = opts || {};
    const backdrop = document.createElement("div");
    backdrop.className = "sheet-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");

    const actions = (options.actions || [])
      .map(function (a, i) {
        const kind =
          a.kind === "primary"
            ? "btn-primary"
            : a.kind === "purple"
              ? "btn-purple"
              : a.kind === "danger"
                ? "btn-danger"
                : "btn-ghost";
        return (
          '<button type="button" class="btn ' + kind + ' btn-block" data-action="' + i + '">' +
          esc(a.label) + "</button>"
        );
      })
      .join("");

    backdrop.innerHTML =
      '<div class="sheet">' +
      '<div class="sheet-grip"></div>' +
      '<div class="sheet-head">' +
      "<h2>" + esc(options.title || "") + "</h2>" +
      '<button type="button" class="icon-btn" data-close aria-label="Chiudi">' + icon("x", 18) + "</button>" +
      "</div>" +
      '<div class="sheet-body">' + (options.html || "") + "</div>" +
      (actions ? '<div class="sheet-actions">' + actions + "</div>" : "") +
      "</div>";

    document.body.appendChild(backdrop);
    document.body.classList.add("sheet-open");

    const previouslyFocused = document.activeElement;

    function close() {
      document.removeEventListener("keydown", onKey);
      backdrop.classList.remove("open");
      document.body.classList.remove("sheet-open");
      setTimeout(function () {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 220);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
      closeSheetFn = null;
    }
    closeSheetFn = close;

    function onKey(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const focusables = backdrop.querySelectorAll("button, [href], input, select, textarea");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    backdrop.querySelector("[data-close]").addEventListener("click", close);
    document.addEventListener("keydown", onKey);

    const actionButtons = backdrop.querySelectorAll("[data-action]");
    actionButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const action = options.actions[Number(btn.dataset.action)];
        if (!action) return;
        if (action.onClick) {
          const result = action.onClick(backdrop, close);
          if (result === false) return;
        }
        if (action.keepOpen !== true) close();
      });
    });

    requestAnimationFrame(function () {
      backdrop.classList.add("open");
    });

    if (options.autoFocus !== false) {
      setTimeout(function () {
        const target = backdrop.querySelector("input, textarea, select, button:not([data-close])");
        if (target && target.focus && window.innerWidth > 0) target.focus({ preventScroll: true });
      }, 260);
    }

    if (options.onMount) options.onMount(backdrop, close);
    return { root: backdrop, close: close };
  }

  function confetti() {
    if (prefersReducedMotion()) return;
    const colors = ["#00FF88", "#A100FF", "#E5FF00", "#F7F7FA"];
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    for (let i = 0; i < 28; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty("--dx", (Math.random() * 140 - 70).toFixed(0) + "px");
      piece.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
      piece.style.animationDelay = (Math.random() * 260).toFixed(0) + "ms";
      piece.style.opacity = String(0.7 + Math.random() * 0.3);
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 2400);
  }

  function haptic() {
    try {
      if (navigator.vibrate) navigator.vibrate(12);
    } catch (_) {
      /* ignore */
    }
  }

  function stampSlam(stamps) {
    if (!stamps || stamps < 1 || prefersReducedMotion()) return;
    const previous = document.querySelector(".stamp-slam");
    if (previous && previous.parentNode) previous.parentNode.removeChild(previous);

    const layer = document.createElement("div");
    layer.className = "stamp-slam" + (stamps >= 10 ? " complete" : "");
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="stamp-slam-disc">' +
      '<span class="stamp-slam-num">' + stamps + "</span>" +
      '<span class="stamp-slam-total">/10</span>' +
      "</div>" +
      '<span class="stamp-slam-label">' +
      (stamps >= 10 ? "STAMP CARD COMPLETA" : "TIMBRO " + stamps + "/10") +
      "</span>";

    document.body.appendChild(layer);
    requestAnimationFrame(function () {
      layer.classList.add("go");
    });
    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 1800);
  }

  function avatar(id) {
    const src = AVATAR_IMAGES[id] || AVATAR_IMAGES.cyber_neon;
    return (
      '<img class="avatar-img" src="' + src + '" alt="" width="512" height="512" decoding="async" />'
    );
  }

  function lessonTexture(topic) {
    return "assets/img/lessons/" + (LESSON_TEXTURES[topic] || "code") + ".webp";
  }

  function avatarLabel(id) {
    const found = AVATARS.find(function (a) {
      return a.id === id;
    });
    return found ? found.label : "Cyber Neon";
  }

  function fmtDate(iso) {
    try {
      return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(
        new Date(iso)
      );
    } catch (_) {
      return "";
    }
  }

  function stampGrid(stamps) {
    let out = '<div class="stamp-grid" data-reveal="stamps" aria-label="' + stamps + ' timbri su 10">';
    for (let i = 1; i <= 10; i++) {
      out +=
        '<span class="stamp' + (i <= stamps ? " filled" : "") + '" data-stamp="' + i + '" style="--i:' + i + '">' +
        i +
        "</span>";
    }
    out += "</div>";
    return out;
  }

  function badgeGrid() {
    const earned = App.store.badges();
    return (
      '<div class="badge-grid">' +
      (App.content.badges || [])
        .map(function (b) {
          const has = earned.includes(b.name);
          return (
            '<div class="badge' + (has ? "" : " locked") + '">' +
            '<span class="badge-icon">' +
            (has
              ? b.image
                ? '<img class="badge-img" src="' + b.image + '" alt="" width="512" height="512" loading="lazy" decoding="async" />'
                : b.icon
              : "🔒") +
            "</span>" +
            "<span>" +
            '<span class="badge-name">' + esc(b.name) + "</span>" +
            '<span class="badge-desc">' + esc(b.description) + "</span>" +
            "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function progressBar(value, total, purple) {
    const pct = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
    return (
      '<div class="progress' + (purple ? " purple" : "") + '">' +
      '<span style="width:' + pct.toFixed(1) + '%"></span></div>'
    );
  }

  function dropDate(drop) {
    const start = new Date(App.store.state.startedAt).getTime();
    return new Date(start + drop.offsetDays * 86400000);
  }

  function dropReleased(drop) {
    return Date.now() >= dropDate(drop).getTime();
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 600);
  }

  function compressImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error("Scegli un file immagine."));
        return;
      }
      const reader = new FileReader();
      reader.onerror = function () {
        reject(new Error("Impossibile leggere l'immagine."));
      };
      reader.onload = function () {
        const img = new Image();
        img.onerror = function () {
          reject(new Error("Immagine non valida."));
        };
        img.onload = function () {
          const scale = Math.min(1, (maxDim || 900) / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality || 0.72));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  App.ui = {
    esc: esc,
    icon: icon,
    toast: toast,
    sheet: sheet,
    closeSheet: closeSheet,
    confetti: confetti,
    haptic: haptic,
    stampSlam: stampSlam,
    prefersReducedMotion: prefersReducedMotion,
    revealOnScroll: revealOnScroll,
    decorateAmbientCard: decorateAmbientCard,
    decorateAmbientCards: decorateAmbientCards,
    avatar: avatar,
    avatarLabel: avatarLabel,
    avatars: AVATARS,
    lessonTexture: lessonTexture,
    fmtDate: fmtDate,
    stampGrid: stampGrid,
    badgeGrid: badgeGrid,
    progressBar: progressBar,
    dropDate: dropDate,
    dropReleased: dropReleased,
    download: download,
    compressImage: compressImage
  };
})(window.App = window.App || {});

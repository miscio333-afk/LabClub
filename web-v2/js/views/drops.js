/* LabClub — drops settimanali */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  function difficultyChip(difficulty) {
    const cls = difficulty === "EASY" ? "chip-green" : difficulty === "HARD" ? "chip-coral" : "chip-yellow";
    return '<span class="chip ' + cls + '">' + difficulty + "</span>";
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toIcsDate(date) {
    return (
      date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      "00"
    );
  }

  function toIcsUtc(date) {
    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  }

  function icsFor(drop, index) {
    const release = App.ui.dropDate(drop);
    const start = new Date(Math.max(release.getTime(), Date.now() + 45 * 60 * 1000));
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const now = new Date();
    const description = (drop.description + " Indizio: " + drop.hint)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LabClub//Drops//IT",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:labclub-" + drop.id + "-" + now.getTime() + "@local",
      "DTSTAMP:" + toIcsUtc(now),
      "DTSTART:" + toIcsDate(start),
      "DTEND:" + toIcsDate(end),
      "SUMMARY:LabClub · " + drop.title.replace(/,/g, "\\,"),
      "DESCRIPTION:" + description,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:LabClub drop in arrivo",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  function openDrop(drop, index, onChanged) {
    const done = App.store.isDropDone(drop.id);
    const note = App.store.getDropNote(drop.id);
    const released = App.ui.dropReleased(drop);

    App.ui.sheet({
      title: drop.title,
      html:
        '<div class="chip-row">' +
        '<span class="chip">' + App.ui.esc(drop.tag) + "</span>" +
        difficultyChip(drop.difficulty) +
        '<span class="chip chip-yellow">+' + drop.rewardPoints + " PT</span>" +
        (drop.rewardBadge ? '<span class="chip">BADGE ' + App.ui.esc(drop.rewardBadge).toUpperCase() + "</span>" : "") +
        "</div>" +
        '<p style="font-size:13px;line-height:1.6;color:#c9c9d3">' + App.ui.esc(drop.description) + "</p>" +
        '<div class="notice">' +
        '<div class="row between"><b style="color:var(--green)">Indizio</b>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-hint>Mostra</button></div>' +
        '<p id="drop-hint" class="mt-8 hidden" style="font-size:12px;color:#c9c9d3"></p>' +
        "</div>" +
        '<div class="field"><label for="drop-note">Le tue note sul drop</label>' +
        '<textarea id="drop-note" maxlength="1200" placeholder="Idee, codice, link, cosa ti ha bloccato...">' + App.ui.esc(note) + "</textarea>" +
        '<span class="hint">Salvate solo su questo dispositivo.</span></div>' +
        '<div class="row wrap">' +
        (released
          ? '<button type="button" class="btn btn-soft btn-sm" data-ics>' + App.ui.icon("calendar", 15) + " Promemoria</button>"
          : '<span class="chip">SI SBLOCCA IL ' + App.ui.fmtDate(App.ui.dropDate(drop).toISOString()).toUpperCase() + "</span>") +
        '<button type="button" class="btn btn-soft btn-sm" data-save-note>Salva nota</button>' +
        "</div>" +
        (done
          ? '<div class="notice" style="border-color:rgba(0,255,136,.3);color:var(--green)">Drop completato: +' + drop.rewardPoints + " PT già accreditati.</div>"
          : ""),
      actions: done
        ? [{ label: "Chiudi", kind: "primary" }]
        : [
            {
              label: "Segna completato · +" + drop.rewardPoints + " PT",
              kind: "primary",
              onClick: function () {
                const result = App.store.markDropDone(drop);
                if (result.already) {
                  App.ui.toast("Drop già completato.", "");
                } else {
                  App.ui.confetti();
                  App.ui.haptic();
                  App.ui.toast("Drop completato · +" + result.points + " PT", "good");
                  if (result.badge) {
                    setTimeout(function () {
                      App.ui.toast("Badge sbloccato: " + result.badge, "good");
                    }, 1100);
                  }
                  onChanged();
                }
              }
            },
            { label: "Chiudi", kind: "ghost" }
          ],
      onMount: function (sheetRoot) {
        const hintEl = sheetRoot.querySelector("#drop-hint");
        sheetRoot.querySelector("[data-hint]").addEventListener("click", function (event) {
          hintEl.textContent = drop.hint;
          hintEl.classList.remove("hidden");
          event.currentTarget.remove();
        });

        sheetRoot.querySelector("[data-save-note]").addEventListener("click", function () {
          const value = sheetRoot.querySelector("#drop-note").value;
          App.store.setDropNote(drop.id, value);
          App.ui.toast("Nota salvata.", "good");
        });

        const icsBtn = sheetRoot.querySelector("[data-ics]");
        if (icsBtn) {
          icsBtn.addEventListener("click", function () {
            const slug = "labclub-drop-" + String(index + 1).padStart(2, "0") + ".ics";
            App.ui.download(slug, icsFor(drop, index), "text/calendar;charset=utf-8");
            App.ui.toast("Promemoria scaricato: aprilo nel calendario.", "good");
          });
        }
      }
    });
  }

  function draw(root) {
    const drops = App.content.drops || [];
    const released = drops.filter(function (drop) {
      return App.ui.dropReleased(drop);
    }).length;
    const completed = drops.filter(function (drop) {
      return App.store.isDropDone(drop.id);
    }).length;

    const cards = drops.map(function (drop, index) {
      const done = App.store.isDropDone(drop.id);
      const open = App.ui.dropReleased(drop);
      const lockLabel = "DAL " + App.ui.fmtDate(App.ui.dropDate(drop).toISOString()).toUpperCase();
      return (
        '<article class="card drop-card' + (done ? " done" : "") + (open ? "" : " locked") + '"' +
        (open ? ' data-drop="' + index + '" role="button" tabindex="0"' : "") + ">" +
        '<div class="drop-cover">' +
        '<img src="' + (drop.image || "assets/img/drop-banner.jpg") + '" alt="" width="1200" height="600" loading="lazy" decoding="async" />' +
        '<span class="drop-cover-shade"></span>' +
        '<div class="drop-cover-body">' +
        '<span class="drop-tag">' + App.ui.esc(drop.tag) + (done ? " · COMPLETATO" : open ? " · LIVE" : " · LOCKED") + "</span>" +
        '<span class="drop-title">' + App.ui.esc(drop.title) + "</span>" +
        "</div></div>" +
        '<div class="drop-body">' +
        '<p class="drop-desc">' + App.ui.esc(drop.description) + "</p>" +
        '<div class="drop-meta">' +
        difficultyChip(drop.difficulty) +
        '<span class="chip">' + (open ? "APERTO" : lockLabel) + "</span>" +
        (drop.rewardBadge ? '<span class="chip">' + App.ui.esc(drop.rewardBadge) + "</span>" : "") +
        "</div>" +
        '<div class="drop-foot">' +
        '<span class="reward">+' + drop.rewardPoints + " <small>PT</small></span>" +
        '<span class="chip' + (done ? " chip-green" : open ? " chip-yellow" : "") + '">' +
        (done ? "FATTO" : open ? "RACCOGLI" : "IN ARRIVO") +
        "</span></div></div></article>"
      );
    }).join("");

    root.innerHTML =
      '<div class="page-head">' +
      "<h1>Drops</h1>" +
      "<p>Tre sfide a tempo. Si sbloccano da sole sul dispositivo: niente server, niente scadenze finte.</p>" +
      "</div>" +
      '<div class="card card-flat">' +
      '<div class="stat-grid">' +
      '<div class="stat"><div class="stat-value green">' + released + "/" + drops.length + '</div><div class="stat-label">Aperti</div></div>' +
      '<div class="stat"><div class="stat-value purple">' + completed + "/" + drops.length + '</div><div class="stat-label">Fatti</div></div>' +
      '<div class="stat"><div class="stat-value yellow">+' +
      drops.filter(function (d) { return App.store.isDropDone(d.id); }).reduce(function (a, d) { return a + d.rewardPoints; }, 0) +
      '</div><div class="stat-label">PT Drop</div></div>' +
      "</div></div>" +
      '<div class="mt-16">' + cards + "</div>" +
      '<div class="notice mt-24">I drop sono sfide oneste: premi "Segna completato" solo dopo averle fatte davvero. ' +
      "Le note restano nel browser e il promemoria è un file calendario locale.</div>";

    root.querySelectorAll("[data-drop]").forEach(function (card) {
      function openSheet() {
        const drop = drops[Number(card.dataset.drop)];
        openDrop(drop, Number(card.dataset.drop), function () {
          draw(root);
          App.shell.syncChrome();
        });
      }
      card.addEventListener("click", openSheet);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openSheet();
        }
      });
    });
  }

  views.drops = function (root) {
    draw(root);
  };
})(window.App = window.App || {});

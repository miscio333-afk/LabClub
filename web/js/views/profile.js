/* LabClub — profilo, timbri, badge, backup */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  function findLessonByTopic(topic) {
    return App.store.allLessons().find(function (lesson) {
      return lesson.topicTag === topic;
    });
  }

  function editSheet(onSaved) {
    const profile = App.store.state.profile;
    let selectedAvatar = profile.avatarId;

    App.ui.sheet({
      title: "Modifica profilo",
      html:
        '<div class="field"><label for="p-name">Nome o nickname</label>' +
        '<input id="p-name" maxlength="60" autocomplete="nickname" placeholder="Es. Alex" value="' + App.ui.esc(profile.name) + '" /></div>' +
        '<div class="field"><label for="p-class">Classe o crew</label>' +
        '<input id="p-class" maxlength="30" placeholder="Es. 3A / Neon Team" value="' + App.ui.esc(profile.className) + '" /></div>' +
        '<div class="field"><label>Avatar</label>' +
        '<div class="avatar-picker" id="p-avatars">' +
        App.ui.avatars.map(function (avatar) {
          return (
            '<button type="button" class="avatar-opt' + (avatar.id === selectedAvatar ? " active" : "") + '" data-avatar="' + avatar.id + '" title="' + App.ui.esc(avatar.label) + '" aria-label="' + App.ui.esc(avatar.label) + '">' +
            App.ui.avatar(avatar.id) +
            "</button>"
          );
        }).join("") +
        "</div></div>" +
        '<div class="notice">Il profilo serve solo a personalizzare l\'app: non viene inviato da nessuna parte.</div>',
      actions: [
        { label: "Annulla", kind: "ghost" },
        {
          label: "Salva",
          kind: "primary",
          onClick: function (sheetRoot) {
            const name = (sheetRoot.querySelector("#p-name") || {}).value || "";
            const className = (sheetRoot.querySelector("#p-class") || {}).value || "";
            App.store.updateProfile({ name: name, className: className, avatarId: selectedAvatar });
            App.ui.toast("Profilo aggiornato.", "good");
            if (onSaved) onSaved();
          }
        }
      ],
      onMount: function (sheetRoot) {
        sheetRoot.querySelectorAll("[data-avatar]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            selectedAvatar = btn.dataset.avatar;
            sheetRoot.querySelectorAll("[data-avatar]").forEach(function (other) {
              other.classList.toggle("active", other === btn);
            });
          });
        });
      }
    });
  }

  function confirmReset() {
    App.ui.sheet({
      title: "Azzerare tutto?",
      html:
        '<p class="muted" style="font-size:13px">Punti, timbri, badge, note dei drop e portfolio verranno cancellati da questo dispositivo. ' +
        "L'operazione non si può annullare. Se vuoi conservare i progressi, esporta prima il backup.</p>",
      actions: [
        { label: "Annulla", kind: "ghost" },
        {
          label: "Azzera tutto",
          kind: "danger",
          onClick: function () {
            App.store.reset();
            App.ui.toast("Dati azzerati.", "");
            App.router.refresh();
          }
        }
      ]
    });
  }

  views.profile = function (root) {
    const profile = App.store.state.profile;
    const badges = App.store.badges();
    const stamps = App.store.stamps();
    const level = App.store.level();
    const progress = Math.round(App.store.levelProgress() * 100);
    const toNext = App.store.pointsToNextLevel();
    const weak = profile.weakTopics || [];
    const total = App.store.allLessons().length;
    const name = profile.name || "Crew LabClub";
    const sub = [profile.className, "Livello " + level].filter(Boolean).join(" · ");

    const weakHtml = weak.length
      ? '<div class="section-title"><h2>Da rivedere</h2><span>' + weak.length + "</span></div>" +
        '<div class="card card-flat"><div class="chip-row">' +
        weak.map(function (topic) {
          const lesson = findLessonByTopic(topic);
          return lesson
            ? '<a class="chip chip-coral" href="#/indizi/' + lesson.id + '">' + App.ui.esc(topic) + " →</a>"
            : '<span class="chip chip-coral">' + App.ui.esc(topic) + "</span>";
        }).join("") +
        "</div><p class=\"mt-8\">Questi argomenti hanno ancora errori nel quiz. Rivedi gli indizi prima di riprovare.</p></div>"
      : "";

    const superCoder =
      stamps >= 10
        ? '<div class="card mt-16" style="padding:0;overflow:hidden">' +
          '<img src="assets/img/super-coder.jpg" alt="Super Coder" style="width:100%;aspect-ratio:16/7;object-fit:cover" />' +
          '<div style="padding:15px 17px"><span class="kicker yellow">SUPER CODER</span>' +
          "<h3 class=\"mt-8\">Stamp card completa</h3>" +
          '<p class="mt-8">10 lezioni completate. Il laboratorio è tuo.</p></div></div>'
        : "";

    root.innerHTML =
      '<div class="page-head">' +
      "<h1>Profilo</h1>" +
      "<p>Progressi, timbri e backup. Tutto locale: nessun account, nessuna classifica.</p>" +
      "</div>" +
      '<div class="card">' +
      '<div class="profile-hero">' +
      '<span class="avatar-lg">' + App.ui.avatar(profile.avatarId) + "</span>" +
      '<div style="flex:1;min-width:0">' +
      '<div class="profile-name">' + App.ui.esc(name) + "</div>" +
      '<div class="profile-sub">' + App.ui.esc(sub) + "</div>" +
      '<div class="chip-row mt-8">' +
      '<span class="chip chip-green">' + profile.points + " PT</span>" +
      '<span class="chip">' + profile.completedLessons.length + "/" + total + " LEZIONI</span>" +
      "</div></div>" +
      '<button type="button" class="icon-btn" id="edit-profile" aria-label="Modifica profilo">' + App.ui.icon("user", 18) + "</button>" +
      "</div></div>" +
      '<div class="stat-grid mt-16">' +
      '<div class="stat"><div class="stat-value green">' + profile.points + '</div><div class="stat-label">Punti</div></div>' +
      '<div class="stat"><div class="stat-value purple">' + level + '</div><div class="stat-label">Livello</div></div>' +
      '<div class="stat"><div class="stat-value yellow">' + stamps + '/10</div><div class="stat-label">Timbri</div></div>' +
      "</div>" +
      '<div class="card mt-16">' +
      '<div class="progress-meta"><span>Livello ' + level + "</span><span>" +
      (level >= 100 ? "MAX" : toNext + " PT AL PROSSIMO") + "</span></div>" +
      App.ui.progressBar(progress, 100, true) +
      '<p class="mt-8">' + (level >= 100 ? "Hai raggiunto il livello massimo." : "Ogni 30 punti sali di livello.") + "</p></div>" +
      '<div class="section-title"><h2>Stamp card</h2><span>' + stamps + "/10</span></div>" +
      '<div class="card">' +
      App.ui.stampGrid(stamps) +
      '<p class="mt-16">' + (stamps >= 10 ? "Card completa: +badge Super Coder." : "Un timbro per ogni lezione completata. A 10 timbri scatta il bonus.") + "</p>" +
      "</div>" +
      superCoder +
      '<div class="section-title"><h2>Badge</h2><span>' + badges.length + "/" + (App.content.badges || []).length + "</span></div>" +
      App.ui.badgeGrid() +
      weakHtml +
      '<div class="section-title"><h2>Portfolio</h2><span>' + profile.projects.length + "/8</span></div>" +
      '<div class="card card-accent">' +
      '<div class="row between">' +
      "<div><span class=\"kicker\">PROGETTI</span><h3 class=\"mt-8\">Le tue build</h3>" +
      '<p class="mt-8">Screenshot, link e descrizione: solo su questo dispositivo.</p></div>' +
      '<span class="course-index">' + profile.projects.length + "</span>" +
      "</div>" +
      '<div class="row mt-16">' +
      '<a class="btn btn-primary btn-sm" href="#/portfolio">Apri portfolio</a>' +
      "</div></div>" +
      '<div class="section-title"><h2>Backup</h2><span>JSON</span></div>' +
      '<div class="card">' +
      '<p>Salva i progressi in un file o importali su un altro dispositivo. Le immagini del portfolio viaggiano dentro il JSON.</p>' +
      '<div class="backup-row mt-16">' +
      '<button type="button" class="btn btn-soft btn-sm" id="export-data">' + App.ui.icon("download", 15) + " Esporta</button>" +
      '<button type="button" class="btn btn-soft btn-sm" id="import-data">' + App.ui.icon("upload", 15) + " Importa</button>" +
      '<input type="file" id="import-file" accept="application/json,.json" class="sr-only" aria-hidden="true" tabindex="-1" />' +
      "</div>" +
      '<div class="danger-zone">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="reset-data" style="color:var(--coral)">Azzera tutti i dati</button>' +
      "</div></div>" +
      '<div class="notice mt-24"><b>LabClub Web</b> · v1.0 · Nessun account, nessun Firebase, nessuna classifica. ' +
      "Se il browser blocca localStorage, i progressi restano solo nella scheda: usa il backup.</div>";

    root.querySelector("#edit-profile").addEventListener("click", function () {
      editSheet(function () {
        App.router.refresh();
      });
    });

    root.querySelector("#export-data").addEventListener("click", function () {
      const date = new Date().toISOString().slice(0, 10);
      App.ui.download("labclub-backup-" + date + ".json", App.store.exportData(), "application/json;charset=utf-8");
      App.ui.toast("Backup esportato.", "good");
    });

    const fileInput = root.querySelector("#import-file");
    root.querySelector("#import-data").addEventListener("click", function () {
      fileInput.click();
    });
    fileInput.addEventListener("change", function () {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onerror = function () {
        App.ui.toast("Impossibile leggere il file.", "bad");
      };
      reader.onload = function () {
        const result = App.store.importData(String(reader.result || ""));
        if (!result.ok) {
          App.ui.toast(result.error, "bad");
          return;
        }
        App.ui.toast("Backup importato.", "good");
        App.router.refresh();
      };
      reader.readAsText(file);
    });

    root.querySelector("#reset-data").addEventListener("click", confirmReset);
  };
})(window.App = window.App || {});

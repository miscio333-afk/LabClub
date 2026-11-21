/* LabClub — portfolio locale */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  function safeUrl(url) {
    return /^https?:\/\//i.test(url || "") ? url : "";
  }

  function addSheet(onSaved) {
    let screenshot = "";
    App.ui.sheet({
      title: "Nuovo progetto",
      html:
        '<div class="field"><label for="pr-title">Titolo</label>' +
        '<input id="pr-title" maxlength="80" placeholder="Es. Landing Neon" /></div>' +
        '<div class="field"><label for="pr-desc">Descrizione</label>' +
        '<textarea id="pr-desc" maxlength="400" placeholder="Cosa hai costruito, con quali strumenti, cosa hai imparato."></textarea></div>' +
        '<div class="field"><label for="pr-url">Link (opzionale)</label>' +
        '<input id="pr-url" maxlength="300" inputmode="url" placeholder="https://..." /></div>' +
        '<div class="field"><label for="pr-tags">Tag (separati da virgola)</label>' +
        '<input id="pr-tags" maxlength="120" placeholder="HTML, CSS, Python" /></div>' +
        '<div class="field"><label for="pr-shot">Screenshot (opzionale)</label>' +
        '<input id="pr-shot" type="file" accept="image/*" />' +
        '<span class="hint">Viene ridotto e salvato nel browser. Max 8 progetti.</span>' +
        '<img id="pr-preview" alt="Anteprima screenshot" class="preview-frame hidden" style="height:170px;object-fit:cover" /></div>',
      actions: [
        { label: "Annulla", kind: "ghost" },
        {
          label: "Salva progetto",
          kind: "primary",
          onClick: function (sheetRoot) {
            const title = (sheetRoot.querySelector("#pr-title") || {}).value || "";
            const description = (sheetRoot.querySelector("#pr-desc") || {}).value || "";
            const url = (sheetRoot.querySelector("#pr-url") || {}).value || "";
            const tags = ((sheetRoot.querySelector("#pr-tags") || {}).value || "")
              .split(",")
              .map(function (tag) {
                return tag.trim();
              })
              .filter(Boolean);
            try {
              App.store.addProject({
                title: title,
                description: description,
                url: url,
                tags: tags,
                screenshot: screenshot
              });
            } catch (err) {
              App.ui.toast(err.message || "Impossibile salvare il progetto.", "bad");
              return false;
            }
            App.ui.toast("Progetto aggiunto al portfolio.", "good");
            if (onSaved) onSaved();
          }
        }
      ],
      onMount: function (sheetRoot) {
        const input = sheetRoot.querySelector("#pr-shot");
        const preview = sheetRoot.querySelector("#pr-preview");
        input.addEventListener("change", function () {
          const file = input.files && input.files[0];
          if (!file) return;
          preview.classList.remove("hidden");
          preview.removeAttribute("src");
          preview.alt = "Compressione in corso…";
          App.ui
            .compressImage(file, 720, 0.62)
            .then(function (dataUrl) {
              screenshot = dataUrl;
              preview.src = dataUrl;
              preview.alt = "Anteprima screenshot";
            })
            .catch(function (err) {
              preview.classList.add("hidden");
              App.ui.toast(err.message || "Immagine non valida.", "bad");
            });
        });
      }
    });
  }

  function confirmDelete(project, onDeleted) {
    App.ui.sheet({
      title: "Eliminare il progetto?",
      html:
        '<p class="muted" style="font-size:13px">"' +
        App.ui.esc(project.title) +
        '" verrà rimosso dal portfolio su questo dispositivo. L\'operazione non si può annullare.</p>',
      actions: [
        { label: "Annulla", kind: "ghost" },
        {
          label: "Elimina",
          kind: "danger",
          onClick: function () {
            App.store.deleteProject(project.id);
            App.ui.toast("Progetto eliminato.", "");
            onDeleted();
          }
        }
      ]
    });
  }

  views.portfolio = function (root) {
    const projects = App.store.state.profile.projects;

    const cards = projects
      .map(function (project) {
        const link = safeUrl(project.url);
        return (
          '<article class="card project-card mt-16">' +
          (project.screenshot
            ? '<img class="project-shot" src="' + project.screenshot + '" alt="Screenshot di ' + App.ui.esc(project.title) + '" />'
            : '<div class="project-shot placeholder" aria-hidden="true">🖼️</div>') +
          '<div class="project-body">' +
          '<h3 class="project-title">' + App.ui.esc(project.title) + "</h3>" +
          (project.description ? '<p class="project-desc">' + App.ui.esc(project.description) + "</p>" : "") +
          (project.tags && project.tags.length
            ? '<div class="project-tags mt-8">' +
              project.tags.map(function (tag) {
                return '<span class="chip">' + App.ui.esc(tag) + "</span>";
              }).join("") +
              "</div>"
            : "") +
          '<div class="project-foot">' +
          '<span class="mono" style="font-size:9px;color:var(--zinc)">' + App.ui.fmtDate(project.createdAt) + "</span>" +
          '<div class="row">' +
          (link
            ? '<a class="btn btn-ghost btn-sm" href="' + App.ui.esc(link) + '" target="_blank" rel="noopener noreferrer">Apri</a>'
            : "") +
          '<button type="button" class="icon-btn" data-delete="' + project.id + '" aria-label="Elimina ' + App.ui.esc(project.title) + '">' +
          App.ui.icon("trash", 16) +
          "</button></div></div></div></article>"
        );
      })
      .join("");

    root.innerHTML =
      '<a class="back" href="#/profilo">← Profilo</a>' +
      '<div class="page-head row between">' +
      "<div><h1>Portfolio</h1><p>Le tue build, solo su questo dispositivo. " + projects.length + "/8.</p></div>" +
      '<button type="button" class="icon-btn" id="add-project" aria-label="Aggiungi progetto">' + App.ui.icon("plus", 18) + "</button>" +
      "</div>" +
      (projects.length
        ? cards
        : '<div class="empty" style="margin-top:18px"><span class="empty-icon">🧪</span>' +
          "<h2 style=\"font-size:19px\">Nessun progetto</h2>" +
          "<p>Aggiungi uno screenshot e una descrizione di quello che hai costruito.</p>" +
          '<button type="button" class="btn btn-primary mt-16" id="add-project-empty">Aggiungi il primo progetto</button></div>') +
      '<div class="notice mt-24">Il portfolio è privato: niente like, commenti, approvazioni o upload. ' +
      "Per portarlo con te usa il backup JSON dal Profilo.</div>";

    function refresh() {
      App.router.refresh();
    }

    const add = root.querySelector("#add-project");
    if (add) add.addEventListener("click", function () {
      addSheet(refresh);
    });
    const addEmpty = root.querySelector("#add-project-empty");
    if (addEmpty) addEmpty.addEventListener("click", function () {
      addSheet(refresh);
    });

    root.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const project = projects.find(function (p) {
          return p.id === btn.dataset.delete;
        });
        if (!project) return;
        confirmDelete(project, refresh);
      });
    });
  };
})(window.App = window.App || {});

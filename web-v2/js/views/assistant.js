/* LabClub — Assistente AI vocale (Gemini Live API) */
(function (App) {
  "use strict";

  const views = (App.views = App.views || {});

  const QUICK_PROMPTS = [
    {
      label: "Spiegami i cicli for",
      prompt: "Spiegami in modo semplice come funziona un ciclo for in Python con un breve esempio."
    },
    {
      label: "Come funziona la RAM?",
      prompt: "Qual è la differenza pratica tra RAM, ROM e SSD nell'architettura di un computer?"
    },
    {
      label: "Quiz lampo sul binario",
      prompt: "Fammi una domanda veloce sul sistema binario e aspettami per la risposta!"
    }
  ];

  function statusMeta(st) {
    if (st.status === "connecting") {
      return { badge: "CONNESSIONE", badgeClass: "chip-purple", title: "Connessione al tutor vocale…", sub: "Avvio microfono e sessione Gemini Live." };
    }
    if (st.status === "listening") {
      return st.muted
        ? { badge: "MICROFONO MUTO", badgeClass: "chip-yellow", title: "Microfono in pausa", sub: "Riattiva il microfono o scrivi qui sotto." }
        : { badge: "IN ASCOLTO", badgeClass: "chip-green", title: "Parla pure, ti ascolto", sub: "Puoi interrompere il tutor in qualsiasi momento." };
    }
    if (st.status === "speaking") {
      return { badge: "STA PARLANDO", badgeClass: "chip-purple", title: "L'Assistente AI sta rispondendo", sub: "Parla per interrompere o ascolta la spiegazione." };
    }
    if (st.status === "error") {
      return { badge: "ERRORE", badgeClass: "chip-coral", title: "Connessione non riuscita", sub: st.errorMessage || "Controlla microfono o configurazione server." };
    }
    return {
      badge: "PRONTO",
      badgeClass: "",
      title: "Conversazione vocale in tempo reale",
      sub: "Chiedi aiuto su lezioni, codice Python, HTML o quiz a voce."
    };
  }

  views.assistant = function (root) {
    const ai = App.assistant;
    ai.checkStatus();

    root.innerHTML =
      '<div class="page-head">' +
      "<h1>Assistente AI</h1>" +
      "<p>Tutor vocale in tempo reale con Gemini Live: parla, interrompi e ricevi aiuto su lezioni e codice.</p>" +
      "</div>" +
      '<div id="ai-context-slot"></div>' +
      '<div class="ai-stage card" id="ai-stage">' +
      '<div class="row between">' +
      '<span class="kicker purple">GEMINI 3.8 LIVE</span>' +
      '<span class="chip" id="ai-status-chip">PRONTO</span>' +
      "</div>" +
      '<div class="ai-orb-wrap">' +
      '<button type="button" class="ai-orb-btn" id="ai-orb-btn" aria-label="Avvia o termina conversazione vocale">' +
      '<span class="ai-orb-ring" aria-hidden="true"></span>' +
      '<span class="ai-orb-core" aria-hidden="true">' + App.ui.icon("mic", 28) + "</span>" +
      "</button>" +
      '<h2 class="ai-stage-title" id="ai-stage-title"></h2>' +
      '<p class="ai-stage-sub" id="ai-stage-sub"></p>' +
      "</div>" +
      '<div class="ai-controls">' +
      '<button type="button" class="btn btn-primary" id="ai-toggle-btn"></button>' +
      '<button type="button" class="btn btn-soft hidden" id="ai-mute-btn"></button>' +
      "</div>" +
      '<div class="ai-voice-row">' +
      '<label for="ai-voice-select">Voce tutor</label>' +
      '<select id="ai-voice-select">' +
      ai.VOICES.map(function (v) {
        return '<option value="' + v.id + '">' + App.ui.esc(v.label + " · " + v.hint) + "</option>";
      }).join("") +
      "</select>" +
      "</div>" +
      "</div>" +
      '<div id="ai-error-slot"></div>' +
      '<div class="section-title"><h2>Conversazione</h2><button type="button" class="btn-link" id="ai-clear-btn">Pulisci</button></div>' +
      '<div class="ai-chat card" id="ai-chat" aria-live="polite"></div>' +
      '<form class="ai-composer mt-16" id="ai-composer">' +
      '<input id="ai-text-input" type="text" maxlength="1200" placeholder="Scrivi una domanda o incolla un dubbio…" autocomplete="off" />' +
      '<button type="submit" class="btn btn-primary btn-sm" id="ai-send-btn">Invia</button>' +
      "</form>" +
      '<div class="ai-prompts mt-16" id="ai-prompts">' +
      QUICK_PROMPTS.map(function (p, idx) {
        return (
          '<button type="button" class="btn btn-soft btn-sm" data-prompt="' + idx + '">' +
          App.ui.esc(p.label) +
          "</button>"
        );
      }).join("") +
      "</div>";

    const stageEl = root.querySelector("#ai-stage");
    const statusChipEl = root.querySelector("#ai-status-chip");
    const orbBtn = root.querySelector("#ai-orb-btn");
    const stageTitleEl = root.querySelector("#ai-stage-title");
    const stageSubEl = root.querySelector("#ai-stage-sub");
    const toggleBtn = root.querySelector("#ai-toggle-btn");
    const muteBtn = root.querySelector("#ai-mute-btn");
    const voiceSelect = root.querySelector("#ai-voice-select");
    const contextSlot = root.querySelector("#ai-context-slot");
    const errorSlot = root.querySelector("#ai-error-slot");
    const chatEl = root.querySelector("#ai-chat");
    const clearBtn = root.querySelector("#ai-clear-btn");
    const composer = root.querySelector("#ai-composer");
    const textInput = root.querySelector("#ai-text-input");

    voiceSelect.value = ai.state.voice;

    function paint(_state, reason) {
      const st = ai.state;
      stageEl.style.setProperty("--mic-level", String(st.inputLevel || 0));
      if (reason === "level") return;

      const meta = statusMeta(st);
      const active = st.status === "connecting" || st.status === "listening" || st.status === "speaking";

      stageEl.dataset.state = st.status;
      statusChipEl.className = "chip " + meta.badgeClass;
      statusChipEl.textContent = meta.badge;
      stageTitleEl.textContent = meta.title;
      stageSubEl.textContent = meta.sub;

      orbBtn.classList.toggle("is-active", active);
      orbBtn.classList.toggle("is-speaking", st.status === "speaking");
      orbBtn.classList.toggle("is-muted", st.muted && active);

      if (active) {
        toggleBtn.className = "btn btn-danger";
        toggleBtn.innerHTML = App.ui.icon("x", 16) + " Termina";
        muteBtn.classList.remove("hidden");
        muteBtn.innerHTML = st.muted
          ? App.ui.icon("mic", 16) + " Riattiva mic"
          : App.ui.icon("micOff", 16) + " Silenzia";
      } else {
        toggleBtn.className = "btn btn-primary";
        toggleBtn.innerHTML = App.ui.icon("mic", 16) + " Avvia conversazione";
        muteBtn.classList.add("hidden");
      }

      voiceSelect.disabled = active;

      if (st.context && st.context.lessonTitle) {
        contextSlot.innerHTML =
          '<div class="ai-context-banner mb-16">' +
          '<div style="min-width:0">' +
          '<span class="kicker">CONTESTO ATTIVO</span>' +
          '<div class="ai-context-title">' + App.ui.esc(st.context.lessonTitle) + "</div>" +
          (st.context.code
            ? '<div class="ai-context-meta">Codice dell\'editor pronto per essere condiviso</div>'
            : "") +
          "</div>" +
          '<button type="button" class="btn btn-ghost btn-sm" id="ai-clear-ctx">Rimuovi</button>' +
          "</div>";
        const clearCtxBtn = contextSlot.querySelector("#ai-clear-ctx");
        if (clearCtxBtn) {
          clearCtxBtn.addEventListener("click", function () {
            ai.setContext(null);
          });
        }
      } else {
        contextSlot.innerHTML = "";
      }

      if (st.status === "error" && st.errorMessage) {
        errorSlot.innerHTML =
          '<div class="explain bad mt-16"><b>Attenzione. </b>' +
          App.ui.esc(st.errorMessage) +
          "</div>";
      } else if (st.configured === false) {
        errorSlot.innerHTML =
          '<div class="notice mt-16">Configurazione Gemini non rilevata sul server. Verifica la chiave in <b>Settings &gt; Secrets</b>.</div>';
      } else {
        errorSlot.innerHTML = "";
      }

      if (!st.messages.length) {
        chatEl.innerHTML =
          '<div class="ai-chat-empty">' +
          "<p>Premi <b>Avvia conversazione</b> per parlare a voce, oppure scegli uno spunto qui sotto.</p>" +
          "</div>";
      } else {
        chatEl.innerHTML = st.messages
          .map(function (m) {
            if (m.role === "system") {
              return '<div class="ai-msg-system">' + App.ui.esc(m.text) + "</div>";
            }
            return (
              '<div class="ai-msg ai-msg-' + m.role + '">' +
              '<span class="ai-msg-role">' + (m.role === "user" ? "Tu" : "Assistente AI") + "</span>" +
              '<div class="ai-msg-bubble">' + App.ui.esc(m.text) + "</div>" +
              "</div>"
            );
          })
          .join("");
        chatEl.scrollTop = chatEl.scrollHeight;
      }

      clearBtn.classList.toggle("hidden", !st.messages.length);
    }

    function toggleSession() {
      const st = ai.state.status;
      if (st === "connecting" || st === "listening" || st === "speaking") {
        ai.stop();
      } else {
        ai.start();
      }
    }

    orbBtn.addEventListener("click", toggleSession);
    toggleBtn.addEventListener("click", toggleSession);
    muteBtn.addEventListener("click", function () {
      ai.toggleMute();
    });
    voiceSelect.addEventListener("change", function () {
      ai.setVoice(voiceSelect.value);
    });
    clearBtn.addEventListener("click", function () {
      ai.clearMessages();
    });

    composer.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = textInput.value.trim();
      if (!value) return;
      textInput.value = "";
      ai.sendText(value);
    });

    root.querySelectorAll("[data-prompt]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const item = QUICK_PROMPTS[Number(btn.dataset.prompt)];
        if (!item) return;
        ai.sendText(item.prompt);
      });
    });

    const unsub = ai.subscribe(paint);
    paint();

    return function cleanup() {
      unsub();
      ai.stop();
    };
  };
})(window.App = window.App || {});

/* LabClub — motore audio & WebSocket per Gemini Live API (16kHz in / 24kHz out) */
(function (App) {
  "use strict";

  const INPUT_RATE = 16000;
  const OUTPUT_RATE = 24000;
  const VOICE_KEY = "labclub.ai.voice";
  const VOICES = [
    { id: "Zephyr", label: "Zephyr", hint: "Bilanciata" },
    { id: "Kore", label: "Kore", hint: "Chiara" },
    { id: "Puck", label: "Puck", hint: "Energica" },
    { id: "Fenrir", label: "Fenrir", hint: "Decisa" },
    { id: "Charon", label: "Charon", hint: "Calma" }
  ];

  let savedVoice = "Zephyr";
  try {
    const v = localStorage.getItem(VOICE_KEY);
    if (v && VOICES.some((item) => item.id === v)) savedVoice = v;
  } catch (_) {
    /* ignore */
  }

  const state = {
    status: "idle", // idle | connecting | listening | speaking | error
    muted: false,
    voice: savedVoice,
    configured: null,
    errorMessage: "",
    inputLevel: 0,
    context: null, // { lessonId, lessonTitle, courseTitle, topicTag, code }
    messages: [] // { id, role: "user"|"assistant"|"system", text, open }
  };

  const listeners = new Set();
  let ws = null;
  let mediaStream = null;
  let inputAudioCtx = null;
  let outputAudioCtx = null;
  let sourceNode = null;
  let processorNode = null;
  let nextStartTime = 0;
  const activeSources = new Set();
  let pendingTextAfterReady = null;
  let msgSeq = 0;

  function emit(reason) {
    const why = reason || "state";
    listeners.forEach((fn) => {
      try {
        fn(state, why);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function () {
      listeners.delete(fn);
    };
  }

  function nextId() {
    msgSeq += 1;
    return "ai_m_" + msgSeq;
  }

  function closeOpenMessages(role) {
    for (let i = state.messages.length - 1; i >= 0; i--) {
      const m = state.messages[i];
      if (!role || m.role === role) m.open = false;
    }
  }

  function appendTranscript(role, chunk) {
    if (!chunk) return;
    const other = role === "user" ? "assistant" : "user";
    closeOpenMessages(other);

    const last = state.messages[state.messages.length - 1];
    if (last && last.role === role && last.open) {
      last.text += chunk;
    } else {
      state.messages.push({
        id: nextId(),
        role: role,
        text: chunk,
        open: true
      });
      if (state.messages.length > 60) {
        state.messages.shift();
      }
    }
    emit();
  }

  function addSystemNote(text) {
    closeOpenMessages();
    state.messages.push({
      id: nextId(),
      role: "system",
      text: text,
      open: false
    });
    emit();
  }

  function downsampleFloat32(buffer, sourceRate, targetRate) {
    if (!sourceRate || sourceRate === targetRate) return buffer;
    if (sourceRate < targetRate) return buffer;
    const ratio = sourceRate / targetRate;
    const newLen = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLen);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count += 1;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult += 1;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  function float32ToBase64Pcm16(floatSamples) {
    const int16 = new Int16Array(floatSamples.length);
    for (let i = 0; i < floatSamples.length; i++) {
      const s = Math.max(-1, Math.min(1, floatSamples[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function base64Pcm16ToFloat32(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  }

  function stopPlayback() {
    activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (_) {
        /* ignore */
      }
    });
    activeSources.clear();
    nextStartTime = 0;
  }

  function playAudioChunk(base64) {
    if (!outputAudioCtx) return;
    if (outputAudioCtx.state === "suspended") {
      outputAudioCtx.resume().catch(function () {});
    }

    const samples = base64Pcm16ToFloat32(base64);
    if (!samples.length) return;

    const audioBuffer = outputAudioCtx.createBuffer(1, samples.length, OUTPUT_RATE);
    audioBuffer.copyToChannel(samples, 0);

    const source = outputAudioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioCtx.destination);

    const now = outputAudioCtx.currentTime;
    if (nextStartTime < now) nextStartTime = now;

    activeSources.add(source);
    if (state.status !== "speaking" && state.status !== "idle") {
      state.status = "speaking";
      emit();
    }

    source.onended = function () {
      activeSources.delete(source);
      if (activeSources.size === 0 && (state.status === "speaking" || state.status === "listening")) {
        state.status = "listening";
        emit();
      }
    };

    source.start(nextStartTime);
    nextStartTime += audioBuffer.duration;
  }

  function teardownAudioAndSocket() {
    stopPlayback();

    if (processorNode) {
      try {
        processorNode.onaudioprocess = null;
        processorNode.disconnect();
      } catch (_) {
        /* ignore */
      }
      processorNode = null;
    }
    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (_) {
        /* ignore */
      }
      sourceNode = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {
          /* ignore */
        }
      });
      mediaStream = null;
    }
    if (inputAudioCtx) {
      try {
        inputAudioCtx.close();
      } catch (_) {
        /* ignore */
      }
      inputAudioCtx = null;
    }
    if (outputAudioCtx) {
      try {
        outputAudioCtx.close();
      } catch (_) {
        /* ignore */
      }
      outputAudioCtx = null;
    }
    if (ws) {
      try {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch (_) {
        /* ignore */
      }
      ws = null;
    }
    state.inputLevel = 0;
  }

  async function checkStatus() {
    try {
      const res = await fetch("/api/ai/status", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      state.configured = Boolean(data && data.configured);
      emit();
      return data;
    } catch (_) {
      return null;
    }
  }

  function buildWsUrl() {
    const proto = location.protocol === "https:" ? "wss://" : "ws://";
    const params = new URLSearchParams();
    params.set("voice", state.voice || "Zephyr");

    const profile = App.store && App.store.state && App.store.state.profile;
    if (profile && profile.name) params.set("userName", profile.name);

    const ctx = state.context;
    if (ctx) {
      if (ctx.courseTitle) params.set("courseTitle", ctx.courseTitle);
      if (ctx.lessonTitle) params.set("lessonTitle", ctx.lessonTitle);
      if (ctx.topicTag) params.set("topicTag", ctx.topicTag);
    }

    return proto + location.host + "/ws/live?" + params.toString();
  }

  async function start(options) {
    const opts = options || {};
    if (state.status === "connecting" || state.status === "listening" || state.status === "speaking") {
      return true;
    }

    if (typeof opts.initialText === "string" && opts.initialText.trim()) {
      pendingTextAfterReady = opts.initialText.trim();
    }

    state.status = "connecting";
    state.errorMessage = "";
    state.muted = Boolean(opts.muted);
    emit();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      state.status = "error";
      state.errorMessage = "Il browser non supporta l'accesso al microfono.";
      emit();
      return false;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      state.status = "error";
      state.errorMessage = "Web Audio API non supportata da questo browser.";
      emit();
      return false;
    }

    function createCtx(targetRate) {
      try {
        return new AudioCtx({ sampleRate: targetRate });
      } catch (_) {
        return new AudioCtx();
      }
    }

    try {
      inputAudioCtx = createCtx(INPUT_RATE);
      outputAudioCtx = createCtx(OUTPUT_RATE);
      inputAudioCtx.resume().catch(function () {});
      outputAudioCtx.resume().catch(function () {});
    } catch (err) {
      teardownAudioAndSocket();
      state.status = "error";
      state.errorMessage = "Impossibile avviare il contesto audio del browser.";
      emit();
      return false;
    }

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    } catch (err) {
      teardownAudioAndSocket();
      state.status = "error";
      state.errorMessage =
        err && err.name === "NotAllowedError"
          ? "Permesso microfono negato. Abilitalo dal browser per parlare con l'assistente."
          : "Impossibile accedere al microfono. Controlla il dispositivo audio.";
      emit();
      return false;
    }

    try {
      if (inputAudioCtx.state !== "running") await inputAudioCtx.resume();
      if (outputAudioCtx.state !== "running") await outputAudioCtx.resume();
    } catch (err) {
      teardownAudioAndSocket();
      state.status = "error";
      state.errorMessage = "Impossibile avviare il contesto audio del browser.";
      emit();
      return false;
    }

    ws = new WebSocket(buildWsUrl());

    ws.onmessage = function (event) {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch (_) {
        return;
      }
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "ready") {
        state.status = "listening";
        state.errorMessage = "";
        addSystemNote("Connesso in tempo reale (" + (msg.voice || state.voice) + "). Parla pure.");
        if (pendingTextAfterReady) {
          const textToSend = pendingTextAfterReady;
          pendingTextAfterReady = null;
          sendText(textToSend);
        } else if (state.context && state.context.code && !state.context.codeSent) {
          state.context.codeSent = true;
          sendText(
            "Ecco il codice su cui sto lavorando ora" +
              (state.context.lessonTitle ? ' nella lezione "' + state.context.lessonTitle + '"' : "") +
              ":\n\n" +
              state.context.code
          );
        }
        return;
      }

      if (msg.type === "audio" && msg.data) {
        playAudioChunk(msg.data);
        return;
      }

      if (msg.type === "inputTranscript" && msg.text) {
        appendTranscript("user", msg.text);
        return;
      }

      if (msg.type === "outputTranscript" && msg.text) {
        appendTranscript("assistant", msg.text);
        return;
      }

      if (msg.type === "interrupted") {
        stopPlayback();
        closeOpenMessages();
        if (state.status === "speaking") {
          state.status = "listening";
          emit();
        }
        return;
      }

      if (msg.type === "generationComplete" || msg.type === "turnComplete") {
        closeOpenMessages();
        if (msg.type === "turnComplete" && activeSources.size === 0 && state.status === "speaking") {
          state.status = "listening";
        }
        emit();
        return;
      }

      if (msg.type === "error") {
        const errMsg = msg.message || "Errore durante la sessione Live.";
        teardownAudioAndSocket();
        state.status = "error";
        state.errorMessage = errMsg;
        emit();
        return;
      }

      if (msg.type === "closed") {
        if (state.status !== "idle" && state.status !== "error") {
          teardownAudioAndSocket();
          state.status = "idle";
          closeOpenMessages();
          addSystemNote("Sessione terminata.");
        }
      }
    };

    ws.onerror = function () {
      if (state.status === "idle") return;
      teardownAudioAndSocket();
      state.status = "error";
      state.errorMessage = "Connessione WebSocket interrotta con il server.";
      emit();
    };

    ws.onclose = function () {
      if (state.status !== "idle" && state.status !== "error") {
        teardownAudioAndSocket();
        state.status = "idle";
        closeOpenMessages();
        emit();
      }
    };

    sourceNode = inputAudioCtx.createMediaStreamSource(mediaStream);
    processorNode = inputAudioCtx.createScriptProcessor(2048, 1, 1);

    sourceNode.connect(processorNode);
    processorNode.connect(inputAudioCtx.destination);

    let lastLevelEmit = 0;
    processorNode.onaudioprocess = function (e) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (state.status !== "listening" && state.status !== "speaking") return;

      const rawSamples = e.inputBuffer.getChannelData(0);
      if (state.muted) {
        if (state.inputLevel !== 0) {
          state.inputLevel = 0;
          emit("level");
        }
        return;
      }

      let sum = 0;
      for (let i = 0; i < rawSamples.length; i += 4) {
        sum += rawSamples[i] * rawSamples[i];
      }
      const rms = Math.sqrt(sum / Math.max(1, Math.floor(rawSamples.length / 4)));
      const now = Date.now();
      if (now - lastLevelEmit > 80) {
        lastLevelEmit = now;
        state.inputLevel = Math.min(1, rms * 6);
        emit("level");
      }

      const pcmFloat = downsampleFloat32(rawSamples, inputAudioCtx.sampleRate, INPUT_RATE);
      const base64 = float32ToBase64Pcm16(pcmFloat);
      ws.send(JSON.stringify({ type: "audio", data: base64 }));
    };

    return true;
  }

  function stop() {
    const wasActive = state.status === "connecting" || state.status === "listening" || state.status === "speaking";
    pendingTextAfterReady = null;
    teardownAudioAndSocket();
    closeOpenMessages();
    state.status = "idle";
    if (wasActive) {
      addSystemNote("Conversazione terminata.");
    } else {
      emit();
    }
  }

  function toggleMute() {
    state.muted = !state.muted;
    if (state.muted) {
      state.inputLevel = 0;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "audioStreamEnd" }));
        } catch (_) {
          /* ignore */
        }
      }
    }
    emit();
    return state.muted;
  }

  function setVoice(voiceId) {
    if (!VOICES.some((v) => v.id === voiceId)) return;
    state.voice = voiceId;
    try {
      localStorage.setItem(VOICE_KEY, voiceId);
    } catch (_) {
      /* ignore */
    }
    emit();
  }

  function setContext(ctx) {
    if (!ctx) {
      state.context = null;
    } else {
      state.context = {
        lessonId: ctx.lessonId || "",
        lessonTitle: ctx.lessonTitle || "",
        courseTitle: ctx.courseTitle || "",
        topicTag: ctx.topicTag || "",
        code: ctx.code || "",
        codeSent: false
      };
    }
    emit();
  }

  function clearMessages() {
    state.messages = [];
    emit();
  }

  async function sendText(text) {
    const clean = String(text || "").trim();
    if (!clean) return false;

    if (!ws || ws.readyState !== WebSocket.OPEN || (state.status !== "listening" && state.status !== "speaking")) {
      return start({ initialText: clean });
    }

    closeOpenMessages();
    state.messages.push({
      id: nextId(),
      role: "user",
      text: clean,
      open: false
    });
    emit();

    ws.send(JSON.stringify({ type: "text", text: clean }));
    return true;
  }

  App.assistant = {
    VOICES: VOICES,
    get state() {
      return state;
    },
    subscribe: subscribe,
    checkStatus: checkStatus,
    start: start,
    stop: stop,
    toggleMute: toggleMute,
    setVoice: setVoice,
    setContext: setContext,
    clearMessages: clearMessages,
    sendText: sendText
  };
})(window.App = window.App || {});

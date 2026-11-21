/* Widget — schema di Von Neumann e ciclo macchina. */
(function (App) {
  "use strict";

  const PARTS = {
    cpu: {
      title: "CPU — Central Processing Unit",
      text: "Il nucleo operativo. La Control Unit legge e decodifica le istruzioni; la ALU esegue i calcoli. Coordina anche memoria e periferiche.",
      analogy: "Sei tu alla scrivania: il cervello legge la ricetta (CU), le mani usano la calcolatrice (ALU)."
    },
    ram: {
      title: "RAM — Memoria centrale",
      text: "Memoria veloce e volatile. Contiene sia le istruzioni del programma sia i dati su cui lavorare.",
      analogy: "Il piano di lavoro: ricetta e ingredienti sono a portata di mano, ma a fine giornata il piano si svuota."
    },
    input: {
      title: "Periferiche di input",
      text: "Tastiera, mouse, touchscreen e microfono portano dati dentro il sistema.",
      analogy: "La lista della spesa che arriva da fuori: nuove informazioni da elaborare."
    },
    output: {
      title: "Periferiche di output",
      text: "Monitor, casse e stampante mostrano il risultato dell'elaborazione.",
      analogy: "Il piatto servito: il risultato che puoi vedere e usare."
    },
    bus: {
      title: "Bus",
      text: "Le autostrade di dati che collegano CPU, RAM e periferiche. Sui bus passano indirizzi, istruzioni e valori.",
      analogy: "I corridoi della cucina: collegano scrivania, dispensa e fornelli."
    }
  };

  const STEPS = [
    {
      phase: "PRONTO",
      pc: "01",
      ir: "—",
      alu: "—",
      text: "Premi «Avanza fase» per avviare il ciclo macchina."
    },
    {
      phase: "FETCH",
      pc: "01",
      ir: "LOAD 2",
      alu: "—",
      text: "La CU preleva dalla RAM l'istruzione all'indirizzo indicato dal PC."
    },
    {
      phase: "DECODE",
      pc: "01",
      ir: "ADD 2, 3",
      alu: "—",
      text: "La CU decodifica l'istruzione: bisogna sommare 2 e 3."
    },
    {
      phase: "EXECUTE",
      pc: "02",
      ir: "ADD 2, 3",
      alu: "5",
      text: "L'ALU calcola 5. Il PC avanza: la prossima istruzione è pronta."
    }
  ];

  App.widgets.register("von-neumann", function (mount) {
    mount.innerHTML =
      '<div class="wn-schema" role="group" aria-label="Schema di Von Neumann">' +
      '<button type="button" class="wn-part wn-cpu" data-part="cpu"><b>CPU</b><span>CU + ALU</span></button>' +
      '<button type="button" class="wn-part wn-ram" data-part="ram"><b>RAM</b><span>dati + istruzioni</span></button>' +
      '<button type="button" class="wn-part wn-input" data-part="input"><b>INPUT</b><span>tastiera, mouse</span></button>' +
      '<button type="button" class="wn-part wn-output" data-part="output"><b>OUTPUT</b><span>monitor, audio</span></button>' +
      '<button type="button" class="wn-part wn-bus" data-part="bus"><b>BUS</b><span>collega tutto</span></button>' +
      "</div>" +
      '<div class="w-panel wn-info" id="wn-info" aria-live="polite">' +
      "<b>Scegli un componente</b>" +
      "<p>Clicca CPU, RAM, input, output o bus per scoprire il suo ruolo.</p>" +
      "</div>" +
      '<div class="w-panel mt-12">' +
      '<div class="w-head"><span class="kicker">CICLO MACCHINA</span><span class="w-tag" id="wn-phase">PRONTO</span></div>' +
      '<div class="wn-regs">' +
      '<div><span>PC</span><b id="wn-pc">01</b></div>' +
      '<div><span>IR</span><b id="wn-ir">—</b></div>' +
      '<div><span>ALU</span><b id="wn-alu">—</b></div>' +
      "</div>" +
      '<p class="w-text" id="wn-step">Premi «Avanza fase» per avviare il ciclo macchina.</p>' +
      '<div class="w-actions">' +
      '<button type="button" class="w-btn w-btn-primary" data-next>Avanza fase</button>' +
      '<button type="button" class="w-btn" data-reset>Reset</button>' +
      "</div></div>";

    const info = mount.querySelector("#wn-info");
    const phaseEl = mount.querySelector("#wn-phase");
    const pcEl = mount.querySelector("#wn-pc");
    const irEl = mount.querySelector("#wn-ir");
    const aluEl = mount.querySelector("#wn-alu");
    const stepEl = mount.querySelector("#wn-step");
    const nextBtn = mount.querySelector("[data-next]");
    let step = 0;

    function paint() {
      const data = STEPS[step];
      phaseEl.textContent = data.phase;
      phaseEl.className = "w-tag" + (step === 0 ? "" : step === 3 ? " ok" : " live");
      pcEl.textContent = data.pc;
      irEl.textContent = data.ir;
      aluEl.textContent = data.alu;
      stepEl.textContent = data.text;
      nextBtn.textContent = step === STEPS.length - 1 ? "Ricomincia" : "Avanza fase";
    }

    mount.querySelectorAll("[data-part]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const part = PARTS[btn.dataset.part];
        mount.querySelectorAll("[data-part]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        info.innerHTML =
          "<b>" + part.title + "</b>" +
          "<p>" + part.text + "</p>" +
          '<p class="wn-analogy"><em>Analogia:</em> ' + part.analogy + "</p>";
      });
    });

    nextBtn.addEventListener("click", function () {
      step = step === STEPS.length - 1 ? 0 : step + 1;
      paint();
    });

    mount.querySelector("[data-reset]").addEventListener("click", function () {
      step = 0;
      paint();
    });

    paint();
    return function () {};
  });
})(window.App = window.App || {});

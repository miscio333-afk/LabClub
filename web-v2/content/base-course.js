/* LabClub — Corso Base: 12 lezioni native.
 * Contenuti adattati dalle lezioni interattive del Prof. Michel Formento.
 * Nessuna dipendenza esterna: testi, quiz e codice vivono qui.
 */
(function (App) {
  "use strict";

  App.content = App.content || {};

  const q = (question, options, correctIndex, explanation) => ({
    question: question,
    options: options,
    correctIndex: correctIndex,
    explanation: explanation
  });

  const esc = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const code = (source) => '<pre class="code"><code>' + esc(source) + "</code></pre>";

  const lessons = [];

  /* ============================================================
   * 01 · Von Neumann
   * ============================================================ */
  lessons.push({
    id: "lesson_base_01",
    orderIndex: 1,
    title: "L'architettura di Von Neumann",
    durationMinutes: 13,
    topicTag: "Hardware",
    description:
      "CPU, RAM, bus e periferiche: come lavora un computer quando apri un'app e perché istruzioni e dati vivono nella stessa memoria.",
    chapters: [
      {
        title: "Come fa il PC a ricordarsi cosa fare?",
        intro: {
          src: "assets/video/aria-001.mp4",
          poster: "assets/img/lessons/aria-001-poster.webp",
          duration: 27,
          speaker: "Aria"
        },
        html:
          "<p>Apri il browser, avvii un videogioco e ascolti musica: tre programmi insieme, senza che il processore si confonda.</p>" +
          "<p>La risposta ha quasi 80 anni e porta il nome di <strong><mark class='kw'>John von Neumann</mark></strong>. La sua idea è ancora oggi la base di quasi ogni computer: <strong>istruzioni e dati stanno nella <mark class='kw'>stessa memoria</mark></strong>, e la CPU li legge uno dopo l'altro.</p>" +
          '<div class="callout">Un computer non “capisce” il significato di un programma: esegue istruzioni semplici, milioni di volte al secondo. La magia sta nell’ordine.</div>'
      },
      {
        title: "Lo schema: CPU, RAM, bus e periferiche",
        html:
          "<p>I componenti principali sono cinque:</p>" +
          '<ul class="bullets">' +
          "<li><strong>CPU</strong> — il cervello operativo. Dentro ha la <strong>CU</strong> (Control Unit), che coordina, e la <strong>ALU</strong>, che calcola.</li>" +
          "<li><strong>RAM</strong> — la memoria centrale: veloce e volatile. Contiene sia i dati sia le istruzioni del programma in esecuzione.</li>" +
          "<li><strong>Input</strong> — tastiera, mouse, touchscreen: portano dentro i dati.</li>" +
          "<li><strong>Output</strong> — monitor, audio, stampante: mostrano il risultato.</li>" +
          "<li><strong>Bus</strong> — le autostrade che collegano CPU, RAM e periferiche.</li>" +
          "</ul>" +
          "<p>La CPU lavora in un ciclo continuo: <strong>fetch</strong> (preleva l'istruzione dalla RAM), <strong>decode</strong> (la decodifica), <strong>execute</strong> (la esegue). Poi riparte dalla successiva.</p>" +
          '<div class="callout warn"><strong>RAM ≠ SSD.</strong> La RAM è velocissima ma perde tutto allo spegnimento; l’SSD conserva i file, ma è più lento da leggere.</div>'
      }
    ],
    lab: {
      title: "Esplora lo schema e il ciclo macchina",
      description: "Clicca un componente per leggerne il ruolo. Poi avanza una fase alla volta e osserva PC, IR e ALU.",
      widget: "von-neumann"
    },
    keyPoints: [
      "Quasi tutti i computer moderni uniscono CPU (CU + ALU), RAM e periferiche I/O collegate dai bus.",
      "Nella RAM convivono dati e istruzioni: è il principio del programma memorizzato.",
      "La CPU ripete fetch → decode → execute miliardi di volte al secondo."
    ],
    codePrompt: "Simula il ciclo macchina con una lista di fasi e un ciclo for. Stampa ogni fase preceduta da “Ciclo:”.",
    codeStarter: 'passi = ["fetch", "decode", "execute"]\nfor passo in passi:\n    print("Ciclo:", passo)',
    language: "PYTHON",
    expectedKeyword: "execute",
    quizQuestions: [
      q(
        "Qual è la principale differenza tra RAM e memoria di massa (SSD)?",
        [
          "La RAM salva solo file permanenti, l'SSD esegue i calcoli.",
          "La RAM è velocissima ma volatile; l'SSD è più lento ma permanente.",
          "Non c'è differenza: entrambe perdono i dati allo spegnimento."
        ],
        1,
        "La RAM contiene i dati in uso e si svuota allo spegnimento. L'SSD conserva i file nel tempo."
      ),
      q(
        "Nell'analogia della scrivania, a cosa corrisponde la RAM?",
        [
          "Alla dispensa chiusa in cantina.",
          "Al fornello che cuoce i cibi.",
          "Al piano di lavoro con ricetta e ingredienti a portata di mano."
        ],
        2,
        "La RAM è lo spazio di lavoro immediato: la CPU tiene lì le istruzioni e i dati che sta usando."
      )
    ]
  });

  /* ============================================================
   * 02 · Binario
   * ============================================================ */
  lessons.push({
    id: "lesson_base_02",
    orderIndex: 2,
    title: "La rappresentazione binaria",
    durationMinutes: 14,
    topicTag: "Binario",
    description:
      "Bit, byte e ASCII: come due soli stati elettrici diventano numeri, lettere, foto e suoni.",
    chapters: [
      {
        title: "Come fa un computer a capire solo due numeri?",
        html:
          "<p>Un selfie, una canzone, un messaggio: per te sono immagini, suoni e parole. Dentro i circuiti passano solo <strong>impulsi elettrici</strong>.</p>" +
          "<p>Un circuito conosce due stati: corrente passa (<strong>1</strong>) oppure non passa (<strong>0</strong>). Tutto il resto è una combinazione di questi due valori.</p>" +
          '<div class="callout">Un singolo 0 o 1 si chiama <strong>bit</strong>. Otto bit formano un <strong>byte</strong>.</div>'
      },
      {
        title: "Dal bit al byte: pesi e combinazioni",
        intro: {
          src: "assets/video/aria-002.mp4",
          poster: "assets/img/lessons/aria-002-poster.webp",
          duration: 29,
          speaker: "Aria"
        },
        html:
          "<p>In un byte ogni posizione ha un peso che raddoppia da destra a sinistra: <strong>128, 64, 32, 16, 8, 4, 2, 1</strong>. Si sommano i pesi delle posizioni accese.</p>" +
          code("0 0 0 1 0 1 0 1\n16 + 4 + 1 = 21") +
          "<p>Con 8 bit hai <strong><mark class='kw'>2⁸ = 256</mark></strong> combinazioni, cioè i numeri da 0 a 255. Bastano per la tabella <mark class='kw'>ASCII</mark>: la lettera <strong>A</strong> è 65, cioè <code>01000001</code>.</p>" +
          "<p>Per convertire un numero decimale in binario si divide per 2 e si leggono i resti dal basso verso l'alto.</p>" +
          '<div class="callout warn">Il valore massimo di un byte senza segno è <strong><mark class="kw">255</mark></strong>, non 256: 256 è il numero di combinazioni, da 0 a 255.</div>'
      }
    ],
    lab: {
      title: "Il quadro a 8 lampadine",
      description: "Accendi e spegni i bit, leggi il valore decimale, il carattere ASCII e prova le conversioni passo-passo.",
      widget: "binary"
    },
    keyPoints: [
      "Il bit ha due valori: 0 e 1. Il byte è un gruppo di 8 bit.",
      "Un byte rappresenta 256 combinazioni (0–255) e usa pesi posizionali 128…1.",
      "ASCII associa numeri e caratteri: A = 65 = 01000001."
    ],
    codePrompt: "Converti 13 in binario usando % e // dentro un while. Stampa il risultato.",
    codeStarter:
      'n = 13\nbits = ""\nwhile n > 0:\n    bits = str(n % 2) + bits\n    n = n // 2\nprint("13 in binario:", bits)',
    language: "PYTHON",
    expectedKeyword: "1101",
    quizQuestions: [
      q(
        "Quante combinazioni diverse può rappresentare un byte?",
        ["8", "16", "256"],
        2,
        "Con 8 bit hai 2⁸ = 256 combinazioni, da 0 a 255."
      ),
      q(
        "A quale numero decimale corrisponde 00010101?",
        ["21", "101", "19"],
        0,
        "Sono accesi i pesi 16, 4 e 1: 16 + 4 + 1 = 21."
      )
    ]
  });

  /* ============================================================
   * 03 · Compilatori vs interpreti
   * ============================================================ */
  lessons.push({
    id: "lesson_base_03",
    orderIndex: 3,
    title: "Compilatori vs interpreti",
    durationMinutes: 13,
    topicTag: "Compilatori",
    description:
      "Chi traduce il codice per la CPU? Due strategie diverse, due modi diversi di incontrare un bug.",
    chapters: [
      {
        title: "Due lingue completamente diverse",
        html:
          "<p>Noi scriviamo istruzioni in linguaggi ad alto livello, con parole come <code>print</code>, <code>if</code> e <code>while</code>. La CPU capisce solo zeri e uno.</p>" +
          code('x = 10 + 5\nprint("Risultato:", x)') +
          "<p>Serve un traduttore. Ci sono due famiglie: il <strong>compilatore</strong> e l'<strong>interprete</strong>.</p>"
      },
      {
        title: "Tradurre un libro intero o parlare dal vivo",
        html:
          "<p>Il <strong>compilatore</strong> è come un traduttore che prende tutto il romanzo e stampa una nuova edizione: traduce l'intero programma in un file eseguibile prima di avviarlo. Segnala gli errori di sintassi in blocco.</p>" +
          "<p>L'<strong>interprete</strong> è come un interprete simultaneo: legge una riga, la traduce e la esegue, poi passa alla successiva. Non produce un eseguibile separato.</p>" +
          '<table class="compare"><thead><tr><th></th><th>Compilatore</th><th>Interprete</th></tr></thead><tbody>' +
          "<tr><td>Quando traduce</td><td>Tutto prima</td><td>Riga per riga</td></tr>" +
          "<tr><td>File prodotto</td><td>Eseguibile (.exe)</td><td>Nessuno</td></tr>" +
          "<tr><td>Velocità</td><td>Alta</td><td>Più lenta</td></tr>" +
          "<tr><td>Portabilità</td><td>Legata al sistema</td><td>Multipiattaforma</td></tr>" +
          "</tbody></table>" +
          '<div class="callout">Python è interpretato: se la riga 3 ha un errore di sintassi, la riga 1 può essere già stata eseguita. Un compilatore C++ bloccherebbe tutto prima.</div>'
      }
    ],
    lab: {
      title: "Bug alla riga 3: compila o interpreta",
      description: "Confronta le due modalità con lo stesso script. Osserva quando compare l'errore e cosa viene stampato.",
      widget: "compilers"
    },
    keyPoints: [
      "Il codice sorgente va sempre tradotto in istruzioni binarie per la CPU.",
      "Il compilatore traduce tutto prima e genera un eseguibile; l'interprete traduce ed esegue riga per riga.",
      "Compilato è più veloce ma legato al sistema; interpretato è più portabile e immediato da provare."
    ],
    codePrompt: "Simula un interprete: scorri tre righe e fermati con un errore di sintassi alla riga 3.",
    codeStarter:
      'modalita = "interprete"\nrighe = ["Ciao", "Mondo", "print("]\nfor riga in righe:\n    if riga == "print(":\n        print("Errore di sintassi alla riga 3")\n        break\n    print(riga)',
    language: "PYTHON",
    expectedKeyword: "Errore di sintassi",
    quizQuestions: [
      q(
        "Qual è la principale differenza tra compilatore e interprete?",
        [
          "Il compilatore esegue una riga alla volta; l'interprete crea un .exe.",
          "Il compilatore traduce tutto prima in un eseguibile; l'interprete traduce ed esegue riga per riga.",
          "L'interprete funziona solo offline; il compilatore richiede internet."
        ],
        1,
        "Il compilatore produce un eseguibile; l'interprete legge ed esegue lo script passo per passo."
      ),
      q(
        "Uno script Python stampa “Ciao” alla riga 1 e ha un errore di sintassi alla riga 3. Cosa vedi?",
        [
          "Nulla: Python blocca tutto prima della riga 1.",
          "“Ciao”, poi salta la riga 3 e continua.",
          "“Ciao”, poi l'errore alla riga 3 e l'esecuzione si ferma."
        ],
        2,
        "L'interprete esegue le righe precedenti, poi si blocca quando incontra quella non valida."
      )
    ]
  });

  /* ============================================================
   * 04 · Algoritmi e flowchart
   * ============================================================ */
  lessons.push({
    id: "lesson_base_04",
    orderIndex: 4,
    title: "Algoritmi e diagrammi di flusso",
    durationMinutes: 14,
    topicTag: "Algoritmi",
    description:
      "Un algoritmo è una ricetta finita, ordinata e non ambigua. Impariamo a progettarlo prima di scrivere codice.",
    chapters: [
      {
        title: "Il robot esegue, non indovina",
        html:
          "<p>Dai a un robot l'ordine di preparare un panino. Esegue esattamente ciò che dici, nell'ordine in cui lo dici. Se la sequenza è sbagliata, il panino non riesce.</p>" +
          "<p>Un <strong>algoritmo</strong> è questo: una sequenza di passi per risolvere un problema. Non è ancora codice: è il progetto.</p>"
      },
      {
        title: "Finito, non ambiguo, efficace",
        html:
          '<ul class="bullets">' +
          "<li><strong>Finito</strong> — un numero limitato di passi, prima o poi termina. Un ciclo infinito non è un algoritmo.</li>" +
          "<li><strong>Non ambiguo</strong> — ogni passo ha un solo significato. “Metti il formaggio” senza dire dove è ambiguo.</li>" +
          "<li><strong>Efficace</strong> — risolve il problema per ogni input valido, non solo per un esempio fortunato.</li>" +
          "</ul>" +
          "<p>Il <strong>diagramma di flusso</strong> (flowchart) visualizza l'algoritmo:</p>" +
          '<table class="compare"><thead><tr><th>Simbolo</th><th>Significato</th></tr></thead><tbody>' +
          "<tr><td>Ovale</td><td>Inizio / fine</td></tr>" +
          "<tr><td>Rettangolo</td><td>Operazione</td></tr>" +
          "<tr><td>Rombo</td><td>Decisione (due rami: sì / no)</td></tr>" +
          "<tr><td>Parallelogramma</td><td>Input / output</td></tr>" +
          "</tbody></table>" +
          '<div class="callout warn">Testa i casi limite: zero, numeri negativi, input strani. Un solo esempio non dimostra che l’algoritmo è corretto.</div>'
      }
    ],
    lab: {
      title: "Flowchart pari o dispari",
      description: "Esegui il diagramma un passo alla volta, osserva il ramo scelto e prova a introdurre il bug.",
      widget: "flowchart"
    },
    keyPoints: [
      "Algoritmo: sequenza finita, ordinata e non ambigua di passi che risolve un problema.",
      "Flowchart: ovale per inizio/fine, rettangolo per un processo, rombo per una decisione, parallelogramma per input/output.",
      "I casi limite vanno testati: numeri normali, zero, negativi e input inattesi."
    ],
    codePrompt: "Calcola la media di tre voti e stampala. Il risultato deve essere 7.0.",
    codeStarter: 'a = 7\nb = 8\nc = 6\nmedia = (a + b + c) / 3\nprint("Media:", media)',
    language: "PYTHON",
    expectedKeyword: "7.0",
    quizQuestions: [
      q(
        "Quale caratteristica NON deve avere un algoritmo?",
        [
          "Essere finito, cioè terminare dopo un numero limitato di passi.",
          "Essere ambiguo, così il robot può interpretare liberamente.",
          "Essere efficace, cioè risolvere davvero il problema."
        ],
        1,
        "Un algoritmo deve essere non ambiguo: ogni passo deve avere un solo significato."
      ),
      q(
        "Nel flowchart “N è pari?”, quale simbolo usi e quanti rami escono?",
        [
          "Un rettangolo, con un solo ramo.",
          "Un rombo, con due rami: sì e no.",
          "Un ovale, con tre rami."
        ],
        1,
        "Il rombo è la decisione: da lì escono sempre due rami."
      )
    ]
  });

  /* ============================================================
   * 05 · Variabili e tipi
   * ============================================================ */
  lessons.push({
    id: "lesson_base_05",
    orderIndex: 5,
    title: "Variabili e tipi di dato",
    durationMinutes: 13,
    topicTag: "Variabili",
    description:
      "Scatole con un'etichetta: come il computer distingue numeri, testo e valori vero/falso, e perché il tipo cambia le operazioni possibili.",
    chapters: [
      {
        title: "20 non è “venti”",
        html:
          "<p>Due scatole con la stessa etichetta possono contenere cose diverse: un numero oppure una stringa di testo. Per il computer non sono affatto la stessa cosa.</p>" +
          "<p><code>20 + 1</code> fa <strong>21</strong>. <code>\"20\" + 1</code> è un errore: non puoi sommare un testo e un numero.</p>" +
          '<div class="callout">Il <strong>tipo</strong> è il contratto del valore: dice quali operazioni hanno senso e quali no.</div>'
      },
      {
        title: "Una variabile è una scatola con un'etichetta",
        html:
          "<p>Una variabile ha tre cose: un <strong>nome</strong>, un <strong>valore</strong> e un <strong>tipo</strong>. Il nome è l'etichetta, il valore è il contenuto.</p>" +
          code('nome = "Ada"      # str\netà = 16          # int\nmedia = 8.5       # float\npromosso = True   # bool') +
          '<ul class="bullets">' +
          "<li><strong>int</strong> — numeri senza virgola: 0, 7, -3, 1000.</li>" +
          "<li><strong>float</strong> — numeri con la virgola: 3.14, 8.5, -0.5.</li>" +
          "<li><strong>str</strong> — testo tra virgolette: \"ciao\", \"00100\", \"venti\".</li>" +
          "<li><strong>bool</strong> — solo due valori: True o False.</li>" +
          "</ul>" +
          "<p><code>=</code> mette un valore nella scatola; <code>==</code> confronta due valori. Il CAP di una città è una stringa: contiene zeri iniziali e non si fanno calcoli.</p>" +
          '<div class="callout warn"><code>"20"</code> non è 20. <code>int("20")</code> lo converte, ma solo se il testo è davvero numerico.</div>'
      }
    ],
    lab: {
      title: "Le scatole della memoria",
      description: "Assegna nome, età e media, cambia i valori e osserva tipo e contenuto di ogni scatola.",
      widget: "variables"
    },
    keyPoints: [
      "Variabile: una scatola con nome, valore e tipo. Il nome è l'etichetta, il valore è il contenuto.",
      "Tipi: int, float, str e bool. Il tipo decide quali operazioni funzionano e quali producono un errore.",
      "Assegna vs confronta: = mette un valore nella scatola, == confronta due valori. Il CAP è una stringa."
    ],
    codePrompt: "Crea nome, età e media, poi stampa una sola frase con una f-string: «Luca ha 15 anni, media 7.5».",
    codeStarter: 'nome = "Luca"\netà = 15\nmedia = 7.5\nprint(f"{nome} ha {età} anni, media {media}")',
    language: "PYTHON",
    expectedKeyword: "Luca ha 15 anni",
    quizQuestions: [
      q(
        "Che tipo useresti per il CAP di una città?",
        [
          "Intero, perché è fatto di cifre.",
          "Stringa, perché contiene zeri iniziali e non si fanno calcoli.",
          "Booleano, perché può essere vero o falso."
        ],
        1,
        "Il CAP è un codice, non una quantità: va trattato come testo per non perdere gli zeri iniziali."
      ),
      q(
        "Dopo x = 5 e x = x + 1, quanto vale x?",
        [
          "5, perché il valore iniziale non cambia.",
          "6, perché legge 5, aggiunge 1 e rimette il risultato.",
          "Errore, perché non si può riassegnare una variabile."
        ],
        1,
        "L'assegnazione valuta la parte destra (5 + 1) e la mette nella scatola x."
      )
    ]
  });

  /* ============================================================
   * 06 · Condizioni
   * ============================================================ */
  lessons.push({
    id: "lesson_base_06",
    orderIndex: 6,
    title: "Condizioni e scelte",
    durationMinutes: 14,
    topicTag: "Condizioni",
    description:
      "If, else, and, or: come un programma prende decisioni e perché testare un solo caso non basta mai.",
    chapters: [
      {
        title: "Due condizioni, una decisione",
        html:
          "<p>Il buttafuori del locale ha una regola precisa: entri solo se hai <strong>almeno 18 anni</strong> e hai <strong>il biglietto</strong>. Anche un programma prende decisioni così.</p>" +
          code('età = 17\nbiglietto = True\n\nif età >= 18 and biglietto:\n    print("Entra")\nelse:\n    print("Resta fuori")') +
          "<p>Il blocco dentro <code>if</code> viene eseguito solo quando la condizione è vera. Altrimenti scatta il blocco <code>else</code>.</p>"
      },
      {
        title: "Il programma sceglie: if, else, and, or",
        html:
          "<p>Con <code>elif</code> puoi aggiungere casi intermedi: «tra 16 e 17 anni entra solo se accompagnato».</p>" +
          '<table class="compare"><thead><tr><th>A</th><th>B</th><th>A and B</th><th>A or B</th></tr></thead><tbody>' +
          "<tr><td>Vero</td><td>Vero</td><td>Vero</td><td>Vero</td></tr>" +
          "<tr><td>Vero</td><td>Falso</td><td>Falso</td><td>Vero</td></tr>" +
          "<tr><td>Falso</td><td>Vero</td><td>Falso</td><td>Vero</td></tr>" +
          "<tr><td>Falso</td><td>Falso</td><td>Falso</td><td>Falso</td></tr>" +
          "</tbody></table>" +
          "<p><code>and</code> vuole entrambe le condizioni vere; <code>or</code> ne basta una; <code>not</code> inverte il risultato.</p>" +
          '<div class="callout warn">Attenzione a <code>=</code> e <code>==</code>: il primo assegna, il secondo confronta. E l’indentazione non è decorativa: dice al computer quale riga appartiene al blocco.</div>'
      }
    ],
    lab: {
      title: "Il buttafuori: chi entra?",
      description: "Prova quattro profili con età e biglietto diversi e osserva quale ramo viene eseguito.",
      widget: "conditions"
    },
    keyPoints: [
      "If/else: if esegue un blocco solo se la condizione è vera; else gestisce il caso contrario.",
      "Operatori: == confronta, = assegna. and vuole entrambe vere, or ne basta una, not inverte.",
      "Testa i casi: valori veri, falsi e limite. Un solo profilo non dimostra che la regola funziona."
    ],
    codePrompt: "Simula il buttafuori. Con età 17 e biglietto False deve stampare «Resta fuori»; porta i valori a 18 anni e biglietto True per ottenere «Entra».",
    codeStarter: 'età = 17\nbiglietto = False\n\nif età >= 18 and biglietto:\n    print("Entra")\nelse:\n    print("Resta fuori")',
    language: "PYTHON",
    expectedKeyword: "biglietto = True",
    quizQuestions: [
      q(
        "Cosa significa if (età >= 18 and biglietto)?",
        [
          "Entra se ha almeno 18 anni oppure se ha il biglietto.",
          "Entra solo se ha almeno 18 anni e ha anche il biglietto.",
          "Entra sempre, perché il biglietto è facoltativo."
        ],
        1,
        "and richiede che entrambe le condizioni siano vere."
      ),
      q(
        "Quale operatore verifica se due valori sono uguali?",
        [
          "=, perché mette i valori nella stessa scatola.",
          "==, perché confronta i due valori.",
          "!=, perché controlla la differenza."
        ],
        1,
        "== è il confronto; = è l'assegnazione."
      )
    ]
  });

  /* ============================================================
   * 07 · Cicli
   * ============================================================ */
  lessons.push({
    id: "lesson_base_07",
    orderIndex: 7,
    title: "Cicli while e for",
    durationMinutes: 14,
    topicTag: "Cicli",
    description:
      "Ripetere senza copiare: i quattro pezzi di un ciclo, la differenza tra while e for e il bug del contatore dimenticato.",
    chapters: [
      {
        title: "Ripeti. Ma sappi quando fermarti.",
        html:
          "<p>Un ciclo ripete un blocco di istruzioni senza riscriverlo. Il problema non è ripetere: è capire <strong>quando smettere</strong>.</p>" +
          "<p>Ogni ciclo ha quattro pezzi:</p>" +
          '<ul class="bullets">' +
          "<li><strong>Inizializzazione</strong> — da dove parte il contatore: <code>i = 1</code>.</li>" +
          "<li><strong>Condizione</strong> — il ciclo continua finché è vera: <code>i &lt;= 5</code>.</li>" +
          "<li><strong>Corpo</strong> — le istruzioni da ripetere: riempi il bicchiere.</li>" +
          "<li><strong>Aggiornamento</strong> — il contatore avanza: <code>i = i + 1</code>.</li>" +
          "</ul>" +
          code('i = 1\nwhile i <= 5:\n    print("Bicchiere", i)\n    i = i + 1') +
          '<div class="callout warn">Senza l’aggiornamento la condizione resta vera e il ciclo non termina mai.</div>'
      },
      {
        title: "while e for: due strumenti, stesso scopo",
        html:
          "<p><code>range(1, 6)</code> produce <strong>1, 2, 3, 4, 5</strong>: il secondo numero è escluso.</p>" +
          code('for i in range(1, 6):\n    print("Bicchiere", i)') +
          "<p>Il <code>for</code> è più compatto quando sai già quante volte ripetere; il <code>while</code> è più adatto quando l'uscita dipende da una condizione che cambia durante il giro.</p>" +
          '<div class="callout">Un ciclo infinito non è un algoritmo: un algoritmo deve terminare.</div>'
      }
    ],
    lab: {
      title: "Riempi i bicchieri, un giro alla volta",
      description: "Avanza nel ciclo, osserva contatore e condizione, poi introduci il bug e scopri cosa succede.",
      widget: "loops"
    },
    keyPoints: [
      "Ciclo: ripete un blocco finché una condizione resta vera. Serve per non copiare la stessa istruzione dieci volte.",
      "Quattro pezzi: inizializzazione, condizione, corpo e aggiornamento. Se manca l'aggiornamento, il ciclo è infinito.",
      "while e for: il while controlla a ogni giro; il for scorre un intervallo. range(1, 6) arriva fino a 5."
    ],
    codePrompt: "Riempi 5 bicchieri con un ciclo for e stampa «Bicchiere 1» … «Bicchiere 5». Poi prova a riscriverlo con while.",
    codeStarter: 'for i in range(1, 6):\n    print("Bicchiere", i)',
    language: "PYTHON",
    expectedKeyword: "Bicchiere 5",
    quizQuestions: [
      q(
        "Cosa succede se in un while dimentichi di aggiornare il contatore?",
        [
          "Il ciclo esegue il corpo una sola volta e si ferma.",
          "La condizione resta vera e il ciclo non termina mai.",
          "Il computer corregge da solo il contatore."
        ],
        1,
        "Senza aggiornamento la condizione non cambia: il ciclo continua all'infinito."
      ),
      q(
        "Quante volte esegue il corpo for i in range(1, 4)?",
        [
          "2 volte, perché il 4 è escluso.",
          "4 volte, perché arriva fino a 4 compreso.",
          "3 volte, con i = 1, 2, 3."
        ],
        2,
        "range(1, 4) produce 1, 2 e 3: tre iterazioni."
      )
    ]
  });

  /* ============================================================
   * 08 · Funzioni
   * ============================================================ */
  lessons.push({
    id: "lesson_base_08",
    orderIndex: 8,
    title: "Funzioni",
    durationMinutes: 14,
    topicTag: "Funzioni",
    description:
      "Una ricetta con un nome: parametri, corpo e return. Scrivi una volta, richiama quante volte vuoi.",
    chapters: [
      {
        title: "Scrivi una volta. Usa quante volte vuoi.",
        html:
          "<p>Una funzione è una <strong>ricetta con un nome</strong>: riceve degli ingredienti, esegue un lavoro e restituisce un risultato. La stessa ricetta vale per Ada, per Luca e per chiunque altro.</p>" +
          code('def saluta(nome):\n    return "Ciao, " + nome + "!"\n\nprint(saluta("Ada"))\nprint(saluta("Luca"))') +
          "<p>Invece di copiare lo stesso codice per ogni persona, lo scrivi una volta e lo richiami con ingressi diversi.</p>"
      },
      {
        title: "Nome, parametri, corpo e return",
        html:
          '<ul class="bullets">' +
          "<li><strong>Nome</strong> — l'etichetta con cui richiami la ricetta: <code>saluta</code>.</li>" +
          "<li><strong>Parametri</strong> — gli ingressi che la funzione riceve: <code>nome</code>.</li>" +
          "<li><strong>Corpo</strong> — le istruzioni indentate che svolgono il lavoro.</li>" +
          "<li><strong>Return</strong> — il valore che la funzione consegna al chiamante.</li>" +
          "</ul>" +
          "<p>Due ingressi, un'uscita: la funzione è una scatola riutilizzabile. Nella chiamata passi gli <strong>argomenti</strong> concreti, ad esempio <code>\"Ada\"</code>.</p>" +
          '<div class="callout warn"><code>print</code> mostra; <code>return</code> consegna. Una funzione che stampa ma non restituisce produce <code>None</code>.</div>'
      }
    ],
    lab: {
      title: "La macchina delle funzioni",
      description: "Scegli una funzione, inserisci gli argomenti e segui il viaggio dentro parametri e return.",
      widget: "functions"
    },
    keyPoints: [
      "Funzione: un blocco di codice con un nome. Si definisce una volta e si richiama tutte le volte che serve.",
      "Parametri: sono gli ingressi della funzione. Nella chiamata passi gli argomenti concreti, ad esempio \"Ada\".",
      "Return: restituisce il risultato al chiamante. Senza return la funzione produce None, anche se ha stampato qualcosa."
    ],
    codePrompt: "La funzione doppio deve restituire il doppio di n. Correggi il return e verifica che doppio(5) stampi 10.",
    codeStarter: 'def doppio(n):\n    return n + 2\n\nprint(doppio(5))',
    language: "PYTHON",
    expectedKeyword: "n * 2",
    quizQuestions: [
      q(
        "A cosa serve return in una funzione?",
        [
          "A stampare il risultato sullo schermo.",
          "A restituire un valore al codice che ha chiamato la funzione.",
          "A chiudere il programma."
        ],
        1,
        "return consegna il valore al chiamante; print lo mostra soltanto."
      ),
      q(
        "Data def doppio(n): return n * 2, quanto vale doppio(5)?",
        [
          "5, perché il parametro non cambia.",
          "25, perché moltiplica 5 per 5.",
          "10, perché 5 viene passato a n e moltiplicato per 2."
        ],
        2,
        "L'argomento 5 entra nel parametro n, poi viene moltiplicato per 2."
      )
    ]
  });

  /* ============================================================
   * 09 · Liste
   * ============================================================ */
  lessons.push({
    id: "lesson_base_09",
    orderIndex: 9,
    title: "Liste e array",
    durationMinutes: 14,
    topicTag: "Liste",
    description:
      "Tanti valori sotto un solo nome: indici da zero, len, append e l'errore che si nasconde oltre l'ultimo elemento.",
    chapters: [
      {
        title: "Tanti valori. Un solo nome.",
        html:
          "<p>Una lista è una <strong>cassettiera numerata</strong>: ogni cassetto contiene un valore e si apre con un indice. Il primo cassetto però è il numero <strong>0</strong>, non 1.</p>" +
          code('voti = [7, 8, 6]\nprint(voti[0])    # 7\nprint(voti[1])    # 8\nprint(len(voti))  # 3') +
          "<p>Una lista è una sequenza ordinata di valori raccolti sotto un unico nome. Gli elementi si leggono per posizione.</p>"
      },
      {
        title: "La lista conta da zero",
        html:
          '<ul class="bullets">' +
          "<li><strong>Indice</strong> — la posizione di un elemento, da 0 a <code>len - 1</code>.</li>" +
          "<li><strong>len()</strong> — restituisce quanti elementi contiene la lista.</li>" +
          "<li><strong>append()</strong> — aggiunge un nuovo elemento in fondo.</li>" +
          "<li><strong>voti[1] = 9</strong> — modifica direttamente la posizione indicata.</li>" +
          "</ul>" +
          code('voti = [7, 8, 6]\nvoti.append(9)\nprint(voti)        # [7, 8, 6, 9]\nprint(len(voti))   # 4') +
          '<div class="callout warn">Con quattro elementi gli indici vanno da 0 a 3. <code>voti[4]</code> produce un <strong>IndexError</strong>.</div>'
      }
    ],
    lab: {
      title: "La lista dei voti",
      description: "Leggi, aggiungi e modifica i voti. Poi introduci il bug dell'indice fuori range.",
      widget: "lists"
    },
    keyPoints: [
      "Lista: una sequenza ordinata di valori sotto un unico nome. Gli elementi si leggono per posizione.",
      "Indice: il primo elemento è [0], l'ultimo è [len - 1]. Un indice fuori da questo intervallo produce IndexError.",
      "Operazioni: len() conta gli elementi, append() aggiunge in coda, le parentesi quadre leggono o modificano una posizione."
    ],
    codePrompt: "Parti da [7, 8, 6], aggiungi 9 con append e calcola la media con un ciclo. Stampa «Media: 7.5».",
    codeStarter:
      'voti = [7, 8, 6]\nvoti.append(9)\ntotale = 0\nfor v in voti:\n    totale = totale + v\nmedia = totale / len(voti)\nprint("Media:", media)',
    language: "PYTHON",
    expectedKeyword: "7.5",
    quizQuestions: [
      q(
        "Qual è l'indice del primo elemento di una lista?",
        [
          "0, perché gli indici partono da zero.",
          "1, perché è il primo elemento.",
          "Dipende dal tipo di dato contenuto."
        ],
        0,
        "In Python il primo indice è sempre 0."
      ),
      q(
        "Data voti = [7, 8, 6], quanto vale voti[1]?",
        [
          "7, perché è il primo valore.",
          "8, perché l'indice 1 è il secondo elemento.",
          "6, perché è l'ultimo valore."
        ],
        1,
        "L'indice 1 indica il secondo cassetto: 8."
      )
    ]
  });

  /* ============================================================
   * 10 · Stringhe
   * ============================================================ */
  lessons.push({
    id: "lesson_base_10",
    orderIndex: 10,
    title: "Stringhe",
    durationMinutes: 13,
    topicTag: "Stringhe",
    description:
      "Una parola è una fila di caratteri: indice, slice, len e immutabilità. Impara a leggere e trasformare il testo.",
    chapters: [
      {
        title: "Una parola è una fila di caratteri",
        html:
          '<p><code>"CIAO"</code> non è un blocco unico: è una sequenza ordinata di lettere. Ogni lettera ha una posizione precisa, chiamata <strong>indice</strong>.</p>' +
          code("C [0]   I [1]   A [2]   O [3]") +
          "<p><code>parola[0]</code> legge la prima lettera, <code>parola[1]</code> la seconda. Le stringhe si leggono per posizione, non come un blocco unico.</p>"
      },
      {
        title: "La stringa conta da zero",
        html:
          '<ul class="bullets">' +
          "<li><strong>len()</strong> — conta quanti caratteri contiene la stringa.</li>" +
          "<li><strong>Slice</strong> — <code>parola[1:3]</code> estrae da 1 incluso a 3 escluso.</li>" +
          "<li><strong>upper()</strong> — restituisce una nuova stringa tutta maiuscola.</li>" +
          "<li><strong>+</strong> — concatena due stringhe in una nuova stringa.</li>" +
          "</ul>" +
          code('parola = "CIAO"\nprint(len(parola))      # 4\nprint(parola[1:3])      # IA\nprint(parola.upper())   # CIAO\nprint(parola + "!")     # CIAO!') +
          "<p>Le stringhe sono <strong>immutabili</strong>: non puoi scrivere <code>parola[0] = \"M\"</code>. Per cambiare una lettera devi creare una nuova stringa.</p>" +
          '<div class="callout warn">Lo slice <code>[1:3]</code> prende gli indici 1 e 2, non il 3: l’estremo finale è sempre escluso.</div>'
      }
    ],
    lab: {
      title: "Gioca con la parola CIAO",
      description: "Leggi un carattere, estrai uno slice, cambia maiuscole e prova a modificare la stringa.",
      widget: "strings"
    },
    keyPoints: [
      "Stringa: una sequenza ordinata di caratteri. Si legge per posizione, non come un blocco unico.",
      "Indice e slice: il primo carattere è [0]; lo slice [1:3] include l'inizio ed esclude la fine.",
      "Immutabilità: una stringa non si modifica sul posto. Per cambiarla si crea una nuova stringa con concatenazione e slice."
    ],
    codePrompt: "Con parola = \"CIAO\" stampa lunghezza, slice 1:3 e versione maiuscola. Il risultato deve contenere «IA».",
    codeStarter: 'parola = "CIAO"\nprint("Lunghezza:", len(parola))',
    language: "PYTHON",
    expectedKeyword: "parola[1:3]",
    quizQuestions: [
      q(
        "Quanti caratteri restituisce len(\"CIAO\")?",
        [
          "3, perché conto solo le vocali.",
          "4, perché ci sono quattro caratteri.",
          "5, perché conta anche lo spazio finale."
        ],
        1,
        "C, I, A, O: quattro caratteri, nessuno spazio."
      ),
      q(
        "Cosa restituisce \"CIAO\"[1:3]?",
        [
          "\"CI\", perché parte da zero.",
          "\"IA\", perché prende gli indici 1 e 2.",
          "\"IAO\", perché include anche l'indice 3."
        ],
        1,
        "Lo slice include l'indice 1 ed esclude l'indice 3: restano I e A."
      )
    ]
  });

  /* ============================================================
   * 11 · Input e validazione
   * ============================================================ */
  lessons.push({
    id: "lesson_base_11",
    orderIndex: 11,
    title: "Input e validazione",
    durationMinutes: 14,
    topicTag: "Validazione",
    description:
      "Non fidarti dei dati in ingresso: testo, numero, limite. Tre controlli per trasformare un input libero in un dato affidabile.",
    chapters: [
      {
        title: "Non fidarti dei dati in ingresso",
        html:
          "<p>Un utente può scrivere qualsiasi cosa: un numero, una parola, uno spazio, una data. Il programma deve <strong>controllare</strong> prima di usare il valore.</p>" +
          "<p><code>input()</code> restituisce sempre una <strong>stringa</strong>, anche quando sembra un numero: se digiti 17 ottieni \"17\", non 17.</p>" +
          "<p>Per usarlo come numero serve una conversione: <code>int('17')</code>. Ma <code>int('abc')</code> produce un <strong>ValueError</strong>.</p>"
      },
      {
        title: "Prima il testo, poi il numero, poi il limite",
        html:
          "<p>Una validazione robusta procede in tre passi:</p>" +
          '<ul class="bullets">' +
          "<li><strong>Testo</strong> — il campo non è vuoto e non è fatto solo di spazi.</li>" +
          "<li><strong>Numero</strong> — il testo contiene solo cifre, ad esempio con <code>isdigit()</code>.</li>" +
          "<li><strong>Limite</strong> — il numero è nell'intervallo accettato, ad esempio 0–120 per un'età.</li>" +
          "</ul>" +
          code('età = "17"\nif età.isdigit():\n    numero = int(età)\n    if 0 <= numero <= 120:\n        print("Valido")\n    else:\n        print("Fuori intervallo")\nelse:\n    print("Non è un numero")') +
          '<div class="callout warn">Non convertire mai alla cieca: prima verifica il testo, poi converti, poi controlla il limite. Ogni passo ha un messaggio diverso.</div>'
      }
    ],
    lab: {
      title: "Valida il profilo",
      description: "Prova i casi valido, vuoto, abc e 200. Osserva quale controllo fallisce e perché.",
      widget: "validation"
    },
    keyPoints: [
      "input() restituisce sempre una stringa, anche se l'utente digita cifre.",
      "Prima si controlla il testo (non vuoto, solo cifre), poi si converte con int(), poi si verifica l'intervallo.",
      "Casi limite come vuoto, abc e 200 vanno testati: sono quelli che fanno emergere i bug."
    ],
    codePrompt: "Simula input() con una stringa. Stampa «Vuoto» se è vuota, «Non è un numero» se non è numerica, «Fuori intervallo» oltre 120, altrimenti «Valido».",
    codeStarter:
      'età = "17"\nif età == "":\n    print("Vuoto")\nelif not età.isdigit():\n    print("Non è un numero")\nelse:\n    numero = int(età)\n    if numero < 0 or numero > 120:\n        print("Fuori intervallo")\n    else:\n        print("Valido")',
    language: "PYTHON",
    expectedKeyword: "Valido",
    quizQuestions: [
      q(
        "Che tipo di dato restituisce input()?",
        [
          "Un numero, se l'utente digita cifre.",
          "Una stringa, sempre, anche se sembra un numero.",
          "Un booleano, vero o falso."
        ],
        1,
        "input() legge testo: la conversione a numero è un passaggio separato e va protetta."
      ),
      q(
        "Prima di scrivere int(età), quale controllo evita il ValueError?",
        [
          "Controllare che il nome non sia vuoto.",
          "Verificare che il testo contenga solo cifre, ad esempio con isdigit().",
          "Stampare il valore prima della conversione."
        ],
        1,
        "isdigit() verifica che la stringa sia fatta di cifre prima della conversione."
      )
    ]
  });

  /* ============================================================
   * 12 · Debug
   * ============================================================ */
  lessons.push({
    id: "lesson_base_12",
    orderIndex: 12,
    title: "Debug",
    durationMinutes: 15,
    topicTag: "Debug",
    description:
      "Nessun errore, risultato sbagliato: riconosci sintassi, runtime e logica, e impara un metodo per trovare il bug.",
    chapters: [
      {
        title: "Nessun errore. Risultato sbagliato.",
        html:
          "<p>Il programma parte, non si blocca, stampa qualcosa. E quel qualcosa è sbagliato. È il bug più difficile da trovare, perché il computer non ti avvisa.</p>" +
          '<table class="compare"><thead><tr><th>Tipo</th><th>Cosa succede</th><th>Esempio</th></tr></thead><tbody>' +
          "<tr><td><strong>Sintassi</strong></td><td>Il programma non parte</td><td>Manca una parentesi o una virgoletta</td></tr>" +
          "<tr><td><strong>Runtime</strong></td><td>Crash a metà</td><td>Divisione per zero, indice fuori range</td></tr>" +
          "<tr><td><strong>Logico</strong></td><td>Gira ma sbaglia in silenzio</td><td><code>somma = n</code> invece di accumulare</td></tr>" +
          "</tbody></table>" +
          '<div class="callout">Un errore logico non lascia messaggi: solo un risultato che non torna.</div>'
      },
      {
        title: "Trova dove il totale va perso",
        html:
          "<p>Il metodo funziona sempre allo stesso modo:</p>" +
          '<ul class="bullets">' +
          "<li><strong>Riproduci</strong> — trova un input che mostra l'errore.</li>" +
          "<li><strong>Isola</strong> — restringi il campo, un'ipotesi per volta.</li>" +
          "<li><strong>Osserva</strong> — breakpoint e watch mostrano i valori reali, non quelli che immagini.</li>" +
          "<li><strong>Correggi e ritesta</strong> — verifica il caso trovato e anche i vicini.</li>" +
          "</ul>" +
          code('voti = [6, 8, 10]\nsomma = 0\nfor n in voti:\n    somma = n        # bug: sovrascrive\nmedia = somma / len(voti)') +
          "<p>Se <code>somma</code> passa da 0 a 6, poi a 8, poi a 10, non si sta accumulando: la riga dentro il ciclo sovrascrive il totale.</p>" +
          '<div class="callout warn">Non fidarti di ciò che pensi che il codice faccia. Guarda i valori reali, riga per riga.</div>'
      }
    ],
    lab: {
      title: "Debugger passo-passo",
      description: "Esegui il codice una riga alla volta, tieni d'occhio le variabili e trova la riga che perde il totale.",
      widget: "debug"
    },
    keyPoints: [
      "Tre famiglie: sintassi (non parte), runtime (crash a metà), logico (gira ma sbaglia). L'ultimo non lascia messaggi.",
      "Metodo: riproduci, isola, osserva, correggi e ritesta. Un'ipotesi per volta, non cambiare tutto insieme.",
      "Debugger: breakpoint, passo e watch mostrano i valori reali. Non fidarti di ciò che pensi che il codice faccia."
    ],
    codePrompt: "Il ciclo sovrascrive il totale: correggi l'accumulo e verifica che la media di [6, 8, 10] sia 8.0.",
    codeStarter:
      'voti = [6, 8, 10]\nsomma = 0\nfor n in voti:\n    somma = n\nmedia = somma / len(voti)\nprint("Media:", media)',
    language: "PYTHON",
    expectedKeyword: "8.0",
    quizQuestions: [
      q(
        "Un programma termina senza messaggi d'errore, ma il risultato è sbagliato. Che tipo di errore è?",
        [
          "Errore di sintassi: il programma non è mai partito.",
          "Errore di runtime: il programma è andato in crash.",
          "Errore logico: il programma gira ma calcola male."
        ],
        2,
        "Nessun crash e nessun messaggio: il codice gira, ma la logica produce un risultato errato."
      ),
      q(
        "Nel debugger vedi somma passare da 0 a 6, poi a 8, poi a 10. Qual è l'ipotesi più probabile?",
        [
          "La lista contiene solo tre numeri, quindi il ciclo è troppo corto.",
          "La riga 4 sovrascrive il totale con somma = n invece di accumularlo.",
          "La media è sbagliata perché len() conta anche lo zero iniziale."
        ],
        1,
        "Se il totale coincide ogni volta con l'ultimo valore, la riga del ciclo lo sta sovrascrivendo."
      )
    ]
  });

  lessons.forEach(function (lesson) {
    lesson.courseId = "course_base";
  });

  App.content.baseCourse = {
    id: "course_base",
    orderIndex: 1,
    title: "Corso Base",
    subtitle: "Dal bit al debug: informatica e Python in 12 lezioni",
    topics: ["Hardware", "Binario", "Algoritmi", "Python", "Debug"],
    accent: "green",
    image: "assets/img/courses/base.webp",
    credit: "Contenuti adattati dalle lezioni interattive del Prof. Michel Formento.",
    lessons: lessons
  };
})(window.App = window.App || {});

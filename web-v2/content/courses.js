/* LabClub — contenuti dei corsi.
 * Estratti da DemoDataSeeder.kt dell'app Android.
 * Modificabili a mano: nessun build step, nessun database.
 */
(function (App) {
  "use strict";

  const q = (question, options, correctIndex, explanation) => ({
    question: question,
    options: options,
    correctIndex: correctIndex,
    explanation: explanation
  });

  const courses = [App.content.baseCourse,
    {
      id: "course_3",
      orderIndex: 2,
      title: "Web & App",
      subtitle: "HTML, CSS, JavaScript, Android, Firebase",
      topics: ["HTML", "CSS", "JavaScript", "Android", "Firebase"],
      accent: "green",
      image: "assets/img/courses/web.webp",
      lessons: [
        {
          id: "lesson_3_1",
          courseId: "course_3",
          orderIndex: 1,
          title: "HTML5 & CSS3 Stile Streetwear",
          durationMinutes: 17,
          videoUrl: "https://www.youtube.com/watch?v=mU6anWqZJcc",
          pdfUrl: "https://developer.mozilla.org/it/docs/Web/HTML",
          description: "Costruisci la struttura semantica con HTML5 e dai vita a card bold nere e neon con CSS Flexbox.",
          topicTag: "HTML e CSS",
          codePrompt: "Modifica il titolo della card HTML usando <h1> e aggiungi uno stile color: #00FF88.",
          codeStarter: `<div style="background:#0A0A0A;color:#00FF88;padding:16px;border:2px solid #A100FF;font-family:sans-serif">
  <h1>LABCLUB DROP</h1>
  <p>Edizione limitata Web.</p>
</div>`,
          language: "HTML",
          expectedKeyword: "<h1>",
          quizQuestions: [
            q("Quale proprietà CSS cambia il colore del testo?", ["font-color", "color", "text-style", "bg-color"], 1, "'color' controlla il colore del testo."),
            q("A cosa serve Flexbox?", ["Allineare e distribuire elementi in righe o colonne", "Collegare Firebase", "Scrivere query SQL", "Comprimere immagini"], 0, "display: flex semplifica i layout responsivi."),
            q("Quale tag contiene il contenuto visibile della pagina HTML?", ["<head>", "<meta>", "<body>", "<title>"], 2, "Tutto ciò che appare nella viewport sta dentro <body>."),
            q("Come si seleziona una classe CSS chiamata .neon?", ["#neon", ".neon", "*neon", "@neon"], 1, "Il punto . seleziona le classi, # gli ID."),
            q("Quale unità CSS si adatta alla larghezza dello schermo?", ["px", "vw", "cm", "pt"], 1, "vw = viewport width.")
          ]
        },
        {
          id: "lesson_3_2",
          courseId: "course_3",
          orderIndex: 2,
          title: "JavaScript Interattivo & DOM",
          durationMinutes: 22,
          videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
          pdfUrl: "https://developer.mozilla.org/it/docs/Web/JavaScript",
          description: "Rendi vive le pagine web manipolando il DOM, gestendo eventi clic e logging in console.",
          topicTag: "JavaScript",
          codePrompt: "Aggiungi un tag <script> che stampa 'LabClub JS Ready' usando console.log().",
          codeStarter: `<h2 id="msg" style="color:#00FF88">Caricamento...</h2>
<script>
  document.getElementById('msg').innerText = 'LabClub JS Ready!';
  console.log('LabClub JS Ready');
</script>`,
          language: "HTML",
          expectedKeyword: "console.log",
          quizQuestions: [
            q("Quale metodo seleziona un elemento HTML tramite il suo ID?", ["getElementById", "queryId", "findClass", "selectNode"], 0, "document.getElementById('id')."),
            q("Quale parola chiave dichiara una costante in JS?", ["var", "let", "const", "val"], 2, "const impedisce la riassegnazione del riferimento."),
            q("Cosa stampa console.log(typeof '42')?", ["number", "string", "int", "boolean"], 1, "Tra apici è sempre una stringa."),
            q("Come si ascolta un clic su un bottone in JS?", ["onPush()", "addEventListener('click', ...)", "listenClick()", "hover()"], 1, "addEventListener collega funzioni agli eventi DOM."),
            q("Quale operatore confronta sia valore che tipo in JS?", ["==", "===", "=", "!="], 1, "=== è l'uguaglianza stretta.")
          ]
        },
        {
          id: "lesson_3_3",
          courseId: "course_3",
          orderIndex: 3,
          title: "Android Jetpack Compose & Firebase",
          durationMinutes: 24,
          videoUrl: "https://www.youtube.com/watch?v=cDabx3SxyFQ",
          pdfUrl: "https://developer.android.com/compose",
          description: "Architettura MVVM su Android, UI dichiarativa con Jetpack Compose e sincronizzazione cloud in tempo reale con Firebase Firestore.",
          topicTag: "Android e Firebase",
          codePrompt: "Completa questo snippet HTML/JS simulando lo stato di un documento Firestore con titolo e punti.",
          codeStarter: `<pre id="doc" style="color:#00FF88"></pre>
<script>
  const student = { nome: 'Crew', punti: 100 };
  document.getElementById('doc').innerText = JSON.stringify(student, null, 2);
  console.log('Synced:', student.punti);
</script>`,
          language: "HTML",
          expectedKeyword: "JSON.stringify",
          quizQuestions: [
            q("In Jetpack Compose, cosa rende una funzione un elemento UI?", ["@Composable", "@Activity", "@Layout", "@View"], 0, "L'annotazione @Composable."),
            q("A cosa serve il ViewModel nell'architettura MVVM?", ["Mantenere lo stato UI e sopravvivere alle rotazioni", "Disegnare file XML", "Sostituire Gradle", "Gestire il Bluetooth"], 0, "Separa stato e logica dalla UI."),
            q("In Firebase Firestore, i dati sono organizzati in:", ["Tabelle e righe", "Collezioni e documenti", "Cartelle ZIP", "Array binari"], 1, "Firestore è un database NoSQL a documenti e collezioni."),
            q("Cosa fa StateFlow in Kotlin?", ["Emette aggiornamenti di stato osservabili", "Compila APK", "Crea icone", "Invia SMS"], 0, "La UI usa collectAsStateWithLifecycle()."),
            q("Perché usiamo le Firestore Security Rules?", ["Per proteggere lettura e scrittura lato server", "Per cambiare il font", "Per velocizzare la GPU", "Per comprimere foto"], 0, "Garantiscono controllo accessi zero-trust.")
          ]
        }
      ]
    },
    {
      id: "course_4",
      orderIndex: 3,
      title: "Dati e IA",
      subtitle: "Database, SQL, introduzione all'IA, prompt engineering",
      topics: ["Database", "SQL", "Intelligenza Artificiale", "Prompt Engineering"],
      accent: "purple",
      image: "assets/img/courses/ai.webp",
      lessons: [
        {
          id: "lesson_4_1",
          courseId: "course_4",
          orderIndex: 1,
          title: "Database Relazionali & SQL Base",
          durationMinutes: 18,
          videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
          pdfUrl: "https://www.sqlite.org/docs.html",
          description: "Tabelle, chiavi primarie, relazioni e query SELECT, WHERE e ORDER BY per interrogare grandi dataset.",
          topicTag: "Database e SQL",
          codePrompt: "Simula in Python una tabella studenti filtrando chi ha >= 80 punti.",
          codeStarter: `punti = [65, 92, 84, 50]
for p in punti:
    if p >= 80:
        print("Top score:", p)`,
          language: "PYTHON",
          expectedKeyword: "if",
          quizQuestions: [
            q("Quale comando SQL estrae dati da una tabella?", ["GET", "SELECT", "FETCH", "PULL"], 1, "SELECT colonne FROM tabella."),
            q("Cos'è una Primary Key?", ["Un identificatore univoco per ogni riga", "Una password segreta", "Un indice alfabetico", "Un commento"], 0, "Identifica univocamente ogni record."),
            q("Quale clausola filtra le righe in SQL?", ["FILTER", "WHERE", "IF", "CASE"], 1, "WHERE imposta la condizione di filtro."),
            q("Quale comando ordina i risultati?", ["SORT BY", "ORDER BY", "GROUP BY", "ALIGN BY"], 1, "ORDER BY colonna DESC/ASC."),
            q("Cosa fa INSERT INTO?", ["Aggiunge un nuovo record", "Elimina una tabella", "Modifica un indice", "Chiude il DB"], 0, "Inserisce nuove righe nella tabella.")
          ]
        },
        {
          id: "lesson_4_2",
          courseId: "course_4",
          orderIndex: 2,
          title: "Introduzione all'Intelligenza Artificiale",
          durationMinutes: 20,
          videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
          pdfUrl: "https://ai.google.dev",
          description: "Dal Machine Learning classico ai Large Language Models (LLM): come i modelli riconoscono pattern e generano testo.",
          topicTag: "Fondamenti IA",
          codePrompt: "Scrivi in Python una piccola regola di classificazione che assegna 'ALTO' se confidenza >= 0.8.",
          codeStarter: `confidenza = 0.91
if confidenza >= 0.8:
    print("Predizione: ALTO")`,
          language: "PYTHON",
          expectedKeyword: "print",
          quizQuestions: [
            q("Cos'è un dataset di training?", ["I dati usati per addestrare un modello", "Un antivirus", "Un monitor 4K", "Un foglio CSS"], 0, "Il modello apprende pattern statistici dal training set."),
            q("Cosa significa LLM?", ["Large Language Model", "Local Logic Machine", "Low Latency Memory", "Linear Link Mode"], 0, "Modelli linguistici addestrati su vasti corpora di testo."),
            q("Cos'è l'overfitting?", ["Quando il modello memorizza i dati di training e fallisce su dati nuovi", "Quando la CPU si scalda", "Quando mancano dati", "Un algoritmo veloce"], 0, "Perde capacità di generalizzazione."),
            q("Cos'è un token in un LLM?", ["Un frammento di testo usato come unità di elaborazione", "Una moneta fisica", "Una chiave USB", "Un pixel"], 0, "I modelli suddividono parole e simboli in token."),
            q("Quale campo usa le reti neurali multistrato?", ["Deep Learning", "HTML", "FTP", "Assembly"], 0, "Deep Learning indica reti neurali profonde.")
          ]
        },
        {
          id: "lesson_4_3",
          courseId: "course_4",
          orderIndex: 3,
          title: "Prompt Engineering con Gemini",
          durationMinutes: 16,
          videoUrl: "https://www.youtube.com/watch?v=jC4v5AS4RIM",
          pdfUrl: "https://ai.google.dev/gemini-api/docs",
          description: "Ruolo, contesto, vincoli e formato output: scrivi prompt precisi per far collaborare Gemini senza farti fare copia-incolla.",
          topicTag: "Prompt Engineering",
          codePrompt: "Costruisci in Python un prompt strutturato unendo ruolo e task con una f-string.",
          codeStarter: `ruolo = "Senior Mentor"
task = "Spiega i cicli con 3 indizi"
print(f"[{ruolo}] -> {task}")`,
          language: "PYTHON",
          expectedKeyword: "f\"",
          quizQuestions: [
            q("Quale tecnica migliora la precisione di un prompt?", ["Fornire contesto chiaro, vincoli ed esempi", "Scrivere tutto in maiuscolo", "Usare una sola parola", "Omettere l'obiettivo"], 0, "Ruolo, contesto e formato riducono le ambiguità."),
            q("Cos'è il few-shot prompting?", ["Includere alcuni esempi di input/output nel prompt", "Fare poche domande al giorno", "Spegnere il modello", "Usare immagini nere"], 0, "Gli esempi guidano stile e struttura della risposta."),
            q("Perché chiedere un output JSON strutturato?", ["Per poterlo leggere facilmente dal codice dell'app", "Per renderlo più lungo", "Per nascondere i dati", "Per evitare CSS"], 0, "Il JSON strutturato si integra direttamente nelle app."),
            q("Cos'è una system instruction?", ["Una direttiva persistente su comportamento e regole del modello", "Un comando di spegnimento", "Un errore di rete", "Una tabella SQL"], 0, "Definisce personalità e limiti, come nel Tutor LabClub."),
            q("Cosa bisogna fare sempre con il codice suggerito dall'IA?", ["Leggerlo, capirlo e testarlo", "Incollarlo alla cieca", "Cancellare i test", "Ignorare gli errori"], 0, "Lo sviluppatore resta sempre responsabile del codice.")
          ]
        }
      ]
    },
    {
      id: "course_5",
      orderIndex: 4,
      title: "Sicurezza Digitale",
      subtitle: "Password, phishing, privacy, fake news, etica IA",
      topics: ["Password", "Phishing", "Privacy", "Fake News", "Etica IA"],
      accent: "green",
      image: "assets/img/courses/security.webp",
      lessons: [
        {
          id: "lesson_5_1",
          courseId: "course_5",
          orderIndex: 1,
          title: "Password, Hashing & 2FA",
          durationMinutes: 15,
          videoUrl: "https://www.youtube.com/watch?v=b4b8ktJG4Gg",
          pdfUrl: "https://staysafeonline.org",
          description: "Perché le password corte vengono violate in secondi, come funziona l'hashing e perché Password Manager + 2FA ti salvano.",
          topicTag: "Password e 2FA",
          codePrompt: "Scrivi in Python un controllo che verifica se una password ha lunghezza >= 12 caratteri.",
          codeStarter: `pw = "LabClub#Neon2026"
if len(pw) >= 12:
    print("Password robusta!")
else:
    print("Troppo corta")`,
          language: "PYTHON",
          expectedKeyword: "len",
          quizQuestions: [
            q("Cosa rende forte una password?", ["Lunghezza (12+ caratteri) e unicità per ogni servizio", "Il proprio nome di battesimo", "12345678", "Usarla ovunque"], 0, "Lunghezza e unicità battono la complessità corta."),
            q("Cos'è l'hashing di una password?", ["Trasformazione irreversibile in un'impronta fissa", "Salvataggio in chiaro", "Invio via email", "Cancellazione automatica"], 0, "I server salvano gli hash, mai le password in chiaro."),
            q("Cos'è un Password Manager?", ["Una cassaforte cifrata per generare e salvare password uniche", "Un social network", "Un gioco", "Un browser lento"], 0, "Permette di avere password diverse per ogni sito."),
            q("Cosa aggiunge la 2FA?", ["Un secondo fattore oltre alla password", "Due monitor", "Due tastiere", "Nessuna protezione"], 0, "Qualcosa che sai + qualcosa che hai (es. app TOTP o passkey)."),
            q("Cosa sono le Passkey?", ["Accesso biometrico crittografico resistente al phishing", "Password di 4 cifre", "Sticker cartacei", "Cookie pubblicitari"], 0, "Usano crittografia a chiave pubblica legata al dispositivo.")
          ]
        },
        {
          id: "lesson_5_2",
          courseId: "course_5",
          orderIndex: 2,
          title: "Phishing, Ingegneria Sociale & Privacy",
          durationMinutes: 16,
          videoUrl: "https://www.youtube.com/watch?v=XBkzBrXlle0",
          pdfUrl: "https://www.garanteprivacy.it",
          description: "Riconosci URL truffa, email urgenti manipolative e gestisci i permessi e i dati personali secondo il GDPR.",
          topicTag: "Phishing e Privacy",
          codePrompt: "Stampa un avviso di sicurezza se il dominio simulato non corrisponde a 'labclub.edu'.",
          codeStarter: `dominio = "labc1ub-free.com"
if dominio != "labclub.edu":
    print("ALLERTA PHISHING:", dominio)`,
          language: "PYTHON",
          expectedKeyword: "!=",
          quizQuestions: [
            q("Qual è un segnale tipico di phishing?", ["Urgenza estrema e dominio sospetto", "Dominio ufficiale verificato", "Richiesta senza link", "Aggiornamento di sistema locale"], 0, "Gli attaccanti creano panico per farti cliccare senza controllare l'URL."),
            q("Cosa tutela il GDPR in Europa?", ["I dati personali e la privacy dei cittadini", "La velocità della RAM", "I prezzi delle GPU", "I font open source"], 0, "Regolamento generale sulla protezione dei dati."),
            q("Cos'è il principio del privilegio minimo?", ["Concedere solo i permessi strettamente necessari", "Dare accesso admin a tutti", "Disattivare i log", "Pubblicare chiavi API"], 0, "Riduce la superficie d'attacco."),
            q("Cos'è il typosquatting?", ["Registrare domini simili a quelli famosi con errori di battitura", "Scrivere velocemente", "Un linguaggio web", "Un algoritmo di ordinamento"], 0, "Es. g00gle.com invece di google.com."),
            q("Prima di concedere permessi a un'app bisogna:", ["Verificare se siano davvero necessari per la funzione", "Accettare tutto senza leggere", "Condividere i contatti sempre", "Disattivare lo schermo"], 0, "Minimizzazione dei permessi.")
          ]
        },
        {
          id: "lesson_5_3",
          courseId: "course_5",
          orderIndex: 3,
          title: "Fake News, Deepfake & Etica dell'IA",
          durationMinutes: 17,
          videoUrl: "https://www.youtube.com/watch?v=cSKGa_7XJkg",
          pdfUrl: "https://digital-strategy.ec.europa.eu",
          description: "Verifica le fonti online, riconosci bias algoritmici e deepfake, e progetta tecnologia etica e trasparente.",
          topicTag: "Etica IA e Fake News",
          codePrompt: "Crea in Python una checklist automatica di 3 verifiche prima di condividere una notizia.",
          codeStarter: `verifiche = ["Fonte autorevole?", "Data recente?", "Conferme incrociate?"]
for v in verifiche:
    print("[CHECK]", v)`,
          language: "PYTHON",
          expectedKeyword: "verifiche",
          quizQuestions: [
            q("Come verificare una notizia sospetta?", ["Controllare autore, data e fonti primarie indipendenti", "Guardare solo il titolo shock", "Condividerla subito", "Leggere solo i commenti"], 0, "Il fact-checking incrociato smaschera la disinformazione."),
            q("Cos'è un bias algoritmico?", ["Un pregiudizio nei risultati dovuto a dati storici sbilanciati", "Un virus hardware", "Una batteria difettosa", "Un tema grafico"], 0, "I dati distorti producono decisioni distorte."),
            q("Cos'è un deepfake?", ["Audio o video sintetico realistico generato con IA", "Un database profondo", "Un errore SQL", "Un router veloce"], 0, "Richiede spirito critico e verifica delle fonti."),
            q("Perché serve trasparenza nei sistemi IA?", ["Per capire limiti, responsabilità e provenienza dei contenuti", "Per nascondere i bug", "Per consumare più banda", "Per evitare la crittografia"], 0, "L'AI Act europeo promuove trasparenza e sicurezza."),
            q("Chi è responsabile delle decisioni critiche assistite dall'IA?", ["L'essere umano che supervisiona", "Solo la scheda video", "Il cavo di rete", "Nessuno"], 0, "Human-in-the-loop garantisce responsabilità etica.")
          ]
        }
      ]
    }
  ];

  App.content = App.content || {};
  App.content.courses = courses;
})(window.App = window.App || {});

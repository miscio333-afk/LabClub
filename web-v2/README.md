# LabClub — web app

> Questa è la sorgente pubblicata su GitHub Pages.
> La V1 storica resta in `web/` e non viene più aggiornata.

Versione statica dell'app Android: **nessun login, nessun Firebase, nessun build step**.
Si apre con un doppio clic su `index.html`, oppure con un qualsiasi server statico.

## Avvio locale

```bash
cd web-v2
python3 -m http.server 4174
# apri http://localhost:4174
```

Per il service worker (offline/PWA) serve `http://localhost` o HTTPS: da `file://` l'app funziona
lo stesso, ma senza cache offline e con `localStorage` che alcuni browser limitano.

## Struttura

```
web-v2/
├── index.html            # shell, topbar, tab bar
├── manifest.webmanifest  # PWA
├── sw.js                 # cache offline
├── css/
│   ├── tokens.css        # palette e tipografia
│   ├── base.css          # reset, layout, tab bar
│   ├── components.css    # bottoni, card, quiz, sheet...
│   ├── screens.css       # stili delle singole schermate
│   └── lesson.css        # capitoli, prosa, laboratori e widget
├── content/
│   ├── base-course.js    # Corso Base: 12 lezioni native
│   ├── courses.js        # composizione dei 4 corsi (Base + 3)
│   ├── drops.js          # 3 drop con offset in giorni
│   ├── badges.js         # badge e condizioni
│   └── hints.js          # 3 indizi per lezione + glossario errori
├── js/
│   ├── python.js         # interprete Python Lite (max 2000 passi)
│   ├── store.js          # stato locale, punti, timbri, export/import
│   ├── ui.js             # helper UI, sheet, toast, confetti
│   ├── app.js            # hash router e shell
│   ├── widgets/          # 12 laboratori interattivi + registry
│   └── views/            # una funzione per schermata
└── assets/               # font, immagini, video, icone
```

## Corsi

| Corso | Lezioni | Contenuti |
| --- | --- | --- |
| **Corso Base** (`course_base`) | 12 | Von Neumann, binario, compilatori, algoritmi, variabili, condizioni, cicli, funzioni, liste, stringhe, validazione, debug |
| **Web & App** (`course_3`) | 3 | HTML/CSS, JavaScript/DOM, Android/Firebase |
| **Dati e IA** (`course_4`) | 3 | Dati, machine learning, IA generativa |
| **Sicurezza Digitale** (`course_5`) | 3 | Password, phishing, privacy, fake news |

Totale: **21 lezioni** e **69 domande** di quiz.

Il Corso Base sostituisce i vecchi corsi Fondamenti e Programmazione. Gli ID di Web & App,
Dati e IA e Sicurezza restano invariati per non perdere i progressi già salvati.

## Formato di una lezione base

Ogni lezione in `content/base-course.js` contiene:

- `chapters`: 2 capitoli di testo con prosa, esempi di codice, tabelle e callout;
- `lab`: titolo, descrizione e nome del widget da montare;
- `keyPoints`: 3 punti chiave;
- `codePrompt` e `codeStarter`: esercizio Python con obiettivo verificabile;
- `expectedKeyword`: parola o output che sblocca l'obiettivo del codice;
- `quizQuestions`: 2 domande con opzioni, risposta corretta e spiegazione.

La lezione si completa dopo aver risposto a **entrambe** le domande del quiz: assegna
**+10 PT** e **+1 timbro** (massimo 10 timbri).

## Aggiungere o modificare un laboratorio

1. Aggiungi la lezione in `content/base-course.js` con `lab.widget` impostato al nome del widget.
2. Crea `js/widgets/nome.js` e registralo con `App.widgets.register("nome", function (mount) { ... })`.
3. Carica lo script in `index.html` dopo `js/widgets/registry.js`.
4. Aggiungi script e `css/lesson.css` alla lista `ASSETS` di `sw.js`.
5. Incrementa `CACHE_VERSION` in `sw.js`.

I widget possono usare `App.ui.esc()` per il testo e devono restituire una funzione di cleanup
(anche vuota) quando la vista viene smontata.

## Python Lite

L'interprete in `js/python.js` supporta:

- variabili, `int`, `float`, `str`, `bool`, liste e f-string;
- `if` / `elif` / `else`, `for`, `while`, `break`, `continue`, `pass`;
- `def` / `return` con parametri, scope locale e ricorsione (max 50 chiamate annidate);
- indici negativi, slicing di stringhe e liste (`[1:3]`, `[::-1]`, `[-2:]`);
- metodi `append`, `upper`, `lower`, `strip`, `isdigit`, `replace`;
- built-in `range`, `len`, `str`, `int`, `float`, `sum`, `min`, `max`, `abs`, `round`, `ord`, `chr`.

I numeri float sono distinti dagli interi nella stampa: `7 / 2` produce `3.5`, `24 / 3` produce `8.0`.
`input()` non è disponibile nella sandbox: le lezioni simulano il valore con una stringa.

## Modificare i contenuti

Tutto è nelle costanti dentro `content/`. Nessun database, nessun JSON da scaricare.

- **Corsi e quiz**: `content/base-course.js` per il Corso Base, `content/courses.js` per gli altri.
  Ogni lezione ha `quizQuestions` con `question`, `options`, `correctIndex` ed `explanation`.
- **Indizi**: `content/hints.js`, chiave = id della lezione. Le tre frasi e la soluzione
  sono testi statici, nessuna AI.
- **Drop**: `content/drops.js`. `offsetDays` è contato da `startedAt`, il primo avvio
  sul dispositivo. Non c'è un server che sblocca nulla.
- **Badge**: `content/badges.js`. Il Corso Base assegna **Base Master** a 12/12 lezioni.

Dopo una modifica ai contenuti, incrementa `CACHE_VERSION` in `sw.js` per evitare cache vecchie.

## Dati e privacy

- Stato in `localStorage`, chiave `labclub.v1`.
- Screenshot portfolio compressi e salvati nello stesso JSON locale (max 8 progetti).
- Export/import JSON dal Profilo (include le immagini).
- Nessuna richiesta di rete a runtime, tranne i link esterni video/documentazione
  che apri tu e il caricamento dei file statici.
- Se `localStorage` è bloccato, l'app usa la memoria della scheda e mostra un avviso.
- Al caricamento e all'import gli ID di lezioni/corsi non più esistenti vengono filtrati.

## Punteggi

- Lezione nuova: **+10 PT** e **+1 timbro** (max 10 timbri).
- Livello: `1 + floor(punti / 30)`, massimo 100.
- Drop: punti indicati nel contenuto; il badge del drop viene assegnato una volta.
- Badge corso: tutte le lezioni del corso completate.
- Super Coder: 10 timbri.
- La lezione si completa solo dopo aver risposto a tutte le domande del quiz.

## Movimento

- **View Transitions** tra le schermate, con fallback slide/fade per i browser che non le supportano.
- **Morph** dalla card del corso alla copertina del dettaglio.
- **Hero**: Ken Burns lento e scanline periodica, solo CSS.
- **Copertina corso e hero lezione**: griglia, alone animato, watermark del numero, sheen e scanline.
- **Card della lezione**: frame SVG con scia sul perimetro, micro-griglia e alone; si accendono allo scroll (e la card Codice alla prima apertura della tab). Con `prefers-reduced-motion` restano cornici statiche.
- **Sottofondo delle card**: due aloni d'accento che si spostano lentamente, griglia viva, watermark flottante e un passaggio di luce diagonale ogni ~29s, sfasati per card.
- **Timbro**: colpo del timbro alla prima lezione completata, con confetti e vibrazione.
- **Capitoli**: entrata allo scroll con IntersectionObserver.
- **Intro con avatar**: due capitoli del Corso Base hanno un video full-bleed con voce,
  poster, barra di avanzamento e pulsante Ascolta. L'audio parte solo al click, si mette
  in pausa al cambio tab e rispetta `prefers-reduced-motion` e Save-Data.

Tutte le animazioni rispettano `prefers-reduced-motion`. Per ridurle o disattivarle,
agisci sulle durate in `css/base.css`, `css/screens.css`, `css/components.css` e `css/lesson.css`.

## Deploy

È un sito statico: puoi copiare `web-v2/` su GitHub Pages, Netlify, Cloudflare Pages o
qualsiasi host statico. Se pubblichi in una sottocartella, i percorsi relativi continuano
a funzionare.

Il repository pubblico usa GitHub Actions: ogni push su `main` carica questa cartella su
GitHub Pages. Workflow: `.github/workflows/pages.yml` · URL:
`https://miscio333-afk.github.io/LabClub/`.

I materiali sorgente (video avatar originali, immagini `_gen` e clip non usate) restano
fuori dal repository pubblico tramite `.gitignore`.

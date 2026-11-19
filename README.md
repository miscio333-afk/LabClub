# LabClub

**Impara. Crea. Domina.**

Web app statica per imparare informatica e Python con lezioni interattive, quiz e laboratori nel browser.
Nessun login, nessun database, nessun build step: solo HTML, CSS e JavaScript.

[Demo live](https://miscio333-afk.github.io/LabClub/) ·
[Deploy](https://github.com/miscio333-afk/LabClub/actions/workflows/pages.yml) ·
[Licenza MIT](LICENSE)

[![Deploy GitHub Pages](https://github.com/miscio333-afk/LabClub/actions/workflows/pages.yml/badge.svg)](https://github.com/miscio333-afk/LabClub/actions/workflows/pages.yml)

## Cosa contiene

- **4 corsi, 21 lezioni, 69 domande di quiz**
- **Corso Base** con 12 lezioni: Von Neumann, rappresentazione binaria, compilatori vs interpreti,
  algoritmi e flowchart, variabili e tipi, condizioni, cicli, funzioni, liste, stringhe,
  input e validazione, debug.
- **Web & App**, **Dati e IA**, **Sicurezza Digitale** con 3 lezioni ciascuno.
- **12 laboratori interattivi**, uno per lezione del Corso Base: schema della macchina,
  8 lampadine binarie, compilatore, flowchart, scatole delle variabili, gate if/else,
  tracer dei cicli, macchina delle funzioni, lista dei voti, selettore di stringhe,
  form di validazione e debugger passo-passo.
- **Python Lite** nel browser: variabili, condizioni, cicli, funzioni, liste, stringhe,
  slicing, float e ricorsione, con output e verifica dell'esercizio.
- **PWA offline**: service worker e cache locale; l'app si apre anche senza rete.
- **Progressi locali**: punti, timbri, badge, quiz e portfolio salvati in `localStorage`.
- **Mobile-first**: layout verificato da 320px in su.
- **Zero servizi esterni a runtime**: niente login, Firebase, AI o API.

## Avvio locale

Serve solo un server statico:

```bash
cd web
python3 -m http.server 4173
```

Apri `http://localhost:4173`. Da `file://` l'app funziona, ma senza service worker e con
le limitazioni di `localStorage` di alcuni browser.

## Deploy

Il repository pubblica la sola cartella `web/` tramite GitHub Actions.

- Workflow: `.github/workflows/pages.yml`
- Sorgente Pages: **GitHub Actions**
- URL: `https://miscio333-afk.github.io/LabClub/`

Ogni push su `main` aggiorna il sito. Dopo una modifica ai file della web app,
incrementa `CACHE_VERSION` in `web/sw.js` per forzare il refresh della cache PWA.

## Struttura

```
web/
├── index.html            # shell, topbar, tab bar
├── manifest.webmanifest  # PWA
├── sw.js                 # cache offline
├── css/                  # palette, componenti, schermate, lezioni
├── content/              # corsi, quiz, indizi, drop e badge
├── js/
│   ├── python.js         # interprete Python Lite
│   ├── store.js          # stato locale, punti, export/import
│   ├── app.js            # hash router e shell
│   ├── widgets/          # 12 laboratori interattivi
│   └── views/            # una funzione per schermata
└── assets/               # font, immagini e icone
```

Dettagli su contenuti, formato delle lezioni e come aggiungere un laboratorio in
[`web/README.md`](web/README.md).

## Dati e privacy

- Stato salvato solo nel browser, chiave `labclub.v1`.
- Nessun account e nessuna richiesta a server applicativi.
- Export/import JSON dal Profilo, immagini del portfolio comprese.
- Al caricamento e all'import gli ID di lezioni o corsi rimossi vengono filtrati.

## Contenuti e crediti

I testi del Corso Base sono adattati dalle lezioni interattive del
**Prof. Michel Formento** e restano attribuiti al loro autore.

Il progetto Android di riferimento non fa parte di questo repository pubblico.

## Licenza

Il codice della web app è distribuito con licenza **MIT**. Vedi [`LICENSE`](LICENSE).

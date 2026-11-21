/* LabClub — tutor statico: 3 indizi progressivi per lezione + glossario errori.
 * Nessuna chiamata di rete, nessuna chiave API.
 */
(function (App) {
  "use strict";

  App.content = App.content || {};
  App.content.hints = {
    lesson_base_01: {
      topic: "Architettura di Von Neumann",
      hints: [
        "La RAM contiene sia i dati sia le istruzioni del programma in esecuzione; è veloce ma volatile.",
        "La CPU ripete tre fasi: fetch (preleva), decode (decodifica), execute (esegue).",
        "Per l'esercizio scorri la lista delle fasi con un for e stampa ogni passo."
      ],
      solution: `passi = ["fetch", "decode", "execute"]
for passo in passi:
    print("Ciclo:", passo)`
    },
    lesson_base_02: {
      topic: "Rappresentazione binaria",
      hints: [
        "I pesi di un byte sono 128, 64, 32, 16, 8, 4, 2, 1: somma quelli accesi.",
        "2^8 = 256 combinazioni, da 0 a 255. La lettera A è 65 = 01000001.",
        "Per convertire in binario usa n % 2 per il resto e n // 2 per dimezzare."
      ],
      solution: `n = 13
bits = ""
while n > 0:
    bits = str(n % 2) + bits
    n = n // 2
print("13 in binario:", bits)`
    },
    lesson_base_03: {
      topic: "Compilatori vs interpreti",
      hints: [
        "Il compilatore traduce tutto prima e genera un eseguibile; l'interprete esegue riga per riga.",
        "Con un errore di sintassi alla riga 3, il compilatore blocca tutto; l'interprete esegue le righe 1 e 2 e poi si ferma.",
        "Simula l'interprete con un ciclo che stampa le righe valide e fa break sulla riga rotta."
      ],
      solution: `modalita = "interprete"
righe = ["Ciao", "Mondo", "print("]
for riga in righe:
    if riga == "print(":
        print("Errore di sintassi alla riga 3")
        break
    print(riga)`
    },
    lesson_base_04: {
      topic: "Algoritmi e flowchart",
      hints: [
        "Un algoritmo deve essere finito, non ambiguo ed efficace.",
        "Nel flowchart: ovale = inizio/fine, rettangolo = operazione, rombo = decisione, parallelogramma = input/output.",
        "La media è la somma divisa per il numero di valori: (a + b + c) / 3."
      ],
      solution: `a = 7
b = 8
c = 6
media = (a + b + c) / 3
print("Media:", media)`
    },
    lesson_base_05: {
      topic: "Variabili e tipi",
      hints: [
        "int = numeri interi, float = numeri con la virgola, str = testo, bool = True/False.",
        "= assegna un valore, == confronta. Il CAP è una stringa perché non è una quantità.",
        "Per stampare più variabili in una frase usa una f-string: f\"{nome} ha {età} anni\"."
      ],
      solution: `nome = "Luca"
età = 15
media = 7.5
print(f"{nome} ha {età} anni, media {media}")`
    },
    lesson_base_06: {
      topic: "Condizioni e scelte",
      hints: [
        "and vuole entrambe le condizioni vere; or ne basta una; not inverte il risultato.",
        "Confronta con >= e usa == per l'uguaglianza: = invece assegna.",
        "Per ottenere «Entra» servono età almeno 18 e biglietto True."
      ],
      solution: `età = 18
biglietto = True

if età >= 18 and biglietto:
    print("Entra")
else:
    print("Resta fuori")`
    },
    lesson_base_07: {
      topic: "Cicli while e for",
      hints: [
        "Un ciclo ha quattro pezzi: inizializzazione, condizione, corpo e aggiornamento.",
        "range(1, 6) produce 1, 2, 3, 4, 5: l'estremo finale è escluso.",
        "Senza i = i + 1 la condizione del while resta vera e il ciclo non termina mai."
      ],
      solution: `i = 1
while i <= 5:
    print("Bicchiere", i)
    i = i + 1`
    },
    lesson_base_08: {
      topic: "Funzioni",
      hints: [
        "Una funzione si definisce con def nome(parametri): e restituisce un valore con return.",
        "I parametri sono gli ingressi; gli argomenti sono i valori concreti passati nella chiamata.",
        "Per correggere doppio, return deve moltiplicare n per 2, non sommargli 2."
      ],
      solution: `def doppio(n):
    return n * 2

print(doppio(5))`
    },
    lesson_base_09: {
      topic: "Liste e array",
      hints: [
        "Il primo indice è 0; con len(voti) elementi l'ultimo indice valido è len(voti) - 1.",
        "append() aggiunge in coda; le parentesi quadre leggono o modificano una posizione.",
        "Per la media somma tutti i voti con un ciclo e dividi per len(voti)."
      ],
      solution: `voti = [7, 8, 6]
voti.append(9)
totale = 0
for v in voti:
    totale = totale + v
media = totale / len(voti)
print("Media:", media)`
    },
    lesson_base_10: {
      topic: "Stringhe",
      hints: [
        "Le stringhe si leggono per indice, partendo da 0: parola[0] è il primo carattere.",
        "Lo slice parola[1:3] include l'indice 1 ed esclude il 3: restano due caratteri.",
        "Le stringhe sono immutabili: per cambiarle devi creare una nuova stringa con + o uno slice."
      ],
      solution: `parola = "CIAO"
print("Lunghezza:", len(parola))
print("Slice:", parola[1:3])
print("Maiuscolo:", parola.upper())`
    },
    lesson_base_11: {
      topic: "Input e validazione",
      hints: [
        "input() restituisce sempre una stringa, anche quando l'utente digita cifre.",
        "Controlla il testo con isdigit() prima di convertire con int(), altrimenti rischi ValueError.",
        "Dopo la conversione verifica l'intervallo: per un'età accetta 0–120."
      ],
      solution: `età = "17"
if età == "":
    print("Vuoto")
elif not età.isdigit():
    print("Non è un numero")
else:
    numero = int(età)
    if numero < 0 or numero > 120:
        print("Fuori intervallo")
    else:
        print("Valido")`
    },
    lesson_base_12: {
      topic: "Debug",
      hints: [
        "Sintassi = non parte, runtime = crash, logico = gira ma sbaglia in silenzio.",
        "Se somma passa da 0 a 6, poi a 8, poi a 10, la riga dentro il ciclo la sta sovrascrivendo.",
        "Per accumulare usa somma = somma + n (oppure somma += n) dentro il ciclo."
      ],
      solution: `voti = [6, 8, 10]
somma = 0
for n in voti:
    somma = somma + n
media = somma / len(voti)
print("Media:", media)`
    },
    lesson_3_1: {
      topic: "HTML e CSS",
      hints: [
        "HTML descrive la struttura, CSS l'aspetto. Il contenuto visibile sta dentro <body>.",
        "Le classi si selezionano con il punto, gli id con il cancelletto.",
        "Per il titolo usa <h1>; per il colore del testo usa la proprietà color."
      ],
      solution: `<div style="background:#0A0A0A;color:#00FF88;padding:16px;border:2px solid #A100FF;font-family:sans-serif">
  <h1>LABCLUB DROP</h1>
  <p>Edizione limitata Web.</p>
</div>`
    },
    lesson_3_2: {
      topic: "JavaScript",
      hints: [
        "Il DOM è l'albero degli elementi: JS lo legge e lo modifica dopo il caricamento.",
        "getElementById seleziona un elemento; addEventListener collega un evento a una funzione.",
        "console.log scrive nella console del browser; nel Lab la vedi sotto l'anteprima."
      ],
      solution: `<h2 id="msg" style="color:#00FF88">Caricamento...</h2>
<script>
  document.getElementById('msg').innerText = 'LabClub JS Ready!';
  console.log('LabClub JS Ready');
</script>`
    },
    lesson_3_3: {
      topic: "Android e Firebase",
      hints: [
        "Compose è dichiarativo: descrivi la UI con funzioni @Composable.",
        "Il ViewModel conserva lo stato e sopravvive alle rotazioni; la UI osserva lo StateFlow.",
        "Per l'esercizio serializza l'oggetto con JSON.stringify e stampalo nella console."
      ],
      solution: `<pre id="doc" style="color:#00FF88"></pre>
<script>
  const student = { nome: 'Crew', punti: 100 };
  document.getElementById('doc').innerText = JSON.stringify(student, null, 2);
  console.log('Synced:', student.punti);
</script>`
    },
    lesson_4_1: {
      topic: "Database e SQL",
      hints: [
        "La forma base è: SELECT colonne FROM tabella WHERE condizione ORDER BY colonna.",
        "La primary key identifica ogni riga in modo univoco.",
        "In Python simula il filtro con un ciclo e un if su p >= 80."
      ],
      solution: `punti = [65, 92, 84, 50]
for p in punti:
    if p >= 80:
        print("Top score:", p)`
    },
    lesson_4_2: {
      topic: "Fondamenti IA",
      hints: [
        "Training set = esempi per apprendere; test set = verifica su dati nuovi.",
        "Overfitting: ottimo sui dati visti, scarso sui dati nuovi.",
        "Per la regola: if confidenza >= 0.8 stampa ALTO, altrimenti BASSO."
      ],
      solution: `confidenza = 0.91
if confidenza >= 0.8:
    print("Predizione: ALTO")
else:
    print("Predizione: BASSO")`
    },
    lesson_4_3: {
      topic: "Prompt Engineering",
      hints: [
        "Un buon prompt contiene ruolo, contesto, compito, vincoli e formato dell'output.",
        "Few-shot significa includere pochi esempi input/output nel prompt.",
        "La f-string unisce testo e variabili: f\"[{ruolo}] -> {task}\"."
      ],
      solution: `ruolo = "Senior Mentor"
task = "Spiega i cicli con 3 indizi"
print(f"[{ruolo}] -> {task}")`
    },
    lesson_5_1: {
      topic: "Password e 2FA",
      hints: [
        "Lunghezza e unicità contano più dei simboli esotici.",
        "L'hashing è irreversibile: il server salva l'impronta, non la password.",
        "Per il controllo usa len(pw) >= 12."
      ],
      solution: `pw = "LabClub#Neon2026"
if len(pw) >= 12:
    print("Password robusta!")
else:
    print("Troppo corta")`
    },
    lesson_5_2: {
      topic: "Phishing e Privacy",
      hints: [
        "Guarda il dominio esatto, non il testo del link: labc1ub non è labclub.",
        "L'urgenza è una leva emotiva: fermati e verifica la fonte.",
        "In Python il diverso si scrive !=."
      ],
      solution: `dominio = "labc1ub-free.com"
if dominio != "labclub.edu":
    print("ALLERTA PHISHING:", dominio)`
    },
    lesson_5_3: {
      topic: "Etica IA e Fake News",
      hints: [
        "Prima di condividere: fonte, data e conferme indipendenti.",
        "Un bias algoritmico nasce da dati sbilanciati, non dalla volontà del modello.",
        "Per la checklist usa una lista di stringhe e un ciclo for."
      ],
      solution: `verifiche = ["Fonte autorevole?", "Data recente?", "Conferme incrociate?"]
for v in verifiche:
    print("[CHECK]", v)`
    }
  };

  App.content.errors = [
    {
      name: "NameError",
      cause: "Hai usato un nome che non esiste: variabile mai creata o errore di battitura.",
      fix: "Crea la variabile prima di usarla e controlla maiuscole e minuscole.",
      example: "print(nome)  # nome non è definito"
    },
    {
      name: "SyntaxError",
      cause: "Manca qualcosa nella sintassi: due punti, una parentesi o una virgoletta.",
      fix: "Controlla la riga indicata: i blocchi if/for/while finiscono con :.",
      example: "if x > 3  # manca il :"
    },
    {
      name: "IndentationError",
      cause: "Il rientro del blocco non è coerente.",
      fix: "Usa sempre 4 spazi per lo stesso livello, mai tab e spazi mescolati.",
      example: "if x > 3:\n  print('ok')  # 2 spazi, poi 4: incoerente"
    },
    {
      name: "TypeError",
      cause: "Stai combinando tipi incompatibili, per esempio numero e stringa.",
      fix: "Converti esplicitamente con str() o int().",
      example: "print('Punti: ' + 10)  # usa str(10)"
    },
    {
      name: "IndexError",
      cause: "L'indice è fuori dalla lista.",
      fix: "Ricorda che si parte da 0: l'ultimo indice è len(lista) - 1.",
      example: "lista = [1, 2]\nprint(lista[2])  # fuori range"
    },
    {
      name: "ZeroDivisionError",
      cause: "Stai dividendo per zero.",
      fix: "Controlla il divisore prima di dividere.",
      example: "print(10 / 0)"
    },
    {
      name: "ValueError",
      cause: "La conversione non è possibile con quel valore.",
      fix: "Verifica che la stringa contenga davvero un numero.",
      example: "int('abc')"
    }
  ];
})(window.App = window.App || {});

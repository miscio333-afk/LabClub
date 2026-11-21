/* LabClub — drops e sfide settimanali.
 * offsetDays = giorni dall'inizio dell'app sul dispositivo.
 * Il drop si sblocca da solo, senza server.
 */
(function (App) {
  "use strict";

  App.content = App.content || {};
  App.content.drops = [
    {
      id: "challenge_drop_01",
      title: "Neon FizzBuzz Turbo",
      tag: "DROP #01",
      description: "Scrivi uno script Python che stampa i numeri da 1 a 30 sostituendo i multipli di 3 con 'LAB', i multipli di 5 con 'CLUB' e i multipli di entrambi con 'LABCLUB'.",
      difficulty: "EASY",
      rewardPoints: 50,
      rewardBadge: "Debug Master",
      image: "assets/img/drops/drop-01.webp",
      offsetDays: 0,
      hint: "Controlla prima i multipli di 15: sono quelli che soddisfano entrambe le condizioni."
    },
    {
      id: "challenge_drop_02",
      title: "Streetwear Landing Hero",
      tag: "DROP #02",
      description: "Progetta una card promozionale HTML/CSS con sfondo nero #0A0A0A, bordo neon #00FF88 e animazione hover sul pulsante di acquisto.",
      difficulty: "MEDIUM",
      rewardPoints: 80,
      rewardBadge: "Web Creator",
      image: "assets/img/drops/drop-02.webp",
      offsetDays: 2,
      hint: "Parti da un div con padding e border, poi aggiungi transition e transform: translateY(-2px) sull'hover."
    },
    {
      id: "challenge_drop_03",
      title: "Anti-Phishing Scanner",
      tag: "DROP #03",
      description: "Costruisci una funzione Python che analizza una lista di URL sospetti e classifica i domini sicuri rispetto ai tentativi di typosquatting.",
      difficulty: "HARD",
      rewardPoints: 120,
      rewardBadge: "Security Pro",
      image: "assets/img/drops/drop-03.webp",
      offsetDays: 6,
      hint: "Confronta il dominio con quello ufficiale: lunghezza, caratteri sostituiti (0/O, 1/l) e sottodomini ingannevoli."
    }
  ];
})(window.App = window.App || {});

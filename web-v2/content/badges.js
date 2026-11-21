/* LabClub — badge e regole di sblocco. */
(function (App) {
  "use strict";

  App.content = App.content || {};
  App.content.badges = [
    {
      name: "Base Master",
      icon: "🧠",
      image: "assets/img/badges/base-master.webp",
      courseId: "course_base",
      description: "Completa tutte le 12 lezioni del Corso Base."
    },
    {
      name: "Web Creator",
      icon: "🌐",
      image: "assets/img/badges/web-creator.webp",
      courseId: "course_3",
      description: "Completa tutte le lezioni del corso Web & App."
    },
    {
      name: "AI Expert",
      icon: "🤖",
      image: "assets/img/badges/ai-expert.webp",
      courseId: "course_4",
      description: "Completa tutte le lezioni del corso Dati e IA."
    },
    {
      name: "Security Pro",
      icon: "🛡️",
      image: "assets/img/badges/security-pro.webp",
      courseId: "course_5",
      description: "Completa tutte le lezioni del corso Sicurezza Digitale."
    },
    {
      name: "Super Coder",
      icon: "⚡",
      image: "assets/img/badges/super-coder.webp",
      stamps: 10,
      description: "Colleziona 10 timbri sulla stamp card."
    }
  ];
})(window.App = window.App || {});

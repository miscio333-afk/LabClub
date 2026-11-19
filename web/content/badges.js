/* LabClub — badge e regole di sblocco. */
(function (App) {
  "use strict";

  App.content = App.content || {};
  App.content.badges = [
    {
      name: "Base Master",
      icon: "🧠",
      courseId: "course_base",
      description: "Completa tutte le 12 lezioni del Corso Base."
    },
    {
      name: "Web Creator",
      icon: "🌐",
      courseId: "course_3",
      description: "Completa tutte le lezioni del corso Web & App."
    },
    {
      name: "AI Expert",
      icon: "🤖",
      courseId: "course_4",
      description: "Completa tutte le lezioni del corso Dati e IA."
    },
    {
      name: "Security Pro",
      icon: "🛡️",
      courseId: "course_5",
      description: "Completa tutte le lezioni del corso Sicurezza Digitale."
    },
    {
      name: "Super Coder",
      icon: "⚡",
      stamps: 10,
      description: "Colleziona 10 timbri sulla stamp card."
    }
  ];
})(window.App = window.App || {});

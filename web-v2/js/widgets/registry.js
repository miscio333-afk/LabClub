/* LabClub — registro dei laboratori interattivi.
 * Ogni widget è una funzione (mount) => cleanup.
 */
(function (App) {
  "use strict";

  const registry = Object.create(null);

  App.widgets = {
    register(name, factory) {
      registry[name] = factory;
    },
    mount(name, el) {
      if (!el) return function () {};
      const factory = registry[name];
      if (!factory) {
        el.innerHTML = '<p class="w-empty">Laboratorio non disponibile.</p>';
        return function () {};
      }
      el.innerHTML = "";
      try {
        return factory(el) || function () {};
      } catch (err) {
        el.innerHTML =
          '<p class="w-empty">Il laboratorio non è riuscito a partire. Ricarica la pagina.</p>';
        return function () {};
      }
    }
  };
})(window.App = window.App || {});

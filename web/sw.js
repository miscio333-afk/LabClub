/* LabClub — service worker.
 * Network-first: online prende sempre la versione fresca, offline usa la cache.
 * Cambia CACHE_VERSION quando aggiorni i file per forzare il refresh.
 */
const CACHE_VERSION = "labclub-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./css/screens.css",
  "./css/lesson.css",
  "./js/python.js",
  "./js/store.js",
  "./js/ui.js",
  "./js/widgets/registry.js",
  "./js/widgets/von-neumann.js",
  "./js/widgets/binary.js",
  "./js/widgets/compilers.js",
  "./js/widgets/flowchart.js",
  "./js/widgets/variables.js",
  "./js/widgets/conditions.js",
  "./js/widgets/loops.js",
  "./js/widgets/functions.js",
  "./js/widgets/lists.js",
  "./js/widgets/strings.js",
  "./js/widgets/validation.js",
  "./js/widgets/debug.js",
  "./js/app.js",
  "./js/views/home.js",
  "./js/views/courses.js",
  "./js/views/lesson.js",
  "./js/views/drops.js",
  "./js/views/hints.js",
  "./js/views/lab.js",
  "./js/views/profile.js",
  "./js/views/portfolio.js",
  "./content/base-course.js",
  "./content/courses.js",
  "./content/drops.js",
  "./content/badges.js",
  "./content/hints.js",
  "./assets/fonts/space_grotesk.ttf",
  "./assets/fonts/plus_jakarta_sans.ttf",
  "./assets/fonts/jetbrains_mono.ttf",
  "./assets/img/hero.jpg",
  "./assets/img/logo.jpg",
  "./assets/img/drop-banner.jpg",
  "./assets/img/super-coder.jpg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(function (cache) {
        return cache.addAll(ASSETS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key !== CACHE_VERSION;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then(function (response) {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request).then(function (cached) {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("./index.html");
          return new Response("Offline", {
            status: 503,
            statusText: "Offline",
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        });
      })
  );
});

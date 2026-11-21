/* LabClub — service worker.
 * Network-first: online prende sempre la versione fresca, offline usa la cache.
 * Cambia CACHE_VERSION quando aggiorni i file per forzare il refresh.
 */
const CACHE_VERSION = "labclub-v2-16";
const CACHE_PREFIX = "labclub-v2-";
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
  "./assets/img/hero-001-poster.webp",
  "./assets/img/logo.jpg",
  "./assets/img/drop-banner.jpg",
  "./assets/img/super-coder.jpg",
  "./assets/video/hero-001-loop.mp4",
  "./assets/video/aria-001.mp4",
  "./assets/video/aria-002.mp4",
  "./assets/img/lessons/aria-001-poster.webp",
  "./assets/img/lessons/aria-002-poster.webp",
  "./assets/img/courses/base.webp",
  "./assets/img/courses/web.webp",
  "./assets/img/courses/ai.webp",
  "./assets/img/courses/security.webp",
  "./assets/img/drops/drop-01.webp",
  "./assets/img/drops/drop-02.webp",
  "./assets/img/drops/drop-03.webp",
  "./assets/img/badges/base-master.webp",
  "./assets/img/badges/web-creator.webp",
  "./assets/img/badges/ai-expert.webp",
  "./assets/img/badges/security-pro.webp",
  "./assets/img/badges/super-coder.webp",
  "./assets/img/avatars/cyber-neon.webp",
  "./assets/img/avatars/hoodie-purple.webp",
  "./assets/img/avatars/glitch-bot.webp",
  "./assets/img/avatars/arcade-volt.webp",
  "./assets/img/lessons/hardware.webp",
  "./assets/img/lessons/binary.webp",
  "./assets/img/lessons/algorithms.webp",
  "./assets/img/lessons/code.webp",
  "./assets/img/lessons/data.webp",
  "./assets/img/lessons/security.webp",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/svg/architettura-von-neumann-full-ok.svg",
  "./assets/svg/bus_pcie_cyberpunk.svg",
  "./assets/svg/componenti_hardware_cyberpunk.svg",
  "./assets/svg/cpu_vs_gpu_cyberpunk.svg",
  "./assets/svg/gerarchia-delle-memorie.svg",
  "./assets/svg/hardware-vs-software(7).svg",
  "./assets/svg/ram-vs-rom-vs-cache.svg",
  "./assets/svg/scala-unita-informatiche(2).svg",
  "./assets/svg/scheda_madre_cyberpunk.svg",
  "./assets/svg/software-sistema-vs-applicativo.svg",
  "./assets/svg/ssd_vs_hdd_cyberpunk.svg"
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
              return key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_VERSION;
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

  // Video: cache-first, così non li riscarica a ogni visita e funzionano offline.
  if (url.pathname.indexOf("/assets/video/") !== -1) {
    event.respondWith(
      caches.match(request, { ignoreVary: true }).then(function (cached) {
        return cached || fetch(request);
      })
    );
    return;
  }

  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then(function (response) {
        if (response && response.ok && response.status !== 206) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(request, { ignoreVary: true }).then(function (cached) {
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

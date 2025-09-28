const CACHE_NAME = "gratiday-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/app/css/index.css",
  "/app/js/index.js"
];

// Instala o SW e guarda arquivos em cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Pega arquivos do cache quando offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

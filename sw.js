// Versão do cache (mude toda vez que atualizar algo)
const CACHE_VERSION = "gratiday-cache-v2";
const CACHE_FILES = [
  "/",
  "/index.html",
  "/app/css/index.css",
  "/app/js/index.js"
];

// Instala e salva os arquivos em cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting(); // força ativação imediata
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_VERSION) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // assume controle imediatamente
});

// Intercepta requests e usa cache primeiro, depois fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

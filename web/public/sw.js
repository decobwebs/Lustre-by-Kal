/* Lustre by Kal service worker.
 * Pages: network first, so prices and contents are never stale; the last copy is kept for offline use.
 * Build assets and icons: cache first (their file names change on every deploy).
 * Optimised images: served from cache, refreshed in the background.
 * Form submissions and /api are never touched.
 */
const VERSION = "lbk-v1";
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const IMAGES = `${VERSION}-images`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(PAGES);
            cache.put(request, response.clone());
            trim(PAGES, 40);
          }
          return response;
        } catch {
          return (await caches.match(request)) || (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) (await caches.open(ASSETS)).put(request, response.clone());
        return response;
      })(),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGES);
        const cached = await cache.match(request);
        const refresh = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
              trim(IMAGES, 120);
            }
            return response;
          })
          .catch(() => cached);
        return cached || refresh;
      })(),
    );
  }
});

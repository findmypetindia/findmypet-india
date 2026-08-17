const CACHE_NAME = "findmypet-india-shell-v12";
const APP_SHELL = [
  "/manifest.webmanifest",
  "/images/pwa-icon.svg",
  "/css/style.css",
  "/css/navbar.css",
  "/css/footer.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) return;

  // Never serve stale HTML/navigation pages from the old PWA cache.
  if (
    event.request.mode === "navigate" ||
    requestUrl.pathname === "/" ||
    requestUrl.pathname.endsWith(".html")
  ) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        return caches.match(event.request);
      })
  );
});

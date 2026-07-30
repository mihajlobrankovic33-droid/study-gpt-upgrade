// Service Worker with separate UI and AI caching
const UI_CACHE = "study-buddy-ui-v3";
const AI_CACHE = "study-buddy-ai-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];
const AI_DOMAINS = ["huggingface.co", "mlc.ai", "webllm", "raw.githubusercontent.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(UI_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== UI_CACHE && k !== AI_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isAIRequest(url) {
  return AI_DOMAINS.some((d) => url.hostname === d || url.hostname.includes(d));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET") return;
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return;

  if (isAIRequest(url)) {
    event.respondWith(
      caches.open(AI_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) {
            fetch(request).then((r) => { if (r.ok) cache.put(request, r.clone()); }).catch(() => {});
            return cached;
          }
          return fetch(request).then((r) => { if (r.ok) cache.put(request, r.clone()); return r; }).catch(() => new Response("AI offline", { status: 503 }));
        })
      )
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).then((r) => {
        if (r.ok) { const c = r.clone(); caches.open(UI_CACHE).then((cache) => cache.put(request, c)); }
        return r;
      }).catch(() =>
        caches.match(request).then((cached) => cached || (request.mode === "navigate" ? caches.match("/index.html") : new Response("Offline", { status: 503 })))
      )
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_AI_CACHE") { caches.delete(AI_CACHE).then(() => event.ports[0]?.postMessage({ success: true })); }
});

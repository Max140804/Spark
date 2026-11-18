const CACHE = "spark-v1";
const PRECACHE = ["/", "/login", "/offline"];
const PUBLIC_PAGES = new Set(PRECACHE);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const isPublicPage =
    request.mode === "navigate" && PUBLIC_PAGES.has(url.pathname);
  const isStaticAsset = url.pathname.startsWith("/_next/static/");
  if (!isPublicPage && !isStaticAsset) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      if (request.mode === "navigate") {
        return (await caches.match("/offline")) || Response.error();
      }
      return Response.error();
    }
  })());
});
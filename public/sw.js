// ─── Property Operations Manager — Service Worker ───────────────────────────
// Strategia:
//  • Static assets (JS/CSS/font/img): CacheFirst — mai cambiati senza nuovo hash
//  • Pagine operative (cleaner/maintenance): NetworkFirst con fallback cache
//  • Tutto il resto: NetworkFirst
//  • Offline fallback: /offline se non c'è niente in cache

const CACHE_VERSION = "v1";
const STATIC_CACHE  = `static-${CACHE_VERSION}`;
const PAGES_CACHE   = `pages-${CACHE_VERSION}`;
const API_CACHE     = `api-${CACHE_VERSION}`;
const OFFLINE_URL   = "/offline";

const STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|gif|webp|ico)(\?.*)?$/;
const OPERATIVE_PAGES   = /^\/(dashboard\/cleaner|dashboard\/maintenance|pulizia\/|manutenzione\/)/;
const API_ROUTES        = /^\/api\//;

// ── Message: skip waiting per aggiornamenti silenziosi ───────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// ── Push: mostra notifica nativa ─────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let payload = { title: "PropOps", body: "Nuova notifica", url: "/dashboard/manager", tag: "propops" };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; }
    catch { payload.body = event.data.text() || payload.body; }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      tag: payload.tag,
      data: { url: payload.url },
    })
  );
});

// ── NotificationClick: apre la pagina giusta ─────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/manager";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── Install: pre-cache shell minima ─────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES_CACHE).then((cache) =>
      cache.addAll([OFFLINE_URL])
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: elimina cache vecchie ─────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, PAGES_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non-HTTP (chrome-extension, ecc.)
  if (!url.protocol.startsWith("http")) return;
  // Ignora richieste POST/PUT (server actions, upload)
  if (request.method !== "GET") return;
  // Ignora richieste cross-origin (Vercel Blob, Prisma, ecc.)
  if (url.origin !== location.origin) return;

  // 1. Asset statici → CacheFirst
  if (STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 2. API → NetworkFirst (breve timeout, poi cache)
  if (API_ROUTES.test(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE, 4000));
    return;
  }

  // 3. Pagine operative → NetworkFirst con fallback /offline
  if (OPERATIVE_PAGES.test(url.pathname)) {
    event.respondWith(networkFirstWithOfflineFallback(request, PAGES_CACHE));
    return;
  }

  // 4. Tutto il resto → NetworkFirst senza fallback speciale
  event.respondWith(networkFirst(request, PAGES_CACHE, 5000));
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeoutMs = 5000) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ]);
    if (response.ok || response.type === "opaque") {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request, cacheName) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline fallback
    const offlinePage = await caches.match(OFFLINE_URL);
    return offlinePage ?? new Response("Sei offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

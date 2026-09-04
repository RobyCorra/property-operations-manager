// ─── Property Operations Manager — Service Worker ───────────────────────────
// Strategia:
//  • Static assets (JS/CSS/font/img): CacheFirst — mai cambiati senza nuovo hash
//  • Pagine operative (cleaner/maintenance): NetworkFirst con fallback cache
//  • Tutto il resto: NetworkFirst
//  • Offline fallback: /offline se non c'è niente in cache

// v4: rimosso StaleWhileRevalidate sulle rotte manager. Il caching HTML di
// pagine Next.js SSR causava hydration mismatch (dati stale nel markup vs
// dati freschi lato client) → scroll e bottoni si bloccavano su Android.
// Ora il SW cacha SOLO gli asset statici (JS/CSS/font/img) — che è dove sta
// il grosso del beneficio velocità. Le pagine HTML vanno sempre in rete.
const CACHE_VERSION = "v4";
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

// ── Push: mostra notifica nativa + badge ─────────────────────────────────────
self.addEventListener("push", (event) => {
  let payload = { title: "PropOps", body: "Nuova notifica", url: "/dashboard/manager", tag: "propops" };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; }
    catch { payload.body = event.data.text() || payload.body; }
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: "/icons/icon-192.png",
        tag: payload.tag,
        data: { url: payload.url },
      }),
      // Badge sull'icona PWA (iOS 16.4+ e Chrome installato come PWA)
      "setAppBadge" in self.navigator
        ? self.navigator.setAppBadge(1).catch(() => {})
        : Promise.resolve(),
      // Notifica i client aperti per suonare l'alert
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => client.postMessage({ type: "PUSH_RECEIVED" }));
      }),
    ])
  );
});

// ── NotificationClick: apre la pagina giusta + azzera badge ──────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/manager";
  event.waitUntil(
    Promise.all([
      // Azzera badge quando l'utente tocca la notifica
      "clearAppBadge" in self.navigator ? self.navigator.clearAppBadge().catch(() => {}) : Promise.resolve(),
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      }),
    ])
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

  // 4. Tutto il resto (incluse pagine manager) → NetworkFirst.
  //    NON usiamo StaleWhileRevalidate su Next.js SSR: rischia hydration
  //    mismatch (markup cached con dati vecchi vs dati client freschi) che
  //    su Android WebView blocca scroll e input.
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

// Stale-While-Revalidate: rispondi SUBITO dalla cache se c'è, e aggiorna
// silenziosamente in background per la prossima volta.
// Se non c'è cache (primo accesso), aspetta la rete.
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const networkFetch = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  if (cached) return cached;
  const fresh = await networkFetch;
  return fresh ?? new Response("Offline", { status: 503 });
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
  // Fetch reale unica: la riusiamo sia per la corsa col timeout sia per l'attesa
  // successiva. Un render lento ma ONLINE non deve mai diventare "offline".
  const networkFetch = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  });
  // Evita warning di "unhandled rejection" se prendiamo la via cache dopo il timeout.
  networkFetch.catch(() => {});

  try {
    // Timeout generoso (le pagine operative fanno render server-side pesanti su
    // lambda fredde): entro 20s proviamo a rispondere dalla rete.
    return await Promise.race([
      networkFetch,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 20000)),
    ]);
  } catch {
    // Timeout o errore di rete: se c'è una versione in cache, servila subito.
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      // Nessuna cache: il render è solo lento, NON offline → aspetta la rete vera.
      return await networkFetch;
    } catch {
      // Solo qui siamo davvero offline / la rete ha fallito.
      const offlinePage = await caches.match(OFFLINE_URL);
      return offlinePage ?? new Response("Sei offline", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  }
}

"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── Splash smart ─────────────────────────────────────────────────────
    // Nasconde la splash nativa non appena il DOM del layout root è montato,
    // invece di aspettare i 2s del launchShowDuration Capacitor. Se non siamo
    // dentro Capacitor (browser web) l'import fallisce silenziosamente.
    // Doppio rAF per assicurarsi che il primo paint sia già avvenuto.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        import("@capacitor/splash-screen")
          .then(({ SplashScreen }) => SplashScreen.hide().catch(() => {}))
          .catch(() => {});
      });
    });

    // Azzera il badge PWA quando l'utente apre/torna sull'app
    function clearBadge() {
      if ("clearAppBadge" in navigator) {
        (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge().catch(() => {});
      }
    }
    clearBadge();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") clearBadge();
    });

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[SW] Registrato:", reg.scope);

        // Aggiornamento automatico quando il SW trova una nuova versione
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nuova versione disponibile — aggiorna silenziosamente
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((err) => console.warn("[SW] Registrazione fallita:", err));

    // Ricarica la pagina quando il nuovo SW prende il controllo
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  return null;
}

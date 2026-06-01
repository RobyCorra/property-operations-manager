"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
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

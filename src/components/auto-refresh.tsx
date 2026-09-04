"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * AutoRefresh — aggiorna i dati della pagina con router.refresh().
 *
 * PERF (set 2026): prima faceva refresh ogni 15s SEMPRE, anche in background e
 * mentre l'utente interagiva. Ogni router.refresh() è un re-fetch SSR + un
 * re-render/riconciliazione dell'intera pagina: su Android WebView è un
 * micro-freeze che, se capita durante un tap, fa sembrare i pulsanti lenti.
 *
 * Ora:
 *  - Refresh SOLO quando la pagina è visibile (niente lavoro in background).
 *  - Refresh anche al ritorno in foreground (è lì che i dati sono più stantii).
 *  - Intervallo più lungo (default 60s) → molti meno freeze durante l'uso.
 *  - Throttle: mai due refresh a meno di `intervalMs/2` di distanza.
 */
export default function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const lastRef = useRef(0);

  useEffect(() => {
    const minGap = Math.max(5_000, intervalMs / 2);

    const doRefresh = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRef.current < minGap) return;
      lastRef.current = now;
      router.refresh();
    };

    const id = setInterval(doRefresh, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") doRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalMs]);

  return null;
}

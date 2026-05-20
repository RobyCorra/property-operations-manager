"use client";

import { useEffect, useState } from "react";

/**
 * Quando la pulizia è in stato AWAITING_REVIEW, questo componente
 * ricarica la pagina ogni 30 secondi per aggiornare lo stato.
 * Mostra anche un pulsante "Controlla ora" per refresh manuale immediato.
 */
export default function PublicStatusPoller() {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.location.reload();
          return 30;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 mt-2">
      <p className="text-xs text-amber-500">
        Aggiornamento automatico in {countdown}s
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
      >
        Controlla ora
      </button>
    </div>
  );
}

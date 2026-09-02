"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Stato di degradazione morbida mostrato quando il database non è
 * raggiungibile (timeout di connessione). Invece di far crashare l'intera
 * pagina — che buttava l'utente fuori dall'app con "Qualcosa è andato storto" —
 * mostriamo un messaggio chiaro con un pulsante "Riprova".
 *
 * L'header e la navigazione del layout restano visibili attorno a questo
 * componente, quindi l'utente NON è mai bloccato: può riprovare o spostarsi
 * altrove nell'app.
 */
export default function DbErrorState({
  title = "Impossibile caricare i dati",
  message = "Problema temporaneo di connessione al server. Di solito si risolve in pochi secondi.",
}: {
  title?: string;
  message?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const retry = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 text-sm max-w-xs mb-7">{message}</p>

      <button
        onClick={retry}
        disabled={isPending}
        className="px-8 py-3.5 bg-slate-900 text-white rounded-full text-sm font-semibold disabled:opacity-60 transition-opacity"
      >
        {isPending ? "Riprovo…" : "Riprova"}
      </button>
    </div>
  );
}

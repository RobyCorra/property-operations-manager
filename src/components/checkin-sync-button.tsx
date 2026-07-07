"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncApartmentCheckins } from "@/src/app/actions/checkin-checklist";
import { RefreshCw } from "lucide-react";

export default function CheckinSyncButton({ apartmentId }: { apartmentId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sync = () => {
    setMsg(null);
    startTransition(async () => {
      try {
        const res = await syncApartmentCheckins(apartmentId);
        setMsg(
          res.created > 0
            ? `Creati ${res.created} check-in (${res.processed} prenotazioni controllate).`
            : `Nessun nuovo check-in: erano già tutti presenti (${res.processed} prenotazioni).`
        );
        router.refresh();
      } catch (err: unknown) {
        setMsg((err as Error).message || "Errore durante la sincronizzazione.");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Sincronizza check-in</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Crea i check-in mancanti per le prenotazioni già esistenti (da oggi in poi).
          </p>
        </div>
        <button
          type="button"
          onClick={sync}
          disabled={isPending}
          className="shrink-0 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "..." : "Sync"}
        </button>
      </div>
      {msg && <p className="text-xs text-slate-500 mt-3">{msg}</p>}
    </div>
  );
}

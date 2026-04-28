"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Clock } from "./icons";

type Props = {
  apartmentId: string;
  lastSyncAt: Date | null;
};

export default function SyncIcalButton({ apartmentId, lastSyncAt }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        // Use browser fetch to call the API route, avoiding Server Action bundling issues
        const response = await fetch("/api/ical/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apartmentId }),
        });

        const result = await response.json();

        if (result.success) {
          setMessage(`Sincronizzato: ${result.count} eventi`);
          setTimeout(() => setMessage(null), 3000);
          // Note: In a real app, you might want to trigger a router.refresh() 
          // to update the list, but for now we focus on finishing the sync.
          window.location.reload(); // Hard reload to clear any server/client state issues
        } else {
          setMessage(`Errore: ${result.error || "Sincronizzazione fallita"}`);
        }
      } catch (error: any) {
        setMessage(`Errore di rete.`);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
      <button 
        onClick={handleSync}
        disabled={isPending}
        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${
          isPending 
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
            : "bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100 active:scale-95"
        }`}
      >
        <RefreshCw size={12} className={isPending ? "animate-spin" : ""} />
        {isPending ? "Sincronizza..." : "Airbnb Sync"}
      </button>
      {message && (
        <span className={`text-[9px] font-bold ${message.startsWith('Errore') ? 'text-rose-500' : 'text-emerald-500'}`}>
          {message}
        </span>
      )}
      {lastSyncAt && !message && !isPending && (
        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
             <Clock size={8} />
             <span>Ultimo: {new Date(lastSyncAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { impresaRequestMaintenanceDate } from "@/src/app/actions/company";

type Pending = { proposedStart: string; proposedEnd: string | null; reason: string | null } | null;

function fmt(iso: string) {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ImpresaMaintenanceDateRequest({
  ticketId,
  currentStart,
  pending,
  lastRejected,
}: {
  ticketId: string;
  currentStart: string | null;
  pending: Pending;
  lastRejected: Pending;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!start) { setError("Indica la nuova data e ora."); return; }
    setError(null);
    startTransition(async () => {
      const r = await impresaRequestMaintenanceDate({ ticketId, proposedStart: start, proposedEnd: end || null, reason: reason || null });
      if (r.success) { setOpen(false); setStart(""); setEnd(""); setReason(""); router.refresh(); }
      else setError(r.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Data attuale</span>
          <p className="font-semibold text-gray-800">{currentStart ? fmt(currentStart) : "Non programmata"}</p>
        </div>
      </div>

      {pending ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-800">⏳ Richiesta di spostamento inviata</p>
          <p className="text-xs text-amber-700 mt-1">
            Nuova data proposta: <strong>{fmt(pending.proposedStart)}</strong>
            {pending.proposedEnd ? ` → ${fmt(pending.proposedEnd)}` : ""}
          </p>
          {pending.reason && <p className="text-[11px] text-amber-600 mt-0.5">Motivo: {pending.reason}</p>}
          <p className="text-[11px] text-amber-600 mt-1">In attesa di conferma dall&apos;organizzazione.</p>
        </div>
      ) : (
        <>
          {lastRejected && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs text-rose-700">
                L&apos;ultima richiesta (spostamento al {fmt(lastRejected.proposedStart)}) è stata <strong>rifiutata</strong> dall&apos;organizzazione.
              </p>
            </div>
          )}
          {!open ? (
            <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100">
              Proponi nuova data
            </button>
          ) : (
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="text-xs text-slate-600">
                  Inizio proposto *
                  <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm" />
                </label>
                <label className="text-xs text-slate-600">
                  Fine (opzionale)
                  <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm" />
                </label>
              </div>
              <label className="block text-xs text-slate-600">
                Motivo (opzionale)
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Es. indisponibilità operatore" className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm" />
              </label>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                  {isPending ? "Invio..." : "Invia richiesta"}
                </button>
                <button type="button" onClick={() => { setOpen(false); setError(null); }} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600">Annulla</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

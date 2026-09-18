"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { assignCleaning, approveCleaningByImpresa, createImpresaCleaning } from "@/src/app/actions/company";

type Staff = { id: string; name: string };
type Apartment = { id: string; name: string; ownerName: string };
type Cleaning = {
  id: string;
  apartmentName: string;
  ownerName: string;
  date: string;
  status: string;
  assignedToId: string | null;
};

const statusCls: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  AWAITING_REVIEW: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

export default function ImpresaCleaningAssign({
  cleanings,
  staff,
  apartments,
}: {
  cleanings: Cleaning[];
  staff: Staff[];
  apartments: Apartment[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Assegnazioni bufferizzate: si salvano col pulsante "Salva".
  const initial = Object.fromEntries(cleanings.map((c) => [c.id, c.assignedToId ?? ""]));
  const [assign, setAssign] = useState<Record<string, string>>(initial);
  const dirty = cleanings.some((c) => (assign[c.id] ?? "") !== (c.assignedToId ?? ""));

  // Nuova pulizia
  const [newOpen, setNewOpen] = useState(false);
  const [nApt, setNApt] = useState("");
  const [nDate, setNDate] = useState("");
  const [nTime, setNTime] = useState("10:00");

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

  const onSave = () => {
    setError(null);
    setOkMsg(null);
    const changed = cleanings.filter((c) => (assign[c.id] ?? "") !== (c.assignedToId ?? ""));
    if (changed.length === 0) return;
    startTransition(async () => {
      for (const c of changed) {
        const r = await assignCleaning(c.id, assign[c.id] || null);
        if (!r.success) { setError(r.error); return; }
      }
      setOkMsg(`Assegnazioni salvate (${changed.length}).`);
      router.refresh();
    });
  };

  const onApprove = (id: string) => {
    setError(null); setOkMsg(null);
    startTransition(async () => {
      const r = await approveCleaningByImpresa(id);
      if (!r.success) setError(r.error);
      else { setOkMsg("Pulizia approvata."); router.refresh(); }
    });
  };

  const onCreate = () => {
    setError(null); setOkMsg(null);
    if (!nApt || !nDate) { setError("Appartamento e data obbligatori."); return; }
    startTransition(async () => {
      const r = await createImpresaCleaning({ apartmentId: nApt, date: nDate, time: nTime });
      if (!r.success) setError(r.error);
      else { setNewOpen(false); setNApt(""); setNDate(""); setNTime("10:00"); setOkMsg("Pulizia creata."); router.refresh(); }
    });
  };

  return (
    <div className="space-y-3">
      {/* Barra azioni */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending || !dirty}
          className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Salva
        </button>
        <button
          type="button"
          onClick={() => setNewOpen((v) => !v)}
          className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-600"
        >
          {newOpen ? "Chiudi" : "+ Nuova pulizia"}
        </button>
        {dirty && <span className="text-xs text-amber-600">Modifiche non salvate</span>}
        {okMsg && <span className="text-xs font-semibold text-emerald-600">✓ {okMsg}</span>}
        {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
      </div>

      {/* Form nuova pulizia */}
      {newOpen && (
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-violet-100 bg-violet-50/40 p-3 sm:grid-cols-4">
          <select className={inputCls} value={nApt} onChange={(e) => setNApt(e.target.value)}>
            <option value="">Appartamento…</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>{a.name} · {a.ownerName}</option>
            ))}
          </select>
          <input type="date" className={inputCls} value={nDate} onChange={(e) => setNDate(e.target.value)} />
          <input type="time" className={inputCls} value={nTime} onChange={(e) => setNTime(e.target.value)} />
          <button type="button" onClick={onCreate} disabled={isPending} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
            Crea pulizia
          </button>
        </div>
      )}

      {/* Lista */}
      {cleanings.length === 0 ? (
        <p className="text-xs text-gray-400">Nessuna pulizia da oggi in poi.</p>
      ) : (
        <div className="space-y-2">
          {cleanings.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/impresa/pulizie/${c.id}`} className="truncate text-sm font-semibold text-slate-800 hover:text-violet-600">
                  {c.apartmentName}
                  <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">{c.ownerName}</span>
                </Link>
                <p className="text-[11px] text-gray-500">{c.date} · <Link href={`/dashboard/impresa/pulizie/${c.id}`} className="text-violet-600">apri scheda →</Link></p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusCls[c.status] ?? "bg-slate-100 text-slate-600"}`}>{c.status}</span>
              {c.status === "AWAITING_REVIEW" && (
                <button type="button" onClick={() => onApprove(c.id)} disabled={isPending} className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">
                  Approva
                </button>
              )}
              <select
                value={assign[c.id] ?? ""}
                onChange={(e) => setAssign((m) => ({ ...m, [c.id]: e.target.value }))}
                className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none"
              >
                <option value="">Da assegnare</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

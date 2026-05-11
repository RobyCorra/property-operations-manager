"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { approveCleaningReview, rejectCleaningReview, approveMaintenanceReview, rejectMaintenanceReview } from "@/src/app/actions/operational";

type CorrectionItem = {
  id: string;
  label: string;
  note: string;
  requiresPhoto: boolean;
};

type Props = {
  entityId: string;
  supervisorId: string;
  type: "cleaning" | "maintenance";
};

export default function SupervisorReviewForm({ entityId, supervisorId, type }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<CorrectionItem[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "reject">("idle");

  function addItem() {
    setItems(prev => [...prev, { id: crypto.randomUUID(), label: "", note: "", requiresPhoto: false }]);
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateItem(id: string, field: keyof CorrectionItem, value: string | boolean) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      try {
        if (type === "cleaning") {
          await approveCleaningReview(entityId, supervisorId);
        } else {
          await approveMaintenanceReview(entityId, supervisorId);
        }
        router.push("/dashboard/supervisor");
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Errore durante l'approvazione.");
      }
    });
  }

  function handleReject() {
    if (items.some(i => !i.label.trim())) {
      setError("Tutti i punti devono avere una descrizione.");
      return;
    }
    if (items.length === 0) {
      setError("Aggiungi almeno un punto da correggere.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (type === "cleaning") {
          await rejectCleaningReview(entityId, supervisorId, notes, items);
        } else {
          await rejectMaintenanceReview(entityId, supervisorId, notes, items);
        }
        router.push("/dashboard/supervisor");
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Errore durante il rifiuto.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {mode === "reject" && (
        <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={18} className="text-rose-500" />
            <h3 className="text-sm font-semibold uppercase tracking-tight text-slate-900">Punti da correggere</h3>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-700">{idx + 1}</span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Descrizione del problema *"
                      value={item.label}
                      onChange={e => updateItem(item.id, "label", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <input
                      type="text"
                      placeholder="Nota opzionale"
                      value={item.note}
                      onChange={e => updateItem(item.id, "note", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => updateItem(item.id, "requiresPhoto", !item.requiresPhoto)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${item.requiresPhoto ? "border-rose-500 bg-rose-500" : "border-slate-300 bg-white"}`}
                      >
                        {item.requiresPhoto && <Camera size={11} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium text-slate-600">Foto obbligatoria</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 py-3 text-xs font-black uppercase tracking-widest text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-colors"
          >
            <Plus size={14} />
            Aggiungi punto
          </button>

          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">Note generali (opzionale)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Aggiungi note generali per il cleaner..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {mode === "idle" ? (
          <>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Approva
            </button>
            <button
              type="button"
              onClick={() => setMode("reject")}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-rose-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-sm transition-all hover:bg-rose-50 hover:scale-[1.02] active:scale-95"
            >
              <XCircle size={14} />
              Rifiuta
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Conferma Rifiuto
            </button>
            <button
              type="button"
              onClick={() => { setMode("idle"); setItems([]); setNotes(""); setError(null); }}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-60"
            >
              Annulla
            </button>
          </>
        )}
      </div>
    </div>
  );
}

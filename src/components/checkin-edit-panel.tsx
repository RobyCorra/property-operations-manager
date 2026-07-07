"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCheckinDetails } from "@/src/app/actions/checkin";

interface Props {
  taskId: string;
  assignedToId: string | null;
  assignedToName: string | null;
  initialTime: string; // "HH:MM"
  assistants: { id: string; name: string }[];
}

export default function CheckinEditPanel({ taskId, assignedToId, assignedToName, initialTime, assistants }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(assignedToId ?? "");
  const [time, setTime] = useState(initialTime);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cancel = () => {
    setSelectedId(assignedToId ?? "");
    setTime(initialTime);
    setError(null);
    setEditing(false);
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateCheckinDetails(taskId, { assignedToId: selectedId || null, time });
        setEditing(false);
        router.refresh();
      } catch (err: unknown) {
        setError((err as Error).message || "Errore durante il salvataggio.");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assegnazione e orario</p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            ✏️ Modifica
          </button>
        )}
      </div>

      {!editing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Assegnato a</span>
            <span className="font-semibold text-slate-900">{assignedToName ?? "Non assegnato"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Orario check-in</span>
            <span className="font-semibold text-slate-900">{initialTime}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Assegna a</label>
            {assistants.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nessun assistente check-in. Crea un utente con ruolo &quot;Assistente Check-in&quot;.
              </p>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
              >
                <option value="">Non assegnato</option>
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Orario check-in</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isPending}
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? "..." : "Salva"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={isPending}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

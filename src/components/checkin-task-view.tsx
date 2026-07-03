"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCheckinChecklist, updateCheckinStatus } from "@/src/app/actions/checkin";

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  photoRequired: boolean;
  completed: boolean;
  photoUrl?: string | null;
}

interface Props {
  taskId: string;
  apartmentName: string;
  apartmentAddress: string;
  mapsUrl: string;
  dateLabel: string;
  guestName: string | null;
  initialItems: ChecklistItem[];
  readOnly: boolean;
}

export default function CheckinTaskView({
  taskId,
  apartmentName,
  apartmentAddress,
  mapsUrl,
  dateLabel,
  guestName,
  initialItems,
  readOnly,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) => {
    if (readOnly) return;
    const next = items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
    setItems(next);
    const changed = next.find((i) => i.id === id)!;
    updateCheckinChecklist(taskId, [{ id, completed: changed.completed }]).catch(() => {});
  };

  const requiredDone = items.filter((i) => i.required).every((i) => i.completed);

  const complete = () => {
    startTransition(async () => {
      try {
        await updateCheckinStatus(taskId, "COMPLETED");
        router.push("/dashboard/checkin");
      } catch (err: unknown) {
        alert((err as Error).message || "Errore durante il completamento.");
      }
    });
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-5 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-lg font-semibold text-slate-900">{apartmentName}</p>
        <p className="text-sm text-slate-500">{dateLabel}</p>
        {guestName && <p className="text-sm text-slate-500">Ospite: {guestName}</p>}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs font-bold text-blue-600"
        >
          📍 {apartmentAddress}
        </a>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Checklist check-in
        </p>
        <div className="space-y-1">
          {items.length === 0 && (
            <p className="text-sm text-slate-400 py-4">Nessuna voce configurata per questo appartamento.</p>
          )}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              disabled={readOnly}
              className="w-full flex items-center gap-3 py-2.5 text-left disabled:opacity-70"
            >
              <span
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                  item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                }`}
              >
                {item.completed && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${item.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                {item.label}
              </span>
              {item.required && (
                <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-amber-600">
                  obblig.
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Completa */}
      {!readOnly && (
        <button
          type="button"
          onClick={complete}
          disabled={isPending || !requiredDone}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black uppercase tracking-widest shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? "..." : requiredDone ? "Completa check-in" : "Completa le voci obbligatorie"}
        </button>
      )}
      {readOnly && (
        <p className="text-center text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Check-in completato
        </p>
      )}
    </div>
  );
}

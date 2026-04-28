"use client";

import { useState, useTransition } from "react";
import { updateTaskChecklist } from "@/src/app/actions/checklist";
import { updateCleaningStatus } from "@/src/app/actions/operational";

interface ChecklistItem {
  id: string;
  label: string;
  type: string;
  value?: number;
  required: boolean;
  completed: boolean;
}

interface ChecklistInteractiveProps {
  taskId: string;
  initialItems: ChecklistItem[];
}

export default function ChecklistInteractive({ taskId, initialItems }: ChecklistInteractiveProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, startStatusTransition] = useTransition();

  const toggleItem = async (id: string) => {
    const previousItems = items;

    const updatedItems = previousItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    setItems(updatedItems);

    try {
      await updateTaskChecklist(taskId, updatedItems);
    } catch (error) {
      console.error("Failed to save checklist:", error);
      setItems(previousItems);
      alert("Errore durante il salvataggio della checklist.");
    }
  };

  const handleComplete = () => {
    startStatusTransition(async () => {
      try {
        await updateCleaningStatus(taskId, "COMPLETED");
      } catch (err: any) {
        alert(err.message || "Errore durante il completamento.");
      }
    });
  };

  const allRequiredDone =
    items.length === 0 || items.filter((i) => i.required).every((i) => i.completed);

  const getStatusLabel = () => {
    if (isUpdatingStatus) return { text: "Completamento...", color: "text-gray-400", pulse: true };
    if (!allRequiredDone) return { text: "Checklist Obbligatoria", color: "text-amber-600", pulse: false };
    return { text: "Pronta per la Chiusura", color: "text-emerald-600", pulse: true };
  };

  const statusLabel = getStatusLabel();

  return (
    <div className="mt-6 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="mb-6 flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100 border-dashed">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-2 w-2 rounded-full ${statusLabel.pulse ? "animate-ping" : ""} ${statusLabel.text === "Pronta per la Chiusura" ? "bg-emerald-500" : "bg-amber-500"
              }`}
          />
          <span className={`text-xs font-black uppercase tracking-widest ${statusLabel.color}`}>
            {statusLabel.text}
          </span>
        </div>
        <div className="text-[10px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm uppercase tracking-tighter">
          Step Attuale
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          {isSaving ? "🔄 Salvataggio..." : "📋 Quality Checklist"}
        </h4>
        {items.length > 0 && (
          <span className="text-[10px] font-medium text-gray-400">
            Completa i punti obbligatori (*)
          </span>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            onClick={(e) => e.stopPropagation()}
            className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${item.completed
              ? "bg-emerald-50/50 border-emerald-100 shadow-sm"
              : "bg-white border-gray-100 hover:border-gray-200"
              }`}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
              className="mt-0.5 w-5 h-5 accent-emerald-600 rounded-lg border-gray-300 transition-all transform active:scale-90"
            />
            <div className="flex-1">
              <span
                className={`text-sm font-semibold transition-colors ${item.completed ? "text-emerald-900" : "text-gray-900"
                  }`}
              >
                {item.type === "dynamic" ? `${item.label}: ${item.value ?? "N/A"}` : item.label}{" "}
                {item.required && <span className="text-red-500 ml-0.5 font-black">*</span>}
              </span>
            </div>
          </label>
        ))}

        {items.length === 0 && (
          <div className="p-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-500 text-xs font-medium">
              Nessun punto di controllo configurato per questo appartamento.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
        {!allRequiredDone && (
          <p className="text-[11px] text-red-500 font-bold bg-red-50 px-4 py-2 rounded-full border border-red-100 animate-pulse">
            ⚠️ Smarca tutti i punti obbligatori per completare
          </p>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleComplete();
          }}
          disabled={!allRequiredDone || isUpdatingStatus}
          className={`w-full py-4 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-gray-100 active:scale-95 ${allRequiredDone
            ? "bg-black text-white hover:bg-gray-800"
            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
            } ${isUpdatingStatus ? "animate-pulse" : ""}`}
        >
          {isUpdatingStatus ? "Completamento in corso..." : "Intervento Completato"}
        </button>

        <p className="text-[10px] text-gray-400 font-medium">
          Una volta completato, il Manager riceverà una notifica immediata.
        </p>
      </div>
    </div>
  );
}
"use client";

import { useState, useActionState } from "react";
import {
  addCheckinChecklistItem,
  updateCheckinChecklistItem,
  deleteCheckinChecklistItem,
} from "@/src/app/actions/checkin-checklist";

interface Item {
  id: string;
  label: string;
  labelTranslations: Record<string, string> | null;
  required: boolean;
  photoRequired: boolean;
  order: number;
}

interface Props {
  apartmentId: string;
  initialItems: Item[];
}

export default function CheckinChecklistManager({ apartmentId, initialItems }: Props) {
  const [addState, addAction, isAdding] = useActionState(
    addCheckinChecklistItem.bind(null, apartmentId),
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Form aggiunta */}
      <form
        action={addAction}
        className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm"
      >
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Nuova voce check-in</p>
        <input
          name="label"
          required
          placeholder="Es. Verifica documenti ospite"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
        />
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="required" defaultChecked /> Obbligatoria
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="photoRequired" /> Richiede foto
          </label>
        </div>
        {addState?.error && <p className="text-sm text-rose-600">{addState.error}</p>}
        <button
          type="submit"
          disabled={isAdding}
          className="rounded-full bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg disabled:opacity-50"
        >
          {isAdding ? "..." : "+ Aggiungi"}
        </button>
      </form>

      {/* Lista voci */}
      <div className="space-y-2">
        {initialItems.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Nessuna voce. Aggiungi la prima voce della checklist di check-in.
          </p>
        )}
        {initialItems.map((item) =>
          editingId === item.id ? (
            <EditRow
              key={item.id}
              item={item}
              apartmentId={apartmentId}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">{item.label}</span>
                {item.required && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                    Obbligatoria
                  </span>
                )}
                {item.photoRequired && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                    Foto
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 px-2 py-1"
                >
                  Modifica
                </button>
                <button
                  onClick={() => {
                    if (confirm("Eliminare questa voce?")) deleteCheckinChecklistItem(item.id, apartmentId);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1"
                >
                  Elimina
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EditRow({ item, apartmentId, onDone }: { item: Item; apartmentId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(
    updateCheckinChecklistItem.bind(null, item.id),
    null
  );
  if (state?.success) onDone();

  return (
    <form action={action} className="bg-white rounded-xl border border-blue-200 px-4 py-3 space-y-3">
      <input type="hidden" name="apartmentId" value={apartmentId} />
      <input
        name="label"
        required
        defaultValue={item.label}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
      />
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="required" defaultChecked={item.required} /> Obbligatoria
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="photoRequired" defaultChecked={item.photoRequired} /> Richiede foto
        </label>
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-5 py-2 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
        >
          {pending ? "..." : "Salva"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-gray-200 px-5 py-2 text-xs font-black uppercase tracking-widest text-gray-500"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}

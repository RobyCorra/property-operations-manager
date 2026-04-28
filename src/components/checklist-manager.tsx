"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { 
  addChecklistItem, 
  deleteChecklistItem, 
  updateChecklistItem, 
  generateDefaultChecklist,
  reorderChecklistItems
} from "@/src/app/actions/checklist";

interface Item {
  id: string;
  label: string;
  type: string;
  formula?: string | null;
  required: boolean;
}

interface ChecklistManagerProps {
  apartmentId: string;
  initialItems: Item[];
}

export default function ChecklistManager({ apartmentId, initialItems }: ChecklistManagerProps) {
  const [addState, addFormAction, isAdding] = useActionState(addChecklistItem.bind(null, apartmentId), null);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editId, setEditId] = useState<string | null>(null);
  const [addType, setAddType] = useState<string>("static");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isGenerating, startTransition] = useTransition();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Sync with server data
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleDelete = async (id: string) => {
    if (confirm("Eliminare questo punto di controllo?")) {
      setIsDeletingId(id);
      await deleteChecklistItem(id, apartmentId);
      setIsDeletingId(null);
    }
  };

  const handleGenerateDefaults = () => {
    if (confirm("Vuoi generare i 10 punti di controllo standard per questo appartamento?")) {
      startTransition(async () => {
        try {
          await generateDefaultChecklist(apartmentId);
        } catch (err: any) {
          alert(err.message || "Errore durante la generazione.");
        }
      });
    }
  };

  // --- DRAG & DROP HANDLERS ---
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    // Needed for Firefox
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setDraggedItemIndex(index);
    setItems(newItems);
  };

  const onDragEnd = async () => {
    if (draggedItemIndex === null) return;
    setDraggedItemIndex(null);
    
    // Save new order
    await reorderChecklistItems(apartmentId, items.map(i => i.id));
    
    // Feedback toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Feedback */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
           ✅ Ordine aggiornato
        </div>
      )}

      {/* Empty State / Generate Button */}
      {initialItems.length === 0 && (
        <section className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-50">
            <span className="text-3xl text-emerald-600">📋</span>
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Configurazione Rapida</h3>
          <p className="text-emerald-700 text-sm mt-1 max-w-md mx-auto">
            Questo appartamento non ha ancora punti di controllo. Puoi generarli ora partendo dal modello standard di 10 punti.
          </p>
          <button 
            disabled={isGenerating}
            onClick={handleGenerateDefaults}
            className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:bg-emerald-300"
          >
            {isGenerating ? "Generazione in corso..." : "Genera Checklist Standard"}
          </button>
        </section>
      )}

      {/* Add Form */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Aggiungi Punto di Controllo</h3>
          {initialItems.length > 0 && (
            <button 
              onClick={async () => {
                if (confirm("Vuoi aggiungere i nuovi punti di controllo standard mancanti?")) {
                  const { syncChecklistWithDefaults } = await import("@/src/app/actions/checklist");
                  const result = await syncChecklistWithDefaults(apartmentId);
                  alert(`${result.count} nuovi elementi aggiunti.`);
                }
              }}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 transition-all"
            >
              🔄 Sincronizza Standard
            </button>
          )}
        </div>
        <form action={addFormAction} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              required
              name="label"
              placeholder="Es. Sostituzione asciugamani"
              className="flex-1 rounded-xl border-gray-200 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black transition-all"
            />
            <input type="hidden" name="apartmentId" value={apartmentId} />
            
            <select 
              name="type" 
              value={addType}
              onChange={(e) => setAddType(e.target.value)}
              className="rounded-xl border-gray-200 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black bg-gray-50 text-sm font-medium"
            >
              <option value="static">Statico</option>
              <option value="dynamic">Dinamico</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <input type="checkbox" name="required" defaultChecked className="w-4 h-4 accent-black" />
              <span className="text-sm font-medium text-gray-700">Obbligatorio</span>
            </label>
            <button 
              disabled={isAdding}
              className="bg-black text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:bg-gray-300"
            >
              {isAdding ? "Aggiunta..." : "Aggiungi"}
            </button>
          </div>

          {addType === "dynamic" && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-700 uppercase">Formula di Calcolo</label>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-blue-500 font-medium">Variabili: guests, bathrooms, bedrooms</span>
                  <div className="flex flex-wrap justify-end gap-x-2 gap-y-1 mt-1">
                    <span className="text-[9px] text-blue-400 bg-blue-100/50 px-1.5 py-0.5 rounded border border-blue-100 font-bold">guests * 2</span>
                    <span className="text-[9px] text-blue-400 bg-blue-100/50 px-1.5 py-0.5 rounded border border-blue-100 font-bold">bathrooms * 2</span>
                    <span className="text-[9px] text-blue-400 bg-blue-100/50 px-1.5 py-0.5 rounded border border-blue-100 font-bold">guests + 2</span>
                  </div>
                </div>
              </div>
              <input 
                required={addType === "dynamic"}
                name="formula"
                placeholder="Es. guests * 2"
                className="bg-white rounded-lg border-blue-200 border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </form>
        {addState?.error && <p className="text-red-500 text-xs mt-2">{addState.error}</p>}
      </section>

      {/* List */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Punti di Controllo Attuali</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              draggable={editId !== item.id}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
              className={`p-4 transition-all duration-200 ${
                draggedItemIndex === index ? "bg-blue-50 opacity-50 scale-[0.98] z-50 shadow-inner" : "hover:bg-gray-50/30"
              } ${editId !== item.id ? "cursor-default" : ""}`}
            >
              {editId === item.id ? (
                <EditItemForm 
                  item={item} 
                  apartmentId={apartmentId} 
                  onCancel={() => setEditId(null)} 
                />
              ) : (
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div 
                      className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors py-2"
                      title="Trascina per riordinare"
                    >
                      <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="2.5" cy="2.5" r="1.5" fill="currentColor"/>
                        <circle cx="2.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <circle cx="2.5" cy="14.5" r="1.5" fill="currentColor"/>
                        <circle cx="9.5" cy="2.5" r="1.5" fill="currentColor"/>
                        <circle cx="9.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <circle cx="9.5" cy="14.5" r="1.5" fill="currentColor"/>
                      </svg>
                    </div>

                    <div className={`w-2 h-2 rounded-full ${item.required ? 'bg-red-400' : 'bg-gray-300'}`}></div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{item.label}</span>
                        {item.required && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Obbligatorio</span>}
                        {item.type === "dynamic" && <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Dinamico</span>}
                      </div>
                      {item.type === "dynamic" && item.formula && (
                        <span className="text-[10px] text-blue-400 font-medium mt-0.5">Formula: {item.formula}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditId(item.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                    >
                      Modifica
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeletingId === item.id}
                      className="text-gray-400 hover:text-red-500 text-xs font-semibold"
                    >
                      {isDeletingId === item.id ? "..." : "Elimina"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">Nessun punto di controllo configurato. Aggiungine uno sopra.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EditItemForm({ item, apartmentId, onCancel }: { item: Item, apartmentId: string, onCancel: () => void }) {
  const [state, formAction, isPending] = useActionState(updateChecklistItem.bind(null, item.id), null);
  const [editType, setEditType] = useState<string>(item.type);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <input type="hidden" name="apartmentId" value={apartmentId} />
        <input 
          required
          name="label"
          defaultValue={item.label}
          className="flex-1 rounded-lg border-gray-300 border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black"
        />
        
        <select 
          name="type" 
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          className="rounded-lg border-gray-300 border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="static">Statico</option>
          <option value="dynamic">Dinamico</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200">
          <input type="checkbox" name="required" defaultChecked={item.required} className="w-3.5 h-3.5 accent-black" />
          <span className="text-xs font-medium text-gray-600">Obbligatorio</span>
        </label>

        <div className="flex gap-2">
          <button 
            type="submit"
            disabled={isPending}
            className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isPending ? "Salvataggio..." : "Salva"}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xs font-medium px-2"
          >
            Annulla
          </button>
        </div>
      </div>

      {editType === "dynamic" && (
        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-blue-700 uppercase">Formula di Calcolo</label>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-blue-500 font-medium">Variabili: guests, bathrooms, bedrooms</span>
              <div className="flex flex-wrap justify-end gap-x-1.5 gap-y-0.5 mt-0.5">
                <span className="text-[8px] text-blue-400 bg-blue-100/30 px-1 py-0.5 rounded border border-blue-100 font-bold">guests * 2</span>
                <span className="text-[8px] text-blue-400 bg-blue-100/30 px-1 py-0.5 rounded border border-blue-100 font-bold">bathrooms * 2</span>
              </div>
            </div>
          </div>
          <input 
            required={editType === "dynamic"}
            name="formula"
            defaultValue={item.formula || ""}
            placeholder="Es. guests * 2"
            className="bg-white rounded-md border-blue-200 border px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      {state?.error && <p className="text-red-500 text-[10px] mt-1">{state.error}</p>}
    </form>
  );
}

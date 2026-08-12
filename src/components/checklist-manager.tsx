"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { Check } from "lucide-react";
import {
  addChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
  generateDefaultChecklist,
  generateEntryQuestionnaire,
  reorderChecklistItems,
  translateAllChecklistItems,
  updateChecklistItemTranslation,
} from "@/src/app/actions/checklist";
import { useToast } from "@/src/components/toast-provider";
import { useLang } from "@/src/components/lang-context";

interface Item {
  id: string;
  label: string;
  labelTranslations?: Record<string, string> | null;
  type: string;
  formula?: string | null;
  required: boolean;
  photoRequired: boolean;
  phase?: string;
  answerType?: string;
}

const ALL_LANGS = [
  { code: "it", flag: "🇮🇹" },
  { code: "en", flag: "🇬🇧" },
  { code: "es", flag: "🇪🇸" },
];

function langName(code: string, t: { langEnglish: string; langSpanish: string }): string {
  if (code === "it") return "Italiano";
  if (code === "en") return t.langEnglish;
  return t.langSpanish;
}

interface ChecklistManagerProps {
  apartmentId: string;
  initialItems: Item[];
}

export default function ChecklistManager({ apartmentId, initialItems }: ChecklistManagerProps) {
  const toast = useToast();
  const { t, lang } = useLang();
  // Lingue di destinazione: tutte tranne quella in cui il manager sta già scrivendo
  const targetLangs = ALL_LANGS.filter((l) => l.code !== (lang ?? "it"));
  const [addState, addFormAction, isAdding] = useActionState(addChecklistItem.bind(null, apartmentId), null);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editId, setEditId] = useState<string | null>(null);
  const [addType, setAddType] = useState<string>("static");
  const [addPhase, setAddPhase] = useState<string>("cleaning");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isGenerating, startTransition] = useTransition();
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Translation state
  const [selectedLangs, setSelectedLangs] = useState<string[]>(() => targetLangs.map((l) => l.code));
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateResult, setTranslateResult] = useState<{ count?: number; error?: string } | null>(null);

  const toggleLang = (code: string) => {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const handleTranslateAll = async () => {
    if (selectedLangs.length === 0) return;
    setIsTranslating(true);
    setTranslateResult(null);
    const result = await translateAllChecklistItems(apartmentId, selectedLangs);
    setIsTranslating(false);
    setTranslateResult(result);
    if (result.error) toast.error(result.error);
    else toast.success(`${result.count} ${t.clUnitTranslated}`);
    // Auto-hide success message after 4s
    if (result.count !== undefined) {
      setTimeout(() => setTranslateResult(null), 4000);
    }
  };

  // Riscontro sull'aggiunta di un punto di controllo
  useEffect(() => {
    if (addState?.success) toast.success(t.clPointAdded);
    else if (addState?.error) toast.error(addState.error);
  }, [addState]);

  // Sync with server data — il questionario d'ingresso va sempre in cima
  useEffect(() => {
    const phaseRank = (i: Item) => (i.phase === "entry" ? 0 : 1);
    setItems([...initialItems].sort((a, b) => phaseRank(a) - phaseRank(b)));
  }, [initialItems]);

  const handleDelete = async (id: string) => {
    if (confirm(t.clDeleteConfirm2)) {
      setIsDeletingId(id);
      try {
        await deleteChecklistItem(id, apartmentId);
        toast.success(t.clPointDeleted);
      } catch {
        toast.error(t.clDeleteError);
      }
      setIsDeletingId(null);
    }
  };

  const handleGenerateDefaults = () => {
    if (confirm(t.clGenStdConfirm)) {
      startTransition(async () => {
        try {
          await generateDefaultChecklist(apartmentId);
          toast.success(t.clStdGenerated);
        } catch (err: any) {
          toast.error(err.message || t.clGenError);
        }
      });
    }
  };

  const handleGenerateEntry = () => {
    if (confirm(t.clGenEntryConfirm)) {
      startTransition(async () => {
        try {
          const result = await generateEntryQuestionnaire(apartmentId);
          toast.success(
            result.count === 0
              ? t.clQAlready
              : `${result.count} ${t.clUnitQAdded}`
          );
        } catch (err: any) {
          toast.error(err.message || t.clGenError);
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
    const result = await reorderChecklistItems(apartmentId, items.map(i => i.id));
    if (result?.error) toast.error(result.error);
    else toast.success(t.clOrderUpdated);
  };

  const hasEntryItems = items.some((i) => i.phase === "entry");

  return (
    <div className="space-y-8 relative">
      {/* Empty State / Generate Button */}
      {initialItems.length === 0 && (
        <section className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-50">
            <span className="text-3xl text-emerald-600">📋</span>
          </div>
          <h3 className="text-xl font-bold text-emerald-900">{t.clQuickTitle}</h3>
          <p className="text-emerald-700 text-sm mt-1 max-w-md mx-auto">
            {t.clQuickText}
          </p>
          <button 
            disabled={isGenerating}
            onClick={handleGenerateDefaults}
            className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:bg-emerald-300"
          >
            {isGenerating ? t.clGeneratingLong : t.clGenerateStandard}
          </button>
        </section>
      )}

      {/* ── Sezione Traduzioni ── */}
      {initialItems.length > 0 && (
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">{t.clAutoTransTitle}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.clAutoTransSub}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {targetLangs.map((l) => (
              <label
                key={l.code}
                className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-colors ${
                  selectedLangs.includes(l.code)
                    ? "bg-violet-50 border-violet-200 text-violet-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLangs.includes(l.code)}
                  onChange={() => toggleLang(l.code)}
                  className="w-4 h-4 accent-violet-600"
                />
                <span className="text-lg">{l.flag}</span>
                <span className="text-sm font-semibold">{langName(l.code, t)}</span>
              </label>
            ))}

            <button
              onClick={handleTranslateAll}
              disabled={isTranslating || selectedLangs.length === 0}
              className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t.clTranslating}
                </>
              ) : (
                <>
                  {t.clTranslateAll}
                </>
              )}
            </button>
          </div>

          {translateResult && (
            <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
              translateResult.error
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}>
              {translateResult.error
                ? `❌ ${translateResult.error}`
                : `✅ ${translateResult.count} ${t.clUnitTranslated} ${selectedLangs.map((l) => ALL_LANGS.find((a) => a.code === l)?.flag).join(" ")}`
              }
            </div>
          )}
        </section>
      )}

      {/* Add Form */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">{t.clAddPoint}</h3>
          {initialItems.length > 0 && (
            <button 
              onClick={async () => {
                if (confirm(t.clSyncConfirm)) {
                  const { syncChecklistWithDefaults } = await import("@/src/app/actions/checklist");
                  const result = await syncChecklistWithDefaults(apartmentId);
                  toast.success(`${result.count} ${t.clUnitItemsAdded}`);
                }
              }}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 transition-all"
            >
              {t.clSyncStandard}
            </button>
          )}
        </div>
        {!hasEntryItems && (
          <div className="mb-4 flex items-center justify-between gap-4 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
            <p className="text-xs text-violet-700">
              {t.clNoEntryQ}
            </p>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateEntry}
              className="shrink-0 bg-violet-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-violet-700 transition-all disabled:bg-violet-300"
            >
              {isGenerating ? t.clGenShort : t.clGenQuestionnaire}
            </button>
          </div>
        )}
        <form action={addFormAction} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input 
              required
              name="label"
              placeholder={t.clItemPlaceholder}
              className="flex-1 min-w-[220px] rounded-xl border-gray-200 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black transition-all"
            />
            <input type="hidden" name="apartmentId" value={apartmentId} />
            
            <select
              name="phase"
              value={addPhase}
              onChange={(e) => setAddPhase(e.target.value)}
              className="shrink-0 rounded-xl border-gray-200 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black bg-gray-50 text-sm font-medium"
            >
              <option value="cleaning">{t.clPhaseCleaning}</option>
              <option value="entry">{t.clPhaseEntry}</option>
            </select>

            {addPhase === "entry" && (
              <select
                name="answerType"
                defaultValue="yesno"
                className="shrink-0 rounded-xl border-violet-200 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-500 bg-violet-50 text-sm font-medium text-violet-700"
              >
                <option value="yesno">{t.clAnswerYesNo}</option>
                <option value="check">{t.clAnswerConfirm}</option>
              </select>
            )}

            <select 
              name="type" 
              value={addType}
              onChange={(e) => setAddType(e.target.value)}
              className="shrink-0 rounded-xl border-gray-200 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black bg-gray-50 text-sm font-medium"
            >
              <option value="static">{t.clTypeStatic}</option>
              <option value="dynamic">{t.clTypeDynamic}</option>
            </select>

            <label className="shrink-0 whitespace-nowrap flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
              <input type="checkbox" name="required" defaultChecked className="w-4 h-4 accent-black" />
              <span className="text-sm font-medium text-gray-700">{t.clRequiredM}</span>
            </label>
            <label className="shrink-0 whitespace-nowrap flex items-center gap-2 cursor-pointer bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
              <input type="checkbox" name="photoRequired" className="w-4 h-4 accent-amber-500" />
              <span className="text-sm font-medium text-amber-700">{t.clPhotoRequired}</span>
            </label>
            <button
              disabled={isAdding}
              className="shrink-0 ml-auto bg-black text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all disabled:bg-gray-300"
            >
              {isAdding ? t.clAdding : t.mgrAdd}
            </button>
          </div>

          {addType === "dynamic" && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-700 uppercase">{t.clFormula}</label>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-blue-500 font-medium">{t.clFormulaVars}</span>
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
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 rounded-t-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">{t.clCurrentPoints}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {items.map((item, index) => (
            <div key={item.id}>
            {(index === 0 || items[index - 1].phase !== item.phase) && (
              <div className="px-4 py-2 bg-gray-50/60 border-b border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {item.phase === "entry" ? t.clSectionEntry : t.clSectionCleaning}
                </span>
              </div>
            )}
            <div 
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
                      title={t.clDragReorder}
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
                        {item.required && <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded border border-red-100">{t.clRequiredM}</span>}
                        {item.answerType === "yesno" && <span className="text-[9px] font-black text-violet-600 uppercase tracking-tighter bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100">{t.clBadgeYesNo}</span>}
                        {item.photoRequired && <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{t.clBadgePhoto}</span>}
                        {item.type === "dynamic" && <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{t.clTypeDynamic}</span>}
                        {/* Bandiere traduzioni — hover per vedere/modificare/aggiungere */}
                        {ALL_LANGS.filter((l) => l.code !== "it").map((l) => (
                          <FlagTranslation
                            key={l.code}
                            flag={l.flag}
                            code={l.code}
                            value={item.labelTranslations?.[l.code] ?? ""}
                            apartmentId={apartmentId}
                            itemId={item.id}
                            onSaved={(newValue) =>
                              setItems((prev) =>
                                prev.map((it) => {
                                  if (it.id !== item.id) return it;
                                  const next = { ...(it.labelTranslations ?? {}) };
                                  if (newValue) next[l.code] = newValue;
                                  else delete next[l.code];
                                  return { ...it, labelTranslations: next };
                                })
                              )
                            }
                          />
                        ))}
                      </div>
                      {item.type === "dynamic" && item.formula && (
                        <span className="text-[10px] text-blue-400 font-medium mt-0.5">{t.clFormulaPrefix} {item.formula}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditId(item.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                    >
                      {t.mgrEdit}
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeletingId === item.id}
                      className="text-gray-400 hover:text-red-500 text-xs font-semibold"
                    >
                      {isDeletingId === item.id ? "..." : t.mgrDelete}
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-sm">{t.clEmpty}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * Bandiera di una traduzione: al passaggio del mouse mostra un popover con il
 * testo tradotto, modificabile inline. Il salvataggio aggiorna solo quella
 * lingua (server action updateChecklistItemTranslation) e lo stato locale.
 */
function FlagTranslation({
  flag,
  code,
  value,
  apartmentId,
  itemId,
  onSaved,
}: {
  flag: string;
  code: string;
  value: string;
  apartmentId: string;
  itemId: string;
  onSaved: (newValue: string) => void;
}) {
  const { t } = useLang();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  // Se il valore dal server cambia (es. dopo "Traduci tutti"), riallinea il draft
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const dirty = draft.trim() !== value.trim();

  const handleSave = async () => {
    if (!dirty) {
      setOpen(false);
      return;
    }
    setSaving(true);
    const res = await updateChecklistItemTranslation(itemId, apartmentId, code, draft);
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    onSaved(res.value ?? "");
    toast.success(t.mgrSaved);
    setOpen(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        // Non chiudere se ci sono modifiche non salvate
        if (!dirty && !saving) setOpen(false);
      }}
    >
      <span
        className={`text-[11px] cursor-pointer transition-opacity ${
          value.trim() ? "" : "opacity-30 grayscale hover:opacity-70"
        }`}
      >
        {flag}
      </span>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
            {flag} {langName(code, t)}
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder={t.clAddTranslationPlaceholder}
            className="w-full resize-none rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setDraft(value);
                setOpen(false);
              }}
              className="text-xs font-semibold text-gray-400 hover:text-gray-700"
            >
              {t.mgrCancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-40"
            >
              {saving ? "..." : t.mgrSave}
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

function EditItemForm({ item, apartmentId, onCancel }: { item: Item; apartmentId: string; onCancel: () => void }) {
  const [state, formAction, isPending] = useActionState(updateChecklistItem.bind(null, item.id), null);
  const toast = useToast();
  const { t } = useLang();
  const [justSaved, setJustSaved] = useState(false);
  const [editType, setEditType] = useState<string>(item.type);
  const [editPhase, setEditPhase] = useState<string>(item.phase ?? "cleaning");

  // Conferma visiva: spunta sul pulsante, poi il form si chiude
  useEffect(() => {
    if (state?.success) {
      setJustSaved(true);
      toast.success(t.mgrSaved);
      const timer = setTimeout(onCancel, 900);
      return () => clearTimeout(timer);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="apartmentId" value={apartmentId} />
        <input 
          required
          name="label"
          defaultValue={item.label}
          className="flex-1 min-w-[200px] rounded-lg border-gray-300 border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black"
        />
        
        <select
          name="phase"
          value={editPhase}
          onChange={(e) => setEditPhase(e.target.value)}
          className="shrink-0 rounded-lg border-gray-300 border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="cleaning">{t.clPhaseCleaning}</option>
          <option value="entry">{t.clPhaseEntry}</option>
        </select>

        {editPhase === "entry" && (
          <select
            name="answerType"
            defaultValue={item.answerType ?? "yesno"}
            className="shrink-0 rounded-lg border-violet-200 border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 bg-violet-50 text-violet-700"
          >
            <option value="yesno">{t.clAnswerYesNo}</option>
            <option value="check">{t.clAnswerConfirm}</option>
          </select>
        )}

        <select 
          name="type" 
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          className="shrink-0 rounded-lg border-gray-300 border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="static">{t.clTypeStatic}</option>
          <option value="dynamic">{t.clTypeDynamic}</option>
        </select>

        <label className="shrink-0 whitespace-nowrap flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200">
          <input type="checkbox" name="required" defaultChecked={item.required} className="w-3.5 h-3.5 accent-black" />
          <span className="text-xs font-medium text-gray-600">{t.clRequiredM}</span>
        </label>

        <label className="shrink-0 whitespace-nowrap flex items-center gap-2 cursor-pointer bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
          <input type="checkbox" name="photoRequired" defaultChecked={item.photoRequired} className="w-3.5 h-3.5 accent-amber-500" />
          <span className="text-xs font-medium text-amber-700">{t.clBadgePhoto}</span>
        </label>

        <div className="flex gap-2 ml-auto shrink-0">
          <button 
            type="submit"
            disabled={isPending}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${
              justSaved ? "bg-emerald-600" : "bg-black hover:bg-gray-800 disabled:bg-gray-300"
            }`}
          >
            {justSaved ? (
              <><Check size={13} strokeWidth={3} /> {t.mgrSaved}</>
            ) : isPending ? (
              t.clSavingLong
            ) : (
              t.mgrSave
            )}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xs font-medium px-2"
          >
            {t.mgrCancel}
          </button>
        </div>
      </div>

      {editType === "dynamic" && (
        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-blue-700 uppercase">{t.clFormula}</label>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-blue-500 font-medium">{t.clFormulaVars}</span>
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

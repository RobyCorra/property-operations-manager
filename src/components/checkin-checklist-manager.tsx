"use client";

import { useState, useActionState, useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/src/components/toast-provider";
import { useLang } from "@/src/components/lang-context";
import { LANGUAGE_CATALOG, langFlag, langNative } from "@/src/lib/languages";
import {
  addCheckinChecklistItem,
  updateCheckinChecklistItem,
  deleteCheckinChecklistItem,
  translateAllCheckinChecklistItems,
  updateCheckinChecklistItemTranslation,
} from "@/src/app/actions/checkin-checklist";

// Lingue target attivate di default; le altre si aggiungono col menu "+".
const DEFAULT_TARGETS = ["en", "es"];

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
  const { t, lang } = useLang();
  const toast = useToast();
  const [addState, addAction, isAdding] = useActionState(
    addCheckinChecklistItem.bind(null, apartmentId),
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>(initialItems);
  useEffect(() => setItems(initialItems), [initialItems]);

  // ── Stato traduzioni ──
  const [manualLangs, setManualLangs] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateResult, setTranslateResult] = useState<{ count?: number; error?: string } | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<string[]>([]);

  const presentLangs = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) {
      for (const code of Object.keys(it.labelTranslations ?? {})) s.add(code);
    }
    return s;
  }, [items]);

  const activeLangs = useMemo(() => {
    const codes = new Set<string>();
    DEFAULT_TARGETS.forEach((c) => codes.add(c));
    presentLangs.forEach((c) => codes.add(c));
    manualLangs.forEach((c) => codes.add(c));
    codes.delete("it");
    codes.delete(lang ?? "it");
    return LANGUAGE_CATALOG.filter((l) => codes.has(l.code));
  }, [presentLangs, manualLangs, lang]);

  const activeCodes = useMemo(() => new Set(activeLangs.map((l) => l.code)), [activeLangs]);

  const addableLangs = useMemo(
    () => LANGUAGE_CATALOG.filter((l) => l.code !== (lang ?? "it") && !activeCodes.has(l.code)),
    [activeCodes, lang]
  );

  const [selectedLangs, setSelectedLangs] = useState<string[]>(() => {
    const codes = new Set<string>(DEFAULT_TARGETS);
    for (const it of initialItems) {
      for (const code of Object.keys(it.labelTranslations ?? {})) codes.add(code);
    }
    codes.delete("it");
    codes.delete(lang ?? "it");
    return [...codes];
  });

  const toggleLang = (code: string) => {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const runTranslate = async (langs: string[]) => {
    if (langs.length === 0) return;
    setIsTranslating(true);
    setTranslateResult(null);
    const result = await translateAllCheckinChecklistItems(apartmentId, langs);
    setIsTranslating(false);
    setTranslateResult(result);
    if (result.error) toast.error(result.error);
    else toast.success(`${result.count} ${t.clUnitTranslated}`);
    if (result.count !== undefined) {
      setTimeout(() => setTranslateResult(null), 4000);
    }
  };

  const handleTranslateAll = () => runTranslate(selectedLangs);

  const handleConfirmAdd = async () => {
    if (pendingAdd.length === 0) return;
    const toAdd = pendingAdd;
    setManualLangs((prev) => [...new Set([...prev, ...toAdd])]);
    setSelectedLangs((prev) => [...new Set([...prev, ...toAdd])]);
    setPendingAdd([]);
    setAddMenuOpen(false);
    await runTranslate(toAdd);
  };

  return (
    <div className="space-y-6">
      {/* Form aggiunta */}
      <form
        action={addAction}
        className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm"
      >
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t.ckNewItem}</p>
        <input
          name="label"
          required
          placeholder={t.ckPlaceholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
        />
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="required" defaultChecked /> {t.ckRequired}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="photoRequired" /> {t.ckPhotoNeeded}
          </label>
        </div>
        {addState?.error && <p className="text-sm text-rose-600">{addState.error}</p>}
        <button
          type="submit"
          disabled={isAdding}
          className="rounded-full bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg disabled:opacity-50"
        >
          {isAdding ? "..." : `+ ${t.mgrAdd}`}
        </button>
      </form>

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
            {activeLangs.map((l) => (
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
                <span className="text-sm font-semibold">{l.native}</span>
              </label>
            ))}

            {/* Menu "+" per aggiungere una lingua dal catalogo */}
            {addableLangs.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setAddMenuOpen((o) => !o)}
                  disabled={isTranslating}
                  title={t.clAddLanguage}
                  className="flex items-center justify-center w-11 h-11 rounded-xl border border-dashed border-gray-300 text-gray-500 text-xl font-bold hover:border-violet-300 hover:text-violet-600 transition-colors disabled:opacity-50"
                >
                  +
                </button>

                {addMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAddMenuOpen(false)} />
                    <div className="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                      <p className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        {t.clAddLanguage}
                      </p>
                      <div className="max-h-56 overflow-y-auto">
                        {addableLangs.map((l) => (
                          <label
                            key={l.code}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={pendingAdd.includes(l.code)}
                              onChange={() =>
                                setPendingAdd((prev) =>
                                  prev.includes(l.code)
                                    ? prev.filter((c) => c !== l.code)
                                    : [...prev, l.code]
                                )
                              }
                              className="w-4 h-4 accent-violet-600"
                            />
                            <span className="text-lg">{l.flag}</span>
                            <span className="text-sm font-medium text-gray-700">{l.native}</span>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleConfirmAdd}
                        disabled={pendingAdd.length === 0 || isTranslating}
                        className="mt-2 w-full rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-40"
                      >
                        {t.mgrAdd}
                        {pendingAdd.length > 0 ? ` (${pendingAdd.length})` : ""}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

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
                <>{t.clTranslateAll}</>
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
                : `✅ ${translateResult.count} ${t.clUnitTranslated} ${selectedLangs.map((l) => langFlag(l)).join(" ")}`
              }
            </div>
          )}
        </section>
      )}

      {/* Lista voci */}
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            {t.ckEmpty}
          </p>
        )}
        {items.map((item) =>
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
                    {t.ckRequired}
                  </span>
                )}
                {item.photoRequired && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                    {t.ckPhotoBadge}
                  </span>
                )}
                {/* Bandiere traduzioni — solo lingue presenti; hover per vedere/modificare */}
                {LANGUAGE_CATALOG.filter((l) => item.labelTranslations?.[l.code]).map((l) => (
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
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 px-2 py-1"
                >
                  {t.mgrEdit}
                </button>
                <button
                  onClick={() => {
                    if (confirm(t.ckDeleteConfirm)) deleteCheckinChecklistItem(item.id, apartmentId);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1"
                >
                  {t.mgrDelete}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/**
 * Bandiera traduzione: hover per vedere il testo tradotto, modificabile inline.
 * Bandiera grigia = traduzione mancante (si può aggiungere da qui). Salva solo
 * quella lingua via updateCheckinChecklistItemTranslation.
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
    const res = await updateCheckinChecklistItemTranslation(itemId, apartmentId, code, draft);
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
            {flag} {langNative(code)}
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

function EditRow({ item, apartmentId, onDone }: { item: Item; apartmentId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(
    updateCheckinChecklistItem.bind(null, item.id),
    null
  );
  const toast = useToast();
  const { t } = useLang();
  const [justSaved, setJustSaved] = useState(false);

  // Conferma visiva prima di chiudere il form (evita l'update in fase di render)
  useEffect(() => {
    if (state?.success) {
      setJustSaved(true);
      toast.success(t.mgrSaved);
      const timer = setTimeout(onDone, 900);
      return () => clearTimeout(timer);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

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
          <input type="checkbox" name="required" defaultChecked={item.required} /> {t.ckRequired}
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="photoRequired" defaultChecked={item.photoRequired} /> {t.ckPhotoNeeded}
        </label>
      </div>
      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors disabled:opacity-50 ${
            justSaved ? "bg-emerald-600" : "bg-black"
          }`}
        >
          {justSaved ? <><Check size={13} strokeWidth={3} /> {t.mgrSaved}</> : pending ? "..." : t.mgrSave}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-gray-200 px-5 py-2 text-xs font-black uppercase tracking-widest text-gray-500"
        >
          {t.mgrCancel}
        </button>
      </div>
    </form>
  );
}

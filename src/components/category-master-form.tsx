"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/src/components/lang-context";
import BedLinenEditor, { type BedConfigData } from "@/src/components/bed-linen-editor";
import type { CategoryMasterInput, MasterChecklistItem } from "@/src/app/actions/structure";

type Props = {
  categoryId: string;
  propertyId: string;
  unitCount: number;
  unitNumbers: string[];
  initial: {
    name: string;
    squareMeters: number;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    bedConfig: BedConfigData;
    checklist: MasterChecklistItem[];
  };
  action: (
    categoryId: string,
    input: CategoryMasterInput,
  ) => Promise<{ success: true; unitCount: number } | { success: false; error?: string }>;
};

export default function CategoryMasterForm({ categoryId, propertyId, unitCount, unitNumbers, initial, action }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [sqm, setSqm] = useState(initial.squareMeters);
  const [bedrooms, setBedrooms] = useState(initial.bedrooms);
  const [bathrooms, setBathrooms] = useState(initial.bathrooms);
  const [maxGuests, setMaxGuests] = useState(initial.maxGuests);
  const [bedConfig, setBedConfig] = useState<BedConfigData>(initial.bedConfig);
  const [checklist, setChecklist] = useState<MasterChecklistItem[]>(initial.checklist);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";
  const numCls =
    "w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm text-center text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  const updateItem = (idx: number, patch: Partial<MasterChecklistItem>) =>
    setChecklist((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const save = () => {
    setError(null);
    if (!name.trim()) {
      setError(t.stCatNameMaster);
      setConfirmOpen(false);
      return;
    }
    const input: CategoryMasterInput = {
      name: name.trim(),
      squareMeters: sqm,
      bedrooms,
      bathrooms,
      maxGuests,
      bedConfig,
      checklist: checklist
        .map((it) => ({ label: it.label.trim(), required: it.required, photoRequired: it.photoRequired }))
        .filter((it) => it.label),
    };
    startTransition(() => {
      void action(categoryId, input).then((res) => {
        if (res.success) {
          router.push(`/dashboard/manager/strutture/${propertyId}`);
          router.refresh();
        } else {
          setError(res.error || "Errore durante il salvataggio.");
          setConfirmOpen(false);
        }
      });
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div>
          <label className={labelCls}>{t.stCatNameMaster}</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div><label className={labelCls}>{t.stSqm}</label><input type="number" min={0} className={numCls} value={sqm || ""} onChange={(e) => setSqm(parseInt(e.target.value) || 0)} /></div>
          <div><label className={labelCls}>{t.stRooms}</label><input type="number" min={0} className={numCls} value={bedrooms} onChange={(e) => setBedrooms(parseInt(e.target.value) || 0)} /></div>
          <div><label className={labelCls}>{t.stBaths}</label><input type="number" min={0} className={numCls} value={bathrooms} onChange={(e) => setBathrooms(parseInt(e.target.value) || 0)} /></div>
          <div><label className={labelCls}>{t.stGuests}</label><input type="number" min={1} className={numCls} value={maxGuests} onChange={(e) => setMaxGuests(parseInt(e.target.value) || 1)} /></div>
        </div>
        <BedLinenEditor value={bedConfig} onChange={setBedConfig} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{t.stCleaningChecklist} <span className="font-normal text-violet-500">{t.stFromMaster}</span></span>
        </div>
        {checklist.length === 0 && <p className="text-xs text-gray-400">{t.stNoChecklistItems}</p>}
        <div className="space-y-2">
          {checklist.map((it, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
              <input
                className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none"
                value={it.label}
                placeholder={t.stChecklistItem}
                onChange={(e) => updateItem(idx, { label: e.target.value })}
              />
              <label className="flex items-center gap-1 text-[11px] text-gray-500">
                <input type="checkbox" checked={it.photoRequired} onChange={(e) => updateItem(idx, { photoRequired: e.target.checked })} />
                {t.stPhotoShort}
              </label>
              <label className="flex items-center gap-1 text-[11px] text-gray-500">
                <input type="checkbox" checked={it.required} onChange={(e) => updateItem(idx, { required: e.target.checked })} />
                {t.stRequiredShort}
              </label>
              <button type="button" onClick={() => setChecklist((p) => p.filter((_, i) => i !== idx))} className="text-xs font-medium text-red-500">✕</button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setChecklist((p) => [...p, { label: "", required: true, photoRequired: false }])}
          className="w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500"
        >
          {t.stAddChecklistItem}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <Link href={`/dashboard/manager/strutture/${propertyId}`} className="rounded-full border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600">
          {t.stCancel}
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {t.stSave}
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => !isPending && setConfirmOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 text-xl">↗</span>
              <p className="text-base font-semibold text-gray-900">{t.stApplyAllTitle}</p>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-gray-500">
              {t.stApplyAllBody(unitCount, unitNumbers.join(", "))}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={save} disabled={isPending} className="flex-1 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                {isPending ? t.stApplying : t.stApplyAll}
              </button>
              <button type="button" onClick={() => setConfirmOpen(false)} disabled={isPending} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600">
                {t.stCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

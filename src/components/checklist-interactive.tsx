"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { updateTaskChecklist } from "@/src/app/actions/checklist";
import { updateCleaningStatus } from "@/src/app/actions/operational";
import { Camera, ChevronRight, ChevronLeft, SkipForward, CheckCircle2, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useLang } from "@/src/components/lang-context";

interface ChecklistItem {
  id: string;
  label: string;
  labelTranslations?: Record<string, string> | null;
  type: string;
  value?: number | null;
  required: boolean;
  photoRequired: boolean;
  completed: boolean;
  formula?: string | null;
  photoUrl?: string | null;
  skipped?: boolean;
}

interface ChecklistInteractiveProps {
  taskId: string;
  initialItems: ChecklistItem[];
}

export default function ChecklistInteractive({ taskId, initialItems }: ChecklistInteractiveProps) {
  const { t, lang } = useLang();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const firstUnprocessed = initialItems.findIndex((i) => !i.completed && !i.skipped);
  const [currentIndex, setCurrentIndex] = useState(
    firstUnprocessed === -1 ? initialItems.length : firstUnprocessed
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [photoRequiredError, setPhotoRequiredError] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const currentItem = items[currentIndex];
  const completedCount = items.filter((i) => i.completed).length;
  const allDone = currentIndex >= items.length;
  // ALL items must be completed — no skipped, no pending
  const allItemsCompleted = items.every((i) => i.completed);
  const incompleteItems = items
    .map((item, idx) => ({ ...item, idx }))
    .filter((i) => !i.completed);

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadError(null);
  };

  const goBack = () => {
    if (currentIndex <= 0) return;
    clearPhoto();
    setJustCompleted(null);
    setCurrentIndex((prev) => prev - 1);
  };

  const goForward = () => {
    clearPhoto();
    setJustCompleted(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const goToItem = (idx: number) => {
    clearPhoto();
    setJustCompleted(null);
    setCurrentIndex(idx);
  };

  const resetItem = async (idx: number) => {
    const updatedItems = items.map((item, i) =>
      i === idx ? { ...item, completed: false, skipped: false, photoUrl: null } : item
    );
    setItems(updatedItems);
    try {
      await updateTaskChecklist(taskId, updatedItems);
    } catch {
      // best-effort
    }
  };

  const advance = async (completed: boolean) => {
    // Blocca se foto obbligatoria e non ancora caricata
    if (completed && currentItem.photoRequired && !photoFile && !currentItem.photoUrl) {
      setPhotoRequiredError(true);
      setTimeout(() => setPhotoRequiredError(false), 2500);
      return;
    }

    setIsSaving(true);
    setUploadError(null);

    let photoUrl: string | null = null;

    if (completed && photoFile) {
      setIsUploading(true);
      try {
        const blob = await upload(
          `uploads/cleaning/${taskId}/checklist/${currentItem.id}/${Date.now()}-${photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          photoFile,
          { access: "public", handleUploadUrl: "/api/blob-upload" }
        );
        photoUrl = blob.url;
      } catch {
        setUploadError("Errore upload foto. Riprova o procedi senza.");
        setIsUploading(false);
        setIsSaving(false);
        return;
      }
      setIsUploading(false);
    }

    const updatedItems = items.map((item, idx) =>
      idx === currentIndex
        ? { ...item, completed, skipped: !completed, photoUrl: photoUrl ?? item.photoUrl ?? null }
        : item
    );

    setItems(updatedItems);

    try {
      await updateTaskChecklist(taskId, updatedItems);
    } catch {
      // best-effort DB sync
    }

    setJustCompleted(completed ? currentItem.label : null);
    clearPhoto();

    // Go to next unprocessed item, or completion screen if all processed
    const nextIdx = updatedItems.findIndex((item, idx) => idx > currentIndex && !item.completed && !item.skipped);
    setCurrentIndex(nextIdx === -1 ? updatedItems.length : nextIdx);
    setIsSaving(false);
  };

  const handleComplete = async () => {
    setIsCompletingTask(true);
    try {
      await updateCleaningStatus(taskId, "AWAITING_REVIEW");
    } catch (err: unknown) {
      alert((err as Error).message || "Errore durante il completamento.");
      setIsCompletingTask(false);
    }
  };

  // ── Completion screen ──────────────────────────────────────────────────────
  if (allDone) {
    const photosWithUrls = items.filter((i) => i.photoUrl);

    // Some items not completed — force resolution
    if (!allItemsCompleted) {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">{t.incompleteTitle}</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {t.incompleteText(incompleteItems.length)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {incompleteItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white border border-amber-100 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {item.label}
                      {item.required && <span className="text-rose-500 ml-1">*</span>}
                    </p>
                    <p className="text-[10px] text-amber-500 font-bold mt-0.5">
                      {item.skipped ? t.skipped : t.notCompleted}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToItem(item.idx)}
                    className="shrink-0 flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    {t.resolve} <ChevronRight size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled
            className="w-full py-4 rounded-2xl text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            {t.completeDisabled}
          </button>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            {t.completeHint}
          </p>
        </div>
      );
    }

    // All completed 🎉
    return (
      <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">{t.allDoneTitle}</h3>
        <p className="text-sm text-slate-500 mb-6">
          {t.allDoneCount(completedCount, items.length)}
        </p>

        {photosWithUrls.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              {t.photosAttached(photosWithUrls.length)}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {photosWithUrls.map((item) => (
                <a key={item.id} href={item.photoUrl!} target="_blank" rel="noreferrer">
                  <img
                    src={item.photoUrl!}
                    alt={item.label}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-100 shadow-sm hover:scale-105 transition-transform"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleComplete}
          disabled={isCompletingTask}
          className="w-full py-4 rounded-2xl text-sm font-bold bg-black text-white hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isCompletingTask ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> {t.completing}
            </span>
          ) : (
            t.completeBtn
          )}
        </button>
        <p className="text-[10px] text-slate-400 mt-3">
          {t.notifyHint}
        </p>
      </div>
    );
  }

  // ── Step view ──────────────────────────────────────────────────────────────
  const progress = Math.round((completedCount / items.length) * 100);
  const translatedLabel =
    lang && lang !== "it" && currentItem.labelTranslations?.[lang]
      ? currentItem.labelTranslations[lang]
      : currentItem.label;

  const itemLabel =
    currentItem.type === "dynamic"
      ? `${translatedLabel}: ${currentItem.value ?? "N/A"}`
      : translatedLabel;

  // ── Item già completato: vista sola lettura con cestino ────────────────────
  if (currentItem.completed) {
    return (
      <div className="animate-in fade-in duration-300">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t.stepOf(currentIndex + 1, items.length)}
            </span>
            <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Completed card */}
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <span className="flex-1 text-base font-bold text-green-800 leading-snug">{itemLabel}</span>
            <button
              type="button"
              onClick={() => resetItem(currentIndex)}
              className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 active:scale-95 transition-all shrink-0"
              title="Annulla e rifai"
            >
              <Trash2 size={15} />
            </button>
          </div>
          {currentItem.photoUrl && (
            <div className="mt-3 flex items-center gap-3 pl-8">
              <a href={currentItem.photoUrl} target="_blank" rel="noreferrer">
                <img
                  src={currentItem.photoUrl}
                  alt="foto"
                  className="w-12 h-12 object-cover rounded-xl border border-green-200 shadow-sm hover:scale-105 transition-transform"
                />
              </a>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Foto allegata</span>
            </div>
          )}
        </div>

        {/* Navigazione semplificata */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
            {t.back}
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={currentIndex >= items.length - 1}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Avanti
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  // ── Item da fare ───────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-300">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {t.stepOf(currentIndex + 1, items.length)}
          </span>
          <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Previous step confirmation */}
      {justCompleted && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={13} />
          <span className="truncate">{t.prevCompleted(justCompleted!)}</span>
        </div>
      )}

      {/* Foto obbligatoria — toast errore */}
      {photoRequiredError && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={13} />
          <span>{t.photoRequiredError}</span>
        </div>
      )}

      {/* Item card — nessun testo "Obbligatorio" qui */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm mb-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 leading-snug">{itemLabel}</h3>
      </div>

      {/* Photo section */}
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {currentItem.photoRequired ? t.photoLabel : t.photoOptional}
          </p>
          {currentItem.photoRequired && (
            <span className="text-[9px] font-black uppercase tracking-wide text-white bg-rose-500 rounded-full px-2 py-0.5">
              {t.required}
            </span>
          )}
        </div>

        {uploadError && (
          <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg mb-3 border border-rose-100">
            ⚠️ {uploadError}
          </p>
        )}

        {photoPreview ? (
          <div className="flex items-center gap-3">
            <img
              src={photoPreview}
              alt="Anteprima"
              className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{photoFile?.name}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{t.photoReady}</p>
            </div>
            <button
              type="button"
              onClick={clearPhoto}
              className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 text-[10px] flex items-center justify-center hover:bg-rose-200 shrink-0"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className={`w-full flex items-center justify-center gap-2 rounded-xl bg-slate-400 py-4 text-sm font-bold text-white hover:bg-slate-500 transition-colors ${currentItem.photoRequired ? "border-2 border-rose-400" : ""}`}
          >
            <Camera size={18} />
            {t.takePhoto}
          </button>
        )}

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Indietro */}
        <button
          type="button"
          onClick={goBack}
          disabled={currentIndex === 0 || isSaving}
          className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} />
          {t.back}
        </button>

        {/* Salta */}
        <button
          type="button"
          onClick={() => advance(false)}
          disabled={isSaving}
          className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <SkipForward size={13} />
          {t.skip}
        </button>

        {/* Fatto */}
        <button
          type="button"
          onClick={() => advance(true)}
          disabled={isSaving || isUploading}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-green-600 py-3.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-700 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-green-600/20"
        >
          {isSaving || isUploading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              {isUploading ? t.uploading : t.saving}
            </>
          ) : (
            <>
              <CheckCircle2 size={13} />
              {t.done}
              <ChevronRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

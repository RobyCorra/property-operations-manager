"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { updateTaskChecklist } from "@/src/app/actions/checklist";
import { updateCleaningStatus } from "@/src/app/actions/operational";
import { Camera, ChevronRight, ChevronLeft, SkipForward, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  type: string;
  value?: number | null;
  required: boolean;
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

  const goToItem = (idx: number) => {
    clearPhoto();
    setJustCompleted(null);
    setCurrentIndex(idx);
  };

  const advance = async (completed: boolean) => {
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
      await updateCleaningStatus(taskId, "COMPLETED");
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
                <p className="text-sm font-bold text-amber-800">Intervento non completabile</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {incompleteItems.length} {incompleteItems.length === 1 ? "punto non è stato" : "punti non sono stati"} completato/i.
                  Risolvi tutti i punti per poter chiudere l'intervento.
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
                      {item.skipped ? "Saltato" : "Non completato"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToItem(item.idx)}
                    className="shrink-0 flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    Risolvi <ChevronRight size={11} />
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
            ✓ Intervento Completato
          </button>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Completa tutti i punti per sbloccare questa azione.
          </p>
        </div>
      );
    }

    // All completed 🎉
    return (
      <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Checklist completata!</h3>
        <p className="text-sm text-slate-500 mb-6">
          {completedCount} / {items.length} punti verificati
        </p>

        {photosWithUrls.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              📸 {photosWithUrls.length} foto allegate
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
              <Loader2 size={16} className="animate-spin" /> Completamento...
            </span>
          ) : (
            "✓ Intervento Completato"
          )}
        </button>
        <p className="text-[10px] text-slate-400 mt-3">
          Il Manager riceverà una notifica immediata.
        </p>
      </div>
    );
  }

  // ── Step view ──────────────────────────────────────────────────────────────
  const progress = Math.round((currentIndex / items.length) * 100);
  const itemLabel =
    currentItem.type === "dynamic"
      ? `${currentItem.label}: ${currentItem.value ?? "N/A"}`
      : currentItem.label;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Punto {currentIndex + 1} di {items.length}
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
          <span className="truncate">"{justCompleted}" completato</span>
        </div>
      )}

      {/* Item card */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm mb-4 text-center">
        <div className="text-5xl mb-4">{currentItem.required ? "✅" : "☑️"}</div>
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          {itemLabel}
          {currentItem.required && <span className="text-rose-500 ml-1 text-base">*</span>}
        </h3>
        {currentItem.required && (
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-2">Obbligatorio</p>
        )}
      </div>

      {/* Photo section */}
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          📸 Foto di verifica{!currentItem.required && " (opzionale)"}
        </p>

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
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">✓ Pronta per l'invio</p>
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
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-bold text-slate-500 hover:border-slate-400 hover:bg-white transition-colors"
          >
            <Camera size={18} />
            Scatta / carica foto
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
          Indietro
        </button>

        {/* Salta */}
        <button
          type="button"
          onClick={() => advance(false)}
          disabled={isSaving}
          className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <SkipForward size={13} />
          Salta
        </button>

        {/* Fatto */}
        <button
          type="button"
          onClick={() => advance(true)}
          disabled={isSaving || isUploading}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-black py-3.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-gray-800 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-black/10"
        >
          {isSaving || isUploading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              {isUploading ? "Caricamento..." : "Salvataggio..."}
            </>
          ) : (
            <>
              <CheckCircle2 size={13} />
              Fatto
              <ChevronRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

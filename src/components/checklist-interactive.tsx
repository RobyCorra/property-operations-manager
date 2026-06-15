"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { updateTaskChecklist } from "@/src/app/actions/checklist";
import { updateCleaningStatus } from "@/src/app/actions/operational";
import { compressImage } from "@/src/lib/compress-image";
import { hapticLight, hapticSuccess, hapticError } from "@/src/lib/haptics";
import { useOnlineStatus } from "@/src/lib/use-online-status";
import {
  saveToQueue,
  getQueueForTask,
  deleteFromQueue,
  clearQueueForTask,
} from "@/src/lib/photo-queue-db";
import {
  saveChecklistProgress,
  clearChecklistProgress,
} from "@/src/lib/checklist-queue-db";
import { Wifi, WifiOff } from "lucide-react";
import {
  Camera,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  Upload,
} from "lucide-react";
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

/** Foto compressa in attesa di upload: tenuta in memoria + IndexedDB. */
interface PendingPhoto {
  localUrl:  string; // blob: URL per anteprima locale
  blob:      Blob;
  filename:  string;
}

interface ChecklistInteractiveProps {
  taskId:       string;
  initialItems: ChecklistItem[];
}

/** Intervallo background upload (ms) */
const UPLOAD_INTERVAL_MS = 15_000;

export default function ChecklistInteractive({ taskId, initialItems }: ChecklistInteractiveProps) {
  const { t, lang } = useLang();
  const isOnline = useOnlineStatus();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const firstUnprocessed = initialItems.findIndex((i) => !i.completed && !i.skipped);
  const [currentIndex, setCurrentIndex] = useState(
    firstUnprocessed === -1 ? initialItems.length : firstUnprocessed
  );

  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [photoFile, setPhotoFile]         = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [uploadError, setUploadError]     = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [photoRequiredError, setPhotoRequiredError] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Coda foto pendenti ─────────────────────────────────────────────────────
  const [pendingPhotos, setPendingPhotos] = useState<Map<string, PendingPhoto>>(new Map());
  const [uploadingIds,  setUploadingIds]  = useState<Set<string>>(new Set());

  // Ref live per i callback asincroni
  const itemsRef         = useRef(items);
  const pendingRef       = useRef(pendingPhotos);
  const uploadingIdsRef  = useRef(uploadingIds);
  itemsRef.current        = items;
  pendingRef.current      = pendingPhotos;
  uploadingIdsRef.current = uploadingIds;

  // ── Ripristino IndexedDB al mount ─────────────────────────────────────────
  useEffect(() => {
    getQueueForTask(taskId).then((entries) => {
      if (!entries.length) return;
      const restored = new Map<string, PendingPhoto>();
      for (const e of entries) {
        restored.set(e.itemId, {
          localUrl: URL.createObjectURL(e.blob),
          blob:     e.blob,
          filename: e.filename,
        });
      }
      setPendingPhotos(restored);
    });
  }, [taskId]);

  // ── Upload singola foto ───────────────────────────────────────────────────
  const uploadOne = useCallback(async (itemId: string) => {
    const pending = pendingRef.current.get(itemId);
    if (!pending) return;
    if (uploadingIdsRef.current.has(itemId)) return; // già in corso

    setUploadingIds((prev) => new Set(prev).add(itemId));

    try {
      const file = new File([pending.blob], pending.filename, { type: pending.blob.type });
      const result = await upload(
        `uploads/cleaning/${taskId}/checklist/${itemId}/${Date.now()}-${pending.filename}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" },
      );
      const blobUrl = result.url;

      // Aggiorna items con l'URL reale
      const updatedItems = itemsRef.current.map((item) =>
        item.id === itemId ? { ...item, photoUrl: blobUrl } : item
      );
      setItems(updatedItems);
      await updateTaskChecklist(taskId, updatedItems); // se fallisce, il catch esterno mantiene la foto in coda

      // Rimuovi dalla coda
      setPendingPhotos((prev) => {
        const next = new Map(prev);
        URL.revokeObjectURL(next.get(itemId)?.localUrl ?? "");
        next.delete(itemId);
        return next;
      });
      await deleteFromQueue(taskId, itemId);
    } catch {
      // Lascia in coda, riprova al prossimo giro
    } finally {
      setUploadingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [taskId]);

  // ── Loop background ogni 15s ──────────────────────────────────────────────
  useEffect(() => {
    const drain = () => {
      for (const itemId of pendingRef.current.keys()) {
        if (!uploadingIdsRef.current.has(itemId)) {
          uploadOne(itemId);
        }
      }
    };

    const interval = setInterval(drain, UPLOAD_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [uploadOne]);

  // ── Auto-sync spunte al ritorno online ────────────────────────────────────
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) return;
    setJustReconnected(true);
    const t = setTimeout(() => setJustReconnected(false), 3000);
    // Appena torna online, sincronizza le spunte salvate offline
    import("@/src/lib/checklist-queue-db").then(async ({ getChecklistProgress, clearChecklistProgress: clearProgress }) => {
      const saved = await getChecklistProgress(taskId);
      if (!saved) return;
      try {
        await updateTaskChecklist(taskId, saved.items as ChecklistItem[]);
        await clearProgress(taskId);
        console.log("[offline] Spunte sincronizzate dopo reconnessione");
      } catch (err) {
        console.warn("[offline] Sync fallita:", err);
      }
    });

    // Riprova anche upload foto in coda
    for (const itemId of pendingRef.current.keys()) {
      if (!uploadingIdsRef.current.has(itemId)) uploadOne(itemId);
    }

    return () => clearTimeout(t);
  }, [isOnline, taskId, uploadOne]);

  // ── Foto helpers ──────────────────────────────────────────────────────────
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

  /** Restituisce l'URL anteprima per un item: prima reale (blob Vercel), poi locale (pending). */
  function getPhotoUrl(item: ChecklistItem): string | null {
    return item.photoUrl ?? pendingRef.current.get(item.id)?.localUrl ?? null;
  }

  function isPending(itemId: string): boolean {
    return pendingRef.current.has(itemId) && !uploadingIdsRef.current.has(itemId);
  }

  function isUploading(itemId: string): boolean {
    return uploadingIdsRef.current.has(itemId);
  }

  // ── Navigazione ───────────────────────────────────────────────────────────
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
    const itemId = items[idx].id;
    const updatedItems = items.map((item, i) =>
      i === idx ? { ...item, completed: false, skipped: false, photoUrl: null } : item
    );
    setItems(updatedItems);
    // Rimuovi eventuale foto pending per questo item
    if (pendingRef.current.has(itemId)) {
      URL.revokeObjectURL(pendingRef.current.get(itemId)!.localUrl);
      setPendingPhotos((prev) => { const next = new Map(prev); next.delete(itemId); return next; });
      await deleteFromQueue(taskId, itemId);
    }
    try {
      await updateTaskChecklist(taskId, updatedItems);
    } catch {
      // best-effort
    }
  };

  // ── Avanza passo ─────────────────────────────────────────────────────────
  const advance = async (completed: boolean) => {
    const currentItem = items[currentIndex];

    // Foto obbligatoria: serve o photoFile nuovo, o foto già caricata, o già in coda
    const hasPhoto =
      !!photoFile ||
      !!currentItem.photoUrl ||
      pendingRef.current.has(currentItem.id);

    if (completed && currentItem.photoRequired && !hasPhoto) {
      setPhotoRequiredError(true);
      setTimeout(() => setPhotoRequiredError(false), 2500);
      hapticError();
      return;
    }
    hapticLight();

    setIsSaving(true);
    setUploadError(null);

    // Se c'è una nuova foto → comprimi e metti in coda (NON upload immediato)
    if (completed && photoFile) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(photoFile);
        const localUrl   = URL.createObjectURL(compressed);

        // Salva in memoria
        setPendingPhotos((prev) => new Map(prev).set(currentItem.id, {
          localUrl,
          blob:     compressed,
          filename: compressed.name,
        }));

        // Salva in IndexedDB (persistenza cross-refresh)
        await saveToQueue(taskId, currentItem.id, compressed, compressed.name);

        // Avvia upload subito in background (non aspettiamo)
        uploadOne(currentItem.id);
      } catch {
        setUploadError("Errore durante la preparazione della foto. Riprova.");
        setIsCompressing(false);
        setIsSaving(false);
        return;
      }
      setIsCompressing(false);
    }

    // Aggiorna item: completed, photoUrl rimane null finché l'upload non termina
    const updatedItems = items.map((item, idx) =>
      idx === currentIndex
        ? { ...item, completed, skipped: !completed, photoUrl: item.photoUrl ?? null }
        : item
    );

    setItems(updatedItems);

    if (isOnline) {
      try {
        await updateTaskChecklist(taskId, updatedItems);
        await clearChecklistProgress(taskId); // rimuovi eventuale coda offline
      } catch {
        // best-effort: salva offline come fallback
        await saveChecklistProgress(taskId, updatedItems);
      }
    } else {
      // Offline: salva in IndexedDB, sarà sincronizzato al ritorno
      await saveChecklistProgress(taskId, updatedItems);
    }

    const completedTranslatedLabel =
      lang && lang !== "it" && currentItem.labelTranslations?.[lang]
        ? currentItem.labelTranslations[lang]
        : currentItem.label;
    const completedItemLabel =
      currentItem.type === "dynamic"
        ? `${completedTranslatedLabel}: ${currentItem.value ?? "N/A"}`
        : completedTranslatedLabel;
    setJustCompleted(completed ? completedItemLabel : null);
    clearPhoto();

    const nextIdx = updatedItems.findIndex(
      (item, idx) => idx > currentIndex && !item.completed && !item.skipped
    );
    setCurrentIndex(nextIdx === -1 ? updatedItems.length : nextIdx);
    setIsSaving(false);
  };

  // ── Completamento task ────────────────────────────────────────────────────
  const handleComplete = async () => {
    // Se ci sono ancora foto in coda, tenta upload forzato prima di completare
    if (pendingRef.current.size > 0) {
      const ids = Array.from(pendingRef.current.keys());
      setIsCompletingTask(true);
      await Promise.allSettled(ids.map((id) => uploadOne(id)));
      // Se dopo il tentativo ci sono ancora pending, blocca
      if (pendingRef.current.size > 0) {
        setIsCompletingTask(false);
        return;
      }
    }

    // Verifica che tutte le foto obbligatorie siano salvate nel DB
    const missingPhotos = itemsRef.current.filter(
      (i) => i.photoRequired && i.completed && !i.photoUrl && !pendingRef.current.has(i.id)
    );
    if (missingPhotos.length > 0) {
      alert(`Foto obbligatoria mancante per: ${missingPhotos.map((i) => i.label).join(", ")}. Riprova o contatta il supporto.`);
      setIsCompletingTask(false);
      return;
    }

    setIsCompletingTask(true);
    try {
      await clearQueueForTask(taskId);
      await updateCleaningStatus(taskId, "AWAITING_REVIEW");
      hapticSuccess();
    } catch (err: unknown) {
      hapticError();
      alert((err as Error).message || "Errore durante il completamento.");
      setIsCompletingTask(false);
    }
  };

  // ── Valori derivati ──────────────────────────────────────────────────────
  const currentItem       = items[currentIndex];
  const completedCount    = items.filter((i) => i.completed).length;
  const allDone           = currentIndex >= items.length;
  const allItemsCompleted = items.every((i) => i.completed);
  const incompleteItems   = items.map((item, idx) => ({ ...item, idx })).filter((i) => !i.completed);
  const pendingCount      = pendingPhotos.size;
  const uploadingCount    = uploadingIds.size;

  // ── Schermata completamento ───────────────────────────────────────────────
  if (allDone) {
    const photosWithUrls = items.filter((i) => i.photoUrl || pendingPhotos.has(i.id));

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
          <p className="text-[10px] text-slate-400 mt-2 text-center">{t.completeHint}</p>
        </div>
      );
    }

    // ── Banner foto ancora in caricamento ────────────────────────────────────
    const showUploadBanner = pendingCount > 0 || uploadingCount > 0;

    return (
      <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">{t.allDoneTitle}</h3>
        <p className="text-sm text-slate-500 mb-6">
          {t.allDoneCount(completedCount, items.length)}
        </p>

        {/* Banner foto in attesa di upload */}
        {showUploadBanner && (
          <div className="mb-5 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 size={16} className="text-blue-500 animate-spin shrink-0" />
              <p className="text-sm font-bold text-blue-800 text-left">
                {uploadingCount > 0
                  ? `📤 Caricamento foto in corso... (${uploadingCount} rimaste)`
                  : `📸 ${pendingCount} foto da caricare`}
              </p>
            </div>
            <p className="text-[11px] text-blue-600 text-left mb-3 leading-relaxed">
              Le foto vengono inviate in background. Puoi aspettare o
              tentare subito se hai connessione.
            </p>
            <button
              type="button"
              onClick={() => {
                for (const id of pendingRef.current.keys()) {
                  uploadOne(id);
                }
              }}
              disabled={uploadingCount > 0}
              className="flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              <Upload size={12} /> Riprova ora
            </button>
          </div>
        )}

        {/* Miniature foto */}
        {photosWithUrls.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              {t.photosAttached(photosWithUrls.length)}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {photosWithUrls.map((item) => {
                const url     = item.photoUrl ?? pendingPhotos.get(item.id)?.localUrl;
                const pending = isPending(item.id);
                const loading = isUploading(item.id);
                return (
                  <div key={item.id} className="relative">
                    <a href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={item.label}
                        className={`w-16 h-16 object-cover rounded-xl border shadow-sm hover:scale-105 transition-transform ${
                          pending || loading ? "border-blue-300 opacity-75" : "border-slate-100"
                        }`}
                      />
                    </a>
                    {(pending || loading) && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-500/20">
                        {loading
                          ? <Loader2 size={14} className="text-blue-600 animate-spin" />
                          : <span className="text-[8px] font-black text-blue-700">⏳</span>
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottone completa — disabilitato se foto ancora in caricamento */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={isCompletingTask || showUploadBanner}
          className="w-full py-4 rounded-2xl text-sm font-bold bg-black text-white hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompletingTask ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> {t.completing}
            </span>
          ) : showUploadBanner ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Caricamento foto...
            </span>
          ) : (
            t.completeBtn
          )}
        </button>
        <p className="text-[10px] text-slate-400 mt-3">{t.notifyHint}</p>
      </div>
    );
  }

  // ── Vista passo ──────────────────────────────────────────────────────────
  const progress = Math.round((completedCount / items.length) * 100);
  const translatedLabel =
    lang && lang !== "it" && currentItem.labelTranslations?.[lang]
      ? currentItem.labelTranslations[lang]
      : currentItem.label;

  const itemLabel =
    currentItem.type === "dynamic"
      ? `${translatedLabel}: ${currentItem.value ?? "N/A"}`
      : translatedLabel;

  // ── Item già completato ───────────────────────────────────────────────────
  if (currentItem.completed) {
    const photoUrl    = getPhotoUrl(currentItem);
    const photoIsPend = isPending(currentItem.id);
    const photoIsLoad = isUploading(currentItem.id);

    return (
      <div className="animate-in fade-in duration-300">

        {/* ── Banner offline ──────────────────────────────────────────── */}
        {!isOnline && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <WifiOff size={16} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">Sei offline</p>
              <p className="text-xs text-amber-600">Le spunte vengono salvate localmente e sincronizzate appena torni online.</p>
            </div>
          </div>
        )}
        {justReconnected && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <Wifi size={16} className="text-green-500 shrink-0" />
            <p className="text-xs text-green-700 font-medium">Connesso — spunte sincronizzate ✓</p>
          </div>
        )}

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
          {photoUrl && (
            <div className="mt-3 flex items-center gap-3 pl-8">
              <div className="relative shrink-0">
                <a href={photoUrl} target="_blank" rel="noreferrer">
                  <img
                    src={photoUrl}
                    alt="foto"
                    className={`w-12 h-12 object-cover rounded-xl border shadow-sm hover:scale-105 transition-transform ${
                      photoIsPend || photoIsLoad ? "border-blue-300 opacity-75" : "border-green-200"
                    }`}
                  />
                </a>
                {(photoIsPend || photoIsLoad) && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-500/20">
                    {photoIsLoad
                      ? <Loader2 size={12} className="text-blue-600 animate-spin" />
                      : <span className="text-[8px]">⏳</span>}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                photoIsPend ? "text-blue-500" : photoIsLoad ? "text-blue-400" : "text-green-600"
              }`}>
                {photoIsLoad ? "Caricamento..." : photoIsPend ? "In coda" : "Foto allegata"}
              </span>
            </div>
          )}
        </div>

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

  // ── Item da fare ──────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {t.stepOf(currentIndex + 1, items.length)}
          </span>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="text-[9px] font-black text-blue-500 flex items-center gap-1">
                {uploadingCount > 0
                  ? <><Loader2 size={9} className="animate-spin" /> {uploadingCount} foto</>
                  : <>📸 {pendingCount} in coda</>}
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {justCompleted && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={13} />
          <span className="truncate">{t.prevCompleted(justCompleted!)}</span>
        </div>
      )}

      {photoRequiredError && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={13} />
          <span>{t.photoRequiredError}</span>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm mb-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 leading-snug">{itemLabel}</h3>
      </div>

      {/* Sezione foto */}
      {currentItem.photoRequired && (
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t.photoLabel}
            </p>
            <span className="text-[9px] font-black uppercase tracking-wide text-white bg-rose-500 rounded-full px-2 py-0.5">
              {t.required}
            </span>
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
                <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                  📸 Pronta — verrà inviata in background
                </p>
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-400 border-2 border-rose-400 py-4 text-sm font-bold text-white hover:bg-slate-500 transition-colors"
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
      )}

      {/* Azioni */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={goBack}
          disabled={currentIndex === 0 || isSaving}
          className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} />
          {t.back}
        </button>

        <button
          type="button"
          onClick={() => advance(false)}
          disabled={isSaving}
          className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <SkipForward size={13} />
          {t.skip}
        </button>

        <button
          type="button"
          onClick={() => advance(true)}
          disabled={isSaving || isCompressing}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-green-600 py-3.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-700 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-green-600/20"
        >
          {isCompressing ? (
            <><Loader2 size={13} className="animate-spin" /> Preparazione...</>
          ) : isSaving ? (
            <><Loader2 size={13} className="animate-spin" /> {t.saving}</>
          ) : (
            <><CheckCircle2 size={13} /> {t.done} <ChevronRight size={13} /></>
          )}
        </button>
      </div>
    </div>
  );
}

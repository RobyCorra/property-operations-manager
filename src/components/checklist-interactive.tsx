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
} from "@/src/lib/photo-queue-db";
import {
  saveChecklistProgress,
  clearChecklistProgress,
} from "@/src/lib/checklist-queue-db";
import {
  Camera,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Send,
  AlertCircle,
  Trash2,
  WifiOff,
} from "lucide-react";
import { useLang } from "@/src/components/lang-context";
import { useToast } from "@/src/components/toast-provider";

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
  phase?: string;
  answerType?: string;
  answer?: string | null;
  /** Foto scattata ma non caricata: rete assente al momento dell'invio. */
  photoPending?: boolean;
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
  const toast = useToast();
  const { t, lang } = useLang();
  const isOnline = useOnlineStatus();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  // Modalità lista: nessun indice corrente. Fotocamera per singolo punto +
  // schermata di revisione finale.
  const [cameraItemId, setCameraItemId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen]     = useState(false);

  const [isCompressing, setIsCompressing] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [uploadError, setUploadError]     = useState<string | null>(null);
  // Diagnostica connessione: quanti giri di invio sono falliti di fila e da
  // quanto la coda non si svuota. Serve a dare consigli progressivi.
  const [failedRounds, setFailedRounds] = useState(0);
  const [queuedSince, setQueuedSince]   = useState<number | null>(null);
  const [slowNetwork, setSlowNetwork]   = useState(false);
  const [sendBlocked, setSendBlocked]   = useState(0);
  const [taskSent, setTaskSent]         = useState(false); // FIX 4: 🎉 solo dopo l'invio riuscito
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

    // Solution A — timeout sull'upload: su rete morente non resta appeso
    // all'infinito; scatta l'abort, la foto torna in coda e riparte al giro dopo.
    const controller = new AbortController();
    const uploadTimeout = setTimeout(() => controller.abort(), 15000);
    try {
      const file = new File([pending.blob], pending.filename, { type: pending.blob.type });
      const result = await upload(
        `uploads/cleaning/${taskId}/checklist/${itemId}/${Date.now()}-${pending.filename}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload", abortSignal: controller.signal },
      );
      clearTimeout(uploadTimeout);
      const blobUrl = result.url;

      // Aggiorna items con l'URL reale e azzera l'eventuale flag "in attesa"
      // (foto marcata photoPending al completamento e poi arrivata).
      const updatedItems = itemsRef.current.map((item) =>
        item.id === itemId ? { ...item, photoUrl: blobUrl, photoPending: false } : item
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
      setFailedRounds(0);
      setSendBlocked(0);
    } catch {
      // Timeout/abort o errore rete: lascia in coda, riprova al prossimo giro
      setFailedRounds((n) => n + 1);
    } finally {
      clearTimeout(uploadTimeout);
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

  // ── Soglia "connessione lenta": coda non vuota da oltre 15 secondi ───────
  useEffect(() => {
    if (pendingPhotos.size === 0) {
      setQueuedSince(null);
      setSlowNetwork(false);
      return;
    }
    if (queuedSince === null) {
      setQueuedSince(Date.now());
      return;
    }
    const timer = setTimeout(() => setSlowNetwork(true), 15_000);
    return () => clearTimeout(timer);
  }, [pendingPhotos.size, queuedSince]);

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

  // Persistenza spunte (FIX 1: locale subito, server in background senza await).
  const persist = (updatedItems: ChecklistItem[]) => {
    setItems(updatedItems);
    saveChecklistProgress(taskId, updatedItems).catch(() => {});
    updateTaskChecklist(taskId, updatedItems)
      .then(() => clearChecklistProgress(taskId))
      .catch(() => { /* resta in coda locale, sync al ritorno online */ });
  };

  // Spunta / de-spunta un punto. Non blocca sulla foto: la verifica è all'invio.
  const toggleItem = (item: ChecklistItem) => {
    hapticLight();
    const next = !item.completed;
    const updated = itemsRef.current.map((i) =>
      i.id === item.id ? { ...i, completed: next, skipped: false } : i
    );
    persist(updated);
  };

  // Risposta Sì/No della domanda d'ingresso.
  const setEntryAnswer = (item: ChecklistItem, answer: "si" | "no") => {
    hapticLight();
    const updated = itemsRef.current.map((i) =>
      i.id === item.id ? { ...i, completed: true, skipped: false, answer } : i
    );
    persist(updated);
  };

  // Apre la fotocamera per uno specifico punto.
  const openCamera = (itemId: string) => {
    setCameraItemId(itemId);
    setUploadError(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
      photoInputRef.current.click();
    }
  };

  // Comprime + accoda + upload in background, e segna il punto completato.
  const attachPhoto = async (itemId: string, file: File) => {
    setUploadError(null);
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      const localUrl = URL.createObjectURL(compressed);
      setPendingPhotos((prev) => new Map(prev).set(itemId, { localUrl, blob: compressed, filename: compressed.name }));
      await saveToQueue(taskId, itemId, compressed, compressed.name);
      uploadOne(itemId);
    } catch (err) {
      setUploadError((err as Error)?.message || "Errore durante la preparazione della foto. Riprova.");
      setIsCompressing(false);
      return;
    }
    setIsCompressing(false);
    hapticLight();
    // Allegare la foto conferma il punto come fatto.
    const updated = itemsRef.current.map((i) =>
      i.id === itemId ? { ...i, completed: true, skipped: false } : i
    );
    persist(updated);
  };

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = cameraItemId;
    if (file && itemId) await attachPhoto(itemId, file);
  };

  // Rifai un punto: togli spunta e foto (dalla coda e dall'item).
  const resetItem = async (itemId: string) => {
    const updated = itemsRef.current.map((i) =>
      i.id === itemId ? { ...i, completed: false, skipped: false, photoUrl: null, photoPending: false } : i
    );
    if (pendingRef.current.has(itemId)) {
      URL.revokeObjectURL(pendingRef.current.get(itemId)!.localUrl);
      setPendingPhotos((prev) => { const next = new Map(prev); next.delete(itemId); return next; });
      await deleteFromQueue(taskId, itemId);
    }
    persist(updated);
  };

  // ── Completamento task ────────────────────────────────────────────────────
  const handleComplete = async () => {
    setIsCompletingTask(true);

    // FIX 3 — La pulizia si può SEMPRE chiudere.
    // Se ci sono foto ancora in coda, tenta di farle salire per pochi secondi,
    // ma NON bloccare: se restano, si completa lo stesso e partono da sole in
    // background (la coda non viene svuotata). Il blocco resta SOLO per le foto
    // obbligatorie mai scattate (controllo più sotto).
    if (pendingRef.current.size > 0) {
      const ids = Array.from(pendingRef.current.keys());
      const tryUploads = Promise.allSettled(ids.map((id) => uploadOne(id)));
      const timeout = new Promise((r) => setTimeout(r, 4000));
      await Promise.race([tryUploads, timeout]);
    }

    // Blocca SOLO se manca una foto obbligatoria mai scattata (non le foto già
    // fatte e ancora in caricamento, escluse da photoPending/coda).
    const missingPhotos = itemsRef.current.filter(
      (i) =>
        i.photoRequired &&
        i.completed &&
        (i.answerType !== "yesno" || i.answer === "si") &&
        !i.photoUrl &&
        !i.photoPending &&
        !pendingRef.current.has(i.id)
    );
    if (missingPhotos.length > 0) {
      toast.error(`Foto obbligatoria mancante per: ${missingPhotos.map((i) => i.label).join(", ")}. Riprova o contatta il supporto.`);
      setIsCompletingTask(false);
      return;
    }

    // Marca come "in caricamento" (photoPending) le foto ancora in coda, così il
    // manager sa che arriveranno; poi procede comunque.
    const stuck = new Set(pendingRef.current.keys());
    const updated = stuck.size > 0
      ? itemsRef.current.map((i) => (stuck.has(i.id) ? { ...i, photoPending: true } : i))
      : itemsRef.current;
    if (stuck.size > 0) setItems(updated);

    try {
      // La coda NON viene svuotata: eventuali foto rimaste partono da sole
      // appena torna il segnale, anche a pulizia già inviata o approvata.
      if (stuck.size > 0) await updateTaskChecklist(taskId, updated);
      await updateCleaningStatus(taskId, "AWAITING_REVIEW");
      setTaskSent(true);
      hapticSuccess();
    } catch (err: unknown) {
      hapticError();
      toast.error((err as Error).message || "Errore durante il completamento.");
      setIsCompletingTask(false);
    }
  };

  /**
   * Ultima risorsa: invia marcando le foto rimaste come "non caricate".
   * Le foto restano in coda e partono da sole quando torna il segnale;
   * il manager vede la segnalazione sulla scheda.
   */
  const handleCompleteWithoutPhotos = async () => {
    setIsCompletingTask(true);
    const stuck = new Set(pendingRef.current.keys());
    const updated = itemsRef.current.map((i) =>
      stuck.has(i.id) ? { ...i, photoPending: true } : i
    );
    setItems(updated);
    try {
      await updateTaskChecklist(taskId, updated);
      await updateCleaningStatus(taskId, "AWAITING_REVIEW");
      setTaskSent(true);
      hapticSuccess();
    } catch (err: unknown) {
      hapticError();
      toast.error((err as Error).message || "Errore durante il completamento.");
      setIsCompletingTask(false);
    }
  };

  const retryAllNow = () => {
    for (const id of pendingRef.current.keys()) uploadOne(id);
  };

  // ── Valori derivati ──────────────────────────────────────────────────────
  const entryItems    = items.filter((i) => i.phase === "entry");
  const cleaningItems = items.filter((i) => i.phase !== "entry");
  const completedCleaning = cleaningItems.filter((i) => i.completed).length;
  const totalCleaning = cleaningItems.length;
  const progress = totalCleaning > 0 ? Math.round((completedCleaning / totalCleaning) * 100) : 0;
  const completedCount = items.filter((i) => i.completed).length;
  const pendingCount   = pendingPhotos.size;
  const uploadingCount = uploadingIds.size;

  // Helper basati sullo STATO (non sui ref) — sicuri da usare in render.
  const photoUrlOf = (i: ChecklistItem): string | null => i.photoUrl ?? pendingPhotos.get(i.id)?.localUrl ?? null;
  const isPend = (id: string) => pendingPhotos.has(id) && !uploadingIds.has(id);
  const isUp   = (id: string) => uploadingIds.has(id);

  // Foto richiesta "adesso" (per le Sì/No conta solo se la risposta è "Sì").
  const requiresPhotoNow = (i: ChecklistItem) =>
    !!i.photoRequired && (i.answerType !== "yesno" || i.answer === "si");
  // Foto obbligatorie davvero mancanti (le foto in coda non contano: stanno salendo).
  const missingPhotoItems = items.filter(
    (i) => requiresPhotoNow(i) && i.completed && !i.photoUrl && !i.photoPending && !pendingPhotos.has(i.id)
  );
  const incompleteCleaning = cleaningItems.filter((i) => !i.completed);
  const canSend = incompleteCleaning.length === 0 && missingPhotoItems.length === 0;
  const labelOf = (i: ChecklistItem) => {
    const base = (lang && i.labelTranslations?.[lang]) ? i.labelTranslations[lang] : i.label;
    return i.type === "dynamic" ? `${base}: ${i.value ?? "N/A"}` : base;
  };
  const scrollToItem = (id: string) => {
    try { document.getElementById(`cl-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); } catch { /* noop */ }
  };

  // ── Schermata "inviata" (FIX 4: i festeggiamenti solo DOPO l'invio) ──────────
  if (taskSent) {
    return (
      <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">{t.sentTitle}</h3>
        <p className="text-sm text-slate-500">{t.sentSub}</p>
      </div>
    );
  }


  // ── Schermata di revisione / invio ─────────────────────────────────────────
  if (reviewOpen) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          type="button"
          onClick={() => setReviewOpen(false)}
          className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft size={13} /> {t.back}
        </button>

        {!canSend ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">{t.incompleteTitle}</p>
                <p className="text-xs text-amber-600 mt-0.5">{t.cklReviewMissingSub}</p>
              </div>
            </div>
            <div className="space-y-2">
              {incompleteCleaning.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-amber-100 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-800 truncate">☐ {labelOf(item)}</p>
                  <button type="button" onClick={() => { setReviewOpen(false); setTimeout(() => scrollToItem(item.id), 60); }} className="shrink-0 rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">{t.cklReviewGo}</button>
                </div>
              ))}
              {missingPhotoItems.map((item) => (
                <div key={`p-${item.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-rose-100 px-4 py-3">
                  <p className="text-xs font-semibold text-rose-700 truncate">📷 {labelOf(item)}</p>
                  <button type="button" onClick={() => { setReviewOpen(false); setTimeout(() => scrollToItem(item.id), 60); }} className="shrink-0 rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white">{t.cklReviewGo}</button>
                </div>
              ))}
            </div>
            <button type="button" disabled className="mt-4 w-full py-4 rounded-2xl text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed">{t.cklReviewFixFirst}</button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={30} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{t.lastStepTitle}</h3>
            <div className="mx-auto max-w-xs mb-5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-[12px] font-semibold text-amber-800 leading-snug">{t.lastStepSub}</p>
            </div>
            {(pendingCount > 0 || uploadingCount > 0) && (
              <p className="text-[11px] text-blue-600 mb-3 font-medium">{t.sendPhotosBg}</p>
            )}
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompletingTask}
              className="w-full py-5 rounded-2xl text-lg font-black bg-green-600 text-white hover:bg-green-700 active:scale-95 disabled:opacity-50 shadow-xl shadow-green-600/30 transition-all"
            >
              {isCompletingTask
                ? (<span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> {t.completing}</span>)
                : (<span className="flex items-center justify-center gap-2"><Send size={18} /> {t.completeBtn}</span>)}
            </button>
            <p className="text-[10px] text-slate-400 mt-3">{t.notifyHint}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Vista LISTA ────────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-300">
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhotoSelected} />

      {!isOnline && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <WifiOff size={16} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">{t.cklOffline}</p>
        </div>
      )}
      {isCompressing && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5">
          <Loader2 size={15} className="text-blue-500 animate-spin shrink-0" />
          <p className="text-xs text-blue-700 font-semibold">{t.cklPreparingPhoto}</p>
        </div>
      )}
      {uploadError && (
        <p className="mb-3 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">⚠️ {uploadError}</p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500">{completedCleaning} / {totalCleaning}</span>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className={`text-[9px] font-black flex items-center gap-1 ${slowNetwork ? "text-amber-600" : "text-blue-500"}`}>
                {uploadingCount > 0 ? <><Loader2 size={9} className="animate-spin" /> {uploadingCount} foto</> : <>📸 {pendingCount} in coda</>}
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {missingPhotoItems.length > 0 && (
          <p className="text-[11px] text-rose-500 font-bold mt-1.5">⚠ {t.cklMissingPhotosN(missingPhotoItems.length)}</p>
        )}
      </div>

      {entryItems.length > 0 && (
        <>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 mt-1">{t.entryTitle}</p>
          <div className="space-y-2 mb-4">
            {entryItems.map((item) => {
              const isYesNo = item.answerType === "yesno";
              const needPhoto = requiresPhotoNow(item);
              const photoUrl = photoUrlOf(item);
              return (
                <div key={item.id} id={`cl-${item.id}`} className="rounded-2xl bg-white border border-slate-100 p-3.5 shadow-sm">
                  <p className="text-sm font-bold text-slate-800 mb-2.5">{labelOf(item)}</p>
                  {isYesNo ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setEntryAnswer(item, "si")} className={`rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${item.answer === "si" ? "bg-rose-50 border-rose-400 text-rose-700" : "bg-white border-slate-200 text-slate-500"}`}>{t.entryYes}</button>
                      <button type="button" onClick={() => setEntryAnswer(item, "no")} className={`rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${item.answer === "no" ? "bg-green-50 border-green-400 text-green-700" : "bg-white border-slate-200 text-slate-500"}`}>{t.entryNo}</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => toggleItem(item)} className={`w-full rounded-xl border-2 py-2.5 text-sm font-bold ${item.completed ? "bg-green-50 border-green-400 text-green-700" : "bg-white border-slate-200 text-slate-500"}`}>{item.completed ? "✓ " + t.done : t.cklMarkDone}</button>
                  )}
                  {needPhoto && (
                    <div className="mt-2.5">
                      {photoUrl ? (
                        <div className="flex items-center gap-2.5">
                          <button type="button" onClick={() => openCamera(item.id)} className="relative shrink-0">
                            <img src={photoUrl} alt="" className={`w-12 h-12 object-cover rounded-lg border ${isUp(item.id) || isPend(item.id) ? "border-blue-300 opacity-75" : "border-green-200"}`} />
                          </button>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-green-600">{isUp(item.id) ? t.cklPhotoUploading : isPend(item.id) ? t.cklPhotoQueued : t.cklPhotoAttached}</span>
                          <button type="button" onClick={() => resetItem(item.id)} className="ml-auto w-7 h-7 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0"><Trash2 size={13} /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => openCamera(item.id)} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white bg-slate-500 border-2 border-rose-400"><Camera size={16} /> {t.takePhoto}</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {cleaningItems.length > 0 && (
        <>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.checklistTitle}</p>
          <div className="space-y-2">
            {cleaningItems.map((item) => {
              const photoUrl = photoUrlOf(item);
              const missing = requiresPhotoNow(item) && item.completed && !photoUrl && !item.photoPending;
              return (
                <div key={item.id} id={`cl-${item.id}`} className={`flex items-center gap-3 rounded-2xl border p-3 bg-white shadow-sm ${missing ? "border-rose-200 bg-rose-50/40" : item.completed ? "border-emerald-100" : "border-slate-100"}`}>
                  <button type="button" onClick={() => toggleItem(item)} className={`shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? "bg-green-600 border-green-600 text-white" : "border-slate-300 text-transparent"}`}>
                    <CheckCircle2 size={16} />
                  </button>
                  <div className="flex-1 min-w-0" onClick={() => toggleItem(item)}>
                    <p className={`text-sm font-semibold ${item.completed ? "text-slate-800" : "text-slate-600"}`}>{labelOf(item)}</p>
                    {item.photoRequired && (
                      <p className={`text-[10.5px] font-bold mt-0.5 ${missing ? "text-rose-600" : photoUrl ? "text-green-600" : "text-slate-400"}`}>
                        {missing ? t.cklPhotoMissingWarn : photoUrl ? (isUp(item.id) ? t.cklPhotoUploading : isPend(item.id) ? t.cklPhotoQueued : t.cklPhotoAttached) : t.cklPhotoRequiredLabel}
                      </p>
                    )}
                  </div>
                  {item.type === "dynamic" && item.value != null && (
                    <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700">{item.value}</span>
                  )}
                  {item.photoRequired && (
                    photoUrl ? (
                      <button type="button" onClick={() => openCamera(item.id)} className="shrink-0 relative">
                        <img src={photoUrl} alt="" className={`w-11 h-11 object-cover rounded-xl border ${isUp(item.id) || isPend(item.id) ? "border-blue-300 opacity-75" : "border-green-200"}`} />
                        {(isUp(item.id) || isPend(item.id)) && <span className="absolute inset-0 flex items-center justify-center">{isUp(item.id) ? <Loader2 size={13} className="text-blue-600 animate-spin" /> : <span className="text-[9px]">⏳</span>}</span>}
                      </button>
                    ) : (
                      <button type="button" onClick={() => openCamera(item.id)} className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${missing ? "bg-rose-100 border border-rose-300" : "bg-violet-50 border border-violet-100"}`}><Camera size={18} className={missing ? "text-rose-500" : "text-violet-500"} /></button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="sticky bottom-3 z-10 mt-5">
        <button
          type="button"
          onClick={() => setReviewOpen(true)}
          disabled={isCompletingTask}
          className={`w-full py-5 rounded-2xl text-base font-black uppercase tracking-wide shadow-xl active:scale-95 transition-all disabled:opacity-50 ${canSend ? "bg-green-600 text-white shadow-green-600/30" : "bg-slate-900 text-white shadow-slate-900/20"}`}
        >
          <span className="flex items-center justify-center gap-2"><Send size={18} /> {t.cklReviewAndSend}</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { updateMaintenanceTaskProgress, completeMaintenancePublic } from "@/src/app/actions/maintenance-token";
import type { MaintenanceTaskItem } from "@/src/app/actions/maintenance-token";
import { compressImage } from "@/src/lib/compress-image";
import {
  saveToQueue,
  getQueueForTask,
  deleteFromQueue,
  clearQueueForTask,
} from "@/src/lib/photo-queue-db";
import { Camera, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle, Trash2, Upload } from "lucide-react";

interface Props {
  ticketId:     string;
  initialTasks: MaintenanceTaskItem[];
}

interface PendingPhoto {
  localUrl: string;
  blob:     Blob;
  filename: string;
}

const UPLOAD_INTERVAL_MS = 15_000;

export default function MaintenanceChecklistInteractive({ ticketId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<MaintenanceTaskItem[]>(initialTasks);

  const firstUnprocessed = initialTasks.findIndex((t) => !t.completed);
  const [currentIndex, setCurrentIndex] = useState(
    firstUnprocessed === -1 ? initialTasks.length : firstUnprocessed
  );

  const [photoPreview, setPhotoPreview]     = useState<string | null>(null);
  const [photoFile, setPhotoFile]           = useState<File | null>(null);
  const [isCompressing, setIsCompressing]   = useState(false);
  const [isSaving, setIsSaving]             = useState(false);
  const [isCompleting, setIsCompleting]     = useState(false);
  const [uploadError, setUploadError]       = useState<string | null>(null);
  const [justCompleted, setJustCompleted]   = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Coda foto pendenti ─────────────────────────────────────────────────────
  const [pendingPhotos, setPendingPhotos] = useState<Map<string, PendingPhoto>>(new Map());
  const [uploadingIds,  setUploadingIds]  = useState<Set<string>>(new Set());

  const tasksRef         = useRef(tasks);
  const pendingRef       = useRef(pendingPhotos);
  const uploadingIdsRef  = useRef(uploadingIds);
  tasksRef.current        = tasks;
  pendingRef.current      = pendingPhotos;
  uploadingIdsRef.current = uploadingIds;

  // ── Ripristino IndexedDB al mount ──────────────────────────────────────────
  useEffect(() => {
    getQueueForTask(ticketId).then((entries) => {
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
  }, [ticketId]);

  // ── Upload singola foto ────────────────────────────────────────────────────
  const uploadOne = useCallback(async (taskId: string) => {
    const pending = pendingRef.current.get(taskId);
    if (!pending) return;
    if (uploadingIdsRef.current.has(taskId)) return;

    setUploadingIds((prev) => new Set(prev).add(taskId));

    try {
      const file = new File([pending.blob], pending.filename, { type: pending.blob.type });
      const result = await upload(
        `uploads/maintenance/${ticketId}/tasks/${taskId}/${Date.now()}-${pending.filename}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" },
      );
      const blobUrl = result.url;

      // Aggiorna task con URL reale
      const updatedTasks = tasksRef.current.map((t) =>
        t.id === taskId ? { ...t, photoUrl: blobUrl } : t
      );
      setTasks(updatedTasks);
      await updateMaintenanceTaskProgress(ticketId, taskId, true, blobUrl).catch(() => {});

      // Rimuovi dalla coda
      setPendingPhotos((prev) => {
        const next = new Map(prev);
        URL.revokeObjectURL(next.get(taskId)?.localUrl ?? "");
        next.delete(taskId);
        return next;
      });
      await deleteFromQueue(ticketId, taskId);
    } catch {
      // Lascia in coda, riprova al prossimo giro
    } finally {
      setUploadingIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }, [ticketId]);

  // ── Loop background ogni 15s ───────────────────────────────────────────────
  useEffect(() => {
    const drain = () => {
      for (const id of pendingRef.current.keys()) {
        if (!uploadingIdsRef.current.has(id)) uploadOne(id);
      }
    };
    const interval = setInterval(drain, UPLOAD_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [uploadOne]);

  // ── Helpers foto ───────────────────────────────────────────────────────────
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

  function getPhotoUrl(task: MaintenanceTaskItem): string | null {
    return task.photoUrl ?? pendingRef.current.get(task.id)?.localUrl ?? null;
  }
  function isPending(id: string)   { return pendingRef.current.has(id) && !uploadingIdsRef.current.has(id); }
  function isUploading(id: string) { return uploadingIdsRef.current.has(id); }

  // ── Navigazione ────────────────────────────────────────────────────────────
  const goBack    = () => { if (currentIndex <= 0) return; clearPhoto(); setJustCompleted(null); setCurrentIndex((p) => p - 1); };
  const goForward = () => { clearPhoto(); setJustCompleted(null); setCurrentIndex((p) => p + 1); };
  const goToItem  = (idx: number) => { clearPhoto(); setJustCompleted(null); setCurrentIndex(idx); };

  const resetTask = async (idx: number) => {
    const tid = tasks[idx].id;
    const updated = tasks.map((t, i) => i === idx ? { ...t, completed: false, photoUrl: null } : t);
    setTasks(updated);
    if (pendingRef.current.has(tid)) {
      URL.revokeObjectURL(pendingRef.current.get(tid)!.localUrl);
      setPendingPhotos((prev) => { const next = new Map(prev); next.delete(tid); return next; });
      await deleteFromQueue(ticketId, tid);
    }
    try { await updateMaintenanceTaskProgress(ticketId, tid, false, null); } catch { /* best-effort */ }
  };

  // ── Avanza passo ───────────────────────────────────────────────────────────
  const advance = async () => {
    if (isSaving || isCompressing) return;

    const hasPhoto =
      !!photoFile ||
      !!currentTask.photoUrl ||
      pendingRef.current.has(currentTask.id);

    if (currentTask.photoRequired && !hasPhoto) return; // già gestito dal disabled

    setIsSaving(true);
    setUploadError(null);

    if (photoFile) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(photoFile);
        const localUrl   = URL.createObjectURL(compressed);

        setPendingPhotos((prev) => new Map(prev).set(currentTask.id, {
          localUrl,
          blob:     compressed,
          filename: compressed.name,
        }));
        await saveToQueue(ticketId, currentTask.id, compressed, compressed.name);
        uploadOne(currentTask.id); // avvio immediato in background
      } catch {
        setUploadError("Errore nella preparazione della foto. Riprova.");
        setIsCompressing(false);
        setIsSaving(false);
        return;
      }
      setIsCompressing(false);
    }

    const updated = tasks.map((t, i) =>
      i === currentIndex ? { ...t, completed: true, photoUrl: t.photoUrl ?? null } : t
    );
    setTasks(updated);
    try { await updateMaintenanceTaskProgress(ticketId, currentTask.id, true, currentTask.photoUrl ?? null); } catch { /* best-effort */ }

    setJustCompleted(currentTask.label);
    clearPhoto();
    const nextIdx = updated.findIndex((t, i) => i > currentIndex && !t.completed);
    setCurrentIndex(nextIdx === -1 ? updated.length : nextIdx);
    setIsSaving(false);
  };

  // ── Completamento intervento ───────────────────────────────────────────────
  const handleComplete = async () => {
    if (pendingRef.current.size > 0) {
      setIsCompleting(true);
      await Promise.allSettled(Array.from(pendingRef.current.keys()).map(uploadOne));
      if (pendingRef.current.size > 0) { setIsCompleting(false); return; }
    }
    setIsCompleting(true);
    try {
      await clearQueueForTask(ticketId);
      await completeMaintenancePublic(ticketId);
      window.location.reload();
    } catch (err: unknown) {
      alert((err as Error).message || "Errore durante il completamento.");
      setIsCompleting(false);
    }
  };

  // ── Valori derivati ────────────────────────────────────────────────────────
  const currentTask    = tasks[currentIndex];
  const completedCount = tasks.filter((t) => t.completed).length;
  const allDone        = currentIndex >= tasks.length;
  const allCompleted   = tasks.every((t) => t.completed);
  const pendingCount   = pendingPhotos.size;
  const uploadingCount = uploadingIds.size;

  // ── Schermata completamento ────────────────────────────────────────────────
  if (allDone) {
    const photosWithUrls = tasks.filter((t) => t.photoUrl || pendingPhotos.has(t.id));

    if (!allCompleted) {
      const incomplete = tasks.map((t, idx) => ({ ...t, idx })).filter((t) => !t.completed);
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Task non completate</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {incomplete.length} task {incomplete.length === 1 ? "richiede" : "richiedono"} attenzione.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {incomplete.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-amber-100 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-800 truncate min-w-0">{task.label}</p>
                  <button type="button" onClick={() => goToItem(task.idx)}
                    className="shrink-0 flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-gray-800 active:scale-95 transition-all">
                    Risolvi <ChevronRight size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button type="button" disabled className="w-full py-4 rounded-2xl text-sm font-bold bg-gray-100 text-gray-400 cursor-not-allowed">
            ✅ Completa intervento
          </button>
          <p className="text-[10px] text-slate-400 mt-2 text-center">Completa tutte le task per inviare al manager.</p>
        </div>
      );
    }

    const showUploadBanner = pendingCount > 0 || uploadingCount > 0;

    return (
      <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-6xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Tutte le task completate!</h3>
        <p className="text-sm text-slate-500 mb-5">
          {completedCount} di {tasks.length} task {tasks.length === 1 ? "completata" : "completate"}
        </p>

        {/* Banner foto in caricamento */}
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
              Le foto vengono inviate in background. Puoi aspettare o riprovare subito.
            </p>
            <button type="button"
              onClick={() => { for (const id of pendingRef.current.keys()) uploadOne(id); }}
              disabled={uploadingCount > 0}
              className="flex items-center gap-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors">
              <Upload size={12} /> Riprova ora
            </button>
          </div>
        )}

        {/* Miniature foto */}
        {photosWithUrls.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              {photosWithUrls.length} foto {photosWithUrls.length === 1 ? "allegata" : "allegate"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {photosWithUrls.map((task) => {
                const url     = task.photoUrl ?? pendingPhotos.get(task.id)?.localUrl;
                const pend    = isPending(task.id);
                const loading = isUploading(task.id);
                return (
                  <div key={task.id} className="relative">
                    <a href={url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={task.label}
                        className={`w-16 h-16 object-cover rounded-xl border shadow-sm hover:scale-105 transition-transform ${pend || loading ? "border-blue-300 opacity-75" : "border-slate-100"}`} />
                    </a>
                    {(pend || loading) && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-500/20">
                        {loading ? <Loader2 size={14} className="text-blue-600 animate-spin" /> : <span className="text-[8px] font-black text-blue-700">⏳</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button type="button" onClick={handleComplete} disabled={isCompleting || showUploadBanner}
          className="w-full py-4 rounded-2xl text-sm font-bold bg-black text-white hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {isCompleting ? (
            <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Invio...</span>
          ) : showUploadBanner ? (
            <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Caricamento foto...</span>
          ) : "✅ Completa intervento"}
        </button>
        <p className="text-[10px] text-slate-400 mt-3">Il manager riceverà una notifica.</p>
      </div>
    );
  }

  // ── Vista step ─────────────────────────────────────────────────────────────
  const progress      = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const photoMissing  = currentTask.photoRequired && !photoFile && !currentTask.photoUrl && !pendingRef.current.has(currentTask.id);

  // ── Task già completata ────────────────────────────────────────────────────
  if (currentTask.completed) {
    const photoUrl    = getPhotoUrl(currentTask);
    const photoIsPend = isPending(currentTask.id);
    const photoIsLoad = isUploading(currentTask.id);

    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Task {currentIndex + 1} di {tasks.length}
            </span>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <span className="text-[9px] font-black text-blue-500 flex items-center gap-1">
                  {uploadingCount > 0 ? <><Loader2 size={9} className="animate-spin" /> {uploadingCount} foto</> : <>📸 {pendingCount} in coda</>}
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <span className="flex-1 text-base font-bold text-green-800 leading-snug">{currentTask.label}</span>
            <button type="button" onClick={() => resetTask(currentIndex)}
              className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 active:scale-95 transition-all shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
          {photoUrl && (
            <div className="mt-3 flex items-center gap-3 pl-8">
              <div className="relative shrink-0">
                <a href={photoUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="foto"
                    className={`w-12 h-12 object-cover rounded-xl border shadow-sm hover:scale-105 transition-transform ${photoIsPend || photoIsLoad ? "border-blue-300 opacity-75" : "border-green-200"}`} />
                </a>
                {(photoIsPend || photoIsLoad) && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-500/20">
                    {photoIsLoad ? <Loader2 size={12} className="text-blue-600 animate-spin" /> : <span className="text-[8px]">⏳</span>}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${photoIsPend ? "text-blue-500" : photoIsLoad ? "text-blue-400" : "text-green-600"}`}>
                {photoIsLoad ? "Caricamento..." : photoIsPend ? "In coda" : "Foto allegata"}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={goBack} disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={13} /> Indietro
          </button>
          <button type="button" onClick={goForward} disabled={currentIndex >= tasks.length - 1}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Avanti <ChevronRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  // ── Task da completare ─────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Task {currentIndex + 1} di {tasks.length}
          </span>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="text-[9px] font-black text-blue-500 flex items-center gap-1">
                {uploadingCount > 0 ? <><Loader2 size={9} className="animate-spin" /> {uploadingCount} foto</> : <>📸 {pendingCount} in coda</>}
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {justCompleted && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={13} />
          <span className="truncate">✓ {justCompleted}</span>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm mb-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 leading-snug">{currentTask.label}</h3>
      </div>

      {/* Sezione foto */}
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Foto</p>
          {currentTask.photoRequired
            ? <span className="text-[9px] font-black uppercase tracking-wide text-white bg-rose-500 rounded-full px-2 py-0.5">Obbligatoria</span>
            : <span className="text-[9px] font-black uppercase tracking-wide text-slate-400 bg-slate-200 rounded-full px-2 py-0.5">Facoltativa</span>}
        </div>

        {uploadError && (
          <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg mb-3 border border-rose-100">⚠️ {uploadError}</p>
        )}

        {photoPreview ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Anteprima" className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{photoFile?.name}</p>
              <p className="text-[10px] text-blue-600 font-bold mt-0.5">📸 Pronta — verrà inviata in background</p>
            </div>
            <button type="button" onClick={clearPhoto}
              className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 text-[10px] flex items-center justify-center hover:bg-rose-200 shrink-0">✕</button>
          </div>
        ) : (
          <button type="button" onClick={() => photoInputRef.current?.click()}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-bold transition-colors ${
              currentTask.photoRequired
                ? "bg-slate-500 border-rose-400 text-white hover:bg-slate-600"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <Camera size={18} /> Scatta foto
          </button>
        )}

        <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
      </div>

      {/* Azioni */}
      <div className="flex gap-2">
        <button type="button" onClick={goBack} disabled={currentIndex === 0 || isSaving}
          className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={13} /> Indietro
        </button>

        <button type="button" onClick={advance}
          disabled={!!photoMissing || isSaving || isCompressing}
          className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${
            photoMissing ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/20"}`}>
          {isCompressing ? (
            <><Loader2 size={13} className="animate-spin" /> Preparazione...</>
          ) : isSaving ? (
            <><Loader2 size={13} className="animate-spin" /> Salvataggio...</>
          ) : (
            <><CheckCircle2 size={13} /> Fatto <ChevronRight size={13} /></>
          )}
        </button>
      </div>
    </div>
  );
}

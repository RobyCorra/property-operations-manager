"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { updateMaintenanceTaskProgress, completeMaintenancePublic } from "@/src/app/actions/maintenance-token";
import type { MaintenanceTaskItem } from "@/src/app/actions/maintenance-token";
import { Camera, ChevronRight, ChevronLeft, CheckCircle2, Loader2, AlertCircle, Trash2 } from "lucide-react";

interface Props {
  ticketId: string;
  initialTasks: MaintenanceTaskItem[];
}

export default function MaintenanceChecklistInteractive({ ticketId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<MaintenanceTaskItem[]>(initialTasks);

  const firstUnprocessed = initialTasks.findIndex((t) => !t.completed);
  const [currentIndex, setCurrentIndex] = useState(
    firstUnprocessed === -1 ? initialTasks.length : firstUnprocessed
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

  const currentTask = tasks[currentIndex];
  const completedCount = tasks.filter((t) => t.completed).length;
  const allDone = currentIndex >= tasks.length;
  const allTasksCompleted = tasks.every((t) => t.completed);

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

  const resetTask = async (idx: number) => {
    const updatedTasks = tasks.map((t, i) =>
      i === idx ? { ...t, completed: false, photoUrl: null } : t
    );
    setTasks(updatedTasks);
    try {
      await updateMaintenanceTaskProgress(ticketId, updatedTasks[idx].id, false, null);
    } catch {
      // best-effort
    }
  };

  const advance = async () => {
    // Blocca se foto obbligatoria e non ancora selezionata
    if (currentTask.photoRequired && !photoFile && !currentTask.photoUrl) {
      setPhotoRequiredError(true);
      setTimeout(() => setPhotoRequiredError(false), 2500);
      return;
    }

    setIsSaving(true);
    setUploadError(null);

    let photoUrl: string | null = currentTask.photoUrl ?? null;

    if (photoFile) {
      setIsUploading(true);
      try {
        const blob = await upload(
          `uploads/maintenance/${ticketId}/tasks/${currentTask.id}/${Date.now()}-${photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          photoFile,
          { access: "public", handleUploadUrl: "/api/blob-upload" }
        );
        photoUrl = blob.url;
      } catch {
        setUploadError("Errore upload foto. Riprova.");
        setIsUploading(false);
        setIsSaving(false);
        return;
      }
      setIsUploading(false);
    }

    const updatedTasks = tasks.map((t, idx) =>
      idx === currentIndex ? { ...t, completed: true, photoUrl } : t
    );
    setTasks(updatedTasks);

    try {
      await updateMaintenanceTaskProgress(ticketId, currentTask.id, true, photoUrl);
    } catch {
      // best-effort
    }

    setJustCompleted(currentTask.label);
    clearPhoto();

    // Vai al prossimo task non completato
    const nextIdx = updatedTasks.findIndex((t, idx) => idx > currentIndex && !t.completed);
    setCurrentIndex(nextIdx === -1 ? updatedTasks.length : nextIdx);
    setIsSaving(false);
  };

  const handleComplete = async () => {
    setIsCompletingTask(true);
    try {
      await completeMaintenancePublic(ticketId);
      window.location.reload();
    } catch (err: unknown) {
      alert((err as Error).message || "Errore durante il completamento.");
      setIsCompletingTask(false);
    }
  };

  // ── Schermata completamento ────────────────────────────────────────────────
  if (allDone) {
    const photosWithUrls = tasks.filter((t) => t.photoUrl);

    // Alcuni task non completati — forza risoluzione
    if (!allTasksCompleted) {
      const incompleteTasks = tasks.map((t, idx) => ({ ...t, idx })).filter((t) => !t.completed);
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Task non completate</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {incompleteTasks.length} task {incompleteTasks.length === 1 ? "richiede" : "richiedono"} attenzione prima di completare.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white border border-amber-100 px-4 py-3"
                >
                  <p className="text-xs font-semibold text-slate-800 truncate min-w-0">{task.label}</p>
                  <button
                    type="button"
                    onClick={() => goToItem(task.idx)}
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
            ✅ Completa intervento
          </button>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Completa tutte le task per inviare al manager.
          </p>
        </div>
      );
    }

    // Tutte completate 🎉
    return (
      <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Tutte le task completate!</h3>
        <p className="text-sm text-slate-500 mb-6">
          {completedCount} di {tasks.length} task {tasks.length === 1 ? "completata" : "completate"}
        </p>

        {photosWithUrls.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              {photosWithUrls.length} foto {photosWithUrls.length === 1 ? "allegata" : "allegate"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {photosWithUrls.map((task) => (
                <a key={task.id} href={task.photoUrl!} target="_blank" rel="noreferrer">
                  <img
                    src={task.photoUrl!}
                    alt={task.label}
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
              <Loader2 size={16} className="animate-spin" /> Invio in corso...
            </span>
          ) : (
            "✅ Completa intervento"
          )}
        </button>
        <p className="text-[10px] text-slate-400 mt-3">
          Il manager riceverà una notifica.
        </p>
      </div>
    );
  }

  // ── Vista step ─────────────────────────────────────────────────────────────
  const progress = Math.round((completedCount / tasks.length) * 100);

  // Task già completata: vista sola lettura con cestino
  if (currentTask.completed) {
    return (
      <div className="animate-in fade-in duration-300">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Task {currentIndex + 1} di {tasks.length}
            </span>
            <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card completata */}
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <span className="flex-1 text-base font-bold text-green-800 leading-snug">{currentTask.label}</span>
            <button
              type="button"
              onClick={() => resetTask(currentIndex)}
              className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 active:scale-95 transition-all shrink-0"
              title="Annulla e rifai"
            >
              <Trash2 size={15} />
            </button>
          </div>
          {currentTask.photoUrl && (
            <div className="mt-3 flex items-center gap-3 pl-8">
              <a href={currentTask.photoUrl} target="_blank" rel="noreferrer">
                <img
                  src={currentTask.photoUrl}
                  alt="foto"
                  className="w-12 h-12 object-cover rounded-xl border border-green-200 shadow-sm hover:scale-105 transition-transform"
                />
              </a>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Foto allegata</span>
            </div>
          )}
        </div>

        {/* Navigazione */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
            Indietro
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={currentIndex >= tasks.length - 1}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Avanti
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  // ── Task da completare ─────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-300">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Task {currentIndex + 1} di {tasks.length}
          </span>
          <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conferma step precedente */}
      {justCompleted && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={13} />
          <span className="truncate">✓ {justCompleted}</span>
        </div>
      )}

      {/* Errore foto obbligatoria */}
      {photoRequiredError && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={13} />
          <span>Foto obbligatoria — scatta prima di procedere.</span>
        </div>
      )}

      {/* Card task */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm mb-4 text-center">
        <h3 className="text-lg font-bold text-slate-900 leading-snug">{currentTask.label}</h3>
      </div>

      {/* Sezione foto */}
      {(currentTask.photoRequired || !currentTask.completed) && (
        <div className={`rounded-2xl p-4 mb-4 ${currentTask.photoRequired ? "bg-slate-50 border border-slate-100" : "bg-slate-50 border border-slate-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Foto
            </p>
            {currentTask.photoRequired ? (
              <span className="text-[9px] font-black uppercase tracking-wide text-white bg-rose-500 rounded-full px-2 py-0.5">
                Obbligatoria
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-wide text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                Facoltativa
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
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Foto pronta ✓</p>
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
              className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-bold transition-colors ${
                currentTask.photoRequired
                  ? "bg-slate-400 border-rose-400 text-white hover:bg-slate-500"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Camera size={18} />
              Scatta foto
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
          Indietro
        </button>

        <button
          type="button"
          onClick={advance}
          disabled={isSaving || isUploading}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
        >
          {isSaving || isUploading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              {isUploading ? "Upload..." : "Salvataggio..."}
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

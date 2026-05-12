"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Camera, CheckCircle2, AlertTriangle } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { resolveCleaningCorrections } from "@/src/app/actions/operational";

export interface CorrectionItem {
  id: string;
  label: string;
  note: string;
  requiresPhoto: boolean;
  completed: boolean;
  photoUrl: string | null;
}

interface Props {
  cleaningTaskId: string;
  initialItems: CorrectionItem[];
  onResolved?: () => void;
}

export default function CleaningCorrectionPanel({ cleaningTaskId, initialItems, onResolved }: Props) {
  const [corrections, setCorrections] = useState<CorrectionItem[]>(initialItems);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const allDone = corrections.every(
    item => item.completed && (!item.requiresPhoto || item.photoUrl)
  );
  const doneCount = corrections.filter(
    c => c.completed && (!c.requiresPhoto || c.photoUrl)
  ).length;

  function toggleCorrection(id: string) {
    setCorrections(prev =>
      prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c)
    );
  }

  async function uploadPhoto(id: string, file: File) {
    setUploadingPhotoId(id);
    setError(null);
    try {
      const blob = await upload(
        `uploads/corrections/${cleaningTaskId}/${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      setCorrections(prev =>
        prev.map(c => c.id === id ? { ...c, photoUrl: blob.url, completed: true } : c)
      );
    } catch {
      setError("Errore durante il caricamento della foto. Riprova.");
    } finally {
      setUploadingPhotoId(null);
    }
  }

  function handleResubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await resolveCleaningCorrections(
          cleaningTaskId,
          corrections.map(c => ({ id: c.id, completed: c.completed, photoUrl: c.photoUrl }))
        );
        onResolved?.();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Errore durante l'invio.");
      }
    });
  }

  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/60 overflow-hidden">
      {/* Banner */}
      <div className="flex items-center gap-3 bg-rose-500 px-5 py-3">
        <AlertTriangle size={16} className="text-white shrink-0" />
        <p className="text-[11px] font-black uppercase tracking-widest text-white">
          Il supervisore ha richiesto correzioni
        </p>
      </div>

      <div className="p-5 space-y-3">
        {corrections.map((item, idx) => {
          const isUploading = uploadingPhotoId === item.id;
          const done = item.completed && (!item.requiresPhoto || item.photoUrl);

          return (
            <div
              key={item.id}
              className={`rounded-xl border bg-white p-4 transition-all ${
                done ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Toggle completato */}
                <button
                  type="button"
                  onClick={() => toggleCorrection(item.id)}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    item.completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <CheckCircle2 size={14} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[9px] font-black text-rose-700">
                      {idx + 1}
                    </span>
                    <p className={`text-sm font-semibold ${item.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {item.label}
                    </p>
                    {item.requiresPhoto && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700">
                        <Camera size={9} /> Foto richiesta
                      </span>
                    )}
                  </div>
                  {item.note && (
                    <p className="mt-1 text-xs text-slate-500 italic">"{item.note}"</p>
                  )}

                  {/* Photo section */}
                  {item.requiresPhoto && (
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      {item.photoUrl && (
                        <a href={item.photoUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                          <img
                            src={item.photoUrl}
                            alt="foto correzione"
                            className="h-16 w-24 rounded-lg object-cover border border-emerald-200 shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <CheckCircle2 size={11} />
                          </span>
                        </a>
                      )}
                      <label className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                        isUploading
                          ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                          : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}>
                        {isUploading ? (
                          <><Loader2 size={11} className="animate-spin" /> Caricamento...</>
                        ) : (
                          <><Camera size={11} /> {item.photoUrl ? "Cambia foto" : "Carica foto"}</>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          disabled={isUploading}
                          ref={el => { fileInputRefs.current[item.id] = el; }}
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) await uploadPhoto(item.id, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {error && (
          <p className="rounded-xl bg-rose-100 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleResubmit}
          disabled={!allDone || isPending}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-yellow-500 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-yellow-200 transition-all hover:bg-yellow-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending
            ? <Loader2 size={13} className="animate-spin" />
            : "⏫"}
          {allDone
            ? "Re-invia per Revisione"
            : `Completa tutte le correzioni (${doneCount}/${corrections.length})`}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Circle, SkipForward, AlertTriangle, X } from "lucide-react";
import { useLang } from "@/src/components/lang-context";
import SupervisorReviewForm from "@/src/components/supervisor-review-form";

type ReviewItem = {
  id: string;
  label: string;
  completed?: boolean;
  skipped?: boolean;
  value?: number | null;
  photoUrl?: string | null;
  photoRequired?: boolean;
  type?: string;
  answer?: string | null;
};

/**
 * Pannello di verifica pulizia dentro il modal del calendario (solo manager):
 * checklist voce-per-voce con foto (lightbox) + pannello supervisor riusato
 * per approvare o richiedere correzioni.
 */
export default function CleaningReviewPanel({
  taskId,
  reviewerId,
  items,
  onDone,
}: {
  taskId: string;
  reviewerId: string;
  items: ReviewItem[];
  onDone: () => void;
}) {
  const { t } = useLang();
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const total = items.length;
  const done = items.filter((i) => i.completed).length;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.tcReviewTitle}</p>
        <span className="text-sm font-semibold text-slate-600">
          {done} <span className="text-slate-400">/ {total} {t.tcPoints}</span>
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const missingPhoto = !!item.photoRequired && !item.photoUrl;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                missingPhoto ? "border-rose-200 bg-rose-50/60" : item.completed ? "border-emerald-100 bg-white" : "border-slate-100 bg-white"
              }`}
            >
              {item.completed ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              ) : item.skipped ? (
                <SkipForward size={18} className="shrink-0 text-slate-300" />
              ) : (
                <Circle size={18} className="shrink-0 text-slate-300" />
              )}

              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${item.completed ? "text-slate-800" : "text-slate-500"}`}>{item.label}</p>
                {item.skipped && <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.tcSkipped}</p>}
              </div>

              {item.value != null && (
                <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">{item.value}</span>
              )}

              {item.photoUrl ? (
                <button
                  type="button"
                  onClick={() => setLightbox({ url: item.photoUrl!, label: item.label })}
                  className="shrink-0 h-11 w-11 overflow-hidden rounded-lg border border-slate-200 hover:ring-2 hover:ring-violet-300 transition"
                  aria-label="Foto"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photoUrl} alt={item.label} className="h-full w-full object-cover" />
                </button>
              ) : missingPhoto ? (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600">
                  <AlertTriangle size={11} /> {t.tcPhotoMissing}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="pt-1">
        <SupervisorReviewForm entityId={taskId} supervisorId={reviewerId} type="cleaning" onDone={onDone} />
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[130] flex flex-col items-center justify-center gap-4 bg-black/80 p-6"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.label}
            className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-sm font-semibold text-white">{lightbox.label}</p>
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-2 text-xs font-bold text-white"
            aria-label="Chiudi"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

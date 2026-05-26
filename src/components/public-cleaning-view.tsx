"use client";

import { LangProvider } from "@/src/components/lang-context";
import LangGate from "@/src/components/lang-gate";
import LangSwitchPill from "@/src/components/lang-switch-pill";
import { useLang } from "@/src/components/lang-context";
import ChecklistInteractive from "@/src/components/checklist-interactive";
import PublicStatusButton from "@/src/components/public-status-button";
import PublicStatusPoller from "@/src/components/public-status-poller";
import { useState, useEffect, useRef } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  labelTranslations?: Record<string, string>;
  type: string;
  required: boolean;
  photoRequired: boolean;
  formula?: string | null;
  completed: boolean;
  value?: number | null;
  photoUrl?: string | null;
  skipped?: boolean;
}

interface LinenResult {
  lenzuola: number;
  federe: number;
  copriPiumino: number;
}

interface Props {
  taskId: string;
  apartmentName: string;
  apartmentAddress: string;
  mapsUrl: string;
  dateLabel: string;
  notes: string | null;
  checklistItems: ChecklistItem[];
  canStart: boolean;
  canComplete: boolean;
  isWaiting: boolean;
  isDone: boolean;
  // Biancheria & asciugamani (dalla prenotazione in arrivo)
  towels?: number | null;
  bathMats?: number | null;
  nextGuestCount?: number | null;
  linen?: LinenResult | null;
  cullaLinen?: LinenResult | null;
}

function useTranslatedNote(taskId: string, notes: string | null, lang: string | null) {
  const [translatedNote, setTranslatedNote] = useState<string | null>(notes);
  const [translating, setTranslating] = useState(false);
  const prevLang = useRef<string | null>(null);

  useEffect(() => {
    if (!notes || !lang || lang === "it" || lang === prevLang.current) return;
    prevLang.current = lang;

    const cacheKey = `note-${taskId}-${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedNote(cached);
      return;
    }

    setTranslating(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: notes, targetLang: lang }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.translated) {
          setTranslatedNote(data.translated);
          localStorage.setItem(cacheKey, data.translated);
        }
      })
      .catch(() => {}) // fallback: mostra originale
      .finally(() => setTranslating(false));
  }, [notes, lang, taskId]);

  // Reset to original when back to Italian
  useEffect(() => {
    if (lang === "it") setTranslatedNote(notes);
  }, [lang, notes]);

  return { translatedNote, translating };
}

function CleaningContent({
  taskId,
  apartmentName,
  apartmentAddress,
  mapsUrl,
  dateLabel,
  notes,
  checklistItems,
  canStart,
  canComplete,
  isWaiting,
  isDone,
  towels,
  bathMats,
  nextGuestCount,
  linen,
  cullaLinen,
}: Props) {
  const { t, lang } = useLang();
  const { translatedNote, translating } = useTranslatedNote(taskId, notes, lang);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* ── HEADER ── */}
      <header
        className="px-5 pt-4 pb-6 text-white"
        style={{ background: "linear-gradient(145deg, #4338ca, #7c3aed)" }}
      >
        <div className="max-w-lg mx-auto">
          <LangSwitchPill />
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧹</span>
            <p className="text-xl font-extrabold leading-tight">{apartmentName}</p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            📍 {apartmentAddress}
          </a>
        </div>
      </header>

      {/* ── CARDS ── */}
      <div className="max-w-lg mx-auto px-4 -mt-5 flex flex-col gap-3 pb-32">

        {/* Card data — nascosta in IN_PROGRESS */}
        {!canComplete && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-2xl mb-1">📅</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t.dateLabel}
            </p>
            <p className="text-lg font-bold text-slate-800">{dateLabel}</p>
          </div>
        )}

        {/* ── Biancheria & asciugamani (se disponibili) ── */}
        {(towels != null || bathMats != null || linen != null) && (
          <div className="flex flex-col gap-2">
            {/* Asciugamani + Tappetini */}
            {(towels != null || bathMats != null) && (
              <div className="grid grid-cols-2 gap-2">
                {towels != null && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center shadow-sm">
                    <div className="text-2xl mb-1">🛁</div>
                    <div className="text-3xl font-black text-blue-700 leading-none">{towels}</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-blue-600 mt-1">Asciugamani</div>
                    {nextGuestCount != null && (
                      <div className="text-[9px] text-blue-400 mt-0.5">{nextGuestCount} ospiti × 2</div>
                    )}
                  </div>
                )}
                {bathMats != null && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center shadow-sm">
                    <div className="text-2xl mb-1">🟩</div>
                    <div className="text-3xl font-black text-emerald-700 leading-none">{bathMats}</div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600 mt-1">Tappetini bagno</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">1 per bagno</div>
                  </div>
                )}
              </div>
            )}

            {/* Totale biancheria adulti */}
            {linen != null && (
              <div className="bg-slate-900 rounded-2xl p-3 flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  🛏 Totale letti{nextGuestCount != null ? ` — ${nextGuestCount} ospiti` : ""}
                </span>
                <div className="flex gap-2">
                  {[
                    { v: linen.lenzuola,     l: "Lenzuola" },
                    { v: linen.federe,       l: "Federe" },
                    { v: linen.copriPiumino, l: "Copri p." },
                  ].map(({ v, l }) => (
                    <div key={l} className="bg-slate-800 rounded-xl px-3 py-1.5 text-center">
                      <div className="text-lg font-black text-white">{v}</div>
                      <div className="text-[8px] text-slate-500 uppercase">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Culla */}
            {cullaLinen != null && (
              <div className="bg-emerald-900 rounded-2xl p-3 flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">🪺 Culla</span>
                <div className="flex gap-2">
                  {[
                    { v: cullaLinen.lenzuola,     l: "Lenzuola" },
                    { v: cullaLinen.federe,       l: "Federe" },
                    { v: cullaLinen.copriPiumino, l: "Copri p." },
                  ].map(({ v, l }) => (
                    <div key={l} className="bg-emerald-800 rounded-xl px-3 py-1.5 text-center">
                      <div className="text-lg font-black text-white">{v}</div>
                      <div className="text-[8px] text-emerald-500 uppercase">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card note */}
        {notes && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t.notesLabel}
            </p>
            {translating ? (
              <p className="text-sm text-slate-400 italic animate-pulse">...</p>
            ) : (
              <p className="text-base text-slate-700 leading-relaxed">{translatedNote}</p>
            )}
          </div>
        )}

        {/* Banner AWAITING_REVIEW */}
        {isWaiting && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="text-amber-800 font-bold text-base mb-1">{t.waitingTitle}</p>
            <p className="text-amber-600 text-sm leading-relaxed">
              {t.waitingText}<br />{t.waitingText2}
            </p>
            <PublicStatusPoller waitingAutoUpdate={t.waitingAutoUpdate} waitingCheckNow={t.waitingCheckNow} />
          </div>
        )}

        {/* Banner APPROVED / COMPLETED */}
        {isDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <p className="text-emerald-800 font-bold text-base mb-1">{t.doneTitle}</p>
            <p className="text-emerald-600 text-sm">{t.doneText}</p>
          </div>
        )}

        {/* Checklist (solo IN_PROGRESS) */}
        {canComplete && checklistItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="font-semibold text-slate-800 text-sm">{t.checklistTitle}</p>
              <p className="text-xs text-slate-400">
                {checklistItems.filter((i) => i.completed).length} / {checklistItems.length}
              </p>
            </div>
            <div className="p-3">
              <ChecklistInteractive taskId={taskId} initialItems={checklistItems} />
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pb-2">{t.footer}</p>
      </div>

      {/* Pulsante fisso — solo PENDING */}
      {canStart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-20">
          <div className="max-w-lg mx-auto">
            <PublicStatusButton
              id={taskId}
              nextStatus="IN_PROGRESS"
              label={t.startBtn}
              afterLabel={t.startingBtn}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-green-300 transition-colors"
              afterClassName="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl text-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicCleaningView(props: Props) {
  return (
    <LangProvider>
      <LangGate>
        <CleaningContent {...props} />
      </LangGate>
    </LangProvider>
  );
}

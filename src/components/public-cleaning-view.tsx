"use client";

import { LangProvider } from "@/src/components/lang-context";
import LangGate from "@/src/components/lang-gate";
import LangSwitchPill from "@/src/components/lang-switch-pill";
import { useLang } from "@/src/components/lang-context";
import { extraTranslatedLangs } from "@/src/lib/languages";
import ChecklistInteractive from "@/src/components/checklist-interactive";
import PhotoQueueUploader from "@/src/components/photo-queue-uploader";
import PublicStatusButton from "@/src/components/public-status-button";
import PublicStatusPoller from "@/src/components/public-status-poller";
import LinenSection from "@/src/components/linen-section";
import TicketConversation from "@/src/components/ticket-conversation";
import { createCleaningTaskMessage } from "@/src/app/actions/operational";
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
  // Chat (solo versione login)
  showChat?: boolean;
  initialMessages?: any[];
  currentUserRole?: string;
  currentUserName?: string;
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
  showChat,
  initialMessages,
  currentUserRole,
  currentUserName,
}: Props) {
  const { t, contentLang } = useLang();
  const { translatedNote, translating } = useTranslatedNote(taskId, notes, contentLang);
  const extraLangs = extraTranslatedLangs(checklistItems.map((i) => i.labelTranslations));

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <PhotoQueueUploader />

      {/* ── HEADER ── */}
      <header
        className="px-5 pt-4 pb-6 text-white"
        style={{ background: "linear-gradient(145deg, #4338ca, #7c3aed)" }}
      >
        <div className="max-w-lg mx-auto">
          <LangSwitchPill availableExtraLangs={extraLangs} />
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

        {/* ── Biancheria & asciugamani ── */}
        <LinenSection
          towels={towels}
          bathMats={bathMats}
          nextGuestCount={nextGuestCount}
          linen={linen}
          cullaLinen={cullaLinen}
        />

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

        {/* Chat con il Manager — solo versione login */}
        {showChat && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-800 text-sm">{t.chatWithManager}</p>
            </div>
            <div className="p-3">
              <TicketConversation
                entityId={taskId}
                initialMessages={initialMessages ?? []}
                currentUserRole={currentUserRole ?? "CLEANER"}
                currentUserName={currentUserName ?? "Cleaner"}
                submitAction={createCleaningTaskMessage}
              />
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pb-2">{t.footer}</p>
      </div>

      {/* Pulsante fisso — solo PENDING */}
      {canStart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-20 safe-bottom">
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
  const extraLangs = extraTranslatedLangs(props.checklistItems.map((i) => i.labelTranslations));
  return (
    <LangProvider>
      <LangGate availableExtraLangs={extraLangs}>
        <CleaningContent {...props} />
      </LangGate>
    </LangProvider>
  );
}

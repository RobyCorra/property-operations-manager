"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { askAI } from "@/src/app/actions/ai";
import { executeAIAction } from "@/src/app/actions/operational";
import type { AIActionPayload } from "@/src/app/actions/operational";
import { useRouter } from "next/navigation";
import { useLang } from "@/src/components/lang-context";
import type { T } from "@/src/lib/i18n";

type PreviewCleaning = {
  id: string;
  date: string;
  status: string;
  apartmentName: string;
  assignedTo: string | null;
};

type ConflictWarning = {
  guestName: string | null;
  checkInDate: string;
  checkOutDate: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  action?: AIActionPayload;
  actionState?: "pending" | "done" | "error";
  actionError?: string;
  preview?: PreviewCleaning[] | null;
  conflictWarning?: ConflictWarning | null;
};

type PersistedAIMessage = {
  role: "USER" | "ASSISTANT";
  content: string;
};

type AIAssistantProps = {
  role: "CLEANER" | "MAINTENANCE" | "MANAGER";
  type: string;
  apartmentId?: string | null;
  cleaningTaskId?: string | null;
  maintenanceTicketId?: string | null;
  initialMessages?: PersistedAIMessage[];
  compact?: boolean;
  /** Modalità controllata: se passato, il componente non mostra la card trigger */
  open?: boolean;
  onClose?: () => void;
  contextLabel?: string;
};

// Estrae il blocco ACTION dal testo dell'AI con brace-matching (robusto a qualsiasi formato)
function parseAction(content: string): { text: string; action?: AIActionPayload } {
  // Percorso principale: ACTION: {...}
  const actionIdx = content.indexOf("ACTION:");
  if (actionIdx !== -1) {
    const afterAction = content.slice(actionIdx + "ACTION:".length);
    const jsonStart = afterAction.indexOf("{");
    if (jsonStart !== -1) {
      let depth = 0, jsonEnd = -1;
      for (let i = jsonStart; i < afterAction.length; i++) {
        if (afterAction[i] === "{") depth++;
        else if (afterAction[i] === "}") { depth--; if (depth === 0) { jsonEnd = i; break; } }
      }
      if (jsonEnd !== -1) {
        try {
          const action = JSON.parse(afterAction.slice(jsonStart, jsonEnd + 1)) as AIActionPayload;
          return { text: content.slice(0, actionIdx).trim(), action };
        } catch { /* fall through */ }
      }
    }
  }

  // Fallback: l'AI ha wrappato il JSON in un code block (```json ... ```)
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?(\{[\s\S]*?\})\s*\n?```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]) as AIActionPayload;
      if (parsed && typeof parsed === "object" && "type" in parsed) {
        const cleanText = content.replace(/```(?:json)?\s*\n?[\s\S]*?\n?```/, "").trim();
        return { text: cleanText, action: parsed };
      }
    } catch { /* not valid JSON */ }
  }

  return { text: sanitizeAIText(content) };
}

function sanitizeAIText(text: string): string {
  return text
    .replace(/✓\s*(Modifica applicata|Fatto|Creato|Aggiornato|Cancellato|Eseguito)[^\n]*/gi, "")
    .replace(/Ho (creato|modificato|cancellato|aggiornato|assegnato|rimosso|spostato)[^\n]*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function actionTypeLabel(type: string, t: T) {
  if (type === "CREATE_BOOKING") return t.aiActCreateBooking;
  if (type === "CREATE_CLEANING") return t.aiActCreateCleaning;
  if (type === "CREATE_TICKET") return t.aiActCreateTicket;
  if (type === "UPDATE_BOOKING") return t.aiActUpdateBooking;
  if (type === "UPDATE_CLEANING") return t.aiActUpdateCleaning;
  if (type === "UPDATE_TICKET") return t.aiActUpdateTicket;
  if (type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") return t.aiActAssignCleanings;
  if (type === "BULK_ASSIGN_CHECKINS_BY_FILTER") return t.aiActAssignCheckins;
  return t.aiActEdit;
}

function actionSummary(action: AIActionPayload, preview: PreviewCleaning[] | null, t: T, locale: string): React.ReactNode {
  if (action.type === "CREATE_BOOKING") {
    return (
      <div className="space-y-1">
        <p className="text-xs text-amber-700">• {t.aiFApartment}: {action.apartmentName}</p>
        <p className="text-xs text-amber-700">• {t.aiFCheckin}: {new Date(action.checkInDate).toLocaleDateString(locale)}</p>
        <p className="text-xs text-amber-700">• {t.aiFCheckout}: {new Date(action.checkOutDate).toLocaleDateString(locale)}</p>
        <p className="text-xs text-amber-700">• {t.aiFGuests}: {action.totalGuests}</p>
        {action.guestName && <p className="text-xs text-amber-700">• {t.aiFGuestName}: {action.guestName}</p>}
      </div>
    );
  }
  if (action.type === "CREATE_CLEANING") {
    return (
      <div className="space-y-1">
        <p className="text-xs text-amber-700">• {t.aiFApartment}: {action.apartmentName}</p>
        <p className="text-xs text-amber-700">• {t.aiFDate}: {new Date(action.date).toLocaleDateString(locale)}</p>
        {action.notes && <p className="text-xs text-amber-700">• {t.aiFNotes}: {action.notes}</p>}
      </div>
    );
  }
  if (action.type === "CREATE_TICKET") {
    return (
      <div className="space-y-1">
        <p className="text-xs text-amber-700">• {t.aiFApartment}: {action.apartmentName}</p>
        <p className="text-xs text-amber-700">• {t.aiFTitle}: {action.title}</p>
        <p className="text-xs text-amber-700">• {t.aiFPriority}: {action.priority}</p>
        {action.ticketDescription && <p className="text-xs text-amber-700">• {t.aiFDescription}: {action.ticketDescription}</p>}
        {action.scheduledStart && <p className="text-xs text-amber-700">• {t.aiFScheduled}: {new Date(action.scheduledStart).toLocaleDateString(locale)}</p>}
      </div>
    );
  }
  if (action.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") {
    if (!preview) return <p className="text-xs text-amber-500 animate-pulse">{t.aiLoadingPreview}</p>;
    if (preview.length === 0) return <p className="text-xs text-red-600">{t.aiNoCleaningsFound}</p>;
    return (
      <div className="space-y-1">
        <p className="text-xs font-bold text-amber-800">{preview.length} {t.aiCleaningsFound}</p>
        {preview.map((c) => (
          <p key={c.id} className="text-xs text-amber-700">
            • {c.apartmentName} — {new Date(c.date).toLocaleDateString(locale, { day: "numeric", month: "short" })} ({c.status}) {c.assignedTo ? `→ ${t.aiCurrent}: ${c.assignedTo}` : ""}
          </p>
        ))}
      </div>
    );
  }
  if (action.type === "BULK_ASSIGN_CHECKINS_BY_FILTER") {
    return (
      <div className="space-y-1">
        <p className="text-xs text-amber-700">• {t.aiFAssistant}: {action.assignedToName}</p>
        <p className="text-xs text-amber-700">• {t.aiFPeriod}: {new Date(action.dateFrom).toLocaleDateString(locale)} → {new Date(action.dateTo).toLocaleDateString(locale)}</p>
        <p className="text-xs text-amber-700">• {t.aiFApartments}: {action.apartmentIds.length > 0 ? `${action.apartmentIds.length} ${t.aiSelected}` : t.aiAll}{action.unassignedOnly ? ` · ${t.aiUnassignedOnly}` : ""}</p>
      </div>
    );
  }
  const fields = (action as any).fields ?? {};
  return Object.entries(fields).map(([k, v]) => (
    <p key={k} className="text-xs text-amber-700">• {fieldLabel(k, v, t, locale)}</p>
  ));
}

function fieldLabel(key: string, value: unknown, t: T, locale: string): string {
  const labels: Record<string, string> = {
    guestName: t.aiFGuestName,
    totalGuests: t.aiFNumGuests,
    checkInDate: t.aiFCheckin,
    checkOutDate: t.aiFCheckout,
    notes: t.aiFNotes,
    date: t.aiFCleaningDate,
    assignedToId: t.aiFAssignedCleaner,
    title: t.aiFTitle,
    description: t.aiFDescription,
    priority: t.aiFPriority,
    scheduledStart: t.aiFInterventionDate,
    status: t.aiFStatus,
  };
  const label = labels[key] ?? key;
  let display = String(value);
  // Formatta le date ISO in leggibile
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    display = new Date(value).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });
  }
  return `${label}: ${display}`;
}

function makeSuggestions(t: T) {
  return [
    { emoji: "🧹", label: t.aiSugCleaningsTodayLabel, prompt: t.aiSugCleaningsTodayPrompt },
    { emoji: "🔧", label: t.aiSugOpenTicketsLabel, prompt: t.aiSugOpenTicketsPrompt },
    { emoji: "📅", label: t.aiSugCheckinsTomorrowLabel, prompt: t.aiSugCheckinsTomorrowPrompt },
    { emoji: "➕", label: t.aiSugNewCleaningLabel, prompt: t.aiSugNewCleaningPrompt },
  ];
}

export default function AIAssistant({
  role,
  type,
  apartmentId,
  cleaningTaskId,
  maintenanceTicketId,
  initialMessages = [],
  compact: _compact = false,
  open,
  onClose,
  contextLabel,
}: AIAssistantProps) {
  const router = useRouter();
  const { t, lang } = useLang();
  const dateLocale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
  const SUGGESTIONS = makeSuggestions(t);
  const [input, setInput] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const isControlled = open !== undefined;
  const visible = isControlled ? open : internalOpen;
  const closeSheet = () => { if (isControlled) onClose?.(); else setInternalOpen(false); };
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map((message) => ({
      role: message.role === "USER" ? "user" : "assistant",
      content: message.content,
    }))
  );
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // useRef per accedere sempre ai messages aggiornati senza stale closure
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Indice dell'ultima azione pending (per bottone di conferma rapida)
  const lastPendingIdx = messages.map((m, i) => ({ m, i }))
    .reverse()
    .find(({ m }) => m.actionState === "pending" || m.actionState === "error");

  const CONFIRM_WORDS = /^(ok|sì|si|yes|confermo|conferma|vai|procedi|fatto|esegui|assegna)$/i;

  async function handleAsk(forceWeb = false, overrideContent?: string) {
    const useWeb = forceWeb || webSearch;
    const content = (overrideContent ?? input).trim();
    if (!content || loading) return;

    // Se l'utente scrive una parola di conferma e c'è un'azione pending → eseguila
    // Usa messagesRef per evitare stale closure
    if (CONFIRM_WORDS.test(content)) {
      const pending = messagesRef.current.map((m, i) => ({ m, i }))
        .reverse()
        .find(({ m }) => m.actionState === "pending" || m.actionState === "error");
      if (pending) {
        setInput("");
        await handleConfirmAction(pending.i);
        return;
      }
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const res = await askAI(
      nextMessages.map((m) => ({ role: m.role, content: m.content })),
      { role, type, apartmentId, cleaningTaskId, maintenanceTicketId, forceWebSearch: useWeb }
    );

    const { text, action } = parseAction(res || "");
    let preview: PreviewCleaning[] | null = null;
    if (action?.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") {
      const params = new URLSearchParams();
      action.apartmentIds.forEach((id) => params.append("apartmentId", id));
      params.set("dateFrom", action.dateFrom);
      params.set("dateTo", action.dateTo);
      try {
        const r = await fetch(`/api/cleanings-preview?${params}`);
        preview = r.ok ? await r.json() : [];
      } catch { preview = []; }
    }
    let conflictWarning: ConflictWarning | null = null;
    if (action?.type === "CREATE_CLEANING" || action?.type === "CREATE_TICKET") {
      const date = action.type === "CREATE_CLEANING" ? action.date : action.scheduledStart;
      if (date) {
        try {
          const params = new URLSearchParams({ apartmentName: action.apartmentName, date });
          const r = await fetch(`/api/booking-conflict?${params}`);
          if (r.ok) {
            const data = await r.json();
            if (data.conflict) conflictWarning = data;
          }
        } catch { /* ignora errori di rete */ }
      }
    }
    setMessages([
      ...nextMessages,
      { role: "assistant", content: text, action, actionState: action ? "pending" : undefined, preview, conflictWarning },
    ]);
    setLoading(false);
  }

  const handleConfirmAction = useCallback(async (msgIndex: number) => {
    const msg = messagesRef.current[msgIndex];
    if (!msg.action) return;

    // Mostra stato "loading" temporaneo senza bloccare il retry
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, actionError: undefined } : m))
    );

    const result = await executeAIAction(msg.action);

    if (result.success) {
      setMessages((prev) =>
        prev.map((m, i) => (i === msgIndex ? { ...m, actionState: "done" as const } : m))
      );
      router.refresh();
    } else {
      // Torna a "pending" con messaggio di errore → l'utente può riprovare
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, actionState: "pending" as const, actionError: result.error } : m
        )
      );
    }
  }, [router]);

  function handleDismissAction(msgIndex: number) {
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, action: undefined, actionState: undefined } : m))
    );
  }

  return (
    <>
      {/* ── Card trigger (solo in modalità non controllata) ── */}
      {!isControlled && (
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
          className="w-full bg-white rounded-[20px] border border-slate-100 shadow-sm p-3.5 flex items-center gap-3 active:scale-[.98] transition-transform text-left"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 12px rgba(124,58,237,.3)" }}
          >
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-extrabold text-slate-900">{t.aiTitle}</p>
            <p className="text-[11px] text-slate-400">{t.aiLauncherSubtitle}</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}

      {/* ── Sheet chat full-screen ── */}
      {visible && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#f8f7ff] md:left-auto md:w-full md:max-w-xl md:border-l md:border-slate-200 md:shadow-2xl">

          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", paddingTop: "max(env(safe-area-inset-top), 14px)" }}
          >
            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-lg border border-white/35" style={{ background: "rgba(255,255,255,.22)" }}>
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-extrabold text-white tracking-tight">{t.aiTitle}</h2>
              <p className="text-[11px] text-white/75 flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] bg-green-400 rounded-full inline-block" />
                {contextLabel || t.aiAlwaysAvailable}
              </p>
            </div>
            <button
              type="button"
              onClick={closeSheet}
              aria-label={t.moClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.18)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messaggi */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-2.5" style={{ WebkitOverflowScrolling: "touch" }}>

            {messages.length === 0 && (
              <div className="max-w-[82%] self-start bg-white rounded-[18px] rounded-bl-md px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-800 shadow-sm">
                {t.aiGreeting}
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} gap-2`}>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-line ${
                    message.role === "user"
                      ? "text-white rounded-[18px] rounded-br-md"
                      : "bg-white text-slate-800 rounded-[18px] rounded-bl-md shadow-sm"
                  }`}
                  style={message.role === "user" ? { background: "linear-gradient(135deg,#7c3aed,#9333ea)", boxShadow: "0 2px 8px rgba(124,58,237,.25)" } : undefined}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>

                {/* Card di conferma ACTION */}
                {message.action && message.actionState === "pending" && (
                  <div className="max-w-[88%] self-start rounded-[18px] border-[1.5px] border-amber-300 bg-amber-50 p-3.5 space-y-2" style={{ boxShadow: "0 4px 14px rgba(245,158,11,.15)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] rounded-[10px] bg-amber-100 flex items-center justify-center text-sm shrink-0">
                        {message.action.type.includes("CLEANING") ? "🧹" : message.action.type.includes("TICKET") ? "🔧" : message.action.type.includes("BOOKING") ? "📅" : "✏️"}
                      </div>
                      <p className="text-[12px] font-extrabold text-amber-800">{actionTypeLabel(message.action.type, t)}</p>
                    </div>
                    <p className="text-[12.5px] font-medium text-amber-900">{message.action.description}</p>
                    <div className="space-y-1">
                      {actionSummary(message.action, message.preview ?? null, t, dateLocale)}
                    </div>
                    {message.conflictWarning && (
                      <div className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-2 space-y-0.5">
                        <p className="text-xs font-bold text-orange-700">{t.aiOccupied}</p>
                        <p className="text-xs text-orange-600">
                          {t.aiBookingLabel}: {message.conflictWarning.guestName || t.aiNa} —{" "}
                          {new Date(message.conflictWarning.checkInDate).toLocaleDateString(dateLocale)} →{" "}
                          {new Date(message.conflictWarning.checkOutDate).toLocaleDateString(dateLocale)}
                        </p>
                        <p className="text-xs text-orange-600 font-medium">{t.aiProceedAnyway}</p>
                      </div>
                    )}
                    {message.actionError && (
                      <p className="text-xs font-bold text-red-600 bg-red-50 rounded-xl px-3 py-2">
                        ⚠ {message.actionError} — {t.aiRetryOrCancel}
                      </p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmAction(index)}
                        disabled={message.action?.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER" && (message.preview == null || message.preview.length === 0)}
                        className="flex-1 h-10 rounded-[13px] flex items-center justify-center gap-1.5 text-white text-[13px] font-extrabold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 12px rgba(5,150,105,.3)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {t.aiConfirm}
                      </button>
                      <button
                        onClick={() => handleDismissAction(index)}
                        className="w-[84px] h-10 rounded-[13px] bg-white border-[1.5px] border-slate-200 text-slate-500 text-[13px] font-bold active:scale-95 transition-transform"
                      >
                        {t.mgrCancel}
                      </button>
                    </div>
                  </div>
                )}

                {message.actionState === "done" && (
                  <div className="max-w-[82%] self-start rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                    <p className="text-xs font-bold text-emerald-700">
                      ✓ {message.preview ? `${message.preview.length} ${t.aiCleaningsAssigned}` : t.aiChangeApplied}
                    </p>
                  </div>
                )}

                {message.actionState === "error" && (
                  <div className="max-w-[82%] self-start rounded-2xl border border-red-200 bg-red-50 px-4 py-2">
                    <p className="text-xs font-bold text-red-700">⚠ {message.actionError || t.aiUpdateError}</p>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="self-start bg-white rounded-[18px] rounded-bl-md px-4 py-3.5 flex gap-1.5 shadow-sm">
                <span className="w-[7px] h-[7px] bg-violet-300 rounded-full animate-bounce" />
                <span className="w-[7px] h-[7px] bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: ".15s" }} />
                <span className="w-[7px] h-[7px] bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: ".3s" }} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Conferma rapida azione pendente */}
          {lastPendingIdx && !loading && (
            <div className="px-3.5 pb-2 shrink-0">
              <button
                onClick={() => handleConfirmAction(lastPendingIdx.i)}
                className="w-full h-10 rounded-[13px] flex items-center justify-center gap-1.5 text-white text-[13px] font-extrabold animate-pulse"
                style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 12px rgba(5,150,105,.3)" }}
              >
                {t.aiConfirmPending}
              </button>
            </div>
          )}

          {/* Chip suggerimenti */}
          {input.length === 0 && !loading && (
            <div className="flex gap-2 px-3.5 pb-2.5 overflow-x-auto shrink-0" style={{ scrollbarWidth: "none" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleAsk(false, s.prompt)}
                  className="shrink-0 bg-white border-[1.5px] border-[#ede9fe] rounded-full px-3.5 py-2 text-[12px] font-semibold text-violet-700 whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div
            className="bg-white border-t border-slate-100 px-3 pt-2.5 flex items-end gap-2 shrink-0"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 14px)" }}
          >
            <button
              type="button"
              onClick={() => setWebSearch((w) => !w)}
              aria-label={t.aiWebSearch}
              title={t.aiWebSearch}
              className={`w-[42px] h-[42px] rounded-full flex items-center justify-center text-base shrink-0 border-[1.5px] transition-colors ${
                webSearch ? "bg-indigo-600 border-indigo-600" : "bg-[#f4f2fc] border-[#ede9fe]"
              }`}
            >
              🌐
            </button>
            <input
              className="flex-1 bg-[#f4f2fc] rounded-[22px] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 min-w-0"
              placeholder={webSearch ? t.aiSearchWeb : t.moWriteMessage}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAsk(false);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAsk(false)}
              disabled={loading || !input.trim()}
              aria-label={t.moSend}
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-90 transition-transform"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 12px rgba(124,58,237,.35)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

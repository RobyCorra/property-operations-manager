"use client";

import { useEffect, useRef, useState, useCallback, startTransition } from "react";
import ReactMarkdown from "react-markdown";
import { askAI } from "@/src/app/actions/ai";
import { executeAIAction } from "@/src/app/actions/operational";
import type { AIActionPayload } from "@/src/app/actions/operational";
import {
  getOrCreateTodaySession,
  getSessionByDate,
  saveManagerChatMessage,
  getSessionDates,
} from "@/src/app/actions/manager-chat";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJsonAction(src: string, prefixEnd: number): { action: AIActionPayload; jsonEnd: number } | null {
  const jsonStart = src.indexOf("{", prefixEnd);
  if (jsonStart === -1) return null;
  let depth = 0, jsonEnd = -1;
  for (let i = jsonStart; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { jsonEnd = i; break; } }
  }
  if (jsonEnd === -1) return null;
  try {
    const action = JSON.parse(src.slice(jsonStart, jsonEnd + 1)) as AIActionPayload;
    return { action, jsonEnd };
  } catch { return null; }
}

function parseAction(content: string): { text: string; action?: AIActionPayload } {
  // Percorso principale: ACTION: {...}
  const actionIdx = content.indexOf("ACTION:");
  if (actionIdx !== -1) {
    const result = extractJsonAction(content, actionIdx + "ACTION:".length);
    if (result) {
      return { text: content.slice(0, actionIdx).trim(), action: result.action };
    }
  }

  // Fallback: l'AI ha wrappato il JSON in un code block (```json ... ```)
  // Cerca il pattern ```json\n{...}\n``` o ``` \n{...}\n```
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

  return { text: content };
}

function actionTypeLabel(type: string) {
  const map: Record<string, string> = {
    CREATE_BOOKING: "Nuova prenotazione",
    CREATE_CLEANING: "Nuova pulizia",
    CREATE_TICKET: "Nuovo ticket manutenzione",
    UPDATE_BOOKING: "Modifica prenotazione",
    UPDATE_CLEANING: "Modifica pulizia",
    UPDATE_TICKET: "Modifica ticket manutenzione",
    BULK_ASSIGN_CLEANINGS_BY_FILTER: "Assegnazione pulizie",
    PURGE_CANCELLED: "Elimina record cancellati",
  };
  return map[type] ?? "Modifica";
}

function fieldLabel(key: string, value: unknown): string {
  const labels: Record<string, string> = {
    guestName: "Nome ospite", totalGuests: "Ospiti", checkInDate: "Check-in",
    checkOutDate: "Check-out", notes: "Note", date: "Data", assignedToId: "Cleaner",
    title: "Titolo", description: "Descrizione", priority: "Priorità", scheduledStart: "Programmato", status: "Stato",
  };
  const label = labels[key] ?? key;
  let display = String(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    display = new Date(value).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
  }
  return `${label}: ${display}`;
}

function actionSummary(action: AIActionPayload, preview: PreviewCleaning[] | null): React.ReactNode {
  if (action.type === "CREATE_BOOKING") return (
    <div className="space-y-0.5">
      <p className="text-xs text-amber-700">• Apt: {action.apartmentName}</p>
      <p className="text-xs text-amber-700">• Check-in: {new Date(action.checkInDate).toLocaleDateString("it-IT")}</p>
      <p className="text-xs text-amber-700">• Check-out: {new Date(action.checkOutDate).toLocaleDateString("it-IT")}</p>
      <p className="text-xs text-amber-700">• Ospiti: {action.totalGuests}</p>
    </div>
  );
  if (action.type === "CREATE_CLEANING") return (
    <div className="space-y-0.5">
      <p className="text-xs text-amber-700">• Apt: {action.apartmentName}</p>
      <p className="text-xs text-amber-700">• Data: {new Date(action.date).toLocaleDateString("it-IT")}</p>
      {action.assignedToName && <p className="text-xs text-amber-700">• Cleaner: {action.assignedToName}</p>}
    </div>
  );
  if (action.type === "CREATE_TICKET") return (
    <div className="space-y-0.5">
      <p className="text-xs text-amber-700">• Apt: {action.apartmentName}</p>
      <p className="text-xs text-amber-700">• Titolo: {action.title}</p>
      <p className="text-xs text-amber-700">• Priorità: {action.priority}</p>
    </div>
  );
  if (action.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") {
    if (!preview) return <p className="text-xs text-amber-500 animate-pulse">Caricamento anteprima...</p>;
    if (preview.length === 0) return <p className="text-xs text-red-600">⚠ Nessuna pulizia trovata.</p>;
    return (
      <div className="space-y-0.5">
        <p className="text-xs font-bold text-amber-800">{preview.length} pulizie trovate:</p>
        {preview.slice(0, 5).map((c) => (
          <p key={c.id} className="text-xs text-amber-700">
            • {c.apartmentName} — {new Date(c.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
          </p>
        ))}
        {preview.length > 5 && <p className="text-xs text-amber-600">...e altre {preview.length - 5}</p>}
      </div>
    );
  }
  if (action.type === "PURGE_CANCELLED") return (
    <p className="text-xs text-amber-700">Elimina definitivamente tutte le prenotazioni e pulizie con stato CANCELLED.</p>
  );
  const fields = (action as Record<string, unknown>).fields as Record<string, unknown> ?? {};
  return Object.entries(fields).map(([k, v]) => (
    <p key={k} className="text-xs text-amber-700">• {fieldLabel(k, v)}</p>
  ));
}

function formatDateTab(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.toDateString() === today.toDateString()) return "Oggi";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
}

// ── Component ─────────────────────────────────────────────────────────────────

type FloatingManagerChatProps = {
  inline?: boolean;
  /** Quando forniti, il bottone interno è nascosto e lo stato aperto/chiuso è controllato dall'esterno */
  externalOpen?: boolean;
  onExternalClose?: () => void;
};

export default function FloatingManagerChat({
  inline = false,
  externalOpen,
  onExternalClose,
}: FloatingManagerChatProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  // Se controllato dall'esterno usa externalOpen, altrimenti lo stato interno
  const controlled = externalOpen !== undefined;
  const open = controlled ? externalOpen : internalOpen;
  const setOpen = controlled
    ? (v: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof v === "function" ? v(open!) : v;
        if (!next) onExternalClose?.();
      }
    : setInternalOpen;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionDates, setSessionDates] = useState<string[]>([]);
  const [activeDateStr, setActiveDateStr] = useState<string>("");
  const [isPastSession, setIsPastSession] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ── Drag state ────────────────────────────────────────────────────────────
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 360, h: 520 });
  const dragging = useRef(false);
  const resizing = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 360, h: 520 });
  const windowRef = useRef<HTMLDivElement>(null);

  function onDragStart(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    dragging.current = true;
    const rect = windowRef.current?.getBoundingClientRect();
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: rect?.left ?? 0, wy: rect?.top ?? 0 };

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      const newLeft = dragStart.current.wx + (ev.clientX - dragStart.current.mx);
      const newTop  = dragStart.current.wy + (ev.clientY - dragStart.current.my);
      const W = windowRef.current?.offsetWidth ?? size.w;
      const H = windowRef.current?.offsetHeight ?? size.h;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth  - W, newLeft)),
        y: Math.max(0, Math.min(window.innerHeight - H, newTop)),
      });
    }
    function onUp() {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function onResizeStart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h };

    function onMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const newW = Math.max(300, Math.min(800, resizeStart.current.w + (ev.clientX - resizeStart.current.mx)));
      const newH = Math.max(400, Math.min(window.innerHeight - 40, resizeStart.current.h + (ev.clientY - resizeStart.current.my)));
      setSize({ w: newW, h: newH });
    }
    function onUp() {
      resizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  // ─────────────────────────────────────────────────────────────────────────

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // ── Voice input ───────────────────────────────────────────────────────────
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  function toggleMic() {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Il tuo browser non supporta il riconoscimento vocale. Usa Chrome o Edge.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "it-IT";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript as string;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setTimeout(() => inputRef.current?.focus(), 50);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Load today's session + date list on first open
  useEffect(() => {
    if (!open || initialized) return;
    (async () => {
      const [session, dates] = await Promise.all([
        getOrCreateTodaySession(),
        getSessionDates(),
      ]);
      setSessionId(session.id);
      setMessages(
        session.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );
      const todayStr = new Date().toISOString().slice(0, 10);
      setActiveDateStr(todayStr);
      // Ensure today is in the dates list
      const allDates = dates.includes(todayStr) ? dates : [todayStr, ...dates];
      setSessionDates(allDates);
      setIsPastSession(false);
      setInitialized(true);
    })();
  }, [open, initialized]);

  // Switch to a date session
  async function loadSessionByDate(dateStr: string) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const isToday = dateStr === todayStr;
    setActiveDateStr(dateStr);
    setIsPastSession(!isToday);

    if (isToday) {
      // Reload today's session (might have new messages)
      const session = await getOrCreateTodaySession();
      setSessionId(session.id);
      setMessages(session.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
    } else {
      const session = await getSessionByDate(dateStr);
      if (session) {
        setMessages(session.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      } else {
        setMessages([]);
      }
      setSessionId(null);
    }
  }

  const CONFIRM_WORDS = /^(ok|sì|si|yes|confermo|conferma|vai|procedi|fatto|esegui|assegna)$/i;

  async function handleAsk(webSearch = false) {
    if (isPastSession) return;
    const content = input.trim();
    if (!content || loading) return;

    // Confirm shortcut
    if (CONFIRM_WORDS.test(content)) {
      const pending = messagesRef.current.map((m, i) => ({ m, i }))
        .reverse()
        .find(({ m }) => m.actionState === "pending" || m.actionState === "error");
      if (pending) { setInput(""); await handleConfirmAction(pending.i); return; }
    }

    const nextMessages: ChatMessage[] = [...messagesRef.current, { role: "user", content }];

    // Aggiorna input e loading subito (urgente — l'utente deve vedere il feedback)
    setInput("");
    setLoading(true);
    // Aggiorna la lista messaggi come transizione non urgente:
    // React può fare il paint dello stato "input svuotato + loading" prima di
    // eseguire il re-render pesante con tutti i messaggi + ReactMarkdown.
    startTransition(() => { setMessages(nextMessages); });

    // Save user message to DB
    if (sessionId) await saveManagerChatMessage(sessionId, "user", content);

    const res = await askAI(
      nextMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "MANAGER", type: "MANAGER_DASHBOARD", forceWebSearch: webSearch }
    );

    const { text, action } = parseAction(res || "");

    // Preview for bulk assign
    let preview: PreviewCleaning[] | null = null;
    if (action?.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") {
      const params = new URLSearchParams();
      action.apartmentIds.forEach((id) => params.append("apartmentId", id));
      params.set("dateFrom", action.dateFrom);
      params.set("dateTo", action.dateTo);
      if (action.unassignedOnly) params.set("unassignedOnly", "true");
      try {
        const r = await fetch(`/api/cleanings-preview?${params}`);
        preview = r.ok ? await r.json() : [];
      } catch { preview = []; }
    }

    // Conflict warning for cleanings/tickets
    let conflictWarning: ConflictWarning | null = null;
    if (action?.type === "CREATE_CLEANING" || action?.type === "CREATE_TICKET") {
      const date = action.type === "CREATE_CLEANING" ? action.date : action.scheduledStart;
      if (date) {
        try {
          const params = new URLSearchParams({ apartmentName: action.apartmentName, date });
          const r = await fetch(`/api/booking-conflict?${params}`);
          if (r.ok) { const d = await r.json(); if (d.conflict) conflictWarning = d; }
        } catch { /* ignore */ }
      }
    }

    // Save AI response to DB
    if (sessionId) await saveManagerChatMessage(sessionId, "assistant", text);

    setMessages([
      ...nextMessages,
      { role: "assistant", content: text, action, actionState: action ? "pending" : undefined, preview, conflictWarning },
    ]);
    setLoading(false);
  }

  const handleConfirmAction = useCallback(async (msgIndex: number) => {
    const msg = messagesRef.current[msgIndex];
    if (!msg.action) return;
    setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, actionError: undefined } : m));
    const result = await executeAIAction(msg.action);
    if (result.success) {
      setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, actionState: "done" as const } : m));
      router.refresh();
    } else {
      setMessages((prev) => prev.map((m, i) =>
        i === msgIndex ? { ...m, actionState: "pending" as const, actionError: result.error } : m
      ));
    }
  }, [router]);

  function handleDismissAction(msgIndex: number) {
    setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, action: undefined, actionState: undefined } : m));
  }

  const lastPendingIdx = messages.map((m, i) => ({ m, i }))
    .reverse()
    .find(({ m }) => m.actionState === "pending" || m.actionState === "error");

  // Unread badge: count AI messages with pending actions
  const pendingCount = messages.filter((m) => m.actionState === "pending").length;

  return (
    <>
      {/* ── Trigger button — nascosto se controllato dall'esterno ── */}
      {!controlled && <button
        onClick={() => setOpen((v) => !v)}
        className={
          inline
            ? "relative flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 h-12 shadow-sm text-xs font-bold uppercase tracking-widest text-violet-700 transition hover:bg-violet-50 hover:shadow-md whitespace-nowrap"
            : "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/40 flex items-center justify-center text-2xl transition-all duration-200 active:scale-95"
        }
        title="AI Assistant"
      >
        {inline ? (
          <>
            🤖 AI Assistant
            {!open && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </>
        ) : (
          <>
            {open ? "✕" : "🤖"}
            {!open && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </>
        )}
      </button>}

      {/* ── Floating window ── */}
      {open && (
        <div
          ref={windowRef}
          className="z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={
            pos
              ? { position: "fixed", left: pos.x, top: pos.y, width: size.w, height: size.h }
              : { position: "fixed", bottom: "96px", right: "24px", width: size.w, height: size.h }
          }
        >
          {/* Header — drag handle */}
          <div
            onMouseDown={onDragStart}
            className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 select-none"
            style={{ cursor: "grab" }}
          >
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-sm text-slate-800">AI Assistant</span>
            <span className="text-xs text-slate-300 ml-1">⠿</span>
            <span className="ml-auto text-xs text-slate-400">Manager</span>
            <button
              onClick={() => setMessages([])}
              title="Nuova chat (pulisci history)"
              className="ml-2 text-slate-400 hover:text-red-400 transition-colors text-sm leading-none"
            >🗑️</button>
            <button onClick={() => setOpen(false)} className="ml-1 text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
          </div>

          {/* Date tabs */}
          {sessionDates.length > 0 && (
            <div className="flex gap-1.5 px-3 py-2 border-b border-slate-100 overflow-x-auto flex-shrink-0 scrollbar-hide">
              {sessionDates.map((d) => (
                <button
                  key={d}
                  onClick={() => loadSessionByDate(d)}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors border ${
                    activeDateStr === d
                      ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {formatDateTab(d)}
                </button>
              ))}
            </div>
          )}

          {/* Past session banner */}
          {isPastSession && (
            <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs text-amber-700 font-medium flex-shrink-0">
              📂 Sessione passata — sola lettura
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400">
                <span className="text-4xl">🤖</span>
                <p className="text-sm font-medium">Come posso aiutarti?</p>
                <p className="text-xs text-slate-300">Chiedi informazioni, crea prenotazioni,<br/>assegna pulizie e molto altro.</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-medium">{children}</a>
                        ),
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Action card */}
                {msg.action && msg.actionState === "pending" && (
                  <div className="max-w-[90%] mt-2 rounded-2xl border-2 border-amber-400 bg-amber-50 p-3 space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-600 text-sm">✏️</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                        {actionTypeLabel(msg.action.type)}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-amber-900">{msg.action.description}</p>
                    <div className="space-y-0.5">
                      {actionSummary(msg.action, msg.preview ?? null)}
                    </div>
                    {msg.conflictWarning && (
                      <div className="rounded-xl bg-orange-50 border border-orange-200 px-2.5 py-1.5 space-y-0.5">
                        <p className="text-[10px] font-bold text-orange-700">⚠ Appartamento occupato in questa data</p>
                        <p className="text-[10px] text-orange-600">
                          {msg.conflictWarning.guestName || "n/d"} —{" "}
                          {new Date(msg.conflictWarning.checkInDate).toLocaleDateString("it-IT")} →{" "}
                          {new Date(msg.conflictWarning.checkOutDate).toLocaleDateString("it-IT")}
                        </p>
                        <p className="text-[10px] text-orange-600 font-medium">Puoi comunque procedere.</p>
                      </div>
                    )}
                    {msg.actionError && (
                      <p className="text-[10px] font-bold text-red-600 bg-red-50 rounded-xl px-2 py-1">
                        ⚠ {msg.actionError}
                      </p>
                    )}
                    <div className="flex gap-1.5 pt-0.5">
                      <button
                        onClick={() => handleConfirmAction(index)}
                        disabled={msg.action?.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER" && (msg.preview == null || msg.preview.length === 0)}
                        className="flex-1 rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-600 transition-colors disabled:opacity-40"
                      >
                        ✓ Conferma
                      </button>
                      <button
                        onClick={() => handleDismissAction(index)}
                        className="flex-1 rounded-full border border-amber-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        ✕ Annulla
                      </button>
                    </div>
                  </div>
                )}

                {/* Done state */}
                {msg.action && msg.actionState === "done" && (
                  <div className="mt-1 text-[10px] text-emerald-600 font-semibold px-1">✓ Eseguito</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-slate-400 flex items-center gap-1.5">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          {!isPastSession && (
            <div className="px-3 pt-2 pb-1 border-t border-slate-100 flex flex-col gap-2 flex-shrink-0 bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      setTimeout(() => handleAsk(false), 0);
                    }
                  }}
                  placeholder={lastPendingIdx ? "Scrivi 'ok' per confermare..." : "Chiedi all'AI… (Shift+Enter per andare a capo)"}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none overflow-hidden leading-snug"
                  disabled={loading}
                />
                {/* Mic button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={loading}
                  title={listening ? "Interrompi registrazione" : "Parla con l'AI"}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors flex-shrink-0 ${
                    listening
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                  }`}
                >
                  🎤
                </button>
              </div>
              {/* Due pulsanti di invio */}
              <div className="flex gap-2">
                {lastPendingIdx && (
                  <button
                    onClick={() => handleConfirmAction(lastPendingIdx.i)}
                    className="text-[10px] font-black uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded-full transition-colors animate-pulse flex-shrink-0"
                  >
                    ✓ Conferma
                  </button>
                )}
                <button
                  onClick={() => setTimeout(() => handleAsk(false), 0)}
                  disabled={loading || !input.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-40 transition-colors"
                >
                  {loading ? "..." : <><span>🧠</span> AI Interna</>}
                </button>
                <button
                  onClick={() => setTimeout(() => handleAsk(true), 0)}
                  disabled={loading || !input.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-40 transition-colors"
                >
                  <span>🔍</span> Web Search
                </button>
              </div>
              {/* Resize grip */}
              <div className="flex justify-end">
                <div
                  onMouseDown={onResizeStart}
                  title="Ridimensiona"
                  className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-slate-500 cursor-se-resize transition-colors select-none"
                  style={{ fontSize: 12 }}
                >
                  ⇲
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

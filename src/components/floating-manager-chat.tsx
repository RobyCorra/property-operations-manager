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
  getSessionMessages,
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
  const [confirming, setConfirming] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
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

  // Poll for new messages from DB every 15s (sync between devices)
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  useEffect(() => {
    if (!open || isPastSession) return;
    const interval = setInterval(async () => {
      const sid = sessionIdRef.current;
      if (!sid || loading || confirming) return;
      try {
        const dbMessages = await getSessionMessages(sid);
        setMessages((prev) => {
          // Only add messages that aren't already in local state (match by content+role)
          const newFromDB = dbMessages.filter(
            (dbMsg) => !prev.some(
              (localMsg) => localMsg.role === dbMsg.role && localMsg.content === dbMsg.content
            )
          );
          if (newFromDB.length === 0) return prev;
          const toAdd = newFromDB.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
          return [...prev, ...toAdd];
        });
      } catch { /* ignore polling errors */ }
    }, 15000);
    return () => clearInterval(interval);
  }, [open, isPastSession, loading, confirming]);

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

  async function handleAsk(forceWeb = false, overrideContent?: string) {
    if (isPastSession) return;
    const useWeb = forceWeb || webSearch;
    const content = (overrideContent ?? input).trim();
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
      { role: "MANAGER", type: "MANAGER_DASHBOARD", forceWebSearch: useWeb }
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
    if (!msg.action || confirming) return;
    setConfirming(true);
    setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, actionError: undefined } : m));
    try {
      const result = await executeAIAction(msg.action);
      if (result.success) {
        setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, actionState: "done" as const } : m));
        router.refresh();
      } else {
        setMessages((prev) => prev.map((m, i) =>
          i === msgIndex ? { ...m, actionState: "pending" as const, actionError: result.error } : m
        ));
      }
    } catch (err: any) {
      setMessages((prev) => prev.map((m, i) =>
        i === msgIndex ? { ...m, actionState: "pending" as const, actionError: err?.message || "Errore imprevisto." } : m
      ));
    } finally {
      setConfirming(false);
    }
  }, [router, confirming]);

  function handleDismissAction(msgIndex: number) {
    setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, action: undefined, actionState: undefined } : m));
  }

  const lastPendingIdx = messages.map((m, i) => ({ m, i }))
    .reverse()
    .find(({ m }) => m.actionState === "pending" || m.actionState === "error");

  // Unread badge: count AI messages with pending actions
  const pendingCount = messages.filter((m) => m.actionState === "pending").length;

  const SUGGESTIONS = [
    { emoji: "🧹", label: "Pulizie di oggi", prompt: "Quali pulizie ci sono oggi?" },
    { emoji: "🔧", label: "Ticket aperti", prompt: "Quali ticket di manutenzione sono aperti?" },
    { emoji: "📅", label: "Check-in domani", prompt: "Quali check-in ci sono domani?" },
    { emoji: "➕", label: "Nuova pulizia", prompt: "Crea una nuova pulizia" },
  ];

  return (
    <>
      {/* ── Trigger button — solo quando non controllato dall'esterno ── */}
      {!controlled && (
        <button
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
        </button>
      )}

      {/* ── Sheet full-screen ── */}
      {open && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#f8f7ff] md:left-auto md:w-full md:max-w-xl md:border-l md:border-slate-200 md:shadow-2xl">

          {/* Header viola */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", paddingTop: "max(env(safe-area-inset-top), 14px)" }}
          >
            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-lg border border-white/35 shrink-0" style={{ background: "rgba(255,255,255,.22)" }}>
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-extrabold text-white tracking-tight">Assistente AI</h2>
              <p className="text-[11px] text-white/75 flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] bg-green-400 rounded-full inline-block" />
                Sempre disponibile
              </p>
            </div>
            <button
              onClick={() => setMessages([])}
              title="Nuova chat"
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: "rgba(255,255,255,.18)" }}
            >🗑️</button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.18)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Date tabs */}
          {sessionDates.length > 0 && (
            <div className="flex gap-1.5 px-3.5 py-2 border-b border-slate-100 overflow-x-auto shrink-0" style={{ scrollbarWidth: "none" }}>
              {sessionDates.map((d) => (
                <button
                  key={d}
                  onClick={() => loadSessionByDate(d)}
                  className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition-colors border font-semibold ${
                    activeDateStr === d
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {formatDateTab(d)}
                </button>
              ))}
            </div>
          )}

          {/* Past session banner */}
          {isPastSession && (
            <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs text-amber-700 font-medium shrink-0">
              📂 Sessione passata — sola lettura
            </div>
          )}

          {/* Messaggi */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-2.5" style={{ WebkitOverflowScrolling: "touch" }}>

            {messages.length === 0 && !loading && (
              <div className="max-w-[82%] self-start bg-white rounded-[18px] rounded-bl-md px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-800 shadow-sm">
                Ciao 👋 Posso creare pulizie, ticket e prenotazioni, o rispondere a domande sugli appartamenti.
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} gap-2`}>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "text-white rounded-[18px] rounded-br-md"
                      : "bg-white text-slate-800 rounded-[18px] rounded-bl-md shadow-sm"
                  }`}
                  style={msg.role === "user" ? { background: "linear-gradient(135deg,#7c3aed,#9333ea)", boxShadow: "0 2px 8px rgba(124,58,237,.25)" } : undefined}
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

                {/* Card azione */}
                {msg.action && msg.actionState === "pending" && (
                  <div className="max-w-[88%] self-start rounded-[18px] border-[1.5px] border-amber-300 bg-amber-50 p-3.5 space-y-2" style={{ boxShadow: "0 4px 14px rgba(245,158,11,.15)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-[30px] h-[30px] rounded-[10px] bg-amber-100 flex items-center justify-center text-sm shrink-0">
                        {msg.action.type.includes("CLEANING") ? "🧹" : msg.action.type.includes("TICKET") ? "🔧" : msg.action.type.includes("BOOKING") ? "📅" : "✏️"}
                      </div>
                      <p className="text-[12px] font-extrabold text-amber-800">{actionTypeLabel(msg.action.type)}</p>
                    </div>
                    <p className="text-[12.5px] font-medium text-amber-900">{msg.action.description}</p>
                    <div className="space-y-1">{actionSummary(msg.action, msg.preview ?? null)}</div>
                    {msg.conflictWarning && (
                      <div className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-2 space-y-0.5">
                        <p className="text-xs font-bold text-orange-700">⚠ Appartamento occupato in questa data</p>
                        <p className="text-xs text-orange-600">
                          {msg.conflictWarning.guestName || "n/d"} — {new Date(msg.conflictWarning.checkInDate).toLocaleDateString("it-IT")} → {new Date(msg.conflictWarning.checkOutDate).toLocaleDateString("it-IT")}
                        </p>
                        <p className="text-xs text-orange-600 font-medium">Puoi comunque procedere confermando.</p>
                      </div>
                    )}
                    {msg.actionError && (
                      <p className="text-xs font-bold text-red-600 bg-red-50 rounded-xl px-3 py-2">⚠ {msg.actionError} — riprova o annulla.</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleConfirmAction(index)}
                        disabled={confirming || (msg.action?.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER" && (msg.preview == null || msg.preview.length === 0))}
                        className="flex-1 h-10 rounded-[13px] flex items-center justify-center gap-1.5 text-white text-[13px] font-extrabold disabled:opacity-40 active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 12px rgba(5,150,105,.3)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {confirming ? "Esecuzione…" : "Conferma"}
                      </button>
                      <button
                        onClick={() => handleDismissAction(index)}
                        className="w-[84px] h-10 rounded-[13px] bg-white border-[1.5px] border-slate-200 text-slate-500 text-[13px] font-bold active:scale-95 transition-transform"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                )}

                {msg.action && msg.actionState === "done" && (
                  <div className="max-w-[82%] self-start rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                    <p className="text-xs font-bold text-emerald-700">✓ {msg.preview ? `${msg.preview.length} pulizie assegnate` : "Modifica applicata"}</p>
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
                disabled={confirming}
                className="w-full h-10 rounded-[13px] flex items-center justify-center gap-1.5 text-white text-[13px] font-extrabold animate-pulse disabled:animate-none"
                style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 12px rgba(5,150,105,.3)" }}
              >
                ✓ Conferma azione in sospeso
              </button>
            </div>
          )}

          {/* Chip suggerimenti */}
          {!isPastSession && input.length === 0 && !loading && (
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
          {!isPastSession && (
            <div
              className="bg-white border-t border-slate-100 px-3 pt-2.5 flex items-end gap-2 shrink-0"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 14px)" }}
            >
              <button
                type="button"
                onClick={() => setWebSearch((w) => !w)}
                aria-label="Ricerca web"
                className={`w-[42px] h-[42px] rounded-full flex items-center justify-center text-base shrink-0 border-[1.5px] transition-colors ${
                  webSearch ? "bg-indigo-600 border-indigo-600" : "bg-[#f4f2fc] border-[#ede9fe]"
                }`}
              >
                🌐
              </button>
              <input
                ref={inputRef as any}
                className="flex-1 bg-[#f4f2fc] rounded-[22px] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 min-w-0"
                placeholder={lastPendingIdx ? "Scrivi 'ok' per confermare…" : (webSearch ? "Cerca sul web…" : "Scrivi un messaggio…")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAsk(false);
                  }
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleMic}
                disabled={loading}
                title={listening ? "Interrompi registrazione" : "Parla con l'AI"}
                className={`w-[42px] h-[42px] rounded-full flex items-center justify-center text-base shrink-0 transition-colors ${
                  listening ? "bg-red-500 animate-pulse" : "bg-[#f4f2fc]"
                }`}
              >
                🎤
              </button>
              <button
                type="button"
                onClick={() => handleAsk(false)}
                disabled={loading || !input.trim()}
                aria-label="Invia"
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-90 transition-transform"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 12px rgba(124,58,237,.35)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

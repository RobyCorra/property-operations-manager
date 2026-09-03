"use client";

import { useEffect, useRef, useState, useCallback, startTransition, memo } from "react";
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
  clearSessionMessages,
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

  return { text: sanitizeAIText(content) };
}

function sanitizeAIText(text: string): string {
  return text
    .replace(/✓\s*(Modifica applicata|Fatto|Creato|Aggiornato|Cancellato|Eseguito)[^\n]*/gi, "")
    .replace(/Ho (creato|modificato|cancellato|aggiornato|assegnato|rimosso|spostato)[^\n]*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
    BULK_ASSIGN_CHECKINS_BY_FILTER: "Assegnazione check-in",
    BULK_UPDATE_BOOKINGS: "Modifica prenotazioni",
    BULK_CREATE_CLEANINGS: "Crea pulizie",
    BULK_CREATE_BOOKINGS: "Crea prenotazioni",
    BULK_CREATE_TICKETS: "Crea ticket manutenzione",
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
  if (action.type === "BULK_ASSIGN_CHECKINS_BY_FILTER") return (
    <div className="space-y-0.5">
      <p className="text-xs text-amber-700">• Assistente: {action.assignedToName}</p>
      <p className="text-xs text-amber-700">• Periodo: {new Date(action.dateFrom).toLocaleDateString("it-IT")} → {new Date(action.dateTo).toLocaleDateString("it-IT")}</p>
      <p className="text-xs text-amber-700">• Appartamenti: {action.apartmentIds.length > 0 ? `${action.apartmentIds.length} selezionati` : "tutti"}{action.unassignedOnly ? " · solo non assegnati" : ""}</p>
    </div>
  );
  if (action.type === "BULK_CREATE_CLEANINGS") return (
    <div className="space-y-0.5">
      <p className="text-xs font-bold text-amber-800">{action.cleanings.length} pulizie da creare:</p>
      {action.cleanings.map((c, i) => (
        <p key={i} className="text-xs text-amber-700">
          • {c.apartmentName} — {new Date(c.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}{c.assignedToName ? ` → ${c.assignedToName}` : ""}
        </p>
      ))}
    </div>
  );
  if (action.type === "BULK_CREATE_BOOKINGS") return (
    <div className="space-y-0.5">
      <p className="text-xs font-bold text-amber-800">{action.bookings.length} prenotazioni da creare:</p>
      {action.bookings.map((b, i) => (
        <p key={i} className="text-xs text-amber-700">
          • {b.apartmentName} — {new Date(b.checkInDate).toLocaleDateString("it-IT", { day: "numeric", month: "short" })} → {new Date(b.checkOutDate).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}{b.guestName ? ` (${b.guestName})` : ""} · {b.totalGuests} osp.
        </p>
      ))}
    </div>
  );
  if (action.type === "BULK_CREATE_TICKETS") return (
    <div className="space-y-0.5">
      <p className="text-xs font-bold text-amber-800">{action.tickets.length} ticket da creare:</p>
      {action.tickets.map((t, i) => (
        <p key={i} className="text-xs text-amber-700">
          • {t.apartmentName} — {t.title} [{t.priority}]
        </p>
      ))}
    </div>
  );
  if (action.type === "BULK_UPDATE_BOOKINGS") return (
    <div className="space-y-0.5">
      {action.updates.map((u, i) => (
        <p key={i} className="text-xs text-amber-700">
          • {u.apartmentName} — check-in {new Date(u.checkInDate).toLocaleDateString("it-IT")}: {Object.entries(u.fields).map(([k, v]) => fieldLabel(k, v)).join(", ")}
        </p>
      ))}
    </div>
  );
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

// ────────────────────────────────────────────────────────────────────────────
// AIComposer — textarea + bottone Invia con stato locale.
// Estratto e memoizzato per evitare che ogni keystroke re-renderizzi tutta la
// chat (ReactMarkdown sui messaggi è costoso su iOS WebView e faceva
// "inchiodare" la tastiera).
// ────────────────────────────────────────────────────────────────────────────
const AIComposer = memo(function AIComposer({
  placeholder,
  disabled,
  onSend,
}: {
  placeholder: string;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const doSend = useCallback(() => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  }, [text, disabled, onSend]);

  return (
    <div className="flex-1 relative bg-[#f4f2fc] rounded-[24px] border border-[#ede9fe] min-w-0">
      <textarea
        ref={ref}
        className="block w-full bg-transparent px-4 py-3 pr-[52px] text-[16px] outline-none resize-none min-h-[52px] max-h-[140px] leading-snug"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const val = e.target.value;
          setText(val);
          // Autosize schedulato in rAF: evita reflow sincrono ad ogni tasto.
          const el = e.target as HTMLTextAreaElement;
          requestAnimationFrame(() => {
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 140) + "px";
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            doSend();
          }
        }}
        rows={1}
        readOnly={disabled}
        enterKeyHint="send"
        autoCapitalize="sentences"
        autoCorrect="on"
        inputMode="text"
      />
      <button
        type="button"
        onClick={doSend}
        disabled={disabled || !text.trim()}
        aria-label="Invia"
        className="absolute right-2 bottom-2 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform"
        style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 10px rgba(124,58,237,.35)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  );
});

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
  const clearedAtRef = useRef<number>(0); // timestamp ms — messaggi DB prima di questo vengono ignorati
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // "+ Nuova chat" — pulisce la vista corrente senza toccare il DB.
  // I messaggi restano nell'archivio (tab date) ma non compaiono più in "Oggi".
  function handleNewChat() {
    clearedAtRef.current = Date.now();
    setMessages([]);
    setInput("");
  }

  // "🗑 Elimina" — cancella davvero dal DB i messaggi della sessione attiva.
  async function handleDeleteSession() {
    if (!sessionId) return;
    setDeleting(true);
    try {
      await clearSessionMessages(sessionId);
      clearedAtRef.current = Date.now();
      setMessages([]);
      setDeleteConfirm(false);
      // Aggiorna elenco date perché la sessione potrebbe essere vuota ora
      try {
        const dates = await getSessionDates();
        setSessionDates(dates);
      } catch {}
    } finally {
      setDeleting(false);
    }
  }

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

  async function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setInput((prev) => prev + (prev ? " " : "") + "⚠ Microfono non supportato su questo browser");
      return;
    }

    // Su Android Chrome la Web Speech API non innesca in modo affidabile il prompt
    // del microfono: richiediamo prima esplicitamente l'accesso con getUserMedia,
    // così il permesso viene chiesto/confermato correttamente prima di avviare.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Chiudiamo subito lo stream: serviva solo a sbloccare/confermare il permesso.
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setInput((prev) => prev + (prev ? " " : "") + "⚠ Permesso microfono negato. Abilitalo per questo sito nelle impostazioni del browser (icona lucchetto accanto all'indirizzo).");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "it-IT";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognition.onerror = (event: any) => {
      setListening(false);
      recognitionRef.current = null;
      const err = event?.error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        setInput((prev) => prev + (prev ? " " : "") + "⚠ Accesso al microfono bloccato. Tocca l'icona del lucchetto accanto all'indirizzo e consenti il microfono, poi riprova.");
      } else if (err === "no-speech") {
        setInput((prev) => prev + (prev ? " " : "") + "⚠ Nessuna voce rilevata, riprova.");
      } else if (err === "network") {
        setInput((prev) => prev + (prev ? " " : "") + "⚠ Riconoscimento vocale non disponibile offline.");
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = (event.results[0][0].transcript as string).trim();
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setListening(false); }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Non autofocus: evita apertura tastiera su mobile

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
        const cutoff = clearedAtRef.current;
        setMessages((prev) => {
          // Ignora messaggi salvati prima dell'ultimo clear
          const eligible = dbMessages.filter(
            (m) => cutoff === 0 || new Date(m.createdAt).getTime() > cutoff
          );
          // Only add messages that aren't already in local state (match by content+role)
          const newFromDB = eligible.filter(
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

  // Riferimento sempre aggiornato a handleAsk, così AIComposer può ricevere
  // un onSend con riferimento STABILE (senza forzarne il re-render ad ogni
  // cambio di stato del parent).
  const handleAskRef = useRef<((forceWeb?: boolean, overrideContent?: string) => Promise<void>) | null>(null);
  const onComposerSend = useCallback((text: string) => {
    handleAskRef.current?.(false, text);
  }, []);

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
        setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, actionState: "done" as const, actionError: result.error } : m));
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

  // Mantieni handleAskRef sempre in linea con l'ultima versione di handleAsk.
  useEffect(() => {
    handleAskRef.current = handleAsk;
  });

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
              onClick={handleNewChat}
              title="Nuova chat"
              aria-label="Nuova chat"
              className="h-9 px-3 rounded-full flex items-center gap-1.5 text-[12px] font-bold text-white"
              style={{ background: "rgba(255,255,255,.22)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuova
            </button>
            {messages.length > 0 && (
              <button
                onClick={() => setDeleteConfirm(true)}
                title="Elimina definitivamente questa conversazione"
                aria-label="Elimina questa conversazione"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                style={{ background: "rgba(255,255,255,.18)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              className="w-9 h-9 rounded-full flex items-center justify-center"
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
          <div className="flex-1 overflow-y-auto px-3.5 py-4 pb-6 flex flex-col gap-2.5" style={{ WebkitOverflowScrolling: "touch" }}>

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
                  <div className="max-w-[82%] self-start rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 space-y-1">
                    <p className="text-xs font-bold text-emerald-700">✓ {msg.preview ? `${msg.preview.length} pulizie assegnate` : "Modifica applicata"}</p>
                    {msg.actionError && (
                      <p className="text-xs text-amber-700">⚠ {msg.actionError}</p>
                    )}
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

          {/* Card azioni rapide (2 colonne) — quando la chat è vuota */}
          {!isPastSession && !loading && messages.length === 0 && (
            <div className="px-3.5 pb-2 shrink-0 grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleAsk(false, s.prompt)}
                  className="bg-white border border-[#ede9fe] rounded-2xl px-3 py-3 flex items-center gap-3 shadow-sm active:scale-[.98] transition-transform text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center text-[20px] shrink-0">
                    {s.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-extrabold text-slate-800 leading-tight truncate">{s.label}</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">Tocca per chiedere</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Conferma eliminazione */}
          {deleteConfirm && (
            <div className="mx-3.5 mb-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 shrink-0 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" className="shrink-0 mt-0.5">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-[13px] text-rose-800 leading-snug">
                  <span className="font-bold">Eliminare questa conversazione?</span><br />
                  I messaggi verranno cancellati dal database e non saranno più recuperabili.
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-[13px] font-bold text-slate-600 active:scale-[.98] transition-transform disabled:opacity-50"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSession}
                  disabled={deleting}
                  className="flex-1 h-10 rounded-xl bg-rose-600 text-[13px] font-bold text-white active:scale-[.98] transition-transform disabled:opacity-60"
                >
                  {deleting ? "Eliminazione…" : "Sì, elimina"}
                </button>
              </div>
            </div>
          )}

          {/* Indicatore ascolto vocale */}
          {listening && (
            <div className="mx-3.5 mb-2 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 px-4 py-3 shrink-0 flex items-center gap-3">
              <div className="flex items-end gap-[3px] h-6">
                <span className="w-[3px] bg-violet-600 rounded-full animate-[voiceWave_1s_ease_infinite]" style={{ height: 14 }} />
                <span className="w-[3px] bg-violet-600 rounded-full animate-[voiceWave_1s_ease_infinite]" style={{ height: 22, animationDelay: ".15s" }} />
                <span className="w-[3px] bg-violet-600 rounded-full animate-[voiceWave_1s_ease_infinite]" style={{ height: 10, animationDelay: ".3s" }} />
                <span className="w-[3px] bg-violet-600 rounded-full animate-[voiceWave_1s_ease_infinite]" style={{ height: 20, animationDelay: ".45s" }} />
                <span className="w-[3px] bg-violet-600 rounded-full animate-[voiceWave_1s_ease_infinite]" style={{ height: 14, animationDelay: ".6s" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-violet-800">Sto ascoltando…</p>
                <p className="text-[11px] text-slate-500">Parla pure — trascrivo in messaggio</p>
              </div>
              <button
                type="button"
                onClick={toggleMic}
                aria-label="Stop dettatura"
                className="w-9 h-9 rounded-full bg-white border border-violet-200 text-violet-600 flex items-center justify-center active:scale-90 transition-transform shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              </button>
            </div>
          )}

          {/* Input bar */}
          {!isPastSession && (
            <div
              className="bg-white border-t border-slate-100 px-3 pt-3 shrink-0"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 14px)" }}
            >
              <div className="flex items-end gap-2.5">
                {/* Composer memoizzato — stato locale, non ri-renderizza la chat ad ogni tasto */}
                <AIComposer
                  placeholder={lastPendingIdx ? "Scrivi 'ok' per confermare…" : (webSearch ? "Cerca sul web…" : "Scrivi un messaggio…")}
                  disabled={loading}
                  onSend={onComposerSend}
                />

                {/* Toggle Ricerca web grande (al posto del microfono) */}
                <button
                  type="button"
                  onClick={() => setWebSearch((v) => !v)}
                  aria-label={webSearch ? "Disattiva ricerca web" : "Attiva ricerca web"}
                  title="Ricerca web"
                  className={`relative w-[58px] h-[58px] rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform border ${
                    webSearch
                      ? "text-white border-transparent"
                      : "bg-white text-violet-600 border-[#ede9fe]"
                  }`}
                  style={
                    webSearch
                      ? { background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 6px 16px rgba(59,130,246,.40)" }
                      : { boxShadow: "0 4px 12px rgba(0,0,0,.06)" }
                  }
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  {webSearch && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

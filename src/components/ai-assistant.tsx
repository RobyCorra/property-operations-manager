"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { askAI } from "@/src/app/actions/ai";
import { executeAIAction } from "@/src/app/actions/operational";
import type { AIActionPayload } from "@/src/app/actions/operational";
import { useRouter } from "next/navigation";

type PreviewCleaning = {
  id: string;
  date: string;
  status: string;
  apartmentName: string;
  assignedTo: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  action?: AIActionPayload;
  actionState?: "pending" | "done" | "error";
  actionError?: string;
  preview?: PreviewCleaning[] | null;
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
};

// Estrae il blocco ACTION dal testo dell'AI con brace-matching (robusto a qualsiasi formato)
function parseAction(content: string): { text: string; action?: AIActionPayload } {
  const actionIdx = content.indexOf("ACTION:");
  if (actionIdx === -1) return { text: content };

  const afterAction = content.slice(actionIdx + "ACTION:".length);
  const jsonStart = afterAction.indexOf("{");
  if (jsonStart === -1) return { text: content };

  // Trova la parentesi graffa di chiusura con brace-matching
  let depth = 0;
  let jsonEnd = -1;
  for (let i = jsonStart; i < afterAction.length; i++) {
    if (afterAction[i] === "{") depth++;
    else if (afterAction[i] === "}") {
      depth--;
      if (depth === 0) { jsonEnd = i; break; }
    }
  }
  if (jsonEnd === -1) return { text: content };

  const jsonStr = afterAction.slice(jsonStart, jsonEnd + 1);
  try {
    const action = JSON.parse(jsonStr) as AIActionPayload;
    const text = content.slice(0, actionIdx).trim();
    return { text, action };
  } catch {
    return { text: content };
  }
}

function actionTypeLabel(type: string) {
  if (type === "CREATE_BOOKING") return "Nuova prenotazione";
  if (type === "UPDATE_BOOKING") return "Modifica prenotazione";
  if (type === "UPDATE_CLEANING") return "Modifica pulizia";
  if (type === "UPDATE_TICKET") return "Modifica ticket manutenzione";
  if (type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") return "Assegnazione pulizie";
  return "Modifica";
}

function actionSummary(action: AIActionPayload, preview: PreviewCleaning[] | null): React.ReactNode {
  if (action.type === "CREATE_BOOKING") {
    return (
      <div className="space-y-1">
        <p className="text-xs text-amber-700">• Appartamento: {action.apartmentName}</p>
        <p className="text-xs text-amber-700">• Check-in: {new Date(action.checkInDate).toLocaleDateString("it-IT")}</p>
        <p className="text-xs text-amber-700">• Check-out: {new Date(action.checkOutDate).toLocaleDateString("it-IT")}</p>
        <p className="text-xs text-amber-700">• Ospiti: {action.totalGuests}</p>
        {action.guestName && <p className="text-xs text-amber-700">• Nome ospite: {action.guestName}</p>}
      </div>
    );
  }
  if (action.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") {
    if (!preview) return <p className="text-xs text-amber-500 animate-pulse">Caricamento anteprima...</p>;
    if (preview.length === 0) return <p className="text-xs text-red-600">⚠ Nessuna pulizia trovata con questi filtri.</p>;
    return (
      <div className="space-y-1">
        <p className="text-xs font-bold text-amber-800">{preview.length} pulizie trovate:</p>
        {preview.map((c) => (
          <p key={c.id} className="text-xs text-amber-700">
            • {c.apartmentName} — {new Date(c.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })} ({c.status}) {c.assignedTo ? `→ attuale: ${c.assignedTo}` : ""}
          </p>
        ))}
      </div>
    );
  }
  const fields = (action as any).fields ?? {};
  return Object.entries(fields).map(([k, v]) => (
    <p key={k} className="text-xs text-amber-700">• {fieldLabel(k, v)}</p>
  ));
}

function fieldLabel(key: string, value: unknown): string {
  const labels: Record<string, string> = {
    guestName: "Nome ospite",
    totalGuests: "Numero ospiti",
    checkInDate: "Check-in",
    checkOutDate: "Check-out",
    notes: "Note",
    date: "Data pulizia",
    assignedToId: "Cleaner assegnato",
    title: "Titolo",
    description: "Descrizione",
    priority: "Priorità",
    scheduledStart: "Data intervento",
  };
  const label = labels[key] ?? key;
  let display = String(value);
  // Formatta le date ISO in leggibile
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    display = new Date(value).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
  }
  return `${label}: ${display}`;
}

export default function AIAssistant({
  role,
  type,
  apartmentId,
  cleaningTaskId,
  maintenanceTicketId,
  initialMessages = [],
  compact = false,
}: AIAssistantProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
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

  async function handleAsk() {
    const content = input.trim();
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
      { role, type, apartmentId, cleaningTaskId, maintenanceTicketId }
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
    setMessages([
      ...nextMessages,
      { role: "assistant", content: text, action, actionState: action ? "pending" : undefined, preview },
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
    <div className={`border border-slate-100 bg-white/70 ${compact ? "rounded-3xl p-4" : "mt-4 rounded-lg p-4"}`}>
      <h3 className="font-semibold mb-2">{compact ? "🤖 AI Assistente" : "Chiedi aiuto IA"}</h3>

      <input
        className="w-full border border-slate-200 p-2 rounded-2xl mb-2 text-sm outline-none focus:ring-2 focus:ring-black"
        placeholder="Descrivi il problema o chiedi una modifica..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAsk();
          }
        }}
      />

      <div className="flex gap-2">
        <button
          onClick={handleAsk}
          className="px-4 py-2 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest"
        >
          {loading ? "Caricamento..." : "Chiedi"}
        </button>
        {lastPendingIdx && (
          <button
            onClick={() => handleConfirmAction(lastPendingIdx.i)}
            className="px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors animate-pulse"
          >
            ✓ Conferma azione
          </button>
        )}
      </div>

      {messages.length > 0 && (
        <div className={`mt-3 overflow-y-auto space-y-2 ${compact ? "max-h-56" : "max-h-80"}`}>
          {messages.map((message, index) => (
            <div key={index} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] p-3 rounded text-sm whitespace-pre-line ${
                  message.role === "user"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-slate-900"
                }`}
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

              {/* Blocco di conferma ACTION */}
              {message.action && message.actionState === "pending" && (
                <div className="max-w-[85%] mt-2 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 space-y-3 shadow-md shadow-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 text-base">✏️</span>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">
                      {actionTypeLabel(message.action.type)} — premi Conferma per eseguire
                    </p>
                  </div>
                  <p className="text-sm font-medium text-amber-900">{message.action.description}</p>
                  <div className="space-y-1">
                    {actionSummary(message.action, message.preview ?? null)}
                  </div>
                  {message.actionError && (
                    <p className="text-xs font-bold text-red-600 bg-red-50 rounded-xl px-3 py-2">
                      ⚠ {message.actionError} — riprova o annulla.
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleConfirmAction(index)}
                      disabled={message.action?.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER" && (message.preview == null || message.preview.length === 0)}
                      className="flex-1 rounded-full bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ✓ Conferma
                    </button>
                    <button
                      onClick={() => handleDismissAction(index)}
                      className="flex-1 rounded-full border border-amber-300 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      ✕ Annulla
                    </button>
                  </div>
                </div>
              )}

              {message.actionState === "done" && (
                <div className="max-w-[85%] mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                  <p className="text-xs font-bold text-emerald-700">
                    ✓ {message.preview ? `${message.preview.length} pulizie assegnate` : "Modifica applicata"}
                  </p>
                </div>
              )}

              {message.actionState === "error" && (
                <div className="max-w-[85%] mt-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2">
                  <p className="text-xs font-bold text-red-700">⚠ {message.actionError || "Errore durante l'aggiornamento"}</p>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded text-sm bg-gray-100 text-slate-500">
                Sto scrivendo...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

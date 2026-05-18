"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { askAI } from "@/src/app/actions/ai";
import { executeAIAction } from "@/src/app/actions/operational";
import type { AIActionPayload } from "@/src/app/actions/operational";
import { useRouter } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  action?: AIActionPayload;
  actionState?: "pending" | "done" | "error";
  actionError?: string;
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

// Estrae il blocco ACTION dal testo dell'AI
function parseAction(content: string): { text: string; action?: AIActionPayload } {
  const match = content.match(/ACTION:\s*(\{.*\})/);
  if (!match) return { text: content };
  try {
    const action = JSON.parse(match[1]) as AIActionPayload;
    const text = content.replace(/ACTION:\s*\{.*\}/, "").trim();
    return { text, action };
  } catch {
    return { text: content };
  }
}

function actionTypeLabel(type: string) {
  if (type === "UPDATE_BOOKING") return "Modifica prenotazione";
  if (type === "UPDATE_CLEANING") return "Modifica pulizia";
  if (type === "UPDATE_TICKET") return "Modifica ticket manutenzione";
  if (type === "BULK_ASSIGN_CLEANINGS") return "Assegnazione pulizie";
  return "Modifica";
}

function actionSummary(action: AIActionPayload): React.ReactNode {
  if (action.type === "BULK_ASSIGN_CLEANINGS") {
    return <p className="text-xs text-amber-700">• {action.ids.length} pulizie da assegnare</p>;
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleAsk() {
    const content = input.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const res = await askAI(
      nextMessages.map((m) => ({ role: m.role, content: m.content })),
      { role, type, apartmentId, cleaningTaskId, maintenanceTicketId }
    );

    const { text, action } = parseAction(res || "");
    setMessages([
      ...nextMessages,
      { role: "assistant", content: text, action, actionState: action ? "pending" : undefined },
    ]);
    setLoading(false);
  }

  async function handleConfirmAction(msgIndex: number) {
    const msg = messages[msgIndex];
    if (!msg.action) return;

    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, actionState: "done" as const } : m))
    );

    const result = await executeAIAction(msg.action);

    if (result.success) {
      router.refresh();
    } else {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, actionState: "error" as const, actionError: result.error } : m
        )
      );
    }
  }

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

      <button
        onClick={handleAsk}
        className="px-4 py-2 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest"
      >
        {loading ? "Caricamento..." : "Chiedi"}
      </button>

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
                <div className="max-w-[85%] mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 text-base">✏️</span>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">
                      {actionTypeLabel(message.action.type)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-amber-900">{message.action.description}</p>
                  <div className="space-y-1">
                    {actionSummary(message.action)}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleConfirmAction(index)}
                      className="flex-1 rounded-full bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-600 transition-colors"
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
                  <p className="text-xs font-bold text-emerald-700">✓ Modifica applicata</p>
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

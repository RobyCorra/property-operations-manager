"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { askAI } from "@/src/app/actions/ai";
import { MessageSquare } from "@/src/components/icons";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ManagerAIChatProps = {
  apartmentId?: string;
  apartmentName?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ManagerAIChat({
  apartmentId,
  apartmentName,
  isOpen,
  onClose,
}: ManagerAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const type = apartmentId ? "APARTMENT" : "MANAGER_DASHBOARD";

      console.log("[AI UI DEBUG] apartmentId inviato:", apartmentId);
      console.log("[AI CALL DEBUG]", {
        apartmentId,
        apartmentName,
        type,
      });

      const response = await askAI(nextMessages, {
        role: "MANAGER",
        type,
        apartmentId,
      });

      setMessages([...nextMessages, { role: "assistant", content: response || "" }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Non sono riuscito a ricevere una risposta dalla IA. Riprova.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Chiudi assistente IA"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-white/50 bg-white shadow-2xl shadow-slate-950/20 sm:rounded-l-[2rem]">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Assistente IA Manager
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Chiedi informazioni operative su appartamenti, pulizie, manutenzioni e prenotazioni
              </p>
              {apartmentName && (
                <p className="mt-3 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-700">
                  Contesto: {apartmentName}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Chiudi"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-500">
              Scrivi una domanda operativa. Posso aiutarti a ragionare su appartamenti, pulizie,
              manutenzioni e prenotazioni usando il contesto disponibile.
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line ${
                  message.role === "user"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-100 bg-slate-50 text-slate-800"
                }`}
              >
                <ReactMarkdown
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#2563eb", textDecoration: "underline" }}
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Sto scrivendo...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Scrivi una domanda..."
              rows={2}
              className="min-h-11 flex-1 resize-none border-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Invio..." : "Invia"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

type ManagerAIChatLauncherProps = {
  apartmentId?: string;
  apartmentName?: string;
  compact?: boolean;
};

export function ManagerAIChatLauncher({ apartmentId, apartmentName, compact }: ManagerAIChatLauncherProps = {}) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsAIChatOpen(true)}
        className={
          compact
            ? "flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 h-12 shadow-sm text-xs font-bold uppercase tracking-widest text-violet-700 transition hover:bg-violet-50 hover:shadow-md whitespace-nowrap"
            : "mt-5 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white/70 px-5 py-3 text-xs font-bold uppercase tracking-widest text-violet-700 shadow-sm shadow-violet-500/5 transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
        }
      >
        <MessageSquare size={16} />
        Assistente IA
      </button>

      <ManagerAIChat
        apartmentId={apartmentId}
        apartmentName={apartmentName}
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </>
  );
}

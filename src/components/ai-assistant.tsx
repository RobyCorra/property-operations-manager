"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { askAI } from "@/src/app/actions/ai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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

export default function AIAssistant({
  role,
  type,
  apartmentId,
  cleaningTaskId,
  maintenanceTicketId,
  initialMessages = [],
  compact = false,
}: AIAssistantProps) {
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

    console.log("[AI UI DEBUG] apartmentId inviato:", apartmentId);

    const res = await askAI(nextMessages, {
      role,
      type,
      apartmentId,
      cleaningTaskId,
      maintenanceTicketId,
    });

    setMessages([...nextMessages, { role: "assistant", content: res || "" }]);
    setLoading(false);
  }

  return (
    <div className={`border border-slate-100 bg-white/70 ${compact ? "rounded-3xl p-4" : "mt-4 rounded-lg p-4"}`}>
      <h3 className="font-semibold mb-2">{compact ? "🤖 AI Assistente" : "Chiedi aiuto IA"}</h3>

      <input
        className="w-full border border-slate-200 p-2 rounded-2xl mb-2 text-sm outline-none focus:ring-2 focus:ring-black"
        placeholder="Descrivi il problema..."
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
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
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
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
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

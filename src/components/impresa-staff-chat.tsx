"use client";

import { useState, useTransition } from "react";
import { getMyImpresaThread, sendMyImpresaMessage, type ChatMsg } from "@/src/app/actions/company";

export default function ImpresaStaffChat({ initial }: { initial: ChatMsg[] }) {
  const [messages, setMessages] = useState<ChatMsg[]>(initial);
  const [text, setText] = useState("");
  const [sending, startSend] = useTransition();

  const send = () => {
    if (!text.trim()) return;
    const body = text.trim();
    setText("");
    startSend(async () => {
      const r = await sendMyImpresaMessage(body);
      if (r.success) setMessages(await getMyImpresaThread());
    });
  };

  return (
    <div className="flex min-h-[460px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-slate-900">La tua impresa</div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && <p className="text-xs text-gray-400">Nessun messaggio. Scrivi al tuo responsabile.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.mine ? "bg-violet-500 text-white" : "bg-gray-100 text-slate-800"}`}>
              {m.text}
              <div className={`mt-0.5 text-[10px] ${m.mine ? "text-violet-100" : "text-gray-400"}`}>
                {new Date(m.createdAt).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Scrivi un messaggio…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <button onClick={send} disabled={sending || !text.trim()} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          Invia
        </button>
      </div>
    </div>
  );
}

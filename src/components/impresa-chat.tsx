"use client";

import { useState, useTransition } from "react";
import {
  getImpresaThread,
  sendImpresaMessage,
  type ImpresaThreadSummary,
  type ChatMsg,
} from "@/src/app/actions/company";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Addetto pulizie",
  MAINTENANCE: "Manutentore",
  CHECKIN: "Addetto check-in",
  SUPERVISOR: "Supervisor",
};

export default function ImpresaChat({ threads }: { threads: ImpresaThreadSummary[] }) {
  const [sel, setSel] = useState<ImpresaThreadSummary | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [loading, startLoad] = useTransition();
  const [sending, startSend] = useTransition();

  const open = (t: ImpresaThreadSummary) => {
    setSel(t);
    setMessages([]);
    startLoad(async () => {
      const r = await getImpresaThread(t.staffUserId);
      setMessages(r?.messages ?? []);
    });
  };

  const send = () => {
    if (!sel || !text.trim()) return;
    const body = text.trim();
    setText("");
    startSend(async () => {
      const r = await sendImpresaMessage(sel.staffUserId, body);
      if (r.success) {
        const t = await getImpresaThread(sel.staffUserId);
        setMessages(t?.messages ?? []);
      }
    });
  };

  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        Nessun operatore. Aggiungine in <strong>Staff</strong> per iniziare a scrivere.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
      {/* Lista operatori */}
      <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        {threads.map((t) => (
          <button
            key={t.staffUserId}
            onClick={() => open(t)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${sel?.staffUserId === t.staffUserId ? "bg-violet-50" : "hover:bg-gray-50"}`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm">👤</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{t.name}</p>
              <p className="truncate text-[11px] text-gray-400">{t.lastText ?? ROLE_LABEL[t.role] ?? t.role}</p>
            </div>
            {t.unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{t.unread}</span>}
          </button>
        ))}
      </div>

      {/* Thread */}
      <div className="flex min-h-[420px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
        {!sel ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-400">Seleziona un operatore per chattare.</div>
        ) : (
          <>
            <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-slate-900">{sel.name}</div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {loading && <p className="text-xs text-gray-400">Carico…</p>}
              {!loading && messages.length === 0 && <p className="text-xs text-gray-400">Nessun messaggio. Scrivi il primo.</p>}
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
          </>
        )}
      </div>
    </div>
  );
}

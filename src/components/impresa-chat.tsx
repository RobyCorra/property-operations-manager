"use client";

import { useState, useTransition } from "react";
import {
  getImpresaThread,
  sendImpresaMessage,
  type ImpresaThreadSummary,
  type ChatMsg,
} from "@/src/app/actions/company";
import ImpresaChatThread from "@/src/components/impresa-chat-thread";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Addetto pulizie",
  MAINTENANCE: "Manutentore",
  CHECKIN: "Addetto check-in",
  SUPERVISOR: "Supervisor",
};

export default function ImpresaChat({ threads }: { threads: ImpresaThreadSummary[] }) {
  const [sel, setSel] = useState<ImpresaThreadSummary | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, startLoad] = useTransition();

  const load = (staffUserId: string) => {
    startLoad(async () => {
      const r = await getImpresaThread(staffUserId);
      setMessages(r?.messages ?? []);
    });
  };
  const open = (t: ImpresaThreadSummary) => { setSel(t); setMessages([]); load(t.staffUserId); };

  if (threads.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        Nessun operatore. Aggiungine in <strong>Staff</strong> per iniziare a scrivere.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
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

      {!sel ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
          Seleziona un operatore per chattare.
        </div>
      ) : (
        <ImpresaChatThread
          headerName={sel.name}
          messages={messages}
          loading={loading}
          onSend={(fd) => sendImpresaMessage(sel.staffUserId, fd)}
          onSent={() => load(sel.staffUserId)}
        />
      )}
    </div>
  );
}

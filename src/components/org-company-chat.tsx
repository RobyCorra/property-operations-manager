"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  getOrgCompanyThreads,
  getOrgCompanyThread,
  sendOrgCompanyMessage,
  type OrgCompanyThreadSummary,
  type ChatMsg,
} from "@/src/app/actions/company";
import ImpresaChatThread from "@/src/components/impresa-chat-thread";
import { playMessageBeep, setupNotificationAudio } from "@/src/lib/notification-sound";

export default function OrgCompanyChat({ threads: initialThreads, hideTitle }: { threads: OrgCompanyThreadSummary[]; hideTitle?: boolean }) {
  const [threads, setThreads] = useState(initialThreads);
  const [sel, setSel] = useState<OrgCompanyThreadSummary | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, startLoad] = useTransition();
  const prevRef = useRef(initialThreads.reduce((s, t) => s + t.unread, 0));
  const selRef = useRef<string | null>(null);

  useEffect(() => { setupNotificationAudio(); }, []);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const list = await getOrgCompanyThreads();
        if (!alive) return;
        const total = list.reduce((s, t) => s + t.unread, 0);
        if (total > prevRef.current) playMessageBeep();
        prevRef.current = total;
        setThreads(list);
        if (selRef.current) {
          const r = await getOrgCompanyThread(selRef.current);
          if (!alive) return;
          if (r) setMessages(r.messages);
        }
      } catch {}
    };
    const id = setInterval(tick, 5000);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  const load = (companyId: string) => {
    startLoad(async () => {
      const r = await getOrgCompanyThread(companyId);
      setMessages(r?.messages ?? []);
      const list = await getOrgCompanyThreads();
      prevRef.current = list.reduce((s, t) => s + t.unread, 0);
      setThreads(list);
    });
  };
  const open = (t: OrgCompanyThreadSummary) => { setSel(t); selRef.current = t.companyId; setMessages([]); load(t.companyId); };

  if (threads.length === 0) return null;

  return (
    <div className="space-y-3">
      {!hideTitle && <h2 className="text-lg font-semibold text-slate-900">Imprese delegate</h2>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
          {threads.map((t) => (
            <button
              key={t.companyId}
              onClick={() => open(t)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${sel?.companyId === t.companyId ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                {t.counterpartName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${t.unread > 0 ? "text-rose-600" : "text-slate-800"}`}>{t.counterpartName}</p>
                <p className="truncate text-[11px] text-gray-400">{t.scopes.join(", ")}</p>
              </div>
              {t.unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white animate-pulse">{t.unread}</span>}
            </button>
          ))}
        </div>

        {!sel ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
            Seleziona un&apos;impresa per chattare.
          </div>
        ) : (
          <ImpresaChatThread
            headerName={sel.counterpartName}
            messages={messages}
            loading={loading}
            onSend={(fd) => sendOrgCompanyMessage(sel.companyId, fd)}
            onSent={() => load(sel.companyId)}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { Users, User, ChevronRight } from "./icons";
import { ChevronDown } from "lucide-react";
import ImpresaChatThread from "./impresa-chat-thread";
import type { ChatMsg } from "@/src/app/actions/company";
import type { OrgStaffThreadSummary } from "@/src/app/actions/messages";
import { getOrgStaffThreads, getOrgStaffThread, sendOrgStaffMessage } from "@/src/app/actions/messages";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Pulizie",
  MAINTENANCE: "Manutenzione",
  CHECKIN: "Check-in",
  SUPERVISOR: "Supervisor",
};

function beep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880; g.gain.value = 0.12;
    o.start();
    setTimeout(() => { try { o.stop(); ctx.close(); } catch {} }, 200);
  } catch {}
}

export default function OrgStaffChat({ threads: initial }: { threads: OrgStaffThreadSummary[] }) {
  const [threads, setThreads] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [headerName, setHeaderName] = useState("");
  const [isLoading, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(true);
  const prevUnread = useRef(0);

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const fresh = await getOrgStaffThreads();
        if (!alive) return;
        const newTotal = fresh.reduce((s, t) => s + t.unread, 0);
        if (newTotal > prevUnread.current) beep();
        prevUnread.current = newTotal;
        setThreads(fresh);
      } catch {}
    };
    const id = setInterval(tick, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const openThread = useCallback((staffUserId: string) => {
    setSelected(staffUserId);
    startTransition(async () => {
      const data = await getOrgStaffThread(staffUserId);
      if (data) { setMessages(data.messages as ChatMsg[]); setHeaderName(data.name); }
    });
  }, []);

  const handleSend = useCallback(async (formData: FormData) => {
    if (!selected) return { success: false, error: "Nessun operatore selezionato." };
    return await sendOrgStaffMessage(selected, formData);
  }, [selected]);

  const handleSent = useCallback(() => {
    if (!selected) return;
    startTransition(async () => {
      const data = await getOrgStaffThread(selected);
      if (data) setMessages(data.messages as ChatMsg[]);
      const fresh = await getOrgStaffThreads();
      setThreads(fresh);
    });
  }, [selected]);

  if (threads.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Users size={15} className="text-indigo-600" />
          </div>
          <span className="text-sm font-black text-slate-900 tracking-tight">Team</span>
          <span className="text-[10px] text-slate-400 font-medium">Staff diretto</span>
          {totalUnread > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </div>
        {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="flex border-t border-slate-100" style={{ minHeight: selected ? 420 : undefined }}>
          {/* Thread list */}
          <div className={`${selected ? "hidden md:block" : ""} w-full md:w-[260px] border-r border-slate-50 overflow-y-auto`}>
            {threads.map((t) => (
              <button
                key={t.staffUserId}
                type="button"
                onClick={() => openThread(t.staffUserId)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 ${
                  selected === t.staffUserId ? "bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  selected === t.staffUserId ? "bg-indigo-500" : "bg-slate-100"
                }`}>
                  <User size={15} className={selected === t.staffUserId ? "text-white" : "text-slate-500"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${t.unread ? "font-black" : "font-semibold"} text-slate-800`}>{t.name}</span>
                    {t.unread > 0 && (
                      <span className="w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shrink-0">{t.unread}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{ROLE_LABEL[t.role] ?? t.role}</p>
                  {t.lastText && <p className="text-xs text-slate-400 truncate mt-0.5">{t.lastText}</p>}
                </div>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className={`${!selected ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0`}>
            {selected ? (
              <>
                {/* Mobile back */}
                <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                  <button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-indigo-600">← Team</button>
                </div>
                <ImpresaChatThread
                  messages={messages}
                  headerName={headerName}
                  onSend={handleSend}
                  onSent={handleSent}
                  loading={isLoading}
                />
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-slate-300 text-sm font-medium py-12">
                Seleziona un membro del team
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

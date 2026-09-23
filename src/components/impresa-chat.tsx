"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  getImpresaThread,
  getImpresaThreads,
  sendImpresaMessage,
  getImpresaOrgThreads,
  getImpresaOrgThread,
  sendImpresaOrgMessage,
  getImpresaDelegatedThreads,
  getImpresaDelegatedThread,
  sendImpresaDelegatedMessage,
  type ImpresaThreadSummary,
  type OrgCompanyThreadSummary,
  type DelegatedInterventionThread,
  type ChatMsg,
} from "@/src/app/actions/company";
import ImpresaChatThread from "@/src/components/impresa-chat-thread";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Addetto pulizie",
  MAINTENANCE: "Manutentore",
  CHECKIN: "Addetto check-in",
  SUPERVISOR: "Supervisor",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "In attesa",
  IN_PROGRESS: "In corso",
  COMPLETED: "Completato",
  APPROVED: "Approvato",
  OPEN: "Aperto",
  CLOSED: "Chiuso",
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

type Tab = "orgs" | "interventions" | "staff";

export default function ImpresaChat({
  staffThreads: initialStaff,
  orgThreads: initialOrgs,
  delegatedThreads: initialDelegated = [],
}: {
  staffThreads: ImpresaThreadSummary[];
  orgThreads: OrgCompanyThreadSummary[];
  delegatedThreads?: DelegatedInterventionThread[];
}) {
  const [tab, setTab] = useState<Tab>(initialOrgs.length > 0 ? "orgs" : initialDelegated.length > 0 ? "interventions" : "staff");
  const [staffList, setStaffList] = useState(initialStaff);
  const [orgList, setOrgList] = useState(initialOrgs);
  const [delegatedList, setDelegatedList] = useState(initialDelegated);

  // Staff chat state
  const [selStaff, setSelStaff] = useState<ImpresaThreadSummary | null>(null);
  const [staffMsgs, setStaffMsgs] = useState<ChatMsg[]>([]);
  const [staffLoading, startStaffLoad] = useTransition();

  // Org chat state
  const [selOrg, setSelOrg] = useState<OrgCompanyThreadSummary | null>(null);
  const [orgMsgs, setOrgMsgs] = useState<ChatMsg[]>([]);
  const [orgLoading, startOrgLoad] = useTransition();

  // Delegated intervention chat state
  const [selDel, setSelDel] = useState<DelegatedInterventionThread | null>(null);
  const [delMsgs, setDelMsgs] = useState<ChatMsg[]>([]);
  const [delLoading, startDelLoad] = useTransition();

  const prevUnreadRef = useRef(
    initialStaff.reduce((s, t) => s + t.unread, 0) +
    initialOrgs.reduce((s, t) => s + t.unread, 0) +
    initialDelegated.reduce((s, t) => s + t.unread, 0),
  );

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const [sl, ol, dl] = await Promise.all([getImpresaThreads(), getImpresaOrgThreads(), getImpresaDelegatedThreads()]);
      if (!alive) return;
      const total = sl.reduce((s, t) => s + t.unread, 0) + ol.reduce((s, t) => s + t.unread, 0) + dl.reduce((s, t) => s + t.unread, 0);
      if (total > prevUnreadRef.current) beep();
      prevUnreadRef.current = total;
      setStaffList(sl);
      setOrgList(ol);
      setDelegatedList(dl);
    };
    const id = setInterval(tick, 15000);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  // Staff handlers
  const loadStaff = (staffUserId: string) => {
    startStaffLoad(async () => {
      const r = await getImpresaThread(staffUserId);
      setStaffMsgs(r?.messages ?? []);
      const list = await getImpresaThreads();
      setStaffList(list);
    });
  };
  const openStaff = (t: ImpresaThreadSummary) => { setSelStaff(t); setStaffMsgs([]); loadStaff(t.staffUserId); };

  // Org handlers
  const loadOrg = (orgId: string) => {
    startOrgLoad(async () => {
      const r = await getImpresaOrgThread(orgId);
      setOrgMsgs(r?.messages ?? []);
      const list = await getImpresaOrgThreads();
      setOrgList(list);
    });
  };
  const openOrg = (t: OrgCompanyThreadSummary) => { setSelOrg(t); setOrgMsgs([]); loadOrg(t.organizationId); };

  // Delegated handlers
  const loadDel = (id: string, type: "CLEANING" | "MAINTENANCE") => {
    startDelLoad(async () => {
      const r = await getImpresaDelegatedThread(id, type);
      setDelMsgs(r?.messages ?? []);
      const list = await getImpresaDelegatedThreads();
      setDelegatedList(list);
    });
  };
  const openDel = (t: DelegatedInterventionThread) => { setSelDel(t); setDelMsgs([]); loadDel(t.id, t.type); };

  const staffUnread = staffList.reduce((s, t) => s + t.unread, 0);
  const orgUnread = orgList.reduce((s, t) => s + t.unread, 0);
  const delUnread = delegatedList.reduce((s, t) => s + t.unread, 0);

  const tabs: { key: Tab; label: string; unread: number }[] = [
    { key: "orgs", label: "Organizzazioni", unread: orgUnread },
    { key: "interventions", label: "Interventi", unread: delUnread },
    { key: "staff", label: "Staff", unread: staffUnread },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${tab === t.key ? "bg-violet-500 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}
          >
            {t.label}
            {t.unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white animate-pulse">{t.unread}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Organizzazioni ─── */}
      {tab === "orgs" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
            {orgList.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-400">Nessuna organizzazione collegata.</p>
            )}
            {orgList.map((t) => (
              <button
                key={t.organizationId}
                onClick={() => openOrg(t)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selOrg?.organizationId === t.organizationId ? "bg-violet-50" : "hover:bg-gray-50"}`}
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

          {!selOrg ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
              Seleziona un&apos;organizzazione per chattare.
            </div>
          ) : (
            <ImpresaChatThread
              headerName={selOrg.counterpartName}
              messages={orgMsgs}
              loading={orgLoading}
              onSend={(fd) => sendImpresaOrgMessage(selOrg.organizationId, fd)}
              onSent={() => loadOrg(selOrg.organizationId)}
            />
          )}
        </div>
      )}

      {/* ─── Interventi delegati ─── */}
      {tab === "interventions" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm max-h-[600px] overflow-y-auto">
            {delegatedList.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-400">Nessun intervento con messaggi.</p>
            )}
            {delegatedList.map((t) => (
              <button
                key={`${t.type}-${t.id}`}
                onClick={() => openDel(t)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selDel?.id === t.id && selDel?.type === t.type ? "bg-violet-50" : "hover:bg-gray-50"}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${t.type === "CLEANING" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                  {t.type === "CLEANING" ? "P" : "M"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${t.unread > 0 ? "text-rose-600" : "text-slate-800"}`}>{t.title}</p>
                  <p className="truncate text-[11px] text-gray-400">
                    {t.apartmentName} · {t.assignedUser}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${t.status === "COMPLETED" || t.status === "APPROVED" || t.status === "CLOSED" ? "bg-green-400" : t.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-gray-300"}`} />
                    <span className="text-[10px] text-gray-400">{STATUS_LABEL[t.status] ?? t.status}</span>
                    {t.date && <span className="text-[10px] text-gray-400">· {new Date(t.date).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })}</span>}
                  </div>
                </div>
                {t.unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white animate-pulse">{t.unread}</span>}
              </button>
            ))}
          </div>

          {!selDel ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
              Seleziona un intervento per chattare con l&apos;addetto.
            </div>
          ) : (
            <ImpresaChatThread
              headerName={`${selDel.title} – ${selDel.apartmentName}`}
              messages={delMsgs}
              loading={delLoading}
              onSend={(fd) => sendImpresaDelegatedMessage(selDel.id, selDel.type, fd)}
              onSent={() => loadDel(selDel.id, selDel.type)}
            />
          )}
        </div>
      )}

      {/* ─── Staff ─── */}
      {tab === "staff" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
            {staffList.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-400">Nessun operatore. Aggiungine in <strong>Staff</strong>.</p>
            )}
            {staffList.map((t) => (
              <button
                key={t.staffUserId}
                onClick={() => openStaff(t)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selStaff?.staffUserId === t.staffUserId ? "bg-violet-50" : "hover:bg-gray-50"}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm">👤</div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${t.unread > 0 ? "text-rose-600" : "text-slate-800"}`}>{t.name}</p>
                  <p className="truncate text-[11px] text-gray-400">{t.lastText ?? ROLE_LABEL[t.role] ?? t.role}</p>
                </div>
                {t.unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white animate-pulse">{t.unread}</span>}
              </button>
            ))}
          </div>

          {!selStaff ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
              Seleziona un operatore per chattare.
            </div>
          ) : (
            <ImpresaChatThread
              headerName={selStaff.name}
              messages={staffMsgs}
              loading={staffLoading}
              onSend={(fd) => sendImpresaMessage(selStaff.staffUserId, fd)}
              onSent={() => loadStaff(selStaff.staffUserId)}
            />
          )}
        </div>
      )}
    </div>
  );
}

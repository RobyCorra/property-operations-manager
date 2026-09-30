"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  impresaSetMaintenanceStatus,
  impresaApproveMaintenance,
  impresaSetCleaningStatus,
  approveCleaningByImpresa,
  impresaDeleteCleaning,
  type ImpresaThreadSummary,
  type OrgCompanyThreadSummary,
  type DelegatedInterventionThread,
  type ChatMsg,
} from "@/src/app/actions/company";
import ImpresaChatThread from "@/src/components/impresa-chat-thread";
import {
  Wrench,
  Brush,
  Info,
  X,
  CalendarDays,
  MapPin,
  User,
  ChevronLeft,
  MessageSquare,
  Building2,
  ArrowRight,
  Pencil,
  Trash2,
} from "./icons";

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
  AWAITING_REVIEW: "In revisione",
  RESOLVED: "Risolto",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  COMPLETED: "bg-emerald-50 text-emerald-600",
  AWAITING_REVIEW: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-emerald-50 text-emerald-600",
  OPEN: "bg-slate-100 text-slate-600",
  RESOLVED: "bg-emerald-50 text-emerald-600",
  CLOSED: "bg-slate-100 text-slate-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-500",
  MEDIUM: "bg-amber-50 text-amber-600",
  HIGH: "bg-orange-50 text-orange-600",
  URGENT: "bg-rose-50 text-rose-600",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Bassa",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
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

// ─────────────────────────────────────────────────────────────────────────────
// InfoPanel — detail panel for delegated intervention (impresa side)
// ─────────────────────────────────────────────────────────────────────────────
function ImpresaInfoPanel({
  thread,
  isActing,
  onAction,
  onDelete,
  onEdit,
}: {
  thread: DelegatedInterventionThread;
  isActing: boolean;
  onAction: (fn: () => Promise<void>) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1.5 ${
            thread.type === "CLEANING"
              ? "bg-violet-500/10 text-violet-600"
              : "bg-amber-500/10 text-amber-600"
          }`}>
            {thread.type === "CLEANING" ? <Brush size={10} /> : <Wrench size={10} />}
            {thread.type === "CLEANING" ? "Pulizia" : "Manutenzione"}
          </div>
          {STATUS_COLORS[thread.status] && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[thread.status]}`}>
              {STATUS_LABEL[thread.status] ?? thread.status}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug mb-1">
          {thread.title}
        </h2>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {thread.apartmentName}
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-5">
        <div>
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Informazioni Chiave
          </h4>
          <div className="space-y-3">
            {/* Quando */}
            {(thread.date || thread.scheduledStart) && (
              <div className="flex items-start gap-3">
                <CalendarDays size={15} className="text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quando</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {thread.type === "CLEANING" && thread.date
                      ? new Date(thread.date).toLocaleDateString("it-IT", {
                          weekday: "long", day: "numeric", month: "long",
                        })
                      : thread.scheduledStart
                        ? new Date(thread.scheduledStart).toLocaleDateString("it-IT", {
                            day: "numeric", month: "short", year: "numeric",
                          }) + " · " +
                          new Date(thread.scheduledStart).toLocaleTimeString("it-IT", {
                            hour: "2-digit", minute: "2-digit",
                          }) +
                          (thread.scheduledEnd
                            ? " → " + new Date(thread.scheduledEnd).toLocaleTimeString("it-IT", {
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "")
                        : thread.date
                          ? new Date(thread.date).toLocaleDateString("it-IT", {
                              weekday: "long", day: "numeric", month: "long",
                            })
                          : ""
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Indirizzo */}
            {thread.apartmentAddress && (
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-violet-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Indirizzo</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{thread.apartmentAddress}</p>
                </div>
              </div>
            )}

            {/* Assegnato */}
            <div className="flex items-start gap-3">
              <User size={15} className="text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {thread.type === "CLEANING" ? "Addetto pulizie" : "Tecnico"}
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{thread.assignedUser}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descrizione */}
        {thread.description && (
          <div>
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {thread.type === "CLEANING" ? "Note operative" : "Descrizione"}
            </h4>
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              thread.type === "CLEANING"
                ? "bg-amber-500/5 border-amber-500/10 text-amber-900"
                : "bg-red-500/5 border-red-500/10 text-slate-700"
            }`}>
              {thread.description}
            </div>
          </div>
        )}

        {/* Stato Operativo */}
        <div>
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Stato Operativo
          </h4>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Stato attuale</span>
              {STATUS_COLORS[thread.status] && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-white border border-slate-200 shadow-sm ${STATUS_COLORS[thread.status]}`}>
                  {STATUS_LABEL[thread.status] ?? thread.status}
                </span>
              )}
            </div>

            {/* Manual tasks — cleaning */}
            {thread.type === "CLEANING" && thread.manualTasks && thread.manualTasks.length > 0 && (() => {
              const mt = thread.manualTasks!;
              const mtDone = mt.filter(t => t.completed).length;
              return (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Task Manuali</p>
                  <div className="space-y-1.5">
                    {mt.map((task, idx) => (
                      <div key={task.id} className="flex items-center gap-2 text-xs">
                        <span className={task.completed ? "text-emerald-500" : "text-slate-300"}>{task.completed ? "☑" : "○"}</span>
                        <span className={`font-medium ${task.completed ? "text-slate-500 line-through" : "text-slate-700"}`}>{idx + 1}. {task.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">{mtDone}/{mt.length} completate</p>
                </div>
              );
            })()}

            {/* Checklist bar — cleaning (hidden when hideChecklist) */}
            {thread.type === "CLEANING" && !thread.hideChecklist && thread.checklistProgress && thread.checklistProgress.length > 0 && (() => {
              const items = thread.checklistProgress!;
              const total = items.length;
              const completed = items.filter((i) => i.completed).length;
              const isFullyCompleted = completed === total && total > 0;
              return (
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Checklist Qualità
                      </p>
                      <p className={`text-lg font-bold tracking-tight ${isFullyCompleted ? "text-emerald-600" : "text-slate-900"}`}>
                        {completed}{" "}
                        <span className="text-xs font-medium text-slate-400">/ {total} Punti</span>
                      </p>
                    </div>
                    {isFullyCompleted && (
                      <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                        Completa
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 h-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-full transition-all duration-500 ${
                          item.completed
                            ? isFullyCompleted
                              ? "bg-emerald-500 shadow-sm shadow-emerald-200/50"
                              : "bg-violet-500 shadow-sm shadow-violet-200/50"
                            : "bg-black/5"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Priorità — maintenance */}
            {thread.type === "MAINTENANCE" && thread.priority && PRIORITY_COLORS[thread.priority] && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Priorità</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_COLORS[thread.priority]}`}>
                  {PRIORITY_LABEL[thread.priority] ?? thread.priority}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer — Action buttons */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2">
        {/* Maintenance actions */}
        {thread.type === "MAINTENANCE" && (
          <>
            {(thread.status === "PENDING" || thread.status === "OPEN") && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(async () => { await impresaSetMaintenanceStatus(thread.id, "IN_PROGRESS"); })}
                className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                Prendi in carico
              </button>
            )}
            {thread.status === "IN_PROGRESS" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(async () => { await impresaSetMaintenanceStatus(thread.id, "AWAITING_REVIEW"); })}
                className="w-full py-3 bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-200"
              >
                Invia per revisione
              </button>
            )}
            {thread.status === "AWAITING_REVIEW" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(async () => { await impresaApproveMaintenance(thread.id); })}
                className="w-full py-3 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-200"
              >
                Approva e risolvi
              </button>
            )}
            {(thread.status === "RESOLVED" || thread.status === "APPROVED") && (
              <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-widest rounded-2xl text-center">
                {thread.status === "RESOLVED" ? "Risolto" : "Approvato"}
              </div>
            )}
          </>
        )}

        {/* Cleaning actions */}
        {thread.type === "CLEANING" && (
          <>
            {thread.status === "PENDING" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(async () => { await impresaSetCleaningStatus(thread.id, "IN_PROGRESS"); })}
                className="w-full py-3 flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                ▶ Avvia pulizia
              </button>
            )}
            {thread.status === "IN_PROGRESS" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(async () => { await impresaSetCleaningStatus(thread.id, "AWAITING_REVIEW"); })}
                className="w-full py-3 bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-200"
              >
                Invia per revisione
              </button>
            )}
            {thread.status === "AWAITING_REVIEW" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(async () => { await approveCleaningByImpresa(thread.id); })}
                className="w-full py-3 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-200"
              >
                Approva pulizia
              </button>
            )}
            {(thread.status === "APPROVED" || thread.status === "COMPLETED") && (
              <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-widest rounded-2xl text-center">
                {thread.status === "APPROVED" ? "Approvata" : "Completata"}
              </div>
            )}
            {/* Modifica + Elimina — only for impresa-created cleanings (no bookingId) */}
            {!thread.bookingId && thread.status === "PENDING" && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex-1 py-3 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <Pencil size={12} /> Modifica pulizia
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={onDelete}
                    className="py-3 px-5 flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 size={12} /> Elimina
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
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

  // Info panel state
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [isActing, setIsActing] = useState(false);

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
      if (selDel) {
        const updated = dl.find((d) => d.id === selDel.id && d.type === selDel.type);
        if (updated) setSelDel(updated);
      }
    };
    const id = setInterval(tick, 15000);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, [selDel]);

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
      const updated = list.find((d) => d.id === id && d.type === type);
      if (updated) setSelDel(updated);
    });
  };
  const openDel = (t: DelegatedInterventionThread) => { setSelDel(t); setDelMsgs([]); loadDel(t.id, t.type); };

  const handleAction = (fn: () => Promise<void>) => {
    setIsActing(true);
    fn().then(() => {
      if (selDel) loadDel(selDel.id, selDel.type);
    }).finally(() => setIsActing(false));
  };

  const handleDeleteCleaning = () => {
    if (!selDel || selDel.type !== "CLEANING") return;
    if (!confirm("Eliminare questa pulizia?")) return;
    handleAction(async () => {
      await impresaDeleteCleaning(selDel.id);
      setSelDel(null);
      const dl = await getImpresaDelegatedThreads();
      setDelegatedList(dl);
    });
  };

  const staffUnread = staffList.reduce((s, t) => s + t.unread, 0);
  const orgUnread = orgList.reduce((s, t) => s + t.unread, 0);
  const delUnread = delegatedList.reduce((s, t) => s + t.unread, 0);

  const delegatedSorted = useMemo(() => {
    const isApproved = (s: string) => s === "APPROVED" || s === "COMPLETED" || s === "CLOSED";
    const ts = (d: string | null) => (d ? new Date(d).getTime() : Number.POSITIVE_INFINITY);
    return [...delegatedList].sort((a, b) => {
      const ga = isApproved(a.status) ? 1 : 0;
      const gb = isApproved(b.status) ? 1 : 0;
      if (ga !== gb) return ga - gb;
      return ts(a.date) - ts(b.date);
    });
  }, [delegatedList]);

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

      {/* ─── Interventi delegati — 3 colonne ─── */}
      {tab === "interventions" && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row" style={{ minHeight: 520 }}>
          {/* COL 1: Thread list */}
          <div className={`${selDel ? "hidden md:flex" : "flex"} md:w-[260px] flex-col border-r border-slate-100 shrink-0`}>
            <div className="p-2 overflow-y-auto flex-1">
              {delegatedList.length === 0 && (
                <p className="p-4 text-center text-sm text-gray-400">Nessun intervento delegato.</p>
              )}
              {delegatedSorted.map((t) => {
                const approved = t.status === "APPROVED" || t.status === "COMPLETED" || t.status === "CLOSED";
                return (
                  <button
                    key={`${t.type}-${t.id}`}
                    onClick={() => openDel(t)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selDel?.id === t.id && selDel?.type === t.type ? "bg-violet-50" : "hover:bg-gray-50"}`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${t.type === "CLEANING" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                      {t.type === "CLEANING" ? <Brush size={14} /> : <Wrench size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${t.unread > 0 ? "text-rose-600" : "text-slate-800"}`}>{t.title}</p>
                      <p className="truncate text-[11px] text-gray-400">
                        {t.apartmentName} · {t.assignedUser}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {t.date && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {new Date(t.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                          </span>
                        )}
                        {t.status === "AWAITING_REVIEW" && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Da approvare</span>
                        )}
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${approved ? "bg-green-400" : t.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-gray-300"}`} />
                        <span className="text-[10px] text-gray-400">{STATUS_LABEL[t.status] ?? t.status}</span>
                      </div>
                    </div>
                    {t.unread > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white animate-pulse shrink-0">{t.unread}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COL 2: Chat */}
          <div className={`${selDel ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}>
            {selDel ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 shrink-0">
                  {/* Back — mobile only */}
                  <button
                    type="button"
                    onClick={() => setSelDel(null)}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                  >
                    <ChevronLeft size={18} className="text-slate-500" />
                  </button>

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    selDel.type === "MAINTENANCE" ? "bg-amber-100" : "bg-violet-100"
                  }`}>
                    {selDel.type === "MAINTENANCE"
                      ? <Wrench size={15} className="text-amber-600" />
                      : <Brush size={15} className="text-violet-600" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 truncate">{selDel.title}</p>
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      {selDel.apartmentName}
                      {STATUS_COLORS[selDel.status] && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${STATUS_COLORS[selDel.status]}`}>
                            {STATUS_LABEL[selDel.status] ?? selDel.status}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Info toggle — mobile: bottom sheet / desktop: panel */}
                  <button
                    type="button"
                    onClick={() => setShowInfoSheet(true)}
                    className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
                  >
                    <Info size={16} className="text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInfoPanel((v) => !v)}
                    className={`hidden md:flex items-center justify-center w-9 h-9 rounded-xl transition-colors shrink-0 ${showInfoPanel ? "bg-violet-100 hover:bg-violet-200" : "hover:bg-slate-100"}`}
                    title="Dettagli intervento"
                  >
                    <Info size={16} className={showInfoPanel ? "text-violet-600" : "text-slate-400"} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-hidden flex flex-col p-3 min-h-0">
                  <ImpresaChatThread
                    messages={delMsgs}
                    loading={delLoading}
                    onSend={(fd) => sendImpresaDelegatedMessage(selDel.id, selDel.type, fd)}
                    onSent={() => loadDel(selDel.id, selDel.type)}
                  />
                </div>

                {/* Bottom sheet peek — MOBILE ONLY */}
                <div className="md:hidden shrink-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.10)] border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInfoSheet(true)}
                    className="w-full pt-2.5 pb-1 flex justify-center"
                  >
                    <div className="w-10 h-1 bg-slate-300 rounded-full" />
                  </button>
                  <div className="px-4 pt-1 pb-2 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selDel.type === "MAINTENANCE" ? "bg-amber-100" : "bg-violet-100"
                    }`}>
                      {selDel.type === "MAINTENANCE"
                        ? <Wrench size={16} className="text-amber-600" />
                        : <Brush size={16} className="text-violet-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{selDel.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {selDel.apartmentName} · {selDel.assignedUser}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 pb-2 flex gap-2">
                    {STATUS_COLORS[selDel.status] && (
                      <div className="flex flex-col items-center bg-slate-50 rounded-xl px-3 py-1.5 flex-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Stato</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLORS[selDel.status]}`}>
                          {STATUS_LABEL[selDel.status] ?? selDel.status}
                        </span>
                      </div>
                    )}
                    {selDel.priority && PRIORITY_COLORS[selDel.priority] && (
                      <div className="flex flex-col items-center bg-slate-50 rounded-xl px-3 py-1.5 flex-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Priorità</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${PRIORITY_COLORS[selDel.priority]}`}>
                          {PRIORITY_LABEL[selDel.priority] ?? selDel.priority}
                        </span>
                      </div>
                    )}
                    {selDel.manualTasks && selDel.manualTasks.length > 0 && (() => {
                      const total = selDel.manualTasks!.length;
                      const done = selDel.manualTasks!.filter(i => i.completed).length;
                      return (
                        <div className="flex flex-col items-center bg-slate-50 rounded-xl px-3 py-1.5 flex-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Task</span>
                          <span className="text-[11px] font-black text-slate-700">{done}/{total}</span>
                        </div>
                      );
                    })()}
                    {!selDel.hideChecklist && selDel.checklistProgress && selDel.checklistProgress.length > 0 && (() => {
                      const total = selDel.checklistProgress!.length;
                      const done = selDel.checklistProgress!.filter(i => i.completed).length;
                      return (
                        <div className="flex flex-col items-center bg-slate-50 rounded-xl px-3 py-1.5 flex-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Checklist</span>
                          <span className="text-[11px] font-black text-slate-700">{done}/{total}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => setShowInfoSheet(true)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-violet-600 transition-colors"
                    >
                      Apri scheda completa
                      <ChevronLeft size={13} className="rotate-90" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-xs">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center mx-auto">
                    <MessageSquare size={36} className="text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Seleziona un intervento</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Scegli dalla lista per vedere la chat e i dettagli.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COL 3: Info panel — desktop only, toggleable */}
          <div className={`${showInfoPanel && selDel ? "hidden md:flex" : "hidden"} w-[240px] flex-col border-l border-slate-100 bg-white shrink-0 overflow-y-auto`}>
            {selDel ? (
              <ImpresaInfoPanel thread={selDel} isActing={isActing} onAction={handleAction} onDelete={handleDeleteCleaning} />
            ) : (
              <div className="flex-1 flex items-center justify-center px-5">
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Building2 size={20} className="text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Dettagli intervento
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile bottom sheet — full detail panel */}
          {showInfoSheet && selDel && (
            <>
              <div
                className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                onClick={() => setShowInfoSheet(false)}
              />
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl flex flex-col max-h-[88vh] safe-bottom">
                <div className="relative flex items-center justify-center px-5 pt-3 pb-2 shrink-0">
                  <div className="w-9 h-1 bg-slate-200 rounded-full" />
                  <button
                    type="button"
                    onClick={() => setShowInfoSheet(false)}
                    className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1 pb-24">
                  <ImpresaInfoPanel thread={selDel} isActing={isActing} onAction={handleAction} onDelete={handleDeleteCleaning} />
                </div>
                <div className="shrink-0 px-5 pb-6 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInfoSheet(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft size={13} className="-rotate-90" />
                    Chiudi scheda
                  </button>
                </div>
              </div>
            </>
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TicketConversation from "./ticket-conversation";
import {
  Wrench,
  Brush,
  Search,
  MessageSquare,
  ArrowRight,
  User,
  Building2,
  CalendarDays,
  Clock,
  ChevronLeft,
  Info,
  X,
} from "./icons";

interface Message {
  id: string;
  senderName: string;
  text: string | null;
  createdAt: Date;
  role: string;
  readByManagerAt: Date | null;
}

interface Thread {
  id: string;
  type: "MAINTENANCE" | "CLEANING";
  apartmentName: string;
  apartmentAddress: string;
  assignedUser: string;
  title: string;
  description: string;
  status: string;
  priority: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  date?: string;
  checklistProgress?: { completed: boolean }[] | null;
  lastMessage: Message;
  messages: Message[];
  updatedAt: Date;
  hasUnread: boolean;
}

interface Props {
  threads: Thread[];
  apartments: { id: string; name: string }[];
  selectedId?: string;
  selectedType?: string;
  serverDate: string;
  userName: string;
  submitAction: any;
}

function relativeTime(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Ieri";
  if (diffDays < 7) return d.toLocaleDateString("it-IT", { weekday: "short" });
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "In attesa",   color: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "In corso",    color: "bg-blue-50 text-blue-600" },
  COMPLETED:   { label: "Completato",  color: "bg-emerald-50 text-emerald-600" },
  OPEN:        { label: "Aperto",      color: "bg-amber-50 text-amber-600" },
  RESOLVED:    { label: "Risolto",     color: "bg-emerald-50 text-emerald-600" },
  CANCELLED:   { label: "Annullato",   color: "bg-slate-100 text-slate-500" },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW:      { label: "Bassa",   color: "bg-slate-100 text-slate-500" },
  MEDIUM:   { label: "Media",   color: "bg-amber-50 text-amber-600" },
  HIGH:     { label: "Alta",    color: "bg-orange-50 text-orange-600" },
  URGENT:   { label: "Urgente", color: "bg-rose-50 text-rose-600" },
};

type FilterType = "ALL" | "MAINTENANCE" | "CLEANING" | "UNREAD";

export default function MessagesDashboard({
  threads: initialThreads,
  apartments,
  selectedId,
  selectedType,
  userName,
  submitAction,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  const filteredThreads = useMemo(() => {
    return initialThreads.filter((t) => {
      const matchesSearch =
        !search ||
        t.apartmentName.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedUser.toLowerCase().includes(search.toLowerCase()) ||
        (t.lastMessage?.text || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "ALL" ||
        (filter === "UNREAD" && t.hasUnread) ||
        (filter === "MAINTENANCE" && t.type === "MAINTENANCE") ||
        (filter === "CLEANING" && t.type === "CLEANING");
      return matchesSearch && matchesFilter;
    });
  }, [initialThreads, search, filter]);

  const selectedThread = initialThreads.find(
    (t) => t.id === selectedId && t.type === selectedType
  );

  const unreadCount = initialThreads.filter((t) => t.hasUnread).length;

  /** Info panel content — shared between desktop col-3 and mobile bottom sheet */
  function InfoPanelContent({ thread }: { thread: Thread }) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Panel header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
            {thread.type === "MAINTENANCE" ? "Scheda Manutenzione" : "Scheda Pulizia"}
          </p>
          <h3 className="text-sm font-black text-slate-900 leading-snug mb-3">
            {thread.type === "MAINTENANCE" ? thread.title : "Pulizia Appartamento"}
          </h3>
          {/* Status + Priority */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_LABELS[thread.status] && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${STATUS_LABELS[thread.status].color}`}>
                {STATUS_LABELS[thread.status].label}
              </span>
            )}
            {thread.priority && PRIORITY_LABELS[thread.priority] && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${PRIORITY_LABELS[thread.priority].color}`}>
                {PRIORITY_LABELS[thread.priority].label}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-5 py-4 space-y-4 flex-1">
          {/* Apartment */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 size={13} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Appartamento</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{thread.apartmentName}</p>
              {thread.apartmentAddress && (
                <p className="text-[10px] text-slate-400 mt-0.5">{thread.apartmentAddress}</p>
              )}
            </div>
          </div>

          {/* Assigned */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <User size={13} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assegnato a</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{thread.assignedUser}</p>
            </div>
          </div>

          {/* Date / Scheduled */}
          {thread.type === "CLEANING" && thread.date && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <CalendarDays size={13} className="text-violet-500" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Data pulizia</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {new Date(thread.date).toLocaleDateString("it-IT", {
                    weekday: "short", day: "numeric", month: "long",
                  })}
                </p>
              </div>
            </div>
          )}

          {thread.type === "MAINTENANCE" && thread.scheduledStart && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Clock size={13} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Intervento programmato</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {new Date(thread.scheduledStart).toLocaleDateString("it-IT", {
                    day: "numeric", month: "short",
                  })}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(thread.scheduledStart).toLocaleTimeString("it-IT", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                  {thread.scheduledEnd && (
                    <> → {new Date(thread.scheduledEnd).toLocaleTimeString("it-IT", {
                      hour: "2-digit", minute: "2-digit",
                    })}</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {thread.description && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Note</p>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                {thread.description}
              </p>
            </div>
          )}

          {/* Checklist progress (cleaning) */}
          {thread.type === "CLEANING" && thread.checklistProgress && thread.checklistProgress.length > 0 && (() => {
            const total = thread.checklistProgress!.length;
            const done = thread.checklistProgress!.filter((i) => i.completed).length;
            const pct = Math.round((done / total) * 100);
            return (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Checklist</p>
                  <span className="text-[10px] font-black text-slate-600">{done}/{total}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{pct}% completato</p>
              </div>
            );
          })()}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-auto">
          <Link
            href={
              thread.type === "MAINTENANCE"
                ? `/dashboard/manager/maintenance/${thread.id}/edit`
                : `/dashboard/manager/cleanings/${thread.id}/edit`
            }
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 transition-colors shadow-sm"
          >
            Apri scheda
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-screen md:h-[calc(100vh-80px)] bg-white overflow-hidden">

      {/* ── COL 1: Thread list ─────────────────────────────── */}
      {/* Mobile: hidden when a thread is selected; Desktop: always visible */}
      <div className={`${selectedThread ? "hidden md:flex" : "flex"} w-full md:w-[300px] flex-col border-r border-slate-100 md:shrink-0`}>

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-black text-slate-900 tracking-tight">Messaggi</span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unreadCount} non {unreadCount === 1 ? "letto" : "letti"}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 rounded-lg pl-8 pr-3 py-2 text-xs font-medium outline-none text-slate-700 placeholder:text-slate-400 border border-slate-100 focus:border-violet-300 focus:bg-white transition-colors"
            />
          </div>

          {/* Filter pills — scrollabili orizzontalmente su mobile */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {(["ALL", "MAINTENANCE", "CLEANING", "UNREAD"] as FilterType[]).map((f) => {
              const labels: Record<FilterType, string> = {
                ALL: "Tutti", MAINTENANCE: "Manutenzioni", CLEANING: "Pulizie", UNREAD: "Non letti",
              };
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    isActive
                      ? f === "UNREAD"
                        ? "bg-rose-500 text-white"
                        : "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map((thread) => {
            const isActive = selectedId === thread.id && selectedType === thread.type;
            const isMaintenance = thread.type === "MAINTENANCE";
            return (
              <Link
                key={`${thread.type}-${thread.id}`}
                href={`/dashboard/manager/messages?id=${thread.id}&type=${thread.type}`}
                className={`flex gap-3 px-4 py-3.5 border-b border-slate-50 transition-colors relative group ${
                  isActive
                    ? "bg-violet-50 border-l-[3px] border-l-violet-500"
                    : thread.hasUnread
                    ? "bg-rose-50/40 border-l-[3px] border-l-rose-400 hover:bg-rose-50"
                    : "border-l-[3px] border-l-transparent hover:bg-slate-50"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive
                      ? isMaintenance ? "bg-amber-500 shadow-lg shadow-amber-200" : "bg-violet-600 shadow-lg shadow-violet-200"
                      : isMaintenance ? "bg-amber-100" : "bg-violet-100"
                  }`}
                >
                  {isMaintenance
                    ? <Wrench size={16} className={isActive ? "text-white" : "text-amber-600"} />
                    : <Brush size={16} className={isActive ? "text-white" : "text-violet-600"} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <span className={`text-sm truncate ${thread.hasUnread ? "font-black text-slate-900" : "font-semibold text-slate-700"}`}>
                      {thread.apartmentName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {relativeTime(thread.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                      isMaintenance ? "text-amber-600 bg-amber-50" : "text-violet-600 bg-violet-50"
                    }`}>
                      {isMaintenance ? "Manutenzione" : "Pulizia"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">· {thread.assignedUser}</span>
                  </div>
                  <p className={`text-xs truncate ${thread.hasUnread ? "font-semibold text-slate-700" : "text-slate-400 font-medium"}`}>
                    {thread.lastMessage?.text || "Allegato..."}
                  </p>
                </div>

                {/* Unread badge */}
                {thread.hasUnread && (
                  <div className="flex flex-col items-end justify-center shrink-0">
                    <span className="w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                      {thread.messages.filter((m) => m.role !== "MANAGER" && m.readByManagerAt === null).length}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}

          {filteredThreads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <MessageSquare size={32} className="text-slate-200 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Nessuna conversazione
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── COL 2: Chat ────────────────────────────────────── */}
      {/* Mobile: hidden when no thread selected; Desktop: always visible */}
      <div className={`${!selectedThread ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0 bg-[#faf8ff]`}>
        {selectedThread ? (
          <>
            {/* Chat header */}
            <div className="h-[60px] bg-white border-b border-slate-100 flex items-center px-3 md:px-5 gap-2 md:gap-3 shrink-0">

              {/* Back button — mobile only */}
              <Link
                href="/dashboard/manager/messages"
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </Link>

              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
                  selectedThread.type === "MAINTENANCE"
                    ? "bg-amber-500 shadow-amber-200"
                    : "bg-violet-600 shadow-violet-200"
                }`}
              >
                {selectedThread.type === "MAINTENANCE"
                  ? <Wrench size={15} className="text-white" />
                  : <Brush size={15} className="text-white" />
                }
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 truncate">
                    {selectedThread.apartmentName}
                  </span>
                  <span className={`hidden sm:inline text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    selectedThread.type === "MAINTENANCE"
                      ? "text-amber-600 bg-amber-50 border-amber-100"
                      : "text-violet-600 bg-violet-50 border-violet-100"
                  }`}>
                    {selectedThread.type === "MAINTENANCE" ? "Manutenzione" : "Pulizia"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {selectedThread.assignedUser}
                </p>
              </div>

              {/* Info button — mobile only (apre il bottom sheet espanso) */}
              <button
                type="button"
                onClick={() => setShowInfoSheet(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
              >
                <Info size={16} className="text-slate-600" />
              </button>
            </div>

            {/* Messages — su mobile aggiungi spazio per il peek del bottom sheet */}
            <div className="flex-1 overflow-hidden flex flex-col p-4 pb-[72px] md:pb-4">
              <TicketConversation
                entityId={selectedThread.id}
                initialMessages={selectedThread.messages}
                currentUserRole="MANAGER"
                currentUserName={userName}
                submitAction={submitAction}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-xs">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center mx-auto">
                <MessageSquare size={36} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Seleziona una chat</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Scegli una conversazione dalla lista
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── COL 3: Info panel — desktop only ───────────────── */}
      <div className="hidden md:flex w-[280px] flex-col border-l border-slate-100 bg-white shrink-0">
        {selectedThread ? (
          <InfoPanelContent thread={selectedThread} />
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

      {/* ── Bottom sheet (peek) — mobile only, sempre visibile quando chat aperta ── */}
      {selectedThread && (
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-6px_24px_rgba(0,0,0,0.10)] z-30">
          {/* Handle + expand toggle */}
          <button
            type="button"
            onClick={() => setShowInfoSheet((v) => !v)}
            className="w-full flex flex-col items-center pt-2.5 pb-2 gap-0.5"
          >
            <div className="w-9 h-1 bg-slate-200 rounded-full" />
          </button>

          {/* Peek content — sempre visibile */}
          <div className="px-4 pb-3 flex items-center gap-3">
            {/* Type badge + name */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              selectedThread.type === "MAINTENANCE" ? "bg-amber-100" : "bg-violet-100"
            }`}>
              {selectedThread.type === "MAINTENANCE"
                ? <Wrench size={15} className="text-amber-600" />
                : <Brush size={15} className="text-violet-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">{selectedThread.title || "Pulizia Appartamento"}</p>
              <p className="text-[10px] text-slate-400 truncate">{selectedThread.apartmentName} · {selectedThread.assignedUser}</p>
            </div>
            {/* Stat chips */}
            <div className="flex gap-1.5 shrink-0">
              {STATUS_LABELS[selectedThread.status] && (
                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${STATUS_LABELS[selectedThread.status].color}`}>
                  {STATUS_LABELS[selectedThread.status].label}
                </span>
              )}
              {selectedThread.priority && PRIORITY_LABELS[selectedThread.priority] && (
                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${PRIORITY_LABELS[selectedThread.priority].color}`}>
                  {PRIORITY_LABELS[selectedThread.priority].label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom sheet espanso — mobile only ──────────────── */}
      {showInfoSheet && selectedThread && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setShowInfoSheet(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
              <div className="w-9 h-1 bg-slate-200 rounded-full mx-auto" />
              <button
                type="button"
                onClick={() => setShowInfoSheet(false)}
                className="absolute right-4 top-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={14} className="text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <InfoPanelContent thread={selectedThread} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

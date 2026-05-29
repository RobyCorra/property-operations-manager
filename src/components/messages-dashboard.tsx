"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  Info,
  X,
  MapPin,
} from "./icons";
import {
  updateCleaningStatus,
  approveCleaningDirectly,
  updateMaintenanceStatus,
  approveMaintenanceDirectly,
} from "@/src/app/actions/operational";

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
  PENDING:         { label: "In attesa",       color: "bg-slate-100 text-slate-600" },
  IN_PROGRESS:     { label: "In corso",        color: "bg-blue-50 text-blue-600" },
  COMPLETED:       { label: "Completato",      color: "bg-emerald-50 text-emerald-600" },
  AWAITING_REVIEW: { label: "In revisione",    color: "bg-yellow-50 text-yellow-700" },
  APPROVED:        { label: "Approvata",       color: "bg-emerald-50 text-emerald-600" },
  OPEN:            { label: "In attesa",        color: "bg-slate-100 text-slate-600" },
  RESOLVED:        { label: "Risolto",         color: "bg-emerald-50 text-emerald-600" },
  CANCELLED:       { label: "Annullato",       color: "bg-slate-100 text-slate-500" },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW:      { label: "Bassa",   color: "bg-slate-100 text-slate-500" },
  MEDIUM:   { label: "Media",   color: "bg-amber-50 text-amber-600" },
  HIGH:     { label: "Alta",    color: "bg-orange-50 text-orange-600" },
  URGENT:   { label: "Urgente", color: "bg-rose-50 text-rose-600" },
};

type FilterType = "ALL" | "MAINTENANCE" | "CLEANING" | "UNREAD";

// ─────────────────────────────────────────────────────────────────────────────
// InfoPanelContent — calendar-style detail panel (top-level component)
// ─────────────────────────────────────────────────────────────────────────────
interface InfoPanelProps {
  thread: Thread;
  isActing: boolean;
  onAction: (fn: () => Promise<void>) => void;
}

function InfoPanelContent({ thread, isActing, onAction }: InfoPanelProps) {
  return (
    <div className="flex flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        {/* Type badge + Status badge */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1.5 ${
            thread.type === "CLEANING"
              ? "bg-violet-500/10 text-violet-600"
              : "bg-amber-500/10 text-amber-600"
          }`}>
            {thread.type === "CLEANING"
              ? <Brush size={10} />
              : <Wrench size={10} />
            }
            {thread.type === "CLEANING" ? "Pulizia" : "Manutenzione"}
          </div>
          {STATUS_LABELS[thread.status] && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_LABELS[thread.status].color}`}>
              {STATUS_LABELS[thread.status].label}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug mb-1">
          {thread.type === "MAINTENANCE" ? thread.title : "Pulizia Appartamento"}
        </h2>

        {/* Apartment subtitle */}
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {thread.apartmentName}
        </p>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="px-5 py-5 space-y-5">

        {/* Informazioni Chiave */}
        <div>
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Informazioni Chiave
          </h4>
          <div className="space-y-3">
            {/* Quando */}
            {(thread.type === "CLEANING" ? thread.date : thread.scheduledStart) && (
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

            {/* Cleaner / Tecnico */}
            <div className="flex items-start gap-3">
              <User size={15} className="text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {thread.type === "CLEANING" ? "Cleaner" : "Tecnico"}
                </p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{thread.assignedUser}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note Operative (cleaning) / Descrizione (maintenance) */}
        {thread.description && (
          <div>
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {thread.type === "CLEANING" ? "Note Operative" : "Descrizione"}
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
            {/* Stato Attuale */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Stato Attuale</span>
              {STATUS_LABELS[thread.status] && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-white border border-slate-200 shadow-sm ${STATUS_LABELS[thread.status].color}`}>
                  {STATUS_LABELS[thread.status].label}
                </span>
              )}
            </div>

            {/* Segmented checklist bar — cleaning */}
            {thread.type === "CLEANING" && thread.checklistProgress && thread.checklistProgress.length > 0 && (() => {
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
                        ✓ Completa
                      </span>
                    )}
                  </div>
                  {/* Segmented bar — individual divs like the calendar popup */}
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
            {thread.type === "MAINTENANCE" && thread.priority && PRIORITY_LABELS[thread.priority] && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Priorità</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_LABELS[thread.priority].color}`}>
                  {PRIORITY_LABELS[thread.priority].label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer — Action buttons + link scheda ──────────── */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2">

        {/* Cleaning actions */}
        {thread.type === "CLEANING" && (
          <>
            {thread.status === "PENDING" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(() => updateCleaningStatus(thread.id, "IN_PROGRESS"))}
                className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                ▶ Avvia Pulizia
              </button>
            )}
            {thread.status === "IN_PROGRESS" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(() => updateCleaningStatus(thread.id, "AWAITING_REVIEW"))}
                className="w-full py-3 bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-200"
              >
                ✓ Completata — Invia per verifica
              </button>
            )}
            {thread.status === "AWAITING_REVIEW" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(() => approveCleaningDirectly(thread.id))}
                className="w-full py-3 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-200"
              >
                ✓ Approva
              </button>
            )}
            {thread.status === "APPROVED" && (
              <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-widest rounded-2xl text-center">
                ✓ Approvata
              </div>
            )}
          </>
        )}

        {/* Maintenance actions */}
        {thread.type === "MAINTENANCE" && (
          <>
            {thread.status === "PENDING" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(() => updateMaintenanceStatus(thread.id, "IN_PROGRESS"))}
                className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                Prendi in Carico
              </button>
            )}
            {thread.status === "IN_PROGRESS" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(() => updateMaintenanceStatus(thread.id, "AWAITING_REVIEW"))}
                className="w-full py-3 bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-200"
              >
                ✓ Completato — Invia per verifica
              </button>
            )}
            {thread.status === "AWAITING_REVIEW" && (
              <button
                type="button"
                disabled={isActing}
                onClick={() => onAction(() => approveMaintenanceDirectly(thread.id))}
                className="w-full py-3 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-200"
              >
                ✓ Approva / Risolvi
              </button>
            )}
            {thread.status === "RESOLVED" && (
              <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-widest rounded-2xl text-center">
                ✓ Risolto
              </div>
            )}
          </>
        )}

        {/* Vai alla scheda completa */}
        <Link
          href={
            thread.type === "MAINTENANCE"
              ? `/dashboard/manager/maintenance/${thread.id}/edit`
              : `/dashboard/manager/cleanings/${thread.id}/edit`
          }
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
        >
          Vai alla scheda completa <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MessagesDashboard({
  threads: initialThreads,
  apartments: _apartments,
  selectedId,
  selectedType,
  userName,
  submitAction,
}: Props) {
  const router = useRouter();
  const [isActing, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [showInfoSheet, setShowInfoSheet] = useState(false);

  const handleAction = useCallback((fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }, [router]);

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

  return (
    <div className="relative flex w-full max-w-full min-w-0 h-screen md:h-[calc(100vh-80px)] bg-white overflow-hidden">

      {/* ── COL 1: Thread list ─────────────────────────────── */}
      {/* Mobile: hidden when a thread is selected; Desktop: always visible */}
      <div className={`${selectedThread ? "hidden md:flex" : "flex"} w-full md:w-[300px] min-w-0 overflow-x-hidden flex-col border-r border-slate-100 md:shrink-0`}>

        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Torna alla dashboard — solo mobile */}
              <Link
                href="/dashboard/manager"
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
                aria-label="Torna alla dashboard"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </Link>
              <span className="text-base font-black text-slate-900 tracking-tight">Messaggi</span>
            </div>
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
                <span className="text-sm font-black text-slate-900 truncate block">
                  {selectedThread.apartmentName}
                </span>
                {/* Subtitle — su mobile mostra tipo + assegnato + stato (come nel mockup) */}
                <p className="text-[10px] font-medium truncate flex items-center gap-1">
                  <span className={selectedThread.type === "MAINTENANCE" ? "text-amber-500" : "text-violet-500"}>
                    {selectedThread.type === "MAINTENANCE" ? "🔧" : "🧹"}
                  </span>
                  <span className="text-slate-500">{selectedThread.assignedUser}</span>
                  {STATUS_LABELS[selectedThread.status] && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className={`${STATUS_LABELS[selectedThread.status].color} px-1.5 py-0.5 rounded-full text-[9px] font-black`}>
                        {STATUS_LABELS[selectedThread.status].label}
                      </span>
                    </>
                  )}
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

            {/* Messages — flex-1, TicketConversation riempie tutto */}
            <div className="flex-1 overflow-hidden flex flex-col p-3 min-h-0">
              <TicketConversation
                entityId={selectedThread.id}
                initialMessages={selectedThread.messages}
                currentUserRole="MANAGER"
                currentUserName={userName}
                submitAction={submitAction}
                heightClass="flex-1 min-h-0"
              />
            </div>

            {/* ── Bottom sheet peek — MOBILE ONLY, nel flex column (no absolute) ── */}
            <div className="md:hidden shrink-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.10)] border-t border-slate-100">

              {/* Handle — tap per aprire pannello completo */}
              <button
                type="button"
                onClick={() => setShowInfoSheet(true)}
                className="w-full pt-2.5 pb-1 flex justify-center"
                aria-label="Apri dettagli intervento"
              >
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </button>

              {/* Header riga: avatar + titolo + assegnato */}
              <div className="px-4 pt-1 pb-2 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedThread.type === "MAINTENANCE" ? "bg-amber-100" : "bg-violet-100"
                }`}>
                  {selectedThread.type === "MAINTENANCE"
                    ? <Wrench size={16} className="text-amber-600" />
                    : <Brush size={16} className="text-violet-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {selectedThread.type === "MAINTENANCE"
                      ? selectedThread.title
                      : "Pulizia Appartamento"
                    }
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {selectedThread.apartmentName} · {selectedThread.assignedUser}
                  </p>
                </div>
              </div>

              {/* Stat chips: Stato + Priorità + Checklist */}
              <div className="px-4 pb-2 flex gap-2">
                {STATUS_LABELS[selectedThread.status] && (
                  <div className="flex flex-col items-center bg-slate-50 rounded-xl px-3 py-1.5 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Stato</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_LABELS[selectedThread.status].color}`}>
                      {STATUS_LABELS[selectedThread.status].label}
                    </span>
                  </div>
                )}
                {selectedThread.priority && PRIORITY_LABELS[selectedThread.priority] && (
                  <div className="flex flex-col items-center bg-slate-50 rounded-xl px-3 py-1.5 flex-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Priorità</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${PRIORITY_LABELS[selectedThread.priority].color}`}>
                      {PRIORITY_LABELS[selectedThread.priority].label}
                    </span>
                  </div>
                )}
                {selectedThread.checklistProgress && selectedThread.checklistProgress.length > 0 && (() => {
                  const total = selectedThread.checklistProgress!.length;
                  const done = selectedThread.checklistProgress!.filter(i => i.completed).length;
                  return (
                    <div className="flex flex-col items-center bg-slate-50 rounded-xl px-3 py-1.5 flex-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Checklist</span>
                      <span className="text-[11px] font-black text-slate-700">{done}/{total}</span>
                    </div>
                  );
                })()}
              </div>

              {/* CTA — apre il pannello in-page senza navigare via */}
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
          <InfoPanelContent thread={selectedThread} isActing={isActing} onAction={handleAction} />
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

      {/* ── Pannello dettaglio in-page — mobile only ─────────────────────────── */}
      {showInfoSheet && selectedThread && (
        <>
          {/* Backdrop — tap per chiudere */}
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setShowInfoSheet(false)}
          />
          {/* Pannello slide-up */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl flex flex-col max-h-[88vh]">

            {/* Handle + ✕ */}
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

            {/* Contenuto scrollabile */}
            <div className="overflow-y-auto flex-1">
              <InfoPanelContent thread={selectedThread} isActing={isActing} onAction={handleAction} />
            </div>

            {/* Footer: chiudi pannello e torna alla chat */}
            <div className="shrink-0 px-5 pb-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInfoSheet(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft size={13} className="-rotate-90" />
                Chiudi scheda
              </button>
              <p className="text-center text-[9px] text-slate-400 mt-2">
                La chat rimane aperta in background
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

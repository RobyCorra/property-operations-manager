"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Brush,
  AlertTriangle,
  Ticket,
} from "@/src/components/icons";
import { Clock } from "@/src/components/icons";

export type KpiPopupItem = {
  id: string;
  label: string;
  sublabel: string;
  href: string;
};

export type DashboardKpiData = {
  checkinsToday: KpiPopupItem[];
  cleaningsToday: KpiPopupItem[];
  lateCleanings: KpiPopupItem[];
  cleaningsInProgress: KpiPopupItem[];
  urgentTickets: KpiPopupItem[];
  cleaningsDoneCount?: number;
  ticketsTodayCount?: number;
  ticketsDoneCount?: number;
};

type PopupState =
  | "checkin"
  | "cleanings"
  | "late"
  | "inprogress"
  | "tickets"
  | null;

const POPUP_CONFIG: Record<
  NonNullable<PopupState>,
  { title: string; emptyMsg: string }
> = {
  checkin:    { title: "Check-in Oggi",      emptyMsg: "Nessun check-in oggi" },
  cleanings:  { title: "Pulizie Oggi",       emptyMsg: "Nessuna pulizia oggi" },
  late:       { title: "Pulizie in Ritardo", emptyMsg: "Nessuna pulizia in ritardo" },
  inprogress: { title: "Pulizie in Corso",   emptyMsg: "Nessuna pulizia in corso" },
  tickets:    { title: "Ticket Oggi",        emptyMsg: "Nessun ticket oggi" },
};

export default function DashboardKpiCards({
  checkinsToday,
  cleaningsToday,
  lateCleanings,
  cleaningsInProgress,
  urgentTickets,
  cleaningsDoneCount = 0,
  ticketsTodayCount = 0,
  ticketsDoneCount = 0,
}: DashboardKpiData) {
  const [open, setOpen] = useState<PopupState>(null);

  const getItems = (key: NonNullable<PopupState>): KpiPopupItem[] => {
    if (key === "checkin")    return checkinsToday;
    if (key === "cleanings")  return cleaningsToday;
    if (key === "late")       return lateCleanings;
    if (key === "inprogress") return cleaningsInProgress;
    if (key === "tickets")    return urgentTickets;
    return [];
  };

  const isAlert = lateCleanings.length > 0;

  return (
    <>
      {/* ── 5 KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

        {/* 1 — Check-in oggi */}
        <button
          onClick={() => setOpen("checkin")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Check-in oggi</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{checkinsToday.length}</p>
            <p className="text-sm text-slate-500 mt-1">Arrivi confermati</p>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 group-hover:text-violet-500 transition-colors">
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 2 — Pulizie oggi */}
        <button
          onClick={() => setOpen("cleanings")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Pulizie oggi</p>
            <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
              <Brush size={16} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-2xl font-semibold text-slate-900 tracking-tight">{cleaningsToday.length}</p>
              <p className="text-sm text-slate-500 mt-1">pianificate</p>
            </div>
            {cleaningsDoneCount > 0 && (
              <div className="mb-0.5">
                <p className="text-xl font-semibold text-emerald-600 leading-none">{cleaningsDoneCount}</p>
                <p className="text-xs font-semibold text-emerald-500 mt-1">eseguite</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 group-hover:text-violet-500 transition-colors">
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 3 — Pulizie in ritardo */}
        <button
          onClick={() => setOpen("late")}
          className={`backdrop-blur-xl rounded-[28px] shadow-2xl p-6 min-h-[170px] flex flex-col justify-between transition-all border text-left cursor-pointer group ${
            isAlert
              ? "bg-rose-50/80 shadow-rose-500/10 border-rose-200/70 hover:shadow-rose-500/15"
              : "bg-white/50 shadow-violet-500/5 border-transparent hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50"
          }`}
        >
          <div className="flex justify-between items-start">
            <p className={`text-xs uppercase tracking-wide font-semibold ${isAlert ? "text-rose-600" : "text-slate-500"}`}>
              Pulizie in ritardo
            </p>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAlert ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400"}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-semibold tracking-tight ${isAlert ? "text-rose-700" : "text-slate-900"}`}>
              {lateCleanings.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Pending dopo le 10:30</p>
          </div>
          <p className={`text-[10px] flex items-center gap-1 mt-2 transition-colors ${isAlert ? "text-rose-400 group-hover:text-rose-600" : "text-slate-400 group-hover:text-violet-500"}`}>
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 4 — Pulizie in corso */}
        <button
          onClick={() => setOpen("inprogress")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Pulizie in corso</p>
            <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{cleaningsInProgress.length}</p>
            <p className="text-sm text-slate-500 mt-1">Interventi attivi ora</p>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 group-hover:text-violet-500 transition-colors">
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 5 — Ticket urgenti */}
        <button
          onClick={() => setOpen("tickets")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Ticket oggi</p>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Ticket size={16} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-2xl font-semibold text-slate-900 tracking-tight">{ticketsTodayCount}</p>
              <p className="text-sm text-slate-500 mt-1">pianificati</p>
            </div>
            <div className="mb-0.5">
              <p className="text-xl font-semibold text-emerald-600 leading-none">{ticketsDoneCount}</p>
              <p className="text-xs font-semibold text-emerald-500 mt-1">eseguiti</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 group-hover:text-violet-500 transition-colors">
            <span>→</span> Vedi lista
          </p>
        </button>

      </div>

      {/* ── POPUP OVERLAY ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white rounded-[28px] shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
            style={{ animation: "slideUp .22s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <p className="text-base font-700 font-bold text-slate-900">
                  {POPUP_CONFIG[open].title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {getItems(open).length} elemento{getItems(open).length !== 1 ? "i" : ""}
                </p>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 px-4 py-3">
              {getItems(open).length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10">
                  {POPUP_CONFIG[open].emptyMsg}
                </p>
              ) : (
                getItems(open).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(null)}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl mb-2 border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.sublabel}</p>
                    </div>
                    <span className="text-slate-300 group-hover:text-violet-500 transition-colors text-lg">→</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ticket,
  AlertTriangle,
  Clock,
  User,
} from "@/src/components/icons";

export type MaintKpiItem = {
  id: string;
  label: string;
  sublabel: string;
  href: string;
};

export type ImpresaMaintenanceKpiData = {
  ticketsToday: MaintKpiItem[];
  ticketsOpen: MaintKpiItem[];
  ticketsLate: MaintKpiItem[];
  ticketsClosed: MaintKpiItem[];
  ticketsUnassigned: MaintKpiItem[];
};

type PopupKey = "today" | "open" | "late" | "closed" | "unassigned" | null;

const POPUP_CONFIG: Record<NonNullable<PopupKey>, { title: string; emptyMsg: string }> = {
  today:      { title: "Ticket oggi",         emptyMsg: "Nessun ticket programmato per oggi." },
  open:       { title: "Ticket aperti",        emptyMsg: "Nessun ticket in corso." },
  late:       { title: "Ticket in ritardo",    emptyMsg: "Nessun ticket in ritardo." },
  closed:     { title: "Ticket chiusi oggi",   emptyMsg: "Nessun ticket chiuso oggi." },
  unassigned: { title: "Ticket non assegnati", emptyMsg: "Tutti i ticket sono assegnati." },
};

export default function ImpresaMaintenanceKpi({
  ticketsToday,
  ticketsOpen,
  ticketsLate,
  ticketsClosed,
  ticketsUnassigned,
}: ImpresaMaintenanceKpiData) {
  const [open, setOpen] = useState<PopupKey>(null);

  const getItems = (key: NonNullable<PopupKey>): MaintKpiItem[] => {
    if (key === "today") return ticketsToday;
    if (key === "open") return ticketsOpen;
    if (key === "late") return ticketsLate;
    if (key === "closed") return ticketsClosed;
    if (key === "unassigned") return ticketsUnassigned;
    return [];
  };

  const isLateAlert = ticketsLate.length > 0;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">

        {/* 1 — Ticket oggi */}
        <button
          onClick={() => setOpen("today")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Ticket oggi</p>
            <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
              <Ticket size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{ticketsToday.length}</p>
            <p className="text-sm text-slate-500 mt-1">Programmati</p>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 group-hover:text-violet-500 transition-colors">
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 2 — Ticket aperti */}
        <button
          onClick={() => setOpen("open")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Ticket aperti</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{ticketsOpen.length}</p>
            <p className="text-sm text-slate-500 mt-1">In corso</p>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 group-hover:text-violet-500 transition-colors">
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 3 — Ticket in ritardo */}
        <button
          onClick={() => setOpen("late")}
          className={`backdrop-blur-xl rounded-[28px] shadow-2xl p-6 min-h-[170px] flex flex-col justify-between transition-all border text-left cursor-pointer group ${
            isLateAlert
              ? "bg-rose-50/80 shadow-rose-500/10 border-rose-200/70 hover:shadow-rose-500/15"
              : "bg-white/50 shadow-violet-500/5 border-transparent hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50"
          }`}
        >
          <div className="flex justify-between items-start">
            <p className={`text-xs uppercase tracking-wide font-semibold ${isLateAlert ? "text-rose-600" : "text-slate-500"}`}>
              In ritardo
            </p>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLateAlert ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400"}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-semibold tracking-tight ${isLateAlert ? "text-rose-700" : "text-slate-900"}`}>
              {ticketsLate.length}
            </p>
            <p className="text-sm text-slate-500 mt-1">Oltre 30 min</p>
          </div>
          <p className={`text-[10px] flex items-center gap-1 mt-2 transition-colors ${isLateAlert ? "text-rose-400 group-hover:text-rose-600" : "text-slate-400 group-hover:text-violet-500"}`}>
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 4 — Ticket chiusi oggi */}
        <button
          onClick={() => setOpen("closed")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Chiusi oggi</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Ticket size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-semibold text-emerald-600 tracking-tight">{ticketsClosed.length}</p>
            <p className="text-sm text-slate-500 mt-1">Completati</p>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2 group-hover:text-violet-500 transition-colors">
            <span>→</span> Vedi lista
          </p>
        </button>

        {/* 5 — Ticket non assegnati */}
        <button
          onClick={() => setOpen("unassigned")}
          className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[170px] flex flex-col justify-between transition-all hover:shadow-violet-500/10 hover:-translate-y-0.5 hover:border-violet-200/50 border border-transparent text-left cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Non assegnati</p>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{ticketsUnassigned.length}</p>
            <p className="text-sm text-slate-500 mt-1">Da assegnare</p>
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
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <p className="text-base font-bold text-slate-900">
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

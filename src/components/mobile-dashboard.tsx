"use client";

import React, { useState } from "react";
import Link from "next/link";
import NotificationBell from "@/src/components/notification-bell";
import ApartmentMapWrapper from "@/src/components/apartment-map-wrapper";
import { ApartmentStatus, getApartmentOperationalStatus } from "@/src/lib/apartment-status";
import { logoutAction } from "@/src/app/actions/auth";
import FloatingManagerChat from "@/src/components/floating-manager-chat";

// ── Types ─────────────────────────────────────────────────────────────
export type MobileApartmentData = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: ApartmentStatus;
  statusLabel: string;
  openTickets: number;
};

export type MobileLateClean = {
  id: string;
  apartmentName: string;
  assignedToName: string;
  scheduledTime: string;
  href: string;
};

export type MobileInProgressClean = {
  id: string;
  apartmentName: string;
  assignedToName: string;
  startTime: string;
  progressDone: number;
  progressTotal: number;
  href: string;
};

export type MobileTodayEvent = {
  id: string;
  type: "CLEANING" | "MAINTENANCE";
  time: string | null;
  apartmentName: string;
  subject: string;
  actorName: string;
  status: string;
  href: string;
  isUrgent?: boolean;
};

export type MobileCheckinItem = {
  id: string;
  guestName: string;
  apartmentName: string;
  href: string;
};

export type MobileCleaningTodayItem = {
  id: string;
  apartmentName: string;
  assignedToName: string;
  isAssigned: boolean;
  status: string;
  href: string;
};

export type MobileUrgentTicketItem = {
  id: string;
  title: string;
  apartmentName: string;
  isAssigned: boolean;
  status: string;
  href: string;
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
};

// ── Calendar API types ─────────────────────────────────────────────
export type CalBooking = {
  id: string;
  guestName: string | null;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number | null;
  status: string | null;
  notes: string | null;
};

export type CalCleaning = {
  id: string;
  date: string;
  status: string;
  assignedTo: { name: string } | null;
  booking: { guestName: string | null; totalGuests: number | null } | null;
};

export type CalTicket = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  createdAt: string;
  scheduledStart: string | null;
  assignedTo: { name: string } | null;
};

export type CalendarData = {
  bookings: CalBooking[];
  cleanings: CalCleaning[];
  tickets: CalTicket[];
};

// ── Calendar helpers ───────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}
function fmtDateFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}
function isoToYMD(iso: string) {
  // Returns YYYY-MM-DD in local time (avoids UTC shift)
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
// ── Mappa status → label unificata ────────────────────────────────
function statusLabel(s: string, assigned = false) {
  if ((s === "PENDING" || s === "OPEN") && assigned) return "Assegnato";
  const map: Record<string, string> = {
    PENDING: "Da fare", OPEN: "Da fare",
    IN_PROGRESS: "In corso",
    COMPLETED: "Completata",
    AWAITING_REVIEW: "In verifica", RESOLVED: "In verifica",
    APPROVED: "Approvato",
    CONFIRMED: "Confermata", DONE: "Approvato",
  };
  return map[s] ?? s;
}

// ── Colori status unificati (pulizie e ticket) ─────────────────────
// assigned: true = PENDING/OPEN con assegnatario → giallo
function unifiedStatusColor(s: string, assigned = false): string {
  if (s === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (s === "AWAITING_REVIEW" || s === "RESOLVED") return "bg-amber-50 text-amber-700";
  if (s === "COMPLETED") return "bg-sky-50 text-sky-700";
  if (s === "IN_PROGRESS") return "bg-violet-50 text-violet-700";
  if ((s === "PENDING" || s === "OPEN") && assigned) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700"; // PENDING/OPEN senza assegnatario
}

// ── Legacy aliases ─────────────────────────────────────────────────
function cleaningStatusColor(s: string, assigned = false) { return unifiedStatusColor(s, assigned); }
function ticketPriorityColor(_p: string | null) { return "bg-slate-50 text-slate-600"; }
const MONTH_NAMES_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

// ── Apartment status → calendar colors ────────────────────────────
function aptStatusColors(status: string) {
  const map: Record<string, { occBg: string; textColor: string; ciGrad: string; coGrad: string }> = {
    GREEN:  { occBg: "#d1fae5", textColor: "#065f46", ciGrad: "135deg, #fff 50%, #a7f3d0 50%", coGrad: "135deg, #6ee7b7 50%, #fff 50%" },
    BLUE:   { occBg: "#dbeafe", textColor: "#1e40af", ciGrad: "135deg, #fff 50%, #bfdbfe 50%", coGrad: "135deg, #93c5fd 50%, #fff 50%" },
    VIOLET: { occBg: "#ede9fe", textColor: "#4c1d95", ciGrad: "135deg, #fff 50%, #ddd6fe 50%", coGrad: "135deg, #c4b5fd 50%, #fff 50%" },
    YELLOW: { occBg: "#fef9c3", textColor: "#713f12", ciGrad: "135deg, #fff 50%, #fef08a 50%", coGrad: "135deg, #fde047 50%, #fff 50%" },
    RED:    { occBg: "#fee2e2", textColor: "#7f1d1d", ciGrad: "135deg, #fff 50%, #fecaca 50%", coGrad: "135deg, #f87171 50%, #fff 50%" },
  };
  return map[status] ?? map["GREEN"];
}

// ── Colori dot unificati per il calendario (hex) ──────────────────
function unifiedDotHex(status: string, assigned = false): string {
  if (status === "APPROVED")                                        return "#10b981"; // emerald
  if (["AWAITING_REVIEW","RESOLVED"].includes(status))             return "#f59e0b"; // amber
  if (status === "COMPLETED")                                       return "#0ea5e9"; // sky
  if (status === "IN_PROGRESS")                                     return "#7c3aed"; // violet
  if ((status === "PENDING" || status === "OPEN") && assigned)     return "#eab308"; // yellow
  return "#ef4444"; // red — non assegnato
}

function cleaningDotHex(c: CalCleaning): string {
  return unifiedDotHex(c.status, !!c.assignedTo);
}
function cleaningStatusInfo(c: CalCleaning): { label: string; badgeClass: string } {
  const assigned = !!c.assignedTo;
  return { label: statusLabel(c.status, assigned), badgeClass: unifiedStatusColor(c.status, assigned) };
}

function ticketDotHex(t: CalTicket): string {
  return unifiedDotHex(t.status, !!t.assignedTo);
}
function ticketStatusInfo(t: CalTicket): { label: string; badgeClass: string; barHex: string } {
  const assigned = !!t.assignedTo;
  return {
    label: statusLabel(t.status, assigned),
    badgeClass: unifiedStatusColor(t.status, assigned),
    barHex: unifiedDotHex(t.status, assigned),
  };
}

type Props = {
  apartments: MobileApartmentData[];
  lateCleanings: MobileLateClean[];
  cleaningsInProgress: MobileInProgressClean[];
  todayPendingEvents: MobileTodayEvent[];
  checkinsCount: number;
  cleaningsCount: number;
  cleaningsDoneCount: number;
  checkinsItems: MobileCheckinItem[];
  cleaningsTodayItems: MobileCleaningTodayItem[];
  urgentTicketsItems: MobileUrgentTicketItem[];
  ticketsTodayItems: MobileUrgentTicketItem[];
  ticketsTodayCount: number;
  ticketsDoneCount: number;
  initialNotifications: NotificationItem[];
  serverDate: string;
  dateLabel: string;
  calendarDataByApt: Record<string, CalendarData>;
};

// ── Helpers ────────────────────────────────────────────────────────────
function statusDotClass(status: string) {
  switch (status) {
    case "GREEN":  return "bg-emerald-500";
    case "RED":    return "bg-red-500";
    case "BLUE":   return "bg-blue-500";
    case "VIOLET": return "bg-violet-500";
    case "YELLOW": return "bg-yellow-400";
    default:       return "bg-slate-400";
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "GREEN":  return "bg-emerald-100 text-emerald-700";
    case "RED":    return "bg-red-100 text-red-700";
    case "BLUE":   return "bg-blue-100 text-blue-700";
    case "VIOLET": return "bg-violet-100 text-violet-700";
    case "YELLOW": return "bg-yellow-100 text-yellow-700";
    default:       return "bg-slate-100 text-slate-600";
  }
}

function statusTextClass(status: string) {
  switch (status) {
    case "GREEN":  return "text-emerald-600";
    case "RED":    return "text-red-600";
    case "BLUE":   return "text-blue-600";
    case "VIOLET": return "text-violet-600";
    case "YELLOW": return "text-yellow-600";
    default:       return "text-slate-500";
  }
}

function eventBarColor(type: string, status: string) {
  if (type === "CLEANING") return status === "IN_PROGRESS" ? "bg-violet-500" : "bg-amber-400";
  return "bg-rose-500";
}

function eventBadgeClass(type: string, status: string) {
  if (type === "CLEANING") {
    return status === "IN_PROGRESS" ? "bg-violet-50 text-violet-600" : "bg-amber-50 text-amber-600";
  }
  return "bg-rose-50 text-rose-600";
}

function eventIconColor(type: string, status: string) {
  if (type === "CLEANING") return status === "IN_PROGRESS" ? "#7c3aed" : "#d97706";
  return "#e11d48";
}

function eventBgColor(type: string, status: string) {
  if (type === "CLEANING") return status === "IN_PROGRESS" ? "bg-violet-100" : "bg-amber-50";
  return "bg-rose-50";
}

// ── Component ──────────────────────────────────────────────────────────
export default function MobileDashboard({
  apartments,
  lateCleanings,
  cleaningsInProgress,
  todayPendingEvents,
  checkinsCount,
  cleaningsCount,
  cleaningsDoneCount,
  checkinsItems,
  cleaningsTodayItems,
  urgentTicketsItems,
  ticketsTodayItems,
  ticketsTodayCount,
  ticketsDoneCount,
  initialNotifications,
  serverDate,
  dateLabel,
  calendarDataByApt,
}: Props) {
  const [activeTab, setActiveTab]           = useState<"dashboard" | "calendar">("dashboard");
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [mapOpen, setMapOpen]               = useState(false);
  const [eventsOpen, setEventsOpen]         = useState(false);
  const [checkinsSheetOpen, setCheckinsSheetOpen]     = useState(false);
  const [cleaningsSheetOpen, setCleaningsSheetOpen]   = useState(false);
  const [ticketsSheetOpen, setTicketsSheetOpen]       = useState(false);
  const [lateCleanSheetOpen, setLateCleanSheetOpen]   = useState(false);
  const [inProgressSheetOpen, setInProgressSheetOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen]         = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");

  // ── Per-apartment calendar ─────────────────────────────────────
  const [selectedApt, setSelectedApt]       = useState<MobileApartmentData | null>(null);
  const [calendarData, setCalendarData]     = useState<CalendarData | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarTab, setCalendarTab]       = useState<"calendar" | "bookings" | "cleanings" | "tickets">("calendar");
  const [selectedDay, setSelectedDay]       = useState<number | null>(null);
  const nowDate = new Date();
  const [calMonth, setCalMonth]             = useState({ year: nowDate.getFullYear(), month: nowDate.getMonth() });

  function openApartmentCalendar(apt: MobileApartmentData) {
    setSelectedApt(apt);
    setCalendarTab("calendar");
    setCalendarLoading(false);
    // Torna sempre al mese corrente e seleziona oggi di default
    setCalMonth({ year: nowDate.getFullYear(), month: nowDate.getMonth() });
    setSelectedDay(nowDate.getDate());
    setCalendarData(calendarDataByApt[apt.id] ?? { bookings: [], cleanings: [], tickets: [] });
  }

  function changeCalMonth(delta: number) {
    const next = new Date(calMonth.year, calMonth.month + delta, 1);
    setCalMonth({ year: next.getFullYear(), month: next.getMonth() });
    setSelectedDay(null);
    // Data spans all months — no fetch needed
  }

  const pendingCount      = todayPendingEvents.length;
  const pendingCleanings  = todayPendingEvents.filter((e) => e.type === "CLEANING").length;
  const pendingMaintenance = todayPendingEvents.filter((e) => e.type === "MAINTENANCE").length;

  const filteredApartments = searchQuery
    ? apartments.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : apartments;

  function openSidebar() { setSidebarOpen(true); }
  function closeSidebar() { setSidebarOpen(false); }

  function navigateTo(tab: "dashboard" | "calendar") {
    setActiveTab(tab);
    closeSidebar();
  }

  function openSearch() {
    closeSidebar();
    setSearchOpen(true);
  }

  // ── Hamburger button (reused in multiple headers) ──────────────────
  const HamburgerBtn = () => (
    <button
      onClick={openSidebar}
      aria-label="Apri menu"
      className="w-10 h-10 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-1.5 px-2.5 shrink-0"
    >
      <span className="block w-full h-0.5 bg-slate-700 rounded-full" />
      <span className="block w-4/5 h-0.5 bg-slate-700 rounded-full self-start" />
      <span className="block w-full h-0.5 bg-slate-700 rounded-full" />
    </button>
  );

  return (
    <div className="relative bg-[#f8f7ff] min-h-screen flex flex-col overflow-hidden">

      {/* ════════════════════════════════════════════════════
          DASHBOARD VIEW
          ════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto pb-8" style={{ WebkitOverflowScrolling: "touch" }}>

        {/* ── HEADER ──────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <HamburgerBtn />
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{dateLabel}</p>
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Buongiorno 👋</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMapOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Mappa
            </button>
            <NotificationBell initialNotifications={initialNotifications} serverDate={serverDate} />
          </div>
        </div>

        {/* ── ALERT RITARDI — impilati ─────────────────────── */}
        {lateCleanings.length > 0 && (
          <div className="px-4 mb-3 space-y-2">
            {lateCleanings.map((lc, i) => (
              <div
                key={lc.id}
                className="bg-rose-500 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-rose-300 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wide text-white">⚠ Pulizia in ritardo</p>
                  <p className="text-[10px] text-rose-100 truncate">
                    {lc.apartmentName} · avrebbe dovuto iniziare {lc.scheduledTime}
                  </p>
                </div>
                <Link href={lc.href} className="px-3 py-1.5 bg-white text-rose-600 text-[10px] font-black rounded-full shrink-0">
                  Vedi
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── KPI GRID ────────────────────────────────────── */}
        <div className="px-4 grid grid-cols-2 gap-3 mb-3">
          {/* Check-in oggi — cliccabile */}
          <button
            onClick={() => setCheckinsSheetOpen(true)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-left active:scale-95 transition-transform"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Check-in Oggi</p>
            <p className="text-3xl font-black text-slate-900">{checkinsCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">prenotazioni</p>
          </button>

          {/* Pulizie oggi — cliccabile + count eseguite */}
          <button
            onClick={() => setCleaningsSheetOpen(true)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-left active:scale-95 transition-transform"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Pulizie Oggi</p>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-3xl font-black text-slate-900">{cleaningsCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">pianificate</p>
              </div>
              {cleaningsDoneCount > 0 && (
                <div className="mb-0.5">
                  <p className="text-xl font-black text-emerald-600 leading-none">{cleaningsDoneCount}</p>
                  <p className="text-[9px] font-bold text-emerald-500 mt-0.5">eseguite</p>
                </div>
              )}
            </div>
          </button>

          {/* Pulizie in ritardo */}
          <button
            onClick={() => setLateCleanSheetOpen(true)}
            className={`rounded-2xl p-4 shadow-sm border text-left active:scale-95 transition-transform ${
              lateCleanings.length > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-slate-100"
            }`}
          >
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
              lateCleanings.length > 0 ? "text-orange-500" : "text-slate-400"
            }`}>Pulizie in ritardo</p>
            <p className={`text-3xl font-black ${
              lateCleanings.length > 0 ? "text-orange-600" : "text-slate-900"
            }`}>{lateCleanings.length}</p>
            <p className={`text-[10px] mt-0.5 ${
              lateCleanings.length > 0 ? "text-orange-400" : "text-slate-400"
            }`}>in ritardo</p>
          </button>

          {/* Pulizie in corso */}
          <button
            onClick={() => setInProgressSheetOpen(true)}
            className={`rounded-2xl p-4 shadow-sm border text-left active:scale-95 transition-transform ${
              cleaningsInProgress.length > 0 ? "bg-violet-50 border-violet-200" : "bg-white border-slate-100"
            }`}
          >
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
              cleaningsInProgress.length > 0 ? "text-violet-500" : "text-slate-400"
            }`}>Pulizie in corso</p>
            <p className={`text-3xl font-black ${
              cleaningsInProgress.length > 0 ? "text-violet-600" : "text-slate-900"
            }`}>{cleaningsInProgress.length}</p>
            <p className={`text-[10px] mt-0.5 ${
              cleaningsInProgress.length > 0 ? "text-violet-400" : "text-slate-400"
            }`}>in esecuzione</p>
          </button>

          {/* Ticket Oggi */}
          <button
            onClick={() => setTicketsSheetOpen(true)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-left active:scale-95 transition-transform"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Oggi</p>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-3xl font-black text-slate-900">{ticketsTodayCount}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">pianificati</p>
              </div>
              {ticketsDoneCount > 0 && (
                <div className="mb-0.5">
                  <p className="text-xl font-black text-emerald-600 leading-none">{ticketsDoneCount}</p>
                  <p className="text-[9px] font-bold text-emerald-500 mt-0.5">eseguiti</p>
                </div>
              )}
            </div>
          </button>

          {/* Chiedi a IA */}
          <button
            onClick={() => setAiChatOpen(true)}
            className="bg-gradient-to-br from-violet-600 to-blue-500 rounded-2xl p-4 shadow-lg shadow-violet-200 text-left active:scale-95 transition-transform"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-violet-200 mb-1">Assistente</p>
            <div className="flex items-center gap-2 mt-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-white font-black text-base leading-tight">Chiedi<br/>a IA</p>
            </div>
            <p className="text-violet-200 text-[10px] mt-2">Domande operative</p>
          </button>
        </div>

        {/* ── PULIZIE IN CORSO ────────────────────────────── */}
        {cleaningsInProgress.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pulizie in corso</p>
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">
                  {cleaningsInProgress.length}
                </span>
              </div>
              <Link href="/dashboard/manager/cleanings" className="text-[10px] font-bold text-violet-600">
                Tutte →
              </Link>
            </div>
            <div className="space-y-2">
              {cleaningsInProgress.map((c) => {
                const pct = c.progressTotal > 0 ? Math.round((c.progressDone / c.progressTotal) * 100) : 0;
                return (
                  <Link
                    key={c.id}
                    href={c.href}
                    className="block bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden active:scale-[.99] transition-transform"
                  >
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-blue-500" />
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                          <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                          <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{c.apartmentName}</p>
                        <p className="text-[10px] text-slate-400">{c.assignedToName} · dal {c.startTime}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="flex items-center gap-1 text-[9px] font-black text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                          In corso
                        </span>
                        {c.progressTotal > 0 && (
                          <p className="text-[9px] text-slate-400">{c.progressDone}/{c.progressTotal} punti</p>
                        )}
                      </div>
                    </div>
                    {c.progressTotal > 0 && (
                      <div className="px-4 pb-3">
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-blue-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STATO APPARTAMENTI ──────────────────────────── */}
        <div className="px-4 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Stato Appartamenti</p>
          <div className="space-y-2">
            {apartments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotClass(apt.status)}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{apt.name}</p>
                    <p className="text-[10px] text-slate-400">{apt.statusLabel}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${statusBadgeClass(apt.status)}`}>
                  {apt.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          CALENDAR VIEW — slide in from right
          ════════════════════════════════════════════════════ */}
      {activeTab === "calendar" && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-20 flex flex-col">
          {/* Header con hamburger + titolo + back */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-slate-100">
            <HamburgerBtn />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Scegli appartamento</p>
              <h2 className="text-xl font-bold text-slate-900">Calendario</h2>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-full text-slate-600 text-[10px] font-bold"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Indietro
            </button>
          </div>

          {/* Apartment list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Seleziona per aprire il calendario
            </p>
            {apartments.map((apt) => (
              <button
                key={apt.id}
                onClick={() => openApartmentCalendar(apt)}
                className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm border border-slate-100 active:scale-95 transition-transform text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotClass(apt.status)}`} />
                  <span className="text-base font-bold text-slate-900">{apt.name}</span>
                  {apt.openTickets > 0 && (
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      {apt.openTickets} ticket
                    </span>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PER-APARTMENT CALENDAR — full screen in-state
          ════════════════════════════════════════════════════ */}
      {selectedApt && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-30 flex flex-col">

          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-0">
            {/* Back row */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => { setSelectedApt(null); setCalendarData(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full text-violet-700 text-[10px] font-bold"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Appartamenti
              </button>
            </div>
            {/* Apartment name + status */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${statusDotClass(selectedApt.status)}`} />
              <div>
                <h2 className="text-[19px] font-black text-slate-900 leading-tight">{selectedApt.name}</h2>
                <p className={`text-[10px] font-bold ${statusTextClass(selectedApt.status)}`}>
                  {selectedApt.statusLabel}
                  {selectedApt.openTickets > 0 && <span className="ml-2 text-rose-600">· {selectedApt.openTickets} ticket aperti</span>}
                </p>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 pb-0">
              {(["calendar","bookings","cleanings","tickets"] as const).map((t) => {
                const labels = { calendar: "Calendario", bookings: "Prenotazioni", cleanings: "Pulizie", tickets: "Ticket" };
                return (
                  <button
                    key={t}
                    onClick={() => setCalendarTab(t)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-t-xl border-b-2 transition-colors ${
                      calendarTab === t
                        ? "border-violet-600 text-violet-700 bg-violet-50"
                        : "border-transparent text-slate-500 bg-transparent"
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pb-8">
            {calendarLoading && (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">Caricamento…</p>
              </div>
            )}

            {!calendarLoading && calendarData && calendarTab === "calendar" && (() => {
              const { year, month } = calMonth;
              const firstDow = new Date(year, month, 1).getDay();
              const startOffset = (firstDow + 6) % 7; // Mon=0
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const todayYMD = isoToYMD(new Date().toISOString());

              // ── Dati per getApartmentOperationalStatus (stessa logica del desktop) ──
              const booksForStatus = calendarData.bookings.map((b) => ({
                id: b.id, apartmentId: selectedApt!.id,
                checkInDate: b.checkInDate, checkOutDate: b.checkOutDate, status: b.status,
              }));
              const cleansForStatus = calendarData.cleanings.map((c) => ({
                id: c.id, apartmentId: selectedApt!.id, date: c.date, status: c.status,
              }));
              const ticketsForStatus = calendarData.tickets.map((t) => ({
                id: t.id, apartmentId: selectedApt!.id,
                status: t.status, priority: t.priority ?? "LOW",
                scheduledStart: t.scheduledStart ?? null, scheduledEnd: null,
              }));

              // ── Per-day maps ──────────────────────────────────
              const checkinDays  = new Set<number>();
              const checkoutDays = new Set<number>();
              const occupiedDays = new Set<number>();
              const dayCleaningsMap = new Map<number, CalCleaning[]>();
              const dayTicketsMap   = new Map<number, CalTicket[]>();

              // Colore per ogni giorno — separato per CI, CO, occupato
              // (serve per gestire il caso stesso giorno CI+CO con diagonale)
              const dayCI  = new Map<number, string>(); // giorno → colore del check-in
              const dayCO  = new Map<number, string>(); // giorno → colore del check-out
              const dayOcc = new Map<number, string>(); // giorno → colore occupato

              calendarData.bookings.forEach((b) => {
                const ciYMD = isoToYMD(b.checkInDate);
                const coYMD = isoToYMD(b.checkOutDate);

                // Logica desktop: se il booking è attivo oggi usa now, altrimenti usa checkInDate
                const isActiveNow = todayYMD >= ciYMD && todayYMD < coYMD;
                const targetDate = isActiveNow ? new Date() : new Date(b.checkInDate);
                const bookingStatus = getApartmentOperationalStatus(
                  targetDate, booksForStatus, cleansForStatus, ticketsForStatus
                );
                const bookingColor = bookingStatus.color;

                for (let d = 1; d <= daysInMonth; d++) {
                  const ymd = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  if (ymd === ciYMD)                        { checkinDays.add(d);  dayCI.set(d, bookingColor); }
                  else if (ymd === coYMD)                   { checkoutDays.add(d); dayCO.set(d, bookingColor); }
                  else if (ymd > ciYMD && ymd < coYMD)     { occupiedDays.add(d); dayOcc.set(d, bookingColor); }
                }
              });
              calendarData.cleanings.forEach((c) => {
                const [cy, cm, cd] = isoToYMD(c.date).split("-").map(Number);
                if (cy === year && cm === month + 1) {
                  const arr = dayCleaningsMap.get(cd) ?? [];
                  arr.push(c);
                  dayCleaningsMap.set(cd, arr);
                }
              });
              calendarData.tickets.forEach((t) => {
                const dateStr = t.scheduledStart ?? t.createdAt;
                const [cy, cm, cd] = isoToYMD(dateStr).split("-").map(Number);
                if (cy === year && cm === month + 1) {
                  const arr = dayTicketsMap.get(cd) ?? [];
                  arr.push(t);
                  dayTicketsMap.set(cd, arr);
                }
              });

              const cells: (number | null)[] = [
                ...Array(startOffset).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ];
              while (cells.length % 7 !== 0) cells.push(null);

              // Helper: estrae i due colori da una stringa gradient tipo "135deg, #aaa 50%, #bbb 50%"
              function gradColors(grad: string): [string, string] {
                const parts = grad.split(",");
                return [parts[1].trim().split(" ")[0], parts[2].trim().split(" ")[0]];
              }

              // ── Day cell style — gestisce anche il caso stesso giorno CI+CO ──
              function dayCellStyle(d: number): React.CSSProperties {
                const ymd = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                if (ymd === todayYMD) return { background: "#7c3aed" };
                const ciColor  = dayCI.get(d);
                const coColor  = dayCO.get(d);
                const occColor = dayOcc.get(d);
                if (ciColor && coColor) {
                  // Stesso giorno CI + CO: diagonale 135°, metà sinistra = CO dark, metà destra = CI light
                  const [coDark]  = gradColors(aptStatusColors(coColor).coGrad); // colore scuro del checkout
                  const [, ciLight] = gradColors(aptStatusColors(ciColor).ciGrad); // colore chiaro del checkin
                  return { background: `linear-gradient(135deg, ${coDark} 50%, ${ciLight} 50%)` };
                }
                if (ciColor) return { background: `linear-gradient(${aptStatusColors(ciColor).ciGrad})` };
                if (coColor) return { background: `linear-gradient(${aptStatusColors(coColor).coGrad})` };
                if (occColor) return { backgroundColor: aptStatusColors(occColor).occBg };
                return {};
              }
              function dayNumColor(d: number): string {
                const ymd = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                if (ymd === todayYMD) return "#fff";
                const ciColor  = dayCI.get(d);
                const coColor  = dayCO.get(d);
                const occColor = dayOcc.get(d);
                // Caso same-day: numero neutro scuro (metà cella chiara, metà scura)
                if (ciColor && coColor) return "#1e293b";
                if (ciColor)  return aptStatusColors(ciColor).textColor;
                if (coColor)  return aptStatusColors(coColor).textColor;
                if (occColor) return aptStatusColors(occColor).textColor;
                return "#475569";
              }

              // ── Selected day event panel ───────────────────────
              function SelectedDayPanel() {
                if (!selectedDay) return null;
                const selYMD = `${year}-${String(month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`;
                const panelBookings = calendarData!.bookings.filter((b) => {
                  const ci = isoToYMD(b.checkInDate);
                  const co = isoToYMD(b.checkOutDate);
                  return selYMD === ci || selYMD === co || (selYMD > ci && selYMD < co);
                });
                const panelCleanings = dayCleaningsMap.get(selectedDay) ?? [];
                const panelTickets   = dayTicketsMap.get(selectedDay) ?? [];
                const total = panelBookings.length + panelCleanings.length + panelTickets.length;
                const dateLabel = new Date(year, month, selectedDay)
                  .toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

                return (
                  <div className="bg-white rounded-2xl border border-violet-100 shadow-md overflow-hidden mb-4">
                    <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                      <span className="text-[13px] font-black text-slate-900 capitalize">{dateLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{total} eventi</span>
                        <button onClick={() => setSelectedDay(null)} className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </div>
                    {total === 0 ? (
                      <div className="py-6 text-center text-sm text-slate-400 italic">Nessun evento in questa data</div>
                    ) : (
                      <div>
                        {panelBookings.map((b) => {
                          const isCI = isoToYMD(b.checkInDate) === selYMD;
                          const isCO = isoToYMD(b.checkOutDate) === selYMD;
                          const label = isCI ? "Check-in" : isCO ? "Check-out" : "In soggiorno";
                          return (
                            <Link key={b.id} href={`/dashboard/manager/bookings/${b.id}/edit`}
                              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-violet-50/40 last:border-b-0">
                              <div className="w-1 self-stretch rounded-full bg-violet-500 shrink-0" />
                              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 text-base">🏠</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-wide text-violet-600">Prenotazione — {label}</div>
                                <div className="text-[12px] font-bold text-slate-900 truncate">{selectedApt!.name}</div>
                                <div className="text-[9px] text-slate-500">{b.guestName ?? "Ospite"}{b.totalGuests ? ` · ${b.totalGuests} osp.` : ""}</div>
                                <div className="text-[9px] text-slate-400">{fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}</div>
                              </div>
                              <span className="text-[7px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">Confermata</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </Link>
                          );
                        })}
                        {panelCleanings.map((c) => {
                          const info = cleaningStatusInfo(c);
                          return (
                            <Link key={c.id} href={`/dashboard/manager/cleanings/${c.id}`}
                              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-blue-50/40 last:border-b-0">
                              <div className="w-1 self-stretch rounded-full bg-blue-400 shrink-0" />
                              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-base">🧹</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-wide text-blue-600">Pulizia</div>
                                <div className="text-[12px] font-bold text-slate-900 truncate">{selectedApt!.name}</div>
                                <div className="text-[9px] text-slate-500">{c.booking?.totalGuests ? `${c.booking.totalGuests} ospiti` : "—"}{c.assignedTo ? ` · ${c.assignedTo.name}` : ""}</div>
                              </div>
                              <span className={`text-[7px] font-bold px-2 py-1 rounded-full shrink-0 ${info.badgeClass}`}>{info.label}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </Link>
                          );
                        })}
                        {panelTickets.map((t) => {
                          const info = ticketStatusInfo(t);
                          return (
                            <Link key={t.id} href={`/dashboard/manager/maintenance/${t.id}`}
                              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-red-50/40 last:border-b-0">
                              <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: info.barHex }} />
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ backgroundColor: info.barHex + "18" }}>🔧</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-wide" style={{ color: info.barHex }}>Ticket · {info.label}</div>
                                <div className="text-[12px] font-bold text-slate-900 truncate">{t.title}</div>
                                <div className="text-[9px] text-slate-500">{t.assignedTo?.name ?? "Non assegnato"}</div>
                              </div>
                              <span className={`text-[7px] font-bold px-2 py-1 rounded-full shrink-0 ${info.badgeClass}`}>{info.label}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div className="px-4 pt-4">
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => changeCalMonth(-1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span className="text-base font-black text-slate-900">{MONTH_NAMES_IT[month]} {year}</span>
                    <button onClick={() => changeCalMonth(1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>

                  {/* Calendar grid */}
                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 mb-3">
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].map((d) => (
                        <div key={d} className="text-center text-[8px] font-black text-slate-400 uppercase py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((d, i) => {
                        if (!d) return <div key={i} />;
                        const isSelected = selectedDay === d;
                        const cleans = dayCleaningsMap.get(d) ?? [];
                        const tickets = dayTicketsMap.get(d) ?? [];
                        const hasEvents = cleans.length > 0 || tickets.length > 0;
                        return (
                          <div
                            key={i}
                            onClick={() => setSelectedDay(isSelected ? null : d)}
                            className="aspect-square relative flex items-center justify-center rounded-xl cursor-pointer overflow-hidden"
                            style={{
                              ...dayCellStyle(d),
                              boxShadow: isSelected ? "0 0 0 2.5px #1e1b4b" : undefined,
                            }}
                          >
                            <span className="text-[11px] font-semibold relative z-10" style={{ color: dayNumColor(d), fontWeight: isSelected || (isoToYMD(new Date().toISOString()) === `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`) ? "900" : "600" }}>{d}</span>
                            {hasEvents && (
                              <div className="absolute bottom-[2px] left-0 right-0 flex justify-center gap-[2px] z-10">
                                {cleans.map((c, ci) => (
                                  <div key={ci} style={{ width: 4, height: 4, borderRadius: "50%", background: cleaningDotHex(c), flexShrink: 0 }} />
                                ))}
                                {tickets.map((t, ti) => (
                                  <div key={ti} style={{ width: 4, height: 4, borderRadius: "50%", background: ticketDotHex(t), flexShrink: 0 }} />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Legenda ── */}
                  <div className="mb-4 space-y-2">

                    {/* Stato Appartamento */}
                    <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Stato Appartamento</p>
                      <div className="space-y-1.5">
                        {(["GREEN","BLUE","VIOLET","YELLOW","RED"] as const).map((s) => {
                          const c = aptStatusColors(s);
                          const labels: Record<string, string> = { GREEN:"Pronto", BLUE:"Non pronto", VIOLET:"In corso", YELLOW:"In verifica", RED:"Occupato" };
                          return (
                            <div key={s} className="flex items-center gap-2">
                              <div className="w-4 h-3.5 rounded-sm shrink-0" style={{ background: `linear-gradient(${c.ciGrad})` }} />
                              <div className="w-4 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: c.occBg }} />
                              <div className="w-4 h-3.5 rounded-sm shrink-0" style={{ background: `linear-gradient(${c.coGrad})` }} />
                              <span className="text-[8px] font-bold" style={{ color: c.textColor }}>{labels[s]}</span>
                              <span className="text-[7px] text-slate-400">CI · Occ · CO</span>
                            </div>
                          );
                        })}
                        {/* Riga stesso giorno CI+CO */}
                        <div className="flex items-center gap-2 pt-0.5 border-t border-slate-50 mt-1">
                          <div className="w-4 h-3.5 rounded-sm shrink-0" style={{ background: "linear-gradient(135deg, #f87171 50%, #a7f3d0 50%)" }} />
                          <span className="text-[8px] font-bold text-slate-600">Stesso giorno CO + CI</span>
                        </div>
                      </div>
                    </div>

                    {/* Pulizie */}
                    <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Pulizie</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        {([
                          { hex: "#eab308", label: "In attesa" },
                          { hex: "#f43f5e", label: "Non assegnata" },
                          { hex: "#f97316", label: "In ritardo" },
                          { hex: "#7c3aed", label: "In corso / verifica" },
                          { hex: "#22c55e", label: "Completata" },
                        ] as const).map(({ hex, label }) => (
                          <div key={label} className="flex items-center gap-1.5">
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: hex, flexShrink: 0 }} />
                            <span className="text-[8px] font-semibold text-slate-600">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ticket */}
                    <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Ticket manutenzione</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        {([
                          { hex: "#ef4444", label: "Urgente" },
                          { hex: "#f97316", label: "Non urgente" },
                          { hex: "#94a3b8", label: "Risolto" },
                        ] as const).map(({ hex, label }) => (
                          <div key={label} className="flex items-center gap-1.5">
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: hex, flexShrink: 0 }} />
                            <span className="text-[8px] font-semibold text-slate-600">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Pannello giorno selezionato (o oggi di default) */}
                  <SelectedDayPanel />
                </div>
              );
            })()}

            {!calendarLoading && calendarData && calendarTab === "bookings" && (() => {
              const selYMD = selectedDay
                ? `${calMonth.year}-${String(calMonth.month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`
                : null;
              const dayLabel = selectedDay
                ? new Date(calMonth.year, calMonth.month, selectedDay)
                    .toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
                : null;
              const items = selYMD
                ? calendarData.bookings.filter((b) => {
                    const ci = isoToYMD(b.checkInDate);
                    const co = isoToYMD(b.checkOutDate);
                    return selYMD === ci || selYMD === co || (selYMD > ci && selYMD < co);
                  })
                : [];
              return (
                <div className="px-4 pt-4 space-y-3">
                  {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
                  {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">Tocca un giorno sul calendario</div>}
                  {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Nessuna prenotazione in questa data</div>}
                  {items.map((b) => (
                    <Link key={b.id} href={`/dashboard/manager/bookings/${b.id}/edit`} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform">
                      <div className="h-1 bg-violet-500" />
                      <div className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{selectedApt!.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{b.guestName ?? "Ospite"}</p>
                            <p className="text-[10px] text-slate-500">Check-in: {fmtDateFull(b.checkInDate)}</p>
                            <p className="text-[10px] text-slate-500">Check-out: {fmtDateFull(b.checkOutDate)}</p>
                            {b.totalGuests && <p className="text-[10px] text-slate-500">{b.totalGuests} ospiti · {diffDays(b.checkInDate, b.checkOutDate)} notti</p>}
                            {b.notes && <p className="text-[10px] text-slate-400 mt-1 italic">{b.notes}</p>}
                          </div>
                          <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">Confermata</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}

            {!calendarLoading && calendarData && calendarTab === "cleanings" && (() => {
              const selYMD = selectedDay
                ? `${calMonth.year}-${String(calMonth.month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`
                : null;
              const dayLabel = selectedDay
                ? new Date(calMonth.year, calMonth.month, selectedDay)
                    .toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
                : null;
              const items = selYMD
                ? calendarData.cleanings.filter((c) => isoToYMD(c.date) === selYMD)
                : [];
              return (
                <div className="px-4 pt-4 space-y-3">
                  {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
                  {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">Tocca un giorno sul calendario</div>}
                  {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Nessuna pulizia in questa data</div>}
                  {items.map((c) => (
                    <Link key={c.id} href={`/dashboard/manager/cleanings/${c.id}`} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform">
                      <div className="h-1 bg-blue-400" />
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-lg">🧹</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">{selectedApt!.name}</p>
                          {c.booking?.totalGuests && <p className="text-[10px] text-slate-500">{c.booking.totalGuests} ospiti</p>}
                          {c.assignedTo && <p className="text-[10px] text-slate-400">{c.assignedTo.name}</p>}
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-1 rounded-full shrink-0 ${cleaningStatusColor(c.status)}`}>{statusLabel(c.status)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}

            {!calendarLoading && calendarData && calendarTab === "tickets" && (() => {
              const selYMD = selectedDay
                ? `${calMonth.year}-${String(calMonth.month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`
                : null;
              const dayLabel = selectedDay
                ? new Date(calMonth.year, calMonth.month, selectedDay)
                    .toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
                : null;
              const items = selYMD
                ? calendarData.tickets.filter((t) => isoToYMD(t.scheduledStart ?? t.createdAt) === selYMD)
                : [];
              return (
                <div className="px-4 pt-4 space-y-3">
                  {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
                  {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">Tocca un giorno sul calendario</div>}
                  {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Nessun ticket in questa data</div>}
                  {items.map((t) => (
                    <Link key={t.id} href={`/dashboard/manager/maintenance/${t.id}`} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform">
                      <div className="h-1 bg-rose-400" />
                      <div className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-900 flex-1 min-w-0">{t.title}</p>
                          <span className={`text-[8px] font-bold px-2 py-1 rounded-full shrink-0 ${ticketPriorityColor(t.priority)}`}>
                            {t.priority ?? "Normal"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">Stato: {statusLabel(t.status)}</p>
                        {t.assignedTo && <p className="text-[10px] text-slate-500">Assegnato a {t.assignedTo.name}</p>}
                        {t.scheduledStart && <p className="text-[10px] text-slate-500">Previsto: {fmtDateFull(t.scheduledStart)}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          SIDEBAR OVERLAY — slide in from left
          ════════════════════════════════════════════════════ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeSidebar}
          />

          {/* Panel */}
          <div className="relative w-[270px] h-full bg-white flex flex-col shadow-2xl shadow-black/30 z-10">

            {/* Sidebar header */}
            <div className="px-5 pt-12 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-200 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Manager</p>
                  <p className="text-[10px] text-slate-400">Dashboard Operativa</p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

              {/* NAVIGAZIONE label */}
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 mb-2">Navigazione</p>

              <button
                onClick={() => navigateTo("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                  activeTab === "dashboard" ? "bg-violet-50 border border-violet-100" : "hover:bg-slate-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTab === "dashboard" ? "bg-violet-600" : "bg-slate-100"}`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={activeTab === "dashboard" ? "white" : "#64748b"} strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-bold ${activeTab === "dashboard" ? "text-violet-700" : "text-slate-700"}`}>Dashboard</p>
                  <p className="text-[10px] text-slate-400">Vista principale</p>
                </div>
              </button>

              <button
                onClick={() => navigateTo("calendar")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                  activeTab === "calendar" ? "bg-violet-50 border border-violet-100" : "hover:bg-slate-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeTab === "calendar" ? "bg-violet-600" : "bg-slate-100"}`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={activeTab === "calendar" ? "white" : "#64748b"} strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-bold ${activeTab === "calendar" ? "text-violet-700" : "text-slate-700"}`}>Calendario</p>
                  <p className="text-[10px] text-slate-400">Per appartamento</p>
                </div>
              </button>

              <Link
                href="/dashboard/manager/messages"
                onClick={closeSidebar}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 relative">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Messaggi</p>
                  <p className="text-[10px] text-slate-400">Chat con il team</p>
                </div>
              </Link>

              <button
                onClick={openSearch}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Cerca</p>
                  <p className="text-[10px] text-slate-400">Appartamenti, ospiti…</p>
                </div>
              </button>

              {/* Divider */}
              <div className="my-3 h-px bg-slate-100 mx-2" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 mb-2">Crea Nuovo</p>

              <Link
                href="/dashboard/manager/cleanings/new"
                onClick={closeSidebar}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-violet-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">Nuova Pulizia</p>
              </Link>

              <Link
                href="/dashboard/manager/maintenance/new"
                onClick={closeSidebar}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">Nuovo Ticket</p>
              </Link>

              <Link
                href="/dashboard/manager/bookings/new"
                onClick={closeSidebar}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">Nuova Prenotazione</p>
              </Link>

              <Link
                href="/dashboard/manager/apartments/new"
                onClick={closeSidebar}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">Nuovo Appartamento</p>
              </Link>
            </nav>

            {/* Chiudi + Logout */}
            <div className="px-4 pb-8 pt-3 border-t border-slate-100 space-y-2">
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-rose-600 text-sm font-bold active:bg-rose-100 transition-colors border border-rose-100"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </form>
              <button
                onClick={closeSidebar}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-500 text-sm font-bold active:bg-slate-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CHECK-IN OGGI SHEET
          ════════════════════════════════════════════════════ */}
      {checkinsSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col">
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Oggi</p>
              <h2 className="text-xl font-bold text-slate-900">
                {checkinsCount > 0 ? `${checkinsCount} check-in` : "Nessun check-in oggi"}
              </h2>
            </div>
            <button
              onClick={() => setCheckinsSheetOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-8">
            {checkinsItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">Nessun check-in previsto per oggi</div>
            )}
            {checkinsItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setCheckinsSheetOpen(false)}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform"
              >
                <div className="h-1 bg-blue-500" />
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.apartmentName}</p>
                    <p className="text-[10px] text-slate-400 truncate">Ospite: {item.guestName}</p>
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full shrink-0">
                    Apri
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PULIZIE OGGI SHEET
          ════════════════════════════════════════════════════ */}
      {cleaningsSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col">
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Oggi</p>
              <h2 className="text-xl font-bold text-slate-900">
                {cleaningsCount > 0 ? `${cleaningsCount} pulizie` : "Nessuna pulizia oggi"}
              </h2>
            </div>
            <button
              onClick={() => setCleaningsSheetOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-8">
            {cleaningsTodayItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">Nessuna pulizia pianificata per oggi</div>
            )}
            {cleaningsTodayItems.map((item) => {
              const dotHex = unifiedDotHex(item.status, item.isAssigned);
              const barColor = item.status === "APPROVED" ? "bg-emerald-500"
                : item.status === "AWAITING_REVIEW" ? "bg-amber-400"
                : item.status === "COMPLETED" ? "bg-sky-400"
                : item.status === "IN_PROGRESS" ? "bg-violet-500"
                : item.isAssigned ? "bg-yellow-400"
                : "bg-red-400";
              const iconColor = dotHex;
              const iconBg = item.status === "APPROVED" ? "bg-emerald-50"
                : item.status === "AWAITING_REVIEW" ? "bg-amber-50"
                : item.status === "COMPLETED" ? "bg-sky-50"
                : item.status === "IN_PROGRESS" ? "bg-violet-100"
                : item.isAssigned ? "bg-yellow-50"
                : "bg-red-50";
              const badgeClass = unifiedStatusColor(item.status, item.isAssigned);
              const itemStatusLabel = statusLabel(item.status, item.isAssigned);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setCleaningsSheetOpen(false)}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform"
                >
                  <div className={`h-1 ${barColor}`} />
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5">
                        <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                        <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.apartmentName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.assignedToName}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 ${badgeClass}`}>
                      {itemStatusLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TICKET OGGI SHEET
          ════════════════════════════════════════════════════ */}
      {ticketsSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col">
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Manutenzione</p>
              <h2 className="text-xl font-bold text-slate-900">
                {ticketsTodayItems.length > 0
                  ? `${ticketsTodayItems.length} ticket oggi`
                  : "Nessun ticket oggi"}
              </h2>
            </div>
            <button
              onClick={() => setTicketsSheetOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-8">
            {ticketsTodayItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                ✓ Nessun ticket per oggi
              </div>
            )}
            {ticketsTodayItems.map((ticket) => {
              const badgeClass = unifiedStatusColor(ticket.status, ticket.isAssigned);
              const ticketStatusLabel = statusLabel(ticket.status, ticket.isAssigned);
              const barColor = ticket.status === "APPROVED" ? "bg-emerald-400"
                : ["AWAITING_REVIEW","RESOLVED"].includes(ticket.status) ? "bg-amber-400"
                : ticket.status === "IN_PROGRESS" ? "bg-violet-500"
                : ticket.isAssigned ? "bg-yellow-400"
                : "bg-red-400";
              return (
                <Link
                  key={ticket.id}
                  href={ticket.href}
                  onClick={() => setTicketsSheetOpen(false)}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform"
                >
                  <div className={`h-1 ${barColor}`} />
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{ticket.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{ticket.apartmentName}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 ${badgeClass}`}>
                      {ticketStatusLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PULIZIE IN RITARDO SHEET
          ════════════════════════════════════════════════════ */}
      {lateCleanSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col">
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Attenzione</p>
              <h2 className="text-xl font-bold text-slate-900">
                {lateCleanings.length > 0
                  ? `${lateCleanings.length} pulizie in ritardo`
                  : "Nessuna pulizia in ritardo"}
              </h2>
            </div>
            <button
              onClick={() => setLateCleanSheetOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-8">
            {lateCleanings.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                ✓ Nessuna pulizia in ritardo
              </div>
            )}
            {lateCleanings.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                onClick={() => setLateCleanSheetOpen(false)}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform"
              >
                <div className="h-1 bg-orange-400" />
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
                      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{c.apartmentName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.assignedToName} · {c.scheduledTime}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 bg-orange-50 text-orange-700">
                    In ritardo
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PULIZIE IN CORSO SHEET
          ════════════════════════════════════════════════════ */}
      {inProgressSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col">
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">In esecuzione</p>
              <h2 className="text-xl font-bold text-slate-900">
                {cleaningsInProgress.length > 0
                  ? `${cleaningsInProgress.length} pulizie in corso`
                  : "Nessuna pulizia in corso"}
              </h2>
            </div>
            <button
              onClick={() => setInProgressSheetOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-8">
            {cleaningsInProgress.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                Nessuna pulizia in corso
              </div>
            )}
            {cleaningsInProgress.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                onClick={() => setInProgressSheetOpen(false)}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform"
              >
                <div className="h-1 bg-violet-500" />
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{c.apartmentName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.assignedToName}</p>
                    {c.progressTotal > 0 && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${Math.round((c.progressDone / c.progressTotal) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-violet-600 shrink-0">
                          {c.progressDone}/{c.progressTotal}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 bg-violet-50 text-violet-700">
                    In corso
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          AI CHAT — pannello identico al desktop
          ════════════════════════════════════════════════════ */}
      <FloatingManagerChat
        externalOpen={aiChatOpen}
        onExternalClose={() => setAiChatOpen(false)}
      />

      {/* ════════════════════════════════════════════════════
          EVENTS DRAWER — slide up
          ════════════════════════════════════════════════════ */}
      {eventsOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col">
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Oggi — Da completare</p>
              <h2 className="text-xl font-bold text-slate-900">
                {pendingCount > 0 ? `${pendingCount} eventi pendenti` : "Nessun evento pendente"}
              </h2>
            </div>
            <button
              onClick={() => setEventsOpen(false)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-8">
            {todayPendingEvents.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                ✓ Tutti gli eventi di oggi sono stati completati
              </div>
            )}
            {todayPendingEvents.map((ev) => (
              <Link
                key={ev.id}
                href={ev.href}
                onClick={() => setEventsOpen(false)}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform"
              >
                <div className={`h-1 ${eventBarColor(ev.type, ev.status)}`} />
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${eventBgColor(ev.type, ev.status)} flex items-center justify-center shrink-0`}>
                    {ev.type === "CLEANING" ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={eventIconColor(ev.type, ev.status)} strokeWidth="2.5">
                        <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                        <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={eventIconColor(ev.type, ev.status)} strokeWidth="2.5">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${eventBadgeClass(ev.type, ev.status)}`}>
                        {ev.type === "CLEANING" ? "Pulizia" : "Manutenzione"}
                      </span>
                      {ev.time && <span className="text-[9px] text-slate-400">{ev.time}</span>}
                      {ev.isUrgent && <span className="text-[9px] text-rose-500 font-bold">● URGENTE</span>}
                    </div>
                    <p className="text-sm font-bold text-slate-900 truncate">{ev.apartmentName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{ev.subject} · {ev.actorName}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full shrink-0 ${eventBadgeClass(ev.type, ev.status)}`}>
                    Apri
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MAP PANEL — slide up
          ════════════════════════════════════════════════════ */}
      {mapOpen && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          <div className="px-5 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Mappa Geospaziale</p>
              <h2 className="text-lg font-bold text-white">Appartamenti Live</h2>
            </div>
            <button
              onClick={() => setMapOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 mx-4 mb-4 rounded-3xl overflow-hidden">
            <ApartmentMapWrapper apartments={apartments} />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          SEARCH OVERLAY — sheet dal basso
          ════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Cerca</h2>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" className="shrink-0">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Cerca appartamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 ml-2 w-full placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredApartments.map((apt) => (
                <Link
                  key={apt.id}
                  href="/dashboard/manager/mappa"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl active:bg-slate-100"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotClass(apt.status)}`} />
                  <span className="text-sm font-bold text-slate-900">{apt.name}</span>
                  <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass(apt.status)}`}>
                    {apt.statusLabel}
                  </span>
                </Link>
              ))}
              {filteredApartments.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">Nessun risultato</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

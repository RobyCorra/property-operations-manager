"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLang } from "@/src/components/lang-context";
import type { T } from "@/src/lib/i18n";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationBell from "@/src/components/notification-bell";
import ApartmentMapWrapper from "@/src/components/apartment-map-wrapper";
import { ApartmentStatus, getApartmentOperationalStatus } from "@/src/lib/apartment-status";
import { logoutAction } from "@/src/app/actions/auth";
import FloatingManagerChat from "@/src/components/floating-manager-chat";
import SettingsDrawer from "@/src/components/settings-drawer";

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

export type MobileLateCheckin = {
  id: string;
  apartmentName: string;
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

export type CalCheckin = {
  id: string;
  date: string;
  status: string;
  assignedTo: { name: string } | null;
  booking: { guestName: string | null; totalGuests: number | null } | null;
};

export type CalendarData = {
  bookings: CalBooking[];
  cleanings: CalCleaning[];
  tickets: CalTicket[];
  checkins?: CalCheckin[];
};

// ── Calendar helpers ───────────────────────────────────────────────
function fmtDate(iso: string, locale: string = "it-IT") {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}
function fmtDateFull(iso: string, locale: string = "it-IT") {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
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
function statusLabel(s: string, assigned: boolean, tr: T) {
  if (s === "PENDING" && assigned) return tr.calAssigned;
  const map: Record<string, string> = {
    PENDING: tr.calToDo,
    IN_PROGRESS: tr.calInProgress,
    COMPLETED: tr.calCompleted,
    AWAITING_REVIEW: tr.calInReview, RESOLVED: tr.calInReview,
    APPROVED: tr.calApproved,
    CONFIRMED: tr.mdConfirmed, DONE: tr.calApproved,
  };
  return map[s] ?? s;
}

// ── Colori status unificati (pulizie e ticket) ─────────────────────
// assigned: true = PENDING con assegnatario → giallo
function unifiedStatusColor(s: string, assigned = false): string {
  if (s === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (s === "AWAITING_REVIEW" || s === "RESOLVED") return "bg-amber-50 text-amber-700";
  if (s === "COMPLETED") return "bg-sky-50 text-sky-700";
  if (s === "IN_PROGRESS") return "bg-violet-50 text-violet-700";
  if (s === "PENDING" && assigned) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700"; // PENDING senza assegnatario
}

// ── Legacy aliases ─────────────────────────────────────────────────
function cleaningStatusColor(s: string, assigned = false) { return unifiedStatusColor(s, assigned); }
function ticketPriorityColor(_p: string | null) { return "bg-slate-50 text-slate-600"; }
const MONTH_NAMES_IT = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"]; // fallback; localized at render

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
  if (status === "PENDING" && assigned)                            return "#eab308"; // yellow
  return "#ef4444"; // red — non assegnato
}

function cleaningDotHex(c: CalCleaning): string {
  return unifiedDotHex(c.status, !!c.assignedTo);
}
function cleaningStatusInfo(c: CalCleaning, tr: T): { label: string; badgeClass: string } {
  const assigned = !!c.assignedTo;
  return { label: statusLabel(c.status, assigned, tr), badgeClass: unifiedStatusColor(c.status, assigned) };
}

function ticketDotHex(t: CalTicket): string {
  return unifiedDotHex(t.status, !!t.assignedTo);
}

function checkinDotHex(c: CalCheckin): string {
  return unifiedDotHex(c.status, !!c.assignedTo);
}
function checkinStatusInfo(c: CalCheckin, tr: T): { label: string; badgeClass: string } {
  const assigned = !!c.assignedTo;
  return { label: statusLabel(c.status, assigned, tr), badgeClass: unifiedStatusColor(c.status, assigned) };
}
function ticketStatusInfo(t: CalTicket, tr: T): { label: string; badgeClass: string; barHex: string } {
  const assigned = !!t.assignedTo;
  return {
    label: statusLabel(t.status, assigned, tr),
    badgeClass: unifiedStatusColor(t.status, assigned),
    barHex: unifiedDotHex(t.status, assigned),
  };
}

type Props = {
  apartments: MobileApartmentData[];
  lateCleanings: MobileLateClean[];
  lateCheckins?: MobileLateCheckin[];
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
  unreadMessagesCount?: number;
  orgName?: string;
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
  lateCheckins = [],
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
  unreadMessagesCount = 0,
  orgName = "",
}: Props) {
  const { t: tr, lang } = useLang();
  const dateLocale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
  const [activeTab, setActiveTab]           = useState<"dashboard" | "calendar">("dashboard");
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [mapOpen, setMapOpen]               = useState(false);
  const [eventsOpen, setEventsOpen]         = useState(false);
  const [settingsOpen, setSettingsOpen]     = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isMountedRef = useRef(false); // usato per saltare il pathname effect al primo render

  // Haptic + audio tick on tab tap
  const tabTap = () => {
    try { navigator.vibrate?.(10); } catch {}
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
      osc.start(); osc.stop(ctx.currentTime + 0.07);
    } catch {}
  };

  const [checkinsSheetOpen, setCheckinsSheetOpen]     = useState(false);
  const [cleaningsSheetOpen, setCleaningsSheetOpen]   = useState(false);
  const [ticketsSheetOpen, setTicketsSheetOpen]       = useState(false);
  const [lateCleanSheetOpen, setLateCleanSheetOpen]   = useState(false);
  const [inProgressSheetOpen, setInProgressSheetOpen] = useState(false);

  // ── Sheet tr.mdAllCleanings ───────────────────────────────────
  type AllCleaningItem = {
    id: string;
    date: string;
    status: string;
    apartmentId: string;
    apartmentName: string;
    assignedToName: string | null;
    href: string;
  };
  const nowForSheet = new Date();
  const [allCleaningsMonth, setAllCleaningsMonth] = useState(`${nowForSheet.getFullYear()}-${String(nowForSheet.getMonth() + 1).padStart(2, "0")}`);
  const [allCleaningsApt, setAllCleaningsApt]     = useState("ALL");
  const [allCleaningsStatus, setAllCleaningsStatus] = useState("ALL");
  const [allCleaningsData, setAllCleaningsData]   = useState<AllCleaningItem[]>([]);
  const [allCleaningsLoading, setAllCleaningsLoading] = useState(false);
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

  // Restaura lo stato del calendario dal sessionStorage quando torna indietro
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCalendarState = sessionStorage.getItem('mobileCalendarState');
      if (savedCalendarState) {
        try {
          const state = JSON.parse(savedCalendarState);
          if (state.selectedApt) {
            setSelectedApt(state.selectedApt);
            setCalendarTab(state.calendarTab || "calendar");
            setCalMonth(state.calMonth || { year: nowDate.getFullYear(), month: nowDate.getMonth() });
            setSelectedDay(state.selectedDay || null);
            if (state.selectedApt.id && calendarDataByApt[state.selectedApt.id]) {
              setCalendarData(calendarDataByApt[state.selectedApt.id]);
            }
          }
          sessionStorage.removeItem('mobileCalendarState');
        } catch (e) {
          console.error('Failed to restore calendar state:', e);
        }
      }
    }
  }, []);

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

  // Salva lo stato del calendario nel sessionStorage prima di navigare
  function saveCalendarStateAndNavigate(href: string) {
    if (typeof window !== 'undefined' && selectedApt) {
      sessionStorage.setItem('mobileCalendarState', JSON.stringify({
        selectedApt,
        calendarTab,
        calMonth,
        selectedDay,
      }));
    }
    // Naviga usando Link normalmente, questo sarà gestito dal browser
  }

  // ── Fetch tutte le pulizie ────────────────────────────────────────
  async function fetchAllCleanings(month: string, aptId: string, status: string) {
    setAllCleaningsLoading(true);
    try {
      const params = new URLSearchParams({ month });
      if (aptId !== "ALL") params.set("apartmentId", aptId);
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`/api/cleanings-all?${params}`);
      const data = await res.json();
      setAllCleaningsData(data);
    } catch {
      setAllCleaningsData([]);
    } finally {
      setAllCleaningsLoading(false);
    }
  }

  // ── Hamburger button (reused in multiple headers) ──────────────────
  const HamburgerBtn = () => (
    <button
      onClick={openSidebar}
      aria-label={tr.mdOpenMenu}
      className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-1.5 px-2.5 shrink-0"
    >
      <span className="block w-full h-0.5 bg-slate-700 rounded-full" />
      <span className="block w-4/5 h-0.5 bg-slate-700 rounded-full self-start" />
      <span className="block w-full h-0.5 bg-slate-700 rounded-full" />
    </button>
  );

  // Al mount: reset stato + legge sessionStorage per sapere cosa aprire
  useEffect(() => {
    setSidebarOpen(false);
    setCheckinsSheetOpen(false);
    setLateCleanSheetOpen(false);
    setInProgressSheetOpen(false);

    // Legge query param ?sheet= (redirect da server action) oppure sessionStorage
    const urlSheet = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("sheet") : null;
    if (urlSheet) {
      // Rimuovi il query param dall'URL senza ricaricare la pagina
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
    const action = urlSheet || sessionStorage.getItem("openOnDashboard") || sessionStorage.getItem("returnToSheet");
    sessionStorage.removeItem("openOnDashboard");
    sessionStorage.removeItem("returnToSheet");

    if (action === "cleanings") { setCleaningsSheetOpen(true); fetchAllCleanings(allCleaningsMonth, allCleaningsApt, allCleaningsStatus); setTicketsSheetOpen(false); }
    else if (action === "tickets") { setTicketsSheetOpen(true); setCleaningsSheetOpen(false); }
    else if (action === "calendar") { setActiveTab("calendar"); setCleaningsSheetOpen(false); setTicketsSheetOpen(false); }
    else if (action === "map") { setMapOpen(true); setCleaningsSheetOpen(false); setTicketsSheetOpen(false); }
    else { setCleaningsSheetOpen(false); setTicketsSheetOpen(false); }
  }, []);

  // Quando il pathname cambia (navigazione soft) → legge sessionStorage e apre lo sheet corretto.
  // Skippa il primo render: al mount ci pensa già il useEffect([]) sopra.
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (pathname === "/dashboard/manager") {
      const action = sessionStorage.getItem("openOnDashboard") || sessionStorage.getItem("returnToSheet");
      sessionStorage.removeItem("openOnDashboard");
      sessionStorage.removeItem("returnToSheet");

      setSidebarOpen(false);
      setCheckinsSheetOpen(false);
      setLateCleanSheetOpen(false);
      setInProgressSheetOpen(false);

      if (action === "cleanings") { setCleaningsSheetOpen(true); fetchAllCleanings(allCleaningsMonth, allCleaningsApt, allCleaningsStatus); setTicketsSheetOpen(false); setActiveTab("dashboard"); }
      else if (action === "tickets") { setTicketsSheetOpen(true); setCleaningsSheetOpen(false); setActiveTab("dashboard"); }
      else if (action === "calendar") { setActiveTab("calendar"); setCleaningsSheetOpen(false); setTicketsSheetOpen(false); }
      else if (action === "map") { setMapOpen(true); setCleaningsSheetOpen(false); setTicketsSheetOpen(false); setActiveTab("dashboard"); }
      else {
        setCleaningsSheetOpen(false);
        setTicketsSheetOpen(false);
        setActiveTab("dashboard");
      }
    }
  }, [pathname]);

  // Listener evento immediato dal MobileTabBar quando siamo già sulla dashboard
  useEffect(() => {
    const onAction = (e: Event) => {
      const action = (e as CustomEvent).detail as string;
      if (action === "home") {
        setActiveTab("dashboard");
        setSidebarOpen(false);
        setCleaningsSheetOpen(false);
        setTicketsSheetOpen(false);
        setCheckinsSheetOpen(false);
        setLateCleanSheetOpen(false);
        setInProgressSheetOpen(false);
        setSelectedApt(null);
        setCalendarData(null);
      } else if (action === "calendar") { setActiveTab("calendar"); setCleaningsSheetOpen(false); setTicketsSheetOpen(false); }
      else if (action === "cleanings") { setCleaningsSheetOpen(true); fetchAllCleanings(allCleaningsMonth, allCleaningsApt, allCleaningsStatus); setTicketsSheetOpen(false); setActiveTab("dashboard"); }
      else if (action === "tickets") { setTicketsSheetOpen(true); setCleaningsSheetOpen(false); setActiveTab("dashboard"); }
      else if (action === "map") { setMapOpen(true); setCleaningsSheetOpen(false); setTicketsSheetOpen(false); setActiveTab("dashboard"); }
    };
    window.addEventListener("mobile-tab-action", onAction);
    return () => window.removeEventListener("mobile-tab-action", onAction);
  }, []);

  return (
    <div className="relative bg-[#f8f7ff] h-screen flex flex-col overflow-hidden">

      {/* ════════════════════════════════════════════════════
          DASHBOARD VIEW
          ════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: "touch" }}>


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

        {lateCheckins.length > 0 && (
          <div className="px-4 mb-3 space-y-2">
            {lateCheckins.map((lc, i) => (
              <div
                key={lc.id}
                className="bg-rose-500 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-rose-300 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white text-sm">⚠</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wide text-white">⚠ Check-in in ritardo</p>
                  <p className="text-[10px] text-rose-100 truncate">
                    {lc.apartmentName} · doveva iniziare {lc.scheduledTime}
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
          {/* ─ Check-in oggi ─ */}
          <button
            onClick={() => setCheckinsSheetOpen(true)}
            className={`rounded-2xl p-4 border text-left active:scale-95 transition-transform ${
              checkinsCount > 0
                ? "bg-blue-50 border-blue-200 shadow-sm shadow-blue-100"
                : "bg-white border-slate-100 shadow-sm opacity-70"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${checkinsCount > 0 ? "bg-blue-100" : "bg-slate-100"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={checkinsCount > 0 ? "#3b82f6" : "#94a3b8"} strokeWidth="2.5">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </div>
            <p className={`text-3xl font-black leading-none mb-1 ${checkinsCount > 0 ? "text-slate-900" : "text-slate-400"}`}>{checkinsCount}</p>
            <p className={`text-[11px] font-black uppercase tracking-widest ${checkinsCount > 0 ? "text-blue-500" : "text-slate-400"}`}>Check-in Oggi</p>
          </button>

          {/* ─ Pulizie oggi ─ */}
          <button
            onClick={() => { setCleaningsSheetOpen(true); fetchAllCleanings(allCleaningsMonth, allCleaningsApt, allCleaningsStatus); }}
            className={`rounded-2xl p-4 border text-left active:scale-95 transition-transform ${
              cleaningsCount > 0
                ? "bg-white border-slate-100 shadow-sm"
                : "bg-white border-slate-100 shadow-sm opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cleaningsDoneCount === cleaningsCount && cleaningsCount > 0 ? "bg-emerald-100" : "bg-violet-100"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cleaningsDoneCount === cleaningsCount && cleaningsCount > 0 ? "#10b981" : "#7c3aed"} strokeWidth="2.5">
                  <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
                </svg>
              </div>
              {cleaningsDoneCount > 0 && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">{cleaningsDoneCount}/{cleaningsCount} ✓</span>
              )}
            </div>
            <p className={`text-3xl font-black leading-none mb-1 ${cleaningsCount > 0 ? "text-slate-900" : "text-slate-400"}`}>{cleaningsCount}</p>
            <p className={`text-[11px] font-black uppercase tracking-widest ${cleaningsCount > 0 ? "text-violet-500" : "text-slate-400"}`}>{tr.mdCleaningsToday}</p>
          </button>

          {/* ─ Pulizie in ritardo ─ */}
          <button
            onClick={() => setLateCleanSheetOpen(true)}
            className={`rounded-2xl p-4 border text-left active:scale-95 transition-transform ${
              lateCleanings.length > 0
                ? "bg-amber-50 border-amber-300 shadow-sm shadow-amber-100"
                : "bg-white border-slate-100 shadow-sm opacity-70"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${lateCleanings.length > 0 ? "bg-amber-100" : "bg-slate-100"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={lateCleanings.length > 0 ? "#f59e0b" : "#94a3b8"} strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <p className={`text-3xl font-black leading-none mb-1 ${lateCleanings.length > 0 ? "text-amber-600" : "text-slate-400"}`}>{lateCleanings.length}</p>
            <p className={`text-[11px] font-black uppercase tracking-widest ${lateCleanings.length > 0 ? "text-amber-500" : "text-slate-400"}`}>{tr.mdLate}</p>
          </button>

          {/* ─ Pulizie in corso ─ */}
          <button
            onClick={() => setInProgressSheetOpen(true)}
            className={`rounded-2xl p-4 border text-left active:scale-95 transition-transform ${
              cleaningsInProgress.length > 0
                ? "bg-violet-50 border-violet-200 shadow-sm shadow-violet-100"
                : "bg-white border-slate-100 shadow-sm opacity-70"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${cleaningsInProgress.length > 0 ? "bg-violet-100" : "bg-slate-100"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cleaningsInProgress.length > 0 ? "#7c3aed" : "#94a3b8"} strokeWidth="2.5">
                <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
              </svg>
            </div>
            <p className={`text-3xl font-black leading-none mb-1 ${cleaningsInProgress.length > 0 ? "text-violet-700" : "text-slate-400"}`}>{cleaningsInProgress.length}</p>
            <p className={`text-[11px] font-black uppercase tracking-widest ${cleaningsInProgress.length > 0 ? "text-violet-500" : "text-slate-400"}`}>In Corso</p>
          </button>

          {/* ─ Ticket Oggi ─ */}
          <button
            onClick={() => setTicketsSheetOpen(true)}
            className={`rounded-2xl p-4 border text-left active:scale-95 transition-transform ${
              ticketsTodayCount > 0
                ? "bg-orange-50 border-orange-200 shadow-sm shadow-orange-100"
                : "bg-white border-slate-100 shadow-sm opacity-70"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${ticketsTodayCount > 0 ? "bg-orange-100" : "bg-slate-100"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ticketsTodayCount > 0 ? "#f97316" : "#94a3b8"} strokeWidth="2.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              {ticketsDoneCount > 0 && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">{ticketsDoneCount}/{ticketsTodayCount} ✓</span>
              )}
            </div>
            <p className={`text-3xl font-black leading-none mb-1 ${ticketsTodayCount > 0 ? "text-slate-900" : "text-slate-400"}`}>{ticketsTodayCount}</p>
            <p className={`text-[11px] font-black uppercase tracking-widest ${ticketsTodayCount > 0 ? "text-orange-500" : "text-slate-400"}`}>{tr.mdTicketsToday}</p>
          </button>

          {/* Chiedi a IA */}
          <button
            onClick={() => setAiChatOpen(true)}
            className="bg-gradient-to-br from-violet-600 to-blue-500 rounded-2xl p-4 shadow-lg shadow-violet-200 text-left active:scale-95 transition-transform"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-violet-200 mb-1">{tr.mdAssistant}</p>
            <div className="flex items-center gap-2 mt-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-white font-black text-base leading-tight" dangerouslySetInnerHTML={{__html: tr.mdAskAI}} />
            </div>
            <p className="text-violet-200 text-[10px] mt-2">{tr.mdOperationalQuestions}</p>
          </button>
        </div>

        {/* ── PULIZIE IN CORSO ────────────────────────────── */}
        {cleaningsInProgress.length > 0 && (
          <div className="px-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tr.mdCleaningsInProgress}</p>
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

        {/* ── AZIONI RAPIDE ───────────────────────────────── */}
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">{tr.mdQuickActions}</p>
          <div className="flex gap-2.5">
            <Link
              href="/dashboard/manager/cleanings/new"
              className="flex-1 rounded-[20px] p-3.5 flex flex-col gap-2 relative overflow-hidden active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 6px 20px rgba(124,58,237,.35)" }}
            >
              <span className="absolute top-2.5 right-3 text-[20px] font-light text-white/40 leading-none">+</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
                  <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
                </svg>
              </div>
              <p className="text-[13px] font-extrabold text-white leading-tight">{tr.pgNewCleaning}</p>
            </Link>

            <Link
              href="/dashboard/manager/maintenance/new"
              className="flex-1 rounded-[20px] p-3.5 flex flex-col gap-2 relative overflow-hidden active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 6px 20px rgba(5,150,105,.3)" }}
            >
              <span className="absolute top-2.5 right-3 text-[20px] font-light text-white/40 leading-none">+</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <p className="text-[13px] font-extrabold text-white leading-tight">{tr.pgNewTicket}</p>
            </Link>

            <Link
              href="/dashboard/manager/bookings/new"
              className="flex-1 rounded-[20px] p-3.5 flex flex-col gap-2 relative overflow-hidden active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", boxShadow: "0 6px 20px rgba(217,119,6,.3)" }}
            >
              <span className="absolute top-2.5 right-3 text-[20px] font-light text-white/40 leading-none">+</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p className="text-[13px] font-extrabold text-white leading-tight">{tr.pgNewBooking}</p>
            </Link>
          </div>
        </div>

        {/* ── STATO APPARTAMENTI ──────────────────────────── */}
        <div className="px-4 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{tr.mdApartmentsStatus}</p>
          <div className="space-y-2">
            {apartments.map((apt) => (
              <button
                key={apt.id}
                onClick={() => { openApartmentCalendar(apt); setActiveTab("calendar"); }}
                className="w-full bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm border border-slate-100 active:scale-[.98] transition-transform text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotClass(apt.status)}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{apt.name}</p>
                    <p className="text-[10px] text-slate-400">{apt.statusLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusBadgeClass(apt.status)}`}>
                    {apt.statusLabel}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          CALENDAR VIEW — slide in from right
          ════════════════════════════════════════════════════ */}
      {activeTab === "calendar" && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-20 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
          {/* Header calendario */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-slate-100">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{tr.mdChooseApartment}</p>
              <h2 className="text-xl font-bold text-slate-900">{tr.navCalendar}</h2>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 active:bg-slate-200 transition-colors shrink-0"
              aria-label={tr.mdClose}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Apartment list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-24">
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
        <div className="fixed inset-0 bg-[#f8f7ff] z-30 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>

          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-4 pb-0 pt-4">
            {/* Apartment name + status */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${statusDotClass(selectedApt.status)}`} />
              <div className="flex-1 min-w-0">
                <h2 className="text-[19px] font-black text-slate-900 leading-tight">{selectedApt.name}</h2>
                <p className={`text-[10px] font-bold ${statusTextClass(selectedApt.status)}`}>
                  {selectedApt.statusLabel}
                  {selectedApt.openTickets > 0 && <span className="ml-2 text-rose-600">· {selectedApt.openTickets} ticket aperti</span>}
                </p>
              </div>
              <button
                onClick={() => { setSelectedApt(null); setCalendarData(null); }}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 active:bg-slate-200 transition-colors shrink-0"
                aria-label={tr.mdClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 pb-0">
              {(["calendar","bookings","cleanings","tickets"] as const).map((tab) => {
                const labels = { calendar: tr.navCalendar, bookings: tr.navBookings, cleanings: tr.navCleanings, tickets: tr.navTickets };
                return (
                  <button
                    key={tab}
                    onClick={() => setCalendarTab(tab)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-t-xl border-b-2 transition-colors ${
                      calendarTab === tab
                        ? "border-violet-600 text-violet-700 bg-violet-50"
                        : "border-transparent text-slate-500 bg-transparent"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pb-24">
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

              // ── Per-day maps ──────────────────────────────────
              const dayCleaningsMap = new Map<number, CalCleaning[]>();
              const dayTicketsMap   = new Map<number, CalTicket[]>();
              const dayCheckinsMap  = new Map<number, CalCheckin[]>();

              // Array per getApartmentOperationalStatus
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

              // Colori barra per stato appartamento
              const statusBarColor: Record<string, string> = {
                GREEN: "#22c55e", BLUE: "#3b82f6", VIOLET: "#7c3aed",
                YELLOW: "#eab308", RED: "#ef4444",
              };

              // Booking segments: day → [{id, type, guests, showGuests, barColor}]
              type SegType = "ci" | "co" | "occ" | "same";
              const bookingSegments = new Map<number, { id: string; type: SegType; guests: number; showGuests: boolean; barColor: string }[]>();

              calendarData.bookings.forEach((b) => {
                const ciYMD = isoToYMD(b.checkInDate);
                const coYMD = isoToYMD(b.checkOutDate);
                const guests = b.totalGuests ?? 0;
                // Calcola stato operativo prenotazione
                const isActiveNow = todayYMD >= ciYMD && todayYMD < coYMD;
                const targetDate = isActiveNow ? new Date() : new Date(b.checkInDate);
                const bookingStatus = getApartmentOperationalStatus(targetDate, booksForStatus, cleansForStatus, ticketsForStatus);
                const barColor = statusBarColor[bookingStatus.color] ?? "#22c55e";
                let firstOccSet = false;
                for (let d = 1; d <= daysInMonth; d++) {
                  const ymd = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  let type: SegType | null = null;
                  if (ymd === ciYMD && ymd === coYMD) type = "same";
                  else if (ymd === ciYMD)              type = "ci";
                  else if (ymd === coYMD)              type = "co";
                  else if (ymd > ciYMD && ymd < coYMD) type = "occ";
                  if (type) {
                    // Mostra ospiti sul primo giorno OCC (giorno dopo CI), o su "same" se non c'è OCC
                    const isFirstOcc = type === "occ" && !firstOccSet;
                    if (isFirstOcc) firstOccSet = true;
                    const showGuests = type === "same" || isFirstOcc;
                    const arr = bookingSegments.get(d) ?? [];
                    arr.push({ id: b.id, type, guests, showGuests, barColor });
                    bookingSegments.set(d, arr);
                  }
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
              (calendarData.checkins ?? []).forEach((c) => {
                const [cy, cm, cd] = isoToYMD(c.date).split("-").map(Number);
                if (cy === year && cm === month + 1) {
                  const arr = dayCheckinsMap.get(cd) ?? [];
                  arr.push(c);
                  dayCheckinsMap.set(cd, arr);
                }
              });

              // Raggruppa in settimane
              const cells: (number | null)[] = [
                ...Array(startOffset).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ];
              while (cells.length % 7 !== 0) cells.push(null);
              const weeks: (number | null)[][] = [];
              for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

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
                const panelCheckins  = dayCheckinsMap.get(selectedDay) ?? [];
                const total = panelBookings.length + panelCleanings.length + panelTickets.length + panelCheckins.length;
                const dateLabel = new Date(year, month, selectedDay)
                  .toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });

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
                      <div className="py-6 text-center text-sm text-slate-400 italic">{tr.mdNoEventThisDate}</div>
                    ) : (
                      <div>
                        {panelBookings.map((b) => {
                          const isCI = isoToYMD(b.checkInDate) === selYMD;
                          const isCO = isoToYMD(b.checkOutDate) === selYMD;
                          const label = isCI ? "Check-in" : isCO ? "Check-out" : tr.mdInStay;
                          return (
                            <Link key={b.id} href={`/dashboard/manager/bookings/${b.id}/edit`}
                              onClick={() => saveCalendarStateAndNavigate(`/dashboard/manager/bookings/${b.id}/edit`)}
                              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-violet-50/40 last:border-b-0">
                              <div className="w-1 self-stretch rounded-full bg-violet-500 shrink-0" />
                              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 text-base">🏠</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-wide text-violet-600">Prenotazione — {label}</div>
                                <div className="text-[12px] font-bold text-slate-900 truncate">{selectedApt!.name}</div>
                                <div className="text-[9px] text-slate-500">{b.guestName ?? tr.calGuest}{b.totalGuests ? ` · ${b.totalGuests} osp.` : ""}</div>
                                <div className="text-[9px] text-slate-400">{fmtDate(b.checkInDate, dateLocale)} → {fmtDate(b.checkOutDate, dateLocale)}</div>
                              </div>
                              <span className="text-[7px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">{tr.mdConfirmed}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </Link>
                          );
                        })}
                        {panelCleanings.map((c) => {
                          const info = cleaningStatusInfo(c, tr);
                          return (
                            <Link key={c.id} href={`/dashboard/manager/cleanings/${c.id}`}
                              onClick={() => saveCalendarStateAndNavigate(`/dashboard/manager/cleanings/${c.id}`)}
                              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-blue-50/40 last:border-b-0">
                              <div className="w-1 self-stretch rounded-full bg-blue-400 shrink-0" />
                              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-base">🧹</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-wide text-blue-600">{tr.mdSingleCleaning}</div>
                                <div className="text-[12px] font-bold text-slate-900 truncate">{selectedApt!.name}</div>
                                {(() => {
                                  const cleaningDay = isoToYMD(c.date);
                                  const checkinBooking = calendarData!.bookings.find((b) => isoToYMD(b.checkInDate) === cleaningDay);
                                  const guests = checkinBooking?.totalGuests ?? c.booking?.totalGuests;
                                  return <div className="text-[9px] text-slate-500">{guests ? `${guests} ospiti` : "—"}{c.assignedTo ? ` · ${c.assignedTo.name}` : ""}</div>;
                                })()}
                              </div>
                              <span className={`text-[7px] font-bold px-2 py-1 rounded-full shrink-0 ${info.badgeClass}`}>{info.label}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </Link>
                          );
                        })}
                        {panelCheckins.map((c) => {
                          const info = checkinStatusInfo(c, tr);
                          return (
                            <Link key={c.id} href={`/dashboard/manager/checkins/${c.id}`}
                              onClick={() => saveCalendarStateAndNavigate(`/dashboard/manager/checkins/${c.id}`)}
                              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-sky-50/40 last:border-b-0">
                              <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: checkinDotHex(c) }} />
                              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 text-base">🔑</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-wide text-sky-600">Check-in</div>
                                <div className="text-[12px] font-bold text-slate-900 truncate">{selectedApt!.name}</div>
                                <div className="text-[9px] text-slate-500">{c.booking?.guestName ?? tr.calGuest}{c.assignedTo ? ` · ${c.assignedTo.name}` : ""}</div>
                              </div>
                              <span className={`text-[7px] font-bold px-2 py-1 rounded-full shrink-0 ${info.badgeClass}`}>{info.label}</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </Link>
                          );
                        })}
                        {panelTickets.map((t) => {
                          const info = ticketStatusInfo(t, tr);
                          return (
                            <Link key={t.id} href={`/dashboard/manager/maintenance/${t.id}`}
                              onClick={() => saveCalendarStateAndNavigate(`/dashboard/manager/maintenance/${t.id}`)}
                              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-red-50/40 last:border-b-0">
                              <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: info.barHex }} />
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ backgroundColor: info.barHex + "18" }}>🔧</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] font-black uppercase tracking-wide" style={{ color: info.barHex }}>Ticket · {info.label}</div>
                                <div className="text-[12px] font-bold text-slate-900 truncate">{t.title}</div>
                                <div className="text-[9px] text-slate-500">{t.assignedTo?.name ?? tr.mgrUnassignedM}</div>
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
                    <span className="text-base font-black text-slate-900">{new Date(year, month, 1).toLocaleDateString(dateLocale, { month: "long" })} {year}</span>
                    <button onClick={() => changeCalMonth(1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-200">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>

                  {/* Calendar grid — struttura a settimane con pill prenotazione */}
                  <div className="bg-white rounded-2xl pt-2 pb-1 shadow-sm border border-slate-100 mb-3 overflow-hidden">
                    {/* Intestazione giorni */}
                    <div className="grid grid-cols-7" style={{ borderBottom: "2px solid #e2e8f0", borderLeft: "1px solid #e2e8f0" }}>
                      {Array.from({length:7},(_,i)=>new Date(2024,0,1+i).toLocaleDateString(dateLocale,{weekday:"short"})).map((d, i) => (
                        <div
                          key={d}
                          className="text-center text-[8px] font-black uppercase py-1.5"
                          style={{
                            borderRight: "1px solid #e2e8f0",
                            color: i >= 5 ? "#64748b" : "#94a3b8",
                            background: i >= 5 ? "#f4f6f9" : "white",
                          }}
                        >{d}</div>
                      ))}
                    </div>

                    {/* Settimane */}
                    {weeks.map((week, wi) => (
                      <div key={wi} style={{ borderBottom: wi < weeks.length - 1 ? "2px solid #e2e8f0" : undefined }}>
                        {/* Riga numeri */}
                        <div className="grid grid-cols-7" style={{ borderLeft: "1px solid #e2e8f0" }}>
                          {week.map((d, di) => {
                            const isWeekend = di >= 5;
                            if (!d) return (
                              <div key={di} style={{ height: 32, borderRight: "1px solid #e2e8f0", background: isWeekend ? "#f4f6f9" : undefined }} />
                            );
                            const ymd = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                            const isToday = ymd === todayYMD;
                            const isSelected = selectedDay === d;
                            return (
                              <div
                                key={di}
                                onClick={() => setSelectedDay(isSelected ? null : d)}
                                className="flex items-center justify-center cursor-pointer"
                                style={{
                                  height: 32,
                                  borderRight: "1px solid #e2e8f0",
                                  background: isWeekend ? "#f4f6f9" : undefined,
                                  boxShadow: isSelected ? "inset 0 0 0 2px #1e1b4b" : undefined,
                                }}
                              >
                                <span
                                  className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold ${isToday ? "bg-violet-600 text-white font-black" : "text-slate-600"}`}
                                >
                                  {d}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Riga pill prenotazione */}
                        <div className="grid grid-cols-7" style={{ height: 24, borderLeft: "1px solid #e2e8f0" }}>
                          {week.map((d, di) => {
                            const isWeekend = di >= 5;
                            const segs = d ? (bookingSegments.get(d) ?? []) : [];
                            return (
                              <div key={di} className="relative" style={{ height: 24, overflow: "visible", borderRight: "1px solid #e2e8f0", background: isWeekend ? "#f4f6f9" : undefined }}>
                                {segs.map((seg, si) => {
                                  const isLeft  = seg.type === "ci" || seg.type === "same";
                                  const isRight = seg.type === "co" || seg.type === "same";
                                  return (
                                    <div
                                      key={si}
                                      className="absolute flex items-center"
                                      style={{
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        left:  isLeft  ? "50%" : -1,
                                        right: isRight ? "50%" : -1,
                                        height: 18,
                                        background: seg.barColor,
                                        borderRadius: seg.type === "ci" ? "9px 0 0 9px" :
                                                      seg.type === "co" ? "0 9px 9px 0" :
                                                      seg.type === "same" ? 9 : 0,
                                        zIndex: 10,
                                        overflow: "hidden",
                                      }}
                                    >
                                      {seg.showGuests && seg.guests > 0 && (
                                        <span className="pl-2 whitespace-nowrap text-white" style={{ fontSize: 8, fontWeight: 800 }}>
                                          👤 {seg.guests}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>

                        {/* Riga dot pulizie/ticket */}
                        <div className="grid grid-cols-7" style={{ height: 14, borderLeft: "1px solid #e2e8f0" }}>
                          {week.map((d, di) => {
                            const isWeekend = di >= 5;
                            const cleans  = d ? (dayCleaningsMap.get(d) ?? []) : [];
                            const tickets = d ? (dayTicketsMap.get(d) ?? []) : [];
                            const checkins = d ? (dayCheckinsMap.get(d) ?? []) : [];
                            return (
                              <div key={di} className="flex items-center justify-center gap-[2px]" style={{ borderRight: "1px solid #e2e8f0", background: isWeekend ? "#f4f6f9" : undefined }}>
                                {cleans.map((c, ci) => (
                                  <span key={ci} style={{ width: 5, height: 5, borderRadius: "50%", background: cleaningDotHex(c), display: "block", flexShrink: 0 }} />
                                ))}
                                {checkins.map((c, ci) => (
                                  <span key={`k${ci}`} style={{ width: 5, height: 5, borderRadius: "50%", background: checkinDotHex(c), display: "block", flexShrink: 0, boxShadow: "0 0 0 1px #fff" }} />
                                ))}
                                {tickets.map((t, ti) => (
                                  <span key={ti} style={{ width: 5, height: 5, borderRadius: "50%", background: ticketDotHex(t), display: "block", flexShrink: 0 }} />
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pannello giorno selezionato */}
                  <SelectedDayPanel />

                  {/* ── Legenda ── */}
                  <div className="mb-4 space-y-2">

                    {/* Stato Appartamento */}
                    <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">{tr.mdApartmentStatus}</p>
                      <div className="space-y-1.5">
                        {([
                          { color: "#22c55e", label: tr.calReady,      textColor: "#15803d" },
                          { color: "#3b82f6", label: tr.calNotReady,  textColor: "#1d4ed8" },
                          { color: "#7c3aed", label: tr.calInProgress,    textColor: "#6d28d9" },
                          { color: "#eab308", label: tr.calInReview, textColor: "#a16207" },
                          { color: "#ef4444", label: tr.calOccupied,    textColor: "#b91c1c" },
                        ] as const).map(({ color, label, textColor }) => (
                          <div key={label} className="flex items-center gap-2">
                            <div className="flex shrink-0" style={{ height: 14 }}>
                              <div style={{ width: 14, background: color, borderRadius: "7px 0 0 7px" }} />
                              <div style={{ width: 20, background: color }} />
                              <div style={{ width: 14, background: color, borderRadius: "0 7px 7px 0" }} />
                            </div>
                            <span className="text-[9px] font-bold" style={{ color: textColor }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pulizie */}
                    <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">{tr.navCleanings}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        {([
                          { hex: "#eab308", label: tr.stTicketWaiting },
                          { hex: "#f43f5e", label: tr.mgrUnassignedF },
                          { hex: "#f97316", label: tr.mdLate },
                          { hex: "#7c3aed", label: tr.mdInProgressReview },
                          { hex: "#22c55e", label: tr.calCompleted },
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
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">{tr.mdMaintTickets}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        {([
                          { hex: "#ef4444", label: "Urgente" },
                          { hex: "#f97316", label: tr.mdNotUrgent },
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

                </div>
              );
            })()}

            {!calendarLoading && calendarData && calendarTab === "bookings" && (() => {
              const selYMD = selectedDay
                ? `${calMonth.year}-${String(calMonth.month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`
                : null;
              const dayLabel = selectedDay
                ? new Date(calMonth.year, calMonth.month, selectedDay)
                    .toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" })
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
                  {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">{tr.mdTapDay}</div>}
                  {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">{tr.mdNoBookingThisDate}</div>}
                  {items.map((b) => (
                    <Link key={b.id} href={`/dashboard/manager/bookings/${b.id}/edit`} onClick={() => saveCalendarStateAndNavigate(`/dashboard/manager/bookings/${b.id}/edit`)} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform">
                      <div className="h-1 bg-violet-500" />
                      <div className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{selectedApt!.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{b.guestName ?? tr.calGuest}</p>
                            <p className="text-[10px] text-slate-500">Check-in: {fmtDateFull(b.checkInDate, dateLocale)}</p>
                            <p className="text-[10px] text-slate-500">Check-out: {fmtDateFull(b.checkOutDate, dateLocale)}</p>
                            {b.totalGuests && <p className="text-[10px] text-slate-500">{b.totalGuests} ospiti · {diffDays(b.checkInDate, b.checkOutDate)} notti</p>}
                            {b.notes && <p className="text-[10px] text-slate-400 mt-1 italic">{b.notes}</p>}
                          </div>
                          <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">{tr.mdConfirmed}</span>
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
                    .toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" })
                : null;
              const items = selYMD
                ? calendarData.cleanings.filter((c) => isoToYMD(c.date) === selYMD)
                : [];
              return (
                <div className="px-4 pt-4 space-y-3">
                  {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
                  {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">{tr.mdTapDay}</div>}
                  {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">{tr.mdNoCleaningThisDate}</div>}
                  {items.map((c) => (
                    <Link key={c.id} href={`/dashboard/manager/cleanings/${c.id}`} onClick={() => saveCalendarStateAndNavigate(`/dashboard/manager/cleanings/${c.id}`)} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform">
                      <div className="h-1 bg-blue-400" />
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-lg">🧹</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">{selectedApt!.name}</p>
                          {(() => {
                            const cleaningDay = isoToYMD(c.date);
                            const checkinBooking = calendarData!.bookings.find((b) => isoToYMD(b.checkInDate) === cleaningDay);
                            const guests = checkinBooking?.totalGuests ?? c.booking?.totalGuests;
                            return guests ? <p className="text-[10px] text-slate-500">{guests} ospiti</p> : null;
                          })()}
                          {c.assignedTo && <p className="text-[10px] text-slate-400">{c.assignedTo.name}</p>}
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-1 rounded-full shrink-0 ${cleaningStatusColor(c.status)}`}>{statusLabel(c.status, false, tr)}</span>
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
                    .toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" })
                : null;
              const items = selYMD
                ? calendarData.tickets.filter((t) => isoToYMD(t.scheduledStart ?? t.createdAt) === selYMD)
                : [];
              return (
                <div className="px-4 pt-4 space-y-3">
                  {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
                  {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">{tr.mdTapDay}</div>}
                  {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">{tr.mdNoTicketThisDate}</div>}
                  {items.map((t) => (
                    <Link key={t.id} href={`/dashboard/manager/maintenance/${t.id}`} onClick={() => saveCalendarStateAndNavigate(`/dashboard/manager/maintenance/${t.id}`)} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform">
                      <div className="h-1 bg-rose-400" />
                      <div className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-900 flex-1 min-w-0">{t.title}</p>
                          <span className={`text-[8px] font-bold px-2 py-1 rounded-full shrink-0 ${ticketPriorityColor(t.priority)}`}>
                            {t.priority ?? "Normal"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">Stato: {statusLabel(t.status, false, tr)}</p>
                        {t.assignedTo && <p className="text-[10px] text-slate-500">Assegnato a {t.assignedTo.name}</p>}
                        {t.scheduledStart && <p className="text-[10px] text-slate-500">Previsto: {fmtDateFull(t.scheduledStart, dateLocale)}</p>}
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
                  <p className="text-xs font-black text-slate-800">{tr.mdManager}</p>
                  <p className="text-[10px] text-slate-400">{tr.mdOperationalDash}</p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

              {/* NAVIGAZIONE label */}
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 mb-2">{tr.mdNavigation}</p>

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
                  <p className="text-[10px] text-slate-400">{tr.mdMainView}</p>
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
                  <p className={`text-sm font-bold ${activeTab === "calendar" ? "text-violet-700" : "text-slate-700"}`}>{tr.navCalendar}</p>
                  <p className="text-[10px] text-slate-400">{tr.mdPerApartment}</p>
                </div>
              </button>

              <div
                onClick={() => { closeSidebar(); requestAnimationFrame(() => router.push("/dashboard/manager/messages")); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 relative">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white leading-none">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">{tr.navMessages}</p>
                  <p className="text-[10px] text-slate-400">{tr.mdChatTeam}</p>
                </div>
                {unreadMessagesCount > 0 && (
                  <span className="min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-rose-200">
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </span>
                )}
              </div>

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
                  <p className="text-sm font-bold text-slate-700">{tr.mdSearch}</p>
                  <p className="text-[10px] text-slate-400">Appartamenti, ospiti…</p>
                </div>
              </button>

              <div
                onClick={() => { closeSidebar(); requestAnimationFrame(() => router.push("/dashboard/manager/apartments")); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{tr.navApartments}</p>
                  <p className="text-[10px] text-slate-400">{tr.mdPropertyList}</p>
                </div>
              </div>

              <div
                onClick={() => { closeSidebar(); requestAnimationFrame(() => router.push("/dashboard/manager/users")); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{tr.navTeam}</p>
                  <p className="text-[10px] text-slate-400">{tr.mdCollabMgmt}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="my-3 h-px bg-slate-100 mx-2" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 mb-2">{tr.mdCreateNew}</p>

              <div
                onClick={() => { closeSidebar(); requestAnimationFrame(() => router.push("/dashboard/manager/cleanings/new")); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-violet-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">{tr.pgNewCleaning}</p>
              </div>

              <div
                onClick={() => { closeSidebar(); requestAnimationFrame(() => router.push("/dashboard/manager/maintenance/new")); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">{tr.pgNewTicket}</p>
              </div>

              <div
                onClick={() => { closeSidebar(); requestAnimationFrame(() => router.push("/dashboard/manager/bookings/new")); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">{tr.pgNewBooking}</p>
              </div>

              <div
                onClick={() => { closeSidebar(); requestAnimationFrame(() => router.push("/dashboard/manager/apartments/new")); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">{tr.mdNewApartment}</p>
              </div>
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
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{tr.navToday}</p>
              <h2 className="text-xl font-bold text-slate-900">
                {checkinsCount > 0 ? `${checkinsCount} check-in` : "Nessun check-in oggi"}
              </h2>
            </div>
            <button
              onClick={() => setCheckinsSheetOpen(false)}
              className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-24">
            {checkinsItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">Nessun check-in previsto per oggi</div>
            )}
            {checkinsItems.map((item) => (
              <div
                key={item.id}
                onClick={() => { setCheckinsSheetOpen(false); requestAnimationFrame(() => router.push(item.href)); }}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform cursor-pointer"
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TUTTE LE PULIZIE SHEET
          ════════════════════════════════════════════════════ */}
      {cleaningsSheetOpen && (() => {
        // Raggruppa per data (giorno)
        const grouped: Record<string, AllCleaningItem[]> = {};
        allCleaningsData.forEach((item) => {
          const d = new Date(item.date);
          const key = d.toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });
        const groupKeys = Object.keys(grouped);

        // Mesi disponibili: mese corrente + 11 mesi futuri
        const monthOptions: { value: string; label: string }[] = [];
        const base = new Date();
        base.setDate(1);
        for (let i = -3; i <= 8; i++) {
          const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
          const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const label = d.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });
          monthOptions.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
        }

        const statusOptions = [
          { value: "ALL", label: "Tutte" },
          { value: "PENDING", label: tr.stTicketWaiting },
          { value: "IN_PROGRESS", label: tr.calInProgress },
          { value: "AWAITING_REVIEW", label: "Revisione" },
          { value: "COMPLETED", label: tr.mdCompletedPlural },
          { value: "APPROVED", label: tr.mdApprovedPlural },
        ];

        function barColor(status: string, assigned: boolean) {
          if (status === "APPROVED") return "bg-emerald-500";
          if (status === "AWAITING_REVIEW") return "bg-amber-400";
          if (status === "COMPLETED") return "bg-sky-400";
          if (status === "IN_PROGRESS") return "bg-violet-500";
          if (assigned) return "bg-yellow-400";
          return "bg-red-400";
        }

        return (
          <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
            {/* Header */}
            <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-[#ede9fe] shrink-0">
              <span className="text-lg font-bold text-slate-900">{tr.navCleanings}</span>
              <button
                onClick={() => setCleaningsSheetOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Filtri riga 1: appartamento + mese */}
            <div className="px-4 py-2 flex gap-2 border-b border-[#ede9fe] shrink-0">
              <select
                value={allCleaningsApt}
                onChange={(e) => { setAllCleaningsApt(e.target.value); fetchAllCleanings(allCleaningsMonth, e.target.value, allCleaningsStatus); }}
                className="flex-1 text-[12px] font-bold py-2 px-3 rounded-xl border border-[#ede9fe] bg-white text-violet-700 min-w-0 appearance-none"
              >
                <option value="ALL">{tr.mdAllApartments}</option>
                {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select
                value={allCleaningsMonth}
                onChange={(e) => { setAllCleaningsMonth(e.target.value); fetchAllCleanings(e.target.value, allCleaningsApt, allCleaningsStatus); }}
                className="flex-1 text-[12px] font-bold py-2 px-3 rounded-xl border border-[#ede9fe] bg-white text-violet-700 min-w-0 appearance-none"
              >
                {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* Filtri riga 2: stato pills */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b border-[#ede9fe] shrink-0 scrollbar-hide">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setAllCleaningsStatus(opt.value); fetchAllCleanings(allCleaningsMonth, allCleaningsApt, opt.value); }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap border transition-all ${
                    allCleaningsStatus === opt.value
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-500 border-[#ede9fe]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto pb-24">
              {allCleaningsLoading ? (
                <div className="px-5 py-4 space-y-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="h-1 bg-slate-100 animate-pulse" />
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-100 animate-pulse rounded w-3/4" />
                          <div className="h-2 bg-slate-100 animate-pulse rounded w-1/2" />
                        </div>
                        <div className="w-16 h-6 bg-slate-100 animate-pulse rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : groupKeys.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">{tr.mdNoCleaningFound}</div>
              ) : (
                <div className="px-5 py-4 space-y-5">
                  {groupKeys.map((dayLabel) => (
                    <div key={dayLabel}>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 capitalize">{dayLabel}</p>
                      <div className="space-y-2">
                        {grouped[dayLabel].map((item) => {
                          const assigned = !!item.assignedToName;
                          const bc = barColor(item.status, assigned);
                          const badgeClass = unifiedStatusColor(item.status, assigned);
                          const lbl = statusLabel(item.status, assigned, tr);
                          const timeStr = new Date(item.date).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" });
                          const iconBg = item.status === "APPROVED" ? "bg-emerald-50"
                            : item.status === "AWAITING_REVIEW" ? "bg-amber-50"
                            : item.status === "COMPLETED" ? "bg-sky-50"
                            : item.status === "IN_PROGRESS" ? "bg-violet-100"
                            : assigned ? "bg-yellow-50"
                            : "bg-red-50";
                          const iconStroke = item.status === "APPROVED" ? "#10b981"
                            : item.status === "AWAITING_REVIEW" ? "#f59e0b"
                            : item.status === "COMPLETED" ? "#38bdf8"
                            : item.status === "IN_PROGRESS" ? "#7c3aed"
                            : assigned ? "#eab308"
                            : "#ef4444";
                          return (
                            <div
                              key={item.id}
                              onClick={() => { sessionStorage.setItem("returnToSheet", "cleanings"); setCleaningsSheetOpen(false); requestAnimationFrame(() => router.push(item.href)); }}
                              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform cursor-pointer"
                            >
                              <div className={`h-1 ${bc}`} />
                              <div className="px-4 py-3 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2.5">
                                    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
                                    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">{item.apartmentName}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{item.assignedToName ?? tr.mgrUnassignedF} · {timeStr}</p>
                                </div>
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${badgeClass}`}>{lbl}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════════════
          TICKET OGGI SHEET
          ════════════════════════════════════════════════════ */}
      {ticketsSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">{tr.navMaintenance}</p>
              <h2 className="text-xl font-bold text-slate-900">
                {ticketsTodayItems.length > 0
                  ? `${ticketsTodayItems.length} ticket oggi`
                  : tr.kpiEmptyTickets}
              </h2>
            </div>
            <button
              onClick={() => setTicketsSheetOpen(false)}
              className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-24">
            {ticketsTodayItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                ✓ Nessun ticket per oggi
              </div>
            )}
            {ticketsTodayItems.map((ticket) => {
              const badgeClass = unifiedStatusColor(ticket.status, ticket.isAssigned);
              const ticketStatusLabel = statusLabel(ticket.status, ticket.isAssigned, tr);
              const barColor = ticket.status === "APPROVED" ? "bg-emerald-400"
                : ["AWAITING_REVIEW","RESOLVED"].includes(ticket.status) ? "bg-amber-400"
                : ticket.status === "IN_PROGRESS" ? "bg-violet-500"
                : ticket.isAssigned ? "bg-yellow-400"
                : "bg-red-400";
              return (
                <div
                  key={ticket.id}
                  onClick={() => { sessionStorage.setItem("returnToSheet", "tickets"); setTicketsSheetOpen(false); requestAnimationFrame(() => router.push(ticket.href)); }}
                  className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform cursor-pointer"
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
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${badgeClass}`}>
                      {ticketStatusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PULIZIE IN RITARDO SHEET
          ════════════════════════════════════════════════════ */}
      {lateCleanSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">{tr.mdWarning}</p>
              <h2 className="text-xl font-bold text-slate-900">
                {lateCleanings.length > 0
                  ? `${lateCleanings.length} pulizie in ritardo`
                  : tr.kpiEmptyLate}
              </h2>
            </div>
            <button
              onClick={() => setLateCleanSheetOpen(false)}
              className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-24">
            {lateCleanings.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                ✓ Nessuna pulizia in ritardo
              </div>
            )}
            {lateCleanings.map((c) => (
              <div
                key={c.id}
                onClick={() => { sessionStorage.setItem("returnToSheet", "cleanings"); setLateCleanSheetOpen(false); requestAnimationFrame(() => router.push(c.href)); }}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform cursor-pointer"
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
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 bg-orange-50 text-orange-700">
                    In ritardo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PULIZIE IN CORSO SHEET
          ════════════════════════════════════════════════════ */}
      {inProgressSheetOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{tr.mdRunning}</p>
              <h2 className="text-xl font-bold text-slate-900">
                {cleaningsInProgress.length > 0
                  ? `${cleaningsInProgress.length} pulizie in corso`
                  : tr.kpiEmptyInProgress}
              </h2>
            </div>
            <button
              onClick={() => setInProgressSheetOpen(false)}
              className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-24">
            {cleaningsInProgress.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                Nessuna pulizia in corso
              </div>
            )}
            {cleaningsInProgress.map((c) => (
              <div
                key={c.id}
                onClick={() => { sessionStorage.setItem("returnToSheet", "cleanings"); setInProgressSheetOpen(false); requestAnimationFrame(() => router.push(c.href)); }}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform cursor-pointer"
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
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 bg-violet-50 text-violet-700">
                    In corso
                  </span>
                </div>
              </div>
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
          SETTINGS SHEET
          ════════════════════════════════════════════════════ */}
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* ════════════════════════════════════════════════════
          EVENTS DRAWER — slide up
          ════════════════════════════════════════════════════ */}
      {eventsOpen && (
        <div className="fixed inset-0 bg-[#f8f7ff] z-40 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
          <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Oggi — Da completare</p>
              <h2 className="text-xl font-bold text-slate-900">
                {pendingCount > 0 ? `${pendingCount} eventi pendenti` : tr.mdNoPendingEvent}
              </h2>
            </div>
            <button
              onClick={() => setEventsOpen(false)}
              className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 pb-24">
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
                        {ev.type === "CLEANING" ? "Pulizia" : tr.navMaintenance}
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
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col" style={{ paddingTop: "calc(env(safe-area-inset-top) + 58px)" }}>
          <div className="px-5 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">{tr.mdGeoMap}</p>
              <h2 className="text-lg font-bold text-white">{tr.mdAppsLive}</h2>
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
              <h2 className="text-lg font-bold text-slate-900">{tr.mdSearch}</h2>
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
                <p className="text-center text-slate-400 text-sm py-4">{tr.mdNoResults}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

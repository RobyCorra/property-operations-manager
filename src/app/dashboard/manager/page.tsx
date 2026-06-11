import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/src/lib/tenant";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { getNotifications } from "@/src/app/actions/notification";

import UpcomingEventsPanel from "@/src/components/upcoming-events-panel";
import type { OperationalEvent } from "@/src/components/operational-event-card";
import NotificationBell from "@/src/components/notification-bell";
import TimelineCalendar from "@/src/components/timeline-calendar";
import DashboardKpiCards, { type KpiPopupItem } from "@/src/components/dashboard-kpi-cards";
import { getApartmentOperationalStatus } from "@/src/lib/apartment-status";
import MobileDashboard from "@/src/components/mobile-dashboard";
import type {
  MobileApartmentData,
  MobileLateClean,
  MobileInProgressClean,
  MobileTodayEvent,
  MobileCheckinItem,
  MobileCleaningTodayItem,
  MobileUrgentTicketItem,
  CalBooking,
  CalCleaning,
  CalTicket,
  CalendarData,
} from "@/src/components/mobile-dashboard";
import {
  Brush,
  Ticket,
  KeyRound,
} from "@/src/components/icons";
import { getUnreadMessagesCount } from "@/src/app/actions/messages";

const isMaintenanceActive = (ticket: { status: string }) => {
  return !["RESOLVED", "CANCELLED", "APPROVED"].includes(ticket.status);
};


const formatLocalDateKey = (date: Date | string) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type BookingView = {
  id: string;
  apartmentId: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  guestName: string | null;
  status: string | null;
  totalGuests?: number | null;
  cullaRequested?: boolean | null;
  notes?: string | null;
  source?: string | null;
  externalId?: string | null;
  apartment: {
    name: string;
    address: string;
  };
};

type CleaningView = {
  id: string;
  apartmentId: string;
  date: Date | string;
  status: string;
  checklistProgress: unknown;
  apartment: {
    name: string;
  };
  assignedTo: {
    name: string;
  } | null;
  booking?: { guestName: string | null; totalGuests: number | null } | null;
};

type TicketView = {
  id: string;
  apartmentId: string;
  scheduledStart: Date | string | null;
  resolvedAt: Date | string | null;
  createdAt: Date | string;
  title: string;
  status: string;
  priority?: string | null;
  apartment: {
    name: string;
  };
  assignedTo: {
    name: string;
  } | null;
};

type ApartmentView = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export default async function ManagerDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();

  // Fetch all necessary data
  const [org, apartments, bookings, cleanings, tickets, initialNotifications, unreadMessagesCount] = await Promise.all([
    orgId ? prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }) : null,
    prisma.apartment.findMany({ where: { organizationId: orgId } }),
    prisma.booking.findMany({
      where: { status: { not: "CANCELLED" }, apartment: { organizationId: orgId } },
      include: { apartment: true }
    }),
    prisma.cleaningTask.findMany({
      where: { status: { not: "CANCELLED" }, apartment: { organizationId: orgId } },
      include: {
        apartment: true,
        assignedTo: true,
        booking: {
            select: {
                guestName: true,
                totalGuests: true
            }
        }
      }
    }),
    prisma.maintenanceTicket.findMany({
      where: { status: { not: "CANCELLED" }, apartment: { organizationId: orgId } },
      include: { apartment: true, assignedTo: true },
    }),
    getNotifications(),
    getUnreadMessagesCount(),
  ]);

  const now = new Date();
  const serverDate = now.toISOString();
  const todayStr = now.toISOString().split('T')[0];
  const todayLocalStr = formatLocalDateKey(now);
  // Logic for Check-ins Today
  const checkinsToday = bookings.filter((b: BookingView) => {
    const checkin = new Date(b.checkInDate).toISOString().split('T')[0];
    return checkin === todayStr;
  });

  const cleaningsToday = cleanings.filter((c: CleaningView) => {
    const cleaningDate = formatLocalDateKey(c.date);
    return cleaningDate === todayLocalStr;
  });

  // Late: status PENDING and now > scheduled time + 30 minutes
  const lateCleanings = cleanings.filter((c: CleaningView) => {
    if (c.status !== "PENDING") return false;
    const scheduledTime = new Date(c.date);
    return now.getTime() > scheduledTime.getTime() + 30 * 60 * 1000;
  });
  const lateCleaningIds = new Set(lateCleanings.map((cleaning: CleaningView) => cleaning.id));

  // Data Normalization for Timeline
  const allEvents: OperationalEvent[] = [];
  cleanings.forEach((c: CleaningView) => {
    allEvents.push({
      id: `clean-${c.id}`,
      type: "CLEANING",
      date: new Date(c.date),
      apartmentName: c.apartment.name,
      subject: "Intervento di Pulizia",
      status: c.status,
      statusLabel: c.status === "PENDING" ? "Da Fare" : c.status === "IN_PROGRESS" ? "In Corso" : "Completata",
      actorName: c.assignedTo?.name || "Non assegnato",
      isLateCleaning: lateCleaningIds.has(c.id)
    });
  });

  tickets.forEach((t: TicketView) => {
    if (t.scheduledStart) {
      allEvents.push({
        id: `maint-${t.id}`,
        type: "MAINTENANCE",
        date: new Date(t.scheduledStart),
        apartmentName: t.apartment.name,
        subject: t.title,
        status: t.status,
        statusLabel: t.status === "PENDING" ? "In attesa" : t.status === "IN_PROGRESS" ? "In Carico" : "Risolto",
        actorName: t.assignedTo?.name || "Non assegnato"
      });
    }
  });

  bookings.forEach((b: BookingView) => {
    allEvents.push({
      id: `in-${b.id}`,
      type: "CHECKIN",
      date: new Date(b.checkInDate),
      apartmentName: b.apartment.name,
      subject: `Arrivo di ${b.guestName}`,
      status: b.status || "ACTIVE",
      actorName: b.guestName ?? undefined
    });
    allEvents.push({
      id: `out-${b.id}`,
      type: "CHECKOUT",
      date: new Date(b.checkOutDate),
      apartmentName: b.apartment.name,
      subject: `Partenza di ${b.guestName}`,
      status: b.status || "ACTIVE",
      actorName: b.guestName ?? undefined
    });
  });

  allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  const apartmentsData = apartments.map((apartment: ApartmentView) => {
    const aptBookings = bookings.filter((b: BookingView) => b.apartmentId === apartment.id);
    const aptCleanings = cleanings.filter((c: CleaningView) => c.apartmentId === apartment.id);
    const aptTickets = tickets.filter((t: TicketView) => t.apartmentId === apartment.id);
    const statusInfo = getApartmentOperationalStatus(serverDate, aptBookings, aptCleanings, aptTickets, { now });
    return {
      ...apartment,
      status: statusInfo.color,
      statusLabel: statusInfo.label,
      statusReason: statusInfo.reason,
      openTickets: aptTickets.filter((t: TicketView) => isMaintenanceActive(t)).length,
    };
  });
  // ── Calendar bookings per TimelineCalendar ────────────────────────────
  const calendarBookings = bookings.map((b: BookingView) => ({
    id: b.id,
    apartmentId: b.apartmentId,
    guestName: b.guestName ?? "",
    checkInDate: b.checkInDate,
    checkOutDate: b.checkOutDate,
    totalGuests: b.totalGuests ?? 0,
    cullaRequested: b.cullaRequested ?? false,
    status: b.status ?? undefined,
    source: b.source ?? undefined,
    externalId: b.externalId ?? undefined,
    apartment: b.apartment,
  }));

  // ── Mobile dashboard data ─────────────────────────────────────────────
  const mobileApartments: MobileApartmentData[] = apartmentsData.map((a) => ({
    id: a.id,
    name: a.name,
    address: a.address,
    latitude: a.latitude,
    longitude: a.longitude,
    status: a.status,
    statusLabel: a.statusLabel,
    openTickets: a.openTickets,
  }));

  const mobileLateCleanings: MobileLateClean[] = lateCleanings.map((c: CleaningView) => {
    const d = new Date(c.date);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return {
      id: c.id,
      apartmentName: c.apartment.name,
      assignedToName: c.assignedTo?.name ?? "Non assegnata",
      scheduledTime: `${h}:${m}`,
      href: `/dashboard/manager/cleanings/${c.id}/edit`,
    };
  });

  type ChecklistItem = { label: string; completed: boolean };
  const mobileCleaningsInProgress: MobileInProgressClean[] = cleaningsToday
    .filter((c: CleaningView) => c.status === "IN_PROGRESS")
    .map((c: CleaningView) => {
      const progress = Array.isArray(c.checklistProgress)
        ? (c.checklistProgress as ChecklistItem[])
        : [];
      const d = new Date(c.date);
      const h = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return {
        id: c.id,
        apartmentName: c.apartment.name,
        assignedToName: c.assignedTo?.name ?? "Non assegnata",
        startTime: `${h}:${mm}`,
        progressDone: progress.filter((i) => i.completed).length,
        progressTotal: progress.length,
        href: `/dashboard/manager/cleanings/${c.id}/edit`,
      };
    });

  // Today's pending events for the mobile events drawer
  const mobileTodayEvents: MobileTodayEvent[] = [];
  cleaningsToday
    .filter((c: CleaningView) => c.status === "PENDING" || c.status === "IN_PROGRESS")
    .forEach((c: CleaningView) => {
      const d = new Date(c.date);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      mobileTodayEvents.push({
        id: `clean-${c.id}`,
        type: "CLEANING",
        time: `${h}:${m}`,
        apartmentName: c.apartment.name,
        subject: "Pulizia",
        actorName: c.assignedTo?.name ?? "Non assegnata",
        status: c.status,
        href: `/dashboard/manager/cleanings/${c.id}/edit`,
      });
    });
  tickets
    .filter((t: TicketView) => {
      if (!t.scheduledStart) return false;
      const scheduledDate = formatLocalDateKey(t.scheduledStart);
      return scheduledDate === todayLocalStr;
    })
    .forEach((t: TicketView) => {
      mobileTodayEvents.push({
        id: `maint-${t.id}`,
        type: "MAINTENANCE",
        time: null,
        apartmentName: t.apartment.name,
        subject: t.title,
        actorName: t.assignedTo?.name ?? "Non assegnato",
        status: t.status,
        href: `/dashboard/manager/maintenance/${t.id}/edit`,
        isUrgent: true,
      });
    });

  const mobileDateLabel = now.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Ticket urgenti per il sheet mobile (solo attivi — escludi RESOLVED)
  const mobileUrgentTicketsItems: MobileUrgentTicketItem[] = tickets
    .filter((t: TicketView) => isMaintenanceActive(t))
    .map((t: TicketView) => ({
      id: t.id,
      title: t.title,
      apartmentName: t.apartment.name,
      isAssigned: !!t.assignedTo,
      status: t.status,
      href: `/dashboard/manager/maintenance/${t.id}/edit`,
    }));

  // Pulizie oggi completate (cleaner ha finito)
  const cleaningsDoneCount = cleaningsToday.filter((c: CleaningView) =>
    ["COMPLETED", "AWAITING_REVIEW", "APPROVED"].includes(c.status)
  ).length;

  // Check-in di oggi per il sheet mobile
  const mobileCheckinsItems: MobileCheckinItem[] = checkinsToday.map((b: BookingView) => ({
    id: b.id,
    guestName: b.guestName ?? "Ospite",
    apartmentName: b.apartment.name,
    href: `/dashboard/manager/bookings/${b.id}/edit`,
  }));

  // Pulizie di oggi per il sheet mobile
  const mobileCleaningsTodayItems: MobileCleaningTodayItem[] = cleaningsToday.map((c: CleaningView) => ({
    id: c.id,
    apartmentName: c.apartment.name,
    assignedToName: c.assignedTo?.name ?? "Non assegnata",
    isAssigned: !!c.assignedTo,
    status: c.status,
    href: `/dashboard/manager/cleanings/${c.id}/edit`,
  }));

  // KPI popup items
  const checkinsKpi: KpiPopupItem[] = checkinsToday.map((b: BookingView) => ({
    id: b.id,
    label: b.guestName || "Ospite",
    sublabel: b.apartment.name,
    href: `/dashboard/manager/bookings/${b.id}/edit`,
  }));
  const cleaningsTodayKpi: KpiPopupItem[] = cleaningsToday.map((c: CleaningView) => ({
    id: c.id,
    label: c.apartment.name,
    sublabel: c.assignedTo?.name || "Non assegnato",
    href: `/dashboard/manager/cleanings/${c.id}/edit`,
  }));
  const lateCleaningsKpi: KpiPopupItem[] = lateCleanings.map((c: CleaningView) => ({
    id: c.id,
    label: c.apartment.name,
    sublabel: c.assignedTo?.name || "Non assegnato",
    href: `/dashboard/manager/cleanings/${c.id}/edit`,
  }));
  const cleaningsInProgressKpi: KpiPopupItem[] = cleaningsToday
    .filter((c: CleaningView) => c.status === "IN_PROGRESS")
    .map((c: CleaningView) => ({
      id: c.id,
      label: c.apartment.name,
      sublabel: c.assignedTo?.name || "Non assegnato",
      href: `/dashboard/manager/cleanings/${c.id}/edit`,
    }));
  // Tickets di oggi: scheduledStart = oggi, oppure (nessun scheduledStart e createdAt = oggi)
  const ticketsToday = tickets.filter((t: TicketView) => {
    const refDate = t.scheduledStart ?? t.createdAt;
    return formatLocalDateKey(refDate) === todayLocalStr;
  });
  // Popup: tutti i ticket di oggi (aperti + risolti)
  const urgentTicketsKpi: KpiPopupItem[] = ticketsToday
    .map((t: TicketView) => ({
      id: t.id,
      label: t.title,
      sublabel: t.apartment.name,
      href: `/dashboard/manager/maintenance/${t.id}/edit`,
    }));
  const ticketsTodayCount = ticketsToday.length;
  const ticketsDoneCount = ticketsToday.filter((t: TicketView) =>
    ["RESOLVED", "APPROVED"].includes(t.status)
  ).length;

  // Ticket di oggi per il sheet mobile (tutti — aperti + risolti)
  const mobileTicketsTodayItems: MobileUrgentTicketItem[] = ticketsToday
    .map((t: TicketView) => ({
      id: t.id,
      title: t.title,
      apartmentName: t.apartment.name,
      isAssigned: !!t.assignedTo,
      status: t.status,
      href: `/dashboard/manager/maintenance/${t.id}/edit`,
    }));

  // ── Calendar data per apartment (server-side, avoids client fetch auth issues) ──
  const mobileCalendarByApt: Record<string, CalendarData> = {};
  for (const apt of apartments) {
    const calBookings: CalBooking[] = bookings
      .filter((b: BookingView) => b.apartmentId === apt.id)
      .map((b: BookingView) => ({
        id: b.id,
        guestName: b.guestName,
        checkInDate: new Date(b.checkInDate).toISOString(),
        checkOutDate: new Date(b.checkOutDate).toISOString(),
        totalGuests: b.totalGuests ?? null,
        status: b.status,
        notes: b.notes ?? null,
      }));
    const calCleanings: CalCleaning[] = cleanings
      .filter((c: CleaningView) => c.apartmentId === apt.id)
      .map((c: CleaningView) => ({
        id: c.id,
        date: new Date(c.date).toISOString(),
        status: c.status,
        assignedTo: c.assignedTo ? { name: c.assignedTo.name } : null,
        booking: c.booking
          ? { guestName: c.booking.guestName, totalGuests: c.booking.totalGuests ?? null }
          : null,
      }));
    const calTickets: CalTicket[] = tickets
      .filter((t: TicketView) => t.apartmentId === apt.id)
      .map((t: TicketView) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority ?? null,
        createdAt: new Date(t.createdAt).toISOString(),
        scheduledStart: t.scheduledStart ? new Date(t.scheduledStart).toISOString() : null,
        assignedTo: t.assignedTo ? { name: t.assignedTo.name } : null,
      }));
    mobileCalendarByApt[apt.id] = { bookings: calBookings, cleanings: calCleanings, tickets: calTickets };
  }

  return (
    <>
    {/* ── MOBILE LAYOUT (< md) ──────────────────────────────── */}
    <div className="block md:hidden">
      <MobileDashboard
        apartments={mobileApartments}
        lateCleanings={mobileLateCleanings}
        cleaningsInProgress={mobileCleaningsInProgress}
        todayPendingEvents={mobileTodayEvents}
        checkinsCount={checkinsToday.length}
        cleaningsCount={cleaningsToday.length}
        cleaningsDoneCount={cleaningsDoneCount}
        checkinsItems={mobileCheckinsItems}
        cleaningsTodayItems={mobileCleaningsTodayItems}
        urgentTicketsItems={mobileUrgentTicketsItems}
        ticketsTodayItems={mobileTicketsTodayItems}
        ticketsTodayCount={ticketsTodayCount}
        ticketsDoneCount={ticketsDoneCount}
        initialNotifications={initialNotifications}
        serverDate={serverDate}
        dateLabel={mobileDateLabel}
        calendarDataByApt={mobileCalendarByApt}
        unreadMessagesCount={unreadMessagesCount}
        orgName={org?.name ?? undefined}
      />
    </div>

    {/* ── DESKTOP LAYOUT (≥ md) ─────────────────────────────── */}
    <div className="hidden md:block p-10 space-y-10 font-sans">
      {/* 3. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">Oggi</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-normal">
            {new Date(serverDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-1 space-y-6">
        {/* 4. ACTION BUTTONS / TOPBAR */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UpcomingEventsPanel events={allEvents} serverDate={serverDate} />
          </div>

          <div className="flex justify-center">
            <NotificationBell initialNotifications={initialNotifications} serverDate={serverDate} unreadMessagesCount={unreadMessagesCount} />
          </div>

          <div className="flex items-center gap-2">
          <Link 
            href="/dashboard/manager/cleanings/new"
            className="flex items-center gap-2 px-3 py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.03] active:scale-95 whitespace-nowrap"
          >
            <Brush size={14} />
            Nuova Pulizia
          </Link>
          <Link 
            href="/dashboard/manager/maintenance/new"
            className="flex items-center gap-2 px-3 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-xl hover:scale-[1.03] active:scale-95 whitespace-nowrap"
          >
            <Ticket size={14} />
            Nuovo Ticket
          </Link>
          <Link 
            href="/dashboard/manager/bookings/new"
            className="flex items-center gap-2 px-3 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95 whitespace-nowrap"
          >
            <KeyRound size={14} />
            Nuova Prenotazione
          </Link>
          </div>
        </div>
      {/* 5. KPI CARDS */}
      <DashboardKpiCards
        checkinsToday={checkinsKpi}
        cleaningsToday={cleaningsTodayKpi}
        lateCleanings={lateCleaningsKpi}
        cleaningsInProgress={cleaningsInProgressKpi}
        urgentTickets={urgentTicketsKpi}
        cleaningsDoneCount={cleaningsDoneCount}
        ticketsTodayCount={ticketsTodayCount}
        ticketsDoneCount={ticketsDoneCount}
      />

      {/* 6. MAIN CONTENT LAYOUT */}
      <div className="space-y-6">

        {/* CALENDARIO OPERATIVO */}
        <div className="space-y-6">
          <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-violet-500/5 overflow-hidden transition-all duration-300 hover:shadow-violet-500/10">
            <div className="p-8 border-b border-white/40 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight uppercase">Calendario Operativo</h2>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">Timeline Interventi &amp; Flussi</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full border border-violet-100">
                <span className="w-2 h-2 bg-violet-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Live Update</span>
              </div>
            </div>
            <div className="p-8">
              <TimelineCalendar
                apartments={apartmentsData}
                bookings={calendarBookings}
                cleaningTasks={cleanings}
                maintenanceTickets={tickets}
                serverDate={serverDate}
              />
            </div>
          </section>
        </div>
      </div>
      </div>
    </div>
    </>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getNotifications } from "@/src/app/actions/notification";

import TimelineCalendar from "@/src/components/timeline-calendar";
import DashboardKpiCards, { type KpiPopupItem } from "@/src/components/dashboard-kpi-cards";
import UpcomingEventsPanel from "@/src/components/upcoming-events-panel";
import type { OperationalEvent } from "@/src/components/operational-event-card";
import NotificationBell from "@/src/components/notification-bell";
import { ManagerAIChatLauncher } from "@/src/components/manager-ai-chat";
import { formatDateKey, getApartmentOperationalStatus, APARTMENT_STATUS_META } from "@/src/lib/apartment-status";
import {
  Brush,
  Ticket,
  KeyRound,
  WifiOff,
  MessageSquare,
  CircleDot,
  AlertTriangle,
} from "@/src/components/icons";

const isMaintenanceActive = (ticket: { status: string }) => {
  return ticket.status !== "RESOLVED" && ticket.status !== "CANCELLED";
};

const apartmentStatusLegendKeys = ["GREEN", "BLUE", "RED"] as const;

const formatLocalDateKey = (date: Date | string) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

type MaintenanceMessageView = {
  id: string;
  text: string | null;
  createdAt: Date;
  senderName: string | null;
  maintenanceTicketId?: string | null;
  maintenanceTicket: {
    apartment: {
      name: string;
    };
  };
};

type CleaningMessageView = {
  id: string;
  text: string | null;
  createdAt: Date;
  senderName: string | null;
  cleaningTaskId?: string | null;
  cleaningTask: {
    apartment: {
      name: string;
    };
  };
};

type BookingView = {
  id: string;
  apartmentId: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  guestName: string | null;
  status: string | null;
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
};

type TicketView = {
  id: string;
  apartmentId: string;
  scheduledStart: Date | string | null;
  createdAt: Date | string;
  title: string;
  status: string;
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

type ApartmentStatusCounts = {
  ready: number;
  notReady: number;
  occupied: number;
  [key: string]: number;
};

export default async function CalendarioOperativoPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const [apartments, bookings, cleanings, tickets, calendarTickets, initialNotifications, messages, cleaningMessages] = await Promise.all([
    prisma.apartment.findMany(),
    prisma.booking.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { apartment: true }
    }),
    prisma.cleaningTask.findMany({
      where: { status: { not: "CANCELLED" } },
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
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      include: { apartment: true, assignedTo: true }
    }),
    prisma.maintenanceTicket.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { apartment: true, assignedTo: true },
      orderBy: { createdAt: "desc" },
    }),
    getNotifications(),
    prisma.message.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { maintenanceTicket: { include: { apartment: true } } }
    }),
    prisma.cleaningTaskMessage.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { cleaningTask: { include: { apartment: true } } }
    })
  ]);

  const now = new Date();
  const serverDate = now.toISOString();
  const todayStr = now.toISOString().split('T')[0];
  const todayLocalStr = formatLocalDateKey(now);
  const lateCleaningCutoff = new Date(now);
  lateCleaningCutoff.setHours(10, 30, 0, 0);
  const isPastLateCleaningCutoff = now.getTime() > lateCleaningCutoff.getTime();

  const recentMessages = [
    ...messages.map((m: MaintenanceMessageView) => {
      let icon = <MessageSquare size={16} />;
      let colorClass = "bg-violet-500/10 text-violet-600";
      const text = (m.text || "").toLowerCase();
      if (text.includes("wifi") || text.includes("internet")) {
        icon = <WifiOff size={16} />;
        colorClass = "bg-rose-500/10 text-rose-600";
      } else if (text.includes("chiav") || text.includes("key") || text.includes("accesso")) {
        icon = <KeyRound size={16} />;
        colorClass = "bg-sky-500/10 text-sky-600";
      }
      return {
        id: m.id,
        text: m.text,
        createdAt: m.createdAt,
        senderName: m.senderName,
        apartmentName: m.maintenanceTicket.apartment.name,
        type: "MAINTENANCE",
        entityId: m.maintenanceTicketId,
        icon,
        colorClass
      };
    }),
    ...cleaningMessages.map((m: CleaningMessageView) => {
      let icon = <MessageSquare size={16} />;
      let colorClass = "bg-violet-500/10 text-violet-600";
      const text = (m.text || "").toLowerCase();
      if (text.includes("wifi") || text.includes("internet")) {
        icon = <WifiOff size={16} />;
        colorClass = "bg-rose-500/10 text-rose-600";
      } else if (text.includes("chiav") || text.includes("key") || text.includes("accesso")) {
        icon = <KeyRound size={16} />;
        colorClass = "bg-sky-500/10 text-sky-600";
      }
      return {
        id: m.id,
        text: m.text,
        createdAt: m.createdAt,
        senderName: m.senderName,
        apartmentName: m.cleaningTask.apartment.name,
        type: "CLEANING",
        entityId: m.cleaningTaskId,
        icon,
        colorClass
      };
    })
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  const checkinsToday = bookings.filter((b: BookingView) => {
    const checkin = new Date(b.checkInDate).toISOString().split('T')[0];
    return checkin === todayStr;
  });

  const cleaningsToday = cleanings.filter((c: CleaningView) => {
    const cleaningDate = formatLocalDateKey(c.date);
    return cleaningDate === todayLocalStr;
  });

  const lateCleanings = isPastLateCleaningCutoff
    ? cleaningsToday.filter((c: CleaningView) => c.status === "PENDING")
    : [];
  const lateCleaningIds = new Set(lateCleanings.map((cleaning: CleaningView) => cleaning.id));

  const ticketsToday = tickets.filter((t: TicketView) => {
    const scheduledStart = t.scheduledStart ? new Date(t.scheduledStart).toISOString().split('T')[0] : null;
    const createdAt = new Date(t.createdAt).toISOString().split('T')[0];
    return scheduledStart === todayStr || createdAt === todayStr || t.status === "OPEN" || t.status === "IN_PROGRESS";
  });

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
        statusLabel: t.status === "OPEN" ? "Aperto" : t.status === "IN_PROGRESS" ? "In Carico" : "Risolto",
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

  const apartmentStatusCounts = apartments.reduce<ApartmentStatusCounts>(
    (counts: ApartmentStatusCounts, apartment: ApartmentView) => {
      const aptBookings = bookings.filter((b: BookingView) => b.apartmentId === apartment.id);
      const aptCleanings = cleanings.filter((c: CleaningView) => c.apartmentId === apartment.id);
      const aptTickets = tickets.filter((t: TicketView) => t.apartmentId === apartment.id);
      const activeOrNextBooking = aptBookings
        .filter((booking: BookingView) => formatDateKey(booking.checkOutDate) >= todayStr)
        .sort((a: BookingView, b: BookingView) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())[0];
      let statusTargetDate: Date | string = serverDate;

      if (activeOrNextBooking) {
        const checkInKey = formatDateKey(activeOrNextBooking.checkInDate);
        const checkOutKey = formatDateKey(activeOrNextBooking.checkOutDate);
        statusTargetDate = todayStr >= checkInKey && todayStr < checkOutKey
          ? serverDate
          : activeOrNextBooking.checkInDate;
      }

      const calendarStatus = getApartmentOperationalStatus(
        statusTargetDate,
        aptBookings,
        aptCleanings,
        aptTickets,
        { now }
      );

      if (calendarStatus.color === "GREEN") counts.ready += 1;
      if (calendarStatus.color === "BLUE") counts.notReady += 1;
      if (calendarStatus.color === "RED") counts.occupied += 1;
      return counts;
    },
    { ready: 0, notReady: 0, occupied: 0 }
  );

  // KPI popup items
  const checkinsKpi: KpiPopupItem[] = checkinsToday.map((b: BookingView) => ({
    id: b.id,
    label: b.guestName || "Ospite",
    sublabel: b.apartment.name,
    href: `/dashboard/manager/bookings/${b.id}`,
  }));
  const cleaningsTodayKpi: KpiPopupItem[] = cleaningsToday.map((c: CleaningView) => ({
    id: c.id,
    label: c.apartment.name,
    sublabel: c.assignedTo?.name || "Non assegnato",
    href: `/dashboard/manager/cleanings/${c.id}`,
  }));
  const lateCleaningsKpi: KpiPopupItem[] = lateCleanings.map((c: CleaningView) => ({
    id: c.id,
    label: c.apartment.name,
    sublabel: c.assignedTo?.name || "Non assegnato",
    href: `/dashboard/manager/cleanings/${c.id}`,
  }));
  const cleaningsInProgressKpi: KpiPopupItem[] = cleaningsToday
    .filter((c: CleaningView) => c.status === "IN_PROGRESS")
    .map((c: CleaningView) => ({
      id: c.id,
      label: c.apartment.name,
      sublabel: c.assignedTo?.name || "Non assegnato",
      href: `/dashboard/manager/cleanings/${c.id}`,
    }));
  const urgentTicketsKpi: KpiPopupItem[] = tickets.map((t: TicketView) => ({
    id: t.id,
    label: t.title,
    sublabel: t.apartment.name,
    href: `/dashboard/manager/maintenance/${t.id}`,
  }));

  const calendarBookings = bookings.map((booking: BookingView) => ({
    ...booking,
    guestName: booking.guestName ?? "",
    status: booking.status ?? undefined,
    source: booking.source ?? undefined,
    externalId: booking.externalId ?? undefined,
  }));

  return (
    <div className="p-10 space-y-10 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">Calendario Operativo</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-normal">
            {new Date(serverDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <ManagerAIChatLauncher />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-1 space-y-6">
        {/* TOPBAR */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UpcomingEventsPanel events={allEvents} serverDate={serverDate} />
          </div>
          <div className="flex justify-center">
            <NotificationBell initialNotifications={initialNotifications} serverDate={serverDate} />
          </div>
        </div>

        {/* KPI CARDS */}
        <DashboardKpiCards
          checkinsToday={checkinsKpi}
          cleaningsToday={cleaningsTodayKpi}
          lateCleanings={lateCleaningsKpi}
          cleaningsInProgress={cleaningsInProgressKpi}
          urgentTickets={urgentTicketsKpi}
        />

        {/* CALENDARIO OPERATIVO SECTION */}
        <div className="space-y-6">
          <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-violet-500/5 overflow-hidden transition-all duration-300 hover:shadow-violet-500/10">
            <div className="p-10 border-b border-white/40 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase">Calendario Operativo</h2>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-1 uppercase">Timeline Interventi &amp; Flussi</p>
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
                maintenanceTickets={calendarTickets}
                serverDate={serverDate}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

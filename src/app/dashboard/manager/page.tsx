import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { getNotifications } from "@/src/app/actions/notification";

import TimelineCalendar from "@/src/components/timeline-calendar";
import UpcomingEventsPanel from "@/src/components/upcoming-events-panel";
import type { OperationalEvent } from "@/src/components/operational-event-card";
import NotificationBell from "@/src/components/notification-bell";
import ApartmentMapWrapper from "@/src/components/apartment-map-wrapper";
import { ManagerAIChatLauncher } from "@/src/components/manager-ai-chat";
import { formatDateKey, getApartmentOperationalStatus, APARTMENT_STATUS_META } from "@/src/lib/apartment-status";
import { 
  Brush, 
  Ticket, 
  Search, 
  KeyRound, 
  WifiOff, 
  MessageSquare,
  CircleDot,
  Navigation,
  AlertTriangle
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

export default async function ManagerDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  // Fetch all necessary data
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

  // Logic for Recent Messages with Keyword detection for icons
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
        }
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
        }
    })
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  // Logic for Check-ins Today
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
  const lateCleaningIds = new Set(lateCleanings.map((cleaning) => cleaning.id));

  const ticketsToday = tickets.filter((t: TicketView) => {
    const scheduledStart = t.scheduledStart ? new Date(t.scheduledStart).toISOString().split('T')[0] : null;
    const createdAt = new Date(t.createdAt).toISOString().split('T')[0];
    return scheduledStart === todayStr || createdAt === todayStr || t.status === "OPEN" || t.status === "IN_PROGRESS";
  });

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

  const apartmentsData = apartments.map((apartment) => {
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
  const apartmentStatusCounts = apartments.reduce(
    (counts, apartment) => {
      const aptBookings = bookings.filter((b: BookingView) => b.apartmentId === apartment.id);
      const aptCleanings = cleanings.filter((c: CleaningView) => c.apartmentId === apartment.id);
      const aptTickets = tickets.filter((t: TicketView) => t.apartmentId === apartment.id);
      const activeOrNextBooking = aptBookings
        .filter((booking: BookingView) => formatDateKey(booking.checkOutDate) >= todayStr)
        .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())[0];
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
  const calendarBookings = bookings.map((booking: BookingView) => ({
    ...booking,
    guestName: booking.guestName ?? "",
    status: booking.status ?? undefined,
    source: booking.source ?? undefined,
    externalId: booking.externalId ?? undefined,
  }));

  return (
    <div className="p-10 space-y-10 font-sans">
      {/* 3. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">Oggi</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-normal">
            {new Date(serverDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <ManagerAIChatLauncher />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-1 space-y-6">
        {/* 4. ACTION BUTTONS / TOPBAR */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-full px-4 h-12 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
               <Search size={18} className="text-slate-400" />
               <input type="text" placeholder="Cerca..." className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 ml-2 w-32 md:w-48 placeholder:text-slate-400" />
            </div>

            <UpcomingEventsPanel events={allEvents} serverDate={serverDate} />
          </div>

          <div className="flex justify-center">
            <NotificationBell initialNotifications={initialNotifications} serverDate={serverDate} />
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
      {/* 5. SUMMARY BANNERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        <div className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[180px] flex flex-col justify-between transition-all hover:shadow-violet-500/10">
            <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-wide text-slate-500">Check-in oggi</p>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <KeyRound size={16} />
                </div>
            </div>
            <div>
                <p className="text-2xl font-semibold text-slate-900 tracking-tight">{checkinsToday.length}</p>
                <p className="text-sm text-slate-500 mt-1">Arrivi confermati</p>
            </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[180px] flex flex-col justify-between transition-all hover:shadow-violet-500/10">
            <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pulizie oggi</p>
                <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Brush size={16} />
                </div>
            </div>
            <div>
                <p className="text-2xl font-semibold text-slate-900 tracking-tight">{cleaningsToday.length}</p>
                <p className="text-sm text-slate-500 mt-1">Interventi previsti</p>
            </div>
        </div>

        <div className={`backdrop-blur-xl rounded-[28px] shadow-2xl p-6 min-h-[180px] flex flex-col justify-between transition-all ${
          lateCleanings.length > 0
            ? "bg-rose-50/80 shadow-rose-500/10 ring-1 ring-rose-200/70"
            : "bg-white/50 shadow-violet-500/5 hover:shadow-violet-500/10"
        }`}>
            <div className="flex justify-between items-start">
                <p className={`text-xs uppercase tracking-wide ${lateCleanings.length > 0 ? "text-rose-600" : "text-slate-500"}`}>Pulizie in ritardo</p>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  lateCleanings.length > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400"
                }`}>
                    <AlertTriangle size={16} />
                </div>
            </div>
            <div>
                <p className={`text-2xl font-semibold tracking-tight ${lateCleanings.length > 0 ? "text-rose-700" : "text-slate-900"}`}>{lateCleanings.length}</p>
                <p className="text-sm text-slate-500 mt-1">Pending dopo le 10:30</p>
            </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[180px] flex flex-col justify-between transition-all hover:shadow-violet-500/10">
            <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-wide text-slate-500">Ticket in carico</p>
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Ticket size={16} />
                </div>
            </div>
            <div>
                <p className="text-2xl font-semibold text-slate-900 tracking-tight">{ticketsToday.length}</p>
                <p className="text-sm text-slate-500 mt-1">Segnalazioni aperte</p>
            </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-violet-500/5 p-6 min-h-[180px] flex flex-col justify-between transition-all hover:shadow-violet-500/10">
            <div className="flex justify-between items-start">
                <p className="text-xs uppercase tracking-wide text-slate-500">Stato Apt.</p>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CircleDot size={16} />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />Pronto</span>
                    <span>{apartmentStatusCounts.ready}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />Non Pronto</span>
                    <span>{apartmentStatusCounts.notReady}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" />Occupato</span>
                    <span>{apartmentStatusCounts.occupied}</span>
                </div>
            </div>
        </div>
      </div>

      {/* 6. MAIN CONTENT LAYOUT */}
      <div className="space-y-6">
        
        {/* LEFT COLUMN: PROGRAMMA OPERATIVO */}
        <div className="space-y-6">
          <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-violet-500/5 overflow-hidden transition-all duration-300 hover:shadow-violet-500/10">
            <div className="p-10 border-b border-white/40 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase">Programma Operativo</h2>
                    <p className="text-xs uppercase tracking-wide text-slate-500 mt-1 uppercase">Timeline Interventi & Flussi</p>
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

        {/* RIGHT COLUMN: MAP & STATO LIVE */}
        <div className="space-y-6">
          <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-violet-500/5 overflow-hidden transition-all duration-300 hover:shadow-violet-500/10">
            <div className="p-8 border-b border-white/40">
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight uppercase flex items-center gap-2">
                    <Navigation size={20} className="text-violet-600" />
                    Mappa & Stato Live
                </h2>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-1 uppercase">Monitoraggio Geospaziale</p>
            </div>
            <div className="p-6">
                <div className="rounded-3xl overflow-hidden border border-white/60 shadow-inner bg-slate-50 relative h-[500px]">
                    <ApartmentMapWrapper apartments={apartmentsData} />
                    
                    {/* Compact Legend overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {apartmentStatusLegendKeys.map((key) => {
                            const meta = APARTMENT_STATUS_META[key];
                            return (
                                <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-white/20 whitespace-nowrap">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.hex }} />
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">{meta.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
}

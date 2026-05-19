import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { getNotifications } from "@/src/app/actions/notification";

import ApartmentMapWrapper from "@/src/components/apartment-map-wrapper";
import { APARTMENT_STATUS_META } from "@/src/lib/apartment-status";
import UpcomingEventsPanel from "@/src/components/upcoming-events-panel";
import type { OperationalEvent } from "@/src/components/operational-event-card";
import NotificationBell from "@/src/components/notification-bell";
import { getApartmentOperationalStatus } from "@/src/lib/apartment-status";
import {
  Brush,
  Ticket,
  KeyRound,
} from "@/src/components/icons";

const isMaintenanceActive = (ticket: { status: string }) => {
  return ticket.status !== "RESOLVED" && ticket.status !== "CANCELLED";
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

export default async function CalendarioOperativoPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const [apartments, bookings, cleanings, tickets, calendarTickets, initialNotifications] = await Promise.all([
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
  ]);

  const now = new Date();
  const serverDate = now.toISOString();
  const todayLocalStr = formatLocalDateKey(now);
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
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">Mappa</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-normal">
            {new Date(serverDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
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

        {/* MAPPA SECTION */}
        <div className="space-y-6">
          <section className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-violet-500/5 overflow-hidden transition-all duration-300 hover:shadow-violet-500/10">
            <div className="p-8 border-b border-white/40">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight uppercase">Mappa & Stato Live</h2>
              <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">Monitoraggio Geospaziale</p>
            </div>
            <div className="p-6">
              <div className="rounded-3xl overflow-hidden border border-white/60 shadow-inner bg-slate-50 relative h-[500px]">
                <ApartmentMapWrapper apartments={apartmentsData} />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {(["GREEN","BLUE","RED"] as const).map((key) => {
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
  );
}

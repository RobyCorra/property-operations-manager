"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApartmentOperationalStatus, type ApartmentStatus } from "@/src/lib/apartment-status";
import { calculateLinen } from "@/src/lib/linen-calculator";
import { deleteBooking, confirmCheckIn } from "@/src/app/actions/booking";
import {
  deleteCleaningTask,
  deleteMaintenanceTicket,
  getCleaningTask,
  updateCleaningStatus,
  updateMaintenanceStatus,
  approveCleaningDirectly,
  approveMaintenanceDirectly,
} from "@/src/app/actions/operational";

import { 
  KeyRound, 
  Paintbrush, 
  Wrench, 
  LogIn, 
  DoorOpen, 
  CircleCheck, 
  CalendarDays, 
  MapPin, 
  UserCircle 
} from "./icons";
import { Users, Home } from "lucide-react";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface Booking {
  id: string;
  apartmentId: string;
  guestName: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  totalGuests?: number;
  cullaRequested?: boolean;
  status?: string;
  source?: string;
  externalId?: string;
  apartment?: { name: string; address: string };
}

interface CleaningTask {
  id: string;
  apartmentId: string;
  date: Date | string;
  status: string;
  notes?: string | null;
  assignedTo?: { id: string; name: string } | null;
  checklistProgress?: unknown;
  apartment?: { name: string; address: string };
  cullaRequested?: boolean | null;
  sofaBedForced?: boolean | null;
  totalGuests?: number | null;
}

type PrismaBooking = {
  id: string;
  createdAt: Date;
  apartmentId: string;
  status: string | null;
  guestName: string | null;
  totalGuests: number;
  checkInDate: Date;
  checkOutDate: Date;
  externalId: string | null;
  source: string | null;
};

type PrismaCleaningTask = {
  id: string;
  apartmentId: string;
  bookingId: string | null;
  date: Date;
  status: string;
  notes: string | null;
  checklistProgress: unknown;
  createdAt: Date;
  assignedToId: string | null;
};

interface MaintenanceTicket {
  id: string;
  apartmentId: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date | string;
  scheduledStart?: Date | string | null;
  scheduledEnd?: Date | string | null;
  description?: string;
  assignedTo?: { id: string; name: string } | null;
  apartment?: { name: string; address: string };
}

type PrismaMaintenanceTicket = {
  id: string;
  apartmentId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  createdAt: Date;
  startedAt: Date | null;
  resolvedAt: Date | null;
  assignedToId: string | null;
};

interface Apartment {
  id: string;
  name: string;
  status: ApartmentStatus;
  address?: string;
  bathrooms?: number;
  bedConfig?: unknown;
}

interface CheckinTaskCal {
  id: string;
  apartmentId: string;
  date: Date | string;
  status: string;
  assignedTo?: { id: string; name: string } | null;
  apartment?: { name: string; address: string };
}

interface TimelineCalendarProps {
  apartments: Apartment[];
  bookings: Booking[];
  cleaningTasks: CleaningTask[];
  maintenanceTickets: MaintenanceTicket[];
  checkinTasks?: CheckinTaskCal[];
  serverDate: string;
  readOnly?: boolean;
}

type CalendarEvent = {
  id: string;
  type: "booking" | "cleaning" | "maintenance" | "checkin";
  title: string;
  apartmentName?: string;
  start: Date;
  end: Date;
  status?: string;
  priority?: string;
  apartmentId: string;
  data: Booking | CleaningTask | MaintenanceTicket | CheckinTaskCal;
};

const DAY_WIDTH = 100;
const MIN_DAYS_COUNT = 30;
const APARTMENT_COL_WIDTH = 250;

function toLocalDateKey(value: Date | string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromLocalKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addLocalDays(date: Date, days: number) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
}

function diffLocalDays(start: Date, end: Date) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TimelineCalendar({ apartments, bookings, cleaningTasks, maintenanceTickets, checkinTasks = [], serverDate, readOnly = false }: TimelineCalendarProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'booking' | 'cleaning' | 'maintenance', data: any } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCheckInConfirm, setShowCheckInConfirm] = useState(false);

  // Client-side clock for real-time 15:00 transition
  const [currentClientTime, setCurrentClientTime] = useState(() => new Date(serverDate));

  const bookingEvents = useMemo<CalendarEvent[]>(() => (
    bookings
      .filter((booking) => booking.status !== "CANCELLED")
      .map((booking) => ({
        id: booking.id,
        type: "booking" as const,
        title: `Prenotazione - ${booking.apartment?.name || "Appartamento"}`,
        apartmentName: booking.apartment?.name || "",
        start: new Date(booking.checkInDate),
        end: new Date(booking.checkOutDate),
        status: booking.status,
        apartmentId: booking.apartmentId,
        data: booking,
      }))
      .filter((event) => !isNaN(event.start.getTime()))
  ), [bookings]);

  const cleaningEvents = useMemo<CalendarEvent[]>(() => (
    cleaningTasks
      .filter((task) => task.status !== "CANCELLED")
      .map((task) => ({
        id: task.id,
        type: "cleaning" as const,
        title: `Pulizia - ${task.apartment?.name || "Appartamento"}`,
        apartmentName: task.apartment?.name || "",
        start: new Date(task.date),
        end: new Date(task.date),
        status: task.status,
        apartmentId: task.apartmentId,
        data: task,
      }))
      .filter((event) => !isNaN(event.start.getTime()))
  ), [cleaningTasks]);

  const maintenanceEvents = useMemo<CalendarEvent[]>(() => (
    maintenanceTickets
      .filter((ticket) => ticket.status !== "CANCELLED")
      .map((ticket) => {
        const start = new Date(ticket.scheduledStart || ticket.createdAt);
        const end = new Date(ticket.scheduledEnd || ticket.scheduledStart || ticket.createdAt);

        return {
          id: ticket.id,
          type: "maintenance" as const,
          title: `Manutenzione - ${ticket.apartment?.name || "Appartamento"}`,
          apartmentName: ticket.apartment?.name || "",
          start,
          end,
          status: ticket.status,
          priority: ticket.priority,
          apartmentId: ticket.apartmentId,
          data: ticket,
        };
      })
      .filter((event) => !isNaN(event.start.getTime()))
  ), [maintenanceTickets]);

  const checkinEvents = useMemo<CalendarEvent[]>(() => (
    checkinTasks
      .filter((task) => task.status !== "CANCELLED")
      .map((task) => ({
        id: task.id,
        type: "checkin" as const,
        title: `Check-in - ${task.apartment?.name || "Appartamento"}`,
        apartmentName: task.apartment?.name || "",
        start: new Date(task.date),
        end: new Date(task.date),
        status: task.status,
        apartmentId: task.apartmentId,
        data: task,
      }))
      .filter((event) => !isNaN(event.start.getTime()))
  ), [checkinTasks]);

  const calendarEvents = useMemo<CalendarEvent[]>(() => (
    [
      ...bookingEvents,
      ...cleaningEvents,
      ...maintenanceEvents,
      ...checkinEvents,
    ]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  ), [bookingEvents, cleaningEvents, maintenanceEvents, checkinEvents]);

  // Dati operativi pre-raggruppati per appartamento — calcolati UNA volta sola
  // invece di rifiltrare/rimappare l'intero dataset dentro il loop di render per
  // ogni singolo evento (era O(appartamenti × eventi × record) ad ogni re-render).
  const opDataByApartment = useMemo(() => {
    const map = new Map<string, {
      bookings: PrismaBooking[];
      cleanings: PrismaCleaningTask[];
      tickets: PrismaMaintenanceTicket[];
    }>();
    const get = (id: string) => {
      let entry = map.get(id);
      if (!entry) { entry = { bookings: [], cleanings: [], tickets: [] }; map.set(id, entry); }
      return entry;
    };
    for (const item of bookings) {
      if (item.status === "CANCELLED") continue;
      get(item.apartmentId).bookings.push({
        id: item.id,
        createdAt: new Date(),
        apartmentId: item.apartmentId,
        status: item.status ?? null,
        guestName: item.guestName ?? null,
        totalGuests: item.totalGuests ?? 0,
        checkInDate: new Date(item.checkInDate),
        checkOutDate: new Date(item.checkOutDate),
        externalId: item.externalId ?? null,
        source: item.source ?? null,
      } as PrismaBooking);
    }
    for (const item of cleaningTasks) {
      if (item.status === "CANCELLED") continue;
      get(item.apartmentId).cleanings.push({
        id: item.id,
        createdAt: new Date(),
        apartmentId: item.apartmentId,
        date: new Date(item.date),
        status: item.status,
        assignedToId: item.assignedTo?.id ?? null,
        notes: item.notes ?? null,
        bookingId: null,
        checklistProgress: item.checklistProgress ?? null,
      } as PrismaCleaningTask);
    }
    for (const item of maintenanceTickets) {
      if (item.status === "CANCELLED") continue;
      get(item.apartmentId).tickets.push({
        id: item.id,
        apartmentId: item.apartmentId,
        title: item.title,
        description: item.description ?? "",
        status: item.status,
        priority: item.priority,
        createdAt: new Date(item.createdAt),
        assignedToId: item.assignedTo?.id ?? null,
        scheduledStart: item.scheduledStart ? new Date(item.scheduledStart) : null,
        scheduledEnd: item.scheduledEnd ? new Date(item.scheduledEnd) : null,
        startedAt: null,
        resolvedAt: null,
      } as PrismaMaintenanceTicket);
    }
    return map;
  }, [bookings, cleaningTasks, maintenanceTickets]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentClientTime(new Date());
    }, 30000); // Check every 30s
    return () => clearInterval(timer);
  }, []);

  // Real-time polling for open cleaning task
  useEffect(() => {
    if (!selectedEvent || selectedEvent.type !== 'cleaning') return;

    const pollTask = async () => {
      try {
        const task = await getCleaningTask(selectedEvent.data.id);
        if (task) {
          setSelectedEvent(prev => {
            if (prev?.type === 'cleaning' && prev.data.id === task.id) {
              // Only update if something changed to avoid unnecessary re-renders
              const oldProgress = JSON.stringify(prev.data.checklistProgress);
              const newProgress = JSON.stringify(task.checklistProgress);
              if (oldProgress !== newProgress || prev.data.status !== task.status) {
                return { ...prev, data: task };
              }
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const interval = setInterval(pollTask, 5000); // 5s polling
    return () => clearInterval(interval);
  }, [selectedEvent]);

  // ESC key and Click Outside handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setSelectedEvent(null);
            setShowDeleteConfirm(false);
            setShowCheckInConfirm(false);
        }
    };
    if (selectedEvent) {
        window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent]);

  // Reset delete confirm when event changes
  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [selectedEvent]);

  const startDate = useMemo(() => {
    const today = dateFromLocalKey(toLocalDateKey(serverDate));
    const defaultStart = addLocalDays(today, -7);
    const eventStartDates = calendarEvents
      .map((event) => dateFromLocalKey(toLocalDateKey(event.start)))
      .filter((date) => !isNaN(date.getTime()));

    if (eventStartDates.length === 0) {
      return defaultStart;
    }

    const earliestEventDate = new Date(Math.min(...eventStartDates.map((date) => date.getTime())));
    return earliestEventDate < defaultStart ? earliestEventDate : defaultStart;
  }, [calendarEvents, serverDate]);

  const days = useMemo(() => {
    const today = dateFromLocalKey(toLocalDateKey(serverDate));
    const defaultEnd = addLocalDays(today, MIN_DAYS_COUNT - 1);
    const eventDates = calendarEvents
      .flatMap((event) => [event.start, event.end])
      .map((date) => dateFromLocalKey(toLocalDateKey(date)))
      .filter((date) => !isNaN(date.getTime()));

    const latestEventDate = eventDates.length > 0
      ? addLocalDays(new Date(Math.max(...eventDates.map((date) => date.getTime()))), 7)
      : defaultEnd;
    const endDate = latestEventDate > defaultEnd ? latestEventDate : defaultEnd;
    const daysCount = Math.max(MIN_DAYS_COUNT, diffLocalDays(startDate, endDate) + 1);

    return Array.from({ length: daysCount }).map((_, i) => {
      return addLocalDays(startDate, i);
    });
  }, [calendarEvents, serverDate, startDate]);

  const timelineDayWidth = DAY_WIDTH;

  const firstVisibleEventPosition = useMemo(() => {
    const today = dateFromLocalKey(toLocalDateKey(serverDate));
    const eventDates = calendarEvents
      .map((event) => event.start)
      .map((date) => dateFromLocalKey(toLocalDateKey(date)))
      .filter((date) => !isNaN(date.getTime()) && date >= today)
      .sort((a, b) => a.getTime() - b.getTime());

    const targetDate = eventDates[0] ?? today;
    const diffDays = diffLocalDays(startDate, targetDate);
    return Math.max(0, diffDays * timelineDayWidth - timelineDayWidth);
  }, [calendarEvents, serverDate, startDate, timelineDayWidth]);

  const getPosition = (dateStr: Date | string, offset: boolean = false) => {
    const date = dateFromLocalKey(toLocalDateKey(dateStr));
    const diffDays = diffLocalDays(startDate, date);
    return diffDays * timelineDayWidth + (offset ? timelineDayWidth / 2 : 0);
  };

  const getWidth = (startDateStr: Date | string, endDateStr: Date | string) => {
    const start = dateFromLocalKey(toLocalDateKey(startDateStr));
    const end = dateFromLocalKey(toLocalDateKey(endDateStr));
    const diffDays = diffLocalDays(start, end);
    return Math.max(0.5, diffDays) * timelineDayWidth;
  };

  const isUrgentOpenTicket = (ticket: MaintenanceTicket) => (
    ticket.priority === "URGENT" && ["PENDING", "IN_PROGRESS"].includes(ticket.status)
  );

  const isCleaningLate = (cleaning: CleaningTask) => {
    if (cleaning.status !== "PENDING") return false;
    const scheduledTime = new Date(cleaning.date);
    return currentClientTime.getTime() > scheduledTime.getTime() + 30 * 60 * 1000;
  };

  const isBookingNotReady = (booking: Booking) => {
    const checkInKey = toLocalDateKey(booking.checkInDate);
    const hasOpenCleaningBeforeCheckIn = cleaningTasks.some((task) => (
      task.apartmentId === booking.apartmentId &&
      ["PENDING", "IN_PROGRESS"].includes(task.status) &&
      toLocalDateKey(task.date) <= checkInKey
    ));
    const hasUrgentOpenTicket = maintenanceTickets.some((ticket) => (
      ticket.apartmentId === booking.apartmentId && isUrgentOpenTicket(ticket)
    ));

    return hasOpenCleaningBeforeCheckIn || hasUrgentOpenTicket;
  };


  // Center scroll on the first loaded event, falling back to today.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = firstVisibleEventPosition;
    }
  }, [firstVisibleEventPosition]);

  // Raggruppa i giorni per mese per la riga header mese
  const monthGroups = useMemo(() => {
    const groups: { label: string; count: number }[] = [];
    days.forEach((day) => {
      const label = day.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
      if (groups.length === 0 || groups[groups.length - 1].label !== label) {
        groups.push({ label, count: 1 });
      } else {
        groups[groups.length - 1].count++;
      }
    });
    return groups;
  }, [days]);

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${formatDate(dateInput)} ore ${time}`;
  };

  // Handle Action buttons in Modal
  const handleAction = async (action: () => Promise<void>) => {
    startTransition(async () => {
        try {
            await action();
            router.refresh();
            setSelectedEvent(null);
            setShowDeleteConfirm(false);
            setShowCheckInConfirm(false);
        } catch (e: any) {
            alert(e.message || "Si è verificato un errore durante l'operazione.");
        }
    });
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    startTransition(async () => {
        try {
            const id = selectedEvent.data.id;
            if (selectedEvent.type === 'booking') {
                await deleteBooking(id);
            } else if (selectedEvent.type === 'cleaning') {
                await deleteCleaningTask(id);
            } else if (selectedEvent.type === 'maintenance') {
                await deleteMaintenanceTicket(id);
            }
            router.refresh();
            setSelectedEvent(null);
            setShowDeleteConfirm(false);
            setShowCheckInConfirm(false);
        } catch (e: any) {
            alert(e.message || "Impossibile eliminare l'evento.");
        }
    });
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    console.log("[TimelineCalendar] bookings", bookings.length);
    console.log("[TimelineCalendar] cleaningTasks", cleaningTasks.length);
    console.log("[TimelineCalendar] maintenanceTickets", maintenanceTickets.length);
    console.log("[TimelineCalendar] calendarEvents", calendarEvents.length);
  }, [bookings.length, cleaningTasks.length, maintenanceTickets.length, calendarEvents.length]);

  return (
    <>
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-black/5 overflow-hidden font-sans transition-all duration-200 ease-in-out">

      <div className="flex overflow-hidden relative" style={{ height: "auto", minHeight: "440px" }}>
        {/* Apartment List (Fixed Left) */}
        <div
          className="z-20 bg-white/60 backdrop-blur-xl border-r border-slate-200/80 flex-shrink-0"
          style={{ width: APARTMENT_COL_WIDTH }}
        >
          {/* Allineamento con la doppia riga header (mese + giorni) */}
          <div className="h-24 border-b-2 border-slate-200/70 flex items-end pb-2 px-8">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Appartamento</span>
          </div>
          {apartments.map((apt) => {
            const dotColor: Record<string, string> = {
              GREEN:  "bg-emerald-500",
              BLUE:   "bg-blue-500",
              VIOLET: "bg-violet-500",
              YELLOW: "bg-yellow-400",
              RED:    "bg-red-500",
            };
            const dotLabel: Record<string, string> = {
              GREEN:  "Pronto",
              BLUE:   "Non pronto",
              VIOLET: "In corso",
              YELLOW: "In verifica",
              RED:    "Occupato",
            };
            return (
              <div key={apt.id} className="h-36 border-b-2 border-slate-200/70 flex flex-col justify-center px-8 truncate transition-all hover:bg-white/30">
                <span className="text-base font-semibold text-slate-900 truncate tracking-tight">{apt.name}</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[apt.status] ?? "bg-slate-400"}`} />
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{dotLabel[apt.status] ?? apt.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Content (Scrollable Right) */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden select-none bg-white relative"
          style={{ cursor: "grab" }}
        >
          {/* Header — Mese (riga 1) + Giorni (riga 2) — sticky verticale */}
          <div
            className="sticky top-0 z-10 bg-white/40 backdrop-blur-xl border-b-2 border-slate-200/70"
            style={{ width: days.length * timelineDayWidth }}
          >
            {/* Riga 1: blocchi mese — label sticky si ancora al bordo sinistro del viewport mentre scorri */}
            <div className="flex h-8 border-b border-slate-200/50">
              {monthGroups.map((group, gi) => (
                <div
                  key={gi}
                  className="relative flex-shrink-0 flex items-center bg-violet-50/40 border-r-2 border-violet-200 last:border-r-0"
                  style={{ width: group.count * timelineDayWidth }}
                >
                  <span className="sticky left-3 text-[10px] font-bold uppercase tracking-widest text-violet-600 capitalize whitespace-nowrap select-none pl-1">
                    {group.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Riga 2: giorni */}
            <div className="flex h-16">
              {days.map((day, i) => {
                const isToday = toLocalDateKey(day) === toLocalDateKey(serverDate);
                const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isFirstOfMonth = day.getDate() === 1 && i > 0;
                return (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5
                      ${isFirstOfMonth ? "border-l-2 border-l-violet-200" : ""}
                      border-r border-slate-200/70
                      ${isToday ? "bg-violet-500/8 border-r-violet-300/60" : isWeekend ? "bg-slate-100/60" : "bg-slate-50/30"}`}
                    style={{ width: timelineDayWidth }}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? "text-violet-600" : "text-slate-400"}`}>
                      {weekDays[day.getDay()]}
                    </span>
                    <span className={`text-base font-semibold leading-none ${isToday ? "text-violet-700" : "text-slate-900"}`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          <div className="relative" style={{ width: days.length * timelineDayWidth }}>
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {days.map((day, i) => {
                const isToday = toLocalDateKey(day) === toLocalDateKey(serverDate);

                return (
                  <div
                    key={i}
                    className={`h-full border-r flex-shrink-0 ${
                      isToday
                        ? "border-violet-300/60 bg-violet-500/8"
                        : (day.getDay() === 0 || day.getDay() === 6)
                        ? "border-slate-200/70 bg-slate-100/40"
                        : "border-slate-200/50 bg-slate-50/20"
                    }`}
                    style={{ width: timelineDayWidth }}
                  />
                );
              })}
            </div>

            {apartments.map((apt) => (
              <div key={apt.id} className="h-36 border-b-2 border-slate-200/70 relative group hover:bg-white/10 transition-colors">
                {calendarEvents.filter((event) => event.apartmentId === apt.id).map((event) => {
                  if (event.type === "booking") {
                    const booking = event.data as Booking;
                    const todayKey = toLocalDateKey(currentClientTime);
                    const checkInKey = toLocalDateKey(booking.checkInDate);
                    const checkOutKey = toLocalDateKey(booking.checkOutDate);
                    const statusTargetDate = todayKey >= checkInKey && todayKey < checkOutKey
                      ? currentClientTime
                      : booking.checkInDate;
                    const opData = opDataByApartment.get(apt.id);
                    const apartmentBookings = opData?.bookings ?? [];
                    const apartmentCleanings = opData?.cleanings ?? [];
                    const apartmentTickets = opData?.tickets ?? [];

                    const bookingStatus = getApartmentOperationalStatus(
                      statusTargetDate,
                      apartmentBookings as any,
                      apartmentCleanings as any,
                      apartmentTickets as any,
                      { now: currentClientTime }
                    );

                    const bookingNotReady = isBookingNotReady(booking);

                    const statusDotColor: Record<string, string> = {
                      GREEN: "bg-emerald-500", BLUE: "bg-blue-500", VIOLET: "bg-violet-500",
                      YELLOW: "bg-yellow-400", RED: "bg-red-500",
                    };
                    const statusTextColor: Record<string, string> = {
                      GREEN: "text-emerald-600", BLUE: "text-blue-600", VIOLET: "text-violet-600",
                      YELLOW: "text-yellow-600", RED: "text-red-600",
                    };
                    const statusLabelShort: Record<string, string> = {
                      GREEN: "Pronto", BLUE: "Non pronto", VIOLET: "In corso",
                      YELLOW: "In verifica", RED: "Occupato",
                    };
                    const effectiveStatus = bookingNotReady ? "BLUE" : bookingStatus.color;
                    const effectiveLabel = bookingNotReady ? "Non pronto" : (statusLabelShort[bookingStatus.color] ?? bookingStatus.label);
                    const barWidth = Math.max(timelineDayWidth - 8, getWidth(event.start, event.end) - 4);
                    const tooltipText = `${booking.guestName || "Ospite"} · ${booking.totalGuests ?? 0} ospiti · Stato: ${effectiveLabel}`;

                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        onClick={() => setSelectedEvent({ type: "booking", data: booking })}
                        className="absolute top-4 h-8 rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-sm flex items-center gap-1.5 px-3 shadow-sm z-10 transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:bg-white/90 active:scale-95 cursor-pointer text-[11px] font-semibold tracking-tight overflow-hidden text-slate-700"
                        title={tooltipText}
                        style={{ left: getPosition(event.start, true), width: barWidth }}
                      >
                        {/* Icona sempre visibile */}
                        <LogIn size={11} className="opacity-50 shrink-0" />
                        {/* Ospiti: sempre visibili */}
                        <span className="shrink-0">{booking.totalGuests ?? 0} osp.</span>
                        {/* Separatore + dot stato: da 130px */}
                        {barWidth >= 130 && (
                          <>
                            <span className="opacity-30 shrink-0 text-[10px]">·</span>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor[effectiveStatus] ?? "bg-slate-400"}`} />
                          </>
                        )}
                        {/* Label stato colorata: da 185px */}
                        {barWidth >= 185 && (
                          <span className={`truncate text-[10px] font-bold uppercase tracking-wide ${statusTextColor[effectiveStatus] ?? "text-slate-500"}`}>
                            {effectiveLabel}
                          </span>
                        )}
                      </div>
                    );
                  }

                  if (event.type === "cleaning") {
                    const cleaning = event.data as CleaningTask;
                    const isAssigned = !!cleaning.assignedTo;

                    // Colori unificati basati su status + assegnazione
                    const cleaningColor = cleaning.status === "APPROVED"
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 shadow-emerald-100"
                      : cleaning.status === "AWAITING_REVIEW"
                      ? "bg-amber-500/15 text-amber-700 border-amber-500/30 shadow-amber-100"
                      : cleaning.status === "COMPLETED"
                      ? "bg-sky-500/15 text-sky-700 border-sky-500/30 shadow-sky-100"
                      : cleaning.status === "IN_PROGRESS"
                      ? "bg-violet-500/15 text-violet-700 border-violet-500/30 shadow-violet-100"
                      : isAssigned
                      ? "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 shadow-yellow-100"
                      : "bg-red-500/15 text-red-700 border-red-500/30 shadow-red-100";

                    const cleaningLabel = cleaning.status === "APPROVED"
                      ? "Approvato"
                      : cleaning.status === "AWAITING_REVIEW"
                      ? "In verifica"
                      : cleaning.status === "COMPLETED"
                      ? "Completata"
                      : cleaning.status === "IN_PROGRESS"
                      ? "In corso"
                      : isAssigned ? "Assegnato" : "Da fare";
                    const cleaningPulse = cleaning.status === "AWAITING_REVIEW" ? "animate-pulse" : "";

                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        onClick={() => setSelectedEvent({ type: "cleaning", data: cleaning })}
                        className={`absolute top-14 h-7 px-3 rounded-full border text-[10px] font-semibold z-10 cursor-pointer transition-all duration-200 hover:scale-[1.05] hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap ${cleaningColor} ${cleaningPulse}`}
                        title={cleaningLabel ? `${event.title} - ${cleaningLabel.toUpperCase()}` : event.title}
                        style={{
                          left: getPosition(event.start) + 6,
                          width: Math.max(10, timelineDayWidth - 12),
                        }}
                      >
                        <Paintbrush size={12} className="opacity-70 shrink-0" />
                        {cleaningLabel
                          ? <span className="text-[9px] font-bold uppercase truncate">{cleaningLabel}</span>
                          : <span className="truncate">PULIZIA</span>
                        }
                      </div>
                    );
                  }

                  if (event.type === "maintenance") {
                    const ticket = event.data as MaintenanceTicket;
                    const isAssigned = !!ticket.assignedTo;
                    // Colori unificati basati su status + assegnazione
                    const ticketColor = ticket.status === "APPROVED"
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 shadow-emerald-100"
                      : ticket.status === "AWAITING_REVIEW" || ticket.status === "RESOLVED"
                      ? "bg-amber-500/15 text-amber-700 border-amber-500/30 shadow-amber-100"
                      : ticket.status === "IN_PROGRESS"
                      ? "bg-violet-500/15 text-violet-700 border-violet-500/30 shadow-violet-100"
                      : isAssigned
                      ? "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 shadow-yellow-100"
                      : "bg-red-500/15 text-red-700 border-red-500/30 shadow-red-100";

                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        onClick={() => setSelectedEvent({ type: "maintenance", data: ticket })}
                        className={`absolute bottom-2 h-6 rounded-full z-20 cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-95 shadow-sm border flex items-center justify-center px-2 text-[9px] font-semibold uppercase tracking-tight whitespace-nowrap overflow-hidden ${ticketColor} ${ticket.status === "AWAITING_REVIEW" ? "animate-pulse" : ""}`}
                        title={`${ticket.title} - ${ticket.status} - ${ticket.priority}`}
                        style={{
                          left: getPosition(event.start) + 6,
                          width: Math.max(10, timelineDayWidth - 12, getWidth(event.start, event.end) - 12),
                        }}
                      >
                        <Wrench size={11} className="mr-1 opacity-70" />
                        TICKET
                      </div>
                    );
                  }

                  if (event.type === "checkin") {
                    const checkin = event.data as CheckinTaskCal;
                    const isAssigned = !!checkin.assignedTo;
                    const checkinColor = checkin.status === "COMPLETED"
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                      : checkin.status === "IN_PROGRESS"
                      ? "bg-violet-500/15 text-violet-700 border-violet-500/30"
                      : isAssigned
                      ? "bg-blue-500/15 text-blue-700 border-blue-500/30"
                      : "bg-slate-400/15 text-slate-600 border-slate-400/30";
                    const checkinLabel = checkin.status === "COMPLETED"
                      ? "Completato"
                      : checkin.status === "IN_PROGRESS"
                      ? "In corso"
                      : isAssigned ? "Assegnato" : "Da assegnare";

                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        onClick={() => { if (!readOnly) router.push(`/dashboard/manager/checkins/${checkin.id}`); }}
                        className={`absolute top-[5.5rem] h-6 px-3 rounded-full border text-[10px] font-semibold z-[15] cursor-pointer transition-all duration-200 hover:scale-[1.05] hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap ${checkinColor}`}
                        title={`Check-in - ${checkinLabel.toUpperCase()}`}
                        style={{
                          left: getPosition(event.start) + 6,
                          width: Math.max(10, timelineDayWidth - 12),
                        }}
                      >
                        <LogIn size={11} className="opacity-70 shrink-0" />
                        <span className="text-[9px] font-bold uppercase truncate">{checkinLabel}</span>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Legenda */}
    <div className="mt-3 flex flex-col gap-2 px-4 py-3 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
      {/* Riga 1 — Stato Intervento */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-28 shrink-0">Stato Intervento</span>
        {[
          { color: "bg-red-500/15 border-red-500/30 text-red-700",            label: "Da fare" },
          { color: "bg-yellow-500/15 border-yellow-500/30 text-yellow-700",   label: "Assegnato" },
          { color: "bg-violet-500/15 border-violet-500/30 text-violet-700",   label: "In corso" },
          { color: "bg-sky-500/15 border-sky-500/30 text-sky-700",            label: "Completata" },
          { color: "bg-amber-500/15 border-amber-500/30 text-amber-700",      label: "In verifica" },
          { color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700",label: "Approvato" },
        ].map(({ color, label }) => (
          <span key={label} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${color}`}>
            <Paintbrush size={9} className="opacity-70" />{label}
          </span>
        ))}
      </div>

      {/* Separatore */}
      <div className="h-px bg-slate-200/60 w-full" />

      {/* Riga 2 — Stato Appartamento con dot */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-28 shrink-0">Appartamento</span>
        {[
          { dot: "bg-emerald-500", text: "text-emerald-700", label: "Pronto" },
          { dot: "bg-blue-500",    text: "text-blue-700",    label: "Non pronto" },
          { dot: "bg-red-500",     text: "text-red-700",     label: "Occupato" },
        ].map(({ dot, text, label }) => (
          <span key={label} className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${text}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
            {label}
          </span>
        ))}
      </div>
    </div>

    {/* Event Modal Overlay */}
    {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200" onClick={() => setSelectedEvent(null)}>

            {/* Modal Content — stopPropagation impedisce al click interno di chiudere il modal */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 [transform:translateZ(0)]" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-10 border-b border-slate-100 flex items-start justify-between bg-white">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center gap-2 ${
                                selectedEvent.type === 'booking' ? "bg-blue-500/10 text-blue-600" :
                                selectedEvent.type === 'cleaning' ? "bg-violet-500/10 text-violet-600" :
                                "bg-red-500/10 text-red-600"
                             }`}>
                                {selectedEvent.type === 'booking' ? <LogIn size={12} /> : selectedEvent.type === 'cleaning' ? <Paintbrush size={12} /> : <Wrench size={12} />}
                                {selectedEvent.type === 'booking' ? 'Prenotazione' : selectedEvent.type === 'cleaning' ? 'Pulizia' : 'Manutenzione'}
                             </div>
                             {selectedEvent.data.status && (
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                    <CircleCheck size={12} />
                                    {selectedEvent.data.status}
                                </span>
                             )}
                        </div>
                        <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">
                            {selectedEvent.type === 'maintenance' ? selectedEvent.data.title : selectedEvent.data.guestName || 'Intervento Operativo'}
                        </h2>
                        <p className="text-slate-500 font-semibold mt-1 uppercase text-sm tracking-wide">
                            {selectedEvent.data.apartment?.name || apartments.find(a => a.id === selectedEvent.data.apartmentId)?.name}
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedEvent(null)}
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 text-lg font-bold transition-colors"
                        aria-label="Chiudi"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto bg-white p-8 grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-900">
                    {/* Left Column: Details */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informazioni Chiave</h4>
                            <div className="space-y-4">
                                <DetailItem 
                                    icon={<CalendarDays size={22} className="text-violet-600" />} 
                                    label="Quando" 
                                    value={
                                      selectedEvent.type === "cleaning"
                                        ? formatRomeDateTimeDisplay(selectedEvent.data.date)
                                        : formatDateTime(selectedEvent.type === 'booking'
                                            ? selectedEvent.data.checkInDate
                                            : (selectedEvent.data.date || selectedEvent.data.scheduledStart))
                                    } 
                                />
                                <DetailItem 
                                    icon={<MapPin size={22} className="text-violet-600" />} 
                                    label="Indirizzo" 
                                    value={selectedEvent.data.apartment?.address || apartments.find(a => a.id === selectedEvent.data.apartmentId)?.address || "Non disponibile"} 
                                />
                                <DetailItem 
                                    icon={<UserCircle size={22} className="text-violet-600" />} 
                                    label={selectedEvent.type === 'booking' ? "Ospite" : selectedEvent.type === 'cleaning' ? "Cleaner" : "Tecnico"} 
                                    value={selectedEvent.data.assignedTo?.name || selectedEvent.data.guestName || "Non assegnato"} 
                                />
                            </div>
                        </div>

                        {/* Specific Sections */}
                        {selectedEvent.type === 'booking' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dettagli Soggiorno</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SummaryBox icon={<LogIn size={16} />} label="Check-in" value={formatDate(selectedEvent.data.checkInDate)} />
                                        <SummaryBox icon={<DoorOpen size={16} />} label="Check-out" value={formatDate(selectedEvent.data.checkOutDate)} />
                                        <SummaryBox icon={<UserCircle size={16} />} label="Ospiti" value={`${selectedEvent.data.totalGuests || 1} Persone`} />
                                        <SummaryBox icon={<CalendarDays size={16} />} label="Sorgente" value={selectedEvent.data.source || "Diretto"} />
                                    </div>
                                </div>

                                {/* Check-in manuale */}
                                {(() => {
                                    const apt = apartments.find(a => a.id === selectedEvent.data.apartmentId);
                                    const isReady = apt?.status === "GREEN";
                                    const alreadyCheckedIn = selectedEvent.data.status === "CHECKED_IN";

                                    if (alreadyCheckedIn) {
                                        return (
                                            <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-black uppercase tracking-widest">
                                                <LogIn size={13} /> Check in confermato
                                            </div>
                                        );
                                    }

                                    return showCheckInConfirm ? (
                                        <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-slate-700">Confermi che i clienti hanno effettuato il check in?</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setShowCheckInConfirm(false)}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-slate-50 transition-all"
                                                >
                                                    Annulla
                                                </button>
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleAction(async () => {
                                                        await confirmCheckIn(selectedEvent.data.id);
                                                        setShowCheckInConfirm(false);
                                                    })}
                                                    className="px-5 py-2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-md shadow-emerald-200 hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                >
                                                    ✓ Conferma
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            disabled={!isReady || isPending}
                                            onClick={() => setShowCheckInConfirm(true)}
                                            title={!isReady ? "Appartamento non ancora pronto" : "Conferma check-in anticipato"}
                                            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-200 shadow-md ${
                                                isReady
                                                    ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600 active:scale-95 cursor-pointer"
                                                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                            }`}
                                        >
                                            <LogIn size={14} />
                                            Check in ok
                                        </button>
                                    );
                                })()}
                            </div>
                        )}

                        {selectedEvent.type === 'cleaning' && (
                            <div className="space-y-6">
                                {(() => {
                                    const taskDayStart = new Date(selectedEvent.data.date);
                                    taskDayStart.setUTCHours(0, 0, 0, 0);
                                    const nextB = bookings
                                        .filter(b => b.apartmentId === selectedEvent.data.apartmentId && new Date(b.checkInDate) >= taskDayStart)
                                        .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())[0];
                                    const apt = apartments.find(a => a.id === selectedEvent.data.apartmentId);
                                    const linen = nextB
                                        ? calculateLinen(
                                            apt?.bedConfig,
                                            nextB.totalGuests ?? 0,
                                            !!(selectedEvent.data.cullaRequested ?? nextB.cullaRequested),
                                            !!(selectedEvent.data.sofaBedForced),
                                          )
                                        : null;

                                    return (
                                        <>
                                            {/* Target Preparazione */}
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Target Preparazione</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <SummaryBox
                                                        icon={<UserCircle size={16} />}
                                                        label="Preparazione Per"
                                                        value={nextB ? (nextB.guestName || "Ospite") : "Nessun arrivo"}
                                                    />
                                                    <SummaryBox
                                                        icon={<Users size={16} />}
                                                        label="Numero Ospiti"
                                                        value={nextB ? `${nextB.totalGuests} Persone` : "Non disponibile"}
                                                    />
                                                </div>
                                            </div>

                                            {/* Biancheria */}
                                            {nextB && linen && (
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Biancheria & Servizi</h4>

                                                    {/* Asciugamani + Tappetini */}
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-center gap-3">
                                                            <span className="text-base">🛁</span>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Asciugamani</p>
                                                                <p className="text-lg font-black text-slate-900 leading-none">{(nextB.totalGuests ?? 0) * 2}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-center gap-3">
                                                            <span className="text-base">🚿</span>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tappetini</p>
                                                                <p className="text-lg font-black text-slate-900 leading-none">{apt?.bathrooms ?? "—"}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Letti */}
                                                    <div className="space-y-2 mb-2">
                                                        {linen.beds.map(bed => (
                                                            <div key={bed.key} className={`flex items-center justify-between rounded-xl px-3 py-2 border ${bed.isFixed ? "bg-blue-50/80 border-blue-200/60" : "bg-amber-50/80 border-amber-200/60"}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${bed.isFixed ? "bg-blue-500" : "bg-amber-500"}`} />
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{bed.label} ×{bed.count}</p>
                                                                        <p className="text-[9px] text-slate-400 font-semibold">{bed.isFixed ? "fisso" : "aggiunto"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    {[
                                                                        { v: bed.linen.lenzuola, l: "Lenz." },
                                                                        { v: bed.linen.federe,   l: "Fed."  },
                                                                        { v: bed.linen.copriPiumino, l: "Cop." },
                                                                    ].map(chip => (
                                                                        <div key={chip.l} className="bg-white/70 border border-white/40 rounded-lg px-2 py-1 text-center min-w-[32px]">
                                                                            <p className="text-[11px] font-black text-slate-900 leading-none">{chip.v}</p>
                                                                            <p className="text-[7px] font-black uppercase tracking-wide text-slate-400">{chip.l}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Totali */}
                                                    <div className="bg-slate-900 rounded-xl px-3 py-2 flex mb-2">
                                                        {[
                                                            { v: linen.adults.lenzuola,     l: "Lenzuola" },
                                                            { v: linen.adults.federe,       l: "Federe"   },
                                                            { v: linen.adults.copriPiumino, l: "Copripium." },
                                                        ].map((t, i) => (
                                                            <div key={t.l} className={`flex-1 text-center ${i > 0 ? "border-l border-white/10" : ""}`}>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{t.l}</p>
                                                                <p className="text-base font-black text-white leading-none mt-0.5">{t.v}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Culla */}
                                                    {linen.culla && (
                                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">culla</span>
                                                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Lettino Neonato</span>
                                                            </div>
                                                            <div className="flex gap-1.5">
                                                                {[
                                                                    { v: linen.culla.lenzuola, l: "Lenz." },
                                                                    { v: linen.culla.federe,   l: "Fed."  },
                                                                ].map(chip => (
                                                                    <div key={chip.l} className="bg-emerald-100 border border-emerald-200 rounded-lg px-2 py-1 text-center min-w-[32px]">
                                                                        <p className="text-[11px] font-black text-emerald-900 leading-none">{chip.v}</p>
                                                                        <p className="text-[7px] font-black uppercase tracking-wide text-emerald-500">{chip.l}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}

                                {selectedEvent.data.notes && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-6">Note Operative</h4>
                                        <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 text-sm text-amber-900">
                                            "{selectedEvent.data.notes}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedEvent.type === 'maintenance' && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-6">Descrizione</h4>
                                <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10 text-sm text-slate-700">
                                    {selectedEvent.data.description || "Nessuna descrizione fornita."}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Status & Extras */}
                    <div className="space-y-6">

                        {/* ── Stato Operativo — compatto ── */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Stato Operativo</h4>

                            {/* Cleaning: box con checklist */}
                            {selectedEvent.type === 'cleaning' && (
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-500">Stato Attuale</span>
                                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase bg-white border border-slate-200 shadow-sm">
                                            {selectedEvent.data.status || 'ATTIVO'}
                                        </span>
                                    </div>
                                    {selectedEvent.data.checklistProgress && (
                                        <div className="pt-6 border-t border-slate-100">
                                            {(() => {
                                                const items = (selectedEvent.data.checklistProgress as any[]);
                                                const total = items.length;
                                                const completed = items.filter(i => i.completed).length;
                                                const isFullyCompleted = completed === total && total > 0;
                                                return (
                                                    <>
                                                        <div className="flex justify-between items-end mb-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Checklist Qualità</p>
                                                                <p className={`text-2xl font-semibold tracking-tight ${isFullyCompleted ? "text-emerald-600" : "text-slate-900"}`}>
                                                                    {completed} <span className="text-sm font-medium text-slate-400">/ {total} Punti</span>
                                                                </p>
                                                            </div>
                                                            {isFullyCompleted && (
                                                                <span className="bg-emerald-500/10 text-emerald-600 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-2">
                                                                    <CircleCheck size={12} />
                                                                    Completata
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 h-3">
                                                            {items.map((item, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex-1 rounded-full transition-all duration-500 ${
                                                                        item.completed
                                                                            ? (isFullyCompleted ? "bg-emerald-500 shadow-lg shadow-emerald-200/50" : "bg-violet-500 shadow-lg shadow-violet-200/50")
                                                                            : "bg-black/5"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Maintenance: singola riga compatta Stato + Priorità */}
                            {selectedEvent.type === 'maintenance' && (() => {
                                const priorityMap: Record<string, { label: string; color: string }> = {
                                    LOW:    { label: "Bassa",   color: "bg-slate-100 text-slate-500" },
                                    MEDIUM: { label: "Media",   color: "bg-amber-50 text-amber-600" },
                                    HIGH:   { label: "Alta",    color: "bg-orange-50 text-orange-600" },
                                    URGENT: { label: "Urgente", color: "bg-rose-50 text-rose-600" },
                                };
                                const statusMap: Record<string, { label: string; color: string }> = {
                                    PENDING:         { label: "In attesa",    color: "bg-slate-100 text-slate-600" },
                                    IN_PROGRESS:     { label: "In corso",     color: "bg-blue-50 text-blue-600" },
                                    AWAITING_REVIEW: { label: "In revisione", color: "bg-yellow-50 text-yellow-700" },
                                    APPROVED:        { label: "Approvato",    color: "bg-emerald-50 text-emerald-600" },
                                    RESOLVED:        { label: "Risolto",      color: "bg-emerald-50 text-emerald-600" },
                                };
                                const s = statusMap[selectedEvent.data.status] ?? { label: selectedEvent.data.status, color: "bg-slate-100 text-slate-600" };
                                const p = priorityMap[selectedEvent.data.priority] ?? { label: selectedEvent.data.priority, color: "bg-slate-100 text-slate-500" };
                                return (
                                    <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-slate-500">Stato</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border border-slate-200 shadow-sm ${s.color}`}>
                                                {s.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-slate-500">Priorità</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${p.color}`}>
                                                {p.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* ── Task da Eseguire — manutenzione ── */}
                        {selectedEvent.type === 'maintenance' && (() => {
                            const tasks = (selectedEvent.data.maintenanceTasks as any[] | null | undefined);
                            if (!tasks || tasks.length === 0) return null;
                            const total = tasks.length;
                            const done = tasks.filter(t => t.completed).length;
                            const isAll = done === total;
                            return (
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Task da Eseguire</h4>

                                    {/* Contatore + barra segmentata */}
                                    <div className="mb-4">
                                        <p className={`text-2xl font-semibold tracking-tight mb-2 ${isAll ? "text-emerald-600" : "text-slate-900"}`}>
                                            {done} <span className="text-sm font-medium text-slate-400">/ {total} Task</span>
                                            {isAll && (
                                                <span className="ml-3 text-xs font-semibold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-wide align-middle">
                                                    ✓ Tutte completate
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex gap-1.5 h-3">
                                            {tasks.map((task, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex-1 rounded-full transition-all duration-500 ${
                                                        task.completed
                                                            ? (isAll ? "bg-emerald-500 shadow-sm shadow-emerald-200/50" : "bg-amber-500 shadow-sm shadow-amber-200/50")
                                                            : "bg-black/5"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Lista task */}
                                    <div className="space-y-2">
                                        {tasks.map((task, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                                                    task.completed ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200"
                                                }`}
                                            >
                                                {/* Checkbox */}
                                                {task.completed ? (
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isAll ? "bg-emerald-500" : "bg-amber-500"}`}>
                                                        <span className="text-white text-[10px] font-black">✓</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                                                )}
                                                {/* Label */}
                                                <p className={`text-xs font-semibold flex-1 ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                                    {task.label}
                                                </p>
                                                {/* Foto badge */}
                                                {task.photoRequired && (
                                                    task.photoUrl ? (
                                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 shrink-0">📷 ✓</span>
                                                    ) : (
                                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shrink-0">📷</span>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* External IDs */}
                        {selectedEvent.data.externalId && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">ID Esterno</h4>
                                <code className="text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 block shadow-inner">{selectedEvent.data.externalId}</code>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="p-10 bg-white border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                        {!readOnly && selectedEvent.type === 'cleaning' && (
                            <>
                                {selectedEvent.data.status === 'PENDING' && (
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateCleaningStatus(selectedEvent.data.id, 'IN_PROGRESS'))}
                                        className="px-8 py-3.5 bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                                    >
                                        Avvia Pulizia
                                    </button>
                                )}
                                {selectedEvent.data.status === 'IN_PROGRESS' && (
                                    <button
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateCleaningStatus(selectedEvent.data.id, 'AWAITING_REVIEW'))}
                                        className="px-8 py-3.5 bg-amber-500 text-white text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        ✓ Completata — Invia per verifica
                                    </button>
                                )}
                                {selectedEvent.data.status === 'AWAITING_REVIEW' && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            disabled={isPending}
                                            onClick={() => handleAction(() => approveCleaningDirectly(selectedEvent.data.id))}
                                            className="px-8 py-3.5 bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                        >
                                            ✓ Approva
                                        </button>
                                        <span className="px-8 py-3.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold uppercase tracking-wide rounded-full">
                                            ⏳ In Attesa di Revisione
                                        </span>
                                    </div>
                                )}
                                {selectedEvent.data.status === 'APPROVED' && (
                                    <span className="px-8 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wide rounded-full">
                                        ✓ Approvata
                                    </span>
                                )}
                            </>
                        )}
                        {!readOnly && selectedEvent.type === 'maintenance' && (
                            <>
                                {selectedEvent.data.status === 'PENDING' && (
                                    <button
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateMaintenanceStatus(selectedEvent.data.id, 'IN_PROGRESS'))}
                                        className="px-8 py-3.5 bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                                    >
                                        Prendi in Carico
                                    </button>
                                )}
                                {selectedEvent.data.status === 'IN_PROGRESS' && (
                                    <button
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateMaintenanceStatus(selectedEvent.data.id, 'AWAITING_REVIEW'))}
                                        className="px-8 py-3.5 bg-amber-500 text-white text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        ✓ Completato — Invia per verifica
                                    </button>
                                )}
                                {selectedEvent.data.status === 'AWAITING_REVIEW' && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            disabled={isPending}
                                            onClick={() => handleAction(() => approveMaintenanceDirectly(selectedEvent.data.id))}
                                            className="px-8 py-3.5 bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                        >
                                            ✓ Approva
                                        </button>
                                        <span className="px-8 py-3.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wide rounded-full animate-pulse">
                                            ⏳ In verifica
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!readOnly && (
                    <div className="flex items-center gap-4">
                        {/* Edit Buttons */}
                        {selectedEvent.type === 'booking' && (
                            <Link
                                href={`/dashboard/manager/bookings/${selectedEvent.data.id}/edit`}
                                className="px-8 py-3.5 bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Modifica prenotazione
                            </Link>
                        )}
                        {selectedEvent.type === 'cleaning' && (
                            <Link
                                href={`/dashboard/manager/cleanings/${selectedEvent.data.id}/edit`}
                                className="px-8 py-3.5 bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Modifica pulizia
                            </Link>
                        )}
                        {selectedEvent.type === 'maintenance' && (
                            <Link
                                href={`/dashboard/manager/maintenance/${selectedEvent.data.id}/edit`}
                                className="px-8 py-3.5 bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Modifica ticket
                            </Link>
                        )}

                        {/* Delete Section */}
                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-4 bg-red-500/10 p-3 pl-6 rounded-full border border-red-500/20 animate-in slide-in-from-right-4 shadow-lg shadow-red-200/50">
                                <span className="text-xs font-semibold uppercase tracking-wide text-red-600">Eliminare l'evento?</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 bg-white/80 text-slate-500 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-white transition-all duration-200"
                                    >
                                        Annulla
                                    </button>
                                    <button
                                        disabled={isPending}
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-red-500 transition-all duration-200 disabled:opacity-50"
                                    >
                                        {isPending ? "Eliminazione..." : "Elimina"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-8 py-3.5 bg-white text-red-500 border border-red-200 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-red-50 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Elimina
                            </button>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </div>
    )}
    </>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-4 transition-all duration-200 hover:translate-x-1">
            <div className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl shadow-black/5 border border-white/20 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-base font-semibold text-slate-900 tracking-tight truncate">{value}</p>
            </div>
        </div>
    );
}

function SummaryBox({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
    return (
        <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl shadow-black/5 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
            <div className="flex items-center gap-2 mb-1.5">
                {icon && <div className="text-slate-400">{icon}</div>}
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-sm font-semibold text-slate-900 tracking-tight">{value}</p>
        </div>
    );
}

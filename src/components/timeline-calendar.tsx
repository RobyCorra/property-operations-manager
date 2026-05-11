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
import { deleteBooking } from "@/src/app/actions/booking";
import {
  deleteCleaningTask,
  deleteMaintenanceTicket,
  getCleaningTask,
  updateCleaningStatus,
  updateMaintenanceStatus
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
}

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
}

interface TimelineCalendarProps {
  apartments: Apartment[];
  bookings: Booking[];
  cleaningTasks: CleaningTask[];
  maintenanceTickets: MaintenanceTicket[];
  serverDate: string;
}

type CalendarEvent = {
  id: string;
  type: "booking" | "cleaning" | "maintenance";
  title: string;
  apartmentName?: string;
  start: Date;
  end: Date;
  status?: string;
  priority?: string;
  apartmentId: string;
  data: Booking | CleaningTask | MaintenanceTicket;
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

export default function TimelineCalendar({ apartments, bookings, cleaningTasks, maintenanceTickets, serverDate }: TimelineCalendarProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'booking' | 'cleaning' | 'maintenance', data: any } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const calendarEvents = useMemo<CalendarEvent[]>(() => (
    [
      ...bookingEvents,
      ...cleaningEvents,
      ...maintenanceEvents,
    ]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  ), [bookingEvents, cleaningEvents, maintenanceEvents]);

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
    ticket.priority === "URGENT" && ["OPEN", "IN_PROGRESS"].includes(ticket.status)
  );

  const isCleaningLate = (cleaning: CleaningTask) => (
    cleaning.status === "PENDING" && toLocalDateKey(cleaning.date) <= toLocalDateKey(currentClientTime)
  );

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
          <div className="h-16 border-b border-slate-200/80 flex items-center px-8">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Appartamento</span>
          </div>
          {apartments.map((apt) => {
            const dotColor: Record<string, string> = {
              GREEN: "bg-emerald-500",
              BLUE: "bg-blue-500",
              RED: "bg-red-500",
            };
            const dotLabel: Record<string, string> = {
              GREEN: "Pronto",
              BLUE: "Non pronto",
              RED: "Occupato",
            };
            return (
              <div key={apt.id} className="h-28 border-b-2 border-slate-200/70 flex flex-col justify-center px-8 truncate transition-all hover:bg-white/30">
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
          {/* Header Dates */}
          <div className="flex h-16 border-b border-white/20 sticky top-0 bg-white/40 backdrop-blur-xl z-10">
            {days.map((day, i) => {
              const isToday = toLocalDateKey(day) === toLocalDateKey(serverDate);
              const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
              const previousDay = days[i - 1];
              const isNewMonth = i === 0 || previousDay.getMonth() !== day.getMonth();
              const monthLabel = day.toLocaleDateString("it-IT", { month: "short" });
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              return (
                <div
                  key={i}
                  className={`flex-shrink-0 border-r flex flex-col items-center justify-center gap-0.5
                    ${isToday ? "bg-violet-500/8 border-violet-300/60 shadow-inner" : isWeekend ? "bg-slate-100/60 border-slate-200/70" : "bg-slate-50/30 border-slate-200/50"}`}
                  style={{ width: timelineDayWidth }}
                >
                  <span className={`h-3 text-[9px] font-bold uppercase tracking-wide ${isNewMonth ? "text-slate-500" : "text-transparent"}`}>
                    {isNewMonth ? monthLabel : "·"}
                  </span>
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
              <div key={apt.id} className="h-28 border-b-2 border-slate-200/70 relative group hover:bg-white/10 transition-colors">
                {calendarEvents.filter((event) => event.apartmentId === apt.id).map((event) => {
                  if (event.type === "booking") {
                    const booking = event.data as Booking;
                    const todayKey = toLocalDateKey(currentClientTime);
                    const checkInKey = toLocalDateKey(booking.checkInDate);
                    const checkOutKey = toLocalDateKey(booking.checkOutDate);
                    const statusTargetDate = todayKey >= checkInKey && todayKey < checkOutKey
                      ? currentClientTime
                      : booking.checkInDate;
                    const apartmentBookings = bookings
                      .filter((item) => item.status !== "CANCELLED" && item.apartmentId === apt.id)
                      .map((item) => ({
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
                      }));
                    const apartmentCleanings: PrismaCleaningTask[] = cleaningTasks
                      .filter((item) => item.status !== "CANCELLED" && item.apartmentId === apt.id)
                      .map((item) => ({
                        id: item.id,
                        createdAt: new Date(),
                        apartmentId: item.apartmentId,
                        date: new Date(item.date),
                        status: item.status,
                        assignedToId: item.assignedTo?.id ?? null,
                        notes: item.notes ?? null,
                        bookingId: null,
                        checklistProgress: item.checklistProgress ?? null,
                      }));
                    const apartmentTickets: PrismaMaintenanceTicket[] = maintenanceTickets
                      .filter((item) => item.status !== "CANCELLED" && item.apartmentId === apt.id)
                      .map((item) => ({
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
                      }));

                    const bookingStatus = getApartmentOperationalStatus(
                      statusTargetDate,
                      apartmentBookings as any,
                      apartmentCleanings as any,
                      apartmentTickets as any,
                      { now: currentClientTime }
                    );

                    const bgColors: Record<string, string> = {
                      GREEN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      BLUE: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                      RED: "bg-red-500/10 text-red-600 border-red-500/20"
                    };
                    const bookingNotReady = isBookingNotReady(booking);
                    const bookingColor = bookingNotReady
                      ? "bg-blue-500/10 text-red-700 border-blue-500/20 shadow-blue-100"
                      : bgColors[bookingStatus.color] || "bg-slate-500/10 text-slate-600 border-slate-500/20";

                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        onClick={() => setSelectedEvent({ type: "booking", data: booking })}
                        className={`absolute top-4 h-8 rounded-full border flex items-center gap-2 px-4 shadow-sm z-10 transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-95 cursor-pointer text-[11px] font-semibold tracking-tight whitespace-nowrap overflow-hidden ${bookingColor}`}
                        title={bookingNotReady ? `${event.title} - NON PRONTO` : event.title}
                        style={{
                          left: getPosition(event.start, true),
                          width: Math.max(timelineDayWidth - 8, getWidth(event.start, event.end) - 4),
                        }}
                      >
                        <LogIn size={12} className="opacity-70" /> {booking.totalGuests ?? 0} osp.
                        {bookingNotReady ? (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                            Non pronto
                          </span>
                        ) : null}
                      </div>
                    );
                  }

                  if (event.type === "cleaning") {
                    const cleaning = event.data as CleaningTask;
                    const cleaningLate = isCleaningLate(cleaning);
                    const cleaningUnassigned = cleaning.status === "PENDING" && !cleaning.assignedTo;

                    const cleaningColor = cleaning.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : cleaning.status === "IN_PROGRESS"
                      ? "bg-violet-500/10 text-violet-600 border-violet-500/20"
                      : cleaningUnassigned
                      ? "bg-rose-500/20 text-rose-700 border-rose-500/40 shadow-rose-100"
                      : cleaningLate
                      ? "bg-orange-500/20 text-orange-700 border-orange-500/40 shadow-orange-100"
                      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";

                    const cleaningLabel = cleaningUnassigned ? "Non assegnata" : cleaningLate ? "In ritardo" : null;

                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        onClick={() => setSelectedEvent({ type: "cleaning", data: cleaning })}
                        className={`absolute top-14 h-7 px-3 rounded-full border text-[10px] font-semibold z-10 cursor-pointer transition-all duration-200 hover:scale-[1.05] hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap ${cleaningColor}`}
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
                    const priorityColors: Record<string, string> = {
                      URGENT: "bg-red-500/15 text-red-700 border-red-500/30 shadow-red-100",
                      HIGH: "bg-orange-500/15 text-orange-700 border-orange-500/30 shadow-orange-100",
                      MEDIUM: "bg-violet-500/15 text-violet-700 border-violet-500/30 shadow-violet-100",
                      LOW: "bg-sky-500/15 text-sky-700 border-sky-500/30 shadow-sky-100",
                    };
                    const urgentOpenTicket = isUrgentOpenTicket(ticket);
                    const ticketColor = ticket.status === "RESOLVED"
                      ? "bg-slate-200 text-slate-600 border-slate-300"
                      : urgentOpenTicket
                      ? "bg-red-600/20 text-red-800 border-red-600/50 shadow-red-200"
                      : priorityColors[ticket.priority] || "bg-slate-500/15 text-slate-700 border-slate-500/30 shadow-slate-100";

                    return (
                      <div
                        key={`${event.type}-${event.id}`}
                        onClick={() => setSelectedEvent({ type: "maintenance", data: ticket })}
                        className={`absolute bottom-2 h-6 rounded-full z-20 cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-95 shadow-sm border flex items-center justify-center px-2 text-[9px] font-semibold uppercase tracking-tight whitespace-nowrap overflow-hidden ${ticketColor}`}
                        title={`${ticket.title} - ${ticket.status} - ${ticket.priority}`}
                        style={{
                          left: getPosition(event.start) + 6,
                          width: Math.max(10, timelineDayWidth - 12, getWidth(event.start, event.end) - 12),
                        }}
                      >
                        {urgentOpenTicket ? <span className="mr-1">⚠️</span> : <Wrench size={11} className="mr-1 opacity-70" />}
                        TICKET
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

    {/* Legenda stati pulizie */}
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pulizie</span>
      {[
        { color: "bg-yellow-500/15 border-yellow-500/30 text-yellow-700", label: "In attesa" },
        { color: "bg-rose-500/20 border-rose-500/40 text-rose-700", label: "Non assegnata" },
        { color: "bg-orange-500/20 border-orange-500/40 text-orange-700", label: "In ritardo" },
        { color: "bg-violet-500/10 border-violet-500/20 text-violet-700", label: "In corso" },
        { color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700", label: "Completata" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${color}`}>
            <Paintbrush size={9} className="opacity-70" />
            {label}
          </span>
        </div>
      ))}
    </div>

    {/* Legenda stati appartamenti */}
    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appartamenti</span>
      {[
        { color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700", label: "Pronto" },
        { color: "bg-blue-500/10 border-blue-500/20 text-blue-700", label: "Non pronto" },
        { color: "bg-red-500/10 border-red-500/20 text-red-700", label: "Occupato" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${color}`}>
            <Home size={9} className="opacity-70" />
            {label}
          </span>
        </div>
      ))}
    </div>

    {/* Event Modal Overlay */}
    {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setSelectedEvent(null)}></div>
            
            {/* Modal Content */}
            <div className="relative bg-white/60 backdrop-blur-2xl w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="p-10 border-b border-white/20 flex items-start justify-between bg-white/40">
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
                        className="p-3 hover:bg-black/5 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-900">
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
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dettagli Soggiorno</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <SummaryBox icon={<LogIn size={16} />} label="Check-in" value={formatDate(selectedEvent.data.checkInDate)} />
                                    <SummaryBox icon={<DoorOpen size={16} />} label="Check-out" value={formatDate(selectedEvent.data.checkOutDate)} />
                                    <SummaryBox icon={<UserCircle size={16} />} label="Ospiti" value={`${selectedEvent.data.totalGuests || 1} Persone`} />
                                    <SummaryBox icon={<CalendarDays size={16} />} label="Sorgente" value={selectedEvent.data.source || "Diretto"} />
                                </div>
                            </div>
                        )}

                        {selectedEvent.type === 'cleaning' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Target Preparazione</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(() => {
                                            const nextB = bookings
                                                .filter(b => b.apartmentId === selectedEvent.data.apartmentId && new Date(b.checkInDate) >= new Date(selectedEvent.data.date))
                                                .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())[0];
                                            
                                            return (
                                                <>
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
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

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
                    <div className="space-y-10">
                        <div>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-6">Stato Operativo</h4>
                            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl shadow-black/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-500">Stato Attuale</span>
                                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase bg-white/60 border border-white/20 shadow-sm">
                                        {selectedEvent.data.status || 'ATTIVO'}
                                    </span>
                                </div>
                                {selectedEvent.type === 'cleaning' && selectedEvent.data.checklistProgress && (
                                    <div className="pt-8 border-t border-white/20">
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
                                                    
                                                    {/* Segmented Progress Bar */}
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
                                {selectedEvent.type === 'maintenance' && (
                                    <div className="pt-6 border-t border-white/20">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-slate-500">Priorità</span>
                                            <span className={selectedEvent.data.priority === "URGENT" ? "text-red-600" : "text-slate-900"}>
                                                {selectedEvent.data.priority}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* External IDs */}
                        {selectedEvent.data.externalId && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">ID Esterno</h4>
                                <code className="text-xs font-mono bg-white/40 backdrop-blur-md p-3 rounded-xl border border-white/20 block shadow-inner">{selectedEvent.data.externalId}</code>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="p-10 bg-white/40 backdrop-blur-xl border-t border-white/20 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                        {selectedEvent.type === 'cleaning' && (
                            <>
                                {selectedEvent.data.status === 'PENDING' && (
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateCleaningStatus(selectedEvent.data.id, 'IN_PROGRESS'))}
                                        className="px-8 py-3.5 bg-white/60 border border-white/20 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-white/80 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        Avvia Pulizia
                                    </button>
                                )}
                                {selectedEvent.data.status === 'IN_PROGRESS' && (
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateCleaningStatus(selectedEvent.data.id, 'COMPLETED'))}
                                        className="px-8 py-3.5 bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        Segna Completata
                                    </button>
                                )}
                            </>
                        )}
                        {selectedEvent.type === 'maintenance' && (
                            <>
                                {selectedEvent.data.status === 'OPEN' && (
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateMaintenanceStatus(selectedEvent.data.id, 'IN_PROGRESS'))}
                                        className="px-8 py-3.5 bg-white/60 border border-white/20 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-white/80 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        Prendi in Carico
                                    </button>
                                )}
                                {selectedEvent.data.status === 'IN_PROGRESS' && (
                                    <button 
                                        disabled={isPending}
                                        onClick={() => handleAction(() => updateMaintenanceStatus(selectedEvent.data.id, 'RESOLVED'))}
                                        className="px-8 py-3.5 bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        Segna Risolto
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Edit Buttons */}
                        {selectedEvent.type === 'booking' && (
                            <Link 
                                href={`/dashboard/manager/bookings/${selectedEvent.data.id}/edit`}
                                className="px-8 py-3.5 bg-white/60 border border-white/20 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-white/80 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Modifica prenotazione
                            </Link>
                        )}
                        {selectedEvent.type === 'cleaning' && (
                            <Link 
                                href={`/dashboard/manager/cleanings/${selectedEvent.data.id}/edit`}
                                className="px-8 py-3.5 bg-white/60 border border-white/20 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-white/80 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Modifica pulizia
                            </Link>
                        )}
                        {selectedEvent.type === 'maintenance' && (
                            <Link 
                                href={`/dashboard/manager/maintenance/${selectedEvent.data.id}/edit`}
                                className="px-8 py-3.5 bg-white/60 border border-white/20 text-slate-900 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-white/80 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                                className="px-8 py-3.5 bg-white/60 text-red-500 border border-red-500/20 text-xs font-semibold uppercase tracking-wide rounded-full hover:bg-red-50/50 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Elimina
                            </button>
                        )}
                    </div>
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

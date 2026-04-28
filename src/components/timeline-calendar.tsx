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
import { formatDateKey, getApartmentOperationalStatus, type ApartmentStatus } from "@/src/lib/apartment-status";
import type { CleaningTask as PrismaCleaningTask, MaintenanceTicket as PrismaMaintenanceTicket, Prisma } from "@prisma/client";
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
import { Users } from "lucide-react";

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
  checklistProgress?: Prisma.JsonValue;
  apartment?: { name: string; address: string };
}

interface MaintenanceTicket {
  id: string;
  apartmentId: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date | string;
  scheduledStart?: Date | string | null;
  description?: string;
  assignedTo?: { id: string; name: string } | null;
  apartment?: { name: string; address: string };
}

interface Apartment {
  id: string;
  name: string;
  status: ApartmentStatus;
  address?: string;
}

interface TimelineCalendarProps {
  apartments: Apartment[];
  bookings: Booking[];
  cleanings: CleaningTask[];
  tickets: MaintenanceTicket[];
  serverDate: string;
}

const DAY_WIDTH = 100;
const DAYS_COUNT = 30;
const APARTMENT_COL_WIDTH = 250;

export default function TimelineCalendar({ apartments, bookings, cleanings, tickets, serverDate }: TimelineCalendarProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'booking' | 'cleaning' | 'maintenance', data: any } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Client-side clock for real-time 15:00 transition
  const [currentClientTime, setCurrentClientTime] = useState(() => new Date(serverDate));

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

  // Initialize from props to stay deterministic during hydration
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(serverDate);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - 2);
    return d;
  });

  const days = useMemo(() => {
    return Array.from({ length: DAYS_COUNT }).map((_, i) => {
      const d = new Date(startDate);
      d.setUTCDate(d.getUTCDate() + i);
      return d;
    });
  }, [startDate]);

  const getPosition = (dateStr: Date | string, offset: boolean = false) => {
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * DAY_WIDTH + (offset ? DAY_WIDTH / 2 : 0);
  };

  const getWidth = (startDateStr: Date | string, endDateStr: Date | string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0.5, diffDays) * DAY_WIDTH;
  };

  // Center scroll on "Today" (day index 2)
  useEffect(() => {
    setMounted(true);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 2 * DAY_WIDTH - 20;
    }
  }, []);

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
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

  return (
    <>
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-black/5 overflow-hidden font-sans transition-all duration-200 ease-in-out">
      <div className="p-8 border-b border-white/20">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Programma Operativo</h2>
        <p className="text-sm text-slate-500 mt-1">Timeline dei prossimi 30 giorni (clicca su un evento per dettagli)</p>
      </div>

      <div className="flex overflow-hidden relative" style={{ height: "auto", minHeight: "400px" }}>
        {/* Apartment List (Fixed Left) */}
        <div 
          className="z-20 bg-white/40 backdrop-blur-xl border-r border-white/20 flex-shrink-0"
          style={{ width: APARTMENT_COL_WIDTH }}
        >
          <div className="h-14 border-b border-white/20 flex items-center px-8">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Appartamento</span>
          </div>
          {apartments.map((apt) => (
            <div key={apt.id} className="h-24 border-b border-white/20 flex flex-col justify-center px-8 truncate transition-all hover:bg-white/10">
              <span className="text-base font-semibold text-slate-900 truncate tracking-tight">{apt.name}</span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold mt-1 tracking-wider">{apt.status}</span>
            </div>
          ))}
        </div>

        {/* Timeline Content (Scrollable Right) */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden select-none bg-white relative"
          style={{ cursor: "grab" }}
        >
          {/* Header Dates */}
          <div className="flex h-14 border-b border-white/20 sticky top-0 bg-white/40 backdrop-blur-xl z-10">
            {days.map((day, i) => {
              const isToday = i === 2;
              const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
              return (
                <div 
                  key={i} 
                  className={`flex-shrink-0 border-r border-white/10 flex flex-col items-center justify-center ${isToday ? "bg-violet-500/5 shadow-inner" : ""}`}
                  style={{ width: DAY_WIDTH }}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? "text-violet-600" : "text-slate-400"}`}>
                    {weekDays[day.getUTCDay()]}
                  </span>
                  <span className={`text-sm font-semibold ${isToday ? "text-violet-700" : "text-slate-900"}`}>
                    {day.getUTCDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          <div className="relative" style={{ width: DAYS_COUNT * DAY_WIDTH }}>
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {Array.from({ length: DAYS_COUNT }).map((_, i) => (
                <div key={i} className="h-full border-r border-white/10 flex-shrink-0" style={{ width: DAY_WIDTH }} />
              ))}
            </div>

            {apartments.map((apt) => (
              <div key={apt.id} className="h-24 border-b border-white/20 relative group hover:bg-white/5 transition-colors">
                {/* Booking Blocks */}
                {bookings.filter(b => b.apartmentId === apt.id).map(b => {
                  const todayKey = formatDateKey(currentClientTime);
                  const checkInKey = formatDateKey(b.checkInDate);
                  const checkOutKey = formatDateKey(b.checkOutDate);
                  const statusTargetDate = todayKey >= checkInKey && todayKey < checkOutKey
                    ? currentClientTime
                    : b.checkInDate;
                  const apartmentBookings = bookings
                    .filter(bx => bx.apartmentId === apt.id)
                    .map(bx => ({
                      id: bx.id,
                      createdAt: new Date(),
                      apartmentId: bx.apartmentId,
                      status: bx.status ?? null,
                      guestName: bx.guestName ?? null,
                      totalGuests: bx.totalGuests ?? 0,
                      checkInDate: new Date(bx.checkInDate),
                      checkOutDate: new Date(bx.checkOutDate),
                      externalId: bx.externalId ?? null,
                      source: bx.source ?? null,
                    }));
                  const apartmentCleanings: PrismaCleaningTask[] = cleanings
                    .filter(cx => cx.apartmentId === apt.id)
                    .map(cx => ({
                      id: cx.id,
                      createdAt: new Date(),
                      apartmentId: cx.apartmentId,
                      date: new Date(cx.date),
                      status: cx.status,
                      assignedToId: cx.assignedTo?.id ?? null,
                      notes: cx.notes ?? null,
                      bookingId: null,
                      checklistProgress: cx.checklistProgress ?? null,
                    }));
                  const apartmentTickets: PrismaMaintenanceTicket[] = tickets
                    .filter(tx => tx.apartmentId === apt.id)
                    .map(tx => ({
                      id: tx.id,
                      apartmentId: tx.apartmentId,
                      title: tx.title,
                      description: tx.description ?? "",
                      status: tx.status,
                      priority: tx.priority,
                      createdAt: new Date(tx.createdAt),
                      assignedToId: tx.assignedTo?.id ?? null,
                      scheduledStart: tx.scheduledStart ? new Date(tx.scheduledStart) : null,
                      scheduledEnd: null,
                      startedAt: null,
                      resolvedAt: null,
                    }));

                  const bookingStatus = getApartmentOperationalStatus(
                    statusTargetDate,
                    apartmentBookings,
                    apartmentCleanings,
                    apartmentTickets,
                    { now: currentClientTime }
                  );

                  const bgColors: Record<string, string> = {
                    GREEN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    BLUE: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    RED: "bg-red-500/10 text-red-600 border-red-500/20"
                  };

                  return (
                    <div 
                      key={b.id}
                      onClick={() => setSelectedEvent({ type: 'booking', data: b })}
                      className={`absolute top-4 h-8 rounded-full border flex items-center px-4 shadow-sm z-10 transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-95 cursor-pointer text-[11px] font-semibold tracking-tight whitespace-nowrap overflow-hidden ${bgColors[bookingStatus.color] || "bg-slate-500/10 text-slate-600 border-slate-500/20"}`}
                      title={`Clicca per dettagli`}
                      style={{ 
                        left: getPosition(b.checkInDate, true), 
                        width: getWidth(b.checkInDate, b.checkOutDate) - 4,
                      }}
                    >
                      <LogIn size={12} className="mr-2 opacity-70" /> {b.totalGuests ?? 0} osp.
                    </div>
                  );
                })}

                {/* Cleaning Blocks */}
                {cleanings.filter(c => c.apartmentId === apt.id).map(c => {
                  const statusColors: Record<string, string> = {
                    "PENDING": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                    "IN_PROGRESS": "bg-violet-500/10 text-violet-600 border-violet-500/20",
                    "COMPLETED": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  };
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedEvent({ type: 'cleaning', data: c })}
                      className={`absolute top-14 h-7 px-3 rounded-full border text-[10px] font-semibold z-10 cursor-pointer transition-all duration-200 hover:scale-[1.05] hover:shadow-md active:scale-95 shadow-sm flex items-center justify-center ${statusColors[c.status] || "bg-slate-400/10 text-slate-500 border-slate-400/20"}`}
                      title={`Clicca per dettagli`}
                      style={{ 
                        left: getPosition(c.date) + 6, 
                        width: DAY_WIDTH - 12
                      }}
                    >
                      <Paintbrush size={12} className="mr-1.5 opacity-70" /> PULIZIA
                    </div>
                  );
                })}

                {/* Maintenance Blocks */}
                {tickets.filter(t => t.apartmentId === apt.id && t.scheduledStart).map(t => {
                  const eventDate = t.scheduledStart!;
                  return (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedEvent({ type: 'maintenance', data: t })}
                      className={`absolute bottom-2 h-2.5 w-2.5 rounded-full z-10 cursor-pointer transition-all duration-200 hover:scale-150 active:scale-90 shadow-sm border ${t.status === "RESOLVED" ? "bg-white border-white/40" : "bg-red-500 border-red-600/50 shadow-red-200"}`}
                      title={`Clicca per dettagli`}
                      style={{ 
                        left: getPosition(eventDate) + 12
                      }}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
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
                                    value={formatDateTime(selectedEvent.type === 'booking' ? selectedEvent.data.checkInDate : (selectedEvent.data.date || selectedEvent.data.scheduledStart))} 
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

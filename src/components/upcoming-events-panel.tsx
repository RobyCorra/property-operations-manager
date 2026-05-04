"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { OperationalEvent, EventType } from "./operational-event-card";
import Link from "next/link";

interface Props {
  events: OperationalEvent[];
  serverDate: string;
}

import {
  CalendarDays,
  ChevronDown,
  LogIn,
  DoorOpen,
  Brush,
  Wrench,
  CircleCheck,
  LayoutDashboard,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const TYPE_CONFIG: Record<EventType | "ALL", { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  ALL: { label: "Tutti", icon: <LayoutDashboard size={18} />, color: "text-slate-600", bg: "bg-slate-50" },
  CHECKIN: { label: "Check-in", icon: <LogIn size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
  CHECKOUT: { label: "Check-out", icon: <DoorOpen size={18} />, color: "text-rose-600", bg: "bg-rose-50" },
  CLEANING: { label: "Pulizia", icon: <Brush size={18} />, color: "text-violet-600", bg: "bg-violet-50" },
  MAINTENANCE: { label: "Manutenzione", icon: <Wrench size={18} />, color: "text-orange-600", bg: "bg-orange-50" },
};

export default function UpcomingEventsPanel({ events, serverDate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<EventType | "ALL">("ALL");
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    return events.filter(e => filter === "ALL" || e.type === filter);
  }, [events, filter]);

  // Grouping Logic
  const groups = useMemo(() => {
    const today = new Date(serverDate);
    today.setHours(0,0,0,0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = {
      TODAY: [] as OperationalEvent[],
      TOMORROW: [] as OperationalEvent[],
      FUTURE: [] as OperationalEvent[]
    };

    filteredEvents.forEach(e => {
      const d = new Date(e.date);
      d.setHours(0,0,0,0);

      if (d.getTime() === today.getTime()) {
        res.TODAY.push(e);
      } else if (d.getTime() === tomorrow.getTime()) {
        res.TOMORROW.push(e);
      } else if (d.getTime() > tomorrow.getTime()) {
        res.FUTURE.push(e);
      }
    });

    // Sort each group
    Object.values(res).forEach(g => g.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

    return res;
  }, [filteredEvents, serverDate]);

  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 shadow-sm text-xs font-bold uppercase tracking-widest ${
          isOpen 
            ? "bg-slate-900 text-white border-slate-900" 
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:scale-95"
        }`}
      >
        <CalendarDays size={16} />
        In programma
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Hidden Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] lg:hidden" />
      )}

      {/* Panel / Bottom Sheet */}
      {isOpen && (
        <div className={`
          fixed inset-x-0 bottom-0 z-[100] bg-white rounded-t-[2.5rem] shadow-2xl border-t border-gray-100 flex flex-col max-h-[85vh]
          lg:absolute lg:top-full lg:bottom-auto lg:left-auto lg:right-0 lg:mt-3 lg:w-[420px] lg:rounded-3xl lg:border lg:max-h-[500px]
          animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-top-4 duration-200
        `}>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight uppercase">In programma</h3>
            <div className="relative">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as EventType | "ALL")}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide pb-12 lg:pb-6">
            {!hasEvents ? (
              <div className="py-12 text-center text-slate-300">
                <CircleCheck size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-slate-500 text-sm font-medium">Nessun evento in programma</p>
                <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-50">Tutto sotto controllo</p>
              </div>
            ) : (
              <>
                {groups.TODAY.length > 0 && <GroupSection title="Oggi" events={groups.TODAY} />}
                {groups.TOMORROW.length > 0 && <GroupSection title="Domani" events={groups.TOMORROW} />}
                {groups.FUTURE.length > 0 && <GroupSection title="Prossimi Giorni" events={groups.FUTURE} />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupSection({ title, events }: { title: string; events: OperationalEvent[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
        <div className="flex-1 h-px bg-gray-50"></div>
      </div>
      <div className="space-y-2">
        {events.map(event => (
          <EventListItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventListItem({ event }: { event: OperationalEvent }) {
  const config = TYPE_CONFIG[event.type];
  const showLateBadge = event.type === "CLEANING" && event.isLateCleaning;
  
  // Format Date: "22 Apr"
  const dateFormatted = event.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  
  // Format Time: "15:30" (24h)
  const timeFormatted = event.date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Actor Label
  const actorLabelMap: Record<EventType, string> = {
    CHECKIN: "Ospite",
    CHECKOUT: "Ospite",
    CLEANING: "Cleaner",
    MAINTENANCE: "Tecnico"
  };

  const detailLink = event.type === "CLEANING" 
    ? `/dashboard/manager/cleanings/${event.id.replace('clean-', '')}/edit`
    : event.type === "MAINTENANCE"
    ? `/dashboard/manager/maintenance/${event.id.replace('maint-', '')}/edit`
    : "#";

  return (
    <Link 
      href={detailLink}
      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 bg-white shadow-sm hover:shadow-md"
    >
      <div className={`w-12 h-12 shrink-0 ${config.bg} rounded-2xl flex flex-col items-center justify-center shadow-sm border border-black/5`}>
        <div className={config.color}>{config.icon}</div>
        <span className={`text-[7px] font-black uppercase tracking-widest ${config.color} leading-none mt-1`}>
          {config.label === "Check-in" ? "IN" : config.label === "Check-out" ? "OUT" : config.label.slice(0, 5)}
        </span>
      </div>
      
      <div className="flex-1 min-w-0 pr-2">
        <h5 className="text-sm font-black text-slate-900 truncate tracking-tight mb-1 uppercase">
          {event.apartmentName}
        </h5>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">{dateFormatted}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-900">{timeFormatted}</span>
          <span className="text-slate-300">·</span>
          <span className="truncate flex-1">
            {actorLabelMap[event.type]}: <span className="text-slate-900">{event.actorName || "Da assegnare"}</span>
          </span>
        </div>
        {showLateBadge && (
          <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-rose-700">
            <AlertTriangle size={11} />
            In ritardo
          </div>
        )}
      </div>

      <div className="text-slate-300 group-hover:text-violet-600 transition-colors shrink-0">
        <ChevronRight size={16} />
      </div>
    </Link>
  );
}

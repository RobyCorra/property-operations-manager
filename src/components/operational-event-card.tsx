"use client";

import SafeDate from "./safe-date";

export type EventType = "CHECKIN" | "CHECKOUT" | "CLEANING" | "MAINTENANCE";

export interface OperationalEvent {
  id: string;
  type: EventType;
  date: Date;
  apartmentName: string;
  subject: string;
  status: string;
  statusLabel?: string;
  actorName?: string;
  isLateCleaning?: boolean;
}

interface Props {
  event: OperationalEvent;
  serverDate: string;
}

const TYPE_META: Record<EventType, { label: string; icon: string; color: string; bg: string }> = {
  CHECKIN: { label: "Check-in", icon: "🔑", color: "text-blue-600", bg: "bg-blue-50" },
  CHECKOUT: { label: "Check-out", icon: "🚪", color: "text-rose-600", bg: "bg-rose-50" },
  CLEANING: { label: "Pulizia", icon: "🧹", color: "text-yellow-700", bg: "bg-yellow-50" },
  MAINTENANCE: { label: "Manutenzione", icon: "🛠️", color: "text-orange-600", bg: "bg-orange-50" },
};

export default function OperationalEventCard({ event, serverDate }: Props) {
  const meta = TYPE_META[event.type];

  // Helper to get only time if hours/mins are non-zero, else placeholder
  const hasTime = event.date.getUTCHours() !== 0 || event.date.getUTCMinutes() !== 0;

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>
              {meta.label}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {event.type === "CLEANING" ? (
                <SafeDate date={event.date} serverDate={serverDate} isExplicit={true} className="text-[10px]" />
              ) : hasTime ? (
                <SafeDate date={event.date} serverDate={serverDate} format={{ hour: '2-digit', minute: '2-digit' }} />
              ) : (
                "Flessibile"
              )}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight mt-1 uppercase">{event.apartmentName}</h3>
        </div>
        <div className={`w-12 h-12 ${meta.bg} rounded-2xl flex items-center justify-center text-xl`}>
          {meta.icon}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Intervento</p>
          <p className="text-sm font-semibold text-slate-700 tracking-tight">{event.subject}</p>
        </div>
        
        {event.statusLabel && (
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
            event.status === "COMPLETED" || event.status === "RESOLVED"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : event.status === "IN_PROGRESS"
              ? "bg-violet-50 text-violet-700 border-violet-100"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}>
            {event.statusLabel}
          </div>
        )}
      </div>
    </div>
  );
}

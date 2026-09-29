"use client";

import { useState } from "react";
import TimelineCalendar from "./timeline-calendar";

interface Props {
  apartments: any[];
  maintenanceTickets: any[];
  bookings: any[];
  cleaningTasks: any[];
  maintenanceDetailBase: string;
  serverDate: string;
}

export default function ImpresaMaintenanceCalendarWrapper({ apartments, maintenanceTickets, bookings, cleaningTasks, maintenanceDetailBase, serverDate }: Props) {
  const [mode, setMode] = useState<"maintenance" | "all">("maintenance");

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span>🔧</span> Calendario manutenzione
        </h2>
        <div className="ml-auto flex rounded-full border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setMode("maintenance")}
            className={`rounded-full px-3 py-1 transition-all ${mode === "maintenance" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Solo interventi
          </button>
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`rounded-full px-3 py-1 transition-all ${mode === "all" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Tutto
          </button>
        </div>
      </div>
      {mode === "all" && (
        <p className="text-[11px] text-slate-400 mb-2">Prenotazioni e pulizie visibili come contesto (sola lettura)</p>
      )}
      <TimelineCalendar
        apartments={apartments}
        bookings={mode === "all" ? bookings : []}
        cleaningTasks={mode === "all" ? cleaningTasks : []}
        maintenanceTickets={maintenanceTickets}
        maintenanceDetailBase={maintenanceDetailBase}
        serverDate={serverDate}
        readOnly
      />
    </div>
  );
}

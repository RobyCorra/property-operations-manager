"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type CalTicket = {
  id: string;
  title: string;
  apartmentName: string;
  priority: string;
  status: string;
  dateISO: string;
  scheduled: boolean;
  href: string;
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-amber-500",
  OPEN: "bg-amber-500",
  IN_PROGRESS: "bg-blue-500",
  RESOLVED: "bg-emerald-500",
  COMPLETED: "bg-emerald-500",
  CLOSED: "bg-slate-400",
};

export default function ImpresaMaintenanceCalendar({ tickets }: { tickets: CalTicket[] }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string>(ymd(now));

  const byDay = useMemo(() => {
    const map: Record<string, CalTicket[]> = {};
    for (const t of tickets) {
      const key = ymd(new Date(t.dateISO));
      (map[key] ??= []).push(t);
    }
    return map;
  }, [tickets]);

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  // Griglia: settimana lun→dom
  const firstOfMonth = new Date(cursor.y, cursor.m, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // 0 = lunedì
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.y, cursor.m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = ymd(now);
  const selectedTickets = byDay[selected] ?? [];

  function move(delta: number) {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Calendario interventi</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => move(-1)} className="h-7 w-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">‹</button>
          <span className="min-w-[130px] text-center text-xs font-semibold text-slate-700 capitalize">{monthLabel}</span>
          <button type="button" onClick={() => move(1)} className="h-7 w-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const key = ymd(d);
          const dayTickets = byDay[key] ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selected;
          const hasUrgent = dayTickets.some((t) => t.priority === "URGENT");
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`relative flex h-11 flex-col items-center justify-center rounded-lg border text-xs transition-colors ${
                isSelected ? "border-violet-400 bg-violet-50" : "border-transparent hover:bg-gray-50"
              }`}
            >
              <span className={`${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white" : "text-slate-700"} text-[11px] font-semibold`}>
                {d.getDate()}
              </span>
              {dayTickets.length > 0 && (
                <span className="mt-0.5 flex items-center gap-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${hasUrgent ? "bg-red-500" : STATUS_DOT[dayTickets[0].status] ?? "bg-slate-400"}`} />
                  {dayTickets.length > 1 && <span className="text-[9px] font-bold text-slate-400">{dayTickets.length}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 capitalize">
          {new Date(selected + "T00:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {selectedTickets.length === 0 ? (
          <p className="text-xs text-gray-400">Nessun intervento in questa data.</p>
        ) : (
          <div className="space-y-1.5">
            {selectedTickets.map((t) => (
              <Link key={t.id} href={t.href} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2 hover:bg-gray-100">
                <span className={`h-2 w-2 shrink-0 rounded-full ${t.priority === "URGENT" ? "bg-red-500" : STATUS_DOT[t.status] ?? "bg-slate-400"}`} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{t.title}</span>
                <span className="shrink-0 text-[11px] text-gray-400">{t.apartmentName}</span>
                {!t.scheduled && <span className="shrink-0 text-[9px] font-semibold uppercase text-slate-300">creazione</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

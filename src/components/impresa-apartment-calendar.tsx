"use client";

import { useState } from "react";
import Link from "next/link";
import { getApartmentOperationalStatus } from "@/src/lib/apartment-status";

// ── Types ─────────────────────────────────────────────────────────────
export type CalBooking = {
  id: string;
  guestName: string | null;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number | null;
  status: string | null;
};

export type CalCleaning = {
  id: string;
  date: string;
  status: string;
  assignedTo: { name: string } | null;
};

export type CalTicket = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  createdAt: string;
  scheduledStart: string | null;
  assignedTo: { name: string } | null;
};

type Props = {
  aptId: string;
  aptName: string;
  aptStatus: string;
  openTickets: number;
  bookings: CalBooking[];
  cleanings: CalCleaning[];
  tickets: CalTicket[];
};

// ── Helpers ───────────────────────────────────────────────────────────
function isoToYMD(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}
function fmtDateFull(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}
function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function statusLabelText(s: string, assigned: boolean) {
  if (s === "PENDING" && assigned) return "Assegnata";
  const map: Record<string, string> = {
    PENDING: "Da fare", IN_PROGRESS: "In corso", COMPLETED: "Completata",
    AWAITING_REVIEW: "In revisione", RESOLVED: "In revisione",
    APPROVED: "Approvata", CONFIRMED: "Confermata", DONE: "Approvata",
  };
  return map[s] ?? s;
}

function unifiedStatusColor(s: string, assigned = false): string {
  if (s === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (s === "AWAITING_REVIEW" || s === "RESOLVED") return "bg-amber-50 text-amber-700";
  if (s === "COMPLETED") return "bg-sky-50 text-sky-700";
  if (s === "IN_PROGRESS") return "bg-violet-50 text-violet-700";
  if (s === "PENDING" && assigned) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

function dotHex(status: string, assigned = false): string {
  if (status === "APPROVED") return "#10b981";
  if (["AWAITING_REVIEW", "RESOLVED"].includes(status)) return "#f59e0b";
  if (status === "COMPLETED") return "#0ea5e9";
  if (status === "IN_PROGRESS") return "#7c3aed";
  if (status === "PENDING" && assigned) return "#eab308";
  return "#ef4444";
}

function ticketDotHex(t: CalTicket): string { return dotHex(t.status, !!t.assignedTo); }

const statusBarColor: Record<string, string> = {
  GREEN: "#22c55e", BLUE: "#3b82f6", VIOLET: "#7c3aed", YELLOW: "#eab308", RED: "#ef4444",
};
const statusDotCls: Record<string, string> = {
  GREEN: "bg-emerald-500", RED: "bg-red-500", BLUE: "bg-blue-500", VIOLET: "bg-violet-500", YELLOW: "bg-yellow-400",
};
const statusTextCls: Record<string, string> = {
  GREEN: "text-emerald-600", RED: "text-red-600", BLUE: "text-blue-600", VIOLET: "text-violet-600", YELLOW: "text-yellow-600",
};
const statusLabels: Record<string, string> = {
  GREEN: "Pronto", RED: "Occupato", BLUE: "Non pronto", VIOLET: "In corso", YELLOW: "In revisione",
};

type CalTab = "calendar" | "bookings" | "cleanings" | "tickets";

export default function ImpresaApartmentCalendar({ aptId, aptName, aptStatus, openTickets, bookings, cleanings, tickets }: Props) {
  const nowDate = new Date();
  const [calTab, setCalTab] = useState<CalTab>("calendar");
  const [calMonth, setCalMonth] = useState({ year: nowDate.getFullYear(), month: nowDate.getMonth() });
  const [selectedDay, setSelectedDay] = useState<number | null>(nowDate.getDate());

  const { year, month } = calMonth;
  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayYMD = isoToYMD(nowDate.toISOString());

  // Month options
  const calMonthOptions: { value: string; label: string }[] = [];
  const calBase = new Date(); calBase.setDate(1);
  for (let i = -3; i <= 8; i++) {
    const d = new Date(calBase.getFullYear(), calBase.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    calMonthOptions.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  const calCurVal = `${year}-${String(month + 1).padStart(2, "0")}`;

  // Per-day maps
  const dayCleaningsMap = new Map<number, CalCleaning[]>();
  const dayTicketsMap = new Map<number, CalTicket[]>();

  const booksForStatus = bookings.map((b) => ({
    id: b.id, apartmentId: aptId, checkInDate: b.checkInDate, checkOutDate: b.checkOutDate, status: b.status ?? "CONFIRMED",
  }));
  const cleansForStatus = cleanings.map((c) => ({
    id: c.id, apartmentId: aptId, date: c.date, status: c.status,
  }));
  const ticketsForStatus = tickets.map((t) => ({
    id: t.id, apartmentId: aptId, status: t.status, priority: t.priority ?? "LOW",
    scheduledStart: t.scheduledStart ?? null, scheduledEnd: null,
  }));

  // Booking segments
  type SegType = "ci" | "co" | "occ" | "same";
  const bookingSegments = new Map<number, { id: string; type: SegType; guests: number; showGuests: boolean; barColor: string }[]>();

  bookings.forEach((b) => {
    const ciYMD = isoToYMD(b.checkInDate);
    const coYMD = isoToYMD(b.checkOutDate);
    const guests = b.totalGuests ?? 0;
    const isActiveNow = todayYMD >= ciYMD && todayYMD < coYMD;
    const targetDate = isActiveNow ? new Date() : new Date(b.checkInDate);
    const bookingStatus = getApartmentOperationalStatus(targetDate, booksForStatus, cleansForStatus, ticketsForStatus);
    const barColor = statusBarColor[bookingStatus.color] ?? "#22c55e";
    let firstOccSet = false;
    for (let d = 1; d <= daysInMonth; d++) {
      const ymd = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      let type: SegType | null = null;
      if (ymd === ciYMD && ymd === coYMD) type = "same";
      else if (ymd === ciYMD) type = "ci";
      else if (ymd === coYMD) type = "co";
      else if (ymd > ciYMD && ymd < coYMD) type = "occ";
      if (type) {
        const isFirstOcc = type === "occ" && !firstOccSet;
        if (isFirstOcc) firstOccSet = true;
        const showGuests = type === "same" || isFirstOcc;
        const arr = bookingSegments.get(d) ?? [];
        arr.push({ id: b.id, type, guests, showGuests, barColor });
        bookingSegments.set(d, arr);
      }
    }
  });

  cleanings.forEach((c) => {
    const [cy, cm, cd] = isoToYMD(c.date).split("-").map(Number);
    if (cy === year && cm === month + 1) {
      const arr = dayCleaningsMap.get(cd) ?? [];
      arr.push(c);
      dayCleaningsMap.set(cd, arr);
    }
  });
  tickets.forEach((t) => {
    const dateStr = t.scheduledStart ?? t.createdAt;
    const [cy, cm, cd] = isoToYMD(dateStr).split("-").map(Number);
    if (cy === year && cm === month + 1) {
      const arr = dayTicketsMap.get(cd) ?? [];
      arr.push(t);
      dayTicketsMap.set(cd, arr);
    }
  });

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // ── Selected day panel ─────────────────────────────────────────────
  function SelectedDayPanel() {
    if (!selectedDay) return null;
    const selYMD = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const panelBookings = bookings.filter((b) => {
      const ci = isoToYMD(b.checkInDate);
      const co = isoToYMD(b.checkOutDate);
      return selYMD === ci || selYMD === co || (selYMD > ci && selYMD < co);
    });
    const panelCleanings = dayCleaningsMap.get(selectedDay) ?? [];
    const panelTickets = dayTicketsMap.get(selectedDay) ?? [];
    const total = panelBookings.length + panelCleanings.length + panelTickets.length;
    const dateLabel = new Date(year, month, selectedDay)
      .toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

    return (
      <div className="bg-white rounded-2xl border border-violet-100 shadow-md overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
          <span className="text-[13px] font-black text-slate-900 capitalize">{dateLabel}</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{total} eventi</span>
            <button onClick={() => setSelectedDay(null)} className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        {total === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400 italic">Nessun evento in questa data</div>
        ) : (
          <div>
            {panelBookings.map((b) => {
              const isCI = isoToYMD(b.checkInDate) === selYMD;
              const isCO = isoToYMD(b.checkOutDate) === selYMD;
              const label = isCI ? "Check-in" : isCO ? "Check-out" : "In soggiorno";
              return (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0">
                  <div className="w-1 self-stretch rounded-full bg-violet-500 shrink-0" />
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 text-base">🏠</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] font-black uppercase tracking-wide text-violet-600">Prenotazione — {label}</div>
                    <div className="text-[12px] font-bold text-slate-900 truncate">{aptName}</div>
                    <div className="text-[9px] text-slate-500">{b.guestName ?? "Ospite"}{b.totalGuests ? ` · ${b.totalGuests} osp.` : ""}</div>
                    <div className="text-[9px] text-slate-400">{fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}</div>
                  </div>
                  <span className="text-[7px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">Solo lettura</span>
                </div>
              );
            })}
            {panelCleanings.map((c) => {
              const assigned = !!c.assignedTo;
              const info = { label: statusLabelText(c.status, assigned), badgeClass: unifiedStatusColor(c.status, assigned) };
              return (
                <Link key={c.id} href={`/dashboard/impresa/pulizie/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 active:bg-blue-50/40 last:border-b-0">
                  <div className="w-1 self-stretch rounded-full bg-blue-400 shrink-0" />
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-base">🧹</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] font-black uppercase tracking-wide text-blue-600">Pulizia</div>
                    <div className="text-[12px] font-bold text-slate-900 truncate">{aptName}</div>
                    <div className="text-[9px] text-slate-500">{c.assignedTo ? c.assignedTo.name : "Non assegnata"}</div>
                  </div>
                  <span className={`text-[7px] font-bold px-2 py-1 rounded-full shrink-0 ${info.badgeClass}`}>{info.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              );
            })}
            {panelTickets.map((t) => {
              const assigned = !!t.assignedTo;
              const barHex = dotHex(t.status, assigned);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0">
                  <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: barHex }} />
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ backgroundColor: barHex + "18" }}>🔧</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] font-black uppercase tracking-wide" style={{ color: barHex }}>Ticket · {statusLabelText(t.status, assigned)}</div>
                    <div className="text-[12px] font-bold text-slate-900 truncate">{t.title}</div>
                    <div className="text-[9px] text-slate-500">{t.assignedTo?.name ?? "Non assegnato"}</div>
                  </div>
                  <span className="text-[7px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded-full shrink-0">Solo lettura</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 px-4 pb-0 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${statusDotCls[aptStatus] ?? "bg-slate-400"}`} />
          <div className="flex-1 min-w-0">
            <h2 className="text-[19px] font-black text-slate-900 leading-tight">{aptName}</h2>
            <p className={`text-[10px] font-bold ${statusTextCls[aptStatus] ?? "text-slate-500"}`}>
              {statusLabels[aptStatus] ?? "—"}
              {openTickets > 0 && <span className="ml-2 text-rose-600">· {openTickets} ticket aperti</span>}
            </p>
          </div>
          <Link
            href="/dashboard/impresa"
            className="order-first w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 active:bg-slate-200 transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 pb-0">
          {(["calendar", "bookings", "cleanings", "tickets"] as const).map((tab) => {
            const labels: Record<CalTab, string> = { calendar: "Calendario", bookings: "Prenotazioni", cleanings: "Pulizie", tickets: "Ticket" };
            return (
              <button
                key={tab}
                onClick={() => setCalTab(tab)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-t-xl border-b-2 transition-colors ${
                  calTab === tab
                    ? "border-violet-600 text-violet-700 bg-violet-50"
                    : "border-transparent text-slate-500 bg-transparent"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ═══ CALENDAR TAB ═══ */}
        {calTab === "calendar" && (
          <div className="px-4 pt-4">
            {/* Month selector */}
            <div className="relative mb-3">
              <select
                value={calCurVal}
                onChange={(e) => {
                  const [y, m] = e.target.value.split("-").map(Number);
                  setCalMonth({ year: y, month: m - 1 });
                  setSelectedDay(null);
                }}
                className="w-full text-[15px] font-bold py-3 pl-4 pr-10 rounded-2xl border border-[#ede9f6] bg-white text-violet-700 appearance-none capitalize"
              >
                {calMonthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>

            {/* Calendar grid */}
            <div className="bg-white rounded-2xl pt-2 pb-1 shadow-sm border border-slate-100 mb-3 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7" style={{ borderBottom: "2px solid #e2e8f0", borderLeft: "1px solid #e2e8f0" }}>
                {Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString("it-IT", { weekday: "short" })).map((d, i) => (
                  <div key={d} className="text-center text-[8px] font-black uppercase py-1.5"
                    style={{ borderRight: "1px solid #e2e8f0", color: i >= 5 ? "#64748b" : "#94a3b8", background: i >= 5 ? "#f4f6f9" : "white" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              {weeks.map((week, wi) => (
                <div key={wi} style={{ borderBottom: wi < weeks.length - 1 ? "2px solid #e2e8f0" : undefined }}>
                  {/* Day numbers */}
                  <div className="grid grid-cols-7" style={{ borderLeft: "1px solid #e2e8f0" }}>
                    {week.map((d, di) => {
                      const isWeekend = di >= 5;
                      if (!d) return <div key={di} style={{ height: 32, borderRight: "1px solid #e2e8f0", background: isWeekend ? "#f4f6f9" : undefined }} />;
                      const ymd = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const isToday = ymd === todayYMD;
                      const isSelected = selectedDay === d;
                      return (
                        <div key={di} onClick={() => setSelectedDay(isSelected ? null : d)}
                          className="flex items-center justify-center cursor-pointer"
                          style={{ height: 32, borderRight: "1px solid #e2e8f0", background: isWeekend ? "#f4f6f9" : undefined, boxShadow: isSelected ? "inset 0 0 0 2px #1e1b4b" : undefined }}>
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold ${isToday ? "bg-violet-600 text-white font-black" : "text-slate-600"}`}>
                            {d}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Booking bars */}
                  <div className="grid grid-cols-7" style={{ height: 24, borderLeft: "1px solid #e2e8f0" }}>
                    {week.map((d, di) => {
                      const isWeekend = di >= 5;
                      const segs = d ? (bookingSegments.get(d) ?? []) : [];
                      return (
                        <div key={di} className="relative" style={{ height: 24, overflow: "visible", borderRight: "1px solid #e2e8f0", background: isWeekend ? "#f4f6f9" : undefined }}>
                          {segs.map((seg, si) => {
                            const isLeft = seg.type === "ci" || seg.type === "same";
                            const isRight = seg.type === "co" || seg.type === "same";
                            return (
                              <div key={si} className="absolute flex items-center"
                                style={{
                                  top: "50%", transform: "translateY(-50%)",
                                  left: isLeft ? "50%" : -1, right: isRight ? "50%" : -1,
                                  height: 18, background: seg.barColor, zIndex: 10, overflow: "hidden",
                                  borderRadius: seg.type === "ci" ? "9px 0 0 9px" : seg.type === "co" ? "0 9px 9px 0" : seg.type === "same" ? 9 : 0,
                                }}>
                                {seg.showGuests && seg.guests > 0 && (
                                  <span className="pl-2 whitespace-nowrap text-white" style={{ fontSize: 8, fontWeight: 800 }}>👤 {seg.guests}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dot row */}
                  <div className="grid grid-cols-7" style={{ height: 14, borderLeft: "1px solid #e2e8f0" }}>
                    {week.map((d, di) => {
                      const isWeekend = di >= 5;
                      const cleans = d ? (dayCleaningsMap.get(d) ?? []) : [];
                      const tix = d ? (dayTicketsMap.get(d) ?? []) : [];
                      return (
                        <div key={di} className="flex items-center justify-center gap-[2px]" style={{ borderRight: "1px solid #e2e8f0", background: isWeekend ? "#f4f6f9" : undefined }}>
                          {cleans.map((c, ci) => (
                            <span key={ci} style={{ width: 5, height: 5, borderRadius: "50%", background: dotHex(c.status, !!c.assignedTo), display: "block", flexShrink: 0 }} />
                          ))}
                          {tix.map((t, ti) => (
                            <span key={ti} style={{ width: 5, height: 5, borderRadius: "50%", background: ticketDotHex(t), display: "block", flexShrink: 0 }} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <SelectedDayPanel />

            {/* Legend */}
            <div className="mb-4 space-y-2">
              <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Stato appartamento</p>
                <div className="space-y-1.5">
                  {([
                    { color: "#22c55e", label: "Pronto", textColor: "#15803d" },
                    { color: "#3b82f6", label: "Non pronto", textColor: "#1d4ed8" },
                    { color: "#7c3aed", label: "In corso", textColor: "#6d28d9" },
                    { color: "#eab308", label: "In revisione", textColor: "#a16207" },
                    { color: "#ef4444", label: "Occupato", textColor: "#b91c1c" },
                  ] as const).map(({ color, label, textColor }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="flex shrink-0" style={{ height: 14 }}>
                        <div style={{ width: 14, background: color, borderRadius: "7px 0 0 7px" }} />
                        <div style={{ width: 20, background: color }} />
                        <div style={{ width: 14, background: color, borderRadius: "0 7px 7px 0" }} />
                      </div>
                      <span className="text-[9px] font-bold" style={{ color: textColor }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 px-3 py-2.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Pulizie</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {([
                    { hex: "#eab308", label: "In attesa" },
                    { hex: "#f43f5e", label: "Non assegnata" },
                    { hex: "#7c3aed", label: "In corso / revisione" },
                    { hex: "#22c55e", label: "Completata" },
                  ] as const).map(({ hex, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: hex, flexShrink: 0 }} />
                      <span className="text-[8px] font-semibold text-slate-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BOOKINGS TAB ═══ */}
        {calTab === "bookings" && (() => {
          const selYMD = selectedDay
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
            : null;
          const dayLabel = selectedDay
            ? new Date(year, month, selectedDay).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
            : null;
          const items = selYMD
            ? bookings.filter((b) => {
                const ci = isoToYMD(b.checkInDate);
                const co = isoToYMD(b.checkOutDate);
                return selYMD === ci || selYMD === co || (selYMD > ci && selYMD < co);
              })
            : [];
          return (
            <div className="px-4 pt-4 space-y-3">
              {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
              {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">Tocca un giorno nel calendario</div>}
              {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Nessuna prenotazione in questa data</div>}
              {items.map((b) => (
                <div key={b.id} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-1 bg-violet-500" />
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{aptName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{b.guestName ?? "Ospite"}</p>
                        <p className="text-[10px] text-slate-500">Check-in: {fmtDateFull(b.checkInDate)}</p>
                        <p className="text-[10px] text-slate-500">Check-out: {fmtDateFull(b.checkOutDate)}</p>
                        {b.totalGuests && <p className="text-[10px] text-slate-500">{b.totalGuests} ospiti · {diffDays(b.checkInDate, b.checkOutDate)} notti</p>}
                      </div>
                      <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full shrink-0">Solo lettura</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ═══ CLEANINGS TAB ═══ */}
        {calTab === "cleanings" && (() => {
          const selYMD = selectedDay
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
            : null;
          const dayLabel = selectedDay
            ? new Date(year, month, selectedDay).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
            : null;
          const items = selYMD
            ? cleanings.filter((c) => isoToYMD(c.date) === selYMD)
            : [];
          return (
            <div className="px-4 pt-4 space-y-3">
              {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
              {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">Tocca un giorno nel calendario</div>}
              {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Nessuna pulizia in questa data</div>}
              {items.map((c) => {
                const assigned = !!c.assignedTo;
                return (
                  <Link key={c.id} href={`/dashboard/impresa/pulizie/${c.id}`} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform">
                    <div className="h-1 bg-blue-400" />
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-lg">🧹</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">{aptName}</p>
                        {c.assignedTo && <p className="text-[10px] text-slate-400">{c.assignedTo.name}</p>}
                      </div>
                      <span className={`text-[8px] font-bold px-2 py-1 rounded-full shrink-0 ${unifiedStatusColor(c.status, assigned)}`}>{statusLabelText(c.status, assigned)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })()}

        {/* ═══ TICKETS TAB ═══ */}
        {calTab === "tickets" && (() => {
          const selYMD = selectedDay
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
            : null;
          const dayLabel = selectedDay
            ? new Date(year, month, selectedDay).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
            : null;
          const items = selYMD
            ? tickets.filter((t) => isoToYMD(t.scheduledStart ?? t.createdAt) === selYMD)
            : [];
          return (
            <div className="px-4 pt-4 space-y-3">
              {dayLabel && <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{dayLabel}</p>}
              {!selYMD && <div className="text-center py-12 text-slate-400 text-sm">Tocca un giorno nel calendario</div>}
              {selYMD && items.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">Nessun ticket in questa data</div>}
              {items.map((t) => (
                <div key={t.id} className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-1 bg-rose-400" />
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-900 flex-1 min-w-0">{t.title}</p>
                      <span className="text-[8px] font-bold bg-slate-50 text-slate-600 px-2 py-1 rounded-full shrink-0">{t.priority ?? "Normal"}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Stato: {statusLabelText(t.status, !!t.assignedTo)}</p>
                    {t.assignedTo && <p className="text-[10px] text-slate-500">Assegnato a {t.assignedTo.name}</p>}
                    {t.scheduledStart && <p className="text-[10px] text-slate-500">Previsto: {fmtDateFull(t.scheduledStart)}</p>}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

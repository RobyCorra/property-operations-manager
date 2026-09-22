"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

type CleaningItem = {
  id: string;
  date: string;
  status: string;
  apartmentId: string;
  apartmentName: string;
  assignedToName: string | null;
  href: string;
};

type Apartment = { id: string; name: string };

function isoToYMD(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function statusLabel(s: string, assigned: boolean) {
  if (s === "APPROVED") return "Approvato";
  if (s === "AWAITING_REVIEW") return "In revisione";
  if (s === "COMPLETED") return "Completata";
  if (s === "IN_PROGRESS") return "In corso";
  if (s === "PENDING" && assigned) return "Assegnata";
  return "Da assegnare";
}

function statusBadgeClass(s: string, assigned: boolean) {
  if (s === "APPROVED") return "bg-emerald-50 text-emerald-700";
  if (s === "AWAITING_REVIEW") return "bg-amber-50 text-amber-700";
  if (s === "COMPLETED") return "bg-sky-50 text-sky-700";
  if (s === "IN_PROGRESS") return "bg-violet-50 text-violet-700";
  if (s === "PENDING" && assigned) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

function barColor(s: string, assigned: boolean) {
  if (s === "APPROVED") return "bg-emerald-500";
  if (s === "AWAITING_REVIEW") return "bg-amber-400";
  if (s === "COMPLETED") return "bg-sky-400";
  if (s === "IN_PROGRESS") return "bg-violet-500";
  if (assigned) return "bg-yellow-400";
  return "bg-red-400";
}

function iconBg(s: string, assigned: boolean) {
  if (s === "APPROVED") return "bg-emerald-50";
  if (s === "AWAITING_REVIEW") return "bg-amber-50";
  if (s === "COMPLETED") return "bg-sky-50";
  if (s === "IN_PROGRESS") return "bg-violet-100";
  if (assigned) return "bg-yellow-50";
  return "bg-red-50";
}

function iconStroke(s: string, assigned: boolean) {
  if (s === "APPROVED") return "#10b981";
  if (s === "AWAITING_REVIEW") return "#f59e0b";
  if (s === "COMPLETED") return "#38bdf8";
  if (s === "IN_PROGRESS") return "#7c3aed";
  if (assigned) return "#eab308";
  return "#ef4444";
}

const BRUSH_ICON = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="inherit" strokeWidth="2.5">
    <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
  </svg>
);

export default function ImpresaCleaningsMobile({
  initialCleanings,
  apartments,
  serverDate,
}: {
  initialCleanings: CleaningItem[];
  apartments: Apartment[];
  serverDate: string;
}) {
  const router = useRouter();
  const nowForSheet = new Date();
  const [month, setMonth] = useState(`${nowForSheet.getFullYear()}-${String(nowForSheet.getMonth() + 1).padStart(2, "0")}`);
  const [aptFilter, setAptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [data, setData] = useState<CleaningItem[]>(initialCleanings);
  const [loading, setLoading] = useState(false);

  const fetchCleanings = useCallback(async (m: string, apt: string, st: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: m });
      if (apt !== "ALL") params.set("apartmentId", apt);
      if (st !== "ALL") params.set("status", st);
      const res = await fetch(`/api/impresa/cleanings-all?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const todayYMD = isoToYMD(serverDate);
  const todayItems = useMemo(() => data.filter((c) => isoToYMD(c.date) === todayYMD), [data, todayYMD]);
  const otherItems = useMemo(() => data.filter((c) => isoToYMD(c.date) !== todayYMD), [data, todayYMD]);

  const grouped = useMemo(() => {
    const map: Record<string, CleaningItem[]> = {};
    otherItems.forEach((item) => {
      const d = new Date(item.date);
      const key = d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [otherItems]);
  const groupKeys = Object.keys(grouped);

  const todayDateLabel = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    const base = new Date(); base.setDate(1);
    for (let i = -3; i <= 8; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
      opts.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return opts;
  }, []);

  const statusOptions = [
    { value: "ALL", label: "Tutte" },
    { value: "PENDING", label: "In attesa" },
    { value: "IN_PROGRESS", label: "In corso" },
    { value: "AWAITING_REVIEW", label: "Revisione" },
    { value: "COMPLETED", label: "Completate" },
    { value: "APPROVED", label: "Approvate" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f8f7ff]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-[#ede9fe] shrink-0 bg-[#f8f7ff]">
        <button
          onClick={() => router.push("/dashboard/impresa")}
          className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="text-lg font-bold text-slate-900">Pulizie</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Hero Oggi */}
        <div
          className="mx-4 mt-4 mb-3 rounded-3xl p-4 text-white shadow-[0_10px_24px_rgba(124,58,237,.28)]"
          style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-[.12em] opacity-85 capitalize">Oggi · {todayDateLabel}</p>
          <p className="text-3xl font-black leading-none mt-1 mb-3">
            {todayItems.length}
            <span className="text-sm font-bold opacity-90 ml-2">
              {todayItems.length === 1 ? "pulizia oggi" : "pulizie oggi"}
            </span>
          </p>
          {todayItems.length === 0 ? (
            <div className="rounded-2xl bg-white/15 border border-white/20 py-3 text-center text-xs font-bold">
              ✓ Nessuna pulizia per oggi
            </div>
          ) : (
            <div className="space-y-2">
              {todayItems.map((item) => {
                const assigned = !!item.assignedToName;
                const st = statusLabel(item.status, assigned);
                const time = new Date(item.date).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className="rounded-2xl bg-white/15 border border-white/20 px-3 py-2.5 flex items-center gap-3 active:bg-white/25 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/25 flex items-center justify-center shrink-0" style={{ stroke: "#fff" }}>
                      {BRUSH_ICON}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate">{item.apartmentName}</p>
                      <p className="text-[11px] opacity-85 truncate">
                        {item.assignedToName ?? "Non assegnata"} · {st}
                      </p>
                    </div>
                    <span className="text-[11.5px] font-bold bg-white/25 px-2.5 py-1 rounded-full shrink-0">{time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="px-5 pt-2 pb-2 flex items-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[.09em] text-slate-400">Tutte le pulizie</p>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Filtri: appartamento + mese */}
        <div className="px-4 py-2 flex gap-2">
          <select
            value={aptFilter}
            onChange={(e) => { setAptFilter(e.target.value); fetchCleanings(month, e.target.value, statusFilter); }}
            className="flex-1 text-[12px] font-bold py-2 px-3 rounded-xl border border-[#ede9fe] bg-white text-violet-700 min-w-0 appearance-none"
          >
            <option value="ALL">Tutti gli appartamenti</option>
            {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select
            value={month}
            onChange={(e) => { setMonth(e.target.value); fetchCleanings(e.target.value, aptFilter, statusFilter); }}
            className="flex-1 text-[12px] font-bold py-2 px-3 rounded-xl border border-[#ede9fe] bg-white text-violet-700 min-w-0 appearance-none capitalize"
          >
            {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Filtri: stato pills */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); fetchCleanings(month, aptFilter, opt.value); }}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap border transition-all ${
                statusFilter === opt.value
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-500 border-[#ede9fe]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Lista per giorno */}
        {loading ? (
          <div className="px-5 py-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="h-1 bg-slate-100 animate-pulse" />
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 animate-pulse rounded w-3/4" />
                    <div className="h-2 bg-slate-100 animate-pulse rounded w-1/2" />
                  </div>
                  <div className="w-16 h-6 bg-slate-100 animate-pulse rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : groupKeys.length === 0 && todayItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Nessuna pulizia trovata per questo mese</div>
        ) : (
          <div className="px-5 py-3 space-y-5">
            {groupKeys.map((dayLabel) => (
              <div key={dayLabel}>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 capitalize">{dayLabel}</p>
                <div className="space-y-2">
                  {grouped[dayLabel].map((item) => {
                    const assigned = !!item.assignedToName;
                    const bc = barColor(item.status, assigned);
                    const badge = statusBadgeClass(item.status, assigned);
                    const lbl = statusLabel(item.status, assigned);
                    const timeStr = new Date(item.date).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
                    const ibg = iconBg(item.status, assigned);
                    const is2 = iconStroke(item.status, assigned);
                    return (
                      <div
                        key={item.id}
                        onClick={() => router.push(item.href)}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-[.99] transition-transform cursor-pointer"
                      >
                        <div className={`h-1 ${bc}`} />
                        <div className="px-4 py-3 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${ibg} flex items-center justify-center shrink-0`} style={{ stroke: is2 }}>
                            {BRUSH_ICON}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{item.apartmentName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{item.assignedToName ?? "Non assegnata"} · {timeStr}</p>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${badge}`}>{lbl}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

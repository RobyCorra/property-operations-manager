"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AnalyticsData, PeriodStats, MonthKey, PersonRow, ApartmentRow } from "@/src/app/actions/analytics";
import { Clock, RotateCcw, Building2, Sparkles, Wrench, BarChart2 } from "lucide-react";

const MONTH_NAMES = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

type Filters = {
  cleaners: { id: string; name: string }[];
  manutentori: { id: string; name: string }[];
  apartments: { id: string; name: string }[];
};

function monthLabel(mk: MonthKey) {
  const [y, m] = mk.split("-");
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString("it-IT", { month: "short" })
    .replace(".", "");
}

// ── Sparkline SVG ──────────────────────────────────────────────────────────
function Sparkline({ values, warn, width = 80, height = 28 }: {
  values: number[];
  warn: boolean;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * w;
    const y = pad + (1 - v / max) * h;
    return `${x},${y}`;
  });
  const linePath = `M${pts.join(" L")}`;
  const fillPath = `M${pts.join(" L")} L${pad + w},${pad + h} L${pad},${pad + h} Z`;
  const color = warn ? "#ff9f0a" : "#1c1c1e";
  const lastPt = pts[pts.length - 1].split(",");
  const uid = Math.random().toString(36).slice(2, 7);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={warn ? 0.15 : 0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={linePath} stroke={warn ? "#ff9f0a" : "#c7c7cc"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={fillPath} fill={`url(#g${uid})`} />
      <circle cx={lastPt[0]} cy={lastPt[1]} r={3} fill={color} />
    </svg>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────
function StatPill({ n, type }: { n: number; type: "late" | "review" }) {
  const hasIssue = n > 0;
  const base = "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md";
  const style = hasIssue
    ? type === "late"
      ? "bg-amber-100 text-amber-800"
      : "bg-pink-100 text-pink-800"
    : "bg-[#f2f2f7] text-[#8e8e93]";
  return (
    <span className={`${base} ${style}`}>
      {type === "late" ? <Clock size={10} strokeWidth={2} /> : <RotateCcw size={10} strokeWidth={2} />}
      {n}
    </span>
  );
}

// ── Status dot ────────────────────────────────────────────────────────────
function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold">
      <span className={`w-[7px] h-[7px] rounded-full ${ok ? "bg-[#30d158]" : "bg-[#ff9f0a]"}`} />
      <span style={{ color: ok ? "#30d158" : "#ff9f0a" }}>{ok ? "Ok" : "Attenzione"}</span>
    </span>
  );
}

// ── Section icon badge ────────────────────────────────────────────────────
function IconBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center ${color}`}>
      {children}
    </div>
  );
}

// ── Apartment stat block ───────────────────────────────────────────────────
function AptStatBlock({
  type, stats, monthValues,
}: {
  type: "clean" | "maint";
  stats: PeriodStats;
  monthValues: number[];
}) {
  const warn = stats.late > 0 || stats.reviews > 0;
  const isClean = type === "clean";
  const pendingWarn = isClean && stats.pending > 0 && warn;
  return (
    <div className="flex-1 rounded-[11px] bg-[#f2f2f7] p-3">
      <div className="flex items-center gap-1.5 mb-2">
        {isClean
          ? <Sparkles size={12} strokeWidth={2} className="text-[#8e8e93]" />
          : <Wrench size={12} strokeWidth={2} className="text-[#8e8e93]" />}
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8e8e93]">
          {isClean ? "Pulizie" : "Manutenzione"}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[28px] font-[800] leading-none text-[#1c1c1e]">{stats.total}</span>
          <div className="text-[10px] text-[#8e8e93] mt-0.5">completate</div>
        </div>
        <Sparkline values={monthValues} warn={warn} width={80} height={28} />
      </div>
      <div className="flex gap-1 mt-1.5">
        <StatPill n={stats.late} type="late" />
        <StatPill n={stats.reviews} type="review" />
      </div>
      {isClean && (
        <>
          <div className="h-px bg-[#d1d1d6] my-2" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-[500] text-[#8e8e93]">⏳ Da fare</span>
            <span className={`text-[11px] font-[700] px-2 py-0.5 rounded-[6px] ${
              stats.pending === 0
                ? "bg-[#f2f2f7] text-[#8e8e93] font-[500]"
                : pendingWarn
                ? "bg-[#fff3e0] text-[#e65100]"
                : "bg-[#e5f0ff] text-[#0071e3]"
            }`}>
              {stats.pending}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ data, filters, selectedYear, selectedMonth: selectedMonthProp }: {
  data: AnalyticsData;
  filters: Filters;
  selectedYear?: number;
  selectedMonth?: number;
}) {
  const router = useRouter();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const activeYear = selectedYear ?? currentYear;
  const activeMonth = selectedMonthProp ?? currentMonth;
  const activeMonthKey: MonthKey = `${activeYear}-${String(activeMonth).padStart(2, "0")}`;

  // Years from 2024 to current year
  const yearOptions = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i).reverse();

  const handleYearChange = (y: number) => {
    router.push(`?year=${y}&month=${activeMonth}`);
  };
  const handleMonthChange = (m: number) => {
    router.push(`?year=${activeYear}&month=${m}`);
  };

  // Use activeMonthKey as the selected month for stats display
  const selectedMonth = data.months.includes(activeMonthKey)
    ? activeMonthKey
    : data.months[data.months.length - 1];

  const [filterCleaner, setFilterCleaner] = useState("");
  const [filterManut, setFilterManut] = useState("");
  const [filterAptClean, setFilterAptClean] = useState("");
  const [filterAptManut, setFilterAptManut] = useState("");

  // Filter apartments by cleaner/manutentore
  const apartments = useMemo(() => {
    return data.apartments.filter(apt => {
      if (filterCleaner && !(data.aptCleaners[apt.id] ?? []).includes(filterCleaner)) return false;
      if (filterManut && !(data.aptManuts[apt.id] ?? []).includes(filterManut)) return false;
      return true;
    });
  }, [data.apartments, data.aptCleaners, data.aptManuts, filterCleaner, filterManut]);

  // Filter cleaners by apartment
  const cleaners = useMemo(() => {
    if (!filterAptClean) return data.cleaners;
    return data.cleaners.filter(c => (data.cleanerApts[c.id] ?? []).includes(filterAptClean));
  }, [data.cleaners, data.cleanerApts, filterAptClean]);

  const manutentori = useMemo(() => {
    if (!filterAptManut) return data.manutentori;
    return data.manutentori.filter(m => (data.manutApts[m.id] ?? []).includes(filterAptManut));
  }, [data.manutentori, data.manutApts, filterAptManut]);

  const getStats = (row: ApartmentRow | PersonRow, month: MonthKey, key?: "cleanings" | "maintenance") => {
    if ("cleanings" in row) {
      return key === "maintenance" ? row.maintenance[month] : row.cleanings[month];
    }
    return (row as PersonRow).months[month];
  };

  const isPersonWarn = (row: PersonRow) => {
    return data.months.some(m => row.months[m]?.late > 0 || row.months[m]?.reviews > 0);
  };

  const isAptWarn = (row: ApartmentRow) => {
    const m = selectedMonth;
    return (row.cleanings[m]?.late ?? 0) > 0 || (row.cleanings[m]?.reviews ?? 0) > 0 ||
           (row.maintenance[m]?.late ?? 0) > 0 || (row.maintenance[m]?.reviews ?? 0) > 0;
  };

  const selectBase = "text-[13px] font-[500] border border-[#c6c6c8] rounded-[8px] px-[10px] py-[5px] outline-none bg-white text-[#1c1c1e] appearance-none pr-6";

  return (
    <div className="min-h-screen" style={{ background: "#f2f2f7", fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}>

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-50 border-b border-black/[.08]"
           style={{ background: "rgba(255,255,255,.88)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-[1100px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-[#1c1c1e] flex items-center justify-center">
              <BarChart2 size={18} color="white" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[17px] font-[700] text-[#1c1c1e]">Analytics operativi</div>
              <div className="text-[12px] text-[#8e8e93]">Pulizie e manutenzioni</div>
            </div>
          </div>

          {/* Year + Month selectors */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-[500] text-[#8e8e93]">Periodo</span>
            <div className="relative">
              <select
                value={activeYear}
                onChange={e => handleYearChange(Number(e.target.value))}
                className="appearance-none bg-white border border-[#d1d1d6] rounded-[10px] px-3 py-[6px] pr-7 text-[14px] font-[600] text-[#1c1c1e] outline-none cursor-pointer"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}
              >
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8e8e93]">▾</span>
            </div>
            <div className="relative">
              <select
                value={activeMonth}
                onChange={e => handleMonthChange(Number(e.target.value))}
                className="appearance-none bg-white border border-[#d1d1d6] rounded-[10px] px-3 py-[6px] pr-7 text-[14px] font-[600] text-[#1c1c1e] outline-none cursor-pointer"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,.06)", minWidth: 120 }}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8e8e93]">▾</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#1c1c1e] text-white text-[13px] font-[600] px-3 py-[5px] rounded-full">
              <span className="w-[6px] h-[6px] rounded-full bg-[#30d158]" />
              {MONTH_NAMES[activeMonth - 1]?.slice(0, 3)} {activeYear}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 py-6 flex flex-col gap-10">

        {/* ══ APPARTAMENTI ══ */}
        <section>
          <div className="flex items-center gap-2 mb-2 px-1">
            <IconBadge color="bg-blue-100 text-blue-700"><Building2 size={16} strokeWidth={1.75} /></IconBadge>
            <span className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[.02em]">Appartamenti</span>
          </div>
          <div className="bg-white rounded-[16px] overflow-hidden" style={{ border: ".5px solid #e5e5ea" }}>
            {/* Filters */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ background: "#f9f9fb", borderColor: "#e5e5ea" }}>
              <span className="text-[12px] font-[500] text-[#8e8e93]">Filtra per</span>
              <select className={selectBase} value={filterCleaner} onChange={e => setFilterCleaner(e.target.value)}>
                <option value="">Tutti i cleaner</option>
                {filters.cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className={selectBase} value={filterManut} onChange={e => setFilterManut(e.target.value)}>
                <option value="">Tutti i manutentori</option>
                {filters.manutentori.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div className="ml-auto flex gap-4 text-[11px] text-[#8e8e93] font-[500]">
                <span className="flex items-center gap-1"><Clock size={12} strokeWidth={2} className="text-amber-500" /> avviato in ritardo</span>
                <span className="flex items-center gap-1"><RotateCcw size={12} strokeWidth={2} className="text-pink-500" /> task richiesta di ripetere</span>
              </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "#e5e5ea" }}>
              {apartments.length === 0 && (
                <div className="col-span-3 bg-white px-6 py-8 text-center text-[#8e8e93] text-sm">
                  Nessun appartamento con dati negli ultimi 6 mesi
                </div>
              )}
              {apartments.map(apt => {
                const cStats = apt.cleanings[selectedMonth] ?? { total: 0, late: 0, reviews: 0 };
                const mStats = apt.maintenance[selectedMonth] ?? { total: 0, late: 0, reviews: 0 };
                const cVals = data.months.map(m => apt.cleanings[m]?.total ?? 0);
                const mVals = data.months.map(m => apt.maintenance[m]?.total ?? 0);
                const warn = isAptWarn(apt);
                return (
                  <div key={apt.id} className="bg-white p-[18px] flex flex-col gap-3.5">
                    {warn && (
                      <div className="text-[10px] font-[700] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                        ⚠ Attenzione — ritardi o review questo mese
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[15px] font-[700] text-[#1c1c1e]">{apt.name}</div>
                      </div>
                      <StatusDot ok={!warn} />
                    </div>
                    <div className="flex gap-2">
                      <AptStatBlock type="clean" stats={cStats} monthValues={cVals} />
                      <AptStatBlock type="maint" stats={mStats} monthValues={mVals} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ PULIZIE PER CLEANER ══ */}
        <section>
          <div className="flex items-center gap-2 mb-2 px-1">
            <IconBadge color="bg-green-50 text-green-700"><Sparkles size={16} strokeWidth={1.75} /></IconBadge>
            <span className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[.02em]">Pulizie per Cleaner</span>
          </div>
          <div className="bg-white rounded-[16px] overflow-hidden" style={{ border: ".5px solid #e5e5ea" }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ background: "#f9f9fb", borderColor: "#e5e5ea" }}>
              <span className="text-[12px] font-[500] text-[#8e8e93]">Appartamento</span>
              <select className={selectBase} value={filterAptClean} onChange={e => setFilterAptClean(e.target.value)}>
                <option value="">Tutti gli appartamenti</option>
                {filters.apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[200px_1fr_auto] gap-5 px-5 py-2 border-b" style={{ background: "#f9f9fb", borderColor: "#e5e5ea" }}>
              <span className="text-[11px] font-[600] text-[#8e8e93] uppercase tracking-[.04em]">Cleaner</span>
              <span className="text-[11px] font-[600] text-[#8e8e93] uppercase tracking-[.04em]">Ultimi 6 mesi</span>
              <span className="text-[11px] font-[600] text-[#8e8e93] uppercase tracking-[.04em] min-w-[120px] text-right">{monthLabel(selectedMonth)}</span>
            </div>

            {cleaners.length === 0 && (
              <div className="px-6 py-8 text-center text-[#8e8e93] text-sm">Nessun cleaner con dati negli ultimi 6 mesi</div>
            )}
            {cleaners.map((cleaner, i) => {
              const warn = isPersonWarn(cleaner);
              const curStats = cleaner.months[selectedMonth] ?? { total: 0, late: 0, reviews: 0 };
              const vals = data.months.map(m => cleaner.months[m]?.total ?? 0);
              const totalAll = vals.reduce((a, b) => a + b, 0);
              const totalLate = data.months.reduce((s, m) => s + (cleaner.months[m]?.late ?? 0), 0);
              const totalRev = data.months.reduce((s, m) => s + (cleaner.months[m]?.reviews ?? 0), 0);
              return (
                <div
                  key={cleaner.id}
                  className="grid grid-cols-[200px_1fr_auto] gap-5 items-center px-5 py-4 transition-colors hover:bg-[#f9f9fb]"
                  style={{
                    borderBottom: i < cleaners.length - 1 ? ".5px solid #e5e5ea" : "none",
                    background: warn ? "#fffbf0" : "white",
                  }}
                >
                  {/* Name */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-full bg-[#e5e5ea] flex items-center justify-center text-[11px] font-[800] text-[#1c1c1e] shrink-0">
                      {cleaner.initials}
                    </div>
                    <div>
                      <div className="text-[15px] font-[600] text-[#1c1c1e]">{cleaner.name}</div>
                      <StatusDot ok={!warn} />
                    </div>
                  </div>

                  {/* Sparkline + totals */}
                  <div>
                    <Sparkline values={vals} warn={warn} width={160} height={28} />
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-[11px] text-[#8e8e93]">6 mesi: {totalAll}</span>
                      <span className={`text-[11px] flex items-center gap-1 ${totalLate > 0 ? "text-amber-600 font-[500]" : "text-[#8e8e93]"}`}>
                        <Clock size={10} strokeWidth={2} />{totalLate} ritardi
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 ${totalRev > 0 ? "text-pink-600 font-[500]" : "text-[#8e8e93]"}`}>
                        <RotateCcw size={10} strokeWidth={2} />{totalRev} review
                      </span>
                    </div>
                  </div>

                  {/* This month stats */}
                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <span className="text-[26px] font-[800] text-[#1c1c1e] leading-none">{curStats.total}</span>
                    <span className="text-[11px] text-[#8e8e93]">pulizie</span>
                    <div className="flex gap-1 mt-0.5">
                      <StatPill n={curStats.late} type="late" />
                      <StatPill n={curStats.reviews} type="review" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ MANUTENZIONE PER MANUTENTORE ══ */}
        <section>
          <div className="flex items-center gap-2 mb-2 px-1">
            <IconBadge color="bg-amber-50 text-amber-700"><Wrench size={16} strokeWidth={1.75} /></IconBadge>
            <span className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[.02em]">Manutenzione per Manutentore</span>
          </div>
          <div className="bg-white rounded-[16px] overflow-hidden" style={{ border: ".5px solid #e5e5ea" }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ background: "#f9f9fb", borderColor: "#e5e5ea" }}>
              <span className="text-[12px] font-[500] text-[#8e8e93]">Appartamento</span>
              <select className={selectBase} value={filterAptManut} onChange={e => setFilterAptManut(e.target.value)}>
                <option value="">Tutti gli appartamenti</option>
                {filters.apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-[200px_1fr_auto] gap-5 px-5 py-2 border-b" style={{ background: "#f9f9fb", borderColor: "#e5e5ea" }}>
              <span className="text-[11px] font-[600] text-[#8e8e93] uppercase tracking-[.04em]">Manutentore</span>
              <span className="text-[11px] font-[600] text-[#8e8e93] uppercase tracking-[.04em]">Ultimi 6 mesi</span>
              <span className="text-[11px] font-[600] text-[#8e8e93] uppercase tracking-[.04em] min-w-[120px] text-right">{monthLabel(selectedMonth)}</span>
            </div>

            {manutentori.length === 0 && (
              <div className="px-6 py-8 text-center text-[#8e8e93] text-sm">Nessun manutentore con dati negli ultimi 6 mesi</div>
            )}
            {manutentori.map((manut, i) => {
              const warn = isPersonWarn(manut);
              const curStats = manut.months[selectedMonth] ?? { total: 0, late: 0, reviews: 0 };
              const vals = data.months.map(m => manut.months[m]?.total ?? 0);
              const totalAll = vals.reduce((a, b) => a + b, 0);
              const totalLate = data.months.reduce((s, m) => s + (manut.months[m]?.late ?? 0), 0);
              const totalRev = data.months.reduce((s, m) => s + (manut.months[m]?.reviews ?? 0), 0);
              return (
                <div
                  key={manut.id}
                  className="grid grid-cols-[200px_1fr_auto] gap-5 items-center px-5 py-4 transition-colors hover:bg-[#f9f9fb]"
                  style={{
                    borderBottom: i < manutentori.length - 1 ? ".5px solid #e5e5ea" : "none",
                    background: warn ? "#fffbf0" : "white",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-full bg-[#e5e5ea] flex items-center justify-center text-[11px] font-[800] text-[#1c1c1e] shrink-0">
                      {manut.initials}
                    </div>
                    <div>
                      <div className="text-[15px] font-[600] text-[#1c1c1e]">{manut.name}</div>
                      <StatusDot ok={!warn} />
                    </div>
                  </div>

                  <div>
                    <Sparkline values={vals} warn={warn} width={160} height={28} />
                    <div className="flex gap-3 mt-1.5">
                      <span className="text-[11px] text-[#8e8e93]">6 mesi: {totalAll}</span>
                      <span className={`text-[11px] flex items-center gap-1 ${totalLate > 0 ? "text-amber-600 font-[500]" : "text-[#8e8e93]"}`}>
                        <Clock size={10} strokeWidth={2} />{totalLate} ritardi
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 ${totalRev > 0 ? "text-pink-600 font-[500]" : "text-[#8e8e93]"}`}>
                        <RotateCcw size={10} strokeWidth={2} />{totalRev} review
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <span className="text-[26px] font-[800] text-[#1c1c1e] leading-none">{curStats.total}</span>
                    <span className="text-[11px] text-[#8e8e93]">ticket</span>
                    <div className="flex gap-1 mt-0.5">
                      <StatPill n={curStats.late} type="late" />
                      <StatPill n={curStats.reviews} type="review" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

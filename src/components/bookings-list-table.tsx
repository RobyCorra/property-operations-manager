"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/src/components/lang-context";

import { 
  Users, 
  Building2, 
  CalendarDays, 
  Pencil, 
  User, 
  Search,
  Filter
} from "./icons";
import UnifiedFilters, { FilterField } from "./unified-filters";
import SafeDate from "./safe-date";
import Link from "next/link";
import DeleteBookingButton from "./delete-booking-button";

type Props = {
  initialBookings: {
    id: string;
    guestName: string | null;
    apartmentId: string;
    totalGuests: number;
    checkInDate: Date;
    checkOutDate: Date;
    status: string | null;
    source?: string | null;
    externalId?: string | null;
    apartment: {
      id: string;
      name: string;
    };
  }[];
  apartments: {
    id: string;
    name: string;
  }[];
};

export default function BookingsListTable({ initialBookings, apartments }: Props) {
  const { t } = useLang();
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    apartmentId: "",
    timeframe: "UPCOMING", // default: dal giorno in corso in poi
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setFilters({ search: "", apartmentId: "", timeframe: "UPCOMING", startDate: "", endDate: "" });
  };

  const filteredBookings = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return initialBookings.filter((b) => {
      const matchesSearch = !filters.search || (b.guestName || "").toLowerCase().includes(filters.search.toLowerCase());
      const matchesApartment = !filters.apartmentId || b.apartment.id === filters.apartmentId;

      // Passate = già terminate (check-out < oggi). Prossime = ancora in corso o
      // future (check-out >= oggi). "ALL" = tutte.
      const checkOut = new Date(b.checkOutDate);
      const matchesTimeframe =
        filters.timeframe === "ALL" ? true :
        filters.timeframe === "PAST" ? checkOut < todayStart :
        checkOut >= todayStart; // UPCOMING (default)

      const checkIn = new Date(b.checkInDate);
      const matchesStart = !filters.startDate || checkIn >= new Date(filters.startDate);
      const matchesEnd = !filters.endDate || checkIn <= new Date(filters.endDate);

      return matchesSearch && matchesApartment && matchesTimeframe && matchesStart && matchesEnd;
    });
  }, [initialBookings, filters]);

  const filterFields: FilterField[] = [
    { id: "search", label: t.calGuest, type: "text", placeholder: t.bkSearchPlaceholder, icon: <Search size={14} /> },
    { 
      id: "apartmentId", 
      label: t.calApartment, 
      type: "select", 
      options: apartments.map(a => ({ value: a.id, label: a.name })),
      icon: <Building2 size={14} />
    },
    {
      id: "timeframe",
      label: t.calStatusWord,
      type: "select",
      options: [
        { value: "UPCOMING", label: "Prossime" },
        { value: "PAST", label: "Passate" },
        { value: "ALL", label: "Tutte" },
      ],
      icon: <Filter size={14} />
    },
    { id: "startDate", label: t.bkCheckinFrom, type: "date", icon: <CalendarDays size={14} /> },
    { id: "endDate", label: t.bkTo, type: "date" },
  ];

  // ── Helper vista mobile (Proposta B) ────────────────────────────────
  const dateLocale = "it-IT";

  function bookingSource(b: { status: string | null; source?: string | null; externalId?: string | null }) {
    const src = (b.source || "").toUpperCase();
    // Segnale AFFIDABILE di import: l'externalId (UID iCal) c'è sempre sulle
    // prenotazioni importate, anche su quelle vecchie con source null. Le
    // manuali non hanno externalId.
    const isImported = !!b.externalId || (!!src && src !== "MANUAL");
    if (!isImported) return { manual: true, label: "Manuale", emoji: "✏️", tintBg: "bg-violet-100", badge: "bg-violet-50 text-violet-700" };
    // Etichetta canale: se importata è Airbnb per default (feed iCal = Airbnb),
    // salvo canali espliciti diversi. Non mostrare mai "Manual" qui: se ha
    // externalId è comunque una prenotazione importata.
    const nice = src === "ICAL" ? "iCal" : src === "BOOKING" ? "Booking" : "Airbnb";
    return { manual: false, label: nice, emoji: "🏠", tintBg: "bg-rose-100", badge: "bg-rose-50 text-rose-700" };
  }
  function nightsBetween(a: Date, b: Date) {
    return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
  }
  // Raggruppa per mese di check-in (le prenotazioni sono già ordinate per data)
  const groupedMobile: { key: string; label: string; items: typeof filteredBookings }[] = [];
  for (const b of filteredBookings) {
    const d = new Date(b.checkInDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    let g = groupedMobile.find((x) => x.key === key);
    if (!g) {
      const lbl = d.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });
      g = { key, label: lbl.charAt(0).toUpperCase() + lbl.slice(1), items: [] };
      groupedMobile.push(g);
    }
    g.items.push(b);
  }
  // Passate: mostra le più recenti in cima (mesi e prenotazioni in ordine inverso)
  if (filters.timeframe === "PAST") {
    groupedMobile.reverse();
    groupedMobile.forEach((g) => g.items.reverse());
  }

  const timeframeChips = [
    { value: "UPCOMING", label: "Prossime" },
    { value: "PAST", label: "Passate" },
    { value: "ALL", label: "Tutte" },
  ];

  return (
    <div className="space-y-6">
      {/* Filtri desktop */}
      <div className="hidden md:block">
        <UnifiedFilters
          fields={filterFields}
          values={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Filtri mobile — ricerca + appartamento + chip stato */}
      <div className="md:hidden space-y-2.5">
        <div className="flex items-center gap-2 bg-white border border-[#ede9f6] rounded-2xl px-3.5 py-2.5">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder={t.bkSearchPlaceholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-slate-700 placeholder:text-slate-400"
          />
          {(filters.search || filters.apartmentId || filters.timeframe !== "UPCOMING") && (
            <button onClick={handleReset} className="text-[10px] font-black uppercase tracking-widest text-violet-500 shrink-0">Reset</button>
          )}
        </div>
        <select
          value={filters.apartmentId}
          onChange={(e) => handleFilterChange("apartmentId", e.target.value)}
          className="w-full text-[13px] font-bold py-2.5 px-3.5 rounded-2xl border border-[#ede9f6] bg-white text-violet-700 appearance-none"
        >
          <option value="">{t.mdAllApartments}</option>
          {apartments.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {timeframeChips.map((c) => (
            <button
              key={c.value}
              onClick={() => handleFilterChange("timeframe", c.value)}
              className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap border transition-all ${
                filters.timeframe === c.value ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-500 border-[#ede9f6]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <section className="hidden md:block bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-white/20 border-b border-white/40">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.calGuest}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.calApartment}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.bkArrivalDeparture}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.bkGuests}</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.apColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/60 transition-all duration-200 group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                           <User size={20} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 tracking-tight line-clamp-1 group-hover:text-violet-600 transition-colors uppercase">
                            {b.guestName || t.bkManualBooking}
                        </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-300" />
                        <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase truncate max-w-[150px]">{b.apartment.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={12} className="text-emerald-500" />
                            <SafeDate date={b.checkInDate} format={{ day: '2-digit', month: '2-digit', year: 'numeric' }} className="text-xs font-bold text-slate-900" />
                        </div>
                        <div className="flex items-center gap-2 opacity-50">
                            <div className="w-3" />
                            <SafeDate date={b.checkOutDate} format={{ day: '2-digit', month: '2-digit', year: 'numeric' }} className="text-[10px] font-medium text-slate-500 uppercase tracking-widest" />
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                      <Users size={14} className="text-slate-300" />
                      <span>{b.totalGuests} <span className="text-slate-400 font-medium lowercase">{t.calGuestsShort}</span></span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Link
                        href={`/dashboard/manager/bookings/${b.id}/edit`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        title={t.mgrEdit}
                        >
                        <Pencil size={16} />
                        </Link>
                        <DeleteBookingButton bookingId={b.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <CalendarDays size={32} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.bkNoBookings}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Card List — Proposta B (scheda arrivo con timeline soggiorno) */}
      <div className="md:hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CalendarDays size={28} className="text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.bkNoBookings}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedMobile.map((group) => (
              <div key={group.key}>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 capitalize">{group.label}</p>
                <div className="space-y-2.5">
                  {group.items.map((b) => {
                    const ci = new Date(b.checkInDate);
                    const co = new Date(b.checkOutDate);
                    const nights = nightsBetween(ci, co);
                    const src = bookingSource(b);
                    const fmtDay = (d: Date) => ({
                      day: d.toLocaleDateString(dateLocale, { day: "numeric" }),
                      mon: d.toLocaleDateString(dateLocale, { month: "short" }).replace(".", ""),
                    });
                    const ciF = fmtDay(ci);
                    const coF = fmtDay(co);
                    return (
                      <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {/* Header: fonte + nome + ospiti */}
                        <div className="px-3.5 pt-3 pb-2 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${src.tintBg} flex items-center justify-center text-lg shrink-0`}>
                            {src.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{b.guestName || t.bkManualBooking}</p>
                            <p className="text-[11px] text-slate-400 truncate">{b.apartment.name} · {src.label}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-[#f0eeff] rounded-full px-2.5 py-1">
                            <Users size={11} className="text-violet-500" />
                            <span className="text-[11px] font-black text-violet-700">{b.totalGuests}</span>
                          </div>
                        </div>

                        {/* Timeline soggiorno */}
                        <div className="mx-3.5 mb-2.5 bg-[#f8f7fc] border border-slate-100 rounded-xl px-3 py-2.5 flex items-center">
                          <div className="text-center shrink-0">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Check-in</p>
                            <p className="text-base font-black text-slate-900 leading-tight">{ciF.day}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{ciF.mon}</p>
                          </div>
                          <div className="flex-1 mx-2.5 relative h-0.5 bg-slate-200 rounded-full">
                            <span className="absolute top-1/2 -translate-y-1/2 -left-0.5 w-2 h-2 rounded-full bg-violet-500" />
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9.5px] font-black text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {nights} {nights === 1 ? "notte" : "notti"}
                            </span>
                            <span className="absolute top-1/2 -translate-y-1/2 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="text-center shrink-0">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Check-out</p>
                            <p className="text-base font-black text-slate-900 leading-tight">{coF.day}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{coF.mon}</p>
                          </div>
                        </div>

                        {/* Azioni */}
                        <div className="flex items-center gap-2 px-3.5 pb-3">
                          <Link
                            href={`/dashboard/manager/bookings/${b.id}/edit`}
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-black text-white text-[11px] font-black uppercase tracking-widest active:scale-[.98] transition-transform"
                          >
                            <Pencil size={13} />
                            {t.mgrEdit}
                          </Link>
                          <DeleteBookingButton bookingId={b.id} />
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

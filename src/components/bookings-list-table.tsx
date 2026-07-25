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
    status: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setFilters({ search: "", apartmentId: "", status: "", startDate: "", endDate: "" });
  };

  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => {
      const matchesSearch = !filters.search || (b.guestName || "").toLowerCase().includes(filters.search.toLowerCase());
      const matchesApartment = !filters.apartmentId || b.apartment.id === filters.apartmentId;
      const matchesStatus = !filters.status || b.status === filters.status;
      
      const checkIn = new Date(b.checkInDate);
      const matchesStart = !filters.startDate || checkIn >= new Date(filters.startDate);
      const matchesEnd = !filters.endDate || checkIn <= new Date(filters.endDate);

      return matchesSearch && matchesApartment && matchesStatus && matchesStart && matchesEnd;
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
      id: "status", 
      label: t.calStatusWord, 
      type: "select", 
      options: [
        { value: "CONFIRMED", label: t.bkConfirmed },
        { value: "CANCELLED", label: t.bkCancelled },
        { value: "null", label: "Manual" }
      ],
      icon: <Filter size={14} />
    },
    { id: "startDate", label: t.bkCheckinFrom, type: "date", icon: <CalendarDays size={14} /> },
    { id: "endDate", label: t.bkTo, type: "date" },
  ];

  return (
    <div className="space-y-6">
      <UnifiedFilters 
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

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

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CalendarDays size={28} className="text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.bkNoBookings}</p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div key={b.id} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate">
                      {b.guestName || t.bkManualBooking}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Building2 size={10} className="text-slate-400 shrink-0" />
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate">{b.apartment.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-slate-100 rounded-full px-2.5 py-1">
                    <Users size={10} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-600">{b.totalGuests}</span>
                  </div>
                </div>

                {/* Date row */}
                <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Check-in</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={11} className="text-emerald-500" />
                      <SafeDate date={b.checkInDate} format={{ day: '2-digit', month: '2-digit', year: 'numeric' }} className="text-xs font-bold text-slate-900" />
                    </div>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Check-out</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={11} className="text-slate-400" />
                      <SafeDate date={b.checkOutDate} format={{ day: '2-digit', month: '2-digit', year: 'numeric' }} className="text-xs font-semibold text-slate-600" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Link
                    href={`/dashboard/manager/bookings/${b.id}/edit`}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100 active:scale-95 transition-all"
                  >
                    <Pencil size={12} />
                    {t.mgrEdit}
                  </Link>
                  <DeleteBookingButton bookingId={b.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

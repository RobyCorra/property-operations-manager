"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/src/components/lang-context";
import Link from "next/link";
import UnifiedFilters, { FilterField } from "./unified-filters";
import DeleteOperationalButton from "./delete-operational-button";
import SafeDate from "./safe-date";
import { formatRomeDateDisplay, formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import {
  CalendarDays,
  Building2,
  User,
  LogIn,
  Pencil,
  Search,
  Filter,
  Clock,
  ArrowRight
} from "./icons";
import { calculateLinen } from "@/src/lib/linen-calculator";

interface CleaningTask {
  id: string;
  date: Date | string;
  status: string;
  notes: string | null;
  apartment: { id: string; name: string; bathrooms?: number; bedConfig?: unknown };
  assignedTo: { id: string; name: string } | null;
  nextBooking?: {
    guestName: string | null;
    totalGuests: number;
    checkInDate: Date | string;
    cullaRequested?: boolean | null;
  } | null;
}

interface Props {
  initialCleanings: CleaningTask[];
  apartments: { id: string; name: string }[];
  collaborators: { id: string; name: string }[];
}

export default function CleaningsListTable({ initialCleanings, apartments, collaborators }: Props) {
  const { t } = useLang();
  const [filters, setFilters] = useState<Record<string, string>>({
    apartmentId: "",
    status: "",
    collaboratorId: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setFilters({ apartmentId: "", status: "", collaboratorId: "", startDate: "", endDate: "" });
  };

  const filteredCleanings = useMemo(() => {
    return initialCleanings.filter((c) => {
      const matchesApartment = !filters.apartmentId || c.apartment.id === filters.apartmentId;
      const matchesStatus = !filters.status || c.status === filters.status;
      const matchesCollaborator = !filters.collaboratorId || c.assignedTo?.id === filters.collaboratorId;
      
      const taskDate = new Date(c.date);
      const matchesStart = !filters.startDate || taskDate >= new Date(filters.startDate);
      const matchesEnd = !filters.endDate || taskDate <= new Date(filters.endDate);

      return matchesApartment && matchesStatus && matchesCollaborator && matchesStart && matchesEnd;
    });
  }, [initialCleanings, filters]);

  const filterFields: FilterField[] = [
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
        { value: "PENDING", label: t.calToDo },
        { value: "IN_PROGRESS", label: t.calInProgress },
        { value: "COMPLETED", label: t.calCompleted }
      ],
      icon: <Filter size={14} />
    },
    { 
      id: "collaboratorId", 
      label: t.clnAssignedTo, 
      type: "select", 
      options: collaborators.map(c => ({ value: c.id, label: c.name })),
      icon: <User size={14} />
    },
    { id: "startDate", label: t.clnDateFrom, type: "date", icon: <CalendarDays size={14} /> },
    { id: "endDate", label: t.bkTo, type: "date" },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-200/50",
    IN_PROGRESS: "bg-violet-500/10 text-violet-600 border-violet-200/50",
    COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <UnifiedFilters 
            fields={filterFields}
            values={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
        />
        
        {/* Quick Filters Presets */}
        <div className="flex items-center gap-3 mt-8 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.clnQuickPresets}</span>
            <div className="h-px w-8 bg-slate-100" />
            <button 
                onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setFilters({ ...filters, startDate: today, endDate: today, status: "" });
                }}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    filters.startDate === new Date().toISOString().split('T')[0] && filters.endDate === new Date().toISOString().split('T')[0]
                    ? "bg-slate-900 text-white border-transparent shadow-lg" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                }`}
            >
                {t.navToday}
            </button>
            <button 
                onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setFilters({ ...filters, startDate: today, endDate: "", status: "PENDING" });
                }}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    filters.startDate !== "" && filters.status === "PENDING"
                    ? "bg-slate-900 text-white border-transparent shadow-lg" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                }`}
            >
                {t.clnPresetNext}
            </button>
            <button 
                onClick={() => {
                    setFilters({ ...filters, status: "COMPLETED", startDate: "", endDate: "" });
                }}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                    filters.status === "COMPLETED"
                    ? "bg-slate-900 text-white border-transparent shadow-lg" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                }`}
            >
                {t.clnPresetCompleted}
            </button>
        </div>
      </div>

      {/* Desktop Table */}
      <section className="hidden md:block bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-white/20 border-b border-white/40">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.clnPlanning}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.calApartment}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.clnCollaborator}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.clnTarget}</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.calStatusWord}</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{t.apColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredCleanings.map((task) => (
                <tr key={task.id} className="hover:bg-white/60 transition-all duration-200 group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                        <CalendarDays size={14} className="text-slate-300" />
                        <span className="text-sm font-semibold text-slate-900 tracking-tight">
                          {formatRomeDateTimeDisplay(task.date)}
                        </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-300" />
                        <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase truncate max-w-[150px]">{task.apartment.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                           <User size={14} />
                        </div>
                        <span className="text-xs text-slate-700 font-bold uppercase tracking-tight">
                            {task.assignedTo?.name || t.mgrUnassignedM}
                        </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {task.nextBooking ? (() => {
                      const nb = task.nextBooking;
                      const linen = calculateLinen(task.apartment.bedConfig, nb.totalGuests, !!(nb.cullaRequested));
                      return (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <LogIn size={12} className="text-emerald-500" />
                            <span className="text-sm font-bold text-slate-900 line-clamp-1 uppercase tracking-tight">{nb.guestName}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-60">
                            <div className="w-3" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {nb.totalGuests} osp. &middot; <SafeDate date={nb.checkInDate} format={{ day: '2-digit', month: 'short' }} />
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[9px] font-black text-slate-500 uppercase tracking-wide">
                              🛁 {nb.totalGuests * 2}
                            </span>
                            {task.apartment.bathrooms != null && (
                              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[9px] font-black text-slate-500 uppercase tracking-wide">
                                🚿 {task.apartment.bathrooms}
                              </span>
                            )}
                            {linen.beds.map(bed => (
                              <span key={bed.key} className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wide border ${bed.isFixed ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                {bed.label.replace("Letto ", "").replace("Divano letto ", "Div.")} ×{bed.count} · {bed.linen.lenzuola}+{bed.linen.federe}+{bed.linen.copriPiumino}
                              </span>
                            ))}
                            {linen.culla && (
                              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wide bg-emerald-50 border border-emerald-200 text-emerald-700">
                                🟢 culla · {linen.culla.lenzuola}+{linen.culla.federe}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="flex items-center gap-2 opacity-30">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.clnNoArrival}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm flex items-center gap-2 ${statusColors[task.status]}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {task.status}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Link
                        href={`/dashboard/manager/cleanings/${task.id}/edit`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        title={t.mgrEdit}
                        >
                        <Pencil size={16} />
                        </Link>
                        <DeleteOperationalButton id={task.id} type="CLEANING" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCleanings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Filter size={32} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.clnNoCleanings}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredCleanings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Filter size={28} className="text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.clnNoCleanings}</p>
          </div>
        ) : (
          filteredCleanings.map((task) => (
            <div key={task.id} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Header: appartamento + stato */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate">{task.apartment.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CalendarDays size={10} className="text-slate-400 shrink-0" />
                      <p className="text-[10px] font-semibold text-slate-500">{formatRomeDateTimeDisplay(task.date)}</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 shrink-0 ${statusColors[task.status]}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {task.status === "PENDING" ? t.calToDo : task.status === "IN_PROGRESS" ? t.calInProgress : t.clnDone}
                  </div>
                </div>

                {/* Assegnato */}
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0">
                    <User size={12} className="text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                    {task.assignedTo?.name || t.mgrUnassignedM}
                  </span>
                </div>

                {/* Prossimo ospite (se presente) */}
                {task.nextBooking && (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                    <LogIn size={12} className="text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-emerald-800 truncate">{task.nextBooking.guestName}</span>
                    <span className="text-[10px] text-emerald-600 ml-auto shrink-0">{task.nextBooking.totalGuests} osp.</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Link
                    href={`/dashboard/manager/cleanings/${task.id}/edit`}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100 active:scale-95 transition-all"
                  >
                    <Pencil size={12} />
                    Modifica
                  </Link>
                  <Link
                    href={`/dashboard/manager/cleanings/${task.id}`}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest border border-violet-100 active:scale-95 transition-all"
                  >
                    <ArrowRight size={12} />
                    Dettagli
                  </Link>
                  <DeleteOperationalButton id={task.id} type="CLEANING" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import UnifiedFilters, { FilterField } from "./unified-filters";
import DeleteOperationalButton from "./delete-operational-button";
import SafeDate from "./safe-date";
import { formatRomeDateDisplay } from "@/src/lib/rome-datetime";
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

interface CleaningTask {
  id: string;
  date: Date | string;
  status: string;
  notes: string | null;
  apartment: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
  nextBooking?: {
    guestName: string | null;
    totalGuests: number;
    checkInDate: Date | string;
  } | null;
}

interface Props {
  initialCleanings: CleaningTask[];
  apartments: { id: string; name: string }[];
  collaborators: { id: string; name: string }[];
}

export default function CleaningsListTable({ initialCleanings, apartments, collaborators }: Props) {
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
      label: "Appartamento", 
      type: "select", 
      options: apartments.map(a => ({ value: a.id, label: a.name })),
      icon: <Building2 size={14} />
    },
    { 
      id: "status", 
      label: "Stato", 
      type: "select", 
      options: [
        { value: "PENDING", label: "Da Fare" },
        { value: "IN_PROGRESS", label: "In Corso" },
        { value: "COMPLETED", label: "Completata" }
      ],
      icon: <Filter size={14} />
    },
    { 
      id: "collaboratorId", 
      label: "Assegnato a", 
      type: "select", 
      options: collaborators.map(c => ({ value: c.id, label: c.name })),
      icon: <User size={14} />
    },
    { id: "startDate", label: "Data Dal", type: "date", icon: <CalendarDays size={14} /> },
    { id: "endDate", label: "Al", type: "date" },
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
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preset Rapidi</span>
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
                Oggi
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
                Prossimi
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
                Completati
            </button>
        </div>
      </div>

      <section className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-white/20 border-b border-white/40">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Pianificazione</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Appartamento</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Collaboratore</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Obiettivo</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Stato</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredCleanings.map((task) => (
                <tr key={task.id} className="hover:bg-white/60 transition-all duration-200 group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                        <CalendarDays size={14} className="text-slate-300" />
                        <span className="text-sm font-semibold text-slate-900 tracking-tight">
                          {formatRomeDateDisplay(task.date)}
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
                            {task.assignedTo?.name || "Non assegnato"}
                        </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {task.nextBooking ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <LogIn size={12} className="text-emerald-500" />
                           <span className="text-sm font-bold text-slate-900 line-clamp-1 uppercase tracking-tight">{task.nextBooking.guestName}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-60">
                           <div className="w-3" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {task.nextBooking.totalGuests} osp. &middot; <SafeDate date={task.nextBooking.checkInDate} format={{ day: '2-digit', month: 'short' }} />
                           </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-30">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Nessun arrivo</span>
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
                        title="Modifica"
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
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nessuna pulizia trovata</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useLang } from "@/src/components/lang-context";
import Link from "next/link";
import UnifiedFilters, { FilterField } from "./unified-filters";
import DeleteOperationalButton from "./delete-operational-button";
import SafeDate from "./safe-date";
import { 
  Wrench, 
  Building2, 
  User, 
  Pencil, 
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ChevronRight,
  Info
} from "./icons";

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date | string;
  scheduledStart?: Date | string | null;
  apartment: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
  attachments: { id: string; url: string }[];
}

interface Props {
  initialTickets: MaintenanceTicket[];
  apartments: { id: string; name: string }[];
  collaborators: { id: string; name: string }[];
}

export default function MaintenanceListTable({ initialTickets, apartments, collaborators }: Props) {
  const { t: tr } = useLang();
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    apartmentId: "",
    status: "",
    priority: "",
    collaboratorId: "",
  });

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setFilters({ search: "", apartmentId: "", status: "", priority: "", collaboratorId: "" });
  };

  const filteredTickets = useMemo(() => {
    return initialTickets.filter((t) => {
      const matchesSearch = !filters.search || 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesApartment = !filters.apartmentId || t.apartment.id === filters.apartmentId;
      const matchesStatus = !filters.status || t.status === filters.status;
      const matchesPriority = !filters.priority || t.priority === filters.priority;
      const matchesCollaborator = !filters.collaboratorId || t.assignedTo?.id === filters.collaboratorId;

      return matchesSearch && matchesApartment && matchesStatus && matchesPriority && matchesCollaborator;
    });
  }, [initialTickets, filters]);

  const filterFields: FilterField[] = [
    { id: "search", label: tr.mdSearch, type: "text", placeholder: tr.mtSearchPlaceholder, icon: <Search size={14} /> },
    { 
      id: "apartmentId", 
      label: tr.calApartment, 
      type: "select", 
      options: apartments.map(a => ({ value: a.id, label: a.name })),
      icon: <Building2 size={14} />
    },
    { 
      id: "status", 
      label: tr.calStatusWord, 
      type: "select", 
      options: [
        { value: "PENDING", label: tr.stTicketWaiting },
        { value: "IN_PROGRESS", label: tr.calInProgress },
        { value: "RESOLVED", label: tr.stTicketResolved }
      ],
      icon: <Filter size={14} />
    },
    { 
      id: "priority", 
      label: tr.mtPriority, 
      type: "select", 
      options: [
        { value: "LOW", label: tr.mtLow },
        { value: "MEDIUM", label: tr.mtMedium },
        { value: "HIGH", label: tr.mtHigh },
        { value: "URGENT", label: tr.mtUrgent }
      ],
      icon: <AlertTriangle size={14} />
    },
    { 
      id: "collaboratorId", 
      label: tr.clnAssignedTo, 
      type: "select", 
      options: collaborators.map(c => ({ value: c.id, label: c.name })),
      icon: <User size={14} />
    },
  ];

  const priorityColors: Record<string, string> = {
    LOW: "text-slate-400 bg-slate-500/10 border-slate-200/50",
    MEDIUM: "text-blue-500 bg-blue-500/10 border-blue-200/50",
    HIGH: "text-orange-500 bg-orange-500/10 border-orange-200/50",
    URGENT: "text-rose-500 bg-rose-500/10 border-rose-200/50 shadow-sm shadow-rose-200/50",
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-rose-500/10 text-rose-600 border-rose-200/50",
    IN_PROGRESS: "bg-violet-500/10 text-violet-600 border-violet-200/50",
    RESOLVED: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
  };

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
                <th className="px-5 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.mtTicketDetails}</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Data</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.calApartment}</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.mtPriority}</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.calStatusWord}</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.mtAssigned}</th>
                <th className="px-4 py-5 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.apColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredTickets.map((ticket) => {
                const dateVal = ticket.scheduledStart ?? ticket.createdAt;
                const dateObj = new Date(dateVal);
                const dateStr = dateObj.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
                const timeStr = dateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
                return (
                <tr key={ticket.id} className="hover:bg-white/60 transition-all duration-200 group">
                  <td className="px-5 py-4">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-slate-900 tracking-tight group-hover:text-violet-600 transition-colors uppercase truncate max-w-[250px]">{ticket.title}</span>
                      <span className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[250px] tracking-wide uppercase mt-0.5">
                        {ticket.description || tr.mtNoDescription}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col text-xs text-slate-600">
                      <span className="font-semibold">{dateStr}</span>
                      <span className="text-[10px] text-slate-400">{timeStr}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">{ticket.apartment.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm flex items-center gap-1.5 ${priorityColors[ticket.priority]}`}>
                      <AlertTriangle size={9} />
                      {ticket.priority}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm flex items-center gap-1.5 ${statusColors[ticket.status]}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ticket.status}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      <User size={13} className="text-slate-300" />
                      {ticket.assignedTo?.name || tr.mgrUnassignedM}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                        <Link
                        href={`/dashboard/manager/maintenance/${ticket.id}/edit`}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        title={tr.mgrEdit}
                        >
                        <Pencil size={14} />
                        </Link>
                        <DeleteOperationalButton id={ticket.id} type="MAINTENANCE" />
                    </div>
                  </td>
                </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Wrench size={32} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{tr.mtNoTickets}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Wrench size={28} className="text-slate-200" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tr.mtNoTickets}</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const mDateVal = ticket.scheduledStart ?? ticket.createdAt;
            const mDateObj = new Date(mDateVal);
            const mDateStr = mDateObj.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
            const mTimeStr = mDateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
            return (
            <div key={ticket.id} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Header: titolo + priorità */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate">{ticket.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Building2 size={10} className="text-slate-400 shrink-0" />
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate">{ticket.apartment.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">📅 {mDateStr} · {mTimeStr}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 shrink-0 ${priorityColors[ticket.priority]}`}>
                    <AlertTriangle size={8} />
                    {ticket.priority}
                  </div>
                </div>

                {/* Stato + assegnato */}
                <div className="flex items-center gap-2">
                  <div className={`flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${statusColors[ticket.status]}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    {ticket.status === "PENDING" ? tr.stTicketWaiting : ticket.status === "IN_PROGRESS" ? tr.calInProgress : tr.stTicketResolved}
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <User size={11} className="text-slate-400 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight truncate">
                      {ticket.assignedTo?.name || tr.mgrUnassignedM}
                    </span>
                  </div>
                </div>

                {/* Description preview */}
                {ticket.description && (
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed px-1">{ticket.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Link
                    href={`/dashboard/manager/maintenance/${ticket.id}/edit`}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100 active:scale-95 transition-all"
                  >
                    <Pencil size={12} />
                    {tr.mgrEdit}
                  </Link>
                  <Link
                    href={`/dashboard/manager/maintenance/${ticket.id}`}
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest border border-violet-100 active:scale-95 transition-all"
                  >
                    <ChevronRight size={12} />
                    {tr.mgDetails}
                  </Link>
                  <DeleteOperationalButton id={ticket.id} type="MAINTENANCE" />
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

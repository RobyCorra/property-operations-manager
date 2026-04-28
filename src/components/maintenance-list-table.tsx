"use client";

import { useState, useMemo } from "react";
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
    { id: "search", label: "Cerca", type: "text", placeholder: "Titolo, descr...", icon: <Search size={14} /> },
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
        { value: "OPEN", label: "Aperto" },
        { value: "IN_PROGRESS", label: "In Corso" },
        { value: "RESOLVED", label: "Risolto" }
      ],
      icon: <Filter size={14} />
    },
    { 
      id: "priority", 
      label: "Priorità", 
      type: "select", 
      options: [
        { value: "LOW", label: "Bassa" },
        { value: "MEDIUM", label: "Media" },
        { value: "HIGH", label: "Alta" },
        { value: "URGENT", label: "Urgente" }
      ],
      icon: <AlertTriangle size={14} />
    },
    { 
      id: "collaboratorId", 
      label: "Assegnato a", 
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

      <section className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-white/20 border-b border-white/40">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Ticket e Dettagli</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Appartamento</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Priorità</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Stato</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Assegnato</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white/60 transition-all duration-200 group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                             <Wrench size={24} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-slate-900 tracking-tight group-hover:text-violet-600 transition-colors uppercase truncate">{ticket.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                             <Info size={10} className="text-slate-300" />
                             <span className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[200px] tracking-wide uppercase">
                               {ticket.description || "Nessuna descrizione"}
                             </span>
                          </div>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-300" />
                        <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase truncate max-w-[150px]">{ticket.apartment.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm flex items-center gap-2 ${priorityColors[ticket.priority]}`}>
                      <AlertTriangle size={10} />
                      {ticket.priority}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm flex items-center gap-2 ${statusColors[ticket.status]}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ticket.status}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      <User size={14} className="text-slate-300" />
                      {ticket.assignedTo?.name || "Non assegnato"}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Link 
                        href={`/dashboard/manager/maintenance/${ticket.id}/edit`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        title="Modifica"
                        >
                        <Pencil size={16} />
                        </Link>
                        <DeleteOperationalButton id={ticket.id} type="MAINTENANCE" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Wrench size={32} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nessun ticket trovato</p>
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

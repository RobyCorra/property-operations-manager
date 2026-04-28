"use client";

import { useState, useTransition, useEffect } from "react";
import { Activity, getTeamActivityHistory } from "@/src/app/actions/activity";
import SafeDate from "./safe-date";
import ActivityDetailModal from "./activity-detail-modal";

interface Props {
  initialActivities: Activity[];
  apartments: { id: string; name: string }[];
  collaborators: { id: string; name: string; role: string }[];
  currentUserId: string;
  currentUserRole: string;
  serverDate: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Da Fare",
  IN_PROGRESS: "In Corso",
  COMPLETED: "Completato",
  OPEN: "Aperto",
  RESOLVED: "Risolto",
  CANCELLED: "Annullato",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-100",
  IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  OPEN: "bg-blue-50 text-blue-700 border-blue-100",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-gray-50 text-gray-400 border-gray-100",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-50 text-gray-500",
  MEDIUM: "bg-blue-50 text-blue-600",
  HIGH: "bg-orange-50 text-orange-600 font-bold text-[9px]",
  URGENT: "bg-red-50 text-red-600 font-black text-[9px] animate-pulse ring-1 ring-red-200",
};

export default function ActivityHistoryTable({ 
  initialActivities, 
  apartments, 
  collaborators, 
  currentUserId, 
  currentUserRole,
  serverDate 
}: Props) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isPending, startTransition] = useTransition();
  const [selectedActivity, setSelectedActivity] = useState<{ id: string, type: 'CLEANING' | 'MAINTENANCE' } | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    collaboratorId: "",
    apartmentId: "",
    status: "",
    type: "" as "" | 'CLEANING' | 'MAINTENANCE',
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    startTransition(async () => {
      const data = await getTeamActivityHistory({
        ...newFilters,
        type: newFilters.type || undefined,
        currentUserId,
        currentUserRole,
      });
      setActivities(data);
    });
  };

  const isManager = currentUserRole === "MANAGER";

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Filtri Ricerca</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {isManager && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Collaboratore</label>
              <select 
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black transition-all"
                value={filters.collaboratorId}
                onChange={(e) => handleFilterChange("collaboratorId", e.target.value)}
              >
                <option value="">Tutti</option>
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Appartamento</label>
            <select 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black transition-all"
              value={filters.apartmentId}
              onChange={(e) => handleFilterChange("apartmentId", e.target.value)}
            >
              <option value="">Tutti</option>
              {apartments.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo Attività</label>
            <select 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black transition-all"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">Tutti</option>
              <option value="CLEANING">Pulizia</option>
              <option value="MAINTENANCE">Manutenzione</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Stato</label>
            <select 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black transition-all"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Qualsiasi</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 lg:col-span-1">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Dal</label>
              <input 
                type="date"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black transition-all"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Al</label>
              <input 
                type="date"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black transition-all"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {isPending ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Aggiornamento Storico...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <span className="text-4xl filter grayscale opacity-20">🔎</span>
            <p className="text-sm font-semibold text-gray-400">Nessuna attività trovata per i criteri selezionati.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Intervento</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Collaboratore</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Appartamento</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Stato</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activities.map(activity => (
                  <tr key={`${activity.type}-${activity.id}`} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border ${activity.type === 'CLEANING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                            {activity.type === 'CLEANING' ? 'Pulizia' : 'Manutenzione'}
                          </span>
                          {activity.priority && (
                             <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLORS[activity.priority as keyof typeof PRIORITY_COLORS]}`}>
                                {activity.priority}
                             </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{activity.type === 'MAINTENANCE' ? activity.title : 'Task Pulizie Post-Soggiorno'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">{activity.collaboratorName}</span>
                        <span className="text-[10px] font-medium text-gray-400">{activity.collaboratorRole}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-semibold text-gray-700">{activity.apartmentName}</p>
                    </td>
                    <td className="px-8 py-6 text-xs">
                      <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border w-fit ${STATUS_COLORS[activity.status as keyof typeof STATUS_COLORS]}`}>
                        {STATUS_LABELS[activity.status as keyof typeof STATUS_LABELS] || activity.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <SafeDate date={activity.date} format={{ day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }} className="text-xs font-bold text-gray-600" />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedActivity({ id: activity.id, type: activity.type })}
                        className="opacity-40 group-hover:opacity-100 transition-all bg-black text-white rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:scale-110 active:scale-95"
                      >
                        Apri &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal 
          id={selectedActivity.id} 
          type={selectedActivity.type} 
          onClose={() => setSelectedActivity(null)} 
          currentUserRole={currentUserRole}
          currentUserName={collaborators.find(c => c.id === currentUserId)?.name || "User"}
          serverDate={serverDate}
        />
      )}
    </div>
  );
}

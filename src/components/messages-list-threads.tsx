"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SafeDate from "./safe-date";

interface Message {
  id: string;
  senderName: string;
  text: string | null;
  createdAt: Date;
  role: string;
  readByManagerAt: Date | null;
}

interface Thread {
  id: string;
  type: "MAINTENANCE" | "CLEANING";
  apartmentName: string;
  assignedUser: string;
  title: string;
  lastMessage: Message;
  messages: Message[];
  updatedAt: Date;
  hasUnread: boolean;
  date?: Date;
}

interface Props {
  initialThreads: Thread[];
  apartments: { id: string; name: string }[];
  selectedId?: string;
  selectedType?: string;
  serverDate: string;
}

export default function MessagesListThreads({ initialThreads, apartments, selectedId, selectedType, serverDate }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    type: "",
    apartmentId: "",
    unread: "",
    date: "",
  });

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setFilters({ search: "", type: "", apartmentId: "", unread: "", date: "" });
  };

  const formatDateKey = (d: Date | string) => {
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  };

  const filteredThreads = useMemo(() => {
    return initialThreads.filter((t) => {
      const matchesSearch = !filters.search || 
        t.apartmentName.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.assignedUser.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.lastMessage?.text || "").toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesType = !filters.type || t.type === filters.type;
      const matchesApartment = !filters.apartmentId || t.apartmentName === apartments.find(a => a.id === filters.apartmentId)?.name;
      const matchesUnread = !filters.unread || (filters.unread === "unread" ? t.hasUnread : !t.hasUnread);
      
      const matchesDate = !filters.date || (
        t.date && formatDateKey(t.date) === filters.date
      ) || (
        formatDateKey(t.updatedAt) === filters.date
      );

      return matchesSearch && matchesType && matchesApartment && matchesUnread && matchesDate;
    });
  }, [initialThreads, filters, apartments]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search & Filters Section */}
      <div className="p-6 bg-white border-b border-gray-100 space-y-4">
        <div className="flex items-center justify-between gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Messaggi</h3>
            <button 
              onClick={handleReset}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
            >
              <span>↺</span> Reset
            </button>
        </div>

        {/* Row 1: Search */}
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">🔍</span>
          <input 
            type="text"
            placeholder="Cerca nei messaggi..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-black transition-all outline-none font-medium"
          />
        </div>

        {/* Row 2: Selects Dropdowns */}
        <div className="flex flex-wrap gap-2">
            <select
              className="bg-gray-50 border-none rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-tighter focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer text-gray-600 hover:bg-gray-100"
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">Tutti Ruoli</option>
              <option value="MAINTENANCE">Manutenzione</option>
              <option value="CLEANING">Pulizia</option>
            </select>

            <select
              className="max-w-[120px] truncate bg-gray-50 border-none rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-tighter focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer text-gray-600 hover:bg-gray-100"
              value={filters.apartmentId}
              onChange={(e) => handleFilterChange("apartmentId", e.target.value)}
            >
              <option value="">Tutti Appartamenti</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>{apt.name}</option>
              ))}
            </select>

            <select
              className="bg-gray-50 border-none rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-tighter focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer text-gray-600 hover:bg-gray-100"
              value={filters.unread}
              onChange={(e) => handleFilterChange("unread", e.target.value)}
            >
              <option value="">Tutti gli Stati</option>
              <option value="unread">Non letti</option>
              <option value="read">Letti</option>
            </select>

            <input 
              type="date"
              className="bg-gray-50 border-none rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-tighter focus:ring-1 focus:ring-black transition-all cursor-pointer text-gray-600 hover:bg-gray-100"
              value={filters.date || ""}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredThreads.map((thread) => {
          const isActive = selectedId === thread.id && selectedType === thread.type;
          
          return (
            <Link
              key={`${thread.type}-${thread.id}`}
              href={`/dashboard/manager/messages?id=${thread.id}&type=${thread.type}`}
              className={`flex flex-col p-4 border-b border-gray-50 transition-all hover:bg-white relative ${
                isActive ? "bg-white ring-1 ring-inset ring-black/5 shadow-sm" : ""
              }`}
            >
              {thread.hasUnread && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full shadow-sm shadow-rose-200 animate-pulse" />
              )}

              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  thread.type === "MAINTENANCE" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                }`}>
                  {thread.type === "MAINTENANCE" ? "Manutenzione" : "Pulizia"}
                </span>
                {!thread.hasUnread && (
                  <SafeDate 
                    date={thread.updatedAt} 
                    serverDate={serverDate} 
                    format={{ hour: '2-digit', minute: '2-digit' }} 
                    className="text-[10px] text-gray-400 font-medium"
                  />
                )}
              </div>
              
              <h3 className={`text-sm font-bold ${isActive ? "text-black" : "text-gray-900"}`}>
                {thread.apartmentName}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium mb-1">
                {thread.assignedUser} — {thread.title}
              </p>

              {thread.type === "CLEANING" && thread.date && (
                <p className="text-[10px] font-bold text-emerald-600 mb-2">
                  📅 Pulizia: <SafeDate date={thread.date} isExplicit={true} serverDate={serverDate} />
                </p>
              )}
              
              <p className="text-xs text-gray-600 line-clamp-1">
                {thread.lastMessage?.senderName}: {thread.lastMessage?.text || "Allegato..."}
              </p>
            </Link>
          );
        })}

        {filteredThreads.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <span className="text-3xl block mb-2 opacity-20">📥</span>
            <p className="text-xs font-semibold">Nessun messaggio.</p>
          </div>
        )}
      </div>
    </div>
  );
}

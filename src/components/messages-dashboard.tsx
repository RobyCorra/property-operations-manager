"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SafeDate from "./safe-date";
import TicketConversation from "./ticket-conversation";
import { 
  Wrench, 
  Paintbrush, 
  Search, 
  Building2, 
  Filter, 
  CalendarDays, 
  RefreshCw, 
  User, 
  MessageSquare,
  ArrowRight,
  CircleCheck,
  ChevronRight
} from "./icons";

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
  threads: Thread[];
  apartments: { id: string; name: string }[];
  selectedId?: string;
  selectedType?: string;
  serverDate: string;
  userName: string;
  submitAction: any;
}

export default function MessagesDashboard({ 
  threads: initialThreads, 
  apartments, 
  selectedId, 
  selectedType, 
  serverDate, 
  userName,
  submitAction 
}: Props) {
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

  const selectedThread = initialThreads.find(
    (t) => t.id === selectedId && t.type === selectedType
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#faf8ff]">
      {/* Header Pagina */}
      <div className="px-10 pt-10 pb-6">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">Messaggi</h1>
        <p className="text-slate-500 font-medium mt-1 text-sm tracking-wide">Centro Comunicazioni Operative</p>
      </div>

      {/* TOP BAR FILTRI */}
      <div className="px-10 pb-6">
        <div className="max-w-[1700px] mx-auto bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl shadow-black/5 px-8 py-5 flex items-center gap-6">
            <div className="flex-1 min-w-[250px] relative group">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                <input 
                    type="text"
                    placeholder="Cerca nei messaggi..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full bg-white/60 border border-slate-100 rounded-full pl-14 pr-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-violet-500/20 transition-all outline-none text-slate-700 shadow-sm"
                />
            </div>

            <div className="hidden lg:flex items-center gap-4">
                <select
                    className="bg-white/60 border border-slate-100 rounded-full px-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer hover:bg-white text-slate-600 outline-none shadow-sm"
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                >
                    <option value="">Tutti i Ruoli</option>
                    <option value="MAINTENANCE">Manutenzione</option>
                    <option value="CLEANING">Pulizia</option>
                </select>

                <select
                    className="max-w-[200px] truncate bg-white/60 border border-slate-100 rounded-full px-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer hover:bg-white text-slate-600 outline-none shadow-sm"
                    value={filters.apartmentId}
                    onChange={(e) => handleFilterChange("apartmentId", e.target.value)}
                >
                    <option value="">Appartamenti</option>
                    {apartments.map((apt) => (
                        <option key={apt.id} value={apt.id}>{apt.name}</option>
                    ))}
                </select>

                <select
                    className="bg-white/60 border border-slate-100 rounded-full px-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer hover:bg-white text-slate-600 outline-none shadow-sm"
                    value={filters.unread}
                    onChange={(e) => handleFilterChange("unread", e.target.value)}
                >
                    <option value="">Tutti i messaggi</option>
                    <option value="unread">Non letti</option>
                    <option value="read">Letti</option>
                </select>

                <div className="relative group">
                    <CalendarDays size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-violet-600 pointer-events-none" />
                    <input 
                        type="date"
                        className="bg-white/60 border border-slate-100 rounded-full pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer hover:bg-white text-slate-600 outline-none shadow-sm"
                        value={filters.date}
                        onChange={(e) => handleFilterChange("date", e.target.value)}
                    />
                </div>
            </div>

            <button 
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-3 px-8 py-4 border border-slate-100 rounded-full bg-white/60 shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
            >
                <RefreshCw size={14} />
                Reset
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden border-t border-slate-200/50 bg-white/20 backdrop-blur-xl">
        {/* Sidebar: Lista Threads */}
        <div className="w-[480px] border-r border-slate-200/50 flex flex-col bg-white/20">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredThreads.map((thread) => {
              const isActive = selectedId === thread.id && selectedType === thread.type;
              return (
                <Link
                  key={`${thread.type}-${thread.id}`}
                  href={`/dashboard/manager/messages?id=${thread.id}&type=${thread.type}`}
                  className={`flex flex-col p-10 border-b border-slate-100 transition-all relative group ${
                    isActive ? "bg-white shadow-xl z-10" : "hover:bg-white/60"
                  }`}
                >
                  {thread.hasUnread && (
                    <div className="absolute top-10 right-10 w-3 h-3 bg-rose-500 rounded-full shadow-lg shadow-rose-200 animate-pulse border-2 border-white" />
                  )}

                  <div className="flex justify-between items-center mb-5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border flex items-center gap-2 ${
                      thread.type === "MAINTENANCE" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-violet-50 text-violet-600 border-violet-100"
                    }`}>
                      {thread.type === "MAINTENANCE" ? <Wrench size={10} /> : <Paintbrush size={10} />}
                      {thread.type === "MAINTENANCE" ? "Manutenzione" : "Pulizia"}
                    </span>
                    {!thread.hasUnread && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight opacity-60">
                        <CalendarDays size={10} />
                        {new Date(thread.updatedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-semibold tracking-tight transition-colors mb-1 uppercase ${isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"}`}>
                    {thread.apartmentName}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                    <User size={12} className="text-slate-300" />
                    <span>{thread.assignedUser}</span>
                    <span className="text-slate-200 px-1">•</span>
                    <span>{thread.title}</span>
                  </div>

                  {thread.type === "CLEANING" && thread.date && (
                    <p className="text-[10px] font-black text-emerald-600 mb-5 bg-emerald-50 w-fit px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
                       <CircleCheck size={12} />
                       {new Date(thread.date).toLocaleDateString('it-IT')}
                    </p>
                  )}
                  
                  <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                          <MessageSquare size={14} />
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 font-medium opacity-80 leading-relaxed pt-0.5">
                        <span className="font-bold text-slate-700">{thread.lastMessage?.senderName}:</span> {thread.lastMessage?.text || "Documento allegato..."}
                      </p>
                  </div>
                </Link>
              );
            })}

            {filteredThreads.length === 0 && (
              <div className="p-20 text-center text-slate-400">
                <MessageSquare size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Nessun messaggio trovato</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Chat View */}
        <div className="flex-1 flex flex-col bg-white shadow-2xl relative">
          {selectedThread ? (
            <div className="flex flex-col h-full">
              {/* Thread Header */}
              <div className="px-14 py-10 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-4 mb-1">
                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight uppercase">{selectedThread.apartmentName}</h2>
                    <div className={`px-5 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-2 ${
                        selectedThread.type === 'MAINTENANCE' ? 'bg-amber-500 shadow-amber-200' : 'bg-violet-600 shadow-violet-200'
                    }`}>
                      {selectedThread.type === "MAINTENANCE" ? <Wrench size={10} /> : <Paintbrush size={10} />}
                      {selectedThread.type === "MAINTENANCE" ? "Manutenzione" : "Pulizia"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium uppercase tracking-wide">
                     <User size={14} className="text-slate-300" />
                     <span>Inviato a <span className="text-slate-900 font-bold">{selectedThread.assignedUser}</span> per <span className="text-violet-600 font-bold underline decoration-violet-200 underline-offset-4">{selectedThread.title.toLowerCase()}</span></span>
                  </div>
                </div>
                
                <Link 
                  href={selectedThread.type === "MAINTENANCE" 
                    ? `/dashboard/manager/maintenance/${selectedThread.id}/edit`
                    : `/dashboard/manager/cleanings/${selectedThread.id}/edit`
                  }
                  className="group flex items-center gap-4 text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-100 px-10 py-5 rounded-full bg-white hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95"
                >
                  Vedi Intervento
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-hidden flex flex-col p-10 bg-[#fcfcfd]">
                <TicketConversation 
                  entityId={selectedThread.id}
                  initialMessages={selectedThread.messages}
                  currentUserRole="MANAGER"
                  currentUserName={userName}
                  submitAction={submitAction}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50/10">
              <div className="text-center space-y-8 max-w-[400px]">
                <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl border border-white flex items-center justify-center mx-auto mb-10 group hover:scale-110 transition-transform duration-500">
                  <MessageSquare size={54} className="text-violet-600 animate-pulse" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight uppercase">Seleziona una chat</h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">Scegli una conversazione dalla lista per monitorare gli interventi e rispondere al tuo team.</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-violet-500 uppercase tracking-widest opacity-30 pt-4">
                    <Building2 size={12} />
                    <span>Control Room Messaggi</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


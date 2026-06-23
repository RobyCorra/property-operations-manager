"use client";

import { useState, useEffect } from "react";
import { getActivityDetails } from "@/src/app/actions/activity";
import { createCleaningTaskMessage, createTicketMessage } from "@/src/app/actions/operational";
import TicketConversation from "./ticket-conversation";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

interface Props {
  id: string;
  type: 'CLEANING' | 'MAINTENANCE';
  currentUserRole: string;
  currentUserName: string;
  serverDate: string;
  onClose: () => void;
}

export default function ActivityDetailModal({ id, type, currentUserRole, currentUserName, serverDate, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getActivityDetails(id, type)
      .then(res => setData(res))
      .finally(() => setIsLoading(false));
  }, [id, type]);

  if (!isLoading && !data) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl">
          <p className="text-sm font-bold text-gray-500">Impossibile caricare i dettagli.</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-black text-white rounded-xl text-xs font-bold">Chiudi</button>
        </div>
      </div>
    );
  }

  const checklist = type === 'CLEANING' ? (data?.checklistProgress ? (data.checklistProgress as any[]) : []) : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in transition-all">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[3rem] w-full max-w-6xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${type === 'CLEANING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                {type === 'CLEANING' ? 'Pulizia' : 'Manutenzione'}
              </span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {type === 'MAINTENANCE' ? data?.title : data?.apartment.name}
              </h2>
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-tight">
               Intervento presso {data?.apartment.address} &middot; {type === "CLEANING" ? formatRomeDateTimeDisplay(data?.date) : formatRomeDateTimeDisplay(data?.scheduledStart || data?.createdAt)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl hover:bg-gray-100 flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Caricamento dettagli...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Panel: Info & History */}
            <div className="flex-1 overflow-y-auto p-8 border-r border-gray-50 bg-gray-50/20">
              <div className="space-y-10">
                
                {/* Meta Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Appartamento</p>
                    <span className="text-sm font-bold text-gray-700">{data.apartment?.name || '—'}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data</p>
                    <span className="text-sm font-bold text-gray-700">
                      {type === 'CLEANING'
                        ? formatRomeDateTimeDisplay(data.date)
                        : formatRomeDateTimeDisplay(data.scheduledStart || data.createdAt)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stato</p>
                    <span className="text-sm font-bold text-gray-700">{data.status}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Collaboratore</p>
                    <span className="text-sm font-bold text-gray-700">{data.assignedTo?.name || 'Non assegnato'}</span>
                  </div>
                  {type === 'MAINTENANCE' && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Priorità</p>
                      <span className="text-sm font-bold text-gray-700 text-orange-600">{data.priority}</span>
                    </div>
                  )}
                </div>

                {type === "CLEANING" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orario pianificato</p>
                      <p className="text-sm font-bold text-gray-700">{formatRomeDateTimeDisplay(data.date)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inizio intervento reale</p>
                      <p className="text-sm font-bold text-gray-700">
                        {data.startedAt ? formatRomeDateTimeDisplay(data.startedAt) : "Non avviato"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fine intervento reale</p>
                      <p className="text-sm font-bold text-gray-700">
                        {data.completedAt ? formatRomeDateTimeDisplay(data.completedAt) : "Non completato"}
                      </p>
                    </div>
                  </div>
                )}

                {type === "MAINTENANCE" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orario pianificato</p>
                      <p className="text-sm font-bold text-gray-700">
                        {data.scheduledStart ? formatRomeDateTimeDisplay(data.scheduledStart) : "Non pianificato"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inizio intervento reale</p>
                      <p className="text-sm font-bold text-gray-700">
                        {data.startedAt ? formatRomeDateTimeDisplay(data.startedAt) : "Non avviato"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fine intervento reale</p>
                      <p className="text-sm font-bold text-gray-700">
                        {data.resolvedAt ? formatRomeDateTimeDisplay(data.resolvedAt) : "Non completato"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes/Description */}
                {(data.notes || data.description) && (
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Note Operative</h3>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 text-sm text-gray-600 leading-relaxed shadow-sm">
                      {data.notes || data.description}
                    </div>
                  </div>
                )}

                {/* Checklist (Cleaning Only) */}
                {type === 'CLEANING' && checklist.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Esito Checklist</h3>
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className="divide-y divide-gray-50 text-sm">
                        {checklist.map((item, idx) => (
                          <div key={idx} className="px-6 py-4 flex items-center justify-between">
                            <span className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-400'}`}>{item.task}</span>
                            {item.completed ? (
                              <span className="text-emerald-500 font-bold">✓ Fatto</span>
                            ) : (
                              <span className="text-gray-300">Non eseguito</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {data.attachments && data.attachments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Allegati ({data.attachments.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {data.attachments.map((att: any) => (
                        <a 
                          key={att.id} 
                          href={att.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="group relative h-24 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden hover:border-black transition-all"
                        >
                          {att.fileType?.startsWith('image/') ? (
                             <img src={att.url} alt="Allegato" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          ) : (
                            <span className="text-2xl">📄</span>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Panel: Chat Thread */}
            <div className="w-full lg:w-[450px] bg-white flex flex-col shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100">
              <button
                onClick={() => setChatOpen(o => !o)}
                className="px-8 py-5 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Chat & Storico Messaggi</h3>
                </div>
                <span className={`text-gray-400 text-sm transition-transform ${chatOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {chatOpen && (
                <div className="flex-1 p-6 flex flex-col overflow-hidden">
                  <TicketConversation
                    entityId={data.id}
                    initialMessages={data.messages}
                    currentUserRole={currentUserRole}
                    currentUserName={currentUserName}
                    submitAction={type === 'CLEANING' ? createCleaningTaskMessage : createTicketMessage}
                    conversationType={type === 'CLEANING' ? 'CLEANING' : 'MAINTENANCE'}
                  />
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

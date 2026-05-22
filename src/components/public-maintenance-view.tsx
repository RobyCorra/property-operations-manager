"use client";

import { useState } from "react";
import { startMaintenancePublic } from "@/src/app/actions/maintenance-token";
import type { MaintenanceTaskItem } from "@/src/app/actions/maintenance-token";
import MaintenanceChecklistInteractive from "@/src/components/maintenance-checklist-interactive";
import { ChevronDown } from "lucide-react";

interface Attachment {
  id: string;
  fileName: string | null;
  fileType: string | null;
  url: string;
}

interface Props {
  ticketId: string;
  apartmentName: string;
  apartmentAddress: string;
  mapsUrl: string;
  title: string;
  description: string;
  priority: string;
  scheduledStart: string | null;
  assignedToName: string | null;
  attachments: Attachment[];
  currentStatus: string;
  tasks: MaintenanceTaskItem[];
}

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Bassa", MEDIUM: "Media", HIGH: "Alta", URGENT: "Urgente",
};
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600", MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700", URGENT: "bg-red-100 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "In attesa", OPEN: "Aperto", IN_PROGRESS: "In corso",
  AWAITING_REVIEW: "Completato", RESOLVED: "Risolto", CLOSED: "Chiuso",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600", OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  AWAITING_REVIEW: "bg-emerald-100 text-emerald-700",
  RESOLVED: "bg-emerald-100 text-emerald-700", CLOSED: "bg-emerald-100 text-emerald-700",
};

export default function PublicMaintenanceView({
  ticketId,
  apartmentName,
  apartmentAddress,
  mapsUrl,
  title,
  description,
  priority,
  scheduledStart,
  assignedToName,
  attachments,
  currentStatus,
  tasks,
}: Props) {
  const [actionLoading, setActionLoading] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const canStart  = currentStatus === "PENDING" || currentStatus === "OPEN";
  const canComplete = currentStatus === "IN_PROGRESS";
  const isDone    = ["AWAITING_REVIEW", "RESOLVED", "CLOSED"].includes(currentStatus);

  async function handleStart() {
    if (actionLoading) return;
    setActionLoading(true);
    try { await startMaintenancePublic(ticketId); window.location.reload(); }
    catch { setActionLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Header */}
      <header className="px-5 pt-4 pb-6 text-white" style={{ background: "linear-gradient(145deg,#c2410c,#ea580c)" }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔧</span>
            <p className="text-xl font-extrabold leading-tight">{apartmentName}</p>
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm underline underline-offset-2 opacity-90">
            📍 {apartmentAddress}
          </a>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-5 flex flex-col gap-3 pb-32">

        {/* Stato */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stato intervento</p>
          <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${STATUS_COLOR[currentStatus] ?? "bg-slate-100 text-slate-600"}`}>
            {STATUS_LABEL[currentStatus] ?? currentStatus}
          </span>
        </div>

        {/* Titolo + priorità */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-base font-bold text-slate-800 leading-tight">{title}</p>
            <span className={`flex-shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${PRIORITY_COLOR[priority] ?? PRIORITY_COLOR.MEDIUM}`}>
              {PRIORITY_LABEL[priority] ?? priority}
            </span>
          </div>
          {description && <p className="text-sm text-slate-600 leading-relaxed">{description}</p>}
        </div>

        {/* Accordion task */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setAccordionOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-bold text-slate-800">📋 Task intervento</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${accordionOpen ? "rotate-180" : ""}`} />
            </button>

            {accordionOpen && (
              <div className="border-t border-slate-100 p-4">
                {canComplete ? (
                  /* Checklist interattiva step-by-step */
                  <MaintenanceChecklistInteractive
                    ticketId={ticketId}
                    initialTasks={tasks}
                  />
                ) : (
                  /* Read-only prima dell'avvio */
                  <div>
                    {tasks.map((task, idx) => (
                      <div key={task.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-[9px] font-black flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="flex-1 text-sm text-slate-700 font-medium">{task.label}</p>
                        {task.photoRequired && (
                          <span className="text-[9px] font-black bg-violet-50 text-violet-600 border border-violet-200 rounded-md px-2 py-0.5 flex-shrink-0">
                            📷 foto
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pianificazione */}
        {scheduledStart && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Orario pianificato</p>
            <p className="text-base font-bold text-slate-800">{scheduledStart}</p>
          </div>
        )}

        {/* Assegnato a */}
        {assignedToName && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assegnato a</p>
            <p className="text-base font-bold text-slate-800">👤 {assignedToName}</p>
          </div>
        )}

        {/* Allegati */}
        {attachments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Allegati</p>
            <div className="grid grid-cols-2 gap-2">
              {attachments.map(att => (
                <a key={att.id} href={att.url} target="_blank" rel="noreferrer"
                  className="group relative h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                  {att.fileType?.startsWith("image/") ? (
                    <img src={att.url} alt={att.fileName ?? "Allegato"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-2xl">📄</span>
                      <p className="text-[9px] font-bold text-slate-500 mt-1 truncate px-1">{att.fileName}</p>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Banner completato */}
        {isDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <p className="text-emerald-800 font-bold text-base mb-1">✅ Intervento completato</p>
            <p className="text-emerald-600 text-sm">Il manager è stato avvisato. Grazie!</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pb-2">Link generato dal manager · accesso senza login</p>
      </div>

      {/* Pulsante fisso — solo prima dell'avvio */}
      {canStart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-20">
          <div className="max-w-lg mx-auto">
            <button onClick={handleStart} disabled={actionLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-orange-200 transition-colors disabled:opacity-70">
              {actionLoading ? "Avvio in corso..." : "▶ Avvia intervento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

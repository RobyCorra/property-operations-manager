"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Pencil, X, Loader2 } from "lucide-react";
import OperationalForm from "@/src/components/operational-form";
import TicketConversation from "@/src/components/ticket-conversation";
import AIAssistant from "@/src/components/ai-assistant";
import CleaningCorrectionPanel from "@/src/components/cleaning-correction-panel";
import type { CorrectionItem } from "@/src/components/cleaning-correction-panel";
import { updateCleaningStatus, updateCleaningTask, createCleaningTaskMessage } from "@/src/app/actions/operational";
import { hapticMedium, hapticSuccess } from "@/src/lib/haptics";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import { calculateLinen } from "@/src/lib/linen-calculator";

interface ChecklistItem {
  id: string;
  label: string;
  type: string;
  value?: number | null;
  required: boolean;
  completed: boolean;
  photoUrl?: string | null;
  skipped?: boolean;
}

interface NextBooking {
  guestName: string | null;
  totalGuests: number;
  checkInDate: Date;
  cullaRequested?: boolean | null;
}

interface CleaningTask {
  id: string;
  apartmentId: string;
  assignedToId?: string | null;
  date: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  status: string;
  notes: string | null;
  checklistProgress: unknown;
  correctionProgress: unknown;
  nextBooking?: NextBooking | null;
  apartment: { name: string; address: string; bathrooms?: number; bedConfig?: unknown };
  assignedTo?: { name: string } | null;
  aiAssistantMessages: {
    createdAt: Date;
    role: "USER" | "ASSISTANT";
    userRole: string;
    content: string;
  }[];
}

interface Option { id: string; name: string }
interface Message { id: string; text: string | null; role: string; senderName: string; createdAt: Date; attachment?: unknown }

interface Props {
  task: CleaningTask;
  apartments: Option[];
  cleaners: Option[];
  messages: Message[];
  userName: string;
}

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  PENDING:         { label: "In Attesa",       dot: "bg-slate-400",                    badge: "bg-slate-100 text-slate-600" },
  IN_PROGRESS:     { label: "In Corso",        dot: "bg-violet-500 animate-pulse",     badge: "bg-violet-500/10 text-violet-600" },
  COMPLETED:       { label: "Completata",      dot: "bg-emerald-500",                  badge: "bg-emerald-500/10 text-emerald-700" },
  AWAITING_REVIEW: { label: "In Verifica",     dot: "bg-yellow-500 animate-pulse",     badge: "bg-yellow-500/10 text-yellow-700" },
  APPROVED:        { label: "Approvata",       dot: "bg-emerald-600",                  badge: "bg-emerald-600/10 text-emerald-800" },
};

export default function CleaningDetailView({ task, apartments, cleaners, messages, userName }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [isPending, startTransition] = useTransition();
  const correctionItems = Array.isArray(task.correctionProgress) ? task.correctionProgress as CorrectionItem[] : [];
  const hasCorrections = correctionItems.length > 0;

  const checklist = Array.isArray(task.checklistProgress) ? task.checklistProgress as ChecklistItem[] : [];
  const completedCount = checklist.filter((i) => i.completed).length;
  const total = checklist.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const photosCount = checklist.filter((i) => i.photoUrl).length;
  const sc = statusConfig[status] ?? statusConfig.PENDING;


  const handleStatusUpdate = (nextStatus: string) => {
    startTransition(async () => {
      await updateCleaningStatus(task.id, nextStatus);
      setStatus(nextStatus);
      if (nextStatus === "IN_PROGRESS") hapticMedium();
      else if (nextStatus === "AWAITING_REVIEW" || nextStatus === "APPROVED") hapticSuccess();
    });
  };

  const openChat = () => {
    setEditOpen(true);
    setTimeout(() => document.getElementById("cleaning-chat-section")?.scrollIntoView({ behavior: "smooth" }), 150);
  };

  return (
    <div className="space-y-6">

      {/* ── CORREZIONI RICHIESTE ───────────────────────────── */}
      {status === "IN_PROGRESS" && hasCorrections && (
        <CleaningCorrectionPanel
          cleaningTaskId={task.id}
          initialItems={correctionItems}
          onResolved={() => setStatus("AWAITING_REVIEW")}
        />
      )}

      {/* Main card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">

        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-600">
                🧹 Pulizia
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${sc.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 uppercase line-clamp-1">{task.apartment.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{task.apartment.address}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen((v) => !v)}
            className={`shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              editOpen
                ? "border-gray-300 bg-gray-100 text-gray-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {editOpen ? <><X size={13} /> Chiudi</> : <><Pencil size={13} /> Modifica</>}
          </button>
        </div>

        {/* Body — 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          {/* Left: informazioni */}
          <div className="p-6 space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Informazioni chiave</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">📅</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quando</p>
                    <p className="text-sm font-bold text-gray-900">{formatRomeDateTimeDisplay(task.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">👤</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cleaner</p>
                    <p className="text-sm font-bold text-gray-900">{task.assignedTo?.name ?? "Non assegnato"}</p>
                  </div>
                </div>
                {task.nextBooking && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">🎯</span>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preparazione per</p>
                      <p className="text-sm font-bold text-gray-900">{task.nextBooking.guestName ?? "Ospite"}</p>
                      <p className="text-[10px] text-gray-500">{task.nextBooking.totalGuests} ospiti</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

                {/* Biancheria */}
                {task.nextBooking && (() => {
                  const linen = calculateLinen(
                    task.apartment.bedConfig,
                    task.nextBooking.totalGuests,
                    !!(task.nextBooking.cullaRequested)
                  );
                  return (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Biancheria da Preparare</p>

                      {/* Asciugamani + Tappetini */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center gap-2">
                          <span className="text-sm">🛁</span>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Asciugamani</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{task.nextBooking.totalGuests * 2}</p>
                          </div>
                        </div>
                        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center gap-2">
                          <span className="text-sm">🚿</span>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tappetini</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{task.apartment.bathrooms ?? "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Letti */}
                      <div className="space-y-1.5 mb-2">
                        {linen.beds.map(bed => (
                          <div key={bed.key} className={`flex items-center justify-between rounded-xl px-3 py-2 border ${bed.isFixed ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100"}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${bed.isFixed ? "bg-blue-400" : "bg-amber-400"}`} />
                              <div>
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{bed.label} ×{bed.count}</p>
                                <p className="text-[9px] text-gray-400 font-semibold">{bed.isFixed ? "fisso" : "aggiunto"}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {[
                                { v: bed.linen.lenzuola,     l: "Lenz." },
                                { v: bed.linen.federe,       l: "Fed."  },
                                { v: bed.linen.copriPiumino, l: "Cop."  },
                              ].map(chip => (
                                <div key={chip.l} className="bg-white border border-gray-100 rounded-lg px-2 py-1 text-center min-w-[30px]">
                                  <p className="text-[11px] font-black text-gray-900 leading-none">{chip.v}</p>
                                  <p className="text-[7px] font-black uppercase tracking-wide text-gray-400">{chip.l}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Totali */}
                      <div className="rounded-xl bg-gray-900 px-3 py-2 flex mb-2">
                        {[
                          { v: linen.adults.lenzuola,     l: "Lenzuola"   },
                          { v: linen.adults.federe,       l: "Federe"     },
                          { v: linen.adults.copriPiumino, l: "Copripium." },
                        ].map((t, i) => (
                          <div key={t.l} className={`flex-1 text-center ${i > 0 ? "border-l border-white/10" : ""}`}>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{t.l}</p>
                            <p className="text-base font-black text-white leading-none mt-0.5">{t.v}</p>
                          </div>
                        ))}
                      </div>

                      {/* Culla */}
                      {linen.culla && (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">culla</span>
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Lettino Neonato</span>
                          </div>
                          <div className="flex gap-1">
                            {[
                              { v: linen.culla.lenzuola, l: "Lenz." },
                              { v: linen.culla.federe,   l: "Fed."  },
                            ].map(chip => (
                              <div key={chip.l} className="bg-emerald-100 border border-emerald-200 rounded-lg px-2 py-1 text-center min-w-[30px]">
                                <p className="text-[11px] font-black text-emerald-900 leading-none">{chip.v}</p>
                                <p className="text-[7px] font-black uppercase tracking-wide text-emerald-500">{chip.l}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

            {task.notes && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Note operative</p>
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 italic">
                  "{task.notes}"
                </div>
              </div>
            )}
          </div>

          {/* Right: stato + checklist + foto */}
          <div className="p-6 space-y-5">

            {/* Stato attuale */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Stato operativo</p>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Stato attuale</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${sc.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
            </div>

            {/* Checklist progress */}
            {total > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Checklist qualità</p>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                  <div className="flex items-end justify-between">
                    <p className={`text-2xl font-semibold tracking-tight ${progress === 100 ? "text-emerald-600" : "text-gray-900"}`}>
                      {completedCount} <span className="text-sm font-medium text-gray-400">/ {total} Punti</span>
                    </p>
                    {progress === 100 && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        ✓ Completata
                      </span>
                    )}
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-emerald-500" : "bg-violet-500"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">{progress}% completata</p>
                </div>
              </div>
            )}

            {/* Foto checklist accordion */}
            {checklist.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setPhotosOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    📸 Foto verifica checklist
                    {photosCount > 0 && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-black text-violet-600">
                        {photosCount}
                      </span>
                    )}
                  </span>
                  {photosOpen
                    ? <ChevronUp size={14} className="text-gray-400 shrink-0" />
                    : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
                </button>

                {photosOpen && (
                  <div className="mt-2 rounded-xl border border-gray-100 bg-white divide-y divide-gray-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                        <span className={`mt-0.5 text-base leading-none shrink-0 ${item.completed ? "opacity-100" : "opacity-25"}`}>
                          {item.completed ? "☑" : "○"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${item.completed ? "text-gray-800" : "text-gray-400"}`}>
                            {item.label}
                            {item.required && <span className="text-rose-400 ml-0.5 text-[10px]">*</span>}
                          </p>
                          {item.completed && item.photoUrl ? (
                            <a href={item.photoUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block group">
                              <img
                                src={item.photoUrl}
                                alt={item.label}
                                className="h-16 w-24 object-cover rounded-lg border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                              />
                            </a>
                          ) : item.completed ? (
                            <p className="text-[10px] text-gray-400 mt-0.5">nessuna foto</p>
                          ) : item.skipped ? (
                            <p className="text-[10px] text-amber-500 mt-0.5">saltato</p>
                          ) : (
                            <p className="text-[10px] text-gray-300 mt-0.5">non completato</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tempi reali */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Inizio reale</p>
                <p className="text-xs font-bold text-gray-800">
                  {task.startedAt ? formatRomeDateTimeDisplay(task.startedAt) : "Non avviato"}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">Fine reale</p>
                <p className="text-xs font-bold text-gray-800">
                  {task.completedAt ? formatRomeDateTimeDisplay(task.completedAt) : "Non completato"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          {status === "PENDING" && (
            <button
              type="button"
              onClick={() => handleStatusUpdate("IN_PROGRESS")}
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : "▶"}
              Avvia Pulizia
            </button>
          )}
          {status === "IN_PROGRESS" && !hasCorrections && (
            <button
              type="button"
              onClick={() => handleStatusUpdate("AWAITING_REVIEW")}
              disabled={isPending}
              className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-200 transition-all hover:bg-amber-600 active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : "✓"}
              Completata — Invia per verifica
            </button>
          )}
          {status === "IN_PROGRESS" && hasCorrections && (
            <span className="rounded-full bg-rose-50 border border-rose-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">
              ⚠ Correggi i punti sopra
            </span>
          )}
          {status === "AWAITING_REVIEW" && (
            <span className="rounded-full bg-yellow-50 border border-yellow-200 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-yellow-700">
              ⏳ In attesa di revisione
            </span>
          )}
          {status === "APPROVED" && (
            <span className="rounded-full bg-emerald-50 border border-emerald-100 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700">
              ✓ Approvata
            </span>
          )}

          <button
            type="button"
            onClick={openChat}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
          >
            💬 Chat ({messages.length})
          </button>
        </div>
      </div>

      {/* Edit section */}
      {editOpen && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <Pencil size={15} className="text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">Modifica Pulizia</h2>
            </div>
            <div className="p-6">
              <OperationalForm
                type="CLEANING"
                apartments={apartments}
                personnel={cleaners}
                action={updateCleaningTask as any}
                initialData={{
                  id: task.id,
                  apartmentId: task.apartmentId,
                  assignedToId: task.assignedToId,
                  date: task.date,
                  notes: task.notes,
                  status: task.status,
                }}
              />
            </div>
          </div>

          <div id="cleaning-chat-section" className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">💬 Chat con Addetto</h2>
            <TicketConversation
              entityId={task.id}
              initialMessages={messages as any}
              currentUserRole="MANAGER"
              currentUserName={userName}
              submitAction={createCleaningTaskMessage}
            />
          </div>

          <AIAssistant
            role="MANAGER"
            type="cleaning"
            apartmentId={task.apartmentId}
            cleaningTaskId={task.id}
            initialMessages={task.aiAssistantMessages}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Pencil, X, Loader2 } from "lucide-react";
import OperationalForm from "@/src/components/operational-form";
import TicketConversation from "@/src/components/ticket-conversation";
import AIAssistant from "@/src/components/ai-assistant";
import CleaningCorrectionPanel from "@/src/components/cleaning-correction-panel";
import type { CorrectionItem } from "@/src/components/cleaning-correction-panel";
import { updateCleaningStatus, updateCleaningTask, createCleaningTaskMessage, approveCleaningDirectly } from "@/src/app/actions/operational";
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
  cullaRequested?: boolean | null;
  sofaBedForced?: boolean | null;
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
  PENDING:         { label: "In Attesa",   dot: "bg-slate-400",                badge: "bg-slate-100 text-slate-600" },
  IN_PROGRESS:     { label: "In Corso",    dot: "bg-violet-500 animate-pulse", badge: "bg-violet-500/10 text-violet-600" },
  COMPLETED:       { label: "Completata",  dot: "bg-emerald-500",              badge: "bg-emerald-500/10 text-emerald-700" },
  AWAITING_REVIEW: { label: "In Verifica", dot: "bg-yellow-500 animate-pulse", badge: "bg-yellow-500/10 text-yellow-700" },
  APPROVED:        { label: "Approvata",   dot: "bg-emerald-600",              badge: "bg-emerald-600/10 text-emerald-800" },
};

export default function CleaningDetailView({ task, apartments, cleaners, messages, userName }: Props) {
  const bc = task.apartment.bedConfig as Record<string, { count?: number }> | null;
  const hasSofaBed = !!(bc && ((bc.divanoMatrimoniale?.count ?? 0) > 0 || (bc.divanoSingolo?.count ?? 0) > 0));

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
      else if (nextStatus === "AWAITING_REVIEW") hapticSuccess();
    });
  };

  const handleApprove = () => {
    startTransition(async () => {
      await approveCleaningDirectly(task.id);
      setStatus("APPROVED");
      hapticSuccess();
    });
  };

  const openChat = () => {
    setEditOpen(true);
    setTimeout(() => document.getElementById("cleaning-chat-section")?.scrollIntoView({ behavior: "smooth" }), 150);
  };

  return (
    <div className="space-y-4 w-full">

      {/* ── CORREZIONI RICHIESTE ───────────────────────────── */}
      {status === "IN_PROGRESS" && hasCorrections && (
        <CleaningCorrectionPanel
          cleaningTaskId={task.id}
          initialItems={correctionItems}
          onResolved={() => setStatus("AWAITING_REVIEW")}
        />
      )}

      {/* Main card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden w-full">

        {/* Header bar */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-600">
                  🧹 Pulizia
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${sc.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 uppercase break-words">{task.apartment.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5 break-words">{task.apartment.address}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditOpen((v) => !v)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                editOpen
                  ? "border-gray-300 bg-gray-100 text-gray-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {editOpen ? <><X size={13} /> Chiudi</> : <><Pencil size={13} /> Modifica</>}
            </button>
          </div>
        </div>

        {/* Body — single column on mobile, 2 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          {/* Left: informazioni */}
          <div className="p-4 md:p-6 space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Informazioni chiave</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5 shrink-0">📅</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quando</p>
                    <p className="text-sm font-bold text-gray-900">{formatRomeDateTimeDisplay(task.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5 shrink-0">👤</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cleaner</p>
                    <p className="text-sm font-bold text-gray-900">{task.assignedTo?.name ?? "Non assegnato"}</p>
                  </div>
                </div>
                {task.nextBooking && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5 shrink-0">🎯</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preparazione per</p>
                      <p className="text-sm font-bold text-gray-900 break-words">{task.nextBooking.guestName ?? "Ospite"}</p>
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
                !!(task.cullaRequested ?? task.nextBooking.cullaRequested),
                !!(task.sofaBedForced),
              );
              return (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Biancheria da Preparare</p>

                  {/* Asciugamani + Tappetini */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center gap-2">
                      <span className="text-sm shrink-0">🛁</span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Asciugamani</p>
                        <p className="text-lg font-black text-gray-900 leading-none">{task.nextBooking.totalGuests * 2}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 flex items-center gap-2">
                      <span className="text-sm shrink-0">🚿</span>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tappetini</p>
                        <p className="text-lg font-black text-gray-900 leading-none">{task.apartment.bathrooms ?? "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Letti — layout verticale su mobile */}
                  <div className="space-y-2 mb-2">
                    {linen.beds.map(bed => (
                      <div key={bed.key} className={`rounded-xl px-3 py-2.5 border ${bed.isFixed ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100"}`}>
                        {/* Nome letto */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${bed.isFixed ? "bg-blue-400" : "bg-amber-400"}`} />
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{bed.label} ×{bed.count}</p>
                          <span className="text-[9px] text-gray-400 font-semibold ml-auto">{bed.isFixed ? "fisso" : "aggiunto"}</span>
                        </div>
                        {/* Chip biancheria — sempre in riga */}
                        <div className="flex gap-1.5">
                          {[
                            { v: bed.linen.lenzuola,     l: "Lenz." },
                            { v: bed.linen.federe,       l: "Fed."  },
                            { v: bed.linen.copriPiumino, l: "Cop."  },
                          ].map(chip => (
                            <div key={chip.l} className="flex-1 bg-white border border-gray-100 rounded-lg py-1.5 text-center">
                              <p className="text-sm font-black text-gray-900 leading-none">{chip.v}</p>
                              <p className="text-[7px] font-black uppercase tracking-wide text-gray-400 mt-0.5">{chip.l}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totali */}
                  <div className="rounded-xl bg-gray-900 px-3 py-3 flex mb-2">
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
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0">culla</span>
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">Lettino Neonato</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[
                          { v: linen.culla.lenzuola, l: "Lenz." },
                          { v: linen.culla.federe,   l: "Fed."  },
                        ].map(chip => (
                          <div key={chip.l} className="flex-1 bg-emerald-100 border border-emerald-200 rounded-lg py-1.5 text-center">
                            <p className="text-sm font-black text-emerald-900 leading-none">{chip.v}</p>
                            <p className="text-[7px] font-black uppercase tracking-wide text-emerald-500 mt-0.5">{chip.l}</p>
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
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 italic break-words">
                  "{task.notes}"
                </div>
              </div>
            )}
          </div>

          {/* Right: stato + checklist + foto */}
          <div className="p-4 md:p-6 space-y-5">

            {/* Stato attuale */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Stato operativo</p>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-500">Stato attuale</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shrink-0 ${sc.badge}`}>
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
                  <div className="flex items-end justify-between gap-2">
                    <p className={`text-2xl font-semibold tracking-tight ${progress === 100 ? "text-emerald-600" : "text-gray-900"}`}>
                      {completedCount} <span className="text-sm font-medium text-gray-400">/ {total}</span>
                    </p>
                    {progress === 100 && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 shrink-0">
                        ✓ OK
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
                    📸 Foto checklist
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
                          <p className={`text-xs font-semibold leading-snug break-words ${item.completed ? "text-gray-800" : "text-gray-400"}`}>
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
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Inizio</p>
                <p className="text-xs font-bold text-gray-800 break-words">
                  {task.startedAt ? formatRomeDateTimeDisplay(task.startedAt) : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">Fine</p>
                <p className="text-xs font-bold text-gray-800 break-words">
                  {task.completedAt ? formatRomeDateTimeDisplay(task.completedAt) : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-4">
          {status === "PENDING" && (
            <button
              type="button"
              onClick={() => handleStatusUpdate("IN_PROGRESS")}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
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
              className="w-full flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : "✓"}
              Invia per verifica
            </button>
          )}
          {status === "IN_PROGRESS" && hasCorrections && (
            <div className="w-full text-center rounded-full bg-rose-50 border border-rose-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600">
              ⚠ Correggi i punti sopra
            </div>
          )}
          {status === "IN_PROGRESS" && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : "✓"}
              Approva direttamente (sblocca)
            </button>
          )}
          {status === "AWAITING_REVIEW" && (
            <div className="w-full rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-lg">⏳</div>
                <div>
                  <p className="text-[12px] font-black text-amber-900">In attesa di revisione</p>
                  {task.assignedTo?.name && (
                    <p className="text-[11px] text-amber-700 font-medium">{task.assignedTo.name} ha completato la pulizia</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(5,150,105,.35)] active:scale-95 transition-transform disabled:opacity-50"
              >
                {isPending ? <Loader2 size={13} className="animate-spin" /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                Conferma Pulizia
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                disabled={isPending}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-rose-300 text-rose-600 text-[12px] font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Richiedi correzioni
              </button>
            </div>
          )}
          {status === "APPROVED" && (
            <div className="w-full text-center rounded-full bg-emerald-50 border border-emerald-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-700">
              ✓ Approvata
            </div>
          )}
          <button
            type="button"
            onClick={openChat}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-600 shadow-sm transition-colors active:scale-95"
          >
            💬 Chat ({messages.length})
          </button>
        </div>
      </div>

      {/* Edit section */}
      {editOpen && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-gray-100">
              <Pencil size={15} className="text-gray-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">Modifica Pulizia</h2>
            </div>
            <div className="p-4 md:p-6">
              <OperationalForm
                type="CLEANING"
                apartments={apartments}
                personnel={cleaners}
                action={updateCleaningTask as any}
                hasSofaBed={hasSofaBed}
                redirectTo="/dashboard/manager?sheet=cleanings"
                initialData={{
                  id: task.id,
                  apartmentId: task.apartmentId,
                  assignedToId: task.assignedToId,
                  date: task.date,
                  notes: task.notes,
                  status: task.status,
                  cullaRequested: task.cullaRequested ?? false,
                  sofaBedForced: task.sofaBedForced ?? false,
                }}
              />
            </div>
          </div>

          <div id="cleaning-chat-section" className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 md:p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">💬 Chat con Addetto</h2>
            <TicketConversation
              entityId={task.id}
              initialMessages={messages as any}
              currentUserRole="MANAGER"
              currentUserName={userName}
              submitAction={createCleaningTaskMessage}
              conversationType="CLEANING"
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

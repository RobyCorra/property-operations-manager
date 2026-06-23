import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/src/app/actions/auth";
import { updateMaintenanceStatus, markMaintenanceMessagesReadByWorker } from "@/src/app/actions/operational";
import MarkMessagesRead from "@/src/components/mark-messages-read";
import StatusUpdateButton from "@/src/components/status-update-button";
import { prisma } from "@/src/lib/prisma";
import AIAssistant from "@/src/components/ai-assistant";
import MaintenanceChecklistInteractive from "@/src/components/maintenance-checklist-interactive";
import MaintenanceNoteForm from "@/src/components/maintenance-note-form";
import type { MaintenanceTaskItem } from "@/src/app/actions/maintenance-token";
import AccessInstructionsCard from "@/src/components/access-instructions-card";
import ExpandableMaintenanceCard from "@/src/components/expandable-maintenance-card";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import PushPermissionRequest from "@/src/components/push-permission";
import {
  LogOut,
  Navigation,
  CalendarDays,
  CircleCheck
} from "@/src/components/icons";
import { ScrollText, Wrench } from "lucide-react";

type AttachmentLink = {
  id: string;
  url: string;
  fileName: string;
  fileType: string | null;
};

type MaintenanceTicketView = {
  id: string;
  apartmentId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  startedAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
  apartment: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    accessInstructions: string | null;
  };
  attachments: AttachmentLink[];
  maintenanceTasks?: unknown;
  messages: {
    id: string;
    text: string | null;
    senderName: string;
    role: string;
    createdAt: Date;
    attachment?: AttachmentLink | null;
  }[];
  aiAssistantMessages: {
    createdAt: Date;
    role: "USER" | "ASSISTANT";
    userRole: string;
    content: string;
  }[];
};

function linkedAttachments({
  attachments,
  messages,
}: {
  attachments: AttachmentLink[];
  messages: { attachment?: AttachmentLink | null }[];
}) {
  const byId = new Map<string, AttachmentLink>();
  for (const attachment of attachments) {
    byId.set(attachment.id, attachment);
  }
  for (const message of messages) {
    if (message.attachment) {
      byId.set(message.attachment.id, message.attachment);
    }
  }
  return [...byId.values()];
}

export default async function MaintenanceDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;
  const view = (await searchParams)?.view;
  const isHistoryView = view === "history";

  if (role !== "MAINTENANCE" || !userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      maintenanceTickets: {
        where: { status: { in: isHistoryView ? ["RESOLVED", "APPROVED", "CANCELLED"] : ["PENDING", "IN_PROGRESS", "RESOLVED", "AWAITING_REVIEW"] } },
        include: {
          apartment: true,
          attachments: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: { attachment: true }
          },
          aiAssistantMessages: {
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const priorityColors: Record<string, string> = {
    LOW: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-200/50",
    HIGH: "bg-orange-500/10 text-orange-600 border-orange-200/50",
    URGENT: "bg-rose-500/10 text-rose-600 border-rose-200/50",
  };

  const priorityLabel: Record<string, string> = {
    LOW: "Bassa",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente",
  };

  return (
    <>
    <main className="min-h-screen bg-[#faf8ff] p-6 pb-28 font-sans text-slate-900 lg:p-10 lg:pb-10">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">
              Ciao, {user.name} <span className="text-violet-600">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium tracking-normal">
              {isHistoryView ? "Consulta i ticket risolti assegnati a te" : "Ecco i guasti aperti assegnati a te"}
            </p>
          </div>
          {/* Desktop-only nav buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={isHistoryView ? "/dashboard/maintenance" : "/dashboard/maintenance?view=history"}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
            >
              <ScrollText size={14} />
              {isHistoryView ? "Ticket Aperti" : "Storico"}
            </Link>
            <form action={logoutAction}>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Section header */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase">
              {isHistoryView ? "Storico Ticket" : "Ticket Aperti"}
            </h2>
            <div className="h-px flex-1 bg-slate-200/50"></div>
            {isHistoryView && (
              <Link
                href="/dashboard/maintenance"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm hover:shadow-md transition-all"
              >
                Torna ai ticket aperti
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {user.maintenanceTickets.map((ticket: MaintenanceTicketView) => {
              const ticketAttachments = linkedAttachments({ attachments: ticket.attachments, messages: ticket.messages });

              const hasUnreadMsg = ticket.messages?.some((m: any) => m.role === "MANAGER" && !m.readByWorkerAt) ?? false;

              return (
                <>
                <ExpandableMaintenanceCard
                  key={ticket.id}
                  className={`space-y-5 rounded-[2.5rem] border p-5 shadow-2xl backdrop-blur-xl lg:p-7 ${
                    hasUnreadMsg ? "border-rose-400 bg-white/80 ring-2 ring-rose-400/40 shadow-rose-100" : "border-white/60 bg-white/55 shadow-black/5"
                  }`}
                  headerMain={(
                    <div className="min-w-0 space-y-2">
                      {/* Priority badge — prominent on mobile */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${priorityColors[ticket.priority] || "bg-slate-100 text-slate-500"}`}>
                          {priorityLabel[ticket.priority] ?? ticket.priority}
                        </span>
                        <div className="flex items-center gap-2 rounded-full bg-slate-100/70 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <div className={`h-1.5 w-1.5 rounded-full ${ticket.status === "IN_PROGRESS" ? "bg-orange-500 animate-pulse" : ticket.status === "PENDING" ? "bg-blue-400" : "bg-slate-300"}`} />
                          {ticket.status === "PENDING" ? "In attesa" : ticket.status === "IN_PROGRESS" ? "In corso" : "Risolto"}
                        </div>
                      </div>
                      <h3 className="text-2xl font-semibold uppercase tracking-tight text-slate-900 line-clamp-1">{ticket.title}</h3>
                      <p className="text-sm font-medium text-slate-500 truncate">
                        {ticket.apartment.name} <span className="mx-1 text-slate-300">/</span> {ticket.apartment.address}
                      </p>
                      {/* Date shown inline on mobile */}
                      {ticket.scheduledStart && (
                        <div className="mt-1 flex items-center gap-2 lg:hidden">
                          <CalendarDays size={13} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{formatRomeDateTimeDisplay(ticket.scheduledStart)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  headerMeta={(
                    /* Date pill — desktop only */
                    <div className="hidden lg:flex flex-col items-end gap-2">
                      {ticket.scheduledStart ? (
                        <div className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-white shadow-lg shadow-slate-200">
                          <CalendarDays size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                            {formatRomeDateTimeDisplay(ticket.scheduledStart)}
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-full bg-slate-100 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Non pianificato
                        </div>
                      )}
                    </div>
                  )}
                  actionRow={(
                    !isHistoryView && ticket.status === "PENDING" ? (
                      <StatusUpdateButton
                        id={ticket.id}
                        nextStatus="IN_PROGRESS"
                        label="▶  Avvia Intervento"
                        action={updateMaintenanceStatus}
                        className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-black uppercase tracking-widest py-4 rounded-full transition-all duration-300 shadow-xl shadow-violet-200 hover:shadow-2xl hover:scale-[1.03] active:scale-95"
                      />
                    ) : !isHistoryView && ticket.status === "IN_PROGRESS" ? (
                      <div className="w-full rounded-full bg-orange-50 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-orange-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse mr-2 align-middle" />
                        Intervento in corso — apri dettagli per chiudere
                      </div>
                    ) : !isHistoryView && (ticket.status === "RESOLVED" || ticket.status === "AWAITING_REVIEW") ? (
                      <div className="w-full rounded-full bg-yellow-50 border border-yellow-200 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-yellow-700">
                        ⏳ In attesa di revisione
                      </div>
                    ) : isHistoryView ? (
                      <div className="w-full rounded-full bg-emerald-50 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-emerald-700">
                        ✓ Ticket chiuso
                      </div>
                    ) : null
                  )}
                  expandedContent={(
                    <>
                      {hasUnreadMsg && (
                        <MarkMessagesRead
                          ticketId={ticket.id}
                          markAsRead={markMaintenanceMessagesReadByWorker}
                        />
                      )}
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Azione / Tempi */}
                        <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tempi intervento</p>
                          <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <CalendarDays size={14} />
                              Orario pianificato
                            </div>
                            {ticket.scheduledStart ? (
                              <div className="flex flex-wrap gap-2 text-sm font-bold text-slate-900">
                                <span>{formatRomeDateTimeDisplay(ticket.scheduledStart)}</span>
                                {ticket.scheduledEnd && (
                                  <>
                                    <span className="text-slate-300">→</span>
                                    <span>{formatRomeDateTimeDisplay(ticket.scheduledEnd)}</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs font-medium uppercase tracking-tight text-slate-400">Non ancora pianificato.</p>
                            )}
                            {(ticket.startedAt || ticket.resolvedAt) && (
                              <div className="space-y-1 pt-2 text-xs font-bold text-slate-600">
                                {ticket.startedAt && <p>Inizio reale: <span>{formatRomeDateTimeDisplay(ticket.startedAt)}</span></p>}
                                {ticket.resolvedAt && <p>Fine reale: <span>{formatRomeDateTimeDisplay(ticket.resolvedAt)}</span></p>}
                              </div>
                            )}
                          </div>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${ticket.apartment.latitude},${ticket.apartment.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-colors hover:text-violet-600"
                          >
                            <Navigation size={14} />
                            Percorso
                          </a>
                        </div>

                        <AccessInstructionsCard accessInstructions={ticket.apartment.accessInstructions} />
                      </div>

                      {/* Descrizione */}
                      <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-lg">🛠️</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intervento</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Problema</p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{ticket.title}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Descrizione / note</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                              {ticket.description || "Nessuna descrizione inserita."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Checklist task — solo IN_PROGRESS con task presenti */}
                      {ticket.status === "IN_PROGRESS" && Array.isArray(ticket.maintenanceTasks) && (ticket.maintenanceTasks as MaintenanceTaskItem[]).length > 0 && (
                        <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                          <div className="mb-4 flex items-center gap-2">
                            <span className="text-lg">📋</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task intervento</p>
                          </div>
                          <MaintenanceChecklistInteractive
                            ticketId={ticket.id}
                            initialTasks={ticket.maintenanceTasks as MaintenanceTaskItem[]}
                          />
                        </div>
                      )}

                      {/* Chat con Manager (note + foto) */}
                      {(() => {
                        const isDone = ["AWAITING_REVIEW", "RESOLVED", "CLOSED"].includes(ticket.status);
                        const notes = ticket.messages
                          .filter(m => m.role === "MAINTENANCE" || m.role === "MANAGER")
                          .map(m => ({
                            id: m.id,
                            role: m.role,
                            text: m.text,
                            senderName: m.senderName,
                            createdAt: m.createdAt,
                            attachment: m.attachment
                              ? { url: m.attachment.url, fileName: m.attachment.fileName, fileType: m.attachment.fileType ?? null }
                              : null,
                          }));
                        return (
                          <MaintenanceNoteForm
                            ticketId={ticket.id}
                            authorName={user.name}
                            initialMessages={notes}
                            isDone={isDone}
                            title="Chat con Manager"
                          />
                        );
                      })()}

                      {/* AI Assistant */}
                      {!isHistoryView && (
                        <AIAssistant
                          role="MAINTENANCE"
                          type="maintenance"
                          apartmentId={ticket.apartmentId}
                          maintenanceTicketId={ticket.id}
                          initialMessages={ticket.aiAssistantMessages}
                          compact
                        />
                      )}

                      {/* Allegati */}
                      <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-lg">📎</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allegati collegati</p>
                        </div>
                        {ticketAttachments.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {ticketAttachments.map((attachment: AttachmentLink) => (
                              <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="truncate text-sm font-bold text-slate-700">{attachment.fileName}</p>
                                <a href={attachment.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm">
                                  Apri
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-400">Nessun allegato collegato.</p>
                        )}
                      </div>
                    </>
                  )}
                />
                </>
              );
            })}

            {user.maintenanceTickets.length === 0 && (
              <div className="bg-white/40 backdrop-blur-xl p-20 rounded-[3rem] border border-slate-200 border-dashed text-center">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100">
                  <CircleCheck size={48} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase">Control Room Stabile</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium tracking-normal mb-10">
                  {isHistoryView ? "Non ci sono ticket risolti nel tuo storico." : "Non ci sono ticket di manutenzione assegnati a te al momento."}
                </p>
                <Link
                  href={isHistoryView ? "/dashboard/maintenance" : "/dashboard/maintenance?view=history"}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-slate-200"
                >
                  <ScrollText size={14} />
                  {isHistoryView ? "Torna ai ticket aperti" : "Vedi Storico"}
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-bottom">
        <Link
          href="/dashboard/maintenance"
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 ${!isHistoryView ? "text-violet-600" : "text-slate-400 hover:text-slate-700"}`}
        >
          <Wrench size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Aperti</span>
        </Link>
        <Link
          href="/dashboard/maintenance?view=history"
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 ${isHistoryView ? "text-violet-600" : "text-slate-400 hover:text-slate-700"}`}
        >
          <ScrollText size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Storico</span>
        </Link>
        <form action={logoutAction} className="flex flex-1">
          <button type="submit" className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:text-rose-500">
            <LogOut size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Esci</span>
          </button>
        </form>
      </nav>
    </main>
    <PushPermissionRequest />
    </>
  );
}

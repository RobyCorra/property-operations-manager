import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/src/app/actions/auth";
import { updateMaintenanceStatus, createTicketMessage } from "@/src/app/actions/operational";
import StatusUpdateButton from "@/src/components/status-update-button";
import { prisma } from "@/src/lib/prisma";
import SafeDate from "@/src/components/safe-date";
import MaintenanceResolutionForm from "@/src/components/maintenance-resolution-form";
import TicketConversation from "@/src/components/ticket-conversation";
import AIAssistant from "@/src/components/ai-assistant";
import AccessInstructionsCard from "@/src/components/access-instructions-card";
import ExpandableMaintenanceCard from "@/src/components/expandable-maintenance-card";
import {
  LogOut, 
  Navigation, 
  CalendarDays, 
  MessageSquare, 
  CircleCheck
} from "@/src/components/icons";
import { ScrollText } from "lucide-react";

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
  messages: {
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
        where: { status: { in: isHistoryView ? ["RESOLVED"] : ["OPEN", "IN_PROGRESS"] } },
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

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">
                Ciao, {user.name} <span className="text-violet-600">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium tracking-normal">
              {isHistoryView ? "Consulta i ticket risolti assegnati a te" : "Ecco i guasti aperti assegnati a te"}
            </p>
          </div>
          <div className="flex items-center gap-4">
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

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="flex items-center gap-3 flex-1">
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase">
                {isHistoryView ? "Storico Ticket" : "Ticket Aperti"}
              </h2>
              <div className="h-px flex-1 bg-slate-200/50"></div>
            </div>
            {isHistoryView && (
              <Link
                href="/dashboard/maintenance"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
              >
                Torna alla dashboard
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-10">
            {user.maintenanceTickets.map((ticket: MaintenanceTicketView) => {
              const ticketAttachments = linkedAttachments({ attachments: ticket.attachments, messages: ticket.messages });

              return (
                <ExpandableMaintenanceCard
                  key={ticket.id}
                  className="space-y-5 rounded-[2.5rem] border border-white/60 bg-white/55 p-5 shadow-2xl shadow-black/5 backdrop-blur-xl lg:p-7"
                  headerMain={(
                    <div className="min-w-0 space-y-3">
                      <h3 className="truncate text-2xl font-semibold uppercase tracking-tight text-slate-900">{ticket.title}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {ticket.apartment.name} <span className="mx-2 text-slate-300">/</span> {ticket.apartment.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${priorityColors[ticket.priority] || "bg-slate-100 text-slate-500"}`}>
                          {ticket.priority}
                        </span>
                        <div className="flex items-center gap-2 rounded-full bg-slate-100/70 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <div className={`h-1.5 w-1.5 rounded-full ${ticket.status === "IN_PROGRESS" ? "bg-orange-500 animate-pulse" : "bg-slate-300"}`} />
                          {ticket.status}
                        </div>
                      </div>
                    </div>
                  )}
                  headerMeta={(
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      {ticket.scheduledStart ? (
                        <div className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-white shadow-lg shadow-slate-200">
                          <CalendarDays size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                            <SafeDate date={ticket.scheduledStart} format={{ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }} />
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-full bg-slate-100 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Non pianificato
                        </div>
                      )}
                    </div>
                  )}
                  expandedContent={(
                    <>
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Azione</p>
                          {!isHistoryView && ticket.status === "OPEN" && (
                            <StatusUpdateButton
                              id={ticket.id}
                              nextStatus="IN_PROGRESS"
                              label="Avvia Intervento"
                              action={updateMaintenanceStatus}
                              className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-black uppercase tracking-widest py-5 rounded-full transition-all duration-300 shadow-xl shadow-violet-200 hover:shadow-2xl hover:scale-[1.03] active:scale-95"
                            />
                          )}
                          {!isHistoryView && ticket.status === "IN_PROGRESS" && (
                            <MaintenanceResolutionForm ticketId={ticket.id} />
                          )}
                          {(isHistoryView || ticket.status === "RESOLVED") && (
                            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-700">
                              Ticket risolto
                            </div>
                          )}
                          <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <CalendarDays size={14} />
                              Programmazione Intervento
                            </div>
                            {ticket.scheduledStart ? (
                              <div className="flex flex-wrap gap-2 text-sm font-bold text-slate-900">
                                <SafeDate date={ticket.scheduledStart} format={{ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }} />
                                {ticket.scheduledEnd && (
                                  <>
                                    <span className="text-slate-300">→</span>
                                    <SafeDate date={ticket.scheduledEnd} format={{ hour: "2-digit", minute: "2-digit" }} />
                                  </>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs font-medium uppercase tracking-tight text-slate-400">Intervento non ancora pianificato.</p>
                            )}
                            {(ticket.startedAt || ticket.resolvedAt) && (
                              <div className="space-y-1 pt-2 text-xs font-bold text-slate-600">
                                {ticket.startedAt && <p>Inizio: <SafeDate date={ticket.startedAt} format={{ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }} /></p>}
                                {ticket.resolvedAt && <p>Chiusura: <SafeDate date={ticket.resolvedAt} format={{ day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }} /></p>}
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

                      <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-lg">🛠️</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intervento</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Problema riconosciuto</p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{ticket.title}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Descrizione / note intervento</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                              {ticket.description || "Nessuna descrizione inserita."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
                        <div className={`${isHistoryView ? "lg:col-span-2" : ""} rounded-3xl border border-slate-100 bg-white/70 p-4 shadow-sm`}>
                          <div className="mb-3 flex items-center gap-2">
                            <MessageSquare size={16} className="text-violet-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chat</p>
                          </div>
                          <TicketConversation
                            entityId={ticket.id}
                            initialMessages={ticket.messages}
                            currentUserRole="MAINTENANCE"
                            currentUserName={user.name}
                            submitAction={createTicketMessage}
                            heightClass="h-[380px]"
                          />
                        </div>
                      </div>

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
    </main>
  );
}

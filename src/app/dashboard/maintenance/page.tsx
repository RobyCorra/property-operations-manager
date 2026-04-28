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
import {
  LogOut, 
  Navigation, 
  KeyRound, 
  CalendarDays, 
  MessageSquare, 
  CircleCheck,
  Info,
  Clock
} from "@/src/components/icons";
import { ScrollText } from "lucide-react";


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
            {user.maintenanceTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
                {/* Left side: Ticket info */}
                <div className="w-full lg:w-1/2 p-10 flex flex-col overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200/40">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${priorityColors[ticket.priority] || "bg-slate-100 text-slate-500"}`}>
                      {ticket.priority}
                    </span>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100/50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'IN_PROGRESS' ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`} />
                        {ticket.status}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase mb-1">{ticket.title}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-8">{ticket.apartment.name} <span className="mx-2 text-slate-300">/</span> {ticket.apartment.address}</p>
                  
                  {/* Access Instructions Block */}
                  {ticket.apartment.accessInstructions ? (
                    <div className="bg-violet-500/5 border border-violet-500/10 p-5 rounded-3xl flex gap-5 mb-6">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-violet-500/10 text-violet-600 shadow-sm">
                        <KeyRound size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1">Istruzioni Accesso</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {ticket.apartment.accessInstructions}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-[2rem] text-xs text-slate-400 font-medium uppercase tracking-tight mb-6">
                      Accedere con le istruzioni standard o contattare il manager.
                    </div>
                  )}

                  {/* Scheduled Intervention Block */}
                  {ticket.scheduledStart ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl flex gap-5 mb-6">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/10 text-emerald-600 shadow-sm">
                        <CalendarDays size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Programmazione Intervento</p>
                        <div className="text-sm text-slate-900 font-bold leading-tight flex flex-wrap gap-2">
                          <SafeDate date={ticket.scheduledStart} format={{ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }} />
                          {ticket.scheduledEnd && (
                            <>
                              <span className="text-slate-300">→</span>
                              <SafeDate date={ticket.scheduledEnd} format={{ hour: '2-digit', minute: '2-digit' }} />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-[2rem] text-xs text-slate-400 font-medium uppercase tracking-tight mb-6">
                      Intervento non ancora pianificato.
                    </div>
                  )}

                  {(ticket.startedAt || ticket.resolvedAt) && (
                    <div className="bg-white/60 border border-slate-200/50 p-5 rounded-3xl flex gap-5 mb-6 shadow-sm">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 text-slate-500 shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempi Intervento</p>
                        {ticket.startedAt && (
                          <p className="text-xs text-slate-700 font-bold">
                            Inizio: <SafeDate date={ticket.startedAt} format={{ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }} />
                          </p>
                        )}
                        {ticket.resolvedAt && (
                          <p className="text-xs text-slate-700 font-bold">
                            Chiusura: <SafeDate date={ticket.resolvedAt} format={{ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }} />
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {ticket.description && (
                    <div className="bg-white/60 p-5 rounded-3xl text-sm text-slate-600 mb-8 border border-slate-200/50 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                          <Info size={14} className="text-slate-400" />
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dettaglio Segnalazione</p>
                      </div>
                      <p className="leading-relaxed font-medium italic">"{ticket.description}"</p>
                    </div>
                  )}

                  <div className="mt-auto pt-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={12} />
                          <p className="text-[10px] font-bold uppercase tracking-widest pt-0.5">
                            Aprile <SafeDate date={ticket.createdAt} format={{ day: 'numeric', year: 'numeric' }} />
                          </p>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${ticket.apartment.latitude},${ticket.apartment.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 hover:text-violet-600 transition-colors"
                      >
                        <Navigation size={14} />
                        Percorso
                      </a>
                    </div>
                    
                    {!isHistoryView && (
                      <div className="flex gap-2">
                        {ticket.status === "OPEN" && (
                          <StatusUpdateButton 
                            id={ticket.id} 
                            nextStatus="IN_PROGRESS" 
                            label="Avvia Intervento" 
                            action={updateMaintenanceStatus}
                            className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-black uppercase tracking-widest py-5 rounded-full transition-all duration-300 shadow-xl shadow-violet-200 hover:shadow-2xl hover:scale-[1.03] active:scale-95" 
                          />
                        )}
                        {ticket.status === "IN_PROGRESS" && (
                          <MaintenanceResolutionForm ticketId={ticket.id} />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Conversation Box */}
                <div className="w-full lg:w-1/2 flex flex-col overflow-hidden bg-slate-50/30">
                  <div className="px-6 py-4 border-b border-slate-200/40 flex items-center gap-3">
                    <MessageSquare size={16} className="text-violet-600" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comunicazioni Dirette</p>
                  </div>
                  <div className="flex-1 p-6 overflow-hidden flex flex-col">
                    <TicketConversation 
                      entityId={ticket.id}
                      initialMessages={ticket.messages}
                      currentUserRole="MAINTENANCE"
                      currentUserName={user.name}
                      submitAction={createTicketMessage}
                    />
                  </div>
                </div>
                {!isHistoryView && (
                  <div className="w-full p-6 border-t border-slate-200/40 bg-white/30">
                    <AIAssistant
                      role="MAINTENANCE"
                      type="maintenance"
                      apartmentId={ticket.apartmentId}
                      maintenanceTicketId={ticket.id}
                      initialMessages={ticket.aiAssistantMessages}
                    />
                  </div>
                )}
              </div>
            ))}

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

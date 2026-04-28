import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/src/app/actions/auth";
import { updateCleaningStatus } from "@/src/app/actions/operational";
import { prisma } from "@/src/lib/prisma";
import StatusUpdateButton from "@/src/components/status-update-button";
import ChecklistInteractive from "@/src/components/checklist-interactive";
import TicketConversation from "@/src/components/ticket-conversation";
import AIAssistant from "@/src/components/ai-assistant";
import SafeDate from "@/src/components/safe-date";
import { createCleaningTaskMessage, enrichCleaningTasksWithNextBooking, computeChecklistSnapshot } from "@/src/app/actions/operational";
import {
  LogOut, 
  Navigation, 
  KeyRound, 
  DoorOpen, 
  Paintbrush, 
  CircleCheck, 
  CalendarDays, 
  MessageSquare
} from "@/src/components/icons";
import { ScrollText, Sparkles, ClipboardList } from "lucide-react";

export default async function CleanerDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (role !== "CLEANER" || !userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      cleaningTasks: {
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
        include: { 
          apartment: true,
          booking: true,    // Triggering checkout booking
          messages: {
            orderBy: { createdAt: "asc" },
            include: { attachment: true }
          },
          aiAssistantMessages: {
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Enrich tasks with next booking dynamically
  const enrichedTasks = await enrichCleaningTasksWithNextBooking(user.cleaningTasks);

  const tasksWithChecklists = await Promise.all(enrichedTasks.map(async (task) => {
    const computedSnapshot = await computeChecklistSnapshot(prisma, task.apartmentId, task.date, task.bookingId);
    
    const checklistItems = Array.isArray(task.checklistProgress) && task.checklistProgress.length > 0
      ? task.checklistProgress
      : computedSnapshot;

    return { ...task, checklistItems };
  }));

  const serverDate = new Date().toISOString();

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">
                Ciao, {user.name} <span className="text-violet-600">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium tracking-normal">Ecco i tuoi interventi di pulizia in programma</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/history"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
            >
              <ScrollText size={14} />
              Mio Storico
            </Link>
            <form action={logoutAction}>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase">Interventi Assegnati</h2>
            <div className="h-px flex-1 bg-slate-200/50"></div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {tasksWithChecklists.map((task) => {
              const checklist = task.checklistItems;
              const allRequiredDone = checklist.length === 0 || checklist.filter((i: any) => i.required).every((i: any) => i.completed);

              return (
                <div key={task.id} className={`bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-2xl transition-all duration-500 overflow-hidden ${
                  task.status === "IN_PROGRESS" 
                    ? 'ring-2 ring-violet-500/30 p-10 shadow-violet-500/5' 
                    : 'p-8 shadow-black/5'
                }`}>
                  <div className={`flex flex-col lg:flex-row lg:items-start justify-between gap-10 ${
                    task.status === "IN_PROGRESS" ? 'pb-10 border-b border-slate-200/50 border-dashed mb-8' : ''
                  }`}>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                            task.status === "IN_PROGRESS" 
                                ? 'bg-violet-500 text-white shadow-lg shadow-violet-200' 
                                : 'bg-slate-100 text-slate-500'
                        }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${task.status === "IN_PROGRESS" ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
                           {task.status === "IN_PROGRESS" ? "Operativo" : "In Attesa"}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ID: {task.id.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className={`${task.status === "IN_PROGRESS" ? 'text-4xl' : 'text-2xl'} font-semibold text-slate-900 tracking-tight transition-all uppercase`}>
                        {task.apartment.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">{task.apartment.address}</p>
                      
                      <div className="mt-6 flex flex-wrap gap-3">
                         <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                             <Paintbrush size={14} className="text-violet-600" />
                             <p className="text-[10px] font-black uppercase tracking-tight text-slate-600">
                                Prevista: <SafeDate date={task.date} serverDate={serverDate} isExplicit={true} />
                             </p>
                         </div>
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${task.apartment.latitude},${task.apartment.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Navigation size={14} className="text-violet-600" />
                          Percorso
                        </a>
                      </div>

                      {/* Access Instructions Block */}
                      {task.apartment.accessInstructions ? (
                        <div className="mt-8 bg-violet-500/5 border border-violet-500/10 p-6 rounded-3xl flex gap-5">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-violet-500/10 text-violet-600">
                            <KeyRound size={22} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1.5">Istruzioni Accesso</p>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                              {task.apartment.accessInstructions}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-8 bg-slate-50 border border-slate-100 p-5 rounded-3xl text-xs text-slate-500 font-medium uppercase tracking-tight">
                          Accedere con le istruzioni standard o contattare il manager.
                        </div>
                      )}

                      {/* Booking Context Section */}
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Outgoing Context (Checkout) */}
                        <div className="bg-rose-50/50 border border-rose-100/50 p-4 rounded-[2rem] flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-rose-100 text-rose-500 shadow-sm">
                               <DoorOpen size={20} />
                           </div>
                           <div className="min-w-0">
                                <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.1em] mb-1">In Uscita</p>
                                {task.booking ? (
                                    <div className="truncate">
                                        <span className="text-xs font-bold text-slate-900 truncate block">{task.booking.guestName}</span>
                                        <span className="text-[10px] text-slate-500 font-medium block">
                                            Out: <SafeDate date={task.booking.checkOutDate} serverDate={serverDate} format={{ day: 'numeric', month: 'short' }} />
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-rose-800 font-bold uppercase tracking-tight">Evento Manuale</p>
                                )}
                           </div>
                        </div>

                        {/* Incoming Context (Preparation) */}
                        <div className={`p-4 rounded-[2rem] border flex items-center gap-4 ${task.nextBooking ? 'bg-emerald-50/50 border-emerald-100/50' : 'bg-slate-50 border-slate-100'}`}>
                           <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center border shadow-sm ${task.nextBooking ? 'border-emerald-100 text-emerald-500' : 'border-slate-100 text-slate-400'}`}>
                               <Paintbrush size={20} />
                           </div>
                           <div className="min-w-0">
                                <p className={`text-[9px] font-black uppercase tracking-[0.1em] mb-1 ${task.nextBooking ? 'text-emerald-600' : 'text-slate-400'}`}>In Arrivo</p>
                                {task.nextBooking ? (
                                    <div className="truncate">
                                        <span className="text-xs font-bold text-slate-900 truncate block">{task.nextBooking.guestName} ({task.nextBooking.totalGuests} osp)</span>
                                        <span className="text-[10px] text-slate-500 font-medium block">
                                            In: <SafeDate date={task.nextBooking.checkInDate} serverDate={serverDate} format={{ day: 'numeric', month: 'short' }} />
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Nessun Arrivo</p>
                                )}
                           </div>
                        </div>
                      </div>

                      {task.notes && (
                        <div className="mt-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm text-slate-700 flex gap-4">
                          <MessageSquare size={18} className="text-slate-400 shrink-0" /> 
                          <span className="font-medium leading-relaxed italic">"{task.notes}"</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-4 shrink-0">
                      <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-200">
                        <CalendarDays size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                           <SafeDate date={task.date} serverDate={serverDate} format={{ day: 'numeric', month: 'long' }} />
                        </span>
                      </div>
                      <div className="w-full">
                        {task.status === "PENDING" && (
                          <StatusUpdateButton 
                            id={task.id} 
                            nextStatus="IN_PROGRESS" 
                            label="Avvia Intervento" 
                            action={updateCleaningStatus}
                            className="w-full lg:w-auto px-10 py-5 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-xl shadow-violet-200 hover:shadow-2xl hover:scale-[1.03] active:scale-95" 
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Section: Checklist (only when in progress) and Chat (always) */}
                  <div className="mt-10 pt-10 border-t border-slate-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                      {/* Left side: Checklist (Visible only when in progress) */}
                      <div>
                        {task.status === "IN_PROGRESS" ? (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2 pl-1">
                                <ClipboardList size={18} className="text-violet-600" />
                                <h4 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">Checklist Qualità</h4>
                            </div>
                            <ChecklistInteractive 
                                taskId={task.id}
                                initialItems={checklist}
                            />
                          </div>
                        ) : (
                          <div className="bg-slate-50/50 rounded-[2rem] p-10 border border-slate-100 border-dashed text-center">
                            <Sparkles size={40} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Pronto per iniziare?</p>
                            <p className="text-sm text-slate-500 font-medium mt-2">Avvia l'intervento per visualizzare la checklist dedicata.</p>
                          </div>
                        )}
                      </div>

                      {/* Right side: Chat (Always visible) */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2 pl-1">
                           <MessageSquare size={18} className="text-violet-600" />
                           <h4 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">Comunicazioni</h4>
                        </div>
                        <TicketConversation 
                          entityId={task.id}
                          initialMessages={task.messages}
                          currentUserRole="CLEANER"
                          currentUserName={user.name}
                          submitAction={createCleaningTaskMessage}
                        />
                      </div>
                    </div>
                    <AIAssistant
                      role="CLEANER"
                      type="cleaning"
                      apartmentId={task.apartmentId}
                      cleaningTaskId={task.id}
                      initialMessages={task.aiAssistantMessages}
                    />
                  </div>
                </div>
              );
            })}

            {enrichedTasks.length === 0 && (
              <div className="bg-white/40 backdrop-blur-xl p-20 rounded-[3rem] border border-slate-200 border-dashed text-center">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100">
                  <Sparkles size={48} className="text-violet-500" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase uppercase">Tutto Sotto Controllo</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium tracking-normal mb-10">Non ci sono interventi di pulizia assegnati a te al momento.</p>
                <Link 
                    href="/dashboard/history"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-xl shadow-slate-200"
                >
                    <ScrollText size={14} />
                    Vedi Storico
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

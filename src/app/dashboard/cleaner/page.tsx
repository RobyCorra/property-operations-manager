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
import AccessInstructionsCard from "@/src/components/access-instructions-card";
import ExpandableCleaningCard from "@/src/components/expandable-cleaning-card";
import RecalculateCleaningChecklistButton from "@/src/components/recalculate-cleaning-checklist-button";
import { createCleaningTaskMessage, enrichCleaningTasksWithNextBooking, computeChecklistSnapshot } from "@/src/app/actions/operational";
import { formatRomeDateDisplay, formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import {
  LogOut,
  Navigation,
  Paintbrush,
  CalendarDays,
  MessageSquare
} from "@/src/components/icons";
import { ScrollText, Sparkles, ClipboardList } from "lucide-react";
import CleaningCorrectionPanel, { type CorrectionItem } from "@/src/components/cleaning-correction-panel";

const cleaningStatusLabel: Record<string, string> = {
  PENDING: "In Attesa",
  IN_PROGRESS: "In Corso",
  COMPLETED: "Completato",
};

type CleanerTaskNextBooking = {
  guestName: string | null;
  totalGuests: number;
  checkInDate: Date;
};

type CleanerTaskChecklistItem = {
  id: string;
  label: string;
  type: string;
  value: number | null;
  required: boolean;
  completed: boolean;
  formula?: string | null;
};

type CleanerDashboardTask = {
  id: string;
  apartmentId: string;
  date: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  bookingId: string | null;
  checklistProgress: unknown;
  correctionProgress: unknown;
  nextBooking: CleanerTaskNextBooking | null;
  apartment: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    accessInstructions: string | null;
  };
  status: string;
  notes: string | null;
  booking: {
    guestName: string | null;
    checkOutDate: Date;
    totalGuests?: number | null;
  } | null;
  aiAssistantMessages: {
    createdAt: Date;
    role: "USER" | "ASSISTANT";
    userRole: string;
    content: string;
  }[];
  messages: {
    createdAt: Date;
    role: string;
    senderName: string;
    text: string | null;
    attachment?: unknown;
  }[];
};

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
          booking: true,
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

  const enrichedTasks = await enrichCleaningTasksWithNextBooking(user.cleaningTasks) as CleanerDashboardTask[];

  const tasksWithChecklists = await Promise.all(enrichedTasks.map(async (task: CleanerDashboardTask) => {
    const computedSnapshot = await computeChecklistSnapshot(prisma, task.apartmentId, task.date, task.bookingId);

    const checklistItems = Array.isArray(task.checklistProgress) && task.checklistProgress.length > 0
      ? task.checklistProgress as CleanerTaskChecklistItem[]
      : computedSnapshot;

    return { ...task, checklistItems };
  }));

  const serverDate = new Date().toISOString();

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 pb-28 font-sans text-slate-900 lg:p-10 lg:pb-10">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">
              Ciao, {user.name} <span className="text-violet-600">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium tracking-normal">Ecco i tuoi interventi di pulizia in programma</p>
          </div>
          {/* Desktop-only nav buttons */}
          <div className="hidden md:flex items-center gap-4">
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

        {/* Tasks */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase">Interventi Assegnati</h2>
            <div className="h-px flex-1 bg-slate-200/50"></div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {tasksWithChecklists.map((task) => {
              const checklist = task.checklistItems;
              const correctionItems = Array.isArray(task.correctionProgress) && task.correctionProgress.length > 0
                ? task.correctionProgress as CorrectionItem[]
                : [];
              const hasCorrections = correctionItems.length > 0 && task.status === "IN_PROGRESS";

              return (
                <div key={task.id} className="space-y-4">
                {/* Pannello correzioni supervisor */}
                {hasCorrections && (
                  <CleaningCorrectionPanel
                    cleaningTaskId={task.id}
                    initialItems={correctionItems}
                  />
                )}
                <ExpandableCleaningCard
                  className={`space-y-5 rounded-[2.5rem] border border-white/60 bg-white/55 p-5 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all duration-500 lg:p-7 ${task.status === "IN_PROGRESS" ? "ring-2 ring-violet-500/30 shadow-violet-500/5" : ""}`}
                  headerMain={(
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${task.status === "IN_PROGRESS" ? "bg-violet-500 text-white shadow-lg shadow-violet-200" : "bg-slate-100 text-slate-500"}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${task.status === "IN_PROGRESS" ? "bg-white animate-pulse" : "bg-slate-400"}`} />
                          {cleaningStatusLabel[task.status] ?? task.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-semibold uppercase tracking-tight text-slate-900 line-clamp-1">{task.apartment.name}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500 truncate">{task.apartment.address}</p>
                      {/* Date shown inline on mobile */}
                      <div className="mt-3 flex items-center gap-2 lg:hidden">
                        <CalendarDays size={13} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{formatRomeDateDisplay(task.date)}</span>
                      </div>
                    </div>
                  )}
                  headerMeta={(
                    /* Date pill — desktop only */
                    <div className="hidden lg:flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-white shadow-lg shadow-slate-200">
                      <CalendarDays size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                        {formatRomeDateDisplay(task.date)}
                      </span>
                    </div>
                  )}
                  actionRow={(
                    task.status === "PENDING" ? (
                      <StatusUpdateButton
                        id={task.id}
                        nextStatus="IN_PROGRESS"
                        label="▶  Avvia Intervento"
                        action={updateCleaningStatus}
                        className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-black uppercase tracking-widest py-4 rounded-full transition-all duration-300 shadow-xl shadow-violet-200 hover:shadow-2xl hover:scale-[1.03] active:scale-95"
                      />
                    ) : (
                      <div className="w-full rounded-full bg-violet-50 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-violet-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse mr-2 align-middle" />
                        Intervento in corso
                      </div>
                    )
                  )}
                  compactContent={(
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {/* Tempi */}
                      <div className="h-full rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <Paintbrush size={14} className="text-violet-600" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tempi intervento</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900 mb-4">
                          {formatRomeDateTimeDisplay(task.date)}
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-emerald-50 p-4">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">Inizio reale</p>
                            <p className="text-sm font-bold text-slate-900">
                              {task.startedAt ? formatRomeDateTimeDisplay(task.startedAt) : "Non avviato"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-blue-50 p-4">
                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-700">Fine reale</p>
                            <p className="text-sm font-bold text-slate-900">
                              {task.completedAt ? formatRomeDateTimeDisplay(task.completedAt) : "Non completato"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <AccessInstructionsCard accessInstructions={task.apartment.accessInstructions} />

                      {/* Intervento */}
                      <div className="h-full rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-lg">🧹</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intervento</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">Pulizia per check-in</p>
                        {task.notes && (
                          <div className="mt-3 flex gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                            <MessageSquare size={14} className="shrink-0 text-slate-400" />
                            <span className="line-clamp-2 font-medium italic">"{task.notes}"</span>
                          </div>
                        )}
                      </div>

                      {/* Logistica */}
                      <div className="h-full rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logistica</p>
                        </div>
                        <div className="space-y-3">
                          {task.booking ? (
                            <p className="text-sm font-bold text-slate-900">
                              <span className="text-rose-500">Uscita:</span> {task.booking.guestName}
                              <span className="ml-2 text-[10px] font-medium text-slate-500">
                                Out: <SafeDate date={task.booking.checkOutDate} serverDate={serverDate} format={{ day: "numeric", month: "short" }} />
                              </span>
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-slate-900"><span className="text-rose-500">Uscita:</span> Evento manuale</p>
                          )}
                          {task.nextBooking ? (
                            <p className="text-sm font-bold text-slate-900">
                              <span className="text-emerald-600">Arrivo:</span> {task.nextBooking.guestName} ({task.nextBooking.totalGuests} osp)
                              <span className="ml-2 text-[10px] font-medium text-slate-500">
                                In: <SafeDate date={task.nextBooking.checkInDate} serverDate={serverDate} format={{ day: "numeric", month: "short" }} />
                              </span>
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-slate-500"><span className="text-slate-400">Arrivo:</span> Nessun arrivo</p>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${task.apartment.latitude},${task.apartment.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-700"
                          >
                            <Navigation size={14} />
                            Apri percorso
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  expandedContent={(
                    <div className="space-y-5">
                      <div className="rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <ClipboardList size={18} className="text-violet-600" />
                            <h4 className="text-sm font-semibold uppercase tracking-tight text-slate-900">Checklist Qualità</h4>
                          </div>
                          {task.status === "IN_PROGRESS" && (
                            <RecalculateCleaningChecklistButton taskId={task.id} />
                          )}
                        </div>
                        {task.status === "IN_PROGRESS" ? (
                          <ChecklistInteractive
                            key={JSON.stringify(checklist)}
                            taskId={task.id}
                            initialItems={checklist}
                          />
                        ) : (
                          <p className="rounded-2xl border border-slate-100 border-dashed bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-500">
                            Avvia intervento per vedere checklist
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <AIAssistant
                          role="CLEANER"
                          type="cleaning"
                          apartmentId={task.apartmentId}
                          cleaningTaskId={task.id}
                          initialMessages={task.aiAssistantMessages}
                          compact
                        />
                        <div className="rounded-3xl border border-slate-100 bg-white/70 p-4 shadow-sm">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-lg">💬</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chat</p>
                          </div>
                          <TicketConversation
                            entityId={task.id}
                            initialMessages={task.messages}
                            currentUserRole="CLEANER"
                            currentUserName={user.name}
                            submitAction={createCleaningTaskMessage}
                            heightClass="h-[380px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                />
                </div>
              );
            })}

            {enrichedTasks.length === 0 && (
              <div className="bg-white/40 backdrop-blur-xl p-20 rounded-[3rem] border border-slate-200 border-dashed text-center">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100">
                  <Sparkles size={48} className="text-violet-500" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase">Tutto Sotto Controllo</h3>
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

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden">
        <Link
          href="/dashboard/cleaner"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-violet-600"
        >
          <ClipboardList size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Tasks</span>
        </Link>
        <Link
          href="/dashboard/history"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:text-slate-700"
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
  );
}

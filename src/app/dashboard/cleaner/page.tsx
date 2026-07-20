import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/src/app/actions/auth";
import { prisma } from "@/src/lib/prisma";
import ExpandableCleaningCard from "@/src/components/expandable-cleaning-card";
import CleanerStartButton from "@/src/components/cleaner-start-button";
import CleanerContinueButton from "@/src/components/cleaner-continue-button";
import CleanerLangGate from "@/src/components/cleaner-lang-gate";
import LangSwitchPill from "@/src/components/lang-switch-pill";
import { CleanerGreeting, CleanerSectionTitle, DetailsChatLabel } from "@/src/components/cleaner-dashboard-header";
import CleanerStatusBadge from "@/src/components/cleaner-status-badge";
import CleanerActionBanner from "@/src/components/cleaner-action-banner";
import { enrichCleaningTasksWithNextBooking, computeChecklistSnapshot } from "@/src/app/actions/operational";
import { formatRomeDateDisplay, formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import LocationTracker from "@/src/components/location-tracker";
import PhotoQueueUploader from "@/src/components/photo-queue-uploader";
import { calculateLinen } from "@/src/lib/linen-calculator";
import PushPermissionRequest from "@/src/components/push-permission";
import ApnsRegister from "@/src/components/apns-register";
import { LogOut, CalendarDays, MapPin } from "@/src/components/icons";
import { ScrollText, Sparkles, ClipboardList } from "lucide-react";
import CleaningCorrectionPanel, { type CorrectionItem } from "@/src/components/cleaning-correction-panel";
import CleanerLinenSection from "@/src/components/cleaner-linen-section";

type CleanerTaskNextBooking = {
  guestName: string | null;
  totalGuests: number;
  checkInDate: Date;
  cullaRequested?: boolean | null;
};

type CleanerTaskChecklistItem = {
  id: string;
  label: string;
  labelTranslations?: Record<string, string> | null;
  type: string;
  value: number | null;
  required: boolean;
  photoRequired: boolean;
  completed: boolean;
  formula?: string | null;
  photoUrl?: string | null;
  skipped?: boolean;
  phase?: string;
  answerType?: string;
  answer?: string | null;
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
  totalGuests: number | null;
  nextBooking: CleanerTaskNextBooking | null;
  apartment: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    bathrooms: number;
    accessInstructions: string | null;
    bedConfig: unknown;
  };
  status: string;
  notes: string | null;
  booking: {
    guestName: string | null;
    checkOutDate: Date;
    totalGuests?: number | null;
    cullaRequested?: boolean | null;
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
        where: { status: { in: ["PENDING", "IN_PROGRESS", "COMPLETED", "AWAITING_REVIEW"] } },
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
    const computedSnapshot = await computeChecklistSnapshot(prisma, task.apartmentId, task.date, task.bookingId) as CleanerTaskChecklistItem[];

    // Usa sempre lo snapshot fresco (photoRequired, label, type aggiornati dal master).
    // Preserva solo i dati di progresso (completed, photoUrl, skipped, value) dal snapshot salvato.
    const oldProgress = Array.isArray(task.checklistProgress) ? task.checklistProgress as CleanerTaskChecklistItem[] : [];
    const progressById = new Map(oldProgress.filter(i => i.id).map(i => [i.id, i]));

    const checklistItems = computedSnapshot.map(newItem => {
      const old = progressById.get(newItem.id);
      return {
        ...newItem,                              // metadati freschi: photoRequired, label, type, required
        completed: old?.completed ?? false,
        photoUrl:  old?.photoUrl  ?? null,
        skipped:   old?.skipped   ?? false,
        value:     old?.value     ?? newItem.value,
        answer:    old?.answer    ?? null,
      };
    });

    return { ...task, checklistItems };
  }));

  return (
    <CleanerLangGate>
    <LocationTracker />
    <PhotoQueueUploader />
    <main className="min-h-screen bg-[#faf8ff] p-6 pb-28 font-sans text-slate-900 lg:p-10 lg:pb-10">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3">
              <LangSwitchPill />
            </div>
            <CleanerGreeting name={user.name} />
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
            <CleanerSectionTitle />
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
                  className={`space-y-5 rounded-[2.5rem] border p-5 shadow-xl backdrop-blur-xl transition-all duration-500 lg:p-7 ${
                    (() => {
                      const msgs = (task as any).messages ?? [];
                      const hasUnread = msgs.some((m: any) => m.role === "MANAGER" && !m.readByWorkerAt);
                      if (hasUnread) return "border-rose-400 bg-white/80 ring-2 ring-rose-400/40 shadow-rose-100";
                      if (task.status === "IN_PROGRESS") return "border-violet-200/60 bg-white/80 ring-2 ring-violet-500/20";
                      if (task.status === "APPROVED" || task.status === "COMPLETED") return "border-emerald-200/60 bg-emerald-50/60";
                      return "border-white/60 bg-white/55 shadow-black/5";
                    })()
                  }`}
                  headerMain={(
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <CleanerStatusBadge status={task.status} />
                      </div>
                      <h3 className={`text-2xl font-semibold uppercase tracking-tight line-clamp-1 ${task.status === "APPROVED" || task.status === "COMPLETED" ? "text-emerald-800" : "text-slate-900"}`}>
                        {task.apartment.name}
                      </h3>
                      {/* Indirizzo cliccabile → Google Maps */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.apartment.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <span className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center shrink-0">
                          <MapPin size={11} className="text-indigo-600" />
                        </span>
                        <span className="text-sm font-semibold underline underline-offset-2">{task.apartment.address}</span>
                      </a>
                      {/* Data */}
                      <div className="mt-2 flex items-center gap-2">
                        <CalendarDays size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{formatRomeDateTimeDisplay(task.date)}</span>
                      </div>
                    </div>
                  )}
                  headerMeta={undefined}
                  actionRow={(
                    <div className="flex flex-col gap-2">
                      {task.status === "PENDING" && (
                        <CleanerStartButton taskId={task.id} taskDate={task.date.toISOString()} />
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <CleanerContinueButton taskId={task.id} />
                      )}
                      {["AWAITING_REVIEW", "APPROVED", "COMPLETED"].includes(task.status) && (
                        <CleanerActionBanner status={task.status} />
                      )}
                      {/* Link dettagli/chat sempre visibile */}
                      <Link
                        href={`/dashboard/cleaner/task/${task.id}`}
                        className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                      >
                        <DetailsChatLabel />
                      </Link>
                    </div>
                  )}
                  compactContent={<></>}
                  expandedContent={(
                    <div className="space-y-3">
                      {/* Biancheria & asciugamani (tradotti via LinenSection) */}
                      {(() => {
                        const cullaRequested = !!(task.nextBooking?.cullaRequested);
                        const totalGuests = task.nextBooking?.totalGuests ?? task.totalGuests ?? 0;
                        const linen = totalGuests > 0
                          ? calculateLinen(task.apartment.bedConfig, totalGuests, cullaRequested)
                          : null;
                        return (
                          <CleanerLinenSection
                            towels={totalGuests > 0 ? totalGuests * 2 : null}
                            bathMats={task.apartment.bathrooms}
                            nextGuestCount={totalGuests > 0 ? totalGuests : null}
                            linen={linen?.adults ?? null}
                            cullaLinen={linen?.culla ?? null}
                            noBookingText="Nessuna prenotazione in arrivo"
                          />
                        );
                      })()}

                      {/* Accesso appartamento */}
                      {task.apartment.accessInstructions && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2">🔑 Accesso</p>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{task.apartment.accessInstructions}</p>
                        </div>
                      )}

                      {/* Note responsabile */}
                      {task.notes && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2">📝 Note</p>
                          <p className="text-sm text-amber-800 italic leading-relaxed">"{task.notes}"</p>
                        </div>
                      )}
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-bottom">
        <Link
          href="/dashboard/cleaner"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-violet-600"
        >
          <ClipboardList size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Pulizie</span>
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
    <PushPermissionRequest />
    <ApnsRegister />
    </CleanerLangGate>
  );
}

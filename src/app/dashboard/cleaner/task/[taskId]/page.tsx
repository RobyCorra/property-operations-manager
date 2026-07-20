import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import PublicCleaningView from "@/src/components/public-cleaning-view";
import { getCleaningTaskMessages, markCleaningMessagesReadByWorker } from "@/src/app/actions/operational";
import { ChevronLeft } from "lucide-react";

function formatDateFull(date: Date): string {
  const d = new Date(date);
  const weekday = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", weekday: "long" });
  const day     = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", day: "numeric" });
  const month   = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", month: "long" });
  const year    = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", year: "numeric" });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

export default async function CleanerTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const cookieStore = await cookies();
  const role   = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (role !== "CLEANER" || !userId) redirect("/login");

  const { taskId } = await params;

  const [task, userRecord, messages] = await Promise.all([
    prisma.cleaningTask.findFirst({
      where: {
        id: taskId,
        assignedToId: userId,
      },
      include: {
        apartment: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
            checklistItems: {
              orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    getCleaningTaskMessages(taskId),
  ]);

  if (!task) notFound();

  // Marca i messaggi del manager come letti dal worker
  await markCleaningMessagesReadByWorker(taskId);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.apartment.address)}`;
  const dateLabel = formatDateFull(task.date as Date);

  // Build checklist items merging master config with saved progress
  const checklistItems = (() => {
    const master = task.apartment.checklistItems;
    const progress: Record<string, { completed?: boolean; value?: number | null; photoUrl?: string | null; skipped?: boolean; answer?: string | null }> = {};
    if (Array.isArray(task.checklistProgress)) {
      for (const item of task.checklistProgress as { id?: string; completed?: boolean; value?: number | null; photoUrl?: string | null; skipped?: boolean; answer?: string | null }[]) {
        if (item?.id) progress[item.id] = item;
      }
    }
    return master
      // Il questionario d'ingresso viene sempre prima delle task di pulizia
      .slice()
      .sort((a, b) => {
        const rank = (p: string) => (p === "entry" ? 0 : 1);
        return rank(a.phase) - rank(b.phase) || a.order - b.order;
      })
      .map((m) => ({
        id: m.id,
        label: m.label,
        labelTranslations: (m.labelTranslations ?? {}) as Record<string, string>,
        type: m.type,
        required: m.required,
        photoRequired: m.photoRequired,
        phase: m.phase,
        answerType: m.answerType,
        formula: m.formula,
        completed: progress[m.id]?.completed ?? false,
        value: progress[m.id]?.value ?? null,
        photoUrl: progress[m.id]?.photoUrl ?? null,
        skipped: progress[m.id]?.skipped ?? false,
        answer: progress[m.id]?.answer ?? null,
      }));
  })();

  const canStart    = false; // già avviato quando si arriva qui
  const canComplete = task.status === "IN_PROGRESS";
  const isWaiting   = task.status === "AWAITING_REVIEW";
  const isDone      = task.status === "COMPLETED" || task.status === "APPROVED";

  return (
    <div className="relative">
      {/* Back button fisso */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-900/90 backdrop-blur-sm px-4 py-3 flex items-center">
        <Link
          href="/dashboard/cleaner"
          className="flex items-center gap-1.5 text-white/90 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          <ChevronLeft size={14} />
          Dashboard
        </Link>
      </div>
      {/* Offset per il back button */}
      <div className="pt-10">
        <PublicCleaningView
          taskId={task.id}
          apartmentName={task.apartment.name}
          apartmentAddress={task.apartment.address}
          mapsUrl={mapsUrl}
          dateLabel={dateLabel}
          notes={(task.notes as string | null) ?? null}
          checklistItems={checklistItems}
          canStart={canStart}
          canComplete={canComplete}
          isWaiting={isWaiting}
          isDone={isDone}
          showChat={true}
          initialMessages={messages}
          currentUserRole="CLEANER"
          currentUserName={userRecord?.name ?? "Cleaner"}
        />
      </div>
    </div>
  );
}

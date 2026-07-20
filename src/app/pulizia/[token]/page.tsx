import { notFound } from "next/navigation";
import { getCleaningByToken } from "@/src/app/actions/cleaning-token";
import PublicCleaningView from "@/src/components/public-cleaning-view";
import { enrichCleaningTaskWithNextBooking } from "@/src/app/actions/operational";
import { calculateLinen } from "@/src/lib/linen-calculator";

function formatDateFull(date: Date): string {
  const d = new Date(date);
  const weekday = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", weekday: "long" });
  const day     = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", day: "numeric" });
  const month   = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", month: "long" });
  const year    = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", year: "numeric" });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}

export default async function PublicCleaningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const task = await getCleaningByToken(token);

  if (!task) return notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.apartment.address)}`;
  const dateLabel = formatDateFull(task.date as Date);

  // Prenotazione in ARRIVO — usata per calcolare biancheria e asciugamani
  const { nextBooking } = await enrichCleaningTaskWithNextBooking({
    apartmentId: task.apartment.id,
    date: task.date as Date,
  });

  const nextGuests       = nextBooking?.totalGuests ?? 0;
  const cullaRequested   = !!(nextBooking?.cullaRequested);
  const towels           = nextGuests > 0 ? nextGuests * 2 : null;
  const bathMats         = task.apartment.bathrooms ?? null;
  const linenCalc        = nextGuests > 0
    ? calculateLinen(task.apartment.bedConfig, nextGuests, cullaRequested)
    : null;

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

  const canStart    = task.status === "PENDING";
  const canComplete = task.status === "IN_PROGRESS";
  const isWaiting   = task.status === "AWAITING_REVIEW";
  const isDone      = task.status === "COMPLETED" || task.status === "APPROVED";

  return (
    <PublicCleaningView
      taskId={task.id}
      apartmentName={task.apartment.name}
      apartmentAddress={task.apartment.address}
      mapsUrl={mapsUrl}
      dateLabel={dateLabel}
      notes={task.notes ?? null}
      checklistItems={checklistItems}
      canStart={canStart}
      canComplete={canComplete}
      isWaiting={isWaiting}
      isDone={isDone}
      towels={towels}
      bathMats={bathMats}
      nextGuestCount={nextGuests > 0 ? nextGuests : null}
      linen={linenCalc?.adults ?? null}
      cullaLinen={linenCalc?.culla ?? null}
    />
  );
}

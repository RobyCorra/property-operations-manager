import { notFound } from "next/navigation";
import { getCheckinByToken } from "@/src/app/actions/checkin-token";
import { isCheckinBlockedByCleaning } from "@/src/app/actions/checkin";
import CheckinTaskView from "@/src/components/checkin-task-view";
import CheckinStartButton from "@/src/components/checkin-start-button";
import CleanerLangGate from "@/src/components/cleaner-lang-gate";
import LangSwitchPill from "@/src/components/lang-switch-pill";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

export const revalidate = 0;

// Pagina pubblica del check-in via token — nessun login richiesto,
// stessa logica del link pubblico di pulizie e manutenzioni.
export default async function PublicCheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const task = await getCheckinByToken(token);
  if (!task || task.status === "CANCELLED") notFound();

  const progress = Array.isArray(task.checklistProgress) ? (task.checklistProgress as any[]) : [];
  const items = progress.map((i) => ({
    id: i.id,
    label: i.label,
    labelTranslations: i.labelTranslations ?? null,
    required: !!i.required,
    photoRequired: !!i.photoRequired,
    completed: !!i.completed,
    photoUrl: i.photoUrl ?? null,
  }));

  // Minimizzazione privacy: sul link pubblico mostra solo il nome (no cognome).
  const guestFirstName = task.booking?.guestName?.trim().split(/\s+/)[0] ?? null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.apartment.address)}`;
  const isPendingTask = task.status === "PENDING";
  const cleaningBlocked = isPendingTask
    ? await isCheckinBlockedByCleaning(task.apartmentId, task.date)
    : false;

  return (
    <CleanerLangGate>
    <div className="min-h-screen bg-[#faf8ff]">
      <div className="sticky top-0 z-50 bg-indigo-900/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <p className="text-white/90 text-xs font-black uppercase tracking-widest">🔑 Check-in — {task.apartment.name}</p>
        <LangSwitchPill />
      </div>

      <CheckinTaskView
        taskId={task.id}
        apartmentName={task.apartment.name}
        apartmentAddress={task.apartment.address}
        mapsUrl={mapsUrl}
        dateLabel={formatRomeDateTimeDisplay(task.date)}
        guestName={guestFirstName}
        initialItems={items}
        readOnly={task.status !== "IN_PROGRESS"}
        showChat={false}
        completeRedirect={null}
        isCompleted={task.status === "COMPLETED"}
      />

      {/* Avvio — solo se ancora da fare */}
      {isPendingTask && (
        <div className="max-w-lg mx-auto px-5 pb-8 -mt-2">
          <CheckinStartButton
            taskId={task.id}
            taskDate={task.date.toISOString()}
            cleaningBlocked={cleaningBlocked}
            startRedirect={null}
          />
        </div>
      )}

    </div>
    </CleanerLangGate>
  );
}

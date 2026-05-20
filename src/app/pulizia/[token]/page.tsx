import { notFound } from "next/navigation";
import { getCleaningByToken } from "@/src/app/actions/cleaning-token";
import { formatRomeDateDisplay } from "@/src/lib/rome-datetime";
import ChecklistInteractive from "@/src/components/checklist-interactive";
import PublicStatusButton from "@/src/components/public-status-button";
import PublicStatusPoller from "@/src/components/public-status-poller";
import { Paintbrush, CalendarDays, Navigation } from "@/src/components/icons";
import { Users } from "lucide-react";

const statusLabel: Record<string, string> = {
  PENDING: "In Attesa",
  IN_PROGRESS: "In Corso",
  COMPLETED: "Completata",
  AWAITING_REVIEW: "In Verifica",
  APPROVED: "Approvata",
};

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  AWAITING_REVIEW: "bg-purple-100 text-purple-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
};

export default async function PublicCleaningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const task = await getCleaningByToken(token);

  if (!task) return notFound();

  const checklistItems = (() => {
    const master = task.apartment.checklistItems;
    const progress: Record<string, { completed?: boolean; value?: number | null; photoUrl?: string | null; skipped?: boolean }> = {};
    if (Array.isArray(task.checklistProgress)) {
      for (const item of task.checklistProgress as { id?: string; completed?: boolean; value?: number | null; photoUrl?: string | null; skipped?: boolean }[]) {
        if (item?.id) progress[item.id] = item;
      }
    }
    return master.map((m) => ({
      id: m.id,
      label: m.label,
      type: m.type,
      required: m.required,
      formula: m.formula,
      completed: progress[m.id]?.completed ?? false,
      value: progress[m.id]?.value ?? null,
      photoUrl: progress[m.id]?.photoUrl ?? null,
      skipped: progress[m.id]?.skipped ?? false,
    }));
  })();

  const canStart = task.status === "PENDING";
  const canComplete = task.status === "IN_PROGRESS";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Paintbrush className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{task.apartment.name}</p>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {task.apartment.address}
            </p>
          </div>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[task.status] ?? "bg-slate-100 text-slate-600"}`}>
            {statusLabel[task.status] ?? task.status}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <CalendarDays className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="font-medium">Data pulizia:</span>
            <span>{formatRomeDateDisplay(task.date)}</span>
          </div>

          {task.booking && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Users className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="font-medium">Prossimo arrivo:</span>
              <span>
                {task.booking.guestName ?? "Ospite"} · {task.booking.totalGuests} pers. ·{" "}
                check-in {formatRomeDateDisplay(task.booking.checkInDate)}
              </span>
            </div>
          )}

          {task.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-sm text-amber-800">
              <span className="font-semibold">Note: </span>{task.notes}
            </div>
          )}
        </div>

        {/* Status buttons */}
        {(canStart || canComplete) && (
          <div className="flex gap-3">
            {canStart && (
              <PublicStatusButton
                id={task.id}
                nextStatus="IN_PROGRESS"
                label="▶ Avvia pulizia"
                afterLabel="🟣 Pulizia in corso"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl text-sm transition-colors"
                afterClassName="flex-1 bg-violet-600 text-white font-semibold py-3 rounded-2xl text-sm"
              />
            )}
            {canComplete && (
              <PublicStatusButton
                id={task.id}
                nextStatus="AWAITING_REVIEW"
                label="✓ Completa pulizia"
                afterLabel="⏳ Attendi revisione..."
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-2xl text-sm transition-colors"
              />
            )}
          </div>
        )}

        {/* Banner AWAITING_REVIEW + auto-polling */}
        {task.status === "AWAITING_REVIEW" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 text-center space-y-1">
            <p className="text-amber-800 font-semibold text-sm">⏳ Attendi revisione</p>
            <p className="text-amber-600 text-xs">La pulizia è stata inviata al responsabile. Una volta approvata apparirà il messaggio di conferma.</p>
            <PublicStatusPoller />
          </div>
        )}

        {/* Banner COMPLETED / APPROVED */}
        {(task.status === "COMPLETED" || task.status === "APPROVED") && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-4 text-center space-y-1">
            <p className="text-emerald-800 font-semibold text-sm">✅ Pulizia conclusa — puoi andare</p>
            <p className="text-emerald-600 text-xs">Il responsabile ha approvato la pulizia. Ottimo lavoro!</p>
          </div>
        )}

        {/* Checklist */}
        {checklistItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-800 text-sm">Checklist pulizia</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {checklistItems.filter((i) => i.completed).length} / {checklistItems.length} completate
              </p>
            </div>
            <div className="p-3">
              <ChecklistInteractive taskId={task.id} initialItems={checklistItems} />
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-300 pb-4">
          Property Operations Manager
        </p>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getCleaningByToken } from "@/src/app/actions/cleaning-token";
import ChecklistInteractive from "@/src/components/checklist-interactive";
import PublicStatusButton from "@/src/components/public-status-button";
import PublicStatusPoller from "@/src/components/public-status-poller";

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

  const canStart    = task.status === "PENDING";
  const canComplete = task.status === "IN_PROGRESS";
  const isWaiting   = task.status === "AWAITING_REVIEW";
  const isDone      = task.status === "COMPLETED" || task.status === "APPROVED";

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* ── HEADER viola ── */}
      <header
        className="px-5 pt-8 pb-10 text-white"
        style={{ background: "linear-gradient(145deg, #4338ca, #7c3aed)" }}
      >
        <div className="max-w-lg mx-auto">
          <span className="text-4xl block mb-3">🧹</span>
          <p className="text-2xl font-extrabold leading-tight mb-2">{task.apartment.name}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            📍 {task.apartment.address}
          </a>
        </div>
      </header>

      {/* ── CARDS ── */}
      <div className="max-w-lg mx-auto px-4 -mt-5 flex flex-col gap-3 pb-32">

        {/* Card data — nascosta quando pulizia è IN_PROGRESS */}
        {!canComplete && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-2xl mb-1">📅</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Data pulizia</p>
            <p className="text-lg font-bold text-slate-800">{dateLabel}</p>
          </div>
        )}

        {/* Card note (solo se presenti) */}
        {task.notes && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-2xl mb-1">📝</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Note del responsabile</p>
            <p className="text-base text-slate-700 leading-relaxed">{task.notes}</p>
          </div>
        )}

        {/* ── Banner AWAITING_REVIEW ── */}
        {isWaiting && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="text-amber-800 font-bold text-base mb-1">⏳ Attendi revisione</p>
            <p className="text-amber-600 text-sm leading-relaxed">
              La pulizia è stata inviata al responsabile.<br />
              Una volta approvata apparirà il messaggio di conferma.
            </p>
            <PublicStatusPoller />
          </div>
        )}

        {/* ── Banner APPROVED / COMPLETED ── */}
        {isDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <p className="text-emerald-800 font-bold text-base mb-1">✅ Pulizia conclusa — puoi andare</p>
            <p className="text-emerald-600 text-sm">Il responsabile ha approvato la pulizia. Ottimo lavoro!</p>
          </div>
        )}

        {/* ── Checklist (solo IN_PROGRESS) ── */}
        {canComplete && checklistItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="font-semibold text-slate-800 text-sm">Checklist pulizia</p>
              <p className="text-xs text-slate-400">
                {checklistItems.filter((i) => i.completed).length} / {checklistItems.length}
              </p>
            </div>
            <div className="p-3">
              <ChecklistInteractive taskId={task.id} initialItems={checklistItems} />
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pb-2">Property Operations Manager</p>
      </div>

      {/* ── PULSANTE FISSO IN FONDO — solo PENDING ── */}
      {canStart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-20">
          <div className="max-w-lg mx-auto">
            <PublicStatusButton
              id={task.id}
              nextStatus="IN_PROGRESS"
              label="▶ Avvia pulizia"
              afterLabel="🟣 Pulizia in corso..."
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-green-300 transition-colors"
              afterClassName="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl text-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

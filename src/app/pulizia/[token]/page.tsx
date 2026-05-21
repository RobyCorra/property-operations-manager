import { notFound } from "next/navigation";
import { getCleaningByToken } from "@/src/app/actions/cleaning-token";
import ChecklistInteractive from "@/src/components/checklist-interactive";
import PublicStatusButton from "@/src/components/public-status-button";
import PublicStatusPoller from "@/src/components/public-status-poller";

// Formatta la data per il box in evidenza: "22 Maggio" + "Venerdì 2026"
function formatDateBig(date: Date): { day: string; monthYear: string; weekday: string } {
  const d = new Date(date);
  const day = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", day: "numeric" });
  const month = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", month: "long" });
  const year = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", year: "numeric" });
  const weekday = d.toLocaleDateString("it-IT", { timeZone: "Europe/Rome", weekday: "long" });
  return {
    day,
    monthYear: `${month} ${year}`,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  };
}

export default async function PublicCleaningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const task = await getCleaningByToken(token);

  if (!task) return notFound();

  const dateInfo = formatDateBig(task.date as Date);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.apartment.address)}`;

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
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 text-xl">
            🧹
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-base leading-tight">{task.apartment.name}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 underline underline-offset-2 flex items-center gap-1 mt-0.5"
            >
              📍 {task.apartment.address}
            </a>
          </div>
        </div>
      </header>

      {/* ── CONTENUTO ── */}
      <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-4 pb-32">

        {/* Box data in evidenza */}
        <div className="bg-indigo-600 rounded-2xl px-6 py-6 text-center text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-2">Data pulizia</p>
          <p className="text-4xl font-extrabold leading-none">{dateInfo.day}</p>
          <p className="text-xl font-bold mt-1 capitalize">{dateInfo.monthYear}</p>
          <p className="text-sm opacity-80 mt-1">{dateInfo.weekday}</p>
        </div>

        {/* Note (solo se presenti) */}
        {task.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">📝 Note del responsabile</p>
            <p className="text-sm text-amber-900 leading-relaxed">{task.notes}</p>
          </div>
        )}

        {/* ── Banner stati finali ── */}

        {/* AWAITING_REVIEW */}
        {isWaiting && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-5 text-center">
            <p className="text-amber-800 font-bold text-base mb-1">⏳ Attendi revisione</p>
            <p className="text-amber-600 text-sm leading-relaxed">
              La pulizia è stata inviata al responsabile.<br />
              Una volta approvata apparirà il messaggio di conferma.
            </p>
            <PublicStatusPoller />
          </div>
        )}

        {/* APPROVED / COMPLETED */}
        {isDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-5 text-center">
            <p className="text-emerald-800 font-bold text-base mb-1">✅ Pulizia conclusa — puoi andare</p>
            <p className="text-emerald-600 text-sm">Il responsabile ha approvato la pulizia. Ottimo lavoro!</p>
          </div>
        )}

        {/* ── Checklist (solo IN_PROGRESS) ── */}
        {canComplete && checklistItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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

      {/* ── PULSANTE FISSO IN FONDO ── */}
      {(canStart || canComplete) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-20">
          <div className="max-w-lg mx-auto">
            {canStart && (
              <PublicStatusButton
                id={task.id}
                nextStatus="IN_PROGRESS"
                label="▶ Avvia pulizia"
                afterLabel="🟣 Pulizia in corso..."
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
                afterClassName="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl text-lg"
              />
            )}
            {canComplete && (
              <PublicStatusButton
                id={task.id}
                nextStatus="AWAITING_REVIEW"
                label="✓ Completa pulizia"
                afterLabel="⏳ Invio in corso..."
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

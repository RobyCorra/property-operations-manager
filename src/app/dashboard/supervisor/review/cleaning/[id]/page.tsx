import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import SupervisorReviewForm from "@/src/components/supervisor-review-form";
import { formatRomeDateDisplay, formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import { ArrowLeft, ClipboardList, Home, User, CalendarDays, CheckCircle2, Circle } from "lucide-react";

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
  type?: string;
  value?: number | null;
  required?: boolean;
};

export default async function CleaningReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if ((role !== "SUPERVISOR" && role !== "MANAGER") || !userId) {
    redirect("/login");
  }

  const task = await prisma.cleaningTask.findUnique({
    where: { id },
    include: {
      apartment: { select: { name: true, address: true } },
      assignedTo: { select: { name: true } },
      booking: { select: { guestName: true, checkOutDate: true, totalGuests: true } },
      supervisorReviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { supervisor: { select: { name: true } } },
      },
    },
  });

  if (!task || task.status !== "AWAITING_REVIEW") notFound();

  // SUPERVISOR can only review assigned apartments
  if (role === "SUPERVISOR") {
    const assignment = await prisma.apartmentSupervisor.findUnique({
      where: { apartmentId_userId: { apartmentId: task.apartmentId, userId } },
    });
    if (!assignment) redirect("/dashboard/supervisor");
  }

  const checklist = Array.isArray(task.checklistProgress) ? task.checklistProgress as ChecklistItem[] : [];
  const completedCount = checklist.filter(i => i.completed).length;
  const lastReview = task.supervisorReviews[0];

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 pb-10 font-sans text-slate-900 lg:p-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/supervisor"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-tight text-slate-900">Revisione Pulizia</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{task.apartment.name} · {formatRomeDateDisplay(task.date)}</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg backdrop-blur-xl space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Dettagli Intervento</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <Home size={14} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appartamento</p>
                <p className="text-sm font-semibold text-slate-900">{task.apartment.name}</p>
                <p className="text-xs text-slate-500">{task.apartment.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <CalendarDays size={14} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data</p>
                <p className="text-sm font-semibold text-slate-900">{formatRomeDateDisplay(task.date)}</p>
                {task.startedAt && <p className="text-xs text-slate-500">Inizio: {formatRomeDateTimeDisplay(task.startedAt)}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <User size={14} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cleaner</p>
                <p className="text-sm font-semibold text-slate-900">{task.assignedTo?.name ?? "Non assegnato"}</p>
              </div>
            </div>
            {task.booking && (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <User size={14} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ospite uscente</p>
                  <p className="text-sm font-semibold text-slate-900">{task.booking.guestName ?? "—"}</p>
                  {task.booking.totalGuests && <p className="text-xs text-slate-500">{task.booking.totalGuests} ospiti</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous review history */}
        {lastReview && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ultima revisione</p>
            <p className="text-sm font-medium text-slate-700">
              <span className={`font-black ${lastReview.decision === "REJECTED" ? "text-rose-600" : "text-emerald-600"}`}>{lastReview.decision}</span>
              {" "}da {lastReview.supervisor.name}
            </p>
            {lastReview.notes && <p className="text-xs text-slate-500 italic">"{lastReview.notes}"</p>}
          </div>
        )}

        {/* Checklist */}
        <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-violet-600" />
              <h2 className="text-sm font-semibold uppercase tracking-tight text-slate-900">Checklist Qualità</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
              {completedCount}/{checklist.length} completati
            </span>
          </div>

          {checklist.length === 0 ? (
            <p className="text-sm font-medium text-slate-400 italic">Nessuna checklist registrata.</p>
          ) : (
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-2xl border p-3 ${item.completed ? "border-emerald-100 bg-emerald-50/60" : "border-slate-100 bg-slate-50"}`}
                >
                  {item.completed
                    ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    : <Circle size={16} className="mt-0.5 shrink-0 text-slate-300" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.completed ? "text-emerald-800" : "text-slate-600"}`}>{item.label}</p>
                    {item.type === "numeric" && item.value != null && (
                      <p className="text-xs text-slate-500 mt-0.5">Valore: {item.value}</p>
                    )}
                  </div>
                  {item.required && !item.completed && (
                    <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-rose-600">obbligatorio</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Form */}
        <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-tight text-slate-900">Decisione</h2>
          <SupervisorReviewForm entityId={task.id} supervisorId={userId} type="cleaning" />
        </div>
      </div>
    </main>
  );
}

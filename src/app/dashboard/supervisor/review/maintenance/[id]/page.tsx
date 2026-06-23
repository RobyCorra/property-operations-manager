import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import SupervisorReviewForm from "@/src/components/supervisor-review-form";
import { formatRomeDateDisplay, formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import { ArrowLeft, Wrench, Home, User, CalendarDays, AlertCircle } from "lucide-react";

const priorityLabel: Record<string, string> = {
  LOW: "Bassa",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const priorityColor: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-rose-100 text-rose-700",
};

export default async function MaintenanceReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if ((role !== "SUPERVISOR" && role !== "MANAGER") || !userId) {
    redirect("/login");
  }

  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id },
    include: {
      apartment: { select: { name: true, address: true } },
      assignedTo: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, senderName: true, text: true, createdAt: true },
      },
      supervisorReviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { supervisor: { select: { name: true } } },
      },
    },
  });

  if (!ticket || ticket.status !== "AWAITING_REVIEW") notFound();

  if (role === "SUPERVISOR") {
    const assignment = await prisma.apartmentSupervisor.findUnique({
      where: { apartmentId_userId: { apartmentId: ticket.apartmentId, userId } },
    });
    if (!assignment) redirect("/dashboard/supervisor");
  }

  const lastReview = ticket.supervisorReviews[0];

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
            <h1 className="text-2xl font-semibold uppercase tracking-tight text-slate-900">Revisione Manutenzione</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{ticket.apartment.name}</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg backdrop-blur-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold uppercase tracking-tight text-slate-900">{ticket.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{ticket.description}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${priorityColor[ticket.priority] ?? "bg-slate-100 text-slate-600"}`}>
              {priorityLabel[ticket.priority] ?? ticket.priority}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <Home size={14} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appartamento</p>
                <p className="text-sm font-semibold text-slate-900">{ticket.apartment.name}</p>
                <p className="text-xs text-slate-500">{ticket.apartment.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <User size={14} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manutentore</p>
                <p className="text-sm font-semibold text-slate-900">{ticket.assignedTo?.name ?? "Non assegnato"}</p>
              </div>
            </div>
            {ticket.scheduledStart && (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <CalendarDays size={14} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programmato</p>
                  <p className="text-sm font-semibold text-slate-900">{formatRomeDateTimeDisplay(ticket.scheduledStart)}</p>
                </div>
              </div>
            )}
            {ticket.startedAt && (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <Wrench size={14} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avviato</p>
                  <p className="text-sm font-semibold text-slate-900">{formatRomeDateTimeDisplay(ticket.startedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous review */}
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

        {/* Messages */}
        {ticket.messages.length > 0 && (
          <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg backdrop-blur-xl space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-tight text-slate-900">Storico messaggi</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {ticket.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-3 ${msg.role === "MANAGER" ? "bg-slate-900 text-white ml-8" : "bg-slate-100 text-slate-800 mr-8"}`}
                >
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{msg.senderName}</p>
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {ticket.messages.length === 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 border-dashed bg-slate-50/50 p-4">
            <AlertCircle size={16} className="text-slate-300" />
            <p className="text-sm font-medium text-slate-400">Nessun messaggio per questo ticket.</p>
          </div>
        )}

        {/* Review Form */}
        <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg backdrop-blur-xl">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-tight text-slate-900">Decisione</h2>
          <SupervisorReviewForm entityId={ticket.id} supervisorId={userId} type="maintenance" />
        </div>
      </div>
    </main>
  );
}

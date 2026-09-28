import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getT } from "@/src/lib/server-lang";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getMyCompanyStaff } from "@/src/app/actions/company";
import { createTicketMessage } from "@/src/app/actions/operational";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import BackButton from "@/src/components/back-button";
import AutoRefresh from "@/src/components/auto-refresh";
import MaintenanceShareButton from "@/src/components/maintenance-share-button";
import TicketConversation from "@/src/components/ticket-conversation";
import ImpresaMaintenanceActions from "@/src/components/impresa-maintenance-actions";
import ImpresaMaintenanceAssignControl from "@/src/components/impresa-maintenance-assign-control";
import ImpresaMaintenanceDateRequest from "@/src/components/impresa-maintenance-date-request";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  AWAITING_REVIEW: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

export default async function ImpresaMaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const tr = await getT();
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access || !access.scopes.includes("MAINTENANCE")) redirect("/dashboard/impresa");

  const userName = (() => {
    try { return decodeURIComponent(c.get("userName")?.value || ""); } catch { return c.get("userName")?.value || ""; }
  })() || "Impresa";

  const { id } = await params;
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id },
    include: {
      apartment: { select: { name: true, address: true, organizationId: true } },
      assignedTo: { select: { name: true } },
      attachments: true,
      messages: { orderBy: { createdAt: "asc" }, include: { attachment: true } },
      dateRequests: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!ticket) notFound();

  // Sicurezza: solo interventi di un cliente ingaggiato e appartamento assegnato.
  if (!ticket.apartment.organizationId || !access.orgIds.includes(ticket.apartment.organizationId)) {
    redirect("/dashboard/impresa/manutenzione");
  }
  const mApts = access.scopeApartments?.MAINTENANCE;
  if (mApts && !mApts.includes(ticket.apartmentId)) {
    redirect("/dashboard/impresa/manutenzione");
  }

  const org = ticket.apartment.organizationId
    ? await prisma.organization.findUnique({ where: { id: ticket.apartment.organizationId }, select: { name: true } })
    : null;

  const tasks = Array.isArray(ticket.maintenanceTasks) ? (ticket.maintenanceTasks as any[]) : [];
  const hasWorkSummary = tasks.some((t: any) => t.completed);

  const staff = await getMyCompanyStaff();
  const mainteners = staff.filter((s) => s.role === "MAINTENANCE").map((s) => ({ id: s.id, name: s.name }));

  const pendingReq = ticket.dateRequests.find((r) => r.status === "PENDING") ?? null;
  const rejectedReq = ticket.dateRequests.find((r) => r.status === "REJECTED") ?? null;
  const toReqView = (r: (typeof ticket.dateRequests)[number] | null) =>
    r ? { proposedStart: r.proposedStart.toISOString(), proposedEnd: r.proposedEnd?.toISOString() ?? null, reason: r.reason } : null;

  return (
    <main className="max-w-7xl mx-auto space-y-6">
      <AutoRefresh intervalMs={10000} />
      <div>
        <BackButton />
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{ticket.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{ticket.apartment.name} · {org?.name ?? "—"}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_STYLE[ticket.status] ?? "bg-slate-100 text-slate-600"}`}>{ticket.status}</span>
            {ticket.priority === "URGENT" && <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold text-red-700">Urgente</span>}
          </div>
        </div>
      </div>

      {/* Link condivisibile per il manutentore */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">🔗 Link manutentore (accesso senza login)</p>
        <MaintenanceShareButton ticketId={id} existingToken={ticket.maintenanceAccessToken ?? null} />
      </div>

      {/* Avanzamento / approvazione */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Avanzamento intervento</p>
        <ImpresaMaintenanceActions ticketId={ticket.id} status={ticket.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span>📋</span> {tr.meInfoIntervention}</h2>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tr.meInterventionTimes}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{tr.meScheduledTime}</p>
                <p className="mt-1 font-semibold text-gray-800">{ticket.scheduledStart ? formatRomeDateTimeDisplay(ticket.scheduledStart) : tr.meNotScheduled}</p>
                {ticket.scheduledEnd && <p className="mt-1 text-xs text-gray-500">Fine pianificata: {formatRomeDateTimeDisplay(ticket.scheduledEnd)}</p>}
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{tr.meRealStart}</p>
                <p className="mt-1 font-semibold text-gray-800">{ticket.startedAt ? formatRomeDateTimeDisplay(ticket.startedAt) : tr.meNotStarted}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{tr.meRealEnd}</p>
                <p className="mt-1 font-semibold text-gray-800">{ticket.resolvedAt ? formatRomeDateTimeDisplay(ticket.resolvedAt) : tr.meNotCompleted}</p>
              </div>
            </div>
            {ticket.description && (
              <div className="pt-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Descrizione</p>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1 text-sm">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Assegnato a</p>
                <div className="mt-1">
                  <ImpresaMaintenanceAssignControl ticketId={ticket.id} staff={mainteners} assignedToId={ticket.assignedToId} />
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Indirizzo</p>
                <p className="mt-1 font-semibold text-gray-800">{ticket.apartment.address ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Data intervento: proposta di spostamento (richiede assenso org) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Data intervento</p>
            <ImpresaMaintenanceDateRequest
              ticketId={ticket.id}
              currentStart={ticket.scheduledStart?.toISOString() ?? null}
              pending={toReqView(pendingReq)}
              lastRejected={pendingReq ? null : toReqView(rejectedReq)}
            />
          </div>

          {/* Riepilogo lavori eseguiti dal manutentore */}
          {hasWorkSummary && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">{tr.meWorkSummary}</p>
              <div className="space-y-3">
                {tasks.map((task: any, idx: number) => (
                  <div key={task.id ?? idx} className={`flex items-start gap-3 rounded-xl p-3 ${task.completed ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50 border border-gray-100"}`}>
                    <span className="text-base mt-0.5 flex-shrink-0">{task.completed ? "✅" : "⬜"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${task.completed ? "text-emerald-800" : "text-gray-400"}`}>{task.label || `Task ${idx + 1}`}</p>
                      {task.photoRequired && !task.photoUrl && !task.completed && <p className="text-[10px] text-gray-400 mt-0.5">{tr.mePhotoRequired}</p>}
                    </div>
                    {task.photoUrl && (
                      <a href={task.photoUrl} target="_blank" rel="noreferrer" className="flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={task.photoUrl} alt={tr.meTaskPhoto} className="w-16 h-16 object-cover rounded-lg border border-emerald-200 hover:scale-105 transition-transform" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allegati */}
          {ticket.attachments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{tr.meCurrentAttachments}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ticket.attachments.map((att) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="group relative h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {att.fileType?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={att.url} alt={att.fileName ?? "Allegato"} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                      <div className="text-center p-2"><span className="text-2xl">📄</span><p className="text-[9px] font-bold text-gray-500 mt-1 truncate max-w-full px-1">{att.fileName}</p></div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span>💬</span> {tr.meLiveConversation}</h2>
          <TicketConversation
            entityId={ticket.id}
            initialMessages={ticket.messages as never}
            currentUserRole="MANAGER"
            currentUserName={userName}
            submitAction={createTicketMessage}
            conversationType="MAINTENANCE"
          />
        </div>
      </div>
    </main>
  );
}

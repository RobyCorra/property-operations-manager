import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import Link from "next/link";
import OperationalForm from "@/src/components/operational-form";
import TicketConversation from "@/src/components/ticket-conversation";
import StatusUpdateButton from "@/src/components/status-update-button";
import AIAssistant from "@/src/components/ai-assistant";
import { updateMaintenanceTicket, createTicketMessage, reopenMaintenanceTicket } from "@/src/app/actions/operational";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import MaintenanceShareButton from "@/src/components/maintenance-share-button";
import AutoRefresh from "@/src/components/auto-refresh";
import BackButton from "@/src/components/back-button";

type AttachmentView = {
  id: string;
  url: string;
  filename?: string | null;
  fileName?: string | null;
  name?: string | null;
  fileType?: string | null;
  mimeType?: string | null;
  createdAt?: Date | string | null;
};

type TicketView = {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  apartmentId?: string | null;
  assignedToId?: string | null;
  scheduledStart?: Date | string | null;
  scheduledEnd?: Date | string | null;
  attachments: AttachmentView[];
};

export default async function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;
  const userId = cookieStore.get("userId")?.value;
  const orgId = await getCurrentOrg();

  const [ticket, tokenRecord, apartments, technicians, manager] = await Promise.all([
    prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { attachment: true }
        },
        attachments: true,
        aiAssistantMessages: {
          orderBy: { createdAt: "asc" }
        }
      }
    }),
    prisma.maintenanceTicket.findUnique({
      where: { id },
      select: { maintenanceAccessToken: true },
    }),
    prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "MAINTENANCE", organizationId: orgId }, select: { id: true, name: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  ]);

  if (!ticket) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <AutoRefresh intervalMs={10000} />
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dettagli Ticket #{id.slice(0, 8)}</h1>
          <p className="text-gray-500 mt-1">Gestisci la segnalazione e comunica con il tecnico</p>
        </div>

        {/* Link condivisibile per il manutentore */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            🔗 Link manutentore (accesso senza login)
          </p>
          <MaintenanceShareButton
            ticketId={id}
            existingToken={tokenRecord?.maintenanceAccessToken ?? null}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📋</span> Informazioni Intervento
            </h2>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orari Intervento</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Orario pianificato</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {ticket.scheduledStart ? formatRomeDateTimeDisplay(ticket.scheduledStart) : "Non pianificato"}
                  </p>
                  {ticket.scheduledEnd && (
                    <p className="mt-1 text-xs text-gray-500">
                      Fine pianificata: {formatRomeDateTimeDisplay(ticket.scheduledEnd)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Inizio intervento reale</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {ticket.startedAt ? formatRomeDateTimeDisplay(ticket.startedAt) : "Non avviato"}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Fine intervento reale</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {ticket.resolvedAt ? formatRomeDateTimeDisplay(ticket.resolvedAt) : "Non completato"}
                  </p>
                </div>
              </div>
            </div>
            {/* Riepilogo lavori eseguiti dal manutentore */}
            {Array.isArray(ticket.maintenanceTasks) && (ticket.maintenanceTasks as any[]).some((t: any) => t.completed) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">🔧 Riepilogo lavori eseguiti</p>
                <div className="space-y-3">
                  {(ticket.maintenanceTasks as any[]).map((task: any, idx: number) => (
                    <div key={task.id ?? idx} className={`flex items-start gap-3 rounded-xl p-3 ${task.completed ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50 border border-gray-100"}`}>
                      <span className="text-base mt-0.5 flex-shrink-0">{task.completed ? "✅" : "⬜"}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${task.completed ? "text-emerald-800" : "text-gray-400"}`}>
                          {task.label || `Task ${idx + 1}`}
                        </p>
                        {task.photoRequired && !task.photoUrl && !task.completed && (
                          <p className="text-[10px] text-gray-400 mt-0.5">📷 Foto richiesta — non ancora scattata</p>
                        )}
                      </div>
                      {task.photoUrl && (
                        <a href={task.photoUrl} target="_blank" rel="noreferrer" className="flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={task.photoUrl}
                            alt="Foto task"
                            className="w-16 h-16 object-cover rounded-lg border border-emerald-200 hover:scale-105 transition-transform"
                          />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {role === "MANAGER" && ticket.status === "RESOLVED" && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Ticket risolto</p>
                  <p className="text-xs text-gray-500 mt-1">Riapri la manutenzione se serve un nuovo intervento operativo.</p>
                </div>
                <StatusUpdateButton
                  id={ticket.id}
                  nextStatus="PENDING"
                  label="Riapri manutenzione"
                  action={reopenMaintenanceTicket}
                  className="shrink-0 bg-slate-900 text-white uppercase tracking-widest hover:bg-slate-700"
                />
              </div>
            )}
            <OperationalForm 
              type="MAINTENANCE"
              apartments={apartments}
              personnel={technicians}
              action={updateMaintenanceTicket as any}
              initialData={{
                id: ticket.id,
                apartmentId: ticket.apartmentId,
                assignedToId: ticket.assignedToId,
                title: ticket.title,
                priority: ticket.priority,
                description: ticket.description,
                scheduledStart: ticket.scheduledStart,
                scheduledEnd: ticket.scheduledEnd,
                status: ticket.status,
                maintenanceTasks: ticket.maintenanceTasks,
              }}
            />
            
            {/* Display current attachments list for manager */}
            {ticket.attachments.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Allegati Correnti</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticket.attachments.map((att: AttachmentView) => (
                    <a 
                      key={att.id} 
                      href={att.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="group relative h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center"
                    >
                      {att.fileType?.startsWith('image/') ? (
                        <img src={att.url} alt={att.fileName ?? att.filename ?? att.name ?? "Allegato"} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-2xl">📄</span>
                          <p className="text-[9px] font-bold text-gray-500 mt-1 truncate max-w-full px-1">{att.fileName}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold">Apri</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>💬</span> Conversazione Live
            </h2>
            <TicketConversation 
              entityId={ticket.id}
              initialMessages={ticket.messages}
              currentUserRole="MANAGER"
              currentUserName={manager?.name || "Manager"}
              submitAction={createTicketMessage}
            />
            <AIAssistant
              role="MANAGER"
              type="maintenance"
              apartmentId={ticket.apartmentId}
              maintenanceTicketId={ticket.id}
              initialMessages={ticket.aiAssistantMessages}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

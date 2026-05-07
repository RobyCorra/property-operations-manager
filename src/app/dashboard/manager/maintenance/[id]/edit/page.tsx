import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import OperationalForm from "@/src/components/operational-form";
import TicketConversation from "@/src/components/ticket-conversation";
import StatusUpdateButton from "@/src/components/status-update-button";
import AIAssistant from "@/src/components/ai-assistant";
import { updateMaintenanceTicket, createTicketMessage, reopenMaintenanceTicket } from "@/src/app/actions/operational";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

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

  const [ticket, apartments, technicians, manager] = await Promise.all([
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
    prisma.apartment.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "MAINTENANCE" }, select: { id: true, name: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
  ]);

  if (!ticket) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <Link href="/dashboard/manager/maintenance" className="text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block text-sm">
            &larr; Torna all'elenco manutenzioni
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dettagli Ticket #{id.slice(0, 8)}</h1>
          <p className="text-gray-500 mt-1">Gestisci la segnalazione e comunica con il tecnico</p>
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
            {role === "MANAGER" && ticket.status === "RESOLVED" && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Ticket risolto</p>
                  <p className="text-xs text-gray-500 mt-1">Riapri la manutenzione se serve un nuovo intervento operativo.</p>
                </div>
                <StatusUpdateButton
                  id={ticket.id}
                  nextStatus="OPEN"
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
                status: ticket.status
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

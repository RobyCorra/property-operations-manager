import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import BackButton from "@/src/components/back-button";
import TicketConversation from "@/src/components/ticket-conversation";
import CheckinAssignSelect from "@/src/components/checkin-assign-select";
import CheckinTimeEdit from "@/src/components/checkin-time-edit";
import { createCheckinTaskMessage, getCheckinTaskMessages, markCheckinMessagesReadByManager } from "@/src/app/actions/checkin";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

export const revalidate = 0;

export default async function ManagerCheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userName = cookieStore.get("userName")?.value;
  if (role !== "MANAGER") redirect("/login");

  const { id } = await params;
  const orgId = await getCurrentOrg();

  const [task, assistants, messages] = await Promise.all([
    prisma.checkinTask.findFirst({
      where: { id, apartment: { organizationId: orgId } },
      include: {
        apartment: { select: { name: true, address: true } },
        booking: { select: { guestName: true, totalGuests: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "CHECKIN", organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getCheckinTaskMessages(id),
  ]);

  if (!task) notFound();

  await markCheckinMessagesReadByManager(id);

  const progress = Array.isArray(task.checklistProgress) ? (task.checklistProgress as any[]) : [];
  const doneCount = progress.filter((i) => i.completed).length;

  const statusLabel: Record<string, string> = {
    PENDING: "Da fare",
    IN_PROGRESS: "In corso",
    COMPLETED: "Completato",
    CANCELLED: "Annullato",
  };

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <BackButton />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Check-in — {task.apartment.name}</h1>
            <p className="text-slate-500 text-sm">
              {formatRomeDateTimeDisplay(task.date)} · {statusLabel[task.status] ?? task.status}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-2">
          <p className="text-sm text-slate-600">{task.apartment.address}</p>
          {task.booking?.guestName && (
            <p className="text-sm text-slate-600">
              Ospite: <span className="font-semibold">{task.booking.guestName}</span>
              {task.booking.totalGuests ? ` · ${task.booking.totalGuests} persone` : ""}
            </p>
          )}
          <p className="text-sm text-slate-600">
            Checklist: <span className="font-semibold">{doneCount}/{progress.length}</span> completate
          </p>
        </div>

        {/* Orario check-in */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Orario check-in</p>
          <CheckinTimeEdit
            taskId={task.id}
            initialTime={new Date(task.date).toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hour12: false })}
          />
        </div>

        {/* Assegnazione */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Assegna a</p>
          {assistants.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nessun assistente check-in. Crea un utente con ruolo &quot;Assistente Check-in&quot;.
            </p>
          ) : (
            <CheckinAssignSelect
              taskId={task.id}
              assignedToId={task.assignedTo?.id ?? null}
              assistants={assistants}
            />
          )}
        </div>

        {/* Checklist status */}
        {progress.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Stato checklist</p>
            <div className="space-y-1.5">
              {progress.map((item: any, idx: number) => (
                <div key={item.id ?? idx} className="flex items-center gap-2 text-sm">
                  <span className={item.completed ? "text-emerald-500" : "text-slate-300"}>
                    {item.completed ? "✓" : "○"}
                  </span>
                  <span className={item.completed ? "text-slate-500 line-through" : "text-slate-800"}>{item.label}</span>
                  {item.photoUrl && (
                    <a href={item.photoUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-600">
                      foto
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800 text-sm">💬 Chat con l&apos;assistente</p>
          </div>
          <div className="p-3">
            <TicketConversation
              entityId={task.id}
              initialMessages={messages}
              currentUserRole="MANAGER"
              currentUserName={userName ? decodeURIComponent(userName) : "Manager"}
              submitAction={createCheckinTaskMessage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

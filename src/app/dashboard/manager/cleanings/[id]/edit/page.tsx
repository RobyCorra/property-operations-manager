import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import OperationalForm from "@/src/components/operational-form";
import TicketConversation from "@/src/components/ticket-conversation";
import AIAssistant from "@/src/components/ai-assistant";
import SafeDate from "@/src/components/safe-date";
import { updateCleaningTask, createCleaningTaskMessage, getCleaningTaskMessages, enrichCleaningTaskWithNextBooking } from "@/src/app/actions/operational";

export default async function EditCleaningPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userName = cookieStore.get("userName")?.value || "Manager";

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;

  const [task, apartments, cleaners, messages] = await Promise.all([
    prisma.cleaningTask.findUnique({
      where: { id },
      include: {
        booking: true,
        aiAssistantMessages: {
          orderBy: { createdAt: "asc" }
        }
      }
    }),
    prisma.apartment.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "CLEANER" }, select: { id: true, name: true } }),
    getCleaningTaskMessages(id)
  ]);

  if (!task) {
    notFound();
  }

  // Enrich task with next booking dynamically
  const enrichedTask = await enrichCleaningTaskWithNextBooking(task);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/dashboard/manager/cleanings" className="text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block text-sm">
            &larr; Torna all'elenco pulizie
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Modifica Pulizia</h1>
          <p className="text-gray-500 mt-1">Aggiorna i dettagli dell'intervento pianificato</p>

          <div className="mt-4 flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pianificazione</p>
              <p className="text-sm font-bold text-gray-700">
                🧹 Pulizia: <SafeDate date={task.date} isExplicit={true} />
              </p>
            </div>

            {/* Preparation Context for Manager */}
            <div className="flex-1 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl shadow-sm">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Target: Preparazione Per</p>
              {enrichedTask.nextBooking ? (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-900 font-bold text-sm">{enrichedTask.nextBooking.guestName}</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/50 px-2 py-0.5 rounded-full">{enrichedTask.nextBooking.totalGuests} Ospiti</span>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Nessun arrivo successivo programmato</p>
              )}
            </div>
          </div>
        </div>

        <OperationalForm 
          type="CLEANING"
          apartments={apartments}
          personnel={cleaners}
          action={updateCleaningTask as any}
          initialData={{
            id: task.id,
            apartmentId: task.apartmentId,
            assignedToId: task.assignedToId,
            date: task.date,
            notes: task.notes,
            status: task.status
          }}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat con Addetto</h2>
          <TicketConversation 
            entityId={task.id}
            initialMessages={messages}
            currentUserRole="MANAGER"
            currentUserName={userName}
            submitAction={createCleaningTaskMessage}
          />
        </div>

        <AIAssistant
          role="MANAGER"
          type="cleaning"
          apartmentId={task.apartmentId}
          cleaningTaskId={task.id}
          initialMessages={task.aiAssistantMessages}
        />
      </div>
    </main>
  );
}

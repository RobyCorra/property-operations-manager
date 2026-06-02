import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import TicketConversation from "@/src/components/ticket-conversation";
import { createTicketMessage, createCleaningTaskMessage } from "@/src/app/actions/operational";
import MarkReadTrigger from "@/src/components/mark-read-trigger";
import MessagesDashboard from "@/src/components/messages-dashboard";
import BackButton from "@/src/components/back-button";

export default async function ManagerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userName = cookieStore.get("userName")?.value || "Manager";

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const [maintenanceTickets, cleaningTasks, apartments] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where: { messages: { some: {} } },
      include: {
        apartment: { select: { name: true, address: true } },
        assignedTo: { select: { name: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { attachment: true } },
      },
    }),
    prisma.cleaningTask.findMany({
      where: { messages: { some: {} } },
      include: {
        apartment: { select: { name: true, address: true } },
        assignedTo: { select: { name: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { attachment: true } },
      },
    }),
    prisma.apartment.findMany({ select: { id: true, name: true } }),
  ]);

  const threads = [
    ...maintenanceTickets.map((t) => ({
      id: t.id,
      type: "MAINTENANCE" as const,
      apartmentName: t.apartment.name,
      apartmentAddress: t.apartment.address ?? "",
      assignedUser: t.assignedTo?.name || "Non assegnato",
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      scheduledStart: t.scheduledStart?.toISOString() ?? null,
      scheduledEnd: t.scheduledEnd?.toISOString() ?? null,
      lastMessage: t.messages[t.messages.length - 1],
      messages: t.messages,
      updatedAt: t.messages[t.messages.length - 1]?.createdAt || t.createdAt,
      hasUnread: t.messages.some((m) => m.role !== "MANAGER" && m.readByManagerAt === null),
    })),
    ...cleaningTasks.map((c) => ({
      id: c.id,
      type: "CLEANING" as const,
      apartmentName: c.apartment.name,
      apartmentAddress: c.apartment.address ?? "",
      assignedUser: c.assignedTo?.name || "Non assegnato",
      title: "Pulizia",
      description: c.notes ?? "",
      status: c.status,
      priority: null,
      scheduledStart: null,
      scheduledEnd: null,
      date: c.date.toISOString(),
      checklistProgress: c.checklistProgress as { completed: boolean }[] | null,
      lastMessage: c.messages[c.messages.length - 1],
      messages: c.messages,
      updatedAt: c.messages[c.messages.length - 1]?.createdAt || c.createdAt,
      hasUnread: c.messages.some((m) => m.role !== "MANAGER" && m.readByManagerAt === null),
    })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const selectedThread = threads.find((t) => t.id === sp.id && t.type === sp.type);

  return (
    <main className="min-h-screen bg-gray-50/20">
      <div className="p-4">
        <BackButton />
      </div>
      {selectedThread && (
        <MarkReadTrigger id={selectedThread.id} type={selectedThread.type} />
      )}
      <MessagesDashboard
        threads={threads as any}
        apartments={apartments}
        selectedId={sp.id}
        selectedType={sp.type}
        serverDate={new Date().toISOString()}
        userName={userName}
        submitAction={
          selectedThread?.type === "MAINTENANCE"
            ? createTicketMessage
            : createCleaningTaskMessage
        }
      />
    </main>
  );
}

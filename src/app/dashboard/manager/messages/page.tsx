import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import SafeDate from "@/src/components/safe-date";
import TicketConversation from "@/src/components/ticket-conversation";
import { createTicketMessage, createCleaningTaskMessage } from "@/src/app/actions/operational";
import MarkReadTrigger from "@/src/components/mark-read-trigger";
import Link from "next/link";
import MessagesDashboard from "@/src/components/messages-dashboard";

type MaintenanceThreadSource = {
  id: string;
  title: string;
  createdAt: Date;
  apartment: {
    name: string;
  };
  assignedTo: {
    name: string;
  } | null;
  messages: {
    createdAt: Date;
    role: string;
    readByManagerAt: Date | null;
  }[];
};

type CleaningThreadSource = {
  id: string;
  date: Date | string;
  createdAt: Date;
  apartment: {
    name: string;
  };
  assignedTo: {
    name: string;
  } | null;
  messages: {
    role: string;
    readByManagerAt: Date | null;
    createdAt: Date;
  }[];
};

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

  // 1. Fetch Maintenance Tickets with messages
  const maintenanceTickets = await prisma.maintenanceTicket.findMany({
    where: {
      messages: { some: {} }, // Only those with messages
    },
    include: {
      apartment: true,
      assignedTo: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { attachment: true },
      },
    },
  });

  // 2. Fetch Cleaning Tasks with messages
  const cleaningTasks = await prisma.cleaningTask.findMany({
    where: {
      messages: { some: {} }, // Only those with messages
    },
    include: {
      apartment: true,
      assignedTo: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { attachment: true },
      },
    },
  });

  // 3. Normalize data
  const threads = [
    ...maintenanceTickets.map((t: MaintenanceThreadSource) => ({
      id: t.id,
      type: "MAINTENANCE" as const,
      apartmentName: t.apartment.name,
      assignedUser: t.assignedTo?.name || "Non assegnato",
      title: t.title,
      lastMessage: t.messages[t.messages.length - 1],
      messages: t.messages,
      updatedAt: t.messages[t.messages.length - 1]?.createdAt || t.createdAt,
      hasUnread: t.messages.some(m => m.role !== "MANAGER" && m.readByManagerAt === null),
    })),
    ...cleaningTasks.map((c: CleaningThreadSource) => ({
      id: c.id,
      type: "CLEANING" as const,
      apartmentName: c.apartment.name,
      assignedUser: c.assignedTo?.name || "Non assegnato",
      title: "Pulizia",
      lastMessage: c.messages[c.messages.length - 1],
      messages: c.messages,
      updatedAt: c.messages[c.messages.length - 1]?.createdAt || c.createdAt,
      date: c.date,
      hasUnread: c.messages.some((m: CleaningThreadSource["messages"][number]) => m.role !== "MANAGER" && m.readByManagerAt === null),
    })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const apartments = await prisma.apartment.findMany({ select: { id: true, name: true } });
  const serverDate = new Date().toISOString();

  const selectedThread = threads.find(
    (t) => t.id === sp.id && t.type === sp.type
  );

  return (
    <main className="min-h-screen bg-gray-50/20">
      {/* Client-side trigger for marking messages as read */}
      {selectedThread && (
        <MarkReadTrigger id={selectedThread.id} type={selectedThread.type} />
      )}

      <MessagesDashboard 
        threads={threads as any}
        apartments={apartments}
        selectedId={sp.id}
        selectedType={sp.type}
        serverDate={serverDate}
        userName={userName}
        submitAction={selectedThread?.type === "MAINTENANCE" ? createTicketMessage : createCleaningTaskMessage}
      />
    </main>
  );
}

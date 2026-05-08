import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import CleaningDetailView from "@/src/components/cleaning-detail-view";
import { getCleaningTaskMessages, enrichCleaningTaskWithNextBooking } from "@/src/app/actions/operational";

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
        apartment: { select: { name: true, address: true } },
        assignedTo: { select: { name: true } },
        booking: true,
        aiAssistantMessages: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.apartment.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "CLEANER" }, select: { id: true, name: true } }),
    getCleaningTaskMessages(id),
  ]);

  if (!task) {
    notFound();
  }

  const enrichedTask = await enrichCleaningTaskWithNextBooking(task);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/dashboard/manager/cleanings"
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm inline-block"
        >
          &larr; Torna all'elenco pulizie
        </Link>

        <CleaningDetailView
          task={enrichedTask as any}
          apartments={apartments}
          cleaners={cleaners}
          messages={messages as any}
          userName={userName}
        />
      </div>
    </main>
  );
}

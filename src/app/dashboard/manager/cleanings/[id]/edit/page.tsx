import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import Link from "next/link";
import CleaningDetailView from "@/src/components/cleaning-detail-view";
import CleaningShareButton from "@/src/components/cleaning-share-button";
import { getCleaningTaskMessages, enrichCleaningTaskWithNextBooking } from "@/src/app/actions/operational";
import BackButton from "@/src/components/back-button";

export default async function EditCleaningPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userName = (() => { try { return decodeURIComponent(cookieStore.get("userName")?.value || ""); } catch { return cookieStore.get("userName")?.value || ""; } })() || "Manager";

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;
  const orgId = await getCurrentOrg();

  const [task, apartments, cleaners, messages] = await Promise.all([
    prisma.cleaningTask.findUnique({
      where: { id },
      include: {
        apartment: { select: { name: true, address: true, bathrooms: true, bedConfig: true } },
        assignedTo: { select: { name: true } },
        booking: true,
        aiAssistantMessages: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "CLEANER", organizationId: orgId }, select: { id: true, name: true } }),
    getCleaningTaskMessages(id),
  ]);

  if (!task) {
    notFound();
  }

  // Legge il token separatamente (campo aggiunto dopo la query principale)
  const tokenRecord = await prisma.cleaningTask.findUnique({
    where: { id },
    select: { cleaningAccessToken: true },
  });

  const enrichedTask = await enrichCleaningTaskWithNextBooking(task);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <BackButton />

        {/* Link condivisibile per il cleaner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            🔗 Link cleaner (accesso senza login)
          </p>
          <CleaningShareButton
            cleaningId={id}
            existingToken={tokenRecord?.cleaningAccessToken ?? null}
          />
        </div>

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

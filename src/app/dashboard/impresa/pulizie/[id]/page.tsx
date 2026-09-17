import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getMyCompanyStaff } from "@/src/app/actions/company";
import { getCleaningTaskMessages, enrichCleaningTaskWithNextBooking } from "@/src/app/actions/operational";
import CleaningDetailView from "@/src/components/cleaning-detail-view";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

export default async function ImpresaCleaningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (cookieStore.get("role")?.value !== "MANAGER" || !cookieStore.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access || !access.scopes.includes("CLEANING")) redirect("/dashboard/impresa");

  const userName =
    (() => { try { return decodeURIComponent(cookieStore.get("userName")?.value || ""); } catch { return cookieStore.get("userName")?.value || ""; } })() || "Impresa";

  const { id } = await params;

  const task = await prisma.cleaningTask.findUnique({
    where: { id },
    include: {
      apartment: { select: { name: true, address: true, bathrooms: true, bedConfig: true, maxGuests: true, organizationId: true } },
      assignedTo: { select: { name: true } },
      booking: true,
      aiAssistantMessages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!task) notFound();
  // Sicurezza: solo pulizie di un cliente ingaggiato.
  if (!task.apartment.organizationId || !access.orgIds.includes(task.apartment.organizationId)) {
    redirect("/dashboard/impresa/pulizie");
  }

  const [staff, messages] = await Promise.all([getMyCompanyStaff(), getCleaningTaskMessages(id)]);
  const cleaners = staff.filter((s) => s.role === "CLEANER").map((s) => ({ id: s.id, name: s.name }));
  const enrichedTask = await enrichCleaningTaskWithNextBooking(task);
  const apartments = [{ id: task.apartmentId, name: task.apartment.name }];

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <BackButton />
      <CleaningDetailView
        task={enrichedTask as never}
        apartments={apartments}
        cleaners={cleaners}
        messages={messages as never}
        userName={userName}
      />
    </main>
  );
}

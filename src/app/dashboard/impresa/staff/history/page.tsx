import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getTeamActivityHistory } from "@/src/app/actions/activity";
import Link from "next/link";
import ActivityHistoryTable from "@/src/components/activity-history-table";

export const dynamic = "force-dynamic";

export default async function ImpresaStaffHistoryPage() {
  const c = await cookies();
  const userId = c.get("userId")?.value;
  const role = c.get("role")?.value;
  if (role !== "MANAGER" || !c.get("companyId")?.value || !userId) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  const engagements = await prisma.engagement.findMany({
    where: { companyId: access.companyId, status: "ACTIVE" },
    select: { organizationId: true },
  });
  const orgIds = [...new Set(engagements.map((e) => e.organizationId))];

  const [apartments, collaborators, initialActivities] = await Promise.all([
    prisma.apartment.findMany({
      where: { organizationId: { in: orgIds } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { companyId: access.companyId, role: { not: "MANAGER" } },
      select: { id: true, name: true, role: true },
    }),
    getTeamActivityHistory({
      currentUserId: userId,
      currentUserRole: role as any,
    }),
  ]);

  const serverDate = new Date().toISOString();

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <Link href="/dashboard/impresa/staff" className="text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block text-sm">
            &larr; Torna al team
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Storico Attività</h1>
              <p className="text-gray-500 mt-1 font-medium">Archivio completo degli interventi di pulizia e manutenzione</p>
            </div>
            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
        </div>

        <ActivityHistoryTable
          initialActivities={initialActivities}
          apartments={apartments}
          collaborators={collaborators}
          currentUserId={userId}
          currentUserRole={role}
          serverDate={serverDate}
        />
      </div>
    </main>
  );
}

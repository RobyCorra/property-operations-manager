import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getTeamActivityHistory } from "@/src/app/actions/activity";
import Link from "next/link";
import ActivityHistoryTable from "@/src/components/activity-history-table";

export default async function SharedHistoryPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const role = cookieStore.get("role")?.value;
  const userName = cookieStore.get("userName")?.value || "User";

  if (!userId || !role) {
    redirect("/login");
  }

  // Fetch data with RBAC handled inside the action
  const [apartments, collaborators, initialActivities] = await Promise.all([
    prisma.apartment.findMany({ select: { id: true, name: true } }),
    // Only managers see the collaborator filter
    role === "MANAGER" 
      ? prisma.user.findMany({ where: { role: { not: "MANAGER" } }, select: { id: true, name: true, role: true } })
      : Promise.resolve([]),
    getTeamActivityHistory({
      currentUserId: userId,
      currentUserRole: role as any,
    }),
  ]);

  const serverDate = new Date().toISOString();

  const isManager = role === "MANAGER";
  const backLink = isManager ? "/dashboard/manager/users" : (role === "CLEANER" ? "/dashboard/cleaner" : "/dashboard/maintenance");

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link href={backLink} className="text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block text-sm">
            &larr; Torna alla Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                {isManager ? "Storico Attività Team" : "Il Mio Storico Attività"}
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                {isManager 
                  ? "Archivio completo degli interventi di pulizia e manutenzione" 
                  : "Riepilogo di tutti i tuoi interventi passati e completati"}
              </p>
            </div>
            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
              {isManager ? "📊" : "📜"}
            </div>
          </div>
        </div>

        {/* Unified History List with Filters */}
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

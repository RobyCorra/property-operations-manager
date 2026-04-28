import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import MaintenanceListTable from "@/src/components/maintenance-list-table";

export default async function MaintenanceListPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const [tickets, apartments, collaborators] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      include: {
        apartment: true,
        assignedTo: true,
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.apartment.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "MAINTENANCE" }, select: { id: true, name: true } })
  ]);

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 uppercase">Manutenzione</h1>
            <p className="text-slate-500 mt-1 font-medium">Ticket tecnici e coordinamento manutentori</p>
          </div>

          <Link
            href="/dashboard/manager/maintenance/new"
            className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide"
          >
            + Nuovo Ticket
          </Link>
        </div>

        {/* List */}
        <MaintenanceListTable 
            initialTickets={tickets as any} 
            apartments={apartments} 
            collaborators={collaborators} 
        />

      </div>
    </main>
  );
}

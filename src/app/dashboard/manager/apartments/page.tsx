import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import Link from "next/link";
import ApartmentsListTable from "@/src/components/apartments-list-table";
import BackButton from "@/src/components/back-button";

export default async function ApartmentsListPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();

  const apartments = await prisma.apartment.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4">
          <BackButton />
          <div className="flex-1 flex items-center justify-between gap-3">
            <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase">Appartamenti</h1>
            <Link
              href="/dashboard/manager/apartments/new"
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide shrink-0"
            >
              <span className="md:hidden">+Nuovo</span>
              <span className="hidden md:inline">+ Nuovo Appartamento</span>
            </Link>
          </div>
        </div>

        {/* List */}
        <ApartmentsListTable initialApartments={apartments} />

      </div>
    </main>
  );
}

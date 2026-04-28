import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import ApartmentsListTable from "@/src/components/apartments-list-table";

export default async function ApartmentsListPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const apartments = await prisma.apartment.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 uppercase">Appartamenti</h1>
            <p className="text-slate-500 mt-1 font-medium">Gestione immobili e configurazione checklist</p>
          </div>

          <Link
            href="/dashboard/manager/apartments/new"
            className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide"
          >
            + Nuovo Appartamento
          </Link>
        </div>

        {/* List */}
        <ApartmentsListTable initialApartments={apartments} />

      </div>
    </main>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import BookingsListTable from "@/src/components/bookings-list-table";
import BackButton from "@/src/components/back-button";


export const revalidate = 0;

export default async function BookingsListPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const [bookings, apartments] = await Promise.all([
    prisma.booking.findMany({
      where: { 
        OR: [
          { status: { not: "CANCELLED" } },
          { status: null }
        ]
      },
      include: {
        apartment: true,
      },
      orderBy: {
        checkInDate: "asc",
      },
    }),
    prisma.apartment.findMany({ select: { id: true, name: true } })
  ]);

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 uppercase">Prenotazioni</h1>
              <p className="text-slate-500 mt-1 font-medium">Gestione flussi di occupazione e arrivi</p>
            </div>
            <Link
              href="/dashboard/manager/bookings/new"
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide"
            >
              + Nuova Prenotazione
            </Link>
          </div>
        </div>

        {/* List */}
        <BookingsListTable initialBookings={bookings} apartments={apartments} />

      </div>
    </main>
  );
}

import { cookies } from "next/headers";
import { getT } from "@/src/lib/server-lang";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import Link from "next/link";
import BookingsListTable from "@/src/components/bookings-list-table";
import BackButton from "@/src/components/back-button";
import DbErrorState from "@/src/components/db-error-state";


export const revalidate = 0;

export default async function BookingsListPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();
  const tr = await getT();

  const data = await Promise.all([
    prisma.booking.findMany({
      where: {
        apartment: { organizationId: orgId },
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
    prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } })
  ]).catch((e) => {
    console.error("Prenotazioni: impossibile caricare i dati dal DB", e);
    return null;
  });

  if (!data) {
    return <DbErrorState />;
  }

  const [bookings, apartments] = data;

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 pb-3 -mt-4 md:-mt-6 bg-[#faf8ff]" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold md:font-semibold tracking-tight text-slate-900 md:uppercase truncate">{tr.navBookings}</h1>
              <p className="hidden md:block text-slate-500 mt-1 font-medium">{tr.bkSubtitle}</p>
            </div>
            {/* Bottone desktop */}
            <Link
              href="/dashboard/manager/bookings/new"
              className="hidden md:inline-flex rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide"
            >
              {tr.bkNewBooking}
            </Link>
          </div>
          {/* Bottone mobile a tutta larghezza (niente più overflow) */}
          <Link
            href="/dashboard/manager/bookings/new"
            className="md:hidden mt-3 h-11 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-bold shadow-lg shadow-violet-200 active:scale-[.98] transition-transform"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {tr.bkNewBooking}
          </Link>
        </div>

        {/* List */}
        <BookingsListTable initialBookings={bookings} apartments={apartments} />

      </div>
    </main>
  );
}

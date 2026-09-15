import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import { getT } from "@/src/lib/server-lang";
import Link from "next/link";
import ApartmentsListTable from "@/src/components/apartments-list-table";
import StructuresList from "@/src/components/structures-list";
import BackButton from "@/src/components/back-button";
import DbErrorState from "@/src/components/db-error-state";

export default async function ApartmentsListPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();
  const tr = await getT();

  const apartments = await prisma.apartment.findMany({
    where: { organizationId: orgId, propertyId: null },
    orderBy: { createdAt: "desc" },
  }).catch((e) => {
    console.error("Appartamenti: impossibile caricare i dati dal DB", e);
    return null;
  });

  if (!apartments) {
    return <DbErrorState />;
  }

  const properties = await prisma.property.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        orderBy: { createdAt: "asc" },
        include: {
          units: {
            orderBy: { unitNumber: "asc" },
            select: { id: true, name: true, unitNumber: true, maxGuests: true, bedrooms: true, bathrooms: true, squareMeters: true, icalUrl: true, lastSyncAt: true },
          },
        },
      },
    },
  }).catch((e) => {
    console.error("Strutture: impossibile caricare i dati dal DB", e);
    return [];
  });

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 pb-3 -mt-4 md:-mt-6 bg-[#faf8ff] flex items-center gap-3 md:gap-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
          <BackButton />
          <div className="flex-1 flex items-center justify-between gap-3">
            <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase">{tr.navApartments}</h1>
            <Link
              href="/dashboard/manager/apartments/new"
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide shrink-0"
            >
              <span className="md:hidden">{tr.apNewShort}</span>
              <span className="hidden md:inline">{tr.apNewApartment}</span>
            </Link>
          </div>
        </div>

        {/* Strutture (hotel/residence) */}
        {properties.length > 0 && <StructuresList structures={properties} />}

        {/* List appartamenti singoli */}
        <ApartmentsListTable initialApartments={apartments} />

      </div>
    </main>
  );
}

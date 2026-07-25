import { cookies } from "next/headers";
import { getT } from "@/src/lib/server-lang";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import ApartmentProductsPanel from "@/src/components/apartment-products-panel";
import BackButton from "@/src/components/back-button";

interface ProductsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApartmentProductsPage({ params }: ProductsPageProps) {
  const tr = await getT();
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { createdAt: "asc" },
      },
      bookings: {
        where: {
          checkInDate: { gte: new Date() },
          status: { not: "cancelled" },
        },
        orderBy: { checkInDate: "asc" },
        take: 1,
        select: { totalGuests: true },
      },
    },
  });

  if (!apartment) {
    notFound();
  }

  const nextBooking = apartment.bookings[0] ?? null;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <BackButton />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {tr.pdTitle}
            </h1>
            <p className="text-gray-500 mt-1">{apartment.name}</p>
          </div>
        </div>

        {/* Panel */}
        <ApartmentProductsPanel
          apartmentId={id}
          initialProducts={apartment.products}
          nextGuestCount={nextBooking?.totalGuests ?? null}
        />

      </div>
    </main>
  );
}

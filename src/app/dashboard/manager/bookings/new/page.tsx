import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import BookingForm from "@/src/components/booking-form";
import BackButton from "@/src/components/back-button";

export default async function NewBookingPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();

  const apartments = await prisma.apartment.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const serverDate = new Date().toISOString();

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Nuova Prenotazione</h1>
          <p className="text-gray-500 mt-1">Inserisci i dettagli del soggiorno e verifica disponibilità</p>
        </div>

        {/* Form Container */}
        <BookingForm apartments={apartments} serverDate={serverDate} />

      </div>
    </main>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import BookingForm from "@/src/components/booking-form";

export default async function NewBookingPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const apartments = await prisma.apartment.findMany({
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
          <Link href="/dashboard/manager/bookings" className="text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block">
            &larr; Torna alle prenotazioni
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Nuova Prenotazione</h1>
          <p className="text-gray-500 mt-1">Inserisci i dettagli del soggiorno e verifica disponibilità</p>
        </div>

        {/* Form Container */}
        <BookingForm apartments={apartments} serverDate={serverDate} />

      </div>
    </main>
  );
}

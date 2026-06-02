import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import BookingForm from "@/src/components/booking-form";
import BackButton from "@/src/components/back-button";

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;

  const [booking, apartments] = await Promise.all([
    prisma.booking.findUnique({
      where: { id },
    }),
    prisma.apartment.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!booking) {
    notFound();
  }

  const serverDate = new Date().toISOString();

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-2">Modifica Prenotazione</h1>
          <p className="text-gray-500 mt-1">Aggiorna i dettagli del soggiorno per {booking.guestName}</p>
        </div>

        <BookingForm 
          apartments={apartments} 
          initialData={{
            id: booking.id,
            apartmentId: booking.apartmentId,
            guestName: booking.guestName ?? "",
            totalGuests: booking.totalGuests,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            cullaRequested: booking.cullaRequested ?? false,
          }}
          serverDate={serverDate}
        />

      </div>
    </main>
  );
}

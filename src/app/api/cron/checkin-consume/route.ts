import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { consumeProductsOnCheckin } from "@/src/app/actions/product";

// GET /api/cron/checkin-consume
// Chiamato da Vercel Cron ogni giorno alle 08:00 (Europe/Rome).
// Trova tutte le prenotazioni con check-in oggi e consuma i prodotti.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Data di oggi in fuso orario Europe/Rome (YYYY-MM-DD)
  const todayRome = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
  }).format(new Date()); // "2026-06-24"

  const todayStart = new Date(`${todayRome}T00:00:00.000Z`);
  const todayEnd   = new Date(`${todayRome}T23:59:59.999Z`);

  // Prenotazioni con check-in oggi non ancora processate (non CANCELLED)
  const bookings = await prisma.booking.findMany({
    where: {
      checkInDate: { gte: todayStart, lte: todayEnd },
      status: { not: "CANCELLED" },
    },
    select: { id: true, apartmentId: true, totalGuests: true, guestName: true },
  });

  const results: { bookingId: string; apartmentId: string; alerts: string[] }[] = [];

  for (const booking of bookings) {
    const result = await consumeProductsOnCheckin(
      booking.apartmentId,
      booking.totalGuests ?? 1
    );
    if (result.success) {
      results.push({
        bookingId: booking.id,
        apartmentId: booking.apartmentId,
        alerts: result.alerts ?? [],
      });
    }
  }

  console.log(`[CRON] checkin-consume: processate ${bookings.length} prenotazioni`);
  return NextResponse.json({ processed: bookings.length, results });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { performApartmentIcalSync } from "@/src/lib/server/ical-sync";

// GET /api/cron/ical-sync
// Vercel Cron: ogni 6 ore. Risincronizza da Airbnb/Booking tutti gli appartamenti
// con un URL iCal configurato, così il database (calendario, pulizie, AI) resta
// allineato senza dover premere "Sync" a mano. Ogni appartamento è protetto da
// try/catch: un feed non raggiungibile non blocca gli altri.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apartments = await prisma.apartment.findMany({
    where: { icalUrl: { not: null } },
    select: { id: true, name: true },
  });

  const results: { apartmentId: string; name: string; synced?: number; error?: string }[] = [];

  for (const apt of apartments) {
    try {
      const count = await performApartmentIcalSync(apt.id);
      results.push({ apartmentId: apt.id, name: apt.name, synced: count });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[CRON ical-sync] ${apt.name} (${apt.id}) fallito:`, msg);
      results.push({ apartmentId: apt.id, name: apt.name, error: msg });
    }
  }

  const ok = results.filter((r) => r.error === undefined).length;
  console.log(`[CRON] ical-sync: ${ok}/${apartments.length} appartamenti sincronizzati`);
  return NextResponse.json({ total: apartments.length, ok, results });
}

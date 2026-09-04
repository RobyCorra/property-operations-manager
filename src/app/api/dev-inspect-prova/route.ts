import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

const TOKEN = "prova1-read-4b8e2d";
const ORG_NAME = "Organizzazione Prova 1";

// SOLA LETTURA — dump pulizie/prenotazioni dell'org di test per diagnosi.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("token") !== TOKEN) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const org = await prisma.organization.findFirst({ where: { name: ORG_NAME }, select: { id: true } });
  if (!org) return NextResponse.json({ error: "org non trovata" }, { status: 404 });
  const apts = await prisma.apartment.findMany({ where: { organizationId: org.id }, select: { id: true, name: true } });
  const aptIds = apts.map((a) => a.id);

  const cleanings = await prisma.cleaningTask.findMany({
    where: { apartmentId: { in: aptIds } },
    select: {
      id: true, date: true, status: true, apartmentId: true, bookingId: true, assignedToId: true,
      apartment: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });
  const bookings = await prisma.booking.findMany({
    where: { apartmentId: { in: aptIds } },
    select: { id: true, guestName: true, checkInDate: true, checkOutDate: true, apartment: { select: { name: true } } },
    orderBy: { checkInDate: "asc" },
  });

  return NextResponse.json({ serverNow: new Date().toISOString(), cleanings, bookings });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apartmentName = searchParams.get("apartmentName");
  const date = searchParams.get("date");

  if (!apartmentName || !date) {
    return NextResponse.json({ conflict: false });
  }

  const apartment = await prisma.apartment.findFirst({
    where: { name: { equals: apartmentName, mode: "insensitive" } },
    select: { id: true },
  });

  if (!apartment) return NextResponse.json({ conflict: false });

  const day = new Date(date);
  const dayStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0));
  const dayEnd = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59));

  // Cerca prenotazioni attive che coprono questa data
  const booking = await prisma.booking.findFirst({
    where: {
      apartmentId: apartment.id,
      status: { not: "CANCELLED" },
      checkInDate: { lte: dayEnd },
      checkOutDate: { gte: dayStart },
    },
    select: { guestName: true, checkInDate: true, checkOutDate: true },
  });

  if (!booking) return NextResponse.json({ conflict: false });

  return NextResponse.json({
    conflict: true,
    guestName: booking.guestName,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
  });
}

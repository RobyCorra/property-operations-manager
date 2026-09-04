import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const cleanings = await prisma.cleaningTask.findMany({
      where: {
        apartment: { name: { contains: "Trastevere 68" } },
        date: {
          gte: new Date("2026-08-20T00:00:00.000Z"),
          lt: new Date("2026-09-15T00:00:00.000Z"),
        },
      },
      select: {
        id: true,
        date: true,
        status: true,
        assignedTo: { select: { name: true } },
        apartment: { select: { id: true, name: true } },
        bookingId: true,
      },
      orderBy: { date: "asc" },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        apartment: { name: { contains: "Trastevere 68" } },
        checkInDate: {
          gte: new Date("2026-08-20T00:00:00.000Z"),
          lt: new Date("2026-09-15T00:00:00.000Z"),
        },
      },
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,
        apartment: { select: { name: true } },
      },
      orderBy: { checkInDate: "asc" },
    });

    const tickets = await prisma.maintenanceTicket.findMany({
      where: { apartment: { name: { contains: "Trastevere 68" } } },
      select: { id: true, status: true, priority: true, scheduledStart: true },
    });

    return NextResponse.json({ cleanings, bookings, tickets });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

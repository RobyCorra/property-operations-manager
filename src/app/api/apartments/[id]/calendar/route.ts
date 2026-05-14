import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // "YYYY-MM"

  // Default to current month
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m - 1;
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

  const [apartment, bookings, cleanings, tickets] = await Promise.all([
    prisma.apartment.findUnique({
      where: { id },
      select: { id: true, name: true, address: true },
    }),

    prisma.booking.findMany({
      where: {
        apartmentId: id,
        status: { not: "CANCELLED" },
        OR: [
          { checkInDate: { lte: lastDay }, checkOutDate: { gte: firstDay } },
        ],
      },
      orderBy: { checkInDate: "asc" },
      select: {
        id: true,
        guestName: true,
        checkInDate: true,
        checkOutDate: true,
        totalGuests: true,
        status: true,
        notes: true,
      },
    }),

    prisma.cleaningTask.findMany({
      where: {
        apartmentId: id,
        status: { not: "CANCELLED" },
        date: { gte: firstDay, lte: lastDay },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        date: true,
        status: true,
        assignedTo: { select: { name: true } },
        booking: { select: { guestName: true } },
      },
    }),

    prisma.maintenanceTicket.findMany({
      where: {
        apartmentId: id,
        status: { not: "CANCELLED" },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        scheduledStart: true,
        assignedTo: { select: { name: true } },
      },
    }),
  ]);

  if (!apartment) {
    return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
  }

  return NextResponse.json({ apartment, bookings, cleanings, tickets });
}

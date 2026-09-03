import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "YYYY-MM"
  const apartmentId = searchParams.get("apartmentId") || null;
  const status = searchParams.get("status") || null;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Missing or invalid month param (YYYY-MM)" }, { status: 400 });
  }

  const [year, mon] = month.split("-").map(Number);
  const from = new Date(year, mon - 1, 1);
  const to = new Date(year, mon, 0, 23, 59, 59, 999);

  const orgId = await getCurrentOrg();

  const where = {
    apartment: { organizationId: orgId },
    date: { gte: from, lte: to },
    ...(apartmentId ? { apartmentId } : {}),
    ...(status && status !== "ALL" ? { status } : {}),
  };

  const tasks = await prisma.checkinTask.findMany({
    where,
    include: {
      apartment: { select: { name: true } },
      assignedTo: { select: { name: true } },
      booking: { select: { guestName: true, totalGuests: true, checkOutDate: true } },
    },
    orderBy: { date: "asc" },
  });

  const data = tasks.map((c) => ({
    id: c.id,
    date: c.date,
    status: c.status,
    apartmentId: c.apartmentId,
    apartmentName: c.apartment.name,
    assignedToName: c.assignedTo?.name ?? null,
    guestName: c.booking?.guestName ?? null,
    totalGuests: c.booking?.totalGuests ?? null,
    checkOutDate: c.booking?.checkOutDate ?? null,
    href: `/dashboard/manager/checkins/${c.id}`,
  }));

  return NextResponse.json(data);
}

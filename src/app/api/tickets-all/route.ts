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

  // Un ticket appartiene al mese se ha scheduledStart nel range, o (fallback)
  // se non ha scheduledStart ma createdAt nel range.
  const where: any = {
    apartment: { organizationId: orgId },
    ...(apartmentId ? { apartmentId } : {}),
    ...(status && status !== "ALL" ? { status } : {}),
    OR: [
      { scheduledStart: { gte: from, lte: to } },
      { AND: [{ scheduledStart: null }, { createdAt: { gte: from, lte: to } }] },
    ],
  };

  const tickets = await prisma.maintenanceTicket.findMany({
    where,
    include: {
      apartment: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "asc" }],
  });

  const data = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    date: t.scheduledStart ?? t.createdAt,
    scheduledStart: t.scheduledStart,
    createdAt: t.createdAt,
    apartmentId: t.apartmentId,
    apartmentName: t.apartment.name,
    assignedToName: t.assignedTo?.name ?? null,
    isAssigned: !!t.assignedTo,
    href: `/dashboard/manager/maintenance/${t.id}`,
  }));

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getCompanyAccess();
  if (!access || !access.scopes.includes("CLEANING"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const apartmentId = searchParams.get("apartmentId") || null;
  const status = searchParams.get("status") || null;

  if (!month || !/^\d{4}-\d{2}$/.test(month))
    return NextResponse.json({ error: "Missing or invalid month param (YYYY-MM)" }, { status: 400 });

  const [year, mon] = month.split("-").map(Number);
  const from = new Date(year, mon - 1, 1);
  const to = new Date(year, mon, 0, 23, 59, 59, 999);

  const cleaningAptIds = access.scopeApartments?.CLEANING;
  const aptScope = cleaningAptIds
    ? { apartmentId: { in: cleaningAptIds } }
    : { apartment: { organizationId: { in: access.orgIds } } };

  const where = {
    ...aptScope,
    date: { gte: from, lte: to },
    ...(apartmentId ? { apartmentId } : {}),
    ...(status && status !== "ALL" ? { status } : { status: { not: "CANCELLED" } }),
  };

  const tasks = await prisma.cleaningTask.findMany({
    where,
    include: {
      apartment: { select: { name: true } },
      assignedTo: { select: { name: true } },
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
    href: `/dashboard/impresa/pulizie/${c.id}`,
  }));

  return NextResponse.json(data);
}

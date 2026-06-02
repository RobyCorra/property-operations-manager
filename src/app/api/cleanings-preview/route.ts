import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { getCurrentOrg } from "@/src/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apartmentIds = searchParams.getAll("apartmentId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const unassignedOnly = searchParams.get("unassignedOnly") === "true";

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "Missing params", dateFrom, dateTo }, { status: 400 });
  }

  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59, 999);

  const orgId = await getCurrentOrg();

  const filtered = await prisma.cleaningTask.findMany({
    where: {
      apartment: { organizationId: orgId },
      ...(apartmentIds.length > 0 ? { apartmentId: { in: apartmentIds } } : {}),
      date: { gte: from, lte: to },
      status: { notIn: ["CANCELLED", "APPROVED"] },
      ...(unassignedOnly ? { assignedToId: null } : {}),
    },
    include: {
      apartment: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  const responseData = filtered.map((c) => ({
    id: c.id,
    date: c.date,
    status: c.status,
    apartmentName: c.apartment.name,
    assignedTo: c.assignedTo?.name ?? null,
  }));

  return NextResponse.json(responseData);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apartmentIds = searchParams.getAll("apartmentId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (!apartmentIds.length || !dateFrom || !dateTo) {
    return NextResponse.json([], { status: 400 });
  }

  const to = new Date(dateTo);
  to.setHours(23, 59, 59, 999);

  const cleanings = await prisma.cleaningTask.findMany({
    where: {
      apartmentId: { in: apartmentIds },
      date: { gte: new Date(dateFrom), lte: to },
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
    include: {
      apartment: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(
    cleanings.map((c) => ({
      id: c.id,
      date: c.date,
      status: c.status,
      apartmentName: c.apartment.name,
      assignedTo: c.assignedTo?.name ?? null,
    }))
  );
}

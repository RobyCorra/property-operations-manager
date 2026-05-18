import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apartmentIds = searchParams.getAll("apartmentId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (!apartmentIds.length || !dateFrom || !dateTo) {
    return NextResponse.json({ error: "Missing params", apartmentIds, dateFrom, dateTo }, { status: 400 });
  }

  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  to.setHours(23, 59, 59, 999);

  // Query senza filtro stato per debug
  const allForApartments = await prisma.cleaningTask.findMany({
    where: { apartmentId: { in: apartmentIds } },
    select: { id: true, date: true, status: true, apartmentId: true },
    orderBy: { date: "asc" },
    take: 100,
  });

  // Query con filtro date + stato
  const filtered = await prisma.cleaningTask.findMany({
    where: {
      apartmentId: { in: apartmentIds },
      date: { gte: from, lte: to },
      status: { notIn: ["CANCELLED", "APPROVED"] },
    },
    include: {
      apartment: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  });

  // Risposta: includi debug info
  const responseData = filtered.map((c) => ({
    id: c.id,
    date: c.date,
    status: c.status,
    apartmentName: c.apartment.name,
    assignedTo: c.assignedTo?.name ?? null,
  }));

  return NextResponse.json(responseData, {
    headers: {
      "X-Debug-All-Count": String(allForApartments.length),
      "X-Debug-Filtered-Count": String(filtered.length),
      "X-Debug-Date-From": from.toISOString(),
      "X-Debug-Date-To": to.toISOString(),
      "X-Debug-All-Dates": allForApartments.map(c => `${c.apartmentId.slice(0,8)}:${c.date.toISOString().slice(0,10)}:${c.status}`).join("|"),
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "Trastevere 68";

  const apartment = await prisma.apartment.findFirst({
    where: { name: { contains: name, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!apartment) return NextResponse.json({ error: "Apartment not found" });

  const now = new Date();
  const recent14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const all = await prisma.cleaningTask.findMany({
    where: { apartmentId: apartment.id },
    select: { id: true, date: true, status: true, assignedToId: true },
    orderBy: { date: "asc" },
    take: 20,
  });

  const inContext = await prisma.cleaningTask.findMany({
    where: {
      apartmentId: apartment.id,
      OR: [
        { status: { in: ["PENDING", "IN_PROGRESS", "AWAITING_REVIEW"] } },
        { date: { gte: recent14Days } },
      ],
    },
    select: { id: true, date: true, status: true },
    orderBy: { date: "asc" },
    take: 20,
  });

  return NextResponse.json({
    apartment: apartment.name,
    all: all.map(c => ({ id: c.id.slice(0,8), date: c.date.toISOString(), status: c.status })),
    inContext: inContext.map(c => ({ id: c.id.slice(0,8), date: c.date.toISOString(), status: c.status })),
  });
}

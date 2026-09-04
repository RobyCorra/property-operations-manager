import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const cleanings = await prisma.cleaningTask.findMany({
      where: {
        date: {
          gte: new Date("2026-05-01T00:00:00.000Z"),
          lt: new Date("2026-06-01T00:00:00.000Z"),
        },
      },
      select: {
        id: true,
        date: true,
        status: true,
        assignedToId: true,
        assignedTo: {
          select: { id: true, name: true },
        },
        apartment: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "asc" },
    });

    const summary = {
      total: cleanings.length,
      assigned: cleanings.filter((c) => c.assignedToId !== null).length,
      unassigned: cleanings.filter((c) => c.assignedToId === null).length,
    };

    return NextResponse.json({ summary, cleanings });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

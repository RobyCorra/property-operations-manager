import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    // Cancella notifiche lette da più di 24 ore
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);
    await prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: { lte: cutoff },
      },
    });

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json([], { status: 500 });
  }
}

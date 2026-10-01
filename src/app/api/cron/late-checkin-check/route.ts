import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendPushToRole } from "@/src/lib/push";
import type { Role } from "@/src/generated/prisma/client";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const lateThreshold = new Date(now - 30 * 60 * 1000);
  const oldestRelevant = new Date(now - 24 * 60 * 60 * 1000);

  const lateCheckins = await prisma.checkinTask.findMany({
    where: {
      status: "PENDING",
      date: { lte: lateThreshold, gte: oldestRelevant },
    },
    include: { apartment: { select: { id: true, name: true, organizationId: true } } },
  });

  let sent = 0;

  for (const task of lateCheckins) {
    const apt = task.apartment;
    if (!apt) continue;

    const recent = await prisma.checkinTaskMessage.findFirst({
      where: {
        checkinTaskId: task.id,
        role: "SYSTEM",
        text: { contains: "in ritardo" },
        createdAt: { gte: new Date(now - 2 * 60 * 60 * 1000) },
      },
    });
    if (recent) continue;

    const scheduled = new Date(task.date).toLocaleTimeString("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    await prisma.checkinTaskMessage.create({
      data: {
        checkinTaskId: task.id,
        role: "SYSTEM",
        senderName: "Sistema",
        text: `⚠️ Check-in in ritardo — ${apt.name}. Il check-in delle ${scheduled} non è stato avviato.`,
        readByManagerAt: null,
      },
    });

    await sendPushToRole(
      "MANAGER" as Role,
      {
        title: `⚠️ Check-in in ritardo — ${apt.name}`,
        body: `Il check-in delle ${scheduled} non è stato avviato.`,
        url: `/dashboard/manager/messages`,
        tag: `checkin-late-${task.id}`,
      },
      "checkinLate",
      apt.organizationId ?? null
    ).catch(console.error);

    sent++;
  }

  console.log(`[CRON] late-checkin-check: ${sent} avvisi inviati su ${lateCheckins.length} in ritardo`);
  return NextResponse.json({ checked: true, late: lateCheckins.length, sent });
}

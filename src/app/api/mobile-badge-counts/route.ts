import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const orgId = cookieStore.get("organizationId")?.value;
    if (!orgId) return NextResponse.json({ lateCleans: 0, urgentTickets: 0 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [lateCleans, urgentTickets] = await Promise.all([
      prisma.cleaningTask.count({
        where: {
          organizationId: orgId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          scheduledDate: { lt: today },
        },
      }),
      prisma.maintenanceTicket.count({
        where: {
          organizationId: orgId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
          priority: "URGENT",
        },
      }),
    ]);

    return NextResponse.json({ lateCleans, urgentTickets });
  } catch {
    return NextResponse.json({ lateCleans: 0, urgentTickets: 0 });
  }
}

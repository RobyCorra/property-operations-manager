"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentOrg } from "@/src/lib/tenant";

export const getUnreadMessagesCount = async () => {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return 0;

    // Appartamenti delegati per scope — i loro interventi non mostrano thread all'org
    const delegatedEngagements = await prisma.engagement.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      select: { scope: true, apartments: { select: { apartmentId: true } } },
    });
    const delegatedAptsByScope = new Map<string, Set<string>>();
    for (const e of delegatedEngagements) {
      const set = delegatedAptsByScope.get(e.scope) ?? new Set();
      for (const a of e.apartments) set.add(a.apartmentId);
      delegatedAptsByScope.set(e.scope, set);
    }
    const delegatedMaintenanceApts = [...(delegatedAptsByScope.get("MAINTENANCE") ?? [])];
    const delegatedCleaningApts = [...(delegatedAptsByScope.get("CLEANING") ?? [])];

    const [maintenanceUnread, cleaningUnread] = await Promise.all([
      prisma.message.count({
        where: {
          role: { not: "MANAGER" },
          readByManagerAt: null,
          maintenanceTicket: {
            apartment: { organizationId: orgId },
            ...(delegatedMaintenanceApts.length ? { apartmentId: { notIn: delegatedMaintenanceApts } } : {}),
            OR: [{ assignedToId: null }, { assignedTo: { companyId: null } }],
          },
        },
      }),
      prisma.cleaningTaskMessage.count({
        where: {
          role: { not: "MANAGER" },
          readByManagerAt: null,
          cleaningTask: {
            apartment: { organizationId: orgId },
            ...(delegatedCleaningApts.length ? { apartmentId: { notIn: delegatedCleaningApts } } : {}),
            OR: [{ assignedToId: null }, { assignedTo: { companyId: null } }],
          },
        },
      }),
    ]);

    return maintenanceUnread + cleaningUnread;
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return 0;
  }
}

export async function markConversationAsRead(id: string, type: "MAINTENANCE" | "CLEANING") {
  try {
    if (type === "MAINTENANCE") {
      await prisma.message.updateMany({
        where: {
          maintenanceTicketId: id,
          role: { not: "MANAGER" },
          readByManagerAt: null,
        },
        data: {
          readByManagerAt: new Date(),
        },
      });
    } else {
      await prisma.cleaningTaskMessage.updateMany({
        where: {
          cleaningTaskId: id,
          role: { not: "MANAGER" },
          readByManagerAt: null,
        },
        data: {
          readByManagerAt: new Date(),
        },
      });
    }

    revalidatePath("/dashboard/manager");
    return { success: true };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return { error: "Errore durante la lettura dei messaggi." };
  }
}

"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export const getUnreadMessagesCount = async () => {
  try {
    const [maintenanceUnread, cleaningUnread] = await Promise.all([
      prisma.message.count({
        where: {
          role: { not: "MANAGER" },
          readByManagerAt: null,
        },
      }),
      prisma.cleaningTaskMessage.count({
        where: {
          role: { not: "MANAGER" },
          readByManagerAt: null,
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

    revalidatePath("/dashboard/manager"); // Revalidate topbar count
    return { success: true };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return { error: "Errore durante la lettura dei messaggi." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/manager");
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

export async function markAllAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/manager");
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
}

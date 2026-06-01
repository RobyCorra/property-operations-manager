"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/** Cancella le notifiche lette da più di 24 ore. */
async function deleteExpiredNotifications() {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);
  try {
    await prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: { lte: cutoff },
      },
    });
  } catch (error) {
    console.error("Failed to delete expired notifications:", error);
  }
}

export async function getNotifications() {
  try {
    // Cleanup silenzioso prima di restituire la lista
    await deleteExpiredNotifications();

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
      data: { isRead: true, readAt: new Date() },
    });
    revalidatePath("/dashboard/manager");
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

export async function markAllAsRead() {
  try {
    const now = new Date();
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: now },
    });
    revalidatePath("/dashboard/manager");
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
}

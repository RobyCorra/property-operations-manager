"use server";

import { prisma } from "@/src/lib/prisma";
import { randomBytes } from "crypto";

/** Genera (o rigenera) il token di accesso pubblico per una pulizia. */
export async function generateCleaningAccessToken(cleaningId: string): Promise<string> {
  const token = randomBytes(24).toString("hex"); // 48 caratteri hex
  await prisma.cleaningTask.update({
    where: { id: cleaningId },
    data: { cleaningAccessToken: token },
  });
  return token;
}

/** Legge la pulizia dal token pubblico — usato dalla pagina pubblica del cleaner. */
export async function getCleaningByToken(token: string) {
  return prisma.cleaningTask.findUnique({
    where: { cleaningAccessToken: token },
    include: {
      apartment: {
        select: {
          id: true,
          name: true,
          address: true,
          checklistItems: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      },
      assignedTo: { select: { name: true } },
      booking: {
        select: {
          guestName: true,
          totalGuests: true,
          checkInDate: true,
          checkOutDate: true,
        },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          fileName: true,
          fileType: true,
          url: true,
          category: true,
        },
      },
    },
  });
}

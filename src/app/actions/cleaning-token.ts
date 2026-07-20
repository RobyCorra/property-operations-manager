"use server";

import { prisma } from "@/src/lib/prisma";
import { randomBytes } from "crypto";

// Scadenza di default dei link pubblici (giorni).
const TOKEN_TTL_DAYS = 7;

/** Genera (o rigenera) il token di accesso pubblico per una pulizia, con scadenza. */
export async function generateCleaningAccessToken(cleaningId: string): Promise<string> {
  const token = randomBytes(24).toString("hex"); // 48 caratteri hex
  await prisma.cleaningTask.update({
    where: { id: cleaningId },
    data: {
      cleaningAccessToken: token,
      cleaningAccessTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

/** Revoca il link pubblico di una pulizia. */
export async function revokeCleaningAccessToken(cleaningId: string): Promise<void> {
  await prisma.cleaningTask.update({
    where: { id: cleaningId },
    data: { cleaningAccessToken: null, cleaningAccessTokenExpiresAt: null },
  });
}

/** Legge la pulizia dal token pubblico — usato dalla pagina pubblica del cleaner. */
export async function getCleaningByToken(token: string) {
  const task = await prisma.cleaningTask.findUnique({
    where: { cleaningAccessToken: token },
    include: {
      apartment: {
        select: {
          id: true,
          name: true,
          address: true,
          bathrooms: true,
          bedConfig: true,
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
          cullaRequested: true,
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
  if (!task) return null;
  if (task.cleaningAccessTokenExpiresAt && task.cleaningAccessTokenExpiresAt < new Date()) return null;
  return task;
}

/** Distingue un link scaduto da uno inesistente, per mostrare il messaggio giusto. */
export async function getCleaningTokenStatus(token: string): Promise<"valid" | "expired" | "unknown"> {
  const task = await prisma.cleaningTask.findUnique({
    where: { cleaningAccessToken: token },
    select: { cleaningAccessTokenExpiresAt: true },
  });
  if (!task) return "unknown";
  if (task.cleaningAccessTokenExpiresAt && task.cleaningAccessTokenExpiresAt < new Date()) return "expired";
  return "valid";
}

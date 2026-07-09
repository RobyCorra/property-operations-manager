"use server";

import { prisma } from "@/src/lib/prisma";
import { randomBytes } from "crypto";

// Scadenza di default dei link pubblici (giorni).
const TOKEN_TTL_DAYS = 7;

/** Genera (o rigenera) il token di accesso pubblico per un check-in, con scadenza. */
export async function generateCheckinAccessToken(checkinId: string): Promise<string> {
  const token = randomBytes(24).toString("hex"); // 48 caratteri hex
  await prisma.checkinTask.update({
    where: { id: checkinId },
    data: {
      checkinAccessToken: token,
      checkinAccessTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

/** Revoca il link pubblico di un check-in. */
export async function revokeCheckinAccessToken(checkinId: string): Promise<void> {
  await prisma.checkinTask.update({
    where: { id: checkinId },
    data: { checkinAccessToken: null, checkinAccessTokenExpiresAt: null },
  });
}

/** Legge il check-in dal token pubblico — usato dalla pagina pubblica dell'assistente. */
export async function getCheckinByToken(token: string) {
  const task = await prisma.checkinTask.findUnique({
    where: { checkinAccessToken: token },
    include: {
      apartment: { select: { id: true, name: true, address: true } },
      assignedTo: { select: { name: true } },
      booking: {
        select: {
          guestName: true,
          totalGuests: true,
          checkInDate: true,
          checkOutDate: true,
        },
      },
    },
  });
  // Link scaduto → trattato come non valido
  if (!task) return null;
  if (task.checkinAccessTokenExpiresAt && task.checkinAccessTokenExpiresAt < new Date()) return null;
  return task;
}

"use server";

import { prisma } from "@/src/lib/prisma";
import { randomBytes } from "crypto";

/** Genera (o rigenera) il token di accesso pubblico per un check-in. */
export async function generateCheckinAccessToken(checkinId: string): Promise<string> {
  const token = randomBytes(24).toString("hex"); // 48 caratteri hex
  await prisma.checkinTask.update({
    where: { id: checkinId },
    data: { checkinAccessToken: token },
  });
  return token;
}

/** Legge il check-in dal token pubblico — usato dalla pagina pubblica dell'assistente. */
export async function getCheckinByToken(token: string) {
  return prisma.checkinTask.findUnique({
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
}

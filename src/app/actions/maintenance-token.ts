"use server";

import { prisma } from "@/src/lib/prisma";
import { randomBytes } from "crypto";
import { updateMaintenanceStatus } from "@/src/app/actions/operational";

/** Genera (o rigenera) il token di accesso pubblico per un ticket di manutenzione. */
export async function generateMaintenanceAccessToken(ticketId: string): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await prisma.maintenanceTicket.update({
    where: { id: ticketId },
    data: { maintenanceAccessToken: token },
  });
  return token;
}

export interface MaintenanceTaskItem {
  id: string;
  label: string;
  photoRequired: boolean;
  completed: boolean;
  photoUrl: string | null;
}

/** Messaggio inviato dal manutentore dalla scheda pubblica. */
export interface MaintenancePublicMessage {
  id: string;
  text: string | null;
  senderName: string;
  createdAt: Date;
  attachment: {
    url: string;
    fileName: string;
    fileType: string | null;
  } | null;
}

/**
 * Invia una nota (testo + foto opzionale già uploadata su blob) dal manutentore.
 * Crea un Message con role "MAINTENANCE" nel sistema messaggi esistente.
 * Le foto aggiuntive vengono inviate come messaggi separati (testo vuoto).
 */
export async function sendMaintenancePublicNote(
  ticketId: string,
  text: string,
  photoUrl: string | null,
  authorName: string | null,
): Promise<MaintenancePublicMessage> {
  const senderName = authorName?.trim() || "Manutentore";

  const message = await prisma.message.create({
    data: {
      text: text.trim() || "",
      role: "MAINTENANCE",
      senderName,
      maintenanceTicketId: ticketId,
    },
  });

  let attachment = null;

  if (photoUrl) {
    const att = await prisma.attachment.create({
      data: {
        url: photoUrl,
        fileName: "foto-manutentore.jpg",
        fileType: "image/jpeg",
        size: 0,
        category: "OTHER",
        maintenanceTicketId: ticketId,
      },
    });
    await prisma.message.update({
      where: { id: message.id },
      data: { attachmentId: att.id },
    });
    attachment = { url: att.url, fileName: att.fileName, fileType: att.fileType };
  }

  return {
    id: message.id,
    text: message.text,
    senderName: message.senderName,
    createdAt: message.createdAt,
    attachment,
  };
}

/**
 * Aggiorna il progresso di un singolo task (completed + photoUrl).
 */
export async function updateMaintenanceTaskProgress(
  ticketId: string,
  taskId: string,
  completed: boolean,
  photoUrl: string | null,
): Promise<void> {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id: ticketId },
    select: { maintenanceTasks: true },
  });
  if (!ticket) throw new Error("Ticket non trovato.");

  const tasks: MaintenanceTaskItem[] = Array.isArray(ticket.maintenanceTasks)
    ? (ticket.maintenanceTasks as unknown as MaintenanceTaskItem[])
    : [];

  const updated = tasks.map(t =>
    t.id === taskId ? { ...t, completed, photoUrl: photoUrl ?? t.photoUrl } : t
  );

  await prisma.maintenanceTicket.update({
    where: { id: ticketId },
    data: { maintenanceTasks: updated as unknown as never },
  });
}

/**
 * Avvia l'intervento dalla pagina pubblica.
 * Gestisce PENDING→OPEN→IN_PROGRESS in un unico step per il manutentore.
 */
export async function startMaintenancePublic(ticketId: string): Promise<void> {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id: ticketId },
    select: { status: true },
  });
  if (!ticket) throw new Error("Ticket non trovato.");

  if (ticket.status === "PENDING") {
    await updateMaintenanceStatus(ticketId, "OPEN");
    await updateMaintenanceStatus(ticketId, "IN_PROGRESS");
  } else if (ticket.status === "OPEN") {
    await updateMaintenanceStatus(ticketId, "IN_PROGRESS");
  }
}

/**
 * Completa l'intervento dalla pagina pubblica.
 * Porta a AWAITING_REVIEW (il manager riceve notifica per revisione).
 */
export async function completeMaintenancePublic(ticketId: string): Promise<void> {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id: ticketId },
    select: { status: true },
  });
  if (!ticket) throw new Error("Ticket non trovato.");

  if (ticket.status === "IN_PROGRESS") {
    await updateMaintenanceStatus(ticketId, "AWAITING_REVIEW");
  }
}

/** Legge il ticket dal token pubblico — usato dalla pagina pubblica del manutentore. */
export async function getMaintenanceByToken(token: string) {
  return prisma.maintenanceTicket.findUnique({
    where: { maintenanceAccessToken: token },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      scheduledStart: true,
      maintenanceTasks: true,
      apartment: {
        select: { id: true, name: true, address: true },
      },
      assignedTo: { select: { name: true } },
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, fileName: true, fileType: true, url: true },
      },
      messages: {
        where: { role: "MAINTENANCE" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          text: true,
          senderName: true,
          createdAt: true,
          attachment: {
            select: { url: true, fileName: true, fileType: true },
          },
        },
      },
    },
  });
}

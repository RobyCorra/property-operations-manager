"use server";

import { prisma } from "@/src/lib/prisma";
import { randomBytes } from "crypto";
import { updateMaintenanceStatus } from "@/src/app/actions/operational";

/** Genera (o rigenera) il token di accesso pubblico per un ticket di manutenzione. */
export async function generateMaintenanceAccessToken(ticketId: string): Promise<string> {
  const token = randomBytes(24).toString("hex"); // 48 caratteri hex
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

export interface MaintenanceNote {
  id: string;
  text: string;
  photoUrls: string[];
  authorName: string | null;
  createdAt: string; // ISO string
}

/**
 * Aggiunge una nota testuale (con eventuali foto già uploadate) al ticket.
 */
export async function addMaintenanceNote(
  ticketId: string,
  text: string,
  photoUrls: string[],
  authorName: string | null,
): Promise<MaintenanceNote> {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id: ticketId },
    select: { maintenanceNotes: true },
  });
  if (!ticket) throw new Error("Ticket non trovato.");

  const existing: MaintenanceNote[] = Array.isArray(ticket.maintenanceNotes)
    ? (ticket.maintenanceNotes as unknown as MaintenanceNote[])
    : [];

  const newNote: MaintenanceNote = {
    id: randomBytes(8).toString("hex"),
    text: text.trim(),
    photoUrls,
    authorName,
    createdAt: new Date().toISOString(),
  };

  await prisma.maintenanceTicket.update({
    where: { id: ticketId },
    data: { maintenanceNotes: [...existing, newNote] as unknown as never },
  });

  return newNote;
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
    // Porta prima a OPEN, poi a IN_PROGRESS
    await updateMaintenanceStatus(ticketId, "OPEN");
    await updateMaintenanceStatus(ticketId, "IN_PROGRESS");
  } else if (ticket.status === "OPEN") {
    await updateMaintenanceStatus(ticketId, "IN_PROGRESS");
  }
  // Se già IN_PROGRESS, non fa nulla
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
      maintenanceNotes: true,
      apartment: {
        select: { id: true, name: true, address: true },
      },
      assignedTo: { select: { name: true } },
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, fileName: true, fileType: true, url: true },
      },
    },
  });
}

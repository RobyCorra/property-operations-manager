"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { setRomeTimeOnDate, preserveRomeTimeOnDate } from "@/src/lib/rome-datetime";
import { getCurrentUserId, getCurrentOrg } from "@/src/lib/tenant";
import { sendPushToRole, sendPushToUser } from "@/src/lib/push";
import type { Role } from "@/src/generated/prisma/client";

// Orario di check-in di default (ora di Roma) se non diversamente specificato.
const DEFAULT_CHECKIN_TIME = "15:00";

type CheckinChecklistSnapshotItem = {
  id: string;
  label: string;
  labelTranslations: unknown;
  required: boolean;
  photoRequired: boolean;
  completed: boolean;
  photoUrl?: string | null;
  skipped?: boolean;
};

/**
 * Calcola lo snapshot della checklist di check-in per un appartamento,
 * a partire dalle voci master (CheckinChecklistItem). Fonte separata dalle pulizie.
 */
export async function computeCheckinChecklistSnapshot(
  db: any,
  apartmentId: string
): Promise<CheckinChecklistSnapshotItem[]> {
  try {
    const items = await db.checkinChecklistItem.findMany({
      where: { apartmentId },
      orderBy: { order: "asc" },
    });
    return items.map((item: any) => ({
      id: item.id,
      label: item.label,
      labelTranslations: item.labelTranslations ?? null,
      required: item.required,
      photoRequired: item.photoRequired,
      completed: false,
    }));
  } catch (error) {
    console.error("Error computing check-in checklist snapshot:", error);
    return [];
  }
}

/**
 * Sincronizza la CheckinTask a partire da una prenotazione.
 * Relazione 1:1 (ogni prenotazione ha un solo check-in) legata alla data di check-in.
 * Auto-crea la task PENDING non assegnata; su prenotazione cancellata annulla la task PENDING.
 */
export async function syncCheckinTaskFromBooking(bookingId: string, tx?: any) {
  const db = tx || prisma;
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { apartment: true },
    });
    if (!booking) return;

    // Prenotazione cancellata → annulla la task di check-in se ancora PENDING.
    if (booking.status === "CANCELLED") {
      const existing = await db.checkinTask.findFirst({ where: { bookingId: booking.id } });
      if (existing && existing.status === "PENDING") {
        await db.checkinTask.update({
          where: { id: existing.id },
          data: { status: "CANCELLED" },
        });
      }
      return;
    }

    const checkInDate = new Date(booking.checkInDate);
    const existing = await db.checkinTask.findFirst({ where: { bookingId: booking.id } });

    if (existing) {
      // Preserva l'orario già impostato, aggiorna solo la data se cambiata.
      if (new Date(existing.date).getTime() !== preserveRomeTimeOnDate(checkInDate, existing.date).getTime()) {
        await db.checkinTask.update({
          where: { id: existing.id },
          data: { date: preserveRomeTimeOnDate(checkInDate, existing.date) },
        });
      }
      return;
    }

    const checklistProgress = await computeCheckinChecklistSnapshot(db, booking.apartmentId);
    await db.checkinTask.create({
      data: {
        apartmentId: booking.apartmentId,
        bookingId: booking.id,
        date: setRomeTimeOnDate(checkInDate, DEFAULT_CHECKIN_TIME),
        status: "PENDING",
        checklistProgress,
      },
    });
  } catch (error) {
    console.error("Error syncing check-in task from booking:", error);
  }
}

// Avanzamento stato: PENDING -> IN_PROGRESS -> COMPLETED.
export async function updateCheckinStatus(id: string, nextStatus: string) {
  const task = await prisma.checkinTask.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true } },
      apartment: { select: { name: true, organizationId: true } },
    },
  });
  if (!task) throw new Error("Check-in non trovato.");

  const transitions: Record<string, string> = {
    PENDING: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
  };
  if (transitions[task.status] !== nextStatus) {
    throw new Error(`Transizione non valida: ${task.status} -> ${nextStatus}`);
  }

  const updateData: any = { status: nextStatus };

  if (nextStatus === "IN_PROGRESS") {
    if (!task.startedAt) updateData.startedAt = new Date();
    // Auto-assegna all'assistente corrente se non pre-assegnato.
    if (!task.assignedToId) {
      const currentUserId = await getCurrentUserId();
      if (currentUserId) updateData.assignedToId = currentUserId;
    }
  }

  if (nextStatus === "COMPLETED") {
    updateData.completedAt = new Date();
  }

  await prisma.checkinTask.update({ where: { id }, data: updateData });

  // Notifica al manager al completamento.
  if (nextStatus === "COMPLETED") {
    const who = task.assignedTo?.name ?? "L'assistente";
    await sendPushToRole(
      "MANAGER" as Role,
      {
        title: `✅ Check-in completato — ${task.apartment?.name ?? "appartamento"}`,
        body: `${who} ha completato il check-in.`,
        url: "/dashboard/manager",
        tag: `checkin-done-${id}`,
      },
      "checkinCompleted",
      task.apartment?.organizationId ?? null
    ).catch(console.error);
  }

  revalidatePath("/dashboard/checkin");
  revalidatePath("/dashboard/manager");
}

// Salva le spunte/foto della checklist di check-in (array completo aggiornato).
export async function updateCheckinChecklist(
  taskId: string,
  items: { id: string; completed?: boolean; photoUrl?: string | null; skipped?: boolean }[]
) {
  const task = await prisma.checkinTask.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Check-in non trovato.");

  const current = Array.isArray(task.checklistProgress) ? (task.checklistProgress as any[]) : [];
  const updates = new Map(items.map((i) => [i.id, i]));
  const merged = current.map((item: any) => {
    const u = updates.get(item.id);
    return u ? { ...item, ...u } : item;
  });

  await prisma.checkinTask.update({
    where: { id: taskId },
    data: { checklistProgress: merged as any },
  });
  revalidatePath("/dashboard/checkin");
}

// ── Chat del check-in ────────────────────────────────────────────────────────
export async function getCheckinTaskMessages(taskId: string) {
  return await prisma.checkinTaskMessage.findMany({
    where: { checkinTaskId: taskId },
    orderBy: { createdAt: "asc" },
    include: { attachment: true },
  });
}

export async function createCheckinTaskMessage(taskId: string, prevState: any, formData: FormData) {
  const text = formData.get("text") as string;
  const role = formData.get("role") as string; // MANAGER o CHECKIN
  const senderName = formData.get("senderName") as string;
  const blobUrl = formData.get("blobUrl") as string | null;

  if (!taskId || !role || !senderName) {
    return { error: "Dati mancanti per il messaggio." };
  }
  if (!text && !blobUrl) {
    return { error: "Il messaggio non può essere vuoto." };
  }

  try {
    const message = await prisma.checkinTaskMessage.create({
      data: {
        text: text || "",
        role,
        senderName,
        checkinTaskId: taskId,
        readByManagerAt: role === "MANAGER" ? new Date() : null,
        readByWorkerAt: role !== "MANAGER" ? new Date() : null,
      },
    });

    if (blobUrl) {
      const filename = (formData.get("blobFilename") as string) ?? "allegato";
      const mimeType = (formData.get("blobMimeType") as string) ?? "application/octet-stream";
      const size = parseInt((formData.get("blobSize") as string) ?? "0", 10);
      const attachment = await prisma.attachment.create({
        data: { url: blobUrl, fileName: filename, fileType: mimeType, size, category: "OTHER", checkinTaskId: taskId },
      });
      await prisma.checkinTaskMessage.update({ where: { id: message.id }, data: { attachmentId: attachment.id } });
    }

    const task = await prisma.checkinTask.findUnique({
      where: { id: taskId },
      select: { assignedToId: true, apartment: { select: { organizationId: true } } },
    });
    const orgId = task?.apartment?.organizationId ?? null;

    if (role === "MANAGER" && task?.assignedToId) {
      await sendPushToUser(task.assignedToId, {
        title: "💬 Messaggio dal Manager",
        body: text ? `${senderName}: ${text.slice(0, 80)}` : `${senderName} ha inviato un allegato`,
        url: `/dashboard/checkin/task/${taskId}`,
        tag: `chat-checkin-${taskId}`,
      }).catch(console.error);
    } else if (role !== "MANAGER") {
      await sendPushToRole(
        "MANAGER" as Role,
        {
          title: `💬 Check-in — ${senderName}`,
          body: text ? text.slice(0, 80) : "Ha inviato un allegato",
          url: "/dashboard/manager",
          tag: `chat-checkin-${taskId}`,
        },
        "chatCheckin",
        orgId
      ).catch(console.error);
    }

    revalidatePath("/dashboard/checkin");
    revalidatePath(`/dashboard/checkin/task/${taskId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating check-in message:", error);
    return { error: "Impossibile inviare il messaggio." };
  }
}

// Assegna (o riassegna) un check-in a un assistente della stessa organizzazione.
export async function assignCheckinTask(taskId: string, assignedToId: string | null) {
  const orgId = await getCurrentOrg();
  if (!orgId) throw new Error("Organizzazione non identificata.");

  // Verifica che la task appartenga all'organizzazione corrente.
  const task = await prisma.checkinTask.findFirst({
    where: { id: taskId, apartment: { organizationId: orgId } },
    include: { apartment: { select: { name: true } } },
  });
  if (!task) throw new Error("Check-in non trovato.");

  // Se assegnato, l'utente deve essere un assistente CHECKIN della stessa org.
  if (assignedToId) {
    const user = await prisma.user.findFirst({
      where: { id: assignedToId, role: "CHECKIN", organizationId: orgId },
      select: { id: true },
    });
    if (!user) throw new Error("Assistente non valido per questa organizzazione.");
  }

  await prisma.checkinTask.update({
    where: { id: taskId },
    data: { assignedToId: assignedToId || null },
  });

  if (assignedToId) {
    await sendPushToUser(assignedToId, {
      title: "🔑 Nuovo check-in assegnato",
      body: `Hai un check-in presso ${task.apartment?.name ?? "un appartamento"}.`,
      url: "/dashboard/checkin",
      tag: "checkin-assigned",
    }).catch(console.error);
  }

  revalidatePath("/dashboard/checkin");
  revalidatePath("/dashboard/manager");
  revalidatePath(`/dashboard/manager/checkins/${taskId}`);
}

// Marca come letti dal manager i messaggi dell'assistente.
export async function markCheckinMessagesReadByManager(taskId: string) {
  try {
    await prisma.checkinTaskMessage.updateMany({
      where: { checkinTaskId: taskId, role: { not: "MANAGER" }, readByManagerAt: null },
      data: { readByManagerAt: new Date() },
    });
  } catch (e) {
    console.error("markCheckinMessagesReadByManager", e);
  }
}

// Marca come letti dall'assistente i messaggi del manager.
export async function markCheckinMessagesReadByWorker(taskId: string) {
  try {
    await prisma.checkinTaskMessage.updateMany({
      where: { checkinTaskId: taskId, role: "MANAGER", readByWorkerAt: null },
      data: { readByWorkerAt: new Date() },
    });
  } catch (e) {
    console.error("markCheckinMessagesReadByWorker", e);
  }
}

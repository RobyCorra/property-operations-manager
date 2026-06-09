"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUserId, getCurrentOrg } from "@/src/lib/tenant";
import type { Prisma } from "@/src/generated/prisma/client";
import { evaluateChecklistFormula } from "@/src/lib/formulas";
import { parseRomeDateTime, preserveRomeTimeOnDate, setRomeTimeOnDate } from "@/src/lib/rome-datetime";
import { sendPushToUser, sendPushToRole, sendPushToRoles } from "@/src/lib/push";
import type { Role } from "@/src/generated/prisma/client";

type ChecklistSnapshotItem = {
  id: string;
  label: string;
  type: string;
  value: number | null;
  required: boolean;
  completed: boolean;
  formula?: string | null;
};

type ChecklistItemRecord = {
  id: string;
  label: string;
  labelTranslations?: unknown;
  type: string;
  required: boolean;
  photoRequired: boolean;
  formula: string | null;
};

type ExistingChecklistProgressItem = Partial<ChecklistSnapshotItem> & Record<string, unknown>;

const isExistingChecklistProgressItem = (item: unknown): item is ExistingChecklistProgressItem => {
  return typeof item === "object" && item !== null;
};

const toSafePositiveInt = (value: unknown, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.max(1, Math.round(parsed));
};

const startOfDayUTC = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const isIncomingBookingForTask = (booking: { apartmentId: string; checkInDate: Date }, apartmentId: string, taskDate: Date) => {
  // Confronta solo la parte data (senza ora) per evitare falsi negativi
  // dovuti al task con orario (es. 10:00 Roma = 08:00 UTC) vs checkInDate (mezzanotte UTC)
  return booking.apartmentId === apartmentId &&
    new Date(booking.checkInDate).getTime() >= startOfDayUTC(taskDate).getTime();
};

const DEFAULT_CLEANING_TIME = "10:00";

export async function getCleaningTask(id: string) {
  return await prisma.cleaningTask.findUnique({
    where: { id },
    include: { apartment: true, assignedTo: true }
  });
}

/**
 * Helper to compute the checklist snapshot for a given apartment and date context.
 */
export async function computeChecklistSnapshot(db: any, apartmentId: string, taskDate: Date, providedNextBookingId?: string | null) {
  try {
    const apartment = await db.apartment.findUnique({
      where: { id: apartmentId },
      include: { checklistItems: { orderBy: { order: "asc" } } }
    });

  if (!apartment) return [];

  // Find incoming booking for formula context.
  let nextBooking = null;
  if (providedNextBookingId) {
    const linkedBooking = await db.booking.findUnique({
      where: { id: providedNextBookingId }
    });
    nextBooking = linkedBooking && isIncomingBookingForTask(linkedBooking, apartmentId, taskDate)
      ? linkedBooking
      : null;
  }

  if (!nextBooking) {
    nextBooking = await db.booking.findFirst({
      where: {
        apartmentId,
        checkInDate: { gte: startOfDayUTC(taskDate) },
        status: { in: ["ACTIVE", "CONFIRMED", "CHECKED_IN"] }
      },
      orderBy: { checkInDate: "asc" }
    });
  }

    const context = nextBooking ? {
      guests: toSafePositiveInt(nextBooking.totalGuests),
      bathrooms: toSafePositiveInt(apartment.bathrooms),
      bedrooms: toSafePositiveInt(apartment.bedrooms)
    } : {
      guests: 1,
      bathrooms: toSafePositiveInt(apartment.bathrooms),
      bedrooms: toSafePositiveInt(apartment.bedrooms)
    };

    return apartment.checklistItems.map((item: ChecklistItemRecord) => {
      let computedValue: number | null = null;
      if (item.type === "dynamic" && item.formula) {
        computedValue = evaluateChecklistFormula(item.formula, context);
      }

      return {
        id: item.id,
        label: item.label,
        labelTranslations: (item.labelTranslations ?? null) as Record<string, string> | null,
        type: item.type,
        value: computedValue,
        required: item.required,
        photoRequired: item.photoRequired ?? false,
        completed: false,
        formula: item.formula
      };
    });
  } catch (error) {
    console.error("Error computing checklist snapshot:", error);
    return [];
  }
}

/**
 * Shared logic to resolve the ONE cleaning task that handles a turnover.
 * It follows the rule: One Turnover Window = One Cleaning Task.
 */
async function resolveTurnoverCleaning(db: any, booking: any, targetDate: Date, flowName: string) {
    console.log(`[BOOKING->CLEANING] resolveTurnoverCleaning: Finding task for Booking=${booking.id} | Appt=${booking.apartmentId} | TargetDate=${targetDate.toISOString()} | Flow=${flowName}`);
    
    let task = await db.cleaningTask.findFirst({
      where: { bookingId: booking.id }
    });

    if (!task) {
      task = await db.cleaningTask.findFirst({
        where: {
          apartmentId: booking.apartmentId,
          bookingId: null,
          status: "PENDING",
          date: targetDate,
        }
      });
    }

    if (task) {
        task = await db.cleaningTask.update({
          where: { id: task.id },
          data: {
            apartmentId: booking.apartmentId,
            bookingId: booking.id,
            date: preserveRomeTimeOnDate(targetDate, task.date),
          }
        });
        console.log(`[BOOKING->CLEANING] resolveTurnoverCleaning: RESOLVED existing task ${task.id} (Date: ${task.date.toISOString()}) for Flow=${flowName}`);
    } else {
        // 2. Create if not found
        console.log(`[BOOKING->CLEANING] resolveTurnoverCleaning: NO task found on ${targetDate.toISOString()}. Creating new one.`);
        task = await db.cleaningTask.create({
            data: {
                apartmentId: booking.apartmentId,
                bookingId: booking.id,
                date: setRomeTimeOnDate(targetDate, DEFAULT_CLEANING_TIME),
                status: "PENDING",
                checklistProgress: []
            }
        });
        console.log(`[BOOKING->CLEANING] resolveTurnoverCleaning: CREATED task ${task.id} for Flow=${flowName}`);
    }

    return task;
}

/**
 * Core logic to synchronize a CleaningTask based on a Booking's status and dates.
 * This is the ONLY entry point for operational cleaning management.
 */
export async function syncCleaningTaskFromBooking(bookingId: string, tx?: any) {
  const db = tx || prisma;
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { apartment: true }
    });

    if (!booking) {
        console.log(`[BOOKING->CLEANING] Sync aborted: Booking ${bookingId} not found.`);
        return;
    }

    console.log(`[BOOKING->CLEANING] Starting sync for ${bookingId} | Source: ${booking.source} | Guests: ${booking.totalGuests}`);

    // 1. Handle Cancelled Booking
    if (booking.status === "CANCELLED") {
      const existingTask = await db.cleaningTask.findUnique({
        where: { bookingId: booking.id }
      });

      if (existingTask && existingTask.status === "PENDING") {
        await db.cleaningTask.update({
          where: { id: existingTask.id },
          data: { status: "CANCELLED" }
        });
      }
      return;
    }

    // 2. TARGET: THE TURNOVER (Post-Checkout)
    // Every booking is responsible for the cleaning task after its checkout.
    const checkoutDate = new Date(booking.checkOutDate);
    
    // Find/Create the transition task on the check-out date
    const turnoverTask = await resolveTurnoverCleaning(db, booking, checkoutDate, "[TURNOVER-FIX]");

    // Get old guests for logging
    const oldProgress = (turnoverTask.checklistProgress as any[]) || [];
    const oldGuestsItem = oldProgress.find(i => i.label.toLowerCase().includes("ospiti") || (i.type === "dynamic" && i.formula));
    const oldGuests = oldGuestsItem?.value || "0";

    const shouldRefreshChecklist = turnoverTask.status === "PENDING" || oldProgress.length === 0;
    const snapshot = await computeChecklistSnapshot(db, booking.apartmentId, turnoverTask.date, booking.id) as ChecklistSnapshotItem[];
    const mergedSnapshot = oldProgress.length > 0
      ? snapshot.map((newItem: any) => {
          const existingMatch = oldProgress.find(oldItem => oldItem.id === newItem.id)
            || oldProgress.find(oldItem => oldItem.label === newItem.label);

          return {
            ...newItem,
            completed: existingMatch ? !!existingMatch.completed : false
          };
        })
      : snapshot;
    
    // Extract new guests for logging
    const newGuestsItem = snapshot.find(i => i.label.toLowerCase().includes("ospiti") || (i.type === "dynamic" && i.formula));
    const newGuests = newGuestsItem?.value || booking.totalGuests;

    console.log(`[TURNOVER-FIX] Booking=${booking.id} | CheckOut=${checkoutDate.toISOString()} | Guests: ${oldGuests} -> ${newGuests}`);

    if (shouldRefreshChecklist) {
      await db.cleaningTask.update({
          where: { id: turnoverTask.id },
          data: {
            checklistProgress: mergedSnapshot
          }
      });
    }

    console.log(`[TURNOVER-FIX] Sync complete. Turnover Task ${turnoverTask.id} updated for booking ${booking.id}`);

  } catch (error) {
    console.error("Error syncing cleaning task from booking:", error);
  }
}
/**
 * Dynamically enriches a single cleaning task or an array of tasks with the next incoming booking.
 */
export async function enrichCleaningTaskWithNextBooking<T>(task: T & { apartmentId: string; date: Date }): Promise<T & { nextBooking: any }> {
  const nextBooking = await prisma.booking.findFirst({
    where: {
      apartmentId: task.apartmentId,
      checkInDate: { gte: startOfDayUTC(task.date) },
      status: { in: ["ACTIVE", "CONFIRMED", "CHECKED_IN"] }
    },
    orderBy: { checkInDate: "asc" }
  });
  return { ...task, nextBooking };
}

export async function enrichCleaningTasksWithNextBooking<T>(tasks: (T & { apartmentId: string; date: Date })[]): Promise<(T & { nextBooking: any })[]> {
  return Promise.all(tasks.map(task => enrichCleaningTaskWithNextBooking(task)));
}

export async function createCleaningTask(prevState: any, formData: FormData) {
  const apartmentId = formData.get("apartmentId") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const notes = formData.get("notes") as string;

  const effectiveTimeStr = timeStr || DEFAULT_CLEANING_TIME;

  if (!apartmentId || !dateStr) {
    return { error: "Appartamento e data sono obbligatori." };
  }

  const taskDate = parseRomeDateTime(dateStr, effectiveTimeStr);
  const checklistProgress = await computeChecklistSnapshot(prisma, apartmentId, taskDate);

  await prisma.cleaningTask.create({
    data: {
      apartmentId,
      assignedToId: assignedToId || null,
      date: taskDate,
      notes: notes || null,
      status: "PENDING",
      checklistProgress,
    },
  });

  // Push al cleaner assegnato
  if (assignedToId) {
    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { name: true } });
    await sendPushToUser(assignedToId, {
      title: "🧹 Nuova pulizia assegnata",
      body: `Hai una nuova pulizia presso ${apt?.name ?? "un appartamento"}.`,
      url: "/dashboard/cleaner",
      tag: "cleaning-assigned",
    }).catch(console.error);
  }

  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath("/dashboard/cleaner");
  redirect("/dashboard/manager/cleanings");
}

export async function updateCleaningTask(id: string, prevState: any, formData: FormData) {
  const formTaskId = formData.get("cleaningTaskId") as string;
  const targetId = id || formTaskId;
  const apartmentId = formData.get("apartmentId") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const notes = formData.get("notes") as string;
  const status = formData.get("status") as string;

  if (!targetId || !apartmentId || !dateStr || !timeStr) {
    return { error: "ID, Appartamento, data e ora sono obbligatori." };
  }

  const taskDate = parseRomeDateTime(dateStr, timeStr);

  const beforeUpdate = await prisma.cleaningTask.findUnique({
    where: { id: targetId },
    select: { id: true, date: true, apartmentId: true, assignedToId: true, notes: true, status: true }
  });

  await prisma.cleaningTask.update({
    where: { id: targetId },
    data: {
      apartmentId,
      assignedToId: assignedToId || null,
      date: taskDate,
      notes: notes || null,
      status: status || "PENDING",
    },
  });

  const afterUpdate = await prisma.cleaningTask.findUnique({
    where: { id: targetId },
    select: { id: true, date: true, apartmentId: true, assignedToId: true, notes: true, status: true }
  });

  // Push al cleaner se è stato (ri)assegnato
  const newAssignee = afterUpdate?.assignedToId;
  const oldAssignee = beforeUpdate?.assignedToId;
  if (newAssignee && newAssignee !== oldAssignee) {
    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { name: true } });
    await sendPushToUser(newAssignee, {
      title: "🧹 Nuova pulizia assegnata",
      body: `Hai una nuova pulizia presso ${apt?.name ?? "un appartamento"}.`,
      url: "/dashboard/cleaner",
      tag: "cleaning-assigned",
    }).catch(console.error);
  }

  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath("/dashboard/cleaner");
  redirect("/dashboard/manager/cleanings");
}

export async function recalculateCleaningChecklist(taskId: string) {
  const task = await prisma.cleaningTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      apartmentId: true,
      date: true,
      bookingId: true,
      checklistProgress: true,
    }
  });

  if (!task) {
    throw new Error("Pulizia non trovata.");
  }

  const snapshot = await computeChecklistSnapshot(prisma, task.apartmentId, task.date, task.bookingId) as ChecklistSnapshotItem[];
  const rawProgress = Array.isArray(task.checklistProgress) ? task.checklistProgress as unknown[] : [];
  const currentProgress = rawProgress.filter(isExistingChecklistProgressItem);

  const mergedSnapshot = snapshot.map((newItem) => {
    const existingMatch = currentProgress.find((oldItem) => oldItem.id === newItem.id)
      || currentProgress.find((oldItem) => oldItem.label === newItem.label);

    if (!existingMatch) {
      return newItem;
    }

    return {
      ...existingMatch,
      id: newItem.id,
      label: newItem.label,
      type: newItem.type,
      required: newItem.required,
      formula: newItem.formula,
      value: newItem.value,
      completed: !!existingMatch.completed,
    };
  });

  await prisma.cleaningTask.update({
    where: { id: task.id },
    data: {
      checklistProgress: mergedSnapshot,
    },
  });

  revalidatePath("/dashboard/cleaner");
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath(`/dashboard/manager/cleanings/${task.id}/edit`);
  revalidatePath("/dashboard/manager");

  return { success: true, count: mergedSnapshot.length };
}

export async function deleteCleaningTask(id: string) {
  await prisma.cleaningTask.delete({ where: { id } });
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath("/dashboard/cleaner");
}

export async function createMaintenanceTicket(prevState: any, formData: FormData) {
  const apartmentId = formData.get("apartmentId") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const scheduledStartStr = formData.get("scheduledStart") as string;
  const scheduledEndStr = formData.get("scheduledEnd") as string;

  if (!apartmentId || !title || !priority || !scheduledStartStr || !scheduledEndStr) {
    return { error: "Appartamento, titolo, priorità e date dell'intervento sono obbligatori." };
  }

  const [startDate, startTime] = scheduledStartStr.split("T");
  const [endDate, endTime] = scheduledEndStr.split("T");
  const scheduledStart = parseRomeDateTime(startDate, startTime);
  const scheduledEnd = parseRomeDateTime(endDate, endTime);

  if (scheduledEnd <= scheduledStart) {
    return { error: "La data di fine non può essere precedente o uguale alla data di inizio." };
  }

  const rawTasks = formData.get("maintenanceTasks") as string | null;
  const maintenanceTasks = rawTasks ? (() => { try { return JSON.parse(rawTasks); } catch { return []; } })() : [];

  const ticket = await prisma.maintenanceTicket.create({
    data: {
      apartmentId,
      assignedToId: assignedToId || null,
      title,
      description: description || "",
      priority,
      status: "PENDING",
      scheduledStart,
      scheduledEnd,
      maintenanceTasks,
    },
  });

  // Handle attachments if any
  const uploadResult = await uploadMaintenanceAttachment(ticket.id, formData);
  if (!uploadResult.success) {
    return { error: uploadResult.error || "Errore durante il caricamento allegato." };
  }

  const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { name: true, organizationId: true } });
  const aptOrgId = apt?.organizationId ?? null;

  // Push al tecnico assegnato
  if (assignedToId) {
    await sendPushToUser(assignedToId, {
      title: "🔧 Nuovo ticket assegnato",
      body: `"${title}" presso ${apt?.name ?? "un appartamento"}.`,
      url: "/dashboard/maintenance",
      tag: `maintenance-assigned-${ticket.id}`,
    }).catch(console.error);
  }

  // Push al manager per nuovo ticket (urgente = titolo diverso)
  await sendPushToRole("MANAGER" as Role, {
    title: priority === "URGENTE" ? "⚠️ Ticket urgente aperto" : "🔧 Nuovo ticket manutenzione",
    body: `"${title}" presso ${apt?.name ?? "un appartamento"}.`,
    url: `/dashboard/manager/maintenance/${ticket.id}/edit`,
    tag: `maintenance-new-${ticket.id}`,
  }, "maintenanceNew", aptOrgId).catch(console.error);

  revalidatePath("/dashboard/manager/maintenance");
  revalidatePath("/dashboard/maintenance");
  redirect("/dashboard/manager/maintenance");
}

export async function updateMaintenanceTicket(id: string, prevState: any, formData: FormData) {
  const apartmentId = formData.get("apartmentId") as string;
  const assignedToId = formData.get("assignedToId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const status = formData.get("status") as string;
  const scheduledStartStr = formData.get("scheduledStart") as string;
  const scheduledEndStr = formData.get("scheduledEnd") as string;

  if (!id || !apartmentId || !title || !priority || !scheduledStartStr || !scheduledEndStr) {
    return { error: "ID, Appartamento, titolo, priorità e date intervento sono obbligatori." };
  }

  const [startDate, startTime] = scheduledStartStr.split("T");
  const [endDate, endTime] = scheduledEndStr.split("T");
  const scheduledStart = parseRomeDateTime(startDate, startTime);
  const scheduledEnd = parseRomeDateTime(endDate, endTime);

  if (scheduledEnd <= scheduledStart) {
    return { error: "La data di fine non può essere precedente o uguale alla data di inizio." };
  }

  const rawTasksUpd = formData.get("maintenanceTasks") as string | null;
  const maintenanceTasksUpd = rawTasksUpd ? (() => { try { return JSON.parse(rawTasksUpd); } catch { return undefined; } })() : undefined;

  await prisma.maintenanceTicket.update({
    where: { id },
    data: {
      apartmentId,
      assignedToId: assignedToId || null,
      title,
      description: description || "",
      priority,
      status: status || "PENDING",
      scheduledStart,
      scheduledEnd,
      ...(maintenanceTasksUpd !== undefined && { maintenanceTasks: maintenanceTasksUpd }),
    },
  });

  // Handle new attachments if any
  const uploadResult = await uploadMaintenanceAttachment(id, formData);
  if (!uploadResult.success) {
    return { error: uploadResult.error || "Errore durante il caricamento allegato." };
  }

  revalidatePath("/dashboard/manager/maintenance");
  revalidatePath("/dashboard/maintenance");
  redirect("/dashboard/manager/maintenance");
}

export async function deleteMaintenanceTicket(id: string) {
  await prisma.maintenanceTicket.delete({ where: { id } });
  revalidatePath("/dashboard/manager/maintenance");
  revalidatePath("/dashboard/maintenance");
}

export async function updateCleaningStatus(id: string, nextStatus: string) {
  const task = await prisma.cleaningTask.findUnique({
    where: { id },
    include: { assignedTo: { select: { name: true } } },
  });
  if (!task) throw new Error("Task non trovata.");

  // Flusso diretto: PENDING -> IN_PROGRESS -> AWAITING_REVIEW
  const transitions: Record<string, string> = {
    "PENDING": "IN_PROGRESS",
    "IN_PROGRESS": "AWAITING_REVIEW",
  };

  if (transitions[task.status] !== nextStatus) {
    throw new Error(`Transizione non valida: ${task.status} -> ${nextStatus}`);
  }

  const updateData: {
    status: string;
    startedAt?: Date | null;
    completedAt?: Date | null;
    checklistProgress?: Prisma.InputJsonValue;
  } = { status: nextStatus };

  const currentProgress = (task.checklistProgress as any[]) || [];

  if (nextStatus === "IN_PROGRESS" && task.status === "PENDING" && currentProgress.length === 0) {
    const snapshot = await computeChecklistSnapshot(prisma, task.apartmentId, task.date, task.bookingId);
    if (snapshot.length > 0) {
      updateData.checklistProgress = snapshot;
    }
  }

  if (nextStatus === "IN_PROGRESS" && !task.startedAt) {
    updateData.startedAt = new Date();
  }

  // Auto-assegna al cleaner corrente se la pulizia non era pre-assegnata
  if (nextStatus === "IN_PROGRESS" && !task.assignedToId) {
    const currentUserId = await getCurrentUserId();
    if (currentUserId) {
      (updateData as any).assignedToId = currentUserId;
    }
  }

  if (nextStatus === "AWAITING_REVIEW") {
    updateData.completedAt = task.completedAt || new Date();

    // Validazione checklist: tutti i punti obbligatori devono essere completati
    if (task.checklistProgress) {
      const items = task.checklistProgress as any[];
      const incompleteRequired = items.filter(i => i.required && !i.completed);
      if (incompleteRequired.length > 0) {
        throw new Error(`Impossibile completare: ${incompleteRequired.length} punti obbligatori non smarcati.`);
      }
    }
  }

  await prisma.cleaningTask.update({
    where: { id },
    data: updateData,
  });

  // Quando il cleaner avvia la pulizia → notifica manager
  if (nextStatus === "IN_PROGRESS") {
    const apartment = await prisma.apartment.findUnique({
      where: { id: task.apartmentId },
      select: { name: true, organizationId: true },
    });
    const cleanerName = task.assignedTo?.name ?? "Il cleaner";
    const aptName = apartment?.name ?? "un appartamento";
    await prisma.notification.create({
      data: {
        type: "CLEANING",
        title: "🧹 Pulizia avviata",
        message: `${cleanerName} ha iniziato la pulizia presso ${aptName}.`,
        apartmentId: task.apartmentId,
      },
    });
    await sendPushToRole("MANAGER" as Role, {
      title: "🧹 Pulizia avviata",
      body: `${cleanerName} ha iniziato la pulizia presso ${aptName}.`,
      url: `/dashboard/manager/cleanings/${id}/edit`,
      tag: `cleaning-started-${id}`,
    }, "cleaningStarted", apartment?.organizationId ?? null).catch(console.error);
  }

  // Quando il cleaner invia per verifica → notifica manager E supervisor
  if (nextStatus === "AWAITING_REVIEW") {
    const apartment = await prisma.apartment.findUnique({
      where: { id: task.apartmentId },
      select: { name: true, organizationId: true },
    });
    await prisma.$transaction([
      prisma.notification.create({
        data: {
          type: "CLEANING",
          title: "🔔 Pulizia da verificare",
          message: `${task.assignedTo?.name ?? "Il cleaner"} ha completato la pulizia presso ${apartment?.name || "un appartamento"}. Richiede verifica da supervisor o manager.`,
          apartmentId: task.apartmentId,
        },
      }),
      prisma.cleaningTaskMessage.create({
        data: {
          cleaningTaskId: id,
          role: "SYSTEM",
          senderName: task.assignedTo?.name ?? "Cleaner",
          text: `⏳ ${task.assignedTo?.name ?? "Il cleaner"} ha completato la pulizia e la quality checklist. In attesa di verifica da supervisor o manager.`,
          readByManagerAt: null,
        },
      }),
    ]);
    // Push a manager e supervisor
    const cleanerName = task.assignedTo?.name ?? "Il cleaner";
    const aptName = apartment?.name ?? "un appartamento";
    await sendPushToRoles(["MANAGER" as Role, "SUPERVISOR" as Role], {
      title: "🧹 Pulizia da verificare",
      body: `${cleanerName} ha completato la pulizia presso ${aptName}.`,
      url: `/dashboard/manager/cleanings/${id}/edit`,
      tag: `cleaning-review-${id}`,
    }, "cleaningCompleted", apartment?.organizationId ?? null).catch(console.error);
  }

  revalidatePath("/dashboard/cleaner");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath(`/dashboard/manager/cleanings/${id}/edit`);
  revalidatePath("/dashboard/manager/users/history");
}

export async function submitCleaningForReview(id: string) {
  const task = await prisma.cleaningTask.findUnique({
    where: { id },
    include: { assignedTo: { select: { name: true } } },
  });
  if (!task) throw new Error("Pulizia non trovata.");
  if (task.status !== "COMPLETED") throw new Error("La pulizia deve essere completata prima di inviare per revisione.");

  const apartment = await prisma.apartment.findUnique({
    where: { id: task.apartmentId },
    select: { name: true },
  });

  await prisma.$transaction([
    prisma.cleaningTask.update({
      where: { id },
      data: { status: "AWAITING_REVIEW" },
    }),
    // Auto-message in chat to notify manager
    prisma.cleaningTaskMessage.create({
      data: {
        cleaningTaskId: id,
        role: "SYSTEM",
        senderName: task.assignedTo?.name ?? "Cleaner",
        text: `⏳ Pulizia completata e inviata per revisione — in attesa di approvazione del manager o del supervisor.`,
        readByManagerAt: null,
      },
    }),
    prisma.notification.create({
      data: {
        type: "CLEANING",
        title: "Pulizia in attesa di revisione",
        message: `La pulizia presso ${apartment?.name || "un appartamento"} è pronta per la revisione.`,
        apartmentId: task.apartmentId,
      },
    }),
  ]);

  revalidatePath("/dashboard/cleaner");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath(`/dashboard/manager/cleanings/${id}/edit`);
}

// Manager direct approval — sets APPROVED without going through the supervisor review flow
export async function approveCleaningDirectly(cleaningTaskId: string) {
  const task = await prisma.cleaningTask.findUnique({ where: { id: cleaningTaskId } });
  if (!task) throw new Error("Pulizia non trovata.");

  await prisma.cleaningTask.update({
    where: { id: cleaningTaskId },
    data: { status: "APPROVED", completedAt: task.completedAt || new Date(), correctionProgress: [] },
  });

  const apartment = await prisma.apartment.findUnique({ where: { id: task.apartmentId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      type: "CLEANING",
      title: "Pulizia approvata",
      message: `La pulizia presso ${apartment?.name || "un appartamento"} è stata approvata dal manager.`,
      apartmentId: task.apartmentId,
    },
  });

  revalidatePath("/dashboard/cleaner");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/cleanings");
}

export async function approveCleaningReview(cleaningTaskId: string, supervisorId: string) {
  const task = await prisma.cleaningTask.findUnique({ where: { id: cleaningTaskId } });
  if (!task) throw new Error("Pulizia non trovata.");
  if (task.status !== "AWAITING_REVIEW") throw new Error("La pulizia non è in attesa di revisione.");

  await prisma.$transaction([
    prisma.supervisorReview.create({
      data: { supervisorId, cleaningTaskId, decision: "APPROVED" },
    }),
    prisma.cleaningTask.update({
      where: { id: cleaningTaskId },
      data: { status: "APPROVED", completedAt: task.completedAt || new Date(), correctionProgress: [] },
    }),
  ]);

  const apartment = await prisma.apartment.findUnique({ where: { id: task.apartmentId }, select: { name: true, organizationId: true } });
  await prisma.notification.create({
    data: {
      type: "CLEANING",
      title: "Pulizia approvata",
      message: `La pulizia presso ${apartment?.name || "un appartamento"} è stata approvata.`,
      apartmentId: task.apartmentId,
    },
  });

  await sendPushToRole("MANAGER" as Role, {
    title: "✅ Pulizia approvata dal supervisor",
    body: `La pulizia presso ${apartment?.name ?? "un appartamento"} è stata approvata.`,
    url: `/dashboard/manager/cleanings/${cleaningTaskId}/edit`,
    tag: `cleaning-approved-${cleaningTaskId}`,
  }, undefined, apartment?.organizationId ?? null).catch(console.error);

  revalidatePath("/dashboard/cleaner");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/cleanings");
}

export async function rejectCleaningReview(
  cleaningTaskId: string,
  supervisorId: string,
  notes: string,
  correctionItems: { id: string; label: string; note: string; requiresPhoto: boolean }[]
) {
  const task = await prisma.cleaningTask.findUnique({ where: { id: cleaningTaskId } });
  if (!task) throw new Error("Pulizia non trovata.");
  if (task.status !== "AWAITING_REVIEW") throw new Error("La pulizia non è in attesa di revisione.");

  const correctionProgress = correctionItems.map(item => ({
    ...item,
    completed: false,
    photoUrl: null,
  }));

  await prisma.$transaction([
    prisma.supervisorReview.create({
      data: { supervisorId, cleaningTaskId, decision: "REJECTED", notes, correctionItems },
    }),
    prisma.cleaningTask.update({
      where: { id: cleaningTaskId },
      data: { status: "IN_PROGRESS", correctionProgress },
    }),
  ]);

  const apartment = await prisma.apartment.findUnique({ where: { id: task.apartmentId }, select: { name: true, organizationId: true } });
  await prisma.notification.create({
    data: {
      type: "CLEANING",
      title: "Pulizia rifiutata",
      message: `La pulizia presso ${apartment?.name || "un appartamento"} richiede correzioni.`,
      apartmentId: task.apartmentId,
    },
  });

  await sendPushToRole("MANAGER" as Role, {
    title: "⚠️ Pulizia richiede correzioni",
    body: `Il supervisor ha richiesto correzioni per la pulizia presso ${apartment?.name ?? "un appartamento"}.`,
    url: `/dashboard/manager/cleanings/${cleaningTaskId}/edit`,
    tag: `cleaning-rejected-${cleaningTaskId}`,
  }, undefined, apartment?.organizationId ?? null).catch(console.error);

  revalidatePath("/dashboard/cleaner");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/cleanings");
}

export async function resolveCleaningCorrections(
  cleaningTaskId: string,
  resolvedItems: { id: string; completed: boolean; photoUrl: string | null }[]
) {
  const task = await prisma.cleaningTask.findUnique({ where: { id: cleaningTaskId } });
  if (!task) throw new Error("Pulizia non trovata.");
  if (task.status !== "IN_PROGRESS") throw new Error("La pulizia non è in stato corretto per inviare correzioni.");

  const currentProgress = (task.correctionProgress as { id: string; label: string; note: string; requiresPhoto: boolean; completed: boolean; photoUrl: string | null }[]) || [];

  // Merge resolved state into existing progress
  const updatedProgress = currentProgress.map(item => {
    const resolved = resolvedItems.find(r => r.id === item.id);
    if (!resolved) return item;
    return { ...item, completed: resolved.completed, photoUrl: resolved.photoUrl ?? item.photoUrl };
  });

  // Validate: all items must be completed, and requiresPhoto items must have a photoUrl
  for (const item of updatedProgress) {
    if (!item.completed) throw new Error(`Segna come risolto: "${item.label}"`);
    if (item.requiresPhoto && !item.photoUrl) throw new Error(`Foto obbligatoria per: "${item.label}"`);
  }

  await prisma.cleaningTask.update({
    where: { id: cleaningTaskId },
    data: { status: "AWAITING_REVIEW", correctionProgress: updatedProgress },
  });

  revalidatePath("/dashboard/cleaner");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
}

export async function updateMaintenanceStatus(id: string, nextStatus: string) {
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id },
    include: { assignedTo: { select: { name: true } } },
  });
  if (!ticket) throw new Error("Ticket non trovato.");

  // Flusso: PENDING -> IN_PROGRESS -> AWAITING_REVIEW
  const transitions: Record<string, string> = {
    "PENDING": "IN_PROGRESS",
    "IN_PROGRESS": "AWAITING_REVIEW",
  };

  if (transitions[ticket.status] !== nextStatus) {
    throw new Error(`Transizione non valida: ${ticket.status} -> ${nextStatus}`);
  }

  const data: any = { status: nextStatus };
  if (nextStatus === "IN_PROGRESS") {
    data.startedAt = ticket.startedAt || new Date();
    // Auto-assegna al tecnico corrente se il ticket non era pre-assegnato
    if (!ticket.assignedToId) {
      const currentUserId = await getCurrentUserId();
      if (currentUserId) data.assignedToId = currentUserId;
    }
  }
  if (nextStatus === "AWAITING_REVIEW") {
    data.resolvedAt = ticket.resolvedAt || new Date();
  }

  await prisma.maintenanceTicket.update({ where: { id }, data });

  // Quando il tecnico avvia il ticket → notifica manager
  if (nextStatus === "IN_PROGRESS") {
    const apartment = await prisma.apartment.findUnique({
      where: { id: ticket.apartmentId },
      select: { name: true, organizationId: true },
    });
    const techName = ticket.assignedTo?.name ?? "Il tecnico";
    const aptName = apartment?.name ?? "un appartamento";
    await sendPushToRole("MANAGER" as Role, {
      title: "🔧 Intervento avviato",
      body: `${techName} ha avviato "${ticket.title}" presso ${aptName}.`,
      url: `/dashboard/manager/maintenance/${id}/edit`,
      tag: `maintenance-started-${id}`,
    }, "maintenanceStarted", apartment?.organizationId ?? null).catch(console.error);
  }

  // Quando il tecnico termina → notifica manager E supervisor + messaggio in chat
  if (nextStatus === "AWAITING_REVIEW") {
    const apartment = await prisma.apartment.findUnique({
      where: { id: ticket.apartmentId },
      select: { name: true, organizationId: true },
    });
    await prisma.$transaction([
      prisma.notification.create({
        data: {
          type: "MAINTENANCE",
          title: "🔔 Manutenzione da verificare",
          message: `${ticket.assignedTo?.name ?? "Il tecnico"} ha completato l'intervento "${ticket.title}" presso ${apartment?.name || "un appartamento"}. Richiede verifica da supervisor o manager.`,
          apartmentId: ticket.apartmentId,
        },
      }),
      prisma.message.create({
        data: {
          maintenanceTicketId: id,
          role: "SYSTEM",
          senderName: ticket.assignedTo?.name ?? "Tecnico",
          text: `⏳ ${ticket.assignedTo?.name ?? "Il tecnico"} ha completato l'intervento "${ticket.title}". In attesa di verifica da supervisor o manager.`,
        },
      }),
    ]);
    // Push a manager e supervisor
    const techName = ticket.assignedTo?.name ?? "Il tecnico";
    const aptName = apartment?.name ?? "un appartamento";
    await sendPushToRoles(["MANAGER" as Role, "SUPERVISOR" as Role], {
      title: "🔧 Ticket finito — da verificare",
      body: `${techName} ha completato "${ticket.title}" presso ${aptName}.`,
      url: `/dashboard/manager/maintenance/${id}/edit`,
      tag: `maintenance-review-${id}`,
    }, undefined, apartment?.organizationId ?? null).catch(console.error);
  }

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager/maintenance");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/users/history");
}

export async function submitMaintenanceForReview(id: string) {
  const ticket = await prisma.maintenanceTicket.findUnique({ where: { id } });
  if (!ticket) throw new Error("Ticket non trovato.");
  if (ticket.status !== "RESOLVED") throw new Error("Il ticket deve essere risolto prima di inviare per revisione.");

  await prisma.maintenanceTicket.update({
    where: { id },
    data: { status: "AWAITING_REVIEW" },
  });

  const apartment = await prisma.apartment.findUnique({ where: { id: ticket.apartmentId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      type: "MAINTENANCE",
      title: "Manutenzione in attesa di revisione",
      message: `Il ticket "${ticket.title}" presso ${apartment?.name || "un appartamento"} è pronto per la revisione.`,
      apartmentId: ticket.apartmentId,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/maintenance");
}

// Manager direct approval — sets APPROVED without going through the supervisor review flow
export async function approveMaintenanceDirectly(maintenanceTicketId: string) {
  const ticket = await prisma.maintenanceTicket.findUnique({ where: { id: maintenanceTicketId } });
  if (!ticket) throw new Error("Ticket non trovato.");

  await prisma.maintenanceTicket.update({
    where: { id: maintenanceTicketId },
    data: { status: "APPROVED", resolvedAt: ticket.resolvedAt || new Date(), correctionProgress: [] },
  });

  const apartment = await prisma.apartment.findUnique({ where: { id: ticket.apartmentId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      type: "MAINTENANCE",
      title: "Manutenzione approvata",
      message: `Il ticket "${ticket.title}" presso ${apartment?.name || "un appartamento"} è stato approvato dal manager.`,
      apartmentId: ticket.apartmentId,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/maintenance");
}

export async function approveMaintenanceReview(maintenanceTicketId: string, supervisorId: string) {
  const ticket = await prisma.maintenanceTicket.findUnique({ where: { id: maintenanceTicketId } });
  if (!ticket) throw new Error("Ticket non trovato.");
  if (ticket.status !== "AWAITING_REVIEW") throw new Error("Il ticket non è in attesa di revisione.");

  await prisma.$transaction([
    prisma.supervisorReview.create({
      data: { supervisorId, maintenanceTicketId, decision: "APPROVED" },
    }),
    prisma.maintenanceTicket.update({
      where: { id: maintenanceTicketId },
      data: { status: "APPROVED", resolvedAt: ticket.resolvedAt || new Date(), correctionProgress: [] },
    }),
  ]);

  const apartment = await prisma.apartment.findUnique({ where: { id: ticket.apartmentId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      type: "MAINTENANCE",
      title: "Manutenzione approvata",
      message: `Il ticket "${ticket.title}" presso ${apartment?.name || "un appartamento"} è stato approvato.`,
      apartmentId: ticket.apartmentId,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/maintenance");
}

export async function rejectMaintenanceReview(
  maintenanceTicketId: string,
  supervisorId: string,
  notes: string,
  correctionItems: { id: string; label: string; note: string; requiresPhoto: boolean }[]
) {
  const ticket = await prisma.maintenanceTicket.findUnique({ where: { id: maintenanceTicketId } });
  if (!ticket) throw new Error("Ticket non trovato.");
  if (ticket.status !== "AWAITING_REVIEW") throw new Error("Il ticket non è in attesa di revisione.");

  const correctionProgress = correctionItems.map(item => ({
    ...item,
    completed: false,
    photoUrl: null,
  }));

  await prisma.$transaction([
    prisma.supervisorReview.create({
      data: { supervisorId, maintenanceTicketId, decision: "REJECTED", notes, correctionItems },
    }),
    prisma.maintenanceTicket.update({
      where: { id: maintenanceTicketId },
      data: { status: "IN_PROGRESS", correctionProgress },
    }),
  ]);

  const apartment = await prisma.apartment.findUnique({ where: { id: ticket.apartmentId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      type: "MAINTENANCE",
      title: "Manutenzione rifiutata",
      message: `Il ticket "${ticket.title}" presso ${apartment?.name || "un appartamento"} richiede correzioni.`,
      apartmentId: ticket.apartmentId,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard/supervisor");
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/maintenance");
}

export async function reopenMaintenanceTicket(id: string) {
  const cookieStore = await cookies();
  if (cookieStore.get("role")?.value !== "MANAGER") {
    throw new Error("Operazione consentita solo ai manager.");
  }

  const ticket = await prisma.maintenanceTicket.findUnique({ where: { id } });
  if (!ticket) throw new Error("Ticket non trovato.");
  if (ticket.status !== "RESOLVED") {
    throw new Error(`Transizione non valida: ${ticket.status} -> PENDING`);
  }

  await prisma.maintenanceTicket.update({
    where: { id },
    data: {
      status: "PENDING",
      resolvedAt: null,
    },
  });

  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard/manager/maintenance");
  revalidatePath(`/dashboard/manager/maintenance/${id}/edit`);
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/users/history");
}

import { uploadMaintenanceAttachment, uploadCleaningAttachment } from "./upload";

export async function resolveMaintenanceTicket(id: string, formData: FormData) {
  try {
    // 1. Upload attachments
    const uploadResult = await uploadMaintenanceAttachment(id, formData);
    if (!uploadResult.success) {
      return { error: uploadResult.error || "Errore durante il caricamento allegato." };
    }
    
    // 2. Update status
    await updateMaintenanceStatus(id, "AWAITING_REVIEW");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error resolving ticket:", error);
    return { error: error.message || "Errore durante la risoluzione del ticket." };
  }
}

export async function createTicketMessage(ticketId: string, prevState: any, formData: FormData) {
  const text = formData.get("text") as string;
  const role = formData.get("role") as string; // MANAGER or MAINTENANCE
  const senderName = formData.get("senderName") as string;

  if (!ticketId || !role || !senderName) {
    return { error: "Dati mancanti per il messaggio." };
  }

  const blobUrl = formData.get("blobUrl") as string | null;
  if (!text && !blobUrl && !(formData.get("files") as File)?.size) {
    return { error: "Il messaggio non può essere vuoto." };
  }

  try {
    const message = await prisma.message.create({
      data: {
        text: text || "",
        role: role,
        senderName: senderName,
        maintenanceTicketId: ticketId,
      },
    });

    if (blobUrl) {
      const filename = formData.get("blobFilename") as string ?? "allegato";
      const mimeType = formData.get("blobMimeType") as string ?? "application/octet-stream";
      const size = parseInt(formData.get("blobSize") as string ?? "0", 10);
      const attachment = await prisma.attachment.create({
        data: { url: blobUrl, fileName: filename, fileType: mimeType, size, category: "OTHER", maintenanceTicketId: ticketId },
      });
      await prisma.message.update({ where: { id: message.id }, data: { attachmentId: attachment.id } });
    } else {
      const uploadResult = await uploadMaintenanceAttachment(ticketId, formData, { messageId: message.id });
      if (!uploadResult.success) {
        await prisma.message.delete({ where: { id: message.id } });
        return { error: uploadResult.error || "Errore durante il caricamento allegato." };
      }
    }

    // Push al destinatario del messaggio
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      select: { assignedToId: true, title: true, apartment: { select: { organizationId: true } } },
    });
    const orgIdMaint = ticket?.apartment?.organizationId ?? null;
    if (role === "MANAGER" && ticket?.assignedToId) {
      // Manager scrive al tecnico
      await sendPushToUser(ticket.assignedToId, {
        title: `💬 Messaggio da Manager`,
        body: text ? `${senderName}: ${text.slice(0, 80)}` : `${senderName} ha inviato un allegato`,
        url: `/dashboard/maintenance`,
        tag: `chat-maintenance-${ticketId}`,
      }).catch(console.error);
    } else if (role !== "MANAGER") {
      // Tecnico scrive al manager
      await sendPushToRole("MANAGER" as Role, {
        title: `💬 Messaggio da ${senderName}`,
        body: text ? text.slice(0, 80) : "Ha inviato un allegato",
        url: `/dashboard/manager/maintenance/${ticketId}/edit`,
        tag: `chat-maintenance-${ticketId}`,
      }, "chatMaintenance", orgIdMaint).catch(console.error);
    }

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/manager/maintenance");
    revalidatePath(`/dashboard/manager/maintenance/${ticketId}/edit`);
    revalidatePath("/dashboard/manager"); // Aggiorna il badge nella navbar
    return { success: true };
  } catch (error: any) {
    console.error("Error creating message:", error);
    return { error: "Impossibile inviare il messaggio." };
  }
}

export async function createCleaningTaskMessage(taskId: string, prevState: any, formData: FormData) {
  const text = formData.get("text") as string;
  const role = formData.get("role") as string; // MANAGER or CLEANER
  const senderName = formData.get("senderName") as string;

  if (!taskId || !role || !senderName) {
    return { error: "Dati mancanti per il messaggio." };
  }

  const blobUrl = formData.get("blobUrl") as string | null;
  if (!text && !blobUrl && !(formData.get("files") as File)?.size) {
    return { error: "Il messaggio non può essere vuoto." };
  }

  try {
    const message = await prisma.cleaningTaskMessage.create({
      data: {
        text: text || "",
        role: role,
        senderName: senderName,
        cleaningTaskId: taskId,
        readByManagerAt: null,
      },
    });

    if (blobUrl) {
      const filename = formData.get("blobFilename") as string ?? "allegato";
      const mimeType = formData.get("blobMimeType") as string ?? "application/octet-stream";
      const size = parseInt(formData.get("blobSize") as string ?? "0", 10);
      const attachment = await prisma.attachment.create({
        data: { url: blobUrl, fileName: filename, fileType: mimeType, size, category: "OTHER", cleaningTaskId: taskId },
      });
      await prisma.cleaningTaskMessage.update({ where: { id: message.id }, data: { attachmentId: attachment.id } });
    } else {
      const uploadResult = await uploadCleaningAttachment(taskId, formData, { messageId: message.id });
      if (!uploadResult.success) {
        await prisma.cleaningTaskMessage.delete({ where: { id: message.id } });
        return { error: uploadResult.error || "Errore durante il caricamento allegato." };
      }
    }

    // Push al destinatario del messaggio
    const task = await prisma.cleaningTask.findUnique({
      where: { id: taskId },
      select: { assignedToId: true, apartment: { select: { organizationId: true } } },
    });
    const orgId = task?.apartment?.organizationId ?? null;
    if (role === "MANAGER" && task?.assignedToId) {
      // Manager scrive al cleaner
      await sendPushToUser(task.assignedToId, {
        title: `💬 Messaggio da Manager`,
        body: text ? `${senderName}: ${text.slice(0, 80)}` : `${senderName} ha inviato un allegato`,
        url: `/dashboard/cleaner/task/${taskId}`,
        tag: `chat-cleaning-${taskId}`,
      }).catch(console.error);
    } else if (role !== "MANAGER") {
      // Cleaner scrive al manager
      await sendPushToRole("MANAGER" as Role, {
        title: `💬 Messaggio da ${senderName}`,
        body: text ? text.slice(0, 80) : "Ha inviato un allegato",
        url: `/dashboard/manager/cleanings/${taskId}/edit`,
        tag: `chat-cleaning-${taskId}`,
      }, "chatCleaner", orgId).catch(console.error);
    }

    revalidatePath("/dashboard/cleaner");
    revalidatePath("/dashboard/manager/cleanings");
    revalidatePath(`/dashboard/manager/cleanings/${taskId}/edit`);
    revalidatePath("/dashboard/manager"); // Aggiorna il badge nella navbar
    return { success: true };
  } catch (error: any) {
    console.error("Error creating message:", error);
    return { error: "Impossibile inviare il messaggio." };
  }
}

export async function getCleaningTaskMessages(taskId: string) {
  return await prisma.cleaningTaskMessage.findMany({
    where: { cleaningTaskId: taskId },
    orderBy: { createdAt: "asc" },
    include: { attachment: true }
  });
}

export async function getApartmentBookings(apartmentId: string) {
  return await prisma.booking.findMany({
    where: { apartmentId, status: { not: "CANCELLED" } },
    orderBy: { checkInDate: "asc" },
  });
}

export async function getApartmentSchedule(apartmentId: string) {
  const [bookings, cleanings, tickets] = await Promise.all([
    prisma.booking.findMany({
      where: { apartmentId, status: { not: "CANCELLED" } },
      orderBy: { checkInDate: "asc" },
    }),
    prisma.cleaningTask.findMany({
      where: { apartmentId, status: { not: "CANCELLED" } },
      orderBy: { date: "asc" },
    }),
    prisma.maintenanceTicket.findMany({
      where: { apartmentId, status: { not: "RESOLVED" } },
      orderBy: { scheduledStart: "asc" },
    }),
  ]);

  return { bookings, cleanings, tickets };
}

// ── AI Action Execution ────────────────────────────────────────────────────
export type AIActionPayload =
  | { type: "CREATE_BOOKING"; apartmentName: string; checkInDate: string; checkOutDate: string; totalGuests: number; guestName?: string; description: string }
  | { type: "CREATE_CLEANING"; apartmentName: string; date: string; assignedToName?: string; notes?: string; description: string }
  | { type: "CREATE_TICKET"; apartmentName: string; title: string; ticketDescription?: string; priority: string; scheduledStart?: string; assignedToName?: string; description: string }
  | { type: "UPDATE_BOOKING"; apartmentName: string; checkInDate: string; fields: Partial<{ guestName: string; totalGuests: number; checkInDate: string; checkOutDate: string; notes: string }>; description: string }
  | { type: "UPDATE_CLEANING"; id: string; fields: Partial<{ date: string; notes: string; assignedToName: string }>; description: string }
  | { type: "UPDATE_TICKET"; id: string; fields: Partial<{ title: string; description: string; priority: string; scheduledStart: string; notes: string; status: string; assignedToName: string }>; description: string }
  | { type: "BULK_ASSIGN_CLEANINGS_BY_FILTER"; apartmentIds: string[]; dateFrom: string; dateTo: string; assignedToName: string; unassignedOnly?: boolean; description: string }
  | { type: "PURGE_CANCELLED"; description: string };

export async function executeAIAction(payload: AIActionPayload): Promise<{ success: boolean; error?: string }> {
  try {
    if (payload.type === "CREATE_BOOKING") {
      const { apartmentName, checkInDate, checkOutDate, totalGuests, guestName } = payload;
      const apartment = await prisma.apartment.findFirst({
        where: { name: { equals: apartmentName, mode: "insensitive" } },
        select: { id: true },
      });
      if (!apartment) return { success: false, error: `Appartamento non trovato: "${apartmentName}".` };
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      // Verifica conflitti
      const conflict = await prisma.booking.findFirst({
        where: {
          apartmentId: apartment.id,
          status: { not: "CANCELLED" },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      });
      if (conflict) return { success: false, error: `Conflitto con prenotazione esistente: ${conflict.checkInDate.toISOString().slice(0, 10)} → ${conflict.checkOutDate.toISOString().slice(0, 10)}.` };
      const newBooking = await prisma.booking.create({
        data: {
          apartmentId: apartment.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          totalGuests: Number(totalGuests),
          guestName: guestName || null,
          source: "MANUAL",
          status: "CONFIRMED",
        },
      });
      // Crea pulizia associata
      await prisma.cleaningTask.create({
        data: {
          apartmentId: apartment.id,
          bookingId: newBooking.id,
          date: checkOut,
          status: "PENDING",
        },
      });
      revalidatePath("/dashboard/manager");
      revalidatePath("/dashboard/manager/bookings");
    } else if (payload.type === "CREATE_CLEANING") {
      const { apartmentName, date, assignedToName, notes } = payload;
      const apartment = await prisma.apartment.findFirst({
        where: { name: { equals: apartmentName, mode: "insensitive" } },
        select: { id: true },
      });
      if (!apartment) return { success: false, error: `Appartamento non trovato: "${apartmentName}".` };
      let assignedToId: string | undefined;
      if (assignedToName) {
        const user = await prisma.user.findFirst({
          where: { name: { contains: assignedToName, mode: "insensitive" } },
          select: { id: true },
        });
        if (!user) return { success: false, error: `Cleaner non trovato: "${assignedToName}".` };
        assignedToId = user.id;
      }
      await prisma.cleaningTask.create({
        data: {
          apartmentId: apartment.id,
          date: new Date(date),
          status: "PENDING",
          ...(assignedToId && { assignedToId }),
          ...(notes && { notes }),
        },
      });
      revalidatePath("/dashboard/manager");
      revalidatePath("/dashboard/manager/cleanings");
    } else if (payload.type === "CREATE_TICKET") {
      const { apartmentName, title, ticketDescription, priority, scheduledStart, assignedToName } = payload;
      const apartment = await prisma.apartment.findFirst({
        where: { name: { equals: apartmentName, mode: "insensitive" } },
        select: { id: true },
      });
      if (!apartment) return { success: false, error: `Appartamento non trovato: "${apartmentName}".` };
      let assignedToId: string | undefined;
      if (assignedToName) {
        const user = await prisma.user.findFirst({
          where: { name: { contains: assignedToName, mode: "insensitive" } },
          select: { id: true },
        });
        if (!user) return { success: false, error: `Tecnico non trovato: "${assignedToName}".` };
        assignedToId = user.id;
      }
      await prisma.maintenanceTicket.create({
        data: {
          apartmentId: apartment.id,
          title,
          description: ticketDescription || "",
          priority: (priority as any) || "MEDIUM",
          status: "PENDING",
          ...(scheduledStart && { scheduledStart: new Date(scheduledStart) }),
          ...(assignedToId && { assignedToId }),
        },
      });
      revalidatePath("/dashboard/manager");
      revalidatePath("/dashboard/manager/maintenance");
    } else if (payload.type === "UPDATE_BOOKING") {
      const { apartmentName, checkInDate, fields } = payload;
      // Cerca appartamento per nome (case-insensitive) — evita UUID che l'AI storpia
      const apartment = await prisma.apartment.findFirst({
        where: { name: { equals: apartmentName, mode: "insensitive" } },
        select: { id: true },
      });
      if (!apartment) return { success: false, error: `Appartamento non trovato: "${apartmentName}".` };
      // Cerca la prenotazione per apartmentId + giorno del check-in (indipendente dall'ora)
      const checkIn = new Date(checkInDate);
      const dayStart = new Date(Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate(), 0, 0, 0));
      const dayEnd = new Date(Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate(), 23, 59, 59));
      const booking = await prisma.booking.findFirst({
        where: { apartmentId: apartment.id, checkInDate: { gte: dayStart, lte: dayEnd } },
      });
      if (!booking) return { success: false, error: `Prenotazione non trovata in "${apartmentName}" il ${dayStart.toISOString().slice(0, 10)}.` };
      // Filtra i campi placeholder ("..." o stringa vuota) per non sovrascrivere valori reali
      const isReal = (v: unknown) => v !== undefined && v !== "..." && v !== "";
      const isManual = booking.source === "MANUAL";
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          // Campi operativi: consentiti per tutte le fonti
          ...(fields.totalGuests !== undefined && { totalGuests: Number(fields.totalGuests) }),
          ...(isReal(fields.notes) && { notes: fields.notes }),
          // Campi anagrafici/date: solo per prenotazioni manuali
          ...(isManual && isReal(fields.guestName) && { guestName: fields.guestName }),
          ...(isManual && isReal(fields.checkInDate) && { checkInDate: new Date(fields.checkInDate!) }),
          ...(isManual && isReal(fields.checkOutDate) && { checkOutDate: new Date(fields.checkOutDate!) }),
        },
      });
      revalidatePath("/dashboard/manager");
      revalidatePath("/dashboard/manager/bookings");
    } else if (payload.type === "UPDATE_CLEANING") {
      const { id, fields } = payload;
      const task = await prisma.cleaningTask.findUnique({ where: { id } });
      if (!task) return { success: false, error: "Pulizia non trovata." };
      let resolvedAssignedToId: string | undefined;
      if (fields.assignedToName) {
        const user = await prisma.user.findFirst({
          where: { name: { contains: fields.assignedToName, mode: "insensitive" } },
          select: { id: true },
        });
        if (!user) return { success: false, error: `Cleaner non trovato: "${fields.assignedToName}".` };
        resolvedAssignedToId = user.id;
      }
      await prisma.cleaningTask.update({
        where: { id },
        data: {
          ...(fields.date !== undefined && { date: new Date(fields.date) }),
          ...(fields.notes !== undefined && { notes: fields.notes }),
          ...(resolvedAssignedToId && { assignedToId: resolvedAssignedToId }),
        },
      });
      revalidatePath("/dashboard/manager");
      revalidatePath("/dashboard/manager/cleanings");
    } else if (payload.type === "UPDATE_TICKET") {
      const { id, fields } = payload;
      const ticket = await prisma.maintenanceTicket.findUnique({ where: { id } });
      if (!ticket) return { success: false, error: "Ticket non trovato." };
      let assignedToId: string | undefined;
      if (fields.assignedToName) {
        const user = await prisma.user.findFirst({
          where: { name: { contains: fields.assignedToName, mode: "insensitive" } },
          select: { id: true },
        });
        if (!user) return { success: false, error: `Tecnico non trovato: "${fields.assignedToName}".` };
        assignedToId = user.id;
      }
      await prisma.maintenanceTicket.update({
        where: { id },
        data: {
          ...(fields.title !== undefined && { title: fields.title }),
          ...(fields.description !== undefined && { description: fields.description }),
          ...(fields.priority !== undefined && { priority: fields.priority as any }),
          ...(fields.scheduledStart !== undefined && { scheduledStart: new Date(fields.scheduledStart) }),
          ...(fields.notes !== undefined && { notes: fields.notes }),
          ...(fields.status !== undefined && { status: fields.status }),
          ...(assignedToId !== undefined && { assignedToId }),
        },
      });
      revalidatePath("/dashboard/manager");
      revalidatePath("/dashboard/manager/maintenance");
    } else if (payload.type === "BULK_ASSIGN_CLEANINGS_BY_FILTER") {
      const { apartmentIds, dateFrom, dateTo, assignedToName, unassignedOnly } = payload;
      const user = await prisma.user.findFirst({
        where: { name: { contains: assignedToName, mode: "insensitive" } },
      });
      if (!user) return { success: false, error: `Cleaner non trovato: "${assignedToName}".` };
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      const result = await prisma.cleaningTask.updateMany({
        where: {
          ...(apartmentIds.length > 0 ? { apartmentId: { in: apartmentIds } } : {}),
          date: { gte: from, lte: to },
          status: { notIn: ["CANCELLED", "APPROVED"] },
          ...(unassignedOnly ? { assignedToId: null } : {}),
        },
        data: { assignedToId: user.id },
      });
      if (result.count === 0) return { success: false, error: "Nessuna pulizia trovata con i filtri specificati." };
      revalidatePath("/dashboard/manager");
      revalidatePath("/dashboard/manager/cleanings");
    } else if (payload.type === "PURGE_CANCELLED") {
      // Delete cancelled cleaning tasks first (FK dependency)
      const deletedCleanings = await prisma.cleaningTask.deleteMany({
        where: { status: "CANCELLED" },
      });
      // Delete cancelled bookings
      const deletedBookings = await prisma.booking.deleteMany({
        where: { status: "CANCELLED" },
      });
      // Revalida tutto prima di restituire il messaggio di riepilogo
      revalidatePath("/", "layout");
      return {
        success: true,
        error: `Eliminati: ${deletedCleanings.count} pulizie cancellate, ${deletedBookings.count} prenotazioni cancellate.`,
      };
    }
    // Invalida l'intero albero di route — garantisce aggiornamento immediato
    // su qualsiasi pagina il manager si trovi, senza bisogno di refresh manuale.
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("[executeAIAction]", err);
    return { success: false, error: err.message || "Errore durante l'aggiornamento." };
  }
}

// ── Mark cleaning task messages as read by worker ────────────────────────────
export async function markCleaningMessagesReadByWorker(taskId: string) {
  // Chiamata da Server Component (page render) — no revalidatePath permesso lì.
  // La dashboard cleaner è server-rendered fresh ad ogni visita, nessuna cache da invalidare.
  await prisma.cleaningTaskMessage.updateMany({
    where: {
      cleaningTaskId: taskId,
      role: "MANAGER",
      readByWorkerAt: null,
    },
    data: { readByWorkerAt: new Date() },
  });
}

// ── Mark maintenance messages as read by worker ──────────────────────────────
export async function markMaintenanceMessagesReadByWorker(ticketId: string) {
  // Chiamata da Client Component (useEffect) — revalidatePath è OK qui.
  await prisma.message.updateMany({
    where: {
      maintenanceTicketId: ticketId,
      role: "MANAGER",
      readByWorkerAt: null,
    },
    data: { readByWorkerAt: new Date() },
  });
  revalidatePath("/dashboard/maintenance");
}

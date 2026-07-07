"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import { translateLabel } from "@/src/lib/translate";
import { computeCheckinChecklistSnapshot, syncCheckinTaskFromBooking } from "./checkin";

// Sincronizza i check-in dell'appartamento: crea quelli mancanti per le
// prenotazioni non cancellate da oggi in poi. Idempotente (nessun duplicato).
export async function syncApartmentCheckins(apartmentId: string) {
  const orgId = await getCurrentOrg();
  if (!orgId) throw new Error("Organizzazione non identificata.");

  const apt = await prisma.apartment.findFirst({
    where: { id: apartmentId, organizationId: orgId },
    select: { id: true },
  });
  if (!apt) throw new Error("Appartamento non trovato.");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: { apartmentId, status: { not: "CANCELLED" }, checkInDate: { gte: todayStart } },
    select: { id: true },
  });

  const before = await prisma.checkinTask.count({ where: { apartmentId, status: { not: "CANCELLED" } } });
  for (const b of bookings) {
    await syncCheckinTaskFromBooking(b.id);
  }
  const after = await prisma.checkinTask.count({ where: { apartmentId, status: { not: "CANCELLED" } } });

  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checkin-checklist`);
  revalidatePath("/dashboard/manager");
  return { processed: bookings.length, created: Math.max(0, after - before) };
}

// Rigenera lo snapshot della checklist per le CheckinTask PENDING dell'appartamento,
// preservando le spunte già fatte (match per id, poi per label).
async function syncPendingCheckinTasks(apartmentId: string) {
  const tasks = await prisma.checkinTask.findMany({
    where: { apartmentId, status: "PENDING" },
  });
  if (tasks.length === 0) return;
  const fresh = await computeCheckinChecklistSnapshot(prisma, apartmentId);
  for (const task of tasks) {
    const old = Array.isArray(task.checklistProgress) ? (task.checklistProgress as any[]) : [];
    const byId = new Map(old.filter(i => i?.id).map(i => [i.id, i]));
    const byLabel = new Map(old.map(i => [i?.label, i]));
    const merged = fresh.map(item => {
      const prev = byId.get(item.id) || byLabel.get(item.label);
      return prev
        ? { ...item, completed: !!prev.completed, photoUrl: prev.photoUrl ?? null, skipped: !!prev.skipped }
        : item;
    });
    await prisma.checkinTask.update({
      where: { id: task.id },
      data: { checklistProgress: merged as any },
    });
  }
}

// Attiva/disattiva il self check-in per un appartamento.
// Attivo: nessun check-in assistente → annulla i check-in non completati.
// Disattivato: ricrea i check-in per le prenotazioni future non cancellate.
export async function updateAutoCheckin(apartmentId: string, enabled: boolean) {
  await prisma.apartment.update({
    where: { id: apartmentId },
    data: { autoCheckin: enabled },
  });

  if (enabled) {
    await prisma.checkinTask.updateMany({
      where: { apartmentId, status: { in: ["PENDING", "IN_PROGRESS"] } },
      data: { status: "CANCELLED" },
    });
  } else {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const bookings = await prisma.booking.findMany({
      where: { apartmentId, status: { not: "CANCELLED" }, checkInDate: { gte: todayStart } },
      select: { id: true },
    });
    for (const b of bookings) {
      await syncCheckinTaskFromBooking(b.id);
    }
  }

  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checkin-checklist`);
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/checkin");
}

// Salva l'orario di check-in di default dell'appartamento (formato "HH:MM").
export async function updateCheckinDefaultTime(apartmentId: string, time: string) {
  const clean = /^\d{2}:\d{2}$/.test(time) ? time : null;
  await prisma.apartment.update({
    where: { id: apartmentId },
    data: { checkinDefaultTime: clean },
  });
  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checkin-checklist`);
}

export async function getCheckinChecklist(apartmentId: string) {
  return await prisma.checkinChecklistItem.findMany({
    where: { apartmentId },
    orderBy: { order: "asc" },
  });
}

export async function addCheckinChecklistItem(apartmentId: string, prevState: any, formData: FormData) {
  try {
    const label = formData.get("label") as string;
    const required = formData.get("required") === "on";
    const photoRequired = formData.get("photoRequired") === "on";

    if (!label || !apartmentId) {
      return { error: "L'etichetta è obbligatoria." };
    }

    const lastItem = await prisma.checkinChecklistItem.findFirst({
      where: { apartmentId },
      orderBy: { order: "desc" },
    });

    const created = await prisma.checkinChecklistItem.create({
      data: {
        apartmentId,
        label,
        required,
        photoRequired,
        order: (lastItem?.order || 0) + 1,
      },
    });

    try {
      const translations = await translateLabel(label, ["en", "es"]);
      if (Object.keys(translations).length > 0) {
        await prisma.checkinChecklistItem.update({
          where: { id: created.id },
          data: { labelTranslations: translations },
        });
      }
    } catch (e) {
      console.warn("Auto-translate failed (non-blocking):", e);
    }

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checkin-checklist`);
    await syncPendingCheckinTasks(apartmentId);
    return { success: true };
  } catch (error) {
    console.error("Error adding check-in checklist item:", error);
    return { error: "Errore durante il salvataggio." };
  }
}

export async function updateCheckinChecklistItem(id: string, prevState: any, formData: FormData) {
  try {
    const label = formData.get("label") as string;
    const required = formData.get("required") === "on";
    const photoRequired = formData.get("photoRequired") === "on";
    const apartmentId = formData.get("apartmentId") as string;

    if (!label || !id) {
      return { error: "ID e etichetta sono obbligatori." };
    }

    let labelTranslations: Record<string, string> | undefined;
    try {
      const t = await translateLabel(label, ["en", "es"]);
      if (Object.keys(t).length > 0) labelTranslations = t;
    } catch (e) {
      console.warn("Auto-translate failed (non-blocking):", e);
    }

    await prisma.checkinChecklistItem.update({
      where: { id },
      data: {
        label,
        required,
        photoRequired,
        ...(labelTranslations ? { labelTranslations } : {}),
      },
    });

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checkin-checklist`);
    await syncPendingCheckinTasks(apartmentId);
    return { success: true };
  } catch (error) {
    console.error("Error updating check-in checklist item:", error);
    return { error: "Errore durante l'aggiornamento." };
  }
}

export async function deleteCheckinChecklistItem(id: string, apartmentId: string) {
  await prisma.checkinChecklistItem.delete({ where: { id } });
  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checkin-checklist`);
  await syncPendingCheckinTasks(apartmentId);
}

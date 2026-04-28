"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/src/lib/constants";
import { computeChecklistSnapshot } from "./operational";

type ChecklistSnapshotItem = {
  id: string;
  label: string;
  type: string;
  value: number | null;
  required: boolean;
  completed: boolean;
};

/**
 * Synchronization helper: updates the checklistProgress snapshot in all
 * PENDING or IN_PROGRESS cleaning tasks for a specific apartment
 * to match the latest master checklist configuration.
 */
async function syncPendentCleaningTasks(apartmentId: string) {
  const activeTasks = await prisma.cleaningTask.findMany({
    where: {
      apartmentId,
      status: { in: ["PENDING", "IN_PROGRESS"] }
    }
  });

  if (activeTasks.length === 0) return;

  for (const task of activeTasks) {
    const newSnapshot = await computeChecklistSnapshot(prisma, apartmentId, task.date, task.bookingId) as ChecklistSnapshotItem[];
    const oldSnapshot = (task.checklistProgress as any[]) || [];
    
    // Merge strategy: preserve completion status for items with identical labels
    const mergedSnapshot = newSnapshot.map(newItem => {
      const existingMatch = oldSnapshot.find(oldItem => oldItem.label === newItem.label);
      return {
        ...newItem,
        completed: existingMatch ? !!existingMatch.completed : false
      };
    });

    await prisma.cleaningTask.update({
      where: { id: task.id },
      data: { checklistProgress: mergedSnapshot }
    });
  }
  
  // Revalidate cleaner views
  revalidatePath("/dashboard/cleaner");
}

export async function getApartmentChecklist(apartmentId: string) {
  return await prisma.checklistItem.findMany({
    where: { apartmentId },
    orderBy: { order: "asc" },
  });
}

export async function addChecklistItem(apartmentId: string, prevState: any, formData: FormData) {
  try {
    const label = formData.get("label") as string;
    const type = formData.get("type") as string || "static";
    const formula = formData.get("formula") as string;
    const required = formData.get("required") === "on";

    if (!label || !apartmentId) {
      return { error: "L'etichetta è obbligatoria." };
    }

    // Get current max order
    const lastItem = await prisma.checklistItem.findFirst({
      where: { apartmentId },
      orderBy: { order: "desc" },
    });

    await prisma.checklistItem.create({
      data: {
        apartmentId,
        label,
        type,
        formula: type === "dynamic" ? formula : null,
        required,
        order: (lastItem?.order || 0) + 1,
      },
    });

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
    await syncPendentCleaningTasks(apartmentId);
    return { success: true };
  } catch (error) {
    console.error("Error adding checklist item:", error);
    return { error: "Errore durante il salvataggio." };
  }
}

export async function updateChecklistItem(id: string, prevState: any, formData: FormData) {
  try {
    const label = formData.get("label") as string;
    const type = formData.get("type") as string || "static";
    const formula = formData.get("formula") as string;
    const required = formData.get("required") === "on";
    const apartmentId = formData.get("apartmentId") as string;

    if (!label || !id) {
      return { error: "ID e etichetta sono obbligatori." };
    }

    await prisma.checklistItem.update({
      where: { id },
      data: {
        label,
        type,
        formula: type === "dynamic" ? formula : null,
        required,
      },
    });

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
    await syncPendentCleaningTasks(apartmentId);
    return { success: true };
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return { error: "Errore durante l'aggiornamento." };
  }
}

export async function deleteChecklistItem(id: string, apartmentId: string) {
  await prisma.checklistItem.delete({
    where: { id },
  });
  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
  await syncPendentCleaningTasks(apartmentId);
}

/**
 * Updates the checklist progress for a specific cleaning task.
 * Items is expected to be the full array of checklist objects with updated 'completed' status.
 */
export async function updateTaskChecklist(taskId: string, items: any[]) {
  await prisma.cleaningTask.update({
    where: { id: taskId },
    data: {
      checklistProgress: items,
    },
  });
  
  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/cleaner");
  
  return { success: true };
}

export async function generateDefaultChecklist(apartmentId: string) {
  // Check if checklist already has items
  const count = await prisma.checklistItem.count({
    where: { apartmentId },
  });

  if (count > 0) {
    throw new Error("L'appartamento ha già dei punti di controllo configurati.");
  }

  // Create standard items
  await prisma.checklistItem.createMany({
    data: DEFAULT_CHECKLIST.map((item: any, index: number) => ({
      apartmentId,
      label: item.label,
      type: item.type || "static",
      formula: item.formula || null,
      required: item.required,
      order: index,
    })),
  });

  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
  await syncPendentCleaningTasks(apartmentId);
}

export async function syncChecklistWithDefaults(apartmentId: string) {
  // Load existing items
  const existingItems = await prisma.checklistItem.findMany({
    where: { apartmentId },
  });
  
  // Normalize existing labels for robust comparison (lowercase + trimmed)
  const existingLabels = new Set(
    existingItems.map(item => item.label.toLowerCase().trim())
  );
  
  // Find missing standard items by comparing sanitized labels
  const missingItems = DEFAULT_CHECKLIST.filter(
    std => !existingLabels.has(std.label.toLowerCase().trim())
  );
  
  if (missingItems.length === 0) {
    return { count: 0 };
  }
  
  // Get current max order to append items at the end
  const lastItem = await prisma.checklistItem.findFirst({
    where: { apartmentId },
    orderBy: { order: "desc" },
  });
  
  let currentOrder = (lastItem?.order || 0) + 1;
  
  // Create only missing items (Additive Only)
  // We do not modify, delete, or overwrite any existing items.
  await prisma.checklistItem.createMany({
    data: missingItems.map((item: any) => ({
      apartmentId,
      label: item.label,
      type: item.type || "static",
      formula: item.formula || null,
      required: item.required,
      order: currentOrder++,
    })),
  });

  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
  await syncPendentCleaningTasks(apartmentId);
  return { count: missingItems.length };
}

export async function reorderChecklistItems(apartmentId: string, orderedIds: string[]) {
  try {
    // Efficient sequential updates via transaction
    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.checklistItem.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
    await syncPendentCleaningTasks(apartmentId);
    return { success: true };
  } catch (error) {
    console.error("Error reordering checklist:", error);
    return { error: "Errore durante il riordinamento." };
  }
}

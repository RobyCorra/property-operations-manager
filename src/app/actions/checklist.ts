"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/src/lib/constants";
import { computeChecklistSnapshot } from "./operational";
import { translateLabel } from "@/src/lib/translate";

type ChecklistSnapshotItem = {
  id: string;
  label: string;
  labelTranslations?: Record<string, string> | null;
  type: string;
  value: number | null;
  required: boolean;
  photoRequired: boolean;
  phase?: string;
  answerType?: string;
  answer?: string | null;
  completed: boolean;
};

type ChecklistProgressItem = ChecklistSnapshotItem & Record<string, unknown>;
type ChecklistProgressUpdateItem = {
  id: string;
  label: string;
  type: string;
  value?: number | null;
  required: boolean;
  completed: boolean;
  formula?: string | null;
  photoUrl?: string | null;
  skipped?: boolean;
  phase?: string;
  answerType?: string;
  answer?: string | null;
};
type DefaultChecklistItem = (typeof DEFAULT_CHECKLIST)[number];

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
    const oldSnapshot = Array.isArray(task.checklistProgress)
      ? (task.checklistProgress as ChecklistProgressItem[])
      : [];
    
    // Merge strategy: preserve completion status for items with identical labels
    const mergedSnapshot = newSnapshot.map((newItem: ChecklistSnapshotItem) => {
      const existingMatch = oldSnapshot.find((oldItem: ChecklistProgressItem) => oldItem.label === newItem.label);
      return {
        ...newItem,
        completed: existingMatch ? !!existingMatch.completed : false,
        skipped: existingMatch ? !!existingMatch.skipped : false,
        photoUrl: existingMatch?.photoUrl ?? null,
        answer: existingMatch?.answer ?? null,
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
    const photoRequired = formData.get("photoRequired") === "on";
    const phase = formData.get("phase") === "entry" ? "entry" : "cleaning";
    const answerType = formData.get("answerType") === "yesno" ? "yesno" : "check";

    if (!label || !apartmentId) {
      return { error: "L'etichetta è obbligatoria." };
    }

    // Get current max order
    const lastItem = await prisma.checklistItem.findFirst({
      where: { apartmentId },
      orderBy: { order: "desc" },
    });

    const created = await prisma.checklistItem.create({
      data: {
        apartmentId,
        label,
        type,
        formula: type === "dynamic" ? formula : null,
        required,
        photoRequired,
        phase,
        answerType,
        order: (lastItem?.order || 0) + 1,
      },
    });

    // Auto-translate label to EN and ES (best-effort, non-blocking)
    try {
      const translations = await translateLabel(label, ["en", "es"]);
      if (Object.keys(translations).length > 0) {
        await prisma.checklistItem.update({
          where: { id: created.id },
          data: { labelTranslations: translations },
        });
      }
    } catch (e) {
      console.warn("Auto-translate failed (non-blocking):", e);
    }

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
    const photoRequired = formData.get("photoRequired") === "on";
    const phase = formData.get("phase") === "entry" ? "entry" : "cleaning";
    const answerType = formData.get("answerType") === "yesno" ? "yesno" : "check";
    const apartmentId = formData.get("apartmentId") as string;

    if (!label || !id) {
      return { error: "ID e etichetta sono obbligatori." };
    }

    // Auto-translate new label (best-effort)
    let labelTranslations: Record<string, string> | undefined;
    try {
      const t = await translateLabel(label, ["en", "es"]);
      if (Object.keys(t).length > 0) labelTranslations = t;
    } catch (e) {
      console.warn("Auto-translate failed (non-blocking):", e);
    }

    await prisma.checklistItem.update({
      where: { id },
      data: {
        label,
        type,
        formula: type === "dynamic" ? formula : null,
        required,
        photoRequired,
        phase,
        answerType,
        ...(labelTranslations ? { labelTranslations } : {}),
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
export async function updateTaskChecklist(taskId: string, items: ChecklistProgressUpdateItem[]) {
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
    data: DEFAULT_CHECKLIST.map((item: DefaultChecklistItem, index: number) => ({
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
    existingItems.map((item: { label: string }) => item.label.toLowerCase().trim())
  );
  
  // Find missing standard items by comparing sanitized labels
  const missingItems = DEFAULT_CHECKLIST.filter(
    (std: DefaultChecklistItem) => !existingLabels.has(std.label.toLowerCase().trim())
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
    data: missingItems.map((item: DefaultChecklistItem) => ({
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

/**
 * Translates all checklist items of an apartment to the given languages.
 * Called by the manager from the checklist page.
 */
export async function translateAllChecklistItems(apartmentId: string, langs: string[]) {
  if (!langs || langs.length === 0) return { error: "Seleziona almeno una lingua." };

  try {
    const items = await prisma.checklistItem.findMany({
      where: { apartmentId },
      select: { id: true, label: true },
    });

    if (items.length === 0) return { count: 0 };

    // Translate each item sequentially to avoid rate limits
    let translated = 0;
    for (const item of items) {
      try {
        const translations = await translateLabel(item.label, langs);
        if (Object.keys(translations).length > 0) {
          await prisma.checklistItem.update({
            where: { id: item.id },
            data: { labelTranslations: translations },
          });
          translated++;
        }
      } catch (e) {
        console.warn(`Failed to translate item ${item.id}:`, e);
      }
    }

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
    return { count: translated };
  } catch (error) {
    console.error("Error translating checklist:", error);
    return { error: "Errore durante la traduzione." };
  }
}

/** Domande standard del questionario d'ingresso. */
const DEFAULT_ENTRY_QUESTIONS = [
  "Hai trovato la cucina sporca o stoviglie non lavate?",
  "Hai trovato mobili spostati o rotti?",
  "Ci sono danni evidenti nella casa?",
];

const GENERAL_PHOTO_QUESTION = "Vuoi allegare foto dello stato generale?";

/**
 * Crea il questionario d'ingresso standard per l'appartamento.
 * Additivo: salta le domande già presenti.
 */
export async function generateEntryQuestionnaire(apartmentId: string) {
  const existing = await prisma.checklistItem.findMany({
    where: { apartmentId, phase: "entry" },
    select: { label: true },
  });
  const existingLabels = new Set(
    existing.map((i: { label: string }) => i.label.toLowerCase().trim())
  );

  const toCreate = [
    ...DEFAULT_ENTRY_QUESTIONS.map((label) => ({ label, answerType: "yesno", photoRequired: true })),
    { label: GENERAL_PHOTO_QUESTION, answerType: "check", photoRequired: false },
  ].filter((q) => !existingLabels.has(q.label.toLowerCase().trim()));

  if (toCreate.length === 0) return { count: 0 };

  let order = -toCreate.length;
  const created = [];
  for (const q of toCreate) {
    created.push(
      await prisma.checklistItem.create({
        data: {
          apartmentId,
          label: q.label,
          type: "static",
          phase: "entry",
          answerType: q.answerType,
          required: false,
          photoRequired: q.photoRequired,
          order: order++,
        },
      })
    );
  }

  // Traduzione automatica (best-effort, non blocca la creazione)
  for (const item of created) {
    try {
      const translations = await translateLabel(item.label, ["en", "es"]);
      if (Object.keys(translations).length > 0) {
        await prisma.checklistItem.update({
          where: { id: item.id },
          data: { labelTranslations: translations },
        });
      }
    } catch (e) {
      console.warn("Auto-translate failed (non-blocking):", e);
    }
  }

  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/checklist`);
  await syncPendentCleaningTasks(apartmentId);
  return { count: created.length };
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

"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/src/lib/constants";
import { generateUniqueApartmentCode } from "@/src/lib/apartment-code";
import { storeAttachmentFile } from "@/src/lib/server/attachment-storage";

function textValue(formData: FormData, key: string) {
  return (formData.get(key) as string | null) ?? "";
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function indexesForPrefix(formData: FormData, prefix: string) {
  const indexes = new Set<number>();
  const pattern = new RegExp(`^${escapeRegExp(prefix)}\\.([0-9]+)\\.`);

  for (const key of formData.keys()) {
    const match = key.match(pattern);
    if (match) {
      indexes.add(Number(match[1]));
    }
  }

  return [...indexes].sort((a, b) => a - b);
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

type TechnicalProfileAttachment = {
  filename: string;
  url: string;
  mimeType: string;
  size: number | null;
  category: string;
  notes: string;
  extractedText: string;
};

export type ApartmentActionResult = {
  success: false;
  error: string;
};

function actionError(error: unknown, fallback: string): ApartmentActionResult {
  return {
    success: false,
    error: error instanceof Error && error.message ? error.message : fallback,
  };
}

function logApartmentAttachmentUpload({
  apartmentId,
  file,
  category,
  notes,
}: {
  apartmentId: string;
  file: File | null;
  category: string;
  notes: string;
}) {
  console.log("[ApartmentAttachmentUpload] Received attachment form data", {
    apartmentId,
    filename: file?.name ?? null,
    size: file?.size ?? null,
    mimeType: file?.type || null,
    category,
    hasNotes: notes.trim().length > 0,
  });
}

async function buildAttachments(formData: FormData, prefix: string, apartmentId: string) {
  return indexesForPrefix(formData, prefix)
    .reduce<Promise<TechnicalProfileAttachment[]>>(async (currentPromise, index) => {
      const current = await currentPromise;
      const file = fileValue(formData, `${prefix}.${index}.file`);
      const driveUrl = textValue(formData, `${prefix}.${index}.driveUrl`).trim();
      const existingUrl = textValue(formData, `${prefix}.${index}.url`).trim();
      const notes = textValue(formData, `${prefix}.${index}.notes`).trim();
      const category = textValue(formData, `${prefix}.${index}.category`).trim() || "OTHER";
      const extractedText = textValue(formData, `${prefix}.${index}.extractedText`).trim();

      if (file) {
        logApartmentAttachmentUpload({ apartmentId, file, category, notes });

        if (!apartmentId) {
          throw new Error("ID appartamento mancante: impossibile caricare l'allegato.");
        }

        const uploadResult = await storeAttachmentFile(file, "apartment", apartmentId);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
        const storedFile = uploadResult.file;

        return [
          ...current,
          {
            filename: storedFile.filename,
            url: storedFile.url,
            mimeType: storedFile.mimeType,
            size: storedFile.size,
            category,
            notes,
            extractedText: storedFile.extractedText ?? extractedText,
          },
        ];
      }

      const url = driveUrl || existingUrl;
      const filename = textValue(formData, `${prefix}.${index}.filename`).trim() || (driveUrl ? "Google Drive link" : "");
      const mimeType = textValue(formData, `${prefix}.${index}.mimeType`).trim();
      const sizeText = textValue(formData, `${prefix}.${index}.size`).trim();
      const size = sizeText ? parseInt(sizeText, 10) : null;

      if (!url && !filename && !notes && category === "OTHER" && !extractedText) {
        return current;
      }

      return [
        ...current,
        {
          filename,
          url,
          mimeType,
          size: Number.isNaN(size) ? null : size,
          category,
          notes,
          extractedText,
        },
      ];
    }, Promise.resolve([] as TechnicalProfileAttachment[]));
}

async function buildTechnicalItems(formData: FormData, prefix: string, apartmentId: string) {
  return indexesForPrefix(formData, prefix)
    .reduce<Promise<{
      name: string;
      type: string;
      brand: string;
      model: string;
      location: string;
      notes: string;
      recurringIssues: string;
      attachments: Awaited<ReturnType<typeof buildAttachments>>;
    }[]>>(async (currentPromise, index) => {
      const current = await currentPromise;
      const item = {
      name: textValue(formData, `${prefix}.${index}.name`).trim(),
      type: textValue(formData, `${prefix}.${index}.type`).trim(),
      brand: textValue(formData, `${prefix}.${index}.brand`).trim(),
      model: textValue(formData, `${prefix}.${index}.model`).trim(),
      location: textValue(formData, `${prefix}.${index}.location`).trim(),
      notes: textValue(formData, `${prefix}.${index}.notes`).trim(),
      recurringIssues: textValue(formData, `${prefix}.${index}.recurringIssues`).trim(),
      attachments: await buildAttachments(formData, `${prefix}.${index}.attachments`, apartmentId),
      };
      const { attachments, ...textFields } = item;
      return Object.values(textFields).some((value) => value !== "") || attachments.length > 0
        ? [...current, item]
        : current;
    }, Promise.resolve([] as {
      name: string;
      type: string;
      brand: string;
      model: string;
      location: string;
      notes: string;
      recurringIssues: string;
      attachments: TechnicalProfileAttachment[];
    }[]));
}

async function buildRecurringIssues(formData: FormData, apartmentId: string) {
  const prefix = "technicalProfile.recurringIssues";

  return indexesForPrefix(formData, prefix)
    .reduce<Promise<{
      title: string;
      category: string;
      relatedItem: string;
      symptoms: string;
      solution: string;
      whenToCall: string;
      notesForAI: string;
      attachments: Awaited<ReturnType<typeof buildAttachments>>;
    }[]>>(async (currentPromise, index) => {
      const current = await currentPromise;
      const issue = {
      title: textValue(formData, `${prefix}.${index}.title`).trim(),
      category: textValue(formData, `${prefix}.${index}.category`).trim(),
      relatedItem: textValue(formData, `${prefix}.${index}.relatedItem`).trim(),
      symptoms: textValue(formData, `${prefix}.${index}.symptoms`).trim(),
      solution: textValue(formData, `${prefix}.${index}.solution`).trim(),
      whenToCall: textValue(formData, `${prefix}.${index}.whenToCall`).trim(),
      notesForAI: textValue(formData, `${prefix}.${index}.notesForAI`).trim(),
      attachments: await buildAttachments(formData, `${prefix}.${index}.attachments`, apartmentId),
      };
      const { attachments, ...textFields } = issue;
      return Object.values(textFields).some((value) => value !== "") || attachments.length > 0
        ? [...current, issue]
        : current;
    }, Promise.resolve([] as {
      title: string;
      category: string;
      relatedItem: string;
      symptoms: string;
      solution: string;
      whenToCall: string;
      notesForAI: string;
      attachments: TechnicalProfileAttachment[];
    }[]));
}

async function buildTechnicalProfile(formData: FormData, apartmentId: string, existingTechnicalProfile?: unknown) {
  const existing = objectValue(existingTechnicalProfile);
  const guestAccess = textValue(formData, "technicalProfile.guestAccess").trim();

  return {
    ...existing,
    ...(guestAccess ? { guestAccess } : {}),
    systems: await buildTechnicalItems(formData, "technicalProfile.systems", apartmentId),
    appliances: await buildTechnicalItems(formData, "technicalProfile.appliances", apartmentId),
    smartHome: await buildTechnicalItems(formData, "technicalProfile.smartHome", apartmentId),
    recurringIssues: await buildRecurringIssues(formData, apartmentId),
    generalAttachments: await buildAttachments(formData, "technicalProfile.generalAttachments", apartmentId),
    aiNotes: textValue(formData, "technicalProfile.aiNotes"),
  };
}

function attachmentCategory(formData: FormData) {
  const category = textValue(formData, "category");
  const allowed = ["MANUAL", "WARRANTY", "PHOTO", "TECHNICAL_SHEET", "INSTALLER_INSTRUCTIONS", "OTHER"];

  return allowed.includes(category) ? category : "OTHER";
}

function optionalIntValue(formData: FormData, key: string) {
  const value = parseInt(textValue(formData, key), 10);

  return Number.isNaN(value) ? null : value;
}

export async function createApartment(formData: FormData) {
  let apartmentId: string;

  try {
    const id = randomUUID();
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const squareMeters = parseInt(formData.get("squareMeters") as string, 10);
    const bedrooms = parseInt(formData.get("bedrooms") as string, 10);
    const bathrooms = parseInt(formData.get("bathrooms") as string, 10);
    const maxGuests = parseInt(formData.get("maxGuests") as string, 10);

    if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
      return { success: false, error: "Dati obbligatori mancanti o invalidi." };
    }

    const technicalProfile = await buildTechnicalProfile(formData, id);
    const directAttachments = Array.isArray(technicalProfile.generalAttachments)
      ? technicalProfile.generalAttachments
      : [];

    const apartment = await prisma.apartment.create({
      data: {
        id,
        name,
        apartmentCode: await generateUniqueApartmentCode(name),
        address,
        latitude,
        longitude,
        squareMeters: isNaN(squareMeters) ? 0 : squareMeters,
        bedrooms: isNaN(bedrooms) ? 0 : bedrooms,
        bathrooms: isNaN(bathrooms) ? 0 : bathrooms,
        maxGuests: isNaN(maxGuests) ? 1 : maxGuests,
        accessInstructions: null,
        icalUrl: formData.get("icalUrl") as string,
        technicalProfile,
        apartmentAttachments: directAttachments.length > 0 ? {
          create: directAttachments.map((attachment) => ({
            filename: attachment.filename || "Allegato",
            url: attachment.url || null,
            mimeType: attachment.mimeType || null,
            size: attachment.size,
            category: attachment.category || "OTHER",
            extractedText: attachment.extractedText || null,
            notes: attachment.notes || null,
          })),
        } : undefined,
        // Automatically add default checklist items
        checklistItems: {
          create: DEFAULT_CHECKLIST.map((item, index) => ({
            label: item.label,
            required: item.required,
            order: index,
          })),
        },
      },
    });

    apartmentId = apartment.id;
  } catch (error) {
    return actionError(error, "Errore durante il salvataggio dell'appartamento.");
  }

  revalidatePath("/dashboard/manager/apartments");
  redirect(`/dashboard/manager/apartments/${apartmentId}/edit`);
}

export async function updateApartment(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const squareMeters = parseInt(formData.get("squareMeters") as string, 10);
    const bedrooms = parseInt(formData.get("bedrooms") as string, 10);
    const bathrooms = parseInt(formData.get("bathrooms") as string, 10);
    const maxGuests = parseInt(formData.get("maxGuests") as string, 10);

    if (!id || !name || !address || isNaN(latitude) || isNaN(longitude)) {
      return { success: false, error: "Dati obbligatori mancanti o invalidi." };
    }

    const existingApartment = await prisma.apartment.findUnique({
      where: { id },
      select: { technicalProfile: true, accessInstructions: true },
    });

    const accessInfo = {
      doorCode: textValue(formData, "accessInfo.doorCode") || null,
      safeCode: textValue(formData, "accessInfo.safeCode") || null,
      buildingCode: textValue(formData, "accessInfo.buildingCode") || null,
      floor: textValue(formData, "accessInfo.floor") || null,
      wifiNetwork: textValue(formData, "accessInfo.wifiNetwork") || null,
      wifiPassword: textValue(formData, "accessInfo.wifiPassword") || null,
      directions: textValue(formData, "accessInfo.directions") || null,
      checkInNotes: textValue(formData, "accessInfo.checkInNotes") || null,
      parking: textValue(formData, "accessInfo.parking") || null,
    };

    await prisma.apartment.update({
      where: { id },
      data: {
        name,
        apartmentCode: await generateUniqueApartmentCode(name, id),
        address,
        latitude,
        longitude,
        squareMeters: isNaN(squareMeters) ? 0 : squareMeters,
        bedrooms: isNaN(bedrooms) ? 0 : bedrooms,
        bathrooms: isNaN(bathrooms) ? 0 : bathrooms,
        maxGuests: isNaN(maxGuests) ? 1 : maxGuests,
        accessInstructions: existingApartment?.accessInstructions ?? null,
        accessInfo,
        icalUrl: formData.get("icalUrl") as string,
        technicalProfile: await buildTechnicalProfile(formData, id, existingApartment?.technicalProfile),
      },
    });
  } catch (error) {
    return actionError(error, "Errore durante l'aggiornamento dell'appartamento.");
  }

  revalidatePath("/dashboard/manager/apartments");
  redirect("/dashboard/manager/apartments");
}

export async function deleteApartment(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("ID Mancante.");
  }

  // Safety check: check for related records
  const [bookingCount, cleaningCount, maintenanceCount] = await Promise.all([
    prisma.booking.count({ where: { apartmentId: id } }),
    prisma.cleaningTask.count({ where: { apartmentId: id } }),
    prisma.maintenanceTicket.count({ where: { apartmentId: id } }),
  ]);

  if (bookingCount > 0 || cleaningCount > 0 || maintenanceCount > 0) {
    throw new Error("Impossibile eliminare l'appartamento: esistono prenotazioni, task di pulizia o ticket di manutenzione collegati.");
  }

  await prisma.apartment.delete({
    where: { id },
  });

  revalidatePath("/dashboard/manager/apartments");
  revalidatePath("/dashboard/manager");
  redirect("/dashboard/manager/apartments");
}

export async function createApartmentAttachment(formData: FormData) {
  try {
    const apartmentId = textValue(formData, "apartmentId");
    const file = fileValue(formData, "file");
    const filename = textValue(formData, "filename").trim();
    const category = attachmentCategory(formData);
    const notes = textValue(formData, "notes");

    logApartmentAttachmentUpload({ apartmentId, file, category, notes });

    if (!apartmentId) {
      return { success: false, error: "ID appartamento mancante: impossibile caricare l'allegato." };
    }

    if (!filename && !file) {
      return { success: false, error: "Seleziona un file valido o inserisci un nome allegato." };
    }

    const uploadResult = file ? await storeAttachmentFile(file, "apartment", apartmentId) : null;
    if (uploadResult && !uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }
    const storedFile = uploadResult?.success ? uploadResult.file : null;

    const attachment = await prisma.apartmentAttachment.create({
      data: {
        apartmentId,
        filename: storedFile?.filename || filename,
        url: storedFile?.url || textValue(formData, "url") || null,
        mimeType: storedFile?.mimeType || textValue(formData, "mimeType") || null,
        size: storedFile?.size ?? optionalIntValue(formData, "size"),
        category,
        notes: notes || null,
        extractedText: storedFile?.extractedText ?? (textValue(formData, "extractedText") || null),
      },
      select: { id: true },
    });

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/edit`);
    revalidatePath("/dashboard/manager/apartments");
    return { success: true, attachmentId: attachment.id };
  } catch (error) {
    return actionError(error, "Errore durante il caricamento dell'allegato.");
  }
}

export async function updateApartmentAttachment(formData: FormData) {
  try {
    const id = textValue(formData, "id");
    const file = fileValue(formData, "file");
    const filename = textValue(formData, "filename").trim();
    const category = attachmentCategory(formData);
    const notes = textValue(formData, "notes");

    if (!id) {
      return { success: false, error: "ID allegato mancante." };
    }

    if (!filename && !file) {
      return { success: false, error: "Seleziona un file valido o inserisci un nome allegato." };
    }

    const existingAttachment = await prisma.apartmentAttachment.findUnique({
      where: { id },
      select: { apartmentId: true },
    });

    if (!existingAttachment) {
      return { success: false, error: "Allegato non trovato." };
    }

    logApartmentAttachmentUpload({ apartmentId: existingAttachment.apartmentId, file, category, notes });

    const uploadResult = file ? await storeAttachmentFile(file, "apartment", existingAttachment.apartmentId) : null;
    if (uploadResult && !uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }
    const storedFile = uploadResult?.success ? uploadResult.file : null;

    await prisma.apartmentAttachment.update({
      where: { id },
      data: {
        filename: storedFile?.filename || filename,
        url: storedFile?.url || textValue(formData, "url") || null,
        mimeType: storedFile?.mimeType || textValue(formData, "mimeType") || null,
        size: storedFile?.size ?? optionalIntValue(formData, "size"),
        category,
        notes: notes || null,
        extractedText: storedFile?.extractedText ?? (textValue(formData, "extractedText") || null),
      },
    });

    revalidatePath(`/dashboard/manager/apartments/${existingAttachment.apartmentId}/edit`);
    revalidatePath("/dashboard/manager/apartments");
    return { success: true, attachmentId: id };
  } catch (error) {
    return actionError(error, "Errore durante l'aggiornamento dell'allegato.");
  }
}

export async function deleteApartmentAttachment(formData: FormData) {
  const id = textValue(formData, "id");

  if (!id) {
    throw new Error("ID allegato mancante.");
  }

  const existingAttachment = await prisma.apartmentAttachment.findUnique({
    where: { id },
    select: { apartmentId: true },
  });

  if (!existingAttachment) {
    return;
  }

  await prisma.apartmentAttachment.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/manager/apartments/${existingAttachment.apartmentId}/edit`);
  revalidatePath("/dashboard/manager/apartments");
}

export async function saveApartmentAttachmentFromBlob(formData: FormData) {
  try {
    const apartmentId = textValue(formData, "apartmentId");
    const url = textValue(formData, "url");
    const filename = textValue(formData, "filename");
    const mimeType = textValue(formData, "mimeType") || null;
    const size = optionalIntValue(formData, "size");
    const category = attachmentCategory(formData);
    const notes = textValue(formData, "notes") || null;
    const linkedTo = textValue(formData, "linkedTo") || null;

    if (!apartmentId || !url || !filename) {
      return { success: false, error: "Dati mancanti." };
    }

    const attachment = await prisma.apartmentAttachment.create({
      data: { apartmentId, filename, url, mimeType, size, category, notes, linkedTo },
      select: { id: true, filename: true, url: true, mimeType: true, size: true, category: true, notes: true, linkedTo: true, createdAt: true },
    });

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/edit`);
    return { success: true, attachment };
  } catch (error) {
    return actionError(error, "Errore durante il salvataggio dell'allegato.");
  }
}

export async function deleteApartmentAttachmentById(id: string) {
  const existing = await prisma.apartmentAttachment.findUnique({
    where: { id },
    select: { apartmentId: true },
  });
  if (!existing) return;
  await prisma.apartmentAttachment.delete({ where: { id } });
  revalidatePath(`/dashboard/manager/apartments/${existing.apartmentId}/edit`);
}

export async function saveApartmentAccess(formData: FormData) {
  try {
    const id = textValue(formData, "id");
    if (!id) return { success: false, error: "ID appartamento mancante." };

    const accessInfo = {
      doorCode: textValue(formData, "doorCode") || null,
      safeCode: textValue(formData, "safeCode") || null,
      buildingCode: textValue(formData, "buildingCode") || null,
      floor: textValue(formData, "floor") || null,
      wifiNetwork: textValue(formData, "wifiNetwork") || null,
      wifiPassword: textValue(formData, "wifiPassword") || null,
      directions: textValue(formData, "directions") || null,
      checkInNotes: textValue(formData, "checkInNotes") || null,
      parking: textValue(formData, "parking") || null,
    };

    await prisma.apartment.update({
      where: { id },
      data: { accessInfo },
    });

    revalidatePath(`/dashboard/manager/apartments/${id}/edit`);
    return { success: true };
  } catch (error) {
    return actionError(error, "Errore durante il salvataggio delle informazioni di accesso.");
  }
}

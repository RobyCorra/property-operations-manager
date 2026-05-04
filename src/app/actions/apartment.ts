"use server";

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/src/lib/constants";
import { generateUniqueApartmentCode } from "@/src/lib/apartment-code";

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

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function saveApartmentUpload(apartmentId: string, file: File) {
  const uploadDir = join(process.cwd(), "public", "uploads", "apartments", apartmentId);
  await mkdir(uploadDir, { recursive: true });

  const storedFileName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name)}`;
  const path = join(uploadDir, storedFileName);
  const bytes = await file.arrayBuffer();
  await writeFile(path, Buffer.from(bytes));

  return `/uploads/apartments/${apartmentId}/${storedFileName}`;
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
        const url = await saveApartmentUpload(apartmentId, file);
        return [
          ...current,
          {
            filename: file.name,
            url,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            category,
            notes,
            extractedText,
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
    throw new Error("Dati obbligatori mancanti o invalidi.");
  }

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
      technicalProfile: await buildTechnicalProfile(formData, id),
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

  revalidatePath("/dashboard/manager/apartments");
  redirect(`/dashboard/manager/apartments/${apartment.id}/edit`);
}

export async function updateApartment(formData: FormData) {
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
    throw new Error("Dati obbligatori mancanti o invalidi.");
  }

  const existingApartment = await prisma.apartment.findUnique({
    where: { id },
    select: { technicalProfile: true, accessInstructions: true },
  });

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
      icalUrl: formData.get("icalUrl") as string,
      technicalProfile: await buildTechnicalProfile(formData, id, existingApartment?.technicalProfile),
    },
  });

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
  const apartmentId = textValue(formData, "apartmentId");
  const filename = textValue(formData, "filename").trim();

  if (!apartmentId || !filename) {
    throw new Error("Appartamento e nome file sono obbligatori.");
  }

  await prisma.apartmentAttachment.create({
    data: {
      apartmentId,
      filename,
      url: textValue(formData, "url") || null,
      mimeType: textValue(formData, "mimeType") || null,
      size: optionalIntValue(formData, "size"),
      category: attachmentCategory(formData),
      notes: textValue(formData, "notes") || null,
      extractedText: textValue(formData, "extractedText") || null,
    },
  });

  revalidatePath(`/dashboard/manager/apartments/${apartmentId}/edit`);
  revalidatePath("/dashboard/manager/apartments");
}

export async function updateApartmentAttachment(formData: FormData) {
  const id = textValue(formData, "id");
  const filename = textValue(formData, "filename").trim();

  if (!id || !filename) {
    throw new Error("ID allegato e nome file sono obbligatori.");
  }

  const existingAttachment = await prisma.apartmentAttachment.findUnique({
    where: { id },
    select: { apartmentId: true },
  });

  if (!existingAttachment) {
    throw new Error("Allegato non trovato.");
  }

  await prisma.apartmentAttachment.update({
    where: { id },
    data: {
      filename,
      url: textValue(formData, "url") || null,
      mimeType: textValue(formData, "mimeType") || null,
      size: optionalIntValue(formData, "size"),
      category: attachmentCategory(formData),
      notes: textValue(formData, "notes") || null,
      extractedText: textValue(formData, "extractedText") || null,
    },
  });

  revalidatePath(`/dashboard/manager/apartments/${existingAttachment.apartmentId}/edit`);
  revalidatePath("/dashboard/manager/apartments");
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

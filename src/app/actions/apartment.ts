"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/src/lib/constants";

function textValue(formData: FormData, key: string) {
  return (formData.get(key) as string | null) ?? "";
}

function checkedValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function objectValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function indexedTextValues(formData: FormData, prefix: string, field: string) {
  const values = new Map<number, string>();
  const pattern = new RegExp(`^${prefix}\\.([0-9]+)\\.${field}$`);

  for (const [key, value] of formData.entries()) {
    const match = key.match(pattern);
    if (match) {
      values.set(Number(match[1]), typeof value === "string" ? value : "");
    }
  }

  return values;
}

function buildProducts(formData: FormData) {
  const prefix = "technicalProfile.products";
  const fields = [
    "name",
    "category",
    "brand",
    "model",
    "serialNumber",
    "location",
    "purchaseDate",
    "warrantyUntil",
    "maintenanceNotes",
    "recurringIssues",
    "manualUrl",
    "notesForAI",
  ];
  const valuesByField = Object.fromEntries(
    fields.map((field) => [field, indexedTextValues(formData, prefix, field)])
  ) as Record<string, Map<number, string>>;
  const indexes = new Set<number>();

  for (const values of Object.values(valuesByField)) {
    for (const index of values.keys()) {
      indexes.add(index);
    }
  }

  return [...indexes]
    .sort((a, b) => a - b)
    .map((index) => Object.fromEntries(
      fields.map((field) => [field, valuesByField[field].get(index)?.trim() ?? ""])
    ))
    .filter((product) => Object.values(product).some((value) => value !== ""));
}

function buildTechnicalProfile(formData: FormData, existingTechnicalProfile?: unknown) {
  const existing = objectValue(existingTechnicalProfile);
  const existingBuilding = objectValue(existing.building);
  const existingSystems = objectValue(existing.systems);
  const existingAppliances = objectValue(existing.appliances);
  const existingSmartHome = objectValue(existing.smartHome);
  const existingRecurringIssues = objectValue(existing.recurringIssues);

  return {
    ...existing,
    building: {
      ...existingBuilding,
      floor: textValue(formData, "technicalProfile.building.floor"),
      hasElevator: checkedValue(formData, "technicalProfile.building.hasElevator"),
      accessNotes: textValue(formData, "technicalProfile.building.accessNotes"),
    },
    systems: {
      ...existingSystems,
      heatingType: textValue(formData, "technicalProfile.systems.heatingType"),
      coolingType: textValue(formData, "technicalProfile.systems.coolingType"),
      hotWaterType: textValue(formData, "technicalProfile.systems.hotWaterType"),
      electricalPanelLocation: textValue(formData, "technicalProfile.systems.electricalPanelLocation"),
      waterShutoffLocation: textValue(formData, "technicalProfile.systems.waterShutoffLocation"),
      gasShutoffLocation: textValue(formData, "technicalProfile.systems.gasShutoffLocation"),
      wifiRouterLocation: textValue(formData, "technicalProfile.systems.wifiRouterLocation"),
    },
    appliances: {
      ...existingAppliances,
      washingMachine: checkedValue(formData, "technicalProfile.appliances.washingMachine"),
      dishwasher: checkedValue(formData, "technicalProfile.appliances.dishwasher"),
      oven: checkedValue(formData, "technicalProfile.appliances.oven"),
      microwave: checkedValue(formData, "technicalProfile.appliances.microwave"),
      fridge: checkedValue(formData, "technicalProfile.appliances.fridge"),
      coffeeMachine: checkedValue(formData, "technicalProfile.appliances.coffeeMachine"),
      stove: checkedValue(formData, "technicalProfile.appliances.stove"),
    },
    smartHome: {
      ...existingSmartHome,
      smartLock: checkedValue(formData, "technicalProfile.smartHome.smartLock"),
      smartThermostat: checkedValue(formData, "technicalProfile.smartHome.smartThermostat"),
      doorSensors: checkedValue(formData, "technicalProfile.smartHome.doorSensors"),
      windowSensors: checkedValue(formData, "technicalProfile.smartHome.windowSensors"),
      energySensors: checkedValue(formData, "technicalProfile.smartHome.energySensors"),
      leakSensors: checkedValue(formData, "technicalProfile.smartHome.leakSensors"),
      noiseSensor: checkedValue(formData, "technicalProfile.smartHome.noiseSensor"),
    },
    recurringIssues: {
      ...existingRecurringIssues,
      slowDrains: checkedValue(formData, "technicalProfile.recurringIssues.slowDrains"),
      badSmells: checkedValue(formData, "technicalProfile.recurringIssues.badSmells"),
      hotWaterIssues: checkedValue(formData, "technicalProfile.recurringIssues.hotWaterIssues"),
      acIssues: checkedValue(formData, "technicalProfile.recurringIssues.acIssues"),
      electricalIssues: checkedValue(formData, "technicalProfile.recurringIssues.electricalIssues"),
      humidityMold: checkedValue(formData, "technicalProfile.recurringIssues.humidityMold"),
      lockIssues: checkedValue(formData, "technicalProfile.recurringIssues.lockIssues"),
      wifiIssues: checkedValue(formData, "technicalProfile.recurringIssues.wifiIssues"),
    },
    products: buildProducts(formData),
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
      name,
      address,
      latitude,
      longitude,
      squareMeters: isNaN(squareMeters) ? 0 : squareMeters,
      bedrooms: isNaN(bedrooms) ? 0 : bedrooms,
      bathrooms: isNaN(bathrooms) ? 0 : bathrooms,
      maxGuests: isNaN(maxGuests) ? 1 : maxGuests,
      accessInstructions: formData.get("accessInstructions") as string,
      icalUrl: formData.get("icalUrl") as string,
      technicalProfile: buildTechnicalProfile(formData),
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
  redirect("/dashboard/manager/apartments");
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
    select: { technicalProfile: true },
  });

  await prisma.apartment.update({
    where: { id },
    data: {
      name,
      address,
      latitude,
      longitude,
      squareMeters: isNaN(squareMeters) ? 0 : squareMeters,
      bedrooms: isNaN(bedrooms) ? 0 : bedrooms,
      bathrooms: isNaN(bathrooms) ? 0 : bathrooms,
      maxGuests: isNaN(maxGuests) ? 1 : maxGuests,
      accessInstructions: formData.get("accessInstructions") as string,
      icalUrl: formData.get("icalUrl") as string,
      technicalProfile: buildTechnicalProfile(formData, existingApartment?.technicalProfile),
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

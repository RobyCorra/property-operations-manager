"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/src/lib/constants";
import { generateUniqueApartmentCode } from "@/src/lib/apartment-code";
import { geocodeAddress } from "@/src/lib/geocoding";
import { getCurrentOrg } from "@/src/lib/tenant";
import { updateAutoCheckin } from "@/src/app/actions/checkin-checklist";

export type StructureCategoryInput = {
  name: string;
  squareMeters: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  bedConfig?: unknown;
  technicalProfile?: unknown;
  accessInstructions?: string | null;
  accessInfo?: unknown;
  unitNumbers: string[];
};

export type StructureInput = {
  name: string;
  type: "HOTEL" | "RESIDENCE";
  address: string;
  categories: StructureCategoryInput[];
};

function normalizeNumbers(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const n = (raw ?? "").trim();
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

// Crea una struttura (hotel/residence): un indirizzo unico geocodificato una
// sola volta, N categorie "master" e, per ogni categoria, le unita' (Apartment)
// identiche al master distinte dal numero. Ogni unita' riusa la macchina
// esistente (prenotazioni, pulizie, check-in, prodotti).
export type CreateStructureResult =
  | { success: true; propertyId: string; totalUnits: number }
  | { success: false; error?: string };

export async function createStructure(input: StructureInput): Promise<CreateStructureResult> {
  try {
    const name = (input?.name ?? "").trim();
    const address = (input?.address ?? "").trim();
    const type = input?.type === "HOTEL" ? "HOTEL" : "RESIDENCE";
    const categories = Array.isArray(input?.categories) ? input.categories : [];

    if (!name || !address) {
      return { success: false, error: "Nome struttura e indirizzo sono obbligatori." };
    }
    if (categories.length === 0) {
      return { success: false, error: "Aggiungi almeno una categoria di unità." };
    }

    // Valida numeri unita' e unicita' globale dentro la struttura.
    const globalNumbers = new Set<string>();
    const prepared = categories.map((cat) => {
      const numbers = normalizeNumbers(cat.unitNumbers || []);
      for (const n of numbers) {
        if (globalNumbers.has(n)) {
          throw new Error(`Il numero unità "${n}" è ripetuto: i numeri devono essere unici nella struttura.`);
        }
        globalNumbers.add(n);
      }
      return { cat, numbers };
    });

    const emptyCat = prepared.find((p) => p.numbers.length === 0);
    if (emptyCat) {
      return { success: false, error: `La categoria "${emptyCat.cat.name || "senza nome"}" non ha numeri unità.` };
    }

    const geocoded = await geocodeAddress(address);
    const latitude = geocoded?.lat ?? 0;
    const longitude = geocoded?.lng ?? 0;

    const orgId = await getCurrentOrg();

    // Precompute i codici appartamento (leggono il DB per l'unicita') PRIMA
    // della transazione, cosi' la transazione contiene solo scritture.
    const propertyId = randomUUID();
    const plan = [] as Array<{
      categoryId: string;
      cat: StructureCategoryInput;
      units: Array<{ id: string; unitNumber: string; name: string; apartmentCode: string }>;
    }>;
    for (const { cat, numbers } of prepared) {
      const units = [];
      for (const unitNumber of numbers) {
        units.push({
          id: randomUUID(),
          unitNumber,
          name: `${name} · ${unitNumber}`,
          apartmentCode: await generateUniqueApartmentCode(`${name}-${unitNumber}`),
        });
      }
      plan.push({ categoryId: randomUUID(), cat, units });
    }

    let totalUnits = 0;

    // Tutto atomico: se una scrittura fallisce, niente struttura/categorie/unita' orfane.
    await prisma.$transaction(async (tx) => {
      await tx.property.create({
        data: { id: propertyId, name, type, address, latitude, longitude, organizationId: orgId },
      });

      for (const { categoryId, cat, units } of plan) {
        await tx.unitCategory.create({
          data: {
            id: categoryId,
            propertyId,
            name: (cat.name || "Categoria").trim(),
            squareMeters: Number.isFinite(cat.squareMeters) ? cat.squareMeters : 0,
            bedrooms: Number.isFinite(cat.bedrooms) ? cat.bedrooms : 0,
            bathrooms: Number.isFinite(cat.bathrooms) ? cat.bathrooms : 0,
            maxGuests: Number.isFinite(cat.maxGuests) ? cat.maxGuests : 1,
            bedConfig: (cat.bedConfig as object) ?? undefined,
            technicalProfile: (cat.technicalProfile as object) ?? undefined,
            accessInstructions: cat.accessInstructions ?? null,
            accessInfo: (cat.accessInfo as object) ?? undefined,
          },
        });

        for (const unit of units) {
          await tx.apartment.create({
            data: {
              id: unit.id,
              name: unit.name,
              apartmentCode: unit.apartmentCode,
              address,
              latitude,
              longitude,
              squareMeters: Number.isFinite(cat.squareMeters) ? cat.squareMeters : 0,
              bedrooms: Number.isFinite(cat.bedrooms) ? cat.bedrooms : 0,
              bathrooms: Number.isFinite(cat.bathrooms) ? cat.bathrooms : 0,
              maxGuests: Number.isFinite(cat.maxGuests) ? cat.maxGuests : 1,
              bedConfig: (cat.bedConfig as object) ?? undefined,
              technicalProfile: (cat.technicalProfile as object) ?? undefined,
              accessInstructions: cat.accessInstructions ?? null,
              accessInfo: (cat.accessInfo as object) ?? undefined,
              organizationId: orgId,
              propertyId,
              unitCategoryId: categoryId,
              unitNumber: unit.unitNumber,
              checklistItems: {
                create: DEFAULT_CHECKLIST.map((item, index) => ({
                  label: item.label,
                  required: item.required,
                  order: index,
                })),
              },
            },
          });
          totalUnits += 1;
        }
      }
    });

    revalidatePath("/dashboard/manager/apartments");
    return { success: true, propertyId, totalUnits };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante la creazione della struttura.";
    console.error("createStructure: errore", error);
    return { success: false, error: message };
  }
}

// ─── Governance del master (categoria) ──────────────────────────────────────

export type MasterChecklistItem = {
  label: string;
  required: boolean;
  photoRequired: boolean;
};

export type CategoryMasterInput = {
  name: string;
  squareMeters: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  bedConfig?: unknown;
  checklist: MasterChecklistItem[];
};

// Carica una struttura con categorie e unità, org-scoped.
export async function getStructure(propertyId: string) {
  const orgId = await getCurrentOrg();
  return prisma.property.findFirst({
    where: { id: propertyId, organizationId: orgId },
    include: {
      categories: {
        orderBy: { createdAt: "asc" },
        include: {
          units: {
            orderBy: { unitNumber: "asc" },
            select: {
              id: true, name: true, unitNumber: true,
              bookings: { where: { status: { not: "CANCELLED" } }, select: { id: true, apartmentId: true, checkInDate: true, checkOutDate: true, status: true } },
              cleaningTasks: { select: { id: true, apartmentId: true, date: true, status: true } },
              maintenanceTickets: { select: { id: true, apartmentId: true, status: true, priority: true, scheduledStart: true, scheduledEnd: true } },
            },
          },
        },
      },
    },
  });
}

// Carica il master di una categoria + una checklist rappresentativa (presa
// dalla prima unità, dato che tutte le unità sono identiche al master).
export async function getCategoryMaster(categoryId: string) {
  const orgId = await getCurrentOrg();
  const category = await prisma.unitCategory.findFirst({
    where: { id: categoryId, property: { organizationId: orgId } },
    include: {
      property: { select: { id: true, name: true } },
      units: {
        orderBy: { unitNumber: "asc" },
        select: { id: true, unitNumber: true, autoCheckin: true },
      },
    },
  });
  if (!category) return null;

  // Stato auto check-in rappresentativo: attivo se TUTTE le unità lo sono.
  const autoCheckin = category.units.length > 0 && category.units.every((u) => u.autoCheckin);

  const firstUnitId = category.units[0]?.id;
  const checklist = firstUnitId
    ? await prisma.checklistItem.findMany({
        where: { apartmentId: firstUnitId, phase: "cleaning" },
        orderBy: { order: "asc" },
        select: { label: true, required: true, photoRequired: true },
      })
    : [];

  return { category, checklist, autoCheckin };
}

// Attiva/disattiva l'auto check-in su TUTTE le unità della categoria (master).
export async function updateCategoryAutoCheckin(
  categoryId: string,
  enabled: boolean,
): Promise<{ success: true; unitCount: number } | { success: false; error?: string }> {
  try {
    const orgId = await getCurrentOrg();
    const category = await prisma.unitCategory.findFirst({
      where: { id: categoryId, property: { organizationId: orgId } },
      include: { units: { select: { id: true } } },
    });
    if (!category) return { success: false, error: "Categoria non trovata." };

    for (const u of category.units) {
      await updateAutoCheckin(u.id, enabled);
    }

    revalidatePath(`/dashboard/manager/strutture/${category.propertyId}/categoria/${categoryId}`);
    return { success: true, unitCount: category.units.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante l'aggiornamento dell'auto check-in.";
    console.error("updateCategoryAutoCheckin: errore", error);
    return { success: false, error: message };
  }
}

// Aggiorna il master e propaga a TUTTE le unità della categoria:
// caratteristiche + checklist restano identiche al master.
export async function updateCategoryMaster(
  categoryId: string,
  input: CategoryMasterInput,
): Promise<{ success: true; unitCount: number } | { success: false; error?: string }> {
  try {
    const orgId = await getCurrentOrg();
    const category = await prisma.unitCategory.findFirst({
      where: { id: categoryId, property: { organizationId: orgId } },
      include: { units: { select: { id: true } } },
    });
    if (!category) return { success: false, error: "Categoria non trovata." };

    const name = (input.name || "").trim();
    if (!name) return { success: false, error: "Il nome della categoria è obbligatorio." };

    const sqm = Number.isFinite(input.squareMeters) ? input.squareMeters : 0;
    const bedrooms = Number.isFinite(input.bedrooms) ? input.bedrooms : 0;
    const bathrooms = Number.isFinite(input.bathrooms) ? input.bathrooms : 0;
    const maxGuests = Number.isFinite(input.maxGuests) ? input.maxGuests : 1;
    const bedConfig = (input.bedConfig as object) ?? undefined;
    const checklist = Array.isArray(input.checklist) ? input.checklist : [];
    const unitIds = category.units.map((u) => u.id);

    await prisma.$transaction(async (tx) => {
      // master
      await tx.unitCategory.update({
        where: { id: categoryId },
        data: { name, squareMeters: sqm, bedrooms, bathrooms, maxGuests, bedConfig },
      });

      // caratteristiche su tutte le unità
      await tx.apartment.updateMany({
        where: { id: { in: unitIds } },
        data: { squareMeters: sqm, bedrooms, bathrooms, maxGuests, bedConfig },
      });

      // checklist di pulizia: sostituisce quella di ogni unità con quella del master
      await tx.checklistItem.deleteMany({
        where: { apartmentId: { in: unitIds }, phase: "cleaning" },
      });
      if (checklist.length > 0 && unitIds.length > 0) {
        await tx.checklistItem.createMany({
          data: unitIds.flatMap((apartmentId) =>
            checklist.map((item, index) => ({
              apartmentId,
              label: (item.label || "").trim() || "Voce",
              required: !!item.required,
              photoRequired: !!item.photoRequired,
              phase: "cleaning",
              order: index,
            })),
          ),
        });
      }
    });

    revalidatePath("/dashboard/manager/apartments");
    revalidatePath(`/dashboard/manager/strutture/${category.propertyId}`);
    return { success: true, unitCount: unitIds.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante il salvataggio del master.";
    console.error("updateCategoryMaster: errore", error);
    return { success: false, error: message };
  }
}

// Elimina un'intera struttura: le unità (Apartment) e le categorie vengono
// rimosse in cascata (FK onDelete Cascade). Bloccata se un'unità ha prenotazioni.
export async function deleteStructure(
  propertyId: string,
): Promise<{ success: true } | { success: false; error?: string }> {
  try {
    const orgId = await getCurrentOrg();
    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId: orgId },
      include: { units: { select: { id: true } } },
    });
    if (!property) return { success: false, error: "Struttura non trovata." };

    const unitIds = property.units.map((u) => u.id);
    const bookingCount = unitIds.length
      ? await prisma.booking.count({ where: { apartmentId: { in: unitIds } } })
      : 0;
    if (bookingCount > 0) {
      return {
        success: false,
        error: `Impossibile eliminare: ci sono ${bookingCount} prenotazioni collegate alle unità. Rimuovile prima.`,
      };
    }

    await prisma.property.delete({ where: { id: propertyId } });
    revalidatePath("/dashboard/manager/apartments");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante l'eliminazione della struttura.";
    console.error("deleteStructure: errore", error);
    return { success: false, error: message };
  }
}

// Geocodifica un indirizzo su richiesta (pulsante "Trova sulla mappa" nella
// card Posizione della struttura). Restituisce lat/lng o un errore parlante.
export async function geocodeStructureAddress(
  address: string,
): Promise<{ success: true; latitude: number; longitude: number } | { success: false; error?: string }> {
  const trimmed = (address ?? "").trim();
  if (!trimmed) return { success: false, error: "Inserisci un indirizzo." };
  const geocoded = await geocodeAddress(trimmed);
  if (!geocoded) {
    return { success: false, error: "Indirizzo non trovato. Controllalo o inserisci le coordinate a mano." };
  }
  return { success: true, latitude: geocoded.lat, longitude: geocoded.lng };
}

// Aggiorna indirizzo + coordinate della struttura e le propaga a TUTTE le
// unità (un solo indirizzo per struttura). Corregge anche strutture nate a 0,0.
export async function updateStructureLocation(
  propertyId: string,
  input: { address: string; latitude: number; longitude: number },
): Promise<{ success: true; unitCount: number } | { success: false; error?: string }> {
  try {
    const orgId = await getCurrentOrg();
    const address = (input?.address ?? "").trim();
    const latitude = Number(input?.latitude);
    const longitude = Number(input?.longitude);

    if (!address) return { success: false, error: "L'indirizzo è obbligatorio." };
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return { success: false, error: "Latitudine non valida (deve essere tra -90 e 90)." };
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return { success: false, error: "Longitudine non valida (deve essere tra -180 e 180)." };
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId: orgId },
      select: { id: true },
    });
    if (!property) return { success: false, error: "Struttura non trovata." };

    const result = await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: { address, latitude, longitude },
      });
      const updated = await tx.apartment.updateMany({
        where: { propertyId, organizationId: orgId },
        data: { address, latitude, longitude },
      });
      return updated.count;
    });

    revalidatePath(`/dashboard/manager/strutture/${propertyId}`);
    revalidatePath("/dashboard/manager/apartments");
    revalidatePath("/dashboard/manager/mappa");
    return { success: true, unitCount: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante il salvataggio della posizione.";
    console.error("updateStructureLocation: errore", error);
    return { success: false, error: message };
  }
}

"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/src/lib/constants";
import { generateUniqueApartmentCode } from "@/src/lib/apartment-code";
import { geocodeAddress } from "@/src/lib/geocoding";
import { getCurrentOrg } from "@/src/lib/tenant";

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

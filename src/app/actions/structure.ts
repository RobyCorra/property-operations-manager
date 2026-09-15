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

    const property = await prisma.property.create({
      data: {
        id: randomUUID(),
        name,
        type,
        address,
        latitude,
        longitude,
        organizationId: orgId,
      },
    });

    let totalUnits = 0;

    for (const { cat, numbers } of prepared) {
      const master = await prisma.unitCategory.create({
        data: {
          id: randomUUID(),
          propertyId: property.id,
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

      for (const unitNumber of numbers) {
        const unitName = `${name} · ${unitNumber}`;
        const apartmentCode = await generateUniqueApartmentCode(`${name}-${unitNumber}`);
        await prisma.apartment.create({
          data: {
            id: randomUUID(),
            name: unitName,
            apartmentCode,
            address,
            latitude,
            longitude,
            squareMeters: master.squareMeters,
            bedrooms: master.bedrooms,
            bathrooms: master.bathrooms,
            maxGuests: master.maxGuests,
            bedConfig: (cat.bedConfig as object) ?? undefined,
            technicalProfile: (cat.technicalProfile as object) ?? undefined,
            accessInstructions: cat.accessInstructions ?? null,
            accessInfo: (cat.accessInfo as object) ?? undefined,
            organizationId: orgId,
            propertyId: property.id,
            unitCategoryId: master.id,
            unitNumber,
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

    revalidatePath("/dashboard/manager/apartments");
    return { success: true, propertyId: property.id, totalUnits };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante la creazione della struttura.";
    console.error("createStructure: errore", error);
    return { success: false, error: message };
  }
}

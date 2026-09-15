"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";

export type PropertyProductData = {
  name: string;
  emoji?: string;
  unit?: string;
  stock?: number;
  minStock?: number;
  price?: number;
  vat?: number;
};

async function assertPropertyInOrg(propertyId: string) {
  const orgId = await getCurrentOrg();
  const property = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: orgId },
    select: { id: true },
  });
  return property?.id ?? null;
}

async function recordPropertyMovement(args: {
  productId: string;
  delta: number;
  balance: number;
  reason: string;
  bookingId?: string | null;
  note?: string | null;
  tx?: typeof prisma;
}) {
  const client = args.tx ?? prisma;
  try {
    await client.propertyStockMovement.create({
      data: {
        id: randomUUID(),
        productId: args.productId,
        delta: args.delta,
        balance: args.balance,
        reason: args.reason,
        bookingId: args.bookingId ?? null,
        note: args.note ?? null,
      },
    });
  } catch (e) {
    console.error("recordPropertyMovement: errore", e);
  }
}

export async function getPropertyProducts(propertyId: string) {
  const ok = await assertPropertyInOrg(propertyId);
  if (!ok) return [];
  return prisma.propertyProduct.findMany({
    where: { propertyId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createPropertyProduct(propertyId: string, data: PropertyProductData) {
  try {
    const ok = await assertPropertyInOrg(propertyId);
    if (!ok) return { success: false, error: "Struttura non trovata." };
    const name = (data.name || "").trim();
    if (!name) return { success: false, error: "Il nome del prodotto è obbligatorio." };

    const stock = Math.max(0, Math.round(data.stock ?? 0));
    const id = randomUUID();
    await prisma.propertyProduct.create({
      data: {
        id,
        propertyId,
        name,
        emoji: data.emoji || "📦",
        unit: data.unit || "pz",
        stock,
        minStock: Math.max(0, Math.round(data.minStock ?? 0)),
        price: Math.max(0, data.price ?? 0),
        vat: Math.max(0, data.vat ?? 22),
      },
    });
    if (stock > 0) {
      await recordPropertyMovement({ productId: id, delta: stock, balance: stock, reason: "INITIAL" });
    }
    revalidatePath(`/dashboard/manager/strutture/${propertyId}`);
    return { success: true };
  } catch (error) {
    console.error("createPropertyProduct: errore", error);
    return { success: false, error: "Errore durante la creazione del prodotto." };
  }
}

export async function updatePropertyProduct(id: string, data: PropertyProductData) {
  try {
    const existing = await prisma.propertyProduct.findUnique({
      where: { id },
      select: { propertyId: true, property: { select: { organizationId: true } } },
    });
    if (!existing) return { success: false, error: "Prodotto non trovato." };
    const orgId = await getCurrentOrg();
    if (existing.property.organizationId !== orgId) return { success: false, error: "Non autorizzato." };

    const name = (data.name || "").trim();
    if (!name) return { success: false, error: "Il nome del prodotto è obbligatorio." };

    await prisma.propertyProduct.update({
      where: { id },
      data: {
        name,
        emoji: data.emoji || "📦",
        unit: data.unit || "pz",
        minStock: Math.max(0, Math.round(data.minStock ?? 0)),
        price: Math.max(0, data.price ?? 0),
        vat: Math.max(0, data.vat ?? 22),
      },
    });
    revalidatePath(`/dashboard/manager/strutture/${existing.propertyId}`);
    return { success: true };
  } catch (error) {
    console.error("updatePropertyProduct: errore", error);
    return { success: false, error: "Errore durante il salvataggio del prodotto." };
  }
}

export async function deletePropertyProduct(id: string) {
  try {
    const existing = await prisma.propertyProduct.findUnique({
      where: { id },
      select: { propertyId: true, property: { select: { organizationId: true } } },
    });
    if (!existing) return { success: false, error: "Prodotto non trovato." };
    const orgId = await getCurrentOrg();
    if (existing.property.organizationId !== orgId) return { success: false, error: "Non autorizzato." };

    await prisma.propertyProduct.delete({ where: { id } });

    // Rimuove il prodotto dalle mappe consumo di tutte le categorie della struttura.
    const categories = await prisma.unitCategory.findMany({
      where: { propertyId: existing.propertyId },
      select: { id: true, consumption: true },
    });
    for (const cat of categories) {
      const map = (cat.consumption as Record<string, number> | null) ?? {};
      if (id in map) {
        delete map[id];
        await prisma.unitCategory.update({ where: { id: cat.id }, data: { consumption: map } });
      }
    }

    revalidatePath(`/dashboard/manager/strutture/${existing.propertyId}`);
    return { success: true };
  } catch (error) {
    console.error("deletePropertyProduct: errore", error);
    return { success: false, error: "Errore durante l'eliminazione del prodotto." };
  }
}

export async function restockPropertyProduct(id: string, addQty: number) {
  try {
    const existing = await prisma.propertyProduct.findUnique({
      where: { id },
      select: { propertyId: true, stock: true, property: { select: { organizationId: true } } },
    });
    if (!existing) return { success: false, error: "Prodotto non trovato." };
    const orgId = await getCurrentOrg();
    if (existing.property.organizationId !== orgId) return { success: false, error: "Non autorizzato." };

    const delta = Math.round(addQty);
    const newStock = Math.max(0, existing.stock + delta);
    await prisma.propertyProduct.update({ where: { id }, data: { stock: newStock } });
    await recordPropertyMovement({
      productId: id,
      delta: newStock - existing.stock,
      balance: newStock,
      reason: delta >= 0 ? "RESTOCK" : "ADJUSTMENT",
    });
    revalidatePath(`/dashboard/manager/strutture/${existing.propertyId}`);
    return { success: true };
  } catch (error) {
    console.error("restockPropertyProduct: errore", error);
    return { success: false, error: "Errore durante la ricarica." };
  }
}

// Salva la mappa consumo (prodotto→quantità) di una categoria.
export async function updateCategoryConsumption(categoryId: string, consumption: Record<string, number>) {
  try {
    const orgId = await getCurrentOrg();
    const category = await prisma.unitCategory.findFirst({
      where: { id: categoryId, property: { organizationId: orgId } },
      select: { id: true, propertyId: true },
    });
    if (!category) return { success: false, error: "Categoria non trovata." };

    // Normalizza: solo quantità > 0.
    const clean: Record<string, number> = {};
    for (const [k, v] of Object.entries(consumption || {})) {
      const q = Math.max(0, Math.round(Number(v) || 0));
      if (q > 0) clean[k] = q;
    }

    await prisma.unitCategory.update({ where: { id: categoryId }, data: { consumption: clean } });
    revalidatePath(`/dashboard/manager/strutture/${category.propertyId}`);
    return { success: true };
  } catch (error) {
    console.error("updateCategoryConsumption: errore", error);
    return { success: false, error: "Errore durante il salvataggio dei consumi." };
  }
}

// Sottrae dallo stock UNICO della struttura i consumi definiti dalla categoria
// dell'unità che ha effettuato il check-in. Restituisce le allerte sotto scorta.
export async function consumeStructureOnCheckin(args: {
  unitCategoryId: string;
  propertyId: string;
  bookingId?: string | null;
  guestName?: string | null;
}): Promise<string[]> {
  const alerts: string[] = [];
  try {
    const category = await prisma.unitCategory.findUnique({
      where: { id: args.unitCategoryId },
      select: { consumption: true },
    });
    const map = (category?.consumption as Record<string, number> | null) ?? {};
    const entries = Object.entries(map).filter(([, q]) => (Number(q) || 0) > 0);
    if (entries.length === 0) return alerts;

    for (const [productId, qtyRaw] of entries) {
      const qty = Math.max(0, Math.round(Number(qtyRaw) || 0));
      if (qty === 0) continue;
      const product = await prisma.propertyProduct.findFirst({
        where: { id: productId, propertyId: args.propertyId },
      });
      if (!product) continue;

      const newStock = Math.max(0, product.stock - qty);
      const applied = product.stock - newStock;
      await prisma.propertyProduct.update({ where: { id: product.id }, data: { stock: newStock } });
      await recordPropertyMovement({
        productId: product.id,
        delta: -applied,
        balance: newStock,
        reason: "CHECKIN",
        bookingId: args.bookingId ?? null,
        note: args.guestName ?? null,
      });
      if (newStock <= product.minStock) {
        alerts.push(`${product.emoji} ${product.name} (scorta: ${newStock} ${product.unit}, minima: ${product.minStock})`);
      }
    }
  } catch (error) {
    console.error("consumeStructureOnCheckin: errore", error);
  }
  return alerts;
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { sendPushToRole } from "@/src/lib/push";
import { getCurrentOrg } from "@/src/lib/tenant";
import type { Role } from "@/src/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WarehouseConsumptionType = "MANUAL" | "STATIC" | "DYNAMIC";
export type WarehouseConsumptionBasis = "BATHROOM" | "GUEST" | "BEDROOM";

export type WarehouseFormData = {
  name: string;
  emoji: string;
  unit: string;
  stock: number;
  minStock: number;
  consumptionType: WarehouseConsumptionType;
  consumptionBasis: WarehouseConsumptionBasis;
  consumptionValue: number;
  price: number;
  vat: number;
};

const PATH = "/dashboard/manager/magazzino";

// Registra un movimento senza far fallire l'operazione principale se la tabella
// non esiste ancora (migrazione non applicata in produzione).
async function recordMovement(data: {
  productId: string;
  delta: number;
  balance: number;
  reason: "INITIAL" | "CHECKIN" | "RESTOCK" | "ADJUSTMENT" | "USAGE";
  bookingId?: string | null;
  note?: string | null;
}) {
  try {
    await prisma.warehouseStockMovement.create({ data });
  } catch (error) {
    console.error("warehouse recordMovement error:", error);
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getWarehouseProducts() {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return [];
    return await prisma.warehouseProduct.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("getWarehouseProducts error:", error);
    return [];
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createWarehouseProduct(data: WarehouseFormData) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    const stock = Math.max(0, data.stock);
    const created = await prisma.warehouseProduct.create({
      data: {
        organizationId: orgId,
        name: data.name.trim(),
        emoji: data.emoji.trim() || "📦",
        unit: data.unit.trim() || "pz",
        stock,
        minStock: Math.max(0, data.minStock),
        consumptionType: data.consumptionType,
        consumptionBasis: data.consumptionBasis,
        consumptionValue: Math.max(0, data.consumptionValue),
        price: Math.max(0, data.price),
        vat: Math.max(0, data.vat),
      },
    });
    await recordMovement({ productId: created.id, delta: stock, balance: stock, reason: "INITIAL" });
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    console.error("createWarehouseProduct error:", error);
    return { success: false, error: "Errore durante la creazione del prodotto" };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateWarehouseProduct(id: string, data: WarehouseFormData) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    const prev = await prisma.warehouseProduct.findFirst({
      where: { id, organizationId: orgId },
      select: { stock: true },
    });
    if (!prev) return { success: false, error: "Prodotto non trovato." };
    const newStock = Math.max(0, data.stock);
    await prisma.warehouseProduct.update({
      where: { id },
      data: {
        name: data.name.trim(),
        emoji: data.emoji.trim() || "📦",
        unit: data.unit.trim() || "pz",
        stock: newStock,
        minStock: Math.max(0, data.minStock),
        consumptionType: data.consumptionType,
        consumptionBasis: data.consumptionBasis,
        consumptionValue: Math.max(0, data.consumptionValue),
        price: Math.max(0, data.price),
        vat: Math.max(0, data.vat),
      },
    });
    if (prev.stock !== newStock) {
      await recordMovement({ productId: id, delta: newStock - prev.stock, balance: newStock, reason: "ADJUSTMENT" });
    }
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    console.error("updateWarehouseProduct error:", error);
    return { success: false, error: "Errore durante l'aggiornamento del prodotto" };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteWarehouseProduct(id: string) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    await prisma.warehouseProduct.deleteMany({ where: { id, organizationId: orgId } });
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    console.error("deleteWarehouseProduct error:", error);
    return { success: false, error: "Errore durante l'eliminazione del prodotto" };
  }
}

// ─── Rifornimento ─────────────────────────────────────────────────────────────

export async function restockWarehouseProduct(id: string, addQty: number) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    const qty = Math.max(0, addQty);
    const target = await prisma.warehouseProduct.findFirst({ where: { id, organizationId: orgId }, select: { id: true } });
    if (!target) return { success: false, error: "Prodotto non trovato." };
    const updated = await prisma.warehouseProduct.update({
      where: { id },
      data: { stock: { increment: qty } },
      select: { stock: true },
    });
    if (qty > 0) {
      await recordMovement({ productId: id, delta: qty, balance: updated.stock, reason: "RESTOCK" });
    }
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    console.error("restockWarehouseProduct error:", error);
    return { success: false, error: "Errore durante il rifornimento" };
  }
}

// ─── Preleva (consumo manuale) ────────────────────────────────────────────────

export async function consumeWarehouseProduct(id: string, qty: number, note?: string) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    const amount = Math.max(0, qty);
    const product = await prisma.warehouseProduct.findFirst({
      where: { id, organizationId: orgId },
      select: { stock: true },
    });
    if (!product) return { success: false, error: "Prodotto non trovato." };
    const newStock = Math.max(0, product.stock - amount);
    const applied = product.stock - newStock;
    if (applied > 0) {
      await prisma.warehouseProduct.update({ where: { id }, data: { stock: newStock } });
      await recordMovement({ productId: id, delta: -applied, balance: newStock, reason: "USAGE", note: note?.trim() || null });
    }
    revalidatePath(PATH);
    return { success: true, newStock };
  } catch (error) {
    console.error("consumeWarehouseProduct error:", error);
    return { success: false, error: "Errore durante il prelievo" };
  }
}

// ─── Consumo automatico al check-in ───────────────────────────────────────────
// Chiamata da consumeProductsOnCheckin (product.ts) per ogni check-in confermato.
// Scala i prodotti di magazzino STATIC/DYNAMIC dell'organizzazione in base
// all'appartamento del check-in. Idempotente perché il chiamante consuma una
// sola volta per prenotazione (booking.productsConsumedAt).
export async function consumeWarehouseOnCheckin(params: {
  organizationId: string;
  bookingId: string;
  guests: number;
  bathrooms: number;
  bedrooms: number;
  guestName?: string | null;
}) {
  try {
    const products = await prisma.warehouseProduct.findMany({
      where: { organizationId: params.organizationId, consumptionType: { in: ["STATIC", "DYNAMIC"] } },
    });
    for (const p of products) {
      let consumed = p.consumptionValue;
      if (p.consumptionType === "DYNAMIC") {
        const basis =
          p.consumptionBasis === "GUEST" ? Math.max(1, params.guests)
          : p.consumptionBasis === "BEDROOM" ? Math.max(0, params.bedrooms)
          : Math.max(0, params.bathrooms);
        consumed = Math.ceil(p.consumptionValue * basis);
      }
      const newStock = Math.max(0, p.stock - consumed);
      const applied = p.stock - newStock;
      await prisma.warehouseProduct.update({ where: { id: p.id }, data: { stock: newStock } });
      await recordMovement({
        productId: p.id,
        delta: -applied,
        balance: newStock,
        reason: "CHECKIN",
        bookingId: params.bookingId,
        note: params.guestName ?? null,
      });
    }
  } catch (error) {
    console.error("consumeWarehouseOnCheckin error:", error);
  }
}

// ─── Storico per intervallo ───────────────────────────────────────────────────

export type WhStockReason = "INITIAL" | "CHECKIN" | "RESTOCK" | "ADJUSTMENT" | "USAGE";

export type WhStockMovementItem = {
  id: string;
  delta: number;
  balance: number;
  reason: WhStockReason;
  note: string | null;
  createdAt: string;
};

export type WhStockHistoryResult = {
  initialBalance: number;
  finalBalance: number;
  consumed: number;       // tutte le uscite: check-in + preleva + riduzioni manuali
  added: number;          // tutte le entrate: rifornimenti + aumenti manuali
  checkinCount: number;
  usageCount: number;
  manualOutCount: number;
  restockCount: number;
  manualInCount: number;
  movements: WhStockMovementItem[];
};

export async function getWarehouseStockHistory(
  productId: string,
  fromYMD: string,
  toYMD: string
): Promise<WhStockHistoryResult | null> {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return null;
    const product = await prisma.warehouseProduct.findFirst({
      where: { id: productId, organizationId: orgId },
      select: { id: true },
    });
    if (!product) return null;

    const fromStart = new Date(`${fromYMD}T00:00:00.000Z`);
    const toEnd = new Date(`${toYMD}T23:59:59.999Z`);

    const before = await prisma.warehouseStockMovement.findFirst({
      where: { productId, createdAt: { lt: fromStart } },
      orderBy: { createdAt: "desc" },
      select: { balance: true },
    });
    const initialBalance = before?.balance ?? 0;

    const inRange = await prisma.warehouseStockMovement.findMany({
      where: { productId, createdAt: { gte: fromStart, lte: toEnd } },
      orderBy: { createdAt: "desc" },
    });
    const finalBalance = inRange.length > 0 ? inRange[0].balance : initialBalance;

    let consumed = 0, added = 0;
    let checkinCount = 0, usageCount = 0, manualOutCount = 0, restockCount = 0, manualInCount = 0;
    for (const m of inRange) {
      if (m.reason === "INITIAL") continue;
      if (m.delta < 0) {
        consumed += -m.delta;
        if (m.reason === "CHECKIN") checkinCount++;
        else if (m.reason === "USAGE") usageCount++;
        else manualOutCount++;
      } else if (m.delta > 0) {
        added += m.delta;
        if (m.reason === "RESTOCK") restockCount++; else manualInCount++;
      }
    }

    return {
      initialBalance,
      finalBalance,
      consumed,
      added,
      checkinCount,
      usageCount,
      manualOutCount,
      restockCount,
      manualInCount,
      movements: inRange.map((m) => ({
        id: m.id,
        delta: m.delta,
        balance: m.balance,
        reason: m.reason as WhStockReason,
        note: m.note,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getWarehouseStockHistory error:", error);
    return null;
  }
}

// Totali storici per il calcolo costi sulla card del magazzino.
export type WhCostTotals = Record<string, { consumed: number; purchased: number }>;

export async function getWarehouseCostTotals(): Promise<WhCostTotals> {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return {};
    const products = await prisma.warehouseProduct.findMany({ where: { organizationId: orgId }, select: { id: true } });
    const ids = products.map((p) => p.id);
    if (ids.length === 0) return {};
    const [outAgg, inAgg] = await Promise.all([
      prisma.warehouseStockMovement.groupBy({ by: ["productId"], where: { productId: { in: ids }, delta: { lt: 0 } }, _sum: { delta: true } }),
      prisma.warehouseStockMovement.groupBy({ by: ["productId"], where: { productId: { in: ids }, delta: { gt: 0 } }, _sum: { delta: true } }),
    ]);
    const totals: WhCostTotals = {};
    for (const id of ids) totals[id] = { consumed: 0, purchased: 0 };
    for (const r of outAgg) totals[r.productId].consumed = -(r._sum.delta ?? 0);
    for (const r of inAgg) totals[r.productId].purchased = r._sum.delta ?? 0;
    return totals;
  } catch (error) {
    console.error("getWarehouseCostTotals error:", error);
    return {};
  }
}

// Notifica scorta bassa magazzino (chiamabile dopo consumi automatici).
export async function checkWarehouseLowStock(organizationId: string) {
  try {
    const low = await prisma.warehouseProduct.findMany({
      where: { organizationId },
    });
    const alerts = low.filter((p) => p.stock <= p.minStock);
    if (alerts.length > 0) {
      await sendPushToRole("MANAGER" as Role, {
        title: "🔴 Magazzino — scorta bassa",
        body: `${alerts.length} prodotto/i sotto la scorta minima.`,
        url: PATH,
        tag: "warehouse-low-stock",
      }, undefined, organizationId).catch(console.error);
    }
  } catch (error) {
    console.error("checkWarehouseLowStock error:", error);
  }
}

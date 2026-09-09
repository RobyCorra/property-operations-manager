"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { sendPushToRole } from "@/src/lib/push";
import { getCurrentOrg } from "@/src/lib/tenant";
import { consumeWarehouseOnCheckin } from "@/src/app/actions/warehouse";
import type { Role } from "@/src/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductFormData = {
  name: string;
  emoji: string;
  unit: string;
  stock: number;
  minStock: number;
  consumptionType: "STATIC" | "DYNAMIC_PER_GUEST";
  consumptionValue: number;
};

// Registra un movimento di scorta senza mai far fallire l'operazione principale:
// se la tabella StockMovement non esiste ancora (migrazione non ancora applicata
// in produzione) logga e prosegue, così restock/consumo/creazione non si rompono.
async function recordMovement(data: {
  productId: string;
  delta: number;
  balance: number;
  reason: "INITIAL" | "CHECKIN" | "RESTOCK" | "ADJUSTMENT";
  bookingId?: string | null;
  note?: string | null;
}) {
  try {
    await prisma.stockMovement.create({ data });
  } catch (error) {
    console.error("recordMovement error:", error);
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getApartmentProducts(apartmentId: string) {
  try {
    const products = await prisma.apartmentProduct.findMany({
      where: { apartmentId },
      orderBy: [
        // Critici prima (stock <= minStock), poi per nome
        { createdAt: "asc" },
      ],
    });
    return products;
  } catch (error) {
    console.error("getApartmentProducts error:", error);
    return [];
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(apartmentId: string, data: ProductFormData) {
  try {
    const stock = Math.max(0, data.stock);
    const created = await prisma.apartmentProduct.create({
      data: {
        apartmentId,
        name: data.name.trim(),
        emoji: data.emoji.trim() || "📦",
        unit: data.unit.trim() || "pz",
        stock,
        minStock: Math.max(0, data.minStock),
        consumptionType: data.consumptionType,
        consumptionValue: Math.max(0, data.consumptionValue),
      },
    });
    // Movimento iniziale: fissa il saldo di partenza per lo storico.
    await recordMovement({ productId: created.id, delta: stock, balance: stock, reason: "INITIAL" });
    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/products`);
    return { success: true };
  } catch (error) {
    console.error("createProduct error:", error);
    return { success: false, error: "Errore durante la creazione del prodotto" };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(id: string, apartmentId: string, data: ProductFormData) {
  try {
    const prev = await prisma.apartmentProduct.findUnique({ where: { id }, select: { stock: true } });
    const newStock = Math.max(0, data.stock);
    await prisma.apartmentProduct.update({
      where: { id },
      data: {
        name: data.name.trim(),
        emoji: data.emoji.trim() || "📦",
        unit: data.unit.trim() || "pz",
        stock: newStock,
        minStock: Math.max(0, data.minStock),
        consumptionType: data.consumptionType,
        consumptionValue: Math.max(0, data.consumptionValue),
      },
    });
    // Registra una rettifica solo se il valore di scorta è stato cambiato a mano.
    if (prev && prev.stock !== newStock) {
      await recordMovement({ productId: id, delta: newStock - prev.stock, balance: newStock, reason: "ADJUSTMENT" });
    }
    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/products`);
    return { success: true };
  } catch (error) {
    console.error("updateProduct error:", error);
    return { success: false, error: "Errore durante l'aggiornamento del prodotto" };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProduct(id: string, apartmentId: string) {
  try {
    await prisma.apartmentProduct.delete({ where: { id } });
    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/products`);
    return { success: true };
  } catch (error) {
    console.error("deleteProduct error:", error);
    return { success: false, error: "Errore durante l'eliminazione del prodotto" };
  }
}

// ─── Rifornimento (aggiunta manuale scorta) ───────────────────────────────────

export async function restockProduct(id: string, apartmentId: string, addQty: number) {
  try {
    const qty = Math.max(0, addQty);
    const updated = await prisma.apartmentProduct.update({
      where: { id },
      data: { stock: { increment: qty } },
      select: { stock: true },
    });
    if (qty > 0) {
      await recordMovement({ productId: id, delta: qty, balance: updated.stock, reason: "RESTOCK" });
    }
    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/products`);
    return { success: true };
  } catch (error) {
    console.error("restockProduct error:", error);
    return { success: false, error: "Errore durante il rifornimento" };
  }
}

// ─── Consumo per check-in ─────────────────────────────────────────────────────
// Chiamata ogni volta che un check-in viene registrato/confermato.
// Sottrae il consumo dalla scorta e crea notifiche se sotto minimo.

export async function consumeProductsOnCheckin(bookingId: string) {
  try {
    // Guardia di idempotenza atomica: consuma solo se non è già stato fatto.
    // updateMany con productsConsumedAt=null vince la corsa tra pulsante manuale e cron.
    const claim = await prisma.booking.updateMany({
      where: { id: bookingId, status: { not: "CANCELLED" }, productsConsumedAt: null },
      data: { productsConsumedAt: new Date() },
    });
    if (claim.count === 0) {
      // Già consumato (o prenotazione annullata): non sottrarre di nuovo.
      return { success: true, skipped: true, alerts: [] as string[] };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { apartmentId: true, totalGuests: true, guestName: true },
    });
    if (!booking) return { success: true, skipped: true, alerts: [] as string[] };

    const apartmentId = booking.apartmentId;
    const guestCount = booking.totalGuests ?? 1;

    const products = await prisma.apartmentProduct.findMany({
      where: { apartmentId },
    });

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: { name: true, organizationId: true, bathrooms: true, bedrooms: true },
    });

    const alerts: string[] = [];

    for (const product of products) {
      const consumed =
        product.consumptionType === "DYNAMIC_PER_GUEST"
          ? Math.ceil(product.consumptionValue * guestCount)
          : product.consumptionValue;

      const newStock = Math.max(0, product.stock - consumed);
      const applied = product.stock - newStock; // quantità effettivamente sottratta

      await prisma.apartmentProduct.update({
        where: { id: product.id },
        data: { stock: newStock },
      });

      // Registra il consumo per lo storico (anche 0, così il check-in resta tracciato).
      await recordMovement({
        productId: product.id,
        delta: -applied,
        balance: newStock,
        reason: "CHECKIN",
        bookingId,
        note: booking.guestName ?? null,
      });

      // Allerta se stock scende sotto o uguale alla minima
      if (newStock <= product.minStock) {
        alerts.push(`${product.emoji} ${product.name} (scorta: ${newStock} ${product.unit}, minima: ${product.minStock})`);
      }
    }

    // Consumo automatico del MAGAZZINO dell'organizzazione per questo check-in
    // (prodotti STATIC/DYNAMIC). Idempotente perché siamo dentro la guardia
    // productsConsumedAt: gira una sola volta per prenotazione.
    if (apartment?.organizationId) {
      await consumeWarehouseOnCheckin({
        organizationId: apartment.organizationId,
        bookingId,
        guests: guestCount,
        bathrooms: apartment.bathrooms ?? 0,
        bedrooms: apartment.bedrooms ?? 0,
        guestName: booking.guestName ?? null,
      });
    }

    // Crea notifica e push se ci sono prodotti sotto minima
    if (alerts.length > 0 && apartment) {
      await prisma.notification.create({
        data: {
          type: "PRODUCT_LOW_STOCK",
          title: `⚠️ Scorta bassa — ${apartment.name}`,
          message: `${alerts.length} prodotto/i sotto la scorta minima:\n${alerts.join("\n")}`,
          apartmentId,
        },
      });
      await sendPushToRole("MANAGER" as Role, {
        title: `🔴 Scorta bassa — ${apartment.name}`,
        body: `${alerts.length} prodotto/i sotto la scorta minima dopo il check-in.`,
        url: `/dashboard/manager/apartments/${apartmentId}/products`,
        tag: `low-stock-${apartmentId}`,
      }, undefined, apartment.organizationId).catch(console.error);
    }

    revalidatePath(`/dashboard/manager/apartments/${apartmentId}/products`);
    return { success: true, alerts };
  } catch (error) {
    console.error("consumeProductsOnCheckin error:", error);
    return { success: false, error: "Errore durante il calcolo del consumo" };
  }
}

// ─── Preview consumo per il prossimo check-in ────────────────────────────────

export async function getConsumptionPreview(apartmentId: string, guestCount: number) {
  try {
    const products = await prisma.apartmentProduct.findMany({
      where: { apartmentId },
    });

    return products.map((p) => {
      const consumed =
        p.consumptionType === "DYNAMIC_PER_GUEST"
          ? Math.ceil(p.consumptionValue * guestCount)
          : p.consumptionValue;
      const stockAfter = Math.max(0, p.stock - consumed);
      return {
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        unit: p.unit,
        consumed,
        stockAfter,
        willBeAlert: stockAfter <= p.minStock,
      };
    });
  } catch {
    return [];
  }
}

// ─── Storico scorta per intervallo di date ────────────────────────────────────

export type StockReason = "INITIAL" | "CHECKIN" | "RESTOCK" | "ADJUSTMENT";

export type StockMovementItem = {
  id: string;
  delta: number;
  balance: number;
  reason: StockReason;
  note: string | null;
  createdAt: string; // ISO
};

export type StockHistoryResult = {
  initialBalance: number;
  finalBalance: number;
  consumed: number;    // totale sottratto ai check-in (positivo)
  restocked: number;   // totale rifornito (positivo)
  adjustments: number; // netto rettifiche manuali (±)
  checkinCount: number;
  restockCount: number;
  adjustmentCount: number;
  movements: StockMovementItem[]; // nel periodo, dal più recente
};

// Ritorna il saldo iniziale/finale e il dettaglio dei movimenti in [from, to].
// from/to sono date YYYY-MM-DD; i confini di giorno sono trattati in UTC come
// nel resto dell'app (cron). Restituisce null se il prodotto non è dell'org.
export async function getProductStockHistory(
  productId: string,
  fromYMD: string,
  toYMD: string
): Promise<StockHistoryResult | null> {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return null;
    const product = await prisma.apartmentProduct.findFirst({
      where: { id: productId, apartment: { organizationId: orgId } },
      select: { id: true },
    });
    if (!product) return null;

    const fromStart = new Date(`${fromYMD}T00:00:00.000Z`);
    const toEnd = new Date(`${toYMD}T23:59:59.999Z`);

    // Saldo iniziale = ultimo movimento prima dell'inizio periodo (0 se nessuno).
    const before = await prisma.stockMovement.findFirst({
      where: { productId, createdAt: { lt: fromStart } },
      orderBy: { createdAt: "desc" },
      select: { balance: true },
    });
    const initialBalance = before?.balance ?? 0;

    const inRange = await prisma.stockMovement.findMany({
      where: { productId, createdAt: { gte: fromStart, lte: toEnd } },
      orderBy: { createdAt: "desc" },
    });

    const finalBalance = inRange.length > 0 ? inRange[0].balance : initialBalance;

    let consumed = 0, restocked = 0, adjustments = 0;
    let checkinCount = 0, restockCount = 0, adjustmentCount = 0;
    for (const m of inRange) {
      if (m.reason === "CHECKIN") { consumed += -m.delta; checkinCount++; }
      else if (m.reason === "RESTOCK") { restocked += m.delta; restockCount++; }
      else if (m.reason === "ADJUSTMENT") { adjustments += m.delta; adjustmentCount++; }
    }

    return {
      initialBalance,
      finalBalance,
      consumed,
      restocked,
      adjustments,
      checkinCount,
      restockCount,
      adjustmentCount,
      movements: inRange.map((m) => ({
        id: m.id,
        delta: m.delta,
        balance: m.balance,
        reason: m.reason as StockReason,
        note: m.note,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getProductStockHistory error:", error);
    return null;
  }
}

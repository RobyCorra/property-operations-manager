"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { sendPushToRole } from "@/src/lib/push";
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
    await prisma.apartmentProduct.create({
      data: {
        apartmentId,
        name: data.name.trim(),
        emoji: data.emoji.trim() || "📦",
        unit: data.unit.trim() || "pz",
        stock: Math.max(0, data.stock),
        minStock: Math.max(0, data.minStock),
        consumptionType: data.consumptionType,
        consumptionValue: Math.max(0, data.consumptionValue),
      },
    });
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
    await prisma.apartmentProduct.update({
      where: { id },
      data: {
        name: data.name.trim(),
        emoji: data.emoji.trim() || "📦",
        unit: data.unit.trim() || "pz",
        stock: Math.max(0, data.stock),
        minStock: Math.max(0, data.minStock),
        consumptionType: data.consumptionType,
        consumptionValue: Math.max(0, data.consumptionValue),
      },
    });
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
    await prisma.apartmentProduct.update({
      where: { id },
      data: { stock: { increment: Math.max(0, addQty) } },
    });
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
      select: { apartmentId: true, totalGuests: true },
    });
    if (!booking) return { success: true, skipped: true, alerts: [] as string[] };

    const apartmentId = booking.apartmentId;
    const guestCount = booking.totalGuests ?? 1;

    const products = await prisma.apartmentProduct.findMany({
      where: { apartmentId },
    });

    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: { name: true, organizationId: true },
    });

    const alerts: string[] = [];

    for (const product of products) {
      const consumed =
        product.consumptionType === "DYNAMIC_PER_GUEST"
          ? Math.ceil(product.consumptionValue * guestCount)
          : product.consumptionValue;

      const newStock = Math.max(0, product.stock - consumed);

      await prisma.apartmentProduct.update({
        where: { id: product.id },
        data: { stock: newStock },
      });

      // Allerta se stock scende sotto o uguale alla minima
      if (newStock <= product.minStock) {
        alerts.push(`${product.emoji} ${product.name} (scorta: ${newStock} ${product.unit}, minima: ${product.minStock})`);
      }
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

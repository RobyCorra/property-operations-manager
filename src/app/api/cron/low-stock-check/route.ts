import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendPushToRole } from "@/src/lib/push";
import type { Role } from "@/src/generated/prisma/client";

// GET /api/cron/low-stock-check
// Scansiona tutti i prodotti e invia notifica per quelli già sotto la scorta minima.
// Vercel Cron: ogni giorno alle 09:00 UTC (10:00 ora italiana, 11:00 in estate).
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prendi tutti i prodotti e filtra quelli stock <= minStock in JS
  // (Prisma non supporta confronto tra due colonne in where)
  const allProducts = await prisma.apartmentProduct.findMany({
    include: { apartment: { select: { id: true, name: true, organizationId: true } } },
  });
  const lowProducts = allProducts.filter(p => p.stock <= p.minStock);

  if (lowProducts.length === 0) {
    return NextResponse.json({ checked: true, alerts: 0 });
  }

  // Raggruppa per appartamento
  const byApartment = new Map<string, typeof lowProducts>();
  for (const p of lowProducts) {
    const list = byApartment.get(p.apartmentId) ?? [];
    list.push(p);
    byApartment.set(p.apartmentId, list);
  }

  let totalAlerts = 0;

  for (const [apartmentId, products] of byApartment) {
    const apt = products[0].apartment;
    if (!apt) continue;

    const lines = products.map(
      p => `${p.emoji} ${p.name}: ${p.stock} ${p.unit} (min: ${p.minStock})`
    );

    // Evita notifiche duplicate: salta se ne esiste già una non letta nelle ultime 12h
    const recent = await prisma.notification.findFirst({
      where: {
        apartmentId,
        type: "PRODUCT_LOW_STOCK",
        isRead: false,
        createdAt: { gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      },
    });
    if (recent) continue;

    await prisma.notification.create({
      data: {
        type: "PRODUCT_LOW_STOCK",
        title: `⚠️ Scorta bassa — ${apt.name}`,
        message: `${products.length} prodotto/i sotto la scorta minima:\n${lines.join("\n")}`,
        apartmentId,
      },
    });

    await sendPushToRole("MANAGER" as Role, {
      title: `🔴 Scorta bassa — ${apt.name}`,
      body: `${products.length} prodotto/i sotto la scorta minima.`,
      url: `/dashboard/manager/apartments/${apartmentId}/products`,
      tag: `low-stock-${apartmentId}`,
    }, undefined, apt.organizationId).catch(console.error);

    totalAlerts++;
  }

  console.log(`[CRON] low-stock-check: ${totalAlerts} alert inviati su ${byApartment.size} appartamenti`);
  return NextResponse.json({ checked: true, alerts: totalAlerts });
}

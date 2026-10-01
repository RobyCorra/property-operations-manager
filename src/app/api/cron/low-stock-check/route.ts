import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { sendPushToRole } from "@/src/lib/push";
import type { Role } from "@/src/generated/prisma/client";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allProducts = await prisma.apartmentProduct.findMany({
    include: { apartment: { select: { id: true, name: true, organizationId: true } } },
  });
  const lowProducts = allProducts.filter(p => p.stock <= p.minStock);

  if (lowProducts.length === 0) {
    return NextResponse.json({ checked: true, alerts: 0 });
  }

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

    await sendPushToRole("MANAGER" as Role, {
      title: `🔴 Scorta bassa — ${apt.name}`,
      body: `${products.length} prodotto/i sotto la scorta minima.`,
      url: `/dashboard/manager/messages`,
      tag: `low-stock-${apartmentId}`,
    }, undefined, apt.organizationId).catch(console.error);

    totalAlerts++;
  }

  console.log(`[CRON] low-stock-check: ${totalAlerts} alert inviati su ${byApartment.size} appartamenti`);
  return NextResponse.json({ checked: true, alerts: totalAlerts });
}

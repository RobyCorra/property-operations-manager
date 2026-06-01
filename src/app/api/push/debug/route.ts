import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// GET /api/push/debug — conta le subscription per ruolo (solo in produzione per manager)
export async function GET() {
  try {
    const subs = await prisma.pushSubscription.findMany({
      include: { user: { select: { name: true, role: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const summary = subs.map((s) => ({
      id: s.id,
      user: s.user.name,
      role: s.user.role,
      email: s.user.email,
      endpointShort: s.endpoint.slice(-30),
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ total: subs.length, subscriptions: summary });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const { endpoint, keys } = await req.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Subscription non valida" }, { status: 400 });
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      update: { userId, p256dh: keys.p256dh, auth: keys.auth },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("push subscribe error:", error);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (endpoint) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

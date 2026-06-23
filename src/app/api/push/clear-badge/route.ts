import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { sendApns } from "@/src/lib/apns";
import { sendFcm } from "@/src/lib/fcm";

// POST /api/push/clear-badge — azzera il badge sull'icona dell'app
export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

    const [apnsTokens, fcmTokens] = await Promise.all([
      prisma.apnsToken.findMany({ where: { userId }, select: { token: true } }),
      prisma.fcmToken.findMany({ where: { userId }, select: { token: true } }),
    ]);

    const silentPayload = { title: "", body: "", badge: 0 };

    await Promise.all([
      sendApns(apnsTokens.map(t => t.token), silentPayload).catch(() => {}),
      fcmTokens.length
        ? sendFcm(fcmTokens.map(t => t.token), silentPayload).catch(() => {})
        : Promise.resolve(),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

// GET /api/push/debug — riepilogo canali push (web, APNs iOS, FCM Android).
// Mostra in evidenza i token dell'utente corrente, così è facile verificare dal
// dispositivo se la registrazione push è andata a buon fine.
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value ?? null;

    const [subs, apns, fcm] = await Promise.all([
      prisma.pushSubscription.findMany({
        include: { user: { select: { name: true, role: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.apnsToken.findMany({ select: { userId: true, token: true } }),
      prisma.fcmToken.findMany({ select: { userId: true, token: true } }),
    ]);

    const me = userId
      ? {
          userId,
          webSubscriptions: subs.filter((s) => s.userId === userId).length,
          apnsTokens: apns.filter((t) => t.userId === userId).length,
          fcmTokens: fcm.filter((t) => t.userId === userId).length,
          fcmTokenShort: fcm.filter((t) => t.userId === userId).map((t) => t.token.slice(-12)),
        }
      : null;

    return NextResponse.json({
      me,
      totals: { web: subs.length, apns: apns.length, fcm: fcm.length },
      webSubscriptions: subs.map((s) => ({
        user: s.user.name,
        role: s.user.role,
        endpointShort: s.endpoint.slice(-30),
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendPushToUser, sendPushToRole } from "@/src/lib/push";
import type { Role } from "@/src/generated/prisma/client";

// POST /api/push/test — invia un push di test
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const { target } = await req.json(); // "self" | "MANAGER" | "CLEANER" | ...

    let fcmResult = null;
    if (target === "self") {
      const result = await sendPushToUser(userId, {
        title: "🔔 Test notifica",
        body: "Le notifiche push funzionano correttamente!",
        tag: "push-test",
        url: "/dashboard/manager",
      });
      fcmResult = result.fcm;
    } else {
      await sendPushToRole(target as Role, {
        title: "🔔 Test notifica",
        body: `Push di test inviato al ruolo ${target}.`,
        tag: "push-test",
        url: "/dashboard/manager",
      });
    }

    return NextResponse.json({ success: true, fcm: fcmResult });
  } catch (error) {
    console.error("push test error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

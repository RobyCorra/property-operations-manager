import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value ?? null;
}

// Registra token FCM (Android) per l'utente corrente
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  await prisma.fcmToken.upsert({
    where: { token },
    update: { userId },
    create: { userId, token },
  });

  return NextResponse.json({ ok: true });
}

// Rimuovi token (logout / revoca)
export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  await prisma.fcmToken.deleteMany({ where: { token, userId } });

  return NextResponse.json({ ok: true });
}

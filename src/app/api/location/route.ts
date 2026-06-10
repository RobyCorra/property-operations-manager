import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value ?? null;
}

// Cleaner aggiorna la sua posizione (chiamato ogni 30s)
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { latitude, longitude, accuracy } = await req.json();
  if (!latitude || !longitude) return NextResponse.json({ error: "Missing coords" }, { status: 400 });

  await prisma.cleanerLocation.upsert({
    where: { userId },
    update: { latitude, longitude, accuracy: accuracy ?? null },
    create: { userId, latitude, longitude, accuracy: accuracy ?? null },
  });

  return NextResponse.json({ ok: true });
}

// Manager legge le posizioni di tutti i cleaner della sua org
export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Trova la org del manager
  const manager = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true },
  });
  if (!manager || manager.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Posizioni cleaner+manutentori attivi negli ultimi 5 minuti
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  const locations = await prisma.cleanerLocation.findMany({
    where: {
      updatedAt: { gte: fiveMinAgo },
      user: {
        organizationId: manager.organizationId,
        role: { in: ["CLEANER", "MAINTENANCE"] },
      },
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json(locations);
}

// Cleaner rimuove la sua posizione (logout / fine turno)
export async function DELETE() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.cleanerLocation.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}

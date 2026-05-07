import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRaw`ALTER TABLE "Apartment" ADD COLUMN IF NOT EXISTS "accessInfo" JSONB`;
    return NextResponse.json({ ok: true, message: "Migration applicata con successo." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}

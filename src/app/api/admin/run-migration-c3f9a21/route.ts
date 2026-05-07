import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRaw`ALTER TABLE "ApartmentAttachment" ADD COLUMN IF NOT EXISTS "linkedTo" TEXT`;
    return NextResponse.json({ ok: true, message: "Migration applicata con successo." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRaw`ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "size" INTEGER`;
    await prisma.$executeRaw`ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'OTHER'`;
    await prisma.$executeRaw`ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "extractedText" TEXT`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Attachment_maintenanceTicketId_idx" ON "Attachment"("maintenanceTicketId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Attachment_cleaningTaskId_idx" ON "Attachment"("cleaningTaskId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Attachment_category_idx" ON "Attachment"("category")`;

    return NextResponse.json({ ok: true, message: "Migration applicata con successo." });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Errore sconosciuto" },
      { status: 500 }
    );
  }
}

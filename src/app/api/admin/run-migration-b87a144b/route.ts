import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const results: Record<string, string> = {};

  const steps: Array<{ name: string; sql: string }> = [
    { name: "CleaningTask.startedAt", sql: `ALTER TABLE "CleaningTask" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3)` },
    { name: "CleaningTask.completedAt", sql: `ALTER TABLE "CleaningTask" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3)` },
    { name: "Attachment.size", sql: `ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "size" INTEGER` },
    { name: "Attachment.category", sql: `ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'OTHER'` },
    { name: "Attachment.extractedText", sql: `ALTER TABLE "Attachment" ADD COLUMN IF NOT EXISTS "extractedText" TEXT` },
  ];

  for (const step of steps) {
    try {
      await prisma.$executeRawUnsafe(step.sql);
      results[step.name] = "ok";
    } catch (error) {
      results[step.name] = error instanceof Error ? error.message : "errore";
    }
  }

  return NextResponse.json({ results });
}

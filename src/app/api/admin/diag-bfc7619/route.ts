import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.db = "ok";
  } catch (e) {
    results.db = e instanceof Error ? e.message : "error";
    return NextResponse.json(results);
  }

  // 2. OpenAI key present
  results.openai_key = Boolean(process.env.OPENAI_API_KEY);
  results.perplexity_key = Boolean(process.env.PERPLEXITY_API_KEY);

  // 3. Find first apartment
  let apartmentId: string | null = null;
  try {
    const apt = await prisma.apartment.findFirst({ select: { id: true, name: true } });
    results.apartment = apt?.name ?? "none";
    apartmentId = apt?.id ?? null;
  } catch (e) {
    results.apartment = e instanceof Error ? e.message : "error";
    return NextResponse.json(results);
  }

  // 4. Query cleaningTasks (the likely crash point)
  if (apartmentId) {
    try {
      const tasks = await prisma.cleaningTask.findMany({
        where: { apartmentId },
        take: 1,
        include: {
          assignedTo: { select: { name: true, role: true, email: true } },
          booking: { select: { guestName: true, totalGuests: true, checkInDate: true, checkOutDate: true } },
          messages: {
            take: 1,
            select: {
              createdAt: true, role: true, senderName: true, text: true,
              attachment: { select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true } },
            },
          },
          attachments: {
            take: 1,
            select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
          },
          aiAssistantMessages: { take: 1, select: { createdAt: true, role: true, userRole: true, content: true } },
        },
      });
      results.cleaningTasks = `ok (${tasks.length})`;
    } catch (e) {
      results.cleaningTasks = e instanceof Error ? e.message : "error";
    }

    // 5. Query maintenanceTickets
    try {
      const tickets = await prisma.maintenanceTicket.findMany({
        where: { apartmentId },
        take: 1,
        include: {
          assignedTo: { select: { name: true, role: true } },
          messages: {
            take: 1,
            select: {
              createdAt: true, role: true, senderName: true, text: true,
              attachment: { select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true } },
            },
          },
          attachments: {
            take: 1,
            select: { fileName: true, fileType: true, url: true, size: true, category: true, extractedText: true, createdAt: true },
          },
          aiAssistantMessages: { take: 1, select: { createdAt: true, role: true, userRole: true, content: true } },
        },
      });
      results.maintenanceTickets = `ok (${tickets.length})`;
    } catch (e) {
      results.maintenanceTickets = e instanceof Error ? e.message : "error";
    }

    // 6. Query apartmentAttachments
    try {
      const attachments = await prisma.apartmentAttachment.findMany({
        where: { apartmentId },
        take: 1,
        select: { filename: true, url: true, category: true, notes: true, extractedText: true, mimeType: true, size: true, createdAt: true },
      });
      results.apartmentAttachments = `ok (${attachments.length})`;
    } catch (e) {
      results.apartmentAttachments = e instanceof Error ? e.message : "error";
    }
  }

  return NextResponse.json(results);
}

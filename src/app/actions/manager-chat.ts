"use server";

import { prisma } from "@/src/lib/prisma";

// Today's date at midnight UTC (used as session key)
function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function getOrCreateTodaySession() {
  const date = todayUTC();
  const session = await prisma.managerChatSession.upsert({
    where: { date },
    create: { date },
    update: {},
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  return session;
}

export async function getSessionByDate(dateStr: string) {
  const date = new Date(dateStr);
  const session = await prisma.managerChatSession.findUnique({
    where: { date },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  return session;
}

export async function saveManagerChatMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  return prisma.managerChatMessage.create({
    data: { sessionId, role, content },
  });
}

export async function getSessionMessages(sessionId: string) {
  return prisma.managerChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });
}

export async function getSessionDates(): Promise<string[]> {
  const sessions = await prisma.managerChatSession.findMany({
    orderBy: { date: "desc" },
    take: 30,
    select: { date: true },
  });
  // Return ISO date strings (YYYY-MM-DD)
  return sessions.map((s) => s.date.toISOString().slice(0, 10));
}

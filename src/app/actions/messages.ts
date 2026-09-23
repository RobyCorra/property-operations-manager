"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentOrg } from "@/src/lib/tenant";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { storeAttachmentFile } from "@/src/lib/server/attachment-storage";

export const getUnreadMessagesCount = async () => {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return 0;

    // Appartamenti delegati per scope — i loro interventi non mostrano thread all'org
    const delegatedEngagements = await prisma.engagement.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      select: { scope: true, apartments: { select: { apartmentId: true } } },
    });
    const delegatedAptsByScope = new Map<string, Set<string>>();
    for (const e of delegatedEngagements) {
      const set = delegatedAptsByScope.get(e.scope) ?? new Set();
      for (const a of e.apartments) set.add(a.apartmentId);
      delegatedAptsByScope.set(e.scope, set);
    }
    const delegatedMaintenanceApts = [...(delegatedAptsByScope.get("MAINTENANCE") ?? [])];
    const delegatedCleaningApts = [...(delegatedAptsByScope.get("CLEANING") ?? [])];

    const delegatedCheckinApts = [...(delegatedAptsByScope.get("CHECKIN") ?? [])];

    const [maintenanceUnread, cleaningUnread, checkinUnread] = await Promise.all([
      prisma.message.count({
        where: {
          role: { not: "MANAGER" },
          readByManagerAt: null,
          maintenanceTicket: {
            apartment: { organizationId: orgId },
            ...(delegatedMaintenanceApts.length ? { apartmentId: { notIn: delegatedMaintenanceApts } } : {}),
            OR: [{ assignedToId: null }, { assignedTo: { companyId: null } }],
          },
        },
      }),
      prisma.cleaningTaskMessage.count({
        where: {
          role: { not: "MANAGER" },
          readByManagerAt: null,
          cleaningTask: {
            apartment: { organizationId: orgId },
            ...(delegatedCleaningApts.length ? { apartmentId: { notIn: delegatedCleaningApts } } : {}),
            OR: [{ assignedToId: null }, { assignedTo: { companyId: null } }],
          },
        },
      }),
      prisma.checkinTaskMessage.count({
        where: {
          role: { not: "MANAGER" },
          readByManagerAt: null,
          checkinTask: {
            apartment: { organizationId: orgId },
            ...(delegatedCheckinApts.length ? { apartmentId: { notIn: delegatedCheckinApts } } : {}),
            OR: [{ assignedToId: null }, { assignedTo: { companyId: null } }],
          },
        },
      }),
    ]);

    return maintenanceUnread + cleaningUnread + checkinUnread;
  } catch (error) {
    console.error("Error fetching unread messages count:", error);
    return 0;
  }
}

export async function markConversationAsRead(id: string, type: "MAINTENANCE" | "CLEANING" | "CHECKIN") {
  try {
    if (type === "MAINTENANCE") {
      await prisma.message.updateMany({
        where: {
          maintenanceTicketId: id,
          role: { not: "MANAGER" },
          readByManagerAt: null,
        },
        data: {
          readByManagerAt: new Date(),
        },
      });
    } else if (type === "CHECKIN") {
      await prisma.checkinTaskMessage.updateMany({
        where: {
          checkinTaskId: id,
          role: { not: "MANAGER" },
          readByManagerAt: null,
        },
        data: {
          readByManagerAt: new Date(),
        },
      });
    } else {
      await prisma.cleaningTaskMessage.updateMany({
        where: {
          cleaningTaskId: id,
          role: { not: "MANAGER" },
          readByManagerAt: null,
        },
        data: {
          readByManagerAt: new Date(),
        },
      });
    }

    revalidatePath("/dashboard/manager");
    return { success: true };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return { error: "Errore durante la lettura dei messaggi." };
  }
}

// ── Chat generica org ↔ staff diretto ───────────────────────────────────────

function mediaCategory(mime: string): "image" | "audio" | "file" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  return "file";
}

type ChatMsg = { id: string; text: string; mine: boolean; createdAt: string; mediaUrl?: string | null; mediaType?: string | null; mediaName?: string | null };
export type OrgStaffThreadSummary = { staffUserId: string; name: string; role: string; lastText: string | null; unread: number };

async function requireOrgManager(): Promise<{ orgId: string; userName: string }> {
  const ck = await cookies();
  const role = ck.get("role")?.value;
  const orgId = await getCurrentOrg();
  if (role !== "MANAGER" || !orgId) throw new Error("Not authorized");
  const raw = ck.get("userName")?.value || "Manager";
  const userName = (() => { try { return decodeURIComponent(raw); } catch { return raw; } })();
  return { orgId, userName };
}

export async function getOrgStaffThreads(): Promise<OrgStaffThreadSummary[]> {
  const { orgId } = await requireOrgManager();
  const staff = await prisma.user.findMany({
    where: { organizationId: orgId, role: { not: "MANAGER" }, companyId: null },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
  const out: OrgStaffThreadSummary[] = [];
  for (const s of staff) {
    const last = await prisma.orgStaffMessage.findFirst({
      where: { organizationId: orgId, staffUserId: s.id },
      orderBy: { createdAt: "desc" },
      select: { text: true },
    });
    const unread = await prisma.orgStaffMessage.count({
      where: { organizationId: orgId, staffUserId: s.id, senderIsManager: false, readByManagerAt: null },
    });
    out.push({ staffUserId: s.id, name: s.name, role: s.role, lastText: last?.text ?? null, unread });
  }
  return out;
}

export async function getOrgStaffThread(staffUserId: string): Promise<{ name: string; messages: ChatMsg[] } | null> {
  const { orgId } = await requireOrgManager();
  const staff = await prisma.user.findFirst({ where: { id: staffUserId, organizationId: orgId, companyId: null }, select: { name: true } });
  if (!staff) return null;
  await prisma.orgStaffMessage.updateMany({
    where: { organizationId: orgId, staffUserId, senderIsManager: false, readByManagerAt: null },
    data: { readByManagerAt: new Date() },
  });
  const msgs = await prisma.orgStaffMessage.findMany({
    where: { organizationId: orgId, staffUserId },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, senderIsManager: true, createdAt: true, mediaUrl: true, mediaType: true, mediaName: true },
  });
  return {
    name: staff.name,
    messages: msgs.map((m) => ({ id: m.id, text: m.text ?? "", mine: m.senderIsManager, createdAt: m.createdAt.toISOString(), mediaUrl: m.mediaUrl, mediaType: m.mediaType, mediaName: m.mediaName })),
  };
}

export async function sendOrgStaffMessage(staffUserId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { orgId, userName } = await requireOrgManager();
    const staff = await prisma.user.findFirst({ where: { id: staffUserId, organizationId: orgId, companyId: null }, select: { id: true } });
    if (!staff) return { success: false, error: "Operatore non valido." };
    const text = ((formData.get("text") as string) ?? "").trim();
    const file = formData.get("file") as File | null;
    let media: { url: string; type: string; name: string } | undefined;
    if (file && file instanceof File && file.size > 0) {
      const res = await storeAttachmentFile(file, "company", orgId);
      if (!res.success) return { success: false, error: res.error };
      media = { url: res.file.url, type: mediaCategory(res.file.mimeType), name: res.file.filename };
    }
    if (!text && !media) return { success: false, error: "Messaggio vuoto." };
    await prisma.orgStaffMessage.create({
      data: {
        id: randomUUID(), organizationId: orgId, staffUserId, senderIsManager: true, senderName: userName, text: text || null,
        readByManagerAt: new Date(),
        mediaUrl: media?.url ?? null, mediaType: media?.type ?? null, mediaName: media?.name ?? null,
      },
    });
    revalidatePath("/dashboard/manager/messages");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

export async function getOrgStaffUnread(): Promise<number> {
  try {
    const { orgId } = await requireOrgManager();
    return await prisma.orgStaffMessage.count({
      where: { organizationId: orgId, senderIsManager: false, readByManagerAt: null },
    });
  } catch {
    return 0;
  }
}

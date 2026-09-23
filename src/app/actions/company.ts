"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import { getCompanyAccess } from "@/src/lib/company-access";
import { approveCleaningDirectly, computeChecklistSnapshot } from "@/src/app/actions/operational";
import { parseRomeDateTime } from "@/src/lib/rome-datetime";
import { storeAttachmentFile } from "@/src/lib/server/attachment-storage";
import { COMPANY_SCOPES, type CompanyScope, type ImpreseOverview, type EngagementHandler } from "@/src/lib/company-scope";

// Categoria media dal mime-type (per il rendering in chat).
function mediaCategory(mime: string): "image" | "audio" | "file" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  return "file";
}

// Ruolo operativo dello staff per ciascuna funzione delegata.
const SCOPE_STAFF_ROLE: Record<string, "CLEANER" | "MAINTENANCE" | "CHECKIN" | "SUPERVISOR"> = {
  CLEANING: "CLEANER",
  MAINTENANCE: "MAINTENANCE",
  CHECKIN: "CHECKIN",
  SUPERVISION: "SUPERVISOR",
};

// Solo il PROPRIETARIO (manager con companyId vuoto) può gestire le deleghe.
async function requireOwner(): Promise<string> {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER") throw new Error("Non autorizzato.");
  if (c.get("companyId")?.value) throw new Error("Solo il proprietario può gestire le deleghe.");
  const orgId = await getCurrentOrg();
  if (!orgId) throw new Error("Organizzazione non trovata.");
  return orgId;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "impresa"
  );
}

export async function getImpreseOverview(): Promise<ImpreseOverview> {
  const orgId = await requireOwner();
  const [engagements, companies, apartments] = await Promise.all([
    prisma.engagement.findMany({
      where: { organizationId: orgId, status: { not: "REVOKED" } },
      include: {
        company: { select: { id: true, name: true } },
        apartments: { select: { apartmentId: true } },
      },
    }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        vatNumber: true,
        scopes: true,
        users: {
          where: { role: "MANAGER" },
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.apartment.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const handlers: ImpreseOverview["handlers"] = {};
  for (const s of COMPANY_SCOPES) handlers[s] = [];
  for (const e of engagements) {
    if (!handlers[e.scope]) handlers[e.scope] = [];
    handlers[e.scope].push({
      engagementId: e.id,
      companyId: e.companyId,
      companyName: e.company.name,
      status: e.status,
      apartmentIds: e.apartments.map((a) => a.apartmentId),
    });
  }
  return {
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      vatNumber: c.vatNumber,
      scopes: c.scopes,
      managers: c.users,
    })),
    apartments: apartments.map((a) => ({ id: a.id, name: a.name })),
    handlers,
  };
}

export async function createCompany(
  name: string,
  vatNumber?: string,
): Promise<{ success: true; company: { id: string; name: string } } | { success: false; error: string }> {
  try {
    await requireOwner();
    const n = (name ?? "").trim();
    if (!n) return { success: false, error: "Nome impresa obbligatorio." };
    let slug = slugify(n);
    let i = 1;
    while (await prisma.company.findUnique({ where: { slug } })) slug = `${slugify(n)}-${++i}`;
    const company = await prisma.company.create({
      data: { id: randomUUID(), name: n, slug, vatNumber: vatNumber?.trim() || null, scopes: [] },
    });
    revalidatePath("/dashboard/manager/imprese");
    return { success: true, company: { id: company.id, name: company.name } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Delega una funzione a un'impresa con opzionale selezione appartamenti.
// apartmentIds vuoto = tutti gli appartamenti dell'org.
export async function delegateFunction(
  companyId: string,
  scope: string,
  apartmentIds?: string[],
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const orgId = await requireOwner();
    if (!COMPANY_SCOPES.includes(scope as CompanyScope)) return { success: false, error: "Funzione non valida." };
    await prisma.$transaction(async (tx) => {
      const engagement = await tx.engagement.upsert({
        where: { organizationId_companyId_scope: { organizationId: orgId, companyId, scope } },
        update: { status: "ACTIVE", acceptedAt: new Date(), revokedAt: null },
        create: {
          id: randomUUID(),
          organizationId: orgId,
          companyId,
          scope,
          status: "ACTIVE",
          acceptedAt: new Date(),
        },
      });
      // Aggiorna appartamenti assegnati
      await tx.engagementApartment.deleteMany({ where: { engagementId: engagement.id } });
      if (apartmentIds && apartmentIds.length > 0) {
        await tx.engagementApartment.createMany({
          data: apartmentIds.map((aid) => ({ engagementId: engagement.id, apartmentId: aid })),
        });
      }
      // aggiorna l'elenco funzioni offerte dall'impresa (comodità UI)
      const company = await tx.company.findUnique({ where: { id: companyId }, select: { scopes: true } });
      if (company && !company.scopes.includes(scope)) {
        await tx.company.update({ where: { id: companyId }, data: { scopes: { set: [...company.scopes, scope] } } });
      }
    });
    revalidatePath("/dashboard/manager/imprese");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Aggiorna gli appartamenti assegnati a un engagement esistente.
export async function updateEngagementApartments(
  engagementId: string,
  apartmentIds: string[],
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const orgId = await requireOwner();
    const eng = await prisma.engagement.findFirst({
      where: { id: engagementId, organizationId: orgId, status: "ACTIVE" },
    });
    if (!eng) return { success: false, error: "Delega non trovata." };
    await prisma.$transaction(async (tx) => {
      await tx.engagementApartment.deleteMany({ where: { engagementId } });
      if (apartmentIds.length > 0) {
        await tx.engagementApartment.createMany({
          data: apartmentIds.map((aid) => ({ engagementId, apartmentId: aid })),
        });
      }
    });
    revalidatePath("/dashboard/manager/imprese");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// ─── Lato MANAGER D'IMPRESA (companyId valorizzato) ───────────────────────────

async function requireCompanyManager(): Promise<string> {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER") throw new Error("Non autorizzato.");
  const companyId = c.get("companyId")?.value;
  if (!companyId) throw new Error("Riservato ai manager d'impresa.");
  return companyId;
}

async function requireCompanyStaff(): Promise<{ companyId: string; userId: string }> {
  const c = await cookies();
  const companyId = c.get("companyId")?.value;
  const userId = c.get("userId")?.value;
  if (!companyId || !userId) throw new Error("Riservato allo staff d'impresa.");
  return { companyId, userId };
}

export type CompanyStaff = { id: string; name: string; email: string; role: string };
export type ChatMsg = {
  id: string;
  text: string;
  mine: boolean;
  createdAt: string;
  mediaUrl?: string | null;
  mediaType?: string | null; // image | audio | file
  mediaName?: string | null;
};
export type ImpresaThreadSummary = { staffUserId: string; name: string; role: string; lastText: string | null; unread: number };

// ── Chat privata impresa (manager <-> operatore) ──────────────────────────────

export async function getImpresaThreads(): Promise<ImpresaThreadSummary[]> {
  const companyId = await requireCompanyManager();
  const staff = await prisma.user.findMany({
    where: { companyId, role: { not: "MANAGER" } },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
  const out: ImpresaThreadSummary[] = [];
  for (const s of staff) {
    const last = await prisma.companyChatMessage.findFirst({
      where: { companyId, staffUserId: s.id },
      orderBy: { createdAt: "desc" },
      select: { text: true },
    });
    const unread = await prisma.companyChatMessage.count({
      where: { companyId, staffUserId: s.id, senderIsManager: false, readByManagerAt: null },
    });
    out.push({ staffUserId: s.id, name: s.name, role: s.role, lastText: last?.text ?? null, unread });
  }
  return out;
}

export async function getImpresaThread(staffUserId: string): Promise<{ name: string; messages: ChatMsg[] } | null> {
  const companyId = await requireCompanyManager();
  const staff = await prisma.user.findFirst({ where: { id: staffUserId, companyId }, select: { name: true } });
  if (!staff) return null;
  await prisma.companyChatMessage.updateMany({
    where: { companyId, staffUserId, senderIsManager: false, readByManagerAt: null },
    data: { readByManagerAt: new Date() },
  });
  const msgs = await prisma.companyChatMessage.findMany({
    where: { companyId, staffUserId },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, senderIsManager: true, createdAt: true, mediaUrl: true, mediaType: true, mediaName: true },
  });
  return {
    name: staff.name,
    messages: msgs.map((m) => ({ id: m.id, text: m.text, mine: m.senderIsManager, createdAt: m.createdAt.toISOString(), mediaUrl: m.mediaUrl, mediaType: m.mediaType, mediaName: m.mediaName })),
  };
}

// Estrae testo + eventuale file da FormData e prepara i campi media (upload Blob).
async function extractMessage(
  formData: FormData,
  ownerId: string,
): Promise<{ text: string; media?: { url: string; type: string; name: string }; error?: string; empty?: boolean }> {
  const text = ((formData.get("text") as string) ?? "").trim();
  const file = formData.get("file") as File | null;
  if (file && file instanceof File && file.size > 0) {
    const res = await storeAttachmentFile(file, "company", ownerId);
    if (!res.success) return { text, error: res.error };
    return { text, media: { url: res.file.url, type: mediaCategory(res.file.mimeType), name: res.file.filename } };
  }
  if (!text) return { text, empty: true };
  return { text };
}

export async function sendImpresaMessage(staffUserId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await requireCompanyManager();
    const staff = await prisma.user.findFirst({ where: { id: staffUserId, companyId }, select: { id: true } });
    if (!staff) return { success: false, error: "Operatore non valido." };
    const m = await extractMessage(formData, companyId);
    if (m.error) return { success: false, error: m.error };
    if (m.empty) return { success: false, error: "Messaggio vuoto." };
    await prisma.companyChatMessage.create({
      data: {
        id: randomUUID(), companyId, staffUserId, senderIsManager: true, text: m.text,
        readByManagerAt: new Date(),
        mediaUrl: m.media?.url ?? null, mediaType: m.media?.type ?? null, mediaName: m.media?.name ?? null,
      },
    });
    revalidatePath("/dashboard/impresa/messaggi");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

export async function getMyImpresaThread(): Promise<ChatMsg[]> {
  const { companyId, userId } = await requireCompanyStaff();
  await prisma.companyChatMessage.updateMany({
    where: { companyId, staffUserId: userId, senderIsManager: true, readByStaffAt: null },
    data: { readByStaffAt: new Date() },
  });
  const msgs = await prisma.companyChatMessage.findMany({
    where: { companyId, staffUserId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, senderIsManager: true, createdAt: true, mediaUrl: true, mediaType: true, mediaName: true },
  });
  return msgs.map((m) => ({ id: m.id, text: m.text, mine: !m.senderIsManager, createdAt: m.createdAt.toISOString(), mediaUrl: m.mediaUrl, mediaType: m.mediaType, mediaName: m.mediaName }));
}

// Messaggi non letti dall'operatore (inviati dal manager).
export async function getMyImpresaUnread(): Promise<number> {
  try {
    const { companyId, userId } = await requireCompanyStaff();
    return await prisma.companyChatMessage.count({
      where: { companyId, staffUserId: userId, senderIsManager: true, readByStaffAt: null },
    });
  } catch {
    return 0;
  }
}

export async function sendMyImpresaMessage(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { companyId, userId } = await requireCompanyStaff();
    const m = await extractMessage(formData, companyId);
    if (m.error) return { success: false, error: m.error };
    if (m.empty) return { success: false, error: "Messaggio vuoto." };
    await prisma.companyChatMessage.create({
      data: {
        id: randomUUID(), companyId, staffUserId: userId, senderIsManager: false, text: m.text,
        readByStaffAt: new Date(),
        mediaUrl: m.media?.url ?? null, mediaType: m.media?.type ?? null, mediaName: m.media?.name ?? null,
      },
    });
    revalidatePath("/dashboard/impresa/messaggi");
    revalidatePath("/dashboard/messaggi");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// ── Chat org ↔ impresa (manager-to-manager) ──────────────────────────────────

export type OrgCompanyThreadSummary = {
  organizationId: string;
  companyId: string;
  counterpartName: string;
  scopes: string[];
  lastText: string | null;
  lastAt: string | null;
  unread: number;
};

// Lato ORG: lista thread con le imprese delegate
export async function getOrgCompanyThreads(): Promise<OrgCompanyThreadSummary[]> {
  const orgId = await getCurrentOrg();
  if (!orgId) return [];
  const engagements = await prisma.engagement.findMany({
    where: { organizationId: orgId, status: "ACTIVE" },
    select: { companyId: true, scope: true, company: { select: { name: true } } },
  });
  const companyMap = new Map<string, { name: string; scopes: string[] }>();
  for (const e of engagements) {
    const cur = companyMap.get(e.companyId);
    if (cur) { cur.scopes.push(e.scope); } else { companyMap.set(e.companyId, { name: e.company.name, scopes: [e.scope] }); }
  }
  const out: OrgCompanyThreadSummary[] = [];
  for (const [companyId, info] of companyMap) {
    const last = await prisma.orgCompanyMessage.findFirst({
      where: { organizationId: orgId, companyId },
      orderBy: { createdAt: "desc" },
      select: { text: true, createdAt: true },
    });
    const unread = await prisma.orgCompanyMessage.count({
      where: { organizationId: orgId, companyId, senderIsOrg: false, readByOrgAt: null },
    });
    out.push({ organizationId: orgId, companyId, counterpartName: info.name, scopes: info.scopes, lastText: last?.text ?? null, lastAt: last?.createdAt?.toISOString() ?? null, unread });
  }
  out.sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
  return out;
}

// Lato ORG: leggi thread con una impresa
export async function getOrgCompanyThread(companyId: string): Promise<{ name: string; messages: ChatMsg[] } | null> {
  const orgId = await getCurrentOrg();
  if (!orgId) return null;
  const eng = await prisma.engagement.findFirst({
    where: { organizationId: orgId, companyId, status: "ACTIVE" },
    select: { company: { select: { name: true } } },
  });
  if (!eng) return null;
  await prisma.orgCompanyMessage.updateMany({
    where: { organizationId: orgId, companyId, senderIsOrg: false, readByOrgAt: null },
    data: { readByOrgAt: new Date() },
  });
  const msgs = await prisma.orgCompanyMessage.findMany({
    where: { organizationId: orgId, companyId },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, senderIsOrg: true, createdAt: true, mediaUrl: true, mediaType: true, mediaName: true },
  });
  return {
    name: eng.company.name,
    messages: msgs.map((m) => ({ id: m.id, text: m.text, mine: m.senderIsOrg, createdAt: m.createdAt.toISOString(), mediaUrl: m.mediaUrl, mediaType: m.mediaType, mediaName: m.mediaName })),
  };
}

// Lato ORG: invia messaggio a una impresa
export async function sendOrgCompanyMessage(companyId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Non autenticato." };
    const eng = await prisma.engagement.findFirst({ where: { organizationId: orgId, companyId, status: "ACTIVE" }, select: { id: true } });
    if (!eng) return { success: false, error: "Impresa non delegata." };
    const cookieStore = await cookies();
    const senderName = (() => { try { return decodeURIComponent(cookieStore.get("userName")?.value || ""); } catch { return cookieStore.get("userName")?.value || "Manager"; } })();
    const m = await extractMessage(formData, orgId);
    if (m.error) return { success: false, error: m.error };
    if (m.empty) return { success: false, error: "Messaggio vuoto." };
    await prisma.orgCompanyMessage.create({
      data: {
        id: randomUUID(), organizationId: orgId, companyId, senderIsOrg: true, senderName, text: m.text,
        readByOrgAt: new Date(),
        mediaUrl: m.media?.url ?? null, mediaType: m.media?.type ?? null, mediaName: m.media?.name ?? null,
      },
    });
    revalidatePath("/dashboard/manager/messages");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Lato ORG: conteggio non letti da tutte le imprese
export async function getOrgCompanyUnread(): Promise<number> {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return 0;
    return await prisma.orgCompanyMessage.count({
      where: { organizationId: orgId, senderIsOrg: false, readByOrgAt: null },
    });
  } catch { return 0; }
}

// Lato IMPRESA: lista thread con le organizzazioni clienti
export async function getImpresaOrgThreads(): Promise<OrgCompanyThreadSummary[]> {
  const companyId = await requireCompanyManager();
  const engagements = await prisma.engagement.findMany({
    where: { companyId, status: "ACTIVE" },
    select: { organizationId: true, scope: true, organization: { select: { name: true } } },
  });
  const orgMap = new Map<string, { name: string; scopes: string[] }>();
  for (const e of engagements) {
    const cur = orgMap.get(e.organizationId);
    if (cur) { cur.scopes.push(e.scope); } else { orgMap.set(e.organizationId, { name: e.organization.name, scopes: [e.scope] }); }
  }
  const out: OrgCompanyThreadSummary[] = [];
  for (const [organizationId, info] of orgMap) {
    const last = await prisma.orgCompanyMessage.findFirst({
      where: { organizationId, companyId },
      orderBy: { createdAt: "desc" },
      select: { text: true, createdAt: true },
    });
    const unread = await prisma.orgCompanyMessage.count({
      where: { organizationId, companyId, senderIsOrg: true, readByCompanyAt: null },
    });
    out.push({ organizationId, companyId, counterpartName: info.name, scopes: info.scopes, lastText: last?.text ?? null, lastAt: last?.createdAt?.toISOString() ?? null, unread });
  }
  out.sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
  return out;
}

// Lato IMPRESA: leggi thread con una organizzazione
export async function getImpresaOrgThread(organizationId: string): Promise<{ name: string; messages: ChatMsg[] } | null> {
  const companyId = await requireCompanyManager();
  const eng = await prisma.engagement.findFirst({
    where: { organizationId, companyId, status: "ACTIVE" },
    select: { organization: { select: { name: true } } },
  });
  if (!eng) return null;
  await prisma.orgCompanyMessage.updateMany({
    where: { organizationId, companyId, senderIsOrg: true, readByCompanyAt: null },
    data: { readByCompanyAt: new Date() },
  });
  const msgs = await prisma.orgCompanyMessage.findMany({
    where: { organizationId, companyId },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, senderIsOrg: true, createdAt: true, mediaUrl: true, mediaType: true, mediaName: true },
  });
  return {
    name: eng.organization.name,
    messages: msgs.map((m) => ({ id: m.id, text: m.text, mine: !m.senderIsOrg, createdAt: m.createdAt.toISOString(), mediaUrl: m.mediaUrl, mediaType: m.mediaType, mediaName: m.mediaName })),
  };
}

// Lato IMPRESA: invia messaggio a una organizzazione
export async function sendImpresaOrgMessage(organizationId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await requireCompanyManager();
    const eng = await prisma.engagement.findFirst({ where: { organizationId, companyId, status: "ACTIVE" }, select: { id: true } });
    if (!eng) return { success: false, error: "Organizzazione non cliente." };
    const cookieStore = await cookies();
    const senderName = (() => { try { return decodeURIComponent(cookieStore.get("userName")?.value || ""); } catch { return cookieStore.get("userName")?.value || "Manager"; } })();
    const m = await extractMessage(formData, companyId);
    if (m.error) return { success: false, error: m.error };
    if (m.empty) return { success: false, error: "Messaggio vuoto." };
    await prisma.orgCompanyMessage.create({
      data: {
        id: randomUUID(), organizationId, companyId, senderIsOrg: false, senderName, text: m.text,
        readByCompanyAt: new Date(),
        mediaUrl: m.media?.url ?? null, mediaType: m.media?.type ?? null, mediaName: m.media?.name ?? null,
      },
    });
    revalidatePath("/dashboard/impresa/messaggi");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Lato IMPRESA: conteggio non letti da tutte le organizzazioni
export async function getImpresaOrgUnread(): Promise<number> {
  try {
    const companyId = await requireCompanyManager();
    return await prisma.orgCompanyMessage.count({
      where: { companyId, senderIsOrg: true, readByCompanyAt: null },
    });
  } catch { return 0; }
}

// ── Thread intervento delegato (impresa ↔ addetto) ──────────────────────────

export type DelegatedInterventionThread = {
  id: string;
  type: "CLEANING" | "MAINTENANCE";
  apartmentName: string;
  assignedUser: string;
  title: string;
  date: string | null;
  status: string;
  lastText: string | null;
  lastAt: string | null;
  unread: number;
};

export async function getImpresaDelegatedThreads(): Promise<DelegatedInterventionThread[]> {
  const companyId = await requireCompanyManager();
  const access = await getCompanyAccess();
  if (!access) return [];

  const cleaningAptIds = access.scopeApartments?.CLEANING;
  const maintenanceAptIds = access.scopeApartments?.MAINTENANCE;

  const out: DelegatedInterventionThread[] = [];

  if (cleaningAptIds && cleaningAptIds.length > 0) {
    const tasks = await prisma.cleaningTask.findMany({
      where: { apartmentId: { in: cleaningAptIds }, messages: { some: {} } },
      include: {
        apartment: { select: { name: true } },
        assignedTo: { select: { name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    for (const t of tasks) {
      const unread = await prisma.cleaningTaskMessage.count({
        where: { cleaningTaskId: t.id, role: { not: "MANAGER" }, readByManagerAt: null },
      });
      const last = t.messages[0];
      out.push({
        id: t.id, type: "CLEANING",
        apartmentName: t.apartment.name,
        assignedUser: t.assignedTo?.name ?? "Non assegnato",
        title: "Pulizia",
        date: t.date.toISOString(),
        status: t.status,
        lastText: last?.text ?? null,
        lastAt: last?.createdAt?.toISOString() ?? null,
        unread,
      });
    }
  }

  if (maintenanceAptIds && maintenanceAptIds.length > 0) {
    const tickets = await prisma.maintenanceTicket.findMany({
      where: { apartmentId: { in: maintenanceAptIds }, messages: { some: {} } },
      include: {
        apartment: { select: { name: true } },
        assignedTo: { select: { name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    for (const t of tickets) {
      const unread = await prisma.message.count({
        where: { maintenanceTicketId: t.id, role: { not: "MANAGER" }, readByManagerAt: null },
      });
      const last = t.messages[0];
      out.push({
        id: t.id, type: "MAINTENANCE",
        apartmentName: t.apartment.name,
        assignedUser: t.assignedTo?.name ?? "Non assegnato",
        title: t.title,
        date: null,
        status: t.status,
        lastText: last?.text ?? null,
        lastAt: last?.createdAt?.toISOString() ?? null,
        unread,
      });
    }
  }

  out.sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));
  return out;
}

export async function getImpresaDelegatedThread(
  id: string,
  type: "CLEANING" | "MAINTENANCE",
): Promise<{ title: string; messages: ChatMsg[] } | null> {
  const companyId = await requireCompanyManager();
  const access = await getCompanyAccess();
  if (!access) return null;

  if (type === "CLEANING") {
    const aptIds = access.scopeApartments?.CLEANING;
    const task = await prisma.cleaningTask.findFirst({
      where: { id, ...(aptIds ? { apartmentId: { in: aptIds } } : {}) },
      include: {
        apartment: { select: { name: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { attachment: true } },
      },
    });
    if (!task) return null;
    await prisma.cleaningTaskMessage.updateMany({
      where: { cleaningTaskId: id, role: { not: "MANAGER" }, readByManagerAt: null },
      data: { readByManagerAt: new Date() },
    });
    return {
      title: `Pulizia – ${task.apartment.name}`,
      messages: task.messages.map((m) => ({
        id: m.id,
        text: m.text ?? "",
        mine: m.role === "MANAGER",
        createdAt: m.createdAt.toISOString(),
        mediaUrl: m.attachment?.url ?? undefined,
        mediaType: m.attachment?.fileType ? mediaCategory(m.attachment.fileType) : undefined,
        mediaName: m.attachment?.fileName ?? undefined,
      })),
    };
  }

  // MAINTENANCE
  const aptIds = access.scopeApartments?.MAINTENANCE;
  const ticket = await prisma.maintenanceTicket.findFirst({
    where: { id, ...(aptIds ? { apartmentId: { in: aptIds } } : {}) },
    include: {
      apartment: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { attachment: true } },
    },
  });
  if (!ticket) return null;
  await prisma.message.updateMany({
    where: { maintenanceTicketId: id, role: { not: "MANAGER" }, readByManagerAt: null },
    data: { readByManagerAt: new Date() },
  });
  return {
    title: `${ticket.title} – ${ticket.apartment.name}`,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      text: m.text ?? "",
      mine: m.role === "MANAGER",
      createdAt: m.createdAt.toISOString(),
      mediaUrl: m.attachment?.url ?? undefined,
      mediaType: m.attachment?.fileType ? mediaCategory(m.attachment.fileType) : undefined,
      mediaName: m.attachment?.fileName ?? undefined,
    })),
  };
}

export async function sendImpresaDelegatedMessage(
  id: string,
  type: "CLEANING" | "MAINTENANCE",
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyId = await requireCompanyManager();
    const access = await getCompanyAccess();
    if (!access) return { success: false, error: "Non autorizzato." };

    const cookieStore = await cookies();
    const senderName = (() => { try { return decodeURIComponent(cookieStore.get("userName")?.value || ""); } catch { return cookieStore.get("userName")?.value || "Manager"; } })();

    const m = await extractMessage(formData, companyId);
    if (m.error) return { success: false, error: m.error };
    if (m.empty) return { success: false, error: "Messaggio vuoto." };

    if (type === "CLEANING") {
      const aptIds = access.scopeApartments?.CLEANING;
      const task = await prisma.cleaningTask.findFirst({
        where: { id, ...(aptIds ? { apartmentId: { in: aptIds } } : {}) },
        select: { id: true },
      });
      if (!task) return { success: false, error: "Intervento non trovato." };

      let attachmentId: string | undefined;
      if (m.media) {
        const att = await prisma.attachment.create({
          data: { id: randomUUID(), url: m.media.url, fileType: m.media.type, fileName: m.media.name },
        });
        attachmentId = att.id;
      }
      await prisma.cleaningTaskMessage.create({
        data: {
          id: randomUUID(), cleaningTaskId: id, role: "MANAGER", senderName, text: m.text || "",
          readByManagerAt: new Date(),
          ...(attachmentId ? { attachmentId } : {}),
        },
      });
    } else {
      const aptIds = access.scopeApartments?.MAINTENANCE;
      const ticket = await prisma.maintenanceTicket.findFirst({
        where: { id, ...(aptIds ? { apartmentId: { in: aptIds } } : {}) },
        select: { id: true },
      });
      if (!ticket) return { success: false, error: "Intervento non trovato." };

      let attachmentId: string | undefined;
      if (m.media) {
        const att = await prisma.attachment.create({
          data: { id: randomUUID(), url: m.media.url, fileType: m.media.type, fileName: m.media.name },
        });
        attachmentId = att.id;
      }
      await prisma.message.create({
        data: {
          id: randomUUID(), maintenanceTicketId: id, role: "MANAGER", senderName, text: m.text || "",
          readByManagerAt: new Date(),
          ...(attachmentId ? { attachmentId } : {}),
        },
      });
    }

    revalidatePath("/dashboard/impresa/messaggi");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

export async function getImpresaDelegatedUnread(): Promise<number> {
  try {
    const companyId = await requireCompanyManager();
    const access = await getCompanyAccess();
    if (!access) return 0;
    let total = 0;
    const cleaningAptIds = access.scopeApartments?.CLEANING;
    if (cleaningAptIds?.length) {
      total += await prisma.cleaningTaskMessage.count({
        where: { role: { not: "MANAGER" }, readByManagerAt: null, cleaningTask: { apartmentId: { in: cleaningAptIds } } },
      });
    }
    const maintenanceAptIds = access.scopeApartments?.MAINTENANCE;
    if (maintenanceAptIds?.length) {
      total += await prisma.message.count({
        where: { role: { not: "MANAGER" }, readByManagerAt: null, maintenanceTicket: { apartmentId: { in: maintenanceAptIds } } },
      });
    }
    return total;
  } catch { return 0; }
}

export async function getMyCompanyStaff(): Promise<CompanyStaff[]> {
  const companyId = await requireCompanyManager();
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true, name: true, email: true, role: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  return users;
}

// Ruoli creabili dall'impresa: quelli coerenti con le funzioni delegate + un
// altro MANAGER e un SUPERVISOR.
function allowedStaffRoles(scopes: string[]): Set<string> {
  const set = new Set<string>(scopes.map((s) => SCOPE_STAFF_ROLE[s]).filter(Boolean));
  set.add("MANAGER");
  set.add("SUPERVISOR");
  return set;
}

export async function getMyStaffMember(id: string) {
  const companyId = await requireCompanyManager();
  return prisma.user.findFirst({
    where: { id, companyId },
    select: { id: true, name: true, email: true, role: true, phone: true, address: true },
  });
}

export async function updateMyStaff(
  id: string,
  data: { name: string; phone?: string; address?: string; role: string; password?: string },
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const companyId = await requireCompanyManager();
    const target = await prisma.user.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!target) return { success: false, error: "Operatore non trovato." };
    const nm = (data.name ?? "").trim();
    if (!nm) return { success: false, error: "Nome obbligatorio." };
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { scopes: true } });
    if (!allowedStaffRoles(company?.scopes ?? []).has(data.role)) return { success: false, error: "Ruolo non consentito." };
    if (data.password && data.password.length < 6) return { success: false, error: "Password troppo corta (min 6)." };

    await prisma.user.update({
      where: { id },
      data: {
        name: nm,
        role: data.role as never,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
      },
    });
    revalidatePath("/dashboard/impresa/staff");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Il manager d'impresa crea il proprio staff (ruolo coerente con le funzioni
// delegate all'impresa). Utente legato alla Company, organizationId null.
export async function createMyStaff(
  name: string,
  email: string,
  password: string,
  role: string,
  phone?: string,
  address?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const companyId = await requireCompanyManager();
    const nm = (name ?? "").trim();
    const em = (email ?? "").trim().toLowerCase();
    if (!nm || !em || !password) return { success: false, error: "Nome, email e password obbligatori." };
    if (password.length < 6) return { success: false, error: "Password troppo corta (min 6)." };

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { scopes: true } });
    if (!allowedStaffRoles(company?.scopes ?? []).has(role)) return { success: false, error: "Ruolo non consentito per questa impresa." };

    const existing = await prisma.user.findUnique({ where: { email: em }, select: { id: true } });
    if (existing) return { success: false, error: "Email già in uso." };

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: nm,
        email: em,
        password: passwordHash,
        role: role as never,
        companyId,
        organizationId: null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
    });
    revalidatePath("/dashboard/impresa/staff");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Assegna (o rimuove: userId null) una pulizia a un operatore dell'impresa.
// La pulizia deve appartenere a un'organizzazione che ha ingaggiato l'impresa.
export async function assignCleaning(
  cleaningTaskId: string,
  userId: string | null,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const companyId = await requireCompanyManager();
    const access = await getCompanyAccess();
    if (!access || !access.scopes.includes("CLEANING")) return { success: false, error: "Pulizie non delegate a questa impresa." };

    const task = await prisma.cleaningTask.findUnique({
      where: { id: cleaningTaskId },
      select: { apartmentId: true, apartment: { select: { organizationId: true } } },
    });
    if (!task || !task.apartment.organizationId || !access.orgIds.includes(task.apartment.organizationId)) {
      return { success: false, error: "Pulizia non appartenente ai tuoi clienti." };
    }
    const cApts = access.scopeApartments?.CLEANING;
    if (cApts && !cApts.includes(task.apartmentId)) {
      return { success: false, error: "Appartamento non assegnato alla tua impresa." };
    }

    if (userId) {
      const staff = await prisma.user.findFirst({ where: { id: userId, companyId, role: "CLEANER" }, select: { id: true } });
      if (!staff) return { success: false, error: "Operatore non valido." };
    }

    await prisma.cleaningTask.update({ where: { id: cleaningTaskId }, data: { assignedToId: userId } });
    revalidatePath("/dashboard/impresa");
    revalidatePath("/dashboard/impresa/pulizie");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Il manager d'impresa crea una pulizia manuale su un appartamento di un
// cliente ingaggiato (senza prenotazione). Appartamenti/prenotazioni restano
// di competenza del proprietario.
export async function createImpresaCleaning(input: {
  apartmentId: string;
  date: string;
  time?: string;
  totalGuests?: number | null;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireCompanyManager();
    const access = await getCompanyAccess();
    if (!access || !access.scopes.includes("CLEANING")) return { success: false, error: "Pulizie non delegate a questa impresa." };

    const apartmentId = (input?.apartmentId ?? "").trim();
    const dateStr = (input?.date ?? "").trim();
    if (!apartmentId || !dateStr) return { success: false, error: "Appartamento e data obbligatori." };

    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { organizationId: true } });
    if (!apt || !apt.organizationId || !access.orgIds.includes(apt.organizationId)) {
      return { success: false, error: "Appartamento non appartenente ai tuoi clienti." };
    }
    const cApts2 = access.scopeApartments?.CLEANING;
    if (cApts2 && !cApts2.includes(apartmentId)) {
      return { success: false, error: "Appartamento non assegnato alla tua impresa." };
    }

    const taskDate = parseRomeDateTime(dateStr, input.time || "10:00");
    const checklistProgress = await computeChecklistSnapshot(prisma, apartmentId, taskDate);
    const totalGuests = input.totalGuests && !isNaN(input.totalGuests) ? input.totalGuests : null;

    await prisma.cleaningTask.create({
      data: { apartmentId, date: taskDate, status: "PENDING", checklistProgress, totalGuests },
    });
    revalidatePath("/dashboard/impresa/pulizie");
    revalidatePath("/dashboard/impresa");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Il manager d'impresa approva una pulizia dei propri clienti (in attesa di
// revisione). L'approvazione scala i prodotti dal magazzino del PROPRIETARIO
// (regola invariata: consumo alla conferma pulizia).
export async function approveCleaningByImpresa(
  cleaningTaskId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireCompanyManager();
    const access = await getCompanyAccess();
    if (!access || !access.scopes.includes("CLEANING")) return { success: false, error: "Pulizie non delegate a questa impresa." };

    const task = await prisma.cleaningTask.findUnique({
      where: { id: cleaningTaskId },
      select: { status: true, apartmentId: true, apartment: { select: { organizationId: true } } },
    });
    if (!task || !task.apartment.organizationId || !access.orgIds.includes(task.apartment.organizationId)) {
      return { success: false, error: "Pulizia non appartenente ai tuoi clienti." };
    }
    const cApts3 = access.scopeApartments?.CLEANING;
    if (cApts3 && !cApts3.includes(task.apartmentId)) {
      return { success: false, error: "Appartamento non assegnato alla tua impresa." };
    }
    if (task.status !== "AWAITING_REVIEW") {
      return { success: false, error: "La pulizia non è in attesa di revisione." };
    }

    await approveCleaningDirectly(cleaningTaskId);
    revalidatePath("/dashboard/impresa/pulizie");
    revalidatePath("/dashboard/impresa");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Crea un accesso "manager d'impresa": un utente MANAGER legato alla Company
// (organizationId null). Potrà loggarsi e vedere solo le funzioni delegate.
export async function createCompanyManager(
  companyId: string,
  name: string,
  email: string,
  password: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireOwner();
    const nm = (name ?? "").trim();
    const em = (email ?? "").trim().toLowerCase();
    if (!nm || !em || !password) return { success: false, error: "Nome, email e password obbligatori." };
    if (password.length < 6) return { success: false, error: "Password troppo corta (min 6)." };
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!company) return { success: false, error: "Impresa non trovata." };
    const existing = await prisma.user.findUnique({ where: { email: em }, select: { id: true } });
    if (existing) return { success: false, error: "Email già in uso." };
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: nm,
        email: em,
        password: passwordHash,
        role: "MANAGER",
        companyId,
        organizationId: null,
      },
    });
    revalidatePath("/dashboard/manager/imprese");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

// Revoca una specifica delega (engagement) — oppure tutte le deleghe di uno scope.
export async function revokeFunction(
  scopeOrEngagementId: string,
  byEngagementId?: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const orgId = await requireOwner();
    if (byEngagementId) {
      await prisma.engagement.updateMany({
        where: { id: scopeOrEngagementId, organizationId: orgId, status: { not: "REVOKED" } },
        data: { status: "REVOKED", revokedAt: new Date() },
      });
    } else {
      await prisma.engagement.updateMany({
        where: { organizationId: orgId, scope: scopeOrEngagementId, status: { not: "REVOKED" } },
        data: { status: "REVOKED", revokedAt: new Date() },
      });
    }
    revalidatePath("/dashboard/manager/imprese");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

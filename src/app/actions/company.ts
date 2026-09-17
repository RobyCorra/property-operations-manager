"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import { getCompanyAccess } from "@/src/lib/company-access";
import { approveCleaningDirectly } from "@/src/app/actions/operational";
import { COMPANY_SCOPES, type CompanyScope, type ImpreseOverview } from "@/src/lib/company-scope";

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
  const [engagements, companies] = await Promise.all([
    prisma.engagement.findMany({
      where: { organizationId: orgId, status: { not: "REVOKED" } },
      include: { company: { select: { id: true, name: true } } },
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
  ]);

  const handlers: ImpreseOverview["handlers"] = {};
  for (const s of COMPANY_SCOPES) handlers[s] = null;
  for (const e of engagements) {
    handlers[e.scope] = {
      engagementId: e.id,
      companyId: e.companyId,
      companyName: e.company.name,
      status: e.status,
    };
  }
  return {
    companies: companies.map((c) => ({
      id: c.id,
      name: c.name,
      vatNumber: c.vatNumber,
      scopes: c.scopes,
      managers: c.users,
    })),
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

// Delega una funzione a un'impresa (regola: una impresa per funzione → revoca
// eventuale delega attiva su un'altra impresa per lo stesso scope).
export async function delegateFunction(
  companyId: string,
  scope: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const orgId = await requireOwner();
    if (!COMPANY_SCOPES.includes(scope as CompanyScope)) return { success: false, error: "Funzione non valida." };
    await prisma.$transaction(async (tx) => {
      await tx.engagement.updateMany({
        where: { organizationId: orgId, scope, status: { not: "REVOKED" }, companyId: { not: companyId } },
        data: { status: "REVOKED", revokedAt: new Date() },
      });
      await tx.engagement.upsert({
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

// ─── Lato MANAGER D'IMPRESA (companyId valorizzato) ───────────────────────────

async function requireCompanyManager(): Promise<string> {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER") throw new Error("Non autorizzato.");
  const companyId = c.get("companyId")?.value;
  if (!companyId) throw new Error("Riservato ai manager d'impresa.");
  return companyId;
}

export type CompanyStaff = { id: string; name: string; email: string; role: string };

export async function getMyCompanyStaff(): Promise<CompanyStaff[]> {
  const companyId = await requireCompanyManager();
  const users = await prisma.user.findMany({
    where: { companyId, role: { not: "MANAGER" } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
  return users;
}

// Il manager d'impresa crea il proprio staff (ruolo coerente con le funzioni
// delegate all'impresa). Utente legato alla Company, organizationId null.
export async function createMyStaff(
  name: string,
  email: string,
  password: string,
  role: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const companyId = await requireCompanyManager();
    const nm = (name ?? "").trim();
    const em = (email ?? "").trim().toLowerCase();
    if (!nm || !em || !password) return { success: false, error: "Nome, email e password obbligatori." };
    if (password.length < 6) return { success: false, error: "Password troppo corta (min 6)." };

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { scopes: true } });
    const allowedRoles = new Set((company?.scopes ?? []).map((s) => SCOPE_STAFF_ROLE[s]).filter(Boolean));
    if (!allowedRoles.has(role as never)) return { success: false, error: "Ruolo non consentito per questa impresa." };

    const existing = await prisma.user.findUnique({ where: { email: em }, select: { id: true } });
    if (existing) return { success: false, error: "Email già in uso." };

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { id: randomUUID(), name: nm, email: em, password: passwordHash, role: role as never, companyId, organizationId: null },
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
      select: { apartment: { select: { organizationId: true } } },
    });
    if (!task || !task.apartment.organizationId || !access.orgIds.includes(task.apartment.organizationId)) {
      return { success: false, error: "Pulizia non appartenente ai tuoi clienti." };
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
      select: { status: true, apartment: { select: { organizationId: true } } },
    });
    if (!task || !task.apartment.organizationId || !access.orgIds.includes(task.apartment.organizationId)) {
      return { success: false, error: "Pulizia non appartenente ai tuoi clienti." };
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

// Revoca la delega di una funzione (torna a gestione interna).
export async function revokeFunction(scope: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const orgId = await requireOwner();
    await prisma.engagement.updateMany({
      where: { organizationId: orgId, scope, status: { not: "REVOKED" } },
      data: { status: "REVOKED", revokedAt: new Date() },
    });
    revalidatePath("/dashboard/manager/imprese");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Errore." };
  }
}

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import { COMPANY_SCOPES, type CompanyScope, type ImpreseOverview } from "@/src/lib/company-scope";

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

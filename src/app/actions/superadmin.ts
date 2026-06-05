"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function logAction(action: string, detail?: string, orgId?: string, orgName?: string) {
  try {
    await prisma.superAdminLog.create({
      data: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action,
        detail: detail ?? null,
        orgId: orgId ?? null,
        orgName: orgName ?? null,
      },
    });
  } catch (e) {
    console.error("[SuperAdminLog] errore salvataggio log:", action, e);
  }
}

export async function getSuperAdminLogs(limit = 100) {
  return prisma.superAdminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function isSuperAdminAuthenticated(): Promise<boolean> {
  const expected = (process.env.SUPERADMIN_SECRET ?? "").trim();
  if (!expected) return false;
  const cookieStore = await cookies();
  const token = (cookieStore.get("superadmin_token")?.value ?? "").trim();
  return token === expected;
}

export async function createOrganization(prevState: any, formData: FormData) {
  const orgName = (formData.get("orgName") as string)?.trim();
  const managerName = (formData.get("managerName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!orgName || !managerName || !email || !password || password.length < 8) {
    return { error: "Tutti i campi sono obbligatori (password min 8 caratteri)." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email già in uso." };

  const baseSlug = orgName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
  const hashed = await bcrypt.hash(password, 10);

  const { org } = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({ data: { name: orgName, slug } });
    await tx.user.create({
      data: { name: managerName, email, password: hashed, role: "MANAGER", organizationId: org.id },
    });
    return { org };
  });

  await logAction("CREA_ORG", `Manager: ${managerName} (${email})`, org.id, orgName);
  revalidatePath("/superadmin");
  return { success: true, orgId: org.id, orgName };
}

export async function resetUserPassword(prevState: any, formData: FormData) {
  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;
  if (!userId || !newPassword || newPassword.length < 8) {
    return { error: "Password minimo 8 caratteri." };
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  const u = await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  let orgName: string | undefined;
  if (u.organizationId) {
    const org = await prisma.organization.findUnique({ where: { id: u.organizationId }, select: { name: true } });
    orgName = org?.name ?? undefined;
  }
  await logAction("RESET_PASSWORD", `${u.name} (${u.email})`, u.organizationId ?? undefined, orgName);
  revalidatePath("/superadmin");
  return { success: true };
}

export async function createFirstManager(prevState: any, formData: FormData) {
  const orgId = formData.get("orgId") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  if (!orgId || !name || !email || !password || password.length < 8) {
    return { error: "Tutti i campi obbligatori (password min 8 caratteri)." };
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email già in uso." };
  const hashed = await bcrypt.hash(password, 10);
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } });
  await prisma.user.create({
    data: { name, email, password: hashed, role: "MANAGER", organizationId: orgId },
  });
  await logAction("CREA_MANAGER", `${name} (${email})`, orgId, org?.name ?? undefined);
  revalidatePath("/superadmin");
  return { success: true };
}

export async function deleteTestData(formData: FormData) {
  const orgId = formData.get("orgId") as string;
  if (!orgId) return;
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } });
  const apartments = await prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true } });
  const aptIds = apartments.map(a => a.id);
  await prisma.$transaction([
    prisma.cleaningTask.deleteMany({ where: { apartmentId: { in: aptIds } } }),
    prisma.booking.deleteMany({ where: { apartmentId: { in: aptIds } } }),
    prisma.maintenanceTicket.deleteMany({ where: { apartmentId: { in: aptIds } } }),
    prisma.apartment.deleteMany({ where: { organizationId: orgId } }),
    prisma.user.deleteMany({ where: { organizationId: orgId, role: { not: "MANAGER" } } }),
  ]);
  await logAction("ELIMINA_DATI_TEST", `${apartments.length} appartamenti rimossi`, orgId, org?.name ?? undefined);
  revalidatePath("/superadmin");
  redirect(`/superadmin/${orgId}`);
}

export async function getDbStats() {
  const [sizeResult, tablesResult] = await Promise.all([
    prisma.$queryRaw<{ size: string; bytes: bigint }[]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS size,
             pg_database_size(current_database()) AS bytes
    `,
    prisma.$queryRaw<{ table: string; size: string; bytes: bigint }[]>`
      SELECT tablename AS table,
             pg_size_pretty(pg_total_relation_size('public.' || quote_ident(tablename))) AS size,
             pg_total_relation_size('public.' || quote_ident(tablename)) AS bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size('public.' || quote_ident(tablename)) DESC
      LIMIT 15
    `,
  ]);

  const totalBytes = Number(sizeResult[0]?.bytes ?? 0);
  const totalSize = sizeResult[0]?.size ?? "—";
  // Neon free tier: 512 MB
  const limitBytes = 512 * 1024 * 1024;
  const usedPercent = Math.min(Math.round((totalBytes / limitBytes) * 100), 100);

  const tables = tablesResult.map(t => ({
    table: t.table,
    size: t.size,
    bytes: Number(t.bytes),
    percent: totalBytes > 0 ? Math.round((Number(t.bytes) / totalBytes) * 100) : 0,
  }));

  return { totalSize, totalBytes, usedPercent, limitBytes, tables };
}

export async function getAllOrgsWithMetrics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const LOGIN_ACTIONS = ["LOGIN_MANAGER", "LOGIN_CLEANER", "LOGIN_MAINTENANCE", "LOGIN_SUPERVISOR", "LOGIN_OWNER"];

  const [orgs, recentLoginLogs, everLoginLogs, failedLoginLogs] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        apartments: {
          select: {
            id: true, name: true,
            cleaningTasks: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } }, select: { id: true } },
            maintenanceTickets: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } }, select: { id: true } },
            bookings: { where: { status: { not: "CANCELLED" } }, select: { id: true } },
          },
        },
      },
    }),
    // Org con login negli ultimi 30 giorni
    prisma.superAdminLog.findMany({
      where: { action: { in: LOGIN_ACTIONS }, createdAt: { gte: thirtyDaysAgo }, orgId: { not: null } },
      select: { orgId: true },
      distinct: ["orgId"],
    }),
    // Org che hanno mai fatto login
    prisma.superAdminLog.findMany({
      where: { action: { in: LOGIN_ACTIONS }, orgId: { not: null } },
      select: { orgId: true },
      distinct: ["orgId"],
    }),
    // Login falliti per org nelle ultime 24h
    prisma.superAdminLog.findMany({
      where: { action: "LOGIN_FALLITO", createdAt: { gte: oneDayAgo }, orgId: { not: null } },
      select: { orgId: true },
    }),
  ]);

  const recentLoginOrgIds = new Set(recentLoginLogs.map(l => l.orgId!));
  const everLoginOrgIds = new Set(everLoginLogs.map(l => l.orgId!));
  const failedCountByOrg: Record<string, number> = {};
  failedLoginLogs.forEach(l => {
    failedCountByOrg[l.orgId!] = (failedCountByOrg[l.orgId!] ?? 0) + 1;
  });

  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return orgs.map(org => {
    const allCleanings = org.apartments.flatMap(a => a.cleaningTasks);
    const allTickets = org.apartments.flatMap(a => a.maintenanceTickets);
    const hasManager = org.users.some(u => u.role === "MANAGER");
    const ageMs = now.getTime() - new Date(org.createdAt).getTime();
    const isNewOrg = ageMs < oneDayMs;

    const alerts: string[] = [];

    // 🔴 Critici — blocco funzionamento
    if (!hasManager) alerts.push("Nessun manager");
    if ((failedCountByOrg[org.id] ?? 0) >= 5) alerts.push(`${failedCountByOrg[org.id]} login falliti (24h)`);

    // 🟠 Rischio abbandono / onboarding incompleto
    if (!isNewOrg && !everLoginOrgIds.has(org.id)) alerts.push("Mai effettuato accesso");
    else if (everLoginOrgIds.has(org.id) && !recentLoginOrgIds.has(org.id)) alerts.push("Inattiva da 30+ giorni");
    if (!isNewOrg && org.apartments.length === 0) alerts.push("Nessun appartamento");

    return {
      id: org.id, name: org.name, slug: org.slug, createdAt: org.createdAt,
      userCount: org.users.length,
      managerCount: org.users.filter(u => u.role === "MANAGER").length,
      apartmentCount: org.apartments.length,
      activeCleanings: allCleanings.length,
      openTickets: allTickets.length,
      totalBookings: org.apartments.reduce((s, a) => s + a.bookings.length, 0),
      hasManager, alerts,
    };
  });
}

export async function getOrgDetail(orgId: string) {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      users: { orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, createdAt: true, phone: true, isExternal: true } },
      apartments: {
        orderBy: { name: "asc" },
        include: {
          cleaningTasks: { where: { status: { in: ["PENDING", "IN_PROGRESS", "AWAITING_REVIEW"] } }, select: { id: true, date: true, status: true }, orderBy: { date: "asc" }, take: 5 },
          maintenanceTickets: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } }, select: { id: true, title: true, priority: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 },
        },
      },
    },
    // include fiscal fields via direct select override not needed — include fetches all scalar fields
  });
}

export async function getAIUsageAllOrgs() {
  const orgs = await prisma.organization.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true,
      aiMonthlyTokenLimit: true, aiTokensUsed: true, aiTokensResetAt: true,
      perplexityMonthlyLimit: true, perplexityRequestsUsed: true, perplexityRequestsResetAt: true,
    },
  });

  const now = new Date();
  const isNewMonth = (d: Date | null) => {
    if (!d) return true;
    return now.getFullYear() !== d.getFullYear() || now.getMonth() !== d.getMonth();
  };

  return orgs.map(org => ({
    id: org.id,
    name: org.name,
    tokens: {
      used: isNewMonth(org.aiTokensResetAt) ? 0 : org.aiTokensUsed,
      limit: org.aiMonthlyTokenLimit,
    },
    perplexity: {
      used: isNewMonth(org.perplexityRequestsResetAt) ? 0 : org.perplexityRequestsUsed,
      limit: org.perplexityMonthlyLimit,
    },
  }));
}

export async function updateAILimits(orgId: string, aiMonthlyTokenLimit: number, perplexityMonthlyLimit: number) {
  await prisma.organization.update({
    where: { id: orgId },
    data: { aiMonthlyTokenLimit, perplexityMonthlyLimit },
  });
  revalidatePath("/superadmin");
}

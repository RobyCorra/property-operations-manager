"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
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
  await prisma.user.create({
    data: { name, email, password: hashed, role: "MANAGER", organizationId: orgId },
  });
  revalidatePath("/superadmin");
  return { success: true };
}

export async function deleteTestData(formData: FormData) {
  const orgId = formData.get("orgId") as string;
  if (!orgId) return;
  const apartments = await prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true } });
  const aptIds = apartments.map(a => a.id);
  await prisma.$transaction([
    prisma.cleaningTask.deleteMany({ where: { apartmentId: { in: aptIds } } }),
    prisma.booking.deleteMany({ where: { apartmentId: { in: aptIds } } }),
    prisma.maintenanceTicket.deleteMany({ where: { apartmentId: { in: aptIds } } }),
    prisma.apartment.deleteMany({ where: { organizationId: orgId } }),
    prisma.user.deleteMany({ where: { organizationId: orgId, role: { not: "MANAGER" } } }),
  ]);
  revalidatePath("/superadmin");
  redirect(`/superadmin/${orgId}`);
}

export async function getAllOrgsWithMetrics() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      apartments: {
        select: {
          id: true, name: true,
          cleaningTasks: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } }, select: { id: true, date: true, status: true } },
          maintenanceTickets: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } }, select: { id: true, priority: true, status: true, createdAt: true } },
          bookings: { where: { status: { not: "CANCELLED" } }, select: { id: true } },
        },
      },
    },
  });

  const now = new Date();
  return orgs.map(org => {
    const allCleanings = org.apartments.flatMap(a => a.cleaningTasks);
    const allTickets = org.apartments.flatMap(a => a.maintenanceTickets);
    const overdueCleanings = allCleanings.filter(c =>
      c.status === "PENDING" && new Date(c.date) < new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    );
    const urgentTickets = allTickets.filter(t => t.priority === "URGENT");
    const hasManager = org.users.some(u => u.role === "MANAGER");
    const alerts: string[] = [];
    if (!hasManager) alerts.push("Nessun manager");
    if (overdueCleanings.length > 0) alerts.push(`${overdueCleanings.length} pulizie in ritardo`);
    if (urgentTickets.length > 0) alerts.push(`${urgentTickets.length} ticket urgenti`);
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
  });
}

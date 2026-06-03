"use server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";

export type MonthKey = string; // "2026-01"

export type PeriodStats = {
  total: number;
  late: number;
  reviews: number;
};

export type PersonRow = {
  id: string;
  name: string;
  initials: string;
  months: Record<MonthKey, PeriodStats>;
};

export type ApartmentRow = {
  id: string;
  name: string;
  cleanings: Record<MonthKey, PeriodStats>;
  maintenance: Record<MonthKey, PeriodStats>;
};

export type AnalyticsData = {
  months: MonthKey[];          // ordered oldest → newest
  apartments: ApartmentRow[];
  cleaners: PersonRow[];
  manutentori: PersonRow[];
};

function monthKey(d: Date): MonthKey {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function initials(name: string) {
  return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
}

function emptyStats(): PeriodStats { return { total: 0, late: 0, reviews: 0 }; }

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const orgId = await getCurrentOrg();
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Build ordered month keys (last 6 months)
  const months: MonthKey[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return monthKey(d);
  });

  const [rawCleanings, rawTickets] = await Promise.all([
    prisma.cleaningTask.findMany({
      where: {
        apartment: { organizationId: orgId },
        date: { gte: sixMonthsAgo },
        status: { in: ["COMPLETED", "AWAITING_REVIEW"] },
      },
      select: {
        id: true,
        date: true,
        startedAt: true,
        apartmentId: true,
        apartment: { select: { id: true, name: true } },
        assignedToId: true,
        assignedTo: { select: { id: true, name: true } },
        supervisorReviews: { select: { decision: true } },
      },
    }),
    prisma.maintenanceTicket.findMany({
      where: {
        apartment: { organizationId: orgId },
        createdAt: { gte: sixMonthsAgo },
        status: { in: ["COMPLETED", "RESOLVED"] },
      },
      select: {
        id: true,
        createdAt: true,
        scheduledStart: true,
        startedAt: true,
        apartmentId: true,
        apartment: { select: { id: true, name: true } },
        assignedToId: true,
        assignedTo: { select: { id: true, name: true } },
        supervisorReviews: { select: { decision: true } },
      },
    }),
  ]);

  // ── Apartments ────────────────────────────────────────────────
  const aptMap = new Map<string, ApartmentRow>();

  const ensureApt = (apt: { id: string; name: string }) => {
    if (!aptMap.has(apt.id)) {
      aptMap.set(apt.id, {
        id: apt.id,
        name: apt.name,
        cleanings: Object.fromEntries(months.map(m => [m, emptyStats()])),
        maintenance: Object.fromEntries(months.map(m => [m, emptyStats()])),
      });
    }
    return aptMap.get(apt.id)!;
  };

  for (const c of rawCleanings) {
    const mk = monthKey(new Date(c.date));
    if (!months.includes(mk)) continue;
    const row = ensureApt(c.apartment);
    row.cleanings[mk].total++;
    if (c.startedAt && new Date(c.startedAt) > new Date(c.date)) row.cleanings[mk].late++;
    if (c.supervisorReviews.some(r => r.decision !== "APPROVED")) row.cleanings[mk].reviews++;
  }

  for (const t of rawTickets) {
    const mk = monthKey(new Date(t.createdAt));
    if (!months.includes(mk)) continue;
    const row = ensureApt(t.apartment);
    row.maintenance[mk].total++;
    if (t.startedAt && t.scheduledStart && new Date(t.startedAt) > new Date(t.scheduledStart))
      row.maintenance[mk].late++;
    if (t.supervisorReviews.some(r => r.decision !== "APPROVED")) row.maintenance[mk].reviews++;
  }

  // ── Cleaners ─────────────────────────────────────────────────
  const cleanerMap = new Map<string, PersonRow>();

  for (const c of rawCleanings) {
    if (!c.assignedToId || !c.assignedTo) continue;
    const mk = monthKey(new Date(c.date));
    if (!months.includes(mk)) continue;
    if (!cleanerMap.has(c.assignedToId)) {
      cleanerMap.set(c.assignedToId, {
        id: c.assignedToId,
        name: c.assignedTo.name,
        initials: initials(c.assignedTo.name),
        months: Object.fromEntries(months.map(m => [m, emptyStats()])),
      });
    }
    const row = cleanerMap.get(c.assignedToId)!;
    row.months[mk].total++;
    if (c.startedAt && new Date(c.startedAt) > new Date(c.date)) row.months[mk].late++;
    if (c.supervisorReviews.some(r => r.decision !== "APPROVED")) row.months[mk].reviews++;
  }

  // ── Manutentori ───────────────────────────────────────────────
  const manutMap = new Map<string, PersonRow>();

  for (const t of rawTickets) {
    if (!t.assignedToId || !t.assignedTo) continue;
    const mk = monthKey(new Date(t.createdAt));
    if (!months.includes(mk)) continue;
    if (!manutMap.has(t.assignedToId)) {
      manutMap.set(t.assignedToId, {
        id: t.assignedToId,
        name: t.assignedTo.name,
        initials: initials(t.assignedTo.name),
        months: Object.fromEntries(months.map(m => [m, emptyStats()])),
      });
    }
    const row = manutMap.get(t.assignedToId)!;
    row.months[mk].total++;
    if (t.startedAt && t.scheduledStart && new Date(t.startedAt) > new Date(t.scheduledStart))
      row.months[mk].late++;
    if (t.supervisorReviews.some(r => r.decision !== "APPROVED")) row.months[mk].reviews++;
  }

  return {
    months,
    apartments: [...aptMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    cleaners: [...cleanerMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
    manutentori: [...manutMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function getAnalyticsFilters() {
  const orgId = await getCurrentOrg();
  const [cleaners, manutentori, apartments] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: orgId, role: "CLEANER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: "MAINTENANCE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.apartment.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { cleaners, manutentori, apartments };
}

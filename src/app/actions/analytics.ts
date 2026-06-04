"use server";

import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";

export type MonthKey = string; // "2026-01"

export type PeriodStats = {
  total: number;
  late: number;
  reviews: number;
  pending: number;
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
  months: MonthKey[];
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

function emptyStats(): PeriodStats { return { total: 0, late: 0, reviews: 0, pending: 0 }; }

function emptyMonths(months: MonthKey[]): Record<MonthKey, PeriodStats> {
  return Object.fromEntries(months.map(m => [m, emptyStats()]));
}

export async function getAnalyticsData(year?: number, month?: number): Promise<AnalyticsData> {
  const orgId = await getCurrentOrg();
  const now = new Date();
  const refYear = year ?? now.getFullYear();
  const refMonth = month ?? now.getMonth() + 1; // 1-based
  // Build 6-month window ending at the selected month
  const refDate = new Date(refYear, refMonth - 1, 1);
  const sixMonthsAgo = new Date(refYear, refMonth - 6, 1);

  const months: MonthKey[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - (5 - i), 1);
    return monthKey(d);
  });

  // Fetch base lists + raw data in parallel
  const [allApts, allCleaners, allManut, rawCleanings, pendingCleanings, rawTickets] = await Promise.all([
    prisma.apartment.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
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
    // Completed/in-progress cleanings for stats and sparkline
    prisma.cleaningTask.findMany({
      where: {
        apartment: { organizationId: orgId },
        date: { gte: sixMonthsAgo },
        status: { not: "PENDING" },
      },
      select: {
        date: true,
        startedAt: true,
        apartmentId: true,
        assignedToId: true,
        supervisorReviews: { select: { decision: true } },
      },
    }),
    // Pending cleanings per apartment (separate count, not in sparkline)
    prisma.cleaningTask.findMany({
      where: {
        apartment: { organizationId: orgId },
        date: { gte: sixMonthsAgo },
        status: "PENDING",
      },
      select: { date: true, apartmentId: true },
    }),
    // All tickets in last 6 months
    prisma.maintenanceTicket.findMany({
      where: {
        apartment: { organizationId: orgId },
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        scheduledStart: true,
        startedAt: true,
        apartmentId: true,
        assignedToId: true,
        supervisorReviews: { select: { decision: true } },
      },
    }),
  ]);

  // ── Pre-populate maps from full lists ─────────────────────────
  const aptMap = new Map<string, ApartmentRow>(
    allApts.map(a => [a.id, { id: a.id, name: a.name, cleanings: emptyMonths(months), maintenance: emptyMonths(months) }])
  );

  const cleanerMap = new Map<string, PersonRow>(
    allCleaners.map(u => [u.id, { id: u.id, name: u.name, initials: initials(u.name), months: emptyMonths(months) }])
  );

  const manutMap = new Map<string, PersonRow>(
    allManut.map(u => [u.id, { id: u.id, name: u.name, initials: initials(u.name), months: emptyMonths(months) }])
  );

  // ── Fill cleanings stats ──────────────────────────────────────
  for (const c of rawCleanings) {
    const mk = monthKey(new Date(c.date));
    if (!months.includes(mk)) continue;

    const apt = aptMap.get(c.apartmentId);
    if (apt) {
      apt.cleanings[mk].total++;
      if (c.startedAt && new Date(c.startedAt) > new Date(c.date)) apt.cleanings[mk].late++;
      if (c.supervisorReviews.some(r => r.decision !== "APPROVED")) apt.cleanings[mk].reviews++;
    }

    if (c.assignedToId) {
      const cleaner = cleanerMap.get(c.assignedToId);
      if (cleaner) {
        cleaner.months[mk].total++;
        if (c.startedAt && new Date(c.startedAt) > new Date(c.date)) cleaner.months[mk].late++;
        if (c.supervisorReviews.some(r => r.decision !== "APPROVED")) cleaner.months[mk].reviews++;
      }
    }
  }

  // ── Fill pending cleanings ────────────────────────────────────
  for (const c of pendingCleanings) {
    const mk = monthKey(new Date(c.date));
    if (!months.includes(mk)) continue;
    const apt = aptMap.get(c.apartmentId);
    if (apt) apt.cleanings[mk].pending++;
  }

  // ── Fill maintenance stats ────────────────────────────────────
  for (const t of rawTickets) {
    const mk = monthKey(new Date(t.createdAt));
    if (!months.includes(mk)) continue;

    const apt = aptMap.get(t.apartmentId);
    if (apt) {
      apt.maintenance[mk].total++;
      if (t.startedAt && t.scheduledStart && new Date(t.startedAt) > new Date(t.scheduledStart))
        apt.maintenance[mk].late++;
      if (t.supervisorReviews.some(r => r.decision !== "APPROVED")) apt.maintenance[mk].reviews++;
    }

    if (t.assignedToId) {
      const manut = manutMap.get(t.assignedToId);
      if (manut) {
        manut.months[mk].total++;
        if (t.startedAt && t.scheduledStart && new Date(t.startedAt) > new Date(t.scheduledStart))
          manut.months[mk].late++;
        if (t.supervisorReviews.some(r => r.decision !== "APPROVED")) manut.months[mk].reviews++;
      }
    }
  }

  return {
    months,
    apartments: [...aptMap.values()],
    cleaners: [...cleanerMap.values()],
    manutentori: [...manutMap.values()],
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

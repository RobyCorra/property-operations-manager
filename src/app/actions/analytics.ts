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
  checkins: Record<MonthKey, PeriodStats>;
};

export type AnalyticsData = {
  months: MonthKey[];
  apartments: ApartmentRow[];
  cleaners: PersonRow[];
  manutentori: PersonRow[];
  assistenti: PersonRow[];
  // association indexes for client-side filtering
  cleanerApts: Record<string, string[]>;   // cleanerId → aptId[]
  manutApts: Record<string, string[]>;     // manutId  → aptId[]
  assistantApts: Record<string, string[]>; // assistantId → aptId[]
  aptCleaners: Record<string, string[]>;   // aptId    → cleanerId[]
  aptManuts: Record<string, string[]>;     // aptId    → manutId[]
  aptAssistants: Record<string, string[]>; // aptId    → assistantId[]
  // per-cleaner-per-apt breakdown (for filtered stats)
  cleanerAptStats: Record<string, Record<string, Record<MonthKey, PeriodStats>>>;
  manutAptStats: Record<string, Record<string, Record<MonthKey, PeriodStats>>>;
  assistantAptStats: Record<string, Record<string, Record<MonthKey, PeriodStats>>>;
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
  const [allApts, allCleaners, allManut, allAssist, rawCleanings, pendingCleanings, rawTickets, rawCheckins, pendingCheckins] = await Promise.all([
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
    prisma.user.findMany({
      where: { organizationId: orgId, role: "CHECKIN" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    // Cleanings COMPLETATE: consegnate (AWAITING_REVIEW) o approvate (APPROVED)
    prisma.cleaningTask.findMany({
      where: {
        apartment: { organizationId: orgId },
        date: { gte: sixMonthsAgo },
        status: { in: ["AWAITING_REVIEW", "APPROVED"] },
      },
      select: {
        date: true,
        startedAt: true,
        apartmentId: true,
        assignedToId: true,
        supervisorReviews: { select: { decision: true } },
      },
    }),
    // Cleanings DA FARE: PENDING + IN_PROGRESS (non ancora consegnate)
    prisma.cleaningTask.findMany({
      where: {
        apartment: { organizationId: orgId },
        date: { gte: sixMonthsAgo },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      select: { date: true, apartmentId: true, assignedToId: true },
    }),
    // Ticket manutenzione COMPLETATI: consegnati (AWAITING_REVIEW) o approvati (APPROVED)
    prisma.maintenanceTicket.findMany({
      where: {
        apartment: { organizationId: orgId },
        createdAt: { gte: sixMonthsAgo },
        status: { in: ["AWAITING_REVIEW", "APPROVED"] },
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
    // Check-in COMPLETATI
    prisma.checkinTask.findMany({
      where: {
        apartment: { organizationId: orgId },
        date: { gte: sixMonthsAgo },
        status: "COMPLETED",
      },
      select: { date: true, startedAt: true, apartmentId: true, assignedToId: true },
    }),
    // Check-in DA FARE: PENDING + IN_PROGRESS
    prisma.checkinTask.findMany({
      where: {
        apartment: { organizationId: orgId },
        date: { gte: sixMonthsAgo },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      select: { date: true, apartmentId: true, assignedToId: true },
    }),
  ]);

  // ── Pre-populate maps from full lists ─────────────────────────
  const aptMap = new Map<string, ApartmentRow>(
    allApts.map(a => [a.id, { id: a.id, name: a.name, cleanings: emptyMonths(months), maintenance: emptyMonths(months), checkins: emptyMonths(months) }])
  );

  const cleanerMap = new Map<string, PersonRow>(
    allCleaners.map(u => [u.id, { id: u.id, name: u.name, initials: initials(u.name), months: emptyMonths(months) }])
  );

  const manutMap = new Map<string, PersonRow>(
    allManut.map(u => [u.id, { id: u.id, name: u.name, initials: initials(u.name), months: emptyMonths(months) }])
  );

  const assistMap = new Map<string, PersonRow>(
    allAssist.map(u => [u.id, { id: u.id, name: u.name, initials: initials(u.name), months: emptyMonths(months) }])
  );

  // Association indexes
  const cleanerAptsMap = new Map<string, Set<string>>();
  const manutAptsMap = new Map<string, Set<string>>();
  const assistAptsMap = new Map<string, Set<string>>();
  const aptCleanersMap = new Map<string, Set<string>>();
  const aptManutsMap = new Map<string, Set<string>>();
  const aptAssistsMap = new Map<string, Set<string>>();

  // Per-cleaner-per-apt breakdown: cleanerId → aptId → monthKey → PeriodStats
  const cleanerAptStatsMap = new Map<string, Map<string, Map<MonthKey, PeriodStats>>>();
  const manutAptStatsMap = new Map<string, Map<string, Map<MonthKey, PeriodStats>>>();
  const assistAptStatsMap = new Map<string, Map<string, Map<MonthKey, PeriodStats>>>();

  function getCleanerAptStats(cleanerId: string, aptId: string, mk: MonthKey): PeriodStats {
    if (!cleanerAptStatsMap.has(cleanerId)) cleanerAptStatsMap.set(cleanerId, new Map());
    const byApt = cleanerAptStatsMap.get(cleanerId)!;
    if (!byApt.has(aptId)) byApt.set(aptId, new Map());
    const byMonth = byApt.get(aptId)!;
    if (!byMonth.has(mk)) byMonth.set(mk, emptyStats());
    return byMonth.get(mk)!;
  }

  function getManutAptStats(manutId: string, aptId: string, mk: MonthKey): PeriodStats {
    if (!manutAptStatsMap.has(manutId)) manutAptStatsMap.set(manutId, new Map());
    const byApt = manutAptStatsMap.get(manutId)!;
    if (!byApt.has(aptId)) byApt.set(aptId, new Map());
    const byMonth = byApt.get(aptId)!;
    if (!byMonth.has(mk)) byMonth.set(mk, emptyStats());
    return byMonth.get(mk)!;
  }

  function getAssistAptStats(assistId: string, aptId: string, mk: MonthKey): PeriodStats {
    if (!assistAptStatsMap.has(assistId)) assistAptStatsMap.set(assistId, new Map());
    const byApt = assistAptStatsMap.get(assistId)!;
    if (!byApt.has(aptId)) byApt.set(aptId, new Map());
    const byMonth = byApt.get(aptId)!;
    if (!byMonth.has(mk)) byMonth.set(mk, emptyStats());
    return byMonth.get(mk)!;
  }

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
      const isLate = !!(c.startedAt && new Date(c.startedAt) > new Date(c.date));
      const hasReview = c.supervisorReviews.some(r => r.decision !== "APPROVED");
      if (cleaner) {
        cleaner.months[mk].total++;
        if (isLate) cleaner.months[mk].late++;
        if (hasReview) cleaner.months[mk].reviews++;
      }
      // Breakdown per cleaner+apt
      const cas = getCleanerAptStats(c.assignedToId, c.apartmentId, mk);
      cas.total++;
      if (isLate) cas.late++;
      if (hasReview) cas.reviews++;

      if (!cleanerAptsMap.has(c.assignedToId)) cleanerAptsMap.set(c.assignedToId, new Set());
      cleanerAptsMap.get(c.assignedToId)!.add(c.apartmentId);
      if (!aptCleanersMap.has(c.apartmentId)) aptCleanersMap.set(c.apartmentId, new Set());
      aptCleanersMap.get(c.apartmentId)!.add(c.assignedToId);
    }
  }

  // ── Fill pending cleanings + build associations from pending too ─
  for (const c of pendingCleanings) {
    const mk = monthKey(new Date(c.date));
    if (!months.includes(mk)) continue;
    const apt = aptMap.get(c.apartmentId);
    if (apt) apt.cleanings[mk].pending++;

    // Build apt↔cleaner associations even from pending cleanings
    if (c.assignedToId) {
      if (!cleanerAptsMap.has(c.assignedToId)) cleanerAptsMap.set(c.assignedToId, new Set());
      cleanerAptsMap.get(c.assignedToId)!.add(c.apartmentId);
      if (!aptCleanersMap.has(c.apartmentId)) aptCleanersMap.set(c.apartmentId, new Set());
      aptCleanersMap.get(c.apartmentId)!.add(c.assignedToId);
    }
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
      const isLate = !!(t.startedAt && t.scheduledStart && new Date(t.startedAt) > new Date(t.scheduledStart));
      const hasReview = t.supervisorReviews.some(r => r.decision !== "APPROVED");
      if (manut) {
        manut.months[mk].total++;
        if (isLate) manut.months[mk].late++;
        if (hasReview) manut.months[mk].reviews++;
      }
      // Breakdown per manut+apt
      const mas = getManutAptStats(t.assignedToId, t.apartmentId, mk);
      mas.total++;
      if (isLate) mas.late++;
      if (hasReview) mas.reviews++;

      if (!manutAptsMap.has(t.assignedToId)) manutAptsMap.set(t.assignedToId, new Set());
      manutAptsMap.get(t.assignedToId)!.add(t.apartmentId);
      if (!aptManutsMap.has(t.apartmentId)) aptManutsMap.set(t.apartmentId, new Set());
      aptManutsMap.get(t.apartmentId)!.add(t.assignedToId);
    }
  }

  // ── Fill check-in stats (regole come pulizie; niente review) ──
  for (const c of rawCheckins) {
    const mk = monthKey(new Date(c.date));
    if (!months.includes(mk)) continue;

    const apt = aptMap.get(c.apartmentId);
    const isLate = !!(c.startedAt && new Date(c.startedAt) > new Date(c.date));
    if (apt) {
      apt.checkins[mk].total++;
      if (isLate) apt.checkins[mk].late++;
    }

    if (c.assignedToId) {
      const assist = assistMap.get(c.assignedToId);
      if (assist) {
        assist.months[mk].total++;
        if (isLate) assist.months[mk].late++;
      }
      const aas = getAssistAptStats(c.assignedToId, c.apartmentId, mk);
      aas.total++;
      if (isLate) aas.late++;

      if (!assistAptsMap.has(c.assignedToId)) assistAptsMap.set(c.assignedToId, new Set());
      assistAptsMap.get(c.assignedToId)!.add(c.apartmentId);
      if (!aptAssistsMap.has(c.apartmentId)) aptAssistsMap.set(c.apartmentId, new Set());
      aptAssistsMap.get(c.apartmentId)!.add(c.assignedToId);
    }
  }

  for (const c of pendingCheckins) {
    const mk = monthKey(new Date(c.date));
    if (!months.includes(mk)) continue;
    const apt = aptMap.get(c.apartmentId);
    if (apt) apt.checkins[mk].pending++;

    if (c.assignedToId) {
      if (!assistAptsMap.has(c.assignedToId)) assistAptsMap.set(c.assignedToId, new Set());
      assistAptsMap.get(c.assignedToId)!.add(c.apartmentId);
      if (!aptAssistsMap.has(c.apartmentId)) aptAssistsMap.set(c.apartmentId, new Set());
      aptAssistsMap.get(c.apartmentId)!.add(c.assignedToId);
    }
  }

  const toRecord = (m: Map<string, Set<string>>) =>
    Object.fromEntries([...m.entries()].map(([k, v]) => [k, [...v]]));

  // Serialize nested breakdown maps
  const serializeCleanerAptStats = () => {
    const out: Record<string, Record<string, Record<MonthKey, PeriodStats>>> = {};
    for (const [cleanerId, byApt] of cleanerAptStatsMap) {
      out[cleanerId] = {};
      for (const [aptId, byMonth] of byApt) {
        out[cleanerId][aptId] = Object.fromEntries(byMonth.entries());
      }
    }
    return out;
  };

  const serializeManutAptStats = () => {
    const out: Record<string, Record<string, Record<MonthKey, PeriodStats>>> = {};
    for (const [manutId, byApt] of manutAptStatsMap) {
      out[manutId] = {};
      for (const [aptId, byMonth] of byApt) {
        out[manutId][aptId] = Object.fromEntries(byMonth.entries());
      }
    }
    return out;
  };

  const serializeAssistAptStats = () => {
    const out: Record<string, Record<string, Record<MonthKey, PeriodStats>>> = {};
    for (const [assistId, byApt] of assistAptStatsMap) {
      out[assistId] = {};
      for (const [aptId, byMonth] of byApt) {
        out[assistId][aptId] = Object.fromEntries(byMonth.entries());
      }
    }
    return out;
  };

  return {
    months,
    apartments: [...aptMap.values()],
    cleaners: [...cleanerMap.values()],
    manutentori: [...manutMap.values()],
    assistenti: [...assistMap.values()],
    cleanerApts: toRecord(cleanerAptsMap),
    manutApts: toRecord(manutAptsMap),
    assistantApts: toRecord(assistAptsMap),
    aptCleaners: toRecord(aptCleanersMap),
    aptManuts: toRecord(aptManutsMap),
    aptAssistants: toRecord(aptAssistsMap),
    cleanerAptStats: serializeCleanerAptStats(),
    manutAptStats: serializeManutAptStats(),
    assistantAptStats: serializeAssistAptStats(),
  };
}

export async function getAnalyticsFilters() {
  const orgId = await getCurrentOrg();
  const [cleaners, manutentori, assistenti, apartments] = await Promise.all([
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
    prisma.user.findMany({
      where: { organizationId: orgId, role: "CHECKIN" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.apartment.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { cleaners, manutentori, assistenti, apartments };
}

// ─── Analytics Prodotti & Costi (tutti i valori IVA inclusa) ──────────────────

export type ProductsAnalytics = {
  months: MonthKey[];
  selectedMonth: MonthKey;
  kpi: {
    totalStockValue: number;      // scorte appartamenti + magazzino (lordo)
    warehouseStockValue: number;  // solo magazzino (lordo)
    consumedCostMonth: number;    // costo consumato nel mese selezionato (lordo)
    lowStockCount: number;
  };
  matrix: {
    rows: { id: string; name: string; isWarehouse: boolean; months: Record<MonthKey, number> }[];
    totals: Record<MonthKey, number>;
  };
  topProducts: { name: string; emoji: string; unit: string; qty: number; cost: number }[];
  lowStock: { location: string; isWarehouse: boolean; items: { emoji: string; name: string; stock: number; minStock: number; unit: string; value: number }[] }[];
};

const gross = (price: number, vat: number) => price * (1 + (vat ?? 0) / 100);

export async function getProductsAnalytics(year?: number, month?: number): Promise<ProductsAnalytics> {
  const orgId = await getCurrentOrg();
  const now = new Date();
  const refYear = year ?? now.getFullYear();
  const refMonth = month ?? now.getMonth() + 1;
  const refDate = new Date(refYear, refMonth - 1, 1);
  const sixMonthsAgo = new Date(refYear, refMonth - 6, 1);
  const months: MonthKey[] = Array.from({ length: 6 }, (_, i) =>
    monthKey(new Date(refDate.getFullYear(), refDate.getMonth() - (5 - i), 1))
  );
  const selectedMonth = monthKey(refDate);

  const emptyRow = (): Record<MonthKey, number> => Object.fromEntries(months.map((m) => [m, 0]));

  const [apartments, aptProducts, whProducts, aptMoves, whMoves] = await Promise.all([
    prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.apartmentProduct.findMany({
      where: { apartment: { organizationId: orgId } },
      select: { apartmentId: true, name: true, emoji: true, unit: true, stock: true, minStock: true, price: true, vat: true },
    }),
    prisma.warehouseProduct.findMany({
      where: { organizationId: orgId ?? undefined },
      select: { name: true, emoji: true, unit: true, stock: true, minStock: true, price: true, vat: true },
    }).catch(() => [] as any[]),
    prisma.stockMovement.findMany({
      where: { product: { apartment: { organizationId: orgId } }, delta: { lt: 0 }, createdAt: { gte: sixMonthsAgo } },
      select: { delta: true, createdAt: true, product: { select: { apartmentId: true, name: true, emoji: true, unit: true, price: true, vat: true } } },
    }).catch(() => [] as any[]),
    prisma.warehouseStockMovement.findMany({
      where: { product: { organizationId: orgId ?? undefined }, delta: { lt: 0 }, createdAt: { gte: sixMonthsAgo } },
      select: { delta: true, createdAt: true, product: { select: { name: true, emoji: true, unit: true, price: true, vat: true } } },
    }).catch(() => [] as any[]),
  ]);

  // ── Matrice costo consumato per mese ──
  const aptName = new Map(apartments.map((a) => [a.id, a.name]));
  const rowMap = new Map<string, { id: string; name: string; isWarehouse: boolean; months: Record<MonthKey, number> }>();
  // righe appartamento solo per quelli che hanno prodotti
  for (const p of aptProducts) {
    if (!rowMap.has(p.apartmentId)) {
      rowMap.set(p.apartmentId, { id: p.apartmentId, name: aptName.get(p.apartmentId) ?? "?", isWarehouse: false, months: emptyRow() });
    }
  }
  const whRow = { id: "__warehouse__", name: "Magazzino", isWarehouse: true, months: emptyRow() };

  for (const m of aptMoves as any[]) {
    const mk = monthKey(new Date(m.createdAt));
    if (!months.includes(mk)) continue;
    let row = rowMap.get(m.product.apartmentId);
    if (!row) { row = { id: m.product.apartmentId, name: aptName.get(m.product.apartmentId) ?? "?", isWarehouse: false, months: emptyRow() }; rowMap.set(m.product.apartmentId, row); }
    row.months[mk] += (-m.delta) * gross(m.product.price, m.product.vat);
  }
  for (const m of whMoves as any[]) {
    const mk = monthKey(new Date(m.createdAt));
    if (!months.includes(mk)) continue;
    whRow.months[mk] += (-m.delta) * gross(m.product.price, m.product.vat);
  }

  const rows = [...rowMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  if (whProducts.length > 0 || Object.values(whRow.months).some((v) => v > 0)) rows.push(whRow);
  const totals = emptyRow();
  for (const r of rows) for (const mk of months) totals[mk] += r.months[mk];

  // ── KPI ──
  const aptStockValue = aptProducts.reduce((s, p) => s + gross(p.price, p.vat) * p.stock, 0);
  const warehouseStockValue = (whProducts as any[]).reduce((s, p) => s + gross(p.price, p.vat) * p.stock, 0);
  const lowApt = aptProducts.filter((p) => p.stock <= p.minStock);
  const lowWh = (whProducts as any[]).filter((p) => p.stock <= p.minStock);

  // ── Top prodotti per costo (mese selezionato), aggregati per nome+unità ──
  const topMap = new Map<string, { name: string; emoji: string; unit: string; qty: number; cost: number }>();
  const addTop = (m: any) => {
    const mk = monthKey(new Date(m.createdAt));
    if (mk !== selectedMonth) return;
    const key = `${m.product.name}|${m.product.unit}`;
    const cur = topMap.get(key) ?? { name: m.product.name, emoji: m.product.emoji, unit: m.product.unit, qty: 0, cost: 0 };
    cur.qty += -m.delta;
    cur.cost += (-m.delta) * gross(m.product.price, m.product.vat);
    topMap.set(key, cur);
  };
  for (const m of aptMoves as any[]) addTop(m);
  for (const m of whMoves as any[]) addTop(m);
  const topProducts = [...topMap.values()].filter((t) => t.cost > 0).sort((a, b) => b.cost - a.cost).slice(0, 8);

  // ── Scorte sotto minima raggruppate per location ──
  const lowStock: ProductsAnalytics["lowStock"] = [];
  if (lowWh.length > 0) {
    lowStock.push({
      location: "Magazzino", isWarehouse: true,
      items: lowWh.map((p) => ({ emoji: p.emoji, name: p.name, stock: p.stock, minStock: p.minStock, unit: p.unit, value: gross(p.price, p.vat) * p.stock })),
    });
  }
  const byApt = new Map<string, ProductsAnalytics["lowStock"][number]["items"]>();
  for (const p of lowApt) {
    const arr = byApt.get(p.apartmentId) ?? [];
    arr.push({ emoji: p.emoji, name: p.name, stock: p.stock, minStock: p.minStock, unit: p.unit, value: gross(p.price, p.vat) * p.stock });
    byApt.set(p.apartmentId, arr);
  }
  for (const [aptId, items] of byApt) {
    lowStock.push({ location: aptName.get(aptId) ?? "?", isWarehouse: false, items });
  }

  return {
    months,
    selectedMonth,
    kpi: {
      totalStockValue: aptStockValue + warehouseStockValue,
      warehouseStockValue,
      consumedCostMonth: totals[selectedMonth] ?? 0,
      lowStockCount: lowApt.length + lowWh.length,
    },
    matrix: { rows, totals },
    topProducts,
    lowStock,
  };
}

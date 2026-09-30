import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getMyCompanyStaff } from "@/src/app/actions/company";
import ImpresaMaintenanceAssign from "@/src/components/impresa-maintenance-assign";
import ImpresaMaintenanceKpi, { type MaintKpiItem } from "@/src/components/impresa-maintenance-kpi";

export const dynamic = "force-dynamic";

function localDateKey(d: Date | string): string {
  const v = new Date(d);
  return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
}

export default async function ImpresaManutenzionePage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");
  if (!access.scopes.includes("MAINTENANCE")) redirect("/dashboard/impresa");

  const maintenanceAptIds = access.scopeApartments?.MAINTENANCE;
  const aptFilter = maintenanceAptIds
    ? { apartmentId: { in: maintenanceAptIds } }
    : { apartment: { organizationId: { in: access.orgIds } } };

  const [rows, staff, orgs, apts] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where: { ...aptFilter, status: { notIn: ["CANCELLED", "REJECTED"] } },
      select: {
        id: true, title: true, status: true, priority: true, createdAt: true, scheduledStart: true, assignedToId: true,
        apartment: { select: { name: true, organizationId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    getMyCompanyStaff(),
    access.orgIds.length
      ? prisma.organization.findMany({ where: { id: { in: access.orgIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
    maintenanceAptIds
      ? prisma.apartment.findMany({ where: { id: { in: maintenanceAptIds } }, select: { id: true, name: true, organizationId: true }, orderBy: { name: "asc" } })
      : access.orgIds.length
        ? prisma.apartment.findMany({ where: { organizationId: { in: access.orgIds } }, select: { id: true, name: true, organizationId: true }, orderBy: { name: "asc" } })
        : Promise.resolve([]),
  ]);

  const orgName = new Map(orgs.map((o) => [o.id, o.name]));
  const mainteners = staff.filter((s) => s.role === "MAINTENANCE").map((s) => ({ id: s.id, name: s.name }));
  const apartments = apts.map((a) => ({ id: a.id, name: a.name, ownerName: orgName.get(a.organizationId ?? "") ?? "—" }));

  const tickets = rows.map((r) => ({
    id: r.id,
    title: r.title,
    apartmentName: r.apartment.name,
    ownerName: orgName.get(r.apartment.organizationId ?? "") ?? "—",
    priority: r.priority,
    status: r.status,
    dateISO: (r.scheduledStart ?? r.createdAt).toISOString(),
    assignedToId: r.assignedToId,
  }));

  // ── KPI ──
  const now = new Date();
  const todayKey = localDateKey(now);
  const DONE_STATUSES = ["RESOLVED", "COMPLETED", "APPROVED", "CLOSED"];
  const fmtTime = (d: Date | string) => new Date(d).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const toItem = (r: (typeof rows)[number]): MaintKpiItem => ({
    id: r.id,
    label: r.title,
    sublabel: `${r.apartment.name} · ${r.scheduledStart ? fmtTime(r.scheduledStart) : "—"}`,
    href: `/dashboard/impresa/manutenzione/${r.id}`,
  });

  const todayRows = rows.filter((r) => r.scheduledStart && localDateKey(r.scheduledStart) === todayKey);
  const kpiToday = todayRows.map(toItem);
  const kpiOpen = rows.filter((r) => r.status === "IN_PROGRESS").map(toItem);
  const kpiLate = todayRows.filter((r) => {
    if (DONE_STATUSES.includes(r.status) || r.status === "IN_PROGRESS") return false;
    if (!r.scheduledStart) return false;
    return now.getTime() > new Date(r.scheduledStart).getTime() + 30 * 60 * 1000;
  }).map(toItem);
  const kpiClosed = todayRows.filter((r) => DONE_STATUSES.includes(r.status)).map(toItem);
  const kpiUnassigned = rows.filter((r) => !r.assignedToId && !DONE_STATUSES.includes(r.status) && r.status !== "CANCELLED" && r.status !== "PROPOSED" && r.status !== "REJECTED").map(toItem);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Manutenzione</h1>
        <p className="mt-1 text-sm text-slate-500">Tutti gli interventi di manutenzione dei tuoi clienti.</p>
      </div>

      <ImpresaMaintenanceKpi
        ticketsToday={kpiToday}
        ticketsOpen={kpiOpen}
        ticketsLate={kpiLate}
        ticketsClosed={kpiClosed}
        ticketsUnassigned={kpiUnassigned}
      />

      {mainteners.length === 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-700">
          Non hai ancora operatori di manutenzione. Aggiungili in <strong>Staff</strong> per poter assegnare gli interventi.
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <ImpresaMaintenanceAssign tickets={tickets} staff={mainteners} apartments={apartments} />
      </div>
    </div>
  );
}

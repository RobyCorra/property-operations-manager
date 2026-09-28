import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getMyCompanyStaff } from "@/src/app/actions/company";
import ImpresaMaintenanceAssign from "@/src/components/impresa-maintenance-assign";

export const dynamic = "force-dynamic";

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

  const [rows, staff, orgs] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where: { ...aptFilter, status: { not: "CANCELLED" } },
      select: {
        id: true, title: true, status: true, priority: true, createdAt: true, assignedToId: true,
        apartment: { select: { name: true, organizationId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    getMyCompanyStaff(),
    access.orgIds.length
      ? prisma.organization.findMany({ where: { id: { in: access.orgIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
  ]);

  const orgName = new Map(orgs.map((o) => [o.id, o.name]));
  const mainteners = staff.filter((s) => s.role === "MAINTENANCE").map((s) => ({ id: s.id, name: s.name }));

  const tickets = rows.map((r) => ({
    id: r.id,
    title: r.title,
    apartmentName: r.apartment.name,
    ownerName: orgName.get(r.apartment.organizationId ?? "") ?? "—",
    priority: r.priority,
    status: r.status,
    createdISO: r.createdAt.toISOString(),
    assignedToId: r.assignedToId,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Manutenzione</h1>
        <p className="mt-1 text-sm text-slate-500">Tutti gli interventi di manutenzione dei tuoi clienti.</p>
      </div>

      {mainteners.length === 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-700">
          Non hai ancora operatori di manutenzione. Aggiungili in <strong>Staff</strong> per poter assegnare gli interventi.
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <ImpresaMaintenanceAssign tickets={tickets} staff={mainteners} />
      </div>
    </div>
  );
}

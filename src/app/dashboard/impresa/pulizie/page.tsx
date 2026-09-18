import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getMyCompanyStaff } from "@/src/app/actions/company";
import ImpresaCleaningAssign from "@/src/components/impresa-cleaning-assign";

export const dynamic = "force-dynamic";

function startOfTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function ImpresaPuliziePage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");
  if (!access.scopes.includes("CLEANING")) redirect("/dashboard/impresa");

  const [rows, staff] = await Promise.all([
    prisma.cleaningTask.findMany({
      where: {
        apartment: { organizationId: { in: access.orgIds } },
        status: { not: "CANCELLED" },
        date: { gte: startOfTodayUTC() },
      },
      select: {
        id: true, date: true, status: true, assignedToId: true,
        apartment: { select: { name: true, organizationId: true } },
      },
      orderBy: { date: "asc" },
      take: 100,
    }),
    getMyCompanyStaff(),
  ]);

  const [orgs, apts] = await Promise.all([
    access.orgIds.length
      ? prisma.organization.findMany({ where: { id: { in: access.orgIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
    access.orgIds.length
      ? prisma.apartment.findMany({ where: { organizationId: { in: access.orgIds } }, select: { id: true, name: true, organizationId: true }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);
  const orgName = new Map(orgs.map((o) => [o.id, o.name]));
  const cleaners = staff.filter((s) => s.role === "CLEANER").map((s) => ({ id: s.id, name: s.name }));
  const apartments = apts.map((a) => ({ id: a.id, name: a.name, ownerName: orgName.get(a.organizationId ?? "") ?? "—" }));

  const fmt = (d: Date | string) =>
    new Date(d).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  const cleanings = rows.map((r) => ({
    id: r.id,
    apartmentName: r.apartment.name,
    ownerName: orgName.get(r.apartment.organizationId ?? "") ?? "—",
    date: fmt(r.date),
    status: r.status,
    assignedToId: r.assignedToId,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pulizie</h1>
        <p className="mt-1 text-sm text-slate-500">Assegna le pulizie ai tuoi operatori.</p>
      </div>

      {cleaners.length === 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-700">
          Non hai ancora operatori. Aggiungili in <strong>Staff</strong> per poter assegnare le pulizie.
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <ImpresaCleaningAssign cleanings={cleanings} staff={cleaners} apartments={apartments} />
      </div>
    </div>
  );
}

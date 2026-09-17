import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";

export const dynamic = "force-dynamic";

const SCOPE_LABEL: Record<string, string> = {
  CLEANING: "Pulizie",
  MAINTENANCE: "Manutenzione",
  CHECKIN: "Check-in",
  SUPERVISION: "Supervisione",
};

export default async function ImpresaClientiPage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  // Organizzazioni (proprietari) che hanno ingaggiato questa impresa, con le
  // funzioni delegate e il numero di appartamenti visibili.
  const engagements = await prisma.engagement.findMany({
    where: { companyId: access.companyId, status: "ACTIVE" },
    select: { scope: true, organizationId: true, organization: { select: { id: true, name: true } } },
  });

  const byOrg = new Map<string, { name: string; scopes: string[] }>();
  for (const e of engagements) {
    const cur = byOrg.get(e.organizationId) ?? { name: e.organization.name, scopes: [] };
    cur.scopes.push(e.scope);
    byOrg.set(e.organizationId, cur);
  }

  const orgIds = [...byOrg.keys()];
  const counts = orgIds.length
    ? await prisma.apartment.groupBy({ by: ["organizationId"], where: { organizationId: { in: orgIds } }, _count: { _all: true } })
    : [];
  const countByOrg = new Map(counts.map((x) => [x.organizationId, x._count._all]));

  const clients = [...byOrg.entries()].map(([id, v]) => ({ id, name: v.name, scopes: v.scopes, apartments: countByOrg.get(id) ?? 0 }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Clienti</h1>
        <p className="mt-1 text-sm text-slate-500">Le organizzazioni per cui lavori, con le funzioni delegate.</p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Nessun cliente. Comparirà qui quando un proprietario ti delega una funzione.
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((cl) => (
            <div key={cl.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">🏠</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{cl.name}</p>
                <p className="text-[12px] text-gray-500">
                  {cl.apartments} appartament{cl.apartments === 1 ? "o" : "i"} · {cl.scopes.map((s) => SCOPE_LABEL[s] ?? s).join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

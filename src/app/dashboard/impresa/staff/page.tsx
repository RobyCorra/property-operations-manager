import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getMyCompanyStaff } from "@/src/app/actions/company";
import ImpresaStaffManager from "@/src/components/impresa-staff-manager";

export const dynamic = "force-dynamic";

const SCOPE_STAFF_ROLE: Record<string, string> = {
  CLEANING: "CLEANER",
  MAINTENANCE: "MAINTENANCE",
  CHECKIN: "CHECKIN",
  SUPERVISION: "SUPERVISOR",
};

export default async function ImpresaStaffPage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  // Ruoli creabili = quelli coerenti con le funzioni delegate all'impresa.
  const company = await prisma.company.findUnique({ where: { id: access.companyId }, select: { scopes: true } });
  const roles = [...new Set((company?.scopes ?? []).map((s) => SCOPE_STAFF_ROLE[s]).filter(Boolean))];

  const staff = await getMyCompanyStaff();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Staff</h1>
        <p className="mt-1 text-sm text-slate-500">Gli operatori della tua impresa. Accedono con la dashboard operativa (cleaner).</p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <ImpresaStaffManager staff={staff} roles={roles.length ? roles : ["CLEANER"]} />
      </div>
    </div>
  );
}

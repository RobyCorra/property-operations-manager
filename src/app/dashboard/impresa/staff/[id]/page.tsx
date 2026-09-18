import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getMyStaffMember } from "@/src/app/actions/company";
import ImpresaStaffEdit from "@/src/components/impresa-staff-edit";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

const SCOPE_STAFF_ROLE: Record<string, string> = {
  CLEANING: "CLEANER",
  MAINTENANCE: "MAINTENANCE",
  CHECKIN: "CHECKIN",
  SUPERVISION: "SUPERVISOR",
};

export default async function ImpresaStaffMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  const { id } = await params;
  const member = await getMyStaffMember(id);
  if (!member) notFound();

  const company = await prisma.company.findUnique({ where: { id: access.companyId }, select: { scopes: true } });
  const roles = [...new Set([...(company?.scopes ?? []).map((s) => SCOPE_STAFF_ROLE[s]).filter(Boolean), "MANAGER", "SUPERVISOR"])];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <BackButton />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{member.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Modifica i dati dell'operatore.</p>
      </div>
      <ImpresaStaffEdit member={member} roles={roles} />
    </div>
  );
}

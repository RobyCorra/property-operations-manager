import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import ImpresaStaffManager from "@/src/components/impresa-staff-manager";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

const SCOPE_STAFF_ROLE: Record<string, string> = {
  CLEANING: "CLEANER",
  MAINTENANCE: "MAINTENANCE",
  CHECKIN: "CHECKIN",
  SUPERVISION: "SUPERVISOR",
};

export default async function ImpresaNewStaffPage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  const company = await prisma.company.findUnique({ where: { id: access.companyId }, select: { scopes: true } });
  const roles = [...new Set([...(company?.scopes ?? []).map((s) => SCOPE_STAFF_ROLE[s]).filter(Boolean), "MANAGER", "SUPERVISOR"])];

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Nuovo Collaboratore</h1>
          <p className="text-gray-500 mt-1">Aggiungi un operatore al tuo team.</p>
        </div>

        <ImpresaStaffManager staff={[]} roles={roles} autoOpen />
      </div>
    </main>
  );
}

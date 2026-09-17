import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompanyAccess } from "@/src/lib/company-access";

export const dynamic = "force-dynamic";

export default async function ImpresaMagazzinoPage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Magazzino</h1>
        <p className="mt-1 text-sm text-slate-500">Le scorte dell'impresa, isolate e non visibili ai proprietari.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-8 text-center text-sm text-gray-400">
        📦 Magazzino impresa — in arrivo nel prossimo step.
      </div>
    </div>
  );
}

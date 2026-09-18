import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getWarehouseProducts, getWarehouseCostTotals } from "@/src/app/actions/warehouse";
import WarehousePanel from "@/src/components/warehouse-panel";

export const dynamic = "force-dynamic";

export default async function ImpresaMagazzinoPage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  const [products, costTotals] = await Promise.all([getWarehouseProducts(), getWarehouseCostTotals()]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Magazzino</h1>
        <p className="mt-1 text-sm text-slate-500">Le scorte della tua impresa, isolate e non visibili ai proprietari.</p>
      </div>
      <WarehousePanel initialProducts={products} costTotals={costTotals} />
    </div>
  );
}

import { cookies } from "next/headers";
import { getT } from "@/src/lib/server-lang";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/src/lib/tenant";
import { prisma } from "@/src/lib/prisma";
import { getWarehouseCostTotals } from "@/src/app/actions/warehouse";
import WarehousePanel from "@/src/components/warehouse-panel";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

export default async function WarehousePage() {
  const tr = await getT();
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "MANAGER") redirect("/login");

  const orgId = await getCurrentOrg();
  const products = orgId
    ? await prisma.warehouseProduct.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const costTotals = await getWarehouseCostTotals();

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <BackButton />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{tr.whTitle}</h1>
            <p className="text-gray-500 mt-1">{tr.whSubtitle}</p>
          </div>
        </div>
        <WarehousePanel initialProducts={products} costTotals={costTotals} />
      </div>
    </main>
  );
}

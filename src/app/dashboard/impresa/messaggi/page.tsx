import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getImpresaThreads } from "@/src/app/actions/company";
import ImpresaChat from "@/src/components/impresa-chat";

export const dynamic = "force-dynamic";

export default async function ImpresaMessaggiPage() {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  const threads = await getImpresaThreads();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Messaggi</h1>
        <p className="mt-1 text-sm text-slate-500">Chat privata con i tuoi operatori. Non visibile ai proprietari.</p>
      </div>
      <ImpresaChat threads={threads} />
    </div>
  );
}

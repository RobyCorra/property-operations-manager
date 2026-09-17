import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getImpreseOverview } from "@/src/app/actions/company";
import ImpreseManager from "@/src/components/imprese-manager";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

export default async function ImpresePage() {
  const cookieStore = await cookies();
  if (cookieStore.get("role")?.value !== "MANAGER") redirect("/login");
  // Solo il proprietario (manager senza companyId) gestisce le deleghe.
  if (cookieStore.get("companyId")?.value) redirect("/dashboard/manager");

  const overview = await getImpreseOverview();

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <BackButton />
          <p className="text-xs font-medium uppercase tracking-wide text-violet-500">Organizzazione</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Imprese e deleghe</h1>
          <p className="mt-1 text-sm text-slate-500">
            Delega una funzione a un'impresa esterna, oppure gestiscila internamente. Le imprese vedono solo la funzione delegata.
          </p>
        </div>

        <ImpreseManager initial={overview} />
      </div>
    </main>
  );
}

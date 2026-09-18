import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyImpresaThread } from "@/src/app/actions/company";
import ImpresaStaffChat from "@/src/components/impresa-staff-chat";

export const dynamic = "force-dynamic";

// Chat dell'operatore d'impresa con il proprio responsabile. Accessibile solo
// agli utenti legati a una Company (companyId nel cookie).
export default async function StaffMessaggiPage() {
  const c = await cookies();
  const role = c.get("role")?.value;
  if (!role) redirect("/login");
  if (!c.get("companyId")?.value) redirect("/login");

  const messages = await getMyImpresaThread();
  const backLink = role === "MAINTENANCE" ? "/dashboard/maintenance" : role === "CHECKIN" ? "/dashboard/checkin" : role === "SUPERVISOR" ? "/dashboard/supervisor" : "/dashboard/cleaner";

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href={backLink} className="text-sm text-slate-400 hover:text-slate-600">&larr; Torna alla dashboard</Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Messaggi</h1>
          <p className="mt-1 text-sm text-slate-500">Chat con il responsabile della tua impresa.</p>
        </div>
        <ImpresaStaffChat initial={messages} />
      </div>
    </main>
  );
}

import { cookies } from "next/headers";
import { getT } from "@/src/lib/server-lang";
import { redirect } from "next/navigation";
import { getClients, getApartmentsForClientAssign } from "@/src/app/actions/client";
import ClientsPanel from "@/src/components/clients-panel";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const tr = await getT();
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  if (role !== "MANAGER") redirect("/login");

  const [clients, apartments] = await Promise.all([
    getClients(),
    getApartmentsForClientAssign(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <BackButton />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{tr.clTitle}</h1>
            <p className="text-gray-500 mt-1">{tr.clEmptyHint}</p>
          </div>
        </div>
        <ClientsPanel initialClients={clients} apartments={apartments} />
      </div>
    </main>
  );
}

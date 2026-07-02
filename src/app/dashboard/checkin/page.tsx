import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/src/app/actions/auth";

// Placeholder Fase 2: la dashboard operativa completa arriva in Fase 4.
export default async function CheckinDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (role !== "CHECKIN" || !userId) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#faf8ff] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
        <span className="text-3xl">🔑</span>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Assistente Check-in</h1>
      <p className="text-slate-500 mt-2 max-w-sm">
        La tua dashboard dei check-in sarà disponibile a breve.
      </p>
      <form action={logoutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 shadow-sm"
        >
          Esci
        </button>
      </form>
    </main>
  );
}

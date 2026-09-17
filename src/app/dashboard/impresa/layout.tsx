import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCompanyAccess } from "@/src/lib/company-access";
import { logoutAction } from "@/src/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function ImpresaLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  const name = access?.companyName ?? "Impresa";
  const scopes = access?.scopes ?? [];

  const nav = [
    { href: "/dashboard/impresa", label: "Dashboard", emoji: "▦" },
    ...(scopes.includes("CLEANING") ? [{ href: "/dashboard/impresa/pulizie", label: "Pulizie", emoji: "🧹" }] : []),
    { href: "/dashboard/impresa/staff", label: "Staff", emoji: "👥" },
    { href: "/dashboard/impresa/clienti", label: "Clienti", emoji: "🏠" },
    { href: "/dashboard/impresa/magazzino", label: "Magazzino", emoji: "📦" },
  ];

  return (
    <div className="min-h-screen bg-[#faf8ff] font-sans">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500 text-xs font-bold text-white">P</span>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Impresa</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-900">{name}</span>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">Esci</button>
          </form>
        </div>
      </header>

      <nav className="flex gap-1.5 overflow-x-auto border-b border-gray-100 bg-white/60 px-4 py-2 md:px-6">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-violet-50 hover:text-violet-600"
          >
            <span className="mr-1">{n.emoji}</span>{n.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

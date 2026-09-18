import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompanyAccess } from "@/src/lib/company-access";
import { ManagerLangProvider } from "@/src/components/lang-context";
import { getServerLang } from "@/src/lib/server-lang";
import ImpresaShell from "@/src/components/impresa-shell";

export const dynamic = "force-dynamic";

export default async function ImpresaLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  const name = access?.companyName ?? "Impresa";
  const lang = await getServerLang();

  return (
    <ManagerLangProvider initialLang={lang}>
      <ImpresaShell name={name}>{children}</ImpresaShell>
    </ManagerLangProvider>
  );
}

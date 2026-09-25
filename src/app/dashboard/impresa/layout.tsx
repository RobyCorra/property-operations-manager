import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCompanyAccess } from "@/src/lib/company-access";
import { ManagerLangProvider } from "@/src/components/lang-context";
import { getServerLang } from "@/src/lib/server-lang";
import ImpresaShell from "@/src/components/impresa-shell";
import { getPendingInvites } from "@/src/app/actions/company";
import PendingInviteBanner from "@/src/components/pending-invite-banner";

export const dynamic = "force-dynamic";

export default async function ImpresaLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const [access, pendingInvites] = await Promise.all([
    getCompanyAccess(),
    getPendingInvites().catch(() => []),
  ]);
  const name = access?.companyName ?? "Impresa";
  const lang = await getServerLang();

  return (
    <ManagerLangProvider initialLang={lang}>
      <ImpresaShell name={name}>
        <PendingInviteBanner invites={pendingInvites} />
        {children}
      </ImpresaShell>
    </ManagerLangProvider>
  );
}

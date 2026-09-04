import { cookies } from "next/headers";
import SidebarLayout from "@/src/components/sidebar-layout";
import AutoRefresh from "@/src/components/auto-refresh";
import PushPermissionRequest from "@/src/components/push-permission";
import ApnsRegister from "@/src/components/apns-register";
import ImpersonateBanner from "@/src/components/superadmin/impersonate-banner";
import { getUnreadMessagesCount } from "../../actions/messages";
import { prisma } from "@/src/lib/prisma";
import { ManagerLangProvider } from "@/src/components/lang-context";
import { getServerLang } from "@/src/lib/server-lang";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessagesCount();
  const lang = await getServerLang();
  const cookieStore = await cookies();
  const impersonatingOrgId = cookieStore.get("impersonating")?.value;
  const orgId = cookieStore.get("organizationId")?.value;

  // Le query org sono avvolte in try/catch: se il DB va in timeout NON devono
  // far crashare il layout (che è il guscio dell'intera sezione manager —
  // se crasha lui, l'utente resta bloccato fuori da TUTTE le pagine).
  // In caso di errore si degrada con grazia: nome/logo assenti, ma l'app apre.
  let impersonatingOrgName: string | null = null;
  if (impersonatingOrgId) {
    try {
      const org = await prisma.organization.findUnique({ where: { id: impersonatingOrgId }, select: { name: true } });
      impersonatingOrgName = org?.name ?? null;
    } catch (e) {
      console.error("Layout manager: impossibile leggere l'org impersonata dal DB", e);
    }
  }

  let orgName: string | undefined;
  let orgLogo: string | null = null;
  if (orgId) {
    try {
      const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true, logoUrl: true } });
      orgName = org?.name ?? undefined;
      orgLogo = org?.logoUrl ?? null;
    } catch (e) {
      console.error("Layout manager: impossibile leggere l'org corrente dal DB", e);
    }
  }

  return (
    <ManagerLangProvider initialLang={lang}>
      <SidebarLayout unreadCount={unreadCount} orgName={orgName} orgLogo={orgLogo}>
        {impersonatingOrgName && <ImpersonateBanner orgName={impersonatingOrgName} />}
        <div className={impersonatingOrgName ? "pt-9" : ""}>
          {children}
        </div>
        <AutoRefresh intervalMs={30_000} />
        <PushPermissionRequest />
        <ApnsRegister />
      </SidebarLayout>
    </ManagerLangProvider>
  );
}

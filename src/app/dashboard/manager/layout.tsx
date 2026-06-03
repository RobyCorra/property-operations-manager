import { cookies } from "next/headers";
import SidebarLayout from "@/src/components/sidebar-layout";
import AutoRefresh from "@/src/components/auto-refresh";
import PushPermissionRequest from "@/src/components/push-permission";
import ImpersonateBanner from "@/src/components/superadmin/impersonate-banner";
import { getUnreadMessagesCount } from "../../actions/messages";
import { prisma } from "@/src/lib/prisma";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessagesCount();
  const cookieStore = await cookies();
  const impersonatingOrgId = cookieStore.get("impersonating")?.value;

  let impersonatingOrgName: string | null = null;
  if (impersonatingOrgId) {
    const org = await prisma.organization.findUnique({ where: { id: impersonatingOrgId }, select: { name: true } });
    impersonatingOrgName = org?.name ?? null;
  }

  return (
    <SidebarLayout unreadCount={unreadCount}>
      {impersonatingOrgName && <ImpersonateBanner orgName={impersonatingOrgName} />}
      <div className={impersonatingOrgName ? "pt-9" : ""}>
        {children}
      </div>
      <AutoRefresh intervalMs={30_000} />
      <PushPermissionRequest />
    </SidebarLayout>
  );
}

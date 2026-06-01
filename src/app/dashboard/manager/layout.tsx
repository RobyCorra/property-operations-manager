import SidebarLayout from "@/src/components/sidebar-layout";
import AutoRefresh from "@/src/components/auto-refresh";
import PushPermissionRequest from "@/src/components/push-permission";
import { getUnreadMessagesCount } from "../../actions/messages";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessagesCount();

  return (
    <SidebarLayout unreadCount={unreadCount}>
      {children}
      <AutoRefresh intervalMs={30_000} />
      <PushPermissionRequest />
    </SidebarLayout>
  );
}

import SidebarLayout from "@/src/components/sidebar-layout";
import { getUnreadMessagesCount } from "../../actions/messages";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessagesCount();

  return (
    <SidebarLayout unreadCount={unreadCount}>
      {children}
    </SidebarLayout>
  );
}

import SidebarLayout from "@/src/components/sidebar-layout";
import FloatingManagerChat from "@/src/components/floating-manager-chat";
import { getUnreadMessagesCount } from "../../actions/messages";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessagesCount();

  return (
    <SidebarLayout unreadCount={unreadCount}>
      {children}
      <FloatingManagerChat />
    </SidebarLayout>
  );
}

import SidebarLayout from "@/src/components/sidebar-layout";
import AutoRefresh from "@/src/components/auto-refresh";
import { getUnreadMessagesCount } from "../../actions/messages";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const unreadCount = await getUnreadMessagesCount();

  return (
    <SidebarLayout unreadCount={unreadCount}>
      {children}
      {/* Aggiorna i dati server ogni 30 secondi senza ricaricare la pagina */}
      <AutoRefresh intervalMs={30_000} />
    </SidebarLayout>
  );
}

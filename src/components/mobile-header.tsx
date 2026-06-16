"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "@/src/components/notification-bell";
import { logoutAction } from "@/src/app/actions/auth";

interface MobileHeaderProps {
  unreadCount?: number;
  onOpenSettings: () => void;
  orgName?: string;
}

// Azioni gestite dalla dashboard manager (sheet interni, niente navigazione vera).
const DASHBOARD_ACTIONS = new Set(["home", "calendar", "cleanings", "tickets", "map"]);

export default function MobileHeader({ unreadCount = 0, onOpenSettings, orgName }: MobileHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const nowDate = new Date();

  const go = (action: string, href?: string) => {
    setMenuOpen(false);
    if (DASHBOARD_ACTIONS.has(action)) {
      if (pathname === "/dashboard/manager") {
        window.dispatchEvent(new CustomEvent("mobile-tab-action", { detail: action }));
      } else {
        sessionStorage.setItem("openOnDashboard", action);
        router.push("/dashboard/manager");
      }
    } else if (href) {
      sessionStorage.removeItem("openOnDashboard");
      sessionStorage.removeItem("returnToSheet");
      router.push(href);
    }
  };

  const items = [
    { key: "home", label: "Home", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>, action: () => go("home") },
    { key: "messages", label: "Messaggi", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, action: () => go("messages", "/dashboard/manager/messages") },
    { key: "calendar", label: "Calendario", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, action: () => go("calendar") },
    { key: "cleanings", label: "Pulizie", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>, action: () => go("cleanings") },
    { key: "tickets", label: "Ticket", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, action: () => go("tickets") },
    { key: "apartments", label: "Appartamenti", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, action: () => go("apartments", "/dashboard/manager/apartments") },
    { key: "map", label: "Mappa", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, action: () => go("map") },
    { key: "users", label: "Staff", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, action: () => go("users", "/dashboard/manager/users") },
    { key: "analytics", label: "Analytics", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, action: () => go("analytics", "/dashboard/manager/analytics") },
  ];

  return (
    <>
      <div className="relative shrink-0 z-[100] px-3 pb-2 bg-white border-b border-[#ede9fe] md:hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        {orgName && (
          <p className="text-[13px] font-bold text-slate-900 text-center pt-1.5 pb-1.5 truncate">{orgName}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center justify-center w-[42px] h-[42px] rounded-xl bg-[#f0eeff] border border-[#ede9fe] shrink-0">
            <span className="text-[8px] font-bold uppercase text-violet-500 leading-none">{nowDate.toLocaleDateString("it-IT", { month: "short" }).replace(".", "")}</span>
            <span className="text-[16px] font-black text-violet-700 leading-tight">{nowDate.getDate()}</span>
          </div>
          <button
            onClick={onOpenSettings}
            aria-label="Impostazioni"
            className="w-[42px] h-[42px] flex items-center justify-center rounded-full bg-[#f8f7ff] border border-[#ede9fe] text-violet-700 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <div className="w-[42px] h-[42px] flex items-center justify-center shrink-0">
            <NotificationBell initialNotifications={[]} serverDate={nowDate.toISOString()} unreadMessagesCount={unreadCount} />
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="w-[42px] h-[42px] flex items-center justify-center rounded-full bg-[#f0eeff] border border-[#ddd6fe] text-violet-700 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
            <div className="grid grid-cols-4 gap-3">
              {items.map(item => (
                <button
                  key={item.key}
                  onClick={item.action}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-slate-600 hover:bg-[#f8f7ff] active:scale-95 transition-transform"
                >
                  <span className="text-violet-600">{item.icon}</span>
                  <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                </button>
              ))}
            </div>
            <form action={logoutAction} className="mt-3 pt-3 border-t border-slate-100">
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-rose-500 hover:bg-rose-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span className="text-[13px] font-bold">Esci</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

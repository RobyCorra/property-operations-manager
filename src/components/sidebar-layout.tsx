"use client";

import { useState, useEffect } from "react";
import ManagerNavbar from "./manager-navbar";
import { logoutAction } from "@/src/app/actions/auth";
import FloatingManagerChat from "./floating-manager-chat";
import SettingsDrawer from "./settings-drawer";
import MobileHeader from "./mobile-header";
import { useLang } from "@/src/components/lang-context";

interface SidebarLayoutProps {
  children: React.ReactNode;
  unreadCount: number;
  orgName?: string;
  orgLogo?: string | null;
}

export default function SidebarLayout({ children, unreadCount, orgName, orgLogo }: SidebarLayoutProps) {
  const { t } = useLang();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  // Use a stable initial value to avoid hydration mismatch: always start expanded
  const sidebarWidth = mounted && collapsed ? "md:pl-[72px]" : "md:pl-64";

  return (
    <div className="relative h-screen bg-[#faf8ff] flex w-full max-w-[100vw] overflow-hidden">
      {/* FloatingManagerChat fuori dall'header per evitare problemi di stacking context
          causati da backdrop-filter: blur sull'header sticky */}
      <FloatingManagerChat externalOpen={aiOpen} onExternalClose={() => setAiOpen(false)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Sidebar — nascosta su mobile */}
      <div className="hidden md:block">
        <ManagerNavbar unreadCount={unreadCount} collapsed={mounted && collapsed} onToggle={toggle} />
      </div>

      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarWidth}`}>
        {/* Top Bar — nascosta su mobile */}
        <header className="hidden md:flex sticky top-0 z-40 w-full h-20 bg-white/60 backdrop-blur-xl border-b border-white/40 items-center justify-between px-10 shadow-sm">
          <div className="flex-1 max-w-xl relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors">
              🔍
            </span>
            <input
              type="text"
              placeholder={t.navSearch}
              className="w-full bg-slate-100/50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/10 transition-all outline-none text-slate-600 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Bottone AI Assistant — apre la chat flottante renderizzata fuori dall'header */}
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 h-10 shadow-sm text-xs font-bold uppercase tracking-widest text-violet-700 transition hover:bg-violet-50 hover:shadow-md whitespace-nowrap"
              title={t.navAi}
            >
              🤖 {t.navAi}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span className="text-xl">⚙️</span>
              <span className="text-xs font-semibold uppercase tracking-wider hidden lg:block">{t.navSettings}</span>
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-colors hover:border-rose-100 hover:text-rose-600"
              >
                {t.navLogout}
              </button>
            </form>
            <div className="w-[1px] h-6 bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{orgName ?? t.navYourOrg}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shrink-0">
                {orgLogo ? (
                  <img src={orgLogo} alt={orgName ?? "Logo"} className="w-full h-full object-contain bg-white" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-[13px]">
                    {(orgName ?? "??").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header — shrink-0 dentro la gabbia h-screen, sostituisce il vecchio menu basso */}
        <MobileHeader unreadCount={unreadCount} onOpenSettings={() => setSettingsOpen(true)} onCloseSettings={() => setSettingsOpen(false)} orgName={orgName} />

        {/* Dashboard Main View */}
        <div className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}

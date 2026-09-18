"use client";

import { useEffect, useRef, useState } from "react";
import SidebarLayout from "@/src/components/sidebar-layout";
import { type NavItem } from "@/src/components/manager-navbar";
import { useLang } from "@/src/components/lang-context";
import { LayoutDashboard, Brush, UserCircle, Users, Package, MessageSquare } from "./icons";
import { getImpresaThreads } from "@/src/app/actions/company";

const HOME = "/dashboard/impresa";

// Voci di menu dell'impresa (solo le necessarie), stessi label i18n del manager.
const NAV: NavItem[] = [
  { key: "navDashboard", href: HOME, icon: LayoutDashboard },
  { key: "navCleanings", href: "/dashboard/impresa/pulizie", icon: Brush },
  { key: "navClients", href: "/dashboard/impresa/clienti", icon: UserCircle },
  { key: "navStaff", href: "/dashboard/impresa/staff", icon: Users },
  { key: "navWarehouse", href: "/dashboard/impresa/magazzino", icon: Package },
  { key: "navMessages", href: "/dashboard/impresa/messaggi", icon: MessageSquare },
];

const svg = (d: React.ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{d}</svg>
);

function beep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880; g.gain.value = 0.12;
    o.start();
    setTimeout(() => { try { o.stop(); ctx.close(); } catch {} }, 200);
  } catch {}
}

export default function ImpresaShell({ name, children }: { name: string; children: React.ReactNode }) {
  const { t } = useLang();
  const tr = t as unknown as Record<string, string>;
  const [unread, setUnread] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const list = await getImpresaThreads();
        if (!alive) return;
        const total = list.reduce((s, t) => s + t.unread, 0);
        if (total > prevRef.current) beep();
        prevRef.current = total;
        setUnread(total);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 15000);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  const mobileItems = [
    { key: "dashboard", label: tr.navDashboard, href: HOME, icon: svg(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>) },
    { key: "cleanings", label: tr.navCleanings, href: "/dashboard/impresa/pulizie", icon: svg(<><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></>) },
    { key: "clients", label: tr.navClients, href: "/dashboard/impresa/clienti", icon: svg(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>) },
    { key: "staff", label: tr.navStaff, href: "/dashboard/impresa/staff", icon: svg(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>) },
    { key: "warehouse", label: tr.navWarehouse, href: "/dashboard/impresa/magazzino", icon: svg(<><path d="M3 21V8l9-5 9 5v13"/><path d="M3 21h18"/><rect x="7" y="13" width="10" height="8"/></>) },
    { key: "messages", label: tr.navMessages, href: "/dashboard/impresa/messaggi", icon: svg(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>) },
  ];

  return (
    <SidebarLayout
      unreadCount={unread}
      orgName={name}
      orgLogo={null}
      navItems={NAV}
      mobileItems={mobileItems}
      homeHref={HOME}
      hideAssistant
    >
      <div className="p-4 md:p-6">{children}</div>
    </SidebarLayout>
  );
}

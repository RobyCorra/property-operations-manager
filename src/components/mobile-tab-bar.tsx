"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MobileTabBarProps {
  unreadCount?: number;
}

export default function MobileTabBar({ unreadCount = 0 }: MobileTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [lateCleansCount, setLateCleansCount] = useState(0);
  const [urgentTicketsCount, setUrgentTicketsCount] = useState(0);

  // Fetch badge counts on mount and every 60s
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/mobile-badge-counts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setLateCleansCount(data.lateCleans ?? 0);
          setUrgentTicketsCount(data.urgentTickets ?? 0);
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const tabTap = () => {
    try { navigator.vibrate?.(10); } catch {}
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
      osc.start(); osc.stop(ctx.currentTime + 0.07);
    } catch {}
  };

  const go = (href: string) => {
    tabTap();
    requestAnimationFrame(() => router.push(href));
  };

  const isDashboard = pathname === "/dashboard/manager";
  const isCalendar = pathname === "/dashboard/manager" && false; // gestito internamente
  const isApartments = pathname?.includes("/apartments");
  const isUsers = pathname?.includes("/users");
  const isAnalytics = pathname?.includes("/analytics");
  const isMessages = pathname?.includes("/messages");
  const isSettings = pathname?.includes("/settings");
  const isMaintenance = pathname?.includes("/maintenance");

  // Pulizie/Ticket: tab attivo solo se siamo sulla dashboard (gestione interna)
  // Per tutte le altre pagine navigano alla dashboard
  const isDashboardPage = pathname === "/dashboard/manager";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-slate-200 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative">
        {/* Left gradient hint */}
        <div
          id="mobileTabHintLeft"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 opacity-0 transition-opacity duration-200"
          style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.97))" }}
        />
        {/* Scrollable list */}
        <div
          className="overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          onScroll={(e) => {
            const el = e.currentTarget;
            const max = el.scrollWidth - el.clientWidth;
            const hL = document.getElementById("mobileTabHintLeft");
            const hR = document.getElementById("mobileTabHintRight");
            if (hL) hL.style.opacity = el.scrollLeft > 8 ? "1" : "0";
            if (hR) hR.style.opacity = el.scrollLeft >= max - 4 ? "0" : "1";
          }}
        >
          <div className="flex items-stretch px-1 pt-1.5 pb-1" style={{ width: "max-content" }}>

            {/* HOME */}
            <TabBtn
              active={isDashboardPage}
              onClick={() => go("/dashboard/manager")}
              label="Home"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              }
            />

            {/* CALENDARIO — apre la view calendario nella dashboard */}
            <TabBtn
              active={false}
              onClick={() => {
                tabTap();
                // Se siamo già sulla dashboard, dispatch custom event per cambiare tab
                if (isDashboardPage) {
                  window.dispatchEvent(new CustomEvent("mobile-tab-calendar"));
                } else {
                  requestAnimationFrame(() => router.push("/dashboard/manager?tab=calendar"));
                }
              }}
              label="Calendario"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              }
            />

            {/* PULIZIE */}
            <TabBtn
              active={false}
              onClick={() => {
                tabTap();
                if (isDashboardPage) {
                  window.dispatchEvent(new CustomEvent("mobile-tab-cleanings"));
                } else {
                  requestAnimationFrame(() => router.push("/dashboard/manager?tab=cleanings"));
                }
              }}
              label="Pulizie"
              dot={lateCleansCount > 0 ? "amber" : undefined}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
                  <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
                </svg>
              }
            />

            {/* TICKET */}
            <TabBtn
              active={isMaintenance}
              onClick={() => {
                tabTap();
                if (isDashboardPage) {
                  window.dispatchEvent(new CustomEvent("mobile-tab-tickets"));
                } else {
                  requestAnimationFrame(() => router.push("/dashboard/manager?tab=tickets"));
                }
              }}
              label="Ticket"
              dot={urgentTicketsCount > 0 ? "orange" : undefined}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              }
            />

            {/* APPARTAMENTI */}
            <TabBtn
              active={isApartments}
              onClick={() => go("/dashboard/manager/apartments")}
              label="Appartamenti"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              }
            />

            {/* STAFF */}
            <TabBtn
              active={isUsers}
              onClick={() => go("/dashboard/manager/users")}
              label="Staff"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
            />

            {/* ANALYTICS */}
            <TabBtn
              active={isAnalytics}
              onClick={() => go("/dashboard/manager/analytics")}
              label="Analytics"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              }
            />

            {/* MESSAGGI */}
            <TabBtn
              active={isMessages}
              onClick={() => go("/dashboard/manager/messages")}
              label="Messaggi"
              dot={unreadCount > 0 ? "rose" : undefined}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              }
            />

            {/* IMPOSTAZIONI */}
            <TabBtn
              active={isSettings}
              onClick={() => go("/dashboard/manager/settings")}
              label="Impostazioni"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              }
            />

          </div>
        </div>
        {/* Right gradient + bounce arrow */}
        <div
          id="mobileTabHintRight"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-9 z-10 flex items-center justify-end pr-1.5 transition-opacity duration-200"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.97))" }}
        >
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ animation: "bounceX 1.4s ease-in-out infinite" }}>
            <polyline points="1 1 7 6 1 11" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  icon,
  dot,
}: {
  active: boolean | null | undefined;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  dot?: "amber" | "orange" | "rose";
}) {
  const dotColor = dot === "amber" ? "bg-amber-400" : dot === "orange" ? "bg-orange-400" : "bg-rose-500";
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] px-2 py-1 rounded-2xl mx-0.5 transition-all ${active ? "bg-violet-50" : ""}`}
    >
      <div className={`w-11 h-8 rounded-xl flex items-center justify-center relative transition-all ${active ? "bg-violet-600 shadow-[0_2px_8px_rgba(99,102,241,.4)] text-white" : "text-slate-400"}`}>
        {icon}
        {dot && (
          <span className={`absolute top-0 right-0.5 w-2.5 h-2.5 ${dotColor} rounded-full border-2 border-white`} />
        )}
      </div>
      <p className={`text-[9px] font-bold tracking-wide whitespace-nowrap ${active ? "text-violet-600" : "text-slate-400"}`}>
        {label}
      </p>
    </button>
  );
}

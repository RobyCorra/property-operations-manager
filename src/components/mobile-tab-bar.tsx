"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/src/app/actions/auth";

interface MobileTabBarProps {
  unreadCount?: number;
}

type TabKey = "home" | "calendar" | "cleanings" | "tickets" | "apartments" | "users" | "analytics" | "messages";

// Chiave sessionStorage usata anche da mobile-dashboard per sapere cosa aprire al mount
const OPEN_ON_DASHBOARD_KEY = "openOnDashboard";

export default function MobileTabBar({ unreadCount = 0 }: MobileTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [lateCleansCount, setLateCleansCount] = useState(0);
  const [urgentTicketsCount, setUrgentTicketsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  // Sincronizza activeTab con pathname (per tab che navigano a pagine reali)
  useEffect(() => {
    if (pathname?.includes("/apartments")) setActiveTab("apartments");
    else if (pathname?.includes("/users"))  setActiveTab("users");
    else if (pathname?.includes("/analytics")) setActiveTab("analytics");
    else if (pathname?.includes("/messages"))  setActiveTab("messages");
    else if (pathname?.includes("/cleanings"))  setActiveTab("cleanings");
    else if (pathname?.includes("/maintenance")) setActiveTab("tickets");
    else if (pathname === "/dashboard/manager") {
      // Lascia l'activeTab locale (può essere calendar/cleanings/tickets se aperto da sheet)
    }
  }, [pathname]);

  // Badge counts
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/mobile-badge-counts", { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          setLateCleansCount(d.lateCleans ?? 0);
          setUrgentTicketsCount(d.urgentTickets ?? 0);
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const tap = (key: TabKey) => {
    setActiveTab(key);
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

  // Naviga a una pagina reale (pulisce sessionStorage per evitare side effects)
  const goTo = (key: TabKey, href: string) => {
    sessionStorage.removeItem("openOnDashboard");
    sessionStorage.removeItem("returnToSheet");
    tap(key);
    router.push(href);
  };

  // Apre uno sheet/view nella dashboard.
  // Se già sulla dashboard → evento immediato.
  // Se su un'altra pagina → salva in sessionStorage e naviga alla dashboard.
  const openInDashboard = (key: TabKey, action: string) => {
    tap(key);
    if (pathname === "/dashboard/manager") {
      window.dispatchEvent(new CustomEvent("mobile-tab-action", { detail: action }));
    } else {
      sessionStorage.setItem(OPEN_ON_DASHBOARD_KEY, action);
      router.push("/dashboard/manager");
    }
  };

  const a = activeTab;

  return (
    <div
      className="shrink-0 z-[100] bg-red-500 border-t border-red-600 md:hidden"
      style={{ paddingBottom: "4px" }}
    >
      <div className="relative">
        {/* Left fade hint */}
        <div
          id="mobileTabHintLeft"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 opacity-0 transition-opacity duration-200"
          style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,.97))" }}
        />

        {/* Scrollable tabs */}
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

            <T active={a==="home"} label="Home"
              onClick={() => openInDashboard("home", "home")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>}
            />

            <T active={a==="messages"} label="Messaggi"
              dot={unreadCount > 0 ? "rose" : undefined}
              onClick={() => goTo("messages", "/dashboard/manager/messages")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
            />

            <T active={a==="calendar"} label="Calendario"
              onClick={() => openInDashboard("calendar", "calendar")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            />

            <T active={a==="cleanings"} label="Pulizie"
              dot={lateCleansCount > 0 ? "amber" : undefined}
              onClick={() => openInDashboard("cleanings", "cleanings")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>}
            />

            <T active={a==="tickets"} label="Ticket"
              dot={urgentTicketsCount > 0 ? "orange" : undefined}
              onClick={() => openInDashboard("tickets", "tickets")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
            />

            <T active={a==="apartments"} label="Appartamenti"
              onClick={() => goTo("apartments", "/dashboard/manager/apartments")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            />

            <T active={a==="users"} label="Staff"
              onClick={() => goTo("users", "/dashboard/manager/users")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            />

            <T active={a==="analytics"} label="Analytics"
              onClick={() => goTo("analytics", "/dashboard/manager/analytics")}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
            />

            <form action={logoutAction} className="flex">
              <T active={false} label="Esci" variant="danger"
                onClick={() => {}}
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
                type="submit"
              />
            </form>

          </div>
        </div>

        {/* Right fade hint + arrow */}
        <div
          id="mobileTabHintRight"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-9 z-10 flex items-center justify-end pr-1.5"
          style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,.97))" }}
        >
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ animation: "bounceX 1.4s ease-in-out infinite" }}>
            <polyline points="1 1 7 6 1 11" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function T({ active, onClick, label, icon, dot, variant, type }: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  dot?: "amber" | "orange" | "rose";
  variant?: "danger";
  type?: "submit";
}) {
  const dotColor = dot === "amber" ? "bg-amber-400" : dot === "orange" ? "bg-orange-400" : "bg-rose-500";
  const isDanger = variant === "danger";
  return (
    <button onClick={onClick} type={type ?? "button"}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] px-2 py-1 rounded-2xl mx-0.5 transition-transform ${active ? "bg-violet-50" : ""}`}
    >
      <div className={`w-11 h-8 rounded-xl flex items-center justify-center relative transition-transform ${
        isDanger ? "text-rose-500" : active ? "bg-violet-600 shadow-[0_2px_8px_rgba(99,102,241,.4)] text-white" : "text-slate-400"
      }`}>
        {icon}
        {dot && <span className={`absolute top-0 right-0.5 w-2.5 h-2.5 ${dotColor} rounded-full border-2 border-white`} />}
      </div>
      <p className={`text-[9px] font-bold tracking-wide whitespace-nowrap ${isDanger ? "text-rose-500" : active ? "text-violet-600" : "text-slate-400"}`}>{label}</p>
    </button>
  );
}

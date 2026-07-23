"use client";

import { usePathname } from "next/navigation";
import { useLang } from "@/src/components/lang-context";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  MessageSquare,
  Brush,
  Wrench,
  Users,
  UserCircle,
  LogOut,
  ChevronLeft,
  MapPin,
  BarChart2,
} from "./icons";

const NAV_ITEMS = [
  { key: "navToday", href: "/dashboard/manager", icon: LayoutDashboard },
  { key: "navApartments", href: "/dashboard/manager/apartments", icon: Building2 },
  { key: "navBookings", href: "/dashboard/manager/bookings", icon: CalendarDays },
  { key: "navMap", href: "/dashboard/manager/mappa", icon: MapPin },
  { key: "navMessages", href: "/dashboard/manager/messages", icon: MessageSquare },
  { key: "navCleanings", href: "/dashboard/manager/cleanings", icon: Brush },
  { key: "navMaintenance", href: "/dashboard/manager/maintenance", icon: Wrench },
  { key: "navTeam", href: "/dashboard/manager/users", icon: Users },
  { key: "navAnalytics", href: "/dashboard/manager/analytics", icon: BarChart2 },
] as const;

interface ManagerNavbarProps {
  unreadCount?: number;
  collapsed: boolean;
  onToggle: () => void;
}

export default function ManagerNavbar({ unreadCount = 0, collapsed, onToggle }: ManagerNavbarProps) {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200/60 z-50 flex flex-col pt-8 pb-4 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3.5 top-8 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 z-10 transition-colors"
        aria-label={collapsed ? t.navExpand : t.navCollapse}
      >
        <ChevronLeft
          size={14}
          className={`text-slate-500 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Logo / Brand */}
      <div
        className={`flex items-center gap-3 mb-10 transition-all duration-300 overflow-hidden ${
          collapsed ? "px-0 justify-center" : "px-8"
        }`}
      >
        <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-violet-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
          <span className="text-white font-bold text-xl tracking-tighter">P</span>
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-none whitespace-nowrap">
              OpsManager
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block whitespace-nowrap">
              Control Room
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 space-y-1.5 ${collapsed ? "px-2" : "px-4"}`}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/manager" && pathname?.startsWith(item.href));
          const label = t[item.key];
          const isMessages = item.key === "navMessages";
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center rounded-2xl text-sm font-semibold transition-all duration-300 group ${
                collapsed ? "justify-center px-0 py-3" : "px-6 py-3 gap-3"
              } ${
                isActive
                  ? "bg-violet-500/10 text-violet-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-violet-600 rounded-r-full shadow-[2px_0_10px_rgba(124,58,237,0.4)]" />
              )}

              {/* Icon + optional mini badge */}
              <div className="relative flex-shrink-0">
                <Icon
                  size={20}
                  className={isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-900"}
                />
                {collapsed && isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              {/* Label (expanded only) */}
              {!collapsed && <span>{label}</span>}

              {/* Unread badge (expanded only) */}
              {!collapsed && isMessages && unreadCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-md shadow-rose-200">
                  {unreadCount}
                </span>
              )}

              {/* Tooltip (collapsed only) */}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {label}
                  {isMessages && unreadCount > 0 && (
                    <span className="ml-1.5 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {/* tooltip arrow */}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}

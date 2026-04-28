"use client";

import { usePathname } from "next/navigation";
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
  LogOut 
} from "./icons";

const NAV_ITEMS = [
  { label: "Oggi", href: "/dashboard/manager", icon: LayoutDashboard },
  { label: "Appartamenti", href: "/dashboard/manager/apartments", icon: Building2 },
  { label: "Prenotazioni", href: "/dashboard/manager/bookings", icon: CalendarDays },
  { label: "Messaggi", href: "/dashboard/manager/messages", icon: MessageSquare },
  { label: "Pulizie", href: "/dashboard/manager/cleanings", icon: Brush },
  { label: "Manutenzione", href: "/dashboard/manager/maintenance", icon: Wrench },
  { label: "Team", href: "/dashboard/manager/users", icon: Users },
];

export default function ManagerNavbar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200/60 z-50 flex flex-col pt-8 pb-4">
      {/* Logo / Brand */}
      <div className="px-8 mb-12">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 transition-transform group-hover:scale-110">
            <span className="text-white font-bold text-xl tracking-tighter">P</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-none">OpsManager</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Control Room</span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/manager" && pathname?.startsWith(item.href));
          const isMessages = item.label === "Messaggi";
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative group ${
                isActive 
                  ? "bg-violet-500/10 text-violet-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-900"} />
                <span>{item.label}</span>
              </div>
              
              {isMessages && unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-md shadow-rose-200">
                  {unreadCount}
                </span>
              )}

              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-violet-600 rounded-r-full shadow-[2px_0_10px_rgba(124,58,237,0.4)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account Info placeholder */}
      <div className="px-6 pt-4 border-t border-slate-100/60 mt-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-slate-100 shadow-inner flex items-center justify-center border border-slate-200 text-slate-400 transition-transform group-hover:scale-105">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Manager Account</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Proprietario</p>
            </div>
          </div>
          
          <button className="flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group">
            <LogOut size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

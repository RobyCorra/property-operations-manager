"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { markAllAsRead, markNotificationAsRead } from "@/src/app/actions/notification";
import { Bell, Brush, Wrench, CircleCheck } from "./icons";
import SafeDate from "./safe-date";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface NotificationBellProps {
  initialNotifications: NotificationItem[];
  serverDate: string;
}

export default function NotificationBell({ initialNotifications, serverDate }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // silenzioso — non bloccare l'UI se il poll fallisce
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markNotificationAsRead(id);
    router.refresh();
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllAsRead();
    router.refresh();
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full hover:bg-gray-100 transition-all text-gray-500 hover:text-violet-600 focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100] transform origin-top-right transition-all">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 mb-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500/80">Notifiche</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-wider"
              >
                Segna tutte come lette
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-3 rounded-xl mb-1 transition-all cursor-pointer flex gap-3 ${n.isRead ? 'opacity-60 bg-white' : 'bg-gray-50/80 hover:bg-gray-100/80'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'CLEANING' ? 'bg-violet-100 text-violet-600' : 'bg-rose-100 text-rose-600'}`}>
                    {n.type === 'CLEANING' ? <Brush size={16} /> : <Wrench size={16} />}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className={`text-xs font-bold ${n.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed truncate">{n.message}</p>
                    <SafeDate 
                      date={n.createdAt} 
                      showTimeAgo={true} 
                      serverDate={serverDate}
                      className="text-[9px] text-slate-400 font-medium" 
                    />
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400">
                <CircleCheck size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Nessuna notifica</p>
                <p className="text-[10px] mt-1 uppercase tracking-widest">Tutto sotto controllo</p>
              </div>
            )}
          </div>

          {/* Footer: testa push */}
          <PushTestFooter />
        </div>
      )}
    </div>

  );
}

function PushTestFooter() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [subCount, setSubCount] = useState<number | null>(null);

  async function checkSubs() {
    try {
      const res = await fetch("/api/push/debug");
      const data = await res.json();
      setSubCount(data.total ?? 0);
    } catch { setSubCount(-1); }
  }

  async function sendTest() {
    setStatus("sending");
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "self" }),
      });
      setStatus(res.ok ? "ok" : "error");
      setTimeout(() => setStatus("idle"), 3000);
    } catch { setStatus("error"); setTimeout(() => setStatus("idle"), 3000); }
  }

  useEffect(() => { checkSubs(); }, []);

  return (
    <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-2">
      <span className="text-[10px] text-slate-400">
        {subCount === null ? "..." : subCount === -1 ? "Errore DB" : `${subCount} dispositivi registrati`}
      </span>
      <button
        onClick={sendTest}
        disabled={status === "sending"}
        className="text-[10px] font-bold text-violet-600 hover:text-violet-800 uppercase tracking-wider disabled:opacity-40"
      >
        {status === "idle" ? "🔔 Testa push" : status === "sending" ? "Invio..." : status === "ok" ? "✅ Inviato" : "❌ Errore"}
      </button>
    </div>
  );
}

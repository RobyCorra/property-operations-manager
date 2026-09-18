"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getMyImpresaUnread } from "@/src/app/actions/company";

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

export default function CleanerMessagesButton({ initialUnread, variant }: { initialUnread: number; variant: "desktop" | "mobile" }) {
  const [unread, setUnread] = useState(initialUnread);
  const prev = useRef(initialUnread);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const n = await getMyImpresaUnread();
      if (!alive) return;
      if (n > prev.current) beep();
      prev.current = n;
      setUnread(n);
    };
    const id = setInterval(check, 15000);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  const badge = unread > 0 && (
    <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white animate-pulse">
      {unread > 9 ? "9+" : unread}
    </span>
  );

  if (variant === "mobile") {
    return (
      <Link href="/dashboard/messaggi" className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 ${unread > 0 ? "text-rose-600" : "text-slate-400 hover:text-violet-600"}`}>
        <span className="relative text-[20px] leading-none">💬{unread > 0 && <span className="absolute -right-2 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />}</span>
        <span className="text-[9px] font-black uppercase tracking-widest flex items-center">Messaggi{badge}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard/messaggi"
      className={`flex items-center gap-2 px-6 py-3 bg-white border text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 ${unread > 0 ? "border-rose-200 text-rose-600" : "border-slate-200 text-slate-700"}`}
    >
      💬 Messaggi{badge}
    </Link>
  );
}

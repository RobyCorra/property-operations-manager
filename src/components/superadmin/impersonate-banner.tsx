"use client";

export default function ImpersonateBanner({ orgName }: { orgName: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 bg-violet-600 px-4 py-2 text-white text-xs font-bold shadow-lg">
      <span>👤 Stai impersonando: <span className="font-black">{orgName}</span></span>
      <form action="/api/superadmin/stop-impersonate" method="POST">
        <button className="px-3 py-1 rounded-full bg-white text-violet-700 font-black text-[10px] hover:bg-violet-100 transition-all">
          ✕ Torna al pannello
        </button>
      </form>
    </div>
  );
}

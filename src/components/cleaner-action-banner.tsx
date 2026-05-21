"use client";

import { useLang } from "@/src/components/lang-context";

export default function CleanerActionBanner({ status }: { status: string }) {
  const { t } = useLang();

  if (status === "IN_PROGRESS") {
    return (
      <div className="w-full rounded-xl bg-violet-50 px-4 py-3.5 text-center text-xs font-black uppercase tracking-widest text-violet-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse mr-2 align-middle" />
        {t.inProgressBanner}
      </div>
    );
  }

  if (status === "AWAITING_REVIEW") {
    return (
      <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5 flex items-center gap-3">
        <span className="text-xl shrink-0">⏳</span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-700">{t.awaitingBanner}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">{t.awaitingSub}</p>
        </div>
      </div>
    );
  }

  if (status === "APPROVED" || status === "COMPLETED") {
    return (
      <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">{t.approvedTitle}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{t.approvedSub}</p>
        </div>
      </div>
    );
  }

  return null;
}

"use client";

import { useLang } from "@/src/components/lang-context";

export default function CleanerActionBanner({ status }: { status: string }) {
  const { t } = useLang();

  if (status === "IN_PROGRESS") {
    return (
      <div className="w-full rounded-full bg-violet-50 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-violet-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse mr-2 align-middle" />
        {t.inProgressBanner}
      </div>
    );
  }

  if (status === "AWAITING_REVIEW") {
    return (
      <div className="w-full rounded-full bg-yellow-50 border border-yellow-200 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-yellow-700">
        {t.awaitingBanner}
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="w-full rounded-full bg-emerald-600 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-white">
        {t.approvedBanner}
      </div>
    );
  }

  return null;
}

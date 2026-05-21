"use client";

import { useLang } from "@/src/components/lang-context";

const statusColor: Record<string, string> = {
  IN_PROGRESS: "bg-violet-500 text-white shadow-lg shadow-violet-200",
  AWAITING_REVIEW: "bg-yellow-400 text-white shadow-lg shadow-yellow-100",
  COMPLETED: "bg-emerald-500 text-white shadow-lg shadow-emerald-100",
  APPROVED: "bg-emerald-700 text-white",
  PENDING: "bg-slate-100 text-slate-500",
};

const dotColor: Record<string, string> = {
  IN_PROGRESS: "bg-white animate-pulse",
  AWAITING_REVIEW: "bg-white animate-pulse",
};

export default function CleanerStatusBadge({ status }: { status: string }) {
  const { t } = useLang();

  const label: Record<string, string> = {
    PENDING: t.statusPending,
    IN_PROGRESS: t.statusInProgress,
    AWAITING_REVIEW: t.statusAwaiting,
    COMPLETED: t.statusCompleted,
    APPROVED: t.statusApproved,
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${statusColor[status] ?? "bg-slate-100 text-slate-500"}`}
    >
      <div className={`h-1.5 w-1.5 rounded-full ${dotColor[status] ?? "bg-white/70"}`} />
      {label[status] ?? status}
    </span>
  );
}

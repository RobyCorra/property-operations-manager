"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignCleaning, approveCleaningByImpresa } from "@/src/app/actions/company";

type Staff = { id: string; name: string };
type Cleaning = {
  id: string;
  apartmentName: string;
  ownerName: string;
  date: string;
  status: string;
  assignedToId: string | null;
};

const statusCls: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  AWAITING_REVIEW: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

export default function ImpresaCleaningAssign({ cleanings, staff }: { cleanings: Cleaning[]; staff: Staff[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const onChange = (cleaningTaskId: string, value: string) => {
    setError(null);
    setPendingId(cleaningTaskId);
    startTransition(async () => {
      const r = await assignCleaning(cleaningTaskId, value || null);
      setPendingId(null);
      if (!r.success) setError(r.error);
      else router.refresh();
    });
  };

  const onApprove = (cleaningTaskId: string) => {
    setError(null);
    setPendingId(cleaningTaskId);
    startTransition(async () => {
      const r = await approveCleaningByImpresa(cleaningTaskId);
      setPendingId(null);
      if (!r.success) setError(r.error);
      else router.refresh();
    });
  };

  if (cleanings.length === 0) {
    return <p className="text-xs text-gray-400">Nessuna pulizia da oggi in poi.</p>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {cleanings.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {c.apartmentName}
              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">{c.ownerName}</span>
            </p>
            <p className="text-[11px] text-gray-500">{c.date}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusCls[c.status] ?? "bg-slate-100 text-slate-600"}`}>{c.status}</span>
          {c.status === "AWAITING_REVIEW" && (
            <button
              type="button"
              onClick={() => onApprove(c.id)}
              disabled={isPending && pendingId === c.id}
              className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
            >
              Approva
            </button>
          )}
          <select
            value={c.assignedToId ?? ""}
            disabled={isPending && pendingId === c.id}
            onChange={(e) => onChange(c.id, e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none disabled:opacity-50"
          >
            <option value="">Da assegnare</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

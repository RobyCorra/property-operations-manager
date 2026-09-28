"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { approveMaintenanceDateRequest, rejectMaintenanceDateRequest } from "@/src/app/actions/company";

export default function MaintenanceDateRequestDecision({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (r.success) router.refresh();
      else setError(r.error ?? "Errore.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={isPending} onClick={() => run(() => approveMaintenanceDateRequest(requestId))}
        className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">
        Approva spostamento
      </button>
      <button type="button" disabled={isPending} onClick={() => run(() => rejectMaintenanceDateRequest(requestId))}
        className="rounded-full border border-rose-300 px-4 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
        Rifiuta
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

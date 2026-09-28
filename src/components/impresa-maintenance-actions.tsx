"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { impresaSetMaintenanceStatus } from "@/src/app/actions/company";
import SupervisorReviewForm from "@/src/components/supervisor-review-form";

export default function ImpresaMaintenanceActions({
  ticketId,
  status,
  reviewerId,
}: {
  ticketId: string;
  status: string;
  reviewerId: string;
}) {
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

  // In attesa di verifica → pannello Approva / Rifiuta con correzioni (come pulizie).
  if (status === "AWAITING_REVIEW") {
    return (
      <SupervisorReviewForm
        entityId={ticketId}
        supervisorId={reviewerId}
        type="maintenance"
        onDone={() => router.refresh()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" && (
          <button type="button" disabled={isPending} onClick={() => run(() => impresaSetMaintenanceStatus(ticketId, "IN_PROGRESS"))}
            className="rounded-full bg-slate-800 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50">
            Avvia intervento
          </button>
        )}
        {status === "IN_PROGRESS" && (
          <button type="button" disabled={isPending} onClick={() => run(() => impresaSetMaintenanceStatus(ticketId, "AWAITING_REVIEW"))}
            className="rounded-full bg-amber-500 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50">
            Invia in verifica
          </button>
        )}
        {status === "APPROVED" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
            ✓ Risoluzione approvata
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite, type PendingInvite } from "@/src/app/actions/company";

const SCOPE_LABEL: Record<string, string> = {
  CLEANING: "Pulizie",
  MAINTENANCE: "Manutenzione",
  CHECKIN: "Check-in",
  SUPERVISION: "Supervisione",
};

export default function PendingInviteBanner({ invites: initial }: { invites: PendingInvite[] }) {
  const router = useRouter();
  const [invites, setInvites] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (invites.length === 0) return null;

  function handleAccept(token: string) {
    setError(null);
    startTransition(async () => {
      const r = await acceptInvite(token);
      if (r.success) {
        setInvites((prev) => prev.filter((i) => i.inviteToken !== token));
        router.refresh();
      } else {
        setError(r.error ?? "Errore.");
      }
    });
  }

  return (
    <div className="space-y-3 mb-6">
      {invites.map((inv) => (
        <div key={inv.id} className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">🤝</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 mb-1">
                Nuova collaborazione da <span className="text-amber-700">{inv.organizationName}</span>
              </p>
              <p className="text-xs text-slate-600 mb-3">
                Ti è stata proposta la delega per <strong>{SCOPE_LABEL[inv.scope] ?? inv.scope}</strong>
                {inv.apartments.length > 0
                  ? ` su: ${inv.apartments.join(", ")}`
                  : " su tutti gli appartamenti"}
                .
              </p>
              {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}
              <button
                type="button"
                onClick={() => handleAccept(inv.inviteToken)}
                disabled={isPending}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isPending ? "Accettazione..." : "Accetta delega"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

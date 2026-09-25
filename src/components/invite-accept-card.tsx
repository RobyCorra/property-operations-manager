"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/src/app/actions/company";

export default function InviteAcceptCard({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const r = await acceptInvite(token);
      if (r.success) {
        setAccepted(true);
        setTimeout(() => router.push("/dashboard/impresa"), 1500);
      } else {
        setError(r.error ?? "Errore.");
      }
    });
  }

  if (accepted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <p className="text-lg font-bold text-emerald-700 mb-1">Delega accettata!</p>
        <p className="text-xs text-emerald-600">Reindirizzamento alla dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleAccept}
        disabled={isPending}
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isPending ? "Accettazione..." : "Accetta invito"}
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { updateAutoCheckin } from "@/src/app/actions/checkin-checklist";

interface Props {
  apartmentId: string;
  initialEnabled: boolean;
}

export default function CheckinAutoToggle({ apartmentId, initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      try {
        await updateAutoCheckin(apartmentId, next);
      } catch {
        setEnabled(!next); // rollback
      }
    });
  };

  return (
    <div className={`rounded-2xl border p-5 ${enabled ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="w-full flex items-center justify-between gap-3 text-left disabled:opacity-60"
      >
        <div>
          <p className={`text-sm font-semibold ${enabled ? "text-blue-800" : "text-gray-800"}`}>Auto check-in</p>
          <p className={`text-xs mt-0.5 ${enabled ? "text-blue-600" : "text-gray-400"}`}>
            Self check-in: nessun check-in da fare per questo appartamento (assistente non necessario).
          </p>
        </div>
        <div className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${enabled ? "bg-blue-500" : "bg-gray-300"}`}>
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </button>
      {enabled && (
        <p className="text-[11px] text-blue-600 mt-3">
          I check-in non completati di questo appartamento sono stati annullati. Disattiva per riattivarli sulle prenotazioni future.
        </p>
      )}
    </div>
  );
}

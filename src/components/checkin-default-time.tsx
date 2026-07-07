"use client";

import { useState, useTransition } from "react";
import { updateCheckinDefaultTime } from "@/src/app/actions/checkin-checklist";

interface Props {
  apartmentId: string;
  initialTime: string | null;
}

export default function CheckinDefaultTime({ apartmentId, initialTime }: Props) {
  const [time, setTime] = useState(initialTime ?? "15:00");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const save = (value: string) => {
    setTime(value);
    setSaved(false);
    startTransition(async () => {
      await updateCheckinDefaultTime(apartmentId, value);
      setSaved(true);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Orario di check-in di default</p>
      <div className="flex items-center gap-3">
        <input
          type="time"
          value={time}
          onChange={(e) => save(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
        />
        {isPending ? (
          <span className="text-xs text-gray-400">Salvataggio...</span>
        ) : saved ? (
          <span className="text-xs text-emerald-600 font-semibold">Salvato ✓</span>
        ) : null}
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Usato quando il check-in viene creato dalla prenotazione. Modificabile poi sul singolo check-in.
      </p>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCheckinTime } from "@/src/app/actions/checkin";

interface Props {
  taskId: string;
  initialTime: string; // "HH:MM"
}

export default function CheckinTimeEdit({ taskId, initialTime }: Props) {
  const router = useRouter();
  const [time, setTime] = useState(initialTime);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <input
        type="time"
        value={time}
        onChange={(e) => {
          const value = e.target.value;
          setTime(value);
          setSaved(false);
          startTransition(async () => {
            try {
              await updateCheckinTime(taskId, value);
              setSaved(true);
              router.refresh();
            } catch (err: unknown) {
              alert((err as Error).message || "Errore.");
            }
          });
        }}
        className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
      />
      {isPending ? (
        <span className="text-xs text-gray-400">Salvataggio...</span>
      ) : saved ? (
        <span className="text-xs text-emerald-600 font-semibold">Salvato ✓</span>
      ) : null}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCheckinStatus } from "@/src/app/actions/checkin";

interface Props {
  taskId: string;
  taskDate: string; // ISO (ora di Roma)
}

function isTodayRome(isoDate: string): boolean {
  const taskDate = new Date(isoDate).toLocaleDateString("it-IT", { timeZone: "Europe/Rome" });
  const today = new Date().toLocaleDateString("it-IT", { timeZone: "Europe/Rome" });
  return taskDate === today;
}

function dateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("it-IT", {
    timeZone: "Europe/Rome",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function CheckinStartButton({ taskId, taskDate }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canStart = isTodayRome(taskDate);

  if (!canStart) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
        >
          Bloccato fino al {dateLabel(taskDate)}
        </button>
        <p className="text-[10px] text-slate-400 text-center">
          Il check-in si avvia il giorno programmato.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await updateCheckinStatus(taskId, "IN_PROGRESS");
            router.push(`/dashboard/checkin/task/${taskId}`);
          } catch (err: unknown) {
            alert((err as Error).message || "Errore durante l'avvio.");
          }
        })
      }
      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {isPending ? "..." : "Avvia check-in"}
    </button>
  );
}

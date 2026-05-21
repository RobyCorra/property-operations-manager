"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCleaningStatus } from "@/src/app/actions/operational";
import { useLang } from "@/src/components/lang-context";

interface Props {
  taskId: string;
  taskDate: string; // ISO string (Rome time)
}

function getRomeDateLabel(isoDate: string, lang: string): string {
  const d = new Date(isoDate);
  const locale = lang === "es" ? "es-ES" : lang === "en" ? "en-GB" : "it-IT";
  return d.toLocaleDateString(locale, {
    timeZone: "Europe/Rome",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isTodayRome(isoDate: string): boolean {
  const taskDate = new Date(isoDate).toLocaleDateString("it-IT", {
    timeZone: "Europe/Rome",
  });
  const today = new Date().toLocaleDateString("it-IT", {
    timeZone: "Europe/Rome",
  });
  return taskDate === today;
}

export default function CleanerStartButton({ taskId, taskDate }: Props) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canStart = isTodayRome(taskDate);

  if (!canStart) {
    const dateLabel = getRomeDateLabel(taskDate, lang ?? "it");
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full py-3.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
        >
          {t.lockedUntil(dateLabel)}
        </button>
        <p className="text-[10px] text-slate-400 text-center">{t.lockedHint}</p>
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
            await updateCleaningStatus(taskId, "IN_PROGRESS");
            router.refresh();
          } catch (err: unknown) {
            alert((err as Error).message || "Errore durante l'avvio.");
          }
        })
      }
      className="w-full py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
    >
      {isPending ? "..." : t.startCleaning}
    </button>
  );
}

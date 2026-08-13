"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCheckinStatus } from "@/src/app/actions/checkin";
import { useToast } from "@/src/components/toast-provider";
import { useLang } from "@/src/components/lang-context";

interface Props {
  taskId: string;
  taskDate: string; // ISO (ora di Roma)
  cleaningBlocked?: boolean;
  /** Dove andare dopo l'avvio; null = resta e ricarica (pagina pubblica). */
  startRedirect?: string | null;
}

function isTodayRome(isoDate: string): boolean {
  const taskDate = new Date(isoDate).toLocaleDateString("it-IT", { timeZone: "Europe/Rome" });
  const today = new Date().toLocaleDateString("it-IT", { timeZone: "Europe/Rome" });
  return taskDate === today;
}

function dateLabel(isoDate: string, locale: string): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    timeZone: "Europe/Rome",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function CheckinStartButton({ taskId, taskDate, cleaningBlocked = false, startRedirect }: Props) {
  const toast = useToast();
  const { t, lang } = useLang();
  const dateLocale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
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
          {t.ckBlockedUntil} {dateLabel(taskDate, dateLocale)}
        </button>
        <p className="text-[10px] text-slate-400 text-center">
          {t.ckStartsOnDay}
        </p>
      </div>
    );
  }

  if (cleaningBlocked) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full py-3.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
        >
          {t.ckWaitingCleaning}
        </button>
        <p className="text-[10px] text-slate-400 text-center">
          {t.ckWaitingCleaningHint}
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
            if (startRedirect === null) router.refresh();
            else router.push(startRedirect ?? `/dashboard/checkin/task/${taskId}`);
          } catch (err: unknown) {
            toast.error((err as Error).message || t.ckStartError);
          }
        })
      }
      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {isPending ? "..." : t.ckStart}
    </button>
  );
}

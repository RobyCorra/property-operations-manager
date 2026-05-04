"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { recalculateCleaningChecklist } from "@/src/app/actions/operational";

type RecalculateCleaningChecklistButtonProps = {
  taskId: string;
};

export default function RecalculateCleaningChecklistButton({ taskId }: RecalculateCleaningChecklistButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await recalculateCleaningChecklist(taskId);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Errore durante il ricalcolo della checklist.";
        alert(message);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-700 shadow-sm transition-all hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
      {isPending ? "Ricalcolo..." : "Ricalcola checklist"}
    </button>
  );
}

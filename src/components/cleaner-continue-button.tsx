"use client";

import { useRouter } from "next/navigation";
import { useLang } from "@/src/components/lang-context";

export default function CleanerContinueButton({ taskId }: { taskId: string }) {
  const { t } = useLang();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/cleaner/task/${taskId}`)}
      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      {t.continueIntervention}
    </button>
  );
}

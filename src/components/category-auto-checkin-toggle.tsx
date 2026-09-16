"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/src/components/lang-context";
import { updateCategoryAutoCheckin } from "@/src/app/actions/structure";

interface Props {
  categoryId: string;
  initialEnabled: boolean;
  unitCount: number;
}

export default function CategoryAutoCheckinToggle({ categoryId, initialEnabled, unitCount }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const res = await updateCategoryAutoCheckin(categoryId, next);
      if (res.success) {
        router.refresh();
      } else {
        setEnabled(!next); // rollback
      }
    });
  };

  return (
    <div className={`rounded-2xl border p-5 ${enabled ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"}`}>
      <button type="button" onClick={toggle} disabled={isPending} className="w-full flex items-center justify-between gap-3 text-left disabled:opacity-60">
        <div>
          <p className={`text-sm font-semibold ${enabled ? "text-blue-800" : "text-gray-800"}`}>{t.stAutoCheckin}</p>
          <p className={`text-xs mt-0.5 ${enabled ? "text-blue-600" : "text-gray-400"}`}>{t.stAutoCheckinSub}</p>
        </div>
        <div className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${enabled ? "bg-blue-500" : "bg-gray-300"}`}>
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </button>
      {enabled && (
        <p className="text-[11px] text-blue-600 mt-3">{t.stAutoCheckinOn(unitCount)}</p>
      )}
    </div>
  );
}

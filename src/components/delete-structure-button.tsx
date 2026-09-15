"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/src/components/lang-context";
import { deleteStructure } from "@/src/app/actions/structure";

export default function DeleteStructureButton({ propertyId, name }: { propertyId: string; name: string }) {
  const { t } = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirm = () => {
    setError(null);
    startTransition(() => {
      void deleteStructure(propertyId).then((res) => {
        if (res.success) {
          router.push("/dashboard/manager/apartments");
          router.refresh();
        } else {
          setError(res.error || "Errore durante l'eliminazione.");
        }
      });
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600"
      >
        {t.stDeleteStructure}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => !isPending && setOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 text-base font-semibold text-gray-900">{t.stDeleteStructureTitle(name)}</p>
            <p className="mb-5 text-sm leading-relaxed text-gray-500">
              {t.stDeleteStructureBody}
            </p>
            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={confirm} disabled={isPending} className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                {isPending ? t.stDeleting : t.stDelete}
              </button>
              <button type="button" onClick={() => setOpen(false)} disabled={isPending} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600">
                {t.stCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/src/components/toast-provider";
import { useLang } from "@/src/components/lang-context";

interface Props {
  id: string;
  action: (id: string) => Promise<void>;
  label?: string;
  className?: string;
}

export default function SubmitForReviewButton({ id, action, label, className }: Props) {
  const { t } = useLang();
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await action(id);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Errore durante l'invio per revisione.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      className={`relative z-10 flex items-center justify-center gap-2 rounded-full transition-all disabled:opacity-50 ${className}`}
    >
      {isPending ? <Loader2 size={13} className="animate-spin" /> : "⏫"}
      {isPending ? t.uiSending : (label ?? t.uiSubmitForReview)}
    </button>
  );
}

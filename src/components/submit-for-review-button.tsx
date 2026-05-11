"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  id: string;
  action: (id: string) => Promise<void>;
  label?: string;
  className?: string;
}

export default function SubmitForReviewButton({ id, action, label = "Invia per revisione", className }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await action(id);
        router.refresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Errore durante l'invio per revisione.");
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
      {isPending ? "Invio..." : label}
    </button>
  );
}

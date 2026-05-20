"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCleaningStatus } from "@/src/app/actions/operational";
import { Loader2 } from "lucide-react";

interface PublicStatusButtonProps {
  id: string;
  nextStatus: string;
  label: string;
  className?: string;
}

export default function PublicStatusButton({ id, nextStatus, label, className }: PublicStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleClick() {
    startTransition(async () => {
      await updateCleaningStatus(id, nextStatus);
      setDone(true);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || done}
      className={`${className ?? ""} flex items-center justify-center gap-2 disabled:opacity-60`}
    >
      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
      {done ? "✓ Aggiornato" : label}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface StatusButtonProps {
  id: string;
  nextStatus: string;
  label: string;
  className?: string;
  disabled?: boolean;
  action: (id: string, nextStatus: string) => Promise<void>;
}

export default function StatusUpdateButton({ id, nextStatus, label, className, disabled, action }: StatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    startTransition(async () => {
      try {
        await action(id, nextStatus);
        router.refresh();
      } catch (err: any) {
        alert(err.message || "Errore durante l'aggiornamento.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleUpdate}
      disabled={isPending}
      className={`relative z-10 px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50 ${className}`}
    >
      {isPending ? "Aggiornamento..." : label}
    </button>
  );
}

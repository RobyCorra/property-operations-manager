"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUser } from "@/src/app/actions/user";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (confirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 whitespace-nowrap">Sicuro?</span>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 px-2"
        >
          No
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const fd = new FormData();
              fd.set("id", id);
              await deleteUser(fd);
              router.refresh();
            });
          }}
          className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 px-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : "Sì"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
      title="Elimina utente"
    >
      <Trash2 size={16} />
    </button>
  );
}

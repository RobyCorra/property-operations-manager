"use client";

import { useActionState, useState } from "react";
import { resetUserPassword } from "@/src/app/actions/superadmin";

export default function ResetPasswordForm({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(resetUserPassword, null);

  if (state?.success && open) setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold transition-all shrink-0"
      >
        Reset pw
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Reset password — {userName}</h3>
            <form action={formAction} className="space-y-3">
              <input type="hidden" name="userId" value={userId} />
              {state?.error && <p className="text-xs text-red-400 font-medium">{state.error}</p>}
              <input
                required
                name="newPassword"
                type="password"
                placeholder="Nuova password (min 8 caratteri)"
                minLength={8}
                className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold disabled:opacity-50 transition-all"
                >
                  {isPending ? "Salvataggio..." : "Salva"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-all"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

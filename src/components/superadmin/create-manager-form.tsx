"use client";

import { useActionState } from "react";
import { createFirstManager } from "@/src/app/actions/superadmin";

export default function CreateManagerForm({ orgId }: { orgId: string }) {
  const [state, formAction, isPending] = useActionState(createFirstManager, null);
  if (state?.success) return <p className="text-sm text-emerald-400 font-medium">✅ Manager creato con successo!</p>;
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orgId" value={orgId} />
      {state?.error && <p className="text-xs text-red-400 font-medium">{state.error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input required name="name" type="text" placeholder="Nome completo"
          className="rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500" />
        <input required name="email" type="email" placeholder="Email"
          className="rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500" />
        <input required name="password" type="password" placeholder="Password (min 8 char)" minLength={8}
          className="rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500 sm:col-span-2" />
      </div>
      <button type="submit" disabled={isPending}
        className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-50">
        {isPending ? "Creazione..." : "Crea Manager"}
      </button>
    </form>
  );
}

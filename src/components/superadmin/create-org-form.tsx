"use client";

import { useActionState, useState } from "react";
import { createOrganization } from "@/src/app/actions/superadmin";
import Link from "next/link";

export default function CreateOrgForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createOrganization, null);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all"
      >
        + Nuova Organizzazione
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5">

            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white">Crea nuova organizzazione</h2>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
            </div>

            {state?.success ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-1">
                  <p className="text-sm font-bold text-emerald-400">✅ Organizzazione creata!</p>
                  <p className="text-xs text-slate-400">Nome: <span className="text-white font-semibold">{state.orgName}</span></p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/superadmin/${state.orgId}`}
                    className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold text-center transition-all"
                    onClick={() => setOpen(false)}
                  >
                    Vai al dettaglio →
                  </Link>
                  <button
                    onClick={() => { setOpen(false); }}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-all"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                {state?.error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-xs text-red-400 font-medium">{state.error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Organizzazione</p>
                  <input
                    required name="orgName" type="text" placeholder="Es. Villa Roma Rentals"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Manager (primo accesso)</p>
                  <input
                    required name="managerName" type="text" placeholder="Nome completo"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    required name="email" type="email" placeholder="Email"
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    required name="password" type="password" placeholder="Password (min 8 caratteri)" minLength={8}
                    className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit" disabled={isPending}
                    className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {isPending ? "Creazione..." : "Crea organizzazione"}
                  </button>
                  <button
                    type="button" onClick={() => setOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold transition-all"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useActionState } from "react";
import { loginSuperAdmin } from "@/src/app/actions/superadmin";

export default function SuperAdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginSuperAdmin, null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Super Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Accesso riservato</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {state.error}
            </div>
          )}
          <input
            required
            name="secret"
            type="password"
            placeholder="Chiave di accesso"
            autoFocus
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 text-white py-3 text-sm font-bold tracking-wide transition-all disabled:opacity-50"
          >
            {isPending ? "Accesso..." : "Accedi"}
          </button>
        </form>
      </div>
    </main>
  );
}

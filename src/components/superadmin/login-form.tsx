"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { superAdminLogin } from "@/src/app/actions/superadmin";

export default function SuperAdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await superAdminLogin(secret);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          <input
            required
            type="password"
            placeholder="Chiave di accesso"
            autoFocus
            value={secret}
            onChange={e => setSecret(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 text-sm font-bold tracking-wide transition-all"
          >
            {isPending ? "Accesso…" : "Accedi"}
          </button>
        </form>
      </div>
    </main>
  );
}

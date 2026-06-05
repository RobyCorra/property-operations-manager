"use client";

import { useActionState } from "react";
import { registerAction } from "@/src/app/actions/register";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2 text-gray-900 tracking-tight">
            Crea il tuo account
          </h1>
          <p className="text-sm text-gray-500">
            Inizia a gestire le tue proprietà in pochi secondi.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Nome organizzazione
            </label>
            <input
              required
              name="orgName"
              type="text"
              placeholder="Es. Villa Roma Rentals"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Il tuo nome
            </label>
            <input
              required
              name="managerName"
              type="text"
              placeholder="Mario Rossi"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              required
              name="email"
              type="email"
              placeholder="mario@example.com"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              required
              name="password"
              type="password"
              placeholder="Minimo 8 caratteri"
              minLength={8}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Conferma password
            </label>
            <input
              required
              name="confirmPassword"
              type="password"
              placeholder="Ripeti la password"
              minLength={8}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-black text-white py-2.5 font-medium shadow-sm hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-400 mt-2"
          >
            {isPending ? "Creazione account..." : "Crea account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Hai già un account?{" "}
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              Accedi
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-50">
          <p className="text-xs text-center text-gray-400">
            © 2026 Property Operations Manager
          </p>
        </div>
      </div>
    </main>
  );
}

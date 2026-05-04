"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createUser } from "@/src/app/actions/user";

export default function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
      <form action={formAction} className="space-y-6">
        
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Nuovo Collaboratore</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input 
                required 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Es. Marco Neri" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                required 
                type="email" 
                id="email" 
                name="email" 
                placeholder="marco@email.it" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Ruolo Operativo *</label>
              <select 
                required 
                id="role" 
                name="role" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
              >
                <option value="CLEANER">Addetto alle Pulizie (CLEANER)</option>
                <option value="MAINTENANCE">Manutentore (MAINTENANCE)</option>
                <option value="MANAGER">Manager (MANAGER)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1">
                Il ruolo determina l'accesso alle sezioni della Dashboard
              </p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password Iniziale *</label>
              <input 
                required 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Minimo 8 caratteri" 
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 mt-8">
          <Link href="/dashboard/manager/users" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Annulla
          </Link>
          <button 
            type="submit" 
            disabled={isPending}
            className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-400"
          >
            {isPending ? "Creazione in corso..." : "Crea Utente"}
          </button>
        </div>
        
      </form>
    </section>
  );
}

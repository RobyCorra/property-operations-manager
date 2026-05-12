"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updateUser } from "@/src/app/actions/user";
import { Building2 } from "lucide-react";

type Apartment = { id: string; name: string };

type Props = {
  user: { id: string; name: string; email: string; role: string };
  apartments: Apartment[];
  assignedApartmentIds: string[];
};

export default function UserEditForm({ user, apartments, assignedApartmentIds }: Props) {
  const [state, formAction, isPending] = useActionState(updateUser, null);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedApts, setSelectedApts] = useState<Set<string>>(new Set(assignedApartmentIds));

  const needsApartments = selectedRole === "SUPERVISOR" || selectedRole === "OWNER";

  function toggleApt(id: string) {
    setSelectedApts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={user.id} />

        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Dati Collaboratore</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input
                required
                type="text"
                id="name"
                name="name"
                defaultValue={user.name}
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
                defaultValue={user.email}
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
                value={selectedRole}
                onChange={e => { setSelectedRole(e.target.value); setSelectedApts(new Set()); }}
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
              >
                <option value="CLEANER">Addetto alle Pulizie (CLEANER)</option>
                <option value="MAINTENANCE">Manutentore (MAINTENANCE)</option>
                <option value="SUPERVISOR">Supervisore (SUPERVISOR)</option>
                <option value="OWNER">Proprietario (OWNER)</option>
                <option value="MANAGER">Manager (MANAGER)</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nuova Password
                <span className="ml-1 text-[10px] text-gray-400 font-normal">(lascia vuoto per non cambiare)</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Minimo 8 caratteri"
                className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {needsApartments && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Building2 size={16} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                Appartamenti assegnati
                {selectedRole === "SUPERVISOR" ? " (supervisione)" : " (proprietà)"}
              </h2>
            </div>
            {apartments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nessun appartamento disponibile.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {apartments.map(apt => {
                  const checked = selectedApts.has(apt.id);
                  return (
                    <label
                      key={apt.id}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${checked ? "border-slate-900 bg-slate-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="checkbox"
                        name="apartmentIds"
                        value={apt.id}
                        checked={checked}
                        onChange={() => toggleApt(apt.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-slate-900"
                      />
                      <span className="text-sm font-medium text-gray-800">{apt.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3">
          <Link href="/dashboard/manager/users" className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Annulla
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none disabled:bg-gray-400"
          >
            {isPending ? "Salvataggio..." : "Salva Modifiche"}
          </button>
        </div>
      </form>
    </section>
  );
}

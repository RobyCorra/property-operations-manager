"use client";

import { useActionState, useState } from "react";
import { useLang } from "@/src/components/lang-context";
import Link from "next/link";
import { updateUser } from "@/src/app/actions/user";
import { Building2 } from "lucide-react";

type Apartment = { id: string; name: string };

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    address?: string | null;
    isExternal?: boolean;
    companyName?: string | null;
    vatNumber?: string | null;
    iban?: string | null;
  };
  apartments: Apartment[];
  assignedApartmentIds: string[];
};

export default function UserEditForm({ user, apartments, assignedApartmentIds }: Props) {
  const { t } = useLang();
  const [state, formAction, isPending] = useActionState(updateUser, null);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedApts, setSelectedApts] = useState<Set<string>>(new Set(assignedApartmentIds));
  const [isExternal, setIsExternal] = useState(user.isExternal ?? false);

  const needsApartments = selectedRole === "SUPERVISOR" || selectedRole === "OWNER";

  function toggleApt(id: string) {
    setSelectedApts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const inputClass = "w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent";

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
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{t.usrCollabData}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t.usrFullName} *</label>
              <input required type="text" id="name" name="name" defaultValue={user.name} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t.usrEmail} *</label>
              <input required type="email" id="email" name="email" defaultValue={user.email} className={inputClass} />
            </div>
          </div>

          {/* Contatti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t.usrPhone}</label>
              <input type="tel" id="phone" name="phone" defaultValue={user.phone ?? ""} placeholder="+39 333 1234567" className={inputClass} />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">{t.usrAddress}</label>
              <input type="text" id="address" name="address" defaultValue={user.address ?? ""} placeholder="Via Roma 1, Milano" className={inputClass} />
            </div>
          </div>

          {/* Interno / Esterno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.usrCollabType}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsExternal(false)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all ${!isExternal ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              >
                {t.usrInternal}
              </button>
              <button
                type="button"
                onClick={() => setIsExternal(true)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all ${isExternal ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              >
                {t.usrExternal}
              </button>
            </div>
            <input type="hidden" name="isExternal" value={String(isExternal)} />
          </div>

          {/* Dati azienda (solo esterno) */}
          {isExternal && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.usrCompanyData}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.usrCompanyName}</label>
                  <input type="text" name="companyName" defaultValue={user.companyName ?? ""} placeholder={t.usrCompanyPlaceholder} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.usrVat}</label>
                  <input type="text" name="vatNumber" defaultValue={user.vatNumber ?? ""} placeholder="IT12345678901" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.usrIban}</label>
                  <input type="text" name="iban" defaultValue={user.iban ?? ""} placeholder="IT60 X054 2811 1010 0000 0123 456" className={`${inputClass} font-mono text-sm`} />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">{t.usrOperationalRole} *</label>
              <select
                required id="role" name="role" value={selectedRole}
                onChange={e => { setSelectedRole(e.target.value); setSelectedApts(new Set()); }}
                className={`${inputClass} text-gray-700`}
              >
                <option value="CLEANER">{t.usrRoleCleaner}</option>
                <option value="MAINTENANCE">{t.usrRoleMaintenance}</option>
                <option value="SUPERVISOR">{t.usrRoleSupervisor}</option>
                <option value="OWNER">{t.usrRoleOwner}</option>
                <option value="MANAGER">{t.usrRoleManager}</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t.usrNewPassword}
                <span className="ml-1 text-[10px] text-gray-400 font-normal">{t.usrPasswordHint}</span>
              </label>
              <input type="password" id="password" name="password" placeholder={t.usrPasswordPlaceholder} className={inputClass} />
            </div>
          </div>
        </div>

        {needsApartments && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Building2 size={16} className="text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">
                {t.usrAssignedApartments}
                {selectedRole === "SUPERVISOR" ? t.usrSupervision : t.usrProperty}
              </h2>
            </div>
            {apartments.length === 0 ? (
              <p className="text-sm text-gray-400 italic">{t.usrNoApartments}</p>
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
                        type="checkbox" name="apartmentIds" value={apt.id}
                        checked={checked} onChange={() => toggleApt(apt.id)}
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
            {t.mgrCancel}
          </Link>
          <button
            type="submit" disabled={isPending}
            className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none disabled:bg-gray-400"
          >
            {isPending ? t.usrSaving : t.usrSaveChanges}
          </button>
        </div>
      </form>
    </section>
  );
}

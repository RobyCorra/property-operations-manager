"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createMyStaff, type CompanyStaff } from "@/src/app/actions/company";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Addetto alle Pulizie (CLEANER)",
  MAINTENANCE: "Manutentore (MAINTENANCE)",
  CHECKIN: "Addetto Check-in (CHECKIN)",
  SUPERVISOR: "Supervisor (SUPERVISOR)",
  MANAGER: "Manager (MANAGER)",
};

const ROLE_SHORT: Record<string, string> = {
  CLEANER: "Addetto pulizie",
  MAINTENANCE: "Manutentore",
  CHECKIN: "Addetto check-in",
  SUPERVISOR: "Supervisor",
  MANAGER: "Manager",
};

export default function ImpresaStaffManager({ staff, roles }: { staff: CompanyStaff[]; roles: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(roles[0] ?? "CLEANER");
  const [isExternal, setIsExternal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [iban, setIban] = useState("");

  const inputCls =
    "w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm";

  const reset = () => {
    setName(""); setEmail(""); setPassword(""); setPhone(""); setAddress("");
    setRole(roles[0] ?? "CLEANER"); setIsExternal(false);
    setCompanyName(""); setVatNumber(""); setIban("");
  };

  const onCreate = () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Nome, email e password obbligatori.");
      return;
    }
    if (password.length < 6) {
      setError("Password troppo corta (minimo 6 caratteri).");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await createMyStaff(name, email, password, role, phone, address, {
        isExternal,
        companyName,
        vatNumber,
        iban,
      });
      if (!r.success) setError(r.error);
      else {
        reset();
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Operatori</h2>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600">
          {open ? "Chiudi" : "+ Nuovo operatore"}
        </button>
      </div>

      {open && (
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Nuovo Collaboratore</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Nome / Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Es. Marco Neri"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                className={inputCls}
                placeholder="marco@email.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Telefono / Indirizzo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input
                type="tel"
                className={inputCls}
                placeholder="+39 333 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Via Roma 1, Milano"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Tipo collaboratore */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo collaboratore</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsExternal(false)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all ${!isExternal ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              >
                Interno
              </button>
              <button
                type="button"
                onClick={() => setIsExternal(true)}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium border transition-all ${isExternal ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              >
                Esterno / Fornitore
              </button>
            </div>
          </div>

          {/* Dati azienda (solo esterno) */}
          {isExternal && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dati Azienda / Fornitore</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome ditta</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Es. Pulizie Rossi Srl"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="IT12345678901"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                  <input
                    type="text"
                    className={`${inputCls} font-mono`}
                    placeholder="IT60 X054 2811 1010 0000 0123 456"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ruolo / Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ruolo Operativo *</label>
              {roles.length > 1 ? (
                <select
                  className={inputCls}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roles.map((r) => (<option key={r} value={r}>{ROLE_LABEL[r] ?? r}</option>))}
                </select>
              ) : (
                <div className="flex items-center px-4 py-2.5 text-sm text-gray-700 rounded-lg border border-gray-300 bg-gray-50">
                  {ROLE_LABEL[role] ?? role}
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                Il ruolo determina l&apos;accesso alle sezioni della Dashboard
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Iniziale *</label>
              <input
                type="password"
                className={inputCls}
                placeholder="Minimo 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { reset(); setOpen(false); }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={onCreate}
              disabled={isPending}
              className="rounded-full bg-black px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-400"
            >
              {isPending ? "Creazione..." : "Crea Utente"}
            </button>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <p className="text-xs text-gray-400">Nessun operatore. Creane uno per poter assegnare i lavori.</p>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/impresa/staff/${s.id}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2 hover:border-violet-200 hover:bg-white transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm">👤</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{s.name}</p>
                <p className="text-[11px] text-gray-400">{s.email}</p>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600">{ROLE_SHORT[s.role] ?? s.role}</span>
              <span className="text-violet-300 text-lg">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

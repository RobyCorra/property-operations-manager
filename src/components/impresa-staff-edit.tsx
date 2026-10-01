"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMyStaff, deleteMyStaff } from "@/src/app/actions/company";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Addetto pulizie",
  MAINTENANCE: "Manutentore",
  CHECKIN: "Addetto check-in",
  SUPERVISOR: "Supervisor",
  MANAGER: "Manager",
};

type Member = { id: string; name: string; email: string; role: string; phone: string | null; address: string | null; isExternal: boolean | null; companyName: string | null; vatNumber: string | null; iban: string | null };

export default function ImpresaStaffEdit({ member, roles }: { member: Member; roles: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [name, setName] = useState(member.name);
  const [phone, setPhone] = useState(member.phone ?? "");
  const [address, setAddress] = useState(member.address ?? "");
  const [role, setRole] = useState(member.role);
  const [password, setPassword] = useState("");
  const [isExternal, setIsExternal] = useState(member.isExternal ?? false);
  const [companyName, setCompanyName] = useState(member.companyName ?? "");
  const [vatNumber, setVatNumber] = useState(member.vatNumber ?? "");
  const [iban, setIban] = useState(member.iban ?? "");

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  const onSave = () => {
    setError(null); setOk(false);
    if (!name.trim()) { setError("Nome obbligatorio."); return; }
    startTransition(async () => {
      const r = await updateMyStaff(member.id, { name, phone, address, role, password: password || undefined, isExternal, companyName, vatNumber, iban });
      if (!r.success) setError(r.error);
      else { setOk(true); setPassword(""); router.refresh(); }
    });
  };

  const roleOptions = [...new Set([role, ...roles])];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Nome</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className={labelCls}>Email</label><input className={`${inputCls} bg-gray-50 text-gray-500`} value={member.email} readOnly /></div>
        <div><label className={labelCls}>Telefono</label><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><label className={labelCls}>Indirizzo</label><input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <div>
          <label className={labelCls}>Ruolo</label>
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
            {roleOptions.map((r) => (<option key={r} value={r}>{ROLE_LABEL[r] ?? r}</option>))}
          </select>
        </div>
        <div><label className={labelCls}>Nuova password (opzionale)</label><input className={inputCls} placeholder="lascia vuoto per non cambiare" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      </div>

      {/* Tipo collaboratore */}
      <div>
        <label className={labelCls}>Tipo collaboratore</label>
        <div className="flex gap-3 mt-1">
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

      {isExternal && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dati Azienda / Fornitore</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelCls}>Nome ditta</label><input className={inputCls} placeholder="Es. Pulizie Rossi Srl" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
            <div><label className={labelCls}>Partita IVA</label><input className={inputCls} placeholder="IT12345678901" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>IBAN</label><input className={`${inputCls} font-mono`} placeholder="IT60 X054 2811 1010 0000 0123 456" value={iban} onChange={(e) => setIban(e.target.value)} /></div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {ok && <p className="text-sm font-semibold text-emerald-600">✓ Modifiche salvate.</p>}

      <div className="flex items-center gap-3">
        <button type="button" onClick={onSave} disabled={isPending} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40">
          Salva
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm(`Eliminare ${member.name}? L'operazione non è reversibile.`)) return;
            setError(null); setOk(false);
            startTransition(async () => {
              const r = await deleteMyStaff(member.id);
              if (!r.success) setError(r.error);
              else router.push("/dashboard/impresa/staff");
            });
          }}
          className="rounded-full border border-red-200 px-6 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          Elimina
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMyStaff } from "@/src/app/actions/company";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Addetto pulizie",
  MAINTENANCE: "Manutentore",
  CHECKIN: "Addetto check-in",
  SUPERVISOR: "Supervisor",
  MANAGER: "Manager",
};

type Member = { id: string; name: string; email: string; role: string; phone: string | null; address: string | null };

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

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  const onSave = () => {
    setError(null); setOk(false);
    if (!name.trim()) { setError("Nome obbligatorio."); return; }
    startTransition(async () => {
      const r = await updateMyStaff(member.id, { name, phone, address, role, password: password || undefined });
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

      {error && <p className="text-sm text-red-500">{error}</p>}
      {ok && <p className="text-sm font-semibold text-emerald-600">✓ Modifiche salvate.</p>}

      <button type="button" onClick={onSave} disabled={isPending} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40">
        Salva
      </button>
    </div>
  );
}

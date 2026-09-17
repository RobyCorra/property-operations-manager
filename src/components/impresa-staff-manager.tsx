"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMyStaff, type CompanyStaff } from "@/src/app/actions/company";

const ROLE_LABEL: Record<string, string> = {
  CLEANER: "Addetto pulizie",
  MAINTENANCE: "Manutentore",
  CHECKIN: "Addetto check-in",
  SUPERVISOR: "Supervisor",
};

export default function ImpresaStaffManager({ staff, roles }: { staff: CompanyStaff[]; roles: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roles[0] ?? "CLEANER");

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

  const onCreate = () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Nome, email e password obbligatori.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await createMyStaff(name, email, password, role);
      if (!r.success) setError(r.error);
      else {
        setName(""); setEmail(""); setPassword(""); setOpen(false);
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
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-violet-100 bg-violet-50/40 p-3 sm:grid-cols-2">
          <input className={inputCls} placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputCls} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputCls} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {roles.length > 1 ? (
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (<option key={r} value={r}>{ROLE_LABEL[r] ?? r}</option>))}
            </select>
          ) : (
            <div className="flex items-center px-1 text-xs text-gray-500">{ROLE_LABEL[role] ?? role}</div>
          )}
          <div className="sm:col-span-2">
            <button type="button" onClick={onCreate} disabled={isPending} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">
              Crea operatore
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {staff.length === 0 ? (
        <p className="text-xs text-gray-400">Nessun operatore. Creane uno per poter assegnare i lavori.</p>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm">👤</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{s.name}</p>
                <p className="text-[11px] text-gray-400">{s.email}</p>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-600">{ROLE_LABEL[s.role] ?? s.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

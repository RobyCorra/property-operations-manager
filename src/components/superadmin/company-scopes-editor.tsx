"use client";

import { useState, useTransition } from "react";
import { updateCompanyScopes } from "@/src/app/actions/superadmin";

const SERVICES = [
  { value: "CLEANING", label: "Pulizie" },
  { value: "MAINTENANCE", label: "Manutenzione" },
  { value: "CHECKIN", label: "Check-in" },
  { value: "SUPERVISION", label: "Supervisione" },
];

export default function CompanyScopesEditor({ companyId, initial }: { companyId: string; initial: string[] }) {
  const [scopes, setScopes] = useState<string[]>(initial);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function toggle(v: string) {
    setMsg(null);
    setScopes((prev) => (prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]));
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const r = await updateCompanyScopes(companyId, scopes);
      setMsg(r.success ? { ok: true, text: "Servizi aggiornati." } : { ok: false, text: r.error ?? "Errore." });
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {SERVICES.map((s) => {
          const checked = scopes.includes(s.value);
          return (
            <label key={s.value} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer transition-colors ${checked ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"}`}>
              <input type="checkbox" checked={checked} onChange={() => toggle(s.value)} className="accent-emerald-500" />
              {s.label}
            </label>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={isPending} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50">
          {isPending ? "Salvataggio..." : "Salva servizi"}
        </button>
        {msg && <span className={`text-xs font-medium ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}

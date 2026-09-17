"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCompany, createCompanyManager, delegateFunction, revokeFunction } from "@/src/app/actions/company";
import type { ImpreseOverview } from "@/src/lib/company-scope";

const SCOPES: { key: string; label: string; emoji: string }[] = [
  { key: "CLEANING", label: "Pulizie", emoji: "🧹" },
  { key: "MAINTENANCE", label: "Manutenzione", emoji: "🔧" },
  { key: "CHECKIN", label: "Check-in", emoji: "🚪" },
  { key: "SUPERVISION", label: "Supervisione", emoji: "🛡️" },
];

export default function ImpreseManager({ initial }: { initial: ImpreseOverview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [newVat, setNewVat] = useState("");
  const [creating, setCreating] = useState(false);
  const [mgr, setMgr] = useState<Record<string, { name: string; email: string; password: string; open: boolean }>>({});

  const companies = initial.companies;
  const handlers = initial.handlers;

  const refresh = () => {
    router.refresh();
  };

  const onDelegate = (scope: string) => {
    const companyId = picked[scope] || companies[0]?.id;
    if (!companyId) {
      setError("Crea prima un'impresa.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await delegateFunction(companyId, scope);
      if (!r.success) setError(r.error);
      else refresh();
    });
  };

  const onRevoke = (scope: string) => {
    setError(null);
    startTransition(async () => {
      const r = await revokeFunction(scope);
      if (!r.success) setError(r.error);
      else refresh();
    });
  };

  const setMgrField = (id: string, patch: Partial<{ name: string; email: string; password: string; open: boolean }>) =>
    setMgr((m) => {
      const base = m[id] ?? { name: "", email: "", password: "", open: true };
      return { ...m, [id]: { ...base, ...patch } };
    });

  const onCreateManager = (companyId: string) => {
    const f = mgr[companyId];
    if (!f || !f.name.trim() || !f.email.trim() || !f.password) {
      setError("Nome, email e password obbligatori.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await createCompanyManager(companyId, f.name, f.email, f.password);
      if (!r.success) setError(r.error);
      else {
        setMgr((m) => ({ ...m, [companyId]: { name: "", email: "", password: "", open: false } }));
        refresh();
      }
    });
  };

  const onCreate = () => {
    if (!newName.trim()) {
      setError("Nome impresa obbligatorio.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await createCompany(newName, newVat);
      if (!r.success) setError(r.error);
      else {
        setNewName("");
        setNewVat("");
        setCreating(false);
        refresh();
      }
    });
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

  return (
    <div className="space-y-5">
      {/* Deleghe per funzione */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Deleghe funzioni</h2>
          <span className="text-[11px] text-gray-400">una impresa per funzione</span>
        </div>

        {SCOPES.map((s) => {
          const h = handlers[s.key];
          return (
            <div key={s.key} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-800 min-w-[130px]">
                <span>{s.emoji}</span> {s.label}
              </span>

              {h ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {h.companyName}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRevoke(s.key)}
                    disabled={isPending}
                    className="ml-auto rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 disabled:opacity-40"
                  >
                    Revoca
                  </button>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                    Interno
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      value={picked[s.key] || ""}
                      onChange={(e) => setPicked((p) => ({ ...p, [s.key]: e.target.value }))}
                      className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none"
                      disabled={companies.length === 0}
                    >
                      <option value="">{companies.length ? "Scegli impresa…" : "Nessuna impresa"}</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onDelegate(s.key)}
                      disabled={isPending || companies.length === 0}
                      className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      Delega
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Imprese */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Imprese</h2>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600"
          >
            {creating ? "Chiudi" : "+ Nuova impresa"}
          </button>
        </div>

        {creating && (
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3 space-y-2">
            <input className={inputCls} placeholder="Nome impresa (es. Impresa Alfa)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className={inputCls} placeholder="Partita IVA (opzionale)" value={newVat} onChange={(e) => setNewVat(e.target.value)} />
            <button
              type="button"
              onClick={onCreate}
              disabled={isPending}
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Crea impresa
            </button>
          </div>
        )}

        {companies.length === 0 ? (
          <p className="text-xs text-gray-400">Nessuna impresa. Creane una per poterla delegare.</p>
        ) : (
          <div className="space-y-2">
            {companies.map((c) => {
              const f = mgr[c.id];
              return (
                <div key={c.id} className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm">🏢</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.name}</p>
                      <p className="text-[11px] text-gray-400">{c.vatNumber ? `P.IVA ${c.vatNumber} · ` : ""}{c.scopes.length ? c.scopes.join(", ") : "nessuna delega"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMgrField(c.id, { open: !(f?.open) })}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-violet-600"
                    >
                      {f?.open ? "Chiudi" : "+ Accesso"}
                    </button>
                  </div>

                  {/* Manager d'impresa esistenti */}
                  {c.managers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.managers.map((m) => (
                        <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-gray-600 border border-gray-100">
                          👤 {m.name} <span className="text-gray-400">· {m.email}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Form nuovo accesso manager */}
                  {f?.open && (
                    <div className="mt-2 grid grid-cols-1 gap-2 rounded-lg border border-violet-100 bg-white p-2.5 sm:grid-cols-3">
                      <input className={inputCls} placeholder="Nome" value={f.name} onChange={(e) => setMgrField(c.id, { name: e.target.value })} />
                      <input className={inputCls} placeholder="Email" value={f.email} onChange={(e) => setMgrField(c.id, { email: e.target.value })} />
                      <div className="flex gap-2">
                        <input className={inputCls} placeholder="Password" value={f.password} onChange={(e) => setMgrField(c.id, { password: e.target.value })} />
                        <button type="button" onClick={() => onCreateManager(c.id)} disabled={isPending} className="shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
                          Crea
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

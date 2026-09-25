"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCompany, createCompanyManager, delegateFunction, revokeFunction, updateEngagementApartments, removeCompanyFromOrg } from "@/src/app/actions/company";
import type { ImpreseOverview, EngagementHandler } from "@/src/lib/company-scope";

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
  const [newName, setNewName] = useState("");
  const [newVat, setNewVat] = useState("");
  const [creating, setCreating] = useState(false);
  const [mgr, setMgr] = useState<Record<string, { name: string; email: string; password: string; open: boolean }>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // State for new delegation (adding a new engagement to a scope)
  const [addingScope, setAddingScope] = useState<string | null>(null);
  const [addCompanyId, setAddCompanyId] = useState("");
  const [addAptIds, setAddAptIds] = useState<Set<string>>(new Set());
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // State for editing an existing engagement's apartments
  const [editingEngId, setEditingEngId] = useState<string | null>(null);
  const [editAptIds, setEditAptIds] = useState<Set<string>>(new Set());

  const companies = initial.companies;
  const handlers = initial.handlers;
  const apartments = initial.apartments;

  const refresh = () => router.refresh();

  // Get all apartment IDs already taken by other engagements for the same scope
  function takenApts(scope: string, excludeEngId?: string): Map<string, string> {
    const map = new Map<string, string>(); // aptId -> companyName
    const scopeHandlers = handlers[scope] ?? [];
    for (const h of scopeHandlers) {
      if (h.engagementId === excludeEngId) continue;
      if (h.apartmentIds.length === 0) {
        // This engagement covers ALL apartments
        apartments.forEach((a) => map.set(a.id, h.companyName));
      } else {
        h.apartmentIds.forEach((aid) => map.set(aid, h.companyName));
      }
    }
    return map;
  }

  // ── New delegation ──
  function startAdd(scope: string) {
    setAddingScope(scope);
    setAddCompanyId(companies[0]?.id ?? "");
    setAddAptIds(new Set());
    setEditingEngId(null);
    setInviteLink(null);
    setCopied(false);
    setError(null);
  }

  function confirmAdd() {
    if (!addingScope || !addCompanyId) return;
    setError(null);
    const aptArray = [...addAptIds];
    startTransition(async () => {
      const r = await delegateFunction(addCompanyId, addingScope!, aptArray.length > 0 ? aptArray : undefined);
      if (!r.success) setError(r.error);
      else {
        const link = `${window.location.origin}/invito/${r.inviteToken}`;
        setInviteLink(link);
        refresh();
      }
    });
  }

  function copyInviteLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Edit existing engagement apartments ──
  function startEdit(h: EngagementHandler) {
    setEditingEngId(h.engagementId);
    setEditAptIds(new Set(h.apartmentIds));
    setAddingScope(null);
    setError(null);
  }

  function confirmEdit() {
    if (!editingEngId) return;
    setError(null);
    startTransition(async () => {
      const r = await updateEngagementApartments(editingEngId!, [...editAptIds]);
      if (!r.success) setError(r.error);
      else { setEditingEngId(null); refresh(); }
    });
  }

  // ── Revoke ──
  function onRevoke(engagementId: string) {
    setError(null);
    startTransition(async () => {
      const r = await revokeFunction(engagementId, true);
      if (!r.success) setError(r.error);
      else refresh();
    });
  }

  // ── Remove company from org ──
  function onRemoveCompany(companyId: string) {
    setError(null);
    startTransition(async () => {
      const r = await removeCompanyFromOrg(companyId);
      if (!r.success) setError(r.error);
      else { setConfirmDeleteId(null); refresh(); }
    });
  }

  // ── Company creation ──
  const onCreate = () => {
    if (!newName.trim()) { setError("Nome impresa obbligatorio."); return; }
    setError(null);
    startTransition(async () => {
      const r = await createCompany(newName, newVat);
      if (!r.success) setError(r.error);
      else { setNewName(""); setNewVat(""); setCreating(false); refresh(); }
    });
  };

  // ── Manager creation ──
  const setMgrField = (id: string, patch: Partial<{ name: string; email: string; password: string; open: boolean }>) =>
    setMgr((m) => {
      const base = m[id] ?? { name: "", email: "", password: "", open: true };
      return { ...m, [id]: { ...base, ...patch } };
    });

  const onCreateManager = (companyId: string) => {
    const f = mgr[companyId];
    if (!f || !f.name.trim() || !f.email.trim() || !f.password) { setError("Nome, email e password obbligatori."); return; }
    setError(null);
    startTransition(async () => {
      const r = await createCompanyManager(companyId, f.name, f.email, f.password);
      if (!r.success) setError(r.error);
      else { setMgr((m) => ({ ...m, [companyId]: { name: "", email: "", password: "", open: false } })); refresh(); }
    });
  };

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

  // ── Apartment checkbox panel ──
  function AptCheckboxPanel({ scope, selectedIds, onToggle, taken }: {
    scope: string;
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    taken: Map<string, string>;
  }) {
    return (
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Seleziona appartamenti</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
          {apartments.map((apt) => {
            const takenBy = taken.get(apt.id);
            const checked = selectedIds.has(apt.id);
            const disabled = !!takenBy;
            return (
              <label
                key={apt.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  disabled ? "opacity-50 cursor-not-allowed" : checked ? "bg-violet-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked || disabled}
                  disabled={disabled}
                  onChange={() => !disabled && onToggle(apt.id)}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
                <span className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-slate-800"}`}>{apt.name}</span>
                {disabled && <span className="text-[10px] text-gray-400 ml-auto">{takenBy}</span>}
              </label>
            );
          })}
        </div>
        {apartments.length > 0 && (
          <p className="text-[10px] text-gray-400 mb-3">
            Nessun appartamento selezionato = tutti gli appartamenti dell'organizzazione.
            {" "}Quelli già assegnati ad un'altra impresa per {SCOPES.find((s) => s.key === scope)?.label.toLowerCase()} sono disabilitati.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Deleghe per funzione */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Deleghe funzioni</h2>
          <span className="text-[11px] text-gray-400">appartamenti per delega</span>
        </div>

        {SCOPES.map((s) => {
          const scopeHandlers = handlers[s.key] ?? [];
          const isAdding = addingScope === s.key;

          return (
            <div key={s.key} className="space-y-2">
              {/* Existing engagements for this scope */}
              {scopeHandlers.map((h) => {
                const isPendingInvite = h.status === "PENDING";
                const isEditing = editingEngId === h.engagementId;
                const taken = takenApts(s.key, h.engagementId);
                return (
                  <div key={h.engagementId} className={`rounded-xl border ${isEditing ? "border-violet-400 bg-violet-50/30" : isPendingInvite ? "border-amber-200 bg-amber-50/30" : "border-gray-100 bg-gray-50/70"} px-3 py-2.5`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-800 min-w-[110px] shrink-0">
                        <span>{s.emoji}</span> {s.label}
                      </span>
                      {isPendingInvite ? (
                        <>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shrink-0">
                            ⏳ In attesa
                          </span>
                          {h.companyId && (
                            <span className="text-[10px] text-slate-400 truncate">{(() => {
                              const c = companies.find((co) => co.id === h.companyId);
                              return c ? `${c.name}${c.managers[0] ? ` · ${c.managers[0].email}` : ""}` : "";
                            })()}</span>
                          )}
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shrink-0">
                          {h.companyName}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                        {h.apartmentIds.length === 0 ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Tutti gli appartamenti</span>
                        ) : (
                          h.apartmentIds.map((aid) => {
                            const apt = apartments.find((a) => a.id === aid);
                            return apt ? (
                              <span key={aid} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{apt.name}</span>
                            ) : null;
                          })
                        )}
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 shrink-0">
                        {isPendingInvite ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (h.inviteToken) {
                                  navigator.clipboard.writeText(`${window.location.origin}/invito/${h.inviteToken}`);
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                }
                              }}
                              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                            >
                              {copied ? "Copiato!" : "Copia link"}
                            </button>
                            <button type="button" onClick={() => onRevoke(h.engagementId)} disabled={isPending} className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-500 disabled:opacity-40">Annulla</button>
                          </>
                        ) : isEditing ? (
                          <>
                            <button type="button" onClick={() => setEditingEngId(null)} disabled={isPending} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 disabled:opacity-40">Annulla</button>
                            <button type="button" onClick={confirmEdit} disabled={isPending} className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40">Salva</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => startEdit(h)} disabled={isPending} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 disabled:opacity-40">Modifica</button>
                            <button type="button" onClick={() => onRevoke(h.engagementId)} disabled={isPending} className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-500 disabled:opacity-40">Revoca</button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <AptCheckboxPanel
                        scope={s.key}
                        selectedIds={editAptIds}
                        onToggle={(id) => setEditAptIds((prev) => {
                          const next = new Set(prev);
                          next.has(id) ? next.delete(id) : next.add(id);
                          return next;
                        })}
                        taken={taken}
                      />
                    )}
                  </div>
                );
              })}

              {/* No engagements → show "Interno" row */}
              {scopeHandlers.length === 0 && !isAdding && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-800 min-w-[110px]">
                    <span>{s.emoji}</span> {s.label}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">Interno</span>
                  <div className="ml-auto">
                    <button type="button" onClick={() => startAdd(s.key)} disabled={isPending || companies.length === 0} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40">
                      Delega
                    </button>
                  </div>
                </div>
              )}

              {/* "+ Aggiungi altra impresa" button */}
              {scopeHandlers.length > 0 && !isAdding && (
                <button
                  type="button"
                  onClick={() => startAdd(s.key)}
                  disabled={isPending || companies.length === 0}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs font-semibold text-gray-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50/30 transition-colors disabled:opacity-40 w-full"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Aggiungi altra impresa per {s.label}
                </button>
              )}

              {/* New delegation panel */}
              {isAdding && (
                <div className="rounded-xl border-2 border-violet-400 bg-violet-50/30 px-3 py-3">
                  {inviteLink ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-800">Invito creato!</p>
                      <p className="text-xs text-slate-500">Invia questo link insieme alle credenziali del manager dell&apos;impresa:</p>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={inviteLink}
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 select-all"
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <button type="button" onClick={copyInviteLink} className="shrink-0 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white">
                          {copied ? "Copiato!" : "Copia"}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">Il manager dell&apos;impresa dovrà effettuare il login e aprire questo link per accettare la delega.</p>
                      <button type="button" onClick={() => { setAddingScope(null); setInviteLink(null); }} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600">
                        Chiudi
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <span>{s.emoji}</span> {s.label}
                        </span>
                        <select
                          value={addCompanyId}
                          onChange={(e) => setAddCompanyId(e.target.value)}
                          className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none"
                        >
                          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <AptCheckboxPanel
                        scope={s.key}
                        selectedIds={addAptIds}
                        onToggle={(id) => setAddAptIds((prev) => {
                          const next = new Set(prev);
                          next.has(id) ? next.delete(id) : next.add(id);
                          return next;
                        })}
                        taken={takenApts(s.key)}
                      />

                      <div className="flex gap-2 justify-end pt-2 border-t border-violet-200">
                        <button type="button" onClick={() => setAddingScope(null)} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600">Annulla</button>
                        <button
                          type="button"
                          onClick={confirmAdd}
                          disabled={isPending || !addCompanyId}
                          className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          Genera link invito
                        </button>
                      </div>
                    </>
                  )}
                </div>
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
          <button type="button" onClick={() => setCreating((v) => !v)} className="rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600">
            {creating ? "Chiudi" : "+ Nuova impresa"}
          </button>
        </div>

        {creating && (
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3 space-y-2">
            <input className={inputCls} placeholder="Nome impresa (es. Impresa Alfa)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className={inputCls} placeholder="Partita IVA (opzionale)" value={newVat} onChange={(e) => setNewVat(e.target.value)} />
            <button type="button" onClick={onCreate} disabled={isPending} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">
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
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setMgrField(c.id, { open: !(f?.open) })} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-violet-600">
                        {f?.open ? "Chiudi" : "+ Accesso"}
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteId(confirmDeleteId === c.id ? null : c.id)} className="rounded-full border border-gray-200 bg-white p-1.5 text-[11px] text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>

                  {confirmDeleteId === c.id && (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs text-red-700 mb-2">Rimuovere <strong>{c.name}</strong> dalla tua organizzazione? Verranno revocate tutte le deleghe e cancellati i messaggi. L'impresa continuerà ad esistere per altre organizzazioni.</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => onRemoveCompany(c.id)} disabled={isPending} className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40">
                          Conferma rimozione
                        </button>
                        <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600">
                          Annulla
                        </button>
                      </div>
                    </div>
                  )}

                  {c.managers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.managers.map((m) => (
                        <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-gray-600 border border-gray-100">
                          👤 {m.name} <span className="text-gray-400">· {m.email}</span>
                        </span>
                      ))}
                    </div>
                  )}

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

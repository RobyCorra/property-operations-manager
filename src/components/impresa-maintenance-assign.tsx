"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { assignMaintenance, impresaApproveMaintenance, impresaCreateMaintenance } from "@/src/app/actions/company";
import MaintenanceTaskEditor, { type MaintenanceTask } from "@/src/components/maintenance-task-editor";

type Staff = { id: string; name: string };
type Apartment = { id: string; name: string; ownerName: string };
type Ticket = {
  id: string;
  title: string;
  apartmentName: string;
  ownerName: string;
  priority: string;
  status: string;
  dateISO: string;
  assignedToId: string | null;
};

type Filter = "all" | "unassigned" | "assigned" | "proposed" | "done";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Tutti",
  unassigned: "Da assegnare",
  assigned: "Assegnati",
  proposed: "In attesa org",
  done: "Risolti",
};
const FILTER_COLORS: Record<Filter, string> = {
  all: "bg-slate-900 text-white",
  unassigned: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  proposed: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};
const BORDER_COLOR: Record<Filter, string> = {
  all: "",
  unassigned: "border-l-amber-400",
  assigned: "border-l-blue-400",
  proposed: "border-l-amber-400",
  done: "border-l-emerald-400",
};

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  PROPOSED: { cls: "bg-amber-100 text-amber-700", label: "In attesa org" },
  PENDING_UNASSIGNED: { cls: "bg-amber-100 text-amber-700", label: "Da assegnare" },
  PENDING_ASSIGNED: { cls: "bg-blue-100 text-blue-700", label: "Assegnata" },
  IN_PROGRESS: { cls: "bg-blue-100 text-blue-700", label: "In corso" },
  AWAITING_REVIEW: { cls: "bg-purple-100 text-purple-700", label: "In verifica" },
  RESOLVED: { cls: "bg-emerald-100 text-emerald-700", label: "Risolta" },
  COMPLETED: { cls: "bg-emerald-100 text-emerald-700", label: "Completata" },
  APPROVED: { cls: "bg-emerald-100 text-emerald-700", label: "Approvata" },
  CLOSED: { cls: "bg-slate-100 text-slate-600", label: "Chiusa" },
};

function isDone(status: string) {
  return status === "APPROVED" || status === "COMPLETED" || status === "CLOSED" || status === "RESOLVED";
}
function ticketCategory(t: Ticket): Filter {
  if (t.status === "PROPOSED") return "proposed";
  if (isDone(t.status)) return "done";
  if (!t.assignedToId) return "unassigned";
  return "assigned";
}
function badgeKey(t: Ticket): string {
  if (t.status === "PENDING") return t.assignedToId ? "PENDING_ASSIGNED" : "PENDING_UNASSIGNED";
  return t.status;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("it-IT", { hour: "2-digit", minute: "2-digit" });
}
function dateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Oggi";
  if (diff === 1) return "Domani";
  if (diff === -1) return "Ieri";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}
function dateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isPast(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d < today;
}

export default function ImpresaMaintenanceAssign({ tickets, staff, apartments }: { tickets: Ticket[]; staff: Staff[]; apartments: Apartment[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const initial = Object.fromEntries(tickets.map((t) => [t.id, t.assignedToId ?? ""]));
  const [assign, setAssign] = useState<Record<string, string>>(initial);
  const dirty = tickets.some((t) => (assign[t.id] ?? "") !== (t.assignedToId ?? ""));

  const formRef = useRef<HTMLDivElement>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [nApt, setNApt] = useState("");
  const [nTitle, setNTitle] = useState("");
  const [nPriority, setNPriority] = useState("MEDIUM");
  const [nStart, setNStart] = useState("");
  const [nEnd, setNEnd] = useState("");
  const [nDesc, setNDesc] = useState("");

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

  const filtered = useMemo(() => (filter === "all" ? tickets : tickets.filter((t) => ticketCategory(t) === filter)), [tickets, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; iso: string; items: Ticket[] }>();
    const sorted = [...filtered].sort((a, b) => {
      const aP = isPast(a.dateISO), bP = isPast(b.dateISO);
      if (aP !== bP) return aP ? 1 : -1;
      if (aP) return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
      return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
    });
    for (const t of sorted) {
      const key = dateKey(t.dateISO);
      if (!map.has(key)) map.set(key, { label: dateLabel(t.dateISO), iso: t.dateISO, items: [] });
      map.get(key)!.items.push(t);
    }
    return [...map.values()];
  }, [filtered]);

  const counts = useMemo(() => {
    const m: Record<Filter, number> = { all: tickets.length, unassigned: 0, assigned: 0, proposed: 0, done: 0 };
    for (const t of tickets) m[ticketCategory(t)]++;
    return m;
  }, [tickets]);

  const staffName = useMemo(() => new Map(staff.map((s) => [s.id, s.name])), [staff]);

  const onSave = () => {
    setError(null); setOkMsg(null);
    const changed = tickets.filter((t) => (assign[t.id] ?? "") !== (t.assignedToId ?? ""));
    if (changed.length === 0) return;
    startTransition(async () => {
      for (const t of changed) {
        const r = await assignMaintenance(t.id, assign[t.id] || null);
        if (!r.success) { setError(r.error); return; }
      }
      setOkMsg(`Assegnazioni salvate (${changed.length}).`);
      router.refresh();
    });
  };

  const onApprove = (id: string) => {
    setError(null); setOkMsg(null);
    startTransition(async () => {
      const r = await impresaApproveMaintenance(id);
      if (!r.success) setError(r.error);
      else { setOkMsg("Intervento approvato."); router.refresh(); }
    });
  };

  const onCreate = () => {
    setError(null); setOkMsg(null);
    if (!nApt || !nTitle.trim()) { setError("Appartamento e titolo obbligatori."); return; }
    const tasksInput = formRef.current?.querySelector<HTMLInputElement>("input[name='maintenanceTasks']");
    let tasks: unknown = [];
    if (tasksInput) { try { tasks = JSON.parse(tasksInput.value); } catch { tasks = []; } }
    startTransition(async () => {
      const r = await impresaCreateMaintenance({ apartmentId: nApt, title: nTitle, description: nDesc, priority: nPriority, start: nStart || null, end: nEnd || null, maintenanceTasks: tasks });
      if (!r.success) setError(r.error);
      else {
        setNewOpen(false); setNApt(""); setNTitle(""); setNPriority("MEDIUM"); setNStart(""); setNEnd(""); setNDesc("");
        setOkMsg("Richiesta inviata all'organizzazione.");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Barra azioni */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onSave} disabled={isPending || !dirty} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">Salva</button>
        <button type="button" onClick={() => setNewOpen((v) => !v)} className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-600">{newOpen ? "Chiudi" : "+ Nuova manutenzione"}</button>
        {dirty && <span className="text-xs text-amber-600">Modifiche non salvate</span>}
        {okMsg && <span className="text-xs font-semibold text-emerald-600">✓ {okMsg}</span>}
        {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
      </div>

      {/* Form nuova manutenzione */}
      {newOpen && (
        <div ref={formRef} className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 space-y-4">
          {/* Appartamento */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Appartamento</label>
            <select className={inputCls} value={nApt} onChange={(e) => setNApt(e.target.value)}>
              <option value="">Seleziona appartamento…</option>
              {apartments.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.ownerName}</option>)}
            </select>
          </div>
          {/* Titolo + Priorità */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Titolo</label>
              <input type="text" className={inputCls} placeholder="es. Perdita rubinetto" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Priorità</label>
              <select className={inputCls} value={nPriority} onChange={(e) => setNPriority(e.target.value)}>
                <option value="LOW">Bassa</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>
          {/* Data inizio + Data fine */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Data / ora inizio</label>
              <input type="datetime-local" className={inputCls} value={nStart} onChange={(e) => setNStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Data / ora fine</label>
              <input type="datetime-local" className={inputCls} value={nEnd} onChange={(e) => setNEnd(e.target.value)} />
            </div>
          </div>
          {/* Descrizione */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Descrizione</label>
            <textarea className={inputCls} rows={3} placeholder="Descrizione intervento (facoltativa)" value={nDesc} onChange={(e) => setNDesc(e.target.value)} />
          </div>
          {/* Task dell'intervento */}
          <div className="pt-2 border-t border-violet-100">
            <MaintenanceTaskEditor initialTasks={[]} />
          </div>
          {/* Warning */}
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <span>⚠️</span>
            <p className="text-[11px] text-amber-700">L&apos;intervento verrà <strong>inviato all&apos;organizzazione per l&apos;approvazione</strong>; solo dopo l&apos;assenso diventa operativo e compare in entrambi i calendari.</p>
          </div>
          {/* Submit */}
          <button type="button" onClick={onCreate} disabled={isPending} className="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-all active:scale-95">Invia richiesta all&apos;organizzazione</button>
        </div>
      )}

      {/* Filtri */}
      <div className="flex flex-wrap gap-1.5">
        {(["all", "unassigned", "assigned", "proposed", "done"] as Filter[]).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${filter === f ? FILTER_COLORS[f] : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Lista raggruppata per data */}
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">Nessun intervento trovato.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => {
            const past = isPast(group.iso);
            return (
              <div key={group.label}>
                <div className={`flex items-center gap-2 mb-2 ${past ? "opacity-60" : ""}`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{group.label}</span>
                  <div className="h-px flex-1 bg-gray-200" />
                  {past && <span className="text-[10px] text-gray-400">passate</span>}
                </div>
                <div className="space-y-1.5">
                  {group.items.map((t) => {
                    const cat = ticketCategory(t);
                    const badge = STATUS_BADGE[badgeKey(t)] ?? { cls: "bg-slate-100 text-slate-600", label: t.status };
                    const pastItem = isPast(t.dateISO);
                    const proposed = t.status === "PROPOSED";
                    return (
                      <div key={t.id}
                        className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 border-l-[3px] ${BORDER_COLOR[cat]} ${proposed ? "border-dashed border-amber-300 bg-amber-50/40" : "border-gray-100 bg-gray-50/70"} ${pastItem && !proposed ? "opacity-70" : ""}`}>
                        <div className="min-w-0 flex-1">
                          {proposed ? (
                            <span className="truncate text-sm font-semibold text-slate-800">{t.title}
                              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">{t.ownerName}</span></span>
                          ) : (
                            <Link href={`/dashboard/impresa/manutenzione/${t.id}`} className="truncate text-sm font-semibold text-slate-800 hover:text-violet-600">{t.title}
                              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">{t.ownerName}</span></Link>
                          )}
                          <p className="text-[11px] text-gray-500">
                            {t.apartmentName} · {fmtTime(t.dateISO)}
                            {!proposed && <> · <Link href={`/dashboard/impresa/manutenzione/${t.id}`} className="text-violet-600">apri scheda →</Link></>}
                            {t.priority === "URGENT" && <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-700">Urgente</span>}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge.cls}`}>{badge.label}</span>
                        {t.status === "AWAITING_REVIEW" && (
                          <button type="button" onClick={() => onApprove(t.id)} disabled={isPending} className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">Approva</button>
                        )}
                        {proposed ? null : t.assignedToId ? (
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                            {staffName.get(t.assignedToId) ?? "—"}
                          </span>
                        ) : !isDone(t.status) ? (
                          <select value={assign[t.id] ?? ""} onChange={(e) => setAssign((m) => ({ ...m, [t.id]: e.target.value }))}
                            className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none">
                            <option value="">Da assegnare</option>
                            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mr-1 align-[-1px]" />Non assegnata</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-400 mr-1 align-[-1px]" />Assegnata / in corso</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-purple-400 mr-1 align-[-1px]" />In verifica</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400 mr-1 align-[-1px]" />Approvata</span>
      </div>
    </div>
  );
}

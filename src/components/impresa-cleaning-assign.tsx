"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { assignCleaning, approveCleaningByImpresa, createImpresaCleaning } from "@/src/app/actions/company";

type Staff = { id: string; name: string };
type Apartment = { id: string; name: string; ownerName: string };
type Cleaning = {
  id: string;
  apartmentName: string;
  ownerName: string;
  dateISO: string;
  status: string;
  assignedToId: string | null;
};

type Filter = "all" | "unassigned" | "assigned" | "done";

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

function isDone(status: string) {
  return status === "COMPLETED" || status === "APPROVED";
}

function cleaningCategory(c: Cleaning): Filter {
  if (isDone(c.status)) return "done";
  if (!c.assignedToId) return "unassigned";
  return "assigned";
}

const FILTER_LABELS: Record<Filter, string> = {
  all: "Tutte",
  unassigned: "Non assegnate",
  assigned: "Assegnate",
  done: "Completate",
};

const FILTER_COLORS: Record<Filter, string> = {
  all: "bg-slate-900 text-white",
  unassigned: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

const BORDER_COLOR: Record<string, string> = {
  unassigned: "border-l-amber-400",
  assigned: "border-l-blue-400",
  done: "border-l-emerald-400",
};

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  PENDING_UNASSIGNED: { cls: "bg-amber-100 text-amber-700", label: "Da assegnare" },
  PENDING_ASSIGNED: { cls: "bg-blue-100 text-blue-700", label: "Assegnata" },
  IN_PROGRESS: { cls: "bg-blue-100 text-blue-700", label: "In corso" },
  AWAITING_REVIEW: { cls: "bg-amber-100 text-amber-700", label: "In revisione" },
  COMPLETED: { cls: "bg-emerald-100 text-emerald-700", label: "Completata" },
  APPROVED: { cls: "bg-emerald-100 text-emerald-700", label: "Approvata" },
};

function badgeKey(c: Cleaning): string {
  if (c.status === "PENDING") return c.assignedToId ? "PENDING_ASSIGNED" : "PENDING_UNASSIGNED";
  return c.status;
}

export default function ImpresaCleaningAssign({
  cleanings,
  staff,
  apartments,
}: {
  cleanings: Cleaning[];
  staff: Staff[];
  apartments: Apartment[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const initial = Object.fromEntries(cleanings.map((c) => [c.id, c.assignedToId ?? ""]));
  const [assign, setAssign] = useState<Record<string, string>>(initial);
  const dirty = cleanings.some((c) => (assign[c.id] ?? "") !== (c.assignedToId ?? ""));

  const [newOpen, setNewOpen] = useState(false);
  const [nApt, setNApt] = useState("");
  const [nDate, setNDate] = useState("");
  const [nTime, setNTime] = useState("10:00");

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";

  const filtered = useMemo(() => {
    if (filter === "all") return cleanings;
    return cleanings.filter((c) => cleaningCategory(c) === filter);
  }, [cleanings, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; iso: string; items: Cleaning[] }>();
    // Sort: future first (ascending), then past (descending) — already desc from server
    const sorted = [...filtered].sort((a, b) => {
      const aP = isPast(a.dateISO);
      const bP = isPast(b.dateISO);
      if (aP !== bP) return aP ? 1 : -1;
      if (aP) return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
      return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
    });
    for (const c of sorted) {
      const key = dateKey(c.dateISO);
      if (!map.has(key)) map.set(key, { label: dateLabel(c.dateISO), iso: c.dateISO, items: [] });
      map.get(key)!.items.push(c);
    }
    return [...map.values()];
  }, [filtered]);

  const counts = useMemo(() => {
    const m: Record<Filter, number> = { all: cleanings.length, unassigned: 0, assigned: 0, done: 0 };
    for (const c of cleanings) m[cleaningCategory(c)]++;
    return m;
  }, [cleanings]);

  const staffName = useMemo(() => new Map(staff.map((s) => [s.id, s.name])), [staff]);

  const onSave = () => {
    setError(null);
    setOkMsg(null);
    const changed = cleanings.filter((c) => (assign[c.id] ?? "") !== (c.assignedToId ?? ""));
    if (changed.length === 0) return;
    startTransition(async () => {
      for (const c of changed) {
        const r = await assignCleaning(c.id, assign[c.id] || null);
        if (!r.success) { setError(r.error); return; }
      }
      setOkMsg(`Assegnazioni salvate (${changed.length}).`);
      router.refresh();
    });
  };

  const onApprove = (id: string) => {
    setError(null); setOkMsg(null);
    startTransition(async () => {
      const r = await approveCleaningByImpresa(id);
      if (!r.success) setError(r.error);
      else { setOkMsg("Pulizia approvata."); router.refresh(); }
    });
  };

  const onCreate = () => {
    setError(null); setOkMsg(null);
    if (!nApt || !nDate) { setError("Appartamento e data obbligatori."); return; }
    startTransition(async () => {
      const r = await createImpresaCleaning({ apartmentId: nApt, date: nDate, time: nTime });
      if (!r.success) setError(r.error);
      else { setNewOpen(false); setNApt(""); setNDate(""); setNTime("10:00"); setOkMsg("Pulizia creata."); router.refresh(); }
    });
  };

  return (
    <div className="space-y-3">
      {/* Barra azioni */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending || !dirty}
          className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Salva
        </button>
        <button
          type="button"
          onClick={() => setNewOpen((v) => !v)}
          className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-600"
        >
          {newOpen ? "Chiudi" : "+ Nuova pulizia"}
        </button>
        {dirty && <span className="text-xs text-amber-600">Modifiche non salvate</span>}
        {okMsg && <span className="text-xs font-semibold text-emerald-600">✓ {okMsg}</span>}
        {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
      </div>

      {/* Form nuova pulizia */}
      {newOpen && (
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-violet-100 bg-violet-50/40 p-3 sm:grid-cols-4">
          <select className={inputCls} value={nApt} onChange={(e) => setNApt(e.target.value)}>
            <option value="">Appartamento…</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>{a.name} · {a.ownerName}</option>
            ))}
          </select>
          <input type="date" className={inputCls} value={nDate} onChange={(e) => setNDate(e.target.value)} />
          <input type="time" className={inputCls} value={nTime} onChange={(e) => setNTime(e.target.value)} />
          <button type="button" onClick={onCreate} disabled={isPending} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
            Crea pulizia
          </button>
        </div>
      )}

      {/* Filtri */}
      <div className="flex flex-wrap gap-1.5">
        {(["all", "unassigned", "assigned", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
              filter === f ? FILTER_COLORS[f] : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Lista raggruppata per data */}
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">Nessuna pulizia trovata.</p>
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
                  {group.items.map((c) => {
                    const cat = cleaningCategory(c);
                    const badge = STATUS_BADGE[badgeKey(c)] ?? { cls: "bg-slate-100 text-slate-600", label: c.status };
                    const pastItem = isPast(c.dateISO);
                    return (
                      <div
                        key={c.id}
                        className={`flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5 border-l-[3px] ${BORDER_COLOR[cat] ?? ""} ${pastItem ? "opacity-70" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <Link href={`/dashboard/impresa/pulizie/${c.id}`} className="truncate text-sm font-semibold text-slate-800 hover:text-violet-600">
                            {c.apartmentName}
                            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">{c.ownerName}</span>
                          </Link>
                          <p className="text-[11px] text-gray-500">
                            {fmtTime(c.dateISO)}
                            {" · "}
                            <Link href={`/dashboard/impresa/pulizie/${c.id}`} className="text-violet-600">apri scheda →</Link>
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge.cls}`}>{badge.label}</span>
                        {c.status === "AWAITING_REVIEW" && (
                          <button type="button" onClick={() => onApprove(c.id)} disabled={isPending} className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">
                            Approva
                          </button>
                        )}
                        {c.assignedToId && (
                          <span className="text-[11px] text-gray-500">{staffName.get(c.assignedToId) ?? "—"}</span>
                        )}
                        {!isDone(c.status) && !pastItem && (
                          <select
                            value={assign[c.id] ?? ""}
                            onChange={(e) => setAssign((m) => ({ ...m, [c.id]: e.target.value }))}
                            className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none"
                          >
                            <option value="">Da assegnare</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        )}
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
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400 mr-1 align-[-1px]" />Completata</span>
      </div>
    </div>
  );
}

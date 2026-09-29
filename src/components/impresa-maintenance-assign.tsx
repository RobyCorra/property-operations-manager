"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { assignMaintenance } from "@/src/app/actions/company";

type Staff = { id: string; name: string };
type Ticket = {
  id: string;
  title: string;
  apartmentName: string;
  ownerName: string;
  priority: string;
  status: string;
  createdISO: string;
  assignedToId: string | null;
};

type Filter = "all" | "unassigned" | "assigned" | "done";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Tutti",
  unassigned: "Da assegnare",
  assigned: "Assegnati",
  done: "Risolti",
};

function isDone(status: string) {
  return status === "RESOLVED" || status === "COMPLETED" || status === "CLOSED" || status === "APPROVED";
}

function ticketCategory(t: Ticket): Filter {
  if (isDone(t.status)) return "done";
  if (!t.assignedToId) return "unassigned";
  return "assigned";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  AWAITING_REVIEW: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

export default function ImpresaMaintenanceAssign({ tickets, staff }: { tickets: Ticket[]; staff: Staff[] }) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [assign, setAssign] = useState<Record<string, string | null>>(
    () => Object.fromEntries(tickets.map((t) => [t.id, t.assignedToId])),
  );
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: tickets.length, unassigned: 0, assigned: 0, done: 0 };
    for (const t of tickets) c[ticketCategory(t)]++;
    return c;
  }, [tickets]);

  const visible = useMemo(
    () => (filter === "all" ? tickets : tickets.filter((t) => ticketCategory(t) === filter)),
    [tickets, filter],
  );

  function onAssign(id: string, userId: string | null) {
    setAssign((a) => ({ ...a, [id]: userId }));
    setError(null);
    startTransition(async () => {
      const r = await assignMaintenance(id, userId);
      if (!r.success) setError(r.error);
      else { setSavedId(id); setTimeout(() => setSavedId((s) => (s === id ? null : s)), 1500); }
    });
  }

  const staffName = new Map(staff.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {FILTER_LABELS[f]} <span className="opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {visible.length === 0 ? (
        <p className="text-xs text-gray-400">Nessun intervento in questa vista.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((t) => {
            const currentAssignee = assign[t.id] ?? null;
            const highlightUnassigned = !currentAssignee && !isDone(t.status);
            return (
            <div key={t.id} className={`rounded-xl border px-3 py-2.5 ${highlightUnassigned ? "border-2 border-rose-300 bg-rose-50/70" : "border-gray-100 bg-gray-50/70"}`}>
              <div className="flex items-start gap-3">
                <Link href={`/dashboard/impresa/manutenzione/${t.id}`} className="min-w-0 flex-1 group cursor-pointer">
                  <span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-violet-600">
                    {t.title}
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {t.apartmentName} · {t.ownerName} · {fmtDate(t.createdISO)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[t.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {t.status}
                    </span>
                    {t.priority === "URGENT" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Urgente</span>
                    )}
                    {currentAssignee ? (
                      <span className="text-[10px] text-gray-500">👤 {staffName.get(currentAssignee) ?? "—"}</span>
                    ) : !isDone(t.status) ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Da assegnare</span>
                    ) : null}
                  </div>
                </Link>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <select
                    value={assign[t.id] ?? ""}
                    onChange={(e) => onAssign(t.id, e.target.value || null)}
                    disabled={isPending || staff.length === 0}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Non assegnato</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {savedId === t.id && <span className="text-[10px] font-semibold text-emerald-600">Salvato</span>}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

type Unit = {
  id: string;
  name: string;
  unitNumber: string | null;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  icalUrl: string | null;
  lastSyncAt: Date | null;
  statusColor?: string;
  statusLabel?: string;
  statusTailwind?: string;
};

type Category = {
  id: string;
  name: string;
  squareMeters: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  units: Unit[];
};

type Structure = {
  id: string;
  name: string;
  type: string;
  address: string;
  categories: Category[];
};

export default function StructuresList({ structures }: { structures: Structure[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">Strutture</h2>
      {structures.map((s) => {
        const unitCount = s.categories.reduce((sum, c) => sum + c.units.length, 0);
        const open = openId === s.id;
        return (
          <div key={s.id} className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.04)] overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : s.id)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl">
                {s.type === "HOTEL" ? "🏨" : "🏢"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-extrabold tracking-tight text-slate-900">{s.name}</p>
                <p className="truncate text-[12px] font-medium text-slate-400">{s.address}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#f0eeff] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                {unitCount} unità
              </span>
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {open && (
              <div className="border-t border-slate-100 px-4 py-4 space-y-5">
                {s.categories.map((c) => (
                  <div key={c.id}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{c.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {c.squareMeters} m² · {c.bedrooms} camere · {c.bathrooms} bagni · {c.maxGuests} ospiti · {c.units.length} unità
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/manager/strutture/${s.id}/categoria/${c.id}`}
                        className="shrink-0 rounded-full bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold text-violet-600"
                      >
                        Modifica master
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {c.units.map((u) => (
                        <div key={u.id} className="flex items-center gap-2 rounded-2xl bg-[#f8f7ff] border border-[#ede9fe] px-3 py-2">
                          <span className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[12px] font-bold border ${u.statusTailwind || "bg-white text-violet-700 border-violet-100"}`}>
                            {u.unitNumber || "—"}
                          </span>
                          <span className="flex-1 truncate text-[12px] font-medium text-slate-600">{u.name}</span>
                          {u.statusLabel && (
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${u.statusTailwind || ""}`}>{u.statusLabel}</span>
                          )}
                          <Link
                            href={`/dashboard/manager/apartments/${u.id}/checklist`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/5 text-emerald-600 border border-emerald-500/10"
                            title="Checklist"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                          </Link>
                          <Link
                            href={`/dashboard/manager/apartments/${u.id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white"
                            title="Modifica"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Link
                  href={`/dashboard/manager/strutture/${s.id}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-600"
                >
                  Apri struttura
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

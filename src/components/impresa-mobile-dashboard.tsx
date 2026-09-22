"use client";

import Link from "next/link";
import { useLang } from "@/src/components/lang-context";
import { hapticLight } from "@/src/lib/haptics";

export type ImpresaMobileApt = {
  id: string;
  name: string;
  status: string;
  propertyId?: string | null;
  propertyName?: string | null;
  unitCategoryId?: string | null;
  categoryName?: string | null;
  unitNumber?: string | null;
};

export type ImpresaMobileLateClean = {
  id: string;
  apartmentName: string;
  assignedToName: string;
  scheduledTime: string;
};

export type ImpresaMobileInProgress = {
  id: string;
  apartmentName: string;
  assignedToName: string;
};

export type ImpresaMobileCleaningToday = {
  id: string;
  apartmentName: string;
  assignedToName: string;
  isAssigned: boolean;
  status: string;
};

function statusDotClass(status: string) {
  switch (status) {
    case "GREEN":  return "bg-emerald-500";
    case "RED":    return "bg-red-500";
    case "BLUE":   return "bg-blue-500";
    case "VIOLET": return "bg-violet-500";
    case "YELLOW": return "bg-yellow-400";
    default:       return "bg-slate-400";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "GREEN":  return "Pronto";
    case "RED":    return "Occupato";
    case "BLUE":   return "Non pronto";
    case "VIOLET": return "In corso";
    case "YELLOW": return "In revisione";
    default:       return "—";
  }
}

type Props = {
  apartments: ImpresaMobileApt[];
  lateCleanings: ImpresaMobileLateClean[];
  cleaningsInProgress: ImpresaMobileInProgress[];
  cleaningsCount: number;
  cleaningsDoneCount: number;
  cleaningsTodayItems: ImpresaMobileCleaningToday[];
  checkinsCount: number;
  serverDate: string;
};

export default function ImpresaMobileDashboard({
  apartments,
  lateCleanings,
  cleaningsInProgress,
  cleaningsCount,
  cleaningsDoneCount,
  cleaningsTodayItems,
  checkinsCount,
  serverDate,
}: Props) {
  const { t } = useLang();
  const now = new Date(serverDate);

  return (
    <div className="space-y-3 px-4 pt-2 pb-8">

      {/* ─ Pulizie in ritardo ─ */}
      {lateCleanings.length > 0 && (
        <Link
          href="/dashboard/impresa/pulizie"
          onClick={() => hapticLight()}
          className="w-full min-h-[64px] rounded-2xl px-4 py-3 border border-rose-500 bg-rose-500 shadow-lg shadow-rose-300 flex items-center gap-3.5 text-left active:scale-[0.93] transition-transform duration-100 active:duration-0"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p className="flex-1 text-[11px] font-black uppercase tracking-widest text-white">Pulizie in ritardo</p>
          <p className="text-3xl font-black leading-none shrink-0 text-white">{lateCleanings.length}</p>
          <span className="text-white/80 text-2xl leading-none shrink-0">›</span>
        </Link>
      )}

      {/* ─ Pulizie in corso ─ */}
      {cleaningsInProgress.length > 0 && (
        <Link
          href="/dashboard/impresa/pulizie"
          onClick={() => hapticLight()}
          className="w-full min-h-[64px] rounded-2xl px-4 py-3 border border-violet-600 bg-violet-600 shadow-lg shadow-violet-300 flex items-center gap-3.5 text-left active:scale-[0.93] transition-transform duration-100 active:duration-0"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
              <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
            </svg>
          </div>
          <p className="flex-1 text-[11px] font-black uppercase tracking-widest text-white">Pulizie in corso</p>
          <p className="text-3xl font-black leading-none shrink-0 text-white">{cleaningsInProgress.length}</p>
          <span className="text-white/80 text-2xl leading-none shrink-0">›</span>
        </Link>
      )}

      {/* ─ Check-in oggi (solo info, dal contesto prenotazioni) ─ */}
      {checkinsCount > 0 && (
        <div className="w-full min-h-[64px] rounded-2xl px-4 py-3 border border-blue-200 bg-blue-50 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <p className="flex-1 text-[11px] font-black uppercase tracking-widest text-blue-500">Check-in oggi</p>
          <p className="text-3xl font-black leading-none shrink-0 text-slate-900">{checkinsCount}</p>
        </div>
      )}

      {/* ─ Pulizie oggi ─ */}
      {cleaningsCount > 0 && (
        <Link
          href="/dashboard/impresa/pulizie"
          onClick={() => hapticLight()}
          className="w-full min-h-[64px] rounded-2xl px-4 py-3 border flex items-center gap-3.5 text-left active:scale-[0.93] transition-transform duration-100 active:duration-0 bg-white border-slate-100 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cleaningsDoneCount === cleaningsCount && cleaningsCount > 0 ? "bg-emerald-100" : "bg-violet-100"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cleaningsDoneCount === cleaningsCount && cleaningsCount > 0 ? "#10b981" : "#7c3aed"} strokeWidth="2.5">
              <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
            </svg>
          </div>
          <p className="flex-1 text-[11px] font-black uppercase tracking-widest text-violet-500">Pulizie oggi</p>
          {cleaningsDoneCount > 0 && (
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">{cleaningsDoneCount}/{cleaningsCount} ✓</span>
          )}
          <p className="text-3xl font-black leading-none shrink-0 text-slate-900">{cleaningsCount}</p>
        </Link>
      )}

      {/* ── AZIONI RAPIDE ─────────────────────── */}
      <div className="mb-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Azioni rapide</p>
        <div className="flex gap-2.5">
          <Link
            href="/dashboard/impresa/pulizie"
            className="flex-1 rounded-[20px] p-3.5 flex flex-col gap-2 relative overflow-hidden active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 6px 20px rgba(124,58,237,.35)" }}
          >
            <span className="absolute top-2.5 right-3 text-[20px] font-light text-white/40 leading-none">+</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
                <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
              </svg>
            </div>
            <p className="text-[13px] font-extrabold text-white leading-tight">Nuova Pulizia</p>
          </Link>

          <Link
            href="/dashboard/impresa/staff"
            className="flex-1 rounded-[20px] p-3.5 flex flex-col gap-2 relative overflow-hidden active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 6px 20px rgba(5,150,105,.3)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-[13px] font-extrabold text-white leading-tight">Gestisci Staff</p>
          </Link>

          <Link
            href="/dashboard/impresa/messaggi"
            className="flex-1 rounded-[20px] p-3.5 flex flex-col gap-2 relative overflow-hidden active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", boxShadow: "0 6px 20px rgba(217,119,6,.3)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-[13px] font-extrabold text-white leading-tight">Messaggi</p>
          </Link>
        </div>
      </div>

      {/* ── STATO APPARTAMENTI ─────────────────── */}
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Stato appartamenti</p>
        <div className="space-y-2">
          {(() => {
            type Cat = { id: string; name: string; units: ImpresaMobileApt[] };
            type Group = { type: "single"; apt: ImpresaMobileApt } | { type: "structure"; propertyId: string; name: string; cats: Cat[] };
            const groups: Group[] = [];
            const propIndex = new Map<string, number>();
            for (const apt of apartments) {
              if (!apt.propertyId) { groups.push({ type: "single", apt }); continue; }
              let gi = propIndex.get(apt.propertyId);
              if (gi === undefined) { gi = groups.length; propIndex.set(apt.propertyId, gi); groups.push({ type: "structure", propertyId: apt.propertyId, name: apt.propertyName || apt.name, cats: [] }); }
              const g = groups[gi] as Extract<Group, { type: "structure" }>;
              const catId = apt.unitCategoryId || "_";
              let cat = g.cats.find((c) => c.id === catId);
              if (!cat) { cat = { id: catId, name: apt.categoryName || "", units: [] }; g.cats.push(cat); }
              cat.units.push(apt);
            }
            return groups.map((g) => {
              if (g.type === "single") {
                return (
                  <div key={g.apt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden px-4 py-3 flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${statusDotClass(g.apt.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-900 truncate">{g.apt.name}</p>
                      <p className="text-[11px] text-slate-400">{statusLabel(g.apt.status)}</p>
                    </div>
                  </div>
                );
              }
              const totalUnits = g.cats.reduce((s, c) => s + c.units.length, 0);
              return (
                <div key={g.propertyId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden px-4 py-3">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg">🏨</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-900 truncate">{g.name}</p>
                      <p className="text-[11px] text-slate-400">{totalUnits} unità</p>
                    </div>
                  </div>
                  {g.cats.map((cat) => (
                    <div key={cat.id} className="ml-7 mt-1.5">
                      {cat.name && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{cat.name}</p>}
                      <div className="space-y-1">
                        {cat.units.map((u) => (
                          <div key={u.id} className="flex items-center gap-2 py-0.5">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotClass(u.status)}`} />
                            <span className="text-[12px] text-slate-700 truncate">{u.unitNumber ? `#${u.unitNumber}` : u.name}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">{statusLabel(u.status)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            });
          })()}

          {apartments.length === 0 && (
            <div className="bg-white/40 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
              Nessun appartamento delegato.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

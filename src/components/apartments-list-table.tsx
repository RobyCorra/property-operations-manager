"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import UnifiedFilters, { FilterField } from "./unified-filters";
import SyncIcalButton from "./sync-ical-button";
import DeleteApartmentButton from "./delete-apartment-button";

type Props = {
  initialApartments: {
    id: string;
    name: string;
    address: string;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    icalUrl: string | null;
    lastSyncAt: Date | null;
  }[];
};

export default function ApartmentsListTable({ initialApartments }: Props) {
  const [filters, setFilters] = useState<Record<string, string>>({ search: "", status: "" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setFilters({ search: "", status: "" });
  };

  const filteredApartments = useMemo(() => {
    return initialApartments.filter((apt) => {
      const matchesSearch = 
        !filters.search || 
        apt.name.toLowerCase().includes(filters.search.toLowerCase()) || 
        apt.address.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesSearch;
    });
  }, [initialApartments, filters]);

  const filterFields: FilterField[] = [
    { id: "search", label: "Cerca Nome / Indirizzo", type: "text", placeholder: "Es: Canova...", icon: <span className="inline-block w-4 h-4 rounded-full bg-slate-300" /> },
  ];

  return (
    <div className="space-y-6">
      <UnifiedFilters 
        fields={filterFields}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Desktop Table View */}
      <section className="hidden md:block bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-200 ease-in-out">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-white/20 border-b border-white/40">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Nome e Indirizzo</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Capienza</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Dettagli</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Superficie</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredApartments.map((apt) => (
                <tr key={apt.id} className="hover:bg-white/60 transition-all duration-200 group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-violet-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <span className="inline-block w-6 h-6 rounded-full bg-violet-300" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-slate-900 tracking-tight transition-colors uppercase truncate">{apt.name}</span>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide truncate">{apt.address}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                      <span>{apt.maxGuests} <span className="text-slate-400 font-medium">osp.</span></span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                           <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                           <span>{apt.bedrooms} Letti</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                           <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                           <span>{apt.bathrooms} Bagni</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                        <span>{apt.squareMeters} m²</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {apt.icalUrl && (
                        <SyncIcalButton
                            apartmentId={apt.id}
                            lastSyncAt={apt.lastSyncAt}
                        />
                        )}
                        <Link
                        href={`/dashboard/manager/apartments/${apt.id}/products`}
                        className="h-10 px-5 flex items-center gap-2 bg-violet-500/5 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-violet-500 hover:text-white transition-all border border-violet-500/10"
                        >
                        <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                        Prodotti
                        </Link>
                        <Link
                        href={`/dashboard/manager/apartments/${apt.id}/checklist`}
                        className="h-10 px-5 flex items-center gap-2 bg-emerald-500/5 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"
                        >
                        <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                        Checklist
                        </Link>
                        <Link
                        href={`/dashboard/manager/apartments/${apt.id}/edit`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        title="Modifica"
                        >
                        <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                        </Link>
                        <DeleteApartmentButton id={apt.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApartments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nessun risultato trovato</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredApartments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nessun risultato trovato</p>
          </div>
        ) : (
          filteredApartments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
              {/* Accent bar */}
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />

              <div className="p-4">
                {/* Header: icon + name + address */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-extrabold text-slate-900 leading-tight truncate">{apt.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{apt.address}</p>
                  </div>
                </div>

                {/* Chips */}
                <div className="flex gap-2 flex-wrap mb-4">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs">👥</span>
                    <span className="text-[11px] font-bold text-slate-700">{apt.maxGuests}</span>
                    <span className="text-[9px] text-slate-400 font-medium">ospiti</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs">🛏</span>
                    <span className="text-[11px] font-bold text-slate-700">{apt.bedrooms}</span>
                    <span className="text-[9px] text-slate-400 font-medium">letti</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs">🚿</span>
                    <span className="text-[11px] font-bold text-slate-700">{apt.bathrooms}</span>
                    <span className="text-[9px] text-slate-400 font-medium">bagni</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs">📐</span>
                    <span className="text-[11px] font-bold text-slate-700">{apt.squareMeters}m²</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 mb-3" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Modifica — pulsante principale */}
                  <Link
                    href={`/dashboard/manager/apartments/${apt.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl py-3 text-[13px] font-bold shadow-[0_4px_12px_rgba(99,102,241,.3)] active:scale-95 transition-transform"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifica
                  </Link>

                  {/* Menu ⋮ */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === apt.id ? null : apt.id)}
                      className="w-11 h-11 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500 active:bg-slate-200 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {openMenuId === apt.id && (
                      <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 bottom-14 z-50 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                          <Link
                            href={`/dashboard/manager/apartments/${apt.id}/products`}
                            className="flex items-center gap-3 px-4 py-3.5 text-[13px] font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                            Prodotti
                          </Link>
                          <Link
                            href={`/dashboard/manager/apartments/${apt.id}/checklist`}
                            className="flex items-center gap-3 px-4 py-3.5 text-[13px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-t border-slate-50"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                            Checklist
                          </Link>
                          {apt.icalUrl && (
                            <div className="border-t border-slate-50" onClick={() => setOpenMenuId(null)}>
                              <SyncIcalButton apartmentId={apt.id} lastSyncAt={apt.lastSyncAt} />
                            </div>
                          )}
                          <div className="border-t border-slate-100">
                            <DeleteApartmentButton id={apt.id} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

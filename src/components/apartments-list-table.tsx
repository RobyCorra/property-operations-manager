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
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    status: "",
  });

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
      <div className="md:hidden space-y-2">
        {filteredApartments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="inline-block w-4 h-4 rounded-full bg-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nessun risultato trovato</p>
          </div>
        ) : (
          filteredApartments.map((apt) => (
            <div key={apt.id} className="bg-white/40 backdrop-blur-xl rounded-xl border border-white/40 shadow-sm overflow-hidden transition-all duration-200 hover:bg-white/60">
              <div className="p-3 space-y-2">
                {/* Name and Address */}
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-violet-600 shadow-sm border border-slate-100 shrink-0">
                    <span className="inline-block w-4 h-4 rounded-full bg-violet-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 tracking-tight uppercase truncate">{apt.name}</p>
                    <p className="text-[8px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide truncate">{apt.address}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                    <span>{apt.maxGuests} ospiti</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                    <span>{apt.squareMeters} m²</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-600">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                    <span>{apt.bedrooms} letti</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-600">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                    <span>{apt.bathrooms} bagni</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/20">
                  <div className="flex items-center gap-1.5">
                    {apt.icalUrl && (
                      <div className="flex-1">
                        <SyncIcalButton
                          apartmentId={apt.id}
                          lastSyncAt={apt.lastSyncAt}
                        />
                      </div>
                    )}
                    <Link
                      href={`/dashboard/manager/apartments/${apt.id}/products`}
                      className="flex-1 px-2 py-1.5 flex items-center justify-center gap-1 bg-violet-500/5 text-violet-600 text-[7px] font-black uppercase tracking-widest rounded-md hover:bg-violet-500 hover:text-white transition-all border border-violet-500/10"
                    >
                      Prodotti
                    </Link>
                    <Link
                      href={`/dashboard/manager/apartments/${apt.id}/checklist`}
                      className="flex-1 px-2 py-1.5 flex items-center justify-center gap-1 bg-emerald-500/5 text-emerald-600 text-[7px] font-black uppercase tracking-widest rounded-md hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"
                    >
                      Checklist
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/manager/apartments/${apt.id}/edit`}
                      className="flex-1 px-2 py-1.5 flex items-center justify-center gap-1 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100 text-[7px] font-bold uppercase"
                      title="Modifica"
                    >
                      Modifica
                    </Link>
                    <div className="flex-1">
                      <DeleteApartmentButton id={apt.id} />
                    </div>
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

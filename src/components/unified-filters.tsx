"use client";

import React from "react";

export interface FilterField {
  id: string;
  label: string;
  type: "text" | "select" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
}

interface UnifiedFiltersProps {
  title?: string;
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onReset: () => void;
  className?: string;
}

export default function UnifiedFilters({
  title = "Filtri Ricerca",
  fields,
  values,
  onChange,
  onReset,
  className = "",
}: UnifiedFiltersProps) {
  return (
    <div className={`bg-white/40 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl shadow-black/5 space-y-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight uppercase">{title}</h3>
        <button 
          onClick={onReset}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2"
        >
          <span>↺</span> Reset Filtri
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              {field.label}
            </label>
            
            {field.type === "select" ? (
              <select
                className="w-full bg-white/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer text-slate-700 outline-none"
                value={values[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              >
                <option value="">Tutti</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "date" ? (
              <input
                type="date"
                className="w-full bg-white/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 transition-all text-slate-700 outline-none"
                value={values[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            ) : (
              <input
                type="text"
                placeholder={field.placeholder || "Cerca..."}
                className="w-full bg-white/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 transition-all text-slate-700 outline-none"
                value={values[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

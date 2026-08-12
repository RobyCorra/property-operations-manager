"use client";

import { useState } from "react";
import { useLang } from "@/src/components/lang-context";

// Solo le 3 lingue dell'app (la cornice fissa è tradotta in IT/EN/ES).
const LANGS = [
  { code: "it", flag: "🇮🇹", label: "IT" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
];

/** Selettore lingua compatto per l'area operativa (cookie-based via provider). */
export default function OperativeLangPill({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  const current = LANGS.find((l) => l.code === (lang ?? "it")) ?? LANGS[0];

  const triggerClass =
    variant === "light"
      ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
      : "bg-white/20 hover:bg-white/30 text-white";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${triggerClass}`}
      >
        {current.flag} {current.label} ▾
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-8 right-0 z-50 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden min-w-[110px]">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${(lang ?? "it") === l.code ? "text-violet-600" : "text-slate-700"}`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

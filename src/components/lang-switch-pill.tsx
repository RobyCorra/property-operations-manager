"use client";

import { useState } from "react";
import { useLang } from "@/src/components/lang-context";
import { Lang } from "@/src/lib/i18n";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "it", flag: "🇮🇹", label: "IT" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "es", flag: "🇪🇸", label: "ES" },
];

export default function LangSwitchPill() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  if (!lang) return null;

  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <div className="relative inline-block mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1 text-xs font-bold text-white transition-colors"
      >
        {current.flag} {current.label} ▾
      </button>

      {open && (
        <>
          {/* Overlay per chiudere */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-8 left-0 z-50 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden min-w-[110px]">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${lang === l.code ? "text-violet-600" : "text-slate-700"}`}
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

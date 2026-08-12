"use client";

import { useState } from "react";
import { useLang } from "@/src/components/lang-context";
import { LANGUAGE_CATALOG, langFlag } from "@/src/lib/languages";

// Italiano (base) + catalogo. `label` breve per la pillola.
const LANGS = [
  { code: "it", flag: "🇮🇹", label: "IT" },
  ...LANGUAGE_CATALOG.map((l) => ({ code: l.code, flag: l.flag, label: l.code.toUpperCase() })),
];

export default function LangSwitchPill() {
  const { contentLang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  if (!contentLang) return null;

  const currentFlag = langFlag(contentLang);
  const currentLabel = contentLang.toUpperCase();

  return (
    <div className="relative inline-block mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1 text-xs font-bold text-white transition-colors"
      >
        {currentFlag} {currentLabel} ▾
      </button>

      {open && (
        <>
          {/* Overlay per chiudere */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-8 left-0 z-50 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden min-w-[110px] max-h-72 overflow-y-auto">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${contentLang === l.code ? "text-violet-600" : "text-slate-700"}`}
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

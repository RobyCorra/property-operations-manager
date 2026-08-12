"use client";

import { useLang } from "@/src/components/lang-context";
import { LANGUAGE_CATALOG } from "@/src/lib/languages";

// Italiano (lingua base) + tutto il catalogo lingue.
const LANGS = [
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  ...LANGUAGE_CATALOG.map((l) => ({ code: l.code, flag: l.flag, name: l.native })),
];

export default function LangPicker() {
  const { setLang } = useLang();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "linear-gradient(160deg, #4338ca, #7c3aed)" }}
    >
      <div className="text-6xl mb-6">🧹</div>
      <h1 className="text-2xl font-extrabold text-white mb-2 text-center">
        Scegli la tua lingua
      </h1>
      <p className="text-sm text-white/70 mb-10 text-center">
        Choose your language · Elige tu idioma
      </p>
      <div className="w-full max-w-sm flex flex-col gap-3">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className="flex items-center gap-4 bg-white/15 hover:bg-white/25 border border-white/25 rounded-2xl px-5 py-4 transition-colors text-left"
          >
            <span className="text-3xl">{l.flag}</span>
            <span className="text-base font-bold text-white">{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

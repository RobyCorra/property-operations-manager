"use client";

import { useLang } from "@/src/components/lang-context";
import { LANGUAGE_CATALOG } from "@/src/lib/languages";

// Lingue con UI completa: sempre disponibili.
const UI_CODES = ["en", "es"];

export default function LangPicker({ availableExtraLangs = [] }: { availableExtraLangs?: string[] }) {
  const { setLang } = useLang();

  const extra = new Set(availableExtraLangs);
  // Italiano (base) + EN/ES sempre + solo le extra effettivamente tradotte.
  const LANGS = [
    { code: "it", flag: "🇮🇹", name: "Italiano" },
    ...LANGUAGE_CATALOG
      .filter((l) => UI_CODES.includes(l.code) || extra.has(l.code))
      .map((l) => ({ code: l.code, flag: l.flag, name: l.native })),
  ];

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

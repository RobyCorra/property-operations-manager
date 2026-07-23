"use client";

import { useLang } from "@/src/components/lang-context";
import type { Lang } from "@/src/lib/i18n";

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "it", flag: "🇮🇹", label: "Italiano" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];

/** Selettore lingua per l'area manager: cambia il cookie e ricarica la pagina. */
export default function LanguageSelector() {
  const { lang, setLang } = useLang();

  return (
    <div className="grid grid-cols-3 gap-2">
      {LANGS.map((l) => {
        const active = (lang ?? "it") === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-base">{l.flag}</span>
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

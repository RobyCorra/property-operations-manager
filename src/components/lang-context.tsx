"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations, T } from "@/src/lib/i18n";

const STORAGE_KEY = "cleaning_lang";

interface LangContextValue {
  /** Lingua dell'interfaccia (it/en/es). Guida le stringhe UI `t`. */
  lang: Lang | null;
  /**
   * Lingua dei contenuti scelta dall'utente (qualsiasi codice del catalogo:
   * fr, de, ...). Guida le traduzioni delle checklist e delle note. Coincide
   * con `lang` quando l'utente sceglie una delle 3 lingue dell'app.
   */
  contentLang: string | null;
  mounted: boolean;
  setLang: (l: string) => void;
  t: T;
}

const LangContext = createContext<LangContextValue>({
  lang: null,
  contentLang: null,
  mounted: false,
  setLang: () => {},
  t: translations.it,
});

// La lingua UI è una delle 3 supportate; per le lingue "esotiche" ripiega su EN.
function toUiLang(code: string | null): Lang | null {
  if (!code) return null;
  return code in translations ? (code as Lang) : "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  // rawLang = scelta grezza dell'utente (può essere una lingua fuori da it/en/es)
  const [rawLang, setRawLangState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setRawLangState(stored);
    setMounted(true);
  }, []);

  const setLang = (l: string) => {
    setRawLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const lang = toUiLang(rawLang);
  const contentLang = rawLang;
  const t: T = lang ? translations[lang] : translations.it;

  return (
    <LangContext.Provider value={{ lang, contentLang, mounted, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

const MANAGER_LANG_COOKIE = "app_lang";

/**
 * Provider basato su COOKIE (leggibile anche dal server). A differenza di
 * LangProvider (cleaner, localStorage), la lingua vive in un cookie così i
 * server component traducono con getT()/getMaintenanceT() e i client component
 * con useLang() restano allineati. Al cambio lingua ricarica la pagina.
 */
export function CookieLangProvider({
  initialLang,
  cookieName,
  children,
}: {
  initialLang: Lang;
  cookieName: string;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = (l: string) => {
    const next = (l in translations ? l : "it") as Lang;
    setLangState(next);
    document.cookie = `${cookieName}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Ricarica i server component con la nuova lingua
    if (typeof window !== "undefined") window.location.reload();
  };

  const t: T = translations[lang];

  return (
    <LangContext.Provider value={{ lang, contentLang: lang, mounted: true, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

/** Provider per l'area manager (cookie app_lang). */
export function ManagerLangProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  return (
    <CookieLangProvider initialLang={initialLang} cookieName={MANAGER_LANG_COOKIE}>
      {children}
    </CookieLangProvider>
  );
}

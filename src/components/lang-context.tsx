"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations, T } from "@/src/lib/i18n";

const STORAGE_KEY = "cleaning_lang";

interface LangContextValue {
  lang: Lang | null;
  mounted: boolean;
  setLang: (l: Lang) => void;
  t: T;
}

const LangContext = createContext<LangContextValue>({
  lang: null,
  mounted: false,
  setLang: () => {},
  t: translations.it,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && stored in translations) setLangState(stored);
    setMounted(true);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t: T = lang ? translations[lang] : translations.it;

  return (
    <LangContext.Provider value={{ lang, mounted, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

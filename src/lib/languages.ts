// Catalogo lingue disponibili per le traduzioni delle checklist.
// L'italiano è la lingua base (sorgente) e non compare nel catalogo dei target.
// Nota: al momento l'app di manager/cleaner mostra i testi solo in it/en/es;
// le altre lingue vengono tradotte e salvate, ma diventeranno visibili al
// cleaner solo quando estenderemo la lingua dell'app.

export type LangDef = { code: string; flag: string; native: string; english: string };

export const LANGUAGE_CATALOG: LangDef[] = [
  { code: "en", flag: "🇬🇧", native: "English", english: "English" },
  { code: "es", flag: "🇪🇸", native: "Español", english: "Spanish" },
  { code: "fr", flag: "🇫🇷", native: "Français", english: "French" },
  { code: "de", flag: "🇩🇪", native: "Deutsch", english: "German" },
  { code: "pt", flag: "🇵🇹", native: "Português", english: "Portuguese" },
  { code: "ro", flag: "🇷🇴", native: "Română", english: "Romanian" },
  { code: "pl", flag: "🇵🇱", native: "Polski", english: "Polish" },
  { code: "ru", flag: "🇷🇺", native: "Русский", english: "Russian" },
  { code: "uk", flag: "🇺🇦", native: "Українська", english: "Ukrainian" },
  { code: "sq", flag: "🇦🇱", native: "Shqip", english: "Albanian" },
  { code: "ar", flag: "🇸🇦", native: "العربية", english: "Arabic" },
  { code: "zh", flag: "🇨🇳", native: "中文", english: "Chinese" },
  { code: "hi", flag: "🇮🇳", native: "हिन्दी", english: "Hindi" },
  { code: "bn", flag: "🇧🇩", native: "বাংলা", english: "Bengali" },
];

// Nomi inglesi per il prompt di traduzione (gpt-4o rende meglio con il nome esteso).
export const LANG_ENGLISH_NAMES: Record<string, string> = Object.fromEntries([
  ...LANGUAGE_CATALOG.map((l) => [l.code, l.english]),
  ["it", "Italian"],
]);

export function langFlag(code: string): string {
  return LANGUAGE_CATALOG.find((l) => l.code === code)?.flag ?? "🏳️";
}

export function langNative(code: string): string {
  if (code === "it") return "Italiano";
  return LANGUAGE_CATALOG.find((l) => l.code === code)?.native ?? code.toUpperCase();
}

// Lingue dell'app con UI completa: mostrate sempre nel selettore.
const UI_LANGS = new Set(["it", "en", "es"]);

/**
 * Dato l'insieme delle traduzioni (una per voce), ritorna i codici lingua
 * EXTRA (fuori da it/en/es) effettivamente presenti in almeno una voce.
 * Usato per mostrare nel selettore solo le lingue extra realmente tradotte.
 */
export function extraTranslatedLangs(
  itemsTranslations: (Record<string, string> | null | undefined)[]
): string[] {
  const found = new Set<string>();
  for (const tr of itemsTranslations) {
    if (!tr) continue;
    for (const code of Object.keys(tr)) {
      if (!UI_LANGS.has(code) && tr[code]?.trim()) found.add(code);
    }
  }
  // Ordine del catalogo per coerenza
  return LANGUAGE_CATALOG.filter((l) => found.has(l.code)).map((l) => l.code);
}

/**
 * Etichetta nella lingua scelta con fallback: scelta → inglese → master (IT).
 * Se la lingua è italiano (o assente) usa direttamente l'etichetta master.
 */
export function pickLabel(
  label: string,
  translations: Record<string, string> | null | undefined,
  lang: string | null | undefined
): string {
  if (!lang || lang === "it") return label;
  return translations?.[lang] || translations?.en || label;
}

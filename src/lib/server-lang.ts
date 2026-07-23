// next/headers rende questo modulo utilizzabile solo lato server.
import { cookies } from "next/headers";
import { translations, type Lang, type T } from "@/src/lib/i18n";

export const LANG_COOKIE = "app_lang";

/** Lingua scelta dal manager, letta dal cookie (default: italiano). */
export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value && value in translations ? (value as Lang) : "it";
}

/** Dizionario di traduzioni per la lingua corrente, usabile nei server component. */
export async function getT(): Promise<T> {
  const lang = await getServerLang();
  return translations[lang];
}

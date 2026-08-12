// next/headers rende questo modulo utilizzabile solo lato server.
import { cookies } from "next/headers";
import { translations, type Lang, type T } from "@/src/lib/i18n";

export const LANG_COOKIE = "app_lang";
/** Cookie della lingua scelta dal manutentore (area operativa manutenzione). */
export const MAINTENANCE_LANG_COOKIE = "mnt_lang";

async function readLangCookie(cookieName: string): Promise<Lang> {
  const store = await cookies();
  const value = store.get(cookieName)?.value;
  return value && value in translations ? (value as Lang) : "it";
}

/** Lingua scelta dal manager, letta dal cookie (default: italiano). */
export async function getServerLang(): Promise<Lang> {
  return readLangCookie(LANG_COOKIE);
}

/** Dizionario di traduzioni per la lingua corrente, usabile nei server component. */
export async function getT(): Promise<T> {
  const lang = await getServerLang();
  return translations[lang];
}

/** Lingua scelta dal manutentore, letta dal cookie (default: italiano). */
export async function getMaintenanceLang(): Promise<Lang> {
  return readLangCookie(MAINTENANCE_LANG_COOKIE);
}

/** Dizionario di traduzioni per la lingua del manutentore, nei server component. */
export async function getMaintenanceT(): Promise<T> {
  const lang = await getMaintenanceLang();
  return translations[lang];
}

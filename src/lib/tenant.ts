"use server";

/**
 * tenant.ts — helpers per la gestione multi-tenant
 *
 * getCurrentOrg() legge l'organizationId dal cookie settato al login.
 * Non fa query DB: è veloce e senza overhead.
 *
 * In Fase 2b verrà sostituito da next-auth/better-auth session.
 */

import { cookies } from "next/headers";

/**
 * Restituisce l'organizationId dell'utente loggato.
 * Restituisce null se l'utente non è autenticato.
 */
export async function getCurrentOrg(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("organizationId")?.value ?? null;
}

/**
 * Come getCurrentOrg() ma lancia un errore se non autenticato.
 * Da usare nelle pagine/actions dove l'autenticazione è garantita.
 */
export async function requireOrg(): Promise<string> {
  const orgId = await getCurrentOrg();
  if (!orgId) throw new Error("Non autenticato");
  return orgId;
}

/**
 * Restituisce l'userId dell'utente loggato.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value ?? null;
}

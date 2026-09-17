import { cookies } from "next/headers";

// Azione riservata al PROPRIETARIO (manager senza companyId). Blocca i manager
// d'impresa anche se una richiesta arrivasse fuori dal middleware.
export async function assertOwnerManager(): Promise<void> {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER") throw new Error("Non autorizzato.");
  if (c.get("companyId")?.value) throw new Error("Azione riservata al proprietario dell'organizzazione.");
}

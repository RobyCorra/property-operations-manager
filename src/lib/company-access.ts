import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

// Accesso di un manager d'impresa: quali funzioni (scope), quali organizzazioni
// (proprietari) e quali appartamenti può vedere, derivati dagli ingaggi ATTIVI.
export type CompanyAccess = {
  companyId: string;
  companyName: string;
  scopes: string[]; // funzioni delegate attive (union su tutti i clienti)
  orgIds: string[]; // organizzazioni che l'hanno ingaggiata (attive)
  apartmentIds: string[] | null; // null = tutti gli appartamenti delle org; array = solo quelli assegnati
  scopeApartments: Record<string, string[] | null>; // per-scope: null = tutti, array = filtrati
};

export async function getCompanyAccess(): Promise<CompanyAccess | null> {
  const c = await cookies();
  const companyId = c.get("companyId")?.value;
  if (!companyId) return null;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });
  if (!company) return null;

  const engagements = await prisma.engagement.findMany({
    where: { companyId, status: "ACTIVE" },
    select: {
      scope: true,
      organizationId: true,
      apartments: { select: { apartmentId: true } },
    },
  });

  const scopes = [...new Set(engagements.map((e) => e.scope))];
  const orgIds = [...new Set(engagements.map((e) => e.organizationId))];

  // Per-scope apartment filtering
  const scopeApartments: Record<string, string[] | null> = {};
  const allAptIds = new Set<string>();
  let hasAnyFilter = false;

  for (const scope of scopes) {
    const scopeEngs = engagements.filter((e) => e.scope === scope);
    const aptIds: string[] = [];
    let allForScope = false;
    for (const eng of scopeEngs) {
      if (eng.apartments.length === 0) {
        allForScope = true;
      } else {
        eng.apartments.forEach((a) => aptIds.push(a.apartmentId));
      }
    }
    if (allForScope) {
      scopeApartments[scope] = null; // tutti
    } else {
      const unique = [...new Set(aptIds)];
      scopeApartments[scope] = unique;
      unique.forEach((id) => allAptIds.add(id));
      hasAnyFilter = true;
    }
  }

  // Global apartment filter: null if any scope has "all", otherwise union
  const apartmentIds = hasAnyFilter && !Object.values(scopeApartments).some((v) => v === null)
    ? [...allAptIds]
    : null;

  return { companyId, companyName: company.name, scopes, orgIds, apartmentIds, scopeApartments };
}

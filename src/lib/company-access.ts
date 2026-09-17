import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";

// Accesso di un manager d'impresa: quali funzioni (scope) e quali organizzazioni
// (proprietari) può vedere, derivati dagli ingaggi ATTIVI della sua impresa.
export type CompanyAccess = {
  companyId: string;
  companyName: string;
  scopes: string[]; // funzioni delegate attive (union su tutti i clienti)
  orgIds: string[]; // organizzazioni che l'hanno ingaggiata (attive)
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
    select: { scope: true, organizationId: true },
  });

  const scopes = [...new Set(engagements.map((e) => e.scope))];
  const orgIds = [...new Set(engagements.map((e) => e.organizationId))];
  return { companyId, companyName: company.name, scopes, orgIds };
}

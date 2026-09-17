// Costanti e tipi condivisi per le imprese esterne (NON "use server", così
// possono essere importati sia da server actions sia da componenti client).

export const COMPANY_SCOPES = ["CLEANING", "MAINTENANCE", "CHECKIN", "SUPERVISION"] as const;
export type CompanyScope = (typeof COMPANY_SCOPES)[number];

export type ImpreseOverview = {
  companies: { id: string; name: string; vatNumber: string | null; scopes: string[] }[];
  // per ogni scope: chi la gestisce ora (impresa attiva) — null = interno
  handlers: Record<string, { engagementId: string; companyId: string; companyName: string; status: string } | null>;
};

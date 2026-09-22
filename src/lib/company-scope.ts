// Costanti e tipi condivisi per le imprese esterne (NON "use server", così
// possono essere importati sia da server actions sia da componenti client).

export const COMPANY_SCOPES = ["CLEANING", "MAINTENANCE", "CHECKIN", "SUPERVISION"] as const;
export type CompanyScope = (typeof COMPANY_SCOPES)[number];

export type CompanyManager = { id: string; name: string; email: string };

export type EngagementHandler = {
  engagementId: string;
  companyId: string;
  companyName: string;
  status: string;
  apartmentIds: string[]; // vuoto = tutti gli appartamenti dell'org
};

export type ImpreseOverview = {
  companies: {
    id: string;
    name: string;
    vatNumber: string | null;
    scopes: string[];
    managers: CompanyManager[];
  }[];
  apartments: { id: string; name: string }[];
  // per ogni scope: lista delle deleghe attive (vuota = interno)
  handlers: Record<string, EngagementHandler[]>;
};

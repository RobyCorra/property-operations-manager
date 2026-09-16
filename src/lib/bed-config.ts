// Tipi + helper per bedConfig, condivisi tra server (pagine) e client
// (BedLinenEditor). NON è "use client" così è chiamabile anche dal server.

export type BedTypeData = {
  count: number;
  lenzuola: number;
  federe: number;
  copriPiumino: number;
  piumino: number;
};

export type BedConfigData = {
  matrimoniale: BedTypeData;
  singolo: BedTypeData;
  divanoMatrimoniale: BedTypeData;
  divanoSingolo: BedTypeData;
  culla: { lenzuola: number; federe: number; copriPiumino: number; piumino: number };
};

export const DEFAULT_BED_CONFIG: BedConfigData = {
  matrimoniale:       { count: 0, lenzuola: 2, federe: 2, copriPiumino: 2, piumino: 1 },
  singolo:            { count: 0, lenzuola: 1, federe: 1, copriPiumino: 1, piumino: 1 },
  divanoMatrimoniale: { count: 0, lenzuola: 2, federe: 2, copriPiumino: 2, piumino: 1 },
  divanoSingolo:      { count: 0, lenzuola: 2, federe: 1, copriPiumino: 1, piumino: 1 },
  culla:              { lenzuola: 1, federe: 1, copriPiumino: 1, piumino: 1 },
};

// Normalizza un bedConfig grezzo (JSON dal DB o undefined) nel formato completo.
export function parseBedConfig(raw: unknown): BedConfigData {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_BED_CONFIG };
  const r = raw as Record<string, unknown>;
  const num = (x: unknown, d: number) => (typeof x === "number" && !isNaN(x) ? x : d);
  const parseBed = (key: string, def: BedTypeData): BedTypeData => {
    const v = r[key];
    if (!v || typeof v !== "object") return { ...def };
    const o = v as Record<string, unknown>;
    return {
      count: num(o.count, def.count),
      lenzuola: num(o.lenzuola, def.lenzuola),
      federe: num(o.federe, def.federe),
      copriPiumino: num(o.copriPiumino, def.copriPiumino),
      piumino: num(o.piumino, def.piumino),
    };
  };
  const c = r.culla as Record<string, unknown> | undefined;
  return {
    matrimoniale: parseBed("matrimoniale", DEFAULT_BED_CONFIG.matrimoniale),
    singolo: parseBed("singolo", DEFAULT_BED_CONFIG.singolo),
    divanoMatrimoniale: parseBed("divanoMatrimoniale", DEFAULT_BED_CONFIG.divanoMatrimoniale),
    divanoSingolo: parseBed("divanoSingolo", DEFAULT_BED_CONFIG.divanoSingolo),
    culla: {
      lenzuola: num(c?.lenzuola, 1),
      federe: num(c?.federe, 1),
      copriPiumino: num(c?.copriPiumino, 1),
      piumino: num(c?.piumino, 1),
    },
  };
}

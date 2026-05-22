export type BedTypeConfig = {
  count: number;
  lenzuola: number;
  federe: number;
  copriPiumino: number;
};

export type BedConfig = {
  matrimoniale:       BedTypeConfig;
  singolo:            BedTypeConfig;
  divanoMatrimoniale: BedTypeConfig;
  divanoSingolo:      BedTypeConfig;
  culla:              { lenzuola: number; federe: number; copriPiumino: number };
};

export type LinenResult = {
  lenzuola:     number;
  federe:       number;
  copriPiumino: number;
};

export type LinenCalculation = {
  // letti attivati con i loro totali di biancheria
  beds: {
    key: string;
    label: string;
    icon: string;
    count: number;      // n° letti attivati
    capacity: number;   // posti coperti
    isFixed: boolean;
    isActivated: boolean; // divano attivato
    linen: LinenResult;
  }[];
  adults: LinenResult;
  culla: LinenResult | null;
};

export const DEFAULT_BED_CONFIG: BedConfig = {
  matrimoniale:       { count: 0, lenzuola: 2, federe: 2, copriPiumino: 2 },
  singolo:            { count: 0, lenzuola: 1, federe: 1, copriPiumino: 1 },
  divanoMatrimoniale: { count: 0, lenzuola: 2, federe: 2, copriPiumino: 2 },
  divanoSingolo:      { count: 0, lenzuola: 2, federe: 1, copriPiumino: 1 },
  culla:              {           lenzuola: 1, federe: 1, copriPiumino: 1 },
};

function parseBedConfig(raw: unknown): BedConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_BED_CONFIG;
  const r = raw as Record<string, unknown>;

  const parseBedType = (key: string, defaults: BedTypeConfig): BedTypeConfig => {
    const v = r[key];
    if (!v || typeof v !== "object") return defaults;
    const b = v as Record<string, unknown>;
    return {
      count:        typeof b.count === "number"        ? b.count        : defaults.count,
      lenzuola:     typeof b.lenzuola === "number"     ? b.lenzuola     : defaults.lenzuola,
      federe:       typeof b.federe === "number"       ? b.federe       : defaults.federe,
      copriPiumino: typeof b.copriPiumino === "number" ? b.copriPiumino : defaults.copriPiumino,
    };
  };

  const cRaw = r["culla"];
  const cDef = DEFAULT_BED_CONFIG.culla;
  const culla = cRaw && typeof cRaw === "object"
    ? {
        lenzuola:     typeof (cRaw as Record<string,unknown>).lenzuola === "number"     ? (cRaw as Record<string,unknown>).lenzuola as number : cDef.lenzuola,
        federe:       typeof (cRaw as Record<string,unknown>).federe === "number"       ? (cRaw as Record<string,unknown>).federe as number   : cDef.federe,
        copriPiumino: typeof (cRaw as Record<string,unknown>).copriPiumino === "number" ? (cRaw as Record<string,unknown>).copriPiumino as number : cDef.copriPiumino,
      }
    : cDef;

  return {
    matrimoniale:       parseBedType("matrimoniale",       DEFAULT_BED_CONFIG.matrimoniale),
    singolo:            parseBedType("singolo",            DEFAULT_BED_CONFIG.singolo),
    divanoMatrimoniale: parseBedType("divanoMatrimoniale", DEFAULT_BED_CONFIG.divanoMatrimoniale),
    divanoSingolo:      parseBedType("divanoSingolo",      DEFAULT_BED_CONFIG.divanoSingolo),
    culla,
  };
}

function addLinen(a: LinenResult, b: LinenResult): LinenResult {
  return {
    lenzuola:     a.lenzuola + b.lenzuola,
    federe:       a.federe + b.federe,
    copriPiumino: a.copriPiumino + b.copriPiumino,
  };
}

export function calculateLinen(
  rawBedConfig: unknown,
  totalGuests: number,
  cullaRequested: boolean,
): LinenCalculation {
  const cfg = parseBedConfig(rawBedConfig);

  const beds: LinenCalculation["beds"] = [];
  let remaining = totalGuests;
  let adultLinen: LinenResult = { lenzuola: 0, federe: 0, copriPiumino: 0 };

  // ── LETTI FISSI ──
  const fixed = [
    { key: "matrimoniale",       label: "Letto matrimoniale",  icon: "🛏", capacity: 2, cfg: cfg.matrimoniale },
    { key: "singolo",            label: "Letto singolo",       icon: "🛏", capacity: 1, cfg: cfg.singolo },
  ];

  for (const f of fixed) {
    if (f.cfg.count === 0) continue;
    const placed = Math.min(f.cfg.count, remaining > 0 ? f.cfg.count : 0);
    const covered = placed * f.capacity;
    const linen: LinenResult = {
      lenzuola:     placed * f.cfg.lenzuola,
      federe:       placed * f.cfg.federe,
      copriPiumino: placed * f.cfg.copriPiumino,
    };
    beds.push({ key: f.key, label: f.label, icon: f.icon, count: placed, capacity: covered, isFixed: true, isActivated: false, linen });
    adultLinen = addLinen(adultLinen, linen);
    remaining -= covered;
  }

  // ── LETTI AGGIUNTIVI (divani) ──
  const optional = [
    { key: "divanoMatrimoniale", label: "Divano letto matrimoniale", icon: "🛋", capacity: 2, cfg: cfg.divanoMatrimoniale },
    { key: "divanoSingolo",      label: "Divano letto singolo",      icon: "🛋", capacity: 1, cfg: cfg.divanoSingolo },
  ];

  for (const o of optional) {
    if (o.cfg.count === 0 || remaining <= 0) continue;
    // quanti divani servono per coprire i rimanenti
    const needed = Math.ceil(remaining / o.capacity);
    const activated = Math.min(needed, o.cfg.count);
    const covered = activated * o.capacity;
    const linen: LinenResult = {
      lenzuola:     activated * o.cfg.lenzuola,
      federe:       activated * o.cfg.federe,
      copriPiumino: activated * o.cfg.copriPiumino,
    };
    beds.push({ key: o.key, label: o.label, icon: o.icon, count: activated, capacity: covered, isFixed: false, isActivated: true, linen });
    adultLinen = addLinen(adultLinen, linen);
    remaining -= covered;
  }

  // ── CULLA ──
  const cullaLinen: LinenResult | null = cullaRequested
    ? { lenzuola: cfg.culla.lenzuola, federe: cfg.culla.federe, copriPiumino: cfg.culla.copriPiumino }
    : null;

  return { beds, adults: adultLinen, culla: cullaLinen };
}

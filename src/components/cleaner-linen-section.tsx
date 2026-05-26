"use client";

import LinenSection from "@/src/components/linen-section";

interface LinenResult {
  lenzuola: number;
  federe: number;
  copriPiumino: number;
}

interface Props {
  towels: number | null;
  bathMats: number;
  nextGuestCount: number | null;
  linen: LinenResult | null;
  cullaLinen: LinenResult | null;
  noBookingText: string; // testo da mostrare se non c'è prenotazione — ma gestito in LinenSection
}

/**
 * Thin wrapper client component che permette di usare LinenSection
 * (che chiama useLang()) all'interno della dashboard server-rendered del cleaner.
 */
export default function CleanerLinenSection({ towels, bathMats, nextGuestCount, linen, cullaLinen }: Props) {
  return (
    <LinenSection
      towels={towels}
      bathMats={bathMats}
      nextGuestCount={nextGuestCount}
      linen={linen}
      cullaLinen={cullaLinen}
    />
  );
}

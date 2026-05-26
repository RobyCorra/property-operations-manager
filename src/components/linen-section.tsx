"use client";

import { useLang } from "@/src/components/lang-context";

interface LinenResult {
  lenzuola: number;
  federe: number;
  copriPiumino: number;
}

interface Props {
  towels?: number | null;
  bathMats?: number | null;
  nextGuestCount?: number | null;
  linen?: LinenResult | null;
  cullaLinen?: LinenResult | null;
}

/**
 * Sezione biancheria tradotta — usata sia nella versione token (/pulizia/[token])
 * che nella dashboard login cleaner. Richiede LangProvider nel tree.
 */
export default function LinenSection({ towels, bathMats, nextGuestCount, linen, cullaLinen }: Props) {
  const { t } = useLang();

  if (towels == null && bathMats == null && linen == null) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Asciugamani + Tappetini */}
      {(towels != null || bathMats != null) && (
        <div className="grid grid-cols-2 gap-2">
          {towels != null && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">🛁</div>
              <div className="text-3xl font-black text-blue-700 leading-none">{towels}</div>
              <div className="text-[9px] font-black uppercase tracking-wider text-blue-600 mt-1">
                {t.towelsLabel}
              </div>
              {nextGuestCount != null && (
                <div className="text-[9px] text-blue-400 mt-0.5">{t.towelsSub(nextGuestCount)}</div>
              )}
            </div>
          )}
          {bathMats != null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">🟩</div>
              <div className="text-3xl font-black text-emerald-700 leading-none">{bathMats}</div>
              <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600 mt-1">
                {t.bathMatsLabel}
              </div>
              <div className="text-[9px] text-emerald-400 mt-0.5">{t.bathMatsSub}</div>
            </div>
          )}
        </div>
      )}

      {/* Totale biancheria adulti */}
      {linen != null && (
        <div className="bg-slate-900 rounded-2xl p-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {nextGuestCount != null ? t.totalBedsLabel(nextGuestCount) : "🛏 Totale letti"}
          </span>
          <div className="flex gap-2">
            {[
              { v: linen.lenzuola,     l: t.sheetsLabel },
              { v: linen.federe,       l: t.pillowcasesLabel },
              { v: linen.copriPiumino, l: t.duvetLabel },
            ].map(({ v, l }) => (
              <div key={l} className="bg-slate-800 rounded-xl px-3 py-1.5 text-center">
                <div className="text-lg font-black text-white">{v}</div>
                <div className="text-[8px] text-slate-500 uppercase">{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Culla */}
      {cullaLinen != null && (
        <div className="bg-emerald-900 rounded-2xl p-3 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
            {t.cullaLabel}
          </span>
          <div className="flex gap-2">
            {[
              { v: cullaLinen.lenzuola,     l: t.sheetsLabel },
              { v: cullaLinen.federe,       l: t.pillowcasesLabel },
              { v: cullaLinen.copriPiumino, l: t.duvetLabel },
            ].map(({ v, l }) => (
              <div key={l} className="bg-emerald-800 rounded-xl px-3 py-1.5 text-center">
                <div className="text-lg font-black text-white">{v}</div>
                <div className="text-[8px] text-emerald-500 uppercase">{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

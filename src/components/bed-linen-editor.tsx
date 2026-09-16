"use client";

import { useLang } from "@/src/components/lang-context";
import type { BedConfigData, BedTypeData } from "@/src/lib/bed-config";

export type { BedConfigData, BedTypeData } from "@/src/lib/bed-config";

type FixedKey = "matrimoniale" | "singolo" | "divanoMatrimoniale" | "divanoSingolo";

export default function BedLinenEditor({
  value,
  onChange,
  showTitle = true,
}: {
  value: BedConfigData;
  onChange: (next: BedConfigData) => void;
  showTitle?: boolean;
}) {
  const { t } = useLang();

  const setBed = (key: FixedKey, patch: Partial<BedTypeData>) =>
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  const setCulla = (patch: Partial<BedConfigData["culla"]>) =>
    onChange({ ...value, culla: { ...value.culla, ...patch } });

  const linenInput = (val: number, on: (n: number) => void, color: "indigo" | "emerald") => (
    <input
      type="number" min="0" value={val}
      onChange={(e) => on(+e.target.value)}
      className={`w-16 text-center border rounded-lg py-1.5 text-sm font-bold outline-none focus:ring-2 ${
        color === "indigo"
          ? "border-indigo-200 text-indigo-700 bg-indigo-50 focus:ring-indigo-300"
          : "border-emerald-200 text-emerald-700 bg-emerald-50 focus:ring-emerald-300"
      }`}
    />
  );

  const bedRow = (key: FixedKey, label: string, icon: string, note: string, ring: string) => (
    <tr key={key} className="hover:bg-gray-50/50">
      <td className="py-2 pr-4">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>{icon}</span>{label}
          <span className="text-[10px] text-gray-400">({note})</span>
        </span>
      </td>
      <td className="py-2 px-2 text-center">
        <input type="number" min="0" value={value[key].count}
          onChange={(e) => setBed(key, { count: +e.target.value })}
          className={`w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-bold outline-none focus:ring-2 ${ring}`} />
      </td>
      <td className="w-3 text-gray-200 text-center">│</td>
      <td className="py-2 px-2 text-center">{linenInput(value[key].lenzuola, (n) => setBed(key, { lenzuola: n }), "indigo")}</td>
      <td className="py-2 px-2 text-center">{linenInput(value[key].federe, (n) => setBed(key, { federe: n }), "indigo")}</td>
      <td className="py-2 px-2 text-center">{linenInput(value[key].copriPiumino, (n) => setBed(key, { copriPiumino: n }), "indigo")}</td>
      <td className="py-2 px-2 text-center">{linenInput(value[key].piumino, (n) => setBed(key, { piumino: n }), "indigo")}</td>
    </tr>
  );

  return (
    <div className="space-y-4 pt-2">
      {showTitle && <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{t.afBedsLinen}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 pb-2 pr-4">{t.afType}</th>
              <th className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 pb-2 px-2 w-20">{t.afNumBeds}</th>
              <th className="w-3"></th>
              <th className="text-center text-[10px] font-bold uppercase tracking-widest text-indigo-400 pb-2 px-2 w-24">{t.afSheets}</th>
              <th className="text-center text-[10px] font-bold uppercase tracking-widest text-indigo-400 pb-2 px-2 w-24">{t.afPillowcases}</th>
              <th className="text-center text-[10px] font-bold uppercase tracking-widest text-indigo-400 pb-2 px-2 w-28">{t.afDuvet}</th>
              <th className="text-center text-[10px] font-bold uppercase tracking-widest text-indigo-400 pb-2 px-2 w-24">{t.afDuvetItem}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr><td colSpan={7} className="pt-3 pb-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{t.afFixedBeds}</span>
            </td></tr>
            {bedRow("matrimoniale", t.bedDouble, "🛏", t.bed2Places, "focus:ring-blue-300")}
            {bedRow("singolo", t.bedSingle, "🛏", t.bed1Place, "focus:ring-blue-300")}

            <tr><td colSpan={7} className="pt-4 pb-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 px-3 py-1 rounded-full">{t.afExtraBeds}</span>
            </td></tr>
            {bedRow("divanoMatrimoniale", t.bedSofaDouble, "🛋", t.bed2Places, "focus:ring-amber-300")}
            {bedRow("divanoSingolo", t.bedSofaSingle, "🛋", t.bed1Place, "focus:ring-amber-300")}

            <tr><td colSpan={7} className="pt-4 pb-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{t.afCot}</span>
            </td></tr>
            <tr className="hover:bg-gray-50/50">
              <td className="py-2 pr-4">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700"><span>🪺</span>{t.afCotWord}</span>
              </td>
              <td className="py-2 px-2 text-center text-xs text-gray-400 italic">{t.afFromBooking}</td>
              <td className="w-3 text-gray-200 text-center">│</td>
              <td className="py-2 px-2 text-center">{linenInput(value.culla.lenzuola, (n) => setCulla({ lenzuola: n }), "emerald")}</td>
              <td className="py-2 px-2 text-center">{linenInput(value.culla.federe, (n) => setCulla({ federe: n }), "emerald")}</td>
              <td className="py-2 px-2 text-center">{linenInput(value.culla.copriPiumino, (n) => setCulla({ copriPiumino: n }), "emerald")}</td>
              <td className="py-2 px-2 text-center">{linenInput(value.culla.piumino, (n) => setCulla({ piumino: n }), "emerald")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

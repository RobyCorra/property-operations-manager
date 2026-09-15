"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/src/components/lang-context";
import type { StructureInput } from "@/src/app/actions/structure";

type BedCounts = {
  matrimoniale: number;
  singolo: number;
  divanoMatrimoniale: number;
  divanoSingolo: number;
};

type CategoryDraft = {
  key: string;
  name: string;
  squareMeters: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  beds: BedCounts;
  numbersText: string;
};

type Props = {
  action: (input: StructureInput) => Promise<
    { success: true; propertyId: string; totalUnits: number } | { success: false; error?: string }
  >;
};

const emptyBeds: BedCounts = { matrimoniale: 0, singolo: 0, divanoMatrimoniale: 0, divanoSingolo: 0 };

function newCategory(): CategoryDraft {
  return {
    key: Math.random().toString(36).slice(2),
    name: "",
    squareMeters: 0,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    beds: { ...emptyBeds, matrimoniale: 1 },
    numbersText: "",
  };
}

function parseNumbers(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[,\n;]+/)) {
    const n = raw.trim();
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

// Converte i conteggi letti nel bedConfig usato dal calcolatore biancheria,
// con valori standard di lenzuola/federe/copriPiumino/piumino (rifinibili poi
// sul master della categoria).
function bedsToConfig(beds: BedCounts) {
  const std = (count: number, federe: number) => ({
    count,
    lenzuola: count > 0 ? 1 : 0,
    federe: count > 0 ? federe : 0,
    copriPiumino: count > 0 ? 1 : 0,
    piumino: count > 0 ? 1 : 0,
  });
  return {
    matrimoniale: std(beds.matrimoniale, 2),
    singolo: std(beds.singolo, 1),
    divanoMatrimoniale: std(beds.divanoMatrimoniale, 2),
    divanoSingolo: std(beds.divanoSingolo, 1),
    culla: { lenzuola: 1, federe: 1, copriPiumino: 1, piumino: 1 },
  };
}

export default function StructureCreateWizard({ action }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [type, setType] = useState<"HOTEL" | "RESIDENCE">("RESIDENCE");
  const [address, setAddress] = useState("");
  const [categories, setCategories] = useState<CategoryDraft[]>([newCategory()]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalUnits = useMemo(
    () => categories.reduce((sum, c) => sum + parseNumbers(c.numbersText).length, 0),
    [categories],
  );

  const updateCat = (key: string, patch: Partial<CategoryDraft>) =>
    setCategories((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const updateBeds = (key: string, patch: Partial<BedCounts>) =>
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, beds: { ...c.beds, ...patch } } : c)),
    );

  const step1Valid = name.trim() && address.trim();
  const step2Valid =
    categories.length > 0 &&
    categories.every((c) => c.name.trim() && parseNumbers(c.numbersText).length > 0);

  const duplicateNumber = useMemo(() => {
    const seen = new Set<string>();
    for (const c of categories) {
      for (const n of parseNumbers(c.numbersText)) {
        if (seen.has(n)) return n;
        seen.add(n);
      }
    }
    return null;
  }, [categories]);

  const submit = () => {
    setError(null);
    if (duplicateNumber) {
      setError(t.stDupNumber(duplicateNumber));
      return;
    }
    const input: StructureInput = {
      name: name.trim(),
      type,
      address: address.trim(),
      categories: categories.map((c) => ({
        name: c.name.trim(),
        squareMeters: c.squareMeters,
        bedrooms: c.bedrooms,
        bathrooms: c.bathrooms,
        maxGuests: c.maxGuests,
        bedConfig: bedsToConfig(c.beds),
        unitNumbers: parseNumbers(c.numbersText),
      })),
    };
    startTransition(() => {
      void action(input).then((result) => {
        if (result.success) {
          router.push("/dashboard/manager/apartments");
          router.refresh();
        } else {
          setError(result.error || t.stGenerating);
        }
      });
    });
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";
  const numCls =
    "w-full rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm text-center text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step >= s ? "bg-violet-500 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {s}
            </span>
            <span className={step === s ? "text-gray-900" : "text-gray-400"}>
              {s === 1 ? t.stStepStructure : s === 2 ? t.stStepCategories : t.stStepSummary}
            </span>
            {s < 3 && <span className="mx-1 h-px w-6 bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <label className={labelCls}>{t.stStructureName}</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Residence Sole" />
          </div>
          <div>
            <label className={labelCls}>{t.stType}</label>
            <div className="flex gap-2">
              {(["RESIDENCE", "HOTEL"] as const).map((ty) => (
                <button
                  key={ty}
                  type="button"
                  onClick={() => setType(ty)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                    type === ty
                      ? "border-violet-400 bg-violet-50 text-violet-700"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {ty === "RESIDENCE" ? t.stResidence : t.stHotel}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>{t.stAddressUnique}</label>
            <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Via Roma 10, Roma" />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {t.stNext}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {categories.map((c, idx) => {
            const nums = parseNumbers(c.numbersText);
            return (
              <div key={c.key} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{t.stCategoryN(idx + 1)}</span>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCategories((prev) => prev.filter((x) => x.key !== c.key))}
                      className="text-xs font-medium text-red-500"
                    >
                      {t.stRemove}
                    </button>
                  )}
                </div>
                <div>
                  <label className={labelCls}>{t.stCatNameMaster}</label>
                  <input className={inputCls} value={c.name} onChange={(e) => updateCat(c.key, { name: e.target.value })} placeholder="Camera doppia standard" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className={labelCls}>{t.stSqm}</label>
                    <input type="number" min={0} className={numCls} value={c.squareMeters || ""} onChange={(e) => updateCat(c.key, { squareMeters: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className={labelCls}>{t.stRooms}</label>
                    <input type="number" min={0} className={numCls} value={c.bedrooms} onChange={(e) => updateCat(c.key, { bedrooms: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className={labelCls}>{t.stBaths}</label>
                    <input type="number" min={0} className={numCls} value={c.bathrooms} onChange={(e) => updateCat(c.key, { bathrooms: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className={labelCls}>{t.stGuests}</label>
                    <input type="number" min={1} className={numCls} value={c.maxGuests} onChange={(e) => updateCat(c.key, { maxGuests: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t.stBeds}</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {([
                      ["matrimoniale", t.stBedDouble],
                      ["singolo", t.stBedSingle],
                      ["divanoMatrimoniale", t.stSofaDouble],
                      ["divanoSingolo", t.stSofaSingle],
                    ] as const).map(([k, lbl]) => (
                      <div key={k}>
                        <span className="mb-1 block text-[11px] text-gray-400">{lbl}</span>
                        <input
                          type="number"
                          min={0}
                          className={numCls}
                          value={c.beds[k]}
                          onChange={(e) => updateBeds(c.key, { [k]: parseInt(e.target.value) || 0 } as Partial<BedCounts>)}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">{t.stLinenStd}</p>
                </div>
                <div>
                  <label className={labelCls}>{t.stUnitNumbers}</label>
                  <input className={inputCls} value={c.numbersText} onChange={(e) => updateCat(c.key, { numbersText: e.target.value })} placeholder="101, 102, 103, 104, 105" />
                  <p className="mt-1 text-[11px] text-gray-500">{t.stUnitsColon(nums.length, nums.join(", "))}</p>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setCategories((prev) => [...prev, newCategory()])}
            className="w-full rounded-2xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500"
          >
            {t.stAddCategory}
          </button>

          {duplicateNumber && (
            <p className="text-sm text-red-500">{t.stDupNumber(duplicateNumber)}</p>
          )}

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="rounded-full border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600">
              {t.stBack}
            </button>
            <button
              type="button"
              disabled={!step2Valid || !!duplicateNumber}
              onClick={() => setStep(3)}
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {t.stNext}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-lg font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{type === "HOTEL" ? t.stHotel : t.stResidence} · {address}</p>
            <div className="mt-4 space-y-3">
              {categories.map((c) => {
                const nums = parseNumbers(c.numbersText);
                return (
                  <div key={c.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{c.name || "—"}</span>
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">×{nums.length}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{t.stCatSummary(c.squareMeters, c.bedrooms, c.bathrooms, c.maxGuests, nums.length)}</p>
                    <p className="mt-1 text-xs text-gray-400">{nums.join(", ")}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm font-medium text-gray-700">{t.stWillCreate(totalUnits)}</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} disabled={isPending} className="rounded-full border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600">
              {t.stBack}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending || totalUnits === 0}
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {isPending ? t.stGenerating : t.stGenerate(totalUnits)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

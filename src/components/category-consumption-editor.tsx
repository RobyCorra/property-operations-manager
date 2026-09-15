"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateCategoryConsumption } from "@/src/app/actions/property-product";

type Product = { id: string; name: string; emoji: string; unit: string };

export default function CategoryConsumptionEditor({
  categoryId,
  propertyId,
  products,
  initial,
}: {
  categoryId: string;
  propertyId: string;
  products: Product[];
  initial: Record<string, number>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [map, setMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const p of products) m[p.id] = String(initial[p.id] ?? 0);
    return m;
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(false);
    const payload: Record<string, number> = {};
    for (const [k, v] of Object.entries(map)) payload[k] = parseInt(v) || 0;
    startTransition(() => {
      void updateCategoryConsumption(categoryId, payload).then((r) => {
        if (r.success) { setSaved(true); router.refresh(); }
        else alert(r.error || "Errore");
      });
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold text-slate-900">Consumi al check-in</h2>
      <p className="mb-3 text-[12px] text-slate-400">Quanto consuma un&apos;unità di questa categoria dallo stock struttura ad ogni check-in.</p>

      {products.length === 0 ? (
        <p className="text-xs text-gray-400">
          Nessun prodotto struttura. Aggiungili nella{" "}
          <Link href={`/dashboard/manager/strutture/${propertyId}`} className="font-medium text-violet-600">pagina struttura</Link>.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                <span className="text-lg">{p.emoji}</span>
                <span className="flex-1 text-sm text-slate-700">{p.name}</span>
                <input
                  type="number"
                  min={0}
                  className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-violet-400 focus:outline-none"
                  value={map[p.id] ?? "0"}
                  onChange={(e) => { setMap((m) => ({ ...m, [p.id]: e.target.value })); setSaved(false); }}
                />
                <span className="w-10 text-[11px] text-gray-400">{p.unit}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-end gap-3">
            {saved && <span className="text-xs font-medium text-emerald-600">Salvato ✓</span>}
            <button type="button" onClick={save} disabled={isPending} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">
              {isPending ? "Salvo…" : "Salva consumi"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

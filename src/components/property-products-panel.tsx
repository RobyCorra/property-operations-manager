"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/src/components/lang-context";
import {
  createPropertyProduct,
  updatePropertyProduct,
  deletePropertyProduct,
  restockPropertyProduct,
} from "@/src/app/actions/property-product";

type Product = {
  id: string;
  name: string;
  emoji: string;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
  vat: number;
};

export default function PropertyProductsPanel({ propertyId, initialProducts }: { propertyId: string; initialProducts: Product[] }) {
  const { t } = useLang();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [draft, setDraft] = useState({ name: "", emoji: "📦", unit: "pz", stock: "0", minStock: "0", price: "0", vat: "22" });

  const refresh = () => router.refresh();
  const run = (fn: () => Promise<{ success: boolean; error?: string }>) =>
    startTransition(() => {
      void fn().then((r) => {
        if (r.success) refresh();
        else alert(r.error || "Errore");
      });
    });

  const inp = "rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-violet-400 focus:outline-none";

  const saveNew = () => {
    run(() =>
      createPropertyProduct(propertyId, {
        name: draft.name,
        emoji: draft.emoji,
        unit: draft.unit,
        stock: parseInt(draft.stock) || 0,
        minStock: parseInt(draft.minStock) || 0,
        price: parseFloat(draft.price) || 0,
        vat: parseFloat(draft.vat) || 22,
      }),
    );
    setAdding(false);
    setDraft({ name: "", emoji: "📦", unit: "pz", stock: "0", minStock: "0", price: "0", vat: "22" });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{t.stStructureProducts} <span className="font-normal text-slate-400">{t.stStockUnique}</span></h2>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-600">
            {t.stAddProductBtn}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {initialProducts.length === 0 && !adding && <p className="text-xs text-gray-400">{t.stNoProductsAdd}</p>}

        {initialProducts.map((p) =>
          editingId === p.id ? (
            <EditRow key={p.id} product={p} inp={inp} disabled={isPending}
              onCancel={() => setEditingId(null)}
              onSave={(d) => { run(() => updatePropertyProduct(p.id, d)); setEditingId(null); }}
            />
          ) : (
            <div key={p.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className={`text-[11px] ${p.stock <= p.minStock ? "text-red-500 font-semibold" : "text-slate-400"}`}>
                    {p.stock} {p.unit} · min {p.minStock}{p.stock <= p.minStock ? ` · ${t.stBelowStock}` : ""} · € {p.price.toFixed(2)} + IVA {p.vat}%
                  </p>
                </div>
                <button type="button" onClick={() => { setRestockId(restockId === p.id ? null : p.id); setRestockQty(""); }} className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600">{t.stRestock}</button>
                <button type="button" onClick={() => setEditingId(p.id)} className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white">{t.stEdit}</button>
                <button type="button" onClick={() => { if (confirm(t.stDeleteProductConfirm(p.name))) run(() => deletePropertyProduct(p.id)); }} className="rounded-lg bg-red-500/10 px-2 py-1.5 text-[11px] font-semibold text-red-600">✕</button>
              </div>
              {restockId === p.id && (
                <div className="mt-2 flex items-center gap-2">
                  <input className={inp + " w-24"} type="number" placeholder="+/- qty" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} />
                  <button type="button" disabled={isPending} onClick={() => { const q = parseInt(restockQty); if (!isNaN(q) && q !== 0) { run(() => restockPropertyProduct(p.id, q)); } setRestockId(null); }} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white">{t.stApply}</button>
                </div>
              )}
            </div>
          ),
        )}

        {adding && (
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-3 space-y-2">
            <div className="flex gap-2">
              <input className={inp + " w-12 text-center"} value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} />
              <input className={inp + " flex-1"} placeholder={t.stProductName} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <input className={inp + " w-16"} placeholder={t.stUnitField} value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="text-[11px] text-gray-500">{t.stStock}<input className={inp + " w-full"} type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} /></label>
              <label className="text-[11px] text-gray-500">{t.stMin}<input className={inp + " w-full"} type="number" value={draft.minStock} onChange={(e) => setDraft({ ...draft, minStock: e.target.value })} /></label>
              <label className="text-[11px] text-gray-500">{t.stPrice}<input className={inp + " w-full"} type="number" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></label>
              <label className="text-[11px] text-gray-500">{t.stVat}<input className={inp + " w-full"} type="number" value={draft.vat} onChange={(e) => setDraft({ ...draft, vat: e.target.value })} /></label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAdding(false)} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600">{t.stCancel}</button>
              <button type="button" disabled={isPending || !draft.name.trim()} onClick={saveNew} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{t.stAdd}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditRow({ product, inp, disabled, onCancel, onSave }: {
  product: Product; inp: string; disabled: boolean;
  onCancel: () => void; onSave: (d: { name: string; emoji: string; unit: string; minStock: number; price: number; vat: number }) => void;
}) {
  const { t } = useLang();
  const [d, setD] = useState({ name: product.name, emoji: product.emoji, unit: product.unit, minStock: String(product.minStock), price: String(product.price), vat: String(product.vat) });
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-3 space-y-2">
      <div className="flex gap-2">
        <input className={inp + " w-12 text-center"} value={d.emoji} onChange={(e) => setD({ ...d, emoji: e.target.value })} />
        <input className={inp + " flex-1"} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
        <input className={inp + " w-16"} value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-[11px] text-gray-500">{t.stMin}<input className={inp + " w-full"} type="number" value={d.minStock} onChange={(e) => setD({ ...d, minStock: e.target.value })} /></label>
        <label className="text-[11px] text-gray-500">{t.stPrice}<input className={inp + " w-full"} type="number" step="0.01" value={d.price} onChange={(e) => setD({ ...d, price: e.target.value })} /></label>
        <label className="text-[11px] text-gray-500">{t.stVat}<input className={inp + " w-full"} type="number" value={d.vat} onChange={(e) => setD({ ...d, vat: e.target.value })} /></label>
      </div>
      <p className="text-[11px] text-gray-400">{t.stStockEditHint}</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600">{t.stCancel}</button>
        <button type="button" disabled={disabled || !d.name.trim()} onClick={() => onSave({ name: d.name, emoji: d.emoji, unit: d.unit, minStock: parseInt(d.minStock) || 0, price: parseFloat(d.price) || 0, vat: parseFloat(d.vat) || 22 })} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{t.stSave}</button>
      </div>
    </div>
  );
}

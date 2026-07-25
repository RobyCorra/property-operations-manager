"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/src/components/lang-context";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
  type ProductFormData,
} from "@/src/app/actions/product";

type Product = {
  id: string;
  name: string;
  emoji: string;
  unit: string;
  stock: number;
  minStock: number;
  consumptionType: string;
  consumptionValue: number;
};

type Props = {
  apartmentId: string;
  initialProducts: Product[];
  nextGuestCount?: number | null;
};

const UNITS = ["pz", "flaconi", "rotoli", "litri", "gr", "kg", "bustine"];

const EMPTY_FORM: ProductFormData = {
  name: "",
  emoji: "📦",
  unit: "pz",
  stock: 0,
  minStock: 0,
  consumptionType: "STATIC",
  consumptionValue: 1,
};

function getStatus(stock: number, minStock: number) {
  if (stock <= 0) return "empty";
  if (stock <= minStock) return "critical";
  if (stock <= minStock * 1.5) return "low";
  return "ok";
}

function StatusBadge({ stock, minStock }: { stock: number; minStock: number }) {
  const { t } = useLang();
  const status = getStatus(stock, minStock);
  if (status === "empty")
    return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase">{t.pdEmpty}</span>;
  if (status === "critical")
    return <span className="px-2.5 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase">{t.pdCritical}</span>;
  if (status === "low")
    return <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-full uppercase">{t.pdLowBadge}</span>;
  return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full uppercase">✅ OK</span>;
}

function ProductCard({
  product,
  nextGuestCount,
  onEdit,
  onRestock,
  onDelete,
}: {
  product: Product;
  nextGuestCount?: number | null;
  onEdit: (p: Product) => void;
  onRestock: (p: Product) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLang();
  const status = getStatus(product.stock, product.minStock);
  const barPct = product.minStock > 0
    ? Math.min(100, Math.round((product.stock / (product.minStock * 2)) * 100))
    : product.stock > 0 ? 100 : 0;

  const preview =
    nextGuestCount != null
      ? product.consumptionType === "DYNAMIC_PER_GUEST"
        ? Math.ceil(product.consumptionValue * nextGuestCount)
        : product.consumptionValue
      : null;

  const stockAfterPreview = preview != null ? Math.max(0, product.stock - preview) : null;
  const willAlert = stockAfterPreview != null && stockAfterPreview <= product.minStock;

  const borderColor =
    status === "empty" || status === "critical"
      ? "border-red-200"
      : status === "low"
      ? "border-amber-200"
      : "border-slate-100";

  return (
    <div className={`bg-white rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-lg">
            {product.emoji}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              {product.unit} · {product.consumptionType === "STATIC" ? t.pdConsStaticShort : t.pdConsDynamicShort}
            </p>
          </div>
        </div>
            <StatusBadge stock={product.stock} minStock={product.minStock} />
      </div>

      {/* Quantità */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 mx-5 mb-3 rounded-xl overflow-hidden text-center">
        <div className="bg-white py-4">
          <p className={`text-3xl font-black ${status === "critical" || status === "empty" ? "text-red-500" : status === "low" ? "text-amber-500" : "text-slate-900"}`}>
            {product.stock}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{t.pdStockAvailable}</p>
        </div>
        <div className="bg-white py-4">
          <p className="text-3xl font-black text-slate-300">{product.minStock}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{t.pdMin}</p>
        </div>
      </div>

      {/* Consumo info */}
      <div className="mx-5 mb-4 bg-slate-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${product.consumptionType === "DYNAMIC_PER_GUEST" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}`}>
            {product.consumptionType === "DYNAMIC_PER_GUEST" ? "D" : "S"}
          </span>
          <div className="flex-1 min-w-0">
            {product.consumptionType === "DYNAMIC_PER_GUEST" ? (
              <p className="text-xs font-semibold text-slate-700">
                {t.pdConsDynamic} <span className="text-indigo-600">{product.consumptionValue} {product.unit} {t.pdPerGuest}</span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-700">
                {t.pdConsStatic} <span className="text-slate-600">{product.consumptionValue} {product.unit} {t.pdPerCheckin}</span>
              </p>
            )}
            {preview != null && (
              <p className={`text-[10px] mt-0.5 ${willAlert ? "text-amber-600 font-semibold" : "text-slate-400"}`}>
                {t.pdNextCheckin}{nextGuestCount ? ` (${nextGuestCount} ${t.pdGuestsWord})` : ""}: {t.pdExpected} <strong>{preview} {product.unit}</strong>
                {stockAfterPreview != null && (
                  <> → {t.pdFinalStock} <strong>{stockAfterPreview}</strong>{willAlert ? " ⚠️" : " ✅"}</>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Barra progresso */}
      <div className="mx-5 mb-4">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>{t.pdStockWord} {product.stock} {product.unit}</span>
          <span>{t.pdMinWord} {product.minStock} {product.unit}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === "empty" || status === "critical" ? "bg-red-500" : status === "low" ? "bg-amber-400" : "bg-emerald-500"
            }`}
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      {/* Footer azioni */}
      <div className="border-t border-slate-100 flex items-center">
        <button
          onClick={() => onRestock(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-colors"
        >
          {t.pdRestockBtn}
        </button>
        <div className="w-px h-8 bg-slate-100" />
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {t.pdEditBtn}
        </button>
        <div className="w-px h-8 bg-slate-100" />
        <button
          onClick={() => onDelete(product.id)}
          className="flex items-center justify-center px-5 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default function ApartmentProductsPanel({ apartmentId, initialProducts, nextGuestCount }: Props) {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const alertCount = products.filter(p => getStatus(p.stock, p.minStock) !== "ok").length;

  function openAdd() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setForm({
      name: p.name,
      emoji: p.emoji,
      unit: p.unit,
      stock: p.stock,
      minStock: p.minStock,
      consumptionType: p.consumptionType as "STATIC" | "DYNAMIC_PER_GUEST",
      consumptionValue: p.consumptionValue,
    });
    setError("");
    setShowForm(true);
  }

  function handleSave() {
    if (!form.name.trim()) { setError(t.pdNameRequired); return; }
    setError("");
    startTransition(async () => {
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, apartmentId, form);
        if (!res.success) { setError(res.error ?? "Errore"); return; }
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...form } : p));
      } else {
        const res = await createProduct(apartmentId, form);
        if (!res.success) { setError(res.error ?? "Errore"); return; }
        // Reload per ottenere id dal server
        window.location.reload();
        return;
      }
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t.pdDeleteConfirm)) return;
    startTransition(async () => {
      await deleteProduct(id, apartmentId);
      setProducts(prev => prev.filter(p => p.id !== id));
    });
  }

  function handleRestock() {
    if (!restockTarget || restockQty <= 0) return;
    startTransition(async () => {
      await restockProduct(restockTarget.id, apartmentId, restockQty);
      setProducts(prev => prev.map(p => p.id === restockTarget.id ? { ...p, stock: p.stock + restockQty } : p));
      setRestockTarget(null);
      setRestockQty(0);
    });
  }

  // Ordina: critici prima
  const sorted = [...products].sort((a, b) => {
    const order = { empty: 0, critical: 1, low: 2, ok: 3 };
    return order[getStatus(a.stock, a.minStock)] - order[getStatus(b.stock, b.minStock)];
  });

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t.pdTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.pdSubtitle}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full uppercase tracking-widest hover:bg-slate-700 transition-colors"
        >
          {t.pdAddBtn}
        </button>
      </div>

      {/* Banner allerta */}
      {alertCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-red-500 text-lg flex-shrink-0">🔴</span>
          <div>
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
              {t.pdBelowMin(alertCount)}
            </p>
            <p className="text-xs text-red-500">
              {sorted.filter(p => getStatus(p.stock, p.minStock) !== "ok").map(p => p.name).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Lista vuota */}
      {products.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
          <p className="text-3xl mb-3">📦</p>
          <p className="text-sm font-medium">{t.pdNoProducts}</p>
          <p className="text-xs mt-1">{t.pdNoProductsHint}</p>
        </div>
      )}

      {/* Card prodotti */}
      {sorted.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          nextGuestCount={nextGuestCount}
          onEdit={openEdit}
          onRestock={(prod) => { setRestockTarget(prod); setRestockQty(0); }}
          onDelete={handleDelete}
        />
      ))}

      {/* ── Modal Aggiungi / Modifica ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                {editingProduct ? `${t.pdModalEditPrefix} ${editingProduct.name}` : t.pdModalAdd}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-lg font-bold transition-colors"
              >×</button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{t.pdNameLabel}</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder={t.pdNamePlaceholder}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{t.pdUnit}</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{t.pdEmojiLabel}</label>
                  <input
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.emoji}
                    onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{t.pdStockAvailable}</label>
                  <input
                    type="number" min="0"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center font-bold outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: Math.max(0, parseInt(e.target.value) || 0) }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{t.pdMinQty}</label>
                  <input
                    type="number" min="0"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center font-bold outline-none focus:ring-2 focus:ring-slate-900"
                    value={form.minStock}
                    onChange={e => setForm(f => ({ ...f, minStock: Math.max(0, parseInt(e.target.value) || 0) }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t.pdConsTypeLabel}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, consumptionType: "STATIC" }))}
                    className={`flex flex-col items-center gap-1.5 px-4 py-3 border-2 rounded-xl transition-colors ${form.consumptionType === "STATIC" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
                  >
                    <span className="text-lg">📦</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">{t.pdStaticBtn}</p>
                    <p className={`text-[9px] ${form.consumptionType === "STATIC" ? "text-slate-300" : "text-slate-400"}`}>{t.pdStaticHint}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, consumptionType: "DYNAMIC_PER_GUEST" }))}
                    className={`flex flex-col items-center gap-1.5 px-4 py-3 border-2 rounded-xl transition-colors ${form.consumptionType === "DYNAMIC_PER_GUEST" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
                  >
                    <span className="text-lg">👥</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">{t.pdDynamicBtn}</p>
                    <p className={`text-[9px] ${form.consumptionType === "DYNAMIC_PER_GUEST" ? "text-slate-300" : "text-slate-400"}`}>{t.pdDynamicHint}</p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                  {t.pdQtyConsumed} {form.consumptionType === "STATIC" ? t.pdPerCheckin : t.pdPerGuest}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, consumptionValue: Math.max(0.5, f.consumptionValue - (f.consumptionValue > 1 ? 1 : 0.5)) }))}
                    className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 font-bold text-lg hover:bg-slate-100 transition-colors"
                  >−</button>
                  <span className="text-2xl font-black text-slate-900 w-12 text-center">{form.consumptionValue}</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, consumptionValue: f.consumptionValue + (f.consumptionValue >= 1 ? 1 : 0.5) }))}
                    className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 font-bold text-lg hover:bg-slate-100 transition-colors"
                  >+</button>
                  <span className="text-sm text-slate-400">{form.unit} {form.consumptionType === "STATIC" ? "/ check-in" : "/ ospite"}</span>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-700 disabled:opacity-40 transition-colors"
                >
                  {isPending ? t.pdSaving : editingProduct ? t.pdUpdate : t.pdSave}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 border border-slate-200 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  {t.mgrCancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Rifornimento ── */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setRestockTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-1">{t.pdRestockTitle}</h3>
            <p className="text-sm text-slate-500 mb-5">
              {restockTarget.emoji} {restockTarget.name} — {t.pdCurrentStock} <strong>{restockTarget.stock} {restockTarget.unit}</strong>
            </p>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t.pdQtyToAdd}</label>
            <div className="flex items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRestockQty(q => Math.max(0, q - 1))}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 font-bold text-lg hover:bg-slate-100"
              >−</button>
              <input
                type="number" min="0"
                className="text-2xl font-black text-slate-900 w-16 text-center border border-slate-200 rounded-xl py-1 outline-none"
                value={restockQty}
                onChange={e => setRestockQty(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <button
                type="button"
                onClick={() => setRestockQty(q => q + 1)}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 font-bold text-lg hover:bg-slate-100"
              >+</button>
              <span className="text-sm text-slate-400">{restockTarget.unit}</span>
            </div>
            {restockQty > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mb-4">
                {t.pdStockAfter} {restockTarget.stock + restockQty} {restockTarget.unit}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRestock}
                disabled={isPending || restockQty <= 0}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-40 transition-colors"
              >
                {isPending ? "..." : t.pdConfirmRestock}
              </button>
              <button
                onClick={() => setRestockTarget(null)}
                className="px-4 py-3 border border-slate-200 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest"
              >
                {t.mgrCancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

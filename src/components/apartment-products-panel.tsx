"use client";

import { useState, useEffect, useTransition } from "react";
import { useLang } from "@/src/components/lang-context";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  restockProduct,
  getProductStockHistory,
  type ProductFormData,
  type StockHistoryResult,
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

type UpcomingBooking = { date: string; guests: number };

type Props = {
  apartmentId: string;
  initialProducts: Product[];
  nextGuestCount?: number | null;
  upcomingBookings?: UpcomingBooking[];
};

// Previsione riordino: simula il consumo sulle prenotazioni future (in ordine di
// check-in) e trova quando la scorta scende sotto la minima.
type Forecast =
  | { level: "now" }
  | { level: "soon"; date: string; checkins: number }
  | { level: "ok" }
  | { level: "none" };

function computeForecast(product: Product, bookings: UpcomingBooking[]): Forecast {
  if (product.stock <= product.minStock) return { level: "now" };
  if (bookings.length === 0) return { level: "none" };
  const perCheckin = (guests: number) =>
    product.consumptionType === "DYNAMIC_PER_GUEST"
      ? Math.ceil(product.consumptionValue * Math.max(1, guests))
      : product.consumptionValue;
  let stock = product.stock;
  let checkins = 0;
  for (const b of bookings) {
    stock = Math.max(0, stock - perCheckin(b.guests));
    checkins++;
    if (stock <= product.minStock) return { level: "soon", date: b.date, checkins };
  }
  return { level: "ok" };
}

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
  forecast,
  onEdit,
  onRestock,
  onDelete,
  onHistory,
}: {
  product: Product;
  nextGuestCount?: number | null;
  forecast: Forecast;
  onEdit: (p: Product) => void;
  onRestock: (p: Product) => void;
  onDelete: (id: string) => void;
  onHistory: (p: Product) => void;
}) {
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
  const fcDate = forecast.level === "soon"
    ? new Date(forecast.date).toLocaleDateString(locale, { day: "numeric", month: "short" })
    : "";
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

      {/* Previsione riordino */}
      {forecast.level !== "none" && (
        <div className={`mx-5 mb-4 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs leading-snug ${
          forecast.level === "now" ? "bg-red-50 border border-red-200 text-red-700"
          : forecast.level === "soon" ? "bg-amber-50 border border-amber-200 text-amber-700"
          : "bg-emerald-50 border border-emerald-200 text-emerald-700"
        }`}>
          <span className="text-sm flex-shrink-0">
            {forecast.level === "now" ? "🔴" : forecast.level === "soon" ? "📦" : "✅"}
          </span>
          <span>
            {forecast.level === "now"
              ? t.pdFcOrderNow
              : forecast.level === "soon"
              ? t.pdFcOrderBy(fcDate, forecast.checkins)
              : t.pdFcOk}
          </span>
        </div>
      )}

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
          onClick={() => onHistory(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-black uppercase tracking-widest text-violet-600 hover:bg-violet-50 transition-colors"
        >
          {t.pdHistoryBtn}
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

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ProductHistoryModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 6);

  const [from, setFrom] = useState(ymd(weekAgo));
  const [to, setTo] = useState(ymd(now));
  const [data, setData] = useState<StockHistoryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMovements, setShowMovements] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProductStockHistory(product.id, from, to).then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [product.id, from, to]);

  function applyPreset(kind: "yesterday" | "7" | "month") {
    const base = new Date();
    if (kind === "yesterday") {
      const y = new Date(); y.setDate(base.getDate() - 1);
      setFrom(ymd(y)); setTo(ymd(y));
    } else if (kind === "7") {
      const s = new Date(); s.setDate(base.getDate() - 6);
      setFrom(ymd(s)); setTo(ymd(base));
    } else {
      const s = new Date(base.getFullYear(), base.getMonth(), 1);
      setFrom(ymd(s)); setTo(ymd(base));
    }
  }

  // Rileva quale preset è attivo per evidenziarlo.
  const yStr = (() => { const y = new Date(); y.setDate(new Date().getDate() - 1); return ymd(y); })();
  const sevenStart = (() => { const s = new Date(); s.setDate(new Date().getDate() - 6); return ymd(s); })();
  const monthStart = (() => { const b = new Date(); return ymd(new Date(b.getFullYear(), b.getMonth(), 1)); })();
  const todayStr = ymd(new Date());
  const activePreset =
    from === yStr && to === yStr ? "yesterday"
    : from === sevenStart && to === todayStr ? "7"
    : from === monthStart && to === todayStr ? "month"
    : null;

  const reasonLabel = (r: string) =>
    r === "CHECKIN" ? t.pdHistReasonCheckin
    : r === "RESTOCK" ? t.pdHistReasonRestock
    : r === "ADJUSTMENT" ? t.pdHistReasonAdjust
    : t.pdHistReasonInitial;
  const reasonEmoji = (r: string) =>
    r === "CHECKIN" ? "🔑" : r === "RESTOCK" ? "📦" : r === "ADJUSTMENT" ? "✏️" : "🟣";
  const reasonBg = (r: string) =>
    r === "CHECKIN" ? "bg-red-100" : r === "RESTOCK" ? "bg-emerald-100" : "bg-indigo-100";
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const fmtDay = (s: string) =>
    new Date(`${s}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <span>{product.emoji}</span> {product.name}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-lg font-bold transition-colors">×</button>
        </div>

        {/* Selettori data */}
        <div className="grid grid-cols-2 gap-3 px-6 pt-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{t.pdHistFrom}</label>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{t.pdHistTo}</label>
            <input type="date" value={to} min={from} max={todayStr} onChange={(e) => setTo(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        {/* Preset */}
        <div className="flex gap-2 px-6 pt-3 flex-wrap">
          {([["yesterday", t.pdHistPresetYesterday], ["7", t.pdHistPreset7], ["month", t.pdHistPresetMonth]] as const).map(([k, label]) => (
            <button key={k} onClick={() => applyPreset(k)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${activePreset === k ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">{t.pdHistLoading}</div>
        ) : !data ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">{t.pdHistEmpty}</div>
        ) : (
          <>
            {/* Iniziale → Finale */}
            <div className="mx-6 mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-1 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-4 text-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.pdHistInitial}</p>
                <p className="text-[10px] text-violet-300 font-bold mt-0.5">{fmtDay(from)}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{data.initialBalance}</p>
              </div>
              <div className="text-slate-300 text-xl">→</div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t.pdHistFinal}</p>
                <p className="text-[10px] text-violet-300 font-bold mt-0.5">{fmtDay(to)}</p>
                <p className="text-3xl font-black text-violet-700 mt-1">{data.finalBalance}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mx-6 mt-3">
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                  <span className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-sm">🔑</span>
                  <span>{t.pdHistConsumed}<span className="block text-[11px] text-slate-400 font-normal">{t.pdHistCheckinsN(data.checkinCount)}</span></span>
                </div>
                <span className="font-black text-red-500">−{data.consumed}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">📦</span>
                  <span>{t.pdHistRestocked}<span className="block text-[11px] text-slate-400 font-normal">{t.pdHistRestocksN(data.restockCount)}</span></span>
                </div>
                <span className="font-black text-emerald-600">+{data.restocked}</span>
              </div>
              {data.adjustmentCount > 0 && (
                <div className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-sm">✏️</span>
                    <span>{t.pdHistAdjust}<span className="block text-[11px] text-slate-400 font-normal">{t.pdHistAdjustsN(data.adjustmentCount)}</span></span>
                  </div>
                  <span className="font-black text-slate-400">{data.adjustments >= 0 ? "+" : ""}{data.adjustments}</span>
                </div>
              )}
            </div>

            {/* Movimenti espandibili */}
            <button onClick={() => setShowMovements((s) => !s)}
              className="w-full text-center text-[11px] font-black uppercase tracking-widest text-violet-600 py-3">
              {showMovements ? t.pdHistHideMovements : t.pdHistSeeMovements} {showMovements ? "▴" : "▾"}
            </button>
            {showMovements && (
              <div className="mx-6 mb-2">
                {data.movements.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-4">{t.pdHistEmpty}</p>
                ) : data.movements.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                    <span className={`w-8 h-8 rounded-lg ${reasonBg(m.reason)} flex items-center justify-center text-sm flex-shrink-0`}>{reasonEmoji(m.reason)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{reasonLabel(m.reason)}{m.note ? ` · ${m.note}` : ""}</p>
                      <p className="text-[11px] text-slate-400">{fmtDate(m.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-black ${m.delta > 0 ? "text-emerald-600" : m.delta < 0 ? "text-red-500" : "text-slate-400"}`}>{m.delta > 0 ? "+" : ""}{m.delta}</p>
                      <p className="text-[10px] text-slate-400">{product.unit} {m.balance}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="px-6 pb-5 pt-1 text-[11px] text-slate-400 leading-snug">{t.pdHistNote}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ApartmentProductsPanel({ apartmentId, initialProducts, nextGuestCount, upcomingBookings = [] }: Props) {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [historyTarget, setHistoryTarget] = useState<Product | null>(null);
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
          forecast={computeForecast(p, upcomingBookings)}
          onEdit={openEdit}
          onRestock={(prod) => { setRestockTarget(prod); setRestockQty(0); }}
          onDelete={handleDelete}
          onHistory={(prod) => setHistoryTarget(prod)}
        />
      ))}

      {/* ── Modal Storico ── */}
      {historyTarget && (
        <ProductHistoryModal product={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}

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

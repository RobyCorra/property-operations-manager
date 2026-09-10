"use client";

import { useLang } from "@/src/components/lang-context";
import type { ProductsAnalytics } from "@/src/app/actions/analytics";

function useMoney() {
  const { lang } = useLang();
  const locale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
  return (n: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
    } catch {
      return `€${n.toFixed(2)}`;
    }
  };
}

function monthShort(mk: string, lang: string | null) {
  const [y, m] = mk.split("-").map(Number);
  const locale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "short" });
}

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span className="w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[14px]" style={{ background: bg, color }}>
      {children}
    </span>
  );
}

function SectionHead({ bg, color, icon, title }: { bg: string; color: string; icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <Badge bg={bg} color={color}>{icon}</Badge>
      <span className="text-[12px] font-[600] text-[#6e6e73] uppercase tracking-[.03em]">{title}</span>
    </div>
  );
}

export default function ProductsAnalyticsSection({ data }: { data: ProductsAnalytics }) {
  const { t, lang } = useLang();
  const money = useMoney();
  const card = "bg-white rounded-[16px] overflow-hidden";
  const cardStyle = { border: ".5px solid #e5e5ea" } as const;

  const maxTop = Math.max(1, ...data.topProducts.map((p) => p.cost));

  return (
    <div style={{ background: "#f2f2f7", fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}>
    <div className="max-w-[1100px] mx-auto px-5 pb-12 pt-2 flex flex-col gap-8">

      {/* ══ KPI ══ */}
      <section>
        <SectionHead bg="#e8f0ff" color="#2f6bff" icon="📦" title={t.anPcTitle} />
        <div className={card} style={cardStyle}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { k: t.anPcStockTotal, v: money(data.kpi.totalStockValue), s: t.anPcAptWh, red: false },
              { k: t.anPcConsumedMonth, v: money(data.kpi.consumedCostMonth), s: monthLabel(data.selectedMonth, lang), red: false },
              { k: t.anPcWarehouseValue, v: money(data.kpi.warehouseStockValue), s: "", red: false },
              { k: t.anPcLowCount, v: String(data.kpi.lowStockCount), s: t.anPcToReorder, red: true },
            ].map((kpi, i) => (
              <div key={i} className="px-4 py-[18px] border-b md:border-b-0 md:border-r last:border-r-0" style={{ borderColor: "#eee" }}>
                <div className="text-[11px] text-[#8e8e93] font-[500] uppercase tracking-[.03em]">{kpi.k}</div>
                <div className={`text-[24px] font-[800] mt-1.5 tracking-[-.02em] ${kpi.red ? "text-[#ff3b30]" : "text-[#1d1d1f]"}`}>{kpi.v}</div>
                {kpi.s && <div className="text-[11px] text-[#a1a1a6] mt-0.5">{kpi.s}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Costo consumato per mese ══ */}
      <section>
        <SectionHead bg="#eafaf0" color="#34c759" icon="📉" title={`${t.anPcConsumedPerMonth} · ${t.pdVatIncl}`} />
        <div className={`${card} overflow-x-auto`} style={cardStyle}>
          {data.matrix.rows.length === 0 ? (
            <p className="text-center text-[13px] text-[#8e8e93] py-8">{t.anPcNoData}</p>
          ) : (
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-[11px] text-[11px] font-[600] text-[#8e8e93] uppercase" style={{ background: "#f9f9fb", borderBottom: ".5px solid #e5e5ea" }}>{t.navApartments}</th>
                  {data.months.map((mk) => (
                    <th key={mk} className="text-right px-3 py-[11px] text-[11px] font-[600] text-[#8e8e93] uppercase capitalize" style={{ background: "#f9f9fb", borderBottom: ".5px solid #e5e5ea" }}>{monthShort(mk, lang)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.matrix.rows.map((r) => (
                  <tr key={r.id}>
                    <td className="text-left px-3 py-[11px] text-[13px] font-[600] text-[#1d1d1f]" style={{ borderBottom: ".5px solid #f0f0f2" }}>
                      {r.isWarehouse ? "📦 " : ""}{r.name}
                    </td>
                    {data.months.map((mk) => (
                      <td key={mk} className={`text-right px-3 py-[11px] text-[13px] font-[600] ${r.months[mk] > 0 ? "text-[#1d1d1f]" : "text-[#c7c7cc]"}`} style={{ borderBottom: ".5px solid #f0f0f2" }}>
                        {r.months[mk] > 0 ? money(r.months[mk]) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="text-left px-3 py-[11px] text-[13px] font-[800]" style={{ background: "#fafafa", borderTop: ".5px solid #e5e5ea" }}>{t.anPcTotal}</td>
                  {data.months.map((mk) => (
                    <td key={mk} className="text-right px-3 py-[11px] text-[13px] font-[800]" style={{ background: "#fafafa", borderTop: ".5px solid #e5e5ea" }}>{money(data.matrix.totals[mk])}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ══ Top prodotti ══ */}
      <section>
        <SectionHead bg="#fff4e5" color="#ff9f0a" icon="🏆" title={`${t.anPcTopProducts} · ${monthLabel(data.selectedMonth, lang)}`} />
        <div className={card} style={cardStyle}>
          {data.topProducts.length === 0 ? (
            <p className="text-center text-[13px] text-[#8e8e93] py-8">{t.anPcNoData}</p>
          ) : (
            <div className="px-4 py-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-[9px]">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-[#f2f2f7] flex items-center justify-center text-[15px] flex-shrink-0">{p.emoji}</span>
                  <span className="w-[130px] md:w-[160px] text-[13px] font-[600] flex-shrink-0 truncate">{p.name}</span>
                  <span className="flex-1 h-[9px] bg-[#f2f2f7] rounded-[6px] overflow-hidden">
                    <span className="block h-full rounded-[6px]" style={{ width: `${Math.round((p.cost / maxTop) * 100)}%`, background: "linear-gradient(90deg,#ff9f0a,#ff6b6b)" }} />
                  </span>
                  <span className="w-[80px] text-right text-[13px] font-[800] flex-shrink-0">{money(p.cost)}</span>
                  <span className="w-[64px] text-right text-[11px] text-[#a1a1a6] flex-shrink-0">{p.qty} {p.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ Sotto minima ══ */}
      <section>
        <SectionHead bg="#fff1f0" color="#ff3b30" icon="🔴" title={t.anPcLowTitle} />
        <div className={card} style={cardStyle}>
          {data.lowStock.length === 0 ? (
            <p className="text-center text-[13px] text-[#8e8e93] py-8">{t.anPcNoLow}</p>
          ) : (
            data.lowStock.map((grp, gi) => (
              <div key={gi}>
                <div className="text-[11px] text-[#8e8e93] font-[600] uppercase tracking-[.03em] px-4 pt-3 pb-1">{grp.isWarehouse ? "📦 " : ""}{grp.location}</div>
                {grp.items.map((it, ii) => (
                  <div key={ii} className="flex items-center gap-3 px-4 py-[9px]" style={{ borderBottom: ".5px solid #f0f0f2" }}>
                    <span className="w-[28px] h-[28px] rounded-[8px] bg-[#fff1f0] flex items-center justify-center text-[14px] flex-shrink-0">{it.emoji}</span>
                    <span className="flex-1 text-[13px] font-[600] truncate">{it.name}</span>
                    <span className="text-[12px] text-[#ff3b30] font-[700] w-[120px] text-right">{it.stock} / min {it.minStock} {it.unit}</span>
                    <span className="text-[12px] text-[#8e8e93] w-[80px] text-right">{money(it.value)}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </section>

    </div>
    </div>
  );
}

function monthLabel(mk: string, lang: string | null) {
  const [y, m] = mk.split("-").map(Number);
  const locale = lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "it-IT";
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
}

import Link from "next/link";

type LowStockAlert = {
  aptName: string;
  aptId: string;
  items: { name: string; emoji: string; stock: number; unit: string; minStock: number }[];
};

export default function LowStockBanner({ alerts }: { alerts: LowStockAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <h3 className="text-xs font-black uppercase tracking-widest text-amber-800">Scorte basse</h3>
      </div>
      <div className="space-y-1.5">
        {alerts.map((a) => (
          <div key={a.aptId} className="flex items-start gap-2">
            <Link
              href={`/dashboard/manager/apartments/${a.aptId}/products`}
              className="text-sm font-semibold text-amber-900 hover:underline shrink-0"
            >
              {a.aptName}:
            </Link>
            <span className="text-sm text-amber-700">
              {a.items.map((i) => `${i.emoji} ${i.name} (${i.stock})`).join(", ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

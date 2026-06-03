import { redirect } from "next/navigation";
import Link from "next/link";
import { isSuperAdminAuthenticated, getAllOrgsWithMetrics, logoutSuperAdmin, impersonateOrg } from "@/src/app/actions/superadmin";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] text-slate-400 font-bold">{d.value || ""}</span>
          <div
            className="w-full rounded-t-md bg-violet-500/70 transition-all"
            style={{ height: `${Math.round((d.value / max) * 72)}px`, minHeight: d.value > 0 ? "4px" : "0" }}
          />
          <span className="text-[9px] text-slate-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function SuperAdminPage() {
  const auth = await isSuperAdminAuthenticated();
  if (!auth) redirect("/superadmin/login");

  const orgs = await getAllOrgsWithMetrics();

  // Grafici: org create negli ultimi 6 mesi
  const now = new Date();
  const monthlyGrowth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("it-IT", { month: "short" });
    const value = orgs.filter(o => {
      const c = new Date(o.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    return { label, value };
  });

  const totalAlerts = orgs.reduce((s, o) => s + o.alerts.length, 0);
  const orgsWithAlerts = orgs.filter(o => o.alerts.length > 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">⚡ Super Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">Property Operations Manager — Pannello di controllo</p>
        </div>
        <form action={logoutSuperAdmin}>
          <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
            Esci
          </button>
        </form>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Organizzazioni", value: orgs.length, icon: "🏢" },
          { label: "Utenti totali", value: orgs.reduce((s, o) => s + o.userCount, 0), icon: "👥" },
          { label: "Appartamenti", value: orgs.reduce((s, o) => s + o.apartmentCount, 0), icon: "🏠" },
          { label: "Alert attivi", value: totalAlerts, icon: "⚠️", alert: totalAlerts > 0 },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-4 ${kpi.alert ? "border-red-500/30 bg-red-500/5" : "border-slate-800 bg-slate-900"}`}>
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-3xl font-black ${kpi.alert ? "text-red-400" : "text-white"}`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Crescita organizzazioni</h2>
          <BarChart data={monthlyGrowth} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Alert attivi {orgsWithAlerts.length > 0 && <span className="text-red-400">({orgsWithAlerts.length} org)</span>}
          </h2>
          {orgsWithAlerts.length === 0 ? (
            <p className="text-sm text-slate-500">✅ Nessun alert — tutto ok</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {orgsWithAlerts.map(org => (
                <Link key={org.id} href={`/superadmin/${org.id}`} className="flex items-start gap-3 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 transition-all">
                  <span className="text-red-400 text-xs mt-0.5">⚠</span>
                  <div>
                    <p className="text-xs font-bold text-white">{org.name}</p>
                    <p className="text-[10px] text-slate-400">{org.alerts.join(" · ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabella organizzazioni */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Organizzazioni</h2>
          <span className="text-xs text-slate-500">{orgs.length} totali</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Organizzazione", "Utenti", "Apt", "Pulizie", "Ticket", "Creata", "Alert", "Azioni"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/superadmin/${org.id}`} className="font-bold text-white hover:text-violet-400 transition-colors">
                      {org.name}
                    </Link>
                    <p className="text-[10px] text-slate-500">{org.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{org.userCount}</td>
                  <td className="px-4 py-3 text-slate-300">{org.apartmentCount}</td>
                  <td className="px-4 py-3 text-slate-300">{org.activeCleanings}</td>
                  <td className="px-4 py-3 text-slate-300">{org.openTickets}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(org.createdAt)}</td>
                  <td className="px-4 py-3">
                    {org.alerts.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {org.alerts.map(a => (
                          <span key={a} className="text-[10px] text-red-400 font-medium">⚠ {a}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-medium">✓ Ok</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/superadmin/${org.id}`} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold transition-all">
                        Dettaglio
                      </Link>
                      {org.hasManager && (
                        <form action={impersonateOrg}>
                          <input type="hidden" name="orgId" value={org.id} />
                          <button className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold transition-all">
                            Impersona
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

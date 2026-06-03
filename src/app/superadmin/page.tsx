import { redirect } from "next/navigation";
import Link from "next/link";
import { isSuperAdminAuthenticated, getAllOrgsWithMetrics, getDbStats, getSuperAdminLogs } from "@/src/app/actions/superadmin";
import CreateOrgForm from "@/src/components/superadmin/create-org-form";

export const dynamic = "force-dynamic";

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
            className="w-full rounded-t-md bg-violet-500/70"
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

  const [orgs, dbStats, logs] = await Promise.all([getAllOrgsWithMetrics(), getDbStats(), getSuperAdminLogs(100)]);

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

  // Severità alert per colore
  const CRITICAL = ["Nessun manager", "login falliti"];
  function alertSeverity(a: string) {
    return CRITICAL.some(k => a.includes(k)) ? "critical" : "warning";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-6 space-y-8">

      {/* Banner DB quasi pieno */}
      {dbStats.usedPercent >= 80 && (
        <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${dbStats.usedPercent >= 95 ? "bg-red-500/15 border border-red-500/40" : "bg-amber-500/10 border border-amber-500/30"}`}>
          <span className="text-lg">{dbStats.usedPercent >= 95 ? "🚨" : "⚠️"}</span>
          <p className="text-sm font-bold text-white">
            Database al <span className={dbStats.usedPercent >= 95 ? "text-red-400" : "text-amber-400"}>{dbStats.usedPercent}%</span> — {dbStats.totalSize} su 512 MB utilizzati.
            {dbStats.usedPercent >= 95 ? " Richiede intervento immediato." : " Considera un upgrade del piano."}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">⚡ Super Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">Property Operations Manager — Pannello di controllo</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateOrgForm />
          <form action="/api/superadmin/logout" method="POST">
            <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all">
              Esci
            </button>
          </form>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Organizzazioni", value: orgs.length, icon: "🏢" },
          { label: "Utenti totali", value: orgs.reduce((s, o) => s + o.userCount, 0), icon: "👥" },
          { label: "Appartamenti", value: orgs.reduce((s, o) => s + o.apartmentCount, 0), icon: "🏠" },
          { label: "Alert attivi", value: totalAlerts, icon: "⚠️", alert: totalAlerts > 0 },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-4 ${(kpi as any).alert ? "border-red-500/30 bg-red-500/5" : "border-slate-800 bg-slate-900"}`}>
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-3xl font-black ${(kpi as any).alert ? "text-red-400" : "text-white"}`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* DB Usage */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">💾 Database — Utilizzo storage</h2>
          <span className="text-xs text-slate-500">Limite free tier: 512 MB</span>
        </div>

        {/* Barra principale */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">{dbStats.totalSize} usati</span>
            <span className={`font-bold ${dbStats.usedPercent >= 80 ? "text-red-400" : dbStats.usedPercent >= 60 ? "text-amber-400" : "text-emerald-400"}`}>
              {dbStats.usedPercent}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${dbStats.usedPercent >= 80 ? "bg-red-500" : dbStats.usedPercent >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.max(dbStats.usedPercent, 1)}%` }}
            />
          </div>
        </div>

        {/* Tabelle più pesanti */}
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Tabelle più pesanti</p>
          {dbStats.tables.slice(0, 8).map(t => (
            <div key={t.table} className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 w-40 truncate font-mono">{t.table}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500/60"
                  style={{ width: `${Math.max(t.percent, 1)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 w-14 text-right">{t.size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Crescita organizzazioni</h2>
          <BarChart data={monthlyGrowth} />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Alert {orgsWithAlerts.length > 0 && <span className="text-red-400">({orgsWithAlerts.length} org)</span>}
          </h2>
          {orgsWithAlerts.length === 0 ? (
            <p className="text-sm text-slate-500">✅ Nessun alert</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {orgsWithAlerts.map(org => {
                const hasCritical = org.alerts.some(a => alertSeverity(a) === "critical");
                return (
                  <Link key={org.id} href={`/superadmin/${org.id}`} className="flex items-start gap-3 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 transition-all">
                    <span className={`text-xs mt-0.5 ${hasCritical ? "text-red-400" : "text-amber-400"}`}>⚠</span>
                    <div>
                      <p className="text-xs font-bold text-white">{org.name}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {org.alerts.map(a => (
                          <span key={a} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${alertSeverity(a) === "critical" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabella org */}
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
                    <Link href={`/superadmin/${org.id}`} className="font-bold text-white hover:text-violet-400 transition-colors">{org.name}</Link>
                    <p className="text-[10px] text-slate-500">{org.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{org.userCount}</td>
                  <td className="px-4 py-3 text-slate-300">{org.apartmentCount}</td>
                  <td className="px-4 py-3 text-slate-300">{org.activeCleanings}</td>
                  <td className="px-4 py-3 text-slate-300">{org.openTickets}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(org.createdAt)}</td>
                  <td className="px-4 py-3">
                    {org.alerts.length > 0
                      ? org.alerts.map(a => (
                          <p key={a} className={`text-[10px] font-medium ${alertSeverity(a) === "critical" ? "text-red-400" : "text-amber-400"}`}>
                            ⚠ {a}
                          </p>
                        ))
                      : <span className="text-[10px] text-emerald-400 font-medium">✓ Ok</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/superadmin/${org.id}`} className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold transition-all">
                        Dettaglio
                      </Link>
                      {org.hasManager && (
                        <form action="/api/superadmin/impersonate" method="POST">
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
      {/* Activity Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">📋 Log attività admin</h2>
          <span className="text-xs text-slate-500">{logs.length} eventi recenti</span>
        </div>
        {logs.length === 0 ? (
          <p className="px-6 py-4 text-sm text-slate-500">Nessun evento registrato.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-900">
                <tr className="border-b border-slate-800">
                  {["Data / Ora", "Azione", "Dettaglio", "Organizzazione", "IP"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const actionColor: Record<string, string> = {
                    LOGIN: "text-emerald-400",
                    LOGIN_FALLITO: "text-red-400",
                    LOGIN_MANAGER: "text-emerald-300",
                    LOGIN_CLEANER: "text-emerald-300",
                    LOGIN_MAINTENANCE: "text-emerald-300",
                    LOGIN_SUPERVISOR: "text-emerald-300",
                    LOGIN_OWNER: "text-emerald-300",
                    IMPERSONA: "text-violet-400",
                    CREA_ORG: "text-sky-400",
                    CREA_MANAGER: "text-sky-400",
                    RESET_PASSWORD: "text-amber-400",
                    ELIMINA_DATI_TEST: "text-red-400",
                  };
                  const color = actionColor[log.action] ?? "text-slate-300";
                  const dt = new Date(log.createdAt);
                  const dateStr = dt.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Rome" });
                  const timeStr = dt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Rome" });
                  return (
                    <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                        <span className="block">{dateStr}</span>
                        <span className="text-slate-600">{timeStr}</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className={`text-xs font-bold font-mono ${color}`}>{log.action}</span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs max-w-xs truncate">{log.detail ?? "—"}</td>
                      <td className="px-4 py-2.5 text-xs">
                        {log.orgName ? (
                          <Link href={`/superadmin/${log.orgId}`} className="text-slate-300 hover:text-violet-400 transition-colors">{log.orgName}</Link>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-xs font-mono">{log.ip ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

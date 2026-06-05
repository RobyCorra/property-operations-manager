import { redirect } from "next/navigation";
import Link from "next/link";
import { isSuperAdminAuthenticated, getAllOrgsWithMetrics, getDbStats, getSuperAdminLogs, getAIUsageAllOrgs } from "@/src/app/actions/superadmin";
import CreateOrgForm from "@/src/components/superadmin/create-org-form";
import AIUsageTable from "@/src/components/superadmin/ai-usage-table";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-[700] text-gray-400 uppercase tracking-[.06em] mb-3">{children}</p>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100" />;
}

const CRITICAL = ["Nessun manager", "login falliti"];
function alertSeverity(a: string) {
  return CRITICAL.some(k => a.includes(k)) ? "critical" : "warning";
}

export default async function SuperAdminPage() {
  const auth = await isSuperAdminAuthenticated();
  if (!auth) redirect("/superadmin/login");

  const [orgs, dbStats, logs, aiUsage] = await Promise.all([
    getAllOrgsWithMetrics(),
    getDbStats(),
    getSuperAdminLogs(100),
    getAIUsageAllOrgs(),
  ]);

  const totalAlerts = orgs.reduce((s, o) => s + o.alerts.length, 0);

  const actionColor: Record<string, string> = {
    LOGIN: "#16a34a",
    LOGIN_FALLITO: "#dc2626",
    LOGIN_MANAGER: "#16a34a",
    LOGIN_CLEANER: "#16a34a",
    LOGIN_MAINTENANCE: "#16a34a",
    LOGIN_SUPERVISOR: "#16a34a",
    LOGIN_OWNER: "#16a34a",
    IMPERSONA: "#7c3aed",
    CREA_ORG: "#2563eb",
    CREA_MANAGER: "#2563eb",
    RESET_PASSWORD: "#d97706",
    ELIMINA_DATI_TEST: "#dc2626",
  };

  return (
    <main
      className="min-h-screen bg-white"
      style={{ fontFamily: "-apple-system, 'SF Pro Text', system-ui, sans-serif" }}
    >
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-gray-900 flex items-center justify-center text-white text-[16px]">⚡</div>
          <div>
            <div className="text-[16px] font-[700] text-gray-900 leading-tight">Super Admin</div>
            <div className="text-[11px] text-gray-400">Property Operations Manager</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CreateOrgForm />
          <form action="/api/superadmin/logout" method="POST">
            <button className="text-[12px] font-[600] text-gray-500 bg-gray-50 border border-gray-200 rounded-[8px] px-3 py-[7px] hover:bg-gray-100 transition">
              Esci
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-5 sm:px-8 py-8 flex flex-col gap-8">

        {/* ── Banner DB pieno ── */}
        {dbStats.usedPercent >= 80 && (
          <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${dbStats.usedPercent >= 95 ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
            <span>{dbStats.usedPercent >= 95 ? "🚨" : "⚠️"}</span>
            <p className="text-[13px] font-[600] text-gray-800">
              Database al <span className={dbStats.usedPercent >= 95 ? "text-red-600" : "text-amber-600"}>{dbStats.usedPercent}%</span> — {dbStats.totalSize} su 512 MB utilizzati.
              {dbStats.usedPercent >= 95 ? " Richiede intervento immediato." : " Considera un upgrade del piano."}
            </p>
          </div>
        )}

        {/* ── KPI ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Organizzazioni", value: orgs.length, icon: "🏢", color: "" },
            { label: "Utenti totali", value: orgs.reduce((s, o) => s + o.userCount, 0), icon: "👥", color: "" },
            { label: "Appartamenti", value: orgs.reduce((s, o) => s + o.apartmentCount, 0), icon: "🏠", color: "" },
            { label: "Alert attivi", value: totalAlerts, icon: "⚠️", color: totalAlerts > 0 ? "text-red-600" : "" },
          ].map(kpi => (
            <div key={kpi.label} className={`border rounded-[12px] p-4 ${totalAlerts > 0 && kpi.label === "Alert attivi" ? "border-red-100 bg-red-50" : "border-gray-100"}`}>
              <div className="text-[20px] mb-2">{kpi.icon}</div>
              <div className={`text-[32px] font-[800] leading-none ${kpi.color || "text-gray-900"}`}>{kpi.value}</div>
              <div className="text-[12px] text-gray-400 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── Organizzazioni ── */}
        <div>
          <SectionLabel>Organizzazioni</SectionLabel>

          {/* Header — desktop only */}
          <div className="hidden sm:grid grid-cols-[1fr_60px_60px_60px_120px_100px] gap-3 px-3 pb-2 border-b border-gray-100">
            {["Nome", "Utenti", "Apt", "Ticket", "Creata", "Stato"].map(h => (
              <div key={h} className="text-[10px] font-[700] text-gray-400 uppercase tracking-[.04em]">{h}</div>
            ))}
          </div>

          <div className="flex flex-col">
            {orgs.map((org, i) => {
              const hasCritical = org.alerts.some(a => alertSeverity(a) === "critical");
              const statusColor = org.alerts.length === 0 ? "text-green-600" : hasCritical ? "text-red-600" : "text-amber-600";
              const statusText = org.alerts.length === 0 ? "✓ Ok" : hasCritical ? "🔴 " + org.alerts[0] : "⚠ " + org.alerts[0];
              return (
                <div
                  key={org.id}
                  className="py-3 border-b border-gray-50 last:border-none"
                >
                  {/* Mobile layout */}
                  <div className="sm:hidden flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/superadmin/${org.id}`} className="text-[14px] font-[600] text-gray-900 hover:text-indigo-600 transition">{org.name}</Link>
                      <div className="text-[11px] text-gray-400">{org.slug}</div>
                      <div className="flex gap-3 mt-1 text-[12px] text-gray-500">
                        <span>👥 {org.userCount}</span>
                        <span>🏠 {org.apartmentCount}</span>
                        <span>🎫 {org.openTickets}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[11px] font-[600] ${statusColor}`}>{statusText}</span>
                      <div className="flex gap-1">
                        <Link href={`/superadmin/${org.id}`} className="text-[11px] font-[600] text-gray-500 bg-gray-100 rounded-[6px] px-2 py-1 hover:bg-gray-200 transition">Dettaglio</Link>
                        {org.hasManager && (
                          <form action="/api/superadmin/impersonate" method="POST">
                            <input type="hidden" name="orgId" value={org.id} />
                            <button className="text-[11px] font-[600] text-white bg-indigo-600 rounded-[6px] px-2 py-1 hover:bg-indigo-700 transition">Impersona</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-[1fr_60px_60px_60px_120px_100px] gap-3 items-center px-3">
                    <div>
                      <Link href={`/superadmin/${org.id}`} className="text-[14px] font-[600] text-gray-900 hover:text-indigo-600 transition">{org.name}</Link>
                      <div className="text-[11px] text-gray-400">{org.slug}</div>
                    </div>
                    <div className="text-[14px] font-[600] text-gray-700 text-center">{org.userCount}</div>
                    <div className="text-[14px] font-[600] text-gray-700 text-center">{org.apartmentCount}</div>
                    <div className="text-[14px] font-[600] text-gray-700 text-center">{org.openTickets}</div>
                    <div className="text-[12px] text-gray-400">{formatDate(org.createdAt)}</div>
                    <div className={`text-[12px] font-[600] ${statusColor}`}>{statusText}</div>
                  </div>

                  {/* Azioni desktop */}
                  <div className="hidden sm:flex gap-2 mt-2 px-3">
                    <Link href={`/superadmin/${org.id}`} className="text-[11px] font-[600] text-gray-500 bg-gray-100 rounded-[6px] px-3 py-1.5 hover:bg-gray-200 transition">Dettaglio</Link>
                    {org.hasManager && (
                      <form action="/api/superadmin/impersonate" method="POST">
                        <input type="hidden" name="orgId" value={org.id} />
                        <button className="text-[11px] font-[600] text-white bg-indigo-600 rounded-[6px] px-3 py-1.5 hover:bg-indigo-700 transition">Impersona</button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* ── Database ── */}
        <div>
          <SectionLabel>Database — utilizzo storage</SectionLabel>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-[700] text-gray-900">{dbStats.totalSize} utilizzati</span>
            <span className={`text-[13px] font-[700] ${dbStats.usedPercent >= 80 ? "text-red-600" : dbStats.usedPercent >= 60 ? "text-amber-600" : "text-green-600"}`}>{dbStats.usedPercent}% di 512 MB</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all ${dbStats.usedPercent >= 80 ? "bg-red-500" : dbStats.usedPercent >= 60 ? "bg-amber-500" : "bg-green-500"}`}
              style={{ width: `${Math.max(dbStats.usedPercent, 1)}%` }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {dbStats.tables.slice(0, 6).map(t => (
              <div key={t.table} className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400 w-36 truncate font-mono">{t.table}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-400/60" style={{ width: `${Math.max(t.percent, 1)}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 w-12 text-right">{t.size}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── AI Usage ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Consumo AI — questo mese</SectionLabel>
            <span className="text-[11px] text-gray-400 mb-3">reset 1° del mese</span>
          </div>
          <AIUsageTable orgs={aiUsage} />
        </div>

        <Divider />

        {/* ── Log attività ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Log attività</SectionLabel>
            <span className="text-[11px] text-gray-400 mb-3">{logs.length} eventi recenti</span>
          </div>

          {logs.length === 0 ? (
            <p className="text-[13px] text-gray-400">Nessun evento registrato.</p>
          ) : (
            <div className="flex flex-col">
              {logs.map((log, i) => {
                const color = actionColor[log.action] ?? "#6b7280";
                const dt = new Date(log.createdAt);
                const dateStr = dt.toLocaleDateString("it-IT", { day: "2-digit", month: "short", timeZone: "Europe/Rome" });
                const timeStr = dt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
                return (
                  <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-none">
                    <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-[11px] font-[700] text-gray-700 font-mono w-[150px] shrink-0 truncate">{log.action}</span>
                    <span className="text-[12px] text-gray-400 flex-1 truncate hidden sm:block">{log.detail ?? "—"}</span>
                    {log.orgName && (
                      <Link href={`/superadmin/${log.orgId}`} className="text-[11px] text-indigo-500 hover:text-indigo-700 transition shrink-0 hidden sm:block truncate max-w-[120px]">
                        {log.orgName}
                      </Link>
                    )}
                    <span className="text-[11px] text-gray-300 shrink-0 font-mono">{dateStr} {timeStr}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

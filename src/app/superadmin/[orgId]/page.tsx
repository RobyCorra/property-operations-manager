import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  isSuperAdminAuthenticated,
  getOrgDetail,
  impersonateOrg,
  deleteTestData,
} from "@/src/app/actions/superadmin";
import ResetPasswordForm from "@/src/components/superadmin/reset-password-form";
import CreateManagerForm from "@/src/components/superadmin/create-manager-form";

const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Manager", CLEANER: "Pulizie", MAINTENANCE: "Manutenzione",
  SUPERVISOR: "Supervisore", OWNER: "Proprietario",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-400", IN_PROGRESS: "text-blue-400",
  AWAITING_REVIEW: "text-purple-400", COMPLETED: "text-emerald-400",
};

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const auth = await isSuperAdminAuthenticated();
  if (!auth) redirect("/superadmin/login");

  const org = await getOrgDetail(orgId);
  if (!org) notFound();

  const hasManager = org.users.some(u => u.role === "MANAGER");
  const allCleanings = org.apartments.flatMap(a => a.cleaningTasks.map(c => ({ ...c, aptName: a.name })));
  const allTickets = org.apartments.flatMap(a => a.maintenanceTickets.map(t => ({ ...t, aptName: a.name })));
  const urgentTickets = allTickets.filter(t => t.priority === "URGENT");
  const now = new Date();
  const overdueCleanings = allCleanings.filter(c =>
    c.status === "PENDING" && new Date(c.date) < new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-6 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/superadmin" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-block">
            ← Torna al pannello
          </Link>
          <h1 className="text-2xl font-black tracking-tight">{org.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">slug: {org.slug} · creata: {formatDate(org.createdAt)}</p>
        </div>
        {hasManager && (
          <form action={impersonateOrg}>
            <input type="hidden" name="orgId" value={orgId} />
            <button className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all flex items-center gap-2">
              👤 Impersona org
            </button>
          </form>
        )}
      </div>

      {/* Alert section */}
      {(urgentTickets.length > 0 || overdueCleanings.length > 0 || !hasManager) && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">⚠ Alert</h2>
          {!hasManager && (
            <p className="text-sm text-red-300 font-medium">Nessun manager configurato — l'org non può fare login</p>
          )}
          {overdueCleanings.map(c => (
            <p key={c.id} className="text-sm text-amber-300">
              Pulizia in ritardo: <span className="font-bold">{c.aptName}</span> — {formatDate(c.date)}
            </p>
          ))}
          {urgentTickets.map(t => (
            <p key={t.id} className="text-sm text-red-300">
              Ticket urgente: <span className="font-bold">{t.aptName}</span> — {t.title}
            </p>
          ))}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Utenti", value: org.users.length },
          { label: "Appartamenti", value: org.apartments.length },
          { label: "Pulizie attive", value: allCleanings.length },
          { label: "Ticket aperti", value: allTickets.length },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-3xl font-black text-white">{k.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Utenti */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Utenti</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {org.users.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Nessun utente</p>
            ) : (
              org.users.map(u => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    <p className="text-[10px] text-slate-600">{ROLE_LABELS[u.role] ?? u.role} · {formatDate(u.createdAt)}</p>
                  </div>
                  <ResetPasswordForm userId={u.id} userName={u.name} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appartamenti */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Appartamenti</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {org.apartments.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Nessun appartamento</p>
            ) : (
              org.apartments.map(a => (
                <div key={a.id} className="px-5 py-3">
                  <p className="text-sm font-bold text-white">{a.name}</p>
                  <div className="flex gap-3 mt-1">
                    {a.cleaningTasks.length > 0 && (
                      <span className="text-[10px] text-amber-400">{a.cleaningTasks.length} pulizie</span>
                    )}
                    {a.maintenanceTickets.length > 0 && (
                      <span className="text-[10px] text-red-400">{a.maintenanceTickets.length} ticket</span>
                    )}
                    {a.cleaningTasks.length === 0 && a.maintenanceTickets.length === 0 && (
                      <span className="text-[10px] text-slate-500">Nessuna attività aperta</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pulizie attive */}
        {allCleanings.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Pulizie attive</h2>
            </div>
            <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
              {allCleanings.map(c => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{c.aptName}</p>
                    <p className="text-[10px] text-slate-500">{formatDate(c.date)}</p>
                  </div>
                  <span className={`text-[10px] font-bold ${STATUS_COLORS[c.status] ?? "text-slate-400"}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket aperti */}
        {allTickets.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Ticket aperti</h2>
            </div>
            <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
              {allTickets.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-500">{t.aptName} · {formatDate(t.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-bold shrink-0 ${t.priority === "URGENT" ? "text-red-400" : "text-slate-400"}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fix rapidi */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">🔧 Fix rapidi</h2>

        {/* Crea primo manager */}
        {!hasManager && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <h3 className="text-sm font-bold text-violet-300 mb-3">Crea primo manager</h3>
            <CreateManagerForm orgId={orgId} />
          </div>
        )}

        {/* Cancella dati di test */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="text-sm font-bold text-red-300 mb-1">Cancella dati di test</h3>
          <p className="text-xs text-slate-500 mb-3">Rimuove appartamenti, prenotazioni, pulizie e ticket. Gli utenti manager vengono mantenuti.</p>
          <form action={deleteTestData}>
            <input type="hidden" name="orgId" value={orgId} />
            <button
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
              onClick={(e) => { if (!confirm("Sicuro? Questa azione è irreversibile.")) e.preventDefault(); }}
            >
              🗑 Cancella dati di test
            </button>
          </form>
        </div>
      </div>

    </main>
  );
}

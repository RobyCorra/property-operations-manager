import { notFound } from "next/navigation";
import Link from "next/link";
import { isSuperAdminAuthenticated, getCompanyDetail } from "@/src/app/actions/superadmin";
import ResetPasswordForm from "@/src/components/superadmin/reset-password-form";
import CreateCompanyManagerForm from "@/src/components/superadmin/create-company-manager-form";
import DeleteEntityButton from "@/src/components/superadmin/delete-entity-button";
import SuperAdminLoginForm from "@/src/components/superadmin/login-form";

const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Manager", CLEANER: "Pulizie", MAINTENANCE: "Manutenzione", CHECKIN: "Check-in", SUPERVISOR: "Supervisore",
};
const SCOPE_LABELS: Record<string, string> = {
  CLEANING: "Pulizie", MAINTENANCE: "Manutenzione", CHECKIN: "Check-in", SUPERVISION: "Supervisione",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-400", ACTIVE: "text-emerald-400", REVOKED: "text-slate-500",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: "In attesa", ACTIVE: "Attiva", REVOKED: "Revocata",
};

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const auth = await isSuperAdminAuthenticated();
  if (!auth) return <SuperAdminLoginForm />;

  const company = await getCompanyDetail(companyId);
  if (!company) notFound();

  const hasManager = company.users.some(u => u.role === "MANAGER");
  const activeEngagements = company.engagements.filter(e => e.status === "ACTIVE");

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/superadmin" className="text-xs text-slate-500 hover:text-slate-300 mb-2 inline-block">← Torna al pannello</Link>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 align-middle">IMPRESA</span>
            {company.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            slug: {company.slug}{company.vatNumber ? ` · P.IVA ${company.vatNumber}` : ""} · creata: {formatDate(company.createdAt)}
          </p>
        </div>
        {hasManager && (
          <form action="/api/superadmin/impersonate" method="POST">
            <input type="hidden" name="companyId" value={companyId} />
            <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all">
              👤 Impersona impresa
            </button>
          </form>
        )}
      </div>

      {/* Alert */}
      {!hasManager && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">⚠ Alert</h2>
          <p className="text-sm text-red-300 font-medium">Nessun manager configurato</p>
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Utenti", value: company.users.length },
          { label: "Deleghe attive", value: activeEngagements.length },
          { label: "Deleghe totali", value: company.engagements.length },
          { label: "Funzioni offerte", value: company.scopes.length },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-3xl font-black text-white">{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
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
            {company.users.length === 0
              ? <p className="px-5 py-4 text-sm text-slate-500">Nessun utente</p>
              : company.users.map(u => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    <p className="text-[10px] text-slate-600">{ROLE_LABELS[u.role] ?? u.role} · {formatDate(u.createdAt)}</p>
                  </div>
                  <ResetPasswordForm userId={u.id} userName={u.name} />
                </div>
              ))}
          </div>
        </div>

        {/* Deleghe / Ingaggi */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Deleghe (organizzazioni clienti)</h2>
          </div>
          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
            {company.engagements.length === 0
              ? <p className="px-5 py-4 text-sm text-slate-500">Nessuna delega</p>
              : company.engagements.map(e => (
                <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {e.organization?.name ?? <span className="text-slate-500">In attesa di accettazione</span>}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {SCOPE_LABELS[e.scope] ?? e.scope}
                      {e.apartments.length > 0 ? ` · ${e.apartments.map(a => a.apartment.name).join(", ")}` : " · tutti gli appartamenti"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold shrink-0 ${STATUS_COLORS[e.status] ?? "text-slate-400"}`}>
                    {STATUS_LABELS[e.status] ?? e.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Fix rapidi */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">🔧 Fix rapidi</h2>
        {!hasManager && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h3 className="text-sm font-bold text-emerald-300 mb-3">Crea primo manager</h3>
            <CreateCompanyManagerForm companyId={companyId} />
          </div>
        )}
        {hasManager && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h3 className="text-sm font-bold text-emerald-300 mb-3">Aggiungi manager</h3>
            <CreateCompanyManagerForm companyId={companyId} />
          </div>
        )}
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <h3 className="text-sm font-bold text-red-300 mb-1">Elimina impresa</h3>
          <p className="text-xs text-slate-500 mb-3">Elimina l&apos;impresa e <strong>tutti</strong> i suoi dati (utenti, deleghe, messaggi, magazzino) in modo permanente.</p>
          <DeleteEntityButton kind="company" id={companyId} name={company.name} />
        </div>
      </div>
    </main>
  );
}

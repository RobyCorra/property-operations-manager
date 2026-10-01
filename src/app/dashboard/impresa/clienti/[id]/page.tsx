import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

const SCOPE_LABEL: Record<string, string> = {
  CLEANING: "Pulizie",
  MAINTENANCE: "Manutenzione",
  CHECKIN: "Check-in",
  SUPERVISION: "Supervisione",
};

const SCOPE_ICON: Record<string, string> = {
  CLEANING: "🧹",
  MAINTENANCE: "🔧",
  CHECKIN: "🔑",
  SUPERVISION: "👁️",
};

export default async function ImpresaClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  const { id } = await params;

  if (!access.orgIds.includes(id)) redirect("/dashboard/impresa/clienti");

  const org = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      legalName: true,
      vatNumber: true,
      fiscalCode: true,
      sdiCode: true,
      pec: true,
      iban: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      zip: true,
      country: true,
    },
  });
  if (!org) notFound();

  const engagements = await prisma.engagement.findMany({
    where: { companyId: access.companyId, organizationId: id, status: "ACTIVE" },
    select: { scope: true },
  });
  const scopes = engagements.map((e) => e.scope);

  const aptCount = await prisma.apartment.count({ where: { organizationId: id } });

  const fullAddress = [org.address, org.zip, org.city, org.country].filter(Boolean).join(", ");

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      <BackButton />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{org.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {aptCount} appartament{aptCount === 1 ? "o" : "i"} · {scopes.map((s) => SCOPE_LABEL[s] ?? s).join(", ")}
        </p>
      </div>

      {/* Dati fiscali */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dati fiscali</h2>
        <div className="divide-y divide-gray-100">
          <Row icon="🏢" label="Ragione sociale" value={org.legalName} />
          <Row icon="🆔" label="Partita IVA" value={org.vatNumber} mono />
          <Row icon="📄" label="Codice fiscale" value={org.fiscalCode} mono />
          <Row icon="📡" label="Codice SDI" value={org.sdiCode} mono />
          <Row icon="📧" label="PEC" value={org.pec} accent />
        </div>
      </section>

      {/* Coordinate bancarie */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coordinate bancarie</h2>
        <div className="divide-y divide-gray-100">
          <Row icon="💳" label="IBAN" value={org.iban} mono />
        </div>
      </section>

      {/* Contatti */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contatti</h2>
        <div className="divide-y divide-gray-100">
          <Row icon="✉️" label="Email" value={org.email} accent />
          <Row icon="📞" label="Telefono" value={org.phone} />
          <Row icon="📍" label="Indirizzo" value={fullAddress || null} />
        </div>
      </section>

      {/* Funzioni delegate */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Funzioni delegate</h2>
        <div className="flex flex-wrap gap-2">
          {scopes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100"
            >
              {SCOPE_ICON[s] ?? "⚙️"} {SCOPE_LABEL[s] ?? s}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          {aptCount} appartament{aptCount === 1 ? "o" : "i"} assegnat{aptCount === 1 ? "o" : "i"}
        </p>
      </section>
    </main>
  );
}

function Row({ icon, label, value, mono, accent }: { icon: string; label: string; value: string | null | undefined; mono?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="text-base mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`mt-0.5 text-sm ${mono ? "font-mono text-slate-800" : accent ? "text-violet-600" : "text-slate-800"} ${!value ? "text-slate-300 italic" : ""}`}>
          {value || "Non disponibile"}
        </p>
      </div>
    </div>
  );
}

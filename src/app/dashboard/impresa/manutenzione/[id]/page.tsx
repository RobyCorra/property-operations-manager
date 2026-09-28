import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function ImpresaMaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access || !access.scopes.includes("MAINTENANCE")) redirect("/dashboard/impresa");

  const { id } = await params;
  const ticket = await prisma.maintenanceTicket.findUnique({
    where: { id },
    include: {
      apartment: { select: { name: true, address: true, organizationId: true } },
      assignedTo: { select: { name: true } },
      attachments: true,
    },
  });
  if (!ticket) notFound();

  // Sicurezza: solo interventi di un cliente ingaggiato e appartamento assegnato.
  if (!ticket.apartment.organizationId || !access.orgIds.includes(ticket.apartment.organizationId)) {
    redirect("/dashboard/impresa/manutenzione");
  }
  const mApts = access.scopeApartments?.MAINTENANCE;
  if (mApts && !mApts.includes(ticket.apartmentId)) {
    redirect("/dashboard/impresa/manutenzione");
  }

  const org = ticket.apartment.organizationId
    ? await prisma.organization.findUnique({ where: { id: ticket.apartment.organizationId }, select: { name: true } })
    : null;

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <BackButton />

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">{ticket.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{ticket.apartment.name} · {org?.name ?? "—"}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_STYLE[ticket.status] ?? "bg-slate-100 text-slate-600"}`}>
              {ticket.status}
            </span>
            {ticket.priority === "URGENT" && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold text-red-700">Urgente</span>
            )}
          </div>
        </div>

        {ticket.description && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Descrizione</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {[
            { label: "Assegnato a", value: ticket.assignedTo?.name ?? "Non assegnato" },
            { label: "Priorità", value: ticket.priority },
            { label: "Creato", value: fmt(ticket.createdAt) },
            { label: "Programmato", value: ticket.scheduledStart ? fmt(ticket.scheduledStart) : "—" },
            { label: "Avviato", value: fmt(ticket.startedAt) },
            { label: "Risolto", value: fmt(ticket.resolvedAt) },
            { label: "Indirizzo", value: ticket.apartment.address ?? "—" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{f.label}</p>
              <p className="text-sm text-slate-700">{f.value}</p>
            </div>
          ))}
        </div>

        {ticket.attachments.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Allegati ({ticket.attachments.length})</p>
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-gray-100">
                  📎 {a.fileName}
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-400 border-t border-gray-100 pt-3">
          Vista in sola lettura. Puoi assegnare l&apos;intervento al tuo staff dalla lista Manutenzione.
        </p>
      </div>
    </main>
  );
}
